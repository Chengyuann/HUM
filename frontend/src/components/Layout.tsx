import { Layout as AntLayout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, PlusOutlined, SoundOutlined, UserOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">发现</Link>,
    },
    {
      key: '/create',
      icon: <PlusOutlined />,
      label: <Link to="/create">创建角色</Link>,
    },
    {
      key: '/tts',
      icon: <SoundOutlined />,
      label: <Link to="/tts">TTS生成</Link>,
    },
    {
      key: '/my-voices',
      icon: <UserOutlined />,
      label: <Link to="/my-voices">我的角色</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'rgba(253, 252, 251, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E3E1DD',
          padding: '0 48px',
          height: '80px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 16px rgba(131, 182, 146, 0.08)',
        }}
      >
        <div style={{ 
          fontFamily: '"Fraunces", Georgia, serif',
          color: '#2D3436', 
          fontSize: '28px', 
          fontWeight: 700,
          marginRight: '72px',
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #83B692 0%, #6B9A7A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          HUM｜人声余温
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            flex: 1, 
            minWidth: 0, 
            border: 'none',
            background: 'transparent',
            fontSize: '15px',
          }}
        />
      </Header>
      
      <Content style={{ 
        padding: '56px 48px 80px', 
        background: 'transparent',
        minHeight: 'calc(100vh - 160px)',
        position: 'relative',
      }}>
        {/* Decorative organic blobs */}
        <div className="organic-blob" style={{
          width: '600px',
          height: '600px',
          background: 'linear-gradient(135deg, #83B692 0%, #A5C9B3 100%)',
          top: '-200px',
          right: '-200px',
        }} />
        <div className="organic-blob" style={{
          width: '400px',
          height: '400px',
          background: 'linear-gradient(135deg, #D4A574 0%, #E8A87C 100%)',
          bottom: '-100px',
          left: '-100px',
        }} />
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </Content>
      
      <Footer style={{ 
        textAlign: 'center', 
        background: 'rgba(253, 252, 251, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '32px',
        borderTop: '1px solid #E3E1DD',
        color: '#636E72',
        fontSize: '14px',
        fontWeight: 500,
      }}>
        <div style={{ marginBottom: '8px' }}>HUM｜人声余温 ©2024</div>
        <div style={{ fontSize: '12px', color: '#95A5A6' }}>
          用声音创造无限可能
        </div>
      </Footer>
    </AntLayout>
  );
};

export default Layout;
