/*
 * When the Crackle.js chrome extension is installed or updated
 * Run the following
 */
chrome.runtime.onInstalled.addListener(function() {
	/*
	 * Remove any rules previously setup
	 */
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		/*
		 * Add a rule 
		 */
		chrome.declarativeContent.onPageChanged.addRules([{
			/* 
			 * Conditions match when the host is github.com and the path contains "pull/"
			 */
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {
						hostEquals: 'github.com',
						pathContains: 'pull/'
					},
					css: [".tabnav-tabs"]
				})
			],
			/*
			 * Show page action if rule passes
			 */
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

/*
 * Persist Options
 * Set the list to null by default
 * 
 * Update the list whenever 'setList' is called with the checklist passed to it
 * Get the list whenever the 'getList' is called
 * Set the checkboxes off when 'removeCheckmarks' is called from content (by merging the PR)
 * Reset the list when 'resetList' is called 
 * 
 */
var list;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.action) {
		case 'setList':
			list = request.checklist;
			break;

		case 'getList':
			sendResponse(list);
			break;

		case 'removeCheckmarks':
			list.forEach(function(item) {
				item.checked = false;
			});
			break;
		case 'resetList':
			list = null;
			break;

		default: 
			list = null;
	}
});
