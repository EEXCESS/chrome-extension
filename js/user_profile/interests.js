/**
 * Provides methods to manage the interests. 
 * @class interests
 */
define(["up/constants", "up/storage", "up/policy", "up/util", "tag-it", "jquery"], 
		function (constants, storage, policy, util, tag_it, $) {
	
	var interests = {

			/**
			 * Returns all the nodes embedding a fields related to the topics of interest. 
			 * @returns {ListNode} List of interest inputs.
			 * @method getInterestInputs
			 */
			getInterestInputs: function(){
				return document.getElementsByClassName(constants.CLASS_INTEREST);
			},

			/**
			 * Initializes the interests with the values from the data store. 
			 * It generates the HTML code, initializes the TagIt fields, adds the listeners and initializes the buttons. 
			 * @method initInterests
			 */
			initInterests: function(){ 
				var interests = storage.getStoredJson(constants.INTERESTS); 
				var interestsElement = document.getElementById(constants.INTERESTS);
				var code = "";
				for (var i = 0 ; i < interests.length ; i++){
					code = code + this.generateCodeInterest(i);
					interestsElement.innerHTML = code;
				}
				var interestElements = this.getInterestInputs();
				for (var i = 0 ; i < interestElements.length ; i++){
					var interestElement = interestElements[i];
					var interestId = interestElement.getAttribute("id"); 
					this.initInterest(interestId);
					this.createInterestListener(interestId);
				}
				// Initialize the buttons
				for (var i = 0 ; i < interests.length ; i++){
					var policyElement = document.getElementById(constants.INTEREST_POLICY + i);
					policy.initButtonGroup(policyElement);
				}
			},

			/**
			 * Adds an interest: generates the HTML code, adds the listeners, initializes the buttons, saves the interests and update the listeners. 
			 * @method addNewInterest
			 */
			addNewInterest: function(){
				var interestsElement = document.getElementById(constants.INTERESTS);
				var nbInterests = interestsElement.children.length + 1; // +1 to consider the new one
				var code = "";
				for (var i = 0 ; i < nbInterests ; i++){
					code = code + interests.generateCodeInterest(i);
				}
				interestsElement.innerHTML = code;
				var interestElements = interests.getInterestInputs();
				for (var i = 0 ; i < interestElements.length ; i++){
					// Initialise the interests
					var interestElement = interestElements[i];
					var interestId = interestElement.getAttribute("id");
					interests.initInterest(interestId);
					interests.createInterestListener(interestId);
					// Initialise the buttons
					var policyElement = document.getElementById(constants.INTEREST_POLICY + i);
					var level = policy.initButtonGroup(policyElement);
					storage.storeValue(policyElement.getAttribute("id"), level);
					policy.initButtonGroup(policyElement);
					util.displayElement(interestElement);
				}	
				// Save all the interests
				interests.saveInterests();
				// Add listeners
				interests.updateInterestListeners();
			},

			/**
			 * Initializes an interest (instantiate the TagIt field).  
			 * @param {String} interestId identifier of an interest.
			 * @method initInterest
			 */
			initInterest: function(interestId) {
				var lang = window.navigator.userLanguage || window.navigator.language;
				if(lang !== 'de' || lang !== 'fr') {
					lang = 'en';
				}
				$("#" + interestId).tagit({
					allowSpaces: true,
					removeConfirmation:true,
					autocomplete:{
						autoFocus:true,
						minLength:3,
						source: function(request, response) {
							$.ajax({
								processData: false,
								contentType: 'application/json',
								type: 'POST',
								url: 'https://eexcess-dev.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/suggestCategories',
								dataType: "json",
								data: '{"input":"' + request.term + '","language":"'+ lang + '"}', // possible language fields: en,de,fr TODO: make selectable
								success: function(data) {
									response($.map(data.categories, function(item) {
										return {
											value: item.name,
											data: {text: item.name, uri: item.uri}
										};
									}));
								},
								error: function(jqXHR, textStatus, errorThrown) {
									console.log("error calling category suggestion service");
									// no further error handling needed, suggestions will just not be displayed
								}
							});
						}
					}
				});
				var index = util.extractEndingNumber(interestId);
				var interests = storage.getStoredJson(constants.INTERESTS);
				if (interests.length > index){
					var interest = interests[index]; 
					for (var i = 0 ; i < interest.length ; i++){
						$("#" + interestId).tagit("createTag", interest[i].text, interest[i]);
					}
				}
			},

			/**
			 * Create the listeners for a TagIt field. 
			 * @param {String} interestId identifier of an interest.
			 * @method createInterestListener
			 */
			createInterestListener: function(interestId) {
				$("#" + interestId).tagit({
					afterTagAdded: function(event, ui) {
						if (!ui.duringInitialization) {
							var interestElement = document.getElementById(interestId);
							util.elementListener(interestElement, constants.CLASS_INTEREST);
							interests.saveInterests();
						}
					}, 
					afterTagRemoved: function(event, ui) {
						var interestElement = document.getElementById(interestId);
						util.elementListener(interestElement, constants.CLASS_INTEREST);
						interests.saveInterests();
					}
				});
			},

			/**
			 * Updates the listeners for all the interests: 
			 * TagIt field listeners, listener for the removal of an interest, and buttons listeners. 
			 * @method updateInterestListeners
			 */
			updateInterestListeners: function(){
				var interestElements = interests.getInterestInputs();
				for (var i = 0 ; i < interestElements.length ; i++){
					var interestElement = interestElements[i];
					var interestId = interestElement.getAttribute("id");
					var interestIdNum = util.extractEndingNumber(interestId); 
					interests.createInterestListener(interestId);
					var removeInterestElement = document.getElementById(constants.REMOVE_INTEREST + interestIdNum);
					removeInterestElement.addEventListener("click", function(){ interests.removeInterestListener(this); }); 
					var policyInterestElement = document.getElementById(constants.INTEREST_POLICY + interestIdNum);
					for (var j = 0 ; j < policyInterestElement.children.length ; j++){
						var button = policyInterestElement.children[j];
						button.addEventListener("click", function(){ policy.policyButtonListener(this); });
					}
				}
			},

			/**
			 * Generate the HTML code to insert a new interest. 
			 * @param {Integer} index Index of the interest to add. 
			 * @returns {String} HTML code. 
			 * @method generateCodeInterest
			 */
			generateCodeInterest: function(index){ 
				var code = 	'<div id="' + constants.INTEREST + index + '" class="row">\n';
				code += 	'	<div class="panel-body">\n';
				code += 	'		<div class="col-md-6">\n';
				code += 	'			<div class="row">\n';
				code += 	'				<div class="col-md-1">\n';
				code += 	'					<div class="panel-body">\n';
				code += 	'						<a id="' + constants.REMOVE_INTEREST + index +'" class="' + constants.REMOVE_INTEREST + '" style="color: red;" href="#x"><span class="glyphicon glyphicon-remove"></span></a>\n';
				code += 	'					</div>\n';
				code += 	'				</div>\n';
				code += 	'				<div class="col-md-11 row">\n';
				code += 	'					<div class="input-group">\n';
				code += 	'						<ul id="' + constants.INTEREST_INPUT + index + '" class="' + constants.CLASS_INTEREST + '"></ul>\n';
				code += 	'					</div>\n';
				code += 	'				</div>\n';
				code += 	'			</div>\n';
				code += 	'		</div>\n';
				code += 	'		<div id="' + constants.INTEREST_POLICY + index + '" class="btn-group col-md-2" role="group">\n';
				code += 	'			<button type="button"  class="btn ' + constants.BUTTON_STYLE_GREY + ' ' + constants.CLASS_BUTTON + '" ' + constants.PARENT_ID + '="' + constants.INTEREST_POLICY + index + '">Hidden</button>\n';
				code += 	'			<button type="button"  class="btn ' + constants.BUTTON_STYLE_GREY + ' ' + constants.CLASS_BUTTON + '" ' + constants.PARENT_ID + '="' + constants.INTEREST_POLICY + index + '">Disclosed</button>\n';
				code += 	'		</div>';
				code += 	'		<div class="col-md-4">Value shared with the system: \n';
				code += 	'			<span id="' + constants.INTEREST_DISPLAY + index + '"></span>\n';
				code += 	'		</div>\n';	
				code += 	'	</div>\n';	
				code += 	'</div>\n';
				return code;
			},

			/**
			 * Saves all the interests: extract the values from the form and store it in the data store. 
			 * @method saveInterests
			 */
			saveInterests: function(){
				var interestElements = this.getInterestInputs();
				var interests = [];
				for (var i = 0 ; i < interestElements.length ; i++){
					var interestElement = interestElements[i];
					var interestId = interestElement.getAttribute("id");
					var array = $("#" + interestId).tagit("getActiveTagsProperties");
					array.forEach(function(val){
						delete val.isMainTopic;
					});
					if ((array != null) && (array.length != 0)){
						interests.push(array);
					}
				}
				storage.storeValue(constants.INTERESTS, JSON.stringify(interests));
			},

			/**
			 * Adds a topic to an interest (added only if it's not already contained).  
			 * @param {Array} interests Array of interests. 
			 * @param {String} interestId Identifier of the interest to be updated. 
			 * @param {String} label Label of the new topic. 
			 * @returns {Array} Array of interests containing "label". 
			 * @method addTopic
			 */
			addTopic: function(interests, interestId, label){
				var index = "";
				if (endsWithNumber(interestId)){
					index = extractEndingNumber(interestId); 
				}
				var interest = interests[index];
				if (interest == null){
					interest = [];
				}
				if (interest.indexOf(label) == -1){
					interest.push(label);
					interests[index] = interest;
				}
				return interests;
			},

			/**
			 * Removes a topic for an interest. 
			 * @param {Array} interests Array of interests.  
			 * @param {String} interestId Identifier of the interest to be updated. 
			 * @param {String} label Label of the topic to be removed.  
			 * @returns {Array} Array of interests without "label". 
			 * @method removeTopic
			 */
			removeTopic: function(interests, interestId, label){
				var index = extractEndingNumber(interestId);
				var interest = interests[index];
				if (interest != null){
					interest.splice(interest.indexOf(label), 1);
					if (interest.length != 0){
						interests[index] = interest;
					} else {
						interests.splice(index, 1);
					}
				}
				return interests;
			},

			/**
			 * Removes the listener assigned to a link element. 
			 * This method is used when an interest is removed to make sure the removal is done properly. 
			 * It resets the policy level, remove the HTML code, and save the interests. 
			 * @param {Element} link Element corresponding to the link. 
			 * @method removeInterestListener
			 */
			removeInterestListener: function(link){
				policy.resetElementPolicy(link, constants.INTEREST_POLICY, constants.DEFAULT_POLICY_LEVEL);
				util.removeElement(link, constants.INTEREST);
				interests.saveInterests();
			},

			/**
			 * Listener invoked when an interest must be added. 
			 * @method addInterestListener
			 */
			addInterestListener: function(){ 
				interests.addNewInterest(); 
			}
	}

	return interests;

});