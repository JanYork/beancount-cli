"use strict";
/**
 * 添加交易记录命令
 *
 * 作者: JanYork
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTransactionCommand = void 0;
const date_fns_1 = require("date-fns");
const base_command_1 = require("./base-command");
const chalk_1 = __importDefault(require("chalk"));
class AddTransactionCommand extends base_command_1.BaseCommand {
    constructor(engine) {
        super();
        this.engine = engine;
    }
    /**
     * 执行添加交易记录命令
     *
     * @param params 命令参数
     * @returns 执行结果
     */
    execute(params) {
        try {
            // 验证参数
            const validation = this.validateParams(params);
            if (!validation.valid) {
                return this.createErrorResult(`参数验证失败: ${validation.errors.join(', ')}`);
            }
            const dateStr = params['date'];
            const narration = params['narration'];
            const payee = params['payee'];
            const postingsData = params['postings'];
            // 解析日期
            let transactionDate;
            try {
                transactionDate = (0, date_fns_1.parse)(dateStr, 'yyyy-MM-dd', new Date());
                if (isNaN(transactionDate.getTime())) {
                    return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
                }
            }
            catch (error) {
                return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
            }
            // 创建分录
            const postings = [];
            for (const postingData of postingsData) {
                const account = postingData.account;
                const amount = postingData.amount;
                const currency = postingData.currency || 'CNY';
                if (!account || amount === undefined) {
                    continue;
                }
                const posting = {
                    account,
                    units: {
                        number: amount,
                        currency
                    }
                };
                postings.push(posting);
            }
            if (postings.length === 0) {
                return this.createErrorResult('至少需要一个分录');
            }
            // 创建交易记录
            const transaction = {
                date: transactionDate,
                payee,
                narration,
                postings,
                tags: [],
                links: [],
                meta: {}
            };
            // 添加到引擎
            this.engine.addTransaction(transaction);
            // 格式化成功消息
            const formattedDate = (0, date_fns_1.format)(transactionDate, 'yyyy-MM-dd');
            const totalAmount = postings.reduce((sum, p) => sum + (p.units?.number || 0), 0);
            const sign = totalAmount >= 0 ? '+' : '';
            const color = totalAmount >= 0 ? chalk_1.default.green : chalk_1.default.red;
            const result = `✅ 成功添加交易记录!\n\n` +
                `📅 日期: ${chalk_1.default.cyan(formattedDate)}\n` +
                `📝 描述: ${chalk_1.default.yellow(narration)}\n` +
                `💰 总金额: ${color(`${sign}${totalAmount} CNY`)}\n` +
                `📊 分录数量: ${chalk_1.default.blue(postings.length)}`;
            return this.createSuccessResult(result, transaction);
        }
        catch (error) {
            return this.createErrorResult(`添加交易记录失败: ${error}`);
        }
    }
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp() {
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
    validateParams(params) {
        const errors = [];
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
}
exports.AddTransactionCommand = AddTransactionCommand;
//# sourceMappingURL=add-transaction-command.js.map