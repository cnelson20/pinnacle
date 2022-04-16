chrome.storage.sync.get(['autoLoad'], (result) => {
    if (result.autoLoad) {  
        insertComments();
        construct_sidebar();

    }
});

async function insertComments() {
    printComments();
}
