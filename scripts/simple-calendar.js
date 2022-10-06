/*
* SIMPLE CALENDAR BOILERPLATE
* this is not meant to be a stantalone widget but to be a starter template to jumpstart your calendar widget (or any widget with a calendar).
* dates can be difficult to work with, so this template is here to  make it easier
*/

/*
* BASE WIDGET STYLING
* change the below variables to customize your calendar style
*/
const spaceBetween = 2
const dateTextSize = 6
const dateSize = 13
const padding = 2
const cornerRadius = 2
const color = Color.dynamic(Color.lightGray(), Color.darkGray())
const weekColor = Color.blue()
const todayColor = Color.red()
const textColor = Color.white()
const titleColor = Color.white()

/*
* CALENDAR PREFERENCES
* change the below variables to change how the calendar behaves
*/

// Only show the days in the month or show the week leading to the first day in the month and the week leaving the last
const showOnlyMonth = true

// Week will start Monday or Sunday 
const weekStartsMonday = false

/*
* CREATE THE WIDGET
* only change the below if you know whats happening
*/

// get the calendar data
const calendarData = calendar(weekStartsMonday)

// Start making the widget
const widget = new ListWidget()

// Add the top day titles
let columnTitle = widget.addStack()
columnTitle.layoutHorizontally()
columnTitle.spacing = spaceBetween
columnTitle.addSpacer()

const dayTitles = weekStartsMonday
  ? ["M", "T", "W", "T", "F", "S", "S"]
  : ["S", "M", "T", "W", "T", "F", "S"]
for (let title of dayTitles) {
  const titleStack = columnTitle.addStack()
  titleStack.setPadding(padding, padding, padding, padding)
  titleStack.backgroundColor = weekColor
  titleStack.size = new Size(dateSize, dateSize)
  titleStack.centerAlignContent()
  titleStack.cornerRadius = cornerRadius

  const titleText = titleStack.addText(title)
  titleText.font = Font.boldSystemFont(dateTextSize)
  titleText.textColor = titleColor
}
columnTitle.addSpacer()

widget.addSpacer(spaceBetween * 3)

// Add the days for each week
for (let week of calendarData) {
  const weekStack = widget.addStack()
  widget.addSpacer(spaceBetween)

  weekStack.layoutHorizontally()
  weekStack.addSpacer()
  weekStack.spacing = spaceBetween

  for (let day of week) {
    const dayStack = weekStack.addStack()
    dayStack.setPadding(padding, padding, padding, padding)
    dayStack.backgroundColor = day.isToday ? todayColor : color
    dayStack.size = new Size(dateSize, dateSize)
    dayStack.centerAlignContent()
    dayStack.cornerRadius = cornerRadius

    if (showOnlyMonth && !day.isInMonth) {
      dayStack.backgroundColor = new Color("#000", 0)
      continue
    }

    const dayText = dayStack.addText(day.day.toString())
    dayText.font = Font.regularSystemFont(dateTextSize)
    dayText.textColor = textColor
  }
  weekStack.addSpacer()
}

// Present the widget
widget.presentSmall()

/*
* GETING THE CALENDAR DATA
* this is the function that gets the data that is used to make the widget
*/

function calendar(weekStartsMonday = false) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Get the number corresponding to the start of the week day
  const weekStart = weekStartsMonday ? 1 : 0

  // Start day count earlier for if the month does not begin on the week start day
  // Set to -6 because it will be incremented to -5 right away and it will get 6 days before the first day because 0 is not the first day in a month
  let dayCount = -6

  // Store days and week
  const days = []

  // Repeat to get all the dates for the calendar
  while (true) {
    dayCount++
    // Get the next date
    let date = new Date(currentYear, currentMonth, dayCount)

    // Do not add the date if it is the first one and not the week start day
    if (days.length === 0 && date.getDay() !== weekStart) {
      continue

      // Exit the loop if it reaches a week start day that is not the first added and not in the current month
    } else if (
      days.length !== 0 &&
      date.getDay() === weekStart &&
      date.getMonth() !== currentMonth
    ) {
      break
    }

    // Push date information to the days array

    /*
    * EXTRA DAY DATA 
    * here is where you would include other data for the day (for example, `isGame: bool` for a sport calendar)
    */
    days.push({
      day: date.getDate(),
      isInMonth: date.getMonth() === currentMonth,
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth()
    })
  }

  // Store a 2D array of the month with week arrays and the 7 days of the week inside
  const month = []
  for (let i = 0; i < days.length; i += 7) {
    month.push(days.slice(i, i + 7))
  }

  return month
}