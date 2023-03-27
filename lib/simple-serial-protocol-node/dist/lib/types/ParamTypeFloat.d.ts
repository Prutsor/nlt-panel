/// <reference types="node" />
import { ParamType } from "./ParamType";
import { ParamTypeInt8 } from "./ParamTypeInt8";
export declare class ParamTypeFloat extends ParamTypeInt8 implements ParamType<number> {
    static NAME: string;
    protected rawData: Buffer;
    protected index: number;
    getLength(): number;
    getBuffer(data: number): Buffer;
    getData(): number;
}
