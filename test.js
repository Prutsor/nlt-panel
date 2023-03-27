(() => {
	const bonjour = require('bonjour')();

	// Browse for all services with type "nlt-panel"
	const browser = bonjour.find({ type: 'nlt-panel', protocol: 'tcp' });
	browser.on('up', (service) => {
		console.log(`Discovered service: ${service.host}:${service.port}`);
		console.log(`  - Version: ${service}`);
		console.log(service);
	});
})();
