var storageArea = chrome.storage.local;

var REDIRECTS = []; // The global redirects list...
function normalize(r) {
	return new Redirect(r).toObject(); //Cleans out any extra props, and adds default values for missing ones.
}
// Saves the entire list of redirects to storage.
function saveChanges() {

	// Clean them up so angular $$hash things and stuff don't get serialized.
	let arr = REDIRECTS.map(normalize);

	storageArea.set({'redirects' : arr});
}

var storage = chrome.storage.local;


function toggle(prop) {
  storage.get({[prop]: false}, function(obj) {
    storage.set({[prop] : !obj[prop]});
	console.log(!obj[prop]); //log new value
  }
  );
}

function openSettings() {
	//push a new redirect object for testing
	/*console.log("pushing new redirect!");
	REDIRECTS.push(new Redirect(
		{
			"description": "Example redirect",
			"sourceUrl": "https://www.yahoo.com",
			"destinationUrl": "https://www.reddit.com/",
			"disabled": false
		}
	));
	saveChanges();
*/

  var url = chrome.extension.getURL('../settings.html');
  
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


	document.getElementById("btnToggle").addEventListener('click', () => toggle('disabled'));
	document.getElementById("settings-button").addEventListener('click', () => openSettings());
}

pageLoad();
//Setup page...


//Redirect class
class Redirect {
	constructor(description, sourceURL, destinationURL, isDisabled) {
		this.description = description || '';
		this.sourceURL = sourceURL || '';
		this.destinationURL = destinationURL || '';
		this.isDisabled = isDisabled || false;
	}
	equals(redirect) {
		return (this.description == redirect.description
		&& this.sourceUrl == redirect.sourceUrl
		&& this.destinationUrl == redirect.destinationUrl);
	}
}