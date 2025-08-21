/**
 * 验证beancount文件命令
 *
 * 作者: JanYork
 */
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
export declare class ValidateCommand extends BaseCommand {
    private engine;
    constructor(engine: BeancountEngine);
    /**
     * 执行验证命令
     *
     * @param _params 命令参数
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
//# sourceMappingURL=validate-command.d.ts.map