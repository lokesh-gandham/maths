/* ============================================================
   Launch Pad Q3 — read the beads on the abacus.
   Questions for this exercise only; the shared engine is quiz.js.
   ============================================================ */
const NAMES = ['Th','H','T','O'];

function readQ(counts){
  const answer = counts.join('');
  let field;
  return {
    prompt: `How many beads are on the abacus? Write the number.`,
    hint: 'Read the rods from the left: thousands, hundreds, tens, ones.',
    render(stage, ready){
      Quiz.abacus(stage, NAMES, { counts, editable:false });

      const wrap = document.createElement('div');
      wrap.className = 'inline-answer';
      wrap.innerHTML = `
        <label>Your Answer</label>
        <input type="text" inputmode="numeric" class="entry" placeholder="0000" autocomplete="off">
      `;
      stage.appendChild(wrap);
      field = wrap.querySelector('.entry');
      field.addEventListener('input', () => { if(field.value.trim().length > 0) ready(); });
      setTimeout(() => field.focus(), 30);
      ready();
    },
    renderLocked(stage){
      Quiz.abacus(stage, NAMES, { counts, editable:false });

      const wrap = document.createElement('div');
      wrap.className = 'inline-answer';
      wrap.innerHTML = `
        <label>Your Answer</label>
        <input type="text" inputmode="numeric" class="entry" value="${answer}" disabled>
      `;
      stage.appendChild(wrap);
    },
    check(){
      const ok = +field.value === +answer;
      field.classList.add(ok ? 'right' : 'wrong');
      field.disabled = true;
      const spell = counts.map((c,i)=>`${c} ${NAMES[i]}`).join(' + ');
      return { ok,
        msg: ok ? `Yes — ${spell} makes ${+answer}.`
                : `Count again: ${spell} makes ${+answer}.` };
    }
  };
}

Quiz.start({
  kicker: 'Launch Pad · Question 3',
  title: 'Read the abacus',
  questions: [
    readQ([3,1,4,4]),
    readQ([5,0,7,0])
  ]
});
