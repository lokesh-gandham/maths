/* ============================================================
   1.1 Q2 (page 16) — Write the number formed.
   The place-value parts arrive shuffled; rebuild the number.
   ============================================================ */
const PLACES = { ones:1, tens:10, hundreds:100, thousands:1000 };
const CUBE_COLORS = {
  ones:     { face:'#5CC8A5', edge:'#3EA886' },
  tens:     { face:'#7FB6E8', edge:'#5B9BD5' },
  hundreds: { face:'#E8899C', edge:'#D46A80' },
  thousands:{ face:'#A991DE', edge:'#8E72CC' }
};

/* parts: [count, place] pairs exactly in the order the book prints them */
function formedQ(parts){
  const answer = parts.reduce((sum, p) => sum + p[0] * PLACES[p[1]], 0);
  let field;

  function partsRow(stage){
    const row = document.createElement('div');
    row.className = 'wnf-parts';
    row.innerHTML = parts.map(p => {
      const c = CUBE_COLORS[p[1]];
      const cubes = Array.from({length: p[0]}, () =>
        `<span class="wnf-cube" style="--face:${c.face};--edge:${c.edge}"></span>`
      ).reverse().join('');
      return `<span class="wnf-col">
        <span class="wnf-stack">${cubes}</span>
        <span class="wnf-label">${p[1]}</span>
      </span>`;
    }).join('');
    return row;
  }

  function answerBox(value, locked){
    const wrap = document.createElement('div');
    wrap.className = 'wnf-answer-wrap';
    wrap.innerHTML = `
      <span class="wnf-eq">=</span>
      <input type="text" inputmode="numeric" class="entry wnf-entry"
             value="${value}" placeholder="?" autocomplete="off" ${locked ? 'disabled' : ''}>`;
    return wrap;
  }

  return {
    prompt: 'Write the number formed.',
    hint: 'Put every part in its own place, then read the whole number.',
    render(stage, ready, saved){
      const row = document.createElement('div');
      row.className = 'wnf-row';
      row.appendChild(partsRow(stage));
      const ans = answerBox(saved || '', !!saved);
      row.appendChild(ans);
      stage.appendChild(row);
      field = ans.querySelector('.wnf-entry');
      if(saved) return;
      field.addEventListener('input', () => { if(field.value.trim()) ready(); });
      setTimeout(() => field.focus(), 30);
    },
    renderLocked(stage, saved){
      const row = document.createElement('div');
      row.className = 'wnf-row';
      row.appendChild(partsRow(stage));
      const ans = answerBox(saved || answer, true);
      row.appendChild(ans);
      stage.appendChild(row);
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
