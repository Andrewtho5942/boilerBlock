var redirects = [];
var elementArray = [];
var storage = chrome.storage.local;
var count = 0;

function updateForms() {
	for (var i = 0; i < elementArray.size; i++) {
		elementArray[i].remove();
		elementArray[i] = null;
	}
	for (var i = 0; i < count; i++) {
		var element = document.createElement("div");

		element.setAttribute("class", "card");
		element.setAttribute("id", "redirect" + i);

		var source = document.createElement("label");
		var whitelist = document.createElement("label");
		var deleteBtn = document.createElement("button");
		var editBtn = document.createElement("button");
		var titleText = document.createElement("h3");

		source.textContent = "Source URL: " + redirects[i].title.sourceURL;
		whitelist.textContent = "Whitelist: " + redirects[i].title.whitelist;
		deleteBtn.textContent = "Delete";
		editBtn.textContent = "Edit";
		titleText.textContent = redirects[i].title.title;
		titleText.setAttribute("class","cardTitle");

		//append the elements to the redirect div
		
		var innerDiv = document.createElement("div");

		element.appendChild(titleText);
		element.appendChild(document.createElement("br"));

		innerDiv.appendChild(source);
		innerDiv.appendChild(document.createElement("br"));
		innerDiv.appendChild(whitelist);
		innerDiv.appendChild(document.createElement("br"));
		innerDiv.appendChild(deleteBtn);
		innerDiv.appendChild(editBtn);
		innerDiv.appendChild(document.createElement("br"));

		element.appendChild(innerDiv);
		
		elementArray.push(element);
		document.body.appendChild(element);
	}
}

function createRedirect() {
    newRedirect = new Redirect();
	var sourceURLBox = document.getElementById("source-form");
	var sourceURL = sourceURLBox.value;

	var titleBox = document.getElementById("title-form");
	var title = titleBox.value;

	var whitelistBox = document.getElementById("whitelist-form");
	var whitelist = whitelistBox.value;
	redirects.push(new Redirect(
		{
		"title": title,
		"sourceURL":sourceURL,
		"whitelist":whitelist
		}
	));
	//clear the form
	sourceURLBox.value = '';
	titleBox.value = '';
	whitelistBox.value='';
	
	count++;
	updateForms();
}

function cancelEdit() {
	activeRedirect = null;
}


document.getElementById("new").addEventListener('click', createRedirect);

//Redirect class
class Redirect {
	constructor(title, sourceURL, whitelist) {
		this.title = title || '';
		this.sourceURL = sourceURL || '';
		this.whitelist = whitelist || '';
	}
}


chrome.storage.local.get("redirects", function(result) {
	var redirectsArray = result.redirects || [];
  
	// Now, redirectsArray contains the array you retrieved from storage
	console.log('Redirects Array:', redirectsArray);
  });
  