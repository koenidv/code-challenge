
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

        // Platforms list
        // We still need to check if this is undefined,
        // as the storage is synced and this might not be the first install
        chrome.storage.sync.get("platforms", (items) => {
            // Set default if not already set
            if (items.platforms === undefined) {
                chrome.storage.sync.set({
                    "platforms": [
                        // Default platforms below
                        "Teams",
                        "Big Blue Button",
                        "Zoom",
                        "Moodle"
                    ]
                }, () => { })
            }
        })

    }
})


// On context menu item clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {

    // Get the next free index for saving
    getNextIndex((index) => {
        // Create the according Conference object
        var thisConference = new Conference(
            index,
            info.selectionText,
            "notes",
            "platform",
            "link",
            info.pageUrl,
            1, 2)

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
