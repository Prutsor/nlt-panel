import { CommandParam } from "./CommandParam";
export declare class WriteCommandConfig {
    private readonly commandId;
    private commandParams;
    constructor(commandId: string);
    getCommandId(): string;
    getCommandParams(): CommandParam[];
    addByteValue(byteValue: number): WriteCommandConfig;
    addBooleanValue(booleanValue: boolean): WriteCommandConfig;
    addInt8Value(int8Value: number): WriteCommandConfig;
    addUInt8Value(uint8Value: number): WriteCommandConfig;
    addInt16Value(int16Value: number): WriteCommandConfig;
    addUInt16Value(uint16Value: number): WriteCommandConfig;
    addInt32Value(int32Value: number): WriteCommandConfig;
    addUInt32Value(uint32Value: number): WriteCommandConfig;
    addInt64Value(int64Value: bigint): WriteCommandConfig;
    addUInt64Value(uint64Value: bigint): WriteCommandConfig;
    addFloatValue(floatValue: number): WriteCommandConfig;
    addCharValue(charValue: string): WriteCommandConfig;
    addStringValue(stringValue: string): WriteCommandConfig;
    addCustomValue(customValue: any, paramTypeName: string): WriteCommandConfig;
}
