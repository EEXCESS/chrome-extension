require(['../js/common'], function() {
    require(['jquery', 'jquery-ui'], function($) {
        $('#content').accordion({collapsible: true, active: false, heightStyle: "content"});
        window.top.postMessage({event: 'eexcess.currentResults'}, '*');
        window.onmessage = function(msg) {
            if (msg.data.event && msg.data.event === 'eexcess.newResults') {
                console.log(msg.data.data);
                $('#content').empty();
                var result = msg.data.data.result;
                var providers = {};
                for (var i = 0; i < result.length; i++) {
                    var provider = result[i].documentBadge.provider;
                    if (typeof providers[provider] !== 'undefined') {
                        providers[provider].results.push({title:result[i].title,uri:result[i].documentBadge.uri});
                    } else {
                        providers[provider] = {
                            query: result[i].generatingQuery,
                            results: [{title:result[i].title,uri:result[i].documentBadge.uri}]
                        };
                    }
                }
                for (var key in providers) {
                    if (providers.hasOwnProperty(key)) {
                        $('#content').append('<h3 style="cursor:pointer;border-bottom:1px solid silver"><span style="color:#888">' + key + ' [' + providers[key].results.length + ']</span><br> ' + providers[key].query + '</h3>');
                        var resDiv = $('<div></div>');
                        var resList = $('<ul></ul>');
                        for (var i = 0; i < providers[key].results.length; i++) {
                            resList.append('<li><a href="'+providers[key].results[i].uri+'" target="_blank">' + providers[key].results[i].title + '</a></li>');
                        }
                        resDiv.append(resList);
                        $('#content').append(resDiv);
                    }
                }
                $('#content').accordion("refresh");
            }
        };
    });
});