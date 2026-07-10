OUTPUT_ARCH(mips)
ENTRY(boot_gfx_helpers_tty_entry)

SECTIONS {
  .text 0x80013898 : SUBALIGN(4) {
    *(.text.boot_gfx_helpers_tty_entry)
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
