import { useEffect, useState } from 'react';
import { Card, List, Button, Popconfirm, message, Empty, Typography, Input, Space } from 'antd';
import { DeleteOutlined, PlayCircleOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { listVoices, deleteVoice, updateVoice, type Voice } from '../api/voices';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';

const { Text } = Typography;

const MyVoices = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();

  const loadVoices = async () => {
    setLoading(true);
    try {
      const response = await listVoices();
      if (response.success) {
        setVoices(response.data.voices);
      }
    } catch (error) {
      console.error('加载角色列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (voiceId: string) => {
    if (!editName.trim()) {
      message.error('角色名称不能为空');
      return;
    }

    try {
      const response = await updateVoice(voiceId, { name: editName.trim() });
      if (response.success) {
        message.success('更新成功');
        setEditingId(null);
        loadVoices();
      }
    } catch (error: any) {
      message.error(error.message || '更新失败');
    }
  };

  const startEditing = (voice: Voice) => {
    setEditingId(voice.id);
    setEditName(voice.name || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  useEffect(() => {
    loadVoices();
  }, []);

  const handleDelete = async (voiceId: string) => {
    try {
      const response = await deleteVoice(voiceId);
      if (response.success) {
        message.success('删除成功');
        loadVoices();
      }
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <div style={{ 
          fontSize: '18px', 
          color: theme.colors.mutedText,
          fontFamily: theme.typography.body,
        }}>加载中...</div>
      </div>
    );
  }

  if (voices.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <Empty 
          description={
            <span style={{ 
              fontSize: '16px', 
              color: theme.colors.mutedText,
              fontFamily: theme.typography.body,
            }}>
              您还没有创建任何角色
            </span>
          } 
        />
      </div>
    );
  }

  return (
    <Card 
      bordered={false}
      style={{ 
        background: theme.colors.warmWhite,
        borderRadius: theme.borderRadius.large,
        boxShadow: theme.shadows.card,
      }}
      bodyStyle={{ padding: theme.spacing.xxl }}
      title={
        <h2 style={{ 
          margin: 0, 
          fontFamily: theme.typography.display,
          fontSize: '28px', 
          fontWeight: 600,
          color: theme.colors.charcoal,
          letterSpacing: '-0.5px',
        }}>
          我的角色
        </h2>
      }
    >
      <List
        dataSource={voices}
        renderItem={(voice) => (
          <List.Item
            style={{
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              background: `linear-gradient(135deg, ${theme.colors.warmWhite} 0%, ${theme.colors.sage}10 100%)`,
              borderRadius: theme.borderRadius.medium,
              border: `1px solid ${theme.colors.sage}20`,
            }}
            actions={[
              editingId === voice.id ? (
                <Space key="edit-actions">
                  <Button
                    type="link"
                    icon={<CheckOutlined />}
                    onClick={() => handleUpdateName(voice.id)}
                    style={{ color: theme.colors.sage }}
                  >
                    保存
                  </Button>
                  <Button
                    type="link"
                    icon={<CloseOutlined />}
                    onClick={cancelEditing}
                    style={{ color: theme.colors.mutedText }}
                  >
                    取消
                  </Button>
                </Space>
              ) : (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => startEditing(voice)}
                  style={{ color: theme.colors.sage }}
                >
                  重命名
                </Button>
              ),
              <Button
                type="link"
                icon={<PlayCircleOutlined />}
                onClick={() => navigate(`/voices/${voice.id}`)}
                style={{ 
                  color: theme.colors.sage,
                  fontFamily: theme.typography.body,
                }}
              >
                查看
              </Button>,
              <Popconfirm
                title="确定要删除这个角色吗？"
                onConfirm={() => handleDelete(voice.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                  style={{ fontFamily: theme.typography.body }}
                >
                  删除
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={
                editingId === voice.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onPressEnter={() => handleUpdateName(voice.id)}
                    autoFocus
                    style={{ 
                      fontFamily: theme.typography.display,
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  />
                ) : (
                  <span style={{ 
                    fontSize: '16px',
                    fontWeight: 600,
                    color: theme.colors.charcoal,
                    fontFamily: theme.typography.display,
                  }}>
                    {voice.name || `Voice ${voice.id.slice(0, 8)}...`}
                  </span>
                )
              }
              description={
                <div style={{ 
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.body,
                  fontSize: '14px',
                }}>
                  <div>模型: {voice.model}</div>
                  <div>创建时间: {new Date(voice.createdAt).toLocaleString()}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default MyVoices;



