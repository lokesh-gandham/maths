/* ============================================================
   1.2 Q5 (page 20) — Periods puzzle.
   a) knock two digits down to zero and read the new number
   b) drop each chunk into its own period
   ============================================================ */
function tidyName(s){
  return s.toLowerCase()
          .replace(/[,\-]/g, ' ')
          .replace(/\band\b/g, ' ')
          .replace(/\blakhs\b/g, 'lakh')
          .replace(/\s+/g, ' ')
          .trim();
}

/* ---- a) tap the named digits to turn them into zeros ---- */
function zeroOutQ(source, kill, answer, words){
  const digits = source.split('');
  let state, tilesEl, outEl, wordField, ready0;

  function gate(){
    if(wordField.value.trim().length > 3) ready0();
  }

  function paint(){
    tilesEl.innerHTML = state.map((d, i) =>
      `<button class="pp-tile${d === '0' && digits[i] !== '0' ? ' zeroed' : ''}" data-i="${i}">${d}</button>`).join('');
    outEl.textContent = state.join('');
  }

  function build(stage, saved, locked){
    state = saved ? saved.state.slice() : digits.slice();

    const title = document.createElement('p');
    title.className = 'pp-lead';
    title.innerHTML = `Tap the <strong>${kill.join('</strong> and the <strong>')}</strong> in ${source} to knock them down to zero.`;
    stage.appendChild(title);

    tilesEl = document.createElement('div');
    tilesEl.className = 'pp-tiles';
    stage.appendChild(tilesEl);

    outEl = document.createElement('div');
    outEl.className = 'pp-out';
    stage.appendChild(outEl);

    const wrap = document.createElement('div');
    wrap.className = 'pp-words';
    wrap.innerHTML = `
      <label>and in words</label>
      <input type="text" class="pp-input" value="${saved ? saved.words : (locked ? words : '')}"
             placeholder="Write the new number in words" autocomplete="off" ${locked ? 'disabled' : ''}>`;
    stage.appendChild(wrap);
    wordField = wrap.querySelector('.pp-input');

    paint();
    if(locked) return;

    tilesEl.addEventListener('click', e => {
      const t = e.target.closest('.pp-tile');
      if(!t) return;
      const i = +t.dataset.i;
      state[i] = state[i] === '0' ? digits[i] : '0';
      paint();
      gate();
    });
    wordField.addEventListener('input', gate);
  }

  return {
    prompt: 'Write the number formed.',
    hint: '',
    render(stage, ready, saved){ ready0 = ready; build(stage, saved, !!saved); },
    renderLocked(stage, saved){ build(stage, saved, true); },
    check(){
      const got = state.join('');
      if(got !== answer){
        return { ok:false, msg:`Only the ${kill.join(' and the ')} become zero — the number is ${answer}.` };
      }
      const ok = tidyName(wordField.value) === tidyName(words);
      wordField.classList.add(ok ? 'right' : 'wrong');
      return { ok, answer:{ state:state.slice(), words:wordField.value.trim() },
        msg: ok ? `Yes — ${answer} is ${words.toLowerCase()}.`
                : `${answer} is right. In words it is "${words}".` };
    }
  };
}

/* ---- b) put each chunk into its own period ---- */
const PERIODS = ['Lakhs', 'Thousands', 'Ones'];

function periodsQ(chunks){
  const pool = chunks.map(c => c.value);
  const answerOf = name => chunks.find(c => c.period === name).value;
  const full = PERIODS.map(answerOf).join('');
  const pretty = PERIODS.map(answerOf).join(',');
  let placed, sel, boardEl, chipsEl, outEl, ready0;

  function paint(){
    boardEl.innerHTML = PERIODS.map(p => `
      <div class="pp-cell${placed[p] ? ' filled' : ''}${sel === p ? ' sel' : ''}" data-p="${p}">
        <span class="pp-cell-lbl">${p}</span>
        <span class="pp-cell-val">${placed[p] || ''}</span>
      </div>`).join('<span class="pp-sep">,</span>');

    const used = PERIODS.map(p => placed[p]).filter(Boolean);
    chipsEl.innerHTML = pool.map(v => {
      const taken = used.indexOf(v) > -1;
      return `<button class="pp-chip${taken ? ' used' : ''}" data-v="${v}" ${taken ? 'disabled' : ''}>${v}</button>`;
    }).join('');

    outEl.textContent = PERIODS.every(p => placed[p]) ? PERIODS.map(p => placed[p]).join('') : '';
  }

  function build(stage, saved, locked){
    placed = saved ? Object.assign({}, saved) : { Lakhs:null, Thousands:null, Ones:null };
    sel = locked ? null : 'Lakhs';

    const title = document.createElement('p');
    title.className = 'pp-lead';
    title.innerHTML = chunks.map(c =>
      `<strong>${c.value}</strong> in the ${c.period.toLowerCase()} period`).join(', ') + '.';
    stage.appendChild(title);

    boardEl = document.createElement('div');
    boardEl.className = 'pp-board';
    stage.appendChild(boardEl);

    chipsEl = document.createElement('div');
    chipsEl.className = 'pp-chips';
    stage.appendChild(chipsEl);

    outEl = document.createElement('div');
    outEl.className = 'pp-out';
    stage.appendChild(outEl);

    paint();
    if(locked){ chipsEl.style.display = 'none'; return; }

    boardEl.addEventListener('click', e => {
      const cell = e.target.closest('.pp-cell');
      if(!cell) return;
      const name = cell.dataset.p;
      if(placed[name]) placed[name] = null;
      sel = name;
      paint();
    });
    chipsEl.addEventListener('click', e => {
      const b = e.target.closest('.pp-chip');
      if(!b || b.disabled || !sel) return;
      placed[sel] = b.dataset.v;
      sel = PERIODS.find(p => !placed[p]) || null;
      paint();
      if(PERIODS.every(p => placed[p])) ready0();
    });
  }

  return {
    prompt: 'Drop each part into the right period.',
    hint: '',
    render(stage, ready, saved){ ready0 = ready; build(stage, saved, !!saved); },
    renderLocked(stage, saved){
      build(stage, saved || { Lakhs:answerOf('Lakhs'), Thousands:answerOf('Thousands'), Ones:answerOf('Ones') }, true);
    },
    check(){
      let ok = true;
      boardEl.querySelectorAll('.pp-cell').forEach(c => {
        const good = placed[c.dataset.p] === answerOf(c.dataset.p);
        c.classList.remove('sel');
        c.classList.add(good ? 'right' : 'wrong');
        if(!good) ok = false;
      });
      return { ok, answer: Object.assign({}, placed),
        msg: ok ? `That makes ${pretty} — ${full}.`
                : `Each part has its own period: ${pretty}.` };
    }
  };
}

Quiz.start({
  kicker: 'Numbers up to Lakhs · Question 5',
  title: 'Periods puzzle',
  questions: [
    zeroOutQ('39480', ['4', '9'], '30080', 'Thirty thousand eighty'),
    periodsQ([
      { value:'7',   period:'Lakhs' },
      { value:'67',  period:'Thousands' },
      { value:'893', period:'Ones' }
    ])
  ]
});
