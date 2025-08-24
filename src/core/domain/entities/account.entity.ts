/**
 * 账户实体
 * 实现领域驱动设计，封装账户的核心业务逻辑
 * 
 * @author JanYork
 */

import { AccountType } from '../../../types';

/**
 * 账户实体类
 * 封装账户的核心业务逻辑和验证规则
 */
export class AccountEntity {
  private readonly _name: string;
  private readonly _type: AccountType;
  private readonly _parent?: string;
  private readonly _description?: string;
  private readonly _openDate: Date;
  private readonly _closeDate?: Date;
  private readonly _meta: Record<string, any>;

  constructor(
    name: string,
    type: AccountType,
    openDate: Date,
    parent?: string,
    description?: string,
    closeDate?: Date,
    meta: Record<string, any> = {}
  ) {
    this._name = name;
    this._type = type;
    this._parent = parent;
    this._description = description;
    this._openDate = openDate;
    this._closeDate = closeDate;
    this._meta = { ...meta };

    this.validate();
  }

  /**
   * 获取账户名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取账户类型
   */
  get type(): AccountType {
    return this._type;
  }

  /**
   * 获取父账户名称
   */
  get parent(): string | undefined {
    return this._parent;
  }

  /**
   * 获取账户描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取开户日期
   */
  get openDate(): Date {
    return new Date(this._openDate);
  }

  /**
   * 获取关闭日期
   */
  get closeDate(): Date | undefined {
    return this._closeDate ? new Date(this._closeDate) : undefined;
  }

  /**
   * 获取元数据
   */
  get meta(): Readonly<Record<string, any>> {
    return this._meta;
  }

  /**
   * 检查账户是否已关闭
   */
  isClosed(): boolean {
    return this._closeDate !== undefined;
  }

  /**
   * 检查账户是否为根账户
   */
  isRoot(): boolean {
    return this._parent === undefined;
  }

  /**
   * 检查账户是否为子账户
   */
  isChild(): boolean {
    return this._parent !== undefined;
  }

  /**
   * 获取账户层级深度
   */
  getDepth(): number {
    return this._name.split(':').length - 1;
  }

  /**
   * 获取账户路径数组
   */
  getPath(): string[] {
    return this._name.split(':');
  }

  /**
   * 获取账户根名称
   */
  getRootName(): string {
    return this._name.split(':')[0] || '';
  }

  /**
   * 检查是否为指定类型的账户
   */
  isOfType(type: AccountType): boolean {
    return this._type === type;
  }

  /**
   * 检查是否为资产账户
   */
  isAsset(): boolean {
    return this._type === 'ASSETS';
  }

  /**
   * 检查是否为负债账户
   */
  isLiability(): boolean {
    return this._type === 'LIABILITIES';
  }

  /**
   * 检查是否为权益账户
   */
  isEquity(): boolean {
    return this._type === 'EQUITY';
  }

  /**
   * 检查是否为收入账户
   */
  isIncome(): boolean {
    return this._type === 'INCOME';
  }

  /**
   * 检查是否为支出账户
   */
  isExpense(): boolean {
    return this._type === 'EXPENSES';
  }

  /**
   * 关闭账户
   */
  close(closeDate: Date = new Date()): AccountEntity {
    if (this.isClosed()) {
      throw new Error('账户已经关闭');
    }

    return new AccountEntity(
      this._name,
      this._type,
      this._openDate,
      this._parent,
      this._description,
      closeDate,
      this._meta
    );
  }

  /**
   * 更新元数据
   */
  updateMeta(meta: Record<string, any>): AccountEntity {
    return new AccountEntity(
      this._name,
      this._type,
      this._openDate,
      this._parent,
      this._description,
      this._closeDate,
      { ...this._meta, ...meta }
    );
  }

  /**
   * 转换为DTO对象
   */
  toDTO() {
    return {
      name: this._name,
      type: this._type,
      parent: this._parent,
      description: this._description,
      openDate: this._openDate,
      closeDate: this._closeDate,
      meta: this._meta,
    };
  }

  /**
   * 验证账户
   */
  private validate(): void {
    const errors: string[] = [];

    if (!this._name || this._name.trim().length === 0) {
      errors.push('账户名称不能为空');
    }

    if (!this._name.includes(':')) {
      errors.push('账户名称必须包含冒号分隔符');
    }

    if (!this._openDate || isNaN(this._openDate.getTime())) {
      errors.push('开户日期不能为空且必须有效');
    }

    if (this._closeDate && (isNaN(this._closeDate.getTime()) || this._closeDate < this._openDate)) {
      errors.push('关闭日期必须晚于开户日期');
    }

    if (errors.length > 0) {
      throw new Error(`账户验证失败: ${errors.join(', ')}`);
    }
  }
} 