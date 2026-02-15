import apiClient from './client';

export interface CreateVoiceRequest {
  fileId: string;
  name?: string;
  text?: string;
  sampleText?: string;
  model: string;
}

export interface VoiceResponse {
  success: boolean;
  data: {
    voiceId: string;
    name?: string;
    stepVoiceId: string;
    sampleAudio: string; // base64
    embeddingHash: string;
    duplicated?: boolean;
  };
  message?: string;
}

export interface Voice {
  id: string;
  userId: string;
  name?: string;
  stepVoiceId: string;
  fileId: string;
  model: string;
  text?: string;
  sampleText?: string;
  sampleAudioPath: string;
  embeddingHash: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const createVoice = async (data: CreateVoiceRequest): Promise<VoiceResponse> => {
  return apiClient.post('/voices', data);
};

export const getVoice = async (voiceId: string): Promise<{ success: boolean; data: Voice }> => {
  return apiClient.get(`/voices/${voiceId}`);
};

export const listVoices = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ success: boolean; data: { voices: Voice[]; total: number } }> => {
  return apiClient.get('/voices', { params });
};

export const updateVoice = async (
  voiceId: string,
  data: Partial<Voice>
): Promise<{ success: boolean; data: Voice }> => {
  return apiClient.put(`/voices/${voiceId}`, data);
};

export const deleteVoice = async (voiceId: string): Promise<{ success: boolean }> => {
  return apiClient.delete(`/voices/${voiceId}`);
};



