function save_options() {
    var page = chrome.extension.getBackgroundPage();
    var change_time_setting = document.getElementById('change_time_in_comment').checked
    page.localStorage.setItem('change_time_setting', change_time_setting)
}

function restore_options() {
    var page = chrome.extension.getBackgroundPage();
    var change_time_setting = page.localStorage.getItem('change_time_setting') == 'true' ? true : false;
    document.getElementById('change_time_in_comment').checked = change_time_setting;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('change_time_in_comment').addEventListener('click', save_options);