/*
* progressCircle(on: Stack or Widget, value: number, colour: string, background: string, size: number, barWidth: number) : Promise<Stack>
*
* PARAMS
* on - the stack or widget to add the progress circle to
* value - a number between 1 and 100 to be the circle percentage or a number between 0 and 1 to be the circle percentage
* colour - a HTML supported (hex, rgb, hsl) colour for the progress of the circle. Alternitively, it can be two HTML supported colours seperated by a hyphen (white-black) for the first colour to be active on light mode and second on dark mode
* background - a HTML supported (hex, rgb, hsl) colour for the unfilled progress of the circle. Alternitively, it can be two HTML supported colours seperated by a hyphen (white-black) for the first colour to be active on light mode and second on dark mode
* size - the size of the progress circle
* barWidth - the width of the circular progress bar
*
* RETURNS
* A stack with the background image set to the progress circle and with set padding.
*/

// Example usage
const widget = new ListWidget()

let progressStack = await progressCircle(widget,35)

let sf = SFSymbol.named("cloud.fill")
sf.applyFont(Font.regularSystemFont(26))
sf = progressStack.addImage(sf.image)
sf.imageSize = new Size(26,26)
sf.tintColor = new Color("#fafafa")

widget.presentAccessoryCircular() // Does not present correctly
Script.setWidget(widget)
Script.complete()

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