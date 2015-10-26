define(["up/constants"], function (cst) {

	//***********************
	//** Module definition **
	//***********************
	
	var profileManager = {
		
		adaptProfile:function(profile){
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
            return profile;
		},
			
		// Name 
		
		getName(){
			return getValue(cst.NAME);
		},
		
		setName(value){
			setValue(cst.NAME, value);
		},
		
		isNameDisclosed(){
			return (getLevel(cst.NAME, "") > 0);
		}, 
		
		getNamePolicy(){
			return getLevel(cst.NAME, "");
		},
		
		// Country
		
		getCountry(){
			return getValue(cst.COUNTRY);
		}, 

		setCountry(value){
			setValue(cst.COUNTRY, value);
		},
		
		isCountryDisclosed(){
			return (getLevel(cst.LOCATION, "") > 0);
		}, 
		
		hideCountry(){
			setLevel(cst.LOCATION, "", 0); 
		}, 
		
		discloseCountry(){
			setLevel(cst.LOCATION, "", 1);
		},
		
		getLocationPolicy(){
			return getLevel(cst.LOCATION, "");
		},
		
		// City
		
		getCity(){
			return getValue(cst.CITY);
		}, 

		setCity(value){
			setValue(cst.CITY, value);
		},
		
		isCityDisclosed(){
			return (getLevel(cst.LOCATION, "") > 1);
		}, 
		
		hideCity(){
			if (profile.isCountryDisclosed()){
				setLevel(cst.LOCATION, "", 1); 
			} else {
				setLevel(cst.LOCATION, "", 0); 
			}
		}, 
		
		discloseCity(){
			setLevel(cst.LOCATION, "", 2); 
		},
		
		// Age range
		
		getAgeRange(){
			var ageRange = getValue(cst.AGE_RANGE);
			if (ageRange == null){
				ageRange = cst.DEFAULT_AGE_RANGE_INDEX;
			}
			return ageRange;
		}, 

		setAgeRange(value){
			setValue(cst.AGE_RANGE, value);
		},
		
		isAgeRangeDisclosed(){
			return (getLevel(cst.AGE_RANGE, "") > 0);
		}, 

		hideAgeRange(){
			setLevel(cst.AGE_RANGE, "", 0); 
		}, 
		
		discloseAgeRange(){
			setLevel(cst.AGE_RANGE, "", 1); 
		},
		
		getAgeRangePolicy(){
			return getLevel(cst.AGE_RANGE, "");
		}, 
		
		// Languages
		
		getLanguages(){
			var languages = getJsonValue(cst.LANGUAGES);
			if (languages == null){
				languages = [];
			}
			return languages;
		}, 

		setLanguages(value){
			setJsonValue(cst.LANGUAGES, value);
		},
		
		isLanguageDisclosed(i){
			return (getLevel(cst.LANGUAGE, i) > 0);
		}, 
		
		hideLanguage(i){
			setLevel(cst.LANGUAGE, i, 0); 
		}, 
		
		discloseLanguage(i){
			setLevel(cst.LANGUAGE, i, 1); 
		},
		
		getLanguagePolicy(i){
			return getLevel(cst.LANGUAGE, i);
		}, 
		
		// Interests
		
		getInterests(){
			var interests = getJsonValue(cst.INTERESTS);
			if (interests == null){
				interests = [];
			}
			return interests;
		}, 

		setInterests(value){
			setJsonValue(cst.INTERESTS, value);
		},
		
		isInterestDisclosed(i){
			return (getLevel(cst.INTEREST, i) > 0);
		},
		
		hideInterest(i){
			setLevel(cst.INTEREST, i, 0); 
		}, 
		
		discloseInterest(i){
			setLevel(cst.INTEREST, i, 1); 
		},
		
		getInterestPolicy(i){
			return getLevel(cst.INTEREST, i);
		}
			
	};
	
	//*******************
	//** Local methods **
	//*******************
	
	function getValue(key){
		return localStorage.getItem(cst.STORAGE_PREFIX + key + cst.INPUT_SUFFIX);
	}
	
	function setValue(key, value){
		localStorage.setItem(cst.STORAGE_PREFIX + key + cst.INPUT_SUFFIX, value);
	}
	
	function getJsonValue(key){
		var jsonValue = null;
		var value = localStorage.getItem(cst.STORAGE_PREFIX + key);
		if (value != null){
			jsonValue = JSON.parse(value)
		} 
		return jsonValue;
	}
	
	function setJsonValue(key, value){
		localStorage.setItem(cst.STORAGE_PREFIX + key, JSON.stringify(value));
	}
	
	function getLevel(key, idx){
		var level = 0;
		var levelAux = localStorage.getItem(cst.STORAGE_PREFIX + key + cst.POLICY_SUFFIX + idx);
		if (levelAux != null){
			level = levelAux;
		}
		return level;
	}
	
	function setLevel(key, idx, level){
		localStorage.setItem(cst.STORAGE_PREFIX + key + cst.POLICY_SUFFIX + idx, level);
	}
	
	return profileManager;
	
});

