.set noreorder
.set noat

.section .text.boot_scene_interaction_helpers,"ax",@progbits
.align 2
.global boot_scene_interaction_helpers

boot_scene_interaction_helpers:
L80023fbc:
  addiu $sp, $sp, -24
L80023fc0:
  lui $v0, 0x800a
L80023fc4:
  lhu $v0, -19548($v0)
L80023fc8:
  addiu $a1, $zero, -1
L80023fcc:
  andi $v0, $v0, 0xf000
L80023fd0:
  beq $v0, $zero, L80024048
L80023fd4:
  sw $ra, 16($sp)
L80023fd8:
  lui $v0, 0x800a
L80023fdc:
  lhu $v0, -19548($v0)
L80023fe0:
  sll $zero, $zero, 0x0
L80023fe4:
  andi $v0, $v0, 0x2000
L80023fe8:
  beq $v0, $zero, L80023ff4
L80023fec:
  sll $zero, $zero, 0x0
L80023ff0:
  addu $a1, $zero, $zero
L80023ff4:
  lui $v0, 0x800a
L80023ff8:
  lhu $v0, -19548($v0)
L80023ffc:
  sll $zero, $zero, 0x0
L80024000:
  andi $v0, $v0, 0x4000
L80024004:
  beq $v0, $zero, L80024010
L80024008:
  sll $zero, $zero, 0x0
L8002400c:
  addiu $a1, $zero, 1
L80024010:
  lui $v0, 0x800a
L80024014:
  lhu $v0, -19548($v0)
L80024018:
  sll $zero, $zero, 0x0
L8002401c:
  andi $v0, $v0, 0x8000
L80024020:
  beq $v0, $zero, L8002402c
L80024024:
  sll $zero, $zero, 0x0
L80024028:
  addiu $a1, $zero, 2
L8002402c:
  lui $v0, 0x800a
L80024030:
  lhu $v0, -19548($v0)
L80024034:
  sll $zero, $zero, 0x0
L80024038:
  andi $v0, $v0, 0x1000
L8002403c:
  beq $v0, $zero, L80024048
L80024040:
  sll $zero, $zero, 0x0
L80024044:
  addiu $a1, $zero, 3
L80024048:
  jal 0x80023d08
L8002404c:
  sll $zero, $zero, 0x0
L80024050:
  lw $ra, 16($sp)
L80024054:
  sll $zero, $zero, 0x0
L80024058:
  jr $ra
L8002405c:
  addiu $sp, $sp, 24
L80024060:
  addiu $sp, $sp, -24
L80024064:
  sw $s0, 16($sp)
L80024068:
  sw $ra, 20($sp)
L8002406c:
  jal L80023fbc
L80024070:
  addu $s0, $a0, $zero
L80024074:
  lbu $v0, 25($s0)
L80024078:
  lw $ra, 20($sp)
L8002407c:
  lw $s0, 16($sp)
L80024080:
  jr $ra
L80024084:
  addiu $sp, $sp, 24
L80024088:
  addiu $sp, $sp, -24
L8002408c:
  sw $s0, 16($sp)
L80024090:
  sw $ra, 20($sp)
L80024094:
  jal 0x80023d08
L80024098:
  addu $s0, $a0, $zero
L8002409c:
  lbu $v0, 25($s0)
L800240a0:
  lw $ra, 20($sp)
L800240a4:
  lw $s0, 16($sp)
L800240a8:
  jr $ra
L800240ac:
  addiu $sp, $sp, 24
L800240b0:
  lbu $v1, 716($gp)
L800240b4:
  addiu $sp, $sp, -24
L800240b8:
  sw $s0, 16($sp)
L800240bc:
  addu $s0, $a0, $zero
L800240c0:
  andi $v0, $v1, 0x80
L800240c4:
  bne $v0, $zero, L800240f8
L800240c8:
  sw $ra, 20($sp)
L800240cc:
  ori $v0, $v1, 0xc0
L800240d0:
  sb $v0, 716($gp)
L800240d4:
  addiu $v0, $zero, 4
L800240d8:
  sb $v0, 18($s0)
L800240dc:
  addiu $v0, $zero, 116
L800240e0:
  sh $v0, 12($s0)
L800240e4:
  addiu $v0, $zero, 3
L800240e8:
  sb $zero, 24($s0)
L800240ec:
  sb $zero, 17($s0)
L800240f0:
  sb $zero, 25($s0)
L800240f4:
  sh $v0, 602($gp)
L800240f8:
  lbu $v1, 716($gp)
L800240fc:
  sll $zero, $zero, 0x0
L80024100:
  andi $v0, $v1, 0x40
L80024104:
  beq $v0, $zero, L80024138
L80024108:
  sll $zero, $zero, 0x0
L8002410c:
  lhu $v0, 602($gp)
L80024110:
  sll $zero, $zero, 0x0
L80024114:
  bne $v0, $zero, L800241f0
L80024118:
  andi $v0, $v1, 0xbf
L8002411c:
  sb $v0, 716($gp)
L80024120:
  andi $v0, $v1, 0x20
L80024124:
  beq $v0, $zero, L800241f0
L80024128:
  sll $zero, $zero, 0x0
L8002412c:
  sb $zero, 716($gp)
L80024130:
  j L800241f0
L80024134:
  sll $zero, $zero, 0x0
L80024138:
  jal L80024060
L8002413c:
  addu $a0, $s0, $zero
L80024140:
  bne $v0, $zero, L800241f0
L80024144:
  lui $a1, 0x8009
L80024148:
  lb $v0, 16($s0)
L8002414c:
  addiu $a1, $a1, 2008
L80024150:
  sll $v1, $v0, 0x2
L80024154:
  addu $v1, $v1, $v0
L80024158:
  lb $v0, 15($s0)
L8002415c:
  lbu $a0, 717($gp)
L80024160:
  addu $v1, $v1, $v0
L80024164:
  sll $v0, $a0, 0x2
L80024168:
  addu $v0, $v0, $a0
L8002416c:
  sll $v0, $v0, 0x2
L80024170:
  addu $v1, $v1, $v0
L80024174:
  addu $v1, $v1, $a1
L80024178:
  lui $a0, 0x801a
L8002417c:
  lbu $v1, 0($v1)
L80024180:
  addiu $a0, $a0, 31448
L80024184:
  sll $v0, $v1, 0x3
L80024188:
  subu $v0, $v0, $v1
L8002418c:
  sll $v0, $v0, 0x2
L80024190:
  jal 0x80017034
L80024194:
  addu $a0, $v0, $a0
L80024198:
  beq $v0, $zero, L800241c8
L8002419c:
  sll $zero, $zero, 0x0
L800241a0:
  lui $at, 0x800a
L800241a4:
  sh $v0, -19898($at)
L800241a8:
  addiu $v0, $zero, 20
L800241ac:
  lui $at, 0x800a
L800241b0:
  sb $v0, -19893($at)
L800241b4:
  addiu $v0, $zero, 2
L800241b8:
  lui $at, 0x800a
L800241bc:
  sb $v0, -19884($at)
L800241c0:
  j L800241f0
L800241c4:
  sll $zero, $zero, 0x0
L800241c8:
  lui $v0, 0x800a
L800241cc:
  lhu $v0, -19548($v0)
L800241d0:
  sll $zero, $zero, 0x0
L800241d4:
  andi $v0, $v0, 0x3
L800241d8:
  bne $v0, $zero, L800241f0
L800241dc:
  addiu $v1, $zero, 12
L800241e0:
  lbu $v0, 716($gp)
L800241e4:
  sh $v1, 602($gp)
L800241e8:
  ori $v0, $v0, 0x60
L800241ec:
  sb $v0, 716($gp)
L800241f0:
  lw $ra, 20($sp)
L800241f4:
  lw $s0, 16($sp)
L800241f8:
  jr $ra
L800241fc:
  addiu $sp, $sp, 24
L80024200:
  lhu $v0, 602($gp)
L80024204:
  addiu $sp, $sp, -40
L80024208:
  sw $ra, 36($sp)
L8002420c:
  beq $v0, $zero, L8002421c
L80024210:
  sw $s0, 32($sp)
L80024214:
  jal 0x800235c0
L80024218:
  sll $zero, $zero, 0x0
L8002421c:
  jal L8002c6c8
L80024220:
  sll $zero, $zero, 0x0
L80024224:
  lui $v1, 0x800a
L80024228:
  lbu $v1, -19872($v1)
L8002422c:
  sll $zero, $zero, 0x0
L80024230:
  andi $v0, $v1, 0x80
L80024234:
  beq $v0, $zero, L8002424c
L80024238:
  andi $v0, $v1, 0x1
L8002423c:
  bne $v0, $zero, L80024378
L80024240:
  andi $v0, $v1, 0x7f
L80024244:
  lui $at, 0x800a
L80024248:
  sb $v0, -19872($at)
L8002424c:
  jal L80026b34
L80024250:
  sll $zero, $zero, 0x0
L80024254:
  bne $v0, $zero, L80024378
L80024258:
  sll $zero, $zero, 0x0
L8002425c:
  jal L8002892c
L80024260:
  sll $zero, $zero, 0x0
L80024264:
  bne $v0, $zero, L80024378
L80024268:
  sll $zero, $zero, 0x0
L8002426c:
  lbu $v1, 604($gp)
L80024270:
  sll $zero, $zero, 0x0
L80024274:
  beq $v1, $zero, L80024338
L80024278:
  andi $v0, $v1, 0x80
L8002427c:
  bne $v0, $zero, L800242e0
L80024280:
  ori $v0, $v1, 0x80
L80024284:
  sb $v0, 604($gp)
L80024288:
  jal L8003fee0
L8002428c:
  addiu $a0, $zero, 48
L80024290:
  addiu $a0, $zero, 3
L80024294:
  addiu $v0, $zero, 80
L80024298:
  sw $v0, 16($sp)
L8002429c:
  addiu $v0, $zero, 36
L800242a0:
  sw $v0, 20($sp)
L800242a4:
  addiu $v0, $zero, 32
L800242a8:
  addiu $a1, $zero, 34
L800242ac:
  addiu $a2, $zero, 120
L800242b0:
  addiu $a3, $zero, 88
L800242b4:
  jal L80035c38
L800242b8:
  sw $v0, 24($sp)
L800242bc:
  addu $s0, $v0, $zero
L800242c0:
  jal L80039794
L800242c4:
  sll $zero, $zero, 0x0
L800242c8:
  lw $v0, 48($s0)
L800242cc:
  sll $zero, $zero, 0x0
L800242d0:
  beq $v0, $zero, L800242c0
L800242d4:
  sll $zero, $zero, 0x0
L800242d8:
  j L80024378
L800242dc:
  sll $zero, $zero, 0x0
L800242e0:
  jal L80039794
L800242e4:
  sll $zero, $zero, 0x0
L800242e8:
  lui $v0, 0x800f
L800242ec:
  addiu $a0, $v0, -19932
L800242f0:
  lhu $v0, 52($a0)
L800242f4:
  sll $zero, $zero, 0x0
L800242f8:
  andi $v0, $v0, 0x2000
L800242fc:
  beq $v0, $zero, L80024378
L80024300:
  sll $zero, $zero, 0x0
L80024304:
  jal L80035b7c
L80024308:
  sll $zero, $zero, 0x0
L8002430c:
  lui $v0, 0x800a
L80024310:
  lb $v0, -19635($v0)
L80024314:
  sb $zero, 604($gp)
L80024318:
  beq $v0, $zero, L80024378
L8002431c:
  sll $zero, $zero, 0x0
L80024320:
  lhu $v0, 612($gp)
L80024324:
  sll $zero, $zero, 0x0
L80024328:
  ori $v0, $v0, 0x2000
L8002432c:
  sh $v0, 612($gp)
L80024330:
  j L80024378
L80024334:
  sll $zero, $zero, 0x0
L80024338:
  lui $v1, 0x8009
L8002433c:
  lhu $v0, 818($gp)
L80024340:
  addiu $v1, $v1, 2456
L80024344:
  andi $v0, $v0, 0xf
L80024348:
  sll $v0, $v0, 0x2
L8002434c:
  addu $v0, $v0, $v1
L80024350:
  lw $v0, 0($v0)
L80024354:
  sll $zero, $zero, 0x0
L80024358:
  jalr $ra, $v0
L8002435c:
  sll $zero, $zero, 0x0
L80024360:
  lhu $v0, 818($gp)
L80024364:
  sll $zero, $zero, 0x0
L80024368:
  andi $v0, $v0, 0x8000
L8002436c:
  bne $v0, $zero, L80024378
L80024370:
  sll $zero, $zero, 0x0
L80024374:
  sb $zero, 620($gp)
L80024378:
  lw $ra, 36($sp)
L8002437c:
  lw $s0, 32($sp)
L80024380:
  jr $ra
L80024384:
  addiu $sp, $sp, 40
L80024388:
  addiu $sp, $sp, -24
L8002438c:
  lui $v0, 0x800a
L80024390:
  lb $v0, -19615($v0)
L80024394:
  addu $v1, $zero, $zero
L80024398:
  bgez $v0, L800243b4
L8002439c:
  sw $ra, 16($sp)
L800243a0:
  lb $v0, 816($gp)
L800243a4:
  lbu $v1, 717($gp)
L800243a8:
  bltz $v0, L800243b4
L800243ac:
  sll $zero, $zero, 0x0
L800243b0:
  addu $v1, $v0, $zero
L800243b4:
  beq $v1, $zero, L800243dc
L800243b8:
  sll $zero, $zero, 0x0
L800243bc:
  jal L8003cdf8
L800243c0:
  sll $zero, $zero, 0x0
L800243c4:
  jal L80024200
L800243c8:
  sll $zero, $zero, 0x0
L800243cc:
  jal L8003ce48
L800243d0:
  sll $zero, $zero, 0x0
L800243d4:
  j L800243e4
L800243d8:
  sll $zero, $zero, 0x0
L800243dc:
  jal L80024200
L800243e0:
  sll $zero, $zero, 0x0
L800243e4:
  lw $ra, 16($sp)
L800243e8:
  sll $zero, $zero, 0x0
L800243ec:
  jr $ra
L800243f0:
  addiu $sp, $sp, 24
L800243f4:
  addiu $sp, $sp, -784
L800243f8:
  sw $s0, 744($sp)
L800243fc:
  addu $s0, $a1, $zero
L80024400:
  sw $s2, 752($sp)
L80024404:
  addu $s2, $a2, $zero
L80024408:
  sw $s6, 768($sp)
L8002440c:
  addu $s6, $s0, $zero
L80024410:
  sw $s5, 764($sp)
L80024414:
  addu $s5, $s2, $zero
L80024418:
  sw $ra, 776($sp)
L8002441c:
  sw $s7, 772($sp)
L80024420:
  sw $s4, 760($sp)
L80024424:
  sw $s3, 756($sp)
L80024428:
  bne $a0, $zero, L800244ec
L8002442c:
  sw $s1, 748($sp)
L80024430:
  addiu $s1, $zero, 721
L80024434:
  addiu $v1, $sp, 16
L80024438:
  addu $v0, $v1, $s1
L8002443c:
  addiu $s1, $s1, -1
L80024440:
  bgez $s1, L80024438
L80024444:
  sb $zero, 0($v0)
L80024448:
  lui $v0, 0x8018
L8002444c:
  addiu $s7, $v0, -32296
L80024450:
  addu $s3, $zero, $zero
L80024454:
  addiu $s4, $sp, 16
L80024458:
  jal 0x8008e590
L8002445c:
  sll $zero, $zero, 0x0
L80024460:
  andi $v0, $v0, 0x7ff
L80024464:
  addiu $a1, $v0, 1
L80024468:
  addu $a0, $zero, $zero
L8002446c:
  addu $s1, $a0, $zero
L80024470:
  addu $v1, $s7, $zero
L80024474:
  lhu $v0, 0($v1)
L80024478:
  sll $zero, $zero, 0x0
L8002447c:
  addu $a0, $a0, $v0
L80024480:
  slt $v0, $a0, $a1
L80024484:
  bne $v0, $zero, L800244c8
L80024488:
  sll $zero, $zero, 0x0
L8002448c:
  addu $v1, $s4, $s1
L80024490:
  lbu $v0, 0($v1)
L80024494:
  sll $zero, $zero, 0x0
L80024498:
  sltiu $v0, $v0, 3
L8002449c:
  beq $v0, $zero, L800244d8
L800244a0:
  addiu $v0, $s1, 1
L800244a4:
  sh $v0, 0($s0)
L800244a8:
  sb $s3, 0($s2)
L800244ac:
  addiu $s3, $s3, 1
L800244b0:
  addiu $s0, $s0, 2
L800244b4:
  lbu $v0, 0($v1)
L800244b8:
  addiu $s2, $s2, 1
L800244bc:
  addiu $v0, $v0, 1
L800244c0:
  j L800244d8
L800244c4:
  sb $v0, 0($v1)
L800244c8:
  addiu $s1, $s1, 1
L800244cc:
  slti $v0, $s1, 720
L800244d0:
  bne $v0, $zero, L80024474
L800244d4:
  addiu $v1, $v1, 2
L800244d8:
  slti $v0, $s3, 40
L800244dc:
  bne $v0, $zero, L80024458
L800244e0:
  addu $s1, $zero, $zero
L800244e4:
  j L80024518
L800244e8:
  sll $zero, $zero, 0x0
L800244ec:
  addu $s1, $zero, $zero
L800244f0:
  lhu $v0, 0($a0)
L800244f4:
  addiu $a0, $a0, 2
L800244f8:
  sh $v0, 0($s0)
L800244fc:
  sb $s1, 0($s2)
L80024500:
  addiu $s2, $s2, 1
L80024504:
  addiu $s1, $s1, 1
L80024508:
  slti $v0, $s1, 40
L8002450c:
  bne $v0, $zero, L800244f0
L80024510:
  addiu $s0, $s0, 2
L80024514:
  addu $s1, $zero, $zero
L80024518:
  jal L800358fc
L8002451c:
  addiu $a0, $zero, 40
L80024520:
  addiu $a0, $zero, 40
L80024524:
  jal L800358fc
L80024528:
  addu $s0, $v0, $zero
L8002452c:
  sll $a1, $s0, 0x1
L80024530:
  addu $a1, $a1, $s6
L80024534:
  sll $a0, $v0, 0x1
L80024538:
  addu $a0, $a0, $s6
L8002453c:
  addu $s0, $s5, $s0
L80024540:
  lhu $a2, 0($a1)
L80024544:
  lhu $v1, 0($a0)
L80024548:
  addu $v0, $s5, $v0
L8002454c:
  sh $v1, 0($a1)
L80024550:
  sh $a2, 0($a0)
L80024554:
  lbu $a2, 0($s0)
L80024558:
  lbu $v1, 0($v0)
L8002455c:
  addiu $s1, $s1, 1
L80024560:
  sb $v1, 0($s0)
L80024564:
  sb $a2, 0($v0)
L80024568:
  slti $v0, $s1, 160
L8002456c:
  bne $v0, $zero, L80024518
L80024570:
  sll $zero, $zero, 0x0
L80024574:
  lw $ra, 776($sp)
L80024578:
  lw $s7, 772($sp)
L8002457c:
  lw $s6, 768($sp)
L80024580:
  lw $s5, 764($sp)
L80024584:
  lw $s4, 760($sp)
L80024588:
  lw $s3, 756($sp)
L8002458c:
  lw $s2, 752($sp)
L80024590:
  lw $s1, 748($sp)
L80024594:
  lw $s0, 744($sp)
L80024598:
  jr $ra
L8002459c:
  addiu $sp, $sp, 784
L800245a0:
  addiu $sp, $sp, -32
L800245a4:
  sw $s1, 20($sp)
L800245a8:
  addu $s1, $a1, $zero
L800245ac:
  sw $s0, 16($sp)
L800245b0:
  lui $s0, 0x8017
L800245b4:
  addiu $s0, $s0, 32744
L800245b8:
  addu $a1, $s0, $zero
L800245bc:
  sw $ra, 24($sp)
L800245c0:
  jal L800243f4
L800245c4:
  addiu $a2, $s0, -84
L800245c8:
  addu $a0, $s1, $zero
L800245cc:
  addiu $a1, $s0, 80
L800245d0:
  jal L800243f4
L800245d4:
  addiu $a2, $s0, -44
L800245d8:
  lw $ra, 24($sp)
L800245dc:
  lw $s1, 20($sp)
L800245e0:
  lw $s0, 16($sp)
L800245e4:
  jr $ra
L800245e8:
  addiu $sp, $sp, 32
L800245ec:
  addu $a2, $a0, $zero
L800245f0:
  lw $a3, 56($a2)
L800245f4:
  bne $a1, $zero, L80024640
L800245f8:
  addiu $t0, $zero, 1
L800245fc:
  lui $a0, 0xffdc
L80024600:
  lhu $v1, 0($a3)
L80024604:
  addiu $v0, $zero, 2048
L80024608:
  sw $v0, 28($a2)
L8002460c:
  lui $v0, 0x800a
L80024610:
  lw $v0, -20236($v0)
L80024614:
  ori $a0, $a0, 0xffff
L80024618:
  sh $v1, 48($a2)
L8002461c:
  lw $v1, 60($a2)
L80024620:
  and $v0, $v0, $a0
L80024624:
  lui $at, 0x800a
L80024628:
  sw $v0, -20236($at)
L8002462c:
  addiu $v0, $zero, 1
L80024630:
  sb $v0, 70($a2)
L80024634:
  sw $v1, 12($a2)
L80024638:
  jr $ra
L8002463c:
  sw $v1, 8($a2)
L80024640:
  bne $a1, $t0, L8002465c
L80024644:
  sll $zero, $zero, 0x0
L80024648:
  lw $v0, 60($a2)
L8002464c:
  addiu $a3, $a3, 2
L80024650:
  sw $a3, 56($a2)
L80024654:
  addiu $v0, $v0, 1408
L80024658:
  sw $v0, 60($a2)
L8002465c:
  lhu $v0, 48($a2)
L80024660:
  sll $zero, $zero, 0x0
L80024664:
  addiu $v0, $v0, 1
L80024668:
  sh $v0, 48($a2)
L8002466c:
  andi $v1, $v0, 0xffff
L80024670:
  lh $v0, 0($a3)
L80024674:
  sll $zero, $zero, 0x0
L80024678:
  bne $v1, $v0, L800246bc
L8002467c:
  lui $a0, 0xfffc
L80024680:
  lui $a0, 0xffdc
L80024684:
  addiu $v0, $zero, 2048
L80024688:
  sw $v0, 28($a2)
L8002468c:
  lui $v0, 0x800a
L80024690:
  lw $v0, -20236($v0)
L80024694:
  lw $v1, 60($a2)
L80024698:
  ori $a0, $a0, 0xffff
L8002469c:
  sw $t0, 64($a2)
L800246a0:
  and $v0, $v0, $a0
L800246a4:
  lui $at, 0x800a
L800246a8:
  sw $v0, -20236($at)
L800246ac:
  sw $v1, 12($a2)
L800246b0:
  sw $v1, 8($a2)
L800246b4:
  jr $ra
L800246b8:
  sb $t0, 70($a2)
L800246bc:
  ori $a0, $a0, 0xffff
L800246c0:
  addiu $v0, $zero, 2048
L800246c4:
  sw $v0, 28($a2)
L800246c8:
  lui $v0, 0x800a
L800246cc:
  lw $v0, -20236($v0)
L800246d0:
  addiu $v1, $zero, 2
L800246d4:
  sw $v1, 64($a2)
L800246d8:
  and $v0, $v0, $a0
L800246dc:
  lui $at, 0x800a
L800246e0:
  sw $v0, -20236($at)
L800246e4:
  lui $v0, 0x800a
L800246e8:
  lw $v0, -20236($v0)
L800246ec:
  lui $v1, 0x20
L800246f0:
  or $v0, $v0, $v1
L800246f4:
  lui $at, 0x800a
L800246f8:
  sw $v0, -20236($at)
L800246fc:
  jr $ra
L80024700:
  sb $t0, 70($a2)
L80024704:
  lh $a0, 0($a0)
L80024708:
  lh $v1, 0($a1)
L8002470c:
  sll $zero, $zero, 0x0
L80024710:
  beq $a0, $v1, L80024728
L80024714:
  slt $v1, $v1, $a0
L80024718:
  bne $v1, $zero, L8002472c
L8002471c:
  addiu $v0, $zero, 1
L80024720:
  jr $ra
L80024724:
  addiu $v0, $zero, -1
L80024728:
  addu $v0, $zero, $zero
L8002472c:
  jr $ra
L80024730:
  sll $zero, $zero, 0x0
L80024734:
  addiu $sp, $sp, -40
L80024738:
  lui $v0, 0x8018
L8002473c:
  sw $s0, 32($sp)
L80024740:
  addiu $s0, $v0, -32628
L80024744:
  addu $a0, $s0, $zero
L80024748:
  addiu $a1, $s0, -164
L8002474c:
  sw $ra, 36($sp)
L80024750:
  jal L800356a0
L80024754:
  addiu $a2, $zero, 160
L80024758:
  addu $a0, $s0, $zero
L8002475c:
  addiu $a1, $zero, 80
L80024760:
  addiu $a2, $zero, 2
L80024764:
  lui $a3, 0x8002
L80024768:
  jal 0x8008e400
L8002476c:
  addiu $a3, $a3, 18180
L80024770:
  addiu $a2, $s0, 164
L80024774:
  addu $t0, $zero, $zero
L80024778:
  addu $v1, $t0, $zero
L8002477c:
  lhu $v0, 0($s0)
L80024780:
  sll $zero, $zero, 0x0
L80024784:
  beq $v0, $t0, L80024798
L80024788:
  sll $zero, $zero, 0x0
L8002478c:
  sh $v0, 0($a2)
L80024790:
  addu $t0, $v0, $zero
L80024794:
  addiu $a2, $a2, 2
L80024798:
  addiu $v1, $v1, 1
L8002479c:
  slti $v0, $v1, 80
L800247a0:
  bne $v0, $zero, L8002477c
L800247a4:
  addiu $s0, $s0, 2
L800247a8:
  lui $v1, 0x1
L800247ac:
  ori $v1, $v1, 0x8000
L800247b0:
  addu $a0, $zero, $zero
L800247b4:
  addu $a1, $a0, $zero
L800247b8:
  ori $v0, $zero, 0xffff
L800247bc:
  lui $s0, 0x8016
L800247c0:
  addiu $s0, $s0, -15324
L800247c4:
  addu $v1, $s0, $v1
L800247c8:
  sh $v0, 0($a2)
L800247cc:
  lui $v0, 0x8002
L800247d0:
  lhu $a3, 15628($v1)
L800247d4:
  addiu $v0, $v0, 17900
L800247d8:
  sw $v0, 16($sp)
L800247dc:
  sw $zero, 20($sp)
L800247e0:
  sw $zero, 24($sp)
L800247e4:
  addiu $a2, $a3, -1
L800247e8:
  subu $a3, $t0, $a3
L800247ec:
  jal 0x80014eec
L800247f0:
  addiu $a3, $a3, 1
L800247f4:
  lui $v1, 0x8018
L800247f8:
  lw $a0, 44($v0)
L800247fc:
  addiu $v1, $v1, -32464
L80024800:
  sw $v1, 56($v0)
L80024804:
  sw $s0, 60($v0)
L80024808:
  lw $ra, 36($sp)
L8002480c:
  lw $s0, 32($sp)
L80024810:
  ori $a0, $a0, 0x10
L80024814:
  lui $at, 0x800a
L80024818:
  sw $a0, -20236($at)
L8002481c:
  jr $ra
L80024820:
  addiu $sp, $sp, 40
L80024824:
  addiu $sp, $sp, -48
L80024828:
  lui $v0, 0x8019
L8002482c:
  sw $s4, 32($sp)
L80024830:
  addiu $s4, $v0, -15656
L80024834:
  lui $v0, 0x801a
L80024838:
  sw $s2, 24($sp)
L8002483c:
  addiu $s2, $v0, 32288
L80024840:
  sw $s1, 20($sp)
L80024844:
  addu $s1, $zero, $zero
L80024848:
  sw $s5, 36($sp)
L8002484c:
  lui $s5, 0x1
L80024850:
  ori $s5, $s5, 0x8000
L80024854:
  lui $v0, 0x8016
L80024858:
  sw $s6, 40($sp)
L8002485c:
  addiu $s6, $v0, -15324
L80024860:
  sw $s3, 28($sp)
L80024864:
  addu $s3, $s6, $zero
L80024868:
  sw $s0, 16($sp)
L8002486c:
  addiu $s0, $s2, 3
L80024870:
  sw $ra, 44($sp)
L80024874:
  addu $a1, $s6, $zero
L80024878:
  addu $v0, $s3, $s5
L8002487c:
  lui $a0, 0x8018
L80024880:
  addiu $a0, $a0, -32464
L80024884:
  lhu $v1, 15300($v0)
L80024888:
  addu $v0, $s1, $s6
L8002488c:
  addu $v0, $v0, $s5
L80024890:
  sh $v1, 0($s2)
L80024894:
  sll $v1, $v1, 0x10
L80024898:
  lbu $v0, 15216($v0)
L8002489c:
  sra $v1, $v1, 0x10
L800248a0:
  sb $s1, -1($s0)
L800248a4:
  sb $s1, 0($s0)
L800248a8:
  sb $v0, 1($s0)
L800248ac:
  lhu $v0, 0($a0)
L800248b0:
  sll $zero, $zero, 0x0
L800248b4:
  beq $v0, $v1, L800248c4
L800248b8:
  addiu $a0, $a0, 2
L800248bc:
  j L800248ac
L800248c0:
  addiu $a1, $a1, 1408
L800248c4:
  addu $a0, $s4, $zero
L800248c8:
  jal L800356a0
L800248cc:
  addiu $a2, $zero, 1408
L800248d0:
  addiu $s4, $s4, 1408
L800248d4:
  addiu $s0, $s0, 6
L800248d8:
  addiu $s2, $s2, 6
L800248dc:
  addiu $s1, $s1, 1
L800248e0:
  slti $v0, $s1, 80
L800248e4:
  bne $v0, $zero, L80024874
L800248e8:
  addiu $s3, $s3, 2
L800248ec:
  lw $ra, 44($sp)
L800248f0:
  lw $s6, 40($sp)
L800248f4:
  lw $s5, 36($sp)
L800248f8:
  lw $s4, 32($sp)
L800248fc:
  lw $s3, 28($sp)
L80024900:
  lw $s2, 24($sp)
L80024904:
  lw $s1, 20($sp)
L80024908:
  lw $s0, 16($sp)
L8002490c:
  jr $ra
L80024910:
  addiu $sp, $sp, 48
L80024914:
  addiu $sp, $sp, -24
L80024918:
  sw $s0, 16($sp)
L8002491c:
  addu $s0, $a0, $zero
L80024920:
  sw $ra, 20($sp)
L80024924:
  lhu $v0, 22($s0)
L80024928:
  lw $a0, 0($s0)
L8002492c:
  andi $v0, $v0, 0x7fff
L80024930:
  beq $a0, $zero, L80024944
L80024934:
  sh $v0, 22($s0)
L80024938:
  jal 0x8004036c
L8002493c:
  sll $zero, $zero, 0x0
L80024940:
  sw $zero, 0($s0)
L80024944:
  lw $ra, 20($sp)
L80024948:
  lw $s0, 16($sp)
L8002494c:
  jr $ra
L80024950:
  addiu $sp, $sp, 24
L80024954:
  addiu $sp, $sp, -24
L80024958:
  sw $s0, 16($sp)
L8002495c:
  sw $ra, 20($sp)
L80024960:
  jal L80024914
L80024964:
  addu $s0, $a0, $zero
L80024968:
  sh $zero, 22($s0)
L8002496c:
  lw $ra, 20($sp)
L80024970:
  lw $s0, 16($sp)
L80024974:
  jr $ra
L80024978:
  addiu $sp, $sp, 24
L8002497c:
  lui $v0, 0x800a
L80024980:
  lbu $v0, -19612($v0)
L80024984:
  sll $zero, $zero, 0x0
L80024988:
  beq $v0, $zero, L8002499c
L8002498c:
  addu $v1, $a0, $zero
L80024990:
  slti $v0, $v1, 20
L80024994:
  bne $v0, $zero, L800249a4
L80024998:
  lui $a0, 0x8009
L8002499c:
  jr $ra
L800249a0:
  addu $v0, $zero, $zero
L800249a4:
  addiu $a0, $a0, 2516
L800249a8:
  sll $v0, $v1, 0x1
L800249ac:
  addu $v0, $v0, $v1
L800249b0:
  sll $v0, $v0, 0x1
L800249b4:
  lui $v1, 0x800a
L800249b8:
  lbu $v1, -19612($v1)
L800249bc:
  addiu $v0, $v0, -1
L800249c0:
  addu $v1, $v1, $v0
L800249c4:
  addu $v1, $v1, $a0
L800249c8:
  lb $v1, 0($v1)
L800249cc:
  sll $zero, $zero, 0x0
L800249d0:
  sll $v0, $v1, 0x2
L800249d4:
  addu $v0, $v0, $v1
L800249d8:
  jr $ra
L800249dc:
  sll $v0, $v0, 0x1
L800249e0:
  addiu $sp, $sp, -40
L800249e4:
  andi $v0, $a0, 0x80
L800249e8:
  sw $ra, 36($sp)
L800249ec:
  sw $s4, 32($sp)
L800249f0:
  sw $s3, 28($sp)
L800249f4:
  sw $s2, 24($sp)
L800249f8:
  sw $s1, 20($sp)
L800249fc:
  beq $v0, $zero, L80024a10
L80024a00:
  sw $s0, 16($sp)
L80024a04:
  andi $v0, $a0, 0x7f
L80024a08:
  j L80024a14
L80024a0c:
  addiu $s4, $v0, 15
L80024a10:
  addu $s4, $a0, $zero
L80024a14:
  sll $v1, $s4, 0x3
L80024a18:
  subu $v1, $v1, $s4
L80024a1c:
  sll $v1, $v1, 0x2
L80024a20:
  lui $v0, 0x801a
L80024a24:
  addiu $v0, $v0, 31448
L80024a28:
  addu $s3, $v1, $v0
L80024a2c:
  ori $v0, $zero, 0x8000
L80024a30:
  sh $v0, 22($s3)
L80024a34:
  slti $v0, $a0, 15
L80024a38:
  bne $v0, $zero, L80024a54
L80024a3c:
  andi $v0, $a1, 0x80
L80024a40:
  slti $v0, $a1, 40
L80024a44:
  beq $v0, $zero, L80024a54
L80024a48:
  andi $v0, $a1, 0x80
L80024a4c:
  addiu $a1, $a1, 40
L80024a50:
  andi $v0, $a1, 0x80
L80024a54:
  beq $v0, $zero, L80024a60
L80024a58:
  andi $v0, $a1, 0x7f
L80024a5c:
  addiu $a1, $v0, 40
L80024a60:
  lui $a0, 0x4
L80024a64:
  ori $a0, $a0, 0x8000
L80024a68:
  sll $v1, $a1, 0x1
L80024a6c:
  addu $v1, $v1, $a1
L80024a70:
  sll $v1, $v1, 0x1
L80024a74:
  lui $v0, 0x801a
L80024a78:
  addiu $v0, $v0, 32288
L80024a7c:
  addu $v0, $v1, $v0
L80024a80:
  sw $v0, 4($s3)
L80024a84:
  lui $v0, 0x8016
L80024a88:
  addiu $v0, $v0, -15324
L80024a8c:
  addu $v1, $v1, $v0
L80024a90:
  addu $v1, $v1, $a0
L80024a94:
  lui $a0, 0x801d
L80024a98:
  sb $s4, 24($s3)
L80024a9c:
  lhu $v0, 14844($v1)
L80024aa0:
  addiu $a0, $a0, 16964
L80024aa4:
  sh $v0, 12($s3)
L80024aa8:
  sll $v0, $v0, 0x10
L80024aac:
  sra $v0, $v0, 0xe
L80024ab0:
  addu $v0, $v0, $a0
L80024ab4:
  lw $v0, -4($v0)
L80024ab8:
  sll $zero, $zero, 0x0
L80024abc:
  andi $v0, $v0, 0x1ff
L80024ac0:
  sll $v1, $v0, 0x2
L80024ac4:
  addu $v1, $v1, $v0
L80024ac8:
  lh $v0, 12($s3)
L80024acc:
  sll $v1, $v1, 0x1
L80024ad0:
  sh $v1, 14($s3)
L80024ad4:
  addiu $v0, $v0, -1
L80024ad8:
  sll $v0, $v0, 0x2
L80024adc:
  addu $v0, $v0, $a0
L80024ae0:
  lw $v0, 0($v0)
L80024ae4:
  sll $s1, $s4, 0x1
L80024ae8:
  sh $zero, 18($s3)
L80024aec:
  sra $v0, $v0, 0x9
L80024af0:
  andi $v0, $v0, 0x1ff
L80024af4:
  sll $v1, $v0, 0x2
L80024af8:
  addu $v1, $v1, $v0
L80024afc:
  lh $v0, 12($s3)
L80024b00:
  sll $v1, $v1, 0x1
L80024b04:
  sh $v1, 16($s3)
L80024b08:
  addiu $v0, $v0, -1
L80024b0c:
  sll $v0, $v0, 0x2
L80024b10:
  addu $v0, $v0, $a0
L80024b14:
  lw $a0, 0($v0)
L80024b18:
  addiu $s1, $s1, 1
L80024b1c:
  sra $a0, $a0, 0x1a
L80024b20:
  jal L8002497c
L80024b24:
  andi $a0, $a0, 0x1f
L80024b28:
  lui $a2, 0x6666
L80024b2c:
  ori $a2, $a2, 0x6667
L80024b30:
  lui $s2, 0x8017
L80024b34:
  addiu $s2, $s2, 32420
L80024b38:
  sll $a0, $s4, 0x4
L80024b3c:
  addu $a0, $a0, $s2
L80024b40:
  addiu $a1, $zero, 20
L80024b44:
  sh $v0, 20($s3)
L80024b48:
  lw $v0, 4($s3)
L80024b4c:
  mult $s4, $a2
L80024b50:
  lbu $v1, 3($v0)
L80024b54:
  addiu $v0, $zero, 32
L80024b58:
  sh $a1, 4($a0)
L80024b5c:
  lui $a1, 0x8019
L80024b60:
  addiu $a1, $a1, -15656
L80024b64:
  sh $v0, 6($a0)
L80024b68:
  sra $v0, $s4, 0x1f
L80024b6c:
  sll $s0, $v1, 0x1
L80024b70:
  addu $s0, $s0, $v1
L80024b74:
  sll $s0, $s0, 0x2
L80024b78:
  subu $s0, $s0, $v1
L80024b7c:
  sll $s0, $s0, 0x7
L80024b80:
  addu $a1, $s0, $a1
L80024b84:
  mfhi $a3
L80024b88:
  sra $a2, $a3, 0x1
L80024b8c:
  subu $a2, $a2, $v0
L80024b90:
  sll $v1, $a2, 0x2
L80024b94:
  addu $v1, $v1, $a2
L80024b98:
  subu $v1, $s4, $v1
L80024b9c:
  sll $v0, $v1, 0x2
L80024ba0:
  addu $v0, $v0, $v1
L80024ba4:
  sll $v0, $v0, 0x2
L80024ba8:
  addiu $v0, $v0, 896
L80024bac:
  sll $a2, $a2, 0x5
L80024bb0:
  sh $v0, 0($a0)
L80024bb4:
  jal 0x8007f978
L80024bb8:
  sh $a2, 2($a0)
L80024bbc:
  sll $s1, $s1, 0x3
L80024bc0:
  addu $s1, $s1, $s2
L80024bc4:
  addu $a0, $s1, $zero
L80024bc8:
  lui $a1, 0x8019
L80024bcc:
  addiu $a1, $a1, -14376
L80024bd0:
  addu $a1, $s0, $a1
L80024bd4:
  addiu $v0, $zero, 896
L80024bd8:
  sh $v0, 0($a0)
L80024bdc:
  addiu $v0, $s4, 224
L80024be0:
  sh $v0, 2($a0)
L80024be4:
  addiu $v0, $zero, 64
L80024be8:
  sh $v0, 4($a0)
L80024bec:
  addiu $v0, $zero, 1
L80024bf0:
  jal 0x8007f978
L80024bf4:
  sh $v0, 6($a0)
L80024bf8:
  addu $v0, $s3, $zero
L80024bfc:
  lw $ra, 36($sp)
L80024c00:
  lw $s4, 32($sp)
L80024c04:
  lw $s3, 28($sp)
L80024c08:
  lw $s2, 24($sp)
L80024c0c:
  lw $s1, 20($sp)
L80024c10:
  lw $s0, 16($sp)
L80024c14:
  jr $ra
L80024c18:
  addiu $sp, $sp, 40
L80024c1c:
  addiu $sp, $sp, -32
L80024c20:
  sw $s0, 16($sp)
L80024c24:
  addu $s0, $a0, $zero
L80024c28:
  sw $s1, 20($sp)
L80024c2c:
  addu $s1, $a1, $zero
L80024c30:
  sw $s2, 24($sp)
L80024c34:
  sw $ra, 28($sp)
L80024c38:
  jal 0x8004002c
L80024c3c:
  addu $s2, $a2, $zero
L80024c40:
  addu $a0, $v0, $zero
L80024c44:
  jal 0x800400ac
L80024c48:
  addu $a1, $zero, $zero
L80024c4c:
  addu $a0, $v0, $zero
L80024c50:
  addiu $v0, $zero, -24
L80024c54:
  lui $v1, 0x100
L80024c58:
  addiu $s0, $s0, -1
L80024c5c:
  sh $v0, 50($a0)
L80024c60:
  lw $v0, 4($a0)
L80024c64:
  sll $s0, $s0, 0x2
L80024c68:
  sh $s1, 48($a0)
L80024c6c:
  sh $s2, 52($a0)
L80024c70:
  sb $zero, 103($a0)
L80024c74:
  sb $zero, 105($a0)
L80024c78:
  or $v0, $v0, $v1
L80024c7c:
  sw $v0, 4($a0)
L80024c80:
  lui $v0, 0x801d
L80024c84:
  addiu $v0, $v0, 16964
L80024c88:
  addu $s0, $s0, $v0
L80024c8c:
  lui $v0, 0x8001
L80024c90:
  lw $v1, 0($s0)
L80024c94:
  addiu $v0, $v0, 26488
L80024c98:
  sw $v0, 16($a0)
L80024c9c:
  addiu $v0, $zero, 192
L80024ca0:
  sb $zero, 92($a0)
L80024ca4:
  sb $v0, 93($a0)
L80024ca8:
  sh $zero, 66($a0)
L80024cac:
  sra $v1, $v1, 0x1a
L80024cb0:
  andi $v1, $v1, 0x1f
L80024cb4:
  slti $v0, $v1, 20
L80024cb8:
  bne $v0, $zero, L80024d18
L80024cbc:
  sb $v1, 104($a0)
L80024cc0:
  addiu $v0, $zero, 56
L80024cc4:
  sb $v0, 92($a0)
L80024cc8:
  addiu $v0, $zero, 21
L80024ccc:
  beq $v1, $v0, L80024d08
L80024cd0:
  slti $v0, $v1, 22
L80024cd4:
  beq $v0, $zero, L80024cec
L80024cd8:
  addiu $v0, $zero, 20
L80024cdc:
  beq $v1, $v0, L80024d14
L80024ce0:
  addiu $v0, $zero, 1
L80024ce4:
  j L80024d18
L80024ce8:
  sll $zero, $zero, 0x0
L80024cec:
  addiu $v0, $zero, 22
L80024cf0:
  beq $v1, $v0, L80024d10
L80024cf4:
  addiu $v0, $zero, 23
L80024cf8:
  bne $v1, $v0, L80024d18
L80024cfc:
  addiu $v0, $zero, 1
L80024d00:
  j L80024d18
L80024d04:
  sh $v0, 66($a0)
L80024d08:
  j L80024d14
L80024d0c:
  addiu $v0, $zero, 2
L80024d10:
  addiu $v0, $zero, 3
L80024d14:
  sh $v0, 66($a0)
L80024d18:
  lw $ra, 28($sp)
L80024d1c:
  lw $s2, 24($sp)
L80024d20:
  lw $s1, 20($sp)
L80024d24:
  lw $s0, 16($sp)
L80024d28:
  addu $v0, $a0, $zero
L80024d2c:
  jr $ra
L80024d30:
  addiu $sp, $sp, 32
L80024d34:
  addiu $sp, $sp, -32
L80024d38:
  sw $s0, 16($sp)
L80024d3c:
  addu $s0, $a0, $zero
L80024d40:
  sw $ra, 24($sp)
L80024d44:
  jal L800249e0
L80024d48:
  sw $s1, 20($sp)
L80024d4c:
  addu $s1, $v0, $zero
L80024d50:
  andi $v0, $s0, 0x80
L80024d54:
  beq $v0, $zero, L80024d60
L80024d58:
  andi $v0, $s0, 0x7f
L80024d5c:
  addiu $s0, $v0, 15
L80024d60:
  lui $a0, 0x4
L80024d64:
  ori $a0, $a0, 0x8000
L80024d68:
  lui $v1, 0x8016
L80024d6c:
  addiu $v1, $v1, -15324
L80024d70:
  sll $v0, $s0, 0x3
L80024d74:
  subu $v0, $v0, $s0
L80024d78:
  sll $v0, $v0, 0x2
L80024d7c:
  addu $v0, $v0, $v1
L80024d80:
  addu $v0, $v0, $a0
L80024d84:
  lui $v1, 0x8009
L80024d88:
  addiu $v1, $v1, 2208
L80024d8c:
  sll $a2, $s0, 0x2
L80024d90:
  addu $a2, $a2, $v1
L80024d94:
  lw $v0, 14008($v0)
L80024d98:
  lh $a1, 0($a2)
L80024d9c:
  lh $a2, 2($a2)
L80024da0:
  lh $a0, 0($v0)
L80024da4:
  jal L80024c1c
L80024da8:
  sll $zero, $zero, 0x0
L80024dac:
  sw $v0, 0($s1)
L80024db0:
  sb $s0, 106($v0)
L80024db4:
  lw $ra, 24($sp)
L80024db8:
  lw $s1, 20($sp)
L80024dbc:
  lw $s0, 16($sp)
L80024dc0:
  jr $ra
L80024dc4:
  addiu $sp, $sp, 32
L80024dc8:
  addiu $v0, $zero, 29296
L80024dcc:
  lui $at, 0x800a
L80024dd0:
  sh $v0, -19606($at)
L80024dd4:
  addiu $v0, $zero, 29312
L80024dd8:
  lui $at, 0x800a
L80024ddc:
  sh $v0, -19596($at)
L80024de0:
  addiu $v0, $zero, 3
L80024de4:
  lui $at, 0x800a
L80024de8:
  sb $a0, -19616($at)
L80024dec:
  lui $at, 0x800a
L80024df0:
  sb $a1, -19615($at)
L80024df4:
  lui $at, 0x800a
L80024df8:
  sh $a2, -19600($at)
L80024dfc:
  lui $at, 0x800a
L80024e00:
  sh $a3, -19598($at)
L80024e04:
  lui $at, 0x800a
L80024e08:
  sb $zero, -19612($at)
L80024e0c:
  lui $at, 0x800a
L80024e10:
  sb $zero, -19607($at)
L80024e14:
  lui $at, 0x800a
L80024e18:
  sb $v0, -19860($at)
L80024e1c:
  jr $ra
L80024e20:
  sll $zero, $zero, 0x0
L80024e24:
  lhu $v1, 792($gp)
L80024e28:
  sll $zero, $zero, 0x0
L80024e2c:
  andi $v0, $v1, 0x80
L80024e30:
  beq $v0, $zero, L80024e40
L80024e34:
  ori $v0, $v1, 0x80
L80024e38:
  jr $ra
L80024e3c:
  addiu $v0, $zero, 1
L80024e40:
  sh $v0, 792($gp)
L80024e44:
  jr $ra
L80024e48:
  addu $v0, $zero, $zero
L80024e4c:
  sh $zero, 792($gp)
L80024e50:
  jr $ra
L80024e54:
  sll $zero, $zero, 0x0
L80024e58:
  addiu $sp, $sp, -48
L80024e5c:
  sw $ra, 44($sp)
L80024e60:
  sw $s2, 40($sp)
L80024e64:
  sw $s1, 36($sp)
L80024e68:
  jal L80024e24
L80024e6c:
  sw $s0, 32($sp)
L80024e70:
  bne $v0, $zero, L80024ec8
L80024e74:
  addiu $a0, $zero, 10
L80024e78:
  lw $v1, 704($gp)
L80024e7c:
  sll $zero, $zero, 0x0
L80024e80:
  lbu $v0, 10($v1)
L80024e84:
  sll $zero, $zero, 0x0
L80024e88:
  addiu $v0, $v0, 1
L80024e8c:
  sb $v0, 10($v1)
L80024e90:
  lbu $v0, 714($gp)
L80024e94:
  sll $zero, $zero, 0x0
L80024e98:
  addiu $v0, $v0, -73
L80024e9c:
  lui $at, 0x800a
L80024ea0:
  sb $v0, -19612($at)
L80024ea4:
  andi $s0, $v0, 0xff
L80024ea8:
  jal L8002c604
L80024eac:
  addiu $s0, $s0, -1
L80024eb0:
  addiu $a0, $zero, 19
L80024eb4:
  sw $v0, 628($gp)
L80024eb8:
  jal L8003fee0
L80024ebc:
  sh $s0, 26($v0)
L80024ec0:
  j L80025010
L80024ec4:
  sll $zero, $zero, 0x0
L80024ec8:
  lhu $a3, 792($gp)
L80024ecc:
  sll $zero, $zero, 0x0
L80024ed0:
  andi $v0, $a3, 0x40
L80024ed4:
  bne $v0, $zero, L80024f48
L80024ed8:
  andi $v0, $a3, 0x20
L80024edc:
  lw $v0, 628($gp)
L80024ee0:
  sll $zero, $zero, 0x0
L80024ee4:
  lbu $v0, 29($v0)
L80024ee8:
  sll $zero, $zero, 0x0
L80024eec:
  beq $v0, $zero, L80025010
L80024ef0:
  lui $a2, 0x100
L80024ef4:
  ori $a2, $a2, 0x280
L80024ef8:
  addu $a0, $zero, $zero
L80024efc:
  addu $a1, $a0, $zero
L80024f00:
  ori $v0, $a3, 0x40
L80024f04:
  lui $v1, 0x800a
L80024f08:
  lbu $v1, -19612($v1)
L80024f0c:
  addiu $a3, $zero, 16
L80024f10:
  sh $v0, 792($gp)
L80024f14:
  sw $zero, 16($sp)
L80024f18:
  sw $zero, 20($sp)
L80024f1c:
  sw $a2, 24($sp)
L80024f20:
  sll $a2, $v1, 0x4
L80024f24:
  subu $a2, $a2, $v1
L80024f28:
  sll $a2, $a2, 0x2
L80024f2c:
  subu $a2, $a2, $v1
L80024f30:
  sll $a2, $a2, 0x2
L80024f34:
  subu $a2, $a2, $v1
L80024f38:
  jal 0x80014e1c
L80024f3c:
  addiu $a2, $a2, 6033
L80024f40:
  j L80025010
L80024f44:
  sll $zero, $zero, 0x0
L80024f48:
  bne $v0, $zero, L80024fa4
L80024f4c:
  lui $v0, 0x200
L80024f50:
  ori $v0, $v0, 0x30
L80024f54:
  lui $v1, 0x800a
L80024f58:
  lw $v1, -20236($v1)
L80024f5c:
  lui $a0, 0x800a
L80024f60:
  lw $a0, -20172($a0)
L80024f64:
  and $v1, $v1, $v0
L80024f68:
  or $v1, $v1, $a0
L80024f6c:
  bne $v1, $zero, L80025010
L80024f70:
  addiu $v0, $zero, -2
L80024f74:
  lw $a0, 780($gp)
L80024f78:
  lui $a1, 0x800a
L80024f7c:
  lbu $a1, -19612($a1)
L80024f80:
  lw $v1, 628($gp)
L80024f84:
  jal 0x80040410
L80024f88:
  sh $v0, 26($v1)
L80024f8c:
  lhu $v0, 792($gp)
L80024f90:
  sll $zero, $zero, 0x0
L80024f94:
  ori $v0, $v0, 0x20
L80024f98:
  sh $v0, 792($gp)
L80024f9c:
  j L80025010
L80024fa0:
  sll $zero, $zero, 0x0
L80024fa4:
  lw $v0, 628($gp)
L80024fa8:
  sll $zero, $zero, 0x0
L80024fac:
  lbu $v0, 28($v0)
L80024fb0:
  sll $zero, $zero, 0x0
L80024fb4:
  andi $v0, $v0, 0x80
L80024fb8:
  bne $v0, $zero, L80025010
L80024fbc:
  lui $v0, 0x801a
L80024fc0:
  addiu $s1, $v0, 31448
L80024fc4:
  addu $s2, $zero, $zero
L80024fc8:
  addiu $s0, $s1, 20
L80024fcc:
  lhu $v0, 2($s0)
L80024fd0:
  sll $zero, $zero, 0x0
L80024fd4:
  andi $v0, $v0, 0x8000
L80024fd8:
  beq $v0, $zero, L80024ff8
L80024fdc:
  sll $zero, $zero, 0x0
L80024fe0:
  lw $v0, 0($s1)
L80024fe4:
  sll $zero, $zero, 0x0
L80024fe8:
  lbu $a0, 104($v0)
L80024fec:
  jal L8002497c
L80024ff0:
  sll $zero, $zero, 0x0
L80024ff4:
  sh $v0, 0($s0)
L80024ff8:
  addiu $s2, $s2, 1
L80024ffc:
  addiu $s0, $s0, 28
L80025000:
  slti $v0, $s2, 30
L80025004:
  bne $v0, $zero, L80024fcc
L80025008:
  addiu $s1, $s1, 28
L8002500c:
  sh $zero, 792($gp)
L80025010:
  lw $ra, 44($sp)
L80025014:
  lw $s2, 40($sp)
L80025018:
  lw $s1, 36($sp)
L8002501c:
  lw $s0, 32($sp)
L80025020:
  jr $ra
L80025024:
  addiu $sp, $sp, 48
L80025028:
  addu $a1, $zero, $zero
L8002502c:
  lui $v0, 0x8009
L80025030:
  addiu $t0, $v0, 2008
L80025034:
  lui $v0, 0x801a
L80025038:
  lbu $v1, 717($gp)
L8002503c:
  addiu $a3, $v0, 31448
L80025040:
  sh $zero, 802($gp)
L80025044:
  sll $v0, $v1, 0x2
L80025048:
  addu $v0, $v0, $v1
L8002504c:
  sll $a2, $v0, 0x2
L80025050:
  addu $v0, $a1, $a2
L80025054:
  addu $v0, $v0, $t0
L80025058:
  lbu $v1, 0($v0)
L8002505c:
  sll $zero, $zero, 0x0
L80025060:
  sll $v0, $v1, 0x3
L80025064:
  subu $v0, $v0, $v1
L80025068:
  sll $v0, $v0, 0x2
L8002506c:
  addu $v1, $v0, $a3
L80025070:
  lhu $v0, 22($v1)
L80025074:
  sll $zero, $zero, 0x0
L80025078:
  andi $v0, $v0, 0x8000
L8002507c:
  beq $v0, $zero, L800250b0
L80025080:
  sll $zero, $zero, 0x0
L80025084:
  lh $v0, 12($v1)
L80025088:
  sll $zero, $zero, 0x0
L8002508c:
  bne $v0, $a0, L800250b4
L80025090:
  addiu $a1, $a1, 1
L80025094:
  lw $v0, 0($v1)
L80025098:
  sh $a0, 802($gp)
L8002509c:
  lbu $v1, 106($v0)
L800250a0:
  sll $zero, $zero, 0x0
L800250a4:
  sb $v1, 688($gp)
L800250a8:
  jr $ra
L800250ac:
  addu $v0, $a0, $zero
L800250b0:
  addiu $a1, $a1, 1
L800250b4:
  slti $v0, $a1, 5
L800250b8:
  bne $v0, $zero, L80025054
L800250bc:
  addu $v0, $a1, $a2
L800250c0:
  jr $ra
L800250c4:
  addu $v0, $zero, $zero
L800250c8:
  addiu $sp, $sp, -32
L800250cc:
  sw $s0, 16($sp)
L800250d0:
  lh $s0, 714($gp)
L800250d4:
  sw $ra, 24($sp)
L800250d8:
  sw $s1, 20($sp)
L800250dc:
  jal L80024e24
L800250e0:
  addiu $s1, $s0, -338
L800250e4:
  bne $v0, $zero, L80025130
L800250e8:
  sll $zero, $zero, 0x0
L800250ec:
  jal L80025028
L800250f0:
  addiu $a0, $zero, 688
L800250f4:
  beq $v0, $zero, L80025100
L800250f8:
  sll $zero, $zero, 0x0
L800250fc:
  addiu $s1, $s0, -333
L80025100:
  jal L8002c68c
L80025104:
  addiu $a0, $zero, 5
L80025108:
  addu $v1, $v0, $zero
L8002510c:
  addiu $a0, $zero, 20
L80025110:
  addiu $v0, $zero, 160
L80025114:
  sh $v0, 0($v1)
L80025118:
  addiu $v0, $zero, 120
L8002511c:
  sh $v0, 2($v1)
L80025120:
  jal L8003fee0
L80025124:
  sh $s1, 26($v1)
L80025128:
  j L80025248
L8002512c:
  sll $zero, $zero, 0x0
L80025130:
  lhu $a0, 792($gp)
L80025134:
  sll $zero, $zero, 0x0
L80025138:
  andi $v0, $a0, 0x40
L8002513c:
  bne $v0, $zero, L800251ac
L80025140:
  ori $v0, $a0, 0x60
L80025144:
  lh $v1, 802($gp)
L80025148:
  sh $v0, 792($gp)
L8002514c:
  bne $v1, $zero, L800251a8
L80025150:
  sll $zero, $zero, 0x0
L80025154:
  addiu $v0, $gp, 40
L80025158:
  addu $v0, $s1, $v0
L8002515c:
  lbu $v1, 0($v0)
L80025160:
  lw $a0, 704($gp)
L80025164:
  sll $v0, $v1, 0x1
L80025168:
  addu $v0, $v0, $v1
L8002516c:
  sll $v0, $v0, 0x3
L80025170:
  addu $v0, $v0, $v1
L80025174:
  lhu $v1, 20($a0)
L80025178:
  sll $v0, $v0, 0x2
L8002517c:
  addu $v1, $v1, $v0
L80025180:
  sh $v1, 20($a0)
L80025184:
  sll $v1, $v1, 0x10
L80025188:
  lh $v0, 22($a0)
L8002518c:
  sra $v1, $v1, 0x10
L80025190:
  slt $v0, $v0, $v1
L80025194:
  lhu $v1, 22($a0)
L80025198:
  beq $v0, $zero, L80025244
L8002519c:
  sll $zero, $zero, 0x0
L800251a0:
  j L80025244
L800251a4:
  sh $v1, 20($a0)
L800251a8:
  sh $zero, 776($gp)
L800251ac:
  lhu $v0, 792($gp)
L800251b0:
  sll $zero, $zero, 0x0
L800251b4:
  andi $v0, $v0, 0x20
L800251b8:
  beq $v0, $zero, L80025204
L800251bc:
  sll $zero, $zero, 0x0
L800251c0:
  jal 0x8001f364
L800251c4:
  sll $zero, $zero, 0x0
L800251c8:
  bne $v0, $zero, L80025248
L800251cc:
  sll $zero, $zero, 0x0
L800251d0:
  lhu $v0, 792($gp)
L800251d4:
  sll $zero, $zero, 0x0
L800251d8:
  andi $v0, $v0, 0xffdf
L800251dc:
  sh $v0, 792($gp)
L800251e0:
  jal L8002c68c
L800251e4:
  addiu $a0, $zero, 9
L800251e8:
  addu $v1, $v0, $zero
L800251ec:
  addiu $v0, $zero, 160
L800251f0:
  sh $v0, 0($v1)
L800251f4:
  addiu $v0, $zero, 120
L800251f8:
  sh $v0, 2($v1)
L800251fc:
  j L80025248
L80025200:
  sh $s1, 26($v1)
L80025204:
  addiu $v0, $gp, 40
L80025208:
  addu $v0, $s1, $v0
L8002520c:
  lbu $v1, 0($v0)
L80025210:
  lw $a0, 704($gp)
L80025214:
  sll $v0, $v1, 0x1
L80025218:
  addu $v0, $v0, $v1
L8002521c:
  sll $v0, $v0, 0x3
L80025220:
  addu $v0, $v0, $v1
L80025224:
  lhu $v1, 20($a0)
L80025228:
  sll $v0, $v0, 0x2
L8002522c:
  subu $v1, $v1, $v0
L80025230:
  sh $v1, 20($a0)
L80025234:
  sll $v1, $v1, 0x10
L80025238:
  bgez $v1, L80025244
L8002523c:
  sll $zero, $zero, 0x0
L80025240:
  sh $zero, 20($a0)
L80025244:
  sh $zero, 792($gp)
L80025248:
  lw $ra, 24($sp)
L8002524c:
  lw $s1, 20($sp)
L80025250:
  lw $s0, 16($sp)
L80025254:
  jr $ra
L80025258:
  addiu $sp, $sp, 32
L8002525c:
  lh $v0, 714($gp)
L80025260:
  addiu $sp, $sp, -24
L80025264:
  sw $ra, 20($sp)
L80025268:
  sw $s0, 16($sp)
L8002526c:
  jal L80024e24
L80025270:
  addiu $s0, $v0, -343
L80025274:
  bne $v0, $zero, L80025294
L80025278:
  sll $zero, $zero, 0x0
L8002527c:
  jal L80025028
L80025280:
  addiu $a0, $zero, 687
L80025284:
  beq $v0, $zero, L80025300
L80025288:
  addiu $a0, $zero, 6
L8002528c:
  j L80025300
L80025290:
  addiu $s0, $zero, 5
L80025294:
  lhu $a0, 792($gp)
L80025298:
  sll $zero, $zero, 0x0
L8002529c:
  andi $v0, $a0, 0x40
L800252a0:
  bne $v0, $zero, L800252cc
L800252a4:
  ori $v0, $a0, 0x60
L800252a8:
  lh $v1, 802($gp)
L800252ac:
  sh $v0, 792($gp)
L800252b0:
  bne $v1, $zero, L800252c8
L800252b4:
  lui $v0, 0x800f
L800252b8:
  lbu $v1, 717($gp)
L800252bc:
  addiu $v0, $v0, -24592
L800252c0:
  j L80025338
L800252c4:
  xori $v1, $v1, 0x1
L800252c8:
  sh $zero, 776($gp)
L800252cc:
  lhu $v0, 792($gp)
L800252d0:
  sll $zero, $zero, 0x0
L800252d4:
  andi $v0, $v0, 0x20
L800252d8:
  beq $v0, $zero, L80025330
L800252dc:
  lui $v0, 0x800f
L800252e0:
  jal 0x8001f364
L800252e4:
  sll $zero, $zero, 0x0
L800252e8:
  bne $v0, $zero, L8002537c
L800252ec:
  addiu $a0, $zero, 7
L800252f0:
  lhu $v0, 792($gp)
L800252f4:
  sll $zero, $zero, 0x0
L800252f8:
  andi $v0, $v0, 0xffdf
L800252fc:
  sh $v0, 792($gp)
L80025300:
  jal L8002c68c
L80025304:
  sll $zero, $zero, 0x0
L80025308:
  addu $v1, $v0, $zero
L8002530c:
  addiu $a0, $zero, 28
L80025310:
  addiu $v0, $zero, 160
L80025314:
  sh $v0, 0($v1)
L80025318:
  addiu $v0, $zero, 120
L8002531c:
  sh $v0, 2($v1)
L80025320:
  jal L8003fee0
L80025324:
  sh $s0, 26($v1)
L80025328:
  j L8002537c
L8002532c:
  sll $zero, $zero, 0x0
L80025330:
  lbu $v1, 717($gp)
L80025334:
  addiu $v0, $v0, -24592
L80025338:
  sll $v1, $v1, 0x5
L8002533c:
  addu $a0, $v1, $v0
L80025340:
  addiu $v0, $gp, 48
L80025344:
  addu $v0, $s0, $v0
L80025348:
  lbu $v1, 0($v0)
L8002534c:
  sll $zero, $zero, 0x0
L80025350:
  sll $v0, $v1, 0x2
L80025354:
  addu $v0, $v0, $v1
L80025358:
  lhu $v1, 20($a0)
L8002535c:
  sll $v0, $v0, 0x1
L80025360:
  subu $v1, $v1, $v0
L80025364:
  sh $v1, 20($a0)
L80025368:
  sll $v1, $v1, 0x10
L8002536c:
  bgez $v1, L80025378
L80025370:
  sll $zero, $zero, 0x0
L80025374:
  sh $zero, 20($a0)
L80025378:
  sh $zero, 792($gp)
L8002537c:
  lw $ra, 20($sp)
L80025380:
  lw $s0, 16($sp)
L80025384:
  jr $ra
L80025388:
  addiu $sp, $sp, 24
L8002538c:
  addiu $sp, $sp, -40
L80025390:
  sw $ra, 32($sp)
L80025394:
  sw $s3, 28($sp)
L80025398:
  sw $s2, 24($sp)
L8002539c:
  sw $s1, 20($sp)
L800253a0:
  jal L80024e24
L800253a4:
  sw $s0, 16($sp)
L800253a8:
  bne $v0, $zero, L8002546c
L800253ac:
  lui $v0, 0x8009
L800253b0:
  jal L8002c68c
L800253b4:
  addiu $a0, $zero, 15
L800253b8:
  addu $s1, $v0, $zero
L800253bc:
  addiu $a0, $zero, 34
L800253c0:
  sh $zero, 0($s1)
L800253c4:
  sh $zero, 2($s1)
L800253c8:
  jal L8003fee0
L800253cc:
  sh $zero, 4($s1)
L800253d0:
  addu $v1, $zero, $zero
L800253d4:
  lui $v0, 0x8009
L800253d8:
  addiu $a1, $v0, 2636
L800253dc:
  lh $a0, 714($gp)
L800253e0:
  addu $v0, $v1, $a1
L800253e4:
  lbu $v0, 0($v0)
L800253e8:
  sll $zero, $zero, 0x0
L800253ec:
  addiu $v0, $v0, 600
L800253f0:
  beq $v0, $a0, L80025400
L800253f4:
  srl $v0, $v1, 0x1f
L800253f8:
  j L800253e0
L800253fc:
  addiu $v1, $v1, 2
L80025400:
  addu $v0, $v1, $v0
L80025404:
  sra $v0, $v0, 0x1
L80025408:
  sh $v0, 26($s1)
L8002540c:
  lui $v0, 0x8009
L80025410:
  addiu $v0, $v0, 2636
L80025414:
  addu $v0, $v1, $v0
L80025418:
  lbu $v0, 1($v0)
L8002541c:
  sll $zero, $zero, 0x0
L80025420:
  addu $v1, $v0, $zero
L80025424:
  sh $v0, 676($gp)
L80025428:
  slti $v0, $v1, 21
L8002542c:
  bne $v0, $zero, L80025454
L80025430:
  addiu $v0, $zero, 5
L80025434:
  sll $v0, $v1, 0x2
L80025438:
  addu $v0, $v0, $v1
L8002543c:
  lhu $v1, 792($gp)
L80025440:
  sll $v0, $v0, 0x1
L80025444:
  sh $v0, 676($gp)
L80025448:
  ori $v1, $v1, 0x1
L8002544c:
  sh $v1, 792($gp)
L80025450:
  addiu $v0, $zero, 5
L80025454:
  sh $v0, 678($gp)
L80025458:
  j L800255e0
L8002545c:
  sll $zero, $zero, 0x0
L80025460:
  sh $zero, 792($gp)
L80025464:
  j L800255e0
L80025468:
  sll $zero, $zero, 0x0
L8002546c:
  addiu $s3, $v0, 2008
L80025470:
  addiu $s2, $gp, 678
L80025474:
  lui $v0, 0x801a
L80025478:
  j L800254c0
L8002547c:
  addiu $s1, $v0, 31448
L80025480:
  jal 0x800170c8
L80025484:
  addu $a0, $s0, $zero
L80025488:
  lh $v1, 676($gp)
L8002548c:
  andi $v0, $v0, 0xffff
L80025490:
  slt $v0, $v0, $v1
L80025494:
  beq $v0, $zero, L8002553c
L80025498:
  sll $zero, $zero, 0x0
L8002549c:
  lhu $v0, 678($gp)
L800254a0:
  sll $zero, $zero, 0x0
L800254a4:
  addiu $v0, $v0, 1
L800254a8:
  sh $v0, 678($gp)
L800254ac:
  sll $v0, $v0, 0x10
L800254b0:
  sra $v0, $v0, 0x10
L800254b4:
  slti $v0, $v0, 10
L800254b8:
  beq $v0, $zero, L80025460
L800254bc:
  sll $zero, $zero, 0x0
L800254c0:
  lbu $v1, 717($gp)
L800254c4:
  sll $zero, $zero, 0x0
L800254c8:
  sll $v0, $v1, 0x2
L800254cc:
  addu $v0, $v0, $v1
L800254d0:
  lh $v1, 678($gp)
L800254d4:
  sll $v0, $v0, 0x2
L800254d8:
  addu $v1, $v1, $v0
L800254dc:
  addu $v1, $v1, $s3
L800254e0:
  lbu $v1, 0($v1)
L800254e4:
  sll $zero, $zero, 0x0
L800254e8:
  sll $v0, $v1, 0x3
L800254ec:
  subu $v0, $v0, $v1
L800254f0:
  sll $v0, $v0, 0x2
L800254f4:
  addu $s0, $v0, $s1
L800254f8:
  lhu $v0, 22($s0)
L800254fc:
  sll $zero, $zero, 0x0
L80025500:
  andi $v0, $v0, 0x8000
L80025504:
  beq $v0, $zero, L8002549c
L80025508:
  sll $zero, $zero, 0x0
L8002550c:
  lhu $v0, 792($gp)
L80025510:
  sll $zero, $zero, 0x0
L80025514:
  andi $v0, $v0, 0x1
L80025518:
  bne $v0, $zero, L80025480
L8002551c:
  sll $zero, $zero, 0x0
L80025520:
  lw $v0, 0($s0)
L80025524:
  sll $zero, $zero, 0x0
L80025528:
  lbu $v1, 104($v0)
L8002552c:
  lh $v0, -2($s2)
L80025530:
  sll $zero, $zero, 0x0
L80025534:
  bne $v1, $v0, L8002549c
L80025538:
  sll $zero, $zero, 0x0
L8002553c:
  lui $a0, 0x8009
L80025540:
  lbu $v1, 717($gp)
L80025544:
  addiu $a0, $a0, 2008
L80025548:
  sll $v0, $v1, 0x2
L8002554c:
  addu $v0, $v0, $v1
L80025550:
  lh $v1, 678($gp)
L80025554:
  sll $v0, $v0, 0x2
L80025558:
  addu $v1, $v1, $v0
L8002555c:
  addu $v1, $v1, $a0
L80025560:
  lbu $v0, 0($v1)
L80025564:
  addiu $a0, $zero, 11
L80025568:
  sll $v1, $v0, 0x3
L8002556c:
  subu $v1, $v1, $v0
L80025570:
  sll $v1, $v1, 0x2
L80025574:
  lui $v0, 0x801a
L80025578:
  addiu $v0, $v0, 31448
L8002557c:
  jal L8002c68c
L80025580:
  addu $s0, $v1, $v0
L80025584:
  lw $v1, 0($s0)
L80025588:
  sll $zero, $zero, 0x0
L8002558c:
  lhu $v1, 48($v1)
L80025590:
  addu $s1, $v0, $zero
L80025594:
  sh $v1, 0($s1)
L80025598:
  lw $v0, 0($s0)
L8002559c:
  sll $zero, $zero, 0x0
L800255a0:
  lhu $v0, 50($v0)
L800255a4:
  sll $zero, $zero, 0x0
L800255a8:
  sh $v0, 2($s1)
L800255ac:
  lw $v0, 0($s0)
L800255b0:
  sll $zero, $zero, 0x0
L800255b4:
  lhu $v0, 52($v0)
L800255b8:
  sll $zero, $zero, 0x0
L800255bc:
  sh $v0, 4($s1)
L800255c0:
  lw $a0, 0($s0)
L800255c4:
  jal 0x800181ec
L800255c8:
  sll $zero, $zero, 0x0
L800255cc:
  addu $a0, $s0, $zero
L800255d0:
  jal L80024954
L800255d4:
  sh $v0, 26($s1)
L800255d8:
  jal L8003fee0
L800255dc:
  addiu $a0, $zero, 31
L800255e0:
  lw $ra, 32($sp)
L800255e4:
  lw $s3, 28($sp)
L800255e8:
  lw $s2, 24($sp)
L800255ec:
  lw $s1, 20($sp)
L800255f0:
  lw $s0, 16($sp)
L800255f4:
  jr $ra
L800255f8:
  addiu $sp, $sp, 40
L800255fc:
  addiu $sp, $sp, -24
L80025600:
  sw $ra, 20($sp)
L80025604:
  jal L80024e24
L80025608:
  sw $s0, 16($sp)
L8002560c:
  bne $v0, $zero, L80025618
L80025610:
  addiu $v0, $zero, -1
L80025614:
  sh $v0, 774($gp)
L80025618:
  lhu $v1, 792($gp)
L8002561c:
  sll $zero, $zero, 0x0
L80025620:
  andi $v0, $v1, 0x40
L80025624:
  beq $v0, $zero, L800256fc
L80025628:
  andi $v0, $v1, 0x20
L8002562c:
  bne $v0, $zero, L800256d4
L80025630:
  sll $zero, $zero, 0x0
L80025634:
  lw $v0, 628($gp)
L80025638:
  sll $zero, $zero, 0x0
L8002563c:
  lbu $v0, 29($v0)
L80025640:
  sll $zero, $zero, 0x0
L80025644:
  beq $v0, $zero, L800256d4
L80025648:
  lui $a0, 0x8009
L8002564c:
  lbu $v1, 717($gp)
L80025650:
  addiu $a0, $a0, 2008
L80025654:
  sll $v0, $v1, 0x2
L80025658:
  addu $v0, $v0, $v1
L8002565c:
  sll $v0, $v0, 0x2
L80025660:
  lh $v1, 774($gp)
L80025664:
  addiu $v0, $v0, 5
L80025668:
  addu $v1, $v1, $v0
L8002566c:
  addu $v1, $v1, $a0
L80025670:
  lbu $v0, 0($v1)
L80025674:
  sll $zero, $zero, 0x0
L80025678:
  sll $v1, $v0, 0x3
L8002567c:
  subu $v1, $v1, $v0
L80025680:
  sll $v1, $v1, 0x2
L80025684:
  lui $v0, 0x801a
L80025688:
  addiu $v0, $v0, 31448
L8002568c:
  addu $s0, $v1, $v0
L80025690:
  lw $v0, 20($s0)
L80025694:
  lui $v1, 0x8800
L80025698:
  and $v0, $v0, $v1
L8002569c:
  bne $v0, $v1, L800256c4
L800256a0:
  addiu $a1, $zero, 192
L800256a4:
  addu $a2, $zero, $zero
L800256a8:
  lw $a0, 0($s0)
L800256ac:
  jal 0x80019ba0
L800256b0:
  addiu $a3, $zero, 6
L800256b4:
  lhu $v0, 22($s0)
L800256b8:
  sll $zero, $zero, 0x0
L800256bc:
  andi $v0, $v0, 0xf7ff
L800256c0:
  sh $v0, 22($s0)
L800256c4:
  lhu $v0, 792($gp)
L800256c8:
  sll $zero, $zero, 0x0
L800256cc:
  ori $v0, $v0, 0x20
L800256d0:
  sh $v0, 792($gp)
L800256d4:
  lw $v0, 628($gp)
L800256d8:
  sll $zero, $zero, 0x0
L800256dc:
  lbu $v0, 28($v0)
L800256e0:
  sll $zero, $zero, 0x0
L800256e4:
  andi $v0, $v0, 0x80
L800256e8:
  bne $v0, $zero, L80025790
L800256ec:
  sll $zero, $zero, 0x0
L800256f0:
  lhu $v0, 792($gp)
L800256f4:
  j L8002578c
L800256f8:
  andi $v0, $v0, 0xff9f
L800256fc:
  lhu $v0, 774($gp)
L80025700:
  sll $zero, $zero, 0x0
L80025704:
  addiu $v0, $v0, 1
L80025708:
  sh $v0, 774($gp)
L8002570c:
  sll $v0, $v0, 0x10
L80025710:
  sra $v0, $v0, 0x10
L80025714:
  slti $v0, $v0, 5
L80025718:
  bne $v0, $zero, L8002572c
L8002571c:
  sll $zero, $zero, 0x0
L80025720:
  sh $zero, 792($gp)
L80025724:
  j L80025790
L80025728:
  sll $zero, $zero, 0x0
L8002572c:
  jal L8002c604
L80025730:
  addiu $a0, $zero, 12
L80025734:
  lui $a2, 0x8009
L80025738:
  addiu $a2, $a2, 2048
L8002573c:
  lh $a0, 774($gp)
L80025740:
  lbu $a1, 717($gp)
L80025744:
  addiu $a0, $a0, 5
L80025748:
  sll $a0, $a0, 0x2
L8002574c:
  sll $v1, $a1, 0x2
L80025750:
  addu $v1, $v1, $a1
L80025754:
  sll $v1, $v1, 0x4
L80025758:
  addu $a0, $a0, $v1
L8002575c:
  addu $a0, $a0, $a2
L80025760:
  lhu $v1, 0($a0)
L80025764:
  sw $v0, 628($gp)
L80025768:
  sh $zero, 2($v0)
L8002576c:
  sh $v1, 0($v0)
L80025770:
  lhu $v1, 2($a0)
L80025774:
  addiu $a0, $zero, 32
L80025778:
  jal L8003fee0
L8002577c:
  sh $v1, 4($v0)
L80025780:
  lhu $v0, 792($gp)
L80025784:
  sll $zero, $zero, 0x0
L80025788:
  ori $v0, $v0, 0x40
L8002578c:
  sh $v0, 792($gp)
L80025790:
  lw $ra, 20($sp)
L80025794:
  lw $s0, 16($sp)
L80025798:
  jr $ra
L8002579c:
  addiu $sp, $sp, 24
L800257a0:
  addiu $sp, $sp, -40
L800257a4:
  sw $ra, 32($sp)
L800257a8:
  sw $s3, 28($sp)
L800257ac:
  sw $s2, 24($sp)
L800257b0:
  sw $s1, 20($sp)
L800257b4:
  jal L80024e24
L800257b8:
  sw $s0, 16($sp)
L800257bc:
  bne $v0, $zero, L800257d4
L800257c0:
  sll $zero, $zero, 0x0
L800257c4:
  jal L8003ff88
L800257c8:
  ori $a0, $zero, 0x8020
L800257cc:
  j L80025950
L800257d0:
  sll $zero, $zero, 0x0
L800257d4:
  lhu $v1, 792($gp)
L800257d8:
  sll $zero, $zero, 0x0
L800257dc:
  andi $v0, $v1, 0x20
L800257e0:
  bne $v0, $zero, L80025840
L800257e4:
  sll $zero, $zero, 0x0
L800257e8:
  lui $v0, 0x800a
L800257ec:
  lhu $v0, -20206($v0)
L800257f0:
  sll $zero, $zero, 0x0
L800257f4:
  andi $v0, $v0, 0x4000
L800257f8:
  beq $v0, $zero, L80025950
L800257fc:
  ori $v0, $v1, 0x20
L80025800:
  sh $v0, 792($gp)
L80025804:
  jal L8002c68c
L80025808:
  addiu $a0, $zero, 17
L8002580c:
  addu $a0, $v0, $zero
L80025810:
  lh $v1, 714($gp)
L80025814:
  addiu $v0, $zero, 329
L80025818:
  bne $v1, $v0, L80025830
L8002581c:
  addiu $v1, $zero, 1
L80025820:
  lhu $v0, 792($gp)
L80025824:
  sh $v1, 26($a0)
L80025828:
  ori $v0, $v0, 0x40
L8002582c:
  sh $v0, 792($gp)
L80025830:
  sh $zero, 0($a0)
L80025834:
  sh $zero, 2($a0)
L80025838:
  j L80025950
L8002583c:
  sh $zero, 4($a0)
L80025840:
  lui $v0, 0x800a
L80025844:
  lhu $v0, -20206($v0)
L80025848:
  sll $zero, $zero, 0x0
L8002584c:
  andi $v0, $v0, 0x4000
L80025850:
  bne $v0, $zero, L80025950
L80025854:
  andi $v0, $v1, 0x40
L80025858:
  beq $v0, $zero, L800258f0
L8002585c:
  addiu $s2, $zero, 5
L80025860:
  lui $v0, 0x8009
L80025864:
  addiu $s3, $v0, 2008
L80025868:
  lui $v0, 0x801a
L8002586c:
  addiu $s1, $v0, 31448
L80025870:
  lbu $v1, 717($gp)
L80025874:
  sll $zero, $zero, 0x0
L80025878:
  sll $v0, $v1, 0x2
L8002587c:
  addu $v0, $v0, $v1
L80025880:
  sll $v0, $v0, 0x2
L80025884:
  addu $v0, $s2, $v0
L80025888:
  addu $v0, $v0, $s3
L8002588c:
  lbu $v1, 0($v0)
L80025890:
  sll $zero, $zero, 0x0
L80025894:
  sll $v0, $v1, 0x3
L80025898:
  subu $v0, $v0, $v1
L8002589c:
  sll $v0, $v0, 0x2
L800258a0:
  addu $s0, $v0, $s1
L800258a4:
  lhu $v0, 22($s0)
L800258a8:
  sll $zero, $zero, 0x0
L800258ac:
  andi $v0, $v0, 0x8000
L800258b0:
  beq $v0, $zero, L800258d8
L800258b4:
  sll $zero, $zero, 0x0
L800258b8:
  lw $v0, 0($s0)
L800258bc:
  sll $zero, $zero, 0x0
L800258c0:
  lbu $v0, 104($v0)
L800258c4:
  sll $zero, $zero, 0x0
L800258c8:
  bne $v0, $zero, L800258d8
L800258cc:
  sll $zero, $zero, 0x0
L800258d0:
  jal L80024954
L800258d4:
  addu $a0, $s0, $zero
L800258d8:
  addiu $s2, $s2, 1
L800258dc:
  slti $v0, $s2, 10
L800258e0:
  beq $v0, $zero, L8002594c
L800258e4:
  sll $zero, $zero, 0x0
L800258e8:
  j L80025870
L800258ec:
  sll $zero, $zero, 0x0
L800258f0:
  lui $v0, 0x801a
L800258f4:
  addiu $s0, $v0, 31588
L800258f8:
  addiu $s1, $s0, 420
L800258fc:
  addu $s2, $zero, $zero
L80025900:
  lhu $v0, 22($s0)
L80025904:
  sll $zero, $zero, 0x0
L80025908:
  andi $v0, $v0, 0x8000
L8002590c:
  beq $v0, $zero, L8002591c
L80025910:
  sll $zero, $zero, 0x0
L80025914:
  jal L80024954
L80025918:
  addu $a0, $s0, $zero
L8002591c:
  lhu $v0, 22($s1)
L80025920:
  sll $zero, $zero, 0x0
L80025924:
  andi $v0, $v0, 0x8000
L80025928:
  beq $v0, $zero, L80025938
L8002592c:
  sll $zero, $zero, 0x0
L80025930:
  jal L80024954
L80025934:
  addu $a0, $s1, $zero
L80025938:
  addiu $s2, $s2, 1
L8002593c:
  addiu $s0, $s0, 28
L80025940:
  slti $v0, $s2, 10
L80025944:
  bne $v0, $zero, L80025900
L80025948:
  addiu $s1, $s1, 28
L8002594c:
  sh $zero, 792($gp)
L80025950:
  lw $ra, 32($sp)
L80025954:
  lw $s3, 28($sp)
L80025958:
  lw $s2, 24($sp)
L8002595c:
  lw $s1, 20($sp)
L80025960:
  lw $s0, 16($sp)
L80025964:
  jr $ra
L80025968:
  addiu $sp, $sp, 40
L8002596c:
  addiu $sp, $sp, -32
L80025970:
  sw $ra, 24($sp)
L80025974:
  sw $s1, 20($sp)
L80025978:
  jal L80024e24
L8002597c:
  sw $s0, 16($sp)
L80025980:
  bne $v0, $zero, L800259e4
L80025984:
  sll $zero, $zero, 0x0
L80025988:
  sh $zero, 774($gp)
L8002598c:
  jal L8002c604
L80025990:
  addiu $a0, $zero, 16
L80025994:
  lui $a2, 0x8009
L80025998:
  addiu $a2, $a2, 2048
L8002599c:
  lh $a0, 774($gp)
L800259a0:
  lbu $a1, 717($gp)
L800259a4:
  addiu $a0, $a0, 5
L800259a8:
  sll $a0, $a0, 0x2
L800259ac:
  sll $v1, $a1, 0x2
L800259b0:
  addu $v1, $v1, $a1
L800259b4:
  sll $v1, $v1, 0x4
L800259b8:
  addu $a0, $a0, $v1
L800259bc:
  addu $a0, $a0, $a2
L800259c0:
  lhu $v1, 0($a0)
L800259c4:
  addu $s0, $v0, $zero
L800259c8:
  sw $s0, 628($gp)
L800259cc:
  sh $zero, 2($s0)
L800259d0:
  sh $v1, 0($s0)
L800259d4:
  lhu $v0, 2($a0)
L800259d8:
  addiu $a0, $zero, 21
L800259dc:
  j L80025b0c
L800259e0:
  sh $v0, 4($s0)
L800259e4:
  lui $v0, 0x800a
L800259e8:
  lbu $v0, -19872($v0)
L800259ec:
  sll $zero, $zero, 0x0
L800259f0:
  andi $v0, $v0, 0x1
L800259f4:
  bne $v0, $zero, L80025a08
L800259f8:
  sll $zero, $zero, 0x0
L800259fc:
  sh $zero, 792($gp)
L80025a00:
  j L80025b14
L80025a04:
  sll $zero, $zero, 0x0
L80025a08:
  lw $v0, 628($gp)
L80025a0c:
  lh $v1, 774($gp)
L80025a10:
  lbu $v0, 29($v0)
L80025a14:
  addiu $v1, $v1, 1
L80025a18:
  bne $v0, $v1, L80025b14
L80025a1c:
  sll $zero, $zero, 0x0
L80025a20:
  jal L8003fee0
L80025a24:
  addiu $a0, $zero, 21
L80025a28:
  lui $a0, 0x8009
L80025a2c:
  lbu $v1, 717($gp)
L80025a30:
  addiu $a0, $a0, 2008
L80025a34:
  sll $v0, $v1, 0x2
L80025a38:
  addu $v0, $v0, $v1
L80025a3c:
  sll $v0, $v0, 0x2
L80025a40:
  lh $v1, 774($gp)
L80025a44:
  addiu $v0, $v0, 5
L80025a48:
  addu $v1, $v1, $v0
L80025a4c:
  addu $v1, $v1, $a0
L80025a50:
  lbu $v0, 0($v1)
L80025a54:
  sll $zero, $zero, 0x0
L80025a58:
  sll $v1, $v0, 0x3
L80025a5c:
  subu $v1, $v1, $v0
L80025a60:
  sll $v1, $v1, 0x2
L80025a64:
  lui $v0, 0x801a
L80025a68:
  addiu $v0, $v0, 31448
L80025a6c:
  addu $s1, $v1, $v0
L80025a70:
  lhu $v0, 774($gp)
L80025a74:
  lhu $v1, 22($s1)
L80025a78:
  addiu $v0, $v0, 1
L80025a7c:
  andi $v1, $v1, 0x8000
L80025a80:
  sh $v0, 774($gp)
L80025a84:
  beq $v1, $zero, L80025b14
L80025a88:
  sll $zero, $zero, 0x0
L80025a8c:
  jal L8002c604
L80025a90:
  addiu $a0, $zero, 11
L80025a94:
  lh $v1, 774($gp)
L80025a98:
  addu $s0, $v0, $zero
L80025a9c:
  sll $v0, $v1, 0x1
L80025aa0:
  addu $v0, $v0, $v1
L80025aa4:
  lw $v1, 20($s0)
L80025aa8:
  sll $v0, $v0, 0xc
L80025aac:
  addu $v1, $v1, $v0
L80025ab0:
  sw $v1, 20($s0)
L80025ab4:
  lw $v0, 0($s1)
L80025ab8:
  sll $zero, $zero, 0x0
L80025abc:
  lhu $v0, 48($v0)
L80025ac0:
  sll $zero, $zero, 0x0
L80025ac4:
  sh $v0, 0($s0)
L80025ac8:
  lw $v0, 0($s1)
L80025acc:
  sll $zero, $zero, 0x0
L80025ad0:
  lhu $v0, 50($v0)
L80025ad4:
  sll $zero, $zero, 0x0
L80025ad8:
  sh $v0, 2($s0)
L80025adc:
  lw $v0, 0($s1)
L80025ae0:
  sll $zero, $zero, 0x0
L80025ae4:
  lhu $v0, 52($v0)
L80025ae8:
  sll $zero, $zero, 0x0
L80025aec:
  sh $v0, 4($s0)
L80025af0:
  lw $a0, 0($s1)
L80025af4:
  jal 0x800181ec
L80025af8:
  sll $zero, $zero, 0x0
L80025afc:
  addu $a0, $s1, $zero
L80025b00:
  jal L80024954
L80025b04:
  sh $v0, 26($s0)
L80025b08:
  addiu $a0, $zero, 31
L80025b0c:
  jal L8003fee0
L80025b10:
  sll $zero, $zero, 0x0
L80025b14:
  lw $ra, 24($sp)
L80025b18:
  lw $s1, 20($sp)
L80025b1c:
  lw $s0, 16($sp)
L80025b20:
  jr $ra
L80025b24:
  addiu $sp, $sp, 32
L80025b28:
  addiu $sp, $sp, -24
L80025b2c:
  addu $a1, $a0, $zero
L80025b30:
  sw $ra, 16($sp)
L80025b34:
  lbu $v0, 34($a1)
L80025b38:
  lbu $a0, 108($a1)
L80025b3c:
  addiu $v1, $v0, 8
L80025b40:
  andi $v0, $a0, 0x80
L80025b44:
  bne $v0, $zero, L80025b90
L80025b48:
  sb $v1, 34($a1)
L80025b4c:
  andi $v0, $v1, 0xff
L80025b50:
  sltiu $v0, $v0, 40
L80025b54:
  bne $v0, $zero, L80025b90
L80025b58:
  ori $v0, $a0, 0x80
L80025b5c:
  lui $v1, 0x801a
L80025b60:
  lbu $a0, 106($a1)
L80025b64:
  addiu $v1, $v1, 31448
L80025b68:
  sb $v0, 108($a1)
L80025b6c:
  sll $v0, $a0, 0x3
L80025b70:
  subu $v0, $v0, $a0
L80025b74:
  sll $v0, $v0, 0x2
L80025b78:
  addu $v0, $v0, $v1
L80025b7c:
  lhu $v1, 22($v0)
L80025b80:
  sll $zero, $zero, 0x0
L80025b84:
  andi $v1, $v1, 0xdfff
L80025b88:
  sh $v1, 22($v0)
L80025b8c:
  sb $zero, 103($a1)
L80025b90:
  lbu $v0, 34($a1)
L80025b94:
  sll $zero, $zero, 0x0
L80025b98:
  sltiu $v0, $v0, 64
L80025b9c:
  beq $v0, $zero, L80025bdc
L80025ba0:
  lui $v1, 0x801a
L80025ba4:
  lbu $a0, 106($a1)
L80025ba8:
  addiu $v1, $v1, 31448
L80025bac:
  sb $zero, 34($a1)
L80025bb0:
  sb $zero, 108($a1)
L80025bb4:
  sw $zero, 36($a1)
L80025bb8:
  sll $v0, $a0, 0x3
L80025bbc:
  subu $v0, $v0, $a0
L80025bc0:
  sll $v0, $v0, 0x2
L80025bc4:
  addu $v0, $v0, $v1
L80025bc8:
  lhu $v1, 22($v0)
L80025bcc:
  addu $a0, $a1, $zero
L80025bd0:
  andi $v1, $v1, 0xcbff
L80025bd4:
  jal 0x80018080
L80025bd8:
  sh $v1, 22($v0)
L80025bdc:
  lw $ra, 16($sp)
L80025be0:
  sll $zero, $zero, 0x0
L80025be4:
  jr $ra
L80025be8:
  addiu $sp, $sp, 24
L80025bec:
  addiu $sp, $sp, -24
L80025bf0:
  sw $ra, 16($sp)
L80025bf4:
  jal L80024e24
L80025bf8:
  sll $zero, $zero, 0x0
L80025bfc:
  bne $v0, $zero, L80025c30
L80025c00:
  sll $zero, $zero, 0x0
L80025c04:
  jal L8002c604
L80025c08:
  addiu $a0, $zero, 19
L80025c0c:
  addiu $a0, $zero, 19
L80025c10:
  addiu $v1, $zero, 160
L80025c14:
  sh $v1, 0($v0)
L80025c18:
  addiu $v1, $zero, 104
L80025c1c:
  sw $v0, 628($gp)
L80025c20:
  jal L8003fee0
L80025c24:
  sh $v1, 2($v0)
L80025c28:
  j L80025d20
L80025c2c:
  sll $zero, $zero, 0x0
L80025c30:
  lhu $v1, 792($gp)
L80025c34:
  sll $zero, $zero, 0x0
L80025c38:
  andi $v0, $v1, 0x40
L80025c3c:
  bne $v0, $zero, L80025cf4
L80025c40:
  sll $zero, $zero, 0x0
L80025c44:
  lw $v0, 628($gp)
L80025c48:
  sll $zero, $zero, 0x0
L80025c4c:
  lbu $v0, 29($v0)
L80025c50:
  sll $zero, $zero, 0x0
L80025c54:
  beq $v0, $zero, L80025cf4
L80025c58:
  ori $v0, $v1, 0x40
L80025c5c:
  sh $v0, 792($gp)
L80025c60:
  jal L8003fee0
L80025c64:
  addiu $a0, $zero, 29
L80025c68:
  addiu $a0, $zero, 5
L80025c6c:
  lui $v0, 0x8009
L80025c70:
  addiu $t1, $v0, 2008
L80025c74:
  lui $v0, 0x801a
L80025c78:
  addiu $t0, $v0, 31448
L80025c7c:
  lui $a1, 0x9000
L80025c80:
  lui $v0, 0x8002
L80025c84:
  addiu $a3, $v0, 23336
L80025c88:
  addiu $a2, $zero, 1
L80025c8c:
  lbu $v1, 717($gp)
L80025c90:
  sll $zero, $zero, 0x0
L80025c94:
  sll $v0, $v1, 0x2
L80025c98:
  addu $v0, $v0, $v1
L80025c9c:
  sll $v0, $v0, 0x2
L80025ca0:
  addu $v0, $a0, $v0
L80025ca4:
  addu $v0, $v0, $t1
L80025ca8:
  lbu $v1, 0($v0)
L80025cac:
  sll $zero, $zero, 0x0
L80025cb0:
  sll $v0, $v1, 0x3
L80025cb4:
  subu $v0, $v0, $v1
L80025cb8:
  sll $v0, $v0, 0x2
L80025cbc:
  addu $v1, $v0, $t0
L80025cc0:
  lw $v0, 20($v1)
L80025cc4:
  sll $zero, $zero, 0x0
L80025cc8:
  and $v0, $v0, $a1
L80025ccc:
  bne $v0, $a1, L80025ce4
L80025cd0:
  sll $zero, $zero, 0x0
L80025cd4:
  lw $v0, 0($v1)
L80025cd8:
  sll $zero, $zero, 0x0
L80025cdc:
  sw $a3, 36($v0)
L80025ce0:
  sb $a2, 108($v0)
L80025ce4:
  addiu $a0, $a0, 1
L80025ce8:
  slti $v0, $a0, 15
L80025cec:
  bne $v0, $zero, L80025c8c
L80025cf0:
  sll $zero, $zero, 0x0
L80025cf4:
  lui $v0, 0x800a
L80025cf8:
  lbu $v0, -19872($v0)
L80025cfc:
  sll $zero, $zero, 0x0
L80025d00:
  andi $v0, $v0, 0x1
L80025d04:
  bne $v0, $zero, L80025d20
L80025d08:
  sll $zero, $zero, 0x0
L80025d0c:
  jal 0x80042b40
L80025d10:
  addiu $a0, $zero, 1
L80025d14:
  bne $v0, $zero, L80025d20
L80025d18:
  sll $zero, $zero, 0x0
L80025d1c:
  sh $zero, 792($gp)
L80025d20:
  lw $ra, 16($sp)
L80025d24:
  sll $zero, $zero, 0x0
L80025d28:
  jr $ra
L80025d2c:
  addiu $sp, $sp, 24
L80025d30:
  addiu $sp, $sp, -32
L80025d34:
  sw $ra, 24($sp)
L80025d38:
  sw $s1, 20($sp)
L80025d3c:
  jal L80024e24
L80025d40:
  sw $s0, 16($sp)
L80025d44:
  bne $v0, $zero, L80025d54
L80025d48:
  sll $zero, $zero, 0x0
L80025d4c:
  sh $zero, 774($gp)
L80025d50:
  sh $zero, 712($gp)
L80025d54:
  lhu $v0, 792($gp)
L80025d58:
  sll $zero, $zero, 0x0
L80025d5c:
  andi $v0, $v0, 0x40
L80025d60:
  beq $v0, $zero, L80025d8c
L80025d64:
  sll $zero, $zero, 0x0
L80025d68:
  lui $v0, 0x800a
L80025d6c:
  lbu $v0, -19872($v0)
L80025d70:
  sll $zero, $zero, 0x0
L80025d74:
  andi $v0, $v0, 0x1
L80025d78:
  bne $v0, $zero, L80025ecc
L80025d7c:
  sll $zero, $zero, 0x0
L80025d80:
  sh $zero, 792($gp)
L80025d84:
  j L80025ecc
L80025d88:
  sll $zero, $zero, 0x0
L80025d8c:
  lhu $v0, 774($gp)
L80025d90:
  sll $zero, $zero, 0x0
L80025d94:
  addiu $v0, $v0, -1
L80025d98:
  sh $v0, 774($gp)
L80025d9c:
  sll $v0, $v0, 0x10
L80025da0:
  bgtz $v0, L80025ecc
L80025da4:
  addiu $v0, $zero, 16
L80025da8:
  lui $a0, 0x8009
L80025dac:
  lbu $v1, 717($gp)
L80025db0:
  addiu $a0, $a0, 2008
L80025db4:
  sh $v0, 774($gp)
L80025db8:
  sll $v0, $v1, 0x2
L80025dbc:
  addu $v0, $v0, $v1
L80025dc0:
  sll $v0, $v0, 0x2
L80025dc4:
  lh $v1, 712($gp)
L80025dc8:
  addiu $v0, $v0, 5
L80025dcc:
  addu $v1, $v1, $v0
L80025dd0:
  addu $v1, $v1, $a0
L80025dd4:
  lbu $v0, 0($v1)
L80025dd8:
  sll $zero, $zero, 0x0
L80025ddc:
  sll $v1, $v0, 0x3
L80025de0:
  subu $v1, $v1, $v0
L80025de4:
  sll $v1, $v1, 0x2
L80025de8:
  lui $v0, 0x801a
L80025dec:
  addiu $v0, $v0, 31448
L80025df0:
  addu $s1, $v1, $v0
L80025df4:
  lhu $v0, 22($s1)
L80025df8:
  sll $zero, $zero, 0x0
L80025dfc:
  andi $v0, $v0, 0x8000
L80025e00:
  beq $v0, $zero, L80025e98
L80025e04:
  sll $zero, $zero, 0x0
L80025e08:
  lw $s0, 0($s1)
L80025e0c:
  jal L8002c604
L80025e10:
  addiu $a0, $zero, 13
L80025e14:
  lhu $v1, 48($s0)
L80025e18:
  addu $a1, $v0, $zero
L80025e1c:
  sh $v1, 0($a1)
L80025e20:
  lh $v1, 712($gp)
L80025e24:
  lhu $v0, 50($s0)
L80025e28:
  sll $v1, $v1, 0xe
L80025e2c:
  sh $v0, 2($a1)
L80025e30:
  lw $v0, 20($a1)
L80025e34:
  lhu $a0, 52($s0)
L80025e38:
  addu $v0, $v0, $v1
L80025e3c:
  lh $v1, 714($gp)
L80025e40:
  sw $v0, 20($a1)
L80025e44:
  addiu $v0, $zero, 349
L80025e48:
  bne $v1, $v0, L80025e70
L80025e4c:
  sh $a0, 4($a1)
L80025e50:
  addiu $v0, $zero, 2
L80025e54:
  sh $v0, 26($a1)
L80025e58:
  lhu $v0, 18($s1)
L80025e5c:
  sll $zero, $zero, 0x0
L80025e60:
  addiu $v0, $v0, -500
L80025e64:
  sh $v0, 18($s1)
L80025e68:
  j L80025e8c
L80025e6c:
  addiu $v0, $zero, -500
L80025e70:
  addiu $v0, $zero, 1
L80025e74:
  sh $v0, 26($a1)
L80025e78:
  lhu $v0, 18($s1)
L80025e7c:
  sll $zero, $zero, 0x0
L80025e80:
  addiu $v0, $v0, -1000
L80025e84:
  sh $v0, 18($s1)
L80025e88:
  addiu $v0, $zero, -1000
L80025e8c:
  sh $v0, 18($a1)
L80025e90:
  jal L8003fee0
L80025e94:
  addiu $a0, $zero, 33
L80025e98:
  lhu $v0, 712($gp)
L80025e9c:
  sll $zero, $zero, 0x0
L80025ea0:
  addiu $v0, $v0, 1
L80025ea4:
  sh $v0, 712($gp)
L80025ea8:
  sll $v0, $v0, 0x10
L80025eac:
  sra $v0, $v0, 0x10
L80025eb0:
  slti $v0, $v0, 5
L80025eb4:
  bne $v0, $zero, L80025ecc
L80025eb8:
  sll $zero, $zero, 0x0
L80025ebc:
  lhu $v0, 792($gp)
L80025ec0:
  sll $zero, $zero, 0x0
L80025ec4:
  ori $v0, $v0, 0x40
L80025ec8:
  sh $v0, 792($gp)
L80025ecc:
  lw $ra, 24($sp)
L80025ed0:
  lw $s1, 20($sp)
L80025ed4:
  lw $s0, 16($sp)
L80025ed8:
  jr $ra
L80025edc:
  addiu $sp, $sp, 32
L80025ee0:
  addiu $sp, $sp, -24
L80025ee4:
  sw $ra, 16($sp)
L80025ee8:
  jal L80024e24
L80025eec:
  sll $zero, $zero, 0x0
L80025ef0:
  bne $v0, $zero, L80025f28
L80025ef4:
  sll $zero, $zero, 0x0
L80025ef8:
  jal L8002c68c
L80025efc:
  addiu $a0, $zero, 18
L80025f00:
  addiu $a0, $zero, 2
L80025f04:
  addiu $v1, $zero, 160
L80025f08:
  sh $v1, 0($v0)
L80025f0c:
  addiu $v1, $zero, 120
L80025f10:
  sh $v1, 2($v0)
L80025f14:
  addiu $v1, $zero, 1
L80025f18:
  jal L8003fee0
L80025f1c:
  sh $v1, 26($v0)
L80025f20:
  j L80025f2c
L80025f24:
  sll $zero, $zero, 0x0
L80025f28:
  sh $zero, 792($gp)
L80025f2c:
  lw $ra, 16($sp)
L80025f30:
  sll $zero, $zero, 0x0
L80025f34:
  jr $ra
L80025f38:
  addiu $sp, $sp, 24
L80025f3c:
  addiu $sp, $sp, -24
L80025f40:
  sw $ra, 16($sp)
L80025f44:
  jal L80024e24
L80025f48:
  sll $zero, $zero, 0x0
L80025f4c:
  bne $v0, $zero, L80025fb0
L80025f50:
  sll $zero, $zero, 0x0
L80025f54:
  jal L8002c604
L80025f58:
  addiu $a0, $zero, 21
L80025f5c:
  addiu $a0, $zero, 35
L80025f60:
  lbu $v1, 717($gp)
L80025f64:
  addiu $a1, $gp, 744
L80025f68:
  sw $v0, 628($gp)
L80025f6c:
  xori $v1, $v1, 0x1
L80025f70:
  sll $v1, $v1, 0x2
L80025f74:
  addu $v1, $v1, $a1
L80025f78:
  sw $v0, 0($v1)
L80025f7c:
  lbu $v1, 28($v0)
L80025f80:
  addiu $a1, $zero, 160
L80025f84:
  sh $a1, 0($v0)
L80025f88:
  ori $v1, $v1, 0x20
L80025f8c:
  sb $v1, 28($v0)
L80025f90:
  lbu $v1, 717($gp)
L80025f94:
  addiu $a1, $zero, 120
L80025f98:
  sh $a1, 2($v0)
L80025f9c:
  xori $v1, $v1, 0x1
L80025fa0:
  jal L8003fee0
L80025fa4:
  sh $v1, 26($v0)
L80025fa8:
  j L800260c0
L80025fac:
  sll $zero, $zero, 0x0
L80025fb0:
  lhu $v1, 792($gp)
L80025fb4:
  sll $zero, $zero, 0x0
L80025fb8:
  andi $v0, $v1, 0x40
L80025fbc:
  bne $v0, $zero, L80026074
L80025fc0:
  sll $zero, $zero, 0x0
L80025fc4:
  lw $v0, 628($gp)
L80025fc8:
  sll $zero, $zero, 0x0
L80025fcc:
  lbu $v0, 29($v0)
L80025fd0:
  sll $zero, $zero, 0x0
L80025fd4:
  beq $v0, $zero, L800260c0
L80025fd8:
  ori $v0, $v1, 0x40
L80025fdc:
  sh $v0, 792($gp)
L80025fe0:
  addiu $a0, $zero, 5
L80025fe4:
  lui $v0, 0x8009
L80025fe8:
  addiu $t1, $v0, 2008
L80025fec:
  lui $v0, 0x801a
L80025ff0:
  addiu $t0, $v0, 31448
L80025ff4:
  lui $a1, 0x9000
L80025ff8:
  lui $v0, 0x8002
L80025ffc:
  addiu $a3, $v0, 23336
L80026000:
  addiu $a2, $zero, 1
L80026004:
  lbu $v1, 717($gp)
L80026008:
  sll $zero, $zero, 0x0
L8002600c:
  sll $v0, $v1, 0x2
L80026010:
  addu $v0, $v0, $v1
L80026014:
  sll $v0, $v0, 0x2
L80026018:
  addu $v0, $a0, $v0
L8002601c:
  addu $v0, $v0, $t1
L80026020:
  lbu $v1, 0($v0)
L80026024:
  sll $zero, $zero, 0x0
L80026028:
  sll $v0, $v1, 0x3
L8002602c:
  subu $v0, $v0, $v1
L80026030:
  sll $v0, $v0, 0x2
L80026034:
  addu $v1, $v0, $t0
L80026038:
  lw $v0, 20($v1)
L8002603c:
  sll $zero, $zero, 0x0
L80026040:
  and $v0, $v0, $a1
L80026044:
  bne $v0, $a1, L8002605c
L80026048:
  sll $zero, $zero, 0x0
L8002604c:
  lw $v0, 0($v1)
L80026050:
  sll $zero, $zero, 0x0
L80026054:
  sw $a3, 36($v0)
L80026058:
  sb $a2, 108($v0)
L8002605c:
  addiu $a0, $a0, 1
L80026060:
  slti $v0, $a0, 10
L80026064:
  beq $v0, $zero, L800260c0
L80026068:
  sll $zero, $zero, 0x0
L8002606c:
  j L80026004
L80026070:
  sll $zero, $zero, 0x0
L80026074:
  jal 0x80042b40
L80026078:
  addiu $a0, $zero, 1
L8002607c:
  bne $v0, $zero, L800260c0
L80026080:
  sll $zero, $zero, 0x0
L80026084:
  lw $v0, 628($gp)
L80026088:
  sll $zero, $zero, 0x0
L8002608c:
  lbu $v0, 29($v0)
L80026090:
  sll $zero, $zero, 0x0
L80026094:
  sltiu $v0, $v0, 2
L80026098:
  bne $v0, $zero, L800260c0
L8002609c:
  lui $v0, 0x800f
L800260a0:
  lbu $v1, 717($gp)
L800260a4:
  addiu $v0, $v0, -24592
L800260a8:
  xori $v1, $v1, 0x1
L800260ac:
  sll $v1, $v1, 0x5
L800260b0:
  addu $v1, $v1, $v0
L800260b4:
  addiu $v0, $zero, 4
L800260b8:
  sb $v0, 25($v1)
L800260bc:
  sh $zero, 792($gp)
L800260c0:
  lw $ra, 16($sp)
L800260c4:
  sll $zero, $zero, 0x0
L800260c8:
  jr $ra
L800260cc:
  addiu $sp, $sp, 24
L800260d0:
  addiu $sp, $sp, -32
L800260d4:
  sw $ra, 24($sp)
L800260d8:
  sw $s1, 20($sp)
L800260dc:
  jal L80024e24
L800260e0:
  sw $s0, 16($sp)
L800260e4:
  bne $v0, $zero, L800260f4
L800260e8:
  addiu $v0, $zero, -1
L800260ec:
  sh $v0, 774($gp)
L800260f0:
  sh $zero, 712($gp)
L800260f4:
  lhu $v0, 712($gp)
L800260f8:
  sll $zero, $zero, 0x0
L800260fc:
  addiu $v0, $v0, -1
L80026100:
  sh $v0, 712($gp)
L80026104:
  sll $v0, $v0, 0x10
L80026108:
  bgtz $v0, L80026218
L8002610c:
  addiu $v1, $zero, 16
L80026110:
  lhu $v0, 774($gp)
L80026114:
  sh $v1, 712($gp)
L80026118:
  addiu $v0, $v0, 1
L8002611c:
  sh $v0, 774($gp)
L80026120:
  sll $v0, $v0, 0x10
L80026124:
  sra $a1, $v0, 0x10
L80026128:
  slti $v0, $a1, 5
L8002612c:
  beq $v0, $zero, L80026214
L80026130:
  lui $a0, 0x8009
L80026134:
  lbu $v1, 717($gp)
L80026138:
  addiu $a0, $a0, 2008
L8002613c:
  sll $v0, $v1, 0x2
L80026140:
  addu $v0, $v0, $v1
L80026144:
  sll $v0, $v0, 0x2
L80026148:
  addiu $v0, $v0, 10
L8002614c:
  addu $v0, $a1, $v0
L80026150:
  addu $v0, $v0, $a0
L80026154:
  lbu $v0, 0($v0)
L80026158:
  addiu $a0, $zero, 8
L8002615c:
  sll $v1, $v0, 0x3
L80026160:
  subu $v1, $v1, $v0
L80026164:
  sll $v1, $v1, 0x2
L80026168:
  lui $v0, 0x801a
L8002616c:
  addiu $v0, $v0, 31448
L80026170:
  jal L8002c604
L80026174:
  addu $s1, $v1, $v0
L80026178:
  addu $s0, $v0, $zero
L8002617c:
  addiu $v0, $zero, 3
L80026180:
  lui $a0, 0x8009
L80026184:
  lh $a2, 774($gp)
L80026188:
  lbu $v1, 717($gp)
L8002618c:
  addiu $a0, $a0, 2048
L80026190:
  sh $v0, 26($s0)
L80026194:
  addiu $a1, $a2, 10
L80026198:
  sll $a1, $a1, 0x2
L8002619c:
  sll $v0, $v1, 0x2
L800261a0:
  addu $v0, $v0, $v1
L800261a4:
  sll $v0, $v0, 0x4
L800261a8:
  addu $a1, $a1, $v0
L800261ac:
  addu $a1, $a1, $a0
L800261b0:
  addiu $a0, $zero, 20
L800261b4:
  sll $v1, $a2, 0x1
L800261b8:
  addu $v1, $v1, $a2
L800261bc:
  lhu $v0, 0($a1)
L800261c0:
  sll $v1, $v1, 0xc
L800261c4:
  sh $zero, 2($s0)
L800261c8:
  sh $v0, 0($s0)
L800261cc:
  lw $v0, 20($s0)
L800261d0:
  lhu $a1, 2($a1)
L800261d4:
  addu $v0, $v0, $v1
L800261d8:
  sw $v0, 20($s0)
L800261dc:
  jal L8003fee0
L800261e0:
  sh $a1, 4($s0)
L800261e4:
  lhu $v0, 22($s1)
L800261e8:
  sll $zero, $zero, 0x0
L800261ec:
  andi $v0, $v0, 0x8000
L800261f0:
  beq $v0, $zero, L80026218
L800261f4:
  sll $zero, $zero, 0x0
L800261f8:
  lh $v0, 18($s1)
L800261fc:
  sll $zero, $zero, 0x0
L80026200:
  bgez $v0, L80026218
L80026204:
  addiu $v0, $zero, 5
L80026208:
  sh $zero, 18($s1)
L8002620c:
  j L80026218
L80026210:
  sh $v0, 26($s0)
L80026214:
  sh $zero, 792($gp)
L80026218:
  lw $ra, 24($sp)
L8002621c:
  lw $s1, 20($sp)
L80026220:
  lw $s0, 16($sp)
L80026224:
  jr $ra
L80026228:
  addiu $sp, $sp, 32
L8002622c:
  addiu $sp, $sp, -24
L80026230:
  sw $ra, 16($sp)
L80026234:
  jal L80024e24
L80026238:
  sll $zero, $zero, 0x0
L8002623c:
  bne $v0, $zero, L8002629c
L80026240:
  lui $v0, 0x200
L80026244:
  lh $a1, 714($gp)
L80026248:
  jal L8002c7e8
L8002624c:
  addu $a0, $zero, $zero
L80026250:
  sh $v0, 664($gp)
L80026254:
  sll $v0, $v0, 0x10
L80026258:
  beq $v0, $zero, L800262c4
L8002625c:
  sll $zero, $zero, 0x0
L80026260:
  jal L8002c68c
L80026264:
  addiu $a0, $zero, 18
L80026268:
  addiu $a0, $zero, 2
L8002626c:
  addiu $v1, $zero, 160
L80026270:
  sh $v1, 0($v0)
L80026274:
  addiu $v1, $zero, 120
L80026278:
  sh $v1, 2($v0)
L8002627c:
  addiu $v1, $zero, 1
L80026280:
  jal L8003fee0
L80026284:
  sh $v1, 26($v0)
L80026288:
  lh $a1, 664($gp)
L8002628c:
  jal L80029164
L80026290:
  addiu $a0, $zero, 1
L80026294:
  j L800262c4
L80026298:
  sll $zero, $zero, 0x0
L8002629c:
  ori $v0, $v0, 0x30
L800262a0:
  lui $v1, 0x800a
L800262a4:
  lw $v1, -20236($v1)
L800262a8:
  lui $a0, 0x800a
L800262ac:
  lw $a0, -20172($a0)
L800262b0:
  and $v1, $v1, $v0
L800262b4:
  or $v1, $v1, $a0
L800262b8:
  bne $v1, $zero, L800262c4
L800262bc:
  sll $zero, $zero, 0x0
L800262c0:
  sh $zero, 792($gp)
L800262c4:
  lw $ra, 16($sp)
L800262c8:
  sll $zero, $zero, 0x0
L800262cc:
  jr $ra
L800262d0:
  addiu $sp, $sp, 24
L800262d4:
  addiu $sp, $sp, -48
L800262d8:
  sw $ra, 44($sp)
L800262dc:
  sw $s2, 40($sp)
L800262e0:
  sw $s1, 36($sp)
L800262e4:
  jal L80024e24
L800262e8:
  sw $s0, 32($sp)
L800262ec:
  bne $v0, $zero, L80026344
L800262f0:
  lui $a0, 0x800f
L800262f4:
  lh $a1, 714($gp)
L800262f8:
  jal L8002c7e8
L800262fc:
  addiu $a0, $a0, -24840
L80026300:
  sh $v0, 664($gp)
L80026304:
  sll $v0, $v0, 0x10
L80026308:
  sra $a0, $v0, 0x10
L8002630c:
  beq $a0, $zero, L80026a20
L80026310:
  sll $zero, $zero, 0x0
L80026314:
  jal 0x80019cc8
L80026318:
  sll $zero, $zero, 0x0
L8002631c:
  jal L8002c604
L80026320:
  addiu $a0, $zero, 22
L80026324:
  lhu $v1, 714($gp)
L80026328:
  ori $a0, $zero, 0x8022
L8002632c:
  sw $v0, 628($gp)
L80026330:
  sh $zero, 776($gp)
L80026334:
  jal L8003ff88
L80026338:
  sh $v1, 26($v0)
L8002633c:
  j L80026a24
L80026340:
  sll $zero, $zero, 0x0
L80026344:
  lhu $v0, 776($gp)
L80026348:
  sll $zero, $zero, 0x0
L8002634c:
  andi $v1, $v0, 0xf
L80026350:
  sltiu $v0, $v1, 6
L80026354:
  beq $v0, $zero, L80026a24
L80026358:
  lui $v0, 0x8001
L8002635c:
  addiu $v0, $v0, 448
L80026360:
  sll $v1, $v1, 0x2
L80026364:
  addu $v1, $v1, $v0
L80026368:
  lw $v0, 0($v1)
L8002636c:
  sll $zero, $zero, 0x0
L80026370:
  jr $v0
L80026374:
  sll $zero, $zero, 0x0
L80026378:
  lw $v0, 628($gp)
L8002637c:
  sll $zero, $zero, 0x0
L80026380:
  lbu $v0, 29($v0)
L80026384:
  sll $zero, $zero, 0x0
L80026388:
  beq $v0, $zero, L80026a24
L8002638c:
  lui $s1, 0x800f
L80026390:
  addiu $s1, $s1, -24848
L80026394:
  lw $v0, 12($s1)
L80026398:
  lw $v1, 8($s1)
L8002639c:
  lbu $v0, 106($v0)
L800263a0:
  lui $s0, 0x801a
L800263a4:
  sb $v0, 660($gp)
L800263a8:
  lbu $v0, 106($v1)
L800263ac:
  addiu $s0, $s0, 31448
L800263b0:
  sll $a0, $v0, 0x3
L800263b4:
  subu $a0, $a0, $v0
L800263b8:
  sll $a0, $a0, 0x2
L800263bc:
  jal L80024914
L800263c0:
  addu $a0, $a0, $s0
L800263c4:
  lw $v0, 12($s1)
L800263c8:
  sll $zero, $zero, 0x0
L800263cc:
  lbu $v0, 106($v0)
L800263d0:
  sll $zero, $zero, 0x0
L800263d4:
  sll $a0, $v0, 0x3
L800263d8:
  subu $a0, $a0, $v0
L800263dc:
  sll $a0, $a0, 0x2
L800263e0:
  jal L80024914
L800263e4:
  addu $a0, $a0, $s0
L800263e8:
  lw $v0, 16($s1)
L800263ec:
  sll $zero, $zero, 0x0
L800263f0:
  lbu $v0, 106($v0)
L800263f4:
  sll $zero, $zero, 0x0
L800263f8:
  sll $a0, $v0, 0x3
L800263fc:
  subu $a0, $a0, $v0
L80026400:
  sll $a0, $a0, 0x2
L80026404:
  jal L80024914
L80026408:
  addu $a0, $a0, $s0
L8002640c:
  addiu $v0, $zero, 1
L80026410:
  sh $v0, 776($gp)
L80026414:
  j L80026a24
L80026418:
  sll $zero, $zero, 0x0
L8002641c:
  lhu $v1, 776($gp)
L80026420:
  lw $s2, 696($gp)
L80026424:
  andi $v0, $v1, 0x80
L80026428:
  bne $v0, $zero, L800264a4
L8002642c:
  addiu $a0, $zero, 1
L80026430:
  addiu $a1, $zero, -1
L80026434:
  ori $v0, $v1, 0x80
L80026438:
  sh $v0, 776($gp)
L8002643c:
  jal L800291e0
L80026440:
  addu $a2, $a1, $zero
L80026444:
  addu $s2, $v0, $zero
L80026448:
  lui $a1, 0xf7ff
L8002644c:
  ori $a1, $a1, 0xffff
L80026450:
  addiu $v0, $zero, 90
L80026454:
  sh $v0, 48($s2)
L80026458:
  addiu $v0, $zero, -34
L8002645c:
  sh $v0, 50($s2)
L80026460:
  addiu $v0, $zero, 24
L80026464:
  sh $v0, 96($s2)
L80026468:
  lw $v0, 4($s2)
L8002646c:
  lhu $v1, 8($s2)
L80026470:
  addu $a0, $s2, $zero
L80026474:
  sh $zero, 70($s2)
L80026478:
  sh $zero, 68($s2)
L8002647c:
  and $v0, $v0, $a1
L80026480:
  ori $v1, $v1, 0x4
L80026484:
  sw $v0, 4($s2)
L80026488:
  jal 0x800429d8
L8002648c:
  sh $v1, 8($s2)
L80026490:
  addiu $v0, $zero, 597
L80026494:
  sh $v0, 56($s2)
L80026498:
  sw $s2, 696($gp)
L8002649c:
  jal L8003fee0
L800264a0:
  addiu $a0, $zero, 38
L800264a4:
  jal 0x80042a28
L800264a8:
  addu $a0, $s2, $zero
L800264ac:
  lhu $v0, 68($s2)
L800264b0:
  lhu $v1, 96($s2)
L800264b4:
  addiu $v0, $v0, 170
L800264b8:
  addiu $v1, $v1, -1
L800264bc:
  sh $v1, 96($s2)
L800264c0:
  sll $v1, $v1, 0x10
L800264c4:
  sh $v0, 68($s2)
L800264c8:
  bgtz $v1, L80026a24
L800264cc:
  sh $v0, 70($s2)
L800264d0:
  addiu $v0, $zero, 4096
L800264d4:
  sh $v0, 70($s2)
L800264d8:
  sh $v0, 68($s2)
L800264dc:
  addiu $v0, $zero, 22
L800264e0:
  sh $v0, 50($s2)
L800264e4:
  addiu $v0, $zero, 2
L800264e8:
  lui $a0, 0x800
L800264ec:
  sh $v0, 776($gp)
L800264f0:
  lw $v0, 4($s2)
L800264f4:
  lhu $v1, 8($s2)
L800264f8:
  or $v0, $v0, $a0
L800264fc:
  andi $v1, $v1, 0xfffb
L80026500:
  sw $v0, 4($s2)
L80026504:
  j L80026a24
L80026508:
  sh $v1, 8($s2)
L8002650c:
  lhu $v1, 776($gp)
L80026510:
  lw $s2, 696($gp)
L80026514:
  andi $v0, $v1, 0x80
L80026518:
  bne $v0, $zero, L8002653c
L8002651c:
  andi $v0, $v1, 0x40
L80026520:
  ori $v0, $v1, 0x80
L80026524:
  sh $v0, 776($gp)
L80026528:
  addiu $v0, $zero, 32
L8002652c:
  sh $v0, 774($gp)
L80026530:
  lhu $v1, 776($gp)
L80026534:
  sll $zero, $zero, 0x0
L80026538:
  andi $v0, $v1, 0x40
L8002653c:
  bne $v0, $zero, L800265fc
L80026540:
  lui $a1, 0x800f
L80026544:
  lhu $v0, 774($gp)
L80026548:
  sll $zero, $zero, 0x0
L8002654c:
  addiu $v0, $v0, -1
L80026550:
  sh $v0, 774($gp)
L80026554:
  sll $v0, $v0, 0x10
L80026558:
  bgtz $v0, L80026a24
L8002655c:
  ori $v0, $v1, 0x40
L80026560:
  sh $v0, 776($gp)
L80026564:
  jal 0x8001944c
L80026568:
  addu $a0, $s2, $zero
L8002656c:
  jal 0x80019564
L80026570:
  addu $a0, $s2, $zero
L80026574:
  lui $s1, 0xf7ff
L80026578:
  lui $s0, 0x800f
L8002657c:
  lui $a0, 0x5000
L80026580:
  sw $v0, -24848($s0)
L80026584:
  lw $v1, 4($v0)
L80026588:
  ori $s1, $s1, 0xffff
L8002658c:
  or $v1, $v1, $a0
L80026590:
  sw $v1, 4($v0)
L80026594:
  lw $v1, -24848($s0)
L80026598:
  addu $a0, $s2, $zero
L8002659c:
  lw $v0, 4($v1)
L800265a0:
  addiu $s0, $s0, -24848
L800265a4:
  and $v0, $v0, $s1
L800265a8:
  jal 0x80019564
L800265ac:
  sw $v0, 4($v1)
L800265b0:
  addu $a0, $v0, $zero
L800265b4:
  addiu $a1, $zero, -1
L800265b8:
  jal 0x800428ec
L800265bc:
  sw $a0, 4($s0)
L800265c0:
  lw $a0, 4($s0)
L800265c4:
  sll $zero, $zero, 0x0
L800265c8:
  lw $v0, 4($a0)
L800265cc:
  lui $v1, 0x6000
L800265d0:
  or $v0, $v0, $v1
L800265d4:
  sw $v0, 4($a0)
L800265d8:
  lw $v1, 4($s0)
L800265dc:
  sll $zero, $zero, 0x0
L800265e0:
  lw $v0, 4($v1)
L800265e4:
  addiu $a0, $zero, 1
L800265e8:
  and $v0, $v0, $s1
L800265ec:
  jal L80029528
L800265f0:
  sw $v0, 4($v1)
L800265f4:
  j L80026a24
L800265f8:
  sll $zero, $zero, 0x0
L800265fc:
  lw $v0, -24848($a1)
L80026600:
  addiu $s0, $a1, -24848
L80026604:
  lh $v1, 68($v0)
L80026608:
  lw $a0, 4($s0)
L8002660c:
  addiu $a2, $v1, 128
L80026610:
  sh $a2, 70($a0)
L80026614:
  sh $a2, 68($a0)
L80026618:
  sh $a2, 70($v0)
L8002661c:
  sh $a2, 68($v0)
L80026620:
  lw $a0, -24848($a1)
L80026624:
  sll $zero, $zero, 0x0
L80026628:
  lbu $a2, 12($a0)
L8002662c:
  sll $zero, $zero, 0x0
L80026630:
  addiu $a2, $a2, -4
L80026634:
  bgez $a2, L80026644
L80026638:
  sll $v0, $a2, 0x10
L8002663c:
  addu $a2, $zero, $zero
L80026640:
  sll $v0, $a2, 0x10
L80026644:
  sll $v1, $a2, 0x8
L80026648:
  or $v0, $v0, $v1
L8002664c:
  or $a2, $a2, $v0
L80026650:
  sw $a2, 12($a0)
L80026654:
  lw $v0, 4($s0)
L80026658:
  bne $a2, $zero, L80026a24
L8002665c:
  sw $a2, 12($v0)
L80026660:
  lw $a0, -24848($a1)
L80026664:
  jal 0x8004036c
L80026668:
  sll $zero, $zero, 0x0
L8002666c:
  lw $a0, 4($s0)
L80026670:
  jal 0x8004036c
L80026674:
  sll $zero, $zero, 0x0
L80026678:
  addiu $v0, $zero, 3
L8002667c:
  sh $v0, 776($gp)
L80026680:
  j L80026a24
L80026684:
  sll $zero, $zero, 0x0
L80026688:
  lui $v0, 0x801a
L8002668c:
  addiu $v0, $v0, 31448
L80026690:
  lbu $a0, 660($gp)
L80026694:
  lhu $a2, 776($gp)
L80026698:
  sll $v1, $a0, 0x3
L8002669c:
  subu $v1, $v1, $a0
L800266a0:
  sll $v1, $v1, 0x2
L800266a4:
  addu $s0, $v1, $v0
L800266a8:
  lui $v0, 0x800f
L800266ac:
  addiu $a3, $v0, -24280
L800266b0:
  andi $v0, $a2, 0x80
L800266b4:
  bne $v0, $zero, L80026730
L800266b8:
  sll $zero, $zero, 0x0
L800266bc:
  lw $v0, 4($s0)
L800266c0:
  lhu $v1, 664($gp)
L800266c4:
  addiu $a0, $a3, 8
L800266c8:
  sh $v1, 0($v0)
L800266cc:
  lw $a1, 4($s0)
L800266d0:
  ori $v0, $a2, 0x80
L800266d4:
  sh $v0, 776($gp)
L800266d8:
  sh $v1, 12($s0)
L800266dc:
  lhu $v0, 40($a3)
L800266e0:
  lhu $v1, 42($a3)
L800266e4:
  lbu $a2, 3($a1)
L800266e8:
  addiu $v0, $v0, 56
L800266ec:
  sh $v0, 8($a3)
L800266f0:
  addiu $v0, $zero, 8
L800266f4:
  sh $v0, 12($a3)
L800266f8:
  addiu $v0, $zero, 88
L800266fc:
  sh $v0, 14($a3)
L80026700:
  lui $v0, 0x8019
L80026704:
  addiu $v0, $v0, -15656
L80026708:
  sh $v1, 10($a3)
L8002670c:
  sll $a1, $a2, 0x1
L80026710:
  addu $a1, $a1, $a2
L80026714:
  sll $a1, $a1, 0x2
L80026718:
  subu $a1, $a1, $a2
L8002671c:
  sll $a1, $a1, 0x7
L80026720:
  jal 0x8007f9d8
L80026724:
  addu $a1, $a1, $v0
L80026728:
  j L80026a24
L8002672c:
  sll $zero, $zero, 0x0
L80026730:
  lw $v0, 4($s0)
L80026734:
  sll $zero, $zero, 0x0
L80026738:
  lb $a1, 2($v0)
L8002673c:
  jal L80024d34
L80026740:
  sll $zero, $zero, 0x0
L80026744:
  lui $a0, 0x800f
L80026748:
  lw $s2, 0($s0)
L8002674c:
  addiu $v0, $zero, -240
L80026750:
  sw $s2, -24848($a0)
L80026754:
  sh $v0, 50($s2)
L80026758:
  lbu $v0, 717($gp)
L8002675c:
  lui $v1, 0x800a
L80026760:
  addiu $v1, $v1, -19616
L80026764:
  addu $v0, $v0, $v1
L80026768:
  lb $v0, 0($v0)
L8002676c:
  sll $zero, $zero, 0x0
L80026770:
  bltz $v0, L800267ac
L80026774:
  addiu $s1, $a0, -24848
L80026778:
  lhu $v0, 22($s0)
L8002677c:
  sll $zero, $zero, 0x0
L80026780:
  andi $v0, $v0, 0xfdff
L80026784:
  jal 0x8008e590
L80026788:
  sh $v0, 22($s0)
L8002678c:
  andi $v0, $v0, 0x1
L80026790:
  beq $v0, $zero, L800269b0
L80026794:
  addiu $v0, $zero, 5
L80026798:
  lhu $v0, 22($s0)
L8002679c:
  sll $zero, $zero, 0x0
L800267a0:
  ori $v0, $v0, 0x200
L800267a4:
  j L800269ac
L800267a8:
  sh $v0, 22($s0)
L800267ac:
  addu $a0, $s0, $zero
L800267b0:
  addiu $a1, $zero, 134
L800267b4:
  jal 0x80017f04
L800267b8:
  addiu $a2, $zero, 240
L800267bc:
  sw $v0, 4($s1)
L800267c0:
  addiu $v0, $zero, 4
L800267c4:
  sh $v0, 776($gp)
L800267c8:
  lui $v0, 0x800f
L800267cc:
  lhu $v1, 776($gp)
L800267d0:
  lw $s2, -24844($v0)
L800267d4:
  andi $v0, $v1, 0x80
L800267d8:
  bne $v0, $zero, L80026818
L800267dc:
  andi $v0, $v1, 0x40
L800267e0:
  ori $v0, $v1, 0x80
L800267e4:
  sh $v0, 776($gp)
L800267e8:
  addiu $v0, $zero, 134
L800267ec:
  sh $v0, 40($s2)
L800267f0:
  addiu $v0, $zero, 42
L800267f4:
  sh $v0, 42($s2)
L800267f8:
  addiu $v0, $zero, 16
L800267fc:
  sh $v0, 44($s2)
L80026800:
  addiu $v0, $zero, 1
L80026804:
  sb $v0, 108($s2)
L80026808:
  lui $v0, 0x8002
L8002680c:
  addiu $v0, $v0, -5008
L80026810:
  j L80026a24
L80026814:
  sw $v0, 36($s2)
L80026818:
  bne $v0, $zero, L800268d0
L8002681c:
  andi $v0, $v1, 0x20
L80026820:
  jal 0x80042b40
L80026824:
  addiu $a0, $zero, 1
L80026828:
  bne $v0, $zero, L80026a24
L8002682c:
  lui $t1, 0x4
L80026830:
  ori $t1, $t1, 0x8000
L80026834:
  addu $a0, $zero, $zero
L80026838:
  addiu $a1, $zero, 33
L8002683c:
  addiu $a2, $zero, 72
L80026840:
  lui $v1, 0x8016
L80026844:
  lbu $t0, 106($s2)
L80026848:
  addiu $v1, $v1, -15324
L8002684c:
  sll $v0, $t0, 0x3
L80026850:
  subu $v0, $v0, $t0
L80026854:
  sll $v0, $v0, 0x2
L80026858:
  addu $v0, $v0, $v1
L8002685c:
  addu $v0, $v0, $t1
L80026860:
  lhu $v1, 14016($v0)
L80026864:
  addiu $v0, $zero, 176
L80026868:
  sw $v0, 16($sp)
L8002686c:
  addiu $v0, $zero, 48
L80026870:
  sw $v0, 20($sp)
L80026874:
  addiu $v0, $zero, 32
L80026878:
  sw $v0, 24($sp)
L8002687c:
  lui $at, 0x800a
L80026880:
  sh $v1, -19656($at)
L80026884:
  jal L80035c38
L80026888:
  addiu $a3, $zero, 110
L8002688c:
  addu $s0, $v0, $zero
L80026890:
  addiu $v0, $zero, 8
L80026894:
  sb $v0, 90($s0)
L80026898:
  addiu $v0, $zero, 16
L8002689c:
  sb $v0, 91($s0)
L800268a0:
  jal L80039794
L800268a4:
  sll $zero, $zero, 0x0
L800268a8:
  lw $v0, 48($s0)
L800268ac:
  sll $zero, $zero, 0x0
L800268b0:
  beq $v0, $zero, L800268a0
L800268b4:
  sll $zero, $zero, 0x0
L800268b8:
  lhu $v0, 776($gp)
L800268bc:
  sll $zero, $zero, 0x0
L800268c0:
  ori $v0, $v0, 0x40
L800268c4:
  sh $v0, 776($gp)
L800268c8:
  j L80026a24
L800268cc:
  sll $zero, $zero, 0x0
L800268d0:
  bne $v0, $zero, L80026994
L800268d4:
  lui $v0, 0x800f
L800268d8:
  addiu $s1, $v0, -20232
L800268dc:
  jal L8003700c
L800268e0:
  addu $a0, $s1, $zero
L800268e4:
  bne $v0, $zero, L80026a24
L800268e8:
  sll $zero, $zero, 0x0
L800268ec:
  lui $v0, 0x800a
L800268f0:
  lhu $v0, -19560($v0)
L800268f4:
  sll $zero, $zero, 0x0
L800268f8:
  andi $v0, $v0, 0xc0
L800268fc:
  beq $v0, $zero, L80026a24
L80026900:
  sll $zero, $zero, 0x0
L80026904:
  jal L8003fee0
L80026908:
  addiu $a0, $zero, 7
L8002690c:
  addiu $v0, $zero, 134
L80026910:
  sh $v0, 40($s2)
L80026914:
  addiu $v0, $zero, -128
L80026918:
  sh $v0, 42($s2)
L8002691c:
  addiu $v0, $zero, 16
L80026920:
  sh $v0, 44($s2)
L80026924:
  addiu $v0, $zero, 1
L80026928:
  sb $v0, 108($s2)
L8002692c:
  lui $v0, 0x8002
L80026930:
  addiu $v0, $v0, -5008
L80026934:
  sw $v0, 36($s2)
L80026938:
  lui $v0, 0x801a
L8002693c:
  lbu $a0, 106($s2)
L80026940:
  addiu $v0, $v0, 31448
L80026944:
  sll $v1, $a0, 0x3
L80026948:
  subu $v1, $v1, $a0
L8002694c:
  sll $v1, $v1, 0x2
L80026950:
  addu $s0, $v1, $v0
L80026954:
  lhu $v0, 22($s0)
L80026958:
  lui $v1, 0x800a
L8002695c:
  lb $v1, -19635($v1)
L80026960:
  andi $v0, $v0, 0xfdff
L80026964:
  beq $v1, $zero, L80026974
L80026968:
  sh $v0, 22($s0)
L8002696c:
  ori $v0, $v0, 0x200
L80026970:
  sh $v0, 22($s0)
L80026974:
  jal L80035b7c
L80026978:
  addu $a0, $s1, $zero
L8002697c:
  lhu $v0, 776($gp)
L80026980:
  sll $zero, $zero, 0x0
L80026984:
  ori $v0, $v0, 0x20
L80026988:
  sh $v0, 776($gp)
L8002698c:
  j L80026a24
L80026990:
  sll $zero, $zero, 0x0
L80026994:
  jal 0x80042b40
L80026998:
  addiu $a0, $zero, 1
L8002699c:
  bne $v0, $zero, L80026a24
L800269a0:
  sll $zero, $zero, 0x0
L800269a4:
  jal 0x8004036c
L800269a8:
  addu $a0, $s2, $zero
L800269ac:
  addiu $v0, $zero, 5
L800269b0:
  sh $v0, 776($gp)
L800269b4:
  j L80026a24
L800269b8:
  sll $zero, $zero, 0x0
L800269bc:
  lui $v0, 0x800f
L800269c0:
  lhu $v1, 776($gp)
L800269c4:
  lw $s2, -24848($v0)
L800269c8:
  andi $v0, $v1, 0x80
L800269cc:
  bne $v0, $zero, L800269f0
L800269d0:
  addu $a0, $s2, $zero
L800269d4:
  ori $v0, $v1, 0x80
L800269d8:
  sh $v0, 776($gp)
L800269dc:
  jal 0x80043178
L800269e0:
  addu $a0, $s2, $zero
L800269e4:
  addiu $v0, $zero, -1024
L800269e8:
  sh $v0, 96($s2)
L800269ec:
  addu $a0, $s2, $zero
L800269f0:
  lh $a1, 48($s2)
L800269f4:
  lh $a3, 96($s2)
L800269f8:
  jal 0x80043230
L800269fc:
  addiu $a2, $zero, -24
L80026a00:
  lhu $v0, 96($s2)
L80026a04:
  sll $zero, $zero, 0x0
L80026a08:
  addiu $v0, $v0, 42
L80026a0c:
  sh $v0, 96($s2)
L80026a10:
  sll $v0, $v0, 0x10
L80026a14:
  bltz $v0, L80026a24
L80026a18:
  addiu $v0, $zero, -24
L80026a1c:
  sh $v0, 50($s2)
L80026a20:
  sh $zero, 792($gp)
L80026a24:
  lw $ra, 44($sp)
L80026a28:
  lw $s2, 40($sp)
L80026a2c:
  lw $s1, 36($sp)
L80026a30:
  lw $s0, 32($sp)
L80026a34:
  jr $ra
L80026a38:
  addiu $sp, $sp, 48
L80026a3c:
  addiu $sp, $sp, -32
L80026a40:
  sw $ra, 28($sp)
L80026a44:
  sw $s2, 24($sp)
L80026a48:
  sw $s1, 20($sp)
L80026a4c:
  jal L80024e24
L80026a50:
  sw $s0, 16($sp)
L80026a54:
  bne $v0, $zero, L80026aa8
L80026a58:
  addu $s0, $zero, $zero
L80026a5c:
  jal L8002c68c
L80026a60:
  addiu $a0, $zero, 23
L80026a64:
  lui $a1, 0x8009
L80026a68:
  lbu $a0, 717($gp)
L80026a6c:
  addiu $a1, $a1, 2048
L80026a70:
  xori $a0, $a0, 0x1
L80026a74:
  sll $v1, $a0, 0x2
L80026a78:
  addu $v1, $v1, $a0
L80026a7c:
  sll $v1, $v1, 0x4
L80026a80:
  addu $v1, $v1, $a1
L80026a84:
  lui $a0, 0x800a
L80026a88:
  lhu $a1, 2($v1)
L80026a8c:
  addiu $a0, $a0, -20672
L80026a90:
  sh $a1, 4($v0)
L80026a94:
  sll $a1, $a1, 0x10
L80026a98:
  jal 0x8008e870
L80026a9c:
  sra $a1, $a1, 0x10
L80026aa0:
  j L80026b1c
L80026aa4:
  sll $zero, $zero, 0x0
L80026aa8:
  lui $v0, 0x8009
L80026aac:
  addiu $s2, $v0, 2008
L80026ab0:
  lui $v0, 0x801a
L80026ab4:
  addiu $s1, $v0, 31448
L80026ab8:
  lbu $v1, 717($gp)
L80026abc:
  sll $zero, $zero, 0x0
L80026ac0:
  sll $v0, $v1, 0x2
L80026ac4:
  addu $v0, $v0, $v1
L80026ac8:
  sll $v0, $v0, 0x2
L80026acc:
  addu $v0, $s0, $v0
L80026ad0:
  addu $v0, $v0, $s2
L80026ad4:
  lbu $v1, 0($v0)
L80026ad8:
  sll $zero, $zero, 0x0
L80026adc:
  sll $v0, $v1, 0x3
L80026ae0:
  subu $v0, $v0, $v1
L80026ae4:
  sll $v0, $v0, 0x2
L80026ae8:
  addu $a0, $v0, $s1
L80026aec:
  lhu $v0, 22($a0)
L80026af0:
  sll $zero, $zero, 0x0
L80026af4:
  andi $v0, $v0, 0x8000
L80026af8:
  beq $v0, $zero, L80026b08
L80026afc:
  sll $zero, $zero, 0x0
L80026b00:
  jal L80024954
L80026b04:
  sll $zero, $zero, 0x0
L80026b08:
  addiu $s0, $s0, 1
L80026b0c:
  slti $v0, $s0, 5
L80026b10:
  bne $v0, $zero, L80026ab8
L80026b14:
  sll $zero, $zero, 0x0
L80026b18:
  sh $zero, 792($gp)
L80026b1c:
  lw $ra, 28($sp)
L80026b20:
  lw $s2, 24($sp)
L80026b24:
  lw $s1, 20($sp)
L80026b28:
  lw $s0, 16($sp)
L80026b2c:
  jr $ra
L80026b30:
  addiu $sp, $sp, 32
L80026b34:
  lhu $a0, 792($gp)
L80026b38:
  addiu $sp, $sp, -24
L80026b3c:
  andi $v0, $a0, 0x8000
L80026b40:
  beq $v0, $zero, L80026b90
L80026b44:
  sw $ra, 16($sp)
L80026b48:
  lui $v0, 0x8009
L80026b4c:
  lh $v1, 672($gp)
L80026b50:
  addiu $v0, $v0, 2772
L80026b54:
  addu $v1, $v1, $v0
L80026b58:
  lbu $v0, 0($v1)
L80026b5c:
  sll $zero, $zero, 0x0
L80026b60:
  sll $v1, $v0, 0x1
L80026b64:
  andi $v0, $a0, 0x4000
L80026b68:
  beq $v0, $zero, L80026b74
L80026b6c:
  lui $v0, 0x8009
L80026b70:
  addiu $v1, $v1, 1
L80026b74:
  addiu $v0, $v0, 2652
L80026b78:
  sll $v1, $v1, 0x2
L80026b7c:
  addu $v1, $v1, $v0
L80026b80:
  lw $v0, 0($v1)
L80026b84:
  sll $zero, $zero, 0x0
L80026b88:
  jalr $ra, $v0
L80026b8c:
  sll $zero, $zero, 0x0
L80026b90:
  lhu $v0, 792($gp)
L80026b94:
  lw $ra, 16($sp)
L80026b98:
  sll $zero, $zero, 0x0
L80026b9c:
  jr $ra
L80026ba0:
  addiu $sp, $sp, 24
L80026ba4:
  addiu $v0, $a0, -301
L80026ba8:
  sltiu $v0, $v0, 50
L80026bac:
  bne $v0, $zero, L80026bd0
L80026bb0:
  slti $v0, $a0, 651
L80026bb4:
  addiu $v0, $a0, -651
L80026bb8:
  sltiu $v0, $v0, 50
L80026bbc:
  bne $v0, $zero, L80026bd0
L80026bc0:
  slti $v0, $a0, 651
L80026bc4:
  addiu $v0, $zero, 721
L80026bc8:
  bne $a0, $v0, L80026c04
L80026bcc:
  slti $v0, $a0, 651
L80026bd0:
  bne $v0, $zero, L80026be8
L80026bd4:
  addiu $v1, $a0, -301
L80026bd8:
  addiu $v0, $zero, 721
L80026bdc:
  bne $a0, $v0, L80026be8
L80026be0:
  addiu $v1, $a0, -601
L80026be4:
  addiu $v1, $zero, 100
L80026be8:
  ori $v0, $zero, 0x8000
L80026bec:
  sh $v1, 672($gp)
L80026bf0:
  sh $a0, 714($gp)
L80026bf4:
  sh $v0, 792($gp)
L80026bf8:
  beq $a1, $zero, L80026c04
L80026bfc:
  ori $v0, $zero, 0xc000
L80026c00:
  sh $v0, 792($gp)
L80026c04:
  jr $ra
L80026c08:
  sll $zero, $zero, 0x0
L80026c0c:
  lbu $v0, 717($gp)
L80026c10:
  addu $a1, $zero, $zero
L80026c14:
  sll $v1, $v0, 0x4
L80026c18:
  subu $v1, $v1, $v0
L80026c1c:
  addu $v1, $v1, $a0
L80026c20:
  sll $a0, $v1, 0x3
L80026c24:
  subu $a0, $a0, $v1
L80026c28:
  sll $a0, $a0, 0x2
L80026c2c:
  lui $v0, 0x801a
L80026c30:
  addiu $v0, $v0, 31448
L80026c34:
  addu $a0, $a0, $v0
L80026c38:
  lhu $v0, 22($a0)
L80026c3c:
  sll $zero, $zero, 0x0
L80026c40:
  andi $v0, $v0, 0x8000
L80026c44:
  beq $v0, $zero, L80026c64
L80026c48:
  addu $v0, $v1, $a1
L80026c4c:
  addiu $a1, $a1, 1
L80026c50:
  slti $v0, $a1, 5
L80026c54:
  bne $v0, $zero, L80026c38
L80026c58:
  addiu $a0, $a0, 28
L80026c5c:
  jr $ra
L80026c60:
  addiu $v0, $zero, -1
L80026c64:
  jr $ra
L80026c68:
  sll $zero, $zero, 0x0
L80026c6c:
  addu $t0, $zero, $zero
L80026c70:
  addu $a3, $t0, $zero
L80026c74:
  lbu $v1, 717($gp)
L80026c78:
  lui $v0, 0x801d
L80026c7c:
  addiu $t1, $v0, 16964
L80026c80:
  sll $v0, $v1, 0x4
L80026c84:
  subu $v0, $v0, $v1
L80026c88:
  addu $v0, $v0, $a1
L80026c8c:
  sll $v1, $v0, 0x3
L80026c90:
  subu $v1, $v1, $v0
L80026c94:
  sll $v1, $v1, 0x2
L80026c98:
  lui $v0, 0x801a
L80026c9c:
  addiu $v0, $v0, 31448
L80026ca0:
  addu $v1, $v1, $v0
L80026ca4:
  addiu $a1, $v1, 12
L80026ca8:
  lhu $v0, 10($a1)
L80026cac:
  sll $zero, $zero, 0x0
L80026cb0:
  andi $v0, $v0, 0x8000
L80026cb4:
  beq $v0, $zero, L80026cf8
L80026cb8:
  sll $zero, $zero, 0x0
L80026cbc:
  lh $v0, 0($a1)
L80026cc0:
  sll $zero, $zero, 0x0
L80026cc4:
  addiu $v0, $v0, -1
L80026cc8:
  sll $v0, $v0, 0x2
L80026ccc:
  addu $v0, $v0, $t1
L80026cd0:
  lw $v0, 0($v0)
L80026cd4:
  sll $zero, $zero, 0x0
L80026cd8:
  sra $v0, $v0, 0x1a
L80026cdc:
  andi $v0, $v0, 0x1f
L80026ce0:
  slt $v0, $v0, $a2
L80026ce4:
  beq $v0, $zero, L80026cf8
L80026ce8:
  sll $zero, $zero, 0x0
L80026cec:
  sw $v1, 0($a0)
L80026cf0:
  addiu $a0, $a0, 4
L80026cf4:
  addiu $t0, $t0, 1
L80026cf8:
  addiu $a3, $a3, 1
L80026cfc:
  addiu $a1, $a1, 28
L80026d00:
  slti $v0, $a3, 5
L80026d04:
  bne $v0, $zero, L80026ca8
L80026d08:
  addiu $v1, $v1, 28
L80026d0c:
  sw $zero, 0($a0)
L80026d10:
  jr $ra
L80026d14:
  addu $v0, $t0, $zero
L80026d18:
  addu $a3, $zero, $zero
L80026d1c:
  addu $t0, $a3, $zero
L80026d20:
  lbu $v1, 717($gp)
L80026d24:
  lui $v0, 0x801d
L80026d28:
  addiu $t1, $v0, 16964
L80026d2c:
  sll $v0, $v1, 0x4
L80026d30:
  subu $v0, $v0, $v1
L80026d34:
  addu $v0, $v0, $a1
L80026d38:
  sll $v1, $v0, 0x3
L80026d3c:
  subu $v1, $v1, $v0
L80026d40:
  sll $v1, $v1, 0x2
L80026d44:
  lui $v0, 0x801a
L80026d48:
  addiu $v0, $v0, 31448
L80026d4c:
  addu $v1, $v1, $v0
L80026d50:
  addiu $a1, $v1, 12
L80026d54:
  lhu $v0, 10($a1)
L80026d58:
  sll $zero, $zero, 0x0
L80026d5c:
  andi $v0, $v0, 0x8000
L80026d60:
  beq $v0, $zero, L80026da8
L80026d64:
  sll $zero, $zero, 0x0
L80026d68:
  bltz $a2, L80026d9c
L80026d6c:
  sll $zero, $zero, 0x0
L80026d70:
  lh $v0, 0($a1)
L80026d74:
  sll $zero, $zero, 0x0
L80026d78:
  addiu $v0, $v0, -1
L80026d7c:
  sll $v0, $v0, 0x2
L80026d80:
  addu $v0, $v0, $t1
L80026d84:
  lw $v0, 0($v0)
L80026d88:
  sll $zero, $zero, 0x0
L80026d8c:
  sra $v0, $v0, 0x1a
L80026d90:
  andi $v0, $v0, 0x1f
L80026d94:
  bne $v0, $a2, L80026da8
L80026d98:
  sll $zero, $zero, 0x0
L80026d9c:
  sw $v1, 0($a0)
L80026da0:
  addiu $a0, $a0, 4
L80026da4:
  addiu $a3, $a3, 1
L80026da8:
  addiu $t0, $t0, 1
L80026dac:
  addiu $a1, $a1, 28
L80026db0:
  slti $v0, $t0, 5
L80026db4:
  bne $v0, $zero, L80026d54
L80026db8:
  addiu $v1, $v1, 28
L80026dbc:
  sw $zero, 0($a0)
L80026dc0:
  jr $ra
L80026dc4:
  addu $v0, $a3, $zero
L80026dc8:
  addiu $sp, $sp, -88
L80026dcc:
  sw $s0, 64($sp)
L80026dd0:
  addiu $s0, $sp, 40
L80026dd4:
  addu $a0, $s0, $zero
L80026dd8:
  addu $a1, $zero, $zero
L80026ddc:
  addiu $a2, $zero, 23
L80026de0:
  sw $ra, 84($sp)
L80026de4:
  sw $s4, 80($sp)
L80026de8:
  sw $s3, 76($sp)
L80026dec:
  sw $s2, 72($sp)
L80026df0:
  jal L80026d18
L80026df4:
  sw $s1, 68($sp)
L80026df8:
  beq $v0, $zero, L8002703c
L80026dfc:
  addiu $a0, $sp, 16
L80026e00:
  addiu $a1, $zero, 5
L80026e04:
  jal L80026d18
L80026e08:
  addiu $a2, $zero, -1
L80026e0c:
  lw $s2, 40($sp)
L80026e10:
  sll $zero, $zero, 0x0
L80026e14:
  beq $s2, $zero, L80026e70
L80026e18:
  sll $zero, $zero, 0x0
L80026e1c:
  addu $s3, $s0, $zero
L80026e20:
  lw $s1, 16($sp)
L80026e24:
  sll $zero, $zero, 0x0
L80026e28:
  beq $s1, $zero, L80026e5c
L80026e2c:
  sll $zero, $zero, 0x0
L80026e30:
  addiu $s0, $sp, 16
L80026e34:
  lh $a0, 12($s2)
L80026e38:
  lh $a1, 12($s1)
L80026e3c:
  jal 0x80019a08
L80026e40:
  sll $zero, $zero, 0x0
L80026e44:
  bne $v0, $zero, L80026e8c
L80026e48:
  addiu $s0, $s0, 4
L80026e4c:
  lw $s1, 0($s0)
L80026e50:
  sll $zero, $zero, 0x0
L80026e54:
  bne $s1, $zero, L80026e34
L80026e58:
  sll $zero, $zero, 0x0
L80026e5c:
  addiu $s3, $s3, 4
L80026e60:
  lw $s2, 0($s3)
L80026e64:
  sll $zero, $zero, 0x0
L80026e68:
  bne $s2, $zero, L80026e20
L80026e6c:
  sll $zero, $zero, 0x0
L80026e70:
  jal L80026c0c
L80026e74:
  addiu $a0, $zero, 5
L80026e78:
  addu $s4, $v0, $zero
L80026e7c:
  bgez $s4, L80026fd0
L80026e80:
  addiu $a0, $sp, 16
L80026e84:
  j L80027040
L80026e88:
  addiu $v0, $zero, 1
L80026e8c:
  lui $a3, 0x6666
L80026e90:
  lbu $v0, 24($s2)
L80026e94:
  ori $a3, $a3, 0x6667
L80026e98:
  sll $v0, $v0, 0x18
L80026e9c:
  sra $a0, $v0, 0x18
L80026ea0:
  mult $a0, $a3
L80026ea4:
  lui $a1, 0x800f
L80026ea8:
  addiu $a2, $a1, -20856
L80026eac:
  sb $zero, 1($a2)
L80026eb0:
  sra $v0, $v0, 0x1f
L80026eb4:
  mfhi $t2
L80026eb8:
  sra $v1, $t2, 0x1
L80026ebc:
  subu $v1, $v1, $v0
L80026ec0:
  sll $v0, $v1, 0x2
L80026ec4:
  addu $v0, $v0, $v1
L80026ec8:
  subu $a0, $a0, $v0
L80026ecc:
  addiu $a0, $a0, 11
L80026ed0:
  sb $a0, -20856($a1)
L80026ed4:
  lbu $v1, 24($s1)
L80026ed8:
  sll $zero, $zero, 0x0
L80026edc:
  sll $v1, $v1, 0x18
L80026ee0:
  sra $a1, $v1, 0x18
L80026ee4:
  mult $a1, $a3
L80026ee8:
  addu $v0, $zero, $zero
L80026eec:
  sb $zero, 7($a2)
L80026ef0:
  sb $zero, 8($a2)
L80026ef4:
  sra $v1, $v1, 0x1f
L80026ef8:
  mfhi $t2
L80026efc:
  sra $a0, $t2, 0x1
L80026f00:
  subu $a0, $a0, $v1
L80026f04:
  sll $v1, $a0, 0x2
L80026f08:
  addu $v1, $v1, $a0
L80026f0c:
  subu $a1, $a1, $v1
L80026f10:
  addiu $a1, $a1, 1
L80026f14:
  j L80027040
L80026f18:
  sb $a1, 6($a2)
L80026f1c:
  lui $t0, 0x6666
L80026f20:
  lbu $v1, 24($s1)
L80026f24:
  ori $t0, $t0, 0x6667
L80026f28:
  sll $v1, $v1, 0x18
L80026f2c:
  sra $a1, $v1, 0x18
L80026f30:
  mult $a1, $t0
L80026f34:
  mfhi $a3
L80026f38:
  addu $v0, $zero, $zero
L80026f3c:
  lui $a2, 0x800f
L80026f40:
  mult $s4, $t0
L80026f44:
  sra $v1, $v1, 0x1f
L80026f48:
  sra $a0, $a3, 0x1
L80026f4c:
  subu $a0, $a0, $v1
L80026f50:
  sll $v1, $a0, 0x2
L80026f54:
  addu $v1, $v1, $a0
L80026f58:
  subu $a1, $a1, $v1
L80026f5c:
  addiu $a1, $a1, 11
L80026f60:
  sb $a1, -20856($a2)
L80026f64:
  addiu $a2, $a2, -20856
L80026f68:
  sra $v1, $s4, 0x1f
L80026f6c:
  lbu $a1, 24($s2)
L80026f70:
  mfhi $t1
L80026f74:
  sll $a1, $a1, 0x18
L80026f78:
  sra $a3, $a1, 0x18
L80026f7c:
  mult $a3, $t0
L80026f80:
  sb $zero, 2($a2)
L80026f84:
  sb $zero, 7($a2)
L80026f88:
  sb $zero, 8($a2)
L80026f8c:
  sra $a1, $a1, 0x1f
L80026f90:
  sra $a0, $t1, 0x1
L80026f94:
  subu $a0, $a0, $v1
L80026f98:
  sll $v1, $a0, 0x2
L80026f9c:
  addu $v1, $v1, $a0
L80026fa0:
  subu $v1, $s4, $v1
L80026fa4:
  addiu $v1, $v1, 1
L80026fa8:
  sb $v1, 6($a2)
L80026fac:
  mfhi $t0
L80026fb0:
  sra $a0, $t0, 0x1
L80026fb4:
  subu $a0, $a0, $a1
L80026fb8:
  sll $v1, $a0, 0x2
L80026fbc:
  addu $v1, $v1, $a0
L80026fc0:
  subu $a3, $a3, $v1
L80026fc4:
  addiu $a3, $a3, 11
L80026fc8:
  j L80027040
L80026fcc:
  sb $a3, 1($a2)
L80026fd0:
  addu $a1, $zero, $zero
L80026fd4:
  jal L80026c6c
L80026fd8:
  addiu $a2, $zero, 20
L80026fdc:
  lw $s2, 40($sp)
L80026fe0:
  sll $zero, $zero, 0x0
L80026fe4:
  beq $s2, $zero, L8002703c
L80026fe8:
  addiu $s3, $sp, 40
L80026fec:
  lw $s1, 16($sp)
L80026ff0:
  sll $zero, $zero, 0x0
L80026ff4:
  beq $s1, $zero, L80027028
L80026ff8:
  sll $zero, $zero, 0x0
L80026ffc:
  addiu $s0, $sp, 16
L80027000:
  lh $a0, 12($s2)
L80027004:
  lh $a1, 12($s1)
L80027008:
  jal 0x80019a08
L8002700c:
  sll $zero, $zero, 0x0
L80027010:
  bne $v0, $zero, L80026f1c
L80027014:
  addiu $s0, $s0, 4
L80027018:
  lw $s1, 0($s0)
L8002701c:
  sll $zero, $zero, 0x0
L80027020:
  bne $s1, $zero, L80027000
L80027024:
  sll $zero, $zero, 0x0
L80027028:
  addiu $s3, $s3, 4
L8002702c:
  lw $s2, 0($s3)
L80027030:
  sll $zero, $zero, 0x0
L80027034:
  bne $s2, $zero, L80026fec
L80027038:
  sll $zero, $zero, 0x0
L8002703c:
  addiu $v0, $zero, 1
L80027040:
  lw $ra, 84($sp)
L80027044:
  lw $s4, 80($sp)
L80027048:
  lw $s3, 76($sp)
L8002704c:
  lw $s2, 72($sp)
L80027050:
  lw $s1, 68($sp)
L80027054:
  lw $s0, 64($sp)
L80027058:
  jr $ra
L8002705c:
  addiu $sp, $sp, 88
L80027060:
  addiu $sp, $sp, -48
L80027064:
  sw $ra, 40($sp)
L80027068:
  addiu $a0, $sp, 16
L8002706c:
  addu $a1, $zero, $zero
L80027070:
  jal L80026d18
L80027074:
  addiu $a2, $zero, 21
L80027078:
  beq $v0, $zero, L8002711c
L8002707c:
  addiu $v0, $zero, 1
L80027080:
  jal L80026c0c
L80027084:
  addiu $a0, $zero, 10
L80027088:
  addu $t1, $v0, $zero
L8002708c:
  bltz $t1, L80027118
L80027090:
  lui $a0, 0x6666
L80027094:
  ori $a0, $a0, 0x6667
L80027098:
  mult $t1, $a0
L8002709c:
  addu $v0, $zero, $zero
L800270a0:
  lui $t0, 0x800f
L800270a4:
  lw $v1, 16($sp)
L800270a8:
  addiu $a3, $t0, -20856
L800270ac:
  lbu $a1, 24($v1)
L800270b0:
  addiu $v1, $zero, 1
L800270b4:
  sb $v1, 8($a3)
L800270b8:
  mfhi $t2
L800270bc:
  sll $a1, $a1, 0x18
L800270c0:
  sra $a2, $a1, 0x18
L800270c4:
  mult $a2, $a0
L800270c8:
  sra $v1, $t1, 0x1f
L800270cc:
  sb $zero, 1($a3)
L800270d0:
  sb $zero, 7($a3)
L800270d4:
  sra $a1, $a1, 0x1f
L800270d8:
  sra $a0, $t2, 0x1
L800270dc:
  subu $a0, $a0, $v1
L800270e0:
  sll $v1, $a0, 0x2
L800270e4:
  addu $v1, $v1, $a0
L800270e8:
  subu $v1, $t1, $v1
L800270ec:
  addiu $v1, $v1, 6
L800270f0:
  sb $v1, 6($a3)
L800270f4:
  mfhi $t4
L800270f8:
  sra $a0, $t4, 0x1
L800270fc:
  subu $a0, $a0, $a1
L80027100:
  sll $v1, $a0, 0x2
L80027104:
  addu $v1, $v1, $a0
L80027108:
  subu $a2, $a2, $v1
L8002710c:
  addiu $a2, $a2, 11
L80027110:
  j L8002711c
L80027114:
  sb $a2, -20856($t0)
L80027118:
  addiu $v0, $zero, 1
L8002711c:
  lw $ra, 40($sp)
L80027120:
  sll $zero, $zero, 0x0
L80027124:
  jr $ra
L80027128:
  addiu $sp, $sp, 48
L8002712c:
  addiu $sp, $sp, -56
L80027130:
  addiu $a0, $sp, 16
L80027134:
  addu $a1, $zero, $zero
L80027138:
  addiu $a2, $zero, 20
L8002713c:
  sw $ra, 52($sp)
L80027140:
  sw $s2, 48($sp)
L80027144:
  sw $s1, 44($sp)
L80027148:
  jal L80026d18
L8002714c:
  sw $s0, 40($sp)
L80027150:
  beq $v0, $zero, L8002720c
L80027154:
  lui $s2, 0x6666
L80027158:
  lw $v0, 16($sp)
L8002715c:
  sll $zero, $zero, 0x0
L80027160:
  lbu $a1, 24($v0)
L80027164:
  ori $s2, $s2, 0x6667
L80027168:
  sll $a1, $a1, 0x18
L8002716c:
  sra $a2, $a1, 0x18
L80027170:
  mult $a2, $s2
L80027174:
  addiu $a0, $zero, 10
L80027178:
  lui $a3, 0x800f
L8002717c:
  addiu $s1, $a3, -20856
L80027180:
  addiu $v0, $zero, 6
L80027184:
  sb $zero, 1($s1)
L80027188:
  sb $zero, 7($s1)
L8002718c:
  sb $zero, 8($s1)
L80027190:
  sb $v0, 6($s1)
L80027194:
  sra $a1, $a1, 0x1f
L80027198:
  mfhi $t0
L8002719c:
  sra $v1, $t0, 0x1
L800271a0:
  subu $v1, $v1, $a1
L800271a4:
  sll $v0, $v1, 0x2
L800271a8:
  addu $v0, $v0, $v1
L800271ac:
  subu $a2, $a2, $v0
L800271b0:
  addiu $a2, $a2, 11
L800271b4:
  jal L80026c0c
L800271b8:
  sb $a2, -20856($a3)
L800271bc:
  addu $s0, $v0, $zero
L800271c0:
  bltz $s0, L80027204
L800271c4:
  sll $zero, $zero, 0x0
L800271c8:
  jal 0x8008e590
L800271cc:
  sll $zero, $zero, 0x0
L800271d0:
  mult $s0, $s2
L800271d4:
  andi $v0, $v0, 0x1
L800271d8:
  sb $v0, 8($s1)
L800271dc:
  sra $v0, $s0, 0x1f
L800271e0:
  mfhi $t0
L800271e4:
  sra $v1, $t0, 0x1
L800271e8:
  subu $v1, $v1, $v0
L800271ec:
  sll $v0, $v1, 0x2
L800271f0:
  addu $v0, $v0, $v1
L800271f4:
  lbu $v1, 6($s1)
L800271f8:
  subu $v0, $s0, $v0
L800271fc:
  addu $v1, $v1, $v0
L80027200:
  sb $v1, 6($s1)
L80027204:
  j L80027210
L80027208:
  addu $v0, $zero, $zero
L8002720c:
  addiu $v0, $zero, 1
L80027210:
  lw $ra, 52($sp)
L80027214:
  lw $s2, 48($sp)
L80027218:
  lw $s1, 44($sp)
L8002721c:
  lw $s0, 40($sp)
L80027220:
  jr $ra
L80027224:
  addiu $sp, $sp, 56
L80027228:
  addiu $sp, $sp, -88
L8002722c:
  sw $s0, 64($sp)
L80027230:
  addiu $s0, $sp, 40
L80027234:
  addu $a0, $s0, $zero
L80027238:
  addu $a1, $zero, $zero
L8002723c:
  addiu $a2, $zero, 20
L80027240:
  sw $ra, 84($sp)
L80027244:
  sw $s4, 80($sp)
L80027248:
  sw $s3, 76($sp)
L8002724c:
  sw $s2, 72($sp)
L80027250:
  jal L80026c6c
L80027254:
  sw $s1, 68($sp)
L80027258:
  beq $v0, $zero, L800274e4
L8002725c:
  addiu $v0, $v0, -1
L80027260:
  beq $v0, $zero, L80027270
L80027264:
  sll $zero, $zero, 0x0
L80027268:
  jal L800358fc
L8002726c:
  addiu $a0, $v0, 1
L80027270:
  jal 0x8008e590
L80027274:
  sll $zero, $zero, 0x0
L80027278:
  andi $v0, $v0, 0x1
L8002727c:
  beq $v0, $zero, L800274e4
L80027280:
  addiu $a0, $sp, 16
L80027284:
  addiu $a1, $zero, 5
L80027288:
  jal L80026d18
L8002728c:
  addiu $a2, $zero, -1
L80027290:
  lw $s1, 40($sp)
L80027294:
  sll $zero, $zero, 0x0
L80027298:
  beq $s1, $zero, L800272f4
L8002729c:
  sll $zero, $zero, 0x0
L800272a0:
  addu $s3, $s0, $zero
L800272a4:
  lw $s2, 16($sp)
L800272a8:
  sll $zero, $zero, 0x0
L800272ac:
  beq $s2, $zero, L800272e0
L800272b0:
  sll $zero, $zero, 0x0
L800272b4:
  addiu $s0, $sp, 16
L800272b8:
  lh $a0, 12($s1)
L800272bc:
  lh $a1, 12($s2)
L800272c0:
  jal 0x80019a60
L800272c4:
  sll $zero, $zero, 0x0
L800272c8:
  bne $v0, $zero, L80027310
L800272cc:
  addiu $s0, $s0, 4
L800272d0:
  lw $s2, 0($s0)
L800272d4:
  sll $zero, $zero, 0x0
L800272d8:
  bne $s2, $zero, L800272b8
L800272dc:
  sll $zero, $zero, 0x0
L800272e0:
  addiu $s3, $s3, 4
L800272e4:
  lw $s1, 0($s3)
L800272e8:
  sll $zero, $zero, 0x0
L800272ec:
  bne $s1, $zero, L800272a4
L800272f0:
  sll $zero, $zero, 0x0
L800272f4:
  jal L80026c0c
L800272f8:
  addiu $a0, $zero, 5
L800272fc:
  addu $s4, $v0, $zero
L80027300:
  bgez $s4, L80027458
L80027304:
  addiu $a0, $sp, 16
L80027308:
  j L800274e8
L8002730c:
  addiu $v0, $zero, 1
L80027310:
  lui $a2, 0x6666
L80027314:
  lbu $v0, 24($s1)
L80027318:
  ori $a2, $a2, 0x6667
L8002731c:
  sll $v0, $v0, 0x18
L80027320:
  sra $a0, $v0, 0x18
L80027324:
  mult $a0, $a2
L80027328:
  lui $a1, 0x800f
L8002732c:
  addiu $s0, $a1, -20856
L80027330:
  sb $zero, 1($s0)
L80027334:
  sra $v0, $v0, 0x1f
L80027338:
  mfhi $t0
L8002733c:
  sra $v1, $t0, 0x1
L80027340:
  subu $v1, $v1, $v0
L80027344:
  sll $v0, $v1, 0x2
L80027348:
  addu $v0, $v0, $v1
L8002734c:
  subu $a0, $a0, $v0
L80027350:
  addiu $a0, $a0, 11
L80027354:
  sb $a0, -20856($a1)
L80027358:
  lbu $v0, 24($s2)
L8002735c:
  sll $zero, $zero, 0x0
L80027360:
  sll $v0, $v0, 0x18
L80027364:
  sra $a0, $v0, 0x18
L80027368:
  mult $a0, $a2
L8002736c:
  sra $v0, $v0, 0x1f
L80027370:
  mfhi $t0
L80027374:
  sra $v1, $t0, 0x1
L80027378:
  subu $v1, $v1, $v0
L8002737c:
  sll $v0, $v1, 0x2
L80027380:
  addu $v0, $v0, $v1
L80027384:
  subu $a0, $a0, $v0
L80027388:
  addiu $a0, $a0, 1
L8002738c:
  j L8002743c
L80027390:
  sb $a0, 6($s0)
L80027394:
  lbu $v0, 24($s1)
L80027398:
  ori $a2, $a2, 0x6667
L8002739c:
  sll $v0, $v0, 0x18
L800273a0:
  sra $a0, $v0, 0x18
L800273a4:
  mult $a0, $a2
L800273a8:
  mfhi $v1
L800273ac:
  sll $zero, $zero, 0x0
L800273b0:
  sll $zero, $zero, 0x0
L800273b4:
  mult $s4, $a2
L800273b8:
  lui $s0, 0x800f
L800273bc:
  sra $v0, $v0, 0x1f
L800273c0:
  sra $v1, $v1, 0x1
L800273c4:
  subu $v1, $v1, $v0
L800273c8:
  sll $v0, $v1, 0x2
L800273cc:
  addu $v0, $v0, $v1
L800273d0:
  subu $a0, $a0, $v0
L800273d4:
  addiu $a0, $a0, 11
L800273d8:
  sb $a0, -20856($s0)
L800273dc:
  lbu $a0, 24($s2)
L800273e0:
  mfhi $a3
L800273e4:
  sll $a0, $a0, 0x18
L800273e8:
  sra $a1, $a0, 0x18
L800273ec:
  mult $a1, $a2
L800273f0:
  addiu $s0, $s0, -20856
L800273f4:
  sra $v0, $s4, 0x1f
L800273f8:
  sb $zero, 2($s0)
L800273fc:
  sra $a0, $a0, 0x1f
L80027400:
  sra $v1, $a3, 0x1
L80027404:
  subu $v1, $v1, $v0
L80027408:
  sll $v0, $v1, 0x2
L8002740c:
  addu $v0, $v0, $v1
L80027410:
  subu $v0, $s4, $v0
L80027414:
  addiu $v0, $v0, 1
L80027418:
  sb $v0, 6($s0)
L8002741c:
  mfhi $t1
L80027420:
  sra $v1, $t1, 0x1
L80027424:
  subu $v1, $v1, $a0
L80027428:
  sll $v0, $v1, 0x2
L8002742c:
  addu $v0, $v0, $v1
L80027430:
  subu $a1, $a1, $v0
L80027434:
  addiu $a1, $a1, 11
L80027438:
  sb $a1, 1($s0)
L8002743c:
  jal 0x8008e590
L80027440:
  sll $zero, $zero, 0x0
L80027444:
  andi $v1, $v0, 0x1
L80027448:
  addu $v0, $zero, $zero
L8002744c:
  sb $v1, 7($s0)
L80027450:
  j L800274e8
L80027454:
  sb $zero, 8($s0)
L80027458:
  addu $a1, $zero, $zero
L8002745c:
  jal L80026c6c
L80027460:
  addiu $a2, $zero, 20
L80027464:
  lw $s1, 40($sp)
L80027468:
  sll $zero, $zero, 0x0
L8002746c:
  beq $s1, $zero, L800274e4
L80027470:
  addu $s3, $zero, $zero
L80027474:
  lw $s2, 16($sp)
L80027478:
  sll $zero, $zero, 0x0
L8002747c:
  beq $s2, $zero, L800274c8
L80027480:
  sll $zero, $zero, 0x0
L80027484:
  addiu $s0, $sp, 16
L80027488:
  lb $v1, 24($s1)
L8002748c:
  lb $v0, 24($s2)
L80027490:
  sll $zero, $zero, 0x0
L80027494:
  beq $v1, $v0, L800274b4
L80027498:
  sll $zero, $zero, 0x0
L8002749c:
  lh $a0, 12($s1)
L800274a0:
  lh $a1, 12($s2)
L800274a4:
  jal 0x80019a60
L800274a8:
  sll $zero, $zero, 0x0
L800274ac:
  bne $v0, $zero, L80027394
L800274b0:
  lui $a2, 0x6666
L800274b4:
  addiu $s0, $s0, 4
L800274b8:
  lw $s2, 0($s0)
L800274bc:
  sll $zero, $zero, 0x0
L800274c0:
  bne $s2, $zero, L80027488
L800274c4:
  sll $zero, $zero, 0x0
L800274c8:
  addiu $s3, $s3, 1
L800274cc:
  sll $v0, $s3, 0x2
L800274d0:
  addu $v0, $sp, $v0
L800274d4:
  lw $s1, 40($v0)
L800274d8:
  sll $zero, $zero, 0x0
L800274dc:
  bne $s1, $zero, L80027474
L800274e0:
  sll $zero, $zero, 0x0
L800274e4:
  addiu $v0, $zero, 1
L800274e8:
  lw $ra, 84($sp)
L800274ec:
  lw $s4, 80($sp)
L800274f0:
  lw $s3, 76($sp)
L800274f4:
  lw $s2, 72($sp)
L800274f8:
  lw $s1, 68($sp)
L800274fc:
  lw $s0, 64($sp)
L80027500:
  jr $ra
L80027504:
  addiu $sp, $sp, 88
L80027508:
  addiu $sp, $sp, -32
L8002750c:
  sw $ra, 28($sp)
L80027510:
  sw $s2, 24($sp)
L80027514:
  sw $s1, 20($sp)
L80027518:
  jal 0x8008e590
L8002751c:
  sw $s0, 16($sp)
L80027520:
  andi $v0, $v0, 0x1
L80027524:
  bne $v0, $zero, L8002753c
L80027528:
  sll $zero, $zero, 0x0
L8002752c:
  jal L80026dc8
L80027530:
  sll $zero, $zero, 0x0
L80027534:
  beq $v0, $zero, L80027774
L80027538:
  addu $v0, $zero, $zero
L8002753c:
  jal 0x8008e590
L80027540:
  sll $zero, $zero, 0x0
L80027544:
  andi $v0, $v0, 0x1
L80027548:
  bne $v0, $zero, L80027560
L8002754c:
  sll $zero, $zero, 0x0
L80027550:
  jal L80027060
L80027554:
  sll $zero, $zero, 0x0
L80027558:
  beq $v0, $zero, L80027774
L8002755c:
  addu $v0, $zero, $zero
L80027560:
  jal 0x8008e590
L80027564:
  sll $zero, $zero, 0x0
L80027568:
  andi $v0, $v0, 0x3
L8002756c:
  bne $v0, $zero, L80027584
L80027570:
  sll $zero, $zero, 0x0
L80027574:
  jal L8002712c
L80027578:
  sll $zero, $zero, 0x0
L8002757c:
  beq $v0, $zero, L80027774
L80027580:
  addu $v0, $zero, $zero
L80027584:
  jal L80027228
L80027588:
  sll $zero, $zero, 0x0
L8002758c:
  beq $v0, $zero, L80027774
L80027590:
  addu $v0, $zero, $zero
L80027594:
  jal L800358fc
L80027598:
  addiu $a0, $zero, 5
L8002759c:
  lbu $a0, 717($gp)
L800275a0:
  sll $zero, $zero, 0x0
L800275a4:
  sll $v1, $a0, 0x4
L800275a8:
  subu $v1, $v1, $a0
L800275ac:
  addu $v1, $v1, $v0
L800275b0:
  sll $a0, $v1, 0x3
L800275b4:
  subu $a0, $a0, $v1
L800275b8:
  sll $a0, $a0, 0x2
L800275bc:
  lui $v0, 0x801a
L800275c0:
  addiu $v0, $v0, 31448
L800275c4:
  addu $s1, $a0, $v0
L800275c8:
  lui $v1, 0x801d
L800275cc:
  lh $v0, 12($s1)
L800275d0:
  addiu $s2, $v1, 16964
L800275d4:
  addiu $v0, $v0, -1
L800275d8:
  sll $v0, $v0, 0x2
L800275dc:
  addu $v0, $v0, $s2
L800275e0:
  lw $v0, 0($v0)
L800275e4:
  sll $zero, $zero, 0x0
L800275e8:
  sra $v0, $v0, 0x1a
L800275ec:
  andi $v0, $v0, 0x1f
L800275f0:
  slti $v0, $v0, 20
L800275f4:
  beq $v0, $zero, L8002769c
L800275f8:
  sll $zero, $zero, 0x0
L800275fc:
  jal L80026c0c
L80027600:
  addiu $a0, $zero, 5
L80027604:
  addu $a3, $v0, $zero
L80027608:
  bgez $a3, L80027620
L8002760c:
  lui $v0, 0x6666
L80027610:
  jal L800358fc
L80027614:
  addiu $a0, $zero, 5
L80027618:
  addu $a3, $v0, $zero
L8002761c:
  lui $v0, 0x6666
L80027620:
  ori $v0, $v0, 0x6667
L80027624:
  mult $a3, $v0
L80027628:
  lui $a2, 0x800f
L8002762c:
  lbu $a0, 24($s1)
L80027630:
  mfhi $v1
L80027634:
  sll $a0, $a0, 0x18
L80027638:
  sra $a1, $a0, 0x18
L8002763c:
  mult $a1, $v0
L80027640:
  addiu $s0, $a2, -20856
L80027644:
  sb $zero, 1($s0)
L80027648:
  sra $a0, $a0, 0x1f
L8002764c:
  sra $v1, $v1, 0x1
L80027650:
  sra $v0, $a3, 0x1f
L80027654:
  subu $v1, $v1, $v0
L80027658:
  sll $v0, $v1, 0x2
L8002765c:
  addu $v0, $v0, $v1
L80027660:
  subu $v0, $a3, $v0
L80027664:
  addiu $v0, $v0, 1
L80027668:
  sb $v0, 6($s0)
L8002766c:
  mfhi $t0
L80027670:
  sra $v1, $t0, 0x1
L80027674:
  subu $v1, $v1, $a0
L80027678:
  sll $v0, $v1, 0x2
L8002767c:
  addu $v0, $v0, $v1
L80027680:
  subu $a1, $a1, $v0
L80027684:
  addiu $a1, $a1, 11
L80027688:
  jal 0x8008e590
L8002768c:
  sb $a1, -20856($a2)
L80027690:
  andi $v0, $v0, 0x1
L80027694:
  j L80027768
L80027698:
  sb $v0, 7($s0)
L8002769c:
  jal L80026c0c
L800276a0:
  addiu $a0, $zero, 10
L800276a4:
  addu $a3, $v0, $zero
L800276a8:
  bgez $a3, L800276c0
L800276ac:
  lui $v0, 0x6666
L800276b0:
  jal L800358fc
L800276b4:
  addiu $a0, $zero, 5
L800276b8:
  addu $a3, $v0, $zero
L800276bc:
  lui $v0, 0x6666
L800276c0:
  ori $v0, $v0, 0x6667
L800276c4:
  mult $a3, $v0
L800276c8:
  lui $a2, 0x800f
L800276cc:
  addiu $s0, $a2, -20856
L800276d0:
  lbu $a0, 24($s1)
L800276d4:
  mfhi $v1
L800276d8:
  sll $a0, $a0, 0x18
L800276dc:
  sra $a1, $a0, 0x18
L800276e0:
  mult $a1, $v0
L800276e4:
  sb $zero, 1($s0)
L800276e8:
  sb $zero, 7($s0)
L800276ec:
  sra $a0, $a0, 0x1f
L800276f0:
  sra $v1, $v1, 0x1
L800276f4:
  sra $v0, $a3, 0x1f
L800276f8:
  subu $v1, $v1, $v0
L800276fc:
  sll $v0, $v1, 0x2
L80027700:
  addu $v0, $v0, $v1
L80027704:
  subu $v0, $a3, $v0
L80027708:
  addiu $v0, $v0, 6
L8002770c:
  sb $v0, 6($s0)
L80027710:
  mfhi $t0
L80027714:
  sra $v1, $t0, 0x1
L80027718:
  subu $v1, $v1, $a0
L8002771c:
  sll $v0, $v1, 0x2
L80027720:
  addu $v0, $v0, $v1
L80027724:
  subu $a1, $a1, $v0
L80027728:
  addiu $a1, $a1, 11
L8002772c:
  jal 0x8008e590
L80027730:
  sb $a1, -20856($a2)
L80027734:
  andi $v0, $v0, 0x1
L80027738:
  sb $v0, 8($s0)
L8002773c:
  lh $v0, 12($s1)
L80027740:
  sll $zero, $zero, 0x0
L80027744:
  addiu $v0, $v0, -1
L80027748:
  sll $v0, $v0, 0x2
L8002774c:
  addu $v0, $v0, $s2
L80027750:
  lw $v0, 0($v0)
L80027754:
  addiu $v1, $zero, 23
L80027758:
  sra $v0, $v0, 0x1a
L8002775c:
  andi $v0, $v0, 0x1f
L80027760:
  bne $v0, $v1, L80027774
L80027764:
  addu $v0, $zero, $zero
L80027768:
  addiu $v0, $zero, 1
L8002776c:
  sb $v0, 8($s0)
L80027770:
  addu $v0, $zero, $zero
L80027774:
  lw $ra, 28($sp)
L80027778:
  lw $s2, 24($sp)
L8002777c:
  lw $s1, 20($sp)
L80027780:
  lw $s0, 16($sp)
L80027784:
  jr $ra
L80027788:
  addiu $sp, $sp, 32
L8002778c:
  addiu $sp, $sp, -48
L80027790:
  sw $s5, 36($sp)
L80027794:
  addu $s5, $a0, $zero
L80027798:
  sw $s2, 24($sp)
L8002779c:
  addu $s2, $zero, $zero
L800277a0:
  sw $s1, 20($sp)
L800277a4:
  addiu $s1, $zero, 5
L800277a8:
  lui $v0, 0x8009
L800277ac:
  sw $s4, 32($sp)
L800277b0:
  addiu $s4, $v0, 2008
L800277b4:
  lui $v0, 0x801a
L800277b8:
  sw $s3, 28($sp)
L800277bc:
  addiu $s3, $v0, 31448
L800277c0:
  sw $ra, 40($sp)
L800277c4:
  sw $s0, 16($sp)
L800277c8:
  lbu $v1, 717($gp)
L800277cc:
  sll $zero, $zero, 0x0
L800277d0:
  sll $v0, $v1, 0x2
L800277d4:
  addu $v0, $v0, $v1
L800277d8:
  sll $v0, $v0, 0x2
L800277dc:
  addu $v0, $s1, $v0
L800277e0:
  addu $v0, $v0, $s4
L800277e4:
  lbu $v1, 0($v0)
L800277e8:
  sll $zero, $zero, 0x0
L800277ec:
  sll $v0, $v1, 0x3
L800277f0:
  subu $v0, $v0, $v1
L800277f4:
  sll $v0, $v0, 0x2
L800277f8:
  addu $s0, $v0, $s3
L800277fc:
  lhu $v0, 22($s0)
L80027800:
  sll $zero, $zero, 0x0
L80027804:
  andi $v0, $v0, 0x8000
L80027808:
  beq $v0, $zero, L80027828
L8002780c:
  sll $zero, $zero, 0x0
L80027810:
  lw $a0, 0($s5)
L80027814:
  lw $a1, 0($s0)
L80027818:
  jal 0x8001efd4
L8002781c:
  addiu $s2, $s2, 1
L80027820:
  bgtz $v0, L80027848
L80027824:
  sll $zero, $zero, 0x0
L80027828:
  addiu $s1, $s1, 1
L8002782c:
  slti $v0, $s1, 10
L80027830:
  bne $v0, $zero, L800277c8
L80027834:
  sll $zero, $zero, 0x0
L80027838:
  beq $s2, $zero, L8002785c
L8002783c:
  addiu $v0, $zero, -1
L80027840:
  j L8002787c
L80027844:
  sll $zero, $zero, 0x0
L80027848:
  lw $v0, 0($s0)
L8002784c:
  sll $zero, $zero, 0x0
L80027850:
  lbu $v0, 106($v0)
L80027854:
  j L8002787c
L80027858:
  sll $zero, $zero, 0x0
L8002785c:
  lui $v0, 0x8009
L80027860:
  lbu $a0, 717($gp)
L80027864:
  addiu $v0, $v0, 2008
L80027868:
  sll $v1, $a0, 0x2
L8002786c:
  addu $v1, $v1, $a0
L80027870:
  sll $v1, $v1, 0x2
L80027874:
  addu $v1, $v1, $v0
L80027878:
  lbu $v0, 7($v1)
L8002787c:
  lw $ra, 40($sp)
L80027880:
  lw $s5, 36($sp)
L80027884:
  lw $s4, 32($sp)
L80027888:
  lw $s3, 28($sp)
L8002788c:
  lw $s2, 24($sp)
L80027890:
  lw $s1, 20($sp)
L80027894:
  lw $s0, 16($sp)
L80027898:
  jr $ra
L8002789c:
  addiu $sp, $sp, 48
L800278a0:
  addiu $sp, $sp, -48
L800278a4:
  sw $s5, 36($sp)
L800278a8:
  addu $s5, $a0, $zero
L800278ac:
  sw $s2, 24($sp)
L800278b0:
  addu $s2, $zero, $zero
L800278b4:
  sw $s1, 20($sp)
L800278b8:
  addiu $s1, $zero, 5
L800278bc:
  lui $v0, 0x8009
L800278c0:
  sw $s4, 32($sp)
L800278c4:
  addiu $s4, $v0, 2008
L800278c8:
  lui $v0, 0x801a
L800278cc:
  sw $s3, 28($sp)
L800278d0:
  addiu $s3, $v0, 31448
L800278d4:
  sw $ra, 40($sp)
L800278d8:
  sw $s0, 16($sp)
L800278dc:
  lbu $v1, 717($gp)
L800278e0:
  sll $zero, $zero, 0x0
L800278e4:
  sll $v0, $v1, 0x2
L800278e8:
  addu $v0, $v0, $v1
L800278ec:
  sll $v0, $v0, 0x2
L800278f0:
  addu $v0, $s1, $v0
L800278f4:
  addu $v0, $v0, $s4
L800278f8:
  lbu $v1, 0($v0)
L800278fc:
  sll $zero, $zero, 0x0
L80027900:
  sll $v0, $v1, 0x3
L80027904:
  subu $v0, $v0, $v1
L80027908:
  sll $v0, $v0, 0x2
L8002790c:
  addu $s0, $v0, $s3
L80027910:
  lhu $v1, 22($s0)
L80027914:
  sll $zero, $zero, 0x0
L80027918:
  andi $v0, $v1, 0x8000
L8002791c:
  beq $v0, $zero, L80027944
L80027920:
  andi $v0, $v1, 0x1000
L80027924:
  bne $v0, $zero, L80027944
L80027928:
  addiu $s2, $s2, 1
L8002792c:
  lw $a0, 0($s5)
L80027930:
  lw $a1, 0($s0)
L80027934:
  jal 0x8001efd4
L80027938:
  sll $zero, $zero, 0x0
L8002793c:
  bgtz $v0, L80027964
L80027940:
  sll $zero, $zero, 0x0
L80027944:
  addiu $s1, $s1, 1
L80027948:
  slti $v0, $s1, 10
L8002794c:
  bne $v0, $zero, L800278dc
L80027950:
  sll $zero, $zero, 0x0
L80027954:
  beq $s2, $zero, L80027978
L80027958:
  addiu $v0, $zero, -1
L8002795c:
  j L80027998
L80027960:
  sll $zero, $zero, 0x0
L80027964:
  lw $v0, 0($s0)
L80027968:
  sll $zero, $zero, 0x0
L8002796c:
  lbu $v0, 106($v0)
L80027970:
  j L80027998
L80027974:
  sll $zero, $zero, 0x0
L80027978:
  lui $v0, 0x8009
L8002797c:
  lbu $a0, 717($gp)
L80027980:
  addiu $v0, $v0, 2008
L80027984:
  sll $v1, $a0, 0x2
L80027988:
  addu $v1, $v1, $a0
L8002798c:
  sll $v1, $v1, 0x2
L80027990:
  addu $v1, $v1, $v0
L80027994:
  lbu $v0, 7($v1)
L80027998:
  lw $ra, 40($sp)
L8002799c:
  lw $s5, 36($sp)
L800279a0:
  lw $s4, 32($sp)
L800279a4:
  lw $s3, 28($sp)
L800279a8:
  lw $s2, 24($sp)
L800279ac:
  lw $s1, 20($sp)
L800279b0:
  lw $s0, 16($sp)
L800279b4:
  jr $ra
L800279b8:
  addiu $sp, $sp, 48
L800279bc:
  addiu $sp, $sp, -112
L800279c0:
  lhu $v0, 612($gp)
L800279c4:
  lui $v1, 0x800f
L800279c8:
  sw $ra, 104($sp)
L800279cc:
  sw $s3, 100($sp)
L800279d0:
  sw $s2, 96($sp)
L800279d4:
  sw $s1, 92($sp)
L800279d8:
  sw $s0, 88($sp)
L800279dc:
  andi $v0, $v0, 0x1000
L800279e0:
  bne $v0, $zero, L80027dd8
L800279e4:
  sb $zero, -20847($v1)
L800279e8:
  jal 0x8008e590
L800279ec:
  sll $zero, $zero, 0x0
L800279f0:
  andi $v0, $v0, 0x3
L800279f4:
  bne $v0, $zero, L80027b9c
L800279f8:
  addiu $a2, $zero, 10
L800279fc:
  addiu $s0, $sp, 64
L80027a00:
  addu $a0, $s0, $zero
L80027a04:
  addiu $a1, $zero, 10
L80027a08:
  jal L80026d18
L80027a0c:
  addiu $a2, $zero, 23
L80027a10:
  addiu $a0, $sp, 40
L80027a14:
  addiu $a1, $zero, 5
L80027a18:
  jal L80026d18
L80027a1c:
  addiu $a2, $zero, -1
L80027a20:
  lw $s1, 64($sp)
L80027a24:
  sll $zero, $zero, 0x0
L80027a28:
  beq $s1, $zero, L80027a84
L80027a2c:
  sll $zero, $zero, 0x0
L80027a30:
  addu $s3, $s0, $zero
L80027a34:
  lw $s2, 40($sp)
L80027a38:
  sll $zero, $zero, 0x0
L80027a3c:
  beq $s2, $zero, L80027a70
L80027a40:
  sll $zero, $zero, 0x0
L80027a44:
  addiu $s0, $sp, 40
L80027a48:
  lh $a0, 12($s1)
L80027a4c:
  lh $a1, 12($s2)
L80027a50:
  jal 0x80019a08
L80027a54:
  sll $zero, $zero, 0x0
L80027a58:
  bne $v0, $zero, L80027b10
L80027a5c:
  addiu $s0, $s0, 4
L80027a60:
  lw $s2, 0($s0)
L80027a64:
  sll $zero, $zero, 0x0
L80027a68:
  bne $s2, $zero, L80027a48
L80027a6c:
  sll $zero, $zero, 0x0
L80027a70:
  addiu $s3, $s3, 4
L80027a74:
  lw $s1, 0($s3)
L80027a78:
  sll $zero, $zero, 0x0
L80027a7c:
  bne $s1, $zero, L80027a34
L80027a80:
  sll $zero, $zero, 0x0
L80027a84:
  addiu $s0, $sp, 64
L80027a88:
  addu $a0, $s0, $zero
L80027a8c:
  addiu $a1, $zero, 10
L80027a90:
  jal L80026d18
L80027a94:
  addiu $a2, $zero, 20
L80027a98:
  beq $v0, $zero, L80027b98
L80027a9c:
  addiu $v0, $v0, -1
L80027aa0:
  beq $v0, $zero, L80027ab0
L80027aa4:
  sll $zero, $zero, 0x0
L80027aa8:
  jal L800358fc
L80027aac:
  addiu $a0, $v0, 1
L80027ab0:
  sll $v0, $v0, 0x2
L80027ab4:
  addu $v0, $s0, $v0
L80027ab8:
  lw $v0, 0($v0)
L80027abc:
  lui $a0, 0x6666
L80027ac0:
  lbu $v1, 24($v0)
L80027ac4:
  ori $a0, $a0, 0x6667
L80027ac8:
  sll $v1, $v1, 0x18
L80027acc:
  sra $a2, $v1, 0x18
L80027ad0:
  mult $a2, $a0
L80027ad4:
  lui $a1, 0x800f
L80027ad8:
  addiu $a1, $a1, -20856
L80027adc:
  addu $v0, $zero, $zero
L80027ae0:
  sb $zero, 10($a1)
L80027ae4:
  sb $zero, 11($a1)
L80027ae8:
  sra $v1, $v1, 0x1f
L80027aec:
  mfhi $t1
L80027af0:
  sra $a0, $t1, 0x1
L80027af4:
  subu $a0, $a0, $v1
L80027af8:
  sll $v1, $a0, 0x2
L80027afc:
  addu $v1, $v1, $a0
L80027b00:
  subu $a2, $a2, $v1
L80027b04:
  addiu $a2, $a2, 6
L80027b08:
  j L80027ddc
L80027b0c:
  sb $a2, 9($a1)
L80027b10:
  lui $a3, 0x6666
L80027b14:
  lbu $v0, 24($s1)
L80027b18:
  ori $a3, $a3, 0x6667
L80027b1c:
  sll $v0, $v0, 0x18
L80027b20:
  sra $a0, $v0, 0x18
L80027b24:
  mult $a0, $a3
L80027b28:
  lui $a2, 0x800f
L80027b2c:
  addiu $a2, $a2, -20856
L80027b30:
  sra $v0, $v0, 0x1f
L80027b34:
  mfhi $t1
L80027b38:
  sra $v1, $t1, 0x1
L80027b3c:
  subu $v1, $v1, $v0
L80027b40:
  sll $v0, $v1, 0x2
L80027b44:
  addu $v0, $v0, $v1
L80027b48:
  subu $a0, $a0, $v0
L80027b4c:
  addiu $a0, $a0, 6
L80027b50:
  sb $a0, 9($a2)
L80027b54:
  lbu $v1, 24($s2)
L80027b58:
  sll $zero, $zero, 0x0
L80027b5c:
  sll $v1, $v1, 0x18
L80027b60:
  sra $a1, $v1, 0x18
L80027b64:
  mult $a1, $a3
L80027b68:
  addu $v0, $zero, $zero
L80027b6c:
  sb $zero, 11($a2)
L80027b70:
  sra $v1, $v1, 0x1f
L80027b74:
  mfhi $t1
L80027b78:
  sra $a0, $t1, 0x1
L80027b7c:
  subu $a0, $a0, $v1
L80027b80:
  sll $v1, $a0, 0x2
L80027b84:
  addu $v1, $v1, $a0
L80027b88:
  subu $a1, $a1, $v1
L80027b8c:
  addiu $a1, $a1, 1
L80027b90:
  j L80027ddc
L80027b94:
  sb $a1, 10($a2)
L80027b98:
  addiu $a2, $zero, 10
L80027b9c:
  lui $v0, 0x8009
L80027ba0:
  addiu $a1, $v0, 2008
L80027ba4:
  lui $v0, 0x800f
L80027ba8:
  addiu $s1, $v0, -20856
L80027bac:
  lui $v0, 0x801a
L80027bb0:
  addiu $a0, $v0, 31448
L80027bb4:
  addiu $s2, $a0, 140
L80027bb8:
  lbu $v1, 717($gp)
L80027bbc:
  sll $zero, $zero, 0x0
L80027bc0:
  sll $v0, $v1, 0x2
L80027bc4:
  addu $v0, $v0, $v1
L80027bc8:
  sll $v0, $v0, 0x2
L80027bcc:
  addu $v0, $a2, $v0
L80027bd0:
  addu $v0, $v0, $a1
L80027bd4:
  lbu $v1, 0($v0)
L80027bd8:
  sll $zero, $zero, 0x0
L80027bdc:
  sll $v0, $v1, 0x3
L80027be0:
  subu $v0, $v0, $v1
L80027be4:
  sll $v0, $v0, 0x2
L80027be8:
  addu $s0, $v0, $a0
L80027bec:
  lw $v1, 20($s0)
L80027bf0:
  lui $v0, 0xc000
L80027bf4:
  and $v1, $v1, $v0
L80027bf8:
  lui $v0, 0x8000
L80027bfc:
  bne $v1, $v0, L80027dcc
L80027c00:
  addiu $a2, $a2, 1
L80027c04:
  jal L800278a0
L80027c08:
  addu $a0, $s0, $zero
L80027c0c:
  addu $a3, $v0, $zero
L80027c10:
  bltz $a3, L80027ca0
L80027c14:
  sll $zero, $zero, 0x0
L80027c18:
  lw $v0, 704($gp)
L80027c1c:
  sll $zero, $zero, 0x0
L80027c20:
  lb $v0, 25($v0)
L80027c24:
  sll $zero, $zero, 0x0
L80027c28:
  bne $v0, $zero, L80027ccc
L80027c2c:
  lui $v0, 0x8888
L80027c30:
  lui $v0, 0x6666
L80027c34:
  ori $v0, $v0, 0x6667
L80027c38:
  mult $a3, $v0
L80027c3c:
  lbu $a1, 24($s0)
L80027c40:
  mfhi $v1
L80027c44:
  sll $a1, $a1, 0x18
L80027c48:
  sra $a2, $a1, 0x18
L80027c4c:
  mult $a2, $v0
L80027c50:
  sb $zero, 11($s1)
L80027c54:
  sra $a1, $a1, 0x1f
L80027c58:
  addu $v0, $zero, $zero
L80027c5c:
  sra $a0, $v1, 0x1
L80027c60:
  sra $v1, $a3, 0x1f
L80027c64:
  subu $a0, $a0, $v1
L80027c68:
  sll $v1, $a0, 0x2
L80027c6c:
  addu $v1, $v1, $a0
L80027c70:
  subu $v1, $a3, $v1
L80027c74:
  addiu $v1, $v1, 56
L80027c78:
  sb $v1, 10($s1)
L80027c7c:
  mfhi $t0
L80027c80:
  sra $a0, $t0, 0x1
L80027c84:
  subu $a0, $a0, $a1
L80027c88:
  sll $v1, $a0, 0x2
L80027c8c:
  addu $v1, $v1, $a0
L80027c90:
  subu $a2, $a2, $v1
L80027c94:
  addiu $a2, $a2, 1
L80027c98:
  j L80027ddc
L80027c9c:
  sb $a2, 9($s1)
L80027ca0:
  jal 0x8008e590
L80027ca4:
  sll $zero, $zero, 0x0
L80027ca8:
  andi $v0, $v0, 0x3
L80027cac:
  bne $v0, $zero, L80027d24
L80027cb0:
  sll $zero, $zero, 0x0
L80027cb4:
  jal L8002778c
L80027cb8:
  addu $a0, $s0, $zero
L80027cbc:
  addu $a3, $v0, $zero
L80027cc0:
  bgez $a3, L80027c18
L80027cc4:
  sll $zero, $zero, 0x0
L80027cc8:
  lui $v0, 0x8888
L80027ccc:
  lbu $a2, 24($s0)
L80027cd0:
  ori $v0, $v0, 0x8889
L80027cd4:
  sll $a2, $a2, 0x18
L80027cd8:
  sra $a1, $a2, 0x18
L80027cdc:
  mult $a1, $v0
L80027ce0:
  addiu $v1, $zero, 1
L80027ce4:
  sb $zero, 10($s1)
L80027ce8:
  sb $v1, 11($s1)
L80027cec:
  addu $v0, $zero, $zero
L80027cf0:
  sra $a2, $a2, 0x1f
L80027cf4:
  mfhi $t1
L80027cf8:
  addu $a0, $t1, $a1
L80027cfc:
  sra $a0, $a0, 0x3
L80027d00:
  subu $a0, $a0, $a2
L80027d04:
  sll $v1, $a0, 0x4
L80027d08:
  subu $v1, $v1, $a0
L80027d0c:
  subu $a1, $a1, $v1
L80027d10:
  sll $a1, $a1, 0x18
L80027d14:
  sra $a1, $a1, 0x18
L80027d18:
  addiu $a1, $a1, -4
L80027d1c:
  j L80027ddc
L80027d20:
  sb $a1, 9($s1)
L80027d24:
  jal 0x8008e590
L80027d28:
  sll $zero, $zero, 0x0
L80027d2c:
  andi $v0, $v0, 0x1
L80027d30:
  beq $v0, $zero, L80027cc8
L80027d34:
  addu $a0, $zero, $zero
L80027d38:
  addu $a2, $a0, $zero
L80027d3c:
  lui $a3, 0x9000
L80027d40:
  lbu $v0, 717($gp)
L80027d44:
  addiu $a1, $sp, 16
L80027d48:
  xori $v0, $v0, 0x1
L80027d4c:
  sll $v1, $v0, 0x3
L80027d50:
  subu $v1, $v1, $v0
L80027d54:
  sll $v0, $v1, 0x4
L80027d58:
  subu $v0, $v0, $v1
L80027d5c:
  sll $v0, $v0, 0x2
L80027d60:
  addu $v1, $v0, $s2
L80027d64:
  lw $v0, 20($v1)
L80027d68:
  sll $zero, $zero, 0x0
L80027d6c:
  and $v0, $v0, $a3
L80027d70:
  bne $v0, $a3, L80027d84
L80027d74:
  sll $zero, $zero, 0x0
L80027d78:
  sw $v1, 0($a1)
L80027d7c:
  addiu $a1, $a1, 4
L80027d80:
  addiu $a0, $a0, 1
L80027d84:
  addiu $a2, $a2, 1
L80027d88:
  slti $v0, $a2, 5
L80027d8c:
  bne $v0, $zero, L80027d64
L80027d90:
  addiu $v1, $v1, 28
L80027d94:
  beq $a0, $zero, L80027cc8
L80027d98:
  addiu $a3, $a0, -1
L80027d9c:
  beq $a3, $zero, L80027db4
L80027da0:
  sll $v0, $a3, 0x2
L80027da4:
  jal L800358fc
L80027da8:
  sll $zero, $zero, 0x0
L80027dac:
  addu $a3, $v0, $zero
L80027db0:
  sll $v0, $a3, 0x2
L80027db4:
  addu $v0, $sp, $v0
L80027db8:
  lw $v0, 16($v0)
L80027dbc:
  sll $zero, $zero, 0x0
L80027dc0:
  lb $a3, 24($v0)
L80027dc4:
  j L80027c18
L80027dc8:
  sll $zero, $zero, 0x0
L80027dcc:
  slti $v0, $a2, 15
L80027dd0:
  bne $v0, $zero, L80027bb8
L80027dd4:
  sll $zero, $zero, 0x0
L80027dd8:
  addu $v0, $zero, $zero
L80027ddc:
  lw $ra, 104($sp)
L80027de0:
  lw $s3, 100($sp)
L80027de4:
  lw $s2, 96($sp)
L80027de8:
  lw $s1, 92($sp)
L80027dec:
  lw $s0, 88($sp)
L80027df0:
  jr $ra
L80027df4:
  addiu $sp, $sp, 112
L80027df8:
  addiu $sp, $sp, -56
L80027dfc:
  sw $s3, 28($sp)
L80027e00:
  addu $s3, $a0, $zero
L80027e04:
  sw $s7, 44($sp)
L80027e08:
  addu $s7, $a1, $zero
L80027e0c:
  sll $v0, $s7, 0x3
L80027e10:
  subu $v0, $v0, $s7
L80027e14:
  sll $v1, $v0, 0x4
L80027e18:
  subu $v1, $v1, $v0
L80027e1c:
  sll $v1, $v1, 0x2
L80027e20:
  lui $v0, 0x801a
L80027e24:
  addiu $v0, $v0, 31448
L80027e28:
  sw $s5, 36($sp)
L80027e2c:
  addu $s5, $v1, $v0
L80027e30:
  sw $s4, 32($sp)
L80027e34:
  addiu $s4, $s5, 140
L80027e38:
  sw $s2, 24($sp)
L80027e3c:
  addu $s2, $zero, $zero
L80027e40:
  lui $v0, 0x801d
L80027e44:
  sw $s6, 40($sp)
L80027e48:
  addiu $s6, $v0, 16964
L80027e4c:
  sw $s0, 16($sp)
L80027e50:
  addiu $s0, $s5, 152
L80027e54:
  sw $s1, 20($sp)
L80027e58:
  addiu $s1, $s3, 9
L80027e5c:
  sw $ra, 48($sp)
L80027e60:
  sh $zero, 0($s3)
L80027e64:
  lhu $v0, 10($s0)
L80027e68:
  sll $zero, $zero, 0x0
L80027e6c:
  andi $v0, $v0, 0x8000
L80027e70:
  beq $v0, $zero, L80027f0c
L80027e74:
  addu $a0, $s4, $zero
L80027e78:
  lhu $v0, 0($s0)
L80027e7c:
  jal 0x800170c8
L80027e80:
  sh $v0, 0($s3)
L80027e84:
  sh $v0, -7($s1)
L80027e88:
  sra $v0, $v0, 0x10
L80027e8c:
  sh $v0, -5($s1)
L80027e90:
  lhu $v0, 10($s0)
L80027e94:
  sll $zero, $zero, 0x0
L80027e98:
  sh $v0, -3($s1)
L80027e9c:
  lw $v0, 0($s4)
L80027ea0:
  sll $zero, $zero, 0x0
L80027ea4:
  lbu $v0, 104($v0)
L80027ea8:
  sll $zero, $zero, 0x0
L80027eac:
  sb $v0, -1($s1)
L80027eb0:
  lhu $v0, 10($s0)
L80027eb4:
  sll $zero, $zero, 0x0
L80027eb8:
  andi $v0, $v0, 0x200
L80027ebc:
  beq $v0, $zero, L80027ee4
L80027ec0:
  sll $zero, $zero, 0x0
L80027ec4:
  lh $v0, 0($s0)
L80027ec8:
  sll $zero, $zero, 0x0
L80027ecc:
  addiu $v0, $v0, -1
L80027ed0:
  sll $v0, $v0, 0x2
L80027ed4:
  addu $v0, $v0, $s6
L80027ed8:
  lw $v0, 0($v0)
L80027edc:
  j L80027f04
L80027ee0:
  sra $v0, $v0, 0x12
L80027ee4:
  lh $v0, 0($s0)
L80027ee8:
  sll $zero, $zero, 0x0
L80027eec:
  addiu $v0, $v0, -1
L80027ef0:
  sll $v0, $v0, 0x2
L80027ef4:
  addu $v0, $v0, $s6
L80027ef8:
  lw $v0, 0($v0)
L80027efc:
  sll $zero, $zero, 0x0
L80027f00:
  sra $v0, $v0, 0x16
L80027f04:
  andi $v0, $v0, 0xf
L80027f08:
  sb $v0, 0($s1)
L80027f0c:
  addiu $s2, $s2, 1
L80027f10:
  addiu $s1, $s1, 12
L80027f14:
  addiu $s3, $s3, 12
L80027f18:
  addiu $s0, $s0, 28
L80027f1c:
  slti $v0, $s2, 5
L80027f20:
  bne $v0, $zero, L80027e60
L80027f24:
  addiu $s4, $s4, 28
L80027f28:
  addiu $s4, $s5, 280
L80027f2c:
  addu $s2, $zero, $zero
L80027f30:
  lui $v0, 0x801d
L80027f34:
  addiu $s6, $v0, 16964
L80027f38:
  addiu $s0, $s5, 292
L80027f3c:
  addiu $s1, $s3, 9
L80027f40:
  sh $zero, 0($s3)
L80027f44:
  lhu $v0, 10($s0)
L80027f48:
  sll $zero, $zero, 0x0
L80027f4c:
  andi $v0, $v0, 0x8000
L80027f50:
  beq $v0, $zero, L80027fec
L80027f54:
  addu $a0, $s4, $zero
L80027f58:
  lhu $v0, 0($s0)
L80027f5c:
  jal 0x800170c8
L80027f60:
  sh $v0, 0($s3)
L80027f64:
  sh $v0, -7($s1)
L80027f68:
  sra $v0, $v0, 0x10
L80027f6c:
  sh $v0, -5($s1)
L80027f70:
  lhu $v0, 10($s0)
L80027f74:
  sll $zero, $zero, 0x0
L80027f78:
  sh $v0, -3($s1)
L80027f7c:
  lw $v0, 0($s4)
L80027f80:
  sll $zero, $zero, 0x0
L80027f84:
  lbu $v0, 104($v0)
L80027f88:
  sll $zero, $zero, 0x0
L80027f8c:
  sb $v0, -1($s1)
L80027f90:
  lhu $v0, 10($s0)
L80027f94:
  sll $zero, $zero, 0x0
L80027f98:
  andi $v0, $v0, 0x200
L80027f9c:
  beq $v0, $zero, L80027fc4
L80027fa0:
  sll $zero, $zero, 0x0
L80027fa4:
  lh $v0, 0($s0)
L80027fa8:
  sll $zero, $zero, 0x0
L80027fac:
  addiu $v0, $v0, -1
L80027fb0:
  sll $v0, $v0, 0x2
L80027fb4:
  addu $v0, $v0, $s6
L80027fb8:
  lw $v0, 0($v0)
L80027fbc:
  j L80027fe4
L80027fc0:
  sra $v0, $v0, 0x12
L80027fc4:
  lh $v0, 0($s0)
L80027fc8:
  sll $zero, $zero, 0x0
L80027fcc:
  addiu $v0, $v0, -1
L80027fd0:
  sll $v0, $v0, 0x2
L80027fd4:
  addu $v0, $v0, $s6
L80027fd8:
  lw $v0, 0($v0)
L80027fdc:
  sll $zero, $zero, 0x0
L80027fe0:
  sra $v0, $v0, 0x16
L80027fe4:
  andi $v0, $v0, 0xf
L80027fe8:
  sb $v0, 0($s1)
L80027fec:
  addiu $s2, $s2, 1
L80027ff0:
  addiu $s1, $s1, 12
L80027ff4:
  addiu $s3, $s3, 12
L80027ff8:
  addiu $s0, $s0, 28
L80027ffc:
  slti $v0, $s2, 5
L80028000:
  bne $v0, $zero, L80027f40
L80028004:
  addiu $s4, $s4, 28
L80028008:
  addu $s2, $zero, $zero
L8002800c:
  lui $v0, 0x800f
L80028010:
  addiu $t1, $v0, -24592
L80028014:
  lui $v0, 0x8016
L80028018:
  addiu $t0, $v0, -15324
L8002801c:
  lui $v0, 0x801d
L80028020:
  addiu $a3, $v0, 16964
L80028024:
  addiu $a1, $s3, 10
L80028028:
  sll $a2, $s7, 0x5
L8002802c:
  addu $v0, $s2, $a2
L80028030:
  addu $v0, $v0, $t1
L80028034:
  lb $a0, 26($v0)
L80028038:
  sll $zero, $zero, 0x0
L8002803c:
  bltz $a0, L800280f0
L80028040:
  lui $v1, 0x4
L80028044:
  ori $v1, $v1, 0x8000
L80028048:
  sll $v0, $a0, 0x1
L8002804c:
  addu $v0, $v0, $a0
L80028050:
  sll $v0, $v0, 0x1
L80028054:
  addu $v0, $v0, $t0
L80028058:
  addu $v0, $v0, $v1
L8002805c:
  lh $a0, 14844($v0)
L80028060:
  sll $zero, $zero, 0x0
L80028064:
  sh $a0, 0($s3)
L80028068:
  addiu $a0, $a0, -1
L8002806c:
  sll $a0, $a0, 0x2
L80028070:
  addu $a0, $a0, $a3
L80028074:
  lw $v1, 0($a0)
L80028078:
  sll $zero, $zero, 0x0
L8002807c:
  andi $v1, $v1, 0x1ff
L80028080:
  sll $v0, $v1, 0x2
L80028084:
  addu $v0, $v0, $v1
L80028088:
  sll $v0, $v0, 0x1
L8002808c:
  sh $v0, -8($a1)
L80028090:
  lw $v1, 0($a0)
L80028094:
  sh $zero, -4($a1)
L80028098:
  sra $v1, $v1, 0x9
L8002809c:
  andi $v1, $v1, 0x1ff
L800280a0:
  sll $v0, $v1, 0x2
L800280a4:
  addu $v0, $v0, $v1
L800280a8:
  sll $v0, $v0, 0x1
L800280ac:
  sh $v0, -6($a1)
L800280b0:
  lw $v0, 0($a0)
L800280b4:
  sll $zero, $zero, 0x0
L800280b8:
  sra $v0, $v0, 0x1a
L800280bc:
  andi $v0, $v0, 0x1f
L800280c0:
  sb $v0, -2($a1)
L800280c4:
  lw $v0, 0($a0)
L800280c8:
  sll $zero, $zero, 0x0
L800280cc:
  sra $v0, $v0, 0x16
L800280d0:
  andi $v0, $v0, 0xf
L800280d4:
  sb $v0, -1($a1)
L800280d8:
  lw $v0, 0($a0)
L800280dc:
  addiu $s3, $s3, 12
L800280e0:
  sra $v0, $v0, 0x12
L800280e4:
  andi $v0, $v0, 0xf
L800280e8:
  sb $v0, 0($a1)
L800280ec:
  addiu $a1, $a1, 12
L800280f0:
  addiu $s2, $s2, 1
L800280f4:
  slti $v0, $s2, 5
L800280f8:
  bne $v0, $zero, L80028028
L800280fc:
  lui $v0, 0x800f
L80028100:
  addiu $v0, $v0, -24592
L80028104:
  addu $v0, $a2, $v0
L80028108:
  lb $s2, 24($v0)
L8002810c:
  sll $v0, $s7, 0x2
L80028110:
  addu $v0, $v0, $s7
L80028114:
  sll $v0, $v0, 0x3
L80028118:
  addu $v0, $s2, $v0
L8002811c:
  sll $v1, $v0, 0x1
L80028120:
  addu $v1, $v1, $v0
L80028124:
  sll $v1, $v1, 0x1
L80028128:
  lui $v0, 0x801a
L8002812c:
  addiu $v0, $v0, 32288
L80028130:
  addu $a2, $v1, $v0
L80028134:
  slti $v0, $s2, 40
L80028138:
  beq $v0, $zero, L800281f0
L8002813c:
  lui $v0, 0x801d
L80028140:
  addiu $a3, $v0, 16964
L80028144:
  addiu $a1, $s3, 11
L80028148:
  lh $a0, 0($a2)
L8002814c:
  sll $zero, $zero, 0x0
L80028150:
  sh $a0, 0($s3)
L80028154:
  addiu $a0, $a0, -1
L80028158:
  sll $a0, $a0, 0x2
L8002815c:
  addu $a0, $a0, $a3
L80028160:
  lw $v1, 0($a0)
L80028164:
  sll $zero, $zero, 0x0
L80028168:
  andi $v1, $v1, 0x1ff
L8002816c:
  sll $v0, $v1, 0x2
L80028170:
  addu $v0, $v0, $v1
L80028174:
  sll $v0, $v0, 0x1
L80028178:
  sh $v0, -9($a1)
L8002817c:
  lw $v1, 0($a0)
L80028180:
  sh $zero, -5($a1)
L80028184:
  sra $v1, $v1, 0x9
L80028188:
  andi $v1, $v1, 0x1ff
L8002818c:
  sll $v0, $v1, 0x2
L80028190:
  addu $v0, $v0, $v1
L80028194:
  sll $v0, $v0, 0x1
L80028198:
  sh $v0, -7($a1)
L8002819c:
  lw $v0, 0($a0)
L800281a0:
  sll $zero, $zero, 0x0
L800281a4:
  sra $v0, $v0, 0x1a
L800281a8:
  andi $v0, $v0, 0x1f
L800281ac:
  sb $v0, -3($a1)
L800281b0:
  lw $v0, 0($a0)
L800281b4:
  addiu $s2, $s2, 1
L800281b8:
  sra $v0, $v0, 0x16
L800281bc:
  andi $v0, $v0, 0xf
L800281c0:
  sb $v0, -2($a1)
L800281c4:
  lw $v0, 0($a0)
L800281c8:
  addiu $s3, $s3, 12
L800281cc:
  sra $v0, $v0, 0x12
L800281d0:
  andi $v0, $v0, 0xf
L800281d4:
  sb $v0, -1($a1)
L800281d8:
  lbu $v0, 2($a2)
L800281dc:
  addiu $a2, $a2, 6
L800281e0:
  sb $v0, 0($a1)
L800281e4:
  slti $v0, $s2, 40
L800281e8:
  bne $v0, $zero, L80028148
L800281ec:
  addiu $a1, $a1, 12
L800281f0:
  sh $zero, 0($s3)
L800281f4:
  lw $ra, 48($sp)
L800281f8:
  lw $s7, 44($sp)
L800281fc:
  lw $s6, 40($sp)
L80028200:
  lw $s5, 36($sp)
L80028204:
  lw $s4, 32($sp)
L80028208:
  lw $s3, 28($sp)
L8002820c:
  lw $s2, 24($sp)
L80028210:
  lw $s1, 20($sp)
L80028214:
  lw $s0, 16($sp)
L80028218:
  jr $ra
L8002821c:
  addiu $sp, $sp, 56
L80028220:
  addiu $sp, $sp, -24
L80028224:
  sw $s0, 16($sp)
L80028228:
  lui $s0, 0x801b
L8002822c:
  addiu $s0, $s0, -20468
L80028230:
  lbu $a1, 717($gp)
L80028234:
  sw $ra, 20($sp)
L80028238:
  jal L80027df8
L8002823c:
  addu $a0, $s0, $zero
L80028240:
  lbu $a1, 717($gp)
L80028244:
  addiu $a0, $s0, 660
L80028248:
  jal L80027df8
L8002824c:
  xori $a1, $a1, 0x1
L80028250:
  lw $ra, 20($sp)
L80028254:
  lw $s0, 16($sp)
L80028258:
  jr $ra
L8002825c:
  addiu $sp, $sp, 24
L80028260:
  andi $v0, $a0, 0x80
L80028264:
  bne $v0, $zero, L80028274
L80028268:
  andi $v0, $a0, 0x7f
L8002826c:
  jr $ra
L80028270:
  addu $v0, $a0, $zero
L80028274:
  jr $ra
L80028278:
  addiu $v0, $v0, 15
L8002827c:
  lhu $v0, 22($a0)
L80028280:
  sll $zero, $zero, 0x0
L80028284:
  andi $v0, $v0, 0x200
L80028288:
  bne $v0, $zero, L800282bc
L8002828c:
  sll $zero, $zero, 0x0
L80028290:
  lui $v0, 0x801d
L80028294:
  lh $v1, 12($a0)
L80028298:
  addiu $v0, $v0, 16964
L8002829c:
  addiu $v1, $v1, -1
L800282a0:
  sll $v1, $v1, 0x2
L800282a4:
  addu $v1, $v1, $v0
L800282a8:
  lw $v0, 0($v1)
L800282ac:
  sll $zero, $zero, 0x0
L800282b0:
  sra $v0, $v0, 0x16
L800282b4:
  jr $ra
L800282b8:
  andi $v0, $v0, 0xf
L800282bc:
  lui $v0, 0x801d
L800282c0:
  lh $v1, 12($a0)
L800282c4:
  addiu $v0, $v0, 16964
L800282c8:
  addiu $v1, $v1, -1
L800282cc:
  sll $v1, $v1, 0x2
L800282d0:
  addu $v1, $v1, $v0
L800282d4:
  lw $v0, 0($v1)
L800282d8:
  sll $zero, $zero, 0x0
L800282dc:
  sra $v0, $v0, 0x12
L800282e0:
  jr $ra
L800282e4:
  andi $v0, $v0, 0xf
L800282e8:
  lbu $v1, 832($gp)
L800282ec:
  sll $zero, $zero, 0x0
L800282f0:
  andi $v0, $v1, 0x80
L800282f4:
  beq $v0, $zero, L80028304
L800282f8:
  ori $v0, $v1, 0x80
L800282fc:
  jr $ra
L80028300:
  addiu $v0, $zero, 1
L80028304:
  sb $v0, 832($gp)
L80028308:
  jr $ra
L8002830c:
  addu $v0, $zero, $zero
L80028310:
  addiu $sp, $sp, -32
L80028314:
  sw $ra, 28($sp)
L80028318:
  jal L800282e8
L8002831c:
  sw $s0, 24($sp)
L80028320:
  bne $v0, $zero, L80028350
L80028324:
  addu $a0, $zero, $zero
L80028328:
  addiu $v0, $zero, 288
L8002832c:
  sw $v0, 16($sp)
L80028330:
  addiu $v0, $zero, 48
L80028334:
  addiu $a2, $zero, 16
L80028338:
  lhu $a1, 828($gp)
L8002833c:
  addiu $a3, $zero, 176
L80028340:
  jal L80035be4
L80028344:
  sw $v0, 20($sp)
L80028348:
  j L800283dc
L8002834c:
  sll $zero, $zero, 0x0
L80028350:
  jal L80039794
L80028354:
  sll $zero, $zero, 0x0
L80028358:
  lui $v1, 0x800f
L8002835c:
  lbu $v0, 832($gp)
L80028360:
  sll $zero, $zero, 0x0
L80028364:
  andi $v0, $v0, 0x40
L80028368:
  bne $v0, $zero, L800283ac
L8002836c:
  addiu $s0, $v1, -20232
L80028370:
  lhu $v1, 52($s0)
L80028374:
  sll $zero, $zero, 0x0
L80028378:
  andi $v0, $v1, 0x2000
L8002837c:
  beq $v0, $zero, L800283dc
L80028380:
  andi $v0, $v1, 0x10
L80028384:
  bne $v0, $zero, L800283c4
L80028388:
  sll $zero, $zero, 0x0
L8002838c:
  jal L800374f4
L80028390:
  addu $a0, $s0, $zero
L80028394:
  lbu $v1, 832($gp)
L80028398:
  sw $v0, 48($s0)
L8002839c:
  ori $v1, $v1, 0x40
L800283a0:
  sb $v1, 832($gp)
L800283a4:
  j L800283dc
L800283a8:
  sll $zero, $zero, 0x0
L800283ac:
  jal L8003b734
L800283b0:
  sll $zero, $zero, 0x0
L800283b4:
  beq $v0, $zero, L800283dc
L800283b8:
  sll $zero, $zero, 0x0
L800283bc:
  jal L8003fee0
L800283c0:
  addiu $a0, $zero, 11
L800283c4:
  jal L80035b7c
L800283c8:
  addu $a0, $s0, $zero
L800283cc:
  lbu $v0, 844($gp)
L800283d0:
  sll $zero, $zero, 0x0
L800283d4:
  ori $v0, $v0, 0x40
L800283d8:
  sb $v0, 844($gp)
L800283dc:
  lw $ra, 28($sp)
L800283e0:
  lw $s0, 24($sp)
L800283e4:
  jr $ra
L800283e8:
  addiu $sp, $sp, 32
L800283ec:
  jr $ra
L800283f0:
  sll $zero, $zero, 0x0
L800283f4:
  addiu $sp, $sp, -48
L800283f8:
  sw $ra, 40($sp)
L800283fc:
  sw $s1, 36($sp)
L80028400:
  jal L800282e8
L80028404:
  sw $s0, 32($sp)
L80028408:
  bne $v0, $zero, L80028628
L8002840c:
  addiu $a0, $zero, 3
L80028410:
  addiu $v0, $zero, 1
L80028414:
  lui $at, 0x800a
L80028418:
  sb $v0, -20288($at)
L8002841c:
  jal L80029574
L80028420:
  addiu $s0, $zero, -1024
L80028424:
  addiu $a0, $zero, 3
L80028428:
  lui $v0, 0x800f
L8002842c:
  addiu $v0, $v0, -24344
L80028430:
  lh $a1, 830($gp)
L80028434:
  addiu $v1, $zero, 256
L80028438:
  sh $v1, 234($v0)
L8002843c:
  addiu $v1, $zero, 255
L80028440:
  sh $zero, 232($v0)
L80028444:
  sh $zero, 236($v0)
L80028448:
  jal L80029164
L8002844c:
  sh $v1, 238($v0)
L80028450:
  addiu $a0, $zero, 3
L80028454:
  addiu $a1, $zero, -1
L80028458:
  jal L800291e0
L8002845c:
  addu $a2, $a1, $zero
L80028460:
  addu $s1, $v0, $zero
L80028464:
  addu $a0, $s1, $zero
L80028468:
  lbu $a1, 835($gp)
L8002846c:
  addiu $v0, $zero, -140
L80028470:
  sh $v0, 48($s1)
L80028474:
  addiu $v0, $zero, 128
L80028478:
  sb $v0, 33($s1)
L8002847c:
  lhu $v0, 50($s1)
L80028480:
  lhu $v1, 8($s1)
L80028484:
  addu $v0, $v0, $a1
L80028488:
  ori $v1, $v1, 0x4
L8002848c:
  sh $v0, 50($s1)
L80028490:
  jal 0x80043178
L80028494:
  sh $v1, 8($s1)
L80028498:
  addu $a0, $s1, $zero
L8002849c:
  jal 0x80042918
L800284a0:
  sh $s0, 96($s1)
L800284a4:
  addu $a0, $s1, $zero
L800284a8:
  jal 0x800428ec
L800284ac:
  addiu $a1, $zero, 20
L800284b0:
  sw $s1, 836($gp)
L800284b4:
  jal 0x8004002c
L800284b8:
  sll $zero, $zero, 0x0
L800284bc:
  addu $a0, $v0, $zero
L800284c0:
  jal 0x800400ac
L800284c4:
  addiu $a1, $zero, 2
L800284c8:
  addu $s1, $v0, $zero
L800284cc:
  addu $a0, $s1, $zero
L800284d0:
  addiu $a1, $zero, 328
L800284d4:
  addu $a3, $zero, $zero
L800284d8:
  lbu $a2, 835($gp)
L800284dc:
  addiu $v0, $zero, 2
L800284e0:
  sw $v0, 16($sp)
L800284e4:
  addiu $v0, $zero, 13
L800284e8:
  sw $v0, 24($sp)
L800284ec:
  addiu $v0, $zero, 263
L800284f0:
  sw $zero, 20($sp)
L800284f4:
  sw $v0, 28($sp)
L800284f8:
  jal 0x800404cc
L800284fc:
  addiu $a2, $a2, 14
L80028500:
  lhu $v0, 8($s1)
L80028504:
  addu $a0, $s1, $zero
L80028508:
  sh $s0, 96($s1)
L8002850c:
  ori $v0, $v0, 0x8
L80028510:
  jal 0x80042918
L80028514:
  sh $v0, 8($s1)
L80028518:
  addu $a0, $s1, $zero
L8002851c:
  jal 0x800428ec
L80028520:
  addiu $a1, $zero, 20
L80028524:
  jal 0x80043178
L80028528:
  addu $a0, $s1, $zero
L8002852c:
  addu $a0, $zero, $zero
L80028530:
  lui $v0, 0x801d
L80028534:
  addiu $a1, $v0, 16964
L80028538:
  lui $v0, 0x800f
L8002853c:
  addiu $v1, $v0, -20232
L80028540:
  sh $s0, 96($s1)
L80028544:
  sw $s1, 824($gp)
L80028548:
  sw $zero, 840($gp)
L8002854c:
  lhu $v0, 52($v1)
L80028550:
  sll $zero, $zero, 0x0
L80028554:
  andi $v0, $v0, 0x8000
L80028558:
  bne $v0, $zero, L800285e0
L8002855c:
  sll $zero, $zero, 0x0
L80028560:
  lhu $v0, 830($gp)
L80028564:
  sll $zero, $zero, 0x0
L80028568:
  sll $v1, $v0, 0x10
L8002856c:
  sra $v1, $v1, 0xe
L80028570:
  addu $v1, $v1, $a1
L80028574:
  lw $v1, -4($v1)
L80028578:
  lui $at, 0x800a
L8002857c:
  sh $v0, -19656($at)
L80028580:
  sra $v1, $v1, 0x1a
L80028584:
  andi $v1, $v1, 0x1f
L80028588:
  slti $v1, $v1, 20
L8002858c:
  bne $v1, $zero, L80028598
L80028590:
  addiu $a1, $zero, 3
L80028594:
  addiu $a1, $zero, 4
L80028598:
  addiu $a2, $zero, 328
L8002859c:
  addiu $a3, $zero, 14
L800285a0:
  addiu $v0, $zero, 168
L800285a4:
  sw $v0, 16($sp)
L800285a8:
  addiu $v0, $zero, 192
L800285ac:
  jal L80035be4
L800285b0:
  sw $v0, 20($sp)
L800285b4:
  addu $a0, $v0, $zero
L800285b8:
  addiu $v0, $zero, 1
L800285bc:
  sb $v0, 83($a0)
L800285c0:
  addiu $v0, $zero, 21
L800285c4:
  sb $zero, 84($a0)
L800285c8:
  sb $v0, 89($a0)
L800285cc:
  sw $a0, 840($gp)
L800285d0:
  jal L80039a14
L800285d4:
  sll $zero, $zero, 0x0
L800285d8:
  j L800285f4
L800285dc:
  addiu $a0, $zero, 64
L800285e0:
  addiu $a0, $a0, 1
L800285e4:
  slti $v0, $a0, 3
L800285e8:
  bne $v0, $zero, L8002854c
L800285ec:
  addiu $v1, $v1, 100
L800285f0:
  addiu $a0, $zero, 64
L800285f4:
  jal 0x80015bd8
L800285f8:
  addiu $a1, $zero, 2
L800285fc:
  lui $v0, 0x800a
L80028600:
  lbu $v0, -20618($v0)
L80028604:
  sll $zero, $zero, 0x0
L80028608:
  addiu $v0, $v0, -19
L8002860c:
  lui $at, 0x800a
L80028610:
  sb $v0, -20160($at)
L80028614:
  jal L8003fee0
L80028618:
  addiu $a0, $zero, 52
L8002861c:
  lbu $v0, 832($gp)
L80028620:
  j L80028914
L80028624:
  ori $v0, $v0, 0x40
L80028628:
  lbu $v1, 832($gp)
L8002862c:
  sll $zero, $zero, 0x0
L80028630:
  andi $v0, $v1, 0x40
L80028634:
  beq $v0, $zero, L80028820
L80028638:
  andi $v0, $v1, 0x20
L8002863c:
  lw $s1, 824($gp)
L80028640:
  sll $zero, $zero, 0x0
L80028644:
  lh $a3, 96($s1)
L80028648:
  sll $zero, $zero, 0x0
L8002864c:
  beq $a3, $zero, L800286dc
L80028650:
  andi $v0, $v1, 0x10
L80028654:
  beq $v0, $zero, L8002868c
L80028658:
  addu $a0, $s1, $zero
L8002865c:
  lh $a2, 50($s1)
L80028660:
  jal 0x80043230
L80028664:
  addiu $a1, $zero, 328
L80028668:
  lhu $v0, 96($s1)
L8002866c:
  sll $zero, $zero, 0x0
L80028670:
  addiu $v0, $v0, -85
L80028674:
  sh $v0, 96($s1)
L80028678:
  sll $v0, $v0, 0x10
L8002867c:
  bgtz $v0, L800286bc
L80028680:
  addiu $v0, $zero, 1024
L80028684:
  j L800286b8
L80028688:
  sh $v0, 48($s1)
L8002868c:
  lh $a2, 50($s1)
L80028690:
  jal 0x80043230
L80028694:
  addiu $a1, $zero, 148
L80028698:
  lhu $v0, 96($s1)
L8002869c:
  sll $zero, $zero, 0x0
L800286a0:
  addiu $v0, $v0, 85
L800286a4:
  sh $v0, 96($s1)
L800286a8:
  sll $v0, $v0, 0x10
L800286ac:
  bltz $v0, L800286bc
L800286b0:
  addiu $v0, $zero, 148
L800286b4:
  sh $v0, 48($s1)
L800286b8:
  sh $zero, 96($s1)
L800286bc:
  lw $a0, 840($gp)
L800286c0:
  sll $zero, $zero, 0x0
L800286c4:
  beq $a0, $zero, L800286dc
L800286c8:
  sll $zero, $zero, 0x0
L800286cc:
  lh $a1, 48($s1)
L800286d0:
  lh $a2, 50($s1)
L800286d4:
  jal L80039934
L800286d8:
  sll $zero, $zero, 0x0
L800286dc:
  lw $s1, 836($gp)
L800286e0:
  sll $zero, $zero, 0x0
L800286e4:
  lh $a3, 96($s1)
L800286e8:
  sll $zero, $zero, 0x0
L800286ec:
  beq $a3, $zero, L8002876c
L800286f0:
  lui $v0, 0x200
L800286f4:
  lbu $v0, 832($gp)
L800286f8:
  sll $zero, $zero, 0x0
L800286fc:
  andi $v0, $v0, 0x10
L80028700:
  beq $v0, $zero, L80028738
L80028704:
  addu $a0, $s1, $zero
L80028708:
  lh $a2, 50($s1)
L8002870c:
  jal 0x80043230
L80028710:
  addiu $a1, $zero, -140
L80028714:
  lhu $v0, 96($s1)
L80028718:
  sll $zero, $zero, 0x0
L8002871c:
  addiu $v0, $v0, -85
L80028720:
  sh $v0, 96($s1)
L80028724:
  sll $v0, $v0, 0x10
L80028728:
  bgtz $v0, L8002876c
L8002872c:
  lui $v0, 0x200
L80028730:
  j L80028760
L80028734:
  addiu $v0, $zero, 1024
L80028738:
  lh $a2, 50($s1)
L8002873c:
  jal 0x80043230
L80028740:
  addiu $a1, $zero, 2
L80028744:
  lhu $v0, 96($s1)
L80028748:
  sll $zero, $zero, 0x0
L8002874c:
  addiu $v0, $v0, 85
L80028750:
  sh $v0, 96($s1)
L80028754:
  sll $v0, $v0, 0x10
L80028758:
  bltz $v0, L80028768
L8002875c:
  addiu $v0, $zero, 2
L80028760:
  sh $v0, 48($s1)
L80028764:
  sh $zero, 96($s1)
L80028768:
  lui $v0, 0x200
L8002876c:
  ori $v0, $v0, 0x30
L80028770:
  lui $v1, 0x800a
L80028774:
  lw $v1, -20236($v1)
L80028778:
  lui $a0, 0x800a
L8002877c:
  lw $a0, -20172($a0)
L80028780:
  and $v1, $v1, $v0
L80028784:
  or $v1, $v1, $a0
L80028788:
  bne $v1, $zero, L80028918
L8002878c:
  sll $zero, $zero, 0x0
L80028790:
  lw $a0, 824($gp)
L80028794:
  sll $zero, $zero, 0x0
L80028798:
  lh $v0, 96($a0)
L8002879c:
  sll $zero, $zero, 0x0
L800287a0:
  bne $v0, $zero, L80028918
L800287a4:
  sll $zero, $zero, 0x0
L800287a8:
  lw $v0, 836($gp)
L800287ac:
  sll $zero, $zero, 0x0
L800287b0:
  lh $v0, 96($v0)
L800287b4:
  sll $zero, $zero, 0x0
L800287b8:
  bne $v0, $zero, L80028918
L800287bc:
  sll $zero, $zero, 0x0
L800287c0:
  lbu $v0, 832($gp)
L800287c4:
  sll $zero, $zero, 0x0
L800287c8:
  andi $v1, $v0, 0xbf
L800287cc:
  andi $v0, $v0, 0x10
L800287d0:
  sb $v1, 832($gp)
L800287d4:
  beq $v0, $zero, L80028918
L800287d8:
  sll $zero, $zero, 0x0
L800287dc:
  jal 0x8004036c
L800287e0:
  sll $zero, $zero, 0x0
L800287e4:
  jal L80029528
L800287e8:
  addiu $a0, $zero, 3
L800287ec:
  lw $a0, 840($gp)
L800287f0:
  sll $zero, $zero, 0x0
L800287f4:
  beq $a0, $zero, L80028804
L800287f8:
  sll $zero, $zero, 0x0
L800287fc:
  jal L80035b7c
L80028800:
  sll $zero, $zero, 0x0
L80028804:
  lbu $v0, 844($gp)
L80028808:
  lui $at, 0x800a
L8002880c:
  sb $zero, -20288($at)
L80028810:
  ori $v0, $v0, 0x40
L80028814:
  sb $v0, 844($gp)
L80028818:
  j L80028918
L8002881c:
  sll $zero, $zero, 0x0
L80028820:
  bne $v0, $zero, L80028874
L80028824:
  sll $zero, $zero, 0x0
L80028828:
  lw $s1, 836($gp)
L8002882c:
  sll $zero, $zero, 0x0
L80028830:
  lbu $v0, 33($s1)
L80028834:
  sll $zero, $zero, 0x0
L80028838:
  addiu $v0, $v0, 12
L8002883c:
  sb $v0, 33($s1)
L80028840:
  andi $v0, $v0, 0xff
L80028844:
  sltiu $v0, $v0, 64
L80028848:
  beq $v0, $zero, L80028918
L8002884c:
  sll $zero, $zero, 0x0
L80028850:
  lhu $v0, 8($s1)
L80028854:
  sb $zero, 33($s1)
L80028858:
  lbu $v1, 832($gp)
L8002885c:
  andi $v0, $v0, 0xfffb
L80028860:
  ori $v1, $v1, 0x20
L80028864:
  sh $v0, 8($s1)
L80028868:
  sb $v1, 832($gp)
L8002886c:
  j L80028918
L80028870:
  sll $zero, $zero, 0x0
L80028874:
  lui $v0, 0x800a
L80028878:
  lbu $v0, -19860($v0)
L8002887c:
  addiu $v1, $zero, 14
L80028880:
  andi $v0, $v0, 0x1f
L80028884:
  bne $v0, $v1, L800288b8
L80028888:
  sll $zero, $zero, 0x0
L8002888c:
  lui $v0, 0x800a
L80028890:
  lhu $v0, -19560($v0)
L80028894:
  lui $v1, 0x800a
L80028898:
  lhu $v1, -19558($v1)
L8002889c:
  sll $zero, $zero, 0x0
L800288a0:
  or $v0, $v0, $v1
L800288a4:
  andi $v0, $v0, 0x20
L800288a8:
  beq $v0, $zero, L80028918
L800288ac:
  sll $zero, $zero, 0x0
L800288b0:
  j L800288d0
L800288b4:
  sll $zero, $zero, 0x0
L800288b8:
  lui $v0, 0x800a
L800288bc:
  lhu $v0, -19560($v0)
L800288c0:
  sll $zero, $zero, 0x0
L800288c4:
  andi $v0, $v0, 0x20
L800288c8:
  beq $v0, $zero, L80028918
L800288cc:
  sll $zero, $zero, 0x0
L800288d0:
  lw $a0, 824($gp)
L800288d4:
  jal 0x80043178
L800288d8:
  addiu $s0, $zero, 1024
L800288dc:
  lw $a0, 836($gp)
L800288e0:
  lw $v0, 824($gp)
L800288e4:
  jal 0x80043178
L800288e8:
  sh $s0, 96($v0)
L800288ec:
  addiu $a0, $zero, 255
L800288f0:
  lw $v0, 836($gp)
L800288f4:
  addiu $a1, $zero, 2
L800288f8:
  jal 0x80015bd8
L800288fc:
  sh $s0, 96($v0)
L80028900:
  jal L8003fee0
L80028904:
  addiu $a0, $zero, 52
L80028908:
  lbu $v0, 832($gp)
L8002890c:
  sll $zero, $zero, 0x0
L80028910:
  ori $v0, $v0, 0x50
L80028914:
  sb $v0, 832($gp)
L80028918:
  lw $ra, 40($sp)
L8002891c:
  lw $s1, 36($sp)
L80028920:
  lw $s0, 32($sp)
L80028924:
  jr $ra
L80028928:
  addiu $sp, $sp, 48
L8002892c:
  lbu $v1, 844($gp)
L80028930:
  addiu $sp, $sp, -24
L80028934:
  sw $ra, 16($sp)
L80028938:
  beq $v1, $zero, L8002899c
L8002893c:
  addu $v0, $zero, $zero
L80028940:
  andi $v0, $v1, 0x80
L80028944:
  bne $v0, $zero, L80028964
L80028948:
  andi $v0, $v1, 0x40
L8002894c:
  sb $v1, 834($gp)
L80028950:
  ori $v1, $v1, 0x80
L80028954:
  sb $v1, 844($gp)
L80028958:
  sb $zero, 832($gp)
L8002895c:
  j L8002899c
L80028960:
  addiu $v0, $zero, 1
L80028964:
  bne $v0, $zero, L80028994
L80028968:
  lui $v0, 0x8009
L8002896c:
  lbu $v1, 834($gp)
L80028970:
  addiu $v0, $v0, 2876
L80028974:
  sll $v1, $v1, 0x2
L80028978:
  addu $v1, $v1, $v0
L8002897c:
  lw $v0, 0($v1)
L80028980:
  sll $zero, $zero, 0x0
L80028984:
  jalr $ra, $v0
L80028988:
  sll $zero, $zero, 0x0
L8002898c:
  j L8002899c
L80028990:
  addiu $v0, $zero, 1
L80028994:
  sb $zero, 844($gp)
L80028998:
  addu $v0, $zero, $zero
L8002899c:
  lw $ra, 16($sp)
L800289a0:
  sll $zero, $zero, 0x0
L800289a4:
  jr $ra
L800289a8:
  addiu $sp, $sp, 24
L800289ac:
  jr $ra
L800289b0:
  sll $zero, $zero, 0x0
L800289b4:
  jr $ra
L800289b8:
  sll $zero, $zero, 0x0
L800289bc:
  addiu $sp, $sp, -24
L800289c0:
  addu $a2, $a0, $zero
L800289c4:
  sw $ra, 20($sp)
L800289c8:
  bne $a1, $zero, L80028a10
L800289cc:
  sw $s0, 16($sp)
L800289d0:
  lui $a0, 0xffdc
L800289d4:
  ori $a0, $a0, 0xffff
L800289d8:
  addiu $v0, $zero, 14336
L800289dc:
  sw $v0, 28($a2)
L800289e0:
  lui $v0, 0x800a
L800289e4:
  lw $v0, -20236($v0)
L800289e8:
  lui $v1, 0x800a
L800289ec:
  lw $v1, -20200($v1)
L800289f0:
  and $v0, $v0, $a0
L800289f4:
  lui $at, 0x800a
L800289f8:
  sw $v0, -20236($at)
L800289fc:
  addiu $v0, $zero, 1
L80028a00:
  sw $v1, 12($a2)
L80028a04:
  sw $v1, 8($a2)
L80028a08:
  j L80028af8
L80028a0c:
  sb $v0, 70($a2)
L80028a10:
  lui $v0, 0x800f
L80028a14:
  addiu $v0, $v0, -24344
L80028a18:
  lw $s0, 56($a2)
L80028a1c:
  lui $a1, 0x800a
L80028a20:
  lw $a1, -20200($a1)
L80028a24:
  sll $s0, $s0, 0x6
L80028a28:
  addu $s0, $s0, $v0
L80028a2c:
  addiu $a0, $s0, 8
L80028a30:
  lhu $v1, 40($s0)
L80028a34:
  lhu $a2, 42($s0)
L80028a38:
  addiu $v0, $zero, 51
L80028a3c:
  sh $v0, 12($s0)
L80028a40:
  addiu $v0, $zero, 96
L80028a44:
  sh $v0, 14($s0)
L80028a48:
  sh $v1, 8($s0)
L80028a4c:
  jal 0x8007f978
L80028a50:
  sh $a2, 10($s0)
L80028a54:
  addiu $a0, $s0, 16
L80028a58:
  lhu $v1, 44($s0)
L80028a5c:
  lui $a1, 0x800a
L80028a60:
  lw $a1, -20200($a1)
L80028a64:
  addiu $v0, $zero, 256
L80028a68:
  sh $v0, 20($s0)
L80028a6c:
  addiu $v0, $zero, 1
L80028a70:
  sh $v0, 22($s0)
L80028a74:
  lhu $v0, 46($s0)
L80028a78:
  addiu $a1, $a1, 9792
L80028a7c:
  sh $v1, 16($s0)
L80028a80:
  jal 0x8007f978
L80028a84:
  sh $v0, 18($s0)
L80028a88:
  addiu $a0, $s0, 24
L80028a8c:
  lhu $v1, 40($s0)
L80028a90:
  lui $a1, 0x800a
L80028a94:
  lw $a1, -20200($a1)
L80028a98:
  addiu $v0, $zero, 24
L80028a9c:
  sh $v0, 28($s0)
L80028aa0:
  addiu $v0, $zero, 14
L80028aa4:
  sh $v0, 30($s0)
L80028aa8:
  lhu $v0, 42($s0)
L80028aac:
  addiu $a1, $a1, 10304
L80028ab0:
  addiu $v0, $v0, 96
L80028ab4:
  sh $v1, 24($s0)
L80028ab8:
  jal 0x8007f978
L80028abc:
  sh $v0, 26($s0)
L80028ac0:
  addiu $a0, $s0, 32
L80028ac4:
  lui $a1, 0x800a
L80028ac8:
  lw $a1, -20200($a1)
L80028acc:
  addiu $v0, $zero, 8
L80028ad0:
  sh $v0, 36($s0)
L80028ad4:
  addiu $v0, $zero, 88
L80028ad8:
  sh $v0, 38($s0)
L80028adc:
  lhu $v0, 40($s0)
L80028ae0:
  lhu $v1, 42($s0)
L80028ae4:
  addiu $a1, $a1, 10976
L80028ae8:
  addiu $v0, $v0, 56
L80028aec:
  sh $v0, 32($s0)
L80028af0:
  jal 0x8007f978
L80028af4:
  sh $v1, 34($s0)
L80028af8:
  lw $ra, 20($sp)
L80028afc:
  lw $s0, 16($sp)
L80028b00:
  jr $ra
L80028b04:
  addiu $sp, $sp, 24
L80028b08:
  addiu $sp, $sp, -80
L80028b0c:
  sw $s3, 52($sp)
L80028b10:
  addu $s3, $a0, $zero
L80028b14:
  sw $fp, 72($sp)
L80028b18:
  sw $ra, 76($sp)
L80028b1c:
  sw $s7, 68($sp)
L80028b20:
  sw $s6, 64($sp)
L80028b24:
  sw $s5, 60($sp)
L80028b28:
  sw $s4, 56($sp)
L80028b2c:
  sw $s2, 48($sp)
L80028b30:
  sw $s1, 44($sp)
L80028b34:
  sw $s0, 40($sp)
L80028b38:
  lw $v0, 4($s3)
L80028b3c:
  lw $s2, 84($s3)
L80028b40:
  bltz $v0, L800290d8
L80028b44:
  addu $fp, $a1, $zero
L80028b48:
  lhu $a0, 8($s2)
L80028b4c:
  sll $zero, $zero, 0x0
L80028b50:
  andi $v0, $a0, 0x40
L80028b54:
  beq $v0, $zero, L800290d8
L80028b58:
  lui $s7, 0x1f80
L80028b5c:
  ori $s7, $s7, 0x398
L80028b60:
  lui $s1, 0x1f80
L80028b64:
  ori $s1, $s1, 0x320
L80028b68:
  lui $s6, 0x1f80
L80028b6c:
  lh $v0, 20($s2)
L80028b70:
  lui $v1, 0x1
L80028b74:
  addiu $v0, $v0, -1
L80028b78:
  andi $v0, $v0, 0xffff
L80028b7c:
  or $s5, $v0, $v1
L80028b80:
  andi $v0, $a0, 0x4
L80028b84:
  beq $v0, $zero, L80028c1c
L80028b88:
  ori $s6, $s6, 0x344
L80028b8c:
  lui $v1, 0xf7ff
L80028b90:
  ori $v1, $v1, 0xffff
L80028b94:
  addu $a0, $s3, $zero
L80028b98:
  lui $a3, 0x1f80
L80028b9c:
  lw $v0, 32($s2)
L80028ba0:
  lw $a1, 4($s3)
L80028ba4:
  ori $a3, $a3, 0x398
L80028ba8:
  sw $v0, 32($s3)
L80028bac:
  lw $v0, 68($s2)
L80028bb0:
  and $a1, $a1, $v1
L80028bb4:
  sw $a1, 4($s3)
L80028bb8:
  sw $v0, 68($s3)
L80028bbc:
  lw $v0, 4($s2)
L80028bc0:
  lui $v1, 0x800
L80028bc4:
  and $v0, $v0, $v1
L80028bc8:
  or $a1, $a1, $v0
L80028bcc:
  sw $a1, 4($s3)
L80028bd0:
  lh $v1, 48($s2)
L80028bd4:
  lh $a1, 24($s2)
L80028bd8:
  lh $v0, 50($s2)
L80028bdc:
  lh $a2, 26($s2)
L80028be0:
  addu $a1, $v1, $a1
L80028be4:
  jal 0x80041f90
L80028be8:
  addu $a2, $v0, $a2
L80028bec:
  blez $v0, L800290d8
L80028bf0:
  addiu $v0, $zero, 9
L80028bf4:
  lh $v1, 20($s2)
L80028bf8:
  lw $a0, 12($s2)
L80028bfc:
  sb $v0, 3($s6)
L80028c00:
  lui $v0, 0xf
L80028c04:
  addiu $v1, $v1, -1
L80028c08:
  andi $v1, $v1, 0xffff
L80028c0c:
  or $s5, $v1, $v0
L80028c10:
  addiu $v0, $zero, 44
L80028c14:
  sw $a0, 4($s6)
L80028c18:
  sb $v0, 7($s6)
L80028c1c:
  lui $a0, 0x1f80
L80028c20:
  lw $v0, 4($s3)
L80028c24:
  ori $a0, $a0, 0x320
L80028c28:
  sw $v0, 0($s1)
L80028c2c:
  lhu $v0, 48($s2)
L80028c30:
  addiu $s0, $zero, 96
L80028c34:
  addiu $v0, $v0, 19
L80028c38:
  sh $v0, 4($s1)
L80028c3c:
  lhu $v1, 50($s2)
L80028c40:
  addiu $v0, $zero, 102
L80028c44:
  sh $v0, 8($s1)
L80028c48:
  sh $s0, 10($s1)
L80028c4c:
  addiu $v1, $v1, 50
L80028c50:
  sh $v1, 6($s1)
L80028c54:
  lw $v0, 12($s2)
L80028c58:
  lui $a1, 0x1f80
L80028c5c:
  sw $v0, 20($s1)
L80028c60:
  lw $v0, 64($s3)
L80028c64:
  ori $a1, $a1, 0x344
L80028c68:
  sw $v0, 16($s1)
L80028c6c:
  lhu $v0, 92($s3)
L80028c70:
  addu $a2, $fp, $zero
L80028c74:
  sh $v0, 14($s1)
L80028c78:
  lbu $v0, 102($s3)
L80028c7c:
  addu $a3, $s5, $zero
L80028c80:
  sw $s7, 16($sp)
L80028c84:
  jal 0x80042188
L80028c88:
  sh $v0, 12($s1)
L80028c8c:
  lui $t2, 0xfeff
L80028c90:
  ori $t2, $t2, 0xffff
L80028c94:
  lui $a0, 0x1f80
L80028c98:
  ori $a0, $a0, 0x320
L80028c9c:
  lui $a1, 0x1f80
L80028ca0:
  ori $a1, $a1, 0x344
L80028ca4:
  addu $a2, $fp, $zero
L80028ca8:
  addu $a3, $s5, $zero
L80028cac:
  addiu $t1, $zero, 14
L80028cb0:
  lbu $v0, 7($s6)
L80028cb4:
  addiu $s4, $zero, 248
L80028cb8:
  ori $v0, $v0, 0x2
L80028cbc:
  sb $v0, 7($s6)
L80028cc0:
  lhu $v0, 48($s2)
L80028cc4:
  lw $v1, 0($s1)
L80028cc8:
  addiu $v0, $v0, 12
L80028ccc:
  sh $v0, 4($s1)
L80028cd0:
  lhu $t0, 50($s2)
L80028cd4:
  lbu $v0, 15($s1)
L80028cd8:
  and $v1, $v1, $t2
L80028cdc:
  sh $s0, 8($s1)
L80028ce0:
  sh $t1, 10($s1)
L80028ce4:
  sh $s4, 18($s1)
L80028ce8:
  addiu $v0, $v0, 96
L80028cec:
  sb $v0, 15($s1)
L80028cf0:
  lui $v0, 0x6000
L80028cf4:
  or $v1, $v1, $v0
L80028cf8:
  addiu $v0, $zero, 480
L80028cfc:
  addiu $t0, $t0, 14
L80028d00:
  sw $v1, 0($s1)
L80028d04:
  sh $v0, 16($s1)
L80028d08:
  sw $s7, 16($sp)
L80028d0c:
  jal 0x80042188
L80028d10:
  sh $t0, 6($s1)
L80028d14:
  sw $zero, 4($s7)
L80028d18:
  lbu $a0, 103($s3)
L80028d1c:
  lhu $v0, 16($s1)
L80028d20:
  addiu $v1, $zero, 31
L80028d24:
  sh $v1, 12($s1)
L80028d28:
  addiu $v0, $v0, 16
L80028d2c:
  sh $v0, 16($s1)
L80028d30:
  lhu $v0, 48($s2)
L80028d34:
  lhu $v1, 48($s3)
L80028d38:
  sll $zero, $zero, 0x0
L80028d3c:
  addu $v0, $v0, $v1
L80028d40:
  sh $v0, 4($s1)
L80028d44:
  lhu $v0, 50($s2)
L80028d48:
  lhu $v1, 50($s3)
L80028d4c:
  sll $zero, $zero, 0x0
L80028d50:
  addu $v0, $v0, $v1
L80028d54:
  sh $v0, 6($s1)
L80028d58:
  lw $v0, 60($s3)
L80028d5c:
  sll $zero, $zero, 0x0
L80028d60:
  sw $v0, 8($s1)
L80028d64:
  lhu $v0, 94($s3)
L80028d68:
  sll $a0, $a0, 0x6
L80028d6c:
  sh $v0, 14($s1)
L80028d70:
  lui $v0, 0x800f
L80028d74:
  addiu $v0, $v0, -24344
L80028d78:
  lbu $v1, 104($s3)
L80028d7c:
  sll $zero, $zero, 0x0
L80028d80:
  sltiu $v1, $v1, 20
L80028d84:
  beq $v1, $zero, L8002904c
L80028d88:
  addu $s3, $a0, $v0
L80028d8c:
  lbu $v0, 60($s3)
L80028d90:
  sll $zero, $zero, 0x0
L80028d94:
  andi $v0, $v0, 0x80
L80028d98:
  beq $v0, $zero, L80028db0
L80028d9c:
  lui $a0, 0x1f80
L80028da0:
  lhu $v0, 18($s1)
L80028da4:
  sll $zero, $zero, 0x0
L80028da8:
  addiu $v0, $v0, 1
L80028dac:
  sh $v0, 18($s1)
L80028db0:
  ori $a0, $a0, 0x320
L80028db4:
  lui $a1, 0x1f80
L80028db8:
  ori $a1, $a1, 0x344
L80028dbc:
  addu $a2, $fp, $zero
L80028dc0:
  addu $a3, $s5, $zero
L80028dc4:
  jal 0x80042188
L80028dc8:
  sw $s7, 16($sp)
L80028dcc:
  lbu $v0, 15($s1)
L80028dd0:
  lbu $v1, 10($s1)
L80028dd4:
  ori $a0, $zero, 0xffff
L80028dd8:
  sh $s4, 18($s1)
L80028ddc:
  addu $v0, $v0, $v1
L80028de0:
  sb $v0, 15($s1)
L80028de4:
  lhu $v0, 10($s1)
L80028de8:
  lhu $v1, 6($s1)
L80028dec:
  addu $v0, $v0, $a0
L80028df0:
  addu $v1, $v1, $v0
L80028df4:
  sh $v1, 6($s1)
L80028df8:
  lbu $v0, 60($s3)
L80028dfc:
  sll $zero, $zero, 0x0
L80028e00:
  andi $v0, $v0, 0x40
L80028e04:
  beq $v0, $zero, L80028e10
L80028e08:
  addiu $v0, $zero, 249
L80028e0c:
  sh $v0, 18($s1)
L80028e10:
  lui $a0, 0x1f80
L80028e14:
  ori $a0, $a0, 0x320
L80028e18:
  lui $a1, 0x1f80
L80028e1c:
  ori $a1, $a1, 0x344
L80028e20:
  addu $a2, $fp, $zero
L80028e24:
  addu $a3, $s5, $zero
L80028e28:
  jal 0x80042188
L80028e2c:
  sw $s7, 16($sp)
L80028e30:
  sh $s4, 18($s1)
L80028e34:
  lh $v0, 50($s3)
L80028e38:
  lh $v1, 54($s3)
L80028e3c:
  sll $zero, $zero, 0x0
L80028e40:
  addu $s0, $v0, $v1
L80028e44:
  slti $v0, $s0, 10000
L80028e48:
  bne $v0, $zero, L80028e58
L80028e4c:
  addu $a0, $s0, $zero
L80028e50:
  addiu $s0, $zero, 9999
L80028e54:
  addu $a0, $s0, $zero
L80028e58:
  addiu $a1, $zero, 4
L80028e5c:
  jal L800357e8
L80028e60:
  addiu $a2, $sp, 24
L80028e64:
  lh $v0, 52($s3)
L80028e68:
  lh $v1, 56($s3)
L80028e6c:
  sll $zero, $zero, 0x0
L80028e70:
  addu $s0, $v0, $v1
L80028e74:
  slti $v0, $s0, 10000
L80028e78:
  bne $v0, $zero, L80028e88
L80028e7c:
  addu $a0, $s0, $zero
L80028e80:
  addiu $s0, $zero, 9999
L80028e84:
  addu $a0, $s0, $zero
L80028e88:
  addiu $a1, $zero, 4
L80028e8c:
  jal L800357e8
L80028e90:
  addiu $a2, $sp, 32
L80028e94:
  lbu $v0, 15($s1)
L80028e98:
  sll $zero, $zero, 0x0
L80028e9c:
  andi $v0, $v0, 0x80
L80028ea0:
  addiu $v0, $v0, 16
L80028ea4:
  sb $v0, 15($s1)
L80028ea8:
  lhu $v0, 48($s2)
L80028eac:
  lui $v1, 0xd
L80028eb0:
  addiu $v0, $v0, 97
L80028eb4:
  sh $v0, 4($s1)
L80028eb8:
  lhu $v0, 50($s2)
L80028ebc:
  ori $v1, $v1, 0x6
L80028ec0:
  sw $v1, 8($s1)
L80028ec4:
  addiu $v0, $v0, 157
L80028ec8:
  sh $v0, 6($s1)
L80028ecc:
  lbu $v0, 60($s3)
L80028ed0:
  sll $zero, $zero, 0x0
L80028ed4:
  andi $v0, $v0, 0x80
L80028ed8:
  beq $v0, $zero, L80028ee4
L80028edc:
  addiu $v0, $zero, 249
L80028ee0:
  sh $v0, 18($s1)
L80028ee4:
  addiu $s0, $zero, 3
L80028ee8:
  addiu $s4, $sp, 24
L80028eec:
  addu $a0, $s1, $zero
L80028ef0:
  addu $a1, $s6, $zero
L80028ef4:
  addu $a2, $fp, $zero
L80028ef8:
  addu $v0, $s4, $s0
L80028efc:
  lbu $v1, 0($v0)
L80028f00:
  addu $a3, $s5, $zero
L80028f04:
  sw $s7, 16($sp)
L80028f08:
  sll $v0, $v1, 0x1
L80028f0c:
  addu $v0, $v0, $v1
L80028f10:
  sll $v0, $v0, 0x1
L80028f14:
  addiu $v0, $v0, 16
L80028f18:
  jal 0x80042188
L80028f1c:
  sb $v0, 14($s1)
L80028f20:
  lhu $v0, 4($s1)
L80028f24:
  addiu $s0, $s0, -1
L80028f28:
  addiu $v0, $v0, 6
L80028f2c:
  bgez $s0, L80028eec
L80028f30:
  sh $v0, 4($s1)
L80028f34:
  lhu $v0, 48($s2)
L80028f38:
  sll $zero, $zero, 0x0
L80028f3c:
  addiu $v0, $v0, 97
L80028f40:
  sh $v0, 4($s1)
L80028f44:
  lhu $v0, 50($s2)
L80028f48:
  addiu $v1, $zero, 248
L80028f4c:
  sh $v1, 18($s1)
L80028f50:
  addiu $v0, $v0, 171
L80028f54:
  sh $v0, 6($s1)
L80028f58:
  lbu $v0, 60($s3)
L80028f5c:
  sll $zero, $zero, 0x0
L80028f60:
  andi $v0, $v0, 0x40
L80028f64:
  beq $v0, $zero, L80028f70
L80028f68:
  addiu $v0, $zero, 249
L80028f6c:
  sh $v0, 18($s1)
L80028f70:
  addiu $s0, $zero, 3
L80028f74:
  addiu $s4, $sp, 32
L80028f78:
  addu $a0, $s1, $zero
L80028f7c:
  addu $a1, $s6, $zero
L80028f80:
  addu $a2, $fp, $zero
L80028f84:
  addu $v0, $s4, $s0
L80028f88:
  lbu $v1, 0($v0)
L80028f8c:
  addu $a3, $s5, $zero
L80028f90:
  sw $s7, 16($sp)
L80028f94:
  sll $v0, $v1, 0x1
L80028f98:
  addu $v0, $v0, $v1
L80028f9c:
  sll $v0, $v0, 0x1
L80028fa0:
  addiu $v0, $v0, 16
L80028fa4:
  jal 0x80042188
L80028fa8:
  sb $v0, 14($s1)
L80028fac:
  lhu $v0, 4($s1)
L80028fb0:
  addiu $s0, $s0, -1
L80028fb4:
  addiu $v0, $v0, 6
L80028fb8:
  bgez $s0, L80028f78
L80028fbc:
  sh $v0, 4($s1)
L80028fc0:
  lhu $v0, 48($s2)
L80028fc4:
  lui $a0, 0x9
L80028fc8:
  ori $a0, $a0, 0x9
L80028fcc:
  addiu $v0, $v0, 119
L80028fd0:
  sh $v0, 4($s1)
L80028fd4:
  lhu $v1, 50($s2)
L80028fd8:
  addiu $v0, $zero, 448
L80028fdc:
  sh $v0, 16($s1)
L80028fe0:
  addiu $v0, $zero, 248
L80028fe4:
  sw $a0, 8($s1)
L80028fe8:
  sb $zero, 14($s1)
L80028fec:
  sh $v0, 18($s1)
L80028ff0:
  addiu $v1, $v1, 32
L80028ff4:
  sh $v1, 6($s1)
L80028ff8:
  lbu $v0, 58($s3)
L80028ffc:
  sll $zero, $zero, 0x0
L80029000:
  beq $v0, $zero, L8002906c
L80029004:
  addu $s0, $zero, $zero
L80029008:
  addu $a0, $s1, $zero
L8002900c:
  addu $a1, $s6, $zero
L80029010:
  addu $a2, $fp, $zero
L80029014:
  addu $a3, $s5, $zero
L80029018:
  jal 0x80042188
L8002901c:
  sw $s7, 16($sp)
L80029020:
  lhu $v0, 4($s1)
L80029024:
  sll $zero, $zero, 0x0
L80029028:
  addiu $v0, $v0, -9
L8002902c:
  sh $v0, 4($s1)
L80029030:
  lbu $v0, 58($s3)
L80029034:
  addiu $s0, $s0, 1
L80029038:
  slt $v0, $s0, $v0
L8002903c:
  bne $v0, $zero, L8002900c
L80029040:
  addu $a0, $s1, $zero
L80029044:
  j L80029070
L80029048:
  lui $v1, 0x10
L8002904c:
  sw $s7, 16($sp)
L80029050:
  lui $a0, 0x1f80
L80029054:
  ori $a0, $a0, 0x320
L80029058:
  lui $a1, 0x1f80
L8002905c:
  ori $a1, $a1, 0x344
L80029060:
  addu $a2, $fp, $zero
L80029064:
  jal 0x80042188
L80029068:
  addu $a3, $s5, $zero
L8002906c:
  lui $v1, 0x10
L80029070:
  ori $v1, $v1, 0x10
L80029074:
  addu $a0, $s1, $zero
L80029078:
  addu $a1, $s6, $zero
L8002907c:
  lhu $v0, 48($s2)
L80029080:
  addu $a2, $fp, $zero
L80029084:
  addiu $v0, $v0, 110
L80029088:
  sh $v0, 4($a0)
L8002908c:
  lhu $v0, 50($s2)
L80029090:
  addu $a3, $s5, $zero
L80029094:
  sw $v1, 8($a0)
L80029098:
  addiu $v0, $v0, 13
L8002909c:
  sh $v0, 6($a0)
L800290a0:
  lbu $v0, 15($a0)
L800290a4:
  lbu $v1, 59($s3)
L800290a8:
  andi $v0, $v0, 0x80
L800290ac:
  sll $v1, $v1, 0x4
L800290b0:
  sb $v1, 14($a0)
L800290b4:
  andi $t0, $v1, 0xff
L800290b8:
  sb $v0, 15($a0)
L800290bc:
  lhu $v1, 64($s2)
L800290c0:
  addiu $v0, $zero, 255
L800290c4:
  sh $v0, 18($a0)
L800290c8:
  sw $s7, 16($sp)
L800290cc:
  addu $v1, $v1, $t0
L800290d0:
  jal 0x80042188
L800290d4:
  sh $v1, 16($a0)
L800290d8:
  lw $ra, 76($sp)
L800290dc:
  lw $fp, 72($sp)
L800290e0:
  lw $s7, 68($sp)
L800290e4:
  lw $s6, 64($sp)
L800290e8:
  lw $s5, 60($sp)
L800290ec:
  lw $s4, 56($sp)
L800290f0:
  lw $s3, 52($sp)
L800290f4:
  lw $s2, 48($sp)
L800290f8:
  lw $s1, 44($sp)
L800290fc:
  lw $s0, 40($sp)
L80029100:
  jr $ra
L80029104:
  addiu $sp, $sp, 80
L80029108:
  addiu $sp, $sp, -24
L8002910c:
  sw $s0, 16($sp)
L80029110:
  addu $s0, $a0, $zero
L80029114:
  addiu $v1, $zero, 2
L80029118:
  bltz $a1, L80029124
L8002911c:
  sw $ra, 20($sp)
L80029120:
  lbu $v1, 106($s0)
L80029124:
  lbu $v0, 105($s0)
L80029128:
  sll $zero, $zero, 0x0
L8002912c:
  beq $v1, $v0, L80029154
L80029130:
  sll $zero, $zero, 0x0
L80029134:
  addu $a0, $s0, $zero
L80029138:
  jal 0x80040410
L8002913c:
  addu $a1, $v1, $zero
L80029140:
  jal 0x80041d60
L80029144:
  addu $a0, $s0, $zero
L80029148:
  addiu $v0, $zero, 1
L8002914c:
  lui $at, 0x800a
L80029150:
  sw $v0, -19420($at)
L80029154:
  lw $ra, 20($sp)
L80029158:
  lw $s0, 16($sp)
L8002915c:
  jr $ra
L80029160:
  addiu $sp, $sp, 24
L80029164:
  addiu $sp, $sp, -40
L80029168:
  sw $s0, 32($sp)
L8002916c:
  addu $s0, $a0, $zero
L80029170:
  lui $v1, 0x800f
L80029174:
  addiu $v1, $v1, -24344
L80029178:
  sll $v0, $s0, 0x6
L8002917c:
  addu $v0, $v0, $v1
L80029180:
  sw $ra, 36($sp)
L80029184:
  sh $a1, 48($v0)
L80029188:
  lui $v0, 0x8003
L8002918c:
  addiu $v0, $v0, -30276
L80029190:
  addiu $a1, $a1, -1
L80029194:
  sll $a2, $a1, 0x3
L80029198:
  subu $a2, $a2, $a1
L8002919c:
  addu $a0, $zero, $zero
L800291a0:
  addu $a1, $a0, $zero
L800291a4:
  addiu $a2, $a2, 722
L800291a8:
  addiu $a3, $zero, 7
L800291ac:
  sw $v0, 16($sp)
L800291b0:
  sw $zero, 20($sp)
L800291b4:
  jal 0x80014eec
L800291b8:
  sw $zero, 24($sp)
L800291bc:
  lw $v1, 44($v0)
L800291c0:
  sw $s0, 56($v0)
L800291c4:
  lw $ra, 36($sp)
L800291c8:
  lw $s0, 32($sp)
L800291cc:
  ori $v1, $v1, 0x10
L800291d0:
  lui $at, 0x800a
L800291d4:
  sw $v1, -20236($at)
L800291d8:
  jr $ra
L800291dc:
  addiu $sp, $sp, 40
L800291e0:
  addiu $sp, $sp, -64
L800291e4:
  sw $s0, 40($sp)
L800291e8:
  addu $s0, $a0, $zero
L800291ec:
  sw $s3, 52($sp)
L800291f0:
  addu $s3, $a1, $zero
L800291f4:
  sw $s4, 56($sp)
L800291f8:
  addu $s4, $a2, $zero
L800291fc:
  sll $v1, $s0, 0x6
L80029200:
  lui $v0, 0x800f
L80029204:
  addiu $v0, $v0, -24344
L80029208:
  sw $s2, 48($sp)
L8002920c:
  addu $s2, $v1, $v0
L80029210:
  sw $ra, 60($sp)
L80029214:
  jal 0x8004002c
L80029218:
  sw $s1, 44($sp)
L8002921c:
  addu $a0, $v0, $zero
L80029220:
  jal 0x800400ac
L80029224:
  addiu $a1, $zero, 6
L80029228:
  addu $s1, $v0, $zero
L8002922c:
  addu $a0, $s1, $zero
L80029230:
  addiu $v0, $zero, 96
L80029234:
  addu $a1, $zero, $zero
L80029238:
  sw $v0, 16($sp)
L8002923c:
  sw $zero, 20($sp)
L80029240:
  sw $zero, 24($sp)
L80029244:
  lhu $v1, 40($s2)
L80029248:
  lhu $v0, 42($s2)
L8002924c:
  sll $v1, $v1, 0x10
L80029250:
  sra $v1, $v1, 0x16
L80029254:
  sll $v0, $v0, 0x10
L80029258:
  sra $v0, $v0, 0x18
L8002925c:
  sll $v0, $v0, 0x4
L80029260:
  addu $v1, $v1, $v0
L80029264:
  sw $v1, 28($sp)
L80029268:
  lh $v0, 44($s2)
L8002926c:
  addu $a2, $a1, $zero
L80029270:
  sw $v0, 32($sp)
L80029274:
  lh $v0, 46($s2)
L80029278:
  addiu $a3, $zero, 102
L8002927c:
  jal 0x80040510
L80029280:
  sw $v0, 36($sp)
L80029284:
  lui $v1, 0x1f
L80029288:
  lui $v0, 0x10
L8002928c:
  ori $v0, $v0, 0x38
L80029290:
  sw $v0, 60($s1)
L80029294:
  ori $v0, $zero, 0x9e00
L80029298:
  sh $v0, 94($s1)
L8002929c:
  lw $v0, 4($s1)
L800292a0:
  ori $v1, $v1, 0x48
L800292a4:
  sw $v1, 48($s1)
L800292a8:
  lui $v1, 0x100
L800292ac:
  or $v0, $v0, $v1
L800292b0:
  lui $v1, 0x801d
L800292b4:
  sw $v0, 4($s1)
L800292b8:
  lh $a0, 48($s2)
L800292bc:
  addiu $v1, $v1, 16964
L800292c0:
  addiu $v0, $a0, -1
L800292c4:
  sll $v0, $v0, 0x2
L800292c8:
  addu $v0, $v0, $v1
L800292cc:
  lw $v0, 0($v0)
L800292d0:
  sb $s0, 103($s1)
L800292d4:
  sra $v0, $v0, 0x1a
L800292d8:
  andi $s0, $v0, 0x1f
L800292dc:
  addiu $v0, $zero, 21
L800292e0:
  beq $s0, $v0, L80029348
L800292e4:
  sb $s0, 104($s1)
L800292e8:
  slti $v0, $s0, 22
L800292ec:
  beq $v0, $zero, L80029304
L800292f0:
  addiu $v0, $zero, 20
L800292f4:
  beq $s0, $v0, L8002933c
L800292f8:
  addiu $v0, $zero, 72
L800292fc:
  j L80029360
L80029300:
  sh $v0, 48($s1)
L80029304:
  addiu $v0, $zero, 22
L80029308:
  beq $s0, $v0, L80029320
L8002930c:
  addiu $v0, $zero, 23
L80029310:
  beq $s0, $v0, L8002932c
L80029314:
  addiu $v0, $zero, 72
L80029318:
  j L80029360
L8002931c:
  sh $v0, 48($s1)
L80029320:
  addiu $s3, $zero, 259
L80029324:
  j L8002940c
L80029328:
  addiu $s0, $zero, 1
L8002932c:
  lbu $v0, 95($s1)
L80029330:
  sll $zero, $zero, 0x0
L80029334:
  addiu $v0, $v0, 32
L80029338:
  sb $v0, 95($s1)
L8002933c:
  addiu $s3, $zero, 257
L80029340:
  j L8002940c
L80029344:
  addiu $s0, $zero, 1
L80029348:
  addiu $s3, $zero, 258
L8002934c:
  lbu $v0, 95($s1)
L80029350:
  addiu $s0, $zero, 1
L80029354:
  addiu $v0, $v0, 16
L80029358:
  j L8002940c
L8002935c:
  sb $v0, 95($s1)
L80029360:
  addiu $v0, $zero, 158
L80029364:
  sh $v0, 50($s1)
L80029368:
  addiu $v0, $zero, 206
L8002936c:
  sb $v0, 95($s1)
L80029370:
  addiu $v0, $zero, 24
L80029374:
  sh $v0, 60($s1)
L80029378:
  addiu $v0, $zero, 12
L8002937c:
  sh $v0, 62($s1)
L80029380:
  sll $v0, $s3, 0x10
L80029384:
  bgez $v0, L800293bc
L80029388:
  sh $s3, 50($s2)
L8002938c:
  lui $v1, 0x801d
L80029390:
  addiu $v1, $v1, 16964
L80029394:
  addiu $v0, $a0, -1
L80029398:
  sll $v0, $v0, 0x2
L8002939c:
  addu $v0, $v0, $v1
L800293a0:
  lw $v1, 0($v0)
L800293a4:
  sll $zero, $zero, 0x0
L800293a8:
  andi $v1, $v1, 0x1ff
L800293ac:
  sll $v0, $v1, 0x2
L800293b0:
  addu $v0, $v0, $v1
L800293b4:
  sll $v0, $v0, 0x1
L800293b8:
  sh $v0, 50($s2)
L800293bc:
  sll $v0, $s4, 0x10
L800293c0:
  bgez $v0, L800293fc
L800293c4:
  sh $s4, 52($s2)
L800293c8:
  lui $v1, 0x801d
L800293cc:
  addiu $v1, $v1, 16964
L800293d0:
  addiu $v0, $a0, -1
L800293d4:
  sll $v0, $v0, 0x2
L800293d8:
  addu $v0, $v0, $v1
L800293dc:
  lw $v1, 0($v0)
L800293e0:
  sll $zero, $zero, 0x0
L800293e4:
  sra $v1, $v1, 0x9
L800293e8:
  andi $v1, $v1, 0x1ff
L800293ec:
  sll $v0, $v1, 0x2
L800293f0:
  addu $v0, $v0, $v1
L800293f4:
  sll $v0, $v0, 0x1
L800293f8:
  sh $v0, 52($s2)
L800293fc:
  addiu $s3, $zero, 256
L80029400:
  addu $s0, $zero, $zero
L80029404:
  sh $zero, 56($s2)
L80029408:
  sh $zero, 54($s2)
L8002940c:
  lui $v1, 0x801d
L80029410:
  addiu $v1, $v1, 21298
L80029414:
  addu $v1, $a0, $v1
L80029418:
  lbu $v0, 0($v1)
L8002941c:
  sll $zero, $zero, 0x0
L80029420:
  srl $v0, $v0, 0x4
L80029424:
  sb $v0, 59($s2)
L80029428:
  lbu $v0, 0($v1)
L8002942c:
  addu $a0, $s1, $zero
L80029430:
  sb $zero, 60($s2)
L80029434:
  andi $v0, $v0, 0xf
L80029438:
  sb $v0, 58($s2)
L8002943c:
  lui $v0, 0x8003
L80029440:
  addiu $v0, $v0, -29944
L80029444:
  jal 0x80042918
L80029448:
  sw $v0, 76($s1)
L8002944c:
  jal 0x8004002c
L80029450:
  sw $s1, 4($s2)
L80029454:
  addu $a0, $v0, $zero
L80029458:
  jal 0x800400ac
L8002945c:
  addiu $a1, $zero, 2
L80029460:
  addu $s1, $v0, $zero
L80029464:
  addu $a0, $s1, $zero
L80029468:
  addiu $a1, $zero, 2
L8002946c:
  addiu $a2, $zero, 4
L80029470:
  addiu $a3, $zero, 1
L80029474:
  addiu $v0, $zero, 28
L80029478:
  sw $v0, 24($sp)
L8002947c:
  addiu $v0, $s3, 8
L80029480:
  sw $zero, 16($sp)
L80029484:
  sw $s0, 20($sp)
L80029488:
  jal 0x800404cc
L8002948c:
  sw $v0, 28($sp)
L80029490:
  addu $a0, $s1, $zero
L80029494:
  addiu $v0, $zero, 70
L80029498:
  sh $v0, 24($s1)
L8002949c:
  sh $v0, 72($s1)
L800294a0:
  addiu $v0, $zero, 98
L800294a4:
  sh $v0, 26($s1)
L800294a8:
  sh $v0, 74($s1)
L800294ac:
  lw $v0, 4($s1)
L800294b0:
  lhu $v1, 8($s1)
L800294b4:
  lui $a1, 0x100
L800294b8:
  sb $s0, 106($s1)
L800294bc:
  or $v0, $v0, $a1
L800294c0:
  ori $v1, $v1, 0x8
L800294c4:
  sw $v0, 4($s1)
L800294c8:
  jal 0x80042918
L800294cc:
  sh $v1, 8($s1)
L800294d0:
  addu $a0, $s1, $zero
L800294d4:
  jal 0x800428ec
L800294d8:
  addiu $a1, $zero, -1
L800294dc:
  lw $v1, 4($s2)
L800294e0:
  addiu $v0, $zero, 3
L800294e4:
  sb $v0, 101($v1)
L800294e8:
  sb $v0, 101($s1)
L800294ec:
  lui $v0, 0x8003
L800294f0:
  addiu $v0, $v0, -28408
L800294f4:
  sw $v0, 16($s1)
L800294f8:
  lw $v1, 4($s2)
L800294fc:
  addu $v0, $s1, $zero
L80029500:
  sw $v0, 0($s2)
L80029504:
  sw $v0, 84($v1)
L80029508:
  lw $ra, 60($sp)
L8002950c:
  lw $s4, 56($sp)
L80029510:
  lw $s3, 52($sp)
L80029514:
  lw $s2, 48($sp)
L80029518:
  lw $s1, 44($sp)
L8002951c:
  lw $s0, 40($sp)
L80029520:
  jr $ra
L80029524:
  addiu $sp, $sp, 64
L80029528:
  addiu $sp, $sp, -24
L8002952c:
  sw $s0, 16($sp)
L80029530:
  sll $s0, $a0, 0x6
L80029534:
  lui $v0, 0x800f
L80029538:
  addiu $v0, $v0, -24344
L8002953c:
  addu $s0, $s0, $v0
L80029540:
  sw $ra, 20($sp)
L80029544:
  lw $a0, 0($s0)
L80029548:
  jal 0x8004036c
L8002954c:
  sll $zero, $zero, 0x0
L80029550:
  lw $a0, 4($s0)
L80029554:
  jal 0x8004036c
L80029558:
  sll $zero, $zero, 0x0
L8002955c:
  sw $zero, 4($s0)
L80029560:
  sw $zero, 0($s0)
L80029564:
  lw $ra, 20($sp)
L80029568:
  lw $s0, 16($sp)
L8002956c:
  jr $ra
L80029570:
  addiu $sp, $sp, 24
L80029574:
  sll $a0, $a0, 0x6
L80029578:
  lui $v0, 0x800f
L8002957c:
  addiu $v0, $v0, -24344
L80029580:
  addu $a0, $a0, $v0
L80029584:
  sw $zero, 4($a0)
L80029588:
  jr $ra
L8002958c:
  sw $zero, 0($a0)
L80029590:
  addiu $sp, $sp, -48
L80029594:
  sw $s1, 36($sp)
L80029598:
  addu $s1, $zero, $zero
L8002959c:
  lui $v0, 0x800f
L800295a0:
  sw $s2, 40($sp)
L800295a4:
  addiu $s2, $v0, -24088
L800295a8:
  sw $ra, 44($sp)
L800295ac:
  sw $s0, 32($sp)
L800295b0:
  jal 0x8004002c
L800295b4:
  sll $zero, $zero, 0x0
L800295b8:
  addu $a0, $v0, $zero
L800295bc:
  jal 0x800400ac
L800295c0:
  addiu $a1, $zero, 2
L800295c4:
  addu $s0, $v0, $zero
L800295c8:
  addu $a0, $s0, $zero
L800295cc:
  addiu $a1, $zero, 8
L800295d0:
  addiu $v0, $zero, 3
L800295d4:
  sw $v0, 16($sp)
L800295d8:
  addiu $v0, $zero, 25
L800295dc:
  sw $v0, 24($sp)
L800295e0:
  addiu $v0, $zero, 262
L800295e4:
  sw $v0, 28($sp)
L800295e8:
  sra $v0, $s1, 0x1
L800295ec:
  sll $a2, $v0, 0x1
L800295f0:
  addu $a2, $a2, $v0
L800295f4:
  sll $a2, $a2, 0x2
L800295f8:
  subu $a2, $a2, $v0
L800295fc:
  sll $a2, $a2, 0x3
L80029600:
  addu $a2, $a2, $v0
L80029604:
  sll $a2, $a2, 0x1
L80029608:
  addu $a2, $a2, $a1
L8002960c:
  addu $a3, $zero, $zero
L80029610:
  jal 0x800404cc
L80029614:
  sw $s1, 20($sp)
L80029618:
  andi $v0, $s1, 0x1
L8002961c:
  beq $v0, $zero, L80029628
L80029620:
  addiu $v0, $zero, 168
L80029624:
  sh $v0, 48($s0)
L80029628:
  addu $a0, $s0, $zero
L8002962c:
  addiu $s1, $s1, 1
L80029630:
  lui $a1, 0x100
L80029634:
  lw $v0, 4($s0)
L80029638:
  lhu $v1, 8($s0)
L8002963c:
  or $v0, $v0, $a1
L80029640:
  andi $v1, $v1, 0xfff7
L80029644:
  sw $v0, 4($s0)
L80029648:
  jal 0x8004293c
L8002964c:
  sh $v1, 8($s0)
L80029650:
  addu $a0, $s0, $zero
L80029654:
  jal 0x800428ec
L80029658:
  addu $a1, $zero, $zero
L8002965c:
  sw $s0, 36($s2)
L80029660:
  slti $v0, $s1, 8
L80029664:
  bne $v0, $zero, L800295b0
L80029668:
  addiu $s2, $s2, 4
L8002966c:
  lw $ra, 44($sp)
L80029670:
  lw $s2, 40($sp)
L80029674:
  lw $s1, 36($sp)
L80029678:
  lw $s0, 32($sp)
L8002967c:
  jr $ra
L80029680:
  addiu $sp, $sp, 48
L80029684:
  addiu $sp, $sp, -80
L80029688:
  sw $s1, 44($sp)
L8002968c:
  lw $s1, 100($sp)
L80029690:
  sw $s2, 48($sp)
L80029694:
  lw $s2, 96($sp)
L80029698:
  sw $s0, 40($sp)
L8002969c:
  addu $s0, $a2, $zero
L800296a0:
  sw $s6, 64($sp)
L800296a4:
  addu $s6, $a3, $zero
L800296a8:
  sw $ra, 76($sp)
L800296ac:
  sw $fp, 72($sp)
L800296b0:
  sw $s7, 68($sp)
L800296b4:
  sw $s5, 60($sp)
L800296b8:
  sw $s4, 56($sp)
L800296bc:
  sw $s3, 52($sp)
L800296c0:
  sw $a0, 80($sp)
L800296c4:
  sw $a1, 84($sp)
L800296c8:
  sll $v0, $s1, 0x1
L800296cc:
  addu $v1, $v0, $s1
L800296d0:
  addu $v0, $s2, $s1
L800296d4:
  bgez $v1, L800296e0
L800296d8:
  sh $v0, 0($s0)
L800296dc:
  addiu $v1, $v1, 3
L800296e0:
  addu $a0, $s0, $zero
L800296e4:
  addiu $t0, $s0, 8
L800296e8:
  addu $a1, $t0, $zero
L800296ec:
  addiu $fp, $s0, 16
L800296f0:
  addu $a2, $fp, $zero
L800296f4:
  sra $v0, $v1, 0x2
L800296f8:
  addu $v0, $s2, $v0
L800296fc:
  sw $t0, 32($sp)
L80029700:
  lw $t0, 80($sp)
L80029704:
  addiu $s3, $s6, 4
L80029708:
  sh $v0, 8($s0)
L8002970c:
  sh $s2, 16($s0)
L80029710:
  sw $s6, 24($sp)
L80029714:
  sw $s3, 28($sp)
L80029718:
  addiu $s7, $t0, 8
L8002971c:
  addu $a3, $s7, $zero
L80029720:
  addiu $s5, $t0, 16
L80029724:
  addiu $s4, $t0, 24
L80029728:
  sw $s5, 16($sp)
L8002972c:
  jal 0x80087a50
L80029730:
  sw $s4, 20($sp)
L80029734:
  lw $v0, 4($s6)
L80029738:
  sll $zero, $zero, 0x0
L8002973c:
  bgez $v0, L8002979c
L80029740:
  addiu $a2, $zero, 1
L80029744:
  srl $v0, $s1, 0x1f
L80029748:
  addu $v0, $s1, $v0
L8002974c:
  sra $v0, $v0, 0x1
L80029750:
  addu $v1, $s2, $v0
L80029754:
  sh $v1, 0($s0)
L80029758:
  sll $v1, $v0, 0x1
L8002975c:
  addu $v0, $v1, $v0
L80029760:
  bgez $v0, L8002976c
L80029764:
  addu $a0, $s0, $zero
L80029768:
  addiu $v0, $v0, 3
L8002976c:
  addu $a2, $fp, $zero
L80029770:
  addu $a3, $s7, $zero
L80029774:
  sra $v0, $v0, 0x2
L80029778:
  lw $a1, 32($sp)
L8002977c:
  addu $v0, $s2, $v0
L80029780:
  sh $v0, 8($a0)
L80029784:
  sw $s5, 16($sp)
L80029788:
  sw $s4, 20($sp)
L8002978c:
  sw $s6, 24($sp)
L80029790:
  jal 0x80087a50
L80029794:
  sw $s3, 28($sp)
L80029798:
  addiu $a2, $zero, 1
L8002979c:
  lw $a0, 80($sp)
L800297a0:
  lw $a1, 84($sp)
L800297a4:
  jal 0x8005b260
L800297a8:
  addu $a3, $a2, $zero
L800297ac:
  lw $ra, 76($sp)
L800297b0:
  lw $fp, 72($sp)
L800297b4:
  lw $s7, 68($sp)
L800297b8:
  lw $s6, 64($sp)
L800297bc:
  lw $s5, 60($sp)
L800297c0:
  lw $s4, 56($sp)
L800297c4:
  lw $s3, 52($sp)
L800297c8:
  lw $s2, 48($sp)
L800297cc:
  lw $s1, 44($sp)
L800297d0:
  lw $s0, 40($sp)
L800297d4:
  jr $ra
L800297d8:
  addiu $sp, $sp, 80
L800297dc:
  addiu $sp, $sp, -80
L800297e0:
  sw $s1, 44($sp)
L800297e4:
  lw $s1, 100($sp)
L800297e8:
  sw $s2, 48($sp)
L800297ec:
  lw $s2, 96($sp)
L800297f0:
  sw $s0, 40($sp)
L800297f4:
  addu $s0, $a2, $zero
L800297f8:
  sw $s6, 64($sp)
L800297fc:
  addu $s6, $a3, $zero
L80029800:
  sw $ra, 76($sp)
L80029804:
  sw $fp, 72($sp)
L80029808:
  sw $s7, 68($sp)
L8002980c:
  sw $s5, 60($sp)
L80029810:
  sw $s4, 56($sp)
L80029814:
  sw $s3, 52($sp)
L80029818:
  sw $a0, 80($sp)
L8002981c:
  sw $a1, 84($sp)
L80029820:
  sll $v0, $s1, 0x1
L80029824:
  addu $v1, $v0, $s1
L80029828:
  addu $v0, $s2, $s1
L8002982c:
  bgez $v1, L80029838
L80029830:
  sh $v0, 4($s0)
L80029834:
  addiu $v1, $v1, 3
L80029838:
  addu $a0, $s0, $zero
L8002983c:
  addiu $t0, $s0, 8
L80029840:
  addu $a1, $t0, $zero
L80029844:
  addiu $fp, $s0, 16
L80029848:
  addu $a2, $fp, $zero
L8002984c:
  sra $v0, $v1, 0x2
L80029850:
  addu $v0, $s2, $v0
L80029854:
  sw $t0, 32($sp)
L80029858:
  lw $t0, 80($sp)
L8002985c:
  addiu $s3, $s6, 4
L80029860:
  sh $v0, 12($s0)
L80029864:
  sh $s2, 20($s0)
L80029868:
  sw $s6, 24($sp)
L8002986c:
  sw $s3, 28($sp)
L80029870:
  addiu $s7, $t0, 8
L80029874:
  addu $a3, $s7, $zero
L80029878:
  addiu $s5, $t0, 16
L8002987c:
  addiu $s4, $t0, 24
L80029880:
  sw $s5, 16($sp)
L80029884:
  jal 0x80087a50
L80029888:
  sw $s4, 20($sp)
L8002988c:
  lw $v0, 4($s6)
L80029890:
  sll $zero, $zero, 0x0
L80029894:
  bgez $v0, L800298f4
L80029898:
  addiu $a2, $zero, 1
L8002989c:
  srl $v0, $s1, 0x1f
L800298a0:
  addu $v0, $s1, $v0
L800298a4:
  sra $v0, $v0, 0x1
L800298a8:
  addu $v1, $s2, $v0
L800298ac:
  sh $v1, 4($s0)
L800298b0:
  sll $v1, $v0, 0x1
L800298b4:
  addu $v0, $v1, $v0
L800298b8:
  bgez $v0, L800298c4
L800298bc:
  addu $a0, $s0, $zero
L800298c0:
  addiu $v0, $v0, 3
L800298c4:
  addu $a2, $fp, $zero
L800298c8:
  addu $a3, $s7, $zero
L800298cc:
  sra $v0, $v0, 0x2
L800298d0:
  lw $a1, 32($sp)
L800298d4:
  addu $v0, $s2, $v0
L800298d8:
  sh $v0, 12($a0)
L800298dc:
  sw $s5, 16($sp)
L800298e0:
  sw $s4, 20($sp)
L800298e4:
  sw $s6, 24($sp)
L800298e8:
  jal 0x80087a50
L800298ec:
  sw $s3, 28($sp)
L800298f0:
  addiu $a2, $zero, 1
L800298f4:
  lw $a0, 80($sp)
L800298f8:
  lw $a1, 84($sp)
L800298fc:
  jal 0x8005b260
L80029900:
  addu $a3, $a2, $zero
L80029904:
  lw $ra, 76($sp)
L80029908:
  lw $fp, 72($sp)
L8002990c:
  lw $s7, 68($sp)
L80029910:
  lw $s6, 64($sp)
L80029914:
  lw $s5, 60($sp)
L80029918:
  lw $s4, 56($sp)
L8002991c:
  lw $s3, 52($sp)
L80029920:
  lw $s2, 48($sp)
L80029924:
  lw $s1, 44($sp)
L80029928:
  lw $s0, 40($sp)
L8002992c:
  jr $ra
L80029930:
  addiu $sp, $sp, 80
L80029934:
  addiu $sp, $sp, -64
L80029938:
  sw $s5, 44($sp)
L8002993c:
  addu $s5, $zero, $zero
L80029940:
  addiu $a0, $zero, 208
L80029944:
  addiu $a1, $zero, 96
L80029948:
  sw $ra, 60($sp)
L8002994c:
  sw $fp, 56($sp)
L80029950:
  sw $s7, 52($sp)
L80029954:
  sw $s6, 48($sp)
L80029958:
  sw $s4, 40($sp)
L8002995c:
  sw $s3, 36($sp)
L80029960:
  sw $s2, 32($sp)
L80029964:
  sw $s1, 28($sp)
L80029968:
  jal 0x800878b0
L8002996c:
  sw $s0, 24($sp)
L80029970:
  jal 0x800878d0
L80029974:
  addiu $a0, $zero, 300
L80029978:
  lui $s2, 0x1f80
L8002997c:
  ori $s2, $s2, 0x38
L80029980:
  lui $s0, 0x1f80
L80029984:
  ori $s0, $s0, 0x60
L80029988:
  lui $s4, 0x1f80
L8002998c:
  ori $s4, $s4, 0x200
L80029990:
  lui $a0, 0x8010
L80029994:
  lui $v0, 0x800f
L80029998:
  lw $s6, -25188($v0)
L8002999c:
  jal 0x800855d0
L800299a0:
  addiu $a0, $a0, -7864
L800299a4:
  lui $v1, 0x5555
L800299a8:
  ori $v1, $v1, 0x5555
L800299ac:
  lui $fp, 0x1f80
L800299b0:
  ori $fp, $fp, 0x40
L800299b4:
  lui $s7, 0x1f80
L800299b8:
  ori $s7, $s7, 0x48
L800299bc:
  lui $s1, 0x1f80
L800299c0:
  ori $s1, $s1, 0x50
L800299c4:
  lui $s3, 0x1f80
L800299c8:
  addiu $v0, $zero, 7
L800299cc:
  lui $t5, 0x8018
L800299d0:
  ori $t5, $t5, 0x1000
L800299d4:
  lwl $t2, 3($t5)
L800299d8:
  lwr $t2, 0($t5)
L800299dc:
  lwl $t3, 7($t5)
L800299e0:
  lwr $t3, 4($t5)
L800299e4:
  swl $t2, 3($s4)
L800299e8:
  swr $t2, 0($s4)
L800299ec:
  swl $t3, 7($s4)
L800299f0:
  swr $t3, 4($s4)
L800299f4:
  sb $v0, 3($s3)
L800299f8:
  addiu $v0, $zero, 88
L800299fc:
  sw $zero, 4($s3)
L80029a00:
  sb $v0, 7($s3)
L80029a04:
  sw $v1, 28($s3)
L80029a08:
  sb $zero, 23($s3)
L80029a0c:
  lui $at, 0x1f80
L80029a10:
  sh $zero, 82($at)
L80029a14:
  lui $at, 0x1f80
L80029a18:
  sh $zero, 74($at)
L80029a1c:
  lui $at, 0x1f80
L80029a20:
  sh $zero, 66($at)
L80029a24:
  sh $zero, 2($s2)
L80029a28:
  addiu $v0, $zero, 1024
L80029a2c:
  subu $v0, $v0, $s5
L80029a30:
  sll $v1, $v0, 0x8
L80029a34:
  subu $v0, $v1, $v0
L80029a38:
  bgez $v0, L80029a44
L80029a3c:
  sll $zero, $zero, 0x0
L80029a40:
  addiu $v0, $v0, 1023
L80029a44:
  sra $v0, $v0, 0xa
L80029a48:
  sb $v0, 14($s3)
L80029a4c:
  sb $v0, 13($s3)
L80029a50:
  sb $v0, 12($s3)
L80029a54:
  lw $v0, 12($s3)
L80029a58:
  addu $a0, $s5, $zero
L80029a5c:
  jal 0x80086770
L80029a60:
  sw $v0, 20($s3)
L80029a64:
  lui $t2, 0x800f
L80029a68:
  addiu $t2, $t2, -24088
L80029a6c:
  lh $v1, 16($t2)
L80029a70:
  sll $zero, $zero, 0x0
L80029a74:
  mult $v1, $v0
L80029a78:
  mflo $v0
L80029a7c:
  bgez $v0, L80029a88
L80029a80:
  sll $zero, $zero, 0x0
L80029a84:
  addiu $v0, $v0, 4095
L80029a88:
  sra $v0, $v0, 0xc
L80029a8c:
  beq $v0, $zero, L80029c9c
L80029a90:
  sw $v0, 8($s0)
L80029a94:
  jal 0x800866a0
L80029a98:
  addu $a0, $s5, $zero
L80029a9c:
  lui $t2, 0x800f
L80029aa0:
  addiu $t2, $t2, -24088
L80029aa4:
  lh $v1, 16($t2)
L80029aa8:
  sll $zero, $zero, 0x0
L80029aac:
  mult $v1, $v0
L80029ab0:
  mflo $v0
L80029ab4:
  bgez $v0, L80029ac0
L80029ab8:
  addu $a0, $s3, $zero
L80029abc:
  addiu $v0, $v0, 4095
L80029ac0:
  addu $a1, $s6, $zero
L80029ac4:
  addu $a2, $s2, $zero
L80029ac8:
  addu $a3, $s0, $zero
L80029acc:
  sra $v0, $v0, 0xc
L80029ad0:
  sw $v0, 12($s0)
L80029ad4:
  lhu $v0, 12($s0)
L80029ad8:
  lhu $v1, 4($s4)
L80029adc:
  lh $t0, 0($s4)
L80029ae0:
  lw $t1, 8($s0)
L80029ae4:
  addu $v0, $v0, $v1
L80029ae8:
  sh $v0, 4($s1)
L80029aec:
  sh $v0, 4($s7)
L80029af0:
  sh $v0, 4($fp)
L80029af4:
  sh $v0, 4($s2)
L80029af8:
  sw $t0, 16($sp)
L80029afc:
  jal L80029684
L80029b00:
  sw $t1, 20($sp)
L80029b04:
  addu $a0, $s3, $zero
L80029b08:
  addu $a1, $s6, $zero
L80029b0c:
  addu $a2, $s2, $zero
L80029b10:
  addu $a3, $s0, $zero
L80029b14:
  lw $v0, 8($s0)
L80029b18:
  lh $v1, 0($s4)
L80029b1c:
  subu $v0, $zero, $v0
L80029b20:
  sw $v1, 16($sp)
L80029b24:
  jal L80029684
L80029b28:
  sw $v0, 20($sp)
L80029b2c:
  beq $s5, $zero, L80029b98
L80029b30:
  addu $a0, $s3, $zero
L80029b34:
  addu $a1, $s6, $zero
L80029b38:
  addu $a2, $s2, $zero
L80029b3c:
  addu $a3, $s0, $zero
L80029b40:
  lhu $v0, 4($s4)
L80029b44:
  lhu $v1, 12($s0)
L80029b48:
  lh $t0, 0($s4)
L80029b4c:
  lw $t1, 8($s0)
L80029b50:
  subu $v0, $v0, $v1
L80029b54:
  sh $v0, 4($s1)
L80029b58:
  sh $v0, 4($s7)
L80029b5c:
  sh $v0, 4($fp)
L80029b60:
  sh $v0, 4($s2)
L80029b64:
  sw $t0, 16($sp)
L80029b68:
  jal L80029684
L80029b6c:
  sw $t1, 20($sp)
L80029b70:
  addu $a0, $s3, $zero
L80029b74:
  addu $a1, $s6, $zero
L80029b78:
  addu $a2, $s2, $zero
L80029b7c:
  addu $a3, $s0, $zero
L80029b80:
  lw $v0, 8($s0)
L80029b84:
  lh $v1, 0($s4)
L80029b88:
  subu $v0, $zero, $v0
L80029b8c:
  sw $v1, 16($sp)
L80029b90:
  jal L80029684
L80029b94:
  sw $v0, 20($sp)
L80029b98:
  addu $a0, $s3, $zero
L80029b9c:
  addu $a1, $s6, $zero
L80029ba0:
  addu $a2, $s2, $zero
L80029ba4:
  addu $a3, $s0, $zero
L80029ba8:
  lhu $v0, 0($s4)
L80029bac:
  lhu $v1, 12($s0)
L80029bb0:
  lhu $t0, 4($s4)
L80029bb4:
  addu $v0, $v0, $v1
L80029bb8:
  sll $t0, $t0, 0x10
L80029bbc:
  sh $v0, 24($s2)
L80029bc0:
  sh $v0, 16($s2)
L80029bc4:
  sh $v0, 8($s2)
L80029bc8:
  sh $v0, 0($s2)
L80029bcc:
  lw $v0, 8($s0)
L80029bd0:
  sra $t0, $t0, 0x10
L80029bd4:
  sw $t0, 16($sp)
L80029bd8:
  jal L800297dc
L80029bdc:
  sw $v0, 20($sp)
L80029be0:
  addu $a0, $s3, $zero
L80029be4:
  addu $a1, $s6, $zero
L80029be8:
  addu $a2, $s2, $zero
L80029bec:
  addu $a3, $s0, $zero
L80029bf0:
  lhu $v0, 4($s4)
L80029bf4:
  lw $v1, 8($s0)
L80029bf8:
  sll $v0, $v0, 0x10
L80029bfc:
  sra $v0, $v0, 0x10
L80029c00:
  subu $v1, $zero, $v1
L80029c04:
  sw $v0, 16($sp)
L80029c08:
  jal L800297dc
L80029c0c:
  sw $v1, 20($sp)
L80029c10:
  beq $s5, $zero, L80029c8c
L80029c14:
  addu $a0, $s3, $zero
L80029c18:
  addu $a1, $s6, $zero
L80029c1c:
  addu $a2, $s2, $zero
L80029c20:
  addu $a3, $s0, $zero
L80029c24:
  lhu $v0, 0($s4)
L80029c28:
  lhu $v1, 12($s0)
L80029c2c:
  lhu $t0, 4($s4)
L80029c30:
  subu $v0, $v0, $v1
L80029c34:
  sll $t0, $t0, 0x10
L80029c38:
  sh $v0, 24($s2)
L80029c3c:
  sh $v0, 16($s2)
L80029c40:
  sh $v0, 8($s2)
L80029c44:
  sh $v0, 0($s2)
L80029c48:
  lw $v0, 8($s0)
L80029c4c:
  sra $t0, $t0, 0x10
L80029c50:
  sw $t0, 16($sp)
L80029c54:
  jal L800297dc
L80029c58:
  sw $v0, 20($sp)
L80029c5c:
  addu $a0, $s3, $zero
L80029c60:
  addu $a1, $s6, $zero
L80029c64:
  addu $a2, $s2, $zero
L80029c68:
  addu $a3, $s0, $zero
L80029c6c:
  lhu $v0, 4($s4)
L80029c70:
  lw $v1, 8($s0)
L80029c74:
  sll $v0, $v0, 0x10
L80029c78:
  sra $v0, $v0, 0x10
L80029c7c:
  subu $v1, $zero, $v1
L80029c80:
  sw $v0, 16($sp)
L80029c84:
  jal L800297dc
L80029c88:
  sw $v1, 20($sp)
L80029c8c:
  addiu $s5, $s5, 128
L80029c90:
  slti $v0, $s5, 1024
L80029c94:
  bne $v0, $zero, L80029a2c
L80029c98:
  addiu $v0, $zero, 1024
L80029c9c:
  lui $v1, 0xff
L80029ca0:
  ori $v1, $v1, 0xffff
L80029ca4:
  lui $a0, 0x5555
L80029ca8:
  ori $a0, $a0, 0x5555
L80029cac:
  addu $s5, $zero, $zero
L80029cb0:
  lui $v0, 0x800f
L80029cb4:
  addiu $s7, $v0, -24088
L80029cb8:
  addiu $v0, $zero, 7
L80029cbc:
  sb $v0, 3($s3)
L80029cc0:
  addiu $v0, $zero, 88
L80029cc4:
  sw $zero, 4($s3)
L80029cc8:
  sw $v1, 12($s3)
L80029ccc:
  sw $zero, 20($s3)
L80029cd0:
  sb $v0, 7($s3)
L80029cd4:
  sw $a0, 28($s3)
L80029cd8:
  sb $zero, 23($s3)
L80029cdc:
  sh $zero, 2($s2)
L80029ce0:
  sh $zero, 10($s2)
L80029ce4:
  lh $v0, 16($s7)
L80029ce8:
  addu $a0, $s5, $zero
L80029cec:
  jal 0x80086770
L80029cf0:
  addiu $s0, $v0, 128
L80029cf4:
  mult $s0, $v0
L80029cf8:
  mflo $v1
L80029cfc:
  bgez $v1, L80029d08
L80029d00:
  addiu $s1, $s5, 128
L80029d04:
  addiu $v1, $v1, 4095
L80029d08:
  addu $a0, $s1, $zero
L80029d0c:
  lhu $v0, 0($s4)
L80029d10:
  sra $v1, $v1, 0xc
L80029d14:
  addu $v0, $v0, $v1
L80029d18:
  jal 0x80086770
L80029d1c:
  sh $v0, 0($s2)
L80029d20:
  mult $s0, $v0
L80029d24:
  mflo $v1
L80029d28:
  bgez $v1, L80029d34
L80029d2c:
  addu $a0, $s5, $zero
L80029d30:
  addiu $v1, $v1, 4095
L80029d34:
  lhu $v0, 0($s4)
L80029d38:
  sra $v1, $v1, 0xc
L80029d3c:
  addu $v0, $v0, $v1
L80029d40:
  jal 0x800866a0
L80029d44:
  sh $v0, 8($s2)
L80029d48:
  mult $s0, $v0
L80029d4c:
  mflo $v1
L80029d50:
  bgez $v1, L80029d5c
L80029d54:
  addu $a0, $s1, $zero
L80029d58:
  addiu $v1, $v1, 4095
L80029d5c:
  lhu $v0, 4($s4)
L80029d60:
  sra $v1, $v1, 0xc
L80029d64:
  addu $v0, $v0, $v1
L80029d68:
  jal 0x800866a0
L80029d6c:
  sh $v0, 4($s2)
L80029d70:
  mult $s0, $v0
L80029d74:
  mflo $v1
L80029d78:
  bgez $v1, L80029d84
L80029d7c:
  lui $v0, 0x6666
L80029d80:
  addiu $v1, $v1, 4095
L80029d84:
  ori $v0, $v0, 0x6667
L80029d88:
  mult $s0, $v0
L80029d8c:
  lhu $v0, 4($s4)
L80029d90:
  sra $v1, $v1, 0xc
L80029d94:
  addu $v0, $v0, $v1
L80029d98:
  sh $v0, 12($s2)
L80029d9c:
  sra $v0, $s0, 0x1f
L80029da0:
  mfhi $t2
L80029da4:
  sra $v1, $t2, 0x4
L80029da8:
  subu $s0, $v1, $v0
L80029dac:
  .word 0xca400000
L80029db0:
  .word 0xca410004
L80029db4:
  sll $zero, $zero, 0x0
L80029db8:
  sll $zero, $zero, 0x0
L80029dbc:
  .word 0x4a180001
L80029dc0:
  addiu $v0, $s3, 8
L80029dc4:
  .word 0xe84e0000
L80029dc8:
  addiu $v0, $s2, 8
L80029dcc:
  .word 0xc8400000
L80029dd0:
  .word 0xc8410004
L80029dd4:
  sll $zero, $zero, 0x0
L80029dd8:
  sll $zero, $zero, 0x0
L80029ddc:
  .word 0x4a180001
L80029de0:
  addiu $v0, $s3, 24
L80029de4:
  .word 0xe84e0000
L80029de8:
  addu $s1, $zero, $zero
L80029dec:
  lhu $v0, 10($s3)
L80029df0:
  lhu $v1, 8($s3)
L80029df4:
  subu $v0, $v0, $s0
L80029df8:
  sh $v1, 16($s3)
L80029dfc:
  sh $v0, 26($s3)
L80029e00:
  sh $v0, 18($s3)
L80029e04:
  addu $a0, $s3, $zero
L80029e08:
  addu $a1, $s6, $zero
L80029e0c:
  addiu $a2, $zero, 1
L80029e10:
  jal 0x8005b260
L80029e14:
  addu $a3, $a2, $zero
L80029e18:
  lhu $v0, 10($s3)
L80029e1c:
  sll $zero, $zero, 0x0
L80029e20:
  subu $v0, $v0, $s0
L80029e24:
  sh $v0, 10($s3)
L80029e28:
  sll $v0, $v0, 0x10
L80029e2c:
  blez $v0, L80029e58
L80029e30:
  sll $zero, $zero, 0x0
L80029e34:
  addiu $s1, $s1, 1
L80029e38:
  lhu $v0, 18($s3)
L80029e3c:
  lhu $v1, 26($s3)
L80029e40:
  subu $v0, $v0, $s0
L80029e44:
  subu $v1, $v1, $s0
L80029e48:
  sh $v0, 18($s3)
L80029e4c:
  slti $v0, $s1, 7
L80029e50:
  bne $v0, $zero, L80029e04
L80029e54:
  sh $v1, 26($s3)
L80029e58:
  addiu $s5, $s5, 128
L80029e5c:
  slti $v0, $s5, 4096
L80029e60:
  bne $v0, $zero, L80029ce4
L80029e64:
  sll $zero, $zero, 0x0
L80029e68:
  jal 0x800540b4
L80029e6c:
  addu $a0, $zero, $zero
L80029e70:
  jal 0x800559d4
L80029e74:
  addu $a0, $zero, $zero
L80029e78:
  jal 0x800556e8
L80029e7c:
  addu $a0, $zero, $zero
L80029e80:
  lw $ra, 60($sp)
L80029e84:
  lw $fp, 56($sp)
L80029e88:
  lw $s7, 52($sp)
L80029e8c:
  lw $s6, 48($sp)
L80029e90:
  lw $s5, 44($sp)
L80029e94:
  lw $s4, 40($sp)
L80029e98:
  lw $s3, 36($sp)
L80029e9c:
  lw $s2, 32($sp)
L80029ea0:
  lw $s1, 28($sp)
L80029ea4:
  lw $s0, 24($sp)
L80029ea8:
  jr $ra
L80029eac:
  addiu $sp, $sp, 64
L80029eb0:
  sll $a1, $a1, 0x2
L80029eb4:
  addu $a0, $a0, $a1
L80029eb8:
  lbu $v0, 86($a0)
L80029ebc:
  jr $ra
L80029ec0:
  sll $zero, $zero, 0x0
L80029ec4:
  lui $v1, 0xb817
L80029ec8:
  lui $v0, 0x800a
L80029ecc:
  lh $v0, -20152($v0)
L80029ed0:
  ori $v1, $v1, 0x2e1
L80029ed4:
  addiu $v0, $v0, -8
L80029ed8:
  mult $v0, $v1
L80029edc:
  addiu $sp, $sp, -80
L80029ee0:
  sw $s0, 40($sp)
L80029ee4:
  lui $s0, 0x1f80
L80029ee8:
  sw $fp, 72($sp)
L80029eec:
  mfhi $t1
L80029ef0:
  addu $v1, $t1, $v0
L80029ef4:
  sra $v1, $v1, 0x7
L80029ef8:
  sra $v0, $v0, 0x1f
L80029efc:
  subu $fp, $v1, $v0
L80029f00:
  lui $v0, 0x800f
L80029f04:
  lw $v0, -25188($v0)
L80029f08:
  ori $s0, $s0, 0x320
L80029f0c:
  sw $ra, 76($sp)
L80029f10:
  sw $s7, 68($sp)
L80029f14:
  sw $s6, 64($sp)
L80029f18:
  sw $s5, 60($sp)
L80029f1c:
  sw $s4, 56($sp)
L80029f20:
  sw $s3, 52($sp)
L80029f24:
  sw $s2, 48($sp)
L80029f28:
  sw $s1, 44($sp)
L80029f2c:
  bltz $fp, L8002a2c4
L80029f30:
  sw $v0, 16($sp)
L80029f34:
  lui $a1, 0xe
L80029f38:
  ori $a1, $a1, 0xc
L80029f3c:
  lui $a0, 0xf7
L80029f40:
  lui $t1, 0x80
L80029f44:
  ori $t1, $t1, 0x8080
L80029f48:
  sw $t1, 20($sp)
L80029f4c:
  lui $t1, 0x40
L80029f50:
  ori $t1, $t1, 0x4040
L80029f54:
  sll $v1, $fp, 0x1
L80029f58:
  addu $v1, $v1, $fp
L80029f5c:
  sll $v0, $v1, 0x2
L80029f60:
  subu $v0, $v0, $fp
L80029f64:
  sll $v0, $v0, 0x3
L80029f68:
  addu $v0, $v0, $fp
L80029f6c:
  sll $v0, $v0, 0x1
L80029f70:
  addiu $v0, $v0, 8
L80029f74:
  sll $v1, $v1, 0x3
L80029f78:
  addu $v1, $v1, $fp
L80029f7c:
  sw $v0, 28($sp)
L80029f80:
  addiu $v0, $zero, 8
L80029f84:
  sw $t1, 24($sp)
L80029f88:
  sw $v1, 32($sp)
L80029f8c:
  sh $v0, 4($s0)
L80029f90:
  lw $t1, 32($sp)
L80029f94:
  ori $a0, $a0, 0x130
L80029f98:
  sw $a1, 8($s0)
L80029f9c:
  sw $a0, 16($s0)
L80029fa0:
  sll $v1, $t1, 0x3
L80029fa4:
  sll $v0, $t1, 0x4
L80029fa8:
  addu $v0, $v0, $v1
L80029fac:
  sll $v0, $v0, 0x2
L80029fb0:
  subu $v0, $v0, $v1
L80029fb4:
  sll $v0, $v0, 0x3
L80029fb8:
  addu $v0, $v0, $v1
L80029fbc:
  sll $v0, $v0, 0x1
L80029fc0:
  addiu $v0, $v0, 8
L80029fc4:
  lui $v1, 0x800
L80029fc8:
  sh $v0, 6($s0)
L80029fcc:
  addiu $v0, $zero, 247
L80029fd0:
  sh $v0, 18($s0)
L80029fd4:
  ori $v0, $zero, 0xf060
L80029fd8:
  sh $v0, 14($s0)
L80029fdc:
  addiu $v0, $zero, 27
L80029fe0:
  sw $v1, 0($s0)
L80029fe4:
  sh $v0, 12($s0)
L80029fe8:
  lw $t1, 32($sp)
L80029fec:
  lui $v0, 0x800a
L80029ff0:
  lhu $v0, -20152($v0)
L80029ff4:
  sll $s6, $t1, 0x3
L80029ff8:
  lhu $t1, 28($sp)
L80029ffc:
  sll $zero, $zero, 0x0
L8002a000:
  sh $t1, 6($s0)
L8002a004:
  lw $t1, 28($sp)
L8002a008:
  addu $s7, $zero, $zero
L8002a00c:
  subu $v0, $t1, $v0
L8002a010:
  sh $v0, 6($s0)
L8002a014:
  lhu $v1, 6($s0)
L8002a018:
  lhu $v0, 8($s0)
L8002a01c:
  sll $v1, $v1, 0x10
L8002a020:
  sra $v1, $v1, 0x10
L8002a024:
  addu $v0, $v1, $v0
L8002a028:
  blez $v0, L8002a138
L8002a02c:
  addiu $s3, $s6, 1
L8002a030:
  slti $v0, $v1, 240
L8002a034:
  beq $v0, $zero, L8002a178
L8002a038:
  lui $t1, 0x800f
L8002a03c:
  addiu $s2, $s6, 101
L8002a040:
  addu $s1, $zero, $zero
L8002a044:
  sll $v0, $s2, 0x2
L8002a048:
  addiu $t1, $t1, -24088
L8002a04c:
  addu $s5, $v0, $t1
L8002a050:
  sll $v0, $s3, 0x2
L8002a054:
  lui $t1, 0x800f
L8002a058:
  addiu $t1, $t1, -24088
L8002a05c:
  addu $s4, $v0, $t1
L8002a060:
  lui $a0, 0x800f
L8002a064:
  addiu $a0, $a0, -24088
L8002a068:
  jal L80029eb0
L8002a06c:
  addu $a1, $s3, $zero
L8002a070:
  addu $v1, $v0, $zero
L8002a074:
  andi $v0, $v1, 0x80
L8002a078:
  beq $v0, $zero, L8002a0b8
L8002a07c:
  andi $v0, $v1, 0x1
L8002a080:
  lw $t1, 20($sp)
L8002a084:
  beq $v0, $zero, L8002a098
L8002a088:
  sw $t1, 20($s0)
L8002a08c:
  lw $t1, 24($sp)
L8002a090:
  sll $zero, $zero, 0x0
L8002a094:
  sw $t1, 20($s0)
L8002a098:
  addu $a0, $s0, $zero
L8002a09c:
  lw $a1, 16($sp)
L8002a0a0:
  addiu $v0, $s1, 8
L8002a0a4:
  sh $v0, 4($s0)
L8002a0a8:
  lhu $v0, 84($s4)
L8002a0ac:
  addiu $a2, $zero, 2
L8002a0b0:
  jal 0x800849f0
L8002a0b4:
  sh $v0, 16($s0)
L8002a0b8:
  slti $v0, $s2, 723
L8002a0bc:
  beq $v0, $zero, L8002a11c
L8002a0c0:
  sll $zero, $zero, 0x0
L8002a0c4:
  lui $a0, 0x800f
L8002a0c8:
  addiu $a0, $a0, -24088
L8002a0cc:
  jal L80029eb0
L8002a0d0:
  addu $a1, $s2, $zero
L8002a0d4:
  addu $v1, $v0, $zero
L8002a0d8:
  andi $v0, $v1, 0x80
L8002a0dc:
  beq $v0, $zero, L8002a11c
L8002a0e0:
  andi $v0, $v1, 0x1
L8002a0e4:
  lw $t1, 20($sp)
L8002a0e8:
  beq $v0, $zero, L8002a0fc
L8002a0ec:
  sw $t1, 20($s0)
L8002a0f0:
  lw $t1, 24($sp)
L8002a0f4:
  sll $zero, $zero, 0x0
L8002a0f8:
  sw $t1, 20($s0)
L8002a0fc:
  addu $a0, $s0, $zero
L8002a100:
  lw $a1, 16($sp)
L8002a104:
  addiu $v0, $s1, 168
L8002a108:
  sh $v0, 4($s0)
L8002a10c:
  lhu $v0, 84($s5)
L8002a110:
  addiu $a2, $zero, 2
L8002a114:
  jal 0x800849f0
L8002a118:
  sh $v0, 16($s0)
L8002a11c:
  addiu $s4, $s4, 4
L8002a120:
  addiu $s3, $s3, 1
L8002a124:
  addiu $s5, $s5, 4
L8002a128:
  addiu $s1, $s1, 14
L8002a12c:
  slti $v0, $s1, 138
L8002a130:
  bne $v0, $zero, L8002a060
L8002a134:
  addiu $s2, $s2, 1
L8002a138:
  lhu $v0, 6($s0)
L8002a13c:
  addiu $s7, $s7, 1
L8002a140:
  addiu $v0, $v0, 16
L8002a144:
  sh $v0, 6($s0)
L8002a148:
  slti $v0, $s7, 10
L8002a14c:
  bne $v0, $zero, L8002a014
L8002a150:
  addiu $s6, $s6, 10
L8002a154:
  lw $t1, 28($sp)
L8002a158:
  addiu $fp, $fp, 1
L8002a15c:
  addiu $t1, $t1, 178
L8002a160:
  sw $t1, 28($sp)
L8002a164:
  lw $t1, 32($sp)
L8002a168:
  slti $v0, $fp, 4
L8002a16c:
  addiu $t1, $t1, 25
L8002a170:
  bne $v0, $zero, L80029fe8
L8002a174:
  sw $t1, 32($sp)
L8002a178:
  lui $s0, 0x1f80
L8002a17c:
  lui $v0, 0x800a
L8002a180:
  lw $v0, -20324($v0)
L8002a184:
  lui $v1, 0x5000
L8002a188:
  sw $v1, 0($s0)
L8002a18c:
  sb $zero, 14($s0)
L8002a190:
  sb $zero, 13($s0)
L8002a194:
  sb $zero, 12($s0)
L8002a198:
  sb $zero, 17($s0)
L8002a19c:
  sb $zero, 16($s0)
L8002a1a0:
  sb $zero, 15($s0)
L8002a1a4:
  andi $a0, $v0, 0x7f
L8002a1a8:
  addu $v1, $a0, $zero
L8002a1ac:
  lui $v0, 0x800f
L8002a1b0:
  bgez $a0, L8002a1bc
L8002a1b4:
  addiu $t0, $v0, -24088
L8002a1b8:
  addiu $v1, $a0, 31
L8002a1bc:
  sra $v1, $v1, 0x5
L8002a1c0:
  addiu $v0, $zero, 1
L8002a1c4:
  beq $v1, $v0, L8002a20c
L8002a1c8:
  addiu $v0, $zero, 255
L8002a1cc:
  slti $v0, $v1, 2
L8002a1d0:
  beq $v0, $zero, L8002a1e8
L8002a1d4:
  addiu $v0, $zero, 2
L8002a1d8:
  beq $v1, $zero, L8002a204
L8002a1dc:
  sll $v0, $a0, 0x3
L8002a1e0:
  j L8002a23c
L8002a1e4:
  addu $a0, $s0, $zero
L8002a1e8:
  beq $v1, $v0, L8002a218
L8002a1ec:
  addiu $v0, $zero, 95
L8002a1f0:
  addiu $v0, $zero, 3
L8002a1f4:
  beq $v1, $v0, L8002a22c
L8002a1f8:
  addiu $v0, $zero, 127
L8002a1fc:
  j L8002a23c
L8002a200:
  addu $a0, $s0, $zero
L8002a204:
  j L8002a238
L8002a208:
  sb $v0, 13($s0)
L8002a20c:
  sb $v0, 13($s0)
L8002a210:
  j L8002a230
L8002a214:
  addiu $v0, $a0, -32
L8002a218:
  subu $v0, $v0, $a0
L8002a21c:
  sll $v0, $v0, 0x3
L8002a220:
  sb $v0, 13($s0)
L8002a224:
  j L8002a234
L8002a228:
  addiu $v0, $zero, 255
L8002a22c:
  subu $v0, $v0, $a0
L8002a230:
  sll $v0, $v0, 0x3
L8002a234:
  sb $v0, 16($s0)
L8002a238:
  addu $a0, $s0, $zero
L8002a23c:
  lw $a1, 16($sp)
L8002a240:
  addiu $a2, $zero, 1
L8002a244:
  sh $zero, 8($s0)
L8002a248:
  lhu $v1, 8($t0)
L8002a24c:
  lui $a3, 0x800a
L8002a250:
  lhu $a3, -20154($a3)
L8002a254:
  lhu $v0, 10($t0)
L8002a258:
  lui $t0, 0x800a
L8002a25c:
  lhu $t0, -20152($t0)
L8002a260:
  subu $v1, $v1, $a3
L8002a264:
  subu $v0, $v0, $t0
L8002a268:
  sh $v1, 4($s0)
L8002a26c:
  sh $v0, 10($s0)
L8002a270:
  jal 0x80084130
L8002a274:
  sh $v0, 6($s0)
L8002a278:
  addu $a0, $s0, $zero
L8002a27c:
  addiu $a2, $zero, 1
L8002a280:
  lw $a1, 16($sp)
L8002a284:
  addiu $v0, $zero, 320
L8002a288:
  jal 0x80084130
L8002a28c:
  sh $v0, 8($s0)
L8002a290:
  addu $a0, $s0, $zero
L8002a294:
  lw $a1, 16($sp)
L8002a298:
  lhu $v0, 4($s0)
L8002a29c:
  addiu $a2, $zero, 1
L8002a2a0:
  sh $zero, 10($s0)
L8002a2a4:
  jal 0x80084130
L8002a2a8:
  sh $v0, 8($s0)
L8002a2ac:
  addu $a0, $s0, $zero
L8002a2b0:
  addiu $a2, $zero, 1
L8002a2b4:
  lw $a1, 16($sp)
L8002a2b8:
  addiu $v0, $zero, 240
L8002a2bc:
  jal 0x80084130
L8002a2c0:
  sh $v0, 10($a0)
L8002a2c4:
  lw $ra, 76($sp)
L8002a2c8:
  lw $fp, 72($sp)
L8002a2cc:
  lw $s7, 68($sp)
L8002a2d0:
  lw $s6, 64($sp)
L8002a2d4:
  lw $s5, 60($sp)
L8002a2d8:
  lw $s4, 56($sp)
L8002a2dc:
  lw $s3, 52($sp)
L8002a2e0:
  lw $s2, 48($sp)
L8002a2e4:
  lw $s1, 44($sp)
L8002a2e8:
  lw $s0, 40($sp)
L8002a2ec:
  jr $ra
L8002a2f0:
  addiu $sp, $sp, 80
L8002a2f4:
  addiu $sp, $sp, -40
L8002a2f8:
  sw $s2, 32($sp)
L8002a2fc:
  addu $s2, $a0, $zero
L8002a300:
  sw $s1, 28($sp)
L8002a304:
  addu $s1, $zero, $zero
L8002a308:
  sw $ra, 36($sp)
L8002a30c:
  jal L8002a6b8
L8002a310:
  sw $s0, 24($sp)
L8002a314:
  lui $v1, 0x801d
L8002a318:
  lui $at, 0x800a
L8002a31c:
  sh $v0, -19656($at)
L8002a320:
  sll $v0, $v0, 0x10
L8002a324:
  sra $v0, $v0, 0x10
L8002a328:
  addu $s0, $v0, $zero
L8002a32c:
  beq $s0, $zero, L8002a354
L8002a330:
  sw $v0, 22024($v1)
L8002a334:
  addu $a0, $s2, $zero
L8002a338:
  jal L80029eb0
L8002a33c:
  addu $a1, $s0, $zero
L8002a340:
  andi $v0, $v0, 0x80
L8002a344:
  bne $v0, $zero, L8002a354
L8002a348:
  addiu $s1, $zero, 5
L8002a34c:
  lui $at, 0x800a
L8002a350:
  sh $zero, -19656($at)
L8002a354:
  addiu $a0, $zero, 1
L8002a358:
  addu $a1, $s1, $zero
L8002a35c:
  addiu $v0, $zero, 288
L8002a360:
  sw $v0, 16($sp)
L8002a364:
  addiu $v0, $zero, 48
L8002a368:
  addiu $a2, $zero, 16
L8002a36c:
  addiu $a3, $zero, 202
L8002a370:
  jal L80035be4
L8002a374:
  sw $v0, 20($sp)
L8002a378:
  lbu $v0, 84($v0)
L8002a37c:
  lui $at, 0x800a
L8002a380:
  sb $v0, -19680($at)
L8002a384:
  sll $v0, $s0, 0x2
L8002a388:
  addu $v0, $s2, $v0
L8002a38c:
  lbu $v0, 86($v0)
L8002a390:
  sll $zero, $zero, 0x0
L8002a394:
  andi $v0, $v0, 0x1
L8002a398:
  beq $v0, $zero, L8002a3a8
L8002a39c:
  addiu $v0, $zero, 4
L8002a3a0:
  lui $at, 0x800a
L8002a3a4:
  sb $v0, -19680($at)
L8002a3a8:
  lui $a0, 0x800f
L8002a3ac:
  jal L80039a60
L8002a3b0:
  addiu $a0, $a0, -20132
L8002a3b4:
  lw $ra, 36($sp)
L8002a3b8:
  lw $s2, 32($sp)
L8002a3bc:
  lw $s1, 28($sp)
L8002a3c0:
  lw $s0, 24($sp)
L8002a3c4:
  jr $ra
L8002a3c8:
  addiu $sp, $sp, 40
L8002a3cc:
  addiu $sp, $sp, -24
L8002a3d0:
  lui $v0, 0x800f
L8002a3d4:
  sw $s0, 16($sp)
L8002a3d8:
  addiu $s0, $v0, -24088
L8002a3dc:
  sw $ra, 20($sp)
L8002a3e0:
  lbu $v0, 23($s0)
L8002a3e4:
  sll $zero, $zero, 0x0
L8002a3e8:
  beq $v0, $zero, L8002a498
L8002a3ec:
  sll $zero, $zero, 0x0
L8002a3f0:
  lh $v0, 8($s0)
L8002a3f4:
  lhu $v1, 12($s0)
L8002a3f8:
  lw $a0, 24($s0)
L8002a3fc:
  sll $v0, $v0, 0x10
L8002a400:
  or $a2, $v0, $v1
L8002a404:
  addu $a2, $a2, $a0
L8002a408:
  lh $v0, 10($s0)
L8002a40c:
  lhu $v1, 14($s0)
L8002a410:
  lw $a0, 28($s0)
L8002a414:
  sra $a1, $a2, 0x10
L8002a418:
  sh $a2, 12($s0)
L8002a41c:
  sh $a1, 8($s0)
L8002a420:
  sll $v0, $v0, 0x10
L8002a424:
  or $a2, $v0, $v1
L8002a428:
  addu $a2, $a2, $a0
L8002a42c:
  lbu $v0, 22($s0)
L8002a430:
  sra $v1, $a2, 0x10
L8002a434:
  sh $v1, 10($s0)
L8002a438:
  sh $a2, 14($s0)
L8002a43c:
  addiu $v0, $v0, -1
L8002a440:
  sb $v0, 22($s0)
L8002a444:
  andi $v0, $v0, 0xff
L8002a448:
  bne $v0, $zero, L8002a474
L8002a44c:
  sll $zero, $zero, 0x0
L8002a450:
  lhu $v0, 18($s0)
L8002a454:
  lhu $v1, 20($s0)
L8002a458:
  addiu $a0, $zero, 53
L8002a45c:
  sb $zero, 23($s0)
L8002a460:
  sh $v0, 8($s0)
L8002a464:
  jal L8003fee0
L8002a468:
  sh $v1, 10($s0)
L8002a46c:
  jal L8002a2f4
L8002a470:
  addu $a0, $s0, $zero
L8002a474:
  lw $v1, 68($s0)
L8002a478:
  lhu $v0, 8($s0)
L8002a47c:
  sll $zero, $zero, 0x0
L8002a480:
  sh $v0, 48($v1)
L8002a484:
  lw $v1, 68($s0)
L8002a488:
  lhu $v0, 10($s0)
L8002a48c:
  sll $zero, $zero, 0x0
L8002a490:
  sh $v0, 50($v1)
L8002a494:
  lbu $v0, 23($s0)
L8002a498:
  lw $ra, 20($sp)
L8002a49c:
  lw $s0, 16($sp)
L8002a4a0:
  jr $ra
L8002a4a4:
  addiu $sp, $sp, 24
L8002a4a8:
  addu $t1, $a1, $zero
L8002a4ac:
  lui $v0, 0x800f
L8002a4b0:
  lb $v1, 848($gp)
L8002a4b4:
  sll $zero, $zero, 0x0
L8002a4b8:
  bne $a0, $v1, L8002a4d0
L8002a4bc:
  addiu $t0, $v0, -24088
L8002a4c0:
  lb $v0, 849($gp)
L8002a4c4:
  sll $zero, $zero, 0x0
L8002a4c8:
  beq $t1, $v0, L8002a658
L8002a4cc:
  sll $zero, $zero, 0x0
L8002a4d0:
  slti $v0, $a0, 10
L8002a4d4:
  sb $a0, 848($gp)
L8002a4d8:
  sb $t1, 849($gp)
L8002a4dc:
  bne $v0, $zero, L8002a524
L8002a4e0:
  sb $a2, 22($t0)
L8002a4e4:
  lui $v0, 0x6666
L8002a4e8:
  ori $v0, $v0, 0x6667
L8002a4ec:
  mult $a0, $v0
L8002a4f0:
  sra $v0, $a0, 0x1f
L8002a4f4:
  mfhi $t2
L8002a4f8:
  sra $v1, $t2, 0x2
L8002a4fc:
  subu $v1, $v1, $v0
L8002a500:
  sll $v0, $v1, 0x2
L8002a504:
  addu $v0, $v0, $v1
L8002a508:
  sll $v0, $v0, 0x1
L8002a50c:
  subu $v0, $a0, $v0
L8002a510:
  sll $v1, $v0, 0x3
L8002a514:
  subu $v1, $v1, $v0
L8002a518:
  sll $v1, $v1, 0x1
L8002a51c:
  j L8002a560
L8002a520:
  addiu $a3, $v1, 174
L8002a524:
  lui $v0, 0x6666
L8002a528:
  ori $v0, $v0, 0x6667
L8002a52c:
  mult $a0, $v0
L8002a530:
  sra $v0, $a0, 0x1f
L8002a534:
  mfhi $t2
L8002a538:
  sra $v1, $t2, 0x2
L8002a53c:
  subu $v1, $v1, $v0
L8002a540:
  sll $v0, $v1, 0x2
L8002a544:
  addu $v0, $v0, $v1
L8002a548:
  sll $v0, $v0, 0x1
L8002a54c:
  subu $v0, $a0, $v0
L8002a550:
  sll $v1, $v0, 0x3
L8002a554:
  subu $v1, $v1, $v0
L8002a558:
  sll $v1, $v1, 0x1
L8002a55c:
  addiu $a3, $v1, 14
L8002a560:
  sll $v0, $a3, 0x10
L8002a564:
  lh $v1, 8($t0)
L8002a568:
  sra $v0, $v0, 0x10
L8002a56c:
  subu $v0, $v0, $v1
L8002a570:
  sll $v0, $v0, 0x10
L8002a574:
  .word 0x0046001a
L8002a578:
  bne $a2, $zero, L8002a584
L8002a57c:
  sll $zero, $zero, 0x0
L8002a580:
  .word 0x0007000d
L8002a584:
  addiu $at, $zero, -1
L8002a588:
  bne $a2, $at, L8002a59c
L8002a58c:
  lui $at, 0x8000
L8002a590:
  bne $v0, $at, L8002a59c
L8002a594:
  sll $zero, $zero, 0x0
L8002a598:
  .word 0x0006000d
L8002a59c:
  mflo $a1
L8002a5a0:
  lui $v0, 0x6666
L8002a5a4:
  ori $v0, $v0, 0x6667
L8002a5a8:
  mult $t1, $v0
L8002a5ac:
  mfhi $v0
L8002a5b0:
  sra $a0, $v0, 0x2
L8002a5b4:
  sra $v0, $t1, 0x1f
L8002a5b8:
  subu $a0, $a0, $v0
L8002a5bc:
  sll $v1, $a0, 0x1
L8002a5c0:
  addu $v1, $v1, $a0
L8002a5c4:
  sll $v1, $v1, 0x2
L8002a5c8:
  subu $v1, $v1, $a0
L8002a5cc:
  sll $v1, $v1, 0x3
L8002a5d0:
  addu $v1, $v1, $a0
L8002a5d4:
  sll $v1, $v1, 0x1
L8002a5d8:
  sll $v0, $a0, 0x2
L8002a5dc:
  addu $v0, $v0, $a0
L8002a5e0:
  sll $v0, $v0, 0x1
L8002a5e4:
  subu $v0, $t1, $v0
L8002a5e8:
  sll $v0, $v0, 0x4
L8002a5ec:
  addu $v1, $v1, $v0
L8002a5f0:
  addiu $v1, $v1, 14
L8002a5f4:
  sll $v0, $v1, 0x10
L8002a5f8:
  lh $a0, 10($t0)
L8002a5fc:
  sra $v0, $v0, 0x10
L8002a600:
  subu $v0, $v0, $a0
L8002a604:
  sll $v0, $v0, 0x10
L8002a608:
  .word 0x0046001a
L8002a60c:
  bne $a2, $zero, L8002a618
L8002a610:
  sll $zero, $zero, 0x0
L8002a614:
  .word 0x0007000d
L8002a618:
  addiu $at, $zero, -1
L8002a61c:
  bne $a2, $at, L8002a630
L8002a620:
  lui $at, 0x8000
L8002a624:
  bne $v0, $at, L8002a630
L8002a628:
  sll $zero, $zero, 0x0
L8002a62c:
  .word 0x0006000d
L8002a630:
  mflo $a0
L8002a634:
  sh $a3, 18($t0)
L8002a638:
  sh $v1, 20($t0)
L8002a63c:
  ori $v0, $zero, 0x8000
L8002a640:
  sh $v0, 14($t0)
L8002a644:
  sh $v0, 12($t0)
L8002a648:
  addiu $v0, $zero, 1
L8002a64c:
  sb $v0, 23($t0)
L8002a650:
  sw $a1, 24($t0)
L8002a654:
  sw $a0, 28($t0)
L8002a658:
  jr $ra
L8002a65c:
  sll $zero, $zero, 0x0
L8002a660:
  lh $v0, 10($a0)
L8002a664:
  lui $v1, 0x800a
L8002a668:
  lh $v1, -20152($v1)
L8002a66c:
  lui $at, 0x800a
L8002a670:
  sh $zero, -20154($at)
L8002a674:
  subu $a1, $v0, $v1
L8002a678:
  slti $v0, $a1, 64
L8002a67c:
  lhu $v1, 10($a0)
L8002a680:
  beq $v0, $zero, L8002a690
L8002a684:
  addiu $v0, $v1, -64
L8002a688:
  lui $at, 0x800a
L8002a68c:
  sh $v0, -20152($at)
L8002a690:
  slti $v0, $a1, 176
L8002a694:
  bne $v0, $zero, L8002a6b0
L8002a698:
  sll $zero, $zero, 0x0
L8002a69c:
  lhu $v0, 10($a0)
L8002a6a0:
  sll $zero, $zero, 0x0
L8002a6a4:
  addiu $v0, $v0, -176
L8002a6a8:
  lui $at, 0x800a
L8002a6ac:
  sh $v0, -20152($at)
L8002a6b0:
  jr $ra
L8002a6b4:
  sll $zero, $zero, 0x0
L8002a6b8:
  lui $t0, 0x6666
L8002a6bc:
  lbu $v0, 849($gp)
L8002a6c0:
  ori $t0, $t0, 0x6667
L8002a6c4:
  sll $v0, $v0, 0x18
L8002a6c8:
  sra $a0, $v0, 0x18
L8002a6cc:
  mult $a0, $t0
L8002a6d0:
  sra $v0, $v0, 0x1f
L8002a6d4:
  mfhi $t1
L8002a6d8:
  sra $a1, $t1, 0x2
L8002a6dc:
  subu $a1, $a1, $v0
L8002a6e0:
  sll $v1, $a1, 0x18
L8002a6e4:
  sra $v1, $v1, 0x18
L8002a6e8:
  sll $v0, $v1, 0x1
L8002a6ec:
  addu $v0, $v0, $v1
L8002a6f0:
  sll $v0, $v0, 0x3
L8002a6f4:
  addu $v0, $v0, $v1
L8002a6f8:
  sll $a2, $v0, 0x3
L8002a6fc:
  sll $v0, $a1, 0x2
L8002a700:
  addu $v0, $v0, $a1
L8002a704:
  sll $v0, $v0, 0x1
L8002a708:
  subu $a0, $a0, $v0
L8002a70c:
  sll $a0, $a0, 0x18
L8002a710:
  sra $a0, $a0, 0x18
L8002a714:
  sll $v0, $a0, 0x2
L8002a718:
  addu $v0, $v0, $a0
L8002a71c:
  sll $v0, $v0, 0x1
L8002a720:
  lbu $v1, 848($gp)
L8002a724:
  addu $a2, $a2, $v0
L8002a728:
  sll $v1, $v1, 0x18
L8002a72c:
  sra $a3, $v1, 0x18
L8002a730:
  slti $v0, $a3, 10
L8002a734:
  bne $v0, $zero, L8002a740
L8002a738:
  mult $a3, $t0
L8002a73c:
  addiu $a2, $a2, 100
L8002a740:
  addiu $a1, $a2, 1
L8002a744:
  sra $v1, $v1, 0x1f
L8002a748:
  mfhi $t1
L8002a74c:
  sra $a0, $t1, 0x2
L8002a750:
  subu $a0, $a0, $v1
L8002a754:
  sll $v1, $a0, 0x2
L8002a758:
  addu $v1, $v1, $a0
L8002a75c:
  sll $v1, $v1, 0x1
L8002a760:
  subu $v1, $a3, $v1
L8002a764:
  sll $v1, $v1, 0x18
L8002a768:
  sra $v1, $v1, 0x18
L8002a76c:
  addu $a2, $a1, $v1
L8002a770:
  slti $v1, $a2, 723
L8002a774:
  beq $v1, $zero, L8002a780
L8002a778:
  addu $v0, $zero, $zero
L8002a77c:
  addu $v0, $a2, $zero
L8002a780:
  jr $ra
L8002a784:
  sll $zero, $zero, 0x0
L8002a788:
  addiu $sp, $sp, -32
L8002a78c:
  sw $s1, 20($sp)
L8002a790:
  addu $s1, $a0, $zero
L8002a794:
  sw $ra, 24($sp)
L8002a798:
  jal L8002a3cc
L8002a79c:
  sw $s0, 16($sp)
L8002a7a0:
  bne $v0, $zero, L8002a9a4
L8002a7a4:
  sll $zero, $zero, 0x0
L8002a7a8:
  lui $v0, 0x800a
L8002a7ac:
  lhu $v0, -19560($v0)
L8002a7b0:
  sll $zero, $zero, 0x0
L8002a7b4:
  andi $v0, $v0, 0x40
L8002a7b8:
  beq $v0, $zero, L8002a7f0
L8002a7bc:
  sll $zero, $zero, 0x0
L8002a7c0:
  jal L8002a6b8
L8002a7c4:
  addu $a0, $s1, $zero
L8002a7c8:
  addu $a0, $s1, $zero
L8002a7cc:
  addu $s0, $v0, $zero
L8002a7d0:
  jal L80029eb0
L8002a7d4:
  addu $a1, $s0, $zero
L8002a7d8:
  andi $v0, $v0, 0x80
L8002a7dc:
  beq $v0, $zero, L8002a7f0
L8002a7e0:
  addiu $v0, $zero, 2
L8002a7e4:
  sh $s0, 6($s1)
L8002a7e8:
  j L8002a9ac
L8002a7ec:
  sb $v0, 0($s1)
L8002a7f0:
  lui $v0, 0x800a
L8002a7f4:
  lhu $v0, -19560($v0)
L8002a7f8:
  sll $zero, $zero, 0x0
L8002a7fc:
  andi $v0, $v0, 0x20
L8002a800:
  beq $v0, $zero, L8002a820
L8002a804:
  sll $zero, $zero, 0x0
L8002a808:
  lui $v0, 0x800a
L8002a80c:
  lbu $v0, -19863($v0)
L8002a810:
  lui $at, 0x800a
L8002a814:
  sb $v0, -19860($at)
L8002a818:
  j L8002a9ac
L8002a81c:
  sll $zero, $zero, 0x0
L8002a820:
  lui $v0, 0x800a
L8002a824:
  lhu $v0, -19548($v0)
L8002a828:
  sll $zero, $zero, 0x0
L8002a82c:
  andi $v0, $v0, 0xf00c
L8002a830:
  beq $v0, $zero, L8002a9a4
L8002a834:
  sll $zero, $zero, 0x0
L8002a838:
  lb $a0, 848($gp)
L8002a83c:
  lui $v0, 0x800a
L8002a840:
  lhu $v0, -19548($v0)
L8002a844:
  lb $a1, 849($gp)
L8002a848:
  andi $v0, $v0, 0x80
L8002a84c:
  beq $v0, $zero, L8002a858
L8002a850:
  addiu $a2, $zero, 6
L8002a854:
  addiu $a2, $zero, 2
L8002a858:
  lui $v0, 0x800a
L8002a85c:
  lhu $v0, -19548($v0)
L8002a860:
  sll $zero, $zero, 0x0
L8002a864:
  andi $v0, $v0, 0xc
L8002a868:
  beq $v0, $zero, L8002a8d0
L8002a86c:
  sll $zero, $zero, 0x0
L8002a870:
  lui $v0, 0x800a
L8002a874:
  lhu $v0, -19548($v0)
L8002a878:
  sll $zero, $zero, 0x0
L8002a87c:
  andi $v0, $v0, 0x8
L8002a880:
  beq $v0, $zero, L8002a8a0
L8002a884:
  sll $zero, $zero, 0x0
L8002a888:
  addiu $a1, $a1, 10
L8002a88c:
  slti $v0, $a1, 40
L8002a890:
  bne $v0, $zero, L8002a8b0
L8002a894:
  sll $zero, $zero, 0x0
L8002a898:
  j L8002a8b0
L8002a89c:
  addiu $a1, $zero, 39
L8002a8a0:
  addiu $a1, $a1, -10
L8002a8a4:
  bgez $a1, L8002a8b0
L8002a8a8:
  sll $zero, $zero, 0x0
L8002a8ac:
  addu $a1, $zero, $zero
L8002a8b0:
  lb $v1, 849($gp)
L8002a8b4:
  sll $zero, $zero, 0x0
L8002a8b8:
  subu $v0, $a1, $v1
L8002a8bc:
  bgez $v0, L8002a99c
L8002a8c0:
  sll $a2, $v0, 0x1
L8002a8c4:
  subu $v0, $v1, $a1
L8002a8c8:
  j L8002a99c
L8002a8cc:
  sll $a2, $v0, 0x1
L8002a8d0:
  lui $v0, 0x800a
L8002a8d4:
  lhu $v0, -19548($v0)
L8002a8d8:
  sll $zero, $zero, 0x0
L8002a8dc:
  andi $v0, $v0, 0xa000
L8002a8e0:
  beq $v0, $zero, L8002a944
L8002a8e4:
  sll $zero, $zero, 0x0
L8002a8e8:
  lui $v0, 0x800a
L8002a8ec:
  lhu $v0, -19548($v0)
L8002a8f0:
  sll $zero, $zero, 0x0
L8002a8f4:
  andi $v0, $v0, 0x2000
L8002a8f8:
  beq $v0, $zero, L8002a924
L8002a8fc:
  sll $zero, $zero, 0x0
L8002a900:
  addiu $a0, $a0, 1
L8002a904:
  slti $v0, $a0, 20
L8002a908:
  bne $v0, $zero, L8002a944
L8002a90c:
  slti $v0, $a1, 39
L8002a910:
  beq $v0, $zero, L8002a944
L8002a914:
  addiu $a0, $zero, 19
L8002a918:
  addu $a0, $zero, $zero
L8002a91c:
  j L8002a940
L8002a920:
  addiu $a1, $a1, 1
L8002a924:
  addiu $a0, $a0, -1
L8002a928:
  bgez $a0, L8002a944
L8002a92c:
  sll $zero, $zero, 0x0
L8002a930:
  beq $a1, $zero, L8002a944
L8002a934:
  addu $a0, $zero, $zero
L8002a938:
  addiu $a0, $zero, 19
L8002a93c:
  addiu $a1, $a1, -1
L8002a940:
  sll $a2, $a2, 0x2
L8002a944:
  lui $v0, 0x800a
L8002a948:
  lhu $v0, -19548($v0)
L8002a94c:
  sll $zero, $zero, 0x0
L8002a950:
  andi $v0, $v0, 0x5000
L8002a954:
  beq $v0, $zero, L8002a99c
L8002a958:
  sll $zero, $zero, 0x0
L8002a95c:
  lui $v0, 0x800a
L8002a960:
  lhu $v0, -19548($v0)
L8002a964:
  sll $zero, $zero, 0x0
L8002a968:
  andi $v0, $v0, 0x4000
L8002a96c:
  beq $v0, $zero, L8002a98c
L8002a970:
  sll $zero, $zero, 0x0
L8002a974:
  addiu $a1, $a1, 1
L8002a978:
  slti $v0, $a1, 40
L8002a97c:
  bne $v0, $zero, L8002a99c
L8002a980:
  sll $zero, $zero, 0x0
L8002a984:
  j L8002a99c
L8002a988:
  addiu $a1, $zero, 39
L8002a98c:
  addiu $a1, $a1, -1
L8002a990:
  bgez $a1, L8002a99c
L8002a994:
  sll $zero, $zero, 0x0
L8002a998:
  addu $a1, $zero, $zero
L8002a99c:
  jal L8002a4a8
L8002a9a0:
  sll $zero, $zero, 0x0
L8002a9a4:
  jal L8002a660
L8002a9a8:
  addu $a0, $s1, $zero
L8002a9ac:
  lw $ra, 24($sp)
L8002a9b0:
  lw $s1, 20($sp)
L8002a9b4:
  lw $s0, 16($sp)
L8002a9b8:
  jr $ra
L8002a9bc:
  addiu $sp, $sp, 32
L8002a9c0:
  addiu $sp, $sp, -72
L8002a9c4:
  sw $s3, 60($sp)
L8002a9c8:
  addu $s3, $a0, $zero
L8002a9cc:
  sw $ra, 68($sp)
L8002a9d0:
  sw $s4, 64($sp)
L8002a9d4:
  sw $s2, 56($sp)
L8002a9d8:
  sw $s1, 52($sp)
L8002a9dc:
  sw $s0, 48($sp)
L8002a9e0:
  lhu $v0, 96($s3)
L8002a9e4:
  sll $zero, $zero, 0x0
L8002a9e8:
  addiu $v0, $v0, -16
L8002a9ec:
  sh $v0, 96($s3)
L8002a9f0:
  sll $v0, $v0, 0x10
L8002a9f4:
  bgtz $v0, L8002aa0c
L8002a9f8:
  addu $s4, $a1, $zero
L8002a9fc:
  jal 0x8004036c
L8002aa00:
  sll $zero, $zero, 0x0
L8002aa04:
  j L8002ab94
L8002aa08:
  sll $zero, $zero, 0x0
L8002aa0c:
  lui $s1, 0x1f80
L8002aa10:
  ori $s1, $s1, 0x398
L8002aa14:
  addu $a0, $s3, $zero
L8002aa18:
  lui $a3, 0x1f80
L8002aa1c:
  ori $a3, $a3, 0x398
L8002aa20:
  lui $s0, 0x1f80
L8002aa24:
  ori $s0, $s0, 0x2a0
L8002aa28:
  lh $v0, 48($s3)
L8002aa2c:
  lh $a1, 24($s3)
L8002aa30:
  lh $v1, 50($s3)
L8002aa34:
  lh $a2, 26($s3)
L8002aa38:
  addu $a1, $v0, $a1
L8002aa3c:
  lbu $v0, 96($s3)
L8002aa40:
  addu $a2, $v1, $a2
L8002aa44:
  jal 0x80041f90
L8002aa48:
  sb $v0, 14($s3)
L8002aa4c:
  lui $t0, 0x1f80
L8002aa50:
  ori $t0, $t0, 0x300
L8002aa54:
  lui $a2, 0x5555
L8002aa58:
  ori $a2, $a2, 0x5555
L8002aa5c:
  lui $t4, 0x1f80
L8002aa60:
  ori $t4, $t4, 0x310
L8002aa64:
  lui $t1, 0x1f80
L8002aa68:
  ori $t1, $t1, 0x318
L8002aa6c:
  lui $t3, 0x1f80
L8002aa70:
  ori $t3, $t3, 0x308
L8002aa74:
  lui $s2, 0x1f80
L8002aa78:
  ori $s2, $s2, 0x2a8
L8002aa7c:
  lui $t7, 0x1f80
L8002aa80:
  ori $t7, $t7, 0x2ac
L8002aa84:
  lui $t6, 0x1f80
L8002aa88:
  ori $t6, $t6, 0x2b4
L8002aa8c:
  lui $t5, 0x1f80
L8002aa90:
  ori $t5, $t5, 0x2b0
L8002aa94:
  lui $a0, 0x1f80
L8002aa98:
  ori $a0, $a0, 0x300
L8002aa9c:
  lui $a1, 0x1f80
L8002aaa0:
  ori $a1, $a1, 0x308
L8002aaa4:
  lw $v1, 12($s3)
L8002aaa8:
  addiu $v0, $zero, 6
L8002aaac:
  sb $v0, 3($s0)
L8002aab0:
  addiu $v0, $zero, 76
L8002aab4:
  sw $a2, 24($s0)
L8002aab8:
  lui $a2, 0x1f80
L8002aabc:
  sw $v1, 4($s0)
L8002aac0:
  sb $v0, 7($s0)
L8002aac4:
  lhu $v0, 48($s3)
L8002aac8:
  lhu $v1, 0($s1)
L8002aacc:
  ori $a2, $a2, 0x310
L8002aad0:
  subu $v0, $v0, $v1
L8002aad4:
  sh $v0, 0($t4)
L8002aad8:
  sh $v0, 0($t0)
L8002aadc:
  lhu $v1, 60($s3)
L8002aae0:
  lui $a3, 0x1f80
L8002aae4:
  addu $v0, $v0, $v1
L8002aae8:
  sh $v0, 0($t1)
L8002aaec:
  sh $v0, 8($t0)
L8002aaf0:
  lhu $v1, 50($s3)
L8002aaf4:
  lhu $v0, 2($s1)
L8002aaf8:
  ori $a3, $a3, 0x318
L8002aafc:
  subu $v1, $v1, $v0
L8002ab00:
  sh $v1, 2($t3)
L8002ab04:
  sh $v1, 2($t0)
L8002ab08:
  lhu $t2, 62($s3)
L8002ab0c:
  addiu $v0, $sp, 40
L8002ab10:
  sh $zero, 4($t1)
L8002ab14:
  sh $zero, 4($t4)
L8002ab18:
  sh $zero, 4($t3)
L8002ab1c:
  sh $zero, 4($t0)
L8002ab20:
  sw $v0, 32($sp)
L8002ab24:
  addiu $v0, $sp, 44
L8002ab28:
  sw $s2, 16($sp)
L8002ab2c:
  sw $t7, 20($sp)
L8002ab30:
  sw $t6, 24($sp)
L8002ab34:
  sw $t5, 28($sp)
L8002ab38:
  sw $v0, 36($sp)
L8002ab3c:
  addu $v1, $v1, $t2
L8002ab40:
  sh $v1, 2($t1)
L8002ab44:
  jal 0x80087ab0
L8002ab48:
  sh $v1, 18($t0)
L8002ab4c:
  lui $a0, 0x1f80
L8002ab50:
  ori $a0, $a0, 0x2a0
L8002ab54:
  addu $a1, $s4, $zero
L8002ab58:
  lhu $a2, 20($s3)
L8002ab5c:
  jal 0x8005b260
L8002ab60:
  addiu $a3, $zero, 1
L8002ab64:
  lui $a0, 0x1f80
L8002ab68:
  ori $a0, $a0, 0x2a0
L8002ab6c:
  addu $a1, $s4, $zero
L8002ab70:
  addiu $v0, $zero, 3
L8002ab74:
  sb $v0, 3($s0)
L8002ab78:
  addiu $v0, $zero, 64
L8002ab7c:
  sb $v0, 7($s0)
L8002ab80:
  lhu $a2, 20($s3)
L8002ab84:
  lw $v0, 20($s0)
L8002ab88:
  addiu $a3, $zero, 1
L8002ab8c:
  jal 0x8005b260
L8002ab90:
  sw $v0, 12($s0)
L8002ab94:
  lw $ra, 68($sp)
L8002ab98:
  lw $s4, 64($sp)
L8002ab9c:
  lw $s3, 60($sp)
L8002aba0:
  lw $s2, 56($sp)
L8002aba4:
  lw $s1, 52($sp)
L8002aba8:
  lw $s0, 48($sp)
L8002abac:
  jr $ra
L8002abb0:
  addiu $sp, $sp, 72
L8002abb4:
  addiu $sp, $sp, -32
L8002abb8:
  sw $s1, 20($sp)
L8002abbc:
  addu $s1, $a0, $zero
L8002abc0:
  sw $s2, 24($sp)
L8002abc4:
  addu $s2, $a1, $zero
L8002abc8:
  sw $ra, 28($sp)
L8002abcc:
  jal 0x8004002c
L8002abd0:
  sw $s0, 16($sp)
L8002abd4:
  addu $a0, $v0, $zero
L8002abd8:
  jal 0x800400ac
L8002abdc:
  addiu $a1, $zero, 6
L8002abe0:
  lw $v1, 72($s1)
L8002abe4:
  addu $s0, $v0, $zero
L8002abe8:
  sw $v1, 72($s0)
L8002abec:
  lw $v1, 24($s1)
L8002abf0:
  addiu $v0, $zero, 256
L8002abf4:
  sh $v0, 96($s0)
L8002abf8:
  sw $v1, 24($s0)
L8002abfc:
  lh $v0, 24($s0)
L8002ac00:
  lh $v1, 26($s0)
L8002ac04:
  sll $v0, $v0, 0x1
L8002ac08:
  sll $v1, $v1, 0x1
L8002ac0c:
  sh $v0, 60($s0)
L8002ac10:
  sh $v1, 62($s0)
L8002ac14:
  lw $v0, 48($s1)
L8002ac18:
  sll $zero, $zero, 0x0
L8002ac1c:
  sw $v0, 48($s0)
L8002ac20:
  lw $v0, 32($s1)
L8002ac24:
  sll $zero, $zero, 0x0
L8002ac28:
  sw $v0, 32($s0)
L8002ac2c:
  lw $v0, 68($s1)
L8002ac30:
  addu $a0, $s0, $zero
L8002ac34:
  sw $zero, 12($s0)
L8002ac38:
  jal 0x80042918
L8002ac3c:
  sw $v0, 68($s0)
L8002ac40:
  lbu $a1, 22($s1)
L8002ac44:
  addu $a0, $s0, $zero
L8002ac48:
  addu $a1, $a1, $s2
L8002ac4c:
  sll $a1, $a1, 0x18
L8002ac50:
  jal 0x800428ec
L8002ac54:
  sra $a1, $a1, 0x18
L8002ac58:
  lui $a1, 0xf7ff
L8002ac5c:
  ori $a1, $a1, 0xffff
L8002ac60:
  addu $v0, $s0, $zero
L8002ac64:
  addiu $v1, $zero, 1
L8002ac68:
  sw $v1, 16($v0)
L8002ac6c:
  lui $v1, 0x8003
L8002ac70:
  addiu $v1, $v1, -22080
L8002ac74:
  sw $v1, 76($v0)
L8002ac78:
  lw $v1, 4($v0)
L8002ac7c:
  lui $a0, 0x5000
L8002ac80:
  or $v1, $v1, $a0
L8002ac84:
  and $v1, $v1, $a1
L8002ac88:
  sw $v1, 4($v0)
L8002ac8c:
  lw $ra, 28($sp)
L8002ac90:
  lw $s2, 24($sp)
L8002ac94:
  lw $s1, 20($sp)
L8002ac98:
  lw $s0, 16($sp)
L8002ac9c:
  jr $ra
L8002aca0:
  addiu $sp, $sp, 32
L8002aca4:
  addiu $sp, $sp, -72
L8002aca8:
  sw $s3, 44($sp)
L8002acac:
  addu $s3, $a0, $zero
L8002acb0:
  lui $v0, 0x800f
L8002acb4:
  sw $ra, 64($sp)
L8002acb8:
  sw $s7, 60($sp)
L8002acbc:
  sw $s6, 56($sp)
L8002acc0:
  sw $s5, 52($sp)
L8002acc4:
  sw $s4, 48($sp)
L8002acc8:
  sw $s2, 40($sp)
L8002accc:
  sw $s1, 36($sp)
L8002acd0:
  sw $s0, 32($sp)
L8002acd4:
  lbu $v1, 0($s3)
L8002acd8:
  addiu $s6, $v0, -24344
L8002acdc:
  andi $v0, $v1, 0x80
L8002ace0:
  bne $v0, $zero, L8002ad88
L8002ace4:
  ori $v0, $v1, 0x80
L8002ace8:
  sb $v0, 0($s3)
L8002acec:
  addiu $v0, $zero, 1
L8002acf0:
  sb $zero, 1($s3)
L8002acf4:
  sb $zero, 3($s3)
L8002acf8:
  jal 0x800530c4
L8002acfc:
  sb $v0, 4($s3)
L8002ad00:
  jal 0x800533d8
L8002ad04:
  lui $s0, 0x800f
L8002ad08:
  addiu $a0, $zero, 300
L8002ad0c:
  addiu $v0, $zero, 820
L8002ad10:
  sh $v0, 10312($s0)
L8002ad14:
  addiu $s0, $s0, 10312
L8002ad18:
  addiu $v0, $zero, 1024
L8002ad1c:
  sh $v0, 2($s0)
L8002ad20:
  addiu $v0, $zero, 196
L8002ad24:
  sh $v0, 4($s0)
L8002ad28:
  addu $v0, $a0, $zero
L8002ad2c:
  sh $zero, 12($s0)
L8002ad30:
  sw $zero, 40($s0)
L8002ad34:
  sw $zero, 44($s0)
L8002ad38:
  jal 0x800857c0
L8002ad3c:
  sh $v0, 14($s0)
L8002ad40:
  addiu $v0, $s0, 16
L8002ad44:
  sw $zero, 12($v0)
L8002ad48:
  sh $zero, 6($s0)
L8002ad4c:
  sw $zero, 16($v0)
L8002ad50:
  sh $zero, 8($s0)
L8002ad54:
  sw $zero, 20($v0)
L8002ad58:
  jal 0x8001352c
L8002ad5c:
  sh $zero, 10($s0)
L8002ad60:
  lhu $a1, 6($s3)
L8002ad64:
  jal L80029164
L8002ad68:
  addu $a0, $zero, $zero
L8002ad6c:
  jal 0x80015c84
L8002ad70:
  sll $zero, $zero, 0x0
L8002ad74:
  lui $v1, 0x800f
L8002ad78:
  addiu $v0, $zero, 6
L8002ad7c:
  sb $v0, -24881($v1)
L8002ad80:
  j L8002ba74
L8002ad84:
  sw $zero, 80($s3)
L8002ad88:
  jal L80039794
L8002ad8c:
  sll $zero, $zero, 0x0
L8002ad90:
  lbu $a1, 4($s3)
L8002ad94:
  sll $zero, $zero, 0x0
L8002ad98:
  andi $v0, $a1, 0xf
L8002ad9c:
  beq $v0, $zero, L8002aeb8
L8002ada0:
  lui $v0, 0x200
L8002ada4:
  ori $v0, $v0, 0x30
L8002ada8:
  lui $v1, 0x800a
L8002adac:
  lw $v1, -20236($v1)
L8002adb0:
  lui $a0, 0x800a
L8002adb4:
  lw $a0, -20172($a0)
L8002adb8:
  and $v1, $v1, $v0
L8002adbc:
  or $v1, $v1, $a0
L8002adc0:
  bne $v1, $zero, L8002aeb8
L8002adc4:
  addiu $s0, $zero, 1
L8002adc8:
  bne $a1, $s0, L8002ae34
L8002adcc:
  lui $v1, 0x801d
L8002add0:
  lhu $v0, 6($s3)
L8002add4:
  addiu $v1, $v1, 16964
L8002add8:
  sb $zero, 4($s3)
L8002addc:
  addiu $a1, $v0, -1
L8002ade0:
  sll $v0, $a1, 0x2
L8002ade4:
  addu $v0, $v0, $v1
L8002ade8:
  lw $v0, 0($v0)
L8002adec:
  sll $zero, $zero, 0x0
L8002adf0:
  sra $v0, $v0, 0x1a
L8002adf4:
  andi $v0, $v0, 0x1f
L8002adf8:
  slti $v0, $v0, 20
L8002adfc:
  beq $v0, $zero, L8002aeb8
L8002ae00:
  addu $a0, $zero, $zero
L8002ae04:
  addu $a2, $a0, $zero
L8002ae08:
  addu $a3, $a0, $zero
L8002ae0c:
  addiu $v0, $zero, 4
L8002ae10:
  sw $zero, 16($sp)
L8002ae14:
  sw $zero, 20($sp)
L8002ae18:
  jal 0x80056504
L8002ae1c:
  sw $v0, 24($sp)
L8002ae20:
  addiu $v0, $zero, 300
L8002ae24:
  sw $v0, 32($s3)
L8002ae28:
  addiu $v0, $zero, 2
L8002ae2c:
  j L8002aeb8
L8002ae30:
  sb $v0, 4($s3)
L8002ae34:
  jal 0x80056828
L8002ae38:
  addu $a0, $zero, $zero
L8002ae3c:
  jal 0x80058dd8
L8002ae40:
  addu $a0, $zero, $zero
L8002ae44:
  bne $v0, $s0, L8002aeb8
L8002ae48:
  sll $zero, $zero, 0x0
L8002ae4c:
  jal 0x8004002c
L8002ae50:
  sb $zero, 4($s3)
L8002ae54:
  addu $a0, $v0, $zero
L8002ae58:
  jal 0x800400ac
L8002ae5c:
  addiu $a1, $zero, 2
L8002ae60:
  addu $s0, $v0, $zero
L8002ae64:
  addu $a0, $s0, $zero
L8002ae68:
  addiu $a1, $zero, 304
L8002ae6c:
  addiu $a2, $zero, 205
L8002ae70:
  addiu $a3, $zero, 3
L8002ae74:
  addiu $v0, $zero, 2
L8002ae78:
  sw $v0, 20($sp)
L8002ae7c:
  addiu $v0, $zero, 11
L8002ae80:
  sw $v0, 24($sp)
L8002ae84:
  addiu $v0, $zero, 524
L8002ae88:
  sw $zero, 16($sp)
L8002ae8c:
  jal 0x800404cc
L8002ae90:
  sw $v0, 28($sp)
L8002ae94:
  lhu $v0, 8($s0)
L8002ae98:
  addu $a0, $s0, $zero
L8002ae9c:
  ori $v0, $v0, 0x28
L8002aea0:
  jal 0x80042918
L8002aea4:
  sh $v0, 8($s0)
L8002aea8:
  addu $a0, $s0, $zero
L8002aeac:
  jal 0x800428ec
L8002aeb0:
  addiu $a1, $zero, 10
L8002aeb4:
  sw $s0, 80($s3)
L8002aeb8:
  lbu $v1, 3($s3)
L8002aebc:
  addiu $v0, $zero, 1
L8002aec0:
  andi $a0, $v1, 0xf
L8002aec4:
  beq $a0, $v0, L8002aedc
L8002aec8:
  addiu $v0, $zero, 2
L8002aecc:
  beq $a0, $v0, L8002af3c
L8002aed0:
  andi $v0, $v1, 0x80
L8002aed4:
  j L8002afb4
L8002aed8:
  sll $zero, $zero, 0x0
L8002aedc:
  lw $s0, 76($s3)
L8002aee0:
  andi $v0, $v1, 0x80
L8002aee4:
  bne $v0, $zero, L8002af10
L8002aee8:
  addu $a0, $s0, $zero
L8002aeec:
  ori $v0, $v1, 0x80
L8002aef0:
  sb $v0, 3($s3)
L8002aef4:
  addiu $v0, $zero, 328
L8002aef8:
  sh $v0, 48($s0)
L8002aefc:
  addiu $v0, $zero, 14
L8002af00:
  jal 0x80043178
L8002af04:
  sh $v0, 50($s0)
L8002af08:
  addiu $v0, $zero, -1024
L8002af0c:
  sh $v0, 96($s0)
L8002af10:
  lhu $v0, 96($s0)
L8002af14:
  sll $zero, $zero, 0x0
L8002af18:
  addiu $v0, $v0, 51
L8002af1c:
  sh $v0, 96($s0)
L8002af20:
  sll $v0, $v0, 0x10
L8002af24:
  sra $a3, $v0, 0x10
L8002af28:
  bgez $a3, L8002af80
L8002af2c:
  addiu $v0, $zero, 148
L8002af30:
  addu $a0, $s0, $zero
L8002af34:
  j L8002af98
L8002af38:
  addiu $a1, $zero, 148
L8002af3c:
  lw $s0, 76($s3)
L8002af40:
  bne $v0, $zero, L8002af5c
L8002af44:
  addu $a0, $s0, $zero
L8002af48:
  ori $v0, $v1, 0x80
L8002af4c:
  jal 0x80043178
L8002af50:
  sb $v0, 3($s3)
L8002af54:
  addiu $v0, $zero, 1024
L8002af58:
  sh $v0, 96($s0)
L8002af5c:
  lhu $v0, 96($s0)
L8002af60:
  sll $zero, $zero, 0x0
L8002af64:
  addiu $v0, $v0, -51
L8002af68:
  sh $v0, 96($s0)
L8002af6c:
  sll $v0, $v0, 0x10
L8002af70:
  sra $a3, $v0, 0x10
L8002af74:
  bgtz $a3, L8002af94
L8002af78:
  addiu $a1, $zero, 328
L8002af7c:
  addiu $v0, $zero, 328
L8002af80:
  sh $v0, 48($s0)
L8002af84:
  addiu $v0, $zero, 14
L8002af88:
  sh $v0, 50($s0)
L8002af8c:
  j L8002afa0
L8002af90:
  sb $zero, 3($s3)
L8002af94:
  addu $a0, $s0, $zero
L8002af98:
  jal 0x80043230
L8002af9c:
  addiu $a2, $zero, 14
L8002afa0:
  lui $a0, 0x800f
L8002afa4:
  lh $a1, 48($s0)
L8002afa8:
  lh $a2, 50($s0)
L8002afac:
  jal L80039934
L8002afb0:
  addiu $a0, $a0, -20232
L8002afb4:
  lbu $v0, 1($s3)
L8002afb8:
  sll $zero, $zero, 0x0
L8002afbc:
  andi $v1, $v0, 0x1f
L8002afc0:
  sltiu $v0, $v1, 9
L8002afc4:
  beq $v0, $zero, L8002ba74
L8002afc8:
  lui $v0, 0x8001
L8002afcc:
  addiu $v0, $v0, 480
L8002afd0:
  sll $v1, $v1, 0x2
L8002afd4:
  addu $v1, $v1, $v0
L8002afd8:
  lw $v0, 0($v1)
L8002afdc:
  sll $zero, $zero, 0x0
L8002afe0:
  jr $v0
L8002afe4:
  sll $zero, $zero, 0x0
L8002afe8:
  addu $a0, $zero, $zero
L8002afec:
  lhu $v1, 6($s3)
L8002aff0:
  addiu $a1, $zero, -1
L8002aff4:
  sll $v1, $v1, 0x2
L8002aff8:
  addu $v1, $s3, $v1
L8002affc:
  lbu $v0, 86($v1)
L8002b000:
  addu $a2, $a1, $zero
L8002b004:
  andi $v0, $v0, 0x7f
L8002b008:
  jal L800291e0
L8002b00c:
  sb $v0, 86($v1)
L8002b010:
  addu $s0, $v0, $zero
L8002b014:
  lui $a0, 0xf7ff
L8002b018:
  ori $a0, $a0, 0xffff
L8002b01c:
  lhu $v0, 8($s0)
L8002b020:
  lw $v1, 4($s0)
L8002b024:
  lhu $a1, 74($s0)
L8002b028:
  ori $v0, $v0, 0x4
L8002b02c:
  and $v1, $v1, $a0
L8002b030:
  sh $v0, 8($s0)
L8002b034:
  sw $v1, 4($s0)
L8002b038:
  lhu $v0, 18($s3)
L8002b03c:
  lui $v1, 0x800a
L8002b040:
  lhu $v1, -20154($v1)
L8002b044:
  lhu $a0, 72($s0)
L8002b048:
  subu $v0, $v0, $v1
L8002b04c:
  subu $v0, $v0, $a0
L8002b050:
  sh $v0, 48($s0)
L8002b054:
  lhu $v0, 20($s3)
L8002b058:
  lui $v1, 0x800a
L8002b05c:
  lhu $v1, -20152($v1)
L8002b060:
  addu $a0, $s0, $zero
L8002b064:
  sh $zero, 70($s0)
L8002b068:
  sh $zero, 68($s0)
L8002b06c:
  subu $v0, $v0, $v1
L8002b070:
  subu $v0, $v0, $a1
L8002b074:
  jal 0x80043178
L8002b078:
  sh $v0, 50($s0)
L8002b07c:
  addiu $a0, $zero, 50
L8002b080:
  jal L8003fee0
L8002b084:
  sh $zero, 96($s0)
L8002b088:
  lw $a0, 4($s6)
L8002b08c:
  sll $zero, $zero, 0x0
L8002b090:
  lw $v0, 4($a0)
L8002b094:
  lui $v1, 0x8000
L8002b098:
  or $v0, $v0, $v1
L8002b09c:
  jal 0x8004002c
L8002b0a0:
  sw $v0, 4($a0)
L8002b0a4:
  addu $a0, $v0, $zero
L8002b0a8:
  jal 0x800400ac
L8002b0ac:
  addiu $a1, $zero, 2
L8002b0b0:
  addu $s0, $v0, $zero
L8002b0b4:
  addu $a0, $s0, $zero
L8002b0b8:
  addiu $a1, $zero, 328
L8002b0bc:
  addiu $a2, $zero, 14
L8002b0c0:
  addu $a3, $zero, $zero
L8002b0c4:
  addiu $v0, $zero, 2
L8002b0c8:
  sw $v0, 16($sp)
L8002b0cc:
  addiu $v0, $zero, 27
L8002b0d0:
  sw $v0, 24($sp)
L8002b0d4:
  addiu $v0, $zero, 263
L8002b0d8:
  sw $zero, 20($sp)
L8002b0dc:
  jal 0x800404cc
L8002b0e0:
  sw $v0, 28($sp)
L8002b0e4:
  addu $a0, $s0, $zero
L8002b0e8:
  addiu $v0, $zero, 128
L8002b0ec:
  sb $v0, 95($s0)
L8002b0f0:
  lhu $v0, 8($s0)
L8002b0f4:
  addiu $v1, $zero, -1024
L8002b0f8:
  sh $v1, 96($s0)
L8002b0fc:
  ori $v0, $v0, 0x8
L8002b100:
  jal 0x80042918
L8002b104:
  sh $v0, 8($s0)
L8002b108:
  addu $a0, $s0, $zero
L8002b10c:
  jal 0x800428ec
L8002b110:
  addiu $a1, $zero, 4
L8002b114:
  sw $s0, 76($s3)
L8002b118:
  addiu $s0, $zero, 1
L8002b11c:
  lui $v1, 0x801d
L8002b120:
  lhu $a0, 6($s3)
L8002b124:
  addiu $v1, $v1, 16964
L8002b128:
  sb $s0, 3($s3)
L8002b12c:
  sll $v0, $a0, 0x10
L8002b130:
  sra $v0, $v0, 0xe
L8002b134:
  addu $v0, $v0, $v1
L8002b138:
  lw $v0, -4($v0)
L8002b13c:
  lui $at, 0x800a
L8002b140:
  sh $a0, -19656($at)
L8002b144:
  sra $v0, $v0, 0x1a
L8002b148:
  andi $v0, $v0, 0x1f
L8002b14c:
  slti $v0, $v0, 20
L8002b150:
  bne $v0, $zero, L8002b15c
L8002b154:
  addiu $a1, $zero, 3
L8002b158:
  addiu $a1, $zero, 4
L8002b15c:
  addu $a0, $zero, $zero
L8002b160:
  addiu $a2, $zero, 148
L8002b164:
  addiu $a3, $zero, 14
L8002b168:
  addiu $v0, $zero, 168
L8002b16c:
  sw $v0, 16($sp)
L8002b170:
  addiu $v0, $zero, 192
L8002b174:
  jal L80035be4
L8002b178:
  sw $v0, 20($sp)
L8002b17c:
  addiu $v1, $zero, 4
L8002b180:
  sb $zero, 84($v0)
L8002b184:
  sb $s0, 83($v0)
L8002b188:
  sb $v1, 89($v0)
L8002b18c:
  j L8002ba74
L8002b190:
  sb $s0, 1($s3)
L8002b194:
  lw $s0, 0($s6)
L8002b198:
  addiu $a1, $zero, -1
L8002b19c:
  jal L8002abb4
L8002b1a0:
  addu $a0, $s0, $zero
L8002b1a4:
  lw $v0, 4($s0)
L8002b1a8:
  lui $s1, 0x800
L8002b1ac:
  and $v0, $v0, $s1
L8002b1b0:
  bne $v0, $zero, L8002b26c
L8002b1b4:
  addu $a0, $s0, $zero
L8002b1b8:
  addiu $a1, $zero, 2
L8002b1bc:
  addiu $a2, $zero, 4
L8002b1c0:
  lhu $t0, 96($s0)
L8002b1c4:
  lbu $v0, 34($s0)
L8002b1c8:
  lhu $v1, 68($s0)
L8002b1cc:
  addiu $t0, $t0, 102
L8002b1d0:
  sll $a3, $t0, 0x10
L8002b1d4:
  sra $a3, $a3, 0x10
L8002b1d8:
  addiu $v0, $v0, 12
L8002b1dc:
  sb $v0, 34($s0)
L8002b1e0:
  lbu $v0, 33($s0)
L8002b1e4:
  addiu $v1, $v1, 204
L8002b1e8:
  sh $v1, 68($s0)
L8002b1ec:
  sh $v1, 70($s0)
L8002b1f0:
  sh $t0, 96($s0)
L8002b1f4:
  addiu $v0, $v0, 6
L8002b1f8:
  jal 0x8004318c
L8002b1fc:
  sb $v0, 33($s0)
L8002b200:
  lh $v0, 96($s0)
L8002b204:
  sll $zero, $zero, 0x0
L8002b208:
  slti $v0, $v0, 2048
L8002b20c:
  bne $v0, $zero, L8002b258
L8002b210:
  lui $a0, 0x4
L8002b214:
  ori $a0, $a0, 0x2
L8002b218:
  lui $v1, 0x1000
L8002b21c:
  ori $v1, $v1, 0x1000
L8002b220:
  ori $v0, $zero, 0x8000
L8002b224:
  sw $v0, 32($s0)
L8002b228:
  sw $a0, 48($s0)
L8002b22c:
  sw $v1, 68($s0)
L8002b230:
  lw $a0, 4($s6)
L8002b234:
  lui $v1, 0x7fff
L8002b238:
  lw $v0, 4($a0)
L8002b23c:
  ori $v1, $v1, 0xffff
L8002b240:
  and $v0, $v0, $v1
L8002b244:
  sw $v0, 4($a0)
L8002b248:
  lw $v0, 4($s0)
L8002b24c:
  sll $zero, $zero, 0x0
L8002b250:
  or $v0, $v0, $s1
L8002b254:
  sw $v0, 4($s0)
L8002b258:
  lw $v0, 4($s0)
L8002b25c:
  sll $zero, $zero, 0x0
L8002b260:
  and $v0, $v0, $s1
L8002b264:
  beq $v0, $zero, L8002ba74
L8002b268:
  sll $zero, $zero, 0x0
L8002b26c:
  lbu $v0, 3($s3)
L8002b270:
  sll $zero, $zero, 0x0
L8002b274:
  bne $v0, $zero, L8002ba74
L8002b278:
  addiu $v0, $zero, 2
L8002b27c:
  j L8002ba74
L8002b280:
  sb $v0, 1($s3)
L8002b284:
  lbu $v1, 4($s3)
L8002b288:
  addiu $v0, $zero, 1
L8002b28c:
  beq $v1, $v0, L8002ba74
L8002b290:
  lui $v0, 0x800f
L8002b294:
  lbu $v0, -24882($v0)
L8002b298:
  sll $zero, $zero, 0x0
L8002b29c:
  andi $v0, $v0, 0x80
L8002b2a0:
  bne $v0, $zero, L8002ba74
L8002b2a4:
  lui $v0, 0x800f
L8002b2a8:
  sw $zero, -25156($v0)
L8002b2ac:
  addu $a0, $zero, $zero
L8002b2b0:
  addu $a1, $s3, $zero
L8002b2b4:
  lw $v0, 36($a1)
L8002b2b8:
  sll $zero, $zero, 0x0
L8002b2bc:
  lhu $v1, 8($v0)
L8002b2c0:
  addiu $a0, $a0, 1
L8002b2c4:
  andi $v1, $v1, 0xffbf
L8002b2c8:
  sh $v1, 8($v0)
L8002b2cc:
  slti $v0, $a0, 9
L8002b2d0:
  bne $v0, $zero, L8002b2b4
L8002b2d4:
  addiu $a1, $a1, 4
L8002b2d8:
  lui $v0, 0x800f
L8002b2dc:
  lw $v1, -19892($v0)
L8002b2e0:
  sll $zero, $zero, 0x0
L8002b2e4:
  lhu $v0, 8($v1)
L8002b2e8:
  addiu $a0, $zero, 49
L8002b2ec:
  andi $v0, $v0, 0xffbf
L8002b2f0:
  sh $v0, 8($v1)
L8002b2f4:
  addiu $v0, $zero, 3
L8002b2f8:
  jal L8003fee0
L8002b2fc:
  sb $v0, 1($s3)
L8002b300:
  lw $s0, 0($s6)
L8002b304:
  sll $zero, $zero, 0x0
L8002b308:
  lbu $v0, 33($s0)
L8002b30c:
  sll $zero, $zero, 0x0
L8002b310:
  addiu $v0, $v0, 8
L8002b314:
  sb $v0, 33($s0)
L8002b318:
  andi $v0, $v0, 0xff
L8002b31c:
  bne $v0, $zero, L8002ba74
L8002b320:
  sll $zero, $zero, 0x0
L8002b324:
  lhu $v0, 8($s0)
L8002b328:
  sll $zero, $zero, 0x0
L8002b32c:
  andi $v0, $v0, 0xfffb
L8002b330:
  j L8002b7c8
L8002b334:
  sh $v0, 8($s0)
L8002b338:
  addu $a0, $zero, $zero
L8002b33c:
  jal 0x800591c0
L8002b340:
  addiu $a1, $zero, 2
L8002b344:
  addu $s0, $v0, $zero
L8002b348:
  lui $s7, 0x800f
L8002b34c:
  addiu $s5, $s7, 10312
L8002b350:
  lh $v0, 10312($s7)
L8002b354:
  lh $a0, 4($s5)
L8002b358:
  jal 0x80086770
L8002b35c:
  subu $s2, $zero, $v0
L8002b360:
  mult $s2, $v0
L8002b364:
  mflo $v0
L8002b368:
  bgez $v0, L8002b374
L8002b36c:
  sll $zero, $zero, 0x0
L8002b370:
  addiu $v0, $v0, 4095
L8002b374:
  lh $a0, 4($s5)
L8002b378:
  jal 0x800866a0
L8002b37c:
  sra $s1, $v0, 0xc
L8002b380:
  mult $s2, $v0
L8002b384:
  mflo $v0
L8002b388:
  bgez $v0, L8002b394
L8002b38c:
  sll $zero, $zero, 0x0
L8002b390:
  addiu $v0, $v0, 4095
L8002b394:
  lh $a0, 2($s5)
L8002b398:
  sra $s4, $v0, 0xc
L8002b39c:
  jal 0x800866a0
L8002b3a0:
  addiu $a0, $a0, 2048
L8002b3a4:
  mult $s1, $v0
L8002b3a8:
  mflo $v0
L8002b3ac:
  bgez $v0, L8002b3b8
L8002b3b0:
  sll $zero, $zero, 0x0
L8002b3b4:
  addiu $v0, $v0, 4095
L8002b3b8:
  lh $a0, 2($s5)
L8002b3bc:
  sra $s2, $v0, 0xc
L8002b3c0:
  jal 0x80086770
L8002b3c4:
  addiu $a0, $a0, 2048
L8002b3c8:
  mult $s1, $v0
L8002b3cc:
  mflo $v0
L8002b3d0:
  bgez $v0, L8002b3e0
L8002b3d4:
  sra $s1, $v0, 0xc
L8002b3d8:
  addiu $v0, $v0, 4095
L8002b3dc:
  sra $s1, $v0, 0xc
L8002b3e0:
  sw $s1, 0($s0)
L8002b3e4:
  sw $s4, 4($s0)
L8002b3e8:
  sw $s2, 8($s0)
L8002b3ec:
  lbu $v1, 1($s3)
L8002b3f0:
  sll $zero, $zero, 0x0
L8002b3f4:
  andi $v0, $v1, 0x80
L8002b3f8:
  bne $v0, $zero, L8002b578
L8002b3fc:
  addiu $v0, $zero, 1
L8002b400:
  ori $v0, $v1, 0x80
L8002b404:
  sb $v0, 1($s3)
L8002b408:
  addiu $v0, $zero, 1
L8002b40c:
  lui $v1, 0x800f
L8002b410:
  sb $zero, 2($s3)
L8002b414:
  lui $at, 0x800a
L8002b418:
  sb $v0, -20288($at)
L8002b41c:
  lui $v0, 0x8003
L8002b420:
  addiu $v0, $v0, -26316
L8002b424:
  sw $v0, -25160($v1)
L8002b428:
  lbu $v1, 0($s3)
L8002b42c:
  sll $zero, $zero, 0x0
L8002b430:
  andi $v0, $v1, 0x40
L8002b434:
  bne $v0, $zero, L8002b510
L8002b438:
  sh $zero, 16($s3)
L8002b43c:
  addu $a0, $zero, $zero
L8002b440:
  addu $a1, $a0, $zero
L8002b444:
  ori $v0, $v1, 0x40
L8002b448:
  jal 0x800591c0
L8002b44c:
  sb $v0, 0($s3)
L8002b450:
  addu $s0, $v0, $zero
L8002b454:
  lui $v1, 0xff
L8002b458:
  ori $v1, $v1, 0xffff
L8002b45c:
  lui $t1, 0x40
L8002b460:
  ori $t1, $t1, 0x4040
L8002b464:
  lui $t0, 0xc0
L8002b468:
  ori $t0, $t0, 0xc0c0
L8002b46c:
  addu $a0, $zero, $zero
L8002b470:
  addiu $a1, $zero, 1024
L8002b474:
  addu $a2, $a1, $zero
L8002b478:
  addu $a3, $a1, $zero
L8002b47c:
  addiu $v0, $zero, -4096
L8002b480:
  sw $v0, 4($s0)
L8002b484:
  addiu $v0, $zero, 4096
L8002b488:
  sw $zero, 0($s0)
L8002b48c:
  sw $zero, 8($s0)
L8002b490:
  sw $v1, 12($s0)
L8002b494:
  sw $zero, 16($s0)
L8002b498:
  sw $v0, 20($s0)
L8002b49c:
  sw $zero, 24($s0)
L8002b4a0:
  sw $t1, 28($s0)
L8002b4a4:
  jal 0x800595c8
L8002b4a8:
  sw $t0, 44($s0)
L8002b4ac:
  addu $a0, $zero, $zero
L8002b4b0:
  lui $a1, 0x8018
L8002b4b4:
  jal 0x80058fb0
L8002b4b8:
  ori $a1, $a1, 0x1000
L8002b4bc:
  lui $v0, 0x8018
L8002b4c0:
  ori $v0, $v0, 0x1000
L8002b4c4:
  addu $a0, $zero, $zero
L8002b4c8:
  addiu $a1, $zero, 820
L8002b4cc:
  lhu $v1, 2($v0)
L8002b4d0:
  lh $a2, 0($v0)
L8002b4d4:
  sll $v1, $v1, 0x10
L8002b4d8:
  sw $a2, 28($s5)
L8002b4dc:
  lhu $v0, 4($v0)
L8002b4e0:
  sra $v1, $v1, 0x10
L8002b4e4:
  sw $v1, 32($s5)
L8002b4e8:
  sll $v0, $v0, 0x10
L8002b4ec:
  sra $v0, $v0, 0x10
L8002b4f0:
  jal 0x8005f1b8
L8002b4f4:
  sw $v0, 36($s5)
L8002b4f8:
  addu $a0, $zero, $zero
L8002b4fc:
  addiu $a1, $zero, 1
L8002b500:
  jal 0x80059aa8
L8002b504:
  sh $v0, 10312($s7)
L8002b508:
  jal 0x80059ae0
L8002b50c:
  addu $a0, $zero, $zero
L8002b510:
  addu $a0, $zero, $zero
L8002b514:
  addu $a1, $a0, $zero
L8002b518:
  jal 0x80057af4
L8002b51c:
  addiu $a2, $zero, 1
L8002b520:
  addu $a0, $zero, $zero
L8002b524:
  addiu $a1, $zero, 1
L8002b528:
  jal 0x800597c8
L8002b52c:
  addu $a2, $a0, $zero
L8002b530:
  addiu $v0, $zero, 300
L8002b534:
  sw $v0, 32($s3)
L8002b538:
  addiu $v0, $zero, 2
L8002b53c:
  sb $v0, 3($s3)
L8002b540:
  lw $s0, 0($s6)
L8002b544:
  sll $zero, $zero, 0x0
L8002b548:
  lhu $v0, 8($s0)
L8002b54c:
  addu $a0, $s0, $zero
L8002b550:
  ori $v0, $v0, 0x4
L8002b554:
  jal 0x80043178
L8002b558:
  sh $v0, 8($s0)
L8002b55c:
  addiu $a0, $zero, 52
L8002b560:
  jal L8003fee0
L8002b564:
  sh $zero, 96($s0)
L8002b568:
  jal 0x80015c0c
L8002b56c:
  sll $zero, $zero, 0x0
L8002b570:
  j L8002ba74
L8002b574:
  sll $zero, $zero, 0x0
L8002b578:
  lbu $s1, 2($s3)
L8002b57c:
  sll $zero, $zero, 0x0
L8002b580:
  beq $s1, $v0, L8002b6a8
L8002b584:
  slti $v0, $s1, 2
L8002b588:
  beq $v0, $zero, L8002b5a0
L8002b58c:
  sll $zero, $zero, 0x0
L8002b590:
  beq $s1, $zero, L8002b5b4
L8002b594:
  sll $zero, $zero, 0x0
L8002b598:
  j L8002ba74
L8002b59c:
  sll $zero, $zero, 0x0
L8002b5a0:
  addiu $v0, $zero, 2
L8002b5a4:
  beq $s1, $v0, L8002b6f0
L8002b5a8:
  sll $zero, $zero, 0x0
L8002b5ac:
  j L8002ba74
L8002b5b0:
  sll $zero, $zero, 0x0
L8002b5b4:
  lw $s0, 0($s6)
L8002b5b8:
  sll $zero, $zero, 0x0
L8002b5bc:
  lh $v0, 96($s0)
L8002b5c0:
  sll $zero, $zero, 0x0
L8002b5c4:
  slti $v0, $v0, 2048
L8002b5c8:
  beq $v0, $zero, L8002b640
L8002b5cc:
  sll $zero, $zero, 0x0
L8002b5d0:
  lbu $v0, 33($s0)
L8002b5d4:
  sll $zero, $zero, 0x0
L8002b5d8:
  addiu $v0, $v0, -4
L8002b5dc:
  sb $v0, 33($s0)
L8002b5e0:
  andi $v0, $v0, 0xff
L8002b5e4:
  sltiu $v0, $v0, 216
L8002b5e8:
  beq $v0, $zero, L8002b5f4
L8002b5ec:
  addiu $v0, $zero, 216
L8002b5f0:
  sb $v0, 33($s0)
L8002b5f4:
  addu $a0, $s0, $zero
L8002b5f8:
  addiu $a1, $zero, -22
L8002b5fc:
  lhu $v0, 96($s0)
L8002b600:
  addiu $a2, $zero, 4
L8002b604:
  addiu $v0, $v0, 204
L8002b608:
  sll $a3, $v0, 0x10
L8002b60c:
  sra $a3, $a3, 0x10
L8002b610:
  jal 0x8004318c
L8002b614:
  sh $v0, 96($s0)
L8002b618:
  lh $v0, 96($s0)
L8002b61c:
  sll $zero, $zero, 0x0
L8002b620:
  slti $v0, $v0, 2048
L8002b624:
  bne $v0, $zero, L8002b640
L8002b628:
  addiu $v0, $zero, 216
L8002b62c:
  sb $v0, 33($s0)
L8002b630:
  addiu $v0, $zero, -22
L8002b634:
  sh $v0, 48($s0)
L8002b638:
  addiu $v0, $zero, 4
L8002b63c:
  sh $v0, 50($s0)
L8002b640:
  lhu $v0, 16($s3)
L8002b644:
  sll $zero, $zero, 0x0
L8002b648:
  addiu $v0, $v0, 42
L8002b64c:
  sh $v0, 16($s3)
L8002b650:
  sll $v0, $v0, 0x10
L8002b654:
  sra $v0, $v0, 0x10
L8002b658:
  slti $v0, $v0, 1024
L8002b65c:
  bne $v0, $zero, L8002ba74
L8002b660:
  addiu $v0, $zero, 1024
L8002b664:
  sh $v0, 16($s3)
L8002b668:
  lui $v0, 0x800f
L8002b66c:
  lbu $v0, -24882($v0)
L8002b670:
  sll $zero, $zero, 0x0
L8002b674:
  andi $v0, $v0, 0x80
L8002b678:
  bne $v0, $zero, L8002ba74
L8002b67c:
  sll $zero, $zero, 0x0
L8002b680:
  lbu $v0, 3($s3)
L8002b684:
  sll $zero, $zero, 0x0
L8002b688:
  bne $v0, $zero, L8002ba74
L8002b68c:
  addiu $a1, $zero, 1
L8002b690:
  lw $a0, 80($s3)
L8002b694:
  addu $v0, $a1, $zero
L8002b698:
  jal 0x80040410
L8002b69c:
  sb $v0, 2($s3)
L8002b6a0:
  j L8002ba74
L8002b6a4:
  sll $zero, $zero, 0x0
L8002b6a8:
  lui $v0, 0x800a
L8002b6ac:
  lhu $v0, -19560($v0)
L8002b6b0:
  sll $zero, $zero, 0x0
L8002b6b4:
  andi $v0, $v0, 0x80e0
L8002b6b8:
  beq $v0, $zero, L8002ba74
L8002b6bc:
  sll $zero, $zero, 0x0
L8002b6c0:
  jal 0x80015c84
L8002b6c4:
  sll $zero, $zero, 0x0
L8002b6c8:
  addiu $a0, $zero, 52
L8002b6cc:
  addiu $v0, $zero, 2
L8002b6d0:
  sb $s1, 3($s3)
L8002b6d4:
  jal L8003fee0
L8002b6d8:
  sb $v0, 2($s3)
L8002b6dc:
  lw $s0, 0($s6)
L8002b6e0:
  jal 0x80043178
L8002b6e4:
  addu $a0, $s0, $zero
L8002b6e8:
  j L8002ba74
L8002b6ec:
  sh $zero, 96($s0)
L8002b6f0:
  lw $s0, 0($s6)
L8002b6f4:
  sll $zero, $zero, 0x0
L8002b6f8:
  lhu $v0, 8($s0)
L8002b6fc:
  sll $zero, $zero, 0x0
L8002b700:
  andi $v0, $v0, 0x4
L8002b704:
  beq $v0, $zero, L8002b778
L8002b708:
  addu $a0, $s0, $zero
L8002b70c:
  addiu $a1, $zero, 2
L8002b710:
  addiu $a2, $zero, 4
L8002b714:
  lhu $v1, 96($s0)
L8002b718:
  lbu $v0, 33($s0)
L8002b71c:
  addiu $v1, $v1, 204
L8002b720:
  sll $a3, $v1, 0x10
L8002b724:
  sra $a3, $a3, 0x10
L8002b728:
  addu $v0, $v0, $a2
L8002b72c:
  sb $v0, 33($s0)
L8002b730:
  jal 0x8004318c
L8002b734:
  sh $v1, 96($s0)
L8002b738:
  lh $v0, 96($s0)
L8002b73c:
  sll $zero, $zero, 0x0
L8002b740:
  slti $v0, $v0, 2048
L8002b744:
  bne $v0, $zero, L8002b764
L8002b748:
  addiu $v1, $zero, 4
L8002b74c:
  lhu $v0, 8($s0)
L8002b750:
  sb $zero, 33($s0)
L8002b754:
  sh $s1, 48($s0)
L8002b758:
  sh $v1, 50($s0)
L8002b75c:
  andi $v0, $v0, 0xfffb
L8002b760:
  sh $v0, 8($s0)
L8002b764:
  lhu $v0, 8($s0)
L8002b768:
  sll $zero, $zero, 0x0
L8002b76c:
  andi $v0, $v0, 0x4
L8002b770:
  bne $v0, $zero, L8002ba74
L8002b774:
  sll $zero, $zero, 0x0
L8002b778:
  lui $v0, 0x800f
L8002b77c:
  lbu $v0, -24882($v0)
L8002b780:
  sll $zero, $zero, 0x0
L8002b784:
  andi $v0, $v0, 0x80
L8002b788:
  bne $v0, $zero, L8002ba74
L8002b78c:
  sll $zero, $zero, 0x0
L8002b790:
  lbu $v0, 3($s3)
L8002b794:
  sll $zero, $zero, 0x0
L8002b798:
  bne $v0, $zero, L8002ba74
L8002b79c:
  sll $zero, $zero, 0x0
L8002b7a0:
  jal 0x80047ec4
L8002b7a4:
  sll $zero, $zero, 0x0
L8002b7a8:
  lui $v0, 0x800f
L8002b7ac:
  sw $zero, -25160($v0)
L8002b7b0:
  lw $a0, 80($s3)
L8002b7b4:
  addiu $a1, $zero, 2
L8002b7b8:
  lui $at, 0x800a
L8002b7bc:
  sb $zero, -20288($at)
L8002b7c0:
  jal 0x80040410
L8002b7c4:
  sll $zero, $zero, 0x0
L8002b7c8:
  addiu $v0, $zero, 5
L8002b7cc:
  j L8002ba74
L8002b7d0:
  sb $v0, 1($s3)
L8002b7d4:
  lui $v0, 0x800a
L8002b7d8:
  lhu $v0, -19560($v0)
L8002b7dc:
  sll $zero, $zero, 0x0
L8002b7e0:
  andi $v0, $v0, 0x20
L8002b7e4:
  beq $v0, $zero, L8002b830
L8002b7e8:
  sll $zero, $zero, 0x0
L8002b7ec:
  lw $v0, 0($s6)
L8002b7f0:
  sll $zero, $zero, 0x0
L8002b7f4:
  lhu $v1, 8($v0)
L8002b7f8:
  sll $zero, $zero, 0x0
L8002b7fc:
  ori $v1, $v1, 0x4
L8002b800:
  sh $v1, 8($v0)
L8002b804:
  lw $a0, 80($s3)
L8002b808:
  addiu $v0, $zero, 6
L8002b80c:
  sb $v0, 1($s3)
L8002b810:
  jal 0x8004036c
L8002b814:
  sb $zero, 4($s3)
L8002b818:
  jal 0x80014fa4
L8002b81c:
  sll $zero, $zero, 0x0
L8002b820:
  jal L8003fee0
L8002b824:
  addiu $a0, $zero, 49
L8002b828:
  j L8002ba74
L8002b82c:
  sll $zero, $zero, 0x0
L8002b830:
  lbu $v0, 4($s3)
L8002b834:
  sll $zero, $zero, 0x0
L8002b838:
  bne $v0, $zero, L8002ba74
L8002b83c:
  sll $zero, $zero, 0x0
L8002b840:
  lui $v0, 0x800a
L8002b844:
  lhu $v0, -19560($v0)
L8002b848:
  sll $zero, $zero, 0x0
L8002b84c:
  andi $v0, $v0, 0x20c0
L8002b850:
  beq $v0, $zero, L8002ba74
L8002b854:
  lui $v1, 0x801d
L8002b858:
  lhu $v0, 6($s3)
L8002b85c:
  addiu $v1, $v1, 16964
L8002b860:
  addiu $v0, $v0, -1
L8002b864:
  sll $v0, $v0, 0x2
L8002b868:
  addu $v0, $v0, $v1
L8002b86c:
  lw $v0, 0($v0)
L8002b870:
  sll $zero, $zero, 0x0
L8002b874:
  sra $v0, $v0, 0x1a
L8002b878:
  andi $v0, $v0, 0x1f
L8002b87c:
  slti $v0, $v0, 20
L8002b880:
  beq $v0, $zero, L8002ba74
L8002b884:
  sll $zero, $zero, 0x0
L8002b888:
  lbu $v0, 3($s3)
L8002b88c:
  sll $zero, $zero, 0x0
L8002b890:
  bne $v0, $zero, L8002ba74
L8002b894:
  addiu $v0, $zero, 4
L8002b898:
  j L8002ba74
L8002b89c:
  sb $v0, 1($s3)
L8002b8a0:
  lw $s0, 0($s6)
L8002b8a4:
  sll $zero, $zero, 0x0
L8002b8a8:
  lbu $v0, 33($s0)
L8002b8ac:
  sll $zero, $zero, 0x0
L8002b8b0:
  addiu $v0, $v0, 8
L8002b8b4:
  sb $v0, 33($s0)
L8002b8b8:
  sll $v0, $v0, 0x18
L8002b8bc:
  bgez $v0, L8002ba74
L8002b8c0:
  lui $a1, 0xf7ff
L8002b8c4:
  lw $a0, 4($s6)
L8002b8c8:
  ori $a1, $a1, 0xffff
L8002b8cc:
  lw $v0, 4($a0)
L8002b8d0:
  lui $v1, 0x8000
L8002b8d4:
  or $v0, $v0, $v1
L8002b8d8:
  sw $v0, 4($a0)
L8002b8dc:
  lw $v0, 4($s0)
L8002b8e0:
  addu $a0, $s0, $zero
L8002b8e4:
  and $v0, $v0, $a1
L8002b8e8:
  jal 0x80043178
L8002b8ec:
  sw $v0, 4($s0)
L8002b8f0:
  addu $a0, $zero, $zero
L8002b8f4:
  addu $a1, $s3, $zero
L8002b8f8:
  sh $zero, 96($s0)
L8002b8fc:
  lw $v0, 36($a1)
L8002b900:
  sll $zero, $zero, 0x0
L8002b904:
  lhu $v1, 8($v0)
L8002b908:
  addiu $a0, $a0, 1
L8002b90c:
  ori $v1, $v1, 0x40
L8002b910:
  sh $v1, 8($v0)
L8002b914:
  slti $v0, $a0, 9
L8002b918:
  bne $v0, $zero, L8002b8fc
L8002b91c:
  addiu $a1, $a1, 4
L8002b920:
  lui $v0, 0x800f
L8002b924:
  lw $v1, -19892($v0)
L8002b928:
  sll $zero, $zero, 0x0
L8002b92c:
  lhu $v0, 8($v1)
L8002b930:
  sll $zero, $zero, 0x0
L8002b934:
  ori $v0, $v0, 0x40
L8002b938:
  sh $v0, 8($v1)
L8002b93c:
  lui $v1, 0x800f
L8002b940:
  lui $v0, 0x8003
L8002b944:
  addiu $v0, $v0, -24892
L8002b948:
  jal 0x80015c0c
L8002b94c:
  sw $v0, -25156($v1)
L8002b950:
  addiu $a0, $zero, 51
L8002b954:
  addiu $v0, $zero, 2
L8002b958:
  sb $v0, 3($s3)
L8002b95c:
  addiu $v0, $zero, 7
L8002b960:
  jal L8003fee0
L8002b964:
  sb $v0, 1($s3)
L8002b968:
  j L8002ba74
L8002b96c:
  sll $zero, $zero, 0x0
L8002b970:
  lw $s0, 0($s6)
L8002b974:
  sll $zero, $zero, 0x0
L8002b978:
  beq $s0, $zero, L8002ba34
L8002b97c:
  addu $a0, $s0, $zero
L8002b980:
  jal L8002abb4
L8002b984:
  addiu $a1, $zero, 1
L8002b988:
  addu $a0, $s0, $zero
L8002b98c:
  lhu $a1, 96($s0)
L8002b990:
  lbu $v0, 34($s0)
L8002b994:
  lbu $v1, 33($s0)
L8002b998:
  addiu $a1, $a1, 102
L8002b99c:
  sll $a3, $a1, 0x10
L8002b9a0:
  sra $a3, $a3, 0x10
L8002b9a4:
  addiu $v0, $v0, 12
L8002b9a8:
  addiu $v1, $v1, 6
L8002b9ac:
  sb $v0, 34($s0)
L8002b9b0:
  sb $v1, 33($s0)
L8002b9b4:
  sh $a1, 96($s0)
L8002b9b8:
  lh $a1, 8($s3)
L8002b9bc:
  lh $v0, 72($s0)
L8002b9c0:
  lui $v1, 0x800a
L8002b9c4:
  lh $v1, -20154($v1)
L8002b9c8:
  lh $a2, 10($s3)
L8002b9cc:
  subu $a1, $a1, $v0
L8002b9d0:
  subu $a1, $a1, $v1
L8002b9d4:
  lh $v0, 74($s0)
L8002b9d8:
  lui $v1, 0x800a
L8002b9dc:
  lh $v1, -20152($v1)
L8002b9e0:
  subu $a2, $a2, $v0
L8002b9e4:
  jal 0x8004318c
L8002b9e8:
  subu $a2, $a2, $v1
L8002b9ec:
  lhu $v0, 68($s0)
L8002b9f0:
  lh $v1, 96($s0)
L8002b9f4:
  addiu $v0, $v0, -204
L8002b9f8:
  slti $v1, $v1, 2048
L8002b9fc:
  sh $v0, 68($s0)
L8002ba00:
  bne $v1, $zero, L8002ba74
L8002ba04:
  sh $v0, 70($s0)
L8002ba08:
  jal L80029528
L8002ba0c:
  addu $a0, $zero, $zero
L8002ba10:
  lhu $v1, 6($s3)
L8002ba14:
  sll $zero, $zero, 0x0
L8002ba18:
  sll $v1, $v1, 0x2
L8002ba1c:
  addu $v1, $s3, $v1
L8002ba20:
  lbu $v0, 86($v1)
L8002ba24:
  sll $zero, $zero, 0x0
L8002ba28:
  ori $v0, $v0, 0x80
L8002ba2c:
  j L8002ba74
L8002ba30:
  sb $v0, 86($v1)
L8002ba34:
  lbu $v0, 3($s3)
L8002ba38:
  sll $zero, $zero, 0x0
L8002ba3c:
  bne $v0, $zero, L8002ba74
L8002ba40:
  sll $zero, $zero, 0x0
L8002ba44:
  lw $a0, 76($s3)
L8002ba48:
  jal 0x8004036c
L8002ba4c:
  sll $zero, $zero, 0x0
L8002ba50:
  lui $a0, 0x800f
L8002ba54:
  addiu $a0, $a0, -20232
L8002ba58:
  jal L80035b7c
L8002ba5c:
  sw $zero, 76($s3)
L8002ba60:
  addiu $v0, $zero, 8
L8002ba64:
  j L8002ba74
L8002ba68:
  sb $v0, 1($s3)
L8002ba6c:
  addiu $v0, $zero, 1
L8002ba70:
  sb $v0, 0($s3)
L8002ba74:
  lw $ra, 64($sp)
L8002ba78:
  lw $s7, 60($sp)
L8002ba7c:
  lw $s6, 56($sp)
L8002ba80:
  lw $s5, 52($sp)
L8002ba84:
  lw $s4, 48($sp)
L8002ba88:
  lw $s3, 44($sp)
L8002ba8c:
  lw $s2, 40($sp)
L8002ba90:
  lw $s1, 36($sp)
L8002ba94:
  lw $s0, 32($sp)
L8002ba98:
  jr $ra
L8002ba9c:
  addiu $sp, $sp, 72
L8002baa0:
  addiu $v0, $zero, 1
L8002baa4:
  jr $ra
L8002baa8:
  sb $v0, 0($a0)
L8002baac:
  jr $ra
L8002bab0:
  sll $zero, $zero, 0x0
L8002bab4:
  lui $v0, 0x800f
L8002bab8:
  lbu $v1, -24088($v0)
L8002babc:
  addiu $sp, $sp, -40
L8002bac0:
  sw $s1, 20($sp)
L8002bac4:
  addiu $s1, $v0, -24088
L8002bac8:
  sw $s3, 28($sp)
L8002bacc:
  addiu $s3, $zero, 1
L8002bad0:
  sw $ra, 32($sp)
L8002bad4:
  sw $s2, 24($sp)
L8002bad8:
  andi $v1, $v1, 0xf
L8002badc:
  beq $v1, $s3, L8002bb2c
L8002bae0:
  sw $s0, 16($sp)
L8002bae4:
  slti $v0, $v1, 2
L8002bae8:
  beq $v0, $zero, L8002bb00
L8002baec:
  sll $zero, $zero, 0x0
L8002baf0:
  beq $v1, $zero, L8002bb1c
L8002baf4:
  sll $zero, $zero, 0x0
L8002baf8:
  j L8002bcf0
L8002bafc:
  sll $zero, $zero, 0x0
L8002bb00:
  addiu $v0, $zero, 2
L8002bb04:
  beq $v1, $v0, L8002bb3c
L8002bb08:
  addiu $v0, $zero, 3
L8002bb0c:
  beq $v1, $v0, L8002bce8
L8002bb10:
  sll $zero, $zero, 0x0
L8002bb14:
  j L8002bcf0
L8002bb18:
  sll $zero, $zero, 0x0
L8002bb1c:
  jal L8002baa0
L8002bb20:
  addu $a0, $s1, $zero
L8002bb24:
  j L8002bcf0
L8002bb28:
  sll $zero, $zero, 0x0
L8002bb2c:
  jal L8002a788
L8002bb30:
  addu $a0, $s1, $zero
L8002bb34:
  j L8002bcf0
L8002bb38:
  sll $zero, $zero, 0x0
L8002bb3c:
  jal L8002aca4
L8002bb40:
  addu $a0, $s1, $zero
L8002bb44:
  addu $a0, $zero, $zero
L8002bb48:
  lui $v0, 0x800f
L8002bb4c:
  jal 0x80058dd8
L8002bb50:
  addiu $s2, $v0, 10312
L8002bb54:
  addu $s0, $v0, $zero
L8002bb58:
  bne $s0, $s3, L8002bc78
L8002bb5c:
  lui $v1, 0x800f
L8002bb60:
  jal 0x80058e68
L8002bb64:
  addu $a0, $zero, $zero
L8002bb68:
  beq $v0, $s0, L8002bbec
L8002bb6c:
  addu $a0, $zero, $zero
L8002bb70:
  lui $a1, 0x8018
L8002bb74:
  jal 0x80058fb0
L8002bb78:
  ori $a1, $a1, 0x1010
L8002bb7c:
  lui $v1, 0x2aaa
L8002bb80:
  lui $a1, 0x8018
L8002bb84:
  lh $a1, 4114($a1)
L8002bb88:
  lui $v0, 0x8018
L8002bb8c:
  lh $v0, 4098($v0)
L8002bb90:
  ori $v1, $v1, 0xaaab
L8002bb94:
  subu $s0, $a1, $v0
L8002bb98:
  bgez $s0, L8002bba4
L8002bb9c:
  addu $v0, $s0, $zero
L8002bba0:
  subu $v0, $zero, $v0
L8002bba4:
  mult $v0, $v1
L8002bba8:
  lw $a0, 32($s2)
L8002bbac:
  sra $v0, $v0, 0x1f
L8002bbb0:
  mfhi $a3
L8002bbb4:
  sra $v1, $a3, 0x2
L8002bbb8:
  subu $v1, $v1, $v0
L8002bbbc:
  slt $v0, $a1, $a0
L8002bbc0:
  beq $v0, $zero, L8002bbd4
L8002bbc4:
  addiu $v1, $v1, 1
L8002bbc8:
  subu $v0, $a0, $v1
L8002bbcc:
  sw $v0, 32($s2)
L8002bbd0:
  lw $a0, 32($s2)
L8002bbd4:
  sll $zero, $zero, 0x0
L8002bbd8:
  slt $v0, $a0, $a1
L8002bbdc:
  beq $v0, $zero, L8002bc74
L8002bbe0:
  addu $v0, $a0, $v1
L8002bbe4:
  j L8002bc74
L8002bbe8:
  sw $v0, 32($s2)
L8002bbec:
  lw $s0, 32($s2)
L8002bbf0:
  lui $v1, 0x8018
L8002bbf4:
  lh $v1, 4098($v1)
L8002bbf8:
  sll $zero, $zero, 0x0
L8002bbfc:
  beq $s0, $v1, L8002bc30
L8002bc00:
  slt $v0, $v1, $s0
L8002bc04:
  beq $v0, $zero, L8002bc18
L8002bc08:
  sll $zero, $zero, 0x0
L8002bc0c:
  addiu $s0, $s0, -8
L8002bc10:
  j L8002bc20
L8002bc14:
  slt $v0, $s0, $v1
L8002bc18:
  addiu $s0, $s0, 8
L8002bc1c:
  slt $v0, $v1, $s0
L8002bc20:
  beq $v0, $zero, L8002bc2c
L8002bc24:
  sll $zero, $zero, 0x0
L8002bc28:
  addu $s0, $v1, $zero
L8002bc2c:
  sw $s0, 32($s2)
L8002bc30:
  lw $v0, 32($s1)
L8002bc34:
  sll $zero, $zero, 0x0
L8002bc38:
  addiu $v0, $v0, -1
L8002bc3c:
  bgtz $v0, L8002bc74
L8002bc40:
  sw $v0, 32($s1)
L8002bc44:
  addiu $v0, $zero, 300
L8002bc48:
  sw $v0, 32($s1)
L8002bc4c:
  jal 0x8008e590
L8002bc50:
  addiu $s0, $zero, 2
L8002bc54:
  andi $v0, $v0, 0x1
L8002bc58:
  beq $v0, $zero, L8002bc64
L8002bc5c:
  sll $zero, $zero, 0x0
L8002bc60:
  addiu $s0, $zero, 7
L8002bc64:
  addu $a0, $zero, $zero
L8002bc68:
  addu $a1, $s0, $zero
L8002bc6c:
  jal 0x80057af4
L8002bc70:
  addiu $a2, $zero, 1
L8002bc74:
  lui $v1, 0x800f
L8002bc78:
  addiu $v1, $v1, 10312
L8002bc7c:
  lhu $v0, 2($v1)
L8002bc80:
  sll $zero, $zero, 0x0
L8002bc84:
  addiu $v0, $v0, 12
L8002bc88:
  jal 0x8001352c
L8002bc8c:
  sh $v0, 2($v1)
L8002bc90:
  jal 0x800591fc
L8002bc94:
  sll $zero, $zero, 0x0
L8002bc98:
  lw $t0, 16($s2)
L8002bc9c:
  lw $t1, 20($s2)
L8002bca0:
  lw $t2, 24($s2)
L8002bca4:
  lw $a3, 28($s2)
L8002bca8:
  sw $t0, 0($v0)
L8002bcac:
  sw $t1, 4($v0)
L8002bcb0:
  sw $t2, 8($v0)
L8002bcb4:
  sw $a3, 12($v0)
L8002bcb8:
  lw $t0, 32($s2)
L8002bcbc:
  lw $t1, 36($s2)
L8002bcc0:
  lw $t2, 40($s2)
L8002bcc4:
  lw $a3, 44($s2)
L8002bcc8:
  sw $t0, 16($v0)
L8002bccc:
  sw $t1, 20($v0)
L8002bcd0:
  sw $t2, 24($v0)
L8002bcd4:
  sw $a3, 28($v0)
L8002bcd8:
  jal 0x80057f38
L8002bcdc:
  addu $a0, $zero, $zero
L8002bce0:
  j L8002bcf0
L8002bce4:
  sll $zero, $zero, 0x0
L8002bce8:
  jal L8002baac
L8002bcec:
  addu $a0, $s1, $zero
L8002bcf0:
  lw $ra, 32($sp)
L8002bcf4:
  lw $s3, 28($sp)
L8002bcf8:
  lw $s2, 24($sp)
L8002bcfc:
  lw $s1, 20($sp)
L8002bd00:
  lw $s0, 16($sp)
L8002bd04:
  jr $ra
L8002bd08:
  addiu $sp, $sp, 40
L8002bd0c:
  addiu $sp, $sp, -32
L8002bd10:
  sw $s2, 24($sp)
L8002bd14:
  addu $s2, $a0, $zero
L8002bd18:
  sltiu $v0, $a1, 7
L8002bd1c:
  sw $ra, 28($sp)
L8002bd20:
  sw $s1, 20($sp)
L8002bd24:
  beq $v0, $zero, L8002bf24
L8002bd28:
  sw $s0, 16($sp)
L8002bd2c:
  lui $v0, 0x8001
L8002bd30:
  addiu $v0, $v0, 520
L8002bd34:
  sll $v1, $a1, 0x2
L8002bd38:
  addu $v1, $v1, $v0
L8002bd3c:
  lw $v0, 0($v1)
L8002bd40:
  sll $zero, $zero, 0x0
L8002bd44:
  jr $v0
L8002bd48:
  sll $zero, $zero, 0x0
L8002bd4c:
  lui $a0, 0xffdd
L8002bd50:
  ori $a0, $a0, 0xffff
L8002bd54:
  addiu $v0, $zero, 768
L8002bd58:
  sh $v0, 48($s2)
L8002bd5c:
  addiu $v0, $zero, 256
L8002bd60:
  sh $v0, 50($s2)
L8002bd64:
  addiu $v0, $zero, 64
L8002bd68:
  sh $v0, 4($s2)
L8002bd6c:
  lui $v0, 0x800a
L8002bd70:
  lw $v0, -20236($v0)
L8002bd74:
  addiu $v1, $zero, 16
L8002bd78:
  sh $v1, 6($s2)
L8002bd7c:
  and $v0, $v0, $a0
L8002bd80:
  lui $at, 0x800a
L8002bd84:
  sw $v0, -20236($at)
L8002bd88:
  lui $v0, 0x800a
L8002bd8c:
  lw $v0, -20236($v0)
L8002bd90:
  lui $v1, 0x1
L8002bd94:
  or $v0, $v0, $v1
L8002bd98:
  lui $at, 0x800a
L8002bd9c:
  sw $v0, -20236($at)
L8002bda0:
  addiu $v0, $zero, 2
L8002bda4:
  sb $v0, 70($s2)
L8002bda8:
  lui $v0, 0x800a
L8002bdac:
  lw $v0, -20200($v0)
L8002bdb0:
  j L8002bec0
L8002bdb4:
  lui $v1, 0x2
L8002bdb8:
  lui $a0, 0xffdc
L8002bdbc:
  ori $a0, $a0, 0xffff
L8002bdc0:
  j L8002bee0
L8002bdc4:
  addiu $v0, $zero, 8192
L8002bdc8:
  lui $v0, 0x800f
L8002bdcc:
  addiu $a0, $v0, -25232
L8002bdd0:
  addiu $s0, $zero, 256
L8002bdd4:
  sh $s0, -25232($v0)
L8002bdd8:
  addiu $v0, $zero, 240
L8002bddc:
  lui $a1, 0x800a
L8002bde0:
  lw $a1, -20200($a1)
L8002bde4:
  addiu $s1, $zero, 16
L8002bde8:
  sh $v0, 2($a0)
L8002bdec:
  sh $s0, 4($a0)
L8002bdf0:
  jal 0x80081de8
L8002bdf4:
  sh $s1, 6($a0)
L8002bdf8:
  lui $a0, 0xffdd
L8002bdfc:
  ori $a0, $a0, 0xffff
L8002be00:
  lui $a1, 0x1
L8002be04:
  ori $a1, $a1, 0x8000
L8002be08:
  lui $v1, 0x800a
L8002be0c:
  lw $v1, -20236($v1)
L8002be10:
  addiu $v0, $zero, 576
L8002be14:
  sh $v0, 48($s2)
L8002be18:
  sh $s0, 50($s2)
L8002be1c:
  sh $s1, 6($s2)
L8002be20:
  sw $a1, 28($s2)
L8002be24:
  and $v1, $v1, $a0
L8002be28:
  lui $at, 0x800a
L8002be2c:
  sw $v1, -20236($at)
L8002be30:
  lui $v0, 0x800a
L8002be34:
  lw $v0, -20236($v0)
L8002be38:
  lui $v1, 0x1
L8002be3c:
  or $v0, $v0, $v1
L8002be40:
  lui $at, 0x800a
L8002be44:
  sw $v0, -20236($at)
L8002be48:
  addiu $v0, $zero, 2
L8002be4c:
  sb $v0, 70($s2)
L8002be50:
  lui $v1, 0x800a
L8002be54:
  lw $v1, -20200($v1)
L8002be58:
  addiu $v0, $zero, 64
L8002be5c:
  sh $v0, 4($s2)
L8002be60:
  sw $v1, 8($s2)
L8002be64:
  addiu $v1, $v1, 2048
L8002be68:
  j L8002bf24
L8002be6c:
  sw $v1, 12($s2)
L8002be70:
  lui $v0, 0x800f
L8002be74:
  addiu $a0, $v0, -25232
L8002be78:
  lui $a1, 0x800a
L8002be7c:
  lw $a1, -20200($a1)
L8002be80:
  addiu $v1, $zero, 256
L8002be84:
  sh $v1, -25232($v0)
L8002be88:
  addiu $v0, $zero, 246
L8002be8c:
  sh $v0, 2($a0)
L8002be90:
  addiu $v0, $zero, 2
L8002be94:
  sh $v1, 4($a0)
L8002be98:
  jal 0x80081de8
L8002be9c:
  sh $v0, 6($a0)
L8002bea0:
  lui $v1, 0x2
L8002bea4:
  addiu $v0, $zero, 3
L8002bea8:
  sb $v0, 70($s2)
L8002beac:
  lui $v0, 0x800a
L8002beb0:
  lw $v0, -20200($v0)
L8002beb4:
  ori $v1, $v1, 0x6810
L8002beb8:
  sw $v1, 48($s2)
L8002bebc:
  ori $v1, $zero, 0xa000
L8002bec0:
  sw $v1, 28($s2)
L8002bec4:
  sw $v0, 8($s2)
L8002bec8:
  addiu $v0, $v0, 2048
L8002becc:
  j L8002bf24
L8002bed0:
  sw $v0, 12($s2)
L8002bed4:
  lui $a0, 0xffdc
L8002bed8:
  ori $a0, $a0, 0xffff
L8002bedc:
  addiu $v0, $zero, 2048
L8002bee0:
  sw $v0, 28($s2)
L8002bee4:
  lui $v0, 0x800a
L8002bee8:
  lw $v0, -20236($v0)
L8002beec:
  lui $v1, 0x800a
L8002bef0:
  lw $v1, -20200($v1)
L8002bef4:
  and $v0, $v0, $a0
L8002bef8:
  lui $at, 0x800a
L8002befc:
  sw $v0, -20236($at)
L8002bf00:
  addiu $v0, $zero, 1
L8002bf04:
  sw $v1, 12($s2)
L8002bf08:
  sw $v1, 8($s2)
L8002bf0c:
  j L8002bf24
L8002bf10:
  sb $v0, 70($s2)
L8002bf14:
  lui $a1, 0x800a
L8002bf18:
  lw $a1, -20200($a1)
L8002bf1c:
  jal 0x80048d08
L8002bf20:
  addiu $a0, $zero, 1
L8002bf24:
  lw $ra, 28($sp)
L8002bf28:
  lw $s2, 24($sp)
L8002bf2c:
  lw $s1, 20($sp)
L8002bf30:
  lw $s0, 16($sp)
L8002bf34:
  jr $ra
L8002bf38:
  addiu $sp, $sp, 32
L8002bf3c:
  addiu $sp, $sp, -32
L8002bf40:
  lui $v0, 0x801d
L8002bf44:
  sw $s1, 20($sp)
L8002bf48:
  addiu $s1, $v0, 592
L8002bf4c:
  sw $s0, 16($sp)
L8002bf50:
  addu $s0, $zero, $zero
L8002bf54:
  sw $ra, 24($sp)
L8002bf58:
  lbu $v0, 0($s1)
L8002bf5c:
  sll $zero, $zero, 0x0
L8002bf60:
  beq $v0, $zero, L8002bf70
L8002bf64:
  sll $zero, $zero, 0x0
L8002bf68:
  jal L8002cce4
L8002bf6c:
  addiu $a0, $s0, 289
L8002bf70:
  addiu $s0, $s0, 1
L8002bf74:
  slti $v0, $s0, 722
L8002bf78:
  bne $v0, $zero, L8002bf58
L8002bf7c:
  addiu $s1, $s1, 1
L8002bf80:
  lui $v0, 0x801d
L8002bf84:
  addiu $s1, $v0, 512
L8002bf88:
  addu $s0, $zero, $zero
L8002bf8c:
  lhu $v0, 0($s1)
L8002bf90:
  sll $zero, $zero, 0x0
L8002bf94:
  beq $v0, $zero, L8002bfa8
L8002bf98:
  sll $zero, $zero, 0x0
L8002bf9c:
  addu $a0, $v0, $zero
L8002bfa0:
  jal L8002cce4
L8002bfa4:
  addiu $a0, $a0, 288
L8002bfa8:
  addiu $s0, $s0, 1
L8002bfac:
  slti $v0, $s0, 40
L8002bfb0:
  bne $v0, $zero, L8002bf8c
L8002bfb4:
  addiu $s1, $s1, 2
L8002bfb8:
  lw $ra, 24($sp)
L8002bfbc:
  lw $s1, 20($sp)
L8002bfc0:
  lw $s0, 16($sp)
L8002bfc4:
  jr $ra
L8002bfc8:
  addiu $sp, $sp, 32
L8002bfcc:
  addiu $sp, $sp, -64
L8002bfd0:
  sw $ra, 56($sp)
L8002bfd4:
  sw $s5, 52($sp)
L8002bfd8:
  sw $s4, 48($sp)
L8002bfdc:
  sw $s3, 44($sp)
L8002bfe0:
  sw $s2, 40($sp)
L8002bfe4:
  sw $s1, 36($sp)
L8002bfe8:
  sw $s0, 32($sp)
L8002bfec:
  lui $at, 0x800a
L8002bff0:
  sh $zero, -20152($at)
L8002bff4:
  lui $at, 0x800a
L8002bff8:
  sh $zero, -20154($at)
L8002bffc:
  jal L80035668
L8002c000:
  addu $a0, $zero, $zero
L8002c004:
  jal L80029574
L8002c008:
  addu $a0, $zero, $zero
L8002c00c:
  addiu $s3, $zero, 721
L8002c010:
  lui $a0, 0x8018
L8002c014:
  ori $a0, $a0, 0x5a2
L8002c018:
  lui $v1, 0x800f
L8002c01c:
  addiu $v1, $v1, -24344
L8002c020:
  addiu $v0, $zero, 256
L8002c024:
  sh $v0, 40($v1)
L8002c028:
  sh $v0, 42($v1)
L8002c02c:
  addiu $v0, $zero, 512
L8002c030:
  sh $v0, 44($v1)
L8002c034:
  addiu $v0, $zero, 240
L8002c038:
  sh $v0, 46($v1)
L8002c03c:
  addiu $v0, $s3, 1
L8002c040:
  sh $v0, 0($a0)
L8002c044:
  addiu $s3, $s3, -1
L8002c048:
  bgez $s3, L8002c03c
L8002c04c:
  addiu $a0, $a0, -2
L8002c050:
  addu $a0, $zero, $zero
L8002c054:
  addu $a1, $a0, $zero
L8002c058:
  addiu $a2, $zero, 7629
L8002c05c:
  addiu $a3, $zero, 138
L8002c060:
  lui $v0, 0x8003
L8002c064:
  addiu $v0, $v0, -17140
L8002c068:
  sw $v0, 16($sp)
L8002c06c:
  sw $zero, 20($sp)
L8002c070:
  jal 0x80014e1c
L8002c074:
  sw $zero, 24($sp)
L8002c078:
  jal 0x800137e4
L8002c07c:
  sll $zero, $zero, 0x0
L8002c080:
  jal L8002bf3c
L8002c084:
  sll $zero, $zero, 0x0
L8002c088:
  lui $v1, 0x800f
L8002c08c:
  lui $v0, 0x8003
L8002c090:
  addiu $v0, $v0, -24892
L8002c094:
  jal L80029590
L8002c098:
  sw $v0, -25156($v1)
L8002c09c:
  lui $v0, 0x800f
L8002c0a0:
  lbu $v1, 848($gp)
L8002c0a4:
  addiu $s5, $v0, -24088
L8002c0a8:
  sb $zero, -24088($v0)
L8002c0ac:
  sll $a1, $v1, 0x18
L8002c0b0:
  sra $a0, $a1, 0x18
L8002c0b4:
  slti $v0, $a0, 10
L8002c0b8:
  bne $v0, $zero, L8002c100
L8002c0bc:
  addu $a2, $a0, $zero
L8002c0c0:
  lui $v0, 0x6666
L8002c0c4:
  ori $v0, $v0, 0x6667
L8002c0c8:
  mult $a0, $v0
L8002c0cc:
  sra $v0, $a1, 0x1f
L8002c0d0:
  mfhi $t4
L8002c0d4:
  sra $v1, $t4, 0x2
L8002c0d8:
  subu $v1, $v1, $v0
L8002c0dc:
  sll $v0, $v1, 0x2
L8002c0e0:
  addu $v0, $v0, $v1
L8002c0e4:
  sll $v0, $v0, 0x1
L8002c0e8:
  subu $v0, $a0, $v0
L8002c0ec:
  sll $v1, $v0, 0x3
L8002c0f0:
  subu $v1, $v1, $v0
L8002c0f4:
  sll $v1, $v1, 0x1
L8002c0f8:
  j L8002c13c
L8002c0fc:
  addiu $a1, $v1, 174
L8002c100:
  lui $v0, 0x6666
L8002c104:
  ori $v0, $v0, 0x6667
L8002c108:
  mult $a2, $v0
L8002c10c:
  sra $v0, $a1, 0x1f
L8002c110:
  mfhi $t4
L8002c114:
  sra $v1, $t4, 0x2
L8002c118:
  subu $v1, $v1, $v0
L8002c11c:
  sll $v0, $v1, 0x2
L8002c120:
  addu $v0, $v0, $v1
L8002c124:
  sll $v0, $v0, 0x1
L8002c128:
  subu $v0, $a2, $v0
L8002c12c:
  sll $v1, $v0, 0x3
L8002c130:
  subu $v1, $v1, $v0
L8002c134:
  sll $v1, $v1, 0x1
L8002c138:
  addiu $a1, $v1, 14
L8002c13c:
  lui $v1, 0x6666
L8002c140:
  lbu $v0, 849($gp)
L8002c144:
  ori $v1, $v1, 0x6667
L8002c148:
  sll $v0, $v0, 0x18
L8002c14c:
  sra $a2, $v0, 0x18
L8002c150:
  mult $a2, $v1
L8002c154:
  addu $a0, $s5, $zero
L8002c158:
  sh $a1, 18($s5)
L8002c15c:
  sh $a1, 8($s5)
L8002c160:
  sra $v0, $v0, 0x1f
L8002c164:
  mfhi $t4
L8002c168:
  sra $a1, $t4, 0x2
L8002c16c:
  subu $a1, $a1, $v0
L8002c170:
  sll $v0, $a1, 0x1
L8002c174:
  addu $v0, $v0, $a1
L8002c178:
  sll $v0, $v0, 0x2
L8002c17c:
  subu $v0, $v0, $a1
L8002c180:
  sll $v0, $v0, 0x3
L8002c184:
  addu $v0, $v0, $a1
L8002c188:
  sll $v0, $v0, 0x1
L8002c18c:
  sll $v1, $a1, 0x2
L8002c190:
  addu $v1, $v1, $a1
L8002c194:
  sll $v1, $v1, 0x1
L8002c198:
  subu $a2, $a2, $v1
L8002c19c:
  sll $a2, $a2, 0x4
L8002c1a0:
  addu $v0, $v0, $a2
L8002c1a4:
  addiu $v0, $v0, 14
L8002c1a8:
  sh $v0, 20($s5)
L8002c1ac:
  jal L8002a660
L8002c1b0:
  sh $v0, 10($s5)
L8002c1b4:
  jal 0x8004002c
L8002c1b8:
  addiu $s0, $zero, 2
L8002c1bc:
  addu $a0, $v0, $zero
L8002c1c0:
  jal 0x800400ac
L8002c1c4:
  addiu $a1, $zero, 2
L8002c1c8:
  addu $s4, $v0, $zero
L8002c1cc:
  addu $a0, $s4, $zero
L8002c1d0:
  addiu $a1, $zero, 16
L8002c1d4:
  addiu $a2, $zero, 216
L8002c1d8:
  addu $a3, $zero, $zero
L8002c1dc:
  addiu $v0, $zero, 1
L8002c1e0:
  addiu $s1, $zero, 27
L8002c1e4:
  sw $v0, 20($sp)
L8002c1e8:
  addiu $v0, $zero, 295
L8002c1ec:
  sw $s0, 16($sp)
L8002c1f0:
  sw $s1, 24($sp)
L8002c1f4:
  jal 0x800404cc
L8002c1f8:
  sw $v0, 28($sp)
L8002c1fc:
  addu $a0, $s4, $zero
L8002c200:
  addiu $s2, $zero, 128
L8002c204:
  jal 0x80042918
L8002c208:
  sb $s2, 95($s4)
L8002c20c:
  lhu $v0, 8($s4)
L8002c210:
  addiu $s3, $zero, 1
L8002c214:
  ori $v0, $v0, 0x8
L8002c218:
  sh $v0, 8($s4)
L8002c21c:
  jal 0x8004002c
L8002c220:
  sw $s4, 72($s5)
L8002c224:
  addu $a0, $v0, $zero
L8002c228:
  jal 0x800400ac
L8002c22c:
  addu $a1, $s0, $zero
L8002c230:
  addu $s4, $v0, $zero
L8002c234:
  addu $a0, $s4, $zero
L8002c238:
  addiu $v0, $zero, 327
L8002c23c:
  sw $s0, 16($sp)
L8002c240:
  sw $s0, 20($sp)
L8002c244:
  sw $s1, 24($sp)
L8002c248:
  sw $v0, 28($sp)
L8002c24c:
  lh $a1, 8($s5)
L8002c250:
  lh $a2, 10($s5)
L8002c254:
  jal 0x800404cc
L8002c258:
  addu $a3, $zero, $zero
L8002c25c:
  lui $v0, 0x801d
L8002c260:
  addiu $t3, $v0, 16964
L8002c264:
  addiu $t2, $zero, 21
L8002c268:
  addiu $t1, $zero, 20
L8002c26c:
  addiu $t0, $zero, 22
L8002c270:
  addiu $a3, $zero, 23
L8002c274:
  addiu $a2, $zero, 368
L8002c278:
  addiu $a0, $s5, 4
L8002c27c:
  addu $a1, $zero, $zero
L8002c280:
  sb $s2, 95($s4)
L8002c284:
  sw $s4, 68($s5)
L8002c288:
  sb $zero, 86($s5)
L8002c28c:
  sh $zero, 84($s5)
L8002c290:
  addu $v0, $a1, $t3
L8002c294:
  sb $zero, 86($a0)
L8002c298:
  sh $zero, 84($s5)
L8002c29c:
  lw $v0, 0($v0)
L8002c2a0:
  sll $zero, $zero, 0x0
L8002c2a4:
  sra $v0, $v0, 0x1a
L8002c2a8:
  andi $v1, $v0, 0x1f
L8002c2ac:
  beq $v1, $t2, L8002c2e4
L8002c2b0:
  slti $v0, $v1, 22
L8002c2b4:
  beq $v0, $zero, L8002c2cc
L8002c2b8:
  sll $zero, $zero, 0x0
L8002c2bc:
  beq $v1, $t1, L8002c2dc
L8002c2c0:
  addiu $v0, $zero, 352
L8002c2c4:
  j L8002c2ec
L8002c2c8:
  sh $v0, 84($a0)
L8002c2cc:
  beq $v1, $t0, L8002c2e8
L8002c2d0:
  addiu $v0, $zero, 400
L8002c2d4:
  bne $v1, $a3, L8002c2e8
L8002c2d8:
  addiu $v0, $zero, 352
L8002c2dc:
  j L8002c2ec
L8002c2e0:
  sh $a2, 84($a0)
L8002c2e4:
  addiu $v0, $zero, 384
L8002c2e8:
  sh $v0, 84($a0)
L8002c2ec:
  addiu $a0, $a0, 4
L8002c2f0:
  addiu $s3, $s3, 1
L8002c2f4:
  slti $v0, $s3, 723
L8002c2f8:
  bne $v0, $zero, L8002c290
L8002c2fc:
  addiu $a1, $a1, 4
L8002c300:
  lui $v0, 0x801d
L8002c304:
  sw $zero, 22024($v0)
L8002c308:
  addiu $s3, $zero, 1
L8002c30c:
  addu $s1, $v0, $zero
L8002c310:
  addiu $s2, $zero, 128
L8002c314:
  addiu $s0, $s5, 4
L8002c318:
  jal L8002cca8
L8002c31c:
  addiu $a0, $s3, 288
L8002c320:
  beq $v0, $zero, L8002c358
L8002c324:
  addu $a0, $s3, $zero
L8002c328:
  lw $v0, 22024($s1)
L8002c32c:
  sll $zero, $zero, 0x0
L8002c330:
  addiu $v0, $v0, 1
L8002c334:
  sw $v0, 22024($s1)
L8002c338:
  jal L8002c518
L8002c33c:
  sb $s2, 86($s0)
L8002c340:
  bgez $v0, L8002c358
L8002c344:
  sll $zero, $zero, 0x0
L8002c348:
  lbu $v0, 86($s0)
L8002c34c:
  sll $zero, $zero, 0x0
L8002c350:
  ori $v0, $v0, 0x1
L8002c354:
  sb $v0, 86($s0)
L8002c358:
  addiu $s3, $s3, 1
L8002c35c:
  slti $v0, $s3, 723
L8002c360:
  bne $v0, $zero, L8002c318
L8002c364:
  addiu $s0, $s0, 4
L8002c368:
  addiu $a0, $zero, 3
L8002c36c:
  jal L8003b6ac
L8002c370:
  addiu $a1, $zero, 1
L8002c374:
  addiu $a0, $zero, 3
L8002c378:
  addiu $a1, $zero, 248
L8002c37c:
  addiu $a2, $zero, 88
L8002c380:
  addiu $a3, $zero, -24
L8002c384:
  addiu $v0, $zero, 144
L8002c388:
  addiu $s1, $zero, 16
L8002c38c:
  sw $v0, 16($sp)
L8002c390:
  jal L80035be4
L8002c394:
  sw $s1, 20($sp)
L8002c398:
  addu $s0, $v0, $zero
L8002c39c:
  addu $a0, $s0, $zero
L8002c3a0:
  sb $s1, 90($s0)
L8002c3a4:
  jal L80039a14
L8002c3a8:
  sb $s1, 91($s0)
L8002c3ac:
  lw $a0, 40($s0)
L8002c3b0:
  jal 0x8004293c
L8002c3b4:
  sll $zero, $zero, 0x0
L8002c3b8:
  lw $v1, 40($s0)
L8002c3bc:
  sll $zero, $zero, 0x0
L8002c3c0:
  lhu $v0, 8($v1)
L8002c3c4:
  addu $a0, $s5, $zero
L8002c3c8:
  andi $v0, $v0, 0xfff7
L8002c3cc:
  jal L8002a2f4
L8002c3d0:
  sh $v0, 8($v1)
L8002c3d4:
  jal L8003ff08
L8002c3d8:
  addiu $a0, $zero, 29392
L8002c3dc:
  lw $ra, 56($sp)
L8002c3e0:
  lw $s5, 52($sp)
L8002c3e4:
  lw $s4, 48($sp)
L8002c3e8:
  lw $s3, 44($sp)
L8002c3ec:
  lw $s2, 40($sp)
L8002c3f0:
  lw $s1, 36($sp)
L8002c3f4:
  lw $s0, 32($sp)
L8002c3f8:
  jr $ra
L8002c3fc:
  addiu $sp, $sp, 64
L8002c400:
  slti $v0, $a0, 10
L8002c404:
  beq $v0, $zero, L8002c448
L8002c408:
  sra $v1, $a0, 0x1f
L8002c40c:
  lui $v0, 0x6666
L8002c410:
  ori $v0, $v0, 0x6667
L8002c414:
  mult $a0, $v0
L8002c418:
  mfhi $a1
L8002c41c:
  sra $v0, $a1, 0x2
L8002c420:
  subu $v0, $v0, $v1
L8002c424:
  sll $v1, $v0, 0x2
L8002c428:
  addu $v1, $v1, $v0
L8002c42c:
  sll $v1, $v1, 0x1
L8002c430:
  subu $v1, $a0, $v1
L8002c434:
  sll $v0, $v1, 0x3
L8002c438:
  subu $v0, $v0, $v1
L8002c43c:
  sll $v0, $v0, 0x1
L8002c440:
  jr $ra
L8002c444:
  addiu $v0, $v0, 14
L8002c448:
  lui $v0, 0x6666
L8002c44c:
  ori $v0, $v0, 0x6667
L8002c450:
  mult $a0, $v0
L8002c454:
  mfhi $a1
L8002c458:
  sra $v0, $a1, 0x2
L8002c45c:
  subu $v0, $v0, $v1
L8002c460:
  sll $v1, $v0, 0x2
L8002c464:
  addu $v1, $v1, $v0
L8002c468:
  sll $v1, $v1, 0x1
L8002c46c:
  subu $v1, $a0, $v1
L8002c470:
  sll $v0, $v1, 0x3
L8002c474:
  subu $v0, $v0, $v1
L8002c478:
  sll $v0, $v0, 0x1
L8002c47c:
  jr $ra
L8002c480:
  addiu $v0, $v0, 174
L8002c484:
  lui $v0, 0x6666
L8002c488:
  ori $v0, $v0, 0x6667
L8002c48c:
  mult $a0, $v0
L8002c490:
  sra $v0, $a0, 0x1f
L8002c494:
  mfhi $a2
L8002c498:
  sra $a1, $a2, 0x2
L8002c49c:
  subu $a1, $a1, $v0
L8002c4a0:
  sll $v0, $a1, 0x1
L8002c4a4:
  addu $v0, $v0, $a1
L8002c4a8:
  sll $v0, $v0, 0x2
L8002c4ac:
  subu $v0, $v0, $a1
L8002c4b0:
  sll $v0, $v0, 0x3
L8002c4b4:
  addu $v0, $v0, $a1
L8002c4b8:
  sll $v0, $v0, 0x1
L8002c4bc:
  sll $v1, $a1, 0x2
L8002c4c0:
  addu $v1, $v1, $a1
L8002c4c4:
  sll $v1, $v1, 0x1
L8002c4c8:
  subu $a0, $a0, $v1
L8002c4cc:
  sll $a0, $a0, 0x4
L8002c4d0:
  addu $v0, $v0, $a0
L8002c4d4:
  jr $ra
L8002c4d8:
  addiu $v0, $v0, 14
L8002c4dc:
  lui $v0, 0x801d
L8002c4e0:
  addiu $a1, $v0, 512
L8002c4e4:
  addu $v1, $zero, $zero
L8002c4e8:
  lhu $v0, 0($a1)
L8002c4ec:
  sll $zero, $zero, 0x0
L8002c4f0:
  beq $v0, $a0, L8002c510
L8002c4f4:
  addu $v0, $v1, $zero
L8002c4f8:
  addiu $v1, $v1, 1
L8002c4fc:
  slti $v0, $v1, 40
L8002c500:
  bne $v0, $zero, L8002c4e8
L8002c504:
  addiu $a1, $a1, 2
L8002c508:
  jr $ra
L8002c50c:
  addiu $v0, $zero, -1
L8002c510:
  jr $ra
L8002c514:
  sll $zero, $zero, 0x0
L8002c518:
  addiu $sp, $sp, -24
L8002c51c:
  lui $v0, 0x801d
L8002c520:
  addiu $v0, $v0, 0
L8002c524:
  addu $v0, $a0, $v0
L8002c528:
  sw $ra, 16($sp)
L8002c52c:
  lbu $v0, 591($v0)
L8002c530:
  sll $zero, $zero, 0x0
L8002c534:
  beq $v0, $zero, L8002c540
L8002c538:
  addiu $v1, $zero, -1
L8002c53c:
  addiu $v1, $zero, 1
L8002c540:
  bgez $v1, L8002c550
L8002c544:
  addiu $v0, $zero, 1
L8002c548:
  jal L8002c4dc
L8002c54c:
  sll $zero, $zero, 0x0
L8002c550:
  lw $ra, 16($sp)
L8002c554:
  sll $zero, $zero, 0x0
L8002c558:
  jr $ra
L8002c55c:
  addiu $sp, $sp, 24
L8002c560:
  jr $ra
L8002c564:
  sll $zero, $zero, 0x0
L8002c568:
  jr $ra
L8002c56c:
  sll $zero, $zero, 0x0
L8002c570:
  lui $v0, 0x801d
L8002c574:
  addiu $v0, $v0, 0
L8002c578:
  addu $a0, $a0, $v0
L8002c57c:
  lbu $v1, 591($a0)
L8002c580:
  sll $zero, $zero, 0x0
L8002c584:
  bne $v1, $zero, L8002c590
L8002c588:
  addiu $v0, $zero, 1
L8002c58c:
  addiu $v0, $zero, -1
L8002c590:
  jr $ra
L8002c594:
  sll $zero, $zero, 0x0
L8002c598:
  sb $zero, 856($gp)
L8002c59c:
  addiu $v1, $zero, 8
L8002c5a0:
  addiu $a0, $zero, -1
L8002c5a4:
  lui $v0, 0x800f
L8002c5a8:
  addiu $v0, $v0, -21112
L8002c5ac:
  addiu $v0, $v0, 24
L8002c5b0:
  sb $zero, 4($v0)
L8002c5b4:
  sh $a0, 0($v0)
L8002c5b8:
  addiu $v1, $v1, -1
L8002c5bc:
  bne $v1, $zero, L8002c5b0
L8002c5c0:
  addiu $v0, $v0, 32
L8002c5c4:
  jr $ra
L8002c5c8:
  sll $zero, $zero, 0x0
L8002c5cc:
  lui $v0, 0x800f
L8002c5d0:
  addiu $v1, $v0, -21112
L8002c5d4:
  addiu $a0, $zero, 8
L8002c5d8:
  lbu $v0, 28($v1)
L8002c5dc:
  sll $zero, $zero, 0x0
L8002c5e0:
  andi $v0, $v0, 0x80
L8002c5e4:
  bne $v0, $zero, L8002c5f4
L8002c5e8:
  addiu $a0, $a0, -1
L8002c5ec:
  jr $ra
L8002c5f0:
  addu $v0, $v1, $zero
L8002c5f4:
  bne $a0, $zero, L8002c5d8
L8002c5f8:
  addiu $v1, $v1, 32
L8002c5fc:
  jr $ra
L8002c600:
  addu $v0, $zero, $zero
L8002c604:
  addiu $sp, $sp, -24
L8002c608:
  sw $s0, 16($sp)
L8002c60c:
  sw $ra, 20($sp)
L8002c610:
  jal L8002c5cc
L8002c614:
  addu $s0, $a0, $zero
L8002c618:
  addu $a0, $v0, $zero
L8002c61c:
  beq $a0, $zero, L8002c678
L8002c620:
  addiu $v0, $zero, 128
L8002c624:
  lui $v1, 0x8001
L8002c628:
  lw $v1, 0($v1)
L8002c62c:
  sb $v0, 28($a0)
L8002c630:
  lui $v0, 0x800f
L8002c634:
  addiu $v0, $v0, -25200
L8002c638:
  sh $s0, 24($a0)
L8002c63c:
  sh $zero, 26($a0)
L8002c640:
  sb $zero, 29($a0)
L8002c644:
  addiu $v1, $v1, 14336
L8002c648:
  sw $v1, 20($a0)
L8002c64c:
  lw $v1, 8($v0)
L8002c650:
  sll $zero, $zero, 0x0
L8002c654:
  sw $v1, 8($a0)
L8002c658:
  lw $v1, 4($v0)
L8002c65c:
  addiu $v0, $zero, 8
L8002c660:
  sh $v0, 16($a0)
L8002c664:
  sh $zero, 0($a0)
L8002c668:
  sh $zero, 2($a0)
L8002c66c:
  sh $zero, 4($a0)
L8002c670:
  sh $zero, 18($a0)
L8002c674:
  sw $v1, 12($a0)
L8002c678:
  lw $ra, 20($sp)
L8002c67c:
  lw $s0, 16($sp)
L8002c680:
  addu $v0, $a0, $zero
L8002c684:
  jr $ra
L8002c688:
  addiu $sp, $sp, 24
L8002c68c:
  addiu $sp, $sp, -24
L8002c690:
  sw $ra, 16($sp)
L8002c694:
  jal L8002c604
L8002c698:
  sll $zero, $zero, 0x0
L8002c69c:
  addu $v1, $v0, $zero
L8002c6a0:
  beq $v1, $zero, L8002c6b8
L8002c6a4:
  sll $zero, $zero, 0x0
L8002c6a8:
  lbu $v0, 856($gp)
L8002c6ac:
  sll $zero, $zero, 0x0
L8002c6b0:
  ori $v0, $v0, 0x80
L8002c6b4:
  sb $v0, 856($gp)
L8002c6b8:
  lw $ra, 16($sp)
L8002c6bc:
  addu $v0, $v1, $zero
L8002c6c0:
  jr $ra
L8002c6c4:
  addiu $sp, $sp, 24
L8002c6c8:
  addiu $sp, $sp, -40
L8002c6cc:
  lui $v0, 0x800f
L8002c6d0:
  sw $s1, 20($sp)
L8002c6d4:
  addiu $s1, $v0, -21112
L8002c6d8:
  lui $v0, 0x800f
L8002c6dc:
  sw $s3, 28($sp)
L8002c6e0:
  addiu $s3, $v0, -25200
L8002c6e4:
  lui $v0, 0x800f
L8002c6e8:
  sw $s4, 32($sp)
L8002c6ec:
  addiu $s4, $v0, 10312
L8002c6f0:
  lbu $v0, 856($gp)
L8002c6f4:
  sw $s2, 24($sp)
L8002c6f8:
  addiu $s2, $zero, 8
L8002c6fc:
  sw $s0, 16($sp)
L8002c700:
  addiu $s0, $s1, 28
L8002c704:
  sw $ra, 36($sp)
L8002c708:
  andi $v0, $v0, 0xfe
L8002c70c:
  sb $v0, 856($gp)
L8002c710:
  lbu $v1, 0($s0)
L8002c714:
  sll $zero, $zero, 0x0
L8002c718:
  andi $v0, $v1, 0x80
L8002c71c:
  beq $v0, $zero, L8002c7b0
L8002c720:
  andi $v0, $v1, 0x20
L8002c724:
  bne $v0, $zero, L8002c73c
L8002c728:
  sll $zero, $zero, 0x0
L8002c72c:
  lbu $v0, 856($gp)
L8002c730:
  sll $zero, $zero, 0x0
L8002c734:
  ori $v0, $v0, 0x1
L8002c738:
  sb $v0, 856($gp)
L8002c73c:
  sb $zero, 857($gp)
L8002c740:
  lbu $v1, 0($s0)
L8002c744:
  lh $a1, -2($s0)
L8002c748:
  andi $v0, $v1, 0x40
L8002c74c:
  bne $v0, $zero, L8002c760
L8002c750:
  ori $v0, $v1, 0x40
L8002c754:
  sb $v0, 0($s0)
L8002c758:
  addiu $v0, $zero, -1
L8002c75c:
  sh $v0, -2($s0)
L8002c760:
  lw $v0, 4($s3)
L8002c764:
  lh $a0, -4($s0)
L8002c768:
  lw $a2, -8($s0)
L8002c76c:
  sw $v0, -16($s0)
L8002c770:
  lw $v0, 8($s3)
L8002c774:
  addu $a3, $s1, $zero
L8002c778:
  sw $s1, 860($gp)
L8002c77c:
  jal 0x801462b0
L8002c780:
  sw $v0, -20($s0)
L8002c784:
  addu $a0, $zero, $zero
L8002c788:
  jal 0x800878b0
L8002c78c:
  addu $a1, $a0, $zero
L8002c790:
  lh $a0, 14($s4)
L8002c794:
  jal 0x800878d0
L8002c798:
  sll $zero, $zero, 0x0
L8002c79c:
  lbu $v1, 857($gp)
L8002c7a0:
  addiu $v0, $zero, 1
L8002c7a4:
  bne $v1, $v0, L8002c7b0
L8002c7a8:
  sll $zero, $zero, 0x0
L8002c7ac:
  sb $zero, 0($s0)
L8002c7b0:
  addiu $s0, $s0, 32
L8002c7b4:
  addiu $s2, $s2, -1
L8002c7b8:
  bne $s2, $zero, L8002c710
L8002c7bc:
  addiu $s1, $s1, 32
L8002c7c0:
  lbu $v0, 856($gp)
L8002c7c4:
  lw $ra, 36($sp)
L8002c7c8:
  lw $s4, 32($sp)
L8002c7cc:
  lw $s3, 28($sp)
L8002c7d0:
  lw $s2, 24($sp)
L8002c7d4:
  lw $s1, 20($sp)
L8002c7d8:
  lw $s0, 16($sp)
L8002c7dc:
  andi $v0, $v0, 0x1
L8002c7e0:
  jr $ra
L8002c7e4:
  addiu $sp, $sp, 40
L8002c7e8:
  addiu $sp, $sp, -40
L8002c7ec:
  lui $v0, 0x8018
L8002c7f0:
  addiu $t4, $v0, -26152
L8002c7f4:
  lhu $v0, 0($t4)
L8002c7f8:
  sll $zero, $zero, 0x0
L8002c7fc:
  beq $v0, $zero, L8002c8d0
L8002c800:
  sll $zero, $zero, 0x0
L8002c804:
  beq $v0, $a1, L8002c814
L8002c808:
  sll $zero, $zero, 0x0
L8002c80c:
  j L8002c7f4
L8002c810:
  addiu $t4, $t4, 10
L8002c814:
  lui $v0, 0x800a
L8002c818:
  lbu $v0, -20011($v0)
L8002c81c:
  sll $zero, $zero, 0x0
L8002c820:
  beq $v0, $zero, L8002c82c
L8002c824:
  addiu $a3, $zero, 5
L8002c828:
  addiu $a3, $zero, 20
L8002c82c:
  sll $v1, $a3, 0x3
L8002c830:
  subu $v1, $v1, $a3
L8002c834:
  sll $v1, $v1, 0x2
L8002c838:
  lui $v0, 0x801a
L8002c83c:
  addiu $v0, $v0, 31448
L8002c840:
  addu $a1, $v1, $v0
L8002c844:
  addu $a3, $zero, $zero
L8002c848:
  addiu $v1, $sp, 16
L8002c84c:
  sw $zero, 0($v1)
L8002c850:
  lhu $v0, 22($a1)
L8002c854:
  sll $zero, $zero, 0x0
L8002c858:
  andi $v0, $v0, 0x8000
L8002c85c:
  beq $v0, $zero, L8002c868
L8002c860:
  sll $zero, $zero, 0x0
L8002c864:
  sw $a1, 0($v1)
L8002c868:
  addiu $v1, $v1, 4
L8002c86c:
  addiu $a3, $a3, 1
L8002c870:
  slti $v0, $a3, 5
L8002c874:
  bne $v0, $zero, L8002c84c
L8002c878:
  addiu $a1, $a1, 28
L8002c87c:
  addiu $t4, $t4, 2
L8002c880:
  addu $t3, $zero, $zero
L8002c884:
  addiu $t5, $sp, 16
L8002c888:
  addu $t2, $sp, $zero
L8002c88c:
  addu $t1, $t4, $zero
L8002c890:
  addu $a3, $zero, $zero
L8002c894:
  addu $t0, $t5, $zero
L8002c898:
  addu $a2, $t0, $zero
L8002c89c:
  lw $a1, 0($a2)
L8002c8a0:
  sll $zero, $zero, 0x0
L8002c8a4:
  beq $a1, $zero, L8002c8c0
L8002c8a8:
  sll $zero, $zero, 0x0
L8002c8ac:
  lh $v1, 12($a1)
L8002c8b0:
  lhu $v0, 0($t1)
L8002c8b4:
  sll $zero, $zero, 0x0
L8002c8b8:
  beq $v1, $v0, L8002c8d8
L8002c8bc:
  sll $zero, $zero, 0x0
L8002c8c0:
  addiu $a3, $a3, 1
L8002c8c4:
  slti $v0, $a3, 5
L8002c8c8:
  bne $v0, $zero, L8002c898
L8002c8cc:
  addiu $t0, $a2, 4
L8002c8d0:
  j L8002c930
L8002c8d4:
  addu $v0, $zero, $zero
L8002c8d8:
  sw $a1, 0($t2)
L8002c8dc:
  addiu $t2, $t2, 4
L8002c8e0:
  addiu $t1, $t1, 2
L8002c8e4:
  addiu $t3, $t3, 1
L8002c8e8:
  slti $v0, $t3, 3
L8002c8ec:
  bne $v0, $zero, L8002c890
L8002c8f0:
  sw $zero, 0($t0)
L8002c8f4:
  beq $a0, $zero, L8002c92c
L8002c8f8:
  sll $zero, $zero, 0x0
L8002c8fc:
  addu $a3, $zero, $zero
L8002c900:
  addu $a1, $a0, $zero
L8002c904:
  addu $v1, $sp, $zero
L8002c908:
  lw $v0, 0($v1)
L8002c90c:
  addiu $v1, $v1, 4
L8002c910:
  lw $v0, 0($v0)
L8002c914:
  addiu $a3, $a3, 1
L8002c918:
  sw $v0, 0($a1)
L8002c91c:
  slti $v0, $a3, 3
L8002c920:
  bne $v0, $zero, L8002c908
L8002c924:
  addiu $a1, $a1, 4
L8002c928:
  sw $zero, 12($a0)
L8002c92c:
  lhu $v0, 6($t4)
L8002c930:
  jr $ra
L8002c934:
  addiu $sp, $sp, 40
L8002c938:
  lui $v0, 0x800a
L8002c93c:
  lbu $v0, -20011($v0)
L8002c940:
  sll $zero, $zero, 0x0
L8002c944:
  beq $v0, $zero, L8002c950
L8002c948:
  addiu $a2, $zero, 20
L8002c94c:
  addiu $a2, $zero, 5
L8002c950:
  beq $a1, $zero, L8002c960
L8002c954:
  sll $v1, $a2, 0x3
L8002c958:
  addiu $a2, $a2, 5
L8002c95c:
  sll $v1, $a2, 0x3
L8002c960:
  subu $v1, $v1, $a2
L8002c964:
  sll $v1, $v1, 0x2
L8002c968:
  lui $v0, 0x801a
L8002c96c:
  addiu $v0, $v0, 31448
L8002c970:
  addu $v1, $v1, $v0
L8002c974:
  addu $a2, $zero, $zero
L8002c978:
  lhu $v0, 22($v1)
L8002c97c:
  sll $zero, $zero, 0x0
L8002c980:
  andi $v0, $v0, 0x8000
L8002c984:
  beq $v0, $zero, L8002c99c
L8002c988:
  sll $zero, $zero, 0x0
L8002c98c:
  lw $v0, 0($v1)
L8002c990:
  sll $zero, $zero, 0x0
L8002c994:
  sw $v0, 0($a0)
L8002c998:
  addiu $a0, $a0, 4
L8002c99c:
  addiu $a2, $a2, 1
L8002c9a0:
  slti $v0, $a2, 5
L8002c9a4:
  bne $v0, $zero, L8002c978
L8002c9a8:
  addiu $v1, $v1, 28
L8002c9ac:
  jr $ra
L8002c9b0:
  sw $zero, 0($a0)
L8002c9b4:
  addiu $sp, $sp, -40
L8002c9b8:
  sw $s2, 24($sp)
L8002c9bc:
  addu $s2, $a0, $zero
L8002c9c0:
  sw $s3, 28($sp)
L8002c9c4:
  addu $s3, $a1, $zero
L8002c9c8:
  sw $ra, 32($sp)
L8002c9cc:
  sw $s1, 20($sp)
L8002c9d0:
  bgez $s3, L8002ca4c
L8002c9d4:
  sw $s0, 16($sp)
L8002c9d8:
  lui $v0, 0x801a
L8002c9dc:
  addiu $s0, $v0, 31588
L8002c9e0:
  addiu $v1, $s0, 420
L8002c9e4:
  addu $s1, $zero, $zero
L8002c9e8:
  lhu $v0, 22($s0)
L8002c9ec:
  sll $zero, $zero, 0x0
L8002c9f0:
  andi $v0, $v0, 0x8000
L8002c9f4:
  beq $v0, $zero, L8002ca0c
L8002c9f8:
  sll $zero, $zero, 0x0
L8002c9fc:
  lw $v0, 0($s0)
L8002ca00:
  sll $zero, $zero, 0x0
L8002ca04:
  sw $v0, 0($s2)
L8002ca08:
  addiu $s2, $s2, 4
L8002ca0c:
  lhu $v0, 22($v1)
L8002ca10:
  sll $zero, $zero, 0x0
L8002ca14:
  andi $v0, $v0, 0x8000
L8002ca18:
  beq $v0, $zero, L8002ca30
L8002ca1c:
  sll $zero, $zero, 0x0
L8002ca20:
  lw $v0, 0($v1)
L8002ca24:
  sll $zero, $zero, 0x0
L8002ca28:
  sw $v0, 0($s2)
L8002ca2c:
  addiu $s2, $s2, 4
L8002ca30:
  addiu $s1, $s1, 1
L8002ca34:
  addiu $s0, $s0, 28
L8002ca38:
  slti $v0, $s1, 10
L8002ca3c:
  bne $v0, $zero, L8002c9e8
L8002ca40:
  addiu $v1, $v1, 28
L8002ca44:
  j L8002cb34
L8002ca48:
  sw $zero, 0($s2)
L8002ca4c:
  lui $v0, 0x800a
L8002ca50:
  lbu $v0, -20011($v0)
L8002ca54:
  sll $zero, $zero, 0x0
L8002ca58:
  beq $v0, $zero, L8002ca64
L8002ca5c:
  addiu $s1, $zero, 20
L8002ca60:
  addiu $s1, $zero, 5
L8002ca64:
  sll $v0, $s1, 0x3
L8002ca68:
  subu $v0, $v0, $s1
L8002ca6c:
  sll $v0, $v0, 0x2
L8002ca70:
  lui $v1, 0x801a
L8002ca74:
  addiu $v1, $v1, 31448
L8002ca78:
  addu $s0, $v0, $v1
L8002ca7c:
  slti $v0, $s3, 21
L8002ca80:
  bne $v0, $zero, L8002cadc
L8002ca84:
  addu $s1, $zero, $zero
L8002ca88:
  lhu $v0, 22($s0)
L8002ca8c:
  sll $zero, $zero, 0x0
L8002ca90:
  andi $v0, $v0, 0x8000
L8002ca94:
  beq $v0, $zero, L8002cac4
L8002ca98:
  sll $zero, $zero, 0x0
L8002ca9c:
  jal 0x800170c8
L8002caa0:
  addu $a0, $s0, $zero
L8002caa4:
  andi $v0, $v0, 0xffff
L8002caa8:
  slt $v0, $v0, $s3
L8002caac:
  bne $v0, $zero, L8002cac4
L8002cab0:
  sll $zero, $zero, 0x0
L8002cab4:
  lw $v0, 0($s0)
L8002cab8:
  sll $zero, $zero, 0x0
L8002cabc:
  sw $v0, 0($s2)
L8002cac0:
  addiu $s2, $s2, 4
L8002cac4:
  addiu $s1, $s1, 1
L8002cac8:
  slti $v0, $s1, 5
L8002cacc:
  bne $v0, $zero, L8002ca88
L8002cad0:
  addiu $s0, $s0, 28
L8002cad4:
  j L8002cb34
L8002cad8:
  sw $zero, 0($s2)
L8002cadc:
  lhu $v0, 22($s0)
L8002cae0:
  sll $zero, $zero, 0x0
L8002cae4:
  andi $v0, $v0, 0x8000
L8002cae8:
  beq $v0, $zero, L8002cb20
L8002caec:
  sll $zero, $zero, 0x0
L8002caf0:
  bltz $s3, L8002cb10
L8002caf4:
  sll $zero, $zero, 0x0
L8002caf8:
  lw $v0, 0($s0)
L8002cafc:
  sll $zero, $zero, 0x0
L8002cb00:
  lbu $v0, 104($v0)
L8002cb04:
  sll $zero, $zero, 0x0
L8002cb08:
  bne $v0, $s3, L8002cb20
L8002cb0c:
  sll $zero, $zero, 0x0
L8002cb10:
  lw $v0, 0($s0)
L8002cb14:
  sll $zero, $zero, 0x0
L8002cb18:
  sw $v0, 0($s2)
L8002cb1c:
  addiu $s2, $s2, 4
L8002cb20:
  addiu $s1, $s1, 1
L8002cb24:
  slti $v0, $s1, 5
L8002cb28:
  bne $v0, $zero, L8002cadc
L8002cb2c:
  addiu $s0, $s0, 28
L8002cb30:
  sw $zero, 0($s2)
L8002cb34:
  lw $ra, 32($sp)
L8002cb38:
  lw $s3, 28($sp)
L8002cb3c:
  lw $s2, 24($sp)
L8002cb40:
  lw $s1, 20($sp)
L8002cb44:
  lw $s0, 16($sp)
L8002cb48:
  jr $ra
L8002cb4c:
  addiu $sp, $sp, 40
L8002cb50:
  addu $a1, $zero, $zero
L8002cb54:
  lui $v0, 0x800f
L8002cb58:
  addiu $v1, $v0, -24848
L8002cb5c:
  lw $v0, 0($v1)
L8002cb60:
  addiu $v1, $v1, 4
L8002cb64:
  addiu $a1, $a1, 1
L8002cb68:
  sw $v0, 0($a0)
L8002cb6c:
  slti $v0, $a1, 5
L8002cb70:
  bne $v0, $zero, L8002cb5c
L8002cb74:
  addiu $a0, $a0, 4
L8002cb78:
  jr $ra
L8002cb7c:
  sw $zero, 0($a0)
L8002cb80:
  addiu $a0, $a0, -7
L8002cb84:
  bltz $a0, L8002cba0
L8002cb88:
  addiu $v1, $zero, 6
L8002cb8c:
  addiu $a1, $a1, -7
L8002cb90:
  bgez $a1, L8002cbb0
L8002cb94:
  addiu $v1, $zero, 4
L8002cb98:
  jr $ra
L8002cb9c:
  addu $v0, $zero, $zero
L8002cba0:
  addiu $a1, $a1, -1
L8002cba4:
  slt $v0, $a1, $v1
L8002cba8:
  beq $v0, $zero, L8002cb98
L8002cbac:
  addu $a0, $a0, $v1
L8002cbb0:
  addiu $a0, $a0, 1
L8002cbb4:
  slt $v0, $a0, $v1
L8002cbb8:
  bne $v0, $zero, L8002cbc4
L8002cbbc:
  sll $zero, $zero, 0x0
L8002cbc0:
  addu $a0, $zero, $zero
L8002cbc4:
  bne $a0, $a1, L8002cbd4
L8002cbc8:
  addiu $a0, $a0, -2
L8002cbcc:
  jr $ra
L8002cbd0:
  addiu $v0, $zero, 500
L8002cbd4:
  bgez $a0, L8002cbe0
L8002cbd8:
  sll $zero, $zero, 0x0
L8002cbdc:
  addu $a0, $a0, $v1
L8002cbe0:
  beq $a0, $a1, L8002cbec
L8002cbe4:
  addiu $v0, $zero, -500
L8002cbe8:
  addu $v0, $zero, $zero
L8002cbec:
  jr $ra
L8002cbf0:
  sll $zero, $zero, 0x0
L8002cbf4:
  addiu $sp, $sp, -24
L8002cbf8:
  sw $ra, 20($sp)
L8002cbfc:
  beq $a1, $zero, L8002cc24
L8002cc00:
  sw $s0, 16($sp)
L8002cc04:
  lui $v1, 0x801d
L8002cc08:
  addiu $v1, $v1, 16964
L8002cc0c:
  addiu $v0, $a0, -1
L8002cc10:
  sll $v0, $v0, 0x2
L8002cc14:
  addu $v0, $v0, $v1
L8002cc18:
  lw $v1, 0($v0)
L8002cc1c:
  j L8002cc3c
L8002cc20:
  sra $v1, $v1, 0x9
L8002cc24:
  lui $v1, 0x801d
L8002cc28:
  addiu $v1, $v1, 16964
L8002cc2c:
  addiu $v0, $a0, -1
L8002cc30:
  sll $v0, $v0, 0x2
L8002cc34:
  addu $v0, $v0, $v1
L8002cc38:
  lw $v1, 0($v0)
L8002cc3c:
  sll $zero, $zero, 0x0
L8002cc40:
  andi $v1, $v1, 0x1ff
L8002cc44:
  sll $v0, $v1, 0x2
L8002cc48:
  addu $v0, $v0, $v1
L8002cc4c:
  sll $s0, $v0, 0x1
L8002cc50:
  lui $v0, 0x801d
L8002cc54:
  addiu $v0, $v0, 16964
L8002cc58:
  addiu $v1, $a0, -1
L8002cc5c:
  sll $v1, $v1, 0x2
L8002cc60:
  addu $v1, $v1, $v0
L8002cc64:
  lw $a0, 0($v1)
L8002cc68:
  sll $zero, $zero, 0x0
L8002cc6c:
  sra $a0, $a0, 0x1a
L8002cc70:
  jal L8002497c
L8002cc74:
  andi $a0, $a0, 0x1f
L8002cc78:
  addu $s0, $s0, $v0
L8002cc7c:
  bltz $s0, L8002cc98
L8002cc80:
  addu $v0, $zero, $zero
L8002cc84:
  slti $v0, $s0, 10000
L8002cc88:
  bne $v0, $zero, L8002cc98
L8002cc8c:
  addu $v0, $s0, $zero
L8002cc90:
  addiu $s0, $zero, 9999
L8002cc94:
  addu $v0, $s0, $zero
L8002cc98:
  lw $ra, 20($sp)
L8002cc9c:
  lw $s0, 16($sp)
L8002cca0:
  jr $ra
L8002cca4:
  addiu $sp, $sp, 24
L8002cca8:
  andi $v1, $a0, 0x7ff
L8002ccac:
  sra $v1, $v1, 0x3
L8002ccb0:
  andi $a2, $a0, 0x7
L8002ccb4:
  addiu $a1, $zero, 128
L8002ccb8:
  lui $v0, 0x801d
L8002ccbc:
  addiu $v0, $v0, 0
L8002ccc0:
  addu $v1, $v1, $v0
L8002ccc4:
  lbu $v0, 1560($v1)
L8002ccc8:
  srav $a1, $a1, $a2
L8002cccc:
  andi $a0, $a0, 0x8000
L8002ccd0:
  beq $a0, $zero, L8002ccdc
L8002ccd4:
  and $v0, $v0, $a1
L8002ccd8:
  sltiu $v0, $v0, 1
L8002ccdc:
  jr $ra
L8002cce0:
  sll $zero, $zero, 0x0
L8002cce4:
  andi $v0, $a0, 0x7ff
L8002cce8:
  sra $a2, $v0, 0x3
L8002ccec:
  andi $v0, $a0, 0x8000
L8002ccf0:
  beq $v0, $zero, L8002cd24
L8002ccf4:
  andi $a1, $a0, 0x7
L8002ccf8:
  andi $v1, $a0, 0x7
L8002ccfc:
  addiu $v0, $zero, 128
L8002cd00:
  srav $a0, $v0, $v1
L8002cd04:
  lui $v1, 0x801d
L8002cd08:
  addiu $v1, $v1, 0
L8002cd0c:
  addu $v1, $a2, $v1
L8002cd10:
  lbu $v0, 1560($v1)
L8002cd14:
  nor $a0, $zero, $a0
L8002cd18:
  and $v0, $v0, $a0
L8002cd1c:
  jr $ra
L8002cd20:
  sb $v0, 1560($v1)
L8002cd24:
  addiu $a0, $zero, 128
L8002cd28:
  lui $v1, 0x801d
L8002cd2c:
  addiu $v1, $v1, 0
L8002cd30:
  addu $v1, $a2, $v1
L8002cd34:
  lbu $v0, 1560($v1)
L8002cd38:
  srav $a0, $a0, $a1
L8002cd3c:
  or $v0, $v0, $a0
L8002cd40:
  jr $ra
L8002cd44:
  sb $v0, 1560($v1)
L8002cd48:
  addiu $sp, $sp, -32
L8002cd4c:
  sw $s1, 20($sp)
L8002cd50:
  addu $s1, $a0, $zero
L8002cd54:
  sw $ra, 24($sp)
L8002cd58:
  jal L8002cca8
L8002cd5c:
  sw $s0, 16($sp)
L8002cd60:
  addu $s0, $v0, $zero
L8002cd64:
  bne $s0, $zero, L8002cd78
L8002cd68:
  addu $v0, $s0, $zero
L8002cd6c:
  jal L8002cce4
L8002cd70:
  addu $a0, $s1, $zero
L8002cd74:
  addu $v0, $s0, $zero
L8002cd78:
  lw $ra, 24($sp)
L8002cd7c:
  lw $s1, 20($sp)
L8002cd80:
  lw $s0, 16($sp)
L8002cd84:
  jr $ra
L8002cd88:
  addiu $sp, $sp, 32
L8002cd8c:
  addiu $sp, $sp, -24
L8002cd90:
  sw $ra, 16($sp)
L8002cd94:
  lui $at, 0x800a
L8002cd98:
  sb $zero, -20288($at)
L8002cd9c:
  jal 0x800403f0
L8002cda0:
  sll $zero, $zero, 0x0
L8002cda4:
  jal L80035a64
L8002cda8:
  sll $zero, $zero, 0x0
L8002cdac:
  jal L80039e9c
L8002cdb0:
  sll $zero, $zero, 0x0
L8002cdb4:
  jal 0x800134b4
L8002cdb8:
  sll $zero, $zero, 0x0
L8002cdbc:
  lw $ra, 16($sp)
L8002cdc0:
  addiu $v0, $zero, 24
L8002cdc4:
  lui $at, 0x800a
L8002cdc8:
  sb $v0, -19556($at)
L8002cdcc:
  addiu $v0, $zero, 20
L8002cdd0:
  lui $at, 0x800a
L8002cdd4:
  sb $zero, -19884($at)
L8002cdd8:
  lui $at, 0x800a
L8002cddc:
  sb $v0, -19550($at)
L8002cde0:
  jr $ra
L8002cde4:
  addiu $sp, $sp, 24
L8002cde8:
  addiu $sp, $sp, -24
L8002cdec:
  sw $ra, 16($sp)
L8002cdf0:
  jal L8002cd8c
L8002cdf4:
  sll $zero, $zero, 0x0
L8002cdf8:
  lw $ra, 16($sp)
L8002cdfc:
  sll $zero, $zero, 0x0
L8002ce00:
  jr $ra
L8002ce04:
  addiu $sp, $sp, 24
L8002ce08:
  lbu $v1, 868($gp)
L8002ce0c:
  addiu $sp, $sp, -24
L8002ce10:
  andi $v0, $v1, 0x40
L8002ce14:
  bne $v0, $zero, L8002ce34
L8002ce18:
  sw $ra, 16($sp)
L8002ce1c:
  ori $v0, $v1, 0x40
L8002ce20:
  sb $v0, 868($gp)
L8002ce24:
  jal L80030198
L8002ce28:
  sll $zero, $zero, 0x0
L8002ce2c:
  j L8002ce54
L8002ce30:
  sll $zero, $zero, 0x0
L8002ce34:
  jal L80031084
L8002ce38:
  sll $zero, $zero, 0x0
L8002ce3c:
  lbu $v0, 868($gp)
L8002ce40:
  sll $zero, $zero, 0x0
L8002ce44:
  andi $v0, $v0, 0x40
L8002ce48:
  bne $v0, $zero, L8002ce54
L8002ce4c:
  sll $zero, $zero, 0x0
L8002ce50:
  sb $zero, 865($gp)
L8002ce54:
  lw $ra, 16($sp)
L8002ce58:
  sll $zero, $zero, 0x0
L8002ce5c:
  jr $ra
L8002ce60:
  addiu $sp, $sp, 24
L8002ce64:
  lbu $v1, 868($gp)
L8002ce68:
  addiu $sp, $sp, -24
L8002ce6c:
  andi $v0, $v1, 0x40
L8002ce70:
  bne $v0, $zero, L8002cea0
L8002ce74:
  sw $ra, 16($sp)
L8002ce78:
  lui $a0, 0x800a
L8002ce7c:
  lbu $a0, -19846($a0)
L8002ce80:
  ori $v0, $v1, 0x40
L8002ce84:
  sb $v0, 868($gp)
L8002ce88:
  jal L8002fd10
L8002ce8c:
  sll $zero, $zero, 0x0
L8002ce90:
  lui $at, 0x800a
L8002ce94:
  sb $zero, -19884($at)
L8002ce98:
  j L8002ced8
L8002ce9c:
  sll $zero, $zero, 0x0
L8002cea0:
  lui $a0, 0x800f
L8002cea4:
  jal L8002ffd4
L8002cea8:
  addiu $a0, $a0, -20840
L8002ceac:
  jal L8002fa54
L8002ceb0:
  sll $zero, $zero, 0x0
L8002ceb4:
  lbu $v0, 868($gp)
L8002ceb8:
  sll $zero, $zero, 0x0
L8002cebc:
  andi $v0, $v0, 0x40
L8002cec0:
  bne $v0, $zero, L8002ced8
L8002cec4:
  sll $zero, $zero, 0x0
L8002cec8:
  jal L8003ff34
L8002cecc:
  sll $zero, $zero, 0x0
L8002ced0:
  jal 0x80015b00
L8002ced4:
  sll $zero, $zero, 0x0
L8002ced8:
  lw $ra, 16($sp)
L8002cedc:
  sll $zero, $zero, 0x0
L8002cee0:
  jr $ra
L8002cee4:
  addiu $sp, $sp, 24
L8002cee8:
  lbu $v1, 868($gp)
L8002ceec:
  addiu $sp, $sp, -32
L8002cef0:
  sw $ra, 24($sp)
L8002cef4:
  sw $s1, 20($sp)
L8002cef8:
  andi $v0, $v1, 0x40
L8002cefc:
  bne $v0, $zero, L8002cf4c
L8002cf00:
  sw $s0, 16($sp)
L8002cf04:
  ori $v0, $v1, 0x40
L8002cf08:
  lui $v1, 0x800a
L8002cf0c:
  lbu $v1, -19607($v1)
L8002cf10:
  sb $v0, 868($gp)
L8002cf14:
  addiu $v0, $zero, 1
L8002cf18:
  sb $v0, 870($gp)
L8002cf1c:
  bne $v1, $zero, L8002cf3c
L8002cf20:
  addiu $v0, $zero, 10
L8002cf24:
  lui $v0, 0x800a
L8002cf28:
  lb $v0, -19615($v0)
L8002cf2c:
  sll $zero, $zero, 0x0
L8002cf30:
  bltz $v0, L8002cf3c
L8002cf34:
  addiu $v0, $zero, 10
L8002cf38:
  sb $zero, 870($gp)
L8002cf3c:
  lui $at, 0x800a
L8002cf40:
  sb $v0, -20317($at)
L8002cf44:
  j L8002d0cc
L8002cf48:
  sll $zero, $zero, 0x0
L8002cf4c:
  lbu $v1, 870($gp)
L8002cf50:
  addiu $s1, $zero, 1
L8002cf54:
  andi $s0, $v1, 0xf
L8002cf58:
  beq $s0, $s1, L8002d004
L8002cf5c:
  slti $v0, $s0, 2
L8002cf60:
  beq $v0, $zero, L8002cf78
L8002cf64:
  sll $zero, $zero, 0x0
L8002cf68:
  beq $s0, $zero, L8002cf8c
L8002cf6c:
  andi $v0, $v1, 0x80
L8002cf70:
  j L8002d0cc
L8002cf74:
  sll $zero, $zero, 0x0
L8002cf78:
  addiu $v0, $zero, 2
L8002cf7c:
  beq $s0, $v0, L8002d050
L8002cf80:
  sll $zero, $zero, 0x0
L8002cf84:
  j L8002d0cc
L8002cf88:
  sll $zero, $zero, 0x0
L8002cf8c:
  bne $v0, $zero, L8002cfd0
L8002cf90:
  ori $v0, $v1, 0x80
L8002cf94:
  sb $v0, 870($gp)
L8002cf98:
  addiu $v0, $zero, 128
L8002cf9c:
  lui $a1, 0x801d
L8002cfa0:
  addiu $a1, $a1, 512
L8002cfa4:
  addu $a2, $zero, $zero
L8002cfa8:
  lui $a0, 0x8001
L8002cfac:
  lw $a0, 0($a0)
L8002cfb0:
  lui $at, 0x800a
L8002cfb4:
  sb $v0, -19720($at)
L8002cfb8:
  jal L800323f8
L8002cfbc:
  addiu $a3, $zero, 128
L8002cfc0:
  jal 0x80015a00
L8002cfc4:
  sll $zero, $zero, 0x0
L8002cfc8:
  j L8002d0cc
L8002cfcc:
  sll $zero, $zero, 0x0
L8002cfd0:
  jal L80033be8
L8002cfd4:
  sll $zero, $zero, 0x0
L8002cfd8:
  bne $v0, $zero, L8002d0cc
L8002cfdc:
  sll $zero, $zero, 0x0
L8002cfe0:
  jal L8003ff34
L8002cfe4:
  sll $zero, $zero, 0x0
L8002cfe8:
  jal 0x80015b00
L8002cfec:
  sll $zero, $zero, 0x0
L8002cff0:
  jal L8002cd8c
L8002cff4:
  sll $zero, $zero, 0x0
L8002cff8:
  sb $s1, 870($gp)
L8002cffc:
  j L8002d0cc
L8002d000:
  sll $zero, $zero, 0x0
L8002d004:
  andi $v0, $v1, 0x80
L8002d008:
  bne $v0, $zero, L8002d024
L8002d00c:
  ori $v0, $v1, 0x80
L8002d010:
  sb $v0, 870($gp)
L8002d014:
  jal 0x800179f4
L8002d018:
  sll $zero, $zero, 0x0
L8002d01c:
  j L8002d0cc
L8002d020:
  sll $zero, $zero, 0x0
L8002d024:
  jal L80024388
L8002d028:
  sll $zero, $zero, 0x0
L8002d02c:
  lui $v0, 0x800a
L8002d030:
  lhu $v0, -20116($v0)
L8002d034:
  sll $zero, $zero, 0x0
L8002d038:
  andi $v0, $v0, 0x2000
L8002d03c:
  beq $v0, $zero, L8002d0cc
L8002d040:
  addiu $v0, $zero, 2
L8002d044:
  sb $v0, 870($gp)
L8002d048:
  j L8002d0cc
L8002d04c:
  sll $zero, $zero, 0x0
L8002d050:
  jal 0x80015b00
L8002d054:
  sll $zero, $zero, 0x0
L8002d058:
  jal L8003ff34
L8002d05c:
  sll $zero, $zero, 0x0
L8002d060:
  jal 0x80047ad0
L8002d064:
  addiu $a0, $zero, 2
L8002d068:
  jal 0x800134b4
L8002d06c:
  sll $zero, $zero, 0x0
L8002d070:
  addiu $v0, $zero, 6
L8002d074:
  lui $at, 0x800a
L8002d078:
  sb $v0, -20317($at)
L8002d07c:
  jal 0x80012d84
L8002d080:
  addiu $a0, $zero, 4
L8002d084:
  jal 0x800137e4
L8002d088:
  sll $zero, $zero, 0x0
L8002d08c:
  lui $v0, 0x800a
L8002d090:
  lbu $v0, -19608($v0)
L8002d094:
  sll $zero, $zero, 0x0
L8002d098:
  sb $v0, 868($gp)
L8002d09c:
  andi $v0, $v0, 0xff
L8002d0a0:
  bne $v0, $s0, L8002d0cc
L8002d0a4:
  sll $zero, $zero, 0x0
L8002d0a8:
  lui $v0, 0x800a
L8002d0ac:
  lbu $v0, -19614($v0)
L8002d0b0:
  lui $v1, 0x800a
L8002d0b4:
  addiu $v1, $v1, -19600
L8002d0b8:
  sll $v0, $v0, 0x1
L8002d0bc:
  addu $v0, $v0, $v1
L8002d0c0:
  lbu $v0, 0($v0)
L8002d0c4:
  lui $at, 0x800a
L8002d0c8:
  sb $v0, -19846($at)
L8002d0cc:
  lw $ra, 24($sp)
L8002d0d0:
  lw $s1, 20($sp)
L8002d0d4:
  lw $s0, 16($sp)
L8002d0d8:
  jr $ra
L8002d0dc:
  addiu $sp, $sp, 32
L8002d0e0:
  lbu $v1, 868($gp)
L8002d0e4:
  addiu $sp, $sp, -24
L8002d0e8:
  andi $v0, $v1, 0x40
L8002d0ec:
  bne $v0, $zero, L8002d114
L8002d0f0:
  sw $ra, 16($sp)
L8002d0f4:
  ori $v0, $v1, 0x40
L8002d0f8:
  sb $v0, 868($gp)
L8002d0fc:
  jal L8002bfcc
L8002d100:
  sll $zero, $zero, 0x0
L8002d104:
  jal 0x80015a00
L8002d108:
  sll $zero, $zero, 0x0
L8002d10c:
  j L8002d170
L8002d110:
  sll $zero, $zero, 0x0
L8002d114:
  jal L8002bab4
L8002d118:
  sll $zero, $zero, 0x0
L8002d11c:
  lbu $v0, 868($gp)
L8002d120:
  sll $zero, $zero, 0x0
L8002d124:
  andi $v0, $v0, 0x40
L8002d128:
  bne $v0, $zero, L8002d170
L8002d12c:
  sll $zero, $zero, 0x0
L8002d130:
  lui $at, 0x800a
L8002d134:
  sb $zero, -20288($at)
L8002d138:
  jal L8003ff34
L8002d13c:
  sll $zero, $zero, 0x0
L8002d140:
  jal 0x80015b00
L8002d144:
  sll $zero, $zero, 0x0
L8002d148:
  jal 0x800134b4
L8002d14c:
  sll $zero, $zero, 0x0
L8002d150:
  jal 0x8004763c
L8002d154:
  sll $zero, $zero, 0x0
L8002d158:
  jal 0x80047ad0
L8002d15c:
  addiu $a0, $zero, 2
L8002d160:
  jal 0x80012d84
L8002d164:
  addiu $a0, $zero, 4
L8002d168:
  jal 0x800137e4
L8002d16c:
  sll $zero, $zero, 0x0
L8002d170:
  lw $ra, 16($sp)
L8002d174:
  sll $zero, $zero, 0x0
L8002d178:
  jr $ra
L8002d17c:
  addiu $sp, $sp, 24
L8002d180:
  addiu $sp, $sp, -32
L8002d184:
  addiu $a0, $zero, 160
L8002d188:
  addiu $a1, $zero, 120
L8002d18c:
  sw $ra, 28($sp)
L8002d190:
  jal 0x800878b0
L8002d194:
  sw $s0, 24($sp)
L8002d198:
  jal 0x800878d0
L8002d19c:
  addiu $a0, $zero, 300
L8002d1a0:
  lbu $v1, 868($gp)
L8002d1a4:
  sll $zero, $zero, 0x0
L8002d1a8:
  andi $v0, $v1, 0x40
L8002d1ac:
  bne $v0, $zero, L8002d27c
L8002d1b0:
  andi $v0, $v1, 0x20
L8002d1b4:
  ori $v0, $v1, 0x40
L8002d1b8:
  sb $v0, 868($gp)
L8002d1bc:
  addiu $v0, $zero, 1
L8002d1c0:
  lui $at, 0x800a
L8002d1c4:
  sb $v0, -20288($at)
L8002d1c8:
  jal 0x800530c4
L8002d1cc:
  sll $zero, $zero, 0x0
L8002d1d0:
  jal 0x800533d8
L8002d1d4:
  sll $zero, $zero, 0x0
L8002d1d8:
  lui $v0, 0x800f
L8002d1dc:
  addiu $s0, $v0, -2472
L8002d1e0:
  lh $a1, -2472($v0)
L8002d1e4:
  addiu $v0, $zero, 777
L8002d1e8:
  bne $a1, $v0, L8002d210
L8002d1ec:
  addu $a0, $zero, $zero
L8002d1f0:
  lbu $v0, 868($gp)
L8002d1f4:
  sll $zero, $zero, 0x0
L8002d1f8:
  ori $v0, $v0, 0x20
L8002d1fc:
  sb $v0, 868($gp)
L8002d200:
  jal 0x80059c24
L8002d204:
  sll $zero, $zero, 0x0
L8002d208:
  j L8002d26c
L8002d20c:
  sll $zero, $zero, 0x0
L8002d210:
  lh $a2, 2($s0)
L8002d214:
  lh $a3, 4($s0)
L8002d218:
  lbu $v0, 7($s0)
L8002d21c:
  addiu $a1, $a1, -1
L8002d220:
  sw $v0, 16($sp)
L8002d224:
  lbu $v0, 6($s0)
L8002d228:
  addiu $s0, $s0, 8
L8002d22c:
  jal 0x80053248
L8002d230:
  sw $v0, 20($sp)
L8002d234:
  lh $a1, 0($s0)
L8002d238:
  lh $a2, 2($s0)
L8002d23c:
  lh $a3, 4($s0)
L8002d240:
  lbu $v0, 7($s0)
L8002d244:
  addiu $a0, $zero, 1
L8002d248:
  sw $v0, 16($sp)
L8002d24c:
  lbu $v0, 6($s0)
L8002d250:
  addiu $a1, $a1, -1
L8002d254:
  jal 0x80053248
L8002d258:
  sw $v0, 20($sp)
L8002d25c:
  lui $a1, 0x800a
L8002d260:
  lbu $a1, -19612($a1)
L8002d264:
  jal 0x80053248
L8002d268:
  addiu $a0, $zero, 2
L8002d26c:
  jal 0x800159d8
L8002d270:
  sll $zero, $zero, 0x0
L8002d274:
  j L8002d2c8
L8002d278:
  sll $zero, $zero, 0x0
L8002d27c:
  beq $v0, $zero, L8002d294
L8002d280:
  sll $zero, $zero, 0x0
L8002d284:
  jal 0x80059c88
L8002d288:
  sll $zero, $zero, 0x0
L8002d28c:
  j L8002d29c
L8002d290:
  sll $zero, $zero, 0x0
L8002d294:
  jal 0x800534b8
L8002d298:
  sll $zero, $zero, 0x0
L8002d29c:
  beq $v0, $zero, L8002d2c0
L8002d2a0:
  sll $zero, $zero, 0x0
L8002d2a4:
  jal 0x80047ec4
L8002d2a8:
  sll $zero, $zero, 0x0
L8002d2ac:
  jal L8003ff34
L8002d2b0:
  sll $zero, $zero, 0x0
L8002d2b4:
  lbu $v0, 865($gp)
L8002d2b8:
  sll $zero, $zero, 0x0
L8002d2bc:
  sb $v0, 868($gp)
L8002d2c0:
  jal 0x80059ce4
L8002d2c4:
  sll $zero, $zero, 0x0
L8002d2c8:
  lw $ra, 28($sp)
L8002d2cc:
  lw $s0, 24($sp)
L8002d2d0:
  jr $ra
L8002d2d4:
  addiu $sp, $sp, 32
L8002d2d8:
  lbu $v1, 868($gp)
L8002d2dc:
  addiu $sp, $sp, -24
L8002d2e0:
  andi $v0, $v1, 0x40
L8002d2e4:
  bne $v0, $zero, L8002d328
L8002d2e8:
  sw $ra, 16($sp)
L8002d2ec:
  ori $v0, $v1, 0x40
L8002d2f0:
  sb $v0, 868($gp)
L8002d2f4:
  addiu $v0, $zero, 10
L8002d2f8:
  lui $at, 0x800a
L8002d2fc:
  sb $v0, -20317($at)
L8002d300:
  jal L8003c0c0
L8002d304:
  sll $zero, $zero, 0x0
L8002d308:
  lui $a0, 0x800a
L8002d30c:
  lbu $a0, -19613($a0)
L8002d310:
  jal 0x8016866c
L8002d314:
  sll $zero, $zero, 0x0
L8002d318:
  jal 0x800157dc
L8002d31c:
  sll $zero, $zero, 0x0
L8002d320:
  j L8002d360
L8002d324:
  sll $zero, $zero, 0x0
L8002d328:
  jal 0x80168fcc
L8002d32c:
  sll $zero, $zero, 0x0
L8002d330:
  lbu $v0, 868($gp)
L8002d334:
  sll $zero, $zero, 0x0
L8002d338:
  andi $v0, $v0, 0x40
L8002d33c:
  bne $v0, $zero, L8002d360
L8002d340:
  sll $zero, $zero, 0x0
L8002d344:
  jal 0x800134b4
L8002d348:
  sll $zero, $zero, 0x0
L8002d34c:
  addiu $v0, $zero, 6
L8002d350:
  lui $at, 0x800a
L8002d354:
  sb $v0, -20317($at)
L8002d358:
  jal 0x80012d4c
L8002d35c:
  sll $zero, $zero, 0x0
L8002d360:
  lw $ra, 16($sp)
L8002d364:
  sll $zero, $zero, 0x0
L8002d368:
  jr $ra
L8002d36c:
  addiu $sp, $sp, 24
L8002d370:
  lbu $v1, 868($gp)
L8002d374:
  addiu $sp, $sp, -24
L8002d378:
  andi $v0, $v1, 0x40
L8002d37c:
  bne $v0, $zero, L8002d3bc
L8002d380:
  sw $ra, 16($sp)
L8002d384:
  ori $v0, $v1, 0x40
L8002d388:
  lui $a1, 0x801d
L8002d38c:
  addiu $a1, $a1, 512
L8002d390:
  lui $a0, 0x8001
L8002d394:
  lw $a0, 0($a0)
L8002d398:
  lui $a3, 0x800a
L8002d39c:
  lbu $a3, -19720($a3)
L8002d3a0:
  sb $v0, 868($gp)
L8002d3a4:
  jal L800323f8
L8002d3a8:
  addu $a2, $zero, $zero
L8002d3ac:
  jal 0x80015a00
L8002d3b0:
  sll $zero, $zero, 0x0
L8002d3b4:
  j L8002d3e8
L8002d3b8:
  sll $zero, $zero, 0x0
L8002d3bc:
  jal L80033be8
L8002d3c0:
  sll $zero, $zero, 0x0
L8002d3c4:
  bne $v0, $zero, L8002d3e8
L8002d3c8:
  sll $zero, $zero, 0x0
L8002d3cc:
  jal L8003ff34
L8002d3d0:
  sll $zero, $zero, 0x0
L8002d3d4:
  jal 0x80015b00
L8002d3d8:
  sll $zero, $zero, 0x0
L8002d3dc:
  lbu $v0, 865($gp)
L8002d3e0:
  sll $zero, $zero, 0x0
L8002d3e4:
  sb $v0, 868($gp)
L8002d3e8:
  lw $ra, 16($sp)
L8002d3ec:
  sll $zero, $zero, 0x0
L8002d3f0:
  jr $ra
L8002d3f4:
  addiu $sp, $sp, 24
L8002d3f8:
  lbu $v1, 868($gp)
L8002d3fc:
  addiu $sp, $sp, -24
L8002d400:
  andi $v0, $v1, 0x40
L8002d404:
  bne $v0, $zero, L8002d424
L8002d408:
  sw $ra, 16($sp)
L8002d40c:
  ori $v0, $v1, 0x40
L8002d410:
  sb $v0, 868($gp)
L8002d414:
  jal L8003b9bc
L8002d418:
  sll $zero, $zero, 0x0
L8002d41c:
  jal 0x80015a00
L8002d420:
  sll $zero, $zero, 0x0
L8002d424:
  jal 0x80168fb4
L8002d428:
  sll $zero, $zero, 0x0
L8002d42c:
  lbu $v0, 868($gp)
L8002d430:
  sll $zero, $zero, 0x0
L8002d434:
  andi $v0, $v0, 0x40
L8002d438:
  bne $v0, $zero, L8002d448
L8002d43c:
  sll $zero, $zero, 0x0
L8002d440:
  jal L8003ff34
L8002d444:
  sll $zero, $zero, 0x0
L8002d448:
  lw $ra, 16($sp)
L8002d44c:
  sll $zero, $zero, 0x0
L8002d450:
  jr $ra
L8002d454:
  addiu $sp, $sp, 24
L8002d458:
  addiu $sp, $sp, -24
L8002d45c:
  addiu $v0, $zero, 1
L8002d460:
  sb $v0, 864($gp)
L8002d464:
  sltiu $v0, $a0, 11
L8002d468:
  sw $ra, 16($sp)
L8002d46c:
  sb $a0, 869($gp)
L8002d470:
  beq $v0, $zero, L8002d574
L8002d474:
  lui $v0, 0x8001
L8002d478:
  addiu $v0, $v0, 548
L8002d47c:
  sll $v1, $a0, 0x2
L8002d480:
  addu $v1, $v1, $v0
L8002d484:
  lw $v0, 0($v1)
L8002d488:
  sll $zero, $zero, 0x0
L8002d48c:
  jr $v0
L8002d490:
  sll $zero, $zero, 0x0
L8002d494:
  jal L8003bbf8
L8002d498:
  sll $zero, $zero, 0x0
L8002d49c:
  jal 0x8016aa6c
L8002d4a0:
  sll $zero, $zero, 0x0
L8002d4a4:
  lui $v1, 0x801d
L8002d4a8:
  addiu $v0, $zero, 48
L8002d4ac:
  sh $v0, 2012($v1)
L8002d4b0:
  lui $at, 0x800a
L8002d4b4:
  sb $v0, -19846($at)
L8002d4b8:
  addiu $v0, $zero, 1
L8002d4bc:
  lui $at, 0x800a
L8002d4c0:
  sb $v0, -19500($at)
L8002d4c4:
  addiu $v0, $zero, 2
L8002d4c8:
  lui $at, 0x800a
L8002d4cc:
  sb $zero, -20271($at)
L8002d4d0:
  sb $v0, 868($gp)
L8002d4d4:
  j L8002d578
L8002d4d8:
  sll $zero, $zero, 0x0
L8002d4dc:
  addiu $v0, $zero, 16
L8002d4e0:
  sb $v0, 868($gp)
L8002d4e4:
  j L8002d578
L8002d4e8:
  sll $zero, $zero, 0x0
L8002d4ec:
  addiu $v0, $zero, 14
L8002d4f0:
  sb $v0, 868($gp)
L8002d4f4:
  j L8002d578
L8002d4f8:
  sll $zero, $zero, 0x0
L8002d4fc:
  addiu $v0, $zero, 4
L8002d500:
  sb $v0, 868($gp)
L8002d504:
  j L8002d578
L8002d508:
  sll $zero, $zero, 0x0
L8002d50c:
  lui $v0, 0x801d
L8002d510:
  lbu $v1, 2012($v0)
L8002d514:
  addiu $v0, $zero, 2
L8002d518:
  sb $v0, 868($gp)
L8002d51c:
  lui $at, 0x800a
L8002d520:
  sb $v1, -19846($at)
L8002d524:
  j L8002d578
L8002d528:
  sll $zero, $zero, 0x0
L8002d52c:
  addiu $v0, $zero, 6
L8002d530:
  lui $at, 0x800a
L8002d534:
  sb $zero, -19611($at)
L8002d538:
  sb $v0, 868($gp)
L8002d53c:
  j L8002d578
L8002d540:
  sll $zero, $zero, 0x0
L8002d544:
  jal L80033c90
L8002d548:
  sll $zero, $zero, 0x0
L8002d54c:
  sb $zero, 864($gp)
L8002d550:
  j L8002d578
L8002d554:
  sll $zero, $zero, 0x0
L8002d558:
  j L8002d564
L8002d55c:
  addiu $v0, $zero, 11
L8002d560:
  addiu $v0, $zero, 10
L8002d564:
  sb $v0, 868($gp)
L8002d568:
  sb $zero, 864($gp)
L8002d56c:
  j L8002d578
L8002d570:
  sll $zero, $zero, 0x0
L8002d574:
  sb $zero, 868($gp)
L8002d578:
  lw $ra, 16($sp)
L8002d57c:
  sll $zero, $zero, 0x0
L8002d580:
  jr $ra
L8002d584:
  addiu $sp, $sp, 24
L8002d588:
  lbu $v1, 868($gp)
L8002d58c:
  addiu $sp, $sp, -24
L8002d590:
  sw $ra, 20($sp)
L8002d594:
  andi $v0, $v1, 0x40
L8002d598:
  bne $v0, $zero, L8002d5d8
L8002d59c:
  sw $s0, 16($sp)
L8002d5a0:
  ori $v0, $v1, 0x40
L8002d5a4:
  sb $v0, 868($gp)
L8002d5a8:
  jal 0x8005b85c
L8002d5ac:
  sll $zero, $zero, 0x0
L8002d5b0:
  jal 0x800137e4
L8002d5b4:
  sll $zero, $zero, 0x0
L8002d5b8:
  jal L80039e9c
L8002d5bc:
  sll $zero, $zero, 0x0
L8002d5c0:
  lbu $a0, 864($gp)
L8002d5c4:
  lbu $a1, 869($gp)
L8002d5c8:
  jal 0x8018001c
L8002d5cc:
  sll $zero, $zero, 0x0
L8002d5d0:
  jal 0x80015a00
L8002d5d4:
  sll $zero, $zero, 0x0
L8002d5d8:
  jal 0x8008e590
L8002d5dc:
  sll $zero, $zero, 0x0
L8002d5e0:
  jal 0x80180390
L8002d5e4:
  sll $zero, $zero, 0x0
L8002d5e8:
  addu $s0, $v0, $zero
L8002d5ec:
  bltz $s0, L8002d61c
L8002d5f0:
  sll $zero, $zero, 0x0
L8002d5f4:
  jal L8003ff34
L8002d5f8:
  sll $zero, $zero, 0x0
L8002d5fc:
  jal 0x80015b00
L8002d600:
  sll $zero, $zero, 0x0
L8002d604:
  jal 0x80180dd0
L8002d608:
  sll $zero, $zero, 0x0
L8002d60c:
  jal L8002d458
L8002d610:
  addu $a0, $s0, $zero
L8002d614:
  addiu $v0, $zero, 8
L8002d618:
  sb $v0, 865($gp)
L8002d61c:
  lw $ra, 20($sp)
L8002d620:
  lw $s0, 16($sp)
L8002d624:
  jr $ra
L8002d628:
  addiu $sp, $sp, 24
L8002d62c:
  lbu $v1, 868($gp)
L8002d630:
  addiu $sp, $sp, -24
L8002d634:
  andi $v0, $v1, 0x40
L8002d638:
  bne $v0, $zero, L8002d658
L8002d63c:
  sw $ra, 16($sp)
L8002d640:
  ori $v0, $v1, 0x40
L8002d644:
  sb $v0, 868($gp)
L8002d648:
  jal L8003bbf8
L8002d64c:
  sll $zero, $zero, 0x0
L8002d650:
  jal 0x801683ec
L8002d654:
  sll $zero, $zero, 0x0
L8002d658:
  jal 0x80169c08
L8002d65c:
  sll $zero, $zero, 0x0
L8002d660:
  beq $v0, $zero, L8002d674
L8002d664:
  sll $zero, $zero, 0x0
L8002d668:
  lbu $v0, 865($gp)
L8002d66c:
  sll $zero, $zero, 0x0
L8002d670:
  sb $v0, 868($gp)
L8002d674:
  lw $ra, 16($sp)
L8002d678:
  sll $zero, $zero, 0x0
L8002d67c:
  jr $ra
L8002d680:
  addiu $sp, $sp, 24
L8002d684:
  lbu $v1, 868($gp)
L8002d688:
  addiu $sp, $sp, -24
L8002d68c:
  andi $v0, $v1, 0x40
L8002d690:
  bne $v0, $zero, L8002d6b0
L8002d694:
  sw $ra, 16($sp)
L8002d698:
  ori $v0, $v1, 0x40
L8002d69c:
  sb $v0, 868($gp)
L8002d6a0:
  jal L8003beb8
L8002d6a4:
  sll $zero, $zero, 0x0
L8002d6a8:
  jal 0x8016a080
L8002d6ac:
  sll $zero, $zero, 0x0
L8002d6b0:
  jal 0x8016a37c
L8002d6b4:
  sll $zero, $zero, 0x0
L8002d6b8:
  lw $ra, 16($sp)
L8002d6bc:
  sll $zero, $zero, 0x0
L8002d6c0:
  jr $ra
L8002d6c4:
  addiu $sp, $sp, 24
L8002d6c8:
  lbu $v1, 868($gp)
L8002d6cc:
  addiu $sp, $sp, -24
L8002d6d0:
  andi $v0, $v1, 0x40
L8002d6d4:
  bne $v0, $zero, L8002d6fc
L8002d6d8:
  sw $ra, 16($sp)
L8002d6dc:
  ori $v0, $v1, 0x40
L8002d6e0:
  sb $v0, 868($gp)
L8002d6e4:
  jal L8003c2b4
L8002d6e8:
  sll $zero, $zero, 0x0
L8002d6ec:
  jal L8003c628
L8002d6f0:
  sll $zero, $zero, 0x0
L8002d6f4:
  jal 0x80015a00
L8002d6f8:
  sll $zero, $zero, 0x0
L8002d6fc:
  jal L8003c8cc
L8002d700:
  sll $zero, $zero, 0x0
L8002d704:
  bne $v0, $zero, L8002d720
L8002d708:
  sll $zero, $zero, 0x0
L8002d70c:
  jal L8003ff34
L8002d710:
  sll $zero, $zero, 0x0
L8002d714:
  lbu $v0, 865($gp)
L8002d718:
  sll $zero, $zero, 0x0
L8002d71c:
  sb $v0, 868($gp)
L8002d720:
  lw $ra, 16($sp)
L8002d724:
  sll $zero, $zero, 0x0
L8002d728:
  jr $ra
L8002d72c:
  addiu $sp, $sp, 24
L8002d730:
  lbu $v1, 868($gp)
L8002d734:
  addiu $sp, $sp, -24
L8002d738:
  andi $v0, $v1, 0x40
L8002d73c:
  bne $v0, $zero, L8002d75c
L8002d740:
  sw $ra, 16($sp)
L8002d744:
  ori $v0, $v1, 0x40
L8002d748:
  sb $v0, 868($gp)
L8002d74c:
  jal L8003c498
L8002d750:
  sll $zero, $zero, 0x0
L8002d754:
  jal L8003c950
L8002d758:
  sll $zero, $zero, 0x0
L8002d75c:
  jal L8003ca5c
L8002d760:
  sll $zero, $zero, 0x0
L8002d764:
  bne $v0, $zero, L8002d7b4
L8002d768:
  sll $zero, $zero, 0x0
L8002d76c:
  jal L8003ff34
L8002d770:
  sll $zero, $zero, 0x0
L8002d774:
  jal 0x80015b00
L8002d778:
  sll $zero, $zero, 0x0
L8002d77c:
  lbu $v0, 865($gp)
L8002d780:
  sll $zero, $zero, 0x0
L8002d784:
  sb $v0, 868($gp)
L8002d788:
  andi $v0, $v0, 0xff
L8002d78c:
  beq $v0, $zero, L8002d7b4
L8002d790:
  addiu $v0, $zero, 1
L8002d794:
  sb $v0, 864($gp)
L8002d798:
  addiu $v0, $zero, 8
L8002d79c:
  lui $a0, 0x800f
L8002d7a0:
  addiu $a0, $a0, -25152
L8002d7a4:
  sb $zero, 869($gp)
L8002d7a8:
  sb $v0, 868($gp)
L8002d7ac:
  jal 0x8008fb8c
L8002d7b0:
  addiu $a1, $zero, 1
L8002d7b4:
  lw $ra, 16($sp)
L8002d7b8:
  sll $zero, $zero, 0x0
L8002d7bc:
  jr $ra
L8002d7c0:
  addiu $sp, $sp, 24
L8002d7c4:
  jr $ra
L8002d7c8:
  sll $zero, $zero, 0x0
L8002d7cc:
  lbu $v1, 868($gp)
L8002d7d0:
  addiu $sp, $sp, -48
L8002d7d4:
  sw $ra, 44($sp)
L8002d7d8:
  sw $s2, 40($sp)
L8002d7dc:
  sw $s1, 36($sp)
L8002d7e0:
  andi $v0, $v1, 0x40
L8002d7e4:
  bne $v0, $zero, L8002d8dc
L8002d7e8:
  sw $s0, 32($sp)
L8002d7ec:
  ori $v0, $v1, 0x40
L8002d7f0:
  sb $v0, 868($gp)
L8002d7f4:
  jal L80032328
L8002d7f8:
  sll $zero, $zero, 0x0
L8002d7fc:
  jal L8003ff08
L8002d800:
  addiu $a0, $zero, 29392
L8002d804:
  jal 0x80181f68
L8002d808:
  sll $zero, $zero, 0x0
L8002d80c:
  addu $a0, $zero, $zero
L8002d810:
  addiu $a1, $zero, 11
L8002d814:
  addiu $a2, $zero, 24
L8002d818:
  addiu $a3, $zero, 32
L8002d81c:
  addiu $v0, $zero, 1
L8002d820:
  sb $v0, 870($gp)
L8002d824:
  addiu $v0, $zero, 272
L8002d828:
  sw $v0, 16($sp)
L8002d82c:
  addiu $v0, $zero, 160
L8002d830:
  sw $v0, 20($sp)
L8002d834:
  addu $v0, $a3, $zero
L8002d838:
  jal L80035c38
L8002d83c:
  sw $v0, 24($sp)
L8002d840:
  addu $s1, $v0, $zero
L8002d844:
  addu $a0, $s1, $zero
L8002d848:
  addiu $v0, $zero, 16
L8002d84c:
  jal L80039a14
L8002d850:
  sb $v0, 89($a0)
L8002d854:
  jal 0x8004002c
L8002d858:
  sll $zero, $zero, 0x0
L8002d85c:
  addu $a0, $v0, $zero
L8002d860:
  jal 0x800400ac
L8002d864:
  addiu $a1, $zero, 2
L8002d868:
  addu $s0, $v0, $zero
L8002d86c:
  addu $a0, $s0, $zero
L8002d870:
  addu $a1, $zero, $zero
L8002d874:
  addu $a2, $a1, $zero
L8002d878:
  addu $a3, $a1, $zero
L8002d87c:
  addiu $v0, $zero, 4
L8002d880:
  sw $v0, 16($sp)
L8002d884:
  addiu $v0, $zero, 11
L8002d888:
  sw $v0, 20($sp)
L8002d88c:
  addiu $v0, $zero, 12
L8002d890:
  sw $v0, 24($sp)
L8002d894:
  addiu $v0, $zero, 520
L8002d898:
  jal 0x800404cc
L8002d89c:
  sw $v0, 28($sp)
L8002d8a0:
  lhu $v0, 8($s0)
L8002d8a4:
  addu $a0, $s0, $zero
L8002d8a8:
  ori $v0, $v0, 0x20
L8002d8ac:
  sh $v0, 8($s0)
L8002d8b0:
  lw $v0, 4($s0)
L8002d8b4:
  lui $v1, 0x4000
L8002d8b8:
  or $v0, $v0, $v1
L8002d8bc:
  jal 0x80042918
L8002d8c0:
  sw $v0, 4($s0)
L8002d8c4:
  addu $a0, $s0, $zero
L8002d8c8:
  jal 0x800428ec
L8002d8cc:
  addiu $a1, $zero, 15
L8002d8d0:
  lui $v0, 0x800f
L8002d8d4:
  jal 0x80015a00
L8002d8d8:
  sw $s0, -24848($v0)
L8002d8dc:
  lui $v0, 0x800f
L8002d8e0:
  addiu $s1, $v0, -20232
L8002d8e4:
  lui $s2, 0x800f
L8002d8e8:
  addiu $v0, $zero, 1
L8002d8ec:
  lbu $v1, 870($gp)
L8002d8f0:
  lw $s0, -24848($s2)
L8002d8f4:
  beq $v1, $v0, L8002d90c
L8002d8f8:
  addiu $v0, $zero, 2
L8002d8fc:
  beq $v1, $v0, L8002d958
L8002d900:
  addu $a0, $s0, $zero
L8002d904:
  j L8002d9c0
L8002d908:
  sll $zero, $zero, 0x0
L8002d90c:
  lui $v0, 0x800a
L8002d910:
  lhu $v0, -19560($v0)
L8002d914:
  lui $v1, 0x800a
L8002d918:
  lhu $v1, -19558($v1)
L8002d91c:
  sll $zero, $zero, 0x0
L8002d920:
  or $v0, $v0, $v1
L8002d924:
  andi $v0, $v0, 0xe0
L8002d928:
  beq $v0, $zero, L8002da04
L8002d92c:
  sll $zero, $zero, 0x0
L8002d930:
  jal L8003fee0
L8002d934:
  addiu $a0, $zero, 30
L8002d938:
  jal 0x80043178
L8002d93c:
  addu $a0, $s0, $zero
L8002d940:
  addiu $v0, $zero, 1024
L8002d944:
  sh $v0, 96($s0)
L8002d948:
  addiu $v0, $zero, 2
L8002d94c:
  sb $v0, 870($gp)
L8002d950:
  j L8002da04
L8002d954:
  sll $zero, $zero, 0x0
L8002d958:
  addu $a1, $zero, $zero
L8002d95c:
  lhu $v0, 96($s0)
L8002d960:
  addiu $a2, $zero, 240
L8002d964:
  addiu $v0, $v0, -32
L8002d968:
  sll $a3, $v0, 0x10
L8002d96c:
  sra $a3, $a3, 0x10
L8002d970:
  jal 0x80043230
L8002d974:
  sh $v0, 96($s0)
L8002d978:
  addu $a0, $s1, $zero
L8002d97c:
  lh $a1, 48($s0)
L8002d980:
  lh $a2, 50($s0)
L8002d984:
  addiu $a1, $a1, 24
L8002d988:
  jal L80039934
L8002d98c:
  addiu $a2, $a2, 32
L8002d990:
  lh $v0, 96($s0)
L8002d994:
  sll $zero, $zero, 0x0
L8002d998:
  bgtz $v0, L8002da04
L8002d99c:
  sll $zero, $zero, 0x0
L8002d9a0:
  sb $zero, 870($gp)
L8002d9a4:
  jal L80035b7c
L8002d9a8:
  addu $a0, $s1, $zero
L8002d9ac:
  lw $a0, -24848($s2)
L8002d9b0:
  jal 0x8004036c
L8002d9b4:
  sll $zero, $zero, 0x0
L8002d9b8:
  j L8002da04
L8002d9bc:
  sw $zero, -24848($s2)
L8002d9c0:
  jal L8002892c
L8002d9c4:
  sll $zero, $zero, 0x0
L8002d9c8:
  bne $v0, $zero, L8002da04
L8002d9cc:
  sll $zero, $zero, 0x0
L8002d9d0:
  jal 0x801821dc
L8002d9d4:
  sll $zero, $zero, 0x0
L8002d9d8:
  beq $v0, $zero, L8002da04
L8002d9dc:
  sll $zero, $zero, 0x0
L8002d9e0:
  jal L8003ff34
L8002d9e4:
  sll $zero, $zero, 0x0
L8002d9e8:
  jal 0x80015b00
L8002d9ec:
  sll $zero, $zero, 0x0
L8002d9f0:
  jal 0x80183fe4
L8002d9f4:
  sll $zero, $zero, 0x0
L8002d9f8:
  lbu $v0, 865($gp)
L8002d9fc:
  sll $zero, $zero, 0x0
L8002da00:
  sb $v0, 868($gp)
L8002da04:
  lw $ra, 44($sp)
L8002da08:
  lw $s2, 40($sp)
L8002da0c:
  lw $s1, 36($sp)
L8002da10:
  lw $s0, 32($sp)
L8002da14:
  jr $ra
L8002da18:
  addiu $sp, $sp, 48
L8002da1c:
  addiu $sp, $sp, -48
L8002da20:
  addiu $a0, $zero, 160
L8002da24:
  addiu $a1, $zero, 120
L8002da28:
  sw $ra, 40($sp)
L8002da2c:
  sw $s1, 36($sp)
L8002da30:
  jal 0x800878b0
L8002da34:
  sw $s0, 32($sp)
L8002da38:
  jal 0x800878d0
L8002da3c:
  addiu $a0, $zero, 300
L8002da40:
  lbu $v1, 868($gp)
L8002da44:
  sll $zero, $zero, 0x0
L8002da48:
  andi $v0, $v1, 0x40
L8002da4c:
  bne $v0, $zero, L8002da9c
L8002da50:
  ori $v0, $v1, 0x40
L8002da54:
  sb $v0, 868($gp)
L8002da58:
  jal 0x80015780
L8002da5c:
  sll $zero, $zero, 0x0
L8002da60:
  lui $v0, 0x801d
L8002da64:
  addiu $s1, $v0, 512
L8002da68:
  addiu $v0, $zero, 48
L8002da6c:
  sh $v0, 1500($s1)
L8002da70:
  addiu $s0, $zero, 32
L8002da74:
  jal L8002cce4
L8002da78:
  ori $a0, $s0, 0x8000
L8002da7c:
  addiu $s0, $s0, 1
L8002da80:
  slti $v0, $s0, 288
L8002da84:
  bne $v0, $zero, L8002da74
L8002da88:
  sll $zero, $zero, 0x0
L8002da8c:
  lbu $v0, 990($s1)
L8002da90:
  sb $zero, 870($gp)
L8002da94:
  ori $v0, $v0, 0x3
L8002da98:
  sb $v0, 990($s1)
L8002da9c:
  lbu $a2, 870($gp)
L8002daa0:
  addiu $s0, $zero, 1
L8002daa4:
  andi $v1, $a2, 0xf
L8002daa8:
  beq $v1, $s0, L8002db18
L8002daac:
  slti $v0, $v1, 2
L8002dab0:
  beq $v0, $zero, L8002dac8
L8002dab4:
  sll $zero, $zero, 0x0
L8002dab8:
  beq $v1, $zero, L8002dadc
L8002dabc:
  andi $v0, $a2, 0x80
L8002dac0:
  j L8002dc24
L8002dac4:
  sll $zero, $zero, 0x0
L8002dac8:
  addiu $v0, $zero, 2
L8002dacc:
  beq $v1, $v0, L8002dbe0
L8002dad0:
  andi $v0, $a2, 0x80
L8002dad4:
  j L8002dc24
L8002dad8:
  sll $zero, $zero, 0x0
L8002dadc:
  bne $v0, $zero, L8002daf0
L8002dae0:
  ori $v0, $a2, 0x80
L8002dae4:
  sb $v0, 870($gp)
L8002dae8:
  jal L8003f87c
L8002daec:
  sll $zero, $zero, 0x0
L8002daf0:
  jal L8003f70c
L8002daf4:
  sll $zero, $zero, 0x0
L8002daf8:
  addu $a2, $v0, $zero
L8002dafc:
  beq $a2, $zero, L8002dc24
L8002db00:
  addiu $v0, $zero, 2
L8002db04:
  beq $a2, $v0, L8002da64
L8002db08:
  lui $v0, 0x801d
L8002db0c:
  sb $s0, 870($gp)
L8002db10:
  j L8002dc24
L8002db14:
  sll $zero, $zero, 0x0
L8002db18:
  andi $v0, $a2, 0x80
L8002db1c:
  bne $v0, $zero, L8002dba4
L8002db20:
  lui $v0, 0x801d
L8002db24:
  lw $v1, 1332($v0)
L8002db28:
  lui $v0, 0xcccc
L8002db2c:
  ori $v0, $v0, 0xcccd
L8002db30:
  multu $v1, $v0
L8002db34:
  addu $a0, $zero, $zero
L8002db38:
  addiu $a1, $zero, 35
L8002db3c:
  addiu $a3, $zero, 112
L8002db40:
  ori $v0, $a2, 0x80
L8002db44:
  sb $v0, 870($gp)
L8002db48:
  mfhi $t0
L8002db4c:
  srl $a2, $t0, 0x2
L8002db50:
  sll $v0, $a2, 0x2
L8002db54:
  addu $v0, $v0, $a2
L8002db58:
  subu $a2, $v1, $v0
L8002db5c:
  lui $v0, 0x8009
L8002db60:
  addiu $v0, $v0, 2896
L8002db64:
  sll $v1, $a2, 0x2
L8002db68:
  addu $v1, $v1, $v0
L8002db6c:
  lhu $v0, 0($v1)
L8002db70:
  lui $a2, 0x801d
L8002db74:
  sw $v0, 22024($a2)
L8002db78:
  lhu $v1, 2($v1)
L8002db7c:
  addiu $v0, $zero, 288
L8002db80:
  sw $v0, 16($sp)
L8002db84:
  addiu $v0, $zero, 32
L8002db88:
  sw $v0, 20($sp)
L8002db8c:
  addiu $v0, $zero, 8
L8002db90:
  addiu $a2, $a2, 22024
L8002db94:
  sw $v0, 24($sp)
L8002db98:
  sw $v1, 4($a2)
L8002db9c:
  jal L80035c38
L8002dba0:
  addiu $a2, $zero, 16
L8002dba4:
  jal L80039794
L8002dba8:
  sll $zero, $zero, 0x0
L8002dbac:
  lui $v0, 0x800f
L8002dbb0:
  addiu $a0, $v0, -20232
L8002dbb4:
  lhu $v0, 52($a0)
L8002dbb8:
  sll $zero, $zero, 0x0
L8002dbbc:
  andi $v0, $v0, 0x8
L8002dbc0:
  bne $v0, $zero, L8002dc24
L8002dbc4:
  sll $zero, $zero, 0x0
L8002dbc8:
  jal L80035b7c
L8002dbcc:
  sll $zero, $zero, 0x0
L8002dbd0:
  addiu $v0, $zero, 2
L8002dbd4:
  sb $v0, 870($gp)
L8002dbd8:
  j L8002dc24
L8002dbdc:
  sll $zero, $zero, 0x0
L8002dbe0:
  bne $v0, $zero, L8002dc14
L8002dbe4:
  ori $v0, $a2, 0x80
L8002dbe8:
  sb $v0, 870($gp)
L8002dbec:
  lui $at, 0x800a
L8002dbf0:
  sb $s0, -20288($at)
L8002dbf4:
  jal 0x800530c4
L8002dbf8:
  sll $zero, $zero, 0x0
L8002dbfc:
  jal 0x800533d8
L8002dc00:
  sll $zero, $zero, 0x0
L8002dc04:
  jal 0x80059c9c
L8002dc08:
  sll $zero, $zero, 0x0
L8002dc0c:
  j L8002dc24
L8002dc10:
  sll $zero, $zero, 0x0
L8002dc14:
  jal 0x80059cd0
L8002dc18:
  sll $zero, $zero, 0x0
L8002dc1c:
  jal 0x80059ce4
L8002dc20:
  sll $zero, $zero, 0x0
L8002dc24:
  lw $ra, 40($sp)
L8002dc28:
  lw $s1, 36($sp)
L8002dc2c:
  lw $s0, 32($sp)
L8002dc30:
  jr $ra
L8002dc34:
  addiu $sp, $sp, 48
L8002dc38:
  lbu $v1, 868($gp)
L8002dc3c:
  addiu $sp, $sp, -40
L8002dc40:
  sw $ra, 36($sp)
L8002dc44:
  andi $v0, $v1, 0x40
L8002dc48:
  bne $v0, $zero, L8002dcfc
L8002dc4c:
  sw $s0, 32($sp)
L8002dc50:
  lui $a0, 0x800a
L8002dc54:
  addiu $a0, $a0, -19916
L8002dc58:
  lui $a1, 0x800a
L8002dc5c:
  addiu $a1, $a1, -19914
L8002dc60:
  lui $a2, 0x800a
L8002dc64:
  addiu $a2, $a2, -19920
L8002dc68:
  ori $v0, $v1, 0x40
L8002dc6c:
  sb $v0, 868($gp)
L8002dc70:
  addiu $v0, $zero, 8000
L8002dc74:
  lui $at, 0x800a
L8002dc78:
  sh $v0, -19914($at)
L8002dc7c:
  lui $at, 0x800a
L8002dc80:
  sh $v0, -19916($at)
L8002dc84:
  jal 0x80180fd8
L8002dc88:
  lui $s0, 0x800f
L8002dc8c:
  addu $a0, $zero, $zero
L8002dc90:
  addiu $a1, $zero, 37
L8002dc94:
  addiu $a2, $zero, 52
L8002dc98:
  addiu $a3, $zero, 180
L8002dc9c:
  addiu $v0, $zero, 216
L8002dca0:
  sw $v0, 16($sp)
L8002dca4:
  addiu $v0, $zero, 32
L8002dca8:
  sw $v0, 20($sp)
L8002dcac:
  jal L80035c38
L8002dcb0:
  sw $v0, 24($sp)
L8002dcb4:
  addiu $s0, $s0, -20232
L8002dcb8:
  jal L80039a14
L8002dcbc:
  addu $a0, $s0, $zero
L8002dcc0:
  addiu $a0, $zero, 1
L8002dcc4:
  addiu $a1, $zero, 38
L8002dcc8:
  addiu $a2, $zero, 14
L8002dccc:
  addiu $a3, $zero, 102
L8002dcd0:
  addiu $v0, $zero, 256
L8002dcd4:
  sw $v0, 16($sp)
L8002dcd8:
  addiu $v0, $zero, 48
L8002dcdc:
  jal L80035be4
L8002dce0:
  sw $v0, 20($sp)
L8002dce4:
  jal L80039a14
L8002dce8:
  addiu $a0, $s0, 100
L8002dcec:
  jal L8003ff08
L8002dcf0:
  addiu $a0, $zero, 29376
L8002dcf4:
  jal 0x80015a00
L8002dcf8:
  sll $zero, $zero, 0x0
L8002dcfc:
  jal 0x801812b4
L8002dd00:
  sll $zero, $zero, 0x0
L8002dd04:
  addu $s0, $v0, $zero
L8002dd08:
  beq $s0, $zero, L8002dd64
L8002dd0c:
  sll $zero, $zero, 0x0
L8002dd10:
  jal L8003ff34
L8002dd14:
  sll $zero, $zero, 0x0
L8002dd18:
  jal 0x80015b00
L8002dd1c:
  sll $zero, $zero, 0x0
L8002dd20:
  jal 0x80181e30
L8002dd24:
  sll $zero, $zero, 0x0
L8002dd28:
  addiu $v0, $zero, 1
L8002dd2c:
  bne $s0, $v0, L8002dd58
L8002dd30:
  addiu $a0, $zero, -1
L8002dd34:
  addu $a1, $a0, $zero
L8002dd38:
  addu $a2, $zero, $zero
L8002dd3c:
  jal L80024dc8
L8002dd40:
  addu $a3, $a2, $zero
L8002dd44:
  addiu $v0, $zero, 8
L8002dd48:
  lui $at, 0x800a
L8002dd4c:
  sb $v0, -19608($at)
L8002dd50:
  j L8002dd64
L8002dd54:
  sll $zero, $zero, 0x0
L8002dd58:
  lbu $v0, 865($gp)
L8002dd5c:
  sll $zero, $zero, 0x0
L8002dd60:
  sb $v0, 868($gp)
L8002dd64:
  lw $ra, 36($sp)
L8002dd68:
  lw $s0, 32($sp)
L8002dd6c:
  jr $ra
L8002dd70:
  addiu $sp, $sp, 40
L8002dd74:
  addiu $sp, $sp, -24
L8002dd78:
  sw $ra, 20($sp)
L8002dd7c:
  jal L8002cde8
L8002dd80:
  sw $s0, 16($sp)
L8002dd84:
  lui $v0, 0x8009
L8002dd88:
  addiu $s0, $v0, 2916
L8002dd8c:
  jal 0x80012d4c
L8002dd90:
  sll $zero, $zero, 0x0
L8002dd94:
  lbu $v1, 868($gp)
L8002dd98:
  sll $zero, $zero, 0x0
L8002dd9c:
  andi $v0, $v1, 0x80
L8002dda0:
  bne $v0, $zero, L8002ddc0
L8002dda4:
  andi $v0, $v1, 0x1f
L8002dda8:
  ori $v0, $v1, 0x80
L8002ddac:
  sb $v0, 868($gp)
L8002ddb0:
  jal L8002cd8c
L8002ddb4:
  sll $zero, $zero, 0x0
L8002ddb8:
  j L8002dd8c
L8002ddbc:
  sll $zero, $zero, 0x0
L8002ddc0:
  sll $v0, $v0, 0x2
L8002ddc4:
  addu $v0, $v0, $s0
L8002ddc8:
  lw $v0, 0($v0)
L8002ddcc:
  sll $zero, $zero, 0x0
L8002ddd0:
  jalr $ra, $v0
L8002ddd4:
  sll $zero, $zero, 0x0
L8002ddd8:
  lbu $v0, 868($gp)
L8002dddc:
  sll $zero, $zero, 0x0
L8002dde0:
  andi $v0, $v0, 0x40
L8002dde4:
  bne $v0, $zero, L8002dd8c
L8002dde8:
  sll $zero, $zero, 0x0
L8002ddec:
  jal 0x80015b00
L8002ddf0:
  sll $zero, $zero, 0x0
L8002ddf4:
  j L8002dd8c
L8002ddf8:
  sll $zero, $zero, 0x0
L8002ddfc:
  addiu $sp, $sp, -24
L8002de00:
  sw $ra, 16($sp)
L8002de04:
  addiu $v0, $zero, 1
L8002de08:
  beq $a1, $v0, L8002deb8
L8002de0c:
  addu $a2, $a0, $zero
L8002de10:
  slti $v0, $a1, 2
L8002de14:
  beq $v0, $zero, L8002de2c
L8002de18:
  sll $zero, $zero, 0x0
L8002de1c:
  beq $a1, $zero, L8002de40
L8002de20:
  lui $a0, 0xffdd
L8002de24:
  j L8002df1c
L8002de28:
  sll $zero, $zero, 0x0
L8002de2c:
  addiu $v0, $zero, 2
L8002de30:
  beq $a1, $v0, L8002def4
L8002de34:
  addiu $v0, $zero, 240
L8002de38:
  j L8002df1c
L8002de3c:
  sll $zero, $zero, 0x0
L8002de40:
  ori $a0, $a0, 0xffff
L8002de44:
  addiu $v0, $zero, 256
L8002de48:
  sh $v0, 50($a2)
L8002de4c:
  addiu $v0, $zero, 64
L8002de50:
  sh $v0, 4($a2)
L8002de54:
  lui $v0, 0x800a
L8002de58:
  lw $v0, -20236($v0)
L8002de5c:
  addiu $v1, $zero, 16
L8002de60:
  sh $v1, 6($a2)
L8002de64:
  and $v0, $v0, $a0
L8002de68:
  lui $at, 0x800a
L8002de6c:
  sw $v0, -20236($at)
L8002de70:
  lui $v0, 0x800a
L8002de74:
  lw $v0, -20236($v0)
L8002de78:
  lui $v1, 0x1
L8002de7c:
  sh $zero, 48($a2)
L8002de80:
  or $v0, $v0, $v1
L8002de84:
  lui $at, 0x800a
L8002de88:
  sw $v0, -20236($at)
L8002de8c:
  addiu $v0, $zero, 2
L8002de90:
  sb $v0, 70($a2)
L8002de94:
  lw $v0, 56($a2)
L8002de98:
  lui $v1, 0x800a
L8002de9c:
  lw $v1, -20200($v1)
L8002dea0:
  sll $v0, $v0, 0xb
L8002dea4:
  sw $v1, 8($a2)
L8002dea8:
  addiu $v1, $v1, 2048
L8002deac:
  sw $v0, 28($a2)
L8002deb0:
  j L8002df1c
L8002deb4:
  sw $v1, 12($a2)
L8002deb8:
  lui $a0, 0xffdc
L8002debc:
  ori $a0, $a0, 0xffff
L8002dec0:
  addiu $v0, $zero, 2048
L8002dec4:
  sw $v0, 28($a2)
L8002dec8:
  lui $v0, 0x800a
L8002decc:
  lw $v0, -20236($v0)
L8002ded0:
  lui $v1, 0x800a
L8002ded4:
  lw $v1, -20200($v1)
L8002ded8:
  and $v0, $v0, $a0
L8002dedc:
  lui $at, 0x800a
L8002dee0:
  sw $v0, -20236($at)
L8002dee4:
  sw $v1, 12($a2)
L8002dee8:
  sw $v1, 8($a2)
L8002deec:
  j L8002df1c
L8002def0:
  sb $a1, 70($a2)
L8002def4:
  sh $v0, 2($a2)
L8002def8:
  addiu $v0, $zero, 256
L8002defc:
  sh $v0, 4($a2)
L8002df00:
  addiu $v0, $zero, 4
L8002df04:
  lui $a1, 0x800a
L8002df08:
  lw $a1, -20200($a1)
L8002df0c:
  addu $a0, $a2, $zero
L8002df10:
  sh $zero, 0($a2)
L8002df14:
  jal 0x80081de8
L8002df18:
  sh $v0, 6($a2)
L8002df1c:
  lw $ra, 16($sp)
L8002df20:
  sll $zero, $zero, 0x0
L8002df24:
  jr $ra
L8002df28:
  addiu $sp, $sp, 24
L8002df2c:
  addiu $sp, $sp, -40
L8002df30:
  sw $ra, 36($sp)
L8002df34:
  beq $a0, $zero, L8002df40
L8002df38:
  sw $s0, 32($sp)
L8002df3c:
  sh $a1, 60($a0)
L8002df40:
  sra $v0, $a1, 0x4
L8002df44:
  andi $v0, $v0, 0xf
L8002df48:
  sll $v1, $v0, 0x2
L8002df4c:
  addu $v1, $v1, $v0
L8002df50:
  sll $v1, $v1, 0x1
L8002df54:
  andi $v0, $a1, 0xf
L8002df58:
  addu $v1, $v1, $v0
L8002df5c:
  sra $a1, $a1, 0x8
L8002df60:
  addiu $v0, $zero, 1
L8002df64:
  beq $a1, $v0, L8002dfa0
L8002df68:
  slti $v0, $a1, 2
L8002df6c:
  beq $v0, $zero, L8002df84
L8002df70:
  sll $zero, $zero, 0x0
L8002df74:
  beq $a1, $zero, L8002df98
L8002df78:
  addiu $s0, $zero, 33
L8002df7c:
  j L8002dffc
L8002df80:
  sll $zero, $zero, 0x0
L8002df84:
  addiu $v0, $zero, 2
L8002df88:
  beq $a1, $v0, L8002dfac
L8002df8c:
  addiu $s0, $zero, 113
L8002df90:
  j L8002dffc
L8002df94:
  sll $zero, $zero, 0x0
L8002df98:
  j L8002dfb0
L8002df9c:
  addu $a2, $zero, $zero
L8002dfa0:
  addiu $s0, $zero, 81
L8002dfa4:
  j L8002dfb0
L8002dfa8:
  addiu $a2, $zero, 1650
L8002dfac:
  addiu $a2, $zero, 5052
L8002dfb0:
  mult $v1, $s0
L8002dfb4:
  lui $v0, 0x8003
L8002dfb8:
  addiu $v0, $v0, -8708
L8002dfbc:
  addu $a0, $zero, $zero
L8002dfc0:
  addu $a1, $a0, $zero
L8002dfc4:
  addu $a3, $s0, $zero
L8002dfc8:
  sw $v0, 16($sp)
L8002dfcc:
  sw $zero, 20($sp)
L8002dfd0:
  sw $zero, 24($sp)
L8002dfd4:
  mflo $t0
L8002dfd8:
  addu $a2, $a2, $t0
L8002dfdc:
  jal 0x80014eec
L8002dfe0:
  addiu $a2, $a2, 8661
L8002dfe4:
  lw $v1, 44($v0)
L8002dfe8:
  addiu $a0, $s0, -1
L8002dfec:
  sw $a0, 56($v0)
L8002dff0:
  ori $v1, $v1, 0x10
L8002dff4:
  lui $at, 0x800a
L8002dff8:
  sw $v1, -20236($at)
L8002dffc:
  lw $ra, 36($sp)
L8002e000:
  lw $s0, 32($sp)
L8002e004:
  jr $ra
L8002e008:
  addiu $sp, $sp, 40
L8002e00c:
  addiu $sp, $sp, -32
L8002e010:
  sw $s0, 16($sp)
L8002e014:
  addu $s0, $a0, $zero
L8002e018:
  addiu $v0, $zero, -1
L8002e01c:
  sw $s1, 20($sp)
L8002e020:
  addu $s1, $zero, $zero
L8002e024:
  sw $ra, 24($sp)
L8002e028:
  sh $v0, 60($s0)
L8002e02c:
  lw $a0, 0($s0)
L8002e030:
  jal 0x8004036c
L8002e034:
  addiu $s1, $s1, 1
L8002e038:
  sw $zero, 0($s0)
L8002e03c:
  sh $zero, 4($s0)
L8002e040:
  slti $v0, $s1, 3
L8002e044:
  bne $v0, $zero, L8002e02c
L8002e048:
  addiu $s0, $s0, 20
L8002e04c:
  lw $ra, 24($sp)
L8002e050:
  lw $s1, 20($sp)
L8002e054:
  lw $s0, 16($sp)
L8002e058:
  jr $ra
L8002e05c:
  addiu $sp, $sp, 32
L8002e060:
  addiu $sp, $sp, -56
L8002e064:
  sw $s3, 44($sp)
L8002e068:
  addu $s3, $a0, $zero
L8002e06c:
  sw $s1, 36($sp)
L8002e070:
  addu $s1, $a1, $zero
L8002e074:
  sw $s0, 32($sp)
L8002e078:
  addu $s0, $a2, $zero
L8002e07c:
  sw $ra, 48($sp)
L8002e080:
  jal 0x8004002c
L8002e084:
  sw $s2, 40($sp)
L8002e088:
  addu $a0, $v0, $zero
L8002e08c:
  jal 0x800400ac
L8002e090:
  addiu $a1, $zero, 2
L8002e094:
  addu $s2, $v0, $zero
L8002e098:
  addu $a0, $s2, $zero
L8002e09c:
  addu $a1, $zero, $zero
L8002e0a0:
  addu $a2, $a1, $zero
L8002e0a4:
  addiu $a3, $zero, 2
L8002e0a8:
  sw $zero, 16($sp)
L8002e0ac:
  sw $zero, 20($sp)
L8002e0b0:
  sw $s1, 24($sp)
L8002e0b4:
  jal 0x800404cc
L8002e0b8:
  sw $s0, 28($sp)
L8002e0bc:
  addu $a0, $s2, $zero
L8002e0c0:
  sll $a1, $s0, 0x18
L8002e0c4:
  jal 0x800428ec
L8002e0c8:
  sra $a1, $a1, 0x18
L8002e0cc:
  addiu $v0, $zero, 1
L8002e0d0:
  sb $v0, 16($s3)
L8002e0d4:
  addiu $v0, $zero, 2
L8002e0d8:
  bne $s0, $v0, L8002e0f4
L8002e0dc:
  lui $v1, 0x100
L8002e0e0:
  addiu $v0, $zero, 1
L8002e0e4:
  sh $v0, 4($s3)
L8002e0e8:
  lw $v0, 4($s2)
L8002e0ec:
  j L8002e0fc
L8002e0f0:
  lui $v1, 0x5000
L8002e0f4:
  sh $zero, 4($s3)
L8002e0f8:
  lw $v0, 4($s2)
L8002e0fc:
  sll $zero, $zero, 0x0
L8002e100:
  or $v0, $v0, $v1
L8002e104:
  sw $v0, 4($s2)
L8002e108:
  sw $s2, 0($s3)
L8002e10c:
  lw $ra, 48($sp)
L8002e110:
  lw $s3, 44($sp)
L8002e114:
  lw $s2, 40($sp)
L8002e118:
  lw $s1, 36($sp)
L8002e11c:
  lw $s0, 32($sp)
L8002e120:
  jr $ra
L8002e124:
  addiu $sp, $sp, 56
L8002e128:
  addiu $sp, $sp, -56
L8002e12c:
  sw $s2, 48($sp)
L8002e130:
  addu $s2, $a0, $zero
L8002e134:
  sw $s1, 44($sp)
L8002e138:
  addu $s1, $a1, $zero
L8002e13c:
  sw $ra, 52($sp)
L8002e140:
  bgez $s1, L8002e14c
L8002e144:
  sw $s0, 40($sp)
L8002e148:
  lh $s1, 60($s2)
L8002e14c:
  sll $zero, $zero, 0x0
L8002e150:
  slti $v0, $s1, 512
L8002e154:
  bne $v0, $zero, L8002e2c8
L8002e158:
  sh $s1, 60($s2)
L8002e15c:
  jal 0x8004002c
L8002e160:
  sll $zero, $zero, 0x0
L8002e164:
  addu $a0, $v0, $zero
L8002e168:
  jal 0x800400ac
L8002e16c:
  addiu $a1, $zero, 3
L8002e170:
  addu $s0, $v0, $zero
L8002e174:
  addu $a0, $s0, $zero
L8002e178:
  addu $a1, $zero, $zero
L8002e17c:
  addu $a2, $a1, $zero
L8002e180:
  addiu $v0, $zero, 256
L8002e184:
  sw $v0, 16($sp)
L8002e188:
  addiu $v0, $zero, 16
L8002e18c:
  sw $v0, 28($sp)
L8002e190:
  addiu $v0, $zero, 240
L8002e194:
  addiu $a3, $zero, 512
L8002e198:
  sw $zero, 20($sp)
L8002e19c:
  sw $zero, 24($sp)
L8002e1a0:
  sw $zero, 32($sp)
L8002e1a4:
  jal 0x80040510
L8002e1a8:
  sw $v0, 36($sp)
L8002e1ac:
  sra $v0, $s1, 0x4
L8002e1b0:
  andi $v0, $v0, 0xf
L8002e1b4:
  sll $v1, $v0, 0x2
L8002e1b8:
  addu $v1, $v1, $v0
L8002e1bc:
  sll $v1, $v1, 0x1
L8002e1c0:
  andi $v0, $s1, 0xf
L8002e1c4:
  addu $s1, $v1, $v0
L8002e1c8:
  lui $a0, 0x100
L8002e1cc:
  lw $v0, 4($s0)
L8002e1d0:
  lhu $v1, 8($s0)
L8002e1d4:
  or $v0, $v0, $a0
L8002e1d8:
  andi $v1, $v1, 0xfff7
L8002e1dc:
  sw $v0, 4($s0)
L8002e1e0:
  addiu $v0, $zero, 1
L8002e1e4:
  sh $v1, 8($s0)
L8002e1e8:
  sll $v1, $s1, 0x1
L8002e1ec:
  addu $v1, $v1, $s1
L8002e1f0:
  sll $v1, $v1, 0x1
L8002e1f4:
  sb $v0, 16($s2)
L8002e1f8:
  lui $v0, 0x8009
L8002e1fc:
  addiu $v0, $v0, 3072
L8002e200:
  sw $s0, 0($s2)
L8002e204:
  addu $s0, $v1, $v0
L8002e208:
  sh $zero, 4($s2)
L8002e20c:
  lbu $v0, 0($s0)
L8002e210:
  sll $zero, $zero, 0x0
L8002e214:
  andi $v0, $v0, 0x1
L8002e218:
  beq $v0, $zero, L8002e24c
L8002e21c:
  addiu $a0, $s2, 20
L8002e220:
  addiu $a1, $zero, 20
L8002e224:
  jal L8002e060
L8002e228:
  addiu $a2, $zero, 1
L8002e22c:
  lw $v1, 20($s2)
L8002e230:
  lbu $v0, 1($s0)
L8002e234:
  sll $zero, $zero, 0x0
L8002e238:
  sh $v0, 48($v1)
L8002e23c:
  lw $v1, 20($s2)
L8002e240:
  lbu $v0, 2($s0)
L8002e244:
  sll $zero, $zero, 0x0
L8002e248:
  sh $v0, 50($v1)
L8002e24c:
  lbu $v0, 0($s0)
L8002e250:
  sll $zero, $zero, 0x0
L8002e254:
  andi $v0, $v0, 0x2
L8002e258:
  beq $v0, $zero, L8002e358
L8002e25c:
  addiu $a0, $s2, 40
L8002e260:
  addiu $a1, $zero, 22
L8002e264:
  jal L8002e060
L8002e268:
  addiu $a2, $zero, 2
L8002e26c:
  lw $v1, 40($s2)
L8002e270:
  lbu $v0, 3($s0)
L8002e274:
  sll $zero, $zero, 0x0
L8002e278:
  sh $v0, 48($v1)
L8002e27c:
  lw $v1, 40($s2)
L8002e280:
  lbu $v0, 4($s0)
L8002e284:
  sll $zero, $zero, 0x0
L8002e288:
  sh $v0, 50($v1)
L8002e28c:
  lbu $v0, 5($s0)
L8002e290:
  sll $zero, $zero, 0x0
L8002e294:
  sh $v0, 44($s2)
L8002e298:
  lbu $v0, 0($s0)
L8002e29c:
  sll $zero, $zero, 0x0
L8002e2a0:
  andi $v0, $v0, 0x80
L8002e2a4:
  beq $v0, $zero, L8002e358
L8002e2a8:
  sll $zero, $zero, 0x0
L8002e2ac:
  lw $v1, 40($s2)
L8002e2b0:
  sll $zero, $zero, 0x0
L8002e2b4:
  lhu $v0, 8($v1)
L8002e2b8:
  sll $zero, $zero, 0x0
L8002e2bc:
  ori $v0, $v0, 0x8
L8002e2c0:
  j L8002e358
L8002e2c4:
  sh $v0, 8($v1)
L8002e2c8:
  addu $a0, $s2, $zero
L8002e2cc:
  addiu $a1, $zero, 16
L8002e2d0:
  jal L8002e060
L8002e2d4:
  addu $a2, $zero, $zero
L8002e2d8:
  slti $v0, $s1, 256
L8002e2dc:
  bne $v0, $zero, L8002e350
L8002e2e0:
  sra $v1, $s1, 0x4
L8002e2e4:
  andi $v1, $v1, 0xf
L8002e2e8:
  sll $v0, $v1, 0x2
L8002e2ec:
  addu $v0, $v0, $v1
L8002e2f0:
  sll $v0, $v0, 0x1
L8002e2f4:
  andi $v1, $s1, 0xf
L8002e2f8:
  addu $v0, $v0, $v1
L8002e2fc:
  lui $v1, 0x8009
L8002e300:
  addiu $v1, $v1, 2984
L8002e304:
  sll $v0, $v0, 0x1
L8002e308:
  addu $s0, $v0, $v1
L8002e30c:
  lbu $s1, 0($s0)
L8002e310:
  sll $zero, $zero, 0x0
L8002e314:
  andi $v0, $s1, 0x1
L8002e318:
  beq $v0, $zero, L8002e32c
L8002e31c:
  addiu $a0, $s2, 20
L8002e320:
  addiu $a1, $zero, 18
L8002e324:
  jal L8002e060
L8002e328:
  addiu $a2, $zero, 1
L8002e32c:
  andi $v0, $s1, 0x2
L8002e330:
  beq $v0, $zero, L8002e358
L8002e334:
  addiu $a0, $s2, 40
L8002e338:
  addiu $a1, $zero, 20
L8002e33c:
  jal L8002e060
L8002e340:
  addiu $a2, $zero, 2
L8002e344:
  lbu $v0, 1($s0)
L8002e348:
  j L8002e358
L8002e34c:
  sh $v0, 44($s2)
L8002e350:
  sw $zero, 20($s2)
L8002e354:
  sw $zero, 40($s2)
L8002e358:
  lw $ra, 52($sp)
L8002e35c:
  lw $s2, 48($sp)
L8002e360:
  lw $s1, 44($sp)
L8002e364:
  lw $s0, 40($sp)
L8002e368:
  jr $ra
L8002e36c:
  addiu $sp, $sp, 56
L8002e370:
  addiu $a1, $zero, 2
L8002e374:
  lui $v0, 0x800f
L8002e378:
  addiu $v0, $v0, -20464
L8002e37c:
  addiu $v1, $v0, 152
L8002e380:
  lb $v0, 48($v1)
L8002e384:
  sll $zero, $zero, 0x0
L8002e388:
  bltz $v0, L8002e3a4
L8002e38c:
  addiu $a1, $a1, -1
L8002e390:
  lhu $v0, 52($a0)
L8002e394:
  sll $zero, $zero, 0x0
L8002e398:
  ori $v0, $v0, 0x2
L8002e39c:
  jr $ra
L8002e3a0:
  sh $v0, 52($a0)
L8002e3a4:
  bgez $a1, L8002e380
L8002e3a8:
  addiu $v1, $v1, -76
L8002e3ac:
  jr $ra
L8002e3b0:
  sll $zero, $zero, 0x0
L8002e3b4:
  lhu $v1, 884($gp)
L8002e3b8:
  sll $zero, $zero, 0x0
L8002e3bc:
  andi $v0, $v1, 0x8000
L8002e3c0:
  beq $v0, $zero, L8002e3d0
L8002e3c4:
  ori $v0, $v1, 0x8000
L8002e3c8:
  jr $ra
L8002e3cc:
  addiu $v0, $zero, 1
L8002e3d0:
  sh $v0, 884($gp)
L8002e3d4:
  jr $ra
L8002e3d8:
  addu $v0, $zero, $zero
L8002e3dc:
  addiu $sp, $sp, -24
L8002e3e0:
  sw $ra, 16($sp)
L8002e3e4:
  jal L8002e3b4
L8002e3e8:
  sll $zero, $zero, 0x0
L8002e3ec:
  lw $ra, 16($sp)
L8002e3f0:
  sll $zero, $zero, 0x0
L8002e3f4:
  jr $ra
L8002e3f8:
  addiu $sp, $sp, 24
L8002e3fc:
  addiu $sp, $sp, -40
L8002e400:
  sw $ra, 36($sp)
L8002e404:
  jal 0x8004006c
L8002e408:
  sw $s0, 32($sp)
L8002e40c:
  addu $a0, $v0, $zero
L8002e410:
  jal 0x800400ac
L8002e414:
  addiu $a1, $zero, 2
L8002e418:
  addu $s0, $v0, $zero
L8002e41c:
  addu $a0, $s0, $zero
L8002e420:
  addiu $a1, $zero, 16
L8002e424:
  addiu $v0, $zero, 13
L8002e428:
  sw $v0, 24($sp)
L8002e42c:
  addiu $v0, $zero, 256
L8002e430:
  addiu $a2, $zero, 176
L8002e434:
  addu $a3, $zero, $zero
L8002e438:
  sw $zero, 16($sp)
L8002e43c:
  sw $zero, 20($sp)
L8002e440:
  jal 0x800404cc
L8002e444:
  sw $v0, 28($sp)
L8002e448:
  lhu $v0, 8($s0)
L8002e44c:
  addu $a0, $s0, $zero
L8002e450:
  ori $v0, $v0, 0x8
L8002e454:
  jal 0x80042918
L8002e458:
  sh $v0, 8($s0)
L8002e45c:
  addu $v0, $s0, $zero
L8002e460:
  lw $ra, 36($sp)
L8002e464:
  lw $s0, 32($sp)
L8002e468:
  jr $ra
L8002e46c:
  addiu $sp, $sp, 40
L8002e470:
  addiu $sp, $sp, -24
L8002e474:
  sw $ra, 20($sp)
L8002e478:
  jal L8002e3b4
L8002e47c:
  sw $s0, 16($sp)
L8002e480:
  bne $v0, $zero, L8002e524
L8002e484:
  lui $v0, 0x800f
L8002e488:
  addiu $s0, $v0, -20840
L8002e48c:
  lui $at, 0x800a
L8002e490:
  sh $zero, -20152($at)
L8002e494:
  lui $at, 0x800a
L8002e498:
  sh $zero, -20154($at)
L8002e49c:
  jal L8002e00c
L8002e4a0:
  addu $a0, $s0, $zero
L8002e4a4:
  lw $a2, 904($gp)
L8002e4a8:
  sll $zero, $zero, 0x0
L8002e4ac:
  addiu $a3, $a2, 2
L8002e4b0:
  sw $a3, 904($gp)
L8002e4b4:
  lbu $v0, 1($a2)
L8002e4b8:
  lbu $v1, 0($a2)
L8002e4bc:
  sll $v0, $v0, 0x8
L8002e4c0:
  or $v1, $v1, $v0
L8002e4c4:
  andi $v0, $v1, 0x8000
L8002e4c8:
  sh $v1, 872($gp)
L8002e4cc:
  beq $v0, $zero, L8002e518
L8002e4d0:
  andi $v0, $v1, 0xfff
L8002e4d4:
  addiu $a1, $a2, 4
L8002e4d8:
  sh $v0, 872($gp)
L8002e4dc:
  sw $a1, 904($gp)
L8002e4e0:
  lbu $a0, 2($a2)
L8002e4e4:
  lbu $v0, 1($a3)
L8002e4e8:
  addiu $v1, $a2, 6
L8002e4ec:
  sw $v1, 904($gp)
L8002e4f0:
  sll $v0, $v0, 0x8
L8002e4f4:
  or $a0, $a0, $v0
L8002e4f8:
  lui $at, 0x800a
L8002e4fc:
  sh $a0, -20154($at)
L8002e500:
  lbu $v0, 1($a1)
L8002e504:
  lbu $v1, 4($a2)
L8002e508:
  sll $v0, $v0, 0x8
L8002e50c:
  or $v1, $v1, $v0
L8002e510:
  lui $at, 0x800a
L8002e514:
  sh $v1, -20152($at)
L8002e518:
  lhu $a1, 872($gp)
L8002e51c:
  jal L8002df2c
L8002e520:
  addu $a0, $s0, $zero
L8002e524:
  lhu $a1, 884($gp)
L8002e528:
  sll $zero, $zero, 0x0
L8002e52c:
  andi $v0, $a1, 0x800
L8002e530:
  bne $v0, $zero, L8002e584
L8002e534:
  lui $v0, 0x800f
L8002e538:
  lui $v0, 0x200
L8002e53c:
  ori $v0, $v0, 0x30
L8002e540:
  lui $v1, 0x800a
L8002e544:
  lw $v1, -20236($v1)
L8002e548:
  lui $a0, 0x800a
L8002e54c:
  lw $a0, -20172($a0)
L8002e550:
  and $v1, $v1, $v0
L8002e554:
  or $v1, $v1, $a0
L8002e558:
  bne $v1, $zero, L8002e59c
L8002e55c:
  ori $v0, $a1, 0x800
L8002e560:
  sh $v0, 884($gp)
L8002e564:
  lui $a0, 0x800f
L8002e568:
  addiu $a0, $a0, -20840
L8002e56c:
  jal L8002e128
L8002e570:
  addiu $a1, $zero, -1
L8002e574:
  jal 0x800157dc
L8002e578:
  sll $zero, $zero, 0x0
L8002e57c:
  j L8002e59c
L8002e580:
  sll $zero, $zero, 0x0
L8002e584:
  lbu $v0, -24882($v0)
L8002e588:
  sll $zero, $zero, 0x0
L8002e58c:
  andi $v0, $v0, 0x80
L8002e590:
  bne $v0, $zero, L8002e59c
L8002e594:
  sll $zero, $zero, 0x0
L8002e598:
  sh $zero, 884($gp)
L8002e59c:
  lw $ra, 20($sp)
L8002e5a0:
  lw $s0, 16($sp)
L8002e5a4:
  jr $ra
L8002e5a8:
  addiu $sp, $sp, 24
L8002e5ac:
  addiu $sp, $sp, -40
L8002e5b0:
  sw $ra, 32($sp)
L8002e5b4:
  sw $s1, 28($sp)
L8002e5b8:
  jal L8002e3b4
L8002e5bc:
  sw $s0, 24($sp)
L8002e5c0:
  bne $v0, $zero, L8002e668
L8002e5c4:
  addu $a0, $zero, $zero
L8002e5c8:
  lw $v1, 904($gp)
L8002e5cc:
  addiu $a1, $zero, 2
L8002e5d0:
  addu $v0, $v1, $a1
L8002e5d4:
  sw $v0, 904($gp)
L8002e5d8:
  lbu $s0, 0($v1)
L8002e5dc:
  lhu $v0, 924($gp)
L8002e5e0:
  lbu $v1, 1($v1)
L8002e5e4:
  ori $v0, $v0, 0x4000
L8002e5e8:
  sll $v1, $v1, 0x8
L8002e5ec:
  sh $v0, 924($gp)
L8002e5f0:
  jal L8003b6ac
L8002e5f4:
  or $s0, $s0, $v1
L8002e5f8:
  addu $a0, $zero, $zero
L8002e5fc:
  andi $a1, $s0, 0xfff
L8002e600:
  addiu $v0, $zero, 288
L8002e604:
  sw $v0, 16($sp)
L8002e608:
  addiu $v0, $zero, 48
L8002e60c:
  addiu $a2, $zero, 16
L8002e610:
  addiu $a3, $zero, 176
L8002e614:
  jal L80035be4
L8002e618:
  sw $v0, 20($sp)
L8002e61c:
  addu $s1, $v0, $zero
L8002e620:
  jal L8002e370
L8002e624:
  addu $a0, $s1, $zero
L8002e628:
  lhu $v0, 52($s1)
L8002e62c:
  andi $s0, $s0, 0x8000
L8002e630:
  ori $v0, $v0, 0x8
L8002e634:
  beq $s0, $zero, L8002e654
L8002e638:
  sh $v0, 52($s1)
L8002e63c:
  lhu $v0, 884($gp)
L8002e640:
  lhu $v1, 52($s1)
L8002e644:
  ori $v0, $v0, 0x4000
L8002e648:
  andi $v1, $v1, 0xfff7
L8002e64c:
  sh $v0, 884($gp)
L8002e650:
  sh $v1, 52($s1)
L8002e654:
  lhu $v0, 884($gp)
L8002e658:
  sll $zero, $zero, 0x0
L8002e65c:
  sh $v0, 900($gp)
L8002e660:
  j L8002e6a4
L8002e664:
  sll $zero, $zero, 0x0
L8002e668:
  lhu $v0, 924($gp)
L8002e66c:
  sll $zero, $zero, 0x0
L8002e670:
  andi $v0, $v0, 0x4000
L8002e674:
  bne $v0, $zero, L8002e6a4
L8002e678:
  sll $zero, $zero, 0x0
L8002e67c:
  lhu $v0, 884($gp)
L8002e680:
  sll $zero, $zero, 0x0
L8002e684:
  andi $v0, $v0, 0x4000
L8002e688:
  bne $v0, $zero, L8002e69c
L8002e68c:
  sll $zero, $zero, 0x0
L8002e690:
  lui $a0, 0x800f
L8002e694:
  jal L80035b7c
L8002e698:
  addiu $a0, $a0, -20232
L8002e69c:
  sh $zero, 900($gp)
L8002e6a0:
  sh $zero, 884($gp)
L8002e6a4:
  lw $ra, 32($sp)
L8002e6a8:
  lw $s1, 28($sp)
L8002e6ac:
  lw $s0, 24($sp)
L8002e6b0:
  jr $ra
L8002e6b4:
  addiu $sp, $sp, 40
L8002e6b8:
  lw $a2, 904($gp)
L8002e6bc:
  sh $zero, 930($gp)
L8002e6c0:
  sh $zero, 928($gp)
L8002e6c4:
  addiu $a3, $a2, 2
L8002e6c8:
  sw $a3, 904($gp)
L8002e6cc:
  lbu $v1, 1($a2)
L8002e6d0:
  lbu $v0, 0($a2)
L8002e6d4:
  sll $v1, $v1, 0x8
L8002e6d8:
  or $v0, $v0, $v1
L8002e6dc:
  sh $v0, 872($gp)
L8002e6e0:
  andi $v0, $v0, 0x8000
L8002e6e4:
  beq $v0, $zero, L8002e720
L8002e6e8:
  addiu $a1, $a2, 4
L8002e6ec:
  sw $a1, 904($gp)
L8002e6f0:
  lbu $a0, 2($a2)
L8002e6f4:
  lbu $v0, 1($a3)
L8002e6f8:
  addiu $v1, $a2, 6
L8002e6fc:
  sw $v1, 904($gp)
L8002e700:
  sll $v0, $v0, 0x8
L8002e704:
  or $a0, $a0, $v0
L8002e708:
  sh $a0, 928($gp)
L8002e70c:
  lbu $v0, 1($a1)
L8002e710:
  lbu $v1, 4($a2)
L8002e714:
  sll $v0, $v0, 0x8
L8002e718:
  or $v1, $v1, $v0
L8002e71c:
  sh $v1, 930($gp)
L8002e720:
  addiu $v0, $zero, 5
L8002e724:
  sh $v0, 884($gp)
L8002e728:
  jr $ra
L8002e72c:
  sll $zero, $zero, 0x0
L8002e730:
  addiu $sp, $sp, -56
L8002e734:
  sw $ra, 48($sp)
L8002e738:
  sw $s1, 44($sp)
L8002e73c:
  jal L8002e3b4
L8002e740:
  sw $s0, 40($sp)
L8002e744:
  bne $v0, $zero, L8002e790
L8002e748:
  lui $v0, 0x200
L8002e74c:
  lui $a1, 0x800f
L8002e750:
  addiu $a0, $a1, -25232
L8002e754:
  addiu $a2, $zero, 320
L8002e758:
  lui $v1, 0x800a
L8002e75c:
  lbu $v1, -20308($v1)
L8002e760:
  addiu $v0, $zero, 160
L8002e764:
  sh $zero, -25232($a1)
L8002e768:
  sh $zero, 2($a0)
L8002e76c:
  sh $a2, 4($a0)
L8002e770:
  bne $v1, $zero, L8002e77c
L8002e774:
  sh $v0, 6($a0)
L8002e778:
  sh $a2, -25232($a1)
L8002e77c:
  addiu $a1, $zero, 448
L8002e780:
  jal 0x8007fa38
L8002e784:
  addiu $a2, $zero, 256
L8002e788:
  j L8002e904
L8002e78c:
  sll $zero, $zero, 0x0
L8002e790:
  ori $v0, $v0, 0x30
L8002e794:
  lui $v1, 0x800a
L8002e798:
  lw $v1, -20236($v1)
L8002e79c:
  lui $a0, 0x800a
L8002e7a0:
  lw $a0, -20172($a0)
L8002e7a4:
  and $v1, $v1, $v0
L8002e7a8:
  or $v1, $v1, $a0
L8002e7ac:
  bne $v1, $zero, L8002e904
L8002e7b0:
  lui $v0, 0x800f
L8002e7b4:
  lbu $v0, -24882($v0)
L8002e7b8:
  sll $zero, $zero, 0x0
L8002e7bc:
  andi $v0, $v0, 0x80
L8002e7c0:
  bne $v0, $zero, L8002e904
L8002e7c4:
  sll $zero, $zero, 0x0
L8002e7c8:
  lhu $v1, 884($gp)
L8002e7cc:
  sll $zero, $zero, 0x0
L8002e7d0:
  andi $v0, $v1, 0x4000
L8002e7d4:
  bne $v0, $zero, L8002e8a0
L8002e7d8:
  andi $v0, $v1, 0x2000
L8002e7dc:
  ori $v0, $v1, 0x4000
L8002e7e0:
  sh $v0, 884($gp)
L8002e7e4:
  jal 0x8004006c
L8002e7e8:
  sll $zero, $zero, 0x0
L8002e7ec:
  addu $a0, $v0, $zero
L8002e7f0:
  jal 0x800400ac
L8002e7f4:
  addiu $a1, $zero, 3
L8002e7f8:
  addu $s0, $v0, $zero
L8002e7fc:
  addu $a0, $s0, $zero
L8002e800:
  addu $a1, $zero, $zero
L8002e804:
  addu $a2, $a1, $zero
L8002e808:
  addiu $v0, $zero, 160
L8002e80c:
  sw $v0, 16($sp)
L8002e810:
  addiu $v0, $zero, 23
L8002e814:
  sw $v0, 28($sp)
L8002e818:
  addiu $v0, $zero, 244
L8002e81c:
  addiu $a3, $zero, 320
L8002e820:
  sw $zero, 20($sp)
L8002e824:
  sw $zero, 24($sp)
L8002e828:
  sw $zero, 32($sp)
L8002e82c:
  jal 0x80040510
L8002e830:
  sw $v0, 36($sp)
L8002e834:
  lui $v0, 0x800f
L8002e838:
  addiu $s1, $v0, -20840
L8002e83c:
  addu $a0, $s1, $zero
L8002e840:
  lw $v0, 4($s0)
L8002e844:
  lui $v1, 0x200
L8002e848:
  sw $s0, 888($gp)
L8002e84c:
  or $v0, $v0, $v1
L8002e850:
  jal L8002e00c
L8002e854:
  sw $v0, 4($s0)
L8002e858:
  lhu $v0, 928($gp)
L8002e85c:
  lhu $v1, 930($gp)
L8002e860:
  lui $a0, 0x800a
L8002e864:
  lbu $a0, -20155($a0)
L8002e868:
  lui $at, 0x800a
L8002e86c:
  sh $v0, -20154($at)
L8002e870:
  lui $at, 0x800a
L8002e874:
  sh $v1, -20152($at)
L8002e878:
  bne $a0, $zero, L8002e888
L8002e87c:
  sll $zero, $zero, 0x0
L8002e880:
  jal 0x80015c84
L8002e884:
  sll $zero, $zero, 0x0
L8002e888:
  lhu $a1, 872($gp)
L8002e88c:
  addu $a0, $s1, $zero
L8002e890:
  jal L8002df2c
L8002e894:
  andi $a1, $a1, 0xfff
L8002e898:
  j L8002e904
L8002e89c:
  sll $zero, $zero, 0x0
L8002e8a0:
  bne $v0, $zero, L8002e900
L8002e8a4:
  ori $v0, $v1, 0x2000
L8002e8a8:
  lw $a0, 888($gp)
L8002e8ac:
  sh $v0, 884($gp)
L8002e8b0:
  jal 0x8004036c
L8002e8b4:
  sll $zero, $zero, 0x0
L8002e8b8:
  lui $a0, 0x800f
L8002e8bc:
  addiu $a0, $a0, -20840
L8002e8c0:
  jal L8002e128
L8002e8c4:
  addiu $a1, $zero, -1
L8002e8c8:
  lui $v0, 0x800a
L8002e8cc:
  lbu $v0, -20155($v0)
L8002e8d0:
  sll $zero, $zero, 0x0
L8002e8d4:
  bne $v0, $zero, L8002e904
L8002e8d8:
  sll $zero, $zero, 0x0
L8002e8dc:
  lhu $v0, 872($gp)
L8002e8e0:
  sll $zero, $zero, 0x0
L8002e8e4:
  andi $v0, $v0, 0x4000
L8002e8e8:
  bne $v0, $zero, L8002e904
L8002e8ec:
  sll $zero, $zero, 0x0
L8002e8f0:
  jal 0x80015c0c
L8002e8f4:
  sll $zero, $zero, 0x0
L8002e8f8:
  j L8002e904
L8002e8fc:
  sll $zero, $zero, 0x0
L8002e900:
  sh $zero, 884($gp)
L8002e904:
  lw $ra, 48($sp)
L8002e908:
  lw $s1, 44($sp)
L8002e90c:
  lw $s0, 40($sp)
L8002e910:
  jr $ra
L8002e914:
  addiu $sp, $sp, 56
L8002e918:
  lw $a1, 904($gp)
L8002e91c:
  addiu $sp, $sp, -24
L8002e920:
  sw $ra, 20($sp)
L8002e924:
  sw $s0, 16($sp)
L8002e928:
  addiu $a2, $a1, 2
L8002e92c:
  sw $a2, 904($gp)
L8002e930:
  lbu $v0, 1($a1)
L8002e934:
  lbu $v1, 0($a1)
L8002e938:
  sll $v0, $v0, 0x8
L8002e93c:
  or $v1, $v1, $v0
L8002e940:
  andi $v0, $v1, 0x4000
L8002e944:
  beq $v0, $zero, L8002e95c
L8002e948:
  addu $a0, $v1, $zero
L8002e94c:
  jal L8002cce4
L8002e950:
  andi $a0, $v1, 0xbfff
L8002e954:
  j L8002e98c
L8002e958:
  sll $zero, $zero, 0x0
L8002e95c:
  addiu $v0, $a1, 4
L8002e960:
  sw $v0, 904($gp)
L8002e964:
  lbu $v0, 1($a2)
L8002e968:
  lbu $v1, 2($a1)
L8002e96c:
  sll $v0, $v0, 0x8
L8002e970:
  jal L8002cca8
L8002e974:
  or $s0, $v1, $v0
L8002e978:
  beq $v0, $zero, L8002e98c
L8002e97c:
  lui $v0, 0x801b
L8002e980:
  addiu $v0, $v0, -32768
L8002e984:
  addu $v0, $s0, $v0
L8002e988:
  sw $v0, 904($gp)
L8002e98c:
  lw $ra, 20($sp)
L8002e990:
  lw $s0, 16($sp)
L8002e994:
  sh $zero, 884($gp)
L8002e998:
  jr $ra
L8002e99c:
  addiu $sp, $sp, 24
L8002e9a0:
  lw $a0, 904($gp)
L8002e9a4:
  sll $zero, $zero, 0x0
L8002e9a8:
  addiu $a2, $a0, 2
L8002e9ac:
  sw $a2, 904($gp)
L8002e9b0:
  lbu $v1, 0($a0)
L8002e9b4:
  lbu $v0, 1($a0)
L8002e9b8:
  addiu $a3, $a0, 4
L8002e9bc:
  sw $a3, 904($gp)
L8002e9c0:
  sll $v0, $v0, 0x8
L8002e9c4:
  or $v1, $v1, $v0
L8002e9c8:
  sh $v1, 928($gp)
L8002e9cc:
  lbu $a1, 2($a0)
L8002e9d0:
  lbu $v0, 1($a2)
L8002e9d4:
  addiu $v1, $a0, 6
L8002e9d8:
  sw $v1, 904($gp)
L8002e9dc:
  sll $v0, $v0, 0x8
L8002e9e0:
  or $a1, $a1, $v0
L8002e9e4:
  sh $a1, 930($gp)
L8002e9e8:
  lbu $a0, 4($a0)
L8002e9ec:
  lbu $v0, 1($a3)
L8002e9f0:
  addiu $v1, $zero, 7
L8002e9f4:
  sh $v1, 884($gp)
L8002e9f8:
  sll $v0, $v0, 0x8
L8002e9fc:
  or $a0, $a0, $v0
L8002ea00:
  sh $a0, 916($gp)
L8002ea04:
  jr $ra
L8002ea08:
  sll $zero, $zero, 0x0
L8002ea0c:
  addiu $sp, $sp, -24
L8002ea10:
  sw $ra, 16($sp)
L8002ea14:
  jal L8002e3b4
L8002ea18:
  sll $zero, $zero, 0x0
L8002ea1c:
  bne $v0, $zero, L8002eacc
L8002ea20:
  sll $zero, $zero, 0x0
L8002ea24:
  lui $a2, 0x800a
L8002ea28:
  lh $a2, -20154($a2)
L8002ea2c:
  lh $v1, 928($gp)
L8002ea30:
  lh $a0, 916($gp)
L8002ea34:
  subu $v1, $v1, $a2
L8002ea38:
  sll $v1, $v1, 0x10
L8002ea3c:
  .word 0x0064001a
L8002ea40:
  bne $a0, $zero, L8002ea4c
L8002ea44:
  sll $zero, $zero, 0x0
L8002ea48:
  .word 0x0007000d
L8002ea4c:
  addiu $at, $zero, -1
L8002ea50:
  bne $a0, $at, L8002ea64
L8002ea54:
  lui $at, 0x8000
L8002ea58:
  bne $v1, $at, L8002ea64
L8002ea5c:
  sll $zero, $zero, 0x0
L8002ea60:
  .word 0x0006000d
L8002ea64:
  mflo $v1
L8002ea68:
  lui $a1, 0x800a
L8002ea6c:
  lh $a1, -20152($a1)
L8002ea70:
  lh $v0, 930($gp)
L8002ea74:
  sll $zero, $zero, 0x0
L8002ea78:
  subu $v0, $v0, $a1
L8002ea7c:
  sll $v0, $v0, 0x10
L8002ea80:
  .word 0x0044001a
L8002ea84:
  bne $a0, $zero, L8002ea90
L8002ea88:
  sll $zero, $zero, 0x0
L8002ea8c:
  .word 0x0007000d
L8002ea90:
  addiu $at, $zero, -1
L8002ea94:
  bne $a0, $at, L8002eaa8
L8002ea98:
  lui $at, 0x8000
L8002ea9c:
  bne $v0, $at, L8002eaa8
L8002eaa0:
  sll $zero, $zero, 0x0
L8002eaa4:
  .word 0x0006000d
L8002eaa8:
  mflo $v0
L8002eaac:
  sll $a2, $a2, 0x10
L8002eab0:
  ori $a2, $a2, 0x8000
L8002eab4:
  sw $a2, 892($gp)
L8002eab8:
  sll $a1, $a1, 0x10
L8002eabc:
  ori $a1, $a1, 0x8000
L8002eac0:
  sw $a1, 896($gp)
L8002eac4:
  sw $v1, 908($gp)
L8002eac8:
  sw $v0, 912($gp)
L8002eacc:
  lw $v0, 892($gp)
L8002ead0:
  lw $a0, 908($gp)
L8002ead4:
  lw $v1, 896($gp)
L8002ead8:
  lw $a1, 912($gp)
L8002eadc:
  addu $v0, $v0, $a0
L8002eae0:
  sw $v0, 892($gp)
L8002eae4:
  sra $v0, $v0, 0x10
L8002eae8:
  lui $at, 0x800a
L8002eaec:
  sh $v0, -20154($at)
L8002eaf0:
  lhu $v0, 916($gp)
L8002eaf4:
  addu $v1, $v1, $a1
L8002eaf8:
  sw $v1, 896($gp)
L8002eafc:
  sra $v1, $v1, 0x10
L8002eb00:
  lui $at, 0x800a
L8002eb04:
  sh $v1, -20152($at)
L8002eb08:
  addiu $v0, $v0, -1
L8002eb0c:
  sh $v0, 916($gp)
L8002eb10:
  sll $v0, $v0, 0x10
L8002eb14:
  bgtz $v0, L8002eb38
L8002eb18:
  sll $zero, $zero, 0x0
L8002eb1c:
  lhu $v0, 928($gp)
L8002eb20:
  lhu $v1, 930($gp)
L8002eb24:
  sh $zero, 884($gp)
L8002eb28:
  lui $at, 0x800a
L8002eb2c:
  sh $v0, -20154($at)
L8002eb30:
  lui $at, 0x800a
L8002eb34:
  sh $v1, -20152($at)
L8002eb38:
  lw $ra, 16($sp)
L8002eb3c:
  sll $zero, $zero, 0x0
L8002eb40:
  jr $ra
L8002eb44:
  addiu $sp, $sp, 24
L8002eb48:
  lw $v0, 904($gp)
L8002eb4c:
  sll $zero, $zero, 0x0
L8002eb50:
  lbu $v1, 0($v0)
L8002eb54:
  addiu $v0, $v0, 1
L8002eb58:
  sw $v0, 904($gp)
L8002eb5c:
  addiu $v0, $zero, 5
L8002eb60:
  lui $at, 0x800a
L8002eb64:
  sb $v0, -19860($at)
L8002eb68:
  lui $at, 0x800a
L8002eb6c:
  sb $v1, -19613($at)
L8002eb70:
  jr $ra
L8002eb74:
  sll $zero, $zero, 0x0
L8002eb78:
  addiu $sp, $sp, -40
L8002eb7c:
  sw $ra, 36($sp)
L8002eb80:
  sw $s4, 32($sp)
L8002eb84:
  sw $s3, 28($sp)
L8002eb88:
  sw $s2, 24($sp)
L8002eb8c:
  sw $s1, 20($sp)
L8002eb90:
  jal L8002e3b4
L8002eb94:
  sw $s0, 16($sp)
L8002eb98:
  bne $v0, $zero, L8002ec30
L8002eb9c:
  lui $v1, 0x800f
L8002eba0:
  lw $v0, 904($gp)
L8002eba4:
  addiu $v1, $v1, -20464
L8002eba8:
  lbu $s4, 0($v0)
L8002ebac:
  addiu $v0, $v0, 1
L8002ebb0:
  sw $v0, 904($gp)
L8002ebb4:
  lbu $s2, 0($v0)
L8002ebb8:
  addiu $v0, $v0, 1
L8002ebbc:
  sw $v0, 904($gp)
L8002ebc0:
  andi $s3, $s2, 0x80
L8002ebc4:
  sra $s1, $s3, 0x7
L8002ebc8:
  sll $v0, $s1, 0x2
L8002ebcc:
  addu $v0, $v0, $s1
L8002ebd0:
  sll $v0, $v0, 0x2
L8002ebd4:
  subu $v0, $v0, $s1
L8002ebd8:
  sll $v0, $v0, 0x2
L8002ebdc:
  addu $s0, $v0, $v1
L8002ebe0:
  sw $s0, 876($gp)
L8002ebe4:
  lb $v0, 48($s0)
L8002ebe8:
  sll $zero, $zero, 0x0
L8002ebec:
  bltz $v0, L8002ebfc
L8002ebf0:
  sll $zero, $zero, 0x0
L8002ebf4:
  jal L80039fd4
L8002ebf8:
  addu $a0, $s0, $zero
L8002ebfc:
  jal L80039e9c
L8002ec00:
  sll $zero, $zero, 0x0
L8002ec04:
  jal L80039f44
L8002ec08:
  addu $a0, $s0, $zero
L8002ec0c:
  andi $v0, $s2, 0xf
L8002ec10:
  sb $v0, 49($s0)
L8002ec14:
  addiu $v0, $zero, 2
L8002ec18:
  sb $s4, 48($s0)
L8002ec1c:
  sb $s1, 60($s0)
L8002ec20:
  beq $s3, $zero, L8002ec30
L8002ec24:
  sb $v0, 51($s0)
L8002ec28:
  addiu $v0, $zero, 216
L8002ec2c:
  sh $v0, 52($s0)
L8002ec30:
  jal L8003b50c
L8002ec34:
  addu $a0, $zero, $zero
L8002ec38:
  lw $v0, 876($gp)
L8002ec3c:
  sll $zero, $zero, 0x0
L8002ec40:
  lbu $v0, 51($v0)
L8002ec44:
  sll $zero, $zero, 0x0
L8002ec48:
  bne $v0, $zero, L8002ec54
L8002ec4c:
  sll $zero, $zero, 0x0
L8002ec50:
  sh $zero, 884($gp)
L8002ec54:
  lw $ra, 36($sp)
L8002ec58:
  lw $s4, 32($sp)
L8002ec5c:
  lw $s3, 28($sp)
L8002ec60:
  lw $s2, 24($sp)
L8002ec64:
  lw $s1, 20($sp)
L8002ec68:
  lw $s0, 16($sp)
L8002ec6c:
  jr $ra
L8002ec70:
  addiu $sp, $sp, 40
L8002ec74:
  addiu $sp, $sp, -24
L8002ec78:
  sw $ra, 20($sp)
L8002ec7c:
  jal L8002e3b4
L8002ec80:
  sw $s0, 16($sp)
L8002ec84:
  bne $v0, $zero, L8002ed78
L8002ec88:
  lui $v0, 0x200
L8002ec8c:
  lw $v1, 904($gp)
L8002ec90:
  sll $zero, $zero, 0x0
L8002ec94:
  lbu $v0, 0($v1)
L8002ec98:
  addiu $v1, $v1, 1
L8002ec9c:
  sw $v1, 904($gp)
L8002eca0:
  addu $s0, $v0, $zero
L8002eca4:
  andi $v0, $s0, 0x3f
L8002eca8:
  bne $v0, $zero, L8002ecfc
L8002ecac:
  andi $v0, $s0, 0x1
L8002ecb0:
  andi $v0, $s0, 0x40
L8002ecb4:
  beq $v0, $zero, L8002ecdc
L8002ecb8:
  addiu $v0, $v1, 2
L8002ecbc:
  sw $v0, 904($gp)
L8002ecc0:
  lbu $a0, 1($v1)
L8002ecc4:
  lbu $v0, 0($v1)
L8002ecc8:
  sll $a0, $a0, 0x8
L8002eccc:
  jal L8003fee0
L8002ecd0:
  or $a0, $v0, $a0
L8002ecd4:
  j L8002ed68
L8002ecd8:
  andi $v0, $s0, 0x80
L8002ecdc:
  sw $v0, 904($gp)
L8002ece0:
  lbu $a0, 1($v1)
L8002ece4:
  lbu $v0, 0($v1)
L8002ece8:
  sll $a0, $a0, 0x8
L8002ecec:
  jal L8003ff08
L8002ecf0:
  or $a0, $v0, $a0
L8002ecf4:
  j L8002ed68
L8002ecf8:
  andi $v0, $s0, 0x80
L8002ecfc:
  beq $v0, $zero, L8002ed18
L8002ed00:
  andi $v0, $s0, 0x2
L8002ed04:
  lui $a0, 0x800a
L8002ed08:
  lw $a0, -19452($a0)
L8002ed0c:
  jal L8003ff08
L8002ed10:
  sll $zero, $zero, 0x0
L8002ed14:
  andi $v0, $s0, 0x2
L8002ed18:
  beq $v0, $zero, L8002ed4c
L8002ed1c:
  andi $v0, $s0, 0x4
L8002ed20:
  lw $v1, 904($gp)
L8002ed24:
  sll $zero, $zero, 0x0
L8002ed28:
  addiu $v0, $v1, 2
L8002ed2c:
  sw $v0, 904($gp)
L8002ed30:
  lbu $v0, 1($v1)
L8002ed34:
  lbu $v1, 0($v1)
L8002ed38:
  sll $v0, $v0, 0x8
L8002ed3c:
  or $v1, $v1, $v0
L8002ed40:
  lui $at, 0x800a
L8002ed44:
  sw $v1, -19452($at)
L8002ed48:
  andi $v0, $s0, 0x4
L8002ed4c:
  beq $v0, $zero, L8002ed68
L8002ed50:
  andi $v0, $s0, 0x80
L8002ed54:
  lui $v0, 0x800a
L8002ed58:
  lw $v0, -19456($v0)
L8002ed5c:
  lui $at, 0x800a
L8002ed60:
  sw $v0, -19452($at)
L8002ed64:
  andi $v0, $s0, 0x80
L8002ed68:
  beq $v0, $zero, L8002ed9c
L8002ed6c:
  sll $zero, $zero, 0x0
L8002ed70:
  j L8002eda0
L8002ed74:
  sll $zero, $zero, 0x0
L8002ed78:
  ori $v0, $v0, 0x30
L8002ed7c:
  lui $v1, 0x800a
L8002ed80:
  lw $v1, -20236($v1)
L8002ed84:
  lui $a0, 0x800a
L8002ed88:
  lw $a0, -20172($a0)
L8002ed8c:
  and $v1, $v1, $v0
L8002ed90:
  or $v1, $v1, $a0
L8002ed94:
  bne $v1, $zero, L8002eda0
L8002ed98:
  sll $zero, $zero, 0x0
L8002ed9c:
  sh $zero, 884($gp)
L8002eda0:
  lw $ra, 20($sp)
L8002eda4:
  lw $s0, 16($sp)
L8002eda8:
  jr $ra
L8002edac:
  addiu $sp, $sp, 24
L8002edb0:
  addiu $sp, $sp, -24
L8002edb4:
  sw $ra, 20($sp)
L8002edb8:
  jal L8002e3b4
L8002edbc:
  sw $s0, 16($sp)
L8002edc0:
  bne $v0, $zero, L8002ee0c
L8002edc4:
  sll $zero, $zero, 0x0
L8002edc8:
  lw $v0, 904($gp)
L8002edcc:
  sll $zero, $zero, 0x0
L8002edd0:
  lbu $v1, 0($v0)
L8002edd4:
  addiu $v0, $v0, 1
L8002edd8:
  sw $v0, 904($gp)
L8002eddc:
  andi $a0, $v1, 0x7f
L8002ede0:
  bne $a0, $zero, L8002edf8
L8002ede4:
  addu $s0, $v1, $zero
L8002ede8:
  jal L8003ff34
L8002edec:
  sll $zero, $zero, 0x0
L8002edf0:
  j L8002ee04
L8002edf4:
  andi $v0, $s0, 0x80
L8002edf8:
  jal L8003ff58
L8002edfc:
  sll $zero, $zero, 0x0
L8002ee00:
  andi $v0, $s0, 0x80
L8002ee04:
  bne $v0, $zero, L8002ee10
L8002ee08:
  sll $zero, $zero, 0x0
L8002ee0c:
  sh $zero, 884($gp)
L8002ee10:
  lw $ra, 20($sp)
L8002ee14:
  lw $s0, 16($sp)
L8002ee18:
  jr $ra
L8002ee1c:
  addiu $sp, $sp, 24
L8002ee20:
  lw $v0, 904($gp)
L8002ee24:
  sll $zero, $zero, 0x0
L8002ee28:
  addiu $v1, $v0, 2
L8002ee2c:
  sw $v1, 904($gp)
L8002ee30:
  lbu $v1, 0($v0)
L8002ee34:
  lbu $v0, 1($v0)
L8002ee38:
  sh $zero, 884($gp)
L8002ee3c:
  sll $v0, $v0, 0x8
L8002ee40:
  or $v1, $v1, $v0
L8002ee44:
  lui $v0, 0x801b
L8002ee48:
  addiu $v0, $v0, -32768
L8002ee4c:
  addu $v1, $v1, $v0
L8002ee50:
  sw $v1, 904($gp)
L8002ee54:
  jr $ra
L8002ee58:
  sll $zero, $zero, 0x0
L8002ee5c:
  lui $v0, 0x801d
L8002ee60:
  addiu $a0, $v0, 512
L8002ee64:
  addu $v1, $zero, $zero
L8002ee68:
  lhu $v0, 0($a0)
L8002ee6c:
  sll $zero, $zero, 0x0
L8002ee70:
  bne $v0, $zero, L8002ee80
L8002ee74:
  addiu $v1, $v1, 1
L8002ee78:
  jr $ra
L8002ee7c:
  addu $v0, $zero, $zero
L8002ee80:
  slti $v0, $v1, 40
L8002ee84:
  bne $v0, $zero, L8002ee68
L8002ee88:
  addiu $a0, $a0, 2
L8002ee8c:
  jr $ra
L8002ee90:
  addiu $v0, $zero, 1
L8002ee94:
  addiu $sp, $sp, -48
L8002ee98:
  sw $ra, 40($sp)
L8002ee9c:
  sw $s1, 36($sp)
L8002eea0:
  jal L8002e3b4
L8002eea4:
  sw $s0, 32($sp)
L8002eea8:
  bne $v0, $zero, L8002ef28
L8002eeac:
  addu $a0, $zero, $zero
L8002eeb0:
  addiu $a1, $zero, 2
L8002eeb4:
  lw $v1, 904($gp)
L8002eeb8:
  addiu $v0, $zero, -1
L8002eebc:
  lui $at, 0x800a
L8002eec0:
  sb $v0, -19635($at)
L8002eec4:
  addu $a3, $v1, $a1
L8002eec8:
  sw $a3, 904($gp)
L8002eecc:
  lbu $t0, 0($v1)
L8002eed0:
  lbu $a2, 1($v1)
L8002eed4:
  addiu $v0, $v1, 4
L8002eed8:
  sw $v0, 904($gp)
L8002eedc:
  lbu $v0, 1($a3)
L8002eee0:
  lbu $v1, 2($v1)
L8002eee4:
  sll $v0, $v0, 0x8
L8002eee8:
  or $v1, $v1, $v0
L8002eeec:
  sll $a2, $a2, 0x8
L8002eef0:
  sh $v1, 926($gp)
L8002eef4:
  jal L8003b6ac
L8002eef8:
  or $s0, $t0, $a2
L8002eefc:
  addu $a0, $zero, $zero
L8002ef00:
  addu $a1, $s0, $zero
L8002ef04:
  addiu $a2, $zero, 16
L8002ef08:
  addiu $a3, $zero, 176
L8002ef0c:
  addiu $v0, $zero, 288
L8002ef10:
  sw $v0, 16($sp)
L8002ef14:
  addiu $v0, $zero, 48
L8002ef18:
  jal L80035be4
L8002ef1c:
  sw $v0, 20($sp)
L8002ef20:
  j L8002f1e4
L8002ef24:
  sll $zero, $zero, 0x0
L8002ef28:
  lhu $v0, 884($gp)
L8002ef2c:
  sll $zero, $zero, 0x0
L8002ef30:
  andi $v0, $v0, 0x80
L8002ef34:
  beq $v0, $zero, L8002ef78
L8002ef38:
  sll $zero, $zero, 0x0
L8002ef3c:
  jal L8003f70c
L8002ef40:
  sll $zero, $zero, 0x0
L8002ef44:
  beq $v0, $zero, L8002f41c
L8002ef48:
  addiu $v0, $zero, 4
L8002ef4c:
  lhu $v1, 884($gp)
L8002ef50:
  lui $at, 0x800a
L8002ef54:
  sb $v0, -19643($at)
L8002ef58:
  lui $at, 0x800a
L8002ef5c:
  sb $zero, -19635($at)
L8002ef60:
  lui $at, 0x800a
L8002ef64:
  sb $zero, -19636($at)
L8002ef68:
  andi $v1, $v1, 0xff7f
L8002ef6c:
  sh $v1, 884($gp)
L8002ef70:
  j L8002f41c
L8002ef74:
  sll $zero, $zero, 0x0
L8002ef78:
  jal L80039794
L8002ef7c:
  sll $zero, $zero, 0x0
L8002ef80:
  lhu $v1, 884($gp)
L8002ef84:
  sll $zero, $zero, 0x0
L8002ef88:
  andi $v0, $v1, 0x4000
L8002ef8c:
  bne $v0, $zero, L8002f08c
L8002ef90:
  lui $v0, 0x800f
L8002ef94:
  lui $v0, 0x800f
L8002ef98:
  addiu $a0, $v0, -20232
L8002ef9c:
  lhu $v0, 52($a0)
L8002efa0:
  sll $zero, $zero, 0x0
L8002efa4:
  andi $v0, $v0, 0x2000
L8002efa8:
  beq $v0, $zero, L8002f41c
L8002efac:
  sll $zero, $zero, 0x0
L8002efb0:
  jal L8003735c
L8002efb4:
  sll $zero, $zero, 0x0
L8002efb8:
  bne $v0, $zero, L8002f41c
L8002efbc:
  sll $zero, $zero, 0x0
L8002efc0:
  lhu $v0, 884($gp)
L8002efc4:
  sll $zero, $zero, 0x0
L8002efc8:
  ori $v0, $v0, 0x4000
L8002efcc:
  sh $v0, 884($gp)
L8002efd0:
  jal L8002ee5c
L8002efd4:
  sll $zero, $zero, 0x0
L8002efd8:
  bne $v0, $zero, L8002f000
L8002efdc:
  addu $a0, $zero, $zero
L8002efe0:
  lhu $v0, 884($gp)
L8002efe4:
  sll $zero, $zero, 0x0
L8002efe8:
  ori $v0, $v0, 0x200
L8002efec:
  sh $v0, 884($gp)
L8002eff0:
  jal L8003fee0
L8002eff4:
  addiu $a0, $zero, 42
L8002eff8:
  j L8002f41c
L8002effc:
  sll $zero, $zero, 0x0
L8002f000:
  jal L8003b6ac
L8002f004:
  addiu $a1, $zero, 2
L8002f008:
  addiu $a0, $zero, 3
L8002f00c:
  addiu $a1, $zero, 17
L8002f010:
  addiu $a2, $zero, -144
L8002f014:
  addiu $a3, $zero, 56
L8002f018:
  addiu $v0, $zero, 120
L8002f01c:
  sw $v0, 16($sp)
L8002f020:
  addiu $v0, $zero, 48
L8002f024:
  jal L80035be4
L8002f028:
  sw $v0, 20($sp)
L8002f02c:
  addu $s0, $v0, $zero
L8002f030:
  jal L8002e370
L8002f034:
  addu $a0, $s0, $zero
L8002f038:
  lhu $v0, 52($s0)
L8002f03c:
  sll $zero, $zero, 0x0
L8002f040:
  ori $v0, $v0, 0x24
L8002f044:
  sh $v0, 52($s0)
L8002f048:
  jal L80039794
L8002f04c:
  sll $zero, $zero, 0x0
L8002f050:
  lw $v0, 48($s0)
L8002f054:
  sll $zero, $zero, 0x0
L8002f058:
  beq $v0, $zero, L8002f048
L8002f05c:
  sll $zero, $zero, 0x0
L8002f060:
  lw $a0, 40($s0)
L8002f064:
  jal 0x80043178
L8002f068:
  sll $zero, $zero, 0x0
L8002f06c:
  addiu $a0, $zero, -1024
L8002f070:
  lhu $v1, 884($gp)
L8002f074:
  lw $v0, 40($s0)
L8002f078:
  ori $v1, $v1, 0x6000
L8002f07c:
  sh $a0, 96($v0)
L8002f080:
  sh $v1, 884($gp)
L8002f084:
  j L8002f41c
L8002f088:
  sll $zero, $zero, 0x0
L8002f08c:
  addiu $s0, $v0, -19932
L8002f090:
  lw $s1, 40($s0)
L8002f094:
  andi $v0, $v1, 0x400
L8002f098:
  beq $v0, $zero, L8002f194
L8002f09c:
  andi $v0, $v1, 0x800
L8002f0a0:
  bne $v0, $zero, L8002f110
L8002f0a4:
  lui $v0, 0x800f
L8002f0a8:
  addu $a0, $zero, $zero
L8002f0ac:
  ori $v0, $v1, 0x800
L8002f0b0:
  sh $v0, 884($gp)
L8002f0b4:
  jal L8003b6ac
L8002f0b8:
  addiu $a1, $zero, 2
L8002f0bc:
  addiu $a0, $zero, 2
L8002f0c0:
  addiu $a1, $zero, 18
L8002f0c4:
  addiu $a2, $zero, 144
L8002f0c8:
  addiu $a3, $zero, 112
L8002f0cc:
  addiu $v0, $zero, 24
L8002f0d0:
  sw $v0, 16($sp)
L8002f0d4:
  jal L80035be4
L8002f0d8:
  sw $v0, 20($sp)
L8002f0dc:
  addu $s0, $v0, $zero
L8002f0e0:
  jal L8002e370
L8002f0e4:
  addu $a0, $s0, $zero
L8002f0e8:
  lhu $v0, 52($s0)
L8002f0ec:
  sll $zero, $zero, 0x0
L8002f0f0:
  ori $v0, $v0, 0x20
L8002f0f4:
  sh $v0, 52($s0)
L8002f0f8:
  jal L80039794
L8002f0fc:
  sll $zero, $zero, 0x0
L8002f100:
  lw $v0, 48($s0)
L8002f104:
  sll $zero, $zero, 0x0
L8002f108:
  beq $v0, $zero, L8002f0f8
L8002f10c:
  lui $v0, 0x800f
L8002f110:
  addiu $a0, $v0, -20032
L8002f114:
  lhu $v0, 52($a0)
L8002f118:
  sll $zero, $zero, 0x0
L8002f11c:
  andi $v0, $v0, 0x2000
L8002f120:
  beq $v0, $zero, L8002f41c
L8002f124:
  sll $zero, $zero, 0x0
L8002f128:
  lhu $v0, 884($gp)
L8002f12c:
  sll $zero, $zero, 0x0
L8002f130:
  andi $v0, $v0, 0xf3ff
L8002f134:
  sh $v0, 884($gp)
L8002f138:
  jal L80035b7c
L8002f13c:
  sll $zero, $zero, 0x0
L8002f140:
  lui $v0, 0x800a
L8002f144:
  lb $v0, -19635($v0)
L8002f148:
  sll $zero, $zero, 0x0
L8002f14c:
  beq $v0, $zero, L8002f174
L8002f150:
  addiu $v0, $zero, 1
L8002f154:
  lui $at, 0x800a
L8002f158:
  sb $v0, -19864($at)
L8002f15c:
  addiu $v0, $zero, 5
L8002f160:
  lui $at, 0x800a
L8002f164:
  sb $v0, -19859($at)
L8002f168:
  addiu $v0, $zero, 8
L8002f16c:
  lui $at, 0x800a
L8002f170:
  sb $v0, -19860($at)
L8002f174:
  addiu $v0, $zero, 4
L8002f178:
  lui $at, 0x800a
L8002f17c:
  sb $v0, -19643($at)
L8002f180:
  addiu $v0, $zero, 2
L8002f184:
  lui $at, 0x800a
L8002f188:
  sb $v0, -19635($at)
L8002f18c:
  j L8002f41c
L8002f190:
  sll $zero, $zero, 0x0
L8002f194:
  andi $v0, $v1, 0x200
L8002f198:
  beq $v0, $zero, L8002f23c
L8002f19c:
  andi $v0, $v1, 0x800
L8002f1a0:
  bne $v0, $zero, L8002f1f4
L8002f1a4:
  addu $a0, $zero, $zero
L8002f1a8:
  ori $v0, $v1, 0x800
L8002f1ac:
  sh $v0, 884($gp)
L8002f1b0:
  jal L8003b6ac
L8002f1b4:
  addiu $a1, $zero, 2
L8002f1b8:
  addu $a0, $zero, $zero
L8002f1bc:
  addiu $a1, $zero, 28
L8002f1c0:
  addiu $a2, $zero, 16
L8002f1c4:
  addiu $a3, $zero, 176
L8002f1c8:
  addiu $v0, $zero, 288
L8002f1cc:
  sw $v0, 16($sp)
L8002f1d0:
  addiu $v0, $zero, 36
L8002f1d4:
  sw $v0, 20($sp)
L8002f1d8:
  addiu $v0, $zero, 4104
L8002f1dc:
  jal L80035c38
L8002f1e0:
  sw $v0, 24($sp)
L8002f1e4:
  jal L8002e370
L8002f1e8:
  addu $a0, $v0, $zero
L8002f1ec:
  j L8002f41c
L8002f1f0:
  sll $zero, $zero, 0x0
L8002f1f4:
  lhu $v0, -248($s0)
L8002f1f8:
  sll $zero, $zero, 0x0
L8002f1fc:
  andi $v0, $v0, 0x8
L8002f200:
  bne $v0, $zero, L8002f41c
L8002f204:
  sll $zero, $zero, 0x0
L8002f208:
  jal L8003fee0
L8002f20c:
  addiu $a0, $zero, 8
L8002f210:
  addiu $v0, $zero, 1
L8002f214:
  lui $at, 0x800a
L8002f218:
  sb $v0, -19864($at)
L8002f21c:
  addiu $v0, $zero, 5
L8002f220:
  lui $at, 0x800a
L8002f224:
  sb $v0, -19859($at)
L8002f228:
  addiu $v0, $zero, 8
L8002f22c:
  lui $at, 0x800a
L8002f230:
  sb $v0, -19860($at)
L8002f234:
  j L8002f41c
L8002f238:
  sll $zero, $zero, 0x0
L8002f23c:
  andi $v0, $v1, 0x1000
L8002f240:
  beq $v0, $zero, L8002f2a4
L8002f244:
  andi $v0, $v1, 0x800
L8002f248:
  bne $v0, $zero, L8002f268
L8002f24c:
  ori $v0, $v1, 0x800
L8002f250:
  sh $v0, 884($gp)
L8002f254:
  jal 0x80043178
L8002f258:
  addu $a0, $s1, $zero
L8002f25c:
  lw $v1, 40($s0)
L8002f260:
  addiu $v0, $zero, 1024
L8002f264:
  sh $v0, 96($v1)
L8002f268:
  lhu $v0, 96($s1)
L8002f26c:
  sll $zero, $zero, 0x0
L8002f270:
  addiu $v0, $v0, -64
L8002f274:
  sh $v0, 96($s1)
L8002f278:
  sll $v0, $v0, 0x10
L8002f27c:
  sra $a3, $v0, 0x10
L8002f280:
  bgtz $a3, L8002f29c
L8002f284:
  addu $a0, $s1, $zero
L8002f288:
  jal L80035b7c
L8002f28c:
  addu $a0, $s0, $zero
L8002f290:
  sh $zero, 884($gp)
L8002f294:
  j L8002f41c
L8002f298:
  sll $zero, $zero, 0x0
L8002f29c:
  j L8002f304
L8002f2a0:
  addiu $a1, $zero, -144
L8002f2a4:
  andi $v0, $v1, 0x2000
L8002f2a8:
  beq $v0, $zero, L8002f324
L8002f2ac:
  sll $zero, $zero, 0x0
L8002f2b0:
  lhu $v0, 96($s1)
L8002f2b4:
  sll $zero, $zero, 0x0
L8002f2b8:
  addiu $v0, $v0, 64
L8002f2bc:
  sh $v0, 96($s1)
L8002f2c0:
  sll $v0, $v0, 0x10
L8002f2c4:
  sra $a3, $v0, 0x10
L8002f2c8:
  bltz $a3, L8002f2fc
L8002f2cc:
  addiu $v0, $zero, 16
L8002f2d0:
  sh $v0, 48($s1)
L8002f2d4:
  lh $a1, 48($s1)
L8002f2d8:
  addiu $v0, $zero, 56
L8002f2dc:
  sh $v0, 50($s1)
L8002f2e0:
  lh $a2, 50($s1)
L8002f2e4:
  andi $v0, $v1, 0xdfff
L8002f2e8:
  sh $v0, 884($gp)
L8002f2ec:
  jal L80039934
L8002f2f0:
  addu $a0, $s0, $zero
L8002f2f4:
  j L8002f41c
L8002f2f8:
  sll $zero, $zero, 0x0
L8002f2fc:
  addu $a0, $s1, $zero
L8002f300:
  addiu $a1, $zero, 16
L8002f304:
  jal 0x80043230
L8002f308:
  addiu $a2, $zero, 56
L8002f30c:
  lh $a1, 48($s1)
L8002f310:
  lh $a2, 50($s1)
L8002f314:
  jal L80039934
L8002f318:
  addu $a0, $s0, $zero
L8002f31c:
  j L8002f41c
L8002f320:
  sll $zero, $zero, 0x0
L8002f324:
  jal L8003700c
L8002f328:
  addu $a0, $s0, $zero
L8002f32c:
  bne $v0, $zero, L8002f41c
L8002f330:
  sll $zero, $zero, 0x0
L8002f334:
  lui $v0, 0x800a
L8002f338:
  lhu $v0, -19560($v0)
L8002f33c:
  sll $zero, $zero, 0x0
L8002f340:
  andi $v0, $v0, 0xc0
L8002f344:
  beq $v0, $zero, L8002f41c
L8002f348:
  lui $v0, 0x801d
L8002f34c:
  lhu $v1, 926($gp)
L8002f350:
  addiu $s0, $v0, 0
L8002f354:
  sh $v1, 2012($s0)
L8002f358:
  lui $v1, 0x800a
L8002f35c:
  lb $v1, -19635($v1)
L8002f360:
  addiu $v0, $zero, 1
L8002f364:
  beq $v1, $v0, L8002f3c4
L8002f368:
  slti $v0, $v1, 2
L8002f36c:
  beq $v0, $zero, L8002f384
L8002f370:
  sll $zero, $zero, 0x0
L8002f374:
  beq $v1, $zero, L8002f3a4
L8002f378:
  sll $zero, $zero, 0x0
L8002f37c:
  j L8002f41c
L8002f380:
  sll $zero, $zero, 0x0
L8002f384:
  addiu $v0, $zero, 2
L8002f388:
  beq $v1, $v0, L8002f3f0
L8002f38c:
  sll $zero, $zero, 0x0
L8002f390:
  addiu $v0, $zero, 3
L8002f394:
  beq $v1, $v0, L8002f404
L8002f398:
  sll $zero, $zero, 0x0
L8002f39c:
  j L8002f41c
L8002f3a0:
  sll $zero, $zero, 0x0
L8002f3a4:
  jal L8003fee0
L8002f3a8:
  addiu $a0, $zero, 7
L8002f3ac:
  lhu $v0, 926($gp)
L8002f3b0:
  jal L8003f87c
L8002f3b4:
  sh $v0, 2012($s0)
L8002f3b8:
  lhu $v0, 884($gp)
L8002f3bc:
  j L8002f418
L8002f3c0:
  ori $v0, $v0, 0x80
L8002f3c4:
  jal L8003fee0
L8002f3c8:
  addiu $a0, $zero, 7
L8002f3cc:
  jal L80033c90
L8002f3d0:
  sll $zero, $zero, 0x0
L8002f3d4:
  lbu $v1, 926($gp)
L8002f3d8:
  addiu $v0, $zero, 2
L8002f3dc:
  lui $at, 0x800a
L8002f3e0:
  sb $v0, -19863($at)
L8002f3e4:
  sb $v1, 882($gp)
L8002f3e8:
  j L8002f41c
L8002f3ec:
  sll $zero, $zero, 0x0
L8002f3f0:
  jal L8003fee0
L8002f3f4:
  addiu $a0, $zero, 7
L8002f3f8:
  lhu $v0, 884($gp)
L8002f3fc:
  j L8002f418
L8002f400:
  ori $v0, $v0, 0x400
L8002f404:
  jal L8003fee0
L8002f408:
  addiu $a0, $zero, 8
L8002f40c:
  lhu $v0, 884($gp)
L8002f410:
  sll $zero, $zero, 0x0
L8002f414:
  ori $v0, $v0, 0x1000
L8002f418:
  sh $v0, 884($gp)
L8002f41c:
  lw $ra, 40($sp)
L8002f420:
  lw $s1, 36($sp)
L8002f424:
  lw $s0, 32($sp)
L8002f428:
  jr $ra
L8002f42c:
  addiu $sp, $sp, 48
L8002f430:
  jr $ra
L8002f434:
  sll $zero, $zero, 0x0
L8002f438:
  jr $ra
L8002f43c:
  sll $zero, $zero, 0x0
L8002f440:
  addiu $sp, $sp, -24
L8002f444:
  sw $ra, 20($sp)
L8002f448:
  jal L8002e3b4
L8002f44c:
  sw $s0, 16($sp)
L8002f450:
  bne $v0, $zero, L8002f498
L8002f454:
  lui $v0, 0x800f
L8002f458:
  lw $v0, 904($gp)
L8002f45c:
  sll $zero, $zero, 0x0
L8002f460:
  lbu $s0, 0($v0)
L8002f464:
  addiu $v0, $v0, 1
L8002f468:
  sw $v0, 904($gp)
L8002f46c:
  jal 0x800158b8
L8002f470:
  sll $zero, $zero, 0x0
L8002f474:
  andi $v1, $s0, 0x3f
L8002f478:
  beq $v1, $zero, L8002f484
L8002f47c:
  lui $v0, 0x800f
L8002f480:
  sb $v1, -24881($v0)
L8002f484:
  andi $v0, $s0, 0x80
L8002f488:
  beq $v0, $zero, L8002f4ac
L8002f48c:
  sll $zero, $zero, 0x0
L8002f490:
  j L8002f4b0
L8002f494:
  sll $zero, $zero, 0x0
L8002f498:
  lbu $v0, -24882($v0)
L8002f49c:
  sll $zero, $zero, 0x0
L8002f4a0:
  andi $v0, $v0, 0x80
L8002f4a4:
  bne $v0, $zero, L8002f4b0
L8002f4a8:
  sll $zero, $zero, 0x0
L8002f4ac:
  sh $zero, 884($gp)
L8002f4b0:
  lw $ra, 20($sp)
L8002f4b4:
  lw $s0, 16($sp)
L8002f4b8:
  jr $ra
L8002f4bc:
  addiu $sp, $sp, 24
L8002f4c0:
  addiu $sp, $sp, -32
L8002f4c4:
  sw $s0, 16($sp)
L8002f4c8:
  addu $s0, $a0, $zero
L8002f4cc:
  sw $s1, 20($sp)
L8002f4d0:
  addiu $s1, $zero, 1
L8002f4d4:
  beq $a1, $s1, L8002f588
L8002f4d8:
  sw $ra, 24($sp)
L8002f4dc:
  slti $v0, $a1, 2
L8002f4e0:
  beq $v0, $zero, L8002f4f8
L8002f4e4:
  sll $zero, $zero, 0x0
L8002f4e8:
  beq $a1, $zero, L8002f50c
L8002f4ec:
  lui $a0, 0xffdd
L8002f4f0:
  j L8002f61c
L8002f4f4:
  sll $zero, $zero, 0x0
L8002f4f8:
  addiu $v0, $zero, 2
L8002f4fc:
  beq $a1, $v0, L8002f5c0
L8002f500:
  addiu $v0, $zero, 244
L8002f504:
  j L8002f61c
L8002f508:
  sll $zero, $zero, 0x0
L8002f50c:
  ori $a0, $a0, 0xffff
L8002f510:
  lui $a1, 0x1
L8002f514:
  ori $a1, $a1, 0x8000
L8002f518:
  addiu $v0, $zero, 448
L8002f51c:
  sh $v0, 48($s0)
L8002f520:
  addiu $v0, $zero, 256
L8002f524:
  sh $v0, 50($s0)
L8002f528:
  lui $v0, 0x800a
L8002f52c:
  lw $v0, -20236($v0)
L8002f530:
  addiu $v1, $zero, 64
L8002f534:
  sh $v1, 4($s0)
L8002f538:
  and $v0, $v0, $a0
L8002f53c:
  lui $at, 0x800a
L8002f540:
  sw $v0, -20236($at)
L8002f544:
  lui $v0, 0x800a
L8002f548:
  lw $v0, -20236($v0)
L8002f54c:
  lui $v1, 0x1
L8002f550:
  sw $a1, 28($s0)
L8002f554:
  or $v0, $v0, $v1
L8002f558:
  lui $at, 0x800a
L8002f55c:
  sw $v0, -20236($at)
L8002f560:
  addiu $v0, $zero, 2
L8002f564:
  sb $v0, 70($s0)
L8002f568:
  lui $v1, 0x800a
L8002f56c:
  lw $v1, -20200($v1)
L8002f570:
  addiu $v0, $zero, 16
L8002f574:
  sh $v0, 6($s0)
L8002f578:
  sw $v1, 8($s0)
L8002f57c:
  addiu $v1, $v1, 2048
L8002f580:
  j L8002f61c
L8002f584:
  sw $v1, 12($s0)
L8002f588:
  lui $a0, 0xffdc
L8002f58c:
  ori $a0, $a0, 0xffff
L8002f590:
  addiu $v0, $zero, 2048
L8002f594:
  sw $v0, 28($s0)
L8002f598:
  lui $v0, 0x800a
L8002f59c:
  lw $v0, -20236($v0)
L8002f5a0:
  lui $v1, 0x800a
L8002f5a4:
  lw $v1, -20200($v1)
L8002f5a8:
  and $v0, $v0, $a0
L8002f5ac:
  lui $at, 0x800a
L8002f5b0:
  sw $v0, -20236($at)
L8002f5b4:
  sw $v1, 12($s0)
L8002f5b8:
  j L8002f618
L8002f5bc:
  sw $v1, 8($s0)
L8002f5c0:
  sh $v0, 2($s0)
L8002f5c4:
  addiu $v0, $zero, 256
L8002f5c8:
  sh $a1, 6($s0)
L8002f5cc:
  lui $a1, 0x800a
L8002f5d0:
  lw $a1, -20200($a1)
L8002f5d4:
  addu $a0, $s0, $zero
L8002f5d8:
  sh $zero, 0($s0)
L8002f5dc:
  jal 0x80081de8
L8002f5e0:
  sh $v0, 4($s0)
L8002f5e4:
  lui $a0, 0xffdc
L8002f5e8:
  ori $a0, $a0, 0xffff
L8002f5ec:
  lui $v0, 0x801b
L8002f5f0:
  addiu $v0, $v0, -4096
L8002f5f4:
  sw $v0, 12($s0)
L8002f5f8:
  sw $v0, 8($s0)
L8002f5fc:
  lui $v0, 0x800a
L8002f600:
  lw $v0, -20236($v0)
L8002f604:
  addiu $v1, $zero, 2048
L8002f608:
  sw $v1, 28($s0)
L8002f60c:
  and $v0, $v0, $a0
L8002f610:
  lui $at, 0x800a
L8002f614:
  sw $v0, -20236($at)
L8002f618:
  sb $s1, 70($s0)
L8002f61c:
  lw $ra, 24($sp)
L8002f620:
  lw $s1, 20($sp)
L8002f624:
  lw $s0, 16($sp)
L8002f628:
  jr $ra
L8002f62c:
  addiu $sp, $sp, 32
L8002f630:
  addiu $sp, $sp, -72
L8002f634:
  sw $ra, 64($sp)
L8002f638:
  sw $s5, 60($sp)
L8002f63c:
  sw $s4, 56($sp)
L8002f640:
  sw $s3, 52($sp)
L8002f644:
  sw $s2, 48($sp)
L8002f648:
  sw $s1, 44($sp)
L8002f64c:
  jal L8002e3b4
L8002f650:
  sw $s0, 40($sp)
L8002f654:
  bne $v0, $zero, L8002f6ac
L8002f658:
  addu $a0, $zero, $zero
L8002f65c:
  addu $a1, $a0, $zero
L8002f660:
  addiu $a2, $zero, 8103
L8002f664:
  lw $v1, 904($gp)
L8002f668:
  sll $zero, $zero, 0x0
L8002f66c:
  addiu $v0, $v1, 2
L8002f670:
  sw $v0, 904($gp)
L8002f674:
  lui $v0, 0x8003
L8002f678:
  lbu $t0, 0($v1)
L8002f67c:
  lbu $v1, 1($v1)
L8002f680:
  addiu $v0, $v0, -2880
L8002f684:
  sw $v0, 16($sp)
L8002f688:
  sw $zero, 20($sp)
L8002f68c:
  sw $zero, 24($sp)
L8002f690:
  sll $v1, $v1, 0x8
L8002f694:
  or $t0, $t0, $v1
L8002f698:
  sh $t0, 916($gp)
L8002f69c:
  jal 0x80014e1c
L8002f6a0:
  addiu $a3, $zero, 50
L8002f6a4:
  jal 0x800137e4
L8002f6a8:
  sll $zero, $zero, 0x0
L8002f6ac:
  lhu $a1, 884($gp)
L8002f6b0:
  sll $zero, $zero, 0x0
L8002f6b4:
  andi $v0, $a1, 0x4000
L8002f6b8:
  bne $v0, $zero, L8002f8b4
L8002f6bc:
  lui $v0, 0x200
L8002f6c0:
  ori $v0, $v0, 0x30
L8002f6c4:
  lui $v1, 0x800a
L8002f6c8:
  lw $v1, -20236($v1)
L8002f6cc:
  lui $a0, 0x800a
L8002f6d0:
  lw $a0, -20172($a0)
L8002f6d4:
  and $v1, $v1, $v0
L8002f6d8:
  or $v1, $v1, $a0
L8002f6dc:
  bne $v1, $zero, L8002f90c
L8002f6e0:
  ori $v0, $a1, 0x4000
L8002f6e4:
  lw $v1, 920($gp)
L8002f6e8:
  sh $v0, 884($gp)
L8002f6ec:
  beq $v1, $zero, L8002f704
L8002f6f0:
  lui $s0, 0x800f
L8002f6f4:
  lhu $v0, 8($v1)
L8002f6f8:
  sll $zero, $zero, 0x0
L8002f6fc:
  andi $v0, $v0, 0xffbf
L8002f700:
  sh $v0, 8($v1)
L8002f704:
  addiu $s3, $s0, -20840
L8002f708:
  jal L8002e00c
L8002f70c:
  addu $a0, $s3, $zero
L8002f710:
  jal 0x8004002c
L8002f714:
  addiu $s4, $zero, 4
L8002f718:
  addu $a0, $v0, $zero
L8002f71c:
  jal 0x800400ac
L8002f720:
  addiu $a1, $zero, 2
L8002f724:
  addu $s5, $v0, $zero
L8002f728:
  addu $a0, $s5, $zero
L8002f72c:
  addu $a1, $zero, $zero
L8002f730:
  addu $a2, $a1, $zero
L8002f734:
  addu $a3, $a1, $zero
L8002f738:
  addiu $v0, $zero, 23
L8002f73c:
  sw $v0, 24($sp)
L8002f740:
  lui $v0, 0x801b
L8002f744:
  addiu $v0, $v0, -4096
L8002f748:
  sw $zero, 16($sp)
L8002f74c:
  sw $zero, 20($sp)
L8002f750:
  sw $s4, 28($sp)
L8002f754:
  jal 0x800428a8
L8002f758:
  sw $v0, 32($sp)
L8002f75c:
  addu $a0, $s5, $zero
L8002f760:
  jal 0x800428ec
L8002f764:
  addiu $a1, $zero, 1
L8002f768:
  lhu $v0, 8($s5)
L8002f76c:
  sll $zero, $zero, 0x0
L8002f770:
  ori $v0, $v0, 0x28
L8002f774:
  sh $v0, 8($s5)
L8002f778:
  lw $v0, 4($s5)
L8002f77c:
  lui $v1, 0x100
L8002f780:
  or $v0, $v0, $v1
L8002f784:
  sw $v0, 4($s5)
L8002f788:
  jal 0x8004002c
L8002f78c:
  sw $s5, -20840($s0)
L8002f790:
  addu $a0, $v0, $zero
L8002f794:
  jal 0x800400ac
L8002f798:
  addiu $a1, $zero, 1
L8002f79c:
  addu $s5, $v0, $zero
L8002f7a0:
  addu $a0, $s5, $zero
L8002f7a4:
  addu $a1, $zero, $zero
L8002f7a8:
  addu $a2, $a1, $zero
L8002f7ac:
  addiu $a3, $zero, 320
L8002f7b0:
  addiu $s2, $zero, 240
L8002f7b4:
  addiu $s1, $zero, 25
L8002f7b8:
  addiu $s0, $zero, 245
L8002f7bc:
  sw $s2, 16($sp)
L8002f7c0:
  sw $zero, 20($sp)
L8002f7c4:
  sw $zero, 24($sp)
L8002f7c8:
  sw $s1, 28($sp)
L8002f7cc:
  sw $zero, 32($sp)
L8002f7d0:
  jal 0x80040510
L8002f7d4:
  sw $s0, 36($sp)
L8002f7d8:
  addu $a0, $s5, $zero
L8002f7dc:
  jal 0x800428ec
L8002f7e0:
  addiu $a1, $zero, -1
L8002f7e4:
  jal 0x8004002c
L8002f7e8:
  sw $s5, 20($s3)
L8002f7ec:
  addu $a0, $v0, $zero
L8002f7f0:
  jal 0x800400ac
L8002f7f4:
  addiu $a1, $zero, 1
L8002f7f8:
  addu $s5, $v0, $zero
L8002f7fc:
  addu $a0, $s5, $zero
L8002f800:
  addiu $a1, $zero, 256
L8002f804:
  addu $a2, $zero, $zero
L8002f808:
  addiu $a3, $zero, 64
L8002f80c:
  sw $s2, 16($sp)
L8002f810:
  sw $zero, 20($sp)
L8002f814:
  sw $zero, 24($sp)
L8002f818:
  sw $s1, 28($sp)
L8002f81c:
  sw $zero, 32($sp)
L8002f820:
  jal 0x80040510
L8002f824:
  sw $s0, 36($sp)
L8002f828:
  addu $a0, $s5, $zero
L8002f82c:
  jal 0x800428ec
L8002f830:
  addiu $a1, $zero, -1
L8002f834:
  jal 0x8004002c
L8002f838:
  sw $s5, 40($s3)
L8002f83c:
  addu $a0, $v0, $zero
L8002f840:
  jal 0x800400ac
L8002f844:
  addu $a1, $s4, $zero
L8002f848:
  addu $s0, $v0, $zero
L8002f84c:
  addu $a0, $s0, $zero
L8002f850:
  jal 0x800427dc
L8002f854:
  addu $a1, $zero, $zero
L8002f858:
  lui $a0, 0xf0
L8002f85c:
  ori $a0, $a0, 0x140
L8002f860:
  lui $v1, 0xff
L8002f864:
  addiu $v0, $zero, 320
L8002f868:
  sw $v0, 48($s0)
L8002f86c:
  lui $v0, 0xf0
L8002f870:
  sw $v0, 56($s0)
L8002f874:
  lw $v0, 4($s0)
L8002f878:
  ori $v1, $v1, 0xffff
L8002f87c:
  sw $v1, 60($s0)
L8002f880:
  sw $v1, 68($s0)
L8002f884:
  lui $v1, 0x6000
L8002f888:
  sw $zero, 40($s0)
L8002f88c:
  sw $a0, 64($s0)
L8002f890:
  sw $s0, 888($gp)
L8002f894:
  or $v0, $v0, $v1
L8002f898:
  jal 0x800157dc
L8002f89c:
  sw $v0, 4($s0)
L8002f8a0:
  lui $v0, 0x800f
L8002f8a4:
  jal 0x80015998
L8002f8a8:
  sb $s4, -24881($v0)
L8002f8ac:
  j L8002f90c
L8002f8b0:
  sll $zero, $zero, 0x0
L8002f8b4:
  jal 0x8004703c
L8002f8b8:
  sll $zero, $zero, 0x0
L8002f8bc:
  andi $v0, $v0, 0x80
L8002f8c0:
  bne $v0, $zero, L8002f90c
L8002f8c4:
  sll $zero, $zero, 0x0
L8002f8c8:
  jal 0x80015b00
L8002f8cc:
  sll $zero, $zero, 0x0
L8002f8d0:
  lw $v1, 920($gp)
L8002f8d4:
  sll $zero, $zero, 0x0
L8002f8d8:
  beq $v1, $zero, L8002f8f0
L8002f8dc:
  sll $zero, $zero, 0x0
L8002f8e0:
  lhu $v0, 8($v1)
L8002f8e4:
  sll $zero, $zero, 0x0
L8002f8e8:
  ori $v0, $v0, 0x40
L8002f8ec:
  sh $v0, 8($v1)
L8002f8f0:
  lw $a0, 888($gp)
L8002f8f4:
  jal 0x8004036c
L8002f8f8:
  sll $zero, $zero, 0x0
L8002f8fc:
  lui $a0, 0x800f
L8002f900:
  jal L8002e00c
L8002f904:
  addiu $a0, $a0, -20840
L8002f908:
  sh $zero, 884($gp)
L8002f90c:
  lw $ra, 64($sp)
L8002f910:
  lw $s5, 60($sp)
L8002f914:
  lw $s4, 56($sp)
L8002f918:
  lw $s3, 52($sp)
L8002f91c:
  lw $s2, 48($sp)
L8002f920:
  lw $s1, 44($sp)
L8002f924:
  lw $s0, 40($sp)
L8002f928:
  jr $ra
L8002f92c:
  addiu $sp, $sp, 72
L8002f930:
  addiu $v0, $zero, 12
L8002f934:
  lui $at, 0x800a
L8002f938:
  sb $v0, -19860($at)
L8002f93c:
  lui $at, 0x800a
L8002f940:
  sb $v0, -19863($at)
L8002f944:
  jr $ra
L8002f948:
  sll $zero, $zero, 0x0
L8002f94c:
  addiu $v0, $zero, 15
L8002f950:
  lui $at, 0x800a
L8002f954:
  sb $v0, -19860($at)
L8002f958:
  lui $at, 0x800a
L8002f95c:
  sb $v0, -19863($at)
L8002f960:
  jr $ra
L8002f964:
  sll $zero, $zero, 0x0
L8002f968:
  addiu $sp, $sp, -24
L8002f96c:
  sw $ra, 16($sp)
L8002f970:
  jal L8002e3b4
L8002f974:
  sll $zero, $zero, 0x0
L8002f978:
  bne $v0, $zero, L8002f9a4
L8002f97c:
  sll $zero, $zero, 0x0
L8002f980:
  lw $v1, 904($gp)
L8002f984:
  sll $zero, $zero, 0x0
L8002f988:
  addiu $v0, $v1, 2
L8002f98c:
  sw $v0, 904($gp)
L8002f990:
  lbu $v0, 1($v1)
L8002f994:
  lbu $v1, 0($v1)
L8002f998:
  sll $v0, $v0, 0x8
L8002f99c:
  or $v1, $v1, $v0
L8002f9a0:
  sh $v1, 880($gp)
L8002f9a4:
  lhu $v0, 880($gp)
L8002f9a8:
  sll $zero, $zero, 0x0
L8002f9ac:
  addiu $v0, $v0, -1
L8002f9b0:
  sh $v0, 880($gp)
L8002f9b4:
  sll $v0, $v0, 0x10
L8002f9b8:
  bgtz $v0, L8002f9c4
L8002f9bc:
  sll $zero, $zero, 0x0
L8002f9c0:
  sh $zero, 884($gp)
L8002f9c4:
  lw $ra, 16($sp)
L8002f9c8:
  sll $zero, $zero, 0x0
L8002f9cc:
  jr $ra
L8002f9d0:
  addiu $sp, $sp, 24
L8002f9d4:
  lw $v1, 904($gp)
L8002f9d8:
  addiu $sp, $sp, -24
L8002f9dc:
  sw $ra, 20($sp)
L8002f9e0:
  sw $s0, 16($sp)
L8002f9e4:
  addiu $v0, $v1, 2
L8002f9e8:
  sw $v0, 904($gp)
L8002f9ec:
  lbu $v0, 1($v1)
L8002f9f0:
  lbu $v1, 0($v1)
L8002f9f4:
  sll $v0, $v0, 0x8
L8002f9f8:
  jal L8002ee5c
L8002f9fc:
  or $s0, $v1, $v0
L8002fa00:
  bne $v0, $zero, L8002fa14
L8002fa04:
  lui $v0, 0x801b
L8002fa08:
  addiu $v0, $v0, -32768
L8002fa0c:
  addu $v0, $s0, $v0
L8002fa10:
  sw $v0, 904($gp)
L8002fa14:
  lw $ra, 20($sp)
L8002fa18:
  lw $s0, 16($sp)
L8002fa1c:
  sh $zero, 884($gp)
L8002fa20:
  jr $ra
L8002fa24:
  addiu $sp, $sp, 24
L8002fa28:
  addiu $v0, $zero, 1
L8002fa2c:
  lui $at, 0x800a
L8002fa30:
  sb $v0, -19864($at)
L8002fa34:
  addiu $v0, $zero, 5
L8002fa38:
  lui $at, 0x800a
L8002fa3c:
  sb $v0, -19859($at)
L8002fa40:
  addiu $v0, $zero, 8
L8002fa44:
  lui $at, 0x800a
L8002fa48:
  sb $v0, -19860($at)
L8002fa4c:
  jr $ra
L8002fa50:
  sll $zero, $zero, 0x0
L8002fa54:
  addiu $sp, $sp, -24
L8002fa58:
  sw $ra, 20($sp)
L8002fa5c:
  jal 0x8008e590
L8002fa60:
  sw $s0, 16($sp)
L8002fa64:
  lhu $v1, 924($gp)
L8002fa68:
  sll $zero, $zero, 0x0
L8002fa6c:
  andi $v0, $v1, 0x4000
L8002fa70:
  beq $v0, $zero, L8002fab0
L8002fa74:
  andi $v0, $v1, 0xffff
L8002fa78:
  jal L80039794
L8002fa7c:
  sll $zero, $zero, 0x0
L8002fa80:
  lui $v0, 0x800f
L8002fa84:
  lw $v0, -20180($v0)
L8002fa88:
  addiu $v1, $zero, 8192
L8002fa8c:
  andi $v0, $v0, 0x2008
L8002fa90:
  bne $v0, $v1, L8002fb68
L8002fa94:
  sll $zero, $zero, 0x0
L8002fa98:
  lhu $v0, 924($gp)
L8002fa9c:
  sll $zero, $zero, 0x0
L8002faa0:
  andi $v0, $v0, 0xbfff
L8002faa4:
  sh $v0, 924($gp)
L8002faa8:
  j L8002fb68
L8002faac:
  sll $zero, $zero, 0x0
L8002fab0:
  beq $v0, $zero, L8002fb68
L8002fab4:
  andi $v0, $v1, 0x8000
L8002fab8:
  bne $v0, $zero, L8002faf8
L8002fabc:
  lui $v1, 0x801b
L8002fac0:
  lhu $a0, 924($gp)
L8002fac4:
  addiu $v1, $v1, -32768
L8002fac8:
  sll $v0, $a0, 0x1
L8002facc:
  addu $v0, $v0, $v1
L8002fad0:
  lhu $v0, 0($v0)
L8002fad4:
  ori $a0, $a0, 0x8000
L8002fad8:
  addu $v0, $v0, $v1
L8002fadc:
  sw $v0, 904($gp)
L8002fae0:
  lbu $v1, 0($v0)
L8002fae4:
  addiu $v0, $v0, 1
L8002fae8:
  sw $v0, 904($gp)
L8002faec:
  sh $zero, 900($gp)
L8002faf0:
  sh $a0, 924($gp)
L8002faf4:
  sh $v1, 884($gp)
L8002faf8:
  lhu $v0, 900($gp)
L8002fafc:
  sll $zero, $zero, 0x0
L8002fb00:
  beq $v0, $zero, L8002fb0c
L8002fb04:
  sll $zero, $zero, 0x0
L8002fb08:
  sh $v0, 884($gp)
L8002fb0c:
  lui $v0, 0x8009
L8002fb10:
  addiu $s0, $v0, 3152
L8002fb14:
  lhu $v0, 884($gp)
L8002fb18:
  sll $zero, $zero, 0x0
L8002fb1c:
  andi $v0, $v0, 0x1f
L8002fb20:
  sll $v0, $v0, 0x2
L8002fb24:
  addu $v0, $v0, $s0
L8002fb28:
  lw $v0, 0($v0)
L8002fb2c:
  sll $zero, $zero, 0x0
L8002fb30:
  jalr $ra, $v0
L8002fb34:
  sll $zero, $zero, 0x0
L8002fb38:
  lhu $v0, 884($gp)
L8002fb3c:
  sll $zero, $zero, 0x0
L8002fb40:
  bne $v0, $zero, L8002fb68
L8002fb44:
  sll $zero, $zero, 0x0
L8002fb48:
  lw $v0, 904($gp)
L8002fb4c:
  sll $zero, $zero, 0x0
L8002fb50:
  lbu $v1, 0($v0)
L8002fb54:
  addiu $v0, $v0, 1
L8002fb58:
  sw $v0, 904($gp)
L8002fb5c:
  sh $v1, 884($gp)
L8002fb60:
  j L8002fb14
L8002fb64:
  sll $zero, $zero, 0x0
L8002fb68:
  lw $ra, 20($sp)
L8002fb6c:
  lw $s0, 16($sp)
L8002fb70:
  jr $ra
L8002fb74:
  addiu $sp, $sp, 24
L8002fb78:
  addiu $sp, $sp, -24
L8002fb7c:
  sw $s0, 16($sp)
L8002fb80:
  addu $s0, $a0, $zero
L8002fb84:
  addiu $a2, $zero, 1
L8002fb88:
  beq $a1, $a2, L8002fc3c
L8002fb8c:
  sw $ra, 20($sp)
L8002fb90:
  slti $v0, $a1, 2
L8002fb94:
  beq $v0, $zero, L8002fbac
L8002fb98:
  sll $zero, $zero, 0x0
L8002fb9c:
  beq $a1, $zero, L8002fbc8
L8002fba0:
  lui $a0, 0xffdd
L8002fba4:
  j L8002fd00
L8002fba8:
  sll $zero, $zero, 0x0
L8002fbac:
  addiu $v0, $zero, 2
L8002fbb0:
  beq $a1, $v0, L8002fc64
L8002fbb4:
  addiu $v0, $zero, 3
L8002fbb8:
  beq $a1, $v0, L8002fccc
L8002fbbc:
  lui $a0, 0xffdc
L8002fbc0:
  j L8002fd00
L8002fbc4:
  sll $zero, $zero, 0x0
L8002fbc8:
  ori $a0, $a0, 0xffff
L8002fbcc:
  addiu $v0, $zero, 832
L8002fbd0:
  sh $v0, 48($s0)
L8002fbd4:
  addiu $v0, $zero, 64
L8002fbd8:
  sh $v0, 4($s0)
L8002fbdc:
  lui $v0, 0x800a
L8002fbe0:
  lw $v0, -20236($v0)
L8002fbe4:
  addiu $v1, $zero, 16
L8002fbe8:
  sh $v1, 6($s0)
L8002fbec:
  and $v0, $v0, $a0
L8002fbf0:
  lui $at, 0x800a
L8002fbf4:
  sw $v0, -20236($at)
L8002fbf8:
  lui $v0, 0x800a
L8002fbfc:
  lw $v0, -20236($v0)
L8002fc00:
  lui $v1, 0x1
L8002fc04:
  sh $zero, 50($s0)
L8002fc08:
  or $v0, $v0, $v1
L8002fc0c:
  lui $at, 0x800a
L8002fc10:
  sw $v0, -20236($at)
L8002fc14:
  addiu $v0, $zero, 2
L8002fc18:
  sb $v0, 70($s0)
L8002fc1c:
  lui $v0, 0x800a
L8002fc20:
  lw $v0, -20200($v0)
L8002fc24:
  ori $v1, $zero, 0x8000
L8002fc28:
  sw $v1, 28($s0)
L8002fc2c:
  sw $v0, 8($s0)
L8002fc30:
  addiu $v0, $v0, 2048
L8002fc34:
  j L8002fd00
L8002fc38:
  sw $v0, 12($s0)
L8002fc3c:
  lui $a0, 0xffdc
L8002fc40:
  ori $a0, $a0, 0xffff
L8002fc44:
  addiu $v0, $zero, 2048
L8002fc48:
  sw $v0, 28($s0)
L8002fc4c:
  lui $v0, 0x800a
L8002fc50:
  lw $v0, -20236($v0)
L8002fc54:
  lui $v1, 0x800a
L8002fc58:
  lw $v1, -20200($v1)
L8002fc5c:
  j L8002fcec
L8002fc60:
  and $v0, $v0, $a0
L8002fc64:
  addiu $v1, $zero, 256
L8002fc68:
  addiu $v0, $zero, 240
L8002fc6c:
  lui $a1, 0x800a
L8002fc70:
  lw $a1, -20200($a1)
L8002fc74:
  addu $a0, $s0, $zero
L8002fc78:
  sh $v1, 0($s0)
L8002fc7c:
  sh $v0, 2($s0)
L8002fc80:
  sh $v1, 4($s0)
L8002fc84:
  jal 0x80081de8
L8002fc88:
  sh $a2, 6($s0)
L8002fc8c:
  lui $a0, 0xffdc
L8002fc90:
  ori $a0, $a0, 0xffff
L8002fc94:
  lui $v0, 0x801b
L8002fc98:
  addiu $v0, $v0, -32768
L8002fc9c:
  sw $v0, 12($s0)
L8002fca0:
  sw $v0, 8($s0)
L8002fca4:
  lui $v0, 0x800a
L8002fca8:
  lw $v0, -20236($v0)
L8002fcac:
  addiu $v1, $zero, 4096
L8002fcb0:
  sw $v1, 28($s0)
L8002fcb4:
  and $v0, $v0, $a0
L8002fcb8:
  lui $at, 0x800a
L8002fcbc:
  sw $v0, -20236($at)
L8002fcc0:
  addiu $v0, $zero, 1
L8002fcc4:
  j L8002fd00
L8002fcc8:
  sb $v0, 70($s0)
L8002fccc:
  ori $a0, $a0, 0xffff
L8002fcd0:
  ori $v0, $zero, 0xf000
L8002fcd4:
  sw $v0, 28($s0)
L8002fcd8:
  lui $v0, 0x800a
L8002fcdc:
  lw $v0, -20236($v0)
L8002fce0:
  lui $v1, 0x8001
L8002fce4:
  lw $v1, 0($v1)
L8002fce8:
  and $v0, $v0, $a0
L8002fcec:
  lui $at, 0x800a
L8002fcf0:
  sw $v0, -20236($at)
L8002fcf4:
  sw $v1, 12($s0)
L8002fcf8:
  sw $v1, 8($s0)
L8002fcfc:
  sb $a2, 70($s0)
L8002fd00:
  lw $ra, 20($sp)
L8002fd04:
  lw $s0, 16($sp)
L8002fd08:
  jr $ra
L8002fd0c:
  addiu $sp, $sp, 24
L8002fd10:
  addiu $sp, $sp, -56
L8002fd14:
  sh $a0, 924($gp)
L8002fd18:
  addu $a0, $zero, $zero
L8002fd1c:
  addu $a1, $a0, $zero
L8002fd20:
  lui $v0, 0x8003
L8002fd24:
  addiu $v0, $v0, -1160
L8002fd28:
  sw $s0, 32($sp)
L8002fd2c:
  lui $s0, 0x800f
L8002fd30:
  addiu $s0, $s0, -20840
L8002fd34:
  addiu $a2, $zero, 7767
L8002fd38:
  addiu $a3, $zero, 49
L8002fd3c:
  sw $ra, 48($sp)
L8002fd40:
  sw $s3, 44($sp)
L8002fd44:
  sw $s2, 40($sp)
L8002fd48:
  sw $s1, 36($sp)
L8002fd4c:
  lui $at, 0x800a
L8002fd50:
  sh $zero, -20152($at)
L8002fd54:
  lui $at, 0x800a
L8002fd58:
  sh $zero, -20154($at)
L8002fd5c:
  sw $zero, 920($gp)
L8002fd60:
  sw $v0, 16($sp)
L8002fd64:
  sw $zero, 20($sp)
L8002fd68:
  jal 0x80014e1c
L8002fd6c:
  sw $zero, 24($sp)
L8002fd70:
  jal L80039e9c
L8002fd74:
  addu $s1, $zero, $zero
L8002fd78:
  addiu $v0, $zero, -1
L8002fd7c:
  sh $v0, 60($s0)
L8002fd80:
  sw $zero, 0($s0)
L8002fd84:
  sh $zero, 4($s0)
L8002fd88:
  addiu $s1, $s1, 1
L8002fd8c:
  slti $v0, $s1, 3
L8002fd90:
  bne $v0, $zero, L8002fd80
L8002fd94:
  addiu $s0, $s0, 20
L8002fd98:
  jal 0x800137e4
L8002fd9c:
  sll $zero, $zero, 0x0
L8002fda0:
  jal 0x80082324
L8002fda4:
  addiu $a0, $zero, 10
L8002fda8:
  bne $v0, $zero, L8002fda0
L8002fdac:
  lui $v0, 0x800f
L8002fdb0:
  addu $s1, $zero, $zero
L8002fdb4:
  addu $s3, $v0, $zero
L8002fdb8:
  addiu $v0, $s3, -25232
L8002fdbc:
  addu $s0, $v0, $zero
L8002fdc0:
  addiu $v1, $zero, 896
L8002fdc4:
  lui $s2, 0x8001
L8002fdc8:
  lw $s2, 0($s2)
L8002fdcc:
  addiu $v0, $zero, 24
L8002fdd0:
  sh $v1, -25232($s3)
L8002fdd4:
  sh $v0, 4($s0)
L8002fdd8:
  addiu $v0, $zero, 48
L8002fddc:
  sh $v1, 8($s0)
L8002fde0:
  addiu $v1, $s0, 8
L8002fde4:
  sh $v0, 6($s0)
L8002fde8:
  addiu $v0, $zero, 240
L8002fdec:
  sh $zero, 2($s0)
L8002fdf0:
  sh $v0, 2($v1)
L8002fdf4:
  addiu $v0, $zero, 64
L8002fdf8:
  sh $v0, 4($v1)
L8002fdfc:
  addiu $v0, $zero, 1
L8002fe00:
  sh $v0, 6($v1)
L8002fe04:
  addu $a0, $s0, $zero
L8002fe08:
  jal 0x80081de8
L8002fe0c:
  addu $a1, $s2, $zero
L8002fe10:
  addiu $a0, $s0, 8
L8002fe14:
  jal 0x80081de8
L8002fe18:
  addiu $a1, $s2, 2304
L8002fe1c:
  addiu $s1, $s1, 1
L8002fe20:
  lui $v0, 0x6666
L8002fe24:
  ori $v0, $v0, 0x6667
L8002fe28:
  mult $s1, $v0
L8002fe2c:
  lhu $a0, 10($s0)
L8002fe30:
  sra $v0, $s1, 0x1f
L8002fe34:
  addiu $a0, $a0, 1
L8002fe38:
  sh $a0, 10($s0)
L8002fe3c:
  sll $a0, $a0, 0x10
L8002fe40:
  sra $a0, $a0, 0x10
L8002fe44:
  slti $a0, $a0, 256
L8002fe48:
  mfhi $t0
L8002fe4c:
  sra $a1, $t0, 0x1
L8002fe50:
  subu $a1, $a1, $v0
L8002fe54:
  sll $v1, $a1, 0x2
L8002fe58:
  addu $v1, $v1, $a1
L8002fe5c:
  subu $v1, $s1, $v1
L8002fe60:
  sll $v0, $v1, 0x1
L8002fe64:
  addu $v0, $v0, $v1
L8002fe68:
  sll $v0, $v0, 0x3
L8002fe6c:
  addiu $v0, $v0, 896
L8002fe70:
  sh $v0, -25232($s3)
L8002fe74:
  sll $v0, $a1, 0x1
L8002fe78:
  addu $v0, $v0, $a1
L8002fe7c:
  sll $v0, $v0, 0x4
L8002fe80:
  bne $a0, $zero, L8002fe9c
L8002fe84:
  sh $v0, 2($s0)
L8002fe88:
  lhu $v1, 8($s0)
L8002fe8c:
  addiu $v0, $zero, 240
L8002fe90:
  sh $v0, 10($s0)
L8002fe94:
  addiu $v1, $v1, 64
L8002fe98:
  sh $v1, 8($s0)
L8002fe9c:
  slti $v0, $s1, 25
L8002fea0:
  bne $v0, $zero, L8002fe04
L8002fea4:
  addiu $s2, $s2, 2432
L8002fea8:
  jal L8002e3fc
L8002feac:
  sll $zero, $zero, 0x0
L8002feb0:
  lw $ra, 48($sp)
L8002feb4:
  lw $s3, 44($sp)
L8002feb8:
  lw $s2, 40($sp)
L8002febc:
  lw $s1, 36($sp)
L8002fec0:
  lw $s0, 32($sp)
L8002fec4:
  sw $v0, 920($gp)
L8002fec8:
  jr $ra
L8002fecc:
  addiu $sp, $sp, 56
L8002fed0:
  jr $ra
L8002fed4:
  sll $zero, $zero, 0x0
L8002fed8:
  addiu $sp, $sp, -24
L8002fedc:
  addu $a2, $a0, $zero
L8002fee0:
  sw $ra, 20($sp)
L8002fee4:
  sw $s0, 16($sp)
L8002fee8:
  lhu $v1, 4($a2)
L8002feec:
  sll $zero, $zero, 0x0
L8002fef0:
  andi $v0, $v1, 0x8000
L8002fef4:
  bne $v0, $zero, L8002ff08
L8002fef8:
  addu $s0, $a1, $zero
L8002fefc:
  ori $v0, $v1, 0x8000
L8002ff00:
  sh $v0, 4($a2)
L8002ff04:
  sh $zero, 6($a2)
L8002ff08:
  lhu $a0, 6($a2)
L8002ff0c:
  sll $zero, $zero, 0x0
L8002ff10:
  addiu $a0, $a0, 32
L8002ff14:
  andi $a0, $a0, 0xfff
L8002ff18:
  jal 0x800866a0
L8002ff1c:
  sh $a0, 6($a2)
L8002ff20:
  sll $v1, $v0, 0x1
L8002ff24:
  addu $v1, $v1, $v0
L8002ff28:
  sll $v0, $v1, 0x3
L8002ff2c:
  bgez $v0, L8002ff3c
L8002ff30:
  sra $a1, $v0, 0xc
L8002ff34:
  addiu $v0, $v0, 4095
L8002ff38:
  sra $a1, $v0, 0xc
L8002ff3c:
  bne $a1, $zero, L8002ff48
L8002ff40:
  addiu $v0, $zero, 24
L8002ff44:
  addiu $a1, $zero, 1
L8002ff48:
  bne $a1, $v0, L8002ff58
L8002ff4c:
  addiu $v0, $a1, -104
L8002ff50:
  addiu $a1, $zero, 23
L8002ff54:
  addiu $v0, $a1, -104
L8002ff58:
  sb $v0, 14($s0)
L8002ff5c:
  sb $v0, 13($s0)
L8002ff60:
  sb $v0, 12($s0)
L8002ff64:
  lui $v0, 0x800f
L8002ff68:
  lw $a0, -20840($v0)
L8002ff6c:
  sll $zero, $zero, 0x0
L8002ff70:
  beq $a0, $zero, L8002ff98
L8002ff74:
  addiu $a2, $v0, -20840
L8002ff78:
  addiu $v0, $a1, 24
L8002ff7c:
  srl $v1, $v0, 0x1f
L8002ff80:
  addu $v0, $v0, $v1
L8002ff84:
  sra $v0, $v0, 0x1
L8002ff88:
  addiu $v0, $v0, -128
L8002ff8c:
  sb $v0, 14($a0)
L8002ff90:
  sb $v0, 13($a0)
L8002ff94:
  sb $v0, 12($a0)
L8002ff98:
  lw $a0, 20($a2)
L8002ff9c:
  sll $zero, $zero, 0x0
L8002ffa0:
  beq $a0, $zero, L8002ffc4
L8002ffa4:
  addiu $v0, $a1, 24
L8002ffa8:
  srl $v1, $v0, 0x1f
L8002ffac:
  addu $v0, $v0, $v1
L8002ffb0:
  sra $v0, $v0, 0x1
L8002ffb4:
  addiu $v0, $v0, -128
L8002ffb8:
  sb $v0, 14($a0)
L8002ffbc:
  sb $v0, 13($a0)
L8002ffc0:
  sb $v0, 12($a0)
L8002ffc4:
  lw $ra, 20($sp)
L8002ffc8:
  lw $s0, 16($sp)
L8002ffcc:
  jr $ra
L8002ffd0:
  addiu $sp, $sp, 24
L8002ffd4:
  addiu $sp, $sp, -32
L8002ffd8:
  sw $s0, 16($sp)
L8002ffdc:
  addu $s0, $a0, $zero
L8002ffe0:
  sw $s1, 20($sp)
L8002ffe4:
  addu $s1, $zero, $zero
L8002ffe8:
  lui $v0, 0x8009
L8002ffec:
  sw $s2, 24($sp)
L8002fff0:
  addiu $s2, $v0, 3244
L8002fff4:
  sw $ra, 28($sp)
L8002fff8:
  lw $a1, 0($s0)
L8002fffc:
  sll $zero, $zero, 0x0
L80030000:
  beq $a1, $zero, L80030028
L80030004:
  sll $zero, $zero, 0x0
L80030008:
  lbu $v0, 4($s0)
L8003000c:
  sll $zero, $zero, 0x0
L80030010:
  sll $v0, $v0, 0x2
L80030014:
  addu $v0, $v0, $s2
L80030018:
  lw $v0, 0($v0)
L8003001c:
  sll $zero, $zero, 0x0
L80030020:
  jalr $ra, $v0
L80030024:
  addu $a0, $s0, $zero
L80030028:
  addiu $s1, $s1, 1
L8003002c:
  slti $v0, $s1, 3
L80030030:
  bne $v0, $zero, L8002fff8
L80030034:
  addiu $s0, $s0, 20
L80030038:
  lw $ra, 28($sp)
L8003003c:
  lw $s2, 24($sp)
L80030040:
  lw $s1, 20($sp)
L80030044:
  lw $s0, 16($sp)
L80030048:
  jr $ra
L8003004c:
  addiu $sp, $sp, 32
L80030050:
  lw $v1, 904($gp)
L80030054:
  sll $zero, $zero, 0x0
L80030058:
  lbu $v0, 0($v1)
L8003005c:
  addiu $v1, $v1, 1
L80030060:
  sw $v1, 904($gp)
L80030064:
  jr $ra
L80030068:
  sll $zero, $zero, 0x0
L8003006c:
  lw $v1, 904($gp)
L80030070:
  sll $zero, $zero, 0x0
L80030074:
  addiu $v0, $v1, 2
L80030078:
  sw $v0, 904($gp)
L8003007c:
  lbu $v0, 1($v1)
L80030080:
  lbu $v1, 0($v1)
L80030084:
  sll $v0, $v0, 0x8
L80030088:
  jr $ra
L8003008c:
  or $v0, $v1, $v0
L80030090:
  lui $v0, 0x800f
L80030094:
  lw $v1, -20092($v0)
L80030098:
  addiu $v0, $zero, 64
L8003009c:
  sb $v0, 14($v1)
L800300a0:
  sb $v0, 13($v1)
L800300a4:
  jr $ra
L800300a8:
  sb $v0, 12($v1)
L800300ac:
  lui $v0, 0x800f
L800300b0:
  lw $v1, -20092($v0)
L800300b4:
  addiu $v0, $zero, 128
L800300b8:
  sb $v0, 14($v1)
L800300bc:
  sb $v0, 13($v1)
L800300c0:
  jr $ra
L800300c4:
  sb $v0, 12($v1)
L800300c8:
  lui $v0, 0x800f
L800300cc:
  addiu $a3, $v0, -20132
L800300d0:
  lbu $v0, 1001($gp)
L800300d4:
  lh $a0, 60($a3)
L800300d8:
  lw $a1, 988($gp)
L800300dc:
  sll $t0, $v0, 0x18
L800300e0:
  sra $a2, $t0, 0x18
L800300e4:
  slti $v0, $a2, 10
L800300e8:
  bne $v0, $zero, L80030114
L800300ec:
  lui $v0, 0x6666
L800300f0:
  lhu $v0, 62($a3)
L800300f4:
  addiu $a0, $a0, -16
L800300f8:
  sll $v0, $v0, 0x10
L800300fc:
  sra $v1, $v0, 0x10
L80030100:
  srl $v0, $v0, 0x1f
L80030104:
  addu $v1, $v1, $v0
L80030108:
  sra $v1, $v1, 0x1
L8003010c:
  addu $a0, $a0, $v1
L80030110:
  lui $v0, 0x6666
L80030114:
  ori $v0, $v0, 0x6667
L80030118:
  mult $a2, $v0
L8003011c:
  sh $a0, 56($a1)
L80030120:
  sh $a0, 40($a1)
L80030124:
  lhu $v1, 62($a3)
L80030128:
  sll $zero, $zero, 0x0
L8003012c:
  sll $v1, $v1, 0x10
L80030130:
  sra $v0, $v1, 0x10
L80030134:
  srl $v1, $v1, 0x1f
L80030138:
  addu $v0, $v0, $v1
L8003013c:
  sra $v0, $v0, 0x1
L80030140:
  addu $v0, $a0, $v0
L80030144:
  addiu $v0, $v0, -16
L80030148:
  sh $v0, 64($a1)
L8003014c:
  sh $v0, 48($a1)
L80030150:
  sra $v0, $t0, 0x1f
L80030154:
  mfhi $t1
L80030158:
  sra $v1, $t1, 0x2
L8003015c:
  subu $v1, $v1, $v0
L80030160:
  sll $v0, $v1, 0x2
L80030164:
  addu $v0, $v0, $v1
L80030168:
  sll $v0, $v0, 0x1
L8003016c:
  subu $v0, $a2, $v0
L80030170:
  sll $v0, $v0, 0x18
L80030174:
  lhu $v1, 64($a3)
L80030178:
  sra $v0, $v0, 0x14
L8003017c:
  addu $v1, $v1, $v0
L80030180:
  sh $v1, 50($a1)
L80030184:
  sh $v1, 42($a1)
L80030188:
  addiu $v1, $v1, 16
L8003018c:
  sh $v1, 66($a1)
L80030190:
  jr $ra
L80030194:
  sh $v1, 58($a1)
L80030198:
  addiu $sp, $sp, -32
L8003019c:
  addiu $a0, $zero, 1
L800301a0:
  addiu $v0, $zero, 128
L800301a4:
  sw $ra, 28($sp)
L800301a8:
  sw $s0, 24($sp)
L800301ac:
  sb $v0, 938($gp)
L800301b0:
  sb $zero, 995($gp)
L800301b4:
  sb $zero, 1000($gp)
L800301b8:
  jal L8003b6ac
L800301bc:
  addu $a1, $a0, $zero
L800301c0:
  addiu $a0, $zero, 1
L800301c4:
  addiu $a1, $zero, 15
L800301c8:
  addiu $v0, $zero, 288
L800301cc:
  sw $v0, 16($sp)
L800301d0:
  addiu $v0, $zero, 160
L800301d4:
  addiu $a2, $zero, 16
L800301d8:
  addu $a3, $a2, $zero
L800301dc:
  jal L80035be4
L800301e0:
  sw $v0, 20($sp)
L800301e4:
  addu $a0, $v0, $zero
L800301e8:
  addiu $v0, $zero, 16
L800301ec:
  sb $v0, 90($a0)
L800301f0:
  jal L80039a14
L800301f4:
  sb $v0, 91($a0)
L800301f8:
  jal 0x8004002c
L800301fc:
  sll $zero, $zero, 0x0
L80030200:
  addu $a0, $v0, $zero
L80030204:
  jal 0x800400ac
L80030208:
  addiu $a1, $zero, 4
L8003020c:
  addu $s0, $v0, $zero
L80030210:
  addu $a0, $s0, $zero
L80030214:
  sw $s0, 988($gp)
L80030218:
  jal 0x800427dc
L8003021c:
  addu $a1, $zero, $zero
L80030220:
  addiu $v0, $zero, 192
L80030224:
  sb $v0, 69($s0)
L80030228:
  sb $v0, 61($s0)
L8003022c:
  sb $v0, 53($s0)
L80030230:
  jal L800300c8
L80030234:
  sb $v0, 45($s0)
L80030238:
  jal 0x80015a00
L8003023c:
  sll $zero, $zero, 0x0
L80030240:
  lw $ra, 28($sp)
L80030244:
  lw $s0, 24($sp)
L80030248:
  jr $ra
L8003024c:
  addiu $sp, $sp, 32
L80030250:
  lw $v0, 16($sp)
L80030254:
  lw $v1, 20($sp)
L80030258:
  lw $t0, 24($sp)
L8003025c:
  sb $zero, 994($gp)
L80030260:
  sw $a0, 996($gp)
L80030264:
  sb $a1, 940($gp)
L80030268:
  sb $a2, 941($gp)
L8003026c:
  sb $a3, 942($gp)
L80030270:
  sb $zero, 993($gp)
L80030274:
  sb $zero, 980($gp)
L80030278:
  sb $v0, 944($gp)
L8003027c:
  sb $v1, 954($gp)
L80030280:
  sb $v1, 953($gp)
L80030284:
  sb $v1, 952($gp)
L80030288:
  sb $t0, 984($gp)
L8003028c:
  jr $ra
L80030290:
  sll $zero, $zero, 0x0
L80030294:
  addiu $sp, $sp, -104
L80030298:
  sw $s2, 96($sp)
L8003029c:
  addu $s2, $zero, $zero
L800302a0:
  lui $v0, 0x8001
L800302a4:
  sw $ra, 100($sp)
L800302a8:
  sw $s1, 92($sp)
L800302ac:
  sw $s0, 88($sp)
L800302b0:
  addiu $t8, $v0, 592
L800302b4:
  lw $t5, 0($t8)
L800302b8:
  lw $t6, 4($t8)
L800302bc:
  lw $t7, 8($t8)
L800302c0:
  sw $t5, 16($sp)
L800302c4:
  sw $t6, 20($sp)
L800302c8:
  sw $t7, 24($sp)
L800302cc:
  lw $t5, 12($t8)
L800302d0:
  lw $t6, 16($t8)
L800302d4:
  sw $t5, 28($sp)
L800302d8:
  sw $t6, 32($sp)
L800302dc:
  lui $v0, 0x8001
L800302e0:
  addiu $t8, $v0, 612
L800302e4:
  lw $t5, 0($t8)
L800302e8:
  lw $t6, 4($t8)
L800302ec:
  lw $t7, 8($t8)
L800302f0:
  sw $t5, 40($sp)
L800302f4:
  sw $t6, 44($sp)
L800302f8:
  sw $t7, 48($sp)
L800302fc:
  lw $t5, 12($t8)
L80030300:
  sll $zero, $zero, 0x0
L80030304:
  sw $t5, 52($sp)
L80030308:
  lui $v0, 0x8001
L8003030c:
  addiu $t8, $v0, 628
L80030310:
  lw $t5, 0($t8)
L80030314:
  lw $t6, 4($t8)
L80030318:
  lw $t7, 8($t8)
L8003031c:
  sw $t5, 56($sp)
L80030320:
  sw $t6, 60($sp)
L80030324:
  sw $t7, 64($sp)
L80030328:
  lw $t5, 12($t8)
L8003032c:
  lw $t6, 16($t8)
L80030330:
  sw $t5, 68($sp)
L80030334:
  sw $t6, 72($sp)
L80030338:
  lui $v0, 0x800a
L8003033c:
  addiu $t3, $sp, 56
L80030340:
  addiu $t8, $v0, -20660
L80030344:
  lwl $t5, 3($t8)
L80030348:
  lwr $t5, 0($t8)
L8003034c:
  lwl $t6, 7($t8)
L80030350:
  lwr $t6, 4($t8)
L80030354:
  swl $t5, 83($sp)
L80030358:
  swr $t5, 80($sp)
L8003035c:
  swl $t6, 87($sp)
L80030360:
  swr $t6, 84($sp)
L80030364:
  addiu $v0, $gp, 952
L80030368:
  lb $a0, 980($gp)
L8003036c:
  lbu $a2, 994($gp)
L80030370:
  addu $v0, $a0, $v0
L80030374:
  andi $v1, $a2, 0x80
L80030378:
  lbu $t2, 0($v0)
L8003037c:
  bne $v1, $zero, L80030438
L80030380:
  addiu $t4, $sp, 80
L80030384:
  ori $v0, $a2, 0x80
L80030388:
  sb $v0, 994($gp)
L8003038c:
  andi $v0, $v0, 0x40
L80030390:
  beq $v0, $zero, L800306f8
L80030394:
  lui $v0, 0x800f
L80030398:
  sll $v0, $t2, 0x18
L8003039c:
  sra $v0, $v0, 0x18
L800303a0:
  addiu $a2, $v0, -1
L800303a4:
  sll $v0, $a0, 0x1
L800303a8:
  addiu $v1, $gp, 960
L800303ac:
  addu $v0, $v0, $v1
L800303b0:
  addu $t0, $v0, $zero
L800303b4:
  addiu $v1, $sp, 16
L800303b8:
  sll $v0, $a2, 0x2
L800303bc:
  lhu $a1, 0($t0)
L800303c0:
  addu $a3, $v0, $v1
L800303c4:
  sh $zero, 0($t0)
L800303c8:
  lw $v0, 0($a3)
L800303cc:
  sll $zero, $zero, 0x0
L800303d0:
  .word 0x00a2001a
L800303d4:
  bne $v0, $zero, L800303e0
L800303d8:
  sll $zero, $zero, 0x0
L800303dc:
  .word 0x0007000d
L800303e0:
  addiu $at, $zero, -1
L800303e4:
  bne $v0, $at, L800303f8
L800303e8:
  lui $at, 0x8000
L800303ec:
  bne $a1, $at, L800303f8
L800303f0:
  sll $zero, $zero, 0x0
L800303f4:
  .word 0x0006000d
L800303f8:
  mflo $v1
L800303fc:
  sll $zero, $zero, 0x0
L80030400:
  sll $zero, $zero, 0x0
L80030404:
  mult $v0, $v1
L80030408:
  addiu $a3, $a3, -4
L8003040c:
  sll $a0, $a2, 0x2
L80030410:
  addiu $a2, $a2, -1
L80030414:
  lhu $v0, 0($t0)
L80030418:
  sllv $v1, $v1, $a0
L8003041c:
  or $v0, $v0, $v1
L80030420:
  sh $v0, 0($t0)
L80030424:
  mflo $t1
L80030428:
  bgez $a2, L800303c8
L8003042c:
  subu $a1, $a1, $t1
L80030430:
  j L800306f8
L80030434:
  lui $v0, 0x800f
L80030438:
  andi $v0, $a2, 0x1
L8003043c:
  bne $v0, $zero, L800306f8
L80030440:
  lui $v0, 0x800f
L80030444:
  lui $v0, 0x800a
L80030448:
  lhu $v0, -19548($v0)
L8003044c:
  lui $v1, 0x800a
L80030450:
  lhu $v1, -19546($v1)
L80030454:
  sll $zero, $zero, 0x0
L80030458:
  or $v0, $v0, $v1
L8003045c:
  andi $v0, $v0, 0x800
L80030460:
  bne $v0, $zero, L800306f8
L80030464:
  lui $v0, 0x800f
L80030468:
  lui $v0, 0x800a
L8003046c:
  lhu $v0, -19560($v0)
L80030470:
  lui $v1, 0x800a
L80030474:
  lhu $v1, -19558($v1)
L80030478:
  sll $zero, $zero, 0x0
L8003047c:
  or $v0, $v0, $v1
L80030480:
  andi $v0, $v0, 0xc0
L80030484:
  beq $v0, $zero, L80030494
L80030488:
  sll $zero, $zero, 0x0
L8003048c:
  j L8003074c
L80030490:
  addiu $s2, $zero, 1
L80030494:
  lui $v0, 0x800a
L80030498:
  lhu $v0, -19560($v0)
L8003049c:
  lui $v1, 0x800a
L800304a0:
  lhu $v1, -19558($v1)
L800304a4:
  sll $zero, $zero, 0x0
L800304a8:
  or $v0, $v0, $v1
L800304ac:
  andi $v0, $v0, 0x20
L800304b0:
  beq $v0, $zero, L800304c0
L800304b4:
  sll $zero, $zero, 0x0
L800304b8:
  j L8003074c
L800304bc:
  addiu $s2, $zero, -1
L800304c0:
  lui $v0, 0x800a
L800304c4:
  lhu $v0, -19564($v0)
L800304c8:
  lui $v1, 0x800a
L800304cc:
  lhu $v1, -19562($v1)
L800304d0:
  sll $zero, $zero, 0x0
L800304d4:
  or $v0, $v0, $v1
L800304d8:
  andi $v0, $v0, 0x5000
L800304dc:
  beq $v0, $zero, L800305f4
L800304e0:
  sll $v0, $a0, 0x1
L800304e4:
  addiu $v1, $gp, 960
L800304e8:
  addu $v0, $v0, $v1
L800304ec:
  lb $t0, 993($gp)
L800304f0:
  lhu $a1, 0($v0)
L800304f4:
  lui $v0, 0x800a
L800304f8:
  lhu $v0, -19564($v0)
L800304fc:
  lui $v1, 0x800a
L80030500:
  lhu $v1, -19562($v1)
L80030504:
  sll $t1, $t0, 0x2
L80030508:
  addu $a0, $t3, $t1
L8003050c:
  or $v0, $v0, $v1
L80030510:
  andi $v0, $v0, 0x4000
L80030514:
  lw $a0, 0($a0)
L80030518:
  beq $v0, $zero, L80030524
L8003051c:
  andi $v0, $a2, 0x40
L80030520:
  subu $a0, $zero, $a0
L80030524:
  beq $v0, $zero, L800305c4
L80030528:
  sll $v0, $t0, 0x1
L8003052c:
  addu $v0, $t4, $v0
L80030530:
  lhu $a2, 0($v0)
L80030534:
  addu $s0, $t0, $zero
L80030538:
  sll $v0, $t2, 0x18
L8003053c:
  sra $v1, $v0, 0x18
L80030540:
  slt $v0, $s0, $v1
L80030544:
  beq $v0, $zero, L800305bc
L80030548:
  addu $t0, $v1, $zero
L8003054c:
  addiu $v0, $sp, 40
L80030550:
  addu $v1, $t1, $v0
L80030554:
  and $a3, $a1, $a2
L80030558:
  nor $v0, $zero, $a2
L8003055c:
  and $a1, $a1, $v0
L80030560:
  bltz $a0, L80030584
L80030564:
  addu $a3, $a3, $a0
L80030568:
  lw $v0, 0($v1)
L8003056c:
  sll $zero, $zero, 0x0
L80030570:
  slt $v0, $a3, $v0
L80030574:
  bne $v0, $zero, L800305bc
L80030578:
  sll $zero, $zero, 0x0
L8003057c:
  j L800305a4
L80030580:
  addu $a3, $zero, $zero
L80030584:
  bgez $a3, L800305bc
L80030588:
  sll $zero, $zero, 0x0
L8003058c:
  lw $v0, 0($v1)
L80030590:
  sll $zero, $zero, 0x0
L80030594:
  addiu $v0, $v0, -1
L80030598:
  and $v0, $v0, $a2
L8003059c:
  or $a1, $a1, $v0
L800305a0:
  addu $a3, $zero, $zero
L800305a4:
  sll $a2, $a2, 0x4
L800305a8:
  sll $a0, $a0, 0x4
L800305ac:
  addiu $s0, $s0, 1
L800305b0:
  slt $v0, $s0, $t0
L800305b4:
  bne $v0, $zero, L80030554
L800305b8:
  addiu $v1, $v1, 4
L800305bc:
  j L800305e0
L800305c0:
  or $a1, $a1, $a3
L800305c4:
  sll $v0, $t2, 0x18
L800305c8:
  sra $v0, $v0, 0x16
L800305cc:
  addu $v0, $t3, $v0
L800305d0:
  lw $v0, 0($v0)
L800305d4:
  addu $a1, $a1, $a0
L800305d8:
  addiu $v0, $v0, -1
L800305dc:
  and $a1, $a1, $v0
L800305e0:
  lb $v0, 980($gp)
L800305e4:
  addiu $v1, $gp, 960
L800305e8:
  sll $v0, $v0, 0x1
L800305ec:
  addu $v0, $v0, $v1
L800305f0:
  sh $a1, 0($v0)
L800305f4:
  lui $v0, 0x800a
L800305f8:
  lhu $v0, -19564($v0)
L800305fc:
  lui $v1, 0x800a
L80030600:
  lhu $v1, -19562($v1)
L80030604:
  sll $zero, $zero, 0x0
L80030608:
  or $v0, $v0, $v1
L8003060c:
  andi $v0, $v0, 0xa000
L80030610:
  beq $v0, $zero, L8003074c
L80030614:
  sll $zero, $zero, 0x0
L80030618:
  lui $v0, 0x800a
L8003061c:
  lhu $v0, -19564($v0)
L80030620:
  lui $v1, 0x800a
L80030624:
  lhu $v1, -19562($v1)
L80030628:
  sll $zero, $zero, 0x0
L8003062c:
  or $v0, $v0, $v1
L80030630:
  andi $v0, $v0, 0x2000
L80030634:
  beq $v0, $zero, L800306a8
L80030638:
  sll $v1, $t2, 0x18
L8003063c:
  lbu $v0, 993($gp)
L80030640:
  sll $zero, $zero, 0x0
L80030644:
  addiu $v0, $v0, -1
L80030648:
  sb $v0, 993($gp)
L8003064c:
  sll $v0, $v0, 0x18
L80030650:
  bgez $v0, L800306f8
L80030654:
  lui $v0, 0x800f
L80030658:
  lbu $v0, 980($gp)
L8003065c:
  lb $v1, 984($gp)
L80030660:
  addiu $v0, $v0, 1
L80030664:
  sb $v0, 980($gp)
L80030668:
  sll $v0, $v0, 0x18
L8003066c:
  sra $a0, $v0, 0x18
L80030670:
  slt $v1, $a0, $v1
L80030674:
  lbu $v0, 984($gp)
L80030678:
  bne $v1, $zero, L80030694
L8003067c:
  sll $zero, $zero, 0x0
L80030680:
  addiu $v0, $v0, -1
L80030684:
  sb $v0, 980($gp)
L80030688:
  sb $zero, 993($gp)
L8003068c:
  j L800306f8
L80030690:
  lui $v0, 0x800f
L80030694:
  addiu $v0, $gp, 952
L80030698:
  addu $v0, $a0, $v0
L8003069c:
  lbu $v0, 0($v0)
L800306a0:
  j L800306f0
L800306a4:
  addiu $v0, $v0, -1
L800306a8:
  lbu $v0, 993($gp)
L800306ac:
  sll $zero, $zero, 0x0
L800306b0:
  addiu $v0, $v0, 1
L800306b4:
  sb $v0, 993($gp)
L800306b8:
  sll $v0, $v0, 0x18
L800306bc:
  slt $v0, $v0, $v1
L800306c0:
  bne $v0, $zero, L800306f8
L800306c4:
  lui $v0, 0x800f
L800306c8:
  lbu $v0, 980($gp)
L800306cc:
  sb $zero, 993($gp)
L800306d0:
  addiu $v0, $v0, -1
L800306d4:
  sb $v0, 980($gp)
L800306d8:
  sll $v0, $v0, 0x18
L800306dc:
  bgez $v0, L800306f4
L800306e0:
  sll $zero, $zero, 0x0
L800306e4:
  lbu $v0, 952($gp)
L800306e8:
  sb $zero, 980($gp)
L800306ec:
  addiu $v0, $v0, -1
L800306f0:
  sb $v0, 993($gp)
L800306f4:
  lui $v0, 0x800f
L800306f8:
  addiu $v1, $v0, -20776
L800306fc:
  addiu $a0, $zero, 32
L80030700:
  addiu $s0, $zero, 39
L80030704:
  addu $v0, $v1, $s0
L80030708:
  sb $a0, 0($v0)
L8003070c:
  addiu $s0, $s0, -1
L80030710:
  bgez $s0, L80030708
L80030714:
  addiu $v0, $v0, -1
L80030718:
  lb $v0, 980($gp)
L8003071c:
  addiu $v1, $gp, 940
L80030720:
  addu $v0, $v0, $v1
L80030724:
  lb $v1, 0($v0)
L80030728:
  lb $v0, 993($gp)
L8003072c:
  sll $zero, $zero, 0x0
L80030730:
  subu $v1, $v1, $v0
L80030734:
  lui $v0, 0x800f
L80030738:
  addiu $v0, $v0, -20776
L8003073c:
  addu $v1, $v1, $v0
L80030740:
  addiu $v0, $zero, 42
L80030744:
  sb $v0, 0($v1)
L80030748:
  sb $zero, 1($v1)
L8003074c:
  lb $s0, 944($gp)
L80030750:
  sll $zero, $zero, 0x0
L80030754:
  beq $s0, $zero, L80030770
L80030758:
  lui $s1, 0x800a
L8003075c:
  jal 0x8007ef84
L80030760:
  addiu $a0, $s1, -20652
L80030764:
  addiu $s0, $s0, -1
L80030768:
  bne $s0, $zero, L8003075c
L8003076c:
  sll $zero, $zero, 0x0
L80030770:
  lw $a0, 996($gp)
L80030774:
  lhu $a1, 960($gp)
L80030778:
  lhu $a2, 962($gp)
L8003077c:
  lhu $a3, 964($gp)
L80030780:
  jal 0x8007ef84
L80030784:
  sll $zero, $zero, 0x0
L80030788:
  lui $a0, 0x800a
L8003078c:
  addiu $a0, $a0, -20648
L80030790:
  lui $a1, 0x800f
L80030794:
  jal 0x8007ef84
L80030798:
  addiu $a1, $a1, -20776
L8003079c:
  addu $v0, $s2, $zero
L800307a0:
  lw $ra, 100($sp)
L800307a4:
  lw $s2, 96($sp)
L800307a8:
  lw $s1, 92($sp)
L800307ac:
  lw $s0, 88($sp)
L800307b0:
  jr $ra
L800307b4:
  addiu $sp, $sp, 104
L800307b8:
  lbu $v1, 995($gp)
L800307bc:
  addiu $sp, $sp, -40
L800307c0:
  sw $ra, 36($sp)
L800307c4:
  andi $v0, $v1, 0x80
L800307c8:
  bne $v0, $zero, L80030834
L800307cc:
  sw $s0, 32($sp)
L800307d0:
  ori $v0, $v1, 0x80
L800307d4:
  sb $v0, 995($gp)
L800307d8:
  jal L80030090
L800307dc:
  addiu $s0, $zero, 3
L800307e0:
  lui $a0, 0x8009
L800307e4:
  addiu $a0, $a0, 3252
L800307e8:
  addiu $v0, $zero, 9
L800307ec:
  sw $v0, 16($sp)
L800307f0:
  addiu $v0, $zero, 4
L800307f4:
  addiu $a2, $zero, 25
L800307f8:
  sw $v0, 20($sp)
L800307fc:
  lhu $v0, 956($gp)
L80030800:
  lhu $v1, 978($gp)
L80030804:
  lhu $a1, 958($gp)
L80030808:
  addiu $a3, $zero, 33
L8003080c:
  sw $s0, 24($sp)
L80030810:
  sh $a1, 964($gp)
L80030814:
  sh $v0, 960($gp)
L80030818:
  sh $v1, 962($gp)
L8003081c:
  jal L80030250
L80030820:
  addiu $a1, $zero, 17
L80030824:
  sb $s0, 954($gp)
L80030828:
  sb $s0, 953($gp)
L8003082c:
  j L80030988
L80030830:
  sll $zero, $zero, 0x0
L80030834:
  lui $v0, 0x800a
L80030838:
  lhu $v0, -19560($v0)
L8003083c:
  sll $zero, $zero, 0x0
L80030840:
  andi $v0, $v0, 0x800
L80030844:
  beq $v0, $zero, L8003085c
L80030848:
  sll $zero, $zero, 0x0
L8003084c:
  jal L8003fffc
L80030850:
  sll $zero, $zero, 0x0
L80030854:
  j L80030988
L80030858:
  sll $zero, $zero, 0x0
L8003085c:
  lui $v0, 0x800a
L80030860:
  lhu $v0, -19560($v0)
L80030864:
  sll $zero, $zero, 0x0
L80030868:
  andi $v0, $v0, 0x100
L8003086c:
  beq $v0, $zero, L80030884
L80030870:
  sll $zero, $zero, 0x0
L80030874:
  jal 0x80014fa4
L80030878:
  sll $zero, $zero, 0x0
L8003087c:
  j L80030988
L80030880:
  sll $zero, $zero, 0x0
L80030884:
  jal L80030294
L80030888:
  sll $zero, $zero, 0x0
L8003088c:
  beq $v0, $zero, L80030988
L80030890:
  sll $zero, $zero, 0x0
L80030894:
  bgez $v0, L800308b0
L80030898:
  addiu $v0, $zero, 1
L8003089c:
  sb $zero, 995($gp)
L800308a0:
  jal L800300ac
L800308a4:
  sll $zero, $zero, 0x0
L800308a8:
  j L80030988
L800308ac:
  sll $zero, $zero, 0x0
L800308b0:
  lb $v1, 980($gp)
L800308b4:
  sll $zero, $zero, 0x0
L800308b8:
  beq $v1, $v0, L80030934
L800308bc:
  slti $v0, $v1, 2
L800308c0:
  beq $v0, $zero, L800308d8
L800308c4:
  addiu $v0, $zero, 2
L800308c8:
  beq $v1, $zero, L800308e8
L800308cc:
  addiu $v0, $zero, 3
L800308d0:
  j L80030988
L800308d4:
  sll $zero, $zero, 0x0
L800308d8:
  beq $v1, $v0, L80030950
L800308dc:
  sll $zero, $zero, 0x0
L800308e0:
  j L80030988
L800308e4:
  sll $zero, $zero, 0x0
L800308e8:
  lhu $a0, 960($gp)
L800308ec:
  lb $v1, 993($gp)
L800308f0:
  sh $a0, 956($gp)
L800308f4:
  bne $v1, $v0, L80030924
L800308f8:
  sll $zero, $zero, 0x0
L800308fc:
  jal 0x8004763c
L80030900:
  sll $zero, $zero, 0x0
L80030904:
  lhu $a0, 956($gp)
L80030908:
  sll $zero, $zero, 0x0
L8003090c:
  sll $a0, $a0, 0x10
L80030910:
  sra $a0, $a0, 0x1c
L80030914:
  jal 0x80047ad0
L80030918:
  andi $a0, $a0, 0xffff
L8003091c:
  j L80030988
L80030920:
  sll $zero, $zero, 0x0
L80030924:
  jal L8003fee0
L80030928:
  andi $a0, $a0, 0xfff
L8003092c:
  j L80030988
L80030930:
  sll $zero, $zero, 0x0
L80030934:
  lhu $v0, 962($gp)
L80030938:
  lhu $a0, 962($gp)
L8003093c:
  sh $v0, 978($gp)
L80030940:
  jal L8003ff08
L80030944:
  sll $zero, $zero, 0x0
L80030948:
  j L80030988
L8003094c:
  sll $zero, $zero, 0x0
L80030950:
  lui $v0, 0x800a
L80030954:
  lhu $v0, -19560($v0)
L80030958:
  lhu $v1, 964($gp)
L8003095c:
  andi $v0, $v0, 0x80
L80030960:
  sh $v1, 958($gp)
L80030964:
  beq $v0, $zero, L8003097c
L80030968:
  sll $zero, $zero, 0x0
L8003096c:
  jal L8003ffb4
L80030970:
  andi $a0, $v1, 0xffff
L80030974:
  j L80030988
L80030978:
  sll $zero, $zero, 0x0
L8003097c:
  lhu $a0, 964($gp)
L80030980:
  jal L8003ff88
L80030984:
  sll $zero, $zero, 0x0
L80030988:
  lw $ra, 36($sp)
L8003098c:
  lw $s0, 32($sp)
L80030990:
  jr $ra
L80030994:
  addiu $sp, $sp, 40
L80030998:
  lbu $v1, 995($gp)
L8003099c:
  addiu $sp, $sp, -40
L800309a0:
  sw $ra, 36($sp)
L800309a4:
  andi $v0, $v1, 0x80
L800309a8:
  bne $v0, $zero, L800309d4
L800309ac:
  sw $s0, 32($sp)
L800309b0:
  ori $v0, $v1, 0x80
L800309b4:
  sb $v0, 995($gp)
L800309b8:
  jal L80030090
L800309bc:
  sll $zero, $zero, 0x0
L800309c0:
  jal L8002fd10
L800309c4:
  addu $a0, $zero, $zero
L800309c8:
  sb $zero, 948($gp)
L800309cc:
  j L800309fc
L800309d0:
  sll $zero, $zero, 0x0
L800309d4:
  lui $v0, 0x800a
L800309d8:
  lhu $v0, -19560($v0)
L800309dc:
  sll $zero, $zero, 0x0
L800309e0:
  andi $v0, $v0, 0x100
L800309e4:
  beq $v0, $zero, L80030a68
L800309e8:
  sll $zero, $zero, 0x0
L800309ec:
  lbu $v0, 948($gp)
L800309f0:
  sll $zero, $zero, 0x0
L800309f4:
  xori $v0, $v0, 0x1
L800309f8:
  sb $v0, 948($gp)
L800309fc:
  lbu $v0, 948($gp)
L80030a00:
  sll $zero, $zero, 0x0
L80030a04:
  bne $v0, $zero, L80030a34
L80030a08:
  lui $a0, 0x8009
L80030a0c:
  lui $a0, 0x8009
L80030a10:
  addiu $a0, $a0, 3292
L80030a14:
  addiu $a1, $zero, 18
L80030a18:
  addu $a2, $zero, $zero
L80030a1c:
  addu $a3, $a2, $zero
L80030a20:
  lhu $v1, 60($gp)
L80030a24:
  addiu $v0, $zero, 2
L80030a28:
  sw $v0, 16($sp)
L80030a2c:
  j L80030a50
L80030a30:
  addiu $v0, $zero, 3
L80030a34:
  addiu $a0, $a0, 3316
L80030a38:
  addiu $a1, $zero, 18
L80030a3c:
  addu $a2, $zero, $zero
L80030a40:
  addu $a3, $a2, $zero
L80030a44:
  lhu $v1, 62($gp)
L80030a48:
  addiu $v0, $zero, 2
L80030a4c:
  sw $v0, 16($sp)
L80030a50:
  sw $v0, 20($sp)
L80030a54:
  addiu $v0, $zero, 1
L80030a58:
  sw $v0, 24($sp)
L80030a5c:
  sh $v1, 960($gp)
L80030a60:
  jal L80030250
L80030a64:
  sll $zero, $zero, 0x0
L80030a68:
  jal L80030294
L80030a6c:
  sll $zero, $zero, 0x0
L80030a70:
  lbu $a3, 995($gp)
L80030a74:
  addu $v1, $v0, $zero
L80030a78:
  andi $v0, $a3, 0x40
L80030a7c:
  beq $v0, $zero, L80030b20
L80030a80:
  sll $zero, $zero, 0x0
L80030a84:
  jal L80039794
L80030a88:
  sll $zero, $zero, 0x0
L80030a8c:
  lui $v1, 0x800f
L80030a90:
  lbu $v0, 995($gp)
L80030a94:
  sll $zero, $zero, 0x0
L80030a98:
  andi $v0, $v0, 0x20
L80030a9c:
  bne $v0, $zero, L80030ad8
L80030aa0:
  addiu $s0, $v1, -20232
L80030aa4:
  lhu $v0, 52($s0)
L80030aa8:
  sll $zero, $zero, 0x0
L80030aac:
  andi $v0, $v0, 0x2000
L80030ab0:
  beq $v0, $zero, L80030c00
L80030ab4:
  sll $zero, $zero, 0x0
L80030ab8:
  jal L800374f4
L80030abc:
  addu $a0, $s0, $zero
L80030ac0:
  lbu $v1, 995($gp)
L80030ac4:
  sw $v0, 48($s0)
L80030ac8:
  ori $v1, $v1, 0x20
L80030acc:
  sb $v1, 995($gp)
L80030ad0:
  j L80030c00
L80030ad4:
  sll $zero, $zero, 0x0
L80030ad8:
  jal L8003b734
L80030adc:
  sll $zero, $zero, 0x0
L80030ae0:
  beq $v0, $zero, L80030c00
L80030ae4:
  sll $zero, $zero, 0x0
L80030ae8:
  jal L80035b7c
L80030aec:
  addu $a0, $s0, $zero
L80030af0:
  lui $a0, 0x800a
L80030af4:
  lw $a0, -19808($a0)
L80030af8:
  jal 0x8004036c
L80030afc:
  sll $zero, $zero, 0x0
L80030b00:
  lbu $v0, 995($gp)
L80030b04:
  lbu $v1, 994($gp)
L80030b08:
  andi $v0, $v0, 0x9f
L80030b0c:
  andi $v1, $v1, 0xfe
L80030b10:
  sb $v0, 995($gp)
L80030b14:
  sb $v1, 994($gp)
L80030b18:
  j L80030c00
L80030b1c:
  sll $zero, $zero, 0x0
L80030b20:
  beq $v1, $zero, L80030c00
L80030b24:
  sll $zero, $zero, 0x0
L80030b28:
  bgez $v1, L80030b44
L80030b2c:
  sll $zero, $zero, 0x0
L80030b30:
  sb $zero, 995($gp)
L80030b34:
  jal L800300ac
L80030b38:
  sll $zero, $zero, 0x0
L80030b3c:
  j L80030c00
L80030b40:
  sll $zero, $zero, 0x0
L80030b44:
  lbu $v0, 948($gp)
L80030b48:
  sll $zero, $zero, 0x0
L80030b4c:
  bne $v0, $zero, L80030be8
L80030b50:
  addiu $v0, $zero, 2
L80030b54:
  addu $a0, $zero, $zero
L80030b58:
  lhu $a2, 960($gp)
L80030b5c:
  lbu $v1, 994($gp)
L80030b60:
  ori $v0, $a3, 0x40
L80030b64:
  sb $v0, 995($gp)
L80030b68:
  ori $v1, $v1, 0x1
L80030b6c:
  sh $a2, 60($gp)
L80030b70:
  sb $v1, 994($gp)
L80030b74:
  jal L8003b6ac
L80030b78:
  addiu $a1, $zero, 2
L80030b7c:
  lui $v1, 0x800f
L80030b80:
  lui $v0, 0x8009
L80030b84:
  lhu $a0, 3672($v0)
L80030b88:
  addiu $v1, $v1, -19832
L80030b8c:
  sll $v0, $a0, 0x3
L80030b90:
  subu $v0, $v0, $a0
L80030b94:
  sll $v0, $v0, 0x2
L80030b98:
  addu $v0, $v0, $v1
L80030b9c:
  lui $a0, 0x8001
L80030ba0:
  lbu $a1, 24($v0)
L80030ba4:
  jal 0x8008e870
L80030ba8:
  addiu $a0, $a0, 648
L80030bac:
  addu $a0, $zero, $zero
L80030bb0:
  addiu $a2, $zero, 16
L80030bb4:
  addiu $a3, $zero, 176
L80030bb8:
  lhu $a1, 60($gp)
L80030bbc:
  addiu $v0, $zero, 288
L80030bc0:
  sw $v0, 16($sp)
L80030bc4:
  addiu $v0, $zero, 48
L80030bc8:
  jal L80035be4
L80030bcc:
  sw $v0, 20($sp)
L80030bd0:
  jal L8002e3fc
L80030bd4:
  sll $zero, $zero, 0x0
L80030bd8:
  lui $at, 0x800a
L80030bdc:
  sw $v0, -19808($at)
L80030be0:
  j L80030c00
L80030be4:
  sll $zero, $zero, 0x0
L80030be8:
  lhu $v1, 960($gp)
L80030bec:
  lui $at, 0x800a
L80030bf0:
  sb $v0, -19860($at)
L80030bf4:
  sh $v1, 62($gp)
L80030bf8:
  lui $at, 0x800a
L80030bfc:
  sb $v1, -19846($at)
L80030c00:
  lw $ra, 36($sp)
L80030c04:
  lw $s0, 32($sp)
L80030c08:
  jr $ra
L80030c0c:
  addiu $sp, $sp, 40
L80030c10:
  lbu $v1, 995($gp)
L80030c14:
  addiu $sp, $sp, -40
L80030c18:
  andi $v0, $v1, 0x80
L80030c1c:
  bne $v0, $zero, L80030c64
L80030c20:
  sw $ra, 32($sp)
L80030c24:
  ori $v0, $v1, 0x80
L80030c28:
  sb $v0, 995($gp)
L80030c2c:
  addiu $v0, $zero, 12
L80030c30:
  sw $v0, 16($sp)
L80030c34:
  addiu $v0, $zero, 2
L80030c38:
  sw $v0, 20($sp)
L80030c3c:
  addiu $v0, $zero, 1
L80030c40:
  lui $a0, 0x8009
L80030c44:
  addiu $a0, $a0, 3340
L80030c48:
  addiu $a1, $zero, 20
L80030c4c:
  addu $a2, $zero, $zero
L80030c50:
  lbu $v1, 992($gp)
L80030c54:
  sw $v0, 24($sp)
L80030c58:
  sh $v1, 960($gp)
L80030c5c:
  jal L80030250
L80030c60:
  addu $a3, $a2, $zero
L80030c64:
  jal L80030294
L80030c68:
  sll $zero, $zero, 0x0
L80030c6c:
  beq $v0, $zero, L80030ca0
L80030c70:
  sll $zero, $zero, 0x0
L80030c74:
  bgez $v0, L80030c88
L80030c78:
  addiu $v0, $zero, 5
L80030c7c:
  sb $zero, 995($gp)
L80030c80:
  j L80030ca0
L80030c84:
  sll $zero, $zero, 0x0
L80030c88:
  lbu $v1, 960($gp)
L80030c8c:
  lui $at, 0x800a
L80030c90:
  sb $zero, -19613($at)
L80030c94:
  lui $at, 0x800a
L80030c98:
  sb $v0, -19860($at)
L80030c9c:
  sb $v1, 992($gp)
L80030ca0:
  lw $ra, 32($sp)
L80030ca4:
  sll $zero, $zero, 0x0
L80030ca8:
  jr $ra
L80030cac:
  addiu $sp, $sp, 40
L80030cb0:
  lbu $v1, 995($gp)
L80030cb4:
  addiu $sp, $sp, -40
L80030cb8:
  andi $v0, $v1, 0x80
L80030cbc:
  bne $v0, $zero, L80030d08
L80030cc0:
  sw $ra, 32($sp)
L80030cc4:
  ori $v0, $v1, 0x80
L80030cc8:
  sb $v0, 995($gp)
L80030ccc:
  addiu $v0, $zero, 18
L80030cd0:
  sw $v0, 16($sp)
L80030cd4:
  addiu $v0, $zero, 2
L80030cd8:
  sw $v0, 20($sp)
L80030cdc:
  addiu $v0, $zero, 1
L80030ce0:
  lui $a0, 0x8009
L80030ce4:
  addiu $a0, $a0, 3368
L80030ce8:
  addiu $a1, $zero, 21
L80030cec:
  addu $a2, $zero, $zero
L80030cf0:
  lui $v1, 0x800a
L80030cf4:
  lbu $v1, -19859($v1)
L80030cf8:
  sw $v0, 24($sp)
L80030cfc:
  sh $v1, 960($gp)
L80030d00:
  jal L80030250
L80030d04:
  addu $a3, $a2, $zero
L80030d08:
  jal L80030294
L80030d0c:
  sll $zero, $zero, 0x0
L80030d10:
  beq $v0, $zero, L80030d4c
L80030d14:
  sll $zero, $zero, 0x0
L80030d18:
  bgez $v0, L80030d2c
L80030d1c:
  addiu $v0, $zero, 1
L80030d20:
  sb $zero, 995($gp)
L80030d24:
  j L80030d4c
L80030d28:
  sll $zero, $zero, 0x0
L80030d2c:
  lbu $v1, 960($gp)
L80030d30:
  lui $at, 0x800a
L80030d34:
  sb $v0, -19864($at)
L80030d38:
  addiu $v0, $zero, 8
L80030d3c:
  lui $at, 0x800a
L80030d40:
  sb $v0, -19860($at)
L80030d44:
  lui $at, 0x800a
L80030d48:
  sb $v1, -19859($at)
L80030d4c:
  lw $ra, 32($sp)
L80030d50:
  sll $zero, $zero, 0x0
L80030d54:
  jr $ra
L80030d58:
  addiu $sp, $sp, 40
L80030d5c:
  lbu $v1, 995($gp)
L80030d60:
  addiu $sp, $sp, -40
L80030d64:
  andi $v0, $v1, 0x80
L80030d68:
  bne $v0, $zero, L80030dac
L80030d6c:
  sw $ra, 32($sp)
L80030d70:
  lui $a0, 0x8009
L80030d74:
  addiu $a0, $a0, 3396
L80030d78:
  ori $v0, $v1, 0x80
L80030d7c:
  sb $v0, 995($gp)
L80030d80:
  addiu $v0, $zero, 5
L80030d84:
  sw $v0, 16($sp)
L80030d88:
  addiu $v0, $zero, 2
L80030d8c:
  sw $v0, 20($sp)
L80030d90:
  addiu $v0, $zero, 1
L80030d94:
  addiu $a1, $zero, 29
L80030d98:
  addu $a2, $zero, $zero
L80030d9c:
  addu $a3, $a2, $zero
L80030da0:
  sh $zero, 960($gp)
L80030da4:
  jal L80030250
L80030da8:
  sw $v0, 24($sp)
L80030dac:
  lbu $a0, 995($gp)
L80030db0:
  sll $zero, $zero, 0x0
L80030db4:
  andi $v0, $a0, 0x40
L80030db8:
  beq $v0, $zero, L80030de0
L80030dbc:
  sll $zero, $zero, 0x0
L80030dc0:
  lui $v0, 0x800a
L80030dc4:
  lw $v0, -20236($v0)
L80030dc8:
  lui $v1, 0x200
L80030dcc:
  and $v0, $v0, $v1
L80030dd0:
  bne $v0, $zero, L80030e20
L80030dd4:
  andi $v0, $a0, 0xbf
L80030dd8:
  j L80030e1c
L80030ddc:
  sll $zero, $zero, 0x0
L80030de0:
  jal L80030294
L80030de4:
  sll $zero, $zero, 0x0
L80030de8:
  beq $v0, $zero, L80030e20
L80030dec:
  sll $zero, $zero, 0x0
L80030df0:
  bgez $v0, L80030e04
L80030df4:
  sll $zero, $zero, 0x0
L80030df8:
  sb $zero, 995($gp)
L80030dfc:
  j L80030e20
L80030e00:
  sll $zero, $zero, 0x0
L80030e04:
  lhu $a0, 960($gp)
L80030e08:
  jal L8003594c
L80030e0c:
  sll $zero, $zero, 0x0
L80030e10:
  lbu $v0, 995($gp)
L80030e14:
  sll $zero, $zero, 0x0
L80030e18:
  ori $v0, $v0, 0x40
L80030e1c:
  sb $v0, 995($gp)
L80030e20:
  lw $ra, 32($sp)
L80030e24:
  sll $zero, $zero, 0x0
L80030e28:
  jr $ra
L80030e2c:
  addiu $sp, $sp, 40
L80030e30:
  lbu $v1, 995($gp)
L80030e34:
  addiu $sp, $sp, -24
L80030e38:
  andi $v0, $v1, 0x80
L80030e3c:
  bne $v0, $zero, L80030e58
L80030e40:
  sw $ra, 16($sp)
L80030e44:
  ori $v0, $v1, 0x80
L80030e48:
  sb $v0, 995($gp)
L80030e4c:
  addiu $v0, $zero, 3
L80030e50:
  lui $at, 0x800a
L80030e54:
  sb $v0, -19884($at)
L80030e58:
  jal L8002892c
L80030e5c:
  sll $zero, $zero, 0x0
L80030e60:
  bne $v0, $zero, L80030e6c
L80030e64:
  sll $zero, $zero, 0x0
L80030e68:
  sb $zero, 995($gp)
L80030e6c:
  lw $ra, 16($sp)
L80030e70:
  sll $zero, $zero, 0x0
L80030e74:
  jr $ra
L80030e78:
  addiu $sp, $sp, 24
L80030e7c:
  lbu $v1, 995($gp)
L80030e80:
  addiu $sp, $sp, -24
L80030e84:
  andi $v0, $v1, 0x80
L80030e88:
  bne $v0, $zero, L80030ea4
L80030e8c:
  sw $ra, 16($sp)
L80030e90:
  ori $v0, $v1, 0x80
L80030e94:
  sb $v0, 995($gp)
L80030e98:
  addiu $v0, $zero, 4
L80030e9c:
  lui $at, 0x800a
L80030ea0:
  sb $v0, -19884($at)
L80030ea4:
  jal L8002892c
L80030ea8:
  sll $zero, $zero, 0x0
L80030eac:
  bne $v0, $zero, L80030eb8
L80030eb0:
  sll $zero, $zero, 0x0
L80030eb4:
  sb $zero, 995($gp)
L80030eb8:
  lw $ra, 16($sp)
L80030ebc:
  sll $zero, $zero, 0x0
L80030ec0:
  jr $ra
L80030ec4:
  addiu $sp, $sp, 24
L80030ec8:
  lbu $v1, 995($gp)
L80030ecc:
  addiu $sp, $sp, -24
L80030ed0:
  andi $v0, $v1, 0x80
L80030ed4:
  bne $v0, $zero, L80030ef4
L80030ed8:
  sw $ra, 16($sp)
L80030edc:
  ori $v0, $v1, 0x80
L80030ee0:
  sb $v0, 995($gp)
L80030ee4:
  lui $at, 0x800a
L80030ee8:
  sb $zero, -19475($at)
L80030eec:
  lui $at, 0x800a
L80030ef0:
  sb $zero, -19478($at)
L80030ef4:
  jal L8003fcd8
L80030ef8:
  sll $zero, $zero, 0x0
L80030efc:
  addu $v1, $v0, $zero
L80030f00:
  beq $v1, $zero, L80030f30
L80030f04:
  addiu $v0, $zero, 1
L80030f08:
  bne $v1, $v0, L80030f2c
L80030f0c:
  sll $zero, $zero, 0x0
L80030f10:
  jal 0x8005b85c
L80030f14:
  sll $zero, $zero, 0x0
L80030f18:
  jal 0x800137e4
L80030f1c:
  sll $zero, $zero, 0x0
L80030f20:
  addiu $v0, $zero, 14
L80030f24:
  lui $at, 0x800a
L80030f28:
  sb $v0, -19860($at)
L80030f2c:
  sb $zero, 995($gp)
L80030f30:
  lw $ra, 16($sp)
L80030f34:
  sll $zero, $zero, 0x0
L80030f38:
  jr $ra
L80030f3c:
  addiu $sp, $sp, 24
L80030f40:
  addiu $sp, $sp, -24
L80030f44:
  addiu $v0, $zero, 29136
L80030f48:
  addiu $a0, $zero, -1
L80030f4c:
  addiu $a1, $zero, 1
L80030f50:
  ori $a2, $zero, 0x8000
L80030f54:
  sw $ra, 16($sp)
L80030f58:
  lui $at, 0x800a
L80030f5c:
  sh $v0, -19606($at)
L80030f60:
  lui $at, 0x800a
L80030f64:
  sb $zero, -19608($at)
L80030f68:
  jal L80024dc8
L80030f6c:
  addu $a3, $a2, $zero
L80030f70:
  lw $ra, 16($sp)
L80030f74:
  sll $zero, $zero, 0x0
L80030f78:
  jr $ra
L80030f7c:
  addiu $sp, $sp, 24
L80030f80:
  addiu $sp, $sp, -24
L80030f84:
  sw $ra, 16($sp)
L80030f88:
  jal L80033c90
L80030f8c:
  sll $zero, $zero, 0x0
L80030f90:
  lw $ra, 16($sp)
L80030f94:
  sll $zero, $zero, 0x0
L80030f98:
  jr $ra
L80030f9c:
  addiu $sp, $sp, 24
L80030fa0:
  lui $v0, 0x8009
L80030fa4:
  lb $v1, 1001($gp)
L80030fa8:
  addiu $v0, $v0, 3432
L80030fac:
  lui $at, 0x800a
L80030fb0:
  sb $zero, -19611($at)
L80030fb4:
  addu $v1, $v1, $v0
L80030fb8:
  lbu $v0, 0($v1)
L80030fbc:
  sb $zero, 938($gp)
L80030fc0:
  lui $at, 0x800a
L80030fc4:
  sb $v0, -19860($at)
L80030fc8:
  jr $ra
L80030fcc:
  sll $zero, $zero, 0x0
L80030fd0:
  addiu $sp, $sp, -24
L80030fd4:
  sw $ra, 16($sp)
L80030fd8:
  jal 0x80015ad8
L80030fdc:
  sll $zero, $zero, 0x0
L80030fe0:
  jal 0x800403f0
L80030fe4:
  sll $zero, $zero, 0x0
L80030fe8:
  jal L80035a64
L80030fec:
  sll $zero, $zero, 0x0
L80030ff0:
  lui $a0, 0x800f
L80030ff4:
  addiu $a0, $a0, -25152
L80030ff8:
  jal 0x8008fb8c
L80030ffc:
  addiu $a1, $zero, 2
L80031000:
  lbu $v1, 995($gp)
L80031004:
  addiu $sp, $sp, -24
L80031008:
  andi $v0, $v1, 0x80
L8003100c:
  bne $v0, $zero, L8003102c
L80031010:
  sw $ra, 16($sp)
L80031014:
  ori $v0, $v1, 0x80
L80031018:
  sb $v0, 995($gp)
L8003101c:
  lui $at, 0x800a
L80031020:
  sb $zero, -19475($at)
L80031024:
  lui $at, 0x800a
L80031028:
  sb $zero, -19478($at)
L8003102c:
  jal L8003fd14
L80031030:
  sll $zero, $zero, 0x0
L80031034:
  addu $v1, $v0, $zero
L80031038:
  beq $v1, $zero, L80031068
L8003103c:
  addiu $v0, $zero, 1
L80031040:
  bne $v1, $v0, L80031064
L80031044:
  sll $zero, $zero, 0x0
L80031048:
  jal 0x8005b85c
L8003104c:
  sll $zero, $zero, 0x0
L80031050:
  jal 0x800137e4
L80031054:
  sll $zero, $zero, 0x0
L80031058:
  addiu $v0, $zero, 16
L8003105c:
  lui $at, 0x800a
L80031060:
  sb $v0, -19860($at)
L80031064:
  sb $zero, 995($gp)
L80031068:
  lw $ra, 16($sp)
L8003106c:
  sll $zero, $zero, 0x0
L80031070:
  jr $ra
L80031074:
  addiu $sp, $sp, 24
L80031078:
  sb $zero, 995($gp)
L8003107c:
  jr $ra
L80031080:
  sll $zero, $zero, 0x0
L80031084:
  addiu $sp, $sp, -40
L80031088:
  sw $ra, 32($sp)
L8003108c:
  sw $s1, 28($sp)
L80031090:
  jal 0x8008e590
L80031094:
  sw $s0, 24($sp)
L80031098:
  lbu $v1, 995($gp)
L8003109c:
  sll $zero, $zero, 0x0
L800310a0:
  beq $v1, $zero, L800310ec
L800310a4:
  addu $s0, $zero, $zero
L800310a8:
  lbu $v0, 1000($gp)
L800310ac:
  sll $zero, $zero, 0x0
L800310b0:
  beq $v0, $zero, L800310c0
L800310b4:
  lui $v0, 0x8009
L800310b8:
  j L800310c8
L800310bc:
  addiu $v0, $v0, 3452
L800310c0:
  lui $v0, 0x8009
L800310c4:
  addiu $v0, $v0, 3460
L800310c8:
  andi $v1, $v1, 0x1f
L800310cc:
  sll $v1, $v1, 0x2
L800310d0:
  addu $v1, $v1, $v0
L800310d4:
  lw $v0, 0($v1)
L800310d8:
  sll $zero, $zero, 0x0
L800310dc:
  jalr $ra, $v0
L800310e0:
  sll $zero, $zero, 0x0
L800310e4:
  j L80031338
L800310e8:
  sll $zero, $zero, 0x0
L800310ec:
  lui $s1, 0x800a
L800310f0:
  jal 0x8007ef84
L800310f4:
  addiu $a0, $s1, -20652
L800310f8:
  addiu $s0, $s0, 1
L800310fc:
  slti $v0, $s0, 22
L80031100:
  bne $v0, $zero, L800310f0
L80031104:
  sll $zero, $zero, 0x0
L80031108:
  lui $v0, 0x800a
L8003110c:
  lhu $v0, -19564($v0)
L80031110:
  sll $zero, $zero, 0x0
L80031114:
  andi $v0, $v0, 0xf000
L80031118:
  beq $v0, $zero, L8003125c
L8003111c:
  sll $zero, $zero, 0x0
L80031120:
  lui $v0, 0x800a
L80031124:
  lhu $v0, -19564($v0)
L80031128:
  sll $zero, $zero, 0x0
L8003112c:
  andi $v0, $v0, 0xa000
L80031130:
  beq $v0, $zero, L80031188
L80031134:
  sll $zero, $zero, 0x0
L80031138:
  lui $v0, 0x800a
L8003113c:
  lhu $v0, -19564($v0)
L80031140:
  sll $zero, $zero, 0x0
L80031144:
  andi $v0, $v0, 0x2000
L80031148:
  beq $v0, $zero, L80031170
L8003114c:
  sll $zero, $zero, 0x0
L80031150:
  lb $v0, 1001($gp)
L80031154:
  lbu $v1, 1001($gp)
L80031158:
  addiu $v0, $v0, 10
L8003115c:
  slti $v0, $v0, 20
L80031160:
  beq $v0, $zero, L80031188
L80031164:
  addiu $v0, $v1, 10
L80031168:
  j L80031184
L8003116c:
  sll $zero, $zero, 0x0
L80031170:
  lb $v0, 1001($gp)
L80031174:
  lbu $v1, 1001($gp)
L80031178:
  addiu $v0, $v0, -10
L8003117c:
  bltz $v0, L80031188
L80031180:
  addiu $v0, $v1, -10
L80031184:
  sb $v0, 1001($gp)
L80031188:
  lui $v0, 0x800a
L8003118c:
  lhu $v0, -19564($v0)
L80031190:
  sll $zero, $zero, 0x0
L80031194:
  andi $v0, $v0, 0x1000
L80031198:
  beq $v0, $zero, L800311e8
L8003119c:
  sll $zero, $zero, 0x0
L800311a0:
  lb $v0, 1001($gp)
L800311a4:
  lbu $v1, 1001($gp)
L800311a8:
  slti $v0, $v0, 10
L800311ac:
  bne $v0, $zero, L800311d4
L800311b0:
  addiu $v0, $v1, -1
L800311b4:
  sb $v0, 1001($gp)
L800311b8:
  sll $v0, $v0, 0x18
L800311bc:
  sra $v0, $v0, 0x18
L800311c0:
  slti $v0, $v0, 10
L800311c4:
  beq $v0, $zero, L800311e8
L800311c8:
  addiu $v0, $zero, 19
L800311cc:
  j L800311e4
L800311d0:
  sll $zero, $zero, 0x0
L800311d4:
  sb $v0, 1001($gp)
L800311d8:
  sll $v0, $v0, 0x18
L800311dc:
  bgez $v0, L800311e8
L800311e0:
  addiu $v0, $zero, 9
L800311e4:
  sb $v0, 1001($gp)
L800311e8:
  lui $v0, 0x800a
L800311ec:
  lhu $v0, -19564($v0)
L800311f0:
  sll $zero, $zero, 0x0
L800311f4:
  andi $v0, $v0, 0x4000
L800311f8:
  beq $v0, $zero, L80031254
L800311fc:
  sll $zero, $zero, 0x0
L80031200:
  lb $v0, 1001($gp)
L80031204:
  lbu $v1, 1001($gp)
L80031208:
  slti $v0, $v0, 10
L8003120c:
  bne $v0, $zero, L80031238
L80031210:
  addiu $v0, $v1, 1
L80031214:
  sb $v0, 1001($gp)
L80031218:
  sll $v0, $v0, 0x18
L8003121c:
  sra $v0, $v0, 0x18
L80031220:
  slti $v0, $v0, 20
L80031224:
  bne $v0, $zero, L80031254
L80031228:
  addiu $v0, $zero, 10
L8003122c:
  sb $v0, 1001($gp)
L80031230:
  j L80031254
L80031234:
  sll $zero, $zero, 0x0
L80031238:
  sb $v0, 1001($gp)
L8003123c:
  sll $v0, $v0, 0x18
L80031240:
  sra $v0, $v0, 0x18
L80031244:
  slti $v0, $v0, 10
L80031248:
  bne $v0, $zero, L80031254
L8003124c:
  sll $zero, $zero, 0x0
L80031250:
  sb $zero, 1001($gp)
L80031254:
  jal L800300c8
L80031258:
  sll $zero, $zero, 0x0
L8003125c:
  lui $v0, 0x800a
L80031260:
  lhu $v0, -19560($v0)
L80031264:
  sll $zero, $zero, 0x0
L80031268:
  andi $v0, $v0, 0x20
L8003126c:
  beq $v0, $zero, L80031298
L80031270:
  addiu $v1, $zero, 19
L80031274:
  lb $v0, 1001($gp)
L80031278:
  sll $zero, $zero, 0x0
L8003127c:
  beq $v0, $v1, L80031334
L80031280:
  addiu $v0, $zero, 20
L80031284:
  sb $v1, 1001($gp)
L80031288:
  jal L800300c8
L8003128c:
  sll $zero, $zero, 0x0
L80031290:
  j L80031338
L80031294:
  sll $zero, $zero, 0x0
L80031298:
  lui $v0, 0x800a
L8003129c:
  lhu $v0, -19560($v0)
L800312a0:
  sll $zero, $zero, 0x0
L800312a4:
  andi $v0, $v0, 0x100
L800312a8:
  beq $v0, $zero, L80031310
L800312ac:
  addiu $a0, $zero, 1
L800312b0:
  jal L8003b6ac
L800312b4:
  addu $a1, $a0, $zero
L800312b8:
  addiu $a0, $zero, 1
L800312bc:
  addiu $v1, $zero, 288
L800312c0:
  addiu $a2, $zero, 16
L800312c4:
  lbu $v0, 1000($gp)
L800312c8:
  addu $a3, $a2, $zero
L800312cc:
  sw $v1, 16($sp)
L800312d0:
  xor $v0, $v0, $a0
L800312d4:
  sb $v0, 1000($gp)
L800312d8:
  andi $a1, $v0, 0xff
L800312dc:
  addiu $v0, $zero, 160
L800312e0:
  addiu $a1, $a1, 15
L800312e4:
  jal L80035be4
L800312e8:
  sw $v0, 20($sp)
L800312ec:
  lui $v0, 0x800f
L800312f0:
  addiu $v0, $v0, -20232
L800312f4:
  addiu $a0, $v0, 100
L800312f8:
  addiu $v1, $zero, 16
L800312fc:
  sb $v1, 190($v0)
L80031300:
  jal L80039a14
L80031304:
  sb $v1, 191($v0)
L80031308:
  j L80031338
L8003130c:
  sll $zero, $zero, 0x0
L80031310:
  lui $v0, 0x800a
L80031314:
  lhu $v0, -19560($v0)
L80031318:
  sll $zero, $zero, 0x0
L8003131c:
  andi $v0, $v0, 0xc0
L80031320:
  beq $v0, $zero, L80031338
L80031324:
  sll $zero, $zero, 0x0
L80031328:
  lbu $v0, 1001($gp)
L8003132c:
  sll $zero, $zero, 0x0
L80031330:
  addiu $v0, $v0, 1
L80031334:
  sb $v0, 995($gp)
L80031338:
  lw $ra, 32($sp)
L8003133c:
  lw $s1, 28($sp)
L80031340:
  lw $s0, 24($sp)
L80031344:
  jr $ra
L80031348:
  addiu $sp, $sp, 40
L8003134c:
  jr $ra
L80031350:
  sll $zero, $zero, 0x0
L80031354:
  lbu $v1, 995($gp)
L80031358:
  addiu $sp, $sp, -24
L8003135c:
  andi $v0, $v1, 0x80
L80031360:
  bne $v0, $zero, L8003137c
L80031364:
  sw $ra, 16($sp)
L80031368:
  ori $v0, $v1, 0x80
L8003136c:
  sb $v0, 995($gp)
L80031370:
  sh $zero, 982($gp)
L80031374:
  jal L8002fd10
L80031378:
  addu $a0, $zero, $zero
L8003137c:
  jal L8003134c
L80031380:
  sll $zero, $zero, 0x0
L80031384:
  lhu $v0, 982($gp)
L80031388:
  sll $zero, $zero, 0x0
L8003138c:
  bne $v0, $zero, L800313c0
L80031390:
  lui $v0, 0x800f
L80031394:
  lw $v1, -20092($v0)
L80031398:
  sll $zero, $zero, 0x0
L8003139c:
  lhu $v0, 8($v1)
L800313a0:
  lw $a0, 988($gp)
L800313a4:
  ori $v0, $v0, 0x40
L800313a8:
  sh $v0, 8($v1)
L800313ac:
  lhu $v0, 8($a0)
L800313b0:
  sb $zero, 995($gp)
L800313b4:
  ori $v0, $v0, 0x40
L800313b8:
  j L800313d8
L800313bc:
  sh $v0, 8($a0)
L800313c0:
  jal L800358fc
L800313c4:
  addiu $a0, $zero, 4
L800313c8:
  lui $a0, 0x800f
L800313cc:
  addiu $a0, $a0, -20464
L800313d0:
  jal L8003b378
L800313d4:
  addu $a1, $v0, $zero
L800313d8:
  lw $ra, 16($sp)
L800313dc:
  sll $zero, $zero, 0x0
L800313e0:
  jr $ra
L800313e4:
  addiu $sp, $sp, 24
L800313e8:
  addiu $sp, $sp, -24
L800313ec:
  sw $s0, 16($sp)
L800313f0:
  sw $ra, 20($sp)
L800313f4:
  jal 0x80042b98
L800313f8:
  addu $s0, $a0, $zero
L800313fc:
  bne $v0, $zero, L80031430
L80031400:
  lui $v0, 0xf7ff
L80031404:
  ori $v0, $v0, 0xffff
L80031408:
  lw $v1, 4($s0)
L8003140c:
  lbu $a1, 108($s0)
L80031410:
  addiu $a0, $zero, 10
L80031414:
  sw $zero, 68($s0)
L80031418:
  sh $zero, 96($s0)
L8003141c:
  and $v1, $v1, $v0
L80031420:
  ori $a1, $a1, 0x40
L80031424:
  sw $v1, 4($s0)
L80031428:
  jal L8003fee0
L8003142c:
  sb $a1, 108($s0)
L80031430:
  lbu $v1, 108($s0)
L80031434:
  sll $zero, $zero, 0x0
L80031438:
  andi $v0, $v1, 0x40
L8003143c:
  beq $v0, $zero, L800314e8
L80031440:
  andi $v0, $v1, 0x20
L80031444:
  lhu $v0, 96($s0)
L80031448:
  sll $zero, $zero, 0x0
L8003144c:
  addiu $v0, $v0, 1
L80031450:
  sh $v0, 96($s0)
L80031454:
  sll $v0, $v0, 0x10
L80031458:
  lh $v1, 96($s0)
L8003145c:
  sra $v0, $v0, 0x7
L80031460:
  sh $v0, 70($s0)
L80031464:
  slti $v1, $v1, 8
L80031468:
  bne $v1, $zero, L80031564
L8003146c:
  sh $v0, 68($s0)
L80031470:
  jal 0x800429d8
L80031474:
  addu $a0, $s0, $zero
L80031478:
  lui $v1, 0x2aaa
L8003147c:
  lh $a1, 24($s0)
L80031480:
  lh $v0, 48($s0)
L80031484:
  ori $v1, $v1, 0xaaab
L80031488:
  subu $a1, $a1, $v0
L8003148c:
  sll $a1, $a1, 0x8
L80031490:
  mult $a1, $v1
L80031494:
  lh $a0, 26($s0)
L80031498:
  lh $v0, 50($s0)
L8003149c:
  mfhi $a2
L800314a0:
  subu $a0, $a0, $v0
L800314a4:
  sll $a0, $a0, 0x8
L800314a8:
  mult $a0, $v1
L800314ac:
  lbu $v0, 108($s0)
L800314b0:
  sra $a1, $a1, 0x1f
L800314b4:
  andi $v0, $v0, 0xbf
L800314b8:
  sb $v0, 108($s0)
L800314bc:
  addiu $v1, $zero, 12
L800314c0:
  sra $v0, $a2, 0x1
L800314c4:
  subu $v0, $v0, $a1
L800314c8:
  sra $a0, $a0, 0x1f
L800314cc:
  sh $v1, 96($s0)
L800314d0:
  sh $v0, 54($s0)
L800314d4:
  mfhi $t0
L800314d8:
  sra $v0, $t0, 0x1
L800314dc:
  subu $v0, $v0, $a0
L800314e0:
  j L80031564
L800314e4:
  sh $v0, 56($s0)
L800314e8:
  beq $v0, $zero, L80031528
L800314ec:
  sll $zero, $zero, 0x0
L800314f0:
  lhu $v0, 96($s0)
L800314f4:
  sll $zero, $zero, 0x0
L800314f8:
  addiu $v0, $v0, -1
L800314fc:
  sh $v0, 96($s0)
L80031500:
  sll $v0, $v0, 0x10
L80031504:
  lh $v1, 96($s0)
L80031508:
  sra $v0, $v0, 0x7
L8003150c:
  sh $v0, 70($s0)
L80031510:
  bne $v1, $zero, L80031564
L80031514:
  sh $v0, 68($s0)
L80031518:
  jal 0x8004036c
L8003151c:
  addu $a0, $s0, $zero
L80031520:
  j L80031564
L80031524:
  sll $zero, $zero, 0x0
L80031528:
  jal 0x80042a78
L8003152c:
  addu $a0, $s0, $zero
L80031530:
  lhu $v0, 96($s0)
L80031534:
  sll $zero, $zero, 0x0
L80031538:
  addiu $v0, $v0, -1
L8003153c:
  sh $v0, 96($s0)
L80031540:
  sll $v0, $v0, 0x10
L80031544:
  bgtz $v0, L80031564
L80031548:
  addiu $v0, $zero, 8
L8003154c:
  lw $a0, 24($s0)
L80031550:
  lbu $v1, 108($s0)
L80031554:
  sh $v0, 96($s0)
L80031558:
  ori $v1, $v1, 0x20
L8003155c:
  sw $a0, 48($s0)
L80031560:
  sb $v1, 108($s0)
L80031564:
  lw $ra, 20($sp)
L80031568:
  lw $s0, 16($sp)
L8003156c:
  jr $ra
L80031570:
  addiu $sp, $sp, 24
L80031574:
  addiu $sp, $sp, -64
L80031578:
  sw $s0, 40($sp)
L8003157c:
  addu $s0, $a0, $zero
L80031580:
  sw $s1, 44($sp)
L80031584:
  addu $s1, $a1, $zero
L80031588:
  sw $s2, 48($sp)
L8003158c:
  addu $s2, $a2, $zero
L80031590:
  sw $s4, 56($sp)
L80031594:
  addu $s4, $a3, $zero
L80031598:
  sw $ra, 60($sp)
L8003159c:
  jal 0x8004002c
L800315a0:
  sw $s3, 52($sp)
L800315a4:
  addu $a0, $v0, $zero
L800315a8:
  jal 0x800400ac
L800315ac:
  addiu $a1, $zero, 1
L800315b0:
  addu $s3, $v0, $zero
L800315b4:
  addu $a0, $s3, $zero
L800315b8:
  addu $a1, $s1, $zero
L800315bc:
  addiu $v0, $zero, 16
L800315c0:
  sw $v0, 16($sp)
L800315c4:
  addiu $v0, $zero, 200
L800315c8:
  sw $v0, 24($sp)
L800315cc:
  addiu $v0, $zero, 11
L800315d0:
  sw $v0, 28($sp)
L800315d4:
  addiu $v0, $zero, 608
L800315d8:
  sw $v0, 32($sp)
L800315dc:
  addiu $v0, $zero, 252
L800315e0:
  addu $a2, $s2, $zero
L800315e4:
  addiu $a3, $zero, 16
L800315e8:
  sw $zero, 20($sp)
L800315ec:
  jal 0x80040510
L800315f0:
  sw $v0, 36($sp)
L800315f4:
  lui $v0, 0x801d
L800315f8:
  addiu $v0, $v0, 16964
L800315fc:
  addiu $s0, $s0, -1
L80031600:
  sll $s0, $s0, 0x2
L80031604:
  addu $s0, $s0, $v0
L80031608:
  lw $v0, 0($s0)
L8003160c:
  sll $zero, $zero, 0x0
L80031610:
  sra $v0, $v0, 0x1a
L80031614:
  andi $v1, $v0, 0x1f
L80031618:
  addiu $v0, $zero, 21
L8003161c:
  beq $v1, $v0, L80031660
L80031620:
  sll $zero, $zero, 0x0
L80031624:
  slti $v0, $v1, 22
L80031628:
  beq $v0, $zero, L80031640
L8003162c:
  addiu $v0, $zero, 20
L80031630:
  beq $v1, $v0, L80031654
L80031634:
  sll $zero, $zero, 0x0
L80031638:
  j L8003167c
L8003163c:
  sll $zero, $zero, 0x0
L80031640:
  addiu $v0, $zero, 22
L80031644:
  beq $v1, $v0, L8003166c
L80031648:
  addiu $v0, $zero, 23
L8003164c:
  bne $v1, $v0, L8003167c
L80031650:
  sll $zero, $zero, 0x0
L80031654:
  lhu $v0, 64($s3)
L80031658:
  j L80031678
L8003165c:
  addiu $v0, $v0, 16
L80031660:
  lhu $v0, 64($s3)
L80031664:
  j L80031678
L80031668:
  addiu $v0, $v0, 32
L8003166c:
  lhu $v0, 64($s3)
L80031670:
  sll $zero, $zero, 0x0
L80031674:
  addiu $v0, $v0, 48
L80031678:
  sh $v0, 64($s3)
L8003167c:
  jal 0x80042918
L80031680:
  addu $a0, $s3, $zero
L80031684:
  addu $a0, $s3, $zero
L80031688:
  jal 0x800428ec
L8003168c:
  addiu $a1, $zero, 10
L80031690:
  lui $a1, 0xf7ff
L80031694:
  addu $v0, $s3, $zero
L80031698:
  sw $zero, 68($v0)
L8003169c:
  sh $s4, 24($v0)
L800316a0:
  lw $v1, 80($sp)
L800316a4:
  lw $a0, 4($v0)
L800316a8:
  ori $a1, $a1, 0xffff
L800316ac:
  sh $v1, 26($v0)
L800316b0:
  lui $v1, 0x8003
L800316b4:
  addiu $v1, $v1, 5096
L800316b8:
  sw $v1, 36($v0)
L800316bc:
  lhu $v1, 8($v0)
L800316c0:
  and $a0, $a0, $a1
L800316c4:
  sw $a0, 4($v0)
L800316c8:
  andi $v1, $v1, 0xfff7
L800316cc:
  sh $v1, 8($v0)
L800316d0:
  lw $ra, 60($sp)
L800316d4:
  lw $s4, 56($sp)
L800316d8:
  lw $s3, 52($sp)
L800316dc:
  lw $s2, 48($sp)
L800316e0:
  lw $s1, 44($sp)
L800316e4:
  lw $s0, 40($sp)
L800316e8:
  jr $ra
L800316ec:
  addiu $sp, $sp, 64
L800316f0:
  addiu $sp, $sp, -40
L800316f4:
  sw $s1, 20($sp)
L800316f8:
  addu $s1, $a0, $zero
L800316fc:
  sw $s2, 24($sp)
L80031700:
  addu $s2, $a1, $zero
L80031704:
  sw $s3, 28($sp)
L80031708:
  addu $s3, $a2, $zero
L8003170c:
  addiu $v0, $zero, 112
L80031710:
  sw $s0, 16($sp)
L80031714:
  addiu $s0, $a3, -1
L80031718:
  sw $ra, 32($sp)
L8003171c:
  bltz $s0, L80031768
L80031720:
  sb $v0, 15($s1)
L80031724:
  addu $v0, $s3, $s0
L80031728:
  lbu $v1, 0($v0)
L8003172c:
  sll $zero, $zero, 0x0
L80031730:
  sltiu $v0, $v1, 10
L80031734:
  beq $v0, $zero, L80031754
L80031738:
  sll $v0, $v1, 0x3
L8003173c:
  addiu $v0, $v0, -128
L80031740:
  sb $v0, 14($s1)
L80031744:
  addu $a0, $s1, $zero
L80031748:
  addu $a1, $s2, $zero
L8003174c:
  jal 0x800849f0
L80031750:
  addu $a2, $zero, $zero
L80031754:
  lhu $v0, 4($s1)
L80031758:
  addiu $s0, $s0, -1
L8003175c:
  addiu $v0, $v0, 8
L80031760:
  bgez $s0, L80031724
L80031764:
  sh $v0, 4($s1)
L80031768:
  lw $ra, 32($sp)
L8003176c:
  lw $s3, 28($sp)
L80031770:
  lw $s2, 24($sp)
L80031774:
  lw $s1, 20($sp)
L80031778:
  lw $s0, 16($sp)
L8003177c:
  jr $ra
L80031780:
  addiu $sp, $sp, 40
L80031784:
  addiu $sp, $sp, -48
L80031788:
  sw $s0, 16($sp)
L8003178c:
  addu $s0, $a0, $zero
L80031790:
  sw $s4, 32($sp)
L80031794:
  addu $s4, $a1, $zero
L80031798:
  sw $s1, 20($sp)
L8003179c:
  addu $s1, $a2, $zero
L800317a0:
  sw $s5, 36($sp)
L800317a4:
  addu $s5, $a3, $zero
L800317a8:
  addiu $v0, $zero, 251
L800317ac:
  sw $s3, 28($sp)
L800317b0:
  addu $s3, $zero, $zero
L800317b4:
  sw $s2, 24($sp)
L800317b8:
  addiu $s2, $s1, 1
L800317bc:
  sw $ra, 40($sp)
L800317c0:
  sh $v0, 18($s0)
L800317c4:
  lui $v0, 0x20
L800317c8:
  ori $v0, $v0, 0x2020
L800317cc:
  sw $v0, 20($s0)
L800317d0:
  lbu $v0, 0($s2)
L800317d4:
  sll $zero, $zero, 0x0
L800317d8:
  andi $v0, $v0, 0xf
L800317dc:
  bne $v0, $s5, L800317ec
L800317e0:
  lui $v0, 0x80
L800317e4:
  ori $v0, $v0, 0x8080
L800317e8:
  sw $v0, 20($s0)
L800317ec:
  addiu $s3, $s3, 1
L800317f0:
  addu $a0, $s0, $zero
L800317f4:
  lbu $v0, 0($s1)
L800317f8:
  addu $a1, $s4, $zero
L800317fc:
  andi $v0, $v0, 0xf
L80031800:
  sll $v0, $v0, 0x3
L80031804:
  addiu $v0, $v0, -128
L80031808:
  sb $v0, 14($s0)
L8003180c:
  lbu $v0, 0($s1)
L80031810:
  addu $a2, $zero, $zero
L80031814:
  andi $v0, $v0, 0xf0
L80031818:
  sb $v0, 15($s0)
L8003181c:
  lbu $v0, 0($s2)
L80031820:
  addiu $s2, $s2, 2
L80031824:
  andi $v0, $v0, 0xf0
L80031828:
  ori $v0, $v0, 0x200
L8003182c:
  jal 0x800849f0
L80031830:
  sh $v0, 16($s0)
L80031834:
  lhu $v0, 4($s0)
L80031838:
  sll $zero, $zero, 0x0
L8003183c:
  addiu $v0, $v0, 18
L80031840:
  sh $v0, 4($s0)
L80031844:
  slti $v0, $s3, 7
L80031848:
  bne $v0, $zero, L800317c4
L8003184c:
  addiu $s1, $s1, 2
L80031850:
  lw $ra, 40($sp)
L80031854:
  lw $s5, 36($sp)
L80031858:
  lw $s4, 32($sp)
L8003185c:
  lw $s3, 28($sp)
L80031860:
  lw $s2, 24($sp)
L80031864:
  lw $s1, 20($sp)
L80031868:
  lw $s0, 16($sp)
L8003186c:
  jr $ra
L80031870:
  addiu $sp, $sp, 48
L80031874:
  addiu $sp, $sp, -64
L80031878:
  sw $s4, 40($sp)
L8003187c:
  addu $s4, $a1, $zero
L80031880:
  sw $s0, 24($sp)
L80031884:
  lui $s0, 0x1f80
L80031888:
  ori $s0, $s0, 0x20
L8003188c:
  lui $t2, 0x1f80
L80031890:
  ori $t2, $t2, 0x60
L80031894:
  lui $a3, 0x80
L80031898:
  ori $a3, $a3, 0x8080
L8003189c:
  lui $a2, 0x8
L800318a0:
  ori $a2, $a2, 0x8
L800318a4:
  lui $v1, 0x10
L800318a8:
  ori $v1, $v1, 0x10
L800318ac:
  sw $ra, 60($sp)
L800318b0:
  sw $fp, 56($sp)
L800318b4:
  sw $s7, 52($sp)
L800318b8:
  sw $s6, 48($sp)
L800318bc:
  sw $s5, 44($sp)
L800318c0:
  sw $s3, 36($sp)
L800318c4:
  sw $s2, 32($sp)
L800318c8:
  sw $s1, 28($sp)
L800318cc:
  lh $t0, 48($a0)
L800318d0:
  lh $t1, 50($a0)
L800318d4:
  lw $a1, 4($a0)
L800318d8:
  addiu $v0, $zero, 11
L800318dc:
  sh $v0, 12($t2)
L800318e0:
  sh $v0, 12($s0)
L800318e4:
  sw $a3, 20($s0)
L800318e8:
  sw $a2, 8($s0)
L800318ec:
  sw $v1, 8($t2)
L800318f0:
  lui $v1, 0x800a
L800318f4:
  lh $v1, -20154($v1)
L800318f8:
  addiu $v0, $zero, 656
L800318fc:
  sh $v0, 16($s0)
L80031900:
  addiu $v0, $zero, 250
L80031904:
  sh $v0, 18($s0)
L80031908:
  lui $v0, 0x800a
L8003190c:
  lh $v0, -20152($v0)
L80031910:
  subu $s7, $t0, $v1
L80031914:
  sw $a1, 0($t2)
L80031918:
  sw $a1, 0($s0)
L8003191c:
  lbu $s6, 103($a0)
L80031920:
  subu $t1, $t1, $v0
L80031924:
  sll $v0, $s6, 0x3
L80031928:
  addu $v0, $v0, $s6
L8003192c:
  sll $v0, $v0, 0x4
L80031930:
  addu $v0, $v0, $s6
L80031934:
  sll $v1, $v0, 0x2
L80031938:
  addu $v0, $v0, $v1
L8003193c:
  sll $v0, $v0, 0x2
L80031940:
  subu $v0, $v0, $s6
L80031944:
  sll $v0, $v0, 0x2
L80031948:
  lw $v1, 1012($gp)
L8003194c:
  addiu $v0, $v0, 4
L80031950:
  addu $v1, $v1, $v0
L80031954:
  sw $v1, 16($sp)
L80031958:
  lh $v0, 11580($v1)
L8003195c:
  lui $s3, 0x1f80
L80031960:
  sll $v0, $v0, 0x4
L80031964:
  bne $s6, $zero, L8003199c
L80031968:
  addu $s1, $v1, $v0
L8003196c:
  addu $a0, $s3, $zero
L80031970:
  ori $a0, $a0, 0x60
L80031974:
  addu $a1, $s4, $zero
L80031978:
  addiu $v0, $s7, 136
L8003197c:
  sh $v0, 4($t2)
L80031980:
  addiu $v0, $t1, 15
L80031984:
  sh $v0, 6($t2)
L80031988:
  lw $t3, 16($sp)
L8003198c:
  lui $a2, 0x8009
L80031990:
  lbu $a3, 11589($t3)
L80031994:
  j L800319d0
L80031998:
  addiu $a2, $a2, 3544
L8003199c:
  lui $a0, 0x1f80
L800319a0:
  ori $a0, $a0, 0x60
L800319a4:
  addu $a1, $s4, $zero
L800319a8:
  addiu $v0, $s7, 106
L800319ac:
  sh $v0, 4($t2)
L800319b0:
  addiu $v0, $t1, 15
L800319b4:
  sh $v0, 6($t2)
L800319b8:
  sll $v0, $s6, 0x4
L800319bc:
  lui $a2, 0x8009
L800319c0:
  lw $t3, 16($sp)
L800319c4:
  addiu $a2, $a2, 3544
L800319c8:
  lbu $a3, 11589($t3)
L800319cc:
  addu $a2, $v0, $a2
L800319d0:
  jal L80031784
L800319d4:
  addu $s5, $zero, $zero
L800319d8:
  addiu $fp, $zero, 43
L800319dc:
  addiu $s1, $s1, 8
L800319e0:
  addiu $v0, $s7, 4
L800319e4:
  sh $v0, 4($s0)
L800319e8:
  sh $fp, 6($s0)
L800319ec:
  lbu $v0, 5($s1)
L800319f0:
  sll $zero, $zero, 0x0
L800319f4:
  beq $v0, $zero, L80031c90
L800319f8:
  lui $v0, 0x80
L800319fc:
  ori $v0, $v0, 0x8080
L80031a00:
  sw $v0, 20($s0)
L80031a04:
  lbu $v0, 5($s1)
L80031a08:
  lh $s2, -4($s1)
L80031a0c:
  andi $v0, $v0, 0x80
L80031a10:
  beq $v0, $zero, L80031a20
L80031a14:
  lui $v0, 0x40
L80031a18:
  ori $v0, $v0, 0x4040
L80031a1c:
  sw $v0, 20($s0)
L80031a20:
  beq $s6, $zero, L80031a70
L80031a24:
  addiu $v0, $s7, 17
L80031a28:
  sh $v0, 4($s0)
L80031a2c:
  lw $t3, 16($sp)
L80031a30:
  addiu $a1, $zero, 2
L80031a34:
  lh $a0, 11580($t3)
L80031a38:
  addu $a2, $s3, $zero
L80031a3c:
  addu $a0, $a0, $s5
L80031a40:
  jal L800358a0
L80031a44:
  addiu $a0, $a0, 1
L80031a48:
  addu $a0, $s0, $zero
L80031a4c:
  addu $a1, $s4, $zero
L80031a50:
  addu $a2, $s3, $zero
L80031a54:
  jal L800316f0
L80031a58:
  addiu $a3, $zero, 2
L80031a5c:
  lhu $v0, 4($s0)
L80031a60:
  sll $zero, $zero, 0x0
L80031a64:
  addiu $v0, $v0, 4
L80031a68:
  j L80031ad0
L80031a6c:
  sh $v0, 4($s0)
L80031a70:
  lw $v0, 1012($gp)
L80031a74:
  sll $zero, $zero, 0x0
L80031a78:
  addu $v0, $v0, $s2
L80031a7c:
  lbu $v0, 24682($v0)
L80031a80:
  sll $zero, $zero, 0x0
L80031a84:
  beq $v0, $zero, L80031ad0
L80031a88:
  addu $a0, $s0, $zero
L80031a8c:
  addu $a1, $s4, $zero
L80031a90:
  addu $a2, $zero, $zero
L80031a94:
  lhu $v1, 6($s0)
L80031a98:
  addiu $v0, $zero, 104
L80031a9c:
  sb $v0, 15($s0)
L80031aa0:
  addiu $v0, $zero, 24
L80031aa4:
  sh $v0, 8($s0)
L80031aa8:
  addiu $v0, $zero, 232
L80031aac:
  sb $v0, 14($s0)
L80031ab0:
  addiu $v1, $v1, 8
L80031ab4:
  jal 0x800849f0
L80031ab8:
  sh $v1, 6($s0)
L80031abc:
  lhu $v1, 6($s0)
L80031ac0:
  addiu $v0, $zero, 8
L80031ac4:
  sh $v0, 8($s0)
L80031ac8:
  addiu $v1, $v1, -8
L80031acc:
  sh $v1, 6($s0)
L80031ad0:
  addu $a0, $s2, $zero
L80031ad4:
  addiu $a1, $zero, 3
L80031ad8:
  jal L800358a0
L80031adc:
  addu $a2, $s3, $zero
L80031ae0:
  addu $a0, $s0, $zero
L80031ae4:
  addu $a1, $s4, $zero
L80031ae8:
  addu $a2, $s3, $zero
L80031aec:
  jal L800316f0
L80031af0:
  addiu $a3, $zero, 3
L80031af4:
  lhu $v0, 4($s0)
L80031af8:
  sll $zero, $zero, 0x0
L80031afc:
  addiu $v0, $v0, 136
L80031b00:
  sh $v0, 4($s0)
L80031b04:
  lbu $v0, 2($s1)
L80031b08:
  sll $zero, $zero, 0x0
L80031b0c:
  sltiu $v0, $v0, 20
L80031b10:
  beq $v0, $zero, L80031bcc
L80031b14:
  addu $a0, $s0, $zero
L80031b18:
  addu $a1, $s4, $zero
L80031b1c:
  addu $a2, $zero, $zero
L80031b20:
  addiu $v0, $zero, 22736
L80031b24:
  jal 0x800849f0
L80031b28:
  sh $v0, 14($s0)
L80031b2c:
  lhu $v0, 4($s0)
L80031b30:
  addiu $a1, $zero, 4
L80031b34:
  addiu $v0, $v0, 8
L80031b38:
  sh $v0, 4($s0)
L80031b3c:
  lh $a0, -2($s1)
L80031b40:
  jal L800357e8
L80031b44:
  addu $a2, $s3, $zero
L80031b48:
  addu $a0, $s0, $zero
L80031b4c:
  addu $a1, $s4, $zero
L80031b50:
  addu $a2, $s3, $zero
L80031b54:
  jal L800316f0
L80031b58:
  addiu $a3, $zero, 4
L80031b5c:
  addu $a0, $s0, $zero
L80031b60:
  addu $a1, $s4, $zero
L80031b64:
  addu $a2, $zero, $zero
L80031b68:
  addiu $v0, $zero, 22744
L80031b6c:
  sh $v0, 14($s0)
L80031b70:
  lhu $v0, 4($s0)
L80031b74:
  lhu $v1, 6($s0)
L80031b78:
  addiu $v0, $v0, -40
L80031b7c:
  addiu $v1, $v1, 8
L80031b80:
  sh $v0, 4($s0)
L80031b84:
  jal 0x800849f0
L80031b88:
  sh $v1, 6($s0)
L80031b8c:
  lhu $v0, 4($s0)
L80031b90:
  addiu $a1, $zero, 4
L80031b94:
  addiu $v0, $v0, 8
L80031b98:
  sh $v0, 4($s0)
L80031b9c:
  lh $a0, 0($s1)
L80031ba0:
  jal L800357e8
L80031ba4:
  addu $a2, $s3, $zero
L80031ba8:
  addu $a0, $s0, $zero
L80031bac:
  addu $a1, $s4, $zero
L80031bb0:
  addu $a2, $s3, $zero
L80031bb4:
  jal L800316f0
L80031bb8:
  addiu $a3, $zero, 4
L80031bbc:
  lhu $v0, 6($s0)
L80031bc0:
  sll $zero, $zero, 0x0
L80031bc4:
  addiu $v0, $v0, -8
L80031bc8:
  sh $v0, 6($s0)
L80031bcc:
  bne $s6, $zero, L80031c90
L80031bd0:
  addiu $a1, $zero, 3
L80031bd4:
  addiu $v0, $s7, 263
L80031bd8:
  sh $v0, 4($s0)
L80031bdc:
  lhu $v0, 6($s0)
L80031be0:
  lw $v1, 1012($gp)
L80031be4:
  addiu $v0, $v0, 8
L80031be8:
  addu $v1, $v1, $s2
L80031bec:
  sh $v0, 6($s0)
L80031bf0:
  lbu $a0, 23959($v1)
L80031bf4:
  jal L800357e8
L80031bf8:
  addu $a2, $s3, $zero
L80031bfc:
  addu $a0, $s0, $zero
L80031c00:
  addu $a1, $s4, $zero
L80031c04:
  addu $a2, $s3, $zero
L80031c08:
  jal L800316f0
L80031c0c:
  addiu $a3, $zero, 3
L80031c10:
  lw $v0, 1012($gp)
L80031c14:
  sll $zero, $zero, 0x0
L80031c18:
  addu $v0, $v0, $s2
L80031c1c:
  lbu $a0, 23236($v0)
L80031c20:
  sll $zero, $zero, 0x0
L80031c24:
  slti $v0, $a0, 3
L80031c28:
  beq $v0, $zero, L80031c44
L80031c2c:
  addiu $v0, $s2, -17
L80031c30:
  sltiu $v0, $v0, 5
L80031c34:
  beq $v0, $zero, L80031c54
L80031c38:
  addiu $a1, $zero, 2
L80031c3c:
  beq $a0, $zero, L80031c58
L80031c40:
  addu $a2, $s3, $zero
L80031c44:
  lui $v0, 0x20
L80031c48:
  ori $v0, $v0, 0x20ff
L80031c4c:
  sw $v0, 20($s0)
L80031c50:
  addiu $a1, $zero, 2
L80031c54:
  addu $a2, $s3, $zero
L80031c58:
  addiu $v0, $s7, 290
L80031c5c:
  jal L800357e8
L80031c60:
  sh $v0, 4($s0)
L80031c64:
  addu $a0, $s0, $zero
L80031c68:
  addu $a1, $s4, $zero
L80031c6c:
  addu $a2, $s3, $zero
L80031c70:
  jal L800316f0
L80031c74:
  addiu $a3, $zero, 2
L80031c78:
  lui $v1, 0x80
L80031c7c:
  lhu $v0, 6($s0)
L80031c80:
  ori $v1, $v1, 0x8080
L80031c84:
  sw $v1, 20($s0)
L80031c88:
  addiu $v0, $v0, -8
L80031c8c:
  sh $v0, 6($s0)
L80031c90:
  addiu $s1, $s1, 16
L80031c94:
  addiu $s5, $s5, 1
L80031c98:
  slti $v0, $s5, 8
L80031c9c:
  bne $v0, $zero, L800319e0
L80031ca0:
  addiu $fp, $fp, 22
L80031ca4:
  lw $ra, 60($sp)
L80031ca8:
  lw $fp, 56($sp)
L80031cac:
  lw $s7, 52($sp)
L80031cb0:
  lw $s6, 48($sp)
L80031cb4:
  lw $s5, 44($sp)
L80031cb8:
  lw $s4, 40($sp)
L80031cbc:
  lw $s3, 36($sp)
L80031cc0:
  lw $s2, 32($sp)
L80031cc4:
  lw $s1, 28($sp)
L80031cc8:
  lw $s0, 24($sp)
L80031ccc:
  jr $ra
L80031cd0:
  addiu $sp, $sp, 64
L80031cd4:
  addiu $sp, $sp, -40
L80031cd8:
  sw $s0, 24($sp)
L80031cdc:
  addu $s0, $a0, $zero
L80031ce0:
  sw $ra, 32($sp)
L80031ce4:
  sw $s1, 28($sp)
L80031ce8:
  lh $v0, 11580($s0)
L80031cec:
  addu $s1, $a1, $zero
L80031cf0:
  addu $v0, $v0, $s1
L80031cf4:
  sll $v0, $v0, 0x4
L80031cf8:
  addu $v0, $s0, $v0
L80031cfc:
  lhu $v1, 4($v0)
L80031d00:
  lh $v0, 11580($s0)
L80031d04:
  sll $zero, $zero, 0x0
L80031d08:
  addu $v0, $v0, $s1
L80031d0c:
  sll $v0, $v0, 0x4
L80031d10:
  addu $v0, $s0, $v0
L80031d14:
  lui $at, 0x800a
L80031d18:
  sh $v1, -19656($at)
L80031d1c:
  lbu $v0, 13($v0)
L80031d20:
  sll $zero, $zero, 0x0
L80031d24:
  beq $v0, $zero, L80031d30
L80031d28:
  addu $a1, $zero, $zero
L80031d2c:
  addiu $a1, $zero, 6
L80031d30:
  lbu $a0, 11591($s0)
L80031d34:
  addiu $v0, $zero, 288
L80031d38:
  sw $v0, 16($sp)
L80031d3c:
  addiu $v0, $zero, 176
L80031d40:
  addiu $a2, $zero, 34
L80031d44:
  addiu $a3, $zero, 43
L80031d48:
  sw $v0, 20($sp)
L80031d4c:
  jal L80035be4
L80031d50:
  addiu $a0, $a0, 1
L80031d54:
  addu $a0, $v0, $zero
L80031d58:
  sll $v0, $s1, 0x1
L80031d5c:
  addu $v0, $v0, $s1
L80031d60:
  sll $v0, $v0, 0x2
L80031d64:
  subu $v0, $v0, $s1
L80031d68:
  lw $v1, 40($a0)
L80031d6c:
  sll $v0, $v0, 0x1
L80031d70:
  sh $v0, 58($a0)
L80031d74:
  lhu $v0, 8($v1)
L80031d78:
  sll $zero, $zero, 0x0
L80031d7c:
  andi $v0, $v0, 0xfff7
L80031d80:
  sh $v0, 8($v1)
L80031d84:
  lh $v0, 11580($s0)
L80031d88:
  sll $zero, $zero, 0x0
L80031d8c:
  addu $v0, $v0, $s1
L80031d90:
  sll $v0, $v0, 0x4
L80031d94:
  addu $v0, $s0, $v0
L80031d98:
  lbu $v0, 13($v0)
L80031d9c:
  sll $zero, $zero, 0x0
L80031da0:
  andi $v0, $v0, 0x80
L80031da4:
  beq $v0, $zero, L80031db0
L80031da8:
  addiu $v0, $zero, 4
L80031dac:
  sb $v0, 84($a0)
L80031db0:
  lbu $v0, 11591($s0)
L80031db4:
  sll $zero, $zero, 0x0
L80031db8:
  beq $v0, $zero, L80031dd0
L80031dbc:
  sll $zero, $zero, 0x0
L80031dc0:
  lhu $v0, 60($a0)
L80031dc4:
  sll $zero, $zero, 0x0
L80031dc8:
  addiu $v0, $v0, 352
L80031dcc:
  sh $v0, 60($a0)
L80031dd0:
  beq $s1, $zero, L80031de8
L80031dd4:
  sll $zero, $zero, 0x0
L80031dd8:
  lhu $v0, 52($a0)
L80031ddc:
  sll $zero, $zero, 0x0
L80031de0:
  ori $v0, $v0, 0x40
L80031de4:
  sh $v0, 52($a0)
L80031de8:
  jal L80039a14
L80031dec:
  sll $zero, $zero, 0x0
L80031df0:
  lw $ra, 32($sp)
L80031df4:
  lw $s1, 28($sp)
L80031df8:
  lw $s0, 24($sp)
L80031dfc:
  jr $ra
L80031e00:
  addiu $sp, $sp, 40
L80031e04:
  addiu $sp, $sp, -32
L80031e08:
  sw $s2, 24($sp)
L80031e0c:
  addu $s2, $a0, $zero
L80031e10:
  sw $s1, 20($sp)
L80031e14:
  addu $s1, $a1, $zero
L80031e18:
  sw $s0, 16($sp)
L80031e1c:
  addu $s0, $zero, $zero
L80031e20:
  blez $s1, L80031e44
L80031e24:
  sw $ra, 28($sp)
L80031e28:
  addu $a0, $s2, $zero
L80031e2c:
  jal L80031cd4
L80031e30:
  addu $a1, $s0, $zero
L80031e34:
  addiu $s0, $s0, 1
L80031e38:
  slt $v0, $s0, $s1
L80031e3c:
  bne $v0, $zero, L80031e2c
L80031e40:
  addu $a0, $s2, $zero
L80031e44:
  lw $ra, 28($sp)
L80031e48:
  lw $s2, 24($sp)
L80031e4c:
  lw $s1, 20($sp)
L80031e50:
  lw $s0, 16($sp)
L80031e54:
  jr $ra
L80031e58:
  addiu $sp, $sp, 32
L80031e5c:
  addiu $sp, $sp, -40
L80031e60:
  addu $a1, $a0, $zero
L80031e64:
  addiu $a0, $zero, 3
L80031e68:
  lui $v1, 0x801d
L80031e6c:
  addiu $a2, $zero, 22
L80031e70:
  sw $ra, 36($sp)
L80031e74:
  sw $s0, 32($sp)
L80031e78:
  lw $v0, 23196($a1)
L80031e7c:
  addiu $a3, $zero, 23
L80031e80:
  sw $v0, 22024($v1)
L80031e84:
  lw $a1, 23200($a1)
L80031e88:
  addiu $v0, $zero, 640
L80031e8c:
  sw $v0, 16($sp)
L80031e90:
  addiu $v0, $zero, 16
L80031e94:
  sw $v0, 20($sp)
L80031e98:
  addiu $v0, $zero, 256
L80031e9c:
  addiu $v1, $v1, 22024
L80031ea0:
  sw $v0, 24($sp)
L80031ea4:
  sw $a1, 4($v1)
L80031ea8:
  jal L80035c38
L80031eac:
  addiu $a1, $zero, 14
L80031eb0:
  addu $s0, $v0, $zero
L80031eb4:
  jal L80039a14
L80031eb8:
  addu $a0, $s0, $zero
L80031ebc:
  lw $v1, 40($s0)
L80031ec0:
  sll $zero, $zero, 0x0
L80031ec4:
  lhu $v0, 8($v1)
L80031ec8:
  sll $zero, $zero, 0x0
L80031ecc:
  andi $v0, $v0, 0xfff7
L80031ed0:
  sh $v0, 8($v1)
L80031ed4:
  lw $ra, 36($sp)
L80031ed8:
  lw $s0, 32($sp)
L80031edc:
  jr $ra
L80031ee0:
  addiu $sp, $sp, 40
L80031ee4:
  addiu $sp, $sp, -24
L80031ee8:
  addu $a2, $a0, $a1
L80031eec:
  sw $ra, 16($sp)
L80031ef0:
  lbu $a3, 23959($a2)
L80031ef4:
  sll $zero, $zero, 0x0
L80031ef8:
  andi $v1, $a3, 0xff
L80031efc:
  bne $v1, $zero, L80031f50
L80031f00:
  addiu $v0, $zero, 250
L80031f04:
  lw $v0, 23196($a0)
L80031f08:
  sll $zero, $zero, 0x0
L80031f0c:
  addiu $v0, $v0, 1
L80031f10:
  sw $v0, 23196($a0)
L80031f14:
  lbu $v0, 23959($a2)
L80031f18:
  addiu $v1, $a0, 4
L80031f1c:
  addiu $v0, $v0, 1
L80031f20:
  sb $v0, 23959($a2)
L80031f24:
  lh $v0, 4($v1)
L80031f28:
  sll $zero, $zero, 0x0
L80031f2c:
  bne $v0, $a1, L80031f24
L80031f30:
  addiu $v1, $v1, 16
L80031f34:
  addiu $v1, $v1, -16
L80031f38:
  addiu $v0, $zero, 1
L80031f3c:
  sb $v0, 13($v1)
L80031f40:
  jal L80032c48
L80031f44:
  addiu $a0, $a0, 4
L80031f48:
  j L80031f6c
L80031f4c:
  sll $zero, $zero, 0x0
L80031f50:
  beq $v1, $v0, L80031f6c
L80031f54:
  addiu $v0, $a3, 1
L80031f58:
  sb $v0, 23959($a2)
L80031f5c:
  lw $v0, 23196($a0)
L80031f60:
  sll $zero, $zero, 0x0
L80031f64:
  addiu $v0, $v0, 1
L80031f68:
  sw $v0, 23196($a0)
L80031f6c:
  lw $ra, 16($sp)
L80031f70:
  sll $zero, $zero, 0x0
L80031f74:
  jr $ra
L80031f78:
  addiu $sp, $sp, 24
L80031f7c:
  addiu $sp, $sp, -32
L80031f80:
  sw $s1, 20($sp)
L80031f84:
  addu $s1, $a0, $zero
L80031f88:
  sw $s2, 24($sp)
L80031f8c:
  addu $s2, $a1, $zero
L80031f90:
  addu $v0, $s1, $s2
L80031f94:
  sw $ra, 28($sp)
L80031f98:
  sw $s0, 16($sp)
L80031f9c:
  lbu $s0, 23959($v0)
L80031fa0:
  sll $zero, $zero, 0x0
L80031fa4:
  beq $s0, $zero, L80032004
L80031fa8:
  addiu $s0, $s0, -1
L80031fac:
  bne $s0, $zero, L80031ff0
L80031fb0:
  addiu $v1, $s1, 4
L80031fb4:
  lh $v0, 4($v1)
L80031fb8:
  sll $zero, $zero, 0x0
L80031fbc:
  beq $v0, $s2, L80031fcc
L80031fc0:
  addu $v0, $s1, $s2
L80031fc4:
  j L80031fb4
L80031fc8:
  addiu $v1, $v1, 16
L80031fcc:
  sb $zero, 13($v1)
L80031fd0:
  lbu $v0, 23959($v0)
L80031fd4:
  sll $zero, $zero, 0x0
L80031fd8:
  beq $v0, $zero, L80031fe4
L80031fdc:
  addiu $v0, $zero, 128
L80031fe0:
  sb $v0, 13($v1)
L80031fe4:
  jal L80032c48
L80031fe8:
  addiu $a0, $s1, 4
L80031fec:
  addu $v0, $s1, $s2
L80031ff0:
  sb $s0, 23959($v0)
L80031ff4:
  lw $v0, 23196($s1)
L80031ff8:
  sll $zero, $zero, 0x0
L80031ffc:
  addiu $v0, $v0, -1
L80032000:
  sw $v0, 23196($s1)
L80032004:
  lw $ra, 28($sp)
L80032008:
  lw $s2, 24($sp)
L8003200c:
  lw $s1, 20($sp)
L80032010:
  lw $s0, 16($sp)
L80032014:
  jr $ra
L80032018:
  addiu $sp, $sp, 32
L8003201c:
  sb $zero, 23236($a0)
L80032020:
  addiu $a2, $zero, 1
L80032024:
  addu $t0, $a0, $a2
L80032028:
  sb $zero, 23236($t0)
L8003202c:
  addu $a1, $zero, $zero
L80032030:
  addu $a3, $t0, $zero
L80032034:
  addiu $v1, $a0, 11604
L80032038:
  lbu $v0, 9($v1)
L8003203c:
  sll $zero, $zero, 0x0
L80032040:
  beq $v0, $zero, L80032068
L80032044:
  sll $zero, $zero, 0x0
L80032048:
  lh $v0, 0($v1)
L8003204c:
  sll $zero, $zero, 0x0
L80032050:
  bne $v0, $a2, L80032068
L80032054:
  sll $zero, $zero, 0x0
L80032058:
  lbu $v0, 23236($a3)
L8003205c:
  sll $zero, $zero, 0x0
L80032060:
  addiu $v0, $v0, 1
L80032064:
  sb $v0, 23236($a3)
L80032068:
  addiu $a1, $a1, 1
L8003206c:
  slti $v0, $a1, 40
L80032070:
  bne $v0, $zero, L80032038
L80032074:
  addiu $v1, $v1, 16
L80032078:
  addiu $a2, $a2, 1
L8003207c:
  slti $v0, $a2, 723
L80032080:
  bne $v0, $zero, L80032028
L80032084:
  addiu $t0, $t0, 1
L80032088:
  addiu $v1, $a0, 11600
L8003208c:
  addu $a1, $zero, $zero
L80032090:
  addu $a2, $a1, $zero
L80032094:
  lbu $v0, 13($v1)
L80032098:
  sll $zero, $zero, 0x0
L8003209c:
  beq $v0, $zero, L800320b4
L800320a0:
  addiu $a2, $a2, 1
L800320a4:
  addiu $a1, $a1, 1
L800320a8:
  slti $v0, $a2, 40
L800320ac:
  bne $v0, $zero, L80032094
L800320b0:
  addiu $v1, $v1, 16
L800320b4:
  jr $ra
L800320b8:
  sw $a1, 23200($a0)
L800320bc:
  addiu $sp, $sp, -24
L800320c0:
  sw $s0, 16($sp)
L800320c4:
  addu $s0, $a0, $zero
L800320c8:
  addu $a0, $zero, $zero
L800320cc:
  lui $v1, 0x801d
L800320d0:
  addiu $v1, $v1, 16964
L800320d4:
  addiu $v0, $a1, -1
L800320d8:
  sll $v0, $v0, 0x2
L800320dc:
  addu $a3, $v0, $v1
L800320e0:
  addiu $a2, $s0, 11608
L800320e4:
  sw $ra, 20($sp)
L800320e8:
  lbu $v0, 5($a2)
L800320ec:
  sll $zero, $zero, 0x0
L800320f0:
  bne $v0, $zero, L80032164
L800320f4:
  addiu $v0, $zero, 1
L800320f8:
  sb $v0, 5($a2)
L800320fc:
  sh $a1, -4($a2)
L80032100:
  lw $v0, 0($a3)
L80032104:
  sll $zero, $zero, 0x0
L80032108:
  sra $v0, $v0, 0x1a
L8003210c:
  andi $v0, $v0, 0x1f
L80032110:
  sb $v0, 2($a2)
L80032114:
  lw $v1, 0($a3)
L80032118:
  sll $zero, $zero, 0x0
L8003211c:
  andi $v1, $v1, 0x1ff
L80032120:
  sll $v0, $v1, 0x2
L80032124:
  addu $v0, $v0, $v1
L80032128:
  sll $v0, $v0, 0x1
L8003212c:
  sh $v0, -2($a2)
L80032130:
  lw $v1, 0($a3)
L80032134:
  addiu $a0, $s0, 11600
L80032138:
  sra $v1, $v1, 0x9
L8003213c:
  andi $v1, $v1, 0x1ff
L80032140:
  sll $v0, $v1, 0x2
L80032144:
  addu $v0, $v0, $v1
L80032148:
  sll $v0, $v0, 0x1
L8003214c:
  jal L80032c48
L80032150:
  sh $v0, 0($a2)
L80032154:
  jal L8003201c
L80032158:
  addu $a0, $s0, $zero
L8003215c:
  j L80032174
L80032160:
  sll $zero, $zero, 0x0
L80032164:
  addiu $a0, $a0, 1
L80032168:
  slti $v0, $a0, 40
L8003216c:
  bne $v0, $zero, L800320e8
L80032170:
  addiu $a2, $a2, 16
L80032174:
  lw $ra, 20($sp)
L80032178:
  lw $s0, 16($sp)
L8003217c:
  jr $ra
L80032180:
  addiu $sp, $sp, 24
L80032184:
  addiu $sp, $sp, -24
L80032188:
  sw $ra, 16($sp)
L8003218c:
  addiu $a3, $zero, 1
L80032190:
  beq $a1, $a3, L80032238
L80032194:
  addu $a2, $a0, $zero
L80032198:
  slti $v0, $a1, 2
L8003219c:
  beq $v0, $zero, L800321b4
L800321a0:
  sll $zero, $zero, 0x0
L800321a4:
  beq $a1, $zero, L800321d0
L800321a8:
  lui $a0, 0xffdd
L800321ac:
  j L80032318
L800321b0:
  sll $zero, $zero, 0x0
L800321b4:
  addiu $v0, $zero, 2
L800321b8:
  beq $a1, $v0, L800322b0
L800321bc:
  addiu $v0, $zero, 3
L800321c0:
  beq $a1, $v0, L800322ec
L800321c4:
  lui $a0, 0x800f
L800321c8:
  j L80032318
L800321cc:
  sll $zero, $zero, 0x0
L800321d0:
  ori $a0, $a0, 0xffff
L800321d4:
  addiu $v0, $zero, 768
L800321d8:
  sh $v0, 48($a2)
L800321dc:
  addiu $v0, $zero, 256
L800321e0:
  sh $v0, 50($a2)
L800321e4:
  addiu $v0, $zero, 64
L800321e8:
  sh $v0, 4($a2)
L800321ec:
  lui $v0, 0x800a
L800321f0:
  lw $v0, -20236($v0)
L800321f4:
  addiu $v1, $zero, 16
L800321f8:
  sh $v1, 6($a2)
L800321fc:
  and $v0, $v0, $a0
L80032200:
  lui $at, 0x800a
L80032204:
  sw $v0, -20236($at)
L80032208:
  lui $v0, 0x800a
L8003220c:
  lw $v0, -20236($v0)
L80032210:
  lui $v1, 0x1
L80032214:
  or $v0, $v0, $v1
L80032218:
  lui $at, 0x800a
L8003221c:
  sw $v0, -20236($at)
L80032220:
  addiu $v0, $zero, 2
L80032224:
  sb $v0, 70($a2)
L80032228:
  lui $v0, 0x800a
L8003222c:
  lw $v0, -20200($v0)
L80032230:
  j L8003229c
L80032234:
  lui $v1, 0x2
L80032238:
  lui $a0, 0xffdd
L8003223c:
  ori $a0, $a0, 0xffff
L80032240:
  addiu $v0, $zero, 832
L80032244:
  sh $v0, 48($a2)
L80032248:
  addiu $v0, $zero, 64
L8003224c:
  sh $v0, 4($a2)
L80032250:
  lui $v0, 0x800a
L80032254:
  lw $v0, -20236($v0)
L80032258:
  addiu $v1, $zero, 16
L8003225c:
  sh $v1, 6($a2)
L80032260:
  and $v0, $v0, $a0
L80032264:
  lui $at, 0x800a
L80032268:
  sw $v0, -20236($at)
L8003226c:
  lui $v0, 0x800a
L80032270:
  lw $v0, -20236($v0)
L80032274:
  lui $v1, 0x1
L80032278:
  sh $zero, 50($a2)
L8003227c:
  or $v0, $v0, $v1
L80032280:
  lui $at, 0x800a
L80032284:
  sw $v0, -20236($at)
L80032288:
  addiu $v0, $zero, 2
L8003228c:
  sb $v0, 70($a2)
L80032290:
  lui $v0, 0x800a
L80032294:
  lw $v0, -20200($v0)
L80032298:
  addiu $v1, $zero, 16384
L8003229c:
  sw $v1, 28($a2)
L800322a0:
  sw $v0, 8($a2)
L800322a4:
  addiu $v0, $v0, 2048
L800322a8:
  j L80032318
L800322ac:
  sw $v0, 12($a2)
L800322b0:
  lui $a0, 0xffdc
L800322b4:
  ori $a0, $a0, 0xffff
L800322b8:
  addiu $v0, $zero, 8192
L800322bc:
  sw $v0, 28($a2)
L800322c0:
  lui $v0, 0x800a
L800322c4:
  lw $v0, -20236($v0)
L800322c8:
  lui $v1, 0x800a
L800322cc:
  lw $v1, -20200($v1)
L800322d0:
  and $v0, $v0, $a0
L800322d4:
  lui $at, 0x800a
L800322d8:
  sw $v0, -20236($at)
L800322dc:
  sw $v1, 12($a2)
L800322e0:
  sw $v1, 8($a2)
L800322e4:
  j L80032318
L800322e8:
  sb $a3, 70($a2)
L800322ec:
  addiu $v1, $zero, 256
L800322f0:
  sh $v1, -25232($a0)
L800322f4:
  addiu $a0, $a0, -25232
L800322f8:
  lui $a1, 0x800a
L800322fc:
  lw $a1, -20200($a1)
L80032300:
  addiu $v0, $zero, 240
L80032304:
  sh $v0, 2($a0)
L80032308:
  addiu $v0, $zero, 16
L8003230c:
  sh $v1, 4($a0)
L80032310:
  jal 0x80081de8
L80032314:
  sh $v0, 6($a0)
L80032318:
  lw $ra, 16($sp)
L8003231c:
  sll $zero, $zero, 0x0
L80032320:
  jr $ra
L80032324:
  addiu $sp, $sp, 24
L80032328:
  addiu $sp, $sp, -40
L8003232c:
  lui $v0, 0x8003
L80032330:
  addiu $v0, $v0, 8580
L80032334:
  addu $a0, $zero, $zero
L80032338:
  addu $a1, $a0, $zero
L8003233c:
  addiu $a2, $zero, 8585
L80032340:
  addiu $a3, $zero, 76
L80032344:
  sw $ra, 32($sp)
L80032348:
  sw $v0, 16($sp)
L8003234c:
  sw $zero, 20($sp)
L80032350:
  jal 0x80014e1c
L80032354:
  sw $zero, 24($sp)
L80032358:
  jal 0x800137e4
L8003235c:
  sll $zero, $zero, 0x0
L80032360:
  lw $ra, 32($sp)
L80032364:
  sll $zero, $zero, 0x0
L80032368:
  jr $ra
L8003236c:
  addiu $sp, $sp, 40
L80032370:
  lui $v0, 0x801d
L80032374:
  addiu $a2, $v0, 1980
L80032378:
  addiu $a0, $a2, -1388
L8003237c:
  addiu $a1, $zero, 15
L80032380:
  addiu $v1, $a2, 30
L80032384:
  lh $v0, 0($v1)
L80032388:
  sll $zero, $zero, 0x0
L8003238c:
  beq $v0, $zero, L800323a8
L80032390:
  addu $v0, $v0, $a0
L80032394:
  lbu $v0, -1($v0)
L80032398:
  sll $zero, $zero, 0x0
L8003239c:
  bne $v0, $zero, L800323a8
L800323a0:
  sll $zero, $zero, 0x0
L800323a4:
  sh $zero, 0($v1)
L800323a8:
  addiu $a1, $a1, -1
L800323ac:
  bgez $a1, L80032384
L800323b0:
  addiu $v1, $v1, -2
L800323b4:
  addu $a0, $a2, $zero
L800323b8:
  addu $a1, $zero, $zero
L800323bc:
  lh $v0, 0($a2)
L800323c0:
  lhu $v1, 0($a2)
L800323c4:
  beq $v0, $zero, L800323e0
L800323c8:
  sll $zero, $zero, 0x0
L800323cc:
  beq $a2, $a0, L800323dc
L800323d0:
  sll $zero, $zero, 0x0
L800323d4:
  sh $v1, 0($a0)
L800323d8:
  sh $zero, 0($a2)
L800323dc:
  addiu $a0, $a0, 2
L800323e0:
  addiu $a1, $a1, 1
L800323e4:
  slti $v0, $a1, 16
L800323e8:
  bne $v0, $zero, L800323bc
L800323ec:
  addiu $a2, $a2, 2
L800323f0:
  jr $ra
L800323f4:
  sll $zero, $zero, 0x0
L800323f8:
  addiu $sp, $sp, -72
L800323fc:
  sw $s0, 32($sp)
L80032400:
  addu $s0, $a0, $zero
L80032404:
  sw $s2, 40($sp)
L80032408:
  addu $s2, $a1, $zero
L8003240c:
  sw $s3, 44($sp)
L80032410:
  addu $s3, $a2, $zero
L80032414:
  sw $s1, 36($sp)
L80032418:
  addu $s1, $a3, $zero
L8003241c:
  sw $ra, 68($sp)
L80032420:
  sw $fp, 64($sp)
L80032424:
  sw $s7, 60($sp)
L80032428:
  sw $s6, 56($sp)
L8003242c:
  sw $s5, 52($sp)
L80032430:
  jal L80032328
L80032434:
  sw $s4, 48($sp)
L80032438:
  jal L8003ff08
L8003243c:
  addiu $a0, $zero, 28896
L80032440:
  lui $at, 0x800a
L80032444:
  sh $zero, -20152($at)
L80032448:
  lui $at, 0x800a
L8003244c:
  sh $zero, -20154($at)
L80032450:
  jal L80032370
L80032454:
  addu $s6, $s0, $zero
L80032458:
  addu $s4, $zero, $zero
L8003245c:
  addiu $s5, $zero, 1
L80032460:
  lui $v0, 0x8009
L80032464:
  addiu $fp, $v0, 3544
L80032468:
  lui $v0, 0x801d
L8003246c:
  addiu $s7, $v0, 16964
L80032470:
  addiu $s0, $s6, 4
L80032474:
  ori $v0, $zero, 0x8000
L80032478:
  addu $v0, $s6, $v0
L8003247c:
  sw $s6, 1012($gp)
L80032480:
  sb $s1, 25411($s6)
L80032484:
  sw $s2, 0($s6)
L80032488:
  sw $s3, 25412($s6)
L8003248c:
  sb $zero, 25410($s6)
L80032490:
  sb $zero, 18054($v0)
L80032494:
  lw $v0, 0($s6)
L80032498:
  sll $zero, $zero, 0x0
L8003249c:
  beq $v0, $zero, L80032710
L800324a0:
  lui $v0, 0x801d
L800324a4:
  addiu $a2, $v0, 1980
L800324a8:
  sb $zero, 24678($s0)
L800324ac:
  addiu $t0, $zero, 1
L800324b0:
  addu $a0, $s6, $t0
L800324b4:
  sb $zero, 24682($a0)
L800324b8:
  addiu $t1, $zero, 15
L800324bc:
  addu $a1, $a0, $zero
L800324c0:
  addiu $v1, $a2, 30
L800324c4:
  lh $v0, 0($v1)
L800324c8:
  sll $zero, $zero, 0x0
L800324cc:
  bne $v0, $t0, L800324d8
L800324d0:
  addiu $v0, $t1, 1
L800324d4:
  sb $v0, 24682($a1)
L800324d8:
  addiu $t1, $t1, -1
L800324dc:
  bgez $t1, L800324c4
L800324e0:
  addiu $v1, $v1, -2
L800324e4:
  addiu $t0, $t0, 1
L800324e8:
  slti $v0, $t0, 723
L800324ec:
  bne $v0, $zero, L800324b4
L800324f0:
  addiu $a0, $a0, 1
L800324f4:
  addiu $t1, $s6, 11600
L800324f8:
  addu $a3, $zero, $zero
L800324fc:
  sb $s5, 23187($s0)
L80032500:
  andi $v0, $s5, 0xff
L80032504:
  addu $t0, $a3, $zero
L80032508:
  sll $v0, $v0, 0x4
L8003250c:
  addu $v0, $v0, $fp
L80032510:
  sh $zero, 23178($s0)
L80032514:
  sh $zero, 23176($s0)
L80032518:
  sb $zero, 23188($s0)
L8003251c:
  sb $zero, 23186($s0)
L80032520:
  lbu $v0, 1($v0)
L80032524:
  addiu $a1, $s6, 11608
L80032528:
  andi $v0, $v0, 0xf
L8003252c:
  sb $v0, 23185($s0)
L80032530:
  lw $a2, 0($s6)
L80032534:
  sb $zero, 5($a1)
L80032538:
  sh $zero, -4($a1)
L8003253c:
  lhu $a0, 0($a2)
L80032540:
  sll $zero, $zero, 0x0
L80032544:
  beq $a0, $zero, L800325b0
L80032548:
  sll $zero, $zero, 0x0
L8003254c:
  sh $a0, -4($a1)
L80032550:
  addiu $a0, $a0, -1
L80032554:
  sll $a0, $a0, 0x2
L80032558:
  addu $a0, $a0, $s7
L8003255c:
  sb $s5, 5($a1)
L80032560:
  lw $v0, 0($a0)
L80032564:
  sll $zero, $zero, 0x0
L80032568:
  sra $v0, $v0, 0x1a
L8003256c:
  andi $v0, $v0, 0x1f
L80032570:
  sb $v0, 2($a1)
L80032574:
  lw $v1, 0($a0)
L80032578:
  sll $zero, $zero, 0x0
L8003257c:
  andi $v1, $v1, 0x1ff
L80032580:
  sll $v0, $v1, 0x2
L80032584:
  addu $v0, $v0, $v1
L80032588:
  sll $v0, $v0, 0x1
L8003258c:
  sh $v0, -2($a1)
L80032590:
  lw $v1, 0($a0)
L80032594:
  addiu $a3, $a3, 1
L80032598:
  sra $v1, $v1, 0x9
L8003259c:
  andi $v1, $v1, 0x1ff
L800325a0:
  sll $v0, $v1, 0x2
L800325a4:
  addu $v0, $v0, $v1
L800325a8:
  sll $v0, $v0, 0x1
L800325ac:
  sh $v0, 0($a1)
L800325b0:
  addiu $t0, $t0, 1
L800325b4:
  addiu $a1, $a1, 16
L800325b8:
  slti $v0, $t0, 40
L800325bc:
  bne $v0, $zero, L80032534
L800325c0:
  addiu $a2, $a2, 2
L800325c4:
  addiu $a0, $s6, 11600
L800325c8:
  addiu $v0, $zero, -1
L800325cc:
  sh $v0, 644($t1)
L800325d0:
  addiu $v0, $zero, 40
L800325d4:
  sw $a3, 23196($s0)
L800325d8:
  sh $v0, 23180($s0)
L800325dc:
  jal L80032c48
L800325e0:
  sh $v0, 23182($s0)
L800325e4:
  jal L8003201c
L800325e8:
  addu $a0, $s6, $zero
L800325ec:
  addu $t2, $s0, $zero
L800325f0:
  addu $t1, $zero, $zero
L800325f4:
  addu $t0, $t1, $zero
L800325f8:
  addiu $t3, $zero, 128
L800325fc:
  sb $zero, 11591($s0)
L80032600:
  lbu $v1, 11591($s0)
L80032604:
  addiu $v0, $zero, 722
L80032608:
  sh $zero, 11582($s0)
L8003260c:
  sh $zero, 11580($s0)
L80032610:
  sh $v0, 11584($s0)
L80032614:
  sb $zero, 11592($s0)
L80032618:
  sb $zero, 11590($s0)
L8003261c:
  sll $v1, $v1, 0x4
L80032620:
  addu $v1, $v1, $fp
L80032624:
  lbu $v0, 1($v1)
L80032628:
  addiu $a1, $s0, 13
L8003262c:
  andi $v0, $v0, 0xf
L80032630:
  sb $v0, 11589($s0)
L80032634:
  lw $v0, 0($s6)
L80032638:
  addu $a3, $s7, $zero
L8003263c:
  addiu $a2, $v0, 80
L80032640:
  addiu $a0, $t0, 1
L80032644:
  sb $zero, 0($a1)
L80032648:
  sh $a0, -9($a1)
L8003264c:
  lw $v0, 0($a3)
L80032650:
  sll $zero, $zero, 0x0
L80032654:
  sra $v0, $v0, 0x1a
L80032658:
  andi $v0, $v0, 0x1f
L8003265c:
  sb $v0, -3($a1)
L80032660:
  lw $v1, 0($a3)
L80032664:
  sll $zero, $zero, 0x0
L80032668:
  andi $v1, $v1, 0x1ff
L8003266c:
  sll $v0, $v1, 0x2
L80032670:
  addu $v0, $v0, $v1
L80032674:
  sll $v0, $v0, 0x1
L80032678:
  sh $v0, -7($a1)
L8003267c:
  lw $v1, 0($a3)
L80032680:
  sll $zero, $zero, 0x0
L80032684:
  sra $v1, $v1, 0x9
L80032688:
  andi $v1, $v1, 0x1ff
L8003268c:
  sll $v0, $v1, 0x2
L80032690:
  addu $v0, $v0, $v1
L80032694:
  sll $v0, $v0, 0x1
L80032698:
  sh $v0, -5($a1)
L8003269c:
  lbu $v0, 0($a2)
L800326a0:
  addu $a0, $s6, $a0
L800326a4:
  sb $v0, 23959($a0)
L800326a8:
  lbu $v0, 0($a2)
L800326ac:
  sll $zero, $zero, 0x0
L800326b0:
  beq $v0, $zero, L800326c8
L800326b4:
  sll $zero, $zero, 0x0
L800326b8:
  sb $s5, 0($a1)
L800326bc:
  lbu $v0, 0($a2)
L800326c0:
  j L800326dc
L800326c4:
  addu $t1, $t1, $v0
L800326c8:
  lbu $v0, 23236($a0)
L800326cc:
  sll $zero, $zero, 0x0
L800326d0:
  beq $v0, $zero, L800326dc
L800326d4:
  sll $zero, $zero, 0x0
L800326d8:
  sb $t3, 0($a1)
L800326dc:
  addiu $a3, $a3, 4
L800326e0:
  addiu $t0, $t0, 1
L800326e4:
  addiu $a1, $a1, 16
L800326e8:
  slti $v0, $t0, 722
L800326ec:
  bne $v0, $zero, L80032640
L800326f0:
  addiu $a2, $a2, 1
L800326f4:
  addu $a0, $s0, $zero
L800326f8:
  addiu $v0, $zero, 722
L800326fc:
  sh $zero, 11556($t2)
L80032700:
  sw $t1, 23192($s0)
L80032704:
  sh $v0, 11586($s0)
L80032708:
  jal L80032c48
L8003270c:
  sh $v0, 11584($s0)
L80032710:
  addiu $s4, $s4, 1
L80032714:
  addiu $s0, $s0, 25412
L80032718:
  slti $v0, $s4, 2
L8003271c:
  bne $v0, $zero, L80032494
L80032720:
  addiu $s6, $s6, 25412
L80032724:
  lw $s6, 1012($gp)
L80032728:
  jal 0x8004002c
L8003272c:
  addiu $s3, $zero, 4
L80032730:
  addu $a0, $v0, $zero
L80032734:
  jal 0x800400ac
L80032738:
  addiu $a1, $zero, 2
L8003273c:
  addu $s5, $v0, $zero
L80032740:
  addu $a0, $s5, $zero
L80032744:
  addu $a1, $zero, $zero
L80032748:
  addu $a2, $a1, $zero
L8003274c:
  addu $a3, $a1, $zero
L80032750:
  addiu $s2, $zero, 12
L80032754:
  addiu $s4, $zero, 520
L80032758:
  sw $s3, 16($sp)
L8003275c:
  sw $zero, 20($sp)
L80032760:
  sw $s2, 24($sp)
L80032764:
  jal 0x800404cc
L80032768:
  sw $s4, 28($sp)
L8003276c:
  jal 0x8004002c
L80032770:
  lui $s0, 0x8003
L80032774:
  addu $a0, $v0, $zero
L80032778:
  jal 0x800400ac
L8003277c:
  addiu $a1, $zero, 6
L80032780:
  addu $v1, $v0, $zero
L80032784:
  sb $zero, 103($v1)
L80032788:
  lw $v0, 48($s5)
L8003278c:
  addiu $s0, $s0, 6260
L80032790:
  sw $s0, 76($v1)
L80032794:
  jal 0x8004002c
L80032798:
  sw $v0, 48($v1)
L8003279c:
  addu $a0, $v0, $zero
L800327a0:
  jal 0x800400ac
L800327a4:
  addiu $a1, $zero, 2
L800327a8:
  addu $s5, $v0, $zero
L800327ac:
  addu $a0, $s5, $zero
L800327b0:
  addiu $a1, $zero, 320
L800327b4:
  addu $a2, $zero, $zero
L800327b8:
  addu $a3, $a2, $zero
L800327bc:
  addiu $s1, $zero, 1
L800327c0:
  sw $s3, 16($sp)
L800327c4:
  sw $s1, 20($sp)
L800327c8:
  sw $s2, 24($sp)
L800327cc:
  jal 0x800404cc
L800327d0:
  sw $s4, 28($sp)
L800327d4:
  jal 0x8004002c
L800327d8:
  sll $zero, $zero, 0x0
L800327dc:
  addu $a0, $v0, $zero
L800327e0:
  jal 0x800400ac
L800327e4:
  addiu $a1, $zero, 6
L800327e8:
  addu $v1, $v0, $zero
L800327ec:
  sb $s1, 103($v1)
L800327f0:
  lw $v0, 48($s5)
L800327f4:
  sw $s0, 76($v1)
L800327f8:
  sw $v0, 48($v1)
L800327fc:
  addiu $v0, $zero, 2
L80032800:
  jal 0x8004002c
L80032804:
  sh $v0, 25406($s6)
L80032808:
  addu $a0, $v0, $zero
L8003280c:
  jal 0x800400ac
L80032810:
  addiu $a1, $zero, 2
L80032814:
  addu $s5, $v0, $zero
L80032818:
  addu $a0, $s5, $zero
L8003281c:
  addiu $a1, $zero, 310
L80032820:
  addiu $a2, $zero, 41
L80032824:
  addu $a3, $zero, $zero
L80032828:
  sw $s3, 16($sp)
L8003282c:
  sw $s2, 20($sp)
L80032830:
  sw $s2, 24($sp)
L80032834:
  jal 0x800404cc
L80032838:
  sw $s4, 28($sp)
L8003283c:
  addu $a0, $s5, $zero
L80032840:
  lhu $v0, 8($s5)
L80032844:
  addiu $a1, $zero, 8
L80032848:
  ori $v0, $v0, 0x20
L8003284c:
  jal 0x800428ec
L80032850:
  sh $v0, 8($s5)
L80032854:
  jal 0x8004002c
L80032858:
  sw $s5, 11580($s6)
L8003285c:
  addu $a0, $v0, $zero
L80032860:
  jal 0x800400ac
L80032864:
  addiu $a1, $zero, 2
L80032868:
  addu $s5, $v0, $zero
L8003286c:
  addu $a0, $s5, $zero
L80032870:
  addiu $a1, $zero, 618
L80032874:
  addiu $a2, $zero, 41
L80032878:
  addu $a3, $zero, $zero
L8003287c:
  sw $s3, 16($sp)
L80032880:
  sw $s2, 20($sp)
L80032884:
  sw $s2, 24($sp)
L80032888:
  jal 0x800404cc
L8003288c:
  sw $s4, 28($sp)
L80032890:
  addu $a0, $s5, $zero
L80032894:
  lhu $v0, 8($s5)
L80032898:
  addiu $a1, $zero, 8
L8003289c:
  ori $v0, $v0, 0x20
L800328a0:
  jal 0x800428ec
L800328a4:
  sh $v0, 8($s5)
L800328a8:
  jal 0x8004002c
L800328ac:
  sw $s5, 23176($s6)
L800328b0:
  addu $a0, $v0, $zero
L800328b4:
  jal 0x800400ac
L800328b8:
  addiu $a1, $zero, 2
L800328bc:
  addu $s5, $v0, $zero
L800328c0:
  addu $a0, $s5, $zero
L800328c4:
  addu $a1, $zero, $zero
L800328c8:
  addiu $a2, $zero, 42
L800328cc:
  addu $a3, $a1, $zero
L800328d0:
  addiu $v0, $zero, 2
L800328d4:
  sw $s3, 16($sp)
L800328d8:
  sw $v0, 20($sp)
L800328dc:
  sw $s2, 24($sp)
L800328e0:
  jal 0x800404cc
L800328e4:
  sw $s4, 28($sp)
L800328e8:
  addu $a0, $s5, $zero
L800328ec:
  lhu $v0, 8($s5)
L800328f0:
  addiu $a1, $zero, 10
L800328f4:
  ori $v0, $v0, 0x20
L800328f8:
  jal 0x800428ec
L800328fc:
  sh $v0, 8($s5)
L80032900:
  jal 0x8004002c
L80032904:
  sw $s5, 11576($s6)
L80032908:
  addu $a0, $v0, $zero
L8003290c:
  jal 0x800400ac
L80032910:
  addiu $a1, $zero, 2
L80032914:
  addu $s5, $v0, $zero
L80032918:
  addu $a0, $s5, $zero
L8003291c:
  addiu $a1, $zero, 328
L80032920:
  addiu $a2, $zero, 42
L80032924:
  addu $a3, $zero, $zero
L80032928:
  addiu $s1, $zero, 3
L8003292c:
  addiu $v0, $zero, 536
L80032930:
  sw $s3, 16($sp)
L80032934:
  sw $s1, 20($sp)
L80032938:
  sw $s2, 24($sp)
L8003293c:
  jal 0x800404cc
L80032940:
  sw $v0, 28($sp)
L80032944:
  addu $a0, $s5, $zero
L80032948:
  lhu $v0, 8($s5)
L8003294c:
  addiu $a1, $zero, 10
L80032950:
  ori $v0, $v0, 0x20
L80032954:
  jal 0x800428ec
L80032958:
  sh $v0, 8($s5)
L8003295c:
  jal 0x8004002c
L80032960:
  sw $s5, 23172($s6)
L80032964:
  addu $a0, $v0, $zero
L80032968:
  jal 0x800400ac
L8003296c:
  addiu $a1, $zero, 2
L80032970:
  addu $s5, $v0, $zero
L80032974:
  addu $a0, $s5, $zero
L80032978:
  addu $a1, $zero, $zero
L8003297c:
  addu $a2, $a1, $zero
L80032980:
  addu $a3, $a1, $zero
L80032984:
  addiu $v0, $zero, 9
L80032988:
  sw $s3, 16($sp)
L8003298c:
  sw $v0, 20($sp)
L80032990:
  sw $s2, 24($sp)
L80032994:
  jal 0x800404cc
L80032998:
  sw $s4, 28($sp)
L8003299c:
  addu $a0, $s5, $zero
L800329a0:
  lhu $v0, 8($a0)
L800329a4:
  addiu $a1, $zero, 10
L800329a8:
  ori $v0, $v0, 0x20
L800329ac:
  jal 0x800428ec
L800329b0:
  sh $v0, 8($a0)
L800329b4:
  jal 0x8004002c
L800329b8:
  addiu $s0, $zero, 11
L800329bc:
  addu $a0, $v0, $zero
L800329c0:
  jal 0x800400ac
L800329c4:
  addiu $a1, $zero, 2
L800329c8:
  addu $s5, $v0, $zero
L800329cc:
  addu $a0, $s5, $zero
L800329d0:
  addiu $a1, $zero, 320
L800329d4:
  addu $a2, $zero, $zero
L800329d8:
  addu $a3, $a2, $zero
L800329dc:
  addiu $v0, $zero, 10
L800329e0:
  sw $s3, 16($sp)
L800329e4:
  sw $v0, 20($sp)
L800329e8:
  sw $s2, 24($sp)
L800329ec:
  jal 0x800404cc
L800329f0:
  sw $s4, 28($sp)
L800329f4:
  addu $a0, $s5, $zero
L800329f8:
  lhu $v0, 8($a0)
L800329fc:
  addiu $a1, $zero, 10
L80032a00:
  ori $v0, $v0, 0x20
L80032a04:
  jal 0x800428ec
L80032a08:
  sh $v0, 8($a0)
L80032a0c:
  jal 0x8004002c
L80032a10:
  sll $zero, $zero, 0x0
L80032a14:
  addu $a0, $v0, $zero
L80032a18:
  jal 0x800400ac
L80032a1c:
  addiu $a1, $zero, 2
L80032a20:
  addu $s5, $v0, $zero
L80032a24:
  addu $a0, $s5, $zero
L80032a28:
  addu $a1, $zero, $zero
L80032a2c:
  addu $a2, $a1, $zero
L80032a30:
  addu $a3, $a1, $zero
L80032a34:
  sw $s3, 16($sp)
L80032a38:
  sw $s0, 20($sp)
L80032a3c:
  sw $s2, 24($sp)
L80032a40:
  jal 0x800404cc
L80032a44:
  sw $s4, 28($sp)
L80032a48:
  addu $a0, $s5, $zero
L80032a4c:
  lhu $v0, 8($a0)
L80032a50:
  addiu $a1, $zero, -4
L80032a54:
  ori $v0, $v0, 0x20
L80032a58:
  jal 0x800428ec
L80032a5c:
  sh $v0, 8($a0)
L80032a60:
  jal 0x8004002c
L80032a64:
  sll $zero, $zero, 0x0
L80032a68:
  addu $a0, $v0, $zero
L80032a6c:
  jal 0x800400ac
L80032a70:
  addiu $a1, $zero, 2
L80032a74:
  addu $s5, $v0, $zero
L80032a78:
  addu $a0, $s5, $zero
L80032a7c:
  addiu $a1, $zero, 320
L80032a80:
  addu $a2, $zero, $zero
L80032a84:
  addu $a3, $a2, $zero
L80032a88:
  sw $s3, 16($sp)
L80032a8c:
  sw $s0, 20($sp)
L80032a90:
  sw $s2, 24($sp)
L80032a94:
  jal 0x800404cc
L80032a98:
  sw $s4, 28($sp)
L80032a9c:
  addu $a0, $s5, $zero
L80032aa0:
  lhu $v0, 8($a0)
L80032aa4:
  addiu $a1, $zero, -4
L80032aa8:
  ori $v0, $v0, 0x20
L80032aac:
  jal 0x800428ec
L80032ab0:
  sh $v0, 8($a0)
L80032ab4:
  jal 0x8004002c
L80032ab8:
  sll $zero, $zero, 0x0
L80032abc:
  addu $a0, $v0, $zero
L80032ac0:
  jal 0x800400ac
L80032ac4:
  addiu $a1, $zero, 2
L80032ac8:
  addu $s5, $v0, $zero
L80032acc:
  addu $a0, $s5, $zero
L80032ad0:
  addiu $a1, $zero, 320
L80032ad4:
  addu $a2, $zero, $zero
L80032ad8:
  addu $a3, $s1, $zero
L80032adc:
  addiu $v0, $zero, 760
L80032ae0:
  sw $zero, 16($sp)
L80032ae4:
  sw $s1, 20($sp)
L80032ae8:
  sw $s0, 24($sp)
L80032aec:
  jal 0x800404cc
L80032af0:
  sw $v0, 28($sp)
L80032af4:
  addu $a0, $s5, $zero
L80032af8:
  jal 0x800428ec
L80032afc:
  addiu $a1, $zero, -4
L80032b00:
  jal L80031e5c
L80032b04:
  addu $a0, $s6, $zero
L80032b08:
  lw $ra, 68($sp)
L80032b0c:
  lw $fp, 64($sp)
L80032b10:
  lw $s7, 60($sp)
L80032b14:
  lw $s6, 56($sp)
L80032b18:
  lw $s5, 52($sp)
L80032b1c:
  lw $s4, 48($sp)
L80032b20:
  lw $s3, 44($sp)
L80032b24:
  lw $s2, 40($sp)
L80032b28:
  lw $s1, 36($sp)
L80032b2c:
  lw $s0, 32($sp)
L80032b30:
  jr $ra
L80032b34:
  addiu $sp, $sp, 72
L80032b38:
  lhu $v1, 25406($a0)
L80032b3c:
  sll $zero, $zero, 0x0
L80032b40:
  andi $v0, $v1, 0x8000
L80032b44:
  beq $v0, $zero, L80032b54
L80032b48:
  ori $v0, $v1, 0x8000
L80032b4c:
  jr $ra
L80032b50:
  addiu $v0, $zero, 1
L80032b54:
  sh $v0, 25406($a0)
L80032b58:
  jr $ra
L80032b5c:
  addu $v0, $zero, $zero
L80032b60:
  addu $v0, $a0, $zero
L80032b64:
  lw $v1, 0($v0)
L80032b68:
  lw $a0, 0($a1)
L80032b6c:
  sll $zero, $zero, 0x0
L80032b70:
  beq $v1, $a0, L80032b88
L80032b74:
  sltu $v1, $v1, $a0
L80032b78:
  bne $v1, $zero, L80032bcc
L80032b7c:
  addiu $v0, $zero, 1
L80032b80:
  jr $ra
L80032b84:
  addiu $v0, $zero, -1
L80032b88:
  lui $a0, 0x801d
L80032b8c:
  addiu $a0, $a0, 19854
L80032b90:
  lh $v1, 4($v0)
L80032b94:
  lh $v0, 4($a1)
L80032b98:
  addiu $v1, $v1, -1
L80032b9c:
  sll $v1, $v1, 0x1
L80032ba0:
  addu $v1, $v1, $a0
L80032ba4:
  addiu $v0, $v0, -1
L80032ba8:
  sll $v0, $v0, 0x1
L80032bac:
  addu $v0, $v0, $a0
L80032bb0:
  lh $v1, 0($v1)
L80032bb4:
  lh $a0, 0($v0)
L80032bb8:
  sll $zero, $zero, 0x0
L80032bbc:
  slt $v1, $v1, $a0
L80032bc0:
  bne $v1, $zero, L80032bcc
L80032bc4:
  addiu $v0, $zero, -1
L80032bc8:
  addiu $v0, $zero, 1
L80032bcc:
  jr $ra
L80032bd0:
  sll $zero, $zero, 0x0
L80032bd4:
  addu $v0, $a0, $zero
L80032bd8:
  lw $a0, 0($v0)
L80032bdc:
  lw $v1, 0($a1)
L80032be0:
  sll $zero, $zero, 0x0
L80032be4:
  beq $a0, $v1, L80032bfc
L80032be8:
  sltu $v1, $v1, $a0
L80032bec:
  bne $v1, $zero, L80032c40
L80032bf0:
  addiu $v0, $zero, 1
L80032bf4:
  jr $ra
L80032bf8:
  addiu $v0, $zero, -1
L80032bfc:
  lui $a0, 0x801d
L80032c00:
  addiu $a0, $a0, 19854
L80032c04:
  lh $v1, 4($v0)
L80032c08:
  lh $v0, 4($a1)
L80032c0c:
  addiu $v1, $v1, -1
L80032c10:
  sll $v1, $v1, 0x1
L80032c14:
  addu $v1, $v1, $a0
L80032c18:
  addiu $v0, $v0, -1
L80032c1c:
  sll $v0, $v0, 0x1
L80032c20:
  addu $v0, $v0, $a0
L80032c24:
  lh $v1, 0($v1)
L80032c28:
  lh $a0, 0($v0)
L80032c2c:
  sll $zero, $zero, 0x0
L80032c30:
  slt $v1, $v1, $a0
L80032c34:
  bne $v1, $zero, L80032c40
L80032c38:
  addiu $v0, $zero, -1
L80032c3c:
  addiu $v0, $zero, 1
L80032c40:
  jr $ra
L80032c44:
  sll $zero, $zero, 0x0
L80032c48:
  addiu $sp, $sp, -40
L80032c4c:
  sw $s4, 32($sp)
L80032c50:
  addu $s4, $a0, $zero
L80032c54:
  sw $s0, 16($sp)
L80032c58:
  sw $ra, 36($sp)
L80032c5c:
  sw $s3, 28($sp)
L80032c60:
  sw $s2, 24($sp)
L80032c64:
  sw $s1, 20($sp)
L80032c68:
  lbu $v0, 11589($s4)
L80032c6c:
  lh $s2, 11586($s4)
L80032c70:
  addiu $v1, $v0, -1
L80032c74:
  sltiu $v0, $v1, 9
L80032c78:
  beq $v0, $zero, L80033090
L80032c7c:
  addu $s0, $s4, $zero
L80032c80:
  lui $v0, 0x8001
L80032c84:
  addiu $v0, $v0, 660
L80032c88:
  sll $v1, $v1, 0x2
L80032c8c:
  addu $v1, $v1, $v0
L80032c90:
  lw $v0, 0($v1)
L80032c94:
  sll $zero, $zero, 0x0
L80032c98:
  jr $v0
L80032c9c:
  sll $zero, $zero, 0x0
L80032ca0:
  lbu $v0, 11591($s4)
L80032ca4:
  sll $zero, $zero, 0x0
L80032ca8:
  beq $v0, $zero, L80032cfc
L80032cac:
  sll $zero, $zero, 0x0
L80032cb0:
  blez $s2, L80033074
L80032cb4:
  addu $s1, $zero, $zero
L80032cb8:
  ori $a0, $zero, 0xffff
L80032cbc:
  addiu $v1, $s0, 4
L80032cc0:
  sw $a0, 0($s0)
L80032cc4:
  lbu $v0, 9($v1)
L80032cc8:
  sll $zero, $zero, 0x0
L80032ccc:
  beq $v0, $zero, L80032ce0
L80032cd0:
  sll $zero, $zero, 0x0
L80032cd4:
  lh $v0, 0($v1)
L80032cd8:
  sll $zero, $zero, 0x0
L80032cdc:
  sw $v0, 0($s0)
L80032ce0:
  addiu $s1, $s1, 1
L80032ce4:
  addiu $v1, $v1, 16
L80032ce8:
  slt $v0, $s1, $s2
L80032cec:
  bne $v0, $zero, L80032cc0
L80032cf0:
  addiu $s0, $s0, 16
L80032cf4:
  j L80033078
L80032cf8:
  addu $a0, $s4, $zero
L80032cfc:
  blez $s2, L80033074
L80032d00:
  addu $s1, $zero, $zero
L80032d04:
  lh $v0, 4($s0)
L80032d08:
  addiu $s1, $s1, 1
L80032d0c:
  sw $v0, 0($s0)
L80032d10:
  slt $v0, $s1, $s2
L80032d14:
  bne $v0, $zero, L80032d04
L80032d18:
  addiu $s0, $s0, 16
L80032d1c:
  j L80033078
L80032d20:
  addu $a0, $s4, $zero
L80032d24:
  blez $s2, L80033074
L80032d28:
  addu $s1, $zero, $zero
L80032d2c:
  addiu $v1, $zero, -1
L80032d30:
  lbu $v0, 13($s0)
L80032d34:
  sll $zero, $zero, 0x0
L80032d38:
  beq $v0, $zero, L80032d44
L80032d3c:
  sw $v1, 0($s0)
L80032d40:
  sw $zero, 0($s0)
L80032d44:
  addiu $s1, $s1, 1
L80032d48:
  slt $v0, $s1, $s2
L80032d4c:
  bne $v0, $zero, L80032d30
L80032d50:
  addiu $s0, $s0, 16
L80032d54:
  j L80033078
L80032d58:
  addu $a0, $s4, $zero
L80032d5c:
  blez $s2, L80032e00
L80032d60:
  addu $s1, $zero, $zero
L80032d64:
  lui $v0, 0x801d
L80032d68:
  addiu $a3, $v0, 16964
L80032d6c:
  addiu $a2, $s0, 4
L80032d70:
  sw $zero, 0($s0)
L80032d74:
  lbu $v0, 9($a2)
L80032d78:
  sll $zero, $zero, 0x0
L80032d7c:
  beq $v0, $zero, L80032dec
L80032d80:
  sll $zero, $zero, 0x0
L80032d84:
  lh $v0, 0($a2)
L80032d88:
  sll $zero, $zero, 0x0
L80032d8c:
  addiu $v0, $v0, -1
L80032d90:
  sll $v0, $v0, 0x2
L80032d94:
  addu $v0, $v0, $a3
L80032d98:
  lw $v0, 0($v0)
L80032d9c:
  sll $zero, $zero, 0x0
L80032da0:
  andi $a0, $v0, 0x1ff
L80032da4:
  sll $v1, $a0, 0x2
L80032da8:
  addu $a1, $v1, $a0
L80032dac:
  sll $a0, $a1, 0x1
L80032db0:
  sra $v0, $v0, 0x9
L80032db4:
  andi $v0, $v0, 0x1ff
L80032db8:
  sll $v1, $v0, 0x2
L80032dbc:
  addu $v1, $v1, $v0
L80032dc0:
  sll $v0, $v1, 0x1
L80032dc4:
  slt $a0, $a0, $v0
L80032dc8:
  bne $a0, $zero, L80032ddc
L80032dcc:
  sll $v0, $v1, 0x11
L80032dd0:
  sll $v0, $a1, 0x11
L80032dd4:
  j L80032de0
L80032dd8:
  sll $v1, $v1, 0x3
L80032ddc:
  sll $v1, $a1, 0x3
L80032de0:
  or $v0, $v0, $v1
L80032de4:
  ori $v0, $v0, 0x1
L80032de8:
  sw $v0, 0($s0)
L80032dec:
  addiu $a2, $a2, 16
L80032df0:
  addiu $s1, $s1, 1
L80032df4:
  slt $v0, $s1, $s2
L80032df8:
  bne $v0, $zero, L80032d70
L80032dfc:
  addiu $s0, $s0, 16
L80032e00:
  addu $a0, $s4, $zero
L80032e04:
  addu $a1, $s2, $zero
L80032e08:
  addiu $a2, $zero, 16
L80032e0c:
  lui $a3, 0x8003
L80032e10:
  j L80033088
L80032e14:
  addiu $a3, $a3, 11104
L80032e18:
  blez $s2, L80032ea0
L80032e1c:
  addu $s1, $zero, $zero
L80032e20:
  lui $v0, 0x801d
L80032e24:
  addiu $a2, $v0, 16964
L80032e28:
  addiu $a1, $s0, 4
L80032e2c:
  sw $zero, 0($s0)
L80032e30:
  lbu $v0, 9($a1)
L80032e34:
  sll $zero, $zero, 0x0
L80032e38:
  beq $v0, $zero, L80032e8c
L80032e3c:
  sll $zero, $zero, 0x0
L80032e40:
  lh $v0, 0($a1)
L80032e44:
  sll $zero, $zero, 0x0
L80032e48:
  addiu $v0, $v0, -1
L80032e4c:
  sll $v0, $v0, 0x2
L80032e50:
  addu $v0, $v0, $a2
L80032e54:
  lw $v1, 0($v0)
L80032e58:
  sll $zero, $zero, 0x0
L80032e5c:
  andi $v0, $v1, 0x1ff
L80032e60:
  sll $a0, $v0, 0x2
L80032e64:
  addu $a0, $a0, $v0
L80032e68:
  sll $a0, $a0, 0x11
L80032e6c:
  sra $v1, $v1, 0x9
L80032e70:
  andi $v1, $v1, 0x1ff
L80032e74:
  sll $v0, $v1, 0x2
L80032e78:
  addu $v0, $v0, $v1
L80032e7c:
  sll $v0, $v0, 0x3
L80032e80:
  or $a0, $a0, $v0
L80032e84:
  ori $a0, $a0, 0x1
L80032e88:
  sw $a0, 0($s0)
L80032e8c:
  addiu $a1, $a1, 16
L80032e90:
  addiu $s1, $s1, 1
L80032e94:
  slt $v0, $s1, $s2
L80032e98:
  bne $v0, $zero, L80032e2c
L80032e9c:
  addiu $s0, $s0, 16
L80032ea0:
  addu $a0, $s4, $zero
L80032ea4:
  addu $a1, $s2, $zero
L80032ea8:
  addiu $a2, $zero, 16
L80032eac:
  lui $a3, 0x8003
L80032eb0:
  j L80033088
L80032eb4:
  addiu $a3, $a3, 11104
L80032eb8:
  blez $s2, L80032f40
L80032ebc:
  addu $s1, $zero, $zero
L80032ec0:
  lui $v0, 0x801d
L80032ec4:
  addiu $a2, $v0, 16964
L80032ec8:
  addiu $a1, $s0, 4
L80032ecc:
  sw $zero, 0($s0)
L80032ed0:
  lbu $v0, 9($a1)
L80032ed4:
  sll $zero, $zero, 0x0
L80032ed8:
  beq $v0, $zero, L80032f2c
L80032edc:
  sll $zero, $zero, 0x0
L80032ee0:
  lh $v0, 0($a1)
L80032ee4:
  sll $zero, $zero, 0x0
L80032ee8:
  addiu $v0, $v0, -1
L80032eec:
  sll $v0, $v0, 0x2
L80032ef0:
  addu $v0, $v0, $a2
L80032ef4:
  lw $a0, 0($v0)
L80032ef8:
  sll $zero, $zero, 0x0
L80032efc:
  sra $v0, $a0, 0x9
L80032f00:
  andi $v0, $v0, 0x1ff
L80032f04:
  sll $v1, $v0, 0x2
L80032f08:
  addu $v1, $v1, $v0
L80032f0c:
  sll $v1, $v1, 0x11
L80032f10:
  andi $a0, $a0, 0x1ff
L80032f14:
  sll $v0, $a0, 0x2
L80032f18:
  addu $v0, $v0, $a0
L80032f1c:
  sll $v0, $v0, 0x3
L80032f20:
  or $v1, $v1, $v0
L80032f24:
  ori $v1, $v1, 0x1
L80032f28:
  sw $v1, 0($s0)
L80032f2c:
  addiu $a1, $a1, 16
L80032f30:
  addiu $s1, $s1, 1
L80032f34:
  slt $v0, $s1, $s2
L80032f38:
  bne $v0, $zero, L80032ecc
L80032f3c:
  addiu $s0, $s0, 16
L80032f40:
  addu $a0, $s4, $zero
L80032f44:
  addu $a1, $s2, $zero
L80032f48:
  addiu $a2, $zero, 16
L80032f4c:
  lui $a3, 0x8003
L80032f50:
  j L80033088
L80032f54:
  addiu $a3, $a3, 11104
L80032f58:
  blez $s2, L80033074
L80032f5c:
  addu $s1, $zero, $zero
L80032f60:
  addiu $a1, $zero, -1
L80032f64:
  lui $v0, 0x801d
L80032f68:
  addiu $a0, $v0, 16964
L80032f6c:
  addiu $v1, $s0, 4
L80032f70:
  sw $a1, 0($s0)
L80032f74:
  lbu $v0, 9($v1)
L80032f78:
  sll $zero, $zero, 0x0
L80032f7c:
  beq $v0, $zero, L80032fac
L80032f80:
  sll $zero, $zero, 0x0
L80032f84:
  lh $v0, 0($v1)
L80032f88:
  sll $zero, $zero, 0x0
L80032f8c:
  addiu $v0, $v0, -1
L80032f90:
  sll $v0, $v0, 0x2
L80032f94:
  addu $v0, $v0, $a0
L80032f98:
  lw $v0, 0($v0)
L80032f9c:
  sll $zero, $zero, 0x0
L80032fa0:
  sra $v0, $v0, 0x1a
L80032fa4:
  andi $v0, $v0, 0x1f
L80032fa8:
  sw $v0, 0($s0)
L80032fac:
  addiu $v1, $v1, 16
L80032fb0:
  addiu $s1, $s1, 1
L80032fb4:
  slt $v0, $s1, $s2
L80032fb8:
  bne $v0, $zero, L80032f70
L80032fbc:
  addiu $s0, $s0, 16
L80032fc0:
  j L80033078
L80032fc4:
  addu $a0, $s4, $zero
L80032fc8:
  blez $s2, L80033074
L80032fcc:
  addu $s1, $zero, $zero
L80032fd0:
  addiu $a3, $zero, -1
L80032fd4:
  addiu $a2, $zero, 256
L80032fd8:
  lw $a1, 1012($gp)
L80032fdc:
  addiu $a0, $s0, 4
L80032fe0:
  sw $a3, 0($s0)
L80032fe4:
  lbu $v0, 9($a0)
L80032fe8:
  sll $zero, $zero, 0x0
L80032fec:
  beq $v0, $zero, L80033018
L80032ff0:
  sll $zero, $zero, 0x0
L80032ff4:
  sw $a2, 0($s0)
L80032ff8:
  lh $v0, 0($a0)
L80032ffc:
  sll $zero, $zero, 0x0
L80033000:
  addu $v1, $a1, $v0
L80033004:
  lbu $v0, 24682($v1)
L80033008:
  sll $zero, $zero, 0x0
L8003300c:
  beq $v0, $zero, L80033018
L80033010:
  sll $zero, $zero, 0x0
L80033014:
  sw $v0, 0($s0)
L80033018:
  addiu $a0, $a0, 16
L8003301c:
  addiu $s1, $s1, 1
L80033020:
  slt $v0, $s1, $s2
L80033024:
  bne $v0, $zero, L80032fe0
L80033028:
  addiu $s0, $s0, 16
L8003302c:
  j L80033078
L80033030:
  addu $a0, $s4, $zero
L80033034:
  lh $s2, 11584($s4)
L80033038:
  sll $zero, $zero, 0x0
L8003303c:
  blez $s2, L80033074
L80033040:
  addu $s1, $zero, $zero
L80033044:
  addiu $s3, $zero, -1
L80033048:
  lbu $v0, 13($s0)
L8003304c:
  sll $zero, $zero, 0x0
L80033050:
  beq $v0, $zero, L80033064
L80033054:
  sw $s3, 0($s0)
L80033058:
  jal L800358fc
L8003305c:
  addiu $a0, $zero, 4096
L80033060:
  sw $v0, 0($s0)
L80033064:
  addiu $s1, $s1, 1
L80033068:
  slt $v0, $s1, $s2
L8003306c:
  bne $v0, $zero, L80033048
L80033070:
  addiu $s0, $s0, 16
L80033074:
  addu $a0, $s4, $zero
L80033078:
  addu $a1, $s2, $zero
L8003307c:
  addiu $a2, $zero, 16
L80033080:
  lui $a3, 0x8003
L80033084:
  addiu $a3, $a3, 11220
L80033088:
  jal 0x8008e400
L8003308c:
  sll $zero, $zero, 0x0
L80033090:
  addu $a0, $s4, $zero
L80033094:
  jal L80031e04
L80033098:
  addiu $a1, $zero, 8
L8003309c:
  lw $ra, 36($sp)
L800330a0:
  lw $s4, 32($sp)
L800330a4:
  lw $s3, 28($sp)
L800330a8:
  lw $s2, 24($sp)
L800330ac:
  lw $s1, 20($sp)
L800330b0:
  lw $s0, 16($sp)
L800330b4:
  jr $ra
L800330b8:
  addiu $sp, $sp, 40
L800330bc:
  addiu $sp, $sp, -32
L800330c0:
  sw $s1, 20($sp)
L800330c4:
  addu $s1, $a0, $zero
L800330c8:
  sw $ra, 24($sp)
L800330cc:
  sw $s0, 16($sp)
L800330d0:
  lh $v1, 11580($s1)
L800330d4:
  lb $v0, 11592($s1)
L800330d8:
  sll $zero, $zero, 0x0
L800330dc:
  or $s0, $v1, $v0
L800330e0:
  beq $s0, $zero, L80033130
L800330e4:
  addu $v1, $v1, $v0
L800330e8:
  addiu $v1, $v1, 1
L800330ec:
  sll $v0, $v1, 0x2
L800330f0:
  addu $v0, $v0, $v1
L800330f4:
  sll $v0, $v0, 0x2
L800330f8:
  subu $v0, $v0, $v1
L800330fc:
  lh $v1, 11586($s1)
L80033100:
  sll $v0, $v0, 0x3
L80033104:
  .word 0x0043001a
L80033108:
  bne $v1, $zero, L80033114
L8003310c:
  sll $zero, $zero, 0x0
L80033110:
  .word 0x0007000d
L80033114:
  addiu $at, $zero, -1
L80033118:
  bne $v1, $at, L8003312c
L8003311c:
  lui $at, 0x8000
L80033120:
  bne $v0, $at, L8003312c
L80033124:
  sll $zero, $zero, 0x0
L80033128:
  .word 0x0006000d
L8003312c:
  mflo $s0
L80033130:
  lw $v1, 11576($s1)
L80033134:
  addiu $v0, $s0, 41
L80033138:
  sh $v0, 50($v1)
L8003313c:
  lh $a0, 11580($s1)
L80033140:
  lh $v0, 11582($s1)
L80033144:
  lhu $v1, 11580($s1)
L80033148:
  beq $a0, $v0, L8003316c
L8003314c:
  slt $v0, $v0, $a0
L80033150:
  bne $v0, $zero, L8003315c
L80033154:
  addiu $v0, $v1, -1
L80033158:
  addiu $v0, $v1, 1
L8003315c:
  sh $v0, 11580($s1)
L80033160:
  addu $a0, $s1, $zero
L80033164:
  j L80033334
L80033168:
  addiu $a1, $zero, 8
L8003316c:
  lui $v0, 0x800a
L80033170:
  lhu $v0, -19548($v0)
L80033174:
  sll $zero, $zero, 0x0
L80033178:
  andi $v0, $v0, 0xc
L8003317c:
  beq $v0, $zero, L80033268
L80033180:
  addiu $a1, $zero, -1
L80033184:
  lui $v0, 0x800a
L80033188:
  lhu $v0, -19548($v0)
L8003318c:
  sll $zero, $zero, 0x0
L80033190:
  andi $v0, $v0, 0x8
L80033194:
  beq $v0, $zero, L800331e4
L80033198:
  addu $s0, $a0, $zero
L8003319c:
  lh $v0, 11584($s1)
L800331a0:
  sll $zero, $zero, 0x0
L800331a4:
  addiu $v0, $v0, -8
L800331a8:
  bne $s0, $v0, L800331c4
L800331ac:
  addiu $v0, $zero, 7
L800331b0:
  lb $v1, 11592($s1)
L800331b4:
  sll $zero, $zero, 0x0
L800331b8:
  beq $v1, $v0, L800331c4
L800331bc:
  sll $zero, $zero, 0x0
L800331c0:
  addu $a1, $v0, $zero
L800331c4:
  lh $v0, 11584($s1)
L800331c8:
  addiu $s0, $s0, 8
L800331cc:
  addiu $v1, $v0, -8
L800331d0:
  slt $v0, $v1, $s0
L800331d4:
  beq $v0, $zero, L80033204
L800331d8:
  sll $zero, $zero, 0x0
L800331dc:
  j L80033204
L800331e0:
  addu $s0, $v1, $zero
L800331e4:
  bne $s0, $zero, L80033200
L800331e8:
  sll $zero, $zero, 0x0
L800331ec:
  lb $v0, 11592($s1)
L800331f0:
  sll $zero, $zero, 0x0
L800331f4:
  beq $v0, $zero, L80033200
L800331f8:
  sll $zero, $zero, 0x0
L800331fc:
  addu $a1, $zero, $zero
L80033200:
  addiu $s0, $s0, -8
L80033204:
  bgez $s0, L80033210
L80033208:
  sll $zero, $zero, 0x0
L8003320c:
  addu $s0, $zero, $zero
L80033210:
  lh $v0, 11580($s1)
L80033214:
  sll $zero, $zero, 0x0
L80033218:
  beq $v0, $s0, L80033230
L8003321c:
  sh $s0, 11582($s1)
L80033220:
  jal L8003fee0
L80033224:
  addiu $a0, $zero, 6
L80033228:
  j L8003313c
L8003322c:
  sll $zero, $zero, 0x0
L80033230:
  bltz $a1, L8003333c
L80033234:
  addiu $a0, $zero, 6
L80033238:
  sll $v0, $a1, 0x1
L8003323c:
  addu $v0, $v0, $a1
L80033240:
  sll $v0, $v0, 0x2
L80033244:
  subu $v0, $v0, $a1
L80033248:
  sll $v0, $v0, 0x1
L8003324c:
  lw $v1, 11572($s1)
L80033250:
  addiu $v0, $v0, 42
L80033254:
  sb $a1, 11592($s1)
L80033258:
  jal L8003fee0
L8003325c:
  sh $v0, 50($v1)
L80033260:
  j L800334ec
L80033264:
  addiu $v0, $zero, 1
L80033268:
  lui $v0, 0x800a
L8003326c:
  lhu $v0, -19564($v0)
L80033270:
  sll $zero, $zero, 0x0
L80033274:
  andi $v0, $v0, 0x3
L80033278:
  beq $v0, $zero, L80033344
L8003327c:
  addiu $a1, $zero, -1
L80033280:
  lui $v0, 0x800a
L80033284:
  lhu $v0, -19564($v0)
L80033288:
  sll $zero, $zero, 0x0
L8003328c:
  andi $v0, $v0, 0x2
L80033290:
  beq $v0, $zero, L800332e0
L80033294:
  addu $s0, $a0, $zero
L80033298:
  lh $v0, 11584($s1)
L8003329c:
  sll $zero, $zero, 0x0
L800332a0:
  addiu $v0, $v0, -8
L800332a4:
  bne $s0, $v0, L800332c0
L800332a8:
  addiu $v0, $zero, 7
L800332ac:
  lb $v1, 11592($s1)
L800332b0:
  sll $zero, $zero, 0x0
L800332b4:
  beq $v1, $v0, L800332c0
L800332b8:
  sll $zero, $zero, 0x0
L800332bc:
  addu $a1, $v0, $zero
L800332c0:
  lh $v0, 11584($s1)
L800332c4:
  addiu $s0, $s0, 50
L800332c8:
  addiu $v1, $v0, -8
L800332cc:
  slt $v0, $v1, $s0
L800332d0:
  beq $v0, $zero, L8003330c
L800332d4:
  sll $zero, $zero, 0x0
L800332d8:
  j L8003330c
L800332dc:
  addu $s0, $v1, $zero
L800332e0:
  bne $s0, $zero, L800332fc
L800332e4:
  sll $zero, $zero, 0x0
L800332e8:
  lb $v0, 11592($s1)
L800332ec:
  sll $zero, $zero, 0x0
L800332f0:
  beq $v0, $zero, L800332fc
L800332f4:
  sll $zero, $zero, 0x0
L800332f8:
  addu $a1, $zero, $zero
L800332fc:
  addiu $s0, $s0, -50
L80033300:
  bgez $s0, L8003330c
L80033304:
  sll $zero, $zero, 0x0
L80033308:
  addu $s0, $zero, $zero
L8003330c:
  lh $v0, 11580($s1)
L80033310:
  sll $zero, $zero, 0x0
L80033314:
  beq $v0, $s0, L80033230
L80033318:
  sll $zero, $zero, 0x0
L8003331c:
  jal L8003fee0
L80033320:
  addiu $a0, $zero, 6
L80033324:
  addu $a0, $s1, $zero
L80033328:
  addiu $a1, $zero, 8
L8003332c:
  sh $s0, 11582($a0)
L80033330:
  sh $s0, 11580($a0)
L80033334:
  jal L80031e04
L80033338:
  sll $zero, $zero, 0x0
L8003333c:
  j L800334ec
L80033340:
  addiu $v0, $zero, 1
L80033344:
  lui $v0, 0x800a
L80033348:
  lhu $v0, -19564($v0)
L8003334c:
  sll $zero, $zero, 0x0
L80033350:
  andi $v0, $v0, 0x5000
L80033354:
  beq $v0, $zero, L80033430
L80033358:
  sll $zero, $zero, 0x0
L8003335c:
  lui $v0, 0x800a
L80033360:
  lhu $v0, -19564($v0)
L80033364:
  sll $zero, $zero, 0x0
L80033368:
  andi $v0, $v0, 0x4000
L8003336c:
  beq $v0, $zero, L800333a4
L80033370:
  addu $s0, $a0, $zero
L80033374:
  lbu $v0, 11592($s1)
L80033378:
  sll $zero, $zero, 0x0
L8003337c:
  addiu $v0, $v0, 1
L80033380:
  sb $v0, 11592($s1)
L80033384:
  sll $v0, $v0, 0x18
L80033388:
  sra $v0, $v0, 0x18
L8003338c:
  slti $v0, $v0, 8
L80033390:
  bne $v0, $zero, L800333c8
L80033394:
  addiu $v0, $zero, 7
L80033398:
  addiu $s0, $s0, 1
L8003339c:
  j L800333c8
L800333a0:
  sb $v0, 11592($s1)
L800333a4:
  lbu $v0, 11592($s1)
L800333a8:
  sll $zero, $zero, 0x0
L800333ac:
  addiu $v0, $v0, -1
L800333b0:
  sb $v0, 11592($s1)
L800333b4:
  sll $v0, $v0, 0x18
L800333b8:
  bgez $v0, L800333c8
L800333bc:
  sll $zero, $zero, 0x0
L800333c0:
  addiu $s0, $s0, -1
L800333c4:
  sb $zero, 11592($s1)
L800333c8:
  lb $v1, 11592($s1)
L800333cc:
  sll $zero, $zero, 0x0
L800333d0:
  sll $v0, $v1, 0x1
L800333d4:
  addu $v0, $v0, $v1
L800333d8:
  sll $v0, $v0, 0x2
L800333dc:
  subu $v0, $v0, $v1
L800333e0:
  sll $v0, $v0, 0x1
L800333e4:
  lw $v1, 11572($s1)
L800333e8:
  addiu $v0, $v0, 42
L800333ec:
  sh $v0, 50($v1)
L800333f0:
  lh $v0, 11584($s1)
L800333f4:
  sll $zero, $zero, 0x0
L800333f8:
  addiu $v0, $v0, -8
L800333fc:
  slt $v0, $v0, $s0
L80033400:
  bne $v0, $zero, L800334ec
L80033404:
  addiu $v0, $zero, 1
L80033408:
  bltz $s0, L800334ec
L8003340c:
  sll $zero, $zero, 0x0
L80033410:
  jal L8003fee0
L80033414:
  addiu $a0, $zero, 6
L80033418:
  lh $v0, 11580($s1)
L8003341c:
  sll $zero, $zero, 0x0
L80033420:
  bne $v0, $s0, L8003313c
L80033424:
  sh $s0, 11582($s1)
L80033428:
  j L800334ec
L8003342c:
  addiu $v0, $zero, 1
L80033430:
  lui $v0, 0x800a
L80033434:
  lhu $v0, -19564($v0)
L80033438:
  sll $zero, $zero, 0x0
L8003343c:
  andi $v0, $v0, 0x900
L80033440:
  beq $v0, $zero, L800334ec
L80033444:
  addu $v0, $zero, $zero
L80033448:
  lui $v0, 0x800a
L8003344c:
  lhu $v0, -19564($v0)
L80033450:
  sll $zero, $zero, 0x0
L80033454:
  andi $v0, $v0, 0x800
L80033458:
  beq $v0, $zero, L8003348c
L8003345c:
  sll $zero, $zero, 0x0
L80033460:
  lbu $v0, 11590($s1)
L80033464:
  sll $zero, $zero, 0x0
L80033468:
  addiu $v0, $v0, 1
L8003346c:
  sb $v0, 11590($s1)
L80033470:
  sll $v0, $v0, 0x18
L80033474:
  sra $v0, $v0, 0x18
L80033478:
  slti $v0, $v0, 7
L8003347c:
  bne $v0, $zero, L800334ac
L80033480:
  sll $zero, $zero, 0x0
L80033484:
  j L800334ac
L80033488:
  sb $zero, 11590($s1)
L8003348c:
  lbu $v0, 11590($s1)
L80033490:
  sll $zero, $zero, 0x0
L80033494:
  addiu $v0, $v0, -1
L80033498:
  sb $v0, 11590($s1)
L8003349c:
  sll $v0, $v0, 0x18
L800334a0:
  bgez $v0, L800334ac
L800334a4:
  addiu $v0, $zero, 6
L800334a8:
  sb $v0, 11590($s1)
L800334ac:
  jal L8003fee0
L800334b0:
  addiu $a0, $zero, 47
L800334b4:
  lui $v0, 0x8009
L800334b8:
  addiu $v0, $v0, 3544
L800334bc:
  lbu $a0, 11591($s1)
L800334c0:
  lb $v1, 11590($s1)
L800334c4:
  sll $a0, $a0, 0x4
L800334c8:
  sll $v1, $v1, 0x1
L800334cc:
  addu $v1, $v1, $v0
L800334d0:
  addu $a0, $a0, $v1
L800334d4:
  lbu $v0, 1($a0)
L800334d8:
  addu $a0, $s1, $zero
L800334dc:
  andi $v0, $v0, 0xf
L800334e0:
  jal L80032c48
L800334e4:
  sb $v0, 11589($a0)
L800334e8:
  addiu $v0, $zero, 1
L800334ec:
  lw $ra, 24($sp)
L800334f0:
  lw $s1, 20($sp)
L800334f4:
  lw $s0, 16($sp)
L800334f8:
  jr $ra
L800334fc:
  addiu $sp, $sp, 32
L80033500:
  lh $v0, 11580($a0)
L80033504:
  lb $v1, 11592($a0)
L80033508:
  sll $zero, $zero, 0x0
L8003350c:
  addu $v0, $v0, $v1
L80033510:
  sll $v0, $v0, 0x4
L80033514:
  addu $a0, $a0, $v0
L80033518:
  lbu $v0, 13($a0)
L8003351c:
  sll $zero, $zero, 0x0
L80033520:
  beq $v0, $zero, L80033534
L80033524:
  sll $zero, $zero, 0x0
L80033528:
  lh $v0, 4($a0)
L8003352c:
  jr $ra
L80033530:
  sll $zero, $zero, 0x0
L80033534:
  jr $ra
L80033538:
  addu $v0, $zero, $zero
L8003353c:
  addiu $sp, $sp, -40
L80033540:
  sw $s2, 32($sp)
L80033544:
  addu $s2, $a0, $zero
L80033548:
  sw $ra, 36($sp)
L8003354c:
  sw $s1, 28($sp)
L80033550:
  sw $s0, 24($sp)
L80033554:
  lbu $v0, 25410($s2)
L80033558:
  sll $zero, $zero, 0x0
L8003355c:
  sll $v1, $v0, 0x3
L80033560:
  addu $v1, $v1, $v0
L80033564:
  sll $v1, $v1, 0x4
L80033568:
  addu $v1, $v1, $v0
L8003356c:
  sll $a1, $v1, 0x2
L80033570:
  addu $v1, $v1, $a1
L80033574:
  sll $v1, $v1, 0x2
L80033578:
  subu $v1, $v1, $v0
L8003357c:
  sll $v1, $v1, 0x2
L80033580:
  addiu $v1, $v1, 4
L80033584:
  jal L80032b38
L80033588:
  addu $s1, $s2, $v1
L8003358c:
  jal L800330bc
L80033590:
  addu $a0, $s1, $zero
L80033594:
  bne $v0, $zero, L800336d8
L80033598:
  sll $zero, $zero, 0x0
L8003359c:
  lui $v0, 0x800a
L800335a0:
  lhu $v0, -19560($v0)
L800335a4:
  sll $zero, $zero, 0x0
L800335a8:
  andi $v0, $v0, 0x10
L800335ac:
  beq $v0, $zero, L800335ec
L800335b0:
  sll $zero, $zero, 0x0
L800335b4:
  jal L80033500
L800335b8:
  addu $a0, $s1, $zero
L800335bc:
  addu $s0, $v0, $zero
L800335c0:
  beq $s0, $zero, L800336d8
L800335c4:
  addiu $v0, $zero, 20
L800335c8:
  lui $at, 0x800a
L800335cc:
  sb $v0, -19893($at)
L800335d0:
  addiu $v0, $zero, 2
L800335d4:
  lui $at, 0x800a
L800335d8:
  sh $s0, -19898($at)
L800335dc:
  lui $at, 0x800a
L800335e0:
  sb $v0, -19884($at)
L800335e4:
  j L800336d8
L800335e8:
  sll $zero, $zero, 0x0
L800335ec:
  lui $v1, 0x800a
L800335f0:
  lhu $v1, -19548($v1)
L800335f4:
  ori $v0, $zero, 0x8000
L800335f8:
  bne $v1, $v0, L80033614
L800335fc:
  addiu $v0, $zero, 1
L80033600:
  sh $v0, 25406($s2)
L80033604:
  addiu $v0, $zero, 2
L80033608:
  sw $zero, 23204($s2)
L8003360c:
  j L800336d8
L80033610:
  sh $v0, 25408($s2)
L80033614:
  lui $v0, 0x800a
L80033618:
  lhu $v0, -19560($v0)
L8003361c:
  sll $zero, $zero, 0x0
L80033620:
  andi $v0, $v0, 0x20
L80033624:
  beq $v0, $zero, L8003363c
L80033628:
  addiu $v0, $zero, 4
L8003362c:
  sh $v0, 25406($s2)
L80033630:
  addiu $v0, $zero, 3
L80033634:
  j L800336d8
L80033638:
  sh $v0, 25408($s2)
L8003363c:
  lui $v0, 0x800a
L80033640:
  lhu $v0, -19564($v0)
L80033644:
  sll $zero, $zero, 0x0
L80033648:
  andi $v0, $v0, 0xc0
L8003364c:
  beq $v0, $zero, L800336d8
L80033650:
  sll $zero, $zero, 0x0
L80033654:
  jal L80033500
L80033658:
  addu $a0, $s1, $zero
L8003365c:
  addu $s0, $v0, $zero
L80033660:
  beq $s0, $zero, L800336d0
L80033664:
  sll $zero, $zero, 0x0
L80033668:
  jal L8003fee0
L8003366c:
  addiu $a0, $zero, 7
L80033670:
  lh $v0, 11580($s1)
L80033674:
  lb $v1, 11592($s1)
L80033678:
  addiu $a0, $s2, 11600
L8003367c:
  addu $v0, $v0, $v1
L80033680:
  sll $v0, $v0, 0x4
L80033684:
  addu $v0, $s1, $v0
L80033688:
  jal L80032c48
L8003368c:
  sb $zero, 13($v0)
L80033690:
  jal L8003201c
L80033694:
  addu $a0, $s2, $zero
L80033698:
  addu $a0, $s2, $zero
L8003369c:
  jal L80031ee4
L800336a0:
  addu $a1, $s0, $zero
L800336a4:
  jal L80031e5c
L800336a8:
  addu $a0, $s2, $zero
L800336ac:
  addu $a0, $s0, $zero
L800336b0:
  addiu $a1, $zero, 564
L800336b4:
  addiu $v0, $zero, 10
L800336b8:
  addiu $a2, $zero, 22
L800336bc:
  addiu $a3, $zero, 354
L800336c0:
  jal L80031574
L800336c4:
  sw $v0, 16($sp)
L800336c8:
  j L800336d8
L800336cc:
  sll $zero, $zero, 0x0
L800336d0:
  jal L8003fee0
L800336d4:
  addiu $a0, $zero, 9
L800336d8:
  lw $ra, 36($sp)
L800336dc:
  lw $s2, 32($sp)
L800336e0:
  lw $s1, 28($sp)
L800336e4:
  lw $s0, 24($sp)
L800336e8:
  jr $ra
L800336ec:
  addiu $sp, $sp, 40
L800336f0:
  addiu $sp, $sp, -40
L800336f4:
  sw $s1, 28($sp)
L800336f8:
  addu $s1, $a0, $zero
L800336fc:
  sw $ra, 32($sp)
L80033700:
  sw $s0, 24($sp)
L80033704:
  lbu $v0, 25410($s1)
L80033708:
  sll $zero, $zero, 0x0
L8003370c:
  sll $v1, $v0, 0x3
L80033710:
  addu $v1, $v1, $v0
L80033714:
  sll $v1, $v1, 0x4
L80033718:
  addu $v1, $v1, $v0
L8003371c:
  sll $a1, $v1, 0x2
L80033720:
  addu $v1, $v1, $a1
L80033724:
  sll $v1, $v1, 0x2
L80033728:
  subu $v1, $v1, $v0
L8003372c:
  sll $v1, $v1, 0x2
L80033730:
  addiu $v1, $v1, 4
L80033734:
  jal L80032b38
L80033738:
  addu $s0, $s1, $v1
L8003373c:
  jal L800330bc
L80033740:
  addu $a0, $s0, $zero
L80033744:
  bne $v0, $zero, L800338d0
L80033748:
  sll $zero, $zero, 0x0
L8003374c:
  lui $v0, 0x800a
L80033750:
  lhu $v0, -19560($v0)
L80033754:
  sll $zero, $zero, 0x0
L80033758:
  andi $v0, $v0, 0x10
L8003375c:
  beq $v0, $zero, L8003379c
L80033760:
  sll $zero, $zero, 0x0
L80033764:
  jal L80033500
L80033768:
  addu $a0, $s0, $zero
L8003376c:
  addu $s0, $v0, $zero
L80033770:
  beq $s0, $zero, L800338d0
L80033774:
  addiu $v0, $zero, 20
L80033778:
  lui $at, 0x800a
L8003377c:
  sb $v0, -19893($at)
L80033780:
  addiu $v0, $zero, 2
L80033784:
  lui $at, 0x800a
L80033788:
  sh $s0, -19898($at)
L8003378c:
  lui $at, 0x800a
L80033790:
  sb $v0, -19884($at)
L80033794:
  j L800338d0
L80033798:
  sll $zero, $zero, 0x0
L8003379c:
  lui $v1, 0x800a
L800337a0:
  lhu $v1, -19548($v1)
L800337a4:
  addiu $v0, $zero, 8192
L800337a8:
  bne $v1, $v0, L800337c8
L800337ac:
  addiu $v0, $zero, 320
L800337b0:
  sw $v0, 23204($s1)
L800337b4:
  addiu $v0, $zero, 1
L800337b8:
  sh $v0, 25406($s1)
L800337bc:
  addiu $v0, $zero, 3
L800337c0:
  j L800338d0
L800337c4:
  sh $v0, 25408($s1)
L800337c8:
  lui $v0, 0x800a
L800337cc:
  lhu $v0, -19560($v0)
L800337d0:
  sll $zero, $zero, 0x0
L800337d4:
  andi $v0, $v0, 0x20
L800337d8:
  beq $v0, $zero, L800337f0
L800337dc:
  addiu $v0, $zero, 4
L800337e0:
  sh $v0, 25406($s1)
L800337e4:
  addiu $v0, $zero, 2
L800337e8:
  j L800338d0
L800337ec:
  sh $v0, 25408($s1)
L800337f0:
  lui $v0, 0x800a
L800337f4:
  lhu $v0, -19564($v0)
L800337f8:
  sll $zero, $zero, 0x0
L800337fc:
  andi $v0, $v0, 0xc0
L80033800:
  beq $v0, $zero, L800338d0
L80033804:
  sll $zero, $zero, 0x0
L80033808:
  jal L80033500
L8003380c:
  addu $a0, $s0, $zero
L80033810:
  addu $s0, $v0, $zero
L80033814:
  addiu $v0, $s0, -17
L80033818:
  sltiu $v0, $v0, 5
L8003381c:
  beq $v0, $zero, L80033834
L80033820:
  addiu $v1, $zero, 1
L80033824:
  addu $v0, $s1, $s0
L80033828:
  lbu $v0, 23236($v0)
L8003382c:
  sll $zero, $zero, 0x0
L80033830:
  sltu $v1, $v0, $v1
L80033834:
  beq $s0, $zero, L800338c8
L80033838:
  sll $zero, $zero, 0x0
L8003383c:
  beq $v1, $zero, L800338c8
L80033840:
  sll $zero, $zero, 0x0
L80033844:
  lw $v0, 23200($s1)
L80033848:
  sll $zero, $zero, 0x0
L8003384c:
  slti $v0, $v0, 40
L80033850:
  beq $v0, $zero, L800338c8
L80033854:
  addu $v1, $s1, $s0
L80033858:
  lbu $v0, 23959($v1)
L8003385c:
  sll $zero, $zero, 0x0
L80033860:
  beq $v0, $zero, L800338c8
L80033864:
  sll $zero, $zero, 0x0
L80033868:
  lbu $v0, 23236($v1)
L8003386c:
  sll $zero, $zero, 0x0
L80033870:
  sltiu $v0, $v0, 3
L80033874:
  beq $v0, $zero, L800338c8
L80033878:
  sll $zero, $zero, 0x0
L8003387c:
  jal L8003fee0
L80033880:
  addiu $a0, $zero, 7
L80033884:
  addu $a0, $s1, $zero
L80033888:
  jal L800320bc
L8003388c:
  addu $a1, $s0, $zero
L80033890:
  addu $a0, $s1, $zero
L80033894:
  jal L80031f7c
L80033898:
  addu $a1, $s0, $zero
L8003389c:
  jal L80031e5c
L800338a0:
  addu $a0, $s1, $zero
L800338a4:
  addiu $v0, $zero, 12
L800338a8:
  sw $v0, 16($sp)
L800338ac:
  addu $a0, $s0, $zero
L800338b0:
  addiu $a1, $zero, 3
L800338b4:
  addiu $a2, $zero, 24
L800338b8:
  jal L80031574
L800338bc:
  addiu $a3, $zero, 284
L800338c0:
  j L800338d0
L800338c4:
  sll $zero, $zero, 0x0
L800338c8:
  jal L8003fee0
L800338cc:
  addiu $a0, $zero, 9
L800338d0:
  lw $ra, 32($sp)
L800338d4:
  lw $s1, 28($sp)
L800338d8:
  lw $s0, 24($sp)
L800338dc:
  jr $ra
L800338e0:
  addiu $sp, $sp, 40
L800338e4:
  addiu $sp, $sp, -24
L800338e8:
  sw $s0, 16($sp)
L800338ec:
  sw $ra, 20($sp)
L800338f0:
  jal L80032b38
L800338f4:
  addu $s0, $a0, $zero
L800338f8:
  bne $v0, $zero, L80033934
L800338fc:
  sll $zero, $zero, 0x0
L80033900:
  lui $v1, 0x800a
L80033904:
  lh $v1, -20154($v1)
L80033908:
  lw $v0, 23204($s0)
L8003390c:
  sll $zero, $zero, 0x0
L80033910:
  subu $v0, $v0, $v1
L80033914:
  bgez $v0, L80033920
L80033918:
  addiu $a0, $zero, 30
L8003391c:
  addiu $v0, $v0, 15
L80033920:
  sra $v0, $v0, 0x4
L80033924:
  sw $v0, 23208($s0)
L80033928:
  addiu $v0, $zero, 16
L8003392c:
  jal L8003fee0
L80033930:
  sw $v0, 23212($s0)
L80033934:
  lui $v0, 0x800a
L80033938:
  lhu $v0, -20154($v0)
L8003393c:
  lhu $a0, 23208($s0)
L80033940:
  lw $v1, 23212($s0)
L80033944:
  addu $v0, $v0, $a0
L80033948:
  addiu $v1, $v1, -1
L8003394c:
  lui $at, 0x800a
L80033950:
  sh $v0, -20154($at)
L80033954:
  bne $v1, $zero, L80033988
L80033958:
  sw $v1, 23212($s0)
L8003395c:
  lhu $v0, 23204($s0)
L80033960:
  sb $zero, 25410($s0)
L80033964:
  lui $at, 0x800a
L80033968:
  sh $v0, -20154($at)
L8003396c:
  sll $v0, $v0, 0x10
L80033970:
  beq $v0, $zero, L8003397c
L80033974:
  addiu $v0, $zero, 1
L80033978:
  sb $v0, 25410($s0)
L8003397c:
  lhu $v0, 25408($s0)
L80033980:
  sll $zero, $zero, 0x0
L80033984:
  sh $v0, 25406($s0)
L80033988:
  lw $ra, 20($sp)
L8003398c:
  lw $s0, 16($sp)
L80033990:
  jr $ra
L80033994:
  addiu $sp, $sp, 24
L80033998:
  lw $v0, 1012($gp)
L8003399c:
  addu $a0, $zero, $zero
L800339a0:
  addiu $v1, $v0, 11600
L800339a4:
  lbu $v0, 13($v1)
L800339a8:
  sll $zero, $zero, 0x0
L800339ac:
  bne $v0, $zero, L800339bc
L800339b0:
  addiu $a0, $a0, 1
L800339b4:
  jr $ra
L800339b8:
  addiu $v0, $zero, 1
L800339bc:
  slti $v0, $a0, 40
L800339c0:
  bne $v0, $zero, L800339a4
L800339c4:
  addiu $v1, $v1, 16
L800339c8:
  jr $ra
L800339cc:
  addu $v0, $zero, $zero
L800339d0:
  addiu $sp, $sp, -48
L800339d4:
  sw $s1, 36($sp)
L800339d8:
  addu $s1, $a0, $zero
L800339dc:
  sw $ra, 40($sp)
L800339e0:
  jal L80032b38
L800339e4:
  sw $s0, 32($sp)
L800339e8:
  bne $v0, $zero, L80033acc
L800339ec:
  sll $zero, $zero, 0x0
L800339f0:
  jal L8003fee0
L800339f4:
  addiu $a0, $zero, 8
L800339f8:
  jal L80033998
L800339fc:
  sll $zero, $zero, 0x0
L80033a00:
  beq $v0, $zero, L80033acc
L80033a04:
  sll $zero, $zero, 0x0
L80033a08:
  lhu $v0, 25406($s1)
L80033a0c:
  lbu $v1, 1008($gp)
L80033a10:
  ori $v0, $v0, 0x4000
L80033a14:
  andi $v1, $v1, 0x80
L80033a18:
  beq $v1, $zero, L80033a58
L80033a1c:
  sh $v0, 25406($s1)
L80033a20:
  addu $a0, $zero, $zero
L80033a24:
  addiu $a1, $zero, 8
L80033a28:
  addiu $a2, $zero, 40
L80033a2c:
  addiu $a3, $zero, 120
L80033a30:
  addiu $v0, $zero, 240
L80033a34:
  sw $v0, 16($sp)
L80033a38:
  addiu $v0, $zero, 16
L80033a3c:
  sw $v0, 20($sp)
L80033a40:
  addiu $v0, $zero, 4136
L80033a44:
  jal L80035c38
L80033a48:
  sw $v0, 24($sp)
L80033a4c:
  addiu $v1, $zero, 10
L80033a50:
  j L80033aa8
L80033a54:
  sb $v1, 89($v0)
L80033a58:
  addu $a0, $zero, $zero
L80033a5c:
  addiu $a1, $zero, 9
L80033a60:
  addiu $a2, $zero, 48
L80033a64:
  addiu $a3, $zero, 96
L80033a68:
  addiu $v0, $zero, 224
L80033a6c:
  sw $v0, 16($sp)
L80033a70:
  addu $v0, $a2, $zero
L80033a74:
  sw $v0, 20($sp)
L80033a78:
  addiu $v0, $zero, 32
L80033a7c:
  jal L80035c38
L80033a80:
  sw $v0, 24($sp)
L80033a84:
  addu $s0, $v0, $zero
L80033a88:
  addiu $v0, $zero, 10
L80033a8c:
  sb $v0, 89($s0)
L80033a90:
  jal L80039794
L80033a94:
  sll $zero, $zero, 0x0
L80033a98:
  lw $v0, 48($s0)
L80033a9c:
  sll $zero, $zero, 0x0
L80033aa0:
  beq $v0, $zero, L80033a90
L80033aa4:
  sll $zero, $zero, 0x0
L80033aa8:
  addiu $a0, $zero, 160
L80033aac:
  jal 0x80015bd8
L80033ab0:
  addiu $a1, $zero, 2
L80033ab4:
  lui $v0, 0x800a
L80033ab8:
  lbu $v0, -20618($v0)
L80033abc:
  sll $zero, $zero, 0x0
L80033ac0:
  addiu $v0, $v0, -8
L80033ac4:
  lui $at, 0x800a
L80033ac8:
  sb $v0, -20160($at)
L80033acc:
  lhu $v0, 25406($s1)
L80033ad0:
  sll $zero, $zero, 0x0
L80033ad4:
  andi $v0, $v0, 0x4000
L80033ad8:
  beq $v0, $zero, L80033b60
L80033adc:
  addiu $a0, $s1, 23960
L80033ae0:
  jal L80039794
L80033ae4:
  sll $zero, $zero, 0x0
L80033ae8:
  lui $v0, 0x800f
L80033aec:
  addiu $s0, $v0, -20232
L80033af0:
  lw $v0, 52($s0)
L80033af4:
  addiu $v1, $zero, 8192
L80033af8:
  andi $v0, $v0, 0x2008
L80033afc:
  bne $v0, $v1, L80033bd4
L80033b00:
  sll $zero, $zero, 0x0
L80033b04:
  jal L80035b7c
L80033b08:
  addu $a0, $s0, $zero
L80033b0c:
  lbu $v0, 1008($gp)
L80033b10:
  sll $zero, $zero, 0x0
L80033b14:
  andi $v0, $v0, 0x80
L80033b18:
  bne $v0, $zero, L80033b48
L80033b1c:
  addiu $a0, $zero, 255
L80033b20:
  lui $v0, 0x800a
L80033b24:
  lb $v0, -19635($v0)
L80033b28:
  sll $zero, $zero, 0x0
L80033b2c:
  beq $v0, $zero, L80033b48
L80033b30:
  sll $zero, $zero, 0x0
L80033b34:
  lhu $v0, 25406($s1)
L80033b38:
  sll $zero, $zero, 0x0
L80033b3c:
  andi $v0, $v0, 0xbfff
L80033b40:
  j L80033bd4
L80033b44:
  sh $v0, 25406($s1)
L80033b48:
  lhu $v0, 25408($s1)
L80033b4c:
  addiu $a1, $zero, 2
L80033b50:
  jal 0x80015bd8
L80033b54:
  sh $v0, 25406($s1)
L80033b58:
  j L80033bd4
L80033b5c:
  sll $zero, $zero, 0x0
L80033b60:
  lw $v0, 0($s1)
L80033b64:
  addu $a1, $zero, $zero
L80033b68:
  addiu $v1, $v0, 80
L80033b6c:
  lbu $v0, 0($a0)
L80033b70:
  addiu $a0, $a0, 1
L80033b74:
  addiu $a1, $a1, 1
L80033b78:
  sb $v0, 0($v1)
L80033b7c:
  slti $v0, $a1, 722
L80033b80:
  bne $v0, $zero, L80033b6c
L80033b84:
  addiu $v1, $v1, 1
L80033b88:
  lw $a0, 0($s1)
L80033b8c:
  addu $a1, $zero, $zero
L80033b90:
  addiu $v1, $s1, 11604
L80033b94:
  sh $zero, 0($a0)
L80033b98:
  lbu $v0, 9($v1)
L80033b9c:
  sll $zero, $zero, 0x0
L80033ba0:
  beq $v0, $zero, L80033bb4
L80033ba4:
  sll $zero, $zero, 0x0
L80033ba8:
  lhu $v0, 0($v1)
L80033bac:
  sll $zero, $zero, 0x0
L80033bb0:
  sh $v0, 0($a0)
L80033bb4:
  addiu $a0, $a0, 2
L80033bb8:
  addiu $a1, $a1, 1
L80033bbc:
  slti $v0, $a1, 40
L80033bc0:
  bne $v0, $zero, L80033b94
L80033bc4:
  addiu $v1, $v1, 16
L80033bc8:
  jal L80032370
L80033bcc:
  sll $zero, $zero, 0x0
L80033bd0:
  sh $zero, 25406($s1)
L80033bd4:
  lw $ra, 40($sp)
L80033bd8:
  lw $s1, 36($sp)
L80033bdc:
  lw $s0, 32($sp)
L80033be0:
  jr $ra
L80033be4:
  addiu $sp, $sp, 48
L80033be8:
  addiu $sp, $sp, -24
L80033bec:
  sw $ra, 16($sp)
L80033bf0:
  jal 0x8008e590
L80033bf4:
  sll $zero, $zero, 0x0
L80033bf8:
  lui $v0, 0x800a
L80033bfc:
  lw $v0, -20324($v0)
L80033c00:
  sll $zero, $zero, 0x0
L80033c04:
  andi $a0, $v0, 0x3f
L80033c08:
  slti $v0, $a0, 32
L80033c0c:
  bne $v0, $zero, L80033c18
L80033c10:
  addiu $v0, $zero, 63
L80033c14:
  subu $a0, $v0, $a0
L80033c18:
  lw $v1, 1012($gp)
L80033c1c:
  sll $v0, $a0, 0x1
L80033c20:
  lw $a0, 11576($v1)
L80033c24:
  lw $v1, 23172($v1)
L80033c28:
  addiu $v0, $v0, 64
L80033c2c:
  sb $v0, 14($v1)
L80033c30:
  sb $v0, 13($v1)
L80033c34:
  sb $v0, 12($v1)
L80033c38:
  sb $v0, 14($a0)
L80033c3c:
  sb $v0, 13($a0)
L80033c40:
  jal L8002892c
L80033c44:
  sb $v0, 12($a0)
L80033c48:
  bne $v0, $zero, L80033c7c
L80033c4c:
  lui $v1, 0x8009
L80033c50:
  lw $a0, 1012($gp)
L80033c54:
  sll $zero, $zero, 0x0
L80033c58:
  lhu $v0, 25406($a0)
L80033c5c:
  addiu $v1, $v1, 3576
L80033c60:
  andi $v0, $v0, 0x3f
L80033c64:
  sll $v0, $v0, 0x2
L80033c68:
  addu $v0, $v0, $v1
L80033c6c:
  lw $v0, 0($v0)
L80033c70:
  sll $zero, $zero, 0x0
L80033c74:
  jalr $ra, $v0
L80033c78:
  sll $zero, $zero, 0x0
L80033c7c:
  lw $v0, 1012($gp)
L80033c80:
  lw $ra, 16($sp)
L80033c84:
  lhu $v0, 25406($v0)
L80033c88:
  jr $ra
L80033c8c:
  addiu $sp, $sp, 24
L80033c90:
  addiu $v0, $zero, 7
L80033c94:
  sb $zero, 1008($gp)
L80033c98:
  lui $at, 0x800a
L80033c9c:
  sb $v0, -19860($at)
L80033ca0:
  jr $ra
L80033ca4:
  sll $zero, $zero, 0x0
L80033ca8:
  addiu $v0, $zero, 128
L80033cac:
  sb $v0, 1008($gp)
L80033cb0:
  addiu $v0, $zero, 7
L80033cb4:
  lui $at, 0x800a
L80033cb8:
  sb $v0, -19860($at)
L80033cbc:
  jr $ra
L80033cc0:
  sll $zero, $zero, 0x0
L80033cc4:
  lui $v0, 0x8009
L80033cc8:
  addiu $v0, $v0, 3544
L80033ccc:
  lbu $a1, 11591($a0)
L80033cd0:
  lb $v1, 11590($a0)
L80033cd4:
  sll $a1, $a1, 0x4
L80033cd8:
  sll $v1, $v1, 0x1
L80033cdc:
  addu $v1, $v1, $v0
L80033ce0:
  addu $a1, $a1, $v1
L80033ce4:
  lbu $v0, 1($a1)
L80033ce8:
  sll $zero, $zero, 0x0
L80033cec:
  andi $v0, $v0, 0xf
L80033cf0:
  jr $ra
L80033cf4:
  sb $v0, 11589($a0)
L80033cf8:
  addiu $sp, $sp, -32
L80033cfc:
  sw $s0, 16($sp)
L80033d00:
  addu $s0, $a0, $zero
L80033d04:
  mult $s0, $s0
L80033d08:
  mflo $v0
L80033d0c:
  sw $s1, 20($sp)
L80033d10:
  addu $s1, $a2, $zero
L80033d14:
  mult $s1, $s1
L80033d18:
  sw $s2, 24($sp)
L80033d1c:
  addu $s2, $a1, $zero
L80033d20:
  sw $ra, 28($sp)
L80033d24:
  mflo $v1
L80033d28:
  jal 0x80086e50
L80033d2c:
  addu $a0, $v0, $v1
L80033d30:
  addu $a0, $s0, $zero
L80033d34:
  lw $v1, 1032($gp)
L80033d38:
  addu $a1, $s1, $zero
L80033d3c:
  jal 0x800899a0
L80033d40:
  sh $v0, 2($v1)
L80033d44:
  bgez $v0, L80033d54
L80033d48:
  sra $v1, $v0, 0x4
L80033d4c:
  addiu $v0, $v0, 15
L80033d50:
  sra $v1, $v0, 0x4
L80033d54:
  slti $v0, $v1, 256
L80033d58:
  bne $v0, $zero, L80033d68
L80033d5c:
  sll $v0, $v1, 0x8
L80033d60:
  addiu $v1, $zero, 255
L80033d64:
  sll $v0, $v1, 0x8
L80033d68:
  sra $a0, $s2, 0x4
L80033d6c:
  lw $v1, 1032($gp)
L80033d70:
  lhu $a1, 1036($gp)
L80033d74:
  or $v0, $v0, $a0
L80033d78:
  sh $v0, 0($v1)
L80033d7c:
  lw $v0, 1036($gp)
L80033d80:
  sh $a1, 4($v1)
L80033d84:
  sh $zero, 6($v1)
L80033d88:
  lw $ra, 28($sp)
L80033d8c:
  lw $s2, 24($sp)
L80033d90:
  lw $s1, 20($sp)
L80033d94:
  lw $s0, 16($sp)
L80033d98:
  addiu $v1, $v1, 8
L80033d9c:
  sw $v1, 1032($gp)
L80033da0:
  addiu $v0, $v0, 1
L80033da4:
  sw $v0, 1036($gp)
L80033da8:
  jr $ra
L80033dac:
  addiu $sp, $sp, 32
L80033db0:
  addu $t9, $a0, $zero
L80033db4:
  lw $a0, 1028($gp)
L80033db8:
  addiu $sp, $sp, -80
L80033dbc:
  sw $ra, 72($sp)
L80033dc0:
  sw $s7, 68($sp)
L80033dc4:
  sw $s6, 64($sp)
L80033dc8:
  sw $s5, 60($sp)
L80033dcc:
  sw $s4, 56($sp)
L80033dd0:
  sw $s3, 52($sp)
L80033dd4:
  sw $s2, 48($sp)
L80033dd8:
  sw $s1, 44($sp)
L80033ddc:
  andi $v0, $a0, 0x8
L80033de0:
  beq $v0, $zero, L80033df8
L80033de4:
  sw $s0, 40($sp)
L80033de8:
  jal 0x8006151c
L80033dec:
  addu $a0, $t9, $zero
L80033df0:
  j L80034804
L80033df4:
  sll $zero, $zero, 0x0
L80033df8:
  lui $a1, 0xff
L80033dfc:
  ori $a1, $a1, 0xffff
L80033e00:
  lui $s1, 0x1f80
L80033e04:
  ori $s1, $s1, 0x3c0
L80033e08:
  lui $t1, 0x1f80
L80033e0c:
  lw $s5, 0($t9)
L80033e10:
  sll $zero, $zero, 0x0
L80033e14:
  sw $s5, 28($sp)
L80033e18:
  lw $t5, 16($t9)
L80033e1c:
  lw $v0, 4($s5)
L80033e20:
  lhu $s2, 2($s5)
L80033e24:
  lw $v1, 20($t9)
L80033e28:
  lw $s3, 24($t9)
L80033e2c:
  lw $t7, 28($t9)
L80033e30:
  and $v0, $v0, $a1
L80033e34:
  sll $v0, $v0, 0x2
L80033e38:
  addu $t6, $v1, $v0
L80033e3c:
  andi $v0, $a0, 0x4
L80033e40:
  beq $v0, $zero, L80033f38
L80033e44:
  ori $t1, $t1, 0x3e0
L80033e48:
  addiu $s2, $s2, -1
L80033e4c:
  addiu $v0, $zero, -1
L80033e50:
  beq $s2, $v0, L80033f2c
L80033e54:
  lui $s1, 0x5555
L80033e58:
  ori $s1, $s1, 0x5556
L80033e5c:
  addiu $s0, $t6, 22
L80033e60:
  lhu $a2, -8($s0)
L80033e64:
  lhu $t0, -4($s0)
L80033e68:
  lhu $a3, 0($s0)
L80033e6c:
  sll $a2, $a2, 0x3
L80033e70:
  addu $a2, $a2, $s3
L80033e74:
  sll $t0, $t0, 0x3
L80033e78:
  addu $t0, $t0, $s3
L80033e7c:
  sll $a3, $a3, 0x3
L80033e80:
  addu $a3, $a3, $s3
L80033e84:
  lh $a0, 0($a2)
L80033e88:
  lh $v0, 0($t0)
L80033e8c:
  lh $v1, 0($a3)
L80033e90:
  addu $a0, $a0, $v0
L80033e94:
  addu $a0, $a0, $v1
L80033e98:
  mult $a0, $s1
L80033e9c:
  lh $a1, 2($a2)
L80033ea0:
  lh $v0, 2($t0)
L80033ea4:
  lh $v1, 2($a3)
L80033ea8:
  mfhi $t2
L80033eac:
  addu $a1, $a1, $v0
L80033eb0:
  addu $a1, $a1, $v1
L80033eb4:
  mult $a1, $s1
L80033eb8:
  lh $a2, 4($a2)
L80033ebc:
  lh $v0, 4($t0)
L80033ec0:
  lh $v1, 4($a3)
L80033ec4:
  mfhi $t1
L80033ec8:
  addu $a2, $a2, $v0
L80033ecc:
  addu $a2, $a2, $v1
L80033ed0:
  mult $a2, $s1
L80033ed4:
  addiu $s0, $s0, 24
L80033ed8:
  sra $a0, $a0, 0x1f
L80033edc:
  subu $a0, $t2, $a0
L80033ee0:
  bgez $a0, L80033eec
L80033ee4:
  sll $zero, $zero, 0x0
L80033ee8:
  subu $a0, $zero, $a0
L80033eec:
  sra $a1, $a1, 0x1f
L80033ef0:
  subu $a1, $t1, $a1
L80033ef4:
  sra $a2, $a2, 0x1f
L80033ef8:
  bgez $a1, L80033f04
L80033efc:
  sll $zero, $zero, 0x0
L80033f00:
  subu $a1, $zero, $a1
L80033f04:
  mfhi $v1
L80033f08:
  subu $a2, $v1, $a2
L80033f0c:
  bgez $a2, L80033f18
L80033f10:
  sll $zero, $zero, 0x0
L80033f14:
  subu $a2, $zero, $a2
L80033f18:
  jal L80033cf8
L80033f1c:
  addiu $s2, $s2, -1
L80033f20:
  addiu $v0, $zero, -1
L80033f24:
  bne $s2, $v0, L80033e60
L80033f28:
  sll $zero, $zero, 0x0
L80033f2c:
  lw $s5, 28($sp)
L80033f30:
  j L80034804
L80033f34:
  addiu $v0, $s5, 8
L80033f38:
  andi $v0, $a0, 0x3
L80033f3c:
  beq $v0, $zero, L800344e0
L80033f40:
  lui $s6, 0x1f80
L80033f44:
  ori $s6, $s6, 0x3d0
L80033f48:
  lui $t3, 0x1f80
L80033f4c:
  ori $t3, $t3, 0x380
L80033f50:
  lui $t2, 0x1f80
L80033f54:
  lw $v0, 1016($gp)
L80033f58:
  addiu $s2, $s2, -1
L80033f5c:
  sw $s6, 32($sp)
L80033f60:
  sw $a1, 0($s1)
L80033f64:
  sw $v0, 0($s6)
L80033f68:
  addiu $v0, $zero, -1
L80033f6c:
  beq $s2, $v0, L800347f4
L80033f70:
  ori $t2, $t2, 0x380
L80033f74:
  lui $s7, 0x1f80
L80033f78:
  ori $s7, $s7, 0x3a0
L80033f7c:
  sw $s7, 24($sp)
L80033f80:
  lui $s0, 0xff
L80033f84:
  ori $s0, $s0, 0xffff
L80033f88:
  lui $s4, 0xff00
L80033f8c:
  addiu $t0, $t6, 20
L80033f90:
  lw $v0, 1028($gp)
L80033f94:
  sll $zero, $zero, 0x0
L80033f98:
  andi $v0, $v0, 0x2
L80033f9c:
  beq $v0, $zero, L80034234
L80033fa0:
  sll $zero, $zero, 0x0
L80033fa4:
  lw $v0, 1032($gp)
L80033fa8:
  lw $a0, 1036($gp)
L80033fac:
  lh $v1, 6($v0)
L80033fb0:
  addiu $v0, $v0, 8
L80033fb4:
  sw $v0, 1032($gp)
L80033fb8:
  sw $v1, 16($sp)
L80033fbc:
  sltu $v1, $v1, $a0
L80033fc0:
  beq $v1, $zero, L80034234
L80033fc4:
  sll $zero, $zero, 0x0
L80033fc8:
  lhu $v0, -6($t0)
L80033fcc:
  sll $zero, $zero, 0x0
L80033fd0:
  sll $v0, $v0, 0x3
L80033fd4:
  addu $v0, $s3, $v0
L80033fd8:
  .word 0xc8400000
L80033fdc:
  .word 0xc8410004
L80033fe0:
  sll $zero, $zero, 0x0
L80033fe4:
  sll $zero, $zero, 0x0
L80033fe8:
  .word 0x4a180001
L80033fec:
  addiu $v0, $t2, 8
L80033ff0:
  .word 0xe84e0000
L80033ff4:
  .word 0x484cf800
L80033ff8:
  sll $zero, $zero, 0x0
L80033ffc:
  sw $t4, 0($t1)
L80034000:
  lhu $v0, -8($t0)
L80034004:
  sll $zero, $zero, 0x0
L80034008:
  sll $v0, $v0, 0x3
L8003400c:
  addu $v0, $t7, $v0
L80034010:
  .word 0xc8400000
L80034014:
  .word 0xc8410004
L80034018:
  lw $t8, 32($sp)
L8003401c:
  sll $zero, $zero, 0x0
L80034020:
  .word 0xcb060000
L80034024:
  sll $zero, $zero, 0x0
L80034028:
  sll $zero, $zero, 0x0
L8003402c:
  .word 0x4ae80413
L80034030:
  addiu $v0, $t2, 4
L80034034:
  .word 0xe8560000
L80034038:
  addiu $v0, $t1, 16
L8003403c:
  .word 0x480c9800
L80034040:
  sll $zero, $zero, 0x0
L80034044:
  sra $t4, $t4, 0x2
L80034048:
  sw $t4, 0($v0)
L8003404c:
  lhu $v0, -2($t0)
L80034050:
  sll $zero, $zero, 0x0
L80034054:
  sll $v0, $v0, 0x3
L80034058:
  addu $v0, $s3, $v0
L8003405c:
  .word 0xc8400000
L80034060:
  .word 0xc8410004
L80034064:
  sll $zero, $zero, 0x0
L80034068:
  sll $zero, $zero, 0x0
L8003406c:
  .word 0x4a180001
L80034070:
  addiu $v0, $t2, 20
L80034074:
  .word 0xe84e0000
L80034078:
  addiu $v0, $t1, 4
L8003407c:
  .word 0x484cf800
L80034080:
  sll $zero, $zero, 0x0
L80034084:
  sw $t4, 0($v0)
L80034088:
  lhu $v0, -4($t0)
L8003408c:
  sll $zero, $zero, 0x0
L80034090:
  sll $v0, $v0, 0x3
L80034094:
  addu $v0, $t7, $v0
L80034098:
  .word 0xc8400000
L8003409c:
  .word 0xc8410004
L800340a0:
  .word 0xcb060000
L800340a4:
  sll $zero, $zero, 0x0
L800340a8:
  sll $zero, $zero, 0x0
L800340ac:
  .word 0x4ae80413
L800340b0:
  addiu $v0, $t2, 16
L800340b4:
  .word 0xe8560000
L800340b8:
  addiu $v0, $t1, 20
L800340bc:
  .word 0x480c9800
L800340c0:
  sll $zero, $zero, 0x0
L800340c4:
  sra $t4, $t4, 0x2
L800340c8:
  sw $t4, 0($v0)
L800340cc:
  lhu $v0, 2($t0)
L800340d0:
  sll $zero, $zero, 0x0
L800340d4:
  sll $v0, $v0, 0x3
L800340d8:
  addu $v0, $s3, $v0
L800340dc:
  .word 0xc8400000
L800340e0:
  .word 0xc8410004
L800340e4:
  sll $zero, $zero, 0x0
L800340e8:
  sll $zero, $zero, 0x0
L800340ec:
  .word 0x4a180001
L800340f0:
  lw $s5, 24($sp)
L800340f4:
  sll $zero, $zero, 0x0
L800340f8:
  .word 0xeaae0000
L800340fc:
  addiu $v0, $t1, 8
L80034100:
  .word 0x484cf800
L80034104:
  sll $zero, $zero, 0x0
L80034108:
  sw $t4, 0($v0)
L8003410c:
  lhu $v0, 0($t0)
L80034110:
  sll $zero, $zero, 0x0
L80034114:
  sll $v0, $v0, 0x3
L80034118:
  addu $v0, $t7, $v0
L8003411c:
  .word 0xc8400000
L80034120:
  .word 0xc8410004
L80034124:
  .word 0xcb060000
L80034128:
  sll $zero, $zero, 0x0
L8003412c:
  sll $zero, $zero, 0x0
L80034130:
  .word 0x4ae80413
L80034134:
  addiu $v0, $t2, 28
L80034138:
  .word 0xe8560000
L8003413c:
  addiu $v0, $t1, 24
L80034140:
  .word 0x480c9800
L80034144:
  sll $zero, $zero, 0x0
L80034148:
  sra $t4, $t4, 0x2
L8003414c:
  sw $t4, 0($v0)
L80034150:
  lw $s6, 8($t2)
L80034154:
  lw $s7, 20($t2)
L80034158:
  lw $t8, 32($t2)
L8003415c:
  .word 0x48966000
L80034160:
  .word 0x48987000
L80034164:
  .word 0x48976800
L80034168:
  sll $zero, $zero, 0x0
L8003416c:
  sll $zero, $zero, 0x0
L80034170:
  .word 0x4b400006
L80034174:
  addiu $v0, $sp, 16
L80034178:
  .word 0xe8580000
L8003417c:
  lw $v0, 16($sp)
L80034180:
  sll $zero, $zero, 0x0
L80034184:
  blez $v0, L800344c4
L80034188:
  sll $zero, $zero, 0x0
L8003418c:
  lw $v0, 0($t1)
L80034190:
  lw $v1, 4($t1)
L80034194:
  lw $a0, 8($t1)
L80034198:
  or $v0, $v0, $v1
L8003419c:
  or $v0, $v0, $a0
L800341a0:
  bltz $v0, L800344c4
L800341a4:
  addiu $v0, $zero, 9
L800341a8:
  sb $v0, 3($t2)
L800341ac:
  addiu $v0, $zero, 52
L800341b0:
  sb $v0, 7($t2)
L800341b4:
  lhu $v1, 0($t6)
L800341b8:
  lhu $a0, -16($t0)
L800341bc:
  lhu $a1, -12($t0)
L800341c0:
  lhu $v0, -14($t0)
L800341c4:
  addu $a3, $t5, $zero
L800341c8:
  sh $v0, 26($t2)
L800341cc:
  lhu $v0, -18($t0)
L800341d0:
  addu $a2, $t2, $zero
L800341d4:
  sh $v1, 12($t2)
L800341d8:
  sh $a0, 24($t2)
L800341dc:
  sh $a1, 36($t2)
L800341e0:
  sh $v0, 14($t2)
L800341e4:
  lw $s5, 0($a2)
L800341e8:
  lw $s6, 4($a2)
L800341ec:
  lw $s7, 8($a2)
L800341f0:
  lw $t8, 12($a2)
L800341f4:
  sw $s5, 0($a3)
L800341f8:
  sw $s6, 4($a3)
L800341fc:
  sw $s7, 8($a3)
L80034200:
  sw $t8, 12($a3)
L80034204:
  addiu $a2, $a2, 16
L80034208:
  lw $s5, 24($sp)
L8003420c:
  sll $zero, $zero, 0x0
L80034210:
  bne $a2, $s5, L800341e4
L80034214:
  addiu $a3, $a3, 16
L80034218:
  lui $a1, 0x5555
L8003421c:
  ori $a1, $a1, 0x5556
L80034220:
  lw $s6, 0($a2)
L80034224:
  lw $s7, 4($a2)
L80034228:
  sw $s6, 0($a3)
L8003422c:
  j L80034448
L80034230:
  sw $s7, 4($a3)
L80034234:
  lhu $v0, -6($t0)
L80034238:
  sll $zero, $zero, 0x0
L8003423c:
  sll $v0, $v0, 0x3
L80034240:
  addu $v0, $s3, $v0
L80034244:
  .word 0xc8400000
L80034248:
  .word 0xc8410004
L8003424c:
  sll $zero, $zero, 0x0
L80034250:
  sll $zero, $zero, 0x0
L80034254:
  .word 0x4a180001
L80034258:
  addiu $v0, $t3, 8
L8003425c:
  .word 0xe84e0000
L80034260:
  .word 0x484cf800
L80034264:
  sll $zero, $zero, 0x0
L80034268:
  sw $t4, 0($t1)
L8003426c:
  lhu $v0, -8($t0)
L80034270:
  sll $zero, $zero, 0x0
L80034274:
  sll $v0, $v0, 0x3
L80034278:
  addu $v0, $t7, $v0
L8003427c:
  .word 0xc8400000
L80034280:
  .word 0xc8410004
L80034284:
  .word 0xca260000
L80034288:
  sll $zero, $zero, 0x0
L8003428c:
  sll $zero, $zero, 0x0
L80034290:
  .word 0x4ae80413
L80034294:
  addiu $v0, $t3, 4
L80034298:
  .word 0xe8560000
L8003429c:
  addiu $v0, $t1, 16
L800342a0:
  .word 0x480c9800
L800342a4:
  sll $zero, $zero, 0x0
L800342a8:
  sra $t4, $t4, 0x2
L800342ac:
  sw $t4, 0($v0)
L800342b0:
  lw $v1, 4($t3)
L800342b4:
  lhu $v0, -2($t0)
L800342b8:
  lw $a0, 8($t3)
L800342bc:
  sll $v0, $v0, 0x3
L800342c0:
  addu $v0, $s3, $v0
L800342c4:
  sw $v1, 28($t3)
L800342c8:
  sw $a0, 32($t3)
L800342cc:
  .word 0xc8400000
L800342d0:
  .word 0xc8410004
L800342d4:
  sll $zero, $zero, 0x0
L800342d8:
  sll $zero, $zero, 0x0
L800342dc:
  .word 0x4a180001
L800342e0:
  addiu $v0, $t3, 16
L800342e4:
  .word 0xe84e0000
L800342e8:
  addiu $v0, $t1, 4
L800342ec:
  .word 0x484cf800
L800342f0:
  sll $zero, $zero, 0x0
L800342f4:
  sw $t4, 0($v0)
L800342f8:
  lhu $v0, -4($t0)
L800342fc:
  sll $zero, $zero, 0x0
L80034300:
  sll $v0, $v0, 0x3
L80034304:
  addu $v0, $t7, $v0
L80034308:
  .word 0xc8400000
L8003430c:
  .word 0xc8410004
L80034310:
  .word 0xca260000
L80034314:
  sll $zero, $zero, 0x0
L80034318:
  sll $zero, $zero, 0x0
L8003431c:
  .word 0x4ae80413
L80034320:
  addiu $v0, $t3, 12
L80034324:
  .word 0xe8560000
L80034328:
  addiu $v0, $t1, 20
L8003432c:
  .word 0x480c9800
L80034330:
  sll $zero, $zero, 0x0
L80034334:
  sra $t4, $t4, 0x2
L80034338:
  sw $t4, 0($v0)
L8003433c:
  lhu $v0, 2($t0)
L80034340:
  sll $zero, $zero, 0x0
L80034344:
  sll $v0, $v0, 0x3
L80034348:
  addu $v0, $s3, $v0
L8003434c:
  .word 0xc8400000
L80034350:
  .word 0xc8410004
L80034354:
  sll $zero, $zero, 0x0
L80034358:
  sll $zero, $zero, 0x0
L8003435c:
  .word 0x4a180001
L80034360:
  addiu $v0, $t3, 24
L80034364:
  .word 0xe84e0000
L80034368:
  addiu $v0, $t1, 8
L8003436c:
  .word 0x484cf800
L80034370:
  sll $zero, $zero, 0x0
L80034374:
  sw $t4, 0($v0)
L80034378:
  lhu $v0, 0($t0)
L8003437c:
  sll $zero, $zero, 0x0
L80034380:
  sll $v0, $v0, 0x3
L80034384:
  addu $v0, $t7, $v0
L80034388:
  .word 0xc8400000
L8003438c:
  .word 0xc8410004
L80034390:
  .word 0xca260000
L80034394:
  sll $zero, $zero, 0x0
L80034398:
  sll $zero, $zero, 0x0
L8003439c:
  .word 0x4ae80413
L800343a0:
  addiu $v0, $t3, 20
L800343a4:
  .word 0xe8560000
L800343a8:
  addiu $v0, $t1, 24
L800343ac:
  .word 0x480c9800
L800343b0:
  sll $zero, $zero, 0x0
L800343b4:
  sra $t4, $t4, 0x2
L800343b8:
  sw $t4, 0($v0)
L800343bc:
  lw $v0, 0($t1)
L800343c0:
  lw $v1, 4($t1)
L800343c4:
  lw $a0, 8($t1)
L800343c8:
  or $v0, $v0, $v1
L800343cc:
  or $v0, $v0, $a0
L800343d0:
  bltz $v0, L800344c4
L800343d4:
  lui $v0, 0x5555
L800343d8:
  ori $v0, $v0, 0x5555
L800343dc:
  addu $a2, $t5, $zero
L800343e0:
  addu $a0, $t3, $zero
L800343e4:
  addiu $a1, $a0, 32
L800343e8:
  addiu $v1, $zero, 9
L800343ec:
  sb $v1, 3($t3)
L800343f0:
  addiu $v1, $zero, 92
L800343f4:
  sb $v1, 7($t3)
L800343f8:
  sw $v0, 36($t3)
L800343fc:
  sb $zero, 23($t3)
L80034400:
  sb $zero, 31($t3)
L80034404:
  lw $s6, 0($a0)
L80034408:
  lw $s7, 4($a0)
L8003440c:
  lw $t8, 8($a0)
L80034410:
  lw $s5, 12($a0)
L80034414:
  sw $s6, 0($a2)
L80034418:
  sw $s7, 4($a2)
L8003441c:
  sw $t8, 8($a2)
L80034420:
  sw $s5, 12($a2)
L80034424:
  addiu $a0, $a0, 16
L80034428:
  bne $a0, $a1, L80034404
L8003442c:
  addiu $a2, $a2, 16
L80034430:
  lui $a1, 0x5555
L80034434:
  ori $a1, $a1, 0x5556
L80034438:
  lw $s6, 0($a0)
L8003443c:
  lw $s7, 4($a0)
L80034440:
  sw $s6, 0($a2)
L80034444:
  sw $s7, 4($a2)
L80034448:
  lw $a0, 16($t1)
L8003444c:
  lw $v0, 20($t1)
L80034450:
  lw $v1, 24($t1)
L80034454:
  addu $a0, $a0, $v0
L80034458:
  addu $a0, $a0, $v1
L8003445c:
  mult $a0, $a1
L80034460:
  sra $a0, $a0, 0x1f
L80034464:
  lw $v0, 4($t9)
L80034468:
  lw $v1, 0($t5)
L8003446c:
  lw $v0, 4($v0)
L80034470:
  mfhi $s5
L80034474:
  subu $a0, $s5, $a0
L80034478:
  sra $a0, $a0, 0x4
L8003447c:
  sll $a1, $a0, 0x2
L80034480:
  addu $v0, $a1, $v0
L80034484:
  lw $v0, 0($v0)
L80034488:
  and $v1, $v1, $s4
L8003448c:
  and $v0, $v0, $s0
L80034490:
  or $v1, $v1, $v0
L80034494:
  sw $v1, 0($t5)
L80034498:
  lw $v0, 4($t9)
L8003449c:
  sll $zero, $zero, 0x0
L800344a0:
  lw $v0, 4($v0)
L800344a4:
  and $v1, $t5, $s0
L800344a8:
  sw $a0, 16($sp)
L800344ac:
  addu $a1, $a1, $v0
L800344b0:
  lw $v0, 0($a1)
L800344b4:
  addiu $t5, $t5, 40
L800344b8:
  and $v0, $v0, $s4
L800344bc:
  or $v0, $v0, $v1
L800344c0:
  sw $v0, 0($a1)
L800344c4:
  addiu $t0, $t0, 24
L800344c8:
  addiu $s2, $s2, -1
L800344cc:
  addiu $v0, $zero, -1
L800344d0:
  bne $s2, $v0, L80033f90
L800344d4:
  addiu $t6, $t6, 24
L800344d8:
  j L800347f4
L800344dc:
  sll $zero, $zero, 0x0
L800344e0:
  lui $t0, 0x1f80
L800344e4:
  lw $v0, 1016($gp)
L800344e8:
  addiu $s2, $s2, -1
L800344ec:
  sw $v0, 0($s1)
L800344f0:
  addiu $v0, $zero, -1
L800344f4:
  beq $s2, $v0, L800347f4
L800344f8:
  ori $t0, $t0, 0x380
L800344fc:
  lui $s0, 0x1f80
L80034500:
  ori $s0, $s0, 0x3a0
L80034504:
  lui $t3, 0xff
L80034508:
  ori $t3, $t3, 0xffff
L8003450c:
  lui $s4, 0xff00
L80034510:
  addiu $t2, $t6, 2
L80034514:
  lhu $v0, 12($t2)
L80034518:
  sll $zero, $zero, 0x0
L8003451c:
  sll $v0, $v0, 0x3
L80034520:
  addu $v0, $s3, $v0
L80034524:
  .word 0xc8400000
L80034528:
  .word 0xc8410004
L8003452c:
  sll $zero, $zero, 0x0
L80034530:
  sll $zero, $zero, 0x0
L80034534:
  .word 0x4a180001
L80034538:
  addiu $v0, $t0, 8
L8003453c:
  .word 0xe84e0000
L80034540:
  .word 0x484cf800
L80034544:
  sll $zero, $zero, 0x0
L80034548:
  sw $t4, 0($t1)
L8003454c:
  lhu $v0, 10($t2)
L80034550:
  sll $zero, $zero, 0x0
L80034554:
  sll $v0, $v0, 0x3
L80034558:
  addu $v0, $t7, $v0
L8003455c:
  .word 0xc8400000
L80034560:
  .word 0xc8410004
L80034564:
  .word 0xca260000
L80034568:
  sll $zero, $zero, 0x0
L8003456c:
  sll $zero, $zero, 0x0
L80034570:
  .word 0x4ae80413
L80034574:
  addiu $v0, $t0, 4
L80034578:
  .word 0xe8560000
L8003457c:
  addiu $v0, $t1, 16
L80034580:
  .word 0x480c9800
L80034584:
  sll $zero, $zero, 0x0
L80034588:
  sra $t4, $t4, 0x2
L8003458c:
  sw $t4, 0($v0)
L80034590:
  lhu $v0, 16($t2)
L80034594:
  sll $zero, $zero, 0x0
L80034598:
  sll $v0, $v0, 0x3
L8003459c:
  addu $v0, $s3, $v0
L800345a0:
  .word 0xc8400000
L800345a4:
  .word 0xc8410004
L800345a8:
  sll $zero, $zero, 0x0
L800345ac:
  sll $zero, $zero, 0x0
L800345b0:
  .word 0x4a180001
L800345b4:
  addiu $v0, $t0, 20
L800345b8:
  .word 0xe84e0000
L800345bc:
  addiu $v0, $t1, 4
L800345c0:
  .word 0x484cf800
L800345c4:
  sll $zero, $zero, 0x0
L800345c8:
  sw $t4, 0($v0)
L800345cc:
  lhu $v0, 14($t2)
L800345d0:
  sll $zero, $zero, 0x0
L800345d4:
  sll $v0, $v0, 0x3
L800345d8:
  addu $v0, $t7, $v0
L800345dc:
  .word 0xc8400000
L800345e0:
  .word 0xc8410004
L800345e4:
  .word 0xca260000
L800345e8:
  sll $zero, $zero, 0x0
L800345ec:
  sll $zero, $zero, 0x0
L800345f0:
  .word 0x4ae80413
L800345f4:
  addiu $v0, $t0, 16
L800345f8:
  .word 0xe8560000
L800345fc:
  addiu $v0, $t1, 20
L80034600:
  .word 0x480c9800
L80034604:
  sll $zero, $zero, 0x0
L80034608:
  sra $t4, $t4, 0x2
L8003460c:
  sw $t4, 0($v0)
L80034610:
  lhu $v0, 20($t2)
L80034614:
  sll $zero, $zero, 0x0
L80034618:
  sll $v0, $v0, 0x3
L8003461c:
  addu $v0, $s3, $v0
L80034620:
  .word 0xc8400000
L80034624:
  .word 0xc8410004
L80034628:
  sll $zero, $zero, 0x0
L8003462c:
  sll $zero, $zero, 0x0
L80034630:
  .word 0x4a180001
L80034634:
  .word 0xea0e0000
L80034638:
  addiu $v0, $t1, 8
L8003463c:
  .word 0x484cf800
L80034640:
  sll $zero, $zero, 0x0
L80034644:
  sw $t4, 0($v0)
L80034648:
  lhu $v0, 18($t2)
L8003464c:
  sll $zero, $zero, 0x0
L80034650:
  sll $v0, $v0, 0x3
L80034654:
  addu $v0, $t7, $v0
L80034658:
  .word 0xc8400000
L8003465c:
  .word 0xc8410004
L80034660:
  .word 0xca260000
L80034664:
  sll $zero, $zero, 0x0
L80034668:
  sll $zero, $zero, 0x0
L8003466c:
  .word 0x4ae80413
L80034670:
  addiu $v0, $t0, 28
L80034674:
  .word 0xe8560000
L80034678:
  addiu $v0, $t1, 24
L8003467c:
  .word 0x480c9800
L80034680:
  sll $zero, $zero, 0x0
L80034684:
  sra $t4, $t4, 0x2
L80034688:
  sw $t4, 0($v0)
L8003468c:
  lw $s6, 8($t0)
L80034690:
  lw $s7, 20($t0)
L80034694:
  lw $t8, 32($t0)
L80034698:
  .word 0x48966000
L8003469c:
  .word 0x48987000
L800346a0:
  .word 0x48976800
L800346a4:
  sll $zero, $zero, 0x0
L800346a8:
  sll $zero, $zero, 0x0
L800346ac:
  .word 0x4b400006
L800346b0:
  addiu $v0, $sp, 16
L800346b4:
  .word 0xe8580000
L800346b8:
  lw $v0, 16($sp)
L800346bc:
  sll $zero, $zero, 0x0
L800346c0:
  blez $v0, L800347e0
L800346c4:
  sll $zero, $zero, 0x0
L800346c8:
  lw $v0, 0($t1)
L800346cc:
  lw $v1, 4($t1)
L800346d0:
  lw $a0, 8($t1)
L800346d4:
  or $v0, $v0, $v1
L800346d8:
  or $v0, $v0, $a0
L800346dc:
  bltz $v0, L800347e0
L800346e0:
  addiu $v0, $zero, 9
L800346e4:
  sb $v0, 3($t0)
L800346e8:
  addiu $v0, $zero, 52
L800346ec:
  sb $v0, 7($t0)
L800346f0:
  lhu $v1, 0($t6)
L800346f4:
  lhu $a0, 2($t2)
L800346f8:
  lhu $a1, 6($t2)
L800346fc:
  lhu $v0, 4($t2)
L80034700:
  addu $a3, $t5, $zero
L80034704:
  sh $v0, 26($t0)
L80034708:
  lhu $v0, 0($t2)
L8003470c:
  addu $a2, $t0, $zero
L80034710:
  sh $v1, 12($t0)
L80034714:
  sh $a0, 24($t0)
L80034718:
  sh $a1, 36($t0)
L8003471c:
  sh $v0, 14($t0)
L80034720:
  lw $s5, 0($a2)
L80034724:
  lw $s6, 4($a2)
L80034728:
  lw $s7, 8($a2)
L8003472c:
  lw $t8, 12($a2)
L80034730:
  sw $s5, 0($a3)
L80034734:
  sw $s6, 4($a3)
L80034738:
  sw $s7, 8($a3)
L8003473c:
  sw $t8, 12($a3)
L80034740:
  addiu $a2, $a2, 16
L80034744:
  bne $a2, $s0, L80034720
L80034748:
  addiu $a3, $a3, 16
L8003474c:
  lui $a1, 0x5555
L80034750:
  ori $a1, $a1, 0x5556
L80034754:
  lw $s5, 0($a2)
L80034758:
  lw $s6, 4($a2)
L8003475c:
  sw $s5, 0($a3)
L80034760:
  sw $s6, 4($a3)
L80034764:
  lw $a0, 16($t1)
L80034768:
  lw $v0, 20($t1)
L8003476c:
  lw $v1, 24($t1)
L80034770:
  addu $a0, $a0, $v0
L80034774:
  addu $a0, $a0, $v1
L80034778:
  mult $a0, $a1
L8003477c:
  sra $a0, $a0, 0x1f
L80034780:
  lw $v0, 4($t9)
L80034784:
  lw $v1, 0($t5)
L80034788:
  lw $v0, 4($v0)
L8003478c:
  mfhi $s5
L80034790:
  subu $a0, $s5, $a0
L80034794:
  sra $a0, $a0, 0x4
L80034798:
  sll $a1, $a0, 0x2
L8003479c:
  addu $v0, $a1, $v0
L800347a0:
  lw $v0, 0($v0)
L800347a4:
  and $v1, $v1, $s4
L800347a8:
  and $v0, $v0, $t3
L800347ac:
  or $v1, $v1, $v0
L800347b0:
  sw $v1, 0($t5)
L800347b4:
  lw $v0, 4($t9)
L800347b8:
  sll $zero, $zero, 0x0
L800347bc:
  lw $v0, 4($v0)
L800347c0:
  and $v1, $t5, $t3
L800347c4:
  sw $a0, 16($sp)
L800347c8:
  addu $a1, $a1, $v0
L800347cc:
  lw $v0, 0($a1)
L800347d0:
  addiu $t5, $t5, 40
L800347d4:
  and $v0, $v0, $s4
L800347d8:
  or $v0, $v0, $v1
L800347dc:
  sw $v0, 0($a1)
L800347e0:
  addiu $t2, $t2, 24
L800347e4:
  addiu $s2, $s2, -1
L800347e8:
  addiu $v0, $zero, -1
L800347ec:
  bne $s2, $v0, L80034514
L800347f0:
  addiu $t6, $t6, 24
L800347f4:
  lw $s6, 28($sp)
L800347f8:
  lui $at, 0x8010
L800347fc:
  sw $t5, -7616($at)
L80034800:
  addiu $v0, $s6, 8
L80034804:
  lw $ra, 72($sp)
L80034808:
  lw $s7, 68($sp)
L8003480c:
  lw $s6, 64($sp)
L80034810:
  lw $s5, 60($sp)
L80034814:
  lw $s4, 56($sp)
L80034818:
  lw $s3, 52($sp)
L8003481c:
  lw $s2, 48($sp)
L80034820:
  lw $s1, 44($sp)
L80034824:
  lw $s0, 40($sp)
L80034828:
  jr $ra
L8003482c:
  addiu $sp, $sp, 80
L80034830:
  addiu $sp, $sp, -88
L80034834:
  sw $s6, 72($sp)
L80034838:
  addu $s6, $a0, $zero
L8003483c:
  lw $a0, 1028($gp)
L80034840:
  sw $ra, 84($sp)
L80034844:
  sw $fp, 80($sp)
L80034848:
  sw $s7, 76($sp)
L8003484c:
  sw $s5, 68($sp)
L80034850:
  sw $s4, 64($sp)
L80034854:
  sw $s3, 60($sp)
L80034858:
  sw $s2, 56($sp)
L8003485c:
  sw $s1, 52($sp)
L80034860:
  andi $v0, $a0, 0x8
L80034864:
  beq $v0, $zero, L8003487c
L80034868:
  sw $s0, 48($sp)
L8003486c:
  jal 0x80061a84
L80034870:
  addu $a0, $s6, $zero
L80034874:
  j L80035568
L80034878:
  sll $zero, $zero, 0x0
L8003487c:
  lui $a1, 0xff
L80034880:
  ori $a1, $a1, 0xffff
L80034884:
  lui $s4, 0x1f80
L80034888:
  ori $s4, $s4, 0x3c0
L8003488c:
  lui $t2, 0x1f80
L80034890:
  sw $s4, 36($sp)
L80034894:
  lw $s5, 0($s6)
L80034898:
  sll $zero, $zero, 0x0
L8003489c:
  sw $s5, 20($sp)
L800348a0:
  lw $t7, 16($s6)
L800348a4:
  lw $v0, 4($s5)
L800348a8:
  lhu $s2, 2($s5)
L800348ac:
  lw $v1, 20($s6)
L800348b0:
  lw $s1, 24($s6)
L800348b4:
  lw $t9, 28($s6)
L800348b8:
  and $v0, $v0, $a1
L800348bc:
  sll $v0, $v0, 0x2
L800348c0:
  addu $s3, $v1, $v0
L800348c4:
  andi $v0, $a0, 0x4
L800348c8:
  beq $v0, $zero, L800349e4
L800348cc:
  ori $t2, $t2, 0x3e0
L800348d0:
  addiu $s2, $s2, -1
L800348d4:
  addiu $v0, $zero, -1
L800348d8:
  beq $s2, $v0, L800349d8
L800348dc:
  addiu $s0, $s3, 26
L800348e0:
  lhu $v0, -12($s0)
L800348e4:
  lhu $v1, -8($s0)
L800348e8:
  sll $v0, $v0, 0x3
L800348ec:
  addu $t2, $v0, $s1
L800348f0:
  sll $v1, $v1, 0x3
L800348f4:
  addu $t1, $v1, $s1
L800348f8:
  lh $a0, 0($t2)
L800348fc:
  lh $v0, 0($t1)
L80034900:
  lhu $v1, -4($s0)
L80034904:
  addu $a0, $a0, $v0
L80034908:
  sll $v1, $v1, 0x3
L8003490c:
  lhu $v0, 0($s0)
L80034910:
  addu $t0, $v1, $s1
L80034914:
  sll $v0, $v0, 0x3
L80034918:
  addu $a3, $v0, $s1
L8003491c:
  lh $v0, 0($t0)
L80034920:
  lh $v1, 0($a3)
L80034924:
  addu $a0, $a0, $v0
L80034928:
  addu $a1, $a0, $v1
L8003492c:
  bgez $a1, L80034938
L80034930:
  sll $zero, $zero, 0x0
L80034934:
  addiu $a1, $a1, 3
L80034938:
  lh $v1, 2($t2)
L8003493c:
  lh $v0, 2($t1)
L80034940:
  sll $zero, $zero, 0x0
L80034944:
  addu $v1, $v1, $v0
L80034948:
  lh $v0, 2($t0)
L8003494c:
  lh $a0, 2($a3)
L80034950:
  addu $v1, $v1, $v0
L80034954:
  addu $a2, $v1, $a0
L80034958:
  sra $v0, $a1, 0x2
L8003495c:
  bgez $v0, L80034968
L80034960:
  addu $t3, $v0, $zero
L80034964:
  subu $t3, $zero, $t3
L80034968:
  bgez $a2, L80034974
L8003496c:
  sll $zero, $zero, 0x0
L80034970:
  addiu $a2, $a2, 3
L80034974:
  lh $v1, 4($t2)
L80034978:
  lh $v0, 4($t1)
L8003497c:
  sll $zero, $zero, 0x0
L80034980:
  addu $v1, $v1, $v0
L80034984:
  lh $v0, 4($t0)
L80034988:
  lh $a0, 4($a3)
L8003498c:
  addu $v1, $v1, $v0
L80034990:
  addu $v1, $v1, $a0
L80034994:
  sra $v0, $a2, 0x2
L80034998:
  bgez $v0, L800349a4
L8003499c:
  addu $a1, $v0, $zero
L800349a0:
  subu $a1, $zero, $a1
L800349a4:
  bgez $v1, L800349b4
L800349a8:
  sra $a2, $v1, 0x2
L800349ac:
  addiu $v1, $v1, 3
L800349b0:
  sra $a2, $v1, 0x2
L800349b4:
  bgez $a2, L800349c0
L800349b8:
  sll $zero, $zero, 0x0
L800349bc:
  subu $a2, $zero, $a2
L800349c0:
  jal L80033cf8
L800349c4:
  addu $a0, $t3, $zero
L800349c8:
  addiu $s2, $s2, -1
L800349cc:
  addiu $v0, $zero, -1
L800349d0:
  bne $s2, $v0, L800348e0
L800349d4:
  addiu $s0, $s0, 28
L800349d8:
  lw $s7, 20($sp)
L800349dc:
  j L80035568
L800349e0:
  addiu $v0, $s7, 8
L800349e4:
  andi $v0, $a0, 0x3
L800349e8:
  beq $v0, $zero, L800351b0
L800349ec:
  lui $t6, 0x1f80
L800349f0:
  ori $t6, $t6, 0x380
L800349f4:
  lui $t5, 0x1f80
L800349f8:
  lui $t8, 0x1f80
L800349fc:
  ori $t8, $t8, 0x3d0
L80034a00:
  lw $v0, 1016($gp)
L80034a04:
  lw $s4, 36($sp)
L80034a08:
  addiu $s2, $s2, -1
L80034a0c:
  sw $t8, 32($sp)
L80034a10:
  sw $a1, 0($s4)
L80034a14:
  sw $v0, 0($t8)
L80034a18:
  addiu $v0, $zero, -1
L80034a1c:
  beq $s2, $v0, L80035558
L80034a20:
  ori $t5, $t5, 0x380
L80034a24:
  lui $fp, 0x1f80
L80034a28:
  ori $fp, $fp, 0x3e8
L80034a2c:
  lui $s5, 0xff
L80034a30:
  ori $s5, $s5, 0xffff
L80034a34:
  lui $s7, 0x1f80
L80034a38:
  ori $s7, $s7, 0x3a0
L80034a3c:
  addiu $t3, $s3, 20
L80034a40:
  addiu $s0, $t7, 7
L80034a44:
  sw $s5, 40($sp)
L80034a48:
  sw $s7, 24($sp)
L80034a4c:
  lw $v0, 1028($gp)
L80034a50:
  sll $zero, $zero, 0x0
L80034a54:
  andi $v0, $v0, 0x2
L80034a58:
  beq $v0, $zero, L80034de8
L80034a5c:
  sll $zero, $zero, 0x0
L80034a60:
  lw $v0, 1032($gp)
L80034a64:
  lw $a0, 1036($gp)
L80034a68:
  lh $v1, 6($v0)
L80034a6c:
  addiu $v0, $v0, 8
L80034a70:
  sw $v0, 1032($gp)
L80034a74:
  sw $v1, 16($sp)
L80034a78:
  sltu $v1, $v1, $a0
L80034a7c:
  beq $v1, $zero, L80034de8
L80034a80:
  sll $zero, $zero, 0x0
L80034a84:
  lhu $v0, -6($t3)
L80034a88:
  sll $zero, $zero, 0x0
L80034a8c:
  sll $v0, $v0, 0x3
L80034a90:
  addu $v0, $s1, $v0
L80034a94:
  .word 0xc8400000
L80034a98:
  .word 0xc8410004
L80034a9c:
  sll $zero, $zero, 0x0
L80034aa0:
  sll $zero, $zero, 0x0
L80034aa4:
  .word 0x4a180001
L80034aa8:
  addiu $v0, $t5, 8
L80034aac:
  .word 0xe84e0000
L80034ab0:
  .word 0x484cf800
L80034ab4:
  sll $zero, $zero, 0x0
L80034ab8:
  sw $t4, 0($t2)
L80034abc:
  lhu $v0, -10($t3)
L80034ac0:
  sll $zero, $zero, 0x0
L80034ac4:
  sll $v0, $v0, 0x3
L80034ac8:
  addu $v0, $t9, $v0
L80034acc:
  .word 0xc8400000
L80034ad0:
  .word 0xc8410004
L80034ad4:
  lw $t8, 32($sp)
L80034ad8:
  sll $zero, $zero, 0x0
L80034adc:
  .word 0xcb060000
L80034ae0:
  sll $zero, $zero, 0x0
L80034ae4:
  sll $zero, $zero, 0x0
L80034ae8:
  .word 0x4ae80413
L80034aec:
  addiu $v0, $t5, 4
L80034af0:
  .word 0xe8560000
L80034af4:
  addiu $v0, $t2, 16
L80034af8:
  .word 0x480c9800
L80034afc:
  sll $zero, $zero, 0x0
L80034b00:
  sra $t4, $t4, 0x2
L80034b04:
  sw $t4, 0($v0)
L80034b08:
  lhu $v0, -2($t3)
L80034b0c:
  sll $zero, $zero, 0x0
L80034b10:
  sll $v0, $v0, 0x3
L80034b14:
  addu $v0, $s1, $v0
L80034b18:
  .word 0xc8400000
L80034b1c:
  .word 0xc8410004
L80034b20:
  sll $zero, $zero, 0x0
L80034b24:
  sll $zero, $zero, 0x0
L80034b28:
  .word 0x4a180001
L80034b2c:
  addiu $v0, $t5, 20
L80034b30:
  .word 0xe84e0000
L80034b34:
  addiu $v0, $t2, 4
L80034b38:
  .word 0x484cf800
L80034b3c:
  sll $zero, $zero, 0x0
L80034b40:
  sw $t4, 0($v0)
L80034b44:
  lhu $v0, -4($t3)
L80034b48:
  sll $zero, $zero, 0x0
L80034b4c:
  sll $v0, $v0, 0x3
L80034b50:
  addu $v0, $t9, $v0
L80034b54:
  .word 0xc8400000
L80034b58:
  .word 0xc8410004
L80034b5c:
  .word 0xcb060000
L80034b60:
  sll $zero, $zero, 0x0
L80034b64:
  sll $zero, $zero, 0x0
L80034b68:
  .word 0x4ae80413
L80034b6c:
  addiu $v0, $t5, 16
L80034b70:
  .word 0xe8560000
L80034b74:
  addiu $v0, $t2, 20
L80034b78:
  .word 0x480c9800
L80034b7c:
  sll $zero, $zero, 0x0
L80034b80:
  sra $t4, $t4, 0x2
L80034b84:
  sw $t4, 0($v0)
L80034b88:
  lhu $v0, 2($t3)
L80034b8c:
  sll $zero, $zero, 0x0
L80034b90:
  sll $v0, $v0, 0x3
L80034b94:
  addu $v0, $s1, $v0
L80034b98:
  .word 0xc8400000
L80034b9c:
  .word 0xc8410004
L80034ba0:
  sll $zero, $zero, 0x0
L80034ba4:
  sll $zero, $zero, 0x0
L80034ba8:
  .word 0x4a180001
L80034bac:
  addiu $v0, $t5, 32
L80034bb0:
  .word 0xe84e0000
L80034bb4:
  .word 0x484cf800
L80034bb8:
  sll $zero, $zero, 0x0
L80034bbc:
  sw $t4, 0($fp)
L80034bc0:
  lhu $v0, 0($t3)
L80034bc4:
  sll $zero, $zero, 0x0
L80034bc8:
  sll $v0, $v0, 0x3
L80034bcc:
  addu $v0, $t9, $v0
L80034bd0:
  .word 0xc8400000
L80034bd4:
  .word 0xc8410004
L80034bd8:
  .word 0xcb060000
L80034bdc:
  sll $zero, $zero, 0x0
L80034be0:
  sll $zero, $zero, 0x0
L80034be4:
  .word 0x4ae80413
L80034be8:
  addiu $v0, $t5, 28
L80034bec:
  .word 0xe8560000
L80034bf0:
  addiu $v0, $t2, 24
L80034bf4:
  .word 0x480c9800
L80034bf8:
  sll $zero, $zero, 0x0
L80034bfc:
  sra $t4, $t4, 0x2
L80034c00:
  sw $t4, 0($v0)
L80034c04:
  lw $s4, 8($t5)
L80034c08:
  lw $s5, 20($t5)
L80034c0c:
  lw $s7, 32($t5)
L80034c10:
  .word 0x48946000
L80034c14:
  .word 0x48977000
L80034c18:
  .word 0x48956800
L80034c1c:
  sll $zero, $zero, 0x0
L80034c20:
  sll $zero, $zero, 0x0
L80034c24:
  .word 0x4b400006
L80034c28:
  addiu $v0, $sp, 16
L80034c2c:
  .word 0xe8580000
L80034c30:
  lw $v0, 16($sp)
L80034c34:
  sll $zero, $zero, 0x0
L80034c38:
  blez $v0, L80035194
L80034c3c:
  sll $zero, $zero, 0x0
L80034c40:
  lw $v0, 0($t2)
L80034c44:
  lw $v1, 4($t2)
L80034c48:
  lw $a0, 8($t2)
L80034c4c:
  or $v0, $v0, $v1
L80034c50:
  or $v0, $v0, $a0
L80034c54:
  bltz $v0, L80035194
L80034c58:
  sll $zero, $zero, 0x0
L80034c5c:
  lhu $v0, 6($t3)
L80034c60:
  sll $zero, $zero, 0x0
L80034c64:
  sll $v0, $v0, 0x3
L80034c68:
  addu $v0, $s1, $v0
L80034c6c:
  .word 0xc8400000
L80034c70:
  .word 0xc8410004
L80034c74:
  sll $zero, $zero, 0x0
L80034c78:
  sll $zero, $zero, 0x0
L80034c7c:
  .word 0x4a180001
L80034c80:
  addiu $v0, $t5, 44
L80034c84:
  .word 0xe84e0000
L80034c88:
  addiu $v0, $t2, 12
L80034c8c:
  .word 0x484cf800
L80034c90:
  sll $zero, $zero, 0x0
L80034c94:
  sw $t4, 0($v0)
L80034c98:
  lhu $v0, 4($t3)
L80034c9c:
  sll $zero, $zero, 0x0
L80034ca0:
  sll $v0, $v0, 0x3
L80034ca4:
  addu $v0, $t9, $v0
L80034ca8:
  .word 0xc8400000
L80034cac:
  .word 0xc8410004
L80034cb0:
  .word 0xcb060000
L80034cb4:
  sll $zero, $zero, 0x0
L80034cb8:
  sll $zero, $zero, 0x0
L80034cbc:
  .word 0x4ae80413
L80034cc0:
  addiu $v0, $t5, 40
L80034cc4:
  .word 0xe8560000
L80034cc8:
  addiu $v0, $t2, 28
L80034ccc:
  .word 0x480c9800
L80034cd0:
  sll $zero, $zero, 0x0
L80034cd4:
  sra $t4, $t4, 0x2
L80034cd8:
  sw $t4, 0($v0)
L80034cdc:
  addu $t0, $t7, $zero
L80034ce0:
  addiu $v0, $zero, 12
L80034ce4:
  sb $v0, 3($t5)
L80034ce8:
  addiu $v0, $zero, 60
L80034cec:
  sb $v0, 7($t5)
L80034cf0:
  lhu $v1, 0($s3)
L80034cf4:
  lhu $a0, -16($t3)
L80034cf8:
  lhu $a1, -12($t3)
L80034cfc:
  lhu $a2, -8($t3)
L80034d00:
  lhu $v0, -14($t3)
L80034d04:
  addu $a3, $t5, $zero
L80034d08:
  sh $v0, 26($t5)
L80034d0c:
  lhu $v0, -18($t3)
L80034d10:
  addiu $t1, $a3, 48
L80034d14:
  sh $v1, 12($t5)
L80034d18:
  sh $a0, 24($t5)
L80034d1c:
  sh $a1, 36($t5)
L80034d20:
  sh $a2, 48($t5)
L80034d24:
  sh $v0, 14($t5)
L80034d28:
  lw $t8, 0($a3)
L80034d2c:
  lw $s4, 4($a3)
L80034d30:
  lw $s5, 8($a3)
L80034d34:
  lw $s7, 12($a3)
L80034d38:
  sw $t8, 0($t0)
L80034d3c:
  sw $s4, 4($t0)
L80034d40:
  sw $s5, 8($t0)
L80034d44:
  sw $s7, 12($t0)
L80034d48:
  addiu $a3, $a3, 16
L80034d4c:
  bne $a3, $t1, L80034d28
L80034d50:
  addiu $t0, $t0, 16
L80034d54:
  lw $t8, 0($a3)
L80034d58:
  sll $zero, $zero, 0x0
L80034d5c:
  sw $t8, 0($t0)
L80034d60:
  lw $v1, 16($t2)
L80034d64:
  lw $v0, 20($t2)
L80034d68:
  sll $zero, $zero, 0x0
L80034d6c:
  addu $v1, $v1, $v0
L80034d70:
  lw $v0, 24($t2)
L80034d74:
  lw $a0, 28($t2)
L80034d78:
  addu $v1, $v1, $v0
L80034d7c:
  addu $v1, $v1, $a0
L80034d80:
  bgez $v1, L80034d90
L80034d84:
  sra $a1, $v1, 0x6
L80034d88:
  addiu $v1, $v1, 3
L80034d8c:
  sra $a1, $v1, 0x6
L80034d90:
  sll $a0, $a1, 0x2
L80034d94:
  lui $t8, 0xff00
L80034d98:
  lw $v0, 4($s6)
L80034d9c:
  lw $v1, 0($t7)
L80034da0:
  lw $v0, 4($v0)
L80034da4:
  lw $s4, 40($sp)
L80034da8:
  addu $v0, $a0, $v0
L80034dac:
  lw $v0, 0($v0)
L80034db0:
  and $v1, $v1, $t8
L80034db4:
  and $v0, $v0, $s4
L80034db8:
  or $v1, $v1, $v0
L80034dbc:
  sw $v1, 0($t7)
L80034dc0:
  lw $v0, 4($s6)
L80034dc4:
  addiu $s0, $s0, 52
L80034dc8:
  lw $v0, 4($v0)
L80034dcc:
  and $v1, $t7, $s4
L80034dd0:
  sw $a1, 16($sp)
L80034dd4:
  addu $a0, $a0, $v0
L80034dd8:
  lw $v0, 0($a0)
L80034ddc:
  addiu $t7, $t7, 52
L80034de0:
  j L8003518c
L80034de4:
  and $v0, $v0, $t8
L80034de8:
  lhu $v0, -6($t3)
L80034dec:
  sll $zero, $zero, 0x0
L80034df0:
  sll $v0, $v0, 0x3
L80034df4:
  addu $v0, $s1, $v0
L80034df8:
  .word 0xc8400000
L80034dfc:
  .word 0xc8410004
L80034e00:
  sll $zero, $zero, 0x0
L80034e04:
  sll $zero, $zero, 0x0
L80034e08:
  .word 0x4a180001
L80034e0c:
  addiu $v0, $t6, 8
L80034e10:
  .word 0xe84e0000
L80034e14:
  .word 0x484cf800
L80034e18:
  sll $zero, $zero, 0x0
L80034e1c:
  sw $t4, 0($t2)
L80034e20:
  lhu $v0, -10($t3)
L80034e24:
  sll $zero, $zero, 0x0
L80034e28:
  sll $v0, $v0, 0x3
L80034e2c:
  addu $v0, $t9, $v0
L80034e30:
  .word 0xc8400000
L80034e34:
  .word 0xc8410004
L80034e38:
  lw $s5, 36($sp)
L80034e3c:
  sll $zero, $zero, 0x0
L80034e40:
  .word 0xcaa60000
L80034e44:
  sll $zero, $zero, 0x0
L80034e48:
  sll $zero, $zero, 0x0
L80034e4c:
  .word 0x4ae80413
L80034e50:
  addiu $v0, $t6, 4
L80034e54:
  .word 0xe8560000
L80034e58:
  addiu $v0, $t2, 16
L80034e5c:
  .word 0x480c9800
L80034e60:
  sll $zero, $zero, 0x0
L80034e64:
  sra $t4, $t4, 0x2
L80034e68:
  sw $t4, 0($v0)
L80034e6c:
  lhu $v0, -2($t3)
L80034e70:
  sll $zero, $zero, 0x0
L80034e74:
  sll $v0, $v0, 0x3
L80034e78:
  addu $v0, $s1, $v0
L80034e7c:
  .word 0xc8400000
L80034e80:
  .word 0xc8410004
L80034e84:
  sll $zero, $zero, 0x0
L80034e88:
  sll $zero, $zero, 0x0
L80034e8c:
  .word 0x4a180001
L80034e90:
  addiu $v0, $t6, 16
L80034e94:
  .word 0xe84e0000
L80034e98:
  .word 0x484cf800
L80034e9c:
  sll $zero, $zero, 0x0
L80034ea0:
  sw $t4, 0($fp)
L80034ea4:
  lhu $v0, -4($t3)
L80034ea8:
  sll $zero, $zero, 0x0
L80034eac:
  sll $v0, $v0, 0x3
L80034eb0:
  addu $v0, $t9, $v0
L80034eb4:
  .word 0xc8400000
L80034eb8:
  .word 0xc8410004
L80034ebc:
  .word 0xcaa60000
L80034ec0:
  sll $zero, $zero, 0x0
L80034ec4:
  sll $zero, $zero, 0x0
L80034ec8:
  .word 0x4ae80413
L80034ecc:
  addiu $v0, $t6, 12
L80034ed0:
  .word 0xe8560000
L80034ed4:
  addiu $v0, $t2, 20
L80034ed8:
  .word 0x480c9800
L80034edc:
  sll $zero, $zero, 0x0
L80034ee0:
  sra $t4, $t4, 0x2
L80034ee4:
  sw $t4, 0($v0)
L80034ee8:
  lhu $v0, 6($t3)
L80034eec:
  sll $zero, $zero, 0x0
L80034ef0:
  sll $v0, $v0, 0x3
L80034ef4:
  addu $v0, $s1, $v0
L80034ef8:
  .word 0xc8400000
L80034efc:
  .word 0xc8410004
L80034f00:
  sll $zero, $zero, 0x0
L80034f04:
  sll $zero, $zero, 0x0
L80034f08:
  .word 0x4a180001
L80034f0c:
  addiu $v0, $t6, 24
L80034f10:
  .word 0xe84e0000
L80034f14:
  .word 0x484cf800
L80034f18:
  sll $zero, $zero, 0x0
L80034f1c:
  sw $t4, 0($fp)
L80034f20:
  lhu $v0, 4($t3)
L80034f24:
  sll $zero, $zero, 0x0
L80034f28:
  sll $v0, $v0, 0x3
L80034f2c:
  addu $v0, $t9, $v0
L80034f30:
  .word 0xc8400000
L80034f34:
  .word 0xc8410004
L80034f38:
  .word 0xcaa60000
L80034f3c:
  sll $zero, $zero, 0x0
L80034f40:
  sll $zero, $zero, 0x0
L80034f44:
  .word 0x4ae80413
L80034f48:
  addiu $v0, $t6, 20
L80034f4c:
  .word 0xe8560000
L80034f50:
  addiu $v0, $t2, 24
L80034f54:
  .word 0x480c9800
L80034f58:
  sll $zero, $zero, 0x0
L80034f5c:
  sra $t4, $t4, 0x2
L80034f60:
  sw $t4, 0($v0)
L80034f64:
  lhu $v0, 2($t3)
L80034f68:
  sll $zero, $zero, 0x0
L80034f6c:
  sll $v0, $v0, 0x3
L80034f70:
  addu $v0, $s1, $v0
L80034f74:
  .word 0xc8400000
L80034f78:
  .word 0xc8410004
L80034f7c:
  sll $zero, $zero, 0x0
L80034f80:
  sll $zero, $zero, 0x0
L80034f84:
  .word 0x4a180001
L80034f88:
  lw $s7, 24($sp)
L80034f8c:
  sll $zero, $zero, 0x0
L80034f90:
  .word 0xeaee0000
L80034f94:
  addiu $v0, $t2, 12
L80034f98:
  .word 0x484cf800
L80034f9c:
  sll $zero, $zero, 0x0
L80034fa0:
  sw $t4, 0($v0)
L80034fa4:
  lhu $v0, 0($t3)
L80034fa8:
  sll $zero, $zero, 0x0
L80034fac:
  sll $v0, $v0, 0x3
L80034fb0:
  addu $v0, $t9, $v0
L80034fb4:
  .word 0xc8400000
L80034fb8:
  .word 0xc8410004
L80034fbc:
  .word 0xcaa60000
L80034fc0:
  sll $zero, $zero, 0x0
L80034fc4:
  sll $zero, $zero, 0x0
L80034fc8:
  .word 0x4ae80413
L80034fcc:
  addiu $v0, $t6, 28
L80034fd0:
  .word 0xe8560000
L80034fd4:
  addiu $v0, $t2, 28
L80034fd8:
  .word 0x480c9800
L80034fdc:
  sll $zero, $zero, 0x0
L80034fe0:
  sra $t4, $t4, 0x2
L80034fe4:
  sw $t4, 0($v0)
L80034fe8:
  lw $v0, 0($t2)
L80034fec:
  lw $v1, 4($t2)
L80034ff0:
  sll $zero, $zero, 0x0
L80034ff4:
  or $v0, $v0, $v1
L80034ff8:
  lw $v1, 8($t2)
L80034ffc:
  lw $a0, 12($t2)
L80035000:
  or $v0, $v0, $v1
L80035004:
  or $v0, $v0, $a0
L80035008:
  bltz $v0, L80035194
L8003500c:
  lui $v0, 0x5555
L80035010:
  ori $v0, $v0, 0x5555
L80035014:
  addu $a1, $t7, $zero
L80035018:
  addu $a0, $t6, $zero
L8003501c:
  addiu $v1, $zero, 9
L80035020:
  sb $v1, 3($t6)
L80035024:
  addiu $v1, $zero, 92
L80035028:
  sb $v1, 7($t6)
L8003502c:
  sw $v0, 36($t6)
L80035030:
  sb $zero, 23($t6)
L80035034:
  sb $zero, 31($t6)
L80035038:
  lw $t8, 0($a0)
L8003503c:
  lw $s4, 4($a0)
L80035040:
  lw $s5, 8($a0)
L80035044:
  lw $s7, 12($a0)
L80035048:
  sw $t8, 0($a1)
L8003504c:
  sw $s4, 4($a1)
L80035050:
  sw $s5, 8($a1)
L80035054:
  sw $s7, 12($a1)
L80035058:
  addiu $a0, $a0, 16
L8003505c:
  lw $t8, 24($sp)
L80035060:
  sll $zero, $zero, 0x0
L80035064:
  bne $a0, $t8, L80035038
L80035068:
  addiu $a1, $a1, 16
L8003506c:
  lw $s4, 0($a0)
L80035070:
  lw $s5, 4($a0)
L80035074:
  sw $s4, 0($a1)
L80035078:
  sw $s5, 4($a1)
L8003507c:
  lw $v1, 16($t2)
L80035080:
  lw $v0, 20($t2)
L80035084:
  sll $zero, $zero, 0x0
L80035088:
  addu $v1, $v1, $v0
L8003508c:
  lw $v0, 24($t2)
L80035090:
  lw $a0, 28($t2)
L80035094:
  addu $v1, $v1, $v0
L80035098:
  addu $v1, $v1, $a0
L8003509c:
  bgez $v1, L800350ac
L800350a0:
  sra $a0, $v1, 0x6
L800350a4:
  addiu $v1, $v1, 3
L800350a8:
  sra $a0, $v1, 0x6
L800350ac:
  sll $a1, $a0, 0x2
L800350b0:
  lui $s4, 0xff00
L800350b4:
  lw $v0, 4($s6)
L800350b8:
  lw $v1, 0($t7)
L800350bc:
  lw $v0, 4($v0)
L800350c0:
  lw $s5, 40($sp)
L800350c4:
  addu $v0, $a1, $v0
L800350c8:
  lw $v0, 0($v0)
L800350cc:
  and $v1, $v1, $s4
L800350d0:
  and $v0, $v0, $s5
L800350d4:
  or $v1, $v1, $v0
L800350d8:
  sw $v1, 0($t7)
L800350dc:
  lw $v0, 4($s6)
L800350e0:
  sll $zero, $zero, 0x0
L800350e4:
  lw $v0, 4($v0)
L800350e8:
  addiu $s0, $s0, 40
L800350ec:
  addu $a1, $a1, $v0
L800350f0:
  lw $v0, 0($a1)
L800350f4:
  and $v1, $t7, $s5
L800350f8:
  sw $a0, 16($sp)
L800350fc:
  lw $a0, 8($t6)
L80035100:
  and $v0, $v0, $s4
L80035104:
  or $v0, $v0, $v1
L80035108:
  sw $v0, 0($a1)
L8003510c:
  sw $a0, 1($s0)
L80035110:
  lw $v0, 32($t6)
L80035114:
  sll $zero, $zero, 0x0
L80035118:
  sw $v0, 9($s0)
L8003511c:
  lw $v0, 4($t6)
L80035120:
  addiu $t7, $t7, 40
L80035124:
  sw $v0, -3($s0)
L80035128:
  lw $v1, 28($t6)
L8003512c:
  addiu $v0, $zero, 4
L80035130:
  sb $v0, -4($s0)
L80035134:
  addiu $v0, $zero, 80
L80035138:
  sb $v0, 0($s0)
L8003513c:
  sw $v1, 5($s0)
L80035140:
  lw $v0, 4($s6)
L80035144:
  lw $a0, 16($sp)
L80035148:
  lw $v1, 0($t7)
L8003514c:
  lw $v0, 4($v0)
L80035150:
  sll $a0, $a0, 0x2
L80035154:
  addu $v0, $a0, $v0
L80035158:
  lw $v0, 0($v0)
L8003515c:
  and $v1, $v1, $s4
L80035160:
  and $v0, $v0, $s5
L80035164:
  or $v1, $v1, $v0
L80035168:
  sw $v1, 0($t7)
L8003516c:
  lw $v0, 4($s6)
L80035170:
  addiu $s0, $s0, 20
L80035174:
  lw $v0, 4($v0)
L80035178:
  and $v1, $t7, $s5
L8003517c:
  addu $a0, $a0, $v0
L80035180:
  lw $v0, 0($a0)
L80035184:
  addiu $t7, $t7, 20
L80035188:
  and $v0, $v0, $s4
L8003518c:
  or $v0, $v0, $v1
L80035190:
  sw $v0, 0($a0)
L80035194:
  addiu $t3, $t3, 28
L80035198:
  addiu $s2, $s2, -1
L8003519c:
  addiu $v0, $zero, -1
L800351a0:
  bne $s2, $v0, L80034a4c
L800351a4:
  addiu $s3, $s3, 28
L800351a8:
  j L80035558
L800351ac:
  sll $zero, $zero, 0x0
L800351b0:
  lui $t0, 0x1f80
L800351b4:
  lw $v0, 1016($gp)
L800351b8:
  lw $s7, 36($sp)
L800351bc:
  addiu $s2, $s2, -1
L800351c0:
  sw $v0, 0($s7)
L800351c4:
  addiu $v0, $zero, -1
L800351c8:
  beq $s2, $v0, L80035558
L800351cc:
  ori $t0, $t0, 0x380
L800351d0:
  lui $t5, 0xff
L800351d4:
  ori $t5, $t5, 0xffff
L800351d8:
  lui $t6, 0xff00
L800351dc:
  addiu $t3, $s3, 2
L800351e0:
  lhu $v0, 12($t3)
L800351e4:
  sll $zero, $zero, 0x0
L800351e8:
  sll $v0, $v0, 0x3
L800351ec:
  addu $v0, $s1, $v0
L800351f0:
  .word 0xc8400000
L800351f4:
  .word 0xc8410004
L800351f8:
  sll $zero, $zero, 0x0
L800351fc:
  sll $zero, $zero, 0x0
L80035200:
  .word 0x4a180001
L80035204:
  addiu $v0, $t0, 8
L80035208:
  .word 0xe84e0000
L8003520c:
  .word 0x484cf800
L80035210:
  sll $zero, $zero, 0x0
L80035214:
  sw $t4, 0($t2)
L80035218:
  lhu $v0, 8($t3)
L8003521c:
  sll $zero, $zero, 0x0
L80035220:
  sll $v0, $v0, 0x3
L80035224:
  addu $v0, $t9, $v0
L80035228:
  .word 0xc8400000
L8003522c:
  .word 0xc8410004
L80035230:
  lw $t8, 36($sp)
L80035234:
  sll $zero, $zero, 0x0
L80035238:
  .word 0xcb060000
L8003523c:
  sll $zero, $zero, 0x0
L80035240:
  sll $zero, $zero, 0x0
L80035244:
  .word 0x4ae80413
L80035248:
  addiu $v0, $t0, 4
L8003524c:
  .word 0xe8560000
L80035250:
  addiu $v0, $t2, 16
L80035254:
  .word 0x480c9800
L80035258:
  sll $zero, $zero, 0x0
L8003525c:
  sra $t4, $t4, 0x2
L80035260:
  sw $t4, 0($v0)
L80035264:
  lhu $v0, 16($t3)
L80035268:
  sll $zero, $zero, 0x0
L8003526c:
  sll $v0, $v0, 0x3
L80035270:
  addu $v0, $s1, $v0
L80035274:
  .word 0xc8400000
L80035278:
  .word 0xc8410004
L8003527c:
  sll $zero, $zero, 0x0
L80035280:
  sll $zero, $zero, 0x0
L80035284:
  .word 0x4a180001
L80035288:
  addiu $v0, $t0, 20
L8003528c:
  .word 0xe84e0000
L80035290:
  addiu $v0, $t2, 4
L80035294:
  .word 0x484cf800
L80035298:
  sll $zero, $zero, 0x0
L8003529c:
  sw $t4, 0($v0)
L800352a0:
  lhu $v0, 14($t3)
L800352a4:
  sll $zero, $zero, 0x0
L800352a8:
  sll $v0, $v0, 0x3
L800352ac:
  addu $v0, $t9, $v0
L800352b0:
  .word 0xc8400000
L800352b4:
  .word 0xc8410004
L800352b8:
  .word 0xcb060000
L800352bc:
  sll $zero, $zero, 0x0
L800352c0:
  sll $zero, $zero, 0x0
L800352c4:
  .word 0x4ae80413
L800352c8:
  addiu $v0, $t0, 16
L800352cc:
  .word 0xe8560000
L800352d0:
  addiu $v0, $t2, 20
L800352d4:
  .word 0x480c9800
L800352d8:
  sll $zero, $zero, 0x0
L800352dc:
  sra $t4, $t4, 0x2
L800352e0:
  sw $t4, 0($v0)
L800352e4:
  lhu $v0, 20($t3)
L800352e8:
  sll $zero, $zero, 0x0
L800352ec:
  sll $v0, $v0, 0x3
L800352f0:
  addu $v0, $s1, $v0
L800352f4:
  .word 0xc8400000
L800352f8:
  .word 0xc8410004
L800352fc:
  sll $zero, $zero, 0x0
L80035300:
  sll $zero, $zero, 0x0
L80035304:
  .word 0x4a180001
L80035308:
  addiu $v0, $t0, 32
L8003530c:
  .word 0xe84e0000
L80035310:
  addiu $v0, $t2, 8
L80035314:
  .word 0x484cf800
L80035318:
  sll $zero, $zero, 0x0
L8003531c:
  sw $t4, 0($v0)
L80035320:
  lhu $v0, 18($t3)
L80035324:
  sll $zero, $zero, 0x0
L80035328:
  sll $v0, $v0, 0x3
L8003532c:
  addu $v0, $t9, $v0
L80035330:
  .word 0xc8400000
L80035334:
  .word 0xc8410004
L80035338:
  .word 0xcb060000
L8003533c:
  sll $zero, $zero, 0x0
L80035340:
  sll $zero, $zero, 0x0
L80035344:
  .word 0x4ae80413
L80035348:
  addiu $v0, $t0, 28
L8003534c:
  .word 0xe8560000
L80035350:
  addiu $v0, $t2, 24
L80035354:
  .word 0x480c9800
L80035358:
  sll $zero, $zero, 0x0
L8003535c:
  sra $t4, $t4, 0x2
L80035360:
  sw $t4, 0($v0)
L80035364:
  lw $s4, 8($t0)
L80035368:
  lw $s5, 20($t0)
L8003536c:
  lw $s7, 32($t0)
L80035370:
  .word 0x48946000
L80035374:
  .word 0x48977000
L80035378:
  .word 0x48956800
L8003537c:
  sll $zero, $zero, 0x0
L80035380:
  sll $zero, $zero, 0x0
L80035384:
  .word 0x4b400006
L80035388:
  addiu $v0, $sp, 16
L8003538c:
  .word 0xe8580000
L80035390:
  lw $v0, 16($sp)
L80035394:
  sll $zero, $zero, 0x0
L80035398:
  blez $v0, L80035544
L8003539c:
  sll $zero, $zero, 0x0
L800353a0:
  lw $v0, 0($t2)
L800353a4:
  lw $v1, 4($t2)
L800353a8:
  lw $a0, 8($t2)
L800353ac:
  or $v0, $v0, $v1
L800353b0:
  or $v0, $v0, $a0
L800353b4:
  bltz $v0, L80035544
L800353b8:
  sll $zero, $zero, 0x0
L800353bc:
  lhu $v0, 24($t3)
L800353c0:
  sll $zero, $zero, 0x0
L800353c4:
  sll $v0, $v0, 0x3
L800353c8:
  addu $v0, $s1, $v0
L800353cc:
  .word 0xc8400000
L800353d0:
  .word 0xc8410004
L800353d4:
  sll $zero, $zero, 0x0
L800353d8:
  sll $zero, $zero, 0x0
L800353dc:
  .word 0x4a180001
L800353e0:
  addiu $v0, $t0, 44
L800353e4:
  .word 0xe84e0000
L800353e8:
  addiu $v0, $t2, 12
L800353ec:
  .word 0x484cf800
L800353f0:
  sll $zero, $zero, 0x0
L800353f4:
  sw $t4, 0($v0)
L800353f8:
  lhu $v0, 22($t3)
L800353fc:
  sll $zero, $zero, 0x0
L80035400:
  sll $v0, $v0, 0x3
L80035404:
  addu $v0, $t9, $v0
L80035408:
  .word 0xc8400000
L8003540c:
  .word 0xc8410004
L80035410:
  .word 0xcb060000
L80035414:
  sll $zero, $zero, 0x0
L80035418:
  sll $zero, $zero, 0x0
L8003541c:
  .word 0x4ae80413
L80035420:
  addiu $v0, $t0, 40
L80035424:
  .word 0xe8560000
L80035428:
  addiu $v0, $t2, 28
L8003542c:
  .word 0x480c9800
L80035430:
  sll $zero, $zero, 0x0
L80035434:
  sra $t4, $t4, 0x2
L80035438:
  sw $t4, 0($v0)
L8003543c:
  addu $t1, $t7, $zero
L80035440:
  addiu $v0, $zero, 12
L80035444:
  sb $v0, 3($t0)
L80035448:
  addiu $v0, $zero, 60
L8003544c:
  sb $v0, 7($t0)
L80035450:
  lhu $v1, 0($s3)
L80035454:
  lhu $a0, 2($t3)
L80035458:
  lhu $a1, 6($t3)
L8003545c:
  lhu $a2, 10($t3)
L80035460:
  lhu $v0, 4($t3)
L80035464:
  addu $a3, $t0, $zero
L80035468:
  sh $v0, 26($t0)
L8003546c:
  lhu $v0, 0($t3)
L80035470:
  addiu $t4, $a3, 48
L80035474:
  sh $v1, 12($t0)
L80035478:
  sh $a0, 24($t0)
L8003547c:
  sh $a1, 36($t0)
L80035480:
  sh $a2, 48($t0)
L80035484:
  sh $v0, 14($t0)
L80035488:
  lw $t8, 0($a3)
L8003548c:
  lw $s4, 4($a3)
L80035490:
  lw $s5, 8($a3)
L80035494:
  lw $s7, 12($a3)
L80035498:
  sw $t8, 0($t1)
L8003549c:
  sw $s4, 4($t1)
L800354a0:
  sw $s5, 8($t1)
L800354a4:
  sw $s7, 12($t1)
L800354a8:
  addiu $a3, $a3, 16
L800354ac:
  bne $a3, $t4, L80035488
L800354b0:
  addiu $t1, $t1, 16
L800354b4:
  lw $t8, 0($a3)
L800354b8:
  sll $zero, $zero, 0x0
L800354bc:
  sw $t8, 0($t1)
L800354c0:
  lw $v1, 16($t2)
L800354c4:
  lw $v0, 20($t2)
L800354c8:
  sll $zero, $zero, 0x0
L800354cc:
  addu $v1, $v1, $v0
L800354d0:
  lw $v0, 24($t2)
L800354d4:
  lw $a0, 28($t2)
L800354d8:
  addu $v1, $v1, $v0
L800354dc:
  addu $v1, $v1, $a0
L800354e0:
  bgez $v1, L800354f0
L800354e4:
  sra $a1, $v1, 0x6
L800354e8:
  addiu $v1, $v1, 3
L800354ec:
  sra $a1, $v1, 0x6
L800354f0:
  lw $v0, 4($s6)
L800354f4:
  sll $a0, $a1, 0x2
L800354f8:
  lw $v0, 4($v0)
L800354fc:
  lw $v1, 0($t7)
L80035500:
  addu $v0, $a0, $v0
L80035504:
  lw $v0, 0($v0)
L80035508:
  and $v1, $v1, $t6
L8003550c:
  and $v0, $v0, $t5
L80035510:
  or $v1, $v1, $v0
L80035514:
  sw $v1, 0($t7)
L80035518:
  lw $v0, 4($s6)
L8003551c:
  sll $zero, $zero, 0x0
L80035520:
  lw $v0, 4($v0)
L80035524:
  and $v1, $t7, $t5
L80035528:
  sw $a1, 16($sp)
L8003552c:
  addu $a0, $a0, $v0
L80035530:
  lw $v0, 0($a0)
L80035534:
  addiu $t7, $t7, 52
L80035538:
  and $v0, $v0, $t6
L8003553c:
  or $v0, $v0, $v1
L80035540:
  sw $v0, 0($a0)
L80035544:
  addiu $t3, $t3, 28
L80035548:
  addiu $s2, $s2, -1
L8003554c:
  addiu $v0, $zero, -1
L80035550:
  bne $s2, $v0, L800351e0
L80035554:
  addiu $s3, $s3, 28
L80035558:
  lw $t8, 20($sp)
L8003555c:
  lui $at, 0x8010
L80035560:
  sw $t7, -7616($at)
L80035564:
  addiu $v0, $t8, 8
L80035568:
  lw $ra, 84($sp)
L8003556c:
  lw $fp, 80($sp)
L80035570:
  lw $s7, 76($sp)
L80035574:
  lw $s6, 72($sp)
L80035578:
  lw $s5, 68($sp)
L8003557c:
  lw $s4, 64($sp)
L80035580:
  lw $s3, 60($sp)
L80035584:
  lw $s2, 56($sp)
L80035588:
  lw $s1, 52($sp)
L8003558c:
  lw $s0, 48($sp)
L80035590:
  jr $ra
L80035594:
  addiu $sp, $sp, 88
L80035598:
  lw $v1, 0($a0)
L8003559c:
  lw $a1, 0($a1)
L800355a0:
  sll $zero, $zero, 0x0
L800355a4:
  beq $v1, $a1, L800355bc
L800355a8:
  sltu $v1, $v1, $a1
L800355ac:
  beq $v1, $zero, L800355c0
L800355b0:
  addiu $v0, $zero, 1
L800355b4:
  jr $ra
L800355b8:
  addiu $v0, $zero, -1
L800355bc:
  addu $v0, $zero, $zero
L800355c0:
  jr $ra
L800355c4:
  sll $zero, $zero, 0x0
L800355c8:
  addiu $sp, $sp, -32
L800355cc:
  sw $s0, 16($sp)
L800355d0:
  lw $s0, 1020($gp)
L800355d4:
  lw $a1, 1036($gp)
L800355d8:
  lw $v0, 1028($gp)
L800355dc:
  addiu $v1, $zero, -5
L800355e0:
  sw $ra, 24($sp)
L800355e4:
  sw $s1, 20($sp)
L800355e8:
  and $v0, $v0, $v1
L800355ec:
  sw $v0, 1028($gp)
L800355f0:
  sltiu $v0, $a1, 2
L800355f4:
  sw $a1, 1024($gp)
L800355f8:
  bne $v0, $zero, L80035614
L800355fc:
  addu $s1, $s0, $zero
L80035600:
  lui $a3, 0x8003
L80035604:
  addu $a0, $s0, $zero
L80035608:
  addiu $a2, $zero, 8
L8003560c:
  jal 0x8008e400
L80035610:
  addiu $a3, $a3, 21912
L80035614:
  lw $a0, 1024($gp)
L80035618:
  sll $zero, $zero, 0x0
L8003561c:
  beq $a0, $zero, L80035648
L80035620:
  addu $v1, $zero, $zero
L80035624:
  lh $v0, 4($s0)
L80035628:
  sll $zero, $zero, 0x0
L8003562c:
  sll $v0, $v0, 0x3
L80035630:
  addu $v0, $v0, $s1
L80035634:
  sh $v1, 6($v0)
L80035638:
  addiu $v1, $v1, 1
L8003563c:
  sltu $v0, $v1, $a0
L80035640:
  bne $v0, $zero, L80035624
L80035644:
  addiu $s0, $s0, 8
L80035648:
  lw $v0, 1020($gp)
L8003564c:
  lw $ra, 24($sp)
L80035650:
  lw $s1, 20($sp)
L80035654:
  lw $s0, 16($sp)
L80035658:
  sw $zero, 1036($gp)
L8003565c:
  sw $v0, 1032($gp)
L80035660:
  jr $ra
L80035664:
  addiu $sp, $sp, 32
L80035668:
  lui $v0, 0x80
L8003566c:
  ori $v0, $v0, 0x8080
L80035670:
  sw $a0, 1028($gp)
L80035674:
  sw $v0, 1016($gp)
L80035678:
  jr $ra
L8003567c:
  sll $zero, $zero, 0x0
L80035680:
  lw $v0, 1028($gp)
L80035684:
  sw $zero, 1036($gp)
L80035688:
  sw $a0, 1032($gp)
L8003568c:
  sw $a0, 1020($gp)
L80035690:
  ori $v0, $v0, 0x4
L80035694:
  sw $v0, 1028($gp)
L80035698:
  jr $ra
L8003569c:
  sll $zero, $zero, 0x0
L800356a0:
  srl $v0, $a2, 0x2
L800356a4:
  addiu $v1, $v0, -1
L800356a8:
  bltz $v1, L800356d0
L800356ac:
  sll $v0, $v1, 0x2
L800356b0:
  addu $t0, $v0, $a0
L800356b4:
  addu $a3, $v0, $a1
L800356b8:
  lw $v0, 0($a3)
L800356bc:
  addiu $a3, $a3, -4
L800356c0:
  addiu $v1, $v1, -1
L800356c4:
  sw $v0, 0($t0)
L800356c8:
  bgez $v1, L800356b8
L800356cc:
  addiu $t0, $t0, -4
L800356d0:
  andi $v1, $a2, 0x3
L800356d4:
  addiu $v0, $zero, 1
L800356d8:
  beq $v1, $v0, L80035704
L800356dc:
  srl $v0, $a2, 0x2
L800356e0:
  beq $v1, $zero, L800356f8
L800356e4:
  addiu $v0, $zero, 2
L800356e8:
  beq $v1, $v0, L80035700
L800356ec:
  addiu $v0, $zero, 3
L800356f0:
  beq $v1, $v0, L8003571c
L800356f4:
  srl $v0, $a2, 0x2
L800356f8:
  jr $ra
L800356fc:
  sll $zero, $zero, 0x0
L80035700:
  srl $v0, $a2, 0x2
L80035704:
  sll $v0, $v0, 0x2
L80035708:
  addu $v1, $v0, $a1
L8003570c:
  lw $v1, 0($v1)
L80035710:
  addu $v0, $v0, $a0
L80035714:
  jr $ra
L80035718:
  sw $v1, 0($v0)
L8003571c:
  sll $v0, $v0, 0x2
L80035720:
  addu $v1, $v0, $a1
L80035724:
  lw $v1, 0($v1)
L80035728:
  addu $v0, $v0, $a0
L8003572c:
  sw $v1, 0($v0)
L80035730:
  addu $v0, $a2, $a1
L80035734:
  lbu $v1, -1($v0)
L80035738:
  addu $v0, $a2, $a0
L8003573c:
  sb $v1, -1($v0)
L80035740:
  jr $ra
L80035744:
  sll $zero, $zero, 0x0
L80035748:
  srl $v0, $a2, 0x2
L8003574c:
  addiu $a3, $v0, -1
L80035750:
  andi $a1, $a1, 0xff
L80035754:
  sll $v0, $a1, 0x18
L80035758:
  sll $v1, $a1, 0x10
L8003575c:
  or $v0, $v0, $v1
L80035760:
  sll $v1, $a1, 0x8
L80035764:
  or $v0, $v0, $v1
L80035768:
  bltz $a3, L80035788
L8003576c:
  or $a1, $v0, $a1
L80035770:
  sll $v0, $a3, 0x2
L80035774:
  addu $v0, $v0, $a0
L80035778:
  sw $a1, 0($v0)
L8003577c:
  addiu $a3, $a3, -1
L80035780:
  bgez $a3, L80035778
L80035784:
  addiu $v0, $v0, -4
L80035788:
  andi $v1, $a2, 0x3
L8003578c:
  addiu $v0, $zero, 1
L80035790:
  beq $v1, $v0, L800357bc
L80035794:
  srl $v0, $a2, 0x2
L80035798:
  beq $v1, $zero, L800357b0
L8003579c:
  addiu $v0, $zero, 2
L800357a0:
  beq $v1, $v0, L800357b8
L800357a4:
  addiu $v0, $zero, 3
L800357a8:
  beq $v1, $v0, L800357cc
L800357ac:
  srl $v0, $a2, 0x2
L800357b0:
  jr $ra
L800357b4:
  sll $zero, $zero, 0x0
L800357b8:
  srl $v0, $a2, 0x2
L800357bc:
  sll $v0, $v0, 0x2
L800357c0:
  addu $v0, $v0, $a0
L800357c4:
  jr $ra
L800357c8:
  sw $a1, 0($v0)
L800357cc:
  sll $v0, $v0, 0x2
L800357d0:
  addu $v0, $v0, $a0
L800357d4:
  sw $a1, 0($v0)
L800357d8:
  addu $v0, $a2, $a0
L800357dc:
  sb $a1, -1($v0)
L800357e0:
  jr $ra
L800357e4:
  sll $zero, $zero, 0x0
L800357e8:
  lui $v1, 0x8009
L800357ec:
  addiu $v1, $v1, 3596
L800357f0:
  sll $v0, $a1, 0x2
L800357f4:
  addu $v0, $v0, $v1
L800357f8:
  lw $t0, 0($v0)
L800357fc:
  addiu $a3, $a1, -1
L80035800:
  lui $t1, 0x6666
L80035804:
  ori $t1, $t1, 0x6667
L80035808:
  .word 0x0088001a
L8003580c:
  bne $t0, $zero, L80035818
L80035810:
  sll $zero, $zero, 0x0
L80035814:
  .word 0x0007000d
L80035818:
  addiu $at, $zero, -1
L8003581c:
  bne $t0, $at, L80035830
L80035820:
  lui $at, 0x8000
L80035824:
  bne $a0, $at, L80035830
L80035828:
  sll $zero, $zero, 0x0
L8003582c:
  .word 0x0006000d
L80035830:
  mflo $v1
L80035834:
  sll $zero, $zero, 0x0
L80035838:
  sll $zero, $zero, 0x0
L8003583c:
  mult $t0, $t1
L80035840:
  addu $v0, $a2, $a3
L80035844:
  mfhi $t3
L80035848:
  sb $v1, 0($v0)
L8003584c:
  andi $v0, $v1, 0xff
L80035850:
  mult $v0, $t0
L80035854:
  addiu $a3, $a3, -1
L80035858:
  sra $v1, $t3, 0x2
L8003585c:
  sra $v0, $t0, 0x1f
L80035860:
  subu $t0, $v1, $v0
L80035864:
  mflo $t4
L80035868:
  bgez $a3, L80035808
L8003586c:
  subu $a0, $a0, $t4
L80035870:
  addiu $a3, $a1, -1
L80035874:
  blez $a3, L80035898
L80035878:
  addiu $a0, $zero, 10
L8003587c:
  addu $v1, $a2, $a3
L80035880:
  lbu $v0, 0($v1)
L80035884:
  sll $zero, $zero, 0x0
L80035888:
  bne $v0, $zero, L80035898
L8003588c:
  addiu $a3, $a3, -1
L80035890:
  bgtz $a3, L8003587c
L80035894:
  sb $a0, 0($v1)
L80035898:
  jr $ra
L8003589c:
  sll $zero, $zero, 0x0
L800358a0:
  addiu $sp, $sp, -32
L800358a4:
  sw $s0, 16($sp)
L800358a8:
  addu $s0, $a1, $zero
L800358ac:
  sw $s1, 20($sp)
L800358b0:
  sw $ra, 24($sp)
L800358b4:
  jal L800357e8
L800358b8:
  addu $s1, $a2, $zero
L800358bc:
  addiu $s0, $s0, -1
L800358c0:
  blez $s0, L800358e8
L800358c4:
  addu $v1, $s1, $s0
L800358c8:
  lbu $v0, 0($v1)
L800358cc:
  sll $zero, $zero, 0x0
L800358d0:
  sltiu $v0, $v0, 10
L800358d4:
  bne $v0, $zero, L800358c0
L800358d8:
  addiu $s0, $s0, -1
L800358dc:
  addiu $s0, $s0, 1
L800358e0:
  j L800358bc
L800358e4:
  sb $zero, 0($v1)
L800358e8:
  lw $ra, 24($sp)
L800358ec:
  lw $s1, 20($sp)
L800358f0:
  lw $s0, 16($sp)
L800358f4:
  jr $ra
L800358f8:
  addiu $sp, $sp, 32
L800358fc:
  addiu $sp, $sp, -24
L80035900:
  sw $s0, 16($sp)
L80035904:
  sw $ra, 20($sp)
L80035908:
  jal 0x8008e590
L8003590c:
  addu $s0, $a0, $zero
L80035910:
  .word 0x0050001a
L80035914:
  bne $s0, $zero, L80035920
L80035918:
  sll $zero, $zero, 0x0
L8003591c:
  .word 0x0007000d
L80035920:
  addiu $at, $zero, -1
L80035924:
  bne $s0, $at, L80035938
L80035928:
  lui $at, 0x8000
L8003592c:
  bne $v0, $at, L80035938
L80035930:
  sll $zero, $zero, 0x0
L80035934:
  .word 0x0006000d
L80035938:
  mfhi $v0
L8003593c:
  lw $ra, 20($sp)
L80035940:
  lw $s0, 16($sp)
L80035944:
  jr $ra
L80035948:
  addiu $sp, $sp, 24
L8003594c:
  addiu $sp, $sp, -32
L80035950:
  sw $s0, 24($sp)
L80035954:
  sw $ra, 28($sp)
L80035958:
  jal 0x800137e4
L8003595c:
  addu $s0, $a0, $zero
L80035960:
  jal 0x80044f58
L80035964:
  addiu $a0, $zero, 255
L80035968:
  addu $a0, $s0, $zero
L8003596c:
  addiu $v0, $zero, 128
L80035970:
  lui $v1, 0x200
L80035974:
  addiu $a1, $zero, 1
L80035978:
  addiu $a2, $zero, -1
L8003597c:
  sb $v0, 1040($gp)
L80035980:
  lui $v0, 0x800a
L80035984:
  lw $v0, -20236($v0)
L80035988:
  sw $zero, 16($sp)
L8003598c:
  or $v0, $v0, $v1
L80035990:
  lui $at, 0x800a
L80035994:
  sw $v0, -20236($at)
L80035998:
  jal 0x8005c388
L8003599c:
  addu $a3, $a1, $zero
L800359a0:
  lw $ra, 28($sp)
L800359a4:
  lw $s0, 24($sp)
L800359a8:
  jr $ra
L800359ac:
  addiu $sp, $sp, 32
L800359b0:
  addiu $sp, $sp, -24
L800359b4:
  sw $ra, 16($sp)
L800359b8:
  jal 0x8005c530
L800359bc:
  sll $zero, $zero, 0x0
L800359c0:
  bne $v0, $zero, L80035a24
L800359c4:
  lui $v0, 0xfdff
L800359c8:
  lbu $v1, 1040($gp)
L800359cc:
  sll $zero, $zero, 0x0
L800359d0:
  andi $v0, $v1, 0x40
L800359d4:
  bne $v0, $zero, L800359f4
L800359d8:
  ori $v0, $v1, 0x40
L800359dc:
  lui $v0, 0x800a
L800359e0:
  lhu $v0, -19560($v0)
L800359e4:
  sll $zero, $zero, 0x0
L800359e8:
  andi $v0, $v0, 0x800
L800359ec:
  beq $v0, $zero, L80035a48
L800359f0:
  ori $v0, $v1, 0x40
L800359f4:
  sb $v0, 1040($gp)
L800359f8:
  addiu $v0, $zero, 1
L800359fc:
  lui $at, 0x800a
L80035a00:
  sb $v0, -20156($at)
L80035a04:
  lui $at, 0x800a
L80035a08:
  sb $v0, -20157($at)
L80035a0c:
  lui $at, 0x800a
L80035a10:
  sb $v0, -20158($at)
L80035a14:
  jal 0x8005c5c4
L80035a18:
  sll $zero, $zero, 0x0
L80035a1c:
  j L80035a48
L80035a20:
  sll $zero, $zero, 0x0
L80035a24:
  ori $v0, $v0, 0xffff
L80035a28:
  lui $v1, 0x800a
L80035a2c:
  lw $v1, -20236($v1)
L80035a30:
  lbu $a0, 1040($gp)
L80035a34:
  and $v1, $v1, $v0
L80035a38:
  andi $a0, $a0, 0x7f
L80035a3c:
  lui $at, 0x800a
L80035a40:
  sw $v1, -20236($at)
L80035a44:
  sb $a0, 1040($gp)
L80035a48:
  lw $ra, 16($sp)
L80035a4c:
  sll $zero, $zero, 0x0
L80035a50:
  jr $ra
L80035a54:
  addiu $sp, $sp, 24
L80035a58:
  sb $zero, 1040($gp)
L80035a5c:
  jr $ra
L80035a60:
  sll $zero, $zero, 0x0
L80035a64:
  addiu $sp, $sp, -24
L80035a68:
  sw $ra, 16($sp)
L80035a6c:
  addiu $v1, $zero, 4
L80035a70:
  lui $v0, 0x800f
L80035a74:
  addiu $v0, $v0, -20232
L80035a78:
  addiu $v0, $v0, 40
L80035a7c:
  sh $zero, 12($v0)
L80035a80:
  sw $zero, 8($v0)
L80035a84:
  sw $zero, 4($v0)
L80035a88:
  sw $zero, 0($v0)
L80035a8c:
  addiu $v1, $v1, -1
L80035a90:
  bne $v1, $zero, L80035a7c
L80035a94:
  addiu $v0, $v0, 100
L80035a98:
  jal L80035ce4
L80035a9c:
  sll $zero, $zero, 0x0
L80035aa0:
  jal L80035df4
L80035aa4:
  sll $zero, $zero, 0x0
L80035aa8:
  lw $ra, 16($sp)
L80035aac:
  sll $zero, $zero, 0x0
L80035ab0:
  jr $ra
L80035ab4:
  addiu $sp, $sp, 24
L80035ab8:
  sll $v0, $a0, 0x1
L80035abc:
  addu $v0, $v0, $a0
L80035ac0:
  sll $v0, $v0, 0x3
L80035ac4:
  addu $v0, $v0, $a0
L80035ac8:
  sll $v0, $v0, 0x2
L80035acc:
  lui $v1, 0x800f
L80035ad0:
  addiu $v1, $v1, -20232
L80035ad4:
  lw $a0, 16($sp)
L80035ad8:
  addu $v0, $v0, $v1
L80035adc:
  sh $a1, 60($v0)
L80035ae0:
  sh $a2, 64($v0)
L80035ae4:
  sh $a3, 62($v0)
L80035ae8:
  jr $ra
L80035aec:
  sh $a0, 66($v0)
L80035af0:
  sll $a3, $a0, 0x1
L80035af4:
  addu $v0, $a3, $a0
L80035af8:
  sll $v0, $v0, 0x3
L80035afc:
  addu $v0, $v0, $a0
L80035b00:
  sll $v0, $v0, 0x2
L80035b04:
  lui $v1, 0x800f
L80035b08:
  addiu $v1, $v1, -20232
L80035b0c:
  addu $v0, $v0, $v1
L80035b10:
  ori $a2, $a2, 0x8000
L80035b14:
  addiu $v1, $zero, 8
L80035b18:
  sb $v1, 90($v0)
L80035b1c:
  addiu $v1, $zero, 12
L80035b20:
  sb $v1, 91($v0)
L80035b24:
  addiu $v1, $zero, 2
L80035b28:
  sb $v1, 83($v0)
L80035b2c:
  lui $v1, 0x8009
L80035b30:
  addiu $v1, $v1, 3672
L80035b34:
  addu $a3, $a3, $v1
L80035b38:
  sb $a0, 87($v0)
L80035b3c:
  sh $a1, 54($v0)
L80035b40:
  sb $zero, 84($v0)
L80035b44:
  sh $a2, 52($v0)
L80035b48:
  sh $zero, 56($v0)
L80035b4c:
  sh $zero, 58($v0)
L80035b50:
  sb $zero, 89($v0)
L80035b54:
  sb $zero, 97($v0)
L80035b58:
  lhu $v1, 0($a3)
L80035b5c:
  sll $zero, $zero, 0x0
L80035b60:
  sh $v1, 92($v0)
L80035b64:
  lhu $v1, 2($a3)
L80035b68:
  lhu $a0, 0($a3)
L80035b6c:
  sll $zero, $zero, 0x0
L80035b70:
  subu $v1, $v1, $a0
L80035b74:
  jr $ra
L80035b78:
  sh $v1, 94($v0)
L80035b7c:
  addiu $sp, $sp, -24
L80035b80:
  sw $s0, 16($sp)
L80035b84:
  addu $s0, $a0, $zero
L80035b88:
  sw $ra, 20($sp)
L80035b8c:
  lbu $a0, 87($s0)
L80035b90:
  jal L80035ca8
L80035b94:
  sll $zero, $zero, 0x0
L80035b98:
  lbu $a0, 87($s0)
L80035b9c:
  jal L80035db8
L80035ba0:
  sll $zero, $zero, 0x0
L80035ba4:
  lw $a0, 48($s0)
L80035ba8:
  jal 0x8004036c
L80035bac:
  sh $zero, 52($s0)
L80035bb0:
  lw $a0, 44($s0)
L80035bb4:
  jal 0x8004036c
L80035bb8:
  sll $zero, $zero, 0x0
L80035bbc:
  lw $a0, 40($s0)
L80035bc0:
  jal 0x8004036c
L80035bc4:
  sll $zero, $zero, 0x0
L80035bc8:
  sw $zero, 48($s0)
L80035bcc:
  sw $zero, 44($s0)
L80035bd0:
  sw $zero, 40($s0)
L80035bd4:
  lw $ra, 20($sp)
L80035bd8:
  lw $s0, 16($sp)
L80035bdc:
  jr $ra
L80035be0:
  addiu $sp, $sp, 24
L80035be4:
  addiu $sp, $sp, -40
L80035be8:
  sw $s0, 24($sp)
L80035bec:
  sw $s1, 28($sp)
L80035bf0:
  addu $s1, $a1, $zero
L80035bf4:
  addu $a1, $a2, $zero
L80035bf8:
  lw $v0, 60($sp)
L80035bfc:
  addu $a2, $a3, $zero
L80035c00:
  sw $v0, 16($sp)
L80035c04:
  lw $a3, 56($sp)
L80035c08:
  sw $ra, 32($sp)
L80035c0c:
  jal L80035ab8
L80035c10:
  addu $s0, $a0, $zero
L80035c14:
  addu $a0, $s0, $zero
L80035c18:
  addu $a1, $s1, $zero
L80035c1c:
  jal L80035af0
L80035c20:
  addu $a2, $zero, $zero
L80035c24:
  lw $ra, 32($sp)
L80035c28:
  lw $s1, 28($sp)
L80035c2c:
  lw $s0, 24($sp)
L80035c30:
  jr $ra
L80035c34:
  addiu $sp, $sp, 40
L80035c38:
  addiu $sp, $sp, -40
L80035c3c:
  sw $s0, 24($sp)
L80035c40:
  sw $s1, 28($sp)
L80035c44:
  addu $s1, $a1, $zero
L80035c48:
  lw $v0, 60($sp)
L80035c4c:
  addu $a1, $a2, $zero
L80035c50:
  sw $s2, 32($sp)
L80035c54:
  lw $s2, 64($sp)
L80035c58:
  addu $a2, $a3, $zero
L80035c5c:
  sw $v0, 16($sp)
L80035c60:
  lw $a3, 56($sp)
L80035c64:
  sw $ra, 36($sp)
L80035c68:
  jal L80035ab8
L80035c6c:
  addu $s0, $a0, $zero
L80035c70:
  addu $a0, $s0, $zero
L80035c74:
  addu $a1, $s1, $zero
L80035c78:
  jal L80035af0
L80035c7c:
  addu $a2, $zero, $zero
L80035c80:
  lhu $v1, 52($v0)
L80035c84:
  sll $zero, $zero, 0x0
L80035c88:
  or $v1, $v1, $s2
L80035c8c:
  sh $v1, 52($v0)
L80035c90:
  lw $ra, 36($sp)
L80035c94:
  lw $s2, 32($sp)
L80035c98:
  lw $s1, 28($sp)
L80035c9c:
  lw $s0, 24($sp)
L80035ca0:
  jr $ra
L80035ca4:
  addiu $sp, $sp, 40
L80035ca8:
  lui $v0, 0x800f
L80035cac:
  addiu $v1, $v0, -20728
L80035cb0:
  addiu $a0, $a0, 1
L80035cb4:
  addu $a1, $zero, $zero
L80035cb8:
  lbu $v0, 0($v1)
L80035cbc:
  sll $zero, $zero, 0x0
L80035cc0:
  bne $v0, $a0, L80035ccc
L80035cc4:
  sll $zero, $zero, 0x0
L80035cc8:
  sb $zero, 0($v1)
L80035ccc:
  addiu $a1, $a1, 1
L80035cd0:
  slti $v0, $a1, 240
L80035cd4:
  bne $v0, $zero, L80035cb8
L80035cd8:
  addiu $v1, $v1, 1
L80035cdc:
  jr $ra
L80035ce0:
  sll $zero, $zero, 0x0
L80035ce4:
  lui $v0, 0x800f
L80035ce8:
  addiu $v0, $v0, -20728
L80035cec:
  addiu $v1, $zero, 239
L80035cf0:
  sb $zero, 0($v0)
L80035cf4:
  addiu $v1, $v1, -1
L80035cf8:
  bgez $v1, L80035cf0
L80035cfc:
  addiu $v0, $v0, 1
L80035d00:
  sb $zero, 1052($gp)
L80035d04:
  sb $zero, 1053($gp)
L80035d08:
  jr $ra
L80035d0c:
  sll $zero, $zero, 0x0
L80035d10:
  addiu $a2, $zero, 256
L80035d14:
  lui $v0, 0x800f
L80035d18:
  addiu $a3, $v0, -20728
L80035d1c:
  lbu $a0, 1052($gp)
L80035d20:
  lbu $v1, 1053($gp)
L80035d24:
  sll $zero, $zero, 0x0
L80035d28:
  sll $v0, $v1, 0x4
L80035d2c:
  addu $a1, $v0, $a0
L80035d30:
  addu $v0, $a1, $a3
L80035d34:
  lbu $v0, 0($v0)
L80035d38:
  sll $zero, $zero, 0x0
L80035d3c:
  bne $v0, $zero, L80035d4c
L80035d40:
  addiu $a0, $a0, 1
L80035d44:
  jr $ra
L80035d48:
  addu $v0, $a1, $zero
L80035d4c:
  andi $v0, $a0, 0x3
L80035d50:
  bne $v0, $zero, L80035da4
L80035d54:
  sll $zero, $zero, 0x0
L80035d58:
  addiu $v1, $v1, 1
L80035d5c:
  slti $v0, $v1, 15
L80035d60:
  bne $v0, $zero, L80035d70
L80035d64:
  andi $v0, $v1, 0x3
L80035d68:
  addiu $v1, $zero, 16
L80035d6c:
  andi $v0, $v1, 0x3
L80035d70:
  bne $v0, $zero, L80035d80
L80035d74:
  sll $zero, $zero, 0x0
L80035d78:
  j L80035d84
L80035d7c:
  addiu $v1, $v1, -4
L80035d80:
  addiu $a0, $a0, -4
L80035d84:
  slti $v0, $a0, 16
L80035d88:
  bne $v0, $zero, L80035da4
L80035d8c:
  sll $zero, $zero, 0x0
L80035d90:
  addiu $v1, $v1, 4
L80035d94:
  slti $v0, $v1, 16
L80035d98:
  bne $v0, $zero, L80035da4
L80035d9c:
  addu $a0, $zero, $zero
L80035da0:
  addu $v1, $a0, $zero
L80035da4:
  addiu $a2, $a2, -1
L80035da8:
  bne $a2, $zero, L80035d2c
L80035dac:
  sll $v0, $v1, 0x4
L80035db0:
  jr $ra
L80035db4:
  addiu $v0, $zero, -1
L80035db8:
  addiu $a1, $zero, 620
L80035dbc:
  addiu $a0, $a0, 1
L80035dc0:
  lui $v0, 0x800f
L80035dc4:
  addiu $v0, $v0, -19832
L80035dc8:
  addiu $v1, $v0, 17
L80035dcc:
  lbu $v0, 1($v1)
L80035dd0:
  sll $zero, $zero, 0x0
L80035dd4:
  bne $v0, $a0, L80035de0
L80035dd8:
  sll $zero, $zero, 0x0
L80035ddc:
  sb $zero, 0($v1)
L80035de0:
  addiu $a1, $a1, -1
L80035de4:
  bne $a1, $zero, L80035dcc
L80035de8:
  addiu $v1, $v1, 28
L80035dec:
  jr $ra
L80035df0:
  sll $zero, $zero, 0x0
L80035df4:
  addiu $v1, $zero, 620
L80035df8:
  lui $v0, 0x800f
L80035dfc:
  addiu $v0, $v0, -19832
L80035e00:
  addiu $v0, $v0, 24
L80035e04:
  sb $zero, -7($v0)
L80035e08:
  sb $zero, 0($v0)
L80035e0c:
  addiu $v1, $v1, -1
L80035e10:
  bne $v1, $zero, L80035e04
L80035e14:
  addiu $v0, $v0, 28
L80035e18:
  jr $ra
L80035e1c:
  sll $zero, $zero, 0x0
L80035e20:
  addiu $sp, $sp, -256
L80035e24:
  sw $a0, 256($sp)
L80035e28:
  addiu $a0, $zero, 300
L80035e2c:
  sw $ra, 252($sp)
L80035e30:
  sw $fp, 248($sp)
L80035e34:
  sw $s7, 244($sp)
L80035e38:
  sw $s6, 240($sp)
L80035e3c:
  sw $s5, 236($sp)
L80035e40:
  sw $s4, 232($sp)
L80035e44:
  sw $s3, 228($sp)
L80035e48:
  sw $s2, 224($sp)
L80035e4c:
  sw $s1, 220($sp)
L80035e50:
  sw $s0, 216($sp)
L80035e54:
  jal 0x800878d0
L80035e58:
  sw $a1, 260($sp)
L80035e5c:
  lw $t2, 256($sp)
L80035e60:
  lw $t3, 256($sp)
L80035e64:
  lh $t2, 48($t2)
L80035e68:
  sll $zero, $zero, 0x0
L80035e6c:
  sw $t2, 184($sp)
L80035e70:
  lh $t8, 50($t3)
L80035e74:
  lhu $v0, 8($t3)
L80035e78:
  sw $t8, 188($sp)
L80035e7c:
  lh $t9, 20($t3)
L80035e80:
  andi $v0, $v0, 0x8
L80035e84:
  bne $v0, $zero, L80035eac
L80035e88:
  sw $t9, 196($sp)
L80035e8c:
  lui $v0, 0x800a
L80035e90:
  lh $v0, -20154($v0)
L80035e94:
  lui $v1, 0x800a
L80035e98:
  lh $v1, -20152($v1)
L80035e9c:
  subu $t2, $t2, $v0
L80035ea0:
  subu $t8, $t8, $v1
L80035ea4:
  sw $t2, 184($sp)
L80035ea8:
  sw $t8, 188($sp)
L80035eac:
  lui $s5, 0x1f80
L80035eb0:
  ori $s5, $s5, 0x38
L80035eb4:
  lui $s4, 0x1f80
L80035eb8:
  ori $s4, $s4, 0x60
L80035ebc:
  lui $t2, 0x1f80
L80035ec0:
  ori $t2, $t2, 0x78
L80035ec4:
  lui $s6, 0x1f80
L80035ec8:
  lui $a1, 0x1f80
L80035ecc:
  ori $a1, $a1, 0xc0
L80035ed0:
  lui $v1, 0x1f80
L80035ed4:
  ori $v1, $v1, 0x100
L80035ed8:
  lui $v0, 0x1f80
L80035edc:
  ori $v0, $v0, 0x140
L80035ee0:
  lui $a0, 0x1f80
L80035ee4:
  sw $t2, 192($sp)
L80035ee8:
  sw $a1, 48($sp)
L80035eec:
  sw $v1, 52($sp)
L80035ef0:
  jal 0x80082980
L80035ef4:
  sw $v0, 56($sp)
L80035ef8:
  lui $a0, 0x1f80
L80035efc:
  jal 0x80082840
L80035f00:
  addiu $a1, $zero, 1
L80035f04:
  lui $v0, 0x80
L80035f08:
  ori $v0, $v0, 0x8080
L80035f0c:
  sw $v0, 4($s5)
L80035f10:
  addiu $v0, $zero, 9
L80035f14:
  sb $v0, 3($s5)
L80035f18:
  addiu $v0, $zero, 44
L80035f1c:
  sb $v0, 7($s5)
L80035f20:
  lw $t3, 256($sp)
L80035f24:
  ori $s6, $s6, 0xa0
L80035f28:
  lhu $v1, 66($t3)
L80035f2c:
  lhu $v0, 64($t3)
L80035f30:
  sll $v1, $v1, 0x6
L80035f34:
  srl $v0, $v0, 0x4
L80035f38:
  andi $v0, $v0, 0x3f
L80035f3c:
  or $v1, $v1, $v0
L80035f40:
  sh $v1, 14($s5)
L80035f44:
  lw $v1, 4($t3)
L80035f48:
  sll $zero, $zero, 0x0
L80035f4c:
  srl $v0, $v1, 0x17
L80035f50:
  andi $a0, $v0, 0x60
L80035f54:
  lui $v0, 0x100
L80035f58:
  and $v1, $v1, $v0
L80035f5c:
  lbu $v0, 102($t3)
L80035f60:
  beq $v1, $zero, L80035f6c
L80035f64:
  lui $s3, 0x1f80
L80035f68:
  ori $v0, $v0, 0x80
L80035f6c:
  or $v0, $a0, $v0
L80035f70:
  lui $a0, 0x800
L80035f74:
  sh $v0, 22($s5)
L80035f78:
  lw $a2, 48($sp)
L80035f7c:
  lw $t8, 256($sp)
L80035f80:
  lw $a1, 52($sp)
L80035f84:
  lw $v0, 4($t8)
L80035f88:
  lw $v1, 56($sp)
L80035f8c:
  or $v0, $v0, $a0
L80035f90:
  sw $v0, 0($v1)
L80035f94:
  sw $v0, 0($a1)
L80035f98:
  sw $v0, 0($a2)
L80035f9c:
  lw $v1, 48($sp)
L80035fa0:
  lw $v0, 12($t8)
L80035fa4:
  sll $zero, $zero, 0x0
L80035fa8:
  sw $v0, 20($v1)
L80035fac:
  lw $v1, 52($sp)
L80035fb0:
  lw $v0, 12($t8)
L80035fb4:
  sll $zero, $zero, 0x0
L80035fb8:
  sw $v0, 20($v1)
L80035fbc:
  lw $v1, 56($sp)
L80035fc0:
  lw $v0, 12($t8)
L80035fc4:
  lui $a0, 0x10
L80035fc8:
  sw $v0, 20($v1)
L80035fcc:
  lw $v0, 48($sp)
L80035fd0:
  ori $a0, $a0, 0x10
L80035fd4:
  sw $a0, 8($v0)
L80035fd8:
  lw $v0, 52($sp)
L80035fdc:
  lui $v1, 0x8
L80035fe0:
  sw $a0, 8($v0)
L80035fe4:
  lw $v0, 56($sp)
L80035fe8:
  ori $v1, $v1, 0x8
L80035fec:
  sw $v1, 8($v0)
L80035ff0:
  lw $v1, 48($sp)
L80035ff4:
  lw $v0, 64($t8)
L80035ff8:
  sll $zero, $zero, 0x0
L80035ffc:
  sw $v0, 16($v1)
L80036000:
  lw $v1, 48($sp)
L80036004:
  lbu $v0, 102($t8)
L80036008:
  addiu $fp, $zero, 1
L8003600c:
  sh $v0, 12($v1)
L80036010:
  lw $a0, 52($sp)
L80036014:
  lw $v1, 56($sp)
L80036018:
  addiu $v0, $zero, 11
L8003601c:
  sh $v0, 12($v1)
L80036020:
  sh $v0, 12($a0)
L80036024:
  lui $a0, 0x800f
L80036028:
  lbu $v1, 103($t8)
L8003602c:
  addiu $a0, $a0, -20232
L80036030:
  sllv $v0, $v1, $fp
L80036034:
  addu $v0, $v0, $v1
L80036038:
  sll $v0, $v0, 0x3
L8003603c:
  addu $v0, $v0, $v1
L80036040:
  sll $v0, $v0, 0x2
L80036044:
  addu $v0, $v0, $a0
L80036048:
  lw $v0, 36($v0)
L8003604c:
  addiu $s7, $zero, 120
L80036050:
  addiu $s2, $v0, 22
L80036054:
  sw $v0, 200($sp)
L80036058:
  lbu $v1, -5($s2)
L8003605c:
  lw $t9, 200($sp)
L80036060:
  andi $v0, $v1, 0x80
L80036064:
  lhu $a1, 0($t9)
L80036068:
  beq $v0, $zero, L80036b9c
L8003606c:
  addu $s0, $zero, $zero
L80036070:
  andi $v0, $v1, 0x60
L80036074:
  beq $v0, $zero, L800362cc
L80036078:
  andi $v0, $v1, 0x20
L8003607c:
  beq $v0, $zero, L80036260
L80036080:
  sll $zero, $zero, 0x0
L80036084:
  lw $v1, 52($sp)
L80036088:
  addiu $v0, $zero, 11
L8003608c:
  sh $v0, 12($v1)
L80036090:
  lbu $v0, -6($s2)
L80036094:
  lw $s1, 52($sp)
L80036098:
  sw $v0, 0($s6)
L8003609c:
  slti $v0, $v0, 34
L800360a0:
  bne $v0, $zero, L800360e8
L800360a4:
  addiu $v0, $zero, 128
L800360a8:
  lbu $v1, 0($s6)
L800360ac:
  sb $v0, 15($s1)
L800360b0:
  addiu $v0, $zero, 512
L800360b4:
  sh $v0, 16($s1)
L800360b8:
  addiu $v0, $zero, 252
L800360bc:
  sh $v0, 18($s1)
L800360c0:
  addiu $v0, $zero, 80
L800360c4:
  sll $v1, $v1, 0x4
L800360c8:
  addiu $v1, $v1, -528
L800360cc:
  sb $v1, 14($s1)
L800360d0:
  andi $v1, $v1, 0xff
L800360d4:
  bne $v1, $v0, L800362a8
L800360d8:
  sll $zero, $zero, 0x0
L800360dc:
  addiu $v0, $zero, 528
L800360e0:
  j L800362a8
L800360e4:
  sh $v0, 16($s1)
L800360e8:
  lbu $v0, 0($s6)
L800360ec:
  sll $zero, $zero, 0x0
L800360f0:
  andi $v0, $v0, 0x7
L800360f4:
  sll $v0, $v0, 0x4
L800360f8:
  addiu $v0, $v0, -128
L800360fc:
  sb $v0, 14($s1)
L80036100:
  lbu $v0, 0($s6)
L80036104:
  sll $zero, $zero, 0x0
L80036108:
  andi $v0, $v0, 0x38
L8003610c:
  sll $v0, $v0, 0x1
L80036110:
  sb $v0, 15($s1)
L80036114:
  lw $v0, 0($s6)
L80036118:
  sll $zero, $zero, 0x0
L8003611c:
  slti $v0, $v0, 25
L80036120:
  bne $v0, $zero, L8003612c
L80036124:
  addiu $v0, $zero, 24
L80036128:
  sw $v0, 0($s6)
L8003612c:
  lhu $v0, 0($s6)
L80036130:
  lbu $v1, 0($s6)
L80036134:
  andi $v0, $v0, 0xf
L80036138:
  sll $v0, $v0, 0x4
L8003613c:
  addiu $v0, $v0, 512
L80036140:
  srl $v1, $v1, 0x4
L80036144:
  addiu $v1, $v1, 249
L80036148:
  sh $v0, 16($s1)
L8003614c:
  sh $v1, 18($s1)
L80036150:
  lw $t2, 256($sp)
L80036154:
  sll $zero, $zero, 0x0
L80036158:
  lw $v1, 4($t2)
L8003615c:
  addiu $v0, $zero, 16
L80036160:
  sh $v0, 8($s1)
L80036164:
  sh $v0, 10($s1)
L80036168:
  lui $v0, 0x800
L8003616c:
  or $v1, $v1, $v0
L80036170:
  sw $v1, 0($s1)
L80036174:
  lbu $v0, 1($s2)
L80036178:
  sll $zero, $zero, 0x0
L8003617c:
  sltiu $v0, $v0, 20
L80036180:
  bne $v0, $zero, L800362a8
L80036184:
  sll $zero, $zero, 0x0
L80036188:
  lbu $v0, -6($s2)
L8003618c:
  sll $zero, $zero, 0x0
L80036190:
  sltiu $v0, $v0, 24
L80036194:
  beq $v0, $zero, L800362a8
L80036198:
  addiu $v1, $zero, 30
L8003619c:
  lw $v0, 52($sp)
L800361a0:
  sll $zero, $zero, 0x0
L800361a4:
  sh $v1, 12($v0)
L800361a8:
  lbu $v1, 1($s2)
L800361ac:
  addiu $v0, $zero, 21
L800361b0:
  beq $v1, $v0, L800361fc
L800361b4:
  addiu $v0, $zero, 64
L800361b8:
  slti $v0, $v1, 22
L800361bc:
  beq $v0, $zero, L800361d4
L800361c0:
  addiu $v0, $zero, 20
L800361c4:
  beq $v1, $v0, L800361f4
L800361c8:
  sll $zero, $zero, 0x0
L800361cc:
  j L80036224
L800361d0:
  addiu $v0, $zero, 241
L800361d4:
  addiu $v0, $zero, 22
L800361d8:
  beq $v1, $v0, L80036208
L800361dc:
  addiu $v0, $zero, 96
L800361e0:
  addiu $v0, $zero, 23
L800361e4:
  beq $v1, $v0, L80036214
L800361e8:
  sll $zero, $zero, 0x0
L800361ec:
  j L80036224
L800361f0:
  addiu $v0, $zero, 241
L800361f4:
  j L80036224
L800361f8:
  addiu $v0, $zero, 242
L800361fc:
  sb $v0, 14($s1)
L80036200:
  j L80036228
L80036204:
  addiu $v0, $zero, 243
L80036208:
  sb $v0, 14($s1)
L8003620c:
  j L80036228
L80036210:
  addiu $v0, $zero, 244
L80036214:
  addiu $v0, $zero, 32
L80036218:
  sb $v0, 14($s1)
L8003621c:
  j L80036228
L80036220:
  addiu $v0, $zero, 241
L80036224:
  sb $zero, 14($s1)
L80036228:
  sh $v0, 18($s1)
L8003622c:
  addiu $v0, $zero, 96
L80036230:
  sb $v0, 15($s1)
L80036234:
  addiu $v0, $zero, 32
L80036238:
  sh $v0, 8($s1)
L8003623c:
  addiu $v0, $zero, 16
L80036240:
  sh $v0, 10($s1)
L80036244:
  addiu $v0, $zero, 256
L80036248:
  sh $v0, 16($s1)
L8003624c:
  lw $v0, 0($s1)
L80036250:
  lui $v1, 0x100
L80036254:
  or $v0, $v0, $v1
L80036258:
  j L800362a8
L8003625c:
  sw $v0, 0($s1)
L80036260:
  lbu $v0, 0($s2)
L80036264:
  lw $s1, 56($sp)
L80036268:
  sll $v0, $v0, 0x4
L8003626c:
  addiu $v0, $v0, 656
L80036270:
  sh $v0, 16($s1)
L80036274:
  addiu $v0, $zero, 250
L80036278:
  sh $v0, 18($s1)
L8003627c:
  lbu $v0, -6($s2)
L80036280:
  sll $zero, $zero, 0x0
L80036284:
  andi $v0, $v0, 0xf
L80036288:
  sll $v0, $v0, 0x3
L8003628c:
  addiu $v0, $v0, -128
L80036290:
  sb $v0, 14($s1)
L80036294:
  lbu $v0, -6($s2)
L80036298:
  sll $zero, $zero, 0x0
L8003629c:
  andi $v0, $v0, 0xf0
L800362a0:
  srl $v0, $v0, 0x1
L800362a4:
  sb $v0, 15($s1)
L800362a8:
  lhu $v0, -10($s2)
L800362ac:
  lw $t3, 184($sp)
L800362b0:
  sll $zero, $zero, 0x0
L800362b4:
  addu $v0, $v0, $t3
L800362b8:
  sh $v0, 4($s1)
L800362bc:
  lhu $v0, -8($s2)
L800362c0:
  lw $t8, 188($sp)
L800362c4:
  j L80036758
L800362c8:
  addu $v0, $v0, $t8
L800362cc:
  lw $s1, 48($sp)
L800362d0:
  ori $v0, $zero, 0x8172
L800362d4:
  beq $a1, $v0, L80036318
L800362d8:
  slt $v0, $v0, $a1
L800362dc:
  bne $v0, $zero, L800362f8
L800362e0:
  ori $v0, $zero, 0x8173
L800362e4:
  ori $v0, $zero, 0x8171
L800362e8:
  beq $a1, $v0, L80036310
L800362ec:
  lui $v0, 0xffff
L800362f0:
  j L80036324
L800362f4:
  ori $v0, $v0, 0x7db1
L800362f8:
  beq $a1, $v0, L80036310
L800362fc:
  ori $v0, $zero, 0x8174
L80036300:
  beq $a1, $v0, L80036318
L80036304:
  lui $v0, 0xffff
L80036308:
  j L80036324
L8003630c:
  ori $v0, $v0, 0x7db1
L80036310:
  j L8003631c
L80036314:
  ori $a1, $zero, 0x8183
L80036318:
  ori $a1, $zero, 0x8184
L8003631c:
  lui $v0, 0xffff
L80036320:
  ori $v0, $v0, 0x7db1
L80036324:
  addu $v0, $a1, $v0
L80036328:
  sltiu $v0, $v0, 76
L8003632c:
  beq $v0, $zero, L80036424
L80036330:
  lui $v0, 0xffff
L80036334:
  ori $v0, $v0, 0x7da7
L80036338:
  addu $v0, $a1, $v0
L8003633c:
  sltiu $v0, $v0, 7
L80036340:
  bne $v0, $zero, L80036630
L80036344:
  lui $v0, 0xffff
L80036348:
  ori $v0, $v0, 0x7d86
L8003634c:
  addu $v0, $a1, $v0
L80036350:
  sltiu $v0, $v0, 7
L80036354:
  bne $v0, $zero, L80036630
L80036358:
  sll $zero, $zero, 0x0
L8003635c:
  lbu $v0, 2($s2)
L80036360:
  sll $zero, $zero, 0x0
L80036364:
  bne $v0, $fp, L80036398
L80036368:
  lui $v0, 0xffff
L8003636c:
  lui $v1, 0xffff
L80036370:
  ori $v1, $v1, 0x7dc0
L80036374:
  andi $v0, $a1, 0xf
L80036378:
  sll $v0, $v0, 0x4
L8003637c:
  addu $v1, $a1, $v1
L80036380:
  sra $v1, $v1, 0x4
L80036384:
  sll $v1, $v1, 0x4
L80036388:
  addiu $v1, $v1, 72
L8003638c:
  sb $v0, 14($s1)
L80036390:
  j L80036654
L80036394:
  sb $v1, 15($s1)
L80036398:
  ori $v0, $v0, 0x7dc0
L8003639c:
  andi $v1, $a1, 0xf
L800363a0:
  sll $v1, $v1, 0x3
L800363a4:
  addu $v0, $a1, $v0
L800363a8:
  sra $v0, $v0, 0x4
L800363ac:
  sb $v1, 14($s1)
L800363b0:
  sll $v1, $v0, 0x1
L800363b4:
  addu $v1, $v1, $v0
L800363b8:
  sll $v1, $v1, 0x2
L800363bc:
  j L80036654
L800363c0:
  sb $v1, 15($s1)
L800363c4:
  sll $v0, $a0, 0x4
L800363c8:
  sb $v0, 14($s1)
L800363cc:
  addiu $v0, $zero, 72
L800363d0:
  j L80036654
L800363d4:
  sb $v0, 15($s1)
L800363d8:
  sll $v0, $a0, 0x4
L800363dc:
  addiu $v0, $v0, -352
L800363e0:
  sb $v0, 14($s1)
L800363e4:
  addiu $v0, $zero, 88
L800363e8:
  j L80036654
L800363ec:
  sb $v0, 15($s1)
L800363f0:
  sll $v0, $a0, 0x3
L800363f4:
  sb $v0, 14($s1)
L800363f8:
  j L80036654
L800363fc:
  sb $zero, 15($s1)
L80036400:
  sll $v0, $a0, 0x3
L80036404:
  addiu $v0, $v0, -48
L80036408:
  sb $v0, 14($s1)
L8003640c:
  addiu $v0, $zero, 12
L80036410:
  j L80036654
L80036414:
  sb $v0, 15($s1)
L80036418:
  sb $zero, 14($s1)
L8003641c:
  j L80036654
L80036420:
  sb $s7, 15($s1)
L80036424:
  addiu $v1, $sp, 64
L80036428:
  lui $v0, 0x8001
L8003642c:
  addiu $v0, $v0, 696
L80036430:
  addiu $a0, $v0, 112
L80036434:
  lw $t9, 0($v0)
L80036438:
  lw $t2, 4($v0)
L8003643c:
  lw $t3, 8($v0)
L80036440:
  lw $t8, 12($v0)
L80036444:
  sw $t9, 0($v1)
L80036448:
  sw $t2, 4($v1)
L8003644c:
  sw $t3, 8($v1)
L80036450:
  sw $t8, 12($v1)
L80036454:
  addiu $v0, $v0, 16
L80036458:
  bne $v0, $a0, L80036434
L8003645c:
  addiu $v1, $v1, 16
L80036460:
  addu $a0, $zero, $zero
L80036464:
  lw $t9, 0($v0)
L80036468:
  lw $t2, 4($v0)
L8003646c:
  sw $t9, 0($v1)
L80036470:
  sw $t2, 4($v1)
L80036474:
  ori $t9, $zero, 0x81bd
L80036478:
  slt $a2, $t9, $a1
L8003647c:
  ori $t2, $zero, 0x81a9
L80036480:
  slt $t0, $t2, $a1
L80036484:
  ori $t4, $zero, 0x83bf
L80036488:
  slt $a3, $t4, $a1
L8003648c:
  addiu $t5, $zero, 152
L80036490:
  ori $t7, $zero, 0x81bc
L80036494:
  slt $t3, $a1, $t7
L80036498:
  ori $t6, $zero, 0x81a8
L8003649c:
  slt $t8, $a1, $t6
L800364a0:
  addiu $t1, $zero, 60
L800364a4:
  sw $t3, 208($sp)
L800364a8:
  sw $t8, 212($sp)
L800364ac:
  sll $v0, $a0, 0x2
L800364b0:
  addu $v0, $sp, $v0
L800364b4:
  lw $v1, 64($v0)
L800364b8:
  sll $zero, $zero, 0x0
L800364bc:
  bne $a1, $v1, L80036628
L800364c0:
  sll $zero, $zero, 0x0
L800364c4:
  lbu $v0, 2($s2)
L800364c8:
  sll $zero, $zero, 0x0
L800364cc:
  bne $v0, $fp, L80036598
L800364d0:
  slti $v0, $a0, 15
L800364d4:
  bne $v0, $zero, L800363c4
L800364d8:
  slti $v0, $a0, 22
L800364dc:
  bne $v0, $zero, L800363d8
L800364e0:
  ori $t9, $zero, 0x81bd
L800364e4:
  beq $v1, $t9, L80036584
L800364e8:
  sll $zero, $zero, 0x0
L800364ec:
  bne $a2, $zero, L80036524
L800364f0:
  ori $t2, $zero, 0x81a9
L800364f4:
  beq $v1, $t2, L80036568
L800364f8:
  sll $zero, $zero, 0x0
L800364fc:
  bne $t0, $zero, L80036514
L80036500:
  sll $zero, $zero, 0x0
L80036504:
  beq $v1, $t6, L80036570
L80036508:
  addiu $v0, $zero, 640
L8003650c:
  j L8003665c
L80036510:
  sh $v0, 16($s1)
L80036514:
  beq $v1, $t7, L80036578
L80036518:
  addiu $v0, $zero, 640
L8003651c:
  j L8003665c
L80036520:
  sh $v0, 16($s1)
L80036524:
  beq $v1, $t4, L8003655c
L80036528:
  addiu $v0, $zero, 208
L8003652c:
  bne $a3, $zero, L80036548
L80036530:
  ori $v0, $zero, 0x83c0
L80036534:
  ori $v0, $zero, 0x81c1
L80036538:
  beq $v1, $v0, L80036558
L8003653c:
  addiu $v0, $zero, 640
L80036540:
  j L8003665c
L80036544:
  sh $v0, 16($s1)
L80036548:
  bne $v1, $v0, L80036658
L8003654c:
  addiu $v0, $zero, 640
L80036550:
  j L8003655c
L80036554:
  addiu $v0, $zero, 224
L80036558:
  addiu $v0, $zero, 240
L8003655c:
  sb $v0, 14($s1)
L80036560:
  j L80036654
L80036564:
  sb $t5, 15($s1)
L80036568:
  j L8003658c
L8003656c:
  addiu $v0, $zero, 176
L80036570:
  j L8003658c
L80036574:
  addiu $v0, $zero, 192
L80036578:
  addiu $s0, $zero, 2
L8003657c:
  j L8003658c
L80036580:
  addiu $v0, $zero, 224
L80036584:
  addiu $s0, $zero, -2
L80036588:
  addiu $v0, $zero, 240
L8003658c:
  sb $v0, 14($s1)
L80036590:
  j L80036654
L80036594:
  sb $s7, 15($s1)
L80036598:
  bne $v0, $zero, L800363f0
L8003659c:
  slti $v0, $a0, 22
L800365a0:
  bne $v0, $zero, L80036400
L800365a4:
  sll $zero, $zero, 0x0
L800365a8:
  bne $a2, $zero, L800365e0
L800365ac:
  sll $zero, $zero, 0x0
L800365b0:
  lw $t3, 208($sp)
L800365b4:
  sll $zero, $zero, 0x0
L800365b8:
  beq $t3, $zero, L80036640
L800365bc:
  addiu $v0, $zero, 48
L800365c0:
  bne $t0, $zero, L80036658
L800365c4:
  addiu $v0, $zero, 640
L800365c8:
  lw $t8, 212($sp)
L800365cc:
  sll $zero, $zero, 0x0
L800365d0:
  bne $t8, $zero, L80036654
L800365d4:
  addiu $v0, $zero, 48
L800365d8:
  j L80036644
L800365dc:
  sb $zero, 14($s1)
L800365e0:
  beq $v1, $t4, L80036610
L800365e4:
  addiu $v0, $zero, 104
L800365e8:
  bne $a3, $zero, L80036604
L800365ec:
  ori $v0, $zero, 0x83c0
L800365f0:
  ori $v0, $zero, 0x81c1
L800365f4:
  beq $v1, $v0, L8003661c
L800365f8:
  addiu $v0, $zero, 640
L800365fc:
  j L8003665c
L80036600:
  sh $v0, 16($s1)
L80036604:
  bne $v1, $v0, L80036658
L80036608:
  addiu $v0, $zero, 640
L8003660c:
  addiu $v0, $zero, 112
L80036610:
  sb $v0, 14($s1)
L80036614:
  j L80036654
L80036618:
  sb $t1, 15($s1)
L8003661c:
  sb $s7, 14($s1)
L80036620:
  j L80036654
L80036624:
  sb $t1, 15($s1)
L80036628:
  bgez $v1, L8003664c
L8003662c:
  sll $zero, $zero, 0x0
L80036630:
  lbu $v0, 2($s2)
L80036634:
  sll $zero, $zero, 0x0
L80036638:
  beq $v0, $fp, L80036418
L8003663c:
  addiu $v0, $zero, 48
L80036640:
  sb $zero, 14($s1)
L80036644:
  j L80036654
L80036648:
  sb $v0, 15($s1)
L8003664c:
  j L800364ac
L80036650:
  addiu $a0, $a0, 1
L80036654:
  addiu $v0, $zero, 640
L80036658:
  sh $v0, 16($s1)
L8003665c:
  lbu $v0, 0($s2)
L80036660:
  sll $zero, $zero, 0x0
L80036664:
  addiu $v0, $v0, 232
L80036668:
  sh $v0, 18($s1)
L8003666c:
  lbu $v0, 2($s2)
L80036670:
  sll $zero, $zero, 0x0
L80036674:
  bne $v0, $fp, L80036688
L80036678:
  addiu $v0, $zero, 8
L8003667c:
  addiu $v0, $zero, 16
L80036680:
  j L80036690
L80036684:
  sh $v0, 8($s1)
L80036688:
  sh $v0, 8($s1)
L8003668c:
  addiu $v0, $zero, 12
L80036690:
  sh $v0, 10($s1)
L80036694:
  lbu $v1, 2($s2)
L80036698:
  sll $zero, $zero, 0x0
L8003669c:
  bne $v1, $fp, L800366f8
L800366a0:
  sll $zero, $zero, 0x0
L800366a4:
  beq $s0, $zero, L800366d4
L800366a8:
  sll $zero, $zero, 0x0
L800366ac:
  lhu $v0, -10($s2)
L800366b0:
  lw $t9, 184($sp)
L800366b4:
  sll $zero, $zero, 0x0
L800366b8:
  addu $v0, $v0, $t9
L800366bc:
  addu $v0, $v0, $s0
L800366c0:
  sh $v0, 4($s1)
L800366c4:
  lhu $v0, -8($s2)
L800366c8:
  lw $t2, 188($sp)
L800366cc:
  j L80036758
L800366d0:
  addu $v0, $v0, $t2
L800366d4:
  lhu $v0, -10($s2)
L800366d8:
  lw $t3, 184($sp)
L800366dc:
  sll $zero, $zero, 0x0
L800366e0:
  addu $v0, $v0, $t3
L800366e4:
  sh $v0, 4($s1)
L800366e8:
  lhu $v0, -8($s2)
L800366ec:
  lw $t8, 188($sp)
L800366f0:
  j L80036758
L800366f4:
  addu $v0, $v0, $t8
L800366f8:
  addiu $v0, $zero, 2
L800366fc:
  bne $v1, $v0, L80036730
L80036700:
  sll $zero, $zero, 0x0
L80036704:
  lhu $v0, -10($s2)
L80036708:
  lw $t9, 184($sp)
L8003670c:
  sll $zero, $zero, 0x0
L80036710:
  addu $v0, $v0, $t9
L80036714:
  sh $v0, 4($s1)
L80036718:
  lhu $v0, -8($s2)
L8003671c:
  lw $t2, 188($sp)
L80036720:
  sll $zero, $zero, 0x0
L80036724:
  addu $v0, $v0, $t2
L80036728:
  j L80036758
L8003672c:
  addiu $v0, $v0, -2
L80036730:
  lhu $v0, -10($s2)
L80036734:
  lw $t3, 184($sp)
L80036738:
  sll $zero, $zero, 0x0
L8003673c:
  addu $v0, $v0, $t3
L80036740:
  sh $v0, 4($s1)
L80036744:
  lhu $v0, -8($s2)
L80036748:
  lw $t8, 188($sp)
L8003674c:
  sll $zero, $zero, 0x0
L80036750:
  addu $v0, $v0, $t8
L80036754:
  addiu $v0, $v0, 2
L80036758:
  sh $v0, 6($s1)
L8003675c:
  lbu $v1, -1($s2)
L80036760:
  sll $zero, $zero, 0x0
L80036764:
  beq $v1, $fp, L80036794
L80036768:
  slti $v0, $v1, 2
L8003676c:
  beq $v0, $zero, L80036784
L80036770:
  addiu $v0, $zero, 2
L80036774:
  beq $v1, $zero, L800368f4
L80036778:
  sll $zero, $zero, 0x0
L8003677c:
  j L80036b88
L80036780:
  sll $zero, $zero, 0x0
L80036784:
  beq $v1, $v0, L8003690c
L80036788:
  sll $zero, $zero, 0x0
L8003678c:
  j L80036b88
L80036790:
  sll $zero, $zero, 0x0
L80036794:
  lbu $v0, -14($s2)
L80036798:
  lbu $a0, -13($s2)
L8003679c:
  lbu $v1, -12($s2)
L800367a0:
  or $v0, $v0, $a0
L800367a4:
  or $v1, $v1, $v0
L800367a8:
  beq $v1, $zero, L800368f4
L800367ac:
  sll $zero, $zero, 0x0
L800367b0:
  lh $a0, 4($s1)
L800367b4:
  lh $a1, 6($s1)
L800367b8:
  addiu $a0, $a0, 8
L800367bc:
  jal 0x800878b0
L800367c0:
  addiu $a1, $a1, 8
L800367c4:
  lbu $v0, 14($s1)
L800367c8:
  sll $zero, $zero, 0x0
L800367cc:
  sb $v0, 28($s5)
L800367d0:
  sb $v0, 12($s5)
L800367d4:
  lbu $v0, 14($s1)
L800367d8:
  sll $zero, $zero, 0x0
L800367dc:
  addiu $v0, $v0, 15
L800367e0:
  sb $v0, 36($s5)
L800367e4:
  sb $v0, 20($s5)
L800367e8:
  lbu $v0, 15($s1)
L800367ec:
  sll $zero, $zero, 0x0
L800367f0:
  sb $v0, 21($s5)
L800367f4:
  sb $v0, 13($s5)
L800367f8:
  addiu $v0, $zero, 300
L800367fc:
  lbu $v1, 15($s1)
L80036800:
  lw $t9, 192($sp)
L80036804:
  addiu $v1, $v1, 15
L80036808:
  sw $zero, 20($t9)
L8003680c:
  sw $zero, 24($t9)
L80036810:
  sw $v0, 28($t9)
L80036814:
  sb $v1, 37($s5)
L80036818:
  sb $v1, 29($s5)
L8003681c:
  lbu $v0, -14($s2)
L80036820:
  sll $zero, $zero, 0x0
L80036824:
  sll $v0, $v0, 0x4
L80036828:
  sh $v0, 0($s4)
L8003682c:
  lbu $v0, -13($s2)
L80036830:
  addu $a0, $s4, $zero
L80036834:
  sll $v0, $v0, 0x4
L80036838:
  sh $v0, 2($s4)
L8003683c:
  lbu $v0, -12($s2)
L80036840:
  lw $a1, 192($sp)
L80036844:
  sll $v0, $v0, 0x4
L80036848:
  jal 0x80088c50
L8003684c:
  sh $v0, 4($s4)
L80036850:
  lw $a0, 192($sp)
L80036854:
  jal 0x800855d0
L80036858:
  sll $zero, $zero, 0x0
L8003685c:
  addiu $a0, $s4, 8
L80036860:
  addiu $a1, $s4, 16
L80036864:
  addiu $a2, $s4, 24
L80036868:
  addiu $v0, $zero, -8
L8003686c:
  addiu $v1, $zero, 8
L80036870:
  sh $v0, 8($s4)
L80036874:
  sh $v0, 10($s4)
L80036878:
  sh $v0, 18($s4)
L8003687c:
  sh $v0, 24($s4)
L80036880:
  addiu $v0, $s5, 8
L80036884:
  sh $zero, 12($s4)
L80036888:
  sh $v1, 16($s4)
L8003688c:
  sh $zero, 20($s4)
L80036890:
  sh $v1, 26($s4)
L80036894:
  sh $zero, 28($s4)
L80036898:
  sh $v1, 32($s4)
L8003689c:
  sh $v1, 34($s4)
L800368a0:
  sh $zero, 36($s4)
L800368a4:
  sw $v0, 16($sp)
L800368a8:
  addiu $v0, $s5, 16
L800368ac:
  sw $v0, 20($sp)
L800368b0:
  addiu $v0, $s5, 24
L800368b4:
  sw $v0, 24($sp)
L800368b8:
  addiu $v0, $s5, 32
L800368bc:
  sw $v0, 28($sp)
L800368c0:
  addiu $v0, $s6, 4
L800368c4:
  sw $v0, 36($sp)
L800368c8:
  addiu $v0, $s6, 8
L800368cc:
  addiu $a3, $s4, 32
L800368d0:
  sw $s6, 32($sp)
L800368d4:
  jal 0x80087bc0
L800368d8:
  sw $v0, 40($sp)
L800368dc:
  blez $v0, L80036b88
L800368e0:
  addu $a0, $s5, $zero
L800368e4:
  lw $a1, 260($sp)
L800368e8:
  lhu $a2, 196($sp)
L800368ec:
  j L80036b80
L800368f0:
  sll $zero, $zero, 0x0
L800368f4:
  lw $a1, 260($sp)
L800368f8:
  lhu $a2, 196($sp)
L800368fc:
  jal 0x800849f0
L80036900:
  addu $a0, $s1, $zero
L80036904:
  j L80036b88
L80036908:
  sll $zero, $zero, 0x0
L8003690c:
  lbu $v0, -18($s2)
L80036910:
  sll $zero, $zero, 0x0
L80036914:
  sb $v0, 6($s3)
L80036918:
  sb $v0, 5($s3)
L8003691c:
  sb $v0, 4($s3)
L80036920:
  lbu $v0, -17($s2)
L80036924:
  sll $zero, $zero, 0x0
L80036928:
  sb $v0, 18($s3)
L8003692c:
  sb $v0, 17($s3)
L80036930:
  sb $v0, 16($s3)
L80036934:
  lbu $v0, -16($s2)
L80036938:
  sll $zero, $zero, 0x0
L8003693c:
  sb $v0, 30($s3)
L80036940:
  sb $v0, 29($s3)
L80036944:
  sb $v0, 28($s3)
L80036948:
  lbu $v0, -15($s2)
L8003694c:
  sll $zero, $zero, 0x0
L80036950:
  sb $v0, 42($s3)
L80036954:
  sb $v0, 41($s3)
L80036958:
  sb $v0, 40($s3)
L8003695c:
  lhu $v0, 4($s1)
L80036960:
  sll $zero, $zero, 0x0
L80036964:
  sh $v0, 32($s3)
L80036968:
  sh $v0, 8($s3)
L8003696c:
  lbu $v0, 2($s2)
L80036970:
  sll $zero, $zero, 0x0
L80036974:
  beq $v0, $fp, L80036990
L80036978:
  sll $zero, $zero, 0x0
L8003697c:
  lbu $v0, -5($s2)
L80036980:
  sll $zero, $zero, 0x0
L80036984:
  andi $v0, $v0, 0x20
L80036988:
  beq $v0, $zero, L80036a34
L8003698c:
  sll $zero, $zero, 0x0
L80036990:
  lbu $v0, -2($s2)
L80036994:
  lhu $v1, 4($s1)
L80036998:
  addiu $v0, $v0, 16
L8003699c:
  addu $v1, $v1, $v0
L800369a0:
  sh $v1, 44($s3)
L800369a4:
  sh $v1, 20($s3)
L800369a8:
  lbu $v0, -2($s2)
L800369ac:
  lhu $v1, 6($s1)
L800369b0:
  srl $v0, $v0, 0x2
L800369b4:
  addu $v1, $v1, $v0
L800369b8:
  sh $v1, 10($s3)
L800369bc:
  lhu $v0, 6($s1)
L800369c0:
  sll $zero, $zero, 0x0
L800369c4:
  sh $v0, 22($s3)
L800369c8:
  lhu $v0, 6($s1)
L800369cc:
  sll $zero, $zero, 0x0
L800369d0:
  addiu $v0, $v0, 16
L800369d4:
  sh $v0, 46($s3)
L800369d8:
  sh $v0, 34($s3)
L800369dc:
  lbu $v0, 14($s1)
L800369e0:
  sll $zero, $zero, 0x0
L800369e4:
  sb $v0, 36($s3)
L800369e8:
  sb $v0, 12($s3)
L800369ec:
  lbu $v0, 14($s1)
L800369f0:
  sll $zero, $zero, 0x0
L800369f4:
  addiu $v0, $v0, 16
L800369f8:
  sb $v0, 48($s3)
L800369fc:
  sb $v0, 24($s3)
L80036a00:
  andi $v0, $v0, 0xff
L80036a04:
  bne $v0, $zero, L80036a18
L80036a08:
  sll $zero, $zero, 0x0
L80036a0c:
  addiu $v0, $zero, 255
L80036a10:
  sb $v0, 48($s3)
L80036a14:
  sb $v0, 24($s3)
L80036a18:
  lbu $v0, 15($s1)
L80036a1c:
  sll $zero, $zero, 0x0
L80036a20:
  sb $v0, 25($s3)
L80036a24:
  sb $v0, 13($s3)
L80036a28:
  lbu $v0, 15($s1)
L80036a2c:
  j L80036ad4
L80036a30:
  addiu $v0, $v0, 16
L80036a34:
  lbu $v0, -2($s2)
L80036a38:
  lhu $v1, 4($s1)
L80036a3c:
  addiu $v0, $v0, 8
L80036a40:
  addu $v1, $v1, $v0
L80036a44:
  sh $v1, 44($s3)
L80036a48:
  sh $v1, 20($s3)
L80036a4c:
  lbu $v0, -2($s2)
L80036a50:
  lhu $v1, 6($s1)
L80036a54:
  srl $v0, $v0, 0x2
L80036a58:
  addu $v1, $v1, $v0
L80036a5c:
  sh $v1, 10($s3)
L80036a60:
  lhu $v0, 6($s1)
L80036a64:
  sll $zero, $zero, 0x0
L80036a68:
  sh $v0, 22($s3)
L80036a6c:
  lhu $v0, 6($s1)
L80036a70:
  sll $zero, $zero, 0x0
L80036a74:
  addiu $v0, $v0, 12
L80036a78:
  sh $v0, 46($s3)
L80036a7c:
  sh $v0, 34($s3)
L80036a80:
  lbu $v0, 14($s1)
L80036a84:
  sll $zero, $zero, 0x0
L80036a88:
  sb $v0, 36($s3)
L80036a8c:
  sb $v0, 12($s3)
L80036a90:
  lbu $v0, 14($s1)
L80036a94:
  sll $zero, $zero, 0x0
L80036a98:
  addiu $v0, $v0, 8
L80036a9c:
  sb $v0, 48($s3)
L80036aa0:
  sb $v0, 24($s3)
L80036aa4:
  andi $v0, $v0, 0xff
L80036aa8:
  bne $v0, $zero, L80036ab8
L80036aac:
  addiu $v0, $zero, 255
L80036ab0:
  sb $v0, 48($s3)
L80036ab4:
  sb $v0, 24($s3)
L80036ab8:
  lbu $v0, 15($s1)
L80036abc:
  sll $zero, $zero, 0x0
L80036ac0:
  sb $v0, 25($s3)
L80036ac4:
  sb $v0, 13($s3)
L80036ac8:
  lbu $v0, 15($s1)
L80036acc:
  sll $zero, $zero, 0x0
L80036ad0:
  addiu $v0, $v0, 12
L80036ad4:
  sb $v0, 49($s3)
L80036ad8:
  sb $v0, 37($s3)
L80036adc:
  andi $v0, $v0, 0xff
L80036ae0:
  bne $v0, $zero, L80036af0
L80036ae4:
  addiu $v0, $zero, 255
L80036ae8:
  sb $v0, 49($s3)
L80036aec:
  sb $v0, 37($s3)
L80036af0:
  lhu $v0, 12($s1)
L80036af4:
  sll $zero, $zero, 0x0
L80036af8:
  ori $v0, $v0, 0x20
L80036afc:
  sh $v0, 26($s3)
L80036b00:
  lbu $v0, -5($s2)
L80036b04:
  sll $zero, $zero, 0x0
L80036b08:
  andi $v0, $v0, 0x20
L80036b0c:
  beq $v0, $zero, L80036b34
L80036b10:
  sll $zero, $zero, 0x0
L80036b14:
  lhu $v1, 18($s1)
L80036b18:
  lhu $v0, 16($s1)
L80036b1c:
  sll $v1, $v1, 0x6
L80036b20:
  srl $v0, $v0, 0x4
L80036b24:
  andi $v0, $v0, 0x3f
L80036b28:
  or $v1, $v1, $v0
L80036b2c:
  j L80036b4c
L80036b30:
  sh $v1, 14($s3)
L80036b34:
  lbu $v0, 0($s2)
L80036b38:
  sll $zero, $zero, 0x0
L80036b3c:
  addiu $v0, $v0, 232
L80036b40:
  sll $v0, $v0, 0x6
L80036b44:
  ori $v0, $v0, 0x28
L80036b48:
  sh $v0, 14($s3)
L80036b4c:
  addu $a0, $s3, $zero
L80036b50:
  lhu $s0, 196($sp)
L80036b54:
  lw $a1, 260($sp)
L80036b58:
  jal 0x80084320
L80036b5c:
  addu $a2, $s0, $zero
L80036b60:
  addu $a0, $s3, $zero
L80036b64:
  addu $a2, $s0, $zero
L80036b68:
  lw $a1, 260($sp)
L80036b6c:
  lhu $v1, 12($s1)
L80036b70:
  addiu $v0, $zero, 16354
L80036b74:
  sh $v0, 14($s3)
L80036b78:
  ori $v1, $v1, 0x40
L80036b7c:
  sh $v1, 26($s3)
L80036b80:
  jal 0x80084320
L80036b84:
  sll $zero, $zero, 0x0
L80036b88:
  lw $t2, 200($sp)
L80036b8c:
  addiu $s2, $s2, 28
L80036b90:
  addiu $t2, $t2, 28
L80036b94:
  j L80036058
L80036b98:
  sw $t2, 200($sp)
L80036b9c:
  lw $ra, 252($sp)
L80036ba0:
  lw $fp, 248($sp)
L80036ba4:
  lw $s7, 244($sp)
L80036ba8:
  lw $s6, 240($sp)
L80036bac:
  lw $s5, 236($sp)
L80036bb0:
  lw $s4, 232($sp)
L80036bb4:
  lw $s3, 228($sp)
L80036bb8:
  lw $s2, 224($sp)
L80036bbc:
  lw $s1, 220($sp)
L80036bc0:
  lw $s0, 216($sp)
L80036bc4:
  jr $ra
L80036bc8:
  addiu $sp, $sp, 256
L80036bcc:
  lui $v0, 0x801e
L80036bd0:
  addiu $a2, $v0, -28300
L80036bd4:
  lui $v0, 0x801e
L80036bd8:
  addiu $a1, $v0, -28300
L80036bdc:
  lbu $v0, 0($a1)
L80036be0:
  lbu $v1, 1($a1)
L80036be4:
  sll $v0, $v0, 0x8
L80036be8:
  or $v0, $v0, $v1
L80036bec:
  bne $v0, $zero, L80036bfc
L80036bf0:
  sll $zero, $zero, 0x0
L80036bf4:
  jr $ra
L80036bf8:
  addu $v0, $zero, $zero
L80036bfc:
  beq $v0, $a0, L80036c0c
L80036c00:
  addiu $a1, $a1, 2
L80036c04:
  j L80036bdc
L80036c08:
  addiu $a2, $a2, 30
L80036c0c:
  jr $ra
L80036c10:
  addu $v0, $a2, $zero
L80036c14:
  lbu $v0, 87($a0)
L80036c18:
  lw $a2, 32($a0)
L80036c1c:
  addiu $v0, $v0, 1
L80036c20:
  sb $v0, 18($a2)
L80036c24:
  addiu $v0, $zero, 1
L80036c28:
  sb $v0, 19($a2)
L80036c2c:
  lui $v0, 0x801e
L80036c30:
  sb $zero, 21($a2)
L80036c34:
  lhu $v1, 52($a0)
L80036c38:
  addiu $a3, $v0, -24576
L80036c3c:
  andi $v0, $v1, 0x80
L80036c40:
  beq $v0, $zero, L80036c5c
L80036c44:
  addiu $v0, $zero, 160
L80036c48:
  sb $a1, 16($a2)
L80036c4c:
  lbu $v1, 98($a0)
L80036c50:
  sb $v0, 17($a2)
L80036c54:
  j L80036cf8
L80036c58:
  sb $v1, 23($a2)
L80036c5c:
  andi $v0, $v1, 0x100
L80036c60:
  beq $v0, $zero, L80036c90
L80036c64:
  sra $v0, $a1, 0x14
L80036c68:
  andi $v0, $v0, 0xff
L80036c6c:
  beq $v0, $zero, L80036d34
L80036c70:
  sll $zero, $zero, 0x0
L80036c74:
  sb $v0, 16($a2)
L80036c78:
  addiu $v0, $zero, 192
L80036c7c:
  sb $v0, 17($a2)
L80036c80:
  lbu $v0, 84($a0)
L80036c84:
  sb $zero, 19($a2)
L80036c88:
  j L80036cf8
L80036c8c:
  sb $v0, 22($a2)
L80036c90:
  lui $v0, 0x8000
L80036c94:
  ori $v0, $v0, 0xffff
L80036c98:
  and $a1, $a1, $v0
L80036c9c:
  beq $a1, $zero, L80036d34
L80036ca0:
  andi $v0, $v1, 0x200
L80036ca4:
  beq $v0, $zero, L80036cc4
L80036ca8:
  sll $zero, $zero, 0x0
L80036cac:
  lbu $v1, 96($a0)
L80036cb0:
  sll $zero, $zero, 0x0
L80036cb4:
  sll $v0, $v1, 0x4
L80036cb8:
  addu $v0, $v0, $v1
L80036cbc:
  sll $v0, $v0, 0x3
L80036cc0:
  addu $a3, $v0, $a3
L80036cc4:
  sb $zero, 16($a2)
L80036cc8:
  lbu $v1, 84($a0)
L80036ccc:
  addiu $v0, $zero, 128
L80036cd0:
  sb $v0, 17($a2)
L80036cd4:
  addiu $v0, $zero, 640
L80036cd8:
  sw $a1, 0($a2)
L80036cdc:
  sb $v1, 22($a2)
L80036ce0:
  sh $v0, 0($a3)
L80036ce4:
  addiu $v0, $zero, 4
L80036ce8:
  sh $v0, 4($a3)
L80036cec:
  addiu $v0, $zero, 16
L80036cf0:
  sh $zero, 2($a3)
L80036cf4:
  sh $v0, 6($a3)
L80036cf8:
  lhu $v0, 52($a0)
L80036cfc:
  sll $zero, $zero, 0x0
L80036d00:
  andi $v0, $v0, 0x1c00
L80036d04:
  beq $v0, $zero, L80036d10
L80036d08:
  sll $zero, $zero, 0x0
L80036d0c:
  sb $zero, 19($a2)
L80036d10:
  lhu $v0, 56($a0)
L80036d14:
  sll $zero, $zero, 0x0
L80036d18:
  sh $v0, 12($a2)
L80036d1c:
  lhu $v0, 58($a0)
L80036d20:
  sll $zero, $zero, 0x0
L80036d24:
  sh $v0, 14($a2)
L80036d28:
  addiu $a2, $a2, 28
L80036d2c:
  sb $zero, 17($a2)
L80036d30:
  sw $a2, 32($a0)
L80036d34:
  jr $ra
L80036d38:
  sll $zero, $zero, 0x0
L80036d3c:
  lb $v0, 88($a0)
L80036d40:
  sll $zero, $zero, 0x0
L80036d44:
  sll $v0, $v0, 0x2
L80036d48:
  addu $a0, $a0, $v0
L80036d4c:
  lw $v1, 0($a0)
L80036d50:
  sll $zero, $zero, 0x0
L80036d54:
  addiu $v0, $v1, 2
L80036d58:
  sw $v0, 0($a0)
L80036d5c:
  lbu $v0, 1($v1)
L80036d60:
  lbu $v1, 0($v1)
L80036d64:
  sll $v0, $v0, 0x8
L80036d68:
  jr $ra
L80036d6c:
  or $v0, $v1, $v0
L80036d70:
  lb $v0, 88($a0)
L80036d74:
  sll $zero, $zero, 0x0
L80036d78:
  sll $v0, $v0, 0x2
L80036d7c:
  addu $a0, $a0, $v0
L80036d80:
  lw $a1, 0($a0)
L80036d84:
  sll $zero, $zero, 0x0
L80036d88:
  addiu $v0, $a1, 4
L80036d8c:
  sw $v0, 0($a0)
L80036d90:
  lbu $v0, 3($a1)
L80036d94:
  lbu $v1, 2($a1)
L80036d98:
  lbu $a0, 1($a1)
L80036d9c:
  sll $v0, $v0, 0x18
L80036da0:
  sll $v1, $v1, 0x10
L80036da4:
  or $v0, $v0, $v1
L80036da8:
  sll $a0, $a0, 0x8
L80036dac:
  lbu $v1, 0($a1)
L80036db0:
  or $v0, $v0, $a0
L80036db4:
  jr $ra
L80036db8:
  or $v0, $v0, $v1
L80036dbc:
  addu $a2, $a0, $zero
L80036dc0:
  lw $a1, 48($a2)
L80036dc4:
  lhu $v0, 60($a2)
L80036dc8:
  sll $zero, $zero, 0x0
L80036dcc:
  sh $v0, 72($a1)
L80036dd0:
  sh $v0, 56($a1)
L80036dd4:
  sh $v0, 40($a1)
L80036dd8:
  lhu $v0, 60($a2)
L80036ddc:
  lhu $v1, 62($a2)
L80036de0:
  lui $a0, 0x800f
L80036de4:
  addu $v0, $v0, $v1
L80036de8:
  lui $v1, 0x8009
L80036dec:
  sh $v0, 80($a1)
L80036df0:
  sh $v0, 64($a1)
L80036df4:
  sh $v0, 48($a1)
L80036df8:
  lbu $v0, 87($a2)
L80036dfc:
  addiu $v1, $v1, 3672
L80036e00:
  sll $v0, $v0, 0x1
L80036e04:
  addu $v0, $v0, $v1
L80036e08:
  lhu $v1, 0($v0)
L80036e0c:
  addiu $a0, $a0, -19832
L80036e10:
  sll $v0, $v1, 0x3
L80036e14:
  subu $v0, $v0, $v1
L80036e18:
  sll $v0, $v0, 0x2
L80036e1c:
  addu $v0, $v0, $a0
L80036e20:
  lbu $a0, 24($v0)
L80036e24:
  lui $v0, 0xcccc
L80036e28:
  ori $v0, $v0, 0xcccd
L80036e2c:
  multu $a0, $v0
L80036e30:
  mfhi $a3
L80036e34:
  srl $v1, $a3, 0x3
L80036e38:
  sll $v0, $v1, 0x2
L80036e3c:
  addu $v0, $v0, $v1
L80036e40:
  sll $v0, $v0, 0x1
L80036e44:
  subu $a0, $a0, $v0
L80036e48:
  andi $a0, $a0, 0xff
L80036e4c:
  addiu $v0, $zero, 1
L80036e50:
  bne $a0, $v0, L80036eb0
L80036e54:
  addiu $v0, $zero, 2
L80036e58:
  lbu $v0, 1092($gp)
L80036e5c:
  sll $zero, $zero, 0x0
L80036e60:
  andi $v0, $v0, 0x30
L80036e64:
  bgez $v0, L80036e74
L80036e68:
  andi $a0, $v0, 0x70
L80036e6c:
  addiu $v0, $v0, 15
L80036e70:
  andi $a0, $v0, 0x70
L80036e74:
  lhu $v0, 64($a2)
L80036e78:
  lb $v1, 1093($gp)
L80036e7c:
  addu $v0, $v0, $a0
L80036e80:
  sll $v1, $v1, 0x4
L80036e84:
  addu $v0, $v0, $v1
L80036e88:
  sh $v0, 42($a1)
L80036e8c:
  addu $v1, $v0, $zero
L80036e90:
  sh $v0, 50($a1)
L80036e94:
  addiu $v0, $v0, 16
L80036e98:
  addiu $v1, $v1, 16
L80036e9c:
  sh $v0, 66($a1)
L80036ea0:
  sh $v0, 58($a1)
L80036ea4:
  sh $v1, 82($a1)
L80036ea8:
  jr $ra
L80036eac:
  sh $v1, 74($a1)
L80036eb0:
  bne $a0, $v0, L80036f08
L80036eb4:
  sll $zero, $zero, 0x0
L80036eb8:
  lbu $v0, 1092($gp)
L80036ebc:
  sll $zero, $zero, 0x0
L80036ec0:
  andi $v0, $v0, 0x30
L80036ec4:
  bgez $v0, L80036ed0
L80036ec8:
  sll $zero, $zero, 0x0
L80036ecc:
  addiu $v0, $v0, 15
L80036ed0:
  srl $v1, $v0, 0x4
L80036ed4:
  sll $v0, $v1, 0x1
L80036ed8:
  addu $v0, $v0, $v1
L80036edc:
  sll $v0, $v0, 0x2
L80036ee0:
  lhu $v1, 64($a2)
L80036ee4:
  lb $a0, 1093($gp)
L80036ee8:
  addu $v1, $v1, $v0
L80036eec:
  sll $v0, $a0, 0x1
L80036ef0:
  addu $v0, $v0, $a0
L80036ef4:
  sll $v0, $v0, 0x2
L80036ef8:
  addu $v1, $v1, $v0
L80036efc:
  addiu $v0, $v1, -2
L80036f00:
  j L80036f5c
L80036f04:
  addiu $v1, $v1, 6
L80036f08:
  bne $a0, $zero, L80036f78
L80036f0c:
  sll $zero, $zero, 0x0
L80036f10:
  lbu $v0, 1092($gp)
L80036f14:
  sll $zero, $zero, 0x0
L80036f18:
  andi $v0, $v0, 0x30
L80036f1c:
  bgez $v0, L80036f2c
L80036f20:
  srl $v1, $v0, 0x4
L80036f24:
  addiu $v0, $v0, 15
L80036f28:
  srl $v1, $v0, 0x4
L80036f2c:
  sll $v0, $v1, 0x1
L80036f30:
  addu $v0, $v0, $v1
L80036f34:
  sll $v0, $v0, 0x2
L80036f38:
  lhu $v1, 64($a2)
L80036f3c:
  lb $a0, 1093($gp)
L80036f40:
  addu $v1, $v1, $v0
L80036f44:
  sll $v0, $a0, 0x1
L80036f48:
  addu $v0, $v0, $a0
L80036f4c:
  sll $v0, $v0, 0x2
L80036f50:
  addu $v1, $v1, $v0
L80036f54:
  addiu $v0, $v1, 2
L80036f58:
  addiu $v1, $v1, 10
L80036f5c:
  sh $v0, 50($a1)
L80036f60:
  sh $v0, 42($a1)
L80036f64:
  addiu $v0, $v0, 12
L80036f68:
  sh $v1, 66($a1)
L80036f6c:
  sh $v1, 58($a1)
L80036f70:
  sh $v0, 82($a1)
L80036f74:
  sh $v0, 74($a1)
L80036f78:
  jr $ra
L80036f7c:
  sll $zero, $zero, 0x0
L80036f80:
  addiu $sp, $sp, -24
L80036f84:
  lbu $v0, 1070($gp)
L80036f88:
  lb $v1, 1093($gp)
L80036f8c:
  sw $ra, 16($sp)
L80036f90:
  srav $v0, $v0, $v1
L80036f94:
  andi $v0, $v0, 0x1
L80036f98:
  lw $v1, 48($a0)
L80036f9c:
  bne $v0, $zero, L80036fa8
L80036fa0:
  ori $a1, $zero, 0xc0c0
L80036fa4:
  addiu $a1, $zero, 192
L80036fa8:
  sw $a1, 12($v1)
L80036fac:
  lw $v0, 48($a0)
L80036fb0:
  sll $zero, $zero, 0x0
L80036fb4:
  sw $a1, 60($v0)
L80036fb8:
  lw $v0, 48($a0)
L80036fbc:
  addu $v1, $a1, $zero
L80036fc0:
  bgez $a1, L80036fcc
L80036fc4:
  sw $a1, 68($v0)
L80036fc8:
  addiu $v1, $a1, 3
L80036fcc:
  lw $v0, 48($a0)
L80036fd0:
  sra $a1, $v1, 0x2
L80036fd4:
  sw $a1, 44($v0)
L80036fd8:
  lw $v0, 48($a0)
L80036fdc:
  sll $zero, $zero, 0x0
L80036fe0:
  sw $a1, 52($v0)
L80036fe4:
  lw $v0, 48($a0)
L80036fe8:
  sll $zero, $zero, 0x0
L80036fec:
  sw $a1, 76($v0)
L80036ff0:
  lw $v0, 48($a0)
L80036ff4:
  jal L80036dbc
L80036ff8:
  sw $a1, 84($v0)
L80036ffc:
  lw $ra, 16($sp)
L80037000:
  sll $zero, $zero, 0x0
L80037004:
  jr $ra
L80037008:
  addiu $sp, $sp, 24
L8003700c:
  lui $v0, 0x800a
L80037010:
  lhu $v0, -19564($v0)
L80037014:
  addiu $sp, $sp, -24
L80037018:
  sw $s0, 16($sp)
L8003701c:
  addu $s0, $a0, $zero
L80037020:
  andi $v0, $v0, 0x5008
L80037024:
  beq $v0, $zero, L800370fc
L80037028:
  sw $ra, 20($sp)
L8003702c:
  lui $v0, 0x800a
L80037030:
  lhu $v0, -19564($v0)
L80037034:
  sll $zero, $zero, 0x0
L80037038:
  andi $v0, $v0, 0x8
L8003703c:
  beq $v0, $zero, L80037074
L80037040:
  sll $zero, $zero, 0x0
L80037044:
  lbu $v0, 1093($gp)
L80037048:
  lb $v1, 1085($gp)
L8003704c:
  addiu $v0, $v0, 1
L80037050:
  sb $v0, 1093($gp)
L80037054:
  sll $v0, $v0, 0x18
L80037058:
  sra $v0, $v0, 0x18
L8003705c:
  slt $v0, $v0, $v1
L80037060:
  bne $v0, $zero, L800370e4
L80037064:
  sll $zero, $zero, 0x0
L80037068:
  sb $zero, 1093($gp)
L8003706c:
  j L800370e4
L80037070:
  sll $zero, $zero, 0x0
L80037074:
  lui $v0, 0x800a
L80037078:
  lhu $v0, -19564($v0)
L8003707c:
  sll $zero, $zero, 0x0
L80037080:
  andi $v0, $v0, 0x4000
L80037084:
  beq $v0, $zero, L800370bc
L80037088:
  sll $zero, $zero, 0x0
L8003708c:
  lbu $a0, 1093($gp)
L80037090:
  lb $v1, 1085($gp)
L80037094:
  addiu $v0, $a0, 1
L80037098:
  sb $v0, 1093($gp)
L8003709c:
  sll $v0, $v0, 0x18
L800370a0:
  sra $v0, $v0, 0x18
L800370a4:
  slt $v0, $v0, $v1
L800370a8:
  bne $v0, $zero, L800370e4
L800370ac:
  addiu $v0, $zero, 1
L800370b0:
  sb $a0, 1093($gp)
L800370b4:
  j L80037100
L800370b8:
  sll $zero, $zero, 0x0
L800370bc:
  lbu $v1, 1093($gp)
L800370c0:
  sll $zero, $zero, 0x0
L800370c4:
  addiu $v0, $v1, -1
L800370c8:
  sb $v0, 1093($gp)
L800370cc:
  sll $v0, $v0, 0x18
L800370d0:
  bgez $v0, L800370e4
L800370d4:
  addiu $v0, $zero, 1
L800370d8:
  sb $v1, 1093($gp)
L800370dc:
  j L80037100
L800370e0:
  sll $zero, $zero, 0x0
L800370e4:
  jal L8003fee0
L800370e8:
  addiu $a0, $zero, 6
L800370ec:
  jal L80036f80
L800370f0:
  addu $a0, $s0, $zero
L800370f4:
  j L80037100
L800370f8:
  addiu $v0, $zero, 1
L800370fc:
  addu $v0, $zero, $zero
L80037100:
  lw $ra, 20($sp)
L80037104:
  lw $s0, 16($sp)
L80037108:
  jr $ra
L8003710c:
  addiu $sp, $sp, 24
L80037110:
  lui $v0, 0x800a
L80037114:
  lw $v0, -20324($v0)
L80037118:
  addu $a2, $zero, $zero
L8003711c:
  andi $a1, $v0, 0x7f
L80037120:
  slti $v0, $a1, 64
L80037124:
  bne $v0, $zero, L80037134
L80037128:
  addu $a3, $a0, $zero
L8003712c:
  addiu $v0, $zero, 127
L80037130:
  subu $a1, $v0, $a1
L80037134:
  sll $v0, $a1, 0x1
L80037138:
  lbu $v1, 12($a0)
L8003713c:
  sll $zero, $zero, 0x0
L80037140:
  beq $v1, $zero, L8003714c
L80037144:
  addiu $a1, $v0, 128
L80037148:
  addu $a2, $a1, $zero
L8003714c:
  lbu $v0, 13($a0)
L80037150:
  sll $zero, $zero, 0x0
L80037154:
  beq $v0, $zero, L80037160
L80037158:
  sll $v0, $a1, 0x8
L8003715c:
  or $a2, $a2, $v0
L80037160:
  lbu $v0, 14($a0)
L80037164:
  sll $zero, $zero, 0x0
L80037168:
  beq $v0, $zero, L80037174
L8003716c:
  sll $v0, $a1, 0x10
L80037170:
  or $a2, $a2, $v0
L80037174:
  lui $v0, 0xfc
L80037178:
  ori $v0, $v0, 0xfcfc
L8003717c:
  and $v0, $a2, $v0
L80037180:
  sw $a2, 60($a0)
L80037184:
  bgez $v0, L80037190
L80037188:
  sw $a2, 68($a0)
L8003718c:
  addiu $v0, $v0, 3
L80037190:
  sra $a2, $v0, 0x2
L80037194:
  sw $a2, 44($a3)
L80037198:
  sw $a2, 52($a3)
L8003719c:
  sw $a2, 76($a3)
L800371a0:
  jr $ra
L800371a4:
  sw $a2, 84($a3)
L800371a8:
  addiu $sp, $sp, -32
L800371ac:
  sw $s1, 20($sp)
L800371b0:
  addu $s1, $a0, $zero
L800371b4:
  sw $ra, 24($sp)
L800371b8:
  sw $s0, 16($sp)
L800371bc:
  lbu $v1, 81($s1)
L800371c0:
  sll $zero, $zero, 0x0
L800371c4:
  andi $v0, $v1, 0x80
L800371c8:
  bne $v0, $zero, L80037264
L800371cc:
  ori $v0, $v1, 0x80
L800371d0:
  jal 0x8004006c
L800371d4:
  sb $v0, 81($s1)
L800371d8:
  addu $a0, $v0, $zero
L800371dc:
  jal 0x800400ac
L800371e0:
  addiu $a1, $zero, 4
L800371e4:
  addu $s0, $v0, $zero
L800371e8:
  addu $a0, $s0, $zero
L800371ec:
  jal 0x800427dc
L800371f0:
  addiu $a1, $zero, 1
L800371f4:
  jal 0x80042918
L800371f8:
  addu $a0, $s0, $zero
L800371fc:
  lw $v0, 40($s1)
L80037200:
  sll $zero, $zero, 0x0
L80037204:
  lbu $a1, 22($v0)
L80037208:
  addu $a0, $s0, $zero
L8003720c:
  addiu $a1, $a1, 1
L80037210:
  sll $a1, $a1, 0x18
L80037214:
  jal 0x800428ec
L80037218:
  sra $a1, $a1, 0x18
L8003721c:
  addu $a0, $s1, $zero
L80037220:
  addiu $v0, $zero, 8192
L80037224:
  sw $s0, 48($s1)
L80037228:
  sw $v0, 84($s0)
L8003722c:
  sw $v0, 76($s0)
L80037230:
  sw $v0, 52($s0)
L80037234:
  sw $v0, 44($s0)
L80037238:
  ori $v0, $zero, 0xc000
L8003723c:
  sw $v0, 68($s0)
L80037240:
  sw $v0, 60($s0)
L80037244:
  lui $v0, 0x8003
L80037248:
  addiu $v0, $v0, 28944
L8003724c:
  sw $v0, 36($s0)
L80037250:
  lw $v0, 4($s0)
L80037254:
  lui $v1, 0x5000
L80037258:
  or $v0, $v0, $v1
L8003725c:
  jal L80036f80
L80037260:
  sw $v0, 4($s0)
L80037264:
  lhu $v0, 52($s1)
L80037268:
  sll $zero, $zero, 0x0
L8003726c:
  andi $v0, $v0, 0x4
L80037270:
  bne $v0, $zero, L80037348
L80037274:
  sll $zero, $zero, 0x0
L80037278:
  lb $a0, 1055($gp)
L8003727c:
  lbu $v1, 1055($gp)
L80037280:
  beq $a0, $zero, L800372c4
L80037284:
  andi $v0, $v1, 0x40
L80037288:
  beq $v0, $zero, L800372ac
L8003728c:
  andi $v0, $v1, 0xbf
L80037290:
  sb $v0, 1055($gp)
L80037294:
  andi $v0, $v1, 0x7
L80037298:
  sb $v0, 1093($gp)
L8003729c:
  jal L80036f80
L800372a0:
  addu $a0, $s1, $zero
L800372a4:
  j L80037348
L800372a8:
  sll $zero, $zero, 0x0
L800372ac:
  andi $v0, $a0, 0x80
L800372b0:
  beq $v0, $zero, L80037348
L800372b4:
  addiu $v0, $zero, 1
L800372b8:
  sb $zero, 1055($gp)
L800372bc:
  j L800372ec
L800372c0:
  sll $zero, $zero, 0x0
L800372c4:
  jal L8003700c
L800372c8:
  addu $a0, $s1, $zero
L800372cc:
  bne $v0, $zero, L80037348
L800372d0:
  sll $zero, $zero, 0x0
L800372d4:
  lui $v0, 0x800a
L800372d8:
  lhu $v0, -19560($v0)
L800372dc:
  sll $zero, $zero, 0x0
L800372e0:
  andi $v0, $v0, 0xc0
L800372e4:
  beq $v0, $zero, L80037348
L800372e8:
  addiu $v0, $zero, 1
L800372ec:
  lb $a0, 1093($gp)
L800372f0:
  lbu $v1, 1070($gp)
L800372f4:
  sllv $v0, $v0, $a0
L800372f8:
  and $v1, $v1, $v0
L800372fc:
  bne $v1, $zero, L80037314
L80037300:
  addiu $a0, $zero, 7
L80037304:
  jal L8003fee0
L80037308:
  addiu $a0, $zero, 9
L8003730c:
  j L80037348
L80037310:
  sll $zero, $zero, 0x0
L80037314:
  jal L8003fee0
L80037318:
  sb $zero, 81($s1)
L8003731c:
  lbu $v0, 1092($gp)
L80037320:
  sll $zero, $zero, 0x0
L80037324:
  andi $v0, $v0, 0x40
L80037328:
  bne $v0, $zero, L80037348
L8003732c:
  sll $zero, $zero, 0x0
L80037330:
  lw $a0, 48($s1)
L80037334:
  jal 0x8004036c
L80037338:
  sll $zero, $zero, 0x0
L8003733c:
  addiu $v0, $zero, 3
L80037340:
  sw $zero, 48($s1)
L80037344:
  sb $v0, 81($s1)
L80037348:
  lw $ra, 24($sp)
L8003734c:
  lw $s1, 20($sp)
L80037350:
  lw $s0, 16($sp)
L80037354:
  jr $ra
L80037358:
  addiu $sp, $sp, 32
L8003735c:
  lhu $v0, 92($a0)
L80037360:
  lhu $a0, 94($a0)
L80037364:
  sll $v1, $v0, 0x3
L80037368:
  subu $v1, $v1, $v0
L8003736c:
  sll $v1, $v1, 0x2
L80037370:
  lui $v0, 0x800f
L80037374:
  addiu $v0, $v0, -19832
L80037378:
  beq $a0, $zero, L800373b8
L8003737c:
  addu $v1, $v1, $v0
L80037380:
  addiu $v1, $v1, 19
L80037384:
  lbu $v0, -2($v1)
L80037388:
  sll $zero, $zero, 0x0
L8003738c:
  andi $v0, $v0, 0x80
L80037390:
  beq $v0, $zero, L800373c0
L80037394:
  addu $v0, $zero, $zero
L80037398:
  lbu $v0, 0($v1)
L8003739c:
  sll $zero, $zero, 0x0
L800373a0:
  beq $v0, $zero, L800373b0
L800373a4:
  addiu $a0, $a0, -1
L800373a8:
  jr $ra
L800373ac:
  addiu $v0, $zero, 1
L800373b0:
  bne $a0, $zero, L80037384
L800373b4:
  addiu $v1, $v1, 28
L800373b8:
  jr $ra
L800373bc:
  addu $v0, $zero, $zero
L800373c0:
  jr $ra
L800373c4:
  sll $zero, $zero, 0x0
L800373c8:
  lhu $v0, 92($a0)
L800373cc:
  lhu $a0, 94($a0)
L800373d0:
  sll $v1, $v0, 0x3
L800373d4:
  subu $v1, $v1, $v0
L800373d8:
  sll $v1, $v1, 0x2
L800373dc:
  lui $v0, 0x800f
L800373e0:
  addiu $v0, $v0, -19832
L800373e4:
  beq $a0, $zero, L80037414
L800373e8:
  addu $v1, $v1, $v0
L800373ec:
  addiu $v1, $v1, 21
L800373f0:
  lbu $v0, -4($v1)
L800373f4:
  sll $zero, $zero, 0x0
L800373f8:
  andi $v0, $v0, 0x80
L800373fc:
  beq $v0, $zero, L80037414
L80037400:
  addiu $a0, $a0, -1
L80037404:
  sb $a1, -2($v1)
L80037408:
  sb $a2, 0($v1)
L8003740c:
  bne $a0, $zero, L800373f0
L80037410:
  addiu $v1, $v1, 28
L80037414:
  jr $ra
L80037418:
  sll $zero, $zero, 0x0
L8003741c:
  addiu $sp, $sp, -24
L80037420:
  sw $ra, 16($sp)
L80037424:
  lbu $v1, 81($a0)
L80037428:
  sll $zero, $zero, 0x0
L8003742c:
  andi $v0, $v1, 0x80
L80037430:
  bne $v0, $zero, L80037450
L80037434:
  ori $v0, $v1, 0x80
L80037438:
  sb $v0, 81($a0)
L8003743c:
  addiu $a1, $zero, 2
L80037440:
  jal L800373c8
L80037444:
  addu $a2, $zero, $zero
L80037448:
  j L80037498
L8003744c:
  sll $zero, $zero, 0x0
L80037450:
  lhu $v1, 92($a0)
L80037454:
  sll $zero, $zero, 0x0
L80037458:
  sll $v0, $v1, 0x3
L8003745c:
  subu $v0, $v0, $v1
L80037460:
  sll $v0, $v0, 0x2
L80037464:
  lui $v1, 0x800f
L80037468:
  addiu $v1, $v1, -19832
L8003746c:
  addu $v0, $v0, $v1
L80037470:
  lbu $v0, 17($v0)
L80037474:
  sll $zero, $zero, 0x0
L80037478:
  andi $v0, $v0, 0x80
L8003747c:
  bne $v0, $zero, L80037498
L80037480:
  sll $zero, $zero, 0x0
L80037484:
  sb $zero, 86($a0)
L80037488:
  sh $zero, 56($a0)
L8003748c:
  sh $zero, 58($a0)
L80037490:
  sb $zero, 81($a0)
L80037494:
  sb $zero, 98($a0)
L80037498:
  lw $ra, 16($sp)
L8003749c:
  sll $zero, $zero, 0x0
L800374a0:
  jr $ra
L800374a4:
  addiu $sp, $sp, 24
L800374a8:
  addiu $sp, $sp, -24
L800374ac:
  sw $s0, 16($sp)
L800374b0:
  addu $s0, $a0, $zero
L800374b4:
  sw $ra, 20($sp)
L800374b8:
  lbu $v1, 81($s0)
L800374bc:
  sll $zero, $zero, 0x0
L800374c0:
  andi $v0, $v1, 0x80
L800374c4:
  bne $v0, $zero, L800374e4
L800374c8:
  ori $v0, $v1, 0x80
L800374cc:
  addiu $a1, $zero, 3
L800374d0:
  addu $a2, $zero, $zero
L800374d4:
  jal L800373c8
L800374d8:
  sb $v0, 81($s0)
L800374dc:
  addiu $v0, $zero, 130
L800374e0:
  sb $v0, 81($s0)
L800374e4:
  lw $ra, 20($sp)
L800374e8:
  lw $s0, 16($sp)
L800374ec:
  jr $ra
L800374f0:
  addiu $sp, $sp, 24
L800374f4:
  addiu $sp, $sp, -48
L800374f8:
  sw $s1, 36($sp)
L800374fc:
  addu $s1, $a0, $zero
L80037500:
  sw $ra, 40($sp)
L80037504:
  jal 0x8004006c
L80037508:
  sw $s0, 32($sp)
L8003750c:
  addu $a0, $v0, $zero
L80037510:
  jal 0x800400ac
L80037514:
  addiu $a1, $zero, 2
L80037518:
  addu $s0, $v0, $zero
L8003751c:
  addu $a0, $s0, $zero
L80037520:
  lh $a1, 60($s1)
L80037524:
  lh $v1, 62($s1)
L80037528:
  lh $a2, 64($s1)
L8003752c:
  lh $a3, 66($s1)
L80037530:
  addiu $v0, $zero, 11
L80037534:
  sw $v0, 24($sp)
L80037538:
  addiu $v0, $zero, 524
L8003753c:
  sw $zero, 16($sp)
L80037540:
  sw $zero, 20($sp)
L80037544:
  sw $v0, 28($sp)
L80037548:
  addu $a1, $a1, $v1
L8003754c:
  addiu $a1, $a1, -16
L80037550:
  addu $a2, $a2, $a3
L80037554:
  addiu $a2, $a2, -16
L80037558:
  jal 0x800404cc
L8003755c:
  addiu $a3, $zero, 3
L80037560:
  lhu $v0, 8($s0)
L80037564:
  addu $a0, $s0, $zero
L80037568:
  ori $v0, $v0, 0x28
L8003756c:
  jal 0x80042918
L80037570:
  sh $v0, 8($s0)
L80037574:
  lbu $a1, 89($s1)
L80037578:
  addu $a0, $s0, $zero
L8003757c:
  addiu $a1, $a1, 1
L80037580:
  sll $a1, $a1, 0x18
L80037584:
  jal 0x800428ec
L80037588:
  sra $a1, $a1, 0x18
L8003758c:
  addu $v0, $s0, $zero
L80037590:
  lw $ra, 40($sp)
L80037594:
  lw $s1, 36($sp)
L80037598:
  lw $s0, 32($sp)
L8003759c:
  jr $ra
L800375a0:
  addiu $sp, $sp, 48
L800375a4:
  addiu $sp, $sp, -24
L800375a8:
  sw $s0, 16($sp)
L800375ac:
  addu $s0, $a0, $zero
L800375b0:
  sw $ra, 20($sp)
L800375b4:
  lbu $v1, 81($s0)
L800375b8:
  sll $zero, $zero, 0x0
L800375bc:
  andi $v0, $v1, 0x80
L800375c0:
  bne $v0, $zero, L800375e4
L800375c4:
  ori $v0, $v1, 0x80
L800375c8:
  sb $v0, 81($s0)
L800375cc:
  addiu $v0, $zero, 10
L800375d0:
  sb $v0, 1060($gp)
L800375d4:
  jal L800374f4
L800375d8:
  sll $zero, $zero, 0x0
L800375dc:
  j L8003766c
L800375e0:
  sw $v0, 48($s0)
L800375e4:
  lui $v0, 0x800a
L800375e8:
  lhu $v0, -19548($v0)
L800375ec:
  sll $zero, $zero, 0x0
L800375f0:
  andi $v0, $v0, 0x80
L800375f4:
  beq $v0, $zero, L80037624
L800375f8:
  addiu $v0, $zero, 10
L800375fc:
  lbu $v0, 1060($gp)
L80037600:
  sll $zero, $zero, 0x0
L80037604:
  addiu $v0, $v0, -1
L80037608:
  sb $v0, 1060($gp)
L8003760c:
  sll $v0, $v0, 0x18
L80037610:
  bgez $v0, L80037628
L80037614:
  sll $zero, $zero, 0x0
L80037618:
  sb $zero, 1060($gp)
L8003761c:
  j L80037628
L80037620:
  sll $zero, $zero, 0x0
L80037624:
  sb $v0, 1060($gp)
L80037628:
  lb $v0, 1060($gp)
L8003762c:
  sll $zero, $zero, 0x0
L80037630:
  beq $v0, $zero, L80037650
L80037634:
  sll $zero, $zero, 0x0
L80037638:
  lui $v0, 0x800a
L8003763c:
  lhu $v0, -19560($v0)
L80037640:
  sll $zero, $zero, 0x0
L80037644:
  andi $v0, $v0, 0xc0
L80037648:
  beq $v0, $zero, L8003766c
L8003764c:
  sll $zero, $zero, 0x0
L80037650:
  jal L8003fee0
L80037654:
  addiu $a0, $zero, 11
L80037658:
  lw $a0, 48($s0)
L8003765c:
  addiu $v0, $zero, 2
L80037660:
  jal 0x8004036c
L80037664:
  sb $v0, 81($s0)
L80037668:
  sw $zero, 48($s0)
L8003766c:
  lw $ra, 20($sp)
L80037670:
  lw $s0, 16($sp)
L80037674:
  jr $ra
L80037678:
  addiu $sp, $sp, 24
L8003767c:
  addiu $sp, $sp, -24
L80037680:
  sw $s0, 16($sp)
L80037684:
  sw $ra, 20($sp)
L80037688:
  lui $at, 0x800a
L8003768c:
  sh $zero, -19798($at)
L80037690:
  lui $at, 0x800a
L80037694:
  sh $zero, -19800($at)
L80037698:
  jal L80036d3c
L8003769c:
  addu $s0, $a0, $zero
L800376a0:
  lui $at, 0x800a
L800376a4:
  sh $v0, -19856($at)
L800376a8:
  andi $v0, $v0, 0x8000
L800376ac:
  beq $v0, $zero, L800376f4
L800376b0:
  addiu $v0, $zero, 5
L800376b4:
  lb $v0, 88($s0)
L800376b8:
  sll $zero, $zero, 0x0
L800376bc:
  sll $v0, $v0, 0x2
L800376c0:
  addu $v0, $s0, $v0
L800376c4:
  lw $v1, 0($v0)
L800376c8:
  sll $zero, $zero, 0x0
L800376cc:
  lbu $a1, 0($v1)
L800376d0:
  addiu $v1, $v1, 1
L800376d4:
  sw $v1, 0($v0)
L800376d8:
  lui $at, 0x800a
L800376dc:
  sh $a1, -19798($at)
L800376e0:
  jal L80036d3c
L800376e4:
  addu $a0, $s0, $zero
L800376e8:
  lui $at, 0x800a
L800376ec:
  sh $v0, -19800($at)
L800376f0:
  addiu $v0, $zero, 5
L800376f4:
  sb $v0, 1103($gp)
L800376f8:
  addiu $v0, $zero, 5
L800376fc:
  lui $at, 0x800a
L80037700:
  sh $v0, -19844($at)
L80037704:
  addiu $v0, $zero, 10
L80037708:
  sb $v0, 81($s0)
L8003770c:
  lw $ra, 20($sp)
L80037710:
  lw $s0, 16($sp)
L80037714:
  jr $ra
L80037718:
  addiu $sp, $sp, 24
L8003771c:
  addiu $sp, $sp, -24
L80037720:
  sw $s0, 16($sp)
L80037724:
  addu $s0, $a0, $zero
L80037728:
  sw $ra, 20($sp)
L8003772c:
  jal L80036d3c
L80037730:
  sb $zero, 81($s0)
L80037734:
  lui $at, 0x800a
L80037738:
  sh $v0, -19800($at)
L8003773c:
  jal L80036d3c
L80037740:
  addu $a0, $s0, $zero
L80037744:
  lui $at, 0x800a
L80037748:
  sh $v0, -19798($at)
L8003774c:
  jal L80036d3c
L80037750:
  addu $a0, $s0, $zero
L80037754:
  lui $v1, 0x800a
L80037758:
  lh $v1, -19798($v1)
L8003775c:
  lui $at, 0x800a
L80037760:
  sh $v0, -19812($at)
L80037764:
  lui $v0, 0x800a
L80037768:
  lhu $v0, -19798($v0)
L8003776c:
  slti $v1, $v1, 4096
L80037770:
  bne $v1, $zero, L80037788
L80037774:
  addiu $v0, $v0, -4096
L80037778:
  lui $at, 0x800a
L8003777c:
  sh $v0, -19798($at)
L80037780:
  addiu $v0, $zero, 10
L80037784:
  sb $v0, 81($s0)
L80037788:
  lw $ra, 20($sp)
L8003778c:
  lw $s0, 16($sp)
L80037790:
  addiu $v0, $zero, 7
L80037794:
  sb $v0, 1103($gp)
L80037798:
  addiu $v0, $zero, 7
L8003779c:
  lui $at, 0x800a
L800377a0:
  sh $v0, -19844($at)
L800377a4:
  jr $ra
L800377a8:
  addiu $sp, $sp, 24
L800377ac:
  lbu $v0, 1103($gp)
L800377b0:
  sll $zero, $zero, 0x0
L800377b4:
  bne $v0, $zero, L800377c0
L800377b8:
  sll $zero, $zero, 0x0
L800377bc:
  sb $zero, 81($a0)
L800377c0:
  jr $ra
L800377c4:
  sll $zero, $zero, 0x0
L800377c8:
  lbu $v1, 81($a0)
L800377cc:
  sll $zero, $zero, 0x0
L800377d0:
  andi $v0, $v1, 0x80
L800377d4:
  bne $v0, $zero, L800377e0
L800377d8:
  ori $v0, $v1, 0x80
L800377dc:
  sb $v0, 81($a0)
L800377e0:
  lw $v1, 1056($gp)
L800377e4:
  sll $zero, $zero, 0x0
L800377e8:
  lbu $v0, 51($v1)
L800377ec:
  sll $zero, $zero, 0x0
L800377f0:
  bne $v0, $zero, L80037874
L800377f4:
  sll $zero, $zero, 0x0
L800377f8:
  lbu $a1, 81($a0)
L800377fc:
  sll $zero, $zero, 0x0
L80037800:
  andi $v0, $a1, 0x40
L80037804:
  bne $v0, $zero, L80037820
L80037808:
  sll $zero, $zero, 0x0
L8003780c:
  lb $v0, 48($v1)
L80037810:
  sll $zero, $zero, 0x0
L80037814:
  slti $v0, $v0, 65
L80037818:
  bne $v0, $zero, L80037828
L8003781c:
  ori $v0, $a1, 0x40
L80037820:
  jr $ra
L80037824:
  sb $zero, 81($a0)
L80037828:
  sb $v0, 81($a0)
L8003782c:
  lw $v1, 1056($gp)
L80037830:
  sll $zero, $zero, 0x0
L80037834:
  lbu $v0, 64($v1)
L80037838:
  sll $zero, $zero, 0x0
L8003783c:
  sb $v0, 51($v1)
L80037840:
  lw $a0, 1056($gp)
L80037844:
  sll $zero, $zero, 0x0
L80037848:
  lbu $v1, 60($a0)
L8003784c:
  addiu $v0, $zero, 104
L80037850:
  beq $v1, $zero, L80037860
L80037854:
  sh $v0, 64($a0)
L80037858:
  addiu $v0, $zero, 216
L8003785c:
  sh $v0, 64($a0)
L80037860:
  lw $v0, 1056($gp)
L80037864:
  addiu $v1, $zero, 178
L80037868:
  sh $v1, 66($v0)
L8003786c:
  addiu $v1, $zero, -16
L80037870:
  sh $v1, 68($v0)
L80037874:
  jr $ra
L80037878:
  sll $zero, $zero, 0x0
L8003787c:
  addiu $sp, $sp, -24
L80037880:
  sw $s0, 16($sp)
L80037884:
  addu $s0, $a0, $zero
L80037888:
  sw $ra, 20($sp)
L8003788c:
  lbu $v1, 81($s0)
L80037890:
  sll $zero, $zero, 0x0
L80037894:
  andi $v0, $v1, 0x80
L80037898:
  bne $v0, $zero, L800378a4
L8003789c:
  ori $v0, $v1, 0x80
L800378a0:
  sb $v0, 81($s0)
L800378a4:
  lw $a0, 1056($gp)
L800378a8:
  sll $zero, $zero, 0x0
L800378ac:
  lbu $v0, 51($a0)
L800378b0:
  sll $zero, $zero, 0x0
L800378b4:
  bne $v0, $zero, L800378c8
L800378b8:
  sll $zero, $zero, 0x0
L800378bc:
  jal L80039fd4
L800378c0:
  sll $zero, $zero, 0x0
L800378c4:
  sb $zero, 81($s0)
L800378c8:
  lw $ra, 20($sp)
L800378cc:
  lw $s0, 16($sp)
L800378d0:
  jr $ra
L800378d4:
  addiu $sp, $sp, 24
L800378d8:
  lbu $v1, 81($a0)
L800378dc:
  sll $zero, $zero, 0x0
L800378e0:
  andi $v0, $v1, 0x80
L800378e4:
  bne $v0, $zero, L800378f0
L800378e8:
  ori $v0, $v1, 0x80
L800378ec:
  sb $v0, 81($a0)
L800378f0:
  lw $v0, 1056($gp)
L800378f4:
  sll $zero, $zero, 0x0
L800378f8:
  lbu $v0, 51($v0)
L800378fc:
  sll $zero, $zero, 0x0
L80037900:
  bne $v0, $zero, L8003790c
L80037904:
  sll $zero, $zero, 0x0
L80037908:
  sb $zero, 81($a0)
L8003790c:
  jr $ra
L80037910:
  sll $zero, $zero, 0x0
L80037914:
  lw $a1, 1056($gp)
L80037918:
  sll $zero, $zero, 0x0
L8003791c:
  lbu $v1, 50($a1)
L80037920:
  sll $zero, $zero, 0x0
L80037924:
  andi $v0, $v1, 0x3
L80037928:
  bne $v0, $zero, L80037948
L8003792c:
  ori $v0, $v1, 0x10
L80037930:
  sb $v0, 50($a1)
L80037934:
  lw $v1, 1056($gp)
L80037938:
  addiu $v0, $zero, 6
L8003793c:
  sb $v0, 51($v1)
L80037940:
  addiu $v0, $zero, 8
L80037944:
  sb $v0, 81($a0)
L80037948:
  jr $ra
L8003794c:
  sll $zero, $zero, 0x0
L80037950:
  lw $a1, 1056($gp)
L80037954:
  sll $zero, $zero, 0x0
L80037958:
  lbu $v1, 50($a1)
L8003795c:
  sll $zero, $zero, 0x0
L80037960:
  andi $v0, $v1, 0x3
L80037964:
  bne $v0, $zero, L80037984
L80037968:
  ori $v0, $v1, 0x10
L8003796c:
  sb $v0, 50($a1)
L80037970:
  lw $v1, 1056($gp)
L80037974:
  addiu $v0, $zero, 4
L80037978:
  sb $v0, 51($v1)
L8003797c:
  addiu $v0, $zero, 8
L80037980:
  sb $v0, 81($a0)
L80037984:
  jr $ra
L80037988:
  sll $zero, $zero, 0x0
L8003798c:
  addu $a1, $a0, $zero
L80037990:
  lui $v0, 0x200
L80037994:
  ori $v0, $v0, 0x30
L80037998:
  lui $v1, 0x800a
L8003799c:
  lw $v1, -20236($v1)
L800379a0:
  lui $a0, 0x800a
L800379a4:
  lw $a0, -20172($a0)
L800379a8:
  and $v1, $v1, $v0
L800379ac:
  or $v1, $v1, $a0
L800379b0:
  bne $v1, $zero, L800379bc
L800379b4:
  sll $zero, $zero, 0x0
L800379b8:
  sb $zero, 81($a1)
L800379bc:
  jr $ra
L800379c0:
  sll $zero, $zero, 0x0
L800379c4:
  addiu $sp, $sp, -24
L800379c8:
  sw $s0, 16($sp)
L800379cc:
  sw $ra, 20($sp)
L800379d0:
  jal 0x80049120
L800379d4:
  addu $s0, $a0, $zero
L800379d8:
  addiu $v1, $zero, 1
L800379dc:
  beq $v0, $v1, L800379e8
L800379e0:
  sll $zero, $zero, 0x0
L800379e4:
  sb $zero, 81($s0)
L800379e8:
  lw $ra, 20($sp)
L800379ec:
  lw $s0, 16($sp)
L800379f0:
  jr $ra
L800379f4:
  addiu $sp, $sp, 24
L800379f8:
  addiu $sp, $sp, -24
L800379fc:
  sw $s0, 16($sp)
L80037a00:
  addu $s0, $a0, $zero
L80037a04:
  sw $ra, 20($sp)
L80037a08:
  lbu $v1, 81($s0)
L80037a0c:
  sll $zero, $zero, 0x0
L80037a10:
  andi $v0, $v1, 0x80
L80037a14:
  bne $v0, $zero, L80037a28
L80037a18:
  ori $v0, $v1, 0x80
L80037a1c:
  jal L80036d3c
L80037a20:
  sb $v0, 81($s0)
L80037a24:
  sh $v0, 1050($gp)
L80037a28:
  lhu $v0, 1050($gp)
L80037a2c:
  sll $zero, $zero, 0x0
L80037a30:
  addiu $v0, $v0, -1
L80037a34:
  sh $v0, 1050($gp)
L80037a38:
  sll $v0, $v0, 0x10
L80037a3c:
  bne $v0, $zero, L80037a48
L80037a40:
  sll $zero, $zero, 0x0
L80037a44:
  sb $zero, 81($s0)
L80037a48:
  lw $ra, 20($sp)
L80037a4c:
  lw $s0, 16($sp)
L80037a50:
  jr $ra
L80037a54:
  addiu $sp, $sp, 24
L80037a58:
  addiu $sp, $sp, -24
L80037a5c:
  sw $s0, 16($sp)
L80037a60:
  addu $s0, $a0, $zero
L80037a64:
  sw $ra, 20($sp)
L80037a68:
  lbu $v1, 81($s0)
L80037a6c:
  sll $zero, $zero, 0x0
L80037a70:
  andi $v0, $v1, 0x80
L80037a74:
  bne $v0, $zero, L80037aa0
L80037a78:
  ori $v0, $v1, 0x80
L80037a7c:
  jal L80036d3c
L80037a80:
  sb $v0, 81($s0)
L80037a84:
  lui $v1, 0x800a
L80037a88:
  lhu $v1, -20154($v1)
L80037a8c:
  lui $a0, 0x800a
L80037a90:
  lhu $a0, -20152($a0)
L80037a94:
  sh $v0, 1050($gp)
L80037a98:
  sh $v1, 1088($gp)
L80037a9c:
  sh $a0, 1090($gp)
L80037aa0:
  lui $v0, 0x800a
L80037aa4:
  lw $v0, -20276($v0)
L80037aa8:
  sll $zero, $zero, 0x0
L80037aac:
  andi $v0, $v0, 0x1
L80037ab0:
  beq $v0, $zero, L80037af8
L80037ab4:
  sll $zero, $zero, 0x0
L80037ab8:
  jal 0x8008e590
L80037abc:
  sll $zero, $zero, 0x0
L80037ac0:
  andi $v0, $v0, 0x7
L80037ac4:
  lhu $v1, 1088($gp)
L80037ac8:
  addiu $v0, $v0, -4
L80037acc:
  addu $v1, $v1, $v0
L80037ad0:
  lui $at, 0x800a
L80037ad4:
  sh $v1, -20154($at)
L80037ad8:
  jal 0x8008e590
L80037adc:
  sll $zero, $zero, 0x0
L80037ae0:
  andi $v0, $v0, 0x3
L80037ae4:
  lhu $v1, 1090($gp)
L80037ae8:
  addiu $v0, $v0, -2
L80037aec:
  addu $v1, $v1, $v0
L80037af0:
  lui $at, 0x800a
L80037af4:
  sh $v1, -20152($at)
L80037af8:
  lhu $v0, 1050($gp)
L80037afc:
  sll $zero, $zero, 0x0
L80037b00:
  addiu $v0, $v0, -1
L80037b04:
  sh $v0, 1050($gp)
L80037b08:
  sll $v0, $v0, 0x10
L80037b0c:
  bne $v0, $zero, L80037b30
L80037b10:
  sll $zero, $zero, 0x0
L80037b14:
  lhu $v0, 1088($gp)
L80037b18:
  lhu $v1, 1090($gp)
L80037b1c:
  lui $at, 0x800a
L80037b20:
  sh $v0, -20154($at)
L80037b24:
  lui $at, 0x800a
L80037b28:
  sh $v1, -20152($at)
L80037b2c:
  sb $zero, 81($s0)
L80037b30:
  lw $ra, 20($sp)
L80037b34:
  lw $s0, 16($sp)
L80037b38:
  jr $ra
L80037b3c:
  addiu $sp, $sp, 24
L80037b40:
  lbu $v1, 81($a0)
L80037b44:
  sll $zero, $zero, 0x0
L80037b48:
  andi $v0, $v1, 0x80
L80037b4c:
  bne $v0, $zero, L80037b80
L80037b50:
  ori $v0, $v1, 0x80
L80037b54:
  sb $v0, 81($a0)
L80037b58:
  addiu $v0, $zero, 255
L80037b5c:
  sb $v0, 82($a0)
L80037b60:
  lh $v0, 1076($gp)
L80037b64:
  sb $zero, 1069($gp)
L80037b68:
  beq $v0, $zero, L80037b80
L80037b6c:
  sll $zero, $zero, 0x0
L80037b70:
  lbu $v0, 81($a0)
L80037b74:
  sll $zero, $zero, 0x0
L80037b78:
  ori $v0, $v0, 0x40
L80037b7c:
  sb $v0, 81($a0)
L80037b80:
  lbu $v0, 82($a0)
L80037b84:
  sll $zero, $zero, 0x0
L80037b88:
  addiu $v0, $v0, -1
L80037b8c:
  sb $v0, 82($a0)
L80037b90:
  andi $v0, $v0, 0xff
L80037b94:
  beq $v0, $zero, L80037c60
L80037b98:
  addiu $a1, $zero, 1
L80037b9c:
  lbu $v1, 1069($gp)
L80037ba0:
  sll $zero, $zero, 0x0
L80037ba4:
  beq $v1, $a1, L80037bf4
L80037ba8:
  slti $v0, $v1, 2
L80037bac:
  beq $v0, $zero, L80037bc4
L80037bb0:
  addiu $v0, $zero, 2
L80037bb4:
  beq $v1, $zero, L80037bd4
L80037bb8:
  addiu $v0, $zero, 1
L80037bbc:
  j L80037c68
L80037bc0:
  sb $zero, 81($a0)
L80037bc4:
  beq $v1, $v0, L80037c18
L80037bc8:
  addiu $v0, $zero, 1
L80037bcc:
  j L80037c68
L80037bd0:
  sb $zero, 81($a0)
L80037bd4:
  lui $v0, 0x800a
L80037bd8:
  lw $v0, -20236($v0)
L80037bdc:
  lui $v1, 0x8
L80037be0:
  and $v0, $v0, $v1
L80037be4:
  beq $v0, $zero, L80037c6c
L80037be8:
  addiu $v0, $zero, 255
L80037bec:
  sb $v0, 82($a0)
L80037bf0:
  sb $a1, 1069($gp)
L80037bf4:
  lui $v0, 0x800a
L80037bf8:
  lhu $v0, -20206($v0)
L80037bfc:
  sll $zero, $zero, 0x0
L80037c00:
  andi $v0, $v0, 0x4000
L80037c04:
  beq $v0, $zero, L80037c6c
L80037c08:
  addiu $v0, $zero, 255
L80037c0c:
  sb $v0, 82($a0)
L80037c10:
  addiu $v0, $zero, 2
L80037c14:
  sb $v0, 1069($gp)
L80037c18:
  lui $v0, 0x800a
L80037c1c:
  lhu $v0, -20206($v0)
L80037c20:
  sll $zero, $zero, 0x0
L80037c24:
  andi $v0, $v0, 0x4000
L80037c28:
  beq $v0, $zero, L80037c64
L80037c2c:
  addiu $v0, $zero, 1
L80037c30:
  lbu $v0, 81($a0)
L80037c34:
  sll $zero, $zero, 0x0
L80037c38:
  andi $v0, $v0, 0x40
L80037c3c:
  beq $v0, $zero, L80037c6c
L80037c40:
  sll $zero, $zero, 0x0
L80037c44:
  lhu $v0, 1076($gp)
L80037c48:
  sll $zero, $zero, 0x0
L80037c4c:
  addiu $v0, $v0, -1
L80037c50:
  sh $v0, 1076($gp)
L80037c54:
  sll $v0, $v0, 0x10
L80037c58:
  bgtz $v0, L80037c6c
L80037c5c:
  sll $zero, $zero, 0x0
L80037c60:
  addiu $v0, $zero, 1
L80037c64:
  sb $zero, 81($a0)
L80037c68:
  sb $v0, 82($a0)
L80037c6c:
  jr $ra
L80037c70:
  sll $zero, $zero, 0x0
L80037c74:
  addu $a1, $a0, $zero
L80037c78:
  lh $v0, 56($a1)
L80037c7c:
  lh $v1, 62($a1)
L80037c80:
  sll $zero, $zero, 0x0
L80037c84:
  slt $v0, $v0, $v1
L80037c88:
  bne $v0, $zero, L80037ca4
L80037c8c:
  sll $zero, $zero, 0x0
L80037c90:
  lbu $v1, 91($a1)
L80037c94:
  lhu $v0, 58($a1)
L80037c98:
  sh $zero, 56($a1)
L80037c9c:
  addu $v0, $v0, $v1
L80037ca0:
  sh $v0, 58($a1)
L80037ca4:
  lh $v0, 58($a1)
L80037ca8:
  lbu $a0, 91($a1)
L80037cac:
  lh $v1, 66($a1)
L80037cb0:
  addu $v0, $v0, $a0
L80037cb4:
  slt $v1, $v1, $v0
L80037cb8:
  lhu $a0, 58($a1)
L80037cbc:
  bne $v1, $zero, L80037ccc
L80037cc0:
  addiu $v0, $zero, 1
L80037cc4:
  jr $ra
L80037cc8:
  addu $v0, $zero, $zero
L80037ccc:
  lbu $v1, 91($a1)
L80037cd0:
  sll $zero, $zero, 0x0
L80037cd4:
  subu $v1, $a0, $v1
L80037cd8:
  jr $ra
L80037cdc:
  sh $v1, 58($a1)
L80037ce0:
  lbu $v0, 86($a0)
L80037ce4:
  lb $v1, 1085($gp)
L80037ce8:
  sll $zero, $zero, 0x0
L80037cec:
  slt $v0, $v0, $v1
L80037cf0:
  bne $v0, $zero, L80037d24
L80037cf4:
  addiu $v0, $zero, 1
L80037cf8:
  sb $v0, 81($a0)
L80037cfc:
  lhu $v0, 52($a0)
L80037d00:
  sb $zero, 86($a0)
L80037d04:
  lbu $v1, 1092($gp)
L80037d08:
  sw $zero, 1080($gp)
L80037d0c:
  andi $v0, $v0, 0xefff
L80037d10:
  andi $v1, $v1, 0x30
L80037d14:
  beq $v1, $zero, L80037d24
L80037d18:
  sh $v0, 52($a0)
L80037d1c:
  addiu $v0, $zero, 2
L80037d20:
  sb $v0, 1085($gp)
L80037d24:
  jr $ra
L80037d28:
  sll $zero, $zero, 0x0
L80037d2c:
  lb $v0, 88($a0)
L80037d30:
  lhu $v1, 1074($gp)
L80037d34:
  sll $v0, $v0, 0x2
L80037d38:
  addu $a0, $a0, $v0
L80037d3c:
  addiu $v1, $v1, -240
L80037d40:
  lw $v0, 0($a0)
L80037d44:
  sll $v1, $v1, 0x8
L80037d48:
  lbu $a1, 0($v0)
L80037d4c:
  addiu $v0, $v0, 1
L80037d50:
  sw $v0, 0($a0)
L80037d54:
  addiu $v0, $zero, -1
L80037d58:
  or $a1, $a1, $v1
L80037d5c:
  sh $a1, 1074($gp)
L80037d60:
  sw $v0, 1096($gp)
L80037d64:
  jr $ra
L80037d68:
  sll $zero, $zero, 0x0
L80037d6c:
  lb $v1, 88($a0)
L80037d70:
  sll $zero, $zero, 0x0
L80037d74:
  sll $v1, $v1, 0x2
L80037d78:
  addu $v1, $a0, $v1
L80037d7c:
  lw $v0, 0($v1)
L80037d80:
  sll $zero, $zero, 0x0
L80037d84:
  lbu $a1, 0($v0)
L80037d88:
  addiu $v0, $v0, 1
L80037d8c:
  sw $v0, 0($v1)
L80037d90:
  addiu $v0, $zero, 1
L80037d94:
  sb $a1, 81($a0)
L80037d98:
  sw $v0, 1096($gp)
L80037d9c:
  jr $ra
L80037da0:
  sll $zero, $zero, 0x0
L80037da4:
  addiu $sp, $sp, -24
L80037da8:
  sw $s0, 16($sp)
L80037dac:
  addu $s0, $a0, $zero
L80037db0:
  sw $ra, 20($sp)
L80037db4:
  lb $v1, 88($s0)
L80037db8:
  sb $zero, 98($s0)
L80037dbc:
  sll $v1, $v1, 0x2
L80037dc0:
  addu $v1, $s0, $v1
L80037dc4:
  lw $v0, 0($v1)
L80037dc8:
  sll $zero, $zero, 0x0
L80037dcc:
  lbu $a0, 0($v0)
L80037dd0:
  addiu $v0, $v0, 1
L80037dd4:
  sw $v0, 0($v1)
L80037dd8:
  andi $v0, $a0, 0x10
L80037ddc:
  beq $v0, $zero, L80037df0
L80037de0:
  addu $a2, $zero, $zero
L80037de4:
  lbu $v0, 1048($gp)
L80037de8:
  j L80038014
L80037dec:
  sb $v0, 84($s0)
L80037df0:
  andi $v0, $a0, 0x20
L80037df4:
  beq $v0, $zero, L80037e08
L80037df8:
  ori $v0, $zero, 0x8000
L80037dfc:
  j 0x801aae74
L80037e00:
  sll $zero, $zero, 0x0
L80037e04:
  sll $zero, $zero, 0x0
L80037e08:
  andi $v0, $a0, 0x40
L80037e0c:
  beq $v0, $zero, L80037e20
L80037e10:
  ori $v0, $zero, 0xd100
L80037e14:
  lh $v1, 1072($gp)
L80037e18:
  j L80037f1c
L80037e1c:
  addu $a1, $v1, $v0
L80037e20:
  andi $v1, $a0, 0xf
L80037e24:
  addiu $v0, $zero, 1
L80037e28:
  beq $v1, $v0, L80037e88
L80037e2c:
  addu $a1, $zero, $zero
L80037e30:
  slti $v0, $v1, 2
L80037e34:
  beq $v0, $zero, L80037e4c
L80037e38:
  addiu $v0, $zero, 2
L80037e3c:
  beq $v1, $zero, L80037e5c
L80037e40:
  andi $v0, $a0, 0x80
L80037e44:
  j L80037f10
L80037e48:
  sll $zero, $zero, 0x0
L80037e4c:
  beq $v1, $v0, L80037ed0
L80037e50:
  andi $v0, $a0, 0x80
L80037e54:
  j L80037f10
L80037e58:
  sll $zero, $zero, 0x0
L80037e5c:
  lui $v0, 0x801d
L80037e60:
  lh $v1, 1072($gp)
L80037e64:
  addiu $v0, $v0, 16964
L80037e68:
  addiu $v1, $v1, -1
L80037e6c:
  sll $v1, $v1, 0x2
L80037e70:
  addu $v1, $v1, $v0
L80037e74:
  lw $v0, 0($v1)
L80037e78:
  sll $zero, $zero, 0x0
L80037e7c:
  sra $v0, $v0, 0x1a
L80037e80:
  j L80037f0c
L80037e84:
  andi $a1, $v0, 0x1f
L80037e88:
  lui $v1, 0x801d
L80037e8c:
  lh $v0, 1072($gp)
L80037e90:
  addiu $v1, $v1, 16964
L80037e94:
  addiu $v0, $v0, -1
L80037e98:
  sll $v0, $v0, 0x2
L80037e9c:
  addu $v0, $v0, $v1
L80037ea0:
  lw $v0, 0($v0)
L80037ea4:
  sll $zero, $zero, 0x0
L80037ea8:
  sra $v1, $v0, 0x16
L80037eac:
  andi $a1, $v1, 0xf
L80037eb0:
  sra $v0, $v0, 0x1a
L80037eb4:
  andi $v1, $v0, 0x1f
L80037eb8:
  addiu $v0, $v1, -20
L80037ebc:
  sltiu $v0, $v0, 4
L80037ec0:
  beq $v0, $zero, L80037f0c
L80037ec4:
  addiu $a1, $a1, 23
L80037ec8:
  j L80037f0c
L80037ecc:
  sb $v1, 98($s0)
L80037ed0:
  lui $v1, 0x801d
L80037ed4:
  lh $v0, 1072($gp)
L80037ed8:
  addiu $v1, $v1, 16964
L80037edc:
  addiu $v0, $v0, -1
L80037ee0:
  sll $v0, $v0, 0x2
L80037ee4:
  addu $v0, $v0, $v1
L80037ee8:
  lw $v0, 0($v0)
L80037eec:
  sll $zero, $zero, 0x0
L80037ef0:
  sra $v0, $v0, 0x12
L80037ef4:
  andi $a1, $v0, 0xf
L80037ef8:
  addiu $a1, $a1, 23
L80037efc:
  addiu $v0, $zero, 23
L80037f00:
  bne $a1, $v0, L80037f10
L80037f04:
  andi $v0, $a0, 0x80
L80037f08:
  addiu $a2, $zero, 1
L80037f0c:
  andi $v0, $a0, 0x80
L80037f10:
  beq $v0, $zero, L80037fd8
L80037f14:
  ori $v0, $zero, 0x8300
L80037f18:
  addu $a1, $a1, $v0
L80037f1c:
  lbu $v0, 88($s0)
L80037f20:
  sll $zero, $zero, 0x0
L80037f24:
  addiu $v0, $v0, 1
L80037f28:
  sb $v0, 88($s0)
L80037f2c:
  ori $v0, $zero, 0xcfff
L80037f30:
  slt $v0, $v0, $a1
L80037f34:
  beq $v0, $zero, L80037f54
L80037f38:
  addu $a2, $a1, $zero
L80037f3c:
  lui $v0, 0xffff
L80037f40:
  ori $v0, $v0, 0x3000
L80037f44:
  lui $v1, 0x801c
L80037f48:
  addiu $v1, $v1, 0
L80037f4c:
  j L80037f70
L80037f50:
  lui $a0, 0xffff
L80037f54:
  addiu $v0, $zero, 32767
L80037f58:
  slt $v0, $v0, $a1
L80037f5c:
  beq $v0, $zero, L80037f8c
L80037f60:
  lui $v1, 0x801d
L80037f64:
  addiu $v1, $v1, 22528
L80037f68:
  lui $a0, 0xffff
L80037f6c:
  addiu $v0, $zero, -32768
L80037f70:
  addu $v0, $a1, $v0
L80037f74:
  sll $v0, $v0, 0x1
L80037f78:
  addu $v0, $v0, $v1
L80037f7c:
  lhu $v0, 0($v0)
L80037f80:
  and $v1, $v1, $a0
L80037f84:
  j L80037fc0
L80037f88:
  addu $v1, $v1, $v0
L80037f8c:
  slti $v0, $a1, 1280
L80037f90:
  bne $v0, $zero, L80037f9c
L80037f94:
  lui $a0, 0x801b
L80037f98:
  addiu $a2, $a1, -256
L80037f9c:
  addiu $a0, $a0, 0
L80037fa0:
  lui $a1, 0xffff
L80037fa4:
  lui $v1, 0x801c
L80037fa8:
  addiu $v1, $v1, 0
L80037fac:
  sll $v0, $a2, 0x1
L80037fb0:
  addu $v0, $v0, $v1
L80037fb4:
  lhu $v0, 0($v0)
L80037fb8:
  and $a0, $a0, $a1
L80037fbc:
  addu $v1, $a0, $v0
L80037fc0:
  lb $v0, 88($s0)
L80037fc4:
  sll $zero, $zero, 0x0
L80037fc8:
  sll $v0, $v0, 0x2
L80037fcc:
  addu $v0, $s0, $v0
L80037fd0:
  j L80038014
L80037fd4:
  sw $v1, 0($v0)
L80037fd8:
  lhu $v0, 52($s0)
L80037fdc:
  sll $zero, $zero, 0x0
L80037fe0:
  ori $v0, $v0, 0x80
L80037fe4:
  sh $v0, 52($s0)
L80037fe8:
  andi $v0, $a2, 0xff
L80037fec:
  bne $v0, $zero, L80037ffc
L80037ff0:
  sll $zero, $zero, 0x0
L80037ff4:
  jal L80036c14
L80037ff8:
  addu $a0, $s0, $zero
L80037ffc:
  lhu $v0, 52($s0)
L80038000:
  lhu $v1, 56($s0)
L80038004:
  andi $v0, $v0, 0xff7f
L80038008:
  addiu $v1, $v1, 16
L8003800c:
  sh $v0, 52($s0)
L80038010:
  sh $v1, 56($s0)
L80038014:
  lw $ra, 20($sp)
L80038018:
  lw $s0, 16($sp)
L8003801c:
  jr $ra
L80038020:
  addiu $sp, $sp, 24
L80038024:
  addiu $sp, $sp, -24
L80038028:
  sw $s0, 16($sp)
L8003802c:
  addu $s0, $a0, $zero
L80038030:
  sw $ra, 20($sp)
L80038034:
  lhu $v0, 52($s0)
L80038038:
  sll $zero, $zero, 0x0
L8003803c:
  ori $v0, $v0, 0x80
L80038040:
  jal L80036c14
L80038044:
  sh $v0, 52($s0)
L80038048:
  lhu $v0, 52($s0)
L8003804c:
  lhu $v1, 56($s0)
L80038050:
  andi $v0, $v0, 0xff7f
L80038054:
  addiu $v1, $v1, 16
L80038058:
  sh $v0, 52($s0)
L8003805c:
  sh $v1, 56($s0)
L80038060:
  lw $ra, 20($sp)
L80038064:
  lw $s0, 16($sp)
L80038068:
  jr $ra
L8003806c:
  addiu $sp, $sp, 24
L80038070:
  lbu $a1, 1084($gp)
L80038074:
  addiu $sp, $sp, -24
L80038078:
  sw $ra, 16($sp)
L8003807c:
  jal L80038024
L80038080:
  sll $zero, $zero, 0x0
L80038084:
  lw $ra, 16($sp)
L80038088:
  sll $zero, $zero, 0x0
L8003808c:
  jr $ra
L80038090:
  addiu $sp, $sp, 24
L80038094:
  addiu $sp, $sp, -24
L80038098:
  sw $ra, 16($sp)
L8003809c:
  lb $v1, 88($a0)
L800380a0:
  sll $zero, $zero, 0x0
L800380a4:
  sll $v1, $v1, 0x2
L800380a8:
  addu $v1, $a0, $v1
L800380ac:
  lw $v0, 0($v1)
L800380b0:
  sll $zero, $zero, 0x0
L800380b4:
  lbu $a1, 0($v0)
L800380b8:
  addiu $v0, $v0, 1
L800380bc:
  jal L80038024
L800380c0:
  sw $v0, 0($v1)
L800380c4:
  lw $ra, 16($sp)
L800380c8:
  sll $zero, $zero, 0x0
L800380cc:
  jr $ra
L800380d0:
  addiu $sp, $sp, 24
L800380d4:
  lb $v1, 88($a0)
L800380d8:
  sh $zero, 56($a0)
L800380dc:
  sll $v1, $v1, 0x2
L800380e0:
  addu $v1, $a0, $v1
L800380e4:
  lw $v0, 0($v1)
L800380e8:
  sll $zero, $zero, 0x0
L800380ec:
  lbu $a1, 0($v0)
L800380f0:
  addiu $v0, $v0, 1
L800380f4:
  sw $v0, 0($v1)
L800380f8:
  lhu $v0, 58($a0)
L800380fc:
  sll $a1, $a1, 0x18
L80038100:
  sra $a1, $a1, 0x18
L80038104:
  addu $v0, $v0, $a1
L80038108:
  jr $ra
L8003810c:
  sh $v0, 58($a0)
L80038110:
  lb $v1, 88($a0)
L80038114:
  sll $zero, $zero, 0x0
L80038118:
  sll $v1, $v1, 0x2
L8003811c:
  addu $v1, $a0, $v1
L80038120:
  lw $v0, 0($v1)
L80038124:
  sll $zero, $zero, 0x0
L80038128:
  lbu $a1, 0($v0)
L8003812c:
  addiu $v0, $v0, 1
L80038130:
  sw $v0, 0($v1)
L80038134:
  lhu $v0, 56($a0)
L80038138:
  sll $zero, $zero, 0x0
L8003813c:
  addu $v0, $v0, $a1
L80038140:
  jr $ra
L80038144:
  sh $v0, 56($a0)
L80038148:
  addiu $sp, $sp, -40
L8003814c:
  sw $s1, 28($sp)
L80038150:
  addu $s1, $a0, $zero
L80038154:
  sw $ra, 32($sp)
L80038158:
  jal L80036d70
L8003815c:
  sw $s0, 24($sp)
L80038160:
  lb $a0, 88($s1)
L80038164:
  sll $zero, $zero, 0x0
L80038168:
  sll $a0, $a0, 0x2
L8003816c:
  addu $a0, $s1, $a0
L80038170:
  lw $v1, 0($a0)
L80038174:
  addiu $a2, $sp, 16
L80038178:
  lbu $a1, 0($v1)
L8003817c:
  addiu $v1, $v1, 1
L80038180:
  sw $v1, 0($a0)
L80038184:
  lw $a0, 0($v0)
L80038188:
  addu $s0, $a1, $zero
L8003818c:
  jal L800357e8
L80038190:
  andi $a1, $s0, 0xf
L80038194:
  andi $v0, $s0, 0x80
L80038198:
  beq $v0, $zero, L800381b8
L8003819c:
  addu $a3, $zero, $zero
L800381a0:
  andi $v0, $s0, 0x40
L800381a4:
  beq $v0, $zero, L800381f0
L800381a8:
  lui $v0, 0x800f
L800381ac:
  lhu $a3, -20488($v0)
L800381b0:
  j L800381f4
L800381b4:
  addiu $a0, $s1, 68
L800381b8:
  slti $v0, $s0, 2
L800381bc:
  bne $v0, $zero, L800381f4
L800381c0:
  addiu $a0, $s1, 68
L800381c4:
  addiu $a0, $sp, 16
L800381c8:
  addiu $v1, $s0, -1
L800381cc:
  addu $v0, $a0, $v1
L800381d0:
  lbu $v0, 0($v0)
L800381d4:
  sll $zero, $zero, 0x0
L800381d8:
  sltiu $v0, $v0, 10
L800381dc:
  bne $v0, $zero, L800381f0
L800381e0:
  slti $v0, $v1, 2
L800381e4:
  addu $s0, $v1, $zero
L800381e8:
  beq $v0, $zero, L800381cc
L800381ec:
  addiu $v1, $s0, -1
L800381f0:
  addiu $a0, $s1, 68
L800381f4:
  andi $v0, $s0, 0xf
L800381f8:
  addiu $a2, $v0, -1
L800381fc:
  addiu $t0, $sp, 16
L80038200:
  lui $v0, 0x800f
L80038204:
  addiu $t1, $v0, -20488
L80038208:
  addu $a1, $t0, $a2
L8003820c:
  lbu $v0, 0($a1)
L80038210:
  sll $zero, $zero, 0x0
L80038214:
  sltiu $v0, $v0, 10
L80038218:
  beq $v0, $zero, L80038234
L8003821c:
  addu $v1, $a3, $zero
L80038220:
  lbu $v0, 0($a1)
L80038224:
  sll $zero, $zero, 0x0
L80038228:
  sll $v0, $v0, 0x1
L8003822c:
  addu $v0, $v0, $t1
L80038230:
  lhu $v1, 0($v0)
L80038234:
  sll $zero, $zero, 0x0
L80038238:
  slti $v0, $v1, 240
L8003823c:
  bne $v0, $zero, L80038258
L80038240:
  sra $v0, $v1, 0x8
L80038244:
  addiu $v0, $v0, -16
L80038248:
  sb $v0, 0($a0)
L8003824c:
  sb $v1, 1($a0)
L80038250:
  j L80038260
L80038254:
  addiu $a0, $a0, 2
L80038258:
  sb $v1, 0($a0)
L8003825c:
  addiu $a0, $a0, 1
L80038260:
  addiu $a2, $a2, -1
L80038264:
  bgez $a2, L8003820c
L80038268:
  addu $a1, $t0, $a2
L8003826c:
  addiu $v0, $zero, 255
L80038270:
  sb $v0, 0($a0)
L80038274:
  lbu $v0, 88($s1)
L80038278:
  addiu $v1, $s1, 68
L8003827c:
  addiu $v0, $v0, 1
L80038280:
  sb $v0, 88($s1)
L80038284:
  sll $v0, $v0, 0x18
L80038288:
  sra $v0, $v0, 0x16
L8003828c:
  addu $v0, $s1, $v0
L80038290:
  sw $v1, 0($v0)
L80038294:
  lw $ra, 32($sp)
L80038298:
  lw $s1, 28($sp)
L8003829c:
  lw $s0, 24($sp)
L800382a0:
  jr $ra
L800382a4:
  addiu $sp, $sp, 40
L800382a8:
  addu $a1, $a0, $zero
L800382ac:
  lhu $v0, 52($a1)
L800382b0:
  lb $v1, 88($a1)
L800382b4:
  andi $v0, $v0, 0xfeff
L800382b8:
  sll $v1, $v1, 0x2
L800382bc:
  addu $v1, $a1, $v1
L800382c0:
  sh $v0, 52($a1)
L800382c4:
  lw $v0, 0($v1)
L800382c8:
  sll $zero, $zero, 0x0
L800382cc:
  lbu $a0, 0($v0)
L800382d0:
  addiu $v0, $v0, 1
L800382d4:
  sw $v0, 0($v1)
L800382d8:
  addiu $v0, $zero, 1
L800382dc:
  beq $a0, $v0, L800382f4
L800382e0:
  addiu $v0, $zero, 2
L800382e4:
  beq $a0, $v0, L80038300
L800382e8:
  addiu $v0, $zero, 1
L800382ec:
  j L80038314
L800382f0:
  sll $zero, $zero, 0x0
L800382f4:
  addiu $v0, $zero, 8
L800382f8:
  j L8003830c
L800382fc:
  sb $v0, 90($a1)
L80038300:
  addiu $v0, $zero, 8
L80038304:
  sb $v0, 90($a1)
L80038308:
  addiu $v0, $zero, 12
L8003830c:
  sb $v0, 91($a1)
L80038310:
  addiu $v0, $zero, 1
L80038314:
  bne $a0, $v0, L8003832c
L80038318:
  sll $zero, $zero, 0x0
L8003831c:
  lhu $v0, 52($a1)
L80038320:
  sll $zero, $zero, 0x0
L80038324:
  ori $v0, $v0, 0x100
L80038328:
  sh $v0, 52($a1)
L8003832c:
  jr $ra
L80038330:
  sll $zero, $zero, 0x0
L80038334:
  lb $v1, 88($a0)
L80038338:
  sll $zero, $zero, 0x0
L8003833c:
  sll $v1, $v1, 0x2
L80038340:
  addu $v1, $a0, $v1
L80038344:
  lw $v0, 0($v1)
L80038348:
  sll $zero, $zero, 0x0
L8003834c:
  lbu $a1, 0($v0)
L80038350:
  addiu $v0, $v0, 1
L80038354:
  sw $v0, 0($v1)
L80038358:
  lb $v1, 88($a0)
L8003835c:
  sll $zero, $zero, 0x0
L80038360:
  sll $v1, $v1, 0x2
L80038364:
  addu $v1, $a0, $v1
L80038368:
  sb $a1, 90($a0)
L8003836c:
  lw $v0, 0($v1)
L80038370:
  sll $zero, $zero, 0x0
L80038374:
  lbu $a1, 0($v0)
L80038378:
  addiu $v0, $v0, 1
L8003837c:
  sw $v0, 0($v1)
L80038380:
  jr $ra
L80038384:
  sb $a1, 91($a0)
L80038388:
  addiu $sp, $sp, -24
L8003838c:
  sw $s0, 16($sp)
L80038390:
  sw $ra, 20($sp)
L80038394:
  jal L80036d3c
L80038398:
  addu $s0, $a0, $zero
L8003839c:
  sh $v0, 56($s0)
L800383a0:
  lw $ra, 20($sp)
L800383a4:
  lw $s0, 16($sp)
L800383a8:
  jr $ra
L800383ac:
  addiu $sp, $sp, 24
L800383b0:
  addiu $sp, $sp, -24
L800383b4:
  sw $s0, 16($sp)
L800383b8:
  addu $s0, $a0, $zero
L800383bc:
  sw $ra, 20($sp)
L800383c0:
  jal L80036d3c
L800383c4:
  sb $zero, 96($s0)
L800383c8:
  sb $v0, 97($s0)
L800383cc:
  lw $ra, 20($sp)
L800383d0:
  lw $s0, 16($sp)
L800383d4:
  jr $ra
L800383d8:
  addiu $sp, $sp, 24
L800383dc:
  lhu $a2, 1062($gp)
L800383e0:
  ori $v0, $zero, 0xcfff
L800383e4:
  slt $v0, $v0, $a2
L800383e8:
  beq $v0, $zero, L80038408
L800383ec:
  addu $a3, $a0, $zero
L800383f0:
  lui $v0, 0xffff
L800383f4:
  ori $v0, $v0, 0x3000
L800383f8:
  lui $v1, 0x801c
L800383fc:
  addiu $v1, $v1, 0
L80038400:
  j L80038424
L80038404:
  lui $a0, 0xffff
L80038408:
  addiu $v0, $zero, 32767
L8003840c:
  slt $v0, $v0, $a2
L80038410:
  beq $v0, $zero, L80038440
L80038414:
  lui $v1, 0x801d
L80038418:
  addiu $v1, $v1, 22528
L8003841c:
  lui $a0, 0xffff
L80038420:
  addiu $v0, $zero, -32768
L80038424:
  addu $v0, $a2, $v0
L80038428:
  sll $v0, $v0, 0x1
L8003842c:
  addu $v0, $v0, $v1
L80038430:
  lhu $v0, 0($v0)
L80038434:
  and $v1, $v1, $a0
L80038438:
  j L80038474
L8003843c:
  addu $v1, $v1, $v0
L80038440:
  slti $v0, $a2, 1280
L80038444:
  bne $v0, $zero, L80038450
L80038448:
  lui $a0, 0x801b
L8003844c:
  addiu $a2, $a2, -256
L80038450:
  addiu $a0, $a0, 0
L80038454:
  lui $a1, 0xffff
L80038458:
  lui $v1, 0x801c
L8003845c:
  addiu $v1, $v1, 0
L80038460:
  sll $v0, $a2, 0x1
L80038464:
  addu $v0, $v0, $v1
L80038468:
  lhu $v0, 0($v0)
L8003846c:
  and $a0, $a0, $a1
L80038470:
  addu $v1, $a0, $v0
L80038474:
  lbu $v0, 88($a3)
L80038478:
  sll $zero, $zero, 0x0
L8003847c:
  addiu $v0, $v0, 1
L80038480:
  sb $v0, 88($a3)
L80038484:
  sll $v0, $v0, 0x18
L80038488:
  sra $v0, $v0, 0x16
L8003848c:
  addu $v0, $a3, $v0
L80038490:
  jr $ra
L80038494:
  sw $v1, 0($v0)
L80038498:
  addu $a1, $a0, $zero
L8003849c:
  lb $v1, 88($a1)
L800384a0:
  sll $zero, $zero, 0x0
L800384a4:
  sll $v1, $v1, 0x2
L800384a8:
  addu $v1, $a1, $v1
L800384ac:
  lw $v0, 0($v1)
L800384b0:
  sll $zero, $zero, 0x0
L800384b4:
  lbu $a0, 0($v0)
L800384b8:
  addiu $v0, $v0, 1
L800384bc:
  sw $v0, 0($v1)
L800384c0:
  andi $v0, $a0, 0x80
L800384c4:
  beq $v0, $zero, L800384dc
L800384c8:
  lui $v1, 0x801d
L800384cc:
  addiu $v1, $v1, 22280
L800384d0:
  andi $v0, $a0, 0xf
L800384d4:
  addu $v0, $v0, $v1
L800384d8:
  lbu $a0, 0($v0)
L800384dc:
  jr $ra
L800384e0:
  sb $a0, 84($a1)
L800384e4:
  addu $a1, $a0, $zero
L800384e8:
  lhu $v0, 52($a1)
L800384ec:
  lb $v1, 88($a1)
L800384f0:
  andi $v0, $v0, 0xefff
L800384f4:
  sll $v1, $v1, 0x2
L800384f8:
  addu $v1, $a1, $v1
L800384fc:
  sh $v0, 52($a1)
L80038500:
  lw $v0, 0($v1)
L80038504:
  sll $zero, $zero, 0x0
L80038508:
  lbu $a0, 0($v0)
L8003850c:
  addiu $v0, $v0, 1
L80038510:
  beq $a0, $zero, L80038528
L80038514:
  sw $v0, 0($v1)
L80038518:
  lhu $v0, 52($a1)
L8003851c:
  sll $zero, $zero, 0x0
L80038520:
  ori $v0, $v0, 0x1000
L80038524:
  sh $v0, 52($a1)
L80038528:
  jr $ra
L8003852c:
  sll $zero, $zero, 0x0
L80038530:
  addiu $sp, $sp, -24
L80038534:
  addiu $v0, $zero, -1
L80038538:
  sw $ra, 16($sp)
L8003853c:
  lui $at, 0x800a
L80038540:
  sb $v0, -19616($at)
L80038544:
  lb $v1, 88($a0)
L80038548:
  sll $zero, $zero, 0x0
L8003854c:
  sll $v1, $v1, 0x2
L80038550:
  addu $v1, $a0, $v1
L80038554:
  lw $v0, 0($v1)
L80038558:
  sll $zero, $zero, 0x0
L8003855c:
  lbu $a1, 0($v0)
L80038560:
  addiu $v0, $v0, 1
L80038564:
  sw $v0, 0($v1)
L80038568:
  lui $at, 0x800a
L8003856c:
  sb $a1, -19615($at)
L80038570:
  lb $v1, 88($a0)
L80038574:
  sll $zero, $zero, 0x0
L80038578:
  sll $v1, $v1, 0x2
L8003857c:
  addu $v1, $a0, $v1
L80038580:
  lw $v0, 0($v1)
L80038584:
  sll $zero, $zero, 0x0
L80038588:
  lbu $a1, 0($v0)
L8003858c:
  addiu $v0, $v0, 1
L80038590:
  sw $v0, 0($v1)
L80038594:
  lui $at, 0x800a
L80038598:
  sh $a1, -19600($at)
L8003859c:
  lb $v1, 88($a0)
L800385a0:
  sll $zero, $zero, 0x0
L800385a4:
  sll $v1, $v1, 0x2
L800385a8:
  addu $v1, $a0, $v1
L800385ac:
  lw $v0, 0($v1)
L800385b0:
  sll $zero, $zero, 0x0
L800385b4:
  lbu $a1, 0($v0)
L800385b8:
  addiu $v0, $v0, 1
L800385bc:
  sw $v0, 0($v1)
L800385c0:
  lui $at, 0x800a
L800385c4:
  sh $a1, -19598($at)
L800385c8:
  lb $v1, 88($a0)
L800385cc:
  sll $zero, $zero, 0x0
L800385d0:
  sll $v1, $v1, 0x2
L800385d4:
  addu $v1, $a0, $v1
L800385d8:
  lw $v0, 0($v1)
L800385dc:
  sll $zero, $zero, 0x0
L800385e0:
  lbu $a1, 0($v0)
L800385e4:
  addiu $v0, $v0, 1
L800385e8:
  sw $v0, 0($v1)
L800385ec:
  lui $at, 0x800a
L800385f0:
  sb $a1, -19612($at)
L800385f4:
  jal L80036d3c
L800385f8:
  sll $zero, $zero, 0x0
L800385fc:
  lui $v1, 0x800a
L80038600:
  lbu $v1, -19615($v1)
L80038604:
  lui $at, 0x800a
L80038608:
  sh $v0, -19606($at)
L8003860c:
  addiu $v0, $zero, 29344
L80038610:
  lui $at, 0x800a
L80038614:
  sh $v0, -19596($at)
L80038618:
  addiu $v0, $v1, -9
L8003861c:
  sltiu $v0, $v0, 8
L80038620:
  beq $v0, $zero, L80038630
L80038624:
  addiu $v0, $zero, 29312
L80038628:
  lui $at, 0x800a
L8003862c:
  sh $v0, -19596($at)
L80038630:
  sll $v0, $v1, 0x18
L80038634:
  sra $v1, $v0, 0x18
L80038638:
  addiu $v0, $zero, 17
L8003863c:
  bne $v1, $v0, L80038654
L80038640:
  addiu $v0, $zero, 38
L80038644:
  addiu $v0, $zero, 29328
L80038648:
  lui $at, 0x800a
L8003864c:
  sh $v0, -19596($at)
L80038650:
  addiu $v0, $zero, 38
L80038654:
  bne $v1, $v0, L80038664
L80038658:
  addiu $v0, $zero, 29360
L8003865c:
  lui $at, 0x800a
L80038660:
  sh $v0, -19596($at)
L80038664:
  lw $ra, 16($sp)
L80038668:
  addiu $v0, $zero, 2
L8003866c:
  lui $at, 0x800a
L80038670:
  sb $v0, -19608($at)
L80038674:
  addiu $v0, $zero, 3
L80038678:
  lui $at, 0x800a
L8003867c:
  sb $zero, -19607($at)
L80038680:
  lui $at, 0x800a
L80038684:
  sb $v0, -19860($at)
L80038688:
  jr $ra
L8003868c:
  addiu $sp, $sp, 24
L80038690:
  addiu $sp, $sp, -24
L80038694:
  sw $ra, 16($sp)
L80038698:
  jal L80036d3c
L8003869c:
  sll $zero, $zero, 0x0
L800386a0:
  jal L8003ff08
L800386a4:
  andi $a0, $v0, 0xffff
L800386a8:
  lw $ra, 16($sp)
L800386ac:
  sll $zero, $zero, 0x0
L800386b0:
  jr $ra
L800386b4:
  addiu $sp, $sp, 24
L800386b8:
  addiu $sp, $sp, -32
L800386bc:
  sw $s1, 20($sp)
L800386c0:
  addu $s1, $a0, $zero
L800386c4:
  sw $ra, 24($sp)
L800386c8:
  sw $s0, 16($sp)
L800386cc:
  lb $v1, 88($s1)
L800386d0:
  sll $zero, $zero, 0x0
L800386d4:
  sll $v1, $v1, 0x2
L800386d8:
  addu $v1, $s1, $v1
L800386dc:
  lw $v0, 0($v1)
L800386e0:
  sll $zero, $zero, 0x0
L800386e4:
  lbu $a0, 0($v0)
L800386e8:
  addiu $v0, $v0, 1
L800386ec:
  sw $v0, 0($v1)
L800386f0:
  addu $s0, $a0, $zero
L800386f4:
  andi $v0, $s0, 0x3f
L800386f8:
  beq $v0, $zero, L80038718
L800386fc:
  andi $v0, $s0, 0x1
L80038700:
  jal L80036d3c
L80038704:
  addu $a0, $s1, $zero
L80038708:
  jal L8003ff08
L8003870c:
  andi $a0, $v0, 0xffff
L80038710:
  j L80038770
L80038714:
  andi $v0, $s0, 0x80
L80038718:
  beq $v0, $zero, L80038734
L8003871c:
  andi $v0, $s0, 0x2
L80038720:
  lui $a0, 0x800a
L80038724:
  lw $a0, -19452($a0)
L80038728:
  jal L8003ff08
L8003872c:
  sll $zero, $zero, 0x0
L80038730:
  andi $v0, $s0, 0x2
L80038734:
  beq $v0, $zero, L80038754
L80038738:
  andi $v0, $s0, 0x4
L8003873c:
  jal L80036d3c
L80038740:
  addu $a0, $s1, $zero
L80038744:
  andi $v0, $v0, 0xffff
L80038748:
  lui $at, 0x800a
L8003874c:
  sw $v0, -19452($at)
L80038750:
  andi $v0, $s0, 0x4
L80038754:
  beq $v0, $zero, L80038770
L80038758:
  andi $v0, $s0, 0x80
L8003875c:
  lui $v0, 0x800a
L80038760:
  lw $v0, -19456($v0)
L80038764:
  lui $at, 0x800a
L80038768:
  sw $v0, -19452($at)
L8003876c:
  andi $v0, $s0, 0x80
L80038770:
  beq $v0, $zero, L80038784
L80038774:
  addiu $v0, $zero, 12
L80038778:
  sb $v0, 81($s1)
L8003877c:
  addiu $v0, $zero, 1
L80038780:
  sw $v0, 1096($gp)
L80038784:
  lw $ra, 24($sp)
L80038788:
  lw $s1, 20($sp)
L8003878c:
  lw $s0, 16($sp)
L80038790:
  jr $ra
L80038794:
  addiu $sp, $sp, 32
L80038798:
  addiu $sp, $sp, -24
L8003879c:
  sw $s0, 16($sp)
L800387a0:
  sw $ra, 20($sp)
L800387a4:
  jal L80036d3c
L800387a8:
  addu $s0, $a0, $zero
L800387ac:
  andi $a0, $v0, 0xffff
L800387b0:
  andi $v0, $a0, 0x8000
L800387b4:
  beq $v0, $zero, L800387e8
L800387b8:
  sll $zero, $zero, 0x0
L800387bc:
  jal L8003ff88
L800387c0:
  sll $zero, $zero, 0x0
L800387c4:
  jal L80036d3c
L800387c8:
  addu $a0, $s0, $zero
L800387cc:
  sh $v0, 1076($gp)
L800387d0:
  addiu $v0, $zero, 17
L800387d4:
  sb $v0, 81($s0)
L800387d8:
  addiu $v0, $zero, 1
L800387dc:
  sw $v0, 1096($gp)
L800387e0:
  j L800387f0
L800387e4:
  sll $zero, $zero, 0x0
L800387e8:
  jal L8003fee0
L800387ec:
  sll $zero, $zero, 0x0
L800387f0:
  lw $ra, 20($sp)
L800387f4:
  lw $s0, 16($sp)
L800387f8:
  jr $ra
L800387fc:
  addiu $sp, $sp, 24
L80038800:
  addiu $sp, $sp, -32
L80038804:
  sw $s1, 20($sp)
L80038808:
  addu $s1, $a0, $zero
L8003880c:
  sw $ra, 24($sp)
L80038810:
  sw $s0, 16($sp)
L80038814:
  lb $v0, 88($s1)
L80038818:
  sll $zero, $zero, 0x0
L8003881c:
  sll $v0, $v0, 0x2
L80038820:
  addu $v0, $s1, $v0
L80038824:
  lw $v1, 0($v0)
L80038828:
  sll $zero, $zero, 0x0
L8003882c:
  lbu $a0, 0($v1)
L80038830:
  addiu $v1, $v1, 1
L80038834:
  addu $s0, $a0, $zero
L80038838:
  andi $a0, $s0, 0x7f
L8003883c:
  bne $a0, $zero, L80038854
L80038840:
  sw $v1, 0($v0)
L80038844:
  jal L8003ff34
L80038848:
  sll $zero, $zero, 0x0
L8003884c:
  j L80038860
L80038850:
  andi $v0, $s0, 0x80
L80038854:
  jal L8003ff58
L80038858:
  sll $zero, $zero, 0x0
L8003885c:
  andi $v0, $s0, 0x80
L80038860:
  beq $v0, $zero, L80038874
L80038864:
  addiu $v0, $zero, 13
L80038868:
  sb $v0, 81($s1)
L8003886c:
  addiu $v0, $zero, 1
L80038870:
  sw $v0, 1096($gp)
L80038874:
  lw $ra, 24($sp)
L80038878:
  lw $s1, 20($sp)
L8003887c:
  lw $s0, 16($sp)
L80038880:
  jr $ra
L80038884:
  addiu $sp, $sp, 32
L80038888:
  jr $ra
L8003888c:
  sll $zero, $zero, 0x0
L80038890:
  jr $ra
L80038894:
  sll $zero, $zero, 0x0
L80038898:
  lb $v0, 88($a0)
L8003889c:
  sll $zero, $zero, 0x0
L800388a0:
  sll $v0, $v0, 0x2
L800388a4:
  addu $a0, $a0, $v0
L800388a8:
  lw $v0, 0($a0)
L800388ac:
  sll $zero, $zero, 0x0
L800388b0:
  lbu $v1, 0($v0)
L800388b4:
  addiu $v0, $v0, 1
L800388b8:
  sw $v0, 0($a0)
L800388bc:
  addiu $v0, $zero, 5
L800388c0:
  lui $at, 0x800a
L800388c4:
  sb $v0, -19860($at)
L800388c8:
  lui $at, 0x800a
L800388cc:
  sb $v1, -19613($at)
L800388d0:
  jr $ra
L800388d4:
  sll $zero, $zero, 0x0
L800388d8:
  addiu $sp, $sp, -24
L800388dc:
  sw $ra, 20($sp)
L800388e0:
  sw $s0, 16($sp)
L800388e4:
  lb $v0, 88($a0)
L800388e8:
  sll $zero, $zero, 0x0
L800388ec:
  sll $v0, $v0, 0x2
L800388f0:
  addu $a0, $a0, $v0
L800388f4:
  lw $v0, 0($a0)
L800388f8:
  sll $zero, $zero, 0x0
L800388fc:
  lbu $v1, 0($v0)
L80038900:
  addiu $v0, $v0, 1
L80038904:
  sw $v0, 0($a0)
L80038908:
  addu $s0, $v1, $zero
L8003890c:
  andi $v0, $s0, 0x40
L80038910:
  beq $v0, $zero, L80038934
L80038914:
  andi $v0, $s0, 0x20
L80038918:
  lui $v0, 0x800a
L8003891c:
  lbu $v0, -20618($v0)
L80038920:
  sll $zero, $zero, 0x0
L80038924:
  addiu $v0, $v0, 9
L80038928:
  lui $at, 0x800a
L8003892c:
  sb $v0, -20160($at)
L80038930:
  andi $v0, $s0, 0x20
L80038934:
  beq $v0, $zero, L80038944
L80038938:
  addiu $v0, $zero, 4
L8003893c:
  lui $at, 0x800a
L80038940:
  sb $v0, -20160($at)
L80038944:
  andi $v0, $s0, 0x10
L80038948:
  beq $v0, $zero, L80038980
L8003894c:
  andi $v0, $s0, 0x1
L80038950:
  beq $v0, $zero, L80038968
L80038954:
  lui $a0, 0xff
L80038958:
  jal 0x80015944
L8003895c:
  ori $a0, $a0, 0xffff
L80038960:
  j L80038974
L80038964:
  lui $v1, 0x800f
L80038968:
  jal 0x8001581c
L8003896c:
  ori $a0, $a0, 0xffff
L80038970:
  lui $v1, 0x800f
L80038974:
  addiu $v0, $zero, 4
L80038978:
  j L800389a0
L8003897c:
  sb $v0, -24881($v1)
L80038980:
  beq $v0, $zero, L80038998
L80038984:
  sll $zero, $zero, 0x0
L80038988:
  jal 0x80015c84
L8003898c:
  sll $zero, $zero, 0x0
L80038990:
  j L800389a4
L80038994:
  andi $v0, $s0, 0x80
L80038998:
  jal 0x80015c0c
L8003899c:
  sll $zero, $zero, 0x0
L800389a0:
  andi $v0, $s0, 0x80
L800389a4:
  beq $v0, $zero, L800389b4
L800389a8:
  sll $zero, $zero, 0x0
L800389ac:
  jal 0x80015998
L800389b0:
  sll $zero, $zero, 0x0
L800389b4:
  lw $ra, 20($sp)
L800389b8:
  lw $s0, 16($sp)
L800389bc:
  jr $ra
L800389c0:
  addiu $sp, $sp, 24
L800389c4:
  lhu $v0, 52($a0)
L800389c8:
  sll $zero, $zero, 0x0
L800389cc:
  andi $v0, $v0, 0xfff7
L800389d0:
  jr $ra
L800389d4:
  sh $v0, 52($a0)
L800389d8:
  addiu $sp, $sp, -24
L800389dc:
  sw $s0, 16($sp)
L800389e0:
  addu $s0, $a0, $zero
L800389e4:
  sw $ra, 20($sp)
L800389e8:
  lb $a0, 88($s0)
L800389ec:
  lbu $v0, 1094($gp)
L800389f0:
  sll $a0, $a0, 0x2
L800389f4:
  addu $a0, $s0, $a0
L800389f8:
  lw $v1, 0($a0)
L800389fc:
  sll $v0, $v0, 0x1
L80038a00:
  addu $v1, $v1, $v0
L80038a04:
  sw $v1, 0($a0)
L80038a08:
  jal L80036d3c
L80038a0c:
  addu $a0, $s0, $zero
L80038a10:
  lb $v1, 88($s0)
L80038a14:
  lui $a0, 0xffff
L80038a18:
  sll $v1, $v1, 0x2
L80038a1c:
  addu $s0, $s0, $v1
L80038a20:
  lw $v1, 0($s0)
L80038a24:
  andi $v0, $v0, 0xffff
L80038a28:
  and $v1, $v1, $a0
L80038a2c:
  or $v1, $v1, $v0
L80038a30:
  sw $v1, 0($s0)
L80038a34:
  lw $ra, 20($sp)
L80038a38:
  lw $s0, 16($sp)
L80038a3c:
  jr $ra
L80038a40:
  addiu $sp, $sp, 24
L80038a44:
  addiu $sp, $sp, -24
L80038a48:
  sw $s0, 16($sp)
L80038a4c:
  addu $s0, $a0, $zero
L80038a50:
  sw $ra, 20($sp)
L80038a54:
  lb $a0, 88($s0)
L80038a58:
  lbu $v0, 1101($gp)
L80038a5c:
  sll $a0, $a0, 0x2
L80038a60:
  addu $a0, $s0, $a0
L80038a64:
  lw $v1, 0($a0)
L80038a68:
  sll $v0, $v0, 0x1
L80038a6c:
  addu $v1, $v1, $v0
L80038a70:
  sw $v1, 0($a0)
L80038a74:
  jal L80036d3c
L80038a78:
  addu $a0, $s0, $zero
L80038a7c:
  lb $v1, 88($s0)
L80038a80:
  lui $a0, 0xffff
L80038a84:
  sll $v1, $v1, 0x2
L80038a88:
  addu $s0, $s0, $v1
L80038a8c:
  lw $v1, 0($s0)
L80038a90:
  andi $v0, $v0, 0xffff
L80038a94:
  and $v1, $v1, $a0
L80038a98:
  or $v1, $v1, $v0
L80038a9c:
  sw $v1, 0($s0)
L80038aa0:
  lw $ra, 20($sp)
L80038aa4:
  lw $s0, 16($sp)
L80038aa8:
  jr $ra
L80038aac:
  addiu $sp, $sp, 24
L80038ab0:
  addiu $sp, $sp, -24
L80038ab4:
  sw $ra, 20($sp)
L80038ab8:
  sw $s0, 16($sp)
L80038abc:
  lb $v0, 88($a0)
L80038ac0:
  sll $zero, $zero, 0x0
L80038ac4:
  sll $v0, $v0, 0x2
L80038ac8:
  addu $a0, $a0, $v0
L80038acc:
  lw $v0, 0($a0)
L80038ad0:
  sll $zero, $zero, 0x0
L80038ad4:
  lbu $v1, 0($v0)
L80038ad8:
  addiu $v0, $v0, 1
L80038adc:
  addu $s0, $v1, $zero
L80038ae0:
  blez $s0, L80038af8
L80038ae4:
  sw $v0, 0($a0)
L80038ae8:
  jal L8002cce4
L80038aec:
  addiu $a0, $s0, 31
L80038af0:
  jal L8002cce4
L80038af4:
  addiu $a0, $s0, 1760
L80038af8:
  lw $ra, 20($sp)
L80038afc:
  lw $s0, 16($sp)
L80038b00:
  jr $ra
L80038b04:
  addiu $sp, $sp, 24
L80038b08:
  addiu $sp, $sp, -24
L80038b0c:
  sw $s0, 16($sp)
L80038b10:
  addu $s0, $a0, $zero
L80038b14:
  sw $ra, 20($sp)
L80038b18:
  lw $a0, 48($s0)
L80038b1c:
  jal 0x8004036c
L80038b20:
  sll $zero, $zero, 0x0
L80038b24:
  addiu $v0, $zero, 2
L80038b28:
  sw $zero, 48($s0)
L80038b2c:
  sb $v0, 81($s0)
L80038b30:
  sb $zero, 98($s0)
L80038b34:
  lw $ra, 20($sp)
L80038b38:
  lw $s0, 16($sp)
L80038b3c:
  addiu $v0, $zero, 1
L80038b40:
  sw $v0, 1096($gp)
L80038b44:
  jr $ra
L80038b48:
  addiu $sp, $sp, 24
L80038b4c:
  addiu $sp, $sp, -24
L80038b50:
  sw $ra, 16($sp)
L80038b54:
  lb $v1, 88($a0)
L80038b58:
  sll $zero, $zero, 0x0
L80038b5c:
  sll $v1, $v1, 0x2
L80038b60:
  addu $v1, $a0, $v1
L80038b64:
  lw $v0, 0($v1)
L80038b68:
  sll $zero, $zero, 0x0
L80038b6c:
  lbu $a1, 0($v0)
L80038b70:
  addiu $v0, $v0, 1
L80038b74:
  sw $v0, 0($v1)
L80038b78:
  lui $v0, 0x8009
L80038b7c:
  addiu $v0, $v0, 3756
L80038b80:
  sll $a1, $a1, 0x2
L80038b84:
  addu $a1, $a1, $v0
L80038b88:
  lw $v0, 0($a1)
L80038b8c:
  sll $zero, $zero, 0x0
L80038b90:
  jalr $ra, $v0
L80038b94:
  sll $zero, $zero, 0x0
L80038b98:
  lw $ra, 16($sp)
L80038b9c:
  sll $zero, $zero, 0x0
L80038ba0:
  jr $ra
L80038ba4:
  addiu $sp, $sp, 24
L80038ba8:
  addiu $sp, $sp, -24
L80038bac:
  sw $s0, 16($sp)
L80038bb0:
  sw $ra, 20($sp)
L80038bb4:
  jal L80036d3c
L80038bb8:
  addu $s0, $a0, $zero
L80038bbc:
  lb $v1, 88($s0)
L80038bc0:
  lui $a0, 0xffff
L80038bc4:
  sll $v1, $v1, 0x2
L80038bc8:
  addu $s0, $s0, $v1
L80038bcc:
  lw $v1, 0($s0)
L80038bd0:
  andi $v0, $v0, 0xffff
L80038bd4:
  and $v1, $v1, $a0
L80038bd8:
  or $v1, $v1, $v0
L80038bdc:
  sw $v1, 0($s0)
L80038be0:
  lw $ra, 20($sp)
L80038be4:
  lw $s0, 16($sp)
L80038be8:
  jr $ra
L80038bec:
  addiu $sp, $sp, 24
L80038bf0:
  addiu $sp, $sp, -24
L80038bf4:
  sw $s0, 16($sp)
L80038bf8:
  addu $s0, $a0, $zero
L80038bfc:
  addiu $a3, $zero, 1
L80038c00:
  sw $ra, 20($sp)
L80038c04:
  sw $a3, 1096($gp)
L80038c08:
  lb $v1, 88($s0)
L80038c0c:
  sll $zero, $zero, 0x0
L80038c10:
  sll $v1, $v1, 0x2
L80038c14:
  addu $v1, $s0, $v1
L80038c18:
  lw $v0, 0($v1)
L80038c1c:
  sll $zero, $zero, 0x0
L80038c20:
  lbu $a0, 0($v0)
L80038c24:
  addu $v0, $v0, $a3
L80038c28:
  sw $v0, 0($v1)
L80038c2c:
  addu $a1, $a0, $zero
L80038c30:
  andi $v0, $a1, 0x8
L80038c34:
  beq $v0, $zero, L80038c64
L80038c38:
  addiu $a2, $zero, 15
L80038c3c:
  lb $v0, 88($s0)
L80038c40:
  sll $zero, $zero, 0x0
L80038c44:
  sll $v0, $v0, 0x2
L80038c48:
  addu $v0, $s0, $v0
L80038c4c:
  lw $v1, 0($v0)
L80038c50:
  sll $zero, $zero, 0x0
L80038c54:
  lbu $a0, 0($v1)
L80038c58:
  addu $v1, $v1, $a3
L80038c5c:
  sw $v1, 0($v0)
L80038c60:
  addu $a2, $a0, $zero
L80038c64:
  andi $v0, $a1, 0x80
L80038c68:
  beq $v0, $zero, L80038ca0
L80038c6c:
  addu $a0, $s0, $zero
L80038c70:
  lb $v0, 88($s0)
L80038c74:
  sll $zero, $zero, 0x0
L80038c78:
  sll $v0, $v0, 0x2
L80038c7c:
  addu $a1, $a0, $v0
L80038c80:
  lb $v0, 1093($gp)
L80038c84:
  lw $v1, 0($a1)
L80038c88:
  sll $v0, $v0, 0x1
L80038c8c:
  addu $v1, $v1, $v0
L80038c90:
  jal L80038ba8
L80038c94:
  sw $v1, 0($a1)
L80038c98:
  j L80038d04
L80038c9c:
  sll $zero, $zero, 0x0
L80038ca0:
  andi $v0, $a1, 0x7
L80038ca4:
  sb $v0, 1085($gp)
L80038ca8:
  andi $v0, $a1, 0xf0
L80038cac:
  sb $v0, 1092($gp)
L80038cb0:
  andi $v0, $a2, 0xf
L80038cb4:
  sb $v0, 1070($gp)
L80038cb8:
  andi $v0, $a2, 0x80
L80038cbc:
  sb $zero, 1093($gp)
L80038cc0:
  sb $zero, 1055($gp)
L80038cc4:
  beq $v0, $zero, L80038cd0
L80038cc8:
  sll $zero, $zero, 0x0
L80038ccc:
  sb $a3, 1055($gp)
L80038cd0:
  lbu $a0, 87($s0)
L80038cd4:
  jal L80035ca8
L80038cd8:
  sll $zero, $zero, 0x0
L80038cdc:
  lbu $a0, 87($s0)
L80038ce0:
  jal L80035db8
L80038ce4:
  sll $zero, $zero, 0x0
L80038ce8:
  lui $v0, 0x8003
L80038cec:
  lhu $v1, 52($s0)
L80038cf0:
  addiu $v0, $v0, 31968
L80038cf4:
  sb $zero, 86($s0)
L80038cf8:
  sw $v0, 1080($gp)
L80038cfc:
  ori $v1, $v1, 0x1000
L80038d00:
  sh $v1, 52($s0)
L80038d04:
  lw $ra, 20($sp)
L80038d08:
  lw $s0, 16($sp)
L80038d0c:
  jr $ra
L80038d10:
  addiu $sp, $sp, 24
L80038d14:
  addiu $v0, $zero, 4
L80038d18:
  sb $v0, 81($a0)
L80038d1c:
  addiu $v0, $zero, 1
L80038d20:
  sw $v0, 1096($gp)
L80038d24:
  jr $ra
L80038d28:
  sll $zero, $zero, 0x0
L80038d2c:
  addiu $sp, $sp, -32
L80038d30:
  sw $s1, 20($sp)
L80038d34:
  addu $s1, $a0, $zero
L80038d38:
  sw $ra, 24($sp)
L80038d3c:
  jal L80036d3c
L80038d40:
  sw $s0, 16($sp)
L80038d44:
  andi $s0, $v0, 0xffff
L80038d48:
  andi $v0, $s0, 0x4000
L80038d4c:
  beq $v0, $zero, L80038d64
L80038d50:
  sll $zero, $zero, 0x0
L80038d54:
  jal L8002cce4
L80038d58:
  andi $a0, $s0, 0xbfff
L80038d5c:
  j L80038da4
L80038d60:
  sll $zero, $zero, 0x0
L80038d64:
  jal L80036d3c
L80038d68:
  addu $a0, $s1, $zero
L80038d6c:
  addu $a0, $s0, $zero
L80038d70:
  jal L8002cca8
L80038d74:
  andi $s0, $v0, 0xffff
L80038d78:
  beq $v0, $zero, L80038da4
L80038d7c:
  lui $a0, 0xffff
L80038d80:
  lb $v0, 88($s1)
L80038d84:
  sll $zero, $zero, 0x0
L80038d88:
  sll $v0, $v0, 0x2
L80038d8c:
  addu $v0, $s1, $v0
L80038d90:
  lw $v1, 0($v0)
L80038d94:
  sll $zero, $zero, 0x0
L80038d98:
  and $v1, $v1, $a0
L80038d9c:
  or $v1, $v1, $s0
L80038da0:
  sw $v1, 0($v0)
L80038da4:
  lw $ra, 24($sp)
L80038da8:
  lw $s1, 20($sp)
L80038dac:
  lw $s0, 16($sp)
L80038db0:
  jr $ra
L80038db4:
  addiu $sp, $sp, 32
L80038db8:
  addiu $sp, $sp, -24
L80038dbc:
  sw $s0, 16($sp)
L80038dc0:
  sw $ra, 20($sp)
L80038dc4:
  jal L80036d3c
L80038dc8:
  addu $s0, $a0, $zero
L80038dcc:
  lui $a0, 0xffff
L80038dd0:
  lb $v1, 88($s0)
L80038dd4:
  andi $v0, $v0, 0xffff
L80038dd8:
  addiu $a1, $v1, 1
L80038ddc:
  sll $a1, $a1, 0x2
L80038de0:
  sll $v1, $v1, 0x2
L80038de4:
  addu $v1, $s0, $v1
L80038de8:
  lw $v1, 0($v1)
L80038dec:
  addu $a1, $s0, $a1
L80038df0:
  and $v1, $v1, $a0
L80038df4:
  or $v1, $v1, $v0
L80038df8:
  sw $v1, 0($a1)
L80038dfc:
  lbu $v0, 88($s0)
L80038e00:
  sll $zero, $zero, 0x0
L80038e04:
  addiu $v0, $v0, 1
L80038e08:
  sb $v0, 88($s0)
L80038e0c:
  lw $ra, 20($sp)
L80038e10:
  lw $s0, 16($sp)
L80038e14:
  jr $ra
L80038e18:
  addiu $sp, $sp, 24
L80038e1c:
  addiu $sp, $sp, -24
L80038e20:
  sw $s0, 16($sp)
L80038e24:
  addu $s0, $a0, $zero
L80038e28:
  sw $ra, 20($sp)
L80038e2c:
  lbu $v0, 86($s0)
L80038e30:
  addiu $v1, $zero, 4096
L80038e34:
  sh $v1, 56($s0)
L80038e38:
  addiu $v0, $v0, 1
L80038e3c:
  jal L80037c74
L80038e40:
  sb $v0, 86($s0)
L80038e44:
  beq $v0, $zero, L80038e50
L80038e48:
  addiu $v0, $zero, 4
L80038e4c:
  sb $v0, 81($s0)
L80038e50:
  lw $v1, 1080($gp)
L80038e54:
  addiu $v0, $zero, 1
L80038e58:
  sw $v0, 1096($gp)
L80038e5c:
  beq $v1, $zero, L80038e6c
L80038e60:
  sll $zero, $zero, 0x0
L80038e64:
  jalr $ra, $v1
L80038e68:
  addu $a0, $s0, $zero
L80038e6c:
  lw $ra, 20($sp)
L80038e70:
  lw $s0, 16($sp)
L80038e74:
  jr $ra
L80038e78:
  addiu $sp, $sp, 24
L80038e7c:
  lbu $v0, 88($a0)
L80038e80:
  sll $zero, $zero, 0x0
L80038e84:
  addiu $v0, $v0, -1
L80038e88:
  sb $v0, 88($a0)
L80038e8c:
  sll $v0, $v0, 0x18
L80038e90:
  bgez $v0, L80038ea8
L80038e94:
  addiu $v1, $zero, 1
L80038e98:
  lhu $v0, 52($a0)
L80038e9c:
  sw $v1, 1096($gp)
L80038ea0:
  ori $v0, $v0, 0x2000
L80038ea4:
  sh $v0, 52($a0)
L80038ea8:
  jr $ra
L80038eac:
  sll $zero, $zero, 0x0
L80038eb0:
  addiu $sp, $sp, -40
L80038eb4:
  sw $s4, 32($sp)
L80038eb8:
  addu $s4, $a0, $zero
L80038ebc:
  addiu $v0, $zero, 1
L80038ec0:
  sw $ra, 36($sp)
L80038ec4:
  sw $s3, 28($sp)
L80038ec8:
  sw $s2, 24($sp)
L80038ecc:
  sw $s1, 20($sp)
L80038ed0:
  sw $s0, 16($sp)
L80038ed4:
  sw $v0, 1096($gp)
L80038ed8:
  lb $v1, 88($s4)
L80038edc:
  sll $zero, $zero, 0x0
L80038ee0:
  sll $v1, $v1, 0x2
L80038ee4:
  addu $v1, $s4, $v1
L80038ee8:
  lw $v0, 0($v1)
L80038eec:
  sll $zero, $zero, 0x0
L80038ef0:
  lbu $a1, 0($v0)
L80038ef4:
  addiu $v0, $v0, 1
L80038ef8:
  sw $v0, 0($v1)
L80038efc:
  lui $v1, 0x800f
L80038f00:
  lb $a0, 88($s4)
L80038f04:
  addiu $s0, $v1, -20464
L80038f08:
  sll $a0, $a0, 0x2
L80038f0c:
  addu $a0, $s4, $a0
L80038f10:
  lw $v0, 0($a0)
L80038f14:
  addu $s3, $a1, $zero
L80038f18:
  lbu $v1, 0($v0)
L80038f1c:
  addiu $v0, $v0, 1
L80038f20:
  sw $v0, 0($a0)
L80038f24:
  slti $v0, $s3, 65
L80038f28:
  bne $v0, $zero, L80038f38
L80038f2c:
  addu $s2, $v1, $zero
L80038f30:
  j L80038f60
L80038f34:
  addiu $s0, $s0, 152
L80038f38:
  lb $v0, 48($s0)
L80038f3c:
  sll $zero, $zero, 0x0
L80038f40:
  beq $v0, $s3, L80038f64
L80038f44:
  andi $v0, $s2, 0x80
L80038f48:
  addiu $s0, $s0, 76
L80038f4c:
  lb $v0, 48($s0)
L80038f50:
  sll $zero, $zero, 0x0
L80038f54:
  beq $v0, $s3, L80038f64
L80038f58:
  andi $v0, $s2, 0x80
L80038f5c:
  addu $s0, $zero, $zero
L80038f60:
  andi $v0, $s2, 0x80
L80038f64:
  beq $v0, $zero, L80038ff4
L80038f68:
  andi $v0, $s2, 0x60
L80038f6c:
  beq $s0, $zero, L80039120
L80038f70:
  andi $v0, $s2, 0x2
L80038f74:
  sw $s0, 1056($gp)
L80038f78:
  beq $v0, $zero, L80038f90
L80038f7c:
  andi $v0, $s2, 0x1
L80038f80:
  jal L80039fd4
L80038f84:
  addu $a0, $s0, $zero
L80038f88:
  j L80039120
L80038f8c:
  sll $zero, $zero, 0x0
L80038f90:
  beq $v0, $zero, L80038fa0
L80038f94:
  addiu $v0, $zero, 14
L80038f98:
  j L80039120
L80038f9c:
  sb $v0, 81($s4)
L80038fa0:
  lbu $v0, 60($s0)
L80038fa4:
  sll $zero, $zero, 0x0
L80038fa8:
  bne $v0, $zero, L80038fb4
L80038fac:
  addiu $v0, $zero, 376
L80038fb0:
  addiu $v0, $zero, -56
L80038fb4:
  sh $v0, 64($s0)
L80038fb8:
  addiu $v0, $zero, 178
L80038fbc:
  sh $v0, 66($s0)
L80038fc0:
  addiu $v0, $zero, 16
L80038fc4:
  sh $v0, 68($s0)
L80038fc8:
  addiu $v0, $zero, 7
L80038fcc:
  sb $v0, 81($s4)
L80038fd0:
  addiu $v0, $zero, 3
L80038fd4:
  sb $v0, 51($s0)
L80038fd8:
  slti $v0, $s3, 65
L80038fdc:
  bne $v0, $zero, L80039120
L80038fe0:
  addiu $v0, $zero, 5
L80038fe4:
  sb $v0, 51($s0)
L80038fe8:
  addiu $v0, $zero, 1
L80038fec:
  j L80039120
L80038ff0:
  sh $v0, 64($s0)
L80038ff4:
  beq $v0, $zero, L80039058
L80038ff8:
  slti $v0, $s3, 65
L80038ffc:
  beq $s0, $zero, L80039120
L80039000:
  sll $zero, $zero, 0x0
L80039004:
  beq $v0, $zero, L80039120
L80039008:
  andi $v0, $s2, 0x40
L8003900c:
  sw $s0, 1056($gp)
L80039010:
  beq $v0, $zero, L80039028
L80039014:
  andi $v0, $s2, 0x3
L80039018:
  sb $v0, 49($s0)
L8003901c:
  addiu $v0, $zero, 9
L80039020:
  j L80039120
L80039024:
  sb $v0, 81($s4)
L80039028:
  andi $v0, $s2, 0x20
L8003902c:
  beq $v0, $zero, L80039058
L80039030:
  slti $v0, $s3, 65
L80039034:
  lbu $v0, 50($s0)
L80039038:
  sll $zero, $zero, 0x0
L8003903c:
  andi $v1, $v0, 0xef
L80039040:
  andi $v0, $s2, 0x1
L80039044:
  beq $v0, $zero, L80039120
L80039048:
  sb $v1, 50($s0)
L8003904c:
  ori $v0, $v1, 0x10
L80039050:
  j L80039120
L80039054:
  sb $v0, 50($s0)
L80039058:
  bne $v0, $zero, L80039064
L8003905c:
  andi $s1, $s2, 0x1
L80039060:
  addiu $s1, $zero, 2
L80039064:
  sll $v0, $s1, 0x2
L80039068:
  addu $v0, $v0, $s1
L8003906c:
  sll $v0, $v0, 0x2
L80039070:
  subu $v0, $v0, $s1
L80039074:
  sll $v0, $v0, 0x2
L80039078:
  lui $v1, 0x800f
L8003907c:
  addiu $v1, $v1, -20464
L80039080:
  addu $s0, $v0, $v1
L80039084:
  jal L80039f44
L80039088:
  addu $a0, $s0, $zero
L8003908c:
  sb $s3, 48($s0)
L80039090:
  beq $s1, $zero, L800390a0
L80039094:
  sb $s1, 60($s0)
L80039098:
  j L800390a4
L8003909c:
  addiu $v0, $zero, 376
L800390a0:
  addiu $v0, $zero, -56
L800390a4:
  sh $v0, 52($s0)
L800390a8:
  addiu $v0, $zero, 6
L800390ac:
  sb $v0, 81($s4)
L800390b0:
  slti $v0, $s3, 65
L800390b4:
  sw $s0, 1056($gp)
L800390b8:
  bne $v0, $zero, L800390e8
L800390bc:
  addiu $v0, $zero, 2
L800390c0:
  addiu $v0, $zero, 5
L800390c4:
  sb $v0, 51($s0)
L800390c8:
  addiu $v0, $zero, 2
L800390cc:
  sb $v0, 60($s0)
L800390d0:
  addiu $v0, $zero, 240
L800390d4:
  sh $v0, 52($s0)
L800390d8:
  addiu $v0, $zero, 96
L800390dc:
  sh $zero, 64($s0)
L800390e0:
  j L80039120
L800390e4:
  sh $v0, 54($s0)
L800390e8:
  sb $v0, 51($s0)
L800390ec:
  addiu $v0, $zero, 3
L800390f0:
  sh $v0, 64($s0)
L800390f4:
  andi $v0, $s2, 0x8
L800390f8:
  beq $v0, $zero, L8003910c
L800390fc:
  addiu $v0, $zero, 1024
L80039100:
  sh $v0, 52($s0)
L80039104:
  addiu $v0, $zero, 7
L80039108:
  sh $v0, 64($s0)
L8003910c:
  andi $v0, $s2, 0x10
L80039110:
  beq $v0, $zero, L80039120
L80039114:
  sra $v0, $s2, 0x1
L80039118:
  andi $v0, $v0, 0x3
L8003911c:
  sb $v0, 49($s0)
L80039120:
  lw $ra, 36($sp)
L80039124:
  lw $s4, 32($sp)
L80039128:
  lw $s3, 28($sp)
L8003912c:
  lw $s2, 24($sp)
L80039130:
  lw $s1, 20($sp)
L80039134:
  lw $s0, 16($sp)
L80039138:
  jr $ra
L8003913c:
  addiu $sp, $sp, 40
L80039140:
  lw $a1, 40($a0)
L80039144:
  lw $a0, 44($a0)
L80039148:
  lhu $v0, 24($a1)
L8003914c:
  sll $zero, $zero, 0x0
L80039150:
  sh $v0, 24($a0)
L80039154:
  lhu $v0, 26($a1)
L80039158:
  sll $zero, $zero, 0x0
L8003915c:
  sh $v0, 26($a0)
L80039160:
  lhu $v0, 48($a1)
L80039164:
  sll $zero, $zero, 0x0
L80039168:
  sh $v0, 72($a0)
L8003916c:
  sh $v0, 40($a0)
L80039170:
  addiu $v0, $v0, -8
L80039174:
  sh $v0, 56($a0)
L80039178:
  lhu $v0, 48($a1)
L8003917c:
  lhu $v1, 60($a1)
L80039180:
  sll $zero, $zero, 0x0
L80039184:
  addu $v0, $v0, $v1
L80039188:
  sh $v0, 80($a0)
L8003918c:
  sh $v0, 48($a0)
L80039190:
  addiu $v0, $v0, 8
L80039194:
  sh $v0, 64($a0)
L80039198:
  lhu $v0, 50($a1)
L8003919c:
  sll $zero, $zero, 0x0
L800391a0:
  addiu $v0, $v0, -8
L800391a4:
  sh $v0, 50($a0)
L800391a8:
  sh $v0, 42($a0)
L800391ac:
  lhu $v0, 50($a1)
L800391b0:
  lhu $v1, 74($a1)
L800391b4:
  sll $zero, $zero, 0x0
L800391b8:
  addu $v0, $v0, $v1
L800391bc:
  sh $v0, 66($a0)
L800391c0:
  sh $v0, 58($a0)
L800391c4:
  lhu $v0, 50($a1)
L800391c8:
  lhu $v1, 62($a1)
L800391cc:
  sll $zero, $zero, 0x0
L800391d0:
  addu $v0, $v0, $v1
L800391d4:
  addiu $v0, $v0, 8
L800391d8:
  sh $v0, 82($a0)
L800391dc:
  jr $ra
L800391e0:
  sh $v0, 74($a0)
L800391e4:
  addiu $sp, $sp, -32
L800391e8:
  sw $s1, 20($sp)
L800391ec:
  addu $s1, $a0, $zero
L800391f0:
  sw $ra, 24($sp)
L800391f4:
  sw $s0, 16($sp)
L800391f8:
  lw $s0, 40($s1)
L800391fc:
  sll $zero, $zero, 0x0
L80039200:
  bne $s0, $zero, L8003925c
L80039204:
  sll $zero, $zero, 0x0
L80039208:
  jal 0x8004006c
L8003920c:
  sll $zero, $zero, 0x0
L80039210:
  addu $a0, $v0, $zero
L80039214:
  jal 0x800400ac
L80039218:
  addiu $a1, $zero, 6
L8003921c:
  addu $s0, $v0, $zero
L80039220:
  lbu $a0, 87($s1)
L80039224:
  addiu $v0, $zero, 640
L80039228:
  sh $v0, 64($s0)
L8003922c:
  addiu $v0, $zero, 232
L80039230:
  sh $v0, 66($s0)
L80039234:
  addiu $v0, $zero, 10
L80039238:
  sb $v0, 102($s0)
L8003923c:
  lui $v0, 0x8003
L80039240:
  lhu $v1, 8($s0)
L80039244:
  addiu $v0, $v0, 24096
L80039248:
  sw $v0, 76($s0)
L8003924c:
  ori $v1, $v1, 0x8
L80039250:
  sb $a0, 103($s0)
L80039254:
  sh $v1, 8($s0)
L80039258:
  sw $s0, 40($s1)
L8003925c:
  jal 0x80042918
L80039260:
  addu $a0, $s0, $zero
L80039264:
  lb $a1, 89($s1)
L80039268:
  jal 0x800428ec
L8003926c:
  addu $a0, $s0, $zero
L80039270:
  lhu $v0, 60($s1)
L80039274:
  sll $zero, $zero, 0x0
L80039278:
  sh $v0, 48($s0)
L8003927c:
  lhu $v0, 64($s1)
L80039280:
  sll $zero, $zero, 0x0
L80039284:
  sh $v0, 50($s0)
L80039288:
  lhu $v0, 62($s1)
L8003928c:
  sll $zero, $zero, 0x0
L80039290:
  sh $v0, 60($s0)
L80039294:
  lhu $v0, 66($s1)
L80039298:
  sll $zero, $zero, 0x0
L8003929c:
  sh $v0, 62($s0)
L800392a0:
  lhu $v0, 62($s1)
L800392a4:
  sll $zero, $zero, 0x0
L800392a8:
  sll $v0, $v0, 0x10
L800392ac:
  sra $v1, $v0, 0x10
L800392b0:
  srl $v0, $v0, 0x1f
L800392b4:
  addu $v1, $v1, $v0
L800392b8:
  sra $v1, $v1, 0x1
L800392bc:
  sh $v1, 24($s0)
L800392c0:
  sh $v1, 72($s0)
L800392c4:
  lhu $v0, 66($s1)
L800392c8:
  sll $zero, $zero, 0x0
L800392cc:
  sll $v0, $v0, 0x10
L800392d0:
  sra $v1, $v0, 0x10
L800392d4:
  srl $v0, $v0, 0x1f
L800392d8:
  addu $v1, $v1, $v0
L800392dc:
  sra $v1, $v1, 0x1
L800392e0:
  sh $v1, 26($s0)
L800392e4:
  sh $v1, 74($s0)
L800392e8:
  lhu $v0, 52($s1)
L800392ec:
  sll $zero, $zero, 0x0
L800392f0:
  andi $v0, $v0, 0x20
L800392f4:
  beq $v0, $zero, L8003939c
L800392f8:
  sll $zero, $zero, 0x0
L800392fc:
  lw $a0, 44($s1)
L80039300:
  sll $zero, $zero, 0x0
L80039304:
  beq $a0, $zero, L80039314
L80039308:
  sll $zero, $zero, 0x0
L8003930c:
  jal 0x8004036c
L80039310:
  sll $zero, $zero, 0x0
L80039314:
  jal 0x8004002c
L80039318:
  sll $zero, $zero, 0x0
L8003931c:
  addu $a0, $v0, $zero
L80039320:
  jal 0x800400ac
L80039324:
  addiu $a1, $zero, 4
L80039328:
  addu $s0, $v0, $zero
L8003932c:
  addu $a0, $s0, $zero
L80039330:
  jal 0x800427dc
L80039334:
  addiu $a1, $zero, 1
L80039338:
  addu $a0, $s0, $zero
L8003933c:
  sw $s0, 44($s1)
L80039340:
  lw $v0, 4($s0)
L80039344:
  lui $v1, 0x6000
L80039348:
  or $v0, $v0, $v1
L8003934c:
  jal 0x80042918
L80039350:
  sw $v0, 4($s0)
L80039354:
  lbu $a1, 89($s1)
L80039358:
  addu $a0, $s0, $zero
L8003935c:
  addiu $a1, $a1, -1
L80039360:
  sll $a1, $a1, 0x18
L80039364:
  jal 0x800428ec
L80039368:
  sra $a1, $a1, 0x18
L8003936c:
  lui $v0, 0xa0
L80039370:
  ori $v0, $v0, 0xa0a0
L80039374:
  lui $v1, 0x80
L80039378:
  ori $v1, $v1, 0x8080
L8003937c:
  addu $a0, $s1, $zero
L80039380:
  sw $v0, 84($s0)
L80039384:
  sw $v0, 76($s0)
L80039388:
  sw $v0, 52($s0)
L8003938c:
  sw $v0, 44($s0)
L80039390:
  sw $v1, 68($s0)
L80039394:
  jal L80039140
L80039398:
  sw $v1, 60($s0)
L8003939c:
  lw $ra, 24($sp)
L800393a0:
  lw $s1, 20($sp)
L800393a4:
  lw $s0, 16($sp)
L800393a8:
  jr $ra
L800393ac:
  addiu $sp, $sp, 32
L800393b0:
  addiu $sp, $sp, -32
L800393b4:
  sw $s0, 16($sp)
L800393b8:
  addu $s0, $a0, $zero
L800393bc:
  sw $ra, 24($sp)
L800393c0:
  sw $s1, 20($sp)
L800393c4:
  lhu $v1, 52($s0)
L800393c8:
  sll $zero, $zero, 0x0
L800393cc:
  andi $v0, $v1, 0x4000
L800393d0:
  bne $v0, $zero, L8003953c
L800393d4:
  ori $v0, $v1, 0x4000
L800393d8:
  sh $v0, 52($s0)
L800393dc:
  andi $v0, $v0, 0x2
L800393e0:
  bne $v0, $zero, L800393f0
L800393e4:
  sll $zero, $zero, 0x0
L800393e8:
  jal L80039e9c
L800393ec:
  sll $zero, $zero, 0x0
L800393f0:
  lhu $v0, 52($s0)
L800393f4:
  sll $zero, $zero, 0x0
L800393f8:
  andi $v0, $v0, 0x100
L800393fc:
  beq $v0, $zero, L8003940c
L80039400:
  addiu $v0, $zero, 8
L80039404:
  sb $v0, 91($s0)
L80039408:
  sb $v0, 90($s0)
L8003940c:
  lhu $a2, 54($s0)
L80039410:
  addiu $v0, $zero, 1
L80039414:
  sb $zero, 1103($gp)
L80039418:
  sw $zero, 1080($gp)
L8003941c:
  sb $v0, 82($s0)
L80039420:
  ori $v0, $zero, 0xcfff
L80039424:
  sb $zero, 96($s0)
L80039428:
  slt $v0, $v0, $a2
L8003942c:
  beq $v0, $zero, L8003944c
L80039430:
  sb $zero, 88($s0)
L80039434:
  lui $v0, 0xffff
L80039438:
  ori $v0, $v0, 0x3000
L8003943c:
  lui $v1, 0x801c
L80039440:
  addiu $v1, $v1, 0
L80039444:
  j L80039468
L80039448:
  lui $a0, 0xffff
L8003944c:
  addiu $v0, $zero, 32767
L80039450:
  slt $v0, $v0, $a2
L80039454:
  beq $v0, $zero, L80039484
L80039458:
  lui $v1, 0x801d
L8003945c:
  addiu $v1, $v1, 22528
L80039460:
  lui $a0, 0xffff
L80039464:
  addiu $v0, $zero, -32768
L80039468:
  addu $v0, $a2, $v0
L8003946c:
  sll $v0, $v0, 0x1
L80039470:
  addu $v0, $v0, $v1
L80039474:
  lhu $v0, 0($v0)
L80039478:
  and $v1, $v1, $a0
L8003947c:
  j L800394b8
L80039480:
  addu $v1, $v1, $v0
L80039484:
  slti $v0, $a2, 1280
L80039488:
  bne $v0, $zero, L80039494
L8003948c:
  lui $a0, 0x801b
L80039490:
  addiu $a2, $a2, -256
L80039494:
  addiu $a0, $a0, 0
L80039498:
  lui $a1, 0xffff
L8003949c:
  lui $v1, 0x801c
L800394a0:
  addiu $v1, $v1, 0
L800394a4:
  sll $v0, $a2, 0x1
L800394a8:
  addu $v0, $v0, $v1
L800394ac:
  lhu $v0, 0($v0)
L800394b0:
  and $a0, $a0, $a1
L800394b4:
  addu $v1, $a0, $v0
L800394b8:
  lw $a0, 48($s0)
L800394bc:
  sw $v1, 0($s0)
L800394c0:
  sb $zero, 86($s0)
L800394c4:
  jal 0x8004036c
L800394c8:
  sb $zero, 81($s0)
L800394cc:
  lw $a0, 44($s0)
L800394d0:
  jal 0x8004036c
L800394d4:
  sll $zero, $zero, 0x0
L800394d8:
  addu $a0, $s0, $zero
L800394dc:
  sw $zero, 48($s0)
L800394e0:
  jal L800391e4
L800394e4:
  sw $zero, 44($s0)
L800394e8:
  lhu $v0, 52($s0)
L800394ec:
  sll $zero, $zero, 0x0
L800394f0:
  andi $v0, $v0, 0x40
L800394f4:
  bne $v0, $zero, L80039780
L800394f8:
  sll $zero, $zero, 0x0
L800394fc:
  lhu $v0, 92($s0)
L80039500:
  lbu $a0, 87($s0)
L80039504:
  sll $v1, $v0, 0x3
L80039508:
  subu $v1, $v1, $v0
L8003950c:
  sll $v1, $v1, 0x2
L80039510:
  lui $v0, 0x800f
L80039514:
  addiu $v0, $v0, -19832
L80039518:
  addu $v1, $v1, $v0
L8003951c:
  sw $v1, 36($s0)
L80039520:
  jal L80035ca8
L80039524:
  sw $v1, 32($s0)
L80039528:
  lbu $a0, 87($s0)
L8003952c:
  jal L80035db8
L80039530:
  sll $zero, $zero, 0x0
L80039534:
  j L80039780
L80039538:
  sll $zero, $zero, 0x0
L8003953c:
  lbu $v0, 1103($gp)
L80039540:
  sll $zero, $zero, 0x0
L80039544:
  beq $v0, $zero, L80039588
L80039548:
  lui $v1, 0x8009
L8003954c:
  lui $v0, 0x800a
L80039550:
  lbu $v0, -19844($v0)
L80039554:
  addiu $v1, $v1, 3152
L80039558:
  sll $v0, $v0, 0x2
L8003955c:
  addu $v0, $v0, $v1
L80039560:
  lw $v0, 0($v0)
L80039564:
  sll $zero, $zero, 0x0
L80039568:
  jalr $ra, $v0
L8003956c:
  sll $zero, $zero, 0x0
L80039570:
  lui $v0, 0x800a
L80039574:
  lhu $v0, -19844($v0)
L80039578:
  sll $zero, $zero, 0x0
L8003957c:
  bne $v0, $zero, L80039588
L80039580:
  sll $zero, $zero, 0x0
L80039584:
  sb $zero, 1103($gp)
L80039588:
  lbu $v0, 81($s0)
L8003958c:
  sll $zero, $zero, 0x0
L80039590:
  beq $v0, $zero, L800395cc
L80039594:
  lui $v1, 0x8009
L80039598:
  addiu $v1, $v1, 3684
L8003959c:
  andi $v0, $v0, 0x1f
L800395a0:
  sll $v0, $v0, 0x2
L800395a4:
  addu $v0, $v0, $v1
L800395a8:
  lw $v0, 0($v0)
L800395ac:
  sll $zero, $zero, 0x0
L800395b0:
  jalr $ra, $v0
L800395b4:
  addu $a0, $s0, $zero
L800395b8:
  lhu $v0, 52($s0)
L800395bc:
  sll $zero, $zero, 0x0
L800395c0:
  andi $v0, $v0, 0xfbff
L800395c4:
  j L80039780
L800395c8:
  sh $v0, 52($s0)
L800395cc:
  lhu $v0, 52($s0)
L800395d0:
  sll $zero, $zero, 0x0
L800395d4:
  andi $v0, $v0, 0x1c00
L800395d8:
  bne $v0, $zero, L8003964c
L800395dc:
  lui $v0, 0x8009
L800395e0:
  lui $v0, 0x800a
L800395e4:
  lhu $v0, -19548($v0)
L800395e8:
  sll $zero, $zero, 0x0
L800395ec:
  andi $v0, $v0, 0x80
L800395f0:
  bne $v0, $zero, L80039610
L800395f4:
  addu $a0, $s0, $zero
L800395f8:
  lui $v0, 0x800a
L800395fc:
  lhu $v0, -19560($v0)
L80039600:
  sll $zero, $zero, 0x0
L80039604:
  andi $v0, $v0, 0xc0
L80039608:
  beq $v0, $zero, L80039630
L8003960c:
  sll $zero, $zero, 0x0
L80039610:
  addu $a1, $zero, $zero
L80039614:
  jal L800373c8
L80039618:
  addu $a2, $a1, $zero
L8003961c:
  lhu $v0, 52($s0)
L80039620:
  addiu $v1, $zero, 1
L80039624:
  sb $v1, 82($s0)
L80039628:
  ori $v0, $v0, 0x400
L8003962c:
  sh $v0, 52($s0)
L80039630:
  lbu $v0, 82($s0)
L80039634:
  sll $zero, $zero, 0x0
L80039638:
  addiu $v0, $v0, -1
L8003963c:
  sb $v0, 82($s0)
L80039640:
  andi $v0, $v0, 0xff
L80039644:
  bne $v0, $zero, L80039780
L80039648:
  lui $v0, 0x8009
L8003964c:
  lbu $v1, 83($s0)
L80039650:
  addiu $s1, $v0, 3864
L80039654:
  sb $v1, 82($s0)
L80039658:
  lb $a0, 88($s0)
L8003965c:
  sll $zero, $zero, 0x0
L80039660:
  sll $a0, $a0, 0x2
L80039664:
  addu $a0, $s0, $a0
L80039668:
  lw $v1, 0($a0)
L8003966c:
  sll $zero, $zero, 0x0
L80039670:
  lbu $v0, 0($v1)
L80039674:
  sll $zero, $zero, 0x0
L80039678:
  sh $v0, 1074($gp)
L8003967c:
  lhu $v0, 1074($gp)
L80039680:
  addiu $v1, $v1, 1
L80039684:
  sll $v0, $v0, 0x10
L80039688:
  sra $v0, $v0, 0x10
L8003968c:
  slti $v0, $v0, 240
L80039690:
  bne $v0, $zero, L800396e8
L80039694:
  sw $v1, 0($a0)
L80039698:
  sw $zero, 1096($gp)
L8003969c:
  lhu $v0, 1074($gp)
L800396a0:
  sll $zero, $zero, 0x0
L800396a4:
  sll $v0, $v0, 0x10
L800396a8:
  sra $v0, $v0, 0xe
L800396ac:
  addu $v0, $v0, $s1
L800396b0:
  lw $v0, -960($v0)
L800396b4:
  sll $zero, $zero, 0x0
L800396b8:
  jalr $ra, $v0
L800396bc:
  addu $a0, $s0, $zero
L800396c0:
  lw $v0, 1096($gp)
L800396c4:
  sll $zero, $zero, 0x0
L800396c8:
  bltz $v0, L800396e8
L800396cc:
  sll $zero, $zero, 0x0
L800396d0:
  lw $v1, 1096($gp)
L800396d4:
  addiu $v0, $zero, 1
L800396d8:
  beq $v1, $v0, L80039780
L800396dc:
  sll $zero, $zero, 0x0
L800396e0:
  j L80039658
L800396e4:
  sll $zero, $zero, 0x0
L800396e8:
  jal L80037c74
L800396ec:
  addu $a0, $s0, $zero
L800396f0:
  beq $v0, $zero, L80039700
L800396f4:
  addiu $v0, $zero, 4
L800396f8:
  j L80039780
L800396fc:
  sb $v0, 81($s0)
L80039700:
  lui $a3, 0x8ff0
L80039704:
  ori $a3, $a3, 0xffff
L80039708:
  lui $v1, 0x801e
L8003970c:
  lhu $a2, 1074($gp)
L80039710:
  lhu $v0, 1074($gp)
L80039714:
  addiu $v1, $v1, -28672
L80039718:
  sll $v0, $v0, 0x10
L8003971c:
  sra $v0, $v0, 0xe
L80039720:
  addu $v0, $v0, $v1
L80039724:
  lw $a1, 0($v0)
L80039728:
  addu $a0, $s0, $zero
L8003972c:
  sh $a2, 1106($gp)
L80039730:
  jal L80036c14
L80039734:
  and $a1, $a1, $a3
L80039738:
  lbu $v0, 96($s0)
L8003973c:
  lbu $v1, 97($s0)
L80039740:
  addiu $v0, $v0, 1
L80039744:
  beq $v1, $zero, L8003976c
L80039748:
  sb $v0, 96($s0)
L8003974c:
  andi $v0, $v0, 0xff
L80039750:
  sltu $v0, $v0, $v1
L80039754:
  bne $v0, $zero, L8003976c
L80039758:
  sll $zero, $zero, 0x0
L8003975c:
  lhu $v0, 52($s0)
L80039760:
  sll $zero, $zero, 0x0
L80039764:
  ori $v0, $v0, 0x2000
L80039768:
  sh $v0, 52($s0)
L8003976c:
  lbu $v1, 90($s0)
L80039770:
  lhu $v0, 56($s0)
L80039774:
  sll $zero, $zero, 0x0
L80039778:
  addu $v0, $v0, $v1
L8003977c:
  sh $v0, 56($s0)
L80039780:
  lw $ra, 24($sp)
L80039784:
  lw $s1, 20($sp)
L80039788:
  lw $s0, 16($sp)
L8003978c:
  jr $ra
L80039790:
  addiu $sp, $sp, 32
L80039794:
  addiu $sp, $sp, -48
L80039798:
  lui $v0, 0x800f
L8003979c:
  sw $s2, 24($sp)
L800397a0:
  addiu $s2, $v0, -20232
L800397a4:
  sw $s3, 28($sp)
L800397a8:
  addiu $s3, $zero, 4
L800397ac:
  sw $s4, 32($sp)
L800397b0:
  addiu $s4, $zero, -1
L800397b4:
  lui $v0, 0x801e
L800397b8:
  sw $s5, 36($sp)
L800397bc:
  addiu $s5, $v0, -28672
L800397c0:
  sw $s1, 20($sp)
L800397c4:
  addiu $s1, $s2, 48
L800397c8:
  sw $ra, 40($sp)
L800397cc:
  sw $s0, 16($sp)
L800397d0:
  lhu $v0, 4($s1)
L800397d4:
  sll $zero, $zero, 0x0
L800397d8:
  andi $v0, $v0, 0x8000
L800397dc:
  beq $v0, $zero, L80039900
L800397e0:
  sll $zero, $zero, 0x0
L800397e4:
  lhu $v0, 4($s1)
L800397e8:
  sh $zero, 1106($gp)
L800397ec:
  andi $v0, $v0, 0x2000
L800397f0:
  bne $v0, $zero, L8003986c
L800397f4:
  addiu $s0, $zero, -1
L800397f8:
  sh $s4, 1106($gp)
L800397fc:
  jal L800393b0
L80039800:
  addu $a0, $s2, $zero
L80039804:
  lhu $v1, 4($s1)
L80039808:
  sll $zero, $zero, 0x0
L8003980c:
  andi $v0, $v1, 0x2000
L80039810:
  beq $v0, $zero, L80039834
L80039814:
  addiu $s0, $s0, 1
L80039818:
  andi $v0, $v1, 0x8
L8003981c:
  beq $v0, $zero, L800398b0
L80039820:
  sll $zero, $zero, 0x0
L80039824:
  jal L800374f4
L80039828:
  addu $a0, $s2, $zero
L8003982c:
  j L800398b0
L80039830:
  sw $v0, 0($s1)
L80039834:
  andi $v0, $v1, 0x1c00
L80039838:
  bne $v0, $zero, L80039860
L8003983c:
  sll $zero, $zero, 0x0
L80039840:
  lui $v0, 0x800a
L80039844:
  lbu $v0, -20287($v0)
L80039848:
  sll $zero, $zero, 0x0
L8003984c:
  slt $v0, $s0, $v0
L80039850:
  beq $v0, $zero, L800398b0
L80039854:
  sll $zero, $zero, 0x0
L80039858:
  j L800397fc
L8003985c:
  sll $zero, $zero, 0x0
L80039860:
  sh $s4, 1106($gp)
L80039864:
  j L800397fc
L80039868:
  sll $zero, $zero, 0x0
L8003986c:
  lhu $v1, 4($s1)
L80039870:
  sll $zero, $zero, 0x0
L80039874:
  andi $v0, $v1, 0x8
L80039878:
  beq $v0, $zero, L800398b0
L8003987c:
  sll $zero, $zero, 0x0
L80039880:
  lui $v0, 0x800a
L80039884:
  lhu $v0, -19560($v0)
L80039888:
  sll $zero, $zero, 0x0
L8003988c:
  andi $v0, $v0, 0xc0
L80039890:
  beq $v0, $zero, L800398b0
L80039894:
  andi $v0, $v1, 0xfff7
L80039898:
  lw $a0, 0($s1)
L8003989c:
  jal 0x8004036c
L800398a0:
  sh $v0, 4($s1)
L800398a4:
  addiu $a0, $zero, 11
L800398a8:
  jal L8003fee0
L800398ac:
  sw $zero, 0($s1)
L800398b0:
  lh $v0, 1106($gp)
L800398b4:
  sll $zero, $zero, 0x0
L800398b8:
  bltz $v0, L800398f0
L800398bc:
  addiu $a0, $zero, -1
L800398c0:
  sll $v0, $v0, 0x2
L800398c4:
  addu $v0, $v0, $s5
L800398c8:
  lhu $v0, 2($v0)
L800398cc:
  sll $zero, $zero, 0x0
L800398d0:
  andi $a0, $v0, 0x7
L800398d4:
  addiu $v0, $zero, 4
L800398d8:
  bne $a0, $v0, L800398ec
L800398dc:
  sll $zero, $zero, 0x0
L800398e0:
  lbu $a0, 1102($gp)
L800398e4:
  j L800398f0
L800398e8:
  sll $zero, $zero, 0x0
L800398ec:
  sb $a0, 1102($gp)
L800398f0:
  jal L8003b50c
L800398f4:
  sll $zero, $zero, 0x0
L800398f8:
  jal L80039d64
L800398fc:
  addu $a0, $s2, $zero
L80039900:
  addiu $s1, $s1, 100
L80039904:
  addiu $s3, $s3, -1
L80039908:
  bne $s3, $zero, L800397d0
L8003990c:
  addiu $s2, $s2, 100
L80039910:
  lw $ra, 40($sp)
L80039914:
  lw $s5, 36($sp)
L80039918:
  lw $s4, 32($sp)
L8003991c:
  lw $s3, 28($sp)
L80039920:
  lw $s2, 24($sp)
L80039924:
  lw $s1, 20($sp)
L80039928:
  lw $s0, 16($sp)
L8003992c:
  jr $ra
L80039930:
  addiu $sp, $sp, 48
L80039934:
  addiu $sp, $sp, -32
L80039938:
  sw $s0, 16($sp)
L8003993c:
  addu $s0, $a0, $zero
L80039940:
  sw $s1, 20($sp)
L80039944:
  addu $s1, $a1, $zero
L80039948:
  sw $ra, 28($sp)
L8003994c:
  sw $s2, 24($sp)
L80039950:
  lw $a0, 40($s0)
L80039954:
  addu $s2, $a2, $zero
L80039958:
  sh $s1, 60($s0)
L8003995c:
  beq $a0, $zero, L8003996c
L80039960:
  sh $s2, 64($s0)
L80039964:
  sh $s1, 48($a0)
L80039968:
  sh $s2, 50($a0)
L8003996c:
  lw $a0, 44($s0)
L80039970:
  sll $zero, $zero, 0x0
L80039974:
  beq $a0, $zero, L800399a4
L80039978:
  addiu $v0, $zero, 4
L8003997c:
  lh $v1, 30($a0)
L80039980:
  sll $zero, $zero, 0x0
L80039984:
  bne $v1, $v0, L8003999c
L80039988:
  sll $zero, $zero, 0x0
L8003998c:
  jal L80039140
L80039990:
  addu $a0, $s0, $zero
L80039994:
  j L800399a4
L80039998:
  sll $zero, $zero, 0x0
L8003999c:
  sh $s1, 48($a0)
L800399a0:
  sh $s2, 50($a0)
L800399a4:
  lw $a0, 48($s0)
L800399a8:
  sll $zero, $zero, 0x0
L800399ac:
  beq $a0, $zero, L800399fc
L800399b0:
  addiu $v0, $zero, 4
L800399b4:
  lh $v1, 30($a0)
L800399b8:
  sll $zero, $zero, 0x0
L800399bc:
  bne $v1, $v0, L800399d4
L800399c0:
  sll $zero, $zero, 0x0
L800399c4:
  jal L80036dbc
L800399c8:
  addu $a0, $s0, $zero
L800399cc:
  j L800399fc
L800399d0:
  sll $zero, $zero, 0x0
L800399d4:
  lhu $v0, 62($s0)
L800399d8:
  sll $zero, $zero, 0x0
L800399dc:
  addu $v0, $v0, $s1
L800399e0:
  addiu $v0, $v0, -16
L800399e4:
  sh $v0, 48($a0)
L800399e8:
  lhu $v0, 66($s0)
L800399ec:
  sll $zero, $zero, 0x0
L800399f0:
  addu $v0, $v0, $s2
L800399f4:
  addiu $v0, $v0, -16
L800399f8:
  sh $v0, 50($a0)
L800399fc:
  lw $ra, 28($sp)
L80039a00:
  lw $s2, 24($sp)
L80039a04:
  lw $s1, 20($sp)
L80039a08:
  lw $s0, 16($sp)
L80039a0c:
  jr $ra
L80039a10:
  addiu $sp, $sp, 32
L80039a14:
  addiu $sp, $sp, -24
L80039a18:
  sw $s0, 16($sp)
L80039a1c:
  addu $s0, $a0, $zero
L80039a20:
  sw $ra, 20($sp)
L80039a24:
  lhu $v0, 52($s0)
L80039a28:
  sll $zero, $zero, 0x0
L80039a2c:
  ori $v0, $v0, 0x800
L80039a30:
  sh $v0, 52($s0)
L80039a34:
  jal L800393b0
L80039a38:
  addu $a0, $s0, $zero
L80039a3c:
  lhu $v0, 52($s0)
L80039a40:
  sll $zero, $zero, 0x0
L80039a44:
  andi $v0, $v0, 0x2000
L80039a48:
  beq $v0, $zero, L80039a34
L80039a4c:
  sll $zero, $zero, 0x0
L80039a50:
  lw $ra, 20($sp)
L80039a54:
  lw $s0, 16($sp)
L80039a58:
  jr $ra
L80039a5c:
  addiu $sp, $sp, 24
L80039a60:
  addiu $sp, $sp, -24
L80039a64:
  sw $s0, 16($sp)
L80039a68:
  addu $s0, $a0, $zero
L80039a6c:
  sw $ra, 20($sp)
L80039a70:
  lhu $v0, 52($s0)
L80039a74:
  sll $zero, $zero, 0x0
L80039a78:
  ori $v0, $v0, 0xa00
L80039a7c:
  sh $v0, 52($s0)
L80039a80:
  jal L800393b0
L80039a84:
  addu $a0, $s0, $zero
L80039a88:
  lhu $v0, 52($s0)
L80039a8c:
  sll $zero, $zero, 0x0
L80039a90:
  andi $v0, $v0, 0x2000
L80039a94:
  beq $v0, $zero, L80039a80
L80039a98:
  sll $zero, $zero, 0x0
L80039a9c:
  lw $ra, 20($sp)
L80039aa0:
  lw $s0, 16($sp)
L80039aa4:
  jr $ra
L80039aa8:
  addiu $sp, $sp, 24
L80039aac:
  lbu $v1, 19($a0)
L80039ab0:
  sll $zero, $zero, 0x0
L80039ab4:
  andi $v0, $v1, 0x80
L80039ab8:
  beq $v0, $zero, L80039ac8
L80039abc:
  ori $v0, $v1, 0x80
L80039ac0:
  jr $ra
L80039ac4:
  addiu $v0, $zero, 1
L80039ac8:
  sb $v0, 19($a0)
L80039acc:
  jr $ra
L80039ad0:
  addu $v0, $zero, $zero
L80039ad4:
  lui $v0, 0x800f
L80039ad8:
  lbu $v1, 16($a0)
L80039adc:
  addiu $v0, $v0, -20728
L80039ae0:
  addu $v1, $v1, $v0
L80039ae4:
  addiu $v0, $zero, 1
L80039ae8:
  sb $zero, 0($v1)
L80039aec:
  sb $zero, 17($a0)
L80039af0:
  sw $v0, 1064($gp)
L80039af4:
  jr $ra
L80039af8:
  sll $zero, $zero, 0x0
L80039afc:
  addiu $sp, $sp, -24
L80039b00:
  sw $s0, 16($sp)
L80039b04:
  sw $ra, 20($sp)
L80039b08:
  jal L80039aac
L80039b0c:
  addu $s0, $a0, $zero
L80039b10:
  bne $v0, $zero, L80039b28
L80039b14:
  addiu $v0, $zero, 2
L80039b18:
  sb $v0, 21($s0)
L80039b1c:
  addiu $v0, $zero, 32
L80039b20:
  sw $zero, 4($s0)
L80039b24:
  sb $v0, 20($s0)
L80039b28:
  lui $v0, 0x800a
L80039b2c:
  lw $v0, -20264($v0)
L80039b30:
  lbu $v1, 20($s0)
L80039b34:
  lbu $a0, 19($s0)
L80039b38:
  sll $v0, $v0, 0x1
L80039b3c:
  subu $v1, $v1, $v0
L80039b40:
  andi $a0, $a0, 0x40
L80039b44:
  bne $a0, $zero, L80039b94
L80039b48:
  sb $v1, 20($s0)
L80039b4c:
  lui $v1, 0x800a
L80039b50:
  lw $v1, -20264($v1)
L80039b54:
  lbu $v0, 4($s0)
L80039b58:
  sll $v1, $v1, 0x4
L80039b5c:
  addu $v0, $v0, $v1
L80039b60:
  sb $v0, 4($s0)
L80039b64:
  sll $v0, $v0, 0x18
L80039b68:
  bgez $v0, L80039b88
L80039b6c:
  addiu $v0, $zero, 128
L80039b70:
  sb $v0, 4($s0)
L80039b74:
  lbu $v0, 19($s0)
L80039b78:
  addiu $v1, $zero, 16
L80039b7c:
  sb $v1, 20($s0)
L80039b80:
  ori $v0, $v0, 0x40
L80039b84:
  sb $v0, 19($s0)
L80039b88:
  lbu $v0, 4($s0)
L80039b8c:
  j L80039bd0
L80039b90:
  sb $v0, 6($s0)
L80039b94:
  lui $v1, 0x800a
L80039b98:
  lw $v1, -20264($v1)
L80039b9c:
  lbu $v0, 5($s0)
L80039ba0:
  sll $v1, $v1, 0x4
L80039ba4:
  addu $v0, $v0, $v1
L80039ba8:
  sb $v0, 5($s0)
L80039bac:
  sll $v0, $v0, 0x18
L80039bb0:
  bgez $v0, L80039bc4
L80039bb4:
  sll $zero, $zero, 0x0
L80039bb8:
  sb $zero, 20($s0)
L80039bbc:
  sb $zero, 21($s0)
L80039bc0:
  sb $zero, 19($s0)
L80039bc4:
  lbu $v0, 5($s0)
L80039bc8:
  sll $zero, $zero, 0x0
L80039bcc:
  sb $v0, 7($s0)
L80039bd0:
  lw $ra, 20($sp)
L80039bd4:
  lw $s0, 16($sp)
L80039bd8:
  jr $ra
L80039bdc:
  addiu $sp, $sp, 24
L80039be0:
  addiu $sp, $sp, -24
L80039be4:
  sw $s0, 16($sp)
L80039be8:
  sw $ra, 20($sp)
L80039bec:
  jal L80039aac
L80039bf0:
  addu $s0, $a0, $zero
L80039bf4:
  bne $v0, $zero, L80039c10
L80039bf8:
  lui $v1, 0x8080
L80039bfc:
  ori $v1, $v1, 0x8080
L80039c00:
  addiu $v0, $zero, 2
L80039c04:
  sb $v0, 21($s0)
L80039c08:
  sw $v1, 4($s0)
L80039c0c:
  sb $zero, 20($s0)
L80039c10:
  lbu $a0, 19($s0)
L80039c14:
  sll $zero, $zero, 0x0
L80039c18:
  andi $v0, $a0, 0x40
L80039c1c:
  bne $v0, $zero, L80039c54
L80039c20:
  sll $zero, $zero, 0x0
L80039c24:
  lui $v0, 0x800a
L80039c28:
  lw $v0, -20264($v0)
L80039c2c:
  lbu $v1, 4($s0)
L80039c30:
  sll $v0, $v0, 0x4
L80039c34:
  subu $v1, $v1, $v0
L80039c38:
  bgtz $v1, L80039c48
L80039c3c:
  ori $v0, $a0, 0x40
L80039c40:
  sb $v0, 19($s0)
L80039c44:
  addu $v1, $zero, $zero
L80039c48:
  sb $v1, 4($s0)
L80039c4c:
  j L80039c84
L80039c50:
  sb $v1, 5($s0)
L80039c54:
  lui $v0, 0x800a
L80039c58:
  lw $v0, -20264($v0)
L80039c5c:
  lbu $v1, 6($s0)
L80039c60:
  sll $v0, $v0, 0x4
L80039c64:
  subu $v1, $v1, $v0
L80039c68:
  bgtz $v1, L80039c7c
L80039c6c:
  sll $zero, $zero, 0x0
L80039c70:
  jal L80039ad4
L80039c74:
  addu $a0, $s0, $zero
L80039c78:
  addu $v1, $zero, $zero
L80039c7c:
  sb $v1, 6($s0)
L80039c80:
  sb $v1, 7($s0)
L80039c84:
  lw $ra, 20($sp)
L80039c88:
  lw $s0, 16($sp)
L80039c8c:
  jr $ra
L80039c90:
  addiu $sp, $sp, 24
L80039c94:
  addiu $sp, $sp, -24
L80039c98:
  sw $s0, 16($sp)
L80039c9c:
  sw $ra, 20($sp)
L80039ca0:
  jal L80039aac
L80039ca4:
  addu $s0, $a0, $zero
L80039ca8:
  bne $v0, $zero, L80039ce4
L80039cac:
  addiu $v1, $zero, 1
L80039cb0:
  lhu $v0, 12($s0)
L80039cb4:
  sb $v1, 21($s0)
L80039cb8:
  lhu $v1, 14($s0)
L80039cbc:
  sb $zero, 8($s0)
L80039cc0:
  sb $zero, 9($s0)
L80039cc4:
  sb $zero, 10($s0)
L80039cc8:
  sll $v0, $v0, 0x10
L80039ccc:
  sra $v0, $v0, 0x14
L80039cd0:
  sll $v1, $v1, 0x10
L80039cd4:
  sra $v1, $v1, 0x13
L80039cd8:
  addu $v0, $v0, $v1
L80039cdc:
  addiu $v0, $v0, 1
L80039ce0:
  sb $v0, 4($s0)
L80039ce4:
  lbu $v0, 19($s0)
L80039ce8:
  sll $zero, $zero, 0x0
L80039cec:
  andi $v0, $v0, 0x40
L80039cf0:
  bne $v0, $zero, L80039d28
L80039cf4:
  sll $zero, $zero, 0x0
L80039cf8:
  lbu $v0, 4($s0)
L80039cfc:
  sll $zero, $zero, 0x0
L80039d00:
  addiu $v0, $v0, -1
L80039d04:
  sb $v0, 4($s0)
L80039d08:
  andi $v0, $v0, 0xff
L80039d0c:
  bne $v0, $zero, L80039d54
L80039d10:
  sll $zero, $zero, 0x0
L80039d14:
  lbu $v0, 19($s0)
L80039d18:
  sll $zero, $zero, 0x0
L80039d1c:
  ori $v0, $v0, 0x40
L80039d20:
  j L80039d54
L80039d24:
  sb $v0, 19($s0)
L80039d28:
  lbu $v0, 8($s0)
L80039d2c:
  sll $zero, $zero, 0x0
L80039d30:
  addiu $v0, $v0, 4
L80039d34:
  sb $v0, 10($s0)
L80039d38:
  sb $v0, 9($s0)
L80039d3c:
  sb $v0, 8($s0)
L80039d40:
  slti $v0, $v0, 64
L80039d44:
  bne $v0, $zero, L80039d54
L80039d48:
  sll $zero, $zero, 0x0
L80039d4c:
  jal L80039ad4
L80039d50:
  addu $a0, $s0, $zero
L80039d54:
  lw $ra, 20($sp)
L80039d58:
  lw $s0, 16($sp)
L80039d5c:
  jr $ra
L80039d60:
  addiu $sp, $sp, 24
L80039d64:
  addiu $sp, $sp, -40
L80039d68:
  sw $s2, 24($sp)
L80039d6c:
  addu $s2, $a0, $zero
L80039d70:
  sw $ra, 32($sp)
L80039d74:
  sw $s3, 28($sp)
L80039d78:
  sw $s1, 20($sp)
L80039d7c:
  sw $s0, 16($sp)
L80039d80:
  lw $s1, 36($s2)
L80039d84:
  sw $zero, 1064($gp)
L80039d88:
  lbu $v0, 17($s1)
L80039d8c:
  sll $zero, $zero, 0x0
L80039d90:
  andi $v0, $v0, 0x80
L80039d94:
  beq $v0, $zero, L80039de4
L80039d98:
  lui $v0, 0x8009
L80039d9c:
  addiu $s3, $v0, 3928
L80039da0:
  addiu $s0, $s1, 17
L80039da4:
  lbu $v0, 2($s0)
L80039da8:
  sll $zero, $zero, 0x0
L80039dac:
  beq $v0, $zero, L80039dcc
L80039db0:
  andi $v0, $v0, 0x1f
L80039db4:
  sll $v0, $v0, 0x2
L80039db8:
  addu $v0, $v0, $s3
L80039dbc:
  lw $v0, 0($v0)
L80039dc0:
  addu $a0, $s1, $zero
L80039dc4:
  jalr $ra, $v0
L80039dc8:
  addu $a1, $s2, $zero
L80039dcc:
  addiu $s0, $s0, 28
L80039dd0:
  lbu $v0, 0($s0)
L80039dd4:
  sll $zero, $zero, 0x0
L80039dd8:
  andi $v0, $v0, 0x80
L80039ddc:
  bne $v0, $zero, L80039da4
L80039de0:
  addiu $s1, $s1, 28
L80039de4:
  lw $v0, 1064($gp)
L80039de8:
  sll $zero, $zero, 0x0
L80039dec:
  beq $v0, $zero, L80039e80
L80039df0:
  sll $zero, $zero, 0x0
L80039df4:
  lhu $v0, 92($s2)
L80039df8:
  lw $a1, 32($s2)
L80039dfc:
  sll $v1, $v0, 0x3
L80039e00:
  subu $v1, $v1, $v0
L80039e04:
  sll $v1, $v1, 0x2
L80039e08:
  lui $v0, 0x800f
L80039e0c:
  addiu $v0, $v0, -19832
L80039e10:
  addu $v1, $v1, $v0
L80039e14:
  beq $v1, $a1, L80039e78
L80039e18:
  addu $a0, $v1, $zero
L80039e1c:
  lbu $v0, 17($a0)
L80039e20:
  sll $zero, $zero, 0x0
L80039e24:
  andi $v0, $v0, 0x80
L80039e28:
  beq $v0, $zero, L80039e6c
L80039e2c:
  sll $zero, $zero, 0x0
L80039e30:
  lw $a2, 0($a0)
L80039e34:
  lw $a3, 4($a0)
L80039e38:
  lw $t0, 8($a0)
L80039e3c:
  lw $t1, 12($a0)
L80039e40:
  sw $a2, 0($v1)
L80039e44:
  sw $a3, 4($v1)
L80039e48:
  sw $t0, 8($v1)
L80039e4c:
  sw $t1, 12($v1)
L80039e50:
  lw $a2, 16($a0)
L80039e54:
  lw $a3, 20($a0)
L80039e58:
  lw $t0, 24($a0)
L80039e5c:
  sw $a2, 16($v1)
L80039e60:
  sw $a3, 20($v1)
L80039e64:
  sw $t0, 24($v1)
L80039e68:
  addiu $v1, $v1, 28
L80039e6c:
  addiu $a0, $a0, 28
L80039e70:
  bne $a0, $a1, L80039e1c
L80039e74:
  sll $zero, $zero, 0x0
L80039e78:
  sw $v1, 32($s2)
L80039e7c:
  sb $zero, 17($v1)
L80039e80:
  lw $ra, 32($sp)
L80039e84:
  lw $s3, 28($sp)
L80039e88:
  lw $s2, 24($sp)
L80039e8c:
  lw $s1, 20($sp)
L80039e90:
  lw $s0, 16($sp)
L80039e94:
  jr $ra
L80039e98:
  addiu $sp, $sp, 40
L80039e9c:
  addiu $a1, $zero, 2
L80039ea0:
  addiu $a2, $zero, -1
L80039ea4:
  lui $v0, 0x800f
L80039ea8:
  addiu $v0, $v0, -20464
L80039eac:
  addiu $v0, $v0, 152
L80039eb0:
  addiu $a0, $zero, 2
L80039eb4:
  addiu $v1, $v0, 8
L80039eb8:
  sb $a2, 48($v0)
L80039ebc:
  sb $zero, 50($v0)
L80039ec0:
  sb $zero, 58($v0)
L80039ec4:
  sb $zero, 59($v0)
L80039ec8:
  sw $zero, 0($v1)
L80039ecc:
  sw $zero, 12($v1)
L80039ed0:
  sw $zero, 24($v1)
L80039ed4:
  sw $zero, 36($v1)
L80039ed8:
  addiu $a0, $a0, -1
L80039edc:
  bgez $a0, L80039ec8
L80039ee0:
  addiu $v1, $v1, -4
L80039ee4:
  addiu $a1, $a1, -1
L80039ee8:
  bgez $a1, L80039eb0
L80039eec:
  addiu $v0, $v0, -76
L80039ef0:
  addiu $v1, $zero, -1
L80039ef4:
  addiu $a1, $zero, 4
L80039ef8:
  lui $v0, 0x8016
L80039efc:
  addiu $v0, $v0, -15344
L80039f00:
  addu $v0, $v0, $a1
L80039f04:
  sb $v1, 0($v0)
L80039f08:
  addiu $a1, $a1, -1
L80039f0c:
  bgez $a1, L80039f04
L80039f10:
  addiu $v0, $v0, -1
L80039f14:
  jr $ra
L80039f18:
  sll $zero, $zero, 0x0
L80039f1c:
  lbu $v1, 51($a0)
L80039f20:
  sll $zero, $zero, 0x0
L80039f24:
  andi $v0, $v1, 0x80
L80039f28:
  beq $v0, $zero, L80039f38
L80039f2c:
  ori $v0, $v1, 0x80
L80039f30:
  jr $ra
L80039f34:
  addiu $v0, $zero, 1
L80039f38:
  sb $v0, 51($a0)
L80039f3c:
  jr $ra
L80039f40:
  addu $v0, $zero, $zero
L80039f44:
  addiu $sp, $sp, -24
L80039f48:
  sw $s0, 16($sp)
L80039f4c:
  addu $s0, $a0, $zero
L80039f50:
  addiu $v0, $zero, 104
L80039f54:
  sw $ra, 20($sp)
L80039f58:
  sh $v0, 52($s0)
L80039f5c:
  addiu $v0, $zero, 178
L80039f60:
  sb $zero, 50($s0)
L80039f64:
  sb $zero, 51($s0)
L80039f68:
  sb $zero, 49($s0)
L80039f6c:
  jal 0x8008e590
L80039f70:
  sh $v0, 54($s0)
L80039f74:
  andi $v0, $v0, 0xff
L80039f78:
  addiu $v0, $v0, 60
L80039f7c:
  sh $v0, 62($s0)
L80039f80:
  lw $ra, 20($sp)
L80039f84:
  lw $s0, 16($sp)
L80039f88:
  jr $ra
L80039f8c:
  addiu $sp, $sp, 24
L80039f90:
  addiu $sp, $sp, -32
L80039f94:
  sw $s1, 20($sp)
L80039f98:
  addiu $s1, $zero, 2
L80039f9c:
  sw $s0, 16($sp)
L80039fa0:
  addiu $s0, $a0, 8
L80039fa4:
  sw $ra, 24($sp)
L80039fa8:
  lw $a0, 0($s0)
L80039fac:
  jal 0x8004036c
L80039fb0:
  addiu $s1, $s1, -1
L80039fb4:
  sw $zero, 0($s0)
L80039fb8:
  bgez $s1, L80039fa8
L80039fbc:
  addiu $s0, $s0, -4
L80039fc0:
  lw $ra, 24($sp)
L80039fc4:
  lw $s1, 20($sp)
L80039fc8:
  lw $s0, 16($sp)
L80039fcc:
  jr $ra
L80039fd0:
  addiu $sp, $sp, 32
L80039fd4:
  addiu $sp, $sp, -24
L80039fd8:
  addiu $v0, $zero, -1
L80039fdc:
  sw $ra, 16($sp)
L80039fe0:
  jal L80039f90
L80039fe4:
  sb $v0, 48($a0)
L80039fe8:
  lw $ra, 16($sp)
L80039fec:
  sll $zero, $zero, 0x0
L80039ff0:
  jr $ra
L80039ff4:
  addiu $sp, $sp, 24
L80039ff8:
  lbu $v1, 50($a0)
L80039ffc:
  sll $zero, $zero, 0x0
L8003a000:
  andi $v0, $v1, 0x3
L8003a004:
  bne $v0, $zero, L8003a014
L8003a008:
  ori $v0, $v1, 0x10
L8003a00c:
  sb $v0, 50($a0)
L8003a010:
  sb $zero, 51($a0)
L8003a014:
  jr $ra
L8003a018:
  sll $zero, $zero, 0x0
L8003a01c:
  addiu $sp, $sp, -32
L8003a020:
  sw $s0, 16($sp)
L8003a024:
  addu $s0, $a0, $zero
L8003a028:
  sw $s1, 20($sp)
L8003a02c:
  addiu $s1, $zero, 1
L8003a030:
  beq $a1, $s1, L8003a0f8
L8003a034:
  sw $ra, 24($sp)
L8003a038:
  slti $v0, $a1, 2
L8003a03c:
  beq $v0, $zero, L8003a054
L8003a040:
  sll $zero, $zero, 0x0
L8003a044:
  beq $a1, $zero, L8003a068
L8003a048:
  lui $a1, 0xffdd
L8003a04c:
  j L8003a184
L8003a050:
  sll $zero, $zero, 0x0
L8003a054:
  addiu $v0, $zero, 2
L8003a058:
  beq $a1, $v0, L8003a120
L8003a05c:
  addiu $v0, $zero, 512
L8003a060:
  j L8003a184
L8003a064:
  sll $zero, $zero, 0x0
L8003a068:
  ori $a1, $a1, 0xffff
L8003a06c:
  lui $a0, 0x1
L8003a070:
  lui $v1, 0x800a
L8003a074:
  lw $v1, -20236($v1)
L8003a078:
  ori $a0, $a0, 0x8000
L8003a07c:
  sw $a0, 28($s0)
L8003a080:
  lw $a0, 60($s0)
L8003a084:
  addiu $v0, $zero, 256
L8003a088:
  sh $v0, 50($s0)
L8003a08c:
  addiu $v0, $zero, 64
L8003a090:
  sh $v0, 4($s0)
L8003a094:
  addiu $v0, $zero, 16
L8003a098:
  sh $v0, 6($s0)
L8003a09c:
  and $v1, $v1, $a1
L8003a0a0:
  lui $at, 0x800a
L8003a0a4:
  sw $v1, -20236($at)
L8003a0a8:
  lui $v0, 0x800a
L8003a0ac:
  lw $v0, -20236($v0)
L8003a0b0:
  lui $v1, 0x1
L8003a0b4:
  or $v0, $v0, $v1
L8003a0b8:
  lui $at, 0x800a
L8003a0bc:
  sw $v0, -20236($at)
L8003a0c0:
  addiu $v0, $zero, 2
L8003a0c4:
  sll $v1, $a0, 0x1
L8003a0c8:
  addu $v1, $v1, $a0
L8003a0cc:
  sll $v1, $v1, 0x6
L8003a0d0:
  sb $v0, 70($s0)
L8003a0d4:
  addiu $v0, $zero, 832
L8003a0d8:
  lui $a0, 0x800a
L8003a0dc:
  lw $a0, -20200($a0)
L8003a0e0:
  subu $v0, $v0, $v1
L8003a0e4:
  sh $v0, 48($s0)
L8003a0e8:
  sw $a0, 8($s0)
L8003a0ec:
  addiu $a0, $a0, 2048
L8003a0f0:
  j L8003a184
L8003a0f4:
  sw $a0, 12($s0)
L8003a0f8:
  lui $a0, 0xffdc
L8003a0fc:
  ori $a0, $a0, 0xffff
L8003a100:
  addiu $v0, $zero, 2048
L8003a104:
  sw $v0, 28($s0)
L8003a108:
  lui $v0, 0x800a
L8003a10c:
  lw $v0, -20236($v0)
L8003a110:
  lui $v1, 0x800a
L8003a114:
  lw $v1, -20200($v1)
L8003a118:
  j L8003a170
L8003a11c:
  and $v0, $v0, $a0
L8003a120:
  sh $v0, 0($s0)
L8003a124:
  lw $v0, 60($s0)
L8003a128:
  addiu $v1, $zero, 256
L8003a12c:
  sh $a1, 6($s0)
L8003a130:
  lui $a1, 0x800a
L8003a134:
  lw $a1, -20200($a1)
L8003a138:
  addu $a0, $s0, $zero
L8003a13c:
  sh $v1, 4($s0)
L8003a140:
  sll $v0, $v0, 0x1
L8003a144:
  addiu $v0, $v0, 240
L8003a148:
  jal 0x80081de8
L8003a14c:
  sh $v0, 2($s0)
L8003a150:
  lui $a0, 0xffdc
L8003a154:
  ori $a0, $a0, 0xffff
L8003a158:
  addiu $v0, $zero, 2048
L8003a15c:
  sw $v0, 28($s0)
L8003a160:
  lui $v0, 0x800a
L8003a164:
  lw $v0, -20236($v0)
L8003a168:
  lw $v1, 56($s0)
L8003a16c:
  and $v0, $v0, $a0
L8003a170:
  lui $at, 0x800a
L8003a174:
  sw $v0, -20236($at)
L8003a178:
  sw $v1, 12($s0)
L8003a17c:
  sw $v1, 8($s0)
L8003a180:
  sb $s1, 70($s0)
L8003a184:
  lw $ra, 24($sp)
L8003a188:
  lw $s1, 20($sp)
L8003a18c:
  lw $s0, 16($sp)
L8003a190:
  jr $ra
L8003a194:
  addiu $sp, $sp, 32
L8003a198:
  sll $a1, $a1, 0x1
L8003a19c:
  addu $a1, $a0, $a1
L8003a1a0:
  lhu $v0, 0($a1)
L8003a1a4:
  sll $zero, $zero, 0x0
L8003a1a8:
  beq $v0, $zero, L8003a1e0
L8003a1ac:
  addu $v0, $a0, $v0
L8003a1b0:
  sll $v1, $a2, 0x1
L8003a1b4:
  addu $a1, $v0, $v1
L8003a1b8:
  lhu $v0, 0($a1)
L8003a1bc:
  sll $zero, $zero, 0x0
L8003a1c0:
  beq $v0, $zero, L8003a1e0
L8003a1c4:
  addu $v0, $a0, $v0
L8003a1c8:
  sll $v1, $a3, 0x1
L8003a1cc:
  addu $a1, $v0, $v1
L8003a1d0:
  lhu $v1, 0($a1)
L8003a1d4:
  sll $zero, $zero, 0x0
L8003a1d8:
  bne $v1, $zero, L8003a1e4
L8003a1dc:
  addiu $v0, $zero, 1
L8003a1e0:
  addu $v0, $zero, $zero
L8003a1e4:
  jr $ra
L8003a1e8:
  sll $zero, $zero, 0x0
L8003a1ec:
  addiu $sp, $sp, -80
L8003a1f0:
  sw $s2, 48($sp)
L8003a1f4:
  addu $s2, $a0, $zero
L8003a1f8:
  sw $fp, 72($sp)
L8003a1fc:
  addu $fp, $a1, $zero
L8003a200:
  sw $ra, 76($sp)
L8003a204:
  sw $s7, 68($sp)
L8003a208:
  sw $s6, 64($sp)
L8003a20c:
  sw $s5, 60($sp)
L8003a210:
  sw $s4, 56($sp)
L8003a214:
  sw $s3, 52($sp)
L8003a218:
  sw $s1, 44($sp)
L8003a21c:
  sw $s0, 40($sp)
L8003a220:
  lbu $v0, 60($s2)
L8003a224:
  sll $zero, $zero, 0x0
L8003a228:
  beq $v0, $zero, L8003a248
L8003a22c:
  addu $s6, $a2, $zero
L8003a230:
  addiu $s5, $zero, -10
L8003a234:
  lui $v0, 0x801b
L8003a238:
  addiu $s1, $v0, -2048
L8003a23c:
  addiu $s4, $zero, 26
L8003a240:
  j L8003a25c
L8003a244:
  addiu $s3, $zero, 514
L8003a248:
  addiu $s5, $zero, -14
L8003a24c:
  lui $v0, 0x801b
L8003a250:
  addiu $s1, $v0, -4096
L8003a254:
  addiu $s4, $zero, 29
L8003a258:
  addiu $s3, $zero, 512
L8003a25c:
  addu $a0, $s1, $zero
L8003a260:
  addu $a1, $s6, $zero
L8003a264:
  addu $a2, $zero, $zero
L8003a268:
  jal L8003a198
L8003a26c:
  addu $a3, $a2, $zero
L8003a270:
  beq $v0, $zero, L8003a410
L8003a274:
  addu $v0, $zero, $zero
L8003a278:
  jal 0x8004002c
L8003a27c:
  lui $s7, 0x4100
L8003a280:
  addu $a0, $v0, $zero
L8003a284:
  jal 0x800400ac
L8003a288:
  addiu $a1, $zero, 2
L8003a28c:
  addu $s0, $v0, $zero
L8003a290:
  addu $a0, $s0, $zero
L8003a294:
  lh $a1, 52($s2)
L8003a298:
  lh $a2, 54($s2)
L8003a29c:
  addu $a3, $s6, $zero
L8003a2a0:
  sw $zero, 16($sp)
L8003a2a4:
  sw $zero, 20($sp)
L8003a2a8:
  sw $s4, 24($sp)
L8003a2ac:
  sw $s3, 28($sp)
L8003a2b0:
  jal 0x800428a8
L8003a2b4:
  sw $s1, 32($sp)
L8003a2b8:
  jal 0x80042918
L8003a2bc:
  addu $a0, $s0, $zero
L8003a2c0:
  addu $a0, $s0, $zero
L8003a2c4:
  jal 0x800428ec
L8003a2c8:
  addu $a1, $s5, $zero
L8003a2cc:
  addu $a0, $s1, $zero
L8003a2d0:
  addu $a1, $s6, $zero
L8003a2d4:
  addiu $a2, $zero, 1
L8003a2d8:
  addu $a3, $zero, $zero
L8003a2dc:
  lw $v0, 4($s0)
L8003a2e0:
  lhu $v1, 8($s0)
L8003a2e4:
  or $v0, $v0, $s7
L8003a2e8:
  ori $v1, $v1, 0x8
L8003a2ec:
  sw $v0, 4($s0)
L8003a2f0:
  sh $v1, 8($s0)
L8003a2f4:
  jal L8003a198
L8003a2f8:
  sw $s0, 0($fp)
L8003a2fc:
  beq $v0, $zero, L8003a374
L8003a300:
  addu $s0, $zero, $zero
L8003a304:
  jal 0x8004002c
L8003a308:
  sll $zero, $zero, 0x0
L8003a30c:
  addu $a0, $v0, $zero
L8003a310:
  jal 0x800400ac
L8003a314:
  addiu $a1, $zero, 2
L8003a318:
  addu $s0, $v0, $zero
L8003a31c:
  addu $a0, $s0, $zero
L8003a320:
  addu $a3, $s6, $zero
L8003a324:
  lh $a1, 52($s2)
L8003a328:
  lh $a2, 54($s2)
L8003a32c:
  addiu $v0, $zero, 1
L8003a330:
  sw $v0, 16($sp)
L8003a334:
  sw $zero, 20($sp)
L8003a338:
  sw $s4, 24($sp)
L8003a33c:
  sw $s3, 28($sp)
L8003a340:
  jal 0x800428a8
L8003a344:
  sw $s1, 32($sp)
L8003a348:
  jal 0x80042918
L8003a34c:
  addu $a0, $s0, $zero
L8003a350:
  addu $a0, $s0, $zero
L8003a354:
  jal 0x800428ec
L8003a358:
  ori $a1, $s5, 0x1
L8003a35c:
  lw $v0, 4($s0)
L8003a360:
  lhu $v1, 8($s0)
L8003a364:
  or $v0, $v0, $s7
L8003a368:
  ori $v1, $v1, 0x8
L8003a36c:
  sw $v0, 4($s0)
L8003a370:
  sh $v1, 8($s0)
L8003a374:
  sw $s0, 4($fp)
L8003a378:
  addu $a0, $s1, $zero
L8003a37c:
  addu $a1, $s6, $zero
L8003a380:
  addiu $a2, $zero, 2
L8003a384:
  jal L8003a198
L8003a388:
  addu $a3, $zero, $zero
L8003a38c:
  beq $v0, $zero, L8003a408
L8003a390:
  addu $s0, $zero, $zero
L8003a394:
  jal 0x8004002c
L8003a398:
  sll $zero, $zero, 0x0
L8003a39c:
  addu $a0, $v0, $zero
L8003a3a0:
  jal 0x800400ac
L8003a3a4:
  addiu $a1, $zero, 2
L8003a3a8:
  addu $s0, $v0, $zero
L8003a3ac:
  addu $a0, $s0, $zero
L8003a3b0:
  addu $a3, $s6, $zero
L8003a3b4:
  lh $a1, 52($s2)
L8003a3b8:
  lh $a2, 54($s2)
L8003a3bc:
  addiu $v0, $zero, 2
L8003a3c0:
  sw $v0, 16($sp)
L8003a3c4:
  sw $zero, 20($sp)
L8003a3c8:
  sw $s4, 24($sp)
L8003a3cc:
  sw $s3, 28($sp)
L8003a3d0:
  jal 0x800428a8
L8003a3d4:
  sw $s1, 32($sp)
L8003a3d8:
  jal 0x80042918
L8003a3dc:
  addu $a0, $s0, $zero
L8003a3e0:
  addu $a0, $s0, $zero
L8003a3e4:
  jal 0x800428ec
L8003a3e8:
  ori $a1, $s5, 0x1
L8003a3ec:
  lui $a0, 0x4100
L8003a3f0:
  lw $v0, 4($s0)
L8003a3f4:
  lhu $v1, 8($s0)
L8003a3f8:
  or $v0, $v0, $a0
L8003a3fc:
  ori $v1, $v1, 0x8
L8003a400:
  sw $v0, 4($s0)
L8003a404:
  sh $v1, 8($s0)
L8003a408:
  sw $s0, 8($fp)
L8003a40c:
  addiu $v0, $zero, 1
L8003a410:
  lw $ra, 76($sp)
L8003a414:
  lw $fp, 72($sp)
L8003a418:
  lw $s7, 68($sp)
L8003a41c:
  lw $s6, 64($sp)
L8003a420:
  lw $s5, 60($sp)
L8003a424:
  lw $s4, 56($sp)
L8003a428:
  lw $s3, 52($sp)
L8003a42c:
  lw $s2, 48($sp)
L8003a430:
  lw $s1, 44($sp)
L8003a434:
  lw $s0, 40($sp)
L8003a438:
  jr $ra
L8003a43c:
  addiu $sp, $sp, 80
L8003a440:
  addiu $sp, $sp, -48
L8003a444:
  sw $s3, 28($sp)
L8003a448:
  addu $s3, $a1, $zero
L8003a44c:
  sw $s4, 32($sp)
L8003a450:
  addu $s4, $a2, $zero
L8003a454:
  sw $ra, 40($sp)
L8003a458:
  sw $s5, 36($sp)
L8003a45c:
  sw $s2, 24($sp)
L8003a460:
  sw $s1, 20($sp)
L8003a464:
  bne $s3, $zero, L8003a4d8
L8003a468:
  sw $s0, 16($sp)
L8003a46c:
  addiu $s1, $zero, 2
L8003a470:
  lui $s3, 0x8fff
L8003a474:
  ori $s3, $s3, 0xffff
L8003a478:
  lui $s5, 0x4000
L8003a47c:
  addiu $s2, $a0, 8
L8003a480:
  lw $s0, 0($s2)
L8003a484:
  sll $zero, $zero, 0x0
L8003a488:
  beq $s0, $zero, L8003a4c4
L8003a48c:
  addu $a0, $s0, $zero
L8003a490:
  sll $a1, $s4, 0x18
L8003a494:
  lw $v0, 4($s0)
L8003a498:
  sra $a1, $a1, 0x18
L8003a49c:
  and $v0, $v0, $s3
L8003a4a0:
  or $v0, $v0, $s5
L8003a4a4:
  jal 0x800428ec
L8003a4a8:
  sw $v0, 4($s0)
L8003a4ac:
  lui $v1, 0x80
L8003a4b0:
  lhu $v0, 66($s0)
L8003a4b4:
  ori $v1, $v1, 0x8080
L8003a4b8:
  sw $v1, 12($s0)
L8003a4bc:
  addiu $v0, $v0, -1
L8003a4c0:
  sh $v0, 66($s0)
L8003a4c4:
  addiu $s1, $s1, -1
L8003a4c8:
  bgez $s1, L8003a480
L8003a4cc:
  addiu $s2, $s2, -4
L8003a4d0:
  j L8003a53c
L8003a4d4:
  sll $zero, $zero, 0x0
L8003a4d8:
  addiu $s1, $zero, 2
L8003a4dc:
  lui $s5, 0x8fff
L8003a4e0:
  ori $s5, $s5, 0xffff
L8003a4e4:
  sll $s4, $s4, 0x18
L8003a4e8:
  addiu $s2, $a0, 8
L8003a4ec:
  lw $s0, 0($s2)
L8003a4f0:
  sll $zero, $zero, 0x0
L8003a4f4:
  beq $s0, $zero, L8003a530
L8003a4f8:
  addu $a0, $s0, $zero
L8003a4fc:
  lw $v0, 4($s0)
L8003a500:
  sra $a1, $s4, 0x18
L8003a504:
  and $v0, $v0, $s5
L8003a508:
  or $v0, $v0, $s3
L8003a50c:
  jal 0x800428ec
L8003a510:
  sw $v0, 4($s0)
L8003a514:
  lui $v0, 0x6000
L8003a518:
  beq $s3, $v0, L8003a52c
L8003a51c:
  addiu $v0, $zero, 253
L8003a520:
  lhu $v0, 66($s0)
L8003a524:
  sll $zero, $zero, 0x0
L8003a528:
  addiu $v0, $v0, 1
L8003a52c:
  sh $v0, 66($s0)
L8003a530:
  addiu $s1, $s1, -1
L8003a534:
  bgez $s1, L8003a4ec
L8003a538:
  addiu $s2, $s2, -4
L8003a53c:
  lw $ra, 40($sp)
L8003a540:
  lw $s5, 36($sp)
L8003a544:
  lw $s4, 32($sp)
L8003a548:
  lw $s3, 28($sp)
L8003a54c:
  lw $s2, 24($sp)
L8003a550:
  lw $s1, 20($sp)
L8003a554:
  lw $s0, 16($sp)
L8003a558:
  jr $ra
L8003a55c:
  addiu $sp, $sp, 48
L8003a560:
  addiu $sp, $sp, -56
L8003a564:
  sw $s3, 44($sp)
L8003a568:
  addu $s3, $a0, $zero
L8003a56c:
  sw $ra, 52($sp)
L8003a570:
  sw $s4, 48($sp)
L8003a574:
  sw $s2, 40($sp)
L8003a578:
  sw $s1, 36($sp)
L8003a57c:
  jal L80039f1c
L8003a580:
  sw $s0, 32($sp)
L8003a584:
  bne $v0, $zero, L8003a788
L8003a588:
  lui $v0, 0x6
L8003a58c:
  ori $v0, $v0, 0x3040
L8003a590:
  addiu $a0, $zero, 4
L8003a594:
  lui $v1, 0x8016
L8003a598:
  addiu $a1, $v1, -15344
L8003a59c:
  addiu $s4, $zero, 256
L8003a5a0:
  lui $s1, 0x1
L8003a5a4:
  lui $v1, 0x8001
L8003a5a8:
  lw $v1, 0($v1)
L8003a5ac:
  ori $s1, $s1, 0x8400
L8003a5b0:
  sb $zero, 1054($gp)
L8003a5b4:
  addu $s2, $v1, $v0
L8003a5b8:
  addu $v1, $a0, $a1
L8003a5bc:
  lb $v0, 0($v1)
L8003a5c0:
  sll $zero, $zero, 0x0
L8003a5c4:
  bgez $v0, L8003a5d4
L8003a5c8:
  sll $zero, $zero, 0x0
L8003a5cc:
  sb $a0, 1054($gp)
L8003a5d0:
  lb $v0, 0($v1)
L8003a5d4:
  lb $a3, 48($s3)
L8003a5d8:
  sll $zero, $zero, 0x0
L8003a5dc:
  bne $v0, $a3, L8003a6b4
L8003a5e0:
  lui $v0, 0xfffe
L8003a5e4:
  jal 0x80082324
L8003a5e8:
  addiu $a0, $zero, 10
L8003a5ec:
  bne $v0, $zero, L8003a5e4
L8003a5f0:
  lui $s0, 0x1
L8003a5f4:
  ori $s0, $s0, 0x8000
L8003a5f8:
  lui $a0, 0x1
L8003a5fc:
  ori $a0, $a0, 0x8c00
L8003a600:
  addu $a0, $s2, $a0
L8003a604:
  addu $a1, $s2, $zero
L8003a608:
  addu $s0, $s2, $s0
L8003a60c:
  lbu $a2, 60($s3)
L8003a610:
  addiu $v0, $zero, 192
L8003a614:
  sh $v0, 3076($s0)
L8003a618:
  addiu $v0, $zero, 832
L8003a61c:
  sh $s4, 3074($s0)
L8003a620:
  sh $s4, 3078($s0)
L8003a624:
  sll $v1, $a2, 0x1
L8003a628:
  addu $v1, $v1, $a2
L8003a62c:
  sll $v1, $v1, 0x6
L8003a630:
  subu $v0, $v0, $v1
L8003a634:
  jal 0x8007f978
L8003a638:
  sh $v0, 3072($s0)
L8003a63c:
  lui $a0, 0x1
L8003a640:
  ori $a0, $a0, 0x8c08
L8003a644:
  addu $a0, $s2, $a0
L8003a648:
  addiu $v0, $zero, 512
L8003a64c:
  addu $a1, $s0, $zero
L8003a650:
  sh $v0, 3080($s0)
L8003a654:
  lbu $v1, 60($s3)
L8003a658:
  addiu $v0, $zero, 2
L8003a65c:
  sh $s4, 3084($a1)
L8003a660:
  sh $v0, 3086($a1)
L8003a664:
  sll $v1, $v1, 0x1
L8003a668:
  addiu $v1, $v1, 240
L8003a66c:
  jal 0x8007f978
L8003a670:
  sh $v1, 3082($a1)
L8003a674:
  lbu $v0, 60($s3)
L8003a678:
  sll $zero, $zero, 0x0
L8003a67c:
  beq $v0, $zero, L8003a68c
L8003a680:
  lui $a0, 0x801b
L8003a684:
  j L8003a694
L8003a688:
  addiu $a0, $a0, -2048
L8003a68c:
  lui $a0, 0x801b
L8003a690:
  addiu $a0, $a0, -4096
L8003a694:
  addu $a1, $s2, $s1
L8003a698:
  jal L800356a0
L8003a69c:
  addiu $a2, $zero, 2048
L8003a6a0:
  lbu $v0, 51($s3)
L8003a6a4:
  sll $zero, $zero, 0x0
L8003a6a8:
  ori $v0, $v0, 0x40
L8003a6ac:
  j L8003a900
L8003a6b0:
  sb $v0, 51($s3)
L8003a6b4:
  ori $v0, $v0, 0x73f0
L8003a6b8:
  addiu $a0, $a0, -1
L8003a6bc:
  bgez $a0, L8003a5b8
L8003a6c0:
  addu $s2, $s2, $v0
L8003a6c4:
  lui $v0, 0x200
L8003a6c8:
  ori $v0, $v0, 0x30
L8003a6cc:
  lui $v1, 0x800a
L8003a6d0:
  lw $v1, -20236($v1)
L8003a6d4:
  lui $a0, 0x800a
L8003a6d8:
  lw $a0, -20172($a0)
L8003a6dc:
  and $v1, $v1, $v0
L8003a6e0:
  or $v1, $v1, $a0
L8003a6e4:
  beq $v1, $zero, L8003a700
L8003a6e8:
  addu $a0, $zero, $zero
L8003a6ec:
  lbu $v0, 51($s3)
L8003a6f0:
  sll $zero, $zero, 0x0
L8003a6f4:
  andi $v0, $v0, 0x7f
L8003a6f8:
  j L8003a900
L8003a6fc:
  sb $v0, 51($s3)
L8003a700:
  addu $a1, $a0, $zero
L8003a704:
  sll $a2, $a3, 0x1
L8003a708:
  addu $a2, $a2, $a3
L8003a70c:
  sll $a2, $a2, 0x3
L8003a710:
  addu $a2, $a2, $a3
L8003a714:
  sll $a2, $a2, 0x1
L8003a718:
  addiu $a2, $a2, 15182
L8003a71c:
  lui $v0, 0x8004
L8003a720:
  addiu $v0, $v0, -24548
L8003a724:
  addiu $a3, $zero, 50
L8003a728:
  sw $v0, 16($sp)
L8003a72c:
  sw $zero, 20($sp)
L8003a730:
  jal 0x80014eec
L8003a734:
  sw $zero, 24($sp)
L8003a738:
  addu $v1, $v0, $zero
L8003a73c:
  lui $v0, 0x801b
L8003a740:
  addiu $v0, $v0, -4096
L8003a744:
  sw $v0, 56($v1)
L8003a748:
  lbu $v0, 60($s3)
L8003a74c:
  sll $zero, $zero, 0x0
L8003a750:
  sw $v0, 60($v1)
L8003a754:
  lbu $v0, 60($s3)
L8003a758:
  sll $zero, $zero, 0x0
L8003a75c:
  beq $v0, $zero, L8003a76c
L8003a760:
  lui $v0, 0x801b
L8003a764:
  addiu $v0, $v0, -2048
L8003a768:
  sw $v0, 56($v1)
L8003a76c:
  lw $v0, 44($v1)
L8003a770:
  sll $zero, $zero, 0x0
L8003a774:
  ori $v0, $v0, 0x10
L8003a778:
  lui $at, 0x800a
L8003a77c:
  sw $v0, -20236($at)
L8003a780:
  j L8003a900
L8003a784:
  sll $zero, $zero, 0x0
L8003a788:
  lbu $a1, 51($s3)
L8003a78c:
  sll $zero, $zero, 0x0
L8003a790:
  andi $v0, $a1, 0x40
L8003a794:
  bne $v0, $zero, L8003a8e4
L8003a798:
  addu $a0, $s3, $zero
L8003a79c:
  lui $v0, 0x200
L8003a7a0:
  ori $v0, $v0, 0x30
L8003a7a4:
  lui $v1, 0x800a
L8003a7a8:
  lw $v1, -20236($v1)
L8003a7ac:
  lui $a0, 0x800a
L8003a7b0:
  lw $a0, -20172($a0)
L8003a7b4:
  and $v1, $v1, $v0
L8003a7b8:
  or $v1, $v1, $a0
L8003a7bc:
  bne $v1, $zero, L8003a900
L8003a7c0:
  ori $v0, $a1, 0x40
L8003a7c4:
  lui $v1, 0x8016
L8003a7c8:
  addiu $v1, $v1, -15344
L8003a7cc:
  sb $v0, 51($s3)
L8003a7d0:
  lb $v0, 1054($gp)
L8003a7d4:
  lbu $a0, 48($s3)
L8003a7d8:
  addu $v0, $v0, $v1
L8003a7dc:
  sb $a0, 0($v0)
L8003a7e0:
  jal 0x80082324
L8003a7e4:
  addiu $a0, $zero, 10
L8003a7e8:
  bne $v0, $zero, L8003a7e0
L8003a7ec:
  lui $s0, 0x1
L8003a7f0:
  ori $s0, $s0, 0x8000
L8003a7f4:
  lui $a0, 0x1
L8003a7f8:
  ori $a0, $a0, 0x8c00
L8003a7fc:
  lb $a1, 1054($gp)
L8003a800:
  addiu $s1, $zero, 256
L8003a804:
  sll $v0, $a1, 0x1
L8003a808:
  addu $v0, $v0, $a1
L8003a80c:
  sll $v1, $v0, 0x5
L8003a810:
  addu $v0, $v0, $v1
L8003a814:
  sll $v0, $v0, 0x6
L8003a818:
  addu $v0, $v0, $a1
L8003a81c:
  lui $v1, 0x8001
L8003a820:
  lw $v1, 0($v1)
L8003a824:
  sll $v0, $v0, 0x4
L8003a828:
  addu $s2, $v1, $v0
L8003a82c:
  addu $a0, $s2, $a0
L8003a830:
  addu $a1, $s2, $zero
L8003a834:
  lbu $v0, 60($s3)
L8003a838:
  addu $s0, $s2, $s0
L8003a83c:
  sh $s1, 3074($s0)
L8003a840:
  sh $s1, 3078($s0)
L8003a844:
  sll $v1, $v0, 0x1
L8003a848:
  addu $v1, $v1, $v0
L8003a84c:
  sll $v1, $v1, 0x6
L8003a850:
  addiu $v0, $zero, 832
L8003a854:
  subu $v0, $v0, $v1
L8003a858:
  sh $v0, 3072($s0)
L8003a85c:
  addiu $v0, $zero, 192
L8003a860:
  jal 0x8007f9d8
L8003a864:
  sh $v0, 3076($s0)
L8003a868:
  lui $a0, 0x1
L8003a86c:
  ori $a0, $a0, 0x8c08
L8003a870:
  addu $a0, $s2, $a0
L8003a874:
  addiu $v0, $zero, 512
L8003a878:
  addu $a1, $s0, $zero
L8003a87c:
  sh $v0, 3080($s0)
L8003a880:
  lbu $v1, 60($s3)
L8003a884:
  addiu $v0, $zero, 2
L8003a888:
  sh $s1, 3084($a1)
L8003a88c:
  sh $v0, 3086($a1)
L8003a890:
  sll $v1, $v1, 0x1
L8003a894:
  addiu $v1, $v1, 240
L8003a898:
  jal 0x8007f9d8
L8003a89c:
  sh $v1, 3082($a1)
L8003a8a0:
  lbu $v0, 60($s3)
L8003a8a4:
  sll $zero, $zero, 0x0
L8003a8a8:
  beq $v0, $zero, L8003a8c4
L8003a8ac:
  lui $a0, 0x1
L8003a8b0:
  ori $a0, $a0, 0x8400
L8003a8b4:
  addu $a0, $s2, $a0
L8003a8b8:
  lui $a1, 0x801b
L8003a8bc:
  j L8003a8d4
L8003a8c0:
  addiu $a1, $a1, -2048
L8003a8c4:
  ori $a0, $a0, 0x8400
L8003a8c8:
  addu $a0, $s2, $a0
L8003a8cc:
  lui $a1, 0x801b
L8003a8d0:
  addiu $a1, $a1, -4096
L8003a8d4:
  jal L800356a0
L8003a8d8:
  addiu $a2, $zero, 2048
L8003a8dc:
  j L8003a900
L8003a8e0:
  sll $zero, $zero, 0x0
L8003a8e4:
  lbu $a2, 49($s3)
L8003a8e8:
  jal L8003a1ec
L8003a8ec:
  addu $a1, $s3, $zero
L8003a8f0:
  lbu $v0, 50($s3)
L8003a8f4:
  sb $zero, 51($s3)
L8003a8f8:
  ori $v0, $v0, 0x40
L8003a8fc:
  sb $v0, 50($s3)
L8003a900:
  lw $ra, 52($sp)
L8003a904:
  lw $s4, 48($sp)
L8003a908:
  lw $s3, 44($sp)
L8003a90c:
  lw $s2, 40($sp)
L8003a910:
  lw $s1, 36($sp)
L8003a914:
  lw $s0, 32($sp)
L8003a918:
  jr $ra
L8003a91c:
  addiu $sp, $sp, 56
L8003a920:
  addiu $v1, $zero, 2
L8003a924:
  addiu $a0, $a0, 8
L8003a928:
  lw $v0, 0($a0)
L8003a92c:
  sll $zero, $zero, 0x0
L8003a930:
  beq $v0, $zero, L8003a948
L8003a934:
  sll $zero, $zero, 0x0
L8003a938:
  sh $a1, 48($v0)
L8003a93c:
  lw $v0, 0($a0)
L8003a940:
  sll $zero, $zero, 0x0
L8003a944:
  sh $a2, 50($v0)
L8003a948:
  addiu $v1, $v1, -1
L8003a94c:
  bgez $v1, L8003a928
L8003a950:
  addiu $a0, $a0, -4
L8003a954:
  jr $ra
L8003a958:
  sll $zero, $zero, 0x0
L8003a95c:
  addiu $sp, $sp, -24
L8003a960:
  sw $ra, 16($sp)
L8003a964:
  sh $a1, 52($a0)
L8003a968:
  sll $a1, $a1, 0x10
L8003a96c:
  sh $a2, 54($a0)
L8003a970:
  sll $a2, $a2, 0x10
L8003a974:
  sra $a1, $a1, 0x10
L8003a978:
  jal L8003a920
L8003a97c:
  sra $a2, $a2, 0x10
L8003a980:
  lw $ra, 16($sp)
L8003a984:
  sll $zero, $zero, 0x0
L8003a988:
  jr $ra
L8003a98c:
  addiu $sp, $sp, 24
L8003a990:
  addiu $sp, $sp, -24
L8003a994:
  sw $s0, 16($sp)
L8003a998:
  sw $ra, 20($sp)
L8003a99c:
  jal L80039f1c
L8003a9a0:
  addu $s0, $a0, $zero
L8003a9a4:
  bne $v0, $zero, L8003aa14
L8003a9a8:
  addiu $v0, $zero, 1024
L8003a9ac:
  lh $v1, 68($s0)
L8003a9b0:
  sll $zero, $zero, 0x0
L8003a9b4:
  .word 0x0043001a
L8003a9b8:
  bne $v1, $zero, L8003a9c4
L8003a9bc:
  sll $zero, $zero, 0x0
L8003a9c0:
  .word 0x0007000d
L8003a9c4:
  addiu $at, $zero, -1
L8003a9c8:
  bne $v1, $at, L8003a9dc
L8003a9cc:
  lui $at, 0x8000
L8003a9d0:
  bne $v0, $at, L8003a9dc
L8003a9d4:
  sll $zero, $zero, 0x0
L8003a9d8:
  .word 0x0006000d
L8003a9dc:
  mflo $v0
L8003a9e0:
  addiu $v1, $zero, 1024
L8003a9e4:
  sh $v1, 72($s0)
L8003a9e8:
  bltz $v0, L8003a9f4
L8003a9ec:
  sh $v0, 74($s0)
L8003a9f0:
  sh $zero, 72($s0)
L8003a9f4:
  lhu $v0, 64($s0)
L8003a9f8:
  lhu $a0, 52($s0)
L8003a9fc:
  lhu $v1, 66($s0)
L8003aa00:
  lhu $a1, 54($s0)
L8003aa04:
  subu $v0, $v0, $a0
L8003aa08:
  subu $v1, $v1, $a1
L8003aa0c:
  sh $v0, 68($s0)
L8003aa10:
  sh $v1, 70($s0)
L8003aa14:
  lhu $v1, 72($s0)
L8003aa18:
  lhu $v0, 74($s0)
L8003aa1c:
  sll $zero, $zero, 0x0
L8003aa20:
  addu $v1, $v1, $v0
L8003aa24:
  addiu $v0, $v1, -1
L8003aa28:
  andi $v0, $v0, 0xffff
L8003aa2c:
  sltiu $v0, $v0, 1023
L8003aa30:
  bne $v0, $zero, L8003aa50
L8003aa34:
  sh $v1, 72($s0)
L8003aa38:
  lh $a1, 64($s0)
L8003aa3c:
  lh $a2, 66($s0)
L8003aa40:
  jal L8003a95c
L8003aa44:
  addu $a0, $s0, $zero
L8003aa48:
  j L8003aad4
L8003aa4c:
  sb $zero, 51($s0)
L8003aa50:
  sll $a0, $v1, 0x10
L8003aa54:
  jal 0x80086770
L8003aa58:
  sra $a0, $a0, 0x10
L8003aa5c:
  lh $a2, 68($s0)
L8003aa60:
  sll $zero, $zero, 0x0
L8003aa64:
  mult $v0, $a2
L8003aa68:
  mflo $v1
L8003aa6c:
  bgez $v1, L8003aa78
L8003aa70:
  sll $zero, $zero, 0x0
L8003aa74:
  addiu $v1, $v1, 4095
L8003aa78:
  lh $a1, 70($s0)
L8003aa7c:
  sll $zero, $zero, 0x0
L8003aa80:
  mult $v0, $a1
L8003aa84:
  mflo $a0
L8003aa88:
  bgez $a0, L8003aa94
L8003aa8c:
  sra $v1, $v1, 0xc
L8003aa90:
  addiu $a0, $a0, 4095
L8003aa94:
  lh $v0, 74($s0)
L8003aa98:
  sll $zero, $zero, 0x0
L8003aa9c:
  bgez $v0, L8003aaac
L8003aaa0:
  sra $a3, $a0, 0xc
L8003aaa4:
  subu $v1, $a2, $v1
L8003aaa8:
  subu $a3, $a1, $a3
L8003aaac:
  addu $a0, $s0, $zero
L8003aab0:
  lhu $a1, 64($s0)
L8003aab4:
  lhu $a2, 66($a0)
L8003aab8:
  subu $a1, $a1, $v1
L8003aabc:
  sll $a1, $a1, 0x10
L8003aac0:
  sra $a1, $a1, 0x10
L8003aac4:
  subu $a2, $a2, $a3
L8003aac8:
  sll $a2, $a2, 0x10
L8003aacc:
  jal L8003a95c
L8003aad0:
  sra $a2, $a2, 0x10
L8003aad4:
  lw $ra, 20($sp)
L8003aad8:
  lw $s0, 16($sp)
L8003aadc:
  jr $ra
L8003aae0:
  addiu $sp, $sp, 24
L8003aae4:
  addiu $sp, $sp, -40
L8003aae8:
  sw $s3, 28($sp)
L8003aaec:
  addu $s3, $a0, $zero
L8003aaf0:
  sw $ra, 32($sp)
L8003aaf4:
  sw $s2, 24($sp)
L8003aaf8:
  sw $s1, 20($sp)
L8003aafc:
  jal L80039f1c
L8003ab00:
  sw $s0, 16($sp)
L8003ab04:
  bne $v0, $zero, L8003ab80
L8003ab08:
  addiu $v0, $zero, 104
L8003ab0c:
  sh $v0, 52($s3)
L8003ab10:
  lbu $v0, 50($s3)
L8003ab14:
  lbu $v1, 60($s3)
L8003ab18:
  ori $v0, $v0, 0x10
L8003ab1c:
  beq $v1, $zero, L8003ab2c
L8003ab20:
  sb $v0, 50($s3)
L8003ab24:
  addiu $v0, $zero, 216
L8003ab28:
  sh $v0, 52($s3)
L8003ab2c:
  lh $a1, 52($s3)
L8003ab30:
  lh $a2, 54($s3)
L8003ab34:
  jal L8003a920
L8003ab38:
  addu $a0, $s3, $zero
L8003ab3c:
  addu $a0, $s3, $zero
L8003ab40:
  lw $v0, 0($s3)
L8003ab44:
  lui $a1, 0x5000
L8003ab48:
  lb $s2, 22($v0)
L8003ab4c:
  lbu $s1, 103($v0)
L8003ab50:
  jal L8003a440
L8003ab54:
  addu $a2, $s2, $zero
L8003ab58:
  addu $a0, $s3, $zero
L8003ab5c:
  addiu $s0, $s3, 12
L8003ab60:
  addu $a1, $s0, $zero
L8003ab64:
  jal L8003a1ec
L8003ab68:
  addu $a2, $s1, $zero
L8003ab6c:
  addu $a0, $s0, $zero
L8003ab70:
  lui $a1, 0x6000
L8003ab74:
  jal L8003a440
L8003ab78:
  addiu $a2, $s2, -1
L8003ab7c:
  sh $zero, 64($s3)
L8003ab80:
  lui $v0, 0x800a
L8003ab84:
  lw $v0, -20264($v0)
L8003ab88:
  lhu $v1, 64($s3)
L8003ab8c:
  sll $v0, $v0, 0x3
L8003ab90:
  addu $v1, $v1, $v0
L8003ab94:
  sh $v1, 64($s3)
L8003ab98:
  sll $v1, $v1, 0x10
L8003ab9c:
  sra $v1, $v1, 0x10
L8003aba0:
  slti $v0, $v1, 128
L8003aba4:
  bne $v0, $zero, L8003abe0
L8003aba8:
  sll $v0, $v1, 0x8
L8003abac:
  lw $v0, 0($s3)
L8003abb0:
  addu $a0, $s3, $zero
L8003abb4:
  sb $zero, 51($s3)
L8003abb8:
  lb $a2, 22($v0)
L8003abbc:
  jal L8003a440
L8003abc0:
  addu $a1, $zero, $zero
L8003abc4:
  jal L80039f90
L8003abc8:
  addiu $a0, $s3, 12
L8003abcc:
  lbu $v0, 50($s3)
L8003abd0:
  sll $zero, $zero, 0x0
L8003abd4:
  andi $v0, $v0, 0xef
L8003abd8:
  j L8003ac2c
L8003abdc:
  sb $v0, 50($s3)
L8003abe0:
  addu $a0, $v1, $zero
L8003abe4:
  sll $v1, $a0, 0x10
L8003abe8:
  or $v0, $v0, $v1
L8003abec:
  or $a0, $a0, $v0
L8003abf0:
  addiu $a1, $zero, 2
L8003abf4:
  addiu $v0, $s3, 8
L8003abf8:
  lw $v1, 0($v0)
L8003abfc:
  sll $zero, $zero, 0x0
L8003ac00:
  beq $v1, $zero, L8003ac0c
L8003ac04:
  sll $zero, $zero, 0x0
L8003ac08:
  sw $a0, 12($v1)
L8003ac0c:
  lw $v1, 12($v0)
L8003ac10:
  sll $zero, $zero, 0x0
L8003ac14:
  beq $v1, $zero, L8003ac20
L8003ac18:
  sll $zero, $zero, 0x0
L8003ac1c:
  sw $a0, 12($v1)
L8003ac20:
  addiu $a1, $a1, -1
L8003ac24:
  bgez $a1, L8003abf8
L8003ac28:
  addiu $v0, $v0, -4
L8003ac2c:
  lw $ra, 32($sp)
L8003ac30:
  lw $s3, 28($sp)
L8003ac34:
  lw $s2, 24($sp)
L8003ac38:
  lw $s1, 20($sp)
L8003ac3c:
  lw $s0, 16($sp)
L8003ac40:
  jr $ra
L8003ac44:
  addiu $sp, $sp, 40
L8003ac48:
  addiu $sp, $sp, -40
L8003ac4c:
  sw $s3, 28($sp)
L8003ac50:
  addu $s3, $a0, $zero
L8003ac54:
  sw $ra, 32($sp)
L8003ac58:
  sw $s2, 24($sp)
L8003ac5c:
  sw $s1, 20($sp)
L8003ac60:
  jal L80039f1c
L8003ac64:
  sw $s0, 16($sp)
L8003ac68:
  bne $v0, $zero, L8003acc0
L8003ac6c:
  addu $a0, $s3, $zero
L8003ac70:
  lui $a1, 0x5000
L8003ac74:
  lbu $v0, 50($s3)
L8003ac78:
  lw $v1, 0($s3)
L8003ac7c:
  ori $v0, $v0, 0x10
L8003ac80:
  sb $v0, 50($s3)
L8003ac84:
  lb $s2, 22($v1)
L8003ac88:
  lbu $s1, 103($v1)
L8003ac8c:
  jal L8003a440
L8003ac90:
  addu $a2, $s2, $zero
L8003ac94:
  addu $a0, $s3, $zero
L8003ac98:
  addiu $s0, $s3, 12
L8003ac9c:
  addu $a1, $s0, $zero
L8003aca0:
  jal L8003a1ec
L8003aca4:
  addu $a2, $s1, $zero
L8003aca8:
  addu $a0, $s0, $zero
L8003acac:
  lui $a1, 0x6000
L8003acb0:
  jal L8003a440
L8003acb4:
  addiu $a2, $s2, -1
L8003acb8:
  addiu $v0, $zero, 128
L8003acbc:
  sh $v0, 64($s3)
L8003acc0:
  lui $v1, 0x800a
L8003acc4:
  lw $v1, -20264($v1)
L8003acc8:
  lhu $v0, 64($s3)
L8003accc:
  sll $v1, $v1, 0x3
L8003acd0:
  subu $v0, $v0, $v1
L8003acd4:
  sh $v0, 64($s3)
L8003acd8:
  sll $v0, $v0, 0x10
L8003acdc:
  sra $v0, $v0, 0x10
L8003ace0:
  bgtz $v0, L8003ad04
L8003ace4:
  addu $a0, $v0, $zero
L8003ace8:
  sb $zero, 51($s3)
L8003acec:
  jal L80039f90
L8003acf0:
  addiu $a0, $s3, 12
L8003acf4:
  jal L80039fd4
L8003acf8:
  addu $a0, $s3, $zero
L8003acfc:
  j L8003ad50
L8003ad00:
  sll $zero, $zero, 0x0
L8003ad04:
  sll $v0, $a0, 0x8
L8003ad08:
  sll $v1, $a0, 0x10
L8003ad0c:
  or $v0, $v0, $v1
L8003ad10:
  or $a0, $a0, $v0
L8003ad14:
  addiu $a1, $zero, 2
L8003ad18:
  addiu $v1, $s3, 8
L8003ad1c:
  lw $v0, 0($v1)
L8003ad20:
  sll $zero, $zero, 0x0
L8003ad24:
  beq $v0, $zero, L8003ad30
L8003ad28:
  sll $zero, $zero, 0x0
L8003ad2c:
  sw $a0, 12($v0)
L8003ad30:
  lw $v0, 12($v1)
L8003ad34:
  sll $zero, $zero, 0x0
L8003ad38:
  beq $v0, $zero, L8003ad44
L8003ad3c:
  sll $zero, $zero, 0x0
L8003ad40:
  sw $a0, 12($v0)
L8003ad44:
  addiu $a1, $a1, -1
L8003ad48:
  bgez $a1, L8003ad1c
L8003ad4c:
  addiu $v1, $v1, -4
L8003ad50:
  lw $ra, 32($sp)
L8003ad54:
  lw $s3, 28($sp)
L8003ad58:
  lw $s2, 24($sp)
L8003ad5c:
  lw $s1, 20($sp)
L8003ad60:
  lw $s0, 16($sp)
L8003ad64:
  jr $ra
L8003ad68:
  addiu $sp, $sp, 40
L8003ad6c:
  addiu $sp, $sp, -48
L8003ad70:
  sw $s4, 40($sp)
L8003ad74:
  addu $s4, $a0, $zero
L8003ad78:
  sw $ra, 44($sp)
L8003ad7c:
  sw $s3, 36($sp)
L8003ad80:
  sw $s2, 32($sp)
L8003ad84:
  sw $s1, 28($sp)
L8003ad88:
  jal L80039f1c
L8003ad8c:
  sw $s0, 24($sp)
L8003ad90:
  bne $v0, $zero, L8003ae50
L8003ad94:
  sll $zero, $zero, 0x0
L8003ad98:
  lbu $v0, 50($s4)
L8003ad9c:
  lw $v1, 0($s4)
L8003ada0:
  ori $v0, $v0, 0x10
L8003ada4:
  sb $v0, 50($s4)
L8003ada8:
  lbu $s3, 103($v1)
L8003adac:
  lb $s1, 22($v1)
L8003adb0:
  jal L80039f90
L8003adb4:
  addu $a0, $s4, $zero
L8003adb8:
  addu $a0, $s4, $zero
L8003adbc:
  lbu $a2, 49($s4)
L8003adc0:
  jal L8003a1ec
L8003adc4:
  addu $a1, $s4, $zero
L8003adc8:
  addu $a0, $s4, $zero
L8003adcc:
  lui $a1, 0x5000
L8003add0:
  jal L8003a440
L8003add4:
  addu $a2, $s1, $zero
L8003add8:
  addu $a0, $s4, $zero
L8003addc:
  addiu $s0, $s4, 12
L8003ade0:
  lbu $a2, 49($s4)
L8003ade4:
  jal L8003a1ec
L8003ade8:
  addu $a1, $s0, $zero
L8003adec:
  addu $a0, $s0, $zero
L8003adf0:
  lui $a1, 0x6000
L8003adf4:
  addiu $s2, $s1, -1
L8003adf8:
  jal L8003a440
L8003adfc:
  addu $a2, $s2, $zero
L8003ae00:
  addu $a0, $s4, $zero
L8003ae04:
  addiu $s0, $s4, 24
L8003ae08:
  addu $a1, $s0, $zero
L8003ae0c:
  jal L8003a1ec
L8003ae10:
  addu $a2, $s3, $zero
L8003ae14:
  addu $a0, $s0, $zero
L8003ae18:
  lui $a1, 0x5000
L8003ae1c:
  jal L8003a440
L8003ae20:
  addu $a2, $s1, $zero
L8003ae24:
  addu $a0, $s4, $zero
L8003ae28:
  addiu $s0, $s4, 36
L8003ae2c:
  addu $a1, $s0, $zero
L8003ae30:
  jal L8003a1ec
L8003ae34:
  addu $a2, $s3, $zero
L8003ae38:
  addu $a0, $s0, $zero
L8003ae3c:
  lui $a1, 0x6000
L8003ae40:
  jal L8003a440
L8003ae44:
  addu $a2, $s2, $zero
L8003ae48:
  addiu $v0, $zero, 128
L8003ae4c:
  sh $v0, 64($s4)
L8003ae50:
  lui $v1, 0x800a
L8003ae54:
  lw $v1, -20264($v1)
L8003ae58:
  lhu $v0, 64($s4)
L8003ae5c:
  sll $v1, $v1, 0x3
L8003ae60:
  subu $v0, $v0, $v1
L8003ae64:
  sh $v0, 64($s4)
L8003ae68:
  sll $v0, $v0, 0x10
L8003ae6c:
  sra $v0, $v0, 0x10
L8003ae70:
  bgtz $v0, L8003aecc
L8003ae74:
  addu $a0, $v0, $zero
L8003ae78:
  lw $v0, 0($s4)
L8003ae7c:
  addu $a0, $s4, $zero
L8003ae80:
  sb $zero, 51($s4)
L8003ae84:
  lb $a2, 22($v0)
L8003ae88:
  jal L8003a440
L8003ae8c:
  addu $a1, $zero, $zero
L8003ae90:
  lh $a1, 52($s4)
L8003ae94:
  lh $a2, 54($s4)
L8003ae98:
  jal L8003a920
L8003ae9c:
  addu $a0, $s4, $zero
L8003aea0:
  jal L80039f90
L8003aea4:
  addiu $a0, $s4, 12
L8003aea8:
  jal L80039f90
L8003aeac:
  addiu $a0, $s4, 24
L8003aeb0:
  jal L80039f90
L8003aeb4:
  addiu $a0, $s4, 36
L8003aeb8:
  lbu $v0, 50($s4)
L8003aebc:
  sll $zero, $zero, 0x0
L8003aec0:
  andi $v0, $v0, 0xef
L8003aec4:
  j L8003b034
L8003aec8:
  sb $v0, 50($s4)
L8003aecc:
  sll $v0, $a0, 0x8
L8003aed0:
  sll $v1, $a0, 0x10
L8003aed4:
  or $v0, $v0, $v1
L8003aed8:
  or $a0, $a0, $v0
L8003aedc:
  addiu $a2, $zero, 2
L8003aee0:
  addiu $v1, $s4, 8
L8003aee4:
  lw $v0, 24($v1)
L8003aee8:
  sll $zero, $zero, 0x0
L8003aeec:
  beq $v0, $zero, L8003aef8
L8003aef0:
  sll $zero, $zero, 0x0
L8003aef4:
  sw $a0, 12($v0)
L8003aef8:
  lw $v0, 36($v1)
L8003aefc:
  sll $zero, $zero, 0x0
L8003af00:
  beq $v0, $zero, L8003af0c
L8003af04:
  sll $zero, $zero, 0x0
L8003af08:
  sw $a0, 12($v0)
L8003af0c:
  addiu $a2, $a2, -1
L8003af10:
  bgez $a2, L8003aee4
L8003af14:
  addiu $v1, $v1, -4
L8003af18:
  addiu $a2, $zero, 2
L8003af1c:
  addiu $a1, $s4, 8
L8003af20:
  lh $v1, 64($s4)
L8003af24:
  addiu $v0, $zero, 128
L8003af28:
  subu $a0, $v0, $v1
L8003af2c:
  sll $v0, $a0, 0x8
L8003af30:
  sll $v1, $a0, 0x10
L8003af34:
  or $v0, $v0, $v1
L8003af38:
  or $a0, $a0, $v0
L8003af3c:
  lw $v0, 0($a1)
L8003af40:
  sll $zero, $zero, 0x0
L8003af44:
  beq $v0, $zero, L8003af50
L8003af48:
  sll $zero, $zero, 0x0
L8003af4c:
  sw $a0, 12($v0)
L8003af50:
  lw $v0, 12($a1)
L8003af54:
  sll $zero, $zero, 0x0
L8003af58:
  beq $v0, $zero, L8003af64
L8003af5c:
  sll $zero, $zero, 0x0
L8003af60:
  sw $a0, 12($v0)
L8003af64:
  addiu $a2, $a2, -1
L8003af68:
  bgez $a2, L8003af3c
L8003af6c:
  addiu $a1, $a1, -4
L8003af70:
  lh $v0, 64($s4)
L8003af74:
  sll $zero, $zero, 0x0
L8003af78:
  bgez $v0, L8003af88
L8003af7c:
  sra $a0, $v0, 0x3
L8003af80:
  addiu $v0, $v0, 7
L8003af84:
  sra $a0, $v0, 0x3
L8003af88:
  sw $a0, 16($sp)
L8003af8c:
  lh $v1, 64($s4)
L8003af90:
  addiu $v0, $zero, 128
L8003af94:
  subu $v0, $v0, $v1
L8003af98:
  bgez $v0, L8003afa8
L8003af9c:
  sra $v1, $v0, 0x3
L8003afa0:
  addiu $v0, $v0, 7
L8003afa4:
  sra $v1, $v0, 0x3
L8003afa8:
  subu $v0, $zero, $v1
L8003afac:
  sw $v0, 20($sp)
L8003afb0:
  lbu $v0, 60($s4)
L8003afb4:
  sll $zero, $zero, 0x0
L8003afb8:
  bne $v0, $zero, L8003afc8
L8003afbc:
  subu $v0, $zero, $a0
L8003afc0:
  sw $v0, 16($sp)
L8003afc4:
  sw $v1, 20($sp)
L8003afc8:
  addu $a0, $s4, $zero
L8003afcc:
  lh $v1, 52($s4)
L8003afd0:
  lw $v0, 16($sp)
L8003afd4:
  lh $s1, 54($s4)
L8003afd8:
  addu $v1, $v1, $v0
L8003afdc:
  sll $s0, $v1, 0x10
L8003afe0:
  sra $s0, $s0, 0x10
L8003afe4:
  addu $a1, $s0, $zero
L8003afe8:
  jal L8003a920
L8003afec:
  addu $a2, $s1, $zero
L8003aff0:
  addiu $a0, $s4, 12
L8003aff4:
  addu $a1, $s0, $zero
L8003aff8:
  jal L8003a920
L8003affc:
  addu $a2, $s1, $zero
L8003b000:
  addiu $a0, $s4, 24
L8003b004:
  lh $v1, 52($s4)
L8003b008:
  lw $v0, 20($sp)
L8003b00c:
  addu $a2, $s1, $zero
L8003b010:
  subu $v1, $v1, $v0
L8003b014:
  sll $s0, $v1, 0x10
L8003b018:
  sra $s0, $s0, 0x10
L8003b01c:
  jal L8003a920
L8003b020:
  addu $a1, $s0, $zero
L8003b024:
  addiu $a0, $s4, 36
L8003b028:
  addu $a1, $s0, $zero
L8003b02c:
  jal L8003a920
L8003b030:
  addu $a2, $s1, $zero
L8003b034:
  lw $ra, 44($sp)
L8003b038:
  lw $s4, 40($sp)
L8003b03c:
  lw $s3, 36($sp)
L8003b040:
  lw $s2, 32($sp)
L8003b044:
  lw $s1, 28($sp)
L8003b048:
  lw $s0, 24($sp)
L8003b04c:
  jr $ra
L8003b050:
  addiu $sp, $sp, 48
L8003b054:
  addiu $sp, $sp, -64
L8003b058:
  sw $s3, 52($sp)
L8003b05c:
  addu $s3, $a0, $zero
L8003b060:
  sw $ra, 56($sp)
L8003b064:
  sw $s2, 48($sp)
L8003b068:
  sw $s1, 44($sp)
L8003b06c:
  jal L80039f1c
L8003b070:
  sw $s0, 40($sp)
L8003b074:
  bne $v0, $zero, L8003b258
L8003b078:
  sll $zero, $zero, 0x0
L8003b07c:
  lh $v0, 64($s3)
L8003b080:
  sll $zero, $zero, 0x0
L8003b084:
  beq $v0, $zero, L8003b098
L8003b088:
  sll $zero, $zero, 0x0
L8003b08c:
  lw $s1, 0($s3)
L8003b090:
  j L8003b1a8
L8003b094:
  sh $zero, 96($s1)
L8003b098:
  lb $s2, 48($s3)
L8003b09c:
  jal 0x8004002c
L8003b0a0:
  addiu $s0, $s2, -65
L8003b0a4:
  addu $a0, $v0, $zero
L8003b0a8:
  jal 0x800400ac
L8003b0ac:
  addiu $a1, $zero, 1
L8003b0b0:
  addu $s1, $v0, $zero
L8003b0b4:
  addu $a0, $s1, $zero
L8003b0b8:
  addiu $a3, $zero, 48
L8003b0bc:
  lh $a1, 52($s3)
L8003b0c0:
  lh $a2, 54($s3)
L8003b0c4:
  addu $v0, $a3, $zero
L8003b0c8:
  sw $v0, 16($sp)
L8003b0cc:
  addiu $v0, $zero, 14
L8003b0d0:
  sw $v0, 28($sp)
L8003b0d4:
  addiu $v0, $zero, 896
L8003b0d8:
  sw $v0, 32($sp)
L8003b0dc:
  addiu $v0, $zero, 240
L8003b0e0:
  sw $zero, 20($sp)
L8003b0e4:
  sw $zero, 24($sp)
L8003b0e8:
  jal 0x80040510
L8003b0ec:
  sw $v0, 36($sp)
L8003b0f0:
  lui $v0, 0x6666
L8003b0f4:
  ori $v0, $v0, 0x6667
L8003b0f8:
  mult $s0, $v0
L8003b0fc:
  addu $a1, $s0, $zero
L8003b100:
  sra $v0, $s0, 0x4
L8003b104:
  lhu $v1, 64($s1)
L8003b108:
  sll $v0, $v0, 0x6
L8003b10c:
  addu $v1, $v1, $v0
L8003b110:
  sra $v0, $s0, 0x1f
L8003b114:
  sh $v1, 64($s1)
L8003b118:
  mfhi $t0
L8003b11c:
  sra $a0, $t0, 0x1
L8003b120:
  subu $a0, $a0, $v0
L8003b124:
  sll $v1, $a0, 0x2
L8003b128:
  addu $v1, $v1, $a0
L8003b12c:
  subu $v1, $s0, $v1
L8003b130:
  sll $v0, $v1, 0x1
L8003b134:
  addu $v0, $v0, $v1
L8003b138:
  sll $v0, $v0, 0x4
L8003b13c:
  sb $v0, 92($s1)
L8003b140:
  sll $v0, $a0, 0x1
L8003b144:
  addu $v0, $v0, $a0
L8003b148:
  sll $v0, $v0, 0x4
L8003b14c:
  bgez $s0, L8003b158
L8003b150:
  sb $v0, 93($s1)
L8003b154:
  addiu $a1, $s2, -50
L8003b158:
  sra $v0, $a1, 0x4
L8003b15c:
  sll $v0, $v0, 0x4
L8003b160:
  lhu $v1, 66($s1)
L8003b164:
  subu $v0, $s0, $v0
L8003b168:
  addu $v1, $v1, $v0
L8003b16c:
  lw $v0, 4($s1)
L8003b170:
  addu $a0, $s1, $zero
L8003b174:
  sh $zero, 70($s1)
L8003b178:
  sw $zero, 12($s1)
L8003b17c:
  sh $v1, 66($s1)
L8003b180:
  lui $v1, 0x5100
L8003b184:
  or $v0, $v0, $v1
L8003b188:
  jal 0x80042918
L8003b18c:
  sw $v0, 4($s1)
L8003b190:
  addu $a0, $s1, $zero
L8003b194:
  jal 0x800428ec
L8003b198:
  addiu $a1, $zero, -8
L8003b19c:
  addiu $v0, $zero, 20
L8003b1a0:
  sw $s1, 0($s3)
L8003b1a4:
  sh $v0, 96($s1)
L8003b1a8:
  lui $s0, 0xf7ff
L8003b1ac:
  ori $s0, $s0, 0xffff
L8003b1b0:
  lw $v0, 4($s1)
L8003b1b4:
  lui $v1, 0x5000
L8003b1b8:
  sh $zero, 74($s1)
L8003b1bc:
  or $v0, $v0, $v1
L8003b1c0:
  and $v0, $v0, $s0
L8003b1c4:
  jal 0x8004002c
L8003b1c8:
  sw $v0, 4($s1)
L8003b1cc:
  addu $a0, $v0, $zero
L8003b1d0:
  jal 0x800400ac
L8003b1d4:
  addiu $a1, $zero, 1
L8003b1d8:
  addu $s2, $v0, $zero
L8003b1dc:
  addiu $a3, $zero, 48
L8003b1e0:
  lh $a1, 48($s1)
L8003b1e4:
  lh $a2, 50($s1)
L8003b1e8:
  addu $v0, $a3, $zero
L8003b1ec:
  sw $v0, 16($sp)
L8003b1f0:
  lbu $v0, 92($s1)
L8003b1f4:
  addu $a0, $s2, $zero
L8003b1f8:
  sw $v0, 20($sp)
L8003b1fc:
  lbu $v1, 93($s1)
L8003b200:
  addiu $v0, $zero, 14
L8003b204:
  sw $v0, 28($sp)
L8003b208:
  addiu $v0, $zero, 512
L8003b20c:
  sw $v0, 32($sp)
L8003b210:
  addiu $v0, $zero, 253
L8003b214:
  sw $v0, 36($sp)
L8003b218:
  jal 0x80040510
L8003b21c:
  sw $v1, 24($sp)
L8003b220:
  lw $v0, 4($s2)
L8003b224:
  lui $v1, 0x6100
L8003b228:
  or $v0, $v0, $v1
L8003b22c:
  and $v0, $v0, $s0
L8003b230:
  sw $v0, 4($s2)
L8003b234:
  lhu $v0, 70($s1)
L8003b238:
  addu $a0, $s2, $zero
L8003b23c:
  sh $zero, 74($s2)
L8003b240:
  jal 0x80042918
L8003b244:
  sh $v0, 70($s2)
L8003b248:
  addu $a0, $s2, $zero
L8003b24c:
  jal 0x800428ec
L8003b250:
  addiu $a1, $zero, -9
L8003b254:
  sw $s2, 4($s3)
L8003b258:
  lw $s1, 0($s3)
L8003b25c:
  lh $v0, 64($s3)
L8003b260:
  lw $s2, 4($s3)
L8003b264:
  beq $v0, $zero, L8003b280
L8003b268:
  sll $zero, $zero, 0x0
L8003b26c:
  lhu $v0, 96($s1)
L8003b270:
  lui $v1, 0x800a
L8003b274:
  lhu $v1, -20264($v1)
L8003b278:
  j L8003b294
L8003b27c:
  addu $v0, $v0, $v1
L8003b280:
  lhu $v0, 96($s1)
L8003b284:
  lui $v1, 0x800a
L8003b288:
  lhu $v1, -20264($v1)
L8003b28c:
  sll $zero, $zero, 0x0
L8003b290:
  subu $v0, $v0, $v1
L8003b294:
  sh $v0, 96($s1)
L8003b298:
  lh $a0, 96($s1)
L8003b29c:
  sll $zero, $zero, 0x0
L8003b2a0:
  bgtz $a0, L8003b2e8
L8003b2a4:
  slti $v0, $a0, 20
L8003b2a8:
  lui $a1, 0x8fff
L8003b2ac:
  ori $a1, $a1, 0xffff
L8003b2b0:
  lui $v0, 0x80
L8003b2b4:
  ori $v0, $v0, 0x8080
L8003b2b8:
  addu $a0, $s2, $zero
L8003b2bc:
  sw $v0, 12($s1)
L8003b2c0:
  lw $v0, 4($s1)
L8003b2c4:
  addiu $v1, $zero, 4096
L8003b2c8:
  sh $v1, 70($s1)
L8003b2cc:
  lui $v1, 0x800
L8003b2d0:
  and $v0, $v0, $a1
L8003b2d4:
  or $v0, $v0, $v1
L8003b2d8:
  jal 0x8004036c
L8003b2dc:
  sw $v0, 4($s1)
L8003b2e0:
  j L8003b2f8
L8003b2e4:
  sw $zero, 4($s3)
L8003b2e8:
  bne $v0, $zero, L8003b300
L8003b2ec:
  sll $v1, $a0, 0x1
L8003b2f0:
  jal L80039fd4
L8003b2f4:
  addu $a0, $s3, $zero
L8003b2f8:
  j L8003b35c
L8003b2fc:
  sb $zero, 51($s3)
L8003b300:
  addu $v1, $v1, $a0
L8003b304:
  sll $v1, $v1, 0x1
L8003b308:
  addiu $v0, $zero, -128
L8003b30c:
  subu $v0, $v0, $v1
L8003b310:
  sb $v0, 14($s2)
L8003b314:
  sb $v0, 13($s2)
L8003b318:
  sb $v0, 12($s2)
L8003b31c:
  lh $v1, 96($s1)
L8003b320:
  sb $v0, 14($s1)
L8003b324:
  sb $v0, 13($s1)
L8003b328:
  sb $v0, 12($s1)
L8003b32c:
  sll $v0, $v1, 0x1
L8003b330:
  addu $v0, $v0, $v1
L8003b334:
  sll $v1, $v0, 0x4
L8003b338:
  addu $v0, $v0, $v1
L8003b33c:
  sll $v0, $v0, 0x2
L8003b340:
  addiu $s0, $v0, 4096
L8003b344:
  sh $s0, 70($s2)
L8003b348:
  lbu $v0, 12($s1)
L8003b34c:
  sh $s0, 70($s1)
L8003b350:
  sll $v0, $v0, 0x5
L8003b354:
  sh $v0, 68($s2)
L8003b358:
  sh $v0, 68($s1)
L8003b35c:
  lw $ra, 56($sp)
L8003b360:
  lw $s3, 52($sp)
L8003b364:
  lw $s2, 48($sp)
L8003b368:
  lw $s1, 44($sp)
L8003b36c:
  lw $s0, 40($sp)
L8003b370:
  jr $ra
L8003b374:
  addiu $sp, $sp, 64
L8003b378:
  addiu $sp, $sp, -32
L8003b37c:
  sw $s0, 16($sp)
L8003b380:
  addu $s0, $a0, $zero
L8003b384:
  sw $ra, 24($sp)
L8003b388:
  sw $s1, 20($sp)
L8003b38c:
  lbu $v1, 50($s0)
L8003b390:
  sll $zero, $zero, 0x0
L8003b394:
  andi $v0, $v1, 0x10
L8003b398:
  beq $v0, $zero, L8003b3ac
L8003b39c:
  addu $s1, $a1, $zero
L8003b3a0:
  andi $v0, $v1, 0xfc
L8003b3a4:
  j L8003b4f8
L8003b3a8:
  sb $v0, 50($s0)
L8003b3ac:
  lw $a0, 4($s0)
L8003b3b0:
  sll $zero, $zero, 0x0
L8003b3b4:
  beq $a0, $zero, L8003b434
L8003b3b8:
  andi $v0, $v1, 0x1
L8003b3bc:
  beq $v0, $zero, L8003b400
L8003b3c0:
  sll $zero, $zero, 0x0
L8003b3c4:
  lh $v0, 90($a0)
L8003b3c8:
  sll $zero, $zero, 0x0
L8003b3cc:
  bne $v0, $zero, L8003b434
L8003b3d0:
  sll $zero, $zero, 0x0
L8003b3d4:
  jal 0x8008e590
L8003b3d8:
  sll $zero, $zero, 0x0
L8003b3dc:
  addu $a1, $zero, $zero
L8003b3e0:
  andi $v0, $v0, 0xff
L8003b3e4:
  lw $a0, 4($s0)
L8003b3e8:
  lbu $v1, 50($s0)
L8003b3ec:
  addiu $v0, $v0, 60
L8003b3f0:
  sh $v0, 62($s0)
L8003b3f4:
  andi $v1, $v1, 0xfe
L8003b3f8:
  j L8003b42c
L8003b3fc:
  sb $v1, 50($s0)
L8003b400:
  lhu $v0, 62($s0)
L8003b404:
  sll $zero, $zero, 0x0
L8003b408:
  addiu $v0, $v0, -1
L8003b40c:
  sh $v0, 62($s0)
L8003b410:
  sll $v0, $v0, 0x10
L8003b414:
  bgtz $v0, L8003b434
L8003b418:
  addiu $a1, $zero, 1
L8003b41c:
  lbu $v0, 50($s0)
L8003b420:
  lw $a0, 4($s0)
L8003b424:
  or $v0, $v0, $a1
L8003b428:
  sb $v0, 50($s0)
L8003b42c:
  jal 0x80040410
L8003b430:
  sll $zero, $zero, 0x0
L8003b434:
  lw $v0, 8($s0)
L8003b438:
  sll $zero, $zero, 0x0
L8003b43c:
  beq $v0, $zero, L8003b4f8
L8003b440:
  sll $zero, $zero, 0x0
L8003b444:
  lbu $v1, 50($s0)
L8003b448:
  sll $zero, $zero, 0x0
L8003b44c:
  andi $v0, $v1, 0x2
L8003b450:
  beq $v0, $zero, L8003b49c
L8003b454:
  sll $zero, $zero, 0x0
L8003b458:
  lbu $v0, 59($s0)
L8003b45c:
  lw $v1, 8($s0)
L8003b460:
  addiu $a0, $v0, -1
L8003b464:
  sb $a0, 59($s0)
L8003b468:
  lh $v0, 90($v1)
L8003b46c:
  sll $zero, $zero, 0x0
L8003b470:
  bne $v0, $zero, L8003b4f8
L8003b474:
  sll $v0, $a0, 0x18
L8003b478:
  bgtz $v0, L8003b4f8
L8003b47c:
  sll $zero, $zero, 0x0
L8003b480:
  bgtz $s1, L8003b4ac
L8003b484:
  addu $a1, $s1, $zero
L8003b488:
  lbu $v0, 50($s0)
L8003b48c:
  sb $zero, 59($s0)
L8003b490:
  andi $v0, $v0, 0xfd
L8003b494:
  j L8003b4f8
L8003b498:
  sb $v0, 50($s0)
L8003b49c:
  bltz $s1, L8003b4c8
L8003b4a0:
  ori $v0, $v1, 0x2
L8003b4a4:
  sb $v0, 50($s0)
L8003b4a8:
  addu $a1, $s1, $zero
L8003b4ac:
  lw $a0, 8($s0)
L8003b4b0:
  addiu $v0, $zero, 6
L8003b4b4:
  sb $v0, 59($s0)
L8003b4b8:
  jal 0x80040410
L8003b4bc:
  sb $a1, 58($s0)
L8003b4c0:
  j L8003b4f8
L8003b4c4:
  sll $zero, $zero, 0x0
L8003b4c8:
  lbu $v0, 59($s0)
L8003b4cc:
  sll $zero, $zero, 0x0
L8003b4d0:
  addiu $v0, $v0, 1
L8003b4d4:
  sb $v0, 59($s0)
L8003b4d8:
  sll $v0, $v0, 0x18
L8003b4dc:
  sra $v0, $v0, 0x18
L8003b4e0:
  slti $v0, $v0, 6
L8003b4e4:
  bne $v0, $zero, L8003b4f8
L8003b4e8:
  sll $zero, $zero, 0x0
L8003b4ec:
  lw $a0, 8($s0)
L8003b4f0:
  jal 0x80040424
L8003b4f4:
  addu $a1, $zero, $zero
L8003b4f8:
  lw $ra, 24($sp)
L8003b4fc:
  lw $s1, 20($sp)
L8003b500:
  lw $s0, 16($sp)
L8003b504:
  jr $ra
L8003b508:
  addiu $sp, $sp, 32
L8003b50c:
  addiu $sp, $sp, -40
L8003b510:
  sw $s4, 32($sp)
L8003b514:
  addu $s4, $a0, $zero
L8003b518:
  lui $v0, 0x800f
L8003b51c:
  sw $s1, 20($sp)
L8003b520:
  addiu $s1, $v0, -20464
L8003b524:
  sw $s2, 24($sp)
L8003b528:
  addiu $s2, $zero, 2
L8003b52c:
  lui $v0, 0x8009
L8003b530:
  sw $s3, 28($sp)
L8003b534:
  addiu $s3, $v0, 3944
L8003b538:
  sw $s0, 16($sp)
L8003b53c:
  addiu $s0, $s1, 51
L8003b540:
  sw $ra, 36($sp)
L8003b544:
  lb $v0, -3($s0)
L8003b548:
  sll $zero, $zero, 0x0
L8003b54c:
  bltz $v0, L8003b598
L8003b550:
  sll $zero, $zero, 0x0
L8003b554:
  lbu $v0, -1($s0)
L8003b558:
  sll $zero, $zero, 0x0
L8003b55c:
  andi $v0, $v0, 0x40
L8003b560:
  beq $v0, $zero, L8003b570
L8003b564:
  addu $a0, $s1, $zero
L8003b568:
  jal L8003b378
L8003b56c:
  addu $a1, $s4, $zero
L8003b570:
  lbu $v0, 0($s0)
L8003b574:
  sll $zero, $zero, 0x0
L8003b578:
  beq $v0, $zero, L8003b598
L8003b57c:
  andi $v0, $v0, 0x1f
L8003b580:
  sll $v0, $v0, 0x2
L8003b584:
  addu $v0, $v0, $s3
L8003b588:
  lw $v0, 0($v0)
L8003b58c:
  sll $zero, $zero, 0x0
L8003b590:
  jalr $ra, $v0
L8003b594:
  addu $a0, $s1, $zero
L8003b598:
  addiu $s0, $s0, 76
L8003b59c:
  addiu $s2, $s2, -1
L8003b5a0:
  bgez $s2, L8003b544
L8003b5a4:
  addiu $s1, $s1, 76
L8003b5a8:
  lw $ra, 36($sp)
L8003b5ac:
  lw $s4, 32($sp)
L8003b5b0:
  lw $s3, 28($sp)
L8003b5b4:
  lw $s2, 24($sp)
L8003b5b8:
  lw $s1, 20($sp)
L8003b5bc:
  lw $s0, 16($sp)
L8003b5c0:
  jr $ra
L8003b5c4:
  addiu $sp, $sp, 40
L8003b5c8:
  addiu $sp, $sp, -24
L8003b5cc:
  lui $v0, 0x800f
L8003b5d0:
  addiu $t1, $v0, -20488
L8003b5d4:
  addiu $t0, $zero, 1
L8003b5d8:
  addu $a3, $sp, $zero
L8003b5dc:
  addiu $t4, $sp, 20
L8003b5e0:
  lui $t2, 0x801e
L8003b5e4:
  lw $t3, -28668($t2)
L8003b5e8:
  lui $v0, 0x8001
L8003b5ec:
  addiu $t8, $v0, 816
L8003b5f0:
  lwl $t5, 3($t8)
L8003b5f4:
  lwr $t5, 0($t8)
L8003b5f8:
  lwl $t6, 7($t8)
L8003b5fc:
  lwr $t6, 4($t8)
L8003b600:
  lwl $t7, 11($t8)
L8003b604:
  lwr $t7, 8($t8)
L8003b608:
  swl $t5, 3($sp)
L8003b60c:
  swr $t5, 0($sp)
L8003b610:
  swl $t6, 7($sp)
L8003b614:
  swr $t6, 4($sp)
L8003b618:
  swl $t7, 11($sp)
L8003b61c:
  swr $t7, 8($sp)
L8003b620:
  lwl $t5, 15($t8)
L8003b624:
  lwr $t5, 12($t8)
L8003b628:
  lwl $t6, 19($t8)
L8003b62c:
  lwr $t6, 16($t8)
L8003b630:
  swl $t5, 15($sp)
L8003b634:
  swr $t5, 12($sp)
L8003b638:
  swl $t6, 19($sp)
L8003b63c:
  swr $t6, 16($sp)
L8003b640:
  addiu $a0, $t2, -28668
L8003b644:
  addiu $a1, $zero, 1
L8003b648:
  addu $v0, $sp, $t0
L8003b64c:
  lbu $v1, 0($a3)
L8003b650:
  lbu $v0, 0($v0)
L8003b654:
  sll $v1, $v1, 0x8
L8003b658:
  beq $t3, $zero, L8003b690
L8003b65c:
  or $v1, $v1, $v0
L8003b660:
  addu $a2, $t1, $zero
L8003b664:
  lhu $v0, 0($a0)
L8003b668:
  sll $zero, $zero, 0x0
L8003b66c:
  bne $v1, $v0, L8003b67c
L8003b670:
  sll $zero, $zero, 0x0
L8003b674:
  j L8003b690
L8003b678:
  sh $a1, 0($a2)
L8003b67c:
  addiu $a0, $a0, 4
L8003b680:
  lw $v0, 0($a0)
L8003b684:
  sll $zero, $zero, 0x0
L8003b688:
  bne $v0, $zero, L8003b664
L8003b68c:
  addiu $a1, $a1, 1
L8003b690:
  addiu $t1, $t1, 2
L8003b694:
  addiu $a3, $a3, 2
L8003b698:
  slt $v0, $a3, $t4
L8003b69c:
  bne $v0, $zero, L8003b640
L8003b6a0:
  addiu $t0, $t0, 2
L8003b6a4:
  jr $ra
L8003b6a8:
  addiu $sp, $sp, 24
L8003b6ac:
  lui $v1, 0x8009
L8003b6b0:
  addiu $v1, $v1, 3672
L8003b6b4:
  sll $v0, $a0, 0x1
L8003b6b8:
  addu $v0, $v0, $v1
L8003b6bc:
  addiu $a0, $a0, 1
L8003b6c0:
  sll $a0, $a0, 0x1
L8003b6c4:
  addu $a0, $a0, $v1
L8003b6c8:
  lhu $a2, 0($v0)
L8003b6cc:
  lhu $v0, 0($a0)
L8003b6d0:
  sll $zero, $zero, 0x0
L8003b6d4:
  slt $v0, $a2, $v0
L8003b6d8:
  beq $v0, $zero, L8003b70c
L8003b6dc:
  lui $v1, 0x800f
L8003b6e0:
  addiu $v1, $v1, -19832
L8003b6e4:
  sll $v0, $a2, 0x3
L8003b6e8:
  subu $v0, $v0, $a2
L8003b6ec:
  sll $v0, $v0, 0x2
L8003b6f0:
  addu $v1, $v0, $v1
L8003b6f4:
  sb $a1, 24($v1)
L8003b6f8:
  lhu $v0, 0($a0)
L8003b6fc:
  addiu $a2, $a2, 1
L8003b700:
  slt $v0, $a2, $v0
L8003b704:
  bne $v0, $zero, L8003b6f4
L8003b708:
  addiu $v1, $v1, 28
L8003b70c:
  jr $ra
L8003b710:
  sll $zero, $zero, 0x0
L8003b714:
  addiu $sp, $sp, -24
L8003b718:
  sw $ra, 16($sp)
L8003b71c:
  jal L80035af0
L8003b720:
  addu $a2, $zero, $zero
L8003b724:
  lw $ra, 16($sp)
L8003b728:
  sll $zero, $zero, 0x0
L8003b72c:
  jr $ra
L8003b730:
  addiu $sp, $sp, 24
L8003b734:
  lui $v0, 0x800a
L8003b738:
  lhu $v0, -19560($v0)
L8003b73c:
  jr $ra
L8003b740:
  andi $v0, $v0, 0xc0
L8003b744:
  addu $a2, $a1, $zero
L8003b748:
  ori $v0, $zero, 0xcfff
L8003b74c:
  slt $v0, $v0, $a2
L8003b750:
  beq $v0, $zero, L8003b784
L8003b754:
  lui $v1, 0xffff
L8003b758:
  ori $v1, $v1, 0x3000
L8003b75c:
  lui $v0, 0x801c
L8003b760:
  addiu $v0, $v0, 0
L8003b764:
  lui $a0, 0xffff
L8003b768:
  addu $v1, $a2, $v1
L8003b76c:
  sll $v1, $v1, 0x1
L8003b770:
  addu $v1, $v1, $v0
L8003b774:
  lhu $v1, 0($v1)
L8003b778:
  and $v0, $v0, $a0
L8003b77c:
  jr $ra
L8003b780:
  or $v0, $v0, $v1
L8003b784:
  addiu $v0, $zero, 32767
L8003b788:
  slt $v0, $v0, $a2
L8003b78c:
  beq $v0, $zero, L8003b7a4
L8003b790:
  lui $v0, 0x801d
L8003b794:
  addiu $v0, $v0, 22528
L8003b798:
  lui $a0, 0xffff
L8003b79c:
  j L8003b768
L8003b7a0:
  addiu $v1, $zero, -32768
L8003b7a4:
  slti $v0, $a2, 1280
L8003b7a8:
  bne $v0, $zero, L8003b7b4
L8003b7ac:
  sll $zero, $zero, 0x0
L8003b7b0:
  addiu $a2, $a2, -256
L8003b7b4:
  lui $v0, 0x801b
L8003b7b8:
  addiu $v0, $v0, 0
L8003b7bc:
  lui $a1, 0xffff
L8003b7c0:
  lui $a0, 0x801c
L8003b7c4:
  addiu $a0, $a0, 0
L8003b7c8:
  sll $v1, $a2, 0x1
L8003b7cc:
  addu $v1, $v1, $a0
L8003b7d0:
  lhu $v1, 0($v1)
L8003b7d4:
  and $v0, $v0, $a1
L8003b7d8:
  jr $ra
L8003b7dc:
  or $v0, $v0, $v1
L8003b7e0:
  lb $v0, 88($a0)
L8003b7e4:
  sll $zero, $zero, 0x0
L8003b7e8:
  sll $v0, $v0, 0x2
L8003b7ec:
  addu $a0, $a0, $v0
L8003b7f0:
  lw $v1, 0($a0)
L8003b7f4:
  sll $zero, $zero, 0x0
L8003b7f8:
  lbu $v0, 0($v1)
L8003b7fc:
  addiu $v1, $v1, 1
L8003b800:
  jr $ra
L8003b804:
  sw $v1, 0($a0)
L8003b808:
  addiu $sp, $sp, -24
L8003b80c:
  sw $s0, 16($sp)
L8003b810:
  addu $s0, $a0, $zero
L8003b814:
  sltiu $v0, $a1, 5
L8003b818:
  beq $v0, $zero, L8003b9ac
L8003b81c:
  sw $ra, 20($sp)
L8003b820:
  lui $v0, 0x8001
L8003b824:
  addiu $v0, $v0, 840
L8003b828:
  sll $v1, $a1, 0x2
L8003b82c:
  addu $v1, $v1, $v0
L8003b830:
  lw $v0, 0($v1)
L8003b834:
  sll $zero, $zero, 0x0
L8003b838:
  jr $v0
L8003b83c:
  sll $zero, $zero, 0x0
L8003b840:
  lui $a0, 0xffdd
L8003b844:
  ori $a0, $a0, 0xffff
L8003b848:
  addiu $v0, $zero, 256
L8003b84c:
  sh $v0, 50($s0)
L8003b850:
  lui $v0, 0x800a
L8003b854:
  lw $v0, -20236($v0)
L8003b858:
  addiu $v1, $zero, 64
L8003b85c:
  sh $zero, 48($s0)
L8003b860:
  sh $v1, 4($s0)
L8003b864:
  and $v0, $v0, $a0
L8003b868:
  lui $at, 0x800a
L8003b86c:
  sw $v0, -20236($at)
L8003b870:
  lui $v0, 0x800a
L8003b874:
  lw $v0, -20236($v0)
L8003b878:
  lui $a0, 0x1
L8003b87c:
  sw $a0, 28($s0)
L8003b880:
  or $v0, $v0, $a0
L8003b884:
  lui $at, 0x800a
L8003b888:
  sw $v0, -20236($at)
L8003b88c:
  addiu $v0, $zero, 2
L8003b890:
  sb $v0, 70($s0)
L8003b894:
  lui $v1, 0x800a
L8003b898:
  lw $v1, -20200($v1)
L8003b89c:
  addiu $v0, $zero, 16
L8003b8a0:
  sh $v0, 6($s0)
L8003b8a4:
  sw $v1, 8($s0)
L8003b8a8:
  addiu $v1, $v1, 2048
L8003b8ac:
  j L8003b9ac
L8003b8b0:
  sw $v1, 12($s0)
L8003b8b4:
  lui $a0, 0xffdc
L8003b8b8:
  ori $a0, $a0, 0xffff
L8003b8bc:
  addiu $v0, $zero, 2048
L8003b8c0:
  sw $v0, 28($s0)
L8003b8c4:
  lui $v0, 0x800a
L8003b8c8:
  lw $v0, -20236($v0)
L8003b8cc:
  lui $v1, 0x800a
L8003b8d0:
  lw $v1, -20200($v1)
L8003b8d4:
  j L8003b994
L8003b8d8:
  and $v0, $v0, $a0
L8003b8dc:
  addiu $v0, $zero, 240
L8003b8e0:
  sh $v0, 2($s0)
L8003b8e4:
  addiu $v0, $zero, 256
L8003b8e8:
  sh $v0, 4($s0)
L8003b8ec:
  addiu $v0, $zero, 4
L8003b8f0:
  lui $a1, 0x800a
L8003b8f4:
  lw $a1, -20200($a1)
L8003b8f8:
  addu $a0, $s0, $zero
L8003b8fc:
  sh $zero, 0($s0)
L8003b900:
  jal 0x80081de8
L8003b904:
  sh $v0, 6($s0)
L8003b908:
  lui $a0, 0xffdc
L8003b90c:
  ori $a0, $a0, 0xffff
L8003b910:
  lui $v0, 0x801b
L8003b914:
  addiu $v0, $v0, -4096
L8003b918:
  sw $v0, 12($s0)
L8003b91c:
  sw $v0, 8($s0)
L8003b920:
  lui $v0, 0x800a
L8003b924:
  lw $v0, -20236($v0)
L8003b928:
  addiu $v1, $zero, 2048
L8003b92c:
  sw $v1, 28($s0)
L8003b930:
  and $v0, $v0, $a0
L8003b934:
  lui $at, 0x800a
L8003b938:
  sw $v0, -20236($at)
L8003b93c:
  j L8003b9a8
L8003b940:
  addiu $v0, $zero, 1
L8003b944:
  lui $a0, 0xffdc
L8003b948:
  ori $a0, $a0, 0xffff
L8003b94c:
  lui $v0, 0x1
L8003b950:
  ori $v0, $v0, 0x8000
L8003b954:
  sw $v0, 28($s0)
L8003b958:
  lui $v0, 0x800a
L8003b95c:
  lw $v0, -20236($v0)
L8003b960:
  lui $v1, 0x8001
L8003b964:
  lw $v1, 0($v1)
L8003b968:
  j L8003b994
L8003b96c:
  and $v0, $v0, $a0
L8003b970:
  lui $a0, 0xffdc
L8003b974:
  ori $a0, $a0, 0xffff
L8003b978:
  addiu $v0, $zero, 10240
L8003b97c:
  sw $v0, 28($s0)
L8003b980:
  lui $v0, 0x800a
L8003b984:
  lw $v0, -20236($v0)
L8003b988:
  lui $v1, 0x8001
L8003b98c:
  lw $v1, 472($v1)
L8003b990:
  and $v0, $v0, $a0
L8003b994:
  lui $at, 0x800a
L8003b998:
  sw $v0, -20236($at)
L8003b99c:
  addiu $v0, $zero, 1
L8003b9a0:
  sw $v1, 12($s0)
L8003b9a4:
  sw $v1, 8($s0)
L8003b9a8:
  sb $v0, 70($s0)
L8003b9ac:
  lw $ra, 20($sp)
L8003b9b0:
  lw $s0, 16($sp)
L8003b9b4:
  jr $ra
L8003b9b8:
  addiu $sp, $sp, 24
L8003b9bc:
  addiu $sp, $sp, -40
L8003b9c0:
  addu $a0, $zero, $zero
L8003b9c4:
  lui $v0, 0x8004
L8003b9c8:
  addiu $v0, $v0, -18424
L8003b9cc:
  addu $a1, $a0, $zero
L8003b9d0:
  addiu $a2, $zero, 7816
L8003b9d4:
  addiu $a3, $zero, 87
L8003b9d8:
  sw $ra, 32($sp)
L8003b9dc:
  sw $v0, 16($sp)
L8003b9e0:
  sw $zero, 20($sp)
L8003b9e4:
  jal 0x80014e1c
L8003b9e8:
  sw $zero, 24($sp)
L8003b9ec:
  jal 0x800137e4
L8003b9f0:
  sll $zero, $zero, 0x0
L8003b9f4:
  lui $a0, 0x8001
L8003b9f8:
  lw $a0, 0($a0)
L8003b9fc:
  jal 0x8016824c
L8003ba00:
  sll $zero, $zero, 0x0
L8003ba04:
  lw $ra, 32($sp)
L8003ba08:
  sll $zero, $zero, 0x0
L8003ba0c:
  jr $ra
L8003ba10:
  addiu $sp, $sp, 40
L8003ba14:
  addiu $sp, $sp, -32
L8003ba18:
  sw $s0, 16($sp)
L8003ba1c:
  addu $s0, $a0, $zero
L8003ba20:
  sw $s1, 20($sp)
L8003ba24:
  addiu $s1, $zero, 1
L8003ba28:
  beq $a1, $s1, L8003bae0
L8003ba2c:
  sw $ra, 24($sp)
L8003ba30:
  slti $v0, $a1, 2
L8003ba34:
  beq $v0, $zero, L8003ba4c
L8003ba38:
  sll $zero, $zero, 0x0
L8003ba3c:
  beq $a1, $zero, L8003ba68
L8003ba40:
  lui $a0, 0xffdd
L8003ba44:
  j L8003bbe4
L8003ba48:
  sll $zero, $zero, 0x0
L8003ba4c:
  addiu $v0, $zero, 2
L8003ba50:
  beq $a1, $v0, L8003bb5c
L8003ba54:
  addiu $v0, $zero, 3
L8003ba58:
  beq $a1, $v0, L8003bb84
L8003ba5c:
  addiu $v1, $zero, 256
L8003ba60:
  j L8003bbe4
L8003ba64:
  sll $zero, $zero, 0x0
L8003ba68:
  ori $a0, $a0, 0xffff
L8003ba6c:
  lui $a1, 0x1
L8003ba70:
  ori $a1, $a1, 0x8000
L8003ba74:
  addiu $v0, $zero, 256
L8003ba78:
  sh $v0, 48($s0)
L8003ba7c:
  sh $v0, 50($s0)
L8003ba80:
  lui $v0, 0x800a
L8003ba84:
  lw $v0, -20236($v0)
L8003ba88:
  addiu $v1, $zero, 64
L8003ba8c:
  sh $v1, 4($s0)
L8003ba90:
  and $v0, $v0, $a0
L8003ba94:
  lui $at, 0x800a
L8003ba98:
  sw $v0, -20236($at)
L8003ba9c:
  lui $v0, 0x800a
L8003baa0:
  lw $v0, -20236($v0)
L8003baa4:
  lui $v1, 0x1
L8003baa8:
  sw $a1, 28($s0)
L8003baac:
  or $v0, $v0, $v1
L8003bab0:
  lui $at, 0x800a
L8003bab4:
  sw $v0, -20236($at)
L8003bab8:
  addiu $v0, $zero, 2
L8003babc:
  sb $v0, 70($s0)
L8003bac0:
  lui $v1, 0x800a
L8003bac4:
  lw $v1, -20200($v1)
L8003bac8:
  addiu $v0, $zero, 16
L8003bacc:
  sh $v0, 6($s0)
L8003bad0:
  sw $v1, 8($s0)
L8003bad4:
  addiu $v1, $v1, 2048
L8003bad8:
  j L8003bbe4
L8003badc:
  sw $v1, 12($s0)
L8003bae0:
  lui $a0, 0xffdd
L8003bae4:
  ori $a0, $a0, 0xffff
L8003bae8:
  addiu $v0, $zero, 448
L8003baec:
  sh $v0, 48($s0)
L8003baf0:
  addiu $v0, $zero, 256
L8003baf4:
  sh $v0, 50($s0)
L8003baf8:
  addiu $v0, $zero, 64
L8003bafc:
  sh $v0, 4($s0)
L8003bb00:
  lui $v0, 0x800a
L8003bb04:
  lw $v0, -20236($v0)
L8003bb08:
  addiu $v1, $zero, 16
L8003bb0c:
  sh $v1, 6($s0)
L8003bb10:
  and $v0, $v0, $a0
L8003bb14:
  lui $at, 0x800a
L8003bb18:
  sw $v0, -20236($at)
L8003bb1c:
  lui $v0, 0x800a
L8003bb20:
  lw $v0, -20236($v0)
L8003bb24:
  lui $v1, 0x1
L8003bb28:
  or $v0, $v0, $v1
L8003bb2c:
  lui $at, 0x800a
L8003bb30:
  sw $v0, -20236($at)
L8003bb34:
  addiu $v0, $zero, 2
L8003bb38:
  sb $v0, 70($s0)
L8003bb3c:
  lui $v0, 0x800a
L8003bb40:
  lw $v0, -20200($v0)
L8003bb44:
  ori $v1, $zero, 0x8000
L8003bb48:
  sw $v1, 28($s0)
L8003bb4c:
  sw $v0, 8($s0)
L8003bb50:
  addiu $v0, $v0, 2048
L8003bb54:
  j L8003bbe4
L8003bb58:
  sw $v0, 12($s0)
L8003bb5c:
  lui $a0, 0xffdc
L8003bb60:
  ori $a0, $a0, 0xffff
L8003bb64:
  addiu $v0, $zero, 2048
L8003bb68:
  sw $v0, 28($s0)
L8003bb6c:
  lui $v0, 0x800a
L8003bb70:
  lw $v0, -20236($v0)
L8003bb74:
  lui $v1, 0x800a
L8003bb78:
  lw $v1, -20200($v1)
L8003bb7c:
  j L8003bbd0
L8003bb80:
  and $v0, $v0, $a0
L8003bb84:
  addiu $v0, $zero, 240
L8003bb88:
  sh $v0, 2($s0)
L8003bb8c:
  addiu $v0, $zero, 4
L8003bb90:
  lui $a1, 0x800a
L8003bb94:
  lw $a1, -20200($a1)
L8003bb98:
  addu $a0, $s0, $zero
L8003bb9c:
  sh $v1, 0($s0)
L8003bba0:
  sh $v1, 4($s0)
L8003bba4:
  jal 0x80081de8
L8003bba8:
  sh $v0, 6($s0)
L8003bbac:
  lui $a0, 0xffdc
L8003bbb0:
  ori $a0, $a0, 0xffff
L8003bbb4:
  addiu $v0, $zero, 30720
L8003bbb8:
  sw $v0, 28($s0)
L8003bbbc:
  lui $v0, 0x800a
L8003bbc0:
  lw $v0, -20236($v0)
L8003bbc4:
  lui $v1, 0x8001
L8003bbc8:
  lw $v1, 472($v1)
L8003bbcc:
  and $v0, $v0, $a0
L8003bbd0:
  lui $at, 0x800a
L8003bbd4:
  sw $v0, -20236($at)
L8003bbd8:
  sw $v1, 12($s0)
L8003bbdc:
  sw $v1, 8($s0)
L8003bbe0:
  sb $s1, 70($s0)
L8003bbe4:
  lw $ra, 24($sp)
L8003bbe8:
  lw $s1, 20($sp)
L8003bbec:
  lw $s0, 16($sp)
L8003bbf0:
  jr $ra
L8003bbf4:
  addiu $sp, $sp, 32
L8003bbf8:
  addiu $sp, $sp, -40
L8003bbfc:
  lui $v0, 0x8004
L8003bc00:
  addiu $v0, $v0, -17900
L8003bc04:
  addu $a0, $zero, $zero
L8003bc08:
  addu $a1, $a0, $zero
L8003bc0c:
  addiu $a2, $zero, 7903
L8003bc10:
  addiu $a3, $zero, 80
L8003bc14:
  sw $ra, 32($sp)
L8003bc18:
  sw $v0, 16($sp)
L8003bc1c:
  sw $zero, 20($sp)
L8003bc20:
  jal 0x80014e1c
L8003bc24:
  sw $zero, 24($sp)
L8003bc28:
  jal 0x800137e4
L8003bc2c:
  sll $zero, $zero, 0x0
L8003bc30:
  lw $ra, 32($sp)
L8003bc34:
  sll $zero, $zero, 0x0
L8003bc38:
  jr $ra
L8003bc3c:
  addiu $sp, $sp, 40
L8003bc40:
  addiu $t0, $a2, -1
L8003bc44:
  bltz $t0, L8003bc74
L8003bc48:
  sll $v0, $t0, 0x1
L8003bc4c:
  addu $v1, $v0, $a1
L8003bc50:
  lhu $v0, 0($v1)
L8003bc54:
  sll $zero, $zero, 0x0
L8003bc58:
  beq $v0, $zero, L8003bc68
L8003bc5c:
  sll $zero, $zero, 0x0
L8003bc60:
  j L8003bc74
L8003bc64:
  addiu $a2, $t0, 1
L8003bc68:
  addiu $t0, $t0, -1
L8003bc6c:
  bgez $t0, L8003bc50
L8003bc70:
  addiu $v1, $v1, -2
L8003bc74:
  blez $a2, L8003bd08
L8003bc78:
  addu $t0, $zero, $zero
L8003bc7c:
  lui $v0, 0x801e
L8003bc80:
  addiu $t3, $v0, -28672
L8003bc84:
  addiu $t2, $zero, -16
L8003bc88:
  lhu $t1, 0($a1)
L8003bc8c:
  sll $zero, $zero, 0x0
L8003bc90:
  sltu $a3, $zero, $t1
L8003bc94:
  sll $v0, $a3, 0x2
L8003bc98:
  addu $v1, $v0, $t3
L8003bc9c:
  lw $v0, 0($v1)
L8003bca0:
  j L8003bce8
L8003bca4:
  sll $zero, $zero, 0x0
L8003bca8:
  or $v0, $v0, $t2
L8003bcac:
  sb $v0, 0($a0)
L8003bcb0:
  sb $a3, 1($a0)
L8003bcb4:
  j L8003bcf8
L8003bcb8:
  addiu $a0, $a0, 2
L8003bcbc:
  lhu $v0, 0($v1)
L8003bcc0:
  sll $zero, $zero, 0x0
L8003bcc4:
  bne $v0, $t1, L8003bcdc
L8003bcc8:
  slti $v0, $a3, 240
L8003bccc:
  beq $v0, $zero, L8003bca8
L8003bcd0:
  sra $v0, $a3, 0x8
L8003bcd4:
  j L8003bcf4
L8003bcd8:
  sb $a3, 0($a0)
L8003bcdc:
  addiu $v1, $v1, 4
L8003bce0:
  lw $v0, 0($v1)
L8003bce4:
  addiu $a3, $a3, 1
L8003bce8:
  bne $v0, $zero, L8003bcbc
L8003bcec:
  sll $zero, $zero, 0x0
L8003bcf0:
  sb $zero, 0($a0)
L8003bcf4:
  addiu $a0, $a0, 1
L8003bcf8:
  addiu $t0, $t0, 1
L8003bcfc:
  slt $v0, $t0, $a2
L8003bd00:
  bne $v0, $zero, L8003bc88
L8003bd04:
  addiu $a1, $a1, 2
L8003bd08:
  addiu $v0, $zero, 255
L8003bd0c:
  jr $ra
L8003bd10:
  sb $v0, 0($a0)
L8003bd14:
  addiu $sp, $sp, -32
L8003bd18:
  sw $s0, 16($sp)
L8003bd1c:
  addu $s0, $a0, $zero
L8003bd20:
  sw $s1, 20($sp)
L8003bd24:
  addiu $s1, $zero, 1
L8003bd28:
  beq $a1, $s1, L8003bde0
L8003bd2c:
  sw $ra, 24($sp)
L8003bd30:
  slti $v0, $a1, 2
L8003bd34:
  beq $v0, $zero, L8003bd4c
L8003bd38:
  sll $zero, $zero, 0x0
L8003bd3c:
  beq $a1, $zero, L8003bd68
L8003bd40:
  lui $a0, 0xffdd
L8003bd44:
  j L8003bea4
L8003bd48:
  sll $zero, $zero, 0x0
L8003bd4c:
  addiu $v0, $zero, 2
L8003bd50:
  beq $a1, $v0, L8003be08
L8003bd54:
  addiu $v0, $zero, 3
L8003bd58:
  beq $a1, $v0, L8003be70
L8003bd5c:
  lui $a0, 0xffdc
L8003bd60:
  j L8003bea4
L8003bd64:
  sll $zero, $zero, 0x0
L8003bd68:
  ori $a0, $a0, 0xffff
L8003bd6c:
  addiu $v0, $zero, 768
L8003bd70:
  sh $v0, 48($s0)
L8003bd74:
  addiu $v0, $zero, 256
L8003bd78:
  sh $v0, 50($s0)
L8003bd7c:
  addiu $v0, $zero, 64
L8003bd80:
  sh $v0, 4($s0)
L8003bd84:
  lui $v0, 0x800a
L8003bd88:
  lw $v0, -20236($v0)
L8003bd8c:
  addiu $v1, $zero, 16
L8003bd90:
  sh $v1, 6($s0)
L8003bd94:
  and $v0, $v0, $a0
L8003bd98:
  lui $at, 0x800a
L8003bd9c:
  sw $v0, -20236($at)
L8003bda0:
  lui $v0, 0x800a
L8003bda4:
  lw $v0, -20236($v0)
L8003bda8:
  lui $v1, 0x1
L8003bdac:
  or $v0, $v0, $v1
L8003bdb0:
  lui $at, 0x800a
L8003bdb4:
  sw $v0, -20236($at)
L8003bdb8:
  addiu $v0, $zero, 2
L8003bdbc:
  sb $v0, 70($s0)
L8003bdc0:
  lui $v0, 0x800a
L8003bdc4:
  lw $v0, -20200($v0)
L8003bdc8:
  lui $v1, 0x2
L8003bdcc:
  sw $v1, 28($s0)
L8003bdd0:
  sw $v0, 8($s0)
L8003bdd4:
  addiu $v0, $v0, 2048
L8003bdd8:
  j L8003bea4
L8003bddc:
  sw $v0, 12($s0)
L8003bde0:
  lui $a0, 0xffdc
L8003bde4:
  ori $a0, $a0, 0xffff
L8003bde8:
  addiu $v0, $zero, 8192
L8003bdec:
  sw $v0, 28($s0)
L8003bdf0:
  lui $v0, 0x800a
L8003bdf4:
  lw $v0, -20236($v0)
L8003bdf8:
  lui $v1, 0x800a
L8003bdfc:
  lw $v1, -20200($v1)
L8003be00:
  j L8003be90
L8003be04:
  and $v0, $v0, $a0
L8003be08:
  addiu $v1, $zero, 256
L8003be0c:
  addiu $v0, $zero, 240
L8003be10:
  sh $v0, 2($s0)
L8003be14:
  addiu $v0, $zero, 16
L8003be18:
  lui $a1, 0x800a
L8003be1c:
  lw $a1, -20200($a1)
L8003be20:
  addu $a0, $s0, $zero
L8003be24:
  sh $v1, 0($s0)
L8003be28:
  sh $v1, 4($s0)
L8003be2c:
  jal 0x80081de8
L8003be30:
  sh $v0, 6($s0)
L8003be34:
  lui $a0, 0xffdc
L8003be38:
  ori $a0, $a0, 0xffff
L8003be3c:
  lui $v0, 0x801b
L8003be40:
  addiu $v0, $v0, -32768
L8003be44:
  sw $v0, 12($s0)
L8003be48:
  sw $v0, 8($s0)
L8003be4c:
  lui $v0, 0x800a
L8003be50:
  lw $v0, -20236($v0)
L8003be54:
  addiu $v1, $zero, 6144
L8003be58:
  sw $v1, 28($s0)
L8003be5c:
  and $v0, $v0, $a0
L8003be60:
  lui $at, 0x800a
L8003be64:
  sw $v0, -20236($at)
L8003be68:
  j L8003bea4
L8003be6c:
  sb $s1, 70($s0)
L8003be70:
  ori $a0, $a0, 0xffff
L8003be74:
  addiu $v0, $zero, 30720
L8003be78:
  sw $v0, 28($s0)
L8003be7c:
  lui $v0, 0x800a
L8003be80:
  lw $v0, -20236($v0)
L8003be84:
  lui $v1, 0x8001
L8003be88:
  lw $v1, 472($v1)
L8003be8c:
  and $v0, $v0, $a0
L8003be90:
  lui $at, 0x800a
L8003be94:
  sw $v0, -20236($at)
L8003be98:
  sw $v1, 12($s0)
L8003be9c:
  sw $v1, 8($s0)
L8003bea0:
  sb $s1, 70($s0)
L8003bea4:
  lw $ra, 24($sp)
L8003bea8:
  lw $s1, 20($sp)
L8003beac:
  lw $s0, 16($sp)
L8003beb0:
  jr $ra
L8003beb4:
  addiu $sp, $sp, 32
L8003beb8:
  addiu $sp, $sp, -40
L8003bebc:
  lui $v0, 0x8004
L8003bec0:
  addiu $v0, $v0, -17132
L8003bec4:
  addu $a0, $zero, $zero
L8003bec8:
  addu $a1, $a0, $zero
L8003becc:
  addiu $a2, $zero, 7983
L8003bed0:
  addiu $a3, $zero, 86
L8003bed4:
  sw $ra, 32($sp)
L8003bed8:
  sw $v0, 16($sp)
L8003bedc:
  sw $zero, 20($sp)
L8003bee0:
  jal 0x80014e1c
L8003bee4:
  sw $zero, 24($sp)
L8003bee8:
  jal 0x800137e4
L8003beec:
  sll $zero, $zero, 0x0
L8003bef0:
  lw $ra, 32($sp)
L8003bef4:
  sll $zero, $zero, 0x0
L8003bef8:
  jr $ra
L8003befc:
  addiu $sp, $sp, 40
L8003bf00:
  addiu $sp, $sp, -24
L8003bf04:
  sw $ra, 16($sp)
L8003bf08:
  sltiu $v0, $a1, 6
L8003bf0c:
  beq $v0, $zero, L8003c0b0
L8003bf10:
  addu $a2, $a0, $zero
L8003bf14:
  lui $v0, 0x8001
L8003bf18:
  addiu $v0, $v0, 864
L8003bf1c:
  sll $v1, $a1, 0x2
L8003bf20:
  addu $v1, $v1, $v0
L8003bf24:
  lw $v0, 0($v1)
L8003bf28:
  sll $zero, $zero, 0x0
L8003bf2c:
  jr $v0
L8003bf30:
  sll $zero, $zero, 0x0
L8003bf34:
  lui $a0, 0xffdc
L8003bf38:
  ori $a0, $a0, 0xffff
L8003bf3c:
  addiu $v0, $zero, 12288
L8003bf40:
  sw $v0, 28($a2)
L8003bf44:
  lui $v0, 0x800a
L8003bf48:
  lw $v0, -20236($v0)
L8003bf4c:
  lui $v1, 0x8001
L8003bf50:
  lw $v1, 472($v1)
L8003bf54:
  j L8003c068
L8003bf58:
  and $v0, $v0, $a0
L8003bf5c:
  lui $a0, 0xffdc
L8003bf60:
  ori $a0, $a0, 0xffff
L8003bf64:
  lui $v0, 0x4
L8003bf68:
  ori $v0, $v0, 0x3000
L8003bf6c:
  sw $v0, 28($a2)
L8003bf70:
  lui $v0, 0x800a
L8003bf74:
  lw $v0, -20236($v0)
L8003bf78:
  lui $v1, 0x8001
L8003bf7c:
  lw $v1, 0($v1)
L8003bf80:
  j L8003c068
L8003bf84:
  and $v0, $v0, $a0
L8003bf88:
  lui $a0, 0xffdc
L8003bf8c:
  ori $a0, $a0, 0xffff
L8003bf90:
  lui $v0, 0x801b
L8003bf94:
  addiu $v0, $v0, -4096
L8003bf98:
  sw $v0, 12($a2)
L8003bf9c:
  sw $v0, 8($a2)
L8003bfa0:
  lui $v0, 0x800a
L8003bfa4:
  lw $v0, -20236($v0)
L8003bfa8:
  addiu $v1, $zero, 2048
L8003bfac:
  sw $v1, 28($a2)
L8003bfb0:
  and $v0, $v0, $a0
L8003bfb4:
  lui $at, 0x800a
L8003bfb8:
  sw $v0, -20236($at)
L8003bfbc:
  addiu $v0, $zero, 1
L8003bfc0:
  j L8003c0b0
L8003bfc4:
  sb $v0, 70($a2)
L8003bfc8:
  lui $a0, 0xffdd
L8003bfcc:
  ori $a0, $a0, 0xffff
L8003bfd0:
  addiu $v0, $zero, 448
L8003bfd4:
  sh $v0, 48($a2)
L8003bfd8:
  addiu $v0, $zero, 256
L8003bfdc:
  sh $v0, 50($a2)
L8003bfe0:
  addiu $v0, $zero, 64
L8003bfe4:
  sh $v0, 4($a2)
L8003bfe8:
  lui $v0, 0x800a
L8003bfec:
  lw $v0, -20236($v0)
L8003bff0:
  addiu $v1, $zero, 16
L8003bff4:
  sh $v1, 6($a2)
L8003bff8:
  and $v0, $v0, $a0
L8003bffc:
  lui $at, 0x800a
L8003c000:
  sw $v0, -20236($at)
L8003c004:
  lui $v0, 0x800a
L8003c008:
  lw $v0, -20236($v0)
L8003c00c:
  lui $v1, 0x1
L8003c010:
  or $v0, $v0, $v1
L8003c014:
  lui $at, 0x800a
L8003c018:
  sw $v0, -20236($at)
L8003c01c:
  addiu $v0, $zero, 2
L8003c020:
  sb $v0, 70($a2)
L8003c024:
  lui $v0, 0x800a
L8003c028:
  lw $v0, -20200($v0)
L8003c02c:
  ori $v1, $zero, 0x8000
L8003c030:
  sw $v1, 28($a2)
L8003c034:
  sw $v0, 8($a2)
L8003c038:
  addiu $v0, $v0, 2048
L8003c03c:
  j L8003c0b0
L8003c040:
  sw $v0, 12($a2)
L8003c044:
  lui $a0, 0xffdc
L8003c048:
  ori $a0, $a0, 0xffff
L8003c04c:
  addiu $v0, $zero, 2048
L8003c050:
  sw $v0, 28($a2)
L8003c054:
  lui $v0, 0x800a
L8003c058:
  lw $v0, -20236($v0)
L8003c05c:
  lui $v1, 0x800a
L8003c060:
  lw $v1, -20200($v1)
L8003c064:
  and $v0, $v0, $a0
L8003c068:
  lui $at, 0x800a
L8003c06c:
  sw $v0, -20236($at)
L8003c070:
  addiu $v0, $zero, 1
L8003c074:
  sw $v1, 12($a2)
L8003c078:
  sw $v1, 8($a2)
L8003c07c:
  j L8003c0b0
L8003c080:
  sb $v0, 70($a2)
L8003c084:
  addiu $v0, $zero, 256
L8003c088:
  addiu $v1, $zero, 240
L8003c08c:
  sh $v0, 0($a2)
L8003c090:
  sh $v0, 4($a2)
L8003c094:
  addiu $v0, $zero, 4
L8003c098:
  lui $a1, 0x800a
L8003c09c:
  lw $a1, -20200($a1)
L8003c0a0:
  addu $a0, $a2, $zero
L8003c0a4:
  sh $v1, 2($a2)
L8003c0a8:
  jal 0x80081de8
L8003c0ac:
  sh $v0, 6($a2)
L8003c0b0:
  lw $ra, 16($sp)
L8003c0b4:
  sll $zero, $zero, 0x0
L8003c0b8:
  jr $ra
L8003c0bc:
  addiu $sp, $sp, 24
L8003c0c0:
  addiu $sp, $sp, -40
L8003c0c4:
  sw $s0, 32($sp)
L8003c0c8:
  addu $s0, $zero, $zero
L8003c0cc:
  sw $ra, 36($sp)
L8003c0d0:
  jal L8002cca8
L8003c0d4:
  addiu $a0, $zero, 71
L8003c0d8:
  beq $v0, $zero, L8003c0e4
L8003c0dc:
  addu $a0, $zero, $zero
L8003c0e0:
  addiu $s0, $zero, 158
L8003c0e4:
  lui $v0, 0x8004
L8003c0e8:
  addiu $v0, $v0, -16640
L8003c0ec:
  addu $a1, $a0, $zero
L8003c0f0:
  addiu $a2, $s0, 8153
L8003c0f4:
  addiu $a3, $zero, 158
L8003c0f8:
  sw $v0, 16($sp)
L8003c0fc:
  sw $zero, 20($sp)
L8003c100:
  jal 0x80014e1c
L8003c104:
  sw $zero, 24($sp)
L8003c108:
  jal 0x800137e4
L8003c10c:
  sll $zero, $zero, 0x0
L8003c110:
  lw $ra, 36($sp)
L8003c114:
  lw $s0, 32($sp)
L8003c118:
  jr $ra
L8003c11c:
  addiu $sp, $sp, 40
L8003c120:
  addiu $sp, $sp, -32
L8003c124:
  sw $s0, 16($sp)
L8003c128:
  addu $s0, $a0, $zero
L8003c12c:
  sw $s1, 20($sp)
L8003c130:
  addiu $s1, $zero, 1
L8003c134:
  beq $a1, $s1, L8003c1e4
L8003c138:
  sw $ra, 24($sp)
L8003c13c:
  slti $v0, $a1, 2
L8003c140:
  beq $v0, $zero, L8003c158
L8003c144:
  sll $zero, $zero, 0x0
L8003c148:
  beq $a1, $zero, L8003c174
L8003c14c:
  lui $a0, 0xffdd
L8003c150:
  j L8003c2a0
L8003c154:
  sll $zero, $zero, 0x0
L8003c158:
  addiu $v0, $zero, 2
L8003c15c:
  beq $a1, $v0, L8003c21c
L8003c160:
  addiu $v0, $zero, 3
L8003c164:
  beq $a1, $v0, L8003c270
L8003c168:
  lui $a0, 0xffdc
L8003c16c:
  j L8003c2a0
L8003c170:
  sll $zero, $zero, 0x0
L8003c174:
  ori $a0, $a0, 0xffff
L8003c178:
  addiu $v0, $zero, 256
L8003c17c:
  sh $v0, 50($s0)
L8003c180:
  lui $v0, 0x800a
L8003c184:
  lw $v0, -20236($v0)
L8003c188:
  addiu $v1, $zero, 64
L8003c18c:
  sh $zero, 48($s0)
L8003c190:
  sh $v1, 4($s0)
L8003c194:
  and $v0, $v0, $a0
L8003c198:
  lui $at, 0x800a
L8003c19c:
  sw $v0, -20236($at)
L8003c1a0:
  lui $v0, 0x800a
L8003c1a4:
  lw $v0, -20236($v0)
L8003c1a8:
  lui $a0, 0x1
L8003c1ac:
  sw $a0, 28($s0)
L8003c1b0:
  or $v0, $v0, $a0
L8003c1b4:
  lui $at, 0x800a
L8003c1b8:
  sw $v0, -20236($at)
L8003c1bc:
  addiu $v0, $zero, 2
L8003c1c0:
  sb $v0, 70($s0)
L8003c1c4:
  lui $v1, 0x800a
L8003c1c8:
  lw $v1, -20200($v1)
L8003c1cc:
  addiu $v0, $zero, 16
L8003c1d0:
  sh $v0, 6($s0)
L8003c1d4:
  sw $v1, 8($s0)
L8003c1d8:
  addiu $v1, $v1, 2048
L8003c1dc:
  j L8003c2a0
L8003c1e0:
  sw $v1, 12($s0)
L8003c1e4:
  lui $a0, 0xffdc
L8003c1e8:
  ori $a0, $a0, 0xffff
L8003c1ec:
  addiu $v0, $zero, 2048
L8003c1f0:
  sw $v0, 28($s0)
L8003c1f4:
  lui $v0, 0x800a
L8003c1f8:
  lw $v0, -20236($v0)
L8003c1fc:
  lui $v1, 0x800a
L8003c200:
  lw $v1, -20200($v1)
L8003c204:
  and $v0, $v0, $a0
L8003c208:
  lui $at, 0x800a
L8003c20c:
  sw $v0, -20236($at)
L8003c210:
  sw $v1, 12($s0)
L8003c214:
  j L8003c29c
L8003c218:
  sw $v1, 8($s0)
L8003c21c:
  addiu $v1, $zero, 256
L8003c220:
  addiu $v0, $zero, 240
L8003c224:
  sh $v0, 2($s0)
L8003c228:
  addiu $v0, $zero, 4
L8003c22c:
  lui $a1, 0x800a
L8003c230:
  lw $a1, -20200($a1)
L8003c234:
  addu $a0, $s0, $zero
L8003c238:
  sh $v1, 0($s0)
L8003c23c:
  sh $v1, 4($s0)
L8003c240:
  jal 0x80081de8
L8003c244:
  sh $v0, 6($s0)
L8003c248:
  lui $a0, 0xffdc
L8003c24c:
  ori $a0, $a0, 0xffff
L8003c250:
  lui $v0, 0x801b
L8003c254:
  addiu $v0, $v0, -4096
L8003c258:
  sw $v0, 12($s0)
L8003c25c:
  sw $v0, 8($s0)
L8003c260:
  lui $v0, 0x800a
L8003c264:
  lw $v0, -20236($v0)
L8003c268:
  j L8003c28c
L8003c26c:
  addiu $v1, $zero, 2048
L8003c270:
  ori $a0, $a0, 0xffff
L8003c274:
  lui $v0, 0x8014
L8003c278:
  sw $v0, 12($s0)
L8003c27c:
  sw $v0, 8($s0)
L8003c280:
  lui $v0, 0x800a
L8003c284:
  lw $v0, -20236($v0)
L8003c288:
  ori $v1, $zero, 0x8000
L8003c28c:
  sw $v1, 28($s0)
L8003c290:
  and $v0, $v0, $a0
L8003c294:
  lui $at, 0x800a
L8003c298:
  sw $v0, -20236($at)
L8003c29c:
  sb $s1, 70($s0)
L8003c2a0:
  lw $ra, 24($sp)
L8003c2a4:
  lw $s1, 20($sp)
L8003c2a8:
  lw $s0, 16($sp)
L8003c2ac:
  jr $ra
L8003c2b0:
  addiu $sp, $sp, 32
L8003c2b4:
  addiu $sp, $sp, -40
L8003c2b8:
  addu $a0, $zero, $zero
L8003c2bc:
  addu $a1, $a0, $zero
L8003c2c0:
  addiu $a2, $zero, 8469
L8003c2c4:
  addiu $a3, $zero, 50
L8003c2c8:
  lui $v0, 0x8004
L8003c2cc:
  addiu $v0, $v0, -16096
L8003c2d0:
  sw $ra, 32($sp)
L8003c2d4:
  sw $v0, 16($sp)
L8003c2d8:
  sw $zero, 20($sp)
L8003c2dc:
  jal 0x80014e1c
L8003c2e0:
  sw $zero, 24($sp)
L8003c2e4:
  jal 0x800137e4
L8003c2e8:
  sll $zero, $zero, 0x0
L8003c2ec:
  addu $a0, $zero, $zero
L8003c2f0:
  addu $a1, $a0, $zero
L8003c2f4:
  addiu $a2, $zero, 8519
L8003c2f8:
  addiu $a3, $zero, 16
L8003c2fc:
  lui $v0, 0x8014
L8003c300:
  sw $zero, 16($sp)
L8003c304:
  sw $zero, 20($sp)
L8003c308:
  jal 0x80014e1c
L8003c30c:
  sw $v0, 24($sp)
L8003c310:
  jal 0x800137e4
L8003c314:
  sll $zero, $zero, 0x0
L8003c318:
  lw $ra, 32($sp)
L8003c31c:
  sll $zero, $zero, 0x0
L8003c320:
  jr $ra
L8003c324:
  addiu $sp, $sp, 40
L8003c328:
  addiu $sp, $sp, -32
L8003c32c:
  sw $s0, 16($sp)
L8003c330:
  addu $s0, $a0, $zero
L8003c334:
  sw $s1, 20($sp)
L8003c338:
  addiu $s1, $zero, 1
L8003c33c:
  beq $a1, $s1, L8003c3ec
L8003c340:
  sw $ra, 24($sp)
L8003c344:
  slti $v0, $a1, 2
L8003c348:
  beq $v0, $zero, L8003c360
L8003c34c:
  sll $zero, $zero, 0x0
L8003c350:
  beq $a1, $zero, L8003c374
L8003c354:
  lui $a0, 0xffdd
L8003c358:
  j L8003c484
L8003c35c:
  sll $zero, $zero, 0x0
L8003c360:
  addiu $v0, $zero, 2
L8003c364:
  beq $a1, $v0, L8003c424
L8003c368:
  addiu $v0, $zero, 240
L8003c36c:
  j L8003c484
L8003c370:
  sll $zero, $zero, 0x0
L8003c374:
  ori $a0, $a0, 0xffff
L8003c378:
  lui $a1, 0x1
L8003c37c:
  ori $a1, $a1, 0x8000
L8003c380:
  addiu $v0, $zero, 256
L8003c384:
  sh $v0, 50($s0)
L8003c388:
  lui $v0, 0x800a
L8003c38c:
  lw $v0, -20236($v0)
L8003c390:
  addiu $v1, $zero, 64
L8003c394:
  sh $v1, 4($s0)
L8003c398:
  and $v0, $v0, $a0
L8003c39c:
  lui $at, 0x800a
L8003c3a0:
  sw $v0, -20236($at)
L8003c3a4:
  lui $v0, 0x800a
L8003c3a8:
  lw $v0, -20236($v0)
L8003c3ac:
  lui $v1, 0x1
L8003c3b0:
  sh $zero, 48($s0)
L8003c3b4:
  sw $a1, 28($s0)
L8003c3b8:
  or $v0, $v0, $v1
L8003c3bc:
  lui $at, 0x800a
L8003c3c0:
  sw $v0, -20236($at)
L8003c3c4:
  addiu $v0, $zero, 2
L8003c3c8:
  sb $v0, 70($s0)
L8003c3cc:
  lui $v1, 0x800a
L8003c3d0:
  lw $v1, -20200($v1)
L8003c3d4:
  addiu $v0, $zero, 16
L8003c3d8:
  sh $v0, 6($s0)
L8003c3dc:
  sw $v1, 8($s0)
L8003c3e0:
  addiu $v1, $v1, 2048
L8003c3e4:
  j L8003c484
L8003c3e8:
  sw $v1, 12($s0)
L8003c3ec:
  lui $a0, 0xffdc
L8003c3f0:
  ori $a0, $a0, 0xffff
L8003c3f4:
  addiu $v0, $zero, 2048
L8003c3f8:
  sw $v0, 28($s0)
L8003c3fc:
  lui $v0, 0x800a
L8003c400:
  lw $v0, -20236($v0)
L8003c404:
  lui $v1, 0x800a
L8003c408:
  lw $v1, -20200($v1)
L8003c40c:
  and $v0, $v0, $a0
L8003c410:
  lui $at, 0x800a
L8003c414:
  sw $v0, -20236($at)
L8003c418:
  sw $v1, 12($s0)
L8003c41c:
  j L8003c480
L8003c420:
  sw $v1, 8($s0)
L8003c424:
  sh $v0, 2($s0)
L8003c428:
  addiu $v0, $zero, 256
L8003c42c:
  sh $v0, 4($s0)
L8003c430:
  addiu $v0, $zero, 4
L8003c434:
  lui $a1, 0x800a
L8003c438:
  lw $a1, -20200($a1)
L8003c43c:
  addu $a0, $s0, $zero
L8003c440:
  sh $zero, 0($s0)
L8003c444:
  jal 0x80081de8
L8003c448:
  sh $v0, 6($s0)
L8003c44c:
  lui $a0, 0xffdc
L8003c450:
  ori $a0, $a0, 0xffff
L8003c454:
  lui $v0, 0x801b
L8003c458:
  addiu $v0, $v0, -4096
L8003c45c:
  sw $v0, 12($s0)
L8003c460:
  sw $v0, 8($s0)
L8003c464:
  lui $v0, 0x800a
L8003c468:
  lw $v0, -20236($v0)
L8003c46c:
  addiu $v1, $zero, 2048
L8003c470:
  sw $v1, 28($s0)
L8003c474:
  and $v0, $v0, $a0
L8003c478:
  lui $at, 0x800a
L8003c47c:
  sw $v0, -20236($at)
L8003c480:
  sb $s1, 70($s0)
L8003c484:
  lw $ra, 24($sp)
L8003c488:
  lw $s1, 20($sp)
L8003c48c:
  lw $s0, 16($sp)
L8003c490:
  jr $ra
L8003c494:
  addiu $sp, $sp, 32
L8003c498:
  addiu $sp, $sp, -40
L8003c49c:
  lui $v0, 0x8004
L8003c4a0:
  addiu $v0, $v0, -15576
L8003c4a4:
  addu $a0, $zero, $zero
L8003c4a8:
  addu $a1, $a0, $zero
L8003c4ac:
  addiu $a2, $zero, 8535
L8003c4b0:
  addiu $a3, $zero, 50
L8003c4b4:
  sw $ra, 32($sp)
L8003c4b8:
  sw $v0, 16($sp)
L8003c4bc:
  sw $zero, 20($sp)
L8003c4c0:
  jal 0x80014e1c
L8003c4c4:
  sw $zero, 24($sp)
L8003c4c8:
  jal 0x800137e4
L8003c4cc:
  sll $zero, $zero, 0x0
L8003c4d0:
  lw $ra, 32($sp)
L8003c4d4:
  sll $zero, $zero, 0x0
L8003c4d8:
  jr $ra
L8003c4dc:
  addiu $sp, $sp, 40
L8003c4e0:
  addiu $sp, $sp, -32
L8003c4e4:
  lui $v1, 0x801d
L8003c4e8:
  addiu $v0, $zero, 4
L8003c4ec:
  sb $v0, 22280($v1)
L8003c4f0:
  addiu $v1, $v1, 22280
L8003c4f4:
  sw $ra, 24($sp)
L8003c4f8:
  sb $v0, 1($v1)
L8003c4fc:
  sb $v0, 2($v1)
L8003c500:
  sb $v0, 3($v1)
L8003c504:
  sb $v0, 4($v1)
L8003c508:
  addu $v0, $a0, $v1
L8003c50c:
  beq $a0, $zero, L8003c520
L8003c510:
  sb $zero, 0($v0)
L8003c514:
  addiu $v0, $zero, 2
L8003c518:
  j L8003c528
L8003c51c:
  sb $v0, 3($v1)
L8003c520:
  addiu $v0, $zero, 2
L8003c524:
  sb $v0, 4($v1)
L8003c528:
  addiu $a0, $zero, 1
L8003c52c:
  addiu $v0, $zero, 288
L8003c530:
  sw $v0, 16($sp)
L8003c534:
  addiu $v0, $zero, 256
L8003c538:
  addiu $a1, $zero, 239
L8003c53c:
  addiu $a2, $zero, 24
L8003c540:
  addiu $a3, $zero, 56
L8003c544:
  jal L80035be4
L8003c548:
  sw $v0, 20($sp)
L8003c54c:
  lui $a0, 0x800f
L8003c550:
  jal L80039a14
L8003c554:
  addiu $a0, $a0, -20132
L8003c558:
  lw $ra, 24($sp)
L8003c55c:
  sll $zero, $zero, 0x0
L8003c560:
  jr $ra
L8003c564:
  addiu $sp, $sp, 32
L8003c568:
  addiu $sp, $sp, -16
L8003c56c:
  lui $v0, 0x800a
L8003c570:
  addiu $t2, $v0, -20644
L8003c574:
  lwl $a3, 3($t2)
L8003c578:
  lwr $a3, 0($t2)
L8003c57c:
  lh $t0, 4($t2)
L8003c580:
  swl $a3, 3($sp)
L8003c584:
  swr $a3, 0($sp)
L8003c588:
  sh $t0, 4($sp)
L8003c58c:
  addiu $v0, $zero, 104
L8003c590:
  sh $v0, 8($sp)
L8003c594:
  lb $v0, 1141($gp)
L8003c598:
  lw $a1, 1144($gp)
L8003c59c:
  lw $a2, 1152($gp)
L8003c5a0:
  addiu $v1, $zero, 200
L8003c5a4:
  sh $v1, 10($sp)
L8003c5a8:
  sll $v0, $v0, 0x1
L8003c5ac:
  addu $v0, $sp, $v0
L8003c5b0:
  lhu $v1, 8($v0)
L8003c5b4:
  addiu $v0, $zero, 72
L8003c5b8:
  sh $v0, 50($a1)
L8003c5bc:
  addiu $v0, $zero, 32
L8003c5c0:
  sh $v1, 48($a1)
L8003c5c4:
  sh $v0, 48($a2)
L8003c5c8:
  sll $v0, $a0, 0x1
L8003c5cc:
  addu $v0, $sp, $v0
L8003c5d0:
  lhu $v0, 0($v0)
L8003c5d4:
  sll $zero, $zero, 0x0
L8003c5d8:
  addiu $v0, $v0, 8
L8003c5dc:
  bne $a0, $zero, L8003c610
L8003c5e0:
  sh $v0, 50($a2)
L8003c5e4:
  lhu $v0, 8($a1)
L8003c5e8:
  lhu $v1, 48($a1)
L8003c5ec:
  andi $v0, $v0, 0xffbf
L8003c5f0:
  addiu $v1, $v1, 8
L8003c5f4:
  sh $v0, 8($a1)
L8003c5f8:
  sh $v1, 48($a2)
L8003c5fc:
  lhu $v0, 50($a1)
L8003c600:
  sll $zero, $zero, 0x0
L8003c604:
  addiu $v0, $v0, 8
L8003c608:
  j L8003c620
L8003c60c:
  sh $v0, 50($a2)
L8003c610:
  lhu $v0, 8($a1)
L8003c614:
  sll $zero, $zero, 0x0
L8003c618:
  ori $v0, $v0, 0x40
L8003c61c:
  sh $v0, 8($a1)
L8003c620:
  jr $ra
L8003c624:
  addiu $sp, $sp, 16
L8003c628:
  addiu $sp, $sp, -56
L8003c62c:
  sw $ra, 52($sp)
L8003c630:
  sw $s2, 48($sp)
L8003c634:
  sw $s1, 44($sp)
L8003c638:
  jal 0x8004002c
L8003c63c:
  sw $s0, 40($sp)
L8003c640:
  addu $a0, $v0, $zero
L8003c644:
  jal 0x800400ac
L8003c648:
  addiu $a1, $zero, 2
L8003c64c:
  addu $s1, $v0, $zero
L8003c650:
  addu $a0, $s1, $zero
L8003c654:
  addu $a1, $zero, $zero
L8003c658:
  addu $a2, $a1, $zero
L8003c65c:
  addu $a3, $a1, $zero
L8003c660:
  addiu $s2, $zero, 16
L8003c664:
  addiu $v0, $zero, 256
L8003c668:
  sw $v0, 28($sp)
L8003c66c:
  lui $v0, 0x801b
L8003c670:
  addiu $v0, $v0, -4096
L8003c674:
  sw $zero, 16($sp)
L8003c678:
  sw $zero, 20($sp)
L8003c67c:
  sw $s2, 24($sp)
L8003c680:
  jal 0x800428a8
L8003c684:
  sw $v0, 32($sp)
L8003c688:
  addu $a0, $s1, $zero
L8003c68c:
  jal 0x800428ec
L8003c690:
  addiu $a1, $zero, -5
L8003c694:
  addiu $v0, $zero, 1
L8003c698:
  sb $v0, 1140($gp)
L8003c69c:
  lhu $v0, 8($s1)
L8003c6a0:
  lui $v1, 0x800a
L8003c6a4:
  lbu $v1, -19448($v1)
L8003c6a8:
  ori $v0, $v0, 0x28
L8003c6ac:
  sb $v1, 1141($gp)
L8003c6b0:
  sll $v1, $v1, 0x18
L8003c6b4:
  bgez $v1, L8003c6c0
L8003c6b8:
  sh $v0, 8($s1)
L8003c6bc:
  sb $zero, 1141($gp)
L8003c6c0:
  sb $zero, 1148($gp)
L8003c6c4:
  jal L8003c4e0
L8003c6c8:
  addu $a0, $zero, $zero
L8003c6cc:
  jal 0x8004002c
L8003c6d0:
  addiu $s0, $zero, 11
L8003c6d4:
  addu $a0, $v0, $zero
L8003c6d8:
  jal 0x800400ac
L8003c6dc:
  addiu $a1, $zero, 2
L8003c6e0:
  addu $s1, $v0, $zero
L8003c6e4:
  addu $a0, $s1, $zero
L8003c6e8:
  addiu $a1, $zero, 24
L8003c6ec:
  addiu $a2, $zero, 72
L8003c6f0:
  addiu $a3, $zero, 3
L8003c6f4:
  addiu $v0, $zero, 4
L8003c6f8:
  sw $v0, 16($sp)
L8003c6fc:
  addiu $v0, $zero, 524
L8003c700:
  sw $zero, 20($sp)
L8003c704:
  sw $s0, 24($sp)
L8003c708:
  jal 0x800404cc
L8003c70c:
  sw $v0, 28($sp)
L8003c710:
  lhu $v0, 8($s1)
L8003c714:
  sw $s1, 1152($gp)
L8003c718:
  ori $v0, $v0, 0x28
L8003c71c:
  jal 0x8004002c
L8003c720:
  sh $v0, 8($s1)
L8003c724:
  addu $a0, $v0, $zero
L8003c728:
  jal 0x800400ac
L8003c72c:
  addiu $a1, $zero, 1
L8003c730:
  addu $s1, $v0, $zero
L8003c734:
  addu $a0, $s1, $zero
L8003c738:
  addiu $a1, $zero, 104
L8003c73c:
  addiu $a2, $zero, 72
L8003c740:
  addiu $a3, $zero, 16
L8003c744:
  addiu $v0, $zero, 80
L8003c748:
  sw $v0, 20($sp)
L8003c74c:
  addiu $v0, $zero, 128
L8003c750:
  sw $v0, 24($sp)
L8003c754:
  addiu $v0, $zero, 528
L8003c758:
  sw $v0, 32($sp)
L8003c75c:
  addiu $v0, $zero, 252
L8003c760:
  sw $s2, 16($sp)
L8003c764:
  sw $s0, 28($sp)
L8003c768:
  jal 0x80040510
L8003c76c:
  sw $v0, 36($sp)
L8003c770:
  lb $a0, 1148($gp)
L8003c774:
  sw $s1, 1144($gp)
L8003c778:
  jal L8003c568
L8003c77c:
  sll $zero, $zero, 0x0
L8003c780:
  jal L8003ff08
L8003c784:
  addiu $a0, $zero, 29520
L8003c788:
  lw $ra, 52($sp)
L8003c78c:
  lw $s2, 48($sp)
L8003c790:
  lw $s1, 44($sp)
L8003c794:
  lw $s0, 40($sp)
L8003c798:
  jr $ra
L8003c79c:
  addiu $sp, $sp, 56
L8003c7a0:
  lb $v0, 1148($gp)
L8003c7a4:
  addiu $sp, $sp, -24
L8003c7a8:
  bne $v0, $zero, L8003c850
L8003c7ac:
  sw $ra, 16($sp)
L8003c7b0:
  lui $v0, 0x800a
L8003c7b4:
  lhu $v0, -19560($v0)
L8003c7b8:
  sll $zero, $zero, 0x0
L8003c7bc:
  andi $v0, $v0, 0xa000
L8003c7c0:
  beq $v0, $zero, L8003c850
L8003c7c4:
  sll $zero, $zero, 0x0
L8003c7c8:
  lui $v0, 0x800a
L8003c7cc:
  lhu $v0, -19560($v0)
L8003c7d0:
  sll $zero, $zero, 0x0
L8003c7d4:
  andi $v0, $v0, 0x2000
L8003c7d8:
  beq $v0, $zero, L8003c80c
L8003c7dc:
  sll $zero, $zero, 0x0
L8003c7e0:
  lb $v0, 1141($gp)
L8003c7e4:
  sll $zero, $zero, 0x0
L8003c7e8:
  bne $v0, $zero, L8003c8bc
L8003c7ec:
  sll $zero, $zero, 0x0
L8003c7f0:
  addiu $a0, $zero, 1
L8003c7f4:
  addu $v0, $a0, $zero
L8003c7f8:
  lui $at, 0x800a
L8003c7fc:
  sb $a0, -19448($at)
L8003c800:
  sb $v0, 1141($gp)
L8003c804:
  j L8003c82c
L8003c808:
  sll $zero, $zero, 0x0
L8003c80c:
  lb $v0, 1141($gp)
L8003c810:
  sll $zero, $zero, 0x0
L8003c814:
  beq $v0, $zero, L8003c8bc
L8003c818:
  sll $zero, $zero, 0x0
L8003c81c:
  addu $a0, $zero, $zero
L8003c820:
  lui $at, 0x800a
L8003c824:
  sb $zero, -19448($at)
L8003c828:
  sb $zero, 1141($gp)
L8003c82c:
  jal 0x80046fa0
L8003c830:
  sll $zero, $zero, 0x0
L8003c834:
  jal L8003fee0
L8003c838:
  addiu $a0, $zero, 47
L8003c83c:
  lb $a0, 1148($gp)
L8003c840:
  jal L8003c568
L8003c844:
  sll $zero, $zero, 0x0
L8003c848:
  j L8003c8bc
L8003c84c:
  sll $zero, $zero, 0x0
L8003c850:
  lb $v0, 1148($gp)
L8003c854:
  sll $zero, $zero, 0x0
L8003c858:
  beq $v0, $zero, L8003c898
L8003c85c:
  sll $zero, $zero, 0x0
L8003c860:
  lui $v0, 0x800a
L8003c864:
  lhu $v0, -19560($v0)
L8003c868:
  sll $zero, $zero, 0x0
L8003c86c:
  andi $v0, $v0, 0xc0
L8003c870:
  beq $v0, $zero, L8003c898
L8003c874:
  sll $zero, $zero, 0x0
L8003c878:
  jal L8003fee0
L8003c87c:
  addiu $a0, $zero, 7
L8003c880:
  lbu $v0, 1148($gp)
L8003c884:
  sll $zero, $zero, 0x0
L8003c888:
  addiu $v0, $v0, 1
L8003c88c:
  sb $v0, 1140($gp)
L8003c890:
  j L8003c8bc
L8003c894:
  sll $zero, $zero, 0x0
L8003c898:
  lui $v0, 0x800a
L8003c89c:
  lhu $v0, -19560($v0)
L8003c8a0:
  sll $zero, $zero, 0x0
L8003c8a4:
  andi $v0, $v0, 0x20
L8003c8a8:
  beq $v0, $zero, L8003c8bc
L8003c8ac:
  sll $zero, $zero, 0x0
L8003c8b0:
  sb $zero, 1140($gp)
L8003c8b4:
  jal L8003fee0
L8003c8b8:
  addiu $a0, $zero, 8
L8003c8bc:
  lw $ra, 16($sp)
L8003c8c0:
  sll $zero, $zero, 0x0
L8003c8c4:
  jr $ra
L8003c8c8:
  addiu $sp, $sp, 24
L8003c8cc:
  addiu $sp, $sp, -24
L8003c8d0:
  lbu $v0, 1140($gp)
L8003c8d4:
  addiu $a0, $zero, 1
L8003c8d8:
  andi $v1, $v0, 0xf
L8003c8dc:
  beq $v1, $a0, L8003c928
L8003c8e0:
  sw $ra, 16($sp)
L8003c8e4:
  slti $v0, $v1, 2
L8003c8e8:
  beq $v0, $zero, L8003c900
L8003c8ec:
  addiu $v0, $zero, 2
L8003c8f0:
  beq $v1, $zero, L8003c918
L8003c8f4:
  sll $zero, $zero, 0x0
L8003c8f8:
  j L8003c93c
L8003c8fc:
  sll $zero, $zero, 0x0
L8003c900:
  beq $v1, $v0, L8003c93c
L8003c904:
  addiu $v0, $zero, 3
L8003c908:
  beq $v1, $v0, L8003c938
L8003c90c:
  sll $zero, $zero, 0x0
L8003c910:
  j L8003c93c
L8003c914:
  sll $zero, $zero, 0x0
L8003c918:
  jal 0x80015b00
L8003c91c:
  sll $zero, $zero, 0x0
L8003c920:
  j L8003c93c
L8003c924:
  sll $zero, $zero, 0x0
L8003c928:
  jal L8003c7a0
L8003c92c:
  sll $zero, $zero, 0x0
L8003c930:
  j L8003c93c
L8003c934:
  sll $zero, $zero, 0x0
L8003c938:
  sb $a0, 1140($gp)
L8003c93c:
  lbu $v0, 1140($gp)
L8003c940:
  lw $ra, 16($sp)
L8003c944:
  sll $zero, $zero, 0x0
L8003c948:
  jr $ra
L8003c94c:
  addiu $sp, $sp, 24
L8003c950:
  addiu $sp, $sp, -48
L8003c954:
  sw $ra, 44($sp)
L8003c958:
  jal 0x8004002c
L8003c95c:
  sw $s0, 40($sp)
L8003c960:
  addu $a0, $v0, $zero
L8003c964:
  jal 0x800400ac
L8003c968:
  addiu $a1, $zero, 3
L8003c96c:
  addu $s0, $v0, $zero
L8003c970:
  addu $a0, $s0, $zero
L8003c974:
  addu $a1, $zero, $zero
L8003c978:
  addu $a2, $a1, $zero
L8003c97c:
  addiu $a3, $zero, 320
L8003c980:
  addiu $v1, $zero, 240
L8003c984:
  addiu $v0, $zero, 16
L8003c988:
  sw $v1, 16($sp)
L8003c98c:
  sw $zero, 20($sp)
L8003c990:
  sw $zero, 24($sp)
L8003c994:
  sw $v0, 28($sp)
L8003c998:
  sw $zero, 32($sp)
L8003c99c:
  jal 0x80040510
L8003c9a0:
  sw $v1, 36($sp)
L8003c9a4:
  lw $v0, 4($s0)
L8003c9a8:
  lui $v1, 0x100
L8003c9ac:
  or $v0, $v0, $v1
L8003c9b0:
  jal 0x8004002c
L8003c9b4:
  sw $v0, 4($s0)
L8003c9b8:
  addu $a0, $v0, $zero
L8003c9bc:
  jal 0x800400ac
L8003c9c0:
  addiu $a1, $zero, 2
L8003c9c4:
  addu $s0, $v0, $zero
L8003c9c8:
  addu $a0, $s0, $zero
L8003c9cc:
  addiu $a1, $zero, 448
L8003c9d0:
  addiu $a2, $zero, 192
L8003c9d4:
  addu $a3, $zero, $zero
L8003c9d8:
  addiu $v0, $zero, 18
L8003c9dc:
  sw $v0, 24($sp)
L8003c9e0:
  addiu $v0, $zero, 1
L8003c9e4:
  sw $v0, 28($sp)
L8003c9e8:
  lui $v0, 0x801b
L8003c9ec:
  addiu $v0, $v0, -4096
L8003c9f0:
  sw $zero, 16($sp)
L8003c9f4:
  sw $zero, 20($sp)
L8003c9f8:
  jal 0x800428a8
L8003c9fc:
  sw $v0, 32($sp)
L8003ca00:
  addu $a0, $s0, $zero
L8003ca04:
  addiu $a1, $zero, 4
L8003ca08:
  addiu $v0, $zero, 128
L8003ca0c:
  jal 0x800428ec
L8003ca10:
  sb $v0, 94($s0)
L8003ca14:
  lhu $v0, 8($s0)
L8003ca18:
  addu $a0, $s0, $zero
L8003ca1c:
  sb $zero, 108($s0)
L8003ca20:
  ori $v0, $v0, 0x28
L8003ca24:
  jal 0x800429d8
L8003ca28:
  sh $v0, 8($s0)
L8003ca2c:
  sw $s0, 1136($gp)
L8003ca30:
  jal L8003ff08
L8003ca34:
  addiu $a0, $zero, 29440
L8003ca38:
  jal 0x800157dc
L8003ca3c:
  sll $zero, $zero, 0x0
L8003ca40:
  lui $v1, 0x800f
L8003ca44:
  lw $ra, 44($sp)
L8003ca48:
  lw $s0, 40($sp)
L8003ca4c:
  addiu $v0, $zero, 2
L8003ca50:
  sb $v0, -24881($v1)
L8003ca54:
  jr $ra
L8003ca58:
  addiu $sp, $sp, 48
L8003ca5c:
  addiu $sp, $sp, -32
L8003ca60:
  sw $s0, 16($sp)
L8003ca64:
  lw $s0, 1136($gp)
L8003ca68:
  sw $ra, 24($sp)
L8003ca6c:
  sw $s1, 20($sp)
L8003ca70:
  jal 0x80042a00
L8003ca74:
  addu $a0, $s0, $zero
L8003ca78:
  lh $v0, 90($s0)
L8003ca7c:
  sll $zero, $zero, 0x0
L8003ca80:
  bne $v0, $zero, L8003cb38
L8003ca84:
  lui $v0, 0x800f
L8003ca88:
  lbu $v1, 108($s0)
L8003ca8c:
  addiu $s1, $zero, 1
L8003ca90:
  beq $v1, $s1, L8003cadc
L8003ca94:
  slti $v0, $v1, 2
L8003ca98:
  beq $v0, $zero, L8003cab0
L8003ca9c:
  addiu $v0, $zero, 2
L8003caa0:
  beq $v1, $zero, L8003cac0
L8003caa4:
  lui $v0, 0x800f
L8003caa8:
  j L8003cb38
L8003caac:
  sll $zero, $zero, 0x0
L8003cab0:
  beq $v1, $v0, L8003cafc
L8003cab4:
  lui $v0, 0x800f
L8003cab8:
  j L8003cb38
L8003cabc:
  sll $zero, $zero, 0x0
L8003cac0:
  addu $a0, $s0, $zero
L8003cac4:
  jal 0x80040410
L8003cac8:
  addiu $a1, $zero, 1
L8003cacc:
  addiu $v0, $zero, -192
L8003cad0:
  sb $s1, 108($s0)
L8003cad4:
  j L8003cb34
L8003cad8:
  sh $v0, 54($s0)
L8003cadc:
  jal 0x800429d8
L8003cae0:
  addu $a0, $s0, $zero
L8003cae4:
  addu $a0, $s0, $zero
L8003cae8:
  jal 0x80040410
L8003caec:
  addiu $a1, $zero, 2
L8003caf0:
  addiu $v0, $zero, 2
L8003caf4:
  j L8003cb34
L8003caf8:
  sb $v0, 108($s0)
L8003cafc:
  addu $a0, $s0, $zero
L8003cb00:
  jal 0x80040410
L8003cb04:
  addu $a1, $zero, $zero
L8003cb08:
  lh $v0, 48($s0)
L8003cb0c:
  sll $zero, $zero, 0x0
L8003cb10:
  slti $v0, $v0, -47
L8003cb14:
  beq $v0, $zero, L8003cb34
L8003cb18:
  sb $zero, 108($s0)
L8003cb1c:
  addiu $a0, $zero, 176
L8003cb20:
  addiu $v0, $zero, 352
L8003cb24:
  jal L800358fc
L8003cb28:
  sh $v0, 48($s0)
L8003cb2c:
  addiu $v0, $v0, 48
L8003cb30:
  sh $v0, 50($s0)
L8003cb34:
  lui $v0, 0x800f
L8003cb38:
  lbu $v0, -24882($v0)
L8003cb3c:
  sll $zero, $zero, 0x0
L8003cb40:
  andi $v0, $v0, 0x80
L8003cb44:
  bne $v0, $zero, L8003cb68
L8003cb48:
  addiu $v0, $zero, 1
L8003cb4c:
  lui $v1, 0x800a
L8003cb50:
  lhu $v1, -19560($v1)
L8003cb54:
  sll $zero, $zero, 0x0
L8003cb58:
  andi $v1, $v1, 0xe0
L8003cb5c:
  bne $v1, $zero, L8003cb68
L8003cb60:
  addu $v0, $zero, $zero
L8003cb64:
  addiu $v0, $zero, 1
L8003cb68:
  lw $ra, 24($sp)
L8003cb6c:
  lw $s1, 20($sp)
L8003cb70:
  lw $s0, 16($sp)
L8003cb74:
  jr $ra
L8003cb78:
  addiu $sp, $sp, 32
L8003cb7c:
  addiu $v1, $zero, 1
L8003cb80:
  addiu $a2, $gp, 1182
L8003cb84:
  addiu $a1, $gp, 1170
L8003cb88:
  addiu $a0, $gp, 1166
L8003cb8c:
  sh $zero, 0($a0)
L8003cb90:
  lhu $v0, 0($a0)
L8003cb94:
  addiu $a0, $a0, -2
L8003cb98:
  addiu $v1, $v1, -1
L8003cb9c:
  sh $v0, 0($a1)
L8003cba0:
  lhu $v0, 0($a1)
L8003cba4:
  addiu $a1, $a1, -2
L8003cba8:
  sh $v0, 0($a2)
L8003cbac:
  bgez $v1, L8003cb8c
L8003cbb0:
  addiu $a2, $a2, -2
L8003cbb4:
  addiu $v1, $zero, 31
L8003cbb8:
  lui $v0, 0x800f
L8003cbbc:
  addiu $a0, $v0, -2384
L8003cbc0:
  addu $v0, $v1, $a0
L8003cbc4:
  addiu $v1, $v1, -1
L8003cbc8:
  bgez $v1, L8003cbc0
L8003cbcc:
  sb $zero, 0($v0)
L8003cbd0:
  sw $zero, 1160($gp)
L8003cbd4:
  sw $zero, 1192($gp)
L8003cbd8:
  sw $zero, 1196($gp)
L8003cbdc:
  sw $zero, 1184($gp)
L8003cbe0:
  jr $ra
L8003cbe4:
  sll $zero, $zero, 0x0
L8003cbe8:
  addiu $sp, $sp, -24
L8003cbec:
  lui $a0, 0x800f
L8003cbf0:
  addiu $a0, $a0, -2456
L8003cbf4:
  addiu $a1, $zero, 34
L8003cbf8:
  addu $a2, $a0, $a1
L8003cbfc:
  sw $ra, 16($sp)
L8003cc00:
  jal 0x80073e1c
L8003cc04:
  addu $a3, $a1, $zero
L8003cc08:
  jal 0x80073eac
L8003cc0c:
  sll $zero, $zero, 0x0
L8003cc10:
  addiu $v0, $zero, 24
L8003cc14:
  sb $v0, 1172($gp)
L8003cc18:
  addiu $v0, $zero, 20
L8003cc1c:
  sb $v0, 1178($gp)
L8003cc20:
  jal L8003cb7c
L8003cc24:
  sll $zero, $zero, 0x0
L8003cc28:
  lw $ra, 16($sp)
L8003cc2c:
  sll $zero, $zero, 0x0
L8003cc30:
  jr $ra
L8003cc34:
  addiu $sp, $sp, 24
L8003cc38:
  lui $v0, 0x800f
L8003cc3c:
  lbu $v1, -2456($v0)
L8003cc40:
  sll $zero, $zero, 0x0
L8003cc44:
  bne $v1, $zero, L8003cc84
L8003cc48:
  addiu $a0, $v0, -2456
L8003cc4c:
  lbu $v0, 1($a0)
L8003cc50:
  sll $zero, $zero, 0x0
L8003cc54:
  andi $v0, $v0, 0xf
L8003cc58:
  beq $v0, $zero, L8003cc84
L8003cc5c:
  lui $v0, 0x800f
L8003cc60:
  lbu $v0, 2($a0)
L8003cc64:
  lbu $v1, 3($a0)
L8003cc68:
  sll $v0, $v0, 0x8
L8003cc6c:
  or $v0, $v0, $v1
L8003cc70:
  lw $v1, 1184($gp)
L8003cc74:
  xori $v0, $v0, 0xffff
L8003cc78:
  or $v1, $v1, $v0
L8003cc7c:
  sw $v1, 1184($gp)
L8003cc80:
  lui $v0, 0x800f
L8003cc84:
  addiu $v1, $v0, -2456
L8003cc88:
  lbu $v0, 34($v1)
L8003cc8c:
  sll $zero, $zero, 0x0
L8003cc90:
  bne $v0, $zero, L8003ccd0
L8003cc94:
  sll $zero, $zero, 0x0
L8003cc98:
  lbu $v0, 35($v1)
L8003cc9c:
  sll $zero, $zero, 0x0
L8003cca0:
  andi $v0, $v0, 0xf
L8003cca4:
  beq $v0, $zero, L8003ccd0
L8003cca8:
  sll $zero, $zero, 0x0
L8003ccac:
  lbu $v0, 36($v1)
L8003ccb0:
  lbu $v1, 37($v1)
L8003ccb4:
  sll $v0, $v0, 0x8
L8003ccb8:
  or $v0, $v0, $v1
L8003ccbc:
  xori $v0, $v0, 0xffff
L8003ccc0:
  lw $v1, 1184($gp)
L8003ccc4:
  sll $v0, $v0, 0x10
L8003ccc8:
  or $v1, $v1, $v0
L8003cccc:
  sw $v1, 1184($gp)
L8003ccd0:
  jr $ra
L8003ccd4:
  sll $zero, $zero, 0x0
L8003ccd8:
  addu $a1, $zero, $zero
L8003ccdc:
  addiu $t0, $zero, 31
L8003cce0:
  lui $v0, 0x800f
L8003cce4:
  addiu $v0, $v0, -2384
L8003cce8:
  addu $a0, $v0, $t0
L8003ccec:
  lw $t2, 1184($gp)
L8003ccf0:
  lw $v0, 1160($gp)
L8003ccf4:
  lui $t3, 0x8000
L8003ccf8:
  sw $zero, 1184($gp)
L8003ccfc:
  addu $a3, $t2, $zero
L8003cd00:
  xor $v0, $v0, $t2
L8003cd04:
  and $t1, $v0, $t2
L8003cd08:
  addu $a2, $t1, $zero
L8003cd0c:
  sw $t2, 1160($gp)
L8003cd10:
  and $v0, $a3, $t3
L8003cd14:
  beq $v0, $zero, L8003cd68
L8003cd18:
  sll $a1, $a1, 0x1
L8003cd1c:
  and $v0, $a2, $t3
L8003cd20:
  beq $v0, $zero, L8003cd2c
L8003cd24:
  sll $zero, $zero, 0x0
L8003cd28:
  ori $a1, $a1, 0x1
L8003cd2c:
  lbu $v0, 0($a0)
L8003cd30:
  lui $v1, 0x800a
L8003cd34:
  lbu $v1, -20264($v1)
L8003cd38:
  sll $zero, $zero, 0x0
L8003cd3c:
  addu $v0, $v0, $v1
L8003cd40:
  sb $v0, 0($a0)
L8003cd44:
  lbu $v1, 1172($gp)
L8003cd48:
  andi $v0, $v0, 0xff
L8003cd4c:
  sltu $v0, $v0, $v1
L8003cd50:
  bne $v0, $zero, L8003cd6c
L8003cd54:
  sll $zero, $zero, 0x0
L8003cd58:
  lbu $v0, 1178($gp)
L8003cd5c:
  ori $a1, $a1, 0x1
L8003cd60:
  j L8003cd6c
L8003cd64:
  sb $v0, 0($a0)
L8003cd68:
  sb $zero, 0($a0)
L8003cd6c:
  sll $a3, $a3, 0x1
L8003cd70:
  sll $a2, $a2, 0x1
L8003cd74:
  addiu $t0, $t0, -1
L8003cd78:
  bgez $t0, L8003cd10
L8003cd7c:
  addiu $a0, $a0, -1
L8003cd80:
  lui $v0, 0x800a
L8003cd84:
  lw $v0, -20280($v0)
L8003cd88:
  sll $zero, $zero, 0x0
L8003cd8c:
  beq $v0, $zero, L8003cdb4
L8003cd90:
  sll $zero, $zero, 0x0
L8003cd94:
  lw $v0, 1192($gp)
L8003cd98:
  lw $v1, 1196($gp)
L8003cd9c:
  or $v0, $v0, $a1
L8003cda0:
  or $v1, $v1, $t1
L8003cda4:
  sw $v0, 1192($gp)
L8003cda8:
  sw $v1, 1196($gp)
L8003cdac:
  j L8003cdd0
L8003cdb0:
  srl $v0, $t2, 0x10
L8003cdb4:
  lw $v0, 1196($gp)
L8003cdb8:
  lw $v1, 1192($gp)
L8003cdbc:
  sw $zero, 1192($gp)
L8003cdc0:
  sw $zero, 1196($gp)
L8003cdc4:
  or $t1, $t1, $v0
L8003cdc8:
  or $a1, $a1, $v1
L8003cdcc:
  srl $v0, $t2, 0x10
L8003cdd0:
  sh $t2, 1180($gp)
L8003cdd4:
  sh $v0, 1182($gp)
L8003cdd8:
  srl $v0, $t1, 0x10
L8003cddc:
  sh $t1, 1168($gp)
L8003cde0:
  sh $v0, 1170($gp)
L8003cde4:
  srl $v0, $a1, 0x10
L8003cde8:
  sh $a1, 1164($gp)
L8003cdec:
  sh $v0, 1166($gp)
L8003cdf0:
  jr $ra
L8003cdf4:
  sll $zero, $zero, 0x0
L8003cdf8:
  lhu $v0, 1180($gp)
L8003cdfc:
  sll $zero, $zero, 0x0
L8003ce00:
  sh $v0, 1188($gp)
L8003ce04:
  lhu $v0, 1168($gp)
L8003ce08:
  sll $zero, $zero, 0x0
L8003ce0c:
  sh $v0, 1176($gp)
L8003ce10:
  lhu $v0, 1164($gp)
L8003ce14:
  sll $zero, $zero, 0x0
L8003ce18:
  sh $v0, 1174($gp)
L8003ce1c:
  lhu $v0, 1182($gp)
L8003ce20:
  sll $zero, $zero, 0x0
L8003ce24:
  sh $v0, 1180($gp)
L8003ce28:
  lhu $v0, 1170($gp)
L8003ce2c:
  sll $zero, $zero, 0x0
L8003ce30:
  sh $v0, 1168($gp)
L8003ce34:
  lhu $v0, 1166($gp)
L8003ce38:
  sll $zero, $zero, 0x0
L8003ce3c:
  sh $v0, 1164($gp)
L8003ce40:
  jr $ra
L8003ce44:
  sll $zero, $zero, 0x0
L8003ce48:
  lhu $v0, 1188($gp)
L8003ce4c:
  sll $zero, $zero, 0x0
L8003ce50:
  sh $v0, 1180($gp)
L8003ce54:
  lhu $v0, 1176($gp)
L8003ce58:
  sll $zero, $zero, 0x0
L8003ce5c:
  sh $v0, 1168($gp)
L8003ce60:
  lhu $v0, 1174($gp)
L8003ce64:
  sll $zero, $zero, 0x0
L8003ce68:
  sh $v0, 1164($gp)
L8003ce6c:
  jr $ra
L8003ce70:
  sll $zero, $zero, 0x0
L8003ce74:
  addiu $a2, $gp, 92
L8003ce78:
  lw $a1, 4($a2)
L8003ce7c:
  lw $v1, 92($gp)
L8003ce80:
  sll $v0, $a1, 0x1f
L8003ce84:
  srl $a0, $v1, 0x1
L8003ce88:
  or $v0, $v0, $a0
L8003ce8c:
  sll $a0, $v1, 0xc
L8003ce90:
  xor $v0, $v0, $a0
L8003ce94:
  andi $v1, $v1, 0x1
L8003ce98:
  addu $v1, $a1, $v1
L8003ce9c:
  addu $a1, $a1, $v1
L8003cea0:
  srl $v1, $v0, 0x14
L8003cea4:
  xor $v0, $v0, $v1
L8003cea8:
  sw $a1, 4($a2)
L8003ceac:
  sw $v0, 92($gp)
L8003ceb0:
  jr $ra
L8003ceb4:
  sll $zero, $zero, 0x0
L8003ceb8:
  addu $v1, $zero, $zero
L8003cebc:
  blez $a1, L8003cf0c
L8003cec0:
  addu $a3, $zero, $zero
L8003cec4:
  addu $v0, $a0, $a3
L8003cec8:
  lbu $v0, 0($v0)
L8003cecc:
  addiu $a2, $zero, 7
L8003ced0:
  sll $v0, $v0, 0x8
L8003ced4:
  xor $v1, $v1, $v0
L8003ced8:
  andi $v0, $v1, 0x8000
L8003cedc:
  beq $v0, $zero, L8003ceec
L8003cee0:
  sll $v0, $v1, 0x1
L8003cee4:
  j L8003cef0
L8003cee8:
  xori $v1, $v0, 0x1021
L8003ceec:
  sll $v1, $v1, 0x1
L8003cef0:
  addiu $a2, $a2, -1
L8003cef4:
  bgez $a2, L8003cedc
L8003cef8:
  andi $v0, $v1, 0x8000
L8003cefc:
  addiu $a3, $a3, 1
L8003cf00:
  slt $v0, $a3, $a1
L8003cf04:
  bne $v0, $zero, L8003cec8
L8003cf08:
  addu $v0, $a0, $a3
L8003cf0c:
  jr $ra
L8003cf10:
  andi $v0, $v1, 0xffff
L8003cf14:
  addiu $sp, $sp, -32
L8003cf18:
  sw $s2, 24($sp)
L8003cf1c:
  addu $s2, $a0, $zero
L8003cf20:
  addiu $a1, $zero, 832
L8003cf24:
  sw $ra, 28($sp)
L8003cf28:
  sw $s1, 20($sp)
L8003cf2c:
  jal L8003ceb8
L8003cf30:
  sw $s0, 16($sp)
L8003cf34:
  andi $v1, $v0, 0xffff
L8003cf38:
  addiu $s1, $s2, 888
L8003cf3c:
  addiu $s0, $zero, 15
L8003cf40:
  sh $v0, 894($s2)
L8003cf44:
  sh $v0, 892($s2)
L8003cf48:
  sll $v0, $v1, 0x10
L8003cf4c:
  or $v0, $v1, $v0
L8003cf50:
  sw $v0, 96($gp)
L8003cf54:
  sw $v0, 92($gp)
L8003cf58:
  jal L8003ce74
L8003cf5c:
  addiu $s0, $s0, -1
L8003cf60:
  sw $v0, 0($s1)
L8003cf64:
  bne $s0, $zero, L8003cf58
L8003cf68:
  addiu $s1, $s1, -4
L8003cf6c:
  addiu $a0, $s2, 896
L8003cf70:
  jal L8003ceb8
L8003cf74:
  addiu $a1, $zero, 108
L8003cf78:
  andi $v1, $v0, 0xffff
L8003cf7c:
  addiu $s1, $s2, 1016
L8003cf80:
  addiu $s0, $zero, 4
L8003cf84:
  sh $v0, 1022($s2)
L8003cf88:
  sh $v0, 1020($s2)
L8003cf8c:
  sll $v0, $v1, 0x10
L8003cf90:
  or $v0, $v1, $v0
L8003cf94:
  sw $v0, 96($gp)
L8003cf98:
  sw $v0, 92($gp)
L8003cf9c:
  jal L8003ce74
L8003cfa0:
  addiu $s0, $s0, -1
L8003cfa4:
  sw $v0, 0($s1)
L8003cfa8:
  bne $s0, $zero, L8003cf9c
L8003cfac:
  addiu $s1, $s1, -4
L8003cfb0:
  lw $ra, 28($sp)
L8003cfb4:
  lw $s2, 24($sp)
L8003cfb8:
  lw $s1, 20($sp)
L8003cfbc:
  lw $s0, 16($sp)
L8003cfc0:
  jr $ra
L8003cfc4:
  addiu $sp, $sp, 32
L8003cfc8:
  addiu $sp, $sp, -32
L8003cfcc:
  sw $s0, 16($sp)
L8003cfd0:
  addu $s0, $a0, $zero
L8003cfd4:
  addiu $a0, $s0, 1024
L8003cfd8:
  addiu $a1, $zero, 516
L8003cfdc:
  sw $ra, 28($sp)
L8003cfe0:
  sw $s2, 24($sp)
L8003cfe4:
  jal L8003ceb8
L8003cfe8:
  sw $s1, 20($sp)
L8003cfec:
  addiu $s2, $s0, 1572
L8003cff0:
  addiu $s1, $zero, 8
L8003cff4:
  sh $v0, 1542($s0)
L8003cff8:
  sh $v0, 1540($s0)
L8003cffc:
  andi $v0, $v0, 0xffff
L8003d000:
  sll $v1, $v0, 0x10
L8003d004:
  or $v0, $v0, $v1
L8003d008:
  sw $v0, 96($gp)
L8003d00c:
  sw $v0, 92($gp)
L8003d010:
  jal L8003ce74
L8003d014:
  addiu $s1, $s1, -1
L8003d018:
  sw $v0, 0($s2)
L8003d01c:
  bne $s1, $zero, L8003d010
L8003d020:
  addiu $s2, $s2, -4
L8003d024:
  lw $ra, 28($sp)
L8003d028:
  lw $s2, 24($sp)
L8003d02c:
  lw $s1, 20($sp)
L8003d030:
  lw $s0, 16($sp)
L8003d034:
  jr $ra
L8003d038:
  addiu $sp, $sp, 32
L8003d03c:
  addiu $sp, $sp, -32
L8003d040:
  sw $s1, 20($sp)
L8003d044:
  addu $s1, $a0, $zero
L8003d048:
  lui $a1, 0x801d
L8003d04c:
  addiu $a1, $a1, 16384
L8003d050:
  addiu $a2, $zero, 512
L8003d054:
  sw $ra, 24($sp)
L8003d058:
  jal L800356a0
L8003d05c:
  sw $s0, 16($sp)
L8003d060:
  lui $v0, 0x800a
L8003d064:
  lw $v0, -20284($v0)
L8003d068:
  lui $v1, 0x800a
L8003d06c:
  lb $v1, -19448($v1)
L8003d070:
  sw $zero, 1536($s1)
L8003d074:
  bgez $v1, L8003d084
L8003d078:
  sw $v0, 1544($s1)
L8003d07c:
  lui $at, 0x800a
L8003d080:
  sb $zero, -19448($at)
L8003d084:
  lui $v0, 0x800a
L8003d088:
  lbu $v0, -19448($v0)
L8003d08c:
  addiu $s0, $s1, 512
L8003d090:
  sb $v0, 2014($s1)
L8003d094:
  lw $v0, 1200($gp)
L8003d098:
  addu $a0, $s0, $zero
L8003d09c:
  addiu $v0, $v0, 1
L8003d0a0:
  sw $v0, 1540($s1)
L8003d0a4:
  jal L8003cf14
L8003d0a8:
  sw $v0, 3204($s1)
L8003d0ac:
  jal L8003cfc8
L8003d0b0:
  addu $a0, $s0, $zero
L8003d0b4:
  addu $v1, $zero, $zero
L8003d0b8:
  addu $v0, $s1, $v1
L8003d0bc:
  sb $zero, 2088($v0)
L8003d0c0:
  addiu $v1, $v1, 1
L8003d0c4:
  sltiu $v0, $v1, 88
L8003d0c8:
  bne $v0, $zero, L8003d0bc
L8003d0cc:
  addu $v0, $s1, $v1
L8003d0d0:
  addiu $a0, $s1, 2176
L8003d0d4:
  addiu $a1, $s1, 512
L8003d0d8:
  jal L800356a0
L8003d0dc:
  addiu $a2, $zero, 1664
L8003d0e0:
  lw $ra, 24($sp)
L8003d0e4:
  lw $s1, 20($sp)
L8003d0e8:
  lw $s0, 16($sp)
L8003d0ec:
  jr $ra
L8003d0f0:
  addiu $sp, $sp, 32
L8003d0f4:
  addiu $sp, $sp, -24
L8003d0f8:
  sw $s0, 16($sp)
L8003d0fc:
  addu $s0, $a0, $zero
L8003d100:
  lui $a0, 0x801b
L8003d104:
  addiu $a0, $a0, 4698
L8003d108:
  addiu $a1, $s0, 1036
L8003d10c:
  sw $ra, 20($sp)
L8003d110:
  jal L8003bc40
L8003d114:
  addiu $a2, $zero, 6
L8003d118:
  lw $v0, 1032($s0)
L8003d11c:
  lw $v1, 1028($s0)
L8003d120:
  lui $at, 0x800a
L8003d124:
  sw $v0, -20284($at)
L8003d128:
  sw $v1, 1200($gp)
L8003d12c:
  lbu $v0, 1500($s0)
L8003d130:
  lui $v1, 0x800a
L8003d134:
  lb $v1, -19448($v1)
L8003d138:
  lui $at, 0x800a
L8003d13c:
  sb $v0, -19846($at)
L8003d140:
  bgez $v1, L8003d164
L8003d144:
  sll $zero, $zero, 0x0
L8003d148:
  lbu $v0, 1502($s0)
L8003d14c:
  sll $zero, $zero, 0x0
L8003d150:
  sll $a0, $v0, 0x18
L8003d154:
  lui $at, 0x800a
L8003d158:
  sb $v0, -19448($at)
L8003d15c:
  jal 0x80046fa0
L8003d160:
  sra $a0, $a0, 0x18
L8003d164:
  lw $ra, 20($sp)
L8003d168:
  lw $s0, 16($sp)
L8003d16c:
  jr $ra
L8003d170:
  addiu $sp, $sp, 24
L8003d174:
  addiu $sp, $sp, -32
L8003d178:
  sw $s2, 24($sp)
L8003d17c:
  addu $s2, $a0, $zero
L8003d180:
  addiu $a1, $zero, 832
L8003d184:
  sw $ra, 28($sp)
L8003d188:
  sw $s1, 20($sp)
L8003d18c:
  jal L8003ceb8
L8003d190:
  sw $s0, 16($sp)
L8003d194:
  andi $v1, $v0, 0xffff
L8003d198:
  addiu $s1, $s2, 888
L8003d19c:
  addiu $s0, $zero, 15
L8003d1a0:
  sll $v0, $v1, 0x10
L8003d1a4:
  or $v0, $v1, $v0
L8003d1a8:
  sw $v0, 96($gp)
L8003d1ac:
  sw $v0, 92($gp)
L8003d1b0:
  jal L8003ce74
L8003d1b4:
  sll $zero, $zero, 0x0
L8003d1b8:
  lw $v1, 0($s1)
L8003d1bc:
  sll $zero, $zero, 0x0
L8003d1c0:
  bne $v1, $v0, L8003d270
L8003d1c4:
  addu $v0, $zero, $zero
L8003d1c8:
  addiu $s0, $s0, -1
L8003d1cc:
  bne $s0, $zero, L8003d1b0
L8003d1d0:
  addiu $s1, $s1, -4
L8003d1d4:
  addiu $a0, $s2, 896
L8003d1d8:
  jal L8003ceb8
L8003d1dc:
  addiu $a1, $zero, 108
L8003d1e0:
  andi $v1, $v0, 0xffff
L8003d1e4:
  addiu $s1, $s2, 1016
L8003d1e8:
  addiu $s0, $zero, 4
L8003d1ec:
  sll $v0, $v1, 0x10
L8003d1f0:
  or $v0, $v1, $v0
L8003d1f4:
  sw $v0, 96($gp)
L8003d1f8:
  sw $v0, 92($gp)
L8003d1fc:
  jal L8003ce74
L8003d200:
  sll $zero, $zero, 0x0
L8003d204:
  lw $v1, 0($s1)
L8003d208:
  sll $zero, $zero, 0x0
L8003d20c:
  bne $v1, $v0, L8003d270
L8003d210:
  addu $v0, $zero, $zero
L8003d214:
  addiu $s0, $s0, -1
L8003d218:
  bne $s0, $zero, L8003d1fc
L8003d21c:
  addiu $s1, $s1, -4
L8003d220:
  addiu $a0, $s2, 1024
L8003d224:
  jal L8003ceb8
L8003d228:
  addiu $a1, $zero, 516
L8003d22c:
  andi $v1, $v0, 0xffff
L8003d230:
  addiu $s1, $s2, 1572
L8003d234:
  addiu $s0, $zero, 8
L8003d238:
  sll $v0, $v1, 0x10
L8003d23c:
  or $v0, $v1, $v0
L8003d240:
  sw $v0, 96($gp)
L8003d244:
  sw $v0, 92($gp)
L8003d248:
  jal L8003ce74
L8003d24c:
  sll $zero, $zero, 0x0
L8003d250:
  lw $v1, 0($s1)
L8003d254:
  sll $zero, $zero, 0x0
L8003d258:
  bne $v1, $v0, L8003d270
L8003d25c:
  addu $v0, $zero, $zero
L8003d260:
  addiu $s0, $s0, -1
L8003d264:
  bne $s0, $zero, L8003d248
L8003d268:
  addiu $s1, $s1, -4
L8003d26c:
  addiu $v0, $zero, 1
L8003d270:
  lw $ra, 28($sp)
L8003d274:
  lw $s2, 24($sp)
L8003d278:
  lw $s1, 20($sp)
L8003d27c:
  lw $s0, 16($sp)
L8003d280:
  jr $ra
L8003d284:
  addiu $sp, $sp, 32
L8003d288:
  lw $v1, 820($a0)
L8003d28c:
  lw $v0, 820($a1)
L8003d290:
  sll $zero, $zero, 0x0
L8003d294:
  bne $v1, $v0, L8003d2b0
L8003d298:
  addiu $v0, $zero, 5
L8003d29c:
  addiu $v0, $v0, -1
L8003d2a0:
  bgez $v0, L8003d2a0
L8003d2a4:
  addiu $v0, $v0, -1
L8003d2a8:
  jr $ra
L8003d2ac:
  addiu $v0, $zero, 1
L8003d2b0:
  jr $ra
L8003d2b4:
  addu $v0, $zero, $zero
L8003d2b8:
  addiu $sp, $sp, -24
L8003d2bc:
  sw $s0, 16($sp)
L8003d2c0:
  sw $ra, 20($sp)
L8003d2c4:
  jal L8003d288
L8003d2c8:
  addu $s0, $a1, $zero
L8003d2cc:
  beq $v0, $zero, L8003d2ec
L8003d2d0:
  sll $zero, $zero, 0x0
L8003d2d4:
  lw $v0, 1200($gp)
L8003d2d8:
  lw $v1, 1028($s0)
L8003d2dc:
  sll $zero, $zero, 0x0
L8003d2e0:
  xor $v0, $v0, $v1
L8003d2e4:
  j L8003d2f0
L8003d2e8:
  sltiu $v0, $v0, 1
L8003d2ec:
  addu $v0, $zero, $zero
L8003d2f0:
  lw $ra, 20($sp)
L8003d2f4:
  lw $s0, 16($sp)
L8003d2f8:
  jr $ra
L8003d2fc:
  addiu $sp, $sp, 24
L8003d300:
  lui $v0, 0x800f
L8003d304:
  addiu $v1, $zero, 1
L8003d308:
  sb $v1, -2336($v0)
L8003d30c:
  ori $v0, $zero, 0x8000
L8003d310:
  sb $zero, 1223($gp)
L8003d314:
  sb $zero, 1209($gp)
L8003d318:
  sh $v0, 1220($gp)
L8003d31c:
  sb $zero, 1237($gp)
L8003d320:
  sb $a0, 1215($gp)
L8003d324:
  jr $ra
L8003d328:
  sll $zero, $zero, 0x0
L8003d32c:
  jr $ra
L8003d330:
  sll $zero, $zero, 0x0
L8003d334:
  addiu $sp, $sp, -48
L8003d338:
  sw $s5, 36($sp)
L8003d33c:
  addu $s5, $a1, $zero
L8003d340:
  lui $v1, 0x20
L8003d344:
  ori $v1, $v1, 0x20
L8003d348:
  sw $s3, 28($sp)
L8003d34c:
  addu $s3, $zero, $zero
L8003d350:
  sw $s2, 24($sp)
L8003d354:
  addu $s2, $s3, $zero
L8003d358:
  sw $ra, 40($sp)
L8003d35c:
  sw $s4, 32($sp)
L8003d360:
  sw $s1, 20($sp)
L8003d364:
  sw $s0, 16($sp)
L8003d368:
  lw $v0, 4($a0)
L8003d36c:
  lui $s1, 0x1f80
L8003d370:
  sw $v1, 8($s1)
L8003d374:
  sw $v0, 0($s1)
L8003d378:
  lw $v1, 12($a0)
L8003d37c:
  addiu $v0, $zero, 11
L8003d380:
  sh $v0, 12($s1)
L8003d384:
  addiu $v0, $zero, 704
L8003d388:
  sh $v0, 16($s1)
L8003d38c:
  addiu $v0, $zero, 252
L8003d390:
  sh $v0, 18($s1)
L8003d394:
  lh $s4, 20($a0)
L8003d398:
  addiu $v0, $zero, 12336
L8003d39c:
  sh $v0, 14($s1)
L8003d3a0:
  sw $v1, 20($s1)
L8003d3a4:
  addu $s0, $zero, $zero
L8003d3a8:
  sll $v0, $s3, 0x5
L8003d3ac:
  sh $v0, 4($s1)
L8003d3b0:
  addiu $v0, $zero, 48
L8003d3b4:
  sb $v0, 14($s1)
L8003d3b8:
  addiu $v0, $zero, 704
L8003d3bc:
  sh $s2, 6($s1)
L8003d3c0:
  sh $v0, 16($s1)
L8003d3c4:
  addu $a0, $s1, $zero
L8003d3c8:
  addu $a1, $s5, $zero
L8003d3cc:
  jal 0x800849f0
L8003d3d0:
  andi $a2, $s4, 0xffff
L8003d3d4:
  lhu $v0, 4($s1)
L8003d3d8:
  addiu $s0, $s0, 64
L8003d3dc:
  addiu $v0, $v0, 64
L8003d3e0:
  sh $v0, 4($s1)
L8003d3e4:
  slti $v0, $s0, 320
L8003d3e8:
  bne $v0, $zero, L8003d3c8
L8003d3ec:
  addu $a0, $s1, $zero
L8003d3f0:
  addu $s0, $zero, $zero
L8003d3f4:
  xori $v0, $s3, 0x1
L8003d3f8:
  sll $v0, $v0, 0x5
L8003d3fc:
  sh $v0, 4($s1)
L8003d400:
  addiu $v0, $zero, 80
L8003d404:
  sb $v0, 14($s1)
L8003d408:
  addiu $v0, $zero, 720
L8003d40c:
  sh $v0, 16($s1)
L8003d410:
  addu $a1, $s5, $zero
L8003d414:
  jal 0x800849f0
L8003d418:
  andi $a2, $s4, 0xffff
L8003d41c:
  lhu $v0, 4($s1)
L8003d420:
  addiu $s0, $s0, 64
L8003d424:
  addiu $v0, $v0, 64
L8003d428:
  sh $v0, 4($s1)
L8003d42c:
  slti $v0, $s0, 320
L8003d430:
  bne $v0, $zero, L8003d410
L8003d434:
  addu $a0, $s1, $zero
L8003d438:
  addiu $s2, $s2, 32
L8003d43c:
  slti $v0, $s2, 240
L8003d440:
  bne $v0, $zero, L8003d3a4
L8003d444:
  xori $s3, $s3, 0x1
L8003d448:
  lw $ra, 40($sp)
L8003d44c:
  lw $s5, 36($sp)
L8003d450:
  lw $s4, 32($sp)
L8003d454:
  lw $s3, 28($sp)
L8003d458:
  lw $s2, 24($sp)
L8003d45c:
  lw $s1, 20($sp)
L8003d460:
  lw $s0, 16($sp)
L8003d464:
  jr $ra
L8003d468:
  addiu $sp, $sp, 48
L8003d46c:
  addiu $sp, $sp, -40
L8003d470:
  sw $s2, 32($sp)
L8003d474:
  addu $s2, $a0, $zero
L8003d478:
  sw $s0, 24($sp)
L8003d47c:
  addu $s0, $a1, $zero
L8003d480:
  addiu $v0, $zero, -1
L8003d484:
  lui $at, 0x800a
L8003d488:
  sb $v0, -19635($at)
L8003d48c:
  addiu $v0, $zero, 256
L8003d490:
  sw $v0, 16($sp)
L8003d494:
  lui $v0, 0x800f
L8003d498:
  lbu $a0, -2326($v0)
L8003d49c:
  addiu $v0, $zero, 64
L8003d4a0:
  andi $a1, $s2, 0x7fff
L8003d4a4:
  addiu $a2, $zero, 32
L8003d4a8:
  addiu $a3, $zero, 80
L8003d4ac:
  sw $ra, 36($sp)
L8003d4b0:
  sw $s1, 28($sp)
L8003d4b4:
  jal L80035be4
L8003d4b8:
  sw $v0, 20($sp)
L8003d4bc:
  lui $v1, 0x800a
L8003d4c0:
  lbu $v1, -20618($v1)
L8003d4c4:
  addu $s1, $v0, $zero
L8003d4c8:
  addiu $v1, $v1, -1
L8003d4cc:
  beq $s0, $zero, L8003d4e8
L8003d4d0:
  sb $v1, 89($s1)
L8003d4d4:
  lhu $v0, 52($s1)
L8003d4d8:
  sll $zero, $zero, 0x0
L8003d4dc:
  ori $v0, $v0, 0x1008
L8003d4e0:
  j L8003d4fc
L8003d4e4:
  sh $v0, 52($s1)
L8003d4e8:
  andi $v0, $s2, 0x8000
L8003d4ec:
  beq $v0, $zero, L8003d500
L8003d4f0:
  addu $v0, $s1, $zero
L8003d4f4:
  jal L80039a14
L8003d4f8:
  addu $a0, $s1, $zero
L8003d4fc:
  addu $v0, $s1, $zero
L8003d500:
  lw $ra, 36($sp)
L8003d504:
  lw $s2, 32($sp)
L8003d508:
  lw $s1, 28($sp)
L8003d50c:
  lw $s0, 24($sp)
L8003d510:
  jr $ra
L8003d514:
  addiu $sp, $sp, 40
L8003d518:
  lbu $v1, 1209($gp)
L8003d51c:
  addiu $sp, $sp, -32
L8003d520:
  sw $s1, 20($sp)
L8003d524:
  addu $s1, $a0, $zero
L8003d528:
  sw $ra, 24($sp)
L8003d52c:
  andi $v0, $v1, 0x80
L8003d530:
  bne $v0, $zero, L8003d5ac
L8003d534:
  sw $s0, 16($sp)
L8003d538:
  ori $v0, $v1, 0x80
L8003d53c:
  sb $v0, 1209($gp)
L8003d540:
  jal 0x8004002c
L8003d544:
  sll $zero, $zero, 0x0
L8003d548:
  addu $a0, $v0, $zero
L8003d54c:
  jal 0x800400ac
L8003d550:
  addiu $a1, $zero, 6
L8003d554:
  addu $s0, $v0, $zero
L8003d558:
  addu $a0, $s0, $zero
L8003d55c:
  addiu $v0, $zero, 160
L8003d560:
  sh $v0, 48($s0)
L8003d564:
  addiu $v0, $zero, 120
L8003d568:
  sh $v0, 50($s0)
L8003d56c:
  addiu $v0, $zero, 128
L8003d570:
  sh $v0, 72($s0)
L8003d574:
  addiu $v0, $zero, 224
L8003d578:
  jal 0x80042918
L8003d57c:
  sh $v0, 74($s0)
L8003d580:
  lui $a1, 0x800a
L8003d584:
  lbu $a1, -20618($a1)
L8003d588:
  addu $a0, $s0, $zero
L8003d58c:
  addiu $a1, $a1, -3
L8003d590:
  sll $a1, $a1, 0x18
L8003d594:
  jal 0x800428ec
L8003d598:
  sra $a1, $a1, 0x18
L8003d59c:
  lui $v0, 0x8004
L8003d5a0:
  addiu $v0, $v0, 11272
L8003d5a4:
  sw $v0, 76($s0)
L8003d5a8:
  sw $s0, 4($s1)
L8003d5ac:
  lbu $a0, 1209($gp)
L8003d5b0:
  lw $s0, 4($s1)
L8003d5b4:
  andi $v0, $a0, 0x40
L8003d5b8:
  beq $v0, $zero, L8003d5cc
L8003d5bc:
  sll $zero, $zero, 0x0
L8003d5c0:
  sb $zero, 1209($gp)
L8003d5c4:
  j L8003d600
L8003d5c8:
  sll $zero, $zero, 0x0
L8003d5cc:
  lhu $v0, 74($s0)
L8003d5d0:
  lhu $v1, 72($s0)
L8003d5d4:
  addiu $v0, $v0, -8
L8003d5d8:
  addiu $v1, $v1, -8
L8003d5dc:
  sh $v1, 72($s0)
L8003d5e0:
  sll $v1, $v1, 0x10
L8003d5e4:
  bgtz $v1, L8003d600
L8003d5e8:
  sh $v0, 74($s0)
L8003d5ec:
  ori $v0, $a0, 0x40
L8003d5f0:
  sb $v0, 1209($gp)
L8003d5f4:
  addiu $v0, $zero, 64
L8003d5f8:
  sh $zero, 72($s0)
L8003d5fc:
  sh $v0, 74($s0)
L8003d600:
  lw $ra, 24($sp)
L8003d604:
  lw $s1, 20($sp)
L8003d608:
  lw $s0, 16($sp)
L8003d60c:
  jr $ra
L8003d610:
  addiu $sp, $sp, 32
L8003d614:
  lbu $v1, 1209($gp)
L8003d618:
  addiu $sp, $sp, -32
L8003d61c:
  sw $s1, 20($sp)
L8003d620:
  addu $s1, $a0, $zero
L8003d624:
  sw $ra, 28($sp)
L8003d628:
  sw $s2, 24($sp)
L8003d62c:
  andi $v0, $v1, 0x80
L8003d630:
  bne $v0, $zero, L8003d654
L8003d634:
  sw $s0, 16($sp)
L8003d638:
  lw $s0, 0($s1)
L8003d63c:
  ori $v0, $v1, 0x80
L8003d640:
  sb $v0, 1209($gp)
L8003d644:
  jal 0x80043178
L8003d648:
  addu $a0, $s0, $zero
L8003d64c:
  addiu $v0, $zero, 1024
L8003d650:
  sh $v0, 96($s0)
L8003d654:
  lbu $v0, 26($s1)
L8003d658:
  lw $s0, 0($s1)
L8003d65c:
  sll $v1, $v0, 0x1
L8003d660:
  addu $v1, $v1, $v0
L8003d664:
  sll $v1, $v1, 0x3
L8003d668:
  addu $v1, $v1, $v0
L8003d66c:
  sll $v1, $v1, 0x2
L8003d670:
  lui $v0, 0x800f
L8003d674:
  addiu $v0, $v0, -20232
L8003d678:
  beq $s0, $zero, L8003d6cc
L8003d67c:
  addu $s2, $v1, $v0
L8003d680:
  lhu $v0, 96($s0)
L8003d684:
  sll $zero, $zero, 0x0
L8003d688:
  addiu $v0, $v0, -64
L8003d68c:
  sh $v0, 96($s0)
L8003d690:
  sll $v0, $v0, 0x10
L8003d694:
  sra $a3, $v0, 0x10
L8003d698:
  bgtz $a3, L8003d6b0
L8003d69c:
  addu $a0, $s0, $zero
L8003d6a0:
  jal 0x8004036c
L8003d6a4:
  addu $a0, $s0, $zero
L8003d6a8:
  j L8003d6cc
L8003d6ac:
  sw $zero, 0($s1)
L8003d6b0:
  addiu $a1, $zero, 32
L8003d6b4:
  jal 0x80043230
L8003d6b8:
  addiu $a2, $zero, -64
L8003d6bc:
  lh $a1, 48($s0)
L8003d6c0:
  lh $a2, 50($s0)
L8003d6c4:
  jal L80039934
L8003d6c8:
  addu $a0, $s2, $zero
L8003d6cc:
  lw $s0, 4($s1)
L8003d6d0:
  sll $zero, $zero, 0x0
L8003d6d4:
  beq $s0, $zero, L8003d710
L8003d6d8:
  sll $zero, $zero, 0x0
L8003d6dc:
  lhu $v1, 74($s0)
L8003d6e0:
  lhu $v0, 72($s0)
L8003d6e4:
  addiu $v1, $v1, 8
L8003d6e8:
  addiu $v0, $v0, 8
L8003d6ec:
  sh $v0, 72($s0)
L8003d6f0:
  sll $v0, $v0, 0x10
L8003d6f4:
  sra $v0, $v0, 0x10
L8003d6f8:
  slti $v0, $v0, 192
L8003d6fc:
  bne $v0, $zero, L8003d710
L8003d700:
  sh $v1, 74($s0)
L8003d704:
  jal 0x8004036c
L8003d708:
  addu $a0, $s0, $zero
L8003d70c:
  sw $zero, 4($s1)
L8003d710:
  lw $v0, 0($s1)
L8003d714:
  sll $zero, $zero, 0x0
L8003d718:
  bne $v0, $zero, L8003d734
L8003d71c:
  sll $zero, $zero, 0x0
L8003d720:
  lw $v0, 4($s1)
L8003d724:
  sll $zero, $zero, 0x0
L8003d728:
  bne $v0, $zero, L8003d734
L8003d72c:
  sll $zero, $zero, 0x0
L8003d730:
  sb $zero, 1209($gp)
L8003d734:
  lw $ra, 28($sp)
L8003d738:
  lw $s2, 24($sp)
L8003d73c:
  lw $s1, 20($sp)
L8003d740:
  lw $s0, 16($sp)
L8003d744:
  jr $ra
L8003d748:
  addiu $sp, $sp, 32
L8003d74c:
  lbu $v1, 1209($gp)
L8003d750:
  addiu $sp, $sp, -48
L8003d754:
  sw $s2, 40($sp)
L8003d758:
  addu $s2, $a0, $zero
L8003d75c:
  sw $ra, 44($sp)
L8003d760:
  sw $s1, 36($sp)
L8003d764:
  andi $v0, $v1, 0x80
L8003d768:
  bne $v0, $zero, L8003d8bc
L8003d76c:
  sw $s0, 32($sp)
L8003d770:
  ori $v0, $v1, 0x80
L8003d774:
  sb $v0, 1209($gp)
L8003d778:
  jal 0x8004002c
L8003d77c:
  sll $zero, $zero, 0x0
L8003d780:
  addu $a0, $v0, $zero
L8003d784:
  jal 0x800400ac
L8003d788:
  addiu $a1, $zero, 6
L8003d78c:
  addu $s0, $v0, $zero
L8003d790:
  addu $a0, $s0, $zero
L8003d794:
  addiu $v0, $zero, 160
L8003d798:
  sh $v0, 48($s0)
L8003d79c:
  addiu $v0, $zero, 120
L8003d7a0:
  sh $v0, 50($s0)
L8003d7a4:
  addiu $v0, $zero, 128
L8003d7a8:
  sh $v0, 72($s0)
L8003d7ac:
  addiu $v0, $zero, 224
L8003d7b0:
  jal 0x80042918
L8003d7b4:
  sh $v0, 74($s0)
L8003d7b8:
  lui $a1, 0x800a
L8003d7bc:
  lbu $a1, -20618($a1)
L8003d7c0:
  addu $a0, $s0, $zero
L8003d7c4:
  addiu $a1, $a1, -3
L8003d7c8:
  sll $a1, $a1, 0x18
L8003d7cc:
  jal 0x800428ec
L8003d7d0:
  sra $a1, $a1, 0x18
L8003d7d4:
  lui $v0, 0x8004
L8003d7d8:
  addiu $v0, $v0, 11272
L8003d7dc:
  sw $v0, 76($s0)
L8003d7e0:
  jal 0x8004002c
L8003d7e4:
  sw $s0, 4($s2)
L8003d7e8:
  addu $a0, $v0, $zero
L8003d7ec:
  jal 0x800400ac
L8003d7f0:
  addiu $a1, $zero, 2
L8003d7f4:
  addu $s0, $v0, $zero
L8003d7f8:
  addu $a0, $s0, $zero
L8003d7fc:
  addiu $a1, $zero, 32
L8003d800:
  addiu $a2, $zero, -64
L8003d804:
  addiu $a3, $zero, 3
L8003d808:
  addiu $v0, $zero, 2
L8003d80c:
  sw $v0, 16($sp)
L8003d810:
  addiu $v0, $zero, 11
L8003d814:
  sw $v0, 24($sp)
L8003d818:
  addiu $v0, $zero, 524
L8003d81c:
  sw $zero, 20($sp)
L8003d820:
  jal 0x800404cc
L8003d824:
  sw $v0, 28($sp)
L8003d828:
  lhu $v0, 8($s0)
L8003d82c:
  addu $a0, $s0, $zero
L8003d830:
  ori $v0, $v0, 0x28
L8003d834:
  jal 0x80042918
L8003d838:
  sh $v0, 8($s0)
L8003d83c:
  lui $a1, 0x800a
L8003d840:
  lbu $a1, -20618($a1)
L8003d844:
  addu $a0, $s0, $zero
L8003d848:
  addiu $a1, $a1, -2
L8003d84c:
  sll $a1, $a1, 0x18
L8003d850:
  jal 0x800428ec
L8003d854:
  sra $a1, $a1, 0x18
L8003d858:
  addu $a0, $s0, $zero
L8003d85c:
  jal 0x80043178
L8003d860:
  sw $s0, 0($s2)
L8003d864:
  addu $a1, $zero, $zero
L8003d868:
  lbu $a0, 1215($gp)
L8003d86c:
  addiu $v0, $zero, -1024
L8003d870:
  sh $v0, 96($s0)
L8003d874:
  andi $a0, $a0, 0x1
L8003d878:
  jal L8003d46c
L8003d87c:
  ori $a0, $a0, 0xd0
L8003d880:
  addu $s1, $v0, $zero
L8003d884:
  lhu $v0, 52($s1)
L8003d888:
  sll $zero, $zero, 0x0
L8003d88c:
  ori $v0, $v0, 0x4
L8003d890:
  sh $v0, 52($s1)
L8003d894:
  jal L80039794
L8003d898:
  sll $zero, $zero, 0x0
L8003d89c:
  lw $v0, 48($s1)
L8003d8a0:
  sll $zero, $zero, 0x0
L8003d8a4:
  beq $v0, $zero, L8003d894
L8003d8a8:
  sll $zero, $zero, 0x0
L8003d8ac:
  lh $a1, 48($s0)
L8003d8b0:
  lh $a2, 50($s0)
L8003d8b4:
  jal L80039934
L8003d8b8:
  addu $a0, $s1, $zero
L8003d8bc:
  lbu $a0, 1209($gp)
L8003d8c0:
  sll $zero, $zero, 0x0
L8003d8c4:
  andi $v0, $a0, 0x20
L8003d8c8:
  beq $v0, $zero, L8003d8dc
L8003d8cc:
  sll $zero, $zero, 0x0
L8003d8d0:
  sb $zero, 1209($gp)
L8003d8d4:
  j L8003da28
L8003d8d8:
  sll $zero, $zero, 0x0
L8003d8dc:
  lbu $v1, 26($s2)
L8003d8e0:
  sll $zero, $zero, 0x0
L8003d8e4:
  sll $v0, $v1, 0x1
L8003d8e8:
  addu $v0, $v0, $v1
L8003d8ec:
  sll $v0, $v0, 0x3
L8003d8f0:
  addu $v0, $v0, $v1
L8003d8f4:
  sll $v0, $v0, 0x2
L8003d8f8:
  lui $v1, 0x800f
L8003d8fc:
  addiu $v1, $v1, -20232
L8003d900:
  addu $s1, $v0, $v1
L8003d904:
  andi $v0, $a0, 0x40
L8003d908:
  beq $v0, $zero, L8003d964
L8003d90c:
  sll $zero, $zero, 0x0
L8003d910:
  jal L80039794
L8003d914:
  sll $zero, $zero, 0x0
L8003d918:
  lhu $v0, 52($s1)
L8003d91c:
  sll $zero, $zero, 0x0
L8003d920:
  andi $v0, $v0, 0x2000
L8003d924:
  beq $v0, $zero, L8003da28
L8003d928:
  sll $zero, $zero, 0x0
L8003d92c:
  lbu $v0, 1209($gp)
L8003d930:
  lui $v1, 0x800a
L8003d934:
  lb $v1, -19635($v1)
L8003d938:
  ori $v0, $v0, 0x20
L8003d93c:
  sb $v0, 1209($gp)
L8003d940:
  bne $v1, $zero, L8003da28
L8003d944:
  sll $zero, $zero, 0x0
L8003d948:
  ori $a0, $zero, 0x80d4
L8003d94c:
  jal L8003d46c
L8003d950:
  addu $a1, $zero, $zero
L8003d954:
  lui $at, 0x800a
L8003d958:
  sb $zero, -19635($at)
L8003d95c:
  j L8003da28
L8003d960:
  sll $zero, $zero, 0x0
L8003d964:
  lw $s0, 0($s2)
L8003d968:
  sll $zero, $zero, 0x0
L8003d96c:
  lh $v0, 96($s0)
L8003d970:
  lhu $v1, 96($s0)
L8003d974:
  bgez $v0, L8003d9c4
L8003d978:
  addiu $v0, $v1, 64
L8003d97c:
  sh $v0, 96($s0)
L8003d980:
  sll $v0, $v0, 0x10
L8003d984:
  sra $a3, $v0, 0x10
L8003d988:
  bltz $a3, L8003d9a4
L8003d98c:
  addiu $v0, $zero, 32
L8003d990:
  sh $v0, 48($s0)
L8003d994:
  addiu $v0, $zero, 80
L8003d998:
  sh $zero, 96($s0)
L8003d99c:
  j L8003d9b4
L8003d9a0:
  sh $v0, 50($s0)
L8003d9a4:
  addu $a0, $s0, $zero
L8003d9a8:
  addiu $a1, $zero, 32
L8003d9ac:
  jal 0x80043230
L8003d9b0:
  addiu $a2, $zero, 80
L8003d9b4:
  lh $a1, 48($s0)
L8003d9b8:
  lh $a2, 50($s0)
L8003d9bc:
  jal L80039934
L8003d9c0:
  addu $a0, $s1, $zero
L8003d9c4:
  lw $s0, 4($s2)
L8003d9c8:
  sll $zero, $zero, 0x0
L8003d9cc:
  lhu $v0, 74($s0)
L8003d9d0:
  lhu $v1, 72($s0)
L8003d9d4:
  addiu $v0, $v0, -8
L8003d9d8:
  addiu $v1, $v1, -8
L8003d9dc:
  sh $v1, 72($s0)
L8003d9e0:
  sll $v1, $v1, 0x10
L8003d9e4:
  bgtz $v1, L8003da28
L8003d9e8:
  sh $v0, 74($s0)
L8003d9ec:
  addiu $v0, $zero, 64
L8003d9f0:
  sh $zero, 72($s0)
L8003d9f4:
  sh $v0, 74($s0)
L8003d9f8:
  lw $v0, 0($s2)
L8003d9fc:
  sll $zero, $zero, 0x0
L8003da00:
  lh $v0, 96($v0)
L8003da04:
  sll $zero, $zero, 0x0
L8003da08:
  bne $v0, $zero, L8003da28
L8003da0c:
  sll $zero, $zero, 0x0
L8003da10:
  lhu $v0, 52($s1)
L8003da14:
  lbu $v1, 1209($gp)
L8003da18:
  andi $v0, $v0, 0xfffb
L8003da1c:
  ori $v1, $v1, 0x40
L8003da20:
  sh $v0, 52($s1)
L8003da24:
  sb $v1, 1209($gp)
L8003da28:
  lw $ra, 44($sp)
L8003da2c:
  lw $s2, 40($sp)
L8003da30:
  lw $s1, 36($sp)
L8003da34:
  lw $s0, 32($sp)
L8003da38:
  jr $ra
L8003da3c:
  addiu $sp, $sp, 48
L8003da40:
  lbu $v1, 1209($gp)
L8003da44:
  addiu $sp, $sp, -48
L8003da48:
  sw $s2, 40($sp)
L8003da4c:
  addu $s2, $a0, $zero
L8003da50:
  sw $ra, 44($sp)
L8003da54:
  sw $s1, 36($sp)
L8003da58:
  andi $v0, $v1, 0x80
L8003da5c:
  bne $v0, $zero, L8003db40
L8003da60:
  sw $s0, 32($sp)
L8003da64:
  ori $v0, $v1, 0x80
L8003da68:
  sb $v0, 1209($gp)
L8003da6c:
  jal 0x8004002c
L8003da70:
  sll $zero, $zero, 0x0
L8003da74:
  addu $a0, $v0, $zero
L8003da78:
  jal 0x800400ac
L8003da7c:
  addiu $a1, $zero, 2
L8003da80:
  addu $s0, $v0, $zero
L8003da84:
  addu $a0, $s0, $zero
L8003da88:
  addiu $a1, $zero, 32
L8003da8c:
  addiu $a2, $zero, -64
L8003da90:
  addiu $a3, $zero, 3
L8003da94:
  addiu $v0, $zero, 2
L8003da98:
  sw $v0, 16($sp)
L8003da9c:
  addiu $v0, $zero, 11
L8003daa0:
  sw $v0, 24($sp)
L8003daa4:
  addiu $v0, $zero, 524
L8003daa8:
  sw $zero, 20($sp)
L8003daac:
  jal 0x800404cc
L8003dab0:
  sw $v0, 28($sp)
L8003dab4:
  lhu $v0, 8($s0)
L8003dab8:
  addu $a0, $s0, $zero
L8003dabc:
  ori $v0, $v0, 0x28
L8003dac0:
  jal 0x80042918
L8003dac4:
  sh $v0, 8($s0)
L8003dac8:
  lui $a1, 0x800a
L8003dacc:
  lbu $a1, -20618($a1)
L8003dad0:
  addu $a0, $s0, $zero
L8003dad4:
  addiu $a1, $a1, -2
L8003dad8:
  sll $a1, $a1, 0x18
L8003dadc:
  jal 0x800428ec
L8003dae0:
  sra $a1, $a1, 0x18
L8003dae4:
  addu $a0, $s0, $zero
L8003dae8:
  jal 0x80043178
L8003daec:
  sw $s0, 0($s2)
L8003daf0:
  addiu $a0, $zero, 208
L8003daf4:
  addu $a1, $zero, $zero
L8003daf8:
  addiu $v0, $zero, -1024
L8003dafc:
  jal L8003d46c
L8003db00:
  sh $v0, 96($s0)
L8003db04:
  addu $s1, $v0, $zero
L8003db08:
  lhu $v0, 52($s1)
L8003db0c:
  sll $zero, $zero, 0x0
L8003db10:
  ori $v0, $v0, 0x4
L8003db14:
  sh $v0, 52($s1)
L8003db18:
  jal L80039794
L8003db1c:
  sll $zero, $zero, 0x0
L8003db20:
  lw $v0, 48($s1)
L8003db24:
  sll $zero, $zero, 0x0
L8003db28:
  beq $v0, $zero, L8003db18
L8003db2c:
  sll $zero, $zero, 0x0
L8003db30:
  lh $a1, 48($s0)
L8003db34:
  lh $a2, 50($s0)
L8003db38:
  jal L80039934
L8003db3c:
  addu $a0, $s1, $zero
L8003db40:
  lbu $v1, 26($s2)
L8003db44:
  lw $s0, 0($s2)
L8003db48:
  lbu $a0, 1209($gp)
L8003db4c:
  sll $v0, $v1, 0x1
L8003db50:
  addu $v0, $v0, $v1
L8003db54:
  sll $v0, $v0, 0x3
L8003db58:
  addu $v0, $v0, $v1
L8003db5c:
  sll $v0, $v0, 0x2
L8003db60:
  lui $v1, 0x800f
L8003db64:
  addiu $v1, $v1, -20232
L8003db68:
  addu $s1, $v0, $v1
L8003db6c:
  andi $v0, $a0, 0x40
L8003db70:
  beq $v0, $zero, L8003dba0
L8003db74:
  sll $zero, $zero, 0x0
L8003db78:
  jal L80039794
L8003db7c:
  sll $zero, $zero, 0x0
L8003db80:
  lhu $v0, 52($s1)
L8003db84:
  sll $zero, $zero, 0x0
L8003db88:
  andi $v0, $v0, 0x2000
L8003db8c:
  beq $v0, $zero, L8003dc04
L8003db90:
  sll $zero, $zero, 0x0
L8003db94:
  sb $zero, 1209($gp)
L8003db98:
  j L8003dc04
L8003db9c:
  sll $zero, $zero, 0x0
L8003dba0:
  lhu $v0, 96($s0)
L8003dba4:
  sll $zero, $zero, 0x0
L8003dba8:
  addiu $v0, $v0, 32
L8003dbac:
  sh $v0, 96($s0)
L8003dbb0:
  sll $v0, $v0, 0x10
L8003dbb4:
  sra $a3, $v0, 0x10
L8003dbb8:
  bltz $a3, L8003dbe4
L8003dbbc:
  addiu $v0, $zero, 32
L8003dbc0:
  sh $v0, 48($s0)
L8003dbc4:
  addiu $v0, $zero, 80
L8003dbc8:
  sh $v0, 50($s0)
L8003dbcc:
  lhu $v0, 52($s1)
L8003dbd0:
  ori $v1, $a0, 0x40
L8003dbd4:
  sb $v1, 1209($gp)
L8003dbd8:
  andi $v0, $v0, 0xfffb
L8003dbdc:
  j L8003dbf4
L8003dbe0:
  sh $v0, 52($s1)
L8003dbe4:
  addu $a0, $s0, $zero
L8003dbe8:
  addiu $a1, $zero, 32
L8003dbec:
  jal 0x80043230
L8003dbf0:
  addiu $a2, $zero, 80
L8003dbf4:
  lh $a1, 48($s0)
L8003dbf8:
  lh $a2, 50($s0)
L8003dbfc:
  jal L80039934
L8003dc00:
  addu $a0, $s1, $zero
L8003dc04:
  lw $ra, 44($sp)
L8003dc08:
  lw $s2, 40($sp)
L8003dc0c:
  lw $s1, 36($sp)
L8003dc10:
  lw $s0, 32($sp)
L8003dc14:
  jr $ra
L8003dc18:
  addiu $sp, $sp, 48
L8003dc1c:
  addiu $sp, $sp, -56
L8003dc20:
  lbu $v1, 1237($gp)
L8003dc24:
  lui $v0, 0x800f
L8003dc28:
  sw $s2, 32($sp)
L8003dc2c:
  addiu $s2, $v0, -2352
L8003dc30:
  sw $s5, 44($sp)
L8003dc34:
  sw $s3, 36($sp)
L8003dc38:
  sll $v0, $v1, 0x2
L8003dc3c:
  addu $v0, $v0, $v1
L8003dc40:
  sll $v0, $v0, 0x2
L8003dc44:
  subu $v0, $v0, $v1
L8003dc48:
  sll $v0, $v0, 0x2
L8003dc4c:
  addu $v0, $v0, $v1
L8003dc50:
  sll $v0, $v0, 0x3
L8003dc54:
  addiu $v1, $s2, 28
L8003dc58:
  addu $s3, $v0, $v1
L8003dc5c:
  lhu $v0, 1220($gp)
L8003dc60:
  addu $s5, $zero, $zero
L8003dc64:
  sw $ra, 48($sp)
L8003dc68:
  sw $s4, 40($sp)
L8003dc6c:
  sw $s1, 28($sp)
L8003dc70:
  andi $v0, $v0, 0x2000
L8003dc74:
  beq $v0, $zero, L8003dcdc
L8003dc78:
  sw $s0, 24($sp)
L8003dc7c:
  lui $v0, 0x800a
L8003dc80:
  lw $v0, -19392($v0)
L8003dc84:
  sll $zero, $zero, 0x0
L8003dc88:
  slt $v0, $s5, $v0
L8003dc8c:
  beq $v0, $zero, L8003dccc
L8003dc90:
  addu $s1, $s5, $zero
L8003dc94:
  lui $s4, 0x800a
L8003dc98:
  addu $s0, $s5, $zero
L8003dc9c:
  addiu $a0, $s4, -20628
L8003dca0:
  lui $a1, 0x800a
L8003dca4:
  lw $a1, -19388($a1)
L8003dca8:
  addiu $s1, $s1, 1
L8003dcac:
  jal 0x8007ef84
L8003dcb0:
  addu $a1, $a1, $s0
L8003dcb4:
  lui $v0, 0x800a
L8003dcb8:
  lw $v0, -19392($v0)
L8003dcbc:
  sll $zero, $zero, 0x0
L8003dcc0:
  slt $v0, $s1, $v0
L8003dcc4:
  bne $v0, $zero, L8003dc9c
L8003dcc8:
  addiu $s0, $s0, 40
L8003dccc:
  lbu $a1, 12($s3)
L8003dcd0:
  lui $a0, 0x8001
L8003dcd4:
  jal 0x8007ef84
L8003dcd8:
  addiu $a0, $a0, 888
L8003dcdc:
  lhu $v0, 1220($gp)
L8003dce0:
  sll $zero, $zero, 0x0
L8003dce4:
  andi $v0, $v0, 0x4000
L8003dce8:
  beq $v0, $zero, L8003dd04
L8003dcec:
  addiu $s0, $zero, -1
L8003dcf0:
  addiu $a1, $gp, 1244
L8003dcf4:
  addiu $a2, $gp, 1216
L8003dcf8:
  jal 0x80044838
L8003dcfc:
  addiu $a0, $zero, 1
L8003dd00:
  addu $s0, $v0, $zero
L8003dd04:
  lhu $v0, 1220($gp)
L8003dd08:
  sll $zero, $zero, 0x0
L8003dd0c:
  andi $v0, $v0, 0x1000
L8003dd10:
  beq $v0, $zero, L8003deb0
L8003dd14:
  sll $zero, $zero, 0x0
L8003dd18:
  beq $s0, $zero, L8003deb0
L8003dd1c:
  addiu $v0, $zero, 1
L8003dd20:
  bne $s0, $v0, L8003deb0
L8003dd24:
  sll $zero, $zero, 0x0
L8003dd28:
  lw $v0, 1244($gp)
L8003dd2c:
  sll $zero, $zero, 0x0
L8003dd30:
  addiu $v1, $v0, -2
L8003dd34:
  sltiu $v0, $v1, 11
L8003dd38:
  beq $v0, $zero, L8003deb0
L8003dd3c:
  lui $v0, 0x8001
L8003dd40:
  addiu $v0, $v0, 944
L8003dd44:
  sll $v1, $v1, 0x2
L8003dd48:
  addu $v1, $v1, $v0
L8003dd4c:
  lw $v0, 0($v1)
L8003dd50:
  sll $zero, $zero, 0x0
L8003dd54:
  jr $v0
L8003dd58:
  sll $zero, $zero, 0x0
L8003dd5c:
  addiu $a1, $zero, 1
L8003dd60:
  lhu $a0, 1220($gp)
L8003dd64:
  lw $v1, 1216($gp)
L8003dd68:
  ori $v0, $a0, 0x2000
L8003dd6c:
  sh $v0, 1220($gp)
L8003dd70:
  beq $v1, $a1, L8003ddd4
L8003dd74:
  slti $v0, $v1, 2
L8003dd78:
  beq $v0, $zero, L8003dd90
L8003dd7c:
  addiu $v0, $zero, 3
L8003dd80:
  beq $v1, $zero, L8003ddb0
L8003dd84:
  addiu $v0, $zero, 2
L8003dd88:
  j L8003ddd8
L8003dd8c:
  sll $zero, $zero, 0x0
L8003dd90:
  beq $v1, $v0, L8003dda8
L8003dd94:
  addiu $v0, $zero, 4
L8003dd98:
  beq $v1, $v0, L8003ddc0
L8003dd9c:
  addiu $v0, $zero, 2
L8003dda0:
  j L8003ddd8
L8003dda4:
  sll $zero, $zero, 0x0
L8003dda8:
  ori $v0, $a0, 0x2800
L8003ddac:
  sh $v0, 1220($gp)
L8003ddb0:
  lui $v0, 0x800a
L8003ddb4:
  lbu $v0, -19400($v0)
L8003ddb8:
  j L8003deac
L8003ddbc:
  sb $v0, 12($s3)
L8003ddc0:
  ori $v0, $a0, 0x2002
L8003ddc4:
  sh $v0, 1220($gp)
L8003ddc8:
  sb $a1, 1229($gp)
L8003ddcc:
  j L8003deb0
L8003ddd0:
  sll $zero, $zero, 0x0
L8003ddd4:
  addiu $v0, $zero, 2
L8003ddd8:
  sb $v0, 1229($gp)
L8003dddc:
  j L8003deb0
L8003dde0:
  sll $zero, $zero, 0x0
L8003dde4:
  lw $v0, 1216($gp)
L8003dde8:
  sll $zero, $zero, 0x0
L8003ddec:
  bne $v0, $zero, L8003de8c
L8003ddf0:
  addiu $v0, $zero, 1
L8003ddf4:
  lh $s1, 22($s2)
L8003ddf8:
  lhu $v0, 18($s2)
L8003ddfc:
  sll $zero, $zero, 0x0
L8003de00:
  subu $v0, $v0, $s1
L8003de04:
  sh $v0, 18($s2)
L8003de08:
  sll $v0, $v0, 0x10
L8003de0c:
  blez $v0, L8003deac
L8003de10:
  sll $zero, $zero, 0x0
L8003de14:
  lw $v0, 0($s3)
L8003de18:
  j L8003de5c
L8003de1c:
  addu $v0, $v0, $s1
L8003de20:
  lw $v0, 1216($gp)
L8003de24:
  sll $zero, $zero, 0x0
L8003de28:
  bne $v0, $zero, L8003de8c
L8003de2c:
  addiu $v0, $zero, 1
L8003de30:
  lh $s1, 22($s2)
L8003de34:
  lhu $v0, 18($s2)
L8003de38:
  sll $zero, $zero, 0x0
L8003de3c:
  subu $v0, $v0, $s1
L8003de40:
  sh $v0, 18($s2)
L8003de44:
  sll $v0, $v0, 0x10
L8003de48:
  blez $v0, L8003deac
L8003de4c:
  sll $zero, $zero, 0x0
L8003de50:
  lw $v0, 0($s3)
L8003de54:
  sll $zero, $zero, 0x0
L8003de58:
  addu $v0, $v0, $s1
L8003de5c:
  sw $v0, 0($s3)
L8003de60:
  lhu $v0, 20($s2)
L8003de64:
  lh $v1, 18($s2)
L8003de68:
  lh $a0, 22($s2)
L8003de6c:
  addu $v0, $v0, $s1
L8003de70:
  slt $v1, $v1, $a0
L8003de74:
  sh $v0, 20($s2)
L8003de78:
  lhu $v0, 18($s2)
L8003de7c:
  beq $v1, $zero, L8003deb0
L8003de80:
  sll $zero, $zero, 0x0
L8003de84:
  j L8003deb0
L8003de88:
  sh $v0, 22($s2)
L8003de8c:
  sb $v0, 1229($gp)
L8003de90:
  j L8003deb0
L8003de94:
  sll $zero, $zero, 0x0
L8003de98:
  lw $v1, 1216($gp)
L8003de9c:
  addiu $v0, $zero, 1
L8003dea0:
  sb $v0, 1229($gp)
L8003dea4:
  bne $v1, $zero, L8003deb0
L8003dea8:
  sll $zero, $zero, 0x0
L8003deac:
  sb $zero, 1229($gp)
L8003deb0:
  lbu $v0, 1209($gp)
L8003deb4:
  sll $zero, $zero, 0x0
L8003deb8:
  andi $v1, $v0, 0xf
L8003debc:
  beq $v1, $zero, L8003dee8
L8003dec0:
  addu $a0, $s2, $zero
L8003dec4:
  addiu $s0, $zero, 1
L8003dec8:
  lui $v0, 0x8009
L8003decc:
  addiu $v0, $v0, 3976
L8003ded0:
  sll $v1, $v1, 0x2
L8003ded4:
  addu $v1, $v1, $v0
L8003ded8:
  lw $v0, 0($v1)
L8003dedc:
  sll $zero, $zero, 0x0
L8003dee0:
  jalr $ra, $v0
L8003dee4:
  addu $a1, $s3, $zero
L8003dee8:
  bgez $s0, L8003e448
L8003deec:
  sll $zero, $zero, 0x0
L8003def0:
  lhu $v0, 1220($gp)
L8003def4:
  sll $zero, $zero, 0x0
L8003def8:
  andi $v0, $v0, 0x400
L8003defc:
  beq $v0, $zero, L8003df5c
L8003df00:
  sll $zero, $zero, 0x0
L8003df04:
  lbu $v0, 26($s2)
L8003df08:
  sll $zero, $zero, 0x0
L8003df0c:
  sll $s0, $v0, 0x1
L8003df10:
  addu $s0, $s0, $v0
L8003df14:
  sll $s0, $s0, 0x3
L8003df18:
  addu $s0, $s0, $v0
L8003df1c:
  sll $s0, $s0, 0x2
L8003df20:
  lui $v0, 0x800f
L8003df24:
  addiu $v0, $v0, -20232
L8003df28:
  jal L80039794
L8003df2c:
  addu $s0, $s0, $v0
L8003df30:
  lw $v0, 52($s0)
L8003df34:
  addiu $v1, $zero, 8192
L8003df38:
  andi $v0, $v0, 0x2008
L8003df3c:
  bne $v0, $v1, L8003e448
L8003df40:
  sll $zero, $zero, 0x0
L8003df44:
  lhu $v0, 1220($gp)
L8003df48:
  sll $zero, $zero, 0x0
L8003df4c:
  andi $v0, $v0, 0xfbff
L8003df50:
  sh $v0, 1220($gp)
L8003df54:
  j L8003e448
L8003df58:
  sll $zero, $zero, 0x0
L8003df5c:
  lbu $v0, 1223($gp)
L8003df60:
  sll $zero, $zero, 0x0
L8003df64:
  andi $v1, $v0, 0xf
L8003df68:
  sltiu $v0, $v1, 11
L8003df6c:
  beq $v0, $zero, L8003e448
L8003df70:
  lui $v0, 0x8001
L8003df74:
  addiu $v0, $v0, 992
L8003df78:
  sll $v1, $v1, 0x2
L8003df7c:
  addu $v1, $v1, $v0
L8003df80:
  lw $v0, 0($v1)
L8003df84:
  sll $zero, $zero, 0x0
L8003df88:
  jr $v0
L8003df8c:
  sll $zero, $zero, 0x0
L8003df90:
  lbu $v1, 1223($gp)
L8003df94:
  sll $zero, $zero, 0x0
L8003df98:
  andi $v0, $v1, 0x80
L8003df9c:
  bne $v0, $zero, L8003dfb8
L8003dfa0:
  ori $v0, $v1, 0x80
L8003dfa4:
  sb $v0, 1223($gp)
L8003dfa8:
  addiu $v0, $zero, 1
L8003dfac:
  sb $v0, 1209($gp)
L8003dfb0:
  j L8003e448
L8003dfb4:
  sll $zero, $zero, 0x0
L8003dfb8:
  lui $v0, 0x800a
L8003dfbc:
  lb $v0, -19635($v0)
L8003dfc0:
  sll $zero, $zero, 0x0
L8003dfc4:
  beq $v0, $zero, L8003dfd8
L8003dfc8:
  addiu $v0, $zero, 2
L8003dfcc:
  sb $v0, 1209($gp)
L8003dfd0:
  j L8003e448
L8003dfd4:
  sll $zero, $zero, 0x0
L8003dfd8:
  jal 0x80043e30
L8003dfdc:
  addiu $a0, $zero, 1
L8003dfe0:
  jal 0x80043ebc
L8003dfe4:
  sll $zero, $zero, 0x0
L8003dfe8:
  lhu $v0, 1220($gp)
L8003dfec:
  addiu $v1, $zero, 1
L8003dff0:
  sb $v1, 1223($gp)
L8003dff4:
  ori $v0, $v0, 0x4000
L8003dff8:
  sh $v0, 1220($gp)
L8003dffc:
  lbu $v1, 1223($gp)
L8003e000:
  sll $zero, $zero, 0x0
L8003e004:
  andi $v0, $v1, 0x80
L8003e008:
  bne $v0, $zero, L8003e034
L8003e00c:
  addiu $v0, $zero, 4
L8003e010:
  lhu $v0, 1220($gp)
L8003e014:
  ori $v1, $v1, 0x80
L8003e018:
  sb $v1, 1223($gp)
L8003e01c:
  ori $v0, $v0, 0x1000
L8003e020:
  sh $v0, 1220($gp)
L8003e024:
  jal 0x8004413c
L8003e028:
  addu $a0, $s5, $zero
L8003e02c:
  j L8003e448
L8003e030:
  sll $zero, $zero, 0x0
L8003e034:
  sb $v0, 1223($gp)
L8003e038:
  lhu $v1, 1220($gp)
L8003e03c:
  sll $zero, $zero, 0x0
L8003e040:
  andi $v0, $v1, 0x2000
L8003e044:
  beq $v0, $zero, L8003e448
L8003e048:
  andi $v0, $v1, 0xefff
L8003e04c:
  lbu $v1, 1229($gp)
L8003e050:
  sh $v0, 1220($gp)
L8003e054:
  addiu $v0, $zero, 2
L8003e058:
  beq $v1, $v0, L8003e3b8
L8003e05c:
  addiu $a0, $zero, 210
L8003e060:
  lbu $v0, 1215($gp)
L8003e064:
  sll $zero, $zero, 0x0
L8003e068:
  andi $v0, $v0, 0x1
L8003e06c:
  bne $v0, $zero, L8003e084
L8003e070:
  addiu $v0, $zero, 7
L8003e074:
  addiu $v0, $zero, 5
L8003e078:
  sb $v0, 1223($gp)
L8003e07c:
  j L8003e448
L8003e080:
  sll $zero, $zero, 0x0
L8003e084:
  sb $v0, 1223($gp)
L8003e088:
  j L8003e448
L8003e08c:
  sll $zero, $zero, 0x0
L8003e090:
  lbu $v1, 1223($gp)
L8003e094:
  sll $zero, $zero, 0x0
L8003e098:
  andi $v0, $v1, 0x80
L8003e09c:
  bne $v0, $zero, L8003e118
L8003e0a0:
  ori $v0, $v1, 0x80
L8003e0a4:
  sb $v0, 1223($gp)
L8003e0a8:
  lui $a0, 0x8001
L8003e0ac:
  jal 0x80044cd4
L8003e0b0:
  addiu $a0, $a0, 900
L8003e0b4:
  addu $s1, $v0, $zero
L8003e0b8:
  bltz $s1, L8003e0d4
L8003e0bc:
  sll $zero, $zero, 0x0
L8003e0c0:
  lhu $v0, 1220($gp)
L8003e0c4:
  sll $zero, $zero, 0x0
L8003e0c8:
  andi $v0, $v0, 0x2
L8003e0cc:
  beq $v0, $zero, L8003e0dc
L8003e0d0:
  sll $v0, $s1, 0x2
L8003e0d4:
  j L8003e3b8
L8003e0d8:
  addiu $a0, $zero, 211
L8003e0dc:
  addu $v0, $v0, $s1
L8003e0e0:
  lui $v1, 0x800a
L8003e0e4:
  lw $v1, -19388($v1)
L8003e0e8:
  sll $v0, $v0, 0x3
L8003e0ec:
  addu $v0, $v0, $v1
L8003e0f0:
  lw $a2, 32($v0)
L8003e0f4:
  sll $zero, $zero, 0x0
L8003e0f8:
  bgez $a2, L8003e104
L8003e0fc:
  addu $a0, $s5, $zero
L8003e100:
  addiu $a2, $a2, 63
L8003e104:
  lui $a1, 0x8021
L8003e108:
  jal 0x80044278
L8003e10c:
  sra $a2, $a2, 0x6
L8003e110:
  j L8003e448
L8003e114:
  sll $zero, $zero, 0x0
L8003e118:
  lbu $v0, 1229($gp)
L8003e11c:
  sll $zero, $zero, 0x0
L8003e120:
  bne $v0, $zero, L8003e3b8
L8003e124:
  addiu $a0, $zero, 216
L8003e128:
  addiu $v0, $zero, 6
L8003e12c:
  sb $v0, 1223($gp)
L8003e130:
  lbu $v1, 1223($gp)
L8003e134:
  sll $zero, $zero, 0x0
L8003e138:
  andi $v0, $v1, 0x80
L8003e13c:
  bne $v0, $zero, L8003e1bc
L8003e140:
  addiu $v0, $zero, 1
L8003e144:
  ori $v0, $v1, 0x80
L8003e148:
  sb $v0, 1223($gp)
L8003e14c:
  lui $v0, 0x8001
L8003e150:
  addiu $s0, $v0, 900
L8003e154:
  jal 0x80044cd4
L8003e158:
  addu $a0, $s0, $zero
L8003e15c:
  addu $s1, $v0, $zero
L8003e160:
  bltz $s1, L8003e3b8
L8003e164:
  addiu $a0, $zero, 211
L8003e168:
  lhu $v0, 1220($gp)
L8003e16c:
  sll $zero, $zero, 0x0
L8003e170:
  andi $v0, $v0, 0x2
L8003e174:
  bne $v0, $zero, L8003e3b8
L8003e178:
  sll $zero, $zero, 0x0
L8003e17c:
  ori $a0, $zero, 0x80d5
L8003e180:
  jal L8003d46c
L8003e184:
  addu $a1, $zero, $zero
L8003e188:
  addu $a0, $s5, $zero
L8003e18c:
  addu $a1, $s0, $zero
L8003e190:
  lui $a2, 0x8020
L8003e194:
  sb $s1, 13($s3)
L8003e198:
  lhu $v0, 1220($gp)
L8003e19c:
  addiu $v1, $zero, 7680
L8003e1a0:
  sw $v1, 16($sp)
L8003e1a4:
  ori $v0, $v0, 0x1000
L8003e1a8:
  sh $v0, 1220($gp)
L8003e1ac:
  jal 0x800441dc
L8003e1b0:
  addiu $a3, $zero, 512
L8003e1b4:
  j L8003e448
L8003e1b8:
  sll $zero, $zero, 0x0
L8003e1bc:
  lbu $v1, 1229($gp)
L8003e1c0:
  sll $zero, $zero, 0x0
L8003e1c4:
  bne $v1, $v0, L8003e3b8
L8003e1c8:
  addiu $a0, $zero, 215
L8003e1cc:
  j L8003e3b8
L8003e1d0:
  addiu $a0, $zero, 216
L8003e1d4:
  lbu $v1, 1223($gp)
L8003e1d8:
  sll $zero, $zero, 0x0
L8003e1dc:
  andi $v0, $v1, 0x80
L8003e1e0:
  bne $v0, $zero, L8003e298
L8003e1e4:
  addiu $v0, $zero, 1
L8003e1e8:
  lhu $v0, 1220($gp)
L8003e1ec:
  ori $v1, $v1, 0x80
L8003e1f0:
  sb $v1, 1223($gp)
L8003e1f4:
  andi $v0, $v0, 0x2
L8003e1f8:
  beq $v0, $zero, L8003e20c
L8003e1fc:
  addiu $v0, $zero, 9
L8003e200:
  sb $v0, 1223($gp)
L8003e204:
  j L8003e448
L8003e208:
  sll $zero, $zero, 0x0
L8003e20c:
  lui $v0, 0x8001
L8003e210:
  addiu $s0, $v0, 900
L8003e214:
  jal 0x80044cd4
L8003e218:
  addu $a0, $s0, $zero
L8003e21c:
  bgez $v0, L8003e230
L8003e220:
  addiu $v0, $zero, 10
L8003e224:
  sb $v0, 1223($gp)
L8003e228:
  j L8003e448
L8003e22c:
  sll $zero, $zero, 0x0
L8003e230:
  ori $a0, $zero, 0x80d6
L8003e234:
  jal L8003d46c
L8003e238:
  addu $a1, $zero, $zero
L8003e23c:
  lui $a0, 0x8030
L8003e240:
  lui $a1, 0x801d
L8003e244:
  addiu $a1, $a1, 16384
L8003e248:
  jal L800356a0
L8003e24c:
  addiu $a2, $zero, 512
L8003e250:
  lui $a0, 0x8030
L8003e254:
  ori $a0, $a0, 0x200
L8003e258:
  addiu $a1, $zero, 134
L8003e25c:
  jal L80035748
L8003e260:
  addiu $a2, $zero, 2048
L8003e264:
  addu $a0, $s5, $zero
L8003e268:
  addu $a1, $s0, $zero
L8003e26c:
  lui $a2, 0x8030
L8003e270:
  addu $a3, $zero, $zero
L8003e274:
  addiu $v0, $zero, 2560
L8003e278:
  jal 0x800442e4
L8003e27c:
  sw $v0, 16($sp)
L8003e280:
  lhu $v0, 1220($gp)
L8003e284:
  sll $zero, $zero, 0x0
L8003e288:
  ori $v0, $v0, 0x1000
L8003e28c:
  sh $v0, 1220($gp)
L8003e290:
  j L8003e448
L8003e294:
  sll $zero, $zero, 0x0
L8003e298:
  lbu $v1, 1229($gp)
L8003e29c:
  sll $zero, $zero, 0x0
L8003e2a0:
  bne $v1, $v0, L8003e2b4
L8003e2a4:
  addiu $a0, $zero, 215
L8003e2a8:
  addiu $a0, $zero, 217
L8003e2ac:
  j L8003e2c0
L8003e2b0:
  addu $a1, $v0, $zero
L8003e2b4:
  addiu $a1, $zero, 1
L8003e2b8:
  addiu $v0, $zero, 8
L8003e2bc:
  sb $v0, 1223($gp)
L8003e2c0:
  jal L8003d46c
L8003e2c4:
  sll $zero, $zero, 0x0
L8003e2c8:
  lhu $v0, 1220($gp)
L8003e2cc:
  sll $zero, $zero, 0x0
L8003e2d0:
  ori $v0, $v0, 0x400
L8003e2d4:
  sh $v0, 1220($gp)
L8003e2d8:
  addiu $v0, $zero, 8
L8003e2dc:
  sb $v0, 1223($gp)
L8003e2e0:
  lbu $v1, 1223($gp)
L8003e2e4:
  sll $zero, $zero, 0x0
L8003e2e8:
  andi $v0, $v1, 0x80
L8003e2ec:
  bne $v0, $zero, L8003e3a4
L8003e2f0:
  lui $a0, 0x8001
L8003e2f4:
  ori $v0, $v1, 0x80
L8003e2f8:
  sb $v0, 1223($gp)
L8003e2fc:
  jal 0x80044cd4
L8003e300:
  addiu $a0, $a0, 900
L8003e304:
  addu $s1, $v0, $zero
L8003e308:
  addu $a0, $zero, $zero
L8003e30c:
  addu $v1, $a0, $zero
L8003e310:
  lui $a1, 0x8021
L8003e314:
  addiu $v0, $zero, 1
L8003e318:
  lui $at, 0x8021
L8003e31c:
  sb $v0, 126($at)
L8003e320:
  addiu $v0, $zero, 255
L8003e324:
  lui $at, 0x8021
L8003e328:
  sb $v0, 125($at)
L8003e32c:
  lui $at, 0x8021
L8003e330:
  sb $v0, 124($at)
L8003e334:
  lui $at, 0x8021
L8003e338:
  sb $v0, 123($at)
L8003e33c:
  lui $at, 0x8021
L8003e340:
  sb $v0, 122($at)
L8003e344:
  addu $v0, $v1, $a1
L8003e348:
  lbu $v0, 0($v0)
L8003e34c:
  addiu $v1, $v1, 1
L8003e350:
  xor $a0, $a0, $v0
L8003e354:
  slti $v0, $v1, 127
L8003e358:
  bne $v0, $zero, L8003e348
L8003e35c:
  addu $v0, $v1, $a1
L8003e360:
  sll $v0, $s1, 0x2
L8003e364:
  addu $v0, $v0, $s1
L8003e368:
  lui $v1, 0x800a
L8003e36c:
  lw $v1, -19388($v1)
L8003e370:
  sll $v0, $v0, 0x3
L8003e374:
  addu $v0, $v0, $v1
L8003e378:
  lw $a2, 32($v0)
L8003e37c:
  lui $at, 0x8021
L8003e380:
  sb $a0, 127($at)
L8003e384:
  bgez $a2, L8003e390
L8003e388:
  addu $a0, $s5, $zero
L8003e38c:
  addiu $a2, $a2, 63
L8003e390:
  lui $a1, 0x8021
L8003e394:
  jal 0x80044380
L8003e398:
  sra $a2, $a2, 0x6
L8003e39c:
  j L8003e448
L8003e3a0:
  sll $zero, $zero, 0x0
L8003e3a4:
  lbu $v0, 1229($gp)
L8003e3a8:
  sll $zero, $zero, 0x0
L8003e3ac:
  beq $v0, $zero, L8003e448
L8003e3b0:
  sll $zero, $zero, 0x0
L8003e3b4:
  addiu $a0, $zero, 217
L8003e3b8:
  jal L8003d46c
L8003e3bc:
  addiu $a1, $zero, 1
L8003e3c0:
  lhu $v0, 1220($gp)
L8003e3c4:
  sll $zero, $zero, 0x0
L8003e3c8:
  ori $v0, $v0, 0x400
L8003e3cc:
  sh $v0, 1220($gp)
L8003e3d0:
  j L8003e448
L8003e3d4:
  sll $zero, $zero, 0x0
L8003e3d8:
  lbu $v1, 1223($gp)
L8003e3dc:
  sll $zero, $zero, 0x0
L8003e3e0:
  andi $v0, $v1, 0x80
L8003e3e4:
  bne $v0, $zero, L8003e420
L8003e3e8:
  ori $v0, $v1, 0x80
L8003e3ec:
  sb $v0, 1223($gp)
L8003e3f0:
  lbu $v0, 12($s3)
L8003e3f4:
  lbu $v1, 16($s2)
L8003e3f8:
  sll $zero, $zero, 0x0
L8003e3fc:
  sltu $v0, $v0, $v1
L8003e400:
  bne $v0, $zero, L8003e448
L8003e404:
  addu $a2, $v1, $zero
L8003e408:
  addu $a0, $s5, $zero
L8003e40c:
  lui $a1, 0x8001
L8003e410:
  jal 0x800443ec
L8003e414:
  addiu $a1, $a1, 900
L8003e418:
  j L8003e448
L8003e41c:
  sll $zero, $zero, 0x0
L8003e420:
  lbu $v0, 1229($gp)
L8003e424:
  sll $zero, $zero, 0x0
L8003e428:
  bne $v0, $zero, L8003e43c
L8003e42c:
  sll $zero, $zero, 0x0
L8003e430:
  lui $a0, 0x8001
L8003e434:
  jal 0x8008e870
L8003e438:
  addiu $a0, $a0, 920
L8003e43c:
  lui $a0, 0x8001
L8003e440:
  jal 0x8008e870
L8003e444:
  addiu $a0, $a0, 932
L8003e448:
  lw $ra, 48($sp)
L8003e44c:
  lw $s5, 44($sp)
L8003e450:
  lw $s4, 40($sp)
L8003e454:
  lw $s3, 36($sp)
L8003e458:
  lw $s2, 32($sp)
L8003e45c:
  lw $s1, 28($sp)
L8003e460:
  lw $s0, 24($sp)
L8003e464:
  jr $ra
L8003e468:
  addiu $sp, $sp, 56
L8003e46c:
  lhu $v0, 1266($gp)
L8003e470:
  ori $a1, $a1, 0x80
L8003e474:
  sb $a0, 1214($gp)
L8003e478:
  andi $v0, $v0, 0xff87
L8003e47c:
  sh $v0, 1266($gp)
L8003e480:
  or $v0, $v0, $a1
L8003e484:
  sh $v0, 1266($gp)
L8003e488:
  jr $ra
L8003e48c:
  sll $zero, $zero, 0x0
L8003e490:
  lbu $v0, 1251($gp)
L8003e494:
  addiu $sp, $sp, -40
L8003e498:
  andi $v1, $v0, 0xf
L8003e49c:
  sltiu $v0, $v1, 10
L8003e4a0:
  beq $v0, $zero, L8003e7c4
L8003e4a4:
  sw $ra, 32($sp)
L8003e4a8:
  lui $v0, 0x8001
L8003e4ac:
  addiu $v0, $v0, 1040
L8003e4b0:
  sll $v1, $v1, 0x2
L8003e4b4:
  addu $v1, $v1, $v0
L8003e4b8:
  lw $v0, 0($v1)
L8003e4bc:
  sll $zero, $zero, 0x0
L8003e4c0:
  jr $v0
L8003e4c4:
  sll $zero, $zero, 0x0
L8003e4c8:
  lbu $v1, 1251($gp)
L8003e4cc:
  sll $zero, $zero, 0x0
L8003e4d0:
  andi $v0, $v1, 0x80
L8003e4d4:
  bne $v0, $zero, L8003e4f0
L8003e4d8:
  addiu $v0, $zero, 1
L8003e4dc:
  ori $v0, $v1, 0x80
L8003e4e0:
  sb $v0, 1251($gp)
L8003e4e4:
  addiu $a0, $zero, 200
L8003e4e8:
  j L8003e7bc
L8003e4ec:
  addiu $a1, $zero, 32
L8003e4f0:
  lui $v1, 0x800a
L8003e4f4:
  lb $v1, -19635($v1)
L8003e4f8:
  sb $v0, 1251($gp)
L8003e4fc:
  beq $v1, $zero, L8003e510
L8003e500:
  addiu $v0, $zero, 9
L8003e504:
  sb $v0, 1251($gp)
L8003e508:
  j L8003e7c4
L8003e50c:
  sll $zero, $zero, 0x0
L8003e510:
  lbu $v1, 1251($gp)
L8003e514:
  sll $zero, $zero, 0x0
L8003e518:
  andi $v0, $v1, 0x80
L8003e51c:
  bne $v0, $zero, L8003e578
L8003e520:
  addiu $a1, $zero, 212
L8003e524:
  ori $v0, $v1, 0x80
L8003e528:
  lui $a0, 0x801d
L8003e52c:
  sb $v0, 1251($gp)
L8003e530:
  lbu $v0, 1265($gp)
L8003e534:
  lhu $v1, 1266($gp)
L8003e538:
  srl $v0, $v0, 0x4
L8003e53c:
  addiu $v0, $v0, 1
L8003e540:
  andi $v1, $v1, 0x200
L8003e544:
  beq $v1, $zero, L8003e550
L8003e548:
  sw $v0, 22088($a0)
L8003e54c:
  addiu $a1, $zero, 192
L8003e550:
  addu $a0, $a1, $zero
L8003e554:
  jal L8003e46c
L8003e558:
  addu $a1, $zero, $zero
L8003e55c:
  lbu $a0, 1265($gp)
L8003e560:
  jal 0x8008bc90
L8003e564:
  sll $zero, $zero, 0x0
L8003e568:
  beq $v0, $zero, L8003e55c
L8003e56c:
  sll $zero, $zero, 0x0
L8003e570:
  j L8003e640
L8003e574:
  sll $zero, $zero, 0x0
L8003e578:
  lw $v1, 1260($gp)
L8003e57c:
  sll $zero, $zero, 0x0
L8003e580:
  sltiu $v0, $v1, 5
L8003e584:
  beq $v0, $zero, L8003e7c4
L8003e588:
  lui $v0, 0x8001
L8003e58c:
  addiu $v0, $v0, 1080
L8003e590:
  sll $v1, $v1, 0x2
L8003e594:
  addu $v1, $v1, $v0
L8003e598:
  lw $v0, 0($v1)
L8003e59c:
  sll $zero, $zero, 0x0
L8003e5a0:
  jr $v0
L8003e5a4:
  sll $zero, $zero, 0x0
L8003e5a8:
  addiu $v0, $zero, 2
L8003e5ac:
  sb $v0, 1251($gp)
L8003e5b0:
  j L8003e7c4
L8003e5b4:
  sll $zero, $zero, 0x0
L8003e5b8:
  lui $a1, 0x800f
L8003e5bc:
  addiu $a1, $a1, -488
L8003e5c0:
  lui $a2, 0x800f
L8003e5c4:
  addiu $a2, $a2, -1088
L8003e5c8:
  addiu $a3, $sp, 24
L8003e5cc:
  lbu $a0, 1265($gp)
L8003e5d0:
  addiu $v0, $zero, 15
L8003e5d4:
  sw $zero, 16($sp)
L8003e5d8:
  jal 0x8008ca78
L8003e5dc:
  sw $v0, 20($sp)
L8003e5e0:
  bne $v0, $zero, L8003e6ec
L8003e5e4:
  addiu $v0, $zero, 6
L8003e5e8:
  lw $v0, 24($sp)
L8003e5ec:
  sll $zero, $zero, 0x0
L8003e5f0:
  beq $v0, $zero, L8003e6e8
L8003e5f4:
  addiu $v0, $zero, 3
L8003e5f8:
  sb $v0, 1251($gp)
L8003e5fc:
  lbu $v1, 1251($gp)
L8003e600:
  sll $zero, $zero, 0x0
L8003e604:
  andi $v0, $v1, 0x80
L8003e608:
  bne $v0, $zero, L8003e658
L8003e60c:
  addiu $a0, $zero, 213
L8003e610:
  ori $v0, $v1, 0x80
L8003e614:
  sb $v0, 1251($gp)
L8003e618:
  jal L8003e46c
L8003e61c:
  addu $a1, $zero, $zero
L8003e620:
  lui $a1, 0x800f
L8003e624:
  lbu $a0, 1265($gp)
L8003e628:
  lw $a2, 1224($gp)
L8003e62c:
  lhu $a3, 1212($gp)
L8003e630:
  lhu $v0, 1210($gp)
L8003e634:
  addiu $a1, $a1, -488
L8003e638:
  jal 0x8008c638
L8003e63c:
  sw $v0, 16($sp)
L8003e640:
  lhu $v0, 1266($gp)
L8003e644:
  sll $zero, $zero, 0x0
L8003e648:
  ori $v0, $v0, 0x1000
L8003e64c:
  sh $v0, 1266($gp)
L8003e650:
  j L8003e7c4
L8003e654:
  sll $zero, $zero, 0x0
L8003e658:
  lw $v1, 1260($gp)
L8003e65c:
  sll $zero, $zero, 0x0
L8003e660:
  sltiu $v0, $v1, 6
L8003e664:
  beq $v0, $zero, L8003e7c4
L8003e668:
  lui $v0, 0x8001
L8003e66c:
  addiu $v0, $v0, 1104
L8003e670:
  sll $v1, $v1, 0x2
L8003e674:
  addu $v1, $v1, $v0
L8003e678:
  lw $v0, 0($v1)
L8003e67c:
  sll $zero, $zero, 0x0
L8003e680:
  jr $v0
L8003e684:
  sll $zero, $zero, 0x0
L8003e688:
  lw $a0, 1224($gp)
L8003e68c:
  addiu $v0, $zero, 7
L8003e690:
  sb $v0, 1251($gp)
L8003e694:
  jal L8003d174
L8003e698:
  sll $zero, $zero, 0x0
L8003e69c:
  bne $v0, $zero, L8003e7c4
L8003e6a0:
  addiu $v0, $zero, 4
L8003e6a4:
  lhu $v1, 1266($gp)
L8003e6a8:
  sb $v0, 1251($gp)
L8003e6ac:
  andi $v0, $v1, 0x400
L8003e6b0:
  bne $v0, $zero, L8003e7b8
L8003e6b4:
  addiu $a0, $zero, 189
L8003e6b8:
  ori $v0, $v1, 0x400
L8003e6bc:
  sh $v0, 1266($gp)
L8003e6c0:
  j L8003e7c4
L8003e6c4:
  sll $zero, $zero, 0x0
L8003e6c8:
  addiu $v0, $zero, 5
L8003e6cc:
  sb $v0, 1251($gp)
L8003e6d0:
  j L8003e7c4
L8003e6d4:
  sll $zero, $zero, 0x0
L8003e6d8:
  addiu $v0, $zero, 8
L8003e6dc:
  sb $v0, 1251($gp)
L8003e6e0:
  j L8003e7c4
L8003e6e4:
  sll $zero, $zero, 0x0
L8003e6e8:
  addiu $v0, $zero, 6
L8003e6ec:
  sb $v0, 1251($gp)
L8003e6f0:
  j L8003e7c4
L8003e6f4:
  sll $zero, $zero, 0x0
L8003e6f8:
  lbu $v1, 1251($gp)
L8003e6fc:
  sll $zero, $zero, 0x0
L8003e700:
  andi $v0, $v1, 0x80
L8003e704:
  bne $v0, $zero, L8003e720
L8003e708:
  andi $v0, $v1, 0x40
L8003e70c:
  ori $v0, $v1, 0x80
L8003e710:
  sb $v0, 1251($gp)
L8003e714:
  addiu $a0, $zero, 189
L8003e718:
  j L8003e7bc
L8003e71c:
  addiu $a1, $zero, 16
L8003e720:
  bne $v0, $zero, L8003e73c
L8003e724:
  addiu $v0, $zero, 9
L8003e728:
  ori $v0, $v1, 0x40
L8003e72c:
  sb $v0, 1251($gp)
L8003e730:
  addiu $a0, $zero, 188
L8003e734:
  j L8003e7bc
L8003e738:
  addiu $a1, $zero, 32
L8003e73c:
  lui $v1, 0x800a
L8003e740:
  lb $v1, -19635($v1)
L8003e744:
  sb $v0, 1251($gp)
L8003e748:
  bne $v1, $zero, L8003e7c4
L8003e74c:
  addiu $v1, $zero, 3
L8003e750:
  lhu $v0, 1212($gp)
L8003e754:
  sb $v1, 1251($gp)
L8003e758:
  addiu $v0, $v0, 1664
L8003e75c:
  sh $v0, 1212($gp)
L8003e760:
  j L8003e7c4
L8003e764:
  sll $zero, $zero, 0x0
L8003e768:
  j L8003e7b8
L8003e76c:
  addiu $a0, $zero, 193
L8003e770:
  j L8003e7b8
L8003e774:
  addiu $a0, $zero, 211
L8003e778:
  lhu $v0, 1266($gp)
L8003e77c:
  addiu $v1, $zero, 1
L8003e780:
  sb $v1, 1255($gp)
L8003e784:
  andi $v0, $v0, 0x200
L8003e788:
  beq $v0, $zero, L8003e798
L8003e78c:
  addiu $a0, $zero, 208
L8003e790:
  j L8003e7bc
L8003e794:
  addiu $a1, $zero, 8
L8003e798:
  sb $zero, 1228($gp)
L8003e79c:
  j L8003e7bc
L8003e7a0:
  addiu $a1, $zero, 24
L8003e7a4:
  j L8003e7b8
L8003e7a8:
  addiu $a0, $zero, 211
L8003e7ac:
  addiu $v0, $zero, 3
L8003e7b0:
  sb $v0, 1255($gp)
L8003e7b4:
  addiu $a0, $zero, 199
L8003e7b8:
  addiu $a1, $zero, 24
L8003e7bc:
  jal L8003e46c
L8003e7c0:
  sll $zero, $zero, 0x0
L8003e7c4:
  lw $ra, 32($sp)
L8003e7c8:
  sll $zero, $zero, 0x0
L8003e7cc:
  jr $ra
L8003e7d0:
  addiu $sp, $sp, 40
L8003e7d4:
  lbu $v1, 1209($gp)
L8003e7d8:
  addiu $sp, $sp, -24
L8003e7dc:
  andi $v0, $v1, 0x80
L8003e7e0:
  bne $v0, $zero, L8003e7f4
L8003e7e4:
  sw $ra, 16($sp)
L8003e7e8:
  ori $v0, $v1, 0x80
L8003e7ec:
  sb $v0, 1209($gp)
L8003e7f0:
  sb $zero, 1251($gp)
L8003e7f4:
  jal L8003e490
L8003e7f8:
  sll $zero, $zero, 0x0
L8003e7fc:
  lw $ra, 16($sp)
L8003e800:
  sll $zero, $zero, 0x0
L8003e804:
  jr $ra
L8003e808:
  addiu $sp, $sp, 24
L8003e80c:
  lbu $v1, 1209($gp)
L8003e810:
  addiu $sp, $sp, -24
L8003e814:
  andi $v0, $v1, 0x80
L8003e818:
  bne $v0, $zero, L8003e83c
L8003e81c:
  sw $ra, 16($sp)
L8003e820:
  ori $v0, $v1, 0x80
L8003e824:
  sb $v0, 1209($gp)
L8003e828:
  lhu $v0, 1266($gp)
L8003e82c:
  addiu $v1, $zero, 1
L8003e830:
  sb $v1, 1251($gp)
L8003e834:
  ori $v0, $v0, 0x200
L8003e838:
  sh $v0, 1266($gp)
L8003e83c:
  jal L8003e490
L8003e840:
  sll $zero, $zero, 0x0
L8003e844:
  lw $ra, 16($sp)
L8003e848:
  sll $zero, $zero, 0x0
L8003e84c:
  jr $ra
L8003e850:
  addiu $sp, $sp, 24
L8003e854:
  lbu $v0, 1251($gp)
L8003e858:
  addiu $sp, $sp, -40
L8003e85c:
  sw $ra, 36($sp)
L8003e860:
  andi $v1, $v0, 0xf
L8003e864:
  sltiu $v0, $v1, 15
L8003e868:
  beq $v0, $zero, L8003ee80
L8003e86c:
  sw $s0, 32($sp)
L8003e870:
  lui $v0, 0x8001
L8003e874:
  addiu $v0, $v0, 1128
L8003e878:
  sll $v1, $v1, 0x2
L8003e87c:
  addu $v1, $v1, $v0
L8003e880:
  lw $v0, 0($v1)
L8003e884:
  sll $zero, $zero, 0x0
L8003e888:
  jr $v0
L8003e88c:
  sll $zero, $zero, 0x0
L8003e890:
  lbu $v1, 1251($gp)
L8003e894:
  sll $zero, $zero, 0x0
L8003e898:
  andi $v0, $v1, 0x80
L8003e89c:
  bne $v0, $zero, L8003e8cc
L8003e8a0:
  addiu $v0, $zero, 1
L8003e8a4:
  addiu $a0, $zero, 201
L8003e8a8:
  addiu $a1, $zero, 32
L8003e8ac:
  ori $v0, $v1, 0x80
L8003e8b0:
  sb $v0, 1251($gp)
L8003e8b4:
  lbu $v0, 1265($gp)
L8003e8b8:
  lui $v1, 0x801d
L8003e8bc:
  srl $v0, $v0, 0x4
L8003e8c0:
  addiu $v0, $v0, 1
L8003e8c4:
  j L8003ee78
L8003e8c8:
  sw $v0, 22088($v1)
L8003e8cc:
  lui $v1, 0x800a
L8003e8d0:
  lb $v1, -19635($v1)
L8003e8d4:
  sb $v0, 1251($gp)
L8003e8d8:
  bne $v1, $zero, L8003ed5c
L8003e8dc:
  addiu $v0, $zero, 12
L8003e8e0:
  lbu $v1, 1251($gp)
L8003e8e4:
  sll $zero, $zero, 0x0
L8003e8e8:
  andi $v0, $v1, 0x80
L8003e8ec:
  bne $v0, $zero, L8003e91c
L8003e8f0:
  ori $v0, $v1, 0x80
L8003e8f4:
  sb $v0, 1251($gp)
L8003e8f8:
  addiu $a0, $zero, 212
L8003e8fc:
  jal L8003e46c
L8003e900:
  addu $a1, $zero, $zero
L8003e904:
  jal 0x8008bc90
L8003e908:
  addu $a0, $zero, $zero
L8003e90c:
  beq $v0, $zero, L8003e904
L8003e910:
  sll $zero, $zero, 0x0
L8003e914:
  j L8003edb0
L8003e918:
  sll $zero, $zero, 0x0
L8003e91c:
  lw $v1, 1260($gp)
L8003e920:
  sll $zero, $zero, 0x0
L8003e924:
  sltiu $v0, $v1, 5
L8003e928:
  beq $v0, $zero, L8003ee80
L8003e92c:
  lui $v0, 0x8001
L8003e930:
  addiu $v0, $v0, 1192
L8003e934:
  sll $v1, $v1, 0x2
L8003e938:
  addu $v1, $v1, $v0
L8003e93c:
  lw $v0, 0($v1)
L8003e940:
  sll $zero, $zero, 0x0
L8003e944:
  jr $v0
L8003e948:
  sll $zero, $zero, 0x0
L8003e94c:
  addiu $v0, $zero, 3
L8003e950:
  sb $v0, 1251($gp)
L8003e954:
  j L8003ee80
L8003e958:
  sll $zero, $zero, 0x0
L8003e95c:
  lhu $v0, 1266($gp)
L8003e960:
  addiu $v1, $zero, 4
L8003e964:
  sb $v1, 1251($gp)
L8003e968:
  andi $v0, $v0, 0x100
L8003e96c:
  bne $v0, $zero, L8003ee80
L8003e970:
  sll $zero, $zero, 0x0
L8003e974:
  lbu $v0, 1228($gp)
L8003e978:
  sll $zero, $zero, 0x0
L8003e97c:
  bne $v0, $zero, L8003ee80
L8003e980:
  addiu $v0, $zero, 14
L8003e984:
  j L8003ed30
L8003e988:
  sll $zero, $zero, 0x0
L8003e98c:
  lbu $v1, 1251($gp)
L8003e990:
  sll $zero, $zero, 0x0
L8003e994:
  andi $v0, $v1, 0x80
L8003e998:
  bne $v0, $zero, L8003e9b8
L8003e99c:
  andi $v0, $v1, 0x40
L8003e9a0:
  ori $v0, $v1, 0x80
L8003e9a4:
  sb $v0, 1251($gp)
L8003e9a8:
  addiu $v0, $zero, 3
L8003e9ac:
  sb $v0, 1252($gp)
L8003e9b0:
  j L8003ee80
L8003e9b4:
  sll $zero, $zero, 0x0
L8003e9b8:
  beq $v0, $zero, L8003ee80
L8003e9bc:
  addiu $a0, $zero, 184
L8003e9c0:
  j L8003ee78
L8003e9c4:
  addiu $a1, $zero, 24
L8003e9c8:
  addu $a0, $zero, $zero
L8003e9cc:
  lui $a1, 0x800a
L8003e9d0:
  addiu $a1, $a1, -20624
L8003e9d4:
  lui $v0, 0x800f
L8003e9d8:
  addiu $s0, $v0, -1088
L8003e9dc:
  addu $a2, $s0, $zero
L8003e9e0:
  addiu $a3, $sp, 24
L8003e9e4:
  addiu $v0, $zero, 15
L8003e9e8:
  sw $zero, 16($sp)
L8003e9ec:
  jal 0x8008ca78
L8003e9f0:
  sw $v0, 20($sp)
L8003e9f4:
  bne $v0, $zero, L8003eb84
L8003e9f8:
  addiu $v0, $zero, 13
L8003e9fc:
  lui $a0, 0x800f
L8003ea00:
  addiu $a0, $a0, -488
L8003ea04:
  lw $a2, 24($sp)
L8003ea08:
  jal 0x80044598
L8003ea0c:
  addu $a1, $s0, $zero
L8003ea10:
  bltz $v0, L8003ea24
L8003ea14:
  addiu $v0, $zero, 7
L8003ea18:
  sb $v0, 1251($gp)
L8003ea1c:
  j L8003ee80
L8003ea20:
  sll $zero, $zero, 0x0
L8003ea24:
  lhu $v0, 1266($gp)
L8003ea28:
  sll $zero, $zero, 0x0
L8003ea2c:
  andi $v0, $v0, 0x100
L8003ea30:
  bne $v0, $zero, L8003ea48
L8003ea34:
  lui $a0, 0x800f
L8003ea38:
  lbu $v0, 1228($gp)
L8003ea3c:
  sll $zero, $zero, 0x0
L8003ea40:
  beq $v0, $zero, L8003ed30
L8003ea44:
  addiu $v0, $zero, 14
L8003ea48:
  lw $a1, 24($sp)
L8003ea4c:
  jal 0x80044544
L8003ea50:
  addiu $a0, $a0, -1088
L8003ea54:
  lbu $a3, 1236($gp)
L8003ea58:
  addu $a2, $v0, $zero
L8003ea5c:
  slt $v0, $a2, $a3
L8003ea60:
  bne $v0, $zero, L8003ea78
L8003ea64:
  addiu $a0, $zero, 219
L8003ea68:
  addiu $v0, $zero, 6
L8003ea6c:
  sb $v0, 1251($gp)
L8003ea70:
  j L8003ebd8
L8003ea74:
  addu $a0, $zero, $zero
L8003ea78:
  addiu $a1, $zero, 24
L8003ea7c:
  lui $v1, 0x801d
L8003ea80:
  addiu $v0, $zero, 15
L8003ea84:
  subu $v0, $v0, $a2
L8003ea88:
  sw $v0, 22024($v1)
L8003ea8c:
  addiu $v1, $v1, 22024
L8003ea90:
  j L8003ee78
L8003ea94:
  sw $a3, 4($v1)
L8003ea98:
  lbu $v1, 1251($gp)
L8003ea9c:
  sll $zero, $zero, 0x0
L8003eaa0:
  andi $v0, $v1, 0x80
L8003eaa4:
  bne $v0, $zero, L8003eac0
L8003eaa8:
  andi $v0, $v1, 0x40
L8003eaac:
  ori $v0, $v1, 0x80
L8003eab0:
  sb $v0, 1251($gp)
L8003eab4:
  addiu $a0, $zero, 222
L8003eab8:
  j L8003ee78
L8003eabc:
  addiu $a1, $zero, 16
L8003eac0:
  bne $v0, $zero, L8003ead8
L8003eac4:
  ori $v0, $v1, 0x40
L8003eac8:
  sb $v0, 1251($gp)
L8003eacc:
  addiu $a0, $zero, 223
L8003ead0:
  j L8003ee78
L8003ead4:
  addiu $a1, $zero, 32
L8003ead8:
  lui $v0, 0x800a
L8003eadc:
  lb $v0, -19635($v0)
L8003eae0:
  sll $zero, $zero, 0x0
L8003eae4:
  beq $v0, $zero, L8003ed58
L8003eae8:
  addiu $v0, $zero, 5
L8003eaec:
  sb $v0, 1251($gp)
L8003eaf0:
  addiu $a0, $zero, 190
L8003eaf4:
  j L8003ee78
L8003eaf8:
  addu $a1, $zero, $zero
L8003eafc:
  lbu $v1, 1251($gp)
L8003eb00:
  sll $zero, $zero, 0x0
L8003eb04:
  andi $v0, $v1, 0x80
L8003eb08:
  bne $v0, $zero, L8003eb30
L8003eb0c:
  addiu $v0, $zero, 2
L8003eb10:
  ori $v0, $v1, 0x80
L8003eb14:
  sb $v0, 1251($gp)
L8003eb18:
  jal 0x8008bc90
L8003eb1c:
  addu $a0, $zero, $zero
L8003eb20:
  beq $v0, $zero, L8003eb18
L8003eb24:
  sll $zero, $zero, 0x0
L8003eb28:
  j L8003edb0
L8003eb2c:
  sll $zero, $zero, 0x0
L8003eb30:
  lw $v1, 1256($gp)
L8003eb34:
  sll $zero, $zero, 0x0
L8003eb38:
  bne $v1, $v0, L8003ee80
L8003eb3c:
  sll $zero, $zero, 0x0
L8003eb40:
  lw $v1, 1260($gp)
L8003eb44:
  sll $zero, $zero, 0x0
L8003eb48:
  sltiu $v0, $v1, 5
L8003eb4c:
  beq $v0, $zero, L8003ee80
L8003eb50:
  lui $v0, 0x8001
L8003eb54:
  addiu $v0, $v0, 1216
L8003eb58:
  sll $v1, $v1, 0x2
L8003eb5c:
  addu $v1, $v1, $v0
L8003eb60:
  lw $v0, 0($v1)
L8003eb64:
  sll $zero, $zero, 0x0
L8003eb68:
  jr $v0
L8003eb6c:
  sll $zero, $zero, 0x0
L8003eb70:
  j L8003ee74
L8003eb74:
  addiu $a0, $zero, 195
L8003eb78:
  j L8003ee74
L8003eb7c:
  addiu $a0, $zero, 195
L8003eb80:
  addiu $v0, $zero, 13
L8003eb84:
  sb $v0, 1251($gp)
L8003eb88:
  j L8003ee80
L8003eb8c:
  sll $zero, $zero, 0x0
L8003eb90:
  lbu $v1, 1251($gp)
L8003eb94:
  sll $zero, $zero, 0x0
L8003eb98:
  andi $v0, $v1, 0x40
L8003eb9c:
  bne $v0, $zero, L8003ebc8
L8003eba0:
  addiu $v0, $zero, 1
L8003eba4:
  ori $v0, $v1, 0x40
L8003eba8:
  sb $v0, 1251($gp)
L8003ebac:
  jal 0x8008cf00
L8003ebb0:
  addu $a0, $zero, $zero
L8003ebb4:
  bne $v0, $zero, L8003ee74
L8003ebb8:
  addiu $a0, $zero, 221
L8003ebbc:
  addiu $a0, $zero, 191
L8003ebc0:
  j L8003ee78
L8003ebc4:
  addiu $a1, $zero, 16
L8003ebc8:
  sb $v0, 1251($gp)
L8003ebcc:
  j L8003ee80
L8003ebd0:
  sll $zero, $zero, 0x0
L8003ebd4:
  addu $a0, $zero, $zero
L8003ebd8:
  lbu $a2, 1236($gp)
L8003ebdc:
  lui $a1, 0x800f
L8003ebe0:
  jal 0x8008ce04
L8003ebe4:
  addiu $a1, $a1, -488
L8003ebe8:
  beq $v0, $zero, L8003ebfc
L8003ebec:
  addiu $v0, $zero, 11
L8003ebf0:
  sb $v0, 1251($gp)
L8003ebf4:
  j L8003ee80
L8003ebf8:
  sll $zero, $zero, 0x0
L8003ebfc:
  lhu $v0, 1266($gp)
L8003ec00:
  sll $zero, $zero, 0x0
L8003ec04:
  andi $v0, $v0, 0x100
L8003ec08:
  bne $v0, $zero, L8003ed68
L8003ec0c:
  addiu $v0, $zero, 8
L8003ec10:
  lw $v0, 1224($gp)
L8003ec14:
  lhu $v1, 1210($gp)
L8003ec18:
  sh $zero, 1212($gp)
L8003ec1c:
  addiu $v0, $v0, -512
L8003ec20:
  addiu $v1, $v1, 512
L8003ec24:
  sw $v0, 1224($gp)
L8003ec28:
  sh $v1, 1210($gp)
L8003ec2c:
  j L8003ed68
L8003ec30:
  addiu $v0, $zero, 8
L8003ec34:
  lbu $v1, 1251($gp)
L8003ec38:
  sll $zero, $zero, 0x0
L8003ec3c:
  andi $v0, $v1, 0x80
L8003ec40:
  bne $v0, $zero, L8003ec80
L8003ec44:
  andi $v0, $v1, 0x40
L8003ec48:
  addu $a0, $zero, $zero
L8003ec4c:
  lui $a1, 0x800f
L8003ec50:
  addiu $a1, $a1, -488
L8003ec54:
  lui $a2, 0x801e
L8003ec58:
  addiu $a2, $a2, -16384
L8003ec5c:
  lhu $a3, 1212($gp)
L8003ec60:
  ori $v0, $v1, 0x80
L8003ec64:
  sb $v0, 1251($gp)
L8003ec68:
  addiu $v0, $zero, 1152
L8003ec6c:
  sb $zero, 1252($gp)
L8003ec70:
  jal 0x8008c638
L8003ec74:
  sw $v0, 16($sp)
L8003ec78:
  j L8003edb0
L8003ec7c:
  sll $zero, $zero, 0x0
L8003ec80:
  bne $v0, $zero, L8003ed44
L8003ec84:
  ori $v0, $v1, 0x40
L8003ec88:
  lw $a0, 1260($gp)
L8003ec8c:
  sb $v0, 1251($gp)
L8003ec90:
  beq $a0, $zero, L8003ecb0
L8003ec94:
  addiu $v0, $zero, 13
L8003ec98:
  sb $v0, 1251($gp)
L8003ec9c:
  addiu $v0, $zero, 1
L8003eca0:
  bne $a0, $v0, L8003ee80
L8003eca4:
  addiu $v0, $zero, 9
L8003eca8:
  j L8003edec
L8003ecac:
  sll $zero, $zero, 0x0
L8003ecb0:
  lbu $v0, 1228($gp)
L8003ecb4:
  sll $zero, $zero, 0x0
L8003ecb8:
  bne $v0, $zero, L8003ed3c
L8003ecbc:
  addiu $a0, $zero, 207
L8003ecc0:
  lw $a0, 1224($gp)
L8003ecc4:
  lui $v0, 0x801e
L8003ecc8:
  addiu $s0, $v0, -16384
L8003eccc:
  jal L8003d2b8
L8003ecd0:
  addu $a1, $s0, $zero
L8003ecd4:
  bne $v0, $zero, L8003ed3c
L8003ecd8:
  addiu $a0, $zero, 207
L8003ecdc:
  lbu $v0, 1252($gp)
L8003ece0:
  sll $zero, $zero, 0x0
L8003ece4:
  bne $v0, $zero, L8003ed2c
L8003ece8:
  addu $a0, $zero, $zero
L8003ecec:
  lui $a1, 0x800f
L8003ecf0:
  addiu $a1, $a1, -488
L8003ecf4:
  addu $a2, $s0, $zero
L8003ecf8:
  lhu $a3, 1212($gp)
L8003ecfc:
  addiu $v0, $v0, 1
L8003ed00:
  sb $v0, 1252($gp)
L8003ed04:
  addiu $v0, $zero, 1152
L8003ed08:
  sw $v0, 16($sp)
L8003ed0c:
  lbu $v0, 1251($gp)
L8003ed10:
  sll $zero, $zero, 0x0
L8003ed14:
  andi $v0, $v0, 0xbf
L8003ed18:
  sb $v0, 1251($gp)
L8003ed1c:
  jal 0x8008c638
L8003ed20:
  addiu $a3, $a3, 1664
L8003ed24:
  j L8003edb0
L8003ed28:
  sll $zero, $zero, 0x0
L8003ed2c:
  addiu $v0, $zero, 14
L8003ed30:
  sb $v0, 1251($gp)
L8003ed34:
  j L8003ee80
L8003ed38:
  sll $zero, $zero, 0x0
L8003ed3c:
  j L8003ee78
L8003ed40:
  addiu $a1, $zero, 32
L8003ed44:
  lui $v0, 0x800a
L8003ed48:
  lb $v0, -19635($v0)
L8003ed4c:
  sll $zero, $zero, 0x0
L8003ed50:
  beq $v0, $zero, L8003ed68
L8003ed54:
  addiu $v0, $zero, 8
L8003ed58:
  addiu $v0, $zero, 12
L8003ed5c:
  sb $v0, 1251($gp)
L8003ed60:
  j L8003ee80
L8003ed64:
  sll $zero, $zero, 0x0
L8003ed68:
  sb $v0, 1251($gp)
L8003ed6c:
  lbu $v1, 1251($gp)
L8003ed70:
  sll $zero, $zero, 0x0
L8003ed74:
  andi $v0, $v1, 0x80
L8003ed78:
  bne $v0, $zero, L8003edc8
L8003ed7c:
  addiu $a0, $zero, 214
L8003ed80:
  ori $v0, $v1, 0x80
L8003ed84:
  sb $v0, 1251($gp)
L8003ed88:
  jal L8003e46c
L8003ed8c:
  addu $a1, $zero, $zero
L8003ed90:
  addu $a0, $zero, $zero
L8003ed94:
  lui $a1, 0x800f
L8003ed98:
  lw $a2, 1224($gp)
L8003ed9c:
  lhu $a3, 1212($gp)
L8003eda0:
  lhu $v0, 1210($gp)
L8003eda4:
  addiu $a1, $a1, -488
L8003eda8:
  jal 0x8008c858
L8003edac:
  sw $v0, 16($sp)
L8003edb0:
  lhu $v0, 1266($gp)
L8003edb4:
  sll $zero, $zero, 0x0
L8003edb8:
  ori $v0, $v0, 0x1000
L8003edbc:
  sh $v0, 1266($gp)
L8003edc0:
  j L8003ee80
L8003edc4:
  sll $zero, $zero, 0x0
L8003edc8:
  lw $v1, 1260($gp)
L8003edcc:
  sll $zero, $zero, 0x0
L8003edd0:
  beq $v1, $zero, L8003edf8
L8003edd4:
  addiu $v0, $zero, 11
L8003edd8:
  sb $v0, 1251($gp)
L8003eddc:
  addiu $v0, $zero, 1
L8003ede0:
  bne $v1, $v0, L8003ee80
L8003ede4:
  sll $zero, $zero, 0x0
L8003ede8:
  addiu $v0, $zero, 9
L8003edec:
  sb $v0, 1251($gp)
L8003edf0:
  j L8003ee80
L8003edf4:
  sll $zero, $zero, 0x0
L8003edf8:
  addiu $v0, $zero, 10
L8003edfc:
  sb $v0, 1251($gp)
L8003ee00:
  j L8003ee80
L8003ee04:
  sll $zero, $zero, 0x0
L8003ee08:
  j L8003ee74
L8003ee0c:
  addiu $a0, $zero, 210
L8003ee10:
  lhu $v0, 1266($gp)
L8003ee14:
  addiu $v1, $zero, 1
L8003ee18:
  sb $v1, 1255($gp)
L8003ee1c:
  andi $v0, $v0, 0x100
L8003ee20:
  bne $v0, $zero, L8003ee3c
L8003ee24:
  addiu $a2, $zero, 204
L8003ee28:
  lw $v0, 1200($gp)
L8003ee2c:
  addiu $a2, $zero, 209
L8003ee30:
  sb $zero, 1228($gp)
L8003ee34:
  addiu $v0, $v0, 1
L8003ee38:
  sw $v0, 1200($gp)
L8003ee3c:
  j L8003ee74
L8003ee40:
  addu $a0, $a2, $zero
L8003ee44:
  j L8003ee74
L8003ee48:
  addiu $a0, $zero, 217
L8003ee4c:
  addiu $a0, $zero, 205
L8003ee50:
  jal L8003e46c
L8003ee54:
  addiu $a1, $zero, 24
L8003ee58:
  addiu $v0, $zero, 3
L8003ee5c:
  sb $v0, 1255($gp)
L8003ee60:
  j L8003ee80
L8003ee64:
  sll $zero, $zero, 0x0
L8003ee68:
  j L8003ee74
L8003ee6c:
  addiu $a0, $zero, 218
L8003ee70:
  addiu $a0, $zero, 206
L8003ee74:
  addiu $a1, $zero, 24
L8003ee78:
  jal L8003e46c
L8003ee7c:
  sll $zero, $zero, 0x0
L8003ee80:
  lw $ra, 36($sp)
L8003ee84:
  lw $s0, 32($sp)
L8003ee88:
  jr $ra
L8003ee8c:
  addiu $sp, $sp, 40
L8003ee90:
  lbu $v1, 1209($gp)
L8003ee94:
  addiu $sp, $sp, -24
L8003ee98:
  andi $v0, $v1, 0x80
L8003ee9c:
  bne $v0, $zero, L8003eeb0
L8003eea0:
  sw $ra, 16($sp)
L8003eea4:
  ori $v0, $v1, 0x80
L8003eea8:
  sb $v0, 1209($gp)
L8003eeac:
  sb $zero, 1251($gp)
L8003eeb0:
  jal L8003e854
L8003eeb4:
  sll $zero, $zero, 0x0
L8003eeb8:
  lw $ra, 16($sp)
L8003eebc:
  sll $zero, $zero, 0x0
L8003eec0:
  jr $ra
L8003eec4:
  addiu $sp, $sp, 24
L8003eec8:
  jr $ra
L8003eecc:
  sll $zero, $zero, 0x0
L8003eed0:
  lbu $v1, 1209($gp)
L8003eed4:
  addiu $sp, $sp, -40
L8003eed8:
  sw $ra, 36($sp)
L8003eedc:
  andi $v0, $v1, 0x80
L8003eee0:
  bne $v0, $zero, L8003ef00
L8003eee4:
  sw $s0, 32($sp)
L8003eee8:
  addiu $a0, $zero, 192
L8003eeec:
  ori $v0, $v1, 0x80
L8003eef0:
  sb $v0, 1209($gp)
L8003eef4:
  jal L8003e46c
L8003eef8:
  addu $a1, $zero, $zero
L8003eefc:
  sb $zero, 1251($gp)
L8003ef00:
  lbu $v1, 1251($gp)
L8003ef04:
  addiu $v0, $zero, 1
L8003ef08:
  andi $s0, $v1, 0xf
L8003ef0c:
  beq $s0, $v0, L8003eff4
L8003ef10:
  slti $v0, $s0, 2
L8003ef14:
  beq $v0, $zero, L8003ef2c
L8003ef18:
  sll $zero, $zero, 0x0
L8003ef1c:
  beq $s0, $zero, L8003ef48
L8003ef20:
  andi $v0, $v1, 0x80
L8003ef24:
  j L8003f2a0
L8003ef28:
  sll $zero, $zero, 0x0
L8003ef2c:
  addiu $v0, $zero, 2
L8003ef30:
  beq $s0, $v0, L8003f070
L8003ef34:
  addiu $v0, $zero, 3
L8003ef38:
  beq $s0, $v0, L8003f190
L8003ef3c:
  sll $zero, $zero, 0x0
L8003ef40:
  j L8003f2a0
L8003ef44:
  sll $zero, $zero, 0x0
L8003ef48:
  bne $v0, $zero, L8003ef84
L8003ef4c:
  ori $v0, $v1, 0x80
L8003ef50:
  sb $v0, 1251($gp)
L8003ef54:
  lbu $v0, 1265($gp)
L8003ef58:
  lui $v1, 0x801d
L8003ef5c:
  srl $v0, $v0, 0x4
L8003ef60:
  addiu $v0, $v0, 1
L8003ef64:
  sw $v0, 22088($v1)
L8003ef68:
  lbu $a0, 1265($gp)
L8003ef6c:
  jal 0x8008bc90
L8003ef70:
  sll $zero, $zero, 0x0
L8003ef74:
  beq $v0, $zero, L8003ef68
L8003ef78:
  sll $zero, $zero, 0x0
L8003ef7c:
  j L8003f210
L8003ef80:
  sll $zero, $zero, 0x0
L8003ef84:
  lw $v1, 1260($gp)
L8003ef88:
  sll $zero, $zero, 0x0
L8003ef8c:
  sltiu $v0, $v1, 5
L8003ef90:
  beq $v0, $zero, L8003f2a0
L8003ef94:
  lui $v0, 0x8001
L8003ef98:
  addiu $v0, $v0, 1240
L8003ef9c:
  sll $v1, $v1, 0x2
L8003efa0:
  addu $v1, $v1, $v0
L8003efa4:
  lw $v0, 0($v1)
L8003efa8:
  sll $zero, $zero, 0x0
L8003efac:
  jr $v0
L8003efb0:
  sll $zero, $zero, 0x0
L8003efb4:
  j L8003f298
L8003efb8:
  addiu $a0, $zero, 193
L8003efbc:
  lbu $v0, 1265($gp)
L8003efc0:
  addiu $v1, $zero, 1
L8003efc4:
  sb $v1, 1251($gp)
L8003efc8:
  xori $v0, $v0, 0x10
L8003efcc:
  sb $v0, 1265($gp)
L8003efd0:
  beq $v0, $zero, L8003f2a0
L8003efd4:
  sll $zero, $zero, 0x0
L8003efd8:
  sb $zero, 1251($gp)
L8003efdc:
  j L8003f2a0
L8003efe0:
  sll $zero, $zero, 0x0
L8003efe4:
  j L8003f298
L8003efe8:
  addiu $a0, $zero, 218
L8003efec:
  j L8003f298
L8003eff0:
  addiu $a0, $zero, 195
L8003eff4:
  lui $a1, 0x800f
L8003eff8:
  addiu $a1, $a1, -488
L8003effc:
  lui $a2, 0x800f
L8003f000:
  addiu $a2, $a2, -1088
L8003f004:
  addiu $a3, $sp, 24
L8003f008:
  addiu $v0, $zero, 15
L8003f00c:
  lbu $a0, 1265($gp)
L8003f010:
  lui $v1, 0x801d
L8003f014:
  sw $zero, 16($sp)
L8003f018:
  sw $v0, 20($sp)
L8003f01c:
  addu $v0, $a0, $zero
L8003f020:
  srl $v0, $v0, 0x4
L8003f024:
  addiu $v0, $v0, 1
L8003f028:
  jal 0x8008ca78
L8003f02c:
  sw $v0, 22088($v1)
L8003f030:
  bne $v0, $zero, L8003f298
L8003f034:
  addiu $a0, $zero, 218
L8003f038:
  lw $v0, 24($sp)
L8003f03c:
  sll $zero, $zero, 0x0
L8003f040:
  beq $v0, $zero, L8003f298
L8003f044:
  addiu $a0, $zero, 195
L8003f048:
  lbu $v0, 1265($gp)
L8003f04c:
  sll $zero, $zero, 0x0
L8003f050:
  xori $v0, $v0, 0x10
L8003f054:
  sb $v0, 1265($gp)
L8003f058:
  beq $v0, $zero, L8003f06c
L8003f05c:
  addiu $v0, $zero, 2
L8003f060:
  sb $s0, 1251($gp)
L8003f064:
  j L8003f2a0
L8003f068:
  sll $zero, $zero, 0x0
L8003f06c:
  sb $v0, 1251($gp)
L8003f070:
  lbu $a0, 1251($gp)
L8003f074:
  sll $zero, $zero, 0x0
L8003f078:
  andi $v0, $a0, 0x80
L8003f07c:
  bne $v0, $zero, L8003f0d0
L8003f080:
  andi $v0, $a0, 0x40
L8003f084:
  lui $a1, 0x800f
L8003f088:
  addiu $a1, $a1, -488
L8003f08c:
  lui $a2, 0x801e
L8003f090:
  addiu $a2, $a2, -16384
L8003f094:
  ori $v0, $a0, 0x80
L8003f098:
  sb $v0, 1251($gp)
L8003f09c:
  addiu $v0, $zero, 1152
L8003f0a0:
  lbu $a0, 1265($gp)
L8003f0a4:
  lhu $a3, 1212($gp)
L8003f0a8:
  lui $v1, 0x801d
L8003f0ac:
  sb $zero, 1252($gp)
L8003f0b0:
  sw $v0, 16($sp)
L8003f0b4:
  addu $v0, $a0, $zero
L8003f0b8:
  srl $v0, $v0, 0x4
L8003f0bc:
  addiu $v0, $v0, 1
L8003f0c0:
  jal 0x8008c638
L8003f0c4:
  sw $v0, 22088($v1)
L8003f0c8:
  j L8003f210
L8003f0cc:
  sll $zero, $zero, 0x0
L8003f0d0:
  bne $v0, $zero, L8003f0e8
L8003f0d4:
  ori $v0, $a0, 0x40
L8003f0d8:
  lw $v1, 1260($gp)
L8003f0dc:
  sb $v0, 1251($gp)
L8003f0e0:
  bne $v1, $zero, L8003f298
L8003f0e4:
  addiu $a0, $zero, 218
L8003f0e8:
  lbu $v0, 1265($gp)
L8003f0ec:
  lw $a0, 1224($gp)
L8003f0f0:
  beq $v0, $zero, L8003f0fc
L8003f0f4:
  lui $v0, 0x801e
L8003f0f8:
  lw $a0, 1240($gp)
L8003f0fc:
  addiu $s0, $v0, -16384
L8003f100:
  jal L8003d288
L8003f104:
  addu $a1, $s0, $zero
L8003f108:
  bne $v0, $zero, L8003f164
L8003f10c:
  sll $zero, $zero, 0x0
L8003f110:
  lbu $v0, 1252($gp)
L8003f114:
  sll $zero, $zero, 0x0
L8003f118:
  bne $v0, $zero, L8003f298
L8003f11c:
  addiu $a0, $zero, 195
L8003f120:
  lui $a1, 0x800f
L8003f124:
  addiu $a1, $a1, -488
L8003f128:
  addu $a2, $s0, $zero
L8003f12c:
  lbu $a0, 1265($gp)
L8003f130:
  lhu $a3, 1212($gp)
L8003f134:
  addiu $v0, $v0, 1
L8003f138:
  sb $v0, 1252($gp)
L8003f13c:
  addiu $v0, $zero, 1152
L8003f140:
  sw $v0, 16($sp)
L8003f144:
  lbu $v0, 1251($gp)
L8003f148:
  sll $zero, $zero, 0x0
L8003f14c:
  andi $v0, $v0, 0xbf
L8003f150:
  sb $v0, 1251($gp)
L8003f154:
  jal 0x8008c638
L8003f158:
  addiu $a3, $a3, 1664
L8003f15c:
  j L8003f210
L8003f160:
  sll $zero, $zero, 0x0
L8003f164:
  lbu $v0, 1265($gp)
L8003f168:
  sll $zero, $zero, 0x0
L8003f16c:
  xori $v0, $v0, 0x10
L8003f170:
  sb $v0, 1265($gp)
L8003f174:
  beq $v0, $zero, L8003f188
L8003f178:
  addiu $v0, $zero, 2
L8003f17c:
  sb $v0, 1251($gp)
L8003f180:
  j L8003f2a0
L8003f184:
  sll $zero, $zero, 0x0
L8003f188:
  addiu $v0, $zero, 3
L8003f18c:
  sb $v0, 1251($gp)
L8003f190:
  lbu $v1, 1251($gp)
L8003f194:
  sll $zero, $zero, 0x0
L8003f198:
  andi $v0, $v1, 0x80
L8003f19c:
  bne $v0, $zero, L8003f1c4
L8003f1a0:
  andi $v0, $v1, 0x40
L8003f1a4:
  ori $v0, $v1, 0xc0
L8003f1a8:
  sb $v0, 1251($gp)
L8003f1ac:
  addiu $a0, $zero, 196
L8003f1b0:
  jal L8003e46c
L8003f1b4:
  addu $a1, $zero, $zero
L8003f1b8:
  lbu $v1, 1251($gp)
L8003f1bc:
  sll $zero, $zero, 0x0
L8003f1c0:
  andi $v0, $v1, 0x40
L8003f1c4:
  beq $v0, $zero, L8003f228
L8003f1c8:
  sll $zero, $zero, 0x0
L8003f1cc:
  lbu $v0, 1251($gp)
L8003f1d0:
  lbu $v1, 1265($gp)
L8003f1d4:
  andi $v0, $v0, 0xbf
L8003f1d8:
  sb $v0, 1251($gp)
L8003f1dc:
  beq $v1, $zero, L8003f1f4
L8003f1e0:
  lui $a1, 0x800f
L8003f1e4:
  addiu $a1, $a1, -488
L8003f1e8:
  lw $a2, 1240($gp)
L8003f1ec:
  j L8003f200
L8003f1f0:
  addu $a0, $v1, $zero
L8003f1f4:
  addiu $a1, $a1, -488
L8003f1f8:
  lbu $a0, 1265($gp)
L8003f1fc:
  lw $a2, 1224($gp)
L8003f200:
  lhu $a3, 1212($gp)
L8003f204:
  addiu $v0, $zero, 128
L8003f208:
  jal 0x8008c858
L8003f20c:
  sw $v0, 16($sp)
L8003f210:
  lhu $v0, 1266($gp)
L8003f214:
  sll $zero, $zero, 0x0
L8003f218:
  ori $v0, $v0, 0x1000
L8003f21c:
  sh $v0, 1266($gp)
L8003f220:
  j L8003f2a0
L8003f224:
  sll $zero, $zero, 0x0
L8003f228:
  lw $v0, 1260($gp)
L8003f22c:
  sll $zero, $zero, 0x0
L8003f230:
  bne $v0, $zero, L8003f298
L8003f234:
  addiu $a0, $zero, 197
L8003f238:
  lbu $v0, 1265($gp)
L8003f23c:
  ori $v1, $v1, 0x40
L8003f240:
  sb $v1, 1251($gp)
L8003f244:
  xori $v0, $v0, 0x10
L8003f248:
  sb $v0, 1265($gp)
L8003f24c:
  bne $v0, $zero, L8003f1cc
L8003f250:
  sll $zero, $zero, 0x0
L8003f254:
  lw $v0, 1224($gp)
L8003f258:
  lw $v1, 1240($gp)
L8003f25c:
  addiu $v0, $v0, 128
L8003f260:
  sw $v0, 1224($gp)
L8003f264:
  lhu $v0, 1212($gp)
L8003f268:
  addiu $v1, $v1, 128
L8003f26c:
  sw $v1, 1240($gp)
L8003f270:
  lhu $v1, 1210($gp)
L8003f274:
  addiu $v0, $v0, 128
L8003f278:
  addiu $v1, $v1, -128
L8003f27c:
  sh $v1, 1210($gp)
L8003f280:
  andi $v1, $v1, 0xffff
L8003f284:
  sh $v0, 1212($gp)
L8003f288:
  bne $v1, $zero, L8003f1cc
L8003f28c:
  addiu $v0, $zero, 1
L8003f290:
  sb $v0, 1255($gp)
L8003f294:
  addiu $a0, $zero, 198
L8003f298:
  jal L8003e46c
L8003f29c:
  addiu $a1, $zero, 24
L8003f2a0:
  lw $ra, 36($sp)
L8003f2a4:
  lw $s0, 32($sp)
L8003f2a8:
  jr $ra
L8003f2ac:
  addiu $sp, $sp, 40
L8003f2b0:
  addiu $sp, $sp, -40
L8003f2b4:
  sw $s0, 16($sp)
L8003f2b8:
  addu $s0, $a0, $zero
L8003f2bc:
  sw $s2, 24($sp)
L8003f2c0:
  addu $s2, $a1, $zero
L8003f2c4:
  sw $s3, 28($sp)
L8003f2c8:
  addu $s3, $a2, $zero
L8003f2cc:
  sw $s1, 20($sp)
L8003f2d0:
  sw $ra, 32($sp)
L8003f2d4:
  jal 0x80042b98
L8003f2d8:
  addu $s1, $a3, $zero
L8003f2dc:
  bne $v0, $zero, L8003f2ec
L8003f2e0:
  sll $zero, $zero, 0x0
L8003f2e4:
  jal 0x80043178
L8003f2e8:
  addu $a0, $s0, $zero
L8003f2ec:
  lh $a3, 96($s0)
L8003f2f0:
  sll $zero, $zero, 0x0
L8003f2f4:
  bgez $a3, L8003f310
L8003f2f8:
  sll $zero, $zero, 0x0
L8003f2fc:
  addiu $a3, $a3, 64
L8003f300:
  bltz $a3, L8003f324
L8003f304:
  sll $zero, $zero, 0x0
L8003f308:
  j L8003f320
L8003f30c:
  sb $zero, 108($s0)
L8003f310:
  addiu $a3, $a3, -64
L8003f314:
  bgtz $a3, L8003f324
L8003f318:
  sll $zero, $zero, 0x0
L8003f31c:
  sb $zero, 108($s0)
L8003f320:
  addu $a3, $zero, $zero
L8003f324:
  sh $a3, 96($s0)
L8003f328:
  addu $a0, $s0, $zero
L8003f32c:
  addu $a1, $s2, $zero
L8003f330:
  jal 0x80043230
L8003f334:
  addu $a2, $s3, $zero
L8003f338:
  bltz $s1, L8003f368
L8003f33c:
  lui $v0, 0x800f
L8003f340:
  sll $a0, $s1, 0x1
L8003f344:
  addu $a0, $a0, $s1
L8003f348:
  sll $a0, $a0, 0x3
L8003f34c:
  addu $a0, $a0, $s1
L8003f350:
  sll $a0, $a0, 0x2
L8003f354:
  addiu $v0, $v0, -20232
L8003f358:
  lh $a1, 48($s0)
L8003f35c:
  lh $a2, 50($s0)
L8003f360:
  jal L80039934
L8003f364:
  addu $a0, $a0, $v0
L8003f368:
  lbu $v0, 108($s0)
L8003f36c:
  lw $ra, 32($sp)
L8003f370:
  lw $s3, 28($sp)
L8003f374:
  lw $s2, 24($sp)
L8003f378:
  lw $s1, 20($sp)
L8003f37c:
  lw $s0, 16($sp)
L8003f380:
  jr $ra
L8003f384:
  addiu $sp, $sp, 40
L8003f388:
  addiu $sp, $sp, -40
L8003f38c:
  addu $v1, $zero, $zero
L8003f390:
  lui $v0, 0x800f
L8003f394:
  addiu $a0, $v0, -20232
L8003f398:
  sw $ra, 36($sp)
L8003f39c:
  sw $s0, 32($sp)
L8003f3a0:
  sb $zero, 1254($gp)
L8003f3a4:
  lhu $v0, 52($a0)
L8003f3a8:
  sll $zero, $zero, 0x0
L8003f3ac:
  andi $v0, $v0, 0x8000
L8003f3b0:
  bne $v0, $zero, L8003f3c4
L8003f3b4:
  sll $zero, $zero, 0x0
L8003f3b8:
  sb $v1, 1254($gp)
L8003f3bc:
  j L8003f3d4
L8003f3c0:
  sll $zero, $zero, 0x0
L8003f3c4:
  addiu $v1, $v1, 1
L8003f3c8:
  slti $v0, $v1, 4
L8003f3cc:
  bne $v0, $zero, L8003f3a4
L8003f3d0:
  addiu $a0, $a0, 100
L8003f3d4:
  jal 0x8004002c
L8003f3d8:
  sll $zero, $zero, 0x0
L8003f3dc:
  addu $a0, $v0, $zero
L8003f3e0:
  jal 0x800400ac
L8003f3e4:
  addiu $a1, $zero, 2
L8003f3e8:
  addu $s0, $v0, $zero
L8003f3ec:
  addu $a0, $s0, $zero
L8003f3f0:
  addiu $a1, $zero, 32
L8003f3f4:
  addiu $v0, $zero, 2
L8003f3f8:
  sw $v0, 16($sp)
L8003f3fc:
  addiu $v0, $zero, 1
L8003f400:
  sw $v0, 20($sp)
L8003f404:
  addiu $v0, $zero, 11
L8003f408:
  sw $v0, 24($sp)
L8003f40c:
  addiu $v0, $zero, 524
L8003f410:
  addiu $a2, $zero, -64
L8003f414:
  addiu $a3, $zero, 3
L8003f418:
  jal 0x800404cc
L8003f41c:
  sw $v0, 28($sp)
L8003f420:
  lhu $v0, 8($s0)
L8003f424:
  addu $a0, $s0, $zero
L8003f428:
  ori $v0, $v0, 0x28
L8003f42c:
  jal 0x80042918
L8003f430:
  sh $v0, 8($s0)
L8003f434:
  addu $a0, $s0, $zero
L8003f438:
  jal 0x800428ec
L8003f43c:
  addiu $a1, $zero, 15
L8003f440:
  lw $ra, 36($sp)
L8003f444:
  sw $s0, 1232($gp)
L8003f448:
  lw $s0, 32($sp)
L8003f44c:
  jr $ra
L8003f450:
  addiu $sp, $sp, 40
L8003f454:
  lhu $a0, 1266($gp)
L8003f458:
  addiu $sp, $sp, -32
L8003f45c:
  sw $ra, 28($sp)
L8003f460:
  andi $v0, $a0, 0x800
L8003f464:
  beq $v0, $zero, L8003f4e0
L8003f468:
  sw $s0, 24($sp)
L8003f46c:
  lw $a0, 1232($gp)
L8003f470:
  sll $zero, $zero, 0x0
L8003f474:
  bne $a0, $zero, L8003f488
L8003f478:
  addiu $a1, $zero, 32
L8003f47c:
  sh $zero, 1266($gp)
L8003f480:
  j L8003f6fc
L8003f484:
  sll $zero, $zero, 0x0
L8003f488:
  lbu $a3, 1254($gp)
L8003f48c:
  jal L8003f2b0
L8003f490:
  addiu $a2, $zero, 256
L8003f494:
  bne $v0, $zero, L8003f6fc
L8003f498:
  sll $zero, $zero, 0x0
L8003f49c:
  lbu $v0, 1254($gp)
L8003f4a0:
  sll $zero, $zero, 0x0
L8003f4a4:
  sll $a0, $v0, 0x1
L8003f4a8:
  addu $a0, $a0, $v0
L8003f4ac:
  sll $a0, $a0, 0x3
L8003f4b0:
  addu $a0, $a0, $v0
L8003f4b4:
  sll $a0, $a0, 0x2
L8003f4b8:
  lui $v0, 0x800f
L8003f4bc:
  addiu $v0, $v0, -20232
L8003f4c0:
  jal L80035b7c
L8003f4c4:
  addu $a0, $a0, $v0
L8003f4c8:
  lw $a0, 1232($gp)
L8003f4cc:
  jal 0x8004036c
L8003f4d0:
  sll $zero, $zero, 0x0
L8003f4d4:
  sw $zero, 1232($gp)
L8003f4d8:
  j L8003f6fc
L8003f4dc:
  sll $zero, $zero, 0x0
L8003f4e0:
  andi $v1, $a0, 0x4080
L8003f4e4:
  addiu $v0, $zero, 16512
L8003f4e8:
  bne $v1, $v0, L8003f604
L8003f4ec:
  andi $v0, $a0, 0x4000
L8003f4f0:
  andi $v0, $a0, 0x40
L8003f4f4:
  bne $v0, $zero, L8003f598
L8003f4f8:
  addiu $a2, $zero, 32
L8003f4fc:
  ori $v0, $a0, 0x40
L8003f500:
  lbu $a0, 1254($gp)
L8003f504:
  lbu $a1, 1214($gp)
L8003f508:
  addiu $a3, $zero, 80
L8003f50c:
  sh $v0, 1266($gp)
L8003f510:
  addiu $v0, $zero, 256
L8003f514:
  sw $v0, 16($sp)
L8003f518:
  addiu $v0, $zero, 48
L8003f51c:
  jal L80035be4
L8003f520:
  sw $v0, 20($sp)
L8003f524:
  addu $s0, $v0, $zero
L8003f528:
  jal L8002e370
L8003f52c:
  addu $a0, $s0, $zero
L8003f530:
  addiu $v0, $zero, 16
L8003f534:
  sb $v0, 89($s0)
L8003f538:
  lhu $v1, 1266($gp)
L8003f53c:
  sll $zero, $zero, 0x0
L8003f540:
  andi $v0, $v1, 0x20
L8003f544:
  beq $v0, $zero, L8003f56c
L8003f548:
  andi $v0, $v1, 0x10
L8003f54c:
  jal L80039794
L8003f550:
  sll $zero, $zero, 0x0
L8003f554:
  lw $v0, 48($s0)
L8003f558:
  sll $zero, $zero, 0x0
L8003f55c:
  beq $v0, $zero, L8003f54c
L8003f560:
  sll $zero, $zero, 0x0
L8003f564:
  j L8003f6fc
L8003f568:
  sll $zero, $zero, 0x0
L8003f56c:
  beq $v0, $zero, L8003f588
L8003f570:
  sll $zero, $zero, 0x0
L8003f574:
  lhu $v0, 52($s0)
L8003f578:
  sll $zero, $zero, 0x0
L8003f57c:
  ori $v0, $v0, 0x1008
L8003f580:
  j L8003f6fc
L8003f584:
  sh $v0, 52($s0)
L8003f588:
  jal L80039a14
L8003f58c:
  addu $a0, $s0, $zero
L8003f590:
  j L8003f5dc
L8003f594:
  sll $zero, $zero, 0x0
L8003f598:
  jal L80039794
L8003f59c:
  sll $zero, $zero, 0x0
L8003f5a0:
  lbu $v1, 1254($gp)
L8003f5a4:
  sll $zero, $zero, 0x0
L8003f5a8:
  sll $v0, $v1, 0x1
L8003f5ac:
  addu $v0, $v0, $v1
L8003f5b0:
  sll $v0, $v0, 0x3
L8003f5b4:
  addu $v0, $v0, $v1
L8003f5b8:
  sll $v0, $v0, 0x2
L8003f5bc:
  lui $v1, 0x800f
L8003f5c0:
  addiu $v1, $v1, -20232
L8003f5c4:
  addu $s0, $v0, $v1
L8003f5c8:
  lw $v0, 52($s0)
L8003f5cc:
  addiu $v1, $zero, 8192
L8003f5d0:
  andi $v0, $v0, 0x2008
L8003f5d4:
  bne $v0, $v1, L8003f6fc
L8003f5d8:
  sll $zero, $zero, 0x0
L8003f5dc:
  lhu $v0, 1266($gp)
L8003f5e0:
  sll $zero, $zero, 0x0
L8003f5e4:
  andi $v1, $v0, 0xff7f
L8003f5e8:
  andi $v0, $v0, 0x8
L8003f5ec:
  sh $v1, 1266($gp)
L8003f5f0:
  beq $v0, $zero, L8003f6fc
L8003f5f4:
  sll $zero, $zero, 0x0
L8003f5f8:
  sh $zero, 1266($gp)
L8003f5fc:
  j L8003f6e0
L8003f600:
  sll $zero, $zero, 0x0
L8003f604:
  bne $v0, $zero, L8003f678
L8003f608:
  andi $v0, $a0, 0x1000
L8003f60c:
  andi $v0, $a0, 0x2000
L8003f610:
  bne $v0, $zero, L8003f648
L8003f614:
  addiu $a1, $zero, 32
L8003f618:
  ori $v0, $a0, 0x2000
L8003f61c:
  sh $v0, 1266($gp)
L8003f620:
  jal 0x8008b85c
L8003f624:
  sll $zero, $zero, 0x0
L8003f628:
  addiu $v0, $zero, 2
L8003f62c:
  sb $v0, 1255($gp)
L8003f630:
  jal L8003f388
L8003f634:
  sll $zero, $zero, 0x0
L8003f638:
  lw $v1, 1232($gp)
L8003f63c:
  addiu $v0, $zero, -1024
L8003f640:
  j L8003f6fc
L8003f644:
  sh $v0, 96($v1)
L8003f648:
  lw $a0, 1232($gp)
L8003f64c:
  addiu $a2, $zero, 80
L8003f650:
  jal L8003f2b0
L8003f654:
  addiu $a3, $zero, -1
L8003f658:
  bne $v0, $zero, L8003f6fc
L8003f65c:
  sll $zero, $zero, 0x0
L8003f660:
  lhu $v0, 1266($gp)
L8003f664:
  sll $zero, $zero, 0x0
L8003f668:
  ori $v0, $v0, 0x4000
L8003f66c:
  sh $v0, 1266($gp)
L8003f670:
  j L8003f6fc
L8003f674:
  sll $zero, $zero, 0x0
L8003f678:
  beq $v0, $zero, L8003f6b0
L8003f67c:
  lui $v1, 0x8009
L8003f680:
  addiu $a1, $gp, 1256
L8003f684:
  addiu $a2, $gp, 1260
L8003f688:
  jal 0x8008cce8
L8003f68c:
  addiu $a0, $zero, 1
L8003f690:
  sw $v0, 1204($gp)
L8003f694:
  addiu $v1, $zero, 1
L8003f698:
  bne $v0, $v1, L8003f6fc
L8003f69c:
  lui $v1, 0x8009
L8003f6a0:
  lhu $v0, 1266($gp)
L8003f6a4:
  sll $zero, $zero, 0x0
L8003f6a8:
  andi $v0, $v0, 0xefff
L8003f6ac:
  sh $v0, 1266($gp)
L8003f6b0:
  lbu $v0, 1238($gp)
L8003f6b4:
  addiu $v1, $v1, 3996
L8003f6b8:
  sll $v0, $v0, 0x2
L8003f6bc:
  addu $v0, $v0, $v1
L8003f6c0:
  lw $v0, 0($v0)
L8003f6c4:
  sll $zero, $zero, 0x0
L8003f6c8:
  jalr $ra, $v0
L8003f6cc:
  sll $zero, $zero, 0x0
L8003f6d0:
  lhu $v0, 1266($gp)
L8003f6d4:
  sll $zero, $zero, 0x0
L8003f6d8:
  bne $v0, $zero, L8003f6fc
L8003f6dc:
  sll $zero, $zero, 0x0
L8003f6e0:
  lhu $v0, 1266($gp)
L8003f6e4:
  lw $v1, 1232($gp)
L8003f6e8:
  ori $v0, $v0, 0x800
L8003f6ec:
  sh $v0, 1266($gp)
L8003f6f0:
  addiu $v0, $zero, 1024
L8003f6f4:
  jal 0x8008b8cc
L8003f6f8:
  sh $v0, 96($v1)
L8003f6fc:
  lw $ra, 28($sp)
L8003f700:
  lw $s0, 24($sp)
L8003f704:
  jr $ra
L8003f708:
  addiu $sp, $sp, 32
L8003f70c:
  addiu $sp, $sp, -24
L8003f710:
  sw $ra, 16($sp)
L8003f714:
  jal L8003f454
L8003f718:
  sll $zero, $zero, 0x0
L8003f71c:
  lhu $v0, 1266($gp)
L8003f720:
  sll $zero, $zero, 0x0
L8003f724:
  bne $v0, $zero, L8003f730
L8003f728:
  addu $v0, $zero, $zero
L8003f72c:
  lbu $v0, 1255($gp)
L8003f730:
  lw $ra, 16($sp)
L8003f734:
  sll $zero, $zero, 0x0
L8003f738:
  jr $ra
L8003f73c:
  addiu $sp, $sp, 24
L8003f740:
  ori $v0, $zero, 0x8000
L8003f744:
  sh $v0, 1266($gp)
L8003f748:
  sb $a0, 1238($gp)
L8003f74c:
  sb $zero, 1209($gp)
L8003f750:
  jr $ra
L8003f754:
  sll $zero, $zero, 0x0
L8003f758:
  addiu $sp, $sp, -32
L8003f75c:
  sw $s2, 24($sp)
L8003f760:
  addu $s2, $a0, $zero
L8003f764:
  sw $s0, 16($sp)
L8003f768:
  addu $s0, $a1, $zero
L8003f76c:
  lui $a0, 0x800f
L8003f770:
  addiu $a0, $a0, -488
L8003f774:
  sw $s1, 20($sp)
L8003f778:
  addu $s1, $a3, $zero
L8003f77c:
  sw $ra, 28($sp)
L8003f780:
  jal 0x8008e6f0
L8003f784:
  addu $a1, $a2, $zero
L8003f788:
  addiu $v1, $s0, 8191
L8003f78c:
  addiu $v0, $zero, 512
L8003f790:
  sb $zero, 1265($gp)
L8003f794:
  sh $s0, 1210($gp)
L8003f798:
  sh $v0, 1212($gp)
L8003f79c:
  bgez $v1, L8003f7ac
L8003f7a0:
  sra $v0, $v1, 0xd
L8003f7a4:
  addiu $v1, $s0, 16382
L8003f7a8:
  sra $v0, $v1, 0xd
L8003f7ac:
  sb $v0, 1236($gp)
L8003f7b0:
  sw $s2, 1224($gp)
L8003f7b4:
  jal L8003f740
L8003f7b8:
  addu $a0, $s1, $zero
L8003f7bc:
  lw $ra, 28($sp)
L8003f7c0:
  lw $s2, 24($sp)
L8003f7c4:
  lw $s1, 20($sp)
L8003f7c8:
  lw $s0, 16($sp)
L8003f7cc:
  jr $ra
L8003f7d0:
  addiu $sp, $sp, 32
L8003f7d4:
  addiu $sp, $sp, -24
L8003f7d8:
  lui $a0, 0x801d
L8003f7dc:
  lui $a2, 0x8001
L8003f7e0:
  addiu $a0, $a0, 12800
L8003f7e4:
  addiu $a1, $zero, 1664
L8003f7e8:
  addiu $a2, $a2, 900
L8003f7ec:
  sw $ra, 16($sp)
L8003f7f0:
  lui $at, 0x800a
L8003f7f4:
  sb $zero, -20271($at)
L8003f7f8:
  jal L8003f758
L8003f7fc:
  addu $a3, $zero, $zero
L8003f800:
  lw $ra, 16($sp)
L8003f804:
  sll $zero, $zero, 0x0
L8003f808:
  jr $ra
L8003f80c:
  addiu $sp, $sp, 24
L8003f810:
  addiu $sp, $sp, -32
L8003f814:
  sw $ra, 24($sp)
L8003f818:
  sw $s1, 20($sp)
L8003f81c:
  jal L8003f70c
L8003f820:
  sw $s0, 16($sp)
L8003f824:
  addu $s1, $v0, $zero
L8003f828:
  beq $s1, $zero, L8003f864
L8003f82c:
  addiu $v0, $zero, 1
L8003f830:
  bne $s1, $v0, L8003f868
L8003f834:
  addu $v0, $s1, $zero
L8003f838:
  lui $s0, 0x801d
L8003f83c:
  addiu $s0, $s0, 512
L8003f840:
  addu $a0, $s0, $zero
L8003f844:
  lui $a1, 0x801d
L8003f848:
  addiu $a1, $a1, 12800
L8003f84c:
  jal L800356a0
L8003f850:
  addiu $a2, $zero, 1664
L8003f854:
  jal L8003d0f4
L8003f858:
  addu $a0, $s0, $zero
L8003f85c:
  j L8003f868
L8003f860:
  addu $v0, $s1, $zero
L8003f864:
  addu $v0, $zero, $zero
L8003f868:
  lw $ra, 24($sp)
L8003f86c:
  lw $s1, 20($sp)
L8003f870:
  lw $s0, 16($sp)
L8003f874:
  jr $ra
L8003f878:
  addiu $sp, $sp, 32
L8003f87c:
  addiu $sp, $sp, -24
L8003f880:
  sw $s0, 16($sp)
L8003f884:
  lui $s0, 0x801d
L8003f888:
  addiu $s0, $s0, 12800
L8003f88c:
  addu $a0, $s0, $zero
L8003f890:
  lui $a1, 0x801d
L8003f894:
  addiu $a1, $a1, 512
L8003f898:
  sw $ra, 20($sp)
L8003f89c:
  jal L800356a0
L8003f8a0:
  addiu $a2, $zero, 1664
L8003f8a4:
  jal L8003d03c
L8003f8a8:
  addiu $a0, $s0, -512
L8003f8ac:
  addu $a0, $s0, $zero
L8003f8b0:
  addiu $a1, $zero, 3328
L8003f8b4:
  lui $a2, 0x8001
L8003f8b8:
  addiu $a2, $a2, 900
L8003f8bc:
  jal L8003f758
L8003f8c0:
  addiu $a3, $zero, 2
L8003f8c4:
  lw $ra, 20($sp)
L8003f8c8:
  lw $s0, 16($sp)
L8003f8cc:
  jr $ra
L8003f8d0:
  addiu $sp, $sp, 24
L8003f8d4:
  lbu $v0, 1250($gp)
L8003f8d8:
  addiu $sp, $sp, -40
L8003f8dc:
  sw $ra, 36($sp)
L8003f8e0:
  andi $v1, $v0, 0xf
L8003f8e4:
  sltiu $v0, $v1, 12
L8003f8e8:
  beq $v0, $zero, L8003fcc4
L8003f8ec:
  sw $s0, 32($sp)
L8003f8f0:
  lui $v0, 0x8001
L8003f8f4:
  addiu $v0, $v0, 1264
L8003f8f8:
  sll $v1, $v1, 0x2
L8003f8fc:
  addu $v1, $v1, $v0
L8003f900:
  lw $v0, 0($v1)
L8003f904:
  sll $zero, $zero, 0x0
L8003f908:
  jr $v0
L8003f90c:
  sll $zero, $zero, 0x0
L8003f910:
  lbu $v1, 1250($gp)
L8003f914:
  sll $zero, $zero, 0x0
L8003f918:
  andi $v0, $v1, 0x80
L8003f91c:
  bne $v0, $zero, L8003f97c
L8003f920:
  addiu $a1, $zero, 32
L8003f924:
  ori $v0, $v1, 0x80
L8003f928:
  sb $v0, 1250($gp)
L8003f92c:
  jal L8003f388
L8003f930:
  sll $zero, $zero, 0x0
L8003f934:
  addiu $a1, $zero, 194
L8003f938:
  addiu $a2, $zero, 32
L8003f93c:
  addiu $a3, $zero, 80
L8003f940:
  lbu $a0, 1254($gp)
L8003f944:
  lw $v1, 1232($gp)
L8003f948:
  addiu $v0, $zero, -1024
L8003f94c:
  sh $v0, 96($v1)
L8003f950:
  addiu $v0, $zero, 256
L8003f954:
  sw $v0, 16($sp)
L8003f958:
  addiu $v0, $zero, 48
L8003f95c:
  jal L80035be4
L8003f960:
  sw $v0, 20($sp)
L8003f964:
  addu $s0, $v0, $zero
L8003f968:
  addu $a0, $s0, $zero
L8003f96c:
  addiu $v0, $zero, 16
L8003f970:
  jal L80039a14
L8003f974:
  sb $v0, 89($a0)
L8003f978:
  addiu $a1, $zero, 32
L8003f97c:
  lw $a0, 1232($gp)
L8003f980:
  lbu $a3, 1254($gp)
L8003f984:
  jal L8003f2b0
L8003f988:
  addiu $a2, $zero, 80
L8003f98c:
  bne $v0, $zero, L8003fcc8
L8003f990:
  addu $v0, $zero, $zero
L8003f994:
  addiu $v0, $zero, 1
L8003f998:
  sb $v0, 1250($gp)
L8003f99c:
  j L8003fcc8
L8003f9a0:
  addu $v0, $zero, $zero
L8003f9a4:
  lui $v0, 0x800a
L8003f9a8:
  lhu $v0, -19560($v0)
L8003f9ac:
  sll $zero, $zero, 0x0
L8003f9b0:
  andi $v0, $v0, 0x20
L8003f9b4:
  beq $v0, $zero, L8003f9d0
L8003f9b8:
  sll $zero, $zero, 0x0
L8003f9bc:
  jal L8003fee0
L8003f9c0:
  addiu $a0, $zero, 8
L8003f9c4:
  lw $v1, 1232($gp)
L8003f9c8:
  j L8003f9f8
L8003f9cc:
  addiu $v0, $zero, 130
L8003f9d0:
  lui $v0, 0x800a
L8003f9d4:
  lhu $v0, -19560($v0)
L8003f9d8:
  sll $zero, $zero, 0x0
L8003f9dc:
  andi $v0, $v0, 0x40
L8003f9e0:
  beq $v0, $zero, L8003fcc8
L8003f9e4:
  addu $v0, $zero, $zero
L8003f9e8:
  jal L8003fee0
L8003f9ec:
  addiu $a0, $zero, 7
L8003f9f0:
  lw $v1, 1232($gp)
L8003f9f4:
  addiu $v0, $zero, 2
L8003f9f8:
  sb $v0, 1250($gp)
L8003f9fc:
  addiu $v0, $zero, 1024
L8003fa00:
  j L8003fcc4
L8003fa04:
  sh $v0, 96($v1)
L8003fa08:
  addiu $a1, $zero, 32
L8003fa0c:
  lw $a0, 1232($gp)
L8003fa10:
  lbu $a3, 1254($gp)
L8003fa14:
  jal L8003f2b0
L8003fa18:
  addiu $a2, $zero, 256
L8003fa1c:
  bne $v0, $zero, L8003fcc8
L8003fa20:
  addu $v0, $zero, $zero
L8003fa24:
  lbu $v0, 1254($gp)
L8003fa28:
  sll $zero, $zero, 0x0
L8003fa2c:
  sll $a0, $v0, 0x1
L8003fa30:
  addu $a0, $a0, $v0
L8003fa34:
  sll $a0, $a0, 0x3
L8003fa38:
  addu $a0, $a0, $v0
L8003fa3c:
  sll $a0, $a0, 0x2
L8003fa40:
  lui $v0, 0x800f
L8003fa44:
  addiu $v0, $v0, -20232
L8003fa48:
  jal L80035b7c
L8003fa4c:
  addu $a0, $a0, $v0
L8003fa50:
  lw $a0, 1232($gp)
L8003fa54:
  jal 0x8004036c
L8003fa58:
  sll $zero, $zero, 0x0
L8003fa5c:
  lbu $v0, 1250($gp)
L8003fa60:
  sw $zero, 1232($gp)
L8003fa64:
  andi $v0, $v0, 0x80
L8003fa68:
  bne $v0, $zero, L8003fcc8
L8003fa6c:
  addiu $v0, $zero, 2
L8003fa70:
  addiu $v0, $zero, 3
L8003fa74:
  sb $v0, 1250($gp)
L8003fa78:
  lui $a0, 0x801d
L8003fa7c:
  addiu $a0, $a0, 4608
L8003fa80:
  addiu $a1, $zero, 1664
L8003fa84:
  lui $a2, 0x8001
L8003fa88:
  addiu $a2, $a2, 900
L8003fa8c:
  jal L8003f758
L8003fa90:
  addiu $a3, $zero, 1
L8003fa94:
  j L8003fcc8
L8003fa98:
  addu $v0, $zero, $zero
L8003fa9c:
  jal L8003f70c
L8003faa0:
  sll $zero, $zero, 0x0
L8003faa4:
  addu $v1, $v0, $zero
L8003faa8:
  beq $v1, $zero, L8003fb24
L8003faac:
  addiu $v0, $zero, 1
L8003fab0:
  bne $v1, $v0, L8003fcc8
L8003fab4:
  addu $v0, $v1, $zero
L8003fab8:
  lbu $v1, 1250($gp)
L8003fabc:
  sll $zero, $zero, 0x0
L8003fac0:
  andi $v0, $v1, 0x40
L8003fac4:
  beq $v0, $zero, L8003faf4
L8003fac8:
  lui $a0, 0x801d
L8003facc:
  addiu $a0, $a0, 4608
L8003fad0:
  jal L8003d288
L8003fad4:
  addiu $a1, $a0, 4096
L8003fad8:
  bne $v0, $zero, L8003fae8
L8003fadc:
  addiu $v0, $zero, 10
L8003fae0:
  j L8003fcc8
L8003fae4:
  addiu $v0, $zero, 1
L8003fae8:
  sb $v0, 1250($gp)
L8003faec:
  j L8003fcc8
L8003faf0:
  addu $v0, $zero, $zero
L8003faf4:
  lui $a0, 0x801d
L8003faf8:
  addiu $a0, $a0, 8704
L8003fafc:
  addiu $a1, $zero, 1664
L8003fb00:
  lui $a2, 0x8001
L8003fb04:
  addiu $a2, $a2, 900
L8003fb08:
  ori $v0, $v1, 0x40
L8003fb0c:
  sb $v0, 1250($gp)
L8003fb10:
  jal L8003f758
L8003fb14:
  addiu $a3, $zero, 1
L8003fb18:
  addu $v1, $zero, $zero
L8003fb1c:
  addiu $v0, $zero, 16
L8003fb20:
  sb $v0, 1265($gp)
L8003fb24:
  j L8003fcc8
L8003fb28:
  addu $v0, $v1, $zero
L8003fb2c:
  lbu $v1, 1250($gp)
L8003fb30:
  sll $zero, $zero, 0x0
L8003fb34:
  andi $v0, $v1, 0x80
L8003fb38:
  bne $v0, $zero, L8003fbac
L8003fb3c:
  ori $v0, $v1, 0xc0
L8003fb40:
  sb $v0, 1250($gp)
L8003fb44:
  jal L8003f388
L8003fb48:
  sll $zero, $zero, 0x0
L8003fb4c:
  addiu $a2, $zero, 32
L8003fb50:
  addiu $a3, $zero, 80
L8003fb54:
  lbu $a0, 1254($gp)
L8003fb58:
  lbu $a1, 1208($gp)
L8003fb5c:
  lw $v1, 1232($gp)
L8003fb60:
  addiu $v0, $zero, -1024
L8003fb64:
  sh $v0, 96($v1)
L8003fb68:
  addiu $v0, $zero, 256
L8003fb6c:
  sw $v0, 16($sp)
L8003fb70:
  addiu $v0, $zero, 48
L8003fb74:
  sw $v0, 20($sp)
L8003fb78:
  addiu $v0, $zero, 4104
L8003fb7c:
  jal L80035c38
L8003fb80:
  sw $v0, 24($sp)
L8003fb84:
  addu $s0, $v0, $zero
L8003fb88:
  addiu $v0, $zero, 16
L8003fb8c:
  sb $v0, 89($s0)
L8003fb90:
  jal L80039794
L8003fb94:
  sll $zero, $zero, 0x0
L8003fb98:
  lhu $v0, 52($s0)
L8003fb9c:
  sll $zero, $zero, 0x0
L8003fba0:
  andi $v0, $v0, 0x2000
L8003fba4:
  beq $v0, $zero, L8003fb90
L8003fba8:
  sll $zero, $zero, 0x0
L8003fbac:
  lbu $v0, 1250($gp)
L8003fbb0:
  sll $zero, $zero, 0x0
L8003fbb4:
  andi $v0, $v0, 0x40
L8003fbb8:
  beq $v0, $zero, L8003fbf0
L8003fbbc:
  addiu $a1, $zero, 32
L8003fbc0:
  lw $a0, 1232($gp)
L8003fbc4:
  lbu $a3, 1254($gp)
L8003fbc8:
  jal L8003f2b0
L8003fbcc:
  addiu $a2, $zero, 80
L8003fbd0:
  bne $v0, $zero, L8003fcc8
L8003fbd4:
  addu $v0, $zero, $zero
L8003fbd8:
  lbu $v0, 1250($gp)
L8003fbdc:
  sll $zero, $zero, 0x0
L8003fbe0:
  andi $v0, $v0, 0xbf
L8003fbe4:
  sb $v0, 1250($gp)
L8003fbe8:
  j L8003fcc8
L8003fbec:
  addu $v0, $zero, $zero
L8003fbf0:
  jal L80039794
L8003fbf4:
  sll $zero, $zero, 0x0
L8003fbf8:
  lui $a0, 0x800f
L8003fbfc:
  lbu $v1, 1254($gp)
L8003fc00:
  addiu $a0, $a0, -20232
L8003fc04:
  sll $v0, $v1, 0x1
L8003fc08:
  addu $v0, $v0, $v1
L8003fc0c:
  sll $v0, $v0, 0x3
L8003fc10:
  addu $v0, $v0, $v1
L8003fc14:
  sll $v0, $v0, 0x2
L8003fc18:
  addu $v0, $v0, $a0
L8003fc1c:
  lhu $v0, 52($v0)
L8003fc20:
  sll $zero, $zero, 0x0
L8003fc24:
  andi $v0, $v0, 0x8
L8003fc28:
  bne $v0, $zero, L8003fcc8
L8003fc2c:
  addu $v0, $zero, $zero
L8003fc30:
  addiu $v0, $zero, 11
L8003fc34:
  sb $v0, 1250($gp)
L8003fc38:
  j L8003fcc8
L8003fc3c:
  addu $v0, $zero, $zero
L8003fc40:
  lbu $v1, 1250($gp)
L8003fc44:
  sll $zero, $zero, 0x0
L8003fc48:
  andi $v0, $v1, 0x80
L8003fc4c:
  bne $v0, $zero, L8003fc68
L8003fc50:
  addiu $a1, $zero, 32
L8003fc54:
  ori $v0, $v1, 0x80
L8003fc58:
  lw $v1, 1232($gp)
L8003fc5c:
  sb $v0, 1250($gp)
L8003fc60:
  addiu $v0, $zero, 1024
L8003fc64:
  sh $v0, 96($v1)
L8003fc68:
  lw $a0, 1232($gp)
L8003fc6c:
  lbu $a3, 1254($gp)
L8003fc70:
  jal L8003f2b0
L8003fc74:
  addiu $a2, $zero, 256
L8003fc78:
  bne $v0, $zero, L8003fcc4
L8003fc7c:
  sll $zero, $zero, 0x0
L8003fc80:
  lbu $v0, 1254($gp)
L8003fc84:
  sll $zero, $zero, 0x0
L8003fc88:
  sll $a0, $v0, 0x1
L8003fc8c:
  addu $a0, $a0, $v0
L8003fc90:
  sll $a0, $a0, 0x3
L8003fc94:
  addu $a0, $a0, $v0
L8003fc98:
  sll $a0, $a0, 0x2
L8003fc9c:
  lui $v0, 0x800f
L8003fca0:
  addiu $v0, $v0, -20232
L8003fca4:
  jal L80035b7c
L8003fca8:
  addu $a0, $a0, $v0
L8003fcac:
  lw $a0, 1232($gp)
L8003fcb0:
  jal 0x8004036c
L8003fcb4:
  sll $zero, $zero, 0x0
L8003fcb8:
  sw $zero, 1232($gp)
L8003fcbc:
  j L8003fcc8
L8003fcc0:
  addiu $v0, $zero, 2
L8003fcc4:
  addu $v0, $zero, $zero
L8003fcc8:
  lw $ra, 36($sp)
L8003fccc:
  lw $s0, 32($sp)
L8003fcd0:
  jr $ra
L8003fcd4:
  addiu $sp, $sp, 40
L8003fcd8:
  lbu $v1, 1253($gp)
L8003fcdc:
  addiu $sp, $sp, -24
L8003fce0:
  andi $v0, $v1, 0x80
L8003fce4:
  bne $v0, $zero, L8003fcfc
L8003fce8:
  sw $ra, 16($sp)
L8003fcec:
  ori $v0, $v1, 0x80
L8003fcf0:
  sb $v0, 1253($gp)
L8003fcf4:
  addiu $v0, $zero, 41
L8003fcf8:
  sb $v0, 1208($gp)
L8003fcfc:
  jal L8003f8d4
L8003fd00:
  sll $zero, $zero, 0x0
L8003fd04:
  lw $ra, 16($sp)
L8003fd08:
  sll $zero, $zero, 0x0
L8003fd0c:
  jr $ra
L8003fd10:
  addiu $sp, $sp, 24
L8003fd14:
  lbu $v1, 1253($gp)
L8003fd18:
  addiu $sp, $sp, -32
L8003fd1c:
  sw $ra, 24($sp)
L8003fd20:
  sw $s1, 20($sp)
L8003fd24:
  andi $v0, $v1, 0x80
L8003fd28:
  bne $v0, $zero, L8003fd40
L8003fd2c:
  sw $s0, 16($sp)
L8003fd30:
  ori $v0, $v1, 0x80
L8003fd34:
  sb $v0, 1253($gp)
L8003fd38:
  addiu $v0, $zero, 40
L8003fd3c:
  sb $v0, 1208($gp)
L8003fd40:
  jal L8003fcd8
L8003fd44:
  sll $zero, $zero, 0x0
L8003fd48:
  addu $s1, $v0, $zero
L8003fd4c:
  addiu $v0, $zero, 1
L8003fd50:
  bne $s1, $v0, L8003fe00
L8003fd54:
  addu $v0, $s1, $zero
L8003fd58:
  lui $v0, 0x801d
L8003fd5c:
  addiu $v1, $v0, 4608
L8003fd60:
  addiu $a1, $v1, 4096
L8003fd64:
  addu $a0, $zero, $zero
L8003fd68:
  lui $v0, 0x801d
L8003fd6c:
  addiu $a2, $v0, 22024
L8003fd70:
  addiu $t0, $zero, 1
L8003fd74:
  addiu $a3, $zero, 2
L8003fd78:
  addiu $v0, $zero, 10
L8003fd7c:
  sb $v0, 1250($gp)
L8003fd80:
  addiu $v0, $zero, 36
L8003fd84:
  sb $v0, 1208($gp)
L8003fd88:
  lhu $v0, 0($v1)
L8003fd8c:
  sll $zero, $zero, 0x0
L8003fd90:
  bne $v0, $zero, L8003fda0
L8003fd94:
  addu $v0, $zero, $zero
L8003fd98:
  j L8003fe00
L8003fd9c:
  sw $t0, 64($a2)
L8003fda0:
  lhu $v0, 0($a1)
L8003fda4:
  sll $zero, $zero, 0x0
L8003fda8:
  bne $v0, $zero, L8003fdbc
L8003fdac:
  addiu $a0, $a0, 1
L8003fdb0:
  sw $a3, 64($a2)
L8003fdb4:
  j L8003fe00
L8003fdb8:
  addu $v0, $zero, $zero
L8003fdbc:
  addiu $v1, $v1, 2
L8003fdc0:
  slti $v0, $a0, 40
L8003fdc4:
  bne $v0, $zero, L8003fd88
L8003fdc8:
  addiu $a1, $a1, 2
L8003fdcc:
  lui $a0, 0x801b
L8003fdd0:
  addiu $a0, $a0, 4651
L8003fdd4:
  lui $s0, 0x801d
L8003fdd8:
  addiu $s0, $s0, 5644
L8003fddc:
  addu $a1, $s0, $zero
L8003fde0:
  jal L8003bc40
L8003fde4:
  addiu $a2, $zero, 6
L8003fde8:
  lui $a0, 0x801b
L8003fdec:
  addiu $a0, $a0, 4664
L8003fdf0:
  addiu $a1, $s0, 4096
L8003fdf4:
  jal L8003bc40
L8003fdf8:
  addiu $a2, $zero, 6
L8003fdfc:
  addu $v0, $s1, $zero
L8003fe00:
  lw $ra, 24($sp)
L8003fe04:
  lw $s1, 20($sp)
L8003fe08:
  lw $s0, 16($sp)
L8003fe0c:
  jr $ra
L8003fe10:
  addiu $sp, $sp, 32
L8003fe14:
  addiu $sp, $sp, -32
L8003fe18:
  sw $s0, 16($sp)
L8003fe1c:
  lui $s0, 0x801d
L8003fe20:
  addiu $s0, $s0, 6272
L8003fe24:
  addu $a0, $s0, $zero
L8003fe28:
  sw $ra, 24($sp)
L8003fe2c:
  jal L8003cf14
L8003fe30:
  sw $s1, 20($sp)
L8003fe34:
  addiu $s1, $s0, 4096
L8003fe38:
  jal L8003cf14
L8003fe3c:
  addu $a0, $s1, $zero
L8003fe40:
  addu $a0, $s0, $zero
L8003fe44:
  lui $a2, 0x8001
L8003fe48:
  addiu $a1, $zero, 1024
L8003fe4c:
  addiu $a2, $a2, 900
L8003fe50:
  sw $s1, 1240($gp)
L8003fe54:
  jal L8003f758
L8003fe58:
  addiu $a3, $zero, 4
L8003fe5c:
  lw $ra, 24($sp)
L8003fe60:
  lw $s1, 20($sp)
L8003fe64:
  lw $s0, 16($sp)
L8003fe68:
  jr $ra
L8003fe6c:
  addiu $sp, $sp, 32
L8003fe70:
  sw $a0, 96($gp)
L8003fe74:
  sw $a0, 92($gp)
L8003fe78:
  jr $ra
L8003fe7c:
  sll $zero, $zero, 0x0
L8003fe80:
  addiu $sp, $sp, -24
L8003fe84:
  lui $v0, 0x800f
L8003fe88:
  addiu $v0, $v0, -24920
L8003fe8c:
  sw $ra, 16($sp)
L8003fe90:
  lw $a0, 16($v0)
L8003fe94:
  lw $a1, 20($v0)
L8003fe98:
  lw $a2, 24($v0)
L8003fe9c:
  addiu $v0, $zero, -1
L8003fea0:
  sb $v0, 1280($gp)
L8003fea4:
  jal 0x80046990
L8003fea8:
  sll $zero, $zero, 0x0
L8003feac:
  jal 0x8004703c
L8003feb0:
  sll $zero, $zero, 0x0
L8003feb4:
  andi $v0, $v0, 0x8
L8003feb8:
  beq $v0, $zero, L8003fed0
L8003febc:
  sll $zero, $zero, 0x0
L8003fec0:
  jal 0x80012d4c
L8003fec4:
  sll $zero, $zero, 0x0
L8003fec8:
  j L8003feac
L8003fecc:
  sll $zero, $zero, 0x0
L8003fed0:
  lw $ra, 16($sp)
L8003fed4:
  sll $zero, $zero, 0x0
L8003fed8:
  jr $ra
L8003fedc:
  addiu $sp, $sp, 24
L8003fee0:
  addiu $sp, $sp, -24
L8003fee4:
  andi $a0, $a0, 0xffff
L8003fee8:
  addiu $a1, $zero, 255
L8003feec:
  sw $ra, 16($sp)
L8003fef0:
  jal 0x80048658
L8003fef4:
  addu $a2, $zero, $zero
L8003fef8:
  lw $ra, 16($sp)
L8003fefc:
  sll $zero, $zero, 0x0
L8003ff00:
  jr $ra
L8003ff04:
  addiu $sp, $sp, 24
L8003ff08:
  addiu $sp, $sp, -24
L8003ff0c:
  sw $s0, 16($sp)
L8003ff10:
  ori $s0, $a0, 0x7000
L8003ff14:
  sw $ra, 20($sp)
L8003ff18:
  jal 0x80047314
L8003ff1c:
  andi $a0, $s0, 0xffff
L8003ff20:
  lw $ra, 20($sp)
L8003ff24:
  sw $s0, 1272($gp)
L8003ff28:
  lw $s0, 16($sp)
L8003ff2c:
  jr $ra
L8003ff30:
  addiu $sp, $sp, 24
L8003ff34:
  addiu $sp, $sp, -24
L8003ff38:
  addiu $a0, $zero, -8
L8003ff3c:
  sw $ra, 16($sp)
L8003ff40:
  jal 0x80047430
L8003ff44:
  addu $a1, $zero, $zero
L8003ff48:
  lw $ra, 16($sp)
L8003ff4c:
  sll $zero, $zero, 0x0
L8003ff50:
  jr $ra
L8003ff54:
  addiu $sp, $sp, 24
L8003ff58:
  addiu $sp, $sp, -24
L8003ff5c:
  blez $a0, L8003ff68
L8003ff60:
  sw $ra, 16($sp)
L8003ff64:
  subu $a0, $zero, $a0
L8003ff68:
  sll $a0, $a0, 0x10
L8003ff6c:
  sra $a0, $a0, 0x10
L8003ff70:
  jal 0x80047430
L8003ff74:
  addu $a1, $zero, $zero
L8003ff78:
  lw $ra, 16($sp)
L8003ff7c:
  sll $zero, $zero, 0x0
L8003ff80:
  jr $ra
L8003ff84:
  addiu $sp, $sp, 24
L8003ff88:
  addiu $sp, $sp, -24
L8003ff8c:
  andi $a0, $a0, 0xffff
L8003ff90:
  ori $a0, $a0, 0x8000
L8003ff94:
  addiu $a1, $zero, 255
L8003ff98:
  sw $ra, 16($sp)
L8003ff9c:
  jal 0x80048658
L8003ffa0:
  addu $a2, $zero, $zero
L8003ffa4:
  lw $ra, 16($sp)
L8003ffa8:
  sll $zero, $zero, 0x0
L8003ffac:
  jr $ra
L8003ffb0:
  addiu $sp, $sp, 24
L8003ffb4:
  addiu $sp, $sp, -24
L8003ffb8:
  andi $a0, $a0, 0xffff
L8003ffbc:
  sw $ra, 16($sp)
L8003ffc0:
  jal 0x80045334
L8003ffc4:
  ori $a0, $a0, 0x8000
L8003ffc8:
  lw $ra, 16($sp)
L8003ffcc:
  sll $zero, $zero, 0x0
L8003ffd0:
  jr $ra
L8003ffd4:
  addiu $sp, $sp, 24
L8003ffd8:
  addiu $sp, $sp, -24
L8003ffdc:
  andi $a0, $a0, 0xffff
L8003ffe0:
  sw $ra, 16($sp)
L8003ffe4:
  jal 0x80047314
L8003ffe8:
  ori $a0, $a0, 0xa000
L8003ffec:
  lw $ra, 16($sp)
L8003fff0:
  sll $zero, $zero, 0x0
L8003fff4:
  jr $ra
L8003fff8:
  addiu $sp, $sp, 24
L8003fffc:
  addiu $sp, $sp, -24
L80040000:
  sw $ra, 16($sp)
L80040004:
  jal 0x800473cc
L80040008:
  addu $a0, $zero, $zero
L8004000c:
  jal 0x800473cc
L80040010:
  ori $a0, $zero, 0x8000
L80040014:
  jal 0x80047ec4
L80040018:
  sll $zero, $zero, 0x0
L8004001c:
  lw $ra, 16($sp)
L80040020:
  sll $zero, $zero, 0x0
L80040024:
  jr $ra
L80040028:
  addiu $sp, $sp, 24
