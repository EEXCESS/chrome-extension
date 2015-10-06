require(['./common'], function(common) {
    require(['c4/APIconnector'], function(APIconnector) {
//        APIconnector.init({base_url:'http://eexcess-dev.joanneum.at/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/'});
//        APIconnector.init({base_url:'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/'});
        APIconnector.init({base_url:'http://eexcess-demo.know-center.tugraz.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/'});
        var msgAllTabs = function(msg) {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0, len = tabs.length; i < len; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, msg);
                }
            });
        };


        chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
            if (typeof msg.method !== 'undefined') {
                switch (msg.method) {
                    case 'triggerQuery':
                        var profile = msg.data;
                        // TODO: adapt origin
//                        profile.origin = {
//                            userID:"1",
//                            clientType:"chrome-extension",
//                            clientVersion:"42",
//                            module:"hilde"
//                        };
                        APIconnector.query(profile, sendResponse);
                        return true;
                        break;
                    default:
                        console.log('unknown method: ' + msg.method);
                        break;
                }
            } else {
                console.log('method not specified');
            }
        });
    });
});

