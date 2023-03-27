"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleSerialProtocolError_1 = require("./SimpleSerialProtocolError");
class ParamsParser {
    constructor(typeNames = null) {
        this.typeNames = typeNames;
        this.typesLength = typeNames ? typeNames.length : null;
        this.init();
    }
    static hasType(name) {
        return this.TYPES.has(name);
    }
    static getType(name) {
        return this.TYPES.get(name);
    }
    static addType(name, clazz) {
        return this.TYPES.set(name, clazz);
    }
    init() {
        if (this.typeNames.length > 0) {
            this.types = [];
            for (const type of this.typeNames) {
                if (ParamsParser.TYPES.has(type)) {
                    const clazz = ParamsParser.TYPES.get(type);
                    this.types.push(new clazz());
                }
                else {
                    throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_PARAM_TYPE_UNKNOWN);
                }
            }
            this.currentType = this.types[0];
            this.typeIndex = 0;
        }
    }
    addByte(byte) {
        if (!this.types) {
            throw new Error("Tried to add byte to params but no types defined.");
        }
        if (this.currentType.isFull()) {
            // console.log("parser - is full", byte);
            this.typeIndex++;
            if (this.typeIndex >= this.typesLength) {
                throw new SimpleSerialProtocolError_1.SimpleSerialProtocolError(SimpleSerialProtocolError_1.SimpleSerialProtocolError.ERROR_PARSER_TOO_MANY_BYTES, "Tried to add byte to param parser but all types filled.");
            }
            this.currentType = this.types[this.typeIndex];
        }
        this.currentType.addByte(byte);
    }
    isFull() {
        if (this.types) {
            if (this.typeIndex < (this.typesLength - 1)) {
                // console.log("not reached last type");
                /**
                 * Not reached last type
                 */
                return false;
            }
            else {
                /**
                 * Last type filled?
                 */
                // console.log("last type filled");
                return this.currentType.isFull();
            }
        }
        else {
            /**
             * No types defined -> always full
             */
            // console.log("no types defined");
            return true;
        }
    }
    reset() {
        if (this.types) {
            for (const type of this.types) {
                type.reset();
            }
        }
        this.typeIndex = 0;
        this.currentType = this.types[0];
    }
    getData() {
        let data = [];
        for (const type of this.types) {
            data.push(type.getData());
        }
        return data;
    }
    dispose() {
        for (const type of this.types) {
            type.dispose();
        }
    }
}
exports.ParamsParser = ParamsParser;
ParamsParser.TYPES = new Map();
//# sourceMappingURL=ParamsParser.js.map