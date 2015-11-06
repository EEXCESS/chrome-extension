chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install' || details.reason === 'update') {
        chrome.tabs.create({'url': chrome.extension.getURL('html/help.html')});
        // initialize blacklist
        var blacklist = ['stackoverflow.com', 'mail.google.com', 'gmail.com'];
        chrome.storage.local.set({blacklist:blacklist});
    }
});