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
        dm = decimals + 1 || 3,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
                user.total_day = formatBytes(user.day.recv + user.day.sent, -1);
                user.total_week = formatBytes(user.last7d.recv + user.last7d.sent, -1);
                user.total_month = formatBytes(user.month.recv + user.month.sent, -1);
                user.connected_fmt = '-';

                if (user.date_connected) {
                    var d = new Date(user.date_connected * 1000);
                    user.connected_fmt = d.toISOString().slice(0, 10);
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

