
var elementArray = [];
var count = 0;

function updateForms() {
	for (var i = 0; i < elementArray.size; i++) {
		elementArray[i].remove();
		elementArray[i] = null;
	}
	for (var i = 0; i < count; i++) {
		var element = document.createElement("div");
		element.setAttribute("class", "redirect");
		element.setAttribute("id", "redirect" + i);
		elementArray.push(element);
		document.body.appendChild(element);
	}
}

function createRedirect() {
    newRedirect = new Redirect();
    //update edit form title
    //el('#edit-redirect-form h3').textContent = 'Create Redirect';
	//el('#btn-save-redirect').setAttribute('disabled', 'disabled');
	var sourceURLBox = document.getElementById("source-form");
	var sourceURL = sourceURLBox.value;
	var titleBox = document.getElementById("title-from");
	var title = titleBox.value;
	var whitelistBox = document.getElementById("whitelist-from");
	var whitelist = whitelistBox.value;
	var newRedirect = new Redirect();
	newRedirect.sourceURL = sourceURL;
	newRedirect.description = title;
	newRedirect.whitelist = whitelist;
	redirects.push(newRedirect);
	sourceText.value = '';
	count++;
	updateForms();
	

}

function cancelEdit() {
	activeRedirect = null;
}


document.getElementById("new").addEventListener('click', createRedirect);