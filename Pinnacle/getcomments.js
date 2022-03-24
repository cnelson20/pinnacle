function printComments() {
    let comments = localStorage.getItem('comments');
	let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);
	
    if (comments == null) {comments = '[]';}
    comments = JSON.parse(comments)[pagelocation];
    for (i in comments) {
		console.log(comments[i]);
        comments[i].forEach(createCommentFromDetails);
    }
}

//console.log("Hello World!");
printComments();