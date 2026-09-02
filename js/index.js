/* ============================================================
   Chapter 1 index — activity cards and their preview artwork.
   ============================================================ */
/* ==================================================================
   PREVIEWS — each card shows a little picture of the game inside.
   All drawn as inline SVG on a 160 x 70 canvas so they scale with rem.
   ================================================================== */
const A='var(--mint-line)', AL='var(--sand-line)', W='var(--sun-line)', INK='var(--ink)', WH='#fff';
/* same six bead colours the real abacus uses */
const BEADS=['#EF5A5A','#F5A62E','#2FBFA4','#4C9EE8','#9B7BE0','#EE6FA4'];

const svg = inner => `<svg viewBox="0 0 160 70" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;

/* rounded chip with centred text */
function chip(x,y,w,h,txt,{fill=WH,stroke=AL,color=INK,size=13,dash=0}={}){
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}"
            stroke="${stroke}" stroke-width="1.5" ${dash?`stroke-dasharray="4 3"`:''}/>
          <text x="${x+w/2}" y="${y+h/2+size*.35}" text-anchor="middle"
            font-family="Livvic" font-size="${size}" fill="${color}">${txt}</text>`;
}
function label(x,y,txt,size=11,color=INK){
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Livvic"
            font-size="${size}" fill="${color}">${txt}</text>`;
}

/* --- abacus: rods with beads (or empty rods to fill in) --- */
function abacus(counts,{names=null,target=null}={}){
  const n=counts.length, left=18, right=142, span=(right-left)/(n-1||1);
  let s='';
  if(target) s+=chip(56,2,48,16,target,{fill:'var(--sun-bg)',stroke:W,size:12});
  const top = target?22:8, baseY=52;
  counts.forEach((c,i)=>{
    const x=left+span*i;
    s+=`<line x1="${x}" y1="${top}" x2="${x}" y2="${baseY}" stroke="${AL}" stroke-width="2"/>`;
    for(let b=0;b<c;b++){
      s+=`<circle cx="${x}" cy="${baseY-4-b*7}" r="3.4" fill="${BEADS[b%BEADS.length]}"/>`;
    }
  });
  s+=`<rect x="8" y="${baseY}" width="144" height="14" rx="5" fill="${WH}" stroke="${AL}" stroke-width="1.5"/>`;
  (names||[]).forEach((t,i)=>{ s+=label(left+span*i,baseY+10,t,9); });
  return svg(s);
}


/* --- place value tubes: dashed columns holding stacked blocks --- */
function tubesArt(counts, names){
  const n = counts.length, left = 8, right = 152, w = (right - left) / n;
  const FILL = ['#EDE7FB','#FBE1E8','#FCE7DC','#FDF3D2','#DFF5EE','#E2EFFB'];
  const LINE = ['#A991DE','#E8899C','#F0A87E','#EFC94C','#5CC8A5','#7FB6E8'];
  let s = '';
  counts.forEach((c, i) => {
    const x = left + w * i + 1.5, cw = w - 3;
    const k = i % FILL.length;
    s += `<rect x="${x}" y="4" width="${cw}" height="46" rx="3" fill="none"
            stroke="${LINE[k]}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
    for(let b = 0; b < c; b++){
      s += `<rect x="${x + 2}" y="${44 - b * 6.5}" width="${cw - 4}" height="5" rx="1.5"
              fill="${FILL[k]}" stroke="${LINE[k]}" stroke-width=".8"/>`;
    }
    s += label(x + cw / 2, 60, names[i], 7);
  });
  return svg(s);
}

/* --- two numbers with a symbol box between them --- */
function compare(a,b,sym='?'){
  return svg(
    chip(6,20,52,30,a,{size:15})+
    chip(64,20,32,30,sym,{fill:'var(--sun-bg)',stroke:W,size:16,dash:1})+
    chip(102,20,52,30,b,{size:15})
  );
}

/* --- ascending / descending bars --- */
function order(dir='asc'){
  const h=[14,22,30,38,46];
  const hh = dir==='asc'?h:h.slice().reverse();
  let s='';
  hh.forEach((v,i)=>{
    s+=`<rect x="${10+i*30}" y="${56-v}" width="20" height="${v}" rx="4"
          fill="${i===hh.length-1?W:A}" opacity="${.35+i*.16}"/>`;
  });
  s+=`<line x1="6" y1="58" x2="154" y2="58" stroke="${AL}" stroke-width="1.5"/>`;
  return svg(s);
}

/* --- two sorting bins --- */
function bins(l='Even',r='Odd'){
  let s='';
  s+=chip(4,4,70,20,'2347',{size:12})+chip(86,4,70,20,'5642',{size:12});
  s+=`<path d="M39 26 L39 34" stroke="${AL}" stroke-width="1.5"/>
      <path d="M121 26 L121 34" stroke="${AL}" stroke-width="1.5"/>`;
  s+=chip(4,36,70,30,l,{fill:'var(--mint-bg)',stroke:A,size:13,color:A});
  s+=chip(86,36,70,30,r,{fill:'var(--sun-bg)',stroke:W,size:13});
  return svg(s);
}

/* --- a row of answer boxes, one already filled --- */
function boxes(txt='9'){
  let s='';
  for(let i=0;i<4;i++){
    s+=chip(6+i*39,20,32,30,i===1?txt:'',{fill:i===1?'var(--sun-bg)':WH,stroke:i===1?W:AL,size:15,dash:i===1?0:1});
  }
  s+=label(80,12,'fill each box',10);
  return svg(s);
}

/* --- word phrase turning into a number --- */
function words(word,num){
  return svg(
    chip(2,22,74,26,word,{size:11})+
    `<path d="M80 35 L94 35 M89 30 L94 35 L89 40" stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`+
    chip(98,22,60,26,num,{fill:'var(--sun-bg)',stroke:W,size:14,dash:1})
  );
}

/* --- place value / period strip --- */
function strip(cells,hi=[]){
  const w=150/cells.length;
  let s=`<rect x="5" y="18" width="150" height="34" rx="6" fill="${WH}" stroke="${AL}" stroke-width="1.5"/>`;
  cells.forEach((c,i)=>{
    const x=5+w*i;
    if(hi.includes(i)) s+=`<rect x="${x+1}" y="19" width="${w-2}" height="32" rx="4" fill="var(--warm-soft)"/>`;
    if(i) s+=`<line x1="${x}" y1="18" x2="${x}" y2="52" stroke="${AL}" stroke-width="1.2"/>`;
    s+=label(x+w/2,40,c,12);
  });
  return svg(s);
}

/* --- matching columns --- */
function match(){
  let s='';
  const L=[14,32,50], R=[14,32,50];
  L.forEach((y,i)=>{ s+=chip(6,y-9,54,18,['76549','89011','99999'][i],{size:11}); });
  R.forEach((y,i)=>{ s+=chip(100,y-9,54,18,['9000','800','50000'][i],{size:11,fill:'var(--sun-bg)',stroke:W}); });
  s+=`<path d="M62 14 C80 14 82 32 98 32" stroke="${A}" stroke-width="2" fill="none"/>`;
  s+=`<path d="M62 32 C80 32 82 50 98 50" stroke="${A}" stroke-width="2" fill="none" opacity=".45"/>`;
  return svg(s);
}

/* --- digits to arrange into smallest / greatest --- */
function formnum(digits){
  let s='';
  digits.forEach((d,i)=>{ s+=chip(6+i*26,4,22,22,d,{size:13}); });
  s+=`<path d="M52 30 L52 40 M47 35 L52 40 L57 35" stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s+=`<path d="M108 30 L108 40 M103 35 L108 40 L113 35" stroke="${W}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s+=chip(6,44,72,22,'smallest',{size:11,fill:'var(--mint-bg)',stroke:A,color:A});
  s+=chip(82,44,72,22,'greatest',{size:11,fill:'var(--sun-bg)',stroke:W});
  return svg(s);
}

/* --- before / number / after --- */
function prevnext(n){
  return svg(
    chip(4,22,44,26,'?',{fill:'var(--sun-bg)',stroke:W,size:15,dash:1})+
    chip(52,22,56,26,n,{size:14})+
    chip(112,22,44,26,'?',{fill:'var(--sun-bg)',stroke:W,size:15,dash:1})+
    label(26,14,'before',10)+label(134,14,'after',10)
  );
}

/* --- number line with a dot to round --- */
function numberline(a,b,dot,val){
  let s=`<line x1="10" y1="40" x2="150" y2="40" stroke="${AL}" stroke-width="2"/>`;
  for(let i=0;i<=6;i++){
    const x=10+i*(140/6);
    s+=`<line x1="${x}" y1="34" x2="${x}" y2="46" stroke="${AL}" stroke-width="2"/>`;
  }
  s+=`<circle cx="${dot}" cy="40" r="5" fill="${W}"/>`;
  s+=label(dot,26,val,12);
  s+=label(16,60,a,10)+label(146,60,b,10);
  return svg(s);
}

/* --- roman numeral chips --- */
function roman(items,{hi=1}={}){
  let s='';
  const w=Math.min(46,150/items.length-6);
  items.forEach((t,i)=>{
    s+=chip(6+i*(w+6),20,w,30,t,{size:14,
      fill:i===hi?'var(--sun-bg)':WH, stroke:i===hi?W:AL, dash:i===hi?1:0});
  });
  return svg(s);
}

/* --- roman <-> number conversion --- */
function convert(from,to){
  return svg(
    chip(6,20,60,30,from,{size:15})+
    `<path d="M72 35 L88 35 M83 30 L88 35 L83 40" stroke="${A}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`+
    chip(94,20,60,30,to,{fill:'var(--sun-bg)',stroke:W,size:15,dash:1})
  );
}

/* ==================================================================
   CHAPTER 1 — only the exercises NOT struck through in red.
   ================================================================== */
const SECTIONS = [
  {
    code:'LP', title:'Launch Pad — Revision', pages:'Pages 13–14',
    items:[
      {q:'2', id:'build-on-abacus', ready:true, n:4, page:13,
       title:'Build it on the abacus',
       desc:'Add beads to the rods to make 3786 and 5092, then pick the right number name.',
       tags:['Abacus'], art:()=>abacus([0,0,0,0],{names:['Th','H','T','O'],target:'3786'})},

      {q:'3', id:'read-the-abacus', ready:true, n:2, page:13,
       title:'Read the abacus',
       desc:'Count the beads on each rod and type the number they make.',
       tags:['Abacus'], art:()=>abacus([3,1,4,4],{names:['Th','H','T','O']})},

      {q:'6', id:'compare-and-order', ready:true, n:6, page:14,
       title:'Compare and order',
       desc:'Choose &lt; &gt; or =, put numbers in order, and build the smallest and greatest.',
       tags:['Compare','Order'], art:()=>compare('848','884')},

      {q:'8', id:'even-or-odd-sort', ready:true, n:10, page:14,
       title:'Even or odd sort',
       desc:'Send each number to the even bin or the odd bin before the round ends.',
       tags:['Sorting'], art:()=>bins()}
    ]
  },
  {
    code:'1.1', title:'Count by Ten Thousands', pages:'Page 16',
    items:[
      {q:'1', id:'fill-in-the-boxes', ready:true, n:6, page:16,
       title:'Fill in the boxes',
       desc:'Smallest and greatest 1 to 4 digit numbers, and ones to thousands swaps.',
       tags:['Place value'], art:()=>boxes('9')},

      {q:'2', id:'write-the-number-formed', ready:true, n:2, page:16,
       title:'Write the number formed',
       desc:'Ones, tens, hundreds and thousands arrive shuffled — rebuild the number.',
       tags:['Building'], art:()=>strip(['Th','H','T','O'],[0])}
    ]
  },
  {
    code:'1.2', title:'Numbers up to Lakhs', pages:'Pages 19–20',
    items:[
      {q:'2', id:'build-six-rod-abacus', ready:true, n:2, page:19,
       title:'Fill the place value tubes',
       desc:'Drop blocks into the right tube to build 490306 and 85430, then write the number name.',
       tags:['Place value'], art:()=>tubesArt([4,9,0,3,0,6],['L','TTh','Th','H','T','O'])},

      {q:'3', id:'read-six-rod-abacus', ready:true, n:1, page:19,
       title:'Read the place value tubes',
       desc:'Count the blocks in each tube and answer in numerals and in words.',
       tags:['Place value','Words'], art:()=>tubesArt([4,3,1,6,3,1],['L','TTh','Th','H','T','O'])},

      {q:'4', id:'number-names-to-numerals', ready:true, n:3, page:19,
       title:'Number names to numerals',
       desc:'Turn the words into digits and drop the commas in the right places.',
       tags:['Words','Commas'], art:()=>words('Three lakh six thousand','3,06,024')},

      {q:'5', id:'periods-puzzle', ready:true, n:2, page:20,
       title:'Periods puzzle',
       desc:'Swap digits for zeros, and fill the lakhs, thousands and ones periods.',
       tags:['Periods'], art:()=>strip(['L','TTh','Th','H','T','O'],[0,1,2])}
    ]
  },
  {
    code:'1.3', title:'Face Value and Place Value', pages:'Page 22',
    items:[
      {q:'4', id:'match-the-place-values', ready:true, n:7, page:22,
       title:'Match the place values',
       desc:'Tap a number, then tap the place value card that belongs to it.',
       tags:['Matching'], art:()=>match()}
    ]
  },
  {
    code:'1.5', title:'Comparing and Arranging Numbers', pages:'Pages 27–29',
    items:[
      {q:'1', id:'which-is-bigger', ready:true, n:3, page:27,
       title:'Which one is bigger?',
       desc:'Tap the crocodile symbol that points at the greater number.',
       tags:['Compare'], art:()=>compare('59843','124587')},

      {q:'4', id:'smallest-and-greatest', ready:true, n:4, page:29,
       title:'Smallest and greatest',
       desc:'Arrange every digit once to build the smallest and the greatest number.',
       tags:['Building'], art:()=>formnum(['6','3','0','1','8'])},

      {q:'5', id:'six-digit-challenge', ready:true, n:4, page:29,
       title:'Six digit challenge',
       desc:'Pick six digits from eight and build the smallest and greatest number.',
       tags:['6 digit'], art:()=>formnum(['4','0','9','8','1'])}
    ]
  },
  {
    code:'1.6', title:'Predecessor and Successor', pages:'Page 30',
    items:[
      {q:'1', id:'before-and-after', ready:true, n:10, page:30,
       title:'Before and after',
       desc:'Fill the number that comes just before and just after each one.',
       tags:['Before / After'], art:()=>prevnext('65378')}
    ]
  },
  {
    code:'1.7', title:'Rounding Off Numbers', pages:'Page 33',
    items:[
      {q:'1', id:'round-to-nearest-10', ready:true, n:6, page:33,
       title:'Round to the nearest 10',
       desc:'Slide along the number line and land on the closest ten.',
       tags:['Nearest 10'], art:()=>numberline('17500','17600',96,'554')},

      {q:'2', id:'round-to-nearest-100', ready:true, n:6, page:33,
       title:'Round to the nearest 100',
       desc:'Same game, bigger jumps — find the closest hundred.',
       tags:['Nearest 100'], art:()=>numberline('17100','17700',66,'328')}
    ]
  },
  {
    code:'1.8', title:'Roman Numerals', pages:'Pages 36–37',
    items:[
      {q:'2', id:'compare-roman-numerals', ready:true, n:6, page:36,
       title:'Compare Roman numerals',
       desc:'Decide whether IX is less than, greater than or equal to XI.',
       tags:['Compare','Roman'], art:()=>compare('IX','XI')},

      {q:'3', id:'roman-before-and-after', ready:true, n:8, page:37,
       title:'Roman before and after',
       desc:'Which Roman numeral comes just before and just after XC?',
       tags:['Before / After'], art:()=>roman(['LXXXIX','XC','XCI'],{hi:1})},

      {q:'4', id:'roman-to-number', ready:true, n:4, page:37,
       title:'Roman to number',
       desc:'Decode XXIII, LXIX, XLIX and LXXXVIII into digits.',
       tags:['Decode'], art:()=>convert('XLIX','49')},

      {q:'5', id:'number-to-roman', ready:true, n:6, page:37,
       title:'Number to Roman',
       desc:'Turn 18, 24, 57, 63, 85 and 79 into Roman numerals.',
       tags:['Encode'], art:()=>convert('57','LVII')}
    ]
  }
];

const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72c0 .78.86 1.25 1.52.84l10.78-6.86a1 1 0 0 0 0-1.68L9.52 4.3A1 1 0 0 0 8 5.14z"/></svg> Play';

const root = document.getElementById('sections');
let total = 0, questions = 0;

SECTIONS.forEach(sec => {
  const cards = sec.items.map(it => {
    total++; questions += it.n;
    const label = it.title.replace(/&lt;/g,'less than ').replace(/&gt;/g,'greater than ');
    return `
      <article class="card">
        <div class="preview">${it.art()}</div>
        <div class="card-body">
          <div class="card-top">
            <span class="qnum">${it.q}</span>
            <h3>${it.title}</h3>
          </div>
          <p>${it.desc}</p>
          <div class="card-play">
            <button class="play big" data-id="${it.id}" data-ready="${it.ready ? 1 : 0}"
                    data-title="${sec.code} · Q${it.q}"
                    aria-label="Play ${sec.code} question ${it.q}: ${label}">${PLAY}</button>
          </div>
        </div>
      </article>`;
  }).join('');

  root.insertAdjacentHTML('beforeend', `
    <section class="section">
      <div class="section-head">
        <h2>${sec.title}</h2>
        <span class="rule"></span>
      </div>
      <div class="grid">${cards}</div>
    </section>`);
});

document.getElementById('stat-count').textContent = total;

/* --- play --- */
const toast = document.getElementById('toast');
let t;
function showToast(msg){
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(t); t = setTimeout(()=>toast.classList.remove('show'), 2200);
}
/* No fetch() probe here on purpose — it is blocked when the page is opened
   straight from disk (file://), which made every card say "coming soon".
   Each item declares ready:true once its activity page exists. */
root.addEventListener('click', e => {
  const btn = e.target.closest('.play');
  if(!btn) return;
  if(btn.dataset.ready === '1'){
    location.href = `html/${btn.dataset.id}.html`;
  } else {
    showToast(`${btn.dataset.title} — activity coming soon`);
  }
});
