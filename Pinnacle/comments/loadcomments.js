function allText(node) {
    output = [];
    if (node.nodeType === Node.TEXT_NODE) {
        return [node];
    }
    for (let i = 0; i < node.childNodes.length; i++) {
        output = output.concat(Array.from(allText(node.childNodes[i])));
    }
    return output;
}
function findRange(contextText, selectedText, occurenceIndex) {
    function nthIndex(str, pat, n) {
        // off stack overflow because I can't anymore
        // https://stackoverflow.com/questions/14480345/how-to-get-the-nth-occurrence-in-a-string
        var L= str.length, i= -1;
        while(n-- && i++<L){
            i= str.indexOf(pat, i);
            if (i < 0) break;
        }
        return i;
    }
    function smaller(curScope, contextText) {
        for (let i = 0; i < curScope.childNodes.length; i++) {
            if (numMatches(curScope.childNodes[i].textContent, contextText) == 1) {
                return curScope.childNodes[i];
            }
        }
        return false;
    }
    function collapseText(range, start, end, curTextNodes) {
        newText = [];

        for (let i = 0; i < curTextNodes.length; i++) {
            itemLength = curTextNodes[i].textContent.length
            if (start - itemLength < 0) {
                end += start
                for (let j = i; j < curTextNodes.length; j++) {
                    itemLength = curTextNodes[j].textContent.length
                    newText.push(curTextNodes[j]);
                    if (end - itemLength < 0) {
                        break
                    }
                    end -= itemLength;
                }
                break
            }
            start -= itemLength;
        }

        range.setStart(newText[0], start);
        range.setEnd(newText[newText.length - 1], end)
        return [start, newText];
    }
    

    curScope = document.body;

    if (numMatches(curScope.textContent, contextText) > 1) {
        return false;
    }
    
    while (smaller(curScope, contextText) != false) {
        curScope = smaller(curScope, contextText);
    }

    curTextNodes = allText(curScope);
    newText = [];

    range = new Range();
    range.setStart(curTextNodes[0], 0);
    range.setEnd(curTextNodes[curTextNodes.length - 1], autoLength(curTextNodes[curTextNodes.length - 1]))


    aaaa = collapseText(range, range.toString().indexOf(contextText), contextText.length, curTextNodes);

    // I have no idea why this is the workaround I have to employ. Why can't I destructure in peace?
    offset = aaaa[0];
    curTextNodes = aaaa[1]
    // occurenceIndex is 0-indexed
    // newOffset needs to account for the position of 
    newOffset = offset + nthIndex(range.toString(), selectedText, occurenceIndex + 1);
    collapseText(range, newOffset, selectedText.length, curTextNodes);

    return range;
}

function fillRange(range, onClick) {
    function fillNode(node, startOffset, endOffset, onClick) {
        if (node.textContent !== "") {
            let highlight = document.createElement('mark');
            highlight.classList.add('pinnacle-anchor-highlight');
            temp = new Range()
            temp.setStart(node, startOffset);
            temp.setEnd(node, endOffset);
            temp.surroundContents(highlight);
        }
    }
    function fillAllNodesBelow(node, onClick) {
        textNodes = allText(node)
        for (let i = 0; i < textNodes.length; i++) {
            fillNode(textNodes[i], 0, autoLength(textNodes[i]), onClick);
            // onclick stuff happens here
        }
    }

    start = range.startContainer;
    end = range.endContainer;
    
    if (start.isSameNode(end)) {
        fillNode(start, range.startOffset, range.endOffset, onClick);
        return;
    }

    textStart = range.startContainer;
    textEnd = range.endContainer;
    prevEndOffset = range.endOffset;
    prevStartOffset = range.startOffset;

    start = range.startContainer;
    end = range.endContainer;
    toFill = [];

    while (!range.commonAncestorContainer.isEqualNode(range.startContainer.parentElement)) {
        start = range.startContainer;
        if (start.nextSibling === null) {
            range.setStart(start.parentNode, 0);
        }
        else {
            range.setStart(start.nextSibling, 0);

            toFill.push(range.startContainer);
        }
        // toFill.push(range.startContainer);
        // fillAllNodesBelow(range.startContainer, onClick);
        start = range.startContainer;
    }

    while (!range.commonAncestorContainer.isEqualNode(range.endContainer.parentNode)) { 
        end = range.endContainer;
        if (end.previousSibling === null) {
            range.setEnd(end.parentNode, 0);
        }
        else {
            // works by coincidence, I have no idea why
            range.setEnd(end.previousSibling, 0);
            toFill.push(range.endContainer);
        }
        // fillAllNodesBelow(range.endContainer, onClick);
        end = range.endContainer;
    }

    start = range.startContainer;
    end = range.endContainer;

    while (!start.nextSibling.isEqualNode(end)) {
        range.setStart(start.nextSibling, 0);
        // if (!range.st.isEqualNode(end))
        toFill.push(range.startContainer)
        start = range.startContainer;
        end = range.endContainer;
    }

    fillNode(textStart, prevStartOffset, autoLength(textStart), onClick);
    fillNode(textEnd, 0, prevEndOffset, onClick);

    for (let i = 0; i < toFill.length; i++) {
        fillAllNodesBelow(toFill[i], onClick);
    }
}
function establish_anchor(key, comments) {
    templateComment = comments[0]
    for (let i = 0; i < comments.length; i++) {
        range = findRange(key, comments[i]["selectedText"], comments[i]["occurenceIndex"]);
        if (range !== false) {
            fillRange(range, null);
        }
    }
}

async function insert_comments() {
    console.log("is this running?");
    if ('pinnacle__loadedCommentsYet' in localStorage) {
        return;
    } else {
        localStorage['pinnacle__loadedCommentsYet'] = true;
    }
    let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);
    let request = {
        cache: 'no-cache',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({  
            pageurl : pagelocation, 
        }),
    };
    let response = await fetch("https://pinnacle.grixisutils.site/get.php", request);
    response.json().then(data => {
        let comments = {};
		//console.log(data);
        for (let i = 0; i < data.length; i++) {
            if (data[i]['pageurl'] == window.location.toString().substring(window.location.toString().indexOf('//') + 2)) {
				let c = {
					"anchorDomPath" : data[i]['divpath'],
					"anchorFocusText" : data[i]['focus_text'],
					"anchorText" : data[i]['commented_text'],
					"anchorOffsets" : [parseInt(data[i]['base_offset']), parseInt(data[i]['extent_offset'])],
					"commentText" : data[i]['comment_content'],
					"timestamp" : parseInt(data[i]['timestamp']),
                    "name" : data[i]['name'],
				};
				if (c["anchorDomPath"] in comments) {
					comments[c["anchorDomPath"]].push(c);
				} else {
					comments[c["anchorDomPath"]] = [c];
				}
			}
        };
        console.log("Server Comments Array: ", comments);
        
        chrome.storage.local.get(['saved_comments'], (result) => {
            if (result['saved_comments'] != undefined) {
                let chromeComments = result['saved_comments'];
                for (let i = 0; i < chromeComments.length; i++) {
                    if (chromeComments[i][0] != pagelocation) {
                        continue;
                    }
                    if (!(chromeComments[i][1] in comments)) {
                        comments[chromeComments[i][1]] = new Array();
                    }
                    console.log(chromeComments[i]);
                    comments[chromeComments[i][1]].push(chromeComments[i][2]);
                }
            }

            Object.entries(JSON.parse(result.saved_comments)[pagelocation]).forEach((x) => {
                let [key, commentsArray] = x;
                establish_anchor(key, commentsArray);
            });
        });
        /*if (comments != null) { comments = JSON.parse(comments)[pagelocation]; }
        if (comments == null) { comments = {}; }*/
    });
}

/*
anchor is a divpath /w text
dict = {anchor => comments}
for each path
add event listener to path /w display_anchor (comments)

*/

localStorage.removeItem('pinnacle__loadedCommentsYet');
chrome.storage.sync.get(['autoLoad'], (result) => {
    if (result.autoLoad) {
        insert_comments();
    }
});