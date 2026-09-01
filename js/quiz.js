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

  /* ---------- POPOUT ---------- */
  function showPopout(type, msg, onClose){
    let overlay = document.getElementById('popout-overlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'popout-overlay';
      overlay.className = 'popout-overlay';
      document.body.appendChild(overlay);
    }

    const isOk = type === 'correct';
    const icon = isOk ? '✔' : '✖';
    const title = isOk ? 'Correct!' : 'Try Again!';
    const cls = isOk ? 'correct' : 'wrong';

    overlay.innerHTML = `
      <div class="popout ${cls}">
        <div class="icon">${icon}</div>
        <h2>${title}</h2>
        <div class="msg-bubble">${msg}</div>
      </div>`;
    overlay.classList.add('show');

    if(isOk) soundCorrect(); else soundWrong();

    setTimeout(()=>{
      overlay.classList.remove('show');
      if(onClose) onClose();
    }, 2000);
  }

  function showCongrats(score, total, stars, onClose){
    let overlay = document.getElementById('popout-overlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'popout-overlay';
      overlay.className = 'popout-overlay';
      document.body.appendChild(overlay);
    }

    const pct = score / total;
    const verdict = 'Congratulations!';

    overlay.innerHTML = `
      <div class="popout congrats">
        <div class="icon">🎉</div>
        <h2>${verdict}</h2>
        <div class="stars">★★★</div>
        <div class="score-text">${score} / ${total}</div>
        <div style="display:flex;gap:.4rem;justify-content:center;margin-top:.3rem">
          <button class="btn prev-btn" id="popout-again" style="font-size:.6rem;padding:.4rem .8rem">Play Again</button>
          <a class="btn next-btn" href="../index.html" style="font-size:.6rem;padding:.4rem .8rem;text-decoration:none">Menu</a>
        </div>
      </div>`;
    overlay.classList.add('show');

    soundCongrats();

    document.getElementById('popout-again').onclick = ()=>{
      overlay.classList.remove('show');
      if(onClose) onClose();
    };
  }

  window.Quiz = {
    start(cfg){
      const total = cfg.questions.length;
      const state = { i:0, score:0, answeredResults: new Array(total).fill(null),
                      triedWrong: new Array(total).fill(false) };
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
          // Already answered - show locked state
          q.renderLocked ? q.renderLocked(els.stage) : q.render(els.stage, ()=>{});
          els.primary.style.display = 'none';
        } else {
          q.render(els.stage, () => { els.primary.disabled = false; });
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
            showPopout('wrong', q.retry || 'Not quite — have another go.', ()=>{ paint(); });
            return;
          }

          state.answeredResults[state.i] = res;
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
    options(stage, list, onPick, {cls = ''} = {}){
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
