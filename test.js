const {
	SimpleSerialProtocol,
	WriteCommandConfig,
	ReadCommandConfig,
} = require('@yesbotics/simple-serial-protocol-node');

const baudrate = 9600;
const port = 'COM3';

const arduino = new SimpleSerialProtocol(port, baudrate);

arduino.registerCommand(
	new ReadCommandConfig('c', (r, g, b) => {
		console.log('received color', r, b, g);
	})
		.addUInt8Param()
		.addUInt8Param()
		.addUInt8Param()
);

arduino
	.init(2000)
	.catch((err) => {
		console.error('Could not init connection. reason:', err);
	})
	.then(() => {
		console.log('Arduino connected.');
	});
