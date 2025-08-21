"use strict";
/**
 * 显示余额命令
 *
 * 作者: JanYork
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowBalanceCommand = void 0;
const date_fns_1 = require("date-fns");
const base_command_1 = require("./base-command");
const chalk_1 = __importDefault(require("chalk"));
class ShowBalanceCommand extends base_command_1.BaseCommand {
    constructor(engine) {
        super();
        this.engine = engine;
    }
    /**
     * 执行显示余额命令
     *
     * @param params 命令参数
     * @returns 执行结果
     */
    execute(params) {
        try {
            const account = params['account'];
            const dateStr = params['date'];
            let balanceDate;
            if (dateStr) {
                try {
                    balanceDate = (0, date_fns_1.parse)(dateStr, 'yyyy-MM-dd', new Date());
                    if (isNaN(balanceDate.getTime())) {
                        return this.createErrorResult('日期格式错误');
                    }
                }
                catch (error) {
                    return this.createErrorResult('日期格式错误');
                }
            }
            // 获取余额
            const balances = this.engine.getBalances(account, balanceDate);
            if (balances.length === 0) {
                return this.createSuccessResult('💰 没有找到余额信息');
            }
            // 格式化输出
            let result = `💰 账户余额信息:\n\n`;
            for (const balance of balances) {
                const amount = balance.amount.number;
                const currency = balance.amount.currency;
                const sign = amount >= 0 ? '+' : '';
                const color = amount >= 0 ? chalk_1.default.green : chalk_1.default.red;
                result += `📊 ${chalk_1.default.cyan(balance.account)}: ${color(`${sign}${amount} ${currency}`)}\n`;
            }
            return this.createSuccessResult(result, balances);
        }
        catch (error) {
            return this.createErrorResult(`显示余额失败: ${error}`);
        }
    }
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp() {
        return `
💰 显示账户余额
用法: /show_balance [account="Assets:Cash"] [date=2024-01-01]

参数:
- account: 账户名称 (可选)
- date: 查询日期 (YYYY-MM-DD, 可选)

示例:
/show_balance
/show_balance account="Assets:Cash"
/show_balance date=2024-01-01
/show_balance account="Assets:Cash" date=2024-01-01
    `;
    }
}
exports.ShowBalanceCommand = ShowBalanceCommand;
//# sourceMappingURL=show-balance-command.js.map