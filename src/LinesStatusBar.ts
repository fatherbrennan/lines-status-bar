import * as vscode from 'vscode';
import type { Config, WorkspaceConfig } from './types/types';

/**
 * Get the number of selected lines.
 * @private
 * @param {vscode.TextEditor} editor Active text editor object.
 * @returns {number} Unsigned integer of lines selected.
 */
const getNumberOfSelectedLines = (editor: vscode.TextEditor): number => {
  // Abort if there is no active editor
  if (!editor) {
    return 0;
  }

  /** Line numbers dictionary. */
  const lines: { [key: number]: true } = {};
  /** The selections in this text editor. */
  const selections: readonly vscode.Selection[] = editor.selections || [];
  /** Number of selected lines. */
  let total = 0;

  // For each cursor
  for (let i = 0, l = selections.length; i < l; i++) {
    const selection = selections[i];
    /** Line number of the end cursor position. */
    const endLine = selection.end.line;
    /** Line number of the start cursor position. */
    const startLine = selection.start.line;
    /** Lines difference. `0` is a single line. */
    const selectedLines = endLine - startLine;
    /** Characters difference. `0` is no characters. */
    const selectedChars = selection.end.character - selection.start.character;
    /** Created index key of start line. */
    let start = startLine;
    /** Created index key of end line. */
    let end = endLine;

    /**
     * Handle single line.
     */

    if (selectedLines === 0) {
      // Normal cursor (no selection)
      if (selectedChars === 0) {
        continue;
      }

      // Single line selection
      if (lines[endLine] === undefined) {
        total++;
        lines[endLine] = true;
        continue;
      }
    }

    /**
     * Handle multiple lines.
     */

    // Seperate lines
    if (lines[startLine] === undefined && lines[endLine] === undefined) {
      total++;
    }
    // Share line with previous start
    else if (lines[startLine] === undefined) {
      end--;
    }

    /**
     * Account for trailing highlight wrapping behaviour.
     */
    if (selection.end.character === 0) {
      total--;
      end--;
    }

    // Update total
    total += selectedLines;
    // Update dictionary with selected lines
    lines[start] = true;
    lines[end] = true;
  }

  return total;
};

export class LinesStatusBar {
  item!: vscode.StatusBarItem;
  config!: Config;

  constructor() {
    // Set configuration object
    this.setConfig(this.getConfig());

    // Set the status bar item
    this.setStatusBarItem();

    /**
     * Set listeners
     * - onDidChangeConfiguration
     * - onDidChangeActiveTextEditor
     * - onDidChangeTextEditorSelection
     */
    vscode.workspace.onDidChangeConfiguration(() => {
      this.setConfig(this.getConfig());
      this.setStatusBarItem();
    });
    vscode.window.onDidChangeActiveTextEditor(() => this.forceUpdate());
    vscode.window.onDidChangeTextEditorSelection(() => this.forceUpdate());

    // Init
    this.forceUpdate();
  }

  /**
   * Getter handler for config.
   * @returns {Config}
   * @memberof LinesStatusBar
   */
  getConfig(): Config {
    const workspaceConfig = {
      settings: vscode.workspace.getConfiguration('linesStatusBar.settings'),
      statusBarItem: vscode.workspace.getConfiguration(
        'linesStatusBar.statusBarItem'
      ),
    };

    return {
      /**
       * Settings.
       */
      settings: {
        /**
         * Number to be greater than to display 'selected'.
         */
        showSelectedFromTwoLines:
          workspaceConfig.settings.get<
            WorkspaceConfig['settings']['showSelectedFromTwoLines']
          >('showSelectedFromTwoLines') === true
            ? 1
            : 0,
      },

      /**
       * Status Bar item preferences.
       */
      statusBarItem: {
        /**
         * Alignment direction.
         */
        alignment:
          workspaceConfig.statusBarItem.get<
            WorkspaceConfig['statusBarItem']['alignment']
          >('alignment') === 'left'
            ? 'Left'
            : 'Right',

        /**
         * Integer representing status bar item priority.
         */
        priority: workspaceConfig.statusBarItem.get<
          WorkspaceConfig['statusBarItem']['priority']
        >('priority', 101),
      },
    } as Config;
  }

  /**
   * Force update the status bar item.
   * - Total lines count.
   * - Selected lines count.
   * @returns {void}
   * @memberof LinesStatusBar
   */
  forceUpdate(): void {
    /** Active text editor object. */
    const activeTextEditor = vscode.window.activeTextEditor;

    // If there is no active text editor
    if (!activeTextEditor) {
      // Hide from status bar
      this.item!.hide();
      return;
    }

    /** Positive integer of lines in active editor. */
    const nLines = activeTextEditor.document.lineCount;
    /** Positive integer. */
    const nSelectedLines = getNumberOfSelectedLines(activeTextEditor);

    // Update the status bar item text
    if (nSelectedLines > this.config.settings.showSelectedFromTwoLines) {
      // Show number of selected lines
      this.item!.text = `Lines ${nLines} (${nSelectedLines} selected)`;
    } else {
      // Show total number of lines
      this.item!.text = `Lines ${nLines}`;
    }

    // Show in status bar
    this.item!.show();
  }

  /**
   * Setter handler for config.
   * @param {Config} config New config object.
   * @returns {void}
   * @memberof LinesStatusBar
   */
  setConfig(config: Config): void {
    this.config = config;
  }

  /**
   * Create and set status bar item.
   * @returns {void}
   * @memberof LinesStatusBar
   */
  setStatusBarItem(): void {
    // Delete extisting status bar item
    if (this.item) {
      this.item.dispose();
    }

    // Set the status bar item
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment[this.config.statusBarItem.alignment],
      this.config.statusBarItem.priority
    );
  }
}

export default LinesStatusBar;
