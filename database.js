
// Currently using Chrome Synced Storage, not a relational database. 
// (Better implementation with extensions, synced accross devices)
// This might not be the best solution, but handling everything
// "database"-related in this file means it could easily be
// switched up later

/**
 * Get all conferences from storage
 * empty array if none are saved
 */
function get(callback) {
    chrome.storage.sync.get("conferences", (items) => {
        if (items.conferences == undefined) {
            callback([])
        } else {
            callback(items.conferences)
        }
    })
}

/**
* Remove old conferences, then get all current ones, sorted by their date
*/
function getCurrent(callback) {
    removeOld(() => {
        get( (conferences) => {
            callback(conferences.sort( (a, b) => a.starttime - b.starttime))
        })
    })
}

/** 
 * Get a conference by its id
 * undefined if no matching conference was found
 */
function getById(id, callback) {
    // Get all conferences and call back with the one with a matching id
    get((conferences) => {
        callback(conferences.find((element) => element.id == id))
    })
}

/**
 * Save a conference object to synced storage
 */
function save(conference, callback) {
    // First, get current items
    get((conferences) => {
        // conferences: Conference[]

        // Make sure conference link is absolute
        if (!conference.link.match(/https?:\/\//) && conference.link)  {
            conference.link = "https://" + conference.link
        }

        // Update/create
        let itemIndex = conferences.findIndex((element) => element.id == conference.id)
        let id = null
        if (itemIndex != -1) {
            // If there's already a conference with the same id, update it
            conferences[itemIndex] = conference
            id = conference.id
            // Cancel the currently pending alarm
            chrome.alarms.clear(conference.id.toString(), () => { })
        } else {
            // Else add this conference to the list
            conferences.push(conference)
        }

        // Try inserting into / updating calendar
        insertEvent(conference, id, () => {
            // .. and save all to synced storage
            // Other key/value combinations in storage
            // will not be affected by this
            chrome.storage.sync.set(
                { "conferences": conferences },
                () => {
                    // Create an alarm 15 minutes prior to start date
                    chrome.alarms.create(conference.id.toString(), { when: conference.starttime - (15 * 60 * 1000) })
                    callback()
                })
        })
    })
}

/**
 * Remove a conference from storage by its id
 */
function remove(id) {
    // Get currently saved conferences
    get((conferences) => {
        // Get the item's index within the array
        let index = conferences.findIndex(element => element.id == id)
        // If the items was found, remove it from the array and save the array
        // Also delete from calendar
        if (index != -1) {
            conferences.splice(index, 1)
            chrome.storage.sync.set({ "conferences": conferences }, () => { })
            // Try to remove the event from calendar
            deleteEvent(id)
        }
    })
}

/**
 * Removes all conferences with a past end time
 */
function removeOld(callback) {
    // Get currently saved conferences and time
    get((conferences) => {
        const timenow = (new Date()).getTime()
        // Remove every conference that has a past end time
        for (let i = 0; i < conferences.length; i++) {
            console.log(conferences[i].endtime - timenow)
            if (conferences[i].endtime < timenow) {
                conferences.splice(i, 1)
                // Index is now one lower as there is one less element
                i--
            }
        }
        chrome.storage.sync.set({ "conferences": conferences }, () => {
            callback()
        })
    })
}

/**
 * Get the amount of created conferences, add one,
 * use it as index and remember we created one more
 */
function getNextIndex(callback) {
    // Get current number of conferences
    chrome.storage.sync.get("conferenceIndex", (items) => {
        // Increase by one or 0 if undefined
        let nextIndex = items.conferenceIndex + 1
        if (isNaN(nextIndex) || nextIndex == null) nextIndex = 0
        // Save the new index
        chrome.storage.sync.set({ "conferenceIndex": nextIndex }, () => {
            // Call back with the now highest index
            callback(nextIndex)
        })
    })
}
