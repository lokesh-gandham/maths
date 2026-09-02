/* ============================================================
   1.2 Q2 (page 19) — build 490306 and 85430 in the place value
   tubes, then write their number names.
   ============================================================ */

/* Number names are typed by hand, so compare them loosely: case, commas,
   hyphens, the word "and" and doubled spaces should never fail a child. */
function tidyName(s){
  return s.toLowerCase()
          .replace(/[,\-]/g, ' ')
          .replace(/\band\b/g, ' ')
          .replace(/\blakhs\b/g, 'lakh')
          .replace(/\s+/g, ' ')
          .trim();
}

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

function buildAndNameQ(names, target, name){
  const zeros = '0'.repeat(names.length);
  let widget, out, nameField;

  function nameBox(stage, value, locked){
    const wrap = document.createElement('div');
    wrap.className = 'inline-answer';
    wrap.innerHTML = `
      <label>Number Name</label>
      <input type="text" class="name-input" value="${value}"
             placeholder="Write it in words" autocomplete="off" ${locked ? 'disabled' : ''}>`;
    stage.appendChild(wrap);
    return wrap.querySelector('.name-input');
  }

  return {
    prompt: 'Fill the tubes to make the number shown, then write its number name.',
    hint: 'Drag a block into its own tube &mdash; or just tap it. Tap a block in a tube to take it out.',
    render(stage, ready, saved){
      const builtVal = saved ? saved.abacus : zeros;
      out = targetRow(stage, target, builtVal);
      widget = Quiz.tubes(stage, names, {
        counts: saved ? saved.abacus.split('').map(Number) : null,
        onChange: v => { out.set(v); ready(); }
      });
      nameField = nameBox(stage, saved ? saved.name : '', !!saved);
      if(saved) return;
      nameField.addEventListener('input', () => { if(nameField.value.trim().length > 3) ready(); });
    },
    renderLocked(stage, saved){
      const abacusVal = saved ? saved.abacus : target.padStart(names.length, '0');
      out = targetRow(stage, target, abacusVal);
      Quiz.tubes(stage, names, { counts: abacusVal.split('').map(Number), editable:false });
      nameBox(stage, saved ? saved.name : name, true);
    },
    check(){
      const got = widget.value();
      if(+got !== +target) return { ok:false, msg:`Fill the tubes to make ${target} first.` };

      const nameOk = tidyName(nameField.value) === tidyName(name);
      if(!nameOk) return { ok:false, msg:`The tubes are correct. The number name is "${name}".` };

      return { ok:true, answer:{ abacus:got, name:nameField.value.trim() },
               msg:`Correct — ${target} is ${name}.` };
    }
  };
}

Quiz.start({
  kicker: 'Numbers up to Lakhs · Question 2',
  title: 'Fill the place value tubes',
  questions: [
    buildAndNameQ(['L','TTh','Th','H','T','O'], '490306',
      'Four lakh ninety thousand three hundred six'),
    buildAndNameQ(['TTh','Th','H','T','O'], '85430',
      'Eighty five thousand four hundred thirty')
  ]
});
