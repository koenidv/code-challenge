
// Show currently added platforms
// Get platforms from synced storage
chrome.storage.sync.get("platforms", (items) => {
    // items: {platforms: String[]}
    // Get platforms container, template and text for each
    let container = document.querySelector("#platforms")
    let template = document.querySelector("#platform").content
    let input = template.querySelector("#platformName")

    // Add each saved platform to the container using the template

    for (item of items.platforms) {
        input.value = item
        // Apppend a clone of the template
        container.appendChild(document.importNode(template, true))
    }

    // Clear the template's input in case we need to clone it again later
    input.value = ""
})

// Add onclick for new platform button
document.querySelector("#newPlatformButton").onclick = function () {
    // Append a new empty platform template clone
    document.querySelector("#platforms").appendChild(
        document.importNode(
            document.querySelector("#platform").content,
            true))
}