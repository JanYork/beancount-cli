/**
 * 配置管理命令
 *
 * 作者: JanYork
 */
import { BaseCommand } from './base-command';
export declare class ConfigCommand extends BaseCommand {
    private configManager;
    constructor();
    /**
     * 执行配置命令
     *
     * @param params 命令参数
     * @returns 执行结果
     */
    execute(params: Record<string, any>): import('../types').CommandResult;
    /**
     * 显示配置
     */
    private showConfig;
    /**
     * 设置配置
     */
    private setConfig;
    /**
     * 获取配置
     */
    private getConfig;
    /**
     * 重新加载配置
     */
    private reloadConfig;
    /**
     * 验证配置
     */
    private validateConfig;
    /**
     * 显示配置文件路径
     */
    private showConfigPath;
    /**
     * 格式化配置显示
     */
    private formatConfig;
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp(): string;
}
//# sourceMappingURL=config-command.d.ts.map