import * as dddif from './lib/diff.js';

function html2text(html) {
  html = html.toString();
  html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
  html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
  html = html.replace(/<\/div>/ig, '\n');
  html = html.replace(/<\/li>/ig, '\n');
  html = html.replace(/<li>/ig, '  *  ');
  html = html.replace(/<\/ul>/ig, '\n');
  html = html.replace(/<\/p>/ig, '\n');
  html = html.replace(/<br\s*[\/]?>/gi, "\n");
  html = html.replace(/<[^>]+>/ig, '');
  return html;
}

function getDiff(prev, curr) {
  if (prev && curr) {
    var span = null;
    var fragment = document.createDocumentFragment();
    var diff = Diff.diffWords(html2text(prev), html2text(curr));
    diff.forEach((part) => {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? 'green' :
        part.removed ? 'red' : 'black';
      span = document.createElement('span');
      span.style.color = color;
      span.appendChild(document.createTextNode(part.value));
      fragment.appendChild(span);
    });
    var sspan = document.createElement('span');
    sspan.appendChild(fragment);
    return sspan.outerHTML;
  }
  return curr;
}

function renderCells(cells, data, revisionsAutors) {
  var tbody = document.getElementById('tbody');

  for (const [key, value] of Object.entries(data)) {
    var prev = '';
    var tr = "<tr class = 'rendered'>";

    var diff_id = `${key}_diff`;
    var diff_on = localStorage.getItem(diff_id);
    if (diff_on && diff_on == 'true') {
      diff_on = true;
    } else {
      diff_on = false;
    }
    var checked = '';
    if (diff_on) {
      checked = 'checked';
    }

    var diffcheckbox = `<input type='checkbox' id='${diff_id}' ${checked}> Show as diff`

    var s = `<table>`;

    var i = 0;
    for (const v of value) {
      var author = revisionsAutors[v.rev - 1].author + ' ' + revisionsAutors[v.rev - 1].dt;

      var val = v.val;
      if (diff_on) {
        var val = getDiff(prev, v.val);
      }

      s += '<tr = class="values"><td>' + val + '</td><td class = "rev">' + author + ' [rev:' + v.rev + ']</td></tr>';
      prev = v.val;
    }

    s += '</table>';

    var checked = 'checked';
    var hidden = '';
    var val = localStorage.getItem(key);
    if (val && val == 'false') {
      checked = '';
      hidden = 'hidden';
    }

    tr += `<td class="key"><input type="checkbox" id="${key}" ${checked}>${key}<div ${hidden}><p>${diffcheckbox}</div></td><td ${hidden}>${s}</td></tr>`;

    tbody.innerHTML += tr;
  }
};

function resizeWindow() {
  window.setTimeout(function () {
    chrome.tabs.getCurrent(function (tab) {
      var newHeight = Math.min(document.body.offsetHeight + 140, 700);
      chrome.windows.update(tab.windowId, {
        height: newHeight,
        width: 520
      });
    });
  }, 150);
};

function renderWIInfo(imageinfo, revisionsAutors) {

  var divloader = document.querySelector('#loader');
  var divoutput = document.querySelector('#output');
  divloader.style.display = "none";
  divoutput.style.display = "block";

  var divinfo = document.querySelector('#info');
  var divexif = document.querySelector('#exif');


  var datacells = divinfo.querySelectorAll('td');
  renderCells(datacells, imageinfo, revisionsAutors);

};

function renderWITitle(title, url, wi_type, icon_url) {
  var divurl = document.querySelector('#url');

  var wi_icon = document.createElement('img');
  wi_icon.src = icon_url;
  wi_icon.className = "header-img";
  divurl.appendChild(wi_icon);

  var urltext = `${wi_type} ${title}`;
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.innerText = urltext;
  divurl.appendChild(anchor);

};


function formatDateTimeSkipOther(str) {
  //str
  //2019-10-17T08:56:08.573Z
  //2020-11-29T21:00:00Z - not working
  var res = str;
  if (str[4] == '-' && str[7] == '-' && str[10] == 'T' && str[13] == ':' && str[16] == ':' && (str[19] == '.' || str[19] == 'Z')) {
    var dt = new Date(str);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit' };
    res = dt.toLocaleDateString(undefined, options);
  }
  return res;
}


function get_history(tfs_url, wi_id, page_num, revisionsAutors, fieldsset) {
  var page_size = 100;
  var urljson = tfs_url + '/_apis/wit/workItems/' + wi_id + `/revisions?$top=${page_size}&$skip=${page_size * page_num}&api-version=5.1`
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", urljson, true); // false for synchronous request

  xmlHttp.onload = function (e) {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        get_history_handler(tfs_url, wi_id, page_num, revisionsAutors, fieldsset, xmlHttp.responseText);
      } else {
        console.error(xmlHttp.statusText);
      }
    }
  };
  xmlHttp.send(null);
}

function get_wi_title(tfs_url, wi_id) {
  var urljson = tfs_url + '/_apis/wit/workitems/' + wi_id;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", urljson, true); // false for synchronous request

  xmlHttp.onload = function (e) {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        var fields = JSON.parse(xmlHttp.responseText).fields;
        var s = fields['System.Title'];
        var wi_type = fields['System.WorkItemType'];
        fill_wi_title(tfs_url, wi_id, wi_type, s);
      } else {
        console.error(xmlHttp.statusText);
      }
    }
  };
  xmlHttp.send(null);
}

function fill_wi_title(tfs_url, wi_id, wi_type, wi_title) {
  var urljson = tfs_url + '/_apis/wit/workitemtypes/' + wi_type;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", urljson, true);

  xmlHttp.onload = function (e) {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        var obj = JSON.parse(xmlHttp.responseText);
        var icon_url = obj['icon']['url'];
        renderWITitle(`${wi_id} : ${wi_title}`, tfs_url + '/_workitems/edit/' + wi_id, wi_type, icon_url);
      } else {
        console.error(xmlHttp.statusText);
      }
    }
  };
  xmlHttp.send(null);
}

function extract_fields_and_authors(json_onject, fieldsset) {
  var revisionsAutors = [];

  var obj = json_onject;

  var i = 0;
  for (; i < obj.count; i++) {
    var d = obj.value[i].fields;
    var revision = obj.value[i].rev;
    for (const [key, value] of Object.entries(d)) {
      var string_value = value;
      if (typeof value !== 'string' && value['displayName']) {
        string_value = value['displayName'];
      }
      string_value = formatDateTimeSkipOther(string_value);
      if (!revisionsAutors[i]) {
        revisionsAutors[i] = { author: '', dt: '' };
      }
      if (key == 'System.ChangedBy') {
        revisionsAutors[i].author = string_value;
      }
      else if (key == 'System.ChangedDate') {
        revisionsAutors[i].dt = string_value;
      }
      else {
        if (fieldsset[key]) {
          if (fieldsset[key][fieldsset[key].length - 1].val != string_value)
            fieldsset[key].push({ rev: revision, val: string_value });
        }
        else
          fieldsset[key] = [{ rev: revision, val: string_value }]
      }
    }
  }
  return [revisionsAutors, fieldsset];
}

function get_history_handler(tfs_url, wi_id, page_num, revisionsAutors, fieldsset, response) {

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
    renderWIInfo(fieldsset, revisionsAutors);

    for (let checkbox of document.querySelectorAll('input[type=checkbox]')) {
      checkbox.addEventListener('change', function () {
        localStorage.setItem(this.id, this.checked);
        if (this.parentElement.nextElementSibling) {
          this.parentElement.nextElementSibling.hidden = !this.checked;
          this.nextElementSibling.hidden = !this.checked
        } else {
          location.reload();
        }
      });
    }
  }
  else {
    get_history(tfs_url, wi_id, page_num + 1, revisionsAutors, fieldsset);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var wi_id = window.location.hash.substring(1);
  var tfs_url = window.location.search.substring(1);
  if (tfs_url) {
    get_wi_title(tfs_url, wi_id);
    get_history(tfs_url, wi_id, 0, null, null);
  }
});

