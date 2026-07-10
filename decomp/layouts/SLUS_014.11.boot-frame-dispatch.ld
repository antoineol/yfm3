OUTPUT_ARCH(mips)
ENTRY(boot_frame_dispatch)

SECTIONS {
  .text 0x8001306c : SUBALIGN(4) {
    *(.text.boot_frame_dispatch)
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
