/**
 * Provides methods to manage policy privacy. 
 * @class policy
 */
define(["up/constants", "up/storage", "up/util", "up/profileManager"], 
		function (constants, storage, util, profileManager) {
	
	var policy = {
		
		/**
		 * Retrieves all the button groups contained in the page. 
		 * @returns {NodeList} List of button groups. 
		 * @method getButtonGroups
		 */
		getButtonGroups: function(){
			return document.getElementsByClassName(constants.CLASS_BUTTON_GROUP);
		},
		
		/**
		 * Retrieves all the buttons contained in the page. 
		 * @returns {NodeList} List of buttons. 
		 * @method getButtons
		 */
		getButtons: function(){
			return document.getElementsByClassName(constants.CLASS_BUTTON);
		},
		
		/**
		 * Initializes all the buttons contained in the page. 
		 * @method initButtons
		 */
		initButtons: function(){
			var buttonGroups = policy.getButtonGroups();
			for (var i = 0 ; i < buttonGroups.length ; i++){
				policy.initButtonGroup(buttonGroups[i]);
			}
		},
		
		/**
		 * Initializes all the buttons of a given button group. 
		 * @param {Element} buttonGroup Button group element containing the buttons that must be initialized. 
		 * @method initButtonGroup
		 */
		initButtonGroup: function(buttonGroup){
			var buttonGroupId = buttonGroup.getAttribute("id");
			var level = storage.getStoredValue(buttonGroupId);
			if (level == null){ 
				level = constants.DEFAULT_POLICY_LEVEL; 
			}
			var children = buttonGroup.children;
			for (var j = 0 ; j < children.length ; j++){
				var child = children[j];
				// Initialise the style of the button
				util.removeClass(child, constants.BUTTON_STYLE_GREY);
				util.removeClass(child, constants.BUTTON_STYLE_GREEN);
				util.removeClass(child, constants.BUTTON_STYLE_ORANGE);
				util.removeClass(child, constants.BUTTON_STYLE_RED);
				var buttonStyle = constants.BUTTON_STYLE_GREY;
				if (j != level){
					buttonStyle = constants.BUTTON_STYLE_GREY;
				} else {
					if ((buttonGroupId == constants.LOGGING_LEVEL) || (buttonGroupId == constants.OBFUSCATION_LEVEL)){
						if (j == 0){
							buttonStyle = constants.BUTTON_STYLE_RED;
						} else if ((j == 1) && (j != children.length-1)){
							buttonStyle = constants.BUTTON_STYLE_ORANGE;
						} else {
							buttonStyle = constants.BUTTON_STYLE_GREEN;
						}
					} else {
						if (j == 0){
							buttonStyle = constants.BUTTON_STYLE_GREEN;
						} else if ((j == 1) && (j != children.length-1)){
							buttonStyle = constants.BUTTON_STYLE_ORANGE;
						} else if ((j == 2) || (j == children.length-1)){
							buttonStyle = constants.BUTTON_STYLE_RED;
						}
					}
				}
				util.addClass(child, buttonStyle);
				// Add an attribute PARENT_ID (useful for listeners)
				if (!child.hasAttribute(constants.PARENT_ID)){
					child.setAttribute(constants.PARENT_ID, buttonGroup.getAttribute("id"));
				}
			}
			return level;
		},
		
		/**
		 * Updates a given button: changes the appearance according to a user's action, 
		 * triggers the display of the value (depending on the level of privacy). 
		 * @param {Element} button Element corresponding to the button to be updated. 
		 * @method updateButton
		 */
		updateButton: function(button){
			var parent = document.getElementById(button.getAttribute(constants.PARENT_ID));
			var buttonGroupId = parent.getAttribute("id");
			var children = parent.children;
			for (var i = 0 ; i < children.length ; i++){
				var child = children[i];
				util.removeClass(child, constants.BUTTON_STYLE_GREY);
				util.removeClass(child, constants.BUTTON_STYLE_GREEN);
				util.removeClass(child, constants.BUTTON_STYLE_ORANGE);
				util.removeClass(child, constants.BUTTON_STYLE_RED);
				var buttonStyle = constants.BUTTON_STYLE_GREY;
				if (child.textContent == button.textContent){
					// the current child is the button that was clicked on
					if ((buttonGroupId == constants.LOGGING_LEVEL) || (buttonGroupId == constants.OBFUSCATION_LEVEL)){
						if (i == 0){
							buttonStyle = constants.BUTTON_STYLE_RED;
						} else if ((i == 1) && (i != children.length-1)){
							buttonStyle = constants.BUTTON_STYLE_ORANGE;
						} else {
							buttonStyle = constants.BUTTON_STYLE_GREEN;
						}
					} else {
						if (i == 0){
							buttonStyle = constants.BUTTON_STYLE_GREEN;
						} else if ((i == 1) && (i != children.length-1)){
							buttonStyle = constants.BUTTON_STYLE_ORANGE;
						} else if ((i == 2) || (i == children.length-1)){
							buttonStyle = constants.BUTTON_STYLE_RED;
						}
					}
				}
				util.addClass(child, buttonStyle);
			}
			
			// Update the value(s) displayed
			var inputElements = util.getInputElementsFromPolicyElement(button.parentNode);
			for (var i = 0 ; i < inputElements.length ; i++){
				util.displayElement(inputElements[i]);
			}
		},
		
		/**
		 * Listener invoked when a given policy button is clicked. 
		 * It update the button, save the value of the button (i.e., the level of privacy), 
		 * and triggers the display of the value corresponding to the attribute. 
		 * @param {Element} button Element corresponding to the button. 
		 * @method policyButtonListener
		 */
		policyButtonListener: function(button){ 
			this.updateButton(button); 
			storage.saveButton(button);
			var policyId = button.getAttribute(constants.PARENT_ID);
			var policyElement = document.getElementById(policyId);
			var inputElements = util.getInputElementsFromPolicyElement(policyElement);
			for (var j = 0 ; j < inputElements.length ; j++){
				var inputElement = inputElements[j];
				util.displayElement(inputElement);
			}
		},
		
		/**
		 * Resets the value of the privacy level of a given attribute. 
		 * It is invoked when an attribute is removed (e.g., a language or an interest). 
		 * @param {Element} element Element corresponding to the attribute. 
		 * @param {String} typePolicy Type of attribute considered (i.e., language LANGUAGE_POLICY or interest INTEREST_POLICY). 
		 * @param {Integer} defaultPolicyLevel The default level of privacy for the considered attribute.  
		 * @method resetElementPolicy
		 */
		resetElementPolicy: function(element, typePolicy, defaultPolicyLevel){
			var num = util.extractEndingNumber(element.getAttribute("id"));
			var elementId = typePolicy + num;
			storage.storeValue(elementId, defaultPolicyLevel);
		}
	}
	
	return policy;
	
});