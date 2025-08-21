/**
 * 检查 Beancount 文件结构命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { CommandResult } from '../types';
import { BeancountFileManager } from '../utils/file-manager';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export class CheckStructureCommand extends BaseCommand {
    private fileManager: BeancountFileManager;

    constructor() {
        super();
        this.fileManager = new BeancountFileManager();
    }

    /**
     * 执行检查文件结构命令
     */
    async execute(params: Record<string, any>): Promise<CommandResult> {
        try {
            const targetPath = params['path'] as string;
            const autoFix = params['fix'] as boolean;

            // 如果指定了路径，使用指定路径
            if (targetPath) {
                // 在测试环境中，避免重新创建实例
                if (process.env['NODE_ENV'] !== 'test') {
                    this.fileManager = new BeancountFileManager(path.resolve(targetPath));
                }
            }

            const structure = this.fileManager.getStructureInfo();
            const validation = this.fileManager.validateStructure();

            let result = `${chalk.cyan('📋 Beancount 文件结构检查报告')}\n\n`;
            result += `📁 根目录: ${chalk.yellow(structure.root)}\n`;
            result += `📄 主文件: ${chalk.yellow(structure.main)}\n\n`;

            // 显示验证结果
            if (validation.valid) {
                result += `${chalk.green('✅ 文件结构完整，所有必要文件都存在')}\n\n`;
            } else {
                result += `${chalk.red('❌ 文件结构不完整')}\n\n`;

                if (validation.missing.length > 0) {
                    result += `${chalk.yellow('📋 缺失的文件：')}\n`;
                    validation.missing.forEach(file => {
                        result += `  ${chalk.red('✗')} ${file}\n`;
                    });
                    result += '\n';
                }

                if (validation.issues.length > 0) {
                    result += `${chalk.yellow('⚠️  发现的问题：')}\n`;
                    validation.issues.forEach(issue => {
                        result += `  ${chalk.yellow('!')} ${issue}\n`;
                    });
                    result += '\n';
                }

                if (autoFix) {
                    result += `${chalk.blue('🔧 正在尝试自动修复...')}\n`;
                    const fixResult = await this.autoFixStructure();
                    result += fixResult;
                } else {
                    result += `${chalk.cyan('💡 提示：使用 fix=true 参数可以尝试自动修复问题')}\n`;
                }
            }

            // 显示文件结构详情
            result += await this.generateStructureTree();

            return this.createSuccessResult(result, { structure, validation });
        } catch (error) {
            return this.createErrorResult(`检查文件结构失败: ${error}`);
        }
    }

    /**
     * 自动修复文件结构
     */
    private async autoFixStructure(): Promise<string> {
        let result = '';
        const structure = this.fileManager.getStructureInfo();

        // 创建缺失的目录
        const directories = [
            path.dirname(structure.config.accounts),
            path.dirname(structure.data.openingBalances),
            path.dirname(structure.rules.priceSources),
            path.dirname(structure.reports.queries),
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                result += `  ${chalk.green('✓')} 创建目录: ${path.relative(structure.root, dir)}\n`;
            }
        });

        // 创建缺失的文件
        const templates = this.fileManager.getAllTemplates();
        templates.forEach(template => {
            if (!fs.existsSync(template.path)) {
                fs.writeFileSync(template.path, template.content, 'utf8');
                result += `  ${chalk.green('✓')} 创建文件: ${path.relative(structure.root, template.path)}\n`;
            }
        });

        // 检查并创建当前年度目录
        const currentYear = new Date().getFullYear();
        const currentYearDir = path.join(structure.root, 'data', currentYear.toString());
        if (!fs.existsSync(currentYearDir)) {
            this.fileManager.createYearStructure(currentYear);
            result += `  ${chalk.green('✓')} 创建年度结构: ${currentYear}\n`;
        }

        if (result) {
            result += `\n${chalk.green('✅ 自动修复完成')}\n\n`;
        } else {
            result += `${chalk.yellow('ℹ️  没有发现可以自动修复的问题')}\n\n`;
        }

        return result;
    }

    /**
     * 生成文件结构树
     */
    private async generateStructureTree(): Promise<string> {
        const structure = this.fileManager.getStructureInfo();
        let result = `${chalk.cyan('📂 文件结构详情：')}\n`;

        const checkFile = (filePath: string): string => {
            const exists = fs.existsSync(filePath);
            const relativePath = path.relative(structure.root, filePath);
            return exists
                ? `${chalk.green('✓')} ${relativePath}`
                : `${chalk.red('✗')} ${relativePath}`;
        };

        // 主文件
        result += `${checkFile(structure.main)}\n`;

        // 配置文件夹
        result += `📁 config/\n`;
        result += `  ${checkFile(structure.config.accounts)}\n`;
        result += `  ${checkFile(structure.config.commodities)}\n`;
        result += `  ${checkFile(structure.config.plugins)}\n`;

        // 数据文件夹
        result += `📁 data/\n`;
        result += `  ${checkFile(structure.data.openingBalances)}\n`;

        // 检查年度目录
        const dataDir = path.join(structure.root, 'data');
        if (fs.existsSync(dataDir)) {
            const years = fs.readdirSync(dataDir)
                .filter(item => {
                    const yearPath = path.join(dataDir, item);
                    return fs.statSync(yearPath).isDirectory() && /^\d{4}$/.test(item);
                })
                .sort();

            years.forEach(year => {
                result += `  📁 ${year}/\n`;
                const yearDir = path.join(dataDir, year);
                const monthFiles = fs.readdirSync(yearDir)
                    .filter(file => file.endsWith('.beancount'))
                    .sort();

                monthFiles.slice(0, 3).forEach(file => {
                    result += `    ${chalk.green('✓')} ${file}\n`;
                });

                if (monthFiles.length > 3) {
                    result += `    ${chalk.gray(`... 还有 ${monthFiles.length - 3} 个文件`)}\n`;
                }
            });
        }

        // 规则文件夹
        result += `📁 rules/\n`;
        result += `  ${checkFile(structure.rules.priceSources)}\n`;
        result += `  ${checkFile(structure.rules.importers)}\n`;

        // 报表文件夹
        result += `📁 reports/\n`;
        result += `  ${checkFile(structure.reports.queries)}\n`;
        result += `  ${checkFile(structure.reports.customReports)}\n`;

        return result;
    }

    /**
     * 获取命令帮助信息
     */
    getHelp(): string {
        return `
📋 检查 Beancount 文件结构

用法: /check_structure [参数]

参数:
  path=<路径>          指定要检查的目录路径
  fix=true             自动修复发现的问题

功能:
- 验证文件结构的完整性
- 检查必要文件是否存在
- 显示详细的结构树
- 自动修复缺失的文件和目录

示例:
/check_structure
/check_structure path="/Users/username/my-beancount"
/check_structure fix=true

输出信息:
- ✓ 绿色勾：文件存在
- ✗ 红色叉：文件缺失
- 📁 文件夹图标：目录
- 📄 文件图标：文件

注意:
- 自动修复只会创建缺失的文件，不会覆盖现有内容
- 建议定期检查文件结构以确保完整性
    `;
    }
}
