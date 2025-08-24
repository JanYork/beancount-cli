/**
 * 命令执行器
 * 负责协调命令的执行和结果处理
 * 
 * @author JanYork
 */

import { CommandFactory } from '../../commands/command-factory';
import { BeancountEngine } from '../../engine/beancount-engine';

import { CommandResult } from '../../types';

/**
 * 命令执行器类
 * 负责创建和执行命令
 */
export class CommandExecutor {
  private readonly engine: BeancountEngine;

  constructor(engine: BeancountEngine) {
    this.engine = engine;
  }

  /**
   * 执行命令
   * @param commandName 命令名称
   * @param params 命令参数
   * @returns 执行结果
   */
  async execute(commandName: string, params: Record<string, any>): Promise<CommandResult> {
    try {
      // 创建命令实例
      const command = CommandFactory.createCommand(commandName);
      
      if (!command) {
        return {
          success: false,
          message: `未知命令: ${commandName}`
        };
      }

      // 执行命令
      const result = await command.execute(params);
      
      // 直接返回命令执行结果
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '命令执行失败'
      };
    }
  }

  /**
   * 获取文件统计信息
   * @returns 文件统计信息
   */
  getFileStats(): {
    totalAccounts: number;
    totalTransactions: number;
    totalBalances: number;
    totalErrors: number;
    filePath: string;
  } {
    try {
      const stats = this.engine.getFileStats();
      return {
        totalAccounts: stats['totalAccounts'] || 0,
        totalTransactions: stats['totalTransactions'] || 0,
        totalBalances: stats['totalBalances'] || 0,
        totalErrors: stats['totalErrors'] || 0,
        filePath: stats['filePath'] || 'unknown',
      };
    } catch (error) {
      return {
        totalAccounts: 0,
        totalTransactions: 0,
        totalBalances: 0,
        totalErrors: 0,
        filePath: 'unknown',
      };
    }
  }

  /**
   * 重新加载文件
   */
  reload(): void {
    this.engine.reload();
  }
} 