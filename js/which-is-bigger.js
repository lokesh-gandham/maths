/* ============================================================
   1.5 Q1 (page 27) — Place the correct symbol <, > or =.
   The crocodile's mouth always opens towards the greater number.
   ============================================================ */
const SYMS  = ['&lt;', '&gt;', '='];
const NAMES = ['is less than', 'is greater than', 'is equal to'];

function bigger(a, b){
  const correct = a < b ? 0 : a > b ? 1 : 2;
  let opts, gap, croc;

  function why(){
    const da = String(a).length, db = String(b).length;
    if(da !== db) return `${da > db ? a : b} has more digits, so it is the greater one.`;
    for(let i = 0; i < da; i++){
      if(String(a)[i] !== String(b)[i]){
        return `Same length — compare from the left: the digits first differ at ${String(a)[i]} and ${String(b)[i]}.`;
      }
    }
    return 'Every digit matches, so the two numbers are equal.';
  }

  return {
    prompt: 'Which symbol goes in the middle?',
    hint: '',
    render(stage, ready, saved){
      croc = document.createElement('div');
      croc.className = 'croc';
      /* jaws hinge on the left and open to the right — that is the "<" shape.
         Flipping the whole thing turns it into ">". */
      croc.innerHTML = `
        <svg viewBox="0 0 64 46" aria-hidden="true">
          <path class="jaw" d="M6 23 L60 3 L60 19 Z"/>
          <path class="jaw" d="M6 23 L60 43 L60 27 Z"/>
          <path class="teeth" d="M22 17 L26 21 L30 15 L34 20 L38 13 L42 19 L46 12 L50 18 L54 10 L58 17 L58 19 L22 19 Z"/>
          <path class="teeth" d="M22 29 L26 25 L30 31 L34 26 L38 33 L42 27 L46 34 L50 28 L54 36 L58 29 L58 27 L22 27 Z"/>
          <circle class="eye" cx="17" cy="18" r="2.6"/>
        </svg>`;
      stage.appendChild(croc);

      const duel = document.createElement('div');
      duel.className = 'duel';
      duel.innerHTML = `<span class="n">${a}</span><span class="gap">?</span><span class="n">${b}</span>`;
      stage.appendChild(duel);
      gap = duel.querySelector('.gap');

      opts = Quiz.options(stage, SYMS, i => {
        gap.innerHTML = SYMS[i];
        gap.classList.add('filled');
        croc.classList.remove('face-left', 'face-right');
        croc.classList.add(i === 1 ? 'face-right' : i === 0 ? 'face-left' : '');
        ready();
      }, { cls:'sym', saved });

      if(saved !== null && saved !== undefined){
        gap.innerHTML = SYMS[saved];
        gap.classList.add('filled');
      }
    },
    check(){
      const ok = opts.value() === correct;
      opts.mark(correct);
      gap.innerHTML = SYMS[correct];
      return { ok, answer: opts.value(),
        msg: ok ? `Right — ${a} ${NAMES[correct]} ${b}.`
                : `${a} ${NAMES[correct]} ${b}. ${why()}` };
    }
  };
}

Quiz.start({
  kicker: 'Comparing and Arranging Numbers · Question 1',
  title: 'Which one is bigger?',
  questions: [
    bigger(59843, 124587),
    bigger(909090, 900909),
    bigger(765004, 756004)
  ]
});
