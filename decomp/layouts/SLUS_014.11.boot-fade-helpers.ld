OUTPUT_ARCH(mips)
ENTRY(boot_fade_helpers)

SECTIONS {
  .text 0x80015078 : SUBALIGN(4) {
    *(.text.boot_fade_helpers)
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
