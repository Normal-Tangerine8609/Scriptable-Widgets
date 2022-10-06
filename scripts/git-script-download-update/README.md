# Git Script Download & Update

[Git Script Download & Update](git-script-download-update.js)

Git Script Download & Update or as a short form, Git Script, provides a needed piece for scriptable users. Most scripts found in the [r/scriptable](https://www.reddit.com/r/Scriptable/) subreddit are shared via GitHub. Because of this, many users will download the script but will not regularly pay attention to game changing updates. 

With Git Script, users can easily download scriptable scripts from GitHub repositories and keep up to date on updates. Git Script is not made for developers, rather scriptable users. Anyone can use Git Script with its easy-to-use interface. Just download the [code](git-script.js) to get started.

## Customizing 

The only customization that you can change is the notification type that will appear after completing some of the actions (like adding a script).  At the top of the script you will see this:

```javascript
// Type of notification to appear when finished some actions. Can be "notification", "alert" or null/undefined. Do not change anything else.
const notifyType = "notification" 
```

As stated in the comment, `notifyType` can be set to `"notification"`, `"alert"` or `null`/`undefined`. When set to `"notification"` a notification will appear. When set to  `"alert"` an alert will appear. When set to anything else nothing will appear.

## Normal Run

When running the script you will have an option to choose from a few actions.

### Check For Updates

Runs through each script added and checks for an update. If there is an update you will be asked if you want to update it. After running through all scripts a notification will appear depending on the `notifyType`

When updating a script, the script will be downloaded from GitHub under the chosen name of the script. The script will replace the previous script with the same name. You will have to reset all of the previous customizations.

### Add Script

When adding a script you will be promoted to enter the url or use your clipboard. The url must be 

1. From a GitHub respiratory 
2. Sharing a .js or .scriptable file
3. Be the raw or blob url

You will then be prompted to pick a name for the script. You must not leave the name empty or give the script the same name as another script. Then, the script will be downloaded from GitHub under the chosen name of the script and added to the update list. After adding the script a notification will appear depending on the `notifyType`

If the url entered is the Git Script url the script will be downloaded under the current running script name. Therefore the file will be replaced, however, the `notifyType` will **NOT** stay the same. The script will also be added to the update list and a notification will appear depending on the `notifyType`.

### Remove Script

You will be prompted to choose a script to delete. The chosen script will be removed from the update list. After removing the script, a notification will appear depending on the `notifyType`. You will still have to delete the script from the scriptable gallery.

### Rename Script

You should only rename a script after you have changed the real script name in the gallery. You will be prompted to choose a script. Next, you will be prompted to choose a new name for the script. The name cannot be the same name as another script. The name will be updated on the update list and a   notification will appear depending on the `notifyType`.

### View Scripts

You will be shown a table with all the scripts on the update list.

## Share Sheet
You can share a valid url from the share sheet to add the script. The same events take place as in the Add Script action except for entering a url.

## Widgets

![small widget](../../images/git-script-download-update-widget.jpeg)

Git Script has a simple small widget. It also has basic Lock Screen widgets.
