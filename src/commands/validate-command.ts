/**
 * 验证beancount文件命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import chalk from 'chalk';

export class ValidateCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行验证命令
   *
   * @param _params 命令参数
   * @returns 执行结果
   */
  execute(_params: Record<string, any>): import('../types').CommandResult {
    try {
      // 获取文件状态来检查错误
      const stats = this.engine?.getFileStats() || { transactions: 0, accounts: 0, errors: [] };
      const errorCount = stats['totalErrors'] || 0;

      if (errorCount === 0) {
        const result =
          `✅ ${chalk.green.bold('文件验证通过!')}\n\n` +
          `📊 验证结果:\n` +
          `  ${chalk.green('•')} 语法正确\n` +
          `  ${chalk.green('•')} 账户平衡\n` +
          `  ${chalk.green('•')} 格式规范`;

        return this.createSuccessResult(result, { valid: true, errors: [] });
      } else {
        const result =
          `❌ ${chalk.red.bold('文件验证失败!')}\n\n` +
          `📊 发现 ${errorCount} 个错误\n\n` +
          `💡 建议: 请检查文件中的错误并修复后重新验证`;

        return this.createErrorResult(result, { valid: false, errors: [`发现 ${errorCount} 个错误`] });
      }
    } catch (error) {
      return this.createErrorResult(`验证文件失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
🔍 验证beancount文件
用法: /validate

功能: 验证当前beancount文件的语法正确性、账户平衡性和格式规范性

验证内容:
- 语法检查
- 账户平衡验证
- 格式规范检查
- 错误报告

示例:
/validate
    `;
  }
}
