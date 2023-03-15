(() => {
	const dgram = require('dgram');
	const client = dgram.createSocket('udp4');
	const multicastAddress = '224.0.1.3';
	const multicastPort = 8266;
	const ip = require('quick-local-ip').getLocalIP4();

	window.devices = {};

	client.bind(multicastPort, ip, () => {
		server.setBroadcast(true);
		server.setMulticastTTL(128);
		server.addMembership(multicastAddress, ip);

		console.log('connected');
	});

	client.on('message', function (data, rinfo) {
		const id = data.readUInt8(0);

		if (id == 0) {
			const version = [data.readUint8(2), data.readUint8(3), data.readUint8(4)];

			window.devices[rinfo.address] = {
				rssi: data.readUint8(1),
				version: version.join('.'),
			};
		}
	});
})();
