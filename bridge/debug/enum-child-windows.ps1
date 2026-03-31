Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Text;

public class WinApi {
    public delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool EnumChildWindows(IntPtr hwnd, EnumWindowsProc callback, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int GetClassName(IntPtr hwnd, StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hwnd);

    [DllImport("user32.dll")]
    public static extern bool GetClientRect(IntPtr hwnd, out RECT lpRect);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left, Top, Right, Bottom; }

    public static List<string> Results = new List<string>();

    public static bool Callback(IntPtr hwnd, IntPtr lParam) {
        var sb = new StringBuilder(256);
        GetClassName(hwnd, sb, 256);
        RECT r;
        GetClientRect(hwnd, out r);
        bool vis = IsWindowVisible(hwnd);
        int w = r.Right - r.Left;
        int h = r.Bottom - r.Top;
        Results.Add(hwnd.ToInt64() + "|" + sb.ToString() + "|visible=" + vis + "|" + w + "x" + h);
        return true;
    }
}
"@

$proc = Get-Process duckstation* | Select-Object -First 1
if (-not $proc) { Write-Host "DuckStation not running"; exit 1 }
$mainHwnd = $proc.MainWindowHandle
Write-Host "Main HWND: $mainHwnd"

[WinApi]::EnumChildWindows($mainHwnd, [WinApi+EnumWindowsProc]::CreateDelegate([WinApi+EnumWindowsProc], [WinApi], "Callback"), [IntPtr]::Zero) | Out-Null

foreach ($line in [WinApi]::Results) {
    Write-Host $line
}

if ([WinApi]::Results.Count -eq 0) {
    Write-Host "No child windows found"
}
