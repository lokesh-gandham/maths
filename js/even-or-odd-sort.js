/* ============================================================
   Launch Pad Q8 — even or odd sort.
   Circle even numbers, cross out odd numbers.
   ============================================================ */

(function () {
  'use strict';

  var NUMBERS = [2347, 5642, 984, 1003, 7648, 3764, 4981, 5067, 7650, 1234];
  var ROW_SIZE = 5;
  var ROW_LABELS = ['a', 'b'];

  var stage = document.getElementById('q-stage');
  var prompt = document.getElementById('q-prompt');

  var circleTool = null;
  var crossTool = null;

  var activeTool = 'circle';
  var numberItems = [];
  var totalNumbers = NUMBERS.length;
  var correctCount = 0;

  function init() {
    prompt.innerHTML = 'Circle the even numbers and cross out the odd numbers.';
    buildToolSelector();
    buildBoard();
  }

  function buildToolSelector() {
    var section = document.createElement('div');
    section.className = 'eo-tool-section';

    var selector = document.createElement('div');
    selector.className = 'eo-tool-selector';
    selector.setAttribute('role', 'group');
    selector.setAttribute('aria-label', 'Choose a marking tool');

    var circleBtn = document.createElement('button');
    circleBtn.className = 'eo-tool-btn circle-tool active';
    circleBtn.type = 'button';
    circleBtn.setAttribute('aria-pressed', 'true');
    circleBtn.innerHTML = '<span class="eo-tool-symbol">○</span> Circle Even';
    circleBtn.addEventListener('click', function () { setTool('circle'); });

    var crossBtn = document.createElement('button');
    crossBtn.className = 'eo-tool-btn cross-tool';
    crossBtn.type = 'button';
    crossBtn.setAttribute('aria-pressed', 'false');
    crossBtn.innerHTML = '<span class="eo-tool-symbol">╱</span> Cross Out Odd';
    crossBtn.addEventListener('click', function () { setTool('cross'); });

    selector.appendChild(circleBtn);
    selector.appendChild(crossBtn);
    section.appendChild(selector);
    stage.appendChild(section);

    circleTool = circleBtn;
    crossTool = crossBtn;
  }

  function buildBoard() {
    var board = document.createElement('div');
    board.className = 'eo-board';
    numberItems = [];

    for (var r = 0; r < ROW_LABELS.length; r++) {
      var row = document.createElement('div');
      row.className = 'eo-row';

      var label = document.createElement('span');
      label.className = 'eo-row-label';
      label.textContent = ROW_LABELS[r];
      row.appendChild(label);

      var numsWrap = document.createElement('div');
      numsWrap.className = 'eo-row-nums';

      var start = r * ROW_SIZE;
      for (var i = 0; i < ROW_SIZE; i++) {
        var num = NUMBERS[start + i];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'eo-num';
        btn.dataset.number = num;
        btn.textContent = num;
        btn.addEventListener('click', createClickHandler(btn));
        numsWrap.appendChild(btn);
        numberItems.push(btn);
      }

      row.appendChild(numsWrap);
      board.appendChild(row);
    }

    stage.appendChild(board);
  }

  function createClickHandler(item) {
    return function () {
      markNumber(item);
    };
  }

  function setTool(tool) {
    activeTool = tool;

    var circleActive = tool === 'circle';
    var crossActive = tool === 'cross';

    circleTool.classList.toggle('active', circleActive);
    crossTool.classList.toggle('active', crossActive);

    circleTool.setAttribute('aria-pressed', String(circleActive));
    crossTool.setAttribute('aria-pressed', String(crossActive));
  }

  function expectedMark(number) {
    return number % 2 === 0 ? 'circle' : 'cross';
  }

  function markNumber(item) {
    if (item.classList.contains('answer-correct')) {
      return;
    }

    var number = Number(item.dataset.number);
    var correctMark = expectedMark(number);
    var isCorrect = (activeTool === 'circle' && correctMark === 'circle') ||
                    (activeTool === 'cross' && correctMark === 'cross');

    item.classList.remove('marked-circle', 'marked-cross', 'answer-correct', 'answer-wrong');

    if (isCorrect) {
      item.classList.add('marked-circle');
      item.setAttribute('data-mark', 'circle');
      item.classList.add('answer-correct');
      correctCount++;
      Quiz.showPopout('correct', number + ' is ' + (correctMark === 'circle' ? 'even' : 'odd') + ' — correct!');
      checkComplete();
    } else {
      item.classList.add('marked-cross');
      item.setAttribute('data-mark', 'cross');
      item.classList.add('answer-wrong');
      Quiz.showPopout('wrong', number + ' is ' + (correctMark === 'circle' ? 'even' : 'odd') + ' — try again!');
      setTimeout(function () {
        item.classList.remove('marked-cross', 'answer-wrong');
        item.removeAttribute('data-mark');
      }, 1800);
    }
  }

  function checkComplete() {
    if (correctCount === totalNumbers) {
      setTimeout(function () {
        var starStr = '★★★';
        Quiz.showCongrats(correctCount, totalNumbers, starStr, function () {
          clearActivity();
        });
      }, 1500);
    }
  }

  function clearActivity() {
    numberItems.forEach(function (item) {
      item.classList.remove('marked-circle', 'marked-cross', 'answer-correct', 'answer-wrong');
      item.removeAttribute('data-mark');
    });

    correctCount = 0;
    setTool('circle');
  }

  init();
})();
