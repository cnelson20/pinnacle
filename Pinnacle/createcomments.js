/*
    TODO: 
    - use a textarea in the popup so that the user can add their own text to the comment
    - make comment body not inherit styling from the parent element
*/

var newCommentText = '';
var wantedComment;

function createComment() {
    //getNewCommentText();
    captureSelection();

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
	commentContents.classList.add('pinnacle-text-formatter'); 
	commentContents.style.color = wantedComment[5];
    commentContents.appendChild(commentParagraph);
    commentParagraph.innerHTML = newCommentText;
	
	/*
    console.log(wantedComment[0]); // DOM path
    console.log(wantedComment[2]); // comment contents
    console.log(wantedComment[3]);
    console.log(wantedComment[4]);
	*/
    /* 
        We want the innerHTML to include the commentWrapper <span> && </span> tags.
        creating a parent and then adding the wrapper as a child works sufficiently.
    */
    let commentWrapperParent = document.createElement('div'); 
    commentWrapperParent.appendChild(commentWrapper);
    
    let parentElem = findText(document.body, wantedComment[1]);    
    let commentStartIndex = parentElem.innerHTML.indexOf(wantedComment[1]);
    parentElem.innerHTML = parentElem.innerHTML.substring(0,commentStartIndex) + commentWrapperParent.innerHTML + parentElem.innerHTML.substring(commentStartIndex + wantedComment[1].length);
	
	//console.log(parentElem);
	//getInverseBackgroundColor(parentElem);
}

function getInverseBackgroundColor(elem) {
	while (getComputedStyle(elem)['background-color'] == 'rgba(0, 0, 0, 0)' && elem != document.body) {
		elem = elem.parentElement;
	}
	let s = getComputedStyle(elem);
	let r,g,b,a = 0;
	if (s['background-color'] == 'rgba(0, 0, 0, 0)') {
		r = 255;
		g = 255;
		b = 255;
	} else {
		[r,g,b,a] = s['background-color'].match(/\d+/g).map(Number);
	}
	console.log(r,g,b);
	let ret = complement(r, g, b);
	console.log(ret.r, ret.g, ret.b);
	return `rgb(${ret.r},${ret.g},${ret.b})`;
}

function captureSelection() {
    let s = document.getSelection();
    let old = localStorage.getItem('comments');
    if (old == null) {old = '{}';}
    let newcomment = [getDomPath(s.focusNode.parentElement),s.focusNode.data.substring(s.baseOffset, s.extentOffset), newCommentText, s.baseOffset, s.extentOffset, getInverseBackgroundColor(s.focusNode.parentElement)];
    old = JSON.parse(old);
    if (newcomment[0] in old) {
        old[newcomment[0]].push(newcomment);
    } else {
        old[newcomment[0]] = [newcomment];
    }
    localStorage.setItem('comments', JSON.stringify(old));

    wantedComment = newcomment;
}

function getNewCommentText() {
    chrome.storage.sync.get(['comment'], (result) => {
        //console.log(result.comment);
        newCommentText = result.comment;
        //console.log(newCommentText);
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

/* Helper for function below */
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


/* Thank you stackoverflow? i forgot where this was from */
/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR 
 * r, g, b
*/
function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function complement(r, g, b) {
    let hsv = RGBtoHSV(r, g, b);
    if (hsv.s != 0) {
	hsv.h += 0.5;
    if (hsv.h> 1) {hsv.h -= 1;}
	hsv.v = 1 - hsv.v;
	} else {
		let w = hsv.v >= 0.5 ? 0 : 1;
		return {r : w, g : w, b : w};
	}
    return HSVtoRGB(hsv);
}