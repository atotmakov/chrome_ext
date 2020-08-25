function getClickHandler() {
  return function(info, tab) {

    var urll = info.pageUrl;

    var pn = urll.indexOf('/_');

    var f = urll.substring(0,pn);

    var url = 'info.html?' + f + '#' + info.selectionText;

    chrome.windows.create({ url: url, type: "popup"});
  };
};

chrome.contextMenus.create({
  "title" : "Get Azure DevOps Workitem History", 
  "type" : "normal",
  "contexts" : ["selection"],
  "onclick" : getClickHandler()
});
