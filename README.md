# People Bot Server

## 项目概述
一个可以一键克隆的 Telegram (TG) 交易机器人，用户可以通过该平台创建自己的交易机器人，定制品牌名称，并享有基本的交易功能。MVP版本将支持以太坊（ETH）区块链，并提供快速买卖的核心功能。
### 项目架构
1. 后端管理系统

- 核心路由管理：控制API集成。
- 机器人管理：统一管理用户克隆的机器人。
- 区块链交互：集成ETH区块链的API接口。

2. 用户前端

- 机器人定制：用户一键克隆机器人后，可修改机器人名称、品牌、生成返佣链接。
- 交易功能：提供快速买卖的界面和功能。

3. 技术栈

- 前端：HTML5, CSS3, JavaScript (React或Vue)。
- 后端：Node.js或Java (Spring Boot)，API集成，数据库管理(MySQL或MongoDB)。
- 区块链交互：Web3.js或Ethers.js，集成ETH区块链。

4. API集成
- API接口来源：https://dbotx.com/dashboard/zh
- 快速买卖：通过API实现用户对所选加密货币的买卖操作。

### 详细功能设计
1. 快速买卖

- 前端：提供用户选择交易对、输入交易数量的界面。
- 后端：通过API完成订单撮合，返回交易结果。


### 数据库设计
1. 用户表 (Users)

- 用户ID
- 用户名


2. 交易表 (Transactions)

- 交易ID
- 用户ID
- 交易对
- 交易金额
- 交易时间

### 系统权限控制
1. 用户权限：用户可以修改自己克隆机器人的名称和品牌，但无法修改核心功能。
2. 管理端权限：管理端可以控制API接口的设置，以及对所有用户机器人的全局管理。

## 高阶功能
1. 邀请返佣

- 返佣链接：用户生成专属邀请链接，邀请他人注册并使用机器人。
- 关系存储：在数据库中存储用户之间的邀请关系。
- 返佣计算：根据交易额计算返佣比例，统计返佣金额。

2. 广告模块

- 广告位预留：克隆的机器人中预留广告位。
- 广告推送：广告内容由管理端后台推送，前端展示。

3. 支持多条区块链

- 新增支持：集成Solana (SOL)和BASE区块链。

4. 增强交易功能

- 自动狙击：实时监控市场变化，自动执行用户设定的狙击策略。
- 跟单交易：允许用户跟随其他交易员的策略进行交易。

5. 前端优化

- 自定义布局：支持用户自定义前端的页面布局及功能。
- 响应式设计：采用响应式设计，支持PC和移动端设备。

6. 系统权限增强

- 细化权限控制：提供更细粒度的用户和管理端权限设置。

## 代码结构
```
people_bot/
│
├── server/
│   ├── node_modules/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── server.js
│
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── README.md
```

- `server/`: 服务器端代码
  - `server.js`: 应用程序入口文件，包含所有后端逻辑
  - `.env`: 环境变量配置文件
- `client/`: 客户端代码
  - `public/`: 静态文件目录
  - `src/`: React 应用源代码
    - `App.js`: 主要的 React 组件，包含所有前端逻辑
    - `index.js`: React 应用的入口点

## 使用方法

## 数据库安装和配置

本项目使用 MongoDB 作为数据库。请按照以下步骤安装和配置 MongoDB：

1. 安装 MongoDB：
   - 访问 [MongoDB 官方网站](https://www.mongodb.com/try/download/community) 下载并安装适合您操作系统的 MongoDB Community Server 版本。
   - 按照安装向导完成安装过程。

2. 启动 MongoDB 服务：
   - 在 Windows 上，MongoDB 通常会作为服务自动启动。
   - 在 macOS 或 Linux 上，您可能需要手动启动服务：
     ```
     sudo systemctl start mongod
     ```

3. 创建数据库：
   - 打开终端或命令提示符，运行 MongoDB shell：
     ```
     mongo
     ```
   - 创建新的数据库：
     ```
     use people_bot_db
     ```

4. 配置连接：
   - 在项目的 `.env` 文件中，添加或修改 MongoDB 连接字符串：
     ```
     MONGODB_URI=mongodb://localhost:27017/people_bot_db
     ```

5. 安装 Mongoose：
   - 在项目根目录下运行以下命令安装 Mongoose（MongoDB 的 ODM）：
     ```
     npm install mongoose
     ```

6. 连接数据库：
   在 `server.js` 文件中，添加以下代码来连接数据库：

```javascript:server/server.js
startLine: 11
endLine: 17
```

确保在启动服务器之前已经启动了 MongoDB 服务。如果您在连接数据库时遇到问题，请检查 MongoDB 服务是否正在运行，以及连接字符串是否正确。

### 服务器端

1. 进入服务器目录：
   ```
   cd people_bot/server
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 配置环境变量：
   复制 `.env.example` 文件为 `.env`，并根据需要修改其中的配置。

4. 启动服务器：
   ```
   npm run start
   ```

   服务器将在默认端口（通常是 5000）上运行。

### 客户端

1. 进入客户端目录：
   ```
   cd people_bot/client
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 启动开发服务器：
   ```
   npm start
   ```

   React 应用将在开发模式下运行，通常在 http://localhost:3000 上可访问。

4. 构建生产版本：
   ```
   npm run build
   ```

   这将在 `build` 目录中创建应用的生产版本。

## API 文档

以下是 People Bot Server 的 API 使用说明：

### 用户认证

#### 注册
- **URL**: `/api/register`
- **方法**: POST
- **数据**: 
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **成功响应**: 
  - **状态码**: 201
  - **内容**: `{ "message": "User registered successfully" }`

#### 登录
- **URL**: `/api/login`
- **方法**: POST
- **数据**: 
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **成功响应**: 
  - **状态码**: 200
  - **内容**: `{ "message": "Logged in successfully" }`

#### 登出
- **URL**: `/api/logout`
- **方法**: POST
- **成功响应**: 
  - **状态码**: 200
  - **内容**: `{ "message": "Logged out successfully" }`

### 机器人管理

#### 创建机器人
- **URL**: `/api/bots`
- **方法**: POST
- **认证**: 需要
- **数据**: 
  ```json
  {
    "name": "机器人名称",
    "config": {
      // 机器人配置
    }
  }
  ```
- **成功响应**: 
  - **状态码**: 201
  - **内容**: 创建的机器人对象

#### 获取机器人列表
- **URL**: `/api/bots`
- **方法**: GET
- **认证**: 需要
- **成功响应**: 
  - **状态码**: 200
  - **内容**: 机器人对象数组

### 交易操作

#### 执行交易
- **URL**: `/api/trade`
- **方法**: POST
- **认证**: 需要
- **数据**: 
  ```json
  {
    "pair": "交易对",
    "amount": "交易数量",
    "type": "交易类型"
  }
  ```
- **成功响应**: 
  - **状态码**: 200
  - **内容**: 交易结果

### 余额查询

#### 获取 ETH 余额
- **URL**: `/api/balance/:address`
- **方法**: GET
- **认证**: 需要
- **参数**: 
  - `address`: ETH 地址
- **成功响应**: 
  - **状态码**: 200
  - **内容**: `{ "balance": "ETH余额" }`

注意：所有需要认证的接口都需要用户先登录。如果未登录，将返回 401 状态码和错误信息。

## 迭代说明

### 版本 1.0.0 (当前版本)

- 实现基本的用户认证功能
- 添加核心 API 端点
- 集成数据库连接

### 计划中的功能

- 添加更多的 API 端点
- 优化性能和错误处理
- 实现缓存机制
- 添加更多的单元测试和集成测试

## 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](./LICENSE) 文件。
