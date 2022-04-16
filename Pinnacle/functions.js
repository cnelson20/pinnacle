/* Remember to keep these up to date with the ones in createcomments.js!!! */
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
                let tagname = split[i].substring(0,split[i].indexOf(':'));
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

function printComments() {
    establish_anchors();
    return;
}
function establish_anchor(key, commentsArray) {
    let [dompath, text, commentvalue, focusText, baseoffset, extentoffset, color] = commentsArray[0]; 

    let commentWrapper = document.createElement('span');
    let commentTarget = document.createElement('mark');

    commentWrapper.classList.add('pinnacle-comment-wrapper');
    commentWrapper.appendChild(commentTarget);
    
    commentTarget.classList.add('pinnacle-anchor-highlight');
    commentTarget.textContent = text;
    //() => {display_anchor(key)}
    /* 
    We want the innerHTML to include the commentWrapper <span> && </span> tags.
    creating a parent and then adding the wrapper as a child works sufficiently.
    */
    let commentWrapperParent = document.createElement('div'); 
    commentWrapperParent.appendChild(commentWrapper);
    //handle errors PLEASE
    let parentElem = findText(document.body, focusText);    
    let commentStartIndex = parentElem.textContent.indexOf(focusText) + Math.min(baseoffset, extentoffset);
    parentElem.innerHTML = parentElem.textContent.substring(0,commentStartIndex) + commentWrapperParent.innerHTML + parentElem.textContent.substring(commentStartIndex + text.length);
    let array = parentElem.getElementsByClassName("pinnacle-anchor-highlight");
    for (i in array) {
        let div = array[i];
        if (div.onclick == null) {
            div.onclick = () => {display_anchor(commentsArray)};
        }
    }
    
    //commentWrapper.addEventListener("click", () => {console.log("hi")});
}
function establish_anchors() {
    let comments = localStorage.getItem('comments');
	let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);
    if (comments != null) {comments = JSON.parse(comments)[pagelocation];}
    if (comments == null) {comments = {};}
    Object.entries(comments).forEach((x) => {
        let [key, commentsArray] = x;  
        establish_anchor(key, commentsArray);
      });
}

/*
anchor is a divpath /w text
dict = {anchor => comments}
for each path
add event listener to path /w display_anchor (comments)

*/