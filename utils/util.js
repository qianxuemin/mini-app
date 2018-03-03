// 时间的处理
function getTime(time, realTime) {
    // 列表页时间显示规则：
    // 1小时内：mm分种前
    // 大于1小时，小于24小时内：HH小时前
    // 大于24小时：MM - dd HH：mm
    var year, month, day, hour, minute, second, formatTime, sec, min, hou;
    year = time.substr(0, 4);
    month = time.substr(5, 2);
    day = time.substr(8, 2);
    hour = time.substr(11, 2);
    minute = time.substr(14, 2);
    second = time.substr(17, 2);
    var d1 = new Date(time);
    var d2 = new Date(realTime);
    sec = parseInt(d2 - d1) / 1000;//两个时间相差的秒数
    min = parseInt(d2 - d1) / 1000 / 60;//两个时间相差的分钟数
    hou = parseInt(d2 - d1) / 1000 / 60 / 60;//两个时间相差的小时数
    if (hou < 1) {
        formatTime = parseInt(min) + "分钟前"
    } else if (hou >= 1 && hou < 24) {
        formatTime = parseInt(hou) + "小时前"
    } else {
        formatTime = month + "-" + day + " " + hour + ":" + minute;
    }
    return formatTime;
}

function getDate(time) {
    // 时间日期格式化   如：2017-03-15  09:25
    var year, month, day, hour, minute, second, formatTime, min, hou;
    year = time.substr(0, 4);
    month = time.substr(5, 2);
    day = time.substr(8, 2);
    hour = time.substr(11, 2);
    minute = time.substr(14, 2);
    second = time.substr(17, 2);
    formatTime = year + "-" + month + "-" + day + " " + hour + ":" + minute;
    return formatTime;
}

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatDate(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('-')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function handelDuration(duration, info) {
    if (!duration || duration == '') {
        if (info == 'audio')
            return '0:00'
        else
            return '00:00'
    }
    var t0 = duration + '';
    if (t0.indexOf(':') == -1) {
        var t1 = parseInt(t0 / 60);
        var t2 = parseInt(t0 % 60);
        if (info != 'audio') {
            if (t1 < 10) {
                t1 = "0" + t1;
            }
        }
        if (t2 < 10) {
            t2 = "0" + t2;
        }
        var time = t1 + ":" + t2;
        duration = time;
    }
    return duration;
}

// 自定义endWith，str测试字符串，s目标字符串
function endWith(str, s) {
    if (s == null || s == "" || str.length == 0 || s.length > str.length)
        return false;
    if (str.substring(str.length - s.length) == s)
        return true;
    else
        return false;
    return true;
}

// 自定义startWith，str测试字符串，s目标字符串
function startWith(str, s) {
    if (s == null || s == "" || str.length == 0 || s.length > str.length)
        return false;
    if (str.substr(0, s.length) == s)
        return true;
    else
        return false;
    return true;
}

module.exports = {
    formatTime: formatTime,
    formatDate: formatDate,
    getTime: getTime,
    getDate: getDate,
    startWith: startWith,
    endWith: endWith,
    handelDuration: handelDuration,
}
