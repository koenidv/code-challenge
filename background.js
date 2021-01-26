
// On install / update
chrome.runtime.onInstalled.addListener((details) => {
    // Create a context menu
    chrome.contextMenus.create({
        id: "savetext",
        title: "Save Conference",
        contexts: ["selection", "link"]
    })

    // On first install
    if (details.reason == "install") {

        // Set some default settings
        // We still need to check if this is undefined,
        // as the storage is synced and this might not be the first install

        // Platforms list and default duration
        chrome.storage.sync.get(["platforms", "defaultLength"], (items) => {
            // Set default platforms list if not already set
            if (items.platforms === undefined) {
                chrome.storage.sync.set({
                    "platforms": [
                        // Default platforms below
                        "Teams",
                        "Big Blue Button",
                        "Zoom",
                        "Moodle",
                        "Other"
                    ]
                }, () => { })
            }
            // Set default event length to 90 minutes if unset
            if (items.defaultLength == undefined) {
                chrome.storage.sync.set({
                    "defaultLength": 90
                }, () => { })
            }
        })
    }
})


// On context menu item clicked
chrome.contextMenus.onClicked.addListener((info) => {

    // Get the next free index for saving
    getNextIndex((index) => {

        // We'll also need a list of used platforms
        chrome.storage.sync.get("platforms", (items) => {

            // testing, use now as startdate
            // and now + 90 minutes as enddate
            let now = new Date().getTime()
            let then = now + 90 * 60 * 1000

            // Create new Conference object
            var thisConference = new Conference(
                index,
                null,
                null,
                null,
                null,
                info.pageUrl,
                now, then)

            // Try getting some values from the selected text

            // If only a link was selected, use that
            if (info.linkUrl) {
                thisConference.link = info.linkUrl
            } else if (info.selectionText.match(/https?:\/\//)) {
                // If selected text contains any "http(s)://", use that
                // until the next whitespace as conference url
                thisConference.link = info.selectionText.match(/(https?:\/\/\S*)/g)[0]
            } else if (info.selectionText.length <= 32) {
                thisConference.title = info.selectionText
            }

            // Check if the selected text or link explicitly mentions a used platform
            if (info.selectionText ?? info.linkUrl != null) {
                for (thisPlatform of items.platforms) {
                    if ((info.selectionText ?? info.linkUrl).toLowerCase()
                        .match(new RegExp(thisPlatform.toLowerCase().replaceAll(" ", "\\s*")))) {
                        thisConference.platform = thisPlatform
                    }
                }
            }
            // If no platform was found, set to Other
            thisConference.platform = thisConference.platform ?? "Other"

            // Try getting a date
            // like month/day (or m\d, m-d) or like (d.m)
            // Assign variables within the if statement so match is only run once
            // and we can use if/else
            let matches
            if (matches = /(?:\D|^)(?<month>[0-1]?[1-2])(?:\/|\\|-)(?<day>[0-2]?[0-9]|3[0-1])(?:\D|$)/g.exec(info.selectionText)) {
                console.log("DAY " + matches.groups.day)
                console.log("MONTH " + matches.groups.month)
            } else if (matches = /(?:^|\D)(?<day>[0-2]?[0-9]|3[0-1]).(?<month>[0-1]?[1-2])(?:\D|$)/g.exec(info.selectionText)) {
                console.log("DAY " + matches.groups.day)
                console.log("MONTH " + matches.groups.month)
            }

            // Try getting a time like hour:minute
            matches = /(?:\D|^)(?<hour>[0-1]?[0-9]|2[0-3]):(?<minute>[0-5]?[0-9])(?:\D|$)(?:(?<period>(?:a|p))\.?m\.?|p\.?m\.?)?/gi.exec(info.selectionText)
            if (matches) {
                console.log("HOUR " + matches.groups.hour)
                console.log("MINUTE " + matches.groups.minute)
                console.log("PERIOD " + matches.groups.period)
            }
            

            console.log(thisConference)

            // Open a new window letting the user
            // add data that couldn't be found
            chrome.windows.create({
                url: chrome.extension.getURL("edit.html")
                    + "?" + escape(JSON.stringify(thisConference)),
                focused: true,
                type: "popup"
            })

        })

    })

})

/*
 * Listen for alarms to show a notification
 */
chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("Showing alarm for " + alarm.name + " at " + alarm.scheduledTime)
    // Get the corresponding conference
    getById(alarm.name, (conference) => {
        console.log(conference)
        // Show a notification
        chrome.notifications.create(conference.id.toString(), {
            title: conference.title,
            message: `Get ready for your conference on ${conference.platform}!\r\n${conference.notes}`,
            iconUrl: "128.png",
            eventTime: conference.starttime,
            type: "basic"
        }, () => { })
    })
})

/**
 * Listen for clicks on a notification to redirect to the specified link
 */
chrome.notifications.onClicked.addListener((notificationId) => {
    // Get the corresponding conference
    getById(notificationId, (conference) => {
        // Open its link in a new tab
        chrome.tabs.create({ url: conference.link })
    })
})
