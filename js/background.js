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
			    console.log('Redirecting ' + details.url + ' ===> ' + r.redirectUrl);
			    return { redirectUrl: r.redirectUrl };
        }
	}
  	return {}; 
}

function onChange (changes) {
    //if the 'disabled' attribute was changed...
    if (changes.disabled) {
        //if the extension was disabled, remove the listeners
		if (changes.disabled.newValue == true) {
			console.log('Disabling Redirector, removing listener');
			chrome.webRequest.onBeforeRequest.removeListener(checkRedirects);
        } 
        //if the extension was enabled, set up the listeners
        else {
			console.log('Enabling Redirector, setting up listener');
			setUpRedirectListener();
		}
	}
}
chrome.storage.onChanged.addListener(onChange);



function setUpRedirectListener () {
    chrome.webRequest.onBeforeRequest.removeListener(checkRedirects); //Unsubscribe first, in case there are changes...

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
