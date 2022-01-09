function formatDateTime(str) {
    //str
    //2019-10-17T08:56:08.573Z
    //2020-11-29T21:00:00Z - not working
    var res = str;
    if (str[4] == '-' && str[7] == '-' && str[10] == 'T' && str[13] == ':' && str[16] == ':' && (str[19] == '.' || str[19] == 'Z')) {
        var dt = new Date(str);
        const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit' };
        res = dt.toLocaleDateString(undefined, options);
    }
    return res;
}

function formatTimePeriod(str) {
    var sec_num = parseInt(str, 10) / (1000 * 60);
    var days = Math.floor(sec_num / (24 * 60));
    var hours = Math.floor((sec_num - days * 24 * 60) / 60);
    var minutes = Math.floor(sec_num - days * 24 * 60 - hours * 60);

    var res = ""
    if (days > 0) { res = `${days} d`; }
    if (hours > 0) { res = `${res} ${hours} h`; }
    if (minutes > 0 && days < 1) { res = `${res} ${minutes} m`; }
    if (days == 0 && hours == 0 && minutes == 0) { res = "0 s"; }
    return res;
}

function timeDiff(begin, end) {
    if (end == null) {
        end = Date.now();
    }

    var b = new Date(begin);
    var e = new Date(end);

    return formatTimePeriod(e - b);
}

export { formatDateTime, timeDiff };