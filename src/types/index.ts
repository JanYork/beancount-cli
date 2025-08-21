/**
 * Beancount CLI 核心类型定义
 *
 * 作者: JanYork
 */

export interface Account {
  /** 账户名称 */
  name: string;
  /** 账户类型 */
  type: AccountType;
  /** 父账户名称 */
  parent?: string;
  /** 账户描述 */
  description?: string;
  /** 开户日期 */
  openDate?: Date;
  /** 关闭日期 */
  closeDate?: Date;
  /** 元数据 */
  meta?: Record<string, any>;
}

export type AccountType = 'ASSETS' | 'LIABILITIES' | 'EQUITY' | 'INCOME' | 'EXPENSES';

export interface Amount {
  /** 数量 */
  number: number;
  /** 货币 */
  currency: string;
}

export interface Posting {
  /** 账户名称 */
  account: string;
  /** 数量 */
  units?: Amount;
  /** 成本 */
  cost?: any;
  /** 价格 */
  price?: Amount;
  /** 标志 */
  flag?: string;
  /** 元数据 */
  meta?: Record<string, any>;
}

export interface Transaction {
  /** 交易日期 */
  date: Date;
  /** 收款人/付款人 */
  payee?: string;
  /** 交易描述 */
  narration: string;
  /** 交易分录列表 */
  postings: Posting[];
  /** 标签列表 */
  tags: string[];
  /** 链接列表 */
  links: string[];
  /** 元数据 */
  meta?: Record<string, any>;
  /** 唯一标识符 */
  id?: string;
}

export interface Balance {
  /** 账户名称 */
  account: string;
  /** 余额数量 */
  amount: Amount;
  /** 余额日期 */
  date: Date;
}

export interface BeancountFile {
  /** 文件路径 */
  path: string;
  /** 所有条目 */
  entries: any[];
  /** 解析错误 */
  errors: any[];
  /** 配置选项 */
  options: Record<string, any>;
}

export interface CommandResult {
  /** 是否成功 */
  success: boolean;
  /** 结果消息 */
  message: string;
  /** 数据 */
  data?: any;
  /** 分页信息 */
  pagination?: PaginationInfo;
}

export interface ParsedCommand {
  /** 命令名称 */
  command: string;
  /** 参数字典 */
  params: Record<string, any>;
}

export interface BeancountEntry {
  /** 条目类型 */
  type: string;
  /** 日期 */
  date: Date;
  /** 元数据 */
  meta?: Record<string, any>;
  /** 其他属性 */
  [key: string]: any;
}

// 新增类型定义

export interface PaginationInfo {
  /** 当前页码 */
  currentPage: number;
  /** 每页大小 */
  pageSize: number;
  /** 总记录数 */
  totalRecords: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
}

export interface SearchOptions {
  /** 搜索关键词 */
  query?: string;
  /** 开始日期 */
  startDate?: Date;
  /** 结束日期 */
  endDate?: Date;
  /** 账户过滤 */
  accounts?: string[];
  /** 标签过滤 */
  tags?: string[];
  /** 金额范围 */
  amountRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

export interface ReportData {
  /** 报表标题 */
  title: string;
  /** 报表类型 */
  type: ReportType;
  /** 报表数据 */
  data: any;
  /** 生成时间 */
  generatedAt: Date;
  /** 时间范围 */
  period?: {
    start: Date;
    end: Date;
  };
}

export type ReportType =
  | 'income_expense'
  | 'balance_sheet'
  | 'cash_flow'
  | 'budget_analysis'
  | 'account_summary'
  | 'monthly_summary'
  | 'yearly_summary'
  | 'category_analysis';

export interface ExportOptions {
  /** 导出格式 */
  format: 'csv' | 'excel' | 'json' | 'beancount';
  /** 导出路径 */
  outputPath?: string;
  /** 时间范围 */
  dateRange?: {
    start: Date;
    end: Date;
  } | undefined;
  /** 包含的账户 */
  accounts?: string[];
  /** 包含的标签 */
  tags?: string[];
}

export interface Budget {
  /** 预算账户 */
  account: string;
  /** 预算金额 */
  amount: Amount;
  /** 预算周期 */
  period: 'monthly' | 'yearly' | 'weekly';
  /** 开始日期 */
  startDate: Date;
  /** 结束日期 */
  endDate?: Date;
  /** 预算描述 */
  description?: string;
  /** 元数据 */
  meta?: Record<string, any>;
}

export interface BudgetAnalysis {
  /** 预算账户 */
  account: string;
  /** 预算金额 */
  budgetAmount: Amount;
  /** 实际支出 */
  actualAmount: Amount;
  /** 剩余金额 */
  remainingAmount: Amount;
  /** 使用百分比 */
  usagePercentage: number;
  /** 是否超支 */
  isOverBudget: boolean;
}

export interface CategoryAnalysis {
  /** 分类名称 */
  category: string;
  /** 总金额 */
  totalAmount: Amount;
  /** 交易数量 */
  transactionCount: number;
  /** 平均金额 */
  averageAmount: Amount;
  /** 最大金额 */
  maxAmount: Amount;
  /** 最小金额 */
  minAmount: Amount;
  /** 占比 */
  percentage: number;
}

export interface MonthlySummary {
  /** 年份 */
  year: number;
  /** 月份 */
  month: number;
  /** 总收入 */
  totalIncome: Amount;
  /** 总支出 */
  totalExpenses: Amount;
  /** 净收入 */
  netIncome: Amount;
  /** 交易数量 */
  transactionCount: number;
  /** 账户余额变化 */
  balanceChanges: Record<string, Amount>;
}

export interface YearlySummary {
  /** 年份 */
  year: number;
  /** 总收入 */
  totalIncome: Amount;
  /** 总支出 */
  totalExpenses: Amount;
  /** 净收入 */
  netIncome: Amount;
  /** 交易数量 */
  transactionCount: number;
  /** 月度数据 */
  monthlyData: MonthlySummary[];
  /** 账户余额变化 */
  balanceChanges: Record<string, Amount>;
}

export interface CashFlow {
  /** 期间 */
  period: string;
  /** 期初余额 */
  openingBalance: Amount;
  /** 期末余额 */
  closingBalance: Amount;
  /** 现金流入 */
  cashInflow: Amount;
  /** 现金流出 */
  cashOutflow: Amount;
  /** 净现金流 */
  netCashFlow: Amount;
  /** 详细分类 */
  categories: CategoryAnalysis[];
}

export interface BalanceSheet {
  /** 报告日期 */
  reportDate: Date;
  /** 资产 */
  assets: Record<string, number>;
  /** 负债 */
  liabilities: Record<string, number>;
  /** 权益 */
  equity: Record<string, number>;
  /** 总资产 */
  totalAssets: number;
  /** 总负债 */
  totalLiabilities: number;
  /** 净资产 */
  netWorth: number;
}
