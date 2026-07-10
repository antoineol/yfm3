OUTPUT_ARCH(mips)
ENTRY(boot_gfx_helpers_tty_stub)

SECTIONS {
  .text 0x801137e0 : SUBALIGN(4) {
    *(.text.boot_gfx_helpers_tty_stub)
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
