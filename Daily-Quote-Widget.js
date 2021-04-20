//This is meant for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours. The light colour will be active if light mode is on and the dark colour will be active if dark mode is on.
//Enter numbers for the sizes and space bellow
//Enter true or false for show author

let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"

let quoteSize = 15
let quoteColourLight =  "#000"
let quoteColourDark =  "#fff"
let spaceingBelowQuote = 5

let showAuthor = true
let authorSize = 15
let authorColourLight =  "#000"
let authorColourDark =  "#fff"

//Do not change

let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let quoteColour = Color.dynamic(new Color(quoteColourLight),new Color(quoteColourDark))
let authorColour = Color.dynamic(new Color(authorColourLight),new Color(authorColourDark))



let url = "https://www.brainyquote.com/link/quotebr.rss"
let req = new Request(url)
let quote = await req.loadString()
let body = quote.split("<description>")[3]
body = body.split("</description>")[0]
let author = quote.split("<title>")[3]
author = author.split("</title>")[0]

let widget = new ListWidget()
let date = new Date()
date.setHours(date.getHours() + 3)
widget.refreshAfterDate = date
widget.backgroundColor = backgroundColour
widget.url = "https://www.brainyquote.com/quote_of_the_day"

let quoteTxt = widget.addText(body)  
quoteTxt.font = Font.mediumRoundedSystemFont(quoteSize)
quoteTxt.textColor = quoteColour
quoteTxt.minimumScaleFactor = .5
widget.addSpacer(spaceingBelowQuote)


if (showAuthor) {  
let authorTxt = widget.addText("- " + author)  
authorTxt.font = Font.mediumRoundedSystemFont(authorSize)
authorTxt.textColor = authorColour
authorTxt.minimumScaleFactor = .7
authorTxt.rightAlignText()
}

widget.presentSmall()
Script.setWidget(widget)
Script.complete()
