import { useState, useRef } from 'react';
import { Button, message, Modal, Typography } from 'antd';
import { AudioOutlined, StopOutlined } from '@ant-design/icons';
import { audioBufferToWav } from '../utils/audio';

const { Paragraph, Title } = Typography;

interface AudioRecorderProps {
  onRecordComplete: (file: File) => void;
}

const READING_TEXT = `在数字化的世界里，每一个声音都独一无二。请用您自然、清晰的声音朗读这段文字。我们将使用先进的AI技术，为您创建一个专属的语音分身。这不仅是一次录音，更是通往未来的数字钥匙。保持放松，像平常说话一样，让我们开始这段奇妙的旅程吧。`;

const AudioRecorder = ({ onRecordComplete }: AudioRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const startRecordingProcess = () => {
    setIsModalOpen(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setProcessing(true);
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Convert to WAV
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(audioBuffer);
          
          const file = new File([wavBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
          onRecordComplete(file);
        } catch (error) {
          console.error('Audio conversion failed:', error);
          message.error('音频处理失败');
        } finally {
          setProcessing(false);
          setIsModalOpen(false);
          
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);

      // 计时器
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          // 限制在60秒
          if (newDuration >= 60) {
            stopRecording();
            message.info('录音已达到60秒上限');
          }
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      message.error('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleCancel = () => {
    if (recording) {
      stopRecording();
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <Button icon={<AudioOutlined />} onClick={startRecordingProcess}>
        开始录音
      </Button>

      <Modal
        title="录音中"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          !recording ? (
            <Button key="start" type="primary" onClick={startRecording}>
              开始
            </Button>
          ) : (
            <Button 
              key="stop" 
              danger 
              type="primary" 
              icon={<StopOutlined />} 
              onClick={stopRecording}
              loading={processing}
            >
              完成录音 ({duration}s)
            </Button>
          )
        ]}
        closable={!recording}
        maskClosable={!recording}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={5} style={{ marginBottom: 20 }}>请朗读以下文字：</Title>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px',
            fontSize: '16px',
            lineHeight: '1.8',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {READING_TEXT}
          </div>
          {recording && (
            <div style={{ color: '#ff4d4f' }}>
              正在录音... {duration}s / 60s
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};


export default AudioRecorder;



