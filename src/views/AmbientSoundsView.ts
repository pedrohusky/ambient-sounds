import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";
import { AudioPlayer } from "../AudioPlayer";

// Configuração da API
// Em desenvolvimento: http://localhost:3333
// Em produção: https://fyte.site
const API_BASE_URL = "https://fyte.site";

interface Sound {
  id: string;
  name: string;
  url: string;
  category?: string;
  categoryName?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export class AmbientSoundsView implements vscode.WebviewViewProvider {
  public static readonly viewType = "ambientSounds.view";
  private webviewView: vscode.WebviewView | null = null;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly audioPlayer: AudioPlayer
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this.webviewView = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    // Manter o estado do webview quando mudar de aba
    webviewView.webview.html = this.getHtml(webviewView.webview);

    // Listener para mensagens do webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "fetchSounds":
          await this.sendSounds(
            webviewView.webview, 
            message.page || 1, 
            message.limit || 20, 
            message.search || "",
            message.category || "",
            message.append || false
          );
          break;
        case "fetchCategories":
          await this.sendCategories(webviewView.webview);
          break;
        case "ready":
          // Webview está pronto, enviar categorias e dados iniciais
          await this.sendCategories(webviewView.webview);
          await this.sendSounds(webviewView.webview, 1, 20, "", "", false);
          // Enviar estado atual do player
          this.sendPlayerState(webviewView.webview);
          break;
        case "playSound":
          // Comando para tocar som (agora suporta múltiplos)
          await this.audioPlayer.play(message.id, message.url, message.name || message.id);
          this.sendPlayerState(webviewView.webview);
          break;
        case "stopTrack":
          // Parar uma track específica
          this.audioPlayer.stop(message.id);
          this.sendPlayerState(webviewView.webview);
          break;
        case "stopAllTracks":
          // Parar todas as tracks
          this.audioPlayer.stopAll();
          this.sendPlayerState(webviewView.webview);
          break;
        case "setTrackVolume":
          // Ajustar volume de uma track específica
          this.audioPlayer.setVolume(message.id, message.volume);
          // Não enviamos o estado de volta imediatamente para evitar loop de UI se for slider dragging
          // mas talvez seja bom confirmar
          break;
        case "getPlayerState":
          // Webview solicitando estado do player
          this.sendPlayerState(webviewView.webview);
          break;
      }
    });
  }

  private sendPlayerState(webview: vscode.Webview) {
    const tracks = this.audioPlayer.getTracksState();
    webview.postMessage({
      command: "playerState",
      tracks: tracks
    });
  }

  private async sendCategories(webview: vscode.Webview) {
    try {
      const categories = await this.fetchCategoriesFromApi();
      webview.postMessage({ 
        command: "setCategories", 
        categories: categories || []
      });
    } catch (error) {
      console.log("Erro ao buscar categorias:", error);
      webview.postMessage({ 
        command: "setCategories", 
        categories: []
      });
    }
  }

  private async sendSounds(
    webview: vscode.Webview, 
    page: number, 
    limit: number, 
    search: string,
    category: string,
    append: boolean
  ) {
    try {
      // Tentar buscar da API remota
      const result = await this.fetchFromApi(page, limit, search, category);
      if (result) {
        webview.postMessage({ 
          command: "setSounds", 
          sounds: result.sounds, 
          pagination: result.pagination,
          source: "remote",
          category: result.category,
          append: append
        });
        return;
      }
    } catch (error) {
      console.log("API não disponível, usando sons locais:", error);
    }

    // Fallback: usar sons locais (sem paginação e sem categorias)
    const localSounds = this.getLocalSounds(webview);
    const soundsArray = Object.entries(localSounds).map(([id, url]) => ({ 
      id, 
      url, 
      name: this.formatName(id),
      category: "",
      categoryName: ""
    }));
    
    // Aplicar busca local
    let filtered = soundsArray;
    if (search) {
      const term = search.toLowerCase();
      filtered = soundsArray.filter(s => s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term));
    }
    
    webview.postMessage({ 
      command: "setSounds", 
      sounds: filtered,
      pagination: { page: 1, limit: filtered.length, total: filtered.length, totalPages: 1, hasMore: false },
      source: "local",
      category: null,
      append: false
    });
  }

  private formatName(name: string): string {
    return name.replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private fetchCategoriesFromApi(): Promise<Category[] | null> {
    return new Promise((resolve, reject) => {
      const url = `${API_BASE_URL}/api/categories`;
      const client = url.startsWith("https") ? https : http;

      const request = client.get(url, { timeout: 5000 }, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.success && json.categories) {
              resolve(json.categories);
            } else {
              resolve(null);
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      request.on("error", reject);
      request.on("timeout", () => {
        request.destroy();
        reject(new Error("Timeout ao conectar na API"));
      });
    });
  }

  private fetchFromApi(
    page: number, 
    limit: number, 
    search: string,
    category: string
  ): Promise<{ sounds: Sound[], pagination: Pagination, category: string | null } | null> {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit), 
        q: search 
      });
      
      if (category) {
        params.set("category", category);
      }
      
      const url = `${API_BASE_URL}/api/sounds?${params.toString()}`;
      const client = url.startsWith("https") ? https : http;

      const request = client.get(url, { timeout: 5000 }, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.success && json.sounds) {
              resolve({
                sounds: json.sounds,
                pagination: json.pagination,
                category: json.category || null
              });
            } else {
              resolve(null);
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      request.on("error", reject);
      request.on("timeout", () => {
        request.destroy();
        reject(new Error("Timeout ao conectar na API"));
      });
    });
  }

  private getLocalSounds(webview: vscode.Webview): { [key: string]: string } {
    const soundsDir = path.join(this.context.extensionPath, "media", "sounds");
    let sounds: { [key: string]: string } = {};

    try {
      const files = fs.readdirSync(soundsDir);
      files.forEach((file) => {
        const lowerFile = file.toLowerCase();
        if (lowerFile.endsWith(".mp3") || lowerFile.endsWith(".wav")) {
          const ext = path.extname(file);
          const soundName = path.basename(file, ext);
          const soundUri = webview
            .asWebviewUri(
              vscode.Uri.joinPath(
                this.context.extensionUri,
                "media",
                "sounds",
                file
              )
            )
            .toString();
          sounds[soundName] = soundUri;
        }
      });
    } catch (error) {
      console.error("Erro ao ler pasta de sons:", error);
    }

    return sounds;
  }

  private getHtml(webview: vscode.Webview) {
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "view.css")
    );
    const jsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "view.js")
    );

    // CSP permite sons locais e da API remota
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource}`,
      `script-src ${webview.cspSource}`,
      `media-src ${webview.cspSource} http://localhost:* https://*`,
      `connect-src http://localhost:* https://*`,
    ].join("; ");

    // Detectar idioma do VS Code
    const vscodeLang = vscode.env.language || "en";

    return `
      <!DOCTYPE html>
      <html lang="${vscodeLang}">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="${csp}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${cssUri}" />
      </head>
      <body>
        <header>
          <select id="category-select">
            <option value="">All Categories</option>
          </select>
          <input id="search" placeholder="" />
        </header>

        <div id="player-controls">
          <div id="active-tracks"></div>
          <div class="controls-row">
            <button id="stop-btn" disabled>Parar Todos</button>
          </div>
        </div>

        <div id="source-indicator"></div>

        <ul id="list"></ul>

        <div id="favorites-section">
          <h3>Favoritos</h3>
          <ul id="favorites-list"></ul>
        </div>

        <audio id="player" loop></audio>

        <script src="${jsUri}"></script>
      </body>
      </html>
    `;
  }
}
