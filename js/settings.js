function createRedirect() {
    newRedirect = new Redirect();
    //update edit form title
    //el('#edit-redirect-form h3').textContent = 'Create Redirect';
	//showForm('#edit-redirect-form', activeRedirect);
	//el('#btn-save-redirect').setAttribute('disabled', 'disabled');
	

}

function cancelEdit() {
	activeRedirect = null;
	hideForm('#edit-redirect-form');
}


document.getElementById("new").addEventListener('click', createRedirect);