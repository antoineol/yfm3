OUTPUT_ARCH(mips)
ENTRY(boot_gfx_init_tty_call)

SECTIONS {
  .text 0x800136e4 : SUBALIGN(4) {
    *(.text.boot_gfx_init_tty_call)
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
