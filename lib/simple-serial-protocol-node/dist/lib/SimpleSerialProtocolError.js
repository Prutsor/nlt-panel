"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SimpleSerialProtocolError extends Error {
    constructor(_type, _message = '') {
        super(_type);
        this._type = _type;
        this._message = _message;
    }
    get type() {
        return this._type;
    }
    get message() {
        return this._message;
    }
}
exports.SimpleSerialProtocolError = SimpleSerialProtocolError;
SimpleSerialProtocolError.ERROR_COMMAND_IS_ALREADY_REGISTERED = "ERROR_COMMAND_IS_ALREADY_REGISTERED";
SimpleSerialProtocolError.ERROR_COMMAND_IS_NOT_REGISTERED = "ERROR_COMMAND_IS_NOT_REGISTERED";
SimpleSerialProtocolError.ERROR_IS_NOT_EOT = "ERROR_IS_NOT_EOT";
SimpleSerialProtocolError.ERROR_EOT_WAS_NOT_READ = "ERROR_EOT_WAS_NOT_READ";
SimpleSerialProtocolError.ERROR_PARAM_TYPE_UNKNOWN = "ERROR_PARAM_TYPE_UNKNOWN";
SimpleSerialProtocolError.UNKNOWN = 'UNKNOWN';
SimpleSerialProtocolError.ERROR_WRONG_COMMAND_NAME_LENGTH = 'ERROR_WRONG_COMMAND_NAME_LENGTH';
SimpleSerialProtocolError.ERROR_PARAM_TYPE_IS_ALREADY_REGISTERED = 'ERROR_PARAM_TYPE_IS_ALREADY_REGISTERED';
SimpleSerialProtocolError.ERROR_PARSER_TOO_MANY_BYTES = 'ERROR_PARSER_TOO_MANY_BYTES';
SimpleSerialProtocolError.ERROR_CALLBACK_IS_NULL = 'ERROR_CALLBACK_IS_NULL';
//# sourceMappingURL=SimpleSerialProtocolError.js.map