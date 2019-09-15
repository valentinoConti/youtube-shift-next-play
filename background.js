// Extensions icon turns on while user is on a youtube video.
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlContains: 'youtube.com' },
      })],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
  });
})

// Receiving message with playlist
let playlist = []
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request[0].link)
      playlist = request
      playlist.shift()
      playlist.forEach((vid) => { vid.num -= 1 })
  });

// Sending playlist on tab update
chrome.tabs.update(undefined, {}, function(tab) {
  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (changeInfo.status == 'complete') {
        chrome.tabs.sendMessage(tabId, playlist);
      }
  });
});