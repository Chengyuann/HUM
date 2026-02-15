import { useState } from 'react';
import {
  Card,
  Upload,
  Button,
  Progress,
  message,
  Space,
  Input,
} from 'antd';
import { UploadOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { uploadFile } from '../api/files';
import { createVoice } from '../api/voices';
import AudioRecorder from '../components/AudioRecorder';
import AudioWaveform from '../components/AudioWaveform';
import VoiceNFTMint from '../components/VoiceNFTMint';
import { theme } from '../styles/theme';

type ProcessingStep = 'upload' | 'processing' | 'complete';

const CreateVoice = () => {
  const [file, setFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload');
  const [voiceResult, setVoiceResult] = useState<any>(null);

  const handleFileSelect = (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      message.error('只支持 MP3、WAV 或 WebM 格式');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('文件大小不能超过 10MB');
      return false;
    }

    setFile(file);
    setVoiceResult(null);
    return false;
  };

  const handleCreateVoice = async () => {
    if (!file) {
      message.error('请先选择或录制音频文件');
      return;
    }

    setProcessing(true);
    setCurrentStep('upload');

    try {
      const uploadResponse = await uploadFile(file, (progressEvent) => {
        const percent = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        setUploadProgress(percent);
      });

      if (!uploadResponse.success) {
        throw new Error('文件上传失败');
      }

      setCurrentStep('processing');

      const voiceResponse = await createVoice({
        fileId: uploadResponse.data.fileId,
        name: voiceName.trim() || undefined,
        model: 'codec',
      });

      if (voiceResponse.success) {
        setCurrentStep('complete');
        setVoiceResult(voiceResponse.data);
        message.success('语音角色创建成功');
      }
    } catch (error: any) {
      message.error(error.message || '创建失败');
      setCurrentStep('upload');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setVoiceName('');
    setVoiceResult(null);
    setCurrentStep('upload');
    setUploadProgress(0);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card 
        bordered={false}
        style={{ 
          background: theme.colors.warmWhite,
          borderRadius: theme.borderRadius.large,
          boxShadow: theme.shadows.card,
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: theme.spacing.xxl }}
      >
        <h2 style={{ 
          margin: `0 0 ${theme.spacing.sm} 0`, 
          fontFamily: theme.typography.display,
          fontSize: '32px', 
          fontWeight: 600,
          color: theme.colors.charcoal,
          letterSpacing: '-0.5px',
        }}>
          创建语音角色
        </h2>
        <p style={{ 
          margin: `0 0 ${theme.spacing.xl} 0`, 
          fontSize: '15px', 
          color: theme.colors.mutedText,
          lineHeight: '1.7',
          fontFamily: theme.typography.body,
        }}>
          使用 Codec 模型将音频编码成 Embedding
        </p>

        <Space direction="vertical" size={theme.spacing.xl} style={{ width: '100%' }}>
          {/* Name Input Section */}
          <div>
            <div style={{ 
              marginBottom: theme.spacing.md, 
              fontSize: '14px', 
              fontWeight: 600, 
              color: theme.colors.charcoal,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              角色名称
            </div>
            <Input
              placeholder="为你的语音角色起个名字（可选）"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              disabled={processing}
              size="large"
              prefix={<UserOutlined style={{ color: theme.colors.mutedText }} />}
              style={{ 
                borderRadius: theme.borderRadius.medium, 
                height: '56px', 
                fontSize: '16px',
                border: `1px solid ${theme.colors.sage}30`,
                background: theme.colors.warmWhite,
              }}
            />
          </div>

          {/* Upload Section */}
          <div>
            <div style={{ 
              marginBottom: theme.spacing.md, 
              fontSize: '14px', 
              fontWeight: 600, 
              color: theme.colors.charcoal,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              上传或录制音频（1-10秒）
            </div>
            
            <Space direction="vertical" size={theme.spacing.md} style={{ width: '100%' }}>
              <Upload
                beforeUpload={handleFileSelect}
                accept="audio/mpeg,audio/wav,audio/mp3,audio/webm"
                showUploadList={false}
                disabled={processing}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  disabled={processing}
                  size="large"
                  className="gradient-button"
                  style={{ 
                    borderRadius: theme.borderRadius.medium, 
                    height: '56px', 
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  选择音频文件
                </Button>
              </Upload>

              <AudioRecorder 
                onRecordComplete={(recordedFile) => {
                  setFile(recordedFile);
                  setVoiceResult(null);
                }} 
              />
            </Space>

            {file && (
              <div style={{ 
                marginTop: theme.spacing.lg, 
                padding: theme.spacing.xl, 
                background: `linear-gradient(135deg, ${theme.colors.warmWhite} 0%, ${theme.colors.sage}15 100%)`,
                borderRadius: theme.borderRadius.medium,
                border: `1px solid ${theme.colors.sage}30`,
              }}>
                <div style={{ marginBottom: theme.spacing.sm }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: theme.colors.mutedText,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>文件名：</span>
                  <span style={{ 
                    fontSize: '15px', 
                    color: theme.colors.charcoal, 
                    marginLeft: theme.spacing.sm,
                    fontFamily: theme.typography.mono,
                  }}>{file.name}</span>
                </div>
                <div style={{ marginBottom: theme.spacing.md }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: theme.colors.mutedText,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>大小：</span>
                  <span style={{ 
                    fontSize: '15px', 
                    color: theme.colors.charcoal, 
                    marginLeft: theme.spacing.sm,
                    fontFamily: theme.typography.mono,
                  }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <AudioWaveform file={file} />
              </div>
            )}

            {processing && currentStep === 'upload' && (
              <div style={{ marginTop: theme.spacing.lg }}>
                <div style={{ 
                  marginBottom: theme.spacing.sm, 
                  fontSize: '14px', 
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.body,
                }}>上传中...</div>
                <Progress 
                  percent={uploadProgress} 
                  strokeColor={theme.colors.sage}
                  trailColor={`${theme.colors.sage}20`}
                  strokeWidth={8}
                />
              </div>
            )}

            {processing && currentStep === 'processing' && (
              <div style={{ marginTop: theme.spacing.lg }}>
                <Progress 
                  percent={100} 
                  status="active"
                  strokeColor={theme.colors.sage}
                  trailColor={`${theme.colors.sage}20`}
                  strokeWidth={8}
                />
                <div style={{ 
                  marginTop: theme.spacing.sm, 
                  textAlign: 'center', 
                  color: theme.colors.sage, 
                  fontSize: '15px',
                  fontFamily: theme.typography.body,
                }}>
                  正在生成语音角色...
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {!voiceResult && (
            <Button
              type="primary"
              size="large"
              onClick={handleCreateVoice}
              loading={processing}
              disabled={!file || processing}
              block
              className="gradient-button"
              style={{ 
                height: '56px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: theme.borderRadius.medium,
              }}
            >
              {processing ? '创建中...' : '创建语音角色'}
            </Button>
          )}

          {/* Success Result */}
          {voiceResult && (
            <div style={{ 
              padding: theme.spacing.xl,
              background: `linear-gradient(135deg, ${theme.colors.warmWhite} 0%, ${theme.colors.sage}25 100%)`,
              borderRadius: theme.borderRadius.medium,
              border: `2px solid ${theme.colors.sage}40`,
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}>
                <CheckCircleOutlined style={{ 
                  fontSize: '28px', 
                  color: theme.colors.sage, 
                  marginRight: theme.spacing.md 
                }} />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: 600,
                  color: theme.colors.charcoal,
                  fontFamily: theme.typography.display,
                }}>
                  创建成功
                </h3>
              </div>

              <Space direction="vertical" size={theme.spacing.lg} style={{ width: '100%' }}>
                <div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: theme.colors.mutedText, 
                    marginBottom: theme.spacing.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>角色名称</div>
                  <div style={{ 
                    padding: theme.spacing.md, 
                    background: theme.colors.warmWhite, 
                    borderRadius: theme.borderRadius.small,
                    fontFamily: theme.typography.body,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: theme.colors.charcoal,
                    wordBreak: 'break-all',
                    border: `1px solid ${theme.colors.sage}30`,
                  }}>
                    {voiceResult.name || '未命名角色'}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: theme.colors.mutedText, 
                    marginBottom: theme.spacing.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>Voice ID</div>
                  <div style={{ 
                    padding: theme.spacing.md, 
                    background: theme.colors.warmWhite, 
                    borderRadius: theme.borderRadius.small,
                    fontFamily: theme.typography.mono,
                    fontSize: '14px',
                    color: theme.colors.charcoal,
                    wordBreak: 'break-all',
                    border: `1px solid ${theme.colors.sage}30`,
                  }}>
                    {voiceResult.voiceId}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: theme.colors.mutedText, 
                    marginBottom: theme.spacing.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>Embedding Hash</div>
                  <div style={{ 
                    padding: theme.spacing.md, 
                    background: theme.colors.warmWhite, 
                    borderRadius: theme.borderRadius.small,
                    fontFamily: theme.typography.mono,
                    fontSize: '14px',
                    color: theme.colors.charcoal,
                    wordBreak: 'break-all',
                    border: `1px solid ${theme.colors.sage}30`,
                  }}>
                    {voiceResult.embeddingHash}
                  </div>
                </div>

                {voiceResult.sampleAudio && (
                  <div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: theme.colors.mutedText, 
                      marginBottom: theme.spacing.sm,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>试听音频</div>
                    <audio 
                      controls 
                      src={`data:audio/wav;base64,${voiceResult.sampleAudio}`}
                      style={{ 
                        width: '100%', 
                        height: '48px',
                        borderRadius: theme.borderRadius.small,
                      }}
                    />
                  </div>
                )}

                <div style={{ marginTop: theme.spacing.md }}>
                   <VoiceNFTMint voiceId={voiceResult.voiceId} embeddingHash={voiceResult.embeddingHash} />
                </div>

                <Button 
                  type="primary" 
                  onClick={handleReset} 
                  block
                  size="large"
                  className="gradient-button"
                  style={{ 
                    height: '56px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: theme.borderRadius.medium,
                    marginTop: theme.spacing.md,
                  }}
                >
                  创建新角色
                </Button>
              </Space>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default CreateVoice;
