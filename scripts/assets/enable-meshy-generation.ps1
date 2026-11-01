$ErrorActionPreference = 'Stop'
$configPath = Join-Path $env:USERPROFILE '.codex/config.toml'
$configText = [IO.File]::ReadAllText($configPath)
$block = [regex]::Match($configText, '(?ms)^\[mcp_servers\.meshy\].*?(?=^\[|\z)')
if (-not $block.Success) { throw 'Servidor Meshy ausente' }
$line = [regex]::Match($block.Value, '(?m)^enabled_tools\s*=\s*\[[^\r\n]*\]')
if (-not $line.Success) { throw 'Lista de ferramentas ausente ou multilinha; revisar sem alteração automática' }
$names = @([regex]::Matches($line.Value, '[''"]([^''"]+)[''"]') | ForEach-Object { $_.Groups[1].Value })
$additional = @('meshy_text_to_3d', 'meshy_text_to_3d_refine', 'meshy_remesh', 'meshy_download_model')
$allNames = @($names + $additional | Select-Object -Unique)
$replacement = 'enabled_tools = [' + (($allNames | ForEach-Object { "'" + $_ + "'" }) -join ', ') + ']'
$nextBlock = $block.Value.Substring(0, $line.Index) + $replacement + $block.Value.Substring($line.Index + $line.Length)
$nextText = $configText.Substring(0, $block.Index) + $nextBlock + $configText.Substring($block.Index + $block.Length)
if ($nextText -eq $configText) { Write-Output 'Ferramentas já habilitadas; configuração preservada.'; exit 0 }
$backupPath = $configPath + '.before-meshy-generation-' + [DateTime]::Now.ToString('yyyyMMdd-HHmmss')
[IO.File]::Copy($configPath, $backupPath, $false)
[IO.File]::WriteAllText($configPath, $nextText, [Text.UTF8Encoding]::new($false))
Write-Output 'Habilitadas geração, textura, remesh e download. Rig/animações permanecem fora da lista. Backup local preservado.'
