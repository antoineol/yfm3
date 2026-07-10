.set noreorder
.set noat

.section .text.main_boot,"ax",@progbits
.align 2
.global main_boot

main_boot:
  addiu $sp, $sp, -24
  sw $ra, 20($sp)
  jal 0x80012a78
  sw $s0, 16($sp)
  jal 0x800738b0
  nop
  jal 0x80074390
  nop
  jal 0x800854c0
  nop
  jal 0x800738c0
  nop
  jal 0x80074484
  nop
  jal 0x80073850
  addiu $a0, $zero, 2
  jal 0x8007f634
  addu $a0, $zero, $zero
  jal 0x80015d0c
  nop
  lui $a0, 0x800a
  addiu $a0, $a0, -19288
  addiu $v1, $zero, 1
  sw $zero, 452($gp)
  sw $zero, 448($gp)
  sb $zero, 440($gp)
  sw $zero, 404($gp)
  lw $a1, 404($gp)
  addiu $v0, $zero, 0x5000
  sb $zero, 443($gp)
  sb $zero, 441($gp)
  sw $v1, 464($gp)
  sh $v0, 400($gp)
  sb $zero, 457($gp)
  lui $at, 0x800a
  sb $v1, -19920($at)
  sw $a0, 428($gp)
  sw $a1, 444($gp)
  jal 0x80013154
  nop
  jal 0x800403f0
  nop
  jal 0x800151b0
  nop
  jal 0x800134b4
  nop
  jal 0x80035a58
  nop
  jal 0x80035a64
  nop
  jal 0x8003b5c8
  nop
  lui $v0, 0x800f
  lbu $a0, -24896($v0)
  jal 0x80046768
  nop
  lui $a0, 0x8001
  jal 0x80074420
  addiu $a0, $a0, 11476
  jal 0x8003fe80
  nop
  lui $a0, 0x5555
  jal 0x8008e5c0
  ori $a0, $a0, 0x5555
  jal 0x8007f634
  addiu $a0, $zero, 1
  jal 0x8002cd8c
  nop
  jal 0x8002cd8c
  nop
  jal 0x80043960
  addu $a0, $zero, $zero
  lui $a0, 0x800f
  jal 0x8008fb50
  addiu $a0, $a0, -25152
  jal 0x8002cd8c
  addu $s0, $v0, $zero
  beq $s0, $zero, main_boot_no_save_probe
  nop
  jal 0x8005b85c
  nop
  jal 0x800137e4
  nop

main_boot_no_save_probe:
  jal 0x80043bcc
  nop
  jal 0x8002d458
  addu $a0, $v0, $zero
  addiu $v0, $zero, 8
  lui $at, 0x800a
  sb $v0, -19863($at)
  jal 0x8002dd74
  nop
  lw $ra, 20($sp)
  lw $s0, 16($sp)
  addu $v0, $zero, $zero
  jr $ra
  addiu $sp, $sp, 24
