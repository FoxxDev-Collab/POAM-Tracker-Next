import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Group } from '@prisma/client';

export interface CreateGroupDto {
  packageId: number;
  name: string;
  description?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto): Promise<{ item: Group }> {
    const group = await this.prisma.group.create({
      data: createGroupDto,
    });
    
    return { item: group };
  }

  async findAll(): Promise<Group[]> {
    return this.prisma.group.findMany({
      include: {
        package: true,
        systems: true,
        _count: {
          select: {
            systems: true,
            poams: true,
          },
        },
      },
    });
  }

  async findByPackage(packageId: number): Promise<{ items: Group[] }> {
    const groups = await this.prisma.group.findMany({
      where: { packageId },
      include: {
        systems: true,
        _count: {
          select: {
            systems: true,
            poams: true,
          },
        },
      },
    });
    
    return { items: groups };
  }

  async findOne(id: number): Promise<Group | null> {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        package: true,
        systems: true,
        poams: true,
      },
    });
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    return this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
      include: {
        package: true,
        systems: true,
        _count: {
          select: {
            systems: true,
            poams: true,
          },
        },
      },
    });
  }

  async remove(id: number): Promise<Group> {
    return this.prisma.group.delete({
      where: { id },
    });
  }
}
