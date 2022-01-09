import * as dddif from './lib/diff.js';
import {formatDateTime, timeDiff} from './time.js';

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

function addCheckbox(parent, id, text, checked)
{
  var checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.checked = checked;
  var label = document.createElement('label')
  label.htmlFor = id;
  label.appendChild(document.createTextNode(text));
  parent.appendChild(checkbox);
  parent.appendChild(label);
  return checkbox;
}

function renderCellsEx(fieldsChangesByRevisions, revisionsAutors) {
  var tbl = document.createElement('table');

  for (const [field, field_values] of Object.entries(fieldsChangesByRevisions)) {
    var tr = tbl.insertRow();
    tr.className = 'rendered';

    var field_cell = tr.insertCell();
    field_cell.className = 'key';
    var field_checked = localStorage.getItem(field);
    field_checked = !(field_checked && field_checked == 'false');
    var val_cb = addCheckbox(field_cell, field, field, field_checked);
   
    var value_div = document.createElement('div');
    value_div.hidden = !field_checked;
    field_cell.appendChild(value_div);
    
    var diff_checked = localStorage.getItem(`${field}_diff`);
    diff_checked = (diff_checked && diff_checked == 'true');
    addCheckbox(value_div, `${field}_diff`, 'Show as diff', diff_checked);

    var value_cell = tr.insertCell();
    var value_div = document.createElement('div');
    value_div.className = 'values';
    value_cell.appendChild(value_div);
    var value_tbl = document.createElement('table');
    value_div.appendChild(value_tbl);


    for (var cur_field_val_ind = 0, next_field_val_ind = 1; cur_field_val_ind < field_values.length; cur_field_val_ind++, next_field_val_ind ++) {
      var v = field_values[cur_field_val_ind];
      
      var field_changed_date = revisionsAutors[v.rev].dt;
      var field_changed_author = revisionsAutors[v.rev].author;

      var next_value_time = null;
      if (cur_field_val_ind + 1 < field_values.length) {
        var next_field_value_rev = field_values[cur_field_val_ind + 1].rev;
        next_value_time = revisionsAutors[next_field_value_rev].dt
      }
      var elapsed_time = timeDiff(field_changed_date, next_value_time);

      var value_tr = value_tbl.insertRow();
      value_tr.className = 'values';
            
      var val_cell = value_tr.insertCell();
      val_cell.className = 'values';
      var content = document.createElement('label');

      var val_cell_display_content = v.val;
      if (val_cell_display_content == null) {
        val_cell.className = 'deleted_values';
        if (cur_field_val_ind > 0) {
          val_cell_display_content = field_values[cur_field_val_ind-1].val;
        }
        else {
          val_cell_display_content = ''
        }
      }
      else if (diff_checked && (cur_field_val_ind > 0)) {
        val_cell_display_content = getDiff(field_values[cur_field_val_ind-1].val, val_cell_display_content);
      }
      content.innerHTML = formatDateTime(val_cell_display_content);
      val_cell.appendChild(content);
      
      var author_cell = value_tr.insertCell();
      author_cell.className = 'author';
      author_cell.appendChild(document.createTextNode(field_changed_author));

      var date_cell = value_tr.insertCell();
      date_cell.className = 'date';
      date_cell.appendChild(document.createTextNode(formatDateTime(field_changed_date)));

      var elapsed_cell = value_tr.insertCell();
      elapsed_cell.className = 'time';
      elapsed_cell.appendChild(document.createTextNode(elapsed_time));

      var rev_cell = value_tr.insertCell();
      rev_cell.className = 'revision';
      rev_cell.appendChild(document.createTextNode(v.rev));
    }
  }
  document.getElementById('fields_table').appendChild(tbl);
}

function renderCells(cells, fieldsChangesByRevisions, revisionsAutors) {
  var tbody = document.getElementById('tbody');

  for (const [field, field_values] of Object.entries(fieldsChangesByRevisions)) {
    
    var tr = "<tr class = 'rendered'>";

    var diff_id = `${field}_diff`;
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

    var prev = '';
    for (var cur_field_val_ind = 0, next_field_val_ind = 1; cur_field_val_ind < field_values.length; cur_field_val_ind++, next_field_val_ind ++) {
    //for (const v of field_values) {
      var v = field_values[cur_field_val_ind];
      
      var field_changed_date = revisionsAutors[v.rev].dt;
      var field_changed_author = revisionsAutors[v.rev].author;

      var next_value_time = null;
      if (cur_field_val_ind + 1 < field_values.length) {
        var next_field_value_rev = field_values[cur_field_val_ind + 1].rev;
        next_value_time = revisionsAutors[next_field_value_rev].dt
      }
      var elapsed_time = timeDiff(field_changed_date, next_value_time);


      var author = field_changed_author + '; ' + formatDateTime(field_changed_date) + '; ' + elapsed_time + '; [rev:' + v.rev + ']';

      var val = v.val;
      if (diff_on) {
        var val = getDiff(prev, v.val);
      }

      s += '<tr = class="values"><td>' + val + '</td><td class = "rev">' + author + '</td></tr>';
      prev = v.val;
    }

    s += '</table>';

    var checked = 'checked';
    var hidden = '';
    var val = localStorage.getItem(field);
    if (val && val == 'false') {
      checked = '';
      hidden = 'hidden';
    }

    tr += `<td class="key"><input type="checkbox" id="${field}" ${checked}>${field}<div ${hidden}><p>${diffcheckbox}</div></td><td ${hidden}>${s}</td></tr>`;

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
//  renderCells(datacells, imageinfo, revisionsAutors);
  renderCellsEx(imageinfo, revisionsAutors);

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
  revisionsAutors[0] = 'skip zero index to align with tfs revisions, which started from 1';

  var obj = json_onject;

  var all_possible_fileds_names = new Set();
  for (var i = 0; i < obj.count; i++) { //iterate through revisions
    var fields = obj.value[i].fields;
    var revision = obj.value[i].rev;
    revisionsAutors[i+1] = { author: fields['System.ChangedBy']['displayName'], dt: fields['System.ChangedDate'] };

    //for each revision azure returns not all fields
    //in case when field became undefinded, azure do not returns it in fields revision list
    //so we should iterate through all fields wich we met in the previous revisions
    for (const [name, value] of Object.entries(fields)) {
      all_possible_fileds_names.add(name);
    }

    for (var name of all_possible_fileds_names.values())
    {
      var value = fields[name];
      var string_value = value;
      if(value) {
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
          this.nextElementSibling.nextElementSibling.hidden = !this.checked
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

function render_pivot() {
  var placeholder = document.getElementById('pivot');
}

document.addEventListener("DOMContentLoaded", function () {
  var wi_id = window.location.hash.substring(1);
  var tfs_url = window.location.search.substring(1);
  if (tfs_url) {
    get_wi_title(tfs_url, wi_id);
    get_history(tfs_url, wi_id, 0, null, null);
  }
});

