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
var viewModel = {}; //used for databinding

function toggle(prop) {
  storage.get({[prop]: false}, function(obj) {
    storage.set({[prop] : !obj[prop]});
    viewModel[prop] = !obj[prop];
    //dataBind(document.body, viewModel);

	console.log(viewModel[prop]); //log new value
  }
  );
}

function openSettings() {
	//push a new redirect object for testing
	console.log("pushing new redirect!");
	REDIRECTS.push(new Redirect(
		{
			"description": "Example redirect",
			"exampleUrl": "https://www.yahoo.com/",
			"exampleResult": "result",
			"error": null,
			"includePattern": "https://www.yahoo.com",
			"excludePattern": "",
			"patternDesc": "Any word after example.com leads to google search for that word.",
			"redirectUrl": "https://www.reddit.com/",
			"patternType": "W",
			"processMatches": "noProcessing",
			"disabled": false,
			"appliesTo": [
				"main_frame"
			]
		}
	));
	saveChanges();

/*
  var url = chrome.extension.getURL('public/settings.html');
  
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
  */
}

function pageLoad() {
	storage.get({logging:false, enableNotifications:false, disabled: false}, function(obj) {
		viewModel = obj;
		//dataBind(document.body, viewModel);
	})
 
	document.getElementById("clickBtn").addEventListener('click', () => toggle('disabled'));
	document.getElementById("newPage").addEventListener('click', () => openSettings());
}

pageLoad();
//Setup page...


function dataBind(el, dataObject) {

	function boolValue(prop) {
		return prop.charAt(0) === '!' ? !dataObject[prop.substr(1)] : dataObject[prop];
	}

    if (typeof el === 'string') {
		el = document.querySelector(el)
	}
	for (let tag of el.querySelectorAll('[data-bind]')) {
			let prop = tag.getAttribute('data-bind');
		if (tag.tagName.toLowerCase() === 'input') {
			if (tag.getAttribute('type').toLowerCase() === 'radio') {
				tag.checked = dataObject[prop] === tag.getAttribute('value');
            } else if (tag.getAttribute('type').toLowerCase() === 'checkbox') {
                tag.checked = dataObject[prop];
            } else {
                tag.value = dataObject[prop];
			}
		} else if (tag.tagName.toLowerCase() === 'select') {
			for (let opt of tag.querySelectorAll('option')) {
				if (opt.getAttribute('value') === dataObject[prop]) {
					opt.setAttribute('selected', 'selected');
				} else {
					opt.removeAttribute('selected');
				}
			}
		} else if (Array.isArray(dataObject[prop])) {
			//Array of values, check any checkboxes in child elements
			for (let checkbox of tag.querySelectorAll('input[type="checkbox"')) {
				checkbox.checked = dataObject[prop].includes(checkbox.getAttribute('value'));
			}

		} else {
			tag.textContent = dataObject[prop];
		}
	}
	for (let tag of el.querySelectorAll('[data-show]')) {
		let shouldShow = boolValue(tag.getAttribute('data-show'));
		tag.style.display = shouldShow ? '' : 'none';
	}
	for (let tag of el.querySelectorAll('[data-disabled]')) {
		let isDisabled = boolValue(tag.getAttribute('data-disabled'));

		if (isDisabled) {
			tag.classList.add('disabled');
			tag.setAttribute('disabled', 'disabled');
		} else {
			tag.classList.remove('disabled');
			tag.removeAttribute('disabled');
		}
	}
	for (let tag of el.querySelectorAll('[data-class]')) {
		let [className, prop] = tag.getAttribute('data-class').split(':');
		let shouldHaveClass = boolValue(prop);
		if (shouldHaveClass) {
			tag.classList.add(className);
		} else {
			tag.classList.remove(className);
		}
	}
}

function Redirect(o) {
	this._init(o);
}

//temp, allow addon sdk to require this.
if (typeof exports !== 'undefined') {
	exports.Redirect = Redirect;
}

//Static
Redirect.WILDCARD = 'W';
Redirect.REGEX = 'R';

Redirect.requestTypes = {
	main_frame: "Main window (address bar)",
	sub_frame: "IFrames",
	stylesheet : "Stylesheets",
	font: "Fonts",
	script : "Scripts",
	image : "Images",
	imageset: "Responsive Images in Firefox",
	object : "Objects (e.g. Flash content, Java applets)",
	object_subrequest : "Object subrequests",
	xmlhttprequest : "XMLHttpRequests (Ajax)",
	history : "HistoryState",
	other : "Other"
	};

Redirect.prototype = {

	//attributes
	description : '',
	exampleUrl : '',
	exampleResult : '',
	error : null,
	includePattern : '',
	excludePattern : '',
	patternDesc:'',
	redirectUrl : '',
	patternType : '',
	processMatches : 'noProcessing',
	disabled : false,
	grouped: false,

	compile : function() {

		var incPattern = this._preparePattern(this.includePattern);
		var excPattern = this._preparePattern(this.excludePattern);

		if (incPattern) {
			this._rxInclude = new RegExp(incPattern, 'gi');
		}
		if (excPattern) {
			this._rxExclude = new RegExp(excPattern, 'gi');
		}
	},

	equals : function(redirect) {
		return this.description == redirect.description
			&& this.exampleUrl == redirect.exampleUrl
			&& this.includePattern == redirect.includePattern
			&& this.excludePattern == redirect.excludePattern
			&& this.patternDesc == redirect.patternDesc
			&& this.redirectUrl == redirect.redirectUrl
			&& this.patternType == redirect.patternType
			&& this.processMatches == redirect.processMatches
			&& this.appliesTo.toString() == redirect.appliesTo.toString();
	},

	toObject : function() {
		return {
			description : this.description,
			exampleUrl : this.exampleUrl,
			exampleResult : this.exampleResult,
			error : this.error,
			includePattern : this.includePattern,
			excludePattern : this.excludePattern,
			patternDesc : this.patternDesc,
			redirectUrl : this.redirectUrl,
			patternType : this.patternType,
			processMatches : this.processMatches,
			disabled : this.disabled,
			grouped: this.grouped,
			appliesTo : this.appliesTo.slice(0)
		};
	},

	getMatch: function(url, forceIgnoreDisabled) {
		if (!this._rxInclude) {
			this.compile();
		}
		var result = {
			isMatch : false,
			isExcludeMatch : false,
			isDisabledMatch : false,
			redirectTo : '',
			toString : function() { return JSON.stringify(this); }
		};
		var redirectTo = this._includeMatch(url);

		if (redirectTo !== null) {
			if (this.disabled && !forceIgnoreDisabled) {
				result.isDisabledMatch = true;
			} else if (this._excludeMatch(url)) {
				result.isExcludeMatch = true;
			} else {
				result.isMatch = true;
				result.redirectTo = redirectTo;
			}
		}
		return result;
	},

	//Updates the .exampleResult field or the .error
	//field depending on if the example url and patterns match
	//and make a good redirect
	updateExampleResult : function() {

		//Default values
		this.error = null;
		this.exampleResult = '';


		if (!this.exampleUrl) {
			this.error = 'No example URL defined.';
			return;
		}

		if (this.patternType == Redirect.REGEX && this.includePattern) {
			try {
				new RegExp(this.includePattern, 'gi');
			} catch(e) {
				this.error = 'Invalid regular expression in Include pattern.';
				return;
			}
		}

		if (this.patternType == Redirect.REGEX && this.excludePattern) {
			try {
				new RegExp(this.excludePattern, 'gi');
			} catch(e) {
				this.error = 'Invalid regular expression in Exclude pattern.';
				return;
			}
		}

		if (!this.appliesTo || this.appliesTo.length == 0) {
			this.error = 'At least one request type must be chosen.';
			return;
		}

		this.compile();

		var match = this.getMatch(this.exampleUrl, true);

		if (match.isExcludeMatch) {
			this.error = 'The exclude pattern excludes the example url.'
			return;
		}

		//Commented out because this code prevents saving many types of valid redirects.
		//if (match.isMatch && !match.redirectTo.match(/^https?\:\/\//)) {
		//	this.error = 'The redirect result must start with http:// or https://, current result is: "' + match.redirectTo;
		//	return;
		//}

	if (!match.isMatch) {
			this.error = 'The include pattern does not match the example url.';
			return;
		}

		this.exampleResult = match.redirectTo;
	},

	isRegex: function() {
		return this.patternType == Redirect.REGEX;
	},

	isWildcard : function() {
		return this.patternType == Redirect.WILDCARD;
	},

	test : function() {
		return this.getMatch(this.exampleUrl);
	},

	//Private functions below
	_rxInclude : null,
	_rxExclude : null,

	_preparePattern : function(pattern) {
		if (!pattern) {
			return null;
		}
		if (this.patternType == Redirect.REGEX) {
			return pattern;
		} else { //Convert wildcard to regex pattern
			var converted = '^';
			for (var i = 0; i < pattern.length; i++) {
				var ch = pattern.charAt(i);
				if ('()[]{}?.^$\\+'.indexOf(ch) != -1) {
					converted += '\\' + ch;
				} else if (ch == '*') {
					converted += '(.*?)';
				} else {
					converted += ch;
				}
			}
			converted += '$';
			return converted;
		}
	},

	_init : function(o) {
		o = o || {};
		this.description = o.description || '';
		this.exampleUrl = o.exampleUrl || '';
		this.exampleResult = o.exampleResult || '';
		this.error = o.error || null;
		this.includePattern = o.includePattern || '';
		this.excludePattern = o.excludePattern || '';
		this.redirectUrl = o.redirectUrl || '';
		this.patternType = o.patternType || Redirect.WILDCARD;

		this.patternTypeText = this.patternType == 'W' ? 'Wildcard' : 'Regular Expression'

		this.patternDesc = o.patternDesc || '';
		this.processMatches = o.processMatches || 'noProcessing';
		if (!o.processMatches && o.unescapeMatches) {
			this.processMatches = 'urlDecode';
		}
		if (!o.processMatches && o.escapeMatches) {
			this.processMatches = 'urlEncode';
		}

		this.disabled = !!o.disabled;
		if (o.appliesTo && o.appliesTo.length) {
			this.appliesTo = o.appliesTo.slice(0);
		} else {
			this.appliesTo = ['main_frame'];
		}
	},

	get appliesToText() {
		return this.appliesTo.map(type => Redirect.requestTypes[type]).join(', ');
	},

	get processMatchesExampleText() {
		let examples = {
			noProcessing : 'Use matches as they are',
			urlEncode : 'E.g. turn /bar/foo?x=2 into %2Fbar%2Ffoo%3Fx%3D2',
			urlDecode : 'E.g. turn %2Fbar%2Ffoo%3Fx%3D2 into /bar/foo?x=2',
			doubleUrlDecode : 'E.g. turn %252Fbar%252Ffoo%253Fx%253D2 into /bar/foo?x=2',
			base64Decode : 'E.g. turn aHR0cDovL2Nubi5jb20= into http://cnn.com'
		};

		return examples[this.processMatches];
	},

	toString : function() {
		return JSON.stringify(this.toObject(), null, 2);
	},

	_includeMatch : function(url) {
		if (!this._rxInclude) {
			return null;
		}
		var matches = this._rxInclude.exec(url);
		if (!matches) {
			return null;
		}
		var resultUrl = this.redirectUrl;
		for (var i = matches.length - 1; i > 0; i--) {
			var repl = matches[i] || '';
			if (this.processMatches == 'urlDecode') {
				repl = unescape(repl);
			} else if (this.processMatches == 'doubleUrlDecode') {
				repl = unescape(unescape(repl));
			} else if (this.processMatches == 'urlEncode') {
				repl = encodeURIComponent(repl);
			} else if (this.processMatches == 'base64decode') {
				if (repl.indexOf('%') > -1) {
					repl = unescape(repl);
				}
				repl = atob(repl);
			}
			resultUrl = resultUrl.replace(new RegExp('\\$' + i, 'gi'), repl);
		}
		this._rxInclude.lastIndex = 0;
		return resultUrl;
	},

	_excludeMatch : function(url) {
		if (!this._rxExclude) {
			return false;
		}
		var shouldExclude = this._rxExclude.test(url);
		this._rxExclude.lastIndex = 0;
		return shouldExclude;
	}
};
