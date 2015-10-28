require(['./common'], function(common) {
    require(['c4/APIconnector', 'up/profileManager', 'util'], function(APIconnector, profileManager, util) {
//        APIconnector.init({base_url:'http://eexcess-dev.joanneum.at/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/'});
//        APIconnector.init({base_url:'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/'});
//        APIconnector.init({base_url:'http://eexcess-demo.know-center.tugraz.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/'});

        var msgAllTabs = function(msg) {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0, len = tabs.length; i < len; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, msg);
                }
            });
        };
        
        var selectedSources = [];

        chrome.storage.sync.get(['numResults','selectedSources','uuid'], function(result) {
            if(result.selectedSources) {
                result.selectedSources.forEach(function(val){
                    selectedSources.push({systemId:val.systemId});
                });
            }
            var uuid;
            if(result.uuid) {
                uuid = result.uuid;
            } else {
                uuid = util.randomUUID();
                chrome.storage.sync.set({uuid:uuid});
            }
            
            var settings = {origin: {
                    userID: uuid,
                    clientType: "chrome-extension",
                    clientVersion: chrome.runtime.getManifest().version
                }};
            if (result.numResults) {
                settings.numResults = result.numResults;
            }
            APIconnector.init(settings);

            chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
                if (typeof msg.method !== 'undefined') {
                    switch (msg.method) {
                        case 'triggerQuery':
                            var profile = msg.data;
                            // selected sources
                            if(selectedSources && selectedSources.length > 0 && !profile.partnerList) {
                                profile.partnerList = selectedSources;
                            }
                            // Adaptation of the profile according to the policies
                            profile = profileManager.adaptProfile(profile);
                            obfuscationLevel = profileManager.getObfuscationLevel();
                            APIconnector.queryPeas(profile, obfuscationLevel, sendResponse); // if obfuscationLevel == 0, then it's similar to APIconnector.query(...)
                            return true;
                            break;
                        case 'optionsUpdate':
                            chrome.storage.sync.get(['numResults','selectedSources'], function(result) {
                               if(result.numResults) {
                                   APIconnector.setNumResults(result.numResults);
                               } 
                               if(result.selectedSources) {
                                   selectedSources = [];
                                   result.selectedSources.forEach(function(val){
                                       selectedSources.push({systemId:val.systemId});
                                   });
                               }
                            });
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
});

