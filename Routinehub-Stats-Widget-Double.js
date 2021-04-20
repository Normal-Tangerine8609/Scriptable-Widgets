//Change the below
//enter hex value for colours
//enter codes in "s if it has them
//if you do not want a gradient enter both backgroundColours the same
//show things can be true or false

//enter 2 usernames bellow
let username = ["Normal-Tangerine8609", "Normal-Tangerine8609"]
//enter the 2 coresponding goals here
let downloadGoal = [600,400]

//design stuff
let usernameColour = "#fff"
let usernameSize = 9
let spaceingBelowUsername = 10
let showUsername = true

let shortcutColour = "#fff"
let shortcutSize = 15
let showSymbolShortcut = true
let spaceingBelowShortcut = 5
let showShortcut = true

let downloadColour = "#fff"
let downloadSize = 15
let showSymbolDownload = true
let spaceingBelowDownload = 5
let showDownload = true

let favouritsColour = "#fff"
let favouritsSize = 15
let showSymbolFavourits = true
let spaceingBelowFavourits = 5
let showFavourits = true

let averageColour = "#fff"
let averageSize = 15
let showSymbolAverage = true
let spaceingBelowAverage = 5
let showAverage = true

let barEmptyColour = "#737373"
let barFillColour = "#fff"
let barCompleatColour = "#0f8910"
let spaceingBelowBar = 5
let showBar = true

let backgroundColourTop = "#000"
let backgroundColourBottom = "#000"


//Do Not Change
let widget = new ListWidget()
let date = new Date()
date.setHours(date.getHours() + 3)
widget.refreshAfterDate = date
let row = widget.addStack()
for(var i = 0, l = username.length; i < l; i++) {
row.addSpacer()
let section = row.addStack()
section.layoutVertically()
section.size = new Size(125, 125)
section.centerAlignContent()

let url = "https://routinehub.co/user/" + username[i]
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
let averageDownloadsPerShortcut = downloads / numberOfShortcuts

let repeatWith = html.split('<i class="fas fa-heart"></i></span>')
let index = true
let newFavourits = 0
for(var favourits of repeatWith) {
  if (index !== true) {
favourits.split('<i class="fas fa-heart"></i></span>')[1]
favourits.toString().split('</small>')
newFavourits = newFavourits + Number(favourits[1])
} else {index = false}
}
favourits = newFavourits


let gradient = new LinearGradient()
gradient.colors = [new Color(backgroundColourTop), new Color(backgroundColourBottom)]
gradient.locations = [0,1]
widget.backgroundGradient = gradient

if (showUsername) {
let titleTxt = section.addText(username[i])
titleTxt.font = Font.mediumSystemFont(usernameSize)
    titleTxt.textColor = new Color(usernameColour)


section.addSpacer(spaceingBelowUsername)
}

if (showShortcut) {  
let shortcutTxt = section.addText("")  
if (showSymbolShortcut) {  
shortcutTxt.text = "⎋ " + numberOfShortcuts  
} else {  
shortcutTxt.text = "Shortcuts: " + numberOfShortcuts    
}
shortcutTxt.font = Font.mediumSystemFont(shortcutSize)
    shortcutTxt.textColor = new Color(shortcutColour)

section.addSpacer(spaceingBelowShortcut)
}

if (showDownload) {
let downloadTxt = section.addText("")
if (showSymbolDownload) {
downloadTxt.text = "↓ " + downloads
} else {
downloadTxt.text = "Downloads: " + downloads
}
downloadTxt.font = Font.mediumSystemFont(downloadSize)
    downloadTxt.textColor = new Color(downloadColour)

section.addSpacer(spaceingBelowDownload)
}

if (showFavourits) {  
let favouritsTxt = section.addText("")  
if (showSymbolFavourits) {  
favouritsTxt.text = "♡ " + favourits  
} else {  
favouritsTxt.text = "Favourits: " + favourits    
}
favouritsTxt.font = Font.mediumSystemFont(favouritsSize)
favouritsTxt.textColor = new Color(favouritsColour)

widget.addSpacer(spaceingBelowFavourits)
}

if (showAverage) {
let averageTxt = section.addText("")
if (showSymbolAverage) {
averageTxt.text = "☆ " + averageDownloadsPerShortcut.toFixed(2)
} else {
averageTxt.text = "Average: " + averageDownloadsPerShortcut.toFixed(2)
}
averageTxt.font = Font.mediumSystemFont(averageSize)
    averageTxt.textColor = new Color(averageColour)

section.addSpacer(spaceingBelowAverage)
}

if (showBar) {
let img = new DrawContext()
img.size = new Size(125, 5)
let rectangle = new Rect(0, 0, 125, 5)
img.setFillColor(new Color(barEmptyColour))
img.fillRect(rectangle)
if (downloads >= downloadGoal[i]) {
img.setFillColor(new Color(barCompleatColour))
} else {
img.setFillColor(new Color(barFillColour))
}
newWidth = 125 / downloadGoal[i] * downloads
rectangle = new Rect(0, 0, newWidth, 5)
img.fillRect(rectangle)
img = img.getImage()
img = section.addImage(img)
img.centerAlignImage()
img.resizable = false
section.addSpacer(spaceingBelowBar)
}
}

if (!config.runsInWidget) {
    widget.presentMedium()
        }
else {    
     Script.setWidget(widget);
    }
    Script.complete()
