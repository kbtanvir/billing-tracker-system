// import { Routes } from '@app/common/constant/routes.constant';
// import { ControllersEnum } from '@app/common/enum';
// import { HttpStatus, INestApplication } from '@nestjs/common';
// import { Test } from '@nestjs/testing';
// import { AppModule } from 'src/app.module';
// import * as request from 'supertest';
// import {
//   TESTER_EMAIL1,
//   TESTER_EMAIL2,
//   TESTER_PASSWORD1,
//   TESTER_PASSWORD2,
// } from '../utils/constants';

// describe('Projects Endpoints (e2e)', () => {
//   let app: INestApplication;
//   let accessToken1: string;
//   let refreshToken1: string;
//   let accessToken2: string;
//   let refreshToken2: string;
//   const space1 = 'test1';
//   const space2 = 'test2';
//   let project1Id: string;
//   let project2Id: string;

//   beforeAll(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleRef.createNestApplication();
//     await app.init();

//     // Obtain access tokens for use in tests
//     const loginResponse = await request(app.getHttpServer())
//       .post('/auth/login')
//       .send({
//         email: TESTER_EMAIL1,
//         password: TESTER_PASSWORD1,
//       })
//       .expect(HttpStatus.OK);

//     accessToken1 = loginResponse.body.data.accessToken;
//     refreshToken1 = loginResponse.body.data.refreshToken;

//     const loginResponse2 = await request(app.getHttpServer())
//       .post('/auth/login')
//       .send({
//         email: TESTER_EMAIL2,
//         password: TESTER_PASSWORD2,
//       })
//       .expect(HttpStatus.OK);

//     accessToken2 = loginResponse2.body.data.accessToken;
//     refreshToken2 = loginResponse2.body.data.refreshToken;
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   it('User uploads with no accesstoken', async () => {
//     const response = await request(app.getHttpServer())
//       .post(Routes[ControllersEnum.Project].create) // :space - test1
//       .attach('files', 'sites/html/test/index.html')
//       .attach('files', 'sites/html/test/about.html')
//       .attach('files', 'sites/html/test/contact2.html');

//     expect(response).toBeUndefined();
//   });

//   it('User uploads files and creates projects', async () => {
//     const response = await request(app.getHttpServer())
//       .post(Routes[ControllersEnum.Project].create) // :space - test1
//       .set('Authorization', `Bearer ${accessToken1}`)
//       .attach('files', 'sites/html/test/index.html')
//       .attach('files', 'sites/html/test/about.html')
//       .attach('files', 'sites/html/test/contact2.html')
//       .catch((err) => {
//         throw err;
//       });

//     expect(response.status).toBe(HttpStatus.CREATED);
//     expect(response.body.data.freeDomainUrl).toBeDefined();
//     project1Id = response.body.data.projectId;
//   });

//   it('User creates project with no files', async () => {
//     const response = await request(app.getHttpServer())
//       .post(Routes[ControllersEnum.Project].create) // :space - test1
//       .set('Authorization', `Bearer ${accessToken1}`)
//       .catch((err) => {
//         throw err;
//       });

//     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//   });

//   it('User creates project with empty array files', async () => {
//     const response = await request(app.getHttpServer())
//       .post(Routes[ControllersEnum.Project].create)
//       .set('Authorization', `Bearer ${accessToken1}`)
//       .attach('files', '')
//       .catch((err) => {
//         throw err;
//       });

//     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//   });

//   // it('User uploads multiple files to a new space - expect new project ID and public URL', async () => {
//   //   const response = await request(app.getHttpServer())
//   //     .post(`/project/upload/multiple/${space2}`) // :space - test2
//   //     .set('Authorization', `Bearer ${accessToken1}`)
//   //     .attach('files', 'sites/html/test/index.html')
//   //     .attach('files', 'sites/html/test/about.html')
//   //     .attach('files', 'sites/html/test/contact2.html')
//   //     .catch((err) => {
//   //       console.error('Upload test failed:', err);
//   //       throw err;
//   //     });

//   //   expect(response.status).toBe(HttpStatus.CREATED);
//   //   expect(response.body.data.freeDomainUrl).toBeDefined();
//   //   project2Id = response.body.data.projectId;
//   //   // Ensure that the new space creates a new project ID
//   //   expect(project2Id).not.toEqual(project1Id);
//   // });

//   // it('User uploads multiple files with unsupported file types - expect error response', async () => {
//   //   const response = await request(app.getHttpServer())
//   //     .post(`/project/upload/multiple/${space1}`) // :space - test1
//   //     .set('Authorization', `Bearer ${accessToken1}`)
//   //     .attach('files', 'sites/html/test/malware.exe')
//   //     .catch((err) => {
//   //       console.error('Upload test failed:', err);
//   //       throw err;
//   //     });

//   //   expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//   //   expect(response.body.message).toBe('Unsupported file type');
//   // });

//   // // it('User uploads files exceeding maximum allowed size - expect error response', async () => {
//   // //   const response = await request(app.getHttpServer())
//   // //     .post(`/project/upload/multiple/${space1}`) // :space - test1
//   // //     .set('Authorization', `Bearer ${accessToken}`)
//   // //     .attach('files', 'sites/html/test/largefile.pdf', { filename: 'largefile.pdf', size: 50000000 }) // adjust size as needed
//   // //     .catch((err) => {
//   // //       console.error('Upload test failed:', err);
//   // //       throw err;
//   // //     });

//   // //   expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//   // //   expect(response.body.message).toBe('File size exceeds limit');
//   // // });

//   // it('User uploads files with missing or invalid authorization - expect unauthorized error', async () => {
//   //   const response = await request(app.getHttpServer())
//   //     .post(`/project/upload/multiple/${space1}`) // :space - test1
//   //     .attach('files', 'sites/html/test/index.html')
//   //     .catch((err) => {
//   //       console.error('Upload test failed:', err);
//   //       throw err;
//   //     });

//   //   expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
//   //   expect(response.body.message).toBe('Unauthorized');
//   // });

//   // it('User uploads files to a space with existing files - verify existing files are not overwritten', async () => {
//   //   await request(app.getHttpServer())
//   //     .post(`/project/upload/multiple/${space1}`) // :space - test1
//   //     .set('Authorization', `Bearer ${accessToken1}`)
//   //     .attach('files', 'sites/html/test/index.html');

//   //   const response = await request(app.getHttpServer())
//   //     .post(`/project/upload/multiple/${space1}`) // :space - test1
//   //     .set('Authorization', `Bearer ${accessToken1}`)
//   //     .attach('files', 'sites/html/test/newfile.html')
//   //     .catch((err) => {
//   //       console.error('Upload test failed:', err);
//   //       throw err;
//   //     });

//   //   expect(response.status).toBe(HttpStatus.CREATED);
//   //   // Verify that existing files are not overwritten
//   //   expect(response.body.data.projectId).toEqual(project1Id);
//   // });

//   // // it('User uploads files and includes metadata (e.g., tags or descriptions) - verify metadata is stored', async () => {
//   // //   const response = await request(app.getHttpServer())
//   // //     .post(`/project/upload/multiple/${space1}`) // :space - test1
//   // //     .set('Authorization', `Bearer ${accessToken}`)
//   // //     .attach('files', 'sites/html/test/index.html', { tags: ['tag1'], description: 'Test file' })
//   // //     .catch((err) => {
//   // //       console.error('Upload test failed:', err);
//   // //       throw err;
//   // //     });

//   // //   expect(response.status).toBe(HttpStatus.CREATED);
//   // //   // Verify that metadata is stored correctly
//   // //   expect(response.body.data.metadata).toEqual({ tags: ['tag1'], description: 'Test file' });
//   // // });

//   // it('User uploads large number of files - check for performance and scalability', async () => {
//   //   const files = Array.from({ length: 100 }).map((_, index) => ({
//   //     name: `file${index}.html`,
//   //     path: `sites/html/test/file${index}.html`,
//   //   }));

//   //   const requests = files.map((file) =>
//   //     request(app.getHttpServer())
//   //       .post(`/project/upload/multiple/${space1}`) // :space - test1
//   //       .set('Authorization', `Bearer ${accessToken1}`)
//   //       .attach('files', file.path),
//   //   );

//   //   const responses = await Promise.all(requests);
//   //   responses.forEach((response) => {
//   //     expect(response.status).toBe(HttpStatus.CREATED);
//   //   });
//   // });

//   // it('User uploads files with special characters in file names - verify filenames are handled correctly', async () => {
//   //   const response = await request(app.getHttpServer())
//   //     .post(`/project/upload/multiple/${space1}`) // :space - test1
//   //     .set('Authorization', `Bearer ${accessToken1}`)
//   //     .attach('files', 'sites/html/test/file with spaces.html')
//   //     .attach('files', 'sites/html/test/file@special#chars.html')
//   //     .catch((err) => {
//   //       console.error('Upload test failed:', err);
//   //       throw err;
//   //     });

//   //   expect(response.status).toBe(HttpStatus.CREATED);
//   //   // Ensure special characters are handled correctly
//   //   expect(response.body.data.freeDomainUrl).toBeDefined();
//   // });

//   // TODO: User views list of projects /projects GET

//   it('User views list of owned projects', async () => {
//     const response = await request(app.getHttpServer())
//       .get(Routes[ControllersEnum.Project].list)
//       .set('Authorization', `Bearer ${accessToken1}`)
//       .catch((err) => {
//         throw err;
//       });

//     expect(response.status).toBe(HttpStatus.OK);
//   });

//   // TODO: User fetches project settings /projects/id/settings GET

//   // TODO: User checks bucketKey availability /projects/space/availability GET

//   // TODO: User updates subdomain name /projects/id/subdomain
// });
