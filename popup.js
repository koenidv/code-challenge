// Get all saved conferences
get( (conferences) => {
    // items: {conferences: Conference[]}

    if (conferences.size != 0) {

        // Get the template element
        var template = document.querySelector("#conferenceTempl").content

        // Get template elements
        let container = template.querySelector("#container")
        let title = template.querySelector("#title")
        let notes = template.querySelector("#notes")
        let foundin = template.querySelector("#found")

        // Add each conference's title as list element
        for (conference of conferences) {

            // Time is saved as Int, but we need a Date object
            let starttime = new Date(conference.starttime)

            console.log(conference)

            // Set contents within the template

            //Container id, so we can recognize this conference later
            container.id = conference.id

            // Title href: conference url, and text
            title.setAttribute("href", conference.link)
            title.textContent = `${conference.title} \u2192` //u2192: →

            // Date and user-set notes
            notes.textContent = `${starttime.getMonth() + 1}/${starttime.getDate()}\r\n${conference.notes}`

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
    // Remove link, remove conference from database
    var deletes = document.querySelectorAll("#delete")
    for (deleteLink of deletes) {
        deleteLink.onclick = function () {
            // Remove the conferences with the parent container's id from storage
            remove(this.parentNode.id)
            // Remove the parent from DOM
            this.parentNode.remove() 
        }
    }
    // Title, redirect to conference link
    var items = document.querySelectorAll("#title")
    for (item of items) {
        item.onclick = function () {
            chrome.tabs.create({ active: true, url: item.getAttribute("href") })
        }
    }
    // We need to set click functions for items and links seperately,
    // otherwise the item will use the links href
    // Found in link, redirect to original post
    var links = document.querySelectorAll("a")
    for (link of links) {
        link.onclick = function () {
            chrome.tabs.create({ active: true, url: link.href })
        }
    }
}
