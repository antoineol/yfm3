.set noreorder
.set noat

.section .text.boot_gfx_init_tty_call,"ax",@progbits
.align 2
.global boot_gfx_init_tty_call

boot_gfx_init_tty_call:
  addiu $sp, $sp, -40
  lui $a0, 0x801e
  addiu $a0, $a0, -16384
  sw $ra, 32($sp)
  sw $s3, 28($sp)
  sw $s2, 24($sp)
  sw $s1, 20($sp)
  jal 0x801137e0
  sw $s0, 16($sp)
