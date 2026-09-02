/* ============================================================
   Launch Pad 1.1 Q1 — Fill in the boxes.
   Smallest/greatest N-digit numbers and unit conversions.
   ============================================================ */
var FIBQS = [
  { letter:'a', before:'Smallest 1 digit number is', answer:'0' },
  { letter:'b', before:'Greatest 2 digit number is', answer:'99' },
  { letter:'c', before:'Smallest 3 digit number is', answer:'100' },
  { letter:'d', before:'Greatest 4 digit number is', answer:'9999' },
  { letter:'e', before:'100 ones =', answer:'1', after:'hundred' },
  { letter:'f', before:'1 thousand =', answer:'10', after:'hundreds' }
];

function fibQ(){
  var entries = [];
  return {
    prompt: 'Fill in the boxes.',
    hint: '',
    render: function(stage, ready){
      var list = document.createElement('div');
      list.className = 'fib-list';

      FIBQS.forEach(function(item, i) {
        var row = document.createElement('div');
        row.className = 'fib-item';

        var letter = document.createElement('span');
        letter.className = 'fib-letter';
        letter.textContent = item.letter + ')';
        row.appendChild(letter);

        var text = document.createElement('span');
        text.className = 'fib-text';
        text.textContent = item.before;
        row.appendChild(text);

        var input = document.createElement('input');
        input.className = 'fib-entry';
        input.type = 'text';
        input.inputMode = 'numeric';
        input.autocomplete = 'off';
        input.placeholder = '?';
        input.dataset.i = i;
        input.addEventListener('input', function() {
          var allFilled = entries.every(function(e) { return e.value.trim() !== ''; });
          ready(allFilled);
        });
        entries.push(input);
        row.appendChild(input);

        if(item.after){
          var unit = document.createElement('span');
          unit.className = 'fib-unit';
          unit.textContent = ' ' + item.after;
          row.appendChild(unit);
        }

        list.appendChild(row);
      });

      stage.appendChild(list);
      setTimeout(function() { entries[0].focus(); }, 50);
    },
    check: function(){
      var correct = 0;
      entries.forEach(function(entry, i) {
        var ok = entry.value.trim() === FIBQS[i].answer;
        entry.classList.add(ok ? 'right' : 'wrong');
        entry.disabled = true;
        if(ok) correct++;
      });
      var allOk = correct === FIBQS.length;
      return {
        ok: allOk,
        answer: null,
        delay: 0,
        msg: allOk
          ? 'All answers are correct!'
          : correct + ' out of ' + FIBQS.length + ' correct. The answers are: ' + FIBQS.map(function(q){ return q.answer; }).join(', ') + '.'
      };
    }
  };
}

Quiz.start({
  kicker: 'Count by Ten Thousands · Question 1',
  title: 'Fill in the boxes',
  questions: [fibQ()]
});
