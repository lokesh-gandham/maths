/* ============================================================
   1.3 Q4 (page 22) — Match the following with place values.
   Tap a number, then tap the card that describes it. Every pair
   locks in with its own colour so the board reads at a glance.
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
  { t:'800',                    key:'eight'  },
  { t:'9000',                   key:'nine'   },
  { t:'50000',                  key:'fifty'  },
  { t:'7 ten thousand',         key:'tenk7'  },
  { t:'Greatest 5 digit number',key:'great5' },
  { t:'4 lakh',                 key:'lakh4'  },
  { t:'Smallest 6 digit number',key:'small6' }
];

const WHY = {
  tenk7:  '7 sits in the ten thousands place of 76549',
  fifty:  '5 sits in the ten thousands place of 254907',
  nine:   '9 sits in the thousands place of 89011',
  great5: '99999 is the biggest number with 5 digits',
  lakh4:  '4 sits in the lakhs place of 402754',
  small6: '100000 is the first number with 6 digits',
  eight:  '8 sits in the hundreds place of 30875'
};

function matchQ(){
  let link, sel, leftEl, rightEl, ready0;

  function partnerOf(li){
    const r = link[li];
    return r === null || r === undefined ? null : r;
  }

  function paint(marked){
    leftEl.innerHTML = LEFT.map((row, i) => {
      const r = partnerOf(i);
      const tone = r === null ? '' : ` linked c${r % 7}`;
      const mark = marked ? (RIGHT[r] && RIGHT[r].key === row.key ? ' right' : ' wrong') : '';
      return `<button class="mtp-card mtp-num${tone}${sel === i ? ' sel' : ''}${mark}" data-i="${i}">
                <span class="mtp-dot"></span>${row.n}
              </button>`;
    }).join('');

    const taken = Object.keys(link).map(k => link[k]);
    rightEl.innerHTML = RIGHT.map((row, j) => {
      const used = taken.indexOf(j) > -1;
      return `<button class="mtp-card mtp-val${used ? ' linked c' + (j % 7) : ''}" data-j="${j}">
                <span class="mtp-dot"></span>${row.t}
              </button>`;
    }).join('');
  }

  function build(stage, saved, locked){
    link = {};
    if(saved) Object.keys(saved).forEach(k => { link[k] = saved[k]; });
    sel = null;

    const board = document.createElement('div');
    board.className = 'mtp-board';
    leftEl = document.createElement('div');
    leftEl.className = 'mtp-col mtp-left';
    rightEl = document.createElement('div');
    rightEl.className = 'mtp-col mtp-right';
    board.append(leftEl, rightEl);
    stage.appendChild(board);

    paint(false);
    if(locked){ board.classList.add('locked'); return; }

    leftEl.addEventListener('click', e => {
      const b = e.target.closest('.mtp-card');
      if(!b) return;
      const i = +b.dataset.i;
      if(link[i] !== undefined){ delete link[i]; sel = i; }
      else sel = sel === i ? null : i;
      paint(false);
    });

    rightEl.addEventListener('click', e => {
      const b = e.target.closest('.mtp-card');
      if(!b) return;
      const j = +b.dataset.j;
      Object.keys(link).forEach(k => { if(link[k] === j) delete link[k]; });
      if(sel === null){
        /* no number picked yet — pick the first one still free */
        const free = LEFT.findIndex((_, i) => link[i] === undefined);
        if(free < 0) return;
        sel = free;
      }
      link[sel] = j;
      sel = LEFT.findIndex((_, i) => link[i] === undefined);
      if(sel < 0) sel = null;
      paint(false);
      if(Object.keys(link).length === LEFT.length) ready0();
    });
  }

  return {
    prompt: 'Match every number with the place value that belongs to it.',
    hint: 'Tap a number on the left, then tap its partner on the right.',
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
      sel = null;
      paint(true);
      let wrong = 0;
      LEFT.forEach((row, i) => {
        const r = link[i];
        if(!RIGHT[r] || RIGHT[r].key !== row.key) wrong++;
      });
      const ok = wrong === 0;
      const first = LEFT.find((row, i) => !RIGHT[link[i]] || RIGHT[link[i]].key !== row.key);
      return { ok, answer: ok ? Object.assign({}, link) : null,
        msg: ok ? 'Every pair is matched — brilliant!'
                : `${wrong} still to fix. Clue: ${WHY[first.key]}.` };
    }
  };
}

Quiz.start({
  kicker: 'Face Value and Place Value · Question 4',
  title: 'Match the place values',
  questions: [ matchQ() ]
});
