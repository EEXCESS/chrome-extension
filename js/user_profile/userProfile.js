require(['../common'], function (common) {
	require(["up/basics", "up/constants", "up/interests", "up/languages", "up/policy", "up/storage", "up/util"], 
			function (common, constants, interests, languages, policy, storage, util) {

		//********************
		//** INITIALIZATION **
		//********************

		init();
		display();
		createListeners();

		//***************
		//** FUNCTIONS **
		//***************

		/**
		 * Initializes all the attributes of the form (demographics, languages and interests) using the values saved in the data store. 
		 * It also initializes the buttons that are used to handle the level of privacy for each attribute. 
		 * It is called when the window is loaded. 
		 * @method init
		 */
		function init(){
			common.initTextInputs();
			common.initSelectInputs();
			common.initPrivacyLevels();
			languages.initLanguages();
			interests.initInterests();
			policy.initButtons();
		}

		/**
		 * Displays the values of the attributes. 
		 * The values displayed depends on the level of privacy assigned to each attribute. 
		 * It is called when the window is loaded. 
		 * @method display
		 */
		function display(){
			util.displayElements(common.getTextInputs());
			util.displayElements(common.getSelectInputs());
			util.displayElements(languages.getLanguageSelects());
			util.displayElements(interests.getInterestInputs());
		}

		/**
		 * Create the listeners. Some of the listeners are assigned to form input fields (e.g., demographics, languages), 
		 * while others are assigned to links (e.g., links that allow the addition or the removal of languages). 
		 * The listeners of the interests are not created in the method, as they are related to TagIt. 
		 * It is called when the window is loaded. 
		 * @method createListeners
		 */
		function createListeners(){
			// Buttons
			var buttons = policy.getButtons();
			for (var i = 0 ; i < buttons.length ; i++) {
				var button = buttons[i];
				button.addEventListener("click", function(){ policy.policyButtonListener(this); }); 
			}
			// Text inputs
			var textInputs = common.getTextInputs();
			for (var i = 0 ; i < textInputs.length ; i++) {
				var textInput = textInputs[i];
				textInput.addEventListener("change", function(){ util.elementListener(this, constants.CLASS_TEXT); storage.saveInput(this); });
			}
			// Select inputs
			var selectInputs = common.getSelectInputs();
			for (var i = 0 ; i < selectInputs.length ; i++) {
				var selectInput = selectInputs[i];
				selectInput.addEventListener("change", function(){ util.elementListener(this, constants.CLASS_SELECT); storage.saveInput(this); });
			}
			// Languages
			var selects = languages.getLanguageSelects();
			for (var i = 0 ; i < selects.length ; i++) {
				var select = selects[i];
				select.addEventListener("change", function(){ languages.elementListener(this, constants.CLASS_LANGUAGE); });
			}
			// Interests
			var interestElements = document.getElementById(constants.INTERESTS);
			for (var i = 0 ; i < interestElements.length ; i++){
				interests.addInterestListener();	
			}
			// Remove language links
			var removeLanguageLinks = util.getRemoveLinks(constants.REMOVE_LANGUAGE);
			for (var i = 0 ; i < removeLanguageLinks.length ; i++){
				var removeLanguageLink = removeLanguageLinks[i];
				removeLanguageLink.addEventListener("click", function(){ languages.removeLanguageListener(this); });
			}
			// Remove interest links
			var removeInterestLinks = util.getRemoveLinks(constants.REMOVE_INTEREST);
			for (var i = 0 ; i < removeInterestLinks.length ; i++){
				var removeInterestLink = removeInterestLinks[i];
				removeInterestLink.addEventListener("click", function(){ interests.removeInterestListener(this); });
			}
			// Add language link
			var addLanguageElement = document.getElementById(constants.ADD_LANGUAGE);
			addLanguageElement.addEventListener("click", languages.addLanguageListener);
			// Add interests link
			var addInterestElement = document.getElementById(constants.ADD_INTEREST);
			addInterestElement.addEventListener("click", interests.addInterestListener);
		}
	});
});