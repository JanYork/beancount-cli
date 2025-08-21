/**
 * 帮助命令
 *
 * 作者: JanYork
 */
import { BaseCommand } from './base-command';
export declare class HelpCommand extends BaseCommand {
    /**
     * 执行帮助命令
     *
     * @param params 命令参数
     * @returns 执行结果
     */
    execute(_params: Record<string, any>): import('../types').CommandResult;
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp(): string;
}
//# sourceMappingURL=help-command.d.ts.map