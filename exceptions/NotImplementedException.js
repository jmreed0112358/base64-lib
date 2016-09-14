function NotImplementedException(message) {
	this.name = 'NotImplementedException';
	this.message = message || 
		'This function has not been implemented yet.';
	this.stack = (new Error()).stack;
}
NotImplementedException.prototype = Object.create(Error.prototype);
NotImplementedException.prototype.constructor = NotImplementedException;

module.exports = NotImplementedException;