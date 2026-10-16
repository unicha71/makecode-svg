const MAKECODE_PATTERNS = [
  "https://makecode.microbit.org/*",
  "https://makecode-microbit-org.translate.goog/*"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll().then(() => {
    chrome.contextMenus.create({
      id: "export-svg",
      title: chrome.i18n.getMessage("contextMenuTitle"),
      contexts: ["page"],
      documentUrlPatterns: MAKECODE_PATTERNS
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "export-svg" || !tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "export-svg" }).catch(() => {
    // The content script is unavailable on pages that are still loading.
  });
});
