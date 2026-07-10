.set noreorder
.set noat

.section .text.runtime_init_always,"ax",@progbits
.align 2
.global runtime_init_always

runtime_init_always:
  lui $t0, 0x8009
  lw $t0, 1760($t0)
  addiu $sp, $sp, -16
  sw $s0, 4($sp)
  sw $s1, 8($sp)
  sw $ra, 12($sp)
  beq $t0, $zero, runtime_init_always_return
  nop
  lui $s0, 0x8001
  addiu $s0, $s0, 0
  lui $s1, 0x0
  addiu $s1, $s1, 0
  beq $s1, $zero, runtime_init_always_return
  nop

runtime_init_always_loop:
  lw $t0, 0($s0)
  addiu $s0, $s0, 4
  jalr $ra, $t0
  addiu $s1, $s1, -1
  bne $s1, $zero, runtime_init_always_loop
  nop

runtime_init_always_return:
  lw $ra, 12($sp)
  lw $s1, 8($sp)
  lw $s0, 4($sp)
  addiu $sp, $sp, 16
  jr $ra
  nop
