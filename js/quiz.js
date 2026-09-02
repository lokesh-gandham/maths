/* ============================================================
   Shared assessment engine.

   A page defines QUIZ = { title, kicker, questions:[...] } where each
   question supplies render(stage) and check() -> {ok, msg}.
   ============================================================ */
(function(){
  const $ = s => document.querySelector(s);

  /* ---------- VOICE (Web Audio API) ---------- */
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function ensureAudio(){
    if(!audioCtx) audioCtx = new AudioCtx();
  }

  function speak(text){
    ensureAudio();
    const synth = window.speechSynthesis;
    if(!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1.1;
    synth.speak(u);
  }

  function playTone(freq, dur, type='sine'){
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  }

  function soundCorrect(){
    playTone(523, 0.12);
    setTimeout(()=> playTone(659, 0.12), 100);
    setTimeout(()=> playTone(784, 0.2), 200);
    speak('Correct!');
  }

  function soundWrong(){
    playTone(330, 0.25, 'square');
    setTimeout(()=> playTone(262, 0.35, 'square'), 200);
    speak('Try again!');
  }

  function soundCongrats(){
    playTone(523, 0.12);
    setTimeout(()=> playTone(659, 0.12), 120);
    setTimeout(()=> playTone(784, 0.12), 240);
    setTimeout(()=> playTone(1047, 0.35), 360);
    speak('Congratulations!');
  }

  /* ---------- POPUP (auto-close with timer bar) ---------- */
  let popupHideTimer = null;
  let popupRemoveTimer = null;

  function clearPopupTimers(){
    clearTimeout(popupHideTimer);
    clearTimeout(popupRemoveTimer);
  }

  /* ---------- CONFETTI ----------
     One cannon used everywhere: a fixed layer over the page, pieces fired
     out of a point in an upward fan, then tumbling down. Call it with the
     element that earned it, or with nothing to fire from the middle. */
  const CONFETTI_COLOURS = [
    '#5CC8A5', '#EFC94C', '#7FB6E8', '#A991DE', '#F0A87E', '#E8899C', '#2FC79E'
  ];

  function confettiLayerEl(){
    let layer = document.getElementById('quiz-confetti');
    if(!layer){
      layer = document.createElement('div');
      layer.id = 'quiz-confetti';
      layer.className = 'cft-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    return layer;
  }

  function confetti(opts){
    opts = opts || {};
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

    let x = opts.x, y = opts.y;
    if(opts.from && opts.from.getBoundingClientRect){
      const r = opts.from.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    if(x === undefined) x = window.innerWidth / 2;
    if(y === undefined) y = window.innerHeight * 0.42;

    const count  = opts.count || 46;
    const spread = opts.spread || Math.min(window.innerWidth, window.innerHeight) * 0.62;
    const layer  = confettiLayerEl();
    const frag   = document.createDocumentFragment();

    for(let i = 0; i < count; i++){
      /* fire into the upper half, wide to both sides */
      const ang  = -Math.PI * (0.06 + Math.random() * 0.88);
      const dist = spread * (0.35 + Math.random() * 0.8);
      const bx   = Math.cos(ang) * dist;
      const by   = Math.sin(ang) * dist * 0.78;
      const fall = window.innerHeight * (0.5 + Math.random() * 0.6);
      const size = 5 + Math.random() * 7;
      const dur  = 1.5 + Math.random() * 1.1;

      const s = document.createElement('span');
      s.className = 'cft';
      s.style.cssText = [
        'left:' + x.toFixed(1) + 'px',
        'top:' + y.toFixed(1) + 'px',
        'width:' + size.toFixed(1) + 'px',
        'height:' + (size * (Math.random() < .3 ? 1 : 1.7)).toFixed(1) + 'px',
        'background:' + CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
        'border-radius:' + (Math.random() < .3 ? '50%' : '2px'),
        '--bx:' + bx.toFixed(1) + 'px',
        '--by:' + by.toFixed(1) + 'px',
        '--ex:' + (bx + (Math.random() * 2 - 1) * 60).toFixed(1) + 'px',
        '--ey:' + (by + fall).toFixed(1) + 'px',
        '--rot:' + Math.round(Math.random() * 900 - 450) + 'deg',
        'animation-delay:' + (Math.random() * .12).toFixed(2) + 's',
        'animation-duration:' + dur.toFixed(2) + 's'
      ].join(';');
      frag.appendChild(s);
      setTimeout(function(){ s.remove(); }, (dur + .4) * 1000);
    }
    layer.appendChild(frag);
  }

  function showPopout(type, msg, onClose){
    clearPopupTimers();

    let overlay = document.getElementById('quiz-popup-overlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'quiz-popup-overlay';
      overlay.className = 'popup-overlay';
      document.body.appendChild(overlay);
    }

    const isOk = type === 'correct';
    const icon = isOk ? '🎉' : '💡';
    const label = isOk ? 'Correct Answer' : 'Keep Learning';
    const title = isOk ? 'Brilliant!' : 'Almost There!';
    const cls = isOk ? 'correct' : 'wrong';

    overlay.innerHTML = `
      <section class="answer-popup ${cls}" role="status" aria-live="polite">
        <div class="popup-body">
          <div class="popup-icon" aria-hidden="true">${icon}</div>
          <div class="popup-label">${label}</div>
          <h2 class="popup-title">${title}</h2>
          <p class="popup-message">${msg}</p>
          <div class="popup-track" aria-hidden="true">
            <div class="popup-bar"></div>
          </div>
        </div>
      </section>`;

    overlay.classList.remove('hide');
    void overlay.offsetWidth;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');

    if(isOk){ soundCorrect(); confetti({ count:40 }); } else soundWrong();

    popupHideTimer = setTimeout(function(){
      overlay.classList.remove('show');
      overlay.classList.add('hide');
      popupRemoveTimer = setTimeout(function(){
        overlay.classList.remove('hide');
        overlay.setAttribute('aria-hidden', 'true');
        if(onClose) onClose();
      }, 300);
    }, 2000);
  }

  function showCongrats(score, total, stars, onClose){
    clearPopupTimers();

    let overlay = document.getElementById('quiz-popup-overlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'quiz-popup-overlay';
      overlay.className = 'popup-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <section class="answer-popup congrats" role="status" aria-live="polite" aria-atomic="true">
        <div class="popup-body">
          <div class="popup-icon" aria-hidden="true">🎉</div>
          <div class="popup-label">Quiz Complete</div>
          <h2 class="popup-title">Congratulations!</h2>
          <div class="popup-stars" aria-label="You earned ${stars.replace(/★/g,'one star,').replace(/☆/g,'').slice(0,-1) || 'no stars'}">
            <span class="popup-star" aria-hidden="true">⭐</span>
            <span class="popup-star" aria-hidden="true">⭐</span>
            <span class="popup-star" aria-hidden="true">⭐</span>
          </div>
          <div class="popup-score">${score} / ${total}</div>
          <p class="popup-message">You did an amazing job!</p>
          <div class="popup-actions">
            <button class="btn btn-again" id="popup-again">Play Again</button>
            <a class="btn btn-menu" href="../index.html">Menu</a>
          </div>
        </div>
      </section>`;

    overlay.classList.remove('hide');
    void overlay.offsetWidth;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');

    soundCongrats();
    confetti({ count:80, spread:Math.min(window.innerWidth, window.innerHeight) * 0.85 });
    setTimeout(function(){ confetti({ count:50 }); }, 420);

    document.getElementById('popup-again').onclick = function(){
      clearPopupTimers();
      overlay.classList.remove('show');
      overlay.classList.add('hide');
      popupRemoveTimer = setTimeout(function(){
        overlay.classList.remove('hide');
        overlay.setAttribute('aria-hidden', 'true');
        if(onClose) onClose();
      }, 300);
    };
  }

  window.Quiz = {
    confetti: confetti,
    soundCorrect: soundCorrect,
    soundWrong: soundWrong,
    soundCongrats: soundCongrats,
    showPopout: showPopout,
    showCongrats: showCongrats,
    _finish: null,
    start(cfg){
      const total = cfg.questions.length;
      const state = { i:0, score:0, answeredResults: new Array(total).fill(null),
                      triedWrong: new Array(total).fill(false),
                      userAnswers: new Array(total).fill(null) };
      const els = {
        title:   $('#q-title'),
        kicker:  $('#q-kicker'),
        count:   $('#q-count'),
        bar:     $('#q-bar'),
        card:    $('#q-card'),
        prompt:  $('#q-prompt'),
        hint:    $('#q-hint'),
        stage:   $('#q-stage'),
        feed:    $('#q-feed'),
        primary: $('#q-primary'),
        prev:    $('#q-prev'),
        next:    $('#q-next'),
        actions: $('#q-card .actions'),
        result:  $('#q-result'),
        score:   $('#q-score'),
        of:      $('#q-of'),
        verdict: $('#q-verdict'),
        blurb:   $('#q-blurb'),
        stars:   $('#q-stars')
      };

      els.title.textContent  = cfg.title;
      els.kicker.textContent = cfg.kicker;

      function updateNav(){
        const isAnswered = state.answeredResults[state.i] !== null;
        els.prev.disabled = state.i === 0;
        els.next.disabled = !isAnswered;
        els.primary.style.display = isAnswered ? 'none' : '';
        if(isAnswered){
          els.feed.className = 'feedback show ' + (state.answeredResults[state.i].ok ? 'ok' : 'no');
          els.feed.innerHTML =
            `<span class="face">${state.answeredResults[state.i].ok ? '✔' : '✖'}</span><span>${state.answeredResults[state.i].msg}</span>`;
        } else {
          els.feed.className = 'feedback';
        }
      }

      function paint(){
        const q = cfg.questions[state.i];
        const prev = state.answeredResults[state.i];

        els.count.textContent = `${state.i + 1} / ${total}`;
        els.bar.style.width = `${(state.i / total) * 100}%`;
        els.prompt.innerHTML = q.prompt;
        els.hint.innerHTML = q.hint || '';
        els.hint.style.display = q.hint ? 'block' : 'none';
        els.stage.innerHTML = '';
        els.primary.textContent = 'Check';
        els.primary.disabled = true;

        if(prev){
          // Already answered - show locked state with saved answers
          q.renderLocked ? q.renderLocked(els.stage, state.userAnswers[state.i]) : q.render(els.stage, ()=>{}, state.userAnswers[state.i]);
          els.primary.style.display = 'none';
        } else {
          q.render(els.stage, () => { els.primary.disabled = false; }, state.userAnswers[state.i]);
        }
        layoutStage();
        updateNav();
      }

      /* On abacus and place-value-tube questions the answer blank moves to
         the right of the apparatus, with Check directly underneath it.
         Everything else keeps Check in the bottom row between Prev and Next. */
      function layoutStage(){
        const abacus = els.stage.querySelector('.abacus-wrap, .tubes-wrap');
        const answer = els.stage.querySelector('.inline-answer, .pair, .entry');
        if(abacus && answer){
          const rail = document.createElement('div');
          rail.className = 'answer-rail';
          els.stage.appendChild(rail);
          rail.appendChild(answer);
          rail.appendChild(els.primary);
        } else if(els.primary.parentElement !== els.actions){
          els.actions.insertBefore(els.primary, els.next);
        }
      }

      function reveal(){
        const q = cfg.questions[state.i];
        const res = q.check();
        const delay = res.delay || 0;

        function afterDelay(){
          if(!res.ok){
            state.triedWrong[state.i] = true;
            state.userAnswers[state.i] = null;  // clear on wrong
            showPopout('wrong', q.retry || 'Not quite — have another go.', ()=>{ paint(); });
            return;
          }

          state.answeredResults[state.i] = res;
          state.userAnswers[state.i] = res.answer || null;
          if(!state.triedWrong[state.i]) state.score++;

          showPopout('correct', res.msg, ()=>{
            if(state.i === total - 1){
              finish();
            } else {
              state.i++;
              paint();
            }
          });
        }

        if(delay > 0) setTimeout(afterDelay, delay);
        else afterDelay();
      }

      function finish(){
        const pct = state.score / total;
        const starCount = pct === 1 ? 3 : pct >= .6 ? 2 : pct > 0 ? 1 : 0;
        const starStr = '★'.repeat(starCount) + '☆'.repeat(3 - starCount);

        showCongrats(state.score, total, starStr, ()=>{
          state.i = 0;
          state.score = 0;
          state.answeredResults = new Array(total).fill(null);
          state.triedWrong = new Array(total).fill(false);
          state.userAnswers = new Array(total).fill(null);
          els.card.style.display = '';
          paint();
        });
      }

      els.primary.addEventListener('click', () => {
        if(state.answeredResults[state.i] === null){ reveal(); }
      });

      els.prev.addEventListener('click', ()=>{
        if(state.i > 0){ state.i--; paint(); }
      });

      els.next.addEventListener('click', ()=>{
        if(state.i < total - 1){ state.i++; paint(); }
      });

      $('#q-again').addEventListener('click', () => {
        state.i = 0; state.score = 0;
        state.answeredResults = new Array(total).fill(null);
        state.triedWrong = new Array(total).fill(false);
        els.result.classList.remove('show');
        els.card.style.display = '';
        paint();
      });

      paint();

      Quiz._finish = finish;
    },

    /* clickable abacus: click a rod to add a bead, right-click / long tap removes */
    abacus(stage, names, {counts = null, editable = true, onChange = null} = {}){
      const c = counts ? counts.slice() : names.map(() => 0);
      const wrap = document.createElement('div');

      wrap.className = 'abacus-wrap';

      const board = document.createElement('div');
      board.className = 'abacus';
      wrap.appendChild(board);

      function draw(){
        board.innerHTML = names.map((n, i) => `
          <${editable ? 'button' : 'div'} class="rod${c[i] ? ' on' : ''}" data-i="${i}"
            ${editable ? `aria-label="Add a bead to the ${n} rod"` : ''}>
            <span class="stick">${'<span class="bead"></span>'.repeat(c[i])}</span>
          </${editable ? 'button' : 'div'}>`).join('');

        // Update base bar labels
        const base = wrap.querySelector('.abacus-base');
        if(base){
          base.innerHTML = names.map((n,i) => `<span class="base-label">${n}</span>`).join('');
        }
      }

      // Create continuous wooden base bar
      const base = document.createElement('div');
      base.className = 'abacus-base';
      base.innerHTML = names.map(n => `<span class="base-label">${n}</span>`).join('');
      wrap.appendChild(base);

      draw();

      if(editable){
        const row = document.createElement('div');
        row.className = 'rodrow';
        row.innerHTML = names.map((n, i) =>
          `<button class="rodbtn" data-i="${i}" aria-label="Remove a bead from the ${n} rod">&minus;</button>`).join('');
        wrap.appendChild(row);

        const bump = (i, d) => {
          c[i] = Math.max(0, Math.min(9, c[i] + d));
          draw();
          if(onChange) onChange(c.join(''));
        };

        board.addEventListener('click', e => {
          const r = e.target.closest('.rod');
          if(r) bump(+r.dataset.i, 1);
        });
        row.addEventListener('click', e => {
          const b = e.target.closest('.rodbtn');
          if(b) bump(+b.dataset.i, -1);
        });
      }

      stage.appendChild(wrap);
      return { value: () => c.join(''), counts: c };
    },

    /* Place-value tubes — a lab bench version of the abacus.
       Drag (or just tap) a block from the palette into its own tube; tap a
       block already in a tube to take it out again. Same contract as
       Quiz.abacus: value() gives the digits the tubes are holding. */
    tubes(stage, names, {counts = null, editable = true, onChange = null} = {}){
      const n = names.length;
      const unit = i => Math.pow(10, n - 1 - i);
      const c = counts ? counts.slice() : names.map(() => 0);

      const wrap = document.createElement('div');
      wrap.className = 'tubes-wrap';

      let pal = null;
      if(editable){
        pal = document.createElement('div');
        pal.className = 'tube-palette';
        pal.innerHTML = names.map((nm, i) =>
          `<button class="tblock u${unit(i)}" draggable="true" data-i="${i}"
                   aria-label="Add one ${unit(i)} to the ${nm} tube">
             <span class="tblock-unit">${unit(i)}</span>
             <span class="tblock-name">${nm}</span>
           </button>`).join('');
        wrap.appendChild(pal);
      }

      const row = document.createElement('div');
      row.className = 'tubes';
      wrap.appendChild(row);

      function draw(){
        row.innerHTML = names.map((nm, i) => `
          <div class="tube-col">
            <div class="tube u${unit(i)}" data-i="${i}">
              ${`<span class="tchip">${unit(i)}</span>`.repeat(c[i])}
            </div>
            <div class="tube-foot">
              <span class="tube-name">${nm}</span>
              <span class="tube-count">${c[i]}</span>
            </div>
          </div>`).join('');
      }

      function bump(i, d){
        const next = c[i] + d;
        if(next < 0 || next > 9) return;
        c[i] = next;
        draw();
        if(onChange) onChange(c.join(''));
      }

      draw();

      if(editable){
        pal.addEventListener('click', e => {
          const b = e.target.closest('.tblock');
          if(b) bump(+b.dataset.i, 1);
        });
        pal.addEventListener('dragstart', e => {
          const b = e.target.closest('.tblock');
          if(b) e.dataTransfer.setData('text/plain', b.dataset.i);
        });

        row.addEventListener('dragover', e => {
          const t = e.target.closest('.tube');
          if(!t) return;
          e.preventDefault();
          t.classList.add('over');
        });
        row.addEventListener('dragleave', e => {
          const t = e.target.closest('.tube');
          if(t) t.classList.remove('over');
        });
        row.addEventListener('drop', e => {
          const t = e.target.closest('.tube');
          if(!t) return;
          e.preventDefault();
          t.classList.remove('over');
          /* a block only belongs in its own tube */
          if(e.dataTransfer.getData('text/plain') === t.dataset.i) bump(+t.dataset.i, 1);
          else t.classList.add('reject'), setTimeout(() => t.classList.remove('reject'), 400);
        });

        /* tap a block in a tube to take it back out */
        row.addEventListener('click', e => {
          const chip = e.target.closest('.tchip');
          if(!chip) return;
          bump(+chip.parentElement.dataset.i, -1);
        });
      }

      stage.appendChild(wrap);
      return { value: () => c.join(''), counts: c };
    },

    /* one-of-many option buttons */
    options(stage, list, onPick, {cls = '', saved = null} = {}){
      const box = document.createElement('div');
      box.className = 'options';
      box.innerHTML = list.map((t, i) =>
        `<button class="opt ${cls}" data-i="${i}">${t}</button>`).join('');
      let picked = null;
      box.addEventListener('click', e => {
        const b = e.target.closest('.opt');
        if(!b || b.disabled) return;
        box.querySelectorAll('.opt').forEach(o => o.classList.remove('sel'));
        b.classList.add('sel');
        picked = +b.dataset.i;
        onPick(picked);
      });
      if(saved !== null && saved !== undefined){
        const btn = box.querySelectorAll('.opt')[saved];
        if(btn){ btn.classList.add('sel'); picked = saved; }
      }
      stage.appendChild(box);
      return {
        value: () => picked,
        mark(correct){
          box.querySelectorAll('.opt').forEach((o, i) => {
            o.disabled = true;
            if(i === correct) o.classList.add('right');
            else if(i === picked) o.classList.add('wrong');
          });
        }
      };
    },

    /* a single typed answer */
    entry(stage, {placeholder = '', numeric = true, width = null, onInput = null} = {}){
      const el = document.createElement('input');
      el.className = 'entry';
      el.type = 'text';
      if(numeric) el.inputMode = 'numeric';
      el.placeholder = placeholder;
      el.autocomplete = 'off';
      if(width) el.style.width = width;
      el.addEventListener('input', () => onInput && onInput(el.value.trim()));
      stage.appendChild(el);
      setTimeout(() => el.focus(), 30);
      return {
        value: () => el.value.trim(),
        mark(ok){ el.classList.add(ok ? 'right' : 'wrong'); el.disabled = true; }
      };
    },

    /* Digit builder — one strip of digit chips feeding two (or more) rows of
       slots, e.g. "smallest" and "greatest". Each row spends every digit at
       most once, so the chips grey out per row, not globally. */
    digitBuilder(stage, {digits, slots, rows, saved = null, locked = false, onComplete = null} = {}){
      const picks = {};
      rows.forEach(r => { picks[r.key] = saved && saved[r.key] ? saved[r.key].slice() : []; });
      let active = locked ? null : rows[0].key;

      const wrap = document.createElement('div');
      wrap.className = 'db-wrap';

      const board = document.createElement('div');
      board.className = 'db-board';
      wrap.appendChild(board);

      const chips = document.createElement('div');
      chips.className = 'db-chips';
      wrap.appendChild(chips);

      const undo = document.createElement('button');
      undo.className = 'btn ghost db-undo';
      undo.textContent = 'Undo';
      wrap.appendChild(undo);

      function complete(){
        return rows.every(r => picks[r.key].length === slots);
      }

      function paint(){
        board.innerHTML = rows.map(r => {
          const p = picks[r.key];
          const cells = [];
          for(let i = 0; i < slots; i++){
            const on = p[i] !== undefined;
            const next = active === r.key && i === p.length;
            cells.push(`<span class="db-slot${on ? ' filled' : ''}${next ? ' next' : ''}"
              data-row="${r.key}" data-i="${i}">${on ? digits[p[i]] : ''}</span>`);
          }
          return `<div class="db-row${active === r.key ? ' active' : ''}" data-row="${r.key}">
                    <span class="db-label">${r.label}</span>
                    <span class="db-slots">${cells.join('')}</span>
                  </div>`;
        }).join('');

        const used = active ? picks[active] : [];
        chips.innerHTML = digits.map((d, i) => {
          const taken = used.indexOf(i) > -1;
          return `<button class="db-chip${taken ? ' used' : ''}" data-i="${i}" ${taken ? 'disabled' : ''}>${d}</button>`;
        }).join('');

        chips.style.display = locked || !active ? 'none' : 'flex';
        undo.style.display  = locked || !active ? 'none' : '';
      }

      board.addEventListener('click', e => {
        if(locked) return;
        const row = e.target.closest('.db-row');
        if(!row) return;
        active = row.dataset.row;
        paint();
      });

      chips.addEventListener('click', e => {
        const b = e.target.closest('.db-chip');
        if(!b || b.disabled || !active) return;
        const p = picks[active];
        if(p.length >= slots) return;
        p.push(+b.dataset.i);
        if(p.length === slots){
          const next = rows.find(r => picks[r.key].length < slots);
          active = next ? next.key : null;
        }
        paint();
        if(complete() && onComplete) onComplete();
      });

      undo.addEventListener('click', () => {
        if(!active) active = rows[rows.length - 1].key;
        picks[active].pop();
        paint();
      });

      paint();
      stage.appendChild(wrap);

      return {
        values(){
          const out = {};
          rows.forEach(r => { out[r.key] = picks[r.key].map(i => digits[i]).join(''); });
          return out;
        },
        picks(){
          const out = {};
          rows.forEach(r => { out[r.key] = picks[r.key].slice(); });
          return out;
        },
        /* expected: {rowKey: "103468", ...} — paints each slot green or red */
        mark(expected){
          active = null;
          paint();
          board.querySelectorAll('.db-slot').forEach(s => {
            const want = expected[s.dataset.row][+s.dataset.i];
            s.classList.add(s.textContent === want ? 'right' : 'wrong');
          });
        }
      };
    },

    /* Number line between two round neighbours, with the number pinned on it
       and the halfway mark shown, so "which side is it closer to" is visible. */
    numberLine(stage, {lo, hi, ticks = 10, value}){
      const span = hi - lo;
      const pct  = v => ((v - lo) / span) * 100;

      const wrap = document.createElement('div');
      wrap.className = 'nl-wrap';

      let tickHtml = '';
      for(let i = 0; i <= ticks; i++){
        const at = (i / ticks) * 100;
        const major = i === 0 || i === ticks;
        tickHtml += `<span class="nl-tick${major ? ' major' : ''}" style="left:${at}%"></span>`;
      }

      wrap.innerHTML = `
        <div class="nl-line">
          ${tickHtml}
          <span class="nl-half" style="left:50%"></span>
          <span class="nl-pin" style="left:${pct(value)}%">
            <span class="nl-pin-val">${value}</span>
          </span>
        </div>
        <div class="nl-ends">
          <span class="nl-end">${lo}</span>
          <span class="nl-mid">halfway</span>
          <span class="nl-end">${hi}</span>
        </div>`;

      stage.appendChild(wrap);
      return wrap;
    },

    /* live read-out chip, e.g. the number the abacus currently shows */
    readout(stage, text){
      const el = document.createElement('div');
      el.className = 'readout';
      el.textContent = text;
      stage.appendChild(el);
      return { set(t){ el.textContent = t; } };
    }
  };
})();
