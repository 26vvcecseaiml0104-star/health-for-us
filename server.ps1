param(
    [int]$Port = 8080,
    [string]$Root = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".ics"  = "text/calendar; charset=utf-8"
}

try {
    $listener.Start()
    Write-Host "CareConnect Server listening on http://localhost:$Port/ and http://127.0.0.1:$Port/"
    Write-Host "Serving static files from: $Root"

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $urlPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($urlPath)) {
                $urlPath = "index.html"
            }

            $urlPath = $urlPath -replace '/', '\'
            $filePath = Join-Path $Root $urlPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = "application/octet-stream"
                if ($mimeTypes.ContainsKey($ext)) {
                    $mime = $mimeTypes[$ext]
                }

                $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $mime
                $response.ContentLength64 = $fileBytes.Length
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.AddHeader("Cache-Control", "no-cache")

                $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
                $response.OutputStream.Flush()
                $response.StatusCode = 200
            } else {
                $err = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
                $response.StatusCode = 404
                $response.ContentLength64 = $err.Length
                $response.OutputStream.Write($err, 0, $err.Length)
                $response.OutputStream.Flush()
            }
            $response.Close()
        } catch {
            Write-Host "Request error: $_"
            try { $response.Close() } catch {}
        }
    }
} catch {
    Write-Host "Fatal listener error: $_"
} finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
