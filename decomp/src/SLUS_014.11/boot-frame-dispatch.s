.set noreorder
.set noat

.section .text.boot_frame_dispatch,"ax",@progbits
.align 2
.global boot_frame_dispatch

boot_frame_dispatch:
  addiu $sp, $sp, -32
  sw $ra, 24($sp)
  sw $s1, 20($sp)
  jal 0x800154e4
  sw $s0, 16($sp)
  jal 0x80041340
  addu $s1, $zero, $zero
  lui $v0, 0x800f
  addiu $s0, $v0, -25168

boot_frame_dispatch_callback_loop:
  lw $v0, 0($s0)
  nop
  beq $v0, $zero, boot_frame_dispatch_after_callback
  nop
  jalr $ra, $v0
  nop

boot_frame_dispatch_after_callback:
  addiu $s1, $s1, 1
  slti $v0, $s1, 4
  bne $v0, $zero, boot_frame_dispatch_callback_loop
  addiu $s0, $s0, 4
  lw $v0, 432($gp)
  nop
  beq $v0, $zero, boot_frame_dispatch_after_gp_callback
  nop
  jalr $ra, $v0
  nop

boot_frame_dispatch_after_gp_callback:
  lw $v0, 424($gp)
  lw $v1, 412($gp)
  nop
  slt $v0, $v0, $v1
  bne $v0, $zero, boot_frame_dispatch_reset_timer
  nop
  lw $v0, 436($gp)
  lw $v1, 460($gp)
  nop
  slt $v0, $v0, $v1
  bne $v0, $zero, boot_frame_dispatch_reset_timer
  nop
  lw $v0, 0($gp)
  nop
  addiu $v0, $v0, -1
  sw $v0, 0($gp)
  bgez $v0, boot_frame_dispatch_after_timer_reset
  nop

boot_frame_dispatch_reset_timer:
  lw $v0, 412($gp)
  lw $a0, 460($gp)
  addiu $v1, $zero, 60
  sw $v1, 0($gp)
  sw $v0, 424($gp)
  sw $a0, 436($gp)

boot_frame_dispatch_after_timer_reset:
  jal 0x80014a5c
  addu $a0, $zero, $zero
  jal 0x800136d4
  nop
  lw $ra, 24($sp)
  lw $s1, 20($sp)
  lw $s0, 16($sp)
  jr $ra
  addiu $sp, $sp, 32
