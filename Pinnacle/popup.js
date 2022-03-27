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
    background-color: rgba(173, 216, 230, 0.8);\
    align-self: right;\
    text-align: center;\
    min-width: 200px;\
    border-radius: 10px;\
    border: 1px solid black;\
    right: 30;\
    bottom: 0;\
    font-weight: normal;\
    text-decoration: none;\
}\
.pinnacle-text-formatter {\
	color : black;\
	text-decoration:none;\
	font-size:1rem;\
	font-family:Helvetica;\
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
        files : ['functions.js'],
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
        files : ['functions.js'],
    });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['getcomments.js'],
    });
});
