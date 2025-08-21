/**
 * 显示净资产命令
 *
 * 作者: JanYork
 */
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
export declare class ShowNetworthCommand extends BaseCommand {
    private engine;
    constructor(engine: BeancountEngine);
    /**
     * 执行显示净资产命令
     *
     * @param params 命令参数
     * @returns 执行结果
     */
    execute(params: Record<string, any>): import('../types').CommandResult;
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp(): string;
}
//# sourceMappingURL=show-networth-command.d.ts.map