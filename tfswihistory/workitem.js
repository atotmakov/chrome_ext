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
                let fields_friendly_names = obj['fields'];
                callback(wi_id, wi_fields, fields_friendly_names, wi_links, html_link, wi_type, icon_url);
            } else {
                console.error(xmlHttp.statusText);
            }
        }
    };
    xmlHttp.send(null);
}

function get_wi_history_new(tfs_url, wi_id, callback) {
    get_history_new(tfs_url, wi_id, 0, null, null, callback);
    return;
}

function get_history_new(tfs_url, wi_id, page_num, revisionsAutors, fieldsset, callback) {
    var page_size = 100;
    var urljson = tfs_url + '/_apis/wit/workItems/' + wi_id + `/revisions?$top=${page_size}&$skip=${page_size * page_num}&api-version=5.1`
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", urljson, true);
      
    xmlHttp.onload = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          get_history_handler_new(tfs_url, wi_id, page_num, revisionsAutors, fieldsset, xmlHttp.responseText, callback);
        } else {
          console.error(xmlHttp.statusText);
        }
      }
    };
    xmlHttp.send(null);
}

function get_history_handler_new(tfs_url, wi_id, page_num, revisionsAutors, fieldsset, response, callback) {

    var obj = JSON.parse(response);
  
    if (fieldsset == null) {
      fieldsset = [];
    }
  
    const [autors, fields] = extract_fields_and_authors(obj, fieldsset);
  
    if (revisionsAutors == null) {
      revisionsAutors = autors;
    }
    else {
      revisionsAutors = revisionsAutors.concat(autors);
    }
  
    if (obj.count == 0) { //all data loaded
      revisionsAutors.splice(0, 0, 'skip zero index to align with tfs revisions, which started from 1');
      callback(fieldsset);
    }
    else {
      get_history_new(tfs_url, wi_id, page_num + 1, revisionsAutors, fieldsset, callback);
    }
  }

  function extract_fields_and_authors(json_onject, fieldsset) {
    var revisionsAutors = [];
  
    var obj = json_onject;
  
    var all_possible_fileds_names = new Set();
    for (var i = 0; i < obj.count; i++) { //iterate through revisions
      var fields = obj.value[i].fields;
      var revision = obj.value[i].rev;
      revisionsAutors[i] = { author: fields['System.ChangedBy']['displayName'], dt: fields['System.ChangedDate'] };
  
      //for each revision azure returns not all fields
      //in case when field became undefinded, azure do not returns it in fields revision list
      //so we should iterate through all fields wich we met in the previous revisions
      for (const [name, value] of Object.entries(fields)) {
        all_possible_fileds_names.add(name);
      }
  
      for (var name of all_possible_fileds_names.values()) {
        var value = fields[name];
        var string_value = value;
        if (value) {
          if (typeof value !== 'string' && value['displayName']) {
            string_value = value['displayName'];
          }
        }
        else {
          string_value = null;
        }
  
        if (fieldsset[name]) {
          if (fieldsset[name][fieldsset[name].length - 1].val != string_value)
            fieldsset[name].push({ rev: revision, val: string_value });
        }
        else {
          fieldsset[name] = [{ rev: revision, val: string_value }]
        }
      }
    }
    return [revisionsAutors, fieldsset];
  }

module.exports = { get_wi, get_wi_icon, get_wi_link};
