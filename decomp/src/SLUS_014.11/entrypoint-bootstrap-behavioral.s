.set noreorder
.set noat

.section .text.entrypoint_bootstrap,"ax",@progbits
.align 2
.global entrypoint_bootstrap

entrypoint_bootstrap:
  lui $v0, 0x800a
  addiu $v0, $v0, -20336
  lui $v1, 0x8010
  addiu $v1, $v1, -6360

clear_bss_loop:
  sw $zero, 0($v0)
  addiu $v0, $v0, 4
  sltu $at, $v0, $v1
  bne $at, $zero, clear_bss_loop
  nop

  lui $v0, 0x800a
  lw $v0, -20720($v0)
  nop
  addi $v0, $v0, -8
  lui $t0, 0x8000
  or $sp, $v0, $t0
  lui $a0, 0x8010
  addiu $a0, $a0, -6360
  sll $a0, $a0, 3
  srl $a0, $a0, 3
  lui $v1, 0x800a
  lw $v1, -20716($v1)
  nop
  subu $a1, $v0, $v1
  subu $a1, $a1, $a0
  lui $at, 0x8009
  sw $a1, 1768($at)
  or $a0, $a0, $t0
  lui $at, 0x8009
  sw $a0, 1764($at)
  lui $at, 0x800a
  sw $ra, -20336($at)
  lui $gp, 0x800a
  addiu $gp, $gp, -20728
  addu $fp, $sp, $zero
  lui $ra, 0x800a
  lw $ra, -20336($ra)
  nop
  jal 0x80012b50
  or $zero, $zero, $zero
  break 0,1
