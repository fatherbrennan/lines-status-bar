// Imports
const vscode = require('vscode');
const LinesStatusBar = require('./LinesStatusBar');

/**
 * Lines Status Bar Extension.
 * @param {vscode.ExtensionContext} context Instance of utilities collection private to an extension.
 * @returns {void}
 */
function activate(context) {
  // Subscribe the status bar item
  context.subscriptions.push(new LinesStatusBar().item);
}

// Exports
module.exports = {
  activate,
};
