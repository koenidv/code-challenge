
/**
 * Insert an conference event to Google Calendar
 */
function insertEvent(conference) {

    // Calendar event data
    const data = {
        "id": "conferenceplanner" + conference.id,
        "summary": conference.title,
        "description": conference.link + "<br>Via Conference Planner<br><a href='" + conference.foundlink + "'>See original post</a>",
        "location": conference.platform,
        "start": {
            "dateTime": new Date(conference.starttime).toISOString()
        },
        "end": {
            "dateTime": new Date(conference.endtime).toISOString()
        }
    }

    // interactive false: Get an error if user isn't signed in
    chrome.identity.getAuthToken({ 'interactive': false }, function (token) {
        console.log(token)
        // Post request to calendar rest api
        fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
                    method: "post",
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
            })
            .catch((error) => {
                // Log error
                console.log("Error: ", error)
            })
    })

}