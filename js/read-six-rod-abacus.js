/* ============================================================
   1.2 Q3 (page 19) — count the blocks in the place value tubes,
   then write the number in numerals AND in words.
   ============================================================ */
const NAMES = ['L','TTh','Th','H','T','O'];
const COUNTS = [4,3,1,6,3,1];
const NUMERALS = '431631';
const WORDS = 'Four lakh thirty one thousand six hundred thirty one';

function tidyName(s){
  return s.toLowerCase()
          .replace(/[,\-]/g, ' ')
          .replace(/\band\b/g, ' ')
          .replace(/\blakhs\b/g, 'lakh')
          .replace(/\s+/g, ' ')
          .trim();
}

function readQ(){
  let numField, wordField;

  function answers(stage, num, word, locked){
    const rail = document.createElement('div');
    rail.className = 'inline-answer r6a-answers';
    rail.innerHTML = `
      <label>In numerals</label>
      <input type="text" inputmode="numeric" class="entry" value="${num}"
             placeholder="? ? ? ? ? ?" autocomplete="off" ${locked ? 'disabled' : ''}>
      <label>In words</label>
      <input type="text" class="name-input" value="${word}"
             placeholder="Write it in words" autocomplete="off" ${locked ? 'disabled' : ''}>`;
    stage.appendChild(rail);
    return [rail.querySelector('.entry'), rail.querySelector('.name-input')];
  }

  return {
    prompt: 'Count the blocks and write the number — in numerals and in words.',
    hint: '',
    render(stage, ready, saved){
      Quiz.tubes(stage, NAMES, { counts: COUNTS, editable:false });
      const vals = saved || { num:'', word:'' };
      [numField, wordField] = answers(stage, vals.num, vals.word, !!saved);
      if(saved) return;
      const check = () => {
        if(numField.value.trim() && wordField.value.trim().length > 3) ready();
      };
      numField.addEventListener('input', check);
      wordField.addEventListener('input', check);
      setTimeout(() => numField.focus(), 30);
    },
    renderLocked(stage, saved){
      Quiz.tubes(stage, NAMES, { counts: COUNTS, editable:false });
      answers(stage, saved ? saved.num : NUMERALS, saved ? saved.word : WORDS, true);
    },
    check(){
      const numOk = numField.value.trim().replace(/,/g, '') === NUMERALS;
      numField.classList.add(numOk ? 'right' : 'wrong');
      if(!numOk){
        const spell = COUNTS.map((c, i) => `${c} ${NAMES[i]}`).join(' + ');
        return { ok:false, msg:`Count again: ${spell} makes ${NUMERALS}.` };
      }
      const wordOk = tidyName(wordField.value) === tidyName(WORDS);
      wordField.classList.add(wordOk ? 'right' : 'wrong');
      if(!wordOk) return { ok:false, msg:`${NUMERALS} is right. In words it is "${WORDS}".` };

      return { ok:true, answer:{ num:numField.value.trim(), word:wordField.value.trim() },
               msg:`Perfect — ${NUMERALS} is ${WORDS.toLowerCase()}.` };
    }
  };
}

Quiz.start({
  kicker: 'Numbers up to Lakhs · Question 3',
  title: 'Read the place value tubes',
  questions: [ readQ() ]
});
