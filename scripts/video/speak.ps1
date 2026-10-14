param([Parameter(Mandatory=$true)][string]$PlanPath,[Parameter(Mandatory=$true)][string]$OutputDirectory,[int]$Rate=1)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$plan=Get-Content -LiteralPath $PlanPath -Raw -Encoding UTF8 | ConvertFrom-Json
[IO.Directory]::CreateDirectory($OutputDirectory) | Out-Null
$speaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
 $voices=@($speaker.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq 'zh-CN' })
 if ($voices.Count -eq 0) { throw 'No installed Chinese local TTS voice.' }
 $speaker.SelectVoice($voices[0].VoiceInfo.Name)
 $speaker.Rate=$Rate
 foreach ($scene in $plan.scenes) {
  $wavePath=Join-Path $OutputDirectory ($scene.id+'.wav')
  $speaker.SetOutputToWaveFile($wavePath)
  $speaker.Speak([string]$scene.narration)
  $speaker.SetOutputToNull()
 }
 Write-Output ('Generated local narration: '+$voices[0].VoiceInfo.Name)
} finally { $speaker.Dispose() }
