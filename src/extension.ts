import * as vscode from 'vscode';
import { AmbientSoundsView } from './views/AmbientSoundsView';
import { AudioPlayer } from './AudioPlayer';

export function activate(context: vscode.ExtensionContext) {
  // Inicializar o player de áudio global
  const audioPlayer = AudioPlayer.getInstance(context.extensionPath);
  
  const provider = new AmbientSoundsView(context, audioPlayer);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AmbientSoundsView.viewType,
      provider
    )
  );
}

export function deactivate() {
  // Parar áudio ao desativar a extensão
  try {
    const audioPlayer = AudioPlayer.getInstance();
    audioPlayer.stop();
  } catch (e) {
    // AudioPlayer pode não ter sido inicializado
  }
}
