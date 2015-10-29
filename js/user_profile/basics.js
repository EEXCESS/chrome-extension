/**
 * Provides methods to initialize, retrieve or display elements. 
 * @class common
 */
define(["up/constants", "up/interests", "up/languages", "up/storage", "up/util"], 
	function (constants, interests, languages, storage, util) {
	
	var basics = {
		
		/**
		* Returns all the text input elements of class CLASS_TEXT. 
		* @method getTextInputs
		* @return {NodeList} list of elements. 
		*/
		getTextInputs: function(){
			return document.getElementsByClassName(constants.CLASS_TEXT);
		},
		
		/**
		 * Returns all the select input elements of class CLASS_SELECT. 
		* @method getSelectInputs
		* @return {NodeList} list of elements. 
		*/
		getSelectInputs: function(){
			return document.getElementsByClassName(constants.CLASS_SELECT);
		},
		
		/**
		* Initializes the text input elements of the form. 
		* Values are taken from the data store. 
		* @method initTextInputs
		*/
		initTextInputs: function(){
			var textInputs = this.getTextInputs();
			for (var i = 0 ; i < textInputs.length ; i++) {
				var input = textInputs[i];
				var inputId = input.getAttribute("id");
				var value = storage.getStoredValue(inputId);
				if (value != null){
					input.value = value;
				} // it is null when the user didn't enter any value
			}
		},
		
		/**
		 * Initializes the select input elements of the form. 
		 * Values are taken from the data store. 
		 * @method initSelectInputs
		 */
		initSelectInputs: function(){
			var selectInputs = this.getSelectInputs();
			for (var i = 0 ; i < selectInputs.length ; i++) {
				var input = selectInputs[i];
				var inputId = input.getAttribute("id");
				var value = storage.getStoredValue(inputId);
				if (value == null){
					value = constants.DEFAULT_AGE_RANGE_INDEX;
				}
				input.value = value;
			}
		},
		
		initPrivacyLevels: function(){
			var level;
			// Logging level
			level = storage.getStoredValue(constants.LOGGING_LEVEL);
			if (level == null){
				storage.storeValue(constants.LOGGING_LEVEL, constants.DEFAULT_LOGGING_LEVEL_INDEX); 
			}
			// Obfuscation level
			var level = storage.getStoredValue(constants.OBFUSCATION_LEVEL);
			if (level == null){
				storage.storeValue(constants.OBFUSCATION_LEVEL, constants.DEFAULT_OBFUSCATION_LEVEL_INDEX); 
			}
		}
		
	} 

	return basics;
	
});