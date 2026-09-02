/* ============================================================
   1.8 Q5 (page 37) — write the numbers in Roman numerals.
   Tap the letter stamps to spell it out; no keyboard needed.
   ============================================================ */
const LETTERS = ['I', 'V', 'X', 'L', 'C'];
const VALUE = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
const ROMAN = [
  [100,'C'], [90,'XC'], [50,'L'], [40,'XL'],
  [10,'X'],  [9,'IX'],  [5,'V'],  [4,'IV'], [1,'I']
];

function toRoman(n){
  let out = '';
  ROMAN.forEach(([v, sym]) => { while(n >= v){ out += sym; n -= v; } });
  return out;
}
function fromRoman(s){
  let total = 0;
  for(let i = 0; i < s.length; i++){
    const v = VALUE[s[i]], next = VALUE[s[i + 1]];
    total += (next && next > v) ? -v : v;
  }
  return total;
}

function encodeQ(n){
  const answer = toRoman(n);
  let typed, tapeEl, ready0;

  function paint(marked){
    tapeEl.innerHTML = typed.length
      ? typed.map((ch, i) => {
          let cls = '';
          if(marked) cls = answer[i] === ch ? ' right' : ' wrong';
          return `<span class="ntr-stamp${cls}">${ch}</span>`;
        }).join('')
      : '<span class="ntr-ghost">tap the letters</span>';
  }

  function build(stage, saved, locked){
    typed = saved ? saved.split('') : [];

    const target = document.createElement('div');
    target.className = 'ntr-target';
    target.innerHTML = `<span class="ntr-tag">Write in Roman</span><span class="ntr-num">${n}</span>`;
    stage.appendChild(target);

    tapeEl = document.createElement('div');
    tapeEl.className = 'ntr-tape';
    stage.appendChild(tapeEl);
    paint(false);

    if(locked) return;

    const pad = document.createElement('div');
    pad.className = 'ntr-pad';
    pad.innerHTML = LETTERS.map(l =>
      `<button class="ntr-key" data-l="${l}">${l}<span class="ntr-worth">${VALUE[l]}</span></button>`).join('') +
      `<button class="ntr-key back" data-back="1" aria-label="Delete">&#9003;</button>`;
    stage.appendChild(pad);

    pad.addEventListener('click', e => {
      const b = e.target.closest('.ntr-key');
      if(!b) return;
      if(b.dataset.back) typed.pop();
      else if(typed.length < 12) typed.push(b.dataset.l);
      paint(false);
      if(typed.length) ready0();
    });
  }

  return {
    prompt: `Write <strong>${n}</strong> in Roman numerals.`,
    hint: '',
    render(stage, ready, saved){ ready0 = ready; build(stage, saved, !!saved); },
    renderLocked(stage, saved){ build(stage, saved || answer, true); },
    check(){
      const got = typed.join('');
      const ok = got === answer;
      paint(true);
      if(ok) return { ok:true, answer: got, msg:`Perfect — ${n} is ${answer}.` };
      const worth = got ? fromRoman(got) : 0;
      return { ok:false, answer:null,
        msg: got && worth !== n
          ? `${got} is worth ${worth}. ${n} is written ${answer}.`
          : `${n} is written ${answer}.` };
    }
  };
}

Quiz.start({
  kicker: 'Roman Numerals · Question 5',
  title: 'Number to Roman',
  questions: [18, 24, 57, 63, 85, 79].map(encodeQ)
});
