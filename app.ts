{
  const exeBtn = document.querySelector('#exe_btn');
  const dataObj: object = new Array();

  let TTSN: number = 0;

  const errorMessage = (message: string) => {
    alert(`error: ${message}`);
  };

  // pick automatlly today date
  const calendarInput = document.querySelector(
    '.calendar'
  ) as HTMLInputElement | null;
  if (calendarInput) {
    calendarInput.value = new Date().toISOString().split('T')[0];
  } else {
    throw Error('The calendar input element was not found.');
  }

  // enter 4 digit number convert to time format like 1000 > 10:00
  const formatTime = (input: string): string => {
    input = input.toString();
    const hours = input.slice(0, 2);
    const minutes = input.slice(2);
    return hours + ':' + minutes;
  };

  // 숫자 4자리강제, 24시 초과, 59분 초과 입력불가
  const checkInputDigits = (input) => {
    // 숫자 자릿수 4자리 강제
    const maxLength = 4;
    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }

    let hourPart = input.value.slice(0, 2);
    let minutePart = input.value.slice(2, 4);

    // 숫자 앞 두자리가 24보다 클경우
    if (hourPart > 24) {
      hourPart = 24;
    }
    if (minutePart > 59) {
      minutePart = 59;
    }

    input.value = `${hourPart}${minutePart}`;
  };

  // decimal 변경로직
  const calculateTimeGap = (timeA, timeB) => {
    const setHoursByFunction = (dateInfo, timeParts) => {
      dateInfo.setHours(
        parseInt(timeParts[0], 10),
        parseInt(timeParts[1], 10),
        0
      );
    };

    const dateA = new Date();
    const dateB = new Date();

    setHoursByFunction(dateA, timeA.split(':'));
    setHoursByFunction(dateB, timeB.split(':'));

    let timeDifference = dateB.getTime() - dateA.getTime();

    if (timeDifference < 0) {
      timeDifference = timeDifference + 86400000;
    }

    let hours = Math.floor(timeDifference / (1000 * 60 * 60));
    let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
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

    const result = hours + minutes;
    return parseFloat(result.toFixed(1));
  };

  // HTML input 초기화
  const resetInputs = (timeA, timeB) => {
    timeA.value = '';
    timeB.value = '';
    timeA.focus();
  };

  // 입력된 데이터 업데이트
  const updateData = (selected, date, index) => {
    const shortCut = selected.closest('.row').children[0];

    const formettedTimeA = shortCut.children[0].value;
    const formettedTimeB = shortCut.children[1].value;
    const timeGapInDecimal = calculateTimeGap(formettedTimeA, formettedTimeB);

    dataObj[date][index].up = formettedTimeA;
    dataObj[date][index].down = formettedTimeB;
    dataObj[date][index].airTime = timeGapInDecimal;

    parseData(dataObj, TTSN);
  };

  const deleteData = (date, index) => {
    dataObj[date].splice(index, 1);
    parseData(dataObj, TTSN);
  };

  const updateTTSN = () => {
    TTSN = document.querySelector('#TTSN').value;
    parseData(dataObj, TTSN);
  };

  // obj 데이터로 HTML DOM 생성
  const parseData = (dataObj, TTSN) => {
    let resultArray = [];
    let outputValue = '';
    TTSN = parseFloat(TTSN);

    // 날짜 정렬
    const sortedDates = Object.keys(dataObj).sort((a, b) => {
      return a.localeCompare(b);
    });

    for (let i = 0; i < sortedDates.length; i++) {
      if (resultArray[sortedDates[i]] === undefined)
        resultArray[sortedDates[i]] = [];

      // 같은날짜 내의 up time 기준으로 시간정렬
      const sortedFlightsTime = dataObj[sortedDates[i]].sort((a, b) => {
        return a.up.localeCompare(b.up);
      });

      const date = sortedDates[i];
      let totalAirTime = 0;

      let detailInfo = '';
      for (let j = 0; j < sortedFlightsTime.length; j++) {
        const upTime = sortedFlightsTime[j].up;
        const downTime = sortedFlightsTime[j].down;
        TTSN += parseFloat(dataObj[date][j].airTime.toFixed(1));
        sortedFlightsTime[j].timeDue = TTSN;

        detailInfo += `
          <div class='row'>
            <div>
              Flight Time:
              <input id="${date}_${j}_up" type="text" value="${upTime}"> to
              <input id="${date}_${j}_down" type="text" value="${downTime}">
            </div>
            <div>
              Air Time: ${dataObj[date][j].airTime}
            </div>
            <div>
              Time due: ${dataObj[date][j].timeDue}
            </div>
            <div>
              <button onclick="updateData(this, '${date}', ${j})">Update</button>
              <button onclick="deleteData('${date}', ${j})">Delete</button>
            </div>
          </div>`;
        totalAirTime = totalAirTime + dataObj[sortedDates[i]][j].airTime;
      }
      resultArray[sortedDates[i]].push({ totalAirTime, TTSN });
      outputValue += `${detailInfo}<li class="amount_info">Date: ${date} / Total Air Time: ${parseFloat(
        totalAirTime.toFixed(1)
      )} / TTSN: ${parseFloat(TTSN.toFixed(1))}</li>`;
    }
    document.querySelector('#result').innerHTML = outputValue;
  };

  exeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (TTSN === 0) TTSN = document.querySelector('#TTSN').value;

    const selectedDate = document.querySelector('#input_date').value;

    const timeA = document.querySelector('#time_A');
    const timeB = document.querySelector('#time_B');

    const formettedTimeA = formatTime(timeA.value);
    const formettedTimeB = formatTime(timeB.value);

    const timeGapInDecimal = calculateTimeGap(formettedTimeA, formettedTimeB);

    // 시간 미입력시 정지
    if (timeGapInDecimal === undefined || isNaN(timeGapInDecimal)) {
      errorMessage('hours or minutes is empty');
      return;
    }

    // 날짜 미선택시 정지
    if (selectedDate.length !== 10) {
      errorMessage('date value is empty');
      return;
    }

    // TTSN 미입력시 정지
    if (!document.querySelector('#TTSN').value) {
      alert('TTSN value is empty');
      return;
    }

    if (formettedTimeA.length !== 5 || formettedTimeB.length !== 5) {
      errorMessage('Time format has wrong');
      return;
    }

    // 선택된날짜 데이터에 데이터 추가
    if (dataObj[selectedDate] === undefined) dataObj[selectedDate] = [];

    dataObj[selectedDate].push({
      up: formettedTimeA,
      down: formettedTimeB,
      airTime: timeGapInDecimal,
    });

    resetInputs(timeA, timeB);
    parseData(dataObj, TTSN);
    return;
  });
}
