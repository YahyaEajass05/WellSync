import type {
  User, UserProfile, UserPreferences,
  LoginCredentials, RegisterData, AuthResponse,
  Prediction, PredictionResult,
  MentalWellnessInput, AcademicImpactInput, StressLevelInput,
  DashboardStats, DashboardData,
  Notification, ApiResponse,
} from "@/types";

// Type shape validation tests - these verify our type definitions are correct
describe("Type definitions", () => {
  describe("User type", () => {
    it("accepts valid user object shape", () => {
      const user: User = {
        id: "1", firstName: "John", lastName: "Doe", fullName: "John Doe",
        email: "john@example.com", role: "user", isEmailVerified: true, createdAt: "2024-01-01",
      };
      expect(user.id).toBe("1");
      expect(user.role).toBe("user");
    });
    it("accepts admin role", () => {
      const admin: User = {
        id: "2", firstName: "Admin", lastName: "User", fullName: "Admin User",
        email: "admin@example.com", role: "admin", isEmailVerified: true, createdAt: "2024-01-01",
      };
      expect(admin.role).toBe("admin");
    });
  });

  describe("LoginCredentials type", () => {
    it("accepts email and password", () => {
      const creds: LoginCredentials = { email: "test@test.com", password: "pass123" };
      expect(creds.email).toBe("test@test.com");
    });
  });

  describe("MentalWellnessInput type", () => {
    it("accepts valid mental wellness input shape", () => {
      const input: MentalWellnessInput = {
        age: 22, screen_time_hours: 4, sleep_hours: 7, physical_activity_hours: 1,
        social_media_hours: 2, academic_workload_hours: 5, sleep_quality: 7,
        stress_level: 4, social_support: 6, work_life_balance: 7,
      };
      expect(input.age).toBe(22);
      expect(input.sleep_quality).toBe(7);
    });
  });

  describe("StressLevelInput type", () => {
    it("accepts valid stress level input", () => {
      const input: StressLevelInput = {
        age: 21, workload_hours: 8, sleep_hours: 6,
        social_support: 5, exercise_hours: 1, anxiety_level: 4, depression_symptoms: 3,
      };
      expect(input.workload_hours).toBe(8);
    });
  });

  describe("AcademicImpactInput type", () => {
    it("accepts valid academic impact input", () => {
      const input: AcademicImpactInput = {
        age: 20, gaming_hours: 2, social_media_hours: 3,
        study_hours: 5, sleep_hours: 7, stress_level: 4,
      };
      expect(input.study_hours).toBe(5);
    });
  });

  describe("DashboardStats type", () => {
    it("accepts valid dashboard stats shape", () => {
      const stats: DashboardStats = {
        totalPredictions: 10,
        mentalWellness: { count: 5, averagePrediction: 75 },
        stressLevel: { count: 3, averagePrediction: 4 },
        academicImpact: { count: 2, averagePrediction: 65 },
      };
      expect(stats.totalPredictions).toBe(10);
    });
  });

  describe("Notification type", () => {
    it("accepts valid notification shape", () => {
      const notif: Notification = {
        _id: "n1", user: "u1", type: "info", title: "Test",
        message: "Test message", isRead: false, priority: "medium", createdAt: "2024-01-01",
      };
      expect(notif.priority).toBe("medium");
    });
  });

  describe("ApiResponse type", () => {
    it("accepts success response", () => {
      const res: ApiResponse<{ token: string }> = { success: true, data: { token: "abc" } };
      expect(res.success).toBe(true);
      expect(res.data?.token).toBe("abc");
    });
    it("accepts error response", () => {
      const res: ApiResponse = { success: false, error: "Not found" };
      expect(res.success).toBe(false);
    });
  });

  describe("PredictionResult type", () => {
    it("accepts valid prediction result", () => {
      const result: PredictionResult = {
        prediction: 75,
        interpretation: "Good",
        modelName: "GradientBoosting",
      };
      expect(result.prediction).toBe(75);
    });
  });
});