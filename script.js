/**
 * ==========================================================================
 * Force & Friction Lab (ಬಲ ಮತ್ತು ಘರ್ಷಣೆ) - Interactive Simulation Logic
 * 8th Grade Science Experiment Game
 * ==========================================================================
 */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
   * 1. Configuration & Hidden Surface Friction Values
   * ------------------------------------------------------------------------ */
  const SURFACES = {
    paper: {
      key: 'paper',
      name: 'Paper',
      kn: 'ಕಾಗದ',
      icon: '📄',
      friction: 15, // Low friction
      cssClass: 'surface-paper',
      decelFactor: 0.9,
    },
    cloth: {
      key: 'cloth',
      name: 'Cloth',
      kn: 'ಬಟ್ಟೆ',
      icon: '🧵',
      friction: 35, // Medium friction
      cssClass: 'surface-cloth',
      decelFactor: 1.05,
    },
    sandpaper: {
      key: 'sandpaper',
      name: 'Sandpaper',
      kn: 'ಮರಳು ಕಾಗದ',
      icon: '🧱',
      friction: 60, // High friction
      cssClass: 'surface-sandpaper',
      decelFactor: 1.3,
    },
    carpet: {
      key: 'carpet',
      name: 'Carpet',
      kn: 'ಕಾರ್ಪೆಟ್',
      icon: '🟫',
      friction: 80, // Very high friction
      cssClass: 'surface-carpet',
      decelFactor: 1.5,
    },
  };

  // Track coordinate alignment (percentages of .track-ground width)
  const START_PCT = 19; // 0 cm start line
  const END_PCT = 94;   // 100 cm end line
  const RUNWAY_PCT = END_PCT - START_PCT; // 75% spans 0–100 cm
  const MAX_PULL_SHIFT_PCT = 7.2; // Max backward visual pull inside pull zone
  const HANDLE_OFFSET_PCT = 4.6;  // Handle rests neatly behind car center
  const QUIZ_UNLOCK_PULLS = 5;

  // Bilingual 8th-Grade Mini-Quiz Questions
  const QUIZ_QUESTIONS = [
    {
      questionEn: 'Which surface had the LEAST friction?',
      questionKn: 'ಯಾವ ಮೇಲ್ಮೈ ಅತಿ ಕಡಿಮೆ ಘರ್ಷಣೆಯನ್ನು (Friction) ಹೊಂದಿತ್ತು?',
      options: [
        { label: '📄 Paper (ಕಾಗದ)', value: 'paper' },
        { label: '🧵 Cloth (ಬಟ್ಟೆ)', value: 'cloth' },
        { label: '🧱 Sandpaper (ಮರಳು ಕಾಗದ)', value: 'sandpaper' },
        { label: '🟫 Carpet (ಕಾರ್ಪೆಟ್)', value: 'carpet' },
      ],
      answer: 'paper',
      explainEn: 'Correct! Paper is smooth (friction = 15), so the car rolled the farthest!',
      explainKn: 'ಸರಿ! ಕಾಗದವು ನಯವಾಗಿದ್ದು ಕಡಿಮೆ ಘರ್ಷಣೆ (15) ಹೊಂದಿದೆ.',
    },
    {
      questionEn: 'Which surface had the MOST friction and stopped the car quickest?',
      questionKn: 'ಯಾವ ಮೇಲ್ಮೈ ಅತಿ ಹೆಚ್ಚು ಘರ್ಷಣೆಯನ್ನು ಹೊಂದಿದ್ದು ಕಾರನ್ನು ಬೇಗ ನಿಲ್ಲಿಸಿತು?',
      options: [
        { label: '📄 Paper (ಕಾಗದ)', value: 'paper' },
        { label: '🧵 Cloth (ಬಟ್ಟೆ)', value: 'cloth' },
        { label: '🧱 Sandpaper (ಮರಳು ಕಾಗದ)', value: 'sandpaper' },
        { label: '🟫 Carpet (ಕಾರ್ಪೆಟ್)', value: 'carpet' },
      ],
      answer: 'carpet',
      explainEn: 'Spot on! Carpet is thick and rough (friction = 80), creating very high friction!',
      explainKn: 'ಅದ್ಭುತ! ಕಾರ್ಪೆಟ್ ಅತಿ ಹೆಚ್ಚು ಘರ್ಷಣೆಯನ್ನು (80) ಹೊಂದಿದೆ.',
    },
    {
      questionEn: 'What happens if your applied Force is LESS than the surface Friction?',
      questionKn: 'ನೀವು ಪ್ರಯೋಗಿಸಿದ ಬಲವು ಘರ್ಷಣೆಗಿಂತ ಕಡಿಮೆಯಿದ್ದಾಗ ಏನಾಗುತ್ತದೆ?',
      options: [
        { label: '🚀 Car zooms to 100 cm', value: 'zoom' },
        { label: '🛑 Car barely moves', value: 'barely' },
        { label: '✨ Friction becomes zero', value: 'zero' },
        { label: '🎈 Car floats upward', value: 'float' },
      ],
      answer: 'barely',
      explainEn: 'Yes! Friction opposes motion. If Force ≤ Friction, the car barely moves!',
      explainKn: 'ಹೌದು! ಬಲಕ್ಕಿಂತ ಘರ್ಷಣೆ ಹೆಚ್ಚಿದ್ದರೆ ಕಾರು ಚಲಿಸಲು ಕಷ್ಟವಾಗುತ್ತದೆ.',
    },
  ];

  /* ------------------------------------------------------------------------
   * 2. Application State
   * ------------------------------------------------------------------------ */
  const state = {
    surfaceKey: 'paper',
    force: 0,
    phase: 'ready', // 'ready' | 'pulling' | 'moving' | 'stopped'
    soundEnabled: true,
    pullCount: 0,
    quizShownAuto: false,
    testedSurfaces: new Set(),
    logs: [],
    bestDistance: 0,
    animFrameId: null,
    holdFrameId: null,
    quizTimerId: null,
    quizIndex: 0,
    quizScore: 0,
    quizLocked: false,
    quizHistory: [],
  };

  /* ------------------------------------------------------------------------
   * 3. DOM References
   * ------------------------------------------------------------------------ */
  const el = {
    pullCountText: document.getElementById('pullCountText'),
    pullProgressFill: document.getElementById('pullProgressFill'),
    openQuizBtn: document.getElementById('openQuizBtn'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIcon: document.getElementById('soundIcon'),

    hudSurfaceName: document.getElementById('hudSurfaceName'),
    hudDistanceValue: document.getElementById('hudDistanceValue'),
    stageHintBanner: document.getElementById('stageHintBanner'),

    trackGround: document.getElementById('trackGround'),
    trackRuler: document.getElementById('trackRuler'),
    carTrail: document.getElementById('carTrail'),
    bestMarker: document.getElementById('bestMarker'),
    bestMarkerLabel: document.getElementById('bestMarkerLabel'),
    stopFlag: document.getElementById('stopFlag'),
    stopFlagText: document.getElementById('stopFlagText'),
    particlesLayer: document.getElementById('particlesLayer'),

    bandTop: document.getElementById('bandTop'),
    bandBottom: document.getElementById('bandBottom'),
    bandCenter: document.getElementById('bandCenter'),
    pullHandle: document.getElementById('pullHandle'),
    handleForceTag: document.getElementById('handleForceTag'),
    toyCar: document.getElementById('toyCar'),
    carBodyWrap: document.getElementById('carBodyWrap'),

    resultPopup: document.getElementById('resultPopup'),
    resultPopupCard: document.querySelector('.result-popup-card'),
    resultIcon: document.getElementById('resultIcon'),
    resultMainMsg: document.getElementById('resultMainMsg'),
    resultKnMsg: document.getElementById('resultKnMsg'),
    closeResultBtn: document.getElementById('closeResultBtn'),

    surfaceBtns: document.querySelectorAll('.surface-btn'),
    frictionHintBadge: document.getElementById('frictionHintBadge'),
    forceValueText: document.getElementById('forceValueText'),
    forceStrengthTag: document.getElementById('forceStrengthTag'),
    forceMeterFill: document.getElementById('forceMeterFill'),
    forceSlider: document.getElementById('forceSlider'),
    holdPullBtn: document.getElementById('holdPullBtn'),
    launchBtn: document.getElementById('launchBtn'),
    resetBtn: document.getElementById('resetBtn'),

    dataTableBody: document.getElementById('dataTableBody'),
    clearLogBtn: document.getElementById('clearLogBtn'),

    quizModal: document.getElementById('quizModal'),
    confettiLayer: document.getElementById('confettiLayer'),
    quizBody: document.getElementById('quizBody'),
    quizSummary: document.getElementById('quizSummary'),
    quizDots: document.getElementById('quizDots'),
    quizQuestionEn: document.getElementById('quizQuestionEn'),
    quizQuestionKn: document.getElementById('quizQuestionKn'),
    quizOptions: document.getElementById('quizOptions'),
    quizFeedback: document.getElementById('quizFeedback'),
    summaryHeadline: document.getElementById('summaryHeadline'),
    summaryScoreText: document.getElementById('summaryScoreText'),
    quizNextBtn: document.getElementById('quizNextBtn'),
    quizCloseBtn: document.getElementById('quizCloseBtn'),
  };

  /* ------------------------------------------------------------------------
   * 4. Lightweight Web Audio Synthesizer (Zero External Sound Files)
   * ------------------------------------------------------------------------ */
  const SoundFX = {
    ctx: null,
    lastTickForce: -1,

    getContext() {
      if (!state.soundEnabled) return null;
      try {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        return this.ctx;
      } catch {
        return null;
      }
    },

    playTone(freq, duration, type = 'sine', gainVal = 0.08, delay = 0) {
      const ctx = this.getContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + delay;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(gainVal, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duration + 0.02);
      } catch {
        // Ignore audio playback errors
      }
    },

    playStretchTick(force) {
      const bucket = Math.floor(force / 8);
      if (bucket !== this.lastTickForce && force > 0) {
        this.lastTickForce = bucket;
        this.playTone(220 + force * 3.5, 0.045, 'triangle', 0.045);
      }
    },

    playLaunch() {
      const ctx = this.getContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.28);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.32);
      } catch {
        // Ignore audio errors
      }
    },

    playStop(barelyMoved) {
      if (barelyMoved) {
        this.playTone(150, 0.14, 'square', 0.06, 0);
        this.playTone(115, 0.18, 'square', 0.06, 0.12);
      } else {
        this.playTone(523.25, 0.12, 'sine', 0.07, 0);
        this.playTone(659.25, 0.18, 'sine', 0.08, 0.09);
      }
    },

    playQuizWin() {
      [523.25, 659.25, 783.99, 1046.5].forEach((note, idx) => {
        this.playTone(note, 0.22, 'triangle', 0.09, idx * 0.09);
      });
    },
  };

  /* ------------------------------------------------------------------------
   * 5. Initialization & Ruler Setup
   * ------------------------------------------------------------------------ */
  function buildTrackRuler() {
    el.trackRuler.innerHTML = '';
    for (let cm = 0; cm <= 100; cm += 5) {
      const pct = cmToTrackPct(cm);
      const isMajor = cm % 10 === 0;
      const tick = document.createElement('div');
      tick.className = `ruler-tick ${isMajor ? 'major' : 'minor'}`;
      tick.style.left = `${pct}%`;

      const mark = document.createElement('span');
      mark.className = 'tick-mark';
      tick.appendChild(mark);

      if (isMajor) {
        const label = document.createElement('span');
        label.className = 'tick-label';
        label.textContent = cm === 0 ? '0 cm' : cm === 100 ? '100 cm' : String(cm);
        tick.appendChild(label);
      }

      el.trackRuler.appendChild(tick);
    }
  }

  function cmToTrackPct(cm) {
    return START_PCT + (cm / 100) * RUNWAY_PCT;
  }

  /* ------------------------------------------------------------------------
   * 6. Visual Synchronization (Force Meter, Car, Rubber Band)
   * ------------------------------------------------------------------------ */
  function getForceMeta(force) {
    if (force === 0) return { label: 'Ready (ಸಿದ್ಧ)', color: '#f59e0b', bg: '#e0f2fe', fg: '#0369a1' };
    if (force < 35) return { label: 'Gentle (ಮೃದು)', color: '#22c55e', bg: '#dcfce7', fg: '#166534' };
    if (force < 70) return { label: 'Medium (ಮಧ್ಯಮ)', color: '#f59e0b', bg: '#fef3c7', fg: '#92400e' };
    if (force < 90) return { label: 'Strong (ಬಲವಾದ)', color: '#f97316', bg: '#ffedd5', fg: '#9a3412' };
    return { label: 'MAX POWER! (ಪೂರ್ಣ ಬಲ!)', color: '#ef4444', bg: '#fee2e2', fg: '#991b1b' };
  }

  /**
   * Updates Force UI, rubber band geometry, and car pull-back position
   */
  function setForce(rawForce) {
    const force = Math.max(0, Math.min(100, Math.round(rawForce)));
    state.force = force;

    const meta = getForceMeta(force);

    // Update Meter & Slider
    el.forceSlider.value = String(force);
    el.forceValueText.textContent = String(force);
    el.forceMeterFill.style.width = `${force}%`;
    el.forceStrengthTag.textContent = meta.label;
    el.forceStrengthTag.style.background = meta.bg;
    el.forceStrengthTag.style.color = meta.fg;
    el.launchBtn.disabled = force === 0 || state.phase === 'moving';

    // Handle badge
    el.handleForceTag.textContent = `${force} Force`;
    el.pullHandle.classList.toggle('has-force', force > 0);
    el.toyCar.classList.toggle('charging', force > 0);
    el.toyCar.classList.toggle('shaking', force >= 40 && state.phase !== 'moving');

    // Compute pull-back position on track
    const shiftPct = (force / 100) * MAX_PULL_SHIFT_PCT;
    const carPct = START_PCT - shiftPct;
    const handlePct = carPct - HANDLE_OFFSET_PCT;

    el.toyCar.style.left = `${carPct}%`;
    el.pullHandle.style.left = `${handlePct}%`;

    // Update SVG Rubber Band (viewBox 1000 x 180)
    const startSvgX = START_PCT * 10;
    const handleSvgX = handlePct * 10;
    const carSvgX = carPct * 10;

    el.bandTop.setAttribute('x1', String(startSvgX));
    el.bandTop.setAttribute('x2', String(handleSvgX));
    el.bandTop.setAttribute('y2', '90');
    el.bandTop.style.stroke = meta.color;

    el.bandBottom.setAttribute('x1', String(startSvgX));
    el.bandBottom.setAttribute('x2', String(handleSvgX));
    el.bandBottom.setAttribute('y2', '90');
    el.bandBottom.style.stroke = meta.color;

    // Band gets taut & slightly thinner under high tension
    const thickness = 7 - (force / 100) * 2.2;
    el.bandTop.style.strokeWidth = `${thickness}`;
    el.bandBottom.style.strokeWidth = `${thickness}`;

    el.bandCenter.style.opacity = '1';
    el.bandCenter.setAttribute('x1', String(handleSvgX));
    el.bandCenter.setAttribute('x2', String(carSvgX));
  }

  function resetRubberBandToAnchor() {
    const startSvgX = START_PCT * 10;
    el.bandTop.setAttribute('x1', String(startSvgX));
    el.bandTop.setAttribute('x2', String(startSvgX));
    el.bandTop.style.stroke = '#f59e0b';
    el.bandTop.style.strokeWidth = '7';

    el.bandBottom.setAttribute('x1', String(startSvgX));
    el.bandBottom.setAttribute('x2', String(startSvgX));
    el.bandBottom.style.stroke = '#f59e0b';
    el.bandBottom.style.strokeWidth = '7';

    el.bandCenter.style.opacity = '0';

    el.pullHandle.classList.add('snapping');
    el.pullHandle.classList.remove('has-force');
    el.pullHandle.style.left = `${START_PCT}%`;
    setTimeout(() => el.pullHandle.classList.remove('snapping'), 250);
  }

  /* ------------------------------------------------------------------------
   * 7. Surface Selection
   * ------------------------------------------------------------------------ */
  function selectSurface(key) {
    if (!SURFACES[key] || state.phase === 'moving') return;

    // If a previous run is sitting on the track, reset car cleanly to start
    if (state.phase === 'stopped') {
      resetStageForNextPull(true);
    }

    state.surfaceKey = key;
    const surf = SURFACES[key];

    // Swap ground texture class
    Object.values(SURFACES).forEach((s) => el.trackGround.classList.remove(s.cssClass));
    el.trackGround.classList.add(surf.cssClass);

    // Update HUD & button active states
    el.hudSurfaceName.textContent = `${surf.icon} ${surf.name} (${surf.kn})`;
    el.surfaceBtns.forEach((btn) => {
      const isMatch = btn.dataset.surface === key;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', String(isMatch));
    });

    SoundFX.playTone(390, 0.06, 'sine', 0.05);
  }

  /* ------------------------------------------------------------------------
   * 8. Direct Pointer Dragging on Rubber Band / Car (Mouse + Tablet Touch)
   * ------------------------------------------------------------------------ */
  function initPointerDragging() {
    let activePointerId = null;
    let dragStartX = 0;
    let baseForce = 0;

    function startDrag(e) {
      if (state.phase === 'moving') return;
      if (e.button !== undefined && e.button !== 0) return; // Primary mouse button or touch

      e.preventDefault();

      // If starting a fresh pull after a stopped run, return car to start line
      if (state.phase === 'stopped') {
        resetStageForNextPull(true);
      }

      activePointerId = e.pointerId;
      dragStartX = e.clientX;
      baseForce = state.force;
      state.phase = 'pulling';

      el.pullHandle.classList.add('dragging');
      el.toyCar.classList.add('dragging');
      el.resultPopup.classList.add('hidden');

      try {
        e.currentTarget.setPointerCapture(activePointerId);
      } catch {
        // Fallback handled via window listeners
      }
    }

    function moveDrag(e) {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      e.preventDefault();

      const trackWidth = el.trackGround.getBoundingClientRect().width || 800;
      const maxPullPx = Math.max(68, Math.min(165, trackWidth * 0.145));
      const pulledLeftPx = dragStartX - e.clientX;
      const nextForce = baseForce + (pulledLeftPx / maxPullPx) * 100;

      setForce(nextForce);
      SoundFX.playStretchTick(state.force);
    }

    function endDrag(e) {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      activePointerId = null;

      el.pullHandle.classList.remove('dragging');
      el.toyCar.classList.remove('dragging');

      if (state.force >= 1) {
        launchCar();
      } else {
        state.phase = 'ready';
        setForce(0);
        el.stageHintBanner.innerHTML =
          '<span class="hint-pulse">👈 Pull left (backward) to stretch the rubber band!</span>';
      }
    }

    [el.pullHandle, el.toyCar].forEach((target) => {
      target.addEventListener('pointerdown', startDrag);
    });
    window.addEventListener('pointermove', moveDrag, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  /* ------------------------------------------------------------------------
   * 9. Hold-to-Pull Button & Force Slider Synchronization
   * ------------------------------------------------------------------------ */
  function initForceControls() {
    // Force Slider (precision adjustment + manual Release button)
    el.forceSlider.addEventListener('input', () => {
      if (state.phase === 'moving') return;
      const val = Number(el.forceSlider.value);
      if (state.phase === 'stopped') {
        resetStageForNextPull(false);
      }
      state.phase = 'pulling';
      setForce(val);
      SoundFX.playStretchTick(val);
    });

    el.launchBtn.addEventListener('click', () => {
      if (state.force >= 1 && state.phase !== 'moving') {
        launchCar();
      }
    });

    // Hold to Pull Button (charges while held, launches on release)
    let isHolding = false;
    let holdLastTs = 0;

    function stopHold(shouldLaunch) {
      if (!isHolding) return;
      isHolding = false;
      cancelAnimationFrame(state.holdFrameId);
      el.holdPullBtn.classList.remove('holding');

      if (shouldLaunch && state.force >= 1) {
        launchCar();
      } else if (!shouldLaunch && state.phase !== 'moving') {
        state.phase = 'ready';
        setForce(0);
      }
    }

    function tickHold(ts) {
      if (!isHolding) return;
      if (!holdLastTs) holdLastTs = ts;
      const dt = (ts - holdLastTs) / 1000;
      holdLastTs = ts;

      // Fill 0 -> 100 in ~1.55 seconds
      const next = Math.min(100, state.force + dt * 65);
      setForce(next);
      SoundFX.playStretchTick(next);
      state.holdFrameId = requestAnimationFrame(tickHold);
    }

    function beginHold(e) {
      if (state.phase === 'moving') return;
      if (e.type === 'pointerdown' && e.button !== undefined && e.button !== 0) return;
      e.preventDefault();

      if (state.phase === 'stopped') {
        resetStageForNextPull(true);
      }

      isHolding = true;
      holdLastTs = 0;
      state.phase = 'pulling';
      el.holdPullBtn.classList.add('holding');
      el.resultPopup.classList.add('hidden');

      try {
        el.holdPullBtn.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failure on keyboard activation
      }

      state.holdFrameId = requestAnimationFrame(tickHold);
    }

    el.holdPullBtn.addEventListener('pointerdown', beginHold);
    window.addEventListener('pointerup', () => stopHold(true));
    window.addEventListener('pointercancel', () => stopHold(false));

    // Keyboard support for Hold to Pull (Space / Enter)
    el.holdPullBtn.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        beginHold(e);
      }
    });
    el.holdPullBtn.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        stopHold(true);
      }
    });

    // Reset / Try Again Button
    el.resetBtn.addEventListener('click', () => {
      resetStageForNextPull(true);
      SoundFX.playTone(440, 0.08, 'sine', 0.05);
    });
  }

  /* ------------------------------------------------------------------------
   * 10. Physics Calculation & Smooth Car Animation
   * ------------------------------------------------------------------------ */
  function calculateDistance(appliedForce, surface) {
    if (appliedForce <= 0) return 0;
    if (appliedForce <= surface.friction) {
      // Force < Friction: car barely moves (tiny 1 cm lurch)
      return 1;
    }
    return appliedForce - surface.friction;
  }

  function spawnDustPuff(trackPct, emoji = '💨') {
    const puff = document.createElement('span');
    puff.className = 'dust-puff';
    puff.textContent = emoji;
    puff.style.left = `${trackPct}%`;
    puff.style.top = `${56 + (Math.random() * 16 - 8)}%`;
    el.particlesLayer.appendChild(puff);
    setTimeout(() => puff.remove(), 660);
  }

  function launchCar() {
    if (state.phase === 'moving') return;

    const appliedForce = state.force;
    const surface = SURFACES[state.surfaceKey];
    const distanceCm = calculateDistance(appliedForce, surface);
    const barelyMoved = appliedForce <= surface.friction;

    state.phase = 'moving';
    el.resultPopup.classList.add('hidden');
    el.stopFlag.classList.add('hidden');
    el.launchBtn.disabled = true;
    el.forceSlider.disabled = true;
    el.toyCar.classList.remove('shaking', 'charging');
    el.toyCar.classList.add('moving');

    // Release rubber band immediately with snap animation
    resetRubberBandToAnchor();
    SoundFX.playLaunch();

    // Car starts from its pulled-back position and accelerates through 0 cm to distanceCm
    const startCarPct = parseFloat(el.toyCar.style.left) || START_PCT;
    const targetPct = cmToTrackPct(distanceCm);

    // Duration scales naturally with distance & surface friction
    const durationMs = barelyMoved
      ? 480
      : Math.max(700, Math.min(1850, (550 + distanceCm * 14) / surface.decelFactor));

    let startTime = null;
    let lastDustTime = 0;

    function step(now) {
      if (startTime === null) startTime = now;
      const elapsed = Math.max(0, now - startTime);
      const t = Math.min(1, elapsed / durationMs);

      // Quartic ease-out: strong initial acceleration from rubber band, smooth deceleration via friction
      const eased = 1 - Math.pow(1 - t, 3.2);
      let currentPct = startCarPct + (targetPct - startCarPct) * eased;

      // Subtle resistance shudder if Force <= Friction
      if (barelyMoved && t < 0.85) {
        currentPct += Math.sin(t * Math.PI * 6) * 0.45;
      }

      el.toyCar.style.left = `${currentPct}%`;

      // Wheelie tilt on launch, leveling as car slows
      const tiltDeg = barelyMoved
        ? Math.sin(t * Math.PI * 4) * 3
        : (1 - t) * -4.5;
      el.carBodyWrap.style.transform = `rotate(${tiltDeg.toFixed(2)}deg)`;

      // Trail starts from 0 cm (START_PCT) once the car crosses 0 cm
      const trailWidthPct = Math.max(0, currentPct - START_PCT);
      el.carTrail.style.width = `${trailWidthPct}%`;

      // Update live centimeter display
      const currentCm = Math.max(0, ((currentPct - START_PCT) / RUNWAY_PCT) * 100);
      el.hudDistanceValue.textContent = `${currentCm.toFixed(1)} cm`;

      // Emit occasional dust / friction particles while moving fast
      if (now - lastDustTime > 95 && t < 0.8) {
        lastDustTime = now;
        const particle =
          surface.key === 'sandpaper' || surface.key === 'carpet'
            ? (Math.random() > 0.45 ? '✨' : '💨')
            : '💨';
        spawnDustPuff(Math.max(START_PCT - 2, currentPct - 2.5), particle);
      }

      if (t < 1) {
        state.animFrameId = requestAnimationFrame(step);
      } else {
        finishRun(appliedForce, surface, distanceCm, barelyMoved);
      }
    }

    state.animFrameId = requestAnimationFrame(step);
  }

  function finishRun(appliedForce, surface, distanceCm, barelyMoved) {
    state.phase = 'stopped';
    state.animFrameId = null;

    el.toyCar.classList.remove('moving');
    el.carBodyWrap.style.transform = 'rotate(0deg)';
    el.toyCar.style.left = `${cmToTrackPct(distanceCm)}%`;
    el.carTrail.style.width = `${Math.max(0, cmToTrackPct(distanceCm) - START_PCT)}%`;
    el.hudDistanceValue.textContent = `${distanceCm} cm`;
    el.forceSlider.disabled = false;

    // Show Stop Flag at final car position
    el.stopFlag.style.left = `${cmToTrackPct(distanceCm)}%`;
    el.stopFlagText.textContent = `🏁 ${distanceCm} cm`;
    el.stopFlag.classList.remove('hidden');

    SoundFX.playStop(barelyMoved);

    // Mark surface tested badge
    state.testedSurfaces.add(surface.key);
    const activeBtn = document.querySelector(`.surface-btn[data-surface="${surface.key}"] .surf-tested`);
    if (activeBtn) activeBtn.classList.remove('hidden');
    el.frictionHintBadge.textContent = `Surfaces Tested: ${state.testedSurfaces.size} / 4 🔍`;

    // Log data into table & highlight best run
    logExperimentRun(surface, appliedForce, distanceCm);

    // Show required result pop-up message
    showResultPopup(appliedForce, surface, distanceCm, barelyMoved);

    // Increment pull counter toward Mini-Quiz
    state.pullCount += 1;
    updateQuizProgress();

    // Update hint text
    el.stageHintBanner.innerHTML =
      '<span>Click <strong>Try Again</strong> or pull the rubber band again!</span>';
  }

  function resetStageForNextPull(clearForce = true) {
    if (state.animFrameId) {
      cancelAnimationFrame(state.animFrameId);
      state.animFrameId = null;
    }
    state.phase = 'ready';
    el.toyCar.classList.remove('moving', 'shaking', 'charging');
    el.carBodyWrap.style.transform = 'rotate(0deg)';
    el.carTrail.style.width = '0%';
    el.stopFlag.classList.add('hidden');
    el.resultPopup.classList.add('hidden');
    el.hudDistanceValue.textContent = '0.0 cm';
    el.forceSlider.disabled = false;

    if (clearForce) {
      setForce(0);
    }
  }

  /* ------------------------------------------------------------------------
   * 11. Result Pop-up & Data Log Table
   * ------------------------------------------------------------------------ */
  function showResultPopup(force, surface, distanceCm, barelyMoved) {
    el.resultMainMsg.textContent =
      `You applied ${force} force. The ${surface.name} had ${surface.friction} friction. The car moved ${distanceCm} cm!`;

    if (barelyMoved) {
      el.resultIcon.textContent = '🛑';
      el.resultPopupCard.classList.add('low-force');
      el.resultKnMsg.textContent =
        `ಬಲ (${force}) ≤ ಘರ್ಷಣೆ (${surface.friction})! ಘರ್ಷಣೆ ಹೆಚ್ಚಿರುವುದರಿಂದ ಕಾರು ಸ್ವಲ್ಪವೇ ಚಲಿಸಿತು (Force < Friction, barely moved).`;
    } else {
      el.resultIcon.textContent = distanceCm >= 60 ? '🚀' : '🎉';
      el.resultPopupCard.classList.remove('low-force');
      el.resultKnMsg.textContent =
        `ನೀವು ${force} ಬಲ ಪ್ರಯೋಗಿಸಿದಿರಿ. ${surface.kn}ದ ಘರ್ಷಣೆ ${surface.friction} ಆಗಿತ್ತು. ಕಾರು ${distanceCm} ಸೆಂ.ಮೀ ಚಲಿಸಿತು!`;
    }

    el.resultPopup.classList.remove('hidden');
  }

  function logExperimentRun(surface, force, distanceCm) {
    state.logs.push({
      id: Date.now() + Math.random(),
      surfaceName: `${surface.icon} ${surface.name} (${surface.kn})`,
      force,
      distance: distanceCm,
    });

    if (distanceCm > state.bestDistance) {
      state.bestDistance = distanceCm;
    }

    renderDataTable();
    updateBestTrackMarker();
  }

  function renderDataTable() {
    el.dataTableBody.innerHTML = '';

    if (state.logs.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'empty-row';
      emptyRow.innerHTML = `
        <td colspan="3">
          <div class="empty-state">
            <span>🚗💨</span>
            <p>Pull the rubber band and release the car to record your first trial!</p>
            <small>ರಬ್ಬರ್ ಬ್ಯಾಂಡ್ ಎಳೆದು ಕಾರನ್ನು ಬಿಡಿ — ಫಲಿತಾಂಶ ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ.</small>
          </div>
        </td>
      `;
      el.dataTableBody.appendChild(emptyRow);
      return;
    }

    const maxDist = Math.max(...state.logs.map((entry) => entry.distance));

    // Render newest trials at top or chronological order?
    // Chronological order lets students read Trial 1 -> 2 -> 3 cleanly, and we scroll newest into view.
    state.logs.forEach((entry) => {
      const tr = document.createElement('tr');
      const isHighest = entry.distance === maxDist && maxDist > 0;
      if (isHighest) {
        tr.classList.add('best-row');
      }

      const tdSurf = document.createElement('td');
      tdSurf.textContent = entry.surfaceName;

      const tdForce = document.createElement('td');
      tdForce.className = 'mono-num';
      tdForce.textContent = `${entry.force}`;

      const tdDist = document.createElement('td');
      tdDist.className = 'mono-num';
      tdDist.textContent = `${entry.distance} cm`;

      if (isHighest) {
        const badge = document.createElement('span');
        badge.className = 'best-badge';
        badge.textContent = '🏆 Best';
        tdDist.appendChild(badge);
      }

      tr.append(tdSurf, tdForce, tdDist);
      el.dataTableBody.appendChild(tr);
    });

    // Auto-scroll table container to bottom so latest trial is visible
    const scrollBox = el.dataTableBody.closest('.table-scroll');
    if (scrollBox) {
      scrollBox.scrollTop = scrollBox.scrollHeight;
    }
  }

  function updateBestTrackMarker() {
    if (state.bestDistance <= 0) {
      el.bestMarker.classList.add('hidden');
      return;
    }
    el.bestMarker.style.left = `${cmToTrackPct(state.bestDistance)}%`;
    el.bestMarkerLabel.textContent = `Best: ${state.bestDistance} cm`;
    el.bestMarker.classList.remove('hidden');
  }

  /* ------------------------------------------------------------------------
   * 12. 5-Pull Progress & Mini-Quiz Modal
   * ------------------------------------------------------------------------ */
  function updateQuizProgress() {
    const capped = Math.min(QUIZ_UNLOCK_PULLS, state.pullCount);
    el.pullCountText.textContent = `${capped} / ${QUIZ_UNLOCK_PULLS}`;
    el.pullProgressFill.style.width = `${(capped / QUIZ_UNLOCK_PULLS) * 100}%`;

    if (state.pullCount >= QUIZ_UNLOCK_PULLS) {
      el.openQuizBtn.classList.remove('hidden');

      if (!state.quizShownAuto) {
        state.quizShownAuto = true;
        clearTimeout(state.quizTimerId);
        state.quizTimerId = setTimeout(() => {
          openQuizModal();
        }, 950);
      }
    }
  }

  function openQuizModal() {
    state.quizIndex = 0;
    state.quizScore = 0;
    state.quizLocked = false;
    state.quizHistory = [];

    el.quizBody.classList.remove('hidden');
    el.quizSummary.classList.add('hidden');
    el.quizNextBtn.classList.add('hidden');
    el.confettiLayer.innerHTML = '';

    renderQuizQuestion();
    el.quizModal.classList.remove('hidden');
  }

  function renderQuizQuestion() {
    const q = QUIZ_QUESTIONS[state.quizIndex];
    state.quizLocked = false;

    // Progress dots
    el.quizDots.innerHTML = '';
    QUIZ_QUESTIONS.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = 'q-dot';
      if (state.quizHistory[idx] === true) dot.classList.add('correct');
      else if (state.quizHistory[idx] === false) dot.classList.add('wrong');
      else if (idx === state.quizIndex) dot.classList.add('active');
      el.quizDots.appendChild(dot);
    });

    el.quizQuestionEn.textContent = `Q${state.quizIndex + 1}. ${q.questionEn}`;
    el.quizQuestionKn.textContent = q.questionKn;
    el.quizFeedback.className = 'quiz-feedback hidden';
    el.quizNextBtn.classList.add('hidden');

    el.quizOptions.innerHTML = '';
    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => handleQuizAnswer(btn, opt.value));
      el.quizOptions.appendChild(btn);
    });
  }

  function handleQuizAnswer(clickedBtn, selectedVal) {
    if (state.quizLocked) return;
    state.quizLocked = true;

    const q = QUIZ_QUESTIONS[state.quizIndex];
    const isCorrect = selectedVal === q.answer;
    state.quizHistory[state.quizIndex] = isCorrect;
    const allButtons = el.quizOptions.querySelectorAll('.quiz-opt-btn');

    allButtons.forEach((btn, i) => {
      btn.disabled = true;
      if (q.options[i].value === q.answer) {
        btn.classList.add('correct');
      }
    });

    if (isCorrect) {
      state.quizScore += 1;
      clickedBtn.classList.add('correct');
      el.quizFeedback.className = 'quiz-feedback good';
      el.quizFeedback.textContent = `✅ ${q.explainEn} (${q.explainKn})`;
      SoundFX.playTone(660, 0.14, 'triangle', 0.08, 0);
      SoundFX.playTone(880, 0.18, 'triangle', 0.08, 0.1);
    } else {
      clickedBtn.classList.add('wrong');
      el.quizFeedback.className = 'quiz-feedback try';
      el.quizFeedback.textContent = `💡 Good try! ${q.explainEn}`;
      SoundFX.playTone(220, 0.18, 'sine', 0.06);
    }

    const activeDot = el.quizDots.children[state.quizIndex];
    if (activeDot) {
      activeDot.classList.remove('active');
      activeDot.classList.add(isCorrect ? 'correct' : 'wrong');
    }

    el.quizNextBtn.textContent =
      state.quizIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question ➜' : 'See Results 🏆';
    el.quizNextBtn.classList.remove('hidden');
  }

  function showQuizSummary() {
    el.quizBody.classList.add('hidden');
    el.quizNextBtn.classList.add('hidden');
    el.quizSummary.classList.remove('hidden');

    const total = QUIZ_QUESTIONS.length;
    el.summaryScoreText.textContent = `You scored ${state.quizScore} / ${total}!`;
    el.summaryHeadline.textContent =
      state.quizScore === total
        ? 'Super Friction Scientist! 🌟'
        : 'Awesome Effort, Explorer! 🔬';

    SoundFX.playQuizWin();
    spawnConfetti();
  }

  function spawnConfetti() {
    const colors = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899'];
    el.confettiLayer.innerHTML = '';
    for (let i = 0; i < 36; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.65}s`;
      el.confettiLayer.appendChild(piece);
    }
  }

  /* ------------------------------------------------------------------------
   * 13. Wire Up Event Listeners & Boot
   * ------------------------------------------------------------------------ */
  function initEvents() {
    // Surface selector buttons
    el.surfaceBtns.forEach((btn) => {
      btn.addEventListener('click', () => selectSurface(btn.dataset.surface));
    });

    // Sound toggle
    el.soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      el.soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
      el.soundToggleBtn.setAttribute('aria-pressed', String(state.soundEnabled));
    });

    // Result popup close button
    el.closeResultBtn.addEventListener('click', () => {
      el.resultPopup.classList.add('hidden');
    });

    // Clear data log
    el.clearLogBtn.addEventListener('click', () => {
      state.logs = [];
      state.bestDistance = 0;
      renderDataTable();
      updateBestTrackMarker();
    });

    // Quiz controls
    el.openQuizBtn.addEventListener('click', openQuizModal);
    el.quizNextBtn.addEventListener('click', () => {
      if (state.quizIndex < QUIZ_QUESTIONS.length - 1) {
        state.quizIndex += 1;
        renderQuizQuestion();
      } else {
        showQuizSummary();
      }
    });
    el.quizCloseBtn.addEventListener('click', () => {
      el.quizModal.classList.add('hidden');
      resetStageForNextPull(true);
    });
  }

  function init() {
    buildTrackRuler();
    initPointerDragging();
    initForceControls();
    initEvents();
    selectSurface('paper');
    setForce(0);
    renderDataTable();
  }

  init();
})();
