"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamTypeInt8_1 = require("./ParamTypeInt8");
class ParamTypeUnsignedInt32 extends ParamTypeInt8_1.ParamTypeInt8 {
    getLength() {
        return 4;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeUInt32LE(data, 0);
        return buffer;
    }
    getData() {
        return this.rawData.readUInt32LE(0);
    }
}
exports.ParamTypeUnsignedInt32 = ParamTypeUnsignedInt32;
ParamTypeUnsignedInt32.NAME = "unsigned_int32";
//# sourceMappingURL=ParamTypeUnsignedInt32.js.map