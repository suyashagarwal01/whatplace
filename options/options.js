(function () {
  'use strict';

  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('save');
  const saveStatus = document.getElementById('saveStatus');

  chrome.storage.sync.get('apiKey', function (data) {
    if (data.apiKey) apiKeyInput.value = data.apiKey;
  });

  saveBtn.addEventListener('click', function () {
    const key = apiKeyInput.value.trim();
    chrome.storage.sync.set({ apiKey: key }, function () {
      saveStatus.textContent = 'Saved.';
      saveStatus.classList.remove('error');
      setTimeout(function () {
        saveStatus.textContent = '';
      }, 2000);
    });
  });
})();
