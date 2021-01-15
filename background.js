
// On install / update
chrome.runtime.onInstalled.addListener((details) => {
    // Create a context menu
    chrome.contextMenus.create({
        id: "savetext",
        title: "Testeintrag!",
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

    var thisConference = new Conference(info.selectionText, "notes", "platform", "link", info.pageUrl, 0, 1, 2)

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

    /*
        
        // test saving some values to synced storage
        // First, get current items
        chrome.storage.sync.get("conferences", (items) => {
            var conferences = items.conferences
        
            var thisConference = new Conference(info.selectionText, "notes", "platform", "link", info.pageUrl, 0, 1, 2)
    
            // If only a link was selected
            if (info.linkUrl) {
                thisConference.link = info.linkUrl
            }
    
            // If this is the first conference, create an array
            if (conferences === undefined) {
                conferences = [thisConference]
            } else {
                // Else add this conference to the list
                conferences.push(thisConference)
            }
    
            // .. and save all to synced storage
            chrome.storage.sync.set(
                { "conferences": conferences },
                function () {
                    // Log the new value for testing purposes
                    chrome.storage.sync.get("conferences", (newItems) => {})
                }
            )
        })
    
        */

})