import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getWellnessColor(score: number): string {
  if (score >= 70) return 'hsl(142, 71%, 45%)'; // High - Green
  if (score >= 40) return 'hsl(48, 96%, 53%)'; // Medium - Yellow
  return 'hsl(0, 84%, 60%)'; // Low - Red
}

export function getWellnessInterpretation(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
}

export function getStressLevelCategory(score: number): string {
  if (score <= 3) return 'Low Stress';
  if (score <= 6) return 'Moderate Stress';
  if (score <= 8) return 'High Stress';
  return 'Very High Stress';
}
