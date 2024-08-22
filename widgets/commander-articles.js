/*
 * Commander Articles Widget
 * A widget for displaying the latest articles from your choice of https://edhrec.com/ or https://commandersherald.com/
 *
 * SUPPORTS
 * This script supports small and medium widgets.
 *
 * SETTINGS
 * You can change the three values bellow this comment.
 * preferredWebsite: either `edhrec` or `commandersherald` for the perfered website to fetch articles from.
 * themeName: the name of the colour theme used in the widget. It can be EDHREC, CommandersHerald, Dracula-Purple, Dracula-Pink, Dracula-Red, Dracula-Orange, Dracula-Green, Dracula-Yellow, Dracula-Cyan, or Dracula-Gray. You can also create your own theme and use it or edit current theme colours.
 * following: an array of objects to highlight matching articles for the medium widget. A highlighted article will have a different background color than the widget. The inner objects can have two properties. `author` to highlight articles from a certain author and `titlePattern` for a regex value that highlights articles where the title matches the pattern. One or both properties can be used at a time. If an object is empty, or has neither properties, all articles will be highlighted. The following is an example of the following array:
 *   [
 *     { author: "John Doe" },
 *     { titlePattern: /top 10/i },
 *     { author: "Jane Doe", titlePattern: /cedh/i },
 *   ]
 *
 * WIDGET PARAMETERS
 * The widget parameter can be used to override the perfered website. The value can be `commandersherald` or `edhrec`. The parameter is useful when you want to have multiple widgets on your homescreen that each have articles from the different websites.
 */

const preferredWebsite = "edhrec";
const themeName = "EDHREC";

const following = [{ author: "John Doe", titlePattern: /top 10/i }];

const space = 10;
const draculaBase = {
  font: "Menlo",
  bg: new Color("#282a36"),
  fg: new Color("#f8f8f2"),
  muted: new Color("#6272A4"),
  bgHighlight: new Color("#44475A"),
};
const themes = {
  EDHREC: {
    font: "",
    bg: Color.dynamic(new Color("#f9fafb"), new Color("#121315")),
    fg: Color.dynamic(new Color("#22262a"), new Color("#dfe3e7")),
    accent: Color.dynamic(new Color("#1763b5"), new Color("#337ab7")),
    accentInverse: Color.dynamic(new Color("#f9fafb"), new Color("#121315")),
    muted: Color.dynamic(new Color("#999999"), new Color("#999999")),
    bgHighlight: Color.dynamic(new Color("#ebeced"), new Color("#22262a")),
  },
  CommandersHerald: {
    font: "",
    bg: Color.dynamic(new Color("#fff"), new Color("#343a40")),
    fg: Color.dynamic(new Color("#212529"), new Color("#f1f1f1")),
    accent: Color.dynamic(new Color("#20c997"), new Color("#20c997")),
    accentInverse: Color.dynamic(new Color("#fff"), new Color("#fff")),
    muted: Color.dynamic(new Color("#6c757d"), new Color("#8a959e")),
    bgHighlight: Color.dynamic(new Color("#ebeced"), new Color("#3d444d")),
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

const theme = themes[themeName] || themes["EDHREC"];

let website = "https://edhrec.com/articles/feed/?cat=4";
if (
  /commander'?s?herald/i.test(args.widgetParameter) ||
  (preferredWebsite === "commandersherald" &&
    !/edhrec/i.test(args.widgetParameter))
) {
  website = "https://commandersherald.com/rss";
}

const xml = await new Request(website).loadString();
const data = parseXML(xml).rss.channel.item;

const widget = new ListWidget();
let date = new Date();
date.setHours(date.getHours() + 1);
widget.refreshAfterDate = date;
widget.url =
  website === "https://commandersherald.com/rss"
    ? "https://commandersherald.com"
    : "https://edhrec.com/";
widget.backgroundColor = theme.bg;

if (config.widgetFamily === "small") {
  const bottomBarSize = 12;

  widget.setPadding(0, 0, 0, 0);
  widget.url = data[0].link;

  const topBar = widget.addStack();
  topBar.setPadding(space / 2, space, space / 2, space);
  topBar.backgroundColor = theme.accent;
  topBar.layoutHorizontally();

  topBar.addSpacer();

  const titleText = topBar.addText(data[0].title);
  titleText.centerAlignText();
  titleText.textColor = theme.accentInverse;
  titleText.lineLimit = 2;
  titleText.font = new Font(theme.font, 12);
  titleText.minimumScaleFactor = 0.8;

  topBar.addSpacer();

  widget.addSpacer();

  const middle = widget.addStack();
  middle.setPadding(space / 2, space, space / 2, space);

  const body = middle.addText(data[0].description.match(/<p>(.+?)<\/p>/)[1]);
  body.centerAlignText();
  body.font = new Font(theme.font, 14);
  body.minimumScaleFactor = 0.6;
  body.textColor = theme.fg;

  widget.addSpacer();

  const bottomBar = widget.addStack();
  bottomBar.setPadding(0, space, space / 2, space);
  bottomBar.layoutHorizontally();
  bottomBar.centerAlignContent();

  bottomBar.addSpacer();

  const categoryIcon = bottomBar.addText("#");
  categoryIcon.font = Font.boldSystemFont(bottomBarSize);
  categoryIcon.textColor = theme.accent;

  bottomBar.addSpacer(space / 2);

  const categoryText = bottomBar.addText(Array.isArray(data[0].category) ? data[0].category[0] : data[0].category);
  categoryText.lineLimit = 1;
  categoryText.font = new Font(theme.font, bottomBarSize);
  categoryText.minimumScaleFactor = 0.8;
  categoryText.textColor = theme.fg;

  bottomBar.addSpacer();

  widget.presentSmall();
} else if (config.widgetFamily === "medium" || true) {
  const bottomBarSize = 12;

  const titleText = widget.addText(
    website === "https://commandersherald.com/rss"
      ? "Commander's Herald"
      : "EDHREC",
  );
  titleText.lineLimit = 1;
  titleText.font = new Font(theme.font, 10);
  titleText.minimumScaleFactor = 0.8;
  titleText.textColor = theme.muted;

  addDivider(widget);

  for (let i = 0; i < 3; i++) {
    const row = widget.addStack();
    row.url = data[i].link;
    row.layoutVertically();
    row.setPadding(space / 3, space / 3, space / 3, space / 3);
    row.cornerRadius = 5;

    if (doesFollow(data[i])) {
      row.backgroundColor = theme.bgHighlight;
    }

    const titleText = row.addText(data[i].title);
    titleText.textColor = theme.fg;
    titleText.lineLimit = 1;
    titleText.font = new Font(theme.font, 12);
    titleText.minimumScaleFactor = 0.8;

    row.addSpacer(space / 4);

    const bottomBar = row.addStack();
    bottomBar.centerAlignContent();
    bottomBar.layoutHorizontally();

    const categoryIcon = bottomBar.addText("#");
    categoryIcon.font = Font.boldSystemFont(bottomBarSize);
    categoryIcon.textColor = theme.accent;

    bottomBar.addSpacer(space / 2);

    const categoryText = bottomBar.addText(Array.isArray(data[i].category) ? data[i].category[0] : data[i].category);
    categoryText.lineLimit = 1;
    categoryText.font = new Font(theme.font, bottomBarSize);
    categoryText.minimumScaleFactor = 0.8;
    categoryText.textColor = theme.muted;

    bottomBar.addSpacer();

    const date = bottomBar.addDate(new Date(data[i].pubDate));
    date.textColor = theme.muted;
    date.applyRelativeStyle();
    date.font = new Font(theme.font, bottomBarSize);
    date.minimumScaleFactor = 0.8;

    if (i !== 2) {
      addDivider(widget);
    }
  }
  widget.presentMedium();
}

Script.setWidget(widget);
Script.complete();

function doesFollow(data) {
  for (const pattern of following) {
    if (pattern.author && data["dc:creator"] !== pattern.author) {
      continue;
    }
    if (pattern.titlePattern && !pattern.titlePattern.test(data.title)) {
      continue;
    }
    return true;
  }
  return false;
}

function addDivider(stack) {
  stack.addSpacer(space / 4);
  const bar = stack.addStack();
  bar.backgroundColor = theme.accent;
  bar.cornerRadius = 2;
  bar.addSpacer();
  const barHeightener = bar.addImage(
    Image.fromData(
      Data.fromBase64String(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      ),
    ),
  );
  barHeightener.imageSize = new Size(1, 1);
  bar.addSpacer();

  stack.addSpacer(space / 4);
}

// See https://github.com/Normal-Tangerine8609/Scriptable-Widgets/blob/main/scripts/rss-parser.js
function parseXML(string) {
  let main = {
    isRoot: true,
    name: "root",
    children: [],
  };

  let target = main;
  let goBack = {};
  let parser = new XMLParser(string);

  parser.didStartElement = (name, attrs) => {
    let backTo = Symbol();
    goBack[backTo] = target;
    let newTarget = {
      name,
      attrs,
      innerText: "",
      children: [],
      end: backTo,
    };
    target.children.push(newTarget);
    target = newTarget;
  };

  parser.didEndElement = (name) => {
    let sym = target.end;
    delete target.end;
    target = goBack[sym];
  };

  parser.foundCharacters = (text) => {
    target.innerText +=
      target.innerText === "" ? text.trim() : " " + text.trim();
  };

  parser.parseErrorOccurred = () => {
    console.warn(
      "A parse error occurred, ensure the document is formatted properly.",
    );
  };

  parser.parse();

  if (!main.isRoot) {
    console.warn(
      "A parse error occurred, ensure the document is formatted properly.",
    );
  }

  delete main.isRoot;
  return traverse(main);

  function traverse(node) {
    let newNode = {};

    for (let child of node.children) {
      let newChild = traverse(child);

      if (child.children.length === 0) {
        newChild = child.innerText;
      }

      if (newNode[child.name]) {
        if (Array.isArray(newNode[child.name])) {
          newNode[child.name].push(newChild);
        } else {
          newNode[child.name] = [newNode[child.name], newChild];
        }
      } else {
        newNode[child.name] = newChild;
      }
    }
    return newNode;
  }
}
