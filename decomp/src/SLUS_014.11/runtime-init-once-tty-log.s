.set noreorder
.set noat

.section .text.runtime_init_once,"ax",@progbits
.align 2
.global runtime_init_once

runtime_init_once:
  lui $t0, 0x8009
  lw $t0, 1760($t0)
  addiu $sp, $sp, -16
  sw $s0, 4($sp)
  sw $s1, 8($sp)
  sw $ra, 12($sp)
  bne $t0, $zero, runtime_init_once_return
  ori $t0, $zero, 0x1
  lui $at, 0x8009
  sw $t0, 1760($at)
  lui $s0, 0x8001
  addiu $s0, $s0, 0
  lui $s1, 0x0
  addiu $s1, $s1, 0
  beq $s1, $zero, runtime_init_once_log
  nop

runtime_init_once_log:
  lui $a0, 0x8001
  addiu $a0, $a0, 0x29b4
  addiu $t2, $zero, 0x00a0
  jalr $t2
  addiu $t1, $zero, 0x003e
  nop

runtime_init_once_return:
  lw $ra, 12($sp)
  lw $s1, 8($sp)
  lw $s0, 4($sp)
  addiu $sp, $sp, 16
  jr $ra
  nop
