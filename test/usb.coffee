assert = require('assert')
util = require('util')
usb = require("../usb.js")

# AM01 is 16d0:0e1e
VID = 0x16d0;
PID = 0x0e1e;
devManufacturer = 'AtomMiner'

if typeof gc is 'function'
	# running with --expose-gc, do a sweep between tests so valgrind blames the right one
	afterEach -> gc()

describe 'Module USB', ->
	it 'should describe basic constants', ->
		assert.notEqual(usb, undefined, "usb must be undefined")
		assert.ok((usb.LIBUSB_CLASS_PER_INTERFACE != undefined), "Constants must be described")
		assert.ok((usb.LIBUSB_ENDPOINT_IN == 128))

	it 'should handle abuse without crashing', ->
		assert.throws -> new usb.Device()
		assert.throws -> usb.Device()
		assert.throws -> usb.Device.prototype.open.call({})

	describe 'setDebugLevel', ->
		it 'should throw when passed invalid args', ->
			assert.throws((-> usb.setDebugLevel()), TypeError)
			assert.throws((-> usb.setDebugLevel(-1)), TypeError)
			assert.throws((-> usb.setDebugLevel(5)), TypeError)

		it 'should succeed with good args', ->
			assert.doesNotThrow(-> usb.setDebugLevel(0))

describe 'getDeviceList', ->
	it 'should return at least one device', ->
		l = usb.getDeviceList()
		assert.ok((l.length > 0))

describe 'findByIds', ->
	it 'should return an array with length > 0', ->
		dev = usb.findByIds(VID, PID)
		assert.ok(dev, "Demo device is not attached")


describe 'Device', ->
	device = null
	before ->
		device = usb.findByIds(VID, PID)

	it 'should have sane properties', ->
		assert.ok((device.busNumber > 0), "busNumber must be larger than 0")
		assert.ok((device.deviceAddress > 0), "deviceAddress must be larger than 0")
		assert.ok((util.isArray(device.portNumbers)), "portNumbers must be an array")

	it 'should have a deviceDescriptor property', ->
		assert.ok(((deviceDesc = device.deviceDescriptor) != undefined))

	it 'should have a configDescriptor property', ->
		assert.ok(device.configDescriptor != undefined)

	it 'should open', ->
		device.open()

	it 'gets string descriptors', (done) ->
		device.getStringDescriptor device.deviceDescriptor.iManufacturer, (e, s) ->
			assert.ok(e == undefined, e)
			assert.equal(s, devManufacturer)
			done()

	describe 'control transfer', ->
		b = Buffer.from([0x30...0x40])
		# AM01 doesn't have predefined OUT endpoint readily available. todo
		# it 'should OUT transfer when the IN bit is not set', (done) ->
		# 	device.controlTransfer 0x40, 0x81, 0, 0, b, (e) ->
		# 		assert.ok(e == undefined, e)
		# 		done()

		it "should fail when bmRequestType doesn't match buffer / length", ->
			assert.throws(-> device.controlTransfer(0x40, 0x81, 0, 0, 64, () => {}))

		# AM01 doesn't have predefined IN endpoint readily available. todo
		# it 'should IN transfer when the IN bit is set', (done) ->
		# 	device.controlTransfer 0xc0, 0x81, 0, 0, 128, (e, d) ->
		# 		#console.log("ControlTransferIn", d, e)
		# 		assert.ok(e == undefined, e)
		# 		assert.equal(d.toString(), b.toString())
		# 		done()

		it 'should signal errors', (done) ->
			device.controlTransfer 0xc0, 0xff, 0, 0, 64, (e, d) ->
				assert.equal e.errno, usb.LIBUSB_TRANSFER_STALL
				done()

	describe 'Interface', ->
		iface = null
		before ->
			iface = device.interfaces[0]
			iface.claim()

		it 'should have one interface', ->
			assert.notEqual(iface, undefined)

		it 'should be the same as the interfaceNo 0', ->
			assert.strictEqual iface, device.interface(0)

		if process.platform == 'linux'
			it "shouldn't have a kernel driver", ->
				assert.equal iface.isKernelDriverActive(), false

			it "should fail to detach the kernel driver", ->
				assert.throws -> iface.detachKernelDriver()

			it "should fail to attach the kernel driver", ->
				assert.throws -> iface.attachKernelDriver()

		describe 'IN endpoint', ->
			inEndpoint = null
			before ->
				inEndpoint = iface.endpoints[0]

		# 	it 'should be able to get the endpoint', ->
		# 		assert.ok inEndpoint?

		# 	it 'should be able to get the endpoint by address', ->
		# 		assert.equal(inEndpoint, iface.endpoint(0x81))

		# 	it 'should have the IN direction flag', ->
		# 		assert.equal(inEndpoint.direction, 'in')

		# 	it 'should have a descriptor', ->
		# 		assert.equal(inEndpoint.descriptor.bEndpointAddress, 0x81)
		# 		assert.equal(inEndpoint.descriptor.wMaxPacketSize, 64)

			it 'should fail to write', ->
				assert.throws -> inEndpoint.transfer(b)

		# 	it 'should support read', (done) ->
		# 		inEndpoint.transfer 64, (e, d) ->
		# 			assert.ok(e == undefined, e)
		# 			assert.ok(d.length == 64)
		# 			done()

		# 	it 'times out', (done) ->
		# 		iface.endpoints[2].timeout = 20
		# 		iface.endpoints[2].transfer 64, (e, d) ->
		# 			assert.equal e.errno, usb.LIBUSB_TRANSFER_TIMED_OUT
		# 			done()

		# 	it 'polls the device', (done) ->
		# 		pkts = 0

		# 		inEndpoint.startPoll 8, 64
		# 		inEndpoint.on 'data', (d) ->
		# 			assert.equal d.length, 64
		# 			pkts++

		# 			if pkts == 100
		# 				inEndpoint.stopPoll()

		# 		inEndpoint.on 'error', (e) ->
		# 			throw e

		# 		inEndpoint.on 'end', ->
		# 			#console.log("Stream stopped")
		# 			done()


		describe 'OUT endpoint', ->
			outEndpoint = null
			before ->
				outEndpoint = iface.endpoints[1]

			it 'should be able to get the endpoint', ->
				assert.ok outEndpoint?

			# todo
			# it 'should be able to get the endpoint by address', ->
			# 	assert.equal(outEndpoint, iface.endpoint(0x01))

			# it 'should have the OUT direction flag', ->
			# 	assert.equal(outEndpoint.direction, 'out')

			# it 'should support write', (done) ->
			# 	outEndpoint.transfer [1,2,3,4], (e) ->
			# 		assert.ok(e == undefined, e)
			# 		done()

			# it 'times out', (done) ->
			# 	iface.endpoints[3].timeout = 20
			# 	iface.endpoints[3].transfer [1,2,3,4], (e) ->
			# 		assert.equal e.errno, usb.LIBUSB_TRANSFER_TIMED_OUT
			# 		done()

		after (cb) ->
			iface.release(cb)

	after ->
		device.close()
