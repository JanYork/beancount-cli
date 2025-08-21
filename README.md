# Beancount CLI

一个功能强大的beancount记账命令行工具，提供友好的交互界面和完整的beancount操作功能。

## 功能特性

- 🏦 **账户管理**: 查看所有账户信息
- 📝 **交易记录**: 添加、查看、删除交易记录
- 💰 **余额查询**: 实时查看账户余额
- 💎 **净资产**: 查看净资产信息
- 📊 **报表生成**: 生成损益表和资产负债表
- ✅ **数据验证**: 验证beancount文件格式
- 🔄 **实时更新**: 支持文件重新加载
- 🎨 **友好界面**: 丰富的样式和交互效果

## 安装

### 前置要求

- Node.js 16.0.0 或更高版本
- npm 或 yarn

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/janyork/beancount-cli.git
cd beancount-cli
```

2. 安装依赖

```bash
npm install
```

3. 构建项目

```bash
npm run build
```

4. 全局安装（可选）

```bash
npm install -g .
```

## 使用方法

### 基本用法

```bash
# 直接运行
npm start /path/to/your/beancount/file.beancount

# 或者全局安装后使用
beancount-cli /path/to/your/beancount/file.beancount
```

### 命令列表

所有命令都支持 `/xxx` 格式：

- `/help` - 显示帮助信息
- `/add_transaction` - 添加交易记录
- `/list_transactions` - 列出交易记录
- `/show_balance` - 显示账户余额
- `/show_networth` - 显示净资产
- `/list_accounts` - 列出所有账户
- `/validate` - 验证beancount文件
- `/reload` - 重新加载文件
- `/quit` - 退出程序

### 命令示例

#### 添加交易记录

```bash
/add_transaction date=2024-01-01 narration="午餐" postings=[{"account":"Expenses:Food","amount":25},{"account":"Assets:Cash","amount":-25}]
```

#### 查看交易记录

```bash
/list_transactions start_date=2024-01-01 end_date=2024-01-31
```

#### 查看账户余额

```bash
/show_balance account="Assets:Cash" date=2024-01-01
```

## 开发

### 项目结构

```
src/
├── types/           # 类型定义
├── engine/          # Beancount操作引擎
├── commands/        # 命令处理模块
├── utils/           # 工具函数
└── cli.ts          # 主命令行界面
```

### 开发命令

```bash
# 开发模式运行
npm run dev

# 运行测试
npm test

# 运行测试（监听模式）
npm run test:watch

# 代码检查
npm run lint

# 代码检查并自动修复
npm run lint:fix

# 清理构建文件
npm run clean
```

### 测试覆盖率

项目要求100%的测试覆盖率，包括：

- 分支覆盖率 (branches): 100%
- 函数覆盖率 (functions): 100%
- 行覆盖率 (lines): 100%
- 语句覆盖率 (statements): 100%

## 技术栈

- **语言**: TypeScript
- **运行时**: Node.js
- **测试框架**: Jest
- **命令行**: Commander.js
- **交互**: Inquirer.js
- **样式**: Chalk
- **构建工具**: TypeScript Compiler

## 贡献

欢迎提交Issue和Pull Request！

### 开发规范

1. 遵循TypeScript严格模式
2. 所有函数必须有完整的JSDoc注释
3. 新功能必须包含完整的测试
4. 保持100%的测试覆盖率
5. 遵循项目的代码风格

## 许可证

MIT License

## 作者

JanYork

## 更新日志

### v1.0.0

- 初始版本发布
- 支持基本的beancount操作
- 完整的命令行界面
- 100%测试覆盖率
