OUTPUT_ARCH(mips)
ENTRY(boot_scene_wait_helpers)

SECTIONS {
  .text 0x8001944c : SUBALIGN(4) {
    *(.text.boot_scene_wait_helpers)
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
