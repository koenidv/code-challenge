
// Set default event length input
chrome.storage.sync.get("defaultLength", (items) => {
    // Items: {defaultLength: Int}
    document.querySelector("#defaultLength").value = items.defaultLength
})


// Get platforms container, template and text for each
let container = document.querySelector("#platforms")
let template = document.querySelector("#platformTempl").content
let innerContent = template.querySelector("#platform")
let input = template.querySelector("#platformName")
let deleteButton = template.querySelector("#deleteButton")

// Show currently added platforms
// Get platforms from synced storage
chrome.storage.sync.get("platforms", (items) => {
    // items: {platforms: String[]}

    // Add each saved platform to the container using the template

    for (item of items.platforms) {
        appendPlatform(item)
    }
})

// Add onclick for new platform button
document.querySelector("#newPlatformButton").onclick = function () {
        // Append a new empty platform template clone
        appendPlatform("")
        // Create a new empty entry in storage
        addPlatform("")
    }

/**
 * Create a new platform input 
 */
function appendPlatform(name) {
        input.value = name
        // Set the item container's id to the current number
        // of items so we can recognize it later
        let index = container.childElementCount
        innerContent.id = index
        // Apppend a clone of the template
        container.appendChild(document.importNode(template, true))

        // Set onclick and onchange after element has been created
        // Delete button, removes this platform
        // Using attribute syntax for id as numberic ids are valid
        // in html5, but not in css
        document.querySelector(`[id="${index}"] #deleteButton`)
            .onclick = function () {
                // Remove this item from storage
                removePlatform(name)
                // Remove the parent div from the DOM
                this.parentNode.remove()
                return false
            }
        // Name input, changes this platforms name
        document.querySelector(`[id="${index}"] #platformName`)
            .onchange = function () {
                // Update the platform in storage
                console.log(name + ", " + this.value)
                updatePlatform(name, this.value)
                // Update name for the next change
                named = this.value
            }
        // Focus the new input so the user can edit right away
        document.querySelector(`[id="${index}"] #platformName`).focus()
    }

/**
 * Update a platform in synced storage
 * As platforms are not unique, this will update
 * the first platform matching the given @param oldname,
 * this shouldn't be much of problem currently, it'll just
 * mess the order up a bit
 */
function updatePlatform(oldname, newname) {
        // Get all current platforms
        chrome.storage.sync.get("platforms", (items) => {
            // Get the first index of a platform matching oldname
            let index = items.platforms.indexOf(oldname)
            if (index == -1) {
                // If no element was found, create a new one
                addPlatform(newname)
            } else {
                // Update the specified element with its new name
                items.platforms[index] = newname
                // Save the modified array to chrome storage
                chrome.storage.sync.set(items, () => { })
            }
        })
    }

/**
 * Save a new platform to synced storage
 */
function addPlatform(name) {
        // Get all current platforms
        chrome.storage.sync.get("platforms", (items) => {
            // If no platforms were added, create a new array
            if (items.platforms === undefined) items.platforms = [name]
            // Else add this String to the array
            else items.platforms.push(name)
            // Save the modified array to chrome storage
            chrome.storage.sync.set(items, () => { })
        })
    }

/**
 * Remove a platform from synced storage
 */
function removePlatform(name) {
        // Get all current platforms
        chrome.storage.sync.get("platforms", (items) => {
            // Drop the platform with the given name
            // Platforms do not have to be unique, so this will delete the first match
            let index = items.platforms.indexOf(name)
            if (index != -1) items.platforms.splice(index, 1)
            // Save the modified array to chrome storage
            chrome.storage.sync.set(items, () => { })
        })
    }
