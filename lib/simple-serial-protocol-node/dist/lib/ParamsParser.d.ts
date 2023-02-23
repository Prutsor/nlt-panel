export declare class ParamsParser {
    private static TYPES;
    private readonly typeNames;
    private readonly typesLength;
    private types;
    private typeIndex;
    private currentType;
    constructor(typeNames?: string[]);
    static hasType(name: string): any;
    static getType(name: string): any;
    static addType(name: string, clazz: any): any;
    init(): void;
    addByte(byte: number): void;
    isFull(): boolean;
    reset(): void;
    getData(): any[];
    dispose(): void;
}
