Add-Type -AssemblyName System.Drawing

$files = @(
    "KV [Recovered]-08.jpg",
    "KV [Recovered]-09.jpg",
    "KV [Recovered]-10.jpg",
    "KV [Recovered]-11.jpg",
    "KV [Recovered]-12.jpg",
    "KV [Recovered]-13.jpg",
    "KV [Recovered]-14.jpg"
)

$targetWidth = 1400
$quality = 75

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

foreach ($file in $files) {
    $path = Join-Path "f:\COVANA\ITC\MICROSITE" $file
    if (Test-Path $path) {
        $img = [System.Drawing.Image]::FromFile($path)
        $ratio = $targetWidth / $img.Width
        $newHeight = [int]($img.Height * $ratio)
        
        $bmp = New-Object System.Drawing.Bitmap($targetWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($bmp)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($img, 0, 0, $targetWidth, $newHeight)
        
        $outPath = Join-Path "f:\COVANA\ITC\MICROSITE" ("web_" + $file)
        $bmp.Save($outPath, $encoder, $encoderParams)
        
        $oldSize = [math]::Round((Get-Item $path).Length / 1MB, 2)
        $newSize = [math]::Round((Get-Item $outPath).Length / 1MB, 2)
        Write-Host "$file : $oldSize MB -> $newSize MB"
        
        $graphics.Dispose()
        $bmp.Dispose()
        $img.Dispose()
    }
}

Write-Host "Done!"
