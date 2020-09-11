import { HttpRestApiModelCreateUserBody } from '@application/api/http-rest/controller/documentation/user/HttpRestApiModelCreateUserBody';
import { Code } from '@core/common/code/Code';
import { UserRole } from '@core/common/enums/UserEnums';
import { Optional } from '@core/common/type/CommonTypes';
import { UserDITokens } from '@core/domain/user/di/UserDITokens';
import { User } from '@core/domain/user/entity/User';
import { UserRepositoryPort } from '@core/domain/user/port/persistence/UserRepositoryPort';
import { CreateUserAdapter } from '@infrastructure/adapter/usecase/user/CreateUserAdapter';
import { HttpStatus } from '@nestjs/common';
import { ExpectTest } from '@test/.common/ExpectTest';
import { UserFixture } from '@test/e2e/fixture/UserFixture';
import * as supertest from 'supertest';
import { v4 } from 'uuid';
import { TestServer } from '../.common/TestServer';

describe('User', () => {
  
  describe('POST /users/account', () => {
    
    let testServer: TestServer;
    let userFixture: UserFixture;
    
    let userRepository: UserRepositoryPort;
    
    beforeAll(async () => {
      testServer = await TestServer.new();
      userFixture = UserFixture.new(testServer.testingModule);
  
      userRepository = testServer.testingModule.get(UserDITokens.UserRepository);
      
      await testServer.serverApplication.init();
    });
    
    test('Expect it creates guest account', async () => {
      await expectItCreatesAccount(UserRole.GUEST, testServer, userRepository);
    });
  
    test('Expect it creates author account', async () => {
      await expectItCreatesAccount(UserRole.AUTHOR, testServer, userRepository);
    });
  
    test('When user already exists, expect it returns ENTITY_ALREADY_EXISTS_ERROR response', async () => {
      const body: HttpRestApiModelCreateUserBody = {
        firstName  : v4(),
        lastName   : v4(),
        email      : `${v4()}@email.com`,
        role       : UserRole.AUTHOR,
        password   : v4(),
      };
  
      await userFixture.insertUser({role: body.role, email: body.email, password: body.password});
    
      const response: supertest.Response = await supertest(testServer.serverApplication.getHttpServer())
        .post('/users/account')
        .send(body)
        .expect(HttpStatus.OK);
      
      ExpectTest.expectResponseCodeAndMessage(response.body, {code: Code.ENTITY_ALREADY_EXISTS_ERROR.code, message: 'User already exists.'});
      ExpectTest.expectResponseData({response: response.body}, null);
    });
  
    test('When body is not valid, expect it returns USE_CASE_PORT_VALIDATION_ERROR response', async () => {
      const body: Record<string, unknown> = {
        firstName  : 1337,
        lastName   : null,
        email      : 'not email',
        role       : UserRole.ADMIN,
        password   : 42,
      };
      
      const response: supertest.Response = await supertest(testServer.serverApplication.getHttpServer())
        .post('/users/account')
        .send(body)
        .expect(HttpStatus.OK);
    
      expect(response.body.data.context).toBe(CreateUserAdapter.name);
      expect(response.body.data.errors.map((error: Record<string, unknown>) => error.property)).toEqual(['firstName', 'lastName', 'email', 'role', 'password']);
      
      ExpectTest.expectResponseCodeAndMessage(response.body, {code: Code.USE_CASE_PORT_VALIDATION_ERROR.code, message: Code.USE_CASE_PORT_VALIDATION_ERROR.message});
    });
    
    afterAll(async () => {
      if (testServer) {
        await testServer.serverApplication.close();
      }
    });
    
  });
  
});

async function expectItCreatesAccount(role: UserRole, testServer: TestServer, userRepository: UserRepositoryPort): Promise<void> {
  const body: HttpRestApiModelCreateUserBody = {
    firstName  : v4(),
    lastName   : v4(),
    email      : `${v4()}@email.com`,
    role       : role,
    password   : v4(),
  };
  
  const response: supertest.Response = await supertest(testServer.serverApplication.getHttpServer())
    .post('/users/account')
    .send(body)
    .expect(HttpStatus.OK);
  
  const createdUser: Optional<User> = await userRepository.findUser({email: body.email});
  
  const expectedData: Record<string, unknown> = {
    id       : createdUser!.getId(),
    firstName: body.firstName,
    lastName : body.lastName,
    email    : body.email,
    role     : body.role
  };
  
  expect(createdUser).toBeDefined();
  
  ExpectTest.expectResponseCodeAndMessage(response.body, {code: Code.SUCCESS.code, message: Code.SUCCESS.message});
  ExpectTest.expectResponseData({response: response.body, passFields: ['id', 'firstName', 'lastName', 'email', 'role']}, expectedData);
}