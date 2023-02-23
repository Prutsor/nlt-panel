"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleSerialProtocol_1 = require("../SimpleSerialProtocol");
const ReadCommandConfig_1 = require("../ReadCommandConfig");
const SerialPort = require('@serialport/stream');
const MockBinding = require('@serialport/binding-mock');
// https://serialport.io/docs/api-binding-mock
SerialPort.Binding = MockBinding;
MockBinding.createPort('/dev/ROBOT', { echo: false, record: true, readyData: '' });
const ssp = new SimpleSerialProtocol_1.SimpleSerialProtocol("/dev/ROBOT", 9600);
beforeAll(() => {
});
describe("Reading data", () => {
    it("init", () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        try {
            yield ssp.init(1);
        }
        catch (e) {
            console.error(e);
        }
        expect(ssp.isOpen()).toBeTruthy();
        expect(ssp.isInitialized()).toBeTruthy();
    }));
    it("registerCommand", () => __awaiter(void 0, void 0, void 0, function* () {
        // expect.assertions(1);
        const readConfig = new ReadCommandConfig_1.ReadCommandConfig('a', (val) => {
        });
        readConfig.addInt8Param();
        ssp.registerCommand(readConfig);
        // expect(ssp.isOpen()).toBeTruthy();
    }));
});
//# sourceMappingURL=ssp.spec.js.map