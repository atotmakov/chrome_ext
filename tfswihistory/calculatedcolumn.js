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
        row.addEventListener('change', (event) => { 
            console.log(event)
        });
        row.oncopy = (event) => { 
            console.log('copy', event)
        }
        row.onbeforecopy = (event) => { 
            console.log('beforecopy', event)
        }
        row.onselect = (event) => { 
            console.log('select', event)
        }
        placeholder.onclick = (event) => { 
            console.log('click', event)
        } 


        get_wi_history_new(get_tfs_url(), wi_id, (val) => { placeholder.innerText = concatenate_history(val, 'KL.TRDate') });
    }
}

function concatenate_history(fields_history, fieldname) {
    let result = '';
    for (var v in fields_history[fieldname]) { 
        result += formatDateTime(fields_history[fieldname][v].val) + ' => '; 
    }
    return result;
}

window.document.onkeydown = (event) => {
    const targetNode = document.getElementById('vss_4');

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };
    
    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        console.log(`The ${mutationList.length} mutation occurs.`);
        for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
            if (mutation.addedNodes.length >0 ) {
                console.log('A child node has been added.');
                mutation.addedNodes.forEach( (n) => {
                    if (n.childNodes.length > 0) {
                    let wi_id = n.childNodes[0].innerText;
                    n.childNodes[7].innerText = 'loading...';
                    get_wi_history_new(get_tfs_url(), wi_id, (val) => { n.childNodes[7].innerText = concatenate_history(val, 'KL.TRDate') });
                    }
                });
            }
            if (mutation.removedNodes.length >0 ) {
                console.log('A child node has been removed.');
            }
        } else if (mutation.type === 'attributes') {
          console.log(`The ${mutation.attributeName} attribute was modified.`);
        } else {
            console.log(`The ${mutation} was modified.`);
        }
      }
    };
    
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    if (event.key == 'h') {
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