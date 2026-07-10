.set noreorder
.set noat

.section .text.boot_fade_helpers,"ax",@progbits
.align 2
.global boot_fade_helpers

boot_fade_helpers:
L80015078:
  addiu $sp, $sp, -56
L8001507c:
  sw $s1, 36($sp)
L80015080:
  addu $s1, $a0, $zero
L80015084:
  sw $s2, 40($sp)
L80015088:
  addu $s2, $a1, $zero
L8001508c:
  sw $s3, 44($sp)
L80015090:
  addu $s3, $a2, $zero
L80015094:
  lw $v1, 492($gp)
L80015098:
  addiu $v0, $zero, -33
L8001509c:
  sw $s0, 32($sp)
L800150a0:
  and $v1, $v1, $v0
L800150a4:
  sw $v1, 492($gp)
L800150a8:
  lw $v0, 492($gp)
L800150ac:
  addu $s0, $a3, $zero
L800150b0:
  andi $v0, $v0, 0x10
L800150b4:
  beq $v0, $zero, L800150d8
L800150b8:
  sw $ra, 48($sp)
L800150bc:
  lw $v0, 492($gp)
L800150c0:
  lui $v1, 0x8
L800150c4:
  and $v0, $v0, $v1
L800150c8:
  beq $v0, $zero, L800150d8
L800150cc:
  sll $zero, $zero, 0x0
L800150d0:
  jal 0x80015010
L800150d4:
  sll $zero, $zero, 0x0
L800150d8:
  sw $s0, 16($sp)
L800150dc:
  lui $s0, 0x800f
L800150e0:
  addiu $s0, $s0, -25064
L800150e4:
  addu $a0, $s0, $zero
L800150e8:
  lw $v0, 72($sp)
L800150ec:
  addu $a1, $s1, $zero
L800150f0:
  sw $v0, 20($sp)
L800150f4:
  lw $v0, 76($sp)
L800150f8:
  addu $a2, $s2, $zero
L800150fc:
  sw $v0, 24($sp)
L80015100:
  lw $v0, 80($sp)
L80015104:
  addu $a3, $s3, $zero
L80015108:
  jal 0x80013998
L8001510c:
  sw $v0, 28($sp)
L80015110:
  addu $v0, $s0, $zero
L80015114:
  lw $v1, 492($gp)
L80015118:
  lw $ra, 48($sp)
L8001511c:
  lw $s3, 44($sp)
L80015120:
  lw $s2, 40($sp)
L80015124:
  lw $s1, 36($sp)
L80015128:
  lw $s0, 32($sp)
L8001512c:
  ori $v1, $v1, 0x20
L80015130:
  sw $v1, 492($gp)
L80015134:
  jr $ra
L80015138:
  addiu $sp, $sp, 56
L8001513c:
  addiu $sp, $sp, -24
L80015140:
  sw $s0, 16($sp)
L80015144:
  addu $s0, $a0, $zero
L80015148:
  sw $ra, 20($sp)
L8001514c:
  lw $v0, 40($s0)
L80015150:
  sll $zero, $zero, 0x0
L80015154:
  addiu $v0, $v0, -2048
L80015158:
  bgtz $v0, L800151a0
L8001515c:
  sw $v0, 40($s0)
L80015160:
  lw $v0, 32($s0)
L80015164:
  sll $zero, $zero, 0x0
L80015168:
  beq $v0, $zero, L80015194
L8001516c:
  sw $zero, 28($s0)
L80015170:
  lw $v0, 64($s0)
L80015174:
  sll $zero, $zero, 0x0
L80015178:
  addu $a1, $v0, $zero
L8001517c:
  addiu $v0, $v0, 1
L80015180:
  sw $v0, 64($s0)
L80015184:
  lw $v0, 32($s0)
L80015188:
  sll $zero, $zero, 0x0
L8001518c:
  jalr $ra, $v0
L80015190:
  sll $zero, $zero, 0x0
L80015194:
  lw $v0, 28($s0)
L80015198:
  sll $zero, $zero, 0x0
L8001519c:
  sw $v0, 40($s0)
L800151a0:
  lw $ra, 20($sp)
L800151a4:
  lw $s0, 16($sp)
L800151a8:
  jr $ra
L800151ac:
  addiu $sp, $sp, 24
L800151b0:
  lui $v0, 0x800f
L800151b4:
  addiu $v0, $v0, -24888
L800151b8:
  addiu $v1, $zero, 8
L800151bc:
  sb $zero, 6($v0)
L800151c0:
  sb $zero, 4($v0)
L800151c4:
  sb $zero, 5($v0)
L800151c8:
  sb $v1, 7($v0)
L800151cc:
  sb $zero, 573($gp)
L800151d0:
  jr $ra
L800151d4:
  sll $zero, $zero, 0x0
L800151d8:
  lui $v0, 0x800f
L800151dc:
  addiu $a2, $v0, -24888
L800151e0:
  lbu $v0, 4($a2)
L800151e4:
  lbu $v1, 5($a2)
L800151e8:
  lbu $t0, 7($a2)
L800151ec:
  sltu $v0, $v0, $v1
L800151f0:
  beq $v0, $zero, L80015270
L800151f4:
  addiu $a1, $zero, 14
L800151f8:
  lh $a3, 8($a2)
L800151fc:
  addiu $t1, $zero, 29
L80015200:
  subu $a0, $a3, $t0
L80015204:
  lbu $v1, 4($a2)
L80015208:
  sll $zero, $zero, 0x0
L8001520c:
  slt $v0, $a0, $v1
L80015210:
  beq $v0, $zero, L8001521c
L80015214:
  addu $a3, $a0, $zero
L80015218:
  addu $a0, $v1, $zero
L8001521c:
  lbu $v1, 5($a2)
L80015220:
  sll $zero, $zero, 0x0
L80015224:
  slt $v0, $v1, $a0
L80015228:
  beq $v0, $zero, L80015234
L8001522c:
  sll $zero, $zero, 0x0
L80015230:
  addu $a0, $v1, $zero
L80015234:
  addu $v1, $a2, $a1
L80015238:
  subu $v0, $t1, $a1
L8001523c:
  addiu $a1, $a1, -1
L80015240:
  addu $v0, $a2, $v0
L80015244:
  sb $a0, 10($v1)
L80015248:
  bgez $a1, L80015200
L8001524c:
  sb $a0, 10($v0)
L80015250:
  lui $v0, 0x800a
L80015254:
  lw $v0, -20264($v0)
L80015258:
  sll $zero, $zero, 0x0
L8001525c:
  mult $t0, $v0
L80015260:
  lhu $v0, 8($a2)
L80015264:
  mflo $t2
L80015268:
  j L800152f0
L8001526c:
  addu $v0, $v0, $t2
L80015270:
  lh $a3, 8($a2)
L80015274:
  addu $a1, $zero, $zero
L80015278:
  addiu $t1, $zero, 29
L8001527c:
  addu $a0, $a3, $t0
L80015280:
  lbu $v1, 5($a2)
L80015284:
  sll $zero, $zero, 0x0
L80015288:
  slt $v0, $a0, $v1
L8001528c:
  beq $v0, $zero, L80015298
L80015290:
  addu $a3, $a0, $zero
L80015294:
  addu $a0, $v1, $zero
L80015298:
  lbu $v1, 4($a2)
L8001529c:
  sll $zero, $zero, 0x0
L800152a0:
  slt $v0, $v1, $a0
L800152a4:
  beq $v0, $zero, L800152b0
L800152a8:
  sll $zero, $zero, 0x0
L800152ac:
  addu $a0, $v1, $zero
L800152b0:
  addu $v1, $a2, $a1
L800152b4:
  subu $v0, $t1, $a1
L800152b8:
  addiu $a1, $a1, 1
L800152bc:
  addu $v0, $a2, $v0
L800152c0:
  sb $a0, 10($v1)
L800152c4:
  sb $a0, 10($v0)
L800152c8:
  slti $v0, $a1, 15
L800152cc:
  bne $v0, $zero, L8001527c
L800152d0:
  sll $zero, $zero, 0x0
L800152d4:
  lui $v0, 0x800a
L800152d8:
  lw $v0, -20264($v0)
L800152dc:
  sll $zero, $zero, 0x0
L800152e0:
  mult $t0, $v0
L800152e4:
  lhu $v0, 8($a2)
L800152e8:
  mflo $t2
L800152ec:
  subu $v0, $v0, $t2
L800152f0:
  sh $v0, 8($a2)
L800152f4:
  lbu $v0, 5($a2)
L800152f8:
  sll $zero, $zero, 0x0
L800152fc:
  bne $a0, $v0, L80015308
L80015300:
  sll $zero, $zero, 0x0
L80015304:
  sb $a0, 4($a2)
L80015308:
  jr $ra
L8001530c:
  sll $zero, $zero, 0x0
L80015310:
  addiu $sp, $sp, -32
L80015314:
  lui $v0, 0x800f
L80015318:
  sw $s1, 20($sp)
L8001531c:
  addiu $s1, $v0, -24888
L80015320:
  sw $ra, 28($sp)
L80015324:
  sw $s2, 24($sp)
L80015328:
  sw $s0, 16($sp)
L8001532c:
  lbu $v0, 6($s1)
L80015330:
  sll $zero, $zero, 0x0
L80015334:
  andi $v0, $v0, 0x80
L80015338:
  beq $v0, $zero, L800154cc
L8001533c:
  addu $s2, $a0, $zero
L80015340:
  lbu $v0, 569($gp)
L80015344:
  sll $zero, $zero, 0x0
L80015348:
  andi $v0, $v0, 0x80
L8001534c:
  bne $v0, $zero, L8001535c
L80015350:
  sll $zero, $zero, 0x0
L80015354:
  jal L80015cfc
L80015358:
  sll $zero, $zero, 0x0
L8001535c:
  lbu $v1, 7($s2)
L80015360:
  lui $v0, 0x800a
L80015364:
  lw $v0, -20264($v0)
L80015368:
  sll $zero, $zero, 0x0
L8001536c:
  mult $v1, $v0
L80015370:
  lbu $s0, 4($s2)
L80015374:
  lbu $a0, 5($s2)
L80015378:
  mflo $v1
L8001537c:
  bne $s0, $a0, L8001547c
L80015380:
  sll $zero, $zero, 0x0
L80015384:
  lbu $v1, 6($s1)
L80015388:
  sll $zero, $zero, 0x0
L8001538c:
  andi $v0, $v1, 0x7f
L80015390:
  sb $v0, 6($s1)
L80015394:
  addiu $v0, $zero, 255
L80015398:
  bne $s0, $v0, L800153c8
L8001539c:
  andi $v0, $v1, 0x79
L800153a0:
  jal L80015cfc
L800153a4:
  sb $v0, 6($s1)
L800153a8:
  lbu $v0, 580($gp)
L800153ac:
  lbu $v1, 579($gp)
L800153b0:
  lbu $a0, 578($gp)
L800153b4:
  sb $zero, 568($gp)
L800153b8:
  sb $zero, 573($gp)
L800153bc:
  sb $v0, 572($gp)
L800153c0:
  sb $v1, 571($gp)
L800153c4:
  sb $a0, 570($gp)
L800153c8:
  bne $s0, $zero, L800154cc
L800153cc:
  sll $zero, $zero, 0x0
L800153d0:
  lbu $v1, 6($s1)
L800153d4:
  sll $zero, $zero, 0x0
L800153d8:
  andi $v0, $v1, 0x2
L800153dc:
  beq $v0, $zero, L800153f8
L800153e0:
  andi $v0, $v1, 0x4
L800153e4:
  beq $v0, $zero, L800154cc
L800153e8:
  addiu $v0, $zero, 128
L800153ec:
  sb $v0, 569($gp)
L800153f0:
  j L80015404
L800153f4:
  lui $v0, 0x800f
L800153f8:
  jal L80015d0c
L800153fc:
  sll $zero, $zero, 0x0
L80015400:
  lui $v0, 0x800f
L80015404:
  addiu $s0, $v0, -24888
L80015408:
  lbu $v0, 580($gp)
L8001540c:
  lbu $v1, 579($gp)
L80015410:
  lbu $a0, 578($gp)
L80015414:
  lbu $a1, 6($s0)
L80015418:
  sb $v0, 572($gp)
L8001541c:
  andi $v0, $a1, 0x10
L80015420:
  sb $v1, 571($gp)
L80015424:
  sb $a0, 570($gp)
L80015428:
  beq $v0, $zero, L800154cc
L8001542c:
  andi $v0, $a1, 0x20
L80015430:
  beq $v0, $zero, L800154cc
L80015434:
  andi $v0, $a1, 0xdf
L80015438:
  sb $v0, 6($s0)
L8001543c:
  lbu $v0, 0($s2)
L80015440:
  sll $zero, $zero, 0x0
L80015444:
  sb $v0, 572($gp)
L80015448:
  lbu $v0, 1($s2)
L8001544c:
  sll $zero, $zero, 0x0
L80015450:
  sb $v0, 571($gp)
L80015454:
  lbu $v0, 2($s2)
L80015458:
  sll $zero, $zero, 0x0
L8001545c:
  sb $v0, 570($gp)
L80015460:
  jal L80015cfc
L80015464:
  sll $zero, $zero, 0x0
L80015468:
  lbu $v0, 6($s0)
L8001546c:
  sll $zero, $zero, 0x0
L80015470:
  ori $v0, $v0, 0x80
L80015474:
  j L800154cc
L80015478:
  sb $v0, 6($s0)
L8001547c:
  lbu $v0, 6($s1)
L80015480:
  sll $zero, $zero, 0x0
L80015484:
  andi $v0, $v0, 0x1
L80015488:
  beq $v0, $zero, L800154a0
L8001548c:
  slt $v0, $s0, $a0
L80015490:
  jal L800151d8
L80015494:
  sll $zero, $zero, 0x0
L80015498:
  j L800154cc
L8001549c:
  sll $zero, $zero, 0x0
L800154a0:
  beq $v0, $zero, L800154b4
L800154a4:
  sll $zero, $zero, 0x0
L800154a8:
  addu $s0, $s0, $v1
L800154ac:
  j L800154bc
L800154b0:
  slt $v0, $s0, $a0
L800154b4:
  subu $s0, $s0, $v1
L800154b8:
  slt $v0, $a0, $s0
L800154bc:
  bne $v0, $zero, L800154c8
L800154c0:
  lui $v0, 0x800f
L800154c4:
  addu $s0, $a0, $zero
L800154c8:
  sb $s0, -24884($v0)
L800154cc:
  lw $ra, 28($sp)
L800154d0:
  lw $s2, 24($sp)
L800154d4:
  lw $s1, 20($sp)
L800154d8:
  lw $s0, 16($sp)
L800154dc:
  jr $ra
L800154e0:
  addiu $sp, $sp, 32
L800154e4:
  addiu $sp, $sp, -40
L800154e8:
  lui $v0, 0x800f
L800154ec:
  sw $s2, 24($sp)
L800154f0:
  addiu $s2, $v0, -24888
L800154f4:
  addu $a0, $s2, $zero
L800154f8:
  sw $ra, 36($sp)
L800154fc:
  sw $s4, 32($sp)
L80015500:
  sw $s3, 28($sp)
L80015504:
  sw $s1, 20($sp)
L80015508:
  jal L80015310
L8001550c:
  sw $s0, 16($sp)
L80015510:
  lbu $a0, 6($s2)
L80015514:
  sll $zero, $zero, 0x0
L80015518:
  andi $v0, $a0, 0x80
L8001551c:
  bne $v0, $zero, L80015544
L80015520:
  lui $s1, 0x1f80
L80015524:
  lbu $v0, 569($gp)
L80015528:
  sll $zero, $zero, 0x0
L8001552c:
  beq $v0, $zero, L80015698
L80015530:
  addiu $v0, $zero, 255
L80015534:
  lbu $v1, 4($s2)
L80015538:
  sll $zero, $zero, 0x0
L8001553c:
  beq $v1, $v0, L80015698
L80015540:
  sll $zero, $zero, 0x0
L80015544:
  ori $s1, $s1, 0x3c0
L80015548:
  lui $v1, 0xf0
L8001554c:
  ori $v1, $v1, 0x140
L80015550:
  lui $v0, 0x6000
L80015554:
  sw $v0, 0($s1)
L80015558:
  lui $v0, 0x800f
L8001555c:
  sw $v1, 8($s1)
L80015560:
  andi $v1, $a0, 0x1
L80015564:
  sw $zero, 4($s1)
L80015568:
  lw $s3, -25196($v0)
L8001556c:
  beq $v1, $zero, L800155dc
L80015570:
  addiu $v0, $zero, 8
L80015574:
  sh $v0, 10($s1)
L80015578:
  addu $s0, $zero, $zero
L8001557c:
  addiu $s4, $zero, 255
L80015580:
  addu $a0, $s1, $zero
L80015584:
  addu $a1, $s3, $zero
L80015588:
  addu $v0, $s2, $s0
L8001558c:
  lbu $v0, 10($v0)
L80015590:
  addiu $a2, $zero, 4
L80015594:
  subu $v0, $s4, $v0
L80015598:
  sb $v0, 14($s1)
L8001559c:
  sb $v0, 13($s1)
L800155a0:
  jal 0x80084240
L800155a4:
  sb $v0, 12($s1)
L800155a8:
  lhu $v0, 6($s1)
L800155ac:
  addiu $s0, $s0, 1
L800155b0:
  addiu $v0, $v0, 8
L800155b4:
  sh $v0, 6($s1)
L800155b8:
  slti $v0, $s0, 30
L800155bc:
  bne $v0, $zero, L80015584
L800155c0:
  addu $a0, $s1, $zero
L800155c4:
  lui $v0, 0x800f
L800155c8:
  lbu $v0, -24882($v0)
L800155cc:
  sll $zero, $zero, 0x0
L800155d0:
  andi $v0, $v0, 0x2
L800155d4:
  beq $v0, $zero, L80015698
L800155d8:
  sll $zero, $zero, 0x0
L800155dc:
  lui $v0, 0x800f
L800155e0:
  lbu $v0, -24882($v0)
L800155e4:
  sll $zero, $zero, 0x0
L800155e8:
  andi $v0, $v0, 0x2
L800155ec:
  beq $v0, $zero, L80015608
L800155f0:
  addiu $a2, $zero, 4
L800155f4:
  lbu $a2, 568($gp)
L800155f8:
  sll $zero, $zero, 0x0
L800155fc:
  bne $a2, $zero, L8001560c
L80015600:
  lui $v0, 0x800f
L80015604:
  addiu $a2, $zero, 63
L80015608:
  lui $v0, 0x800f
L8001560c:
  addiu $v0, $v0, -24888
L80015610:
  addiu $v1, $zero, 255
L80015614:
  lbu $a0, 4($v0)
L80015618:
  lbu $v0, 6($v0)
L8001561c:
  subu $v1, $v1, $a0
L80015620:
  andi $v0, $v0, 0x10
L80015624:
  sb $v1, 14($s1)
L80015628:
  sb $v1, 13($s1)
L8001562c:
  beq $v0, $zero, L8001568c
L80015630:
  sb $v1, 12($s1)
L80015634:
  lbu $a0, 0($s2)
L80015638:
  lbu $v1, 4($s2)
L8001563c:
  lui $v0, 0x5000
L80015640:
  subu $a0, $a0, $v1
L80015644:
  bgez $a0, L80015650
L80015648:
  sw $v0, 0($s1)
L8001564c:
  addu $a0, $zero, $zero
L80015650:
  lbu $v1, 1($s2)
L80015654:
  lbu $v0, 4($s2)
L80015658:
  sb $a0, 12($s1)
L8001565c:
  subu $a0, $v1, $v0
L80015660:
  bgez $a0, L8001566c
L80015664:
  sll $zero, $zero, 0x0
L80015668:
  addu $a0, $zero, $zero
L8001566c:
  lbu $v1, 2($s2)
L80015670:
  lbu $v0, 4($s2)
L80015674:
  sb $a0, 13($s1)
L80015678:
  subu $a0, $v1, $v0
L8001567c:
  bgez $a0, L80015688
L80015680:
  sll $zero, $zero, 0x0
L80015684:
  addu $a0, $zero, $zero
L80015688:
  sb $a0, 14($s1)
L8001568c:
  addu $a0, $s1, $zero
L80015690:
  jal 0x80084240
L80015694:
  addu $a1, $s3, $zero
L80015698:
  lw $ra, 36($sp)
L8001569c:
  lw $s4, 32($sp)
L800156a0:
  lw $s3, 28($sp)
L800156a4:
  lw $s2, 24($sp)
L800156a8:
  lw $s1, 20($sp)
L800156ac:
  lw $s0, 16($sp)
L800156b0:
  jr $ra
L800156b4:
  addiu $sp, $sp, 40
L800156b8:
  lui $v0, 0x800f
L800156bc:
  addiu $a1, $v0, -24888
L800156c0:
  addiu $v1, $zero, 29
L800156c4:
  addu $v0, $a1, $v1
L800156c8:
  addiu $v1, $v1, -1
L800156cc:
  bgez $v1, L800156c4
L800156d0:
  sb $a0, 10($v0)
L800156d4:
  jr $ra
L800156d8:
  sll $zero, $zero, 0x0
L800156dc:
  addiu $sp, $sp, -24
L800156e0:
  addiu $v0, $zero, 1
L800156e4:
  sw $ra, 16($sp)
L800156e8:
  sb $v0, 573($gp)
L800156ec:
  jal L800158b8
L800156f0:
  sll $zero, $zero, 0x0
L800156f4:
  lui $v0, 0x800f
L800156f8:
  addiu $v0, $v0, -24888
L800156fc:
  sb $zero, 6($v0)
L80015700:
  sb $zero, 4($v0)
L80015704:
  addiu $v0, $zero, 255
L80015708:
  sb $v0, 570($gp)
L8001570c:
  sb $v0, 571($gp)
L80015710:
  sb $v0, 572($gp)
L80015714:
  jal L80015d0c
L80015718:
  sll $zero, $zero, 0x0
L8001571c:
  lw $ra, 16($sp)
L80015720:
  sll $zero, $zero, 0x0
L80015724:
  jr $ra
L80015728:
  addiu $sp, $sp, 24
L8001572c:
  lbu $v0, 573($gp)
L80015730:
  sll $zero, $zero, 0x0
L80015734:
  beq $v0, $zero, L80015778
L80015738:
  lui $v1, 0xff
L8001573c:
  ori $v1, $v1, 0xffff
L80015740:
  lui $v0, 0x800f
L80015744:
  sw $v1, -24888($v0)
L80015748:
  addiu $v0, $v0, -24888
L8001574c:
  addiu $v1, $zero, 144
L80015750:
  sb $v1, 6($v0)
L80015754:
  addiu $v1, $zero, 12
L80015758:
  sb $v1, 7($v0)
L8001575c:
  addiu $v0, $zero, 1
L80015760:
  sb $v0, 580($gp)
L80015764:
  sb $v0, 572($gp)
L80015768:
  sb $v0, 579($gp)
L8001576c:
  sb $v0, 571($gp)
L80015770:
  sb $v0, 578($gp)
L80015774:
  sb $v0, 570($gp)
L80015778:
  jr $ra
L8001577c:
  sll $zero, $zero, 0x0
L80015780:
  addiu $sp, $sp, -24
L80015784:
  sw $s0, 16($sp)
L80015788:
  lui $s0, 0x800f
L8001578c:
  addiu $s0, $s0, -24888
L80015790:
  addiu $v0, $zero, 255
L80015794:
  sw $ra, 20($sp)
L80015798:
  sb $v0, 5($s0)
L8001579c:
  addiu $v0, $zero, 128
L800157a0:
  sb $v0, 6($s0)
L800157a4:
  lbu $v0, 569($gp)
L800157a8:
  lbu $a0, 4($s0)
L800157ac:
  sh $zero, 8($s0)
L800157b0:
  andi $v0, $v0, 0x7f
L800157b4:
  sb $v0, 569($gp)
L800157b8:
  jal L800156b8
L800157bc:
  sll $zero, $zero, 0x0
L800157c0:
  addiu $v0, $zero, 12
L800157c4:
  jal L8001572c
L800157c8:
  sb $v0, 7($s0)
L800157cc:
  lw $ra, 20($sp)
L800157d0:
  lw $s0, 16($sp)
L800157d4:
  jr $ra
L800157d8:
  addiu $sp, $sp, 24
L800157dc:
  addiu $sp, $sp, -24
L800157e0:
  sw $ra, 16($sp)
L800157e4:
  jal L80015780
L800157e8:
  sll $zero, $zero, 0x0
L800157ec:
  lui $v0, 0x800f
L800157f0:
  addiu $v0, $v0, -24888
L800157f4:
  lbu $v1, 6($v0)
L800157f8:
  addiu $a0, $zero, 8
L800157fc:
  sb $a0, 7($v0)
L80015800:
  ori $v1, $v1, 0x1
L80015804:
  jal L8001572c
L80015808:
  sb $v1, 6($v0)
L8001580c:
  lw $ra, 16($sp)
L80015810:
  sll $zero, $zero, 0x0
L80015814:
  jr $ra
L80015818:
  addiu $sp, $sp, 24
L8001581c:
  addiu $sp, $sp, -24
L80015820:
  lui $v0, 0xff
L80015824:
  ori $v0, $v0, 0xffff
L80015828:
  sw $ra, 20($sp)
L8001582c:
  bne $a0, $v0, L8001583c
L80015830:
  sw $s0, 16($sp)
L80015834:
  addiu $v0, $zero, 1
L80015838:
  sb $v0, 573($gp)
L8001583c:
  lui $s0, 0x800f
L80015840:
  sw $a0, -24888($s0)
L80015844:
  jal L80015780
L80015848:
  addiu $s0, $s0, -24888
L8001584c:
  lbu $v0, 6($s0)
L80015850:
  sll $zero, $zero, 0x0
L80015854:
  ori $v0, $v0, 0x30
L80015858:
  jal L8001572c
L8001585c:
  sb $v0, 6($s0)
L80015860:
  lw $ra, 20($sp)
L80015864:
  lw $s0, 16($sp)
L80015868:
  jr $ra
L8001586c:
  addiu $sp, $sp, 24
L80015870:
  lbu $v0, 573($gp)
L80015874:
  sll $zero, $zero, 0x0
L80015878:
  beq $v0, $zero, L800158b0
L8001587c:
  lui $v1, 0xff
L80015880:
  ori $v1, $v1, 0xffff
L80015884:
  lui $v0, 0x800f
L80015888:
  sw $v1, -24888($v0)
L8001588c:
  addiu $v0, $v0, -24888
L80015890:
  addiu $v1, $zero, 176
L80015894:
  sb $v1, 6($v0)
L80015898:
  addiu $v1, $zero, 12
L8001589c:
  sb $v1, 7($v0)
L800158a0:
  addiu $v0, $zero, 255
L800158a4:
  sb $v0, 578($gp)
L800158a8:
  sb $v0, 579($gp)
L800158ac:
  sb $v0, 580($gp)
L800158b0:
  jr $ra
L800158b4:
  sll $zero, $zero, 0x0
L800158b8:
  addiu $sp, $sp, -24
L800158bc:
  sw $s0, 16($sp)
L800158c0:
  lui $s0, 0x800f
L800158c4:
  addiu $s0, $s0, -24888
L800158c8:
  sw $ra, 20($sp)
L800158cc:
  lbu $a0, 4($s0)
L800158d0:
  addiu $v0, $zero, 255
L800158d4:
  sh $v0, 8($s0)
L800158d8:
  addiu $v0, $zero, 128
L800158dc:
  sb $zero, 5($s0)
L800158e0:
  jal L800156b8
L800158e4:
  sb $v0, 6($s0)
L800158e8:
  addiu $v0, $zero, 12
L800158ec:
  jal L80015870
L800158f0:
  sb $v0, 7($s0)
L800158f4:
  lw $ra, 20($sp)
L800158f8:
  lw $s0, 16($sp)
L800158fc:
  jr $ra
L80015900:
  addiu $sp, $sp, 24
L80015904:
  addiu $sp, $sp, -24
L80015908:
  sw $ra, 16($sp)
L8001590c:
  jal L800158b8
L80015910:
  sll $zero, $zero, 0x0
L80015914:
  lui $v0, 0x800f
L80015918:
  addiu $v0, $v0, -24888
L8001591c:
  lbu $v1, 6($v0)
L80015920:
  addiu $a0, $zero, 8
L80015924:
  sb $a0, 7($v0)
L80015928:
  ori $v1, $v1, 0x1
L8001592c:
  jal L80015870
L80015930:
  sb $v1, 6($v0)
L80015934:
  lw $ra, 16($sp)
L80015938:
  sll $zero, $zero, 0x0
L8001593c:
  jr $ra
L80015940:
  addiu $sp, $sp, 24
L80015944:
  addiu $sp, $sp, -24
L80015948:
  lui $v0, 0xff
L8001594c:
  ori $v0, $v0, 0xffff
L80015950:
  sw $ra, 20($sp)
L80015954:
  bne $a0, $v0, L80015964
L80015958:
  sw $s0, 16($sp)
L8001595c:
  addiu $v0, $zero, 1
L80015960:
  sb $v0, 573($gp)
L80015964:
  lui $s0, 0x800f
L80015968:
  sw $a0, -24888($s0)
L8001596c:
  jal L800158b8
L80015970:
  addiu $s0, $s0, -24888
L80015974:
  lbu $v0, 6($s0)
L80015978:
  sll $zero, $zero, 0x0
L8001597c:
  ori $v0, $v0, 0x30
L80015980:
  jal L80015870
L80015984:
  sb $v0, 6($s0)
L80015988:
  lw $ra, 20($sp)
L8001598c:
  lw $s0, 16($sp)
L80015990:
  jr $ra
L80015994:
  addiu $sp, $sp, 24
L80015998:
  addiu $sp, $sp, -24
L8001599c:
  lui $v0, 0x800f
L800159a0:
  sw $s0, 16($sp)
L800159a4:
  addiu $s0, $v0, -24888
L800159a8:
  sw $ra, 20($sp)
L800159ac:
  jal 0x80012d4c
L800159b0:
  sll $zero, $zero, 0x0
L800159b4:
  lbu $v0, 6($s0)
L800159b8:
  sll $zero, $zero, 0x0
L800159bc:
  andi $v0, $v0, 0x80
L800159c0:
  bne $v0, $zero, L800159ac
L800159c4:
  sll $zero, $zero, 0x0
L800159c8:
  lw $ra, 20($sp)
L800159cc:
  lw $s0, 16($sp)
L800159d0:
  jr $ra
L800159d4:
  addiu $sp, $sp, 24
L800159d8:
  addiu $sp, $sp, -24
L800159dc:
  sw $ra, 16($sp)
L800159e0:
  jal L80015780
L800159e4:
  sll $zero, $zero, 0x0
L800159e8:
  jal L80015998
L800159ec:
  sll $zero, $zero, 0x0
L800159f0:
  lw $ra, 16($sp)
L800159f4:
  sll $zero, $zero, 0x0
L800159f8:
  jr $ra
L800159fc:
  addiu $sp, $sp, 24
L80015a00:
  addiu $sp, $sp, -24
L80015a04:
  sw $ra, 16($sp)
L80015a08:
  jal L800157dc
L80015a0c:
  sll $zero, $zero, 0x0
L80015a10:
  jal L80015998
L80015a14:
  sll $zero, $zero, 0x0
L80015a18:
  lw $ra, 16($sp)
L80015a1c:
  sll $zero, $zero, 0x0
L80015a20:
  jr $ra
L80015a24:
  addiu $sp, $sp, 24
L80015a28:
  addiu $sp, $sp, -24
L80015a2c:
  sw $ra, 16($sp)
L80015a30:
  jal L8001581c
L80015a34:
  sll $zero, $zero, 0x0
L80015a38:
  jal L80015998
L80015a3c:
  sll $zero, $zero, 0x0
L80015a40:
  lw $ra, 16($sp)
L80015a44:
  sll $zero, $zero, 0x0
L80015a48:
  jr $ra
L80015a4c:
  addiu $sp, $sp, 24
L80015a50:
  addiu $sp, $sp, -24
L80015a54:
  sw $ra, 16($sp)
L80015a58:
  jal L80015780
L80015a5c:
  sll $zero, $zero, 0x0
L80015a60:
  lui $v1, 0x800f
L80015a64:
  addiu $v1, $v1, -24888
L80015a68:
  lbu $v0, 6($v1)
L80015a6c:
  sll $zero, $zero, 0x0
L80015a70:
  ori $v0, $v0, 0x2
L80015a74:
  jal L8001572c
L80015a78:
  sb $v0, 6($v1)
L80015a7c:
  jal L80015998
L80015a80:
  sll $zero, $zero, 0x0
L80015a84:
  lw $ra, 16($sp)
L80015a88:
  sll $zero, $zero, 0x0
L80015a8c:
  jr $ra
L80015a90:
  addiu $sp, $sp, 24
L80015a94:
  addiu $sp, $sp, -24
L80015a98:
  sw $ra, 16($sp)
L80015a9c:
  jal L80015780
L80015aa0:
  sll $zero, $zero, 0x0
L80015aa4:
  lui $v1, 0x800f
L80015aa8:
  addiu $v1, $v1, -24888
L80015aac:
  lbu $v0, 6($v1)
L80015ab0:
  sll $zero, $zero, 0x0
L80015ab4:
  ori $v0, $v0, 0x6
L80015ab8:
  jal L8001572c
L80015abc:
  sb $v0, 6($v1)
L80015ac0:
  jal L80015998
L80015ac4:
  sll $zero, $zero, 0x0
L80015ac8:
  lw $ra, 16($sp)
L80015acc:
  sll $zero, $zero, 0x0
L80015ad0:
  jr $ra
L80015ad4:
  addiu $sp, $sp, 24
L80015ad8:
  addiu $sp, $sp, -24
L80015adc:
  sw $ra, 16($sp)
L80015ae0:
  jal L800158b8
L80015ae4:
  sll $zero, $zero, 0x0
L80015ae8:
  jal L80015998
L80015aec:
  sll $zero, $zero, 0x0
L80015af0:
  lw $ra, 16($sp)
L80015af4:
  sll $zero, $zero, 0x0
L80015af8:
  jr $ra
L80015afc:
  addiu $sp, $sp, 24
L80015b00:
  addiu $sp, $sp, -24
L80015b04:
  sw $ra, 16($sp)
L80015b08:
  jal L80015904
L80015b0c:
  sll $zero, $zero, 0x0
L80015b10:
  jal L80015998
L80015b14:
  sll $zero, $zero, 0x0
L80015b18:
  lw $ra, 16($sp)
L80015b1c:
  sll $zero, $zero, 0x0
L80015b20:
  jr $ra
L80015b24:
  addiu $sp, $sp, 24
L80015b28:
  addiu $sp, $sp, -24
L80015b2c:
  sw $ra, 16($sp)
L80015b30:
  jal L80015944
L80015b34:
  sll $zero, $zero, 0x0
L80015b38:
  jal L80015998
L80015b3c:
  sll $zero, $zero, 0x0
L80015b40:
  lw $ra, 16($sp)
L80015b44:
  sll $zero, $zero, 0x0
L80015b48:
  jr $ra
L80015b4c:
  addiu $sp, $sp, 24
L80015b50:
  addiu $sp, $sp, -24
L80015b54:
  sw $ra, 16($sp)
L80015b58:
  jal L800158b8
L80015b5c:
  sll $zero, $zero, 0x0
L80015b60:
  lui $v1, 0x800f
L80015b64:
  addiu $v1, $v1, -24888
L80015b68:
  lbu $v0, 6($v1)
L80015b6c:
  sll $zero, $zero, 0x0
L80015b70:
  ori $v0, $v0, 0x2
L80015b74:
  jal L80015870
L80015b78:
  sb $v0, 6($v1)
L80015b7c:
  jal L80015998
L80015b80:
  sll $zero, $zero, 0x0
L80015b84:
  lw $ra, 16($sp)
L80015b88:
  sll $zero, $zero, 0x0
L80015b8c:
  jr $ra
L80015b90:
  addiu $sp, $sp, 24
L80015b94:
  addiu $sp, $sp, -24
L80015b98:
  sw $ra, 16($sp)
L80015b9c:
  jal L800158b8
L80015ba0:
  sll $zero, $zero, 0x0
L80015ba4:
  lui $v1, 0x800f
L80015ba8:
  addiu $v1, $v1, -24888
L80015bac:
  lbu $v0, 6($v1)
L80015bb0:
  sll $zero, $zero, 0x0
L80015bb4:
  ori $v0, $v0, 0x6
L80015bb8:
  jal L80015870
L80015bbc:
  sb $v0, 6($v1)
L80015bc0:
  jal L80015998
L80015bc4:
  sll $zero, $zero, 0x0
L80015bc8:
  lw $ra, 16($sp)
L80015bcc:
  sll $zero, $zero, 0x0
L80015bd0:
  jr $ra
L80015bd4:
  addiu $sp, $sp, 24
L80015bd8:
  lui $v0, 0x800f
L80015bdc:
  addiu $v0, $v0, -24888
L80015be0:
  ori $a1, $a1, 0x80
L80015be4:
  sb $a0, 5($v0)
L80015be8:
  jr $ra
L80015bec:
  sb $a1, 6($v0)
L80015bf0:
  lui $v0, 0x800f
L80015bf4:
  addiu $v0, $v0, -24888
L80015bf8:
  addiu $v1, $zero, 128
L80015bfc:
  sb $a0, 4($v0)
L80015c00:
  sb $a0, 5($v0)
L80015c04:
  jr $ra
L80015c08:
  sb $v1, 6($v0)
L80015c0c:
  addiu $sp, $sp, -24
L80015c10:
  sw $ra, 16($sp)
L80015c14:
  jal L80015780
L80015c18:
  sll $zero, $zero, 0x0
L80015c1c:
  lui $v1, 0x800f
L80015c20:
  addiu $v1, $v1, -24888
L80015c24:
  lbu $v0, 6($v1)
L80015c28:
  sll $zero, $zero, 0x0
L80015c2c:
  ori $v0, $v0, 0x2
L80015c30:
  jal L8001572c
L80015c34:
  sb $v0, 6($v1)
L80015c38:
  lw $ra, 16($sp)
L80015c3c:
  sll $zero, $zero, 0x0
L80015c40:
  jr $ra
L80015c44:
  addiu $sp, $sp, 24
L80015c48:
  addiu $sp, $sp, -24
L80015c4c:
  sw $ra, 16($sp)
L80015c50:
  jal L80015780
L80015c54:
  sll $zero, $zero, 0x0
L80015c58:
  lui $v1, 0x800f
L80015c5c:
  addiu $v1, $v1, -24888
L80015c60:
  lbu $v0, 6($v1)
L80015c64:
  sll $zero, $zero, 0x0
L80015c68:
  ori $v0, $v0, 0x6
L80015c6c:
  jal L8001572c
L80015c70:
  sb $v0, 6($v1)
L80015c74:
  lw $ra, 16($sp)
L80015c78:
  sll $zero, $zero, 0x0
L80015c7c:
  jr $ra
L80015c80:
  addiu $sp, $sp, 24
L80015c84:
  addiu $sp, $sp, -24
L80015c88:
  sw $ra, 16($sp)
L80015c8c:
  jal L800158b8
L80015c90:
  sll $zero, $zero, 0x0
L80015c94:
  lui $v1, 0x800f
L80015c98:
  addiu $v1, $v1, -24888
L80015c9c:
  lbu $v0, 6($v1)
L80015ca0:
  sll $zero, $zero, 0x0
L80015ca4:
  ori $v0, $v0, 0x2
L80015ca8:
  jal L80015870
L80015cac:
  sb $v0, 6($v1)
L80015cb0:
  lw $ra, 16($sp)
L80015cb4:
  sll $zero, $zero, 0x0
L80015cb8:
  jr $ra
L80015cbc:
  addiu $sp, $sp, 24
L80015cc0:
  addiu $sp, $sp, -24
L80015cc4:
  sw $ra, 16($sp)
L80015cc8:
  jal L800158b8
L80015ccc:
  sll $zero, $zero, 0x0
L80015cd0:
  lui $v1, 0x800f
L80015cd4:
  addiu $v1, $v1, -24888
L80015cd8:
  lbu $v0, 6($v1)
L80015cdc:
  sll $zero, $zero, 0x0
L80015ce0:
  ori $v0, $v0, 0x6
L80015ce4:
  jal L80015870
L80015ce8:
  sb $v0, 6($v1)
L80015cec:
  lw $ra, 16($sp)
L80015cf0:
  sll $zero, $zero, 0x0
L80015cf4:
  jr $ra
L80015cf8:
  addiu $sp, $sp, 24
L80015cfc:
  addiu $v0, $zero, 1
L80015d00:
  sb $v0, 569($gp)
L80015d04:
  jr $ra
L80015d08:
  sll $zero, $zero, 0x0
L80015d0c:
  sb $zero, 569($gp)
L80015d10:
  jr $ra
L80015d14:
  sll $zero, $zero, 0x0
