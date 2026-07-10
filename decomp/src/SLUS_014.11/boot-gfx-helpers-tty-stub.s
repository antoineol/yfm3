.set noreorder
.set noat

.section .text.boot_gfx_helpers_tty_stub,"ax",@progbits
.align 2
.global boot_gfx_helpers_tty_stub

boot_gfx_helpers_tty_stub:
  addiu $sp, $sp, -16
  sw $ra, 12($sp)
  sw $a0, 8($sp)
  lui $a0, 0x8001
  addiu $a0, $a0, 0x29b4
  addiu $t2, $zero, 0x00a0
  jalr $t2
  addiu $t1, $zero, 0x003e
  lw $a0, 8($sp)
  lw $ra, 12($sp)
  addiu $sp, $sp, 16
  addiu $sp, $sp, -24
  sw $ra, 16($sp)
  j 0x800138a0
  sll $zero, $zero, 0x0
