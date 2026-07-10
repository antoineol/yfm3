OUTPUT_ARCH(mips)
ENTRY(boot_scene_runtime_helpers)

SECTIONS {
  .text 0x80018db4 : SUBALIGN(4) {
    *(.text.boot_scene_runtime_helpers)
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
