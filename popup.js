// Get all saved conferences
chrome.storage.sync.get("conferences", (items) => {
    // items: {conferences: Conference[]}

    if (items.conferences !== undefined && items.conferences.size != 0) {

        // Get the template element
        var template = document.querySelector("#conferenceTempl").content

        // Get content elements
        var title = template.querySelector("#title")
        var notes = template.querySelector("#notes")
        var foundin = template.querySelector("#found")

        // Add each conference's title as list element
        for (conference of items.conferences) {

            // Set contents within the template

            // Title href: conference url, and text
            title.setAttribute("href", conference.link)
            title.textContent = `${conference.title} \u2192` //u2192: →

            // User-set notes
            notes.textContent = conference.notes

            // Original post href
            foundin.href = conference.foundlink

            // Clone the template and add it to the body
            document.body.appendChild(
                document.importNode(template, true)
            )
        }

        // Set on click functions
        setOnClick()

    } else {
        document.querySelector("#placeholder").style.display = "block"
    }

})

// Open a given url in a new tab per item and original post link
// This is needed because regular links won't be opened
// when clicked within the popup
// This also means we create a two new functions for each item..
// not ideal
function setOnClick() {
    var items = document.querySelectorAll("#title")
    for (item of items) {
        item.onclick = function () {
            chrome.tabs.create({ active: true, url: item.getAttribute("href") })
        }
    }
    // We need to set click functions for items and links seperately,
    // otherwise the item will use the links href
    var links = document.querySelectorAll("a")
    for (link of links) {
        link.onclick = function () {
            chrome.tabs.create({ active: true, url: link.href })
        }
    }
}