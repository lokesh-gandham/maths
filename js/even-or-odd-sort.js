/* ============================================================
   Launch Pad Q8 — sort numbers into even and odd.
   Questions for this exercise only; the shared engine is quiz.js.
   ============================================================ */
const NUMS = [2347, 5642, 984, 1003, 7648, 3764, 4981, 5067, 7650, 1234];

function sortQ(n){
  const correct = n % 2 === 0 ? 0 : 1;   /* 0 = Even bin, 1 = Odd bin */
  const s = String(n);
  let opts;
  return {
    prompt: 'Which bin does this number belong in?',
    hint: 'Look only at the last digit. 0, 2, 4, 6, 8 are even.',
    render(stage, ready){
      const big = document.createElement('div');
      big.className = 'big';
      big.innerHTML = s.slice(0, -1) + `<span class="lastdigit">${s.slice(-1)}</span>`;
      stage.appendChild(big);
      opts = Quiz.options(stage, ['Even bin', 'Odd bin'], ready);
    },
    check(){
      const ok = opts.value() === correct;
      opts.mark(correct);
      const word = correct === 0 ? 'even' : 'odd';
      return { ok,
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
