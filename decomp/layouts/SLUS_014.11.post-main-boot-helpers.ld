OUTPUT_ARCH(mips)
ENTRY(boot_frame_counters)

SECTIONS {
  .text 0x80012cd4 : SUBALIGN(4) {
    *(.text.post_main_boot_helpers)
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
