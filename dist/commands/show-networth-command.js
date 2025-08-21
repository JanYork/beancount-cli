"use strict";
/**
 * 显示净资产命令
 *
 * 作者: JanYork
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowNetworthCommand = void 0;
const date_fns_1 = require("date-fns");
const base_command_1 = require("./base-command");
const chalk_1 = __importDefault(require("chalk"));
class ShowNetworthCommand extends base_command_1.BaseCommand {
    constructor(engine) {
        super();
        this.engine = engine;
    }
    /**
     * 执行显示净资产命令
     *
     * @param params 命令参数
     * @returns 执行结果
     */
    execute(params) {
        try {
            const dateStr = params['date'];
            let balanceDate;
            if (dateStr) {
                try {
                    balanceDate = (0, date_fns_1.parse)(dateStr, 'yyyy-MM-dd', new Date());
                    if (isNaN(balanceDate.getTime())) {
                        return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
                    }
                }
                catch (error) {
                    return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
                }
            }
            // 获取净资产信息
            const networth = this.engine.getNetWorth(balanceDate);
            if (!networth) {
                return this.createSuccessResult('💰 无法计算净资产信息');
            }
            // 格式化输出
            const totalAssets = networth['assets'] || 0;
            const totalLiabilities = networth['liabilities'] || 0;
            const netWorth = networth['netWorth'] || 0;
            let result = `💰 净资产报告\n\n`;
            result += `${chalk_1.default.green.bold('📈 资产:')} ${chalk_1.default.green(`+${totalAssets.toFixed(2)} CNY`)}\n`;
            result += `${chalk_1.default.red.bold('💳 负债:')} ${chalk_1.default.red(`-${totalLiabilities.toFixed(2)} CNY`)}\n`;
            result += `${chalk_1.default.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`;
            const netWorthColor = netWorth >= 0 ? chalk_1.default.green : chalk_1.default.red;
            const netWorthSign = netWorth >= 0 ? '+' : '';
            result += `${chalk_1.default.blue.bold('🏦 净资产:')} ${netWorthColor(`${netWorthSign}${netWorth.toFixed(2)} CNY`)}\n`;
            if (dateStr) {
                result += `\n${chalk_1.default.gray(`📅 报告日期: ${dateStr}`)}`;
            }
            return this.createSuccessResult(result, networth);
        }
        catch (error) {
            return this.createErrorResult(`显示净资产失败: ${error}`);
        }
    }
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp() {
        return `
💰 显示净资产
用法: /show_networth [date=2024-01-01]

参数:
- date: 查询日期 (YYYY-MM-DD, 可选)

功能: 显示指定日期的净资产情况，包括总资产、总负债和净资产

示例:
/show_networth
/show_networth date=2024-01-01
    `;
    }
}
exports.ShowNetworthCommand = ShowNetworthCommand;
//# sourceMappingURL=show-networth-command.js.map