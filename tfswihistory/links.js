document.addEventListener("DOMContentLoaded", function () {
    var wi_id = window.location.hash.substring(1);
    var tfs_url = window.location.search.substring(1);
    if (tfs_url) {
        let deep = 0;
        let placeholder = document.getElementById('links_table');
        let wi_link = get_wi_link(tfs_url, wi_id);
        get_wi(wi_link, 0, (id, fields, frienly_names, links, url, wi_type, icon_url) => { render_wi(id, fields, links, url, wi_type, icon_url, true, deep, 'root', placeholder) });
    }
});

var already = new Map();

function update_header(count) {
    document.getElementById('count').innerText = count;
}

function render_wi(id, fields, links, url, wi_type, icon_url, goto_links, deep, link_type, parent_node) {
    goto_links = goto_links && !already.has(id);
    let parent = parent_node ? parent_node : document;

    let links_parent_div = document.createElement('div');
    links_parent_div.style.paddingLeft = `${4}0px`;
    parent.appendChild(links_parent_div);

    let wi_div = document.createElement('div');
    wi_div.style.paddingLeft = `${4}0px`;
    parent.appendChild(wi_div);

    var link_label = document.createTextNode(link_type);
    wi_div.appendChild(link_label);

    let expand = document.createElement('a');
    expand.innerText = goto_links ? '[-]' : '[+]';
    expand.href = '#';
    expand.style.fontWeight = 'bold';
    wi_div.appendChild(expand);
        
    var wi_icon = document.createElement('img');
    wi_icon.src = icon_url;
    wi_icon.className = "wi_type_icon";
    wi_div.appendChild(wi_icon);

    title = fields['System.Title'];
    var urltext = `${wi_type} ${id} : ${title}`;
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.innerText = urltext;
    wi_div.appendChild(anchor);

    let fields_to_display = `[State] = ${fields['System.State']}`;
    let fields_lable = document.createElement('label');
    fields_lable.innerText = fields_to_display;
    wi_div.appendChild(fields_lable);

    let links_div = document.createElement('div');
    links_div.style.paddingLeft = `${4}0px`;
    parent.appendChild(links_div);

    expand.onclick = function() {
        expand.style.fontWeight = 'normal'; 
        if (expand.innerText == '[+]') {
            links_div.hidden == true ? links_div.hidden = false : render_links(links, deep, links_div);
        } else {
            links_div.hidden = true;
        }

        expand.innerText = expand.innerText == '[-]' ? '[+]' : '[-]';
        return false; 
    };

    if (goto_links) {    
        render_links(links, deep, links_div, links_parent_div);
    }
    already.set(id, 0);
    update_header(already.size);
};

function render_links(links, deep, parent_node, node_if_parent) {
    deep += 1;
    for (let link of links) {
        if (link.rel == 'ArtifactLink') //'System.LinkTypes.Related'
            continue;
        let url = link['url'];
        let link_type = link["attributes"].name;

        let node = parent_node;
        if (link_type == 'Parent') {
            node = node_if_parent;
        }

        get_wi(url, 0, (id, fields, friendly_names, links, url, wi_type, icon_url) => { render_wi(id, fields, links, url, wi_type, icon_url, deep < 1, deep, link_type, node) });
    }
}

