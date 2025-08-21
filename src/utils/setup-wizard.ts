/**
 * 设置向导工具
 *
 * 作者: JanYork
 */

import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { format } from 'date-fns';
import { ConfigManager } from './config-manager';

export interface SetupOptions {
  createDefaultFile: boolean;
  createDataStructure: boolean;
  createSampleAccounts: boolean;
  createSampleTransactions: boolean;
  defaultCurrency: string;
  dataDirectory: string;
}

/**
 * 创建初始设置
 */
export async function createInitialSetup(filePath: string, configManager: ConfigManager): Promise<boolean> {
  console.log(chalk.blue.bold('🎯 Beancount CLI 初始化向导'));
  console.log(chalk.cyan('    让我们来设置你的记账环境'));
  console.log();

  try {
    // 显示当前配置信息
    console.log(chalk.magenta('📋 当前配置:'));
    console.log(chalk.gray(`   默认文件: ${filePath}`));
    console.log(chalk.gray(`   默认货币: ${configManager.get('currency.default')}`));
    console.log(chalk.gray(`   数据目录: ${configManager.get('data.data_dir')}`));
    console.log();

    // 询问用户是否要创建默认文件
    const { shouldCreate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldCreate',
        message: '是否要创建默认的 Beancount 文件？',
        default: true,
      },
    ]);

    if (!shouldCreate) {
      return false;
    }

    // 获取设置选项
    const options = await getSetupOptions(configManager);

    // 创建目录结构
    if (options.createDataStructure) {
      await createDirectoryStructure(options.dataDirectory);
    }

    // 创建默认文件
    if (options.createDefaultFile) {
      await createDefaultBeancountFile(filePath, options);
    }

    // 更新配置
    updateConfig(configManager, options);

    console.log(chalk.green('✅ 初始化完成！'));
    console.log(chalk.cyan(`📁 文件已创建: ${filePath}`));
    console.log();

    return true;
  } catch (error) {
    console.error(chalk.red('❌ 初始化失败:'), error);
    return false;
  }
}

/**
 * 获取设置选项
 */
async function getSetupOptions(configManager: ConfigManager): Promise<SetupOptions> {
  const questions = [
    {
      type: 'confirm',
      name: 'createDataStructure',
      message: '是否创建完整的目录结构？',
      default: true,
    },
    {
      type: 'confirm',
      name: 'createSampleAccounts',
      message: '是否创建示例账户？',
      default: true,
    },
    {
      type: 'confirm',
      name: 'createSampleTransactions',
      message: '是否创建示例交易记录？',
      default: true,
    },
    {
      type: 'list',
      name: 'defaultCurrency',
      message: '选择默认货币:',
      choices: configManager.get('currency.supported'),
      default: configManager.get('currency.default'),
    },
    {
      type: 'input',
      name: 'dataDirectory',
      message: '数据目录路径:',
      default: configManager.get('data.data_dir'),
    },
  ];

  const answers = await inquirer.prompt(questions);

  return {
    createDefaultFile: true,
    createDataStructure: answers.createDataStructure,
    createSampleAccounts: answers.createSampleAccounts,
    createSampleTransactions: answers.createSampleTransactions,
    defaultCurrency: answers.defaultCurrency,
    dataDirectory: answers.dataDirectory,
  };
}

/**
 * 创建目录结构
 */
async function createDirectoryStructure(dataDir: string): Promise<void> {
  const directories = [
    dataDir,
    path.join(dataDir, 'backups'),
    path.join(dataDir, 'exports'),
    path.join(dataDir, 'logs'),
    path.join(dataDir, 'plugins'),
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(chalk.green(`📁 创建目录: ${dir}`));
    }
  }
}

/**
 * 创建默认的 Beancount 文件
 */
async function createDefaultBeancountFile(filePath: string, options: SetupOptions): Promise<void> {
  const content = generateDefaultBeancountContent(options);

  // 确保目录存在
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(chalk.green(`📄 创建文件: ${filePath}`));
}

/**
 * 生成默认的 Beancount 内容
 */
function generateDefaultBeancountContent(options: SetupOptions): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  const currency = options.defaultCurrency;

  let content = `# Beancount 记账文件
# 创建时间: ${today}
# 默认货币: ${currency}

`;

  // 添加账户定义
  if (options.createSampleAccounts) {
    content += `# 账户定义
${today} open Assets:Cash ${currency}
${today} open Assets:Bank ${currency}
${today} open Assets:Investment ${currency}

${today} open Liabilities:Credit ${currency}

${today} open Income:Salary ${currency}
${today} open Income:Investment ${currency}
${today} open Income:Other ${currency}

${today} open Expenses:Food ${currency}
${today} open Expenses:Transport ${currency}
${today} open Expenses:Shopping ${currency}
${today} open Expenses:Entertainment ${currency}
${today} open Expenses:Utilities ${currency}

${today} open Equity:Opening-Balances ${currency}

`;
  }

  // 添加示例交易
  if (options.createSampleTransactions) {
    content += `# 示例交易记录

${today} * "工资" "收到月薪"
  Assets:Bank 5000 ${currency}
  Income:Salary -5000 ${currency}

${today} * "午餐" "在餐厅吃午餐"
  Expenses:Food 25 ${currency}
  Assets:Cash -25 ${currency}

${today} * "购物" "购买日用品"
  Expenses:Shopping 100 ${currency}
  Assets:Cash -100 ${currency}

`;
  }

  // 添加初始余额
  content += `# 初始余额
${today} balance Assets:Cash 0 ${currency}
${today} balance Assets:Bank 0 ${currency}

`;

  return content;
}

/**
 * 更新配置
 */
function updateConfig(configManager: ConfigManager, options: SetupOptions): void {
  configManager.set('currency.default', options.defaultCurrency);
  configManager.set('data.data_dir', options.dataDirectory);
  configManager.saveConfig();

  console.log(chalk.green('⚙️  配置已更新'));
}

// Mock chalk for testing compatibility
const chalk = {
  blue: { bold: (text: string) => text },
  cyan: (text: string) => text,
  magenta: (text: string) => text,
  yellow: (text: string) => text,
  green: (text: string) => text,
  gray: (text: string) => text,
  red: (text: string) => text,
};
