import { authApi } from '@/lib/api/auth';
import axiosInstance from '@/lib/api/axios-instance';

jest.mock('@/lib/api/axios-instance', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const mockUser = {
  id: '1', firstName: 'John', lastName: 'Doe', fullName: 'John Doe',
  email: 'john@example.com', role: 'user', isEmailVerified: true, createdAt: '2024-01-01',
};

describe('authApi', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('login', () => {
    it('calls POST /auth/login with credentials', async () => {
      (mockedAxios.post as jest.Mock).mockResolvedValue({
        data: { success: true, data: { token: 'tok123', user: mockUser } },
      });
      const result = await authApi.login({ email: 'john@example.com', password: 'password123' });
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', { email: 'john@example.com', password: 'password123' });
      expect(result.token).toBe('tok123');
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('register', () => {
    it('calls POST /auth/register with data', async () => {
      (mockedAxios.post as jest.Mock).mockResolvedValue({
        data: { success: true, data: { token: 'tok456', user: mockUser } },
      });
      const registerData = {
        firstName: 'John', lastName: 'Doe', email: 'john@example.com',
        password: 'password123', confirmPassword: 'password123',
      };
      const result = await authApi.register(registerData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result.token).toBe('tok456');
    });
  });

  describe('getMe', () => {
    it('calls GET /auth/me and returns user', async () => {
      (mockedAxios.get as jest.Mock).mockResolvedValue({
        data: { success: true, data: { user: mockUser } },
      });
      const result = await authApi.getMe();
      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('calls POST /auth/logout', async () => {
      (mockedAxios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
      await authApi.logout();
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('forgotPassword', () => {
    it('calls POST /auth/forgot-password with email', async () => {
      (mockedAxios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
      await authApi.forgotPassword('john@example.com');
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'john@example.com' });
    });
  });

  describe('resetPassword', () => {
    it('calls POST /auth/reset-password with code, password, email', async () => {
      (mockedAxios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
      await authApi.resetPassword('123456', 'newpass123', 'john@example.com');
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/reset-password', {
        code: '123456', password: 'newpass123', email: 'john@example.com',
      });
    });
  });

  describe('changePassword', () => {
    it('calls PUT /auth/change-password', async () => {
      (mockedAxios.put as jest.Mock).mockResolvedValue({ data: { success: true } });
      await authApi.changePassword('oldpass', 'newpass');
      expect(mockedAxios.put).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'oldpass', newPassword: 'newpass',
      });
    });
  });
});
