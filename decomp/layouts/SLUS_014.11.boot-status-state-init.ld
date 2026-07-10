OUTPUT_ARCH(mips)
ENTRY(boot_status_state_init)

SECTIONS {
  .text 0x80013154 : SUBALIGN(4) {
    *(.text.boot_status_state_init)
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
