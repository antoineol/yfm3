import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.Function;
import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;

public class DecompileSelection extends GhidraScript {
  private final long[] addresses = {
    0x80016fe4L,
    0x80024a38L,
    0x80024a9cL,
    0x80026c94L,
    0x80026cf4L,
    0x80026da0L,
    0x80026e50L,
    0x800270e8L,
    0x800271b4L,
    0x800272b0L,
    0x80027590L,
    0x80027814L,
    0x80027928L,
    0x80027a44L,
  };

  @Override
  protected void run() throws Exception {
    String[] args = getScriptArgs();
    File out = new File(args.length == 0 ? "/tmp/yfm-pal-decomp/pal-selection.txt" : args[0]);
    DecompInterface decompiler = new DecompInterface();
    decompiler.openProgram(currentProgram);

    try (PrintWriter pw = new PrintWriter(new FileWriter(out))) {
      for (long address : addresses) {
        Address entry = toAddr(address);
        Function function = getFunctionAt(entry);
        if (function == null) {
          disassemble(entry);
          function = createFunction(entry, "forced_" + Long.toHexString(address));
        }

        pw.println("===== " + entry + " " + function + " =====");
        if (function == null) {
          pw.println("missing function");
          continue;
        }

        DecompileResults result = decompiler.decompileFunction(function, 60, monitor);
        if (result.decompileCompleted()) {
          pw.println(result.getDecompiledFunction().getC());
        } else {
          pw.println("decompile failed: " + result.getErrorMessage());
        }
        pw.println();
      }
    }

    println("Wrote " + out.getAbsolutePath());
  }
}
