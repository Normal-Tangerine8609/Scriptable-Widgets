/*
URBAN DICTIONARY WORD OF THE DAY (small widget)

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

// Get the word data
const data = await getData()

// Set up the colours
let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
let textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))

// Create the widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
widget.url =  "https://www.urbandictionary.com/"
let date = new Date()
date.setHours(date.getHours() + 1)
widget.refreshAfterDate = date

// Add the title
let title = widget.addText(parseHtmlEntities(data.word))
title.font = Font.mediumRoundedSystemFont(20)
title.textColor = titleColour
title.centerAlignText()
title.minimumScaleFactor = .5
title.lineLimit = 1
widget.addSpacer(10)

// Add the definition
def = widget.addText(parseHtmlEntities(data.def))
def.font = Font.mediumRoundedSystemFont(13)
def.textColor = textColour
def.centerAlignText()
def.minimumScaleFactor = .5

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

// Function to get and save the word data for the day
async function getData() {
  
  // Set up variables for working with the file
  const fm = FileManager.iCloud()
  const baseDir = fm.documentsDirectory()
  let file = fm.joinPath(baseDir, "urbanDictionaryWordOfTheDay.json")

  // Find the current date and last updated date of the file
  let currentDate =  new Date()
  let updated = fm.modificationDate(file) || new Date()
  
  // See if the file does not exist or was not yet modified today
  if(!fm.fileExists(file) || currentDate.toDateString() != updated.toDateString()) {
    
    const webView = new WebView()
    await webView.loadURL("https://www.urbandictionary.com/")
    const word = await webView.evaluateJavaScript("document.querySelector('.word').innerText")
    const def = await webView.evaluateJavaScript("document.querySelector('.meaning').innerText")
    const example = await webView.evaluateJavaScript("document.querySelector('.example').innerText")
    console.log(word)
    console.log(def)
    console.log(example)

    // Write the data
    fm.writeString(file, JSON.stringify({word,def}))
  }
  // Read and return the file
  if (!fm.isFileDownloaded(file)) {
    await fm.downloadFileFromiCloud(file)
  }
  file = JSON.parse(fm.readString(file))
  return file
}
