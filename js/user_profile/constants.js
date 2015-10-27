/**
 * Defines all the constants used in the module profile.
 * @class constants
 */
define([], function (){

	//*********************
	//** Local variables **
	//*********************
	
	var prefixStorage = 	"privacy.profile.";
	var prefixBtn = 		"btn-";
	var prefixClass = 		"eexcess-"
	var add = 				"add";
	var remove =			"remove";
	var Input = 			"Input";
	var Display = 			"Display";
	var Policy =			"Policy";
	var LoggingLevel = 		"loggingLevel";
	var ObfuscationLevel = 	"obfuscationLevel";
	var name =				"name";
	var city = 				"city";
	var country = 			"country";
	var location = 			"location"
	var ageRange = 			"ageRange";
	var language = 			"language";
	var Language = 			"Language";
	var interest = 			"interest";
	var Interest = 			"Interest";
	var Label = 			"Label";
	var Code = 				"Code";
	var Skill = 			"Skill";
	
	//**********************
	//** Global variables **
	//**********************
	
	var constants = {
		
		STORAGE_PREFIX: prefixStorage,
		INPUT_SUFFIX: Input,
		DISPLAY_SUFFIX: Display, 
		POLICY_SUFFIX: Policy,
		
		BUTTON_STYLE_GREY: prefixBtn + "default",
		BUTTON_STYLE_GREEN: prefixBtn + "success",
		BUTTON_STYLE_ORANGE: prefixBtn + "warning",
		BUTTON_STYLE_RED: prefixBtn + "danger",
		
		PARENT_ID: "ParentId", 
		
		LOGGING_LEVEL: LoggingLevel,
		OBFUSCATION_LEVEL: ObfuscationLevel,
		
		NAME: name,
		NAME_INPUT: name + Input,
		NAME_DISPLAY: name + Display,
		NAME_POLICY: name + Policy,
		
		COUNTRY: country,
		COUNTRY_INPUT: country + Input,
		COUNTRY_DISPLAY: country + Display,
		
		CITY: city,
		CITY_INPUT: city + Input,
		CITY_DISPLAY: city + Display,
		
		LOCATION: location,
		LOCATION_POLICY: location + Policy,
		
		AGE_RANGE:ageRange,
		AGE_RANGE_INPUT: ageRange + Input,
		AGE_RANGE_DISPLAY: ageRange  + Display,
		AGE_RANGE_POLICY: ageRange + Policy,
		
		LANGUAGE: language,
		LANGUAGES: language + "s",
		LANGUAGE_LABEL: language + Label,
		LANGUAGE_CODE: language + Code,
		LANGUAGE_SKILL: language + Skill,
		LANGUAGE_LABEL_INPUT: language + Label + Input,
		LANGUAGE_SKILL_INPUT: language + Skill + Input,
		LANGUAGE_LABEL_DISPLAY: language + Label + Display,
		LANGUAGE_SKILL_DISPLAY: language + Skill + Display,
		LANGUAGE_POLICY: language + Policy,
		ADD_LANGUAGE: add + Language,
		REMOVE_LANGUAGE: remove + Language,
		
		INTEREST: interest,
		INTERESTS: interest + "s",
		INTEREST_INPUT: interest + Input,
		INTEREST_DISPLAY: interest + Display,
		INTEREST_POLICY: interest + Policy,
		ADD_INTEREST: add + Interest,
		REMOVE_INTEREST: remove + Interest,
		
		INPUTS: [name + Input, country + Input, city + Input, ageRange + Input, language + Label + Input, language + Skill + Input, interest + Input],
		DISPLAYS: [null, country + Display, city + Display, ageRange + Display, language + Label + Display, language + Skill + Display, interest + Display],
		POLICIES: [name + Policy, location + Policy, location + Policy, ageRange + Policy, language + Policy, language + Policy, interest + Policy],
		
		CLASS_TEXT: prefixClass + "text",
		CLASS_SELECT: prefixClass + "select",
		CLASS_LANGUAGE: prefixClass + language,
		CLASS_INTEREST: prefixClass + interest,
		CLASS_BUTTON: prefixClass + "button",
		CLASS_BUTTON_GROUP: prefixBtn + "group",
		
		TAB_LANGUAGE_LABELS: ["Bulgarian", "Czech", "Danish", "Dutch", "English", "Estonian", "Finnish", "French", 
		                 "German", "Greek", "Hungarian", "Irish", "Italian", "Latvian", "Lithuanian", "Maltese", 
		                 "Polish", "Portuguese", "Romanian", "Slovak", "Slovenian", "Spanish", "Swedish"],
		                 
		TAB_LANGUAGE_CODES: ["bg", "cs", "da", "nl", "en", "et", "fi", "fr",
		                  "de", "el", "hu", "ga", "it", "lv", "lt", "mt", 
		                  "pl", "pt", "ro", "sk", "sl", "es", "sv"], 

		TAB_LANGUAGE_SKILLS: ["Fluent", "Intermediate", "Basic knowledge"],
		
		DEFAULT_LOGGING_LEVEL_INDEX: 0, // 0: Yes
		DEFAULT_OBFUSCATION_LEVEL_INDEX: 0, // 0: Low
		DEFAULT_AGE_RANGE_INDEX: 2, // 2: Adult
		DEFAULT_LANGUAGE_LABEL_INDEX: 4, // 4: English
		DEFAULT_LANGUAGE_CODE_INDEX: 4, // 4: en
		DEFAULT_LANGUAGE_SKILL_INDEX: 0, // 0: fluent
		DEFAULT_POLICY_LEVEL: 0, // The most restrictive

		MAX_POLICY_THRESHOLD: 3 // In the current version there are only 3 levels (0, 1 and 2)
		
	}
	
	return constants;

});