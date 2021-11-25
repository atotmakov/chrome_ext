const v = { method: 'getcurrentworkitem' };

chrome.runtime.sendMessage(v, (response) => { 
    var text = response;
    console.log(response); 
    const title = document.getElementById("tit");
    title.innerHTML = `hello ${text} world`
});

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => { 
    console.log(request);
    const title = document.getElementById("tit");
    title.innerHTML = `hello ${request.id} ${request.url} world`
});
