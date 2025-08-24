declare module 'chalk-animation' {
  export function rainbow(text: string): {
    stop: () => void;
  };
  export function pulse(text: string): {
    stop: () => void;
  };
  export function glitch(text: string): {
    stop: () => void;
  };
  export function radar(text: string): {
    stop: () => void;
  };
  export function neon(text: string): {
    stop: () => void;
  };
  export function karaoke(text: string): {
    stop: () => void;
  };
}

declare module 'cli-columns' {
  function cliColumns(input: string[], options?: {
    width?: number;
    padding?: number;
    sort?: boolean;
  }): string;
  export = cliColumns;
}

declare module 'terminal-size' {
  function terminalSize(): { columns: number; rows: number };
  export = terminalSize;
}

declare module 'cli-cursor' {
  export function hide(): void;
  export function show(): void;
}

declare module 'cli-truncate' {
  function cliTruncate(input: string, columns: number, options?: {
    position?: 'start' | 'middle' | 'end';
    space?: boolean;
  }): string;
  export = cliTruncate;
}

declare module 'wrap-ansi' {
  function wrapAnsi(input: string, columns: number, options?: {
    hard?: boolean;
    wordWrap?: boolean;
    trim?: boolean;
  }): string;
  export = wrapAnsi;
} 