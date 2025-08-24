// Mock external modules
jest.mock('boxen', () => jest.fn((_text: string, _options?: any) => 'mocked-boxen'));
jest.mock('cli-truncate', () => jest.fn((text: string, _columns: number) => text));
jest.mock('cli-columns', () => jest.fn((_items: string[], _options?: any) => 'mocked-columns'));
jest.mock('terminal-size', () => ({ stdout: { columns: 80, rows: 24 } }));
jest.mock('cli-cursor', () => ({
  hide: jest.fn(),
  show: jest.fn(),
}));
jest.mock('wrap-ansi', () => jest.fn((text: string, _columns: number) => text));
jest.mock('chalk-animation', () => ({
  rainbow: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    render: jest.fn(() => 'animated-text'),
  })),
  pulse: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    render: jest.fn(() => 'animated-text'),
  })),
  glitch: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    render: jest.fn(() => 'animated-text'),
  })),
  radar: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    render: jest.fn(() => 'animated-text'),
  })),
  neon: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    render: jest.fn(() => 'animated-text'),
  })),
  karaoke: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    render: jest.fn(() => 'animated-text'),
  })),
}));
jest.mock('gradient-string', () => jest.fn(() => 'gradient-text'));
jest.mock('figlet', () => ({
  textSync: jest.fn((_text: string, _options?: any) => 'ASCII-ART'),
}));
jest.mock('ora', () => jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  succeed: jest.fn(),
  fail: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
})));
jest.mock('cli-progress', () => ({
  SingleBar: jest.fn(() => ({
    start: jest.fn(),
    update: jest.fn(),
    stop: jest.fn(),
  })),
  Presets: {
    shades_classic: jest.fn(),
  },
}));
jest.mock('cli-spinners', () => ({
  dots: { frames: ['.', '..', '...'] },
}));
jest.mock('terminal-link', () => jest.fn((text: string, _url: string) => text));
jest.mock('strip-ansi', () => jest.fn((text: string) => text));
jest.mock('table', () => ({
  table: jest.fn((_data: any[], _options?: any) => 'mocked-table'),
}));
jest.mock('cli-table3', () => {
  const mockTable = jest.fn().mockImplementation(() => ({
    push: jest.fn(),
    toString: jest.fn(() => 'mocked-cli-table3'),
  }));
  return mockTable;
});
jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn(() => ({
    writeRecords: jest.fn(),
  })),
}));
jest.mock('exceljs', () => ({
  Workbook: jest.fn(() => ({
    addWorksheet: jest.fn(() => ({
      addRow: jest.fn(),
      getColumn: jest.fn(() => ({ width: 0 })),
    })),
    xlsx: {
      writeFile: jest.fn(),
    },
  })),
}));
// 移除date-fns的mock，使用真实的库
jest.mock('lodash', () => ({
  get: jest.fn((_object: any, _path: string, defaultValue?: any) => defaultValue),
  set: jest.fn(),
  merge: jest.fn(),
  cloneDeep: jest.fn((obj: any) => JSON.parse(JSON.stringify(obj))),
  debounce: jest.fn((fn: Function) => fn),
  throttle: jest.fn((fn: Function) => fn),
  groupBy: jest.fn((array: any[], _iteratee: any) => ({ grouped: array })),
  orderBy: jest.fn((array: any[]) => array),
}));
jest.mock('js-yaml', () => ({
  load: jest.fn((yamlString: string) => JSON.parse(yamlString)),
  dump: jest.fn((obj: any) => JSON.stringify(obj)),
}));
jest.mock('commander', () => ({
  Command: jest.fn(() => ({
    name: jest.fn(),
    description: jest.fn(),
    version: jest.fn(),
    option: jest.fn(),
    command: jest.fn(),
    action: jest.fn(),
    parse: jest.fn(),
    opts: jest.fn(() => ({})),
  })),
}));
jest.mock('inquirer', () => ({
  prompt: jest.fn(() => Promise.resolve({})),
}));

// Mock InteractiveCommandHandler
jest.mock('../presentation/cli/interactive-command-handler', () => ({
  InteractiveCommandHandler: {
    handleListTransactions: jest.fn(() => Promise.resolve({})),
    handleAddTransaction: jest.fn(() => Promise.resolve({})),
    handleEditTransaction: jest.fn(() => Promise.resolve({})),
    handleDeleteTransaction: jest.fn(() => Promise.resolve({})),
    handleShowBalance: jest.fn(() => Promise.resolve({})),
    handleShowNetworth: jest.fn(() => Promise.resolve({})),
    handleConfig: jest.fn(() => Promise.resolve({})),
    handleValidate: jest.fn(() => Promise.resolve({})),
    handleReport: jest.fn(() => Promise.resolve({})),
    handleExport: jest.fn(() => Promise.resolve({})),
    handleSearch: jest.fn(() => Promise.resolve({})),
  },
}));

// Mock console.log to reduce test output noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}); 