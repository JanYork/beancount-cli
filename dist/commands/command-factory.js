"use strict";
/**
 * 命令工厂
 *
 * 作者: JanYork
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandFactory = void 0;
const add_transaction_command_1 = require("./add-transaction-command");
const list_transactions_command_1 = require("./list-transactions-command");
const show_balance_command_1 = require("./show-balance-command");
const show_networth_command_1 = require("./show-networth-command");
const list_accounts_command_1 = require("./list-accounts-command");
const validate_command_1 = require("./validate-command");
const config_command_1 = require("./config-command");
const help_command_1 = require("./help-command");
class CommandFactory {
    /**
     * 创建命令实例
     *
     * @param commandName 命令名称
     * @param engine Beancount引擎实例
     * @returns 命令实例或null
     */
    static createCommand(commandName, engine) {
        const commands = {
            'add_transaction': add_transaction_command_1.AddTransactionCommand,
            'list_transactions': list_transactions_command_1.ListTransactionsCommand,
            'show_balance': show_balance_command_1.ShowBalanceCommand,
            'show_networth': show_networth_command_1.ShowNetworthCommand,
            'list_accounts': list_accounts_command_1.ListAccountsCommand,
            'validate': validate_command_1.ValidateCommand,
            'config': config_command_1.ConfigCommand,
            'help': help_command_1.HelpCommand
        };
        const CommandClass = commands[commandName];
        if (CommandClass) {
            return new CommandClass(engine);
        }
        return null;
    }
    /**
     * 获取所有可用命令名称
     *
     * @returns 命令名称数组
     */
    static getAvailableCommands() {
        return [
            'add_transaction',
            'list_transactions',
            'show_balance',
            'show_networth',
            'list_accounts',
            'validate',
            'config',
            'help'
        ];
    }
    /**
     * 检查命令是否存在
     *
     * @param commandName 命令名称
     * @returns 是否存在
     */
    static isCommandAvailable(commandName) {
        return this.getAvailableCommands().includes(commandName);
    }
}
exports.CommandFactory = CommandFactory;
//# sourceMappingURL=command-factory.js.map