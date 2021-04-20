//Change the bellow
//enter hex value for colours
//enter codes in "s if it has them
//if you do not want a gradient enter both backgroundColours the same
//Align posibilities are center, left and right
//show things can be true or false
//favourits might not work for everyone
let username = "Normal-Tangerine8609"
let downloadGoal = 600

let usernameColour = "#fff"
let usernameSize = 9
let usernameAlign = "center"
let spaceingBelowUsername = 10
let showUsername = true

let shortcutColour = "#fff"
let shortcutSize = 15
let shortcutAlign = "left"
let showSymbolShortcut = true
let spaceingBelowShortcut = 5
let showShortcut = true

let downloadColour = "#fff"
let downloadSize = 15
let downloadAlign = "left"
let showSymbolDownload = true
let spaceingBelowDownload = 5
let showDownload = true

let favouritsColour = "#fff"
let favouritsSize = 15
let favouritsAlign = "left"
let showSymbolFavourits = true
let spaceingBelowFavourits = 5
let showFavourits = true

let averageColour = "#fff"
let averageSize = 15
let averageAlign = "left"
let showSymbolAverage = true
let spaceingBelowAverage = 5
let showAverage = true

let barEmptyColour = "#737373"
let barFillColour = "#fff"
let barCompleatColour = "#0f8910"
let spaceingBelowBar = 5
let showBar = true

let backgroundColourTop = "#000" 
let backgroundColour2Bottom = "#000"
//this is for presenting the widget you can enter small or medium
let widgetSize = "small"

//Do Not Change
let url = "https://routinehub.co/user/" + username
let req = new Request(url)
let html = await req.loadString()
//Match from @Milkybees Check your stats shortcut
let numberOfShortcuts = html.match(/(?=.*Shortcuts:).*/)
numberOfShortcuts = numberOfShortcuts.toString().split(/:/)[1]
numberOfShortcuts = numberOfShortcuts.toString().split(/</)[0]
//Match from @Milkybees Check your stats shortcut
let downloads = html.match(/(?=.*Downloads:).*/)
downloads = downloads.toString().split(/:/)[1]
downloads = downloads.toString().split(/</)[0]

let repeatWith = html.split('<i class="fas fa-heart"></i></span>')
let i = true
let newFavourits = 0
for(var favourits of repeatWith) {
  if (i !== true) {
favourits.split('<i class="fas fa-heart"></i></span>')[1]
favourits.toString().split('</small>')
newFavourits = newFavourits + Number(favourits[1])
} else {i = false}
}
favourits = newFavourits


let averageDownloadsPerShortcut = downloads / numberOfShortcuts
let widget = new ListWidget()
let date = new Date()
date.setHours(date.getHours() + 3)
widget.refreshAfterDate = date

let gradient = new LinearGradient()
gradient.colors = [new Color(backgroundColourTop), new Color(backgroundColour2Bottom)]
gradient.locations = [0,1]
widget.backgroundGradient = gradient

if (showUsername) {
let titleTxt = widget.addText(username)
titleTxt.font = Font.mediumSystemFont(usernameSize)
titleTxt.textColor = new Color(usernameColour)
if (usernameAlign === "center") {
      titleTxt.centerAlignText()
    }
else if (usernameAlign === "right") {
      titleTxt.rightAlignText()
    } 
else {
      titleTxt.leftAlignText()
    }


widget.addSpacer(spaceingBelowUsername)
}

if (showShortcut) {  
let shortcutTxt = widget.addText("")  
if (showSymbolShortcut) {  
shortcutTxt.text = "⎋ " + numberOfShortcuts  
} else {  
shortcutTxt.text = "Shortcuts: " + numberOfShortcuts    
}
shortcutTxt.font = Font.mediumSystemFont(shortcutSize)
shortcutTxt.textColor = new Color(shortcutColour)
if (shortcutAlign === "center") {
      shortcutTxt.centerAlignText()
    }
else if (shortcutAlign === "right") {
      shortcutTxt.rightAlignText()
    } 
else {
      shortcutTxt.leftAlignText()
    }

widget.addSpacer(spaceingBelowShortcut)
}

if (showDownload) {
let downloadTxt = widget.addText("")
if (showSymbolDownload) {
downloadTxt.text = "↓ " + downloads
} else {
downloadTxt.text = "Downloads: " + downloads
}
downloadTxt.font = Font.mediumSystemFont(downloadSize)
downloadTxt.textColor = new Color(downloadColour)
if (downloadAlign === "center") {
      downloadTxt.centerAlignText()
    }
else if (downloadAlign === "right") {
      downloadTxt.rightAlignText()
    } 
else {
      downloadTxt.leftAlignText()
    }

widget.addSpacer(spaceingBelowDownload)
}

if (showFavourits) {  
let favouritsTxt = widget.addText("")  
if (showSymbolFavourits) {  
favouritsTxt.text = "♡ " + favourits  
} else {  
favouritsTxt.text = "Favourits: " + favourits    
}
favouritsTxt.font = Font.mediumSystemFont(favouritsSize)
favouritsTxt.textColor = new Color(favouritsColour)
if (favouritsAlign === "center") {
      favouritsTxt.centerAlignText()
    }
else if (favouritsAlign === "right") {
      favouritsTxt.rightAlignText()
    } 
else {
      favouritsTxt.leftAlignText()
    }

widget.addSpacer(spaceingBelowFavourits)
}

if (showAverage) {
let averageTxt = widget.addText("")
if (showSymbolAverage) {
averageTxt.text = "☆ " + averageDownloadsPerShortcut.toFixed(2)
} else {
averageTxt.text = "Average: " + averageDownloadsPerShortcut.toFixed(2)
}
averageTxt.font = Font.mediumSystemFont(averageSize)
averageTxt.textColor = new Color(averageColour)
if (averageAlign === "center") {
      averageTxt.centerAlignText()
    }
else if (averageAlign === "right") {
      averageTxt.rightAlignText()
    } 
else {
      averageTxt.leftAlignText()
    }

widget.addSpacer(spaceingBelowAverage)
}

if (showBar) {
let img = new DrawContext()
img.size = new Size(125, 5)
let rectangle = new Rect(0, 0, 125, 5)
img.setFillColor(new Color(barEmptyColour))
img.fillRect(rectangle)
if (downloads >= downloadGoal) {
img.setFillColor(new Color(barCompleatColour))
} else {
img.setFillColor(new Color(barFillColour))
}
newWidth = 125 / downloadGoal * downloads
rectangle = new Rect(0, 0, newWidth, 5)
img.fillRect(rectangle)
img = img.getImage()
img = widget.addImage(img)
img.centerAlignImage()
widget.addSpacer(spaceingBelowBar)
}

if (!config.runsInWidget) {
      if (widgetSize === "medium") {
      widget.presentMedium()
    } else {
      widget.presentSmall()
    }
    
        }
else {    
     Script.setWidget(widget);
    }
    Script.complete()
