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