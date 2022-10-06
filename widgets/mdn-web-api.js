/*

MDN Web API Widget

- Medium or Small widget

*/

/*

SET UP

widgetSize: `small` or `medium` that determines what size of widget is presented running in app

theme: a json of colours for the widget
  background: `Color` background color
  stack: `Color` stack background color (where the sf symbols are)
  stack: `Color` stack border color
  text: `Color` description of the api text color
  title: title of the api text color
  sf: a json of the possible sf symbols leading to their colors

sfSymbols: a json of the possibe sf symbols leading to the name of the sf symbol

*/

const widgetSize = "small"

// https://pico.css like theme
const theme = {
  background: Color.dynamic(new Color("#fff"), new Color("#11191f")),
  stack: Color.dynamic(new Color("#fbfbfc"), new Color("#141e26")),
  border: Color.dynamic(new Color("#e1e6eb"), new Color("#24333e")),
  text: Color.dynamic(new Color("#414141"), new Color("#bbc6ce")),
  title: Color.dynamic(new Color("#1b2832"), new Color("#edf0f3")),
  sf: {
    "Experimental": new Color("#65b687"),
    "Deprecated": new Color("#65b687"),
    "Warning": new Color("#65b687"),
    "Non-standard": new Color("#65b687"),
    "Secure context": new Color("#65b687"),
    "Safe": new Color("#65b687")
  }
}

const sfSymbols = {
  "Experimental": "hammer",
  "Deprecated": "exclamationmark.triangle",
  "Warning": "exclamationmark.triangle",
  "Non-standard": "trash",
  "Secure context": "network.badge.shield.half.filled",
  "Safe": "checkmark.circle"
}

// Get MDN web api data
const data = await getData()

// Create the widget
let widget = new ListWidget()
widget.url = data.url
widget.backgroundColor = theme.background

let date = new Date()
date.setMinutes(date.getMinutes() + 15)
widget.refreshAfterDate = date

// If widget is small or medium
const isSmall =
  config.widgetFamily === "small" ||
  (config.runsInApp && widgetSize === "small")

// Stack that responds to small or medium sizes
const responsive = widget.addStack()
responsive.layoutVertically()

if (!isSmall) {
  responsive.layoutHorizontally()
  responsive.centerAlignContent()
}

// Create the title
const title = responsive.addText(data.name)
title.centerAlignText()
title.font = Font.boldSystemFont(15)
title.lineLimit = 1
title.minimumScaleFactor = 0.2
title.textColor = theme.title

responsive.addSpacer()

// Make the flag stack
const flags = responsive.addStack()
flags.setPadding(2, 0, 2, 0)
flags.backgroundColor = theme.stack
flags.layoutHorizontally()
flags.borderColor = theme.border
flags.borderWidth = 1
flags.cornerRadius = 14

flags.addSpacer()

// If there are no flags it is safe
if (data.flags.length === 0) {
  data.flags.push("Safe")
}

// Add the flags to the stack
for (let flag of data.flags) {
  
  // Create the symbol
  let symbol = SFSymbol.named(sfSymbols[flag] || "questionmark.circle")
  symbol.applyFont(Font.regularSystemFont(20))
  let image = flags.addImage(symbol.image)
  image.tintColor = theme.sf[flag] || Color.red()
  image.imageSize = new Size(20, 20)
  
  // If the flag is not the last add a spacer
  if (flag !== data.flags[data.flags.length - 1]) {
    flags.addSpacer()
  }
}

flags.addSpacer()

widget.addSpacer()

// Add the description
const description = widget.addText(data.description)
description.font = Font.regularSystemFont(14)
description.minimumScaleFactor = 0.5
description.textColor = theme.text

// Present the widget
if (isSmall) {
  widget.presentSmall()
} else {
  widget.presentMedium()
}

Script.setWidget(widget)
Script.complete()

// Function to get the api data
async function getData() {
  
  // Set up variables for working with the file
  const fm = FileManager.iCloud()
  const baseDir = fm.documentsDirectory()
  let file = fm.joinPath(baseDir, "mdn-web-api.json")

  //get file data
  try {
    // Get the needed htmls and match out information
    const mainReq = new Request(
      "https://developer.mozilla.org/en-US/docs/Web/API"
    )
    const html = await mainReq.loadString()
    const apis = html.match(/<li><a href="\/en-US\/docs\/Web\/API\/.*?<\/a>/g)

    const apiMiniHtml = apis[Math.floor(Math.random() * apis.length)] // get random from array 58

    const name = apiMiniHtml.match(/<a href=".+?">(.+?)<\/a>/)[1]
    const endpoint = apiMiniHtml.match(/href="(.+?)"/)[1]

    const url = "https://developer.mozilla.org" + endpoint
    const apiRequest = new Request(url)
    const apiHtml = await apiRequest.loadString()

    const description = apiHtml.match(
      /<meta name="description" content="(.+?)"/
    )[1]
    const flags =
      apiHtml
        .match(
          /<div class="notecard .+?" id=".+?">[\s\S]*?<p><strong>(.+?):<\/strong>/g
        )
        ?.map((e) => e.match(/<strong>(.+?):<\/strong>/)[1])
        .filter((e) => e !== "Note") || []
    
    // Save the data and return it
    const api = {name, url, description, flags}
    fm.writeString(file, JSON.stringify(api))
    return api
  } catch (e) {
    // If there was an error get the backup
    if (fm.fileExists(file)) {
      // get file
      if (!fm.isFileDownloaded(file)) {
        await fm.downloadFileFromiCloud(file)
      }
      file = JSON.parse(fm.readString(file))
      return file
    } else {
      // If there was no backup
      return {
        name: "Widget Error",
        url: "https://developer.mozilla.org",
        description: "There was an error with the script and no file backup.",
        flag: ["Warning"]
      }
    }
  }
}
