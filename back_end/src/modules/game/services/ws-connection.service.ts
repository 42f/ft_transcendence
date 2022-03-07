import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { User } from 'src/modules/users/entities/users.entity';
import { UpdateUserDto } from '../../users/dtos/update-users.dto';
import { UsersService } from '../../users/service-users/users.service';
import { ScoreDto } from '../dto/gameplay.dto';
import { Game } from '../entities/game.entity';
import { myPtoOnlineGameDto, myPtoUserDto, sleep } from '../utils/utils';
import { GameService } from './game.service';
import { WsGameService } from './ws-game.service';

@Injectable()
export class WsConnectionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly usersService: UsersService,
    private readonly gameService: GameService,
    private readonly wsGameService: WsGameService,
  ) {}

  private readonly logger = new Logger('WsConnectionService');

  private async updateUser(client: Socket, userData: UpdateUserDto) {
    await this.usersService
      .find({ game_ws: client.id })
      .then(async (users) => {
        if (users[0]) {
          await this.usersService.update(users[0].id, userData);
        }
      })
      .catch((error) => {
        this.logger.debug(error.message);
        client._error({ message: error.message });
        return client.disconnect();
      });
  }

  private doHandleConnectionFailure(client: Socket, errorMessage: string) {
    this.logger.debug(
      `handleConnectionFAILURE: client ${client.id} disconnected !🛑  -> `,
      errorMessage,
    );
    client._error({ message: errorMessage });
    client.disconnect();
  }

  private async getUserIdFromToken(token: string) {
    if (token) {
      return await this.cacheManager.get<string>(token);
    }
  }

  async doHandleConnection(client: Socket): Promise<void> {
    const { key: token } = client.handshake.auth;
    const userId = await this.getUserIdFromToken(token).catch((error) => {
      this.doHandleConnectionFailure(client, error.message);
    });

    if (!userId) {
      return this.doHandleConnectionFailure(client, 'invalid token');
    }
    this.logger.log(`handleConnection:\n${client.id} | token ${token}`);

    await this.usersService
      .update(userId, {
        game_ws: client.id,
        is_in_game: false,
      })
      .catch((error) => {
        this.doHandleConnectionFailure(client, error.message);
      });

    this.logger.log(`handleConnection: Client connected ! ✅`);
  }

  private async waitReconnection(server: Server, user: User, game: Game) {
    this.logger.log(`waitReconnection: ${user.login} - ${game.id}`);
    let usr: User;
    await sleep(1000);
    for (let i = 8; i >= 0; i--) {
      [usr] = await this.usersService.findOneWithAnyParam(
        [{ id: user.id }],
        null,
      );
      if (usr.game_ws && usr.ws_id) {
        const [updatedGame] = await this.gameService.findGameWithAnyParam(
          [{ id: game.id }],
          {
            relations: ['players', 'players.user', 'players.user.local_photo'],
          },
        );
        if (!updatedGame.watch) return;
        await this.usersService.updateUser(usr, { is_in_game: true });
        server
          .to(usr.game_ws)
          .emit('goBackInGame', myPtoOnlineGameDto(updatedGame));
        server.in(usr.game_ws).socketsJoin([game.id, game.watch]);
        server
          .to([game.id, game.watch])
          .except(usr.game_ws)
          .emit('playerCameBack', myPtoUserDto(usr));
        return;
      }
      await sleep(500);
    }
    await this.wsGameService.handleGameEnd(usr.game_ws, game, server, user);
  }

  private async handleGameDisconnection(server: Server, user: User) {
    this.logger.log(`handleGameDisconnection: ${user.login}`);
    const [game] = await this.gameService.findGameWithAnyParam(
      [{ id: user.players[user.players.length - 1].game.id }],
      { relations: ['players', 'players.user', 'players.user.local_photo'] },
    );
    server
      .to([game.id, game.watch])
      .emit('playerDisconnection', myPtoUserDto(user));
    this.waitReconnection(server, user, game);
  }

  async doHandleDisconnect(client: Socket, server: Server) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const [user] = await this.usersService.findOneWithAnyParam(
      [{ game_ws: client.id }],
      { relations: ['players', 'players.game'] },
    );
    if (user && user.is_in_game && user.players && user.players.length > 0)
      await this.handleGameDisconnection(server, user);
    await this.updateUser(client, {
      game_ws: null,
      is_in_game: false,
    });
  }
}
