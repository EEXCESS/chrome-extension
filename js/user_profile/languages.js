/**
 * Provides methods to manage the languages. 
 * @class languages
 */
define(["up/constants", "up/storage", "up/policy", "up/util"], 
		function (constants, storage, policy, util) {

	var languages = {
		
		/**
		 * Retrieves all the nodes embedding a fields related to the languages. 
		 * @returns {ListNode} List of languages inputs.
		 * @method getLanguageSelects
		 */
		getLanguageSelects: function(){
			return document.getElementsByClassName(constants.CLASS_LANGUAGE);
		},
		
		/**
		 * Initializes the languages with the values from the data store. 
		 * It generates the HTML code, initializes the fields, adds the listeners and initializes the buttons. 
		 * @method initLanguages
		 */
		initLanguages: function(){
			var languages = storage.getStoredJson(constants.LANGUAGES);
			var languagesElement = document.getElementById(constants.LANGUAGES);
			for (var i = 0 ; i < languages.length ; i++){
				var language = languages[i];
				var code = language.languageCode;
				var skill = language.languageSkill;
				var htmlCode = this.generateCodeLanguage(i, code, skill);
				languagesElement.innerHTML = languagesElement.innerHTML + htmlCode;
			}
		},
		
		/**
		 * Adds a language: generates the HTML code, adds the listeners, initializes the buttons, saves the interests and update the listeners.
		 * @method addNewLanguage
		 */
		addNewLanguage: function(){
			var languagesElement = document.getElementById(constants.LANGUAGES);
			var nbLanguages = languagesElement.children.length;
			var htmlCode = languages.generateCodeLanguage(nbLanguages, null, null);
			languagesElement.innerHTML = languagesElement.innerHTML + htmlCode;
			// Initialize the buttons
			var policyElement = document.getElementById(constants.LANGUAGE_POLICY + nbLanguages);
			var level = policy.initButtonGroup(policyElement);
			storage.storeValue(policyElement.getAttribute("id"), level);
			// Save all the languages
			languages.saveLanguages();
			// Add listeners
			languages.updateLanguageListeners();
		},
		
		/**
		 * Updates the listeners for all the languages: 
		 * field listeners, listener for the removal of a language, and buttons listeners. 
		 * @method updateLanguageListeners
		 */
		updateLanguageListeners: function(){
			var languageElements = document.getElementById(constants.LANGUAGES).children;
			var nbLanguages = languageElements.length;
			for (var i = 0 ; i < nbLanguages ; i++){
				var languageElement = languageElements[i];
				var languageId = languageElement.getAttribute("id");
				var languageIdNum = util.extractEndingNumber(languageId); 
				var selectLabelElement = document.getElementById(constants.LANGUAGE_LABEL_INPUT + languageIdNum);
				selectLabelElement.addEventListener("change", function(){ languages.elementListener(this, constants.CLASS_LANGUAGE); }); 
				var selectSkillElement = document.getElementById(constants.LANGUAGE_SKILL_INPUT + languageIdNum);
				selectSkillElement.addEventListener("change", function(){ languages.elementListener(this, constants.CLASS_LANGUAGE); }); 
				var removeLanguageElement = document.getElementById(constants.REMOVE_LANGUAGE + languageIdNum);
				removeLanguageElement.addEventListener("click", function(){ languages.removeLanguageListener(this); }); 
				var policyLanguageElement = document.getElementById(constants.LANGUAGE_POLICY + languageIdNum);
				for (var j = 0 ; j < policyLanguageElement.children.length ; j++){
					var button = policyLanguageElement.children[j];
					button.addEventListener("click", function(){ policy.policyButtonListener(this); });
				}
			}
		},
		
		/**
		 * Generate the HTML code to insert a new language. 
		 * @param {Integer} index Index of the interest to add. 
		 * @param {String} label Label of the language (e.g., English, French). 
		 * @param {String} skill Level of skill for the aforementioned languages (e.g., Fluent, Intermediate). 
		 * @returns {String} HTML code. 
		 * @method generateCodeLanguage
		 */
		generateCodeLanguage: function(index, languageCode, skill){
			var code = 	'<div id="' + constants.LANGUAGE + index + '" class="row">\n';
			code += 	'	<div class="panel-body">\n';
			code += 	'		<div class="col-md-6">\n';
			code += 	'			<div class="row">\n';
			code += 	'				<div class="col-md-1">\n';
			code += 	'					<div class="panel-body">\n';
			code += 	'						<a id="' + constants.REMOVE_LANGUAGE + index +'" class="' + constants.REMOVE_LANGUAGE + '" style="color: red;" href="#x"><span class="glyphicon glyphicon-remove"></span></a>\n';
			code += 	'					</div>\n';
			code += 	'				</div>\n';
			code += 	'				<div class="col-md-11 row">\n';
			code += 	'					<div class="col-md-6">\n';
			code += 	'						<div class="input-group">\n';
			code += 	'							<span class="input-group-addon"><span class="glyphicon glyphicon-stats"></span></span>\n';
			code += 	'							<select id="' + constants.LANGUAGE_LABEL_INPUT + index + '" class="form-control ' + constants.CLASS_LANGUAGE + '">\n';
			for (var i = 0 ; i < constants.TAB_LANGUAGE_LABELS.length ; i++){
				var currentLabel = constants.TAB_LANGUAGE_LABELS[i];
				var currentCode = constants.TAB_LANGUAGE_CODES[i];
				var selected = "";
				var cond1 = (languageCode != null) && (currentCode == languageCode);
				var cond2 = (languageCode == null) && (i == constants.DEFAULT_LANGUAGE_CODE_INDEX);
				if (cond1 || cond2){
					selected = " selected=\"selected\"";
				} 
				code += '								<option value="' + currentCode + '"' + selected + '>' + currentLabel + '</option>\n';
			}	
			code += 	'							</select>\n';
			code += 	'						</div>\n';
			code += 	'					</div>\n';
			code += 	'					<div class="col-md-6"> \n';
			code += 	'						<div class="input-group">\n';
			code += 	'							<span class="input-group-addon"><span class="glyphicon glyphicon-stats"></span></span>\n';
			code += 	'							<select id="' + constants.LANGUAGE_SKILL_INPUT + index + '" class="form-control ' + constants.CLASS_LANGUAGE + '">\n';
			for (var i = 0 ; i < constants.TAB_LANGUAGE_SKILLS.length ; i++){
				var currentSkill = constants.TAB_LANGUAGE_SKILLS[i];
				var selected = ""; 
				var cond1 = (skill != null) && (currentSkill == skill);
				var cond2 = (skill == null) && (i == constants.DEFAULT_LANGUAGE_SKILL_INDEX);
				if (cond1 || cond2){
					selected = " selected=\"selected\"";
				}
				code += '								<option value="' + currentSkill + '"' + selected + '>' + currentSkill + '</option>\n';
			}
			code +=			'						</select>\n';
			code += 	'						</div>\n';
			code += 	'					</div>\n';
			code += 	'				</div>\n';
			code += 	'			</div>\n';
			code += 	'		</div>\n';
			code += 	'		<div id="' + constants.LANGUAGE_POLICY + index + '" class="btn-group col-md-2" role="group">\n';
			code += 	'			<button type="button" class="btn ' + constants.BUTTON_STYLE_GREY + ' ' + constants.CLASS_BUTTON + '" ' + constants.PARENT_ID + '="' + constants.LANGUAGE_POLICY + index + '">Hidden</button>\n';
			code += 	'			<button type="button" class="btn ' + constants.BUTTON_STYLE_GREY + ' ' + constants.CLASS_BUTTON + '" ' + constants.PARENT_ID + '="' + constants.LANGUAGE_POLICY + index + '">Disclosed</button>\n';
			code += 	'		</div>\n';
			code += 	'		<div class="col-md-4">Value shared with the system: \n';
			code += 	'			<span id="' + constants.LANGUAGE_LABEL_DISPLAY + index + '"></span>\n';
			code += 	'			<span id="' + constants.LANGUAGE_SKILL_DISPLAY + index + '"></span>\n';
			code += 	'		</div>\n';
			code += 	'	</div>\n';
			code += 	'</div>\n';
			return code;
		},
		
		/**
		 * Saves all the languages: extract the values from the form and store it in the data store. 
		 * @method saveLanguages
		 */
		saveLanguages: function(){
			var languagesElement = document.getElementById(constants.LANGUAGES);
			var languageElements = languagesElement.children;
			var languages = [];
			for (var i = 0 ; i < languageElements.length ; i++){
				var language = new Object();
				var languageElement = languageElements[i];
				var languageId = languageElement.getAttribute("id");
				var num = util.extractEndingNumber(languageId); 
				var languageLabel = document.getElementById(constants.LANGUAGE_LABEL_INPUT + num);
				var code = languageLabel.options[languageLabel.selectedIndex].value;
				language[constants.LANGUAGE_CODE] = code;
				
				var languageSkill = document.getElementById(constants.LANGUAGE_SKILL_INPUT + num);
				var skill = languageSkill.options[languageSkill.selectedIndex].value;
				language[constants.LANGUAGE_SKILL] = skill;
				
				languages.push(language);
			}
			storage.storeValue(constants.LANGUAGES, JSON.stringify(languages));
		},
		
		/**
		 * Removes the listener assigned to a link element. 
		 * This method is used when a language is removed to make sure the removal is done properly. 
		 * It resets the policy level, remove the HTML code, and save the languages. 
		 * @param {Element} link Element corresponding to the link. 
		 * @method removeLanguageListener
		 */
		removeLanguageListener: function(link){
			policy.resetElementPolicy(link, constants.LANGUAGE_POLICY, constants.DEFAULT_POLICY_LEVEL);
			util.removeElement(link, constants.LANGUAGE);
			languages.saveLanguages();
		},
		
		/**
		 * Listener invoked when a language must be added. 
		 * @method addLanguageListener
		 */
		addLanguageListener: function(){ 
			languages.addNewLanguage(); 
		}, 
		
		/**
		 * Display the new value of the element, and save it in the data store.
		 * The HTML is updated in case it has to be done (e.g., for select input field).  
		 * @param {Element} element Element which has just been modified. 
		 * @param {String} clas Class of the element. 
		 * @method elementListener
		 */
		elementListener: function(element, clas){ 
			util.elementListener(element,clas);
			languages.saveLanguages(); 
		}
	}
	
	return languages;
		
});