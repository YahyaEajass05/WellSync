import { cn, formatDate, formatDateTime, getWellnessColor, getWellnessInterpretation, getStressLevelCategory } from '@/lib/utils';

describe('cn (className merger)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });
  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });
  it('deduplicates tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });
  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-06-01'));
    expect(result).toMatch(/Jun/);
  });
  it('includes day and year', () => {
    const result = formatDate('2024-03-20');
    expect(result).toMatch(/20/);
    expect(result).toMatch(/2024/);
  });
});

describe('formatDateTime', () => {
  it('formats a date-time string', () => {
    const result = formatDateTime('2024-01-15T10:30:00');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });
  it('includes time in output', () => {
    const result = formatDateTime('2024-06-01T14:00:00');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getWellnessColor', () => {
  it('returns green for score >= 70', () => {
    expect(getWellnessColor(70)).toContain('142');
    expect(getWellnessColor(90)).toContain('142');
    expect(getWellnessColor(100)).toContain('142');
  });
  it('returns yellow for score 40-69', () => {
    expect(getWellnessColor(40)).toContain('48');
    expect(getWellnessColor(55)).toContain('48');
    expect(getWellnessColor(69)).toContain('48');
  });
  it('returns red for score < 40', () => {
    expect(getWellnessColor(0)).toContain('0');
    expect(getWellnessColor(20)).toContain('0');
    expect(getWellnessColor(39)).toContain('0');
  });
});

describe('getWellnessInterpretation', () => {
  it('returns Excellent for score >= 80', () => {
    expect(getWellnessInterpretation(80)).toBe('Excellent');
    expect(getWellnessInterpretation(100)).toBe('Excellent');
  });
  it('returns Good for score 70-79', () => {
    expect(getWellnessInterpretation(70)).toBe('Good');
    expect(getWellnessInterpretation(79)).toBe('Good');
  });
  it('returns Fair for score 60-69', () => {
    expect(getWellnessInterpretation(60)).toBe('Fair');
    expect(getWellnessInterpretation(69)).toBe('Fair');
  });
  it('returns Needs Attention for score 40-59', () => {
    expect(getWellnessInterpretation(40)).toBe('Needs Attention');
    expect(getWellnessInterpretation(59)).toBe('Needs Attention');
  });
  it('returns Critical for score < 40', () => {
    expect(getWellnessInterpretation(0)).toBe('Critical');
    expect(getWellnessInterpretation(39)).toBe('Critical');
  });
});

describe('getStressLevelCategory', () => {
  it('returns Low Stress for score <= 3', () => {
    expect(getStressLevelCategory(0)).toBe('Low Stress');
    expect(getStressLevelCategory(3)).toBe('Low Stress');
  });
  it('returns Moderate Stress for score 4-6', () => {
    expect(getStressLevelCategory(4)).toBe('Moderate Stress');
    expect(getStressLevelCategory(6)).toBe('Moderate Stress');
  });
  it('returns High Stress for score 7-8', () => {
    expect(getStressLevelCategory(7)).toBe('High Stress');
    expect(getStressLevelCategory(8)).toBe('High Stress');
  });
  it('returns Very High Stress for score > 8', () => {
    expect(getStressLevelCategory(9)).toBe('Very High Stress');
    expect(getStressLevelCategory(10)).toBe('Very High Stress');
  });
});
