/// <reference types="node" />
import { ParamType } from "./ParamType";
import { ParamTypeInt64 } from "./ParamTypeInt64";
export declare class ParamTypeUnsignedInt64 extends ParamTypeInt64 implements ParamType<bigint> {
    static NAME: string;
    getBuffer(data: bigint): Buffer;
    getData(): bigint;
}
