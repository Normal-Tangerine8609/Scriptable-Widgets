/*
WEATHER CIRCLES (small widget)

The html-widget module must be installed for this script to work.

1. Copy the file from https://github.com/Normal-Tangerine8609/Scriptable-HTML-Widget/blob/main/module/module.js
2. Paste it in a new scriptable file
3. Rename the file to html-widget
*/

/*
OPEN WEATHER MAP INFORMATION

apiKey    = your Open Weather Map api key
lat       = the latitude of where you want the weather data from
lon       = the longitude of where you want the weather data from
useMetric = true or false to use metric or imperial
*/

const apiKey = "YOUR API KEY"
const lat = 100
const lon = 100
const useMetric = true

/*
COLOURS

Using html widget, colours can be any HTML-supported colour (rgb, rgba, hex, hsl, hsla, colour name). Colours can also be split by a `-` for the first colour to be used on light mode and second for darkmode. `background` can also be set to a gradient, but look at the html widget docs before trying.

docs - https://normal-tangerine8609.gitbook.io/html-widget/about/types

background    = widget background colour (or gradient)
weatherSymbol = the weather condition symbol in the top left corner colour
text          = all text colour
*/

const background = "white-black"
const weatherSymbol = "black-white"
const text = "black-white"

/*
SETTINGS FOR THE CIRCULAR PROGRESS BARS

Each value in the json is another json with the key being the type of data. In each of these smaller dictionaries:

low      = the low number for the range used for calculating the percentage
high     = the high number for the range used for calculating the percentage
sf       = the SF symbol name inside the circle
progress = the progress of the circle colour (look above for colour instructions)
unfilled = the unfilled part of the circle colour (look above for colour instructions)
sfColour = the SF symbol colour (look above for colour instructions)

low and high units:

temperature   = °C or °F
humidity      = % (0-100)
clouds        = % (0-100)
uv            = (0-11)
precipitation = % (0-100)
wind          = m/s or mph
*/

const settings = {
	temperature: {
		low: -30,
		high: 30,
		sf: "thermometer",
		progress: "rgba(255,255,255,0.5)",
		unfilled: "hsl(60, 100%, 30%)",
		sfColour: "hsl(60, 100%, 30%)-hsl(60, 100%, 80%)"
	},
	humidity: {
		low: 0,
		high: 100,
		sf: "humidity.fill",
		progress: "rgba(255,255,255,0.5)",
		unfilled: "hsl(210, 100%, 25%)",
		sfColour: "hsl(210, 100%, 25%)-hsl(210, 100%, 75%)"
	},
	precipitation: {
		low: 0,
		high: 100,
		sf: "cloud.drizzle.fill",
		progress: "rgba(255,255,255,0.5)",
		unfilled: "hsl(210, 100%, 25%)",
		sfColour: "hsl(210, 100%, 25%)-hsl(210, 100%, 75%)"
	},
	clouds: {
		low: 0,
		high: 100,
		sf: "cloud.fill",
		progress: "rgba(255,255,255,0.5)",
		unfilled: "hsl(0, 0%, 30%)",
		sfColour: "hsl(0, 0%, 30%)-hsl(0, 0%, 80%)"
	},
	uv: {
		low: 0,
		high: 11,
		sf: "sun.max.fill",
		progress: "rgba(255,255,255,0.5)",
		unfilled: "hsl(60, 100%, 30%)",
		sfColour: "hsl(60, 100%, 30%)-hsl(60, 100%, 80%)"
	},
	wind: {
		low: 0,
		high: 15,
		sf: "wind",
		progress: "rgba(255,255,255,0.5)",
		unfilled: "hsl(0, 0%, 30%)",
		sfColour: "hsl(0, 0%, 30%)-hsl(0, 0%, 80%)"
	}
}

/*
ORDER

The order of temperature, humidity, clouds, uv, precipitation and wind determine where they are located on the widget based on their index:
        -------------
        | 0 | 1 | 2 |
        -------------
        | 3 | 4 | 5 |
        -------------
*/

const order = [
	"temperature",
	"humidity",
	"clouds",
	"uv",
	"precipitation",
	"wind"
]

/*
  DO NOT EDIT THE REST OF THE CODE
*/

// Get the weather data
const weatherData = await getData()

// Collect the useful weather data
const weatherValues = {
	temperature: weatherData.temp.max,
	humidity: weatherData.humidity,
	clouds: weatherData.clouds,
	uv: weatherData.uvi,
	precipitation: weatherData.pop,
	wind: weatherData.wind_speed
}

// SF symbols for the weather conditions
let conditionSymbols = {
	"01d": "sun.max.fill",
	"01n": "moon.fill",
	"02d": "cloud.sun.fill",
	"02n": "cloud.moon.fill",
	"03d": "cloud.fill",
	"03n": "cloud.fill",
	"04d": "smoke.fill",
	"04n": "smoke.fill",
	"09d": "cloud.drizzle.fill",
	"09n": "cloud.drizzle.fill",
	"10d": "cloud.sun.rain.fill",
	"10n": "cloud.moon.rain.fill",
	"11d": "cloud.bolt.fill",
	"11n": "cloud.bolt.fill",
	"13d": "snowflake",
	"13n": "snowflake",
	"50d": "cloud.fog.fill",
	"50n": "cloud.fog.fill"
}

// Store progress circles
let progressCircles = []

// Repeat with each type of circle in their order
for (let type of order) {
	// The value of the weather type
	let value = parseFloat(weatherValues[type])

	// If the type is precipitation convert it to a percentage
	if (type == "precipitation") {
		value *= 100
                value = Math.round(value)
	}

	// The unchanged value of the weather type
	let unChangedValue = value

	// Set the value to the min or max if it is not between the numbers
	if (value > settings[type].high) {
		value = settings[type].high
	}
	if (value < settings[type].low) {
		value = settings[type].low
	}

	// Calculate the percentage of the value
	let percentage = (value / (settings[type].high - settings[type].low)) * 100

	// Find the unit for the type
	let unit = "%"
	if (type == "temperature") {
		unit = useMetric ? "°C" : "°F"
	} else if (type == "wind") {
		unit = useMetric ? " m/s" : " mph"
	} else if (type == "uv") {
		unit = ""
	}
    
	// Add the progress circle to the array
	progressCircles.push(`
    <stack layout="vertically">
      <progressCircle value="${percentage}%" empty-background="${
		settings[type].unfilled
	}" progress-background="${settings[type].progress}">
        <symbol tint-color="${settings[type].sfColour}">${
		settings[type].sf
	}</symbol>
      </progressCircle>
      <spacer space="2"/>
      <stack size="30,10">
        <text class="lable">${unChangedValue + unit}</text>
      </stack>
    </stack>`)
}

// Function to get the weather data and save it for the day
async function getData() {
	// Set up variables for working with the file
	const fm = FileManager.iCloud()
	const baseDir = fm.documentsDirectory()
	let file = fm.joinPath(baseDir, "weatherData.json")

	// Find the current date and last updated date of the file
	let currentDate = new Date()
	let updated = fm.modificationDate(file) || new Date()

	// See if the file does not exist or was not yet modified today
	if (
		!fm.fileExists(file) ||
		currentDate.toDateString() != updated.toDateString()
	) {
		// Get the weather data
		let url = `https://api.openweathermap.org/data/2.5/onecall?exclude=minutely,hourly,current,alerts&lat=${lat}&lon=-${lon}&APPID=${apiKey}&units=${
			useMetric ? "metric" : "imperial"
		}`
		let r = new Request(url)
		let weatherData = await r.loadJSON()
		// Save today's weather data
		let today = weatherData.daily[0]
		fm.writeString(file, JSON.stringify(today))
	}
	// Read and return the file
	if (!fm.isFileDownloaded(file)) {
		await fm.downloadFileFromiCloud(file)
	}
	file = JSON.parse(fm.readString(file))
	return file
}

// Imports html widget
const htmlWidget = importModule("html-widget")

// Html widget template for adding SF symbols
const symbol = async (validate, template, update, styles, attrs, innerText) => {
	const mapping = {
		"url": "url",
		"border-color": "colour",
		"border-width": "posInt",
		"corner-radius": "posInt",
		"image-size": "size",
		"image-opacity": "decimal",
		"tint-color": "colour",
		"resizable": "bool",
		"container-relative-shape": "bool",
		"content-mode": "contentMode",
		"align-image": "alignImage"
	}

	validate(attrs, styles, mapping)
	update(styles, mapping)

	let symbol = SFSymbol.named(innerText)
	if (!symbol) {
		symbol = SFSymbol.named("questionmark.circle")
	}
	let symbolSize = 100
	if (styles["image-size"] !== "null") {
		let [width, height] = styles["image-size"].match(/\d+/g)
		symbolSize = parseInt(width > height ? height : width)
	}
	symbol.applyFont(Font.systemFont(symbolSize))
	await template(`
<img 
  src="data:image/png;base64,${Data.fromPNG(symbol.image).toBase64String()}" 
  url="${styles.url}" 
  border-color="${styles["border-color"]}"
  border-width="${styles["border-width"]}" 
  corner-radius="${styles["corner-radius"]}" 
  image-size="${styles["image-size"]}" 
  image-opacity="${styles["image-opacity"]}" 
  tint-color="${styles["tint-color"]}" 
  content-mode="${styles["content-mode"]}" 
  align-image="${styles["align-image"]}" 
  container-relative-shape="${styles["container-relative-shape"]}" 
  resizable="${styles["resizable"]}"
/>
  `)
}

// Html widget template for adding circular progress bars
const progressCircle = async (
	validate,
	template,
	update,
	styles,
	attrs,
	innerText
) => {
	const mapping = {
		"url": "url",
		"empty-background": "colour",
		"progress-background": "colour",
		"size": "posInt",
		"value": "decimal",
		"bar-width": "posInt"
	}
 
	validate(attrs, styles, mapping)
	let value = /\d*(?:\.\d*)?%?/.exec(attrs.value)[0]
	if (value.endsWith("%")) {
		value = Number(value.replace("%", ""))
		value /= 100
	}
	if (!attrs.value) {
		throw new Error("`progress-circle` tag must have a `value` attribute")
	}
	if (value < 0) {
		throw new Error(`\`value\` attribute must be above \`0\`: ${attrs.value}`)
	}
	if (value > 1) {
		throw new Error(`\`value\` attribute must be below \`1\`: ${attrs.value}`)
	}

	let size = Number(styles.size && styles.size !== "null" ? styles.size : 100)
	let width = Number(
		styles["bar-width"] && styles["bar-width"] !== "null"
			? styles["bar-width"]
			: 10
	)
	async function isUsingDarkAppearance() {
		return !Color.dynamic(Color.white(), Color.black()).red
	}
	let isDark = await isUsingDarkAppearance()

	let colour = styles["empty-background"] || "black-white"
	if (colour.split("-").length > 1) {
		if (isDark) {
			colour = colour.split("-")[1]
		} else {
			colour = colour.split("-")[0]
		}
	}
	let progressColour = styles["progress-background"] || "gray"
	if (progressColour.split("-").length > 1) {
		if (isDark) {
			progressColour = progressColour.split("-")[1]
		} else {
			progressColour = progressColour.split("-")[0]
		}
	}

	let w = new WebView()

	await w.loadHTML('<canvas id="c"></canvas>')
	let base = await w.evaluateJavaScript(
		`var colour = "${colour}",
    progressColour = "${progressColour}",
    size = ${size}*3,
    lineWidth = ${width}*3,
    percent = ${value * 100}
      
  var canvas = document.getElementById('c'),
    c = canvas.getContext('2d')
  canvas.width = size
  canvas.height = size
  var posX = canvas.width / 2,
    posY = canvas.height / 2,
    onePercent = 360 / 100,
    result = onePercent * percent
  c.lineCap = 'round'
  c.beginPath()
  c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) )
  c.strokeStyle = colour
  c.lineWidth = lineWidth 
  c.stroke()
  c.beginPath()
  c.strokeStyle = progressColour
  c.lineWidth = lineWidth
  c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + result) )
  c.stroke()
  completion(canvas.toDataURL())`,
		true
	)
    
	await template(`
    <stack url="${
			styles.url || "null"
		}"  size="${size},${size}" background="${base}" align-content="center" padding="${
		width * 2
	}" children="true">
    </stack>
  `)
}

let addons = {progressCircle, symbol}

// Create the widget
let w = await htmlWidget(
	`
<widget background="${background}">
  <style>
    * {
      font: boldSystemFont, 20;
      text-color: ${text};
    }
    progressCircle {
      size:30;
      bar-width:5;
    }
    progressCircle > symbol {
      image-size: 15,15;
      tint-color: white;
    }
    .lable {
      minimum-scale-factor: 0.1;
      line-limit: 1;
      align-text: center;
    }
  </style>
  <stack layout="horizontally" align-content="center">
    <symbol tint-color="${weatherSymbol}" image-size="20,20">${
		conditionSymbols[weatherData.weather[0].icon]
	}</symbol>
    <spacer space="2"/>
    <text minimum-scale-factor="0.1" line-limit="1">${weatherData.weather[0].description
			.toLowerCase()
			.split(" ")
			.map((w) => w.replace(w[0], w[0].toUpperCase()))
			.join(" ")}</text>
  <spacer/>
  </stack>
  <spacer/>
  <stack layout="horizontally">
    ${progressCircles[0]}
    <spacer/>
    ${progressCircles[1]}
    <spacer/>
    ${progressCircles[2]}
  </stack>
  <spacer/>
  <stack layout="horizontally">
    ${progressCircles[3]}
    <spacer/>
    ${progressCircles[4]}
    <spacer/>
    ${progressCircles[5]}
  </stack>
</widget>
`,
	false,
	addons
)

// Finish the script
w.presentSmall()
Script.setWidget(w)
Script.complete()
