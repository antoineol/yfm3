.set noreorder
.set noat

.section .text.boot_gfx_helpers_tty_entry,"ax",@progbits
.align 2
.global boot_gfx_helpers_tty_entry

boot_gfx_helpers_tty_entry:
  j 0x801137e0
  sll $zero, $zero, 0x0
