require(['./common'], function (common) {
    require(['c4/APIconnector', 'up/profile', 'up/constants'], function (APIconnector, up_profile, up_constants) {
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
                        // Age range
                        up_profile.hideAgeRange(); // TODO remove this line
                        if (up_profile.isAgeRangeDisclosed()){ 
                        	profile.ageRange = parseInt(up_profile.getAgeRange()); 
                        }
                        // Address
                        if (up_profile.isCityDisclosed() && up_profile.isCountryDisclosed()){
                        	profile.address = {
                        		city: up_profile.getCity(),
                        		country: up_profile.getCountry()
                        	};
                        } else if (up_profile.isCountryDisclosed()){
                        	profile.address = {
                            	country: up_profile.getCountry()
                            };
                        }
                        // Languages
                        var languages = up_profile.getLanguages();
                        var pLanguages = [];
                        for (var i = 0 ; i < languages.length ; i++){
                        	if (up_profile.isLanguageDisclosed(i)){
	                        	var languageSkill = languages[i].languageSkill;
	                        	var languageCompetenceLevel = 0;
	                        	for (var j = 0 ; j < up_constants.TAB_LANGUAGE_SKILLS.length ; j++){
	                        		if (up_constants.TAB_LANGUAGE_SKILLS[j] == languageSkill){
	                        			languageCompetenceLevel = 1 - j * (1 / up_constants.TAB_LANGUAGE_SKILLS.length);
	                        		}
	                        	}
	                        	pLanguages[pLanguages.length] = {
	                        		iso2: languages[i].languageCode,
	                        		languageCompetenceLevel: languageCompetenceLevel
	                        	};
                        	}
                        }
                        if (pLanguages.length > 0){
                        	profile.languages = pLanguages;
                        }
                        // Interests
                        var interests = up_profile.getInterests();
                        var pInterests = [];
                        for (var i = 0 ; i < interests.length ; i++){
                        	if (up_profile.isInterestDisclosed(i)){
	                        	var topics = interests[i];
	                        	for (var j = 0 ; j < topics.length ; j++){
	                        		pInterests[pInterests.length] = {
	                        			text: topics[j]
	                        		};
	                        	}
                        	}
                        }
                        if (pInterests.length > 0){
                        	profile.interests = pInterests;
                        }
                        console.log(profile);
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

