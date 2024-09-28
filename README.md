# People Bot Server

## 项目概述
一键创建的 Telegram (TG) 交易机器人平台，用户可以通过该平台管理自己的交易钱包，并享有基本的交易功能。MVP版本支持以太坊（ETH）区块链，并提供快速买卖的核心功能。

### 项目架构
1. 后端管理系统
   - 核心路由管理：控制API集成。
   - 用户认证：管理用户注册、登录和登出。
   - 钱包管理：导入和删除钱包。
   - 交易操作：执行交易并记录交易历史。

2. 用户前端
   - 用户认证：注册和登录界面。
   - 钱包管理：导入、查看和删除钱包。
   - 交易功能：提供快速买卖的界面和功能。
   - 交易历史：显示每个钱包的交易记录。

3. 技术栈
   - 前端：React, JavaScript, HTML5, CSS3
   - 后端：Node.js, Express, MongoDB
   - API集成：axios用于与dbotx.com API交互

4. API集成
   - API接口来源：https://dbotx.com/dashboard/zh
   - 快速买卖：通过API实现用户对所选加密货币的买卖操作。

### 数据库设计
1. 用户表 (Users)
   - 用户ID
   - 用户名
   - 密码（加密存储）
   - 钱包列表（id, 名称, 类型, 地址）

2. 交易表 (Transactions)
   - 交易ID
   - 钱包ID
   - 交易对
   - 交易类型
   - 交易价格（USD）
   - 交易哈希
   - 交易状态

...(about 170 lines omitted)...

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

### 钱包管理

#### 导入钱包
- **URL**: `/api/wallets/import`
- **方法**: POST
- **认证**: 需要
- **数据**: 
  ```json
  {
    "privateKey": "私钥",
    "name": "钱包名称"
  }
  ```
- **成功响应**: 
  - **状态码**: 201
  - **内容**: 导入的钱包对象列表

#### 删除钱包
- **URL**: `/api/wallets/:id`
- **方法**: DELETE
- **认证**: 需要
- **成功响应**: 
  - **状态码**: 200
  - **内容**: 更新后的钱包列表

#### 获取钱包列表
- **URL**: `/api/wallets`
- **方法**: GET
- **认证**: 需要
- **成功响应**: 
  - **状态码**: 200
  - **内容**: 钱包对象数组

### 交易操作

#### 执行交易
- **URL**: `/api/trade`
- **方法**: POST
- **认证**: 需要
- **数据**: 
  ```json
  {
    "walletId": "钱包ID",
    "pair": "交易对",
    "type": "交易类型",
    "amountOrPercent": "交易数量或百分比",
    "maxSlippage": "最大滑点"
  }
  ```
- **成功响应**: 
  - **状态码**: 200
  - **内容**: `{ "message": "Trade executed successfully", "tradeId": "交易ID" }`

#### 获取交易历史
- **URL**: `/api/transactions`
- **方法**: GET
- **认证**: 需要
- **参数**: `walletId` (查询参数)
- **成功响应**: 
  - **状态码**: 200
  - **内容**: 交易历史记录数组

注意：所有需要认证的接口都需要用户先登录。如果未登录，将返回 401 状态码和错误信息。

## 迭代说明

### 版本 1.0.0 (当前版本)

- 实现基本的用户认证功能
- 添加钱包管理功能（导入和删除）
- 集成 dbotx.com API 进行交易操作
- 实现交易历史记录功能
- 使用共享的 DBOTX_API_KEY

### 计划中的功能

- 优化性能和错误处理
- 实现更多的交易功能
- 添加用户界面优化
- 实现邀请返佣系统
- 添加更多的单元测试和集成测试

## 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](./LICENSE) 文件。
````
