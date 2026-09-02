/* ============================================================
   1.2 Q4 (page 19) — number names to numerals, with the commas
   of the Indian system dropped in for you as you tap the digits.
   ============================================================ */

/* Indian grouping: last three digits together, then pairs.
   306024 -> [1,2,3] group sizes read left to right -> 3,06,024 */
function indianGroups(len){
  const g = [];
  let left = len - 3;
  while(left > 2){ g.push(2); left -= 2; }
  if(left > 0) g.push(left);
  g.reverse();
  if(len > 3) g.push(3); else g.push(len);
  return g;
}

function nameQ(words, digits){
  const groups = indianGroups(digits.length);
  const pretty = (function(){
    let out = [], k = 0;
    groups.forEach(n => { out.push(digits.slice(k, k + n)); k += n; });
    return out.join(',');
  })();
  let typed = [], slotsEl, ready0;

  function board(stage, value, locked){
    const card = document.createElement('div');
    card.className = 'nnn-card';
    card.innerHTML = `<span class="nnn-quote">&ldquo;</span>${words}<span class="nnn-quote">&rdquo;</span>`;
    stage.appendChild(card);

    slotsEl = document.createElement('div');
    slotsEl.className = 'nnn-strip';
    stage.appendChild(slotsEl);
    typed = value.split('');
    paint();

    if(locked) return;

    const pad = document.createElement('div');
    pad.className = 'nnn-pad';
    pad.innerHTML =
      [1,2,3,4,5,6,7,8,9,0].map(d => `<button class="nnn-key" data-d="${d}">${d}</button>`).join('') +
      `<button class="nnn-key back" data-back="1" aria-label="Delete">&#9003;</button>`;
    stage.appendChild(pad);

    pad.addEventListener('click', e => {
      const b = e.target.closest('.nnn-key');
      if(!b) return;
      if(b.dataset.back) typed.pop();
      else if(typed.length < digits.length) typed.push(b.dataset.d);
      paint();
      if(typed.length === digits.length) ready0();
    });
  }

  function paint(){
    let html = '', k = 0;
    groups.forEach((n, gi) => {
      if(gi) html += `<span class="nnn-comma">,</span>`;
      for(let i = 0; i < n; i++, k++){
        const v = typed[k];
        html += `<span class="nnn-slot${v !== undefined ? ' filled' : ''}${
          k === typed.length ? ' next' : ''}">${v !== undefined ? v : ''}</span>`;
      }
    });
    slotsEl.innerHTML = html;
  }

  return {
    prompt: 'Tap the digits to write this number name in numerals.',
    hint: '',
    render(stage, ready, saved){
      ready0 = ready;
      board(stage, saved || '', !!saved);
    },
    renderLocked(stage, saved){
      board(stage, saved || digits, true);
    },
    check(){
      const got = typed.join('');
      const ok = got === digits;
      slotsEl.querySelectorAll('.nnn-slot').forEach((s, i) => {
        s.classList.remove('next');
        s.classList.add(got[i] === digits[i] ? 'right' : 'wrong');
      });
      return { ok, answer: got,
        msg: ok ? `Spot on — that is ${pretty}.`
                : `Not yet — it is written ${pretty}.` };
    }
  };
}

Quiz.start({
  kicker: 'Numbers up to Lakhs · Question 4',
  title: 'Number names to numerals',
  questions: [
    nameQ('Fifty eight thousand three hundred twelve', '58312'),
    nameQ('Three lakh six thousand twenty four', '306024'),
    nameQ('Ninety thousand seven hundred thirty five', '90735')
  ]
});
