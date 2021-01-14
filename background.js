// On Install
chrome.runtime.onInstalled.addListener(function() {
    // Create a context menu
    chrome.contextMenus.create({
        id: "savetext",
        title: "Testeintrag!",
        contexts: [ "selection" ]
    })
})

// On context menu item clicked
chrome.contextMenus.onClicked.addListener( (info, tab) => {
    // testing some stuff
    console.log(info)
    console.log(tab)
    alert(info.selectionText)
})