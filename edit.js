
// Get passed conference from url and set data
if (window.location.href.includes("?")) {
    // We're only passing one argument, therefore we'll just get everything
    // behind ?. This should be a conference object
    var conference = JSON.parse(unescape(
        window.location.href.substr(
            window.location.href.indexOf("?") + 1)))
    // Time is saved as Int, but we need a Date object
    let starttime = new Date(conference.starttime)

    console.log(conference)
    console.log(starttime)

    // Set the conference's value to their respective text inputs
    document.querySelector("#title").value = conference.title
    document.querySelector("#notes").value = conference.notes
    document.querySelector("#conferenceLink").value = conference.link
    document.querySelector("#startTime").value = starttime.toJSON().slice(0, 16)

}

// Set up platforms selector
// Get platforms from synced storage
chrome.storage.sync.get("platforms", (items) => {
    // items: {platforms: String[]}
    // Add each saved platform to the selector
    var selector = document.querySelector("#platform")
    for (item of items.platforms) {
        var option = document.createElement("option")

        console.log(item + ", " + conference.platform)
        // If this is the selected item, mark it
        if (item == conference.platform) {
            console.log("yep")
            option.selected = "selected"
        }

        option.value = item
        option.textContent = item
        selector.appendChild(option)
    }

})

// Save button
// Set onclick as inline js is disabled
document.querySelector("#saveButton").onclick = function () {
    // Update conference object with the respective inputs
    conference.title = document.querySelector("#title").value
    conference.notes = document.querySelector("#notes").value
    conference.platforms = document.querySelector("#platform").value
    conference.link = document.querySelector("#conferenceLink").value
    conference.starttime = new Date(document.querySelector("#startTime").value).getTime()


    // todo endtime = starttime + defaultLength


    save(conference, () => {
        // We need to wait for saving to complete before closing the popup
        window.close()
    })
}

// Set window size, matching popup width
window.resizeTo(28 * parseFloat(getComputedStyle(document.documentElement).fontSize), 600)
