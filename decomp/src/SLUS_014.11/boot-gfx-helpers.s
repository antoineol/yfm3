.set noreorder
.set noat

.section .text.boot_gfx_helpers,"ax",@progbits
.align 2
.global boot_gfx_helpers

boot_gfx_helpers:
L800137e4:
  addiu $sp, $sp, -24
L800137e8:
  lui $v0, 0x200
L800137ec:
  lui $v1, 0x800a
L800137f0:
  lw $v1, -20236($v1)
L800137f4:
  lui $a0, 0x800a
L800137f8:
  lw $a0, -20172($a0)
L800137fc:
  ori $v0, $v0, 0x30
L80013800:
  sw $ra, 20($sp)
L80013804:
  and $v1, $v1, $v0
L80013808:
  or $v1, $v1, $a0
L8001380c:
  beq $v1, $zero, L80013874
L80013810:
  sw $s0, 16($sp)
L80013814:
  lui $s0, 0x200
L80013818:
  ori $s0, $s0, 0x30
L8001381c:
  lui $v0, 0x800a
L80013820:
  lw $v0, -20236($v0)
L80013824:
  sll $zero, $zero, 0x0
L80013828:
  andi $v0, $v0, 0x20
L8001382c:
  bne $v0, $zero, L8001383c
L80013830:
  sll $zero, $zero, 0x0
L80013834:
  jal L80015038
L80013838:
  sll $zero, $zero, 0x0
L8001383c:
  jal 0x80012d4c
L80013840:
  sll $zero, $zero, 0x0
L80013844:
  lui $v0, 0x800a
L80013848:
  lw $v0, -20236($v0)
L8001384c:
  lui $v1, 0x800a
L80013850:
  lw $v1, -20172($v1)
L80013854:
  and $v0, $v0, $s0
L80013858:
  or $v0, $v0, $v1
L8001385c:
  beq $v0, $zero, L80013874
L80013860:
  sll $zero, $zero, 0x0
L80013864:
  j L8001381c
L80013868:
  sll $zero, $zero, 0x0
L8001386c:
  jal 0x80012d4c
L80013870:
  sll $zero, $zero, 0x0
L80013874:
  lui $v0, 0x800a
L80013878:
  lw $v0, -20172($v0)
L8001387c:
  sll $zero, $zero, 0x0
L80013880:
  bne $v0, $zero, L8001386c
L80013884:
  sll $zero, $zero, 0x0
L80013888:
  lw $ra, 20($sp)
L8001388c:
  lw $s0, 16($sp)
L80013890:
  jr $ra
L80013894:
  addiu $sp, $sp, 24
L80013898:
  addiu $sp, $sp, -24
L8001389c:
  sw $ra, 16($sp)
L800138a0:
  sw $a0, 528($gp)
L800138a4:
  sb $zero, 520($gp)
L800138a8:
  sb $zero, 512($gp)
L800138ac:
  sw $zero, 492($gp)
L800138b0:
  sw $zero, 536($gp)
L800138b4:
  sw $zero, 488($gp)
L800138b8:
  sw $zero, 556($gp)
L800138bc:
  sh $zero, 522($gp)
L800138c0:
  sw $zero, 516($gp)
L800138c4:
  sw $zero, 548($gp)
L800138c8:
  sh $zero, 540($gp)
L800138cc:
  sw $zero, 480($gp)
L800138d0:
  sw $zero, 552($gp)
L800138d4:
  jal 0x8007afa4
L800138d8:
  sll $zero, $zero, 0x0
L800138dc:
  beq $v0, $zero, L800138d4
L800138e0:
  addiu $v0, $zero, 1
L800138e4:
  lw $ra, 16($sp)
L800138e8:
  sw $v0, 500($gp)
L800138ec:
  jr $ra
L800138f0:
  addiu $sp, $sp, 24
L800138f4:
  addiu $sp, $sp, -56
L800138f8:
  sw $s1, 44($sp)
L800138fc:
  addu $s1, $a0, $zero
L80013900:
  sw $s0, 40($sp)
L80013904:
  addu $s0, $a1, $zero
L80013908:
  sw $ra, 48($sp)
L8001390c:
  addiu $a0, $sp, 16
L80013910:
  jal 0x8007d3f0
L80013914:
  addu $a1, $s0, $zero
L80013918:
  beq $v0, $zero, L80013910
L8001391c:
  addiu $a0, $sp, 16
L80013920:
  jal 0x8007e710
L80013924:
  addiu $a0, $sp, 16
L80013928:
  sw $v0, 0($s1)
L8001392c:
  lw $ra, 48($sp)
L80013930:
  lw $s1, 44($sp)
L80013934:
  lw $s0, 40($sp)
L80013938:
  jr $ra
L8001393c:
  addiu $sp, $sp, 56
L80013940:
  sw $a3, 16($a0)
L80013944:
  bgez $a3, L80013958
L80013948:
  andi $a1, $a1, 0xf
L8001394c:
  sll $v0, $a3, 0xb
L80013950:
  subu $v0, $zero, $v0
L80013954:
  sw $v0, 16($a0)
L80013958:
  bgez $a2, L80013970
L8001395c:
  sll $v0, $a2, 0xb
L80013960:
  subu $v0, $zero, $a2
L80013964:
  sw $zero, 20($a0)
L80013968:
  jr $ra
L8001396c:
  sw $v0, 36($a0)
L80013970:
  lui $v1, 0x800f
L80013974:
  addiu $v1, $v1, -24920
L80013978:
  sw $v0, 20($a0)
L8001397c:
  sll $v0, $a1, 0x2
L80013980:
  addu $v0, $v0, $v1
L80013984:
  lw $v0, 0($v0)
L80013988:
  sll $zero, $zero, 0x0
L8001398c:
  addu $v0, $v0, $a2
L80013990:
  jr $ra
L80013994:
  sw $v0, 36($a0)
L80013998:
  addiu $sp, $sp, -40
L8001399c:
  sw $s2, 24($sp)
L800139a0:
  addu $s2, $a0, $zero
L800139a4:
  sw $s4, 32($sp)
L800139a8:
  addu $s4, $a1, $zero
L800139ac:
  sw $ra, 36($sp)
L800139b0:
  sw $s3, 28($sp)
L800139b4:
  sw $s1, 20($sp)
L800139b8:
  sw $s0, 16($sp)
L800139bc:
  sw $a2, 24($s2)
L800139c0:
  addu $a2, $a3, $zero
L800139c4:
  lw $v0, 56($sp)
L800139c8:
  lw $s0, 60($sp)
L800139cc:
  lw $s1, 64($sp)
L800139d0:
  lw $s3, 68($sp)
L800139d4:
  jal L80013940
L800139d8:
  subu $a3, $zero, $v0
L800139dc:
  addiu $v1, $zero, 1
L800139e0:
  sb $v1, 70($s2)
L800139e4:
  sb $zero, 71($s2)
L800139e8:
  sh $zero, 68($s2)
L800139ec:
  sw $zero, 28($s2)
L800139f0:
  sw $s0, 32($s2)
L800139f4:
  beq $s3, $zero, L80013a6c
L800139f8:
  sw $s1, 64($s2)
L800139fc:
  lui $v0, 0x100
L80013a00:
  and $v0, $s4, $v0
L80013a04:
  beq $v0, $zero, L80013a14
L80013a08:
  sll $zero, $zero, 0x0
L80013a0c:
  j L80013a6c
L80013a10:
  sw $s3, 52($s2)
L80013a14:
  lw $v0, 16($s2)
L80013a18:
  bgez $s3, L80013a30
L80013a1c:
  sw $v0, 28($s2)
L80013a20:
  sb $v1, 70($s2)
L80013a24:
  sw $s3, 12($s2)
L80013a28:
  j L80013a6c
L80013a2c:
  sw $s3, 8($s2)
L80013a30:
  lui $v0, 0x1
L80013a34:
  or $s4, $s4, $v0
L80013a38:
  addiu $v0, $zero, 2
L80013a3c:
  sb $v0, 70($s2)
L80013a40:
  srl $v0, $s3, 0x10
L80013a44:
  sh $v0, 50($s2)
L80013a48:
  addiu $v0, $zero, 64
L80013a4c:
  sh $v0, 4($s2)
L80013a50:
  lw $v0, 528($gp)
L80013a54:
  addiu $v1, $zero, 16
L80013a58:
  sh $s3, 48($s2)
L80013a5c:
  sh $v1, 6($s2)
L80013a60:
  sw $v0, 8($s2)
L80013a64:
  addiu $v0, $v0, 2048
L80013a68:
  sw $v0, 12($s2)
L80013a6c:
  addu $v0, $s2, $zero
L80013a70:
  sw $s4, 44($s2)
L80013a74:
  lw $ra, 36($sp)
L80013a78:
  lw $s4, 32($sp)
L80013a7c:
  lw $s3, 28($sp)
L80013a80:
  lw $s2, 24($sp)
L80013a84:
  lw $s1, 20($sp)
L80013a88:
  lw $s0, 16($sp)
L80013a8c:
  jr $ra
L80013a90:
  addiu $sp, $sp, 40
L80013a94:
  addiu $sp, $sp, -24
L80013a98:
  addu $v1, $a0, $zero
L80013a9c:
  lw $v0, 492($gp)
L80013aa0:
  addu $a2, $a1, $zero
L80013aa4:
  sw $ra, 20($sp)
L80013aa8:
  andi $v0, $v0, 0x20
L80013aac:
  bne $v0, $zero, L80013af0
L80013ab0:
  sw $s0, 16($sp)
L80013ab4:
  lui $s0, 0x800f
L80013ab8:
  addiu $s0, $s0, -25064
L80013abc:
  addu $a0, $s0, $zero
L80013ac0:
  andi $a1, $v1, 0xf
L80013ac4:
  jal L80013940
L80013ac8:
  addu $a3, $zero, $zero
L80013acc:
  addu $v0, $s0, $zero
L80013ad0:
  sb $zero, 70($v0)
L80013ad4:
  lw $v1, 492($gp)
L80013ad8:
  lui $a0, 0x10
L80013adc:
  sw $a0, 44($v0)
L80013ae0:
  ori $v1, $v1, 0x20
L80013ae4:
  sw $v1, 492($gp)
L80013ae8:
  j L80013af4
L80013aec:
  sll $zero, $zero, 0x0
L80013af0:
  addu $v0, $zero, $zero
L80013af4:
  lw $ra, 20($sp)
L80013af8:
  lw $s0, 16($sp)
L80013afc:
  jr $ra
L80013b00:
  addiu $sp, $sp, 24
L80013b04:
  addu $a2, $a0, $zero
L80013b08:
  addu $a3, $a1, $zero
L80013b0c:
  lui $v0, 0x200
L80013b10:
  ori $v0, $v0, 0x30
L80013b14:
  lw $v1, 492($gp)
L80013b18:
  lw $a0, 556($gp)
L80013b1c:
  and $v1, $v1, $v0
L80013b20:
  or $v1, $v1, $a0
L80013b24:
  beq $v1, $zero, L80013b34
L80013b28:
  lui $a1, 0x10
L80013b2c:
  jr $ra
L80013b30:
  addu $v0, $zero, $zero
L80013b34:
  ori $a1, $a1, 0x10
L80013b38:
  lui $v0, 0x800f
L80013b3c:
  lui $a0, 0x800f
L80013b40:
  addiu $a0, $a0, -24920
L80013b44:
  sll $v1, $a2, 0x2
L80013b48:
  addu $v1, $v1, $a0
L80013b4c:
  lw $v1, 0($v1)
L80013b50:
  addiu $v0, $v0, -24992
L80013b54:
  sb $zero, 70($v0)
L80013b58:
  sw $a1, 492($gp)
L80013b5c:
  addu $v1, $v1, $a3
L80013b60:
  jr $ra
L80013b64:
  sw $v1, 36($v0)
L80013b68:
  addiu $sp, $sp, -40
L80013b6c:
  sw $s1, 20($sp)
L80013b70:
  addu $s1, $a0, $zero
L80013b74:
  sw $s2, 24($sp)
L80013b78:
  addu $s2, $a1, $zero
L80013b7c:
  sw $s3, 28($sp)
L80013b80:
  addu $s3, $a2, $zero
L80013b84:
  sw $s4, 32($sp)
L80013b88:
  addu $s4, $a3, $zero
L80013b8c:
  lw $v0, 492($gp)
L80013b90:
  addiu $v1, $zero, -33
L80013b94:
  sw $ra, 36($sp)
L80013b98:
  sw $s0, 16($sp)
L80013b9c:
  and $v0, $v0, $v1
L80013ba0:
  lui $v1, 0x800f
L80013ba4:
  sw $v0, 492($gp)
L80013ba8:
  lw $v0, 492($gp)
L80013bac:
  sll $zero, $zero, 0x0
L80013bb0:
  andi $v0, $v0, 0x10
L80013bb4:
  beq $v0, $zero, L80013bd8
L80013bb8:
  addiu $s0, $v1, -25064
L80013bbc:
  lw $v0, 492($gp)
L80013bc0:
  lui $v1, 0x8
L80013bc4:
  and $v0, $v0, $v1
L80013bc8:
  beq $v0, $zero, L80013bdc
L80013bcc:
  addiu $v0, $zero, 4
L80013bd0:
  jal L80015010
L80013bd4:
  sll $zero, $zero, 0x0
L80013bd8:
  addiu $v0, $zero, 4
L80013bdc:
  sb $s3, 56($s0)
L80013be0:
  sb $s4, 57($s0)
L80013be4:
  sb $v0, 70($s0)
L80013be8:
  lw $v0, 492($gp)
L80013bec:
  lui $v1, 0x8
L80013bf0:
  sw $s1, 36($s0)
L80013bf4:
  sw $s2, 52($s0)
L80013bf8:
  sw $v1, 44($s0)
L80013bfc:
  lw $ra, 36($sp)
L80013c00:
  lw $s4, 32($sp)
L80013c04:
  lw $s3, 28($sp)
L80013c08:
  lw $s2, 24($sp)
L80013c0c:
  lw $s1, 20($sp)
L80013c10:
  ori $v0, $v0, 0x20
L80013c14:
  sw $v0, 492($gp)
L80013c18:
  addu $v0, $s0, $zero
L80013c1c:
  lw $s0, 16($sp)
L80013c20:
  jr $ra
L80013c24:
  addiu $sp, $sp, 40
L80013c28:
  addiu $sp, $sp, -32
L80013c2c:
  lbu $v0, 524($gp)
L80013c30:
  andi $a1, $a0, 0xff
L80013c34:
  sw $ra, 24($sp)
L80013c38:
  sw $s1, 20($sp)
L80013c3c:
  sw $s0, 16($sp)
L80013c40:
  addiu $v0, $v0, 1
L80013c44:
  sb $v0, 524($gp)
L80013c48:
  addiu $v0, $zero, 1
L80013c4c:
  bne $a1, $v0, L8001408c
L80013c50:
  sll $zero, $zero, 0x0
L80013c54:
  lw $v0, 560($gp)
L80013c58:
  lw $a0, 16($gp)
L80013c5c:
  addiu $v0, $v0, 1
L80013c60:
  sw $v0, 560($gp)
L80013c64:
  lbu $v1, 70($a0)
L80013c68:
  addiu $v0, $zero, 2
L80013c6c:
  beq $v1, $v0, L80013dc8
L80013c70:
  slti $v0, $v1, 3
L80013c74:
  beq $v0, $zero, L80013c8c
L80013c78:
  sll $zero, $zero, 0x0
L80013c7c:
  beq $v1, $a1, L80013ca0
L80013c80:
  sll $zero, $zero, 0x0
L80013c84:
  j L8001408c
L80013c88:
  sll $zero, $zero, 0x0
L80013c8c:
  addiu $v0, $zero, 3
L80013c90:
  beq $v1, $v0, L80013f24
L80013c94:
  addiu $s1, $zero, 2048
L80013c98:
  j L8001408c
L80013c9c:
  sll $zero, $zero, 0x0
L80013ca0:
  lw $v0, 492($gp)
L80013ca4:
  lui $v1, 0x20
L80013ca8:
  and $v0, $v0, $v1
L80013cac:
  bne $v0, $zero, L80013d24
L80013cb0:
  sll $zero, $zero, 0x0
L80013cb4:
  lw $v0, 492($gp)
L80013cb8:
  lui $v1, 0x4000
L80013cbc:
  and $v0, $v0, $v1
L80013cc0:
  bne $v0, $zero, L80013cdc
L80013cc4:
  addu $a2, $zero, $zero
L80013cc8:
  lw $a0, 8($a0)
L80013ccc:
  jal 0x8007e3d0
L80013cd0:
  addiu $a1, $zero, 512
L80013cd4:
  j L80013d0c
L80013cd8:
  sll $zero, $zero, 0x0
L80013cdc:
  addu $a3, $a0, $zero
L80013ce0:
  lw $a1, 496($gp)
L80013ce4:
  sll $zero, $zero, 0x0
L80013ce8:
  lw $a0, 0($a1)
L80013cec:
  sll $v0, $a2, 0x2
L80013cf0:
  lw $v1, 8($a3)
L80013cf4:
  addiu $a2, $a2, 1
L80013cf8:
  addu $v0, $v0, $v1
L80013cfc:
  sw $a0, 0($v0)
L80013d00:
  slti $v0, $a2, 512
L80013d04:
  bne $v0, $zero, L80013ce4
L80013d08:
  addiu $a1, $a1, 4
L80013d0c:
  lw $v1, 16($gp)
L80013d10:
  sll $zero, $zero, 0x0
L80013d14:
  lw $v0, 8($v1)
L80013d18:
  sll $zero, $zero, 0x0
L80013d1c:
  addiu $v0, $v0, 2048
L80013d20:
  sw $v0, 8($v1)
L80013d24:
  lw $v0, 16($gp)
L80013d28:
  lw $v1, 496($gp)
L80013d2c:
  lw $a0, 16($v0)
L80013d30:
  addiu $v1, $v1, 2048
L80013d34:
  sw $v1, 496($gp)
L80013d38:
  addiu $a0, $a0, -2048
L80013d3c:
  bgtz $a0, L80013d54
L80013d40:
  sw $a0, 16($v0)
L80013d44:
  jal 0x8007ddd4
L80013d48:
  sll $zero, $zero, 0x0
L80013d4c:
  jal 0x8007e860
L80013d50:
  addu $a0, $zero, $zero
L80013d54:
  lw $s0, 16($gp)
L80013d58:
  sll $zero, $zero, 0x0
L80013d5c:
  lw $v0, 40($s0)
L80013d60:
  sll $zero, $zero, 0x0
L80013d64:
  addiu $v0, $v0, -2048
L80013d68:
  bgtz $v0, L80013da8
L80013d6c:
  sw $v0, 40($s0)
L80013d70:
  lw $v0, 32($s0)
L80013d74:
  sll $zero, $zero, 0x0
L80013d78:
  beq $v0, $zero, L80013d9c
L80013d7c:
  sw $zero, 28($s0)
L80013d80:
  addu $a0, $s0, $zero
L80013d84:
  lw $v0, 64($s0)
L80013d88:
  lw $v1, 32($s0)
L80013d8c:
  addu $a1, $v0, $zero
L80013d90:
  addiu $v0, $v0, 1
L80013d94:
  jalr $ra, $v1
L80013d98:
  sw $v0, 64($s0)
L80013d9c:
  lw $v0, 28($s0)
L80013da0:
  sll $zero, $zero, 0x0
L80013da4:
  sw $v0, 40($s0)
L80013da8:
  lw $v0, 16($gp)
L80013dac:
  sll $zero, $zero, 0x0
L80013db0:
  lw $v0, 16($v0)
L80013db4:
  sll $zero, $zero, 0x0
L80013db8:
  blez $v0, L8001407c
L80013dbc:
  sll $zero, $zero, 0x0
L80013dc0:
  j L8001408c
L80013dc4:
  sll $zero, $zero, 0x0
L80013dc8:
  lhu $v0, 68($a0)
L80013dcc:
  sll $zero, $zero, 0x0
L80013dd0:
  andi $v0, $v0, 0x1
L80013dd4:
  sll $v0, $v0, 0x2
L80013dd8:
  addu $v0, $a0, $v0
L80013ddc:
  lw $s0, 8($v0)
L80013de0:
  lw $v0, 492($gp)
L80013de4:
  lui $v1, 0x4000
L80013de8:
  and $v0, $v0, $v1
L80013dec:
  bne $v0, $zero, L80013e08
L80013df0:
  addu $a2, $zero, $zero
L80013df4:
  addu $a0, $s0, $zero
L80013df8:
  jal 0x8007e3d0
L80013dfc:
  addiu $a1, $zero, 512
L80013e00:
  j L80013e40
L80013e04:
  sll $zero, $zero, 0x0
L80013e08:
  addu $a0, $s0, $zero
L80013e0c:
  lw $v1, 496($gp)
L80013e10:
  sll $zero, $zero, 0x0
L80013e14:
  lw $v0, 0($v1)
L80013e18:
  addiu $v1, $v1, 4
L80013e1c:
  addiu $a2, $a2, 1
L80013e20:
  sw $v0, 0($a0)
L80013e24:
  slti $v0, $a2, 512
L80013e28:
  bne $v0, $zero, L80013e10
L80013e2c:
  addiu $a0, $a0, 4
L80013e30:
  lw $v0, 496($gp)
L80013e34:
  sll $zero, $zero, 0x0
L80013e38:
  addiu $v0, $v0, 2048
L80013e3c:
  sw $v0, 496($gp)
L80013e40:
  lw $v1, 16($gp)
L80013e44:
  sll $zero, $zero, 0x0
L80013e48:
  lw $v0, 16($v1)
L80013e4c:
  sll $zero, $zero, 0x0
L80013e50:
  addiu $v0, $v0, -2048
L80013e54:
  bgtz $v0, L80013e6c
L80013e58:
  sw $v0, 16($v1)
L80013e5c:
  jal 0x8007ddd4
L80013e60:
  sll $zero, $zero, 0x0
L80013e64:
  jal 0x8007e860
L80013e68:
  addu $a0, $zero, $zero
L80013e6c:
  lw $v0, 16($gp)
L80013e70:
  sll $zero, $zero, 0x0
L80013e74:
  lhu $v1, 48($v0)
L80013e78:
  lhu $a0, 50($v0)
L80013e7c:
  sh $v1, 0($v0)
L80013e80:
  sh $a0, 2($v0)
L80013e84:
  lw $a0, 16($gp)
L80013e88:
  jal 0x80081de8
L80013e8c:
  addu $a1, $s0, $zero
L80013e90:
  bne $v0, $zero, L80013e84
L80013e94:
  sll $zero, $zero, 0x0
L80013e98:
  lw $v0, 492($gp)
L80013e9c:
  lui $v1, 0x2
L80013ea0:
  and $v0, $v0, $v1
L80013ea4:
  beq $v0, $zero, L80013ec8
L80013ea8:
  sll $zero, $zero, 0x0
L80013eac:
  lw $v1, 16($gp)
L80013eb0:
  sll $zero, $zero, 0x0
L80013eb4:
  lhu $v0, 48($v1)
L80013eb8:
  sll $zero, $zero, 0x0
L80013ebc:
  addiu $v0, $v0, 64
L80013ec0:
  j L80013f00
L80013ec4:
  sh $v0, 48($v1)
L80013ec8:
  lw $a0, 16($gp)
L80013ecc:
  sll $zero, $zero, 0x0
L80013ed0:
  lhu $v0, 50($a0)
L80013ed4:
  sll $zero, $zero, 0x0
L80013ed8:
  addiu $v1, $v0, 16
L80013edc:
  andi $v0, $v1, 0xff
L80013ee0:
  bne $v0, $zero, L80013f00
L80013ee4:
  sh $v1, 50($a0)
L80013ee8:
  xori $v0, $v1, 0x100
L80013eec:
  lhu $v1, 48($a0)
L80013ef0:
  andi $v0, $v0, 0x100
L80013ef4:
  sh $v0, 50($a0)
L80013ef8:
  addiu $v1, $v1, 64
L80013efc:
  sh $v1, 48($a0)
L80013f00:
  lw $s0, 16($gp)
L80013f04:
  sll $zero, $zero, 0x0
L80013f08:
  lw $v0, 40($s0)
L80013f0c:
  sll $zero, $zero, 0x0
L80013f10:
  addiu $v0, $v0, -2048
L80013f14:
  bgtz $v0, L80014060
L80013f18:
  sw $v0, 40($s0)
L80013f1c:
  j L80014028
L80013f20:
  sll $zero, $zero, 0x0
L80013f24:
  lw $v1, 40($a0)
L80013f28:
  lw $s0, 8($a0)
L80013f2c:
  slt $v0, $v1, $s1
L80013f30:
  beq $v0, $zero, L80013f3c
L80013f34:
  sll $zero, $zero, 0x0
L80013f38:
  addu $s1, $v1, $zero
L80013f3c:
  lw $v0, 492($gp)
L80013f40:
  lui $v1, 0x4000
L80013f44:
  and $v0, $v0, $v1
L80013f48:
  bne $v0, $zero, L80013f70
L80013f4c:
  addu $a2, $zero, $zero
L80013f50:
  bgez $s1, L80013f5c
L80013f54:
  addu $a1, $s1, $zero
L80013f58:
  addiu $a1, $s1, 3
L80013f5c:
  addu $a0, $s0, $zero
L80013f60:
  jal 0x8007e3d0
L80013f64:
  sra $a1, $a1, 0x2
L80013f68:
  j L80013fb8
L80013f6c:
  sll $zero, $zero, 0x0
L80013f70:
  addu $a0, $s0, $zero
L80013f74:
  lw $v1, 496($gp)
L80013f78:
  bgez $s1, L80013f84
L80013f7c:
  addu $v0, $s1, $zero
L80013f80:
  addiu $v0, $s1, 3
L80013f84:
  sra $v0, $v0, 0x2
L80013f88:
  slt $v0, $a2, $v0
L80013f8c:
  beq $v0, $zero, L80013fa8
L80013f90:
  addiu $a2, $a2, 1
L80013f94:
  lw $v0, 0($v1)
L80013f98:
  addiu $v1, $v1, 4
L80013f9c:
  sw $v0, 0($a0)
L80013fa0:
  j L80013f78
L80013fa4:
  addiu $a0, $a0, 4
L80013fa8:
  lw $v0, 496($gp)
L80013fac:
  sll $zero, $zero, 0x0
L80013fb0:
  addu $v0, $v0, $s1
L80013fb4:
  sw $v0, 496($gp)
L80013fb8:
  lw $v1, 16($gp)
L80013fbc:
  sll $zero, $zero, 0x0
L80013fc0:
  lw $v0, 16($v1)
L80013fc4:
  sll $zero, $zero, 0x0
L80013fc8:
  addiu $v0, $v0, -2048
L80013fcc:
  bgtz $v0, L80013fe4
L80013fd0:
  sw $v0, 16($v1)
L80013fd4:
  jal 0x8007ddd4
L80013fd8:
  sll $zero, $zero, 0x0
L80013fdc:
  jal 0x8007e860
L80013fe0:
  addu $a0, $zero, $zero
L80013fe4:
  lw $v0, 16($gp)
L80013fe8:
  sll $zero, $zero, 0x0
L80013fec:
  lw $a0, 48($v0)
L80013ff0:
  jal 0x800771b0
L80013ff4:
  sll $zero, $zero, 0x0
L80013ff8:
  addu $a0, $s0, $zero
L80013ffc:
  jal 0x80077150
L80014000:
  addu $a1, $s1, $zero
L80014004:
  lw $s0, 16($gp)
L80014008:
  sll $zero, $zero, 0x0
L8001400c:
  lw $v0, 48($s0)
L80014010:
  lw $v1, 40($s0)
L80014014:
  addu $v0, $v0, $s1
L80014018:
  addiu $v1, $v1, -2048
L8001401c:
  sw $v0, 48($s0)
L80014020:
  bgtz $v1, L80014060
L80014024:
  sw $v1, 40($s0)
L80014028:
  lw $v0, 32($s0)
L8001402c:
  sll $zero, $zero, 0x0
L80014030:
  beq $v0, $zero, L80014054
L80014034:
  sw $zero, 28($s0)
L80014038:
  addu $a0, $s0, $zero
L8001403c:
  lw $v0, 64($s0)
L80014040:
  lw $v1, 32($s0)
L80014044:
  addu $a1, $v0, $zero
L80014048:
  addiu $v0, $v0, 1
L8001404c:
  jalr $ra, $v1
L80014050:
  sw $v0, 64($s0)
L80014054:
  lw $v0, 28($s0)
L80014058:
  sll $zero, $zero, 0x0
L8001405c:
  sw $v0, 40($s0)
L80014060:
  lw $v0, 16($gp)
L80014064:
  sll $zero, $zero, 0x0
L80014068:
  lhu $v1, 68($v0)
L8001406c:
  lw $a0, 16($v0)
L80014070:
  addiu $v1, $v1, 1
L80014074:
  bgtz $a0, L8001408c
L80014078:
  sh $v1, 68($v0)
L8001407c:
  lw $v0, 492($gp)
L80014080:
  addiu $v1, $zero, -257
L80014084:
  and $v0, $v0, $v1
L80014088:
  sw $v0, 492($gp)
L8001408c:
  lw $ra, 24($sp)
L80014090:
  lw $s1, 20($sp)
L80014094:
  lw $s0, 16($sp)
L80014098:
  jr $ra
L8001409c:
  addiu $sp, $sp, 32
L800140a0:
  addiu $sp, $sp, -32
L800140a4:
  andi $a0, $a0, 0xff
L800140a8:
  addiu $v0, $zero, 5
L800140ac:
  bne $a0, $v0, L800140e8
L800140b0:
  sw $ra, 24($sp)
L800140b4:
  addiu $a0, $zero, 160
L800140b8:
  addiu $a1, $gp, 508
L800140bc:
  addiu $v1, $zero, -1
L800140c0:
  lui $a3, 0x8001
L800140c4:
  addiu $a2, $zero, 6
L800140c8:
  lw $v0, 552($gp)
L800140cc:
  sw $v1, 16($sp)
L800140d0:
  addiu $v0, $v0, 1
L800140d4:
  sw $v0, 552($gp)
L800140d8:
  jal 0x8007b468
L800140dc:
  addiu $a3, $a3, 16544
L800140e0:
  j L80014124
L800140e4:
  sll $zero, $zero, 0x0
L800140e8:
  addiu $v0, $zero, 2
L800140ec:
  bne $a0, $v0, L80014124
L800140f0:
  sll $zero, $zero, 0x0
L800140f4:
  jal 0x8007de38
L800140f8:
  addiu $a0, $zero, 1
L800140fc:
  lui $a0, 0x8001
L80014100:
  addiu $a0, $a0, 15400
L80014104:
  jal 0x8007dd50
L80014108:
  addiu $a1, $zero, -1
L8001410c:
  lw $v0, 492($gp)
L80014110:
  addiu $v1, $zero, -1025
L80014114:
  sb $zero, 524($gp)
L80014118:
  sw $zero, 560($gp)
L8001411c:
  and $v0, $v0, $v1
L80014120:
  sw $v0, 492($gp)
L80014124:
  lw $ra, 24($sp)
L80014128:
  sll $zero, $zero, 0x0
L8001412c:
  jr $ra
L80014130:
  addiu $sp, $sp, 32
L80014134:
  addiu $sp, $sp, -32
L80014138:
  andi $a0, $a0, 0xff
L8001413c:
  addiu $v0, $zero, 5
L80014140:
  bne $a0, $v0, L8001417c
L80014144:
  sw $ra, 24($sp)
L80014148:
  addiu $v1, $zero, -1
L8001414c:
  lui $a3, 0x8001
L80014150:
  addiu $a0, $zero, 160
L80014154:
  addiu $a1, $gp, 508
L80014158:
  addiu $a2, $zero, 21
L8001415c:
  lw $v0, 552($gp)
L80014160:
  sw $v1, 16($sp)
L80014164:
  addiu $v0, $v0, 1
L80014168:
  sw $v0, 552($gp)
L8001416c:
  jal 0x8007b468
L80014170:
  addiu $a3, $a3, 16692
L80014174:
  j L80014198
L80014178:
  sll $zero, $zero, 0x0
L8001417c:
  addiu $v0, $zero, 2
L80014180:
  bne $a0, $v0, L80014198
L80014184:
  sll $zero, $zero, 0x0
L80014188:
  lw $v0, 492($gp)
L8001418c:
  addiu $v1, $zero, -1025
L80014190:
  and $v0, $v0, $v1
L80014194:
  sw $v0, 492($gp)
L80014198:
  lw $ra, 24($sp)
L8001419c:
  sll $zero, $zero, 0x0
L800141a0:
  jr $ra
L800141a4:
  addiu $sp, $sp, 32
L800141a8:
  addiu $sp, $sp, -24
L800141ac:
  andi $a0, $a0, 0xff
L800141b0:
  addiu $v0, $zero, 5
L800141b4:
  bne $a0, $v0, L800141ec
L800141b8:
  sw $ra, 16($sp)
L800141bc:
  lui $a2, 0x8001
L800141c0:
  addiu $a0, $zero, 9
L800141c4:
  addu $a1, $zero, $zero
L800141c8:
  addiu $a2, $a2, 16808
L800141cc:
  lw $v0, 552($gp)
L800141d0:
  sll $zero, $zero, 0x0
L800141d4:
  addiu $v0, $v0, 1
L800141d8:
  sw $v0, 552($gp)
L800141dc:
  jal 0x8007b1f4
L800141e0:
  addiu $a3, $zero, -1
L800141e4:
  j L80014210
L800141e8:
  sll $zero, $zero, 0x0
L800141ec:
  addiu $v0, $zero, 2
L800141f0:
  bne $a0, $v0, L80014210
L800141f4:
  lui $v1, 0x800f
L800141f8:
  addiu $v0, $zero, 1
L800141fc:
  sb $v0, -24921($v1)
L80014200:
  lw $v0, 492($gp)
L80014204:
  addiu $v1, $zero, -1025
L80014208:
  and $v0, $v0, $v1
L8001420c:
  sw $v0, 492($gp)
L80014210:
  lw $ra, 16($sp)
L80014214:
  sll $zero, $zero, 0x0
L80014218:
  jr $ra
L8001421c:
  addiu $sp, $sp, 24
L80014220:
  addiu $sp, $sp, -24
L80014224:
  andi $a0, $a0, 0xff
L80014228:
  addiu $v0, $zero, 5
L8001422c:
  bne $a0, $v0, L80014264
L80014230:
  sw $ra, 16($sp)
L80014234:
  lui $a2, 0x8001
L80014238:
  addiu $a0, $zero, 9
L8001423c:
  addu $a1, $zero, $zero
L80014240:
  addiu $a2, $a2, 16928
L80014244:
  lw $v0, 552($gp)
L80014248:
  sll $zero, $zero, 0x0
L8001424c:
  addiu $v0, $v0, 1
L80014250:
  sw $v0, 552($gp)
L80014254:
  jal 0x8007b1f4
L80014258:
  addiu $a3, $zero, -1
L8001425c:
  j L80014284
L80014260:
  sll $zero, $zero, 0x0
L80014264:
  addiu $v0, $zero, 2
L80014268:
  bne $a0, $v0, L80014284
L8001426c:
  sll $zero, $zero, 0x0
L80014270:
  sh $a0, 504($gp)
L80014274:
  lw $v0, 492($gp)
L80014278:
  addiu $v1, $zero, -1025
L8001427c:
  and $v0, $v0, $v1
L80014280:
  sw $v0, 492($gp)
L80014284:
  lw $ra, 16($sp)
L80014288:
  sll $zero, $zero, 0x0
L8001428c:
  jr $ra
L80014290:
  addiu $sp, $sp, 24
L80014294:
  addiu $sp, $sp, -24
L80014298:
  andi $a0, $a0, 0xff
L8001429c:
  addiu $v0, $zero, 5
L800142a0:
  bne $a0, $v0, L800142d8
L800142a4:
  sw $ra, 16($sp)
L800142a8:
  lui $a2, 0x8001
L800142ac:
  addiu $a0, $zero, 13
L800142b0:
  addiu $a1, $gp, 532
L800142b4:
  addiu $a2, $a2, 17044
L800142b8:
  lw $v0, 552($gp)
L800142bc:
  sll $zero, $zero, 0x0
L800142c0:
  addiu $v0, $v0, 1
L800142c4:
  sw $v0, 552($gp)
L800142c8:
  jal 0x8007b1f4
L800142cc:
  addiu $a3, $zero, -1
L800142d0:
  j L800142f8
L800142d4:
  sll $zero, $zero, 0x0
L800142d8:
  addiu $v0, $zero, 2
L800142dc:
  bne $a0, $v0, L800142f8
L800142e0:
  addiu $v0, $zero, 4
L800142e4:
  sh $v0, 504($gp)
L800142e8:
  lw $v0, 492($gp)
L800142ec:
  addiu $v1, $zero, -1025
L800142f0:
  and $v0, $v0, $v1
L800142f4:
  sw $v0, 492($gp)
L800142f8:
  lw $ra, 16($sp)
L800142fc:
  sll $zero, $zero, 0x0
L80014300:
  jr $ra
L80014304:
  addiu $sp, $sp, 24
L80014308:
  addiu $sp, $sp, -32
L8001430c:
  andi $a0, $a0, 0xff
L80014310:
  addiu $v1, $zero, 5
L80014314:
  bne $a0, $v1, L80014350
L80014318:
  sw $ra, 24($sp)
L8001431c:
  addiu $v1, $zero, -1
L80014320:
  lui $a3, 0x8001
L80014324:
  addiu $a0, $zero, 74
L80014328:
  addiu $a1, $gp, 508
L8001432c:
  addiu $a2, $zero, 27
L80014330:
  lw $v0, 552($gp)
L80014334:
  sw $v1, 16($sp)
L80014338:
  addiu $v0, $v0, 1
L8001433c:
  sw $v0, 552($gp)
L80014340:
  jal 0x8007b468
L80014344:
  addiu $a3, $a3, 17160
L80014348:
  j L80014380
L8001434c:
  sll $zero, $zero, 0x0
L80014350:
  addiu $v0, $zero, 2
L80014354:
  bne $a0, $v0, L80014380
L80014358:
  sll $zero, $zero, 0x0
L8001435c:
  sh $v1, 504($gp)
L80014360:
  lw $v0, 492($gp)
L80014364:
  sll $zero, $zero, 0x0
L80014368:
  ori $v0, $v0, 0x1000
L8001436c:
  sw $v0, 492($gp)
L80014370:
  lw $v0, 492($gp)
L80014374:
  addiu $v1, $zero, -1025
L80014378:
  and $v0, $v0, $v1
L8001437c:
  sw $v0, 492($gp)
L80014380:
  lw $ra, 24($sp)
L80014384:
  sll $zero, $zero, 0x0
L80014388:
  jr $ra
L8001438c:
  addiu $sp, $sp, 32
L80014390:
  addiu $sp, $sp, -24
L80014394:
  andi $a0, $a0, 0xff
L80014398:
  addiu $v0, $zero, 2
L8001439c:
  bne $a0, $v0, L800143cc
L800143a0:
  sw $ra, 16($sp)
L800143a4:
  jal 0x8007e710
L800143a8:
  addu $a0, $a1, $zero
L800143ac:
  addu $v1, $v0, $zero
L800143b0:
  blez $v1, L800143bc
L800143b4:
  lui $v0, 0x800f
L800143b8:
  sw $v1, -24944($v0)
L800143bc:
  lw $v0, 492($gp)
L800143c0:
  addiu $v1, $zero, -2049
L800143c4:
  and $v0, $v0, $v1
L800143c8:
  sw $v0, 492($gp)
L800143cc:
  lw $ra, 16($sp)
L800143d0:
  sll $zero, $zero, 0x0
L800143d4:
  jr $ra
L800143d8:
  addiu $sp, $sp, 24
L800143dc:
  lui $v0, 0x800f
L800143e0:
  addiu $v1, $v0, -24992
L800143e4:
  lui $v0, 0x800f
L800143e8:
  addiu $v0, $v0, -25064
L800143ec:
  addiu $a0, $v0, 64
L800143f0:
  lw $a1, 0($v0)
L800143f4:
  lw $a2, 4($v0)
L800143f8:
  lw $a3, 8($v0)
L800143fc:
  lw $t0, 12($v0)
L80014400:
  sw $a1, 0($v1)
L80014404:
  sw $a2, 4($v1)
L80014408:
  sw $a3, 8($v1)
L8001440c:
  sw $t0, 12($v1)
L80014410:
  addiu $v0, $v0, 16
L80014414:
  bne $v0, $a0, L800143f0
L80014418:
  addiu $v1, $v1, 16
L8001441c:
  lw $a1, 0($v0)
L80014420:
  lw $a2, 4($v0)
L80014424:
  sw $a1, 0($v1)
L80014428:
  sw $a2, 4($v1)
L8001442c:
  lui $v1, 0x801d
L80014430:
  addiu $v0, $v1, 16896
L80014434:
  addiu $t0, $v1, 16896
L80014438:
  lw $a1, 32($v0)
L8001443c:
  lw $a2, 36($v0)
L80014440:
  lw $a3, 40($v0)
L80014444:
  sw $a1, 0($t0)
L80014448:
  sw $a2, 4($t0)
L8001444c:
  sw $a3, 8($t0)
L80014450:
  lw $a1, 44($v0)
L80014454:
  lw $a2, 48($v0)
L80014458:
  lw $a3, 52($v0)
L8001445c:
  sw $a1, 12($t0)
L80014460:
  sw $a2, 16($t0)
L80014464:
  sw $a3, 20($t0)
L80014468:
  lw $a1, 56($v0)
L8001446c:
  lw $a2, 60($v0)
L80014470:
  sw $a1, 24($t0)
L80014474:
  sw $a2, 28($t0)
L80014478:
  lui $v0, 0x800f
L8001447c:
  addiu $a0, $v0, -24992
L80014480:
  lbu $v1, 70($a0)
L80014484:
  addiu $v0, $zero, 4
L80014488:
  bne $v1, $v0, L800144a0
L8001448c:
  sll $zero, $zero, 0x0
L80014490:
  lhu $v0, 522($gp)
L80014494:
  sll $zero, $zero, 0x0
L80014498:
  ori $v0, $v0, 0x1
L8001449c:
  sh $v0, 522($gp)
L800144a0:
  lw $v0, 44($a0)
L800144a4:
  sll $zero, $zero, 0x0
L800144a8:
  ori $v0, $v0, 0x10
L800144ac:
  sw $v0, 492($gp)
L800144b0:
  jr $ra
L800144b4:
  sll $zero, $zero, 0x0
L800144b8:
  lw $v0, 492($gp)
L800144bc:
  sll $zero, $zero, 0x0
L800144c0:
  andi $v0, $v0, 0x60
L800144c4:
  sw $v0, 492($gp)
L800144c8:
  lw $v0, 492($gp)
L800144cc:
  addiu $sp, $sp, -24
L800144d0:
  andi $v0, $v0, 0x20
L800144d4:
  beq $v0, $zero, L80014548
L800144d8:
  sw $ra, 16($sp)
L800144dc:
  lw $v0, 492($gp)
L800144e0:
  sll $zero, $zero, 0x0
L800144e4:
  andi $v0, $v0, 0x40
L800144e8:
  bne $v0, $zero, L80014548
L800144ec:
  sll $zero, $zero, 0x0
L800144f0:
  jal L800143dc
L800144f4:
  sll $zero, $zero, 0x0
L800144f8:
  lw $v0, 556($gp)
L800144fc:
  sll $zero, $zero, 0x0
L80014500:
  beq $v0, $zero, L8001454c
L80014504:
  sll $zero, $zero, 0x0
L80014508:
  lw $v0, 492($gp)
L8001450c:
  sll $zero, $zero, 0x0
L80014510:
  andi $v0, $v0, 0x10
L80014514:
  beq $v0, $zero, L8001453c
L80014518:
  addiu $v0, $zero, 128
L8001451c:
  lw $v0, 492($gp)
L80014520:
  lui $v1, 0x8
L80014524:
  and $v0, $v0, $v1
L80014528:
  beq $v0, $zero, L8001453c
L8001452c:
  addiu $v0, $zero, 128
L80014530:
  jal L80015010
L80014534:
  sll $zero, $zero, 0x0
L80014538:
  addiu $v0, $zero, 128
L8001453c:
  sw $v0, 556($gp)
L80014540:
  j L8001454c
L80014544:
  sll $zero, $zero, 0x0
L80014548:
  sw $zero, 556($gp)
L8001454c:
  lw $ra, 16($sp)
L80014550:
  sll $zero, $zero, 0x0
L80014554:
  jr $ra
L80014558:
  addiu $sp, $sp, 24
L8001455c:
  addiu $sp, $sp, -32
L80014560:
  lw $v0, 492($gp)
L80014564:
  lui $v1, 0x800f
L80014568:
  sw $s0, 24($sp)
L8001456c:
  addiu $s0, $v1, -24992
L80014570:
  andi $v0, $v0, 0x1000
L80014574:
  beq $v0, $zero, L800145bc
L80014578:
  sw $ra, 28($sp)
L8001457c:
  lw $v0, 492($gp)
L80014580:
  sll $zero, $zero, 0x0
L80014584:
  andi $v0, $v0, 0x800
L80014588:
  bne $v0, $zero, L800145bc
L8001458c:
  addiu $a0, $zero, 16
L80014590:
  addu $a1, $zero, $zero
L80014594:
  lui $a2, 0x8001
L80014598:
  addiu $a2, $a2, 17296
L8001459c:
  jal 0x8007b1f4
L800145a0:
  addu $a3, $a1, $zero
L800145a4:
  blez $v0, L800145bc
L800145a8:
  sll $zero, $zero, 0x0
L800145ac:
  lw $v0, 492($gp)
L800145b0:
  sll $zero, $zero, 0x0
L800145b4:
  ori $v0, $v0, 0x800
L800145b8:
  sw $v0, 492($gp)
L800145bc:
  lw $v0, 492($gp)
L800145c0:
  sll $zero, $zero, 0x0
L800145c4:
  andi $v0, $v0, 0x400
L800145c8:
  bne $v0, $zero, L80014a4c
L800145cc:
  sll $zero, $zero, 0x0
L800145d0:
  lw $v0, 492($gp)
L800145d4:
  lui $v1, 0x8
L800145d8:
  and $v0, $v0, $v1
L800145dc:
  beq $v0, $zero, L8001485c
L800145e0:
  addiu $v0, $zero, 5
L800145e4:
  lhu $v0, 522($gp)
L800145e8:
  sll $zero, $zero, 0x0
L800145ec:
  andi $v0, $v0, 0x8000
L800145f0:
  bne $v0, $zero, L80014664
L800145f4:
  sll $zero, $zero, 0x0
L800145f8:
  lhu $v0, 522($gp)
L800145fc:
  sll $zero, $zero, 0x0
L80014600:
  ori $v0, $v0, 0x8000
L80014604:
  sh $v0, 522($gp)
L80014608:
  lhu $v0, 522($gp)
L8001460c:
  sll $zero, $zero, 0x0
L80014610:
  andi $v0, $v0, 0x3
L80014614:
  beq $v0, $zero, L8001470c
L80014618:
  sll $zero, $zero, 0x0
L8001461c:
  lhu $v0, 522($gp)
L80014620:
  sll $zero, $zero, 0x0
L80014624:
  andi $v0, $v0, 0x2000
L80014628:
  bne $v0, $zero, L80014634
L8001462c:
  sll $zero, $zero, 0x0
L80014630:
  sh $zero, 504($gp)
L80014634:
  lhu $v0, 522($gp)
L80014638:
  sll $zero, $zero, 0x0
L8001463c:
  andi $v0, $v0, 0x2
L80014640:
  beq $v0, $zero, L80014660
L80014644:
  sll $zero, $zero, 0x0
L80014648:
  lhu $v0, 522($gp)
L8001464c:
  sll $zero, $zero, 0x0
L80014650:
  andi $v0, $v0, 0xfffe
L80014654:
  sh $v0, 522($gp)
L80014658:
  j L80014664
L8001465c:
  sll $zero, $zero, 0x0
L80014660:
  sw $zero, 48($s0)
L80014664:
  lhu $v0, 504($gp)
L80014668:
  sll $zero, $zero, 0x0
L8001466c:
  andi $v1, $v0, 0xffff
L80014670:
  sltiu $v0, $v1, 7
L80014674:
  beq $v0, $zero, L80014a4c
L80014678:
  lui $v0, 0x8001
L8001467c:
  addiu $v0, $v0, 68
L80014680:
  sll $v1, $v1, 0x2
L80014684:
  addu $v1, $v1, $v0
L80014688:
  lw $v0, 0($v1)
L8001468c:
  sll $zero, $zero, 0x0
L80014690:
  jr $v0
L80014694:
  sll $zero, $zero, 0x0
L80014698:
  lhu $v0, 522($gp)
L8001469c:
  sll $zero, $zero, 0x0
L800146a0:
  ori $v0, $v0, 0x2000
L800146a4:
  sh $v0, 522($gp)
L800146a8:
  addiu $v0, $zero, 1
L800146ac:
  sh $v0, 504($gp)
L800146b0:
  addiu $a0, $zero, 9
L800146b4:
  addu $a1, $zero, $zero
L800146b8:
  lui $a2, 0x8001
L800146bc:
  addiu $a2, $a2, 16928
L800146c0:
  jal 0x8007b1f4
L800146c4:
  addiu $a3, $zero, -1
L800146c8:
  blez $v0, L80014a4c
L800146cc:
  sll $zero, $zero, 0x0
L800146d0:
  lw $v0, 492($gp)
L800146d4:
  lw $v1, 536($gp)
L800146d8:
  ori $v0, $v0, 0x400
L800146dc:
  sw $v0, 492($gp)
L800146e0:
  j L80014844
L800146e4:
  sll $zero, $zero, 0x0
L800146e8:
  lhu $v0, 522($gp)
L800146ec:
  sll $zero, $zero, 0x0
L800146f0:
  andi $v0, $v0, 0xdfff
L800146f4:
  sh $v0, 522($gp)
L800146f8:
  lhu $v0, 522($gp)
L800146fc:
  sll $zero, $zero, 0x0
L80014700:
  andi $v0, $v0, 0x1
L80014704:
  bne $v0, $zero, L80014720
L80014708:
  addiu $v0, $zero, 3
L8001470c:
  sh $zero, 522($gp)
L80014710:
  jal L800144b8
L80014714:
  sll $zero, $zero, 0x0
L80014718:
  j L80014a4c
L8001471c:
  sll $zero, $zero, 0x0
L80014720:
  sh $v0, 504($gp)
L80014724:
  addiu $a0, $zero, 13
L80014728:
  addiu $t1, $gp, 533
L8001472c:
  addiu $a1, $t1, -1
L80014730:
  lui $a2, 0x8001
L80014734:
  addiu $a2, $a2, 17044
L80014738:
  addiu $a3, $zero, -1
L8001473c:
  lhu $v0, 522($gp)
L80014740:
  lbu $v1, 56($s0)
L80014744:
  lbu $t0, 57($s0)
L80014748:
  ori $v0, $v0, 0x1000
L8001474c:
  sh $v0, 522($gp)
L80014750:
  sb $v1, 533($gp)
L80014754:
  jal 0x8007b1f4
L80014758:
  sb $t0, -1($t1)
L8001475c:
  blez $v0, L80014a4c
L80014760:
  sll $zero, $zero, 0x0
L80014764:
  lw $v0, 492($gp)
L80014768:
  j L80014a48
L8001476c:
  ori $v0, $v0, 0x400
L80014770:
  lw $a0, 36($s0)
L80014774:
  addiu $a1, $gp, 508
L80014778:
  jal 0x8007e600
L8001477c:
  sll $zero, $zero, 0x0
L80014780:
  addiu $a0, $zero, 74
L80014784:
  addiu $a1, $gp, 508
L80014788:
  addiu $a2, $zero, 27
L8001478c:
  lui $a3, 0x8001
L80014790:
  addiu $a3, $a3, 17160
L80014794:
  addiu $v0, $zero, -1
L80014798:
  jal 0x8007b468
L8001479c:
  sw $v0, 16($sp)
L800147a0:
  blez $v0, L80014a4c
L800147a4:
  sll $zero, $zero, 0x0
L800147a8:
  lw $v0, 492($gp)
L800147ac:
  j L80014a48
L800147b0:
  ori $v0, $v0, 0x400
L800147b4:
  addiu $v0, $zero, 6
L800147b8:
  sh $v0, 504($gp)
L800147bc:
  lhu $v0, 522($gp)
L800147c0:
  addiu $v1, $zero, 600
L800147c4:
  sh $v1, 484($gp)
L800147c8:
  andi $v0, $v0, 0xefff
L800147cc:
  sh $v0, 522($gp)
L800147d0:
  lhu $v0, 522($gp)
L800147d4:
  lw $v1, 488($gp)
L800147d8:
  ori $v0, $v0, 0x4000
L800147dc:
  sh $v0, 522($gp)
L800147e0:
  beq $v1, $zero, L800147f0
L800147e4:
  sll $zero, $zero, 0x0
L800147e8:
  jalr $ra, $v1
L800147ec:
  sll $zero, $zero, 0x0
L800147f0:
  lhu $v0, 484($gp)
L800147f4:
  sll $zero, $zero, 0x0
L800147f8:
  addiu $v0, $v0, -1
L800147fc:
  sh $v0, 484($gp)
L80014800:
  sll $v0, $v0, 0x10
L80014804:
  blez $v0, L80014824
L80014808:
  sll $zero, $zero, 0x0
L8001480c:
  lw $v0, 48($s0)
L80014810:
  lw $v1, 52($s0)
L80014814:
  sll $zero, $zero, 0x0
L80014818:
  slt $v0, $v0, $v1
L8001481c:
  bne $v0, $zero, L80014a4c
L80014820:
  sll $zero, $zero, 0x0
L80014824:
  lhu $v0, 522($gp)
L80014828:
  sll $zero, $zero, 0x0
L8001482c:
  andi $v0, $v0, 0x3ffc
L80014830:
  sh $v0, 522($gp)
L80014834:
  lhu $v0, 522($gp)
L80014838:
  lw $v1, 536($gp)
L8001483c:
  ori $v0, $v0, 0x2
L80014840:
  sh $v0, 522($gp)
L80014844:
  beq $v1, $zero, L80014a4c
L80014848:
  sll $zero, $zero, 0x0
L8001484c:
  jalr $ra, $v1
L80014850:
  sll $zero, $zero, 0x0
L80014854:
  j L80014a4c
L80014858:
  sll $zero, $zero, 0x0
L8001485c:
  lbu $v1, 70($s0)
L80014860:
  sll $zero, $zero, 0x0
L80014864:
  bne $v1, $v0, L800148e0
L80014868:
  sll $zero, $zero, 0x0
L8001486c:
  lbu $v1, 71($s0)
L80014870:
  sll $zero, $zero, 0x0
L80014874:
  beq $v1, $zero, L8001488c
L80014878:
  addiu $v0, $zero, 1
L8001487c:
  beq $v1, $v0, L800148c8
L80014880:
  sll $zero, $zero, 0x0
L80014884:
  j L80014a4c
L80014888:
  sll $zero, $zero, 0x0
L8001488c:
  jal 0x8007ddd4
L80014890:
  sll $zero, $zero, 0x0
L80014894:
  jal 0x8007e860
L80014898:
  addu $a0, $zero, $zero
L8001489c:
  addiu $a0, $zero, 9
L800148a0:
  addu $a1, $zero, $zero
L800148a4:
  lui $a2, 0x8001
L800148a8:
  addiu $a2, $a2, 16808
L800148ac:
  jal 0x8007b1f4
L800148b0:
  addiu $a3, $zero, -1
L800148b4:
  blez $v0, L80014a4c
L800148b8:
  sll $zero, $zero, 0x0
L800148bc:
  lw $v0, 492($gp)
L800148c0:
  j L80014a48
L800148c4:
  ori $v0, $v0, 0x400
L800148c8:
  jal 0x8007ddd4
L800148cc:
  sll $zero, $zero, 0x0
L800148d0:
  jal 0x8007e860
L800148d4:
  addu $a0, $zero, $zero
L800148d8:
  j L80014710
L800148dc:
  sll $zero, $zero, 0x0
L800148e0:
  lw $v0, 492($gp)
L800148e4:
  sll $zero, $zero, 0x0
L800148e8:
  andi $v0, $v0, 0x80
L800148ec:
  beq $v0, $zero, L80014910
L800148f0:
  sll $zero, $zero, 0x0
L800148f4:
  lw $v0, 492($gp)
L800148f8:
  sll $zero, $zero, 0x0
L800148fc:
  andi $v0, $v0, 0x100
L80014900:
  beq $v0, $zero, L80014710
L80014904:
  sll $zero, $zero, 0x0
L80014908:
  j L80014a4c
L8001490c:
  sll $zero, $zero, 0x0
L80014910:
  lw $a0, 36($s0)
L80014914:
  addiu $a1, $gp, 508
L80014918:
  jal 0x8007e600
L8001491c:
  sll $zero, $zero, 0x0
L80014920:
  lw $v0, 492($gp)
L80014924:
  lui $v1, 0x10
L80014928:
  and $v0, $v0, $v1
L8001492c:
  beq $v0, $zero, L80014974
L80014930:
  sll $zero, $zero, 0x0
L80014934:
  lw $v0, 492($gp)
L80014938:
  sll $zero, $zero, 0x0
L8001493c:
  bltz $v0, L80014710
L80014940:
  addiu $v0, $zero, -1
L80014944:
  sw $v0, 16($sp)
L80014948:
  addiu $a0, $zero, 160
L8001494c:
  addiu $a1, $gp, 508
L80014950:
  addiu $a2, $zero, 21
L80014954:
  lui $a3, 0x8001
L80014958:
  jal 0x8007b468
L8001495c:
  addiu $a3, $a3, 16692
L80014960:
  blez $v0, L80014a4c
L80014964:
  sll $zero, $zero, 0x0
L80014968:
  lw $v0, 492($gp)
L8001496c:
  j L80014a48
L80014970:
  ori $v0, $v0, 0x480
L80014974:
  lw $v0, 492($gp)
L80014978:
  lui $a0, 0x80
L8001497c:
  and $v0, $v0, $a0
L80014980:
  bne $v0, $zero, L800149c4
L80014984:
  sll $zero, $zero, 0x0
L80014988:
  lw $v0, 492($gp)
L8001498c:
  lw $v1, 32($s0)
L80014990:
  or $v0, $v0, $a0
L80014994:
  sw $v0, 492($gp)
L80014998:
  beq $v1, $zero, L800149b8
L8001499c:
  addu $a0, $s0, $zero
L800149a0:
  lw $v0, 64($s0)
L800149a4:
  sll $zero, $zero, 0x0
L800149a8:
  addu $a1, $v0, $zero
L800149ac:
  addiu $v0, $v0, 1
L800149b0:
  jalr $ra, $v1
L800149b4:
  sw $v0, 64($s0)
L800149b8:
  lw $v0, 28($s0)
L800149bc:
  j L80014a4c
L800149c0:
  sw $v0, 40($s0)
L800149c4:
  lw $v0, 492($gp)
L800149c8:
  lui $v1, 0x40
L800149cc:
  and $v0, $v0, $v1
L800149d0:
  beq $v0, $zero, L800149f8
L800149d4:
  sll $zero, $zero, 0x0
L800149d8:
  jal 0x80077240
L800149dc:
  addu $a0, $zero, $zero
L800149e0:
  beq $v0, $zero, L80014a4c
L800149e4:
  lui $v1, 0xffbf
L800149e8:
  lw $v0, 492($gp)
L800149ec:
  ori $v1, $v1, 0xffff
L800149f0:
  and $v0, $v0, $v1
L800149f4:
  sw $v0, 492($gp)
L800149f8:
  lw $v0, 492($gp)
L800149fc:
  sll $zero, $zero, 0x0
L80014a00:
  bltz $v0, L80014a3c
L80014a04:
  addiu $v0, $zero, -1
L80014a08:
  sw $v0, 16($sp)
L80014a0c:
  addiu $a0, $zero, 160
L80014a10:
  addiu $a1, $gp, 508
L80014a14:
  addiu $a2, $zero, 6
L80014a18:
  lui $a3, 0x8001
L80014a1c:
  jal 0x8007b468
L80014a20:
  addiu $a3, $a3, 16544
L80014a24:
  beq $v0, $zero, L80014a4c
L80014a28:
  sll $zero, $zero, 0x0
L80014a2c:
  lw $v0, 492($gp)
L80014a30:
  sll $zero, $zero, 0x0
L80014a34:
  ori $v0, $v0, 0x400
L80014a38:
  sw $v0, 492($gp)
L80014a3c:
  lw $v0, 492($gp)
L80014a40:
  sll $zero, $zero, 0x0
L80014a44:
  ori $v0, $v0, 0x180
L80014a48:
  sw $v0, 492($gp)
L80014a4c:
  lw $ra, 28($sp)
L80014a50:
  lw $s0, 24($sp)
L80014a54:
  jr $ra
L80014a58:
  addiu $sp, $sp, 32
L80014a5c:
  lhu $v0, 540($gp)
L80014a60:
  addiu $sp, $sp, -24
L80014a64:
  beq $v0, $zero, L80014a78
L80014a68:
  sw $ra, 16($sp)
L80014a6c:
  sh $zero, 540($gp)
L80014a70:
  j L80014b20
L80014a74:
  sll $zero, $zero, 0x0
L80014a78:
  addiu $v0, $zero, 1
L80014a7c:
  sh $v0, 540($gp)
L80014a80:
  lw $v0, 480($gp)
L80014a84:
  sll $zero, $zero, 0x0
L80014a88:
  bne $v0, $zero, L80014b20
L80014a8c:
  addiu $v0, $zero, 1
L80014a90:
  sw $v0, 480($gp)
L80014a94:
  lw $v0, 492($gp)
L80014a98:
  sll $zero, $zero, 0x0
L80014a9c:
  andi $v0, $v0, 0x10
L80014aa0:
  bne $v0, $zero, L80014ac4
L80014aa4:
  sll $zero, $zero, 0x0
L80014aa8:
  lw $v0, 492($gp)
L80014aac:
  sll $zero, $zero, 0x0
L80014ab0:
  andi $v0, $v0, 0x20
L80014ab4:
  beq $v0, $zero, L80014ac4
L80014ab8:
  sll $zero, $zero, 0x0
L80014abc:
  jal L800143dc
L80014ac0:
  sll $zero, $zero, 0x0
L80014ac4:
  lw $v0, 492($gp)
L80014ac8:
  sll $zero, $zero, 0x0
L80014acc:
  andi $v0, $v0, 0x10
L80014ad0:
  beq $v0, $zero, L80014b18
L80014ad4:
  sll $zero, $zero, 0x0
L80014ad8:
  lw $v1, 556($gp)
L80014adc:
  sll $zero, $zero, 0x0
L80014ae0:
  beq $v1, $zero, L80014b08
L80014ae4:
  andi $v0, $v1, 0x40
L80014ae8:
  bne $v0, $zero, L80014b08
L80014aec:
  ori $v0, $v1, 0x40
L80014af0:
  sw $v0, 556($gp)
L80014af4:
  lui $v0, 0x800f
L80014af8:
  addiu $v0, $v0, -24992
L80014afc:
  addiu $v1, $zero, 5
L80014b00:
  sb $v1, 70($v0)
L80014b04:
  sb $zero, 71($v0)
L80014b08:
  jal L8001455c
L80014b0c:
  sll $zero, $zero, 0x0
L80014b10:
  j L80014b1c
L80014b14:
  sll $zero, $zero, 0x0
L80014b18:
  sw $zero, 556($gp)
L80014b1c:
  sw $zero, 480($gp)
L80014b20:
  lw $ra, 16($sp)
L80014b24:
  sll $zero, $zero, 0x0
L80014b28:
  jr $ra
L80014b2c:
  addiu $sp, $sp, 24
L80014b30:
  addiu $sp, $sp, -24
L80014b34:
  sw $ra, 16($sp)
L80014b38:
  lui $v0, 0x801d
L80014b3c:
  addiu $a3, $v0, 16896
L80014b40:
  addiu $v0, $zero, 1
L80014b44:
  beq $a1, $v0, L80014bc4
L80014b48:
  addu $a2, $a0, $zero
L80014b4c:
  slti $v0, $a1, 2
L80014b50:
  beq $v0, $zero, L80014b68
L80014b54:
  sll $zero, $zero, 0x0
L80014b58:
  beq $a1, $zero, L80014b7c
L80014b5c:
  sll $zero, $zero, 0x0
L80014b60:
  j L80014c30
L80014b64:
  sll $zero, $zero, 0x0
L80014b68:
  addiu $v0, $zero, 2
L80014b6c:
  beq $a1, $v0, L80014c18
L80014b70:
  sll $zero, $zero, 0x0
L80014b74:
  j L80014c30
L80014b78:
  sll $zero, $zero, 0x0
L80014b7c:
  lw $v0, 20($a3)
L80014b80:
  sll $zero, $zero, 0x0
L80014b84:
  beq $v0, $zero, L80014bbc
L80014b88:
  addiu $v0, $zero, 3
L80014b8c:
  sb $v0, 70($a2)
L80014b90:
  lw $v0, 528($gp)
L80014b94:
  sll $zero, $zero, 0x0
L80014b98:
  sw $v0, 8($a2)
L80014b9c:
  addiu $v0, $v0, 2048
L80014ba0:
  sw $v0, 12($a2)
L80014ba4:
  lw $v0, 12($a3)
L80014ba8:
  sll $zero, $zero, 0x0
L80014bac:
  sw $v0, 48($a2)
L80014bb0:
  lw $v0, 20($a3)
L80014bb4:
  j L80014c04
L80014bb8:
  sw $v0, 28($a2)
L80014bbc:
  addiu $v0, $zero, 2
L80014bc0:
  sw $v0, 64($a2)
L80014bc4:
  lw $v0, 24($a3)
L80014bc8:
  sll $zero, $zero, 0x0
L80014bcc:
  beq $v0, $zero, L80014c18
L80014bd0:
  lui $a0, 0xffdc
L80014bd4:
  ori $a0, $a0, 0xffff
L80014bd8:
  lw $v0, 492($gp)
L80014bdc:
  lw $v1, 16($a3)
L80014be0:
  and $v0, $v0, $a0
L80014be4:
  sw $v0, 492($gp)
L80014be8:
  addiu $v0, $zero, 1
L80014bec:
  sw $v1, 12($a2)
L80014bf0:
  sw $v1, 8($a2)
L80014bf4:
  sb $v0, 70($a2)
L80014bf8:
  lw $v0, 24($a3)
L80014bfc:
  sll $zero, $zero, 0x0
L80014c00:
  sw $v0, 28($a2)
L80014c04:
  bgez $v0, L80014c30
L80014c08:
  sll $v0, $v0, 0xb
L80014c0c:
  subu $v0, $zero, $v0
L80014c10:
  j L80014c30
L80014c14:
  sw $v0, 28($a2)
L80014c18:
  lw $v0, 544($gp)
L80014c1c:
  sll $zero, $zero, 0x0
L80014c20:
  beq $v0, $zero, L80014c30
L80014c24:
  sll $zero, $zero, 0x0
L80014c28:
  jalr $ra, $v0
L80014c2c:
  sll $zero, $zero, 0x0
L80014c30:
  lw $ra, 16($sp)
L80014c34:
  sll $zero, $zero, 0x0
L80014c38:
  jr $ra
L80014c3c:
  addiu $sp, $sp, 24
L80014c40:
  addiu $sp, $sp, -64
L80014c44:
  sw $s1, 36($sp)
L80014c48:
  addu $s1, $a0, $zero
L80014c4c:
  sw $s6, 56($sp)
L80014c50:
  addu $s6, $a1, $zero
L80014c54:
  sw $ra, 60($sp)
L80014c58:
  sw $s5, 52($sp)
L80014c5c:
  sw $s4, 48($sp)
L80014c60:
  sw $s3, 44($sp)
L80014c64:
  sw $s2, 40($sp)
L80014c68:
  bne $s1, $zero, L80014c7c
L80014c6c:
  sw $s0, 32($sp)
L80014c70:
  lw $v0, 492($gp)
L80014c74:
  j L80014df4
L80014c78:
  andi $v0, $v0, 0x20
L80014c7c:
  lw $a1, 20($s1)
L80014c80:
  lw $a0, 24($s1)
L80014c84:
  lh $v1, 28($s1)
L80014c88:
  or $v0, $a1, $a0
L80014c8c:
  or $v0, $v0, $v1
L80014c90:
  bne $v0, $zero, L80014cb0
L80014c94:
  sll $zero, $zero, 0x0
L80014c98:
  lw $a0, 0($s1)
L80014c9c:
  lw $a1, 4($s1)
L80014ca0:
  jal L80013a94
L80014ca4:
  sll $zero, $zero, 0x0
L80014ca8:
  j L80014df4
L80014cac:
  sll $zero, $zero, 0x0
L80014cb0:
  beq $v1, $zero, L80014d0c
L80014cb4:
  sll $zero, $zero, 0x0
L80014cb8:
  bgez $v1, L80014ce8
L80014cbc:
  lui $v0, 0x800f
L80014cc0:
  lhu $v0, 522($gp)
L80014cc4:
  sll $zero, $zero, 0x0
L80014cc8:
  andi $v0, $v0, 0x3ffc
L80014ccc:
  sh $v0, 522($gp)
L80014cd0:
  lhu $v1, 522($gp)
L80014cd4:
  addiu $v0, $zero, 1
L80014cd8:
  ori $v1, $v1, 0x2
L80014cdc:
  sh $v1, 522($gp)
L80014ce0:
  j L80014df4
L80014ce4:
  sll $zero, $zero, 0x0
L80014ce8:
  lbu $a2, 31($s1)
L80014cec:
  lw $a0, -24896($v0)
L80014cf0:
  lw $v0, 4($s1)
L80014cf4:
  lbu $a3, 30($s1)
L80014cf8:
  addu $a0, $a0, $v0
L80014cfc:
  jal L80013b68
L80014d00:
  addu $a1, $a0, $v1
L80014d04:
  j L80014df4
L80014d08:
  sll $zero, $zero, 0x0
L80014d0c:
  addu $a1, $a1, $a0
L80014d10:
  beq $a1, $zero, L80014df4
L80014d14:
  addu $v0, $zero, $zero
L80014d18:
  lui $v0, 0x801d
L80014d1c:
  addiu $v0, $v0, 16896
L80014d20:
  addiu $v1, $zero, -33
L80014d24:
  lw $a0, 0($s1)
L80014d28:
  subu $s4, $zero, $a1
L80014d2c:
  lw $t0, 0($s1)
L80014d30:
  lw $t1, 4($s1)
L80014d34:
  lw $t2, 8($s1)
L80014d38:
  lw $t3, 12($s1)
L80014d3c:
  sw $t0, 32($v0)
L80014d40:
  sw $t1, 36($v0)
L80014d44:
  sw $t2, 40($v0)
L80014d48:
  sw $t3, 44($v0)
L80014d4c:
  lw $t0, 16($s1)
L80014d50:
  lw $t1, 20($s1)
L80014d54:
  lw $t2, 24($s1)
L80014d58:
  lw $t3, 28($s1)
L80014d5c:
  sw $t0, 48($v0)
L80014d60:
  sw $t1, 52($v0)
L80014d64:
  sw $t2, 56($v0)
L80014d68:
  sw $t3, 60($v0)
L80014d6c:
  lw $v0, 492($gp)
L80014d70:
  lw $s2, 4($s1)
L80014d74:
  and $v0, $v0, $v1
L80014d78:
  sw $v0, 492($gp)
L80014d7c:
  lui $v0, 0x140
L80014d80:
  or $s3, $a0, $v0
L80014d84:
  lui $v1, 0x8001
L80014d88:
  lw $v0, 492($gp)
L80014d8c:
  sll $zero, $zero, 0x0
L80014d90:
  andi $v0, $v0, 0x10
L80014d94:
  beq $v0, $zero, L80014db8
L80014d98:
  addiu $s5, $v1, 19248
L80014d9c:
  lw $v0, 492($gp)
L80014da0:
  lui $v1, 0x8
L80014da4:
  and $v0, $v0, $v1
L80014da8:
  beq $v0, $zero, L80014dbc
L80014dac:
  lui $s0, 0x800f
L80014db0:
  jal L80015010
L80014db4:
  sll $zero, $zero, 0x0
L80014db8:
  lui $s0, 0x800f
L80014dbc:
  addiu $s0, $s0, -25064
L80014dc0:
  addu $a0, $s0, $zero
L80014dc4:
  addu $a1, $s3, $zero
L80014dc8:
  addu $a2, $s6, $zero
L80014dcc:
  addu $a3, $s2, $zero
L80014dd0:
  sw $s4, 16($sp)
L80014dd4:
  sw $s5, 20($sp)
L80014dd8:
  sw $zero, 24($sp)
L80014ddc:
  jal L80013998
L80014de0:
  sw $s1, 28($sp)
L80014de4:
  lw $v1, 492($gp)
L80014de8:
  addu $v0, $s0, $zero
L80014dec:
  ori $v1, $v1, 0x20
L80014df0:
  sw $v1, 492($gp)
L80014df4:
  lw $ra, 60($sp)
L80014df8:
  lw $s6, 56($sp)
L80014dfc:
  lw $s5, 52($sp)
L80014e00:
  lw $s4, 48($sp)
L80014e04:
  lw $s3, 44($sp)
L80014e08:
  lw $s2, 40($sp)
L80014e0c:
  lw $s1, 36($sp)
L80014e10:
  lw $s0, 32($sp)
L80014e14:
  jr $ra
L80014e18:
  addiu $sp, $sp, 64
L80014e1c:
  lw $v0, 492($gp)
L80014e20:
  lw $v1, 516($gp)
L80014e24:
  addiu $sp, $sp, -56
L80014e28:
  sw $s1, 36($sp)
L80014e2c:
  addu $s1, $a0, $zero
L80014e30:
  sw $s2, 40($sp)
L80014e34:
  addu $s2, $a1, $zero
L80014e38:
  sw $s3, 44($sp)
L80014e3c:
  addu $s3, $a2, $zero
L80014e40:
  sw $s0, 32($sp)
L80014e44:
  sw $ra, 48($sp)
L80014e48:
  ori $v0, $v0, 0x40
L80014e4c:
  sw $v0, 492($gp)
L80014e50:
  bne $v1, $zero, L80014e80
L80014e54:
  addu $s0, $a3, $zero
L80014e58:
  lui $v0, 0x200
L80014e5c:
  ori $v0, $v0, 0x30
L80014e60:
  lw $v1, 492($gp)
L80014e64:
  lw $a0, 556($gp)
L80014e68:
  and $v1, $v1, $v0
L80014e6c:
  or $v1, $v1, $a0
L80014e70:
  beq $v1, $zero, L80014e88
L80014e74:
  addu $v0, $zero, $zero
L80014e78:
  j L80014ec4
L80014e7c:
  sll $zero, $zero, 0x0
L80014e80:
  jalr $ra, $v1
L80014e84:
  sll $zero, $zero, 0x0
L80014e88:
  sw $s0, 16($sp)
L80014e8c:
  lui $s0, 0x800f
L80014e90:
  addiu $s0, $s0, -24992
L80014e94:
  addu $a0, $s0, $zero
L80014e98:
  lw $v0, 72($sp)
L80014e9c:
  addu $a1, $s1, $zero
L80014ea0:
  sw $v0, 20($sp)
L80014ea4:
  lw $v0, 76($sp)
L80014ea8:
  addu $a2, $s2, $zero
L80014eac:
  sw $v0, 24($sp)
L80014eb0:
  lw $v0, 80($sp)
L80014eb4:
  addu $a3, $s3, $zero
L80014eb8:
  jal L80013998
L80014ebc:
  sw $v0, 28($sp)
L80014ec0:
  addu $v0, $s0, $zero
L80014ec4:
  lw $v1, 44($v0)
L80014ec8:
  lw $ra, 48($sp)
L80014ecc:
  lw $s3, 44($sp)
L80014ed0:
  lw $s2, 40($sp)
L80014ed4:
  lw $s1, 36($sp)
L80014ed8:
  lw $s0, 32($sp)
L80014edc:
  ori $v1, $v1, 0x10
L80014ee0:
  sw $v1, 492($gp)
L80014ee4:
  jr $ra
L80014ee8:
  addiu $sp, $sp, 56
L80014eec:
  lw $v0, 516($gp)
L80014ef0:
  addiu $sp, $sp, -56
L80014ef4:
  sw $s1, 36($sp)
L80014ef8:
  addu $s1, $a0, $zero
L80014efc:
  sw $s2, 40($sp)
L80014f00:
  addu $s2, $a1, $zero
L80014f04:
  sw $s3, 44($sp)
L80014f08:
  addu $s3, $a2, $zero
L80014f0c:
  sw $s0, 32($sp)
L80014f10:
  addu $s0, $a3, $zero
L80014f14:
  bne $v0, $zero, L80014f44
L80014f18:
  sw $ra, 48($sp)
L80014f1c:
  lui $v0, 0x200
L80014f20:
  ori $v0, $v0, 0x30
L80014f24:
  lw $v1, 492($gp)
L80014f28:
  lw $a0, 556($gp)
L80014f2c:
  and $v1, $v1, $v0
L80014f30:
  or $v1, $v1, $a0
L80014f34:
  beq $v1, $zero, L80014f4c
L80014f38:
  addu $v0, $zero, $zero
L80014f3c:
  j L80014f88
L80014f40:
  sll $zero, $zero, 0x0
L80014f44:
  jalr $ra, $v0
L80014f48:
  sll $zero, $zero, 0x0
L80014f4c:
  sw $s0, 16($sp)
L80014f50:
  lui $s0, 0x800f
L80014f54:
  addiu $s0, $s0, -24992
L80014f58:
  addu $a0, $s0, $zero
L80014f5c:
  lw $v0, 72($sp)
L80014f60:
  addu $a1, $s1, $zero
L80014f64:
  sw $v0, 20($sp)
L80014f68:
  lw $v0, 76($sp)
L80014f6c:
  addu $a2, $s2, $zero
L80014f70:
  sw $v0, 24($sp)
L80014f74:
  lw $v0, 80($sp)
L80014f78:
  addu $a3, $s3, $zero
L80014f7c:
  jal L80013998
L80014f80:
  sw $v0, 28($sp)
L80014f84:
  addu $v0, $s0, $zero
L80014f88:
  lw $ra, 48($sp)
L80014f8c:
  lw $s3, 44($sp)
L80014f90:
  lw $s2, 40($sp)
L80014f94:
  lw $s1, 36($sp)
L80014f98:
  lw $s0, 32($sp)
L80014f9c:
  jr $ra
L80014fa0:
  addiu $sp, $sp, 56
L80014fa4:
  addiu $sp, $sp, -24
L80014fa8:
  lui $v0, 0x200
L80014fac:
  lw $v1, 492($gp)
L80014fb0:
  lw $a0, 556($gp)
L80014fb4:
  ori $v0, $v0, 0x30
L80014fb8:
  and $v1, $v1, $v0
L80014fbc:
  or $v1, $v1, $a0
L80014fc0:
  beq $v1, $zero, L80015000
L80014fc4:
  sw $ra, 16($sp)
L80014fc8:
  lw $v0, 492($gp)
L80014fcc:
  sll $zero, $zero, 0x0
L80014fd0:
  andi $v0, $v0, 0x10
L80014fd4:
  beq $v0, $zero, L80014ffc
L80014fd8:
  addiu $v0, $zero, 128
L80014fdc:
  lw $v0, 492($gp)
L80014fe0:
  lui $v1, 0x8
L80014fe4:
  and $v0, $v0, $v1
L80014fe8:
  beq $v0, $zero, L80014ffc
L80014fec:
  addiu $v0, $zero, 128
L80014ff0:
  jal L80015010
L80014ff4:
  sll $zero, $zero, 0x0
L80014ff8:
  addiu $v0, $zero, 128
L80014ffc:
  sw $v0, 556($gp)
L80015000:
  lw $ra, 16($sp)
L80015004:
  sll $zero, $zero, 0x0
L80015008:
  jr $ra
L8001500c:
  addiu $sp, $sp, 24
L80015010:
  lhu $v0, 522($gp)
L80015014:
  sll $zero, $zero, 0x0
L80015018:
  andi $v0, $v0, 0x3ffc
L8001501c:
  sh $v0, 522($gp)
L80015020:
  lhu $v0, 522($gp)
L80015024:
  sll $zero, $zero, 0x0
L80015028:
  ori $v0, $v0, 0x2
L8001502c:
  sh $v0, 522($gp)
L80015030:
  jr $ra
L80015034:
  sll $zero, $zero, 0x0
L80015038:
  lw $v0, 492($gp)
L8001503c:
  addiu $sp, $sp, -24
L80015040:
  andi $v0, $v0, 0x10
L80015044:
  beq $v0, $zero, L80015068
L80015048:
  sw $ra, 16($sp)
L8001504c:
  lw $v0, 492($gp)
L80015050:
  lui $v1, 0x8
L80015054:
  and $v0, $v0, $v1
L80015058:
  beq $v0, $zero, L80015068
L8001505c:
  sll $zero, $zero, 0x0
L80015060:
  jal L80015010
L80015064:
  sll $zero, $zero, 0x0
L80015068:
  lw $ra, 16($sp)
L8001506c:
  sll $zero, $zero, 0x0
L80015070:
  jr $ra
L80015074:
  addiu $sp, $sp, 24
