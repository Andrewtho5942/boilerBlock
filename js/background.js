var storageArea = chrome.storage.local;
var redirects = {};

function checkRedirects (details) {
    
    //only allow GET requests to be redirected
    if (details.method != 'GET') {
		return {};
	}
    console.log("checking GET request");
    for (var i = 0; i < redirects.length; i++) {
		var r = redirects[i];
        console.log(r.includePattern);
		if(String(details.url).includes(r.includePattern)) {
			    console.log('Redirecting ' + details.url + ' ===> ' + r.redirectURL);
			    return { redirectURL: r.redirectURL };
        }
	}
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
updateIcon();
