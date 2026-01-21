import axiosInstance from './axios-instance';
import type {
  Prediction,
  ApiResponse,
  MentalWellnessInput,
  AcademicImpactInput,
  StressLevelInput,
} from '@/types';

export const predictionsApi = {
  // Create mental wellness prediction
  predictMentalWellness: async (
    data: MentalWellnessInput
  ): Promise<Prediction> => {
    const response = await axiosInstance.post<
      ApiResponse<{ prediction: Prediction }>
    >('/predictions/mental-wellness', data);
    return response.data.data!.prediction;
  },

  // Create academic impact prediction
  predictAcademicImpact: async (
    data: AcademicImpactInput
  ): Promise<Prediction> => {
    const response = await axiosInstance.post<
      ApiResponse<{ prediction: Prediction }>
    >('/predictions/academic-impact', data);
    return response.data.data!.prediction;
  },

  // Create stress level prediction
  predictStressLevel: async (data: StressLevelInput): Promise<Prediction> => {
    const response = await axiosInstance.post<
      ApiResponse<{ prediction: Prediction }>
    >('/predictions/stress-level', data);
    return response.data.data!.prediction;
  },

  // Get all predictions
  getPredictions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ predictions: Prediction[]; total: number }> => {
    const response = await axiosInstance.get<
      ApiResponse<{ predictions: Prediction[]; total: number }>
    >('/predictions', { params });
    return response.data.data!;
  },

  // Get single prediction
  getPrediction: async (id: string): Promise<Prediction> => {
    const response = await axiosInstance.get<
      ApiResponse<{ prediction: Prediction }>
    >(`/predictions/${id}`);
    return response.data.data!.prediction;
  },

  // Update prediction
  updatePrediction: async (
    id: string,
    data: { notes?: string; tags?: string[]; isFavorite?: boolean }
  ): Promise<Prediction> => {
    const response = await axiosInstance.put<
      ApiResponse<{ prediction: Prediction }>
    >(`/predictions/${id}`, data);
    return response.data.data!.prediction;
  },

  // Delete prediction
  deletePrediction: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/predictions/${id}`);
  },

  // Get prediction stats
  getStats: async (): Promise<any> => {
    const response = await axiosInstance.get<ApiResponse>('/predictions/stats');
    return response.data.data;
  },

  // Get prediction trends
  getTrends: async (
    type: string,
    days?: number
  ): Promise<any> => {
    const response = await axiosInstance.get<ApiResponse>(
      `/predictions/trends/${type}`,
      { params: { days } }
    );
    return response.data.data;
  },

  // Email prediction report
  emailReport: async (id: string): Promise<void> => {
    await axiosInstance.post(`/predictions/${id}/email`);
  },
};
