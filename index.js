const selectRoute = document.querySelector('#route');
const selectTime = document.querySelector('#time');
const selectGroup = document.querySelector('.select-group');
const countGroup = document.querySelector('.count-group');
const countFroupInput = document.querySelector('.count-group__input');
const countGroupBtn = document.querySelector('.count-group__btn');
const countGroupResultField = document.querySelector('.count-group__result-field');

const fromAtoB = ['2021-08-21 18:00:00', '2021-08-21 18:30:00', '2021-08-21 18:45:00', '2021-08-21 19:00:00', '2021-08-21 19:15:00', '2021-08-21 21:00:00',]
const fromBtoA = ['2021-08-21 18:30:00', '2021-08-21 18:45:00', '2021-08-21 19:00:00', '2021-08-21 19:15:00', '2021-08-21 19:35:00', '2021-08-21 21:50:00', '2021-08-21 21:55:00']

const defaultParams = {
    'из A в B' :  {
        'price' : 700,
    },
    'из B в A' : {
        'price' : 700,
    },
    'из A в B и обратно в А': {
        'price' : 1200,
    }
}

const currentParams = {};

const fromAtoBFormatted = getFormattedData(fromAtoB)
const fromBtoAFormatted = getFormattedData(fromBtoA);

function getFormattedData(arr) {
    return arr.map(el => {
        const date = new Date();
        date.setTime(Date.parse(el+'+03:00'));
        return date;
    })
}

function getFormatDate(item) {
    const hours = getFormattedTime(item.getHours());
    const minutes = getFormattedTime(item.getMinutes());
    return `${hours}:${minutes}`;
}

function getFormattedTime(num) {
    return num < 10 ? '0' + num : num;
}

function createOption(select, optionsValue) {
    select.innerHTML = '<option value="" disabled selected style="display: none;">Выберите время</option>';
    optionsValue.forEach(item => {
        const option  = document.createElement("option");        
        option.value = item;
        option.textContent = `${getFormatDate(item)} (${currentParams.route})`;
        select.append(option);
    })
};

function fillTimeSelect() {
    const label = document.querySelector('[for="time"]');
    let route;
    if (currentParams.route === 'из B в A') {
        route = fromBtoAFormatted;
        label.textContent = 'Время отправления ' + currentParams.route;
    } else {
        route = fromAtoBFormatted;
        label.textContent = 'Время отправления из A в B';
    }
    
    selectTime.innerHTML = '';
    selectTime.classList.add('visible');
    label.classList.add('visible');

    createOption(selectTime, route);
}

function createSelect(selectTimeValue) {
    const options = fromBtoAFormatted.filter(el=> {
        return Date.parse(selectTimeValue) + 50 * 60000 < Date.parse(el)
    });

    const selectTimeBack = document.querySelector('#selectTimeBack') || document.createElement('select');
    const labelTimeBack = document.querySelector('[for="selectTimeBack"]') || document.createElement('label');
    selectTimeBack.innerHTML = '';
    selectTimeBack.id = 'selectTimeBack';
    selectTimeBack.classList.add('select-group__item');
    labelTimeBack.setAttribute('for', 'selectTimeBack');
    labelTimeBack.textContent = 'Время отправления из B в A';
    labelTimeBack.classList.add('select-group__label');

    createOption(selectTimeBack, options);
    
    selectGroup.append(labelTimeBack);
    selectGroup.append(selectTimeBack);

    selectTimeBack.addEventListener('change', () => {
        countTotal(selectTimeValue, selectTimeBack.options[selectTimeBack.selectedIndex].value);
    });

}

function countTotal(departureTime, backTime) {
    countGroup.classList.add('visible');
    const date = new Date();

    const setTime = (dateValue, k, time=0) => {
        date.setTime(Date.parse(dateValue) + time);
        currentParams[k] = getFormatDate(date);
    }

    setTime(departureTime, 'departureTime');
    setTime(departureTime, 'arrivalTime', 50 * 60000);

    if (backTime) {
        setTime(backTime, 'departureTimeBack');
        setTime(backTime, 'arrivalTimeBack', 50 * 60000);
    }
}

function resetCount() {
    countGroup.classList.remove('visible');
    countFroupInput.value = '';
    countGroupResultField.textContent = '';
}

selectRoute.addEventListener('change', () => {
    currentParams.route = selectRoute.options[selectRoute.selectedIndex].value;
    const selectTimeBack = document.querySelector('#selectTimeBack');
    const labelTimeBack = document.querySelector('[for="selectTimeBack"]');

    if (selectTimeBack) {
        selectTimeBack.remove();
        labelTimeBack.remove();
    }

    resetCount();
    fillTimeSelect();
});

selectTime.addEventListener('change', () => {
    const selectTimeValue = selectTime.options[selectTime.selectedIndex].value;
    currentParams.departureTime = Date.parse(selectTimeValue);

    resetCount();

    if (currentParams.route === 'из A в B и обратно в А') {
        createSelect(selectTimeValue)
    } else {
        currentParams.arrivalTime = currentParams.departureTime + 50 * 60000
        countTotal(selectTimeValue, false);
    }
     
});

countGroupBtn.addEventListener('click', () => {
    const routeInfo = defaultParams[currentParams.route];
    
    countGroupResultField.textContent = countFroupInput.value > 0 ? `
    Выбранный маршрут: ${currentParams.route}.
    Количетсво мест: ${countFroupInput.value}.
    Стоимость ${routeInfo.price*countFroupInput.value}р.
    Теплоход отправляется из A в B в ${currentParams.departureTime}, прибудет в ${currentParams.arrivalTime}.
    ${currentParams.departureTimeBack ? `Отправление из В в А в ${currentParams.departureTimeBack}, прибытие в ${currentParams.arrivalTimeBack}.` : ''}
    ` : 'Укажите количество билетов';
})