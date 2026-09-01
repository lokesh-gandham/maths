/* ============================================================
   Launch Pad Q8 — sort numbers into even and odd.
   Questions for this exercise only; the shared engine is quiz.js.
   ============================================================ */
const NUMS = [2347, 5642, 984, 1003, 7648, 3764, 4981, 5067, 7650, 1234];

function sortQ(n){
  const correct = n % 2 === 0 ? 0 : 1;   /* 0 = Even bin, 1 = Odd bin */
  const s = String(n);
  let opts, bigEl, binEls;
  return {
    prompt: 'Which bin does this number belong in?',
    hint: '',
    render(stage, ready){
      const wrap = document.createElement('div');
      wrap.className = 'eo-stage';

      bigEl = document.createElement('div');
      bigEl.className = 'eo-num';
      bigEl.innerHTML = s.slice(0, -1) + `<span class="lastdigit">${s.slice(-1)}</span>`;

      wrap.appendChild(bigEl);
      stage.appendChild(wrap);

      opts = Quiz.options(stage, ['Even bin', 'Odd bin'], ready, {cls:'eo-opt'});
      binEls = stage.querySelectorAll('.eo-opt');
    },
    check(){
      const ok = opts.value() === correct;
      if(ok && bigEl){
        bigEl.classList.add('throwing');
        setTimeout(() => binEls[correct].classList.add('bin-hit'), 250);
      }
      opts.mark(correct);
      const word = correct === 0 ? 'even' : 'odd';
      return { ok, delay: ok ? 700 : 0,
        msg: ok ? `Yes — ${n} ends in ${s.slice(-1)}, so it is ${word}.`
                : `${n} ends in ${s.slice(-1)}, so it is ${word}.` };
    }
  };
}

Quiz.start({
  kicker: 'Launch Pad · Question 8',
  title: 'Even or odd sort',
  questions: NUMS.map(sortQ)
});
