//This is meant for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours. The light colour will be active if light mode is on and the dark colour will be active if dark mode is on.
//Enter your clan tag below  without the # but still in double quotes.
//Enter a number for minuetsAfterRefresh and minFame
//Enter true or false for useShadows
let minuetsAfterRefresh = 10
let minFame = 800
let clanTag = "YUGJCLGU"

let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"


let titleColourLight =  "#000"
let titleColourDark =  "#fff"

let textColourLight =  "#000"
let textColourDark =  "#fff"

let useShadows = false
let shadowColourLight = "#000"
let shadowColourDark = "#000"
//Do not Change Below
//Sets correct colours
let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let titleColour = Color.dynamic(new Color(titleColourLight),new Color(titleColourDark))
let textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))
let shadowColour = Color.dynamic(new Color(shadowColourLight),new Color(shadowColourDark))

//Gets html and fame png from royale api
let req = new Request("https://cdn.royaleapi.com/static/img/ui/cw-fame.png?t=10eb18d8c")
let fameImg = await req.loadImage()

let url = "https://royaleapi.com/clan/" + clanTag + "/war/race"
req = new Request(url)
let html = await req.loadString()

//Makes widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
let date = new Date()
date.setMinutes(date.getMinutes() + minuetsAfterRefresh)
widget.refreshAfterDate = date

//Adds first title
addTitle("River Race")

//Sets up layout of widget
let firstStack = widget.addStack()
firstStack.layoutHorizontally()
let clanStack = firstStack.addStack()
clanStack.layoutVertically()
firstStack.addSpacer(10)
let fameStack = firstStack.addStack()
fameStack.layoutVertically()


//Finds clans and adds them to widget
let clans = html.split('<table class="ui attached unstackable standings table">')[1]
clans = clans.split("</table>")[0]
clans = clans.split("</tr>")

for(var clan of clans) {
  let stack = clanStack.addStack()
  stack.layoutHorizontally()
  stack.centerAlignContent()
  
  if(clan.split('src="').length > 1) {
    let img = clan.split('src="')[1]
    img = img.split('"')[0]
    req = new Request(img)
    let clanImg = await req.loadImage()
    
    let clanName = ""
    if(clan.split('class="clan_name active"').length > 1){
  clanName = clan.split('class="clan_name active">')[1]
    } else {
    clanName = clan.split('class="clan_name ">')[1]
  }
  clanName = clanName.split("</a>")[0]
  clanName = clanName.split("\n").join("")
  clanImg = stack.addImage(clanImg)
  clanImg.imageSize = new Size(10, 10)
  
  clanName = stack.addText(clanName)
  clanName.font = Font.mediumRoundedSystemFont(8)
  clanName.textColor = textColour
  clanName.minimumScaleFactor = .6
  clanName.lineLimit = 1
  if(useShadows) {
    clanName.shadowColor = shadowColour
    clanName.shadowRadius = 1
  }
  clanStack.addSpacer(1)
}
}
//Adds the fame to the clans
for(var clan of clans) {
  let stack = fameStack.addStack()
  stack.layoutHorizontally()
  stack.centerAlignContent()
  
  if(clan.split('src="').length > 1) {
  let repair = clan.split('<td class="right aligned repair bg_content">')[1]
  repair = repair.split("</td>")[0]
  let fame = clan.split('<td class="right aligned fame bg_content">')[1]
  fame = fame.split("</td>")[0]
  let compleat = parseInt(repair, 10) + parseInt(fame, 10)
  
  
  let clanFame = stack.addImage(fameImg)
  clanFame.imageSize = new Size(10, 10)
  
  addTxt(stack, compleat.toString())
  fameStack.addSpacer(1)
}
}

//Finds low fame players
let players = html.split('<tr class="player "')
let lowFamePlayers = 0
for(var player of players) {
  if(player !== players[0]) {
  let fameEarned = player.split('<div class="value_bg contribution">')[1]
  fameEarned = fameEarned.split("</div>")[0]
  fameEarned = parseInt(fameEarned, 10)
  if(fameEarned < minFame)
  lowFamePlayers += 1
  }
}

//Finds war decks used this week
let warDecksUsed = html.split('<div class="value_bg decks_used popup" data-content="War Decks Used" data-sort="decks_used">')[1]
warDecksUsed = warDecksUsed.split("</div>")[0]
warDecksUsed = warDecksUsed.split("\n").join("")

//Finds war decks used today
let warDecksUsedToday = html.split('<div class="value_bg decks_used_today popup desc" data-content="War Decks Used Today" data-sort="decks_used_today">')[1]
warDecksUsedToday = warDecksUsedToday.split("</div>")[0]
warDecksUsedToday = warDecksUsedToday.split("\n").join("")

//Finds boat attacks made
let boatAttacks = html.split('<div class="value_bg boat_attacks popup" data-content="Boat Attacks" data-sort="boat_attacks">')[1]
boatAttacks = boatAttacks.split("</div>")[0]
boatAttacks = boatAttacks.split("\n").join("")

//Adds another title
widget.addSpacer(5)
addTitle("Stats")

//Sets up widget layout
firstStack = widget.addStack()
firstStack.layoutHorizontally()

let statStack = firstStack.addStack()
statStack.layoutVertically()
firstStack.addSpacer(5)
let resultStack = firstStack.addStack()
resultStack.layoutVertically()

//Sets up first column
addTxt(statStack, " Low Fame Contributors")
addTxt(statStack, " War Decks Used Today")
addTxt(statStack, " War Decks Used")
addTxt(statStack, " Boat Attack Attempts")

//Sets up second column
addTxt(resultStack, lowFamePlayers.toString())
addTxt(resultStack, warDecksUsedToday)
addTxt(resultStack, warDecksUsed)
addTxt(resultStack, boatAttacks)

widget.presentSmall()
Script.setWidget(widget)
Script.complete()

function addTxt(target, text) {
text = target.addText(text)
text.font = Font.mediumRoundedSystemFont(8)
text.textColor = textColour
if(useShadows) {
  text.shadowColor = shadowColour
  text.shadowRadius = 1
}
}

function addTitle(text) {
text = widget.addText(text)
text.font = Font.mediumRoundedSystemFont(10)
text.textColor = titleColour
text.centerAlignText()
if(useShadows) {
  text.shadowColor = shadowColour
  text.shadowRadius = 1
  widget.addSpacer(3)
}
}
