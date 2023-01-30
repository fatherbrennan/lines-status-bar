import { activate as _activate } from '../extension';
import type * as vscode from 'vscode';

/**
 * Lines Status Bar Web Extension.
 * @param {vscode.ExtensionContext} context Instance of utilities collection private to an extension.
 * @returns {void}
 */
export const activate = _activate;
