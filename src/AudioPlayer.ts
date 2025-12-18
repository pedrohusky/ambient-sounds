import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";

// Singleton para gerenciar reprodução de áudio
export class AudioPlayer {
  private static instance: AudioPlayer;
  private currentSound: { id: string; url: string; name: string } | null = null;
  private volume: number = 50;
  private isPlaying: boolean = false;
  private audioProcess: any = null;
  private extensionPath: string;
  private cachePath: string;
  private loopInterval: NodeJS.Timeout | null = null;

  private constructor(extensionPath: string) {
    this.extensionPath = extensionPath;
    // Usar diretório temporário do sistema para cache de áudio
    this.cachePath = path.join(os.tmpdir(), "vscode-ambient-sounds-cache");
    
    // Criar pasta de cache se não existir
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }
  }

  static getInstance(extensionPath?: string): AudioPlayer {
    if (!AudioPlayer.instance) {
      if (!extensionPath) {
        throw new Error("extensionPath is required on first call");
      }
      AudioPlayer.instance = new AudioPlayer(extensionPath);
    }
    return AudioPlayer.instance;
  }

  async play(id: string, url: string, name: string): Promise<void> {
    // Parar som atual se houver
    this.stop();

    this.currentSound = { id, url, name };
    this.isPlaying = true;

    console.log("AudioPlayer.play() chamado:");
    console.log("  - id:", id);
    console.log("  - url:", url);
    console.log("  - name:", name);

    try {
      // Baixar arquivo se for URL remota
      let filePath: string;
      
      // Detectar tipo de URL
      const isRemoteUrl = url.startsWith("http://") || url.startsWith("https://");
      const isWebviewUrl = url.includes("vscode-webview://") || url.includes("vscode-webview-resource:");
      
      console.log("  - isRemoteUrl:", isRemoteUrl);
      console.log("  - isWebviewUrl:", isWebviewUrl);
      
      if (isRemoteUrl && !isWebviewUrl) {
        // URL remota (API/CDN)
        console.log("  -> Baixando arquivo remoto...");
        filePath = await this.downloadToCache(id, url);
      } else if (isWebviewUrl) {
        // É um arquivo local da extensão com URI de webview
        console.log("  -> Convertendo URI de webview para caminho local...");
        
        // Tentar encontrar o arquivo localmente
        const extensions = [".mp3", ".wav", ".ogg", ".m4a"];
        filePath = "";
        
        for (const ext of extensions) {
          const testPath = path.join(this.extensionPath, "media", "sounds", id + ext);
          if (fs.existsSync(testPath)) {
            filePath = testPath;
            break;
          }
        }
        
        if (!filePath) {
          throw new Error(`Arquivo local não encontrado para id: ${id}`);
        }
      } else {
        // Assume que é um caminho local direto
        filePath = url;
      }

      console.log("  -> filePath final:", filePath);
      console.log("  -> Arquivo existe?", fs.existsSync(filePath));

      // Reproduzir
      await this.playFile(filePath);
    } catch (error) {
      console.error("AudioPlayer: Erro ao reproduzir áudio:", error);
      this.isPlaying = false;
      this.currentSound = null;
    }
  }

  private async downloadToCache(id: string, url: string): Promise<string> {
    // Sanitizar ID para nome de arquivo (substituir caracteres inválidos)
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = path.extname(url).split("?")[0] || ".mp3";
    const cacheFile = path.join(this.cachePath, `${safeId}${ext}`);

    console.log("AudioPlayer.downloadToCache():");
    console.log("  - id:", id);
    console.log("  - safeId:", safeId);
    console.log("  - url:", url);
    console.log("  - cacheFile:", cacheFile);

    // Se já existe no cache, usar
    if (fs.existsSync(cacheFile)) {
      console.log("  -> Arquivo já existe no cache!");
      return cacheFile;
    }

    // Fazer encode da URL para lidar com espaços e caracteres especiais
    const encodedUrl = encodeURI(url);
    console.log("  - encodedUrl:", encodedUrl);

    return new Promise((resolve, reject) => {
      const client = encodedUrl.startsWith("https") ? https : http;
      
      const request = client.get(encodedUrl, (response) => {
        console.log("  - statusCode:", response.statusCode);
        
        // Seguir redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          console.log("  -> Redirect para:", redirectUrl);
          if (redirectUrl) {
            this.downloadToCache(id, redirectUrl).then(resolve).catch(reject);
            return;
          }
        }

        // Verificar se o status é OK
        if (response.statusCode !== 200) {
          console.error("  -> Erro HTTP:", response.statusCode);
          reject(new Error(`HTTP Error: ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(cacheFile);
        
        response.pipe(file);
        
        file.on("finish", () => {
          file.close();
          console.log("  -> Download concluído!");
          resolve(cacheFile);
        });

        file.on("error", (err) => {
          console.error("  -> Erro ao escrever arquivo:", err);
          fs.unlink(cacheFile, () => {});
          reject(err);
        });
      });

      request.on("error", (err) => {
        console.error("  -> Erro na requisição:", err);
        fs.unlink(cacheFile, () => {}); // Remover arquivo parcial
        reject(err);
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error("Timeout ao baixar arquivo"));
      });
    });
  }

  private async playFile(filePath: string): Promise<void> {
    const { spawn, exec } = require("child_process");
    const platform = process.platform;

    console.log("AudioPlayer: Tentando reproduzir:", filePath);

    const startPlayback = () => {
      if (!this.isPlaying) return;

      if (platform === "win32") {
        // Windows: usar PowerShell com .NET MediaPlayer (mais simples)
        const normalizedPath = filePath.replace(/\\/g, "/");
        
        // Script PowerShell simplificado
        const script = `
$ErrorActionPreference = 'Stop'
try {
  Add-Type -AssemblyName PresentationCore
  $uri = New-Object System.Uri('file:///${normalizedPath}')
  $player = New-Object System.Windows.Media.MediaPlayer
  $player.Open($uri)
  Start-Sleep -Milliseconds 200
  $player.Play()
  while ($player.NaturalDuration.HasTimeSpan -eq $false -and $player.HasAudio -eq $false) {
    Start-Sleep -Milliseconds 100
  }
  if ($player.NaturalDuration.HasTimeSpan) {
    Start-Sleep -Seconds $player.NaturalDuration.TimeSpan.TotalSeconds
  } else {
    Start-Sleep -Seconds 30
  }
  $player.Stop()
  $player.Close()
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
`;
        
        this.audioProcess = spawn("powershell", [
          "-NoProfile",
          "-NonInteractive", 
          "-Command",
          script
        ], { 
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });

        this.audioProcess.stdout?.on("data", (data: Buffer) => {
          console.log("AudioPlayer stdout:", data.toString());
        });

        this.audioProcess.stderr?.on("data", (data: Buffer) => {
          console.error("AudioPlayer stderr:", data.toString());
        });

        this.audioProcess.on("close", (code: number) => {
          console.log("AudioPlayer: Processo fechou com código:", code);
          // Loop: reiniciar se ainda estiver tocando
          if (this.isPlaying && this.currentSound) {
            setTimeout(() => startPlayback(), 100);
          }
        });

        this.audioProcess.on("error", (err: any) => {
          console.error("AudioPlayer: Erro no processo:", err);
        });
      } else if (platform === "darwin") {
        // macOS: usar afplay
        this.audioProcess = spawn("afplay", ["-v", String(this.volume / 100), filePath]);

        this.audioProcess.on("close", () => {
          if (this.isPlaying && this.currentSound) {
            setTimeout(() => startPlayback(), 100);
          }
        });

        this.audioProcess.on("error", (err: any) => {
          console.error("Erro no processo de áudio:", err);
        });
      } else {
        // Linux: usar paplay (PulseAudio) ou aplay
        this.audioProcess = spawn("paplay", [filePath]);

        this.audioProcess.on("close", () => {
          if (this.isPlaying && this.currentSound) {
            setTimeout(() => startPlayback(), 100);
          }
        });

        this.audioProcess.on("error", (err: any) => {
          // Se paplay falhar, tentar aplay
          console.log("paplay falhou, tentando aplay...");
          this.audioProcess = spawn("aplay", [filePath]);
        });
      }
    };

    startPlayback();
  }

  stop(): void {
    this.isPlaying = false;
    this.currentSound = null;

    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }

    if (this.audioProcess) {
      try {
        // No Windows, precisamos matar o processo de forma diferente
        if (process.platform === "win32") {
          const { spawn } = require("child_process");
          spawn("taskkill", ["/pid", this.audioProcess.pid, "/f", "/t"], { shell: true });
        } else {
          this.audioProcess.kill("SIGTERM");
        }
      } catch (e) {
        // Ignorar erro se processo já terminou
      }
      this.audioProcess = null;
    }
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(100, value));
    // Volume em tempo real não é suportado com SoundPlayer, 
    // será aplicado na próxima reprodução
  }

  getState(): { isPlaying: boolean; currentSound: { id: string; url: string; name: string } | null; volume: number } {
    return {
      isPlaying: this.isPlaying,
      currentSound: this.currentSound,
      volume: this.volume
    };
  }

  getCurrentSound(): { id: string; url: string; name: string } | null {
    return this.currentSound;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
