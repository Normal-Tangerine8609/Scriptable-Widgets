/*
* CAN I USE...
* A widget for displaying web developer data from https://caniuse.com/
*
* SUPPORTS
* This script supports lockscreen, small, medium and large widgets
*
* SETTINGS
* stats: 
*   the value for stats should be the a array of "stats" from `caniuse.com`. To find the stats you are looking to track, go to caniuse.com and use the search bar to find it. After, you will have to click on the `#` button above the title but beside the star to go to the individual stat page. Then, you can view the URL of the page and copy the final path of the url. For example, I could have `https://caniuse.com/http3` and the stat would be `http3` or `https://caniuse.com/css-hanging-punctuation` and the stat would be `css-hanging-punctuation`.
*  stats can also have objects instead of just strings. The object should have a `stat` value that would be the same as the string stat and a `title` value that replaces the defult title
*
* styles: 
*   An object with all the customizations for the widget
*   textColor: `Color`, the text colour for small, medium and large widgets
*   backgroundColor: `Color`, the background colour for small, medium and large widgets
*   accessory: `Object`
*     styling for accessory widgets
*     accessoryBackground: `bool`, to show or not show the accessory background
*     sfSymbols: `Object`, an object for defining the SF stmbols that appear at certain points for the inline accessory widget. If the percent is 75 or higher, `success` symbol will show. Else, if it is 50 or higher, `warning` symbol will show. And otherwise, `error` symbol will show.
*  progressCircle: `Object`
*    styling progress circles
*    transparentBackground: `boolean`, to show the background, or track, of the progress circle or not
*    The rest of the values in this object set the colours of the progress circle. The values should not be regular scriptable colours but html colours. This is because the progress circles are made with a WebView. The values can also be 2 html colours split by hyphens (-) for the first colour to be the light mode colour and second the dark mode colour.
*/

const stats = [
  "css-hanging-punctuation",
  "css-scroll-behavior",
  "ch-unit",
  "css-nesting",
  {
    stat: "mdn-css_types_color_color-mix",
    title: "color-mix()"
  },
  "css-conic-gradients",
  "mdn-api_url"
]

const styles = {
  textColor: Color.dynamic(Color.black(), new Color("#fff", 0.85)),
  backgroundColor: Color.dynamic(Color.white(), new Color("#121212")),
  progressCircle: {
    // remember to say how colours are html only
    success: "hsl(120, 60%, 55%)",
    successBackground: "hsl(120, 55%, 40%)",
    warning: "hsl(40, 100%, 55%)",
    warningBackground: "hsl(40, 70%, 45%)",
    error: "hsl(0, 100%, 65%)",
    errorBackground: "hsl(0, 80%, 55%)",
    transparentBackground: false
  },
  accessory: {
    accessoryBackground: false,
    // inline widget
    sfSymbol: {
      success: "checkmark.shield",
      warning: "exclamationmark.triangle",
      error: "xmark.octagon"
    }
  }
}

/*
*
* CREATE THE WIDGET
*
*/

// get the stat data
const data = await getData()

// split the widget args into a list
const widgetArgs = args.widgetParameter?.split(/\s*,\s*/) || []

const widget = new ListWidget()
let date = new Date()
date.setHours(date.getHours() + 1)
widget.refreshAfterDate = date

if (config.runsInAccessoryWidget) {
  widget.addAccessoryWidgetBackground = styles.accessory.accessoryBackground

  // accessory widget can only show one stat, get the stats for the widget parameters first
  const parameterStats = widgetArgs.map((e) => {
    for(let stat of data) {
      if(stat.link.endsWith(e)) {
        return stat
      }
    }
    })
  const stat = parameterStats.length > 0 ? randomArrayItem(parameterStats) : randomArrayItem(data)

  widget.url = stat.link
  
  if (config.widgetFamily === "accessoryRectangular") {

    const horizontalStack = widget.addStack()
    horizontalStack.layoutHorizontally()
    horizontalStack.centerAlignContent()
    
    const title = horizontalStack.addText(stat.title)
    title.font = Font.regularSystemFont(15)
    title.minimumScaleFactor = 0.3
    title.lineLimit = 3
    title.centerAlignText()
    
    horizontalStack.addSpacer(5)
    
    const progressStack = await addProgressCircle(horizontalStack, stat.value)
    
    const number = progressStack.addText(Math.round(stat.value).toString())
    number.font = Font.boldSystemFont(20)
    number.minimumScaleFactor = 0.3
    number.lineLimit = 3
    number.centerAlignText()
    
  } else if (config.widgetFamily === "accessoryInline") {
    
    const title = widget.addText(`${stat.title} ${Math.round(stat.value)}%`)
    title.font = Font.regularSystemFont(20)
    title.minimumScaleFactor = 0.3

    let symbolName
    if (stat.value >= 75) {
      symbolName = styles.accessory.sfSymbol.success
    } else if (stat.value >= 50) {
      symbolName = styles.accessory.sfSymbol.warning
    } else {
      symbolName = styles.accessory.sfSymbol.error
    }

    const sf = SFSymbol.named(symbolName)
    sf.applyFont(Font.regularSystemFont(20))
    widget.addImage(sf.image)
    
  } else if (config.widgetFamily === "accessoryCircular") {
    
    const stack = await addProgressCircle(widget, stat.value)
    
    const title = stack.addText(stat.title)
    title.font = Font.boldSystemFont(20)
    title.minimumScaleFactor = 0.3
    title.lineLimit = 3
    title.centerAlignText()
    
  }
  // home screen widgets
} else if(config.runsInWidget) {
  
  widget.backgroundColor = styles.backgroundColor
  widget.addSpacer()
  
  // get the data needed to make the current size of widget
  let {rows, columns, width} = {
    small: {rows: 2, columns:1, width:100},
    medium: {rows: 2, columns:2, width:120},
    large: {rows: 5, columns:2,width:120},
  }[config.widgetFamily]
  
  // if the widget size is not valid (extra large) exit
  if(!rows) {return}
  
  // use the widget argument stats before the others
  let stats = [] 
  for(let stat of widgetArgs) {
    for(let i = 0; i < data.length; i++) {
      if(data[i].link.endsWith(stat)) {
        let selectedStat = data.splice(i, 1)[0]
        stats.push(selectedStat)
        break
      }
    }
  }
  stats = [...stats, ...shuffleArray(data)]
  
  // build the widget by row then column
  let statIndex = 0
  for(let i = 0; i < rows; i++) {
    
    let row = widget.addStack()
    row.layoutHorizontally()
    row.addSpacer()
    widget.addSpacer()
    
    for(let j = 0; j < columns; j++) {
      
      // if there are not enough stats, start over
      let stat = stats[statIndex]
      if(!stat) {
        statIndex = 0
        stat = stats[0]
      }
      
      const column = row.addStack()
      column.size = new Size(width, 50)
      column.url = stat.link
      row.addSpacer()
      
    column.layoutHorizontally()
    column.centerAlignContent()
    
    const titleSizeStack = column.addStack()
    titleSizeStack.size = new Size(width-50, 50)
    titleSizeStack.centerAlignContent()
    
    const title = titleSizeStack.addText(stat.title)
    title.font = Font.regularSystemFont(15)
    title.minimumScaleFactor = 0.3
    title.lineLimit = 3
    title.textColor = styles.textColor
    title.centerAlignText()
    
    column.addSpacer()
    
    const progressStack = await addProgressCircle(column, stat.value)
    
    const number = progressStack.addText(Math.round(stat.value).toString())
    number.textColor = styles.textColor
    number.font = Font.boldSystemFont(20)
    number.minimumScaleFactor = 0.3
    number.lineLimit = 3
    number.centerAlignText()
    
    statIndex += 1
    }
  }
}

Script.setWidget(widget)
Script.complete()

/*
*
* UTILITY FUNCTIONS
*
*/

function randomArrayItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

// wrapper for progressCircle() to set default values easier
async function addProgressCircle(on, value) {
  let color, backgroundColor, size = 40, barWidth = 4

  if (value >= 75) {
    color = styles.progressCircle.success
    backgroundColor = styles.progressCircle.successBackground
  } else if (value >= 50) {
    color = styles.progressCircle.warning
    backgroundColor = styles.progressCircle.warningBackground
  } else {
    color = styles.progressCircle.error
    backgroundColor = styles.progressCircle.errorBackground
  }

  // modify accessory colours so they look like other accessory widgets
  if (config.runsInAccessoryWidget) {
    color = "hsl(0, 0%, 100%)"
    backgroundColor = "hsl(0, 0%, 10%)"
    size = 58
    barWidth = 5.5
  }
  if(config.widgetFamily === "accessoryRectangular") {
    size = 50
  }

  backgroundColor = styles.progressCircle.transparentBackground
    ? "transparent"
    : backgroundColor

  return progressCircle(on, value, color, backgroundColor, size, barWidth)
}

// https://github.com/Normal-Tangerine8609/Scriptable-Widgets#widget-progress-circle
async function progressCircle(
  on,
  value = 50,
  colour = "hsl(0, 0%, 100%)",
  background = "hsl(0, 0%, 10%)",
  size = 56,
  barWidth = 5.5
) {
  if (value > 1) {
    value /= 100
  }
  if (value < 0) {
    value = 0
  }
  if (value > 1) {
    value = 1
  }

  async function isUsingDarkAppearance() {
    return !Color.dynamic(Color.white(), Color.black()).red
  }
  let isDark = await isUsingDarkAppearance()

  if (colour.split("-").length > 1) {
    if (isDark) {
      colour = colour.split("-")[1]
    } else {
      colour = colour.split("-")[0]
    }
  }

  if (background.split("-").length > 1) {
    if (isDark) {
      background = background.split("-")[1]
    } else {
      background = background.split("-")[0]
    }
  }

  let w = new WebView()
  await w.loadHTML('<canvas id="c"></canvas>')

  let base64 = await w.evaluateJavaScript(
    `
  let colour = "${colour}",
    background = "${background}",
    size = ${size}*3,
    lineWidth = ${barWidth}*3,
    percent = ${value * 100}
      
  let canvas = document.getElementById('c'),
    c = canvas.getContext('2d')
  canvas.width = size
  canvas.height = size
  let posX = canvas.width / 2,
    posY = canvas.height / 2,
    onePercent = 360 / 100,
    result = onePercent * percent
  c.lineCap = 'round'
  c.beginPath()
  c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) )
  c.strokeStyle = background
  c.lineWidth = lineWidth 
  c.stroke()
  c.beginPath()
  c.strokeStyle = colour
  c.lineWidth = lineWidth
  c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + result) )
  c.stroke()
  completion(canvas.toDataURL().replace("data:image/png;base64,",""))`,
    true
  )
  const image = Image.fromData(Data.fromBase64String(base64))

  let stack = on.addStack()
  stack.size = new Size(size, size)
  stack.backgroundImage = image
  stack.centerAlignContent()
  let padding = barWidth * 2
  stack.setPadding(padding, padding, padding, padding)

  return stack
}

// get and catch the data
async function getData() {
  // Set up variables for working with the file
  const fm = FileManager.iCloud()
  const baseDir = fm.documentsDirectory()
  let file = fm.joinPath(baseDir, "can-i-use.json")

  // Find the current date and last updated date of the file
  let currentDate = new Date()
  let updated = fm.modificationDate(file) || new Date()

  // If the file does not exist or was not yet modified today or the stats input has since changed, get new data
  const isFileExists = fm.fileExists(file)
  const isUpdatedToday = currentDate.toDateString() == updated.toDateString()
  let isStatsChanged
  if (isFileExists) {
    if (!fm.isFileDownloaded(file)) {
      await fm.downloadFileFromiCloud(file)
    }
    const data = JSON.parse(fm.readString(file))
    isStatsChanged = JSON.stringify(data.statsInput) !== JSON.stringify(stats)
  }
  if (!isFileExists || !isUpdatedToday || isStatsChanged) {
    const mainReq = new Request(
      "https://raw.githubusercontent.com/Fyrd/caniuse/main/data.json"
    )
    const data = await mainReq.loadJSON()
    const statResults = []
    for (let stat of stats) {
      const isObj = typeof stat != "string"

      const path = isObj ? stat.stat : stat
      const selectedTitle = isObj ? stat.title : null
      const link = `https://caniuse.com/${path}`
      const primaryData = data.data[path]

      // some data will be provided in the main github file but others will only be on the website using mdn web data
      if (primaryData) {
        const value = primaryData.usage_perc_y + primaryData.usage_perc_a
        const title = selectedTitle || primaryData.title

        statResults.push({
          title,
          value,
          link
        })
      } else {
        const req = new Request(link)
        const html = await req.loadString()

        // check that stat is valid
        if (!/<title>[\s\S]*?\|[\s\S]*?<\/title>/.test(html)) {
          console.warn(`Invalid stat: ${stat}`)
          continue
        }

        const title = selectedTitle || html.match(/<title>([\s\S]+?)\|/)[1]
        const value = html.match(
          /<span class="total" title="Total">(\d+(\.\d+)?)%<\/span>/
        )[1]
        statResults.push({
          title: title.trim(),
          value: Number(value),
          link
        })
      }
    }
    const fileContence = {
      statsInput: stats,
      stats: statResults
    }
    // Write the data
    fm.writeString(file, JSON.stringify(fileContence))
  }
  // Read and return the file
  if (!fm.isFileDownloaded(file)) {
    await fm.downloadFileFromiCloud(file)
  }
  const fileContence = JSON.parse(fm.readString(file))
  return fileContence.stats
}
