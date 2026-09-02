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
    render(stage, ready, saved){
      Quiz.abacus(stage, NAMES, { counts, editable:false });

      const wrap = document.createElement('div');
      wrap.className = 'inline-answer';
      const val = saved || '';
      const disabled = saved ? 'disabled' : '';
      wrap.innerHTML = `
        <label>Your Answer</label>
        <input type="text" inputmode="numeric" class="entry" value="${val}" placeholder="0000" autocomplete="off" ${disabled}>
      `;
      stage.appendChild(wrap);
      field = wrap.querySelector('.entry');
      if(!saved){
        field.addEventListener('input', () => { if(field.value.trim().length > 0) ready(); });
        setTimeout(() => field.focus(), 30);
      }
    },
    renderLocked(stage, saved){
      Quiz.abacus(stage, NAMES, { counts, editable:false });

      const wrap = document.createElement('div');
      wrap.className = 'inline-answer';
      const val = saved || answer;
      wrap.innerHTML = `
        <label>Your Answer</label>
        <input type="text" inputmode="numeric" class="entry" value="${val}" disabled>
      `;
      stage.appendChild(wrap);
    },
    check(){
      const ok = +field.value === +answer;
      field.classList.add(ok ? 'right' : 'wrong');
      field.disabled = true;
      const spell = counts.map((c,i)=>`${c} ${NAMES[i]}`).join(' + ');
      return { ok, answer: field.value.trim(),
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
