/* ============================================================
   1.6 Q1 (page 30) — predecessor and successor.
   A little number train: one carriage back, one carriage forward.
   ============================================================ */
function trainQ(n){
  const before = n - 1, after = n + 1;
  let bField, aField;

  function build(stage, saved, locked){
    const train = document.createElement('div');
    train.className = 'baa-train';
    const b = saved ? saved.before : (locked ? before : '');
    const a = saved ? saved.after  : (locked ? after  : '');
    train.innerHTML = `
      <div class="baa-car baa-back">
        <span class="baa-tag">Predecessor</span>
        <input type="text" inputmode="numeric" class="baa-input" value="${b}"
               placeholder="?" autocomplete="off" ${locked ? 'disabled' : ''}>
        <span class="baa-step">&minus;1</span>
      </div>
      <div class="baa-car baa-now">
        <span class="baa-tag">Number</span>
        <span class="baa-num">${n}</span>
      </div>
      <div class="baa-car baa-fwd">
        <span class="baa-tag">Successor</span>
        <input type="text" inputmode="numeric" class="baa-input" value="${a}"
               placeholder="?" autocomplete="off" ${locked ? 'disabled' : ''}>
        <span class="baa-step">+1</span>
      </div>`;
    stage.appendChild(train);
    const fields = train.querySelectorAll('.baa-input');
    bField = fields[0];
    aField = fields[1];
  }

  return {
    prompt: 'Write the number just before and just after.',
    hint: '',
    render(stage, ready, saved){
      build(stage, saved, !!saved);
      if(saved) return;
      const gate = () => {
        if(bField.value.trim() && aField.value.trim()) ready();
      };
      bField.addEventListener('input', gate);
      aField.addEventListener('input', gate);
      setTimeout(() => bField.focus(), 30);
    },
    renderLocked(stage, saved){ build(stage, saved, true); },
    check(){
      const okB = +bField.value.trim() === before && bField.value.trim() !== '';
      const okA = +aField.value.trim() === after  && aField.value.trim() !== '';
      bField.classList.add(okB ? 'right' : 'wrong');
      aField.classList.add(okA ? 'right' : 'wrong');
      bField.disabled = aField.disabled = true;
      const ok = okB && okA;
      return { ok, answer: ok ? { before: bField.value.trim(), after: aField.value.trim() } : null,
        msg: ok ? `Yes — ${before}, ${n}, ${after}.`
                : `${n} &minus; 1 = ${before} and ${n} + 1 = ${after}.` };
    }
  };
}

Quiz.start({
  kicker: 'Predecessor and Successor · Question 1',
  title: 'Before and after',
  questions: [65378, 109089, 76490, 852431, 900897].map(trainQ)
});
