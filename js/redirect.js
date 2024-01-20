function Redirect(o) {
	this._init(o);
}

Redirect.prototype = {
	//attributes
	description : '',
	sourceUrl : '',
	destinationUrl : '',
	disabled : false,

	equals : function(redirect) {
		return this.description == redirect.description
			&& this.sourceUrl == redirect.sourceUrl
			&& this.destinationUrl == redirect.destinationUrl
	},
	_init : function(o) {
		o = o || {};
		this.description = o.description || '';
		this.sourceUrl = o.sourceUrl || '';
		this.destinationUrl = o.destinationUrl || '';
		this.disabled = o.disabled;
	}
}

export { Redirect };