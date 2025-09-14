/*
 * Lobsters
 * A widget for displaying the latest posts from https://lobste.rs/
 *
 * SUPPORTS
 * This script supports small widgets and medium widgets
 *
 * SETTINGS
 * You can change the eight values below this comment.
 * refreshMinutes: the minimum time the widget will take to refresh
 * catchDurationMinutes: save and reuse posts for this many minutes before reloading posts (note that votes and comments may be incorrect)
 * padding: the amount of padding/spacing used for the widget
 * bottomBarSize: the size of the text in the bottom bar on small widgets
 * mediumExtrasBarSize: the size of the extras text (tags, votes, comments) in the medium widget
 * themeName: the name of the colour theme used in the widget. It can be Lobsters, Dracula-Purple, Dracula-Pink, Dracula-Red, Dracula-Orange, Dracula-Green, Dracula-Yellow, Dracula-Cyan or Dracula-Gray. You can also create your own theme and use it or edit current theme colours.
 * defaultSortAndFilter: the default options for sorting and filtering Lobsters data. This is overwritten by the widget parameters (see below)
 * linkToSource: when true, links to the url (article, video, or source site) instead of the comments on Lobsters
 * 
 * WIDGET PARAMETERS
 * The widget parameter allows the widget to display posts with a sorting method or only from a certain tag or user. It can be entered case insensitively (`Newest` and `newest` are the same) Here are some example parameters:
 * 
 * `Hottest` - display the hottest posts. This is also the default option
 * `Newest` - display the newest posts.
 * `Active` - display the recent active posts.
 * `@userName` - anything starting with a `@` is a user name. If the user does not exist, there will be an error
 * `web` - anything else is a tag. Tags must be valid or there will be an error
 * `web,javascript,rust` - multiple tags can be used with commas
 * `web|@userName` - multiple methods can be separated by the vertical pipe (|) to randomly display posts from any of the methods
 */

const refreshMinutes = 15;
const catchDurationMinutes = 90;
const padding = 10;
const bottomBarSize = 14;
const mediumExtrasBarSize = 11;
const themeName = "Dracula-Purple";
const defaultSortAndFilter =  "Hottest";
const linkToSource = false;

const draculaBase = {
  font: "Menlo",
  bg: new Color("#282a36"),
  fg: new Color("#f8f8f2"),
  muted: new Color("#6272A4"),
};
const themes = {
  Lobsters: {
    font: "helvetica neue",
    bg: Color.dynamic(new Color("#fefefe"), new Color("#0c0c0c")),
    fg: Color.dynamic(new Color("#1c58d1"), new Color("#8ab1ff")),
    muted: Color.dynamic(new Color("#878787"), new Color("#a1a1a1")),
    accent: Color.dynamic(new Color("#1c58d1"), new Color("#8ab1ff")),
    accentInverse: Color.dynamic(Color.white(), Color.black()),
    bar: Color.dynamic(new Color("#878787"), new Color("#a1a1a1")),
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

const theme = themes[themeName] || themes["Lobsters"];

// get the lobsters data
let params = (args.widgetParameter || defaultSortAndFilter)?.split("|");
const randomSortAndFilter = getRandomItem(params).toLowerCase();
const { data, error } = await getLobstersData(randomSortAndFilter);

// present errors
if (error) {
  presentError(error);
  return;
}
if (data.length === 0) {
  presentError(`No posts found using: ${randomSortAndFilter}`);
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

// Function to get the Lobsters data
async function getLobstersData(sortAndFilter) {
  // Set up variables for working with the file
  const fm = FileManager.iCloud();
  const baseDir = fm.documentsDirectory();
  let file = fm.joinPath(baseDir, "lobsters-widget.json");
  let fileContent = null;

  // Try to load the file
  if (fm.fileExists(file)) {
    if (!fm.isFileDownloaded(file)) {
      await fm.downloadFileFromiCloud(file);
    }
    fileContent = JSON.parse(fm.readString(file));
  }

  if (!fileContent) {
    // Try to load the Lobsters data, or show an error
    try {
      const data = await loadLobstersData(sortAndFilter);
      const newFileContent = {
        [sortAndFilter]: {
          lastLoadTime: Date.now(),
          posts: data,
        },
      };
      fm.writeString(file, JSON.stringify(newFileContent));
      return { data };
    } catch (e) {
      if (e.toString().endsWith("correct format.")) {
        // Tags or user were invalid
        return {
          data: null,
          error: `Invalid Sort and Filter: ${sortAndFilter}`,
        };
      }
      return { data: null, error: "Internet Connection Failure" };
    }
  }

  // We have a catch
  const hasSortAndFilterCatch = fileContent[sortAndFilter];
  const isCatchTooOld =
    hasSortAndFilterCatch &&
    Date.now() - fileContent[sortAndFilter].lastLoadTime >
      catchDurationMinutes * 60000;
  if (hasSortAndFilterCatch && !isCatchTooOld) {
    // Use the catch
    return { data: fileContent[sortAndFilter].posts };
  } else {
    // Try loading Lobsters data, or default to the older catch/an internet error
    try {
      const data = await loadLobstersData(sortAndFilter);
      fileContent[sortAndFilter] = {
        lastLoadTime: Date.now(),
        posts: data,
      };
      fm.writeString(file, JSON.stringify(fileContent));
      return { data };
    } catch (e) {
      // We had an internet error
      if (hasSortAndFilterCatch) {
        return { data: fileContent[sortAndFilter].posts };
      } else if (e.toString().endsWith("correct format.")) {
        // Tags or user were invalid
        return {
          data: null,
          error: `Invalid Sort and Filter: ${sortAndFilter}`,
        };
      }
      return { data: null, error: "Internet Connection Failure" };
    }
  }
}

// Function to load posts from Lobsters
async function loadLobstersData(query) {
  let url = "https://lobste.rs/hottest.json";
  if (query === "newest") {
    url = "https://lobste.rs/newest.json";
  } else if (query === "active") {
    url = "https://lobste.rs/active.json";
  } else if (query.startsWith("@")) {
    url = `https://lobste.rs/~${query.substring(1)}/stories.json`;
  } else if (query && query !== "hottest") {
    url = `https://lobste.rs/t/${query}.json`;
  }

  const data = await new Request(url).loadJSON();

  return data;
}

// Function that creates the small widget
function createSmallWidget() {
  const post = getRandomItem(data);

  widget.url = linkToSource ? post.url : post.comments_url;
  widget.setPadding(0, 0, 0, 0);

  const topBar = widget.addStack();
  topBar.setPadding(padding / 2, padding, padding / 2, padding);
  topBar.backgroundColor = theme.accent;
  topBar.layoutHorizontally();

  topBar.addSpacer();
topBar.addSpacer(padding/2)

  post.tags.slice(0, 2).forEach((tag) => {
    const tagText = topBar.addText(
    "#" + tag
  );
  tagText.textColor = theme.accentInverse;
  tagText.lineLimit = 1;
  tagText.font = new Font(theme.font, 10);
  tagText.minimumScaleFactor = 0.8;

  topBar.addSpacer(padding/2)
  })

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

  const votesText = bottomBar.addText(post.score.toString());
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

  const commentsText = bottomBar.addText(post.comment_count.toString());
  commentsText.lineLimit = 1;
  commentsText.font = new Font(theme.font, bottomBarSize);
  commentsText.minimumScaleFactor = 0.8;
  commentsText.textColor = theme.fg;

  bottomBar.addSpacer();

  widget.presentSmall();
}

// Function that creates the medium widget
function createMediumWidget() {
  const titleText = widget.addText(
    `Lobsters - ${args.widgetParameter || defaultSortAndFilter}`
  );
  titleText.lineLimit = 1;
  titleText.font = new Font(theme.font, 10);
  titleText.minimumScaleFactor = 0.8;
  titleText.textColor = theme.muted;
  widget.addSpacer(padding / 4);

  addDivider(widget, padding / 4);

  for (let i = 0; i < 3; i++) {
    const row = widget.addStack();
    row.url = linkToSource ? data[i].url : data[i].comments_url;
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


  data[i].tags.slice(0, 3).forEach((tag) => {
    const tagText = bottomBar.addText(
    "#" + tag
  );
  tagText.lineLimit = 1;
    tagText.font = new Font(theme.font, mediumExtrasBarSize);
    tagText.minimumScaleFactor = 0.8;
    tagText.textColor = theme.muted;

  bottomBar.addSpacer(padding/2)
  })

    bottomBar.addSpacer();

    const votesIcon = SFSymbol.named("arrow.up");
    votesIcon.applyFont(new Font(theme.font, mediumExtrasBarSize));
    const votesImage = bottomBar.addImage(votesIcon.image);
    votesImage.imageSize = new Size(mediumExtrasBarSize, mediumExtrasBarSize);
    votesImage.tintColor = theme.accent;

    bottomBar.addSpacer(padding / 4);

    const votesText = bottomBar.addText(data[i].score.toString());
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

    const commentsText = bottomBar.addText(data[i].comment_count.toString());
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
  bar.backgroundColor = theme.bar ?? theme.accent;
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
