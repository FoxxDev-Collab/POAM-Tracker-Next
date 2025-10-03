import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePmoDto, UpdatePmoDto } from './dto';

@Injectable()
export class PmoService {
  constructor(private prisma: PrismaService) {}

  async create(createPmoDto: CreatePmoDto) {
    return this.prisma.pmo.create({
      data: createPmoDto,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.pmo.findMany({
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const pmo = await this.prisma.pmo.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!pmo) {
      throw new NotFoundException(`PMO with ID ${id} not found`);
    }

    return pmo;
  }

  async update(id: number, updatePmoDto: UpdatePmoDto) {
    await this.findOne(id); // Ensure PMO exists

    return this.prisma.pmo.update({
      where: { id },
      data: updatePmoDto,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure PMO exists

    return this.prisma.pmo.update({
      where: { id },
      data: { isActive: false },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async getUsersInPmo(id: number) {
    const pmo = await this.findOne(id);
    return pmo.users;
  }
}
