import {
  Body, Controller, Delete, Get, Post, Session, UseGuards
} from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { DevGuard } from '../guards/dev.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { privateUserDto } from '../module-users/dtos/private-user.dto';
import { UserDto } from '../module-users/dtos/user.dto';
import { User } from '../module-users/entities/users.entity';
import { DevelopmentService } from './development.service';

@ApiTags('DevTools')
@Serialize(privateUserDto)
@UseGuards(DevGuard)
@Controller('dev')
export class DevelopmentController {
  constructor(private developmentService: DevelopmentService) {}

  @ApiProperty()
  @Post('/signin')
  async logDebugUser(@Body() user: Partial<User>, @Session() session: any) {
    const newUser = await this.developmentService.dev_logUser(user.login);
    session.userId = newUser.id;
    session.useTwoFA = newUser.useTwoFA;
    session.isTwoFAutanticated = false;
    return newUser;
  }

  @ApiProperty()
  @Get('/users')
  async getAllUsers() {
    return this.developmentService.dev_getAllUsers();

  }

  @ApiProperty()
  @Post('/createUserBatch')
  async createUserBatch(
    @Body() body: UserDto[] | UserDto,
    ) {
      let successCreation = 0;
      const users: Partial<User>[] = body as UserDto[];
      for (const user of users) {
         await this.developmentService.dev_createUserBatch(user)
          .then((value) => { successCreation++; })
          .catch((err) => {});
      };
      return await this.developmentService.dev_getAllUsers();
    }

  @ApiProperty()
  @Delete('/deleteUserBatch')
  async deleteUserBatch(
    @Body() body: { login: string }[],
  ) {
    await this.developmentService.dev_deleteUserBatch(body);
  }

  @ApiProperty()
  @Delete('/deleteAllUsers')
  async deleteAllUsers() {
    await this.developmentService.dev_deleteAllUser();
  }
}
