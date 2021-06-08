// The transparent part was made by Max Zeryck @mzeryck
//This is meant for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours. The light colour will be active if light mode is on and the dark colour will be active if dark mode is on.
//Enter your player tag below  without the # but still in double quotes.

let player = "GRY2LYY9"
let backgroundColourDark = "#000"
let backgroundColourLight = "#fff"
let textColourDark = "#fff"
let textColourLight = "#000"
let minuetsAfterRefresh = 10
//Here is where you set up your transparent widget
//First set setImage to true and run and fallow the script
//After, set setImage to false and useImage to true
let setImage = false
let useImage = false

//Do not change
const filename = "ChestWidget.jpg"
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)

if (!setImage) {
  let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))

let chestList = {
  SilverChest: "https://cdn.royaleapi.com/static/img/chests/chest-silver.png?t=22a38c6b",
  GoldenChest: "https://cdn.royaleapi.com/static/img/chests/chest-golden.png?t=33cbbfa6c",
  GiantChest: "https://cdn.royaleapi.com/static/img/chests/chest-giant.png?t=695667cea",
  MagicalChest: "https://cdn.royaleapi.com/static/img/chests/chest-magical.png?t=0ed9f582a",
  EpicChest: "https://cdn.royaleapi.com/static/img/chests/chest-epic.png?t=741b36a8a",
  MegaLightningChest: "https://cdn.royaleapi.com/static/img/chests/chest-megalightning.png?t=a6ec47cfc",
  LegendaryChest: "https://cdn.royaleapi.com/static/img/chests/chest-legendary.png?t=9ef4bb1ba",
  GoldCrate: "https://cdn.royaleapi.com/static/img/ui/gold-crate-golden-fs8.png?t=ac11a8a2c"
}

let widget = new ListWidget()
widget.backgroundColor = backgroundColour
let date = new Date()
date.setMinutes(date.getMinutes() + minuetsAfterRefresh)
widget.refreshAfterDate = date
if (!useImage) {
  widget.backgroundColor = backgroundColour
} else {
  widget.backgroundImage = files.readImage(path)
}

let level = widget.addStack()
level.layoutHorizontally()
level.centerAlignContent()
level.addSpacer()

let pos = 0

let url = "https://royaleapi.com/player/" + player
let req = new Request(url)
let html = await req.loadString()
let chests = html.split('<h3 class="ui header">')[1]
chests = chests.split('<div class="header">')

for(var chest of chests) {
if(chest === chests[0]) {
  pos = 0
} else {
  if(pos === 4) {
    level.addSpacer()
    level = widget.addStack()
    level.layoutHorizontally()
    level.centerAlignContent()
    level.addSpacer()
    pos = 1
  } else {
    pos += 1
  }
  
  let plus = chest.split('<div>')[1]
  plus = plus.split('</div>')[0]
  plus= plus.split(" ").join("")
  
  chest = chest.split("</div>")[0]
  chest = chest.split(" ").join("")
  req = new Request(chestList[chest])
  chest = await req.loadImage()
  
  let stack = level.addStack()
  stack.layoutVertically()
  
  let img = stack.addImage(chest)
  img.imageSize = new Size(26, 26)
  
  let text = stack.addText(plus)
  text.font = Font.mediumRoundedSystemFont(9)
  text.textColor = textColour
  text.minimumScaleFactor = .7
}
}
level.addSpacer()
widget.presentSmall()
Script.setWidget(widget)
Script.complete()

  
} else {
  
  var message
  message = "Before you start, go to your home screen and enter wiggle mode. Scroll to the empty page on the far right and take a screenshot."
  let exitOptions = ["Continue","Exit to Take Screenshot"]
  let shouldExit = await generateAlert(message,exitOptions)
  if (shouldExit) return
  
  let img = await Photos.fromLibrary()
  let height = img.size.height
  let phone = phoneSizes()[height]
  if (!phone) {
    message = "It looks like you selected an image that isn't an iPhone screenshot, or your iPhone is not supported. Try again with a different image."
    await generateAlert(message,["OK"])
    return
  }
  
  if (height == 2436) {
  
    let cacheName = "mz-phone-type"
    let cachePath = files.joinPath(files.libraryDirectory(), cacheName)
  
    if (files.fileExists(cachePath)) {
      let typeString = files.readString(cachePath)
      phone = phone[typeString]
    
    } else { 
      message = "What type of iPhone do you have?"
      let types = ["iPhone 12 mini", "iPhone 11 Pro, XS, or X"]
      let typeIndex = await generateAlert(message, types)
      let type = (typeIndex == 0) ? "mini" : "x"
      phone = phone[type]
      files.writeString(cachePath, type)
    }
  }
  
  
  message = "What position will it be in?"
  message += (height == 1136 ? " (Note that your device only supports two rows of widgets, so the middle and bottom options are the same.)" : "")
  
  let crop = { w: "", h: "", x: "", y: "" }
    crop.w = phone.small
    crop.h = phone.small
    let positions = ["Top left","Top right","Middle left","Middle right","Bottom left","Bottom right"]
    let position = await generateAlert(message,positions)
    
    let keys = positions[position].toLowerCase().split(' ')
    crop.y = phone[keys[0]]
    crop.x = phone[keys[1]]
    
  
  // Crop image and finalize the widget.
  let imgCrop = cropImage(img, new Rect(crop.x,crop.y,crop.w,crop.h))
  
    files.writeImage(path,imgCrop)
  
  Script.complete()
}

// Generate an alert with the provided array of options.
async function generateAlert(message,options) {
  
  let alert = new Alert()
  alert.message = message
  
  for (const option of options) {
    alert.addAction(option)
  }
  
  let response = await alert.presentAlert()
  return response
}

// Crop an image into the specified rect.
function cropImage(img,rect) {
   
  let draw = new DrawContext()
  draw.size = new Size(rect.width, rect.height)
  
  draw.drawImageAtPoint(img,new Point(-rect.x, -rect.y))  
  return draw.getImage()
}

// Pixel sizes and positions for widgets on all supported phones.
function phoneSizes() {
  let phones = {  
    
    // 12 Pro Max
    "2778": {
      small:  510,
      medium: 1092,
      large:  1146,
      left:  96,
      right: 678,
      top:    246,
      middle: 882,
      bottom: 1518
    },
  
    // 12 and 12 Pro
    "2532": {
      small:  474,
      medium: 1014,
      large:  1062,
      left:  78,
      right: 618,
      top:    231,
      middle: 819,
      bottom: 1407
    },
  
    // 11 Pro Max, XS Max
    "2688": {
      small:  507,
      medium: 1080,
      large:  1137,
      left:  81,
      right: 654,
      top:    228,
      middle: 858,
      bottom: 1488
    },
  
    // 11, XR
    "1792": {
      small:  338,
      medium: 720,
      large:  758,
      left:  54,
      right: 436,
      top:    160,
      middle: 580,
      bottom: 1000
    },
    
    
    // 11 Pro, XS, X, 12 mini
    "2436": {
     
      x: {
        small:  465,
        medium: 987,
        large:  1035,
        left:  69,
        right: 591,
        top:    213,
        middle: 783,
        bottom: 1353,
      },
      
      mini: {
        small:  465,
        medium: 987,
        large:  1035,
        left:  69,
        right: 591,
        top:    231,
        middle: 801,
        bottom: 1371,
      }
      
    },
  
    // Plus phones
    "2208": {
      small:  471,
      medium: 1044,
      large:  1071,
      left:  99,
      right: 672,
      top:    114,
      middle: 696,
      bottom: 1278
    },
    
    // SE2 and 6/6S/7/8
    "1334": {
      small:  296,
      medium: 642,
      large:  648,
      left:  54,
      right: 400,
      top:    60,
      middle: 412,
      bottom: 764
    },
    
    
    // SE1
    "1136": {
      small:  282,
      medium: 584,
      large:  622,
      left: 30,
      right: 332,
      top:  59,
      middle: 399,
      bottom: 399
    },
    
    // 11 and XR in Display Zoom mode
    "1624": {
      small: 310,
      medium: 658,
      large: 690,
      left: 46,
      right: 394,
      top: 142,
      middle: 522,
      bottom: 902 
    },
    
    // Plus in Display Zoom mode
    "2001" : {
      small: 444,
      medium: 963,
      large: 972,
      left: 81,
      right: 600,
      top: 90,
      middle: 618,
      bottom: 1146
    },
  }
  return phones
}
