import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { EditEventDto, EventDto } from 'src/event/dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const authHeader = {
    Authorization: 'Bearer $S{token}',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3332);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3332');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'k.derba@gmail.com',
      password: 'qwerty',
    };
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            ...dto,
            email: '',
          })
          .expectStatus(400);
      });

      it('should throw if not email', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            ...dto,
            email: 'not_email_formatted',
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            ...dto,
            password: '',
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            ...dto,
            email: '',
          })
          .expectStatus(400);
      });

      it('should throw if not email', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            ...dto,
            email: 'not_email_formatted',
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            ...dto,
            password: '',
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('token', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders(authHeader)
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Konstantin',
        lastName: 'Derba',
      };

      it('should edit user full name', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders(authHeader)
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Event', () => {
    const dto: EventDto = {
      title: 'Urgent meeting',
      description: 'About something important',
      startAt: new Date().toISOString(),
      endAt: new Date().toISOString(),
    };

    describe('Get all', () => {
      it('should get empty events', () => {
        return pactum
          .spec()
          .get('/events')
          .withHeaders(authHeader)
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create', () => {
      it('should create event', () => {
        return pactum
          .spec()
          .post('/events')
          .withHeaders(authHeader)
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .stores('eventId', 'id');
      });
    });

    describe('Get all', () => {
      it('should get events', () => {
        return pactum
          .spec()
          .get('/events')
          .withHeaders(authHeader)
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get by id', () => {
      it('should get event by id', () => {
        return pactum
          .spec()
          .get('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .withHeaders(authHeader)
          .expectStatus(200)
          .expectBodyContains('$S{eventId}')
          .expectBodyContains(dto.title);
      });
    });
    describe('Edit', () => {
      const dto: EditEventDto = {
        description: 'new description',
        title: 'new Title',
      };

      it('should edit event by id', () => {
        return pactum
          .spec()
          .patch('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .withHeaders(authHeader)
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });
    describe('Delete', () => {
      it('should delete event by id', () => {
        return pactum
          .spec()
          .delete('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .withHeaders(authHeader)
          .expectStatus(204);
      });

      it('should get empty events', () => {
        return pactum
          .spec()
          .get('/events')
          .withHeaders(authHeader)
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
