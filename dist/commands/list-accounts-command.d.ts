/**
 * 列出所有账户命令
 *
 * 作者: JanYork
 */
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
export declare class ListAccountsCommand extends BaseCommand {
    private engine;
    constructor(engine: BeancountEngine);
    /**
     * 执行列出账户命令
     *
     * @param _params 命令参数
     * @returns 执行结果
     */
    execute(_params: Record<string, any>): import('../types').CommandResult;
    /**
     * 获取账户类型
     *
     * @param accountName 账户名称
     * @returns 账户类型
     */
    private getAccountType;
    /**
     * 获取命令帮助信息
     *
     * @returns 帮助信息
     */
    getHelp(): string;
}
//# sourceMappingURL=list-accounts-command.d.ts.map