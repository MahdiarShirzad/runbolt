import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WorkflowsModule } from './workflows/wotkflows.module';

@Module({
  imports: [
    PrismaModule,
    WorkflowsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
