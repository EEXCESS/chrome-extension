define(["up/constants"], function (cst) {

	//***********************
	//** Module definition **
	//***********************
	
	var profileManager = {
		
		adaptProfile:function(profile){
			// Age range
            setValue(cst.AGE_RANGE, 0); // TODO remove this line
            if (this.isAgeRangeDisclosed()){ 
            	profile.ageRange = this.getAgeRange(); 
            }
            // Address
            if (this.isCityDisclosed() && this.isCountryDisclosed()){
            	profile.address = {
            		city: this.getCity(),
            		country: this.getCountry()
            	};
            } else if (this.isCountryDisclosed()){
            	profile.address = {
                	country: this.getCountry()
                };
            }
            // Languages
            var languages = this.getLanguages();
            var pLanguages = [];
            for (var i = 0 ; i < languages.length ; i++){
            	if (this.isLanguageDisclosed(i)){
                	var languageSkill = languages[i].languageSkill;
                	var languageCompetenceLevel = 0;
                	for (var j = 0 ; j < cst.TAB_LANGUAGE_SKILLS.length ; j++){
                		if (cst.TAB_LANGUAGE_SKILLS[j] == languageSkill){
                			languageCompetenceLevel = 1 - j * (1 / cst.TAB_LANGUAGE_SKILLS.length);
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
            var interests = this.getInterests();
            var pInterests = [];
            for (var i = 0 ; i < interests.length ; i++){
            	if (this.isInterestDisclosed(i)){
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
            // Logging level
            profile.loggingLevel = this.getLoggingLevel(); 
            return profile;
		},
		
		// Logging level
		
		getLoggingLevel(){
			var level = localStorage.getItem(cst.STORAGE_PREFIX + cst.LOGGING_LEVEL);
			if (level == null){
				level = 0;
			} else {
				level = parseInt(level);
			}
			return level;
		},
		
		// Obfuscation level
		
		getObfuscationLevel(){
			var level = localStorage.getItem(cst.STORAGE_PREFIX + cst.OBFUSCATION_LEVEL);
			if (level == null){
				level = 0;
			} else {
				level = parseInt(level);
			}
			return level;
		},
			
		// Name 
		
		getName(){
			return getValue(cst.NAME);
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

		isCountryDisclosed(){
			return (getLevel(cst.LOCATION, "") > 0);
		},
		
		getLocationPolicy(){
			return getLevel(cst.LOCATION, "");
		},
		
		// City
		
		getCity(){
			return getValue(cst.CITY);
		}, 
		
		isCityDisclosed(){
			return (getLevel(cst.LOCATION, "") > 1);
		}, 
		
		// Age range
		
		getAgeRange(){
			var ageRange = getValue(cst.AGE_RANGE);
			if (ageRange == null){
				ageRange = cst.DEFAULT_AGE_RANGE_INDEX;
			}
			return parseInt(ageRange);
		}, 
		
		isAgeRangeDisclosed(){
			return (getLevel(cst.AGE_RANGE, "") > 0);
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
		
		isLanguageDisclosed(i){
			return (getLevel(cst.LANGUAGE, i) > 0);
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

		isInterestDisclosed(i){
			return (getLevel(cst.INTEREST, i) > 0);
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

