(function() {
	/*
	 * On page load of the Github pull request page, we disable the merge button.
	 */
	document.querySelector(".merge-branch-action").setAttribute('disabled', 'disabled');

	/**
	 * When Github pull request page loads, get the current list.
	 * This code will run only if there is a persisted checklist. If all checklist items are checked, leave merge button enabled.
	 * @param  {Object} response The persisted checklist object. Consists of the label and whether it is checked or not
	 * @return void
	 */
	chrome.runtime.sendMessage({action: 'getList'}, function(response) {
		if(Array.isArray(response)) {
			var isChecked = response.every(function(item) {
				return item.checked === true;
			});

			if(isChecked) {
				document.querySelector(".merge-branch-action").removeAttribute('disabled');
			}
		}
	});
	
	/*
	 * Message listener for when the checklist is completed.
	 * Once the checklist is complete, we enable the Github pull request merge button
	 */
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.enabled === 'yes') {
			document.querySelector(".merge-branch-action").removeAttribute('disabled');
		}
	});

	/**
	 * When the merge button is selected, remove the checkmarks from the checklist.
	 * We utilize the sendMessage API to send the 'removeCheckmarks' to the background page
	 */
	document.querySelector(".merge-branch-action").addEventListener('click', function() {
		chrome.extension.sendMessage({action: 'removeCheckmarks'});
	}, false);
})();