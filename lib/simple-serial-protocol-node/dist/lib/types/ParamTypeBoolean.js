"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParamTypeBoolean {
    constructor() {
        this.rawData = Buffer.allocUnsafe(1);
    }
    getLength() {
        return 1;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeIntLE(data ? 1 : 0, 0, 1);
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
        return this.index > 0;
    }
    getData() {
        return this.rawData.readInt8(0) === 1;
    }
    dispose() {
        this.rawData = null;
    }
}
exports.ParamTypeBoolean = ParamTypeBoolean;
ParamTypeBoolean.NAME = "boolean";
//# sourceMappingURL=ParamTypeBoolean.js.map