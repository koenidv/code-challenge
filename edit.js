
const title = document.querySelector("#title")
const notes = document.querySelector("#notes")
const platform = document.querySelector("#platform")
const link = document.querySelector("#conferenceLink")
const start = document.querySelector("#startTime")
const length = document.querySelector("#length")
const saveBtn = document.querySelector("#saveButton")


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
    title.value = conference.title
    notes.value = conference.notes
    link.value = conference.link
    start.value = moment(starttime).format('YYYY-MM-DDTHH:mm')

    // If date is iffy, highlight date picker
    if (conference.iffydate) start.classList.add("error")

    // Set the length input to the event's length
    // or the default value from sync storage
    if (conference.endtime != null) {
        length.value =
            (conference.endtime - conference.starttime) / 1000 / 60
    } else {
        chrome.storage.sync.get("defaultLength", (items) => {
            length.value = items.defaultLength
        })
    }

    // Request focus for title input
    title.focus()

    // Save on ctrl+enter or enter if title is focused
    document.onkeyup = function (e) {
        var evt = window.event || e;
        if (evt.key == "Enter" && (evt.ctrlKey || title == document.activeElement)) {
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
    for (item of items.platforms) {
        var option = document.createElement("option")

        // If this is the selected item, mark it
        if (item == conference.platform) {
            option.selected = "selected"
        }

        option.value = item
        option.textContent = item
        platform.appendChild(option)
    }

})

// Save button
// Set onclick as inline js is disabled
saveBtn.onclick = function () {
    saveThis()
}

function saveThis() {
    let valid = true
    title.classList.remove("error")
    start.classList.remove("error")

    // Update conference object with the respective inputs
    conference.title = title.value.trim()
    conference.notes = notes.value.trim()
    conference.platform = platform.value
    conference.link = link.value.trim()
    conference.starttime = moment(start.value).valueOf()
    conference.endtime = conference.starttime + (length.value * 60 * 1000)

    // Don't continue if no title or date is specified
    // Also don't continue if date is in the past
    if (!conference.title) {
        title.classList.add("error")
        valid = false
    }
    if (!start.value
        || conference.starttime < moment().valueOf()) {
        start.classList.add("error")
        valid = false
    }

    if (valid) {
        // Disable save button whilst saving
        saveBtn.disabled = true

        // Save the conference
        save(conference, () => {
            // We need to wait for saving to complete before closing the popup
            window.close()
        })
    }
}

// Set window size, matching popup width
window.resizeTo(28 * parseFloat(getComputedStyle(document.documentElement).fontSize), 600)
