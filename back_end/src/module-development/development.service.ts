import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../module-users/entities/users.entity';
import { UsersService } from '../module-users/service-users/users.service';

@Injectable()
export class DevelopmentService {
  constructor(private usersService: UsersService) {}

  async dev_logUser(login: string) {
    const users = await this.usersService.find(login);
    if (!users[0]) {
      throw new BadRequestException(`No user ${login}`);
    }
    return this.usersService.create(users[0]).catch((error) => {
      throw new InternalServerErrorException(error.message);
    });
  }

  async dev_createUserBatch(users: Partial<User>) {
    return await this.usersService.create(users);
  }

  async dev_deleteUserBatch(users: Partial<User>[]) {
    users.forEach(async (val) => {
      if (!val.login) {
        throw new BadRequestException('missing login');
      }
      return await this.usersService
        .remove(val.login)
        .then((val) => val)
        .catch((e) => {
          throw new BadRequestException(e.message);
        });
    });
  }

  async dev_getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  async dev_deleteAllUser() {
    const users = await this.usersService.getAllUsers();
    await this.dev_deleteUserBatch(users);
  }
}
