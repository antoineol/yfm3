.set noreorder
.set noat

.section .text.boot_input_helpers,"ax",@progbits
.align 2
.global boot_input_position_loop
.global boot_callback_slots_clear

boot_input_position_loop:
  lhu $v0, 400($gp)
  addiu $sp, $sp, -24
  sw $s0, 16($sp)
  lui $s0, 0x800f
  sh $zero, -25304($s0)
  addiu $s0, $s0, -25304
  sw $ra, 20($sp)
  sh $zero, 2($s0)
  ori $v0, $v0, 0x2000
  sh $v0, 400($gp)
  j boot_input_position_loop_frame
  nop

boot_input_position_loop_poll:
  lui $v0, 0x800a
  lhu $v0, -19548($v0)
  nop
  andi $v0, $v0, 0xf000
  beq $v0, $zero, boot_input_position_loop_apply
  nop
  lui $v0, 0x800a
  lhu $v0, -19548($v0)
  nop
  andi $v0, $v0, 0x40
  beq $v0, $zero, boot_input_position_loop_use_slow_step
  addiu $v1, $zero, 2
  addiu $v1, $zero, 4

boot_input_position_loop_use_slow_step:
  lui $v0, 0x800a
  lhu $v0, -19548($v0)
  nop
  andi $v0, $v0, 0x2000
  beq $v0, $zero, boot_input_position_loop_check_right
  nop
  lhu $v0, 0($s0)
  nop
  addu $v0, $v0, $v1
  sh $v0, 0($s0)

boot_input_position_loop_check_right:
  lui $v0, 0x800a
  lhu $v0, -19548($v0)
  nop
  andi $v0, $v0, 0x8000
  beq $v0, $zero, boot_input_position_loop_check_up
  nop
  lhu $v0, 0($s0)
  nop
  subu $v0, $v0, $v1
  sh $v0, 0($s0)

boot_input_position_loop_check_up:
  lui $v0, 0x800a
  lhu $v0, -19548($v0)
  nop
  andi $v0, $v0, 0x1000
  beq $v0, $zero, boot_input_position_loop_check_down
  nop
  lhu $v0, 2($s0)
  nop
  subu $v0, $v0, $v1
  sh $v0, 2($s0)

boot_input_position_loop_check_down:
  lui $v0, 0x800a
  lhu $v0, -19548($v0)
  nop
  andi $v0, $v0, 0x4000
  beq $v0, $zero, boot_input_position_loop_apply
  nop
  lhu $v0, 2($s0)
  nop
  addu $v0, $v0, $v1
  sh $v0, 2($s0)

boot_input_position_loop_apply:
  jal 0x8007ec68
  addiu $a0, $zero, -1

boot_input_position_loop_frame:
  jal 0x80012d4c
  nop
  lui $v0, 0x800a
  lhu $v0, -19560($v0)
  nop
  andi $v0, $v0, 0x800
  beq $v0, $zero, boot_input_position_loop_poll
  nop
  lhu $v0, 400($gp)
  nop
  andi $v0, $v0, 0xdfff
  sh $v0, 400($gp)
  jal 0x8003cb7c
  nop
  lw $ra, 20($sp)
  lw $s0, 16($sp)
  jr $ra
  addiu $sp, $sp, 24

boot_callback_slots_clear:
  addiu $v1, $zero, 3
  lui $v0, 0x800f
  addiu $v0, $v0, -25168
  addiu $v0, $v0, 12

boot_callback_slots_clear_loop:
  sw $zero, 0($v0)
  addiu $v1, $v1, -1
  bgez $v1, boot_callback_slots_clear_loop
  addiu $v0, $v0, -4
  sw $zero, 432($gp)
  jr $ra
  nop
