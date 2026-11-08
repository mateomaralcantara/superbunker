import { Module } from "@nestjs/common";
import { LabsController } from "./labs.controller";

@Module({ controllers: [LabsController] })
export class LabsModule {}
