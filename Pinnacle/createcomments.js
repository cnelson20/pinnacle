/*
    TODO: 
    - make comment body not inherit styling from the parent element
*/

var newCommentText = '';

function createComment() {
    //getNewCommentText();
    let wantedComment = captureSelection();

    /* Create necessary classes */
    let commentWrapper = document.createElement('span');
    let commentTarget = document.createElement('mark');
    let commentContents = document.createElement('span');
    let commentParagraph = document.createElement('p');
    
    commentWrapper.classList.add('pinnacle-comment-wrapper');
    commentWrapper.appendChild(commentTarget);
    commentWrapper.appendChild(commentContents);

    commentTarget.classList.add('pinnacle-anchor-highlight');
    
    commentTarget.textContent = wantedComment[1];
    
    commentContents.classList.add('pinnacle-comment'); 
    commentContents.appendChild(commentParagraph);
    commentParagraph.innerHTML = newCommentText;

    console.log(wantedComment[0]); // DOM path
    console.log(wantedComment[1]); // Selected Area
    console.log(wantedComment[2]); // Actual Comment (What they want to say!)
    console.log(wantedComment[3]); // focusNode [ bigger area for indexOf() ]
    console.log(wantedComment[4]); // Base offset
    console.log(wantedComment[5]); // Extent offset
    /* 
        We want the innerHTML to include the commentWrapper <span> && </span> tags.
        creating a parent and then adding the wrapper as a child works sufficiently.
    */
    let commentWrapperParent = document.createElement('div'); 
    commentWrapperParent.appendChild(commentWrapper);
    
    let parentElem = findText(document.body, wantedComment[1]);    
    let commentStartIndex = parentElem.innerHTML.indexOf(wantedComment[3]) + Math.min(wantedComment[4], wantedComment[5]);
    parentElem.innerHTML = parentElem.innerHTML.substring(0,commentStartIndex) + commentWrapperParent.innerHTML + parentElem.innerHTML.substring(commentStartIndex + wantedComment[1].length);
}

function captureSelection() {
    let s = document.getSelection();
    let old = localStorage.getItem('comments');
    if (old == null) {old = '{}';}
    console.log(s.focusNode)
    let newcomment = [getDomPath(s.focusNode.parentElement), s.focusNode.data.substring(s.baseOffset, s.extentOffset), newCommentText, s.focusNode.textContent, s.baseOffset, s.extentOffset];
    old = JSON.parse(old);
    if (newcomment[0] in old) {
        old[newcomment[0]].push(newcomment);
    } else {
        old[newcomment[0]] = [newcomment];
    }
    localStorage.setItem('comments', JSON.stringify(old));

    return newcomment;
}

function getNewCommentText() {
    chrome.storage.sync.get(['comment'], (result) => {
        newCommentText = result.comment;
        createComment();
    });
}

function getDomPath(el) {
    if (!el) {
        return;
    }
    var stack = [];
    var isShadow = false;
    while (el.parentNode != null) {
        // console.log(el.nodeName);
        var sibCount = 0;
        var sibIndex = 0;
        // get sibling indexes
        for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
            var sib = el.parentNode.childNodes[i];
            if ( sib.nodeName == el.nodeName ) {
                if ( sib === el ) {
                    sibIndex = sibCount;
                }
                sibCount++;
            }
        }
        // if ( el.hasAttribute('id') && el.id != '' ) { no id shortcuts, ids are not unique in shadowDom
        //   stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
        // } else
        var nodeName = el.nodeName.toLowerCase();
        if (isShadow) {
            nodeName += "::shadow";
            isShadow = false;
        }
        if ( sibCount > 1 ) {
            stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
        } else {
            stack.unshift(nodeName);
        }
        el = el.parentNode;
        if (el.nodeType === 11) { // for shadow dom, we
            isShadow = true;
            el = el.host;
        }
    }
    stack.splice(0,1); // removes the html element
    return stack.join(' > ');
}

//createComment();
getNewCommentText();

function findText(element, text) {
    if (element.textContent.includes(text)) {
        for (let i = 0; i < element.children.length; i++) {
            let r = findText(element.children[i], text);
            if (r != null) {
                return r;
            }
        }
        return element;
    }
    return null;
}

/*
    Given a DOM path for an HTML object, return the lowest object in the path that is a unique div.
*/
function getElementByDomPathLimit(string) {
    let split = string.split(" > ");
    let elem = document;
    for (let i = 0; i < split.length; i++) {
        if (split[i].includes(':')) {
            return elem;
        } else {
            elem = elem.getElementsByTagName(split[i]);
        }
    }
    return elem;
}