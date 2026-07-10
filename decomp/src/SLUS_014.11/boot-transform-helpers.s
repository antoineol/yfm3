.set noreorder
.set noat

.section .text.boot_transform_helpers,"ax",@progbits
.align 2
.global boot_apply_object_offset
.global boot_rotate_status_object_a
.global boot_rotate_status_object_b
.global boot_frame_draw_hook

boot_apply_object_offset:
  addiu $sp, $sp, -24
  addu $v1, $a0, $zero
  addiu $a0, $v1, 16
  sw $ra, 16($sp)
  lw $v0, 12($a0)
  nop
  addu $a1, $a1, $v0
  sw $a1, 16($v1)
  lw $v0, 16($a0)
  lw $v1, 20($a0)
  addu $a2, $a2, $v0
  addu $a3, $a3, $v1
  sw $a2, 4($a0)
  jal 0x8008ad50
  sw $a3, 8($a0)
  lw $ra, 16($sp)
  nop
  jr $ra
  addiu $sp, $sp, 24

boot_rotate_status_object_a:
  addiu $sp, $sp, -40
  lui $v0, 0x800f
  sw $s2, 24($sp)
  addiu $s2, $v0, 10312
  lh $v0, 10312($v0)
  sw $ra, 32($sp)
  sw $s3, 28($sp)
  sw $s1, 20($sp)
  sw $s0, 16($sp)
  lh $a0, 4($s2)
  jal 0x80086770
  subu $s1, $zero, $v0
  mult $s1, $v0
  mflo $v0
  bgez $v0, boot_rotate_status_object_a_positive_x_cos
  nop
  addiu $v0, $v0, 4095

boot_rotate_status_object_a_positive_x_cos:
  lh $a0, 4($s2)
  jal 0x800866a0
  sra $s0, $v0, 12
  mult $s1, $v0
  mflo $v0
  bgez $v0, boot_rotate_status_object_a_positive_x_sin
  nop
  addiu $v0, $v0, 4095

boot_rotate_status_object_a_positive_x_sin:
  lh $a0, 2($s2)
  jal 0x800866a0
  sra $s3, $v0, 12
  mult $s0, $v0
  mflo $a3
  bgez $a3, boot_rotate_status_object_a_positive_y_sin
  nop
  addiu $a3, $a3, 4095

boot_rotate_status_object_a_positive_y_sin:
  lh $a0, 2($s2)
  jal 0x80086770
  sra $s1, $a3, 12
  mult $s0, $v0
  mflo $a1
  bgez $a1, boot_rotate_status_object_a_apply
  addu $a0, $s2, $zero
  addiu $a1, $a1, 4095

boot_rotate_status_object_a_apply:
  sra $a1, $a1, 12
  addu $a2, $s3, $zero
  jal 0x800134e0
  addu $a3, $s1, $zero
  lw $ra, 32($sp)
  lw $s3, 28($sp)
  lw $s2, 24($sp)
  lw $s1, 20($sp)
  lw $s0, 16($sp)
  jr $ra
  addiu $sp, $sp, 40

boot_rotate_status_object_b:
  addiu $sp, $sp, -40
  lui $v0, 0x800f
  sw $s2, 24($sp)
  addiu $s2, $v0, 10312
  lh $v0, 10312($v0)
  sw $ra, 32($sp)
  sw $s3, 28($sp)
  sw $s1, 20($sp)
  sw $s0, 16($sp)
  lh $a0, 2($s2)
  jal 0x80086770
  subu $s1, $zero, $v0
  mult $s1, $v0
  mflo $v0
  bgez $v0, boot_rotate_status_object_b_positive_y_cos
  nop
  addiu $v0, $v0, 4095

boot_rotate_status_object_b_positive_y_cos:
  lh $a0, 2($s2)
  jal 0x800866a0
  sra $s0, $v0, 12
  mult $s1, $v0
  mflo $v0
  bgez $v0, boot_rotate_status_object_b_positive_y_sin
  nop
  addiu $v0, $v0, 4095

boot_rotate_status_object_b_positive_y_sin:
  lh $a0, 4($s2)
  sra $s3, $v0, 12
  jal 0x800866a0
  addiu $a0, $a0, 1024
  mult $s0, $v0
  mflo $a2
  bgez $a2, boot_rotate_status_object_b_positive_x_sin
  nop
  addiu $a2, $a2, 4095

boot_rotate_status_object_b_positive_x_sin:
  lh $a0, 4($s2)
  sra $s1, $a2, 12
  jal 0x80086770
  addiu $a0, $a0, 1024
  mult $s0, $v0
  mflo $a1
  bgez $a1, boot_rotate_status_object_b_apply
  addu $a0, $s2, $zero
  addiu $a1, $a1, 4095

boot_rotate_status_object_b_apply:
  sra $a1, $a1, 12
  addu $a2, $s1, $zero
  jal 0x800134e0
  addu $a3, $s3, $zero
  lw $ra, 32($sp)
  lw $s3, 28($sp)
  lw $s2, 24($sp)
  lw $s1, 20($sp)
  lw $s0, 16($sp)
  jr $ra
  addiu $sp, $sp, 40

boot_frame_draw_hook:
  addiu $sp, $sp, -16
  addiu $sp, $sp, 16
  jr $ra
  nop
