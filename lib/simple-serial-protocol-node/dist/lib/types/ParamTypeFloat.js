"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamTypeInt8_1 = require("./ParamTypeInt8");
class ParamTypeFloat extends ParamTypeInt8_1.ParamTypeInt8 {
    constructor() {
        super(...arguments);
        this.rawData = Buffer.allocUnsafe(this.getLength());
    }
    getLength() {
        return 4;
    }
    getBuffer(data) {
        const buffer = Buffer.allocUnsafe(this.getLength());
        buffer.writeFloatLE(data, 0);
        return buffer;
    }
    getData() {
        return this.rawData.readFloatLE(0);
    }
}
exports.ParamTypeFloat = ParamTypeFloat;
ParamTypeFloat.NAME = "float";
//# sourceMappingURL=ParamTypeFloat.js.map