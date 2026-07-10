.set noreorder
.set noat

.section .text.boot_status_renderer,"ax",@progbits
.align 2
.global boot_status_renderer

boot_status_renderer:
  lbu $v0, 416($gp)
  addiu $sp, $sp, -40
  sw $ra, 32($sp)
  sw $s3, 28($sp)
  sw $s2, 24($sp)
  sw $s1, 20($sp)
  bne $v0, $zero, boot_status_renderer_after_initial_status
  sw $s0, 16($sp)
  lui $v0, 0x8010
  lbu $v1, 456($gp)
  lbu $a0, 421($gp)
  lui $a1, 0x800a
  lbu $a1, -20156($a1)
  lui $a2, 0x800a
  lbu $a2, -20157($a2)
  lui $a3, 0x800a
  lbu $a3, -20158($a3)
  addiu $v0, $v0, -8120
  sb $v1, 24($v0)
  sb $a0, 22($v0)
  sb $a1, 25($v0)
  sb $a2, 26($v0)
  jal 0x80085500
  sb $a3, 27($v0)
  lhu $v0, 400($gp)
  nop
  andi $v0, $v0, 0x2000
  beq $v0, $zero, boot_status_renderer_after_initial_status
  lui $a0, 0x800f
  jal 0x8007fefc
  addiu $a0, $a0, -25304

boot_status_renderer_after_initial_status:
  jal 0x8007f350
  addiu $a0, $zero, 1
  lui $v0, 0x800a
  lbu $v0, -19688($v0)
  nop
  andi $v0, $v0, 0x80
  beq $v0, $zero, boot_status_renderer_check_secondary_status
  nop
  jal 0x800359b0
  nop
  lui $v0, 0x800a
  lbu $v0, -19688($v0)
  nop
  andi $v0, $v0, 0x80
  bne $v0, $zero, boot_status_renderer_after_status_cards
  nop

boot_status_renderer_check_secondary_status:
  lui $v0, 0x800a
  lbu $v0, -20159($v0)
  nop
  beq $v0, $zero, boot_status_renderer_after_status_cards
  nop
  lw $a1, 428($gp)
  nop
  addiu $a0, $a1, 20772
  jal 0x80085e10
  addiu $a1, $a1, 20752
  lui $v0, 0x800a
  lbu $v0, -20159($v0)
  nop
  andi $v0, $v0, 0x80
  bne $v0, $zero, boot_status_renderer_draw_status_base
  nop
  lw $a1, 428($gp)
  nop
  addiu $a0, $a1, 20792
  jal 0x80085e10
  addiu $a1, $a1, 20752
  lw $a1, 428($gp)
  nop
  addiu $a0, $a1, 20812
  jal 0x80085e10
  addiu $a1, $a1, 20752

boot_status_renderer_draw_status_base:
  lw $a0, 428($gp)
  jal 0x80085d80
  addiu $a0, $a0, 20752

boot_status_renderer_after_status_cards:
  jal 0x80085320
  addiu $s1, $zero, 3
  addiu $s3, $gp, 408
  sb $v0, 420($gp)
  andi $v1, $v0, 0xff
  sll $a0, $v1, 4
  addu $a0, $a0, $v1
  sllv $a0, $a0, $s1
  addu $a0, $a0, $v1
  sll $a0, $a0, 2
  subu $a0, $a0, $v1
  sllv $a0, $a0, $s1
  subu $a0, $a0, $v1
  sll $a0, $a0, 5
  lui $at, 0x800a
  sb $v0, -20574($at)
  lui $v0, 0x800a
  addiu $v0, $v0, 22376
  addu $a0, $a0, $v0
  sll $v0, $v1, 2
  addu $v0, $v0, $v1
  sll $v0, $v0, 2
  addu $v0, $v0, $v1
  sll $v1, $v0, 5
  subu $v1, $v1, $v0
  sll $v1, $v1, 5
  lui $v0, 0x800a
  addiu $v0, $v0, -19288
  addu $v1, $v1, $v0
  sw $v1, 428($gp)
  jal 0x800862c0
  addiu $s2, $zero, 20812
  lui $v0, 0x800f
  addiu $v0, $v0, -25200
  addiu $s0, $v0, 12
  addu $a0, $zero, $zero

boot_status_renderer_slot_loop:
  addu $a1, $a0, $zero
  addu $v0, $s1, $s3
  lw $a2, 428($gp)
  addiu $s1, $s1, -1
  addu $a2, $a2, $s2
  sw $a2, 0($s0)
  addiu $s0, $s0, -4
  lbu $v0, 0($v0)
  addiu $s2, $s2, -20
  jal 0x80085db0
  sw $v0, 0($a2)
  bgez $s1, boot_status_renderer_slot_loop
  addu $a0, $zero, $zero
  lw $ra, 32($sp)
  lw $s3, 28($sp)
  lw $s2, 24($sp)
  lw $s1, 20($sp)
  lw $s0, 16($sp)
  jr $ra
  addiu $sp, $sp, 40
