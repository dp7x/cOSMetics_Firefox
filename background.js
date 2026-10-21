// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchBlobUrl') {
        fetch(request.url)
            .then(response => response.blob())
            .then(blob => blob.text())
            .then(text => {
                console.log("cOSMetics for iD: Blob fetched successfully from background");
                sendResponse({ success: true, data: text });
            })
            .catch(error => {
                console.error("cOSMetics for iD: Background fetch error:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Indica che la risposta sarà asincrona
    }
});