import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/guard';
import { EditEventDto, EventDto } from './dto';
import { EventService } from './event.service';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
  ) {}
  @Get()
  getEvents(@GetUser('id') userId: number) {
    return this.eventService.getEvents(userId);
  }

  @Get(':id')
  getEventById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventId: number,
  ) {
    return this.eventService.getEventById(userId, eventId);
  }

  @Post()
  createEvent(
    @GetUser('id') userId: number,
    @Body() dto: EventDto,
  ) {
    return this.eventService.createEvent(userId, dto);
  }

  @Patch(':id')
  editEventById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventId: number,
    @Body() dto: EditEventDto,
  ) {
    return this.eventService.editEventById(
      userId,
      eventId,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteEventById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventId: number,
  ) {
    return this.eventService.deleteEventById(
      userId,
      eventId,
    );
  }
}
