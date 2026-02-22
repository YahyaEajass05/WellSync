import {
  APP_NAME,
  APP_DESCRIPTION,
  API_URL,
  ROUTES,
  PREDICTION_TYPES,
  WELLNESS_THRESHOLDS,
  STRESS_THRESHOLDS,
} from '@/lib/constants';

describe('App constants', () => {
  it('APP_NAME is WellSync', () => {
    expect(APP_NAME).toBe('WellSync');
  });
  it('APP_DESCRIPTION is defined and non-empty', () => {
    expect(APP_DESCRIPTION).toBeTruthy();
    expect(typeof APP_DESCRIPTION).toBe('string');
  });
  it('API_URL defaults to localhost:5000', () => {
    expect(API_URL).toContain('localhost:5000');
  });
});

describe('ROUTES', () => {
  it('HOME is /', () => expect(ROUTES.HOME).toBe('/'));
  it('LOGIN is /login', () => expect(ROUTES.LOGIN).toBe('/login'));
  it('REGISTER is /register', () => expect(ROUTES.REGISTER).toBe('/register'));
  it('DASHBOARD is /dashboard', () => expect(ROUTES.DASHBOARD).toBe('/dashboard'));
  it('PREDICTIONS is /predictions', () => expect(ROUTES.PREDICTIONS).toBe('/predictions'));
  it('ANALYTICS is /analytics', () => expect(ROUTES.ANALYTICS).toBe('/analytics'));
  it('PROFILE is /profile', () => expect(ROUTES.PROFILE).toBe('/profile'));
  it('SETTINGS is /settings', () => expect(ROUTES.SETTINGS).toBe('/settings'));
  it('ADMIN is /admin', () => expect(ROUTES.ADMIN).toBe('/admin'));
  it('ADMIN_USER_DETAILS generates path with id', () => {
    expect(ROUTES.ADMIN_USER_DETAILS('abc123')).toBe('/admin/users/abc123');
  });
  it('ADMIN_USER_DETAILS handles different ids', () => {
    expect(ROUTES.ADMIN_USER_DETAILS('xyz')).toBe('/admin/users/xyz');
  });
});

describe('PREDICTION_TYPES', () => {
  it('has MENTAL_WELLNESS', () => expect(PREDICTION_TYPES.MENTAL_WELLNESS).toBe('mental_wellness'));
  it('has ACADEMIC_IMPACT', () => expect(PREDICTION_TYPES.ACADEMIC_IMPACT).toBe('academic_impact'));
  it('has STRESS_LEVEL', () => expect(PREDICTION_TYPES.STRESS_LEVEL).toBe('stress_level'));
});

describe('WELLNESS_THRESHOLDS', () => {
  it('EXCELLENT is 80', () => expect(WELLNESS_THRESHOLDS.EXCELLENT).toBe(80));
  it('GOOD is 70', () => expect(WELLNESS_THRESHOLDS.GOOD).toBe(70));
  it('FAIR is 60', () => expect(WELLNESS_THRESHOLDS.FAIR).toBe(60));
  it('NEEDS_ATTENTION is 40', () => expect(WELLNESS_THRESHOLDS.NEEDS_ATTENTION).toBe(40));
  it('thresholds are in descending order', () => {
    expect(WELLNESS_THRESHOLDS.EXCELLENT).toBeGreaterThan(WELLNESS_THRESHOLDS.GOOD);
    expect(WELLNESS_THRESHOLDS.GOOD).toBeGreaterThan(WELLNESS_THRESHOLDS.FAIR);
    expect(WELLNESS_THRESHOLDS.FAIR).toBeGreaterThan(WELLNESS_THRESHOLDS.NEEDS_ATTENTION);
  });
});

describe('STRESS_THRESHOLDS', () => {
  it('LOW is 3', () => expect(STRESS_THRESHOLDS.LOW).toBe(3));
  it('MODERATE is 6', () => expect(STRESS_THRESHOLDS.MODERATE).toBe(6));
  it('HIGH is 8', () => expect(STRESS_THRESHOLDS.HIGH).toBe(8));
  it('thresholds are in ascending order', () => {
    expect(STRESS_THRESHOLDS.LOW).toBeLessThan(STRESS_THRESHOLDS.MODERATE);
    expect(STRESS_THRESHOLDS.MODERATE).toBeLessThan(STRESS_THRESHOLDS.HIGH);
  });
});
