/* ============================================================
   Launch Pad Q2 — build a number on the abacus.
   Questions for this exercise only; the shared engine is quiz.js.
   ============================================================ */
const NAMES = ['Th','H','T','O'];

/* "Make this number" card beside a live "You built" card */
function targetRow(stage, target, built){
  const row = document.createElement('div');
  row.className = 'target-row';
  row.innerHTML = `
    <div class="target"><span class="lbl">Make this number</span><span class="num">${target}</span></div>
    <div class="built"><span class="lbl">You built</span><span class="num">${built}</span></div>`;
  stage.appendChild(row);
  const val = row.querySelector('.built .num');
  return { set(v){ val.textContent = v; } };
}

/* build the given number by putting beads on the rods AND write the number name */
function buildAndNameQ(target, choices, correct){
  let widget, out, nameField;
  return {
    prompt: 'Build the number shown, then write its name in words.',
    hint: 'Tap a rod to drop a bead on it. Use &minus; underneath to take one off.',
    render(stage, ready){
      /* The number to build is on screen at all times, next to a live
         read-out of what the child has built, so the question text never
         has to be re-read. */
      out = targetRow(stage, target, '0000');
      widget = Quiz.abacus(stage, NAMES, {
        onChange: v => { out.set(v); ready(); }
      });

      const nameWrap = document.createElement('div');
      nameWrap.className = 'inline-answer';
      nameWrap.innerHTML = `
        <label>Number Name</label>
        <input type="text" class="name-input" placeholder="Write it in words" autocomplete="off">
      `;
      stage.appendChild(nameWrap);
      nameField = nameWrap.querySelector('.name-input');
      nameField.addEventListener('input', () => { if(nameField.value.trim().length > 3) ready(); });
      ready();
    },
    renderLocked(stage){
      out = targetRow(stage, target, target);
      widget = Quiz.abacus(stage, NAMES, { counts: target.split('').map(Number), editable:false });

      const nameWrap = document.createElement('div');
      nameWrap.className = 'inline-answer';
      nameWrap.innerHTML = `
        <label>Number Name</label>
        <input type="text" class="name-input" value="${choices[correct]}" disabled>
      `;
      stage.appendChild(nameWrap);
    },
    check(){
      const got = widget.value();
      const abacusOk = +got === +target;
      const typed = nameField.value.trim().toLowerCase();
      const correctName = choices[correct].toLowerCase();
      const nameOk = typed === correctName;

      if(!abacusOk) return {
        ok: false,
        msg: `Build ${target} on the abacus first.`
      };
      if(!nameOk) return {
        ok: false,
        msg: `The abacus is correct. The number name is "${choices[correct]}".`
      };

      return {
        ok: true,
        msg: `Correct — ${target} is ${choices[correct]}.`
      };
    }
  };
}

Quiz.start({
  kicker: 'Launch Pad · Question 2',
  title: 'Build it on the abacus',
  questions: [
    buildAndNameQ('3786', [
      'Three thousand seven hundred eighty six',
      'Three thousand seven hundred sixty eight',
      'Thirty seven thousand eighty six'
    ], 0),
    buildAndNameQ('5092', [
      'Five thousand nine hundred two',
      'Five thousand ninety two',
      'Fifty thousand ninety two'
    ], 1)
  ]
});
