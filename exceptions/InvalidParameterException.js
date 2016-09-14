function InvalidParameterException(message) {
	this.name = 'InvalidParameterException';
	this.message = message || 
		'This function has not been implemented yet.';
	this.stack = (new Error()).stack;
}
InvalidParameterException.prototype = Object.create(Error.prototype);
InvalidParameterException.prototype.constructor = InvalidParameterException;

module.exports = InvalidParameterException;