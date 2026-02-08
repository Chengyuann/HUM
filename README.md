
# 🎙 HUM｜人声余温
**Where voices are not just heard, but remembered.**



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

### 🧠 Embedding 设计（阶段一）

* 使用**可复现的随机向量**作为占位 embedding
* 通过 `fileId` 生成固定随机种子
* 保证：

  * 可替换真实模型
  * 不影响现有数据结构

```python
def generate_random_embedding(file_id: str, dimension: int = 256):
    seed = hash(file_id) % (2**32)
    np.random.seed(seed)
    vector = np.random.normal(0, 1, dimension)
    vector = vector / np.linalg.norm(vector)
    return vector
```

---

### 🔊 音色复刻 & TTS

* 统一封装 StepFun API
* 支持多模型切换（step-tts-2 / vivid / audio）
* 音频生成与使用量统计解耦

---

### 🛡 情感与安全边界

* 所有 Voice 明确声明：**非真人、非专业建议**
* 不提供医疗 / 法律 / 现实决策建议
* 允许陪伴，但不制造依赖

---

## 六、前端设计哲学 · Frontend Philosophy

* **不是工具感，而是编辑感**
* 卡片像“被记录的声音时刻”
* 避免强数字刺激，强调氛围与语境
* Discover 页重点是“感受”，不是“效率”

---

## 七、环境配置 · Environment Setup

```bash
# StepFun API
STEP_API_KEY=your_api_key

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

### M2 · 深度演进（规划中）

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



