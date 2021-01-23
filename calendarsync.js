
/**
 * Insert an conference event to Google Calendar
 * Pass idToUpdate to update an existing event, or leave empty to create a new one
 */
function insertEvent(conference, idToUpdate, callback) {

    var retry = true

    function run() {

        // interactive false: Get an error if user isn't signed in
        chrome.identity.getAuthToken({ 'interactive': false }, function (token) {

            // Return if an error occurred, like if the user isn't signed in
            if (chrome.runtime.lastError) {
                callback();
                return;
            }

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
                },
                "reminders": {
                    // Notify 10 minutes before conference start
                    "useDefault": false,
                    "overrides": [
                        { "method": "popup", "minutes": 10 }
                    ]
                }
            }

            // Use post for create, put for update and set url accordingly
            let url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
            let method = "post"
            if (idToUpdate) {
                url += "/conferenceplanner" + conference.id
                method = "put"
            }


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
                .then((text) => {
                    // Log response text 
                    console.log(text);
                    // Callback if request was successfull,
                    // else try one more time with a fresh token
                    if (text.ok) callback
                    else runRetry(token)
                })
                .catch((error) => {
                    // Log error
                    console.log("Error: ", error)
                    runRetry(token)
                })
        })

    }

    function runRetry(token) {
        // Only try again once
        if (retry) {
            retry = false;
            // Remove cached token
            chrome.identity.removeCachedAuthToken({ "token": token }, () => {
                run()
            })
        } else {
            callback()
        }
    }

    run()

}

/**
 * Delete a calendar event
 */
function deleteEvent(id) {

    var retry = true

    function run() {
        // interactive false: Get an error if user isn't signed in
        chrome.identity.getAuthToken({ 'interactive': false }, function (token) {

            // Return if an error occurred, like if the user isn't signed in
            if (chrome.runtime.lastError) {
                callback();
                return;
            }

            // Delete request to calendar rest api
            fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/conferenceplanner" + id, {
                method: "delete",
                headers: { 'Authorization': 'Bearer ' + token }
            })
                .then((text) => {
                    // Log response text 
                    console.log(text);
                    // Callback if request was successfull,
                    // else try one more time with a fresh token
                    if (!text.ok) runRetry(token)
                }).catch((error) => {
                    console.log(error)
                    runRetry(token)
                })
        })
    }

    function runRetry(token) {
        // Only try again once
        if (retry) {
            retry = false;
            // Remove cached token
            chrome.identity.removeCachedAuthToken({ "token": token }, () => {
                run()
            })
        }
    }

    run()
}