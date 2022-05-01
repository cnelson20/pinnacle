const toggleDarkHoverButton = document.getElementById('toggleDarkHover');
const autoLoadCommentsButton = document.getElementById('autoLoadComments');

chrome.storage.sync.get(['enableHover', 'autoLoad'], (result) => {
    console.log(result.enableHover)
    toggleDarkHoverButton.checked = result.enableHover;
    autoLoadCommentsButton.checked = result.autoLoad;
})

toggleDarkHoverButton.addEventListener('change', () => {
    console.log('clicked!');
    chrome.storage.sync.set({
        'enableHover' : toggleDarkHoverButton.checked,
    });
});
autoLoadCommentsButton.addEventListener('change', () => {
    chrome.storage.sync.set({
        'autoLoad' : autoLoadCommentsButton.checked,
    });
});