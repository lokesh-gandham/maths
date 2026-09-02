/* ============================================================
   Launch Pad Q6 — compare, order and form numbers.
   Questions for this exercise only; the shared engine is quiz.js.
   ============================================================ */
const SYMS = ['&lt;', '&gt;', '='];

/* ---- 1. pick the symbol ---- */
function symbolQ(a, b){
  const correct = a < b ? 0 : a > b ? 1 : 2;
  let opts, gap;
  return {
    prompt: '',
    render(stage, ready, saved){
      const title = document.createElement('div');
      title.className = 'compare-title';
      title.textContent = 'Which symbol goes in the middle?';
      stage.appendChild(title);

      const duel = document.createElement('div');
      duel.className = 'duel';
      duel.innerHTML = `<span class="n">${a}</span><span class="gap" id="gap">?</span><span class="n">${b}</span>`;
      stage.appendChild(duel);
      gap = duel.querySelector('#gap');
      opts = Quiz.options(stage, SYMS, i => { gap.innerHTML = SYMS[i]; gap.classList.add('filled'); ready(); }, {cls:'sym', saved});
      if(saved !== null && saved !== undefined){
        gap.innerHTML = SYMS[saved];
        gap.classList.add('filled');
      }
    },
    /* revisited: the answer is shown and marked, nothing is clickable */
    renderLocked(stage, saved){
      const title = document.createElement('div');
      title.className = 'compare-title';
      title.textContent = 'Which symbol goes in the middle?';
      stage.appendChild(title);

      const duel = document.createElement('div');
      duel.className = 'duel';
      duel.innerHTML = `<span class="n">${a}</span><span class="gap filled">${SYMS[correct]}</span><span class="n">${b}</span>`;
      stage.appendChild(duel);

      Quiz.options(stage, SYMS, () => {}, {cls:'sym', saved}).mark(correct);
    },
    check(){
      const ok = opts.value() === correct;
      opts.mark(correct);
      gap.innerHTML = SYMS[correct];
      return { ok, answer: opts.value(),
        msg: ok ? `Right — ${a} ${SYMS[correct]} ${b}.`
                : `It is ${a} ${SYMS[correct]} ${b}.` };
    }
  };
}

/* ---- 2. tap the numbers into order ---- */
function orderQ(nums, dir){
  const want = nums.slice().sort((x, y) => dir === 'asc' ? x - y : y - x);
  let picked = [], slotsEl, chipsEl;
  return {
    prompt: `Tap the numbers in <strong>${dir === 'asc' ? 'ascending' : 'descending'}</strong> order.`,
    hint: '',
    render(stage, ready, saved){
      picked = saved ? saved.slice() : [];

      slotsEl = document.createElement('div');
      slotsEl.className = 'slots';
      stage.appendChild(slotsEl);

      chipsEl = document.createElement('div');
      chipsEl.className = 'chips';
      chipsEl.innerHTML = nums.map((n, i) =>
        `<button class="numchip" data-i="${i}">${n}</button>`).join('');
      stage.appendChild(chipsEl);

      const undo = document.createElement('button');
      undo.className = 'btn ghost';
      undo.textContent = 'Undo';
      undo.style.fontSize = '.5rem';
      stage.appendChild(undo);

      function paint(){
        slotsEl.innerHTML = nums.map((_, k) =>
          `<span class="slot${picked[k] !== undefined ? ' filled' : ''}">${
            picked[k] !== undefined ? nums[picked[k]] : '&nbsp;'}</span>`).join('');
        chipsEl.querySelectorAll('.numchip').forEach((c, i) => {
          const used = picked.includes(i);
          c.classList.toggle('used', used);
          c.disabled = used;
        });
        if(picked.length === nums.length) ready();
      }
      paint();

      chipsEl.addEventListener('click', e => {
        const b = e.target.closest('.numchip');
        if(!b || b.disabled) return;
        picked.push(+b.dataset.i);
        paint();
      });
      undo.addEventListener('click', () => { picked.pop(); paint(); });
    },
    renderLocked(stage, saved){
      const chosen = (saved || []).map(i => nums[i]);
      const box = document.createElement('div');
      box.className = 'slots';
      box.innerHTML = want.map((w, k) =>
        `<span class="slot filled ${chosen[k] === w ? 'right' : 'wrong'}">${
          chosen[k] !== undefined ? chosen[k] : '&nbsp;'}</span>`).join('');
      stage.appendChild(box);
    },
    check(){
      const got = picked.map(i => nums[i]);
      const ok = got.every((v, k) => v === want[k]);
      slotsEl.querySelectorAll('.slot').forEach((s, k) => {
        s.classList.add(got[k] === want[k] ? 'right' : 'wrong');
      });
      return { ok, answer: picked.slice(), msg: ok ? 'That is the right order.'
                           : `The correct order is ${want.join(', ')}.` };
    }
  };
}

/* ---- 3. build the smallest and greatest number ---- */
function formQ(digits){
  const asc = digits.slice().sort((a,b) => a - b);
  if(asc[0] === 0){
    const firstNonZero = asc.findIndex(d => d !== 0);
    asc.splice(0, 0, asc.splice(firstNonZero, 1)[0]);
  }
  const small = asc.join('');
  const great = digits.slice().sort((a,b) => b - a).join('');
  return {
    prompt: '',
    hint: '',
    render(stage, ready, saved){
      const wrap = document.createElement('div');
      wrap.className = 'form-stage';

      const title = document.createElement('div');
      title.className = 'compare-title';
      title.innerHTML = `Use the digits <strong>${digits.join(', ')}</strong> once each.`;
      wrap.appendChild(title);

      const smPicked = saved ? saved.smPicked.slice() : [];
      const grPicked = saved ? saved.grPicked.slice() : [];

      function makeRow(label, rowKey, picked){
        const row = document.createElement('div');
        row.className = 'form-row';
        const lbl = document.createElement('div');
        lbl.className = 'form-label';
        lbl.textContent = label;
        if(rowKey === 'small'){ lbl.classList.add('active'); row.classList.add('active'); }
        lbl.addEventListener('click', () => {
          wrap.querySelectorAll('.form-label').forEach(l => l.classList.remove('active'));
          wrap.querySelectorAll('.form-row').forEach(r => r.classList.remove('active'));
          lbl.classList.add('active');
          row.classList.add('active');
          wrap.querySelectorAll('.form-chips').forEach(c => c.style.display = 'none');
          rowChips.style.display = 'flex';
        });

        const slots = document.createElement('div');
        slots.className = 'form-slots';
        for(let i = 0; i < digits.length; i++){
          const slot = document.createElement('div');
          slot.className = 'form-slot';
          slots.appendChild(slot);
        }
        row.append(lbl, slots);

        const chips = document.createElement('div');
        chips.className = 'form-chips';
        chips.style.display = rowKey === 'small' ? 'flex' : 'none';
        digits.forEach((d, i) => {
          const btn = document.createElement('button');
          btn.className = 'form-chip';
          btn.textContent = d;
          btn.dataset.i = i;
          chips.appendChild(btn);
        });

        function paint(){
          slots.querySelectorAll('.form-slot').forEach((s, i) => {
            s.textContent = picked[i] !== undefined ? digits[picked[i]] : '';
            s.classList.toggle('filled', picked[i] !== undefined);
          });
          /* highlight next empty slot */
          const nextIdx = picked.length < digits.length ? picked.length : -1;
          slots.querySelectorAll('.form-slot').forEach((s, i) => {
            s.classList.toggle('next', i === nextIdx && picked.length < digits.length);
          });
          chips.querySelectorAll('.form-chip').forEach((c, i) => {
            const used = picked.includes(i);
            c.classList.toggle('used', used);
            c.disabled = used;
          });
        }

        chips.addEventListener('click', e => {
          const b = e.target.closest('.form-chip');
          if(!b || b.disabled) return;
          if(picked.length >= digits.length) return;
          picked.push(+b.dataset.i);
          paint();
          /* Auto-switch to other row when this row is full, but only if other row isn't full */
          if(picked.length === digits.length){
            const otherRow = rowKey === 'small' ? gr : sm;
            const otherPicked = rowKey === 'small' ? grPicked : smPicked;
            if(otherPicked.length < digits.length){
              const otherLabel = wrap.querySelectorAll('.form-label')[rowKey === 'small' ? 1 : 0];
              wrap.querySelectorAll('.form-label').forEach(l => l.classList.remove('active'));
              wrap.querySelectorAll('.form-row').forEach(r => r.classList.remove('active'));
              otherLabel.classList.add('active');
              otherRow.row.classList.add('active');
              wrap.querySelectorAll('.form-chips').forEach(c => c.style.display = 'none');
              otherRow.chips.style.display = 'flex';
            } else {
              /* both full — hide all chips */
              wrap.querySelectorAll('.form-chips').forEach(c => c.style.display = 'none');
            }
          }
          if(smPicked.length === digits.length && grPicked.length === digits.length) ready();
        });

        return { row, chips, paint };
      }

      const sm = makeRow('Smallest', 'small', smPicked);
      const gr = makeRow('Greatest', 'great', grPicked);
      wrap.appendChild(sm.row);
      wrap.appendChild(gr.row);
      wrap.appendChild(sm.chips);
      wrap.appendChild(gr.chips);

      const undo = document.createElement('button');
      undo.className = 'btn ghost form-undo';
      undo.textContent = 'Undo';
      wrap.appendChild(undo);

      stage.appendChild(wrap);

      const allChips = [sm.chips, gr.chips];
      undo.addEventListener('click', () => {
        const active = sm.chips.style.display !== 'none' ? smPicked : grPicked;
        if(active.length) active.pop();
        sm.paint(); gr.paint();
      });

      sm.paint(); gr.paint();

      /* If revisiting with saved answers, hide chips and undo */
      if(saved){
        wrap.querySelectorAll('.form-chips').forEach(c => c.style.display = 'none');
        undo.style.display = 'none';
      }
    },
    renderLocked(stage, saved){
      this.render(stage, () => {}, saved);
    },
    check(){
      const smSlots = document.querySelectorAll('.page-compare .form-row:nth-child(2) .form-slot');
      const grSlots = document.querySelectorAll('.page-compare .form-row:nth-child(3) .form-slot');
      let sGot = '', gGot = '';
      smSlots.forEach(s => sGot += s.textContent);
      grSlots.forEach(s => gGot += s.textContent);
      const okS = sGot === small, okG = gGot === great;
      smSlots.forEach((s, i) => s.classList.add(okS ? 'right' : (s.textContent === small[i] ? 'right' : 'wrong')));
      grSlots.forEach((s, i) => s.classList.add(okG ? 'right' : (s.textContent === great[i] ? 'right' : 'wrong')));
      return { ok: okS && okG, answer: {smPicked: smPicked.slice(), grPicked: grPicked.slice()},
        msg: (okS && okG) ? `Both right — ${small} and ${great}.` : `Smallest is ${small} and greatest is ${great}.` };
    }
  };
}

Quiz.start({
  kicker: 'Launch Pad · Question 6',
  title: 'Compare and order',
  questions: [
    symbolQ(848, 884),
    symbolQ(7259, 7095),
    orderQ([1437, 1374, 3471, 4713], 'asc'),
    orderQ([3204, 7420, 4203, 2430], 'desc'),
    formQ([7, 6, 9, 3]),
    formQ([3, 0, 2, 8])
  ]
});
