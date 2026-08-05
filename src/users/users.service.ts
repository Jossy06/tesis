import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/user-role.enum';

export type SafeUser = Omit<
  User,
  'password'
>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<SafeUser> {
    const email =
      this.normalizeEmail(
        createUserDto.email,
      );

    const existingUser =
      await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        'El correo ya está registrado',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        createUserDto.password,
        10,
      );

    const user =
      this.userRepository.create({
        name:
          createUserDto.name.trim(),

        email,

        password:
          hashedPassword,

        role:
          createUserDto.role ??
          UserRole.RECEPTIONIST,

        is_active:
          createUserDto.is_active ??
          true,
      });

    const savedUser =
      await this.userRepository.save(
        user,
      );

    return this.removePassword(
      savedUser,
    );
  }

  async findAll():
    Promise<SafeUser[]> {
    const users =
      await this.userRepository.find({
        order: {
          created_at: 'DESC',
        },
      });

    return users.map(
      (user) =>
        this.removePassword(user),
    );
  }

  async findOne(
    id: string,
  ): Promise<SafeUser> {
    const user =
      await this.findOneEntity(id);

    return this.removePassword(user);
  }

  async findOneEntity(
    id: string,
  ): Promise<User> {
    const user =
      await this.userRepository.findOne({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return user;
  }

  async findByEmail(
    email: string,
  ): Promise<User | null> {
    const normalizedEmail =
      this.normalizeEmail(email);

    return this.userRepository
      .createQueryBuilder('user')
      .where(
        'LOWER(user.email) = :email',
        {
          email:
            normalizedEmail,
        },
      )
      .getOne();
  }

  async update(
    id: string,
    updateUserDto:
      UpdateUserDto,
  ): Promise<SafeUser> {
    const user =
      await this.findOneEntity(id);

    if (updateUserDto.email) {
      const email =
        this.normalizeEmail(
          updateUserDto.email,
        );

      if (email !== user.email) {
        const existingUser =
          await this.findByEmail(
            email,
          );

        if (
          existingUser &&
          existingUser.id !== id
        ) {
          throw new ConflictException(
            'El correo ya está registrado',
          );
        }
      }

      user.email = email;
    }

    if (updateUserDto.name) {
      user.name =
        updateUserDto.name.trim();
    }

    if (updateUserDto.password) {
      user.password =
        await bcrypt.hash(
          updateUserDto.password,
          10,
        );
    }

    if (updateUserDto.role) {
      user.role =
        updateUserDto.role;
    }

    if (
      updateUserDto.is_active !==
      undefined
    ) {
      user.is_active =
        updateUserDto.is_active;
    }

    const updatedUser =
      await this.userRepository.save(
        user,
      );

    return this.removePassword(
      updatedUser,
    );
  }

  async remove(
    id: string,
  ): Promise<{
    message: string;
  }> {
    const user =
      await this.findOneEntity(id);

    await this.userRepository.remove(
      user,
    );

    return {
      message:
        'Usuario eliminado correctamente',
    };
  }

  private normalizeEmail(
    email: string,
  ): string {
    return email
      .trim()
      .toLowerCase();
  }

  private removePassword(
    user: User,
  ): SafeUser {
    const {
      password: _password,
      ...safeUser
    } = user;

    return safeUser;
  }
}