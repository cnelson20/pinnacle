chrome.storage.sync.get(['autoLoad'], (result) => {
    if (result.autoLoad) {
        insertComments();
    }
});

async function insertComments() {
    printComments();
}
