
// Test: Get all events
// interactive false: Don't do anything if user isn't signed in
chrome.identity.getAuthToken({ 'interactive': false }, function (token) {
    console.log(token)

    var init = {
        'method': 'GET',
        'async': true,
        'headers': {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        'contentType': 'json'
    };

    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', init)
        .then((response) => response.json()) // Transform the data into json
        .then(function (data) {
            console.log(data);
        })
})
