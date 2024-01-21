var redirects = [];
var elementArray = [];
var storage = chrome.storage.local;

function updateForms() {
	console.log("redirects at update:" + redirects);
	for (var i = 0; i < elementArray.length + 1; i++) {
		var remove = document.getElementById("redirect" + i);
		if (remove != null) {
			remove.remove();
		}
	}
	elementArray = [];
	for (var i = 0; i < redirects.length; i++) {
		var element = document.createElement("div");

		element.setAttribute("class", "card");
		element.setAttribute("id", "redirect" + i);

		var source = document.createElement("label");
		var whitelist = document.createElement("label");
		var deleteBtn = document.createElement("button");
		var editBtn = document.createElement("button");
		var titleText = document.createElement("h3");

		editBtn.setAttribute("id", "edit" + i);
		deleteBtn.setAttribute("id", "delete" + i);
		editBtn.setAttribute("class", "form-button");
		deleteBtn.setAttribute("class", "form-button");

		editBtn.addEventListener('click', function(){
			var index = Number(this.id.substring(4));
			redirects.splice(index, 1);

			var remove = document.getElementById("redirect" + index);
			remove.remove();
			elementArray.splice(index, 1);
			//update local storage
			storage.set({['redirects'] : redirects});
			updateForms();
		});

		deleteBtn.addEventListener('click', function() {
			var index = Number(this.id.substring(6));
			redirects.splice(index, 1);

			var remove = document.getElementById("redirect" + index);
			remove.remove();
			elementArray.splice(index, 1);
			//update local storage
			storage.set({['redirects'] : redirects});
			updateForms();
		});

		source.textContent = "| Source URL: " + redirects[i].title.sourceURL;
		whitelist.textContent = "| Whitelist: " + redirects[i].title.whitelist;
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
	if (whitelist == "") {
		whitelist = "No Whitelist";
	}
	if ((sourceURL != "") && (title != "")) {
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
	
	updateForms();
	//update local storage
	storage.set({['redirects'] : redirects});
	} else {
		//warn the user to fill out the title and list

	}
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
function pageLoad(){
	chrome.storage.local.get("redirects", function(result) {
		redirects = result.redirects || [];
		updateForms();

		// Now, redirectsArray contains the array you retrieved from storage
		console.log('Redirects Array from storage: ', redirects);
	  });
}

pageLoad();