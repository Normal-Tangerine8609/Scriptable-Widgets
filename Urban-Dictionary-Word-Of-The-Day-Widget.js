//This is meant for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours. The light colour will be active if light mode is on and the dark colour will be active if dark mode is on.
let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"

let titleColourLight =  "#000"
let titleColourDark =  "#fff"

let textColourLight =  "#000"
let textColourDark =  "#fff"

//Do not Change Below

let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
let textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))

let url = "https://www.urbandictionary.com/"
let req = new Request(url)
let html = await req.loadString()

let widget = new ListWidget()
widget.backgroundColor = backgroundColour
widget.url =  url
let date = new Date()
date.setHours(date.getHours() + 3)
widget.refreshAfterDate = date

let word = html.split('<div class="def-header">')[1].split('</div>')[0].split(/<a[^>]*>|<\/a>/).join("")

let def = html.split('<div class="meaning">')[1].split("</div>")[0].split(/<a[^>]*>|<\/a>/).join("").split("<br/>").join("").split("&apos;").join("'")

let title = widget.addText(word)
title.font = Font.mediumRoundedSystemFont(20)
title.textColor = titleColour
title.centerAlignText()
title.minimumScaleFactor = .5
title.lineLimit = 1
widget.addSpacer(10)

def = widget.addText(def)
def.font = Font.mediumRoundedSystemFont(13)
def.textColor = textColour
def.centerAlignText()
def.minimumScaleFactor = .5

widget.presentSmall()
Script.setWidget(widget)
Script.complete()
