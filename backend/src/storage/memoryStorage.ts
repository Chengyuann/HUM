// 内存存储实现，用于测试（不需要数据库）

interface FileMetadata {
  id: string;
  userId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  duration: number;
  format: string;
  stepFileId?: string;
  createdAt: Date;
}

interface Embedding {
  id: string;
  fileId: string;
  vector: number[];
  vectorHash: string;
  dimension: number;
  modelVersion: string;
  createdAt: Date;
}

interface Voice {
  id: string;
  userId: string;
  name?: string;
  stepVoiceId: string;
  fileId: string;
  model: string;
  text?: string;
  sampleText?: string;
  sampleAudioPath?: string;
  embeddingHash: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface TTSRequest {
  id: number;
  userId: string;
  voiceId: string;
  inputText: string;
  model: string;
  audioPath: string;
  duration: number;
  createdAt: Date;
}

class MemoryStorage {
  private files: Map<string, FileMetadata> = new Map();
  private embeddings: Map<string, Embedding> = new Map();
  private voices: Map<string, Voice> = new Map();
  private ttsRequests: TTSRequest[] = [];
  private ttsRequestIdCounter = 1;

  // Files
  saveFile(file: FileMetadata): void {
    this.files.set(file.id, file);
  }

  getFile(fileId: string): FileMetadata | undefined {
    return this.files.get(fileId);
  }

  deleteFile(fileId: string): boolean {
    return this.files.delete(fileId);
  }

  // Embeddings
  saveEmbedding(embedding: Embedding): void {
    this.embeddings.set(embedding.fileId, embedding);
  }

  getEmbedding(fileId: string): Embedding | undefined {
    return this.embeddings.get(fileId);
  }

  // Voices
  saveVoice(voice: Voice): void {
    this.voices.set(voice.id, voice);
  }

  getVoice(voiceId: string): Voice | undefined {
    return this.voices.get(voiceId);
  }

  findVoiceByFileAndModel(fileId: string, model: string): Voice | undefined {
    for (const voice of this.voices.values()) {
      if (voice.fileId === fileId && voice.model === model) {
        return voice;
      }
    }
    return undefined;
  }

  listVoices(params: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
  }): { voices: Voice[]; total: number } {
    let voices = Array.from(this.voices.values());

    if (params.userId) {
      voices = voices.filter((v) => v.userId === params.userId);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      voices = voices.filter(
        (v) =>
          v.id.toLowerCase().includes(searchLower) ||
          v.stepVoiceId.toLowerCase().includes(searchLower)
      );
    }

    const total = voices.length;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    voices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    voices = voices.slice(offset, offset + limit);

    return { voices, total };
  }

  deleteVoice(voiceId: string): boolean {
    return this.voices.delete(voiceId);
  }

  // TTS Requests
  saveTTSRequest(request: Omit<TTSRequest, 'id'>): TTSRequest {
    const id = this.ttsRequestIdCounter++;
    const ttsRequest: TTSRequest = {
      id,
      ...request,
    };
    this.ttsRequests.push(ttsRequest);
    return ttsRequest;
  }

  getTTSHistory(userId: string, limit: number = 20): TTSRequest[] {
    return this.ttsRequests
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const memoryStorage = new MemoryStorage();
export type { FileMetadata, Embedding, Voice, TTSRequest };



