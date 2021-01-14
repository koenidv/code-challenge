// Get all saved conferences
chrome.storage.sync.get("conferences", (items) => {
    // Add each conference's title as list element
    for (conference of items.conferences) {
        var listElement = document.createElement("li")
        var textNode = document.createTextNode(conference.title)
        listElement.appendChild(textNode)
        document.body.appendChild(listElement)
    }
})