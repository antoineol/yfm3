.set noreorder
.set noat

.section .text.boot_gte_helpers,"ax",@progbits
.align 2
.global boot_gte_helpers

boot_gte_helpers:
L80015d18:
  addiu $sp, $sp, -24
L80015d1c:
  sw $s0, 16($sp)
L80015d20:
  addu $s0, $a0, $zero
L80015d24:
  sw $ra, 20($sp)
L80015d28:
  jal 0x800878d0
L80015d2c:
  addiu $a0, $zero, 300
L80015d30:
  addiu $a0, $zero, 160
L80015d34:
  jal 0x800878b0
L80015d38:
  addiu $a1, $zero, 108
L80015d3c:
  lui $a0, 0x8010
L80015d40:
  jal 0x800855d0
L80015d44:
  addiu $a0, $a0, -7864
L80015d48:
  lui $v1, 0x1f80
L80015d4c:
  lhu $v0, 40($s0)
L80015d50:
  ori $v1, $v1, 0x3e0
L80015d54:
  sh $zero, 2($v1)
L80015d58:
  sh $v0, 0($v1)
L80015d5c:
  lhu $v0, 42($s0)
L80015d60:
  sll $zero, $zero, 0x0
L80015d64:
  sh $v0, 4($v1)
L80015d68:
  .word 0xc8600000
L80015d6c:
  .word 0xc8610004
L80015d70:
  sll $zero, $zero, 0x0
L80015d74:
  sll $zero, $zero, 0x0
L80015d78:
  .word 0x4a180001
L80015d7c:
  addiu $v0, $s0, 48
L80015d80:
  .word 0xe84e0000
L80015d84:
  addu $a0, $zero, $zero
L80015d88:
  addu $a1, $a0, $zero
L80015d8c:
  lhu $v0, 48($s0)
L80015d90:
  lhu $v1, 50($s0)
L80015d94:
  addiu $v0, $v0, -32
L80015d98:
  addiu $v1, $v1, -30
L80015d9c:
  sh $v0, 48($s0)
L80015da0:
  jal 0x800878b0
L80015da4:
  sh $v1, 50($s0)
L80015da8:
  lw $ra, 20($sp)
L80015dac:
  lw $s0, 16($sp)
L80015db0:
  jr $ra
L80015db4:
  addiu $sp, $sp, 24
L80015db8:
  addiu $sp, $sp, -24
L80015dbc:
  sw $ra, 16($sp)
L80015dc0:
  lbu $v1, 106($a0)
L80015dc4:
  sll $zero, $zero, 0x0
L80015dc8:
  sll $v0, $v1, 0x3
L80015dcc:
  subu $v0, $v0, $v1
L80015dd0:
  sll $v0, $v0, 0x4
L80015dd4:
  lui $v1, 0x800f
L80015dd8:
  addiu $v1, $v1, -440
L80015ddc:
  addu $v0, $v0, $v1
L80015de0:
  lw $v0, 40($v0)
L80015de4:
  jal L80015d18
L80015de8:
  sw $v0, 40($a0)
L80015dec:
  lw $ra, 16($sp)
L80015df0:
  sll $zero, $zero, 0x0
L80015df4:
  jr $ra
L80015df8:
  addiu $sp, $sp, 24
L80015dfc:
  addiu $sp, $sp, -32
L80015e00:
  sw $s0, 24($sp)
L80015e04:
  addu $s0, $a0, $zero
L80015e08:
  lui $a0, 0x8010
L80015e0c:
  sw $ra, 28($sp)
L80015e10:
  jal 0x800855d0
L80015e14:
  addiu $a0, $a0, -7864
L80015e18:
  lw $v0, 0($s0)
L80015e1c:
  lui $v1, 0x1f80
L80015e20:
  lhu $v0, 48($v0)
L80015e24:
  ori $v1, $v1, 0x3e0
L80015e28:
  sh $zero, 2($v1)
L80015e2c:
  sh $v0, 0($v1)
L80015e30:
  lw $v0, 0($s0)
L80015e34:
  sll $zero, $zero, 0x0
L80015e38:
  lhu $v0, 52($v0)
L80015e3c:
  sll $zero, $zero, 0x0
L80015e40:
  sh $v0, 4($v1)
L80015e44:
  .word 0xc8600000
L80015e48:
  .word 0xc8610004
L80015e4c:
  sll $zero, $zero, 0x0
L80015e50:
  sll $zero, $zero, 0x0
L80015e54:
  .word 0x4a180001
L80015e58:
  addiu $v0, $sp, 16
L80015e5c:
  .word 0xe84e0000
L80015e60:
  lhu $v0, 16($sp)
L80015e64:
  sll $zero, $zero, 0x0
L80015e68:
  addiu $v0, $v0, -26
L80015e6c:
  sh $v0, 8($s0)
L80015e70:
  lh $a0, 18($sp)
L80015e74:
  lbu $v1, 717($gp)
L80015e78:
  addiu $v0, $a0, -30
L80015e7c:
  beq $v1, $zero, L80015ea0
L80015e80:
  sh $v0, 10($s0)
L80015e84:
  lb $v0, 24($s0)
L80015e88:
  sll $zero, $zero, 0x0
L80015e8c:
  slti $v0, $v0, 15
L80015e90:
  beq $v0, $zero, L80015ebc
L80015e94:
  addiu $v0, $a0, -29
L80015e98:
  j L80015ebc
L80015e9c:
  sh $v0, 10($s0)
L80015ea0:
  lb $v0, 24($s0)
L80015ea4:
  sll $zero, $zero, 0x0
L80015ea8:
  slti $v0, $v0, 15
L80015eac:
  bne $v0, $zero, L80015ec0
L80015eb0:
  lui $v0, 0x800f
L80015eb4:
  addiu $v0, $a0, -29
L80015eb8:
  sh $v0, 10($s0)
L80015ebc:
  lui $v0, 0x800f
L80015ec0:
  lw $a0, 0($s0)
L80015ec4:
  lw $a1, -25192($v0)
L80015ec8:
  lh $a2, 8($s0)
L80015ecc:
  lh $a3, 10($s0)
L80015ed0:
  jal 0x80016784
L80015ed4:
  sll $zero, $zero, 0x0
L80015ed8:
  addiu $a0, $zero, 160
L80015edc:
  jal 0x800878b0
L80015ee0:
  addiu $a1, $zero, 108
L80015ee4:
  lw $ra, 28($sp)
L80015ee8:
  lw $s0, 24($sp)
L80015eec:
  jr $ra
L80015ef0:
  addiu $sp, $sp, 32
L80015ef4:
  addiu $sp, $sp, -72
L80015ef8:
  sw $s1, 36($sp)
L80015efc:
  addu $s1, $a1, $zero
L80015f00:
  sw $ra, 68($sp)
L80015f04:
  sw $fp, 64($sp)
L80015f08:
  sw $s7, 60($sp)
L80015f0c:
  sw $s6, 56($sp)
L80015f10:
  sw $s5, 52($sp)
L80015f14:
  sw $s4, 48($sp)
L80015f18:
  sw $s3, 44($sp)
L80015f1c:
  sw $s2, 40($sp)
L80015f20:
  sw $s0, 32($sp)
L80015f24:
  lw $s0, 0($a0)
L80015f28:
  addu $s5, $a2, $zero
L80015f2c:
  lhu $v0, 8($s0)
L80015f30:
  sll $zero, $zero, 0x0
L80015f34:
  andi $v0, $v0, 0x40
L80015f38:
  beq $v0, $zero, L800164cc
L80015f3c:
  addu $s7, $a3, $zero
L80015f40:
  lui $a1, 0x1f80
L80015f44:
  ori $a1, $a1, 0x2c0
L80015f48:
  lui $s3, 0x1f80
L80015f4c:
  ori $s3, $s3, 0x300
L80015f50:
  lui $s4, 0x1f80
L80015f54:
  addu $v1, $s4, $zero
L80015f58:
  ori $v1, $v1, 0x380
L80015f5c:
  addiu $v0, $zero, 4096
L80015f60:
  sh $zero, 0($v1)
L80015f64:
  sh $v0, 2($v1)
L80015f68:
  sh $zero, 4($v1)
L80015f6c:
  lw $v0, 12($s0)
L80015f70:
  addu $s6, $s4, $zero
L80015f74:
  sw $v0, 0($s7)
L80015f78:
  lbu $v0, 32($s0)
L80015f7c:
  ori $s6, $s6, 0x3a0
L80015f80:
  sll $v0, $v0, 0x4
L80015f84:
  sh $v0, 0($s6)
L80015f88:
  lbu $v0, 33($s0)
L80015f8c:
  ori $s4, $s4, 0x320
L80015f90:
  sll $v1, $v0, 0x4
L80015f94:
  sh $v1, 2($s6)
L80015f98:
  lbu $v0, 34($s0)
L80015f9c:
  lui $s2, 0x1f80
L80015fa0:
  sll $v0, $v0, 0x4
L80015fa4:
  sh $v0, 4($s6)
L80015fa8:
  lb $v0, 24($a0)
L80015fac:
  sll $zero, $zero, 0x0
L80015fb0:
  slti $v0, $v0, 15
L80015fb4:
  bne $v0, $zero, L80015fc4
L80015fb8:
  ori $s2, $s2, 0x3e0
L80015fbc:
  addiu $v0, $v1, 2048
L80015fc0:
  sh $v0, 2($s6)
L80015fc4:
  lh $v0, 48($s0)
L80015fc8:
  sll $zero, $zero, 0x0
L80015fcc:
  sw $v0, 20($a1)
L80015fd0:
  lh $v0, 50($s0)
L80015fd4:
  sll $zero, $zero, 0x0
L80015fd8:
  sw $v0, 24($a1)
L80015fdc:
  lh $v1, 52($s0)
L80015fe0:
  addiu $v0, $v0, 255
L80015fe4:
  bgez $v0, L80015ff0
L80015fe8:
  sw $v1, 28($a1)
L80015fec:
  addu $v0, $zero, $zero
L80015ff0:
  lui $a0, 0x1f80
L80015ff4:
  ori $a0, $a0, 0x3a0
L80015ff8:
  lui $a1, 0x1f80
L80015ffc:
  ori $a1, $a1, 0x2c0
L80016000:
  sb $v0, 6($s5)
L80016004:
  sb $v0, 5($s5)
L80016008:
  jal 0x80088c50
L8001600c:
  sb $v0, 4($s5)
L80016010:
  addu $v0, $zero, $zero
L80016014:
  bne $v0, $zero, L80016044
L80016018:
  lui $a1, 0x1f80
L8001601c:
  lui $a0, 0x1f80
L80016020:
  ori $a0, $a0, 0x2c0
L80016024:
  lh $v0, 68($s0)
L80016028:
  addiu $v1, $zero, 4096
L8001602c:
  sw $v1, 4($s4)
L80016030:
  sw $v0, 0($s4)
L80016034:
  lh $v0, 70($s0)
L80016038:
  ori $a1, $a1, 0x320
L8001603c:
  jal 0x80087670
L80016040:
  sw $v0, 8($s4)
L80016044:
  lui $a2, 0x1f80
L80016048:
  ori $a2, $a2, 0x310
L8001604c:
  lui $v1, 0x1f80
L80016050:
  ori $v1, $v1, 0x318
L80016054:
  lui $a1, 0x1f80
L80016058:
  ori $a1, $a1, 0x308
L8001605c:
  lui $a0, 0x1f80
L80016060:
  ori $a0, $a0, 0x2c0
L80016064:
  addiu $v0, $zero, -25
L80016068:
  sh $v0, 0($a2)
L8001606c:
  sh $v0, 0($s3)
L80016070:
  addiu $v0, $zero, 26
L80016074:
  sh $v0, 0($v1)
L80016078:
  sh $v0, 8($s3)
L8001607c:
  addiu $v0, $zero, 29
L80016080:
  sh $v0, 4($a1)
L80016084:
  sh $v0, 4($s3)
L80016088:
  addiu $v0, $zero, -30
L8001608c:
  sh $v0, 4($v1)
L80016090:
  sh $v0, 20($s3)
L80016094:
  sh $zero, 2($v1)
L80016098:
  sh $zero, 2($a2)
L8001609c:
  sh $zero, 2($a1)
L800160a0:
  jal 0x800855d0
L800160a4:
  sh $zero, 2($s3)
L800160a8:
  lui $a0, 0x1f80
L800160ac:
  ori $a0, $a0, 0x300
L800160b0:
  lui $a1, 0x1f80
L800160b4:
  ori $a1, $a1, 0x3a0
L800160b8:
  lui $a2, 0x1f80
L800160bc:
  jal 0x80089cc0
L800160c0:
  ori $a2, $a2, 0x3e0
L800160c4:
  lui $a0, 0x1f80
L800160c8:
  ori $a0, $a0, 0x308
L800160cc:
  lui $a1, 0x1f80
L800160d0:
  ori $a1, $a1, 0x3a8
L800160d4:
  lui $a2, 0x1f80
L800160d8:
  jal 0x80089cc0
L800160dc:
  ori $a2, $a2, 0x3e0
L800160e0:
  lui $a0, 0x1f80
L800160e4:
  ori $a0, $a0, 0x310
L800160e8:
  lui $a1, 0x1f80
L800160ec:
  ori $a1, $a1, 0x3b0
L800160f0:
  lui $a2, 0x1f80
L800160f4:
  jal 0x80089cc0
L800160f8:
  ori $a2, $a2, 0x3e0
L800160fc:
  lui $a0, 0x1f80
L80016100:
  ori $a0, $a0, 0x318
L80016104:
  lui $a1, 0x1f80
L80016108:
  ori $a1, $a1, 0x3b8
L8001610c:
  lui $a2, 0x1f80
L80016110:
  jal 0x80089cc0
L80016114:
  ori $a2, $a2, 0x3e0
L80016118:
  lui $fp, 0x1f80
L8001611c:
  ori $fp, $fp, 0x3c8
L80016120:
  lui $s4, 0x1f80
L80016124:
  ori $s4, $s4, 0x3d0
L80016128:
  lui $s3, 0x1f80
L8001612c:
  ori $s3, $s3, 0x3d8
L80016130:
  lui $a0, 0x1f80
L80016134:
  lui $t3, 0x1f80
L80016138:
  ori $t3, $t3, 0x3c0
L8001613c:
  lwl $t0, 3($s6)
L80016140:
  lwr $t0, 0($s6)
L80016144:
  lwl $t1, 7($s6)
L80016148:
  lwr $t1, 4($s6)
L8001614c:
  swl $t0, 3($t3)
L80016150:
  swr $t0, 0($t3)
L80016154:
  swl $t1, 7($t3)
L80016158:
  swr $t1, 4($t3)
L8001615c:
  lui $t3, 0x1f80
L80016160:
  ori $t3, $t3, 0x3a8
L80016164:
  lwl $t0, 3($t3)
L80016168:
  lwr $t0, 0($t3)
L8001616c:
  lwl $t1, 7($t3)
L80016170:
  lwr $t1, 4($t3)
L80016174:
  swl $t0, 3($fp)
L80016178:
  swr $t0, 0($fp)
L8001617c:
  swl $t1, 7($fp)
L80016180:
  swr $t1, 4($fp)
L80016184:
  lui $t3, 0x1f80
L80016188:
  ori $t3, $t3, 0x3b0
L8001618c:
  lwl $t0, 3($t3)
L80016190:
  lwr $t0, 0($t3)
L80016194:
  lwl $t1, 7($t3)
L80016198:
  lwr $t1, 4($t3)
L8001619c:
  swl $t0, 3($s4)
L800161a0:
  swr $t0, 0($s4)
L800161a4:
  swl $t1, 7($s4)
L800161a8:
  swr $t1, 4($s4)
L800161ac:
  lui $t3, 0x1f80
L800161b0:
  ori $t3, $t3, 0x3b8
L800161b4:
  lwl $t0, 3($t3)
L800161b8:
  lwr $t0, 0($t3)
L800161bc:
  lwl $t1, 7($t3)
L800161c0:
  lwr $t1, 4($t3)
L800161c4:
  swl $t0, 3($s3)
L800161c8:
  swr $t0, 0($s3)
L800161cc:
  swl $t1, 7($s3)
L800161d0:
  swr $t1, 4($s3)
L800161d4:
  jal 0x80085600
L800161d8:
  ori $a0, $a0, 0x2c0
L800161dc:
  lui $a0, 0x8010
L800161e0:
  jal 0x800855d0
L800161e4:
  addiu $a0, $a0, -7864
L800161e8:
  lui $a0, 0x1f80
L800161ec:
  ori $a0, $a0, 0x3a0
L800161f0:
  lui $a1, 0x1f80
L800161f4:
  ori $a1, $a1, 0x380
L800161f8:
  addu $a2, $s7, $zero
L800161fc:
  addiu $a3, $s1, 8
L80016200:
  addiu $v0, $s1, 4
L80016204:
  sw $v0, 16($sp)
L80016208:
  jal 0x80087c70
L8001620c:
  sw $s2, 20($sp)
L80016210:
  lui $v1, 0x1f80
L80016214:
  ori $v1, $v1, 0x3e4
L80016218:
  lui $a0, 0x1f80
L8001621c:
  ori $a0, $a0, 0x3a8
L80016220:
  lui $a1, 0x1f80
L80016224:
  ori $a1, $a1, 0x380
L80016228:
  addu $a2, $s7, $zero
L8001622c:
  addiu $a3, $s1, 20
L80016230:
  sw $v0, 16($s2)
L80016234:
  addiu $v0, $s1, 16
L80016238:
  sw $v0, 16($sp)
L8001623c:
  jal 0x80087c70
L80016240:
  sw $v1, 20($sp)
L80016244:
  lui $v1, 0x1f80
L80016248:
  ori $v1, $v1, 0x3e8
L8001624c:
  lui $a0, 0x1f80
L80016250:
  ori $a0, $a0, 0x3b0
L80016254:
  lui $a1, 0x1f80
L80016258:
  ori $a1, $a1, 0x380
L8001625c:
  addu $a2, $s7, $zero
L80016260:
  addiu $a3, $s1, 32
L80016264:
  sw $v0, 20($s2)
L80016268:
  addiu $v0, $s1, 28
L8001626c:
  sw $v0, 16($sp)
L80016270:
  jal 0x80087c70
L80016274:
  sw $v1, 20($sp)
L80016278:
  lui $v1, 0x1f80
L8001627c:
  ori $v1, $v1, 0x3ec
L80016280:
  lui $a0, 0x1f80
L80016284:
  ori $a0, $a0, 0x3b8
L80016288:
  lui $a1, 0x1f80
L8001628c:
  ori $a1, $a1, 0x380
L80016290:
  addu $a2, $s7, $zero
L80016294:
  addiu $a3, $s1, 44
L80016298:
  sw $v0, 24($s2)
L8001629c:
  addiu $v0, $s1, 40
L800162a0:
  sw $v0, 16($sp)
L800162a4:
  jal 0x80087c70
L800162a8:
  sw $v1, 20($sp)
L800162ac:
  lw $v1, 0($s2)
L800162b0:
  lw $a0, 4($s2)
L800162b4:
  sw $v0, 28($s2)
L800162b8:
  lw $v0, 8($s2)
L800162bc:
  or $v1, $v1, $a0
L800162c0:
  lw $a0, 12($s2)
L800162c4:
  or $v1, $v1, $v0
L800162c8:
  or $v1, $v1, $a0
L800162cc:
  bltz $v1, L800164cc
L800162d0:
  sll $zero, $zero, 0x0
L800162d4:
  lbu $v0, 92($s0)
L800162d8:
  lw $a0, 8($s1)
L800162dc:
  lw $a1, 20($s1)
L800162e0:
  lw $a2, 32($s1)
L800162e4:
  sb $v0, 36($s1)
L800162e8:
  sb $v0, 12($s1)
L800162ec:
  lbu $v0, 93($s0)
L800162f0:
  sll $zero, $zero, 0x0
L800162f4:
  sb $v0, 25($s1)
L800162f8:
  jal 0x800879a0
L800162fc:
  sb $v0, 13($s1)
L80016300:
  bgtz $v0, L80016320
L80016304:
  addu $a0, $s1, $zero
L80016308:
  addiu $v0, $zero, 56
L8001630c:
  sb $v0, 36($s1)
L80016310:
  sb $v0, 12($s1)
L80016314:
  addiu $v0, $zero, 128
L80016318:
  sb $v0, 25($s1)
L8001631c:
  sb $v0, 13($s1)
L80016320:
  addu $a1, $zero, $zero
L80016324:
  lbu $v0, 12($s1)
L80016328:
  lbu $v1, 13($s1)
L8001632c:
  addiu $v0, $v0, 52
L80016330:
  addiu $v1, $v1, 60
L80016334:
  sb $v0, 48($s1)
L80016338:
  sb $v0, 24($s1)
L8001633c:
  sb $v1, 49($s1)
L80016340:
  sb $v1, 37($s1)
L80016344:
  lhu $v0, 66($s0)
L80016348:
  addiu $v1, $zero, 12
L8001634c:
  sb $v1, 3($s1)
L80016350:
  addiu $v1, $zero, 60
L80016354:
  sb $v1, 7($s1)
L80016358:
  addiu $v0, $v0, 241
L8001635c:
  sll $v0, $v0, 0x6
L80016360:
  ori $v0, $v0, 0x10
L80016364:
  jal 0x80082840
L80016368:
  sh $v0, 14($s1)
L8001636c:
  lhu $v1, 26($s1)
L80016370:
  sll $zero, $zero, 0x0
L80016374:
  andi $v1, $v1, 0xff9f
L80016378:
  sh $v1, 26($s1)
L8001637c:
  lw $v0, 4($s0)
L80016380:
  sll $zero, $zero, 0x0
L80016384:
  srl $v0, $v0, 0x17
L80016388:
  andi $v0, $v0, 0x60
L8001638c:
  or $v1, $v1, $v0
L80016390:
  sh $v1, 26($s1)
L80016394:
  lw $v0, 4($s0)
L80016398:
  lui $v1, 0x4000
L8001639c:
  and $v0, $v0, $v1
L800163a0:
  beq $v0, $zero, L800163d4
L800163a4:
  addu $a0, $s1, $zero
L800163a8:
  jal 0x80082840
L800163ac:
  addiu $a1, $zero, 1
L800163b0:
  lbu $v0, 12($s0)
L800163b4:
  sll $zero, $zero, 0x0
L800163b8:
  sb $v0, 4($s5)
L800163bc:
  lbu $v0, 13($s0)
L800163c0:
  sll $zero, $zero, 0x0
L800163c4:
  sb $v0, 5($s5)
L800163c8:
  lbu $v0, 14($s0)
L800163cc:
  sll $zero, $zero, 0x0
L800163d0:
  sb $v0, 6($s5)
L800163d4:
  lw $v0, 16($s2)
L800163d8:
  lw $v1, 20($s2)
L800163dc:
  sll $zero, $zero, 0x0
L800163e0:
  addu $v0, $v0, $v1
L800163e4:
  lw $v1, 24($s2)
L800163e8:
  lw $a0, 28($s2)
L800163ec:
  addu $v0, $v0, $v1
L800163f0:
  addu $v0, $v0, $a0
L800163f4:
  bgez $v0, L80016400
L800163f8:
  lui $s0, 0x800f
L800163fc:
  addiu $v0, $v0, 3
L80016400:
  addiu $s0, $s0, -25200
L80016404:
  lw $a1, 8($s0)
L80016408:
  sra $v0, $v0, 0x4
L8001640c:
  sw $v0, 0($s2)
L80016410:
  lhu $a2, 0($s2)
L80016414:
  jal 0x80084320
L80016418:
  addu $a0, $s1, $zero
L8001641c:
  lui $t0, 0x1f80
L80016420:
  ori $t0, $t0, 0x3c0
L80016424:
  sh $zero, 2($s3)
L80016428:
  sh $zero, 2($s4)
L8001642c:
  sh $zero, 2($fp)
L80016430:
  sh $zero, 34($s6)
L80016434:
  .word 0xc9000000
L80016438:
  .word 0xc9010004
L8001643c:
  sll $zero, $zero, 0x0
L80016440:
  sll $zero, $zero, 0x0
L80016444:
  .word 0x4a180001
L80016448:
  addiu $v0, $s5, 8
L8001644c:
  .word 0xe84e0000
L80016450:
  lui $t1, 0x1f80
L80016454:
  ori $t1, $t1, 0x3c8
L80016458:
  .word 0xc9200000
L8001645c:
  .word 0xc9210004
L80016460:
  sll $zero, $zero, 0x0
L80016464:
  sll $zero, $zero, 0x0
L80016468:
  .word 0x4a180001
L8001646c:
  addiu $v0, $s5, 16
L80016470:
  .word 0xe84e0000
L80016474:
  lui $t2, 0x1f80
L80016478:
  ori $t2, $t2, 0x3d0
L8001647c:
  .word 0xc9400000
L80016480:
  .word 0xc9410004
L80016484:
  sll $zero, $zero, 0x0
L80016488:
  sll $zero, $zero, 0x0
L8001648c:
  .word 0x4a180001
L80016490:
  addiu $v0, $s5, 24
L80016494:
  .word 0xe84e0000
L80016498:
  lui $t3, 0x1f80
L8001649c:
  ori $t3, $t3, 0x3d8
L800164a0:
  .word 0xc9600000
L800164a4:
  .word 0xc9610004
L800164a8:
  sll $zero, $zero, 0x0
L800164ac:
  sll $zero, $zero, 0x0
L800164b0:
  .word 0x4a180001
L800164b4:
  addiu $v0, $s5, 32
L800164b8:
  .word 0xe84e0000
L800164bc:
  addu $a0, $s5, $zero
L800164c0:
  lw $a1, 8($s0)
L800164c4:
  jal 0x80084320
L800164c8:
  addiu $a2, $zero, 4095
L800164cc:
  lw $ra, 68($sp)
L800164d0:
  lw $fp, 64($sp)
L800164d4:
  lw $s7, 60($sp)
L800164d8:
  lw $s6, 56($sp)
L800164dc:
  lw $s5, 52($sp)
L800164e0:
  lw $s4, 48($sp)
L800164e4:
  lw $s3, 44($sp)
L800164e8:
  lw $s2, 40($sp)
L800164ec:
  lw $s1, 36($sp)
L800164f0:
  lw $s0, 32($sp)
L800164f4:
  jr $ra
L800164f8:
  addiu $sp, $sp, 72
L800164fc:
  addiu $sp, $sp, -40
L80016500:
  sw $s0, 16($sp)
L80016504:
  lui $s0, 0x800f
L80016508:
  addiu $s0, $s0, 10312
L8001650c:
  sw $ra, 36($sp)
L80016510:
  sw $s4, 32($sp)
L80016514:
  sw $s3, 28($sp)
L80016518:
  sw $s2, 24($sp)
L8001651c:
  sw $s1, 20($sp)
L80016520:
  lh $a0, 14($s0)
L80016524:
  jal 0x800878d0
L80016528:
  sll $zero, $zero, 0x0
L8001652c:
  addiu $a0, $zero, 160
L80016530:
  jal 0x800878b0
L80016534:
  addiu $a1, $zero, 108
L80016538:
  addu $a0, $zero, $zero
L8001653c:
  addu $a1, $a0, $zero
L80016540:
  jal 0x80087890
L80016544:
  addu $a2, $a0, $zero
L80016548:
  addiu $a0, $zero, 650
L8001654c:
  lh $a2, 14($s0)
L80016550:
  jal 0x80086810
L80016554:
  addiu $a1, $zero, 800
L80016558:
  jal 0x800540b4
L8001655c:
  addiu $a0, $zero, 2
L80016560:
  lui $a0, 0x800a
L80016564:
  lw $a0, -19700($a0)
L80016568:
  sll $zero, $zero, 0x0
L8001656c:
  andi $v0, $a0, 0x2
L80016570:
  beq $v0, $zero, L800165c0
L80016574:
  lui $s4, 0x1f80
L80016578:
  lui $v0, 0x800a
L8001657c:
  lw $v0, -19692($v0)
L80016580:
  lui $v1, 0x800a
L80016584:
  lw $v1, -19704($v1)
L80016588:
  addiu $v0, $v0, 1
L8001658c:
  lui $at, 0x800a
L80016590:
  sw $v0, -19692($at)
L80016594:
  sltu $v0, $v0, $v1
L80016598:
  bne $v0, $zero, L800165ac
L8001659c:
  addiu $v0, $zero, -4
L800165a0:
  and $v0, $a0, $v0
L800165a4:
  lui $at, 0x800a
L800165a8:
  sw $v0, -19700($at)
L800165ac:
  lui $v0, 0x800a
L800165b0:
  lw $v0, -19708($v0)
L800165b4:
  lui $at, 0x800a
L800165b8:
  sw $v0, -19696($at)
L800165bc:
  lui $s4, 0x1f80
L800165c0:
  ori $s4, $s4, 0xc0
L800165c4:
  lui $s1, 0x1f80
L800165c8:
  ori $s1, $s1, 0x140
L800165cc:
  lui $s3, 0x1f80
L800165d0:
  ori $s3, $s3, 0x180
L800165d4:
  lui $a0, 0x80
L800165d8:
  ori $a0, $a0, 0x8080
L800165dc:
  lui $v0, 0x801a
L800165e0:
  addiu $s0, $v0, 31588
L800165e4:
  addu $s2, $zero, $zero
L800165e8:
  addiu $v0, $zero, 9
L800165ec:
  sb $v0, 3($s1)
L800165f0:
  addiu $v0, $zero, 44
L800165f4:
  sb $v0, 7($s1)
L800165f8:
  addiu $v0, $zero, 255
L800165fc:
  sb $v0, 4($s1)
L80016600:
  sb $v0, 5($s1)
L80016604:
  sb $v0, 6($s1)
L80016608:
  addiu $v0, $zero, 95
L8001660c:
  sh $v0, 22($s1)
L80016610:
  addiu $v0, $zero, 15377
L80016614:
  addiu $v1, $zero, 128
L80016618:
  sh $v0, 14($s1)
L8001661c:
  addiu $v0, $zero, 175
L80016620:
  sb $v0, 36($s1)
L80016624:
  sb $v0, 20($s1)
L80016628:
  addiu $v0, $zero, 55
L8001662c:
  sb $v0, 37($s1)
L80016630:
  sb $v0, 29($s1)
L80016634:
  addiu $v0, $zero, 46
L80016638:
  sb $v0, 7($s1)
L8001663c:
  addiu $v0, $zero, 158
L80016640:
  sb $v1, 28($s1)
L80016644:
  sb $v1, 12($s1)
L80016648:
  sb $zero, 21($s1)
L8001664c:
  sb $zero, 13($s1)
L80016650:
  sh $v0, 26($s3)
L80016654:
  addiu $v0, $zero, 15440
L80016658:
  sh $v0, 14($s3)
L8001665c:
  addiu $v0, $zero, 188
L80016660:
  sb $v1, 25($s3)
L80016664:
  sb $v1, 13($s3)
L80016668:
  sb $v0, 49($s3)
L8001666c:
  sb $v0, 37($s3)
L80016670:
  sw $a0, 0($s4)
L80016674:
  lhu $v1, 22($s0)
L80016678:
  sll $zero, $zero, 0x0
L8001667c:
  andi $v0, $v1, 0x8000
L80016680:
  beq $v0, $zero, L800166c8
L80016684:
  sll $zero, $zero, 0x0
L80016688:
  lw $a3, 0($s0)
L8001668c:
  sll $zero, $zero, 0x0
L80016690:
  beq $a3, $zero, L800166c8
L80016694:
  andi $v0, $v1, 0x400
L80016698:
  beq $v0, $zero, L800166b0
L8001669c:
  addu $a0, $s0, $zero
L800166a0:
  jal L80015dfc
L800166a4:
  addu $a0, $s0, $zero
L800166a8:
  j L800166cc
L800166ac:
  addiu $s2, $s2, 1
L800166b0:
  addu $a1, $s3, $zero
L800166b4:
  addu $a2, $s1, $zero
L800166b8:
  lw $v0, 12($a3)
L800166bc:
  addu $a3, $s4, $zero
L800166c0:
  jal L80015ef4
L800166c4:
  sw $v0, 0($s4)
L800166c8:
  addiu $s2, $s2, 1
L800166cc:
  slti $v0, $s2, 10
L800166d0:
  bne $v0, $zero, L80016674
L800166d4:
  addiu $s0, $s0, 28
L800166d8:
  lui $v0, 0x801a
L800166dc:
  addiu $v0, $v0, 31588
L800166e0:
  addiu $s0, $v0, 420
L800166e4:
  addu $s2, $zero, $zero
L800166e8:
  lhu $v1, 22($s0)
L800166ec:
  sll $zero, $zero, 0x0
L800166f0:
  andi $v0, $v1, 0x8000
L800166f4:
  beq $v0, $zero, L8001673c
L800166f8:
  sll $zero, $zero, 0x0
L800166fc:
  lw $a3, 0($s0)
L80016700:
  sll $zero, $zero, 0x0
L80016704:
  beq $a3, $zero, L8001673c
L80016708:
  andi $v0, $v1, 0x400
L8001670c:
  beq $v0, $zero, L80016724
L80016710:
  addu $a0, $s0, $zero
L80016714:
  jal L80015dfc
L80016718:
  addu $a0, $s0, $zero
L8001671c:
  j L80016740
L80016720:
  addiu $s2, $s2, 1
L80016724:
  addu $a1, $s3, $zero
L80016728:
  addu $a2, $s1, $zero
L8001672c:
  lw $v0, 12($a3)
L80016730:
  addu $a3, $s4, $zero
L80016734:
  jal L80015ef4
L80016738:
  sw $v0, 0($s4)
L8001673c:
  addiu $s2, $s2, 1
L80016740:
  slti $v0, $s2, 10
L80016744:
  bne $v0, $zero, L800166e8
L80016748:
  addiu $s0, $s0, 28
L8001674c:
  addu $a0, $zero, $zero
L80016750:
  jal 0x800878b0
L80016754:
  addu $a1, $a0, $zero
L80016758:
  lw $ra, 36($sp)
L8001675c:
  lw $s4, 32($sp)
L80016760:
  lw $s3, 28($sp)
L80016764:
  lw $s2, 24($sp)
L80016768:
  lw $s1, 20($sp)
L8001676c:
  lw $s0, 16($sp)
L80016770:
  jr $ra
L80016774:
  addiu $sp, $sp, 40
L80016778:
  srl $a1, $a1, 0x1f
L8001677c:
  jr $ra
L80016780:
  sb $a1, 105($a0)
