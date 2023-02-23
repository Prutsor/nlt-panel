"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamTypeInt8_1 = require("./ParamTypeInt8");
class ParamTypeInt16 extends ParamTypeInt8_1.ParamTypeInt8 {
    getLength() {
        return 2;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeInt16LE(data, 0);
        return buffer;
    }
    getData() {
        return this.rawData.readInt16LE(0);
    }
}
exports.ParamTypeInt16 = ParamTypeInt16;
ParamTypeInt16.NAME = "int16";
//# sourceMappingURL=ParamTypeInt16.js.map