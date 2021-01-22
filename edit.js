
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


    // Set the length input to the event's length
    // or the default value from sync storage
    if (conference.endtime != null) {
        document.querySelector("#length").value =
            (conference.endtime - conference.starttime) / 1000 / 60
    } else {
        chrome.storage.sync.get("defaultLength", (items) => {
            document.querySelector("#length").value = items.defaultLength
        })
    }

    // Request focus for title input
    document.querySelector("#title").focus()

    // Save on ctrl+enter or enter if title is focused
    document.onkeyup = function (e) {
        var evt = window.event || e;
        console.log(evt)
        if (evt.key == "Enter" && (evt.ctrlKey ||
            document.querySelector("#title") == document.activeElement)) {
            saveThis()
        } else if (evt.key == "Escape") {
            window.close()
        }
    }

}

// Set up platforms selector
// Get platforms from synced storage
chrome.storage.sync.get("platforms", (items) => {
    // items: {platforms: String[]}
    // Add each saved platform to the selector
    var selector = document.querySelector("#platform")
    for (item of items.platforms) {
        var option = document.createElement("option")

        // If this is the selected item, mark it
        if (item == conference.platform) {
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
    saveThis()
}

function saveThis() {
    // Update conference object with the respective inputs
    conference.title = document.querySelector("#title").value.trim()
    conference.notes = document.querySelector("#notes").value.trim()
    conference.platforms = document.querySelector("#platform").value
    conference.link = document.querySelector("#conferenceLink").value.trim()
    conference.starttime = new Date(document.querySelector("#startTime").value).getTime()
    conference.endtime = conference.starttime + (document.querySelector("#length").value * 60 * 1000)


    // todo endtime = starttime + defaultLength

    // Save the conference
    save(conference, () => {
        // We need to wait for saving to complete before closing the popup
        window.close()
    })
}

// Set window size, matching popup width
window.resizeTo(28 * parseFloat(getComputedStyle(document.documentElement).fontSize), 600)
