const toggleDarkHoverButton = document.getElementById('toggleDarkHover');
const autoLoadCommentsButton = document.getElementById('autoLoadComments');
const serverCommentsButton = document.getElementById('serverComments');
const userNameButton = document.getElementById('userDesiredName');

chrome.storage.sync.get(['enableHover', 'autoLoad', 'saveCommentsOnServer', 'saved_comments'], (result) => {
    console.log(result.enableHover, result.autoLoad, result.saveCommentsOnServer);
    toggleDarkHoverButton.checked = result.enableHover;
    autoLoadCommentsButton.checked = result.autoLoad;
    serverCommentsButton.checked = !(result.saveCommentsOnServer !== false);
    if (result.saved_comments === undefined) {
        chrome.storage.sync.set({'saved_comments' : []});
    }
})

toggleDarkHoverButton.addEventListener('change', () => {
    chrome.storage.sync.set({
        'enableHover' : toggleDarkHoverButton.checked,
    });
});
autoLoadCommentsButton.addEventListener('change', () => {
    chrome.storage.sync.set({
        'autoLoad' : autoLoadCommentsButton.checked,
    });
});
serverCommentsButton.addEventListener('change', () => {
    chrome.storage.sync.set({
        'saveCommentsOnServer' : !serverCommentsButton.checked,
    });
});
userNameButton.addEventListener('change', () => {
    chrome.storage.sync.set({
        'userDesiredName' : userNameButton.value,
    });
});