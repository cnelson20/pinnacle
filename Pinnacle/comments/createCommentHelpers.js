/*
    TODO: 
    - make comment body not inherit styling from the parent element
*/

var newCommentText = '';

function findInversePath(node, parent) { // treating parent as the root node, find the path to node.
    curNode = node
    stack = []
    while (!curNode.isSameNode(parent)) {
        curParent = curNode.parentNode;
        curSiblings = curParent.childNodes;
        sibIndex = 0;
        for (let i = 0; i < curSiblings.length; i++) {
            if (curSiblings[i].isSameNode(curNode)) {
                sibIndex = i;
            }
        }
        stack.unshift(curNode.nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
    }
    return stack.join(' > ');
}

function uniqueInversePaths(anchor, focus) {
    function findCommonParent(node1, node2) {
        // this is so inefficient, lmao. but it looks ok
        testParent = node1.parentNode;
        while (!testParent.contains(node2)) {
            testParent = testParent.parentNode;
        }
        return testParent;
    }
    function isUnique(node) {
        curScope = node.parentNode;
        safeScope = node; //contains node. Should be the only node that contains node.
        rootNode = node.getRootNode();
        while (!curScope.isSameNode(rootNode)) {
            childNodes = curScope.childNodes();
            for (let i = 0; i < childNodes.length; i++) {
                if (childNodes[i].isSameNode(safeScope) && childNodes[i].contains(node)) {
                    return false;
                }
            }
            curScope = curScope.parentNode;
            safeScope = safeScope.parentNode;
        }
        return true;
    }
    
    parent = findCommonParent(focus, anchor);
    while (!isUnique(parent)) {
        parent = parent.parentNode;
    }
    return [findInversePath(anchor, parent), findInversePath(focus, parent)]
}

function captureSelection() {
    let s = document.getSelection();
    [anchorInversePath, focusInversePath] = uniqueInversePaths(s.anchorNode, s.focusNode);


    chrome.storage.sync.get(['comment'], (result) => {
        newCommentText = result.comment;
        console.log(newCommentText);
        let newcomment = {
            "anchorDomPath": getDomPath(anchorElem) + "__" + s.focusNode.data.substring(s.baseOffset, s.extentOffset),
            "anchorFocusText": s.focusNode.textContent,
            "anchorText": s.focusNode.data.substring(s.baseOffset, s.extentOffset),
            "anchorOffsets": [s.baseOffset, s.extentOffset],
            "commentText": newCommentText
        };
        /* later... 
        - anchor will be a struct
        - and there will be a lot more info for the comment
        */
       

        let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);

        let key = newcomment["anchorDomPath"];


        useCommentDetails(pagelocation, key, newcomment);
    });
}

function useCommentDetails(pagelocation, key, wantedComment) {
    if (wantedComment.length == 0) {
        console.log("Can't comment on a comment!");
        return;
    }
    
    //display the new comment
    //display_anchor([ wantedComment ]);
	establish_anchor(key, [ wantedComment ]);

    //you're supposed to add to the divpath technically
    /*console.log(pagelocation);
    console.log(key);*/
    console.log(wantedComment);

    chrome.storage.sync.get(['saveCommentsOnServer', 'userDesiredName'], (result) => {
        if (result.saveCommentsOnServer !== false) {
            let request = {
                cache: 'no-cache',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({  
                    pageurl : pagelocation, 
                    divpath : wantedComment.anchorDomPath,              
                    focus_text : wantedComment.anchorFocusText,
                    commented_text : wantedComment.anchorText,
                    comment_content : wantedComment.commentText,
                    base_offset : wantedComment.anchorOffsets[0],
                    extent_offset : wantedComment.anchorOffsets[1],
					name : (result.userDesiredName != null ? result.userDesiredName : 'Anonymous'),
                }),
            };
            let responsePromise = fetch('https://pinnacle.grixisutils.site/createcomment.php', request);
        } else {
            console.log('Querying chrome.storage so we can write to it ');
            chrome.storage.local.get(['saved_comments'], (result) => {
                console.log('Writing comment to chrome.storage!');
                let savedComments = (result.saved_comments !== undefined) ? result.saved_comments : [];
                savedComments.push([pagelocation, key, wantedComment]);
                chrome.storage.local.set({'saved_comments' : savedComments});
            });
        }
    });
        
    return;
}

async function createComment() {
    //console.log("createComment()");

    captureSelection();
}