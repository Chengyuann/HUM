import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, message, Space, Row, Col } from 'antd';
import { SoundOutlined, DownloadOutlined, PlayCircleOutlined, AudioOutlined } from '@ant-design/icons';
import { generateTTS } from '../api/tts';
import { listVoices, type Voice } from '../api/voices';
import { theme } from '../styles/theme';

const { TextArea } = Input;
const { Option } = Select;

const TTSGeneration = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [model, setModel] = useState('step-tts-mini');
  const [inputText, setInputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await listVoices();
      if (response.success) {
        setVoices(response.data.voices);
      }
    } catch (error) {
      console.error('加载角色列表失败:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedVoiceId) {
      message.error('请选择Voice');
      return;
    }
    if (!inputText.trim()) {
      message.error('请输入文本');
      return;
    }

    setGenerating(true);
    try {
      const response = await generateTTS({
        voiceId: selectedVoiceId,
        input: inputText,
        model,
      });

      if (response.success) {
        if (response.data.audioUrl) {
          setAudioUrl(response.data.audioUrl);
        }
        if (response.data.audioBase64) {
          setAudioBase64(response.data.audioBase64);
        }
        message.success('生成成功');
      }
    } catch (error: any) {
      message.error(error.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    } else if (audioBase64) {
      const link = document.createElement('a');
      link.href = `data:audio/mp3;base64,${audioBase64}`;
      link.download = 'tts-output.mp3';
      link.click();
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Demo Section */}
      <Card 
        bordered={false}
        style={{ 
          marginBottom: theme.spacing.xl,
          background: theme.colors.warmWhite,
          borderRadius: theme.borderRadius.large,
          boxShadow: theme.shadows.card,
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: theme.spacing.xxl }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: theme.spacing.xl,
        }}>
          <PlayCircleOutlined style={{ 
            fontSize: '28px', 
            color: theme.colors.sage, 
            marginRight: theme.spacing.md 
          }} />
          <h2 style={{ 
            margin: 0, 
            fontFamily: theme.typography.display,
            fontSize: '28px', 
            fontWeight: 600,
            color: theme.colors.charcoal,
            letterSpacing: '-0.5px',
          }}>
            效果示例
          </h2>
        </div>
        
        <div style={{ 
          marginBottom: theme.spacing.xl, 
          color: theme.colors.mutedText, 
          fontSize: '16px', 
          lineHeight: '1.7',
          fontFamily: theme.typography.body,
        }}>
          以下展示语音克隆的效果对比，原始音频与克隆后的音频
        </div>
        
        <Row gutter={theme.spacing.xl}>
          {/* Original Audio */}
          <Col xs={24} lg={12}>
            <div style={{ 
              padding: theme.spacing.xl,
              background: `linear-gradient(135deg, ${theme.colors.warmWhite} 0%, ${theme.colors.sage}15 100%)`,
              borderRadius: theme.borderRadius.medium,
              height: '100%',
              border: `1px solid ${theme.colors.sage}30`,
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}>
                <AudioOutlined style={{ 
                  fontSize: '22px', 
                  color: theme.colors.sand, 
                  marginRight: theme.spacing.sm 
                }} />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '20px', 
                  fontWeight: 600,
                  color: theme.colors.charcoal,
                  fontFamily: theme.typography.display,
                }}>
                  原始音频
                </h3>
              </div>
              
              <div style={{ marginBottom: theme.spacing.md }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: theme.colors.mutedText, 
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>说话人</div>
                <div style={{ 
                  fontSize: '17px', 
                  color: theme.colors.charcoal,
                  fontWeight: 500,
                }}>MCY</div>
              </div>
              
              <div style={{ marginBottom: theme.spacing.lg }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: theme.colors.mutedText, 
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>文本内容</div>
                <div style={{ 
                  fontSize: '15px', 
                  color: theme.colors.charcoal,
                  lineHeight: '1.7',
                  padding: theme.spacing.md,
                  background: theme.colors.warmWhite,
                  borderRadius: theme.borderRadius.small,
                  border: `1px solid ${theme.colors.sage}20`,
                  fontFamily: theme.typography.body,
                }}>
                  "欢迎来到周周黑客松，来开始你的表演吧"
                </div>
              </div>
              
              <audio 
                controls 
                style={{ 
                  width: '100%', 
                  height: '48px',
                  borderRadius: theme.borderRadius.small,
                }}
                preload="metadata"
              >
                <source src="/mcy.wav" type="audio/wav" />
              </audio>
            </div>
          </Col>

          {/* Cloned Audio */}
          <Col xs={24} lg={12}>
            <div style={{ 
              padding: theme.spacing.xl,
              background: `linear-gradient(135deg, ${theme.colors.warmWhite} 0%, ${theme.colors.sage}25 100%)`,
              borderRadius: theme.borderRadius.medium,
              height: '100%',
              border: `2px solid ${theme.colors.sage}40`,
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}>
                <SoundOutlined style={{ 
                  fontSize: '22px', 
                  color: theme.colors.sage, 
                  marginRight: theme.spacing.sm 
                }} />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '20px', 
                  fontWeight: 600,
                  color: theme.colors.charcoal,
                  fontFamily: theme.typography.display,
                }}>
                  克隆后音频
                </h3>
              </div>
              
              <div style={{ marginBottom: theme.spacing.md }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: theme.colors.mutedText, 
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>克隆模型</div>
                <div style={{ 
                  fontSize: '17px', 
                  color: theme.colors.sage,
                  fontWeight: 600,
                  fontFamily: theme.typography.mono,
                }}>step-tts-2</div>
              </div>
              
              <div style={{ marginBottom: theme.spacing.lg }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: theme.colors.mutedText, 
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>文本内容</div>
                <div style={{ 
                  fontSize: '15px', 
                  color: theme.colors.charcoal,
                  lineHeight: '1.7',
                  padding: theme.spacing.md,
                  background: theme.colors.warmWhite,
                  borderRadius: theme.borderRadius.small,
                  border: `1px solid ${theme.colors.sage}30`,
                  fontFamily: theme.typography.body,
                }}>
                  "一个让克隆声音真正活起来的智能人格语音生态：带情绪、长期记忆、互动体验与场景化价值。"
                </div>
              </div>
              
              <audio 
                controls 
                style={{ 
                  width: '100%', 
                  height: '48px',
                  borderRadius: theme.borderRadius.small,
                }}
                preload="metadata"
              >
                <source src="/mcy-clone.wav" type="audio/wav" />
              </audio>
            </div>
          </Col>
        </Row>
      </Card>

      {/* TTS Generation */}
      <Card 
        bordered={false}
        style={{ 
          background: theme.colors.warmWhite,
          borderRadius: theme.borderRadius.large,
          boxShadow: theme.shadows.card,
        }}
        bodyStyle={{ padding: theme.spacing.xxl }}
      >
        <h2 style={{ 
          margin: `0 0 ${theme.spacing.xl} 0`, 
          fontFamily: theme.typography.display,
          fontSize: '28px', 
          fontWeight: 600,
          color: theme.colors.charcoal,
          letterSpacing: '-0.5px',
        }}>
          生成语音
        </h2>

        <Space direction="vertical" size={theme.spacing.lg} style={{ width: '100%' }}>
          <div>
            <div style={{ 
              marginBottom: theme.spacing.sm, 
              fontSize: '14px', 
              fontWeight: 500, 
              color: theme.colors.charcoal,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              选择语音角色
            </div>
            <Select
              value={selectedVoiceId}
              onChange={setSelectedVoiceId}
              style={{ width: '100%' }}
              size="large"
              placeholder="请选择语音角色"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {voices.map((voice) => (
                <Option key={voice.id} value={voice.id} label={voice.name || voice.id}>
                  {voice.name || `Voice ${voice.id.slice(0, 8)}...`} ({voice.model})
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ 
              marginBottom: theme.spacing.sm, 
              fontSize: '14px', 
              fontWeight: 500, 
              color: theme.colors.charcoal,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              模型选择
            </div>
            <Select 
              value={model} 
              onChange={setModel} 
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="step-tts-2">step-tts-2</Option>
              <Option value="step-tts-mini">step-tts-mini</Option>
              <Option value="step-tts-vivid">step-tts-vivid</Option>
              <Option value="step-audio-2">step-audio-2</Option>
            </Select>
          </div>

          <div>
            <div style={{ 
              marginBottom: theme.spacing.sm, 
              fontSize: '14px', 
              fontWeight: 500, 
              color: theme.colors.charcoal,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              输入文本
            </div>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入要转换为语音的文本"
              rows={6}
              style={{ 
                fontSize: '16px',
                fontFamily: theme.typography.body,
                lineHeight: '1.7',
              }}
            />
          </div>

          <Button
            type="primary"
            size="large"
            icon={<SoundOutlined />}
            onClick={handleGenerate}
            loading={generating}
            block
            className="gradient-button"
            style={{ 
              height: '56px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: theme.borderRadius.medium,
              fontFamily: theme.typography.body,
            }}
          >
            生成音频
          </Button>

          {(audioUrl || audioBase64) && (
            <div style={{ 
              padding: theme.spacing.xl,
              background: `linear-gradient(135deg, ${theme.colors.warmWhite} 0%, ${theme.colors.sage}15 100%)`,
              borderRadius: theme.borderRadius.medium,
              marginTop: theme.spacing.md,
              border: `1px solid ${theme.colors.sage}30`,
            }}>
              <div style={{ 
                marginBottom: theme.spacing.md, 
                fontSize: '16px', 
                fontWeight: 600, 
                color: theme.colors.charcoal,
                fontFamily: theme.typography.display,
              }}>
                生成结果
              </div>
              <audio
                controls
                style={{ 
                  width: '100%', 
                  marginBottom: theme.spacing.md, 
                  height: '48px',
                  borderRadius: theme.borderRadius.small,
                }}
                src={audioUrl || `data:audio/mp3;base64,${audioBase64}`}
              />
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleDownload}
                style={{ 
                  borderRadius: theme.borderRadius.small,
                  height: '40px',
                }}
              >
                下载音频
              </Button>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default TTSGeneration;



