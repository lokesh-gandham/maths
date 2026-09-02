/* ============================================================
   1.8 Q2 (page 36) — place the correct symbol <, > or =
   between two Roman numerals.
   ============================================================ */
const VALUE = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };

function fromRoman(s){
  let total = 0;
  for(let i = 0; i < s.length; i++){
    const v = VALUE[s[i]], next = VALUE[s[i + 1]];
    total += (next && next > v) ? -v : v;
  }
  return total;
}

const SYMS  = ['&lt;', '&gt;', '='];
const NAMES = ['is less than', 'is greater than', 'is equal to'];

function romanCompare(left, right){
  const a = fromRoman(left), b = fromRoman(right);
  const correct = a < b ? 0 : a > b ? 1 : 2;
  let opts, gap, duel;

  function board(stage){
    duel = document.createElement('div');
    duel.className = 'duel roman';
    duel.innerHTML = `
      <span class="n"><span class="rn">${left}</span><span class="val"></span></span>
      <span class="gap">?</span>
      <span class="n"><span class="rn">${right}</span><span class="val"></span></span>`;
    stage.appendChild(duel);
    gap = duel.querySelector('.gap');
  }

  function revealValues(){
    const vals = duel.querySelectorAll('.val');
    vals[0].textContent = a;
    vals[1].textContent = b;
    duel.classList.add('shown');
  }

  return {
    prompt: 'Which symbol goes in the middle?',
    hint: '',
    render(stage, ready, saved){
      board(stage);
      opts = Quiz.options(stage, SYMS, i => {
        gap.innerHTML = SYMS[i];
        gap.classList.add('filled');
        ready();
      }, { cls:'sym', saved });
      if(saved !== null && saved !== undefined){
        gap.innerHTML = SYMS[saved];
        gap.classList.add('filled');
      }
    },
    renderLocked(stage, saved){
      board(stage);
      const o = Quiz.options(stage, SYMS, () => {}, { cls:'sym', saved });
      o.mark(correct);
      gap.innerHTML = SYMS[correct];
      gap.classList.add('filled');
      revealValues();
    },
    check(){
      const ok = opts.value() === correct;
      opts.mark(correct);
      gap.innerHTML = SYMS[correct];
      revealValues();
      return { ok, answer: opts.value(),
        msg: ok ? `Right — ${left} (${a}) ${NAMES[correct]} ${right} (${b}).`
                : `${left} is ${a} and ${right} is ${b}, so ${left} ${NAMES[correct]} ${right}.` };
    }
  };
}

Quiz.start({
  kicker: 'Roman Numerals · Question 2',
  title: 'Compare Roman numerals',
  questions: [
    romanCompare('IX', 'XI'),
    romanCompare('VII', 'IV'),
    romanCompare('XC', 'XL'),
    romanCompare('DCCC', 'M'),
    romanCompare('MCC', 'MCC'),
    romanCompare('CMXC', 'CM')
  ]
});
