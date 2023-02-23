/// <reference types="node" />
import { ParamType } from "./ParamType";
export declare class ParamTypeInt64 implements ParamType<bigint> {
    static NAME: string;
    protected rawData: Buffer;
    protected index: number;
    getLength(): number;
    getBuffer(data: bigint): Buffer;
    reset(): void;
    addByte(byte: number): void;
    isFull(): boolean;
    getData(): bigint;
    dispose(): void;
}
