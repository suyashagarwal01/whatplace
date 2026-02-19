(function () {
  'use strict';

  const findBtn = document.getElementById('findLocation');
  const statusEl = document.getElementById('status');
  const resultEl = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const openInMapsLink = document.getElementById('openInMaps');
  const optionsLink = document.getElementById('optionsLink');

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + (type || '');
    statusEl.hidden = false;
    resultEl.hidden = true;
  }

  function showResult(text) {
    statusEl.hidden = true;
    resultText.textContent = text;
    openInMapsLink.href =
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(text);
    resultEl.hidden = false;
  }

  let cooldownInterval = null;

  const btnLabelWithIcon = '<span class="btn-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="currentColor"/></svg></span> Find Location';

  function setLoading(loading) {
    findBtn.disabled = loading;
    findBtn.innerHTML = loading ? 'Analyzing…' : btnLabelWithIcon;
  }

  function startCooldown() {
    if (cooldownInterval) clearInterval(cooldownInterval);
    const secs = 60;
    findBtn.disabled = true;
    findBtn.classList.add('is-cooldown');
    let left = secs;
    function tick() {
      left--;
      findBtn.innerHTML = left > 0 ? 'Try again in ' + left + 's' : btnLabelWithIcon;
      if (left <= 0) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
        findBtn.disabled = false;
        findBtn.classList.remove('is-cooldown');
      }
    }
    tick();
    cooldownInterval = setInterval(tick, 1000);
  }

  optionsLink.href = chrome.runtime.getURL('options/options.html');
  optionsLink.target = '_blank';

  async function identifyLocation(imageBase64) {
    const { apiKey } = await chrome.storage.sync.get('apiKey');
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key not set. Open Settings and add your free Gemini API key.');
    }

    const key = apiKey.trim();
    const prompt = `Look at this image. It may be a photo, a frame from a video (e.g. YouTube, Vimeo), or a screenshot of a webpage.

Identify the real-world location shown in the image. Be as specific as possible: city, country, and if recognizable the exact place (landmark, street, region). If it's a famous place, name it.

If the image does not show a real location (e.g. it's a drawing, UI, or no identifiable place), say "No identifiable location in this image."

Reply with only the location description, no preamble or extra text.`;

    const body = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.2
      }
    };

    // Try multiple model/version combos; Google AI Studio availability varies by account/region
    const tries = [
      { version: 'v1beta', model: 'gemini-2.5-flash' },
      { version: 'v1beta', model: 'gemini-2.0-flash' },
      { version: 'v1beta', model: 'gemini-1.5-flash' },
      { version: 'v1beta', model: 'gemini-1.5-pro' },
      { version: 'v1', model: 'gemini-1.5-flash' },
      { version: 'v1', model: 'gemini-1.5-pro' }
    ];

    let lastError = null;
    for (const { version, model } of tries) {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === 'string') return text.trim();
      }

      const errText = await res.text();
      if (res.status === 403) throw new Error('Invalid API key or access denied.');
      if (res.status === 429) throw new Error('RATE_LIMIT');
      if (res.status === 404) {
        lastError = errText;
        continue;
      }
      throw new Error(errText || 'API request failed');
    }

    throw new Error('No supported Gemini model found. Check your API key at aistudio.google.com. Last error: ' + (lastError || '404'));
  }

  findBtn.addEventListener('click', async function () {
    if (findBtn.disabled) return;

    setLoading(true);
    showStatus('Capturing this page…', 'loading');

    try {
      const tab = await chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0]);
      if (!tab?.id) {
        showStatus('Could not access the current tab.', 'error');
        setLoading(false);
        startCooldown();
        return;
      }

      showStatus('Taking screenshot…', 'loading');
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 90 });
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');

      showStatus('Identifying location…', 'loading');
      const location = await identifyLocation(base64);
      showResult(location);
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg.includes('API key') || msg.includes('Invalid API key') || msg.includes('403')) {
        showStatus('Please set your API key in Settings.', 'error');
      } else if (msg === 'RATE_LIMIT' || msg.includes('429') || msg.includes('quota')) {
        showStatus('Rate limit: free tier allows ~15 requests/min. Wait for the timer.', 'error');
      } else {
        showStatus('Error: ' + msg, 'error');
      }
    } finally {
      setLoading(false);
      startCooldown();
    }
  });
})();
