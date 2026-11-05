$ErrorActionPreference='Stop'
# Usuário solicitou expressamente gerar as construções no Meshy a partir das artes do modal.
$configPath=Join-Path $env:USERPROFILE '.codex/config.toml'
$configText=[IO.File]::ReadAllText($configPath)
$block=[regex]::Match($configText,'(?ms)^\[mcp_servers\.meshy\].*?(?=^\[|\z)')
if(-not $block.Success){throw 'Servidor Meshy não encontrado'}
$line=[regex]::Match($block.Value,'(?m)^enabled_tools\s*=\s*\[[^\r\n]*\]')
if(-not $line.Success){throw 'Lista de ferramentas não encontrada'}
$names=@([regex]::Matches($line.Value,'[''"]([^''"]+)[''"]')|ForEach-Object{$_.Groups[1].Value})
if($names -contains 'meshy_image_to_3d'){Write-Output 'Conversão por imagem já habilitada';exit 0}
$replacement='enabled_tools = ['+(($names+@('meshy_image_to_3d')|ForEach-Object{"'"+$_+"'"})-join ', ')+']'
$nextBlock=$block.Value.Substring(0,$line.Index)+$replacement+$block.Value.Substring($line.Index+$line.Length)
$next=$configText.Substring(0,$block.Index)+$nextBlock+$configText.Substring($block.Index+$block.Length)
$backup=$configPath+'.before-building-image-tool-'+[DateTime]::Now.ToString('yyyyMMdd-HHmmss')
[IO.File]::Copy($configPath,$backup,$false)
[IO.File]::WriteAllText($configPath,$next,[Text.UTF8Encoding]::new($false))
Write-Output 'Habilitada somente meshy_image_to_3d; demais ferramentas e configurações preservadas.'
