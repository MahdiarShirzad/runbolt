import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested,  } from "class-validator";

class PositionDto{
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;
}

class NodeDto{
    @IsString()
    @IsNotEmpty()
    id:string;

    @IsString()
    @IsNotEmpty()
    type:string;
    
    @IsString() 
    @IsNotEmpty()
    name:string;


    @ValidateNested()
    @Type(()=> PositionDto)
    position: PositionDto;

    @IsObject()
    config: Record<string, unknown>;
}

class EdgeDto{

    @IsString()
    @IsNotEmpty()
    id:string;

    @IsString()
    @IsNotEmpty()
    source:string;

    @IsString()
    @IsNotEmpty()
    target:string;

    @IsString()
    @IsNotEmpty()
    sourceHandle:string;

    @IsString()
    @IsNotEmpty()
    targetHandle:string;

}

export class CreateWorkflowDto{
    @IsString()
    @IsNotEmpty()
    name:string;

    @IsString()
    description:string ='';

    @IsOptional()
    @IsString()
    status:string = 'paused';

    @IsArray()
    @ValidateNested({each:true})
    @Type(()=> NodeDto)
    nodes: NodeDto[];

    @IsArray()
    @ValidateNested({each:true})
    @Type(()=> EdgeDto)
    edges: EdgeDto[];
}