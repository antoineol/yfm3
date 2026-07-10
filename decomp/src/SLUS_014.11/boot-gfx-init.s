.set noreorder
.set noat

.section .text.boot_gfx_init,"ax",@progbits
.align 2
.global boot_gfx_init

boot_gfx_init:
  addiu $sp, $sp, -40
  lui $a0, 0x801e
  addiu $a0, $a0, -16384
  sw $ra, 32($sp)
  sw $s3, 28($sp)
  sw $s2, 24($sp)
  sw $s1, 20($sp)
  jal 0x80013898
  sw $s0, 16($sp)
  lui $a1, 0x0080
  ori $a1, $a1, 0x8080
  lui $a3, 0x0018
  ori $a3, $a3, 0x0018
  lui $a2, 0x00fc
  ori $a2, $a2, 0x0230
  addu $s3, $zero, $zero
  lui $v0, 0x800f
  addiu $s1, $v0, -24920
  lui $v0, 0x8009
  addiu $s2, $v0, 1932
  lui $v0, 0x8001
  addiu $v0, $v0, 14308
  lui $a0, 0x800f
  addiu $v1, $a0, -25104
  lui $at, 0x800a
  sw $v0, -20212($at)
  addiu $v0, $zero, 288
  sh $v0, 4($v1)
  addiu $v0, $zero, 208
  sh $v0, 6($v1)
  addiu $v0, $zero, 11
  sh $v0, 12($v1)
  lui $v0, 0x0800
  sw $v0, -25104($a0)
  ori $v0, $zero, 0xa000
  sb $zero, 472($gp)
  sw $a1, 20($v1)
  sh $v0, 14($v1)
  sw $a3, 8($v1)
  sw $a2, 16($v1)

boot_gfx_init_loop:
  lw $s0, 0($s2)
  nop
  beq $s0, $zero, boot_gfx_init_return
  addu $a0, $s1, $zero
  jal 0x800138f4
  addu $a1, $s0, $zero
  lui $a0, 0x8001
  addiu $a0, $a0, 56
  addu $a1, $s0, $zero
  lw $a2, 0($s1)
  addiu $s1, $s1, 4
  addiu $s2, $s2, 4
  jal 0x8008e870
  addiu $s3, $s3, 1
  slti $v0, $s3, 7
  bne $v0, $zero, boot_gfx_init_loop
  nop

boot_gfx_init_return:
  lw $ra, 32($sp)
  lw $s3, 28($sp)
  lw $s2, 24($sp)
  lw $s1, 20($sp)
  lw $s0, 16($sp)
  jr $ra
  addiu $sp, $sp, 40
