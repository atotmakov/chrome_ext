document.addEventListener("DOMContentLoaded", function () {
    var wi_id = window.location.hash.substring(1);
    var tfs_url = window.location.search.substring(1);
    if (tfs_url) {
        get_wi(tfs_url, wi_id, (id, fields, links, url, wi_type, icon_url) => { render_root_wi(id, fields, links, url, wi_type, icon_url, true) });
    }
});

var already = new Map();

function render_root_wi(id, fields, links, url, wi_type, icon_url, goto_links) {
    if (already.has(id)) {
        return;
    }


    already.set(id);


    var placeholder = document.getElementById('links_table');

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
        render_links(placeholder, links);
    }
};

function render_links(placeholder, links) {
    for (var link of links) {
        //var name = link['attributes']['name'];
        var url = link['url'];

        get_wi(url, 0, (id, fields, links, url, wi_type, icon_url) => { render_root_wi(id, fields, links, url, wi_type, icon_url, true) });
    }
}

