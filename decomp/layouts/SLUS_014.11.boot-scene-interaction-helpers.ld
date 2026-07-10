OUTPUT_ARCH(mips)
ENTRY(boot_scene_interaction_helpers)

SECTIONS {
  .text 0x80023fbc : SUBALIGN(4) {
    *(.text.boot_scene_interaction_helpers)
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
