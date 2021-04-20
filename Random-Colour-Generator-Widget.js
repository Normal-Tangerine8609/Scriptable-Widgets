//You can change the below

//Changes the widget format
//Enter true or false
let singleColour = false

//Single colour small widget set up
//Enter true or false
let showHex = true

//Multiple colour set up
//Enter small, medium or large
let widgetSize = "small"
//Enter hex colours in double quotes
let backgroundColour = "#000"
let hexColour = "#fff"

//Do Not Change The Bellow
let widget = new ListWidget()

if (singleColour) {
let colour = generateRandomColor()
widget.backgroundColor = new Color(colour)
if (showHex) {
let text = widget.addText(colour)
text.centerAlignText()
text.font = Font.mediumRoundedSystemFont(20)
text.textColor = new Color("#000")
}

widget.presentSmall()
} else {
  widget.backgroundColor = new Color(backgroundColour)
if (widgetSize === "small") {
stack = widget.addStack()
stack.layoutHorizontally()
addColour()
stack.addSpacer(15)
addColour()
  
widget.addSpacer(15) 
   
stack = widget.addStack()
stack.layoutHorizontally()
addColour()
stack.addSpacer(15)
addColour()
  
widget.presentSmall()
} else if (widgetSize === "medium") {
stack = widget.addStack()
stack.layoutHorizontally()
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()

widget.addSpacer(15) 
   
stack = widget.addStack()
stack.layoutHorizontally()
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()

widget.presentMedium()
} else {
stack = widget.addStack()
stack.layoutHorizontally()
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()

widget.addSpacer(15)

stack = widget.addStack()
stack.layoutHorizontally()
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()

widget.addSpacer(15)

stack = widget.addStack()
stack.layoutHorizontally()
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()

widget.addSpacer(15)

stack = widget.addStack()
stack.layoutHorizontally()
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()
stack.addSpacer(15)
addColour()

widget.addSpacer(15)



  
widget.presentLarge()
}
}

Script.setWidget(widget)
Script.complete()

//This generates the colour
function generateRandomColor()
{
    let randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
    if(randomColor.length != 7){
        randomColor = generateRandomColor();
    }
    return randomColor;
}

function addColour() {
let space = stack.addStack()
space.layoutVertically()

let colour = generateRandomColor()
let square = new DrawContext()
square.size = new Size(50, 40)
square.setFillColor(new Color(colour))
rect = new Rect(0, 0, 50, 40)
square.fillRect(rect)
let img = square.getImage()

img = space.addImage(img)
img.resizable = false

let text = space.addText(colour)
text.font = Font.mediumRoundedSystemFont(8)
text.textColor = new Color(hexColour)
}
