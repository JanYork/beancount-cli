/**
 * 添加交易记录命令
 *
 * 作者: JanYork
 */

import { parse, format } from 'date-fns';
import { BaseCommand } from './base-command';
import { Transaction, Posting } from '../types';
import { BeancountFileManager } from '../utils/file-manager';
import { ConfigManager } from '../utils/config-manager';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export class AddTransactionCommand extends BaseCommand {

  private fileManager: BeancountFileManager;


  constructor() {
    super();

    this.fileManager = new BeancountFileManager();

  }

  /**
   * 执行添加交易记录命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  execute(params: Record<string, any>): import('../types').CommandResult {
    try {
      // 验证参数
      const validation = this.validateParams(params);
      if (!validation.valid) {
        return this.createErrorResult(`参数验证失败: ${validation.errors.join(', ')}`);
      }

      const dateStr = params['date'] as string;
      const narration = params['narration'] as string;
      const payee = params['payee'] as string;
      const postingsData = params['postings'] as any[];

      // 解析日期
      let transactionDate: Date;
      try {
        transactionDate = parse(dateStr, 'yyyy-MM-dd', new Date());
        if (isNaN(transactionDate.getTime())) {
          return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
        }
      } catch (error) {
        return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
      }

      // 创建分录
      const postings: Posting[] = [];
      for (const postingData of postingsData) {
        const account = postingData.account as string;
        const amount = postingData.amount as number;
        const currency = (postingData.currency as string) || 'CNY';

        if (!account || amount === undefined) {
          continue;
        }

        const posting: Posting = {
          account,
          units: {
            number: amount,
            currency,
          },
        };
        postings.push(posting);
      }

      if (postings.length === 0) {
        return this.createErrorResult('至少需要一个分录');
      }

      // 创建交易记录
      const transaction: Transaction = {
        date: transactionDate,
        payee,
        narration,
        postings,
        tags: [],
        links: [],
        meta: {},
      };

      // 添加到适当的文件
      this.addTransactionToFile(transaction);

      // 格式化成功消息
      const formattedDate = format(transactionDate, 'yyyy-MM-dd');
      const totalAmount = postings.reduce((sum, p) => sum + (p.units?.number || 0), 0);
      const sign = totalAmount >= 0 ? '+' : '';
      const color = totalAmount >= 0 ? chalk.green : chalk.red;

      const result =
        `✅ 成功添加交易记录!\n\n` +
        `📅 日期: ${chalk.cyan(formattedDate)}\n` +
        `📝 描述: ${chalk.yellow(narration)}\n` +
        `💰 总金额: ${color(`${sign}${totalAmount} CNY`)}\n` +
        `📊 分录数量: ${chalk.blue(postings.length)}`;

      return this.createSuccessResult(result, transaction);
    } catch (error) {
      return this.createErrorResult(`添加交易记录失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
📝 添加交易记录
用法: /add_transaction date=2024-01-01 narration="午餐" postings=[{"account":"Expenses:Food","amount":25},{"account":"Assets:Cash","amount":-25}]

参数:
- date: 交易日期 (YYYY-MM-DD)
- narration: 交易描述
- payee: 收款人/付款人 (可选)
- postings: 分录列表，每个分录包含account和amount

示例:
/add_transaction date=2024-01-01 narration="午餐" postings=[{"account":"Expenses:Food","amount":25},{"account":"Assets:Cash","amount":-25}]
    `;
  }

  /**
   * 验证参数
   *
   * @param params 参数
   * @returns 验证结果
   */
  protected override validateParams(params: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params['date']) {
      errors.push('缺少必要参数: 日期');
    }

    if (!params['narration']) {
      errors.push('缺少必要参数: 描述');
    }

    if (!params['postings'] || !Array.isArray(params['postings'])) {
      errors.push('缺少必要参数: 分录列表');
    }

    if (params['postings'] && Array.isArray(params['postings'])) {
      for (let i = 0; i < params['postings'].length; i++) {
        const posting = params['postings'][i];
        if (!posting.account) {
          errors.push(`分录 ${i + 1} 缺少账户名称`);
        }
        if (posting.amount === undefined) {
          errors.push(`分录 ${i + 1} 缺少金额`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * 将交易记录添加到适当的文件
   */
  private addTransactionToFile(transaction: Transaction): void {
    const transactionString = this.formatTransactionForFile(transaction);
    const targetFile = this.determineTargetFile(transaction.date);

    try {
      // 确保目标文件存在
      this.ensureFileExists(targetFile);

      // 追加到文件末尾
      fs.appendFileSync(targetFile, '\n' + transactionString + '\n', 'utf8');

      console.log(chalk.gray(`💾 交易已添加到: ${path.relative(process.cwd(), targetFile)}`));
    } catch (error) {
      // 如果多文件结构失败，回退到主文件
      console.warn(chalk.yellow('⚠️  多文件写入失败，回退到主文件'));
      const configManager = ConfigManager.getInstance();
      const mainFile = configManager.get('data.default_file') || 'main.beancount';
      fs.appendFileSync(mainFile as string, '\n' + transactionString + '\n', 'utf8');
    }
  }

  /**
   * 将交易格式化为文件格式
   */
  private formatTransactionForFile(transaction: Transaction): string {
    const dateStr = format(transaction.date, 'yyyy-MM-dd');
    let result = `${dateStr} * "${transaction.narration}"`;

    if (transaction.payee) {
      result = `${dateStr} * "${transaction.payee}" "${transaction.narration}"`;
    }

    transaction.postings.forEach(posting => {
      const amount = posting.units ? `${posting.units.number} ${posting.units.currency}` : '';
      result += `\n  ${posting.account.padEnd(40)} ${amount}`;
    });

    return result;
  }

  /**
   * 确定目标文件路径
   */
  private determineTargetFile(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const structure = this.fileManager.getStructureInfo();
    const monthName = this.getMonthName(month);
    const monthStr = month.toString().padStart(2, '0');

    return path.join(structure.root, 'data', year.toString(), `${monthStr}-${monthName}.beancount`);
  }

  /**
   * 获取月份英文名称
   */
  private getMonthName(month: number): string {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    return months[month - 1] || 'january';
  }

  /**
   * 确保文件存在
   */
  private ensureFileExists(filePath: string): void {
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 如果文件不存在，创建基本的月度文件
    if (!fs.existsSync(filePath)) {
      const fileName = path.basename(filePath, '.beancount');
      const [monthStr] = fileName.split('-');
      const year = path.basename(dir);

      const monthlyTemplate = `;; ${year}年${monthStr}月交易记录
;; 生成时间: ${new Date().toISOString().split('T')[0]}

`;
      fs.writeFileSync(filePath, monthlyTemplate, 'utf8');
      console.log(chalk.blue(`📄 创建月度文件: ${path.relative(process.cwd(), filePath)}`));
    }
  }
}
