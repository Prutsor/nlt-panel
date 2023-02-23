import { Baudrate } from "./Baudrate";
import { CommandParam } from "./CommandParam";
import { ReadCommandConfig } from "./ReadCommandConfig";
import { WriteCommandConfig } from "./WriteCommandConfig";
export declare class SimpleSerialProtocol {
    private static readonly CHAR_EOT;
    private _isInitialized;
    private serialPort;
    private oneByteParser;
    private registeredCommands;
    private currentCommand;
    private paramTypeInstances;
    constructor(portname: string, baudrate: Baudrate);
    init(initilizationDelay?: number): Promise<void>;
    dispose(): Promise<void>;
    isOpen(): boolean;
    isInitialized(): boolean;
    /**
     * Pseudooverloading
     */
    registerCommand(readCommandConfig: ReadCommandConfig): void;
    registerCommand(commandId: string, callback: (...args: any[]) => void): void;
    registerCommand(commandId: string, callback: (...args: any[]) => void, paramTypes: string[]): void;
    unregisterCommand(commandId: string): void;
    /**
     * Pseudooverloading
     */
    writeCommand(writeCommandConfig: WriteCommandConfig): void;
    writeCommand(commandId: string): void;
    writeCommand(commandId: string, params: CommandParam[]): void;
    addParamType(name: string, clazz: any): void;
    addErrorListener(listener: (err: Error) => void): void;
    addCloseListener(listener: () => void): void;
    removeErrorListener(listener: (err: Error) => void): void;
    removeCloseListener(listener: () => void): void;
    private initParamTypes;
    private write;
    private onData;
}
