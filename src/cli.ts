/**
 * Beancount CLI 主命令行界面
 * 重构后的版本，使用分层架构和依赖注入
 * 支持一次性命令和交互模式
 *
 * @author JanYork
 */

import { Command } from 'commander';
import { CLIController } from './presentation/cli/cli-controller';
import { CommandExecutor } from './presentation/cli/command-executor';
import { BeancountEngine } from './engine/beancount-engine';
import { t } from './utils/i18n';

/**
 * BeancountCLI类
 * 主CLI类，负责初始化和启动CLI应用
 */
export class BeancountCLI {
  private readonly controller: CLIController;
  private readonly executor: CommandExecutor;

  constructor(filePath: string) {
    const engine = new BeancountEngine(filePath);
    
    // 初始化命令工厂
    const { CommandFactory } = require('./commands/command-factory');
    CommandFactory.setEngine(engine);
    
    this.executor = new CommandExecutor(engine);
    this.controller = new CLIController(this.executor);
  }

  /**
   * 运行交互式CLI应用
   */
  async runInteractive(): Promise<void> {
    await this.controller.run();
  }

  /**
   * 执行一次性命令
   */
  async executeCommand(commandName: string, params: Record<string, any> = {}): Promise<any> {
    const result = await this.executor.execute(commandName, params);
    return result;
  }

  /**
   * 获取文件统计信息
   */
  getFileStats(): any {
    return this.executor.getFileStats();
  }
}

/**
 * 主函数
 * 程序入口点
 */
async function main(): Promise<void> {
  const program = new Command();

  program
    .name('beancount-cli')
    .description('智能记账助手 - 让记账变得简单')
    .version('1.0.0')
    .argument('[file]', '记账文件位置（可选，会自动使用默认位置）')
    .option('-c, --command <command>', '执行单个功能')
    .option('-p, --params <params>', '功能参数（JSON格式）')
    .option('-i, --interactive', '启动交互模式（默认）')
    .option('--stats', '查看记账文件状态')
    .option('--help-command <cmd>', '查看特定功能说明')
    .action(async (file?: string, options?: any) => {
      try {
        // 初始化配置和文件
        const { ConfigManager } = await import('./utils/config-manager');
        const configManager = ConfigManager.getInstance();

        let filePath = file;

        // 如果没有提供文件路径，使用配置文件中的默认路径
        if (!filePath) {
          filePath = configManager.expandPath(configManager.get('data.default_file'));
          console.log(`${t('startup.using.default.path')} ${filePath}`);
        }

        // 检查文件是否存在，如果不存在则引导用户创建
        const fs = await import('fs');
        if (!fs.existsSync(filePath)) {
          console.log(`${t('startup.file.not.exists')} ${filePath}`);

          const { createInitialSetup } = await import('./utils/setup-wizard');
          const shouldCreate = await createInitialSetup(filePath, configManager);

          if (!shouldCreate) {
            console.log(t('startup.goodbye'));
            process.exit(0);
          }
        }

        const cli = new BeancountCLI(filePath);

        // 根据选项决定运行模式
        if (options.helpCommand) {
          // 显示功能说明
          const { CLIRenderer } = await import('./presentation/cli/cli-renderer');
          const helpInfo = getCommandHelpInfo(options.helpCommand);
          CLIRenderer.showCommandHelp(
            options.helpCommand,
            helpInfo.description,
            helpInfo.usage,
            helpInfo.examples
          );
          process.exit(0);
        }

        if (options.stats) {
          // 显示记账文件状态
          const { CLIRenderer } = await import('./presentation/cli/cli-renderer');
          const stats = cli.getFileStats();
          CLIRenderer.showFileStatus(stats);
          process.exit(0);
        }

        if (options.command) {
          // 执行单个功能
          let params = {};
          if (options.params) {
            try {
              params = JSON.parse(options.params);
            } catch (error) {
              console.error('❌ 参数格式有问题，请检查输入格式');
              process.exit(1);
            }
          }

          const result = await cli.executeCommand(options.command, params);
          
          if (result.success) {
            console.log('✅ 功能执行成功');
            if (result.data) {
              console.log(result.data);
            }
          } else {
            console.error(`❌ 功能执行遇到问题: ${result.message}`);
            process.exit(1);
          }
          process.exit(0);
        }

        // 默认启动交互模式
        await cli.runInteractive();
      } catch (error) {
        console.error(t('startup.failed'), error);
        process.exit(1);
      }
    });

  program.parse();
}

/**
 * 获取命令帮助信息
 */
function getCommandHelpInfo(commandName: string): { description: string; usage: string; examples: string[] } {
  const helpMap: Record<string, { description: string; usage: string; examples: string[] }> = {
    'help': {
      description: '显示帮助信息',
      usage: 'help [command]',
      examples: ['help', 'help add_transaction', 'help list_transactions']
    },
    'add_transaction': {
      description: '添加交易记录',
      usage: 'add_transaction',
      examples: ['add_transaction', 'add_transaction date=2024-01-01 amount=100 currency=CNY']
    },
    'list_transactions': {
      description: '列出交易记录',
      usage: 'list_transactions [options]',
      examples: ['list_transactions', 'list_transactions limit=10', 'list_transactions account=现金']
    },
    'show_balance': {
      description: '显示账户余额',
      usage: 'show_balance [account]',
      examples: ['show_balance', 'show_balance 现金', 'show_balance 银行卡']
    },
    'list_accounts': {
      description: '列出所有账户',
      usage: 'list_accounts',
      examples: ['list_accounts']
    },
    'validate': {
      description: '验证文件格式',
      usage: 'validate',
      examples: ['validate']
    },
    'export': {
      description: '导出数据',
      usage: 'export [format]',
      examples: ['export', 'export csv', 'export json']
    },
    'search': {
      description: '搜索交易记录',
      usage: 'search <query>',
      examples: ['search 午餐', 'search amount>100', 'search date=2024-01-01']
    },
    'show_networth': {
      description: '显示净资产',
      usage: 'show_networth [date]',
      examples: ['show_networth', 'show_networth date=2024-01-01']
    },
    'config': {
      description: '配置管理',
      usage: 'config [action] [key] [value]',
      examples: ['config', 'config theme dark', 'config language en-US']
    }
  };

  return helpMap[commandName] || {
    description: '未知命令',
    usage: 'unknown',
    examples: []
  };
}

if (require.main === module) {
  main();
}
