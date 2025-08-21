/**
 * 配置管理器
 *
 * 作者: JanYork
 */
export interface BeancountConfig {
    data: {
        default_file: string;
        data_dir: string;
        backup_dir: string;
        export_dir: string;
    };
    currency: {
        default: string;
        supported: string[];
        exchange_rate_api?: string;
    };
    accounts: {
        default_prefix: string;
        templates: {
            assets: string[];
            expenses: string[];
            income: string[];
        };
    };
    ui: {
        language: string;
        theme: string;
        show_emoji: boolean;
        show_colors: boolean;
        output_format: string;
    };
    features: {
        auto_backup: boolean;
        backup_frequency: string;
        enable_validation: boolean;
        auto_exchange_rate: boolean;
        enable_templates: boolean;
    };
    security: {
        encrypt_sensitive: boolean;
        hash_algorithm: string;
        session_timeout: number;
    };
    logging: {
        level: string;
        file: string;
        console: boolean;
        max_size: number;
        max_files: number;
    };
    plugins: {
        enabled: boolean;
        directory: string;
        auto_load: boolean;
    };
}
export declare class ConfigManager {
    private static instance;
    private config;
    private configPath;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): ConfigManager;
    /**
     * 获取配置
     */
    getConfig(): BeancountConfig;
    /**
     * 获取配置值
     */
    get<T>(key: string, defaultValue?: T): T;
    /**
     * 设置配置值
     */
    set<T>(key: string, value: T): void;
    /**
     * 保存配置到文件
     */
    saveConfig(): void;
    /**
     * 重新加载配置
     */
    reloadConfig(): void;
    /**
     * 获取默认配置文件路径
     */
    private getDefaultConfigPath;
    /**
     * 加载默认配置
     */
    private loadDefaultConfig;
    /**
     * 加载配置文件
     */
    private loadConfig;
    /**
     * 将配置转换为YAML格式（简化版本）
     */
    private configToYaml;
    /**
     * 将YAML转换为配置对象（简化版本）
     */
    private yamlToConfig;
    /**
     * 展开路径中的环境变量和用户目录
     */
    expandPath(pathStr: string): string;
    /**
     * 获取配置文件的完整路径
     */
    getConfigPath(): string;
    /**
     * 检查配置是否有效
     */
    validateConfig(): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=config-manager.d.ts.map