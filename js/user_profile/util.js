/**
 * Provides methods handle HTML element/code. 
 * @class util-html
 */
define(["up/constants"], function (constants) {
	
	var util = {
		
		/**
		 * Gets all the links having `tag' in the class attribute. 
		 * @param {String} tag Value of the tag (e.g., `removeLanguageremoveLanguage')
		 * @returns {ListNode} List of elements. 
		 * @method getRemoveLinks 
		 */
		 getRemoveLinks(tag){
			var removeLinks = [];
			var allLinks = document.getElementsByTagName("a");
			var cnt = 0;
			for (var i = 0 ; i < allLinks.length ; i++){
				var aLink = allLinks[i];
				if (aLink.classList.contains(tag)){
					removeLinks[cnt++] = aLink;
				}
			}
			return removeLinks;
		},
		
		/**
		 * Gets the element corresponding to the display of another element. 
		 * For instance, getDisplayElementFromElement("countryInput") returns "countryDisplay". 
		 * The returned value can be null. 
		 * @param {Element} element An input or policy element.  
		 * @returns {Element} A display element corresponding to the input or policy element.  
		 * @method getDisplayElementFromElement
		 */
		getDisplayElementFromElement(element){
			return this.getElementFromElement(element, constants.DISPLAYS);
		},
		
		/**
		 * Gets the element corresponding to the policy of another element. 
		 * For instance, getPolicyElementFromElement("countryInput") returns "locationPolicy". 
		 * @param {Element} element An input (or display) element.  
		 * @returns {Element} A policy element corresponding to the input (or display) element.  
		 * @method getPolicyElementFromElement
		 */
		getPolicyElementFromElement(element){
			return this.getElementFromElement(element, constants.POLICIES);
		},
		
		/**
		 * Retrieves an element given an input element and an array of identifiers. 
		 * The array looks like ["aPolicy", "bPolicy", ..., "zPolicy"]. INPUTS, DISPLAYS and POLICIES (in constants.js) are such arrays. 
		 * For instance, getElementFromElement(anAttributeInputElement, POLICIES) returns anAttributePolicyElement. 
		 * @param {Element} inputElement The input element. 
		 * @param {Array} array Array of identifiers. 
		 * @returns {Element} The element corresponding to the input element. 
		 * @method getElementFromElement
		 */
		getElementFromElement(inputElement, array){
			var outputElement = null;
			var inputElementId = inputElement.getAttribute("id");
			var inputElementIdNum = "";
			var inputElementIdRoot = inputElementId;
			if (this.endsWithNumber(inputElementId)){
				inputElementIdNum = this.extractEndingNumber(inputElementId);
				inputElementIdRoot = inputElementId.replace(inputElementIdNum, "");
			}
			var outputElementIdRoot = this.getElementIdFromId(inputElementIdRoot, array);
			
			if (outputElementIdRoot != null){
				outputElement = document.getElementById(outputElementIdRoot + inputElementIdNum);
			}
			return outputElement;
		},
		
		/**
		 * Gets the element identifier corresponding to an identifier. 
		 * @param {String} id Identifier of the element to be retrieved (e.g., "cityInput", "locationPolicy"). 
		 * @param {Array} array Array in which the element must be searched (e.g., DISPLAYS). 
		 * @returns {String} Identifier of the element retrieved from "id".  
		 * @method getElementIdFromId
		 */
		getElementIdFromId(id, array){
			var element = null;
			var searchArray = new Array();
			if (id.endsWith(constants.INPUT_SUFFIX)){
				searchArray = constants.INPUTS;
			} else if (id.endsWith(constants.POLICY_SUFFIX)){
				searchArray = constants.POLICIES;
			} else if (id.endsWith(constants.DISPLAY_SUFFIX)){
				searchArray = constants.DISPLAYS;
			}
			var found = false;
			for (var i = 0 ; (i < searchArray.length) && (!found) ; i++){
				found = (searchArray[i] == id);
				if (found){
					element = array[i];
				}
			}
			return element;
		},
		
		/**
		 * Determines if a string ends with a number. 
		 * @param {String} str String to be analyzed. 
		 * @returns {Boolean} True if the input string ends with a number; False otherwise. 
		 * @method endsWithNumber
		 */
		endsWithNumber(str){
			return (this.extractEndingNumber(str) != null);
		},
		
		/**
		 * Extracts the number ending a string. 
		 * @param {String} str String to be analyzed (e.g., "id123"). 
		 * @returns {Integer} Number ending the string (e.g., 123). 
		 * @method extractEndingNumber
		 */
		extractEndingNumber(str){
			return str.match(/[0-9]/);
		},
		
		/**
		 * Retrieves all the elements corresponding to a policy element. 
		 * There is more than one element for a policy element, as several attributes may depend on it. 
		 * For instance, "countryInput" and "cityInput" both depends on "locationPolicy".  
		 * @param {Element} policyElement Policy element.
		 * @returns {Array} Array containing all the elements corresponding to the policy element. 
		 * @method getInputElementsFromPolicyElement
		 */
		getInputElementsFromPolicyElement(policyElement){
			var inputElements = [];
			var cnt = 0;
			var policyId = policyElement.getAttribute("id");
			var policyIdNum = "";
			var policyIdRoot = policyId;
			if (this.endsWithNumber(policyId)){
				policyIdNum = this.extractEndingNumber(policyId);
				policyIdRoot = policyId.replace(policyIdNum, "");
			}
			for (var i = 0 ; i < constants.POLICIES.length ; i++){
				var currentPolicyId = constants.POLICIES[i];
				if (currentPolicyId == policyIdRoot){
					var inputId = constants.INPUTS[i] + policyIdNum; 
					inputElements[cnt++] = document.getElementById(inputId);
				}
			}
			return inputElements;
		},
		
		/**
		 * Removes a class from an element. 
		 * For instance removeClass(<anElement class="a b c"/>, "b") returns <anElement class="a c"/>. 
		 * @param {Element} element Element to be altered. 
		 * @param {String} className Name of the class to be removed.  
		 * @method removeClass
		 */
		removeClass(element, className){
			element.className = element.className.replace(" " + className, "");
			element.className = element.className.replace(className, "");
		},
		
		/**
		 * Adds a class to an element. 
		 * For instance addClass(<anElement class="a c"/>, "b") modifies the element to become: <anElement class="a b c"/>. 
		 * @param {Element} element Element to be altered. 
		 * @param {String} className Name of the class to be removed.  
		 * @method addClass
		 */
		addClass(element, className){
			if (element.className != ""){
				className = " " + className;
			}
			element.className = element.className + className;
		},
		
		/**
		 * Removes an element (e.g., language and interest) from the page. 
		 * For instance removeElement(<a id="removeInterest3" .../>, INTEREST) removes the element "interest3" from the list of interests. 
		 * @param {Element} removeElement Element to b
		 * @param {String} type Type of the element to be removed. 
		 * @method removeElement
		 */
		removeElement(removeElement, type){
			var num = util.extractEndingNumber(removeElement.getAttribute("id"));
			var elementId = type + num;
			var elementToRemove = document.getElementById(elementId);
			elementToRemove.parentElement.removeChild(elementToRemove);
		},
		
		/**
		 * Updates a given element (of a certain type). It is needed when a select menu has been modified. 
		 * @param element Element to be updated. 
		 * @param type Type of the element (i.e., language CLASS_LANGUAGE or interest CLASS_INTEREST). 
		 * @method updateHtml
		 */
		updateHtml(element, type){
			if (type == constants.CLASS_LANGUAGE){
				var selectedOption = element.options[element.selectedIndex];
				var options = element.children;
				for (var i = 0 ; i < options.length ; i++){
					var option = options[i];
					if (option == selectedOption){
						option.setAttribute("selected", "selected");
					} else if (option.hasAttribute("selected")){
						option.removeAttribute("selected");
					}
				}
			} else if (type == constants.CLASS_INTEREST){
				var value = element.value;
				element.setAttribute("value", value);
			}
		}, 		
		
		/**
		 * Display all the elements. 
		 * @param {NodeList} elements
		 * @method displayElements
		 */
		displayElements(elements){
			for (var i = 0 ; i < elements.length ; i++) {
				var element = elements[i];
				this.displayElement(element);
			}
		},
		
		/**
		 * Display the element according to the privacy level.
		 * @param {Element} element
		 * @method displayElement
		 */
		displayElement(element){
			var displayElement = util.getDisplayElementFromElement(element);
			var hasToBeDisplayed = (displayElement != null);
			if (hasToBeDisplayed){
				displayElement.textContent = this.blurField(element);
			}
		}, 
		
		/**
		 * Blurs a specific field according to the level of privacy assigned by the user. 
		 * @param {Element} field The field to be blurred.  
		 * @returns {String} The blurred value.   
		 * @method blurField
		 */
		blurField(field){
			var result = "";
			var fieldId = field.getAttribute("id");
			var policyElement = util.getPolicyElementFromElement(field);
			var level = this.getPolicyLevel(policyElement); 
			var value = "";
			var threshold = constants.MAX_POLICY_THRESHOLD; 
			if (fieldId == constants.COUNTRY_INPUT){
				threshold = 1;
				value = field.value;
			} else if (fieldId == constants.CITY_INPUT){
				threshold = 2;
				value = field.value;
			} else if (fieldId == constants.AGE_RANGE_INPUT){
				threshold = 1;
				value = field.options[field.selectedIndex].textContent;
			} else if (fieldId.startsWith(constants.LANGUAGE_LABEL_INPUT) || fieldId.startsWith(constants.LANGUAGE_SKILL_INPUT)){
				threshold = 1;
				value = field.options[field.selectedIndex].text;
			} else if (fieldId.startsWith(constants.INTEREST_INPUT)){
				threshold = 1;
				var topics = $("#" + fieldId).tagit("assignedTags");
				value = "";
				if (topics != null){
					for (var i = 0 ; i < topics.length ; i++){
						value += topics[i];
						if (i != (topics.length - 1)){
							value += ", ";
						}				
					}
				}
			} 
			result = this.blurValue(value, level, threshold);
			return result;
		},
		
		/**
		 * Blurs a specific value according to the policy level and the threshold for this value. 
		 * The value is blurred if and only if the level is lower than the threshold. 
		 * @param {String} value Value to be blurred. 
		 * @param {Integer} level Level of privacy assigned the user. 
		 * @param {Integer} threshold Threshold used to decide if a value must be blurred. 
		 * @returns {String} The blurred value. 
		 * @method blurValue
		 */
		blurValue(value, level, threshold){
			var result = "";
			if (level >= threshold){
				result = value;
			}
			return result;
		}, 
		
		/**
		 * Retrieves the level of privacy of a given button group (i.e., attribute). 
		 * @param {Element} buttonGroup Element corresponding to the button group. 
		 * @returns {Integer} The level of privacy. 
		 * @method getPolicyLevel
		 */
		getPolicyLevel(buttonGroup) {
			var value = 0;
			var buttons = buttonGroup.children;
			for (var i = 0 ; i < buttons.length ; i++){
				var button = buttons[i];
				if (!button.classList.contains(constants.BUTTON_STYLE_GREY)){
					value = i;
				}
			}
			return value;
		},
		
		/**
		 * Display the new value of the element, and save it in the data store.
		 * The HTML is updated in case it has to be done (e.g., for select input field).  
		 * @param {Element} element Element which has just been modified. 
		 * @param {String} clas Class of the element. 
		 * @method elementListener
		 */
		elementListener(element, clas){ 
			util.updateHtml(element, clas);
			util.displayElement(element);
		}
	}
	
	return util;
	
});