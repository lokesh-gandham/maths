/* ============================================================
   1.1 Q2 (page 16) — Write the number formed.
   The place-value parts arrive shuffled; rebuild the number.
   ============================================================ */
const PLACES = { ones:1, tens:10, hundreds:100, thousands:1000 };

/* parts: [count, place] pairs exactly in the order the book prints them */
function formedQ(parts){
  const answer = parts.reduce((sum, p) => sum + p[0] * PLACES[p[1]], 0);
  let field;

  function partsRow(stage){
    const row = document.createElement('div');
    row.className = 'wnf-parts';
    row.innerHTML = parts.map(p =>
      `<span class="wnf-part"><span class="wnf-count">${p[0]}</span>${p[1]}</span>`).join('');
    stage.appendChild(row);
  }

  function answerBox(stage, value, locked){
    const wrap = document.createElement('div');
    wrap.className = 'wnf-answer';
    wrap.innerHTML = `
      <span class="wnf-eq">=</span>
      <input type="text" inputmode="numeric" class="entry wnf-entry"
             value="${value}" placeholder="?" autocomplete="off" ${locked ? 'disabled' : ''}>`;
    stage.appendChild(wrap);
    return wrap.querySelector('.wnf-entry');
  }

  return {
    prompt: 'Write the number formed.',
    hint: 'Put every part in its own place, then read the whole number.',
    render(stage, ready, saved){
      partsRow(stage);
      field = answerBox(stage, saved || '', !!saved);
      if(saved) return;
      field.addEventListener('input', () => { if(field.value.trim()) ready(); });
      setTimeout(() => field.focus(), 30);
    },
    renderLocked(stage, saved){
      partsRow(stage);
      answerBox(stage, saved || answer, true);
    },
    check(){
      const got = field.value.trim();
      const ok = /^\d+$/.test(got) && +got === answer;
      field.classList.add(ok ? 'right' : 'wrong');
      field.disabled = true;
      const spell = parts.slice()
        .sort((a, b) => PLACES[b[1]] - PLACES[a[1]])
        .map(p => `${p[0]} ${p[1]}`).join(' + ');
      return { ok, answer: got,
        msg: ok ? `Yes — ${spell} makes ${answer}.`
                : `Line them up: ${spell} makes ${answer}.` };
    }
  };
}

Quiz.start({
  kicker: 'Count by Ten Thousands · Question 2',
  title: 'Write the number formed',
  questions: [
    formedQ([[6,'ones'], [3,'hundreds'], [4,'thousands']]),
    formedQ([[7,'hundreds'], [9,'tens'], [5,'ones'], [1,'thousands']])
  ]
});
