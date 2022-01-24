document.addEventListener("DOMContentLoaded", function () {
    var wi_id = window.location.hash.substring(1);
    var tfs_url = window.location.search.substring(1);
    if (tfs_url) {
        var deep = 0;
        get_wi(tfs_url, wi_id, (id, fields, links, url, wi_type, icon_url) => { render_root_wi(id, fields, links, url, wi_type, icon_url, true, deep, 'root', 'links_table') });
    }
});

var already = new Map();

function render_root_wi(id, fields, links, url, wi_type, icon_url, goto_links, deep, link_type, parent_id) {
    if (already.has(id)) { 
        if (already.get(id) == true) {
            already.set(id, false);
            id = 0;
        }
        else {
            return;
        }
    }
    else {
        already.set(id, true);    
    }

    var ph = document.getElementById(parent_id);

    var placeholder = document.createElement('div');
    placeholder.style.paddingLeft = `${deep}0px`;
    placeholder.id = id;
    ph.appendChild(placeholder);

    var link_label = document.createTextNode(link_type);
    placeholder.appendChild(link_label);

    var wi_icon = document.createElement('img');
    wi_icon.src = icon_url;
    wi_icon.className = "wi_type_icon";
    placeholder.appendChild(wi_icon);
    title = fields['System.Title'];
    var urltext = `${wi_type} ${id} : ${title}`;
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.innerText = urltext;
    placeholder.appendChild(anchor);

    if (goto_links) {
        render_links(placeholder, links, deep, id);
    }
};

function render_links(placeholder, links, deep, parent_id) {
    deep += 10;
    for (var link of links) {
        var url = link['url'];
        var link_type = link["attributes"].name;

        get_wi(url, 0, (id, fields, links, url, wi_type, icon_url) => { render_root_wi(id, fields, links, url, wi_type, icon_url, deep < 50, deep, link_type, parent_id) });
    }
}

