/*
DAILY QUOTE (small widget)

Setup
- Variables with the suffix `ColourLight` or `ColourDark`should be a hex colour string. The colours are used as the light mode or dark mode colour for what the variable name describes
- Variables with the suffix `Size` should be a number for the text size described by the variable name
- `showAuthor` should be a boolean to show who said the quote or not
-  `type` should be a string of `love`, `art`, `nature`, `funny` or `normal` for the type of quote that will be displayed
*/

const type = "normal"

const backgroundColourLight = "#fff"
const backgroundColourDark = "#000"

const quoteSize = 15
const quoteColourLight =  "#000"
const quoteColourDark =  "#fff"

const showAuthor = true
const authorSize = 15
const authorColourLight =  "#000"
const authorColourDark =  "#fff"

/*
  DO NOT EDIT THE REST OF THE CODE
*/

// Set up colours
const backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
const quoteColour = Color.dynamic(new Color(quoteColourLight),new Color(quoteColourDark))
const authorColour = Color.dynamic(new Color(authorColourLight),new Color(authorColourDark))

// JSON for type of quote to quote index
const types = {
  love: 1,
  art: 2,
  nature: 3,
  funny: 4,
  normal: 0
}

// If the quote is not in the JSON above, set it to normal
const qNumber = types[type] || 0

// Get the data and match out the content
const data = await getData()
const html = data.quotes[qNumber]
const link = "https://www.brainyquote.com" + html.match(/href="(.+?)"/)[1]
const quote = parseHtmlEntities(html.match(/space-between">\n([\s\S]+?)\n<img/)[1])
const by = parseHtmlEntities(html.match(/title="view author">(.+?)<\/a>/)[1])

// Make the widget
let widget = new ListWidget()
let date = new Date()
date.setHours(date.getHours() + 1)
widget.refreshAfterDate = date
widget.backgroundColor = backgroundColour
widget.url = link

// Add the quote to the widget
let quoteTxt = widget.addText(quote)  
quoteTxt.font = Font.regularSystemFont(quoteSize)
quoteTxt.textColor = quoteColour
quoteTxt.minimumScaleFactor = .5
widget.addSpacer(5)

// Add the author to the widget
if (showAuthor) {  
  let authorTxt = widget.addText("- " + by)  
  authorTxt.font = Font.regularSystemFont(authorSize)
  authorTxt.textColor = authorColour
  authorTxt.minimumScaleFactor = .7
  authorTxt.rightAlignText()
}

// Complete the script
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

// Function to get and save the quote data for the day
async function getData() {
  
  // Set up variables for working with the file
  const fm = FileManager.iCloud()
  const baseDir = fm.documentsDirectory()
  let file = fm.joinPath(baseDir, "dailyQuoteData.json")

  // Find the current date and last updated date of the file
  let currentDate =  new Date()
  let updated = fm.modificationDate(file) || new Date()
  
  // See if the file does not exist or was not yet modified today
  if(!fm.fileExists(file) || currentDate.toDateString() != updated.toDateString()) {
  
    // If it was, get the data
    let req = new Request("https://www.brainyquote.com/quote_of_the_day")
    let richString = await req.loadString()
    let quotes = richString.match(/<h2 class="qotd-h2">[\s\S]+?<\/a>\n<\/div>/g)
    
    // Write the data
    fm.writeString(file, JSON.stringify({quotes}))
  }
  // Read and return the file
  if (!fm.isFileDownloaded(file)) {
    await fm.downloadFileFromiCloud(file)
  }
  file = JSON.parse(fm.readString(file))
  return file
}
