/**
 * 初始化 Beancount 文件结构命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { CommandResult } from '../types';
import { BeancountFileManager } from '../utils/file-manager';
import { ConfigManager } from '../utils/config-manager';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as path from 'path';

export class InitStructureCommand extends BaseCommand {
  private fileManager: BeancountFileManager;
  private configManager: ConfigManager;

  constructor() {
    super();
    this.configManager = ConfigManager.getInstance();
    this.fileManager = new BeancountFileManager();
  }

  /**
   * 执行初始化文件结构命令
   */
  async execute(params: Record<string, any>): Promise<CommandResult> {
    try {
      const targetPath = params['path'] as string;
      const force = params['force'] as boolean;
      const year = params['year'] ? parseInt(params['year'] as string) : new Date().getFullYear();

      // 如果指定了路径，使用指定路径
      if (targetPath) {
        this.fileManager = new BeancountFileManager(path.resolve(targetPath));
      }

      const structure = this.fileManager.getStructureInfo();

      // 检查目录是否已存在
      if (!force) {
        const validation = this.fileManager.validateStructure();
        if (validation.valid || validation.missing.length < 5) {
          const { confirmOverwrite } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmOverwrite',
              message: '目标目录似乎已经包含 Beancount 文件，是否继续？',
              default: false,
            },
          ]);

          if (!confirmOverwrite) {
            return this.createErrorResult('操作已取消');
          }
        }
      }

      // 初始化文件结构
      this.fileManager.initializeFullStructure(year);

      // 更新配置文件中的默认路径
      this.configManager.set('data.default_file', structure.main);
      this.configManager.set('data.default_file_dir', structure.root);
      this.configManager.saveConfig();

      let result = `${chalk.green('✅ Beancount 多文件结构初始化完成！')}\n\n`;
      result += `📁 根目录: ${chalk.yellow(structure.root)}\n`;
      result += `📄 主文件: ${chalk.yellow(structure.main)}\n\n`;
      result += `${chalk.cyan('📋 创建的文件结构：')}\n`;
      result += `├── main.beancount              ${chalk.gray('# 主文件')}\n`;
      result += `├── config/\n`;
      result += `│   ├── accounts.beancount      ${chalk.gray('# 账户定义')}\n`;
      result += `│   ├── commodities.beancount   ${chalk.gray('# 货币定义')}\n`;
      result += `│   └── plugins.beancount       ${chalk.gray('# 插件配置')}\n`;
      result += `├── data/\n`;
      result += `│   ├── ${year}/                ${chalk.gray('# 年度数据')}\n`;
      result += `│   │   ├── 01-january.beancount\n`;
      result += `│   │   ├── 02-february.beancount\n`;
      result += `│   │   └── ...                 ${chalk.gray('# 其他月份')}\n`;
      result += `│   └── opening-balances.beancount\n`;
      result += `├── rules/\n`;
      result += `│   ├── price-sources.beancount\n`;
      result += `│   └── importers.beancount\n`;
      result += `└── reports/\n`;
      result += `    ├── queries.bql\n`;
      result += `    └── custom-reports.beancount\n\n`;
      result += `${chalk.green('🎉 现在您可以开始使用多文件结构来管理您的财务数据了！')}\n`;
      result += `${chalk.yellow('💡 提示：使用主文件 main.beancount 作为入口点')}\n`;

      return this.createSuccessResult(result, { structure });
    } catch (error) {
      return this.createErrorResult(`初始化文件结构失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   */
  getHelp(): string {
    return `
📁 初始化 Beancount 多文件结构

用法: /init_structure [参数]

参数:
  path=<路径>          目标目录路径（默认使用配置中的路径）
  year=<年份>          初始化的年份（默认当前年份）
  force=true           强制覆盖已存在的文件

功能:
- 创建标准的 Beancount 多文件目录结构
- 生成各种类型的文件模板
- 按年份和月份组织交易数据
- 设置合理的默认账户和配置

示例:
/init_structure
/init_structure path="/Users/username/my-beancount"
/init_structure year=2023 force=true

注意:
- 建议在空目录中初始化新结构
- 会自动更新 CLI 配置以使用新的文件路径
- 多文件结构便于版本控制和团队协作
    `;
  }
}
