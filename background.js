console.log("Background.js loaded");

chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked"); // Debug log

  chrome.tabs.sendMessage(tab.id, { action: "toggleModal" });
});
