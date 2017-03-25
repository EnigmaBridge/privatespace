/**
 * Created by dusanklinec on 16.03.17.
 */

"use strict";
var statsSource;
var statsTemplate;
var statsWrapper;
var statsPlaceholder;

/**
 * Simple JSON load wrapper
 * @param onLoaded
 * @param onFail
 */
function loadStatsData(onLoaded, onFail){
    $.getJSON("/stats.json")
        .done(function( json ) {
            onLoaded(json);
        })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
            onFail(jqxhr, textStatus, error);
        });
}

function formatBytes(bytes, decimals) {
    if(bytes == 0) return '0 Bytes';
    var k = 1000,
        dm = decimals + 1 || 0,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatBytesWrap(bytes){
    if (bytes > 1000*1000*1000){
        return formatBytes(bytes, 2);
    }

    return formatBytes(bytes, -1)
}

function formatDate(d){
    var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = d.getDate() + " " + month[d.getMonth()] + ", " + d.getFullYear();
    var time = d.toLocaleTimeString().toLowerCase();
    return date + " " + time;
}

/**
 * Load stats data, create templte.
 */
function loadStats(){
    loadStatsData(
        function(json){
            // Sort by name
            var vals = $.map(json.users, function(v) { return v; });
            vals.sort(function(a, b){
                if(a.cname == b.cname) return 0;
                return a.cname < b.cname ? -1 : 1
            });

            for(var i=0; i<vals.length; i++) {
                var user = vals[i];
                user.total_day = formatBytesWrap(user.day.recv + user.day.sent);
                user.total_week = formatBytesWrap(user.last7d.recv + user.last7d.sent);
                user.total_month = formatBytesWrap(user.month.recv + user.month.sent);
                user.connected_fmt = '-';
                user.status_style = 'statusOffline';

                if (user.date_connected && user.connected) {
                    var d = new Date(user.date_connected * 1000);
                    user.connected_fmt = formatDate(d);
                    user.status_style = 'statusOnline';
                }
            }

            var html = statsTemplate({users:vals});
            statsPlaceholder.html(html);
            statsWrapper.show();
            setTimeout(loadStats, 10000);
        },
        function(jqxhr, textStatus, error){
            statsWrapper.hide();
            setTimeout(loadStats, 30000);
        }
    );
}

/**
 * Initial stats load
 */
function loadStatsInit(){
    statsSource = $("#connectedTpl").html();
    statsTemplate = Handlebars.compile(statsSource);
    statsWrapper = $("#userStats");
    statsPlaceholder = $("#statsPlaceholder");
    loadStats();
}

/**
 * On document load -> load stats.
 */
$( document ).ready(function() {
    loadStatsInit();
});

