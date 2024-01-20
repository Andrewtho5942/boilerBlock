function createRedirect() {
    newRedirect = new Redirect();
    //update edit form title
    //el('#edit-redirect-form h3').textContent = 'Create Redirect';
	//el('#btn-save-redirect').setAttribute('disabled', 'disabled');

}

function cancelEdit() {
	activeRedirect = null;
}






















document.getElementById("create-btn").addEventListener('click', createRedirect);