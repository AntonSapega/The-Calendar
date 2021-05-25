"use strict"

const monthsStorage = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December'
}

const daysOfWeekDB = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
}

//kye = month, value = days
const redLetterDay = {
  0: [1, 7],
  1: [23],
  2: [8],
  3: [],
  4: [1, 9],
  5: [],
  6: [3],
  7: [],
  8: [],
  9: [],
  10: [7],
  11: [31]
}

let schedulerDB = {}

const defaultSettings = {
  weekStartsWithSunday: false,
  weekendDays: ['Saturday', 'Sunday'],
  showNextPrevMonths: true,
  showScheduler: true
}

let currentSettings = {}

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()
const currentDay = new Date().getDate()

const selectedDate = {
  year: currentYear,
  month: currentMonth,
  day: currentDay,

  quantityDays() {
    return 33 - new Date(this.year, this.month, 33).getDate()
  }
}

const displayedMonthAndYear = document.createElement("span")
const listDays = document.querySelector(".calendar__days-list")
const eventsDescription = document.querySelector(".calendar__events-list")

document.addEventListener('DOMContentLoaded', () => {
  printWeatherAndDays()
  checkTodoLocalStorage()
  setCurrentSettings()
  printWeekList()
  printCurrentMonthAndYear()
  setCurrentDate()
})

function printWeatherAndDays() {
  if (selectedDate.year === currentYear && selectedDate.month === currentMonth) {
    new Promise((resolve) => {
      resolve()
    })
    .then(() => {
      return getWeather()
    }).then((currWeatherDB) => {
      setCurrentWeather(currWeatherDB)
      getSelectedMonth(currWeatherDB)
    })
    .catch(e => {
      console.log(e)
    })
  } else {
    setCurrentWeather()
    getSelectedMonth()
  }
}

function printCurrentMonthAndYear() {
  displayedMonthAndYear.innerHTML = `${monthsStorage[selectedDate.month]} ${selectedDate.year}`
  const parentNode = document.querySelector(".calendar__active-month")
  const beforeEl = document.querySelector(".calendar__active-month-nav")
  parentNode.insertBefore(displayedMonthAndYear, beforeEl)
}

function checkTodoLocalStorage() {
  schedulerDB = JSON.parse(localStorage.getItem('todoDB')) === null ? {} : JSON.parse(localStorage.getItem('todoDB'))
}

function setCurrentSettings() { // перенеси в settings
  const settingsFromLocalStorage = JSON.parse(localStorage.getItem('settingsDB'))

  if (settingsFromLocalStorage === null) {
    currentSettings = {...defaultSettings}
    localStorage.setItem('settingsDB', JSON.stringify(defaultSettings))
  } else {
    const keysDefaultSettings = Object.keys(defaultSettings)

    currentSettings = settingsFromLocalStorage

    keysDefaultSettings.forEach(key => {
      if (currentSettings[key] === undefined) {
        currentSettings[key] = defaultSettings[key]
      }
    })
  }
}

function setCurrentDate() {
  const currentDate = document.querySelector(".calendar__top-block-day-description")
  const dataForInsert = document.createElement("span")
  dataForInsert.innerHTML = `${currentDay} ${monthsStorage[currentMonth]} ${currentYear}`
  dataForInsert.classList = "calendar__top-block-day-description-date"
  currentDate.appendChild(dataForInsert)
}

function setCurrentWeather(weatherDB = null) {
  const currentDate = document.querySelector(".calendar__top-block-day-description")
  const currentWeather = currentDate.querySelector(".calendar__top-block-day-description-weather")

  if (weatherDB !== null && currentWeather === null) {
    const dataForInsert = document.createElement("span")
    dataForInsert.innerHTML = `${weatherDB.currentTemperature}&deg; ${weatherDB.currentWeatherStatus}`
    dataForInsert.classList = "calendar__top-block-day-description-weather"
    currentDate.appendChild(dataForInsert)
  } else if (currentWeather !== null && weatherDB === null) {
    currentWeather.remove()
  }
}

const downBtnForNextMonth = document.querySelector(".icon-arrow-down")
const upBtnForPrevMonth = document.querySelector(".icon-arrow-up")

downBtnForNextMonth.addEventListener('click', nextMonth)
upBtnForPrevMonth.addEventListener('click', prevMonth)

function nextMonth() {
  if (selectedDate.month === 11) {
    selectedDate.month = 0
    selectedDate.year++
  } else {
    selectedDate.month++
  }
  displayedMonthAndYear.innerHTML = `${monthsStorage[selectedDate.month]} ${selectedDate.year}`

  printWeatherAndDays()
}

function prevMonth() {
  if (selectedDate.month === 0) {
    selectedDate.month = 11
    selectedDate.year--
  } else {
    selectedDate.month--
  }
  displayedMonthAndYear.innerHTML = `${monthsStorage[selectedDate.month]} ${selectedDate.year}`

  printWeatherAndDays()
}

function printWeekList() {
  const weekList = document.querySelector(".calendar__week-list")
  weekList.innerHTML = ''
  let daysOfWeekKeys = currentSettings.weekStartsWithSunday ? Object.keys(daysOfWeekDB) : Object.keys(daysOfWeekDB).slice(1).concat(0)

  for (let day of daysOfWeekKeys) {
    const liNode = document.createElement("li")
    liNode.classList = "calendar__week-list-item"
    liNode.innerHTML = `${daysOfWeekDB[day].slice(0, 2)}`
    weekList.append(liNode)
  }
}

function getSelectedMonth(weatherInfo = null) {
  let firstDayOfWeek = currentSettings.weekStartsWithSunday ?
    getFirstDayOfWeek(selectedDate.year, selectedDate.month) + 1 :
    getFirstDayOfWeek(selectedDate.year, selectedDate.month)
  
  listDays.innerHTML = ''

  let someDay = 0
  const quantityDaysPrevMonth = getPrevMonth().quantityDays()
  let differenceDays = quantityDaysPrevMonth - firstDayOfWeek + 2

  let nextMonth = 1
  let row = []
  let quantityCells = 42

  for (let i = 1; i <= quantityCells; i++) {
    const newDay = document.createElement("li")
    newDay.className = "calendar__days-list-day"

    if (i >= firstDayOfWeek && someDay < selectedDate.quantityDays()) {
      someDay++
      someDay === currentDay ? newDay.classList.add("calendar__days-list-day_active") : ''
      isRedLetterDay(selectedDate.month, someDay) ? newDay.classList.add("calendar__days-list-day_holiday") : ''
      newDay.innerHTML = `<span class="calendar__days-list-day-number">${someDay}</span>`
      row.push(newDay)
    } else if (i < firstDayOfWeek && currentSettings.showNextPrevMonths) {
      newDay.innerHTML = `${differenceDays}`
      newDay.classList.add("calendar__days-list-day_dim")
      differenceDays++
      row.push(newDay)
    } else if (i < firstDayOfWeek && !currentSettings.showNextPrevMonths) {
      newDay.innerHTML = ``
      newDay.classList.add("calendar__days-list-day_dim")
      row.push(newDay)
    } else {
      currentSettings.showNextPrevMonths ? newDay.innerHTML = `${nextMonth}` : newDay.innerHTML = ''
      newDay.classList.add("calendar__days-list-day_dim")
      nextMonth++
      row.push(newDay)
    }

    // set weekend day
    if (weekendCheck(row.length) && row[row.length - 1].innerHTML.length !== 0) {
      newDay.classList.add("calendar__days-list-day_grey")
    }

    // red day of calendar
    if (currentSettings.showScheduler && schedulerDB[`${selectedDate.year}.${selectedDate.month}.${someDay}`] !== undefined) {
      const dayWithTodo = newDay.querySelector(".calendar__days-list-day-number")
      dayWithTodo.classList.add("calendar__days-list-day_red-point")
    }

    // Отрисовка events внизу календаря
    if (currentSettings.showScheduler) {
      eventsDescription.classList.remove("calendar__events-list_hidden")
    } else {
      eventsDescription.classList.add("calendar__events-list_hidden")
    }

    if (row.length === 7) {
      const emptyCells = row.map(day => {
        return day.innerHTML.length === 0 ? false : true
      })

      if (emptyCells.includes(true)) {
        weatherForecast(row, weatherInfo)
        listDays.append(...row)
      }
      row = []
    }
    
  }
  eventsCurrentDay()
  readMoreListener()
}

function getFirstDayOfWeek(year, month) { // !!!!!!!!!!!!!!!!!!!!!!!!
  switch (new Date(year, month, 1).getDay()) {
    case 0:
      return 7
      break
    case 1:
      return 8
      break
    default:
      return new Date(selectedDate.year, selectedDate.month, 1).getDay()
      break;
  }
}


function getPrevMonth() {
  let lastMonth = null
  
  if (selectedDate.month === 0) {
    lastMonth = new Date(selectedDate.year - 1, 11)
  } else {
    lastMonth = new Date(selectedDate.year, selectedDate.month - 1)
  }

  return {
    year: lastMonth.getFullYear(),
    month: lastMonth.getMonth(),
    day: lastMonth.getDate(),

    quantityDays() {
      return 33 - new Date(this.year, this.month, 33).getDate()
    }
  }
}

function weekendCheck(lengthOfRow) {
  const weekendDaysToNumbers = currentSettings.weekendDays.map(day => {
    if (!currentSettings.weekStartsWithSunday) {
      switch (day.toLowerCase()) {
        case 'monday':
          return 1
          break;
        case 'tuesday':
          return 2
          break
        case 'wednesday':
          return 3
          break
        case 'thursday':
          return 4
          break
        case 'friday':
          return 5
          break
        case 'saturday':
          return 6
          break
        case 'sunday':
          return 7
          break
      }
    } else if (currentSettings.weekStartsWithSunday) {
        switch (day.toLowerCase()) {
          case 'monday':
            return 2
            break;
          case 'tuesday':
            return 3
            break
          case 'wednesday':
            return 4
            break
          case 'thursday':
            return 5
            break
          case 'friday':
            return 6
            break
          case 'saturday':
            return 7
            break
          case 'sunday':
            return 1
            break
        }
    }
  })

  if (weekendDaysToNumbers.includes(lengthOfRow) && !currentSettings.weekStartsWithSunday) {
    return true
  } else if (weekendDaysToNumbers.includes(lengthOfRow) && currentSettings.weekStartsWithSunday) {
    return true
  } else {
    return false
  }
}

function isRedLetterDay(month, day) {
  if (redLetterDay[month].includes(day)) {
    return true
  }
  return false
}


// SETTINGS
const settingsBtn = document.querySelector(".calendar__events-settings")
const closeSettingsBtn = document.querySelector(".calendar-settings__close-btn")
const settingsPage = document.querySelector(".calendar-settings")
// const calendar = document.querySelector(".calendar")
const settingsList = document.querySelector(".calendar-settings__properties-list")
const settingsElement = document.querySelectorAll(".calendar-settings__properties-item")
const customizations = document.querySelectorAll(".calendar-settings__customization")

//это для weekend!!!!!!!!!!!!!!! перенеси это куда-нибудь логичнее
const weekDaysWrapper = document.querySelectorAll(".setting-card__content")[1]
const weekDaysForWeekend = document.querySelectorAll(".calendar-settings__day-for-weekend")
// Это для showNextPrevMonth!!!! перенеси это куда-нибудь логичнее
const nextPrevMonths = document.querySelector(".calendar-settings__show-only-current-month")
// Это для scheduler!!!!!!!!!!!! перенеси это куда-нибудь логичнее 
const schedulerInput = document.querySelector(".calendar-settings__off-on-scheduler")

let showSettings = false

settingsBtn.addEventListener('click', () => {
  showSettingsHandler()
})


closeSettingsBtn.addEventListener('click', () => {
  showSettingsHandler()
})

function showSettingsHandler() {
  showSettings = !showSettings

  if (showSettings) {
    settingsPage.classList.add("calendar-settings_visible")
    document.querySelector(".calendar").classList.add("calendar_move-to-right-side")
  } else {
    settingsPage.classList.remove("calendar-settings_visible")
    document.querySelector(".calendar").classList.remove("calendar_move-to-right-side")
  }

  // отрисовка checked в первом дне недели
  if (!currentSettings.weekStartsWithSunday) {
    const monday = document.querySelectorAll(".calendar-settings__weekend")[0]
    monday.checked = true // --- вот так устанавливается checked для input
  } else {
    const sunday = document.querySelectorAll(".calendar-settings__weekend")[1]
    sunday.checked = true
  }

  // отрисовка checked выходных дней
  currentSettings.weekendDays.forEach(day => {
    weekDaysForWeekend.forEach(dayOff => {
      if (dayOff.value.toLowerCase() === day.toLowerCase()) {
        dayOff.checked = true
      }
    })
  })

  // отрисовка checked nextPrevMonths
  currentSettings.showNextPrevMonths ? nextPrevMonths.checked = false : nextPrevMonths.checked = true

  // отрисовка checked scheduler
  currentSettings.showScheduler ? schedulerInput.checked = true : schedulerInput.checked = false
}

settingsList.addEventListener('click', (event) => {
  if (event.target.nodeName.toLowerCase() !== 'li') {
    setActiveCustomization(event.target.parentNode, event.target.parentNode.id)
  } else {
    setActiveCustomization(event.target, event.target.id)
  }
})

function setActiveCustomization(node, id) {
  settingsElement.forEach((prop, index) => {
    prop.classList.remove("calendar-settings__properties-item_active")

    if (node === prop) {
      matchCustomization(index)
    }
  })
  node.classList.add("calendar-settings__properties-item_active")
}

function matchCustomization(index) {
  customizations.forEach((custom, i) => {
    custom.classList.remove("calendar-settings__customization_active")
    if (i === index) {
      custom.classList.add("calendar-settings__customization_active")
    }
  })
}


// settings of the first day of week
const mondayAndSunday = document.querySelectorAll(".calendar-settings__weekend")

mondayAndSunday[0].addEventListener('change', () => {
  setFirstDayOfWeek()
})

mondayAndSunday[1].addEventListener('change', () => {
  setFirstDayOfWeek()
})

function setFirstDayOfWeek() {
  currentSettings.weekStartsWithSunday = !currentSettings.weekStartsWithSunday
  printWeekList()
  printWeatherAndDays()

  const settingsLocalStorage = JSON.parse(localStorage.getItem('settingsDB')) // ВЫНЕСТИ В ОДЕЛЬНУЮ ФУНКЦИЮ
  settingsLocalStorage.weekStartsWithSunday = currentSettings.weekStartsWithSunday
  localStorage.setItem('settingsDB', JSON.stringify(settingsLocalStorage))
}

// weekend settings
const weekendBtn = document.querySelector(".calendar-settings__set-weekend-btn")

weekDaysWrapper.addEventListener('click', (event) => {
  const checkedDays = []

  event.target.addEventListener('change', () => {
    weekDaysForWeekend.forEach(day => {
      day.checked ? checkedDays.push(day.value) : ''
    })
  })
  currentSettings.weekendDays = checkedDays
})

weekendBtn.addEventListener('click', () => {
  getSelectedMonth()
  printWeatherAndDays()

  const settingsLocalStorage = JSON.parse(localStorage.getItem('settingsDB')) // ВЫНЕСТИ В ОДЕЛЬНУЮ ФУНКЦИЮ
  settingsLocalStorage.weekendDays = currentSettings.weekendDays
  localStorage.setItem('settingsDB', JSON.stringify(settingsLocalStorage))
})

// Next/prev month settings
nextPrevMonths.addEventListener('change', () => {
  currentSettings.showNextPrevMonths = !currentSettings.showNextPrevMonths
  printWeatherAndDays()

  const settingsLocalStorage = JSON.parse(localStorage.getItem('settingsDB')) // ВЫНЕСТИ В ОДЕЛЬНУЮ ФУНКЦИЮ
  settingsLocalStorage.showNextPrevMonths = currentSettings.showNextPrevMonths
  localStorage.setItem('settingsDB', JSON.stringify(settingsLocalStorage))
})

//Scheduler settings
schedulerInput.addEventListener('click', () => {
  currentSettings.showScheduler = !currentSettings.showScheduler
  if (currentSettings.showScheduler) {
    eventsDescription.classList.remove("calendar-scheduler_hidden")
  } else {
    eventsDescription.classList.add("calendar-scheduler_hidden")
  }
  printWeatherAndDays()

  const settingsLocalStorage = JSON.parse(localStorage.getItem('settingsDB')) // ВЫНЕСТИ В ОДЕЛЬНУЮ ФУНКЦИЮ
  settingsLocalStorage.showScheduler = currentSettings.showScheduler
  localStorage.setItem('settingsDB', JSON.stringify(settingsLocalStorage))
})


//SCHEDULER
const todo = document.querySelector(".calendar-scheduler")
const todoCloseBtn = document.querySelector(".calendar-scheduler__close-btn")
const todoBackground = document.querySelector(".calendar-scheduler__img")
const todoInput = document.querySelector(".calendar-scheduler__add-todo-input")
const addTodoItemBtn = document.querySelector(".calendar__add-btn")
const todoItems = document.querySelector(".calendar-scheduler__todo-list-items")

let dateForScheduler = null

listDays.addEventListener('click', (event) => {
  const styles = event.target.classList.value.split(' ')

  if (currentSettings.showScheduler && !styles.includes("calendar__days-list-day_dim")) {
    showTodo(event.target.innerText)
  }
})

function showTodo(day) {
  todo.classList.add("calendar-scheduler_visible")
  todoBackground.innerHTML = `${day} ${monthsStorage[selectedDate.month]} ${selectedDate.year}`
  todoInput.focus()

  dateForScheduler = `${selectedDate.year}.${selectedDate.month}.${day}`

  if (schedulerDB[dateForScheduler] !== undefined) {
    schedulerDB[dateForScheduler].forEach(arr => {
      drawTask(arr[0], arr[1])
    })
  }
}

todoCloseBtn.addEventListener('click', () => {
  const tasks = document.querySelectorAll(".calendar-scheduler__todo-task-text")
  const preparingTaskForDB = []

  tasks.forEach(task => {
    const taskStyles = task.classList.value.split(' ')

    if (taskStyles.includes("calendar-scheduler__todo-task-text_line-through")) {
      preparingTaskForDB.push([task.innerHTML, true])
    } else {
      preparingTaskForDB.push([task.innerHTML, false])
    }
  })

  schedulerDB[dateForScheduler] = preparingTaskForDB

  if (schedulerDB[dateForScheduler].length === 0) {
    delete schedulerDB[dateForScheduler]
  }
  addTodoToLocalStorage()
  getSelectedMonth()

  todoItems.innerHTML = ''
  todoInput.value = ''
  todo.classList.remove("calendar-scheduler_visible")
})

function addTodoToLocalStorage() {
  localStorage.removeItem('todoDB')
  localStorage.setItem('todoDB', JSON.stringify(schedulerDB))
}

addTodoItemBtn.addEventListener('click', () => {
  todoInputHandler()
})

todoInput.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    todoInputHandler()
  }
})

function todoInputHandler() {
  if (todoInput.value.length > 0) {
    drawTask(todoInput.value)
  }
  todoInput.focus()
}

function drawTask(value, taskComplete = false) {
  const newTask = document.createElement('li')
    newTask.innerHTML = `<div class="calendar-scheduler__todo-task-btn-status calendar-scheduler__todo-task-btn-status_checked"></div>
                        <span class="calendar-scheduler__todo-task-text">${value}</span>
                        <div class="icon-trash calendar-scheduler__todo-task-bnt-rubbish"></div>`
    newTask.classList.add("calendar-scheduler__todo-task")

    if (taskComplete) {
      newTask.children[1].classList.add("calendar-scheduler__todo-task-text_line-through")
      newTask.children[0].classList.remove("calendar-scheduler__todo-task-btn-status_checked")
      newTask.children[0].classList.add("icon-check")
    }

    todoItems.append(newTask)
    todoInput.value = ''
}

todoItems.addEventListener('click', (event) => {
  const statusTaskStyles = event.target.classList.value.split(' ')
  if (statusTaskStyles.includes("calendar-scheduler__todo-task-btn-status_checked")) {
    event.target.classList.remove("calendar-scheduler__todo-task-btn-status_checked")
    event.target.classList.add("icon-check")
    event.target.parentNode.children[1].classList.add("calendar-scheduler__todo-task-text_line-through")
  } else if (statusTaskStyles.includes("icon-check")) {
    event.target.classList.remove("icon-check")
    event.target.classList.add("calendar-scheduler__todo-task-btn-status_checked")
    event.target.parentNode.children[1].classList.remove("calendar-scheduler__todo-task-text_line-through")
  }

  if (statusTaskStyles.includes("calendar-scheduler__todo-task-bnt-rubbish")) {
    event.target.parentNode.remove()
  }
})

function eventsCurrentDay() {
  const currDate = `${currentYear}.${currentMonth}.${currentDay}`
  const activeDate = `${selectedDate.year}.${selectedDate.month}.${selectedDate.day}`

  if (schedulerDB[currDate] !== undefined && currDate === activeDate) {
    eventsDescription.innerHTML = ``
    const titleNode = document.createElement('h3')
    titleNode.classList.add("calendar__events-list-title")
    titleNode.innerText = 'Your todo list on this day'
    eventsDescription.append(titleNode)
    
    prepareTaskForOutput(schedulerDB[currDate])
  } else {
    eventsDescription.innerHTML = `<span>No events</span>`
  }
}

function prepareTaskForOutput(todoList) {
  let quantityDisplayedTasks = 0

  todoList.forEach(task => {
    const newNode = document.createElement('div')
    newNode.classList.add("calendar__events-list-item")
    const taskStringLength = task[0].length
    const stringForView = taskStringLength <= 45 ? task[0] : task[0].slice(0, 45).concat('...')

    if (quantityDisplayedTasks < 4) {
      newNode.innerHTML = `${stringForView}`
      quantityDisplayedTasks++
    } else if (quantityDisplayedTasks === 4) {
      newNode.classList.add("calendar__events-list-item-read-more")
      newNode.innerText = 'Read more...'
      quantityDisplayedTasks++
    }
    eventsDescription.append(newNode)
  })
}

function readMoreListener() {
  const readMoreBnt = document.querySelector(".calendar__events-list-item-read-more")

  if (eventsDescription.contains(readMoreBnt)) {
    readMoreBnt.addEventListener('click', () => {
      showTodo(currentDay)
    })
  }
}



//WEATHER
function getWeather() {
  const key = '3a2c45398f8ab92f43868c5b0fef5070'

  const currentWeather = fetch('https://api.openweathermap.org/data/2.5/onecall?lat=53.9168&lon=30.3449&exclude={part}&appid=' + key)
  .then(response => response.json())
  .then((data) => {
    const currentTemperature = Math.round(data.current.temp - 273.15)
    const currentWeatherStatus = data.current.weather[0].main
    const dailyForecast = data.daily
    return {
      currentTemperature,
      currentWeatherStatus,
      dailyForecast
    }
  })
  .catch(e => {
    console.log(e)
  })

  return currentWeather
}

function weatherForecast(week, weatherDB = null) {
  const currentWeek = week.find(day => day.classList.value.includes("calendar__days-list-day_active"))
  const weekDays = document.querySelectorAll(".calendar__week-list-item")

  if (currentWeek === undefined) {
    return
  }

  if (weatherDB === null) {
    weekDays.forEach(weekDay => {
      const weekDayWeather = weekDay.querySelector(".calendar__week-list-weather")
      weekDayWeather !== null ? weekDayWeather.remove() : ''
    })
    return
  }

  const temperatureAlreadyHas = document.querySelector(".calendar__week-list-weather")

  if (currentWeek !== undefined && selectedDate.year === currentYear && selectedDate.month === currentMonth && temperatureAlreadyHas === null) {
    week.forEach((day,index) => {
      const whichDay = Number(day.innerText)
      weatherDB.dailyForecast.forEach(futureDay => {
        const oneMoreDay = new Date(futureDay.dt * 1000).getDate()
        if (whichDay === oneMoreDay) {
          const tempOfDay = Math.round(futureDay.temp.day - 273.15)
          const temperatureNode = document.createElement('div')
          temperatureNode.classList.add("calendar__week-list-weather")
          temperatureNode.innerHTML = `${tempOfDay}&deg;`
          weekDays[index].append(temperatureNode)
        }
      })
    })
  }
}