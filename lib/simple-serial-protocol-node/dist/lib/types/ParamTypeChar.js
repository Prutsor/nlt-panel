"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParamTypeChar {
    constructor() {
        this.rawData = "";
        this.full = false;
    }
    getLength() {
        return 1;
    }
    getBuffer(data) {
        return Buffer.from(data, 'ascii');
    }
    reset() {
        this.full = false;
        this.rawData = "";
    }
    addByte(byte) {
        if (this.isFull()) {
            throw new Error("Added byte to already filled  param var.");
        }
        this.full = true;
        this.rawData = String.fromCharCode(byte);
    }
    isFull() {
        return this.full;
    }
    getData() {
        return this.rawData;
    }
    dispose() {
        this.rawData = null;
    }
}
exports.ParamTypeChar = ParamTypeChar;
ParamTypeChar.NAME = "char";
//# sourceMappingURL=ParamTypeChar.js.map