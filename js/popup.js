var storageArea = chrome.storage.local;
var viewModel = {}; //used for databinding

var REDIRECTS = []; // The global redirects list...

var storage = chrome.storage.local;


function toggle(prop) {
  storage.get({[prop]: false}, function(obj) {
    storage.set({[prop] : !obj[prop]});
	viewModel[prop] = !obj[prop];
  });
}

function openSettings() {
  var url = chrome.extension.getURL('/settings.html');
  chrome.tabs.query({currentWindow:true}, function(tabs) {
	//search for an already open tab and open it instead if found	
	for (var i=0; i < tabs.length; i++) {
			if (tabs[i].url == url) {
				chrome.tabs.update(tabs[i].id, {active:true}, function(tab) {
					close();
				});
				return;
			}
		}

		//no open tab was found, so create a new one
		chrome.tabs.create({url:url, active:true});
	});

  return;
}

function pageLoad() {
	//load data from storage
	storage.get({isDisabled:false}, function(result) {
		viewModel = result;
		//bind data to the button
		document.getElementById("btnToggle").checked = viewModel["isDisabled"];
	});
	console.log("adding listeners");
	document.getElementById("btnToggle").addEventListener('click', () => toggle('isDisabled'));
	document.getElementById("settings-button").addEventListener('click', () => openSettings());
}

pageLoad();
//Setup page...


//Redirect class
class Redirect {
	constructor(title, sourceURL, whitelist) {
		this.title = title || '';
		this.sourceURL = sourceURL;
		this.whitelist = whitelist;
	}
}