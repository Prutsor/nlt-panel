export declare class SimpleSerialProtocolError extends Error {
    private _type;
    private _message;
    static readonly ERROR_COMMAND_IS_ALREADY_REGISTERED = "ERROR_COMMAND_IS_ALREADY_REGISTERED";
    static readonly ERROR_COMMAND_IS_NOT_REGISTERED = "ERROR_COMMAND_IS_NOT_REGISTERED";
    static readonly ERROR_IS_NOT_EOT = "ERROR_IS_NOT_EOT";
    static readonly ERROR_EOT_WAS_NOT_READ = "ERROR_EOT_WAS_NOT_READ";
    static readonly ERROR_PARAM_TYPE_UNKNOWN = "ERROR_PARAM_TYPE_UNKNOWN";
    static readonly UNKNOWN: string;
    static readonly ERROR_WRONG_COMMAND_NAME_LENGTH: string;
    static readonly ERROR_PARAM_TYPE_IS_ALREADY_REGISTERED: string;
    static readonly ERROR_PARSER_TOO_MANY_BYTES: string;
    static readonly ERROR_CALLBACK_IS_NULL: string;
    constructor(_type: string, _message?: string);
    get type(): string;
    get message(): string;
}
