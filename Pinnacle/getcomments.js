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

function printComments() {
    let comments = localStorage.getItem('comments');
    if (comments == null) {comments = '[]';}
    comments = JSON.parse(comments);
    for (i in comments) {
        comments[i].forEach(createCommentFromDetails);
    }
}

function createCommentFromDetails(commentdetails) {
    let [dompath, text, commentvalue, loffset, roffset] = commentdetails; 

    let commentWrapper = document.createElement('span');
    let commentTarget = document.createElement('mark');
    let commentContents = document.createElement('span');
    let commentParagraph = document.createElement('p');
    
    commentWrapper.classList.add('pinnacle-comment-wrapper');
    commentWrapper.appendChild(commentTarget);
    commentWrapper.appendChild(commentContents);

    commentTarget.classList.add('pinnacle-anchor-highlight');

    commentTarget.textContent = text;
    
    commentContents.style = document.body.style;
    commentContents.classList.add('pinnacle-comment'); 
    commentContents.appendChild(commentParagraph);
    commentParagraph.textContent = commentvalue;

    /* 
        We want the innerHTML to include the commentWrapper <span> && </span> tags.
        creating a parent and then adding the wrapper as a child works sufficiently.
    */
    let commentWrapperParent = document.createElement('div'); 
    commentWrapperParent.appendChild(commentWrapper);
    
    //console.log(getElementByDomPathLimit(dompath));
    let parentElem = findText(getElementByDomPathLimit(dompath), text);    
    let commentStartIndex = parentElem.innerHTML.indexOf(text);
    parentElem.innerHTML = parentElem.innerHTML.substring(0,commentStartIndex) + commentWrapperParent.innerHTML + parentElem.innerHTML.substring(commentStartIndex + text.length);
}

//console.log("Hello World!");
printComments();