//This is meant for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours.
let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"

let titleColourLight =  "#000"
let titleColourDark =  "#fff"

let textColourLight =  "#000"
let textColourDark =  "#fff"

//Do not Change Below
//Sets correct colours
let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
let textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))

//Gets everything
let url = "https://www.merriam-webster.com/word-of-the-day/"
let req = new Request(url)
let html = await req.loadString()

//Gets the Word
let word = html.split("<title>Word of the Day: ")[1]
word = word.split(" | Merriam-Webster</title>")[0]
console.log(word)

//Gets the pronunciation and syllables
let pronunciation = html.split('<span class="word-syllables">')[2]
pronunciation = pronunciation.split("</span>")[0]
console.log(pronunciation)

//Gets type, like verb
let type = html.split('<span class="main-attr">')[1]
type = type.split("</span>")[0]
console.log(type)

//Gets the definition
let def = html.split("<h2>What It Means</h2>\n")[1]
def = def.split("<p>")[1]
def = def.split("</p>")[0]
def = def.replace(/<em>(.*?)<\/em>/g, "$1")
def = def.split(/<a[^>]*>|<\/a>/).join("")

console.log(def)

//Makes the widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
widget.url =  "https://www.merriam-webster.com/word-of-the-day"
let date = new Date()
date.setHours(date.getHours() + 3)
widget.refreshAfterDate = date

//Adds the word to the widget
let title = widget.addText(word)
title.font = Font.mediumRoundedSystemFont(20)
title.textColor = titleColour
title.centerAlignText()
title.minimumScaleFactor = .7
title.lineLimit = 1
widget.addSpacer(10)

//Adds the type and pronunciation to the widget
let text = widget.addText(type + " | " + pronunciation)
text.font = Font.mediumRoundedSystemFont(15)
text.textColor = textColour
text.centerAlignText()
text.minimumScaleFactor = .3
text.lineLimit = 1
widget.addSpacer(10)

//Adds the definition to the Widget
def = widget.addText(def)
def.font = Font.mediumRoundedSystemFont(13)
def.textColor = textColour
def.centerAlignText()
def.minimumScaleFactor = .5

//Completes the script 
widget.presentSmall()
Script.setWidget(widget)
Script.complete()
