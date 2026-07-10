.set noreorder
.set noat

.section .text.boot_status_state_init,"ax",@progbits
.align 2
.global boot_status_state_init

boot_status_state_init:
  addiu $sp, $sp, -48
  sw $s4, 40($sp)
  addu $s4, $a0, $zero
  addu $a0, $zero, $zero
  sw $ra, 44($sp)
  sw $s3, 36($sp)
  sw $s2, 32($sp)
  sw $s1, 28($sp)
  jal 0x8007f350
  sw $s0, 24($sp)
  addiu $a0, $zero, 320
  addiu $a1, $zero, 240
  addiu $a2, $zero, 4
  addiu $a3, $zero, 1
  jal 0x80084dd0
  sw $zero, 16($sp)
  addu $a0, $zero, $zero
  addu $a1, $a0, $zero
  addiu $a2, $zero, 320
  jal 0x800856a0
  addu $a3, $a0, $zero
  addiu $s3, $zero, 6
  addu $s0, $s4, $zero
  addiu $v1, $zero, 1
  lui $v0, 0x8010
  addiu $v0, $v0, -8120
  sb $v1, 421($gp)
  sb $v1, 456($gp)
  sb $zero, 416($gp)
  lui $at, 0x800a
  sb $v1, -20148($at)
  lui $at, 0x800a
  sb $v1, -20156($at)
  lui $at, 0x800a
  sb $v1, -20149($at)
  lui $at, 0x800a
  sb $v1, -20157($at)
  lui $at, 0x800a
  sb $v1, -20150($at)
  lui $at, 0x800a
  sb $v1, -20158($at)
  sb $v1, 24($v0)
  sb $v1, 22($v0)
  sb $v1, 25($v0)
  sb $v1, 26($v0)
  sb $v1, 27($v0)
  addiu $v0, $zero, 2
  addu $v1, $s3, $zero
  sb $v0, 408($gp)
  addiu $v0, $zero, 12
  sb $v1, 409($gp)
  sb $v0, 410($gp)
  sb $v1, 411($gp)
  addiu $s1, $zero, 3

boot_status_state_init_arena_loop:
  addiu $s2, $zero, 20812
  addiu $v0, $zero, 2
  sw $v0, 20752($s0)
  addiu $v0, $s0, 16
  sw $v0, 20776($s0)
  addiu $v0, $zero, 12
  sw $v0, 20792($s0)
  addiu $v0, $s0, 272
  sw $v0, 20796($s0)
  addiu $v0, $s0, 16656
  sw $s0, 20756($s0)
  sw $s3, 20772($s0)
  sw $s3, 20812($s0)
  sw $v0, 20816($s0)

boot_status_state_init_slot_loop:
  addu $a0, $zero, $zero
  andi $a1, $s1, 0xffff
  jal 0x80085db0
  addu $a2, $s0, $s2
  addiu $s1, $s1, -1
  bgez $s1, boot_status_state_init_slot_loop
  addiu $s2, $s2, -20
  addiu $s0, $s0, 20832
  ori $v0, $zero, 0xa2c0
  addu $v0, $s4, $v0
  slt $v0, $s0, $v0
  bne $v0, $zero, boot_status_state_init_arena_loop
  addiu $s1, $zero, 3
  lui $v1, 0x800f
  lui $v0, 0x8010
  addiu $t3, $v0, -8024
  addiu $t2, $v1, -25304
  lwl $t0, 3($t3)
  lwr $t0, 0($t3)
  lwl $t1, 7($t3)
  lwr $t1, 4($t3)
  swl $t0, 3($t2)
  swr $t0, 0($t2)
  swl $t1, 7($t2)
  swr $t1, 4($t2)
  lwl $t0, 11($t3)
  lwr $t0, 8($t3)
  lwl $t1, 15($t3)
  lwr $t1, 12($t3)
  swl $t0, 11($t2)
  swr $t0, 8($t2)
  swl $t1, 15($t2)
  swr $t1, 12($t2)
  lwl $t0, 19($t3)
  lwr $t0, 16($t3)
  nop
  swl $t0, 19($t2)
  swr $t0, 16($t2)
  jal 0x80086dc8
  nop
  jal 0x80085740
  nop
  addu $a0, $zero, $zero
  jal 0x800855b0
  addu $a1, $a0, $zero
  jal 0x800878d0
  addiu $a0, $zero, 300
  jal 0x8003cbe8
  nop
  jal 0x8008b7b0
  addiu $a0, $zero, 1
  jal 0x800136e4
  nop
  jal 0x8008e5c0
  addiu $a0, $zero, 86
  lw $ra, 44($sp)
  lw $s4, 40($sp)
  lw $s3, 36($sp)
  lw $s2, 32($sp)
  lw $s1, 28($sp)
  lw $s0, 24($sp)
  jr $ra
  addiu $sp, $sp, 48
