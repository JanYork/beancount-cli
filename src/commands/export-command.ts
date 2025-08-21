/**
 * 导出命令
 * 支持多种格式的数据导出
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { CommandResult, ExportOptions } from '../types';
import { ExportUtil } from '../utils/export-util';
import { UIEnhancer } from '../utils/ui-enhancer';
import { BeancountEngine } from '../engine/beancount-engine';
import { SearchPaginationUtil } from '../utils/search-pagination';

export class ExportCommand extends BaseCommand {
    constructor(engine: BeancountEngine) {
        super(engine);
    }

    async execute(params: Record<string, any>): Promise<CommandResult> {
        try {
            const format = params['format'] || params['args']?.[0];

            if (!format) {
                return {
                    success: false,
                    message: '请指定导出格式，使用 /export help 查看支持的格式',
                };
            }

            if (format === 'help') {
                return {
                    success: true,
                    message: this.getHelp(),
                };
            }

            // 确保导出目录存在
            ExportUtil.ensureExportDirectory();

            // 获取要导出的数据
            const transactions = await this.getTransactionsToExport(params);

            if (transactions.length === 0) {
                return {
                    success: false,
                    message: '没有找到要导出的交易记录',
                };
            }

            // 构建导出选项
            const exportOptions: ExportOptions = {
                format: format as any,
                outputPath: params['outputPath'],
                dateRange: params['startDate'] && params['endDate'] ? {
                    start: new Date(params['startDate']),
                    end: new Date(params['endDate']),
                } : undefined,
                accounts: params['accounts'] ? (Array.isArray(params['accounts']) ? params['accounts'] : [params['accounts']]) : undefined,
                tags: params['tags'] ? (Array.isArray(params['tags']) ? params['tags'] : [params['tags']]) : undefined,
            } as ExportOptions;

            // 显示导出进度
            const spinner = UIEnhancer.showSpinner(`正在导出 ${transactions.length} 条交易记录...`);

            try {
                // 执行导出
                const outputPath = await ExportUtil.exportTransactions(transactions, exportOptions);

                UIEnhancer.stopSpinner(spinner);
                UIEnhancer.showSuccess(`导出成功！文件保存至: ${outputPath}`);

                // 显示导出摘要
                this.displayExportSummary(transactions, exportOptions, outputPath);

                return {
                    success: true,
                    message: `成功导出 ${transactions.length} 条交易记录到 ${outputPath}`,
                    data: {
                        outputPath,
                        transactionCount: transactions.length,
                        format,
                        options: exportOptions,
                    },
                };
            } catch (error) {
                UIEnhancer.stopSpinner(spinner);
                throw error;
            }
        } catch (error) {
            return {
                success: false,
                message: `导出失败: ${error}`,
            };
        }
    }

    private async getTransactionsToExport(params: Record<string, any>) {
        const allTransactions = this.engine?.getTransactions() || [];

        // 如果没有指定过滤条件，导出所有交易
        if (!params['startDate'] && !params['endDate'] && !params['accounts'] && !params['tags'] && !params['query']) {
            return allTransactions;
        }

        // 构建搜索选项
        const searchOptions = SearchPaginationUtil.parseSearchOptions(params);

        // 执行搜索过滤
        return SearchPaginationUtil.searchTransactions(allTransactions, searchOptions);
    }

    private displayExportSummary(transactions: any[], options: ExportOptions, outputPath: string) {
        console.log('\n📊 导出摘要:');
        console.log(`   导出格式: ${options.format.toUpperCase()}`);
        console.log(`   交易数量: ${transactions.length} 条`);
        console.log(`   输出路径: ${outputPath}`);

        if (options.dateRange) {
            console.log(`   日期范围: ${options.dateRange.start.toLocaleDateString()} 至 ${options.dateRange.end.toLocaleDateString()}`);
        }

        if (options.accounts?.length) {
            console.log(`   账户过滤: ${options.accounts.join(', ')}`);
        }

        if (options.tags?.length) {
            console.log(`   标签过滤: ${options.tags.join(', ')}`);
        }

        // 计算总金额
        let totalAmount = 0;
        const currencies = new Set<string>();

        for (const tx of transactions) {
            for (const posting of tx.postings) {
                if (posting.units) {
                    totalAmount += Math.abs(posting.units.number);
                    currencies.add(posting.units.currency);
                }
            }
        }

        const currency = currencies.size === 1 ? Array.from(currencies)[0] : 'MIXED';
        console.log(`   总金额: ${UIEnhancer.formatAmount(totalAmount, currency)}`);

        // 显示文件大小信息
        const fs = require('fs');
        if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            const fileSize = (stats.size / 1024).toFixed(2);
            console.log(`   文件大小: ${fileSize} KB`);
        }
    }

    getHelp(): string {
        return `
导出交易数据

用法: /export <格式> [选项]

支持的导出格式:
  csv         CSV格式 (Excel兼容)
  excel       Excel格式 (.xlsx)
  json        JSON格式
  beancount   Beancount格式

选项:
  outputPath=<输出路径>    指定输出文件路径
  startDate=<开始日期>      开始日期 (YYYY-MM-DD)
  endDate=<结束日期>        结束日期 (YYYY-MM-DD)
  accounts=<账户列表>       账户过滤，多个账户用逗号分隔
  tags=<标签列表>          标签过滤，多个标签用逗号分隔
  query=<关键词>           关键词搜索

示例:
  /export csv
  /export excel outputPath=./my_transactions.xlsx
  /export json startDate=2024-01-01 endDate=2024-12-31
  /export beancount accounts=Assets:Bank,Expenses:Food
  /export csv tags=travel,food query=购物
    `;
    }
}
