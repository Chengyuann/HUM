import React, { useState } from 'react';
import { Button, message, Card, Typography, Tabs, Input, Divider, Descriptions, Space } from 'antd';
import { ethers } from 'ethers';
import VoiceNFTArtifact from '../contracts/VoiceNFT.json';
import { VOICE_NFT_ADDRESS, CHAIN_ID, CHAIN_CONFIG } from '../config/web3';

const { Text, Paragraph } = Typography;

interface VoiceNFTMintProps {
  voiceId: string;
  embeddingHash: string;
}

const VoiceNFTMint: React.FC<VoiceNFTMintProps> = ({ voiceId, embeddingHash }) => {
  const [loading, setLoading] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Manage & Restore State
  const [tokenIdToManage, setTokenIdToManage] = useState<string>('');
  const [retrievedData, setRetrievedData] = useState<{ voiceId: string; embeddingHash: string } | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const getProviderAndSigner = async () => {
    // @ts-ignore
    if (!window.ethereum) {
      throw new Error("Please install MetaMask!");
    }
    // @ts-ignore
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Check network
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) {
      try {
        // @ts-ignore
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CHAIN_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // @ts-ignore
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_CONFIG],
          });
        } else {
          throw new Error("Failed to switch network");
        }
      }
    }
    return { provider, signer };
  };

  const handleMint = async () => {
    setLoading(true);
    setMintedTokenId(null);
    setTxHash(null);
    try {
      const { signer } = await getProviderAndSigner();
      
      if (VOICE_NFT_ADDRESS.startsWith("0x0000000000000000000000000000000000000000")) {
         throw new Error("Contract not deployed yet.");
      }

      const contract = new ethers.Contract(VOICE_NFT_ADDRESS, VoiceNFTArtifact.abi, signer);

      const metadata = {
        name: `Voice ${voiceId}`,
        description: "Voice NFT on 0G Testnet",
        attributes: [
            { trait_type: "Voice ID", value: voiceId },
            { trait_type: "Embedding Hash", value: embeddingHash }
        ]
      };
      const tokenURI = "data:application/json;base64," + btoa(JSON.stringify(metadata));

      const tx = await contract.mint(await signer.getAddress(), voiceId, embeddingHash, tokenURI, {
        gasLimit: 500000 // Manually set gas limit to avoid estimation errors on testnet
      });
      message.info("Transaction submitted: " + tx.hash);

      const receipt = await tx.wait();
      setTxHash(tx.hash);

      // Find Token ID from logs
      // Event: Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
      // topic[0] is hash, topic[1] is from, topic[2] is to, topic[3] is tokenId
      const transferLog = receipt?.logs.find((log: any) => 
        log.address.toLowerCase() === VOICE_NFT_ADDRESS.toLowerCase() && log.topics.length === 4
      );

      if (transferLog) {
          const tokenId = BigInt(transferLog.topics[3]).toString();
          setMintedTokenId(tokenId);
          setTokenIdToManage(tokenId); // Auto-fill manage tab
          message.success(`Voice NFT Minted! Token ID: ${tokenId}`);
      } else {
          message.success("Voice NFT Minted! (Token ID not found in logs)");
      }

    } catch (error: any) {
      console.error(error);
      let errorMsg = error.reason || error.message || "Unknown error";
      // Handle weird RPC error returning calldata
      if (typeof errorMsg === 'string' && errorMsg.startsWith('0x')) {
          errorMsg = "Transaction failed. Please check your gas balance or network connection.";
      }
      message.error("Minting failed: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    if (!tokenIdToManage) {
        message.error("Please enter a Token ID");
        return;
    }
    setLoading(true);
    setRetrievedData(null);
    try {
        const { signer } = await getProviderAndSigner();
        const contract = new ethers.Contract(VOICE_NFT_ADDRESS, VoiceNFTArtifact.abi, signer);
        
        // Call getVoiceData
        const data = await contract.getVoiceData(tokenIdToManage);
        // data is [voiceId, embeddingHash]
        setRetrievedData({
            voiceId: data[0],
            embeddingHash: data[1]
        });
        message.success("Voice Data Retrieved!");
    } catch (error: any) {
        console.error(error);
        message.error("Failed to fetch data: " + (error.reason || error.message));
    } finally {
        setLoading(false);
    }
  };

  const handleTransfer = async () => {
      if (!tokenIdToManage || !recipientAddress) return;
      setLoading(true);
      try {
          const { signer } = await getProviderAndSigner();
          const contract = new ethers.Contract(VOICE_NFT_ADDRESS, VoiceNFTArtifact.abi, signer);
          
          // Use transferFrom. Note: safeTransferFrom is overloaded in ethers, simpler to use transferFrom or specifically select the function.
          // Using transferFrom(from, to, tokenId)
          const tx = await contract.transferFrom(await signer.getAddress(), recipientAddress, tokenIdToManage, {
              gasLimit: 300000
          });
          message.info("Transfer started: " + tx.hash);
          await tx.wait();
          message.success("Transfer successful!");
      } catch (error: any) {
          console.error(error);
          message.error("Transfer failed: " + (error.reason || error.message));
      } finally {
          setLoading(false);
      }
  };

  const items = [
    {
      key: '1',
      label: 'Mint New',
      children: (
        <>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600, color: '#2C3E50' }}>
                Mint Voice NFT on 0G Testnet
            </h3>
            
            <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '13px', color: '#6C757D', fontWeight: 500 }}>Voice ID</span>
                <div style={{ 
                    marginTop: 4,
                    padding: '8px 12px',
                    background: '#F8F9FA',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#2C3E50',
                    wordBreak: 'break-all',
                }}>
                    {voiceId}
                </div>
                </div>
                
                <div>
                <span style={{ fontSize: '13px', color: '#6C757D', fontWeight: 500 }}>Embedding Hash</span>
                <div style={{ 
                    marginTop: 4,
                    padding: '8px 12px',
                    background: '#F8F9FA',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#2C3E50',
                    wordBreak: 'break-all',
                }}>
                    {embeddingHash}
                </div>
                </div>
            </div>
            
            <Button 
                type="primary" 
                onClick={handleMint} 
                loading={loading}
                size="large"
                style={{ height: '48px', borderRadius: '8px', fontWeight: 500 }}
            >
                Mint NFT
            </Button>
            
            {txHash && (
                <div style={{ marginTop: 20, padding: '16px', background: '#F8F9FA', borderRadius: '8px' }}>
                <span style={{ color: '#27AE60', fontWeight: 500, fontSize: '14px' }}>Minted Successfully! </span>
                <a 
                    href={`${CHAIN_CONFIG.blockExplorerUrls[0]}/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#3498DB', textDecoration: 'none', fontSize: '14px' }}
                >   
                    View on Explorer →
                </a>
                </div>
            )}
        </>
      ),
    },
    {
      key: '2',
      label: 'Manage & Restore',
      children: (
        <div style={{ padding: '10px 0' }}>
             <Paragraph>
                Enter the Token ID of an NFT you own to retrieve its Voice Data or transfer it to another user.
             </Paragraph>
             
             <Space direction="vertical" style={{ width: '100%' }}>
                <Input 
                    placeholder="Token ID (e.g. 0)" 
                    value={tokenIdToManage} 
                    onChange={e => setTokenIdToManage(e.target.value)} 
                />
                <Button onClick={handleFetchData} loading={loading}>
                    Fetch Voice Data (Restore)
                </Button>

                {retrievedData && (
                    <Card size="small" title="Restored Voice Data" style={{ marginTop: 10, borderColor: '#1890ff' }}>
                         <Descriptions column={1} size="small">
                            <Descriptions.Item label="Voice ID">
                                <Text copyable>{retrievedData.voiceId}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Embedding Hash">
                                <Text copyable ellipsis>{retrievedData.embeddingHash}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 10 }}>
                             <Button type="dashed" size="small" onClick={() => message.success("Voice Loaded into Application!")}>
                                Use This Voice
                             </Button>
                        </div>
                    </Card>
                )}

                <Divider orientation="left" style={{ borderColor: '#e8e8e8' }}>Transfer Ownership</Divider>
                <Input 
                    placeholder="Recipient Address (0x...)" 
                    value={recipientAddress}
                    onChange={e => setRecipientAddress(e.target.value)}
                />
                <Button danger onClick={handleTransfer} loading={loading} disabled={!tokenIdToManage || !recipientAddress}>
                    Transfer NFT
                </Button>
             </Space>
        </div>
      ),
    },
  ];

  return (
    <Card 
      bordered={false}
      style={{ 
        marginTop: 32,
        background: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(44, 62, 80, 0.08)',
      }}
      bodyStyle={{ padding: '32px' }}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Card>
  );
};

export default VoiceNFTMint;
