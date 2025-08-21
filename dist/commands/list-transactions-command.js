"use strict";
/**
 * 列出交易记录命令
 *
 * 作者: JanYork
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTransactionsCommand = void 0;
const date_fns_1 = require("date-fns");
const base_command_1 = require("./base-command");
const chalk_1 = __importDefault(require("chalk"));
class ListTransactionsCommand extends base_command_1.BaseCommand {
    constructor(engine) {
        super();
        this.engine = engine;
    }
    /**
     * 执行列出交易记录命令
     *
     * @param params 命令参数
     * @returns 执行结果
     */
    execute(params) {
        try {
            let startDate;
            let endDate;
            // 解析日期范围
            if (params['start_date']) {
                try {
                    startDate = (0, date_fns_1.parse)(params['start_date'], 'yyyy-MM-dd', new Date());
                    if (isNaN(startDate.getTime())) {
                        return this.createErrorResult('开始日期格式错误');
                    }
                }
                catch (error) {
                    return this.createErrorResult('开始日期格式错误');
                }
            }
            if (params['end_date']) {
                try {
                    endDate = (0, date_fns_1.parse)(params['end_date'], 'yyyy-MM-dd', new Date());
                    if (isNaN(endDate.getTime())) {
                        return this.createErrorResult('结束日期格式错误');
                    }
                }
                catch (error) {
                    return this.createErrorResult('结束日期格式错误');
                }
            }
            // 获取交易记录
            const transactions = this.engine.getTransactions(startDate, endDate);
            if (transactions.length === 0) {
                return this.createSuccessResult('📝 没有找到交易记录');
            }
            // 格式化输出
            let result = `📝 找到 ${transactions.length} 条交易记录:\n\n`;
            for (let i = 0; i < transactions.length; i++) {
                const transaction = transactions[i];
                if (transaction) {
                    const dateStr = (0, date_fns_1.format)(transaction.date, 'yyyy-MM-dd');
                    result += `${chalk_1.default.cyan(`${i + 1}. ${dateStr}`)} - ${chalk_1.default.yellow(transaction.narration)}\n`;
                    if (transaction.payee) {
                        result += `   ${chalk_1.default.gray('收款人:')} ${chalk_1.default.blue(transaction.payee)}\n`;
                    }
                    for (const posting of transaction.postings) {
                        if (posting.units) {
                            const amount = posting.units.number;
                            const currency = posting.units.currency;
                            const sign = amount >= 0 ? '+' : '';
                            const color = amount >= 0 ? chalk_1.default.green : chalk_1.default.red;
                            result += `   ${chalk_1.default.cyan(posting.account)}: ${color(`${sign}${amount} ${currency}`)}\n`;
                        }
                    }
                    if (transaction.tags.length > 0) {
                        result += `   ${chalk_1.default.gray('标签:')} ${chalk_1.default.magenta(transaction.tags.join(', '))}\n`;
                    }
                    result += '\n';
                }
            }
            return this.createSuccessResult(result, transactions);
        }
        catch (error) {
            return this.createErrorResult(`列出交易记录失败: ${error}`);
        }
    }
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp() {
        return `
📋 列出交易记录
用法: /list_transactions [start_date=2024-01-01] [end_date=2024-01-31]

参数:
- start_date: 开始日期 (YYYY-MM-DD, 可选)
- end_date: 结束日期 (YYYY-MM-DD, 可选)

示例:
/list_transactions
/list_transactions start_date=2024-01-01
/list_transactions start_date=2024-01-01 end_date=2024-01-31
    `;
    }
}
exports.ListTransactionsCommand = ListTransactionsCommand;
//# sourceMappingURL=list-transactions-command.js.map