OUTPUT_ARCH(mips)
ENTRY(boot_object_runtime_helpers)

SECTIONS {
  .text 0x80017db4 : SUBALIGN(4) {
    *(.text.boot_object_runtime_helpers)
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
