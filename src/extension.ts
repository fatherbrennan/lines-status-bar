import * as vscode from 'vscode';
import LinesStatusBar from './LinesStatusBar';

/**
 * Lines Status Bar Extension.
 * @param {vscode.ExtensionContext} context Instance of utilities collection private to an extension.
 * @returns {void}
 */
export function activate(context: vscode.ExtensionContext): void {
  // Subscribe status bar item
  context.subscriptions.push(new LinesStatusBar().item);
}
