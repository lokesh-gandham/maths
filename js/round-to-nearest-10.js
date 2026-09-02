/* ============================================================
   1.7 Q1 (page 33) — round off to the nearest 10.
   The number line does the explaining: land on the closer end.
   ============================================================ */
const STEP = 10;

function roundQ(n){
  const lo = Math.floor(n / STEP) * STEP;
  const hi = lo + STEP;
  const answer = (n - lo) >= STEP / 2 ? hi : lo;
  const correct = answer === lo ? 0 : 1;
  let opts;

  function board(stage){
    Quiz.numberLine(stage, { lo, hi, ticks: STEP, value: n });
  }

  return {
    prompt: `Round <strong>${n}</strong> off to the nearest 10.`,
    hint: '',
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
      const ones = n % 10;
      return { ok, answer: opts.value(),
        msg: ok ? `Yes — ${n} rounds to ${answer}.`
                : `The ones digit is ${ones}, so ${n} rounds ${answer === hi ? 'up' : 'down'} to ${answer}.` };
    }
  };
}

Quiz.start({
  kicker: 'Rounding Off Numbers · Question 1',
  title: 'Round to the nearest 10',
  questions: [56, 142, 6095, 76583, 278544, 350098].map(roundQ)
});
