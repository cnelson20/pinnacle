chrome.storage.sync.get(['autoLoad'], (result) => {
    if (result.autoLoad) {
        insert_comments();
    }
});
