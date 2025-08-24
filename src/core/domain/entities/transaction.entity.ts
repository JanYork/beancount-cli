/**
 * 交易记录实体
 * 实现领域驱动设计，封装交易记录的核心业务逻辑
 * 
 * @author JanYork
 */

import { Amount, Posting } from '../../../types';

/**
 * 交易记录实体类
 * 封装交易记录的核心业务逻辑和验证规则
 */
export class TransactionEntity {
  private readonly _id: string;
  private readonly _date: Date;
  private readonly _payee?: string;
  private readonly _narration: string;
  private readonly _postings: Posting[];
  private readonly _tags: string[];
  private readonly _links: string[];
  private readonly _meta: Record<string, any>;

  constructor(
    date: Date,
    narration: string,
    postings: Posting[],
    payee?: string,
    tags: string[] = [],
    links: string[] = [],
    meta: Record<string, any> = {},
    id?: string
  ) {
    this._id = id || this.generateId();
    this._date = date;
    this._payee = payee;
    this._narration = narration;
    this._postings = [...postings];
    this._tags = [...tags];
    this._links = [...links];
    this._meta = { ...meta };

    this.validate();
  }

  /**
   * 获取交易ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * 获取交易日期
   */
  get date(): Date {
    return new Date(this._date);
  }

  /**
   * 获取收款人/付款人
   */
  get payee(): string | undefined {
    return this._payee;
  }

  /**
   * 获取交易描述
   */
  get narration(): string {
    return this._narration;
  }

  /**
   * 获取分录列表
   */
  get postings(): readonly Posting[] {
    return this._postings;
  }

  /**
   * 获取标签列表
   */
  get tags(): readonly string[] {
    return this._tags;
  }

  /**
   * 获取链接列表
   */
  get links(): readonly string[] {
    return this._links;
  }

  /**
   * 获取元数据
   */
  get meta(): Readonly<Record<string, any>> {
    return this._meta;
  }

  /**
   * 获取总金额
   */
  get totalAmount(): Amount | null {
    if (this._postings.length === 0) {
      return null;
    }

    const firstPosting = this._postings[0];
    if (!firstPosting || !firstPosting.units) {
      return null;
    }

    const total = this._postings.reduce((sum, posting) => {
      return sum + (posting.units?.number || 0);
    }, 0);

    return {
      number: total,
      currency: firstPosting.units.currency,
    };
  }

  /**
   * 检查交易是否平衡
   */
  isBalanced(): boolean {
    const total = this._postings.reduce((sum, posting) => {
      return sum + (posting.units?.number || 0);
    }, 0);

    // 允许小的浮点误差
    return Math.abs(total) < 0.01;
  }

  /**
   * 检查是否包含指定账户
   */
  hasAccount(accountName: string): boolean {
    return this._postings.some(posting => posting.account === accountName);
  }

  /**
   * 检查是否包含指定标签
   */
  hasTag(tag: string): boolean {
    return this._tags.includes(tag);
  }

  /**
   * 检查是否包含指定链接
   */
  hasLink(link: string): boolean {
    return this._links.includes(link);
  }

  /**
   * 获取指定账户的分录
   */
  getPostingsByAccount(accountName: string): Posting[] {
    return this._postings.filter(posting => posting.account === accountName);
  }

  /**
   * 转换为DTO对象
   */
  toDTO() {
    return {
      id: this._id,
      date: this._date,
      payee: this._payee,
      narration: this._narration,
      postings: this._postings,
      tags: this._tags,
      links: this._links,
      meta: this._meta,
    };
  }

  /**
   * 验证交易记录
   */
  private validate(): void {
    const errors: string[] = [];

    if (!this._date || isNaN(this._date.getTime())) {
      errors.push('交易日期不能为空且必须有效');
    }

    if (!this._narration || this._narration.trim().length === 0) {
      errors.push('交易描述不能为空');
    }

    if (this._postings.length === 0) {
      errors.push('至少需要一个分录');
    }

    // 验证分录
    for (let i = 0; i < this._postings.length; i++) {
      const posting = this._postings[i];
      if (!posting || !posting.account || posting.account.trim().length === 0) {
        errors.push(`分录 ${i + 1} 缺少账户名称`);
      }
    }

    // 检查借贷平衡
    if (!this.isBalanced()) {
      errors.push('借贷不平衡');
    }

    if (errors.length > 0) {
      throw new Error(`交易记录验证失败: ${errors.join(', ')}`);
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 