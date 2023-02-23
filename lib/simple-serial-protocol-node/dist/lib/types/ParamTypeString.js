"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParamTypeString {
    constructor() {
        this.rawData = "";
        this.full = false;
    }
    getLength() {
        return this.rawData.length;
    }
    getBuffer(data) {
        // expand length for end-of-string char
        data += '#';
        const buffer = Buffer.from(data, 'ascii');
        buffer[data.length - 1] = ParamTypeString.CHAR_NULL;
        return buffer;
    }
    reset() {
        this.full = false;
        this.rawData = "";
    }
    addByte(byte) {
        if (this.isFull()) {
            throw new Error("Added byte to already filled  param var.");
        }
        if (byte === ParamTypeString.CHAR_NULL) {
            this.full = true;
            return;
        }
        this.rawData += String.fromCharCode(byte);
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
exports.ParamTypeString = ParamTypeString;
ParamTypeString.NAME = "string";
ParamTypeString.CHAR_NULL = 0x00; // 0x00 // End of String
//# sourceMappingURL=ParamTypeString.js.map