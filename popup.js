// Get all saved conferences
get((conferences) => {
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

            // Date and user-set notes (M/d, H:m \n notes)
            notes.textContent = `${starttime.getMonth() + 1}/${starttime.getDate()}, ${starttime.getHours()}:${starttime.getMinutes()}` +
                `\r\n${conference.notes}`

            // Original post href
            foundin.href = conference.foundlink

            // Clone the template and add it to the body
            document.body.appendChild(
                document.importNode(template, true)
            )
        }

        // Set on click functions
        setOnClicks()

    } else {
        document.querySelector("#placeholder").style.display = "block"
    }

})

function setOnClicks() {
    // Edit, open edit popup with this conference
    setOnClick("#edit", function () {
        // Get the respective conference object
        console.log(this.parentNode.id)
        getById(this.parentNode.id, (it) => {
            console.log(it)
            // Open a new window letting the user edit the conference
            chrome.windows.create({
                url: chrome.extension.getURL("edit.html")
                    + "?" + escape(JSON.stringify(it)),
                focused: true,
                type: "popup"
            })
            // Close this popup
            window.close()
        })
    })
    // Remove, remove conference from database
    setOnClick("#delete", function () {
        // Remove the conferences with the parent container's id from storage
        remove(this.parentNode.id)
        // Remove the parent from DOM
        this.parentNode.remove()
    })

    // Open a given url in a new tab per item and original post link
    // This is needed because regular links won't be opened
    // when clicked within the popup

    // Title, redirect to conference link
    setOnClick("#title", function () {
        chrome.tabs.create({ active: true, url: this.getAttribute("href") })
    })
    // We need to set click functions for items and links seperately,
    // otherwise the item will use the links href
    // Found in link, redirect to original post
    setOnClick("a", function () {
        chrome.tabs.create({ active: true, url: this.href })
    })
}

/*
 * Set onclick for each element matching the query
 */
function setOnClick(query, onclick) {
    for (element of document.querySelectorAll(query)) {
        element.onclick = onclick
    }
}
