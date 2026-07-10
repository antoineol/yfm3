OUTPUT_ARCH(mips)
ENTRY(boot_object_render_helpers)

SECTIONS {
  .text 0x80016784 : SUBALIGN(4) {
    *(.text.boot_object_render_helpers)
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
