import { plainToClass } from 'class-transformer';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { RoomDto } from '../dto/room.dto';
import { Room } from '../entities/room.entity';
import { ChatGateway } from '../gateways/chat.gateway';

@EventSubscriber()
export class RoomSubscriber implements EntitySubscriberInterface<Room> {
  constructor(
    private readonly chatGateway: ChatGateway,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Room;
  }

  afterInsert(event: InsertEvent<Room>) {
    if (event.entity.is_private === false) {
      this.chatGateway.sendEventToServer(
        'publicRoomCreated',
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }

  afterRemove(event: RemoveEvent<Room>) {
    if (event.entity.is_private === false) {
      delete event.entity?.participants;
      delete event.entity?.restrictions;
      this.chatGateway.sendEventToServer(
        'publicRoomRemoved',
        plainToClass(RoomDto, event.entity, { excludeExtraneousValues: true }),
      );
    }
  }
}