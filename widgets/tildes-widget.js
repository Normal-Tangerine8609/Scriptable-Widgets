/*
 * Tildes
 * A widget for displaying the latest posts from https://tildes.net/
 *
 * SUPPORTS
 * This script supports small widgets only
 *
 * SETTINGS
 * You can change the four values below this comment.
 * refreshMinutes: the minimum time the widget will take to refresh
 * catchDurationMinutes: save and reuse posts for this many minutes before reloading posts (note that upvotes and comments may be incorrect)
 * timeoutSeconds: the seconds before failing to load posts (used to detect if the internet is disconnected)
 * padding: the amount of padding used for the widget
 * bottomBarSize: the size of the text in the bottom bar
 * themeName: the name of the colour theme used in the widget. It can be Dark-Blue, Dark-Red, Light-Blue, Light-Red, Dracula-Purple, Dracula-Pink, Dracula-Red, Dracula-Orange, Dracula-Green, Dracula-Yellow, Dracula-Cyan or Dracula-Gray. You can also create your own theme and use it or edit current theme colours.
 *
 * WIDGET PARAMETERS
 * The widget parameter allows the widget to display posts only from a certain group or user. Here are some example parameters:
 * `~groupName` - anything starting with `~` is a group
 * `@userName` - anything starting with a `@` is a user name
 * `` - left blank, the widget displays a post from the home page
 * `~group,@user` - the identifiers can be separated by commas with NO spaces between to get a random post from one of the options
 * `~group,` - in this case, the second thing is blank, so it can display posts from the home page
 */

const refreshMinutes = 15;
const catchDurationMinutes = 90;
const timeoutSeconds = 5;
const padding = 10;
const bottomBarSize = 14;
const themeName = "Dracula-Purple";

const themes = {
  "Dark-Blue": {
    font: "",
    bg: Color.black(),
    fg: Color.white(),
    accent: Color.blue(),
    accentInverse: Color.white(),
  },
  "Dark-Red": {
    font: "",
    bg: Color.black(),
    fg: Color.white(),
    accent: Color.red(),
    accentInverse: Color.white(),
  },
  "Light-Blue": {
    font: "",
    bg: Color.white(),
    fg: Color.black(),
    accent: Color.blue(),
    accentInverse: Color.white(),
  },
  "Light-Red": {
    font: "",
    bg: Color.white(),
    fg: Color.black(),
    accent: Color.red(),
    accentInverse: Color.white(),
  },
  "Dracula-Purple": {
    font: "Menlo",
    bg: new Color("#282a36"),
    fg: new Color("#f8f8f2"),
    accent: new Color("#bd93f9"),
    accentInverse: new Color("#f8f8f2"),
  },
  "Dracula-Pink": {
    font: "Menlo",
    bg: new Color("#282a36"),
    fg: new Color("#f8f8f2"),
    accent: new Color("#ff79c6"),
    accentInverse: new Color("#f8f8f2"),
  },
  "Dracula-Red": {
    font: "Menlo",
    bg: new Color("#282a36"),
    fg: new Color("#f8f8f2"),
    accent: new Color("#ff5555"),
    accentInverse: new Color("#f8f8f2"),
  },
  "Dracula-Orange": {
    font: "Menlo",
    bg: new Color("#282a36"),
    fg: new Color("#f8f8f2"),
    accent: new Color("#ffb86c"),
    accentInverse: new Color("#282a36"),
  },
  "Dracula-Green": {
    font: "Menlo",
    bg: new Color("#282a36"),
    fg: new Color("#f8f8f2"),
    accent: new Color("#50fa7b"),
    accentInverse: new Color("#282a36"),
  },
  "Dracula-Yellow": {
    font: "Menlo",
    bg: new Color("#282a36"),
    fg: new Color("#f8f8f2"),
    accent: new Color("#f1fa8c"),
    accentInverse: new Color("#282a36"),
  },
  "Dracula-Cyan": {
    font: "Menlo",
    bg: new Color("#282a36"),
    fg: new Color("#f8f8f2"),
    accent: new Color("#8be9fd"),
    accentInverse: new Color("#282a36"),
  },
  "Dracula-Gray": {
    font: "Menlo",
    bg: new Color("#282a36"),
    fg: new Color("#f8f8f2"),
    accent: new Color("#6272a4"),
    accentInverse: new Color("#f8f8f2"),
  },
};

const theme = themes[themeName] || themes["Dark-Blue"];

// get the tildes data
const testParams = "";
let params = args.widgetParameter?.split(",") || ["all"];
if (!config.runsInWidget) {
  params = testParams.split(",");
}
const randomQuery = getRandomItem(params);
const { data, error } = await getTildesData(randomQuery);

// present errors
if (error) {
  presentError(error);
  return;
}
if ((config.widgetFamily || "small") != "small") {
  presentError("Invalid widget size");
  return;
}
if (data.length === 0) {
  presentError(`No posts found on page: ${randomQuery}`);
  return;
}

const post = getRandomItem(data);

// create the widget
const widget = new ListWidget();
let date = new Date();
date.setMinutes(date.getMinutes() + refreshMinutes);
widget.refreshAfterDate = date;
widget.url = post.commentsLink;
widget.backgroundColor = theme.bg;
widget.setPadding(0, 0, 0, 0);

const topBar = widget.addStack();
topBar.setPadding(padding / 2, padding, padding / 2, padding);
topBar.backgroundColor = theme.accent;
topBar.layoutHorizontally();

topBar.addSpacer();

const inText = topBar.addText(`In ${post.group} by @${post.user}`);
inText.textColor = theme.accentInverse;
inText.lineLimit = 1;
inText.font = new Font(theme.font, 8);
inText.minimumScaleFactor = 0.8;

topBar.addSpacer();

widget.addSpacer();

const middle = widget.addStack();
middle.setPadding(padding / 2, padding, padding / 2, padding);

const title = middle.addText(post.title.trim());
title.centerAlignText();
title.font = new Font(theme.font, 16);
title.minimumScaleFactor = 0.6;
title.textColor = theme.fg;

widget.addSpacer();

const bottomBar = widget.addStack();
bottomBar.setPadding(0, padding, padding / 2, padding);
bottomBar.layoutHorizontally();
bottomBar.centerAlignContent();

bottomBar.addSpacer();

const votesIcon = SFSymbol.named("arrow.up");
votesIcon.applyFont(new Font(theme.font, bottomBarSize));
const votesImage = bottomBar.addImage(votesIcon.image);
votesImage.imageSize = new Size(bottomBarSize, bottomBarSize);
votesImage.tintColor = theme.accent;

bottomBar.addSpacer(padding / 3);

const votesText = bottomBar.addText(post.votes.toString());
votesText.lineLimit = 1;
votesText.font = new Font(theme.font, bottomBarSize);
votesText.minimumScaleFactor = 0.8;
votesText.textColor = theme.fg;

bottomBar.addSpacer(padding);

const commentsIcon = SFSymbol.named("bubble.left");
commentsIcon.applyFont(new Font(theme.font, bottomBarSize));
const commentsImage = bottomBar.addImage(commentsIcon.image);
commentsImage.imageSize = new Size(bottomBarSize, bottomBarSize);
commentsImage.tintColor = theme.accent;

bottomBar.addSpacer(padding / 3);

const commentsText = bottomBar.addText(post.comments.toString());
commentsText.lineLimit = 1;
commentsText.font = new Font(theme.font, bottomBarSize);
commentsText.minimumScaleFactor = 0.8;
commentsText.textColor = theme.fg;

bottomBar.addSpacer();

widget.presentSmall();
Script.setWidget(widget);
Script.complete();

// Function to get a random item from an array
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Function to present an error in a widget
function presentError(message) {
  const widget = new ListWidget();
  widget.backgroundColor = Color.black();

  const text = widget.addText(message);
  text.font = new Font("Menlo", 20);
  text.centerAlignText();
  text.minimumScaleFactor = 0.8;
  text.textColor = Color.red();

  Script.setWidget(widget);
  widget.presentSmall();
}

// Function to get the Tildes data
async function getTildesData(query) {
  // Set up variables for working with the file
  const fm = FileManager.iCloud();
  const baseDir = fm.documentsDirectory();
  let file = fm.joinPath(baseDir, "tildes-widget.json");
  let fileContent = null;

  if (fm.fileExists(file)) {
    if (!fm.isFileDownloaded(file)) {
      await fm.downloadFileFromiCloud(file);
    }
    fileContent = JSON.parse(fm.readString(file));
  }

  if (!fileContent) {
    // Try to load the Tildes data, or show an error
    try {
      const data = await loadTildesData(query);
      const newFileContent = {
        [query]: {
          lastLoadTime: Date.now(),
          posts: data,
        },
      };
      fm.writeString(file, JSON.stringify(newFileContent));
      return { data };
    } catch {
      return { data: null, error: "Internet Connection Failure" };
    }
  }

  // We have a catch
  const hasQueryCatch = fileContent[query];
  const isCatchTooOld =
    hasQueryCatch &&
    Date.now() - fileContent[query].lastLoadTime > catchDurationMinutes * 60000;
  if (hasQueryCatch && !isCatchTooOld) {
    // Use the catch
    return { data: fileContent[query].posts };
  } else {
    // Try loading Tildes data, or default to the older catch/an internet error
    try {
      const data = await loadTildesData(query);
      fileContent[query] = {
        lastLoadTime: Date.now(),
        posts: data,
      };
      fm.writeString(file, JSON.stringify(fileContent));
      return { data };
    } catch {
      // We had an internet error
      if (hasQueryCatch) {
        return { data: fileContent[query].posts };
      } else {
        return { data: null, error: "Internet Connection Failure" };
      }
    }
  }
}

async function loadTildesData(query) {
  let url = "https://tildes.net/";
  // queries with ~ is a group
  if (query.startsWith("~")) {
    let [groupName, sort] = query.split("?");
    url += groupName;
    if (["votes", "comments", "new", "all_activity"].includes(sort)) {
      url += "?order=" + sort + "&period=7d";
    } else {
      url += "?period=7d";
    }
    // queries with @ is a user
  } else if (query.startsWith("@")) {
    url += "user/" + query.substring(1);
  } else {
    url += "?period=7d";
  }

  const wv = new WebView();
  await loadUrlWithTimeout(wv, url);
  const data = await wv.evaluateJavaScript(
    `
    const data = [];
    document.querySelectorAll("article.topic").forEach(e => {
      const title = e.querySelector("h1").innerText;
      const url = e.querySelector("h1 a").getAttribute("href");
      const user = e.getAttribute("data-topic-posted-by");
      const group = e.querySelector(".topic-group")?.innerText || "${
        query.split("?")[0]
      }";
      const type = e.querySelector(".topic-content-type").innerText;
      const votes = parseInt(e.querySelector(".topic-voting-votes").innerText);
      const comments = parseInt(e.querySelector(".topic-info-comments").innerText.replace("comments",""));
      const commentsLink = "https://tildes.net" + e.querySelector(".topic-info-comments a").getAttribute("href");
      const content = e.querySelector("details.topic-text-excerpt summary")?.innerText || "";
      const time = e.querySelector("time").getAttribute("title")
      const source = e.querySelector(".topic-info-source").innerText;
      let tags = []
      if(e.querySelector(".topic-tags")) {
        tags = [...e.querySelectorAll(".topic-tags a")].map(element => element.innerText)
      }
      let metaData = e.querySelector(".topic-content-metadata")?.innerText || ""
      data.push({
        title, url, user, group, type, votes, comments, commentsLink, content, time, source, tags, metaData
      });
    })
    completion(data);
    `,
    true
  );

  return data;
}

// Function that throws an error if the device is not connected to the internet (or is too slow) when loading a url into a webview
async function loadUrlWithTimeout(webview, url, timeoutMs = timeoutSeconds) {
  return Promise.race([
    webview.loadURL(url),
    new Promise((_, reject) =>
      Timer.schedule(timeoutMs, false, () =>
        reject(new Error("Timeout loading URL"))
      )
    ),
  ]);
}
