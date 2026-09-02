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

    if(isOk) soundCorrect(); else soundWrong();

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
        <span class="confetti confetti-1"></span>
        <span class="confetti confetti-2"></span>
        <span class="confetti confetti-3"></span>
        <span class="confetti confetti-4"></span>
        <span class="confetti confetti-5"></span>
        <span class="confetti confetti-6"></span>
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
    soundCorrect: soundCorrect,
    soundWrong: soundWrong,
    soundCongrats: soundCongrats,
    showPopout: showPopout,
    showCongrats: showCongrats,
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

      /* On abacus questions the answer blank moves to the right of the rods,
         with Check directly underneath it. Everything else keeps Check in the
         bottom row between Prev and Next. */
      function layoutStage(){
        const abacus = els.stage.querySelector('.abacus-wrap');
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
    },

    /* ---------- reusable pieces ---------- */

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
