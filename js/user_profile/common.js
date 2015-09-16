/**
 * Provides methods to initialize, retrieve or display elements. 
 * @class common
 */
define(["./constants", "./interests", "./languages", "./storage", "./util"], function (constants, interests, languages, storage, util) {
	
	var common = {
		
		/**
		* Returns all the text input elements of class CLASS_TEXT. 
		* @method getTextInputs
		* @return {NodeList} list of elements. 
		*/
		getTextInputs(){
			return document.getElementsByClassName(constants.CLASS_TEXT);
		},
		
		/**
		 * Returns all the select input elements of class CLASS_SELECT. 
		* @method getSelectInputs
		* @return {NodeList} list of elements. 
		*/
		getSelectInputs(){
			return document.getElementsByClassName(constants.CLASS_SELECT);
		},
		
		/**
		* Initializes the text input elements of the form. 
		* Values are taken from the data store. 
		* @method initTextInputs
		*/
		initTextInputs(){
			var textInputs = common.getTextInputs();
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
		initSelectInputs(){
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
		}
		
	} 

	return common;
	
});