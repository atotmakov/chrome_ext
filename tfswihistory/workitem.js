function get_wi(tfs_url, wi_id, callback) {
    var urljson = tfs_url;
    if (wi_id != 0) {
        urljson += '/_apis/wit/workitems/' + wi_id;
    }
    else {
        wi_id = tfs_url.substr(tfs_url.lastIndexOf('/') + 1);
    }

    urljson += '?$expand=Relations';

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", urljson, true); // false for synchronous request

    xmlHttp.onload = function (e) {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
                var obj = JSON.parse(xmlHttp.responseText);
                var wi_fields = obj.fields;
                var wi_links = obj.relations;
                var wi_type = wi_fields['System.WorkItemType'];
                var type_link = obj._links['workItemType'].href;
                get_wi_icon(type_link, wi_id, wi_type, wi_fields, wi_links, callback);
            } else {
                console.error(xmlHttp.statusText);
            }
        }
    };
    xmlHttp.send(null);
}

function get_wi_icon(tfs_url, wi_id, wi_type, wi_fields, wi_links, callback) {
    var urljson = tfs_url;// + '/_apis/wit/workitemtypes/' + wi_type;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", urljson, true);

    xmlHttp.onload = function (e) {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
                var obj = JSON.parse(xmlHttp.responseText);
                var icon_url = obj['icon']['url'];
                callback(wi_id, wi_fields, wi_links, tfs_url + '/_workitems/edit/' + wi_id, wi_type, icon_url);
            } else {
                console.error(xmlHttp.statusText);
            }
        }
    };
    xmlHttp.send(null);
}

