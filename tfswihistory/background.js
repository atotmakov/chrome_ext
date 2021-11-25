function getClickHandler() {
  return function (info, tab) {

    var urll = info.pageUrl;
    var pn = urll.indexOf('/_');
    var f = urll.substring(0, pn);
    var url = 'info.html?' + f + '#' + info.selectionText;

    chrome.windows.create({ url: url, type: "popup" });
  };
};

chrome.contextMenus.create({
  "id": "sfweropiwerfoisjfiowepufwefiwe",
  "title": "Get Azure DevOps Workitem History",
  "type": "normal",
  "contexts": ["selection"]
});

chrome.contextMenus.onClicked.addListener(getClickHandler());

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let key = request.option_name;
  if (request.method === 'getoption') {
    chrome.storage.local.get([key], function (result) {
      chrome.tabs.sendMessage(sender.tab.id, result);
    });
    sendResponse("Recieved");
  }
  if (request.method === 'getcurrentworkitem') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {get_workitem_fromDOM: 1}, function(response) {
        console.log(response);
        //sendResponse(response);
        chrome.runtime.sendMessage(response);
      });
    });
    sendResponse("Recieved");
  }
  
});
