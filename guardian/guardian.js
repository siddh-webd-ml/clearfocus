(() => {
  'use strict';

  const elements = {
    passwordOverlay: document.getElementById('passwordOverlay'),
    guardianPass: document.getElementById('guardianPass'),
    loginBtn: document.getElementById('loginBtn'),
    errorMsg: document.getElementById('errorMsg'),
    noRequests: document.getElementById('noRequests'),
    requestList: document.getElementById('requestList'),
    requestCount: document.getElementById('requestCount'),
    currentFocusState: document.getElementById('currentFocusState'),
    currentGoal: document.getElementById('currentGoal'),
    forceStopBtn: document.getElementById('forceStopBtn'),
    resetConfigBtn: document.getElementById('resetConfigBtn'),
  };

  let guardianPassword = '';

  async function init() {
    const data = await chrome.storage.local.get(['guardianPassword', 'focusActive', 'userIntent', 'pendingDeactivationRequest']);
    guardianPassword = data.guardianPassword || '';
    
    // If no password set, we allow entry (or we could force setup)
    if (!guardianPassword) {
      elements.passwordOverlay.classList.add('hidden');
    }

    updateDashboard(data);
    
    chrome.storage.onChanged.addListener((changes) => {
      const updatedData = {};
      for (const [key, { newValue }] of Object.entries(changes)) {
        updatedData[key] = newValue;
      }
      updateDashboard(updatedData);
    });
  }

  function updateDashboard(data) {
    if (data.hasOwnProperty('focusActive')) {
      elements.currentFocusState.textContent = data.focusActive ? 'Active' : 'Inactive';
      elements.currentFocusState.style.color = data.focusActive ? 'var(--success)' : 'var(--text-secondary)';
    }

    if (data.hasOwnProperty('userIntent')) {
      elements.currentGoal.textContent = data.userIntent || 'No goal set';
    }

    if (data.hasOwnProperty('pendingDeactivationRequest')) {
      renderRequests(data.pendingDeactivationRequest);
    }
  }

  function renderRequests(isPending) {
    if (isPending) {
      elements.noRequests.classList.add('hidden');
      elements.requestList.classList.remove('hidden');
      elements.requestCount.textContent = '1';
      
      elements.requestList.innerHTML = `
        <div class="request-item">
          <div class="request-info">
            <h4>End Focus Session</h4>
            <p>User is requesting to turn off focus mode.</p>
          </div>
          <div class="request-actions">
            <button class="btn btn-secondary" id="rejectBtn">Reject</button>
            <button class="btn btn-primary" id="approveBtn">Approve</button>
          </div>
        </div>
      `;

      document.getElementById('approveBtn').onclick = () => handleAction('approved');
      document.getElementById('rejectBtn').onclick = () => handleAction('rejected');
    } else {
      elements.noRequests.classList.remove('hidden');
      elements.requestList.classList.add('hidden');
      elements.requestCount.textContent = '0';
    }
  }

  async function handleAction(status) {
    await chrome.storage.local.set({ 
      guardianApprovalStatus: status,
      pendingDeactivationRequest: false 
    });
    
    if (status === 'approved') {
      await chrome.storage.local.set({ focusActive: false });
    }
  }

  elements.loginBtn.onclick = () => {
    const pass = elements.guardianPass.value;
    if (pass === guardianPassword) {
      elements.passwordOverlay.classList.add('hidden');
    } else {
      elements.errorMsg.classList.remove('hidden');
      setTimeout(() => elements.errorMsg.classList.add('hidden'), 2000);
    }
  };

  elements.forceStopBtn.onclick = () => handleAction('approved');

  elements.resetConfigBtn.onclick = async () => {
    if (confirm('Are you sure you want to reset all Guardian settings? This will disable Parental Controls.')) {
      await chrome.storage.local.set({
        guardianModeActive: false,
        guardianPassword: '',
        pendingDeactivationRequest: false,
        guardianApprovalStatus: 'none'
      });
      location.reload();
    }
  };

  init();
})();
