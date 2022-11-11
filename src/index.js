// Imports
const vscode = require('vscode');

/**
 * Lines Status Bar Extension.
 * @param {vscode.ExtensionContext} context Instance of utilities collection private to an extension.
 * @returns {void}
 */
function activate(context) {
  const subscriptions = context.subscriptions;

  // Register status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    101
  );

  /**
   * Update the status bar item.
   * -> Total lines count.
   * -> Selected lines count.
   * @returns {void}
   */
  function updateStatusBarItem() {
    const e = vscode.window.activeTextEditor;
    const n = e.document.lineCount;
    const s = getNumberOfSelectedLines(e);

    if (s > 0) {
      // Show number of selected lines
      statusBarItem.text = `Lines ${n} (${s} selected)`;
    } else {
      // Show total number of lines
      statusBarItem.text = `Lines ${n}`;
    }

    // Show in status bar
    statusBarItem.show();
  }

  /**
   * Get the number of selected lines.
   * @param {vscode.TextEditor} editor Active text editor object.
   * @returns {number} - Number of lines selected.
   */
  function getNumberOfSelectedLines(editor) {
    /** @type {{}} - Line numbers. */
    const lines = {};
    /** @type {vscode.TextEditor.selections[]} - Selection object data. */
    const selections = editor ? editor.selections || [] : [];
    /** @type {number} - Number of selected lines. */
    let total = 0;

    // For each cursor
    for (let i = 0, l = selections.length; i < l; i++) {
      const e = selections[i];

      // If new line
      if (lines[e.end.line] === undefined) {
        // If 0, there is no multiline selection
        const selectedLines = e.end.line - e.start.line;
        const selectedChars = e.end.character - e.start.character;

        // Same line, highlighted characters
        if (selectedLines === 0 && selectedChars > 0) {
          total++;
          lines[e.end.line] = true;
        }
        // Multiple lines highlighted
        else if (selectedLines > 0) {
          total += selectedLines + 1;
          lines[e.end.line] = true;
        }

        // Don't include line with cursor position at beginning
        // Important due to highlight wrapping behaviour
        if (e.end.character === 0 && total > 0) {
          total--;
        }
      }
    }

    // Return the total number of selected lines
    return total;
  }

  // Subscribe status bar item
  subscriptions.push(statusBarItem);

  // Subscribe listeners
  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
  );
  subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem)
  );

  // Init
  updateStatusBarItem();
}

// Exports
module.exports = {
  activate,
};
