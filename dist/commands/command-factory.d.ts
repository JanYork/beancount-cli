/**
 * 命令工厂
 *
 * 作者: JanYork
 */
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
export declare class CommandFactory {
    /**
     * 创建命令实例
     *
     * @param commandName 命令名称
     * @param engine Beancount引擎实例
     * @returns 命令实例或null
     */
    static createCommand(commandName: string, engine: BeancountEngine): BaseCommand | null;
    /**
     * 获取所有可用命令名称
     *
     * @returns 命令名称数组
     */
    static getAvailableCommands(): string[];
    /**
     * 检查命令是否存在
     *
     * @param commandName 命令名称
     * @returns 是否存在
     */
    static isCommandAvailable(commandName: string): boolean;
}
//# sourceMappingURL=command-factory.d.ts.map