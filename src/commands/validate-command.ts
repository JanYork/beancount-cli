/**
 * 验证命令
 * 验证数据完整性和一致性
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';

export class ValidateCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行验证命令
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

      const validateType = params['type'] as string;
      const fixIssues = params['fix'] as boolean;

      // 执行验证
      const validationResults = await this.performValidation(validateType);

      if (validationResults.errors.length === 0) {
        return this.createSuccessResult('✅ 数据验证通过，未发现任何问题');
      }

      // 如果有错误且用户要求自动修复
      if (fixIssues) {
        const fixedResults = await this.fixIssues(validationResults.errors);
        return this.createSuccessResult(
          `✅ 验证完成，发现 ${validationResults.errors.length} 个问题，已修复 ${fixedResults.fixedCount} 个`,
          { validationResults, fixedResults }
        );
      }

      return this.createSuccessResult(
        `⚠️ 验证完成，发现 ${validationResults.errors.length} 个问题`,
        validationResults
      );
    } catch (error) {
      return this.createErrorResult(`验证失败: ${error}`);
    }
  }

  /**
   * 执行交互式验证
   */
  private async executeInteractive(): Promise<import('../types').CommandResult> {
    try {
      // 使用交互式处理器收集参数
      const interactiveParams = await InteractiveCommandHandler.handleValidate();
      
      // 构建参数
      const params: Record<string, any> = {};
      
      if (interactiveParams.validateType) {
        params['type'] = interactiveParams.validateType;
      }
      
      if (interactiveParams.fixIssues !== undefined) {
        params['fix'] = interactiveParams.fixIssues;
      }
      
      // 递归调用 execute 方法，传入收集到的参数
      return await this.execute(params);
    } catch (error) {
      return this.createErrorResult(`交互式验证失败: ${error}`);
    }
  }

  /**
   * 执行验证
   */
  private async performValidation(validateType?: string): Promise<any> {
    const errors: any[] = [];
    const warnings: any[] = [];

    const transactions = this.engine?.getTransactions() || [];
    const accounts = this.engine?.getAccounts() || [];

    // 验证交易记录
    if (!validateType || validateType === 'transactions') {
      for (const tx of transactions) {
        // 验证必需字段
        if (!tx.date) {
          errors.push({ type: 'missing_date', transaction: tx, message: '缺少交易日期' });
        }
        if (!tx.narration) {
          errors.push({ type: 'missing_narration', transaction: tx, message: '缺少交易描述' });
        }
        if (!tx.postings || tx.postings.length < 2) {
          errors.push({ type: 'insufficient_postings', transaction: tx, message: '交易至少需要2个分录' });
        }

        // 验证分录平衡
        if (tx.postings && tx.postings.length >= 2) {
          const total = tx.postings.reduce((sum: number, p: any) => {
            return sum + (p.units?.number || 0);
          }, 0);
          
          if (Math.abs(total) > 0.01) { // 允许小的浮点误差
            errors.push({ type: 'unbalanced_transaction', transaction: tx, message: `交易不平衡，总金额: ${total}` });
          }
        }
      }
    }

    // 验证账户
    if (!validateType || validateType === 'accounts') {
      for (const account of accounts) {
        if (!account.name) {
          errors.push({ type: 'missing_account_name', account, message: '缺少账户名称' });
        }
      }
    }

    // 验证数据一致性
    if (!validateType || validateType === 'consistency') {
      // 检查账户引用一致性
      const accountNames = new Set(accounts.map(a => a.name));
      for (const tx of transactions) {
        if (tx.postings) {
          for (const posting of tx.postings) {
            if (!accountNames.has(posting.account)) {
              warnings.push({ type: 'undefined_account', transaction: tx, account: posting.account, message: `未定义的账户: ${posting.account}` });
            }
          }
        }
      }
    }

    return { errors, warnings, transactionCount: transactions.length, accountCount: accounts.length };
  }

  /**
   * 修复问题
   */
  private async fixIssues(errors: any[]): Promise<any> {
    let fixedCount = 0;

    for (const error of errors) {
      try {
        switch (error.type) {
          case 'missing_narration':
            error.transaction.narration = '未命名交易';
            fixedCount++;
            break;
          case 'insufficient_postings':
            // 添加默认分录
            if (!error.transaction.postings) {
              error.transaction.postings = [
                { account: 'Assets:Cash', units: { number: 0, currency: 'CNY' } },
                { account: 'Expenses:Unknown', units: { number: 0, currency: 'CNY' } }
              ];
            }
            fixedCount++;
            break;
          // 可以添加更多修复逻辑
        }
      } catch (fixError) {
        console.warn(`修复问题失败: ${fixError}`);
      }
    }

    // 保存修复后的数据
    if (fixedCount > 0) {
      const transactions = this.engine?.getTransactions() || [];
      this.engine?.saveTransactions(transactions);
    }

    return { fixedCount, totalErrors: errors.length };
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
🔍 数据验证
用法: validate [参数] 或 validate interactive=true

参数:
- type: 验证类型 (transactions, accounts, consistency, all)
- fix: 是否自动修复问题 (true/false)
- interactive: 是否使用交互式输入 (true/false)

示例:
validate type=transactions
validate type=all fix=true
validate interactive=true
    `;
  }
}
