(function() {
  const countEl = document.getElementById('count');
  const toggleBtn = document.getElementById('toggleBtn');
  const resetBtn = document.getElementById('resetBtn');
  const clickToggle = document.getElementById('clickToggle');
  const audioToggle = document.getElementById('audioToggle');
  const micFill = document.getElementById('micFill');
  const micLbl = document.getElementById('micLbl');
  const statusEl = document.getElementById('status');

  let count = 0;
  let intervalId = null;
  let clickEnabled = false;

  function render() {
    countEl.textContent = count;
    countEl.classList.add('pop');
    setTimeout(() => countEl.classList.remove('pop'), 180);
  }

  function startCounter() {
    if (intervalId) return;
    intervalId = setInterval(() => { count++; render(); }, 1000);
    statusEl.textContent = 'Status: running';
    updateToggleButton();
  }

  function stopCounter() {
    if (!intervalId) return;
    clearInterval(intervalId); intervalId = null;
    statusEl.textContent = 'Status: stopped';
    updateToggleButton();
  }

  function updateToggleButton() {
    if (!toggleBtn) return;
    toggleBtn.textContent = intervalId ? 'Stop' : 'Start';
    toggleBtn.classList.toggle('secondary', !!intervalId);
  }

  toggleBtn.addEventListener('click', () => {
    if (intervalId) stopCounter(); else startCounter();
  });
  resetBtn.addEventListener('click', () => { count = 0; render(); });

  clickToggle.addEventListener('click', () => {
    clickEnabled = !clickEnabled;
    clickToggle.textContent = clickEnabled ? 'Disable Click +1' : 'Enable Click +1';
    countEl.style.cursor = clickEnabled ? 'pointer' : 'default';
  });

  countEl.addEventListener('click', () => { if (clickEnabled) { count++; render(); } });
  // --- MIC: create a controller that detects spikes (RMS) and calls onSpike(level)
  function createMicCounter(onSpike) {
    let audioStream = null;
    let audioCtx = null;
    let analyser = null;
    let raf = null;
    let lastSpike = 0;

    function rmsFromTimeDomain(data) {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      return Math.sqrt(sum / data.length);
    }

    async function enable() {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(audioStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);

        const buffer = new Uint8Array(analyser.fftSize);
        const threshold = 0.10; // adjust sensitivity
        const cooldownMs = 300;

        function loop() {
          analyser.getByteTimeDomainData(buffer);
          const level = rmsFromTimeDomain(buffer);
          const pct = Math.min(1, level * 8);
          if (micFill) micFill.style.width = `${Math.round(pct * 100)}%`;
          if (micLbl) micLbl.textContent = `mic: ${Math.round(pct*100)}%`;

          const now = performance.now();
          if (level > threshold && now - lastSpike > cooldownMs) {
            lastSpike = now;
            onSpike(level);
          }
          raf = requestAnimationFrame(loop);
        }
        loop();
        return true;
      } catch (err) {
        console.warn('Mic enable failed', err);
        return false;
      }
    }

    function disable() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      if (analyser) { try { analyser.disconnect(); } catch(e){} analyser = null; }
      if (audioCtx) { try { audioCtx.close(); } catch(e){} audioCtx = null; }
      if (audioStream) { audioStream.getTracks().forEach(t => t.stop()); audioStream = null; }
      if (micFill) micFill.style.width = '0%';
      if (micLbl) micLbl.textContent = 'mic: off';
    }

    return { enable, disable };
  }

  const micCtrl = createMicCounter((level) => {
    count += 1;
    render();
  });

  let audioEnabled = false;
  audioToggle.addEventListener('click', async () => {
    if (!audioEnabled) {
      const ok = await micCtrl.enable();
      if (ok) {
        audioEnabled = true;
        audioToggle.textContent = 'Disable Mic';
        statusEl.textContent = intervalId ? 'Status: running (mic)' : 'Status: mic enabled';
      } else {
        audioEnabled = false;
        audioToggle.textContent = 'Enable Mic';
        statusEl.textContent = 'Status: mic error or permission denied';
      }
    } else {
      micCtrl.disable();
      audioEnabled = false;
      audioToggle.textContent = 'Enable Mic';
      statusEl.textContent = intervalId ? 'Status: running' : 'Status: stopped';
    }
  });
  render();
})();
