const commentButton = document.getElementById('addCommentButton');
const tab = getCurrentTab();
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

chrome.scripting.insertCSS({
    target : {tabId : tab.id},
    css : customCSS,
});

commentButton.addEventListener('click', async () => {  
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        func : createComment,
    });
});

function createComment() {
    let commentWrapper = document.createElement('div');
    let commentTarget = document.createElement('mark');
    let commentContents = document.createElement('div');
    let commentParagraph = document.createElement('p');
    
    commentWrapper.classList.add('pinnacle-comment-wrapper');
    commentWrapper.appendChild(commentTarget);
    commentWrapper.appendChild(commentContents);

    commentTarget.classList.add('pinnacle-anchor-highlight');
    commentContents.classList.add('pinnacle-comment'); 
    commentContents.appendChild(commentParagraph);
    commentParagraph.textContent = "This is a comment!";

    document.body.appendChild(commentWrapper);
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}