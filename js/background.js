var storageArea = chrome.storage.local;
var redirects = {};
var currentURL = "";
var lastBlockedURL = "";

function checkRedirects (details) {
    //only allow GET requests to be redirected
    if (details.method != 'GET') {
		return {};
	}
console.log(details);
		currentURL = details.initiator;

	console.log("-- checking: " + currentURL);
    for (var i = 0; i < redirects.length; i++) {
		var r = redirects[i];
		
		if (String(currentURL).includes(r.title.sourceURL) && !details.url.includes(r.title.sourceURL)) {
			console.log("blocking redirect from " + currentURL + " sourceURL: "+r.title.sourceURL);
			lastBlockedURL = details.url;
			return {cancel : true};
		}

	}
	
	//don't block if no rules match the URL
  	return {}; 
}

function onChange (changes) {
    //if the 'isDisabled' attribute was changed...
    if (changes.isDisabled) {
		updateIcon();
        //if the extension was disabled, remove the listeners
		if (changes.isDisabled.newValue == true) {
			console.log('Disabling Listener');
			chrome.webRequest.onBeforeRequest.removeListener(checkRedirects);
        } 
        //if the extension was enabled, set up the listeners
        else {
			console.log('Enabling Listener');
			setUpRedirectListener();
		}
	}
}
chrome.storage.onChanged.addListener(onChange);

function setUpRedirectListener () {
	//Unsubscribe all listeners to account for changes
    chrome.webRequest.onBeforeRequest.removeListener(checkRedirects); 

    storageArea.get({redirects:[]}, function(obj) {
		redirects = obj.redirects;
		if (redirects.length == 0) {
			console.log('No redirects defined, not setting up listener');
			return;
		}
		var filter = {
			urls: ["https://*/*", "http://*/*"],
			types : ["main_frame"]
		};
		chrome.webRequest.onBeforeRequest.addListener(checkRedirects, filter, ["blocking"]);
	});
}

//update icon badge
function updateIcon() {
	chrome.storage.local.get({isDisabled:false}, function(obj) {
		if (obj.isDisabled) {
			chrome.browserAction.setBadgeText({text: 'off'});
			chrome.browserAction.setBadgeBackgroundColor({color: '#fc5953'});
		} else {
			chrome.browserAction.setBadgeText({text: 'on'});
			chrome.browserAction.setBadgeBackgroundColor({color: '#35b44a'});
		}
	});	
}

//Try to close the tabs after they are blocked
/* 
chrome.tabs.onCreated.addListener(function(tab) {
	chrome.tabs.query({url:lastBlockedURL}, function(tabs){
		if(tabs && tabs.length > 0 ) {
			chrome.tabs.remove(tabs[0].id, function(){
				console.log("tab blocked with URL " + lastBlockedURL);
			});	
		}else {
			console.log("tab wasn't just blocked, do not close");
		}

	});
});
*/
updateIcon();
setUpRedirectListener();
