//This is menat for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours. 
//Enter numbers for the sizes and space bellow
//Enter true or false for show things
//Enter the subreddit you want to use in the subreddit one (you do not need the r/). This widget only works for text based subreddits.
// some good subreddits are showerthoughts, jokes, twosentencehorror, godtiersuperpowers,  quotes and todayilearned


let widgetColour = "#000"
let subreddit = "godtiersuperpowers"

let subredditColour = "#fff"
let subredditSize = 9
let showSubreddit = true

let authorColour = "#fff"
let authorSize = 12
let showAuthor = false

let postTitleColour = "fff"
let postTitleSize =  11
let showPostTitle = true

let postBodyColour = "#fff"
let postBodySize = 11
let showPostBody = true

let footerColour = "#fff"
let footerSize = 11
let showFooter = true

//Do Not Change Below
let widget = new ListWidget()
widget.backgroundColor = new Color(widgetColour)
let date = new Date()
date.setHours(date.getMinutes() + 30)
widget.refreshAfterDate = date

let url = "https://www.reddit.com/r/" +  subreddit + ".json"
let req = new Request(url)
let json = await req.loadJSON()
let postNumber = Math.floor((Math.random() * 10) + 2);
post = json["data"]["children"][postNumber]["data"]

let title = post["title"]
let body = post["selftext"]
let ups = post["ups"]
let author = post["author"]
let comments = post["num_comments"]
subreddit = post["subreddit"]
let postUrl = post["url"]

let awards = post["all_awardings"]
let newAwards = []
for (var award of awards) {
newAwards.push(award["name"])
}
awards = newAwards.join(", ")
let numberOfAwards = newAwards.length + 1

if (showSubreddit) {
subreddit = widget.addText(subreddit)
subreddit.textColor = new Color(subredditColour)
subreddit.font = Font.mediumRoundedSystemFont(subredditSize)
subreddit.centerAlignText()
widget.addSpacer(3)
}

if (showAuthor) {
author = widget.addText("u/" + author)
author.textColor = new Color(authorColour)
author.font = Font.mediumRoundedSystemFont(authorSize)
author.centerAlignText()
widget.addSpacer(3)
}

if (showPostTitle) {
title = widget.addText(title)
title.textColor = new Color(postTitleColour)
title.font = Font.mediumRoundedSystemFont(postTitleSize)
title.minimumScaleFactor = .3
}


if (showPostBody) {
body = widget.addText(body)
body.textColor = new Color(postBodyColour)
body.font = Font.mediumRoundedSystemFont(postBodySize)
body.minimumScaleFactor = .3
}

if (showFooter) {
widget.addSpacer(2)
footer = widget.addText("𐌣" + ups + "   ☆" + numberOfAwards + "   ✎" + comments)
footer.textColor = new Color(footerColour)
footer.font = Font.mediumRoundedSystemFont(footerSize)
footer.minimumScaleFactor = .3
}


widget.presentSmall()
widget.url =  postUrl
Script.setWidget(widget)
Script.complete()
