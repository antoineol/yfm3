OUTPUT_ARCH(mips)
ENTRY(runtime_init_once)

SECTIONS {
  .text 0x80012a78 : SUBALIGN(4) {
    *(.text.runtime_init_once)
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
