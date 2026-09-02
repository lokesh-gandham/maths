/* ============================================================
   1.1 Q1 (page 16) — Fill in the boxes.

   One statement at a time. The answer is built by tapping digit
   tiles into the empty boxes, so nothing has to be typed. Tap a
   filled box to send that tile back to the tray.
   ============================================================ */
/* Answers as printed in the book's key: 1, 99, 100, 9999, 1, 10.
   Note (a) — the key counts from 1, so the smallest 1 digit number is 1. */
const FIBQS = [
  { before:'Smallest 1 digit number is', answer:'1' },
  { before:'Greatest 2 digit number is', answer:'99' },
  { before:'Smallest 3 digit number is', answer:'100' },
  { before:'Greatest 4 digit number is', answer:'9999' },
  { before:'100 ones =', answer:'1', after:'hundred' },
  { before:'1 thousand =', answer:'10', after:'hundreds' }
];

/* a small seeded shuffle, so the tray keeps the same order when the
   question is re-drawn (going back with Prev, for instance) */
function seeded(seed){
  let s = seed % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

function trayFor(answer, seed){
  const rnd = seeded(seed);
  const tiles = answer.split('');
  const extras = Math.min(5, Math.max(3, 7 - tiles.length));
  for(let i = 0; i < extras; i++) tiles.push(String(Math.floor(rnd() * 10)));
  for(let i = tiles.length - 1; i > 0; i--){
    const j = Math.floor(rnd() * (i + 1));
    const t = tiles[i]; tiles[i] = tiles[j]; tiles[j] = t;
  }
  return tiles;
}

function fibQ(item, idx){
  const answer = item.answer;
  const tray = trayFor(answer, idx * 37 + 11);
  let picked, slotsEl, trayEl, ready0, locked;

  function paint(marked){
    slotsEl.innerHTML = answer.split('').map((_, i) => {
      const on = picked[i] !== undefined;
      let cls = 'fib-slot';
      if(on) cls += ' filled';
      if(!locked && !marked && i === picked.length) cls += ' next';
      if(marked) cls += (on && tray[picked[i]] === answer[i]) ? ' right' : ' wrong';
      return `<button class="${cls}" data-i="${i}"${locked ? ' disabled' : ''}>${
        on ? tray[picked[i]] : ''}</button>`;
    }).join('');

    trayEl.innerHTML = tray.map((d, i) => {
      const used = picked.indexOf(i) > -1;
      return `<button class="fib-tile${used ? ' used' : ''}" data-i="${i}"${
        used || locked ? ' disabled' : ''}>${d}</button>`;
    }).join('');
    trayEl.style.display = locked ? 'none' : 'flex';
  }

  function build(stage, saved, isLocked){
    picked = saved ? saved.slice() : [];
    locked = isLocked;

    slotsEl = document.createElement('div');
    slotsEl.className = 'fib-slots';
    stage.appendChild(slotsEl);

    trayEl = document.createElement('div');
    trayEl.className = 'fib-tray';
    stage.appendChild(trayEl);

    paint(false);
    if(locked) return;

    slotsEl.addEventListener('click', e => {
      const b = e.target.closest('.fib-slot');
      if(!b) return;
      const i = +b.dataset.i;
      if(picked[i] === undefined) return;
      picked.splice(i, 1);          /* the rest shuffle left */
      paint(false);
    });

    trayEl.addEventListener('click', e => {
      const b = e.target.closest('.fib-tile');
      if(!b || b.disabled) return;
      if(picked.length >= answer.length) return;
      picked.push(+b.dataset.i);
      paint(false);
      if(picked.length === answer.length) ready0();
    });
  }

  const blank = '<span class="fib-blank"></span>';

  return {
    prompt: `Q${idx + 1}. ${item.before} ${blank}${item.after ? ' ' + item.after : ''}`,
    hint: '',
    render(stage, ready, saved){ ready0 = ready; build(stage, saved, false); },
    renderLocked(stage, saved){
      const done = saved || answer.split('').map(ch => tray.indexOf(ch));
      build(stage, done, true);
    },
    check(){
      const got = picked.map(i => tray[i]).join('');
      const ok = got === answer;
      paint(true);
      return { ok, answer: ok ? picked.slice() : null,
        msg: ok ? `Yes — ${item.before} ${answer}${item.after ? ' ' + item.after : ''}.`
                : `Not quite — the answer is ${answer}.` };
    }
  };
}

Quiz.start({
  kicker: 'Count by Ten Thousands · Question 1',
  title: 'Fill in the boxes',
  questions: FIBQS.map(fibQ)
});
