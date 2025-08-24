/**
 * 交易记录服务
 * 实现应用层业务逻辑，协调领域对象和基础设施
 * 
 * @author JanYork
 */

import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { SearchOptions, PaginationInfo, Posting, Amount } from '../../../types';
import { Result } from '../../shared/result';

/**
 * 交易记录服务类
 * 封装交易记录相关的业务逻辑
 */
export class TransactionService {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  /**
   * 创建交易记录
   * @param date 交易日期
   * @param narration 交易描述
   * @param postings 分录列表
   * @param payee 收款人/付款人
   * @param tags 标签列表
   * @param links 链接列表
   * @param meta 元数据
   * @returns 创建结果
   */
  async createTransaction(
    date: Date,
    narration: string,
    postings: Posting[],
    payee?: string,
    tags: string[] = [],
    links: string[] = [],
    meta: Record<string, any> = {}
  ): Promise<Result<TransactionEntity>> {
    try {
      // 创建交易记录实体
      const transaction = new TransactionEntity(
        date,
        narration,
        postings,
        payee,
        tags,
        links,
        meta
      );

      // 保存到仓储
      const savedTransaction = await this.transactionRepository.save(transaction);

      return Result.success(savedTransaction);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '创建交易记录失败');
    }
  }

  /**
   * 批量创建交易记录
   * @param transactions 交易记录数据数组
   * @returns 创建结果
   */
  async createTransactions(
    transactions: Array<{
      date: Date;
      narration: string;
      postings: Posting[];
      payee?: string;
      tags?: string[];
      links?: string[];
      meta?: Record<string, any>;
    }>
  ): Promise<Result<TransactionEntity[]>> {
    try {
      const transactionEntities = transactions.map(t => 
        new TransactionEntity(
          t.date,
          t.narration,
          t.postings,
          t.payee,
          t.tags || [],
          t.links || [],
          t.meta || {}
        )
      );

      const savedTransactions = await this.transactionRepository.saveBatch(transactionEntities);

      return Result.success(savedTransactions);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '批量创建交易记录失败');
    }
  }

  /**
   * 获取交易记录
   * @param id 交易记录ID
   * @returns 获取结果
   */
  async getTransaction(id: string): Promise<Result<TransactionEntity | null>> {
    try {
      const transaction = await this.transactionRepository.findById(id);
      return Result.success(transaction);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '获取交易记录失败');
    }
  }

  /**
   * 搜索交易记录
   * @param options 搜索选项
   * @param pagination 分页信息
   * @returns 搜索结果
   */
  async searchTransactions(
    options: SearchOptions,
    pagination: PaginationInfo
  ): Promise<Result<{ transactions: TransactionEntity[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.transactionRepository.search(options, pagination);
      return Result.success(result);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '搜索交易记录失败');
    }
  }

  /**
   * 根据日期范围获取交易记录
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 获取结果
   */
  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Result<TransactionEntity[]>> {
    try {
      const transactions = await this.transactionRepository.findByDateRange(startDate, endDate);
      return Result.success(transactions);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '获取日期范围交易记录失败');
    }
  }

  /**
   * 根据账户获取交易记录
   * @param accountName 账户名称
   * @returns 获取结果
   */
  async getTransactionsByAccount(accountName: string): Promise<Result<TransactionEntity[]>> {
    try {
      const transactions = await this.transactionRepository.findByAccount(accountName);
      return Result.success(transactions);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '获取账户交易记录失败');
    }
  }

  /**
   * 删除交易记录
   * @param id 交易记录ID
   * @returns 删除结果
   */
  async deleteTransaction(id: string): Promise<Result<boolean>> {
    try {
      const success = await this.transactionRepository.delete(id);
      return Result.success(success);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '删除交易记录失败');
    }
  }

  /**
   * 批量删除交易记录
   * @param ids 交易记录ID数组
   * @returns 删除结果
   */
  async deleteTransactions(ids: string[]): Promise<Result<number>> {
    try {
      const deletedCount = await this.transactionRepository.deleteBatch(ids);
      return Result.success(deletedCount);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '批量删除交易记录失败');
    }
  }

  /**
   * 获取交易记录统计信息
   * @returns 统计结果
   */
  async getTransactionStats(): Promise<Result<{
    totalCount: number;
    dateRange: { min: Date; max: Date };
    accountCount: number;
    tagCount: number;
  }>> {
    try {
      const stats = await this.transactionRepository.getStats();
      return Result.success(stats);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '获取交易记录统计失败');
    }
  }

  /**
   * 验证交易记录
   * @param transaction 交易记录实体
   * @returns 验证结果
   */
  validateTransaction(_transaction: TransactionEntity): Result<boolean> {
    try {
      // 交易记录实体内部已经包含验证逻辑
      return Result.success(true);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '交易记录验证失败');
    }
  }

  /**
   * 计算账户余额
   * @param accountName 账户名称
   * @param transactions 交易记录列表
   * @returns 余额计算结果
   */
  calculateAccountBalance(
    accountName: string,
    transactions: TransactionEntity[]
  ): Result<Amount> {
    try {
      let balance = 0;
      let currency = 'CNY';

      for (const transaction of transactions) {
        const postings = transaction.getPostingsByAccount(accountName);
        for (const posting of postings) {
          if (posting.units) {
            balance += posting.units.number;
            currency = posting.units.currency;
          }
        }
      }

      return Result.success({ number: balance, currency });
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '计算账户余额失败');
    }
  }
} 