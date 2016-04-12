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
        var prefs = {
            text: 20,
            video: 40,
            picture: 80,
            openLicence: 0,
            expertLevel:0,
        };
        var qcHistory = localStorage.getItem('qcHistory');
        if (typeof qcHistory !== 'undefined') {
            qcHistory = JSON.parse(qcHistory);
        }

        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (areaName === 'sync' && changes.preferences) {
                prefs = changes.preferences.newValue;
                console.log(changes.preferences);
            }
        });


        chrome.storage.sync.get(['numResults', 'selectedSources', 'uuid', 'preferences'], function(result) {
            if (result.preferences) {
                prefs = result.preferences;
            } else {
                chrome.storage.sync.set({preferences: prefs});
            }
            if (result.selectedSources) {
                result.selectedSources.forEach(function(val) {
                    selectedSources.push({systemId: val.systemId});
                });
            }
            var uuid;
            if (result.uuid) {
                uuid = result.uuid;
            } else {
                uuid = util.randomUUID();
                chrome.storage.sync.set({uuid: uuid});
            }
            var manifest = chrome.runtime.getManifest();
            var settings = {
                base_url: 'https://eexcess-dev.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/',
                origin: {
                    userID: uuid,
                    clientType: manifest.name + "/chrome-extension",
                    clientVersion: manifest.version
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
                            if (selectedSources && selectedSources.length > 0 && !profile.partnerList) {
                                profile.partnerList = selectedSources;
                            }
                            
                            for(var i=0;i<profile.contextKeywords.length; i++) {
                                if (profile.contextKeywords[i].type && profile.contextKeywords[i].type === 'Organisation') {
                                    profile.contextKeywords[i].type = 'Organization';
                                }
                            }
                            
                            // Adaptation of the profile according to the policies
                            profile = profileManager.adaptProfile(profile);
                            
                            // add preferences
                            profile['preferences'] = prefs;
                            
                            var obfuscationLevel = profileManager.getObfuscationLevel();
                            if (obfuscationLevel == 0) {
                                APIconnector.query(profile, sendResponse);
                            } else {
                                var k = obfuscationLevel * 2;
                                APIconnector.queryPeas(profile, k, sendResponse);
                            }

                            return true;
                            break;
                        case 'optionsUpdate':
                            chrome.storage.sync.get(['numResults', 'selectedSources'], function(result) {
                                if (result.numResults) {
                                    APIconnector.setNumResults(result.numResults);
                                }
                                if (result.selectedSources) {
                                    selectedSources = [];
                                    result.selectedSources.forEach(function(val) {
                                        selectedSources.push({systemId: val.systemId});
                                    });
                                }
                            });
                            break;
                        case 'updateQueryCrumbs':
                            msgAllTabs(msg);
                            break;
                        case 'qcGetHistory':
                            sendResponse(qcHistory);
                            return true;
                            break;
                        case 'qcSetHistory':
                            qcHistory = msg.data;
                            localStorage.setItem('qcHistory', JSON.stringify(qcHistory));
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