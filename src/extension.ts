import * as vscode from 'vscode';
import { AmbientSoundsView } from './views/AmbientSoundsView';

export function activate(context: vscode.ExtensionContext) {
  const provider = new AmbientSoundsView(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AmbientSoundsView.viewType,
      provider
    )
  );
}

export function deactivate() {}
