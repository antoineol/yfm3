OUTPUT_ARCH(mips)
ENTRY(entrypoint_init)

SECTIONS {
  .text 0x800129d8 : SUBALIGN(4) {
    *(.text.entrypoint_init)
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
