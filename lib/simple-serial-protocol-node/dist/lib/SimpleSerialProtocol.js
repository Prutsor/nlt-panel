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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = __importDefault(require("serialport"));
const parser_byte_length_1 = __importDefault(require("@serialport/parser-byte-length"));
const RegisteredCommand_1 = require("./RegisteredCommand");
const SimpleSerialProtocolError_1 = require("./SimpleSerialProtocolError");
const ParamsParser_1 = require("./ParamsParser");
const ParamTypeChar_1 = require("./types/ParamTypeChar");
const ParamTypeString_1 = require("./types/ParamTypeString");
const ParamTypeFloat_1 = require("./types/ParamTypeFloat");
const ParamTypeBoolean_1 = require("./types/ParamTypeBoolean");
const ParamTypeInt8_1 = require("./types/ParamTypeInt8");
const ParamTypeInt16_1 = require("./types/ParamTypeInt16");
const ParamTypeInt32_1 = require("./types/ParamTypeInt32");
const ParamTypeUnsignedInt8_1 = require("./types/ParamTypeUnsignedInt8");
const ParamTypeUnsignedInt16_1 = require("./types/ParamTypeUnsignedInt16");
const ParamTypeUnsignedInt32_1 = require("./types/ParamTypeUnsignedInt32");
const ParamTypeByte_1 = require("./types/ParamTypeByte");
const ParamTypeUnsignedInt64_1 = require("./types/ParamTypeUnsignedInt64");
const ParamTypeInt64_1 = require("./types/ParamTypeInt64");
const ReadCommandConfig_1 = require("./ReadCommandConfig");
const WriteCommandConfig_1 = require("./WriteCommandConfig");
class SimpleSerialProtocol {
    constructor(portname, baudrate) {
        this._isInitialized = false;
        this.registeredCommands = new Map();
        this.paramTypeInstances = new Map();
        this.initParamTypes();

        this.serialPort = new serialport_1.SerialPort({
            path: portname,
            autoOpen: false,
            baudRate: baudrate
        });
    }
    init(initilizationDelay = 2500) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isOpen()) {
                return Promise.reject('already connected');
            }
            this.oneByteParser = this.serialPort.pipe(new serialport_1.ByteLengthParser({ length: 1 }));
            this.oneByteParser.on('data', this.onData.bind(this));
            this.serialPort.open((err) => {
                if (err) {
                    this.dispose()
                        .catch(() => {
                        throw err;
                    })
                        .then(() => {
                        throw err;
                    });
                }
            });
            const promiseOpen = new Promise((resolve, reject) => {
                this.serialPort.on('open', () => {
                    setTimeout(() => {
                        this._isInitialized = true;
                        resolve();
                    }, initilizationDelay);
                });
            });
            yield promiseOpen;
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            this.serialPort.removeAllListeners();
            this.oneByteParser.removeAllListeners();
            this._isInitialized = true;
            this.registeredCommands.forEach((value => value.dispose()));
            this.registeredCommands.clear();
            this.registeredCommands = null;
            if (this.isOpen()) {
                yield this.serialPort.close((err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        console.error(err);
                    }
                    return Promise.resolve();
                }));
            }
        });
    }
    isOpen() {
        return this.serialPort.isOpen;
    }
    isInitialized() {
        return this._isInitialized;
    }
    registerCommand(commandIdOrConfig, callback = null, paramTypes = null) {
        let commandId;
        if (commandIdOrConfig instanceof ReadCommandConfig_1.ReadCommandConfig) {
            commandId = commandIdOrConfig.getCommandId();
            callback = commandIdOrConfig.getCallback();
            paramTypes = commandIdOrConfig.getCommandParamTypes();
        }
        else {
            commandId = commandIdOrConfig;
        }
        if (!callback) {
            throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_CALLBACK_IS_NULL);
        }
        if (this.registeredCommands.has(commandId)) {
            throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_COMMAND_IS_ALREADY_REGISTERED);
        }
        const registeredCommand = new RegisteredCommand_1.RegisteredCommand(commandId, callback, paramTypes);
        this.registeredCommands.set(commandId, registeredCommand);
    }
    unregisterCommand(commandId) {
        if (this.registeredCommands.has(commandId)) {
            const command = this.registeredCommands.get(commandId);
            command.dispose();
            this.registeredCommands.delete(commandId);
        }
    }
    writeCommand(commandIdOrConfig, params = null) {
        let commandId = '';
        if (commandIdOrConfig instanceof WriteCommandConfig_1.WriteCommandConfig) {
            commandId = commandIdOrConfig.getCommandId();
            params = commandIdOrConfig.getCommandParams();
        }
        else {
            commandId = commandIdOrConfig;
        }
        if (commandId.length !== 1) {
            throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_WRONG_COMMAND_NAME_LENGTH);
        }
        this.write(this.paramTypeInstances.get(ParamTypeChar_1.ParamTypeChar.NAME).getBuffer(commandId));
        if (params) {
            for (const param of params) {
                if (ParamsParser_1.ParamsParser.hasType(param.type)) {
                    const typeClassInstance = this.paramTypeInstances.get(param.type);
                    const buffer = typeClassInstance.getBuffer(param.value);
                    this.write(buffer);
                }
                else {
                    throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_PARAM_TYPE_UNKNOWN);
                }
            }
        }
        this.write(this.paramTypeInstances.get(ParamTypeInt8_1.ParamTypeInt8.NAME).getBuffer(SimpleSerialProtocol.CHAR_EOT));
    }
    addParamType(name, clazz) {
        if (ParamsParser_1.ParamsParser.hasType(name)) {
            throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_PARAM_TYPE_IS_ALREADY_REGISTERED);
        }
        ParamsParser_1.ParamsParser.addType(name, clazz);
        this.paramTypeInstances.set(name, new clazz());
    }
    addErrorListener(listener) {
        this.serialPort.addListener("error", listener);
    }
    addCloseListener(listener) {
        this.serialPort.addListener("close", listener);
    }
    removeErrorListener(listener) {
        this.serialPort.removeListener('error', listener);
    }
    removeCloseListener(listener) {
        this.serialPort.removeListener('close', listener);
    }
    initParamTypes() {
        this.addParamType(ParamTypeByte_1.ParamTypeByte.NAME, ParamTypeByte_1.ParamTypeByte);
        this.addParamType(ParamTypeBoolean_1.ParamTypeBoolean.NAME, ParamTypeBoolean_1.ParamTypeBoolean);
        this.addParamType(ParamTypeChar_1.ParamTypeChar.NAME, ParamTypeChar_1.ParamTypeChar);
        this.addParamType(ParamTypeString_1.ParamTypeString.NAME, ParamTypeString_1.ParamTypeString);
        this.addParamType(ParamTypeFloat_1.ParamTypeFloat.NAME, ParamTypeFloat_1.ParamTypeFloat);
        this.addParamType(ParamTypeInt8_1.ParamTypeInt8.NAME, ParamTypeInt8_1.ParamTypeInt8);
        this.addParamType(ParamTypeInt16_1.ParamTypeInt16.NAME, ParamTypeInt16_1.ParamTypeInt16);
        this.addParamType(ParamTypeInt32_1.ParamTypeInt32.NAME, ParamTypeInt32_1.ParamTypeInt32);
        this.addParamType(ParamTypeInt64_1.ParamTypeInt64.NAME, ParamTypeInt64_1.ParamTypeInt64);
        this.addParamType(ParamTypeUnsignedInt8_1.ParamTypeUnsignedInt8.NAME, ParamTypeUnsignedInt8_1.ParamTypeUnsignedInt8);
        this.addParamType(ParamTypeUnsignedInt16_1.ParamTypeUnsignedInt16.NAME, ParamTypeUnsignedInt16_1.ParamTypeUnsignedInt16);
        this.addParamType(ParamTypeUnsignedInt32_1.ParamTypeUnsignedInt32.NAME, ParamTypeUnsignedInt32_1.ParamTypeUnsignedInt32);
        this.addParamType(ParamTypeUnsignedInt64_1.ParamTypeUnsignedInt64.NAME, ParamTypeUnsignedInt64_1.ParamTypeUnsignedInt64);
    }
    write(buffer) {
        this.serialPort.write(buffer, "ascii");
    }
    onData(data) {
        if (!this._isInitialized) {
            return;
        }
        const byte = data[0];
        if (this.currentCommand) {
            /**
             * Got command already -> reading param data
             */
            if (this.currentCommand.paramsRead()) {
                /**
                 * Check EOT -> call callback
                 */
                if (byte === SimpleSerialProtocol.CHAR_EOT) {
                    this.currentCommand.callCallback();
                    this.currentCommand = null;
                }
                else {
                    throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_EOT_WAS_NOT_READ);
                }
            }
            else {
                this.currentCommand.addByte(byte);
            }
        }
        else {
            const commandName = String.fromCharCode(byte);
            if (!this.registeredCommands.has(commandName)) {
                /**
                 * Command not found
                 */
                throw new Error("Command not found: " + commandName);
            }
            else {
                /**
                 * New command -> Preparing buffer for reading
                 */
                this.currentCommand = this.registeredCommands.get(commandName);
                this.currentCommand.resetParamParser();
            }
        }
    }
}
exports.SimpleSerialProtocol = SimpleSerialProtocol;
SimpleSerialProtocol.CHAR_EOT = 0x0A; // End of Transmission - Line Feed Zeichen \n
//# sourceMappingURL=SimpleSerialProtocol.js.map