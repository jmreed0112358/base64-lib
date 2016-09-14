function InvalidStateException(message) {
	this.name = 'InvalidStateException';
	this.message = message || 
		'This function has not been implemented yet.';
	this.stack = (new Error()).stack;
}
InvalidStateException.prototype = Object.create(Error.prototype);
InvalidStateException.prototype.constructor = InvalidStateException;

module.exports = InvalidStateException;
