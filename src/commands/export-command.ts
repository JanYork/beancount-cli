/**
 * 导出命令
 * 支持多种格式的数据导出
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';
import { ExportUtil } from '../utils/export-util';

export class ExportCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行导出命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  async execute(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      // 检查是否需要交互式输入
      if (params['interactive'] === true || Object.keys(params).length === 0) {
        return await this.executeInteractive();
      }

      const format = params['format'] as string;
      const outputPath = params['outputPath'] as string;
      const startDate = params['startDate'] as string;
      const endDate = params['endDate'] as string;
      const accounts = params['accounts'] as string;

      // 验证必需参数
      if (!format) {
        return this.createErrorResult('缺少必需参数: format。请指定导出格式，或使用 interactive=true 进行交互式输入');
      }

      // 获取要导出的数据
      const transactions = this.engine?.getTransactions() || [];
      // const _accountsList = this.engine?.getAccounts() || [];

      // 根据日期范围过滤交易
      let filteredTransactions = transactions;
      if (startDate || endDate) {
        filteredTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          if (startDate && txDate < new Date(startDate)) return false;
          if (endDate && txDate > new Date(endDate)) return false;
          return true;
        });
      }

      // 根据账户过滤交易
      if (accounts) {
        const accountList = accounts.split(',');
        filteredTransactions = filteredTransactions.filter(tx => {
          const txAccounts = tx.postings?.map((p: any) => p.account) || [];
          return accountList.some(account => txAccounts.includes(account));
        });
      }

      // 构建导出选项
      const exportOptions = {
        format: format as any,
        outputPath: outputPath || undefined
      };

      // 执行导出
      const outputFilePath = await ExportUtil.exportTransactions(filteredTransactions, exportOptions);

      return this.createSuccessResult(
        `✅ 数据导出成功: ${outputFilePath}`,
        { filePath: outputFilePath, transactionCount: filteredTransactions.length }
      );
    } catch (error) {
      return this.createErrorResult(`导出失败: ${error}`);
    }
  }

  /**
   * 执行交互式导出
   */
  private async executeInteractive(): Promise<import('../types').CommandResult> {
    try {
      // 使用交互式处理器收集参数
      const interactiveParams = await InteractiveCommandHandler.handleExport();
      
      // 构建参数
      const params: Record<string, any> = {};
      
      if (interactiveParams.format) {
        params['format'] = interactiveParams.format;
      }
      
      if (interactiveParams.outputPath) {
        params['outputPath'] = interactiveParams.outputPath;
      }
      
      if (interactiveParams.dateRange) {
        params['startDate'] = interactiveParams.dateRange.start;
        params['endDate'] = interactiveParams.dateRange.end;
      }
      
      if (interactiveParams.accounts && interactiveParams.accounts.length > 0) {
        params['accounts'] = interactiveParams.accounts.join(',');
      }
      
      // 递归调用 execute 方法，传入收集到的参数
      return await this.execute(params);
    } catch (error) {
      return this.createErrorResult(`交互式导出失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
📤 导出数据
用法: export [参数] 或 export interactive=true

参数:
- format: 导出格式 (csv, json, excel, pdf)
- outputPath: 输出文件路径
- startDate: 开始日期 (YYYY-MM-DD)
- endDate: 结束日期 (YYYY-MM-DD)
- accounts: 账户列表（用逗号分隔）
- interactive: 是否使用交互式输入 (true/false)

示例:
export format=csv outputPath=./data.csv
export format=json startDate=2024-01-01 endDate=2024-12-31
export format=excel accounts="Assets:Cash,Expenses:Food"
export interactive=true
    `;
  }
}
