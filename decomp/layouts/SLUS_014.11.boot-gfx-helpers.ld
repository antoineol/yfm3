OUTPUT_ARCH(mips)
ENTRY(boot_gfx_helpers)

SECTIONS {
  .text 0x800137e4 : SUBALIGN(4) {
    *(.text.boot_gfx_helpers)
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
