OUTPUT_ARCH(mips)
ENTRY(boot_apply_object_offset)

SECTIONS {
  .text 0x800134e0 : SUBALIGN(4) {
    *(.text.boot_transform_helpers)
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
