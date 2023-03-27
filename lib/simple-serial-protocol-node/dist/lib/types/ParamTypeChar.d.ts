/// <reference types="node" />
import { ParamType } from "./ParamType";
export declare class ParamTypeChar implements ParamType<string> {
    static readonly NAME: string;
    private rawData;
    private full;
    getLength(): number;
    getBuffer(data: string): Buffer;
    reset(): void;
    addByte(byte: number): void;
    isFull(): boolean;
    getData(): string;
    dispose(): void;
}
