OUTPUT_ARCH(mips)
ENTRY(entrypoint_bootstrap)

SECTIONS {
  .text 0x800129d8 : SUBALIGN(4) {
    *(.text.entrypoint_bootstrap)
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
