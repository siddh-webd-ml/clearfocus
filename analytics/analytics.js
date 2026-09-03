(() => {
  'use strict';

  const backBtn = document.getElementById('backBtn');
  const exportBtn = document.getElementById('exportBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const deleteWeekBtn = document.getElementById('deleteWeekBtn');

  backBtn.addEventListener('click', () => {
    window.close();
  });

  // ── Load Analytics Data ──
  async function loadAnalytics() {
    return new Promise(resolve => {
      chrome.storage.local.get('analytics', (data) => {
        resolve(data.analytics || {});
      });
    });
  }

  // ── Calculate Stats ──
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  function getSevenDaysAgo() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  }

  function formatTime(ms) {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function calculateTodayStats(analytics) {
    const today = getToday();
    const sessions = analytics[today] || [];
    
    let totalTime = 0;
    let totalFiltered = 0;
    
    sessions.forEach(session => {
      if (session.actualDuration) totalTime += session.actualDuration;
      totalFiltered += session.itemsFiltered || 0;
    });

    return {
      focusTime: formatTime(totalTime),
      sessionCount: sessions.length,
      itemsFiltered: totalFiltered
    };
  }

  function calculateWeeklyStats(analytics) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);

    let totalTime = 0;
    let daysActive = new Set();

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const sessions = analytics[dateStr] || [];
      
      if (sessions.length > 0) {
        daysActive.add(dateStr);
        sessions.forEach(session => {
          if (session.actualDuration) totalTime += session.actualDuration;
        });
      }
    }

    const avgPerDay = daysActive.size > 0 ? formatTime(totalTime / daysActive.size) : '0m';

    return {
      totalTime: formatTime(totalTime),
      avgPerDay,
      daysActive: daysActive.size,
      dailyData: getDailyChartData(analytics)
    };
  }

  function getDailyChartData(analytics) {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const sessions = analytics[dateStr] || [];
      
      let dayTime = 0;
      sessions.forEach(session => {
        if (session.actualDuration) dayTime += session.actualDuration;
      });

      data.push({
        date: dateStr,
        time: dayTime / 1000 / 60, // Convert to minutes
        label: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return data;
  }

  function drawChart(data) {
    const canvas = document.getElementById('weekChart');
    const ctx = canvas.getContext('2d');
    const chartHeight = canvas.height;
    const chartWidth = canvas.width;
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, chartWidth, chartHeight);

    // Find max value for scaling
    const maxTime = Math.max(...data.map(d => d.time)) || 60;
    const scale = (chartHeight - padding * 2) / maxTime;

    // Draw grid
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight - padding * 2) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth - padding, y);
      ctx.stroke();
    }

    // Draw bars
    const barWidth = (chartWidth - padding * 2) / data.length;
    const barPadding = 4;

    data.forEach((d, i) => {
      const x = padding + i * barWidth + barPadding;
      const barHeight = d.time * scale;
      const y = chartHeight - padding - barHeight;

      // Bar
      const gradient = ctx.createLinearGradient(0, y, 0, chartHeight - padding);
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(1, '#3B82F6');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - barPadding * 2, barHeight);

      // Label
      ctx.fillStyle = '#8B8FA3';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + (barWidth - barPadding * 2) / 2, chartHeight - 12);
    });
  }

  function getSessionHistory(analytics) {
    const sevenDaysAgo = getSevenDaysAgo();
    const sessions = [];

    for (const [date, daySessions] of Object.entries(analytics)) {
      if (date >= sevenDaysAgo) {
        daySessions.forEach(session => {
          sessions.push({ date, ...session });
        });
      }
    }

    return sessions.sort((a, b) => b.startTime - a.startTime);
  }

  function renderSessionHistory(sessions) {
    const list = document.getElementById('sessionsList');
    
    if (sessions.length === 0) {
      list.innerHTML = '<p class="empty-state">No sessions recorded yet. Start focusing!</p>';
      return;
    }

    list.innerHTML = sessions.map(session => {
      const duration = session.actualDuration ? formatTime(session.actualDuration) : '—';
      const intentText = Array.isArray(session.intents) ? session.intents.join(', ') : session.intents;
      const startHour = new Date(session.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="session-item">
          <div class="session-date">${session.date} at ${startHour}</div>
          <div class="session-info">
            <span class="session-intent">📌 ${intentText}</span>
            <span class="session-duration">⏱ ${duration}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function exportAsCSV(analytics) {
    let csv = 'Date,Time,Intent,Duration (minutes),Items Filtered\n';
    
    for (const [date, daySessions] of Object.entries(analytics)) {
      daySessions.forEach(session => {
        const duration = session.actualDuration ? Math.round(session.actualDuration / 1000 / 60) : '—';
        const intent = Array.isArray(session.intents) ? session.intents.join(';') : session.intents;
        const startTime = new Date(session.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        csv += `${date},${startTime},"${intent}",${duration},${session.itemsFiltered || 0}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearfocus-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportBtn.addEventListener('click', async () => {
    const analytics = await loadAnalytics();
    exportAsCSV(analytics);
  });

  clearDataBtn.addEventListener('click', () => {
    if (confirm('⚠️ Clear ALL analytics data? This cannot be undone.')) {
      chrome.storage.local.set({ analytics: {} }, () => {
        location.reload();
      });
    }
  });

  deleteWeekBtn.addEventListener('click', () => {
    if (confirm('Delete analytics older than 7 days?')) {
      loadAnalytics().then(analytics => {
        const sevenDaysAgo = getSevenDaysAgo();
        const filtered = {};
        
        for (const [date, sessions] of Object.entries(analytics)) {
          if (date >= sevenDaysAgo) {
            filtered[date] = sessions;
          }
        }

        chrome.storage.local.set({ analytics: filtered }, () => {
          location.reload();
        });
      });
    }
  });

  // ── Initialize Dashboard ──
  async function init() {
    const analytics = await loadAnalytics();

    // Today's stats
    const todayStats = calculateTodayStats(analytics);
    document.getElementById('todayFocusTime').textContent = todayStats.focusTime;
    document.getElementById('todaySessionCount').textContent = todayStats.sessionCount;
    document.getElementById('todayFiltered').textContent = todayStats.itemsFiltered;

    // Weekly stats
    const weeklyStats = calculateWeeklyStats(analytics);
    document.getElementById('weekFocusTime').textContent = weeklyStats.totalTime;
    document.getElementById('weekAvgPerDay').textContent = weeklyStats.avgPerDay;
    document.getElementById('weekDaysActive').textContent = weeklyStats.daysActive;

    // Draw chart
    drawChart(weeklyStats.dailyData);

    // Session history
    const sessions = getSessionHistory(analytics);
    renderSessionHistory(sessions);
  }

  init();
})();
