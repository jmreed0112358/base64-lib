'use strict';

var NotImplementedException = require('./exceptions/NotImplementedException.js'),
  InvalidParameterException = require('./exceptions/InvalidParameterException.js'),
  InvalidStateException = require('./exceptions/InvalidStateException.js');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  lookup = [],
  fullmask = 0xFFFFFFFFF, // 24 bits
  mask = 0x3F; // 6-bit.

var Base64 = function () {
  // Build lookup array.
  for (var i = 0 ; i < alphabet.length ; i++) {
    lookup[alphabet[i]] = i;
  }

  lookup['='] = 0;
};

Base64.prototype.getSegments = function (dataLength, number, i, pads) {
  var output = '',
    segment = 0;

  if (i === dataLength - 3 && pads !== 0) {
      if (pads === 1) {
        segment = (number >> 18) & mask;
        output += alphabet[segment];
        segment = (number >> 12) & mask;
        output += alphabet[segment];
        segment = (number >> 6) & mask;
        output += alphabet[segment];
        output += '=';
      } else if (pads === 2) {
        segment = (number >> 18) & mask;
        output += alphabet[segment];
        segment = (number >> 12) & mask;
        output += alphabet[segment];
        output += '=';
        output += '=';
      } else {
        throw new InvalidStateException('pads had invalid value???');
      }
    } else {
      segment = (number >> 18) & mask;
      output += alphabet[segment];
      segment = (number >> 12) & mask;
      output += alphabet[segment];
      segment = (number >> 6) & mask;
      output += alphabet[segment];
      segment = number & mask;
      output += alphabet[segment];
    }

    return output;
};

Base64.prototype.getPadCount = function (b64string) {
  var pads = 0,
    i = 0;

  for (i = 0 ; i < b64string.length ; i++) {
    if (b64string[i] === '=') {
      pads += 1;
    }
  }

  return pads;
};

Base64.prototype.encode = function (input) {
  var buffer,
    uint8View,
    uint16View,
    i = 0,
    pads = 0,
    output = '';

  // Determine how many bytes of padding we need.
  if ((input.length * 2) % 3 !== 0) {
    pads = 3 - (input.length % 3);
  }

  // Create ArrayBuffer and views.
  buffer = new ArrayBuffer(input.length + pads);
  uint8View = new Uint8Array(buffer);

  // Load ArrayBuffer with data.
  for (i = 0 ; i < uint8View.length ; i++) {
      uint8View[i] = input[i];
  }

  // Process 24 bit chunks.  Iterate through uint8View array 3 bytes at a time.
  for (i = 0 ; i < uint8View.length ; i += 3) {
    var chunks = new Uint8Array(buffer, i, 3),
      number = 0;

    // Build 24 bit number.
    number = chunks[0];
    number = number << 8;
    number += chunks[1];
    number = number << 8;
    number += chunks[2];

    // This section could be in a separate function.
    output += this.getSegments(uint8View.length, number, i, pads);
  }

  return output;
};

Base64.prototype.decode = function (b64string) {
  var output = [],
    pads = 0,
    i = 0;

  if ( b64string.length % 4 !== 0) {
    throw new InvalidParameterException('b64string length must be a multiple of 4');
  }

  pads = this.getPadCount(b64string);

  // Process segments, generate bytes.
  for (i = 0 ; i < b64string.length ; i = i + 4) {
    var number = 0;

    number += lookup[b64string[i]];
    number = number << 6;
    number += lookup[b64string[i+1]];
    number = number << 6;
    number += lookup[b64string[i+2]];
    number = number << 6;
    number += lookup[b64string[i+3]];

    if (i !== b64string.length - 4) {
      output.push((number & 0xff0000) >> 16);
      output.push((number & 0x00ff00) >> 8);
      output.push(number & 0x0000ff);
    } else {
      if (pads === 0) {
        output.push((number & 0xff0000) >> 16);
        output.push((number & 0x00ff00) >> 8);
        output.push(number & 0x0000ff);
      } else if (pads === 1) {
        output.push((number & 0xff0000) >> 16);
        output.push((number & 0x00ff00) >> 8);
      } else if (pads === 2) {
        output.push((number & 0xff0000) >> 16);
      } else {
        throw new InvalidStateException('Invalid number of pads');
      }
    }
  }

  return new Uint8Array(output);
};

Base64.prototype.mapStringToByteArray = function (input) {
  var buffer = new ArrayBuffer(input.length * 2),
    uint8View = new Uint8Array(buffer),
    uint16View = new Uint16Array(buffer),
    i = 0;

  for (i = 0 ; i < input.length ; i++) {
    uint16View[i] = input[i].charCodeAt(0);
  }

  return uint8View;
};

Base64.prototype.mapByteArrayToString = function (input) {
  var buffer = new ArrayBuffer(input.length),
    uint16View = new Uint16Array(buffer),
    uint8View = new Uint8Array(buffer),
    output = '',
    i = 0;

  for (i = 0 ; i < input.length ; i++) {
    uint8View[i] = input[i];
  }

  for (i = 0 ; i < uint16View.length ; i++ ) {
    output += String.fromCharCode(uint16View[i]);
  }

  return output;
};

module.exports = Base64;
