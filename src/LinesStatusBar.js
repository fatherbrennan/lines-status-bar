// Imports
const vscode = require('vscode');

/**
 * @typedef LinesStatusBar
 * @property {Config} config - The config object.
 * @property {vscode.StatusBarItem} item - The status bar item.
 * @property {() => void} forceUpdate - Force update the status bar item.
 * @property {() => Config} getConfig - Get the config object.
 * @property {(any) => void} setConfig - Set the config object.
 *
 * @typedef Config
 * @property {{
 *   showSelectedFromTwoLines: 0|1,
 * }} settings - Settings configuration object.
 * @property {{
 *   alignment: 'Right'|'Left',
 *   priority: 101|number
 * }} statusBarItem - Status bar item configuration object.
 */

/**
 * Get the number of selected lines.
 * @private
 * @param {vscode.TextEditor} editor Active text editor object.
 * @returns {number} - Positive integer of lines selected.
 */
function getNumberOfSelectedLines(editor) {
  /** @type {{}} - Line numbers dictionary. */
  const lines = {};
  /** @type {vscode.TextEditor.selections[]} - Selection object data. */
  const selections = editor ? editor.selections || [] : [];
  /** @type {number} - Number of selected lines. */
  let total = 0;

  // For each cursor
  for (let i = 0, l = selections.length; i < l; i++) {
    const e = selections[i];
    /** @type {number} - Line number of the end cursor position. */
    const endLine = e.end.line;
    /** @type {number} - Line number of the start cursor position. */
    const startLine = e.start.line;
    /** @type {number} - Lines difference. `0` is a single line. */
    const selectedLines = endLine - startLine;
    /** @type {number} - Characters difference. `0` is no characters. */
    const selectedChars = e.end.character - e.start.character;
    /** @type {number} - Created index key of start line. */
    let start = startLine;
    /** @type {number} - Created index key of end line. */
    let end = endLine;

    // Single line
    if (selectedLines === 0) {
      // Normal cursor: (no selection)
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

    // Multiple lines
    switch (true) {
      // Seperate lines
      case lines[startLine] === undefined && lines[endLine] === undefined:
        total++;
        break;
      // Share line with previous start
      case lines[startLine] === undefined:
        end--;
    }

    // Account for trailing highlight wrapping behaviour
    if (e.end.character === 0) {
      total--;
      end--;
    }

    // Update total
    total += selectedLines;
    // Update dictionary with selected lines
    lines[start] = true;
    lines[end] = true;
  }

  // Return the total number of selected lines
  return total;
}

/**
 * LinesStatusBar.
 * @constructor
 * @returns {LinesStatusBar} LinesStatusBar.
 */
function LinesStatusBar() {
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
 * Force update the status bar item.
 * - Total lines count.
 * - Selected lines count.
 * @returns {void}
 */
LinesStatusBar.prototype.forceUpdate = function () {
  /** @type {vscode.window.activeTextEditor} - Active text editor object. */
  const e = vscode.window.activeTextEditor;

  // If an active text editor exists
  if (e) {
    /** @type {number} - Positive integer of lines in active editor. */
    const n = e.document.lineCount;
    /** @type {number} - Positive integer. */
    const s = getNumberOfSelectedLines(e);

    // Update the status bar item text
    if (s > this.config.settings.showSelectedFromTwoLines) {
      // Show number of selected lines
      this.item.text = `Lines ${n} (${s} selected)`;
    } else {
      // Show total number of lines
      this.item.text = `Lines ${n}`;
    }

    // Show in status bar
    this.item.show();
  } else {
    // Hide from status bar
    this.item.hide();
  }
};

/**
 * Getter handler for config.
 * @returns {Config}
 */
LinesStatusBar.prototype.getConfig = function () {
  const settings = {};
  const statusBarItem = {};
  /** @type {vscode.WorkspaceConfiguration} - Settings Configuration. */
  const config_settings = vscode.workspace.getConfiguration(
    'linesStatusBar.settings'
  );
  /** @type {vscode.WorkspaceConfiguration} - Status Bar Item Configuration. */
  const config_statusBarItem = vscode.workspace.getConfiguration(
    'linesStatusBar.statusBarItem'
  );

  /** @type {0|1} - Number to be greater than to display 'selected'. */
  settings.showSelectedFromTwoLines =
    config_settings.get('showSelectedFromTwoLines') === true ? 1 : 0;

  /** @type {'Right'|'Left'} - Alignment direction. */
  statusBarItem.alignment =
    config_statusBarItem.get('alignment') === 'left' ? 'Left' : 'Right';
  /** @type {number} - Integer representing status bar item priority. */
  statusBarItem.priority = config_statusBarItem.get('priority') || 101;

  // Return config
  return {
    settings: settings,
    statusBarItem: statusBarItem,
  };
};

/**
 * Setter handler for config.
 * @param {any} config New config object to set.
 * @returns {void}
 */
LinesStatusBar.prototype.setConfig = function (config) {
  // Set config
  this.config = config;
};

/**
 * Setter handler for config.
 * @param {any} config New config object to set.
 * @returns {void}
 */
LinesStatusBar.prototype.setStatusBarItem = function () {
  // Delete the status bar item
  if (this.item) {
    this.item.dispose();
  }

  // Set the status bar item
  this.item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment[this.config.statusBarItem.alignment],
    this.config.statusBarItem.priority
  );
};

module.exports = LinesStatusBar;
