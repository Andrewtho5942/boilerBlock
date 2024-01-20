var isFirefox = !!navigator.userAgent.match(/Firefox/i);

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

		//partitionedRedirects = createPartitionedRedirects(redirects);
		var filter = createFilter(redirects);

		console.log('Setting filter for listener: ' + JSON.stringify(filter));
		chrome.webRequest.onBeforeRequest.addListener(checkRedirects, filter, ["blocking"]);
	});
}
//Creates a filter to pass to the listener so we don't have to run through
//all the redirects for all the request types we don't have any redirects for anyway.
function createFilter(redirects) {
	var types = [];
	for (var i = 0; i < redirects.length; i++) {
		redirects[i].appliesTo.forEach(function(type) { 
			if(chrome.webRequest.ResourceType[type.toUpperCase()]!== undefined){
			if (types.indexOf(type) == -1) {
				types.push(type);
			}
		}
		});
	}
	types.sort();

	return {
		urls: ["https://*/*", "http://*/*"],
		types : types
	};
}
