const commentButton = document.getElementById('addCommentButton');
const viewButton = document.getElementById('viewCommentsButton');
const commentText = document.getElementById('commentText');

const tabPromise = chrome.tabs.query({ active: true, currentWindow: true });

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
viewButton.addEventListener('click', loadComments); 

async function loadComments() {
    let [tab] = await tabPromise;
	chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['functions.js'],
    });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['getcomments.js'],
    });
}