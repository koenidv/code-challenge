
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
        chrome.storage.sync.get([ "platforms", "defaultLength" ], (items) => {
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

    // Get the next free index for saving
    getNextIndex((index) => {

        // testing, use now as startdate
        // and now + 90 minutes as enddate
        let now = new Date().getTime()
        let then = now + 90 * 60 * 1000

        // Create the according Conference object
        var thisConference = new Conference(
            index,
            info.selectionText,
            "notes",
            "platform",
            "link",
            info.pageUrl,
            now, then)

            console.log(thisConference)

        // If only a link was selected
        if (info.linkUrl) {
            thisConference.link = info.linkUrl
        }

        // Open a new window letting the user
        // add data that couldn't be found
        chrome.windows.create({
            url: chrome.extension.getURL("edit.html")
                + "?" + escape(JSON.stringify(thisConference)),
            focused: true,
            type: "popup"
        });
    })

})
