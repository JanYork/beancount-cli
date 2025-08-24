/**
 * 帮助命令
 * 显示所有可用命令的帮助信息
 * 
 * @author JanYork
 */

import { BaseCommand } from './base-command';
import chalk from 'chalk';
import Table from 'cli-table3';
// Removed cliColumns import due to mock issues

/**
 * 帮助命令类
 */
export class HelpCommand extends BaseCommand {
  /**
   * 执行帮助命令
   */
  async execute(params: { command?: string } = {}): Promise<any> {
    try {
      if (params.command) {
        return await this.showSpecificHelp(params.command);
      } else {
        return await this.showGeneralHelp();
      }
    } catch (error: any) {
      return this.createErrorResult('显示帮助信息失败', error);
    }
  }

  /**
   * 显示通用帮助信息
   */
  private async showGeneralHelp(): Promise<any> {
    console.log(chalk.yellow.bold('\n🎯 Beancount CLI 帮助'));
    console.log(chalk.gray('功能强大的复式记账命令行工具'));
    
    // 创建帮助表格
    const helpTable = new Table({
      head: [chalk.blue.bold('命令'), chalk.blue.bold('描述'), chalk.blue.bold('用法')],
      colWidths: [20, 40, 40],
      style: {
        head: [],
        border: []
      }
    });

    // 分类显示命令
    const categories = [
      {
        name: '📊 核心功能',
        commands: [
          { name: 'add_transaction', description: '添加新的交易记录', usage: 'add_transaction [options]' },
          { name: 'list_transactions', description: '列出交易记录', usage: 'list_transactions [filters]' },
          { name: 'show_balance', description: '显示账户余额', usage: 'show_balance [account]' }
        ]
      },
      {
        name: '📋 管理功能',
        commands: [
          { name: 'list_accounts', description: '列出所有账户', usage: 'list_accounts' },
          { name: 'validate', description: '验证账本文件', usage: 'validate [type]' },
          { name: 'config', description: '管理配置', usage: 'config [action] [key] [value]' }
        ]
      }
    ];

    categories.forEach(category => {
      console.log(chalk.cyan.bold(`\n${category.name}`));
      category.commands.forEach(cmd => {
        helpTable.push([
          chalk.green(cmd.name),
          cmd.description,
          chalk.gray(cmd.usage.length > 38 ? cmd.usage.substring(0, 35) + '...' : cmd.usage)
        ]);
      });
      
      console.log(helpTable.toString());
      helpTable.length = 0; // 清空表格
    });

    // 显示快速开始
    console.log(chalk.yellow.bold('\n🚀 快速开始:'));
    const quickStart = [
      chalk.cyan('1. 查看账户列表: ') + chalk.white('list_accounts'),
      chalk.cyan('2. 查看余额: ') + chalk.white('show_balance'),
      chalk.cyan('3. 查看交易记录: ') + chalk.white('list_transactions'),
      chalk.cyan('4. 添加交易记录: ') + chalk.white('add_transaction'),
      chalk.cyan('5. 管理配置: ') + chalk.white('config')
    ];
    console.log(quickStart.join('\n'));
    
    // 显示使用提示
    console.log(chalk.yellow.bold('\n💡 使用提示:'));
    const tips = [
      chalk.gray('• 使用 help <命令名> 查看详细用法'),
      chalk.gray('• 支持命令别名，如 add、list、balance 等'),
      chalk.gray('• 输入 help <命令名> 查看特定命令帮助')
    ];
    console.log(tips.join('\n'));
    
    return this.createSuccessResult(
      '已显示帮助信息',
      {
        type: 'general_help',
        categories_count: categories.length,
        commands_count: categories.reduce((total, cat) => total + cat.commands.length, 0)
      }
    );
  }

  /**
   * 显示特定命令的帮助信息
   */
  private async showSpecificHelp(commandName: string): Promise<any> {
    try {
      const helpInfo = this.getCommandHelpInfo(commandName);
      
      if (!helpInfo) {
        return this.createErrorResult(`未找到命令 "${commandName}" 的帮助信息`);
      }

      console.log(chalk.yellow.bold(`\n📖 ${commandName} 命令帮助`));
      
      // 创建命令详情表格
      const detailTable = new Table({
        style: {
          head: [],
          border: []
        }
      });

      detailTable.push(
        [chalk.gray('命令'), chalk.green(commandName)],
        [chalk.gray('描述'), helpInfo.description],
        [chalk.gray('用法'), helpInfo.usage.length > 68 ? helpInfo.usage.substring(0, 65) + '...' : helpInfo.usage],
        [chalk.gray('类别'), helpInfo.category]
      );
      
      console.log(detailTable.toString());

      // 显示示例
      if (helpInfo.examples && helpInfo.examples.length > 0) {
        console.log(chalk.yellow.bold('\n📝 使用示例:'));
        const examples = helpInfo.examples.map((example: string, index: number) => 
          chalk.cyan(`${index + 1}. `) + chalk.white(example.length > 75 ? example.substring(0, 72) + '...' : example)
        );
        console.log(examples.join('\n'));
      }
      
      // 显示别名
      if (helpInfo.aliases && helpInfo.aliases.length > 0) {
        console.log(chalk.yellow.bold('\n🔗 命令别名:'));
        const aliases = helpInfo.aliases.map((alias: string) => chalk.gray(alias));
        console.log(aliases.join(', '));
      }
      
      return this.createSuccessResult(
        `显示命令 "${commandName}" 的帮助信息成功`,
        {
          command: commandName,
          help_info: helpInfo
        }
      );
    } catch (error: any) {
      return this.createErrorResult(`获取命令 "${commandName}" 帮助信息失败`, error);
    }
  }

  /**
   * 获取命令帮助信息
   */
  private getCommandHelpInfo(commandName: string): any {
    const helpMap: Record<string, any> = {
      'add_transaction': {
        description: '添加新的交易记录到账本',
        usage: 'add_transaction [date=YYYY-MM-DD] [narration="描述"] [amount=金额] [accounts=账户列表] [interactive=true]',
        examples: [
          'add_transaction interactive=true',
          'add_transaction date=2024-01-01 narration="午餐" amount=25 accounts=["Expenses:Food","Assets:Cash"]'
        ],
        aliases: ['add', 'new'],
        category: '基础操作'
      },
      'list_transactions': {
        description: '列出和查询交易记录',
        usage: 'list_transactions [start_date=YYYY-MM-DD] [end_date=YYYY-MM-DD] [accounts=账户] [tags=标签] [page=页码] [pageSize=每页数量] [interactive=true]',
        examples: [
          'list_transactions interactive=true',
          'list_transactions start_date=2024-01-01 end_date=2024-01-31',
          'list_transactions accounts=Expenses:Food page=1 pageSize=10'
        ],
        aliases: ['list', 'ls'],
        category: '查询统计'
      },
      'show_balance': {
        description: '显示账户余额信息',
        usage: 'show_balance [account=账户名] [date=YYYY-MM-DD] [interactive=true]',
        examples: [
          'show_balance interactive=true',
          'show_balance account=Assets:Cash',
          'show_balance date=2024-01-01'
        ],
        aliases: ['balance', 'bal'],
        category: '查询统计'
      }
    };

    return helpMap[commandName] || null;
  }

  /**
   * 获取帮助信息
   */
  getHelp(): string {
    return `
${chalk.cyan.bold('help 命令')}

${chalk.yellow('用法:')}
  help [命令名]

${chalk.yellow('描述:')}
  显示所有可用命令的帮助信息，或特定命令的详细帮助

${chalk.yellow('选项:')}
  命令名    可选，指定要查看帮助的命令名

${chalk.yellow('示例:')}
  help                    # 显示所有命令的帮助
  help add_transaction    # 显示 add_transaction 命令的详细帮助
  help list               # 显示 list_transactions 命令的帮助（支持别名）
    `;
  }
}
