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
class ReadCommandConfig {
    constructor(commandId, callback) {
        this.commandId = commandId;
        this.callback = callback;
        this.types = [];
        if (commandId.length !== 1) {
            throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_WRONG_COMMAND_NAME_LENGTH);
        }
        this.commandId = commandId;
    }
    getCallback() {
        return this.callback;
    }
    getCommandId() {
        return this.commandId;
    }
    getCommandParamTypes() {
        return this.types;
    }
    addByteParam() {
        this.types.push(ParamTypeByte_1.ParamTypeByte.NAME);
        return this;
    }
    addBooleanParam() {
        this.types.push(ParamTypeBoolean_1.ParamTypeBoolean.NAME);
        return this;
    }
    addInt8Param() {
        this.types.push(ParamTypeInt8_1.ParamTypeInt8.NAME);
        return this;
    }
    addUInt8Param() {
        this.types.push(ParamTypeUnsignedInt8_1.ParamTypeUnsignedInt8.NAME);
        return this;
    }
    addInt16Param() {
        this.types.push(ParamTypeInt16_1.ParamTypeInt16.NAME);
        return this;
    }
    addUInt16Param() {
        this.types.push(ParamTypeUnsignedInt16_1.ParamTypeUnsignedInt16.NAME);
        return this;
    }
    addInt32Param() {
        this.types.push(ParamTypeInt32_1.ParamTypeInt32.NAME);
        return this;
    }
    addUInt32Param() {
        this.types.push(ParamTypeUnsignedInt32_1.ParamTypeUnsignedInt32.NAME);
        return this;
    }
    addInt64Param() {
        this.types.push(ParamTypeInt64_1.ParamTypeInt64.NAME);
        return this;
    }
    addUInt64Param() {
        this.types.push(ParamTypeUnsignedInt64_1.ParamTypeUnsignedInt64.NAME);
        return this;
    }
    addFloatParam() {
        this.types.push(ParamTypeFloat_1.ParamTypeFloat.NAME);
        return this;
    }
    addCharParam() {
        this.types.push(ParamTypeChar_1.ParamTypeChar.NAME);
        return this;
    }
    addStringParam() {
        this.types.push(ParamTypeString_1.ParamTypeString.NAME);
        return this;
    }
    addCustomParam(paramTypeName) {
        this.types.push(paramTypeName);
        return this;
    }
}
exports.ReadCommandConfig = ReadCommandConfig;
//# sourceMappingURL=ReadCommandConfig.js.map