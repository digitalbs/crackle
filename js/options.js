(function() {
	/*
	 * Global variables to be used 
	 */
	var options = document.querySelector('#crackle-options'),
		checklist = [];

	/*
	 * Events
	 */
	document.querySelector('#add-list-item').addEventListener('click', function(e) {
		//Build out list item
		createItem();

		//Remove checklist items setup
		removeItemSetup(document.querySelectorAll('.option'));

		e.preventDefault();
	}, false);

	/**
	 * Creates a checklist item for the Code Review list
	 * This will call the method to update the checklist in order to sync the new checklist item
	 * with the Chrome extension
	 */
	function createItem() {
		var clInput = document.querySelector('#cl-item'),
			checklistText = clInput.value,
			li = generateListitem(checklistText);

		options.appendChild(li);

		checklist.push(checklistText);
		updateChecklist();

		//reset checklist input value to empty
		clInput.value = "";
	}

	/**
	 * Builds a list item for the crackle checklist
	 * @param  {String} text The text of the item inputed as a checklist item
	 * @return {Object} Returns a built out list item object 
	 */
	function generateListitem(text) {
		var li = document.createElement('li');
		li.innerHTML = '<span class="remove">x</span> ' + text;
		li.className = 'option';
		li.querySelector('.remove').addEventListener('click', removeChecklistItem, false);

		return li;
	}

	/**
	 * Removes the checklist item from the Crackle Checklist
	 */
	function removeChecklistItem() {
		removeFromChecklistArry(this);
		options.removeChild(this.parentNode);			
	}

	/**
	 * Removes the checklist item from the internal Checklist array and then updates the chrome storage with the 
	 * item removed.
	 * 
	 * @param  {Object} checklistItem Checklist item to pull the text from.
	 * @return void
	 */
	function removeFromChecklistArry(checklistItem) {
		var checklistValueIndex = checklist.indexOf(checklistItem.parentNode.innerText.replace(' x', ''));
		checklist.splice(checklistValueIndex, 1);
		updateChecklist();
	}

	/**
	 * Updates the Chrome Storage with the most up to date checklist array. This storage is used to build out
	 * the actual Checklist whenever a Pull Request is reviewed
	 * 
	 */
	function updateChecklist() {
		chrome.storage.sync.set({'checklist': checklist }, function() {
			console.log('Checklist has been updated');
			chrome.extension.sendMessage({action: 'resetList'});
		});
	}

	/**
	 * It gets the Checklist out of Chrome Storage. This checklist data will build out the checklist 
	 * for crackle whenever a user accesses the options page. The standard setup is run here. We also set the 
	 * checklist array to the items that pull back from chrome storage. We loop through
	 * the checklist array and build out the list items. We also run the remove setup.
	 * 
	 * @param  {Object} data Data that returns when we access the checklist key from chrome storage
	 */
	chrome.storage.sync.get("checklist", function(data) {
		if (!chrome.runtime.error) {
			checklist = data.checklist;
			data.checklist.forEach(function(listItem) {
				//Build out Crackle Checklist
				options.appendChild(generateListitem(listItem));
			});
		} else {
			console.error('Unable to pull back the checklist');
		}
	});
})();