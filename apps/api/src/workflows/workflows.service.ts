import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWorkflowDto } from "./dto/create-workflow.dto";

@Injectable()
export class WorkflowsService {
    constructor(private prisma:PrismaService) {}

    async create(dto: CreateWorkflowDto){
        const slug = this.makeSlug(dto.name);

        try {
            const workflow = await this.prisma.workflow.create({
                data:{
                    slug,
                    name:dto.name,
                    description:dto.description,
                    status:dto.status,
                    definition:{
                        version:1,
                        description: dto.description,
                        status:dto.status,
                        nodes:dto.nodes as unknown as Prisma.InputJsonValue,
                        edges:dto.edges as unknown as Prisma.InputJsonValue
                    }
                }
            })
            return workflow;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {

                throw new ConflictException(
                    `workflow with this slug "${slug}" already exists. Please choose a different name.`,    
                )
            }
            throw error;
        }
}

  async findById(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with id ${id} not found`);
    }

    return workflow;
  }

  private makeSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}