.set noreorder
.set noat

.section .text.post_main_boot_helpers,"ax",@progbits
.align 2
.global boot_frame_counters
.global boot_frame_step
.global boot_frame_repeat
.global boot_wait_draw_gate

boot_frame_counters:
  lw $v0, 404($gp)
  nop
  addiu $v0, $v0, 1
  sw $v0, 404($gp)
  lw $v0, 444($gp)
  addiu $sp, $sp, -24
  sw $s0, 16($sp)
  addiu $v0, $v0, 1
  sw $v0, 444($gp)
  lw $v0, 448($gp)
  addiu $s0, $zero, 1
  sw $ra, 20($sp)
  sb $s0, 443($gp)
  addiu $v0, $v0, 1
  sw $v0, 448($gp)
  jal 0x8003cc38
  nop
  lbu $v0, 4($gp)
  nop
  bne $v0, $zero, boot_frame_counters_return
  nop
  sb $s0, 4($gp)
  jal 0x80047050
  nop
  sb $zero, 4($gp)
  sb $zero, 443($gp)

boot_frame_counters_return:
  lw $ra, 20($sp)
  lw $s0, 16($sp)
  jr $ra
  addiu $sp, $sp, 24

boot_frame_step:
  addiu $sp, $sp, -24
  sw $ra, 16($sp)
  jal 0x8001306c
  nop
  jal 0x80012db4
  nop
  jal 0x80012e5c
  nop
  jal 0x8003ccd8
  nop
  lw $ra, 16($sp)
  nop
  jr $ra
  addiu $sp, $sp, 24

boot_frame_repeat:
  addiu $sp, $sp, -24
  sw $s0, 16($sp)
  addu $s0, $a0, $zero
  sw $ra, 20($sp)

boot_frame_repeat_loop:
  jal 0x80012d4c
  addiu $s0, $s0, -1
  bne $s0, $zero, boot_frame_repeat_loop
  nop
  lw $ra, 20($sp)
  lw $s0, 16($sp)
  jr $ra
  addiu $sp, $sp, 24

boot_wait_draw_gate:
  lhu $v0, 400($gp)
  addiu $sp, $sp, -24
  andi $v0, $v0, 0x8000
  bne $v0, $zero, boot_wait_draw_gate_loop
  sw $ra, 16($sp)
  jal 0x8007f6cc
  addu $a0, $zero, $zero

boot_wait_draw_gate_loop:
  lbu $v1, 440($gp)
  lw $v0, 448($gp)
  nop
  slt $v0, $v0, $v1
  bne $v0, $zero, boot_wait_draw_gate_loop
  nop
  lw $v0, 448($gp)
  nop
  sb $v0, 441($gp)
  andi $v0, $v0, 0xff
  beq $v0, $zero, boot_wait_draw_gate_default_frame
  addiu $v0, $zero, 1
  sb $v0, 441($gp)

boot_wait_draw_gate_default_frame:
  lbu $v0, 441($gp)
  lui $v1, 0x800a
  lbu $v1, -20572($v1)
  addiu $v0, $v0, 1
  sw $v0, 464($gp)
  bne $v1, $zero, boot_wait_draw_gate_store_override
  addiu $a1, $zero, 2
  lbu $a1, 464($gp)

boot_wait_draw_gate_store_override:
  addiu $v0, $zero, -1
  lui $at, 0x800a
  sb $a1, -20573($at)
  lui $at, 0x800a
  sb $zero, -20572($at)
  sw $v0, 448($gp)
  jal 0x80074170
  addu $a0, $zero, $zero
  lw $v0, 452($gp)
  lw $ra, 16($sp)
  addiu $v0, $v0, 1
  sw $v0, 452($gp)
  jr $ra
  addiu $sp, $sp, 24
