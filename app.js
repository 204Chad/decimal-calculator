{
  var exeBtn = document.querySelector('#exe_btn');
  var dataObj_1 = new Array();
  var TTSN_1 = 0;
  var errorMessage_1 = function (message) {
    alert('error: '.concat(message));
  };
  // pick automatlly today date
  var calendarInput = document.querySelector('.calendar');
  if (calendarInput) {
    calendarInput.value = new Date().toISOString().split('T')[0];
  } else {
    throw Error('The calendar input element was not found.');
  }
  // enter 4 digit number convert to time format like 1000 > 10:00
  var formatTime_1 = function (input) {
    input = input.toString();
    var hours = input.slice(0, 2);
    var minutes = input.slice(2);
    return hours + ':' + minutes;
  };
  // 숫자 4자리강제, 24시 초과, 59분 초과 입력불가
  var checkInputDigits = function (input) {
    // 숫자 자릿수 4자리 강제
    var maxLength = 4;
    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
    var hourPart = input.value.slice(0, 2);
    var minutePart = input.value.slice(2, 4);
    // 숫자 앞 두자리가 24보다 클경우
    if (hourPart > 24) {
      hourPart = 24;
    }
    if (minutePart > 59) {
      minutePart = 59;
    }
    input.value = ''.concat(hourPart).concat(minutePart);
  };
  // decimal 변경로직
  var calculateTimeGap_1 = function (timeA, timeB) {
    var setHoursByFunction = function (dateInfo, timeParts) {
      dateInfo.setHours(
        parseInt(timeParts[0], 10),
        parseInt(timeParts[1], 10),
        0
      );
    };
    var dateA = new Date();
    var dateB = new Date();
    setHoursByFunction(dateA, timeA.split(':'));
    setHoursByFunction(dateB, timeB.split(':'));
    var timeDifference = dateB.getTime() - dateA.getTime();
    if (timeDifference < 0) {
      timeDifference = timeDifference + 86400000;
    }
    var hours = Math.floor(timeDifference / (1000 * 60 * 60));
    var minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    if (minutes >= 0 && minutes <= 2) {
      minutes = 0;
    } else if (minutes >= 3 && minutes <= 8) {
      minutes = 0.1;
    } else if (minutes >= 9 && minutes <= 14) {
      minutes = 0.2;
    } else if (minutes >= 15 && minutes <= 20) {
      minutes = 0.3;
    } else if (minutes >= 21 && minutes <= 26) {
      minutes = 0.4;
    } else if (minutes >= 27 && minutes <= 32) {
      minutes = 0.5;
    } else if (minutes >= 33 && minutes <= 38) {
      minutes = 0.6;
    } else if (minutes >= 39 && minutes <= 44) {
      minutes = 0.7;
    } else if (minutes >= 45 && minutes <= 50) {
      minutes = 0.8;
    } else if (minutes >= 51 && minutes <= 56) {
      minutes = 0.9;
    } else if (minutes >= 57 && minutes <= 60) {
      minutes = 1;
    }
    var result = hours + minutes;
    return parseFloat(result.toFixed(1));
  };
  // HTML input 초기화
  var resetInputs_1 = function (timeA, timeB) {
    timeA.value = '';
    timeB.value = '';
    timeA.focus();
  };
  // 입력된 데이터 업데이트
  var updateData = function (selected, date, index) {
    var shortCut = selected.closest('.row').children[0];
    var formettedTimeA = shortCut.children[0].value;
    var formettedTimeB = shortCut.children[1].value;
    var timeGapInDecimal = calculateTimeGap_1(formettedTimeA, formettedTimeB);
    dataObj_1[date][index].up = formettedTimeA;
    dataObj_1[date][index].down = formettedTimeB;
    dataObj_1[date][index].airTime = timeGapInDecimal;
    parseData_1(dataObj_1, TTSN_1);
  };
  var deleteData = function (date, index) {
    dataObj_1[date].splice(index, 1);
    parseData_1(dataObj_1, TTSN_1);
  };
  var updateTTSN = function () {
    TTSN_1 = document.querySelector('#TTSN').value;
    parseData_1(dataObj_1, TTSN_1);
  };
  // obj 데이터로 HTML DOM 생성
  var parseData_1 = function (dataObj, TTSN) {
    var resultArray = [];
    var outputValue = '';
    TTSN = parseFloat(TTSN);
    // 날짜 정렬
    var sortedDates = Object.keys(dataObj).sort(function (a, b) {
      return a.localeCompare(b);
    });
    for (var i = 0; i < sortedDates.length; i++) {
      if (resultArray[sortedDates[i]] === undefined)
        resultArray[sortedDates[i]] = [];
      // 같은날짜 내의 up time 기준으로 시간정렬
      var sortedFlightsTime = dataObj[sortedDates[i]].sort(function (a, b) {
        return a.up.localeCompare(b.up);
      });
      var date = sortedDates[i];
      var totalAirTime = 0;
      var detailInfo = '';
      for (var j = 0; j < sortedFlightsTime.length; j++) {
        var upTime = sortedFlightsTime[j].up;
        var downTime = sortedFlightsTime[j].down;
        TTSN += parseFloat(dataObj[date][j].airTime.toFixed(1));
        sortedFlightsTime[j].timeDue = TTSN;
        detailInfo +=
          "\n          <div class='row'>\n            <div>\n              Flight Time:\n              <input id=\""
            .concat(date, '_')
            .concat(j, '_up" type="text" value="')
            .concat(upTime, '"> to\n              <input id="')
            .concat(date, '_')
            .concat(j, '_down" type="text" value="')
            .concat(
              downTime,
              '">\n            </div>\n            <div>\n              Air Time: '
            )
            .concat(
              dataObj[date][j].airTime,
              '\n            </div>\n            <div>\n              Time due: '
            )
            .concat(
              dataObj[date][j].timeDue,
              '\n            </div>\n            <div>\n              <button onclick="updateData(this, \''
            )
            .concat(date, "', ")
            .concat(
              j,
              ')">Update</button>\n              <button onclick="deleteData(\''
            )
            .concat(date, "', ")
            .concat(
              j,
              ')">Delete</button>\n            </div>\n          </div>'
            );
        totalAirTime = totalAirTime + dataObj[sortedDates[i]][j].airTime;
      }
      resultArray[sortedDates[i]].push({
        totalAirTime: totalAirTime,
        TTSN: TTSN,
      });
      outputValue += ''
        .concat(detailInfo, '<li class="amount_info">Date: ')
        .concat(date, ' / Total Air Time: ')
        .concat(parseFloat(totalAirTime.toFixed(1)), ' / TTSN: ')
        .concat(parseFloat(TTSN.toFixed(1)), '</li>');
    }
    document.querySelector('#result').innerHTML = outputValue;
  };
  exeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (TTSN_1 === 0) TTSN_1 = document.querySelector('#TTSN').value;
    var selectedDate = document.querySelector('#input_date').value;
    var timeA = document.querySelector('#time_A');
    var timeB = document.querySelector('#time_B');
    var formettedTimeA = formatTime_1(timeA.value);
    var formettedTimeB = formatTime_1(timeB.value);
    var timeGapInDecimal = calculateTimeGap_1(formettedTimeA, formettedTimeB);
    // 시간 미입력시 정지
    if (timeGapInDecimal === undefined || isNaN(timeGapInDecimal)) {
      errorMessage_1('hours or minutes is empty');
      return;
    }
    // 날짜 미선택시 정지
    if (selectedDate.length !== 10) {
      errorMessage_1('date value is empty');
      return;
    }
    // TTSN 미입력시 정지
    if (!document.querySelector('#TTSN').value) {
      alert('TTSN value is empty');
      return;
    }
    if (formettedTimeA.length !== 5 || formettedTimeB.length !== 5) {
      errorMessage_1('Time format has wrong');
      return;
    }
    // 선택된날짜 데이터에 데이터 추가
    if (dataObj_1[selectedDate] === undefined) dataObj_1[selectedDate] = [];
    dataObj_1[selectedDate].push({
      up: formettedTimeA,
      down: formettedTimeB,
      airTime: timeGapInDecimal,
    });
    resetInputs_1(timeA, timeB);
    parseData_1(dataObj_1, TTSN_1);
    return;
  });
}
