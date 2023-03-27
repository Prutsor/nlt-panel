"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleSerialProtocolError_1 = require("./SimpleSerialProtocolError");
const ParamTypeChar_1 = require("./types/ParamTypeChar");
const ParamTypeByte_1 = require("./types/ParamTypeByte");
const ParamTypeBoolean_1 = require("./types/ParamTypeBoolean");
const ParamTypeInt8_1 = require("./types/ParamTypeInt8");
const ParamTypeUnsignedInt8_1 = require("./types/ParamTypeUnsignedInt8");
const ParamTypeInt16_1 = require("./types/ParamTypeInt16");
const ParamTypeUnsignedInt16_1 = require("./types/ParamTypeUnsignedInt16");
const ParamTypeInt32_1 = require("./types/ParamTypeInt32");
const ParamTypeUnsignedInt32_1 = require("./types/ParamTypeUnsignedInt32");
const ParamTypeInt64_1 = require("./types/ParamTypeInt64");
const ParamTypeUnsignedInt64_1 = require("./types/ParamTypeUnsignedInt64");
const ParamTypeFloat_1 = require("./types/ParamTypeFloat");
const ParamTypeString_1 = require("./types/ParamTypeString");
class WriteCommandConfig {
    constructor(commandId) {
        this.commandId = commandId;
        this.commandParams = [];
        if (commandId.length !== 1) {
            throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_WRONG_COMMAND_NAME_LENGTH);
        }
    }
    getCommandId() {
        return this.commandId;
    }
    getCommandParams() {
        return this.commandParams;
    }
    addByteValue(byteValue) {
        this.commandParams.push({
            type: ParamTypeByte_1.ParamTypeByte.NAME,
            value: byteValue
        });
        return this;
    }
    addBooleanValue(booleanValue) {
        this.commandParams.push({
            type: ParamTypeBoolean_1.ParamTypeBoolean.NAME,
            value: booleanValue
        });
        return this;
    }
    addInt8Value(int8Value) {
        this.commandParams.push({
            type: ParamTypeInt8_1.ParamTypeInt8.NAME,
            value: int8Value
        });
        return this;
    }
    addUInt8Value(uint8Value) {
        this.commandParams.push({
            type: ParamTypeUnsignedInt8_1.ParamTypeUnsignedInt8.NAME,
            value: uint8Value
        });
        return this;
    }
    addInt16Value(int16Value) {
        this.commandParams.push({
            type: ParamTypeInt16_1.ParamTypeInt16.NAME,
            value: int16Value
        });
        return this;
    }
    addUInt16Value(uint16Value) {
        this.commandParams.push({
            type: ParamTypeUnsignedInt16_1.ParamTypeUnsignedInt16.NAME,
            value: uint16Value
        });
        return this;
    }
    addInt32Value(int32Value) {
        this.commandParams.push({
            type: ParamTypeInt32_1.ParamTypeInt32.NAME,
            value: int32Value
        });
        return this;
    }
    addUInt32Value(uint32Value) {
        this.commandParams.push({
            type: ParamTypeUnsignedInt32_1.ParamTypeUnsignedInt32.NAME,
            value: uint32Value
        });
        return this;
    }
    addInt64Value(int64Value) {
        this.commandParams.push({
            type: ParamTypeInt64_1.ParamTypeInt64.NAME,
            value: int64Value
        });
        return this;
    }
    addUInt64Value(uint64Value) {
        this.commandParams.push({
            type: ParamTypeUnsignedInt64_1.ParamTypeUnsignedInt64.NAME,
            value: uint64Value
        });
        return this;
    }
    addFloatValue(floatValue) {
        this.commandParams.push({
            type: ParamTypeFloat_1.ParamTypeFloat.NAME,
            value: floatValue
        });
        return this;
    }
    addCharValue(charValue) {
        this.commandParams.push({
            type: ParamTypeChar_1.ParamTypeChar.NAME,
            value: charValue
        });
        return this;
    }
    addStringValue(stringValue) {
        this.commandParams.push({
            type: ParamTypeString_1.ParamTypeString.NAME,
            value: stringValue
        });
        return this;
    }
    addCustomValue(customValue, paramTypeName) {
        this.commandParams.push({
            type: paramTypeName,
            value: customValue
        });
        return this;
    }
}
exports.WriteCommandConfig = WriteCommandConfig;
//# sourceMappingURL=WriteCommandConfig.js.map