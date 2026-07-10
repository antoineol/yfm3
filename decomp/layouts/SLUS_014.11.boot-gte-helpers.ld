OUTPUT_ARCH(mips)
ENTRY(boot_gte_helpers)

SECTIONS {
  .text 0x80015d18 : SUBALIGN(4) {
    *(.text.boot_gte_helpers)
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
