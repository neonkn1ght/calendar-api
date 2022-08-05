import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditEventDto, EventDto } from './dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  getEvents(userId: number) {
    return this.prisma.event.findMany({
      where: {
        userId,
      },
    });
  }

  getEventById(userId: number, eventId: number) {
    return this.prisma.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
    });
  }

  createEvent(userId: number, dto: EventDto) {
    return this.prisma.event.create({
      data: {
        userId: userId,
        icon: '',
        ...dto,
      },
    });
  }

  async editEventById(
    userId: number,
    eventId: number,
    dto: EditEventDto,
  ) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event || event.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteEventById(userId: number, eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event || event.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });
  }
}
