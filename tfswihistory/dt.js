//window.onload = function() {
//    document.write('Hello world');
//}


function formatDateTime(str) {
    //str
    //2019-10-17T08:56:08.573Z
    //2020-11-29T21:00:00Z - not working
      var res = str; 
      if (str[4] == '-' && str[7] == '-' && str[10] == 'T' && str[13] == ':' && str[16] == ':' && ( str[19] == '.' || str[19] == 'Z')) {
        var dt = new Date(str);
        const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit' };
        res = dt.toLocaleDateString(undefined, options);
      }
      return res;
    }

function formatTimePeriod(str) {
        var sec_num = parseInt(str, 10) / (1000 * 60); 
        var days    = Math.floor(sec_num / ( 24 * 60));
        var hours   = Math.floor((sec_num - days * 24 * 60 ) / 60 );
        var minutes = Math.floor(sec_num - days * 24 * 60 - hours * 60);
    
        var res = ""
        if (days > 0) { res =`${days} days`; }
        if (hours > 0) { res =`${res} ${hours} hours`; }
        if (minutes > 0 && days < 1) {res =`${res} ${minutes} mins`; }
        if (days == 0 && hours == 0 && minutes == 0) {res = "0 secs";}
        return res;
    }    

function timeDiff(begin, end) {
        var b = new Date(begin);
        var e = new Date(end);

        return formatTimePeriod(e - b);
    }
    

var cm = setInterval(function() {
    //comment-timestamp
//comment-content
    var wi_ids = document.getElementsByClassName("work-item-form-id")
    if (wi_ids.length == 1)
    {
        var wi_id = wi_ids[0].children[0].innerText;
        var comment = document.getElementsByClassName("wit-comment-viewer");

        if (Array.from(comment).some( c => "done" != c.getAttribute("operated"))) {
            var urljson = `https://hqrndtfs.avp.ru/tfs/DefaultCollection/Monorepo/_apis/wit/workitems/${wi_id}/comments`
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
                            if (i + 1 < comment.length ) {
                                timeinterval = ` (+${timeDiff(cc[i+1].modifiedDate, cc[i].modifiedDate)})`;
                            }
                            timestamp.innerText = `${formatDateTime(cc[i].modifiedDate)}${timeinterval}`;
                            i = i + 1;
                            c.setAttribute("operated","done");
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
}, 1000);


window.addEventListener('load', function () {
    console.log('onload');    
//    var x = document.getElementsByClassName("comment-timestamp");
//    console.log(x);
//    for (m of x) {
//        console.log(m);
//        m.innerHTML = 'fsd';
//    }

    //comments-section
//    var comments = document.getElementsByClassName("flex-column flex-grow scroll-hidden")[0];

//    console.log(comments);    

//    const config = { attributes: true, childList: true, subtree: true };
//    mutationObserver.observe(comments,config)

})