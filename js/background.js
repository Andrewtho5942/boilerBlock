var storageArea = chrome.storage.local;
var redirects = {};
var currentURL = "";
var lastBlockedURL = "";
var ignoreList = ["", "about:blank"];

function checkRedirects (details) {
    //only allow GET requests to be redirected
    if (details.method != 'GET') {
		return {};
	}

    for (var i = 0; i < redirects.length; i++) {
		var r = redirects[i];
		console.log("-- checking: " + currentURL + "includes " + r.title.sourceURL + " AND " + details.url + " DOESN'T INCLUDE " + r.title.sourceURL);
		if (String(currentURL).includes(r.title.sourceURL) && !details.url.includes(r.title.sourceURL) && !details.url.includes(r.title.whitelist)) {
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
	} else if (changes.redirects) {
		//redirects have been changed, redo the listeners
		chrome.webRequest.onBeforeRequest.removeListener(checkRedirects);
		setUpRedirectListener();
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

// Function to close a tab based on its URL
function closeTabByURL(url) {
	// Query tabs with the specified URL
	chrome.tabs.query({ url: url }, function(tabs) {
	  if (tabs && tabs.length > 0) {
		// Close the first tab with the specified URL
		chrome.tabs.remove(tabs[0].id, function(){
			if(chrome.runtime.lastError){
				console.log("no tab");
			}else{
				console.log("tab closed successfuly");
			}
		});
	  } else {
		console.log("No tab found with URL:", url);
	  }
	});
  }

function updateCurrentWebsite(url){
		if(!ignoreList.includes(url)){
			console.log("current website: "+ url);
			currentURL = url;
		}

	
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete" && tab.active) {
	  // Tab has finished loading and is active
	  updateCurrentWebsite(tab.url);
	}
	if (tab.url == lastBlockedURL) {
		console.log("close the blocked tab with url "+ tab.url);
		closeTabByURL(tab.url);
	}
  });
  
  // Listen for tab switches
  chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab) {
	  updateCurrentWebsite(tab.url);
	});
  });

  // Set up an initial check when the extension is loaded
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
	if (tabs[0]) {
	  updateCurrentWebsite(tabs[0].url);
	}
  });

// Listen for window creation events
chrome.windows.onCreated.addListener(function(window) {
	console.log("Window created:", window);
	
	for (var i = 0; i < redirects.length; i++) {
		var r = redirects[i];
		if (String(currentURL).includes(r.title.sourceURL)) {
			//close the window
			chrome.windows.remove(window.id,function(){
				console.log("lastError: "+chrome.runtime.lastError);
				if (chrome.runtime.lastError){
					console.log("no window");
				} 

			});
		}
	}
  });

updateIcon();
setUpRedirectListener();
