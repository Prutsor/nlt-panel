"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamTypeInt64_1 = require("./ParamTypeInt64");
class ParamTypeUnsignedInt64 extends ParamTypeInt64_1.ParamTypeInt64 {
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeBigUInt64LE(data, 0);
        return buffer;
    }
    getData() {
        return this.rawData.readBigUInt64LE(0);
    }
}
exports.ParamTypeUnsignedInt64 = ParamTypeUnsignedInt64;
ParamTypeUnsignedInt64.NAME = "unsigned_int64";
//# sourceMappingURL=ParamTypeUnsignedInt64.js.map