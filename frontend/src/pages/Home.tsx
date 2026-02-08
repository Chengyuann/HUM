import { useEffect, useState } from 'react';
import { Card, Input, Row, Col, Button, Spin, Empty, Divider } from 'antd';
import { SearchOutlined, SoundOutlined, HeartOutlined } from '@ant-design/icons';
import { listVoices, type Voice } from '../api/voices';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

// Featured voices data (placeholder - would come from API in production)
const featuredVoices = [
  {
    id: 'featured-1',
    name: '晚风',
    persona: '温柔而坚定，像深夜的陪伴者',
    listenCount: 312,
    contexts: ['夜晚', '陪伴', '情绪安抚'],
    gradient: 'linear-gradient(135deg, #83B692 0%, #A5C9B3 100%)',
  },
  {
    id: 'featured-2',
    name: '晨曦',
    persona: '清澈明亮，带来新的开始',
    listenCount: 287,
    contexts: ['清晨', '激励', '希望'],
    gradient: 'linear-gradient(135deg, #D4A574 0%, #E8A87C 100%)',
  },
  {
    id: 'featured-3',
    name: '雨声',
    persona: '细腻柔软，抚慰疲惫的心',
    listenCount: 256,
    contexts: ['冥想', '放松', '专注'],
    gradient: 'linear-gradient(135deg, #74B9D8 0%, #A5C9B3 100%)',
  },
];

const Home = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const loadVoices = async () => {
    setLoading(true);
    try {
      const response = await listVoices({ search: searchText || undefined });
      if (response && response.success) {
        setVoices(response.data.voices || []);
      } else {
        setVoices([]);
      }
    } catch (error: any) {
      console.error('加载角色列表失败:', error);
      setVoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoices();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadVoices();
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{ marginBottom: '72px', textAlign: 'center' }}>
        <h1 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '48px', 
          fontWeight: 700,
          fontFamily: '"Fraunces", Georgia, serif',
          color: '#2D3436',
          letterSpacing: '-1px',
          lineHeight: 1.2,
        }}>
          本周之声
        </h1>
        <p style={{ 
          margin: '0 auto',
          fontSize: '18px', 
          color: '#636E72',
          lineHeight: '1.6',
          maxWidth: '600px',
        }}>
          探索独特的语音角色，创造属于你的声音世界
        </p>
      </div>

      {/* Featured Section - Voices of the Week */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '24px',
          justifyContent: 'center',
        }}>
          <HeartOutlined style={{ 
            fontSize: '24px', 
            color: '#83B692',
            marginRight: '12px',
          }} />
          <h2 style={{ 
            margin: 0,
            fontSize: '32px', 
            fontWeight: 700,
            fontFamily: '"Fraunces", Georgia, serif',
            color: '#2D3436',
            letterSpacing: '-0.5px',
          }}>
            Voices of the Week
          </h2>
        </div>
        
        <p style={{ 
          textAlign: 'center',
          fontSize: '16px',
          color: '#636E72',
          lineHeight: '1.8',
          maxWidth: '560px',
          margin: '0 auto 48px',
          fontStyle: 'italic',
        }}>
          这些声音，在本周被用心倾听<br/>
          它们不只是工具，更是陪伴与共鸣的存在
        </p>

        <Row gutter={[32, 32]} justify="center">
          {featuredVoices.map((voice, index) => (
            <Col xs={24} sm={12} lg={8} key={voice.id}>
              <Card
                hoverable
                bordered={false}
                style={{ 
                  borderRadius: '24px',
                  border: '1px solid #E3E1DD',
                  boxShadow: '0 8px 24px rgba(131, 182, 146, 0.12)',
                  background: '#FDFCFB',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.8s ease-out ${index * 0.15}s both`,
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: '36px' }}
              >
                {/* Gradient Header */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: voice.gradient,
                  borderRadius: '2px',
                  marginBottom: '28px',
                }} />

                {/* Voice Icon */}
                <div style={{ 
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  background: voice.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 8px 20px rgba(131, 182, 146, 0.25)',
                }}>
                  <SoundOutlined style={{ fontSize: '36px', color: '#FFFFFF' }} />
                </div>

                {/* Voice Name */}
                <h3 style={{ 
                  margin: '0 0 12px 0',
                  fontSize: '28px',
                  fontWeight: 700,
                  fontFamily: '"Fraunces", Georgia, serif',
                  color: '#2D3436',
                  letterSpacing: '-0.5px',
                }}>
                  {voice.name}
                </h3>

                {/* Persona Description */}
                <p style={{ 
                  margin: '0 0 24px 0',
                  fontSize: '15px',
                  color: '#636E72',
                  lineHeight: '1.7',
                  minHeight: '48px',
                }}>
                  {voice.persona}
                </p>

                {/* Listen Count */}
                <div style={{
                  padding: '16px 20px',
                  background: 'rgba(131, 182, 146, 0.06)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{ 
                    fontSize: '13px',
                    color: '#83B692',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}>
                    本周被倾听 {voice.listenCount} 次
                  </div>
                </div>

                {/* Contexts */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    fontSize: '12px',
                    color: '#95A5A6',
                    marginBottom: '10px',
                    fontWeight: 500,
                  }}>
                    常出现在
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {voice.contexts.map((context, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '6px 14px',
                          background: '#F7F6F4',
                          borderRadius: '20px',
                          fontSize: '13px',
                          color: '#636E72',
                          border: '1px solid #E3E1DD',
                        }}
                      >
                        {context}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  type="primary"
                  block
                  style={{ 
                    height: '48px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    fontSize: '15px',
                    background: voice.gradient,
                    border: 'none',
                  }}
                >
                  倾听这个声音
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Divider style={{ 
        margin: '80px 0 64px',
        borderColor: '#E3E1DD',
      }} />

      {/* Search Section */}
      <div style={{ marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 600,
          fontFamily: '"Fraunces", Georgia, serif',
          color: '#2D3436',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          探索更多声音
        </h3>
        <Search
          placeholder="搜索角色..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ 
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        />
      </div>

      {/* All Voices Grid */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '100px 0',
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px', color: '#636E72', fontSize: '16px' }}>
            加载中...
          </div>
        </div>
      ) : voices.length === 0 ? (
        <Empty 
          description={
            <span style={{ color: '#636E72', fontSize: '16px' }}>
              暂无角色，点击"创建角色"开始你的创作之旅
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '100px 0' }}
        />
      ) : (
        <Row gutter={[28, 28]}>
          {voices.map((voice, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={voice.id}>
              <Card
                hoverable
                bordered={false}
                style={{ 
                  borderRadius: '20px',
                  border: '1px solid #E3E1DD',
                  boxShadow: '0 4px 16px rgba(131, 182, 146, 0.08)',
                  background: '#FDFCFB',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
                bodyStyle={{ padding: '28px' }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #83B692 0%, #A5C9B3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(131, 182, 146, 0.25)',
                  }}>
                    <SoundOutlined style={{ fontSize: '28px', color: '#FFFFFF' }} />
                  </div>
                  
                  <h3 style={{ 
                    margin: '0 0 12px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    fontFamily: '"Fraunces", Georgia, serif',
                    color: '#2D3436',
                    letterSpacing: '-0.3px',
                  }}>
                    Voice {voice.id.slice(0, 8)}
                  </h3>
                  
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#636E72',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}>
                    {voice.model}
                  </div>
                  
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#95A5A6',
                  }}>
                    {new Date(voice.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  onClick={() => navigate(`/voices/${voice.id}`)}
                  style={{ 
                    height: '44px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    fontSize: '15px',
                  }}
                >
                  查看详情
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
