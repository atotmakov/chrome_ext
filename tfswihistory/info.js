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

function renderFieldsPivotTable(field_selector_input, fieldsChangesByRevisions, revisionsAutors) {
  var s = new Map();
  if (field_selector_input.value) {
    var field_values = fieldsChangesByRevisions[field_selector_input.value];
    for (var cur_field_val_ind = 0; cur_field_val_ind < field_values.length; cur_field_val_ind++) {
      var v = field_values[cur_field_val_ind];
      var elapsed_time = getTimeDiff(cur_field_val_ind, field_values, revisionsAutors);
      if (s.has(v.val)) {
        s.set(v.val, s.get(v.val) + elapsed_time);
      }
      else {
        s.set(v.val, elapsed_time);
      }
    }
  }

  var placeholder = document.getElementById('pivot');
  while (placeholder.firstChild) {
    placeholder.firstChild.remove();
  }

  var title = document.createElement('div');
  placeholder.appendChild(title);
  title.className = 'title';
  title.appendChild(document.createTextNode("Time statistics by field's value: "));
  title.appendChild(field_selector_input);

  var tbl = document.createElement('table');
  tbl.className = 'pivot';
  var total = 0;
  s.forEach((value, key) => { total += value; });
  s.forEach((value, key) => {
    var tr = tbl.insertRow();

    var field_cell = tr.insertCell();
    field_cell.className = 'pivot';
    field_cell.appendChild(document.createTextNode(key));

    var value_cell = tr.insertCell();
    value_cell.className = 'pivot';
    value_cell.appendChild(document.createTextNode(formatTimePeriod(value)));

    var percent_cell = tr.insertCell();
    percent_cell.className = 'pivot';
    percent_cell.appendChild(document.createTextNode(`${Math.floor((value / total * 1000)) / 10} %`));
  });
  placeholder.appendChild(tbl);

}

function addInputList(id, values, selected_value) {
  let field_selector_input = document.createElement('input');
  field_selector_input.id = id;
  field_selector_input.type = 'text';
  field_selector_input.setAttribute('list', 'field_selector_' + id);

  let selected = selected_value;
  let field_selector = document.createElement('datalist');
  field_selector.id = 'field_selector_' + id;
  for (let field in values) {
    let option = document.createElement('option');
    option.value = field;
    field_selector.appendChild(option);
    if (selected == field) {
      field_selector_input.value = field;
    }
  }
  field_selector_input.appendChild(field_selector);
  return field_selector_input;
}

function renderTimeStatisticByField(fieldsChangesByRevisions, revisionsAutors) {
  let id = 'field_selector_input';
  let selected = localStorage.getItem(id);
  let field_selector_input = addInputList(id, fieldsChangesByRevisions, selected);

  renderFieldsPivotTable(field_selector_input, fieldsChangesByRevisions, revisionsAutors);

  field_selector_input.addEventListener('change', function () {
    localStorage.setItem(this.id, this.value);
    renderFieldsPivotTable(field_selector_input, fieldsChangesByRevisions, revisionsAutors);
  });
}

function addCheckbox(parent, id, text, checked) {
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

function getTimeDiff(index, array_values, array_dates) {
  var cur_field_val_ind = index;
  var field_values = array_values;
  var revisionsAutors = array_dates;
  var field_changed_date = revisionsAutors[field_values[cur_field_val_ind].rev].dt;

  var next_value_time = null;
  if (cur_field_val_ind + 1 < field_values.length) {
    var next_field_value_rev = field_values[cur_field_val_ind + 1].rev;
    next_value_time = revisionsAutors[next_field_value_rev].dt;
  }
  return timeDiff(field_changed_date, next_value_time);
}

function renderCellsEx(fieldsChangesByRevisions, revisionsAutors) {
  var tbl = document.createElement('table');
  tbl.id = 'values_table';

  let header_tr = tbl.insertRow();
  var author_cell = header_tr.insertCell();
  author_cell.appendChild(document.createTextNode('Field'));
  var author_cell = header_tr.insertCell();
  author_cell.appendChild(document.createTextNode('Value'));
  var author_cell = header_tr.insertCell();
  author_cell.appendChild(document.createTextNode('Author'));
  /*let author_input = addInputList(12134, null, 0);
  author_cell.appendChild(author_input);
  author_input.addEventListener('input', function () {
    //hide
    var table = document.getElementById('values_table');
    for (var i = 1, row; row = table.rows[i]; i++) {
      let hide = row.cells[2].textContent.toLowerCase().includes(this.value.toLowerCase());

      let start = 6 - row.cells.length;
      for (var j = start, col; col = row.cells[j]; j++) {
        col.hidden = !hide;
      }
    }
  });*/
  var author_cell = header_tr.insertCell();
  author_cell.appendChild(document.createTextNode('Date'));
  var author_cell = header_tr.insertCell();
  author_cell.appendChild(document.createTextNode('Time'));
  var author_cell = header_tr.insertCell();
  author_cell.appendChild(document.createTextNode('Rev'));

  for (const [field, field_values] of Object.entries(fieldsChangesByRevisions)) {
    var diff_checked = localStorage.getItem(`${field}_diff`);
    diff_checked = (diff_checked && diff_checked == 'true');
    var value_tbl = tbl;

    let field_checked = localStorage.getItem(field);
    field_checked = !(field_checked && field_checked == 'false');

    for (var cur_field_val_ind = 0; cur_field_val_ind < field_values.length; cur_field_val_ind++) {
      var v = field_values[cur_field_val_ind];

      var field_changed_date = revisionsAutors[v.rev].dt;
      var field_changed_author = revisionsAutors[v.rev].author;

      var elapsed_time = formatTimePeriod(getTimeDiff(cur_field_val_ind, field_values, revisionsAutors));

      var value_tr = value_tbl.insertRow();
      value_tr.className = 'values';


      if (cur_field_val_ind == 0) {
        var field_cell = value_tr.insertCell();
        field_cell.className = 'key';
        field_cell.rowSpan = field_values.length;

        addCheckbox(field_cell, field, field, field_checked);
        var value_div = document.createElement('div');
        value_div.hidden = !field_checked;
        field_cell.appendChild(value_div);
        addCheckbox(value_div, `${field}_diff`, 'Show as diff', diff_checked);
      }

      var val_cell = value_tr.insertCell();
      val_cell.className = 'values';
      val_cell.hidden = !field_checked;
      var content = document.createElement('label');

      var val_cell_display_content = v.val;
      if (val_cell_display_content == null) {
        val_cell.className = 'deleted_values';
        if (cur_field_val_ind > 0) {
          val_cell_display_content = field_values[cur_field_val_ind - 1].val;
        }
        else {
          val_cell_display_content = ''
        }
      }
      else if (diff_checked && (cur_field_val_ind > 0)) {
        val_cell_display_content = getDiff(field_values[cur_field_val_ind - 1].val, val_cell_display_content);
      }
      content.innerHTML = formatDateTime(val_cell_display_content);
      val_cell.appendChild(content);

      var author_cell = value_tr.insertCell();
      author_cell.className = 'author';
      author_cell.hidden = !field_checked;
      author_cell.appendChild(document.createTextNode(field_changed_author));

      var date_cell = value_tr.insertCell();
      date_cell.className = 'date';
      date_cell.hidden = !field_checked;
      date_cell.appendChild(document.createTextNode(formatDateTime(field_changed_date)));

      var elapsed_cell = value_tr.insertCell();
      elapsed_cell.className = 'time';
      elapsed_cell.hidden = !field_checked;
      elapsed_cell.appendChild(document.createTextNode(elapsed_time));

      var rev_cell = value_tr.insertCell();
      rev_cell.className = 'revision';
      rev_cell.hidden = !field_checked;
      rev_cell.appendChild(document.createTextNode(v.rev));
    }
  }

  var title = document.createElement('div');
  title.className = 'title';
  title.appendChild(document.createTextNode("History by fields"));
  let header = document.createElement('div');

  document.getElementById('fields_table').appendChild(title);
  document.getElementById('fields_table').appendChild(tbl);
}

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

  var datacells = divinfo.querySelectorAll('td');
  renderCellsEx(imageinfo, revisionsAutors);
  renderTimeStatisticByField(imageinfo, revisionsAutors);

};

function renderWITitle(id, fields, links, url, wi_type, icon_url) {
  var divurl = document.querySelector('#url');

  var wi_icon = document.createElement('img');
  wi_icon.src = icon_url;
  wi_icon.className = "header-img";
  divurl.appendChild(wi_icon);
  title = fields['System.Title'];
  var urltext = `${wi_type} ${id} : ${title}`;
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
    revisionsAutors.splice(0, 0, 'skip zero index to align with tfs revisions, which started from 1');
    renderWIInfo(fieldsset, revisionsAutors);

    for (let checkbox of document.querySelectorAll('input[type=checkbox]')) {
      checkbox.addEventListener('change', function () {
        localStorage.setItem(this.id, this.checked);
        /*if (this.parentElement.nextElementSibling) {
          //hide value cells
          this.parentElement.nextElementSibling.hidden = !this.checked;
          //hide "show diff checkbox"
          this.nextElementSibling.nextElementSibling.hidden = !this.checked 
        } else {*/
        location.reload();
        //}
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
    let wi_link = get_wi_link(tfs_url, wi_id);
    get_wi(wi_link, 0, (wi_id, wi_fields, fields_friendly_names, wi_links, html_link, wi_type, icon_url) => { renderWITitle(wi_id, wi_fields, wi_links, html_link, wi_type, icon_url); });
    get_history(tfs_url, wi_id, 0, null, null);
  }
});

