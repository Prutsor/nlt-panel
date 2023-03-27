export declare class RegisteredCommand {
    private command;
    private callback;
    private readonly paramsParser;
    constructor(command: string, callback: (...args: any[]) => void, paramTypes?: string[]);
    paramsRead(): boolean;
    addByte(byte: number): void;
    resetParamParser(): void;
    callCallback(): void;
    dispose(): void;
}
