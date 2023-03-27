"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParamTypeInt64 {
    constructor() {
        this.rawData = Buffer.allocUnsafe(this.getLength());
        this.index = 0;
    }
    getLength() {
        return 8;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeBigInt64LE(data, 0);
        return buffer;
    }
    reset() {
        this.index = 0;
    }
    addByte(byte) {
        if (this.isFull()) {
            return;
        }
        this.rawData[this.index] = byte;
        this.index++;
    }
    isFull() {
        return this.index >= this.getLength();
    }
    getData() {
        return this.rawData.readBigInt64LE(0);
    }
    dispose() {
        this.rawData = null;
    }
}
exports.ParamTypeInt64 = ParamTypeInt64;
ParamTypeInt64.NAME = "int64";
//# sourceMappingURL=ParamTypeInt64.js.map