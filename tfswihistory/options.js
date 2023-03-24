function save_options() {
    var page = chrome.extension.getBackgroundPage();

    var change_time_setting = document.getElementById('change_time_in_comment').checked
    chrome.storage.local.set({ 'change_time_setting': change_time_setting });

    var option_calculated_column = document.getElementById('option_calculated_column').checked
    chrome.storage.local.set({ 'option_calculated_column': option_calculated_column });
    
    //console.log('settings saved');
}

function restore_options() {
    chrome.storage.local.get(['change_time_setting'], function (result) {
        var change_time_setting = result.change_time_setting == false ? false : true; //default true
        document.getElementById('change_time_in_comment').checked = change_time_setting;
    });

    chrome.storage.local.get(['option_calculated_column'], function (result) {
        var option_calculated_column = result.option_calculated_column == true ? true : false; //default false
        document.getElementById('option_calculated_column').checked = option_calculated_column;
    });

    //console.log('settings restored');
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('change_time_in_comment').addEventListener('click', save_options);
document.getElementById('option_calculated_column').addEventListener('click', save_options);
