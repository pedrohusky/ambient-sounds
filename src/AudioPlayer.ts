import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";

interface AudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  process: any;
  isPlaying: boolean;
  manualStop: boolean;
}

// Singleton para gerenciar reprodução de áudio
export class AudioPlayer {
  private static instance: AudioPlayer;
  private activeTracks: Map<string, AudioTrack> = new Map();
  private extensionPath: string;
  private cachePath: string;

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
    // Se já está tocando, não faz nada (ou poderia reiniciar)
    if (this.activeTracks.has(id)) {
      return;
    }

    // Volume padrão inicial
    const volume = 50;

    console.log(`AudioPlayer: Iniciando track ${id} (${name})`);

    const track: AudioTrack = {
      id,
      name,
      url,
      volume,
      process: null,
      isPlaying: true,
      manualStop: false
    };

    this.activeTracks.set(id, track);

    try {
      // Baixar arquivo se for URL remota (lógica reutilizada)
      let filePath = await this.resolveFilePath(id, url);
      
      // Reproduzir
      await this.playTrackFile(track, filePath);
    } catch (error) {
      console.error(`AudioPlayer: Erro ao reproduzir ${id}:`, error);
      this.stop(id);
    }
  }

  private async resolveFilePath(id: string, url: string): Promise<string> {
    // Detectar tipo de URL
    const isRemoteUrl = url.startsWith("http://") || url.startsWith("https://");
    const isWebviewUrl = url.includes("vscode-webview://") || url.includes("vscode-webview-resource:");
    
    if (isRemoteUrl && !isWebviewUrl) {
      return await this.downloadToCache(id, url);
    } else if (isWebviewUrl) {
      // Tentar encontrar o arquivo localmente
      const extensions = [".mp3", ".wav", ".ogg", ".m4a"];
      for (const ext of extensions) {
        const testPath = path.join(this.extensionPath, "media", "sounds", id + ext);
        if (fs.existsSync(testPath)) {
          return testPath;
        }
      }
      throw new Error(`Arquivo local não encontrado para id: ${id}`);
    } else {
      return url;
    }
  }

  private async downloadToCache(id: string, url: string): Promise<string> {
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = path.extname(url).split("?")[0] || ".mp3";
    const cacheFile = path.join(this.cachePath, `${safeId}${ext}`);

    if (fs.existsSync(cacheFile)) {
      return cacheFile;
    }

    const encodedUrl = encodeURI(url);

    return new Promise((resolve, reject) => {
      const client = encodedUrl.startsWith("https") ? https : http;
      
      const request = client.get(encodedUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            this.downloadToCache(id, redirectUrl).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP Error: ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(cacheFile);
        response.pipe(file);
        
        file.on("finish", () => {
          file.close();
          resolve(cacheFile);
        });

        file.on("error", (err) => {
          fs.unlink(cacheFile, () => {});
          reject(err);
        });
      });

      request.on("error", (err) => {
        fs.unlink(cacheFile, () => {});
        reject(err);
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error("Timeout ao baixar arquivo"));
      });
    });
  }

  private async playTrackFile(track: AudioTrack, filePath: string): Promise<void> {
    const { spawn } = require("child_process");
    const platform = process.platform;

    const startPlayback = () => {
      if (track.manualStop || !this.activeTracks.has(track.id)) return;

      if (platform === "win32") {
        const normalizedPath = filePath.replace(/\\/g, "/");
        const volumeFloat = track.volume / 100.0;
        
        // Script PowerShell interativo que espera comandos do stdin
        const script = `
$ErrorActionPreference = 'Stop'
try {
  Add-Type -AssemblyName PresentationCore
  $uri = New-Object System.Uri('file:///${normalizedPath}')
  $player = New-Object System.Windows.Media.MediaPlayer
  $player.Open($uri)
  $player.Volume = ${volumeFloat}
  
  # Aguardar carregamento (simples)
  Start-Sleep -Milliseconds 500
  $player.Play()

  # Loop de leitura de comandos
  while ($true) {
    if ($player.NaturalDuration.HasTimeSpan -and $player.Position -ge $player.NaturalDuration.TimeSpan) {
       # Reiniciar se acabou (loop)
       $player.Position = [TimeSpan]::Zero
       $player.Play()
    }
    
    if ([Console]::KeyAvailable) {
       # Se fosse console real, mas estamos usando pipe. 
       # Read-Host bloqueia, então precisamos de uma thread ou verificar buffer se possível.
       # Em PowerShell puro sem bloquear é difícil.
       # Vamos usar Read-Host mas isso bloqueia o loop de verificação de fim de música.
       # Melhor abordagem: Usar StreamReader no [Console]::OpenStandardInput() e Peek
    }
    
    # Abordagem simplificada: O processo Node envia comandos.
    # O PowerShell vai ficar bloqueado no Read-Host esperando comando?
    # Se ficar bloqueado no Read-Host, não detectamos o fim da musica para loop.
    # Solução: Loop infinito com verificação de input não bloqueante NÃO é trivial em PS puro antigo.
    
    # Alternativa Robusta: O loop de Playback é gerido pelo evento MediaEnded?
    # Mas precisamos manter o processo vivo.
    
    # Vamos tentar ler linha com timeout ou apenas bloquear e o Node envia "ping" se precisar?
    # Não, melhor usar um Timer no PowerShell para checar status e o thread principal lê input.
    
    $line = [Console]::In.ReadLine()
    if ($line -eq $null) { break }
    
    if ($line.StartsWith("v:")) {
       $vol = $line.Substring(2)
       $player.Volume = [float]$vol
    } elseif ($line -eq "stop") {
       break
    }
  }
} catch {
  Write-Error $_.Exception.Message
} finally {
  if ($player) {
    $player.Stop()
    $player.Close()
  }
}
`;
        // O problema do script acima é: [Console]::In.ReadLine() BLOQUEIA a execução.
        // Se a música acabar enquanto está bloqueado, ela não reinicia (loop falha).
        // MAS, o MediaPlayer toca em outra thread (WPF/PresentationCore).
        // Então o áudio CONTINUA tocando mesmo bloqueado no ReadLine.
        // O único problema é: Como detectar o fim para fazer o LOOP?
        // O MediaPlayer tem evento MediaEnded. Podemos registrar um evento!
        
        const betterScript = `
Add-Type -AssemblyName PresentationCore
$uri = New-Object System.Uri('file:///${normalizedPath}')
$player = New-Object System.Windows.Media.MediaPlayer
$player.Open($uri)
$player.Volume = ${volumeFloat}

# Evento para Loop
$action = {
    $player.Position = [TimeSpan]::Zero
    $player.Play()
}
$player.add_MediaEnded($action)

$player.Play()

# Loop de leitura de comandos (bloqueante, mas não para o áudio)
while ($true) {
    $line = [Console]::In.ReadLine()
    if ($line -eq $null) { break }
    
    if ($line.StartsWith("v:")) {
       $val = $line.Substring(2)
       # Converter . para , se necessario dependendo da cultura, ou usar InvariantCulture
       $player.Volume = [float]$val
    } elseif ($line -eq "stop") {
       break
    }
}
$player.Stop()
$player.Close()
`;

        track.process = spawn("powershell", [
          "-NoProfile", "-NonInteractive", "-Command", betterScript
        ], { 
            stdio: ["pipe", "ignore", "ignore"], // Preciso de pipe no stdin
            windowsHide: true 
        });

        track.process.on("close", (code: number) => {
           // Se fechou, é porque mandamos stop ou deu erro. 
           // Não reiniciamos automaticamente aqui pois o loop é interno ao PS agora?
           // Se o PS crashar, o loop interno morre.
           // Mas como o 'stop' manual mata o processo ou manda comando?
           // Vamos assumir que se fechou, acabou.
           if (!track.manualStop && code !== 0) {
               // Se crashou, tenta reiniciar
               setTimeout(() => startPlayback(), 1000);
           }
        });

      } else if (platform === "darwin") {
         // ... (manter existente para mac - sem controle de volume em tempo real por enquanto)
         // ... (código afplay original)
         const vol = track.volume / 100;
         track.process = spawn("afplay", ["-v", String(vol), filePath]);
         track.process.on("close", () => {
             if (!track.manualStop && this.activeTracks.has(track.id)) {
                 setTimeout(() => startPlayback(), 100);
             }
         });
      } else {
         // ... (manter existente para linux)
         track.process = spawn("paplay", [filePath]);
         track.process.on("close", () => {
             if (!track.manualStop && this.activeTracks.has(track.id)) {
                 setTimeout(() => startPlayback(), 100);
             }
         });
      }
    };

    startPlayback();
  }

  stop(id: string): void {
    const track = this.activeTracks.get(id);
    if (track) {
      console.log(`AudioPlayer: Parando track ${id}`);
      track.manualStop = true;
      track.isPlaying = false;
      
      if (process.platform === "win32" && track.process && !track.process.killed) {
        try {
            track.process.stdin.write("stop\n");
            // Dar um tempo para fechar graciosamente, senão matar
            setTimeout(() => {
                if(track.process) this.killProcess(track);
            }, 500);
        } catch (e) {
            this.killProcess(track);
        }
      } else {
        this.killProcess(track);
      }
      
      this.activeTracks.delete(id);
    }
  }

  stopAll(): void {
    console.log("AudioPlayer: Parando todas as tracks");
    const trackIds = Array.from(this.activeTracks.keys());
    for (const id of trackIds) {
      this.stop(id);
    }
  }



  private killProcess(track: AudioTrack) {
    if (track.process) {
      try {
        if (process.platform === "win32") {
             const { spawn } = require("child_process");
             spawn("taskkill", ["/pid", track.process.pid, "/f", "/t"], { stdio: 'ignore', windowsHide: true });
        } else {
             track.process.kill("SIGTERM");
        }
      } catch (e) { }
      track.process = null;
    }
  }

  setVolume(id: string, value: number): void {
    const track = this.activeTracks.get(id);
    if (track) {
      track.volume = Math.max(0, Math.min(100, value));
      // console.log(`AudioPlayer: Volume de ${id} alterado para ${track.volume}`);
      
      if (process.platform === "win32" && track.process && !track.process.killed) {
          // Enviar comando para o PowerShell
          // Powershell espera float com ponto decimal, cultura invariant
          try {
            const volFloat = (track.volume / 100.0).toFixed(2);
            track.process.stdin.write(`v:${volFloat}\n`);
          } catch (e) {
              console.error("Erro ao enviar volume para processo:", e);
          }
      } else {
          // Para outros SOs, fallback para reiniciar (comportamento antigo)
          this.killProcess(track);
      }
    }
  }

  getTracksState(): { id: string, name: string, volume: number, isPlaying: boolean }[] {
    const states: any[] = [];
    this.activeTracks.forEach(track => {
      states.push({
        id: track.id,
        name: track.name,
        volume: track.volume,
        isPlaying: track.isPlaying
      });
    });
    return states;
  }
}
