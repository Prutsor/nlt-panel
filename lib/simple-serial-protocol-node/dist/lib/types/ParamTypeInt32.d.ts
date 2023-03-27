/// <reference types="node" />
import { ParamType } from "./ParamType";
import { ParamTypeInt8 } from "./ParamTypeInt8";
export declare class ParamTypeInt32 extends ParamTypeInt8 implements ParamType<number> {
    static NAME: string;
    getLength(): number;
    getBuffer(data: number): Buffer;
    getData(): number;
}
