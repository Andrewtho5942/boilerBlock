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
		var checkBox = document.createElement("input");
		var checkBoxText = document.createElement("label");

		editBtn.setAttribute("id", "edit" + i);
		deleteBtn.setAttribute("id", "delete" + i);
		editBtn.setAttribute("class", "form-button");
		deleteBtn.setAttribute("class", "form-button");
		checkBox.setAttribute("type", "checkbox");
		checkBox.setAttribute("class", "form-checkBox");
		checkBox.setAttribute("id", "checkBox" + i);
		checkBoxText.setAttribute("id", "checkBoxText" + i);

		editBtn.addEventListener('click', function() {
			var index = Number(this.id.substring(4));
			
			var remove = document.getElementById("redirect" + index);

			console.log(index + ", " + redirects[index].title.title + ", " + redirects[index].title.sourceURL);
			document.getElementById("title-form").value = redirects[index].title.title;
			document.getElementById("source-form").value = redirects[index].title.sourceURL;
			var whitelist = redirects[index].title.whitelist;
			if (whitelist == "No Whitelist") {
				document.getElementById("whitelist-form").value = "";
			} else {
				document.getElementById("whitelist-form").value = whitelist;
			}
			
			redirects.splice(index, 1);
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

		checkBox.addEventListener('click', function() {
			var index = Number(this.id.substring(8));
			redirects[index].isEnabled = !redirects[index].isEnabled;

			//update local storage
			storage.set({['redirects'] : redirects});
			updateForms();
		});

		checkBox.checked = !redirects[i].isEnabled;
		if(redirects[i].isEnabled) {
			console.log("text set to disabled");
			checkBoxText.textContent = "Disabled";
		}else{
			checkBoxText.textContent = " Enabled";
		}
		
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
		innerDiv.appendChild(checkBox);
		innerDiv.appendChild(checkBoxText);

		element.appendChild(innerDiv);
		
		elementArray.push(element);
		document.body.appendChild(element);
	}
}

function createRedirect() {
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
		"whitelist":whitelist,
		"isEnabled":false
		}
	));
	//clear the form
	sourceURLBox.value = '';
	titleBox.value = '';
	whitelistBox.value='';
	
	//update local storage
	storage.set({['redirects'] : redirects});
	updateForms();
	} else {
		//TODO warn the user to fill out the title and list for a new rule

	}
}


document.getElementById("new").addEventListener('click', createRedirect);	

//Redirect class
class Redirect {
	constructor(title, sourceURL, whitelist, isEnabled) {
		this.title = title || '';
		this.sourceURL = sourceURL || '';
		this.whitelist = whitelist || '';
		this.isEnabled = isEnabled || false;
	}
}
function pageLoad(){
	chrome.storage.local.get("redirects", function(result) {
		redirects = result.redirects || [];
		updateForms();
		console.log('Redirects Array from storage: ', redirects);
	  });
}

pageLoad();