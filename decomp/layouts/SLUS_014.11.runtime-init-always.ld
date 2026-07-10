OUTPUT_ARCH(mips)
ENTRY(runtime_init_always)

SECTIONS {
  .text 0x80012ae8 : SUBALIGN(4) {
    *(.text.runtime_init_always)
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
