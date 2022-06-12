function findText(element, focusText) {
    if (element.textContent.includes(focusText)) {
        for (let i = 0; i < element.children.length; i++) {
            let r = findText(element.children[i], focusText);
            if (r != null) {
                return r;
            }
        }
        return element;
    }
    return null;
}

function establish_anchor(key, commentsArray) {
    //uses commentsArray[0] to create anchor elements!
    let templateComment = commentsArray[0];

    //console.log(commentsArray);
    //console.log(templateComment)
    let anchorText = templateComment["anchorText"];
    let focusText = templateComment["anchorFocusText"];
    let [baseoffset, extentoffset] = templateComment["anchorOffsets"];

    let commentWrapper = document.createElement('span');
    let commentTarget = document.createElement('mark');

    commentWrapper.classList.add('pinnacle-comment-wrapper');
    commentWrapper.appendChild(commentTarget);

    commentTarget.classList.add('pinnacle-anchor-highlight');
    commentTarget.textContent = anchorText;
    //() => {display_anchor(key)}
    /* 
    We want the innerHTML to include the commentWrapper <span> && </span> tags.
    creating a parent and then adding the wrapper as a child works sufficiently.
    */
    let commentWrapperParent = document.createElement('div');
    commentWrapperParent.appendChild(commentWrapper);
    //handle errors PLEASE

    let parentElem = findText(document.body, focusText);
    //console.log(parentElem);
    //console.log(focusText);
    if (parentElem != null) {
        let focusTextBaseOffset = parentElem.innerHTML.indexOf(focusText, Math.min(baseoffset, extentoffset));
        
        const firsthalf =  "<span>" + 
        parentElem.innerHTML.substring(0, focusTextBaseOffset) +
        focusText.substring(0, Math.min(baseoffset, extentoffset)) + "</span>";
        const secondhalf = "<span>" + focusText.substring(Math.max(baseoffset, extentoffset)) + 
        parentElem.innerHTML.substring(focusTextBaseOffset + focusText.length) + "</span>";

        parentElem.innerHTML = firsthalf;
        parentElem.appendChild(commentWrapper);
        parentElem.innerHTML += secondhalf;

        let array = parentElem.getElementsByClassName("pinnacle-anchor-highlight");
        for (i in array) {
            let div = array[i];
            if (typeof(div) == 'object' && div.onclick == null && true) {  
                //console.log(parentElem.innerHTML);
                //console.log(div);
                //console.log(div.innerHTML);
                div.onclick = () => { display_anchor(commentsArray) };
            }
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
        
        chrome.storage.sync.get(['saved_comments'], (result) => {
            //console.log(result);
            //console.log(result['saved_comments']);
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

            //console.log(comments);
            Object.entries(comments).forEach((x) => {
				//console.log(x);
                let [key, commentsArray] = x;
                establish_anchor(key, commentsArray);
            });
        });
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