require(['./common'], function (common) {
    require(['c4/APIconnector', 'up/profileManager'], function (APIconnector, profileManager) {
//        APIconnector.init({base_url:'http://eexcess-dev.joanneum.at/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/'});
//        APIconnector.init({base_url:'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/'});
//        APIconnector.init({base_url:'http://eexcess-demo.know-center.tugraz.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/'});

        APIconnector.init({origin: {
                userID: "1", // XXX Needs to be fixed
                clientType: "chrome-extension",
                clientVersion:"0.53"
            }});
        var msgAllTabs = function (msg) {
            chrome.tabs.query({}, function (tabs) {
                for (var i = 0, len = tabs.length; i < len; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, msg);
                }
            });
        };


        chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        	if (typeof msg.method !== 'undefined') {
                switch (msg.method) {
                    case 'triggerQuery':
                        var profile = msg.data;
                        // Adaptation of the profile according to the policies
                        profile = profileManager.adaptProfile(profile);
                        obfuscationLevel = profileManager.getObfuscationLevel();
                        APIconnector.query(profile, sendResponse); // XXX should be next line
                        // APIconnector.queryPeas(profile, obfuscationLevel, sendResponse); // if obfuscationLevel == 0, then it's similar to APIconnector.query(...)
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

