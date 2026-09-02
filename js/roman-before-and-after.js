/* ============================================================
   1.8 Q3 (page 37) — predecessor and successor of a Roman numeral.
   Pick the neighbour on each side from three candidates.
   ============================================================ */
const VALUE = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
const ROMAN = [
  [1000,'M'], [900,'CM'], [500,'D'], [400,'CD'],
  [100,'C'],  [90,'XC'],  [50,'L'],  [40,'XL'],
  [10,'X'],   [9,'IX'],   [5,'V'],   [4,'IV'], [1,'I']
];

function fromRoman(s){
  let total = 0;
  for(let i = 0; i < s.length; i++){
    const v = VALUE[s[i]], next = VALUE[s[i + 1]];
    total += (next && next > v) ? -v : v;
  }
  return total;
}
function toRoman(n){
  let out = '';
  ROMAN.forEach(([v, sym]) => { while(n >= v){ out += sym; n -= v; } });
  return out;
}

/* three candidates per side: the right one, the number itself off by one the
   other way (the classic slip), and a ten-away neighbour */
function candidates(n, delta){
  const set = [n + delta, n - delta, n + delta * 10];
  const uniq = [];
  set.forEach(v => { if(v > 0 && uniq.indexOf(v) < 0) uniq.push(v); });
  while(uniq.length < 3) uniq.push(n + delta * (uniq.length + 2));
  return uniq.sort((a, b) => a - b).map(toRoman);
}

function neighbourQ(numeral){
  const n = fromRoman(numeral);
  const before = toRoman(n - 1), after = toRoman(n + 1);
  const beforeOpts = candidates(n, -1);
  const afterOpts  = candidates(n, 1);
  let choice, boardEl, ready0;

  function paint(marked){
    boardEl.querySelectorAll('.rba-opt').forEach(b => {
      const side = b.dataset.side, v = b.dataset.v;
      b.classList.toggle('sel', choice[side] === v);
      if(marked){
        const want = side === 'before' ? before : after;
        b.disabled = true;
        if(v === want) b.classList.add('right');
        else if(choice[side] === v) b.classList.add('wrong');
      }
    });
    boardEl.querySelectorAll('.rba-slot').forEach(s => {
      s.textContent = choice[s.dataset.side] || '?';
      s.classList.toggle('filled', !!choice[s.dataset.side]);
    });
  }

  function build(stage, saved, locked){
    choice = saved ? Object.assign({}, saved) : { before:null, after:null };

    boardEl = document.createElement('div');
    boardEl.className = 'rba-board';
    boardEl.innerHTML = `
      <div class="rba-chain">
        <span class="rba-slot" data-side="before">?</span>
        <span class="rba-arrow">&larr;</span>
        <span class="rba-now">${numeral}</span>
        <span class="rba-arrow">&rarr;</span>
        <span class="rba-slot" data-side="after">?</span>
      </div>
      <div class="rba-side">
        <span class="rba-tag">Just before</span>
        <div class="rba-opts">${beforeOpts.map(v =>
          `<button class="rba-opt" data-side="before" data-v="${v}">${v}</button>`).join('')}</div>
      </div>
      <div class="rba-side">
        <span class="rba-tag">Just after</span>
        <div class="rba-opts">${afterOpts.map(v =>
          `<button class="rba-opt" data-side="after" data-v="${v}">${v}</button>`).join('')}</div>
      </div>`;
    stage.appendChild(boardEl);

    paint(false);
    if(locked){
      boardEl.querySelectorAll('.rba-opt').forEach(b => { b.disabled = true; });
      return;
    }

    boardEl.addEventListener('click', e => {
      const b = e.target.closest('.rba-opt');
      if(!b || b.disabled) return;
      choice[b.dataset.side] = b.dataset.v;
      paint(false);
      if(choice.before && choice.after) ready0();
    });
  }

  return {
    prompt: `Which Roman numerals sit either side of <strong>${numeral}</strong>?`,
    hint: `${numeral} is ${n}. One less goes in front, one more comes behind.`,
    render(stage, ready, saved){ ready0 = ready; build(stage, saved, !!saved); },
    renderLocked(stage, saved){ build(stage, saved || { before, after }, true); },
    check(){
      paint(true);
      const ok = choice.before === before && choice.after === after;
      return { ok, answer: ok ? Object.assign({}, choice) : null,
        msg: ok ? `Yes — ${before}, ${numeral}, ${after} is ${n - 1}, ${n}, ${n + 1}.`
                : `${n} &minus; 1 = ${n - 1} = ${before} and ${n} + 1 = ${n + 1} = ${after}.` };
    }
  };
}

Quiz.start({
  kicker: 'Roman Numerals · Question 3',
  title: 'Roman before and after',
  questions: ['XC', 'XLV', 'LXIV', 'LX'].map(neighbourQ)
});
