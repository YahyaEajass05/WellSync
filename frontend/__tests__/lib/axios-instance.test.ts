import axiosInstance from '@/lib/api/axios-instance';

describe('axiosInstance', () => {
  it('has correct baseURL', () => {
    expect(axiosInstance.defaults.baseURL).toContain('localhost:5000');
  });

  it('has correct timeout', () => {
    expect(axiosInstance.defaults.timeout).toBe(30000);
  });

  it('has Content-Type header set to application/json', () => {
    const headers = axiosInstance.defaults.headers as any;
    expect(headers['Content-Type'] || headers.common?.['Content-Type'] || headers.post?.['Content-Type']).toBe('application/json');
  });

  it('is an axios instance with interceptors', () => {
    expect(axiosInstance.interceptors).toBeDefined();
    expect(axiosInstance.interceptors.request).toBeDefined();
    expect(axiosInstance.interceptors.response).toBeDefined();
  });

  it('has get, post, put, delete methods', () => {
    expect(typeof axiosInstance.get).toBe('function');
    expect(typeof axiosInstance.post).toBe('function');
    expect(typeof axiosInstance.put).toBe('function');
    expect(typeof axiosInstance.delete).toBe('function');
  });
});
