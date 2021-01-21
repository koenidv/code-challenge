
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
chrome.contextMenus.onClicked.addListener((info, tab) => {

    console.log(info)
    console.log(tab)

    // Get the next free index for saving
    getNextIndex((index) => {

        // We'll also need a list of used platforms
        chrome.storage.sync.get("platforms", (items) => {

            // testing, use now as startdate
            // and now + 90 minutes as enddate
            let now = new Date().getTime()
            let then = now + 90 * 60 * 1000

            // Try getting some values from the selected text

            let url = null
            // If only a link was selected, use that
            if (info.linkUrl) {
                url = info.linkUrl
            } else if (info.selectionText.match(/https?:\/\//)) {
                // If selected text contains any "http(s)://", use that
                // until the next whitespace as conference url
                url = info.selectionText.match(/(https?:\/\/\S*)/g)[0]
            }

            let platform = null
            console.log((info.selectionText ?? info.linkUrl))
            // Check if the selected text or link explicitly mentions a used platform
            if (info.selectionText ?? info.linkUrl != null) {
                for (thisPlatform of items.platforms) {
                    if ((info.selectionText ?? info.linkUrl).toLowerCase()
                        .match(new RegExp(thisPlatform.toLowerCase().replaceAll(" ", "\\s*")))) {
                        platform = thisPlatform
                    }
                }
            }
            // If no platform was found, set to Other
            platform = platform ?? "Other"

            // Create the according Conference object
            var thisConference = new Conference(
                index,
                null,
                null,
                platform,
                url,
                info.pageUrl,
                now, then)

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
