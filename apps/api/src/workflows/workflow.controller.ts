import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";
import { CreateWorkflowDto } from "./dto/create-workflow.dto";

@Controller('workflows')
export class WorkflowsController {
    constructor(private workflowsService : WorkflowsService) {}
    
    @Post()
    @HttpCode(201)
    async create(@Body() dto: CreateWorkflowDto) {
        return this.workflowsService.create(dto)
    }

    @Get()
    async findById(@Param('id') id : string) {
        return this.workflowsService.findById(id)
    }
}