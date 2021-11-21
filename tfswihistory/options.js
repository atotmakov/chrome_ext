function save_options() {
    var page = chrome.extension.getBackgroundPage();
    var change_time_setting = document.getElementById('change_time_in_comment').checked
    chrome.storage.local.set({'change_time_setting': change_time_setting});
}

function restore_options() {
    chrome.storage.local.get(['change_time_setting'], function(result) {
        var change_time_setting = result.change_time_setting == false ? false : true;
        document.getElementById('change_time_in_comment').checked = change_time_setting;
      });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('change_time_in_comment').addEventListener('click', save_options);
  