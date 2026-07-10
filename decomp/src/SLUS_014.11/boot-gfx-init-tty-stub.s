.set noreorder
.set noat

.section .text.boot_gfx_init_tty_stub,"ax",@progbits
.align 2
.global boot_gfx_init_tty_stub

boot_gfx_init_tty_stub:
  addiu $sp, $sp, -8
  sw $ra, 4($sp)
  lui $a0, 0x8001
  addiu $a0, $a0, 0x29b4
  addiu $t2, $zero, 0x00a0
  jalr $t2
  addiu $t1, $zero, 0x003e
  lw $ra, 4($sp)
  addiu $sp, $sp, 8
  lui $a0, 0x801e
  j 0x80013898
  addiu $a0, $a0, -16384
