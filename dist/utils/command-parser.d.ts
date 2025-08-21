/**
 * 命令解析器
 *
 * 作者: JanYork
 */
import { ParsedCommand } from '../types';
/**
 * 命令解析器类
 */
export declare class CommandParser {
    /**
     * 解析命令字符串
     *
     * @param input 用户输入的命令字符串
     * @returns 解析后的命令对象
     */
    static parseCommand(input: string): ParsedCommand;
    /**
     * 解析参数字符串
     *
     * @param paramsText 参数字符串
     * @returns 参数字典
     */
    private static parseParameters;
    /**
     * 解析单个值
     *
     * @param value 值字符串
     * @returns 解析后的值
     */
    private static parseValue;
    /**
     * 解析简单的列表格式
     *
     * @param listText 列表文本
     * @returns 解析后的列表
     */
    private static parseSimpleList;
    /**
     * 检查字符串是否为数字
     *
     * @param str 要检查的字符串
     * @returns 是否为数字
     */
    private static isNumeric;
    /**
     * 验证命令名称是否有效
     *
     * @param commandName 命令名称
     * @returns 是否有效
     */
    static validateCommand(commandName: string): boolean;
    /**
     * 获取命令帮助信息
     *
     * @param commandName 命令名称
     * @returns 帮助信息
     */
    static getCommandHelp(commandName: string): string | null;
    /**
     * 获取所有可用命令的帮助信息
     *
     * @returns 所有命令的帮助信息
     */
    static getAllCommandHelp(): string;
}
//# sourceMappingURL=command-parser.d.ts.map