/* ============================================================
   1.7 Q2 (page 33) — round off to the nearest 100.
   Same number line, bigger jumps: each tick is a ten.
   ============================================================ */
const STEP = 100;

function roundQ(n){
  const lo = Math.floor(n / STEP) * STEP;
  const hi = lo + STEP;
  const answer = (n - lo) >= STEP / 2 ? hi : lo;
  const correct = answer === lo ? 0 : 1;
  let opts;

  function board(stage){
    Quiz.numberLine(stage, { lo, hi, ticks: 10, value: n });
  }

  return {
    prompt: `Round <strong>${n}</strong> off to the nearest 100.`,
    hint: 'Look at the tens digit: 5 or more jumps up, less than 5 stays down.',
    render(stage, ready, saved){
      board(stage);
      opts = Quiz.options(stage, [String(lo), String(hi)], () => ready(), { cls:'round', saved });
    },
    renderLocked(stage, saved){
      board(stage);
      const o = Quiz.options(stage, [String(lo), String(hi)], () => {}, { cls:'round', saved });
      o.mark(correct);
    },
    check(){
      const ok = opts.value() === correct;
      opts.mark(correct);
      const tens = Math.floor((n % 100) / 10);
      return { ok, answer: opts.value(),
        msg: ok ? `Yes — ${n} rounds to ${answer}.`
                : `The tens digit is ${tens}, so ${n} rounds ${answer === hi ? 'up' : 'down'} to ${answer}.` };
    }
  };
}

Quiz.start({
  kicker: 'Rounding Off Numbers · Question 2',
  title: 'Round to the nearest 100',
  questions: [709, 5434, 79011, 36578, 140329, 800456].map(roundQ)
});
