import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { System } from '@prisma/client';

export interface CreateSystemDto {
  packageId: number;
  groupId?: number;
  name: string;
  description?: string;
}

export interface UpdateSystemDto {
  groupId?: number;
  name?: string;
  description?: string;
}

@Injectable()
export class SystemsService {
  constructor(private prisma: PrismaService) {}

  async create(createSystemDto: CreateSystemDto): Promise<System> {
    return this.prisma.system.create({
      data: createSystemDto,
    });
  }

  async findAll(): Promise<System[]> {
    return this.prisma.system.findMany({
      include: {
        package: true,
        group: true,
        _count: {
          select: {
            stigScans: true,
            stigFindings: true,
            stps: true,
          },
        },
      },
    });
  }

  async findByPackage(packageId: number): Promise<System[]> {
    return this.prisma.system.findMany({
      where: { packageId },
      include: {
        group: true,
        _count: {
          select: {
            stigScans: true,
            stigFindings: true,
            stps: true,
          },
        },
      },
    });
  }

  async findByGroup(groupId: number): Promise<System[]> {
    return this.prisma.system.findMany({
      where: { groupId },
      include: {
        package: true,
        group: true,
        _count: {
          select: {
            stigScans: true,
            stigFindings: true,
            stps: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<System | null> {
    return this.prisma.system.findUnique({
      where: { id },
      include: {
        package: true,
        group: true,
        stigScans: true,
        stigFindings: true,
        stps: true,
      },
    });
  }

  async update(id: number, updateSystemDto: UpdateSystemDto): Promise<System> {
    return this.prisma.system.update({
      where: { id },
      data: updateSystemDto,
    });
  }

  async remove(id: number): Promise<System> {
    return this.prisma.system.delete({
      where: { id },
    });
  }
}
