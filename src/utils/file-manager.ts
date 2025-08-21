/**
 * Beancount 文件管理器
 *
 * 负责管理 Beancount 多文件结构：
 * - 创建标准目录结构
 * - 生成文件模板
 * - 自动发现和包含文件
 * - 文件组织和维护
 *
 * 作者: JanYork
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from './config-manager';

export interface FileStructure {
    root: string;
    main: string;
    config: {
        accounts: string;
        commodities: string;
        plugins: string;
    };
    data: {
        openingBalances: string;
        yearly: Record<string, string[]>; // year -> month files
    };
    rules: {
        priceSources: string;
        importers: string;
    };
    reports: {
        queries: string;
        customReports: string;
    };
}

export interface FileTemplate {
    path: string;
    content: string;
    description: string;
}

export class BeancountFileManager {
    private configManager: ConfigManager;
    private structure: FileStructure;

    constructor(rootPath?: string) {
        this.configManager = ConfigManager.getInstance();
        this.structure = this.initializeStructure(rootPath);
    }

    /**
     * 初始化文件结构
     */
    private initializeStructure(rootPath?: string): FileStructure {
        const root = rootPath || this.configManager.get('data.default_file_dir') || process.cwd();

        return {
            root,
            main: path.join(root, 'main.beancount'),
            config: {
                accounts: path.join(root, 'config', 'accounts.beancount'),
                commodities: path.join(root, 'config', 'commodities.beancount'),
                plugins: path.join(root, 'config', 'plugins.beancount'),
            },
            data: {
                openingBalances: path.join(root, 'data', 'opening-balances.beancount'),
                yearly: {},
            },
            rules: {
                priceSources: path.join(root, 'rules', 'price-sources.beancount'),
                importers: path.join(root, 'rules', 'importers.beancount'),
            },
            reports: {
                queries: path.join(root, 'reports', 'queries.bql'),
                customReports: path.join(root, 'reports', 'custom-reports.beancount'),
            },
        };
    }

    /**
     * 创建标准目录结构
     */
    createDirectoryStructure(): void {
        const directories = [
            path.dirname(this.structure.main),
            path.dirname(this.structure.config.accounts),
            path.dirname(this.structure.data.openingBalances),
            path.dirname(this.structure.rules.priceSources),
            path.dirname(this.structure.reports.queries),
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 创建目录: ${dir}`);
            }
        });
    }

    /**
     * 生成主文件模板
     */
    generateMainFileTemplate(): string {
        const currentYear = new Date().getFullYear();
        const defaultCurrency = this.configManager.get('currency.default') || 'CNY';

        return `;; Beancount 主文件
;; 生成时间: ${new Date().toISOString().split('T')[0]}
;;
;; 这是您的 Beancount 账目文件的入口点
;; 所有其他文件都通过 include 指令包含在这里

;; 全局选项配置
option "title" "个人财务账目"
option "operating_currency" "${defaultCurrency}"
option "conversion_currency" "${defaultCurrency}"

;; 包含配置文件
include "config/accounts.beancount"
include "config/commodities.beancount"
include "config/plugins.beancount"

;; 包含期初余额
include "data/opening-balances.beancount"

;; 包含当年数据文件
${this.generateYearlyIncludes(currentYear)}

;; 包含规则文件
include "rules/price-sources.beancount"
include "rules/importers.beancount"

;; 包含报表文件
include "reports/custom-reports.beancount"
`;
    }

    /**
     * 生成年度包含文件列表
     */
    private generateYearlyIncludes(year: number): string {
        const includes: string[] = [];

        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const monthName = this.getMonthName(month);
            includes.push(`include "data/${year}/${monthStr}-${monthName}.beancount"`);
        }

        return includes.join('\n');
    }

    /**
     * 获取月份英文名称
     */
    private getMonthName(month: number): string {
        const months = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        return months[month - 1] || 'january';
    }

    /**
     * 生成账户文件模板
     */
    generateAccountsTemplate(): string {
        return `;; 账户定义文件
;; 生成时间: ${new Date().toISOString().split('T')[0]}

;; 资产账户
1900-01-01 open Assets:Current:Checking         CNY  ; 银行储蓄账户
1900-01-01 open Assets:Current:Cash             CNY  ; 现金
1900-01-01 open Assets:Investment:Stocks        CNY  ; 股票投资
1900-01-01 open Assets:Investment:Funds         CNY  ; 基金投资

;; 负债账户
1900-01-01 open Liabilities:CreditCard         CNY  ; 信用卡
1900-01-01 open Liabilities:Loan               CNY  ; 贷款

;; 权益账户
1900-01-01 open Equity:Opening-Balances        CNY  ; 期初余额

;; 收入账户
1900-01-01 open Income:Salary                  CNY  ; 工资收入
1900-01-01 open Income:Bonus                   CNY  ; 奖金收入
1900-01-01 open Income:Investment              CNY  ; 投资收益

;; 支出账户
1900-01-01 open Expenses:Food:Dining           CNY  ; 餐饮
1900-01-01 open Expenses:Food:Groceries        CNY  ; 买菜
1900-01-01 open Expenses:Transportation        CNY  ; 交通
1900-01-01 open Expenses:Housing:Rent          CNY  ; 房租
1900-01-01 open Expenses:Housing:Utilities     CNY  ; 水电费
1900-01-01 open Expenses:Entertainment         CNY  ; 娱乐
1900-01-01 open Expenses:Healthcare            CNY  ; 医疗
1900-01-01 open Expenses:Education             CNY  ; 教育
1900-01-01 open Expenses:Shopping              CNY  ; 购物
`;
    }

    /**
     * 生成商品文件模板
     */
    generateCommoditiesTemplate(): string {
        return `;; 商品和货币定义文件
;; 生成时间: ${new Date().toISOString().split('T')[0]}

;; 货币定义
1900-01-01 commodity CNY
  name: "人民币"
  asset-class: "currency"

1900-01-01 commodity USD
  name: "美元"
  asset-class: "currency"

1900-01-01 commodity EUR
  name: "欧元"
  asset-class: "currency"

;; 股票示例（可根据实际持有股票添加）
;1900-01-01 commodity AAPL
;  name: "Apple Inc."
;  asset-class: "stock"

;; 基金示例
;1900-01-01 commodity SP500
;  name: "标普500指数基金"
;  asset-class: "fund"
`;
    }

    /**
     * 生成插件配置模板
     */
    generatePluginsTemplate(): string {
        return `;; 插件配置文件
;; 生成时间: ${new Date().toISOString().split('T')[0]}

;; 常用插件配置

;; 自动补全账户
plugin "beancount.plugins.auto_accounts"

;; 检查账户关闭状态
plugin "beancount.plugins.check_closing"

;; 一致性检查
plugin "beancount.plugins.coherency_check"

;; 重复交易检查
;plugin "beancount.plugins.check_dups"

;; 自动插入商品定义
;plugin "beancount.plugins.auto_commodities"
`;
    }

    /**
     * 生成期初余额模板
     */
    generateOpeningBalancesTemplate(): string {
        const today = new Date().toISOString().split('T')[0];

        return `;; 期初余额文件
;; 生成时间: ${new Date().toISOString().split('T')[0]}
;;
;; 在这里设置您开始记账时的初始余额

${today} * "期初余额"
  Assets:Current:Checking           0.00 CNY
  Assets:Current:Cash              0.00 CNY
  Equity:Opening-Balances
`;
    }

    /**
     * 生成月度文件模板
     */
    generateMonthlyTemplate(year: number, month: number): string {
        const monthStr = month.toString().padStart(2, '0');

        return `;; ${year}年${monthStr}月交易记录
;; 生成时间: ${new Date().toISOString().split('T')[0]}

;; 示例交易（请删除并添加您的实际交易）
;${year}-${monthStr}-01 * "示例交易"
;  Assets:Current:Cash              -100.00 CNY
;  Expenses:Food:Dining              100.00 CNY
`;
    }

    /**
     * 创建年度目录和月度文件
     */
    createYearStructure(year: number): void {
        const yearDir = path.join(this.structure.root, 'data', year.toString());

        if (!fs.existsSync(yearDir)) {
            fs.mkdirSync(yearDir, { recursive: true });
            console.log(`📁 创建年度目录: ${yearDir}`);
        }

        // 创建12个月的文件
        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const monthName = this.getMonthName(month);
            const monthFile = path.join(yearDir, `${monthStr}-${monthName}.beancount`);

            if (!fs.existsSync(monthFile)) {
                fs.writeFileSync(monthFile, this.generateMonthlyTemplate(year, month), 'utf8');
                console.log(`📄 创建月度文件: ${monthFile}`);
            }
        }

        // 更新结构中的年度文件信息
        const yearStr = year.toString();
        this.structure.data.yearly[yearStr] = [];
        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const monthName = this.getMonthName(month);
            this.structure.data.yearly[yearStr].push(`${monthStr}-${monthName}.beancount`);
        }
    }

    /**
     * 获取所有文件模板
     */
    getAllTemplates(): FileTemplate[] {
        return [
            {
                path: this.structure.main,
                content: this.generateMainFileTemplate(),
                description: '主文件，包含所有其他文件'
            },
            {
                path: this.structure.config.accounts,
                content: this.generateAccountsTemplate(),
                description: '账户定义文件'
            },
            {
                path: this.structure.config.commodities,
                content: this.generateCommoditiesTemplate(),
                description: '商品和货币定义文件'
            },
            {
                path: this.structure.config.plugins,
                content: this.generatePluginsTemplate(),
                description: '插件配置文件'
            },
            {
                path: this.structure.data.openingBalances,
                content: this.generateOpeningBalancesTemplate(),
                description: '期初余额文件'
            },
        ];
    }

    /**
     * 初始化完整的文件结构
     */
    initializeFullStructure(year?: number): void {
        const currentYear = year || new Date().getFullYear();

        console.log('🚀 初始化 Beancount 多文件结构...');

        // 创建目录结构
        this.createDirectoryStructure();

        // 创建文件模板
        const templates = this.getAllTemplates();
        templates.forEach(template => {
            if (!fs.existsSync(template.path)) {
                // 确保目录存在
                const dir = path.dirname(template.path);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                fs.writeFileSync(template.path, template.content, 'utf8');
                console.log(`📄 创建文件: ${template.path} - ${template.description}`);
            }
        });

        // 创建年度结构
        this.createYearStructure(currentYear);

        // 创建规则文件
        this.createRulesFiles();

        // 创建报表文件
        this.createReportsFiles();

        console.log('✅ Beancount 多文件结构初始化完成！');
        console.log(`📁 根目录: ${this.structure.root}`);
        console.log(`📄 主文件: ${this.structure.main}`);
    }

    /**
     * 创建规则文件
     */
    private createRulesFiles(): void {
        const priceSourcesContent = `;; 价格数据源配置
;; 生成时间: ${new Date().toISOString().split('T')[0]}

;; 示例价格源配置
;1900-01-01 price USD   6.50 CNY
`;

        const importersContent = `;; 导入规则配置
;; 生成时间: ${new Date().toISOString().split('T')[0]}

;; 这里可以配置银行数据导入规则
;; 具体语法请参考 Beancount 文档
`;

        if (!fs.existsSync(this.structure.rules.priceSources)) {
            fs.writeFileSync(this.structure.rules.priceSources, priceSourcesContent, 'utf8');
            console.log(`📄 创建价格源文件: ${this.structure.rules.priceSources}`);
        }

        if (!fs.existsSync(this.structure.rules.importers)) {
            fs.writeFileSync(this.structure.rules.importers, importersContent, 'utf8');
            console.log(`📄 创建导入规则文件: ${this.structure.rules.importers}`);
        }
    }

    /**
     * 创建报表文件
     */
    private createReportsFiles(): void {
        const queriesContent = `// 自定义查询文件
// 生成时间: ${new Date().toISOString().split('T')[0]}

// 示例查询：月度支出统计
SELECT
  account,
  sum(position) as total
FROM entries
WHERE date >= 2024-01-01 AND date < 2024-02-01
  AND account ~ "^Expenses:"
GROUP BY account
ORDER BY total DESC;
`;

        const customReportsContent = `;; 自定义报表配置
;; 生成时间: ${new Date().toISOString().split('T')[0]}

;; 这里可以添加自定义报表相关的配置
`;

        if (!fs.existsSync(this.structure.reports.queries)) {
            fs.writeFileSync(this.structure.reports.queries, queriesContent, 'utf8');
            console.log(`📄 创建查询文件: ${this.structure.reports.queries}`);
        }

        if (!fs.existsSync(this.structure.reports.customReports)) {
            fs.writeFileSync(this.structure.reports.customReports, customReportsContent, 'utf8');
            console.log(`📄 创建报表文件: ${this.structure.reports.customReports}`);
        }
    }

    /**
     * 自动发现并更新主文件的 include 语句
     */
    updateMainFileIncludes(): void {
        if (!fs.existsSync(this.structure.main)) {
            console.warn('⚠️  主文件不存在，请先初始化文件结构');
            return;
        }

        // 扫描数据目录，找到所有年度文件
        const dataDir = path.join(this.structure.root, 'data');
        const includes: string[] = [];

        // 添加固定的包含文件
        includes.push('include "config/accounts.beancount"');
        includes.push('include "config/commodities.beancount"');
        includes.push('include "config/plugins.beancount"');
        includes.push('');
        includes.push('include "data/opening-balances.beancount"');
        includes.push('');

        // 扫描年度目录
        if (fs.existsSync(dataDir)) {
            const years = fs.readdirSync(dataDir)
                .filter(item => {
                    const yearPath = path.join(dataDir, item);
                    return fs.statSync(yearPath).isDirectory() && /^\d{4}$/.test(item);
                })
                .sort();

            years.forEach(year => {
                const yearDir = path.join(dataDir, year);
                const monthFiles = fs.readdirSync(yearDir)
                    .filter(file => file.endsWith('.beancount'))
                    .sort();

                includes.push(`; ${year}年交易记录`);
                monthFiles.forEach(file => {
                    includes.push(`include "data/${year}/${file}"`);
                });
                includes.push('');
            });
        }

        // 添加规则和报表文件
        includes.push('include "rules/price-sources.beancount"');
        includes.push('include "rules/importers.beancount"');
        includes.push('include "reports/custom-reports.beancount"');

        // 重新生成主文件
        const mainContent = this.generateMainFileTemplate();
        fs.writeFileSync(this.structure.main, mainContent, 'utf8');
        console.log('✅ 主文件 include 语句已更新');
    }

    /**
     * 获取文件结构信息
     */
    getStructureInfo(): FileStructure {
        return this.structure;
    }

    /**
     * 验证文件结构完整性
     */
    validateStructure(): { valid: boolean; missing: string[]; issues: string[] } {
        const missing: string[] = [];
        const issues: string[] = [];

        // 检查主要文件
        if (!fs.existsSync(this.structure.main)) {
            missing.push('main.beancount');
        }

        // 检查配置文件
        Object.values(this.structure.config).forEach((filePath) => {
            if (!fs.existsSync(filePath)) {
                missing.push(path.relative(this.structure.root, filePath));
            }
        });

        // 检查数据文件
        if (!fs.existsSync(this.structure.data.openingBalances)) {
            missing.push(path.relative(this.structure.root, this.structure.data.openingBalances));
        }

        // 检查当前年度是否有数据文件
        const currentYear = new Date().getFullYear();
        const currentYearDir = path.join(this.structure.root, 'data', currentYear.toString());
        if (!fs.existsSync(currentYearDir)) {
            issues.push(`当前年度 ${currentYear} 的数据目录不存在`);
        }

        return {
            valid: missing.length === 0 && issues.length === 0,
            missing,
            issues
        };
    }
}
