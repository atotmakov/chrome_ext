function parseURL(url) {

    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;

    // Let the browser do the work
    parser.href = url;

    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }

    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };

}

function getClickHandler() {
  return function(info, tab) {

    var urll = info.pageUrl;//parseURL(info.pageUrl);

    var pn = urll.indexOf('/_');

    var f = urll.substring(0,pn);

    var url = 'info.html?' + f + '#' + info.selectionText;

    chrome.windows.create({ url: url });
  };
};

chrome.contextMenus.create({
  "title" : "Get TFS Workitem Histrory", 
  "type" : "normal",
  "contexts" : ["selection"],
  "onclick" : getClickHandler()
});
