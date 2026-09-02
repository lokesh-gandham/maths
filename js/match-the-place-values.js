/* ============================================================
   1.3 Q4 (page 22) — Match the following with place values.

   Two facing columns joined by drawn wires. One number is always
   lit and waiting; tap its partner on the right.
     · right  — the wire locks in, confetti bursts off the card
     · wrong  — both cards shake and nothing sticks
   When the last pair lands the round finishes on its own.
   ============================================================ */
const LEFT = [
  { n:'76549',  key:'tenk7'  },
  { n:'254907', key:'fifty'  },
  { n:'89011',  key:'nine'   },
  { n:'99999',  key:'great5' },
  { n:'402754', key:'lakh4'  },
  { n:'100000', key:'small6' },
  { n:'30875',  key:'eight'  }
];

/* printed a) to g) — deliberately out of order, as in the book */
const RIGHT = [
  { t:'800',                     key:'eight'  },
  { t:'9000',                    key:'nine'   },
  { t:'50000',                   key:'fifty'  },
  { t:'7 ten thousand',          key:'tenk7'  },
  { t:'Greatest 5 digit number', key:'great5' },
  { t:'4 lakh',                  key:'lakh4'  },
  { t:'Smallest 6 digit number', key:'small6' }
];

const WHY = {
  tenk7:  '7 is in the ten thousands place of 76549',
  fifty:  '5 is in the ten thousands place of 254907',
  nine:   '9 is in the thousands place of 89011',
  great5: '99999 is the biggest number with 5 digits',
  lakh4:  '4 is in the lakhs place of 402754',
  small6: '100000 is the first number with 6 digits',
  eight:  '8 is in the hundreds place of 30875'
};

/* one colour per number, so a locked pair reads as a colour, not just a line */
const WIRE = [
  'var(--sky-line)', 'var(--mint-line)', 'var(--peach-line)', 'var(--lilac-line)',
  'var(--rose-line)', 'var(--sun-line)',  'var(--sand-ink)'
];

function matchQ(){
  let locked, sel, boardEl, leftEl, rightEl, wiresEl, ready0, busy;

  const allDone = () => Object.keys(locked).length === LEFT.length;
  const nextFree = () => { const i = LEFT.findIndex((_, k) => locked[k] === undefined); return i < 0 ? null : i; };

  /* --- the curved wires between the two facing dots --- */
  function drawWires(){
    if(!boardEl || !boardEl.isConnected) return;
    const box = boardEl.getBoundingClientRect();
    wiresEl.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    wiresEl.style.width = box.width + 'px';
    wiresEl.style.height = box.height + 'px';

    let out = '';
    Object.keys(locked).forEach(k => {
      const i = +k, j = locked[k];
      const a = leftEl.querySelector(`.mtp-card[data-i="${i}"] .mtp-dot`);
      const b = rightEl.querySelector(`.mtp-card[data-j="${j}"] .mtp-dot`);
      if(!a || !b) return;
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const x1 = ra.left + ra.width / 2 - box.left, y1 = ra.top + ra.height / 2 - box.top;
      const x2 = rb.left + rb.width / 2 - box.left, y2 = rb.top + rb.height / 2 - box.top;
      const bend = Math.max(26, (x2 - x1) * 0.55);
      out += `<path d="M${x1} ${y1} C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}"
                fill="none" stroke="${WIRE[i % WIRE.length]}" stroke-width="3"
                stroke-linecap="round"/>`;
    });
    wiresEl.innerHTML = out;
  }

  /* --- confetti off a card that was just matched --- */
  function burst(card){
    Quiz.confetti({ from: card, count: 44 });
  }

  function shake(i, j){
    const a = leftEl.querySelector(`.mtp-card[data-i="${i}"]`);
    const b = rightEl.querySelector(`.mtp-card[data-j="${j}"]`);
    [a, b].forEach(el => {
      if(!el) return;
      el.classList.add('shake', 'bad');
      setTimeout(() => el.classList.remove('shake', 'bad'), 460);
    });
  }

  function paint(){
    leftEl.innerHTML = LEFT.map((row, i) => {
      const done = locked[i] !== undefined;
      let cls = 'mtp-card mtp-num';
      if(done) cls += ' done w' + (i % WIRE.length);
      else if(sel === i) cls += ' sel';
      return `<button class="${cls}" data-i="${i}"${done ? ' disabled' : ''}>
                <span class="mtp-no">${i + 1}</span>
                <span class="mtp-label">${row.n}</span>
                <span class="mtp-dot"></span>
              </button>`;
    }).join('');

    rightEl.innerHTML = RIGHT.map((row, j) => {
      const owner = Object.keys(locked).find(k => locked[k] === j);
      const done = owner !== undefined;
      const tone = done ? WIRE[+owner % WIRE.length] : null;
      let cls = 'mtp-card mtp-val t' + (j % WIRE.length);
      if(done) cls += ' done';
      return `<button class="${cls}" data-j="${j}"${done ? ' disabled' : ''}>
                <span class="mtp-dot"${tone ? ` style="background:${tone}"` : ''}></span>
                <span class="mtp-label">${row.t}</span>
                ${done ? `<span class="mtp-badge" style="background:${tone}">${+owner + 1}</span>` : ''}
              </button>`;
    }).join('');

    requestAnimationFrame(drawWires);
  }

  function build(stage, saved, isLocked){
    locked = {};
    if(saved) Object.keys(saved).forEach(k => { locked[k] = saved[k]; });
    busy = false;
    sel = isLocked ? null : nextFree();

    boardEl = document.createElement('div');
    boardEl.className = 'mtp-board' + (isLocked ? ' locked' : '');

    leftEl = document.createElement('div');
    leftEl.className = 'mtp-col mtp-left';
    rightEl = document.createElement('div');
    rightEl.className = 'mtp-col mtp-right';

    wiresEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    wiresEl.setAttribute('class', 'mtp-wires');
    wiresEl.setAttribute('aria-hidden', 'true');

    boardEl.append(leftEl, wiresEl, rightEl);
    stage.appendChild(boardEl);

    paint();
    if(isLocked) return;

    leftEl.addEventListener('click', e => {
      const b = e.target.closest('.mtp-card');
      if(!b || b.disabled || busy) return;
      sel = +b.dataset.i;
      paint();
    });

    rightEl.addEventListener('click', e => {
      const b = e.target.closest('.mtp-card');
      if(!b || b.disabled || busy || sel === null) return;
      const j = +b.dataset.j;

      if(RIGHT[j].key !== LEFT[sel].key){ shake(sel, j); Quiz.soundWrong(); return; }

      locked[sel] = j;
      sel = nextFree();
      paint();
      Quiz.soundCorrect();
      requestAnimationFrame(() => { Quiz.confetti({ count: 44, y: window.innerHeight * 0.6 }); });

      if(allDone()){
        busy = true;
        ready0();
        /* let the last burst play, then close the round out */
        setTimeout(() => {
          Quiz._finish();
        }, 900);
      }
    });
  }

  /* wires are measured in pixels, so re-measure when the box moves */
  window.addEventListener('resize', () => { if(wiresEl) drawWires(); });

  return {
    prompt: 'Match every number with the place value that belongs to it.',
    hint: '',
    render(stage, ready, saved){ ready0 = ready; build(stage, saved, !!saved); },
    renderLocked(stage, saved){
      const done = saved || (function(){
        const m = {};
        LEFT.forEach((row, i) => { m[i] = RIGHT.findIndex(r => r.key === row.key); });
        return m;
      })();
      build(stage, done, true);
    },
    check(){
      /* a pair only ever locks in when it is right, so reaching here means
         the whole board is correct */
      return { ok:true, answer: Object.assign({}, locked),
               msg:'Every pair is matched — brilliant!' };
    },
    /* used by the hint line if a child stalls */
    clue(){ return WHY[LEFT[sel || 0].key]; }
  };
}

Quiz.start({
  kicker: 'Face Value and Place Value · Question 4',
  title: 'Match the place values',
  questions: [ matchQ() ]
});
