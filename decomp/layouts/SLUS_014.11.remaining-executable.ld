OUTPUT_ARCH(mips)
ENTRY(remaining_executable)

SECTIONS {
  .text 0x8004002c : SUBALIGN(4) {
    *(.text.remaining_executable)
  }

  /DISCARD/ : {
    *(.reginfo)
    *(.MIPS.abiflags)
    *(.pdr)
    *(.gnu.attributes)
    *(.comment)
    *(.note*)
  }
}
