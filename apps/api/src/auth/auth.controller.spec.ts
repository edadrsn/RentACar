
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('giriş isteğini AuthService üzerinden işlemeli', async () => {
    const loginDto = {
      email: 'admin@example.com',
      password: 'test-password',
    };

    const expectedResult = {
      accessToken: 'test-token',
      tokenType: 'Bearer',
    };

    mockAuthService.login.mockResolvedValue(expectedResult);

    const result = await controller.login(loginDto);

    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    expect(result).toEqual(expectedResult);
  });
});
