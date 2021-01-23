/*! *****************************************************************************
Copyright (c) AtomMiner Ltd. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in the 
Software without restriction, including without limitation the rights to use, copy, 
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the 
following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
***************************************************************************** */

/**
 * Drop-in Promise wrapper. Use `null` or `undefined` as callback to get promise back.
 * 
 * Supports custom promise:
 * 
 * @example
 * ```javascript 
 * const usb = require('usb/promise');
 * const bluebird = require('bluebird');
 * usb.promise= bluebird;
 * 
 * const string1 = await device.getStringDescriptor(1);
 * ```
 */

const usb = require('./usb')

usb.Device.prototype.controlTransferCb = usb.Device.prototype.controlTransfer;
usb.Device.prototype.controlTransfer = function(bmRequestType, bRequest, wValue, wIndex, data_or_length, cb) {
	if(cb) return this.controlTransferCb(bmRequestType, bRequest, wValue, wIndex, data_or_length, cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		const cb = (target, err, buff) => {
			if(err) return reject(err);
			resolve(buff);
		}
		this.controlTransferCb(bmRequestType, bRequest, wValue, wIndex, data_or_length, cb);
	});
}

usb.Device.prototype.getStringDescriptorCb = usb.Device.prototype.getStringDescriptor;
usb.Device.prototype.getStringDescriptor = function(desc_index, cb) {
	if(cb) return this.getStringDescriptorCb(desc_index, cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		this.getStringDescriptorCb(desc_index, (err, buff) => {
			if(err) return reject(err);
			resolve(buff);
		})
	})
}

usb.Device.prototype.getBosDescriptorCb = usb.Device.prototype.getBosDescriptor;
usb.Device.prototype.getBosDescriptor = function(cb) {
	if(cb) return this.getBosDescriptorCb(cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		this.getBosDescriptorCb((error, data) => {
			if(error)return reject(error);
			resolve(data);
		})
	})
}

usb.Device.prototype.getCapabilitiesCb = usb.Device.prototype.getCapabilities;
usb.Device.prototype.getCapabilities = function(cb) {
	if(cb) return this.getCapabilitiesCb(cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		this.getCapabilitiesCb((error, data) => {
			if(error)return reject(error);
			resolve(data);
		})
	})
}

usb.Device.prototype.setConfigurationCb = usb.Device.prototype.setConfiguration;
usb.Device.prototype.setConfiguration = function(desired, cb) {
	if(cb) return this.setConfigurationCb(desired, cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		this.setConfigurationCb(desired, (data, err) => {
			if(err) return reject(err);
			resolve(data);
		});
	})
}

usb.Interface.prototype.setAltSettingCb = usb.Interface.prototype.setAltSetting;
usb.Interface.prototype.setAltSetting = function(altSetting, cb) {
	if(cb) return this.setAltSettingCb(altSetting, cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		this.setAltSettingCb(altSetting, (data, err) => {
			if(err) return reject(err);
			resolve(data);
		});
	})
}

usb.Endpoint.prototype.clearHaltCb = usb.Endpoint.prototype.clearHalt;
usb.Endpoint.prototype.clearHalt = function(cb) {
	if(cb) return this.clearHaltCb(cb)
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		return this.clearHaltCb((err) => {
			if(err) return reject(err);
			resolve();
		})
	})
}

usb.Endpoint.prototype.makeTransferCb = usb.Endpoint.prototype.makeTransfer;
usb.Endpoint.prototype.makeTransfer = function(timeout, cb){
	if(cb) return this.makeTransferCb(timeout, cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		this.makeTransferCb(timeout, (err, buff, actual) => {
			if(err) return reject(error);
			resolve(buff.slice(0, actual));
		});
	})
}

usb.InEndpoint.prototype.transferCb = usb.InEndpoint.prototype.transfer;
usb.InEndpoint.prototype.transfer = function(length, cb) {
	if(cb) return this.transfer(length, cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		return this.transfer(length, (self, err, buff) => {
			if(err) return reject(err);
			resolve(buff);
		});
	})
}

usb.OutEndpoint.prototype.transferCb = usb.OutEndpoint.prototype.transfer;
usb.OutEndpoint.prototype.transfer = function(buffer, cb) {
	if(cb) return this.transfer(length, cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		this.transfer(length, (self, err) => {
			if(err) return reject(err);
			resolve();
		});
	})
}

usb.OutEndpoint.prototype.transferWithZLPCb = usb.OutEndpoint.prototype.transferWithZLP;
usb.OutEndpoint.prototype.transferWithZLP = function (buf, cb) {
	if(cb) return this.transferWithZLP(buf, cb);
	const Promise = usb.Promise || global.Promise;
	if(!Promise) throw new Error('No Promise implementation available.');
	return new Promise((resolve, reject) => {
		this.transferWithZLP(buf, (self, err) => {
			if(err) return reject(err);
			resolve();
		});
	})
}

module.exports = usb;