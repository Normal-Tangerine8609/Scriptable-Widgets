// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
/*
 * HTMLGradient
 *
 * HTMLGradient(gradient: string): Promise<LinearGradient>
 *
 * example
 * ------------
 * const widget = new ListWidget()
 * widget.backgroundGradient = await HTMLGradient("to left, red, green 25%, blue-yellow")
 * widget.presentSmall()
 * ------------
 *
 * All parameters for the gradient are in a string and separated by commas.
 *
 * The first parameter is optional and is a degree or direction. If the first parameter is not a degree or direction, the gradient will go from the top to the bottom.
 *
 * Degrees are made with a number and the keyword `deg` directly beside it. `0deg` is a gradient going from the top to the bottom. The numbers continue around a clock. 3 O’clock would be `90deg` (from the left to the right) and so on. Invalid degrees result in `0deg`.
 *
 * example
 * ------------
 * await HTMLGradient("0deg, red, green, blue") // valid
 * await HTMLGradient("55deg, red, green, blue") // valid
 * await HTMLGradient("720deg, red, green, blue") // valid
 * await HTMLGradient("0 deg, red, green, blue") // invalid (space)
 * ------------
 *
 * Directions are word directions like `to top left`, which is from the bottom right to the top left. The valid directions are `to left`, `to right`, `to top`, `to bottom`, `to top left`, `to top right`, `to bottom left`, `to bottom right`, `to left top`, `to right top`, `to left bottom` and `to right bottom`. Invalid directions result in `0deg`.
 *
 * example
 * ------------
 * await HTMLGradient("to left, red, green, blue") // valid
 * await HTMLGradient("to top right, red, green, blue") // valid
 * await HTMLGradient("to  top  right, red, green, blue") // invalid (too many spaces)
 * await HTMLGradient("left, red, green, blue") // invalid (missing `to`)
 * ------------
 *
 * All other parameters are colours. Colours can be any supported HTML colour: colour name, hex, rgb, rgba, hsl and hsla. If it is not a HTML colour, it will be black. Colours can also have a light or dark mode variation by separating the colours respectively by hyphens (`-`).
 *
 * example
 * ------------
 * await HTMLGradient("red, green, blue") // valid
 * await HTMLGradient("hsl(180, 50%,50%), rgb(100, 235, 22)") // valid
 * await HTMLGradient("#0000ff80, rgba(255, 0, 0, 0%)") // valid (supports alpha)
 * await HTMLGradient("lab(56.29% -10.93 16.58 / 50%), color(sRGB 0 0.5 1 / 50%), lch(56.29% 19.86 236.62 / 50%)") // valid but all are black
 * ------------
 *
 * Following the colour you can have a space and specify a location. Locations should go in ascending order and be or be between 0 and 1. Locations can be a percentage. Colours without a specified location will be placed a equal distance between adjacent colours.
 *
 * example
 * ------------
 * await HTMLGradient("red 50%, green, blue") // valid
 * await HTMLGradient("red, green 0.33, blue 1") // valid
 * await HTMLGradient("red 80%, green 10%, blue") // invalid (location are not in acceding order)
 * await HTMLGradient("red -1, green, blue 1.1") // invalid (locations must be between 0 and 1)
 * ------------
 */

// Example
const widget = new ListWidget();
widget.backgroundGradient = await HTMLGradient(
  "to top right, #8a2387, rgb(233, 64, 87), hsl(23, 89%, 54%)"
);
widget.presentSmall();

async function HTMLGradient(gradient) {
  // store colours for faster reuse. If you use this function multiple times, it may be better to move the following line to the top of your scriptable script
  const colorCache = new Map();

  // split into parts by commas not in quotes or brackets
  let splitGradient = gradient
    .split(/,(?![^(]*\))(?![^"']*["'](?:[^"']*["'][^"']*["'])*[^"']*$)/)
    .map((e) => e.trim());

  // get the direction from the first item of gradient
  let gradientDirection;
  const wordDirections = {
    "to top": 0,
    "to top right": 45,
    "to right": 90,
    "to bottom right": 135,
    "to bottom": 180,
    "to bottom left": 225,
    "to left": 270,
    "to top left": 315,
  };
  // check if it is a word direction, degrees direction or none are provided
  const first = splitGradient[0].toLowerCase();
  if (first in wordDirections) {
    splitGradient.shift();
    gradientDirection = wordDirections[first];
  } else if (/\d+\s*deg/.test(first)) {
    splitGradient.shift();
    gradientDirection = Number(first.match(/(\d+)\s*deg/)[1]);
  } else {
    gradientDirection = 0;
  }

  // Get colours and locations
  const colours = [];
  const locations = [];
  for (const part of splitGradient) {
    // Get the location
    const locationMatch = part.match(/\s+(\d+(?:\.\d+)?%?)$/);
    let location = null;
    let colorPart = part;

    if (locationMatch) {
      const rawLocation = locationMatch[1];
      // Locations ending in % are percentages
      if (rawLocation.endsWith("%")) {
        location = Number(rawLocation.slice(0, -1)) / 100;
      } else {
        location = Number(rawLocation);
      }
      colorPart = part.slice(0, locationMatch.index).trim();
    }
    locations.push(location);

    // Get the colour of the part
    let color;
    const [first, second] = colorPart.split("-");
    if (second != null) {
      const [scriptableFirst, scriptableSecond] = await Promise.all([
        colorFromValue(first),
        colorFromValue(second),
      ]);
      color = Color.dynamic(scriptableFirst, scriptableSecond);
    } else {
      color = await colorFromValue(first);
    }
    colours.push(color);
  }

  // Set default first and last locations
  if (locations[0] === null) {
    locations[0] = 0;
  }
  if (locations.at(-1) === null) {
    locations[locations.length - 1] = 1;
  }

  // Set not specified locations
  for (let i = 0; i < locations.length; i++) {
    let currentLocation = locations[i];

    // get next non-null location index
    let index = i + 1;
    while (index < locations.length && locations[index] === null) {
      index++;
    }
    // calculate the difference between each null location for a linear transition
    let difference = (locations[index] - locations[i]) / (index - i);

    // set each between null location
    for (let plusIndex = 1; plusIndex < index - i; plusIndex++) {
      locations[i + plusIndex] = difference * plusIndex + currentLocation;
    }
  }

  // calculate gradient points based on the direction
  const rad = (Math.PI * (gradientDirection - 90)) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const t = 0.5 / Math.max(Math.abs(cos), Math.abs(sin));
  const x1 = 0.5 - t * cos;
  const y1 = 0.5 - t * sin;
  const x2 = 0.5 + t * cos;
  const y2 = 0.5 + t * sin;

  // create and return gradient
  gradient = new LinearGradient();
  gradient.colors = colours;
  gradient.locations = locations;
  gradient.startPoint = new Point(x1, y1);
  gradient.endPoint = new Point(x2, y2);
  return gradient;

  // use WebView() to get a html colour
  async function colorFromValue(c) {
    if (colorCache.has(c)) return colorCache.get(c);

    // hex colours are supported by scriptable
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(c)) {
      return new Color(c);
    }

    // non-hex colours need to be identified
    let w = new WebView();
    await w.loadHTML(`<div id="div"style="color:${c}"></div>`);
    let result = await w.evaluateJavaScript(
      'window.getComputedStyle(document.getElementById("div")).color'
    );

    const rgba = result.match(/\d+(\.\d+)?/g).map(Number);
    const scriptable = rgbaToScriptable(...rgba);
    colorCache.set(c, scriptable);

    return scriptable;

    function rgbaToScriptable(r, g, b, a = 1) {
      const hex = (n) => n.toString(16).padStart(2, "0");
      return new Color(`#${hex(r)}${hex(g)}${hex(b)}`, a);
    }
  }
}
