/**
 * 添加交易记录命令
 *
 * 作者: JanYork
 */
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
export declare class AddTransactionCommand extends BaseCommand {
    private engine;
    constructor(engine: BeancountEngine);
    /**
     * 执行添加交易记录命令
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
    /**
     * 验证参数
     *
     * @param params 参数
     * @returns 验证结果
     */
    protected validateParams(params: Record<string, any>): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=add-transaction-command.d.ts.map