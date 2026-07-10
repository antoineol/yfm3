OUTPUT_ARCH(mips)
ENTRY(main_boot)

SECTIONS {
  .text 0x80012b50 : SUBALIGN(4) {
    *(.text.main_boot)
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
