export declare class ReadCommandConfig {
    private readonly commandId;
    private readonly callback;
    private types;
    constructor(commandId: string, callback: (...args: any[]) => void);
    getCallback(): (...args: any[]) => void;
    getCommandId(): string;
    getCommandParamTypes(): string[];
    addByteParam(): ReadCommandConfig;
    addBooleanParam(): ReadCommandConfig;
    addInt8Param(): ReadCommandConfig;
    addUInt8Param(): ReadCommandConfig;
    addInt16Param(): ReadCommandConfig;
    addUInt16Param(): ReadCommandConfig;
    addInt32Param(): ReadCommandConfig;
    addUInt32Param(): ReadCommandConfig;
    addInt64Param(): ReadCommandConfig;
    addUInt64Param(): ReadCommandConfig;
    addFloatParam(): ReadCommandConfig;
    addCharParam(): ReadCommandConfig;
    addStringParam(): ReadCommandConfig;
    addCustomParam(paramTypeName: string): ReadCommandConfig;
}
