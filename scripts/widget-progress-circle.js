/*
 * progressCircle(on: Stack or Widget, value: number, colour: string, background: string, size: number, barWidth: number) : Promise<Stack>
 *
 * PARAMS
 * on - the stack or widget to add the progress circle to
 * value - a number between 0 and 1 or a number between 1 and 100 to be the circle percentage. Note that 1 will default to 100% full rather than 1% full. To avoid this, you can divide the number by 100 to ensure it is treated as a value between 0 and 1.
 * colour - a HTML supported (hex, rgb, hsl) colour for the progress of the circle. Alternatively, it can be two HTML supported colours separated by a hyphen (white-black) for the first colour to be active on light mode and second on dark mode
 * background - a HTML supported (hex, rgb, hsl) colour for the unfilled progress of the circle. Alternatively, it can be two HTML supported colours separated by a hyphen (white-black) for the first colour to be active on light mode and second on dark mode
 * size - the size of the progress circle
 * barWidth - the width of the circular progress bar
 *
 * RETURNS
 * A stack with the background image set to the progress circle and with set padding.
 */

// Example usage
const widget = new ListWidget();

let progressStack = await progressCircle(widget, 0.65);

let sf = SFSymbol.named("cloud.fill");
sf.applyFont(Font.regularSystemFont(26));
sf = progressStack.addImage(sf.image);
sf.imageSize = new Size(26, 26);
sf.tintColor = new Color("#fafafa");

widget.presentAccessoryCircular(); // Does not present correctly
Script.setWidget(widget);
Script.complete();

async function progressCircle(
  on,
  value = 50,
  colour = "hsl(0, 0%, 100%)",
  background = "hsl(0, 0%, 10%)",
  size = 56,
  barWidth = 5.5
) {
  // Normalize the value
  if (value > 1) {
    value /= 100;
  }
  if (value < 0) {
    value = 0;
  }
  if (value > 1) {
    value = 1;
  }

  async function isUsingDarkAppearance() {
    return !Color.dynamic(Color.white(), Color.black()).red;
  }
  let isDark = await isUsingDarkAppearance();

  const resolveColour = (colour) =>
    colour.includes("-") ? colour.split("-")[isDark ? 1 : 0] : colour;

  const foregroundColor = resolveColour(colour);
  const backgroundColour = resolveColour(background);

  let w = new WebView();
  await w.loadHTML('<canvas id="c"></canvas>');

  let base64 = await w.evaluateJavaScript(
    `
    const size = ${size * 3}
    const lineWidth = ${barWidth * 3}
    const percent = ${value * 100}

    const canvas = document.getElementById('c')
    const c = canvas.getContext('2d')
    canvas.width = canvas.height = size
    const center = size / 2
    const radius = (size - lineWidth - 1) / 2
    const start = Math.PI * 1.5
    const end = start + Math.PI * 2 * (percent / 100)

    c.lineCap = 'round'
    c.lineWidth = lineWidth

    // Background arc
    c.beginPath()
    c.arc(center, center, radius, 0, Math.PI * 2)
    c.strokeStyle = "${backgroundColour}"
    c.stroke()

    // Progress arc
    c.beginPath()
    c.arc(center, center, radius, start, end)
    c.strokeStyle = "${foregroundColor}"
    c.stroke()

    completion(canvas.toDataURL().replace("data:image/png;base64,", ""))
    `,
    true
  );
  const image = Image.fromData(Data.fromBase64String(base64));

  const stack = on.addStack();
  stack.size = new Size(size, size);
  stack.backgroundImage = image;
  stack.centerAlignContent();
  const padding = barWidth * 2;
  stack.setPadding(padding, padding, padding, padding);

  return stack;
}
