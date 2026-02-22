import { predictionsApi } from '@/lib/api/predictions';
import axiosInstance from '@/lib/api/axios-instance';

jest.mock('@/lib/api/axios-instance', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockPrediction = { _id: '1', predictionType: 'mental_wellness', result: { prediction: 75 }, isFavorite: false, createdAt: '2024-01-01' };

describe('predictionsApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getPredictions calls GET /predictions', async () => {
    (mockedAxios.get as jest.Mock).mockResolvedValue({ data: { success: true, data: { predictions: [mockPrediction], total: 1 } } });
    const result = await predictionsApi.getPredictions();
    expect(mockedAxios.get).toHaveBeenCalledWith('/predictions', { params: undefined });
    expect(result.predictions).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('predictMentalWellness calls POST /predictions/mental-wellness', async () => {
    (mockedAxios.post as jest.Mock).mockResolvedValue({ data: { success: true, data: { prediction: mockPrediction } } });
    const input = { age: 20, screen_time_hours: 3, sleep_hours: 7, physical_activity_hours: 1, social_media_hours: 2, academic_workload_hours: 4, sleep_quality: 7, stress_level: 4, social_support: 6, work_life_balance: 7 };
    const result = await predictionsApi.predictMentalWellness(input);
    expect(mockedAxios.post).toHaveBeenCalledWith('/predictions/mental-wellness', input);
    expect(result._id).toBe('1');
  });

  it('predictStressLevel calls POST /predictions/stress-level', async () => {
    (mockedAxios.post as jest.Mock).mockResolvedValue({ data: { success: true, data: { prediction: mockPrediction } } });
    const input = { age: 22, workload_hours: 8, sleep_hours: 6, social_support: 5, exercise_hours: 1, anxiety_level: 4, depression_symptoms: 3 };
    await predictionsApi.predictStressLevel(input);
    expect(mockedAxios.post).toHaveBeenCalledWith('/predictions/stress-level', input);
  });

  it('predictAcademicImpact calls POST /predictions/academic-impact', async () => {
    (mockedAxios.post as jest.Mock).mockResolvedValue({ data: { success: true, data: { prediction: mockPrediction } } });
    const input = { age: 21, gaming_hours: 2, social_media_hours: 3, study_hours: 5, sleep_hours: 7, stress_level: 4 };
    await predictionsApi.predictAcademicImpact(input);
    expect(mockedAxios.post).toHaveBeenCalledWith('/predictions/academic-impact', input);
  });

  it('getPrediction calls GET /predictions/:id', async () => {
    (mockedAxios.get as jest.Mock).mockResolvedValue({ data: { success: true, data: { prediction: mockPrediction } } });
    await predictionsApi.getPrediction('1');
    expect(mockedAxios.get).toHaveBeenCalledWith('/predictions/1');
  });

  it('deletePrediction calls DELETE /predictions/:id', async () => {
    (mockedAxios.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
    await predictionsApi.deletePrediction('1');
    expect(mockedAxios.delete).toHaveBeenCalledWith('/predictions/1');
  });
});
