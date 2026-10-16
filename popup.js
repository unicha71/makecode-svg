const status = document.getElementById("status");
const exportButton = document.getElementById("export");

function message(name) {
  return chrome.i18n.getMessage(name);
}

document.documentElement.lang = chrome.i18n.getUILanguage().startsWith("ja") ? "ja" : "en";
document.querySelectorAll("[data-i18n]").forEach((element) => {
  element.textContent = message(element.dataset.i18n);
});

function showStatus(text, isError = false) {
  status.textContent = text;
  status.style.color = isError ? "#b3261e" : "";
}

exportButton.addEventListener("click", async () => {
  exportButton.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error(message("makeCodeTabNotFound"));
    }
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "export-svg"
    });
    if (!response?.ok) {
      throw new Error(response?.error || message("blocksNotFound"));
    }
    showStatus(message("exportSuccess"));
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    exportButton.disabled = false;
  }
});
