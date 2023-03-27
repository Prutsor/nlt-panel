/// <reference types="node" />
import { ParamType } from "./ParamType";
export declare class ParamTypeInt8 implements ParamType<number> {
    static NAME: string;
    protected rawData: Buffer;
    protected index: number;
    getLength(): number;
    getBuffer(data: number): Buffer;
    reset(): void;
    addByte(byte: number): void;
    isFull(): boolean;
    getData(): number;
    dispose(): void;
}
