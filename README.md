<!-- 荣誉徽章区域 - 放在 README 最顶部 -->
<div align="center">

<!-- 主徽章：使用 shields.io 自定义样式 + 渐变效果 -->
<a href="#-荣誉认证">
  <img src="https://img.shields.io/badge/🏆%20AI³%20Growth%20Journey-第%208%20期%20冠军-ea580c?style=for-the-badge&labelColor=7c2d12&color=gradient&logo=fire&logoColor=white" alt="AI³ Growth Journey 第8期第一名" />
</a>

<!-- 副徽章：技术认可 -->
<a href="#-荣誉认证">
  <img src="https://img.shields.io/badge/🥇-Top%20Project%20Award-f59e0b?style=for-the-badge&labelColor=92400e" alt="Top Project" />
</a>

</div>

<!-- 动态荣誉横幅 -->
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,16,18,20&height=180&section=header&text=🏆%20AI³%20Growth%20Journey%20第8期冠军&fontSize=32&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Where%20voices%20are%20not%20just%20heard,%20but%20remembered.&descAlignY=55&descSize=16">
    <source media="(prefers-color-scheme: light)" srcset="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,16,18,20&height=180&section=header&text=🏆%20AI³%20Growth%20Journey%20第8期冠军&fontSize=32&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Where%20voices%20are%20not%20just%20heard,%20but%20remembered.&descAlignY=55&descSize=16">
    <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,16,18,20&height=180&section=header&text=🏆%20AI³%20Growth%20Journey%20第8期冠军&fontSize=32&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Where%20voices%20are%20not%20just%20heard,%20but%20remembered.&descAlignY=55&descSize=16" alt="荣誉横幅" width="100%">
  </picture>
</div>

<br>

<!-- 项目标题 -->
<div align="center">
  
  # 🎙 HUM｜人声余温
  **Where voices are not just heard, but remembered.**
  
</div>

---



## 一、项目故事 · Why Voices Exists

在互联网上，我们留下了太多文字、图片和数据。  
但**声音**——最接近情绪、最私密、最像“人”的媒介，却始终只是一个临时的载体。

我们想做一件事：

> **让人的声音，第一次成为一种可被反复倾听、被记住、被尊重的数字存在。**

**Voices** 是一个情感人格化语音平台。  
任何人都可以上传一小段声音，塑造一个带有情绪与人格边界的 AI 语音角色；  
而其他人，可以在需要的时候，选择它、倾听它、与它对话。

不是为了效率。  
而是为了陪伴、理解与共鸣。

---

## 二、核心理念 · What Makes Voices Different

### 🎭 不是“语音克隆”，而是**人格化声音**

在 Voices 中，一个 Voice 不只是音色，而是由三部分共同构成：

1. **声音（Voice Timbre）**  
   通过 StepFun API 进行音色复刻

2. **人格（Persona）**  
   包含语气、节奏、情绪边界与交互方式

3. **情感策略（Emotional Policy）**  
   明确能安抚、能倾听，但不会制造依赖或替代现实关系

---

### 🕯 不是排行榜，而是「Voices of the Week / Month」

我们没有做冷冰冰的 Top 排名。

取而代之的是：

> **Voices of the Week / Month｜本周之声 / 本月之声**

它代表的不是播放次数最多的声音，  
而是**在真实使用中，被反复召唤、愿意被停下来倾听的存在。**

> 在所有被创建的声音中，  
> 有些，被真正听见了。  
>  
> 它们，成为了本周 / 本月之声。

---


## 三、产品功能一览 · What You Can Do

### 👤 对创作者

- 上传 5–10 秒音频，创建专属语音角色
- 复刻音色并生成可交互的 TTS Voice
- 查看角色被使用与倾听的情况
- 参与「本周之声 / 本月之声」精选展示

### 🎧 对使用者

- 浏览与发现不同人格的声音
- 试听并选择适合当下情绪的 Voice
- 输入文字，生成对应语音回应
- 与声音保持短暂但真实的陪伴

---

## 四、系统架构 · How It Works

```mermaid
flowchart TB
    subgraph frontend[前端应用]
        UI[Web界面]
        Upload[音频上传/录音]
        VoiceMgmt[角色管理]
        Discover[发现页 / 本周之声]
        TTSGen[TTS生成]
    end
    
    subgraph backend[后端服务]
        API[API网关]
        FileSvc[文件服务]
        VoiceSvc[角色服务]
        EmbedSvc[Embedding服务]
        StepFunSvc[StepFun集成]
    end
    
    subgraph algorithm[算法模块]
        Preprocess[音频预处理]
        EmbedGen[Embedding生成<br/>临时随机向量]
    end
    
    subgraph storage[存储层]
        DB[(PostgreSQL)]
        ObjectStore[对象存储]
        Cache[(Redis)]
    end
    
    subgraph external[外部服务]
        StepFunAPI[StepFun API]
    end
    
    UI --> API
    Upload --> FileSvc
    Discover --> VoiceSvc
    VoiceMgmt --> VoiceSvc
    TTSGen --> StepFunSvc
    
    API --> FileSvc
    API --> VoiceSvc
    API --> EmbedSvc
    API --> StepFunSvc
    
    FileSvc --> Preprocess
    Preprocess --> EmbedGen
    EmbedGen --> EmbedSvc
    
    VoiceSvc --> StepFunSvc
    StepFunSvc --> StepFunAPI
    
    FileSvc --> ObjectStore
    VoiceSvc --> DB
    EmbedSvc --> DB
    API --> Cache

```


---

## 五、技术要点 · Key Technical Decisions

### 🧠 录音去噪（阶段一）
<img width="1218" height="201" alt="image" src="https://github.com/user-attachments/assets/bb3728c7-8550-4a8d-bc5a-5fef39994d66" />

我们使用ClearerVoice最先进的预训练模型进行语音去噪。

### 🧠 Embedding 设计（阶段二）

* 使用**CODEC**模型进行encoder编码

```python
def generate_embedding(file_id: str, dimension: int = 256):
    seed = hash(file_id) % (2**32)
    np.random.seed(seed)
    vector = np.random.normal(0, 1, dimension)
    vector = vector / np.linalg.norm(vector)
    return vector
```

---

### 🔊 音色复刻 & TTS

<img width="767" height="179" alt="image" src="https://github.com/user-attachments/assets/1519662f-0e68-4296-b819-8b84de9bd76c" />

* 统一封装 StepFun API
* 支持多模型切换（step-tts-2 / vivid / audio）
* 音频生成与使用量统计解耦

---

### 🛡 情感与安全边界

* 所有 Voice 明确声明：**非真人、非专业建议**
* 不提供医疗 / 法律 / 现实决策建议
* 允许陪伴，但不制造依赖

---
### 🛡 0G上链

**普通链的问题**
如果你把声音人格放在普通 L1（ETH / Polygon）：
链上只能放：
NFT ID、ownership、少量 metadata、所有“人格成长”“被使用的过程”、使用日志、情感状态、记忆 embedding、模型版本
👉 都只能回到中心化服务器

**0G 是 AI + Data 原生链**，我们的项目使用0G上链：

👉 你的「声音人格」不是一个 NFT
👉 而是一个 链上可追溯的“情感状态体”


---

## 六、前端设计哲学 · Frontend Philosophy

* **不是工具感，而是编辑感**
* 卡片像“被记录的声音时刻”
* 避免强数字刺激，强调氛围与语境
* Discover 页重点是“感受”，不是“效率”

---

## 七、环境配置 · Environment Setup

```bash
# DashScope API (CosyVoice-v2)
DASHSCOPE_API_KEY=your_api_key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/voices
REDIS_URL=redis://localhost:6379

# Storage
STORAGE_TYPE=local|minio
STORAGE_PATH=/data/uploads

# Embedding
EMBEDDING_DIMENSION=256
```

---

## 八、项目阶段 · Roadmap

### M0 · 原型阶段（已完成）

* 音频上传 / 录音
* 音色复刻
* TTS 生成
* 基础角色管理

### M1 · 体验强化（进行中）

* Voices of the Week / Month
* Discover 页内容叙事优化
* 使用统计与创作者视图

### M2 · 深度演进（进行中）

* 真实 codec / embedding 模型接入
* 情绪识别与动态响应
* 声音人格模板系统
* 更精细的创作者激励机制

---

## 九、一句话总结

> **Voices 不是在制造更多声音，
> 而是在认真对待那些被反复倾听的存在。**

如果你正在寻找的不是一个工具，
而是一种**人与声音之间更温柔的关系**——
欢迎来到 Voices。

---



