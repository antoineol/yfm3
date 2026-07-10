OUTPUT_ARCH(mips)
ENTRY(boot_input_position_loop)

SECTIONS {
  .text 0x80013360 : SUBALIGN(4) {
    *(.text.boot_input_helpers)
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
