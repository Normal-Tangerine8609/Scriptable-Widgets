// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: file-download;
// share-sheet-inputs: plain-text, url;

// Type of notification to appear when finished some actions. Can be "notification", "alert" or null/undefined. Do not change anything else.

const notifyType = "notification"

const fm = FileManager.iCloud()
const baseDir = fm.documentsDirectory()

if (config.runsInWidget) {
  // Run from widget
  await createWidget()
  Script.complete()
} else if (args.plainTexts[0]) {
  // Run from share sheet
  await addFromUrl(args.plainTexts[0])
  Script.complete()
} else {
  // Run from Scriptable
  let mainMenu = makeAlert(null, null, [
    "Check For Updates",
    "Add Script",
    "Remove Script",
    "Rename Script",
    "View Scripts"
  ],"Cancel")
  switch (await mainMenu.presentSheet()) {
    case 0:
      await askForUpdates(await checkUpdates())
      Script.complete()
      break
    case 1:
      let urlAlert = makeAlert("Enter A URL", "Enter a URL or use clipboard", [
        "Use Clipboard",
        "Use Text"
      ])
      urlAlert.addTextField("URL").setURLKeyboard()
      let url =
        (await urlAlert.presentAlert()) == 1
          ? urlAlert.textFieldValue(0)
          : Pasteboard.paste()
      await addFromUrl(url)
      Script.complete()
      break
    case 2:
      await removeScript()
      Script.complete()
      break
    case 3:
      await renameScript()
      Script.complete()
      break
    case 4:
      await viewScript()
      Script.complete()
      break
    default:
      Script.complete()
  }
}

// utility function
function makeAlert(title, message, options,cancel) {
  let alert = new Alert()
  alert.message = message
  alert.title = title
  for (let option of options) {
    alert.addAction(option)
  }
  if(cancel) {
    alert.addCancelAction(cancel)
  }
  return alert
}

async function getData() {
  let file = fm.joinPath(baseDir, "githubScripts.json")
  if (!fm.fileExists(file)) {
    return {scripts: []}
  }
  if (!fm.isFileDownloaded(file)) {
    await fm.downloadFileFromiCloud(file)
  }
  const data = JSON.parse(fm.readString(file))
  return data.scripts
}

function writeData(data) {
  fm.writeString(
      fm.joinPath(baseDir, "githubScripts.json"),
      JSON.stringify({scripts: data})
      )
}

async function notify(title, text) {
  if (notifyType == "notification" || notifyType == "alert") {
    if (notifyType == "notification") {
      let notification = new Notification()
      notification.title = title
      notification.body = text
      await notification.schedule()
    } else {
      let a = makeAlert(title, text, [], "OK")
      await a.presentAlert()
    }
  }
}

async function addFromUrl(url) {
  if (!url) {
    let a = makeAlert("No URL Specified", "", [],"OK")
    await a.presentAlert()
    return
  }

  if (url.startsWith("https://raw.githubusercontent.com")) {
    url = url
      .replace("https://raw.githubusercontent.com", "https://github.com")
      .replace(/(https:\/\/[^/]*\/[^/]*\/[^/]*\/)([^/]*)/, "$1blob/$2")
     console.log(url)
  }
  
  if (
    !/^\s*https:\/\/github.com\/.+?\/(blob|raw)\/.+?\.(js|scriptable)\s*$/.test(
      url
    )
  ) {
    let a = makeAlert(
      "Invalid URL",
      "URL must be a GitHub blob or raw .js or .scriptable file",
      [],
      "OK"
    )
    await a.presentAlert()
    return
  }
  
  const commitsUrl = url.replace(/\/(blob|raw)\//, "/commits/")
  const rawUrl = url.replace(/\/blob\//, "/raw/")
  
  const commitsHTMl = await new Request(commitsUrl).loadString()
  
  const lastEditDate = new Date(
    commitsHTMl.match(
      /<relative-time datetime="(.+?)" class="no-wrap">.+?<\/relative-time>/
    )[1]
  ).toString()
  
  const content = await new Request(rawUrl).loadString()
  
  let name = url.match(/([^/]+?)\.(?:js|scriptable)$/)[1]
  
  
  // If it is this script, the name is the current script name
  if (
    /^\s*https:\/\/github.com\/Normal-Tangerine8609\/Scriptable-Git-Script-Download-Update\/(blob|raw)\/main\/git-script.js\s*$/.test(
      url
    )
  ) {
    name = Script.name()
  } else {
    let nameAlert = makeAlert("Chose A Script Name", null, ["Done"])
    nameAlert.addTextField("", name)
    await nameAlert.presentAlert()
    name = nameAlert.textFieldValue(0)
    
    if (fm.fileExists(fm.joinPath(baseDir, name + ".js"))) {
      let a = makeAlert(
        "Duplicate Name",
        "Script name must not be the same as another script name",
        [],
        "OK"
      )
      await a.presentAlert()
      return
    }
    
    }
    let data = await getData()
    data.push({name, url, lastEditDate})
    writeData(data)
    
    fm.writeString(fm.joinPath(baseDir, name + ".js"), content)
    
    await notify(
      "Script Added",
      `The script ${name} has been added to the update list and your scriptable collection`
    )
}

async function removeScript() {
  let data = await getData()
  let alert = makeAlert("What Script Would You Like To Remove?", null, data.map(e => e.name), "Cancel")
  let removedScript = await alert.presentSheet()
  
  if (removedScript != -1) {
    let oldName = data[removedScript].name
    data.splice(removedScript, 1)
    writeData(data)
    
    await notify(
      "Script Removed",
      `The script ${oldName} has been removed from the update list`
    )
  }
}

async function renameScript() {
  let data = await getData()
  
  let alert = makeAlert("What Script Would You Like To Rename?", null, data.map(e => e.name), "Cancel")
  
  let renamedScript = await alert.presentSheet()
  
  if (renamedScript != -1) {
    let script = data[renamedScript]
    
    let nameAlert = makeAlert("Chose A Script Name", null, ["Done"])
    nameAlert.addTextField("", script.name)
    await nameAlert.presentAlert()
    let name = nameAlert.textFieldValue(0)
    
    if (fm.fileExists(fm.joinPath(baseDir, name + ".js"))) {
      let a = makeAlert(
        "Duplicate Name",
        "Script name must not be the same as another script name",
        [], 
        "OK"
      )
      await a.presentAlert()
      return
    }
    
    data[renamedScript] = {
      name,
      url: script.url,
      lastEditDate: script.lastEditDate
    }
    
    writeData(data)
    
    await notify(
      "Script Renamed",
      `The script ${script["name"]} has been renamed to ${name}`
    )
  }
}

async function viewScript() {
  let table = "<tr><th>Name</th><th>URL</th><th>Last Update</th></tr>"
  let data = await getData()
  for (let script of data) {
    table += `<tr><td>${script.name}</td><td>${
      script.url
    }</td><td>${new Date(script.lastEditDate).toDateString()}</td></tr>`
  }
  let w = new WebView()
  w.loadHTML(`<html><head><meta name="viewport" content="width=320, initial-scale=1"><meta charset="utf-8"><title>Git Scripts</title><style>body{margin:0px;padding:0px;text-align: center;font-family: System-ui;}@media (prefers-color-scheme: dark){body{background-color: black; color: white;}td{background-color: #1c1c1c}th,td{border: 1px solid #494949}tr:nth-child(odd) td{background-color:#252525}}@media (prefers-color-scheme: light){body{background-color: white; color: black;}td{background-color: #d3d3d3}tr:nth-child(odd) td{background-color:#b7b7b7;}tr,td{border: 1px solid black}}table{border-collapse: collapse; width: 100%;}th, td{padding: 0.25rem; text-align: left;vertical-align: middle;}.table{display: block; overflow: auto; white-space: nowrap; position: absolute; left:0; right:0; width:100%; height: 100%;}</style></head><body><div class="table"><table id="t">${table}</table></div><script>var table,rows,switching,i,x,y,shouldSwitch;for(table=document.getElementById("t"),switching=!0;switching;){for(switching=!1,rows=table.rows,i=1;i<rows.length-1;i++)if(shouldSwitch=!1,x=rows[i].getElementsByTagName("TD")[0],y=rows[i+1].getElementsByTagName("TD")[0],x.innerHTML.toLowerCase()>y.innerHTML.toLowerCase()){shouldSwitch=!0;break}shouldSwitch&&(rows[i].parentNode.insertBefore(rows[i+1],rows[i]),switching=!0)}</script></body></html>
`)
  await w.present()
}

async function checkUpdates() {
  const data = await getData()
  let updatesNeeded = []
  for (let script of data) {
    const commitsUrl = script.url.replace(/\/(blob|raw)\//, "/commits/")
    const commitsHTMl = await new Request(commitsUrl).loadString()
    
    const date = new Date(
      commitsHTMl.match(
        /<relative-time datetime="(.+?)" class="no-wrap">.+?<\/relative-time>/
      )[1]
    ).toString()
    
    if (date != new Date(script.lastEditDate)) {
      updatesNeeded.push({
        name: script.name,
        url: script.url,
        newDate: date
      })
    }
  }
  return updatesNeeded
}

async function askForUpdates(list) {
  if (list.length == 0) {
    await notify("Up To Date", "All scripts are currently up to date")
    return
  }
  let data = await getData()
  for (let script of list) {
    let a = makeAlert(
      script.name,
      "Would you like to update the script?",
      []
    )
    a.addCancelAction("No")
    a.addAction("Yes")
    if ((await a.presentAlert()) != -1) {
      const rawUrl = script.url.replace(/\/blob\//, "/raw/")
      const content = await new Request(rawUrl).loadString()
      fm.writeString(fm.joinPath(baseDir, script.name + ".js"), content)
      
      const scriptIndex = data.findIndex((e) => e.name === script.name)
      
      data[scriptIndex] = {
            name: script.name,
            url: script.url,
            lastEditDate: script.newDate
          }
    }
  }
  
  writeData(data)
  
  await notify(
    "Update Check Complete",
    "All scripts needing an update have been shown"
  )
}

async function createWidget() {
  const updatesArray = await checkUpdates()
  const updatesNumber = updatesArray.length

  const textMessage =
    updatesNumber !== 0
      ? `Script${updatesNumber == 1 ? "" : "s"} To Update`
      : "All Clear"

  const widget = new ListWidget()
  let date = new Date()
  date.setMinutes(date.getHours() + 3)
  widget.refreshAfterDate = date
  
  if (config.runsInAccessoryWidget) {
    if(config.widgetFamily === "accessoryCircular") {
      widget.addSpacer()
      
      const title = widget.addText("Updates")
      title.font = Font.boldSystemFont(13)
      title.minimumScaleFactor = 0.5
      title.centerAlignText()
      
      widget.addSpacer()
      
      const text = widget.addText(updatesNumber.toString())
      text.centerAlignText()
      text.font = Font.boldSystemFont(25)
      text.minimumScaleFactor = 0.5
      text.lineLimit = 1
      
      widget.addSpacer()
      widget.presentAccessoryCircular()
    } else if (config.widgetFamily === "accessoryRectangular"){
      widget.addSpacer()
      
      const title = widget.addText("Git Script Download & Update")
      title.font = Font.boldSystemFont(13)
      title.minimumScaleFactor = 0.5
      title.centerAlignText()
      
      widget.addSpacer()
      
      const text = widget.addText(updatesNumber.toString() + " " + textMessage)
      text.centerAlignText()
      text.font = Font.boldSystemFont(30)
      text.minimumScaleFactor = 0.5
      text.lineLimit = 1
      
      widget.addSpacer()
      widget.presentAccessoryRectangular()
    } else {
      widget.addSpacer()
      
      const text = widget.addText(`| ${updatesNumber.toString()} ${textMessage}`)
      text.centerAlignText()
      text.font = Font.boldSystemFont(30)
      text.minimumScaleFactor = 0.5
      text.lineLimit = 1
      
      widget.addSpacer()
      widget.presentAccessoryInline()
    }
  } else {
    // made for small but works for mediim and large

    const backgroundColor = Color.dynamic(Color.white(), Color.black())
    const textColor = Color.dynamic(Color.black(), Color.white())

    widget.backgroundColor = backgroundColor

    const title = widget.addText("Git Script Download & Update")
    title.centerAlignText()
    title.lineLimit = 2
    title.minimumScaleFactor = 0.3
    title.textColor = textColor
    widget.addSpacer(5)

    const hr = widget.addStack()
    hr.backgroundColor = Color.red()
    hr.cornerRadius = 2
    hr.addSpacer()
    const i = hr.addImage(
      Image.fromData(
        Data.fromBase64String(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        )
      )
    )
    i.imageSize = new Size(1, 2)
    hr.addSpacer()
    widget.addSpacer()

    const updatesNumberText = widget.addText(updatesNumber.toString())
    updatesNumberText.minimumScaleFactor = 0.3
    updatesNumberText.lineLimit = 1
    updatesNumberText.textColor = textColor
    updatesNumberText.font = Font.boldRoundedSystemFont(70)
    updatesNumberText.centerAlignText()
    widget.addSpacer()

    const message = widget.addText(textMessage)
    message.centerAlignText()
    message.lineLimit = 1
    message.minimumScaleFactor = 0.3
    message.textColor = textColor

    widget.presentSmall()
  }
  Script.setWidget(widget)
}