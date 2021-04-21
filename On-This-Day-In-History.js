//This is meant for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours.
//Enter true or false for showTitle
//Enter true or false for textTitleNotDateTitle. If true the title will be "Today In History". If false the title will be the date.
let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"

let titleColourLight =  "#000"
let titleColourDark =  "#fff"
let showTitle = true
let textTitleNotDateTitle = true

let textColourLight =  "#000"
let textColourDark =  "#fff"


//Do not Change Below
let url = "https://www.onthisday.com/"
let req = new Request(url)
let html = await req.loadString()

//Sets correct colours
let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
let textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))

//Makes widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
let date = new Date()
date.setMinutes(date.getMinutes() + 15)
widget.refreshAfterDate = date
widget.url = url

//Adds title
if(showTitle) {
  let text = ""
if(textTitleNotDateTitle) {
  text = "Today In History"
} else {
  let df = new DateFormatter()
  df.dateFormat = "MMMM d"
  text = df.string(new Date())
}
  text = widget.addText(text)
  text.textColor = titleColour
  text.centerAlignText()
  text.minimumScaleFactor = .5
  text.font = Font.mediumRoundedSystemFont(20)
  text.lineLimit = 1
  widget.addSpacer(5)
}

//Finds the days events
let events = []
things = html.split("<header")[4]
things = things.split('<li class="event">')
for(var thing of things){
if(thing !== things[0]) {
thing = thing.split("</li>")[0]
thing = thing.split(/<a[^>]*>|<\/a>/).join("")
thing = thing.split("&quot;").join('"')

events.push(thing)
}
}
//Gets a random event
let event = events[Math.floor((Math.random()*events.length))]

//Adds the event to the widget
text = widget.addText(event)
text.textColor = textColour
text.centerAlignText()
text.minimumScaleFactor = .5
text.font = Font.mediumRoundedSystemFont(14)

//Ends script
widget.presentSmall()
Script.setWidget(widget)
Script.complete()
