/*
 * Tildes
 * A widget for displaying the latest posts from https://tildes.net/
 *
 * SUPPORTS
 * This script supports small widgets and medium widgets
 *
 * SETTINGS
 * You can change the seven values below this comment.
 * refreshMinutes: the minimum time the widget will take to refresh
 * catchDurationMinutes: save and reuse posts for this many minutes before reloading posts (note that votes and comments may be incorrect)
 * timeoutSeconds: the seconds before failing to load posts (used to detect if the internet is disconnected)
 * padding: the amount of padding/spacing used for the widget
 * bottomBarSize: the size of the text in the bottom bar on small widgets
 * mediumExtrasBarSize: the size of the extras text (group, user, votes, comments) in the medium widget
 * themeName: the name of the colour theme used in the widget. It can be Blue, Red, Dark-Blue, Dark-Red, Light-Blue, Light-Red, Dracula-Purple, Dracula-Pink, Dracula-Red, Dracula-Orange, Dracula-Green, Dracula-Yellow, Dracula-Cyan or Dracula-Gray. You can also create your own theme and use it or edit current theme colours.
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
const mediumExtrasBarSize = 11;
const themeName = "Dracula-Purple";

const draculaBase = {
  font: "Menlo",
  bg: new Color("#282a36"),
  fg: new Color("#f8f8f2"),
  muted: new Color("#6272A4"),
};
const themes = {
  Blue: {
    font: "",
    bg: Color.dynamic(Color.white(), Color.black()),
    fg: Color.dynamic(Color.black(), Color.white()),
    muted: Color.gray(),
    accent: Color.blue(),
    accentInverse: Color.white(),
  },
  Red: {
    font: "",
    bg: Color.dynamic(Color.white(), Color.black()),
    fg: Color.dynamic(Color.black(), Color.white()),
    muted: Color.gray(),
    accent: Color.red(),
    accentInverse: Color.white(),
  },
  "Dark-Blue": {
    font: "",
    bg: Color.black(),
    fg: Color.white(),
    muted: Color.gray(),
    accent: Color.blue(),
    accentInverse: Color.white(),
  },
  "Dark-Red": {
    font: "",
    bg: Color.black(),
    fg: Color.white(),
    muted: Color.gray(),
    accent: Color.red(),
    accentInverse: Color.white(),
  },
  "Light-Blue": {
    font: "",
    bg: Color.white(),
    fg: Color.black(),
    muted: Color.gray(),
    accent: Color.blue(),
    accentInverse: Color.white(),
  },
  "Light-Red": {
    font: "",
    bg: Color.white(),
    fg: Color.black(),
    muted: Color.gray(),
    accent: Color.red(),
    accentInverse: Color.white(),
  },
  "Dracula-Purple": {
    ...draculaBase,
    accent: new Color("#bd93f9"),
    accentInverse: new Color("#f8f8f2"),
  },
  "Dracula-Pink": {
    ...draculaBase,
    accent: new Color("#ff79c6"),
    accentInverse: new Color("#f8f8f2"),
  },
  "Dracula-Red": {
    ...draculaBase,
    accent: new Color("#ff5555"),
    accentInverse: new Color("#f8f8f2"),
  },
  "Dracula-Orange": {
    ...draculaBase,
    accent: new Color("#ffb86c"),
    accentInverse: new Color("#282a36"),
  },
  "Dracula-Green": {
    ...draculaBase,
    accent: new Color("#50fa7b"),
    accentInverse: new Color("#282a36"),
  },
  "Dracula-Yellow": {
    ...draculaBase,
    accent: new Color("#f1fa8c"),
    accentInverse: new Color("#282a36"),
  },
  "Dracula-Cyan": {
    ...draculaBase,
    accent: new Color("#8be9fd"),
    accentInverse: new Color("#282a36"),
  },
  "Dracula-Gray": {
    ...draculaBase,
    accent: new Color("#6272a4"),
    accentInverse: new Color("#f8f8f2"),
  },
};

const theme = themes[themeName] || themes["Blue"];

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
if (data.length === 0) {
  presentError(`No posts found on page: ${randomQuery}`);
  return;
}

// create the widget
const widget = new ListWidget();
let date = new Date();
date.setMinutes(date.getMinutes() + refreshMinutes);
widget.refreshAfterDate = date;
widget.backgroundColor = theme.bg;

if (config.widgetFamily === "small") {
  createSmallWidget();
  Script.setWidget(widget);
  Script.complete();
} else if (config.widgetFamily === "medium" || config.runsInApp) {
  createMediumWidget();
  Script.setWidget(widget);
  Script.complete();
} else {
  presentError("Invalid widget size");
}

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

  // Try to load the file
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
async function loadUrlWithTimeout(webview, url, timeoutMs = timeoutSeconds * 1000) {
  return Promise.race([
    webview.loadURL(url),
    new Promise((_, reject) =>
      Timer.schedule(timeoutMs, false, () =>
        reject(new Error("Timeout loading URL"))
      )
    ),
  ]);
}

// Function that creates the small widget
function createSmallWidget() {
  const post = getRandomItem(data);

  widget.url = post.commentsLink;
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
}

// Function that creates the medium widget
function createMediumWidget() {
  const titleText = widget.addText(`Tildes - ${args.widgetParameter || "All"}`);
  titleText.lineLimit = 1;
  titleText.font = new Font(theme.font, 10);
  titleText.minimumScaleFactor = 0.8;
  titleText.textColor = theme.muted;
  widget.addSpacer(padding / 4);

  addDivider(widget, padding / 4);

  for (let i = 0; i < 3; i++) {
    const row = widget.addStack();
    row.url = data[i].commentsLink;
    row.layoutVertically();
    row.setPadding(padding / 3, padding / 3, padding / 3, padding / 3);

    const titleText = row.addText(data[i].title);
    titleText.textColor = theme.fg;
    titleText.lineLimit = 1;
    titleText.font = new Font(theme.font, 12);
    titleText.minimumScaleFactor = 0.85;

    row.addSpacer(padding / 2);

    const bottomBar = row.addStack();
    bottomBar.centerAlignContent();
    bottomBar.layoutHorizontally();

    const detailsText = bottomBar.addText(
      `In ${data[i].group} by @${data[i].user}`
    );
    detailsText.lineLimit = 1;
    detailsText.font = new Font(theme.font, mediumExtrasBarSize);
    detailsText.minimumScaleFactor = 0.8;
    detailsText.textColor = theme.muted;

    bottomBar.addSpacer();

    const votesIcon = SFSymbol.named("arrow.up");
    votesIcon.applyFont(new Font(theme.font, mediumExtrasBarSize));
    const votesImage = bottomBar.addImage(votesIcon.image);
    votesImage.imageSize = new Size(mediumExtrasBarSize, mediumExtrasBarSize);
    votesImage.tintColor = theme.accent;

    bottomBar.addSpacer(padding / 4);

    const votesText = bottomBar.addText(data[i].votes.toString());
    votesText.lineLimit = 1;
    votesText.font = new Font(theme.font, mediumExtrasBarSize);
    votesText.minimumScaleFactor = 0.8;
    votesText.textColor = theme.muted;

    bottomBar.addSpacer(padding / 2);

    const commentsIcon = SFSymbol.named("bubble.left");
    commentsIcon.applyFont(new Font(theme.font, mediumExtrasBarSize));
    const commentsImage = bottomBar.addImage(commentsIcon.image);
    commentsImage.imageSize = new Size(
      mediumExtrasBarSize,
      mediumExtrasBarSize
    );
    commentsImage.tintColor = theme.accent;

    bottomBar.addSpacer(padding / 4);

    const commentsText = bottomBar.addText(data[i].comments.toString());
    commentsText.lineLimit = 1;
    commentsText.font = new Font(theme.font, mediumExtrasBarSize);
    commentsText.minimumScaleFactor = 0.8;
    commentsText.textColor = theme.muted;

    if (i !== 2) {
      addDivider(widget, padding / 4);
    }
  }
  widget.presentMedium();
}

// Function that adds a divider (like <hr/>) to a widget
function addDivider(stack, padding) {
  stack.addSpacer(padding);
  const bar = stack.addStack();
  bar.backgroundColor = theme.accent;
  bar.cornerRadius = 2;
  bar.addSpacer();
  // Add 1/1 transparent pixel
  const barHeightener = bar.addImage(
    Image.fromData(
      Data.fromBase64String(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      )
    )
  );
  barHeightener.imageSize = new Size(1, 1);
  bar.addSpacer();

  stack.addSpacer(padding);
}
