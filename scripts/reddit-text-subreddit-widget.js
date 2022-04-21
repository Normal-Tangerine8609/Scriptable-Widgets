/*
REDDIT TEXT SUBREDDIT (small widget)

Setup
- Variables with the suffix `Colour` should be a hex colour string
- Variables with the suffix `Size` should be a number
- Variables with the prefix `show` should be a boolean

In the `subreddit` variable, place the name of the subreddit that you want to use. The name does not need the `r/` and should be a subreddit with only text posts.

Example subreddits include showerthoughts, jokes, twosentencehorror, godtiersuperpowers,  quotes and todayilearned
*/

const widgetColour = "#000"
let subreddit = "godtiersuperpowers"

const subredditColour = "#fff"
const subredditSize = 9
const showSubreddit = true

const authorColour = "#fff"
const authorSize = 12
const showAuthor = false

const postTitleColour = "fff"
const postTitleSize =  11
const showPostTitle = true

const postBodyColour = "#fff"
const postBodySize = 11
const showPostBody = true

const footerColour = "#fff"
const footerSize = 11
const showFooter = true

/*
  DO NOT EDIT THE REST OF THE CODE
*/

// Get the available posts
let url = "https://www.reddit.com/r/" +  subreddit + ".json"
let req = new Request(url)
let json = await req.loadJSON()

// Get the random post
const post = json["data"]["children"][Math.floor((Math.random() * 10) + 2)]["data"]

// Get post information
let title = post["title"]
let body = post["selftext"]
let ups = post["ups"]
let awards = post["all_awardings"].length
let comments = post["num_comments"]
let postUrl = post["url"]

// Create the widget
let widget = new ListWidget()
widget.backgroundColor = new Color(widgetColour)
widget.url =  postUrl
let date = new Date()
date.setHours(date.getMinutes() + 30)
widget.refreshAfterDate = date

// Add subreddit title to the widget
if (showSubreddit) {
  subreddit = widget.addText(subreddit)
  subreddit.textColor = new Color(subredditColour)
  subreddit.font = Font.regularSystemFont(subredditSize)
  subreddit.centerAlignText()
  widget.addSpacer(3)
}

// Add author to the widget
if (showAuthor) {
  author = widget.addText("u/" + author)
  author.textColor = new Color(authorColour)
  author.font = Font.regularSystemFont(authorSize)
  author.centerAlignText()
  widget.addSpacer(3)
}

// Add post title to the widget
if (showPostTitle) {
  title = widget.addText(title)
  title.textColor = new Color(postTitleColour)
  title.font = Font.regularSystemFont(postTitleSize)
  title.minimumScaleFactor = .3
  widget.addSpacer(3)
}

// Add text body to the widget
if (showPostBody) {
  body = widget.addText(body)
  body.textColor = new Color(postBodyColour)
  body.font = Font.regularSystemFont(postBodySize)
  body.minimumScaleFactor = .3
}

// Add the footer to the widget
if (showFooter) {
  widget.addSpacer(3)
  footer = widget.addText("𐌣" + ups + "   ☆" + awards + "   ✎" + comments)
  footer.textColor = new Color(footerColour)
  footer.font = Font.regularSystemFont(footerSize)
  footer.minimumScaleFactor = .3
}

// Finish the script
widget.presentSmall()
Script.setWidget(widget)
Script.complete()
