.set noreorder
.set noat

.section .text.boot_scene_late_runtime_helpers,"ax",@progbits
.align 2
.global boot_scene_late_runtime_helpers

boot_scene_late_runtime_helpers:
L800208d4:
  lhu $a0, 818($gp)
L800208d8:
  addiu $sp, $sp, -32
L800208dc:
  andi $v0, $a0, 0x8000
L800208e0:
  bne $v0, $zero, L8002091c
L800208e4:
  sw $ra, 24($sp)
L800208e8:
  lbu $v1, 717($gp)
L800208ec:
  ori $v0, $a0, 0x8000
L800208f0:
  sh $v0, 818($gp)
L800208f4:
  beq $v1, $zero, L80020900
L800208f8:
  addiu $a3, $zero, 3072
L800208fc:
  addiu $a3, $zero, 1024
L80020900:
  addiu $a0, $zero, 48
L80020904:
  addiu $a1, $zero, 600
L80020908:
  addiu $a2, $zero, 256
L8002090c:
  jal L80022d94
L80020910:
  sw $zero, 16($sp)
L80020914:
  addiu $v0, $zero, 16
L80020918:
  sh $v0, 602($gp)
L8002091c:
  lhu $v0, 602($gp)
L80020920:
  sll $zero, $zero, 0x0
L80020924:
  bne $v0, $zero, L80020978
L80020928:
  sll $zero, $zero, 0x0
L8002092c:
  lbu $v0, 717($gp)
L80020930:
  sll $zero, $zero, 0x0
L80020934:
  xori $v0, $v0, 0x1
L80020938:
  sb $v0, 717($gp)
L8002093c:
  andi $a0, $v0, 0xff
L80020940:
  addiu $v0, $zero, 2
L80020944:
  sll $v1, $a0, 0x5
L80020948:
  sh $v0, 818($gp)
L8002094c:
  lui $v0, 0x800f
L80020950:
  addiu $v0, $v0, -24592
L80020954:
  addu $v1, $v1, $v0
L80020958:
  sll $v0, $a0, 0x2
L8002095c:
  addu $v0, $v0, $a0
L80020960:
  sll $v0, $v0, 0x2
L80020964:
  sw $v1, 704($gp)
L80020968:
  lui $v1, 0x8009
L8002096c:
  addiu $v1, $v1, 2008
L80020970:
  addu $v0, $v0, $v1
L80020974:
  sw $v0, 804($gp)
L80020978:
  lw $ra, 24($sp)
L8002097c:
  sll $zero, $zero, 0x0
L80020980:
  jr $ra
L80020984:
  addiu $sp, $sp, 32
L80020988:
  lbu $v1, 586($gp)
L8002098c:
  addiu $sp, $sp, -56
L80020990:
  sw $ra, 48($sp)
L80020994:
  sw $s3, 44($sp)
L80020998:
  sw $s2, 40($sp)
L8002099c:
  sw $s1, 36($sp)
L800209a0:
  andi $v0, $v1, 0x80
L800209a4:
  bne $v0, $zero, L80020aa8
L800209a8:
  sw $s0, 32($sp)
L800209ac:
  ori $v0, $v1, 0x80
L800209b0:
  sb $v0, 586($gp)
L800209b4:
  jal 0x8004002c
L800209b8:
  addiu $s2, $zero, 1
L800209bc:
  addu $a0, $v0, $zero
L800209c0:
  jal 0x800400ac
L800209c4:
  addiu $a1, $zero, 2
L800209c8:
  addu $s3, $v0, $zero
L800209cc:
  addu $a0, $s3, $zero
L800209d0:
  addiu $a3, $zero, 3
L800209d4:
  addiu $s1, $zero, 11
L800209d8:
  lw $v0, 708($gp)
L800209dc:
  addiu $s0, $zero, 524
L800209e0:
  lh $a1, 48($v0)
L800209e4:
  lh $a2, 50($v0)
L800209e8:
  addiu $v0, $zero, 2
L800209ec:
  sw $s2, 16($sp)
L800209f0:
  sw $v0, 20($sp)
L800209f4:
  sw $s1, 24($sp)
L800209f8:
  sw $s0, 28($sp)
L800209fc:
  addiu $a1, $a1, -8
L80020a00:
  jal 0x800404cc
L80020a04:
  addiu $a2, $a2, 30
L80020a08:
  jal 0x80042918
L80020a0c:
  addu $a0, $s3, $zero
L80020a10:
  addu $a0, $s3, $zero
L80020a14:
  jal 0x800428ec
L80020a18:
  addiu $a1, $zero, 10
L80020a1c:
  lhu $v0, 8($s3)
L80020a20:
  sll $zero, $zero, 0x0
L80020a24:
  ori $v0, $v0, 0x28
L80020a28:
  sh $v0, 8($s3)
L80020a2c:
  sw $s3, 640($gp)
L80020a30:
  jal 0x8004002c
L80020a34:
  sll $zero, $zero, 0x0
L80020a38:
  addu $a0, $v0, $zero
L80020a3c:
  jal 0x800400ac
L80020a40:
  addiu $a1, $zero, 2
L80020a44:
  addu $s3, $v0, $zero
L80020a48:
  lw $v0, 708($gp)
L80020a4c:
  addu $a0, $s3, $zero
L80020a50:
  lh $a1, 48($v0)
L80020a54:
  lh $a2, 50($v0)
L80020a58:
  addiu $a3, $zero, 3
L80020a5c:
  sw $s2, 16($sp)
L80020a60:
  sw $zero, 20($sp)
L80020a64:
  sw $s1, 24($sp)
L80020a68:
  sw $s0, 28($sp)
L80020a6c:
  addiu $a1, $a1, 60
L80020a70:
  jal 0x800404cc
L80020a74:
  addiu $a2, $a2, 30
L80020a78:
  jal 0x80042918
L80020a7c:
  addu $a0, $s3, $zero
L80020a80:
  addu $a0, $s3, $zero
L80020a84:
  jal 0x800428ec
L80020a88:
  addiu $a1, $zero, 10
L80020a8c:
  lhu $v1, 8($s3)
L80020a90:
  sll $zero, $zero, 0x0
L80020a94:
  ori $v1, $v1, 0x28
L80020a98:
  sh $v1, 8($s3)
L80020a9c:
  sw $s3, 644($gp)
L80020aa0:
  j L80020bc8
L80020aa4:
  addu $v0, $zero, $zero
L80020aa8:
  lw $s3, 708($gp)
L80020aac:
  andi $v0, $v1, 0x40
L80020ab0:
  beq $v0, $zero, L80020b14
L80020ab4:
  sll $zero, $zero, 0x0
L80020ab8:
  lhu $v0, 8($s3)
L80020abc:
  lbu $v1, 33($s3)
L80020ac0:
  lbu $a0, 96($s3)
L80020ac4:
  ori $v0, $v0, 0x4
L80020ac8:
  addu $v1, $v1, $a0
L80020acc:
  sh $v0, 8($s3)
L80020ad0:
  addu $v0, $v1, $zero
L80020ad4:
  sb $v1, 33($s3)
L80020ad8:
  andi $v1, $v1, 0x7f
L80020adc:
  bne $v1, $zero, L80020bc4
L80020ae0:
  andi $v0, $v0, 0xff
L80020ae4:
  bne $v0, $zero, L80020afc
L80020ae8:
  sll $zero, $zero, 0x0
L80020aec:
  lhu $v0, 8($s3)
L80020af0:
  sll $zero, $zero, 0x0
L80020af4:
  andi $v0, $v0, 0xfffb
L80020af8:
  sh $v0, 8($s3)
L80020afc:
  lbu $v0, 586($gp)
L80020b00:
  sll $zero, $zero, 0x0
L80020b04:
  andi $v0, $v0, 0xbf
L80020b08:
  sb $v0, 586($gp)
L80020b0c:
  j L80020bc8
L80020b10:
  addu $v0, $zero, $zero
L80020b14:
  lui $v0, 0x800a
L80020b18:
  lhu $v0, -19564($v0)
L80020b1c:
  sll $zero, $zero, 0x0
L80020b20:
  andi $v0, $v0, 0xa000
L80020b24:
  beq $v0, $zero, L80020b64
L80020b28:
  addiu $v0, $zero, 16
L80020b2c:
  sh $v0, 96($s3)
L80020b30:
  lui $v0, 0x800a
L80020b34:
  lhu $v0, -19564($v0)
L80020b38:
  sll $zero, $zero, 0x0
L80020b3c:
  andi $v0, $v0, 0x2000
L80020b40:
  beq $v0, $zero, L80020b4c
L80020b44:
  addiu $v0, $zero, -16
L80020b48:
  sh $v0, 96($s3)
L80020b4c:
  lbu $v1, 586($gp)
L80020b50:
  sll $zero, $zero, 0x0
L80020b54:
  ori $v1, $v1, 0x40
L80020b58:
  sb $v1, 586($gp)
L80020b5c:
  j L80020bc8
L80020b60:
  addu $v0, $zero, $zero
L80020b64:
  lui $v0, 0x800a
L80020b68:
  lhu $v0, -19560($v0)
L80020b6c:
  sll $zero, $zero, 0x0
L80020b70:
  andi $v0, $v0, 0xe0
L80020b74:
  beq $v0, $zero, L80020bc8
L80020b78:
  addu $v0, $zero, $zero
L80020b7c:
  lw $a0, 640($gp)
L80020b80:
  jal 0x8004036c
L80020b84:
  sll $zero, $zero, 0x0
L80020b88:
  lw $a0, 644($gp)
L80020b8c:
  jal 0x8004036c
L80020b90:
  sll $zero, $zero, 0x0
L80020b94:
  lui $v0, 0x800a
L80020b98:
  lhu $v0, -19560($v0)
L80020b9c:
  sll $zero, $zero, 0x0
L80020ba0:
  andi $v0, $v0, 0x20
L80020ba4:
  bne $v0, $zero, L80020bc8
L80020ba8:
  addiu $v0, $zero, -1
L80020bac:
  lbu $v1, 33($s3)
L80020bb0:
  sll $zero, $zero, 0x0
L80020bb4:
  beq $v1, $zero, L80020bc8
L80020bb8:
  addiu $v0, $zero, 1
L80020bbc:
  j L80020bc8
L80020bc0:
  addiu $v0, $zero, 2
L80020bc4:
  addu $v0, $zero, $zero
L80020bc8:
  lw $ra, 48($sp)
L80020bcc:
  lw $s3, 44($sp)
L80020bd0:
  lw $s2, 40($sp)
L80020bd4:
  lw $s1, 36($sp)
L80020bd8:
  lw $s0, 32($sp)
L80020bdc:
  jr $ra
L80020be0:
  addiu $sp, $sp, 56
L80020be4:
  addiu $sp, $sp, -32
L80020be8:
  sw $s0, 16($sp)
L80020bec:
  addu $s0, $a0, $zero
L80020bf0:
  sw $s1, 20($sp)
L80020bf4:
  addiu $s1, $zero, 1
L80020bf8:
  beq $a1, $s1, L80020ca0
L80020bfc:
  sw $ra, 24($sp)
L80020c00:
  slti $v0, $a1, 2
L80020c04:
  beq $v0, $zero, L80020c1c
L80020c08:
  sll $zero, $zero, 0x0
L80020c0c:
  beq $a1, $zero, L80020c30
L80020c10:
  lui $a0, 0xffdd
L80020c14:
  j L80020d38
L80020c18:
  sll $zero, $zero, 0x0
L80020c1c:
  addiu $v0, $zero, 2
L80020c20:
  beq $a1, $v0, L80020cd8
L80020c24:
  addiu $v0, $zero, 248
L80020c28:
  j L80020d38
L80020c2c:
  sll $zero, $zero, 0x0
L80020c30:
  ori $a0, $a0, 0xffff
L80020c34:
  addiu $v0, $zero, 256
L80020c38:
  sh $v0, 50($s0)
L80020c3c:
  lui $v0, 0x800a
L80020c40:
  lw $v0, -20236($v0)
L80020c44:
  addiu $v1, $zero, 64
L80020c48:
  sh $zero, 48($s0)
L80020c4c:
  sh $v1, 4($s0)
L80020c50:
  and $v0, $v0, $a0
L80020c54:
  lui $at, 0x800a
L80020c58:
  sw $v0, -20236($at)
L80020c5c:
  lui $v0, 0x800a
L80020c60:
  lw $v0, -20236($v0)
L80020c64:
  lui $a0, 0x1
L80020c68:
  sw $a0, 28($s0)
L80020c6c:
  or $v0, $v0, $a0
L80020c70:
  lui $at, 0x800a
L80020c74:
  sw $v0, -20236($at)
L80020c78:
  addiu $v0, $zero, 2
L80020c7c:
  sb $v0, 70($s0)
L80020c80:
  lui $v1, 0x800a
L80020c84:
  lw $v1, -20200($v1)
L80020c88:
  addiu $v0, $zero, 16
L80020c8c:
  sh $v0, 6($s0)
L80020c90:
  sw $v1, 8($s0)
L80020c94:
  addiu $v1, $v1, 2048
L80020c98:
  j L80020d38
L80020c9c:
  sw $v1, 12($s0)
L80020ca0:
  lui $a0, 0xffdc
L80020ca4:
  ori $a0, $a0, 0xffff
L80020ca8:
  addiu $v0, $zero, 2048
L80020cac:
  sw $v0, 28($s0)
L80020cb0:
  lui $v0, 0x800a
L80020cb4:
  lw $v0, -20236($v0)
L80020cb8:
  lui $v1, 0x800a
L80020cbc:
  lw $v1, -20200($v1)
L80020cc0:
  and $v0, $v0, $a0
L80020cc4:
  lui $at, 0x800a
L80020cc8:
  sw $v0, -20236($at)
L80020ccc:
  sw $v1, 12($s0)
L80020cd0:
  j L80020d34
L80020cd4:
  sw $v1, 8($s0)
L80020cd8:
  sh $v0, 2($s0)
L80020cdc:
  addiu $v0, $zero, 256
L80020ce0:
  sh $v0, 4($s0)
L80020ce4:
  addiu $v0, $zero, 4
L80020ce8:
  lui $a1, 0x800a
L80020cec:
  lw $a1, -20200($a1)
L80020cf0:
  addu $a0, $s0, $zero
L80020cf4:
  sh $zero, 0($s0)
L80020cf8:
  jal 0x80081de8
L80020cfc:
  sh $v0, 6($s0)
L80020d00:
  lui $a0, 0xffdc
L80020d04:
  ori $a0, $a0, 0xffff
L80020d08:
  lui $v0, 0x801b
L80020d0c:
  addiu $v0, $v0, -4096
L80020d10:
  sw $v0, 12($s0)
L80020d14:
  sw $v0, 8($s0)
L80020d18:
  lui $v0, 0x800a
L80020d1c:
  lw $v0, -20236($v0)
L80020d20:
  addiu $v1, $zero, 2048
L80020d24:
  sw $v1, 28($s0)
L80020d28:
  and $v0, $v0, $a0
L80020d2c:
  lui $at, 0x800a
L80020d30:
  sw $v0, -20236($at)
L80020d34:
  sb $s1, 70($s0)
L80020d38:
  lw $ra, 24($sp)
L80020d3c:
  lw $s1, 20($sp)
L80020d40:
  lw $s0, 16($sp)
L80020d44:
  jr $ra
L80020d48:
  addiu $sp, $sp, 32
L80020d4c:
  addiu $sp, $sp, -56
L80020d50:
  sw $s1, 44($sp)
L80020d54:
  addu $s1, $a0, $zero
L80020d58:
  sw $ra, 48($sp)
L80020d5c:
  sw $s0, 40($sp)
L80020d60:
  lhu $v0, 40($s1)
L80020d64:
  sll $zero, $zero, 0x0
L80020d68:
  addiu $v0, $v0, -2
L80020d6c:
  sh $v0, 40($s1)
L80020d70:
  sll $v0, $v0, 0x10
L80020d74:
  bgtz $v0, L80020d90
L80020d78:
  sll $zero, $zero, 0x0
L80020d7c:
  lw $v0, 44($s1)
L80020d80:
  sb $zero, 108($s1)
L80020d84:
  sw $zero, 36($s1)
L80020d88:
  j L80020ed4
L80020d8c:
  sw $v0, 48($s1)
L80020d90:
  lui $v0, 0x800a
L80020d94:
  lw $v0, -20276($v0)
L80020d98:
  sll $zero, $zero, 0x0
L80020d9c:
  andi $v0, $v0, 0x1
L80020da0:
  beq $v0, $zero, L80020e58
L80020da4:
  sll $zero, $zero, 0x0
L80020da8:
  jal 0x8004002c
L80020dac:
  sll $zero, $zero, 0x0
L80020db0:
  addu $a0, $v0, $zero
L80020db4:
  jal 0x800400ac
L80020db8:
  addiu $a1, $zero, 2
L80020dbc:
  addu $s0, $v0, $zero
L80020dc0:
  beq $s0, $zero, L80020e58
L80020dc4:
  addu $a0, $s0, $zero
L80020dc8:
  lh $a1, 48($s1)
L80020dcc:
  lh $a2, 50($s1)
L80020dd0:
  lbu $v0, 104($s1)
L80020dd4:
  addu $a3, $zero, $zero
L80020dd8:
  sw $v0, 16($sp)
L80020ddc:
  lbu $v1, 105($s1)
L80020de0:
  addiu $v0, $zero, 17
L80020de4:
  sw $v0, 24($sp)
L80020de8:
  addiu $v0, $zero, 9
L80020dec:
  sw $v0, 28($sp)
L80020df0:
  lui $v0, 0x801b
L80020df4:
  addiu $v0, $v0, -4096
L80020df8:
  sw $v0, 32($sp)
L80020dfc:
  jal 0x800428a8
L80020e00:
  sw $v1, 20($sp)
L80020e04:
  lhu $v0, 64($s1)
L80020e08:
  lhu $v1, 8($s0)
L80020e0c:
  addiu $v0, $v0, 128
L80020e10:
  sh $v0, 64($s0)
L80020e14:
  lw $v0, 4($s0)
L80020e18:
  ori $v1, $v1, 0x28
L80020e1c:
  sh $v1, 8($s0)
L80020e20:
  lui $v1, 0x5000
L80020e24:
  or $v0, $v0, $v1
L80020e28:
  sw $v0, 4($s0)
L80020e2c:
  lbu $a1, 22($s1)
L80020e30:
  addu $a0, $s0, $zero
L80020e34:
  addiu $a1, $a1, -1
L80020e38:
  sll $a1, $a1, 0x18
L80020e3c:
  jal 0x800428ec
L80020e40:
  sra $a1, $a1, 0x18
L80020e44:
  addiu $v0, $zero, 8
L80020e48:
  sh $v0, 96($s0)
L80020e4c:
  lui $v0, 0x8004
L80020e50:
  addiu $v0, $v0, 11200
L80020e54:
  sw $v0, 36($s0)
L80020e58:
  lhu $v0, 42($s1)
L80020e5c:
  sll $zero, $zero, 0x0
L80020e60:
  addiu $v0, $v0, 48
L80020e64:
  sll $a0, $v0, 0x10
L80020e68:
  sra $a0, $a0, 0x10
L80020e6c:
  jal 0x80086770
L80020e70:
  sh $v0, 42($s1)
L80020e74:
  lh $v1, 40($s1)
L80020e78:
  sll $zero, $zero, 0x0
L80020e7c:
  mult $v0, $v1
L80020e80:
  mflo $v1
L80020e84:
  bgez $v1, L80020e90
L80020e88:
  sll $zero, $zero, 0x0
L80020e8c:
  addiu $v1, $v1, 4095
L80020e90:
  sra $v1, $v1, 0xc
L80020e94:
  lhu $v0, 44($s1)
L80020e98:
  lh $a0, 42($s1)
L80020e9c:
  addu $v0, $v0, $v1
L80020ea0:
  jal 0x800866a0
L80020ea4:
  sh $v0, 48($s1)
L80020ea8:
  lh $v1, 40($s1)
L80020eac:
  sll $zero, $zero, 0x0
L80020eb0:
  mult $v0, $v1
L80020eb4:
  mflo $v1
L80020eb8:
  bgez $v1, L80020ec4
L80020ebc:
  sll $zero, $zero, 0x0
L80020ec0:
  addiu $v1, $v1, 4095
L80020ec4:
  lhu $v0, 46($s1)
L80020ec8:
  sra $v1, $v1, 0xc
L80020ecc:
  addu $v0, $v0, $v1
L80020ed0:
  sh $v0, 50($s1)
L80020ed4:
  lw $ra, 48($sp)
L80020ed8:
  lw $s1, 44($sp)
L80020edc:
  lw $s0, 40($sp)
L80020ee0:
  jr $ra
L80020ee4:
  addiu $sp, $sp, 56
L80020ee8:
  addiu $sp, $sp, -24
L80020eec:
  sw $s0, 16($sp)
L80020ef0:
  sw $ra, 20($sp)
L80020ef4:
  jal 0x80042b98
L80020ef8:
  addu $s0, $a0, $zero
L80020efc:
  bne $v0, $zero, L80020f14
L80020f00:
  sll $zero, $zero, 0x0
L80020f04:
  lhu $v0, 8($s0)
L80020f08:
  sll $zero, $zero, 0x0
L80020f0c:
  ori $v0, $v0, 0x4
L80020f10:
  sh $v0, 8($s0)
L80020f14:
  lbu $v0, 33($s0)
L80020f18:
  sll $zero, $zero, 0x0
L80020f1c:
  addiu $v0, $v0, -2
L80020f20:
  sb $v0, 33($s0)
L80020f24:
  andi $v0, $v0, 0xff
L80020f28:
  sltiu $v0, $v0, 192
L80020f2c:
  beq $v0, $zero, L80020f3c
L80020f30:
  sll $zero, $zero, 0x0
L80020f34:
  jal 0x8004036c
L80020f38:
  addu $a0, $s0, $zero
L80020f3c:
  lw $ra, 20($sp)
L80020f40:
  lw $s0, 16($sp)
L80020f44:
  jr $ra
L80020f48:
  addiu $sp, $sp, 24
L80020f4c:
  addiu $sp, $sp, -72
L80020f50:
  lhu $v1, 818($gp)
L80020f54:
  lui $v0, 0x8018
L80020f58:
  sw $s0, 40($sp)
L80020f5c:
  addiu $s0, $v0, -26152
L80020f60:
  sw $ra, 64($sp)
L80020f64:
  sw $s5, 60($sp)
L80020f68:
  sw $s4, 56($sp)
L80020f6c:
  sw $s3, 52($sp)
L80020f70:
  sw $s2, 48($sp)
L80020f74:
  andi $v0, $v1, 0x8000
L80020f78:
  bne $v0, $zero, L80021060
L80020f7c:
  sw $s1, 44($sp)
L80020f80:
  ori $v0, $v1, 0x8000
L80020f84:
  sh $v0, 818($gp)
L80020f88:
  jal 0x8003ff34
L80020f8c:
  sll $zero, $zero, 0x0
L80020f90:
  lbu $v1, 605($gp)
L80020f94:
  lui $at, 0x800a
L80020f98:
  sb $zero, -19614($at)
L80020f9c:
  beq $v1, $zero, L80020fac
L80020fa0:
  addiu $v0, $zero, 1
L80020fa4:
  lui $at, 0x800a
L80020fa8:
  sb $v0, -19614($at)
L80020fac:
  addu $a0, $zero, $zero
L80020fb0:
  addu $a1, $a0, $zero
L80020fb4:
  addiu $a2, $zero, 7595
L80020fb8:
  addiu $a3, $zero, 34
L80020fbc:
  lui $v0, 0x8002
L80020fc0:
  addiu $v0, $v0, 3044
L80020fc4:
  sb $v1, 816($gp)
L80020fc8:
  sw $v0, 16($sp)
L80020fcc:
  sw $zero, 20($sp)
L80020fd0:
  jal 0x80014e1c
L80020fd4:
  sw $zero, 24($sp)
L80020fd8:
  lbu $v0, 605($gp)
L80020fdc:
  sll $zero, $zero, 0x0
L80020fe0:
  beq $v0, $zero, L80021000
L80020fe4:
  addiu $v1, $zero, 29408
L80020fe8:
  lui $v0, 0x800a
L80020fec:
  lb $v0, -19615($v0)
L80020ff0:
  sll $zero, $zero, 0x0
L80020ff4:
  bltz $v0, L80021004
L80020ff8:
  addiu $v0, $zero, -116
L80020ffc:
  addiu $v1, $zero, 29424
L80021000:
  addiu $v0, $zero, -116
L80021004:
  addiu $a2, $zero, 48
L80021008:
  lw $s0, 780($gp)
L8002100c:
  addiu $a0, $zero, 1
L80021010:
  sh $v1, 728($gp)
L80021014:
  lui $v1, 0x8002
L80021018:
  sh $v0, 40($s0)
L8002101c:
  lhu $v0, 50($s0)
L80021020:
  addiu $v1, $v1, -5008
L80021024:
  sh $a2, 44($s0)
L80021028:
  sb $a0, 108($s0)
L8002102c:
  sw $v1, 36($s0)
L80021030:
  sh $v0, 42($s0)
L80021034:
  lw $s0, 788($gp)
L80021038:
  sll $zero, $zero, 0x0
L8002103c:
  lhu $a1, 50($s0)
L80021040:
  addiu $v0, $zero, 408
L80021044:
  sh $v0, 40($s0)
L80021048:
  sh $a2, 44($s0)
L8002104c:
  sb $a0, 108($s0)
L80021050:
  sw $v1, 36($s0)
L80021054:
  sb $a0, 620($gp)
L80021058:
  j L8002145c
L8002105c:
  sh $a1, 42($s0)
L80021060:
  lhu $v0, 602($gp)
L80021064:
  sll $zero, $zero, 0x0
L80021068:
  bne $v0, $zero, L8002145c
L8002106c:
  addiu $a2, $zero, 2
L80021070:
  lbu $a1, 620($gp)
L80021074:
  sll $zero, $zero, 0x0
L80021078:
  andi $v1, $a1, 0xf
L8002107c:
  beq $v1, $a2, L8002117c
L80021080:
  slti $v0, $v1, 3
L80021084:
  beq $v0, $zero, L8002109c
L80021088:
  addiu $v0, $zero, 1
L8002108c:
  beq $v1, $v0, L800210b8
L80021090:
  andi $v0, $a1, 0x80
L80021094:
  j L8002145c
L80021098:
  sll $zero, $zero, 0x0
L8002109c:
  addiu $v0, $zero, 3
L800210a0:
  beq $v1, $v0, L80021354
L800210a4:
  addiu $v0, $zero, 4
L800210a8:
  beq $v1, $v0, L80021430
L800210ac:
  andi $v0, $a1, 0x80
L800210b0:
  j L8002145c
L800210b4:
  sll $zero, $zero, 0x0
L800210b8:
  bne $v0, $zero, L80021140
L800210bc:
  lui $v0, 0x200
L800210c0:
  ori $v0, $v0, 0x30
L800210c4:
  lui $v1, 0x800a
L800210c8:
  lw $v1, -20236($v1)
L800210cc:
  lui $a0, 0x800a
L800210d0:
  lw $a0, -20172($a0)
L800210d4:
  and $v1, $v1, $v0
L800210d8:
  or $v1, $v1, $a0
L800210dc:
  bne $v1, $zero, L8002145c
L800210e0:
  ori $v0, $a1, 0x80
L800210e4:
  lui $v1, 0x800a
L800210e8:
  lb $v1, -19615($v1)
L800210ec:
  sb $v0, 620($gp)
L800210f0:
  addiu $v0, $zero, 8
L800210f4:
  sh $v0, 602($gp)
L800210f8:
  bgez $v1, L80021104
L800210fc:
  addu $a0, $zero, $zero
L80021100:
  addiu $v1, $zero, 1
L80021104:
  addu $a1, $a0, $zero
L80021108:
  sll $a2, $v1, 0x1
L8002110c:
  addu $a2, $a2, $v1
L80021110:
  addiu $a2, $a2, 7475
L80021114:
  addiu $a3, $zero, 3
L80021118:
  addiu $v0, $s0, -6144
L8002111c:
  sw $zero, 16($sp)
L80021120:
  sw $zero, 20($sp)
L80021124:
  jal 0x80014e1c
L80021128:
  sw $v0, 24($sp)
L8002112c:
  lhu $a0, 728($gp)
L80021130:
  jal 0x800472a8
L80021134:
  sll $zero, $zero, 0x0
L80021138:
  j L8002145c
L8002113c:
  sll $zero, $zero, 0x0
L80021140:
  ori $v0, $v0, 0x30
L80021144:
  lui $v1, 0x800a
L80021148:
  lw $v1, -20236($v1)
L8002114c:
  lui $a0, 0x800a
L80021150:
  lw $a0, -20172($a0)
L80021154:
  and $v1, $v1, $v0
L80021158:
  or $v1, $v1, $a0
L8002115c:
  bne $v1, $zero, L8002145c
L80021160:
  sll $zero, $zero, 0x0
L80021164:
  lhu $a0, 728($gp)
L80021168:
  sb $a2, 620($gp)
L8002116c:
  jal 0x8003ff08
L80021170:
  sll $zero, $zero, 0x0
L80021174:
  j L8002145c
L80021178:
  sll $zero, $zero, 0x0
L8002117c:
  andi $v0, $a1, 0x80
L80021180:
  bne $v0, $zero, L80021314
L80021184:
  lui $v0, 0x200
L80021188:
  ori $v0, $a1, 0x80
L8002118c:
  sb $v0, 620($gp)
L80021190:
  addu $s2, $zero, $zero
L80021194:
  lui $v0, 0x8009
L80021198:
  addiu $s5, $v0, 2344
L8002119c:
  addu $s4, $s0, $zero
L800211a0:
  addu $s3, $s2, $zero
L800211a4:
  lui $v0, 0x800a
L800211a8:
  lb $v0, -19615($v0)
L800211ac:
  sll $zero, $zero, 0x0
L800211b0:
  bltz $v0, L800211d4
L800211b4:
  sll $zero, $zero, 0x0
L800211b8:
  lbu $v0, 605($gp)
L800211bc:
  sll $zero, $zero, 0x0
L800211c0:
  sll $v1, $v0, 0x3
L800211c4:
  subu $v1, $v1, $v0
L800211c8:
  sll $v1, $v1, 0x2
L800211cc:
  j L800211f4
L800211d0:
  addu $v0, $s3, $s5
L800211d4:
  lbu $v0, 605($gp)
L800211d8:
  sll $zero, $zero, 0x0
L800211dc:
  sll $v1, $v0, 0x3
L800211e0:
  subu $v1, $v1, $v0
L800211e4:
  sll $v1, $v1, 0x2
L800211e8:
  lui $v0, 0x8009
L800211ec:
  addiu $v0, $v0, 2400
L800211f0:
  addu $v0, $s3, $v0
L800211f4:
  addu $s1, $v1, $v0
L800211f8:
  sw $zero, 0($s4)
L800211fc:
  lbu $v0, 2($s1)
L80021200:
  sll $zero, $zero, 0x0
L80021204:
  beq $v0, $zero, L800212f8
L80021208:
  sll $zero, $zero, 0x0
L8002120c:
  jal 0x8004002c
L80021210:
  sll $zero, $zero, 0x0
L80021214:
  addu $a0, $v0, $zero
L80021218:
  jal 0x800400ac
L8002121c:
  addiu $a1, $zero, 2
L80021220:
  addu $s0, $v0, $zero
L80021224:
  addu $a0, $s0, $zero
L80021228:
  lbu $a1, 0($s1)
L8002122c:
  lbu $a2, 1($s1)
L80021230:
  lbu $v0, 605($gp)
L80021234:
  addu $a3, $zero, $zero
L80021238:
  sw $v0, 16($sp)
L8002123c:
  lbu $v1, 2($s1)
L80021240:
  addiu $v0, $zero, 17
L80021244:
  sw $v0, 24($sp)
L80021248:
  addiu $v0, $zero, 9
L8002124c:
  sw $v0, 28($sp)
L80021250:
  lui $v0, 0x801b
L80021254:
  addiu $v0, $v0, -4096
L80021258:
  sw $v0, 32($sp)
L8002125c:
  jal 0x800428a8
L80021260:
  sw $v1, 20($sp)
L80021264:
  lbu $v0, 105($s0)
L80021268:
  sll $zero, $zero, 0x0
L8002126c:
  sltiu $v0, $v0, 26
L80021270:
  bne $v0, $zero, L80021288
L80021274:
  sll $zero, $zero, 0x0
L80021278:
  lhu $v0, 64($s0)
L8002127c:
  sll $zero, $zero, 0x0
L80021280:
  addiu $v0, $v0, 16
L80021284:
  sh $v0, 64($s0)
L80021288:
  lhu $v0, 8($s0)
L8002128c:
  addu $a0, $s0, $zero
L80021290:
  ori $v0, $v0, 0x28
L80021294:
  sh $v0, 8($s0)
L80021298:
  lw $v0, 4($s0)
L8002129c:
  lui $v1, 0x5000
L800212a0:
  or $v0, $v0, $v1
L800212a4:
  sw $v0, 4($s0)
L800212a8:
  lbu $v1, 3($s1)
L800212ac:
  addiu $v0, $zero, 24
L800212b0:
  sh $v0, 74($s0)
L800212b4:
  jal 0x80042918
L800212b8:
  sh $v1, 72($s0)
L800212bc:
  lw $v0, 48($s0)
L800212c0:
  jal 0x8008e590
L800212c4:
  sw $v0, 44($s0)
L800212c8:
  addiu $a0, $zero, 4096
L800212cc:
  andi $v0, $v0, 0x3f
L800212d0:
  addiu $v0, $v0, 320
L800212d4:
  jal 0x800358fc
L800212d8:
  sh $v0, 40($s0)
L800212dc:
  sh $v0, 42($s0)
L800212e0:
  addiu $v0, $zero, 1
L800212e4:
  sb $v0, 108($s0)
L800212e8:
  lui $v0, 0x8002
L800212ec:
  addiu $v0, $v0, 3404
L800212f0:
  sw $v0, 36($s0)
L800212f4:
  sw $s0, 0($s4)
L800212f8:
  addiu $s4, $s4, 12
L800212fc:
  addiu $s2, $s2, 1
L80021300:
  slti $v0, $s2, 7
L80021304:
  bne $v0, $zero, L800211a4
L80021308:
  addiu $s3, $s3, 4
L8002130c:
  j L8002145c
L80021310:
  sll $zero, $zero, 0x0
L80021314:
  ori $v0, $v0, 0x30
L80021318:
  lui $v1, 0x800a
L8002131c:
  lw $v1, -20236($v1)
L80021320:
  lui $a0, 0x800a
L80021324:
  lw $a0, -20172($a0)
L80021328:
  and $v1, $v1, $v0
L8002132c:
  or $v1, $v1, $a0
L80021330:
  bne $v1, $zero, L8002145c
L80021334:
  sll $zero, $zero, 0x0
L80021338:
  jal 0x80042b40
L8002133c:
  addiu $a0, $zero, 1
L80021340:
  bne $v0, $zero, L8002145c
L80021344:
  addiu $v0, $zero, 3
L80021348:
  sb $v0, 620($gp)
L8002134c:
  j L8002145c
L80021350:
  sll $zero, $zero, 0x0
L80021354:
  andi $v0, $a1, 0x80
L80021358:
  bne $v0, $zero, L8002136c
L8002135c:
  ori $v0, $a1, 0x80
L80021360:
  sb $v0, 620($gp)
L80021364:
  addiu $v0, $zero, 600
L80021368:
  sh $v0, 712($gp)
L8002136c:
  lbu $v0, 620($gp)
L80021370:
  sll $zero, $zero, 0x0
L80021374:
  andi $v0, $v0, 0x40
L80021378:
  bne $v0, $zero, L80021414
L8002137c:
  sll $zero, $zero, 0x0
L80021380:
  lhu $v0, 712($gp)
L80021384:
  sll $zero, $zero, 0x0
L80021388:
  addiu $v0, $v0, -1
L8002138c:
  sh $v0, 712($gp)
L80021390:
  sll $v0, $v0, 0x10
L80021394:
  blez $v0, L800213c8
L80021398:
  addu $s2, $zero, $zero
L8002139c:
  lui $v0, 0x800a
L800213a0:
  lhu $v0, -19560($v0)
L800213a4:
  sll $zero, $zero, 0x0
L800213a8:
  andi $v0, $v0, 0xe0
L800213ac:
  bne $v0, $zero, L800213cc
L800213b0:
  addiu $a1, $zero, 1
L800213b4:
  jal 0x8004703c
L800213b8:
  sll $zero, $zero, 0x0
L800213bc:
  andi $v0, $v0, 0x80
L800213c0:
  bne $v0, $zero, L8002145c
L800213c4:
  sll $zero, $zero, 0x0
L800213c8:
  addiu $a1, $zero, 1
L800213cc:
  lui $v0, 0x8002
L800213d0:
  addiu $a0, $v0, 3816
L800213d4:
  lbu $v0, 620($gp)
L800213d8:
  addu $v1, $s0, $zero
L800213dc:
  ori $v0, $v0, 0x40
L800213e0:
  sb $v0, 620($gp)
L800213e4:
  lw $s0, 0($v1)
L800213e8:
  sll $zero, $zero, 0x0
L800213ec:
  beq $s0, $zero, L800213fc
L800213f0:
  sll $zero, $zero, 0x0
L800213f4:
  sb $a1, 108($s0)
L800213f8:
  sw $a0, 36($s0)
L800213fc:
  addiu $s2, $s2, 1
L80021400:
  slti $v0, $s2, 7
L80021404:
  bne $v0, $zero, L800213e4
L80021408:
  addiu $v1, $v1, 12
L8002140c:
  j L8002145c
L80021410:
  sll $zero, $zero, 0x0
L80021414:
  jal 0x80042b40
L80021418:
  addiu $a0, $zero, 1
L8002141c:
  bne $v0, $zero, L8002145c
L80021420:
  addiu $v0, $zero, 4
L80021424:
  sb $v0, 620($gp)
L80021428:
  j L8002145c
L8002142c:
  sll $zero, $zero, 0x0
L80021430:
  bne $v0, $zero, L80021444
L80021434:
  lui $v0, 0x800f
L80021438:
  ori $v0, $a1, 0x80
L8002143c:
  sb $v0, 620($gp)
L80021440:
  lui $v0, 0x800f
L80021444:
  lbu $v0, -24882($v0)
L80021448:
  sll $zero, $zero, 0x0
L8002144c:
  andi $v0, $v0, 0x80
L80021450:
  bne $v0, $zero, L8002145c
L80021454:
  addiu $v0, $zero, 13
L80021458:
  sh $v0, 818($gp)
L8002145c:
  lw $ra, 64($sp)
L80021460:
  lw $s5, 60($sp)
L80021464:
  lw $s4, 56($sp)
L80021468:
  lw $s3, 52($sp)
L8002146c:
  lw $s2, 48($sp)
L80021470:
  lw $s1, 44($sp)
L80021474:
  lw $s0, 40($sp)
L80021478:
  jr $ra
L8002147c:
  addiu $sp, $sp, 72
L80021480:
  lw $v0, 736($gp)
L80021484:
  addiu $sp, $sp, -32
L80021488:
  sw $s0, 24($sp)
L8002148c:
  addu $s0, $a0, $zero
L80021490:
  sw $ra, 28($sp)
L80021494:
  lw $a0, 0($v0)
L80021498:
  jal 0x80040410
L8002149c:
  addu $a1, $s0, $zero
L800214a0:
  bne $s0, $zero, L800214e4
L800214a4:
  addu $a0, $zero, $zero
L800214a8:
  lw $a1, 736($gp)
L800214ac:
  sll $zero, $zero, 0x0
L800214b0:
  lw $v1, 4($a1)
L800214b4:
  sll $zero, $zero, 0x0
L800214b8:
  beq $v1, $zero, L80021518
L800214bc:
  sll $zero, $zero, 0x0
L800214c0:
  lhu $v0, 8($v1)
L800214c4:
  addiu $a0, $a0, 1
L800214c8:
  ori $v0, $v0, 0x40
L800214cc:
  sh $v0, 8($v1)
L800214d0:
  slti $v0, $a0, 10
L800214d4:
  bne $v0, $zero, L800214ac
L800214d8:
  addiu $a1, $a1, 4
L800214dc:
  j L8002151c
L800214e0:
  addu $a0, $zero, $zero
L800214e4:
  lw $a1, 736($gp)
L800214e8:
  sll $zero, $zero, 0x0
L800214ec:
  lw $v1, 4($a1)
L800214f0:
  sll $zero, $zero, 0x0
L800214f4:
  beq $v1, $zero, L80021518
L800214f8:
  sll $zero, $zero, 0x0
L800214fc:
  lhu $v0, 8($v1)
L80021500:
  addiu $a0, $a0, 1
L80021504:
  andi $v0, $v0, 0xffbf
L80021508:
  sh $v0, 8($v1)
L8002150c:
  slti $v0, $a0, 10
L80021510:
  bne $v0, $zero, L800214e8
L80021514:
  addiu $a1, $a1, 4
L80021518:
  addu $a0, $zero, $zero
L8002151c:
  addiu $a2, $zero, 26
L80021520:
  lw $v0, 736($gp)
L80021524:
  addiu $a3, $zero, 40
L80021528:
  addu $v0, $v0, $s0
L8002152c:
  lbu $a1, 52($v0)
L80021530:
  addiu $v0, $zero, 288
L80021534:
  sw $v0, 16($sp)
L80021538:
  jal 0x80035be4
L8002153c:
  sw $v0, 20($sp)
L80021540:
  jal 0x80039a14
L80021544:
  addu $a0, $v0, $zero
L80021548:
  lw $ra, 28($sp)
L8002154c:
  lw $s0, 24($sp)
L80021550:
  jr $ra
L80021554:
  addiu $sp, $sp, 32
L80021558:
  sll $v1, $a0, 0x2
L8002155c:
  addu $v1, $v1, $a0
L80021560:
  sll $v1, $v1, 0x2
L80021564:
  lui $v0, 0x8018
L80021568:
  addiu $v0, $v0, -26456
L8002156c:
  addu $v1, $v1, $v0
L80021570:
  lh $v0, 0($v1)
L80021574:
  sll $zero, $zero, 0x0
L80021578:
  slt $v0, $a1, $v0
L8002157c:
  bne $v0, $zero, L8002158c
L80021580:
  sll $zero, $zero, 0x0
L80021584:
  j L80021570
L80021588:
  addiu $v1, $v1, 4
L8002158c:
  lh $v0, 2($v1)
L80021590:
  jr $ra
L80021594:
  sll $zero, $zero, 0x0
L80021598:
  addiu $sp, $sp, -48
L8002159c:
  lui $v0, 0x800f
L800215a0:
  sw $s3, 28($sp)
L800215a4:
  addiu $s3, $v0, -24592
L800215a8:
  addiu $v0, $zero, 68
L800215ac:
  lw $a0, 736($gp)
L800215b0:
  lui $v1, 0x801d
L800215b4:
  sw $ra, 40($sp)
L800215b8:
  sw $s5, 36($sp)
L800215bc:
  sw $s4, 32($sp)
L800215c0:
  sw $s2, 24($sp)
L800215c4:
  sw $s1, 20($sp)
L800215c8:
  sw $s0, 16($sp)
L800215cc:
  sb $v0, 52($a0)
L800215d0:
  addiu $v0, $zero, 64
L800215d4:
  sb $v0, 53($a0)
L800215d8:
  addiu $v0, $zero, 69
L800215dc:
  sb $v0, 54($a0)
L800215e0:
  lbu $v0, 605($gp)
L800215e4:
  addiu $s4, $v1, 22024
L800215e8:
  sll $v0, $v0, 0x5
L800215ec:
  addu $v0, $v0, $s3
L800215f0:
  lb $v1, 0($v0)
L800215f4:
  addiu $v0, $zero, 40
L800215f8:
  bne $v1, $v0, L80021604
L800215fc:
  addiu $v0, $zero, 66
L80021600:
  sb $v0, 53($a0)
L80021604:
  lbu $v0, 605($gp)
L80021608:
  sll $zero, $zero, 0x0
L8002160c:
  sll $v0, $v0, 0x5
L80021610:
  addu $v0, $v0, $s3
L80021614:
  lb $v1, 0($v0)
L80021618:
  addiu $v0, $zero, -40
L8002161c:
  bne $v1, $v0, L8002162c
L80021620:
  addu $s5, $zero, $zero
L80021624:
  addiu $v0, $zero, 65
L80021628:
  sb $v0, 53($a0)
L8002162c:
  addiu $s2, $s4, 120
L80021630:
  addiu $s1, $s3, 1
L80021634:
  addu $s0, $a0, $zero
L80021638:
  addiu $v0, $zero, 50
L8002163c:
  sw $v0, 48($s0)
L80021640:
  sw $v0, 44($s0)
L80021644:
  lb $v1, 0($s3)
L80021648:
  lw $v0, 44($s0)
L8002164c:
  sll $zero, $zero, 0x0
L80021650:
  addu $v0, $v0, $v1
L80021654:
  sw $v0, 44($s0)
L80021658:
  lb $a1, 23($s1)
L8002165c:
  addiu $a0, $zero, 6
L80021660:
  jal L80021558
L80021664:
  sw $a1, 0($s4)
L80021668:
  lw $v1, 44($s0)
L8002166c:
  sll $zero, $zero, 0x0
L80021670:
  addu $v1, $v1, $v0
L80021674:
  sw $v1, 44($s0)
L80021678:
  lh $a1, 19($s1)
L8002167c:
  addiu $a0, $zero, 7
L80021680:
  jal L80021558
L80021684:
  sw $a1, -112($s2)
L80021688:
  lw $v1, 44($s0)
L8002168c:
  sll $zero, $zero, 0x0
L80021690:
  addu $v1, $v1, $v0
L80021694:
  sw $v1, 44($s0)
L80021698:
  lh $v0, 13($s1)
L8002169c:
  sll $zero, $zero, 0x0
L800216a0:
  sw $v0, -104($s2)
L800216a4:
  lbu $v0, 10($s1)
L800216a8:
  sll $zero, $zero, 0x0
L800216ac:
  sw $v0, -96($s2)
L800216b0:
  lbu $a1, 1($s1)
L800216b4:
  addiu $a0, $zero, 1
L800216b8:
  jal L80021558
L800216bc:
  sw $a1, -88($s2)
L800216c0:
  lw $v1, 44($s0)
L800216c4:
  sll $zero, $zero, 0x0
L800216c8:
  addu $v1, $v1, $v0
L800216cc:
  sw $v1, 44($s0)
L800216d0:
  lh $v0, 15($s1)
L800216d4:
  sll $zero, $zero, 0x0
L800216d8:
  sw $v0, -80($s2)
L800216dc:
  lbu $v0, 11($s1)
L800216e0:
  sll $zero, $zero, 0x0
L800216e4:
  sw $v0, -72($s2)
L800216e8:
  lbu $a1, 2($s1)
L800216ec:
  addiu $a0, $zero, 2
L800216f0:
  jal L80021558
L800216f4:
  sw $a1, -64($s2)
L800216f8:
  lw $v1, 44($s0)
L800216fc:
  sll $zero, $zero, 0x0
L80021700:
  addu $v1, $v1, $v0
L80021704:
  sw $v1, 44($s0)
L80021708:
  lbu $v0, 6($s1)
L8002170c:
  sll $zero, $zero, 0x0
L80021710:
  sw $v0, -56($s2)
L80021714:
  lbu $a1, 3($s1)
L80021718:
  addiu $a0, $zero, 3
L8002171c:
  jal L80021558
L80021720:
  sw $a1, -48($s2)
L80021724:
  lw $v1, 44($s0)
L80021728:
  sll $zero, $zero, 0x0
L8002172c:
  addu $v1, $v1, $v0
L80021730:
  sw $v1, 44($s0)
L80021734:
  lbu $a1, 7($s1)
L80021738:
  addiu $a0, $zero, 8
L8002173c:
  jal L80021558
L80021740:
  sw $a1, -40($s2)
L80021744:
  lw $v1, 44($s0)
L80021748:
  sll $zero, $zero, 0x0
L8002174c:
  addu $v1, $v1, $v0
L80021750:
  sw $v1, 44($s0)
L80021754:
  lbu $a1, 8($s1)
L80021758:
  addiu $a0, $zero, 9
L8002175c:
  jal L80021558
L80021760:
  sw $a1, -32($s2)
L80021764:
  lw $v1, 44($s0)
L80021768:
  addiu $s5, $s5, 1
L8002176c:
  addu $v1, $v1, $v0
L80021770:
  sw $v1, 44($s0)
L80021774:
  lbu $v0, 9($s1)
L80021778:
  addiu $s3, $s3, 32
L8002177c:
  sw $v0, -24($s2)
L80021780:
  lbu $a1, 4($s1)
L80021784:
  addiu $a0, $zero, 4
L80021788:
  jal L80021558
L8002178c:
  sw $a1, -16($s2)
L80021790:
  lw $v1, 44($s0)
L80021794:
  addiu $s4, $s4, 4
L80021798:
  addu $v1, $v1, $v0
L8002179c:
  sw $v1, 44($s0)
L800217a0:
  lbu $a1, 5($s1)
L800217a4:
  addiu $a0, $zero, 5
L800217a8:
  jal L80021558
L800217ac:
  sw $a1, -8($s2)
L800217b0:
  lw $v1, 44($s0)
L800217b4:
  addu $a0, $zero, $zero
L800217b8:
  addu $v1, $v1, $v0
L800217bc:
  sw $v1, 44($s0)
L800217c0:
  lbu $a1, 0($s1)
L800217c4:
  addiu $s1, $s1, 32
L800217c8:
  jal L80021558
L800217cc:
  sw $a1, 0($s2)
L800217d0:
  lw $v1, 44($s0)
L800217d4:
  addiu $s2, $s2, 4
L800217d8:
  addu $v1, $v1, $v0
L800217dc:
  sw $v1, 44($s0)
L800217e0:
  slti $v0, $s5, 2
L800217e4:
  bne $v0, $zero, L80021644
L800217e8:
  addiu $s0, $s0, 4
L800217ec:
  lw $ra, 40($sp)
L800217f0:
  lw $s5, 36($sp)
L800217f4:
  lw $s4, 32($sp)
L800217f8:
  lw $s3, 28($sp)
L800217fc:
  lw $s2, 24($sp)
L80021800:
  lw $s1, 20($sp)
L80021804:
  lw $s0, 16($sp)
L80021808:
  jr $ra
L8002180c:
  addiu $sp, $sp, 48
L80021810:
  addiu $sp, $sp, -24
L80021814:
  sw $s0, 16($sp)
L80021818:
  sll $s0, $a0, 0x3
L8002181c:
  addu $s0, $s0, $a0
L80021820:
  sll $s0, $s0, 0x3
L80021824:
  addu $s0, $s0, $a0
L80021828:
  sll $v0, $s0, 0x2
L8002182c:
  addu $s0, $s0, $v0
L80021830:
  sll $s0, $s0, 0x2
L80021834:
  j 0x801aae54
L80021838:
  sll $zero, $zero, 0x0
L8002183c:
  sw $ra, 20($sp)
L80021840:
  jal 0x8008e590
L80021844:
  addu $s0, $s0, $v0
L80021848:
  andi $v0, $v0, 0x7ff
L8002184c:
  addiu $a1, $v0, 1
L80021850:
  addu $a0, $zero, $zero
L80021854:
  addu $v1, $a0, $zero
L80021858:
  lhu $v0, 0($s0)
L8002185c:
  sll $zero, $zero, 0x0
L80021860:
  addu $a0, $a0, $v0
L80021864:
  slt $v0, $a0, $a1
L80021868:
  beq $v0, $zero, L80021884
L8002186c:
  addiu $v0, $v1, 1
L80021870:
  addiu $v1, $v1, 1
L80021874:
  slti $v0, $v1, 722
L80021878:
  bne $v0, $zero, L80021858
L8002187c:
  addiu $s0, $s0, 2
L80021880:
  addu $v0, $zero, $zero
L80021884:
  lw $ra, 20($sp)
L80021888:
  lw $s0, 16($sp)
L8002188c:
  jr $ra
L80021890:
  addiu $sp, $sp, 24
L80021894:
  lui $v0, 0x801d
L80021898:
  addiu $a2, $v0, 512
L8002189c:
  addiu $v0, $a0, 79
L800218a0:
  addu $v1, $v0, $a2
L800218a4:
  lbu $v0, 0($v1)
L800218a8:
  sll $zero, $zero, 0x0
L800218ac:
  addiu $v0, $v0, 1
L800218b0:
  sb $v0, 0($v1)
L800218b4:
  andi $v0, $v0, 0xff
L800218b8:
  sltiu $v0, $v0, 251
L800218bc:
  bne $v0, $zero, L800218cc
L800218c0:
  addiu $a3, $a2, 1468
L800218c4:
  addiu $v0, $zero, 250
L800218c8:
  sb $v0, 0($v1)
L800218cc:
  addiu $a1, $zero, 14
L800218d0:
  addiu $v1, $a2, 1496
L800218d4:
  lhu $v0, 0($v1)
L800218d8:
  addiu $a1, $a1, -1
L800218dc:
  sh $v0, 2($v1)
L800218e0:
  bgez $a1, L800218d4
L800218e4:
  addiu $v1, $v1, -2
L800218e8:
  jr $ra
L800218ec:
  sh $a0, 0($a3)
L800218f0:
  addiu $sp, $sp, -64
L800218f4:
  lui $v0, 0x800f
L800218f8:
  addiu $v0, $v0, 10312
L800218fc:
  sw $ra, 56($sp)
L80021900:
  sw $s3, 52($sp)
L80021904:
  sw $s2, 48($sp)
L80021908:
  sw $s1, 44($sp)
L8002190c:
  sw $s0, 40($sp)
L80021910:
  lhu $v1, 2($v0)
L80021914:
  sll $zero, $zero, 0x0
L80021918:
  addiu $v1, $v1, 2
L8002191c:
  jal 0x8001352c
L80021920:
  sh $v1, 2($v0)
L80021924:
  lhu $v1, 818($gp)
L80021928:
  sll $zero, $zero, 0x0
L8002192c:
  andi $v0, $v1, 0x8000
L80021930:
  bne $v0, $zero, L80021e30
L80021934:
  andi $v0, $v1, 0x4000
L80021938:
  ori $v0, $v1, 0x8000
L8002193c:
  sh $v0, 818($gp)
L80021940:
  jal 0x80015c84
L80021944:
  sll $zero, $zero, 0x0
L80021948:
  addiu $a0, $zero, 128
L8002194c:
  jal 0x80015bd8
L80021950:
  addiu $a1, $zero, 2
L80021954:
  lui $v0, 0x8018
L80021958:
  addiu $v0, $v0, -26152
L8002195c:
  sw $v0, 736($gp)
L80021960:
  lui $v0, 0x801d
L80021964:
  lbu $v1, 605($gp)
L80021968:
  addiu $a0, $zero, 4
L8002196c:
  sb $a0, 22280($v0)
L80021970:
  addiu $v0, $v0, 22280
L80021974:
  lui $at, 0x800a
L80021978:
  sh $zero, -20152($at)
L8002197c:
  lui $at, 0x800a
L80021980:
  sh $zero, -20154($at)
L80021984:
  lui $at, 0x800a
L80021988:
  sb $zero, -19634($at)
L8002198c:
  lui $at, 0x800a
L80021990:
  sb $zero, -19627($at)
L80021994:
  sb $a0, 1($v0)
L80021998:
  addu $v1, $v1, $v0
L8002199c:
  sb $zero, 0($v1)
L800219a0:
  lbu $v0, 605($gp)
L800219a4:
  sll $zero, $zero, 0x0
L800219a8:
  beq $v0, $zero, L800219dc
L800219ac:
  addiu $a0, $zero, 29409
L800219b0:
  addiu $a0, $zero, 29425
L800219b4:
  lui $v0, 0x800a
L800219b8:
  lbu $v0, -19615($v0)
L800219bc:
  addiu $v1, $zero, 1
L800219c0:
  lui $at, 0x800a
L800219c4:
  sb $v1, -19627($at)
L800219c8:
  sll $v0, $v0, 0x18
L800219cc:
  sra $v0, $v0, 0x18
L800219d0:
  addiu $v0, $v0, -31960
L800219d4:
  lui $at, 0x800a
L800219d8:
  sh $v0, -19666($at)
L800219dc:
  jal 0x8003ff08
L800219e0:
  sll $zero, $zero, 0x0
L800219e4:
  lui $v0, 0x800a
L800219e8:
  lb $v0, -19616($v0)
L800219ec:
  sll $zero, $zero, 0x0
L800219f0:
  bgez $v0, L80021a28
L800219f4:
  sll $zero, $zero, 0x0
L800219f8:
  lui $v0, 0x800a
L800219fc:
  lb $v0, -19615($v0)
L80021a00:
  sll $zero, $zero, 0x0
L80021a04:
  bgez $v0, L80021a28
L80021a08:
  addiu $v1, $zero, 1
L80021a0c:
  lui $v0, 0x800a
L80021a10:
  lbu $v0, -19627($v0)
L80021a14:
  lui $at, 0x800a
L80021a18:
  sb $v1, -19634($at)
L80021a1c:
  addiu $v0, $v0, 2
L80021a20:
  lui $at, 0x800a
L80021a24:
  sb $v0, -19627($at)
L80021a28:
  lw $v0, 736($gp)
L80021a2c:
  jal L80021598
L80021a30:
  sb $zero, 57($v0)
L80021a34:
  lbu $v0, 605($gp)
L80021a38:
  lw $v1, 736($gp)
L80021a3c:
  sll $v0, $v0, 0x2
L80021a40:
  addu $v0, $v1, $v0
L80021a44:
  lw $a0, 44($v0)
L80021a48:
  sll $zero, $zero, 0x0
L80021a4c:
  slti $v0, $a0, 50
L80021a50:
  beq $v0, $zero, L80021a6c
L80021a54:
  addiu $v0, $zero, 1
L80021a58:
  bgez $a0, L80021a64
L80021a5c:
  sb $v0, 57($v1)
L80021a60:
  addu $a0, $zero, $zero
L80021a64:
  addiu $v0, $zero, 99
L80021a68:
  subu $a0, $v0, $a0
L80021a6c:
  slti $v0, $a0, 100
L80021a70:
  bne $v0, $zero, L80021a7c
L80021a74:
  sll $zero, $zero, 0x0
L80021a78:
  addiu $a0, $zero, 99
L80021a7c:
  addiu $a0, $a0, -50
L80021a80:
  lui $v0, 0x6666
L80021a84:
  ori $v0, $v0, 0x6667
L80021a88:
  mult $a0, $v0
L80021a8c:
  sra $v1, $a0, 0x1f
L80021a90:
  lw $a0, 736($gp)
L80021a94:
  mfhi $t0
L80021a98:
  sra $v0, $t0, 0x2
L80021a9c:
  subu $v0, $v0, $v1
L80021aa0:
  sb $v0, 56($a0)
L80021aa4:
  lw $v0, 736($gp)
L80021aa8:
  jal 0x8004002c
L80021aac:
  sb $zero, 55($v0)
L80021ab0:
  addu $a0, $v0, $zero
L80021ab4:
  jal 0x800400ac
L80021ab8:
  addiu $a1, $zero, 2
L80021abc:
  addu $s3, $v0, $zero
L80021ac0:
  addu $a0, $s3, $zero
L80021ac4:
  addiu $a1, $zero, 32
L80021ac8:
  addiu $a2, $zero, 16
L80021acc:
  addiu $a3, $zero, 3
L80021ad0:
  addiu $s2, $zero, 1
L80021ad4:
  addiu $v0, $zero, 2
L80021ad8:
  addiu $s1, $zero, 11
L80021adc:
  addiu $s0, $zero, 524
L80021ae0:
  sw $s2, 16($sp)
L80021ae4:
  sw $v0, 20($sp)
L80021ae8:
  sw $s1, 24($sp)
L80021aec:
  jal 0x800404cc
L80021af0:
  sw $s0, 28($sp)
L80021af4:
  jal 0x80042918
L80021af8:
  addu $a0, $s3, $zero
L80021afc:
  lhu $v0, 8($s3)
L80021b00:
  sll $zero, $zero, 0x0
L80021b04:
  ori $v0, $v0, 0x28
L80021b08:
  jal 0x8004002c
L80021b0c:
  sh $v0, 8($s3)
L80021b10:
  addu $a0, $v0, $zero
L80021b14:
  jal 0x800400ac
L80021b18:
  addiu $a1, $zero, 2
L80021b1c:
  addu $s3, $v0, $zero
L80021b20:
  addu $a0, $s3, $zero
L80021b24:
  addiu $a1, $zero, 288
L80021b28:
  addiu $a2, $zero, 16
L80021b2c:
  addiu $a3, $zero, 3
L80021b30:
  sw $s2, 16($sp)
L80021b34:
  sw $zero, 20($sp)
L80021b38:
  sw $s1, 24($sp)
L80021b3c:
  jal 0x800404cc
L80021b40:
  sw $s0, 28($sp)
L80021b44:
  jal 0x80042918
L80021b48:
  addu $a0, $s3, $zero
L80021b4c:
  lhu $v0, 8($s3)
L80021b50:
  addiu $s0, $zero, 9
L80021b54:
  ori $v0, $v0, 0x28
L80021b58:
  jal 0x8004002c
L80021b5c:
  sh $v0, 8($s3)
L80021b60:
  addu $a0, $v0, $zero
L80021b64:
  jal 0x800400ac
L80021b68:
  addiu $a1, $zero, 2
L80021b6c:
  addu $s3, $v0, $zero
L80021b70:
  addu $a0, $s3, $zero
L80021b74:
  addu $a1, $zero, $zero
L80021b78:
  addiu $a2, $zero, 8
L80021b7c:
  addu $a3, $a1, $zero
L80021b80:
  addiu $v0, $zero, 4
L80021b84:
  sw $v0, 16($sp)
L80021b88:
  addiu $v0, $zero, 16
L80021b8c:
  sw $v0, 24($sp)
L80021b90:
  addu $v0, $a2, $zero
L80021b94:
  sw $v0, 28($sp)
L80021b98:
  lui $v0, 0x801b
L80021b9c:
  addiu $v0, $v0, -4096
L80021ba0:
  sw $zero, 20($sp)
L80021ba4:
  jal 0x800428a8
L80021ba8:
  sw $v0, 32($sp)
L80021bac:
  jal 0x80042918
L80021bb0:
  addu $a0, $s3, $zero
L80021bb4:
  addu $a0, $s3, $zero
L80021bb8:
  jal 0x800428ec
L80021bbc:
  addiu $a1, $zero, -1
L80021bc0:
  lw $v1, 736($gp)
L80021bc4:
  lhu $v0, 8($s3)
L80021bc8:
  addiu $a0, $v1, 36
L80021bcc:
  ori $v0, $v0, 0x20
L80021bd0:
  sh $v0, 8($s3)
L80021bd4:
  sw $s3, 0($v1)
L80021bd8:
  sw $zero, 4($a0)
L80021bdc:
  addiu $s0, $s0, -1
L80021be0:
  bgez $s0, L80021bd8
L80021be4:
  addiu $a0, $a0, -4
L80021be8:
  lui $v0, 0x800a
L80021bec:
  lb $v0, -19616($v0)
L80021bf0:
  lui $at, 0x800a
L80021bf4:
  sh $zero, -19656($at)
L80021bf8:
  bgez $v0, L80021d1c
L80021bfc:
  sll $zero, $zero, 0x0
L80021c00:
  lui $v0, 0x800a
L80021c04:
  lb $v0, -19615($v0)
L80021c08:
  sll $zero, $zero, 0x0
L80021c0c:
  bltz $v0, L80021d1c
L80021c10:
  sll $zero, $zero, 0x0
L80021c14:
  lbu $v0, 605($gp)
L80021c18:
  sll $zero, $zero, 0x0
L80021c1c:
  bne $v0, $zero, L80021d20
L80021c20:
  sll $zero, $zero, 0x0
L80021c24:
  lw $v1, 736($gp)
L80021c28:
  sll $zero, $zero, 0x0
L80021c2c:
  lbu $v0, 56($v1)
L80021c30:
  sll $zero, $zero, 0x0
L80021c34:
  addiu $v0, $v0, 1
L80021c38:
  sb $v0, 58($v1)
L80021c3c:
  lw $v1, 736($gp)
L80021c40:
  sll $zero, $zero, 0x0
L80021c44:
  lbu $v0, 57($v1)
L80021c48:
  lbu $v1, 56($v1)
L80021c4c:
  sltu $v0, $zero, $v0
L80021c50:
  sltiu $v1, $v1, 3
L80021c54:
  beq $v1, $zero, L80021c60
L80021c58:
  sll $a0, $v0, 0x1
L80021c5c:
  addiu $a0, $zero, 1
L80021c60:
  jal L80021810
L80021c64:
  addu $s0, $zero, $zero
L80021c68:
  lw $a0, 736($gp)
L80021c6c:
  j 0x801aac40
L80021c70:
  sll $zero, $zero, 0x0
L80021c74:
  sh $v0, -19656($at)
L80021c78:
  sh $v0, 60($a0)
L80021c7c:
  sll $v0, $v0, 0x10
L80021c80:
  sra $v0, $v0, 0x10
L80021c84:
  sw $v0, 22184($v1)
L80021c88:
  lbu $v0, 58($a0)
L80021c8c:
  sll $zero, $zero, 0x0
L80021c90:
  beq $v0, $zero, L80021d1c
L80021c94:
  addiu $s2, $zero, 8
L80021c98:
  addiu $s1, $zero, 160
L80021c9c:
  jal 0x8004002c
L80021ca0:
  addiu $s0, $s0, 1
L80021ca4:
  addu $a0, $v0, $zero
L80021ca8:
  jal 0x800400ac
L80021cac:
  addiu $a1, $zero, 2
L80021cb0:
  addu $s3, $v0, $zero
L80021cb4:
  addu $a0, $s3, $zero
L80021cb8:
  addu $a1, $s1, $zero
L80021cbc:
  addiu $a2, $zero, 192
L80021cc0:
  addiu $a3, $zero, 3
L80021cc4:
  addiu $v0, $zero, 4
L80021cc8:
  sw $v0, 16($sp)
L80021ccc:
  addiu $v0, $zero, 11
L80021cd0:
  sw $v0, 24($sp)
L80021cd4:
  addiu $v0, $zero, 524
L80021cd8:
  sw $zero, 20($sp)
L80021cdc:
  jal 0x800404cc
L80021ce0:
  sw $v0, 28($sp)
L80021ce4:
  jal 0x80042918
L80021ce8:
  addu $a0, $s3, $zero
L80021cec:
  addiu $s1, $s1, 20
L80021cf0:
  lhu $v0, 8($s3)
L80021cf4:
  lw $v1, 736($gp)
L80021cf8:
  ori $v0, $v0, 0x20
L80021cfc:
  sh $v0, 8($s3)
L80021d00:
  addu $v0, $v1, $s2
L80021d04:
  sw $s3, 4($v0)
L80021d08:
  lbu $v0, 58($v1)
L80021d0c:
  sll $zero, $zero, 0x0
L80021d10:
  slt $v0, $s0, $v0
L80021d14:
  bne $v0, $zero, L80021c9c
L80021d18:
  addiu $s2, $s2, 4
L80021d1c:
  lbu $v0, 605($gp)
L80021d20:
  lui $v1, 0x800a
L80021d24:
  addiu $v1, $v1, -19616
L80021d28:
  addu $v0, $v0, $v1
L80021d2c:
  lb $v0, 0($v0)
L80021d30:
  sll $zero, $zero, 0x0
L80021d34:
  bgez $v0, L80022050
L80021d38:
  sll $zero, $zero, 0x0
L80021d3c:
  jal 0x8004002c
L80021d40:
  addiu $s1, $zero, 8
L80021d44:
  addu $a0, $v0, $zero
L80021d48:
  jal 0x800400ac
L80021d4c:
  addiu $a1, $zero, 2
L80021d50:
  addu $s3, $v0, $zero
L80021d54:
  addu $a0, $s3, $zero
L80021d58:
  addu $a1, $zero, $zero
L80021d5c:
  addiu $a2, $zero, 16
L80021d60:
  addu $a3, $a1, $zero
L80021d64:
  addiu $v0, $zero, 5
L80021d68:
  addu $s2, $a2, $zero
L80021d6c:
  lw $v1, 736($gp)
L80021d70:
  lui $s0, 0x801b
L80021d74:
  sw $v0, 16($sp)
L80021d78:
  lbu $v0, 57($v1)
L80021d7c:
  addiu $s0, $s0, -4096
L80021d80:
  sw $s2, 24($sp)
L80021d84:
  sw $s1, 28($sp)
L80021d88:
  sw $s0, 32($sp)
L80021d8c:
  jal 0x800428a8
L80021d90:
  sw $v0, 20($sp)
L80021d94:
  jal 0x80042918
L80021d98:
  addu $a0, $s3, $zero
L80021d9c:
  addu $a0, $s3, $zero
L80021da0:
  jal 0x800428ec
L80021da4:
  addiu $a1, $zero, -2
L80021da8:
  lhu $v0, 8($s3)
L80021dac:
  lw $v1, 736($gp)
L80021db0:
  ori $v0, $v0, 0x20
L80021db4:
  sh $v0, 8($s3)
L80021db8:
  jal 0x8004002c
L80021dbc:
  sw $s3, 4($v1)
L80021dc0:
  addu $a0, $v0, $zero
L80021dc4:
  jal 0x800400ac
L80021dc8:
  addiu $a1, $zero, 2
L80021dcc:
  addu $s3, $v0, $zero
L80021dd0:
  addu $a0, $s3, $zero
L80021dd4:
  addu $a1, $zero, $zero
L80021dd8:
  addiu $a2, $zero, 16
L80021ddc:
  lw $v1, 736($gp)
L80021de0:
  addiu $v0, $zero, 6
L80021de4:
  sw $v0, 16($sp)
L80021de8:
  lbu $v0, 56($v1)
L80021dec:
  addu $a3, $a1, $zero
L80021df0:
  sw $s2, 24($sp)
L80021df4:
  sw $s1, 28($sp)
L80021df8:
  sw $s0, 32($sp)
L80021dfc:
  jal 0x800428a8
L80021e00:
  sw $v0, 20($sp)
L80021e04:
  jal 0x80042918
L80021e08:
  addu $a0, $s3, $zero
L80021e0c:
  addu $a0, $s3, $zero
L80021e10:
  jal 0x800428ec
L80021e14:
  addiu $a1, $zero, -1
L80021e18:
  lhu $v0, 8($s3)
L80021e1c:
  lw $v1, 736($gp)
L80021e20:
  ori $v0, $v0, 0x20
L80021e24:
  sh $v0, 8($s3)
L80021e28:
  j L80022050
L80021e2c:
  sw $s3, 8($v1)
L80021e30:
  beq $v0, $zero, L80021fb0
L80021e34:
  lui $v0, 0x800f
L80021e38:
  addiu $s0, $v0, -24888
L80021e3c:
  lbu $v0, 6($s0)
L80021e40:
  sll $zero, $zero, 0x0
L80021e44:
  andi $v0, $v0, 0x80
L80021e48:
  bne $v0, $zero, L8002209c
L80021e4c:
  andi $v0, $v1, 0x2000
L80021e50:
  bne $v0, $zero, L80021e7c
L80021e54:
  ori $v0, $v1, 0x2000
L80021e58:
  sh $v0, 818($gp)
L80021e5c:
  jal 0x80015904
L80021e60:
  sll $zero, $zero, 0x0
L80021e64:
  addiu $a0, $zero, 255
L80021e68:
  addu $v0, $a0, $zero
L80021e6c:
  jal 0x800156b8
L80021e70:
  sb $v0, 4($s0)
L80021e74:
  j L8002209c
L80021e78:
  sll $zero, $zero, 0x0
L80021e7c:
  lbu $v1, 605($gp)
L80021e80:
  addiu $v0, $gp, 720
L80021e84:
  sll $v1, $v1, 0x2
L80021e88:
  addu $v1, $v1, $v0
L80021e8c:
  lhu $v0, 612($gp)
L80021e90:
  lw $v1, 0($v1)
L80021e94:
  ori $v0, $v0, 0x2000
L80021e98:
  sh $v0, 612($gp)
L80021e9c:
  beq $v1, $zero, L8002209c
L80021ea0:
  sll $zero, $zero, 0x0
L80021ea4:
  lui $v0, 0x800a
L80021ea8:
  lb $v0, -19616($v0)
L80021eac:
  sll $zero, $zero, 0x0
L80021eb0:
  bgez $v0, L80021f24
L80021eb4:
  sll $zero, $zero, 0x0
L80021eb8:
  lui $v0, 0x800a
L80021ebc:
  lb $v0, -19615($v0)
L80021ec0:
  sll $zero, $zero, 0x0
L80021ec4:
  bltz $v0, L80021f24
L80021ec8:
  sll $zero, $zero, 0x0
L80021ecc:
  lw $v0, 736($gp)
L80021ed0:
  lw $a0, 720($gp)
L80021ed4:
  lbu $v1, 58($v0)
L80021ed8:
  lw $v0, 1504($a0)
L80021edc:
  sll $a1, $v1, 0x4
L80021ee0:
  subu $v1, $a1, $v1
L80021ee4:
  addu $v0, $v0, $v1
L80021ee8:
  sw $v0, 1504($a0)
L80021eec:
  lui $v1, 0xf
L80021ef0:
  lw $v0, 1504($a0)
L80021ef4:
  ori $v1, $v1, 0x423f
L80021ef8:
  sltu $v0, $v1, $v0
L80021efc:
  beq $v0, $zero, L80021f08
L80021f00:
  sll $zero, $zero, 0x0
L80021f04:
  sw $v1, 1504($a0)
L80021f08:
  lw $v0, 736($gp)
L80021f0c:
  sll $zero, $zero, 0x0
L80021f10:
  j 0x801aad4c
L80021f14:
  sll $zero, $zero, 0x0
L80021f18:
  sll $zero, $zero, 0x0
L80021f1c:
  j L8002209c
L80021f20:
  sll $zero, $zero, 0x0
L80021f24:
  lbu $v0, 605($gp)
L80021f28:
  addiu $a1, $gp, 720
L80021f2c:
  sll $v0, $v0, 0x2
L80021f30:
  addu $a0, $v0, $a1
L80021f34:
  lw $v1, 0($a0)
L80021f38:
  sll $zero, $zero, 0x0
L80021f3c:
  lhu $v0, 1304($v1)
L80021f40:
  sll $zero, $zero, 0x0
L80021f44:
  addiu $v0, $v0, 1
L80021f48:
  sh $v0, 1304($v1)
L80021f4c:
  andi $v0, $v0, 0xffff
L80021f50:
  sltiu $v0, $v0, 10000
L80021f54:
  bne $v0, $zero, L80021f68
L80021f58:
  addiu $v0, $zero, 9999
L80021f5c:
  lw $v1, 0($a0)
L80021f60:
  sll $zero, $zero, 0x0
L80021f64:
  sh $v0, 1304($v1)
L80021f68:
  lbu $v0, 605($gp)
L80021f6c:
  sll $zero, $zero, 0x0
L80021f70:
  xori $v0, $v0, 0x1
L80021f74:
  sll $v0, $v0, 0x2
L80021f78:
  addu $a0, $v0, $a1
L80021f7c:
  lw $v1, 0($a0)
L80021f80:
  sll $zero, $zero, 0x0
L80021f84:
  lhu $v0, 1306($v1)
L80021f88:
  sll $zero, $zero, 0x0
L80021f8c:
  addiu $v0, $v0, 1
L80021f90:
  sh $v0, 1306($v1)
L80021f94:
  andi $v0, $v0, 0xffff
L80021f98:
  sltiu $v0, $v0, 10000
L80021f9c:
  bne $v0, $zero, L8002209c
L80021fa0:
  addiu $v0, $zero, 9999
L80021fa4:
  lw $v1, 0($a0)
L80021fa8:
  j L8002209c
L80021fac:
  sh $v0, 1306($v1)
L80021fb0:
  lui $v0, 0x800a
L80021fb4:
  lhu $v0, -19564($v0)
L80021fb8:
  sll $zero, $zero, 0x0
L80021fbc:
  andi $v0, $v0, 0xa000
L80021fc0:
  beq $v0, $zero, L8002206c
L80021fc4:
  sll $zero, $zero, 0x0
L80021fc8:
  lw $v0, 736($gp)
L80021fcc:
  sll $zero, $zero, 0x0
L80021fd0:
  lbu $v1, 55($v0)
L80021fd4:
  sll $zero, $zero, 0x0
L80021fd8:
  addiu $v1, $v1, 1
L80021fdc:
  sb $v1, 55($v0)
L80021fe0:
  lui $v0, 0x800a
L80021fe4:
  lhu $v0, -19564($v0)
L80021fe8:
  sll $zero, $zero, 0x0
L80021fec:
  andi $v0, $v0, 0x8000
L80021ff0:
  beq $v0, $zero, L80022028
L80021ff4:
  sll $zero, $zero, 0x0
L80021ff8:
  lw $v1, 736($gp)
L80021ffc:
  sll $zero, $zero, 0x0
L80022000:
  lbu $v0, 55($v1)
L80022004:
  sll $zero, $zero, 0x0
L80022008:
  addiu $v0, $v0, -2
L8002200c:
  sb $v0, 55($v1)
L80022010:
  sll $v0, $v0, 0x18
L80022014:
  bgez $v0, L80022028
L80022018:
  addiu $v0, $zero, 2
L8002201c:
  lw $v1, 736($gp)
L80022020:
  sll $zero, $zero, 0x0
L80022024:
  sb $v0, 55($v1)
L80022028:
  lw $v1, 736($gp)
L8002202c:
  sll $zero, $zero, 0x0
L80022030:
  lb $v0, 55($v1)
L80022034:
  sll $zero, $zero, 0x0
L80022038:
  slti $v0, $v0, 3
L8002203c:
  bne $v0, $zero, L80022048
L80022040:
  sll $zero, $zero, 0x0
L80022044:
  sb $zero, 55($v1)
L80022048:
  jal 0x8003fee0
L8002204c:
  addiu $a0, $zero, 6
L80022050:
  lw $v0, 736($gp)
L80022054:
  sll $zero, $zero, 0x0
L80022058:
  lb $a0, 55($v0)
L8002205c:
  jal L80021480
L80022060:
  sll $zero, $zero, 0x0
L80022064:
  j L8002209c
L80022068:
  sll $zero, $zero, 0x0
L8002206c:
  lui $v0, 0x800a
L80022070:
  lhu $v0, -19560($v0)
L80022074:
  sll $zero, $zero, 0x0
L80022078:
  andi $v0, $v0, 0x40
L8002207c:
  beq $v0, $zero, L8002209c
L80022080:
  ori $v0, $v1, 0x4000
L80022084:
  sh $v0, 818($gp)
L80022088:
  addu $a0, $zero, $zero
L8002208c:
  jal 0x80015bd8
L80022090:
  addiu $a1, $zero, 6
L80022094:
  jal 0x8003fee0
L80022098:
  addiu $a0, $zero, 48
L8002209c:
  lw $ra, 56($sp)
L800220a0:
  lw $s3, 52($sp)
L800220a4:
  lw $s2, 48($sp)
L800220a8:
  lw $s1, 44($sp)
L800220ac:
  lw $s0, 40($sp)
L800220b0:
  jr $ra
L800220b4:
  addiu $sp, $sp, 64
L800220b8:
  lui $v0, 0x800a
L800220bc:
  lhu $v0, -19560($v0)
L800220c0:
  addiu $sp, $sp, -24
L800220c4:
  sw $ra, 20($sp)
L800220c8:
  andi $v0, $v0, 0x100
L800220cc:
  beq $v0, $zero, L800220ec
L800220d0:
  sw $s0, 16($sp)
L800220d4:
  lui $v0, 0x800a
L800220d8:
  lw $v0, -19700($v0)
L800220dc:
  sll $zero, $zero, 0x0
L800220e0:
  xori $v0, $v0, 0x1
L800220e4:
  lui $at, 0x800a
L800220e8:
  sw $v0, -19700($at)
L800220ec:
  lui $a1, 0x800f
L800220f0:
  lui $v0, 0x800a
L800220f4:
  lhu $v0, -19564($v0)
L800220f8:
  sll $zero, $zero, 0x0
L800220fc:
  andi $v0, $v0, 0xc
L80022100:
  beq $v0, $zero, L80022150
L80022104:
  addiu $s0, $a1, 10312
L80022108:
  lui $v0, 0x800a
L8002210c:
  lhu $v0, -19548($v0)
L80022110:
  sll $zero, $zero, 0x0
L80022114:
  andi $v0, $v0, 0x40
L80022118:
  beq $v0, $zero, L80022124
L8002211c:
  addiu $a0, $zero, 2
L80022120:
  addiu $a0, $zero, 16
L80022124:
  lh $v1, 10312($a1)
L80022128:
  lui $v0, 0x800a
L8002212c:
  lhu $v0, -19564($v0)
L80022130:
  sll $zero, $zero, 0x0
L80022134:
  andi $v0, $v0, 0x4
L80022138:
  beq $v0, $zero, L80022148
L8002213c:
  addu $v1, $v1, $a0
L80022140:
  sll $v0, $a0, 0x1
L80022144:
  subu $v1, $v1, $v0
L80022148:
  jal 0x8001352c
L8002214c:
  sh $v1, 10312($a1)
L80022150:
  lui $v0, 0x800a
L80022154:
  lhu $v0, -19564($v0)
L80022158:
  sll $zero, $zero, 0x0
L8002215c:
  andi $v0, $v0, 0xf000
L80022160:
  beq $v0, $zero, L800222e4
L80022164:
  sll $zero, $zero, 0x0
L80022168:
  lui $v0, 0x800a
L8002216c:
  lhu $v0, -19548($v0)
L80022170:
  sll $zero, $zero, 0x0
L80022174:
  andi $v0, $v0, 0x10
L80022178:
  beq $v0, $zero, L80022240
L8002217c:
  sll $zero, $zero, 0x0
L80022180:
  lui $v0, 0x800a
L80022184:
  lhu $v0, -19548($v0)
L80022188:
  sll $zero, $zero, 0x0
L8002218c:
  andi $v0, $v0, 0x40
L80022190:
  beq $v0, $zero, L8002219c
L80022194:
  addiu $a0, $zero, 2
L80022198:
  addiu $a0, $zero, 16
L8002219c:
  lui $v0, 0x800a
L800221a0:
  lhu $v0, -19564($v0)
L800221a4:
  sll $zero, $zero, 0x0
L800221a8:
  andi $v0, $v0, 0x2000
L800221ac:
  beq $v0, $zero, L800221c4
L800221b0:
  sll $zero, $zero, 0x0
L800221b4:
  lw $v0, 28($s0)
L800221b8:
  sll $zero, $zero, 0x0
L800221bc:
  addu $v0, $v0, $a0
L800221c0:
  sw $v0, 28($s0)
L800221c4:
  lui $v0, 0x800a
L800221c8:
  lhu $v0, -19564($v0)
L800221cc:
  sll $zero, $zero, 0x0
L800221d0:
  andi $v0, $v0, 0x4000
L800221d4:
  beq $v0, $zero, L800221ec
L800221d8:
  sll $zero, $zero, 0x0
L800221dc:
  lw $v0, 36($s0)
L800221e0:
  sll $zero, $zero, 0x0
L800221e4:
  subu $v0, $v0, $a0
L800221e8:
  sw $v0, 36($s0)
L800221ec:
  lui $v0, 0x800a
L800221f0:
  lhu $v0, -19564($v0)
L800221f4:
  sll $zero, $zero, 0x0
L800221f8:
  andi $v0, $v0, 0x8000
L800221fc:
  beq $v0, $zero, L80022214
L80022200:
  sll $zero, $zero, 0x0
L80022204:
  lw $v0, 28($s0)
L80022208:
  sll $zero, $zero, 0x0
L8002220c:
  subu $v0, $v0, $a0
L80022210:
  sw $v0, 28($s0)
L80022214:
  lui $v0, 0x800a
L80022218:
  lhu $v0, -19564($v0)
L8002221c:
  sll $zero, $zero, 0x0
L80022220:
  andi $v0, $v0, 0x1000
L80022224:
  beq $v0, $zero, L800222dc
L80022228:
  sll $zero, $zero, 0x0
L8002222c:
  lw $v0, 36($s0)
L80022230:
  sll $zero, $zero, 0x0
L80022234:
  addu $v0, $v0, $a0
L80022238:
  j L800222dc
L8002223c:
  sw $v0, 36($s0)
L80022240:
  lui $v0, 0x800a
L80022244:
  lhu $v0, -19548($v0)
L80022248:
  addiu $v1, $zero, 32
L8002224c:
  and $v0, $v0, $v1
L80022250:
  beq $v0, $zero, L8002225c
L80022254:
  sll $zero, $zero, 0x0
L80022258:
  addiu $v1, $zero, 128
L8002225c:
  lh $a1, 2($s0)
L80022260:
  lui $v0, 0x800a
L80022264:
  lhu $v0, -19564($v0)
L80022268:
  lh $a0, 4($s0)
L8002226c:
  andi $v0, $v0, 0x1000
L80022270:
  beq $v0, $zero, L8002227c
L80022274:
  sll $zero, $zero, 0x0
L80022278:
  addu $a0, $a0, $v1
L8002227c:
  lui $v0, 0x800a
L80022280:
  lhu $v0, -19564($v0)
L80022284:
  sll $zero, $zero, 0x0
L80022288:
  andi $v0, $v0, 0x4000
L8002228c:
  beq $v0, $zero, L80022298
L80022290:
  sll $zero, $zero, 0x0
L80022294:
  subu $a0, $a0, $v1
L80022298:
  lui $v0, 0x800a
L8002229c:
  lhu $v0, -19564($v0)
L800222a0:
  sll $zero, $zero, 0x0
L800222a4:
  andi $v0, $v0, 0x2000
L800222a8:
  beq $v0, $zero, L800222b4
L800222ac:
  sll $zero, $zero, 0x0
L800222b0:
  subu $a1, $a1, $v1
L800222b4:
  lui $v0, 0x800a
L800222b8:
  lhu $v0, -19564($v0)
L800222bc:
  sll $zero, $zero, 0x0
L800222c0:
  andi $v0, $v0, 0x8000
L800222c4:
  beq $v0, $zero, L800222d0
L800222c8:
  lui $v0, 0x800f
L800222cc:
  addu $a1, $a1, $v1
L800222d0:
  addiu $v0, $v0, 10312
L800222d4:
  sh $a1, 2($v0)
L800222d8:
  sh $a0, 4($v0)
L800222dc:
  jal 0x8001352c
L800222e0:
  sll $zero, $zero, 0x0
L800222e4:
  lw $ra, 20($sp)
L800222e8:
  lw $s0, 16($sp)
L800222ec:
  jr $ra
L800222f0:
  addiu $sp, $sp, 24
L800222f4:
  lui $v0, 0x800a
L800222f8:
  lhu $v0, -19548($v0)
L800222fc:
  addiu $sp, $sp, -24
L80022300:
  sw $ra, 20($sp)
L80022304:
  andi $v0, $v0, 0x800
L80022308:
  beq $v0, $zero, L80022318
L8002230c:
  sw $s0, 16($sp)
L80022310:
  jal L800220b8
L80022314:
  sll $zero, $zero, 0x0
L80022318:
  lhu $v1, 818($gp)
L8002231c:
  sll $zero, $zero, 0x0
L80022320:
  andi $v0, $v1, 0x8000
L80022324:
  bne $v0, $zero, L80022358
L80022328:
  andi $v0, $v1, 0x4000
L8002232c:
  ori $v0, $v1, 0xc000
L80022330:
  sh $v0, 818($gp)
L80022334:
  sb $zero, 614($gp)
L80022338:
  sb $zero, 38($gp)
L8002233c:
  sb $zero, 34($gp)
L80022340:
  sb $zero, 37($gp)
L80022344:
  sw $zero, 636($gp)
L80022348:
  sw $zero, 632($gp)
L8002234c:
  lhu $v1, 818($gp)
L80022350:
  sll $zero, $zero, 0x0
L80022354:
  andi $v0, $v1, 0x4000
L80022358:
  beq $v0, $zero, L80022460
L8002235c:
  andi $v0, $v1, 0xbfff
L80022360:
  sh $v0, 818($gp)
L80022364:
  jal 0x80029528
L80022368:
  addu $a0, $zero, $zero
L8002236c:
  lw $a0, 632($gp)
L80022370:
  jal 0x8004036c
L80022374:
  sll $zero, $zero, 0x0
L80022378:
  lw $a0, 636($gp)
L8002237c:
  jal 0x8004036c
L80022380:
  sll $zero, $zero, 0x0
L80022384:
  lbu $v1, 38($gp)
L80022388:
  addiu $v0, $zero, 1
L8002238c:
  sw $zero, 636($gp)
L80022390:
  sw $zero, 632($gp)
L80022394:
  beq $v1, $v0, L800223bc
L80022398:
  slti $v0, $v1, 2
L8002239c:
  bne $v0, $zero, L80022608
L800223a0:
  addiu $v0, $zero, 2
L800223a4:
  beq $v1, $v0, L8002240c
L800223a8:
  addiu $v0, $zero, 3
L800223ac:
  beq $v1, $v0, L8002242c
L800223b0:
  lui $s0, 0x801a
L800223b4:
  j L80022608
L800223b8:
  sll $zero, $zero, 0x0
L800223bc:
  addu $a0, $zero, $zero
L800223c0:
  jal 0x80029164
L800223c4:
  addiu $a1, $zero, 1
L800223c8:
  jal 0x800137e4
L800223cc:
  sll $zero, $zero, 0x0
L800223d0:
  addu $a0, $zero, $zero
L800223d4:
  addiu $a1, $zero, -1
L800223d8:
  jal 0x800291e0
L800223dc:
  addu $a2, $a1, $zero
L800223e0:
  addiu $a0, $zero, 4
L800223e4:
  addu $s0, $v0, $zero
L800223e8:
  addiu $v0, $zero, 90
L800223ec:
  sh $v0, 48($s0)
L800223f0:
  addiu $v0, $zero, 22
L800223f4:
  jal 0x80012d84
L800223f8:
  sh $v0, 50($s0)
L800223fc:
  jal 0x8001944c
L80022400:
  addu $a0, $s0, $zero
L80022404:
  j L80022608
L80022408:
  sll $zero, $zero, 0x0
L8002240c:
  lui $a0, 0x801a
L80022410:
  addiu $a0, $a0, 31616
L80022414:
  addiu $a1, $zero, 134
L80022418:
  jal 0x80017f04
L8002241c:
  addiu $a2, $zero, 82
L80022420:
  sw $v0, 632($gp)
L80022424:
  j L80022608
L80022428:
  sll $zero, $zero, 0x0
L8002242c:
  addiu $s0, $s0, 31616
L80022430:
  addu $a0, $s0, $zero
L80022434:
  addiu $a1, $zero, 92
L80022438:
  jal 0x80017f04
L8002243c:
  addiu $a2, $zero, 82
L80022440:
  addiu $a0, $s0, 28
L80022444:
  addiu $a1, $zero, 176
L80022448:
  sw $v0, 632($gp)
L8002244c:
  jal 0x80017f04
L80022450:
  addiu $a2, $zero, 82
L80022454:
  sw $v0, 636($gp)
L80022458:
  j L80022608
L8002245c:
  sll $zero, $zero, 0x0
L80022460:
  lui $v0, 0x800a
L80022464:
  lhu $v0, -19560($v0)
L80022468:
  sll $zero, $zero, 0x0
L8002246c:
  andi $v0, $v0, 0x100
L80022470:
  beq $v0, $zero, L800224a4
L80022474:
  ori $v1, $v1, 0x4000
L80022478:
  lbu $v0, 38($gp)
L8002247c:
  sh $v1, 818($gp)
L80022480:
  addiu $v0, $v0, 1
L80022484:
  sb $v0, 38($gp)
L80022488:
  andi $v0, $v0, 0xff
L8002248c:
  sltiu $v0, $v0, 4
L80022490:
  bne $v0, $zero, L80022608
L80022494:
  sll $zero, $zero, 0x0
L80022498:
  sb $zero, 38($gp)
L8002249c:
  j L80022608
L800224a0:
  sll $zero, $zero, 0x0
L800224a4:
  lui $v0, 0x800a
L800224a8:
  lhu $v0, -19560($v0)
L800224ac:
  sll $zero, $zero, 0x0
L800224b0:
  andi $v0, $v0, 0xa000
L800224b4:
  beq $v0, $zero, L800224d4
L800224b8:
  sll $zero, $zero, 0x0
L800224bc:
  lbu $v0, 34($gp)
L800224c0:
  sll $zero, $zero, 0x0
L800224c4:
  xori $v0, $v0, 0x1
L800224c8:
  sb $v0, 34($gp)
L800224cc:
  j L80022608
L800224d0:
  sll $zero, $zero, 0x0
L800224d4:
  lui $v0, 0x800a
L800224d8:
  lhu $v0, -19564($v0)
L800224dc:
  sll $zero, $zero, 0x0
L800224e0:
  andi $v0, $v0, 0x5000
L800224e4:
  beq $v0, $zero, L80022540
L800224e8:
  sll $zero, $zero, 0x0
L800224ec:
  lbu $v0, 34($gp)
L800224f0:
  addiu $a0, $gp, 36
L800224f4:
  addu $v0, $v0, $a0
L800224f8:
  lbu $v1, 0($v0)
L800224fc:
  sll $zero, $zero, 0x0
L80022500:
  addiu $v1, $v1, 1
L80022504:
  sb $v1, 0($v0)
L80022508:
  lui $v0, 0x800a
L8002250c:
  lhu $v0, -19564($v0)
L80022510:
  sll $zero, $zero, 0x0
L80022514:
  andi $v0, $v0, 0x4000
L80022518:
  beq $v0, $zero, L80022608
L8002251c:
  sll $zero, $zero, 0x0
L80022520:
  lbu $v1, 34($gp)
L80022524:
  sll $zero, $zero, 0x0
L80022528:
  addu $v1, $v1, $a0
L8002252c:
  lbu $v0, 0($v1)
L80022530:
  sll $zero, $zero, 0x0
L80022534:
  addiu $v0, $v0, -2
L80022538:
  j L80022608
L8002253c:
  sb $v0, 0($v1)
L80022540:
  lui $v0, 0x800a
L80022544:
  lhu $v0, -19560($v0)
L80022548:
  sll $zero, $zero, 0x0
L8002254c:
  andi $v0, $v0, 0x40
L80022550:
  beq $v0, $zero, L80022608
L80022554:
  sll $zero, $zero, 0x0
L80022558:
  lbu $a0, 36($gp)
L8002255c:
  jal 0x8002c604
L80022560:
  sll $zero, $zero, 0x0
L80022564:
  lbu $v1, 614($gp)
L80022568:
  sll $zero, $zero, 0x0
L8002256c:
  addiu $v1, $v1, 1
L80022570:
  andi $v1, $v1, 0x7
L80022574:
  sb $v1, 614($gp)
L80022578:
  lbu $v1, 37($gp)
L8002257c:
  addu $a1, $v0, $zero
L80022580:
  sh $v1, 26($v0)
L80022584:
  lbu $v1, 38($gp)
L80022588:
  addiu $v0, $zero, 1
L8002258c:
  beq $v1, $v0, L800225ec
L80022590:
  addiu $v0, $zero, 160
L80022594:
  slti $v0, $v1, 2
L80022598:
  beq $v0, $zero, L800225b0
L8002259c:
  sll $zero, $zero, 0x0
L800225a0:
  beq $v1, $zero, L800225cc
L800225a4:
  lui $v1, 0x8009
L800225a8:
  j L80022608
L800225ac:
  sll $zero, $zero, 0x0
L800225b0:
  addiu $v0, $zero, 2
L800225b4:
  beq $v1, $v0, L800225f8
L800225b8:
  addiu $v0, $zero, 3
L800225bc:
  beq $v1, $v0, L800225fc
L800225c0:
  addiu $v0, $zero, 160
L800225c4:
  j L80022608
L800225c8:
  sll $zero, $zero, 0x0
L800225cc:
  addiu $v1, $v1, 2208
L800225d0:
  lhu $a0, 24($v1)
L800225d4:
  addiu $v0, $zero, -24
L800225d8:
  sh $v0, 2($a1)
L800225dc:
  sh $a0, 0($a1)
L800225e0:
  lhu $v0, 26($v1)
L800225e4:
  j L80022608
L800225e8:
  sh $v0, 4($a1)
L800225ec:
  sh $v0, 0($a1)
L800225f0:
  j L80022604
L800225f4:
  addiu $v0, $zero, 120
L800225f8:
  addiu $v0, $zero, 160
L800225fc:
  sh $v0, 0($a1)
L80022600:
  addiu $v0, $zero, 112
L80022604:
  sh $v0, 2($a1)
L80022608:
  lw $ra, 20($sp)
L8002260c:
  lw $s0, 16($sp)
L80022610:
  jr $ra
L80022614:
  addiu $sp, $sp, 24
L80022618:
  addiu $sp, $sp, -24
L8002261c:
  sw $ra, 16($sp)
L80022620:
  jal L800222f4
L80022624:
  sll $zero, $zero, 0x0
L80022628:
  lui $a0, 0x8001
L8002262c:
  lbu $a1, 36($gp)
L80022630:
  lbu $a2, 37($gp)
L80022634:
  jal 0x8007ef84
L80022638:
  addiu $a0, $a0, 116
L8002263c:
  lbu $v0, 34($gp)
L80022640:
  sll $zero, $zero, 0x0
L80022644:
  beq $v0, $zero, L80022654
L80022648:
  lui $a0, 0x8001
L8002264c:
  j L8002265c
L80022650:
  addiu $a0, $a0, 144
L80022654:
  lui $a0, 0x8001
L80022658:
  addiu $a0, $a0, 168
L8002265c:
  jal 0x8007ef84
L80022660:
  sll $zero, $zero, 0x0
L80022664:
  lw $ra, 16($sp)
L80022668:
  sll $zero, $zero, 0x0
L8002266c:
  jr $ra
L80022670:
  addiu $sp, $sp, 24
L80022674:
  addiu $sp, $sp, -32
L80022678:
  sw $s0, 16($sp)
L8002267c:
  addu $s0, $a0, $zero
L80022680:
  sw $ra, 24($sp)
L80022684:
  sw $s1, 20($sp)
L80022688:
  lbu $v0, 106($s0)
L8002268c:
  sll $zero, $zero, 0x0
L80022690:
  sll $v1, $v0, 0x3
L80022694:
  subu $v1, $v1, $v0
L80022698:
  sll $v1, $v1, 0x2
L8002269c:
  lui $v0, 0x801a
L800226a0:
  addiu $v0, $v0, 31448
L800226a4:
  jal 0x80042b98
L800226a8:
  addu $s1, $v1, $v0
L800226ac:
  bne $v0, $zero, L800226dc
L800226b0:
  sll $zero, $zero, 0x0
L800226b4:
  lhu $a0, 22($s1)
L800226b8:
  sll $zero, $zero, 0x0
L800226bc:
  andi $v0, $a0, 0x1000
L800226c0:
  bne $v0, $zero, L800226d8
L800226c4:
  addu $v1, $zero, $zero
L800226c8:
  andi $v0, $a0, 0x800
L800226cc:
  beq $v0, $zero, L800226d8
L800226d0:
  addiu $v1, $zero, 1
L800226d4:
  addiu $v1, $zero, 2
L800226d8:
  sh $v1, 46($s0)
L800226dc:
  lh $v1, 46($s0)
L800226e0:
  addiu $v0, $zero, 1
L800226e4:
  beq $v1, $v0, L800227a8
L800226e8:
  slti $v0, $v1, 2
L800226ec:
  beq $v0, $zero, L80022704
L800226f0:
  sll $zero, $zero, 0x0
L800226f4:
  beq $v1, $zero, L80022718
L800226f8:
  sll $zero, $zero, 0x0
L800226fc:
  j L800229e0
L80022700:
  sll $zero, $zero, 0x0
L80022704:
  addiu $v0, $zero, 2
L80022708:
  beq $v1, $v0, L800228bc
L8002270c:
  sll $zero, $zero, 0x0
L80022710:
  j L800229e0
L80022714:
  sll $zero, $zero, 0x0
L80022718:
  lbu $v1, 108($s0)
L8002271c:
  sll $zero, $zero, 0x0
L80022720:
  andi $v0, $v1, 0x40
L80022724:
  bne $v0, $zero, L80022774
L80022728:
  ori $v0, $v1, 0x40
L8002272c:
  sb $v0, 108($s0)
L80022730:
  addiu $v0, $zero, 8
L80022734:
  sh $v0, 96($s0)
L80022738:
  lhu $v0, 22($s1)
L8002273c:
  sll $zero, $zero, 0x0
L80022740:
  ori $v0, $v0, 0x400
L80022744:
  sh $v0, 22($s1)
L80022748:
  lhu $v0, 8($s0)
L8002274c:
  ori $v1, $zero, 0x8000
L80022750:
  sw $v1, 32($s0)
L80022754:
  ori $v0, $v0, 0x4
L80022758:
  sh $v0, 8($s0)
L8002275c:
  lhu $v0, 22($s1)
L80022760:
  sll $zero, $zero, 0x0
L80022764:
  andi $v0, $v0, 0x800
L80022768:
  beq $v0, $zero, L80022774
L8002276c:
  addiu $v0, $zero, 192
L80022770:
  sb $v0, 34($s0)
L80022774:
  lhu $v0, 96($s0)
L80022778:
  sll $zero, $zero, 0x0
L8002277c:
  addiu $v0, $v0, -1
L80022780:
  sh $v0, 96($s0)
L80022784:
  sll $v0, $v0, 0x10
L80022788:
  beq $v0, $zero, L800229e0
L8002278c:
  sll $zero, $zero, 0x0
L80022790:
  addu $a0, $s0, $zero
L80022794:
  sb $zero, 108($a0)
L80022798:
  jal 0x80017e3c
L8002279c:
  sw $zero, 36($a0)
L800227a0:
  j L800229e0
L800227a4:
  sll $zero, $zero, 0x0
L800227a8:
  lbu $v1, 108($s0)
L800227ac:
  sll $zero, $zero, 0x0
L800227b0:
  andi $v0, $v1, 0x40
L800227b4:
  bne $v0, $zero, L800227dc
L800227b8:
  ori $v0, $v1, 0x40
L800227bc:
  sb $v0, 108($s0)
L800227c0:
  addiu $v0, $zero, 4096
L800227c4:
  sh $v0, 40($s0)
L800227c8:
  addiu $v0, $zero, 128
L800227cc:
  sh $v0, 42($s0)
L800227d0:
  addiu $v0, $zero, 4
L800227d4:
  sw $zero, 32($s0)
L800227d8:
  sh $v0, 96($s0)
L800227dc:
  lbu $v0, 108($s0)
L800227e0:
  sll $zero, $zero, 0x0
L800227e4:
  andi $v0, $v0, 0x20
L800227e8:
  bne $v0, $zero, L80022880
L800227ec:
  sll $zero, $zero, 0x0
L800227f0:
  lbu $v0, 717($gp)
L800227f4:
  sll $zero, $zero, 0x0
L800227f8:
  beq $v0, $zero, L80022810
L800227fc:
  sll $zero, $zero, 0x0
L80022800:
  lhu $v0, 42($s0)
L80022804:
  lhu $v1, 40($s0)
L80022808:
  j L80022820
L8002280c:
  subu $v0, $v0, $v1
L80022810:
  lhu $v0, 42($s0)
L80022814:
  lhu $v1, 40($s0)
L80022818:
  sll $zero, $zero, 0x0
L8002281c:
  addu $v0, $v0, $v1
L80022820:
  sh $v0, 42($s0)
L80022824:
  lhu $v0, 42($s0)
L80022828:
  lhu $v1, 96($s0)
L8002282c:
  srl $v0, $v0, 0x8
L80022830:
  addiu $v1, $v1, -1
L80022834:
  sh $v1, 96($s0)
L80022838:
  sll $v1, $v1, 0x10
L8002283c:
  bne $v1, $zero, L800229e0
L80022840:
  sb $v0, 34($s0)
L80022844:
  lbu $v0, 108($s0)
L80022848:
  sll $zero, $zero, 0x0
L8002284c:
  ori $v0, $v0, 0x20
L80022850:
  sb $v0, 108($s0)
L80022854:
  lhu $v0, 22($s1)
L80022858:
  sll $zero, $zero, 0x0
L8002285c:
  ori $v0, $v0, 0x400
L80022860:
  sh $v0, 22($s1)
L80022864:
  addiu $v0, $zero, 16384
L80022868:
  sw $v0, 32($s0)
L8002286c:
  addiu $v0, $zero, 16512
L80022870:
  sh $v0, 42($s0)
L80022874:
  lhu $v0, 8($s0)
L80022878:
  j L80022994
L8002287c:
  addiu $v1, $zero, 4
L80022880:
  lhu $v0, 42($s0)
L80022884:
  lhu $v1, 40($s0)
L80022888:
  sll $zero, $zero, 0x0
L8002288c:
  subu $v0, $v0, $v1
L80022890:
  lhu $v1, 96($s0)
L80022894:
  sh $v0, 42($s0)
L80022898:
  srl $v0, $v0, 0x8
L8002289c:
  sb $v0, 33($s0)
L800228a0:
  addiu $v1, $v1, -1
L800228a4:
  sh $v1, 96($s0)
L800228a8:
  sll $v1, $v1, 0x10
L800228ac:
  bne $v1, $zero, L800229e0
L800228b0:
  sll $zero, $zero, 0x0
L800228b4:
  j L80022790
L800228b8:
  sb $zero, 33($s0)
L800228bc:
  lbu $v1, 108($s0)
L800228c0:
  sll $zero, $zero, 0x0
L800228c4:
  andi $v0, $v1, 0x40
L800228c8:
  bne $v0, $zero, L800228f4
L800228cc:
  ori $v0, $v1, 0x40
L800228d0:
  sb $v0, 108($s0)
L800228d4:
  ori $v0, $zero, 0xc000
L800228d8:
  sw $v0, 32($s0)
L800228dc:
  addiu $v0, $zero, 4096
L800228e0:
  sh $v0, 40($s0)
L800228e4:
  addiu $v0, $zero, 128
L800228e8:
  sh $v0, 42($s0)
L800228ec:
  addiu $v0, $zero, 4
L800228f0:
  sh $v0, 96($s0)
L800228f4:
  lbu $v0, 108($s0)
L800228f8:
  sll $zero, $zero, 0x0
L800228fc:
  andi $v0, $v0, 0x20
L80022900:
  bne $v0, $zero, L800229a4
L80022904:
  sll $zero, $zero, 0x0
L80022908:
  lbu $v0, 717($gp)
L8002290c:
  sll $zero, $zero, 0x0
L80022910:
  beq $v0, $zero, L80022928
L80022914:
  sll $zero, $zero, 0x0
L80022918:
  lhu $v0, 42($s0)
L8002291c:
  lhu $v1, 40($s0)
L80022920:
  j L80022938
L80022924:
  subu $v0, $v0, $v1
L80022928:
  lhu $v0, 42($s0)
L8002292c:
  lhu $v1, 40($s0)
L80022930:
  sll $zero, $zero, 0x0
L80022934:
  addu $v0, $v0, $v1
L80022938:
  sh $v0, 42($s0)
L8002293c:
  lhu $v0, 42($s0)
L80022940:
  lhu $v1, 96($s0)
L80022944:
  srl $v0, $v0, 0x8
L80022948:
  addiu $v1, $v1, -1
L8002294c:
  sh $v1, 96($s0)
L80022950:
  sll $v1, $v1, 0x10
L80022954:
  bne $v1, $zero, L800229e0
L80022958:
  sb $v0, 34($s0)
L8002295c:
  lbu $v0, 108($s0)
L80022960:
  sll $zero, $zero, 0x0
L80022964:
  ori $v0, $v0, 0x20
L80022968:
  sb $v0, 108($s0)
L8002296c:
  lhu $v0, 22($s1)
L80022970:
  lui $v1, 0xc0
L80022974:
  ori $v0, $v0, 0x400
L80022978:
  sh $v0, 22($s1)
L8002297c:
  addiu $v0, $zero, -16256
L80022980:
  sh $v0, 42($s0)
L80022984:
  lhu $v0, 8($s0)
L80022988:
  ori $v1, $v1, 0xc0
L8002298c:
  sw $v1, 32($s0)
L80022990:
  addiu $v1, $zero, 4
L80022994:
  sh $v1, 96($s0)
L80022998:
  ori $v0, $v0, 0x4
L8002299c:
  j L800229e0
L800229a0:
  sh $v0, 8($s0)
L800229a4:
  lhu $v0, 42($s0)
L800229a8:
  lhu $v1, 40($s0)
L800229ac:
  sll $zero, $zero, 0x0
L800229b0:
  addu $v0, $v0, $v1
L800229b4:
  lhu $v1, 96($s0)
L800229b8:
  sh $v0, 42($s0)
L800229bc:
  srl $v0, $v0, 0x8
L800229c0:
  sb $v0, 32($s0)
L800229c4:
  addiu $v1, $v1, -1
L800229c8:
  sh $v1, 96($s0)
L800229cc:
  sll $v1, $v1, 0x10
L800229d0:
  bne $v1, $zero, L800229e0
L800229d4:
  sll $zero, $zero, 0x0
L800229d8:
  j L80022790
L800229dc:
  sb $zero, 32($s0)
L800229e0:
  lw $ra, 24($sp)
L800229e4:
  lw $s1, 20($sp)
L800229e8:
  lw $s0, 16($sp)
L800229ec:
  jr $ra
L800229f0:
  addiu $sp, $sp, 32
L800229f4:
  addiu $sp, $sp, -32
L800229f8:
  sw $s0, 16($sp)
L800229fc:
  addu $s0, $a0, $zero
L80022a00:
  sw $ra, 24($sp)
L80022a04:
  sw $s1, 20($sp)
L80022a08:
  lbu $v0, 106($s0)
L80022a0c:
  sll $zero, $zero, 0x0
L80022a10:
  sll $v1, $v0, 0x3
L80022a14:
  subu $v1, $v1, $v0
L80022a18:
  sll $v1, $v1, 0x2
L80022a1c:
  lui $v0, 0x801a
L80022a20:
  addiu $v0, $v0, 31448
L80022a24:
  jal 0x80042b98
L80022a28:
  addu $s1, $v1, $v0
L80022a2c:
  bne $v0, $zero, L80022a5c
L80022a30:
  sll $zero, $zero, 0x0
L80022a34:
  lhu $a0, 22($s1)
L80022a38:
  sll $zero, $zero, 0x0
L80022a3c:
  andi $v0, $a0, 0x1000
L80022a40:
  bne $v0, $zero, L80022a58
L80022a44:
  addu $v1, $zero, $zero
L80022a48:
  andi $v0, $a0, 0x800
L80022a4c:
  beq $v0, $zero, L80022a58
L80022a50:
  addiu $v1, $zero, 1
L80022a54:
  addiu $v1, $zero, 2
L80022a58:
  sh $v1, 46($s0)
L80022a5c:
  lh $v1, 46($s0)
L80022a60:
  addiu $v0, $zero, 1
L80022a64:
  beq $v1, $v0, L80022b2c
L80022a68:
  slti $v0, $v1, 2
L80022a6c:
  beq $v0, $zero, L80022a84
L80022a70:
  sll $zero, $zero, 0x0
L80022a74:
  beq $v1, $zero, L80022a98
L80022a78:
  sll $zero, $zero, 0x0
L80022a7c:
  j L80022d80
L80022a80:
  sll $zero, $zero, 0x0
L80022a84:
  addiu $v0, $zero, 2
L80022a88:
  beq $v1, $v0, L80022c4c
L80022a8c:
  sll $zero, $zero, 0x0
L80022a90:
  j L80022d80
L80022a94:
  sll $zero, $zero, 0x0
L80022a98:
  lbu $v1, 108($s0)
L80022a9c:
  sll $zero, $zero, 0x0
L80022aa0:
  andi $v0, $v1, 0x40
L80022aa4:
  bne $v0, $zero, L80022ab8
L80022aa8:
  ori $v0, $v1, 0x40
L80022aac:
  sb $v0, 108($s0)
L80022ab0:
  addiu $v0, $zero, 8
L80022ab4:
  sh $v0, 96($s0)
L80022ab8:
  lhu $v0, 96($s0)
L80022abc:
  sll $zero, $zero, 0x0
L80022ac0:
  addiu $v0, $v0, -1
L80022ac4:
  sh $v0, 96($s0)
L80022ac8:
  sll $v0, $v0, 0x10
L80022acc:
  bgtz $v0, L80022d80
L80022ad0:
  sll $zero, $zero, 0x0
L80022ad4:
  lhu $v0, 22($s1)
L80022ad8:
  sll $zero, $zero, 0x0
L80022adc:
  andi $v0, $v0, 0xfbff
L80022ae0:
  sh $v0, 22($s1)
L80022ae4:
  addiu $v0, $zero, 128
L80022ae8:
  sb $v0, 34($s0)
L80022aec:
  lui $v0, 0x80
L80022af0:
  sb $zero, 32($s0)
L80022af4:
  sb $zero, 33($s0)
L80022af8:
  sw $v0, 32($s0)
L80022afc:
  lhu $v0, 22($s1)
L80022b00:
  sll $zero, $zero, 0x0
L80022b04:
  andi $v0, $v0, 0x800
L80022b08:
  beq $v0, $zero, L80022b14
L80022b0c:
  addiu $v0, $zero, 192
L80022b10:
  sb $v0, 33($s0)
L80022b14:
  addu $a0, $s0, $zero
L80022b18:
  sb $zero, 108($a0)
L80022b1c:
  jal 0x80018080
L80022b20:
  sw $zero, 36($a0)
L80022b24:
  j L80022d80
L80022b28:
  sll $zero, $zero, 0x0
L80022b2c:
  lbu $v1, 108($s0)
L80022b30:
  sll $zero, $zero, 0x0
L80022b34:
  andi $v0, $v1, 0x40
L80022b38:
  bne $v0, $zero, L80022b6c
L80022b3c:
  ori $v0, $v1, 0x40
L80022b40:
  sb $v0, 108($s0)
L80022b44:
  addiu $v0, $zero, 4096
L80022b48:
  sh $v0, 40($s0)
L80022b4c:
  addiu $v0, $zero, 128
L80022b50:
  sh $v0, 42($s0)
L80022b54:
  lhu $v0, 8($s0)
L80022b58:
  addiu $v1, $zero, 4
L80022b5c:
  sw $zero, 32($s0)
L80022b60:
  sh $v1, 96($s0)
L80022b64:
  ori $v0, $v0, 0x4
L80022b68:
  sh $v0, 8($s0)
L80022b6c:
  lbu $v0, 108($s0)
L80022b70:
  sll $zero, $zero, 0x0
L80022b74:
  andi $v0, $v0, 0x20
L80022b78:
  bne $v0, $zero, L80022bf0
L80022b7c:
  sll $zero, $zero, 0x0
L80022b80:
  lhu $v0, 42($s0)
L80022b84:
  lhu $v1, 40($s0)
L80022b88:
  sll $zero, $zero, 0x0
L80022b8c:
  addu $v0, $v0, $v1
L80022b90:
  lhu $v1, 96($s0)
L80022b94:
  sh $v0, 42($s0)
L80022b98:
  srl $v0, $v0, 0x8
L80022b9c:
  sb $v0, 33($s0)
L80022ba0:
  addiu $v1, $v1, -1
L80022ba4:
  sh $v1, 96($s0)
L80022ba8:
  sll $v1, $v1, 0x10
L80022bac:
  bne $v1, $zero, L80022d80
L80022bb0:
  sll $zero, $zero, 0x0
L80022bb4:
  lbu $v0, 108($s0)
L80022bb8:
  sll $zero, $zero, 0x0
L80022bbc:
  ori $v0, $v0, 0x20
L80022bc0:
  sb $v0, 108($s0)
L80022bc4:
  lhu $v0, 22($s1)
L80022bc8:
  lbu $v1, 717($gp)
L80022bcc:
  andi $v0, $v0, 0xfbff
L80022bd0:
  beq $v1, $zero, L80022be8
L80022bd4:
  sh $v0, 22($s1)
L80022bd8:
  lui $v0, 0xc0
L80022bdc:
  sw $v0, 32($s0)
L80022be0:
  j L80022d14
L80022be4:
  addiu $v0, $zero, -16256
L80022be8:
  j L80022d0c
L80022bec:
  lui $v0, 0x40
L80022bf0:
  lbu $v0, 717($gp)
L80022bf4:
  sll $zero, $zero, 0x0
L80022bf8:
  beq $v0, $zero, L80022c10
L80022bfc:
  sll $zero, $zero, 0x0
L80022c00:
  lhu $v0, 42($s0)
L80022c04:
  lhu $v1, 40($s0)
L80022c08:
  j L80022c20
L80022c0c:
  addu $v0, $v0, $v1
L80022c10:
  lhu $v0, 42($s0)
L80022c14:
  lhu $v1, 40($s0)
L80022c18:
  sll $zero, $zero, 0x0
L80022c1c:
  subu $v0, $v0, $v1
L80022c20:
  sh $v0, 42($s0)
L80022c24:
  lhu $v0, 42($s0)
L80022c28:
  lhu $v1, 96($s0)
L80022c2c:
  srl $v0, $v0, 0x8
L80022c30:
  addiu $v1, $v1, -1
L80022c34:
  sh $v1, 96($s0)
L80022c38:
  sll $v1, $v1, 0x10
L80022c3c:
  bne $v1, $zero, L80022d80
L80022c40:
  sb $v0, 34($s0)
L80022c44:
  j L80022b14
L80022c48:
  sb $zero, 34($s0)
L80022c4c:
  lbu $v1, 108($s0)
L80022c50:
  sll $zero, $zero, 0x0
L80022c54:
  andi $v0, $v1, 0x40
L80022c58:
  bne $v0, $zero, L80022c84
L80022c5c:
  ori $v0, $v1, 0x40
L80022c60:
  sb $v0, 108($s0)
L80022c64:
  lui $v0, 0xc0
L80022c68:
  sw $v0, 32($s0)
L80022c6c:
  addiu $v0, $zero, 4096
L80022c70:
  sh $v0, 40($s0)
L80022c74:
  addiu $v0, $zero, 128
L80022c78:
  sh $v0, 42($s0)
L80022c7c:
  addiu $v0, $zero, 4
L80022c80:
  sh $v0, 96($s0)
L80022c84:
  lbu $v0, 108($s0)
L80022c88:
  sll $zero, $zero, 0x0
L80022c8c:
  andi $v0, $v0, 0x20
L80022c90:
  bne $v0, $zero, L80022d24
L80022c94:
  sll $zero, $zero, 0x0
L80022c98:
  lhu $v0, 42($s0)
L80022c9c:
  lhu $v1, 40($s0)
L80022ca0:
  sll $zero, $zero, 0x0
L80022ca4:
  subu $v0, $v0, $v1
L80022ca8:
  lhu $v1, 96($s0)
L80022cac:
  sh $v0, 42($s0)
L80022cb0:
  srl $v0, $v0, 0x8
L80022cb4:
  sb $v0, 32($s0)
L80022cb8:
  addiu $v1, $v1, -1
L80022cbc:
  sh $v1, 96($s0)
L80022cc0:
  sll $v1, $v1, 0x10
L80022cc4:
  bne $v1, $zero, L80022d80
L80022cc8:
  sll $zero, $zero, 0x0
L80022ccc:
  lbu $v0, 108($s0)
L80022cd0:
  sll $zero, $zero, 0x0
L80022cd4:
  ori $v0, $v0, 0x20
L80022cd8:
  sb $v0, 108($s0)
L80022cdc:
  lhu $v0, 22($s1)
L80022ce0:
  lbu $v1, 717($gp)
L80022ce4:
  andi $v0, $v0, 0xfbff
L80022ce8:
  beq $v1, $zero, L80022d04
L80022cec:
  sh $v0, 22($s1)
L80022cf0:
  lui $v0, 0xc0
L80022cf4:
  ori $v0, $v0, 0xc000
L80022cf8:
  sw $v0, 32($s0)
L80022cfc:
  j L80022d14
L80022d00:
  addiu $v0, $zero, -16256
L80022d04:
  lui $v0, 0x40
L80022d08:
  ori $v0, $v0, 0xc000
L80022d0c:
  sw $v0, 32($s0)
L80022d10:
  addiu $v0, $zero, 16512
L80022d14:
  sh $v0, 42($s0)
L80022d18:
  addiu $v0, $zero, 4
L80022d1c:
  j L80022d80
L80022d20:
  sh $v0, 96($s0)
L80022d24:
  lbu $v0, 717($gp)
L80022d28:
  sll $zero, $zero, 0x0
L80022d2c:
  beq $v0, $zero, L80022d44
L80022d30:
  sll $zero, $zero, 0x0
L80022d34:
  lhu $v0, 42($s0)
L80022d38:
  lhu $v1, 40($s0)
L80022d3c:
  j L80022d54
L80022d40:
  addu $v0, $v0, $v1
L80022d44:
  lhu $v0, 42($s0)
L80022d48:
  lhu $v1, 40($s0)
L80022d4c:
  sll $zero, $zero, 0x0
L80022d50:
  subu $v0, $v0, $v1
L80022d54:
  sh $v0, 42($s0)
L80022d58:
  lhu $v0, 42($s0)
L80022d5c:
  lhu $v1, 96($s0)
L80022d60:
  srl $v0, $v0, 0x8
L80022d64:
  addiu $v1, $v1, -1
L80022d68:
  sh $v1, 96($s0)
L80022d6c:
  sll $v1, $v1, 0x10
L80022d70:
  bne $v1, $zero, L80022d80
L80022d74:
  sb $v0, 34($s0)
L80022d78:
  j L80022b14
L80022d7c:
  sb $zero, 32($s0)
L80022d80:
  lw $ra, 24($sp)
L80022d84:
  lw $s1, 20($sp)
L80022d88:
  lw $s0, 16($sp)
L80022d8c:
  jr $ra
L80022d90:
  addiu $sp, $sp, 32
L80022d94:
  lui $v0, 0x800f
L80022d98:
  lh $t2, 10312($v0)
L80022d9c:
  sll $zero, $zero, 0x0
L80022da0:
  subu $t5, $a1, $t2
L80022da4:
  sll $t5, $t5, 0x10
L80022da8:
  .word 0x01a4001a
L80022dac:
  bne $a0, $zero, L80022db8
L80022db0:
  sll $zero, $zero, 0x0
L80022db4:
  .word 0x0007000d
L80022db8:
  addiu $at, $zero, -1
L80022dbc:
  bne $a0, $at, L80022dd0
L80022dc0:
  lui $at, 0x8000
L80022dc4:
  bne $t5, $at, L80022dd0
L80022dc8:
  sll $zero, $zero, 0x0
L80022dcc:
  .word 0x0006000d
L80022dd0:
  mflo $t5
L80022dd4:
  addiu $v0, $v0, 10312
L80022dd8:
  lh $t0, 4($v0)
L80022ddc:
  sll $zero, $zero, 0x0
L80022de0:
  subu $t4, $a2, $t0
L80022de4:
  sll $t4, $t4, 0x10
L80022de8:
  .word 0x0184001a
L80022dec:
  bne $a0, $zero, L80022df8
L80022df0:
  sll $zero, $zero, 0x0
L80022df4:
  .word 0x0007000d
L80022df8:
  addiu $at, $zero, -1
L80022dfc:
  bne $a0, $at, L80022e10
L80022e00:
  lui $at, 0x8000
L80022e04:
  bne $t4, $at, L80022e10
L80022e08:
  sll $zero, $zero, 0x0
L80022e0c:
  .word 0x0006000d
L80022e10:
  mflo $t4
L80022e14:
  lh $v1, 2($v0)
L80022e18:
  sll $zero, $zero, 0x0
L80022e1c:
  subu $t3, $a3, $v1
L80022e20:
  sll $t3, $t3, 0x10
L80022e24:
  .word 0x0164001a
L80022e28:
  bne $a0, $zero, L80022e34
L80022e2c:
  sll $zero, $zero, 0x0
L80022e30:
  .word 0x0007000d
L80022e34:
  addiu $at, $zero, -1
L80022e38:
  bne $a0, $at, L80022e4c
L80022e3c:
  lui $at, 0x8000
L80022e40:
  bne $t3, $at, L80022e4c
L80022e44:
  sll $zero, $zero, 0x0
L80022e48:
  .word 0x0006000d
L80022e4c:
  mflo $t3
L80022e50:
  lw $t6, 16($sp)
L80022e54:
  lw $v0, 36($v0)
L80022e58:
  sll $zero, $zero, 0x0
L80022e5c:
  subu $t1, $t6, $v0
L80022e60:
  sll $t1, $t1, 0x10
L80022e64:
  .word 0x0124001a
L80022e68:
  bne $a0, $zero, L80022e74
L80022e6c:
  sll $zero, $zero, 0x0
L80022e70:
  .word 0x0007000d
L80022e74:
  addiu $at, $zero, -1
L80022e78:
  bne $a0, $at, L80022e8c
L80022e7c:
  lui $at, 0x8000
L80022e80:
  bne $t1, $at, L80022e8c
L80022e84:
  sll $zero, $zero, 0x0
L80022e88:
  .word 0x0006000d
L80022e8c:
  mflo $t1
L80022e90:
  sh $a0, 764($gp)
L80022e94:
  sh $a1, 742($gp)
L80022e98:
  sh $a2, 650($gp)
L80022e9c:
  sh $a3, 648($gp)
L80022ea0:
  sll $t2, $t2, 0x10
L80022ea4:
  ori $t2, $t2, 0x8000
L80022ea8:
  sll $t0, $t0, 0x10
L80022eac:
  ori $t0, $t0, 0x8000
L80022eb0:
  sh $t6, 606($gp)
L80022eb4:
  sw $t2, 700($gp)
L80022eb8:
  sw $t0, 596($gp)
L80022ebc:
  sll $v1, $v1, 0x10
L80022ec0:
  ori $v1, $v1, 0x8000
L80022ec4:
  sll $v0, $v0, 0x10
L80022ec8:
  ori $v0, $v0, 0x8000
L80022ecc:
  sw $v1, 592($gp)
L80022ed0:
  sw $v0, 796($gp)
L80022ed4:
  sw $t5, 756($gp)
L80022ed8:
  sw $t4, 656($gp)
L80022edc:
  sw $t3, 652($gp)
L80022ee0:
  sw $t1, 608($gp)
L80022ee4:
  jr $ra
L80022ee8:
  sll $zero, $zero, 0x0
L80022eec:
  addiu $sp, $sp, -24
L80022ef0:
  addu $a2, $a0, $zero
L80022ef4:
  lui $a1, 0x800f
L80022ef8:
  addiu $a1, $a1, -24816
L80022efc:
  sw $ra, 16($sp)
L80022f00:
  lh $v0, 44($a2)
L80022f04:
  lbu $a0, 717($gp)
L80022f08:
  sll $v1, $v0, 0x3
L80022f0c:
  subu $v1, $v1, $v0
L80022f10:
  sll $v1, $v1, 0x2
L80022f14:
  sll $v0, $a0, 0x3
L80022f18:
  subu $v0, $v0, $a0
L80022f1c:
  sll $v0, $v0, 0x4
L80022f20:
  addu $v1, $v1, $v0
L80022f24:
  addu $v1, $v1, $a1
L80022f28:
  lw $a0, 0($v1)
L80022f2c:
  sll $zero, $zero, 0x0
L80022f30:
  bne $a0, $zero, L80022f48
L80022f34:
  sll $zero, $zero, 0x0
L80022f38:
  jal 0x8004036c
L80022f3c:
  addu $a0, $a2, $zero
L80022f40:
  j L80022f88
L80022f44:
  sll $zero, $zero, 0x0
L80022f48:
  lhu $v0, 48($a0)
L80022f4c:
  lhu $v1, 40($a2)
L80022f50:
  sll $zero, $zero, 0x0
L80022f54:
  addu $v0, $v0, $v1
L80022f58:
  sh $v0, 48($a2)
L80022f5c:
  lhu $v0, 50($a0)
L80022f60:
  lhu $v1, 42($a2)
L80022f64:
  sll $zero, $zero, 0x0
L80022f68:
  addu $v0, $v0, $v1
L80022f6c:
  sh $v0, 50($a2)
L80022f70:
  lbu $v0, 108($a0)
L80022f74:
  sll $zero, $zero, 0x0
L80022f78:
  bne $v0, $zero, L80022f88
L80022f7c:
  sll $zero, $zero, 0x0
L80022f80:
  sb $zero, 108($a2)
L80022f84:
  sw $zero, 36($a2)
L80022f88:
  lw $ra, 16($sp)
L80022f8c:
  sll $zero, $zero, 0x0
L80022f90:
  jr $ra
L80022f94:
  addiu $sp, $sp, 24
L80022f98:
  beq $a1, $zero, L80022fe8
L80022f9c:
  addu $a2, $a0, $zero
L80022fa0:
  lw $a0, 0($a2)
L80022fa4:
  lhu $v0, 48($a1)
L80022fa8:
  lhu $v1, 48($a0)
L80022fac:
  sll $zero, $zero, 0x0
L80022fb0:
  subu $v0, $v0, $v1
L80022fb4:
  sh $v0, 40($a1)
L80022fb8:
  lhu $v0, 50($a1)
L80022fbc:
  lhu $v1, 50($a0)
L80022fc0:
  sll $zero, $zero, 0x0
L80022fc4:
  subu $v0, $v0, $v1
L80022fc8:
  sh $v0, 42($a1)
L80022fcc:
  lbu $v1, 23($a2)
L80022fd0:
  addiu $v0, $zero, 1
L80022fd4:
  sb $v0, 108($a1)
L80022fd8:
  lui $v0, 0x8002
L80022fdc:
  addiu $v0, $v0, 12012
L80022fe0:
  sw $v0, 36($a1)
L80022fe4:
  sh $v1, 44($a1)
L80022fe8:
  jr $ra
L80022fec:
  sll $zero, $zero, 0x0
L80022ff0:
  addiu $sp, $sp, -40
L80022ff4:
  sw $s3, 28($sp)
L80022ff8:
  addu $s3, $a0, $zero
L80022ffc:
  sw $ra, 36($sp)
L80023000:
  sw $s4, 32($sp)
L80023004:
  sw $s2, 24($sp)
L80023008:
  sw $s1, 20($sp)
L8002300c:
  sw $s0, 16($sp)
L80023010:
  lw $s1, 8($s3)
L80023014:
  sll $zero, $zero, 0x0
L80023018:
  beq $s1, $zero, L80023070
L8002301c:
  addu $s4, $a1, $zero
L80023020:
  addu $s2, $zero, $zero
L80023024:
  lw $a1, 4($s3)
L80023028:
  jal L80022f98
L8002302c:
  addiu $s0, $s1, 4
L80023030:
  sw $zero, 4($s3)
L80023034:
  lw $a1, 0($s1)
L80023038:
  jal L80022f98
L8002303c:
  addu $a0, $s3, $zero
L80023040:
  lw $a1, 0($s0)
L80023044:
  jal L80022f98
L80023048:
  addu $a0, $s3, $zero
L8002304c:
  beq $s4, $zero, L8002305c
L80023050:
  sll $zero, $zero, 0x0
L80023054:
  sw $zero, 0($s1)
L80023058:
  sw $zero, 0($s0)
L8002305c:
  addiu $s0, $s0, 12
L80023060:
  addiu $s2, $s2, 1
L80023064:
  slti $v0, $s2, 5
L80023068:
  bne $v0, $zero, L80023034
L8002306c:
  addiu $s1, $s1, 12
L80023070:
  lw $ra, 36($sp)
L80023074:
  lw $s4, 32($sp)
L80023078:
  lw $s3, 28($sp)
L8002307c:
  lw $s2, 24($sp)
L80023080:
  lw $s1, 20($sp)
L80023084:
  lw $s0, 16($sp)
L80023088:
  jr $ra
L8002308c:
  addiu $sp, $sp, 40
L80023090:
  addiu $sp, $sp, -24
L80023094:
  lui $t1, 0x8009
L80023098:
  addiu $t1, $t1, 2008
L8002309c:
  lui $a3, 0x801a
L800230a0:
  addiu $a3, $a3, 31448
L800230a4:
  sw $ra, 16($sp)
L800230a8:
  lb $v1, 16($a0)
L800230ac:
  lb $t0, 16($a1)
L800230b0:
  sll $v0, $v1, 0x2
L800230b4:
  addu $v0, $v0, $v1
L800230b8:
  lb $v1, 15($a0)
L800230bc:
  lbu $a0, 717($gp)
L800230c0:
  addu $v0, $v0, $v1
L800230c4:
  sll $a2, $a0, 0x2
L800230c8:
  addu $a2, $a2, $a0
L800230cc:
  sll $a2, $a2, 0x2
L800230d0:
  addu $v0, $v0, $a2
L800230d4:
  addu $v0, $v0, $t1
L800230d8:
  lbu $v0, 0($v0)
L800230dc:
  lb $v1, 15($a1)
L800230e0:
  sll $a0, $v0, 0x3
L800230e4:
  subu $a0, $a0, $v0
L800230e8:
  sll $a0, $a0, 0x2
L800230ec:
  sll $v0, $t0, 0x2
L800230f0:
  addu $v0, $v0, $t0
L800230f4:
  addu $v0, $v0, $v1
L800230f8:
  addu $v0, $v0, $a2
L800230fc:
  addu $v0, $v0, $t1
L80023100:
  lbu $v0, 0($v0)
L80023104:
  addu $a0, $a0, $a3
L80023108:
  sll $a1, $v0, 0x3
L8002310c:
  subu $a1, $a1, $v0
L80023110:
  sll $a1, $a1, 0x2
L80023114:
  jal 0x8001ee44
L80023118:
  addu $a1, $a1, $a3
L8002311c:
  addu $v1, $v0, $zero
L80023120:
  beq $v1, $zero, L80023134
L80023124:
  addiu $v0, $zero, 4
L80023128:
  bltz $v1, L80023134
L8002312c:
  addiu $v0, $zero, 1
L80023130:
  addiu $v0, $zero, 6
L80023134:
  lw $ra, 16($sp)
L80023138:
  sll $zero, $zero, 0x0
L8002313c:
  jr $ra
L80023140:
  addiu $sp, $sp, 24
L80023144:
  addiu $sp, $sp, -48
L80023148:
  sw $s3, 36($sp)
L8002314c:
  addu $s3, $a0, $zero
L80023150:
  sw $s1, 28($sp)
L80023154:
  addu $s1, $a1, $zero
L80023158:
  sll $v0, $s1, 0x3
L8002315c:
  subu $v0, $v0, $s1
L80023160:
  sll $v0, $v0, 0x2
L80023164:
  lui $v1, 0x801a
L80023168:
  addiu $v1, $v1, 31448
L8002316c:
  sw $s0, 24($sp)
L80023170:
  addu $s0, $v0, $v1
L80023174:
  sw $ra, 40($sp)
L80023178:
  sw $s2, 32($sp)
L8002317c:
  lhu $v0, 22($s0)
L80023180:
  lui $at, 0x800a
L80023184:
  sb $zero, -19634($at)
L80023188:
  lui $at, 0x800a
L8002318c:
  sb $zero, -19627($at)
L80023190:
  andi $v0, $v0, 0x8000
L80023194:
  beq $v0, $zero, L800232fc
L80023198:
  addiu $s2, $zero, 80
L8002319c:
  lui $v1, 0x801d
L800231a0:
  lh $a0, 12($s0)
L800231a4:
  addiu $v1, $v1, 16964
L800231a8:
  addiu $v0, $a0, -1
L800231ac:
  sll $v0, $v0, 0x2
L800231b0:
  addu $v0, $v0, $v1
L800231b4:
  lw $v1, 0($v0)
L800231b8:
  addiu $v0, $zero, 1
L800231bc:
  lui $at, 0x800a
L800231c0:
  sb $v0, -19634($at)
L800231c4:
  lui $at, 0x800a
L800231c8:
  sh $a0, -19656($at)
L800231cc:
  sra $v0, $v1, 0x1a
L800231d0:
  andi $v0, $v0, 0x1f
L800231d4:
  slti $v0, $v0, 20
L800231d8:
  beq $v0, $zero, L80023248
L800231dc:
  sll $zero, $zero, 0x0
L800231e0:
  lhu $v0, 22($s0)
L800231e4:
  sll $zero, $zero, 0x0
L800231e8:
  andi $v0, $v0, 0x200
L800231ec:
  bne $v0, $zero, L800231f8
L800231f0:
  sra $v0, $v1, 0x12
L800231f4:
  sra $v0, $v1, 0x16
L800231f8:
  andi $v0, $v0, 0xf
L800231fc:
  lui $at, 0x800a
L80023200:
  sb $v0, -19644($at)
L80023204:
  lui $v0, 0x800a
L80023208:
  lbu $v0, -19644($v0)
L8002320c:
  sll $zero, $zero, 0x0
L80023210:
  addiu $v0, $v0, 23
L80023214:
  lui $at, 0x800a
L80023218:
  sb $v0, -19644($at)
L8002321c:
  jal 0x800170c8
L80023220:
  addu $a0, $s0, $zero
L80023224:
  addu $a1, $v0, $zero
L80023228:
  lui $v1, 0x801d
L8002322c:
  sll $v0, $a1, 0x10
L80023230:
  sra $v0, $v0, 0x10
L80023234:
  sw $v0, 22024($v1)
L80023238:
  addiu $v1, $v1, 22024
L8002323c:
  sra $v0, $a1, 0x10
L80023240:
  j L8002324c
L80023244:
  sw $v0, 4($v1)
L80023248:
  addiu $s2, $zero, 81
L8002324c:
  lui $v0, 0x8888
L80023250:
  ori $v0, $v0, 0x8889
L80023254:
  mult $s1, $v0
L80023258:
  sra $v0, $s1, 0x1f
L8002325c:
  mfhi $t0
L80023260:
  addu $v1, $t0, $s1
L80023264:
  sra $v1, $v1, 0x3
L80023268:
  subu $v1, $v1, $v0
L8002326c:
  sll $v0, $v1, 0x4
L80023270:
  subu $v0, $v0, $v1
L80023274:
  subu $v0, $s1, $v0
L80023278:
  slti $v0, $v0, 5
L8002327c:
  bne $v0, $zero, L800232e0
L80023280:
  addiu $a0, $zero, 2
L80023284:
  lhu $v0, 22($s0)
L80023288:
  lui $at, 0x800a
L8002328c:
  sb $a0, -19634($at)
L80023290:
  andi $v0, $v0, 0x1000
L80023294:
  beq $v0, $zero, L800232a4
L80023298:
  addiu $v0, $zero, 3
L8002329c:
  lui $at, 0x800a
L800232a0:
  sb $v0, -19634($at)
L800232a4:
  slti $v0, $s1, 15
L800232a8:
  lbu $v1, 717($gp)
L800232ac:
  xori $a1, $v0, 0x1
L800232b0:
  bne $a1, $v1, L800232fc
L800232b4:
  sll $zero, $zero, 0x0
L800232b8:
  lw $v0, 704($gp)
L800232bc:
  sll $zero, $zero, 0x0
L800232c0:
  lb $v0, 31($v0)
L800232c4:
  sll $zero, $zero, 0x0
L800232c8:
  bne $v0, $zero, L800232fc
L800232cc:
  sll $zero, $zero, 0x0
L800232d0:
  lui $at, 0x800a
L800232d4:
  sb $a0, -19634($at)
L800232d8:
  j L800232fc
L800232dc:
  sll $zero, $zero, 0x0
L800232e0:
  lhu $v0, 22($s0)
L800232e4:
  sll $zero, $zero, 0x0
L800232e8:
  andi $v0, $v0, 0x2000
L800232ec:
  beq $v0, $zero, L800232fc
L800232f0:
  sll $zero, $zero, 0x0
L800232f4:
  lui $at, 0x800a
L800232f8:
  sb $zero, -19634($at)
L800232fc:
  lbu $a1, 23($s3)
L80023300:
  addiu $v0, $zero, 3
L80023304:
  bne $a1, $v0, L800233a4
L80023308:
  lui $a0, 0x801d
L8002330c:
  addiu $s2, $s2, 4
L80023310:
  lui $v1, 0x800f
L80023314:
  lbu $v0, 717($gp)
L80023318:
  addiu $v1, $v1, -24592
L8002331c:
  xori $v0, $v0, 0x1
L80023320:
  sll $v0, $v0, 0x5
L80023324:
  addu $v0, $v0, $v1
L80023328:
  lb $v0, 25($v0)
L8002332c:
  addiu $a0, $a0, 22024
L80023330:
  beq $v0, $zero, L80023350
L80023334:
  sw $v0, 8($a0)
L80023338:
  sltiu $v0, $v0, 4
L8002333c:
  bne $v0, $zero, L80023348
L80023340:
  addiu $v0, $zero, 1
L80023344:
  sw $a1, 8($a0)
L80023348:
  lui $at, 0x800a
L8002334c:
  sb $v0, -19627($at)
L80023350:
  lui $v0, 0x800a
L80023354:
  lbu $v0, -19634($v0)
L80023358:
  sll $zero, $zero, 0x0
L8002335c:
  beq $v0, $zero, L800233a4
L80023360:
  addu $a0, $s3, $zero
L80023364:
  lui $a1, 0x800f
L80023368:
  lbu $v0, 717($gp)
L8002336c:
  addiu $a1, $a1, -24760
L80023370:
  sll $v1, $v0, 0x3
L80023374:
  subu $v1, $v1, $v0
L80023378:
  sll $v1, $v1, 0x4
L8002337c:
  lui $v0, 0x800a
L80023380:
  lbu $v0, -19627($v0)
L80023384:
  sll $zero, $zero, 0x0
L80023388:
  ori $v0, $v0, 0x2
L8002338c:
  lui $at, 0x800a
L80023390:
  sb $v0, -19627($at)
L80023394:
  jal L80023090
L80023398:
  addu $a1, $v1, $a1
L8002339c:
  lui $at, 0x800a
L800233a0:
  sb $v0, -19680($at)
L800233a4:
  lbu $v1, 23($s3)
L800233a8:
  addiu $v0, $zero, 2
L800233ac:
  bne $v1, $v0, L80023424
L800233b0:
  addu $a1, $s2, $zero
L800233b4:
  lbu $v0, 24($s3)
L800233b8:
  sll $zero, $zero, 0x0
L800233bc:
  beq $v0, $zero, L80023424
L800233c0:
  sll $zero, $zero, 0x0
L800233c4:
  lb $v0, 16($s3)
L800233c8:
  lbu $a1, 717($gp)
L800233cc:
  slti $v0, $v0, 2
L800233d0:
  beq $v0, $zero, L800233dc
L800233d4:
  lui $a0, 0x801d
L800233d8:
  xori $a1, $a1, 0x1
L800233dc:
  lui $v1, 0x800f
L800233e0:
  addiu $v1, $v1, -24592
L800233e4:
  sll $v0, $a1, 0x5
L800233e8:
  addu $v0, $v0, $v1
L800233ec:
  lb $v0, 25($v0)
L800233f0:
  addiu $a0, $a0, 22024
L800233f4:
  beq $v0, $zero, L8002341c
L800233f8:
  sw $v0, 8($a0)
L800233fc:
  sltiu $v0, $v0, 4
L80023400:
  bne $v0, $zero, L80023414
L80023404:
  addiu $v0, $zero, 1
L80023408:
  addiu $v0, $zero, 3
L8002340c:
  sw $v0, 8($a0)
L80023410:
  addiu $v0, $zero, 1
L80023414:
  lui $at, 0x800a
L80023418:
  sb $v0, -19627($at)
L8002341c:
  addiu $s2, $s2, 2
L80023420:
  addu $a1, $s2, $zero
L80023424:
  lbu $a0, 20($s3)
L80023428:
  lw $v0, 0($s3)
L8002342c:
  lb $a3, 22($s3)
L80023430:
  lh $a2, 48($v0)
L80023434:
  lh $v1, 50($v0)
L80023438:
  addiu $v0, $zero, 288
L8002343c:
  sw $v0, 16($sp)
L80023440:
  addiu $v0, $zero, 64
L80023444:
  sw $v0, 20($sp)
L80023448:
  addiu $a2, $a2, 16
L8002344c:
  jal 0x80035be4
L80023450:
  addu $a3, $v1, $a3
L80023454:
  lw $v1, 0($s3)
L80023458:
  sll $zero, $zero, 0x0
L8002345c:
  lbu $v1, 22($v1)
L80023460:
  addu $a0, $v0, $zero
L80023464:
  addiu $v1, $v1, 1
L80023468:
  jal 0x80039a14
L8002346c:
  sb $v1, 89($a0)
L80023470:
  lw $ra, 40($sp)
L80023474:
  lw $s3, 36($sp)
L80023478:
  lw $s2, 32($sp)
L8002347c:
  lw $s1, 28($sp)
L80023480:
  lw $s0, 24($sp)
L80023484:
  jr $ra
L80023488:
  addiu $sp, $sp, 48
L8002348c:
  addiu $sp, $sp, -24
L80023490:
  lui $a2, 0x8009
L80023494:
  sw $ra, 16($sp)
L80023498:
  lb $v0, 16($a0)
L8002349c:
  addiu $a2, $a2, 2008
L800234a0:
  sll $v1, $v0, 0x2
L800234a4:
  addu $v1, $v1, $v0
L800234a8:
  lb $v0, 15($a0)
L800234ac:
  lbu $a1, 717($gp)
L800234b0:
  addu $v1, $v1, $v0
L800234b4:
  sll $v0, $a1, 0x2
L800234b8:
  addu $v0, $v0, $a1
L800234bc:
  sll $v0, $v0, 0x2
L800234c0:
  addu $v1, $v1, $v0
L800234c4:
  addu $v1, $v1, $a2
L800234c8:
  lbu $a1, 0($v1)
L800234cc:
  jal L80023144
L800234d0:
  sll $zero, $zero, 0x0
L800234d4:
  lw $ra, 16($sp)
L800234d8:
  sll $zero, $zero, 0x0
L800234dc:
  jr $ra
L800234e0:
  addiu $sp, $sp, 24
L800234e4:
  addiu $sp, $sp, -40
L800234e8:
  sw $s2, 32($sp)
L800234ec:
  addu $s2, $a0, $zero
L800234f0:
  sw $ra, 36($sp)
L800234f4:
  sw $s1, 28($sp)
L800234f8:
  sw $s0, 24($sp)
L800234fc:
  lb $v0, 16($s2)
L80023500:
  lb $v1, 15($s2)
L80023504:
  sll $s0, $v0, 0x2
L80023508:
  addu $s0, $s0, $v0
L8002350c:
  jal 0x8004002c
L80023510:
  addu $s0, $s0, $v1
L80023514:
  addu $a0, $v0, $zero
L80023518:
  jal 0x800400ac
L8002351c:
  addiu $a1, $zero, 2
L80023520:
  addu $s1, $v0, $zero
L80023524:
  addu $a0, $s1, $zero
L80023528:
  addiu $a1, $zero, 4
L8002352c:
  lbu $v1, 23($s2)
L80023530:
  addiu $v0, $zero, 31
L80023534:
  sw $v0, 16($sp)
L80023538:
  addiu $v0, $zero, 256
L8002353c:
  lbu $a3, 717($gp)
L80023540:
  addiu $a2, $zero, 3
L80023544:
  sw $v0, 20($sp)
L80023548:
  sll $a3, $a3, 0x2
L8002354c:
  jal 0x80040468
L80023550:
  addu $a3, $v1, $a3
L80023554:
  lui $v1, 0x8009
L80023558:
  addiu $v1, $v1, 2048
L8002355c:
  lbu $a0, 717($gp)
L80023560:
  sll $s0, $s0, 0x2
L80023564:
  sll $v0, $a0, 0x2
L80023568:
  addu $v0, $v0, $a0
L8002356c:
  sll $v0, $v0, 0x4
L80023570:
  addu $s0, $s0, $v0
L80023574:
  addu $s0, $s0, $v1
L80023578:
  lhu $v0, 0($s0)
L8002357c:
  sll $zero, $zero, 0x0
L80023580:
  sh $v0, 40($s1)
L80023584:
  lhu $v0, 8($s1)
L80023588:
  lhu $v1, 2($s0)
L8002358c:
  ori $v0, $v0, 0x28
L80023590:
  sh $v0, 8($s1)
L80023594:
  lui $v0, 0x8001
L80023598:
  addiu $v0, $v0, 23832
L8002359c:
  sw $v0, 36($s1)
L800235a0:
  sh $v1, 42($s1)
L800235a4:
  sw $s1, 4($s2)
L800235a8:
  lw $ra, 36($sp)
L800235ac:
  lw $s2, 32($sp)
L800235b0:
  lw $s1, 28($sp)
L800235b4:
  lw $s0, 24($sp)
L800235b8:
  jr $ra
L800235bc:
  addiu $sp, $sp, 40
L800235c0:
  lhu $v1, 602($gp)
L800235c4:
  addiu $sp, $sp, -56
L800235c8:
  sw $s3, 36($sp)
L800235cc:
  lw $s3, 684($gp)
L800235d0:
  lui $v0, 0x800f
L800235d4:
  sw $s5, 44($sp)
L800235d8:
  addiu $s5, $v0, 10312
L800235dc:
  sw $ra, 48($sp)
L800235e0:
  sw $s4, 40($sp)
L800235e4:
  sw $s2, 32($sp)
L800235e8:
  sw $s1, 28($sp)
L800235ec:
  sw $s0, 24($sp)
L800235f0:
  beq $v1, $zero, L80023ce4
L800235f4:
  addu $v0, $zero, $zero
L800235f8:
  andi $v0, $v1, 0x8000
L800235fc:
  bne $v0, $zero, L800238c0
L80023600:
  addu $s4, $zero, $zero
L80023604:
  ori $v0, $v1, 0x8000
L80023608:
  sh $v0, 602($gp)
L8002360c:
  andi $v0, $v0, 0x1
L80023610:
  beq $v0, $zero, L80023668
L80023614:
  addiu $a0, $zero, 16
L80023618:
  addiu $a1, $zero, 334
L8002361c:
  addiu $v0, $gp, 24
L80023620:
  lui $a3, 0x8009
L80023624:
  addiu $a3, $a3, 1964
L80023628:
  lbu $t0, 717($gp)
L8002362c:
  lbu $v1, 24($s3)
L80023630:
  sll $t1, $t0, 0x1
L80023634:
  addu $t1, $t1, $v0
L80023638:
  sll $v1, $v1, 0x3
L8002363c:
  lb $v0, 16($s3)
L80023640:
  sll $t0, $t0, 0x4
L80023644:
  sll $v0, $v0, 0x1
L80023648:
  addu $v0, $v0, $v1
L8002364c:
  addu $v0, $v0, $t0
L80023650:
  addu $v0, $v0, $a3
L80023654:
  lhu $a3, 0($t1)
L80023658:
  lh $v0, 0($v0)
L8002365c:
  addiu $a2, $zero, 1022
L80023660:
  jal L80022d94
L80023664:
  sw $v0, 16($sp)
L80023668:
  lhu $v0, 602($gp)
L8002366c:
  sll $zero, $zero, 0x0
L80023670:
  andi $v0, $v0, 0x4
L80023674:
  beq $v0, $zero, L80023768
L80023678:
  sll $zero, $zero, 0x0
L8002367c:
  addiu $a0, $zero, 16
L80023680:
  addiu $a1, $zero, 600
L80023684:
  lbu $v0, 717($gp)
L80023688:
  addiu $v1, $gp, 24
L8002368c:
  sll $v0, $v0, 0x1
L80023690:
  addu $v0, $v0, $v1
L80023694:
  lhu $a3, 0($v0)
L80023698:
  addiu $a2, $zero, 256
L8002369c:
  jal L80022d94
L800236a0:
  sw $zero, 16($sp)
L800236a4:
  lw $a0, 4($s3)
L800236a8:
  jal 0x8004036c
L800236ac:
  addiu $s2, $zero, 5
L800236b0:
  lui $a3, 0x8888
L800236b4:
  ori $a3, $a3, 0x8889
L800236b8:
  lui $a2, 0x4
L800236bc:
  ori $a2, $a2, 0x8000
L800236c0:
  addiu $t2, $zero, 1
L800236c4:
  addiu $t1, $zero, 4
L800236c8:
  lui $v0, 0x8002
L800236cc:
  addiu $t0, $v0, 10740
L800236d0:
  lui $v0, 0x8016
L800236d4:
  addiu $v0, $v0, -15324
L800236d8:
  addiu $a1, $v0, 140
L800236dc:
  lui $v0, 0x801a
L800236e0:
  addiu $v0, $v0, 31448
L800236e4:
  addiu $a0, $v0, 140
L800236e8:
  sw $zero, 4($s3)
L800236ec:
  mult $s2, $a3
L800236f0:
  sra $v0, $s2, 0x1f
L800236f4:
  mfhi $t3
L800236f8:
  addu $v1, $t3, $s2
L800236fc:
  sra $v1, $v1, 0x3
L80023700:
  subu $v1, $v1, $v0
L80023704:
  sll $v0, $v1, 0x4
L80023708:
  subu $v0, $v0, $v1
L8002370c:
  subu $v0, $s2, $v0
L80023710:
  slti $v0, $v0, 5
L80023714:
  bne $v0, $zero, L80023744
L80023718:
  sll $zero, $zero, 0x0
L8002371c:
  lhu $v0, 22($a0)
L80023720:
  sll $zero, $zero, 0x0
L80023724:
  andi $v0, $v0, 0x8000
L80023728:
  beq $v0, $zero, L80023744
L8002372c:
  addu $v0, $a1, $a2
L80023730:
  lw $s0, 14004($v0)
L80023734:
  sll $zero, $zero, 0x0
L80023738:
  sb $t2, 108($s0)
L8002373c:
  sh $t1, 96($s0)
L80023740:
  sw $t0, 36($s0)
L80023744:
  addiu $a1, $a1, 28
L80023748:
  addiu $s2, $s2, 1
L8002374c:
  slti $v0, $s2, 30
L80023750:
  bne $v0, $zero, L800236ec
L80023754:
  addiu $a0, $a0, 28
L80023758:
  lhu $v0, 602($gp)
L8002375c:
  sll $zero, $zero, 0x0
L80023760:
  ori $v0, $v0, 0x4000
L80023764:
  sh $v0, 602($gp)
L80023768:
  lhu $v0, 602($gp)
L8002376c:
  sll $zero, $zero, 0x0
L80023770:
  andi $v0, $v0, 0x2
L80023774:
  beq $v0, $zero, L80023870
L80023778:
  addu $a0, $zero, $zero
L8002377c:
  jal 0x80018150
L80023780:
  addiu $a1, $zero, 240
L80023784:
  addu $s0, $v0, $zero
L80023788:
  lbu $v1, 19($s3)
L8002378c:
  addiu $v0, $zero, 36
L80023790:
  beq $v1, $zero, L800237ac
L80023794:
  sb $v0, 22($s3)
L80023798:
  addu $a1, $v1, $zero
L8002379c:
  jal 0x80040410
L800237a0:
  addu $a0, $s0, $zero
L800237a4:
  addiu $v0, $zero, 7
L800237a8:
  sb $v0, 22($s3)
L800237ac:
  lbu $a1, 23($s3)
L800237b0:
  addu $a0, $s0, $zero
L800237b4:
  sll $a1, $a1, 0x1
L800237b8:
  subu $a1, $zero, $a1
L800237bc:
  addiu $a1, $a1, -2
L800237c0:
  sll $a1, $a1, 0x18
L800237c4:
  jal 0x800428ec
L800237c8:
  sra $a1, $a1, 0x18
L800237cc:
  sh $zero, 40($s0)
L800237d0:
  lhu $v0, 12($s3)
L800237d4:
  addu $a0, $s0, $zero
L800237d8:
  jal 0x80043178
L800237dc:
  sh $v0, 42($s0)
L800237e0:
  addiu $v0, $zero, -1024
L800237e4:
  sh $v0, 96($s0)
L800237e8:
  addiu $v0, $zero, 2
L800237ec:
  sb $v0, 108($s0)
L800237f0:
  lw $v0, 8($s3)
L800237f4:
  sll $zero, $zero, 0x0
L800237f8:
  beq $v0, $zero, L80023864
L800237fc:
  sw $s0, 0($s3)
L80023800:
  addu $s2, $zero, $zero
L80023804:
  addiu $a1, $zero, 14
L80023808:
  addu $a0, $s2, $zero
L8002380c:
  lw $v0, 8($s3)
L80023810:
  sll $zero, $zero, 0x0
L80023814:
  addu $v0, $a0, $v0
L80023818:
  lw $v1, 0($v0)
L8002381c:
  sll $zero, $zero, 0x0
L80023820:
  beq $v1, $zero, L80023850
L80023824:
  sll $zero, $zero, 0x0
L80023828:
  lhu $v0, 48($s0)
L8002382c:
  sll $zero, $zero, 0x0
L80023830:
  addu $v0, $v0, $a1
L80023834:
  sh $v0, 48($v1)
L80023838:
  lw $v0, 8($s3)
L8002383c:
  lhu $v1, 50($s0)
L80023840:
  addu $v0, $a0, $v0
L80023844:
  lw $v0, 0($v0)
L80023848:
  addiu $v1, $v1, -28
L8002384c:
  sh $v1, 50($v0)
L80023850:
  addiu $a1, $a1, 60
L80023854:
  addiu $s2, $s2, 1
L80023858:
  slti $v0, $s2, 5
L8002385c:
  bne $v0, $zero, L8002380c
L80023860:
  addiu $a0, $a0, 12
L80023864:
  addu $a0, $s3, $zero
L80023868:
  jal L80022ff0
L8002386c:
  addu $a1, $zero, $zero
L80023870:
  lhu $v0, 602($gp)
L80023874:
  sll $zero, $zero, 0x0
L80023878:
  andi $v0, $v0, 0x8
L8002387c:
  beq $v0, $zero, L800238bc
L80023880:
  addiu $v0, $zero, 240
L80023884:
  lw $s0, 0($s3)
L80023888:
  sll $zero, $zero, 0x0
L8002388c:
  lhu $v1, 48($s0)
L80023890:
  addu $a0, $s0, $zero
L80023894:
  sh $v0, 42($s0)
L80023898:
  jal 0x80043178
L8002389c:
  sh $v1, 40($s0)
L800238a0:
  addu $a0, $s3, $zero
L800238a4:
  addiu $a1, $zero, 1
L800238a8:
  addiu $v0, $zero, 1024
L800238ac:
  sh $v0, 96($s0)
L800238b0:
  addiu $v0, $zero, 2
L800238b4:
  jal L80022ff0
L800238b8:
  sb $v0, 108($s0)
L800238bc:
  addu $s4, $zero, $zero
L800238c0:
  lhu $v0, 602($gp)
L800238c4:
  sll $zero, $zero, 0x0
L800238c8:
  andi $v0, $v0, 0x40
L800238cc:
  beq $v0, $zero, L8002395c
L800238d0:
  addu $s1, $s4, $zero
L800238d4:
  lw $s0, 4($s3)
L800238d8:
  sll $zero, $zero, 0x0
L800238dc:
  lh $v0, 96($s0)
L800238e0:
  sll $zero, $zero, 0x0
L800238e4:
  beq $v0, $zero, L8002395c
L800238e8:
  sll $zero, $zero, 0x0
L800238ec:
  lh $v0, 40($s0)
L800238f0:
  lbu $v1, 98($s0)
L800238f4:
  lh $a0, 54($s0)
L800238f8:
  sll $v0, $v0, 0x8
L800238fc:
  or $a2, $v0, $v1
L80023900:
  addu $a2, $a2, $a0
L80023904:
  lh $v0, 42($s0)
L80023908:
  lbu $v1, 100($s0)
L8002390c:
  lh $a0, 58($s0)
L80023910:
  sra $a1, $a2, 0x8
L80023914:
  sb $a2, 98($s0)
L80023918:
  sh $a1, 40($s0)
L8002391c:
  sll $v0, $v0, 0x8
L80023920:
  or $a2, $v0, $v1
L80023924:
  addu $a2, $a2, $a0
L80023928:
  lhu $v0, 96($s0)
L8002392c:
  sra $v1, $a2, 0x8
L80023930:
  sh $v1, 42($s0)
L80023934:
  sb $a2, 100($s0)
L80023938:
  addiu $v0, $v0, -1
L8002393c:
  sh $v0, 96($s0)
L80023940:
  sll $v0, $v0, 0x10
L80023944:
  bgtz $v0, L8002395c
L80023948:
  addiu $s4, $zero, 1
L8002394c:
  lw $v0, 44($s0)
L80023950:
  addu $s4, $zero, $zero
L80023954:
  sh $zero, 96($s0)
L80023958:
  sw $v0, 40($s0)
L8002395c:
  lhu $v0, 602($gp)
L80023960:
  lw $s0, 0($s3)
L80023964:
  andi $v0, $v0, 0x2
L80023968:
  beq $v0, $zero, L800239c0
L8002396c:
  sll $zero, $zero, 0x0
L80023970:
  lbu $v0, 108($s0)
L80023974:
  sll $zero, $zero, 0x0
L80023978:
  beq $v0, $zero, L800239c0
L8002397c:
  sll $zero, $zero, 0x0
L80023980:
  addiu $s4, $zero, 1
L80023984:
  lh $a1, 40($s0)
L80023988:
  lh $a2, 42($s0)
L8002398c:
  lh $a3, 96($s0)
L80023990:
  jal 0x80043230
L80023994:
  addu $a0, $s0, $zero
L80023998:
  lhu $v0, 96($s0)
L8002399c:
  sll $zero, $zero, 0x0
L800239a0:
  addiu $v0, $v0, 64
L800239a4:
  sh $v0, 96($s0)
L800239a8:
  sll $v0, $v0, 0x10
L800239ac:
  bltz $v0, L800239c0
L800239b0:
  addu $s1, $s4, $zero
L800239b4:
  lw $v0, 40($s0)
L800239b8:
  sb $zero, 108($s0)
L800239bc:
  sw $v0, 48($s0)
L800239c0:
  lhu $v0, 602($gp)
L800239c4:
  sll $zero, $zero, 0x0
L800239c8:
  andi $v0, $v0, 0x8
L800239cc:
  beq $v0, $zero, L80023ac8
L800239d0:
  sll $zero, $zero, 0x0
L800239d4:
  lbu $v0, 108($s0)
L800239d8:
  sll $zero, $zero, 0x0
L800239dc:
  beq $v0, $zero, L80023ac8
L800239e0:
  sll $zero, $zero, 0x0
L800239e4:
  addiu $s4, $zero, 1
L800239e8:
  lh $a1, 40($s0)
L800239ec:
  lh $a2, 42($s0)
L800239f0:
  lh $a3, 96($s0)
L800239f4:
  jal 0x80043230
L800239f8:
  addu $a0, $s0, $zero
L800239fc:
  lhu $v0, 96($s0)
L80023a00:
  sll $zero, $zero, 0x0
L80023a04:
  addiu $v0, $v0, -64
L80023a08:
  sh $v0, 96($s0)
L80023a0c:
  sll $v0, $v0, 0x10
L80023a10:
  bgez $v0, L80023ac8
L80023a14:
  addu $s1, $s4, $zero
L80023a18:
  lbu $v0, 20($s3)
L80023a1c:
  sll $zero, $zero, 0x0
L80023a20:
  sllv $a0, $v0, $s4
L80023a24:
  addu $a0, $a0, $v0
L80023a28:
  sll $a0, $a0, 0x3
L80023a2c:
  addu $a0, $a0, $v0
L80023a30:
  sll $a0, $a0, 0x2
L80023a34:
  lui $v0, 0x800f
L80023a38:
  addiu $v0, $v0, -20232
L80023a3c:
  jal 0x80035b7c
L80023a40:
  addu $a0, $a0, $v0
L80023a44:
  jal 0x8004036c
L80023a48:
  addu $a0, $s0, $zero
L80023a4c:
  lw $v0, 8($s3)
L80023a50:
  sll $zero, $zero, 0x0
L80023a54:
  beq $v0, $zero, L80023ac0
L80023a58:
  sw $zero, 0($s3)
L80023a5c:
  addu $s2, $zero, $zero
L80023a60:
  addu $s1, $s2, $zero
L80023a64:
  lw $v0, 8($s3)
L80023a68:
  sll $zero, $zero, 0x0
L80023a6c:
  addu $v0, $s1, $v0
L80023a70:
  lw $a0, 0($v0)
L80023a74:
  jal 0x8004036c
L80023a78:
  addiu $s2, $s2, 1
L80023a7c:
  lw $v0, 8($s3)
L80023a80:
  sll $zero, $zero, 0x0
L80023a84:
  addu $v0, $s1, $v0
L80023a88:
  sw $zero, 0($v0)
L80023a8c:
  lw $v0, 8($s3)
L80023a90:
  sll $zero, $zero, 0x0
L80023a94:
  addu $v0, $s1, $v0
L80023a98:
  lw $a0, 4($v0)
L80023a9c:
  jal 0x8004036c
L80023aa0:
  sll $zero, $zero, 0x0
L80023aa4:
  lw $v0, 8($s3)
L80023aa8:
  sll $zero, $zero, 0x0
L80023aac:
  addu $v0, $s1, $v0
L80023ab0:
  sw $zero, 4($v0)
L80023ab4:
  slti $v0, $s2, 5
L80023ab8:
  bne $v0, $zero, L80023a64
L80023abc:
  addiu $s1, $s1, 12
L80023ac0:
  sb $zero, 108($s0)
L80023ac4:
  addu $s1, $zero, $zero
L80023ac8:
  beq $s1, $zero, L80023b0c
L80023acc:
  sll $zero, $zero, 0x0
L80023ad0:
  lbu $v0, 20($s3)
L80023ad4:
  lh $a1, 48($s0)
L80023ad8:
  lb $a2, 22($s3)
L80023adc:
  sll $a0, $v0, 0x1
L80023ae0:
  addu $a0, $a0, $v0
L80023ae4:
  sll $a0, $a0, 0x3
L80023ae8:
  addu $a0, $a0, $v0
L80023aec:
  sll $a0, $a0, 0x2
L80023af0:
  lui $v0, 0x800f
L80023af4:
  addiu $v0, $v0, -20232
L80023af8:
  addu $a0, $a0, $v0
L80023afc:
  lh $v0, 50($s0)
L80023b00:
  addiu $a1, $a1, 16
L80023b04:
  jal 0x80039934
L80023b08:
  addu $a2, $v0, $a2
L80023b0c:
  lhu $v0, 602($gp)
L80023b10:
  sll $zero, $zero, 0x0
L80023b14:
  andi $v0, $v0, 0x4000
L80023b18:
  beq $v0, $zero, L80023b44
L80023b1c:
  sll $zero, $zero, 0x0
L80023b20:
  addiu $s4, $zero, 1
L80023b24:
  jal 0x80042b40
L80023b28:
  addu $a0, $s4, $zero
L80023b2c:
  bne $v0, $zero, L80023ce4
L80023b30:
  addu $v0, $s4, $zero
L80023b34:
  lhu $v0, 602($gp)
L80023b38:
  sll $zero, $zero, 0x0
L80023b3c:
  andi $v0, $v0, 0xbfff
L80023b40:
  sh $v0, 602($gp)
L80023b44:
  lh $v0, 764($gp)
L80023b48:
  lhu $t0, 764($gp)
L80023b4c:
  beq $v0, $zero, L80023cb0
L80023b50:
  addiu $t0, $t0, -1
L80023b54:
  addiu $s4, $zero, 1
L80023b58:
  lw $a0, 700($gp)
L80023b5c:
  lw $v0, 756($gp)
L80023b60:
  lw $a1, 596($gp)
L80023b64:
  lw $v1, 656($gp)
L80023b68:
  lw $a2, 652($gp)
L80023b6c:
  lw $a3, 608($gp)
L80023b70:
  sh $t0, 764($gp)
L80023b74:
  addu $a0, $a0, $v0
L80023b78:
  addu $a1, $a1, $v1
L80023b7c:
  lw $v0, 592($gp)
L80023b80:
  lw $v1, 796($gp)
L80023b84:
  sll $t0, $t0, 0x10
L80023b88:
  sw $a0, 700($gp)
L80023b8c:
  sra $a0, $a0, 0x10
L80023b90:
  sw $a1, 596($gp)
L80023b94:
  sra $a1, $a1, 0x10
L80023b98:
  sh $a0, 0($s5)
L80023b9c:
  sh $a1, 4($s5)
L80023ba0:
  addu $v0, $v0, $a2
L80023ba4:
  addu $v1, $v1, $a3
L80023ba8:
  sw $v0, 592($gp)
L80023bac:
  sra $v0, $v0, 0x10
L80023bb0:
  sw $v1, 796($gp)
L80023bb4:
  sra $v1, $v1, 0x10
L80023bb8:
  sh $v0, 2($s5)
L80023bbc:
  bne $t0, $zero, L80023ca8
L80023bc0:
  sw $v1, 36($s5)
L80023bc4:
  lhu $v1, 742($gp)
L80023bc8:
  lhu $a0, 650($gp)
L80023bcc:
  lhu $a1, 648($gp)
L80023bd0:
  lhu $v0, 602($gp)
L80023bd4:
  lh $a2, 606($gp)
L80023bd8:
  and $v0, $v0, $s4
L80023bdc:
  sh $v1, 0($s5)
L80023be0:
  sh $a0, 4($s5)
L80023be4:
  sh $a1, 2($s5)
L80023be8:
  beq $v0, $zero, L80023ca8
L80023bec:
  sw $a2, 36($s5)
L80023bf0:
  addiu $s2, $zero, 5
L80023bf4:
  lui $a3, 0x8888
L80023bf8:
  ori $a3, $a3, 0x8889
L80023bfc:
  lui $a2, 0x4
L80023c00:
  ori $a2, $a2, 0x8000
L80023c04:
  addu $t2, $s4, $zero
L80023c08:
  addiu $t1, $zero, 4
L80023c0c:
  lui $v0, 0x8002
L80023c10:
  addiu $t0, $v0, 9844
L80023c14:
  lui $v0, 0x8016
L80023c18:
  addiu $v0, $v0, -15324
L80023c1c:
  addiu $a1, $v0, 140
L80023c20:
  lui $v0, 0x801a
L80023c24:
  addiu $v0, $v0, 31448
L80023c28:
  addiu $a0, $v0, 140
L80023c2c:
  mult $s2, $a3
L80023c30:
  sra $v0, $s2, 0x1f
L80023c34:
  mfhi $t3
L80023c38:
  addu $v1, $t3, $s2
L80023c3c:
  sra $v1, $v1, 0x3
L80023c40:
  subu $v1, $v1, $v0
L80023c44:
  sll $v0, $v1, 0x4
L80023c48:
  subu $v0, $v0, $v1
L80023c4c:
  subu $v0, $s2, $v0
L80023c50:
  slti $v0, $v0, 5
L80023c54:
  bne $v0, $zero, L80023c84
L80023c58:
  sll $zero, $zero, 0x0
L80023c5c:
  lhu $v0, 22($a0)
L80023c60:
  sll $zero, $zero, 0x0
L80023c64:
  andi $v0, $v0, 0x8000
L80023c68:
  beq $v0, $zero, L80023c84
L80023c6c:
  addu $v0, $a1, $a2
L80023c70:
  lw $s0, 14004($v0)
L80023c74:
  sll $zero, $zero, 0x0
L80023c78:
  sb $t2, 108($s0)
L80023c7c:
  sh $t1, 96($s0)
L80023c80:
  sw $t0, 36($s0)
L80023c84:
  addiu $a1, $a1, 28
L80023c88:
  addiu $s2, $s2, 1
L80023c8c:
  slti $v0, $s2, 30
L80023c90:
  bne $v0, $zero, L80023c2c
L80023c94:
  addiu $a0, $a0, 28
L80023c98:
  lhu $v0, 602($gp)
L80023c9c:
  sll $zero, $zero, 0x0
L80023ca0:
  ori $v0, $v0, 0x4000
L80023ca4:
  sh $v0, 602($gp)
L80023ca8:
  jal 0x8001352c
L80023cac:
  sll $zero, $zero, 0x0
L80023cb0:
  bne $s4, $zero, L80023ce4
L80023cb4:
  addu $v0, $s4, $zero
L80023cb8:
  lhu $v0, 602($gp)
L80023cbc:
  sll $zero, $zero, 0x0
L80023cc0:
  andi $v0, $v0, 0x1
L80023cc4:
  beq $v0, $zero, L80023cdc
L80023cc8:
  sll $zero, $zero, 0x0
L80023ccc:
  jal L800234e4
L80023cd0:
  addu $a0, $s3, $zero
L80023cd4:
  jal L8002348c
L80023cd8:
  addu $a0, $s3, $zero
L80023cdc:
  sh $zero, 602($gp)
L80023ce0:
  addu $v0, $s4, $zero
L80023ce4:
  lw $ra, 48($sp)
L80023ce8:
  lw $s5, 44($sp)
L80023cec:
  lw $s4, 40($sp)
L80023cf0:
  lw $s3, 36($sp)
L80023cf4:
  lw $s2, 32($sp)
L80023cf8:
  lw $s1, 28($sp)
L80023cfc:
  lw $s0, 24($sp)
L80023d00:
  jr $ra
L80023d04:
  addiu $sp, $sp, 56
L80023d08:
  addiu $sp, $sp, -48
L80023d0c:
  sw $s3, 36($sp)
L80023d10:
  addu $s3, $a0, $zero
L80023d14:
  sw $ra, 40($sp)
L80023d18:
  sw $s2, 32($sp)
L80023d1c:
  sw $s1, 28($sp)
L80023d20:
  sw $s0, 24($sp)
L80023d24:
  lbu $v0, 25($s3)
L80023d28:
  lw $s1, 4($s3)
L80023d2c:
  andi $v0, $v0, 0x80
L80023d30:
  beq $v0, $zero, L80023d6c
L80023d34:
  sll $zero, $zero, 0x0
L80023d38:
  lhu $v0, 602($gp)
L80023d3c:
  sll $zero, $zero, 0x0
L80023d40:
  bne $v0, $zero, L80023fa0
L80023d44:
  sll $zero, $zero, 0x0
L80023d48:
  jal L8002348c
L80023d4c:
  sll $zero, $zero, 0x0
L80023d50:
  lbu $v0, 25($s3)
L80023d54:
  addiu $a0, $zero, 6
L80023d58:
  andi $v0, $v0, 0x3f
L80023d5c:
  jal 0x8003fee0
L80023d60:
  sb $v0, 25($s3)
L80023d64:
  j L80023fa0
L80023d68:
  sll $zero, $zero, 0x0
L80023d6c:
  bltz $a1, L80023fa0
L80023d70:
  andi $v0, $a1, 0x1
L80023d74:
  beq $v0, $zero, L80023ec4
L80023d78:
  andi $v0, $a1, 0x2
L80023d7c:
  lb $v1, 16($s3)
L80023d80:
  beq $v0, $zero, L80023d8c
L80023d84:
  addiu $s0, $v1, 1
L80023d88:
  addiu $s0, $v1, -1
L80023d8c:
  lb $v0, 18($s3)
L80023d90:
  sll $zero, $zero, 0x0
L80023d94:
  slt $v0, $s0, $v0
L80023d98:
  beq $v0, $zero, L80023fa0
L80023d9c:
  sll $zero, $zero, 0x0
L80023da0:
  lb $v0, 17($s3)
L80023da4:
  sll $zero, $zero, 0x0
L80023da8:
  slt $v0, $s0, $v0
L80023dac:
  bne $v0, $zero, L80023fa0
L80023db0:
  xor $v1, $v1, $s0
L80023db4:
  addiu $v0, $zero, 3
L80023db8:
  beq $v1, $v0, L80023dc4
L80023dbc:
  addiu $s2, $zero, 16
L80023dc0:
  addiu $s2, $zero, 8
L80023dc4:
  addiu $v0, $gp, 24
L80023dc8:
  lui $a0, 0x8009
L80023dcc:
  addiu $a0, $a0, 1964
L80023dd0:
  lbu $a1, 717($gp)
L80023dd4:
  lbu $v1, 24($s3)
L80023dd8:
  sll $a2, $a1, 0x1
L80023ddc:
  addu $a2, $a2, $v0
L80023de0:
  sll $v0, $s0, 0x1
L80023de4:
  sll $v1, $v1, 0x3
L80023de8:
  addu $v0, $v0, $v1
L80023dec:
  sll $a1, $a1, 0x4
L80023df0:
  addu $v0, $v0, $a1
L80023df4:
  addu $v0, $v0, $a0
L80023df8:
  addu $a0, $s2, $zero
L80023dfc:
  addiu $a1, $zero, 334
L80023e00:
  lhu $a3, 0($a2)
L80023e04:
  lh $v0, 0($v0)
L80023e08:
  addiu $a2, $zero, 1022
L80023e0c:
  jal L80022d94
L80023e10:
  sw $v0, 16($sp)
L80023e14:
  addu $a0, $s1, $zero
L80023e18:
  sll $v0, $s0, 0x2
L80023e1c:
  lb $v1, 15($s3)
L80023e20:
  addu $v0, $v0, $s0
L80023e24:
  sb $s0, 16($s3)
L80023e28:
  jal 0x800429d8
L80023e2c:
  addu $s0, $v0, $v1
L80023e30:
  lui $a0, 0x8009
L80023e34:
  lhu $v0, 40($s1)
L80023e38:
  addiu $a0, $a0, 2048
L80023e3c:
  sb $zero, 108($s1)
L80023e40:
  lbu $a1, 717($gp)
L80023e44:
  sll $v1, $s0, 0x2
L80023e48:
  sh $s2, 96($s1)
L80023e4c:
  sh $v0, 44($s1)
L80023e50:
  sll $v0, $a1, 0x2
L80023e54:
  addu $v0, $v0, $a1
L80023e58:
  sll $v0, $v0, 0x4
L80023e5c:
  addu $v1, $v1, $v0
L80023e60:
  addu $v1, $v1, $a0
L80023e64:
  lhu $a0, 2($v1)
L80023e68:
  lh $v1, 42($s1)
L80023e6c:
  sll $v0, $a0, 0x10
L80023e70:
  sra $v0, $v0, 0x10
L80023e74:
  subu $v0, $v0, $v1
L80023e78:
  sll $v0, $v0, 0x8
L80023e7c:
  .word 0x0052001a
L80023e80:
  bne $s2, $zero, L80023e8c
L80023e84:
  sll $zero, $zero, 0x0
L80023e88:
  .word 0x0007000d
L80023e8c:
  addiu $at, $zero, -1
L80023e90:
  bne $s2, $at, L80023ea4
L80023e94:
  lui $at, 0x8000
L80023e98:
  bne $v0, $at, L80023ea4
L80023e9c:
  sll $zero, $zero, 0x0
L80023ea0:
  .word 0x0006000d
L80023ea4:
  mflo $v0
L80023ea8:
  addiu $v1, $zero, 80
L80023eac:
  sh $v1, 602($gp)
L80023eb0:
  sh $a0, 46($s1)
L80023eb4:
  sh $v0, 58($s1)
L80023eb8:
  lbu $v0, 25($s3)
L80023ebc:
  j L80023f9c
L80023ec0:
  ori $v0, $v0, 0xc0
L80023ec4:
  lb $v1, 15($s3)
L80023ec8:
  beq $v0, $zero, L80023ed4
L80023ecc:
  addiu $s0, $v1, 1
L80023ed0:
  addiu $s0, $v1, -1
L80023ed4:
  sltiu $v0, $s0, 5
L80023ed8:
  beq $v0, $zero, L80023fa0
L80023edc:
  addu $a0, $s1, $zero
L80023ee0:
  lb $v0, 16($s3)
L80023ee4:
  addiu $s2, $zero, 8
L80023ee8:
  sb $s0, 15($s3)
L80023eec:
  sll $v1, $v0, 0x2
L80023ef0:
  addu $v1, $v1, $v0
L80023ef4:
  sll $v0, $s0, 0x18
L80023ef8:
  sra $v0, $v0, 0x18
L80023efc:
  jal 0x800429d8
L80023f00:
  addu $s0, $v1, $v0
L80023f04:
  lui $a0, 0x8009
L80023f08:
  addiu $a0, $a0, 2048
L80023f0c:
  sb $zero, 108($s1)
L80023f10:
  lbu $a1, 717($gp)
L80023f14:
  sll $v1, $s0, 0x2
L80023f18:
  sh $s2, 96($s1)
L80023f1c:
  sll $v0, $a1, 0x2
L80023f20:
  addu $v0, $v0, $a1
L80023f24:
  sll $v0, $v0, 0x4
L80023f28:
  addu $v1, $v1, $v0
L80023f2c:
  addu $v1, $v1, $a0
L80023f30:
  lhu $v0, 0($v1)
L80023f34:
  lh $v1, 40($s1)
L80023f38:
  sh $v0, 44($s1)
L80023f3c:
  lh $v0, 44($s1)
L80023f40:
  sll $zero, $zero, 0x0
L80023f44:
  subu $v0, $v0, $v1
L80023f48:
  sllv $v0, $v0, $s2
L80023f4c:
  .word 0x0052001a
L80023f50:
  bne $s2, $zero, L80023f5c
L80023f54:
  sll $zero, $zero, 0x0
L80023f58:
  .word 0x0007000d
L80023f5c:
  addiu $at, $zero, -1
L80023f60:
  bne $s2, $at, L80023f74
L80023f64:
  lui $at, 0x8000
L80023f68:
  bne $v0, $at, L80023f74
L80023f6c:
  sll $zero, $zero, 0x0
L80023f70:
  .word 0x0006000d
L80023f74:
  mflo $v0
L80023f78:
  lhu $a0, 42($s1)
L80023f7c:
  sll $zero, $zero, 0x0
L80023f80:
  sh $a0, 46($s1)
L80023f84:
  addiu $v1, $zero, 64
L80023f88:
  sh $v1, 602($gp)
L80023f8c:
  sh $v0, 54($s1)
L80023f90:
  lbu $v0, 25($s3)
L80023f94:
  sll $zero, $zero, 0x0
L80023f98:
  ori $v0, $v0, 0x80
L80023f9c:
  sb $v0, 25($s3)
L80023fa0:
  lw $ra, 40($sp)
L80023fa4:
  lw $s3, 36($sp)
L80023fa8:
  lw $s2, 32($sp)
L80023fac:
  lw $s1, 28($sp)
L80023fb0:
  lw $s0, 24($sp)
L80023fb4:
  jr $ra
L80023fb8:
  addiu $sp, $sp, 48
