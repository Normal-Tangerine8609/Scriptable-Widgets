/*
ON THIS DAY IN HISTORY (small widget)

Setup
- Variables with the suffix `ColourLight` or `ColourDark`should be a hex colour string. The colours are used as the light mode or dark mode colour for what the variable name describes
*/

let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"

let titleColourLight =  "#000"
let titleColourDark =  "#fff"

let textColourLight =  "#000"
let textColourDark =  "#fff"

/*
  DO NOT EDIT THE REST OF THE CODE
*/

// Set correct colours
let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
let textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))

// Makes the widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
let date = new Date()
date.setMinutes(date.getMinutes() + 15)
widget.refreshAfterDate = date
widget.url = "https://www.onthisday.com/"

// Create and Add the title
let df = new DateFormatter()
df.dateFormat = "MMMM d"
let title = df.string(new Date())

text = widget.addText(title)
text.textColor = titleColour
text.centerAlignText()
text.minimumScaleFactor = .5
text.font = Font.regularSystemFont(20)
text.lineLimit = 1
widget.addSpacer(5)

// Get today's events
const data = await getData()

// Get a random event
let event = data.events[Math.floor((Math.random()*data.events.length))]

// Add the event to the widget
text = widget.addText(event)
text.textColor = textColour
text.centerAlignText()
text.minimumScaleFactor = .5
text.font = Font.regularSystemFont(14)

// Finish the script
widget.presentSmall()
Script.setWidget(widget)
Script.complete()

// Function to replace common html entities
function parseHtmlEntities(str) {
    return str.replace(/&#([0-9]{1,4});/g, function(match, numStr) {
        var num = parseInt(numStr, 10)
        return String.fromCharCode(num)
    })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
}

// Function to get and save events for the day
async function getData() {
  
  // Set up variables for working with the file
  const fm = FileManager.iCloud()
  const baseDir = fm.documentsDirectory()
  let file = fm.joinPath(baseDir, "onThisDatInHistoryData.json")

  // Find the current date and last updated date of the file
  let currentDate =  new Date()
  let updated = fm.modificationDate(file) || new Date()
  
  // See if the file does not exist or was not yet modified today
  if(!fm.fileExists(file) || currentDate.toDateString() != updated.toDateString()) {
  
    // If it was, get the data
    let req = new Request("https://www.onthisday.com/")
    let html = await req.loadString()
    
    // Match out the events
    let events = html
      .match(/<ul class="event-list event-list--with-advert">([\s\S]+?)<\/ul>/g)[0]
      // Remove list tags and split events
      .split(/<li class="event">|<\/li>/g)
      // Replace <a> tags and other html entities
      .map(e => parseHtmlEntities(e.replace(/<[^>]*>/g,"")))
      // Filter remaining events so they are a real event
      .filter(e => /[\w]/.test(e))

    // Write the data
    fm.writeString(file, JSON.stringify({events}))
  }
  // Read and return the file
  if (!fm.isFileDownloaded(file)) {
    await fm.downloadFileFromiCloud(file)
  }
  file = JSON.parse(fm.readString(file))
  return file
}
