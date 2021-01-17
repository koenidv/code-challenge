
// Currently using Chrome Synced Storage, not a database. 
// (Better implementation with extensions, synced accross devices)
// This might not be the best solution, but handling everything
// "database"-related in this file means we could easily
// switch it up later

/**
 * Save a conference object to synced storage
 */
function save(conference, callback) {
    // First, get current items
    chrome.storage.sync.get("conferences", (items) => {
        var conferences = items.conferences
        // conferences: Conference[]

        // If this is the first conference, create an array
        if (conferences === undefined) {
            conferences = [conference]
        } else {
            // Else add this conference to the list
            conferences.push(conference)
        }

        // .. and save all to synced storage
        chrome.storage.sync.set(
            { "conferences": conferences },
            function () { callback() }
        )
        // Other key/value combinations in storage
        // will not be affected by this
    })
}

/**
 * Remove a conference from storage by its id
 */
function remove(id) {
    // Get currently saved conferences
    chrome.storage.sync.get("conferences", (items) => {
        // Get the item's index within the array
        let index = items.conferences.find(element => element.id == id)
        // If the items was found, remove it from the array and save to storage
        if (index != -1) {
            items.conferences.splice(index, 1)
            chrome.storage.sync.set(items, () => { })
        }
    })
}

/**
 * Get the highest "auto increment" id in the database
 * and return it increased by 1
 * Storage is not synchronous, therefore we need to implement a callback
 */
function getNextIndex(callback) {
    // Get currently saved conferences
    chrome.storage.sync.get("conferences", (items) => {
        // If no conferences were added yet, return 0
        if (items.conferences === undefined) {
            callback(0)
        } else {
            // Get the maximum of...
            var maxIndex = Math.max.apply(
                Math,
                // ...each conference's id
                items.conferences.map(
                    function (conference) {
                        return conference.id
                    }
                ))

            // If invalid ids were saved, return 0
            if (isNaN(maxIndex)) callback(0)
            // else return the max index plus 1
            else callback(maxIndex + 1)
        }
    })
}
