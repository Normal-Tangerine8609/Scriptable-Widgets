//This is meant for a small widget
//You can change the bellow
//Enter hex colours in double quotes for the colours. The light colour will be active if light mode is on and the dark colour will be active if dark mode is on.
//Enter a number for minuetsAfterRefresh
//Enter a number for lowestLeaderboardPos. This will get a player between and including first and your number on the leaderboard. The number needs to be from 1-1000 (it can be 1 or 1000)
let minuetsAfterRefresh = 10
let lowestLeaderboardPos = 3

let backgroundColourLight = "#fff"
let backgroundColourDark = "#000"

let textColourLight =  "#000"
let textColourDark =  "#fff"

//Do not Change Below
//Copy codes for the widgetLink
let cardIds = {
Archers:"26000001",
Arrows:"28000001",
BabyDragon:"26000015",
Balloon:"26000006",
Bandit:"26000046",
BarbarianBarrel:"28000015",
BarbarianHut:"27000005",
Barbarians:"26000008",
Bats:"26000049",
BattleHealer:"26000068",
BattleRam:"26000036",
BombTower:"27000004",
Bomber:"26000013",
Bowler:"26000034",
CannonCart:"26000054",
Cannon:"27000000",
Clone:"28000013",
DarkPrince:"26000027",
DartGoblin:"26000040",
Earthquake:"28000014",
ElectroDragon:"26000063",
ElectroGiant:"26000085",
ElectroSpirit:"26000084",
ElectroWizard:"26000042",
EliteBarbarians:"26000043",
ElixirCollector:"27000007",
ElixirGolem:"26000067",
Executioner:"26000045",
FireSpirits:"26000031",
Fireball:"28000000",
Firecracker:"26000064",
Fisherman:"26000061",
FlyingMachine:"26000057",
Freeze:"28000005",
Furnace:"27000010",
GiantSkeleton:"26000020",
GiantSnowball:"28000017",
Giant:"26000003",
GoblinBarrel:"28000004",
GoblinCage:"27000012",
GoblinGang:"26000041",
GoblinGiant:"26000060",
GoblinHut:"27000001",
Goblins:"26000002",
Golem:"26000009",
Graveyard:"28000010",
Guards:"26000025",
HealSpirit:"28000016",
HogRider:"26000021",
Hunter:"26000044",
IceGolem:"26000038",
IceSpirit:"26000030",
IceWizard:"26000023",
InfernoDragon:"26000037",
InfernoTower:"27000003",
Knight:"26000000",
LavaHound:"26000029",
Lightning:"28000007",
Lumberjack:"26000035",
MagicArcher:"26000062",
MegaKnight:"26000055",
MegaMinion:"26000039",
Miner:"26000032",
MiniPEKKA:"26000018",
MinionHorde:"26000022",
Minions:"26000005",
Mirror:"28000006",
Mortar:"27000002",
MotherWitch:"26000083",
Musketeer:"26000014",
NightWitch:"26000048",
PEKKA:"26000004",
Poison:"28000009",
Prince:"26000016",
Princess:"26000026",
Rage:"28000002",
RamRider:"26000051",
Rascals:"26000053",
Rocket:"28000003",
RoyalDelivery:"28000018",
RoyalGhost:"26000050",
RoyalGiant:"26000024",
RoyalHogs:"26000059",
RoyalRecruits:"26000047",
SkeletonArmy:"26000012",
SkeletonBarrel:"26000056",
SkeletonDragons:"26000080",
Skeletons:"26000010",
Sparky:"26000033",
SpearGoblins:"26000019",
Tesla:"27000006",
TheLog:"28000011",
ThreeMusketeers:"26000028",
Tombstone:"27000009",
Tornado:"28000012",
Valkyrie:"26000011",
WallBreakers:"26000058",
Witch:"26000007",
Wizard:"26000017",
XBow:"27000008",
Zap:"28000008",
Zappies:"26000052",
}
//Sets correct colours
let backgroundColour = Color.dynamic(new Color(backgroundColourLight),new Color(backgroundColourDark))
let textColour = Color.dynamic(new Color(textColourLight),new Color(textColourDark))

//Gets top players
let req = new Request("https://royaleapi.com/players/leaderboard?lang=en")
let html = await req.loadString()

let playerjson = html.split("initRoster($('#roster'), ")[1]
playerjson = playerjson.split(", null, is_season);")[0]
playerjson = JSON.parse(playerjson)

//Gets random player
if(lowestLeaderboardPos > 1000 || lowestLeaderboardPos < 1) {
lowestLeaderboardPos = 1000
}
let playerNumber = Math.floor(Math.random() * (lowestLeaderboardPos))
let playerName = playerjson[playerNumber]["name"]
let playerTag = playerjson[playerNumber]["tag"]

//Sets up the deck
req = new Request("https://royaleapi.com/player/" + playerTag)
html = await req.loadString()
deck = html.split(/<h3 class="ui header margin0">\nDeck <\/h3>/)[1]
deck = deck.split('<img class="deck_card')

let cards = []
let ids = []

//Gets images and copy ids for the cards
for(i = 1; i < 9; i ++) {
card = deck[i]

let img = card.split('src="')[1]
img = img.split('" />')[0]
cards.push(img)

let name = card.split('alt="')[1]
name = name.split('"')[0]
name = name.split(" ").join("")
name = name.split(".").join("")
name = name.split("-").join("")
ids.push(cardIds[name])

}
//Creates the widget url
let widgetLink = "clashroyale://copyDeck?deck=" + ids.join(";")

//Makes widget
let widget = new ListWidget()
widget.backgroundColor = backgroundColour
let date = new Date()
date.setMinutes(date.getMinutes() + minuetsAfterRefresh)
widget.refreshAfterDate = date
widget.url = widgetLink

//Adds player name to widget
let text = widget.addText(playerName)
text.textColor = textColour
text.font = Font.mediumRoundedSystemFont(20)
text.minimumScaleFactor = .5
text.centerAlignText()
text.lineLimit = 1
widget.addSpacer(5)

//Adds player position to widget
let playerPos = playerNumber + 1
playerPos = widget.addText("Leaderboard: " + playerPos.toString())
playerPos.textColor = textColour
playerPosfont = Font.mediumRoundedSystemFont(15)
playerPos.minimumScaleFactor = .5
playerPos.centerAlignText()
playerPos.lineLimit = 1
widget.addSpacer(5)

//Sets up for deck layout
let level = widget.addStack()
level.layoutHorizontally()
level.centerAlignContent()
level.addSpacer()
widget.addSpacer(4)

let pos = 0

//Creates deck
for(var card of cards) {
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
  
  req = new Request(card)
  card = await req.loadImage()
  card = level.addImage(card)
  card.imageSize = new Size(32, 32)
}
level.addSpacer()

//Finishes script
widget.presentSmall()
Script.setWidget(widget)
Script.complete()
