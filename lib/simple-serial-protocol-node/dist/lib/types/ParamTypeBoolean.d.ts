/// <reference types="node" />
import { ParamType } from "./ParamType";
export declare class ParamTypeBoolean implements ParamType<boolean> {
    static readonly NAME: string;
    protected rawData: Buffer;
    protected index: number;
    getLength(): number;
    getBuffer(data: boolean): Buffer;
    reset(): void;
    addByte(byte: number): void;
    isFull(): boolean;
    getData(): boolean;
    dispose(): void;
}
