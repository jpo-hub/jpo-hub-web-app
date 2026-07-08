import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  describe('login', () => {
    it('should call service.login with email and password', async () => {
      const mockToken = { accessToken: 'jwt-token' };
      service.login.mockResolvedValue(mockToken as any);

      const result = await controller.login({
        email: 'admin@test.com',
        password: 'password',
      } as any);

      expect(service.login).toHaveBeenCalledWith('admin@test.com', 'password');
      expect(result).toEqual(mockToken);
    });
  });
});
