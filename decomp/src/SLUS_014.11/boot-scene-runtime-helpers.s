.set noreorder
.set noat

.section .text.boot_scene_runtime_helpers,"ax",@progbits
.align 2
.global boot_scene_runtime_helpers

boot_scene_runtime_helpers:
L80018db4:
  lhu $v1, 818($gp)
L80018db8:
  addiu $sp, $sp, -32
L80018dbc:
  sw $ra, 24($sp)
L80018dc0:
  sw $s1, 20($sp)
L80018dc4:
  andi $v0, $v1, 0x8000
L80018dc8:
  bne $v0, $zero, L80018de0
L80018dcc:
  sw $s0, 16($sp)
L80018dd0:
  ori $v0, $v1, 0x8000
L80018dd4:
  sh $v0, 818($gp)
L80018dd8:
  addiu $v0, $zero, 1
L80018ddc:
  sb $v0, 741($gp)
L80018de0:
  lhu $v0, 818($gp)
L80018de4:
  sll $zero, $zero, 0x0
L80018de8:
  andi $v0, $v0, 0x4000
L80018dec:
  bne $v0, $zero, L80018fb0
L80018df0:
  sll $zero, $zero, 0x0
L80018df4:
  lbu $v0, 741($gp)
L80018df8:
  sll $zero, $zero, 0x0
L80018dfc:
  addiu $v0, $v0, -1
L80018e00:
  sb $v0, 741($gp)
L80018e04:
  sll $v0, $v0, 0x18
L80018e08:
  bgtz $v0, L80018fd8
L80018e0c:
  addiu $v0, $zero, 8
L80018e10:
  sb $v0, 741($gp)
L80018e14:
  lbu $v0, 740($gp)
L80018e18:
  lw $v1, 704($gp)
L80018e1c:
  addiu $a0, $v0, -1
L80018e20:
  sb $a0, 740($gp)
L80018e24:
  lb $v0, 24($v1)
L80018e28:
  sll $zero, $zero, 0x0
L80018e2c:
  slti $v0, $v0, 40
L80018e30:
  bne $v0, $zero, L80018e68
L80018e34:
  addiu $v1, $zero, 4
L80018e38:
  lui $v1, 0x800f
L80018e3c:
  lbu $v0, 717($gp)
L80018e40:
  addiu $v1, $v1, -24592
L80018e44:
  xori $v0, $v0, 0x1
L80018e48:
  sb $v0, 605($gp)
L80018e4c:
  andi $v0, $v0, 0xff
L80018e50:
  sll $v0, $v0, 0x5
L80018e54:
  addu $v0, $v0, $v1
L80018e58:
  addiu $v1, $zero, -40
L80018e5c:
  sb $v1, 0($v0)
L80018e60:
  j L80018fd4
L80018e64:
  addiu $v0, $zero, 12
L80018e68:
  sll $v0, $a0, 0x18
L80018e6c:
  sra $v0, $v0, 0x18
L80018e70:
  subu $s1, $v1, $v0
L80018e74:
  lui $v1, 0x8009
L80018e78:
  lbu $a0, 717($gp)
L80018e7c:
  addiu $v1, $v1, 1996
L80018e80:
  sll $v0, $a0, 0x2
L80018e84:
  addu $v0, $v0, $a0
L80018e88:
  addu $v0, $s1, $v0
L80018e8c:
  addu $v0, $v0, $v1
L80018e90:
  lbu $a0, 0($v0)
L80018e94:
  sll $zero, $zero, 0x0
L80018e98:
  andi $v0, $a0, 0x80
L80018e9c:
  beq $v0, $zero, L80018eac
L80018ea0:
  andi $v0, $a0, 0x7f
L80018ea4:
  j L80018eb0
L80018ea8:
  addiu $s0, $v0, 15
L80018eac:
  addu $s0, $a0, $zero
L80018eb0:
  lw $v0, 704($gp)
L80018eb4:
  sll $zero, $zero, 0x0
L80018eb8:
  lb $a1, 24($v0)
L80018ebc:
  jal 0x800249e0
L80018ec0:
  addu $a0, $s0, $zero
L80018ec4:
  sll $v0, $s0, 0x3
L80018ec8:
  subu $v0, $v0, $s0
L80018ecc:
  sll $v0, $v0, 0x2
L80018ed0:
  lui $a0, 0x801a
L80018ed4:
  addiu $a0, $a0, 31448
L80018ed8:
  addu $a0, $v0, $a0
L80018edc:
  sll $a1, $s1, 0x4
L80018ee0:
  subu $a1, $a1, $s1
L80018ee4:
  sll $a1, $a1, 0x2
L80018ee8:
  addiu $a1, $a1, 334
L80018eec:
  jal 0x80018004
L80018ef0:
  addiu $a2, $zero, 146
L80018ef4:
  lui $a1, 0x4
L80018ef8:
  ori $a1, $a1, 0x8000
L80018efc:
  addiu $v1, $zero, 1
L80018f00:
  sb $v1, 108($v0)
L80018f04:
  addiu $v1, $zero, 12
L80018f08:
  sh $v1, 96($v0)
L80018f0c:
  lui $v1, 0x8002
L80018f10:
  addiu $v1, $v1, -29644
L80018f14:
  lui $a0, 0x800f
L80018f18:
  addiu $a0, $a0, -24528
L80018f1c:
  sw $v1, 36($v0)
L80018f20:
  sll $v1, $s1, 0x1
L80018f24:
  addu $v1, $v1, $s1
L80018f28:
  sll $v1, $v1, 0x2
L80018f2c:
  addu $v1, $v1, $a0
L80018f30:
  sw $v0, 0($v1)
L80018f34:
  lui $v1, 0x8016
L80018f38:
  lbu $a0, 106($v0)
L80018f3c:
  addiu $v1, $v1, -15324
L80018f40:
  sll $v0, $a0, 0x3
L80018f44:
  subu $v0, $v0, $a0
L80018f48:
  sll $v0, $v0, 0x2
L80018f4c:
  addu $v0, $v0, $v1
L80018f50:
  addu $v0, $v0, $a1
L80018f54:
  lw $v1, 14008($v0)
L80018f58:
  lw $v0, 704($gp)
L80018f5c:
  lb $v1, 2($v1)
L80018f60:
  addu $v0, $v0, $s1
L80018f64:
  sb $v1, 26($v0)
L80018f68:
  lw $v1, 704($gp)
L80018f6c:
  sll $zero, $zero, 0x0
L80018f70:
  lbu $v0, 24($v1)
L80018f74:
  sll $zero, $zero, 0x0
L80018f78:
  addiu $v0, $v0, 1
L80018f7c:
  sb $v0, 24($v1)
L80018f80:
  lb $v0, 740($gp)
L80018f84:
  sll $zero, $zero, 0x0
L80018f88:
  bne $v0, $zero, L80018fa0
L80018f8c:
  sll $zero, $zero, 0x0
L80018f90:
  lhu $v0, 818($gp)
L80018f94:
  sll $zero, $zero, 0x0
L80018f98:
  ori $v0, $v0, 0x4000
L80018f9c:
  sh $v0, 818($gp)
L80018fa0:
  jal 0x8003fee0
L80018fa4:
  addiu $a0, $zero, 10
L80018fa8:
  j L80018fd8
L80018fac:
  sll $zero, $zero, 0x0
L80018fb0:
  jal 0x80042b40
L80018fb4:
  addiu $a0, $zero, 1
L80018fb8:
  bne $v0, $zero, L80018fd8
L80018fbc:
  addiu $v0, $zero, 4
L80018fc0:
  sh $v0, 818($gp)
L80018fc4:
  jal 0x80018cf8
L80018fc8:
  sll $zero, $zero, 0x0
L80018fcc:
  beq $v0, $zero, L80018fd8
L80018fd0:
  addiu $v0, $zero, 14
L80018fd4:
  sh $v0, 818($gp)
L80018fd8:
  lw $ra, 24($sp)
L80018fdc:
  lw $s1, 20($sp)
L80018fe0:
  lw $s0, 16($sp)
L80018fe4:
  jr $ra
L80018fe8:
  addiu $sp, $sp, 32
L80018fec:
  lhu $a1, 818($gp)
L80018ff0:
  addiu $sp, $sp, -24
L80018ff4:
  sw $ra, 20($sp)
L80018ff8:
  andi $v0, $a1, 0x8000
L80018ffc:
  bne $v0, $zero, L80019190
L80019000:
  sw $s0, 16($sp)
L80019004:
  addu $t0, $zero, $zero
L80019008:
  lui $v0, 0x8016
L8001900c:
  addiu $t4, $v0, -15324
L80019010:
  lui $v0, 0x8009
L80019014:
  addiu $t3, $v0, 2328
L80019018:
  lui $v0, 0x8002
L8001901c:
  addiu $v0, $v0, -5008
L80019020:
  addu $t1, $v0, $zero
L80019024:
  lui $v0, 0x800f
L80019028:
  addiu $t2, $v0, -24848
L8001902c:
  ori $v0, $a1, 0x8000
L80019030:
  lw $a2, 780($gp)
L80019034:
  lbu $v1, 717($gp)
L80019038:
  addiu $a1, $zero, 16
L8001903c:
  sh $v0, 818($gp)
L80019040:
  sll $v0, $v1, 0x3
L80019044:
  subu $v0, $v0, $v1
L80019048:
  sll $v0, $v0, 0x4
L8001904c:
  lui $v1, 0x800f
L80019050:
  addiu $v1, $v1, -24816
L80019054:
  addu $v0, $v0, $v1
L80019058:
  sw $v0, 684($gp)
L8001905c:
  addiu $v0, $zero, -64
L80019060:
  sh $v0, 40($a2)
L80019064:
  lhu $v0, 50($a2)
L80019068:
  addiu $a0, $zero, 1
L8001906c:
  sh $a1, 44($a2)
L80019070:
  sb $a0, 108($a2)
L80019074:
  sw $t1, 36($a2)
L80019078:
  sh $v0, 42($a2)
L8001907c:
  lui $v0, 0x800f
L80019080:
  lw $a2, 788($gp)
L80019084:
  addiu $a3, $v0, -24528
L80019088:
  lhu $v1, 50($a2)
L8001908c:
  addiu $v0, $zero, 384
L80019090:
  sh $v0, 40($a2)
L80019094:
  sh $a1, 44($a2)
L80019098:
  sb $a0, 108($a2)
L8001909c:
  sw $t1, 36($a2)
L800190a0:
  sh $v1, 42($a2)
L800190a4:
  lw $a2, 0($a3)
L800190a8:
  lui $a0, 0x4
L800190ac:
  lbu $v1, 106($a2)
L800190b0:
  ori $a0, $a0, 0x8000
L800190b4:
  sll $v0, $v1, 0x3
L800190b8:
  subu $v0, $v0, $v1
L800190bc:
  sll $v0, $v0, 0x2
L800190c0:
  addu $v0, $v0, $t4
L800190c4:
  addu $v0, $v0, $a0
L800190c8:
  lh $v0, 14016($v0)
L800190cc:
  sll $zero, $zero, 0x0
L800190d0:
  addiu $v0, $v0, -17
L800190d4:
  sll $v1, $v0, 0x1
L800190d8:
  addu $v1, $v1, $v0
L800190dc:
  addu $v1, $v1, $t3
L800190e0:
  lbu $v0, 1($v1)
L800190e4:
  sll $zero, $zero, 0x0
L800190e8:
  addiu $v0, $v0, -26
L800190ec:
  sh $v0, 40($a2)
L800190f0:
  lbu $a0, 2($v1)
L800190f4:
  addiu $v0, $zero, 180
L800190f8:
  sh $v0, 44($a2)
L800190fc:
  addiu $v0, $zero, 1
L80019100:
  sb $v0, 108($a2)
L80019104:
  sw $t1, 36($a2)
L80019108:
  addiu $a0, $a0, -30
L8001910c:
  sh $a0, 42($a2)
L80019110:
  lbu $v0, 0($v1)
L80019114:
  addiu $t0, $t0, 1
L80019118:
  sll $v0, $v0, 0x2
L8001911c:
  addu $v0, $v0, $t2
L80019120:
  sw $a2, 0($v0)
L80019124:
  sw $zero, 0($a3)
L80019128:
  slti $v0, $t0, 5
L8001912c:
  bne $v0, $zero, L800190a4
L80019130:
  addiu $a3, $a3, 12
L80019134:
  lw $v1, 684($gp)
L80019138:
  lui $v0, 0x800f
L8001913c:
  sw $zero, -24828($v0)
L80019140:
  lw $a0, 4($v1)
L80019144:
  jal 0x8004036c
L80019148:
  sll $zero, $zero, 0x0
L8001914c:
  lhu $v1, 818($gp)
L80019150:
  addiu $v0, $zero, 8
L80019154:
  sh $v0, 602($gp)
L80019158:
  sh $zero, 712($gp)
L8001915c:
  sb $zero, 689($gp)
L80019160:
  sw $zero, 628($gp)
L80019164:
  ori $v1, $v1, 0x4000
L80019168:
  sh $v1, 818($gp)
L8001916c:
  jal 0x80015c84
L80019170:
  sll $zero, $zero, 0x0
L80019174:
  addiu $a0, $zero, 2
L80019178:
  lui $v1, 0x800f
L8001917c:
  addu $v0, $a0, $zero
L80019180:
  jal 0x8003ff58
L80019184:
  sb $v0, -24881($v1)
L80019188:
  j L8001943c
L8001918c:
  sll $zero, $zero, 0x0
L80019190:
  andi $v0, $a1, 0x4000
L80019194:
  beq $v0, $zero, L8001927c
L80019198:
  andi $v0, $a1, 0x2000
L8001919c:
  beq $v0, $zero, L800191d0
L800191a0:
  sll $zero, $zero, 0x0
L800191a4:
  lui $v0, 0x800a
L800191a8:
  lbu $v0, -19872($v0)
L800191ac:
  sll $zero, $zero, 0x0
L800191b0:
  andi $v0, $v0, 0x1
L800191b4:
  bne $v0, $zero, L8001943c
L800191b8:
  andi $v0, $a1, 0xbfff
L800191bc:
  sh $v0, 818($gp)
L800191c0:
  sb $zero, 689($gp)
L800191c4:
  sh $zero, 712($gp)
L800191c8:
  j L8001943c
L800191cc:
  sll $zero, $zero, 0x0
L800191d0:
  lw $v0, 628($gp)
L800191d4:
  sll $zero, $zero, 0x0
L800191d8:
  beq $v0, $zero, L80019220
L800191dc:
  sll $zero, $zero, 0x0
L800191e0:
  lbu $v0, 29($v0)
L800191e4:
  sll $zero, $zero, 0x0
L800191e8:
  beq $v0, $zero, L8001943c
L800191ec:
  sll $zero, $zero, 0x0
L800191f0:
  jal 0x8003fee0
L800191f4:
  addiu $a0, $zero, 29
L800191f8:
  jal 0x80042b40
L800191fc:
  addiu $a0, $zero, 1
L80019200:
  bne $v0, $zero, L80019220
L80019204:
  sll $zero, $zero, 0x0
L80019208:
  lhu $v0, 818($gp)
L8001920c:
  sll $zero, $zero, 0x0
L80019210:
  ori $v0, $v0, 0x2000
L80019214:
  sh $v0, 818($gp)
L80019218:
  j L8001943c
L8001921c:
  sll $zero, $zero, 0x0
L80019220:
  jal 0x8002c604
L80019224:
  addiu $a0, $zero, 19
L80019228:
  addu $s0, $v0, $zero
L8001922c:
  sw $s0, 628($gp)
L80019230:
  jal 0x8008e590
L80019234:
  sll $zero, $zero, 0x0
L80019238:
  addiu $a0, $zero, 176
L8001923c:
  andi $v0, $v0, 0xff
L80019240:
  addiu $v0, $v0, 32
L80019244:
  jal 0x800358fc
L80019248:
  sh $v0, 0($s0)
L8001924c:
  lbu $a0, 689($gp)
L80019250:
  lw $v1, 20($s0)
L80019254:
  addiu $v0, $v0, 32
L80019258:
  sh $v0, 2($s0)
L8001925c:
  andi $v0, $a0, 0x3
L80019260:
  sll $v0, $v0, 0xd
L80019264:
  addu $v1, $v1, $v0
L80019268:
  addiu $a0, $a0, 1
L8001926c:
  sw $v1, 20($s0)
L80019270:
  sb $a0, 689($gp)
L80019274:
  j L8001943c
L80019278:
  sll $zero, $zero, 0x0
L8001927c:
  beq $v0, $zero, L80019378
L80019280:
  andi $v0, $a1, 0x1000
L80019284:
  lhu $v0, 712($gp)
L80019288:
  sll $zero, $zero, 0x0
L8001928c:
  addiu $v0, $v0, -1
L80019290:
  sh $v0, 712($gp)
L80019294:
  sll $v0, $v0, 0x10
L80019298:
  bgtz $v0, L8001943c
L8001929c:
  sll $zero, $zero, 0x0
L800192a0:
  lb $v0, 689($gp)
L800192a4:
  sll $zero, $zero, 0x0
L800192a8:
  slti $v0, $v0, 5
L800192ac:
  bne $v0, $zero, L800192f4
L800192b0:
  addiu $v0, $zero, 4
L800192b4:
  andi $v0, $a1, 0xdfff
L800192b8:
  ori $v0, $v0, 0x1000
L800192bc:
  sh $v0, 818($gp)
L800192c0:
  jal 0x8002c604
L800192c4:
  addiu $a0, $zero, 19
L800192c8:
  addu $s0, $v0, $zero
L800192cc:
  addiu $v0, $zero, 160
L800192d0:
  sh $v0, 0($s0)
L800192d4:
  addiu $v0, $zero, 120
L800192d8:
  sh $v0, 2($s0)
L800192dc:
  lw $v0, 20($s0)
L800192e0:
  ori $v1, $zero, 0x8000
L800192e4:
  sw $s0, 628($gp)
L800192e8:
  addu $v0, $v0, $v1
L800192ec:
  j L8001943c
L800192f0:
  sw $v0, 20($s0)
L800192f4:
  sh $v0, 712($gp)
L800192f8:
  jal 0x8002c604
L800192fc:
  addu $a0, $zero, $zero
L80019300:
  lui $v1, 0x800f
L80019304:
  addiu $v1, $v1, -24848
L80019308:
  lb $a2, 689($gp)
L8001930c:
  addu $s0, $v0, $zero
L80019310:
  sll $a1, $a2, 0x2
L80019314:
  addu $a1, $a1, $v1
L80019318:
  lw $v1, 0($a1)
L8001931c:
  addiu $a0, $zero, 23
L80019320:
  lhu $v0, 48($v1)
L80019324:
  sll $a2, $a2, 0xc
L80019328:
  addiu $v0, $v0, 26
L8001932c:
  sh $v0, 0($s0)
L80019330:
  ori $v0, $zero, 0xa000
L80019334:
  addu $a2, $a2, $v0
L80019338:
  lw $v1, 0($a1)
L8001933c:
  lw $v0, 20($s0)
L80019340:
  lhu $v1, 50($v1)
L80019344:
  addu $v0, $v0, $a2
L80019348:
  sw $v0, 20($s0)
L8001934c:
  addiu $v0, $zero, 9
L80019350:
  sh $v0, 26($s0)
L80019354:
  addiu $v1, $v1, 30
L80019358:
  jal 0x8003fee0
L8001935c:
  sh $v1, 2($s0)
L80019360:
  lbu $v0, 689($gp)
L80019364:
  sll $zero, $zero, 0x0
L80019368:
  addiu $v0, $v0, 1
L8001936c:
  sb $v0, 689($gp)
L80019370:
  j L8001943c
L80019374:
  sll $zero, $zero, 0x0
L80019378:
  beq $v0, $zero, L800193bc
L8001937c:
  sll $zero, $zero, 0x0
L80019380:
  lw $v0, 628($gp)
L80019384:
  sll $zero, $zero, 0x0
L80019388:
  lbu $v0, 29($v0)
L8001938c:
  sll $zero, $zero, 0x0
L80019390:
  beq $v0, $zero, L8001943c
L80019394:
  andi $v0, $a1, 0xefff
L80019398:
  sh $v0, 818($gp)
L8001939c:
  jal 0x8003fee0
L800193a0:
  addiu $a0, $zero, 29
L800193a4:
  jal 0x8002c68c
L800193a8:
  addiu $a0, $zero, 24
L800193ac:
  jal 0x8003ff88
L800193b0:
  ori $a0, $zero, 0x8021
L800193b4:
  j L8001943c
L800193b8:
  sll $zero, $zero, 0x0
L800193bc:
  jal 0x800156dc
L800193c0:
  sll $zero, $zero, 0x0
L800193c4:
  lui $v1, 0x800f
L800193c8:
  addiu $v0, $zero, 777
L800193cc:
  lui $a1, 0x800f
L800193d0:
  lbu $a0, 717($gp)
L800193d4:
  addiu $a1, $a1, -24592
L800193d8:
  sh $v0, -2472($v1)
L800193dc:
  addiu $v1, $zero, 40
L800193e0:
  andi $v0, $a0, 0xff
L800193e4:
  sll $v0, $v0, 0x5
L800193e8:
  addu $v0, $v0, $a1
L800193ec:
  sb $a0, 605($gp)
L800193f0:
  sb $v1, 0($v0)
L800193f4:
  lbu $v0, 717($gp)
L800193f8:
  addiu $a0, $zero, 29456
L800193fc:
  xori $v0, $v0, 0x1
L80019400:
  sll $v0, $v0, 0x5
L80019404:
  addu $v0, $v0, $a1
L80019408:
  sh $zero, 20($v0)
L8001940c:
  jal 0x800472a8
L80019410:
  sh $zero, 18($v0)
L80019414:
  jal 0x80059c18
L80019418:
  addiu $a0, $zero, 29456
L8001941c:
  addiu $v1, $zero, 1
L80019420:
  addiu $v0, $zero, 3
L80019424:
  lui $at, 0x800a
L80019428:
  sb $v1, -19607($at)
L8001942c:
  lui $at, 0x800a
L80019430:
  sb $v0, -19863($at)
L80019434:
  lui $at, 0x800a
L80019438:
  sb $v1, -19860($at)
L8001943c:
  lw $ra, 20($sp)
L80019440:
  lw $s0, 16($sp)
L80019444:
  jr $ra
L80019448:
  addiu $sp, $sp, 24
