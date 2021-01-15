
// Set up platforms selector

// Get platforms from synced storage
chrome.storage.sync.get("platforms", (items) => {
    // items: {platforms: String[]}
    // Add each saved platform to the selector
    var selector = document.querySelector("#platform")
    for (item of items.platforms) {
        var option = document.createElement("option")
        option.value = item
        option.textContent = item
        selector.appendChild(option)
    }
})

// Get passed conference from url and set data
if (window.location.href.includes("?")) {
    // We're only passing one argument, therefore we'll just get everything
    // behind ?. This should be a conference object
    var conference = JSON.parse(unescape(
        window.location.href.substr(
            window.location.href.indexOf("?") + 1)))

    // Set the conference's value to their respective text inputs
    document.querySelector("#title").value = conference.title
    document.querySelector("#notes").value = conference.notes
    document.querySelector("#platform").value = conference.platform

}