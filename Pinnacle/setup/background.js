chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        'saved_comments' : [],
        'enableHover' : true,
        'autoLoad' : true,
        'saveCommentsOnServer' : true
    });
    console.log(chrome.storage.sync.get({ comments }));
});