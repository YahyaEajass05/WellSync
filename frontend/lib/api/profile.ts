import axiosInstance from './axios-instance';
import type {
  ApiResponse,
  MentalWellnessProfile,
  StudentProfile,
  ScreenTimeLog,
  SleepRecord,
  ProfileOverview,
} from '@/types';

// Mental Wellness Profile:

export const profileApi = {
  // Get profile overview
  getOverview: async (): Promise<ProfileOverview> => {
    const res = await axiosInstance.get<ApiResponse<ProfileOverview>>('/profiles/overview');
    return res.data.data!;
  },

  // Mental Wellness:
  getMentalWellnessProfile: async (): Promise<{ profile: MentalWellnessProfile; readinessScore: number } | null> => {
    try {
      const res = await axiosInstance.get<ApiResponse<{ profile: MentalWellnessProfile; readinessScore: number }>>(
        '/profiles/mental-wellness'
      );
      return res.data.data!;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  saveMentalWellnessProfile: async (
    data: Partial<MentalWellnessProfile>
  ): Promise<{ profile: MentalWellnessProfile; readinessScore: number }> => {
    const res = await axiosInstance.post<ApiResponse<{ profile: MentalWellnessProfile; readinessScore: number }>>(
      '/profiles/mental-wellness',
      data
    );
    return res.data.data!;
  },

  // Student Profile:
  getStudentProfile: async (): Promise<{ profile: StudentProfile; summary: any; riskScore: number } | null> => {
    try {
      const res = await axiosInstance.get<ApiResponse<{ profile: StudentProfile; summary: any; riskScore: number }>>(
        '/profiles/student'
      );
      return res.data.data!;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  saveStudentProfile: async (
    data: Partial<StudentProfile>
  ): Promise<{ profile: StudentProfile; summary: any }> => {
    const res = await axiosInstance.post<ApiResponse<{ profile: StudentProfile; summary: any }>>(
      '/profiles/student',
      data
    );
    return res.data.data!;
  },

  // Screen Time:
  getScreenTime: async (days = 7): Promise<{ trends: ScreenTimeLog[]; weeklyAverage: any; stats: any }> => {
    const res = await axiosInstance.get<ApiResponse<{ trends: ScreenTimeLog[]; weeklyAverage: any; stats: any }>>(
      `/profiles/screen-time?days=${days}`
    );
    return res.data.data!;
  },

  logScreenTime: async (data: {
    screenTimeHours: number;
    workScreenHours?: number;
    leisureScreenHours?: number;
    eyeStrain?: boolean;
    headache?: boolean;
    mood?: string;
    notes?: string;
    date?: string;
  }): Promise<{ log: ScreenTimeLog; warnings: string[]; isExcessive: boolean }> => {
    const res = await axiosInstance.post<ApiResponse<{ log: ScreenTimeLog; warnings: string[]; isExcessive: boolean }>>(
      '/profiles/screen-time',
      data
    );
    return res.data.data!;
  },

  // Sleep:
  getSleep: async (days = 7): Promise<{ records: SleepRecord[]; weeklyAverage: any; totalRecords: number }> => {
    const res = await axiosInstance.get<
      ApiResponse<{ records: SleepRecord[]; weeklyAverage: any; totalRecords: number }>
    >(`/profiles/sleep?days=${days}`);
    return res.data.data!;
  },

  logSleep: async (data: {
    sleepHours: number;
    sleepQuality: number;
    bedtime?: string;
    wakeTime?: string;
    sleepInterruptions?: number;
    screenBeforeSleep?: boolean;
    caffeine?: boolean;
    mood?: string;
    notes?: string;
    date?: string;
  }): Promise<{ record: SleepRecord; isHealthy: boolean }> => {
    const res = await axiosInstance.post<ApiResponse<{ record: SleepRecord; isHealthy: boolean }>>(
      '/profiles/sleep',
      data
    );
    return res.data.data!;
  },
};
