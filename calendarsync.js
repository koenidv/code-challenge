
/**
 * Insert an conference event to Google Calendar
 * Pass idToUpdate to update an existing event, or leave empty to create a new one
 */
function insertEvent(conference, idToUpdate, callback) {

    // Calendar event data
    const data = {
        "id": "conferenceplanner" + conference.id,
        "summary": conference.title,
        "description": conference.link + "<br>Via Conference Planner<br><a href='" + conference.foundlink + "'>See original post</a><br><br>" + conference.notes,
        "location": conference.platform,
        "start": {
            "dateTime": new Date(conference.starttime).toISOString()
        },
        "end": {
            "dateTime": new Date(conference.endtime).toISOString()
        }
    }

    // Use post for create, put for update and set url accordingly
    let url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    let method = "post"
    if (idToUpdate) {
        url += "/conferenceplanner" + conference.id
        method = "put"
    }

    // interactive false: Get an error if user isn't signed in
    chrome.identity.getAuthToken({ 'interactive': false }, function (token) {
        // Post / Put request to calendar rest api
        fetch(url, {
                    method: method,
                    headers: {
                        // Don't forget authorization :)
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
            .then( (text) => {
                callback()
                // Log response text 
                console.log(text);
            })
            .catch( (error) => {
                // Log error
                console.log("Error: ", error)
            })
    })

}

/**
 * Delete a calendar event
 */
function deleteEvent(id) {
    // interactive false: Get an error if user isn't signed in
    chrome.identity.getAuthToken({ 'interactive': false }, function (token) {
        // Delete request to calendar rest api
        fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/conferenceplanner" + id, {
            method: "delete",
            headers: {'Authorization': 'Bearer ' + token}
        }).catch( (error) => {
            console.log(error)
        })
    })
}