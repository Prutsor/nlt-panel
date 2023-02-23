"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParamTypeInt8 {
    constructor() {
        this.rawData = Buffer.allocUnsafe(this.getLength());
        this.index = 0;
    }
    getLength() {
        return 1;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeInt8(data, 0);
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
        return this.rawData.readInt8(0);
    }
    dispose() {
        this.rawData = null;
    }
}
exports.ParamTypeInt8 = ParamTypeInt8;
ParamTypeInt8.NAME = "int8";
//# sourceMappingURL=ParamTypeInt8.js.map