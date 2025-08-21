"use strict";
/**
 * 配置管理命令
 *
 * 作者: JanYork
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigCommand = void 0;
const base_command_1 = require("./base-command");
const config_manager_1 = require("../utils/config-manager");
const chalk_1 = __importDefault(require("chalk"));
class ConfigCommand extends base_command_1.BaseCommand {
    constructor() {
        super();
        this.configManager = config_manager_1.ConfigManager.getInstance();
    }
    /**
     * 执行配置命令
     *
     * @param params 命令参数
     * @returns 执行结果
     */
    execute(params) {
        try {
            const action = params['action'] || 'show';
            const key = params['key'];
            const value = params['value'];
            switch (action) {
                case 'show':
                    return this.showConfig(key);
                case 'set':
                    return this.setConfig(key, value);
                case 'get':
                    return this.getConfig(key);
                case 'reload':
                    return this.reloadConfig();
                case 'validate':
                    return this.validateConfig();
                case 'path':
                    return this.showConfigPath();
                default:
                    return this.createErrorResult(`无效的操作: ${action}`);
            }
        }
        catch (error) {
            return this.createErrorResult(`配置操作失败: ${error}`);
        }
    }
    /**
     * 显示配置
     */
    showConfig(key) {
        if (key) {
            const value = this.configManager.get(key);
            if (value !== undefined) {
                const result = `📋 配置项: ${chalk_1.default.cyan(key)}\n` +
                    `值: ${chalk_1.default.yellow(JSON.stringify(value, null, 2))}`;
                return this.createSuccessResult(result, { key, value });
            }
            else {
                return this.createErrorResult(`配置项不存在: ${key}`);
            }
        }
        else {
            // 显示所有配置
            const config = this.configManager.getConfig();
            const result = this.formatConfig(config);
            return this.createSuccessResult(result, config);
        }
    }
    /**
     * 设置配置
     */
    setConfig(key, value) {
        if (!key) {
            return this.createErrorResult('缺少配置项名称');
        }
        if (value === undefined) {
            return this.createErrorResult('缺少配置值');
        }
        // 尝试解析值
        let parsedValue = value;
        if (typeof value === 'string') {
            // 尝试解析为数字
            if (!isNaN(Number(value))) {
                parsedValue = Number(value);
            }
            else if (value === 'true' || value === 'false') {
                parsedValue = value === 'true';
            }
        }
        this.configManager.set(key, parsedValue);
        this.configManager.saveConfig();
        const result = `✅ 配置已更新\n` +
            `项: ${chalk_1.default.cyan(key)}\n` +
            `值: ${chalk_1.default.yellow(JSON.stringify(parsedValue))}`;
        return this.createSuccessResult(result, { key, value: parsedValue });
    }
    /**
     * 获取配置
     */
    getConfig(key) {
        if (!key) {
            return this.createErrorResult('缺少配置项名称');
        }
        const value = this.configManager.get(key);
        if (value === undefined) {
            return this.createErrorResult(`配置项不存在: ${key}`);
        }
        const result = `📋 配置项: ${chalk_1.default.cyan(key)}\n` +
            `值: ${chalk_1.default.yellow(JSON.stringify(value, null, 2))}`;
        return this.createSuccessResult(result, { key, value });
    }
    /**
     * 重新加载配置
     */
    reloadConfig() {
        this.configManager.reloadConfig();
        const result = `🔄 配置已重新加载\n` +
            `配置文件: ${chalk_1.default.cyan(this.configManager.getConfigPath())}`;
        return this.createSuccessResult(result);
    }
    /**
     * 验证配置
     */
    validateConfig() {
        const validation = this.configManager.validateConfig();
        if (validation.valid) {
            const result = `✅ 配置验证通过\n` +
                `配置文件: ${chalk_1.default.cyan(this.configManager.getConfigPath())}`;
            return this.createSuccessResult(result, validation);
        }
        else {
            let result = `❌ 配置验证失败\n\n` +
                `发现 ${validation.errors.length} 个错误:\n`;
            for (const error of validation.errors) {
                result += `  ${chalk_1.default.red('•')} ${error}\n`;
            }
            return this.createErrorResult(result, validation);
        }
    }
    /**
     * 显示配置文件路径
     */
    showConfigPath() {
        const configPath = this.configManager.getConfigPath();
        const result = `📁 配置文件路径:\n` +
            `${chalk_1.default.cyan(configPath)}`;
        return this.createSuccessResult(result, { configPath });
    }
    /**
     * 格式化配置显示
     */
    formatConfig(config, indent = 0) {
        const spaces = '  '.repeat(indent);
        let result = '';
        for (const [key, value] of Object.entries(config)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result += `${spaces}${chalk_1.default.cyan(key)}:\n`;
                result += this.formatConfig(value, indent + 1);
            }
            else if (Array.isArray(value)) {
                result += `${spaces}${chalk_1.default.cyan(key)}:\n`;
                for (const item of value) {
                    result += `${spaces}  ${chalk_1.default.green('•')} ${chalk_1.default.yellow(item)}\n`;
                }
            }
            else {
                const displayValue = typeof value === 'string' ? `"${value}"` : value;
                result += `${spaces}${chalk_1.default.cyan(key)}: ${chalk_1.default.yellow(displayValue)}\n`;
            }
        }
        return result;
    }
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp() {
        return `
⚙️  配置管理
用法: /config [action="操作"] [key="配置项"] [value="配置值"]

操作:
- show: 显示配置 (默认)
- get: 获取特定配置项
- set: 设置配置项
- reload: 重新加载配置
- validate: 验证配置
- path: 显示配置文件路径

参数:
- action: 操作类型 (可选)
- key: 配置项名称 (可选)
- value: 配置值 (可选)

示例:
/config
/config action="show"
/config action="get" key="currency.default"
/config action="set" key="currency.default" value="USD"
/config action="reload"
/config action="validate"
/config action="path"
    `;
    }
}
exports.ConfigCommand = ConfigCommand;
//# sourceMappingURL=config-command.js.map