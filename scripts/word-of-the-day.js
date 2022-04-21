/*
WORD OF THE DAY (small widget)

Setup
- Variables with the suffix `ColourLight` or `ColourDark`should be a hex colour string. The colours are used as the light mode or dark mode colour for what the variable name describes
*/

const backgroundColourLight = "#fff"
const backgroundColourDark = "#000"

const titleColourLight =  "#000"
const titleColourDark =  "#fff"

const textColourLight =  "#000"
const textColourDark =  "#fff"

/*
  DO NOT EDIT THE REST OF THE CODE
*/

// Sets correct colours
const backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
const titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
const textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))

// Makes the widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
widget.url =  "https://www.merriam-webster.com/word-of-the-day"
let date = new Date()
date.setHours(date.getHours() + 1)
widget.refreshAfterDate = date

const data = await getData()

// Adds the word to the widget
let title = widget.addText(data.word)
title.font = Font.regularSystemFont(20)
title.textColor = titleColour
title.centerAlignText()
title.minimumScaleFactor = .7
title.lineLimit = 1
widget.addSpacer(10)

// Adds the type and pronunciation to the widget
let text = widget.addText(data.type + " | " + data.pronunciation)
text.font = Font.regularSystemFont(15)
text.textColor = textColour
text.centerAlignText()
text.minimumScaleFactor = .3
text.lineLimit = 1
widget.addSpacer(10)

// Adds the definition to the Widget
def = widget.addText(parseHtmlEntities(data.def))
def.font = Font.regularSystemFont(13)
def.textColor = textColour
def.centerAlignText()
def.minimumScaleFactor = .5

// Completes the script 
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

// Function to get and save the word data for the day
async function getData() {
  
  // Set up variables for working with the file
  const fm = FileManager.iCloud()
  const baseDir = fm.documentsDirectory()
  let file = fm.joinPath(baseDir, "wordOfTheDayData.json")

  // Find the current date and last updated date of the file
  let currentDate =  new Date()
  let updated = fm.modificationDate(file) || new Date()
  
  // See if the file does not exist or was not yet modified today
  if(!fm.fileExists(file) || currentDate.toDateString() != updated.toDateString()) {
  
    // If it was, get the data
    let url = "https://www.merriam-webster.com/word-of-the-day/"
    let req = new Request(url)
    let html = await req.loadString()

    // Match out information
    let word = html.match(/<title>Word of the Day: (.+?) | Merriam-Webster<\/title>/)[1]
    let pronunciation = html.split('<span class="word-syllables">')[2].split("</span>")[0]
    let type = html.match(/<span class="main-attr">(.+?)<\/span>/)[1]
    let def = html.split(/<h2>What It Means<\/h2>\s+?<p>([\s\S]+?)<\/p>/)[1].replace(/<[^>]*>/g, "")

    // Write the data
    fm.writeString(file, JSON.stringify({word,pronunciation,type,def}))
  }
  // Read and return the file
  if (!fm.isFileDownloaded(file)) {
    await fm.downloadFileFromiCloud(file)
  }
  file = JSON.parse(fm.readString(file))
  return file
}
