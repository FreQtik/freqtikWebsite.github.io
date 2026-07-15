param(
    [string]$RepoRoot = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Find-RepositoryRoot {
    param([string]$RequestedRoot)

    $candidates = [System.Collections.Generic.List[string]]::new()
    if (-not [string]::IsNullOrWhiteSpace($RequestedRoot)) {
        $candidates.Add((Resolve-Path -LiteralPath $RequestedRoot).Path)
    }
    $candidates.Add($PSScriptRoot)
    $parent = Split-Path -Parent $PSScriptRoot
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        $candidates.Add($parent)
    }

    foreach ($candidate in $candidates) {
        if ((Test-Path -LiteralPath (Join-Path $candidate "impulse-anvil.html")) -and
            (Test-Path -LiteralPath (Join-Path $candidate "connect.html")) -and
            (Test-Path -LiteralPath (Join-Path $candidate "assets\freqtik-site.js"))) {
            return $candidate
        }
    }

    throw @"
Could not locate the FreQtik website repository.

Extract the complete 'freqtik_site_cleanup_safe' folder directly inside the repository root,
next to impulse-anvil.html, connect.html and the assets folder, then run the BAT file again.
"@
}

$RepoRoot = Find-RepositoryRoot -RequestedRoot $RepoRoot
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path

Write-Host "FreQtik website cleanup" -ForegroundColor Cyan
Write-Host "Repository: $RepoRoot"

$requiredFiles = @(
    "impulse-anvil.html",
    "connect.html",
    "assets\freqtik-site.js",
    "assets\freqtik-site.css",
    "llms.txt",
    "llms-full.txt"
)

foreach ($relative in $requiredFiles) {
    $full = Join-Path $RepoRoot $relative
    if (-not (Test-Path -LiteralPath $full)) {
        throw "Required repository file is missing: $relative"
    }
}

$parentOfRepo = Split-Path -Parent $RepoRoot
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupRoot = Join-Path $parentOfRepo ("freqtik_cleanup_backup_" + $stamp)
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$changedFiles = [System.Collections.Generic.List[string]]::new()
$backedUpFiles = @{}

function Get-RelativePath {
    param([string]$FullPath)
    $relative = $FullPath.Substring($RepoRoot.Length)
    while ($relative.StartsWith("\") -or $relative.StartsWith("/")) {
        $relative = $relative.Substring(1)
    }
    return $relative
}

function Read-TextFile {
    param([string]$FullPath)
    return [System.IO.File]::ReadAllText($FullPath)
}

function Backup-FileOnce {
    param([string]$FullPath)
    if ($backedUpFiles.ContainsKey($FullPath)) { return }

    $relative = Get-RelativePath -FullPath $FullPath
    $destination = Join-Path $backupRoot $relative
    $destinationDirectory = Split-Path -Parent $destination
    if (-not (Test-Path -LiteralPath $destinationDirectory)) {
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    }
    Copy-Item -LiteralPath $FullPath -Destination $destination -Force
    $backedUpFiles[$FullPath] = $true
}

function Save-TextIfChanged {
    param(
        [string]$FullPath,
        [string]$NewText
    )

    $oldText = if (Test-Path -LiteralPath $FullPath) { Read-TextFile -FullPath $FullPath } else { "" }
    if ($oldText -cne $NewText) {
        if (Test-Path -LiteralPath $FullPath) {
            Backup-FileOnce -FullPath $FullPath
        }
        [System.IO.File]::WriteAllText($FullPath, $NewText, $utf8NoBom)
        $relative = Get-RelativePath -FullPath $FullPath
        if (-not $changedFiles.Contains($relative)) {
            $changedFiles.Add($relative)
        }
    }
}

function Remove-AiProcessCopy {
    param([string]$Text)

    $result = $Text

    # Keep styling intact while removing the obsolete process-specific class name.
    $result = $result.Replace("ia-about-ai-", "ia-about-method-")

    # Known visible copy from earlier FreQtik homepage/about revisions.
    $result = $result.Replace(
        "The work begins with a concrete problem: an audio workflow that should be more direct, a creative idea that deserves a usable interface, or an interaction that becomes meaningful through testing. AI-assisted development accelerates implementation and iteration, while each public release remains human-directed, tested, documented and supported.",
        "The work begins with a concrete problem: an audio workflow that should be more direct, a creative idea that deserves a usable interface, or an interaction that becomes meaningful through testing. Each public release is tested, documented and supported directly."
    )
    $result = $result.Replace(
        "AI-assisted development is used intensively to accelerate implementation and iteration, but the standard remains human: the result must be understandable, functional, documented and worth using.",
        "Development is focused on making the result understandable, functional, documented and worth using."
    )
    $result = $result.Replace(
        "AI-assisted development enables unusually broad experimentation and refinement.",
        "Independent development allows broad experimentation and refinement."
    )
    $result = $result.Replace(
        "AI is used intensively for implementation, research, iteration, debugging and communication. It expands what one independent developer can explore, but it does not replace responsibility. Public releases still have to work, make accurate claims, explain their limitations and remain understandable to the people using them.",
        "Projects are developed, tested, documented and released with direct responsibility for the result. Public releases still have to work, make accurate claims, explain their limitations and remain understandable to the people using them."
    )
    $result = $result.Replace(
        "FreQtik uses AI intensively for implementation, research, iteration, debugging and communication. That makes it possible for one independent developer to explore at a scale that previously required a larger team. It does not remove responsibility: every public release still has to be judged by whether it works, whether its claims are accurate, and whether a user can understand what they are buying.",
        "FreQtik develops, tests and refines projects independently. Every public release is judged by whether it works, whether its claims are accurate, and whether a user can understand what they are buying."
    )
    $result = $result.Replace("<span>AI-assisted</span>", "<span>Shipped products</span>")
    $result = $result.Replace("AI-assisted.<br/>Human-directed.", "Independent.<br/>Directly accountable.")
    $result = $result.Replace("AI-assisted.<br>Human-directed.", "Independent.<br>Directly accountable.")
    $result = $result.Replace("AI-assisted, human-directed", "Independent and directly accountable")
    $result = $result.Replace("AI is leverage.", "Tools support the process.")
    $result = $result.Replace("Not the product claim.", "The result remains the standard.")
    $result = $result.Replace("producer-led, AI-assisted", "producer-led")
    $result = $result.Replace("producer-led and AI-assisted", "producer-led and independently released")
    $result = $result.Replace("The work is producer-led and AI-assisted.", "The work is producer-led and independently released.")

    # Remove any remaining adjective form without inventing a new process claim.
    $result = [regex]::Replace($result, '(?i)\bAI[- ]assisted\s+', '')

    return $result
}

function Point-ImpulseLinksToRoot {
    param([string]$Text)
    $result = $Text
    $result = $result.Replace('https://freqtik.com/impulse-anvil.html', 'https://freqtik.com/')
    $result = $result.Replace('href="/impulse-anvil.html"', 'href="/"')
    $result = $result.Replace("href='/impulse-anvil.html'", "href='/'")
    $result = $result.Replace('href="impulse-anvil.html"', 'href="/"')
    $result = $result.Replace("href='impulse-anvil.html'", "href='/'")
    return $result
}

# 1. Remove obsolete AI-process messaging from public root HTML files.
$rootHtmlFiles = Get-ChildItem -LiteralPath $RepoRoot -Filter "*.html" -File
foreach ($file in $rootHtmlFiles) {
    $text = Read-TextFile -FullPath $file.FullName
    $updated = Remove-AiProcessCopy -Text $text
    Save-TextIfChanged -FullPath $file.FullName -NewText $updated
}

# 2. Clean the shared JavaScript and matching CSS class names.
$jsPath = Join-Path $RepoRoot "assets\freqtik-site.js"
$js = Read-TextFile -FullPath $jsPath
$js = Remove-AiProcessCopy -Text $js
$js = Point-ImpulseLinksToRoot -Text $js

$connectHeroPattern = '(?is)<section class="ia-section ia-connect-hero">\s*<div class="ia-shell">.*?</div>\s*</section>'
$connectHeroReplacement = @'
<section class="ia-section ia-connect-hero">
          <div class="ia-shell">
            <h1>Connect</h1>
          </div>
        </section>
'@
$connectHeroOptions = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline
$connectHeroRegex = [System.Text.RegularExpressions.Regex]::new($connectHeroPattern, $connectHeroOptions)
$js = $connectHeroRegex.Replace($js, $connectHeroReplacement, 1)
$js = [regex]::Replace($js, '(?is)<p>Installation videos, activation guidance, demonstrations and longer explanations of FreQtik tools and development work\.</p>', '')
$js = [regex]::Replace($js, '(?is)<p>Short-form project posts, visual development updates and selected work from the broader FreQtik catalogue\.</p>', '')
Save-TextIfChanged -FullPath $jsPath -NewText $js

$cssPath = Join-Path $RepoRoot "assets\freqtik-site.css"
$css = Read-TextFile -FullPath $cssPath
$css = $css.Replace("ia-about-ai-", "ia-about-method-")
Save-TextIfChanged -FullPath $cssPath -NewText $css

# 3. Simplify the static Connect page while preserving all four cards and support note.
$connectPath = Join-Path $RepoRoot "connect.html"
$connect = Read-TextFile -FullPath $connectPath
$connect = Remove-AiProcessCopy -Text $connect
$connect = [regex]::Replace($connect, '(?is)<title>.*?</title>', '<title>Connect — FreQtik</title>')
$connect = [regex]::Replace($connect, '(?is)<meta content="[^"]*" name="description"\s*/>', '<meta content="Connect with FreQtik by email, Discord, YouTube or Instagram." name="description"/>')
$connect = [regex]::Replace($connect, '(?is)<meta content="[^"]*" property="og:title"\s*/>', '<meta content="Connect — FreQtik" property="og:title"/>')
$connect = [regex]::Replace($connect, '(?is)<meta content="[^"]*" property="og:description"\s*/>', '<meta content="Connect with FreQtik by email, Discord, YouTube or Instagram." property="og:description"/>')
$connect = [regex]::Replace($connect, '(?is)<meta content="[^"]*" name="twitter:title"\s*/>', '<meta content="Connect — FreQtik" name="twitter:title"/>')
$connect = [regex]::Replace($connect, '(?is)<meta content="[^"]*" name="twitter:description"\s*/>', '<meta content="Connect with FreQtik by email, Discord, YouTube or Instagram." name="twitter:description"/>')
$staticConnectHeroReplacement = @'
<section class="ia-section ia-connect-hero">
<div class="ia-shell">
<h1>Connect</h1>
</div>
</section>
'@
$connect = $connectHeroRegex.Replace($connect, $staticConnectHeroReplacement, 1)
$connect = [regex]::Replace($connect, '(?is)<p>Installation videos, activation guidance, demonstrations and longer explanations of FreQtik tools and development work\.</p>', '')
$connect = [regex]::Replace($connect, '(?is)<p>Short-form project posts, visual development updates and selected work from the broader FreQtik catalogue\.</p>', '')
Save-TextIfChanged -FullPath $connectPath -NewText $connect

# 4. Make Impulse Anvil the canonical homepage, while keeping the old URL functional.
$productPath = Join-Path $RepoRoot "impulse-anvil.html"
$product = Read-TextFile -FullPath $productPath
$product = Remove-AiProcessCopy -Text $product
$product = Point-ImpulseLinksToRoot -Text $product
Save-TextIfChanged -FullPath $productPath -NewText $product

$indexPath = Join-Path $RepoRoot "index.html"
Save-TextIfChanged -FullPath $indexPath -NewText $product

# 5. Replace machine-readable summaries with clean, factual descriptions.
$llmsText = @'
# FreQtik

FreQtik is the independent work of a producer and developer creating audio software, producer resources, games and interactive projects.

## Main product

- Impulse Anvil: a Windows 10/11, 64-bit VST3 for designing, morphing, sculpting, auditioning and baking custom WAV impulse responses.
- Official product homepage: https://freqtik.com/
- Downloads and installation: https://freqtik.com/downloads.html
- Documentation: https://freqtik.com/docs.html

## Other public work

- Master Desktop Tap: a free beta Windows VST3 routing utility for sending DAW audio to Discord, OBS and screen-sharing applications.
- Contrast Rules for Producers: a practical producer framework about context, contrast, attention and musical impact.
- Learning to Bear: an independently released Steam game.
- Aim Trainer Bee Pro: an independently released Steam aim-training game.
- Micro Mouse Star Trainer: a browser-based precision and timing trainer.
- Boon TD Online: a browser tower-defense project.

## Contact and official links

- About: https://freqtik.com/about.html
- Connect: https://freqtik.com/connect.html
- GitHub releases: https://github.com/FreQtik/freqtikWebsite.github.io/releases
- YouTube: https://www.youtube.com/@FreQtik
- Instagram: https://www.instagram.com/freqtik/
- Email: freqtiksup@gmail.com
'@
Save-TextIfChanged -FullPath (Join-Path $RepoRoot "llms.txt") -NewText $llmsText

$llmsFullText = @'
# FreQtik — public site summary

FreQtik is the independent work of a producer and developer creating audio software, practical producer resources, games and interactive projects. The official website presents released products, public documentation, downloads, demonstrations and direct support channels.

## Impulse Anvil

Official homepage: https://freqtik.com/
Downloads and installation: https://freqtik.com/downloads.html
Documentation: https://freqtik.com/docs.html
Release history: https://github.com/FreQtik/freqtikWebsite.github.io/releases

Impulse Anvil is a focused Windows 10/11, 64-bit VST3 for authoring impulse responses. Users can load two source IRs or compatible WAV material, prepare A and B independently, morph between them, audition the prepared result through convolution, edit and equalize it, and bake the result as a standard WAV impulse response.

Publicly described features include:

- A/B impulse-response loading and preparation
- Per-slot time, gain, Color and Texture controls
- Time Morph
- Spectral, BandSwap and ZigZag morph modes
- Stereo Slot Swap and Mid/Side Boundary modes
- A-to-B Lerp inside a single prepared impulse response
- Waveform trimming, reverse-range editing and fades
- Visual EQ, stereo width and output preparation
- Standard WAV impulse-response export in the full version
- 126 included handmade impulse responses
- A free demo mode for evaluation before purchase

The current official target is Windows 10 or Windows 11 with a 64-bit VST3-compatible host. Delivery uses a manual ZIP containing the complete VST3 folder. The product page describes compatibility, workflow, demo limitations and purchase terms directly.

## Master Desktop Tap

Page: https://freqtik.com/master-desktop-tap.html

Master Desktop Tap is a free beta Windows VST3 utility intended to help route DAW audio into applications such as Discord, OBS and screen sharing. Users should test it with their own interface, DAW and streaming setup before relying on it in a live session.

## Producer resources

Contrast Rules for Producers: https://freqtik.com/contrast-rules-for-producers.html

Contrast Rules for Producers is a practical framework about how context, contrast, attention, instrumentation, timing and internal sound detail affect musical impact.

## Games and interactive projects

- Learning to Bear: https://freqtik.com/learning-to-bear.html
- Aim Trainer Bee Pro: https://freqtik.com/aim-trainer-bee-pro.html
- Micro Mouse Star Trainer: https://freqtik.com/micro-mouse-trainer.html
- Boon TD Online: https://boontd.freqtik.com

Learning to Bear and Aim Trainer Bee Pro have public Steam store records. The remaining projects are presented as browser-based or ongoing interactive work where applicable.

## About and contact

- About FreQtik: https://freqtik.com/about.html
- Connect: https://freqtik.com/connect.html
- YouTube: https://www.youtube.com/@FreQtik
- Instagram: https://www.instagram.com/freqtik/
- GitHub: https://github.com/FreQtik
- Support email: freqtiksup@gmail.com

FreQtik is not presented as a large software company. Product claims should be evaluated from the public pages, documentation, downloadable builds, release history and external store records.
'@
Save-TextIfChanged -FullPath (Join-Path $RepoRoot "llms-full.txt") -NewText $llmsFullText

# 6. Keep only the canonical homepage in the sitemap for the duplicated product content.
$sitemapPath = Join-Path $RepoRoot "sitemap.xml"
if (Test-Path -LiteralPath $sitemapPath) {
    $sitemap = Read-TextFile -FullPath $sitemapPath
    $sitemap = [regex]::Replace(
        $sitemap,
        '(?is)\s*<url>\s*<loc>https://freqtik\.com/impulse-anvil\.html</loc>.*?</url>',
        ''
    )
    Save-TextIfChanged -FullPath $sitemapPath -NewText $sitemap
}

# ---------------------------- Validation ----------------------------
Write-Host "Running validation..." -ForegroundColor Cyan

$productNow = Read-TextFile -FullPath $productPath
$indexNow = Read-TextFile -FullPath $indexPath
$connectNow = Read-TextFile -FullPath $connectPath
$jsNow = Read-TextFile -FullPath $jsPath

if ($indexNow -cne $productNow) {
    throw "Validation failed: index.html is not an exact copy of the cleaned Impulse Anvil page."
}
if ($indexNow -notmatch '<body[^>]*data-default-feed="anvil"') {
    throw "Validation failed: the new homepage is missing the Impulse Anvil page marker."
}
if ($indexNow -notmatch '<link href="https://freqtik\.com/" rel="canonical"\s*/>') {
    throw "Validation failed: the new homepage canonical URL is not https://freqtik.com/."
}
if ($connectNow -notmatch '<h1>Connect</h1>') {
    throw "Validation failed: connect.html does not contain the simplified Connect heading."
}
if ($connectNow -match 'Installation videos, activation guidance, demonstrations and longer explanations') {
    throw "Validation failed: the old YouTube explanation remains in connect.html."
}
if ($connectNow -match 'Short-form project posts, visual development updates') {
    throw "Validation failed: the old Instagram explanation remains in connect.html."
}
if ($jsNow -match 'Installation videos, activation guidance, demonstrations and longer explanations') {
    throw "Validation failed: the old YouTube explanation remains in freqtik-site.js."
}
if ($jsNow -match 'Short-form project posts, visual development updates') {
    throw "Validation failed: the old Instagram explanation remains in freqtik-site.js."
}

foreach ($htmlPath in @($indexPath, $productPath, $connectPath)) {
    $html = Read-TextFile -FullPath $htmlPath
    if (($html -notmatch '(?i)<!DOCTYPE html>') -or
        ($html -notmatch '(?i)<html\b') -or
        ($html -notmatch '(?i)</html>') -or
        ($html -notmatch '(?i)<body\b') -or
        ($html -notmatch '(?i)</body>')) {
        throw "Validation failed: malformed basic HTML structure in $(Get-RelativePath -FullPath $htmlPath)."
    }
}

$publicFilesToScan = [System.Collections.Generic.List[string]]::new()
foreach ($file in (Get-ChildItem -LiteralPath $RepoRoot -Filter "*.html" -File)) { $publicFilesToScan.Add($file.FullName) }
$publicFilesToScan.Add($jsPath)
$publicFilesToScan.Add($cssPath)
$publicFilesToScan.Add((Join-Path $RepoRoot "llms.txt"))
$publicFilesToScan.Add((Join-Path $RepoRoot "llms-full.txt"))

$remainingAiReferences = [System.Collections.Generic.List[string]]::new()
$aiScanPattern = '(?i)\bAI[- ]assisted\b|\buses AI\b|\bAI is used\b|\bAI is leverage\b|producer-led\s*(?:,|and)\s*AI'
foreach ($filePath in $publicFilesToScan) {
    if (-not (Test-Path -LiteralPath $filePath)) { continue }
    $content = Read-TextFile -FullPath $filePath
    if ($content -match $aiScanPattern) {
        $remainingAiReferences.Add((Get-RelativePath -FullPath $filePath))
    }
}
if ($remainingAiReferences.Count -gt 0) {
    throw "Validation failed: obsolete AI-process wording remains in: $($remainingAiReferences -join ', ')"
}

if (Test-Path -LiteralPath $sitemapPath) {
    try {
        [xml](Read-TextFile -FullPath $sitemapPath) | Out-Null
    }
    catch {
        throw "Validation failed: sitemap.xml is not valid XML after editing. $($_.Exception.Message)"
    }
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeValidation = "Node.js not installed; JavaScript syntax check was skipped."
if ($null -ne $nodeCommand) {
    & $nodeCommand.Path --check $jsPath
    if ($LASTEXITCODE -ne 0) {
        throw "Validation failed: assets\freqtik-site.js did not pass node --check."
    }
    $nodeValidation = "JavaScript syntax: PASS (node --check)"
}

$reportLines = [System.Collections.Generic.List[string]]::new()
$reportLines.Add("FREQTIK WEBSITE CLEANUP REPORT")
$reportLines.Add("Generated: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
$reportLines.Add("Repository: " + $RepoRoot)
$reportLines.Add("Backup: " + $backupRoot)
$reportLines.Add("")
$reportLines.Add("RESULT: PASS")
$reportLines.Add("- Root homepage now uses the exact cleaned impulse-anvil.html content.")
$reportLines.Add("- impulse-anvil.html remains available and points search engines to the root canonical URL.")
$reportLines.Add("- Connect hero simplified to 'Connect'.")
$reportLines.Add("- YouTube and Instagram explanatory paragraphs removed from static and dynamic Connect content.")
$reportLines.Add("- Obsolete AI-process messaging removed from public HTML, shared JS and machine-readable summaries.")
$reportLines.Add("- llms.txt and llms-full.txt rewritten as factual project summaries.")
$reportLines.Add("- " + $nodeValidation)
$reportLines.Add("")
$reportLines.Add("CHANGED FILES")
if ($changedFiles.Count -eq 0) {
    $reportLines.Add("- No changes were necessary.")
}
else {
    foreach ($relative in $changedFiles) { $reportLines.Add("- " + $relative) }
}
$reportLines.Add("")
$reportLines.Add("Before committing, delete the extracted freqtik_site_cleanup_safe folder from inside the repository.")
$reportLines.Add("The timestamped backup is outside the repository and can restore every changed file.")

$reportPath = Join-Path $backupRoot "CLEANUP_REPORT.txt"
[System.IO.File]::WriteAllLines($reportPath, $reportLines.ToArray(), $utf8NoBom)

Write-Host "" 
Write-Host "PASS — cleanup completed safely." -ForegroundColor Green
Write-Host "Backup: $backupRoot" -ForegroundColor Yellow
Write-Host "Report: $reportPath"
Write-Host "" 
Write-Host "Changed files:" -ForegroundColor Cyan
foreach ($relative in $changedFiles) {
    Write-Host "  $relative"
}
Write-Host "" 
Write-Host "Delete the extracted freqtik_site_cleanup_safe folder before committing." -ForegroundColor Yellow
Write-Host "Then review the diff in GitHub Desktop, commit and push." -ForegroundColor Green
