(function() {
	/**
	 * When popup loads, get the current list.
	 * If there is a persisted checklist, it will generate the checklist from the persisted checklist array. Response is the checklist.
	 * If there is not a persisted checklist, it will generate the checklist from the checklist values stored in Chrome storage.
	 * The chrome storage checklist only generates the items if a user has not checked off any item.
	 */
	chrome.extension.sendMessage({action: 'getList'}, function(response) {
		if(response && Array.isArray(response)) {
			response.forEach(function(val) {
				document.querySelector('#checklist').appendChild(generateListitem(val.label, val.checked));
			});
		} else {
			chrome.storage.sync.get("checklist", function(data) {
				if (!chrome.runtime.error) {
					if(data.checklist.length === 0) {
						document.querySelector('#checklist').innerHTML = '<li class="no-items">No items have been added to your checklist. <a href="/options.html" target="_blank">Setup your checklist</a></li>';
					}
				
					data.checklist.forEach(function(listItem) {
						document.querySelector('#checklist').appendChild(generateListitem(listItem, false));
					});	
					
				} else {
					console.error('Unable to pull back the checklist');
				}
			});
		}
	});

	/**
	 * Generate a crackle checklist item.
	 * @param  {String} text The crackle checklist text
	 * @param {Boolean} isChecked Boolean for whenever a checkbox is checked or not
	 * @return {Object} Returns a crackle checklist item object
	 */
	function generateListitem(text, isChecked) {
		var li = document.createElement('li');

		li.innerHTML = '<input type="checkbox"></input> <label>' + text + '</label> ';
		li.className = 'checkItem';
		
		if(isChecked) {
			li.querySelector('input').setAttribute('checked', 'checked');
			li.querySelector('label').className = 'checked';
		}

		li.querySelector('input').addEventListener('click', function(e) {
			verifyChecklist();
		}, false);

		return li;
	}

	/**
	 * Verifies that all checklist items have been checked
	 * If all items have been checked, then it calls a method to send a message to the page to enable the merge button
	 * @return void
	 */
	function verifyChecklist() {
		var isAllVerified = "yes",
			list = document.querySelectorAll('.checkItem'),
			listState = [];
		
		for (var i = 0; i < list.length; i++) {
			var checklistItem = list[i],
				checkedInput = checklistItem.querySelector('input'),
				checkedLabel = checklistItem.querySelector('label');

			if(checkedInput.checked) {
				checkedLabel.className = 'checked';	
			} else {
				checkedLabel.className = '';	
				isAllVerified = "no";
			}
			
			/*
			 * Build out list state for persistng the checklist.
			 * Only need to push the label and if the item has been checked or not.
			 */
			listState.push({
				label: checkedLabel.innerText,
				checked: checkedInput.checked
			});
		}

		/**
		 * Send the checklist state array to the background to persist. Useful when user navigates around the pull request page.
		 */
		chrome.extension.sendMessage({action: 'setList', checklist: listState}, function(response) {
			console.log(response);
		});

		enableMergeButton(isAllVerified);			
	}

	/**
	 * Sends a message to the page to enable the merge button on the github pull request page
	 * The message is caught in the content.js file
	 * @param  {String} flag Flag will be either "yes" or "no". If "yes", the merge button will be enabled
	 * @return void
	 */
	function enableMergeButton(flag) {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				enabled: flag
			}, function(response) {
				//response action
			});
		});
	}
})();