function findText(element, focusText) {
    if (element.textContent.includes(focusText)) {
        for (let i = 0; i < element.children.length; i++) {
            let r = findText(element.children[i], focusText);
            if (r != null) {
                return r;
            }
        }
        return element
    }
    return null;
}

function establish_anchor(key, commentsArray) {
    //uses commentsArray[0] to create anchor elements!
    let templateComment = commentsArray[0];

    console.log(templateComment)
    let divText = templateComment["anchorDivText"];
    let focusText = templateComment["anchorFocusText"];
    let [baseoffset, extentoffset] = templateComment["anchorOffsets"];

    let commentWrapper = document.createElement('span');
    let commentTarget = document.createElement('mark');

    commentWrapper.classList.add('pinnacle-comment-wrapper');
    commentWrapper.appendChild(commentTarget);

    commentTarget.classList.add('pinnacle-anchor-highlight');
    commentTarget.textContent = focusText;
    //() => {display_anchor(key)}
    /* 
    We want the innerHTML to include the commentWrapper <span> && </span> tags.
    creating a parent and then adding the wrapper as a child works sufficiently.
    */
    let commentWrapperParent = document.createElement('div');
    commentWrapperParent.appendChild(commentWrapper);
    //handle errors PLEASE

    let parentElem = findText(document.body, focusText);
    console.log(parentElem)
    parentElem.innerHTML = parentElem.textContent.substring(0, baseoffset) + commentWrapperParent.innerHTML + parentElem.textContent.substring(extentoffset, divText.length);
    let array = parentElem.getElementsByClassName("pinnacle-anchor-highlight");
    for (i in array) {
        let div = array[i];
        if (div.onclick == null) {
            div.onclick = () => { display_anchor(commentsArray) };
        }
    }

    //commentWrapper.addEventListener("click", () => {console.log("hi")});
}

function insert_comments() {
    console.log("is this running?")
    let comments = localStorage.getItem('comments');
    console.log(comments)
    let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);
    if (comments != null) { comments = JSON.parse(comments)[pagelocation]; }
    if (comments == null) { comments = {}; }
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

insert_comments();