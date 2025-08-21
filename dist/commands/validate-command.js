"use strict";
/**
 * 验证beancount文件命令
 *
 * 作者: JanYork
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCommand = void 0;
const base_command_1 = require("./base-command");
const chalk_1 = __importDefault(require("chalk"));
class ValidateCommand extends base_command_1.BaseCommand {
    constructor(engine) {
        super();
        this.engine = engine;
    }
    /**
     * 执行验证命令
     *
     * @param _params 命令参数
     * @returns 执行结果
     */
    execute(_params) {
        try {
            // 获取文件状态来检查错误
            const stats = this.engine.getFileStats();
            const errorCount = stats['totalErrors'] || 0;
            if (errorCount === 0) {
                const result = `✅ ${chalk_1.default.green.bold('文件验证通过!')}\n\n` +
                    `📊 验证结果:\n` +
                    `  ${chalk_1.default.green('•')} 语法正确\n` +
                    `  ${chalk_1.default.green('•')} 账户平衡\n` +
                    `  ${chalk_1.default.green('•')} 格式规范`;
                return this.createSuccessResult(result, { valid: true, errors: [] });
            }
            else {
                let result = `❌ ${chalk_1.default.red.bold('文件验证失败!')}\n\n` +
                    `📊 发现 ${errorCount} 个错误\n\n` +
                    `💡 建议: 请检查文件中的错误并修复后重新验证`;
                return this.createErrorResult(result, { valid: false, errors: [`发现 ${errorCount} 个错误`] });
            }
        }
        catch (error) {
            return this.createErrorResult(`验证文件失败: ${error}`);
        }
    }
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp() {
        return `
🔍 验证beancount文件
用法: /validate

功能: 验证当前beancount文件的语法正确性、账户平衡性和格式规范性

验证内容:
- 语法检查
- 账户平衡验证
- 格式规范检查
- 错误报告

示例:
/validate
    `;
    }
}
exports.ValidateCommand = ValidateCommand;
//# sourceMappingURL=validate-command.js.map