/**
 * 交易记录仓储接口
 * 定义交易记录数据访问的契约
 * 
 * @author JanYork
 */

import { TransactionEntity } from '../entities/transaction.entity';
import { SearchOptions, PaginationInfo } from '../../../types';

/**
 * 交易记录仓储接口
 * 定义交易记录数据访问的标准方法
 */
export interface ITransactionRepository {
  /**
   * 保存交易记录
   * @param transaction 交易记录实体
   * @returns 保存后的交易记录
   */
  save(transaction: TransactionEntity): Promise<TransactionEntity>;

  /**
   * 批量保存交易记录
   * @param transactions 交易记录实体数组
   * @returns 保存后的交易记录数组
   */
  saveBatch(transactions: TransactionEntity[]): Promise<TransactionEntity[]>;

  /**
   * 根据ID查找交易记录
   * @param id 交易记录ID
   * @returns 交易记录实体或null
   */
  findById(id: string): Promise<TransactionEntity | null>;

  /**
   * 根据日期范围查找交易记录
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 交易记录实体数组
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<TransactionEntity[]>;

  /**
   * 根据账户查找交易记录
   * @param accountName 账户名称
   * @returns 交易记录实体数组
   */
  findByAccount(accountName: string): Promise<TransactionEntity[]>;

  /**
   * 根据标签查找交易记录
   * @param tag 标签
   * @returns 交易记录实体数组
   */
  findByTag(tag: string): Promise<TransactionEntity[]>;

  /**
   * 根据链接查找交易记录
   * @param link 链接
   * @returns 交易记录实体数组
   */
  findByLink(link: string): Promise<TransactionEntity[]>;

  /**
   * 搜索交易记录
   * @param options 搜索选项
   * @param pagination 分页信息
   * @returns 交易记录实体数组和分页信息
   */
  search(options: SearchOptions, pagination: PaginationInfo): Promise<{
    transactions: TransactionEntity[];
    pagination: PaginationInfo;
  }>;

  /**
   * 获取所有交易记录
   * @returns 交易记录实体数组
   */
  findAll(): Promise<TransactionEntity[]>;

  /**
   * 统计交易记录数量
   * @returns 交易记录总数
   */
  count(): Promise<number>;

  /**
   * 删除交易记录
   * @param id 交易记录ID
   * @returns 是否删除成功
   */
  delete(id: string): Promise<boolean>;

  /**
   * 批量删除交易记录
   * @param ids 交易记录ID数组
   * @returns 删除成功的数量
   */
  deleteBatch(ids: string[]): Promise<number>;

  /**
   * 检查交易记录是否存在
   * @param id 交易记录ID
   * @returns 是否存在
   */
  exists(id: string): Promise<boolean>;

  /**
   * 获取交易记录统计信息
   * @returns 统计信息
   */
  getStats(): Promise<{
    totalCount: number;
    dateRange: { min: Date; max: Date };
    accountCount: number;
    tagCount: number;
  }>;
} 