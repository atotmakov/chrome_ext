function getClickHandler() {
  return function (info, tab) {

    var urll = info.pageUrl;
    var pn = urll.indexOf('/_');
    var f = urll.substring(0, pn);

    if (info.menuItemId == 'workitem_history_menu_id') {
      var url = 'info.html?' + f + '#' + info.selectionText;
      chrome.windows.create({ url: url, type: "popup" });
    }
    else if (info.menuItemId == 'workitem_links_menu_id') {
      var url = 'links.html?' + f + '#' + info.selectionText;
      chrome.windows.create({ url: url, type: "popup" });
    }
  };
};

chrome.contextMenus.onClicked.addListener(getClickHandler());

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    "id": "workitem_history_menu_id",
    "title": "Get Azure DevOps Workitem History",
    "type": "normal",
    "contexts": ["selection"]
  });
  
  chrome.contextMenus.create({
    "id": "workitem_links_menu_id",
    "title": "Get Azure DevOps Workitem Links",
    "type": "normal",
    "contexts": ["selection"]
  });
});


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
        chrome.runtime.sendMessage(response);
      });
    });
    sendResponse("Recieved");
  }
  
});
