/* ============================================================
   1.5 Q5 (page 29) — form the smallest and the greatest 6 digit
   number from eight digits, without repeating a digit.
   Two of the eight are always left over — that is the challenge.
   ============================================================ */
function smallestOf(digits, slots){
  const d = digits.slice().sort((a, b) => a - b).slice(0, slots);
  if(d[0] === 0){
    const first = d.findIndex(x => x !== 0);
    if(first > 0) d.unshift(d.splice(first, 1)[0]);
  }
  return d.join('');
}
function greatestOf(digits, slots){
  return digits.slice().sort((a, b) => b - a).slice(0, slots).join('');
}

const ROWS = [
  { key:'small', label:'Smallest' },
  { key:'great', label:'Greatest' }
];

function pickSixQ(digits){
  const SLOTS = 6;
  const want = { small: smallestOf(digits, SLOTS), great: greatestOf(digits, SLOTS) };
  let builder;

  function build(stage, saved, locked, ready){
    const lead = document.createElement('div');
    lead.className = 'sdc-lead';
    lead.innerHTML =
      `<span class="sdc-tag">Choose 6 of these 8</span>
       <span class="sdc-digits">${digits.join('  ')}</span>`;
    stage.appendChild(lead);

    builder = Quiz.digitBuilder(stage, {
      digits, slots: SLOTS, rows: ROWS, saved, locked,
      onComplete: ready || null
    });
  }

  return {
    prompt: 'Form the smallest and the greatest 6 digit number.',
    hint: 'Two digits will be left out. For the smallest, leave out the big ones.',
    render(stage, ready, saved){ build(stage, saved, !!saved, ready); },
    renderLocked(stage, saved){
      const done = saved || {
        small: want.small.split('').map(ch => digits.indexOf(+ch)),
        great: want.great.split('').map(ch => digits.indexOf(+ch))
      };
      build(stage, done, true, null);
    },
    check(){
      const got = builder.values();
      builder.mark(want);
      const okS = got.small === want.small;
      const okG = got.great === want.great;
      if(okS && okG) return { ok:true, answer: builder.picks(),
        msg:`Champion — ${want.small} and ${want.great}.` };
      return { ok:false, answer:null,
        msg:`Smallest is ${want.small} and greatest is ${want.great}.` };
    }
  };
}

Quiz.start({
  kicker: 'Comparing and Arranging Numbers · Question 5',
  title: 'Six digit challenge',
  questions: [
    pickSixQ([4, 0, 9, 8, 1, 6, 3, 5]),
    pickSixQ([2, 8, 7, 5, 4, 1, 9, 0])
  ]
});
