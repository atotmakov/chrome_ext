//import {formatDateTime, timeDiff} from './time.js';

function replace_timestamps() {
    var wi_ids = document.getElementsByClassName("work-item-form-id")
    if (wi_ids.length == 1) {
        var wi_id = wi_ids[0].children[0].innerText;
        var comment = document.getElementsByClassName("wit-comment-viewer");

        url = window.location.href;
        url = url.substring(0, url.indexOf('_workitems'));

        if (Array.from(comment).some(c => "done" != c.getAttribute("operated"))) {
            var urljson = url + `_apis/wit/workitems/${wi_id}/comments`
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", urljson, true); // false for synchronous request
            xmlHttp.onload = function () {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {

                        var cc = JSON.parse(xmlHttp.responseText).comments;
                        var i = 0;
                        for (c of comment) {
                            if ("done" != c.getAttribute("operated")) {
                                var comment_id = c.getElementsByClassName("comment-content")[0].getAttribute("data-comment-id");
                                var timestamp = c.getElementsByClassName("comment-timestamp")[0];

                                var timeinterval = "";
                                if (i + 1 < comment.length) {
                                    timeinterval = ` (+${timeDiff(cc[i + 1].modifiedDate, cc[i].modifiedDate)})`;
                                }
                                timestamp.innerText = `${formatDateTime(cc[i].modifiedDate)}${timeinterval}`;
                                i = i + 1;
                                c.setAttribute("operated", "done");
                            }
                        }

                    } else {
                        console.error(xmlHttp.statusText);
                    }
                }
            };
            xmlHttp.send(null);
        }
    }
}

function get_workitem_fromDOM() {
    
    // The first element that matches (or null if none do):
    //var element = document.querySelector('[aria-label="ID Field"]');
    // A list of matching elements (empty if none do):
    let text = '';
    let list = document.querySelectorAll('[aria-label="ID Field"]');
    list.forEach( (val) => { 
        text = text + val.innerHTML; 
    });
    
    //var text = '';
    

    return { id: text, url: window.location.href };
}

window.addEventListener('load', function () {
    const v = { method: 'getoption', option_name: 'change_time_setting' };
    chrome.runtime.sendMessage(v, (response) => { console.log(response); });
});

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => { 
    if (request.get_workitem_fromDOM) {
        sendResponse( get_workitem_fromDOM());
    }
    if (request.change_time_setting != false) {
        setInterval(replace_timestamps, 1000);
    }
});

