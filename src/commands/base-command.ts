/**
 * 命令基类
 *
 * 作者: JanYork
 */

import { CommandResult } from '../types';

export abstract class BaseCommand {
  /**
   * 执行命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  abstract execute(params: Record<string, any>): CommandResult | Promise<CommandResult>;

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  abstract getHelp(): string;

  /**
   * 验证参数
   *
   * @param params 参数
   * @returns 验证结果
   */
  protected validateParams(_params: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 子类可以重写此方法进行具体验证
    return { valid: errors.length === 0, errors };
  }

  /**
   * 创建成功结果
   *
   * @param message 消息
   * @param data 数据
   * @returns 成功结果
   */
  protected createSuccessResult(message: string, data?: any): CommandResult {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * 创建失败结果
   *
   * @param message 消息
   * @param data 数据
   * @returns 失败结果
   */
  protected createErrorResult(message: string, data?: any): CommandResult {
    return {
      success: false,
      message,
      data,
    };
  }
}
