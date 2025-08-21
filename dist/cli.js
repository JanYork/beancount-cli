"use strict";
/**
 * Beancount CLI 主命令行界面
 *
 * 作者: JanYork
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeancountCLI = exports.CommandParser = void 0;
const commander_1 = require("commander");
// Mock chalk for testing compatibility
const chalk = {
    blue: { bold: (text) => text },
    cyan: (text) => text,
    magenta: { bold: (text) => text },
    yellow: (text) => text,
    green: (text) => text,
    gray: (text) => text,
    red: (text) => text
};
const inquirer_1 = __importDefault(require("inquirer"));
const beancount_engine_1 = require("./engine/beancount-engine");
const command_factory_1 = require("./commands/command-factory");
// 完整的CommandParser实现
class CommandParser {
    static parseCommand(input) {
        const [command, ...paramParts] = input.trim().split(' ');
        const parsedCommand = command?.startsWith('/') ? command.slice(1) : command || '';
        // 解析参数
        const params = {};
        for (const part of paramParts) {
            if (part.includes('=')) {
                const [key, value] = part.split('=', 2);
                if (key && value !== undefined) {
                    // 处理嵌套键，如 currency.default
                    this.setNestedValue(params, key, value);
                }
            }
            else if (part) {
                // 如果没有等号，作为位置参数
                if (!params['args']) {
                    params['args'] = [];
                }
                params['args'].push(part);
            }
        }
        return {
            command: parsedCommand,
            params
        };
    }
    /**
     * 设置嵌套值
     */
    static setNestedValue(obj, key, value) {
        const keys = key.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (k && (!(k in current) || typeof current[k] !== 'object')) {
                current[k] = {};
            }
            if (k) {
                current = current[k];
            }
        }
        const lastKey = keys[keys.length - 1];
        if (lastKey) {
            // 尝试解析值类型
            if (value === 'true' || value === 'false') {
                current[lastKey] = value === 'true';
            }
            else if (!isNaN(Number(value))) {
                current[lastKey] = Number(value);
            }
            else {
                current[lastKey] = value;
            }
        }
    }
    static validateCommand(command) {
        const validCommands = [
            'help', 'add', 'list', 'balance', 'quit', 'reload',
            'add_transaction', 'list_transactions', 'show_balance', 'show_networth', 'list_accounts', 'validate', 'config'
        ];
        return validCommands.includes(command);
    }
    static getCommandHelp(commandName) {
        const helpMap = {
            'help': '显示帮助信息。用法: /help [命令名]',
            'add': '添加交易记录。用法: /add 账户 金额 [描述]',
            'list': '列出交易记录。用法: /list [账户] [数量]',
            'balance': '显示账户余额。用法: /balance [账户]',
            'quit': '退出程序',
            'reload': '重新加载文件'
        };
        return helpMap[commandName] || null;
    }
}
exports.CommandParser = CommandParser;
class BeancountCLI {
    constructor(filePath) {
        this.running = true;
        this.engine = new beancount_engine_1.BeancountEngine(filePath);
    }
    /**
     * 运行CLI主循环
     */
    async run() {
        this.printBanner();
        this.printStatus();
        while (this.running) {
            try {
                await this.showPrompt();
            }
            catch (error) {
                if (error instanceof Error && error.message === 'SIGINT') {
                    console.log('\n⚠️  检测到中断信号，输入 /quit 退出程序');
                    continue;
                }
                this.handleError(`发生未预期的错误: ${error}`);
            }
        }
    }
    /**
     * 打印欢迎横幅
     */
    printBanner() {
        console.log();
        console.log(chalk.blue.bold('🤖  Beancount CLI'));
        console.log(chalk.cyan('    智能记账命令行工具'));
        console.log();
    }
    /**
     * 打印状态信息
     */
    printStatus() {
        try {
            const stats = this.engine.getFileStats();
            console.log(chalk.magenta.bold('📊 文件状态:'));
            console.log(chalk.cyan(`   账户数量: ${stats['totalAccounts']}`));
            console.log(chalk.cyan(`   交易记录: ${stats['totalTransactions']}`));
            console.log(chalk.cyan(`   余额记录: ${stats['totalBalances']}`));
            console.log(chalk.cyan(`   错误数量: ${stats['totalErrors']}`));
            console.log(chalk.cyan(`   文件路径: ${stats['filePath']}`));
            console.log();
        }
        catch (error) {
            console.log(chalk.yellow('⚠️  无法获取状态信息'));
            console.log();
        }
    }
    /**
     * 显示命令提示
     */
    async showPrompt() {
        const { userInput } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'userInput',
                message: chalk.green('💡 输入命令 (输入 /help 查看帮助):'),
                default: ''
            }
        ]);
        if (!userInput.trim()) {
            return;
        }
        await this.processCommand(userInput);
    }
    /**
     * 处理命令
     *
     * @param input 用户输入
     */
    async processCommand(input) {
        try {
            // 解析命令
            const parsedCommand = CommandParser.parseCommand(input);
            // 验证命令
            if (!CommandParser.validateCommand(parsedCommand.command)) {
                this.handleError(`无效的命令: ${parsedCommand.command}`);
                return;
            }
            // 处理特殊命令
            if (parsedCommand.command === 'quit') {
                this.running = false;
                console.log(chalk.green('👋 再见！'));
                return;
            }
            if (parsedCommand.command === 'help') {
                if (parsedCommand.params['args'] && parsedCommand.params['args'].length > 0) {
                    const helpText = CommandParser.getCommandHelp(parsedCommand.params['args'][0]);
                    if (helpText) {
                        console.log(chalk.cyan(helpText));
                    }
                    else {
                        this.handleError(`未知命令: ${parsedCommand.params['args'][0]}`);
                    }
                }
                else {
                    // 显示通用帮助
                    const helpCommand = command_factory_1.CommandFactory.createCommand('help', this.engine);
                    if (helpCommand) {
                        const result = helpCommand.execute(parsedCommand.params);
                        this.displayResult(result);
                    }
                }
                return;
            }
            if (parsedCommand.command === 'reload') {
                this.engine.reload();
                console.log(chalk.yellow('🔄 文件重新加载成功'));
                this.printStatus();
                return;
            }
            // 创建并执行命令
            const command = command_factory_1.CommandFactory.createCommand(parsedCommand.command, this.engine);
            if (command) {
                const result = command.execute(parsedCommand.params);
                this.displayResult(result);
            }
            else {
                this.handleError(`未知命令: ${parsedCommand.command}`);
            }
        }
        catch (error) {
            this.handleError(`命令解析失败: ${error}`);
        }
    }
    /**
     * 显示命令执行结果
     *
     * @param result 执行结果
     */
    displayResult(result) {
        if (result.success) {
            console.log(chalk.green('✅ 执行成功:'));
            console.log(result.message);
            if (result.data) {
                console.log(chalk.gray('数据:'), result.data);
            }
        }
        else {
            console.log(chalk.red('❌ 执行失败:'));
            console.log(result.message);
            if (result.data) {
                console.log(chalk.gray('错误详情:'), result.data);
            }
        }
        console.log();
    }
    /**
     * 处理错误
     *
     * @param error 错误信息
     */
    handleError(error) {
        console.log(chalk.red('❌ 错误:'), error);
        console.log();
    }
}
exports.BeancountCLI = BeancountCLI;
/**
 * 主函数
 */
function main() {
    const program = new commander_1.Command();
    program
        .name('beancount-cli')
        .description('Beancount CLI - 智能记账命令行工具')
        .version('1.0.0')
        .argument('<file>', 'Beancount文件路径')
        .action(async (file) => {
        try {
            const cli = new BeancountCLI(file);
            await cli.run();
        }
        catch (error) {
            console.error(chalk.red('❌ 启动失败:'), error);
            process.exit(1);
        }
    });
    program.parse();
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=cli.js.map