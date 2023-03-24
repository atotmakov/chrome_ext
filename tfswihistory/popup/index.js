/*const v = { method: 'getcurrentworkitem' };

chrome.runtime.sendMessage(v, (response) => { });

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => { 
    var a = document.createElement('a');
    var linkText = document.createTextNode(`workitem: ${request.id}`);
    a.appendChild(linkText);
    a.title = `workitem: ${request.id}`;
    a.href = request.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    var wi_placeholder = document.getElementById("workitem");
    wi_placeholder.appendChild(a);
});*/
