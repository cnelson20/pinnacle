const commentButton = document.getElementById('addCommentButton');
const viewButton = document.getElementById('viewCommentsButton');
const commentText = document.getElementById('commentText');

const tabPromise = chrome.tabs.query({ active: true, currentWindow: true });
const customCSS = ".pinnacle-comment-wrapper {\
    position: relative;\
}\
.pinnacle-comment {\
    padding : 2px;\
    position: absolute;\
    background-color: rgba(173, 216, 230, 0.5);\
    align-self: right;\
    text-align: center;\
    width: 200;\
    right: 30;\
    bottom: 0;\
}\
\
.pinnacle-anchor-highlight {\
    background-color: rgba(150, 150, 150, 0.5);\
}";

async function insertCustomCSS() {
    let [tab] = await tabPromise;
    chrome.scripting.insertCSS({
        target : {tabId : tab.id},
        css : customCSS,
    });
}

insertCustomCSS();

commentButton.addEventListener('click', async () => {  
    let [tab] = await tabPromise;
    chrome.storage.sync.set({
        'comment' : commentText.value.trimEnd()
    });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['createcomments.js'],
    });
});
viewButton.addEventListener('click', async () => {
    let [tab] = await tabPromise;
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['getcomments.js'],
    });
});