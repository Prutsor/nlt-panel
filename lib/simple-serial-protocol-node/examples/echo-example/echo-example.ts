/// don't remove this line!
import {
    Baudrate,
    SimpleSerialProtocol,
    WriteCommandConfig,
    ReadCommandConfig
} from '@yesbotics/simple-serial-protocol-node';

export class EchoExampleApp {

    public run(portname: string, baudrate: Baudrate): void {

        // create instance
        const arduino: SimpleSerialProtocol = new SimpleSerialProtocol(portname, baudrate);

        // define command id and callback function
        const readConfig: ReadCommandConfig = new ReadCommandConfig(
            's',
            (
                byteValue: number,
                booleanValue: boolean,
                int8Value: number,
                uint8Value: number,
                int16Value: number,
                uint16Value: number,
                int32Value: number,
                uint32Value: number,
                int64Value: bigint,
                uint64Value: bigint,
                floatValue: number,
                charValue: string,
                stringValue1: string,
                stringValue2: string,
                stringValue3: string,
            ) => {
                console.log('Received several values from Arduino:');
                console.log('byteValue', byteValue);
                console.log('booleanValue', booleanValue);
                console.log('int8Value', int8Value);
                console.log('uint8Value', uint8Value);
                console.log('int16Value', int16Value);
                console.log('uint16Value', uint16Value);
                console.log('int32Value', int32Value);
                console.log('uint32Value', uint32Value);
                console.log('int64Value', int64Value);
                console.log('uint64Value', uint64Value);
                console.log('floatValue', floatValue);
                console.log('charValue', charValue);
                console.log('stringValue1', stringValue1);
                console.log('stringValue2', stringValue2);
                console.log('stringValue3', stringValue3);

                //gracefully close the connection
                arduino.dispose().catch((err) => {
                    console.error('Could not dispose. reason:', err);
                });
            }
        );

        // define expected dataytpes
        readConfig
            .addByteParam()
            .addBooleanParam()
            .addInt8Param()
            .addUInt8Param()
            .addInt16Param()
            .addUInt16Param()
            .addInt32Param()
            .addUInt32Param()
            .addInt64Param()
            .addUInt64Param()
            .addFloatParam()
            .addCharParam()
            .addStringParam()
            .addStringParam()
            .addStringParam();

        // register command with prepared config
        arduino.registerCommand(readConfig);

        // establish connection to arduino and wait 2 seconds
        // give arduino time to start after getting connected (and resetted too)
        arduino.init(2000)
            .catch((err) => {
                console.error('Could not init connection. reason:', err);
            })
            .then(() => {
                console.log('Arduino connected.');
                console.log('Send several values to Arduino');

                const command: WriteCommandConfig = new WriteCommandConfig('r');
                command
                    .addByteValue(0xff)
                    .addBooleanValue(true)
                    .addInt8Value(-128)
                    .addUInt8Value(255)
                    .addInt16Value(-32768)
                    .addUInt16Value(65523)
                    .addInt32Value(-2147483648)
                    .addUInt32Value(4294967295)

                    // For BigInt Support add `esnext` to your tsconfig lib section
                    .addInt64Value(BigInt(-2147483648000999))
                    .addUInt64Value(BigInt(7294967295000999))

                    .addFloatValue(-1.23456789101112)
                    .addCharValue('J')

                    .addStringValue("text1: Hey, I'm text one!")
                    .addStringValue("text2: And I am his brother text two!")
                    .addStringValue("text3: Nice!");

                arduino.writeCommand(command);
            });
    }
}

// entry point

const MY_PORTNAME: string = 'undefinedPortname'; // change this to your serial port name
const MY_BAUDRATE: Baudrate = 9600; // change this to your partner device's baudrate

const usedPortname: string = (MY_PORTNAME !== 'undefinedPortname' ? MY_PORTNAME : null) || process.argv[2];
const usedBaudrate: Baudrate = parseInt(process.argv[3]) || MY_BAUDRATE || 9600;

console.log('running echo example');
console.log('use portname:', usedPortname);
console.log('use baudrate:', usedBaudrate);

const echoExampleApp = new EchoExampleApp();
echoExampleApp.run(usedPortname, usedBaudrate);
