/*
RANDOM COLOUR GENERATOR (small widget)

Setup
- `singleColour` should be true or false and determines whether or not the widget is a solid colour or multiple
- `showHex` should be true or false and determines if the hex of the colour is displayed in single colour mode ONLY
- `widgetSize` should be small, medium or large and determines what size of widget is presented in app ONLY for multiple colour mode
- Variables with the suffix `Colour`should be a hex colour string. The colours are used for what the variable name describes
*/

const singleColour = false
const showHex = true

const widgetSize = "small"

let backgroundColour = "#000"
const hexColour = "#fff"

/*
  DO NOT EDIT THE REST OF THE CODE
*/

// Create the widget
let widget = new ListWidget()

// If the widget is only a single colour
if (singleColour) {
  
  // Create a random background coloue
  let colour = generateRandomColor()
  widget.backgroundColor = new Color(colour)
  if (showHex) {
    
    // Add the hex to the widget
    let text = widget.addText(colour)
    text.centerAlignText()
    text.font = Font.mediumRoundedSystemFont(20)
    text.textColor = new Color("#000")
  }
} else {
  
  // Apply the chosen background colour
  widget.backgroundColor = new Color(backgroundColour)

  // Get the number of rows and colums of colours for the widget
  let rows
  let columns
  if ((config.runsInApp && widgetSize === "small") || (config.widgetFamily == "small")) {
    // Small widget
    rows = 2
    columns = 2
  } else if ((config.runsInApp && widgetSize === "medium") || (config.widgetFamily == "medium")) {
    // Medium widget
    rows = 2
    columns = 4
  } else {
    // Large widget
    rows = 4
    columns = 4
  }
  
  // Add the columns and rows of colours evenly spaced out
  widget.addSpacer()
  for(i = 0; i < rows; i++){
    
    // Create a horizontal stack
    let stack = widget.addStack()
    stack.layoutHorizontally()
    stack.addSpacer()
    for(j = 0; j < columns; j++) {
      
      // Add the colour to the stack
      addColour(stack)
      stack.addSpacer()
    }
    widget.addSpacer()
  }
}

// Present the widget
if(widgetSize === "small" || singleColour) {
  widget.presentSmall()
} else if(widgetSize === "medium") {
  widget.presentMedium()
} else {
  widget.presentLarge()
}

// Complete the script
Script.setWidget(widget)
Script.complete()

// Function to create a random colour
function generateRandomColor() {
  let randomColor = '#'+Math.floor(Math.random()*16777215).toString(16)
  if(randomColor.length != 7){
    randomColor = generateRandomColor()
  }
  return randomColor
}

// Function to add the colour
function addColour(on) {
  
  // Create the stack
  let stack = on.addStack()
  stack.layoutVertically()

  // Create the colour
  let colour = generateRandomColor()
  
  // Make a square of the colour
  let square = new DrawContext()
  square.size = new Size(50, 40)
  square.setFillColor(new Color(colour))
  rect = new Rect(0, 0, 50, 40)
  square.fillRect(rect)
  
  // Add the square to the stack
  let img = square.getImage()
  img = stack.addImage(img)
  img.resizable = false

  // Add the hex to the stack
  let text = stack.addText(colour)
  text.font = Font.regularSystemFont(8)
  text.textColor = new Color(hexColour)
}
