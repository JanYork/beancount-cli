# Beancount 多文件结构设计

## 推荐的文件结构

```
beancount/
├── main.beancount              # 主文件，包含所有其他文件
├── config/
│   ├── accounts.beancount      # 账户定义
│   ├── commodities.beancount   # 货币和商品定义
│   └── plugins.beancount       # 插件配置
├── data/
│   ├── 2024/
│   │   ├── 01-january.beancount
│   │   ├── 02-february.beancount
│   │   └── ...
│   ├── 2023/
│   │   ├── 01-january.beancount
│   │   └── ...
│   └── opening-balances.beancount  # 期初余额
├── rules/
│   ├── price-sources.beancount # 价格源配置
│   └── importers.beancount     # 导入规则
└── reports/
    ├── queries.bql             # 自定义查询
    └── custom-reports.beancount
```

## 文件职责说明

### 主文件 (main.beancount)
- 作为入口点，包含所有其他文件
- 包含基本配置和元数据
- 定义全局选项

### 配置文件 (config/)
- **accounts.beancount**: 所有账户的开户声明
- **commodities.beancount**: 货币和股票等商品定义
- **plugins.beancount**: Beancount 插件配置

### 数据文件 (data/)
- 按年份和月份组织交易数据
- **opening-balances.beancount**: 期初余额设置
- 每月一个文件，便于管理和查找

### 规则文件 (rules/)
- **price-sources.beancount**: 价格数据源配置
- **importers.beancount**: 银行数据导入规则

### 报表文件 (reports/)
- 自定义查询和报表模板

## 优势

1. **模块化**: 每个文件职责明确
2. **可维护性**: 易于查找和修改特定内容
3. **版本控制友好**: 小文件更容易进行 Git 管理
4. **性能**: 只需要加载需要的部分
5. **协作**: 多人可以同时编辑不同文件
6. **备份**: 可以选择性备份重要文件

## include 语法

在 main.beancount 中使用 include 指令：

```beancount
;; 包含配置文件
include "config/accounts.beancount"
include "config/commodities.beancount"
include "config/plugins.beancount"

;; 包含数据文件
include "data/opening-balances.beancount"
include "data/2024/01-january.beancount"
include "data/2024/02-february.beancount"
;; ... 其他月份

;; 包含规则文件
include "rules/price-sources.beancount"
``` 
