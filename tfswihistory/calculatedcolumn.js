function get_wis_table() {
    let table = document.getElementsByClassName('query-result-grid work-item-list grid');
    if (table.length > 0) {
        let header = Array.from(document.getElementsByClassName('grid-header-canvas').item(0).childNodes, (val) => val.ariaLabel);
        let items = Array.from(document.getElementsByClassName('grid-row grid-row-normal'), (val) => [val.id, val.childNodes[0].outerText,]);
        var id = table[0].id;
        return [header, items, id];
    }
    else {
        console.log('nothing');
    }
}

function change_latest_column(header, items, table_id) {
    field_name = header[header.length - 2]

    for (var i in items) {
        let wi_id = items[i][1];
        let row = document.getElementById(items[i][0])
        let placeholder = row.childNodes[row.childElementCount - 1];
        placeholder.innerText = 'waiting for value...';

        get_wi(get_wi_link(get_tfs_url(), wi_id), 0, (wi_id, wi_fields, fields_friendly_names, wi_links, html_link, wi_type, icon_url) => {
            let reference_name = fields_friendly_names.find(o => o.name === field_name).referenceName
            get_wi_history_new(get_tfs_url(), wi_id, (val) => { placeholder.innerText = concatenate_history(val, reference_name) });
        });
    }

    const targetNode = document.getElementById(table_id);
    const config = { childList: true, subtree: true };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((n) => {
                        if (n.childNodes.length > 0) {
                            let wi_id = n.childNodes[0].innerText;
                            let placeholder = n.childNodes[n.childElementCount - 1];
                            //n.childNodes[7].innerText = 'loading...';
                            //get_wi_history_new(get_tfs_url(), wi_id, (val) => { n.childNodes[7].innerText = concatenate_history(val, 'KL.TRDate') });
                            placeholder.innerText = 'waiting for value...';
                            get_wi(get_wi_link(get_tfs_url(), wi_id), 0, (wi_id, wi_fields, fields_friendly_names, wi_links, html_link, wi_type, icon_url) => {
                                let reference_name = fields_friendly_names.find(o => o.name === field_name).referenceName
                                get_wi_history_new(get_tfs_url(), wi_id, (val) => { placeholder.innerText = concatenate_history(val, reference_name) });
                            });
                        }
                    });
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
    }

    function concatenate_history(fields_history, fieldname) {
        let result = '';
        for (var v in fields_history[fieldname]) {
            result += formatDateTime(fields_history[fieldname][v].val) + ' => ';
        }
        return result;
    }

    window.document.onkeydown = (event) => {
        if (event.key == 'h') {
            let [header, items, table_id] = get_wis_table()
            change_latest_column(header, items, table_id);
        }
    };

    function get_tfs_url() {
        let url = window.location.href;
        let pn = url.indexOf('/_');
        let f = url.substring(0, pn);
        return f;
    }