/*
// This script provides a `createChainWidget` function which allows 
// chaining properties and methods. The naming of the methods is consistent 
// with the regular scriptable names, however, things that would be applied 
// via expressions are applied with methods. For example:
// text.textColor = Color.red() --> becomes --> text.textColor(Color.red())
// The below comment has all the methods that can be used.

const sf = SFSymbol.named("bolt");
const image = sf.image;

const widget = createChainWidget();
widget
  .backgroundColor(Color.red())
  .backgroundGradient(new LinearGradient())
  .backgroundImage(image)
  .setPadding(1, 1, 1, 1)
  .useDefaultPadding()
  .refreshAfterDate(new Date())
  .spacing(4)
  .url("https://example.com");
//.addAccessoryWidgetBackground()
//.presentAccessoryCircular()
//.presentAccessoryInline()
//.presentAccessoryRectangular()
//.presentExtraLarge()
//.presentLarge()
//.presentMedium()
//.presentSmall();

widget
  .addDate(new Date())
  .date(new Date())
  .applyDateStyle()
  //.applyOffsetStyle()
  //.applyRelativeStyle()
  //.applyTimeStyle()
  //.applyTimerStyle()
  .textColor(Color.green())
  .font(Font.regularMonospacedSystemFont(20))
  .lineLimit(2)
  .minimumScaleFactor(0.5)
  .textOpacity(1)
  .centerAlignText()
  .rightAlignText()
  .leftAlignText()
  .shadowColor(Color.blue())
  .shadowOffset(new Point(1, 2))
  .shadowRadius(3)
  .url("https://example.com");

widget.addSpacer(2).length(30);

widget
  .addImage(image)
  .image(image)
  .borderColor(Color.gray())
  .borderWidth(3)
  .cornerRadius(5)
  .imageSize(new Size(50, 30))
  .imageOpacity(0.8)
  .tintColor(Color.brown())
  .centerAlignImage()
  .rightAlignImage()
  .leftAlignImage()
  .resizable(false)
  .containerRelativeShape(false)
  .applyFillingContentMode()
  .applyFittingContentMode()
  .url("https://example.com");

const stack = widget
  .addStack()
  .backgroundColor(Color.magenta())
  .backgroundGradient(new LinearGradient())
  .backgroundImage(null)
  .borderColor(Color.gray())
  .borderWidth(3)
  .cornerRadius(4)
  .size(new Size(30, 20))
  .setPadding(1, 1, 1, 1)
  .useDefaultPadding()
  .spacing(4)
  .layoutHorizontally()
  .layoutVertically()
  .bottomAlignContent()
  .centerAlignContent()
  .topAlignContent()
  .url("https://example.com");

stack
  .addText("Overwritten text")
  .text("The text")
  .textColor(Color.green())
  .font(Font.regularMonospacedSystemFont(20))
  .lineLimit(2)
  .minimumScaleFactor(0.5)
  .textOpacity(0.3)
  .centerAlignText()
  .rightAlignText()
  .leftAlignText()
  .shadowColor(Color.blue())
  .shadowOffset(new Point(1, 2))
  .shadowRadius(3)
  .url("https://example.com");

widget.presentLarge();
*/

function createChainWidget() {
  class ChainDate {
    constructor(widgetDate) {
      this.widgetDate = widgetDate;
    }
    applyDateStyle() {
      this.widgetDate.applyDateStyle();
      return this;
    }
    applyOffsetStyle() {
      this.widgetDate.applyOffsetStyle();
      return this;
    }
    applyRelativeStyle() {
      this.widgetDate.applyRelativeStyle();
      return this;
    }
    applyTimeStyle() {
      this.widgetDate.applyTimeStyle();
      return this;
    }
    applyTimerStyle() {
      this.widgetDate.applyTimerStyle();
      return this;
    }
    centerAlignText() {
      this.widgetDate.centerAlignText();
      return this;
    }
    date(date) {
      this.widgetDate.date = date;
      return this;
    }
    font(font) {
      this.widgetDate.font = font;
      return this;
    }
    leftAlignText() {
      this.widgetDate.leftAlignText();
      return this;
    }
    lineLimit(number) {
      this.widgetDate.lineLimit = number;
      return this;
    }
    minimumScaleFactor(number) {
      this.widgetDate.minimumScaleFactor = number;
      return this;
    }
    rightAlignText() {
      this.widgetDate.rightAlignText();
      return this;
    }
    shadowColor(color) {
      this.widgetDate.shadowColor = color;
      return this;
    }
    shadowOffset(point) {
      this.widgetDate.shadowOffset = point;
      return this;
    }
    shadowRadius(number) {
      this.widgetDate.shadowRadius = number;
      return this;
    }
    textColor(color) {
      this.widgetDate.textColor = color;
      return this;
    }
    textOpacity(number) {
      this.widgetDate.textOpacity = number;
      return this;
    }
    url(url) {
      this.widgetDate.url = url;
      return this;
    }
  }
  class ChainImage {
    constructor(widgetImage) {
      this.widgetImage = widgetImage;
    }
    applyFillingContentMode() {
      this.widgetImage.applyFillingContentMode();
      return this;
    }
    applyFittingContentMode() {
      this.widgetImage.applyFittingContentMode();
      return this;
    }
    borderColor(color) {
      this.widgetImage.borderColor = color;
      return this;
    }
    borderWidth(number) {
      this.widgetImage.borderWidth = number;
      return this;
    }
    centerAlignImage() {
      this.widgetImage.centerAlignImage();
      return this;
    }
    containerRelativeShape(bool) {
      this.widgetImage.containerRelativeShape = bool;
      return this;
    }
    cornerRadius(number) {
      this.widgetImage.cornerRadius = number;
      return this;
    }
    image(image) {
      this.widgetImage.image = image;
      return this;
    }
    imageOpacity(number) {
      this.widgetImage.imageOpacity = number;
      return this;
    }
    imageSize(size) {
      this.widgetImage.imageSize = size;
      return this;
    }
    leftAlignImage() {
      this.widgetImage.leftAlignImage();
      return this;
    }
    resizable(bool) {
      this.widgetImage.resizable = bool;
      return this;
    }
    rightAlignImage(color) {
      this.widgetImage.rightAlignImage();
      return this;
    }
    tintColor(color) {
      this.widgetImage.tintColor = color;
      return this;
    }
    url(url) {
      this.widgetImage.url = url;
      return this;
    }
  }
  class ChainSpacer {
    constructor(spacer) {
      this.widgetSpacer = spacer;
    }
    length(number) {
      this.widgetSpacer.length = number;
      return this;
    }
  }
  class ChainText {
    constructor(widgetText) {
      this.widgetText = widgetText;
    }
    centerAlignText() {
      this.widgetText.centerAlignText();
      return this;
    }
    font(font) {
      this.widgetText.font = font;
      return this;
    }
    leftAlignText() {
      this.widgetText.leftAlignText();
      return this;
    }
    lineLimit(number) {
      this.widgetText.lineLimit = number;
      return this;
    }
    minimumScaleFactor(number) {
      this.widgetText.minimumScaleFactor = number;
      return this;
    }
    rightAlignText() {
      this.widgetText.rightAlignText();
      return this;
    }
    shadowColor(color) {
      this.widgetText.shadowColor = color;
      return this;
    }
    shadowOffset(point) {
      this.widgetText.shadowOffset = point;
      return this;
    }
    shadowRadius(number) {
      this.widgetText.shadowRadius = number;
      return this;
    }
    textColor(color) {
      this.widgetText.textColor = color;
      return this;
    }
    text(string) {
      this.widgetText.text = string;
      return this;
    }
    textOpacity(number) {
      this.widgetText.textOpacity = number;
      return this;
    }
    url(url) {
      this.widgetText.url = url;
      return this;
    }
  }
  class ChainStack {
    constructor(widgetStack) {
      this.widgetStack = widgetStack;
    }
    backgroundColor(color) {
      this.widgetStack.backgroundColor = color;
      return this;
    }
    backgroundGradient(gradient) {
      this.widgetStack.backgroundGradient = gradient;
      return this;
    }
    backgroundImage(image) {
      this.widgetStack.backgroundImage = image;
      return this;
    }
    borderColor(color) {
      this.widgetStack.borderColor = color;
      return this;
    }
    borderWidth(number) {
      this.widgetStack.borderWidth = number;
      return this;
    }
    bottomAlignContent() {
      this.widgetStack.bottomAlignContent();
      return this;
    }
    centerAlignContent() {
      this.widgetStack.centerAlignContent();
      return this;
    }
    cornerRadius(number) {
      this.widgetStack.cornerRadius = number;
      return this;
    }
    layoutHorizontally() {
      this.widgetStack.layoutHorizontally();
      return this;
    }
    layoutVertically() {
      this.widgetStack.layoutVertically();
      return this;
    }
    setPadding(top, leading, bottom, trailing) {
      this.widgetStack.setPadding(top, leading, bottom, trailing);
      return this;
    }
    size(size) {
      this.widgetStack.size = size;
      return this;
    }
    spacing(number) {
      this.widgetStack.spacing = number;
      return this;
    }
    topAlignContent() {
      this.widgetStack.topAlignContent();
      return this;
    }
    url(url) {
      this.widgetStack.url = url;
      return this;
    }
    useDefaultPadding() {
      this.widgetStack.useDefaultPadding();
      return this;
    }
    addDate(date) {
      return new ChainDate(this.widgetStack.addDate(date));
    }
    addImage(image) {
      return new ChainImage(this.widgetStack.addImage(image));
    }
    addSpacer(length) {
      return new ChainSpacer(this.widgetStack.addSpacer(length));
    }
    addText(string) {
      return new ChainText(this.widgetStack.addText(string));
    }
    addStack() {
      return new ChainStack(this.widgetStack.addStack());
    }
  }
  class ChainWidget {
    constructor() {
      this.widget = new ListWidget();
    }
    backgroundColor(color) {
      this.widget.backgroundColor = color;
      return this;
    }
    backgroundGradient(gradient) {
      this.widget.backgroundGradient = gradient;
      return this;
    }
    backgroundImage(image) {
      this.widget.backgroundImage = image;
      return this;
    }
    refreshAfterDate(date) {
      this.widget.refreshAfterDate = date;
      return this;
    }
    spacing(space) {
      this.widget.spacing = space;
      return this;
    }
    url(url) {
      this.widget.url = url;
      return this;
    }
    addAccessoryWidgetBackground(bool) {
      this.widget.addAccessoryWidgetBackground = bool;
      return this;
    }
    setPadding(top, leading, bottom, trailing) {
      this.widget.setPadding(top, leading, bottom, trailing);
      return this;
    }
    useDefaultPadding() {
      this.widget.useDefaultPadding();
      return this;
    }
    presentAccessoryCircular() {
      this.widget.presentAccessoryCircular();
      return this;
    }
    presentAccessoryInline() {
      this.widget.presentAccessoryInline();
      return this;
    }
    presentAccessoryRectangular() {
      this.widget.presentAccessoryRectangular();
      return this;
    }
    presentExtraLarge() {
      this.widget.presentExtraLarge();
      return this;
    }
    presentSmall() {
      this.widget.presentSmall();
      return this;
    }
    presentMedium() {
      this.widget.presentMedium();
      return this;
    }
    presentLarge() {
      this.widget.presentLarge();
      return this;
    }
    addDate(date) {
      return new ChainDate(this.widget.addDate(date));
    }
    addImage(image) {
      return new ChainImage(this.widget.addImage(image));
    }
    addSpacer(length) {
      return new ChainSpacer(this.widget.addSpacer(length));
    }
    addText(string) {
      return new ChainText(this.widget.addText(string));
    }
    addStack() {
      return new ChainStack(this.widget.addStack());
    }
  }
  return new ChainWidget();
}

module.exports = createChainWidget;
