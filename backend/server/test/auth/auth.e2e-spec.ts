import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import {
  // MAIL_HOST,
  // MAIL_PORT,
  TESTER_EMAIL1,
  TESTER_PASSWORD1,
} from '../utils/constants';

// const mail = `http://${MAIL_HOST}:${MAIL_PORT}`;
// const newUserFirstName = `Tester${Date.now()}`;
// const newUserLastName = `E2E`;
// const newUserEmail = `User.${Date.now()}@example.com`;
// const newUserPassword = `secret`;

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Obtain an access token for use in tests
    const loginResponse = await request(app.getHttpServer())
      .post('http://api.localhost/auth/login')
      .send({
        email: TESTER_EMAIL1,
        password: TESTER_PASSWORD1,
      })
      .expect(HttpStatus.OK);

    accessToken = loginResponse.body.data.accessToken;
    refreshToken = loginResponse.body.data.refreshToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('signup with a new email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: TESTER_EMAIL1,
        password: TESTER_PASSWORD1,
      });

    expect([HttpStatus.CREATED, HttpStatus.CONFLICT]).toContain(
      response.status,
    );
  });

  it('signup with existing email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: TESTER_EMAIL1,
        password: TESTER_PASSWORD1,
      })
      .expect(HttpStatus.CONFLICT);
  });

  it('login with correct credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TESTER_EMAIL1,
        password: TESTER_PASSWORD1,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    refreshToken = response.body.data.refreshToken;
  });

  it('login with incorrect credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TESTER_EMAIL1,
        password: 'wrongpassword',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('logout', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
  });

  it('refresh access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .send({ token: refreshToken })
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveProperty('accessToken');
  });

  it('get user profile after login', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('content-type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
  });
});
