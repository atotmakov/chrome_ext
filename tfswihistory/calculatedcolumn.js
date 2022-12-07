function get_wis_table() {
    let table = document.getElementsByClassName('query-result-grid work-item-list grid');
    if (table.length > 0) {
        let header = Array.from(document.getElementsByClassName('grid-header-canvas').item(0).childNodes, (val) => val.ariaLabel);
        let items = Array.from(document.getElementsByClassName('grid-row grid-row-normal'), (val) => [val.id, val.childNodes[0].outerText,]);
        return (header, items);
    }
    else {
        console.log('nothing');
    }
}

function change_latest_column(items) {
    console.log(items);
    for (var i in items) {
        let wi_id = items[i][1];
        let row = document.getElementById(items[i][0])
        let placeholder = row.childNodes[row.childElementCount - 1];
        placeholder.innerText = 'waiting for value...';
        get_wi_history_new(get_tfs_url(), wi_id, (val) => { placeholder.innerText = concatenate_history(val, 'System.AssignedTo') });
    }
}

function concatenate_history(fields_history, fieldname) {
    let result = '';
    for (var v in fields_history[fieldname]) { 
        result += fields_history[fieldname][v].val + ' => '; 
    }
    return result;
}

window.document.onkeydown = (event) => {
    if (event.key == 'k') {
        let header, items = get_wis_table()
        change_latest_column(items);
    }
};

function get_tfs_url() {
    let url = window.location.href;
    let pn = url.indexOf('/_');
    let f = url.substring(0, pn);
    return f;
}