import { Injectable } from '@nestjs/common';
import { EditUserDto } from './user/dto';

@Injectable()
export class AppService {
  getHello(userId: number, dto: EditUserDto): string {
    return 'Hello World!';
  }
}
