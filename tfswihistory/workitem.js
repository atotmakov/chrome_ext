function get_wi_link(tfs_url, wi_id) {
    return `${tfs_url}/_apis/wit/workitems/${wi_id}`;
}

function get_wi(tfs_url, wi_id, callback, xmlHttp = new XMLHttpRequest()) {
    var urljson = tfs_url;

    urljson += '?$expand=Relations';

    xmlHttp.open("GET", urljson, true); // false for synchronous request

    xmlHttp.onload = function (e) {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
                var obj = JSON.parse(xmlHttp.responseText);
                let wi_id = obj.id;
                var wi_fields = obj.fields;
                var wi_links = obj.relations;
                var wi_type = wi_fields['System.WorkItemType'];
                var type_link = obj._links['workItemType'].href;
                let html_link = obj._links["html"].href;
                get_wi_icon(type_link, wi_id, wi_type, wi_fields, wi_links, html_link, callback, xmlHttp);
            } else {
                console.error(xmlHttp.statusText);
            }
        }
    };
    xmlHttp.send(null);
}
function get_wi_icon(tfs_url, wi_id, wi_type, wi_fields, wi_links, html_link, callback, xmlHttp = new XMLHttpRequest()) {
    var urljson = tfs_url;// + '/_apis/wit/workitemtypes/' + wi_type;
    xmlHttp.open("GET", urljson, true);

    xmlHttp.onload = function (e) {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
                var obj = JSON.parse(xmlHttp.responseText);
                var icon_url = obj['icon']['url'];
                callback(wi_id, wi_fields, wi_links, html_link, wi_type, icon_url);
            } else {
                console.error(xmlHttp.statusText);
            }
        }
    };
    xmlHttp.send(null);
}

module.exports = { get_wi, get_wi_icon, get_wi_link};
