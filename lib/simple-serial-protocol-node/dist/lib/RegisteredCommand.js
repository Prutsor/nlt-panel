"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamsParser_1 = require("./ParamsParser");
class RegisteredCommand {
    constructor(command, callback, paramTypes = null) {
        this.command = command;
        this.callback = callback;
        if (paramTypes && paramTypes.length > 0) {
            this.paramsParser = new ParamsParser_1.ParamsParser(paramTypes);
        }
    }
    paramsRead() {
        return this.paramsParser ? this.paramsParser.isFull() : true;
    }
    addByte(byte) {
        if (this.paramsParser) {
            this.paramsParser.addByte(byte);
        }
    }
    resetParamParser() {
        if (this.paramsParser) {
            this.paramsParser.reset();
        }
    }
    callCallback() {
        if (this.paramsParser) {
            this.callback.apply(null, this.paramsParser.getData());
        }
        else {
            this.callback.apply(null, []);
        }
    }
    dispose() {
        this.callback = null;
        if (this.paramsParser) {
            this.paramsParser.dispose();
        }
    }
}
exports.RegisteredCommand = RegisteredCommand;
//# sourceMappingURL=RegisteredCommand.js.map