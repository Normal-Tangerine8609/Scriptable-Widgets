/*
SPECIAL DAYS (small widget)

Setup
- Variables with the suffix `ColourLight` or `ColourDark`should be a hex colour string. The colours are used as the light mode or dark mode colour for what the variable name describes
- Variables with the suffix `Size` should be a number for the text size described by the variable name
- `showTitle` should be a boolean to show the title or not
*/

let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"

let titleSize = 15
let titleColourLight =  "#000"
let titleColourDark =  "#fff"
let showTitle = true

let daySize = 15
let dayColourLight =  "#000"
let dayColourDark =  "#fff"

/*
  DO NOT EDIT THE REST OF THE CODE
*/

// Sets correct colours
const backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
const titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
const dayColour = Color.dynamic(new Color(dayColourLight),new Color(dayColourDark))
    
// Makes widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
let date = new Date()
date.setHours(date.getHours() + 1)
widget.refreshAfterDate = date
widget.url = "https://www.daysoftheyear.com/"

// Adds the title to the widget
if (showTitle) {
  let title = widget.addText("Today Is...")
  title.font = Font.regularSystemFont(titleSize)
  title.textColor = titleColour
  title.centerAlignText()
  widget.addSpacer(5)
}

// Gets the special days data
const data = await getData()

// Adds the days to the widget
let days = widget.addText(parseHtmlEntities(data.dayArray.join("\n")))
days.font = Font.regularSystemFont(daySize)
days.textColor = dayColour
days.minimumScaleFactor = .5

// Compleats the script
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

// Function to get and save the special day data for the day
async function getData() {
  
  // Set up variables for working with the file
  const fm = FileManager.iCloud()
  const baseDir = fm.documentsDirectory()
  let file = fm.joinPath(baseDir, "specialDayData.json")

  // Find the current date and last updated date of the file
  let currentDate =  new Date()
  let updated = fm.modificationDate(file) || new Date()
  
  // See if the file does not exist or was not yet modified today
  if(!fm.fileExists(file) || currentDate.toDateString() != updated.toDateString()) {
  
    // If it was, get the data
    const req = new Request("https://www.daysoftheyear.com/")
    const html = await req.loadString()
    
    // Get the current daye and set up a variable to store the days
    let currentDate =  new Date()
    currentDate = currentDate.toDateString()
    const dayArray = []
    
    // Get up to 5 special days
    for(let i = 1; i < 6; i++) {
      
      // Match out the date
      let date = new Date(html.match(/<div class="date_day">(.+?)<\/div>/g)[i].match(/<div class="date_day">(.+?)<\/div>/)[1].replace(/(st|th|nd|rd),/g,""))
      
      // Convert date to the same format as the current date
      date = date.toDateString()
      
      // Match out the special day
      let day = html.match(/class="js-link-target">.+?<\/a>/g)[i].match(/class="js-link-target">(.+?)<\/a>/)[1].replace(/<[^>]*>/g, "")
      
      // If the current date is the special day's date, add it to the array
      if (date === currentDate) {
        dayArray.push(day)
      }
    }
    
    // Write the data
    fm.writeString(file, JSON.stringify({dayArray}))
  }
  // Read and return the file
  if (!fm.isFileDownloaded(file)) {
    await fm.downloadFileFromiCloud(file)
  }
  file = JSON.parse(fm.readString(file))
  return file
}
