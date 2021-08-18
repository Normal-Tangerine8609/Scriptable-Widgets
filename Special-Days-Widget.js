//This is meant for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours. The light colour will be active if light mode is on and the dark colour will be active if dark mode is on.
//Enter numbers for the sizes and space bellow
//Enter true or false for showTitle

let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"

let titleSize = 15
let titleColourLight =  "#000"
let titleColourDark =  "#fff"
let spaceingBelowTitle = 5
let showTitle = true

let daySize = 15
let dayColourLight =  "#000"
let dayColourDark =  "#fff"
spaceingBelowDay = 3

//Do not Change Below
//Sets correct colours
let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
let dayColour = Color.dynamic(new Color(dayColourLight),new Color(dayColourDark))

//Sets up stuff
let url = "https://www.daysoftheyear.com/"
let req = new Request(url)
let html = await req.loadString()
let currentDate =  new Date
currentDate = currentDate.toDateString()

//Makes widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
let date = new Date()
date.setHours(date.getHours() + 3)
widget.refreshAfterDate = date
widget.url = url

//Adds title
if (showTitle) {
let title = widget.addText("Today Is...")
title.font = Font.mediumRoundedSystemFont(titleSize)
title.textColor = titleColour
title.centerAlignText()
widget.addSpacer(spaceingBelowTitle)
}

//Gets special days
for(var i = 1; i < 6; i++) {
//Finds date and formats it
let date = html.split('<div class="date_day">')[i]
date = date.split('</div>')[0]
date = date.split("st,").join("")
date = date.split("th,").join("")
date = date.split("nd,").join("")
date = date.split("rd,").join("")
let day = html.split('class="js-link-target">')[i]
//Finds special day
day = day.split("</a>")[0]
date = new Date(date)
date = date.toDateString()

//Adds special day if it is today
if (date === currentDate) {
//puts in '
day = day.split("&#8217;").join("'")
day = day.split("&nbsp;").join(" ")
day = day.split("&amp;").join("&")
day = widget.addText(day)
day.font = Font.mediumRoundedSystemFont(daySize)
day.textColor = dayColour
day.minimumScaleFactor = .5
day.lineLimit = 1
widget.addSpacer(spaceingBelowDay)
}
}

//Compleats the script
widget.presentSmall()
Script.setWidget(widget)
Script.complete()
