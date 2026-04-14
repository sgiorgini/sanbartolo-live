# Migrazione sanbartolo-live su nuovo PC

## Prerequisiti
- PowerShell 5.1+
- Git installato e configurato globalmente (opzionale, verrà autoconfigurato)
- Accesso a GitHub per il push

## Procedura rapida (3 passaggi)

### 1. Trasferisci la cartella
Copia la cartella `C:\sanbartolo-live` dal vecchio PC a `C:\sanbartolo-live` sul nuovo PC.

```powershell
# Opzione A: Via USB/rete/cloud storage manuale
# Copia la cartella C:\sanbartolo-live

# Opzione B: Remote copy (se accessibile)
Copy-Item -Path "\\<vecchio-pc>\c$\sanbartolo-live" -Destination "C:\sanbartolo-live" -Recurse -Force
```

### 2. Configura l'ambiente locale
Sul nuovo PC, da PowerShell in `C:\sanbartolo-live`:

```powershell
cd C:\sanbartolo-live
powershell -NoProfile -ExecutionPolicy Bypass -File .\SETUP-NUOVO-PC.ps1
```

Opzionale: personalizza nome utente ed email git:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\SETUP-NUOVO-PC.ps1 `
  -UserName "Tuo Nome" `
  -UserEmail "tua.email@example.com" `
  -IntervalSeconds 15
```

### 3. Verifica che il live sia attivo
Controlla i log della console e GitHub Pages:
- Console locale: deve mostrare "PUSH OK - snapshot aggiornato" ogni ~15 secondi
- GitHub: https://github.com/sgiorgini/sanbartolo-live/commits/main deve avanzare
- Live web: https://sgiorgini.github.io/sanbartolo-live/

## Comandi di utilità

### Avviare il loop manualmente
```powershell
cd C:\sanbartolo-live
powershell -NoProfile -ExecutionPolicy Bypass -File .\update-and-push.ps1 -IntervalSeconds 15
```

### Usare il launcher batch
```cmd
cd C:\sanbartolo-live
.\avvia-update-web.bat
```

### Test singolo (senza loop)
```powershell
cd C:\sanbartolo-live
powershell -NoProfile -ExecutionPolicy Bypass -File .\update-and-push.ps1 -RunOnce
```

### Verificare processi attivi
```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'update-and-push' }
```

### Fermare l'updater
```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'C:\\sanbartolo-live\\update-and-push' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

## Protezioni integrate

- **Anti-doppio-avvio**: Il launcher batch blocca un secondo avvio se lo script è già attivo nella cartella
- **Controllo errori**: I problemi di commit/push sono riportati esplicitamente come errori, non come successi
- **File temporanei**: Usa nomi univoci per processo per evitare conflitti

## FAQ

**D: Come cambio l'intervallo di aggiornamento?**  
R: Modifica `-IntervalSeconds` nel comando o in `avvia-update-web.bat`

**D: Il camera feed non è raggiungibile, cosa faccio?**  
R: Verifica che `http://44.3.44.133/webcapture.jpg?command=snap&channel=1` sia raggiungibile dalla rete.  
Se è bloccato, modifica `$SourceUrl` in `update-and-push.ps1`

**D: Come vedo i log storici?**  
R: Guarda la cartella `live/` per i file snapshot e `status.json` per l'ultimo aggiornamento:
```powershell
Get-Content status.json | ConvertFrom-Json
```

**D: Come faccio a usare un'identità git diversa?**  
R: Accedi direttamente nel repository:
```powershell
cd C:\sanbartolo-live
git config user.name "Nuovo Nome"
git config user.email "nuovo@email.com"
```
