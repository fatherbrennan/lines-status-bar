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
    /** @type {{}} - Line numbers dictionary. */
    const lines = {};
    /** @type {vscode.TextEditor.selections[]} - Selection object data. */
    const selections = editor ? editor.selections || [] : [];
    /** @type {number} - Number of selected lines. */
    let total = 0;

    // For each cursor
    for (let i = 0, l = selections.length; i < l; i++) {
      const e = selections[i];
      /** @type {number} Line number of the end cursor position. */
      const endLine = e.end.line;
      /** @type {number} Line number of the start cursor position. */
      const startLine = e.start.line;
      /** @type {number} Lines difference. `0` is a single line. */
      const selectedLines = endLine - startLine;
      /** @type {number} Characters difference. `0` is no characters. */
      const selectedChars = e.end.character - e.start.character;
      /** @type {number} Created index key of start line. */
      let start = startLine;
      /** @type {number} Created index key of end line. */
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
