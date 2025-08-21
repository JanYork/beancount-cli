/**
 * 编辑交易命令
 * 支持修改现有交易记录
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { CommandResult, Transaction, Posting } from '../types';
import { UIEnhancer } from '../utils/ui-enhancer';
import { BeancountEngine } from '../engine/beancount-engine';
import { format } from 'date-fns';

export class EditTransactionCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  async execute(params: Record<string, any>): Promise<CommandResult> {
    try {
      const transactionId = params['id'] || params['args']?.[0];

      if (!transactionId) {
        return {
          success: false,
          message: '请指定要编辑的交易ID，使用 /edit_transaction help 查看帮助',
        };
      }

      if (transactionId === 'help') {
        return {
          success: true,
          message: this.getHelp(),
        };
      }

      // 获取所有交易
      const transactions = this.engine?.getTransactions() || [];

      // 查找要编辑的交易
      const transactionIndex = transactions.findIndex((tx: any) => tx.id === transactionId);

      if (transactionIndex === -1) {
        return {
          success: false,
          message: `未找到ID为 ${transactionId} 的交易记录`,
        };
      }

      const originalTransaction = transactions[transactionIndex];
      if (!originalTransaction) {
        return {
          success: false,
          message: `未找到ID为 ${transactionId} 的交易记录`,
        };
      }

      // 显示当前交易信息
      this.displayTransaction(originalTransaction, '当前交易信息');

      // 确认是否要编辑
      const shouldEdit = await UIEnhancer.showConfirmation('是否要编辑此交易？');
      if (!shouldEdit) {
        return {
          success: true,
          message: '取消编辑操作',
        };
      }

      // 开始编辑流程
      const editedTransaction = await this.editTransaction(originalTransaction);

      if (!editedTransaction) {
        return {
          success: false,
          message: '编辑操作被取消',
        };
      }

      // 显示编辑后的交易信息
      this.displayTransaction(editedTransaction, '编辑后的交易信息');

      // 确认保存
      const shouldSave = await UIEnhancer.showConfirmation('是否保存这些更改？');
      if (!shouldSave) {
        return {
          success: true,
          message: '取消保存操作',
        };
      }

      // 更新交易
      transactions[transactionIndex] = editedTransaction;

      // 保存到文件
      await this.engine?.saveTransactions(transactions);

      UIEnhancer.showSuccess('交易编辑成功！');

      return {
        success: true,
        message: `成功编辑交易 ${transactionId}`,
        data: {
          originalTransaction,
          editedTransaction,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `编辑交易失败: ${error}`,
      };
    }
  }

  private async editTransaction(transaction: Transaction): Promise<Transaction | null> {
    try {
      const editedTransaction = { ...transaction };

      // 编辑日期
      const newDate = await UIEnhancer.showInput(
        '交易日期 (YYYY-MM-DD)',
        format(new Date(transaction.date), 'yyyy-MM-dd')
      );
      if (newDate) {
        editedTransaction.date = new Date(newDate);
      }

      // 编辑收款人/付款人
      const newPayee = await UIEnhancer.showInput(
        '收款人/付款人',
        transaction.payee || ''
      );
      if (newPayee !== undefined) {
        editedTransaction.payee = newPayee || '';
      }

      // 编辑描述
      const newNarration = await UIEnhancer.showInput(
        '交易描述',
        transaction.narration
      );
      if (newNarration) {
        editedTransaction.narration = newNarration;
      }

      // 编辑标签
      const newTags = await UIEnhancer.showInput(
        '标签 (用逗号分隔)',
        transaction.tags.join(', ')
      );
      if (newTags !== undefined) {
        editedTransaction.tags = newTags ? newTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      }

      // 编辑链接
      const newLinks = await UIEnhancer.showInput(
        '链接 (用逗号分隔)',
        transaction.links.join(', ')
      );
      if (newLinks !== undefined) {
        editedTransaction.links = newLinks ? newLinks.split(',').map(link => link.trim()).filter(link => link) : [];
      }

      // 编辑分录
      const shouldEditPostings = await UIEnhancer.showConfirmation('是否要编辑分录？');
      if (shouldEditPostings) {
        editedTransaction.postings = await this.editPostings(transaction.postings);
      }

      return editedTransaction;
    } catch (error) {
      console.error('编辑交易时出错:', error);
      return null;
    }
  }

  private async editPostings(postings: Posting[]): Promise<Posting[]> {
    const editedPostings: Posting[] = [];

    for (let i = 0; i < postings.length; i++) {
      const posting = postings[i];
      if (!posting) continue; // 跳过undefined的posting

      console.log(`\n编辑分录 ${i + 1}/${postings.length}:`);
      console.log(`  账户: ${posting.account}`);
      console.log(`  金额: ${posting.units ? `${posting.units.number} ${posting.units.currency}` : '无'}`);

      const shouldEdit = await UIEnhancer.showConfirmation(`是否编辑分录 ${i + 1}？`);

      if (shouldEdit) {
        const editedPosting = await this.editPosting(posting);
        if (editedPosting) {
          editedPostings.push(editedPosting);
        } else {
          // 用户取消编辑，保留原分录
          editedPostings.push(posting);
        }
      } else {
        editedPostings.push(posting);
      }
    }

    // 询问是否添加新分录
    const shouldAddNew = await UIEnhancer.showConfirmation('是否添加新分录？');
    if (shouldAddNew) {
      const newPosting = await this.createNewPosting();
      if (newPosting) {
        editedPostings.push(newPosting);
      }
    }

    return editedPostings;
  }

  private async editPosting(posting: Posting): Promise<Posting | null> {
    try {
      const editedPosting = { ...posting };

      // 编辑账户
      const newAccount = await UIEnhancer.showInput(
        '账户名称',
        posting.account
      );
      if (newAccount) {
        editedPosting.account = newAccount;
      }

      // 编辑金额
      const currentAmount = posting.units ? `${posting.units.number} ${posting.units.currency}` : '';
      const newAmountStr = await UIEnhancer.showInput(
        '金额 (格式: 数字 货币，如: 100 CNY)',
        currentAmount
      );

      if (newAmountStr) {
        const amountParts = newAmountStr.trim().split(' ');
        if (amountParts.length >= 2) {
          const number = parseFloat(amountParts[0] || '0');
          const currency = amountParts[1] || '';

          if (!isNaN(number) && currency) {
            editedPosting.units = {
              number,
              currency,
            };
          }
        }
      }

      // 编辑价格
      if (posting.price) {
        const currentPrice = `${posting.price.number} ${posting.price.currency}`;
        const newPriceStr = await UIEnhancer.showInput(
          '价格 (格式: 数字 货币，留空删除)',
          currentPrice
        );

        if (newPriceStr) {
          const priceParts = newPriceStr.trim().split(' ');
          if (priceParts.length >= 2) {
            const number = parseFloat(priceParts[0] || '0');
            const currency = priceParts[1] || '';

            if (!isNaN(number) && currency) {
              editedPosting.price = {
                number,
                currency,
              };
            }
          }
        } else {
          delete editedPosting.price;
        }
      } else {
        const newPriceStr = await UIEnhancer.showInput(
          '价格 (格式: 数字 货币，留空跳过)',
          ''
        );

        if (newPriceStr) {
          const priceParts = newPriceStr.trim().split(' ');
          if (priceParts.length >= 2) {
            const number = parseFloat(priceParts[0] || '0');
            const currency = priceParts[1] || '';

            if (!isNaN(number) && currency) {
              editedPosting.price = {
                number,
                currency,
              };
            }
          }
        }
      }

      return editedPosting;
    } catch (error) {
      console.error('编辑分录时出错:', error);
      return null;
    }
  }

  private async createNewPosting(): Promise<Posting | null> {
    try {
      const account = await UIEnhancer.showInput('账户名称');
      if (!account) return null;

      const amountStr = await UIEnhancer.showInput('金额 (格式: 数字 货币，如: 100 CNY)');
      if (!amountStr) return null;

      const amountParts = amountStr.trim().split(' ');
      if (amountParts.length < 2) {
        UIEnhancer.showError('金额格式错误，应为: 数字 货币');
        return null;
      }

      const number = parseFloat(amountParts[0] || '0');
      const currency = amountParts[1] || '';

      if (isNaN(number) || !currency) {
        UIEnhancer.showError('金额格式错误，应为: 数字 货币');
        return null;
      }

      const posting: Posting = {
        account,
        units: {
          number,
          currency,
        },
      };

      // 询问是否添加价格
      const shouldAddPrice = await UIEnhancer.showConfirmation('是否添加价格？');
      if (shouldAddPrice) {
        const priceStr = await UIEnhancer.showInput('价格 (格式: 数字 货币)');
        if (priceStr) {
          const priceParts = priceStr.trim().split(' ');
          if (priceParts.length >= 2) {
            const priceNumber = parseFloat(priceParts[0] || '0');
            const priceCurrency = priceParts[1] || '';

            if (!isNaN(priceNumber) && priceCurrency) {
              posting.price = {
                number: priceNumber,
                currency: priceCurrency,
              };
            }
          }
        }
      }

      return posting;
    } catch (error) {
      console.error('创建新分录时出错:', error);
      return null;
    }
  }

  private displayTransaction(transaction: Transaction, title: string) {
    console.log(`\n${title}:`);
    console.log(`  日期: ${format(new Date(transaction.date), 'yyyy-MM-dd')}`);
    console.log(`  收款人/付款人: ${transaction.payee || '-'}`);
    console.log(`  描述: ${transaction.narration}`);
    console.log(`  标签: ${transaction.tags.join(', ') || '-'}`);
    console.log(`  链接: ${transaction.links.join(', ') || '-'}`);
    console.log(`  分录:`);

    for (let i = 0; i < transaction.postings.length; i++) {
      const posting = transaction.postings[i];
      if (!posting) continue;

      console.log(`    ${i + 1}. ${posting.account}`);
      if (posting.units) {
        console.log(`       金额: ${posting.units.number} ${posting.units.currency}`);
      }
      if (posting.price) {
        console.log(`       价格: ${posting.price.number} ${posting.price.currency}`);
      }
    }
  }

  getHelp(): string {
    return `
编辑交易记录

用法: /edit_transaction <交易ID>

功能:
  - 修改交易日期
  - 修改收款人/付款人
  - 修改交易描述
  - 修改标签和链接
  - 编辑分录信息
  - 添加新分录

示例:
  /edit_transaction tx_001
  /edit_transaction help
    `;
  }
}
