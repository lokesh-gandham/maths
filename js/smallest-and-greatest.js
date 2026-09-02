/* ============================================================
   1.5 Q4 (page 29) — write the smallest and the greatest number
   formed by the given digits, using each digit only once.
   ============================================================ */

/* Smallest: digits in order, but a leading 0 hops to second place.
   Greatest: digits from biggest to smallest. */
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

function formQ(digits, slots, lead){
  const want = { small: smallestOf(digits, slots), great: greatestOf(digits, slots) };
  let builder;

  const ROWS = [
    { key:'small', label:'Smallest' },
    { key:'great', label:'Greatest' }
  ];

  function build(stage, saved, locked, ready){
    const strip = document.createElement('div');
    strip.className = 'sag-lead';
    strip.innerHTML =
      `<span class="sag-tag">Your digits</span><span class="sag-digits">${lead}</span>`;
    stage.appendChild(strip);

    builder = Quiz.digitBuilder(stage, {
      digits, slots, rows: ROWS, saved, locked,
      onComplete: ready || null
    });
  }

  return {
    prompt: 'Build the smallest and the greatest number, <strong>using each digit only once</strong>.',
    hint: '',
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
      return { ok: okS && okG, answer: builder.picks(),
        msg: (okS && okG)
          ? `Both right — ${want.small} and ${want.great}.`
          : `Smallest is ${want.small} and greatest is ${want.great}.` };
    }
  };
}

Quiz.start({
  kicker: 'Comparing and Arranging Numbers · Question 4',
  title: 'Smallest and greatest',
  questions: [
    formQ([6, 3, 0, 1, 8, 4], 6, '6 &nbsp;3 &nbsp;0 &nbsp;1 &nbsp;8 &nbsp;4'),
    formQ([3, 1, 2, 4, 7], 5, '3 &nbsp;1 &nbsp;2 &nbsp;4 &nbsp;7')
  ]
});
