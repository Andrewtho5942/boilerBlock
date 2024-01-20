var elementArray = [];

function updateForms() {

}

function createRedirect() {
    newRedirect = new Redirect();
    //update edit form title
    //el('#edit-redirect-form h3').textContent = 'Create Redirect';
	//el('#btn-save-redirect').setAttribute('disabled', 'disabled');
	var sourceURLBox = getElementById("source-from");
	var sourceURL = sourceURLBox.value;
	var titleBox = getElementById("title-from");
	var title = titleBox.value;
	var whitelistBox = getElementById("whitelist-from");
	var whitelist = whitelistBox.value;
	var newRedirect = new Redirect();
	newRedirect.sourceURL = sourceURL;
	newRedirect.description = title;
	newRedirect.whitelist = whitelist;
	redirects.push(newRedirect);
	sourceText.value = '';

	

}

function cancelEdit() {
	activeRedirect = null;
}


document.getElementById("new").addEventListener('click', createRedirect);