/* ============================================================
   Even or Odd Number Challenge
   Circle even numbers, cross out odd numbers.
   ============================================================ */

(function () {
  'use strict';

  var NUMBERS = [2347, 5642, 984, 1003, 7648, 3764, 4981, 5067, 7650, 1234];
  var ROW_SIZE = 5;
  var ROW_LABELS = ['a', 'b'];

  var circleTool = document.getElementById('circle-tool');
  var crossTool = document.getElementById('cross-tool');
  var clearButton = document.getElementById('clear-button');
  var checkButton = document.getElementById('check-button');
  var feedback = document.getElementById('activity-feedback');
  var progressBar = document.getElementById('progress-bar');
  var progressTrack = document.getElementById('progress-track');
  var numberBoard = document.getElementById('number-board');

  var popupOverlay = document.getElementById('popup-overlay');
  var popupCard = document.getElementById('popup-card');
  var popupIcon = document.getElementById('popup-icon');
  var popupLabel = document.getElementById('popup-label');
  var popupTitle = document.getElementById('popup-title');
  var popupMessage = document.getElementById('popup-message');
  var popupScore = document.getElementById('popup-score');
  var popupStars = document.getElementById('popup-stars');

  var activeTool = 'circle';
  var popupTimer;
  var popupExitTimer;
  var numberItems = [];

  function buildBoard() {
    numberBoard.innerHTML = '';
    numberItems = [];

    for (var r = 0; r < ROW_LABELS.length; r++) {
      var row = document.createElement('div');
      row.className = 'number-row';

      var label = document.createElement('span');
      label.className = 'row-label';
      label.textContent = ROW_LABELS[r];
      row.appendChild(label);

      var start = r * ROW_SIZE;
      for (var i = 0; i < ROW_SIZE; i++) {
        var num = NUMBERS[start + i];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'number-item';
        btn.dataset.number = num;
        btn.textContent = num;
        btn.addEventListener('click', createClickHandler(btn));
        row.appendChild(btn);
        numberItems.push(btn);
      }

      numberBoard.appendChild(row);
    }
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

    feedback.textContent = circleActive
      ? 'Circle tool selected. Mark the even numbers.'
      : 'Cross out tool selected. Mark the odd numbers.';
  }

  function markNumber(item) {
    if (activeTool === 'circle' && item.classList.contains('marked-circle')) {
      item.classList.remove('marked-circle');
      item.removeAttribute('data-mark');
      updateProgress();
      return;
    }

    if (activeTool === 'cross' && item.classList.contains('marked-cross')) {
      item.classList.remove('marked-cross');
      item.removeAttribute('data-mark');
      updateProgress();
      return;
    }

    item.classList.remove('marked-circle', 'marked-cross', 'answer-correct', 'answer-wrong');

    if (activeTool === 'circle') {
      item.classList.add('marked-circle');
      item.setAttribute('data-mark', 'circle');
    } else {
      item.classList.add('marked-cross');
      item.setAttribute('data-mark', 'cross');
    }

    updateProgress();
  }

  function updateProgress() {
    var markedItems = document.querySelectorAll('.number-item[data-mark]');
    var count = markedItems.length;
    var total = numberItems.length;
    var progress = (count / total) * 100;

    progressBar.style.width = progress + '%';
    progressTrack.setAttribute('aria-valuenow', String(count));

    checkButton.disabled = count !== total;

    if (count === total) {
      feedback.textContent = 'All numbers are marked. Check your answers.';
    }
  }

  function expectedMark(number) {
    return number % 2 === 0 ? 'circle' : 'cross';
  }

  function checkAnswers() {
    var correctCount = 0;

    numberItems.forEach(function (item) {
      var number = Number(item.dataset.number);
      var selectedMark = item.dataset.mark;
      var correctMark = expectedMark(number);

      item.classList.remove('answer-correct', 'answer-wrong');

      if (selectedMark === correctMark) {
        item.classList.add('answer-correct');
        correctCount += 1;
      } else {
        item.classList.add('answer-wrong');
      }
    });

    showResultPopup(correctCount);

    if (correctCount === numberItems.length) {
      feedback.textContent = 'Excellent work. Every answer is correct!';
    } else {
      var remaining = numberItems.length - correctCount;
      feedback.textContent = remaining + ' answer' + (remaining === 1 ? ' needs' : 's need') + ' another look.';
    }
  }

  function getStars(correctCount) {
    if (correctCount === numberItems.length) return '⭐⭐⭐';
    if (correctCount >= 7) return '⭐⭐';
    return '⭐';
  }

  function showResultPopup(correctCount) {
    var allCorrect = correctCount === numberItems.length;

    clearTimeout(popupTimer);
    clearTimeout(popupExitTimer);

    popupOverlay.classList.remove('visible', 'leaving');
    popupCard.classList.toggle('needs-work', !allCorrect);

    if (allCorrect) {
      popupIcon.textContent = '🎉';
      popupLabel.textContent = 'Activity Complete';
      popupTitle.textContent = 'Congratulations!';
      popupMessage.textContent = 'Every number was marked correctly.';
    } else {
      popupIcon.textContent = '🌱';
      popupLabel.textContent = 'Keep Learning';
      popupTitle.textContent = 'Good Try!';
      popupMessage.textContent = 'Review the highlighted numbers and try again.';
    }

    popupScore.textContent = correctCount + ' / ' + numberItems.length;
    popupStars.textContent = getStars(correctCount);

    void popupOverlay.offsetWidth;
    popupOverlay.classList.add('visible');
    popupOverlay.setAttribute('aria-hidden', 'false');

    popupTimer = setTimeout(function () {
      popupOverlay.classList.remove('visible');
      popupOverlay.classList.add('leaving');

      popupExitTimer = setTimeout(function () {
        popupOverlay.classList.remove('leaving');
        popupOverlay.setAttribute('aria-hidden', 'true');
      }, 260);
    }, 2100);
  }

  function clearActivity() {
    clearTimeout(popupTimer);
    clearTimeout(popupExitTimer);

    popupOverlay.classList.remove('visible', 'leaving');
    popupOverlay.setAttribute('aria-hidden', 'true');

    numberItems.forEach(function (item) {
      item.classList.remove('marked-circle', 'marked-cross', 'answer-correct', 'answer-wrong');
      item.removeAttribute('data-mark');
    });

    setTool('circle');
    updateProgress();

    feedback.textContent = 'Circle tool selected. Start marking the numbers.';
  }

  circleTool.addEventListener('click', function () {
    setTool('circle');
  });

  crossTool.addEventListener('click', function () {
    setTool('cross');
  });

  checkButton.addEventListener('click', checkAnswers);
  clearButton.addEventListener('click', clearActivity);

  buildBoard();
  updateProgress();
})();
