export interface WorkspaceConfig {
  settings: {
    showSelectedFromTwoLines: boolean;
  };
  statusBarItem: {
    alignment: 'left' | 'right';
    priority: number;
  };
}

export interface Config {
  settings: {
    showSelectedFromTwoLines: 0 | 1;
  };
  statusBarItem: {
    alignment: 'Left' | 'Right';
    priority: number;
  };
}
