function updateBadge(isActive) {
  if (isActive) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#7C3AED' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.focusActive) {
    updateBadge(changes.focusActive.newValue);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['focusActive'], (data) => {
    updateBadge(data.focusActive || false);
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['focusActive'], (data) => {
    updateBadge(data.focusActive || false);
  });
});

const TIMER_ALARM_NAME = 'clearfocus-timer-end';

function startTimerAlarm(durationMs) {
  const delayMinutes = durationMs / 60000;
  chrome.alarms.create(TIMER_ALARM_NAME, { delayInMinutes: delayMinutes });
}

function clearTimerAlarm() {
  chrome.alarms.clear(TIMER_ALARM_NAME);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TIMER_ALARM_NAME) {
    chrome.storage.local.set({
      focusActive: false,
      timerRunning: false,
      timerEndTime: null
    });

    updateBadge(false);

    chrome.tabs.query({
      url: ['*://*.youtube.com/*', '*://*.reddit.com/*', '*://*.twitter.com/*', '*://x.com/*']
    }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'FOCUS_OFF' }).catch(() => {
          // Tab may be unresponsive
        });
      }
    });

    chrome.notifications.create('clearfocus-timer-done', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🧠 ClearFocus — Session Complete!',
      message: 'Great work! Your focus session has ended. Take a break!',
      priority: 2
    });
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'guardian-request') {
    chrome.tabs.create({ url: chrome.runtime.getURL('guardian/guardian.html') });
    chrome.notifications.clear(notificationId);
  }
});

async function callGeminiAPI(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

async function expandIntentViaGemini(apiKey, intents) {
  const prompt = `Generate 15-25 keywords related to: "${intents}". Return ONLY lowercase JSON array.`;
  return await callGeminiAPI(apiKey, prompt);
}

// ── Analytics Functions ──
async function logSessionStart(intents, duration) {
  const today = new Date().toISOString().split('T')[0];
  const sessionData = {
    date: today,
    startTime: Date.now(),
    endTime: null,
    duration: duration,
    intents: Array.isArray(intents) ? intents : [intents],
    itemsFiltered: 0,
    distractionsBlocked: 0,
    status: 'active'
  };
  
  const analytics = await new Promise(resolve => {
    chrome.storage.local.get('analytics', (data) => {
      const existing = data.analytics || {};
      if (!existing[today]) existing[today] = [];
      existing[today].push(sessionData);
      chrome.storage.local.set({ analytics: existing }, () => resolve(existing));
    });
  });
  
  return sessionData;
}

async function endSession() {
  const today = new Date().toISOString().split('T')[0];
  const analytics = await new Promise(resolve => {
    chrome.storage.local.get('analytics', (data) => {
      const existing = data.analytics || {};
      if (existing[today] && existing[today].length > 0) {
        const lastSession = existing[today][existing[today].length - 1];
        lastSession.endTime = Date.now();
        lastSession.status = 'completed';
        lastSession.actualDuration = lastSession.endTime - lastSession.startTime;
      }
      chrome.storage.local.set({ analytics: existing }, () => resolve(existing));
    });
  });
  return analytics;
}

async function trackFilteredItems(count) {
  const today = new Date().toISOString().split('T')[0];
  chrome.storage.local.get('analytics', (data) => {
    const existing = data.analytics || {};
    if (existing[today] && existing[today].length > 0) {
      const lastSession = existing[today][existing[today].length - 1];
      lastSession.itemsFiltered = (lastSession.itemsFiltered || 0) + count;
    }
    chrome.storage.local.set({ analytics: existing });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'background') {
    switch (message.type) {
      case 'UPDATE_BADGE':
        updateBadge(message.isActive);
        sendResponse({ status: 'ok' });
        break;

      case 'API_SCORE_BATCH':
        callGeminiAPI(message.apiKey, message.prompt).then(results => {
          sendResponse({ status: 'ok', results });
        });
        return true;

      case 'EXPAND_INTENT':
        expandIntentViaGemini(message.apiKey, message.intents).then(keywords => {
          sendResponse({ status: 'ok', keywords: keywords || [] });
        });
        return true;

      case 'START_TIMER':
        startTimerAlarm(message.durationMs);
        sendResponse({ status: 'ok' });
        break;

      case 'STOP_TIMER':
        clearTimerAlarm();
        sendResponse({ status: 'ok' });
        break;

      case 'START_DEACTIVATION_REQUEST':
        chrome.notifications.create('guardian-request', {
          type: 'basic',
          iconUrl: '../icons/icon128.png',
          title: '🧠 ClearFocus Guardian Request',
          message: 'The user is requesting to end their focus session. Click to approve/reject.',
          priority: 2,
          requireInteraction: true
        });
        sendResponse({ status: 'ok' });
        break;

      case 'LOG_SESSION_START':
        logSessionStart(message.intents, message.duration).then(session => {
          sendResponse({ status: 'ok', session });
        });
        return true;

      case 'LOG_SESSION_END':
        endSession().then(analytics => {
          sendResponse({ status: 'ok', analytics });
        });
        return true;

      case 'TRACK_FILTERED_ITEMS':
        trackFilteredItems(message.count);
        sendResponse({ status: 'ok' });
        break;

      default:
        sendResponse({ status: 'unknown' });
    }
  }
  return true;
});
