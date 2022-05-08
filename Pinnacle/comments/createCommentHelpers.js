/*
    TODO: 
    - make comment body not inherit styling from the parent element
*/

var newCommentText = '';

function getSpecificDivChildren(element, divtype) {
    let possList = element.querySelectorAll(divtype);
    let yesList = [];
    for (let i = 0; i < possList.length; i++) {
        if (possList[i].parentElement === element) {
            yesList.push(possList[i]);
        }
    }
    return yesList;
}

/*
    Given a DOM path for an HTML object, return the lowest object in the path that is a unique div.
*/
function getElementByDomPathLimit(string) {
    let split = string.split(" > ");
    let elem = document;
    for (let i = 0; i < split.length; i++) {
        if (split[i].includes(':')) {
            if (split[i].includes('nth-of-type(')) {
                let tagname = split[i].substring(0, split[i].indexOf(':'));
                let righttagchildren = getSpecificDivChildren(elem, tagname);
                let targetIndex = parseInt(split[i].substring(split[i].indexOf('nth-of-type(') + 'nth-of-type('.length));

                /*console.log(elem);
                console.log(split[i]);
                console.log(tagname);
                console.log(righttagchildren);
                console.log(righttagchildren[targetIndex]);  
                */
                elem = righttagchildren[targetIndex - 1];
            } else {
                return elem;
            }
        } else {
            elem = elem.getElementsByTagName(split[i])[0];
        }
    }
    return elem;
}

/* 
    Given div, return string of div path 
*/
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
        for (var i = 0; i < el.parentNode.childNodes.length; i++) {
            var sib = el.parentNode.childNodes[i];
            if (sib.nodeName == el.nodeName) {
                if (sib === el) {
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
        if (sibCount > 1) {
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
    stack.splice(0, 1); // removes the html element
    return stack.join(' > ');
}

function captureSelection() {
    let s = document.getSelection();
    for (let i = 0; i < s.focusNode.parentElement.classList.length; i++) {
        //console.log(s.focusNode.parentElement.classList[i].substring(0,'pinnacle-'.length));
        let name = s.focusNode.parentElement.classList[i];
        if (name.substring(0, 'pinnacle-'.length) == 'pinnacle-' && name != 'pinnacle-anchor-highlight') {
            return [];
        }
    }
    let anchorElem = s.focusNode.parentElement;
    if (anchorElem.tagName == 'MARK' && anchorElem.parentElement.tagName == "SPAN") { //rewrite this to ignore our own markups
        anchorElem = anchorElem.parentElement.parentElement;
    }
    let old = localStorage.getItem('comments');
    if (old == null) { old = '{}'; }

    /*
    let newcomment = [
        getDomPath(anchorElem),
        s.focusNode.data.substring(s.baseOffset, s.extentOffset),
        newCommentText, s.focusNode.textContent,
        s.baseOffset, s.extentOffset,
        getInverseBackgroundColor(anchorElem)
    ];
    */

    chrome.storage.sync.get(['comment'], (result) => {
        newCommentText = result.comment;
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

        old = JSON.parse(old);

        let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);

        if (!(pagelocation in old)) {
            old[pagelocation] = {};
        }

        let key = newcomment["anchorDomPath"];


        useCommentDetails(pagelocation, key, newcomment);
    });
}

function useCommentDetails(pagelocation, key, wantedComment) {
    if (wantedComment.length == 0) {
        console.log("Can't comment on a comment!");
        return;
    }
    //you're supposed to add to the divpath technically
    console.log(wantedComment);
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
        }),
    };
    let responsePromise = fetch('https://pinnacle.grixisutils.site/createcomment.php', request);
        
    //display the new comment
    display_anchor(pagelocation, key);
    return;
}

async function createComment() {
    console.log("createComment()");

    captureSelection();
}