"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamTypeInt8_1 = require("./ParamTypeInt8");
class ParamTypeUnsignedInt8 extends ParamTypeInt8_1.ParamTypeInt8 {
    getLength() {
        return 1;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeUInt8(data, 0);
        return buffer;
    }
    getData() {
        return this.rawData.readUInt8(0);
    }
}
exports.ParamTypeUnsignedInt8 = ParamTypeUnsignedInt8;
ParamTypeUnsignedInt8.NAME = "unsigned_int8";
//# sourceMappingURL=ParamTypeUnsignedInt8.js.map