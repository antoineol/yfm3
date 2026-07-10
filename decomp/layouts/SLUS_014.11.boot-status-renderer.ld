OUTPUT_ARCH(mips)
ENTRY(boot_status_renderer)

SECTIONS {
  .text 0x80012e5c : SUBALIGN(4) {
    *(.text.boot_status_renderer)
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
