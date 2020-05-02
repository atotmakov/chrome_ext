function getClickHandler() {
  return function(info, tab) {

    // The srcUrl property is only available for image elements.
    var url = 'info.html#' + info.selectionText;

    // Create a new window to the info page.
    browser.windows.create({ url: url, width: 520, height: 660 });
  };
};

/**
 * Create a context menu which will only show up for images.
 */
browser.contextMenus.create({
  "title" : "Get TFS Workitem Histrory", 
  "type" : "normal",
  "contexts" : ["selection"],
  "onclick" : getClickHandler()
});
