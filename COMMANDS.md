# 项目运行命令文档

## 快速启动

### 方式一：分别启动（推荐用于开发）

#### 1. 启动后端服务

```powershell
# 进入后端目录
cd E:\week-hack\backend

# 启动开发服务器（自动重启）
npm run dev
```

后端服务将运行在：http://localhost:8000

#### 2. 启动前端服务

打开新的终端窗口：

```powershell
# 进入前端目录
cd E:\week-hack\frontend

# 启动开发服务器
npm run dev
```

前端服务将运行在：http://localhost:3000

---

## 详细命令说明

### 后端命令

```powershell
# 进入后端目录
cd E:\week-hack\backend

# 安装依赖（首次运行或更新依赖后）
npm install

# 启动开发服务器（带热重载）
npm run dev

# 编译TypeScript（生产构建）
npm run build

# 运行编译后的代码（生产模式）
npm start
```

### 前端命令

```powershell
# 进入前端目录
cd E:\week-hack\frontend

# 安装依赖（首次运行或更新依赖后）
npm install

# 启动开发服务器（带热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

---

## 环境变量配置

### 后端环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
# Server
PORT=8000
NODE_ENV=development

# Database (当前使用内存存储，不需要数据库)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voice_platform

# Redis (可选)
REDIS_URL=redis://localhost:6379

# DashScope API (CosyVoice-v2)
DASHSCOPE_API_KEY=your_api_key

# Storage
STORAGE_TYPE=local
STORAGE_PATH=./uploads

# Embedding
EMBEDDING_DIMENSION=256
```

### 前端环境变量（可选）

在 `frontend` 目录下创建 `.env` 文件（如果需要自定义API地址）：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 一键启动脚本（Windows PowerShell）

### 启动所有服务

创建 `start-all.ps1` 文件：

```powershell
# 启动所有服务
Write-Host "正在启动后端服务..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\week-hack\backend; npm run dev"

Start-Sleep -Seconds 3

Write-Host "正在启动前端服务..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\week-hack\frontend; npm run dev"

Write-Host "服务启动完成！" -ForegroundColor Green
Write-Host "后端: http://localhost:8000" -ForegroundColor Cyan
Write-Host "前端: http://localhost:3000" -ForegroundColor Cyan
```

运行方式：
```powershell
.\start-all.ps1
```

---

## 常用检查命令

### 检查服务是否运行

```powershell
# 检查后端端口
netstat -ano | findstr ":8000"

# 检查前端端口
netstat -ano | findstr ":3000"

# 检查后端健康状态
curl http://localhost:8000/health
```

### 停止服务

```powershell
# 查找Node.js进程
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# 停止特定端口的进程（替换PID为实际进程ID）
Stop-Process -Id <PID> -Force
```

---

## 项目结构

```
week-hack/
├── frontend/          # 前端项目
│   ├── src/          # 源代码
│   ├── package.json  # 前端依赖
│   └── vite.config.ts # Vite配置
├── backend/          # 后端项目
│   ├── src/          # 源代码
│   ├── package.json  # 后端依赖
│   └── .env          # 环境变量（需创建）
└── COMMANDS.md       # 本文件
```

---

## 故障排查

### 后端无法启动

1. 检查端口是否被占用：
   ```powershell
   netstat -ano | findstr ":8000"
   ```

2. 检查环境变量是否正确配置：
   ```powershell
   cd E:\week-hack\backend
   Get-Content .env
   ```

3. 重新安装依赖：
   ```powershell
   cd E:\week-hack\backend
   npm install
   ```

### 前端无法启动

1. 检查端口是否被占用：
   ```powershell
   netstat -ano | findstr ":3000"
   ```

2. 清除缓存并重新安装：
   ```powershell
   cd E:\week-hack\frontend
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

3. 检查Vite版本兼容性（Node.js 20.11.1需要Vite 5.x）

### 页面显示空白

1. 打开浏览器开发者工具（F12）
2. 查看Console标签中的错误信息
3. 查看Network标签中的请求状态
4. 确认后端服务正在运行

---

## 开发工作流

1. **启动开发环境**
   ```powershell
   # 终端1：启动后端
   cd E:\week-hack\backend
   npm run dev

   # 终端2：启动前端
   cd E:\week-hack\frontend
   npm run dev
   ```

2. **访问应用**
   - 前端：http://localhost:3000
   - 后端API：http://localhost:8000
   - 健康检查：http://localhost:8000/health

3. **开发调试**
   - 前端代码修改后自动热重载
   - 后端代码修改后nodemon自动重启
   - 查看浏览器控制台和终端输出

---

## 注意事项

1. **首次运行**：需要先执行 `npm install` 安装依赖
2. **环境变量**：确保 `backend/.env` 文件已创建并配置正确
3. **端口占用**：如果端口被占用，修改 `.env` 中的端口号或停止占用端口的进程
4. **数据存储**：当前使用内存存储，重启后端会清空数据
5. **API密钥**：确保StepFun API密钥有效

---

## 更新日期

最后更新：2024年


