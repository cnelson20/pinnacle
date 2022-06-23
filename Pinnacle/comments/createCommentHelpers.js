function numMatches(text, regex) {
    // stack overflow God bless
    // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    regex = regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return [...text.matchAll(new RegExp(`(?=${regex})`, "gm"))].length;
}
function autoLength(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent.length
    }
    else {
        return node.childNodes.length
    }
}
    
function captureSelection() {
    function normalizedRange(selection) {
        range = selection.getRangeAt(0).cloneRange()
        if (selection.anchorNode.compareDocumentPosition(selection.focusNode) !== Node.DOCUMENT_POSITION_PRECEDING) {
            return range;
        }
        range.setStart(selection.focusNode, selection.focusOffset);
        range.setEnd(selection.anchorNode, selection.anchorOffset);
        return range
    }
    function findUniqueContext(selection) {
        /* return an expanded range from selection */

        function expand(startIndex, endIndex, startOffset, endOffset) {
            // curText is read only this time :)
            // moving up in this world
            while (!(startOffset - 1 > 0)) {
                startIndex -= 1;
                startOffset = autoLength(curText[startIndex])
            }
            startOffset -= 1;

            while (!(endOffset + 1 < autoLength(curText[endIndex]))) {
                endIndex += 1;
                endOffset = 0;
            }
            endOffset += 1;

            startSnippet = curText[startIndex].toString().slice(startOffset, autoLength(curText[startIndex]));
            midSnippet = curText.slice(startIndex + 1, endIndex).join("")
            endSnippet = curText[endIndex].toString().slice(endOffset);

            newContextText = startSnippet + midSnippet + endSnippet;
            return [startIndex, endIndex, startOffset, endOffset, newContextText];
        }

        curScope = normalizedRange(selection);

        curText = allText(document.body);

        startIndex = curText.indexOf(curScope.startContainer);
        endIndex = curText.indexOf(curScope.endContainer);

        startOffset = curScope.startOffset;
        endOffset = curScope.endOffset;

        out = expand(startIndex, endIndex, startOffset, endOffset);

        while (numMatches(document.body.innerText, out[4]) > 1) {
            out = expand(out[0], out[1], out[2], out[3]);
        }
        curScope.setStart(curText[out[0]], out[2]);
        curScope.setEnd(curText[out[1]], out[3])

        return curScope;
    }

    function findOccurenceIndex(uniqueContext, selection) {
        /* within the unique ancestor, what is the (0-indexed) index of the text of the actual range
        in an array of children which all contain selectedText ? */
        range = normalizedRange(selection);

        selectedText = range.toString();

        if (numMatches(uniqueContext.toString(), selectedText) == 1) {
            return 0;
        }

        curScope = range.startContainer;
        stack = [
            curScope.textContent.substring(uniqueContext.startOffset, range.startOffset),
            selectedText
        ];
        while (!curScope.isSameNode(uniqueContext.startContainer)) {
            curSibling = curScope.previousSibling;
            while (curSibling != undefined) {
                stack.unshift(curSibling.textContent);
                curSibling = curSibling.previousSibling;
            }
        }
        return numMatches(stack.join(""), selectedText) - 1
    }

    let s = document.getSelection();
    uniqueContext = findUniqueContext(s);
    occurenceIndex = findOccurenceIndex(uniqueContext, s);

    console.log(uniqueContext);
    console.log(occurenceIndex);
   
    // you know what's funny is some browsers support multiple selection ranges, lmao. Let's pretend that that's not a thing :)
    // also let's limit comment length

    chrome.storage.sync.get(['comment'], (result) => {
        newCommentText = result.comment;
        let newcomment = {
            "occurenceIndex": occurenceIndex,
            "selectedText": normalizedRange(s).toString(),
            "contextText": uniqueContext.toString(),
            "commentText": newCommentText
        };
        /* later... 
        - anchor will be a struct
        - and there will be a lot more info for the comment
        */
       

        let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);

        let key = newcomment["contextText"];

        useCommentDetails(pagelocation, key, newcomment);
    });
}

function sendNewStyleComment(comment) {
    chrome.storage.sync.get(['saveCommentsOnServer', 'userDesiredName'], (result) => {
        if (result.saveCommentsOnServer) {
            let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);
            let request = {
                cache: 'no-cache',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({  
                    "pageurl" : pagelocation, 
                    "occurenceIndex" : comment.occurenceIndex,
                    "selectedText" : comment.selectedText,
                    "contextText" : comment.contextText,
                    "commentText" : comment.commentText,
                    "name" : result.userDesiredName,
                }),
            };
            fetch("https://pinnacle.grixisutils.site/konst_create.php", request);
        }
    });
}

function useCommentDetails(pagelocation, key, wantedComment) {
    if (wantedComment.length == 0) {
        console.log("Can't comment on a comment!");
        return;
    }
    
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
        }
        else {
            console.log('Querying chrome.storage so we can write to it ');
            chrome.storage.local.get(['saved_comments'], (result) => {
                console.log('Writing comment to chrome.storage!');
                let savedComments = (result.saved_comments !== undefined) ? JSON.parse(result.saved_comments) : {};
                let pageComments = (pagelocation in savedComments) ? savedComments[pagelocation] : {};
                if (key in pageComments) {
                    console.log("in!")
                    pageComments[key].push(wantedComment);
                }
                else {
                    pageComments[key] = [wantedComment];
                }
                savedComments[pagelocation] = pageComments;
                chrome.storage.local.set({ 'saved_comments': JSON.stringify(savedComments) });
            });
        }
    });
        
    return;
}

async function createComment() {
    console.log("createComment()");

    captureSelection();
}