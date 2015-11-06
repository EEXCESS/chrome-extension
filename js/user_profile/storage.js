/**
 * Provides methods to manage the storage of data. 
 * @class storage
 */
define(["up/constants"], function (constants) {
	
	var storage = {

		/**
		 * Stored a pair (key, value) in the data store. 
		 * It will over-write the previous value if the key already exists in the data store.  
		 * @param id Key to be stored. 
		 * @param value Value to be stored. 
		 * @method storeValue
		 */
		storeValue: function(id, value){
			localStorage.setItem(constants.STORAGE_PREFIX + id, value);
                        if(id === constants.LOGGING_LEVEL) {
                            var toStore = {};
                            toStore[constants.STORAGE_PREFIX + id] = value;
                            chrome.storage.sync.set(toStore);
                        }
		},
		
		/**
		 * Retrieves the value corresponding to a given key from the data store. 
		 * @param {String} id Key of the value to be retrieved. 
		 * @returns {String} Value corresponding to the key. 
		 * @method getStoredValue
		 */
		getStoredValue: function(id){
			var value = localStorage.getItem(constants.STORAGE_PREFIX + id);
			if (value == "null"){ value = null; } // FIXME Not clear why the value is sometimes equal to "null" (instead of null)
			return value;
		},
		
		/**
		 * Retrieves the JSON value corresponding to a given key from the data store. 
		 * @param {String} key Key of the value to be retrieved. 
		 * @returns {String} JSON value corresponding to the key. 
		 * @method getStoredJson
		 */
		getStoredJson: function(key){ 
			var jsonString = this.getStoredValue(key);
			if (jsonString == null){
				jsonString = "[]"; // FIXME change with "{}" or ""
			}
			return JSON.parse(jsonString);
		},
		
		/**
		 * Saves an input element in the data store.  
		 * Its id is used as the key, and its value as the value. 
		 * @param {Element} inputElement Input element to be saved.  
		 * @method saveInput
		 */
		saveInput: function(inputElement){
			var inputElementId = inputElement.getAttribute("id");
			this.storeValue(inputElementId, inputElement.value);
		},
		
		/**
		 * Saves a button in the data store. 
		 * Its parent's id is used as the key, and its index in the button group as the value. 
		 * @param {Element} button Button to be saved. 
		 * @method saveButton
		 */
		saveButton: function(button){
			var children = button.parentNode.children;
			var buttonGroupId = button.parentNode.getAttribute("id");
			for (var i = 0 ; i < children.length ; i++){
				var child = children[i];
				if (child.textContent == button.textContent){ // the current child is the button that was clicked on
					this.storeValue(buttonGroupId, i);
				}
			}
		}
	}
	
	return storage;
	
});