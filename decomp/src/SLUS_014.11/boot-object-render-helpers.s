.set noreorder
.set noat

.section .text.boot_object_render_helpers,"ax",@progbits
.align 2
.global boot_object_render_helpers

boot_object_render_helpers:
L80016784:
  addiu $sp, $sp, -88
L80016788:
  sw $s6, 72($sp)
L8001678c:
  addu $s6, $a0, $zero
L80016790:
  sw $s7, 76($sp)
L80016794:
  addu $s7, $a1, $zero
L80016798:
  addiu $v0, $a2, 51
L8001679c:
  sltiu $v0, $v0, 371
L800167a0:
  sw $ra, 84($sp)
L800167a4:
  sw $fp, 80($sp)
L800167a8:
  sw $s5, 68($sp)
L800167ac:
  sw $s4, 64($sp)
L800167b0:
  sw $s3, 60($sp)
L800167b4:
  sw $s2, 56($sp)
L800167b8:
  sw $s1, 52($sp)
L800167bc:
  beq $v0, $zero, L80016cd4
L800167c0:
  sw $s0, 48($sp)
L800167c4:
  slti $v0, $a3, -59
L800167c8:
  bne $v0, $zero, L80016cd4
L800167cc:
  slti $v0, $a3, 240
L800167d0:
  beq $v0, $zero, L80016cd4
L800167d4:
  lui $s3, 0x1f80
L800167d8:
  ori $s3, $s3, 0x3e0
L800167dc:
  lui $s1, 0x1f80
L800167e0:
  ori $s1, $s1, 0x320
L800167e4:
  lui $s4, 0x1f80
L800167e8:
  ori $s4, $s4, 0x344
L800167ec:
  lui $a0, 0x1
L800167f0:
  lbu $a1, 106($s6)
L800167f4:
  lui $fp, 0x1f80
L800167f8:
  sh $a2, 8($s3)
L800167fc:
  sh $a3, 10($s3)
L80016800:
  lhu $v0, 20($s6)
L80016804:
  lw $v1, 4($s6)
L80016808:
  or $s5, $v0, $a0
L8001680c:
  sll $a0, $a1, 0x3
L80016810:
  subu $a0, $a0, $a1
L80016814:
  sll $a0, $a0, 0x2
L80016818:
  lui $v0, 0x801a
L8001681c:
  addiu $v0, $v0, 31448
L80016820:
  sw $v1, 0($s1)
L80016824:
  sw $v1, 0($fp)
L80016828:
  lhu $v1, 8($s6)
L8001682c:
  addu $a0, $a0, $v0
L80016830:
  sb $zero, 105($s6)
L80016834:
  andi $v1, $v1, 0x4
L80016838:
  beq $v1, $zero, L800168c4
L8001683c:
  sw $a0, 40($sp)
L80016840:
  addu $a0, $s6, $zero
L80016844:
  addu $a3, $fp, $zero
L80016848:
  ori $a3, $a3, 0x3e0
L8001684c:
  lui $v1, 0xf
L80016850:
  lhu $v0, 20($s6)
L80016854:
  lhu $a1, 8($s3)
L80016858:
  lhu $a2, 10($s3)
L8001685c:
  or $s5, $v0, $v1
L80016860:
  sll $a1, $a1, 0x10
L80016864:
  sra $a1, $a1, 0x10
L80016868:
  addiu $a1, $a1, 26
L8001686c:
  sll $a2, $a2, 0x10
L80016870:
  sra $a2, $a2, 0x10
L80016874:
  jal 0x80041f90
L80016878:
  addiu $a2, $a2, 30
L8001687c:
  bltz $v0, L80016cd4
L80016880:
  lui $a0, 0xff
L80016884:
  lw $v1, 12($s6)
L80016888:
  addiu $v0, $zero, 9
L8001688c:
  sb $v0, 3($s4)
L80016890:
  addiu $v0, $zero, 44
L80016894:
  sw $v1, 4($s4)
L80016898:
  sb $v0, 7($s4)
L8001689c:
  lw $v0, 32($s6)
L800168a0:
  ori $a0, $a0, 0xffff
L800168a4:
  and $v0, $v0, $a0
L800168a8:
  bne $v0, $zero, L800168c8
L800168ac:
  lui $v0, 0xf1
L800168b0:
  lw $v0, 0($s1)
L800168b4:
  sll $zero, $zero, 0x0
L800168b8:
  ori $v0, $v0, 0x80
L800168bc:
  sw $v0, 0($s1)
L800168c0:
  sw $v0, 0($fp)
L800168c4:
  lui $v0, 0xf1
L800168c8:
  addiu $v1, $zero, 30
L800168cc:
  sh $v1, 12($s1)
L800168d0:
  lw $v1, 12($s6)
L800168d4:
  ori $v0, $v0, 0x100
L800168d8:
  sw $v0, 16($s1)
L800168dc:
  sw $v1, 20($s1)
L800168e0:
  lbu $s2, 103($s6)
L800168e4:
  sll $zero, $zero, 0x0
L800168e8:
  beq $s2, $zero, L800169a8
L800168ec:
  slti $v0, $s2, 41
L800168f0:
  beq $v0, $zero, L80016c6c
L800168f4:
  lui $v1, 0x10
L800168f8:
  ori $v1, $v1, 0xc
L800168fc:
  lui $v0, 0x6666
L80016900:
  ori $v0, $v0, 0x6667
L80016904:
  addu $a0, $s1, $zero
L80016908:
  addu $a1, $s4, $zero
L8001690c:
  addu $a2, $s7, $zero
L80016910:
  addu $a3, $s5, $zero
L80016914:
  mult $s2, $v0
L80016918:
  addiu $v0, $zero, 112
L8001691c:
  sw $v1, 8($s1)
L80016920:
  sb $v0, 15($s1)
L80016924:
  sw $s3, 16($sp)
L80016928:
  lhu $v0, 8($s3)
L8001692c:
  lhu $v1, 10($s3)
L80016930:
  addiu $v0, $v0, 15
L80016934:
  addiu $v1, $v1, 15
L80016938:
  sh $v0, 4($s1)
L8001693c:
  sra $v0, $s2, 0x1f
L80016940:
  sh $v1, 6($s1)
L80016944:
  mfhi $t1
L80016948:
  sra $s0, $t1, 0x2
L8001694c:
  subu $s0, $s0, $v0
L80016950:
  sll $v0, $s0, 0x1
L80016954:
  addu $v0, $v0, $s0
L80016958:
  sll $v0, $v0, 0x2
L8001695c:
  jal 0x80042188
L80016960:
  sb $v0, 14($s1)
L80016964:
  addu $a0, $s1, $zero
L80016968:
  addu $a1, $s4, $zero
L8001696c:
  addu $a2, $s7, $zero
L80016970:
  addu $a3, $s5, $zero
L80016974:
  sll $v0, $s0, 0x2
L80016978:
  addu $v0, $v0, $s0
L8001697c:
  sll $v0, $v0, 0x1
L80016980:
  subu $v0, $s2, $v0
L80016984:
  sll $v1, $v0, 0x1
L80016988:
  addu $v1, $v1, $v0
L8001698c:
  lhu $v0, 4($s1)
L80016990:
  sll $v1, $v1, 0x2
L80016994:
  sb $v1, 14($s1)
L80016998:
  sw $s3, 16($sp)
L8001699c:
  addiu $v0, $v0, 12
L800169a0:
  j L80016c64
L800169a4:
  sh $v0, 4($s1)
L800169a8:
  lbu $v0, 105($s6)
L800169ac:
  sll $zero, $zero, 0x0
L800169b0:
  bne $v0, $zero, L80016c70
L800169b4:
  lui $v0, 0x3c
L800169b8:
  lui $v0, 0x10
L800169bc:
  ori $v0, $v0, 0x20
L800169c0:
  sw $v0, 8($s1)
L800169c4:
  addiu $v0, $zero, 24576
L800169c8:
  sh $v0, 14($s1)
L800169cc:
  lhu $v0, 8($s3)
L800169d0:
  lhu $v1, 10($s3)
L800169d4:
  addiu $v0, $v0, 10
L800169d8:
  addiu $v1, $v1, 40
L800169dc:
  sh $v0, 4($s1)
L800169e0:
  sh $v1, 6($s1)
L800169e4:
  lbu $v1, 104($s6)
L800169e8:
  addiu $v0, $zero, 21
L800169ec:
  beq $v1, $v0, L80016a54
L800169f0:
  slti $v0, $v1, 22
L800169f4:
  beq $v0, $zero, L80016a0c
L800169f8:
  addiu $v0, $zero, 20
L800169fc:
  beq $v1, $v0, L80016a28
L80016a00:
  lui $v0, 0x10
L80016a04:
  j L80016ac0
L80016a08:
  ori $v0, $v0, 0x8
L80016a0c:
  addiu $v0, $zero, 22
L80016a10:
  beq $v1, $v0, L80016a88
L80016a14:
  addiu $v0, $zero, 23
L80016a18:
  bne $v1, $v0, L80016abc
L80016a1c:
  lui $v0, 0x10
L80016a20:
  addiu $v0, $zero, 32
L80016a24:
  sb $v0, 14($s1)
L80016a28:
  addu $a0, $s1, $zero
L80016a2c:
  addu $a1, $s4, $zero
L80016a30:
  addu $a2, $s7, $zero
L80016a34:
  addu $a3, $s5, $zero
L80016a38:
  jal 0x80042188
L80016a3c:
  sw $s3, 16($sp)
L80016a40:
  lhu $v0, 18($s1)
L80016a44:
  sll $zero, $zero, 0x0
L80016a48:
  addiu $v0, $v0, 1
L80016a4c:
  j L80016bbc
L80016a50:
  sh $v0, 18($s1)
L80016a54:
  addu $a0, $s1, $zero
L80016a58:
  addu $a1, $s4, $zero
L80016a5c:
  addu $a2, $s7, $zero
L80016a60:
  addu $a3, $s5, $zero
L80016a64:
  addiu $v0, $zero, 64
L80016a68:
  sb $v0, 14($s1)
L80016a6c:
  jal 0x80042188
L80016a70:
  sw $s3, 16($sp)
L80016a74:
  lhu $v0, 18($s1)
L80016a78:
  sll $zero, $zero, 0x0
L80016a7c:
  addiu $v0, $v0, 2
L80016a80:
  j L80016bbc
L80016a84:
  sh $v0, 18($s1)
L80016a88:
  addu $a0, $s1, $zero
L80016a8c:
  addu $a1, $s4, $zero
L80016a90:
  addu $a2, $s7, $zero
L80016a94:
  addu $a3, $s5, $zero
L80016a98:
  addiu $v0, $zero, 96
L80016a9c:
  sb $v0, 14($s1)
L80016aa0:
  jal 0x80042188
L80016aa4:
  sw $s3, 16($sp)
L80016aa8:
  lhu $v0, 18($s1)
L80016aac:
  sll $zero, $zero, 0x0
L80016ab0:
  addiu $v0, $v0, 3
L80016ab4:
  j L80016bbc
L80016ab8:
  sh $v0, 18($s1)
L80016abc:
  ori $v0, $v0, 0x8
L80016ac0:
  addu $a0, $s1, $zero
L80016ac4:
  addu $a1, $s4, $zero
L80016ac8:
  addu $a2, $s7, $zero
L80016acc:
  addu $a3, $s5, $zero
L80016ad0:
  addiu $s2, $zero, 3
L80016ad4:
  sw $v0, 8($s1)
L80016ad8:
  lhu $v1, 8($s3)
L80016adc:
  addiu $v0, $zero, 28792
L80016ae0:
  sh $v0, 14($s1)
L80016ae4:
  sw $s3, 16($sp)
L80016ae8:
  addiu $v1, $v1, 5
L80016aec:
  jal 0x80042188
L80016af0:
  sh $v1, 4($s1)
L80016af4:
  lw $a0, 40($sp)
L80016af8:
  addiu $v0, $zero, 88
L80016afc:
  sb $v0, 15($s1)
L80016b00:
  lhu $v0, 8($s3)
L80016b04:
  addiu $v1, $zero, 8
L80016b08:
  sh $v1, 10($s1)
L80016b0c:
  addiu $v0, $v0, 14
L80016b10:
  jal L800170c8
L80016b14:
  sh $v0, 4($s1)
L80016b18:
  addu $s0, $v0, $zero
L80016b1c:
  sll $a0, $s0, 0x10
L80016b20:
  sra $a0, $a0, 0x10
L80016b24:
  addiu $a1, $zero, 4
L80016b28:
  jal 0x800357e8
L80016b2c:
  addiu $a2, $sp, 24
L80016b30:
  sra $a0, $s0, 0x10
L80016b34:
  addiu $a1, $zero, 4
L80016b38:
  jal 0x800357e8
L80016b3c:
  addiu $a2, $sp, 32
L80016b40:
  addu $a0, $s1, $zero
L80016b44:
  addu $a1, $s4, $zero
L80016b48:
  addu $a2, $s7, $zero
L80016b4c:
  addu $v0, $sp, $s2
L80016b50:
  lbu $v0, 24($v0)
L80016b54:
  addu $a3, $s5, $zero
L80016b58:
  sw $s3, 16($sp)
L80016b5c:
  sll $v0, $v0, 0x3
L80016b60:
  jal 0x80042188
L80016b64:
  sb $v0, 14($s1)
L80016b68:
  addu $a0, $s1, $zero
L80016b6c:
  addu $a1, $s4, $zero
L80016b70:
  addu $a2, $s7, $zero
L80016b74:
  lhu $v0, 6($s1)
L80016b78:
  addu $a3, $s5, $zero
L80016b7c:
  addiu $v0, $v0, 8
L80016b80:
  sh $v0, 6($s1)
L80016b84:
  addu $v0, $sp, $s2
L80016b88:
  lbu $v0, 32($v0)
L80016b8c:
  addiu $s2, $s2, -1
L80016b90:
  sw $s3, 16($sp)
L80016b94:
  sll $v0, $v0, 0x3
L80016b98:
  jal 0x80042188
L80016b9c:
  sb $v0, 14($s1)
L80016ba0:
  lhu $v0, 4($s1)
L80016ba4:
  lhu $v1, 6($s1)
L80016ba8:
  addiu $v0, $v0, 8
L80016bac:
  addiu $v1, $v1, -8
L80016bb0:
  sh $v0, 4($s1)
L80016bb4:
  bgez $s2, L80016b40
L80016bb8:
  sh $v1, 6($s1)
L80016bbc:
  lui $a0, 0x6666
L80016bc0:
  addiu $v0, $zero, 14
L80016bc4:
  sh $v0, 12($fp)
L80016bc8:
  lw $v0, 12($s6)
L80016bcc:
  ori $a0, $a0, 0x6667
L80016bd0:
  sw $v0, 20($fp)
L80016bd4:
  lhu $v0, 8($s3)
L80016bd8:
  lhu $v1, 10($s3)
L80016bdc:
  addiu $v0, $v0, 6
L80016be0:
  addiu $v1, $v1, 6
L80016be4:
  sh $v0, 4($fp)
L80016be8:
  sh $v1, 6($fp)
L80016bec:
  lw $t1, 40($sp)
L80016bf0:
  lui $t0, 0x20
L80016bf4:
  lbu $v1, 24($t1)
L80016bf8:
  ori $t0, $t0, 0x28
L80016bfc:
  sll $v1, $v1, 0x18
L80016c00:
  sra $s2, $v1, 0x18
L80016c04:
  mult $s2, $a0
L80016c08:
  addu $a1, $s4, $zero
L80016c0c:
  addu $a2, $s7, $zero
L80016c10:
  addu $a3, $s5, $zero
L80016c14:
  addiu $v0, $zero, 896
L80016c18:
  addu $a0, $fp, $zero
L80016c1c:
  sh $v0, 16($a0)
L80016c20:
  addiu $v0, $s2, 224
L80016c24:
  sra $v1, $v1, 0x1f
L80016c28:
  sw $t0, 8($a0)
L80016c2c:
  sw $s3, 16($sp)
L80016c30:
  sh $v0, 18($a0)
L80016c34:
  mfhi $t1
L80016c38:
  sra $t0, $t1, 0x1
L80016c3c:
  subu $t0, $t0, $v1
L80016c40:
  sll $v1, $t0, 0x2
L80016c44:
  addu $v1, $v1, $t0
L80016c48:
  subu $v1, $s2, $v1
L80016c4c:
  sll $v0, $v1, 0x2
L80016c50:
  addu $v0, $v0, $v1
L80016c54:
  sll $v0, $v0, 0x3
L80016c58:
  sll $t0, $t0, 0x5
L80016c5c:
  sb $v0, 14($a0)
L80016c60:
  sb $t0, 15($a0)
L80016c64:
  jal 0x80042188
L80016c68:
  sll $zero, $zero, 0x0
L80016c6c:
  lui $v0, 0x3c
L80016c70:
  ori $v0, $v0, 0x34
L80016c74:
  sw $v0, 8($s1)
L80016c78:
  lw $v1, 8($s3)
L80016c7c:
  ori $v0, $zero, 0x8000
L80016c80:
  sh $v0, 14($s1)
L80016c84:
  sw $v1, 4($s1)
L80016c88:
  lbu $v0, 103($s6)
L80016c8c:
  sll $zero, $zero, 0x0
L80016c90:
  beq $v0, $zero, L80016c9c
L80016c94:
  ori $v0, $zero, 0xc000
L80016c98:
  sh $v0, 14($s1)
L80016c9c:
  lbu $v0, 105($s6)
L80016ca0:
  sll $zero, $zero, 0x0
L80016ca4:
  beq $v0, $zero, L80016cbc
L80016ca8:
  lui $v1, 0xf1
L80016cac:
  ori $v1, $v1, 0x100
L80016cb0:
  ori $v0, $zero, 0x8038
L80016cb4:
  sh $v0, 14($s1)
L80016cb8:
  sw $v1, 16($s1)
L80016cbc:
  sw $s3, 16($sp)
L80016cc0:
  addu $a0, $s1, $zero
L80016cc4:
  addu $a1, $s4, $zero
L80016cc8:
  addu $a2, $s7, $zero
L80016ccc:
  jal 0x80042188
L80016cd0:
  addu $a3, $s5, $zero
L80016cd4:
  lw $ra, 84($sp)
L80016cd8:
  lw $fp, 80($sp)
L80016cdc:
  lw $s7, 76($sp)
L80016ce0:
  lw $s6, 72($sp)
L80016ce4:
  lw $s5, 68($sp)
L80016ce8:
  lw $s4, 64($sp)
L80016cec:
  lw $s3, 60($sp)
L80016cf0:
  lw $s2, 56($sp)
L80016cf4:
  lw $s1, 52($sp)
L80016cf8:
  lw $s0, 48($sp)
L80016cfc:
  jr $ra
L80016d00:
  addiu $sp, $sp, 88
L80016d04:
  addiu $sp, $sp, -24
L80016d08:
  sw $ra, 16($sp)
L80016d0c:
  lh $a2, 48($a0)
L80016d10:
  lh $a3, 50($a0)
L80016d14:
  jal L80016784
L80016d18:
  sll $zero, $zero, 0x0
L80016d1c:
  lw $ra, 16($sp)
L80016d20:
  sll $zero, $zero, 0x0
L80016d24:
  jr $ra
L80016d28:
  addiu $sp, $sp, 24
L80016d2c:
  addiu $sp, $sp, -48
L80016d30:
  sw $s2, 32($sp)
L80016d34:
  addu $s2, $a0, $zero
L80016d38:
  sw $s1, 28($sp)
L80016d3c:
  addu $s1, $a1, $zero
L80016d40:
  addu $a0, $a2, $zero
L80016d44:
  sw $s0, 24($sp)
L80016d48:
  addu $s0, $a3, $zero
L80016d4c:
  addu $a1, $s0, $zero
L80016d50:
  addiu $a2, $sp, 16
L80016d54:
  sw $ra, 44($sp)
L80016d58:
  sw $s4, 40($sp)
L80016d5c:
  jal 0x800357e8
L80016d60:
  sw $s3, 36($sp)
L80016d64:
  addiu $s0, $s0, -1
L80016d68:
  bltz $s0, L80016dbc
L80016d6c:
  addiu $s3, $sp, 16
L80016d70:
  lui $v0, 0x800f
L80016d74:
  addiu $s4, $v0, -25200
L80016d78:
  addu $v0, $s3, $s0
L80016d7c:
  lbu $v0, 0($v0)
L80016d80:
  sll $zero, $zero, 0x0
L80016d84:
  sll $v0, $v0, 0x3
L80016d88:
  sb $v0, 14($s1)
L80016d8c:
  lbu $v0, 23($s2)
L80016d90:
  lhu $a2, 20($s2)
L80016d94:
  sll $v0, $v0, 0x2
L80016d98:
  addu $v0, $v0, $s4
L80016d9c:
  lw $a1, 0($v0)
L80016da0:
  jal 0x800849f0
L80016da4:
  addu $a0, $s1, $zero
L80016da8:
  lhu $v0, 4($s1)
L80016dac:
  addiu $s0, $s0, -1
L80016db0:
  addiu $v0, $v0, 8
L80016db4:
  bgez $s0, L80016d78
L80016db8:
  sh $v0, 4($s1)
L80016dbc:
  lw $ra, 44($sp)
L80016dc0:
  lw $s4, 40($sp)
L80016dc4:
  lw $s3, 36($sp)
L80016dc8:
  lw $s2, 32($sp)
L80016dcc:
  lw $s1, 28($sp)
L80016dd0:
  lw $s0, 24($sp)
L80016dd4:
  jr $ra
L80016dd8:
  addiu $sp, $sp, 48
L80016ddc:
  lh $v1, 18($a0)
L80016de0:
  lh $v0, 20($a0)
L80016de4:
  sll $zero, $zero, 0x0
L80016de8:
  subu $v1, $v1, $v0
L80016dec:
  beq $v1, $zero, L80016e68
L80016df0:
  sll $zero, $zero, 0x0
L80016df4:
  bgez $v1, L80016e00
L80016df8:
  addu $a1, $v1, $zero
L80016dfc:
  subu $a1, $zero, $a1
L80016e00:
  slti $v0, $a1, 300
L80016e04:
  bne $v0, $zero, L80016e10
L80016e08:
  addiu $a2, $zero, 9
L80016e0c:
  addiu $a2, $zero, 19
L80016e10:
  slti $v0, $a1, 1000
L80016e14:
  bne $v0, $zero, L80016e20
L80016e18:
  slti $v0, $a1, 3000
L80016e1c:
  addiu $a2, $zero, 47
L80016e20:
  bne $v0, $zero, L80016e2c
L80016e24:
  sll $zero, $zero, 0x0
L80016e28:
  addiu $a2, $zero, 97
L80016e2c:
  blez $v1, L80016e48
L80016e30:
  sll $zero, $zero, 0x0
L80016e34:
  subu $v1, $v1, $a2
L80016e38:
  bgez $v1, L80016e58
L80016e3c:
  sll $zero, $zero, 0x0
L80016e40:
  j L80016e58
L80016e44:
  addu $v1, $zero, $zero
L80016e48:
  addu $v1, $v1, $a2
L80016e4c:
  blez $v1, L80016e58
L80016e50:
  sll $zero, $zero, 0x0
L80016e54:
  addu $v1, $zero, $zero
L80016e58:
  lhu $v0, 20($a0)
L80016e5c:
  sll $zero, $zero, 0x0
L80016e60:
  addu $v0, $v0, $v1
L80016e64:
  sh $v0, 18($a0)
L80016e68:
  jr $ra
L80016e6c:
  sll $zero, $zero, 0x0
L80016e70:
  addiu $sp, $sp, -40
L80016e74:
  sw $s0, 16($sp)
L80016e78:
  addu $s0, $a0, $zero
L80016e7c:
  lui $v0, 0x800f
L80016e80:
  sw $s2, 24($sp)
L80016e84:
  addiu $s2, $v0, -24592
L80016e88:
  addu $a0, $s2, $zero
L80016e8c:
  sw $ra, 36($sp)
L80016e90:
  sw $s4, 32($sp)
L80016e94:
  sw $s3, 28($sp)
L80016e98:
  jal L80016ddc
L80016e9c:
  sw $s1, 20($sp)
L80016ea0:
  jal L80016ddc
L80016ea4:
  addiu $a0, $s2, 32
L80016ea8:
  lui $s1, 0x1f80
L80016eac:
  ori $s1, $s1, 0x320
L80016eb0:
  lui $v1, 0xf1
L80016eb4:
  ori $v1, $v1, 0x100
L80016eb8:
  lui $a0, 0x8
L80016ebc:
  ori $a0, $a0, 0x8
L80016ec0:
  lui $s3, 0x80
L80016ec4:
  lw $s0, 80($s0)
L80016ec8:
  ori $s3, $s3, 0x8080
L80016ecc:
  sw $v1, 16($s1)
L80016ed0:
  lbu $v1, 717($gp)
L80016ed4:
  lui $v0, 0x900
L80016ed8:
  sw $v0, 0($s1)
L80016edc:
  addiu $v0, $zero, 30
L80016ee0:
  sh $v0, 12($s1)
L80016ee4:
  addiu $v0, $zero, 22528
L80016ee8:
  sh $v0, 14($s1)
L80016eec:
  sw $a0, 8($s1)
L80016ef0:
  bne $v1, $zero, L80016f04
L80016ef4:
  sw $s3, 20($s1)
L80016ef8:
  lui $v0, 0x40
L80016efc:
  ori $v0, $v0, 0x4040
L80016f00:
  sw $v0, 20($s1)
L80016f04:
  addu $a0, $s0, $zero
L80016f08:
  lui $a1, 0x1f80
L80016f0c:
  ori $a1, $a1, 0x320
L80016f10:
  lhu $v0, 48($s0)
L80016f14:
  addiu $a3, $zero, 4
L80016f18:
  addiu $v0, $v0, -3
L80016f1c:
  sh $v0, 4($s1)
L80016f20:
  lhu $v0, 50($s0)
L80016f24:
  lh $a2, 50($s2)
L80016f28:
  addiu $v0, $v0, -13
L80016f2c:
  jal L80016d2c
L80016f30:
  sh $v0, 6($s1)
L80016f34:
  addu $a0, $s0, $zero
L80016f38:
  lui $a1, 0x1f80
L80016f3c:
  ori $a1, $a1, 0x320
L80016f40:
  addiu $a3, $zero, 2
L80016f44:
  lhu $v0, 48($s0)
L80016f48:
  addiu $s4, $zero, 40
L80016f4c:
  addiu $v0, $v0, 14
L80016f50:
  sh $v0, 4($s1)
L80016f54:
  lb $a2, 56($s2)
L80016f58:
  lhu $v0, 50($s0)
L80016f5c:
  subu $a2, $s4, $a2
L80016f60:
  addiu $v0, $v0, -5
L80016f64:
  jal L80016d2c
L80016f68:
  sh $v0, 6($s1)
L80016f6c:
  lbu $v0, 717($gp)
L80016f70:
  sll $zero, $zero, 0x0
L80016f74:
  beq $v0, $zero, L80016f88
L80016f78:
  sw $s3, 20($s1)
L80016f7c:
  lui $v0, 0x40
L80016f80:
  ori $v0, $v0, 0x4040
L80016f84:
  sw $v0, 20($s1)
L80016f88:
  addu $a0, $s0, $zero
L80016f8c:
  lui $a1, 0x1f80
L80016f90:
  ori $a1, $a1, 0x320
L80016f94:
  lhu $v0, 48($s0)
L80016f98:
  addiu $a3, $zero, 4
L80016f9c:
  addiu $v0, $v0, -3
L80016fa0:
  sh $v0, 4($s1)
L80016fa4:
  lhu $v0, 50($s0)
L80016fa8:
  lh $a2, 18($s2)
L80016fac:
  addiu $v0, $v0, 13
L80016fb0:
  jal L80016d2c
L80016fb4:
  sh $v0, 6($s1)
L80016fb8:
  addu $a0, $s0, $zero
L80016fbc:
  lui $a1, 0x1f80
L80016fc0:
  ori $a1, $a1, 0x320
L80016fc4:
  lhu $v0, 48($a0)
L80016fc8:
  addiu $a3, $zero, 2
L80016fcc:
  addiu $v0, $v0, 14
L80016fd0:
  sh $v0, 4($s1)
L80016fd4:
  lb $a2, 24($s2)
L80016fd8:
  lhu $v0, 50($a0)
L80016fdc:
  subu $a2, $s4, $a2
L80016fe0:
  addiu $v0, $v0, 5
L80016fe4:
  jal L80016d2c
L80016fe8:
  sh $v0, 6($s1)
L80016fec:
  lw $ra, 36($sp)
L80016ff0:
  lw $s4, 32($sp)
L80016ff4:
  lw $s3, 28($sp)
L80016ff8:
  lw $s2, 24($sp)
L80016ffc:
  lw $s1, 20($sp)
L80017000:
  lw $s0, 16($sp)
L80017004:
  jr $ra
L80017008:
  addiu $sp, $sp, 40
L8001700c:
  lhu $v1, 22($a0)
L80017010:
  sll $zero, $zero, 0x0
L80017014:
  andi $v0, $v1, 0x8000
L80017018:
  beq $v0, $zero, L80017028
L8001701c:
  andi $v1, $v1, 0x4000
L80017020:
  beq $v1, $zero, L8001702c
L80017024:
  addiu $v0, $zero, 1
L80017028:
  addu $v0, $zero, $zero
L8001702c:
  jr $ra
L80017030:
  sll $zero, $zero, 0x0
L80017034:
  addu $a2, $a0, $zero
L80017038:
  lui $v1, 0x8009
L8001703c:
  lw $a0, 684($gp)
L80017040:
  addiu $v1, $v1, 2008
L80017044:
  lb $a1, 16($a0)
L80017048:
  lb $a0, 15($a0)
L8001704c:
  sll $v0, $a1, 0x2
L80017050:
  addu $v0, $v0, $a1
L80017054:
  addu $v0, $v0, $a0
L80017058:
  addu $v0, $v0, $v1
L8001705c:
  lbu $v0, 0($v0)
L80017060:
  sll $zero, $zero, 0x0
L80017064:
  sltiu $v0, $v0, 20
L80017068:
  bne $v0, $zero, L80017080
L8001706c:
  addiu $v1, $zero, 1
L80017070:
  lhu $v0, 22($a2)
L80017074:
  sll $zero, $zero, 0x0
L80017078:
  andi $v0, $v0, 0x1000
L8001707c:
  sltiu $v1, $v0, 1
L80017080:
  lui $v0, 0x800a
L80017084:
  lhu $v0, -19560($v0)
L80017088:
  sll $zero, $zero, 0x0
L8001708c:
  andi $v0, $v0, 0x10
L80017090:
  beq $v0, $zero, L800170c0
L80017094:
  sll $zero, $zero, 0x0
L80017098:
  lhu $v0, 22($a2)
L8001709c:
  sll $zero, $zero, 0x0
L800170a0:
  andi $v0, $v0, 0x8000
L800170a4:
  beq $v0, $zero, L800170c0
L800170a8:
  sll $zero, $zero, 0x0
L800170ac:
  beq $v1, $zero, L800170c0
L800170b0:
  sll $zero, $zero, 0x0
L800170b4:
  lh $v0, 12($a2)
L800170b8:
  jr $ra
L800170bc:
  sll $zero, $zero, 0x0
L800170c0:
  jr $ra
L800170c4:
  addu $v0, $zero, $zero
L800170c8:
  lh $v0, 14($a0)
L800170cc:
  lh $v1, 18($a0)
L800170d0:
  lh $a2, 20($a0)
L800170d4:
  addu $v0, $v0, $v1
L800170d8:
  addu $a1, $v0, $a2
L800170dc:
  bgez $a1, L800170ec
L800170e0:
  slti $v0, $a1, 10000
L800170e4:
  addu $a1, $zero, $zero
L800170e8:
  slti $v0, $a1, 10000
L800170ec:
  bne $v0, $zero, L800170f8
L800170f0:
  sll $zero, $zero, 0x0
L800170f4:
  addiu $a1, $zero, 9999
L800170f8:
  lh $v0, 16($a0)
L800170fc:
  sll $zero, $zero, 0x0
L80017100:
  addu $v0, $v0, $v1
L80017104:
  addu $v1, $v0, $a2
L80017108:
  bgez $v1, L80017118
L8001710c:
  slti $v0, $v1, 10000
L80017110:
  addu $v1, $zero, $zero
L80017114:
  slti $v0, $v1, 10000
L80017118:
  bne $v0, $zero, L80017124
L8001711c:
  sll $zero, $zero, 0x0
L80017120:
  addiu $v1, $zero, 9999
L80017124:
  sll $v0, $v1, 0x10
L80017128:
  jr $ra
L8001712c:
  or $v0, $v0, $a1
L80017130:
  addiu $sp, $sp, -24
L80017134:
  sw $s0, 16($sp)
L80017138:
  lui $s0, 0x800f
L8001713c:
  addiu $v0, $zero, 600
L80017140:
  sh $v0, 10312($s0)
L80017144:
  addiu $s0, $s0, 10312
L80017148:
  addiu $v0, $zero, 1024
L8001714c:
  sw $ra, 20($sp)
L80017150:
  sh $v0, 2($s0)
L80017154:
  addiu $v0, $zero, 256
L80017158:
  sh $v0, 4($s0)
L8001715c:
  addiu $v0, $zero, 300
L80017160:
  addiu $a0, $zero, 300
L80017164:
  sh $zero, 12($s0)
L80017168:
  sw $zero, 40($s0)
L8001716c:
  sw $zero, 44($s0)
L80017170:
  jal 0x800857c0
L80017174:
  sh $v0, 14($s0)
L80017178:
  addiu $v0, $s0, 16
L8001717c:
  sw $zero, 12($v0)
L80017180:
  sh $zero, 6($s0)
L80017184:
  sw $zero, 16($v0)
L80017188:
  sh $zero, 8($s0)
L8001718c:
  sw $zero, 20($v0)
L80017190:
  jal 0x8001352c
L80017194:
  sh $zero, 10($s0)
L80017198:
  lw $ra, 20($sp)
L8001719c:
  lw $s0, 16($sp)
L800171a0:
  jr $ra
L800171a4:
  addiu $sp, $sp, 24
L800171a8:
  addiu $sp, $sp, -32
L800171ac:
  sw $s1, 20($sp)
L800171b0:
  addu $s1, $a0, $zero
L800171b4:
  sltiu $v0, $a1, 13
L800171b8:
  sw $ra, 24($sp)
L800171bc:
  beq $v0, $zero, L80017548
L800171c0:
  sw $s0, 16($sp)
L800171c4:
  lui $v0, 0x8001
L800171c8:
  addiu $v0, $v0, 192
L800171cc:
  sll $v1, $a1, 0x2
L800171d0:
  addu $v1, $v1, $v0
L800171d4:
  lw $v0, 0($v1)
L800171d8:
  sll $zero, $zero, 0x0
L800171dc:
  jr $v0
L800171e0:
  sll $zero, $zero, 0x0
L800171e4:
  lui $a0, 0xffdd
L800171e8:
  ori $a0, $a0, 0xffff
L800171ec:
  addiu $v0, $zero, 768
L800171f0:
  sh $v0, 48($s1)
L800171f4:
  addiu $v0, $zero, 256
L800171f8:
  sh $v0, 50($s1)
L800171fc:
  addiu $v0, $zero, 64
L80017200:
  sh $v0, 4($s1)
L80017204:
  lui $v0, 0x800a
L80017208:
  lw $v0, -20236($v0)
L8001720c:
  addiu $v1, $zero, 16
L80017210:
  sh $v1, 6($s1)
L80017214:
  and $v0, $v0, $a0
L80017218:
  lui $at, 0x800a
L8001721c:
  sw $v0, -20236($at)
L80017220:
  lui $v0, 0x800a
L80017224:
  lw $v0, -20236($v0)
L80017228:
  lui $v1, 0x1
L8001722c:
  or $v0, $v0, $v1
L80017230:
  lui $at, 0x800a
L80017234:
  sw $v0, -20236($at)
L80017238:
  addiu $v0, $zero, 2
L8001723c:
  sb $v0, 70($s1)
L80017240:
  lui $v0, 0x800a
L80017244:
  lw $v0, -20200($v0)
L80017248:
  j L80017480
L8001724c:
  lui $v1, 0x2
L80017250:
  lui $a0, 0xffdc
L80017254:
  ori $a0, $a0, 0xffff
L80017258:
  addiu $v0, $zero, 8192
L8001725c:
  sw $v0, 28($s1)
L80017260:
  lui $v0, 0x800a
L80017264:
  lw $v0, -20236($v0)
L80017268:
  lui $v1, 0x800a
L8001726c:
  lw $v1, -20200($v1)
L80017270:
  j L800174b8
L80017274:
  and $v0, $v0, $a0
L80017278:
  lui $v0, 0x800f
L8001727c:
  addiu $a0, $v0, -25232
L80017280:
  lui $a1, 0x800a
L80017284:
  lw $a1, -20200($a1)
L80017288:
  addiu $v1, $zero, 256
L8001728c:
  sh $v1, -25232($v0)
L80017290:
  addiu $v0, $zero, 240
L80017294:
  sh $v0, 2($a0)
L80017298:
  addiu $v0, $zero, 16
L8001729c:
  sh $v1, 4($a0)
L800172a0:
  jal 0x80081de8
L800172a4:
  sh $v0, 6($a0)
L800172a8:
  lui $a0, 0xffdc
L800172ac:
  ori $a0, $a0, 0xffff
L800172b0:
  lui $v0, 0x8018
L800172b4:
  addiu $v0, $v0, -24104
L800172b8:
  sw $v0, 12($s1)
L800172bc:
  sw $v0, 8($s1)
L800172c0:
  lui $v0, 0x800a
L800172c4:
  lw $v0, -20236($v0)
L800172c8:
  j L80017400
L800172cc:
  addiu $v1, $zero, 10240
L800172d0:
  lui $a0, 0xffdc
L800172d4:
  ori $a0, $a0, 0xffff
L800172d8:
  lui $v0, 0x8018
L800172dc:
  addiu $v0, $v0, -15656
L800172e0:
  sw $v0, 12($s1)
L800172e4:
  sw $v0, 8($s1)
L800172e8:
  lui $v0, 0x800a
L800172ec:
  lw $v0, -20236($v0)
L800172f0:
  j L80017400
L800172f4:
  lui $v1, 0x1
L800172f8:
  lui $a0, 0xffdc
L800172fc:
  ori $a0, $a0, 0xffff
L80017300:
  lui $v0, 0x8018
L80017304:
  addiu $v0, $v0, -26152
L80017308:
  sw $v0, 12($s1)
L8001730c:
  sw $v0, 8($s1)
L80017310:
  lui $v0, 0x800a
L80017314:
  lw $v0, -20236($v0)
L80017318:
  j L80017400
L8001731c:
  addiu $v1, $zero, 2048
L80017320:
  lui $a0, 0xffdc
L80017324:
  ori $a0, $a0, 0xffff
L80017328:
  addiu $v0, $zero, 4096
L8001732c:
  sw $v0, 28($s1)
L80017330:
  lui $v0, 0x800a
L80017334:
  lw $v0, -20236($v0)
L80017338:
  lui $v1, 0x800a
L8001733c:
  lw $v1, -20200($v1)
L80017340:
  j L800174b8
L80017344:
  and $v0, $v0, $a0
L80017348:
  lui $v0, 0x800f
L8001734c:
  addiu $a0, $v0, -25232
L80017350:
  sh $zero, -25232($v0)
L80017354:
  addiu $v0, $zero, 240
L80017358:
  lui $a1, 0x800a
L8001735c:
  lw $a1, -20200($a1)
L80017360:
  addiu $s0, $zero, 256
L80017364:
  sh $v0, 2($a0)
L80017368:
  addiu $v0, $zero, 8
L8001736c:
  sh $s0, 4($a0)
L80017370:
  jal 0x80081de8
L80017374:
  sh $v0, 6($a0)
L80017378:
  lui $a0, 0xffdd
L8001737c:
  ori $a0, $a0, 0xffff
L80017380:
  addiu $v0, $zero, 512
L80017384:
  sh $v0, 48($s1)
L80017388:
  lui $v0, 0x800a
L8001738c:
  lw $v0, -20236($v0)
L80017390:
  addiu $v1, $zero, 64
L80017394:
  j L800174f8
L80017398:
  sh $s0, 50($s1)
L8001739c:
  lui $a0, 0xffdc
L800173a0:
  ori $a0, $a0, 0xffff
L800173a4:
  lui $v0, 0x1
L800173a8:
  ori $v0, $v0, 0x6000
L800173ac:
  sw $v0, 28($s1)
L800173b0:
  lui $v0, 0x800a
L800173b4:
  lw $v0, -20236($v0)
L800173b8:
  lui $v1, 0x8001
L800173bc:
  lw $v1, 476($v1)
L800173c0:
  j L800174b8
L800173c4:
  and $v0, $v0, $a0
L800173c8:
  lui $a0, 0xffdc
L800173cc:
  ori $a0, $a0, 0xffff
L800173d0:
  lui $v0, 0x801b
L800173d4:
  j L800173ec
L800173d8:
  addiu $v0, $v0, -32768
L800173dc:
  lui $a0, 0xffdc
L800173e0:
  ori $a0, $a0, 0xffff
L800173e4:
  lui $v0, 0x801b
L800173e8:
  addiu $v0, $v0, -26624
L800173ec:
  sw $v0, 12($s1)
L800173f0:
  sw $v0, 8($s1)
L800173f4:
  lui $v0, 0x800a
L800173f8:
  lw $v0, -20236($v0)
L800173fc:
  addiu $v1, $zero, 6144
L80017400:
  sw $v1, 28($s1)
L80017404:
  and $v0, $v0, $a0
L80017408:
  lui $at, 0x800a
L8001740c:
  sw $v0, -20236($at)
L80017410:
  addiu $v0, $zero, 1
L80017414:
  j L80017548
L80017418:
  sb $v0, 70($s1)
L8001741c:
  lui $a0, 0xffdd
L80017420:
  ori $a0, $a0, 0xffff
L80017424:
  addiu $v0, $zero, 832
L80017428:
  sh $v0, 48($s1)
L8001742c:
  addiu $v0, $zero, 64
L80017430:
  sh $v0, 4($s1)
L80017434:
  lui $v0, 0x800a
L80017438:
  lw $v0, -20236($v0)
L8001743c:
  addiu $v1, $zero, 16
L80017440:
  sh $v1, 6($s1)
L80017444:
  and $v0, $v0, $a0
L80017448:
  lui $at, 0x800a
L8001744c:
  sw $v0, -20236($at)
L80017450:
  lui $v0, 0x800a
L80017454:
  lw $v0, -20236($v0)
L80017458:
  lui $v1, 0x1
L8001745c:
  sh $zero, 50($s1)
L80017460:
  or $v0, $v0, $v1
L80017464:
  lui $at, 0x800a
L80017468:
  sw $v0, -20236($at)
L8001746c:
  addiu $v0, $zero, 2
L80017470:
  sb $v0, 70($s1)
L80017474:
  lui $v0, 0x800a
L80017478:
  lw $v0, -20200($v0)
L8001747c:
  addiu $v1, $zero, 16384
L80017480:
  sw $v1, 28($s1)
L80017484:
  sw $v0, 8($s1)
L80017488:
  addiu $v0, $v0, 2048
L8001748c:
  j L80017548
L80017490:
  sw $v0, 12($s1)
L80017494:
  lui $a0, 0xffdc
L80017498:
  ori $a0, $a0, 0xffff
L8001749c:
  addiu $v0, $zero, 10240
L800174a0:
  sw $v0, 28($s1)
L800174a4:
  lui $v0, 0x800a
L800174a8:
  lw $v0, -20236($v0)
L800174ac:
  lui $v1, 0x8001
L800174b0:
  lw $v1, 0($v1)
L800174b4:
  and $v0, $v0, $a0
L800174b8:
  lui $at, 0x800a
L800174bc:
  sw $v0, -20236($at)
L800174c0:
  addiu $v0, $zero, 1
L800174c4:
  sw $v1, 12($s1)
L800174c8:
  sw $v1, 8($s1)
L800174cc:
  j L80017548
L800174d0:
  sb $v0, 70($s1)
L800174d4:
  lui $a0, 0xffdd
L800174d8:
  ori $a0, $a0, 0xffff
L800174dc:
  addiu $v0, $zero, 640
L800174e0:
  sh $v0, 48($s1)
L800174e4:
  addiu $v0, $zero, 256
L800174e8:
  sh $v0, 50($s1)
L800174ec:
  lui $v0, 0x800a
L800174f0:
  lw $v0, -20236($v0)
L800174f4:
  addiu $v1, $zero, 64
L800174f8:
  sh $v1, 4($s1)
L800174fc:
  and $v0, $v0, $a0
L80017500:
  lui $at, 0x800a
L80017504:
  sw $v0, -20236($at)
L80017508:
  lui $v0, 0x800a
L8001750c:
  lw $v0, -20236($v0)
L80017510:
  lui $a0, 0x1
L80017514:
  sw $a0, 28($s1)
L80017518:
  or $v0, $v0, $a0
L8001751c:
  lui $at, 0x800a
L80017520:
  sw $v0, -20236($at)
L80017524:
  addiu $v0, $zero, 2
L80017528:
  sb $v0, 70($s1)
L8001752c:
  lui $v1, 0x800a
L80017530:
  lw $v1, -20200($v1)
L80017534:
  addiu $v0, $zero, 16
L80017538:
  sh $v0, 6($s1)
L8001753c:
  sw $v1, 8($s1)
L80017540:
  addiu $v1, $v1, 2048
L80017544:
  sw $v1, 12($s1)
L80017548:
  lw $ra, 24($sp)
L8001754c:
  lw $s1, 20($sp)
L80017550:
  lw $s0, 16($sp)
L80017554:
  jr $ra
L80017558:
  addiu $sp, $sp, 32
