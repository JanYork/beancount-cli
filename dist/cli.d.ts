/**
 * Beancount CLI 主命令行界面
 *
 * 作者: JanYork
 */
export declare class CommandParser {
    static parseCommand(input: string): {
        command: string;
        params: Record<string, any>;
    };
    /**
     * 设置嵌套值
     */
    private static setNestedValue;
    static validateCommand(command: string): boolean;
    static getCommandHelp(commandName: string): string | null;
}
export declare class BeancountCLI {
    private engine;
    private running;
    constructor(filePath: string);
    /**
     * 运行CLI主循环
     */
    run(): Promise<void>;
    /**
     * 打印欢迎横幅
     */
    private printBanner;
    /**
     * 打印状态信息
     */
    private printStatus;
    /**
     * 显示命令提示
     */
    private showPrompt;
    /**
     * 处理命令
     *
     * @param input 用户输入
     */
    private processCommand;
    /**
     * 显示命令执行结果
     *
     * @param result 执行结果
     */
    private displayResult;
    /**
     * 处理错误
     *
     * @param error 错误信息
     */
    private handleError;
}
//# sourceMappingURL=cli.d.ts.map