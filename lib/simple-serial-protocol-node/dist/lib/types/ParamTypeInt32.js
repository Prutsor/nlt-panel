"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamTypeInt8_1 = require("./ParamTypeInt8");
class ParamTypeInt32 extends ParamTypeInt8_1.ParamTypeInt8 {
    getLength() {
        return 4;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeInt32LE(data, 0);
        return buffer;
    }
    getData() {
        return this.rawData.readInt32LE(0);
    }
}
exports.ParamTypeInt32 = ParamTypeInt32;
ParamTypeInt32.NAME = "int32";
//# sourceMappingURL=ParamTypeInt32.js.map