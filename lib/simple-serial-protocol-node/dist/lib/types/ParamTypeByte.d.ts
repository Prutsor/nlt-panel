import { ParamType } from "./ParamType";
import { ParamTypeUnsignedInt8 } from "./ParamTypeUnsignedInt8";
export declare class ParamTypeByte extends ParamTypeUnsignedInt8 implements ParamType<number> {
    static NAME: string;
}
