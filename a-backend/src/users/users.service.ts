import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    return user;
  }

  async findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async findOne(id: number): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async remove(id: number): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }
}
