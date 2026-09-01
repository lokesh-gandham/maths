/* ============================================================
   Shared assessment engine.

   A page defines QUIZ = { title, kicker, questions:[...] } where each
   question supplies render(stage) and check() -> {ok, msg}.
   ============================================================ */
(function(){
  const $ = s => document.querySelector(s);

  window.Quiz = {
    start(cfg){
      const state = { i:0, score:0, answered:false };
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
        result:  $('#q-result'),
        score:   $('#q-score'),
        of:      $('#q-of'),
        verdict: $('#q-verdict'),
        blurb:   $('#q-blurb'),
        stars:   $('#q-stars')
      };

      els.title.textContent  = cfg.title;
      els.kicker.textContent = cfg.kicker;

      const total = cfg.questions.length;

      function paint(){
        const q = cfg.questions[state.i];
        state.answered = false;

        els.count.textContent = `${state.i + 1} / ${total}`;
        els.bar.style.width = `${(state.i / total) * 100}%`;
        els.prompt.innerHTML = q.prompt;
        els.hint.innerHTML = q.hint || '';
        els.hint.style.display = q.hint ? 'block' : 'none';
        els.stage.innerHTML = '';
        els.feed.className = 'feedback';
        els.primary.textContent = 'Check';
        els.primary.disabled = true;

        q.render(els.stage, () => { els.primary.disabled = false; });
      }

      function reveal(){
        const q = cfg.questions[state.i];
        const res = q.check();
        state.answered = true;
        if(res.ok) state.score++;

        els.feed.className = `feedback show ${res.ok ? 'ok' : 'no'}`;
        els.feed.innerHTML =
          `<span class="face">${res.ok ? '✔' : '✖'}</span><span>${res.msg}</span>`;

        els.primary.textContent = state.i === total - 1 ? 'See result' : 'Next';
      }

      function finish(){
        els.bar.style.width = '100%';
        els.card.style.display = 'none';
        els.result.classList.add('show');
        els.score.textContent = state.score;
        els.of.textContent = `out of ${total}`;

        const pct = state.score / total;
        const stars = pct === 1 ? 3 : pct >= .6 ? 2 : pct > 0 ? 1 : 0;
        els.stars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        els.verdict.textContent =
          pct === 1 ? 'Perfect round!' : pct >= .6 ? 'Nicely done!' : 'Good try!';
        els.blurb.textContent =
          pct === 1 ? 'Every answer was correct. On to the next activity.'
                    : 'Play it again to push your score higher.';
      }

      els.primary.addEventListener('click', () => {
        if(!state.answered){ reveal(); return; }
        if(state.i === total - 1){ finish(); return; }
        state.i++;
        paint();
      });

      $('#q-again').addEventListener('click', () => {
        state.i = 0; state.score = 0;
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
            <span class="name">${n}</span>
            <span class="val">${c[i]}</span>
          </${editable ? 'button' : 'div'}>`).join('');
      }
      draw();

      if(editable){
        /* tap the rod itself to add a bead — one control row instead of two,
           which keeps the whole game inside the screen */
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
