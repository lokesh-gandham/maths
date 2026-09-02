/* ============================================================
   1.8 Q4 (page 37) — write the Roman numerals in Hindu Arabic
   numerals. Tap each letter to see what it is worth, then answer.
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

/* how the numeral breaks down, e.g. XLIX -> "XL (40) + IX (9)" */
function breakdown(s){
  const parts = [];
  for(let i = 0; i < s.length; i++){
    const v = VALUE[s[i]], next = VALUE[s[i + 1]];
    if(next && next > v){ parts.push(`${s[i]}${s[i + 1]} (${next - v})`); i++; }
    else parts.push(`${s[i]} (${v})`);
  }
  return parts.join(' + ');
}

function decodeQ(numeral){
  const answer = fromRoman(numeral);
  let field;

  function board(stage, value, locked){
    const tiles = document.createElement('div');
    tiles.className = 'rtn-tiles';
    tiles.innerHTML = numeral.split('').map(ch =>
      `<span class="rtn-tile"><span class="rtn-ch">${ch}</span><span class="rtn-v">${VALUE[ch]}</span></span>`).join('');
    stage.appendChild(tiles);

    const arrow = document.createElement('div');
    arrow.className = 'rtn-arrow';
    arrow.innerHTML = '&darr;';
    stage.appendChild(arrow);

    const wrap = document.createElement('div');
    wrap.className = 'rtn-answer';
    wrap.innerHTML = `<input type="text" inputmode="numeric" class="rtn-input" value="${value}"
                        placeholder="?" autocomplete="off" ${locked ? 'disabled' : ''}>`;
    stage.appendChild(wrap);
    return wrap.querySelector('.rtn-input');
  }

  return {
    prompt: `What is <strong>${numeral}</strong> in numbers?`,
    hint: '',
    render(stage, ready, saved){
      field = board(stage, saved || '', !!saved);
      if(saved) return;
      field.addEventListener('input', () => { if(field.value.trim()) ready(); });
      setTimeout(() => field.focus(), 30);
    },
    renderLocked(stage, saved){ board(stage, saved || answer, true); },
    check(){
      const ok = field.value.trim() !== '' && +field.value.trim() === answer;
      field.classList.add(ok ? 'right' : 'wrong');
      field.disabled = true;
      return { ok, answer: field.value.trim(),
        msg: ok ? `Yes — ${breakdown(numeral)} = ${answer}.`
                : `${numeral} is ${breakdown(numeral)} = ${answer}.` };
    }
  };
}

Quiz.start({
  kicker: 'Roman Numerals · Question 4',
  title: 'Roman to number',
  questions: ['XXIII', 'LXIX', 'XLIX', 'LXXXVIII'].map(decodeQ)
});
