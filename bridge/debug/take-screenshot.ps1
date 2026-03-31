## Take a screenshot of DuckStation using PrintWindow (captures behind other windows)
## Falls back to CopyFromScreen with SetForegroundWindow if PrintWindow returns black
param([switch]$ForceForeground)

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing @'
using System;
using System.Drawing;
using System.Runtime.InteropServices;

public class WinCapture {
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hWnd, IntPtr hDC, uint nFlags);
    [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr hWnd, out RECT r);
    [DllImport("user32.dll")] public static extern IntPtr GetDC(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);
    [DllImport("gdi32.dll")]  public static extern bool BitBlt(IntPtr hdcDest, int x, int y, int w, int h, IntPtr hdcSrc, int sx, int sy, uint rop);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left, Top, Right, Bottom; }

    public static Bitmap CaptureWindow(IntPtr hwnd) {
        RECT rect;
        GetWindowRect(hwnd, out rect);
        int w = rect.Right - rect.Left;
        int h = rect.Bottom - rect.Top;
        if (w <= 0 || h <= 0) return null;

        Bitmap bmp = new Bitmap(w, h);
        using (Graphics g = Graphics.FromImage(bmp)) {
            IntPtr hdc = g.GetHdc();
            // PW_RENDERFULLCONTENT = 2 (captures DWM/GPU content on Win 8.1+)
            PrintWindow(hwnd, hdc, 2);
            g.ReleaseHdc(hdc);
        }
        return bmp;
    }

    public static Bitmap CaptureScreen(IntPtr hwnd) {
        SetForegroundWindow(hwnd);
        System.Threading.Thread.Sleep(400);
        RECT rect;
        GetWindowRect(hwnd, out rect);
        int w = rect.Right - rect.Left;
        int h = rect.Bottom - rect.Top;
        if (w <= 0 || h <= 0) return null;

        Bitmap bmp = new Bitmap(w, h);
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.CopyFromScreen(rect.Left, rect.Top, 0, 0, new Size(w, h));
        }
        return bmp;
    }
}
'@

$ds = Get-Process duckstation* -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $ds) { Write-Error "DuckStation not running"; exit 1 }
$hwnd = $ds.MainWindowHandle

$outPath = "\\wsl.localhost\Ubuntu\home\ubuntu\perso\yfm3\bridge\debug\screenshot.png"

if ($ForceForeground) {
    $bmp = [WinCapture]::CaptureScreen($hwnd)
} else {
    # Try PrintWindow first (no focus change needed)
    $bmp = [WinCapture]::CaptureWindow($hwnd)
}

if ($bmp) {
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "ok"
} else {
    Write-Error "Capture failed"
    exit 1
}
