
// On Install
chrome.runtime.onInstalled.addListener(function () {
    // Create a context menu
    chrome.contextMenus.create({
        id: "savetext",
        title: "Testeintrag!",
        contexts: ["selection"]
    })
})


// On context menu item clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {

    // test saving some values to synced storage
    // First, get current items
    chrome.storage.sync.get("conferences", (items) => {
        var conferences = items.conferences
        var thisConference = new Conference(info.selectionText, "notes", "platform", "link", "foundlink", 0, 1, 2)

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
                chrome.storage.sync.get("conferences", (newItems) => {
                    console.log(newItems.conferences)
                })
            }
        )
    })

})