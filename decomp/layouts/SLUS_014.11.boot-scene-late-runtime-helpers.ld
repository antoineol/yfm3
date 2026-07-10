OUTPUT_ARCH(mips)
ENTRY(boot_scene_late_runtime_helpers)

SECTIONS {
  .text 0x800208d4 : SUBALIGN(4) {
    *(.text.boot_scene_late_runtime_helpers)
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
