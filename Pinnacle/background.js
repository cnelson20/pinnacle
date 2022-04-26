chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ comments : []});
    console.log(chrome.storage.sync.get({ comments }));
});
