"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamTypeInt8_1 = require("./ParamTypeInt8");
class ParamTypeUnsignedInt16 extends ParamTypeInt8_1.ParamTypeInt8 {
    getLength() {
        return 2;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeUInt16LE(data, 0);
        return buffer;
    }
    getData() {
        return this.rawData.readUInt16LE(0);
    }
}
exports.ParamTypeUnsignedInt16 = ParamTypeUnsignedInt16;
ParamTypeUnsignedInt16.NAME = "unsigned_int16";
//# sourceMappingURL=ParamTypeUnsignedInt16.js.map