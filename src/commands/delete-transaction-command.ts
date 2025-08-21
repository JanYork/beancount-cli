/**
 * 删除交易命令
 * 支持删除指定的交易记录
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { CommandResult, Transaction } from '../types';
import { UIEnhancer } from '../utils/ui-enhancer';
import { BeancountEngine } from '../engine/beancount-engine';
import { format } from 'date-fns';

export class DeleteTransactionCommand extends BaseCommand {
    constructor(engine: BeancountEngine) {
        super(engine);
    }

    async execute(params: Record<string, any>): Promise<CommandResult> {
        try {
            const transactionId = params['id'] || params['args']?.[0];

            if (!transactionId) {
                return {
                    success: false,
                    message: '请指定要删除的交易ID，使用 /delete_transaction help 查看帮助',
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

            // 查找要删除的交易
            const transactionIndex = transactions.findIndex((tx: any) => tx.id === transactionId);

            if (transactionIndex === -1) {
                return {
                    success: false,
                    message: `未找到ID为 ${transactionId} 的交易记录`,
                };
            }

            const transactionToDelete = transactions[transactionIndex];

            // 显示要删除的交易信息
            if (transactionToDelete) {
                this.displayTransaction(transactionToDelete, '要删除的交易信息');
            }

            // 确认删除
            const shouldDelete = await UIEnhancer.showConfirmation('确定要删除此交易吗？此操作不可撤销！');
            if (!shouldDelete) {
                return {
                    success: true,
                    message: '取消删除操作',
                };
            }

            // 二次确认
            const finalConfirm = await UIEnhancer.showConfirmation('最后确认：真的要删除这条交易记录吗？');
            if (!finalConfirm) {
                return {
                    success: true,
                    message: '取消删除操作',
                };
            }

            // 删除交易
            const deletedTransaction = transactions.splice(transactionIndex, 1)[0];

            // 保存到文件
            await this.engine?.saveTransactions(transactions);

            UIEnhancer.showSuccess('交易删除成功！');

            return {
                success: true,
                message: `成功删除交易 ${transactionId}`,
                data: {
                    deletedTransaction,
                    remainingTransactions: transactions.length,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: `删除交易失败: ${error}`,
            };
        }
    }

    private displayTransaction(transaction: Transaction, title: string) {
        console.log(`\n${title}:`);
        console.log(`  ID: ${transaction.id}`);
        console.log(`  日期: ${format(new Date(transaction.date), 'yyyy-MM-dd')}`);
        console.log(`  收款人/付款人: ${transaction.payee || '-'}`);
        console.log(`  描述: ${transaction.narration}`);
        console.log(`  标签: ${transaction.tags.join(', ') || '-'}`);
        console.log(`  链接: ${transaction.links.join(', ') || '-'}`);
        console.log(`  分录:`);

        for (let i = 0; i < transaction.postings.length; i++) {
            const posting = transaction.postings[i];
            if (posting) {
                console.log(`    ${i + 1}. ${posting.account}`);
                if (posting.units) {
                    console.log(`       金额: ${posting.units.number} ${posting.units.currency}`);
                }
                if (posting.price) {
                    console.log(`       价格: ${posting.price.number} ${posting.price.currency}`);
                }
            }
        }
    }

    getHelp(): string {
        return `
删除交易记录

用法: /delete_transaction <交易ID>

功能:
  - 删除指定的交易记录
  - 显示要删除的交易详细信息
  - 提供二次确认机制
  - 删除后自动保存文件

注意事项:
  - 删除操作不可撤销
  - 建议在删除前先备份数据
  - 删除后会影响相关的余额计算

示例:
  /delete_transaction tx_001
  /delete_transaction help
    `;
    }
}
