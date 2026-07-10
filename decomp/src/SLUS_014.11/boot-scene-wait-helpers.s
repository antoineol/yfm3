.set noreorder
.set noat

.section .text.boot_scene_wait_helpers,"ax",@progbits
.align 2
.global boot_scene_wait_helpers

boot_scene_wait_helpers:
L8001944c:
  addiu $sp, $sp, -32
L80019450:
  sw $s1, 20($sp)
L80019454:
  addu $s1, $a0, $zero
L80019458:
  sw $ra, 24($sp)
L8001945c:
  sw $s0, 16($sp)
L80019460:
  jal 0x80082324
L80019464:
  addiu $a0, $zero, 10
L80019468:
  bne $v0, $zero, L80019460
L8001946c:
  sll $zero, $zero, 0x0
L80019470:
  lui $v0, 0x800a
L80019474:
  lbu $v0, -20308($v0)
L80019478:
  sll $zero, $zero, 0x0
L8001947c:
  bne $v0, $zero, L80019488
L80019480:
  addu $a2, $zero, $zero
L80019484:
  addiu $a2, $zero, 320
L80019488:
  lui $v1, 0x800f
L8001948c:
  addiu $a0, $v1, -25232
L80019490:
  lui $s0, 0x8016
L80019494:
  addiu $s0, $s0, -15324
L80019498:
  lhu $v0, 48($s1)
L8001949c:
  addu $a1, $s0, $zero
L800194a0:
  addu $v0, $v0, $a2
L800194a4:
  sh $v0, -25232($v1)
L800194a8:
  lhu $v1, 50($s1)
L800194ac:
  addiu $v0, $zero, 140
L800194b0:
  sh $v0, 4($a0)
L800194b4:
  addiu $v0, $zero, 196
L800194b8:
  sh $v0, 6($a0)
L800194bc:
  jal 0x80081ed4
L800194c0:
  sh $v1, 2($a0)
L800194c4:
  addu $a1, $s0, $zero
L800194c8:
  addiu $a2, $zero, 27440
L800194cc:
  lhu $v0, 0($a1)
L800194d0:
  addiu $a2, $a2, -1
L800194d4:
  ori $v0, $v0, 0x8000
L800194d8:
  sh $v0, 0($a1)
L800194dc:
  bne $a2, $zero, L800194cc
L800194e0:
  addiu $a1, $a1, 2
L800194e4:
  lui $v1, 0x8016
L800194e8:
  addiu $a1, $v1, -15324
L800194ec:
  lui $a2, 0x800f
L800194f0:
  addiu $a0, $a2, -25232
L800194f4:
  ori $v0, $zero, 0x8000
L800194f8:
  addu $v0, $a1, $v0
L800194fc:
  sh $zero, 22108($v0)
L80019500:
  sh $zero, 22110($v0)
L80019504:
  sh $zero, 21834($v0)
L80019508:
  sh $zero, 21832($v0)
L8001950c:
  sh $zero, 21830($v0)
L80019510:
  sh $zero, 21552($v0)
L80019514:
  addiu $v0, $zero, 320
L80019518:
  sh $zero, 558($a1)
L8001951c:
  sh $zero, 280($a1)
L80019520:
  sh $zero, 276($a1)
L80019524:
  sh $zero, 278($a1)
L80019528:
  sh $zero, 2($a1)
L8001952c:
  sh $v0, -25232($a2)
L80019530:
  addiu $v0, $zero, 256
L80019534:
  sh $v0, 2($a0)
L80019538:
  addiu $v0, $zero, 140
L8001953c:
  sh $v0, 4($a0)
L80019540:
  addiu $v0, $zero, 196
L80019544:
  sh $zero, -15324($v1)
L80019548:
  jal 0x80081de8
L8001954c:
  sh $v0, 6($a0)
L80019550:
  lw $ra, 24($sp)
L80019554:
  lw $s1, 20($sp)
L80019558:
  lw $s0, 16($sp)
L8001955c:
  jr $ra
L80019560:
  addiu $sp, $sp, 32
L80019564:
  addiu $sp, $sp, -56
L80019568:
  sw $s1, 44($sp)
L8001956c:
  addu $s1, $a0, $zero
L80019570:
  sw $ra, 48($sp)
L80019574:
  jal 0x8004002c
L80019578:
  sw $s0, 40($sp)
L8001957c:
  addu $a0, $v0, $zero
L80019580:
  jal 0x800400ac
L80019584:
  addiu $a1, $zero, 1
L80019588:
  addu $s0, $v0, $zero
L8001958c:
  addu $a0, $s0, $zero
L80019590:
  lh $a1, 48($s1)
L80019594:
  lh $a2, 50($s1)
L80019598:
  addiu $v0, $zero, 196
L8001959c:
  sw $v0, 16($sp)
L800195a0:
  addiu $v0, $zero, 21
L800195a4:
  addiu $a3, $zero, 140
L800195a8:
  sw $zero, 20($sp)
L800195ac:
  sw $zero, 24($sp)
L800195b0:
  sw $v0, 28($sp)
L800195b4:
  sw $zero, 32($sp)
L800195b8:
  jal 0x80040510
L800195bc:
  sw $zero, 36($sp)
L800195c0:
  addu $a0, $s0, $zero
L800195c4:
  addiu $v0, $zero, 70
L800195c8:
  sh $v0, 24($s0)
L800195cc:
  sh $v0, 72($s0)
L800195d0:
  addiu $v0, $zero, 98
L800195d4:
  sh $v0, 26($s0)
L800195d8:
  jal 0x80042918
L800195dc:
  sh $v0, 74($s0)
L800195e0:
  addu $v0, $s0, $zero
L800195e4:
  lw $v1, 4($v0)
L800195e8:
  lui $a0, 0x200
L800195ec:
  or $v1, $v1, $a0
L800195f0:
  sw $v1, 4($v0)
L800195f4:
  lw $ra, 48($sp)
L800195f8:
  lw $s1, 44($sp)
L800195fc:
  lw $s0, 40($sp)
L80019600:
  jr $ra
L80019604:
  addiu $sp, $sp, 56
L80019608:
  addiu $sp, $sp, -40
L8001960c:
  lhu $v1, 818($gp)
L80019610:
  lui $v0, 0x800f
L80019614:
  sw $s3, 28($sp)
L80019618:
  lw $s3, -24848($v0)
L8001961c:
  sw $ra, 32($sp)
L80019620:
  sw $s2, 24($sp)
L80019624:
  sw $s1, 20($sp)
L80019628:
  andi $v0, $v1, 0x8000
L8001962c:
  bne $v0, $zero, L800196ac
L80019630:
  sw $s0, 16($sp)
L80019634:
  ori $v0, $v1, 0xc000
L80019638:
  sh $v0, 818($gp)
L8001963c:
  lbu $v0, 106($s3)
L80019640:
  sll $zero, $zero, 0x0
L80019644:
  sll $v1, $v0, 0x3
L80019648:
  subu $v1, $v1, $v0
L8001964c:
  sll $v1, $v1, 0x2
L80019650:
  lui $v0, 0x801a
L80019654:
  addiu $v0, $v0, 31448
L80019658:
  addu $s0, $v1, $v0
L8001965c:
  lh $a1, 12($s0)
L80019660:
  lhu $v0, 12($s0)
L80019664:
  sll $zero, $zero, 0x0
L80019668:
  sh $v0, 584($gp)
L8001966c:
  jal 0x80029164
L80019670:
  addu $a0, $zero, $zero
L80019674:
  lbu $v1, 104($s3)
L80019678:
  addiu $v0, $zero, 20
L8001967c:
  bne $v1, $v0, L8001969c
L80019680:
  sll $zero, $zero, 0x0
L80019684:
  lw $v1, 704($gp)
L80019688:
  sll $zero, $zero, 0x0
L8001968c:
  lbu $v0, 5($v1)
L80019690:
  sll $zero, $zero, 0x0
L80019694:
  addiu $v0, $v0, 1
L80019698:
  sb $v0, 5($v1)
L8001969c:
  jal 0x80024914
L800196a0:
  addu $a0, $s0, $zero
L800196a4:
  addiu $v0, $zero, 1
L800196a8:
  sb $v0, 620($gp)
L800196ac:
  lbu $a2, 620($gp)
L800196b0:
  addiu $a0, $zero, 2
L800196b4:
  andi $v1, $a2, 0xf
L800196b8:
  beq $v1, $a0, L8001986c
L800196bc:
  slti $v0, $v1, 3
L800196c0:
  beq $v0, $zero, L800196d8
L800196c4:
  addiu $v0, $zero, 1
L800196c8:
  beq $v1, $v0, L800196f4
L800196cc:
  andi $v0, $a2, 0x80
L800196d0:
  j L800199ec
L800196d4:
  sll $zero, $zero, 0x0
L800196d8:
  addiu $v0, $zero, 3
L800196dc:
  beq $v1, $v0, L80019888
L800196e0:
  addiu $v0, $zero, 4
L800196e4:
  beq $v1, $v0, L800199c4
L800196e8:
  andi $v0, $a2, 0x80
L800196ec:
  j L800199ec
L800196f0:
  sll $zero, $zero, 0x0
L800196f4:
  bne $v0, $zero, L8001978c
L800196f8:
  andi $v0, $a2, 0x40
L800196fc:
  lui $v0, 0x200
L80019700:
  ori $v0, $v0, 0x30
L80019704:
  lui $v1, 0x800a
L80019708:
  lw $v1, -20236($v1)
L8001970c:
  lui $a0, 0x800a
L80019710:
  lw $a0, -20172($a0)
L80019714:
  and $v1, $v1, $v0
L80019718:
  or $v1, $v1, $a0
L8001971c:
  bne $v1, $zero, L800199ec
L80019720:
  addu $a0, $zero, $zero
L80019724:
  addiu $a1, $zero, -1
L80019728:
  ori $v1, $a2, 0x80
L8001972c:
  lhu $v0, 8($s3)
L80019730:
  addu $a2, $a1, $zero
L80019734:
  sb $v1, 620($gp)
L80019738:
  ori $v0, $v0, 0x4
L8001973c:
  jal 0x800291e0
L80019740:
  sh $v0, 8($s3)
L80019744:
  addu $s3, $v0, $zero
L80019748:
  addu $a0, $s3, $zero
L8001974c:
  addiu $a1, $zero, -10
L80019750:
  addiu $v0, $zero, 90
L80019754:
  sh $v0, 48($s3)
L80019758:
  addiu $v0, $zero, 22
L8001975c:
  sh $v0, 50($s3)
L80019760:
  addiu $v0, $zero, 192
L80019764:
  jal 0x800428ec
L80019768:
  sb $v0, 33($s3)
L8001976c:
  lhu $v0, 8($s3)
L80019770:
  sll $zero, $zero, 0x0
L80019774:
  ori $v0, $v0, 0x4
L80019778:
  andi $v0, $v0, 0xffbf
L8001977c:
  sh $v0, 8($s3)
L80019780:
  lui $v0, 0x800f
L80019784:
  j L800199ec
L80019788:
  sw $s3, -24844($v0)
L8001978c:
  bne $v0, $zero, L800197f0
L80019790:
  lui $v0, 0x800f
L80019794:
  lbu $v0, 33($s3)
L80019798:
  sll $zero, $zero, 0x0
L8001979c:
  addiu $v0, $v0, 6
L800197a0:
  sb $v0, 33($s3)
L800197a4:
  andi $v0, $v0, 0xff
L800197a8:
  sltiu $v0, $v0, 64
L800197ac:
  bne $v0, $zero, L800199ec
L800197b0:
  sll $zero, $zero, 0x0
L800197b4:
  lbu $v0, 620($gp)
L800197b8:
  sll $zero, $zero, 0x0
L800197bc:
  ori $v0, $v0, 0x40
L800197c0:
  sb $v0, 620($gp)
L800197c4:
  jal 0x8004036c
L800197c8:
  addu $a0, $s3, $zero
L800197cc:
  lui $v1, 0x800f
L800197d0:
  addiu $v0, $v1, -24848
L800197d4:
  lw $a0, 4($v0)
L800197d8:
  sw $zero, -24848($v1)
L800197dc:
  lhu $v0, 8($a0)
L800197e0:
  sll $zero, $zero, 0x0
L800197e4:
  ori $v0, $v0, 0x40
L800197e8:
  j L800199ec
L800197ec:
  sh $v0, 8($a0)
L800197f0:
  lw $s3, -24844($v0)
L800197f4:
  andi $v0, $a2, 0x20
L800197f8:
  bne $v0, $zero, L80019844
L800197fc:
  sll $zero, $zero, 0x0
L80019800:
  lbu $v0, 33($s3)
L80019804:
  sll $zero, $zero, 0x0
L80019808:
  addiu $v0, $v0, 6
L8001980c:
  sb $v0, 33($s3)
L80019810:
  sll $v0, $v0, 0x18
L80019814:
  bltz $v0, L800199ec
L80019818:
  addiu $v0, $zero, 30
L8001981c:
  sh $v0, 96($s3)
L80019820:
  lhu $v0, 8($s3)
L80019824:
  sb $zero, 33($s3)
L80019828:
  lbu $v1, 620($gp)
L8001982c:
  andi $v0, $v0, 0xfffb
L80019830:
  ori $v1, $v1, 0x20
L80019834:
  sh $v0, 8($s3)
L80019838:
  sb $v1, 620($gp)
L8001983c:
  j L800199ec
L80019840:
  sll $zero, $zero, 0x0
L80019844:
  lhu $v0, 96($s3)
L80019848:
  sll $zero, $zero, 0x0
L8001984c:
  addiu $v0, $v0, -1
L80019850:
  sh $v0, 96($s3)
L80019854:
  sll $v0, $v0, 0x10
L80019858:
  bgtz $v0, L800199ec
L8001985c:
  sll $zero, $zero, 0x0
L80019860:
  sb $a0, 620($gp)
L80019864:
  j L800199ec
L80019868:
  sll $zero, $zero, 0x0
L8001986c:
  lh $a0, 584($gp)
L80019870:
  jal 0x80026ba4
L80019874:
  addu $a1, $zero, $zero
L80019878:
  addiu $v0, $zero, 3
L8001987c:
  sb $v0, 620($gp)
L80019880:
  j L800199ec
L80019884:
  sll $zero, $zero, 0x0
L80019888:
  andi $v0, $a2, 0x80
L8001988c:
  bne $v0, $zero, L80019934
L80019890:
  lui $s2, 0xf7ff
L80019894:
  lui $s0, 0x800f
L80019898:
  addiu $s1, $s0, -24848
L8001989c:
  lw $s3, 4($s1)
L800198a0:
  ori $v0, $a2, 0x80
L800198a4:
  sb $v0, 620($gp)
L800198a8:
  jal L8001944c
L800198ac:
  addu $a0, $s3, $zero
L800198b0:
  jal L80019564
L800198b4:
  addu $a0, $s3, $zero
L800198b8:
  sw $v0, -24848($s0)
L800198bc:
  lw $v1, 4($v0)
L800198c0:
  lui $a0, 0x5000
L800198c4:
  or $v1, $v1, $a0
L800198c8:
  sw $v1, 4($v0)
L800198cc:
  lw $v1, -24848($s0)
L800198d0:
  ori $s2, $s2, 0xffff
L800198d4:
  lw $v0, 4($v1)
L800198d8:
  addu $a0, $s3, $zero
L800198dc:
  and $v0, $v0, $s2
L800198e0:
  jal L80019564
L800198e4:
  sw $v0, 4($v1)
L800198e8:
  addu $a0, $v0, $zero
L800198ec:
  addiu $a1, $zero, -1
L800198f0:
  jal 0x800428ec
L800198f4:
  sw $a0, 4($s1)
L800198f8:
  lw $a0, 4($s1)
L800198fc:
  sll $zero, $zero, 0x0
L80019900:
  lw $v0, 4($a0)
L80019904:
  lui $v1, 0x6000
L80019908:
  or $v0, $v0, $v1
L8001990c:
  sw $v0, 4($a0)
L80019910:
  lw $v1, 4($s1)
L80019914:
  sll $zero, $zero, 0x0
L80019918:
  lw $v0, 4($v1)
L8001991c:
  addu $a0, $zero, $zero
L80019920:
  and $v0, $v0, $s2
L80019924:
  jal 0x80029528
L80019928:
  sw $v0, 4($v1)
L8001992c:
  j L800199ec
L80019930:
  sll $zero, $zero, 0x0
L80019934:
  lui $a2, 0x800f
L80019938:
  lw $v0, -24848($a2)
L8001993c:
  addiu $s0, $a2, -24848
L80019940:
  lh $v1, 68($v0)
L80019944:
  lw $a0, 4($s0)
L80019948:
  addiu $a1, $v1, 128
L8001994c:
  sh $a1, 70($a0)
L80019950:
  sh $a1, 68($a0)
L80019954:
  sh $a1, 70($v0)
L80019958:
  sh $a1, 68($v0)
L8001995c:
  lw $a0, -24848($a2)
L80019960:
  sll $zero, $zero, 0x0
L80019964:
  lbu $a1, 12($a0)
L80019968:
  sll $zero, $zero, 0x0
L8001996c:
  addiu $a1, $a1, -4
L80019970:
  bgez $a1, L80019980
L80019974:
  sll $v0, $a1, 0x10
L80019978:
  addu $a1, $zero, $zero
L8001997c:
  sll $v0, $a1, 0x10
L80019980:
  sll $v1, $a1, 0x8
L80019984:
  or $v0, $v0, $v1
L80019988:
  or $a1, $a1, $v0
L8001998c:
  sw $a1, 12($a0)
L80019990:
  lw $v0, 4($s0)
L80019994:
  bne $a1, $zero, L800199ec
L80019998:
  sw $a1, 12($v0)
L8001999c:
  lw $a0, -24848($a2)
L800199a0:
  jal 0x8004036c
L800199a4:
  sll $zero, $zero, 0x0
L800199a8:
  lw $a0, 4($s0)
L800199ac:
  jal 0x8004036c
L800199b0:
  sll $zero, $zero, 0x0
L800199b4:
  addiu $v0, $zero, 4
L800199b8:
  sb $v0, 620($gp)
L800199bc:
  j L800199ec
L800199c0:
  sll $zero, $zero, 0x0
L800199c4:
  bne $v0, $zero, L800199e8
L800199c8:
  addiu $v0, $zero, 5
L800199cc:
  lh $a0, 584($gp)
L800199d0:
  ori $v0, $a2, 0x80
L800199d4:
  sb $v0, 620($gp)
L800199d8:
  jal 0x80026ba4
L800199dc:
  addiu $a1, $zero, 1
L800199e0:
  j L800199ec
L800199e4:
  sll $zero, $zero, 0x0
L800199e8:
  sh $v0, 818($gp)
L800199ec:
  lw $ra, 32($sp)
L800199f0:
  lw $s3, 28($sp)
L800199f4:
  lw $s2, 24($sp)
L800199f8:
  lw $s1, 20($sp)
L800199fc:
  lw $s0, 16($sp)
L80019a00:
  jr $ra
L80019a04:
  addiu $sp, $sp, 40
L80019a08:
  lui $v0, 0x8018
L80019a0c:
  addiu $v1, $v0, -24104
L80019a10:
  lhu $v0, 0($v1)
L80019a14:
  sll $zero, $zero, 0x0
L80019a18:
  beq $v0, $zero, L80019a44
L80019a1c:
  sll $zero, $zero, 0x0
L80019a20:
  lhu $a2, 2($v1)
L80019a24:
  bne $v0, $a0, L80019a4c
L80019a28:
  addiu $v1, $v1, 4
L80019a2c:
  lhu $v0, 0($v1)
L80019a30:
  sll $zero, $zero, 0x0
L80019a34:
  beq $a1, $v0, L80019a58
L80019a38:
  addiu $a2, $a2, -1
L80019a3c:
  bne $a2, $zero, L80019a2c
L80019a40:
  addiu $v1, $v1, 2
L80019a44:
  jr $ra
L80019a48:
  addu $v0, $zero, $zero
L80019a4c:
  sll $v0, $a2, 0x1
L80019a50:
  j L80019a10
L80019a54:
  addu $v1, $v1, $v0
L80019a58:
  jr $ra
L80019a5c:
  addu $v0, $a1, $zero
L80019a60:
  lui $v0, 0x8018
L80019a64:
  addiu $v1, $v0, -15656
L80019a68:
  slt $v0, $a1, $a0
L80019a6c:
  beq $v0, $zero, L80019a7c
L80019a70:
  addu $v0, $a1, $zero
L80019a74:
  addu $a1, $a0, $zero
L80019a78:
  addu $a0, $v0, $zero
L80019a7c:
  sll $v0, $a0, 0x1
L80019a80:
  addu $v0, $v0, $v1
L80019a84:
  lhu $v0, 0($v0)
L80019a88:
  sll $zero, $zero, 0x0
L80019a8c:
  bne $v0, $zero, L80019aac
L80019a90:
  addu $a0, $v0, $v1
L80019a94:
  jr $ra
L80019a98:
  addu $v0, $zero, $zero
L80019a9c:
  lbu $v1, 2($a0)
L80019aa0:
  andi $v0, $v0, 0x300
L80019aa4:
  jr $ra
L80019aa8:
  or $v0, $v0, $v1
L80019aac:
  lbu $t0, 0($a0)
L80019ab0:
  sll $zero, $zero, 0x0
L80019ab4:
  bne $t0, $zero, L80019ac8
L80019ab8:
  addiu $v0, $zero, 511
L80019abc:
  lbu $v1, 1($a0)
L80019ac0:
  addiu $a0, $a0, 1
L80019ac4:
  subu $t0, $v0, $v1
L80019ac8:
  addiu $a0, $a0, 1
L80019acc:
  addiu $a3, $a0, 3
L80019ad0:
  lbu $a2, 0($a0)
L80019ad4:
  lbu $v1, -2($a3)
L80019ad8:
  sll $v0, $a2, 0x8
L80019adc:
  andi $v0, $v0, 0x300
L80019ae0:
  or $v0, $v0, $v1
L80019ae4:
  beq $v0, $a1, L80019a9c
L80019ae8:
  sll $v0, $a2, 0x6
L80019aec:
  sll $v0, $a2, 0x4
L80019af0:
  lbu $v1, 0($a3)
L80019af4:
  andi $v0, $v0, 0x300
L80019af8:
  or $v0, $v0, $v1
L80019afc:
  beq $v0, $a1, L80019b18
L80019b00:
  addiu $a3, $a3, 5
L80019b04:
  addiu $t0, $t0, -2
L80019b08:
  bgtz $t0, L80019ad0
L80019b0c:
  addiu $a0, $a0, 5
L80019b10:
  jr $ra
L80019b14:
  addu $v0, $zero, $zero
L80019b18:
  sll $v0, $a2, 0x2
L80019b1c:
  lbu $v1, 4($a0)
L80019b20:
  andi $v0, $v0, 0x300
L80019b24:
  jr $ra
L80019b28:
  or $v0, $v0, $v1
L80019b2c:
  addu $a1, $a0, $zero
L80019b30:
  lbu $v0, 33($a1)
L80019b34:
  lbu $v1, 42($a1)
L80019b38:
  lh $a0, 42($a1)
L80019b3c:
  addu $v1, $v0, $v1
L80019b40:
  bltz $a0, L80019b54
L80019b44:
  sb $v1, 33($a1)
L80019b48:
  lbu $v0, 40($a1)
L80019b4c:
  j L80019b60
L80019b50:
  subu $v0, $v0, $v1
L80019b54:
  lbu $v0, 40($a1)
L80019b58:
  sll $zero, $zero, 0x0
L80019b5c:
  subu $v0, $v1, $v0
L80019b60:
  sll $v0, $v0, 0x18
L80019b64:
  bgez $v0, L80019b98
L80019b68:
  sll $zero, $zero, 0x0
L80019b6c:
  lbu $v0, 40($a1)
L80019b70:
  sb $zero, 108($a1)
L80019b74:
  sw $zero, 36($a1)
L80019b78:
  sb $v0, 33($a1)
L80019b7c:
  andi $v0, $v0, 0xff
L80019b80:
  bne $v0, $zero, L80019b98
L80019b84:
  sll $zero, $zero, 0x0
L80019b88:
  lhu $v0, 8($a1)
L80019b8c:
  sll $zero, $zero, 0x0
L80019b90:
  andi $v0, $v0, 0xfffb
L80019b94:
  sh $v0, 8($a1)
L80019b98:
  jr $ra
L80019b9c:
  sll $zero, $zero, 0x0
L80019ba0:
  addiu $v0, $zero, 1
L80019ba4:
  sb $v0, 108($a0)
L80019ba8:
  lui $v0, 0x8002
L80019bac:
  lhu $v1, 8($a0)
L80019bb0:
  addiu $v0, $v0, -25812
L80019bb4:
  sb $a1, 33($a0)
L80019bb8:
  sh $a2, 40($a0)
L80019bbc:
  sh $a3, 42($a0)
L80019bc0:
  sw $v0, 36($a0)
L80019bc4:
  ori $v1, $v1, 0x4
L80019bc8:
  jr $ra
L80019bcc:
  sh $v1, 8($a0)
L80019bd0:
  addiu $sp, $sp, -24
L80019bd4:
  sw $s0, 16($sp)
L80019bd8:
  sw $ra, 20($sp)
L80019bdc:
  jal 0x80042b98
L80019be0:
  addu $s0, $a0, $zero
L80019be4:
  bne $v0, $zero, L80019c0c
L80019be8:
  addiu $v0, $zero, 64
L80019bec:
  sh $v0, 46($s0)
L80019bf0:
  lhu $v0, 8($s0)
L80019bf4:
  lbu $v1, 33($s0)
L80019bf8:
  ori $v0, $v0, 0x4
L80019bfc:
  beq $v1, $zero, L80019c0c
L80019c00:
  sh $v0, 8($s0)
L80019c04:
  addiu $v0, $zero, 192
L80019c08:
  sh $v0, 46($s0)
L80019c0c:
  lbu $v0, 33($s0)
L80019c10:
  lbu $a0, 108($s0)
L80019c14:
  addiu $v1, $v0, 8
L80019c18:
  andi $v0, $a0, 0x40
L80019c1c:
  beq $v0, $zero, L80019c90
L80019c20:
  sb $v1, 33($s0)
L80019c24:
  sll $v0, $v1, 0x18
L80019c28:
  bltz $v0, L80019cb8
L80019c2c:
  lui $v1, 0x801a
L80019c30:
  lbu $a0, 106($s0)
L80019c34:
  addiu $v1, $v1, 31448
L80019c38:
  sb $zero, 33($s0)
L80019c3c:
  sll $v0, $a0, 0x3
L80019c40:
  subu $v0, $v0, $a0
L80019c44:
  sll $v0, $v0, 0x2
L80019c48:
  addu $v0, $v0, $v1
L80019c4c:
  lhu $v1, 22($v0)
L80019c50:
  sll $zero, $zero, 0x0
L80019c54:
  andi $v1, $v1, 0xdfff
L80019c58:
  sh $v1, 22($v0)
L80019c5c:
  lbu $v0, 34($s0)
L80019c60:
  lbu $v1, 32($s0)
L80019c64:
  sll $zero, $zero, 0x0
L80019c68:
  or $v0, $v0, $v1
L80019c6c:
  bne $v0, $zero, L80019c84
L80019c70:
  sll $zero, $zero, 0x0
L80019c74:
  lhu $v0, 8($s0)
L80019c78:
  sll $zero, $zero, 0x0
L80019c7c:
  andi $v0, $v0, 0xfffb
L80019c80:
  sh $v0, 8($s0)
L80019c84:
  sb $zero, 108($s0)
L80019c88:
  j L80019cb8
L80019c8c:
  sw $zero, 36($s0)
L80019c90:
  lbu $v0, 33($s0)
L80019c94:
  lh $v1, 46($s0)
L80019c98:
  sll $zero, $zero, 0x0
L80019c9c:
  slt $v0, $v0, $v1
L80019ca0:
  bne $v0, $zero, L80019cb8
L80019ca4:
  ori $v0, $a0, 0x40
L80019ca8:
  sb $v0, 108($s0)
L80019cac:
  addiu $v0, $zero, 192
L80019cb0:
  sb $v0, 33($s0)
L80019cb4:
  sb $zero, 103($s0)
L80019cb8:
  lw $ra, 20($sp)
L80019cbc:
  lw $s0, 16($sp)
L80019cc0:
  jr $ra
L80019cc4:
  addiu $sp, $sp, 24
L80019cc8:
  lbu $v0, 717($gp)
L80019ccc:
  addiu $sp, $sp, -24
L80019cd0:
  bne $v0, $zero, L80019d08
L80019cd4:
  sw $ra, 16($sp)
L80019cd8:
  lui $v0, 0x800a
L80019cdc:
  lb $v0, -19616($v0)
L80019ce0:
  sll $zero, $zero, 0x0
L80019ce4:
  bgez $v0, L80019d08
L80019ce8:
  sll $zero, $zero, 0x0
L80019cec:
  lui $v0, 0x800a
L80019cf0:
  lb $v0, -19615($v0)
L80019cf4:
  sll $zero, $zero, 0x0
L80019cf8:
  bltz $v0, L80019d08
L80019cfc:
  sll $zero, $zero, 0x0
L80019d00:
  jal 0x8002cce4
L80019d04:
  addiu $a0, $a0, 288
L80019d08:
  lw $ra, 16($sp)
L80019d0c:
  sll $zero, $zero, 0x0
L80019d10:
  jr $ra
L80019d14:
  addiu $sp, $sp, 24
L80019d18:
  lbu $v0, 717($gp)
L80019d1c:
  lhu $a0, 818($gp)
L80019d20:
  addiu $sp, $sp, -48
L80019d24:
  sw $ra, 44($sp)
L80019d28:
  sw $s6, 40($sp)
L80019d2c:
  sw $s5, 36($sp)
L80019d30:
  sw $s4, 32($sp)
L80019d34:
  sw $s3, 28($sp)
L80019d38:
  sw $s2, 24($sp)
L80019d3c:
  sw $s1, 20($sp)
L80019d40:
  sll $v1, $v0, 0x3
L80019d44:
  subu $v1, $v1, $v0
L80019d48:
  sll $v1, $v1, 0x4
L80019d4c:
  lui $v0, 0x800f
L80019d50:
  addiu $v0, $v0, -24816
L80019d54:
  addu $s5, $v1, $v0
L80019d58:
  andi $v0, $a0, 0x8000
L80019d5c:
  bne $v0, $zero, L80019f34
L80019d60:
  sw $s0, 16($sp)
L80019d64:
  addiu $s3, $zero, 260
L80019d68:
  addiu $s0, $zero, 4
L80019d6c:
  addiu $s2, $zero, 5
L80019d70:
  addiu $s6, $zero, 82
L80019d74:
  lui $v0, 0x800f
L80019d78:
  addiu $v0, $v0, -24848
L80019d7c:
  addiu $s4, $v0, 20
L80019d80:
  ori $v0, $a0, 0x8000
L80019d84:
  sh $v0, 818($gp)
L80019d88:
  sw $s5, 684($gp)
L80019d8c:
  sb $zero, 784($gp)
L80019d90:
  sb $zero, 689($gp)
L80019d94:
  sh $zero, 588($gp)
L80019d98:
  lw $s1, 0($s4)
L80019d9c:
  sll $zero, $zero, 0x0
L80019da0:
  beq $s1, $zero, L80019dc4
L80019da4:
  addu $a0, $s1, $zero
L80019da8:
  sll $a1, $s0, 0x18
L80019dac:
  sra $a1, $a1, 0x18
L80019db0:
  sh $s3, 40($a0)
L80019db4:
  jal 0x800428ec
L80019db8:
  sh $s6, 42($a0)
L80019dbc:
  addiu $s3, $s3, -16
L80019dc0:
  addiu $s0, $s0, 1
L80019dc4:
  addiu $s2, $s2, -1
L80019dc8:
  bgtz $s2, L80019d98
L80019dcc:
  addiu $s4, $s4, -4
L80019dd0:
  lui $s2, 0x800f
L80019dd4:
  sll $a1, $s0, 0x18
L80019dd8:
  sra $a1, $a1, 0x18
L80019ddc:
  lw $s1, -24848($s2)
L80019de0:
  addiu $v0, $zero, 64
L80019de4:
  addu $a0, $s1, $zero
L80019de8:
  sh $v0, 40($s1)
L80019dec:
  addiu $v0, $zero, 82
L80019df0:
  jal 0x800428ec
L80019df4:
  sh $v0, 42($s1)
L80019df8:
  lbu $v1, 106($s1)
L80019dfc:
  lui $v0, 0x8888
L80019e00:
  ori $v0, $v0, 0x8889
L80019e04:
  multu $v1, $v0
L80019e08:
  mfhi $t1
L80019e0c:
  srl $a0, $t1, 0x3
L80019e10:
  sll $v0, $a0, 0x4
L80019e14:
  subu $v0, $v0, $a0
L80019e18:
  subu $v1, $v1, $v0
L80019e1c:
  andi $v1, $v1, 0xff
L80019e20:
  sltiu $v1, $v1, 5
L80019e24:
  beq $v1, $zero, L80019e34
L80019e28:
  addiu $s0, $s2, -24848
L80019e2c:
  addiu $v0, $zero, 1
L80019e30:
  sb $v0, 784($gp)
L80019e34:
  lw $v0, 4($s0)
L80019e38:
  sll $zero, $zero, 0x0
L80019e3c:
  bne $v0, $zero, L80019eb8
L80019e40:
  sll $zero, $zero, 0x0
L80019e44:
  lw $v0, -24848($s2)
L80019e48:
  sll $zero, $zero, 0x0
L80019e4c:
  lbu $v0, 104($v0)
L80019e50:
  sll $zero, $zero, 0x0
L80019e54:
  sltiu $v0, $v0, 20
L80019e58:
  beq $v0, $zero, L80019e64
L80019e5c:
  addiu $v0, $zero, 1
L80019e60:
  sb $v0, 784($gp)
L80019e64:
  lui $a1, 0x4
L80019e68:
  ori $a1, $a1, 0x8000
L80019e6c:
  lui $v1, 0x8016
L80019e70:
  lbu $a0, 106($s1)
L80019e74:
  addiu $v1, $v1, -15324
L80019e78:
  sll $v0, $a0, 0x3
L80019e7c:
  subu $v0, $v0, $a0
L80019e80:
  sll $v0, $v0, 0x2
L80019e84:
  addu $v0, $v0, $v1
L80019e88:
  addu $v0, $v0, $a1
L80019e8c:
  lhu $a0, 14016($v0)
L80019e90:
  addiu $v0, $zero, 134
L80019e94:
  sh $v0, 40($s1)
L80019e98:
  lhu $v0, 818($gp)
L80019e9c:
  addiu $v1, $zero, 42
L80019ea0:
  sh $v1, 42($s1)
L80019ea4:
  ori $v0, $v0, 0x4000
L80019ea8:
  sh $v0, 818($gp)
L80019eac:
  sh $a0, 584($gp)
L80019eb0:
  j L80019ed4
L80019eb4:
  addu $s2, $zero, $zero
L80019eb8:
  lw $v1, 704($gp)
L80019ebc:
  sll $zero, $zero, 0x0
L80019ec0:
  lbu $v0, 7($v1)
L80019ec4:
  sll $zero, $zero, 0x0
L80019ec8:
  addiu $v0, $v0, 1
L80019ecc:
  sb $v0, 7($v1)
L80019ed0:
  addu $s2, $zero, $zero
L80019ed4:
  lui $v0, 0x800f
L80019ed8:
  addiu $s0, $v0, -24528
L80019edc:
  lbu $v0, 9($s0)
L80019ee0:
  sll $zero, $zero, 0x0
L80019ee4:
  beq $v0, $zero, L80019efc
L80019ee8:
  sll $zero, $zero, 0x0
L80019eec:
  lw $a0, 4($s0)
L80019ef0:
  jal 0x8004036c
L80019ef4:
  sw $zero, 0($s0)
L80019ef8:
  sw $zero, 4($s0)
L80019efc:
  addiu $s2, $s2, 1
L80019f00:
  slti $v0, $s2, 5
L80019f04:
  bne $v0, $zero, L80019edc
L80019f08:
  addiu $s0, $s0, 12
L80019f0c:
  lw $a0, 4($s5)
L80019f10:
  jal 0x8004036c
L80019f14:
  sll $zero, $zero, 0x0
L80019f18:
  addiu $v0, $zero, 8
L80019f1c:
  sh $v0, 602($gp)
L80019f20:
  addiu $v0, $zero, 1
L80019f24:
  sw $zero, 4($s5)
L80019f28:
  sb $v0, 620($gp)
L80019f2c:
  j L8001b0a4
L80019f30:
  sll $zero, $zero, 0x0
L80019f34:
  lbu $v0, 620($gp)
L80019f38:
  sll $zero, $zero, 0x0
L80019f3c:
  andi $v0, $v0, 0xf
L80019f40:
  addiu $v1, $v0, -1
L80019f44:
  sltiu $v0, $v1, 8
L80019f48:
  beq $v0, $zero, L8001b0a4
L80019f4c:
  lui $v0, 0x8001
L80019f50:
  addiu $v0, $v0, 248
L80019f54:
  sll $v1, $v1, 0x2
L80019f58:
  addu $v1, $v1, $v0
L80019f5c:
  lw $v0, 0($v1)
L80019f60:
  sll $zero, $zero, 0x0
L80019f64:
  jr $v0
L80019f68:
  sll $zero, $zero, 0x0
L80019f6c:
  lbu $v1, 620($gp)
L80019f70:
  sll $zero, $zero, 0x0
L80019f74:
  andi $v0, $v1, 0x80
L80019f78:
  bne $v0, $zero, L8001a00c
L80019f7c:
  ori $v1, $v1, 0x80
L80019f80:
  lhu $v0, 818($gp)
L80019f84:
  sb $v1, 620($gp)
L80019f88:
  andi $v0, $v0, 0x4000
L80019f8c:
  bne $v0, $zero, L8001b0a4
L80019f90:
  addiu $s2, $zero, 5
L80019f94:
  lui $v0, 0x801a
L80019f98:
  addiu $a3, $v0, 31448
L80019f9c:
  addiu $a2, $zero, 1
L80019fa0:
  lui $v0, 0x8002
L80019fa4:
  addiu $a1, $v0, -25648
L80019fa8:
  lui $v0, 0x800f
L80019fac:
  addiu $v0, $v0, -24848
L80019fb0:
  addiu $a0, $v0, 20
L80019fb4:
  lw $s1, 0($a0)
L80019fb8:
  sll $zero, $zero, 0x0
L80019fbc:
  beq $s1, $zero, L80019ff8
L80019fc0:
  sll $zero, $zero, 0x0
L80019fc4:
  lbu $v0, 106($s1)
L80019fc8:
  sll $zero, $zero, 0x0
L80019fcc:
  sll $v1, $v0, 0x3
L80019fd0:
  subu $v1, $v1, $v0
L80019fd4:
  sll $v1, $v1, 0x2
L80019fd8:
  addu $v1, $v1, $a3
L80019fdc:
  lhu $v0, 22($v1)
L80019fe0:
  sll $zero, $zero, 0x0
L80019fe4:
  andi $v0, $v0, 0x2000
L80019fe8:
  beq $v0, $zero, L80019ff8
L80019fec:
  sll $zero, $zero, 0x0
L80019ff0:
  sb $a2, 108($s1)
L80019ff4:
  sw $a1, 36($s1)
L80019ff8:
  addiu $s2, $s2, -1
L80019ffc:
  bgez $s2, L80019fb4
L8001a000:
  addiu $a0, $a0, -4
L8001a004:
  j L8001b0a4
L8001a008:
  sll $zero, $zero, 0x0
L8001a00c:
  jal 0x80042b40
L8001a010:
  addiu $a0, $zero, 1
L8001a014:
  bne $v0, $zero, L8001b0a4
L8001a018:
  addiu $v0, $zero, 2
L8001a01c:
  sb $v0, 620($gp)
L8001a020:
  lbu $v1, 620($gp)
L8001a024:
  sll $zero, $zero, 0x0
L8001a028:
  andi $v0, $v1, 0x80
L8001a02c:
  bne $v0, $zero, L8001a07c
L8001a030:
  addu $s0, $zero, $zero
L8001a034:
  ori $v0, $v1, 0x80
L8001a038:
  sb $v0, 620($gp)
L8001a03c:
  addiu $s2, $zero, 5
L8001a040:
  addiu $s3, $zero, 1
L8001a044:
  lui $v0, 0x800f
L8001a048:
  addiu $v0, $v0, -24848
L8001a04c:
  addiu $s0, $v0, 20
L8001a050:
  lw $s1, 0($s0)
L8001a054:
  sll $zero, $zero, 0x0
L8001a058:
  beq $s1, $zero, L8001a06c
L8001a05c:
  addu $a0, $s1, $zero
L8001a060:
  jal 0x80043178
L8001a064:
  sb $s3, 108($s1)
L8001a068:
  sh $zero, 96($s1)
L8001a06c:
  addiu $s2, $s2, -1
L8001a070:
  bgez $s2, L8001a050
L8001a074:
  addiu $s0, $s0, -4
L8001a078:
  addu $s0, $zero, $zero
L8001a07c:
  addiu $s2, $zero, 5
L8001a080:
  lui $v0, 0x800f
L8001a084:
  addiu $v0, $v0, -24848
L8001a088:
  addiu $s3, $v0, 20
L8001a08c:
  lw $s1, 0($s3)
L8001a090:
  sll $zero, $zero, 0x0
L8001a094:
  beq $s1, $zero, L8001a170
L8001a098:
  sll $zero, $zero, 0x0
L8001a09c:
  lbu $v0, 108($s1)
L8001a0a0:
  sll $zero, $zero, 0x0
L8001a0a4:
  beq $v0, $zero, L8001a170
L8001a0a8:
  sll $zero, $zero, 0x0
L8001a0ac:
  lhu $v0, 818($gp)
L8001a0b0:
  sll $zero, $zero, 0x0
L8001a0b4:
  andi $v0, $v0, 0x4000
L8001a0b8:
  bne $v0, $zero, L8001a0d4
L8001a0bc:
  addiu $s0, $zero, 1
L8001a0c0:
  lbu $v0, 33($s1)
L8001a0c4:
  sll $zero, $zero, 0x0
L8001a0c8:
  beq $v0, $zero, L8001a0d4
L8001a0cc:
  addiu $v0, $v0, 8
L8001a0d0:
  sb $v0, 33($s1)
L8001a0d4:
  lbu $v0, 34($s1)
L8001a0d8:
  sll $zero, $zero, 0x0
L8001a0dc:
  beq $v0, $zero, L8001a0e8
L8001a0e0:
  addiu $v0, $v0, 8
L8001a0e4:
  sb $v0, 34($s1)
L8001a0e8:
  lh $a1, 40($s1)
L8001a0ec:
  lh $a2, 42($s1)
L8001a0f0:
  lh $a3, 96($s1)
L8001a0f4:
  jal 0x8004318c
L8001a0f8:
  addu $a0, $s1, $zero
L8001a0fc:
  lhu $v0, 96($s1)
L8001a100:
  sll $zero, $zero, 0x0
L8001a104:
  addiu $v0, $v0, 128
L8001a108:
  sh $v0, 96($s1)
L8001a10c:
  sll $v0, $v0, 0x10
L8001a110:
  sra $v0, $v0, 0x10
L8001a114:
  slti $v0, $v0, 2048
L8001a118:
  bne $v0, $zero, L8001a170
L8001a11c:
  sll $zero, $zero, 0x0
L8001a120:
  sb $zero, 108($s1)
L8001a124:
  sb $zero, 34($s1)
L8001a128:
  lhu $v0, 818($gp)
L8001a12c:
  sll $zero, $zero, 0x0
L8001a130:
  andi $v0, $v0, 0x4000
L8001a134:
  bne $v0, $zero, L8001a140
L8001a138:
  sll $zero, $zero, 0x0
L8001a13c:
  sb $zero, 33($s1)
L8001a140:
  lbu $v0, 33($s1)
L8001a144:
  sll $zero, $zero, 0x0
L8001a148:
  bne $v0, $zero, L8001a160
L8001a14c:
  sll $zero, $zero, 0x0
L8001a150:
  lhu $v0, 8($s1)
L8001a154:
  sll $zero, $zero, 0x0
L8001a158:
  andi $v0, $v0, 0xfffb
L8001a15c:
  sh $v0, 8($s1)
L8001a160:
  lhu $v0, 40($s1)
L8001a164:
  lhu $v1, 42($s1)
L8001a168:
  sh $v0, 48($s1)
L8001a16c:
  sh $v1, 50($s1)
L8001a170:
  addiu $s2, $s2, -1
L8001a174:
  bgez $s2, L8001a08c
L8001a178:
  addiu $s3, $s3, -4
L8001a17c:
  lhu $v0, 602($gp)
L8001a180:
  sll $zero, $zero, 0x0
L8001a184:
  or $v0, $v0, $s0
L8001a188:
  bne $v0, $zero, L8001b0a4
L8001a18c:
  sll $zero, $zero, 0x0
L8001a190:
  lhu $v0, 818($gp)
L8001a194:
  addiu $v1, $zero, 3
L8001a198:
  sb $v1, 620($gp)
L8001a19c:
  andi $v0, $v0, 0x4000
L8001a1a0:
  beq $v0, $zero, L8001b0a4
L8001a1a4:
  addiu $v0, $zero, 8
L8001a1a8:
  j L8001b0a0
L8001a1ac:
  sll $zero, $zero, 0x0
L8001a1b0:
  lbu $v1, 620($gp)
L8001a1b4:
  sll $zero, $zero, 0x0
L8001a1b8:
  andi $v0, $v1, 0x80
L8001a1bc:
  bne $v0, $zero, L8001a3d0
L8001a1c0:
  lui $s0, 0x800f
L8001a1c4:
  lbu $v0, 689($gp)
L8001a1c8:
  ori $v1, $v1, 0x80
L8001a1cc:
  sb $v1, 620($gp)
L8001a1d0:
  addiu $v0, $v0, 1
L8001a1d4:
  sb $v0, 689($gp)
L8001a1d8:
  sll $v0, $v0, 0x18
L8001a1dc:
  sra $v1, $v0, 0x18
L8001a1e0:
  slti $v0, $v1, 6
L8001a1e4:
  beq $v0, $zero, L8001a208
L8001a1e8:
  lui $s3, 0x800f
L8001a1ec:
  addiu $a1, $s3, -24848
L8001a1f0:
  sll $v0, $v1, 0x2
L8001a1f4:
  addu $v0, $v0, $a1
L8001a1f8:
  lw $v0, 0($v0)
L8001a1fc:
  sll $zero, $zero, 0x0
L8001a200:
  bne $v0, $zero, L8001a218
L8001a204:
  addu $s1, $v0, $zero
L8001a208:
  addiu $v0, $zero, 8
L8001a20c:
  sb $v0, 620($gp)
L8001a210:
  j L8001b0a4
L8001a214:
  sll $zero, $zero, 0x0
L8001a218:
  addu $a0, $s1, $zero
L8001a21c:
  jal 0x800429d8
L8001a220:
  sw $s1, 4($a1)
L8001a224:
  lh $v1, 48($s1)
L8001a228:
  addiu $v0, $zero, 8
L8001a22c:
  sh $v0, 96($s1)
L8001a230:
  addiu $v0, $zero, 64
L8001a234:
  subu $v0, $v0, $v1
L8001a238:
  sll $v0, $v0, 0x8
L8001a23c:
  bgez $v0, L8001a248
L8001a240:
  sll $zero, $zero, 0x0
L8001a244:
  addiu $v0, $v0, 7
L8001a248:
  lh $v1, 50($s1)
L8001a24c:
  sra $v0, $v0, 0x3
L8001a250:
  sh $v0, 54($s1)
L8001a254:
  addiu $v0, $zero, 82
L8001a258:
  subu $v0, $v0, $v1
L8001a25c:
  sll $v0, $v0, 0x8
L8001a260:
  bgez $v0, L8001a26c
L8001a264:
  sll $zero, $zero, 0x0
L8001a268:
  addiu $v0, $v0, 7
L8001a26c:
  lbu $a1, 22($s1)
L8001a270:
  sra $v0, $v0, 0x3
L8001a274:
  sh $v0, 56($s1)
L8001a278:
  lw $a0, -24848($s3)
L8001a27c:
  addiu $a1, $a1, -1
L8001a280:
  sll $a1, $a1, 0x18
L8001a284:
  jal 0x800428ec
L8001a288:
  sra $a1, $a1, 0x18
L8001a28c:
  jal 0x8003fee0
L8001a290:
  addiu $a0, $zero, 10
L8001a294:
  lw $v1, -24848($s3)
L8001a298:
  sh $zero, 584($gp)
L8001a29c:
  beq $v1, $zero, L8001b0a4
L8001a2a0:
  lui $s0, 0x4
L8001a2a4:
  ori $s0, $s0, 0x8000
L8001a2a8:
  lui $v0, 0x8016
L8001a2ac:
  lbu $v1, 106($v1)
L8001a2b0:
  addiu $s2, $v0, -15324
L8001a2b4:
  sll $v0, $v1, 0x3
L8001a2b8:
  subu $v0, $v0, $v1
L8001a2bc:
  sll $v0, $v0, 0x2
L8001a2c0:
  addu $v0, $v0, $s2
L8001a2c4:
  addu $v0, $v0, $s0
L8001a2c8:
  lbu $v1, 106($s1)
L8001a2cc:
  lh $a0, 14016($v0)
L8001a2d0:
  sll $v0, $v1, 0x3
L8001a2d4:
  subu $v0, $v0, $v1
L8001a2d8:
  sll $v0, $v0, 0x2
L8001a2dc:
  addu $v0, $v0, $s2
L8001a2e0:
  addu $v0, $v0, $s0
L8001a2e4:
  lh $a1, 14016($v0)
L8001a2e8:
  jal L80019a60
L8001a2ec:
  sll $zero, $zero, 0x0
L8001a2f0:
  addu $v1, $v0, $zero
L8001a2f4:
  sll $v0, $v1, 0x10
L8001a2f8:
  sh $v1, 584($gp)
L8001a2fc:
  bne $v0, $zero, L8001a3a4
L8001a300:
  ori $v0, $v1, 0x8000
L8001a304:
  lbu $v1, 106($s1)
L8001a308:
  sll $zero, $zero, 0x0
L8001a30c:
  sll $v0, $v1, 0x3
L8001a310:
  subu $v0, $v0, $v1
L8001a314:
  sll $v0, $v0, 0x2
L8001a318:
  addu $v0, $v0, $s2
L8001a31c:
  lw $v1, -24848($s3)
L8001a320:
  addu $v0, $v0, $s0
L8001a324:
  lbu $v1, 106($v1)
L8001a328:
  lh $a0, 14016($v0)
L8001a32c:
  sll $v0, $v1, 0x3
L8001a330:
  subu $v0, $v0, $v1
L8001a334:
  sll $v0, $v0, 0x2
L8001a338:
  addu $v0, $v0, $s2
L8001a33c:
  addu $v0, $v0, $s0
L8001a340:
  lh $a1, 14016($v0)
L8001a344:
  jal L80019a08
L8001a348:
  sll $zero, $zero, 0x0
L8001a34c:
  sh $v0, 584($gp)
L8001a350:
  sll $v0, $v0, 0x10
L8001a354:
  bne $v0, $zero, L8001a3b8
L8001a358:
  sll $zero, $zero, 0x0
L8001a35c:
  lbu $v1, 106($s1)
L8001a360:
  sll $zero, $zero, 0x0
L8001a364:
  sll $v0, $v1, 0x3
L8001a368:
  subu $v0, $v0, $v1
L8001a36c:
  sll $v0, $v0, 0x2
L8001a370:
  addu $v0, $v0, $s2
L8001a374:
  lw $v1, -24848($s3)
L8001a378:
  addu $v0, $v0, $s0
L8001a37c:
  lbu $v1, 106($v1)
L8001a380:
  lh $a1, 14016($v0)
L8001a384:
  sll $v0, $v1, 0x3
L8001a388:
  subu $v0, $v0, $v1
L8001a38c:
  sll $v0, $v0, 0x2
L8001a390:
  addu $v0, $v0, $s2
L8001a394:
  addu $v0, $v0, $s0
L8001a398:
  lh $a0, 14016($v0)
L8001a39c:
  jal L80019a08
L8001a3a0:
  sll $zero, $zero, 0x0
L8001a3a4:
  sh $v0, 584($gp)
L8001a3a8:
  lh $v0, 584($gp)
L8001a3ac:
  sll $zero, $zero, 0x0
L8001a3b0:
  beq $v0, $zero, L8001b0a4
L8001a3b4:
  sll $zero, $zero, 0x0
L8001a3b8:
  lhu $a1, 584($gp)
L8001a3bc:
  addu $a0, $zero, $zero
L8001a3c0:
  jal 0x80029164
L8001a3c4:
  andi $a1, $a1, 0xfff
L8001a3c8:
  j L8001b0a4
L8001a3cc:
  sll $zero, $zero, 0x0
L8001a3d0:
  addiu $v0, $s0, -24848
L8001a3d4:
  lw $s1, 4($v0)
L8001a3d8:
  jal 0x80042a00
L8001a3dc:
  addu $a0, $s1, $zero
L8001a3e0:
  lhu $v0, 96($s1)
L8001a3e4:
  sll $zero, $zero, 0x0
L8001a3e8:
  addiu $v0, $v0, -1
L8001a3ec:
  sh $v0, 96($s1)
L8001a3f0:
  sll $v0, $v0, 0x10
L8001a3f4:
  bne $v0, $zero, L8001b0a4
L8001a3f8:
  sll $zero, $zero, 0x0
L8001a3fc:
  lw $v0, -24848($s0)
L8001a400:
  sh $zero, 776($gp)
L8001a404:
  bne $v0, $zero, L8001a420
L8001a408:
  sll $zero, $zero, 0x0
L8001a40c:
  addiu $v0, $zero, 3
L8001a410:
  sw $s1, -24848($s0)
L8001a414:
  sb $v0, 620($gp)
L8001a418:
  j L8001b0a4
L8001a41c:
  sll $zero, $zero, 0x0
L8001a420:
  lw $v0, 48($v0)
L8001a424:
  sll $zero, $zero, 0x0
L8001a428:
  sw $v0, 48($s1)
L8001a42c:
  lh $v0, 584($gp)
L8001a430:
  sll $zero, $zero, 0x0
L8001a434:
  bne $v0, $zero, L8001a454
L8001a438:
  andi $v0, $v0, 0x8000
L8001a43c:
  addiu $v0, $zero, 7
L8001a440:
  sb $v0, 620($gp)
L8001a444:
  addiu $v0, $zero, -1
L8001a448:
  sb $v0, 784($gp)
L8001a44c:
  j L8001b0a4
L8001a450:
  sll $zero, $zero, 0x0
L8001a454:
  beq $v0, $zero, L8001a484
L8001a458:
  addiu $v0, $zero, 1
L8001a45c:
  lw $v1, 704($gp)
L8001a460:
  sb $v0, 784($gp)
L8001a464:
  addiu $v0, $zero, 6
L8001a468:
  sh $zero, 588($gp)
L8001a46c:
  sb $v0, 620($gp)
L8001a470:
  lbu $v0, 8($v1)
L8001a474:
  sll $zero, $zero, 0x0
L8001a478:
  addiu $v0, $v0, 1
L8001a47c:
  j L8001b0a4
L8001a480:
  sb $v0, 8($v1)
L8001a484:
  addiu $v0, $zero, 5
L8001a488:
  sb $v0, 620($gp)
L8001a48c:
  lhu $v0, 588($gp)
L8001a490:
  lw $v1, 704($gp)
L8001a494:
  addiu $v0, $v0, 500
L8001a498:
  sh $v0, 588($gp)
L8001a49c:
  lbu $v0, 9($v1)
L8001a4a0:
  sll $zero, $zero, 0x0
L8001a4a4:
  addiu $v0, $v0, 1
L8001a4a8:
  j L8001b0a4
L8001a4ac:
  sb $v0, 9($v1)
L8001a4b0:
  lui $v0, 0x200
L8001a4b4:
  ori $v0, $v0, 0x30
L8001a4b8:
  lui $v1, 0x800a
L8001a4bc:
  lw $v1, -20236($v1)
L8001a4c0:
  lui $a0, 0x800a
L8001a4c4:
  lw $a0, -20172($a0)
L8001a4c8:
  and $v1, $v1, $v0
L8001a4cc:
  or $v1, $v1, $a0
L8001a4d0:
  bne $v1, $zero, L8001b0a4
L8001a4d4:
  sll $zero, $zero, 0x0
L8001a4d8:
  lbu $v1, 620($gp)
L8001a4dc:
  sll $zero, $zero, 0x0
L8001a4e0:
  andi $v0, $v1, 0x80
L8001a4e4:
  bne $v0, $zero, L8001a4fc
L8001a4e8:
  ori $v0, $v1, 0x80
L8001a4ec:
  sb $v0, 620($gp)
L8001a4f0:
  sh $zero, 776($gp)
L8001a4f4:
  j L8001b0a4
L8001a4f8:
  sll $zero, $zero, 0x0
L8001a4fc:
  lhu $v0, 776($gp)
L8001a500:
  sll $zero, $zero, 0x0
L8001a504:
  andi $v1, $v0, 0xf
L8001a508:
  sltiu $v0, $v1, 5
L8001a50c:
  beq $v0, $zero, L8001b0a4
L8001a510:
  lui $v0, 0x8001
L8001a514:
  addiu $v0, $v0, 280
L8001a518:
  sll $v1, $v1, 0x2
L8001a51c:
  addu $v1, $v1, $v0
L8001a520:
  lw $v0, 0($v1)
L8001a524:
  sll $zero, $zero, 0x0
L8001a528:
  jr $v0
L8001a52c:
  sll $zero, $zero, 0x0
L8001a530:
  lui $s3, 0x800f
L8001a534:
  lw $v0, -24848($s3)
L8001a538:
  lhu $a2, 776($gp)
L8001a53c:
  lbu $a0, 106($v0)
L8001a540:
  lui $v0, 0x801a
L8001a544:
  addiu $v0, $v0, 31448
L8001a548:
  sll $v1, $a0, 0x3
L8001a54c:
  subu $v1, $v1, $a0
L8001a550:
  sll $v1, $v1, 0x2
L8001a554:
  addu $s2, $v1, $v0
L8001a558:
  lui $v0, 0x800f
L8001a55c:
  addiu $a3, $v0, -24344
L8001a560:
  andi $v0, $a2, 0x80
L8001a564:
  bne $v0, $zero, L8001a5f8
L8001a568:
  addiu $s4, $s3, -24848
L8001a56c:
  lh $v1, 584($gp)
L8001a570:
  lhu $a1, 584($gp)
L8001a574:
  ori $v0, $a2, 0x80
L8001a578:
  sh $v0, 776($gp)
L8001a57c:
  andi $v1, $v1, 0x8000
L8001a580:
  beq $v1, $zero, L8001b0a4
L8001a584:
  addiu $a0, $a3, 8
L8001a588:
  lw $v0, 4($s2)
L8001a58c:
  andi $v1, $a1, 0xfff
L8001a590:
  sh $v1, 0($v0)
L8001a594:
  lw $a1, 4($s2)
L8001a598:
  ori $v0, $a2, 0xc0
L8001a59c:
  sh $v0, 776($gp)
L8001a5a0:
  sh $v1, 12($s2)
L8001a5a4:
  lhu $v0, 40($a3)
L8001a5a8:
  lhu $v1, 42($a3)
L8001a5ac:
  lbu $s0, 3($a1)
L8001a5b0:
  addiu $v0, $v0, 56
L8001a5b4:
  sh $v0, 8($a3)
L8001a5b8:
  addiu $v0, $zero, 8
L8001a5bc:
  sh $v0, 12($a3)
L8001a5c0:
  addiu $v0, $zero, 88
L8001a5c4:
  sh $v0, 14($a3)
L8001a5c8:
  lui $v0, 0x8019
L8001a5cc:
  addiu $v0, $v0, -15656
L8001a5d0:
  sh $v1, 10($a3)
L8001a5d4:
  sll $a1, $s0, 0x1
L8001a5d8:
  addu $a1, $a1, $s0
L8001a5dc:
  sll $a1, $a1, 0x2
L8001a5e0:
  subu $a1, $a1, $s0
L8001a5e4:
  sll $a1, $a1, 0x7
L8001a5e8:
  jal 0x80081ed4
L8001a5ec:
  addu $a1, $a1, $v0
L8001a5f0:
  j L8001b0a4
L8001a5f4:
  sll $zero, $zero, 0x0
L8001a5f8:
  andi $v0, $a2, 0x40
L8001a5fc:
  beq $v0, $zero, L8001a620
L8001a600:
  sll $zero, $zero, 0x0
L8001a604:
  lw $v0, 4($s2)
L8001a608:
  sll $zero, $zero, 0x0
L8001a60c:
  lb $a1, 2($v0)
L8001a610:
  jal 0x800249e0
L8001a614:
  sll $zero, $zero, 0x0
L8001a618:
  jal 0x80024954
L8001a61c:
  addu $a0, $s2, $zero
L8001a620:
  jal 0x800170c8
L8001a624:
  addu $a0, $s2, $zero
L8001a628:
  addu $s0, $v0, $zero
L8001a62c:
  addu $a0, $zero, $zero
L8001a630:
  andi $a1, $s0, 0xffff
L8001a634:
  jal 0x800291e0
L8001a638:
  sra $a2, $s0, 0x10
L8001a63c:
  addu $s1, $v0, $zero
L8001a640:
  addu $a1, $zero, $zero
L8001a644:
  addiu $a2, $zero, 64
L8001a648:
  addiu $v0, $zero, 16
L8001a64c:
  sh $v0, 50($s1)
L8001a650:
  lw $v1, -24848($s3)
L8001a654:
  lhu $v0, 8($s1)
L8001a658:
  lhu $v1, 48($v1)
L8001a65c:
  andi $v0, $v0, 0xffbf
L8001a660:
  sh $v0, 8($s1)
L8001a664:
  addiu $v1, $v1, -44
L8001a668:
  sh $v1, 48($s1)
L8001a66c:
  lw $a0, -24848($s3)
L8001a670:
  sw $s1, 696($gp)
L8001a674:
  jal L80019ba0
L8001a678:
  addiu $a3, $zero, 8
L8001a67c:
  lw $v1, 4($s4)
L8001a680:
  sll $zero, $zero, 0x0
L8001a684:
  beq $v1, $zero, L8001a6c8
L8001a688:
  addu $a1, $zero, $zero
L8001a68c:
  addiu $a2, $zero, 64
L8001a690:
  lw $v0, -24848($s3)
L8001a694:
  lh $v1, 48($v1)
L8001a698:
  lh $v0, 48($v0)
L8001a69c:
  addiu $v1, $v1, 52
L8001a6a0:
  addu $v0, $v0, $v1
L8001a6a4:
  srl $v1, $v0, 0x1f
L8001a6a8:
  addu $v0, $v0, $v1
L8001a6ac:
  sra $v0, $v0, 0x1
L8001a6b0:
  lw $v1, 696($gp)
L8001a6b4:
  addiu $v0, $v0, -70
L8001a6b8:
  sh $v0, 48($v1)
L8001a6bc:
  lw $a0, 4($s4)
L8001a6c0:
  jal L80019ba0
L8001a6c4:
  addiu $a3, $zero, 8
L8001a6c8:
  addiu $v0, $zero, 1
L8001a6cc:
  sh $v0, 776($gp)
L8001a6d0:
  j L8001b0a4
L8001a6d4:
  sll $zero, $zero, 0x0
L8001a6d8:
  jal 0x80042b40
L8001a6dc:
  addiu $a0, $zero, 1
L8001a6e0:
  bne $v0, $zero, L8001b0a4
L8001a6e4:
  sll $zero, $zero, 0x0
L8001a6e8:
  lhu $a1, 776($gp)
L8001a6ec:
  sll $zero, $zero, 0x0
L8001a6f0:
  andi $v0, $a1, 0x80
L8001a6f4:
  bne $v0, $zero, L8001a760
L8001a6f8:
  lui $v1, 0x800f
L8001a6fc:
  lw $a0, -24848($v1)
L8001a700:
  sll $zero, $zero, 0x0
L8001a704:
  lhu $v0, 8($a0)
L8001a708:
  addiu $v1, $v1, -24848
L8001a70c:
  andi $v0, $v0, 0xffbf
L8001a710:
  sh $v0, 8($a0)
L8001a714:
  lw $v1, 4($v1)
L8001a718:
  ori $v0, $a1, 0x80
L8001a71c:
  sh $v0, 776($gp)
L8001a720:
  beq $v1, $zero, L8001a738
L8001a724:
  sll $zero, $zero, 0x0
L8001a728:
  lhu $v0, 8($v1)
L8001a72c:
  sll $zero, $zero, 0x0
L8001a730:
  andi $v0, $v0, 0xffbf
L8001a734:
  sh $v0, 8($v1)
L8001a738:
  lw $v1, 696($gp)
L8001a73c:
  addiu $v0, $zero, 192
L8001a740:
  sb $v0, 33($v1)
L8001a744:
  lw $v1, 696($gp)
L8001a748:
  sll $zero, $zero, 0x0
L8001a74c:
  lhu $v0, 8($v1)
L8001a750:
  sll $zero, $zero, 0x0
L8001a754:
  ori $v0, $v0, 0x44
L8001a758:
  j L8001b0a4
L8001a75c:
  sh $v0, 8($v1)
L8001a760:
  lw $v1, 696($gp)
L8001a764:
  sll $zero, $zero, 0x0
L8001a768:
  lbu $v0, 33($v1)
L8001a76c:
  sll $zero, $zero, 0x0
L8001a770:
  addiu $v0, $v0, 8
L8001a774:
  sb $v0, 33($v1)
L8001a778:
  sll $v0, $v0, 0x18
L8001a77c:
  bltz $v0, L8001b0a4
L8001a780:
  addiu $a0, $zero, 2
L8001a784:
  lw $v0, 696($gp)
L8001a788:
  sll $zero, $zero, 0x0
L8001a78c:
  lhu $v1, 8($v0)
L8001a790:
  sb $zero, 33($v0)
L8001a794:
  sh $a0, 776($gp)
L8001a798:
  andi $v1, $v1, 0xfffb
L8001a79c:
  j L8001b0a4
L8001a7a0:
  sh $v1, 8($v0)
L8001a7a4:
  lui $v0, 0x800f
L8001a7a8:
  lw $v0, -24848($v0)
L8001a7ac:
  lw $s1, 696($gp)
L8001a7b0:
  lbu $v0, 106($v0)
L8001a7b4:
  lhu $a0, 776($gp)
L8001a7b8:
  sll $v1, $v0, 0x3
L8001a7bc:
  subu $v1, $v1, $v0
L8001a7c0:
  sll $v1, $v1, 0x2
L8001a7c4:
  lui $v0, 0x801a
L8001a7c8:
  addiu $v0, $v0, 31448
L8001a7cc:
  addu $s2, $v1, $v0
L8001a7d0:
  andi $v0, $a0, 0x80
L8001a7d4:
  bne $v0, $zero, L8001a840
L8001a7d8:
  andi $v0, $a0, 0x40
L8001a7dc:
  ori $v0, $a0, 0x80
L8001a7e0:
  sh $v0, 776($gp)
L8001a7e4:
  lh $v0, 584($gp)
L8001a7e8:
  addiu $v1, $zero, 30
L8001a7ec:
  andi $v0, $v0, 0x8000
L8001a7f0:
  bne $v0, $zero, L8001a834
L8001a7f4:
  sh $v1, 96($s1)
L8001a7f8:
  addiu $v0, $zero, 500
L8001a7fc:
  sh $zero, 40($s1)
L8001a800:
  sh $v0, 42($s1)
L8001a804:
  lhu $v1, 18($s2)
L8001a808:
  ori $v0, $a0, 0xc0
L8001a80c:
  sh $v0, 776($gp)
L8001a810:
  sh $v1, 44($s1)
L8001a814:
  lh $v1, 766($gp)
L8001a818:
  addiu $v0, $zero, 657
L8001a81c:
  bne $v1, $v0, L8001a834
L8001a820:
  addiu $v1, $zero, 1000
L8001a824:
  lhu $v0, 588($gp)
L8001a828:
  sh $v1, 42($s1)
L8001a82c:
  addiu $v0, $v0, 500
L8001a830:
  sh $v0, 588($gp)
L8001a834:
  lhu $a0, 776($gp)
L8001a838:
  sll $zero, $zero, 0x0
L8001a83c:
  andi $v0, $a0, 0x40
L8001a840:
  beq $v0, $zero, L8001a8b4
L8001a844:
  sll $zero, $zero, 0x0
L8001a848:
  lhu $v0, 40($s1)
L8001a84c:
  lh $v1, 42($s1)
L8001a850:
  addiu $v0, $v0, 31
L8001a854:
  sh $v0, 40($s1)
L8001a858:
  sll $v0, $v0, 0x10
L8001a85c:
  sra $v0, $v0, 0x10
L8001a860:
  slt $v0, $v0, $v1
L8001a864:
  lhu $v1, 42($s1)
L8001a868:
  bne $v0, $zero, L8001a880
L8001a86c:
  andi $v0, $a0, 0xffbf
L8001a870:
  sh $v0, 776($gp)
L8001a874:
  addiu $v0, $zero, 16
L8001a878:
  sh $v1, 40($s1)
L8001a87c:
  sh $v0, 96($s1)
L8001a880:
  lhu $v0, 44($s1)
L8001a884:
  lhu $v1, 40($s1)
L8001a888:
  addu $a0, $s2, $zero
L8001a88c:
  addu $v0, $v0, $v1
L8001a890:
  jal 0x800170c8
L8001a894:
  sh $v0, 18($a0)
L8001a898:
  addu $s0, $v0, $zero
L8001a89c:
  lui $v0, 0x800f
L8001a8a0:
  addiu $v0, $v0, -24344
L8001a8a4:
  sra $v1, $s0, 0x10
L8001a8a8:
  sh $s0, 50($v0)
L8001a8ac:
  j L8001b0a4
L8001a8b0:
  sh $v1, 52($v0)
L8001a8b4:
  lhu $v0, 96($s1)
L8001a8b8:
  sll $zero, $zero, 0x0
L8001a8bc:
  addiu $v0, $v0, -1
L8001a8c0:
  sh $v0, 96($s1)
L8001a8c4:
  sll $v0, $v0, 0x10
L8001a8c8:
  bgtz $v0, L8001b0a4
L8001a8cc:
  lui $s0, 0x800f
L8001a8d0:
  lw $v1, 696($gp)
L8001a8d4:
  sll $zero, $zero, 0x0
L8001a8d8:
  lhu $v0, 8($v1)
L8001a8dc:
  sll $zero, $zero, 0x0
L8001a8e0:
  ori $v0, $v0, 0x4
L8001a8e4:
  sh $v0, 8($v1)
L8001a8e8:
  lw $a0, -24848($s0)
L8001a8ec:
  jal 0x8004036c
L8001a8f0:
  addiu $s1, $s0, -24848
L8001a8f4:
  lw $a0, 4($s1)
L8001a8f8:
  jal 0x8004036c
L8001a8fc:
  sll $zero, $zero, 0x0
L8001a900:
  addu $a0, $s2, $zero
L8001a904:
  addiu $a1, $zero, 64
L8001a908:
  addiu $a2, $zero, 82
L8001a90c:
  sw $zero, 4($s1)
L8001a910:
  jal 0x80017f04
L8001a914:
  sw $zero, -24848($s0)
L8001a918:
  addu $s1, $v0, $zero
L8001a91c:
  sw $s1, -24848($s0)
L8001a920:
  lhu $v0, 8($s1)
L8001a924:
  addiu $v1, $zero, 3
L8001a928:
  sw $zero, 32($s1)
L8001a92c:
  sh $v1, 776($gp)
L8001a930:
  andi $v0, $v0, 0xffbb
L8001a934:
  j L8001b0a4
L8001a938:
  sh $v0, 8($s1)
L8001a93c:
  lui $v1, 0x800f
L8001a940:
  lhu $v0, 776($gp)
L8001a944:
  lw $s1, -24848($v1)
L8001a948:
  andi $v0, $v0, 0x80
L8001a94c:
  bne $v0, $zero, L8001a9c4
L8001a950:
  sll $zero, $zero, 0x0
L8001a954:
  lw $v1, 696($gp)
L8001a958:
  sll $zero, $zero, 0x0
L8001a95c:
  lbu $v0, 33($v1)
L8001a960:
  sll $zero, $zero, 0x0
L8001a964:
  addiu $v0, $v0, 8
L8001a968:
  sb $v0, 33($v1)
L8001a96c:
  andi $v0, $v0, 0xff
L8001a970:
  sltiu $v0, $v0, 64
L8001a974:
  bne $v0, $zero, L8001b0a4
L8001a978:
  addu $a0, $s1, $zero
L8001a97c:
  addiu $a1, $zero, 192
L8001a980:
  addu $a2, $zero, $zero
L8001a984:
  addiu $a3, $zero, 8
L8001a988:
  lw $v1, 696($gp)
L8001a98c:
  lhu $v0, 776($gp)
L8001a990:
  lhu $v1, 48($v1)
L8001a994:
  ori $v0, $v0, 0x80
L8001a998:
  sh $v0, 776($gp)
L8001a99c:
  addiu $v1, $v1, 44
L8001a9a0:
  jal L80019ba0
L8001a9a4:
  sh $v1, 48($s1)
L8001a9a8:
  lhu $v0, 8($s1)
L8001a9ac:
  addu $a0, $zero, $zero
L8001a9b0:
  ori $v0, $v0, 0x40
L8001a9b4:
  jal 0x80029528
L8001a9b8:
  sh $v0, 8($s1)
L8001a9bc:
  j L8001b0a4
L8001a9c0:
  sll $zero, $zero, 0x0
L8001a9c4:
  jal 0x80042b40
L8001a9c8:
  addiu $a0, $zero, 1
L8001a9cc:
  bne $v0, $zero, L8001b0a4
L8001a9d0:
  addiu $v0, $zero, 4
L8001a9d4:
  sh $v0, 776($gp)
L8001a9d8:
  j L8001b0a4
L8001a9dc:
  sll $zero, $zero, 0x0
L8001a9e0:
  lui $v0, 0x800f
L8001a9e4:
  lhu $v1, 776($gp)
L8001a9e8:
  lw $s1, -24848($v0)
L8001a9ec:
  andi $v0, $v1, 0x80
L8001a9f0:
  bne $v0, $zero, L8001aa10
L8001a9f4:
  addu $a0, $s1, $zero
L8001a9f8:
  ori $v0, $v1, 0x80
L8001a9fc:
  sh $v0, 776($gp)
L8001aa00:
  jal 0x80043178
L8001aa04:
  addu $a0, $s1, $zero
L8001aa08:
  sh $zero, 96($s1)
L8001aa0c:
  addu $a0, $s1, $zero
L8001aa10:
  addiu $a1, $zero, 64
L8001aa14:
  lh $a3, 96($s1)
L8001aa18:
  jal 0x8004318c
L8001aa1c:
  addiu $a2, $zero, 82
L8001aa20:
  lhu $v0, 96($s1)
L8001aa24:
  sll $zero, $zero, 0x0
L8001aa28:
  addiu $v0, $v0, 128
L8001aa2c:
  sh $v0, 96($s1)
L8001aa30:
  sll $v0, $v0, 0x10
L8001aa34:
  sra $v0, $v0, 0x10
L8001aa38:
  slti $v0, $v0, 2048
L8001aa3c:
  bne $v0, $zero, L8001b0a4
L8001aa40:
  addiu $v0, $zero, 3
L8001aa44:
  j L8001b038
L8001aa48:
  sll $zero, $zero, 0x0
L8001aa4c:
  lbu $t0, 620($gp)
L8001aa50:
  sll $zero, $zero, 0x0
L8001aa54:
  andi $v0, $t0, 0x80
L8001aa58:
  bne $v0, $zero, L8001aaec
L8001aa5c:
  andi $v0, $t0, 0x40
L8001aa60:
  addu $a1, $zero, $zero
L8001aa64:
  lui $s0, 0x800f
L8001aa68:
  addiu $a2, $zero, 64
L8001aa6c:
  lw $v1, -24848($s0)
L8001aa70:
  sll $zero, $zero, 0x0
L8001aa74:
  lhu $v0, 8($v1)
L8001aa78:
  addiu $s2, $s0, -24848
L8001aa7c:
  andi $v0, $v0, 0xffbf
L8001aa80:
  sh $v0, 8($v1)
L8001aa84:
  lw $a0, 4($s2)
L8001aa88:
  ori $v0, $t0, 0xc0
L8001aa8c:
  sb $v0, 620($gp)
L8001aa90:
  jal L80019ba0
L8001aa94:
  addiu $a3, $zero, 8
L8001aa98:
  lw $s1, -24848($s0)
L8001aa9c:
  sll $zero, $zero, 0x0
L8001aaa0:
  lbu $v1, 104($s1)
L8001aaa4:
  addiu $v0, $zero, 23
L8001aaa8:
  beq $v1, $v0, L8001aab4
L8001aaac:
  lui $a1, 0x4
L8001aab0:
  lw $s1, 4($s2)
L8001aab4:
  ori $a1, $a1, 0x8000
L8001aab8:
  lui $v1, 0x8016
L8001aabc:
  lbu $a0, 106($s1)
L8001aac0:
  addiu $v1, $v1, -15324
L8001aac4:
  sll $v0, $a0, 0x3
L8001aac8:
  subu $v0, $v0, $a0
L8001aacc:
  sll $v0, $v0, 0x2
L8001aad0:
  addu $v0, $v0, $v1
L8001aad4:
  addu $v0, $v0, $a1
L8001aad8:
  lhu $v0, 14016($v0)
L8001aadc:
  sll $zero, $zero, 0x0
L8001aae0:
  sh $v0, 766($gp)
L8001aae4:
  j L8001b0a4
L8001aae8:
  sll $zero, $zero, 0x0
L8001aaec:
  beq $v0, $zero, L8001ab90
L8001aaf0:
  andi $v0, $t0, 0x20
L8001aaf4:
  jal 0x80042b40
L8001aaf8:
  addiu $a0, $zero, 1
L8001aafc:
  bne $v0, $zero, L8001b0a4
L8001ab00:
  sll $zero, $zero, 0x0
L8001ab04:
  lbu $v1, 620($gp)
L8001ab08:
  sll $zero, $zero, 0x0
L8001ab0c:
  andi $v0, $v1, 0x20
L8001ab10:
  bne $v0, $zero, L8001ad1c
L8001ab14:
  andi $v0, $v1, 0x9f
L8001ab18:
  lui $s0, 0x800f
L8001ab1c:
  addiu $s1, $s0, -24848
L8001ab20:
  lw $a0, 4($s1)
L8001ab24:
  ori $v0, $v1, 0x20
L8001ab28:
  sb $v0, 620($gp)
L8001ab2c:
  lbu $v0, 104($a0)
L8001ab30:
  sll $zero, $zero, 0x0
L8001ab34:
  sltiu $v0, $v0, 20
L8001ab38:
  beq $v0, $zero, L8001ab58
L8001ab3c:
  sll $zero, $zero, 0x0
L8001ab40:
  lw $a0, -24848($s0)
L8001ab44:
  jal 0x8004036c
L8001ab48:
  sll $zero, $zero, 0x0
L8001ab4c:
  lw $v0, 4($s1)
L8001ab50:
  j L8001ab60
L8001ab54:
  sw $v0, -24848($s0)
L8001ab58:
  jal 0x8004036c
L8001ab5c:
  sll $zero, $zero, 0x0
L8001ab60:
  addiu $a1, $zero, 192
L8001ab64:
  lui $v1, 0x800f
L8001ab68:
  lw $a0, -24848($v1)
L8001ab6c:
  addiu $v0, $v1, -24848
L8001ab70:
  sw $zero, 4($v0)
L8001ab74:
  lhu $v0, 8($a0)
L8001ab78:
  sll $zero, $zero, 0x0
L8001ab7c:
  ori $v0, $v0, 0x40
L8001ab80:
  sh $v0, 8($a0)
L8001ab84:
  lw $a0, -24848($v1)
L8001ab88:
  j L8001ad0c
L8001ab8c:
  addu $a2, $zero, $zero
L8001ab90:
  bne $v0, $zero, L8001ac18
L8001ab94:
  ori $v0, $t0, 0x20
L8001ab98:
  lhu $a0, 766($gp)
L8001ab9c:
  sb $v0, 620($gp)
L8001aba0:
  addiu $a0, $a0, -301
L8001aba4:
  sltiu $a0, $a0, 2
L8001aba8:
  jal 0x8002c604
L8001abac:
  sll $a0, $a0, 0x2
L8001abb0:
  lui $a0, 0x800f
L8001abb4:
  lw $v1, -24848($a0)
L8001abb8:
  sll $zero, $zero, 0x0
L8001abbc:
  lhu $v1, 48($v1)
L8001abc0:
  addu $a1, $v0, $zero
L8001abc4:
  addiu $v1, $v1, 26
L8001abc8:
  sh $v1, 0($a1)
L8001abcc:
  lw $v0, -24848($a0)
L8001abd0:
  sw $a1, 628($gp)
L8001abd4:
  lhu $v0, 50($v0)
L8001abd8:
  lh $v1, 766($gp)
L8001abdc:
  addiu $v0, $v0, 30
L8001abe0:
  sh $v0, 2($a1)
L8001abe4:
  addiu $v0, $zero, 302
L8001abe8:
  bne $v1, $v0, L8001abf4
L8001abec:
  addiu $v0, $zero, 1
L8001abf0:
  sh $v0, 26($a1)
L8001abf4:
  lh $v1, 766($gp)
L8001abf8:
  addiu $v0, $zero, 657
L8001abfc:
  bne $v1, $v0, L8001ac08
L8001ac00:
  addiu $v0, $zero, 10
L8001ac04:
  sh $v0, 26($a1)
L8001ac08:
  jal 0x8003fee0
L8001ac0c:
  addiu $a0, $zero, 22
L8001ac10:
  j L8001b0a4
L8001ac14:
  sll $zero, $zero, 0x0
L8001ac18:
  lw $v0, 628($gp)
L8001ac1c:
  sll $zero, $zero, 0x0
L8001ac20:
  lbu $v0, 29($v0)
L8001ac24:
  sll $zero, $zero, 0x0
L8001ac28:
  beq $v0, $zero, L8001b0a4
L8001ac2c:
  addiu $v0, $zero, 4
L8001ac30:
  j L8001ae28
L8001ac34:
  sll $zero, $zero, 0x0
L8001ac38:
  lbu $v1, 620($gp)
L8001ac3c:
  sll $zero, $zero, 0x0
L8001ac40:
  andi $v0, $v1, 0x80
L8001ac44:
  bne $v0, $zero, L8001ac88
L8001ac48:
  ori $v0, $v1, 0xc0
L8001ac4c:
  lhu $a0, 584($gp)
L8001ac50:
  sb $v0, 620($gp)
L8001ac54:
  jal L80019cc8
L8001ac58:
  andi $a0, $a0, 0xfff
L8001ac5c:
  lui $v1, 0x800f
L8001ac60:
  addu $a1, $zero, $zero
L8001ac64:
  lw $a0, -24848($v1)
L8001ac68:
  addiu $a2, $zero, 64
L8001ac6c:
  lhu $v0, 8($a0)
L8001ac70:
  addiu $v1, $v1, -24848
L8001ac74:
  andi $v0, $v0, 0xffbf
L8001ac78:
  sh $v0, 8($a0)
L8001ac7c:
  lw $a0, 4($v1)
L8001ac80:
  jal L80019ba0
L8001ac84:
  addiu $a3, $zero, 8
L8001ac88:
  lbu $a1, 620($gp)
L8001ac8c:
  sll $zero, $zero, 0x0
L8001ac90:
  andi $v0, $a1, 0x40
L8001ac94:
  beq $v0, $zero, L8001ad28
L8001ac98:
  andi $v0, $a1, 0x20
L8001ac9c:
  jal 0x80042b40
L8001aca0:
  addiu $a0, $zero, 1
L8001aca4:
  bne $v0, $zero, L8001b0a4
L8001aca8:
  sll $zero, $zero, 0x0
L8001acac:
  lbu $v1, 620($gp)
L8001acb0:
  sll $zero, $zero, 0x0
L8001acb4:
  andi $v0, $v1, 0x20
L8001acb8:
  bne $v0, $zero, L8001ad1c
L8001acbc:
  andi $v0, $v1, 0x9f
L8001acc0:
  addiu $a1, $zero, 192
L8001acc4:
  addu $a2, $zero, $zero
L8001acc8:
  lui $s1, 0x800f
L8001accc:
  addiu $s0, $s1, -24848
L8001acd0:
  lw $a0, 4($s0)
L8001acd4:
  ori $v0, $v1, 0x20
L8001acd8:
  sb $v0, 620($gp)
L8001acdc:
  jal L80019ba0
L8001ace0:
  addiu $a3, $zero, 8
L8001ace4:
  lw $v1, 4($s0)
L8001ace8:
  addiu $v0, $zero, 140
L8001acec:
  sh $v0, 48($v1)
L8001acf0:
  lw $v1, -24848($s1)
L8001acf4:
  addiu $a1, $zero, 192
L8001acf8:
  lhu $v0, 8($v1)
L8001acfc:
  addu $a2, $zero, $zero
L8001ad00:
  ori $v0, $v0, 0x40
L8001ad04:
  sh $v0, 8($v1)
L8001ad08:
  lw $a0, -24848($s1)
L8001ad0c:
  jal L80019ba0
L8001ad10:
  addiu $a3, $zero, 8
L8001ad14:
  j L8001b0a4
L8001ad18:
  sll $zero, $zero, 0x0
L8001ad1c:
  sb $v0, 620($gp)
L8001ad20:
  j L8001b0a4
L8001ad24:
  sll $zero, $zero, 0x0
L8001ad28:
  bne $v0, $zero, L8001add8
L8001ad2c:
  lui $s0, 0x800f
L8001ad30:
  lw $v0, -24848($s0)
L8001ad34:
  addiu $a0, $zero, 1
L8001ad38:
  sh $zero, 96($v0)
L8001ad3c:
  lw $v0, -24848($s0)
L8001ad40:
  addu $s1, $a0, $zero
L8001ad44:
  sh $s1, 40($v0)
L8001ad48:
  lw $v1, -24848($s0)
L8001ad4c:
  addiu $v0, $zero, 9856
L8001ad50:
  sh $v0, 42($v1)
L8001ad54:
  lw $v1, -24848($s0)
L8001ad58:
  ori $v0, $a1, 0x20
L8001ad5c:
  sb $v0, 620($gp)
L8001ad60:
  jal 0x8002c604
L8001ad64:
  sh $s1, 46($v1)
L8001ad68:
  addu $v1, $v0, $zero
L8001ad6c:
  addiu $v0, $zero, 128
L8001ad70:
  sh $v0, 0($v1)
L8001ad74:
  lw $v0, -24848($s0)
L8001ad78:
  sll $zero, $zero, 0x0
L8001ad7c:
  lhu $v0, 50($v0)
L8001ad80:
  sll $zero, $zero, 0x0
L8001ad84:
  addiu $v0, $v0, 30
L8001ad88:
  sh $v0, 2($v1)
L8001ad8c:
  lw $v0, -24848($s0)
L8001ad90:
  sw $v1, 628($gp)
L8001ad94:
  lbu $v0, 104($v0)
L8001ad98:
  sll $zero, $zero, 0x0
L8001ad9c:
  sltiu $v0, $v0, 20
L8001ada0:
  beq $v0, $zero, L8001adc4
L8001ada4:
  addiu $s0, $s0, -24848
L8001ada8:
  lw $v0, 4($s0)
L8001adac:
  sll $zero, $zero, 0x0
L8001adb0:
  lbu $v0, 104($v0)
L8001adb4:
  sll $zero, $zero, 0x0
L8001adb8:
  sltiu $v0, $v0, 20
L8001adbc:
  bne $v0, $zero, L8001adc8
L8001adc0:
  sll $zero, $zero, 0x0
L8001adc4:
  sh $s1, 26($v1)
L8001adc8:
  jal 0x8003fee0
L8001adcc:
  addiu $a0, $zero, 24
L8001add0:
  j L8001b0a4
L8001add4:
  sll $zero, $zero, 0x0
L8001add8:
  lw $v0, 628($gp)
L8001addc:
  sll $zero, $zero, 0x0
L8001ade0:
  lbu $v0, 29($v0)
L8001ade4:
  sll $zero, $zero, 0x0
L8001ade8:
  beq $v0, $zero, L8001ae34
L8001adec:
  lui $v1, 0x800f
L8001adf0:
  lw $a0, -24848($v1)
L8001adf4:
  sll $zero, $zero, 0x0
L8001adf8:
  lhu $v0, 8($a0)
L8001adfc:
  addiu $v1, $v1, -24848
L8001ae00:
  andi $v0, $v0, 0xffbf
L8001ae04:
  sh $v0, 8($a0)
L8001ae08:
  lw $v1, 4($v1)
L8001ae0c:
  sll $zero, $zero, 0x0
L8001ae10:
  lhu $v0, 8($v1)
L8001ae14:
  addiu $a0, $zero, 25
L8001ae18:
  andi $v0, $v0, 0xffbf
L8001ae1c:
  jal 0x8003fee0
L8001ae20:
  sh $v0, 8($v1)
L8001ae24:
  addiu $v0, $zero, 4
L8001ae28:
  sb $v0, 620($gp)
L8001ae2c:
  j L8001b0a4
L8001ae30:
  sll $zero, $zero, 0x0
L8001ae34:
  lui $a2, 0x800f
L8001ae38:
  lw $s1, -24848($a2)
L8001ae3c:
  sll $zero, $zero, 0x0
L8001ae40:
  lhu $v0, 46($s1)
L8001ae44:
  lui $a0, 0x2aaa
L8001ae48:
  addiu $v0, $v0, 8
L8001ae4c:
  sh $v0, 46($s1)
L8001ae50:
  lw $v0, -24848($a2)
L8001ae54:
  lhu $v1, 96($s1)
L8001ae58:
  lhu $v0, 46($v0)
L8001ae5c:
  ori $a0, $a0, 0xaaab
L8001ae60:
  addu $v1, $v1, $v0
L8001ae64:
  sll $a1, $v1, 0x10
L8001ae68:
  sra $v0, $a1, 0x10
L8001ae6c:
  mult $v0, $a0
L8001ae70:
  addiu $s4, $a2, -24848
L8001ae74:
  sra $a1, $a1, 0x1f
L8001ae78:
  sh $v1, 96($s1)
L8001ae7c:
  lh $a0, 96($s1)
L8001ae80:
  lhu $v1, 42($s1)
L8001ae84:
  mfhi $t0
L8001ae88:
  sra $v0, $t0, 0x1
L8001ae8c:
  subu $v0, $v0, $a1
L8001ae90:
  subu $v1, $v1, $v0
L8001ae94:
  sll $v0, $v1, 0x10
L8001ae98:
  sra $s2, $v0, 0x18
L8001ae9c:
  jal 0x80086770
L8001aea0:
  sh $v1, 42($s1)
L8001aea4:
  mult $v0, $s2
L8001aea8:
  mflo $v0
L8001aeac:
  bgez $v0, L8001aeb8
L8001aeb0:
  sll $zero, $zero, 0x0
L8001aeb4:
  addiu $v0, $v0, 4095
L8001aeb8:
  lh $a0, 96($s1)
L8001aebc:
  jal 0x800866a0
L8001aec0:
  sra $s3, $v0, 0xc
L8001aec4:
  mult $v0, $s2
L8001aec8:
  mflo $v0
L8001aecc:
  bgez $v0, L8001aedc
L8001aed0:
  sra $s0, $v0, 0xc
L8001aed4:
  addiu $v0, $v0, 4095
L8001aed8:
  sra $s0, $v0, 0xc
L8001aedc:
  addiu $v0, $zero, 102
L8001aee0:
  subu $v0, $v0, $s3
L8001aee4:
  sh $v0, 48($s1)
L8001aee8:
  addiu $v0, $zero, 82
L8001aeec:
  subu $v0, $v0, $s0
L8001aef0:
  sh $v0, 50($s1)
L8001aef4:
  lw $v1, 4($s4)
L8001aef8:
  addiu $v0, $s3, 102
L8001aefc:
  sh $v0, 48($v1)
L8001af00:
  lw $v1, 4($s4)
L8001af04:
  addiu $v0, $s0, 82
L8001af08:
  j L8001b0a4
L8001af0c:
  sh $v0, 50($v1)
L8001af10:
  lui $s0, 0x800f
L8001af14:
  lbu $v1, 620($gp)
L8001af18:
  lw $s1, -24848($s0)
L8001af1c:
  andi $v0, $v1, 0x80
L8001af20:
  bne $v0, $zero, L8001afbc
L8001af24:
  addiu $s2, $s0, -24848
L8001af28:
  lui $a1, 0xf7ff
L8001af2c:
  ori $a1, $a1, 0xffff
L8001af30:
  addiu $a0, $zero, 26
L8001af34:
  ori $v0, $v1, 0x80
L8001af38:
  sb $v0, 620($gp)
L8001af3c:
  lhu $v0, 8($s1)
L8001af40:
  lw $v1, 4($s1)
L8001af44:
  ori $v0, $v0, 0x4
L8001af48:
  and $v1, $v1, $a1
L8001af4c:
  sh $v0, 8($s1)
L8001af50:
  jal 0x8003fee0
L8001af54:
  sw $v1, 4($s1)
L8001af58:
  lw $v1, 4($s2)
L8001af5c:
  sll $zero, $zero, 0x0
L8001af60:
  lbu $v0, 104($v1)
L8001af64:
  sll $zero, $zero, 0x0
L8001af68:
  sltiu $v0, $v0, 20
L8001af6c:
  bne $v0, $zero, L8001af94
L8001af70:
  sll $zero, $zero, 0x0
L8001af74:
  lbu $v0, 104($s1)
L8001af78:
  sll $zero, $zero, 0x0
L8001af7c:
  sltiu $v0, $v0, 20
L8001af80:
  beq $v0, $zero, L8001af94
L8001af84:
  sll $zero, $zero, 0x0
L8001af88:
  sw $s1, 4($s2)
L8001af8c:
  addu $s1, $v1, $zero
L8001af90:
  sw $v1, -24848($s0)
L8001af94:
  jal 0x800429d8
L8001af98:
  addu $a0, $s1, $zero
L8001af9c:
  jal 0x8008e590
L8001afa0:
  sll $zero, $zero, 0x0
L8001afa4:
  andi $v0, $v0, 0xff
L8001afa8:
  addiu $v0, $v0, 768
L8001afac:
  subu $v0, $zero, $v0
L8001afb0:
  sh $v0, 54($s1)
L8001afb4:
  addiu $v0, $zero, -640
L8001afb8:
  sh $v0, 56($s1)
L8001afbc:
  lh $a0, 54($s1)
L8001afc0:
  jal 0x80042b08
L8001afc4:
  addiu $a1, $zero, 8
L8001afc8:
  addiu $a1, $zero, 2048
L8001afcc:
  lh $a0, 56($s1)
L8001afd0:
  addiu $a2, $zero, 96
L8001afd4:
  jal 0x80042ad8
L8001afd8:
  sh $v0, 54($s1)
L8001afdc:
  addu $a0, $s1, $zero
L8001afe0:
  jal 0x80042a78
L8001afe4:
  sh $v0, 56($s1)
L8001afe8:
  lh $v0, 48($s1)
L8001afec:
  sll $zero, $zero, 0x0
L8001aff0:
  slti $v0, $v0, -52
L8001aff4:
  bne $v0, $zero, L8001b010
L8001aff8:
  sll $zero, $zero, 0x0
L8001affc:
  lh $v0, 50($s1)
L8001b000:
  sll $zero, $zero, 0x0
L8001b004:
  slti $v0, $v0, 240
L8001b008:
  bne $v0, $zero, L8001b0a4
L8001b00c:
  sll $zero, $zero, 0x0
L8001b010:
  jal 0x8004036c
L8001b014:
  addu $a0, $s1, $zero
L8001b018:
  lui $v1, 0x800f
L8001b01c:
  addiu $v0, $v1, -24848
L8001b020:
  lui $a0, 0x800f
L8001b024:
  lw $v0, 4($v0)
L8001b028:
  addiu $a0, $a0, -20232
L8001b02c:
  jal 0x80035b7c
L8001b030:
  sw $v0, -24848($v1)
L8001b034:
  addiu $v0, $zero, 3
L8001b038:
  sb $v0, 620($gp)
L8001b03c:
  j L8001b0a4
L8001b040:
  sll $zero, $zero, 0x0
L8001b044:
  lui $v0, 0x800f
L8001b048:
  lw $v1, -24848($v0)
L8001b04c:
  addiu $v0, $zero, 6
L8001b050:
  sh $v0, 818($gp)
L8001b054:
  lbu $v0, 104($v1)
L8001b058:
  sll $zero, $zero, 0x0
L8001b05c:
  sltiu $v0, $v0, 20
L8001b060:
  beq $v0, $zero, L8001b0a4
L8001b064:
  addiu $v0, $zero, 16392
L8001b068:
  lbu $a0, 106($v1)
L8001b06c:
  lui $v1, 0x801a
L8001b070:
  addiu $v1, $v1, 31448
L8001b074:
  sh $v0, 818($gp)
L8001b078:
  sll $v0, $a0, 0x3
L8001b07c:
  subu $v0, $v0, $a0
L8001b080:
  sll $v0, $v0, 0x2
L8001b084:
  addu $v0, $v0, $v1
L8001b088:
  lhu $v1, 22($v0)
L8001b08c:
  lb $a0, 784($gp)
L8001b090:
  andi $v1, $v1, 0xefff
L8001b094:
  beq $a0, $zero, L8001b0a4
L8001b098:
  sh $v1, 22($v0)
L8001b09c:
  addiu $v0, $zero, 8
L8001b0a0:
  sh $v0, 818($gp)
L8001b0a4:
  lw $ra, 44($sp)
L8001b0a8:
  lw $s6, 40($sp)
L8001b0ac:
  lw $s5, 36($sp)
L8001b0b0:
  lw $s4, 32($sp)
L8001b0b4:
  lw $s3, 28($sp)
L8001b0b8:
  lw $s2, 24($sp)
L8001b0bc:
  lw $s1, 20($sp)
L8001b0c0:
  lw $s0, 16($sp)
L8001b0c4:
  jr $ra
L8001b0c8:
  addiu $sp, $sp, 48
L8001b0cc:
  addiu $sp, $sp, -32
L8001b0d0:
  sw $s0, 24($sp)
L8001b0d4:
  addu $s0, $a0, $zero
L8001b0d8:
  lui $v0, 0x800f
L8001b0dc:
  lh $a0, 10326($v0)
L8001b0e0:
  sw $ra, 28($sp)
L8001b0e4:
  jal 0x800878d0
L8001b0e8:
  sll $s0, $s0, 0x2
L8001b0ec:
  addiu $a0, $zero, 160
L8001b0f0:
  jal 0x800878b0
L8001b0f4:
  addiu $a1, $zero, 108
L8001b0f8:
  lui $a0, 0x8010
L8001b0fc:
  jal 0x800855d0
L8001b100:
  addiu $a0, $a0, -7864
L8001b104:
  lui $v1, 0x1f80
L8001b108:
  ori $v1, $v1, 0x3e0
L8001b10c:
  lui $v0, 0x8009
L8001b110:
  addiu $v0, $v0, 2208
L8001b114:
  addu $s0, $s0, $v0
L8001b118:
  lhu $a0, 0($s0)
L8001b11c:
  addiu $v0, $zero, -24
L8001b120:
  sh $v0, 2($v1)
L8001b124:
  sh $a0, 0($v1)
L8001b128:
  lhu $v0, 2($s0)
L8001b12c:
  sll $zero, $zero, 0x0
L8001b130:
  sh $v0, 4($v1)
L8001b134:
  .word 0xc8600000
L8001b138:
  .word 0xc8610004
L8001b13c:
  sll $zero, $zero, 0x0
L8001b140:
  sll $zero, $zero, 0x0
L8001b144:
  .word 0x4a180001
L8001b148:
  addiu $v0, $sp, 16
L8001b14c:
  .word 0xe84e0000
L8001b150:
  addu $a0, $zero, $zero
L8001b154:
  jal 0x800878b0
L8001b158:
  addu $a1, $a0, $zero
L8001b15c:
  lh $v0, 16($sp)
L8001b160:
  lw $ra, 28($sp)
L8001b164:
  lw $s0, 24($sp)
L8001b168:
  jr $ra
L8001b16c:
  addiu $sp, $sp, 32
L8001b170:
  addiu $sp, $sp, -48
L8001b174:
  lhu $v1, 818($gp)
L8001b178:
  lui $v0, 0x800f
L8001b17c:
  sw $s1, 36($sp)
L8001b180:
  lw $s1, -24848($v0)
L8001b184:
  sw $ra, 44($sp)
L8001b188:
  sw $s2, 40($sp)
L8001b18c:
  andi $v0, $v1, 0x8000
L8001b190:
  bne $v0, $zero, L8001b28c
L8001b194:
  sw $s0, 32($sp)
L8001b198:
  ori $v0, $v1, 0x8000
L8001b19c:
  sh $v0, 818($gp)
L8001b1a0:
  andi $v0, $v0, 0x4000
L8001b1a4:
  bne $v0, $zero, L8001b454
L8001b1a8:
  addiu $v0, $zero, 4
L8001b1ac:
  lbu $v0, 717($gp)
L8001b1b0:
  lui $v1, 0x800a
L8001b1b4:
  addiu $v1, $v1, -19616
L8001b1b8:
  addu $v0, $v0, $v1
L8001b1bc:
  lb $v0, 0($v0)
L8001b1c0:
  sll $zero, $zero, 0x0
L8001b1c4:
  bltz $v0, L8001b250
L8001b1c8:
  addiu $v0, $zero, 1
L8001b1cc:
  lbu $v0, 104($s1)
L8001b1d0:
  sll $zero, $zero, 0x0
L8001b1d4:
  sltiu $v0, $v0, 20
L8001b1d8:
  beq $v0, $zero, L8001b24c
L8001b1dc:
  lui $v0, 0x801a
L8001b1e0:
  lbu $v1, 106($s1)
L8001b1e4:
  addiu $a0, $v0, 31448
L8001b1e8:
  sll $v0, $v1, 0x3
L8001b1ec:
  subu $v0, $v0, $v1
L8001b1f0:
  sll $v0, $v0, 0x2
L8001b1f4:
  addu $v0, $v0, $a0
L8001b1f8:
  lhu $v1, 22($v0)
L8001b1fc:
  sll $zero, $zero, 0x0
L8001b200:
  andi $v1, $v1, 0xfdff
L8001b204:
  sh $v1, 22($v0)
L8001b208:
  lui $v0, 0x800f
L8001b20c:
  lbu $v0, -20849($v0)
L8001b210:
  sll $zero, $zero, 0x0
L8001b214:
  andi $v0, $v0, 0x1
L8001b218:
  beq $v0, $zero, L8001b454
L8001b21c:
  addiu $v0, $zero, 4
L8001b220:
  lbu $v0, 106($s1)
L8001b224:
  sll $zero, $zero, 0x0
L8001b228:
  sll $v1, $v0, 0x3
L8001b22c:
  subu $v1, $v1, $v0
L8001b230:
  sll $v1, $v1, 0x2
L8001b234:
  addu $v1, $v1, $a0
L8001b238:
  lhu $v0, 22($v1)
L8001b23c:
  sll $zero, $zero, 0x0
L8001b240:
  ori $v0, $v0, 0x200
L8001b244:
  j L8001b450
L8001b248:
  sh $v0, 22($v1)
L8001b24c:
  addiu $v0, $zero, 1
L8001b250:
  sb $v0, 620($gp)
L8001b254:
  jal 0x80043178
L8001b258:
  addu $a0, $s1, $zero
L8001b25c:
  lh $v1, 48($s1)
L8001b260:
  addiu $v0, $zero, 134
L8001b264:
  beq $v1, $v0, L8001b27c
L8001b268:
  sh $zero, 96($s1)
L8001b26c:
  lh $v1, 50($s1)
L8001b270:
  addiu $v0, $zero, 42
L8001b274:
  bne $v1, $v0, L8001b28c
L8001b278:
  sll $zero, $zero, 0x0
L8001b27c:
  addiu $v0, $zero, 2
L8001b280:
  sb $v0, 620($gp)
L8001b284:
  j L8001b768
L8001b288:
  sll $zero, $zero, 0x0
L8001b28c:
  lbu $v0, 620($gp)
L8001b290:
  sll $zero, $zero, 0x0
L8001b294:
  andi $v0, $v0, 0xf
L8001b298:
  addiu $v1, $v0, -1
L8001b29c:
  sltiu $v0, $v1, 6
L8001b2a0:
  beq $v0, $zero, L8001b768
L8001b2a4:
  lui $v0, 0x8001
L8001b2a8:
  addiu $v0, $v0, 304
L8001b2ac:
  sll $v1, $v1, 0x2
L8001b2b0:
  addu $v1, $v1, $v0
L8001b2b4:
  lw $v0, 0($v1)
L8001b2b8:
  sll $zero, $zero, 0x0
L8001b2bc:
  jr $v0
L8001b2c0:
  sll $zero, $zero, 0x0
L8001b2c4:
  addu $a0, $s1, $zero
L8001b2c8:
  addiu $a1, $zero, 134
L8001b2cc:
  lh $a3, 96($s1)
L8001b2d0:
  jal 0x8004318c
L8001b2d4:
  addiu $a2, $zero, 42
L8001b2d8:
  lhu $v0, 96($s1)
L8001b2dc:
  sll $zero, $zero, 0x0
L8001b2e0:
  addiu $v0, $v0, 128
L8001b2e4:
  sh $v0, 96($s1)
L8001b2e8:
  sll $v0, $v0, 0x10
L8001b2ec:
  sra $v0, $v0, 0x10
L8001b2f0:
  slti $v0, $v0, 2048
L8001b2f4:
  bne $v0, $zero, L8001b768
L8001b2f8:
  addiu $v0, $zero, 134
L8001b2fc:
  sh $v0, 48($s1)
L8001b300:
  addiu $v0, $zero, 42
L8001b304:
  sh $v0, 50($s1)
L8001b308:
  addiu $v0, $zero, 2
L8001b30c:
  sb $v0, 620($gp)
L8001b310:
  lbu $v0, 104($s1)
L8001b314:
  sll $zero, $zero, 0x0
L8001b318:
  sltiu $v0, $v0, 20
L8001b31c:
  beq $v0, $zero, L8001b450
L8001b320:
  addiu $v0, $zero, 3
L8001b324:
  sb $v0, 620($gp)
L8001b328:
  lbu $v1, 620($gp)
L8001b32c:
  sll $zero, $zero, 0x0
L8001b330:
  andi $v0, $v1, 0x80
L8001b334:
  bne $v0, $zero, L8001b3e4
L8001b338:
  andi $v0, $v1, 0x10
L8001b33c:
  lui $a2, 0x4
L8001b340:
  ori $a2, $a2, 0x8000
L8001b344:
  addu $a0, $zero, $zero
L8001b348:
  ori $v0, $v1, 0x80
L8001b34c:
  lui $v1, 0x8016
L8001b350:
  sb $v0, 620($gp)
L8001b354:
  lbu $a1, 106($s1)
L8001b358:
  addiu $v1, $v1, -15324
L8001b35c:
  sll $v0, $a1, 0x3
L8001b360:
  subu $v0, $v0, $a1
L8001b364:
  sll $v0, $v0, 0x2
L8001b368:
  addu $v0, $v0, $v1
L8001b36c:
  addu $v0, $v0, $a2
L8001b370:
  lhu $v0, 14016($v0)
L8001b374:
  lui $at, 0x800a
L8001b378:
  sh $v0, -19656($at)
L8001b37c:
  jal 0x8003b6ac
L8001b380:
  addiu $a1, $zero, 11
L8001b384:
  addu $a0, $zero, $zero
L8001b388:
  addiu $a1, $zero, 33
L8001b38c:
  addiu $a2, $zero, 72
L8001b390:
  addiu $a3, $zero, 110
L8001b394:
  addiu $v0, $zero, 176
L8001b398:
  sw $v0, 16($sp)
L8001b39c:
  addiu $v0, $zero, 48
L8001b3a0:
  sw $v0, 20($sp)
L8001b3a4:
  addiu $v0, $zero, 32
L8001b3a8:
  jal 0x80035c38
L8001b3ac:
  sw $v0, 24($sp)
L8001b3b0:
  addu $s0, $v0, $zero
L8001b3b4:
  addiu $v0, $zero, 8
L8001b3b8:
  sb $v0, 90($s0)
L8001b3bc:
  addiu $v0, $zero, 16
L8001b3c0:
  sb $v0, 91($s0)
L8001b3c4:
  jal 0x80039794
L8001b3c8:
  sll $zero, $zero, 0x0
L8001b3cc:
  lw $v0, 48($s0)
L8001b3d0:
  sll $zero, $zero, 0x0
L8001b3d4:
  beq $v0, $zero, L8001b3c4
L8001b3d8:
  sll $zero, $zero, 0x0
L8001b3dc:
  j L8001b768
L8001b3e0:
  sll $zero, $zero, 0x0
L8001b3e4:
  beq $v0, $zero, L8001b460
L8001b3e8:
  lui $v0, 0x801a
L8001b3ec:
  lbu $v1, 106($s1)
L8001b3f0:
  addiu $a1, $v0, 31448
L8001b3f4:
  sll $v0, $v1, 0x3
L8001b3f8:
  subu $v0, $v0, $v1
L8001b3fc:
  sll $v0, $v0, 0x2
L8001b400:
  addu $v0, $v0, $a1
L8001b404:
  lhu $v1, 22($v0)
L8001b408:
  lui $a0, 0x800a
L8001b40c:
  lb $a0, -19635($a0)
L8001b410:
  andi $v1, $v1, 0xfdff
L8001b414:
  beq $a0, $zero, L8001b444
L8001b418:
  sh $v1, 22($v0)
L8001b41c:
  lbu $v0, 106($s1)
L8001b420:
  sll $zero, $zero, 0x0
L8001b424:
  sll $v1, $v0, 0x3
L8001b428:
  subu $v1, $v1, $v0
L8001b42c:
  sll $v1, $v1, 0x2
L8001b430:
  addu $v1, $v1, $a1
L8001b434:
  lhu $v0, 22($v1)
L8001b438:
  sll $zero, $zero, 0x0
L8001b43c:
  ori $v0, $v0, 0x200
L8001b440:
  sh $v0, 22($v1)
L8001b444:
  lui $a0, 0x800f
L8001b448:
  jal 0x80035b7c
L8001b44c:
  addiu $a0, $a0, -20232
L8001b450:
  addiu $v0, $zero, 4
L8001b454:
  sb $v0, 620($gp)
L8001b458:
  j L8001b768
L8001b45c:
  sll $zero, $zero, 0x0
L8001b460:
  lui $a0, 0x800f
L8001b464:
  jal 0x8003700c
L8001b468:
  addiu $a0, $a0, -20232
L8001b46c:
  bne $v0, $zero, L8001b768
L8001b470:
  sll $zero, $zero, 0x0
L8001b474:
  lui $v0, 0x800a
L8001b478:
  lhu $v0, -19560($v0)
L8001b47c:
  sll $zero, $zero, 0x0
L8001b480:
  andi $v0, $v0, 0xc0
L8001b484:
  beq $v0, $zero, L8001b768
L8001b488:
  sll $zero, $zero, 0x0
L8001b48c:
  jal 0x8003fee0
L8001b490:
  addiu $a0, $zero, 7
L8001b494:
  lbu $v0, 620($gp)
L8001b498:
  sll $zero, $zero, 0x0
L8001b49c:
  ori $v0, $v0, 0x10
L8001b4a0:
  sb $v0, 620($gp)
L8001b4a4:
  j L8001b768
L8001b4a8:
  sll $zero, $zero, 0x0
L8001b4ac:
  lbu $v1, 620($gp)
L8001b4b0:
  sll $zero, $zero, 0x0
L8001b4b4:
  andi $v0, $v1, 0x80
L8001b4b8:
  bne $v0, $zero, L8001b4e8
L8001b4bc:
  ori $v0, $v1, 0x80
L8001b4c0:
  lbu $a0, 660($gp)
L8001b4c4:
  sb $v0, 620($gp)
L8001b4c8:
  jal L8001b0cc
L8001b4cc:
  sll $zero, $zero, 0x0
L8001b4d0:
  addu $a0, $s1, $zero
L8001b4d4:
  addiu $v0, $v0, -30
L8001b4d8:
  jal 0x80043178
L8001b4dc:
  sh $v0, 46($s1)
L8001b4e0:
  addiu $v0, $zero, 1024
L8001b4e4:
  sh $v0, 96($s1)
L8001b4e8:
  lbu $v0, 620($gp)
L8001b4ec:
  sll $zero, $zero, 0x0
L8001b4f0:
  andi $v0, $v0, 0x40
L8001b4f4:
  bne $v0, $zero, L8001b620
L8001b4f8:
  addu $a0, $s1, $zero
L8001b4fc:
  lh $a1, 46($s1)
L8001b500:
  lh $a3, 96($s1)
L8001b504:
  jal 0x80043230
L8001b508:
  addiu $a2, $zero, -188
L8001b50c:
  lhu $v0, 96($s1)
L8001b510:
  sll $zero, $zero, 0x0
L8001b514:
  addiu $v0, $v0, -42
L8001b518:
  sh $v0, 96($s1)
L8001b51c:
  sll $v0, $v0, 0x10
L8001b520:
  bgtz $v0, L8001b768
L8001b524:
  lui $s2, 0x1f80
L8001b528:
  lui $s0, 0x801a
L8001b52c:
  lbu $v0, 620($gp)
L8001b530:
  addiu $s0, $s0, 31448
L8001b534:
  ori $v0, $v0, 0x40
L8001b538:
  sb $v0, 620($gp)
L8001b53c:
  lbu $v1, 106($s1)
L8001b540:
  lbu $a0, 660($gp)
L8001b544:
  sll $v0, $v1, 0x3
L8001b548:
  subu $v0, $v0, $v1
L8001b54c:
  sll $v0, $v0, 0x2
L8001b550:
  addu $v0, $v0, $s0
L8001b554:
  lw $t0, 0($v0)
L8001b558:
  lw $t1, 4($v0)
L8001b55c:
  lw $t2, 8($v0)
L8001b560:
  lw $t3, 12($v0)
L8001b564:
  sw $t0, 0($s2)
L8001b568:
  sw $t1, 4($s2)
L8001b56c:
  sw $t2, 8($s2)
L8001b570:
  sw $t3, 12($s2)
L8001b574:
  lw $t0, 16($v0)
L8001b578:
  lw $t1, 20($v0)
L8001b57c:
  lw $t2, 24($v0)
L8001b580:
  sw $t0, 16($s2)
L8001b584:
  sw $t1, 20($s2)
L8001b588:
  sw $t2, 24($s2)
L8001b58c:
  lbu $a1, 107($s1)
L8001b590:
  jal 0x80024d34
L8001b594:
  sll $zero, $zero, 0x0
L8001b598:
  lbu $v1, 660($gp)
L8001b59c:
  sll $zero, $zero, 0x0
L8001b5a0:
  sll $v0, $v1, 0x3
L8001b5a4:
  subu $v0, $v0, $v1
L8001b5a8:
  sll $v0, $v0, 0x2
L8001b5ac:
  addu $s0, $v0, $s0
L8001b5b0:
  lhu $v0, 22($s2)
L8001b5b4:
  lhu $v1, 22($s0)
L8001b5b8:
  andi $v0, $v0, 0x7e00
L8001b5bc:
  or $v1, $v1, $v0
L8001b5c0:
  andi $v0, $v1, 0xfbff
L8001b5c4:
  sh $v0, 22($s0)
L8001b5c8:
  andi $v0, $v1, 0x1000
L8001b5cc:
  bne $v0, $zero, L8001b5d8
L8001b5d0:
  andi $v0, $v1, 0xdbff
L8001b5d4:
  sh $v0, 22($s0)
L8001b5d8:
  lhu $v0, 18($s2)
L8001b5dc:
  addu $a0, $s1, $zero
L8001b5e0:
  jal 0x8004036c
L8001b5e4:
  sh $v0, 18($s0)
L8001b5e8:
  lw $v0, 0($s0)
L8001b5ec:
  sll $zero, $zero, 0x0
L8001b5f0:
  addu $s1, $v0, $zero
L8001b5f4:
  addu $a0, $s1, $zero
L8001b5f8:
  lui $v0, 0x800f
L8001b5fc:
  jal 0x80018080
L8001b600:
  sw $s1, -24848($v0)
L8001b604:
  addu $a0, $s1, $zero
L8001b608:
  addiu $v0, $zero, -240
L8001b60c:
  jal 0x80043178
L8001b610:
  sh $v0, 50($s1)
L8001b614:
  addiu $v0, $zero, -1024
L8001b618:
  j L8001b768
L8001b61c:
  sh $v0, 96($s1)
L8001b620:
  lh $a1, 48($s1)
L8001b624:
  lh $a3, 96($s1)
L8001b628:
  jal 0x80043230
L8001b62c:
  addiu $a2, $zero, -24
L8001b630:
  lhu $v0, 96($s1)
L8001b634:
  sll $zero, $zero, 0x0
L8001b638:
  addiu $v0, $v0, 42
L8001b63c:
  sh $v0, 96($s1)
L8001b640:
  sll $v0, $v0, 0x10
L8001b644:
  bltz $v0, L8001b768
L8001b648:
  addiu $v0, $zero, -24
L8001b64c:
  sh $v0, 50($s1)
L8001b650:
  addiu $v0, $zero, 5
L8001b654:
  sb $v0, 620($gp)
L8001b658:
  jal 0x8003fee0
L8001b65c:
  addiu $a0, $zero, 12
L8001b660:
  j L8001b768
L8001b664:
  sll $zero, $zero, 0x0
L8001b668:
  lh $v0, 588($gp)
L8001b66c:
  sll $zero, $zero, 0x0
L8001b670:
  beq $v0, $zero, L8001b698
L8001b674:
  addiu $v0, $zero, 5
L8001b678:
  jal 0x80025028
L8001b67c:
  addiu $a0, $zero, 689
L8001b680:
  beq $v0, $zero, L8001b694
L8001b684:
  addiu $v0, $zero, 6
L8001b688:
  sb $v0, 620($gp)
L8001b68c:
  j L8001b768
L8001b690:
  sll $zero, $zero, 0x0
L8001b694:
  addiu $v0, $zero, 5
L8001b698:
  sh $v0, 818($gp)
L8001b69c:
  j L8001b768
L8001b6a0:
  sll $zero, $zero, 0x0
L8001b6a4:
  lbu $v1, 620($gp)
L8001b6a8:
  sll $zero, $zero, 0x0
L8001b6ac:
  andi $v0, $v1, 0x80
L8001b6b0:
  bne $v0, $zero, L8001b6c0
L8001b6b4:
  ori $v0, $v1, 0xc0
L8001b6b8:
  sb $v0, 620($gp)
L8001b6bc:
  sh $zero, 776($gp)
L8001b6c0:
  lbu $v0, 620($gp)
L8001b6c4:
  sll $zero, $zero, 0x0
L8001b6c8:
  andi $v0, $v0, 0x40
L8001b6cc:
  beq $v0, $zero, L8001b734
L8001b6d0:
  addiu $v0, $zero, 5
L8001b6d4:
  jal L8001f364
L8001b6d8:
  sll $zero, $zero, 0x0
L8001b6dc:
  bne $v0, $zero, L8001b768
L8001b6e0:
  sll $zero, $zero, 0x0
L8001b6e4:
  jal 0x8002c68c
L8001b6e8:
  addiu $a0, $zero, 13
L8001b6ec:
  lhu $v1, 48($s1)
L8001b6f0:
  sll $zero, $zero, 0x0
L8001b6f4:
  sh $v1, 0($v0)
L8001b6f8:
  lhu $v1, 50($s1)
L8001b6fc:
  addiu $a0, $zero, 33
L8001b700:
  sh $v1, 2($v0)
L8001b704:
  lhu $v1, 588($gp)
L8001b708:
  lhu $a1, 52($s1)
L8001b70c:
  subu $v1, $zero, $v1
L8001b710:
  sh $v1, 18($v0)
L8001b714:
  jal 0x8003fee0
L8001b718:
  sh $a1, 4($v0)
L8001b71c:
  lbu $v0, 620($gp)
L8001b720:
  sll $zero, $zero, 0x0
L8001b724:
  andi $v0, $v0, 0xbf
L8001b728:
  sb $v0, 620($gp)
L8001b72c:
  j L8001b768
L8001b730:
  sll $zero, $zero, 0x0
L8001b734:
  lbu $a0, 106($s1)
L8001b738:
  sh $v0, 818($gp)
L8001b73c:
  lui $v0, 0x801a
L8001b740:
  addiu $v0, $v0, 31448
L8001b744:
  sll $v1, $a0, 0x3
L8001b748:
  subu $v1, $v1, $a0
L8001b74c:
  sll $v1, $v1, 0x2
L8001b750:
  addu $s0, $v1, $v0
L8001b754:
  lh $v0, 588($gp)
L8001b758:
  lhu $v1, 18($s0)
L8001b75c:
  sll $v0, $v0, 0x1
L8001b760:
  subu $v1, $v1, $v0
L8001b764:
  sh $v1, 18($s0)
L8001b768:
  lw $ra, 44($sp)
L8001b76c:
  lw $s2, 40($sp)
L8001b770:
  lw $s1, 36($sp)
L8001b774:
  lw $s0, 32($sp)
L8001b778:
  jr $ra
L8001b77c:
  addiu $sp, $sp, 48
L8001b780:
  lb $v1, 14($a0)
L8001b784:
  sll $zero, $zero, 0x0
L8001b788:
  sll $v0, $v1, 0x4
L8001b78c:
  subu $v0, $v0, $v1
L8001b790:
  sll $v0, $v0, 0x2
L8001b794:
  lw $v1, 4($a0)
L8001b798:
  addiu $v0, $v0, 14
L8001b79c:
  sh $v0, 48($v1)
L8001b7a0:
  addiu $v0, $zero, 194
L8001b7a4:
  jr $ra
L8001b7a8:
  sh $v0, 50($v1)
L8001b7ac:
  addiu $sp, $sp, -56
L8001b7b0:
  sw $s2, 48($sp)
L8001b7b4:
  addu $s2, $a0, $zero
L8001b7b8:
  sw $ra, 52($sp)
L8001b7bc:
  sw $s1, 44($sp)
L8001b7c0:
  sw $s0, 40($sp)
L8001b7c4:
  lb $v0, 14($s2)
L8001b7c8:
  sll $zero, $zero, 0x0
L8001b7cc:
  sll $s0, $v0, 0x1
L8001b7d0:
  addu $s0, $s0, $v0
L8001b7d4:
  sll $s0, $s0, 0x2
L8001b7d8:
  lui $v0, 0x800f
L8001b7dc:
  addiu $v0, $v0, -24528
L8001b7e0:
  addu $s0, $s0, $v0
L8001b7e4:
  lw $v1, 0($s0)
L8001b7e8:
  sll $zero, $zero, 0x0
L8001b7ec:
  lhu $v0, 50($v1)
L8001b7f0:
  sll $zero, $zero, 0x0
L8001b7f4:
  addiu $v0, $v0, -4
L8001b7f8:
  jal 0x8004002c
L8001b7fc:
  sh $v0, 50($v1)
L8001b800:
  addu $a0, $v0, $zero
L8001b804:
  jal 0x800400ac
L8001b808:
  addiu $a1, $zero, 1
L8001b80c:
  addu $s1, $v0, $zero
L8001b810:
  addu $a0, $s1, $zero
L8001b814:
  lw $v0, 0($s0)
L8001b818:
  addiu $a3, $zero, 16
L8001b81c:
  lh $a1, 48($v0)
L8001b820:
  lh $a2, 50($v0)
L8001b824:
  addiu $v0, $zero, 16
L8001b828:
  sw $v0, 16($sp)
L8001b82c:
  lbu $v1, 21($s2)
L8001b830:
  addiu $v0, $zero, 184
L8001b834:
  sw $v0, 24($sp)
L8001b838:
  addiu $v0, $zero, 11
L8001b83c:
  sw $v0, 28($sp)
L8001b840:
  addiu $v0, $zero, 592
L8001b844:
  sw $v0, 32($sp)
L8001b848:
  addiu $v0, $zero, 252
L8001b84c:
  sw $v0, 36($sp)
L8001b850:
  sll $v1, $v1, 0x4
L8001b854:
  jal 0x80040510
L8001b858:
  sw $v1, 20($sp)
L8001b85c:
  jal 0x80042918
L8001b860:
  addu $a0, $s1, $zero
L8001b864:
  lw $v0, 0($s0)
L8001b868:
  sll $zero, $zero, 0x0
L8001b86c:
  lbu $a1, 22($v0)
L8001b870:
  addu $a0, $s1, $zero
L8001b874:
  addiu $a1, $a1, 1
L8001b878:
  sll $a1, $a1, 0x18
L8001b87c:
  jal 0x800428ec
L8001b880:
  sra $a1, $a1, 0x18
L8001b884:
  sw $s1, 4($s0)
L8001b888:
  lbu $v0, 21($s2)
L8001b88c:
  addiu $a0, $zero, 47
L8001b890:
  addiu $v0, $v0, 1
L8001b894:
  sb $v0, 21($s2)
L8001b898:
  jal 0x8003fee0
L8001b89c:
  sb $v0, 9($s0)
L8001b8a0:
  lw $ra, 52($sp)
L8001b8a4:
  lw $s2, 48($sp)
L8001b8a8:
  lw $s1, 44($sp)
L8001b8ac:
  lw $s0, 40($sp)
L8001b8b0:
  jr $ra
L8001b8b4:
  addiu $sp, $sp, 56
L8001b8b8:
  addu $a1, $zero, $zero
L8001b8bc:
  lui $a2, 0x40
L8001b8c0:
  ori $a2, $a2, 0x4040
L8001b8c4:
  lui $v0, 0x800f
L8001b8c8:
  addiu $v1, $v0, -24528
L8001b8cc:
  lbu $v0, 9($v1)
L8001b8d0:
  sll $zero, $zero, 0x0
L8001b8d4:
  bne $v0, $zero, L8001b8e8
L8001b8d8:
  sll $zero, $zero, 0x0
L8001b8dc:
  lw $v0, 0($v1)
L8001b8e0:
  sll $zero, $zero, 0x0
L8001b8e4:
  sw $a2, 12($v0)
L8001b8e8:
  addiu $a1, $a1, 1
L8001b8ec:
  slti $v0, $a1, 5
L8001b8f0:
  bne $v0, $zero, L8001b8cc
L8001b8f4:
  addiu $v1, $v1, 12
L8001b8f8:
  lbu $v0, 21($a0)
L8001b8fc:
  sll $zero, $zero, 0x0
L8001b900:
  bne $v0, $zero, L8001b930
L8001b904:
  lui $a1, 0x80
L8001b908:
  lui $v1, 0x800f
L8001b90c:
  lb $a0, 14($a0)
L8001b910:
  addiu $v1, $v1, -24528
L8001b914:
  sll $v0, $a0, 0x1
L8001b918:
  addu $v0, $v0, $a0
L8001b91c:
  sll $v0, $v0, 0x2
L8001b920:
  addu $v0, $v0, $v1
L8001b924:
  lw $v0, 0($v0)
L8001b928:
  ori $a1, $a1, 0x8080
L8001b92c:
  sw $a1, 12($v0)
L8001b930:
  jr $ra
L8001b934:
  sll $zero, $zero, 0x0
L8001b938:
  lbu $v0, 717($gp)
L8001b93c:
  sll $zero, $zero, 0x0
L8001b940:
  sll $v1, $v0, 0x3
L8001b944:
  subu $v1, $v1, $v0
L8001b948:
  sll $v1, $v1, 0x4
L8001b94c:
  lui $v0, 0x800f
L8001b950:
  addiu $v0, $v0, -24760
L8001b954:
  addu $v1, $v1, $v0
L8001b958:
  sw $v1, 684($gp)
L8001b95c:
  sb $zero, 25($v1)
L8001b960:
  lw $v1, 684($gp)
L8001b964:
  addiu $v0, $zero, 1
L8001b968:
  sb $v0, 19($v1)
L8001b96c:
  lw $v1, 684($gp)
L8001b970:
  addiu $v0, $zero, 116
L8001b974:
  sh $v0, 12($v1)
L8001b978:
  sb $zero, 24($v1)
L8001b97c:
  lw $v1, 684($gp)
L8001b980:
  addiu $v0, $zero, 2
L8001b984:
  sb $v0, 17($v1)
L8001b988:
  lw $v0, 684($gp)
L8001b98c:
  addiu $a3, $zero, 3
L8001b990:
  sb $a3, 18($v0)
L8001b994:
  lbu $v0, 21($a0)
L8001b998:
  sll $zero, $zero, 0x0
L8001b99c:
  bne $v0, $zero, L8001ba50
L8001b9a0:
  lui $a1, 0x4
L8001b9a4:
  ori $a1, $a1, 0x8000
L8001b9a8:
  lui $v1, 0x800f
L8001b9ac:
  lb $a0, 14($a0)
L8001b9b0:
  addiu $v1, $v1, -24528
L8001b9b4:
  sll $v0, $a0, 0x1
L8001b9b8:
  addu $v0, $v0, $a0
L8001b9bc:
  sll $v0, $v0, 0x2
L8001b9c0:
  addu $v0, $v0, $v1
L8001b9c4:
  lw $a2, 0($v0)
L8001b9c8:
  lui $v1, 0x8016
L8001b9cc:
  lbu $a0, 106($a2)
L8001b9d0:
  addiu $v1, $v1, -15324
L8001b9d4:
  sll $v0, $a0, 0x3
L8001b9d8:
  subu $v0, $v0, $a0
L8001b9dc:
  sll $v0, $v0, 0x2
L8001b9e0:
  addu $v0, $v0, $v1
L8001b9e4:
  addu $v0, $v0, $a1
L8001b9e8:
  lw $v0, 14008($v0)
L8001b9ec:
  lui $v1, 0x801d
L8001b9f0:
  lh $v0, 0($v0)
L8001b9f4:
  addiu $v1, $v1, 16964
L8001b9f8:
  addiu $v0, $v0, -1
L8001b9fc:
  sll $v0, $v0, 0x2
L8001ba00:
  addu $v0, $v0, $v1
L8001ba04:
  lw $v0, 0($v0)
L8001ba08:
  sll $zero, $zero, 0x0
L8001ba0c:
  sra $v0, $v0, 0x1a
L8001ba10:
  andi $a0, $v0, 0x1f
L8001ba14:
  slti $v0, $a0, 20
L8001ba18:
  bne $v0, $zero, L8001ba50
L8001ba1c:
  sll $zero, $zero, 0x0
L8001ba20:
  lbu $v0, 33($a2)
L8001ba24:
  sll $zero, $zero, 0x0
L8001ba28:
  bne $v0, $zero, L8001ba38
L8001ba2c:
  addiu $v0, $zero, 21
L8001ba30:
  bne $a0, $v0, L8001ba50
L8001ba34:
  sll $zero, $zero, 0x0
L8001ba38:
  lw $v0, 684($gp)
L8001ba3c:
  sll $zero, $zero, 0x0
L8001ba40:
  sb $a3, 17($v0)
L8001ba44:
  lw $v1, 684($gp)
L8001ba48:
  addiu $v0, $zero, 4
L8001ba4c:
  sb $v0, 18($v1)
L8001ba50:
  lw $v1, 684($gp)
L8001ba54:
  sll $zero, $zero, 0x0
L8001ba58:
  lbu $v0, 17($v1)
L8001ba5c:
  lui $a1, 0x8009
L8001ba60:
  sb $v0, 16($v1)
L8001ba64:
  lw $v0, 684($gp)
L8001ba68:
  addiu $a1, $a1, 2008
L8001ba6c:
  lb $v0, 16($v0)
L8001ba70:
  lbu $a0, 717($gp)
L8001ba74:
  sll $v1, $v0, 0x2
L8001ba78:
  addu $v1, $v1, $v0
L8001ba7c:
  sll $v0, $a0, 0x2
L8001ba80:
  addu $v0, $v0, $a0
L8001ba84:
  sll $v0, $v0, 0x2
L8001ba88:
  addu $v1, $v1, $v0
L8001ba8c:
  addu $v1, $v1, $a1
L8001ba90:
  lbu $v0, 0($v1)
L8001ba94:
  addu $a0, $zero, $zero
L8001ba98:
  sll $v1, $v0, 0x3
L8001ba9c:
  subu $v1, $v1, $v0
L8001baa0:
  sll $v1, $v1, 0x2
L8001baa4:
  lui $v0, 0x801a
L8001baa8:
  addiu $v0, $v0, 31448
L8001baac:
  addu $v1, $v1, $v0
L8001bab0:
  lhu $v0, 22($v1)
L8001bab4:
  sll $zero, $zero, 0x0
L8001bab8:
  andi $v0, $v0, 0x8000
L8001babc:
  bne $v0, $zero, L8001bad0
L8001bac0:
  sll $zero, $zero, 0x0
L8001bac4:
  lw $v0, 684($gp)
L8001bac8:
  j L8001bae0
L8001bacc:
  sb $a0, 15($v0)
L8001bad0:
  addiu $a0, $a0, 1
L8001bad4:
  slti $v0, $a0, 5
L8001bad8:
  bne $v0, $zero, L8001bab0
L8001badc:
  addiu $v1, $v1, 28
L8001bae0:
  addiu $v0, $zero, 3
L8001bae4:
  sh $v0, 602($gp)
L8001bae8:
  jr $ra
L8001baec:
  sll $zero, $zero, 0x0
L8001baf0:
  addiu $sp, $sp, -72
L8001baf4:
  addu $a0, $zero, $zero
L8001baf8:
  addiu $a1, $sp, 16
L8001bafc:
  sw $ra, 68($sp)
L8001bb00:
  sw $fp, 64($sp)
L8001bb04:
  sw $s7, 60($sp)
L8001bb08:
  sw $s6, 56($sp)
L8001bb0c:
  sw $s5, 52($sp)
L8001bb10:
  sw $s4, 48($sp)
L8001bb14:
  sw $s3, 44($sp)
L8001bb18:
  sw $s2, 40($sp)
L8001bb1c:
  sw $s1, 36($sp)
L8001bb20:
  sw $s0, 32($sp)
L8001bb24:
  lw $v0, 704($gp)
L8001bb28:
  addu $v1, $a1, $a0
L8001bb2c:
  addu $v0, $v0, $a0
L8001bb30:
  lbu $v0, 26($v0)
L8001bb34:
  addiu $a0, $a0, 1
L8001bb38:
  sb $v0, 0($v1)
L8001bb3c:
  slti $v0, $a0, 5
L8001bb40:
  bne $v0, $zero, L8001bb24
L8001bb44:
  lui $v0, 0x800f
L8001bb48:
  addu $a0, $zero, $zero
L8001bb4c:
  addiu $a3, $v0, -20856
L8001bb50:
  addiu $v1, $sp, 16
L8001bb54:
  addiu $a2, $zero, -1
L8001bb58:
  addu $v0, $a0, $a3
L8001bb5c:
  lbu $a1, 0($v0)
L8001bb60:
  sll $zero, $zero, 0x0
L8001bb64:
  beq $a1, $zero, L8001bb88
L8001bb68:
  slti $v0, $a1, 16
L8001bb6c:
  beq $v0, $zero, L8001bb78
L8001bb70:
  addu $v0, $a1, $v1
L8001bb74:
  sb $a2, -11($v0)
L8001bb78:
  addiu $a0, $a0, 1
L8001bb7c:
  slti $v0, $a0, 5
L8001bb80:
  bne $v0, $zero, L8001bb5c
L8001bb84:
  addu $v0, $a0, $a3
L8001bb88:
  lui $t0, 0x801b
L8001bb8c:
  addiu $t0, $t0, -20480
L8001bb90:
  addiu $fp, $t0, -12768
L8001bb94:
  lui $s6, 0x800f
L8001bb98:
  addiu $s6, $s6, -20856
L8001bb9c:
  lbu $a1, 0($s6)
L8001bba0:
  sll $zero, $zero, 0x0
L8001bba4:
  beq $a1, $zero, L8001bd18
L8001bba8:
  slti $v0, $a1, 16
L8001bbac:
  bne $v0, $zero, L8001bcfc
L8001bbb0:
  lui $v0, 0x8009
L8001bbb4:
  addu $s3, $zero, $zero
L8001bbb8:
  addiu $a0, $v0, 1996
L8001bbbc:
  lui $v0, 0x801a
L8001bbc0:
  addiu $s7, $v0, 31448
L8001bbc4:
  lui $v0, 0x800f
L8001bbc8:
  addiu $s4, $v0, -24528
L8001bbcc:
  addiu $v0, $sp, 16
L8001bbd0:
  addu $s5, $v0, $s3
L8001bbd4:
  lb $v1, 0($s5)
L8001bbd8:
  sll $zero, $zero, 0x0
L8001bbdc:
  bltz $v1, L8001bcec
L8001bbe0:
  sll $v0, $a1, 0x1
L8001bbe4:
  addu $v0, $v0, $a1
L8001bbe8:
  sll $v0, $v0, 0x2
L8001bbec:
  lui $t1, 0x801b
L8001bbf0:
  addiu $t1, $t1, -20480
L8001bbf4:
  addu $v0, $v0, $t1
L8001bbf8:
  sll $s0, $v1, 0x1
L8001bbfc:
  addu $s0, $s0, $v1
L8001bc00:
  sll $s0, $s0, 0x1
L8001bc04:
  addu $s0, $s0, $fp
L8001bc08:
  lbu $v1, 11($v0)
L8001bc0c:
  lb $a1, 2($s0)
L8001bc10:
  sll $v0, $v1, 0x1
L8001bc14:
  addu $v0, $v0, $v1
L8001bc18:
  sll $v0, $v0, 0x1
L8001bc1c:
  addu $v0, $v0, $fp
L8001bc20:
  lbu $v1, 2($v0)
L8001bc24:
  sll $zero, $zero, 0x0
L8001bc28:
  sb $v1, 2($s0)
L8001bc2c:
  sb $a1, 2($v0)
L8001bc30:
  lbu $v1, 717($gp)
L8001bc34:
  lwl $t2, 3($s0)
L8001bc38:
  lwr $t2, 0($s0)
L8001bc3c:
  lh $t3, 4($s0)
L8001bc40:
  swl $t2, 27($sp)
L8001bc44:
  swr $t2, 24($sp)
L8001bc48:
  sh $t3, 28($sp)
L8001bc4c:
  lwl $t2, 3($v0)
L8001bc50:
  lwr $t2, 0($v0)
L8001bc54:
  lh $t3, 4($v0)
L8001bc58:
  swl $t2, 3($s0)
L8001bc5c:
  swr $t2, 0($s0)
L8001bc60:
  sh $t3, 4($s0)
L8001bc64:
  lwl $t2, 27($sp)
L8001bc68:
  lwr $t2, 24($sp)
L8001bc6c:
  lh $t3, 28($sp)
L8001bc70:
  swl $t2, 3($v0)
L8001bc74:
  swr $t2, 0($v0)
L8001bc78:
  sh $t3, 4($v0)
L8001bc7c:
  lb $a1, 2($s0)
L8001bc80:
  sll $v0, $v1, 0x2
L8001bc84:
  addu $v0, $v0, $v1
L8001bc88:
  addu $v0, $s3, $v0
L8001bc8c:
  addu $v0, $v0, $a0
L8001bc90:
  lbu $s1, 0($v0)
L8001bc94:
  lw $s2, 0($s4)
L8001bc98:
  jal 0x800249e0
L8001bc9c:
  addu $a0, $s1, $zero
L8001bca0:
  sll $a0, $s1, 0x3
L8001bca4:
  subu $a0, $a0, $s1
L8001bca8:
  sll $a0, $a0, 0x2
L8001bcac:
  lh $a1, 48($s2)
L8001bcb0:
  lh $a2, 50($s2)
L8001bcb4:
  jal 0x80018004
L8001bcb8:
  addu $a0, $a0, $s7
L8001bcbc:
  addu $a0, $s2, $zero
L8001bcc0:
  jal 0x8004036c
L8001bcc4:
  sw $v0, 0($s4)
L8001bcc8:
  lw $v0, 704($gp)
L8001bccc:
  lbu $v1, 2($s0)
L8001bcd0:
  addu $v0, $v0, $s3
L8001bcd4:
  sb $v1, 26($v0)
L8001bcd8:
  addiu $v0, $s3, 11
L8001bcdc:
  sb $v0, 0($s6)
L8001bce0:
  addiu $v0, $zero, -1
L8001bce4:
  j L8001bcfc
L8001bce8:
  sb $v0, 0($s5)
L8001bcec:
  addiu $s3, $s3, 1
L8001bcf0:
  slti $v0, $s3, 5
L8001bcf4:
  bne $v0, $zero, L8001bbcc
L8001bcf8:
  addiu $s4, $s4, 12
L8001bcfc:
  addiu $s6, $s6, 1
L8001bd00:
  lui $t2, 0x800f
L8001bd04:
  addiu $t2, $t2, -20856
L8001bd08:
  addiu $v0, $t2, 5
L8001bd0c:
  slt $v0, $s6, $v0
L8001bd10:
  bne $v0, $zero, L8001bb9c
L8001bd14:
  sll $zero, $zero, 0x0
L8001bd18:
  lw $ra, 68($sp)
L8001bd1c:
  lw $fp, 64($sp)
L8001bd20:
  lw $s7, 60($sp)
L8001bd24:
  lw $s6, 56($sp)
L8001bd28:
  lw $s5, 52($sp)
L8001bd2c:
  lw $s4, 48($sp)
L8001bd30:
  lw $s3, 44($sp)
L8001bd34:
  lw $s2, 40($sp)
L8001bd38:
  lw $s1, 36($sp)
L8001bd3c:
  lw $s0, 32($sp)
L8001bd40:
  jr $ra
L8001bd44:
  addiu $sp, $sp, 72
L8001bd48:
  lui $v0, 0x800a
L8001bd4c:
  lb $v0, -19615($v0)
L8001bd50:
  sll $zero, $zero, 0x0
L8001bd54:
  bgez $v0, L8001bd80
L8001bd58:
  sll $zero, $zero, 0x0
L8001bd5c:
  lui $v0, 0x800a
L8001bd60:
  lhu $v0, -19560($v0)
L8001bd64:
  sll $zero, $zero, 0x0
L8001bd68:
  andi $v0, $v0, 0x100
L8001bd6c:
  beq $v0, $zero, L8001bd80
L8001bd70:
  addiu $v0, $zero, 1
L8001bd74:
  sb $v0, 604($gp)
L8001bd78:
  jr $ra
L8001bd7c:
  addiu $v0, $zero, 1
L8001bd80:
  jr $ra
L8001bd84:
  addu $v0, $zero, $zero
L8001bd88:
  lbu $v1, 717($gp)
L8001bd8c:
  addiu $sp, $sp, -64
L8001bd90:
  sw $ra, 56($sp)
L8001bd94:
  sw $s5, 52($sp)
L8001bd98:
  sw $s4, 48($sp)
L8001bd9c:
  sw $s3, 44($sp)
L8001bda0:
  sw $s2, 40($sp)
L8001bda4:
  sw $s1, 36($sp)
L8001bda8:
  sw $s0, 32($sp)
L8001bdac:
  sll $v0, $v1, 0x3
L8001bdb0:
  subu $v0, $v0, $v1
L8001bdb4:
  sll $v0, $v0, 0x4
L8001bdb8:
  lui $v1, 0x800f
L8001bdbc:
  addiu $s0, $v1, -24816
L8001bdc0:
  lhu $v1, 818($gp)
L8001bdc4:
  addu $s2, $v0, $s0
L8001bdc8:
  andi $v0, $v1, 0x8000
L8001bdcc:
  bne $v0, $zero, L8001bed4
L8001bdd0:
  ori $v0, $v1, 0x8000
L8001bdd4:
  sh $v0, 818($gp)
L8001bdd8:
  addiu $a1, $zero, 6
L8001bddc:
  lui $v0, 0x800f
L8001bde0:
  addiu $v0, $v0, -24848
L8001bde4:
  addiu $v0, $v0, 24
L8001bde8:
  sw $zero, 0($v0)
L8001bdec:
  addiu $a1, $a1, -1
L8001bdf0:
  bgez $a1, L8001bde8
L8001bdf4:
  addiu $v0, $v0, -4
L8001bdf8:
  sw $zero, 644($gp)
L8001bdfc:
  sw $zero, 640($gp)
L8001be00:
  sw $s2, 684($gp)
L8001be04:
  sh $zero, 602($gp)
L8001be08:
  sb $zero, 14($s2)
L8001be0c:
  jal 0x8004002c
L8001be10:
  sb $zero, 21($s2)
L8001be14:
  addu $a0, $v0, $zero
L8001be18:
  jal 0x800400ac
L8001be1c:
  addiu $a1, $zero, 2
L8001be20:
  addu $s3, $v0, $zero
L8001be24:
  addu $a0, $s3, $zero
L8001be28:
  addiu $a1, $zero, 3
L8001be2c:
  addu $a2, $zero, $zero
L8001be30:
  addiu $a3, $zero, 2
L8001be34:
  addiu $v0, $zero, 11
L8001be38:
  sw $v0, 16($sp)
L8001be3c:
  addiu $v0, $zero, 524
L8001be40:
  jal 0x80040468
L8001be44:
  sw $v0, 20($sp)
L8001be48:
  lhu $v0, 8($s3)
L8001be4c:
  addu $a0, $s3, $zero
L8001be50:
  ori $v0, $v0, 0x28
L8001be54:
  jal 0x80042918
L8001be58:
  sh $v0, 8($s3)
L8001be5c:
  addu $a0, $s3, $zero
L8001be60:
  jal 0x800428ec
L8001be64:
  addiu $a1, $zero, 10
L8001be68:
  addu $a0, $s2, $zero
L8001be6c:
  jal L8001b780
L8001be70:
  sw $s3, 4($s2)
L8001be74:
  lui $a0, 0x8009
L8001be78:
  addiu $a0, $a0, 1996
L8001be7c:
  lbu $a1, 717($gp)
L8001be80:
  lb $v0, 14($s2)
L8001be84:
  sll $v1, $a1, 0x2
L8001be88:
  addu $v1, $v1, $a1
L8001be8c:
  addu $v0, $v0, $v1
L8001be90:
  addu $v0, $v0, $a0
L8001be94:
  lbu $a1, 0($v0)
L8001be98:
  jal 0x80023144
L8001be9c:
  addu $a0, $s2, $zero
L8001bea0:
  addiu $v0, $zero, 1
L8001bea4:
  sb $v0, 620($gp)
L8001bea8:
  lbu $v0, 717($gp)
L8001beac:
  lui $v1, 0x800a
L8001beb0:
  addiu $v1, $v1, -19616
L8001beb4:
  addu $v0, $v0, $v1
L8001beb8:
  lb $v0, 0($v0)
L8001bebc:
  sll $zero, $zero, 0x0
L8001bec0:
  bltz $v0, L8001d21c
L8001bec4:
  addiu $v0, $zero, 2
L8001bec8:
  sb $v0, 620($gp)
L8001becc:
  j L8001d21c
L8001bed0:
  sll $zero, $zero, 0x0
L8001bed4:
  andi $v0, $v1, 0x4000
L8001bed8:
  beq $v0, $zero, L8001bf24
L8001bedc:
  sll $zero, $zero, 0x0
L8001bee0:
  lw $a0, 684($gp)
L8001bee4:
  jal 0x800240b0
L8001bee8:
  sll $zero, $zero, 0x0
L8001beec:
  lbu $v0, 716($gp)
L8001bef0:
  sll $zero, $zero, 0x0
L8001bef4:
  bne $v0, $zero, L8001d21c
L8001bef8:
  sll $zero, $zero, 0x0
L8001befc:
  lbu $v0, 717($gp)
L8001bf00:
  sll $zero, $zero, 0x0
L8001bf04:
  sll $v1, $v0, 0x3
L8001bf08:
  subu $v1, $v1, $v0
L8001bf0c:
  sll $v1, $v1, 0x4
L8001bf10:
  lhu $v0, 818($gp)
L8001bf14:
  addu $v1, $v1, $s0
L8001bf18:
  sw $v1, 684($gp)
L8001bf1c:
  j L8001d218
L8001bf20:
  andi $v0, $v0, 0xbfff
L8001bf24:
  lb $v0, 14($s2)
L8001bf28:
  lbu $v1, 620($gp)
L8001bf2c:
  sll $a0, $v0, 0x1
L8001bf30:
  addu $a0, $a0, $v0
L8001bf34:
  sll $a0, $a0, 0x2
L8001bf38:
  lui $v0, 0x800f
L8001bf3c:
  addiu $v0, $v0, -24528
L8001bf40:
  addu $s4, $a0, $v0
L8001bf44:
  andi $v1, $v1, 0xf
L8001bf48:
  addiu $v1, $v1, -1
L8001bf4c:
  sltiu $v0, $v1, 6
L8001bf50:
  beq $v0, $zero, L8001d21c
L8001bf54:
  lui $v0, 0x8001
L8001bf58:
  addiu $v0, $v0, 328
L8001bf5c:
  sll $v1, $v1, 0x2
L8001bf60:
  addu $v1, $v1, $v0
L8001bf64:
  lw $v0, 0($v1)
L8001bf68:
  sll $zero, $zero, 0x0
L8001bf6c:
  jr $v0
L8001bf70:
  sll $zero, $zero, 0x0
L8001bf74:
  lbu $v1, 620($gp)
L8001bf78:
  sll $zero, $zero, 0x0
L8001bf7c:
  andi $v0, $v1, 0x80
L8001bf80:
  bne $v0, $zero, L8001bf90
L8001bf84:
  ori $v0, $v1, 0x80
L8001bf88:
  sb $v0, 620($gp)
L8001bf8c:
  sh $zero, 772($gp)
L8001bf90:
  lhu $v1, 772($gp)
L8001bf94:
  addiu $s0, $zero, 1
L8001bf98:
  andi $a0, $v1, 0xf
L8001bf9c:
  beq $a0, $s0, L8001c040
L8001bfa0:
  slti $v0, $a0, 2
L8001bfa4:
  beq $v0, $zero, L8001bfbc
L8001bfa8:
  sll $zero, $zero, 0x0
L8001bfac:
  beq $a0, $zero, L8001bfd8
L8001bfb0:
  andi $v0, $v1, 0x8000
L8001bfb4:
  j L8001d21c
L8001bfb8:
  sll $zero, $zero, 0x0
L8001bfbc:
  addiu $s0, $zero, 2
L8001bfc0:
  beq $a0, $s0, L8001c1b0
L8001bfc4:
  addiu $v0, $zero, 3
L8001bfc8:
  beq $a0, $v0, L8001c478
L8001bfcc:
  sll $zero, $zero, 0x0
L8001bfd0:
  j L8001d21c
L8001bfd4:
  sll $zero, $zero, 0x0
L8001bfd8:
  bne $v0, $zero, L8001c000
L8001bfdc:
  ori $v0, $v1, 0x8000
L8001bfe0:
  sh $v0, 772($gp)
L8001bfe4:
  jal 0x80028220
L8001bfe8:
  sll $zero, $zero, 0x0
L8001bfec:
  lui $a0, 0x801b
L8001bff0:
  jal 0x800705d8
L8001bff4:
  addiu $a0, $a0, -32768
L8001bff8:
  j L8001d21c
L8001bffc:
  sll $zero, $zero, 0x0
L8001c000:
  jal 0x80070650
L8001c004:
  sll $zero, $zero, 0x0
L8001c008:
  beq $v0, $zero, L8001d21c
L8001c00c:
  lui $v0, 0x800f
L8001c010:
  lbu $v1, -20855($v0)
L8001c014:
  addiu $v0, $zero, -1
L8001c018:
  sb $v0, 730($gp)
L8001c01c:
  sh $zero, 662($gp)
L8001c020:
  beq $v1, $zero, L8001c02c
L8001c024:
  sll $zero, $zero, 0x0
L8001c028:
  sh $s0, 662($gp)
L8001c02c:
  sh $s0, 772($gp)
L8001c030:
  jal L8001baf0
L8001c034:
  sll $zero, $zero, 0x0
L8001c038:
  j L8001d21c
L8001c03c:
  sll $zero, $zero, 0x0
L8001c040:
  andi $v0, $v1, 0x8000
L8001c044:
  bne $v0, $zero, L8001c0e0
L8001c048:
  ori $v1, $v1, 0x8000
L8001c04c:
  sh $v1, 772($gp)
L8001c050:
  lui $v1, 0x800f
L8001c054:
  lbu $v0, 730($gp)
L8001c058:
  addiu $v1, $v1, -20856
L8001c05c:
  addiu $v0, $v0, 1
L8001c060:
  sb $v0, 730($gp)
L8001c064:
  sll $v0, $v0, 0x18
L8001c068:
  sra $v0, $v0, 0x18
L8001c06c:
  addu $v0, $v0, $v1
L8001c070:
  lbu $s0, 0($v0)
L8001c074:
  sll $zero, $zero, 0x0
L8001c078:
  bne $s0, $zero, L8001c0b8
L8001c07c:
  slti $v0, $s0, 11
L8001c080:
  jal L8001b8b8
L8001c084:
  addu $a0, $s2, $zero
L8001c088:
  lhu $v0, 662($gp)
L8001c08c:
  addiu $v1, $zero, 2
L8001c090:
  sh $v1, 772($gp)
L8001c094:
  andi $v0, $v0, 0x1
L8001c098:
  sh $v0, 662($gp)
L8001c09c:
  beq $v0, $zero, L8001c0a8
L8001c0a0:
  addiu $v0, $zero, 3
L8001c0a4:
  sh $v0, 772($gp)
L8001c0a8:
  jal 0x8003fee0
L8001c0ac:
  addiu $a0, $zero, 7
L8001c0b0:
  j L8001d21c
L8001c0b4:
  sll $zero, $zero, 0x0
L8001c0b8:
  beq $v0, $zero, L8001c0d0
L8001c0bc:
  lui $a0, 0x8001
L8001c0c0:
  jal 0x8008e870
L8001c0c4:
  addiu $a0, $a0, 96
L8001c0c8:
  j L8001d21c
L8001c0cc:
  sll $zero, $zero, 0x0
L8001c0d0:
  addiu $v0, $s0, -11
L8001c0d4:
  sb $v0, 770($gp)
L8001c0d8:
  addiu $v0, $zero, 6
L8001c0dc:
  sh $v0, 732($gp)
L8001c0e0:
  lhu $v0, 732($gp)
L8001c0e4:
  sll $zero, $zero, 0x0
L8001c0e8:
  addiu $v0, $v0, -1
L8001c0ec:
  sh $v0, 732($gp)
L8001c0f0:
  sll $v0, $v0, 0x10
L8001c0f4:
  bgtz $v0, L8001d21c
L8001c0f8:
  addiu $v0, $zero, 6
L8001c0fc:
  sh $v0, 732($gp)
L8001c100:
  lb $v1, 14($s2)
L8001c104:
  lb $v0, 770($gp)
L8001c108:
  sll $zero, $zero, 0x0
L8001c10c:
  beq $v1, $v0, L8001c17c
L8001c110:
  sll $zero, $zero, 0x0
L8001c114:
  jal 0x8003fee0
L8001c118:
  addiu $a0, $zero, 6
L8001c11c:
  lb $v1, 14($s2)
L8001c120:
  lb $v0, 770($gp)
L8001c124:
  sll $zero, $zero, 0x0
L8001c128:
  slt $v0, $v0, $v1
L8001c12c:
  lbu $v1, 14($s2)
L8001c130:
  bne $v0, $zero, L8001c13c
L8001c134:
  addiu $v0, $v1, -1
L8001c138:
  addiu $v0, $v1, 1
L8001c13c:
  sb $v0, 14($s2)
L8001c140:
  jal L8001b780
L8001c144:
  addu $a0, $s2, $zero
L8001c148:
  lui $a0, 0x8009
L8001c14c:
  addiu $a0, $a0, 1996
L8001c150:
  lbu $a1, 717($gp)
L8001c154:
  lb $v0, 14($s2)
L8001c158:
  sll $v1, $a1, 0x2
L8001c15c:
  addu $v1, $v1, $a1
L8001c160:
  addu $v0, $v0, $v1
L8001c164:
  addu $v0, $v0, $a0
L8001c168:
  lbu $a1, 0($v0)
L8001c16c:
  jal 0x80023144
L8001c170:
  addu $a0, $s2, $zero
L8001c174:
  j L8001d21c
L8001c178:
  sll $zero, $zero, 0x0
L8001c17c:
  lhu $v0, 662($gp)
L8001c180:
  sll $zero, $zero, 0x0
L8001c184:
  andi $v0, $v0, 0x1
L8001c188:
  beq $v0, $zero, L8001c198
L8001c18c:
  sll $zero, $zero, 0x0
L8001c190:
  jal L8001b7ac
L8001c194:
  addu $a0, $s2, $zero
L8001c198:
  lhu $v0, 772($gp)
L8001c19c:
  sll $zero, $zero, 0x0
L8001c1a0:
  andi $v0, $v0, 0x7fff
L8001c1a4:
  sh $v0, 772($gp)
L8001c1a8:
  j L8001d21c
L8001c1ac:
  sll $zero, $zero, 0x0
L8001c1b0:
  lw $s3, 0($s4)
L8001c1b4:
  andi $v0, $v1, 0x8000
L8001c1b8:
  bne $v0, $zero, L8001c2a4
L8001c1bc:
  andi $v0, $v1, 0x4000
L8001c1c0:
  lui $a1, 0x4
L8001c1c4:
  ori $a1, $a1, 0x8000
L8001c1c8:
  ori $v0, $v1, 0xc000
L8001c1cc:
  lui $v1, 0x8016
L8001c1d0:
  sh $v0, 772($gp)
L8001c1d4:
  lbu $a0, 106($s3)
L8001c1d8:
  addiu $v1, $v1, -15324
L8001c1dc:
  sll $v0, $a0, 0x3
L8001c1e0:
  subu $v0, $v0, $a0
L8001c1e4:
  sll $v0, $v0, 0x2
L8001c1e8:
  addu $v0, $v0, $v1
L8001c1ec:
  addu $v0, $v0, $a1
L8001c1f0:
  lui $v1, 0x801d
L8001c1f4:
  lh $a0, 14016($v0)
L8001c1f8:
  addiu $v1, $v1, 16964
L8001c1fc:
  addiu $v0, $a0, -1
L8001c200:
  sll $v0, $v0, 0x2
L8001c204:
  addu $v0, $v0, $v1
L8001c208:
  lw $v0, 0($v0)
L8001c20c:
  sll $zero, $zero, 0x0
L8001c210:
  sra $v0, $v0, 0x1a
L8001c214:
  andi $v0, $v0, 0x1f
L8001c218:
  slti $v0, $v0, 20
L8001c21c:
  beq $v0, $zero, L8001c244
L8001c220:
  lui $v0, 0x800f
L8001c224:
  lbu $v0, -20848($v0)
L8001c228:
  sll $zero, $zero, 0x0
L8001c22c:
  bne $v0, $zero, L8001c248
L8001c230:
  addu $a0, $s3, $zero
L8001c234:
  addiu $v0, $zero, 3
L8001c238:
  sh $v0, 772($gp)
L8001c23c:
  j L8001d21c
L8001c240:
  sll $zero, $zero, 0x0
L8001c244:
  addu $a0, $s3, $zero
L8001c248:
  addiu $v0, $zero, 134
L8001c24c:
  sh $v0, 40($a0)
L8001c250:
  addiu $v0, $zero, 90
L8001c254:
  sh $v0, 42($a0)
L8001c258:
  addiu $v0, $zero, 16
L8001c25c:
  sh $v0, 44($a0)
L8001c260:
  addiu $v0, $zero, 1
L8001c264:
  sb $v0, 108($a0)
L8001c268:
  lui $v0, 0x8002
L8001c26c:
  lbu $a1, 22($a0)
L8001c270:
  addiu $v0, $v0, -5008
L8001c274:
  sw $v0, 36($a0)
L8001c278:
  addiu $a1, $a1, 4
L8001c27c:
  sll $a1, $a1, 0x18
L8001c280:
  jal 0x800428ec
L8001c284:
  sra $a1, $a1, 0x18
L8001c288:
  lw $v1, 4($s2)
L8001c28c:
  sll $zero, $zero, 0x0
L8001c290:
  lhu $v0, 8($v1)
L8001c294:
  sll $zero, $zero, 0x0
L8001c298:
  andi $v0, $v0, 0xffbf
L8001c29c:
  j L8001d21c
L8001c2a0:
  sh $v0, 8($v1)
L8001c2a4:
  beq $v0, $zero, L8001c358
L8001c2a8:
  andi $v0, $v1, 0x2000
L8001c2ac:
  jal 0x80042b40
L8001c2b0:
  addiu $a0, $zero, 1
L8001c2b4:
  bne $v0, $zero, L8001d21c
L8001c2b8:
  sll $zero, $zero, 0x0
L8001c2bc:
  lhu $v0, 772($gp)
L8001c2c0:
  sll $zero, $zero, 0x0
L8001c2c4:
  andi $v1, $v0, 0xbfff
L8001c2c8:
  andi $v0, $v0, 0x1000
L8001c2cc:
  sh $v1, 772($gp)
L8001c2d0:
  beq $v0, $zero, L8001c310
L8001c2d4:
  addu $a0, $s3, $zero
L8001c2d8:
  lbu $a1, 22($s3)
L8001c2dc:
  sll $zero, $zero, 0x0
L8001c2e0:
  addiu $a1, $a1, -4
L8001c2e4:
  sll $a1, $a1, 0x18
L8001c2e8:
  jal 0x800428ec
L8001c2ec:
  sra $a1, $a1, 0x18
L8001c2f0:
  lw $a0, 4($s2)
L8001c2f4:
  sll $zero, $zero, 0x0
L8001c2f8:
  lhu $v0, 8($a0)
L8001c2fc:
  addiu $v1, $zero, 3
L8001c300:
  sh $v1, 772($gp)
L8001c304:
  ori $v0, $v0, 0x40
L8001c308:
  j L8001d21c
L8001c30c:
  sh $v0, 8($a0)
L8001c310:
  lhu $v0, 54($s3)
L8001c314:
  lhu $v1, 56($s3)
L8001c318:
  sh $v0, 44($s3)
L8001c31c:
  lui $v0, 0x800f
L8001c320:
  sh $v1, 46($s3)
L8001c324:
  lbu $v0, -20848($v0)
L8001c328:
  sll $zero, $zero, 0x0
L8001c32c:
  beq $v0, $zero, L8001d21c
L8001c330:
  sll $zero, $zero, 0x0
L8001c334:
  jal 0x8003fee0
L8001c338:
  addiu $a0, $zero, 11
L8001c33c:
  lhu $v0, 772($gp)
L8001c340:
  lhu $v1, 8($s3)
L8001c344:
  ori $v0, $v0, 0x2000
L8001c348:
  ori $v1, $v1, 0x4
L8001c34c:
  sh $v0, 772($gp)
L8001c350:
  j L8001d21c
L8001c354:
  sh $v1, 8($s3)
L8001c358:
  beq $v0, $zero, L8001c3b8
L8001c35c:
  lui $a1, 0x4
L8001c360:
  lbu $v0, 33($s3)
L8001c364:
  sll $zero, $zero, 0x0
L8001c368:
  addiu $v0, $v0, 8
L8001c36c:
  sb $v0, 33($s3)
L8001c370:
  sll $v0, $v0, 0x18
L8001c374:
  bgez $v0, L8001d21c
L8001c378:
  addiu $v0, $zero, 128
L8001c37c:
  lui $v1, 0x801a
L8001c380:
  lbu $a0, 106($s3)
L8001c384:
  addiu $v1, $v1, 31448
L8001c388:
  sb $v0, 33($s3)
L8001c38c:
  sll $v0, $a0, 0x3
L8001c390:
  subu $v0, $v0, $a0
L8001c394:
  sll $v0, $v0, 0x2
L8001c398:
  addu $v0, $v0, $v1
L8001c39c:
  lhu $v1, 772($gp)
L8001c3a0:
  lhu $a0, 22($v0)
L8001c3a4:
  andi $v1, $v1, 0xdfff
L8001c3a8:
  ori $a0, $a0, 0x1000
L8001c3ac:
  sh $v1, 772($gp)
L8001c3b0:
  j L8001d21c
L8001c3b4:
  sh $a0, 22($v0)
L8001c3b8:
  ori $a1, $a1, 0x8000
L8001c3bc:
  lui $v1, 0x8016
L8001c3c0:
  lbu $a0, 106($s3)
L8001c3c4:
  addiu $v1, $v1, -15324
L8001c3c8:
  sll $v0, $a0, 0x3
L8001c3cc:
  subu $v0, $v0, $a0
L8001c3d0:
  sll $v0, $v0, 0x2
L8001c3d4:
  addu $v0, $v0, $v1
L8001c3d8:
  addu $v0, $v0, $a1
L8001c3dc:
  lui $v1, 0x801d
L8001c3e0:
  lh $a0, 14016($v0)
L8001c3e4:
  addiu $v1, $v1, 16964
L8001c3e8:
  addiu $v0, $a0, -1
L8001c3ec:
  sll $v0, $v0, 0x2
L8001c3f0:
  addu $v0, $v0, $v1
L8001c3f4:
  lw $v0, 0($v0)
L8001c3f8:
  sll $zero, $zero, 0x0
L8001c3fc:
  sra $v0, $v0, 0x1a
L8001c400:
  andi $s0, $v0, 0x1f
L8001c404:
  slti $v0, $s0, 20
L8001c408:
  bne $v0, $zero, L8001c448
L8001c40c:
  lui $v0, 0x8002
L8001c410:
  lbu $v0, 33($s3)
L8001c414:
  sll $zero, $zero, 0x0
L8001c418:
  bne $v0, $zero, L8001c448
L8001c41c:
  lui $v0, 0x8002
L8001c420:
  addiu $v0, $zero, 23
L8001c424:
  beq $s0, $v0, L8001c444
L8001c428:
  addiu $v0, $zero, 21
L8001c42c:
  beq $s0, $v0, L8001c444
L8001c430:
  lui $v0, 0x800f
L8001c434:
  sw $s3, -24848($v0)
L8001c438:
  lw $v0, 704($gp)
L8001c43c:
  j L8001cd90
L8001c440:
  sll $zero, $zero, 0x0
L8001c444:
  lui $v0, 0x8002
L8001c448:
  lhu $v1, 772($gp)
L8001c44c:
  addiu $v0, $v0, -5008
L8001c450:
  sw $v0, 36($s3)
L8001c454:
  ori $v1, $v1, 0x5000
L8001c458:
  sh $v1, 772($gp)
L8001c45c:
  lw $v1, 44($s3)
L8001c460:
  addiu $v0, $zero, 16
L8001c464:
  sh $v0, 44($s3)
L8001c468:
  addiu $v0, $zero, 1
L8001c46c:
  sb $v0, 108($s3)
L8001c470:
  j L8001d21c
L8001c474:
  sw $v1, 40($s3)
L8001c478:
  lhu $v0, 602($gp)
L8001c47c:
  sll $zero, $zero, 0x0
L8001c480:
  bne $v0, $zero, L8001c4cc
L8001c484:
  addiu $v0, $zero, -1
L8001c488:
  andi $v0, $v1, 0x8000
L8001c48c:
  bne $v0, $zero, L8001c4d8
L8001c490:
  ori $v0, $v1, 0xc000
L8001c494:
  sh $v0, 772($gp)
L8001c498:
  jal L8001b938
L8001c49c:
  addu $a0, $s2, $zero
L8001c4a0:
  lui $v0, 0x800f
L8001c4a4:
  lbu $v1, -20850($v0)
L8001c4a8:
  sll $zero, $zero, 0x0
L8001c4ac:
  addiu $v0, $v1, -6
L8001c4b0:
  sb $v0, 770($gp)
L8001c4b4:
  sll $v0, $v0, 0x18
L8001c4b8:
  bgez $v0, L8001c4cc
L8001c4bc:
  addiu $v0, $zero, -1
L8001c4c0:
  addiu $v0, $v1, -1
L8001c4c4:
  sb $v0, 770($gp)
L8001c4c8:
  addiu $v0, $zero, -1
L8001c4cc:
  sb $v0, 600($gp)
L8001c4d0:
  j L8001d21c
L8001c4d4:
  sll $zero, $zero, 0x0
L8001c4d8:
  lw $a0, 684($gp)
L8001c4dc:
  lb $a1, 600($gp)
L8001c4e0:
  jal 0x80024088
L8001c4e4:
  sll $zero, $zero, 0x0
L8001c4e8:
  bne $v0, $zero, L8001d21c
L8001c4ec:
  sll $zero, $zero, 0x0
L8001c4f0:
  lw $a0, 684($gp)
L8001c4f4:
  lb $v1, 770($gp)
L8001c4f8:
  lb $v0, 15($a0)
L8001c4fc:
  sll $zero, $zero, 0x0
L8001c500:
  beq $v0, $v1, L8001cf74
L8001c504:
  sll $zero, $zero, 0x0
L8001c508:
  sb $zero, 600($gp)
L8001c50c:
  lb $v0, 15($a0)
L8001c510:
  sll $zero, $zero, 0x0
L8001c514:
  slt $v0, $v1, $v0
L8001c518:
  beq $v0, $zero, L8001d21c
L8001c51c:
  sll $zero, $zero, 0x0
L8001c520:
  sb $s0, 600($gp)
L8001c524:
  j L8001d21c
L8001c528:
  sll $zero, $zero, 0x0
L8001c52c:
  lbu $v1, 620($gp)
L8001c530:
  sll $zero, $zero, 0x0
L8001c534:
  andi $v0, $v1, 0x80
L8001c538:
  bne $v0, $zero, L8001c570
L8001c53c:
  ori $v0, $v1, 0x80
L8001c540:
  sb $v0, 620($gp)
L8001c544:
  addu $a1, $zero, $zero
L8001c548:
  lui $a0, 0x80
L8001c54c:
  ori $a0, $a0, 0x8080
L8001c550:
  lui $v0, 0x800f
L8001c554:
  addiu $v1, $v0, -24528
L8001c558:
  lw $v0, 0($v1)
L8001c55c:
  addiu $a1, $a1, 1
L8001c560:
  sw $a0, 12($v0)
L8001c564:
  slti $v0, $a1, 5
L8001c568:
  bne $v0, $zero, L8001c558
L8001c56c:
  addiu $v1, $v1, 12
L8001c570:
  jal L8001bd48
L8001c574:
  sll $zero, $zero, 0x0
L8001c578:
  bne $v0, $zero, L8001d21c
L8001c57c:
  sll $zero, $zero, 0x0
L8001c580:
  lui $v0, 0x800a
L8001c584:
  lhu $v0, -19560($v0)
L8001c588:
  sll $zero, $zero, 0x0
L8001c58c:
  andi $v0, $v0, 0x10
L8001c590:
  beq $v0, $zero, L8001c608
L8001c594:
  lui $a2, 0x4
L8001c598:
  ori $a2, $a2, 0x8000
L8001c59c:
  lui $a0, 0x8009
L8001c5a0:
  addiu $a0, $a0, 1996
L8001c5a4:
  lbu $a1, 717($gp)
L8001c5a8:
  lb $v0, 14($s2)
L8001c5ac:
  sll $v1, $a1, 0x2
L8001c5b0:
  addu $v1, $v1, $a1
L8001c5b4:
  addu $v0, $v0, $v1
L8001c5b8:
  addu $v0, $v0, $a0
L8001c5bc:
  lbu $a0, 0($v0)
L8001c5c0:
  addiu $v0, $zero, 20
L8001c5c4:
  lui $v1, 0x8016
L8001c5c8:
  addiu $v1, $v1, -15324
L8001c5cc:
  lui $at, 0x800a
L8001c5d0:
  sb $v0, -19893($at)
L8001c5d4:
  sll $v0, $a0, 0x3
L8001c5d8:
  subu $v0, $v0, $a0
L8001c5dc:
  sll $v0, $v0, 0x2
L8001c5e0:
  addu $v0, $v0, $v1
L8001c5e4:
  addu $v0, $v0, $a2
L8001c5e8:
  lh $a0, 14016($v0)
L8001c5ec:
  addiu $v0, $zero, 2
L8001c5f0:
  lui $at, 0x800a
L8001c5f4:
  sb $v0, -19884($at)
L8001c5f8:
  lui $at, 0x800a
L8001c5fc:
  sh $a0, -19898($at)
L8001c600:
  j L8001d21c
L8001c604:
  sll $zero, $zero, 0x0
L8001c608:
  lui $v0, 0x800a
L8001c60c:
  lhu $v0, -19564($v0)
L8001c610:
  sll $zero, $zero, 0x0
L8001c614:
  andi $v0, $v0, 0xa000
L8001c618:
  beq $v0, $zero, L8001c6a0
L8001c61c:
  sll $zero, $zero, 0x0
L8001c620:
  lui $v0, 0x800a
L8001c624:
  lhu $v0, -19564($v0)
L8001c628:
  lb $s0, 14($s2)
L8001c62c:
  andi $v0, $v0, 0x2000
L8001c630:
  beq $v0, $zero, L8001c650
L8001c634:
  sll $zero, $zero, 0x0
L8001c638:
  addiu $s0, $s0, 1
L8001c63c:
  slti $v0, $s0, 5
L8001c640:
  beq $v0, $zero, L8001d21c
L8001c644:
  addu $a0, $s2, $zero
L8001c648:
  j L8001c65c
L8001c64c:
  sll $zero, $zero, 0x0
L8001c650:
  addiu $s0, $s0, -1
L8001c654:
  bltz $s0, L8001d21c
L8001c658:
  addu $a0, $s2, $zero
L8001c65c:
  jal L8001b780
L8001c660:
  sb $s0, 14($s2)
L8001c664:
  lui $a0, 0x8009
L8001c668:
  addiu $a0, $a0, 1996
L8001c66c:
  lbu $a1, 717($gp)
L8001c670:
  lb $v0, 14($s2)
L8001c674:
  sll $v1, $a1, 0x2
L8001c678:
  addu $v1, $v1, $a1
L8001c67c:
  addu $v0, $v0, $v1
L8001c680:
  addu $v0, $v0, $a0
L8001c684:
  lbu $a1, 0($v0)
L8001c688:
  jal 0x80023144
L8001c68c:
  addu $a0, $s2, $zero
L8001c690:
  jal 0x8003fee0
L8001c694:
  addiu $a0, $zero, 6
L8001c698:
  j L8001d21c
L8001c69c:
  sll $zero, $zero, 0x0
L8001c6a0:
  lui $v0, 0x800a
L8001c6a4:
  lhu $v0, -19560($v0)
L8001c6a8:
  sll $zero, $zero, 0x0
L8001c6ac:
  andi $v1, $v0, 0xffff
L8001c6b0:
  addiu $v0, $zero, 4096
L8001c6b4:
  bne $v1, $v0, L8001c6f0
L8001c6b8:
  sll $zero, $zero, 0x0
L8001c6bc:
  lui $v0, 0x800a
L8001c6c0:
  lhu $v0, -19548($v0)
L8001c6c4:
  sll $zero, $zero, 0x0
L8001c6c8:
  bne $v0, $v1, L8001c6f0
L8001c6cc:
  sll $zero, $zero, 0x0
L8001c6d0:
  lbu $v0, 9($s4)
L8001c6d4:
  sll $zero, $zero, 0x0
L8001c6d8:
  bne $v0, $zero, L8001d21c
L8001c6dc:
  sll $zero, $zero, 0x0
L8001c6e0:
  jal L8001b7ac
L8001c6e4:
  addu $a0, $s2, $zero
L8001c6e8:
  j L8001d21c
L8001c6ec:
  sll $zero, $zero, 0x0
L8001c6f0:
  lui $v0, 0x800a
L8001c6f4:
  lhu $v0, -19560($v0)
L8001c6f8:
  sll $zero, $zero, 0x0
L8001c6fc:
  andi $v0, $v0, 0x20
L8001c700:
  bne $v0, $zero, L8001c738
L8001c704:
  sll $zero, $zero, 0x0
L8001c708:
  lui $v0, 0x800a
L8001c70c:
  lhu $v0, -19560($v0)
L8001c710:
  sll $zero, $zero, 0x0
L8001c714:
  andi $v1, $v0, 0xffff
L8001c718:
  addiu $v0, $zero, 16384
L8001c71c:
  bne $v1, $v0, L8001c7d4
L8001c720:
  sll $zero, $zero, 0x0
L8001c724:
  lui $v0, 0x800a
L8001c728:
  lhu $v0, -19548($v0)
L8001c72c:
  sll $zero, $zero, 0x0
L8001c730:
  bne $v0, $v1, L8001c7d4
L8001c734:
  sll $zero, $zero, 0x0
L8001c738:
  lbu $s0, 9($s4)
L8001c73c:
  sll $zero, $zero, 0x0
L8001c740:
  beq $s0, $zero, L8001d21c
L8001c744:
  sll $zero, $zero, 0x0
L8001c748:
  jal 0x8003fee0
L8001c74c:
  addiu $a0, $zero, 47
L8001c750:
  lw $v1, 0($s4)
L8001c754:
  sb $zero, 9($s4)
L8001c758:
  lhu $v0, 50($v1)
L8001c75c:
  sll $zero, $zero, 0x0
L8001c760:
  addiu $v0, $v0, 4
L8001c764:
  sh $v0, 50($v1)
L8001c768:
  lw $a0, 4($s4)
L8001c76c:
  jal 0x8004036c
L8001c770:
  sll $zero, $zero, 0x0
L8001c774:
  lui $v0, 0x800f
L8001c778:
  sw $zero, 4($s4)
L8001c77c:
  addiu $s4, $v0, -24528
L8001c780:
  addu $a1, $zero, $zero
L8001c784:
  lbu $v0, 21($s2)
L8001c788:
  addiu $a0, $s4, 4
L8001c78c:
  addiu $v0, $v0, -1
L8001c790:
  sb $v0, 21($s2)
L8001c794:
  lbu $v1, 5($a0)
L8001c798:
  sll $zero, $zero, 0x0
L8001c79c:
  slt $v0, $v1, $s0
L8001c7a0:
  bne $v0, $zero, L8001c7bc
L8001c7a4:
  addiu $v0, $v1, -1
L8001c7a8:
  sb $v0, 5($a0)
L8001c7ac:
  addiu $v0, $v1, -2
L8001c7b0:
  lw $v1, 0($a0)
L8001c7b4:
  sll $v0, $v0, 0x4
L8001c7b8:
  sb $v0, 92($v1)
L8001c7bc:
  addiu $a1, $a1, 1
L8001c7c0:
  slti $v0, $a1, 5
L8001c7c4:
  bne $v0, $zero, L8001c794
L8001c7c8:
  addiu $a0, $a0, 12
L8001c7cc:
  j L8001d21c
L8001c7d0:
  sll $zero, $zero, 0x0
L8001c7d4:
  lui $v0, 0x800a
L8001c7d8:
  lhu $v0, -19548($v0)
L8001c7dc:
  sll $zero, $zero, 0x0
L8001c7e0:
  andi $v0, $v0, 0x3
L8001c7e4:
  beq $v0, $zero, L8001c824
L8001c7e8:
  sll $zero, $zero, 0x0
L8001c7ec:
  lbu $v1, 717($gp)
L8001c7f0:
  lhu $a0, 818($gp)
L8001c7f4:
  sb $zero, 716($gp)
L8001c7f8:
  sll $v0, $v1, 0x3
L8001c7fc:
  subu $v0, $v0, $v1
L8001c800:
  sll $v0, $v0, 0x4
L8001c804:
  lui $v1, 0x800f
L8001c808:
  addiu $v1, $v1, -24788
L8001c80c:
  addu $v0, $v0, $v1
L8001c810:
  ori $a0, $a0, 0x4000
L8001c814:
  sw $v0, 684($gp)
L8001c818:
  sh $a0, 818($gp)
L8001c81c:
  j L8001d21c
L8001c820:
  sll $zero, $zero, 0x0
L8001c824:
  lui $v0, 0x800a
L8001c828:
  lhu $v0, -19560($v0)
L8001c82c:
  sll $zero, $zero, 0x0
L8001c830:
  andi $v0, $v0, 0xc0
L8001c834:
  beq $v0, $zero, L8001d21c
L8001c838:
  addiu $v0, $zero, 1
L8001c83c:
  lbu $v1, 21($s2)
L8001c840:
  sll $zero, $zero, 0x0
L8001c844:
  beq $v1, $v0, L8001d21c
L8001c848:
  sll $zero, $zero, 0x0
L8001c84c:
  jal 0x8003fee0
L8001c850:
  addiu $a0, $zero, 7
L8001c854:
  addiu $v0, $zero, 4
L8001c858:
  sb $v0, 620($gp)
L8001c85c:
  jal L8001b8b8
L8001c860:
  addu $a0, $s2, $zero
L8001c864:
  j L8001ce5c
L8001c868:
  sll $zero, $zero, 0x0
L8001c86c:
  lbu $v1, 620($gp)
L8001c870:
  lw $s3, 0($s4)
L8001c874:
  andi $v0, $v1, 0x80
L8001c878:
  bne $v0, $zero, L8001c8f0
L8001c87c:
  andi $v0, $v1, 0x40
L8001c880:
  ori $v0, $v1, 0xc0
L8001c884:
  lhu $v1, 48($s3)
L8001c888:
  lhu $a1, 50($s3)
L8001c88c:
  addu $a0, $s3, $zero
L8001c890:
  sb $v0, 620($gp)
L8001c894:
  addiu $v0, $zero, 134
L8001c898:
  sh $v0, 40($s3)
L8001c89c:
  addiu $v0, $zero, 90
L8001c8a0:
  sh $v0, 42($s3)
L8001c8a4:
  sh $v1, 44($s3)
L8001c8a8:
  jal 0x80043178
L8001c8ac:
  sh $a1, 46($s3)
L8001c8b0:
  lbu $a1, 22($s3)
L8001c8b4:
  addu $a0, $s3, $zero
L8001c8b8:
  sh $zero, 96($s3)
L8001c8bc:
  addiu $a1, $a1, 4
L8001c8c0:
  sll $a1, $a1, 0x18
L8001c8c4:
  jal 0x800428ec
L8001c8c8:
  sra $a1, $a1, 0x18
L8001c8cc:
  lw $v1, 4($s2)
L8001c8d0:
  sll $zero, $zero, 0x0
L8001c8d4:
  lhu $v0, 8($v1)
L8001c8d8:
  sll $zero, $zero, 0x0
L8001c8dc:
  andi $v0, $v0, 0xffbf
L8001c8e0:
  sh $v0, 8($v1)
L8001c8e4:
  lbu $v1, 620($gp)
L8001c8e8:
  sll $zero, $zero, 0x0
L8001c8ec:
  andi $v0, $v1, 0x40
L8001c8f0:
  beq $v0, $zero, L8001cb24
L8001c8f4:
  andi $v0, $v1, 0x20
L8001c8f8:
  lh $a1, 40($s3)
L8001c8fc:
  lh $a2, 42($s3)
L8001c900:
  lh $a3, 96($s3)
L8001c904:
  jal 0x8004318c
L8001c908:
  addu $a0, $s3, $zero
L8001c90c:
  lhu $v0, 96($s3)
L8001c910:
  sll $zero, $zero, 0x0
L8001c914:
  addiu $v0, $v0, 170
L8001c918:
  sh $v0, 96($s3)
L8001c91c:
  sll $v0, $v0, 0x10
L8001c920:
  sra $v0, $v0, 0x10
L8001c924:
  slti $v0, $v0, 2048
L8001c928:
  bne $v0, $zero, L8001d21c
L8001c92c:
  sll $zero, $zero, 0x0
L8001c930:
  lbu $v0, 620($gp)
L8001c934:
  lw $v1, 40($s3)
L8001c938:
  andi $a2, $v0, 0xbf
L8001c93c:
  andi $v0, $v0, 0x10
L8001c940:
  sb $a2, 620($gp)
L8001c944:
  beq $v0, $zero, L8001c9ac
L8001c948:
  sw $v1, 48($s3)
L8001c94c:
  lw $v1, 4($s2)
L8001c950:
  sll $zero, $zero, 0x0
L8001c954:
  lhu $v0, 8($v1)
L8001c958:
  sll $zero, $zero, 0x0
L8001c95c:
  ori $v0, $v0, 0x40
L8001c960:
  sh $v0, 8($v1)
L8001c964:
  lbu $a1, 22($s3)
L8001c968:
  addu $a0, $s3, $zero
L8001c96c:
  addiu $a1, $a1, -4
L8001c970:
  sll $a1, $a1, 0x18
L8001c974:
  jal 0x800428ec
L8001c978:
  sra $a1, $a1, 0x18
L8001c97c:
  lbu $v0, 620($gp)
L8001c980:
  sll $zero, $zero, 0x0
L8001c984:
  andi $v0, $v0, 0x20
L8001c988:
  beq $v0, $zero, L8001c99c
L8001c98c:
  addiu $v0, $zero, 4
L8001c990:
  sb $v0, 620($gp)
L8001c994:
  j L8001d21c
L8001c998:
  sll $zero, $zero, 0x0
L8001c99c:
  addiu $v0, $zero, 1
L8001c9a0:
  sb $v0, 620($gp)
L8001c9a4:
  j L8001d21c
L8001c9a8:
  sll $zero, $zero, 0x0
L8001c9ac:
  lui $a1, 0x4
L8001c9b0:
  ori $a1, $a1, 0x8000
L8001c9b4:
  lui $v1, 0x8016
L8001c9b8:
  lbu $a0, 106($s3)
L8001c9bc:
  addiu $v1, $v1, -15324
L8001c9c0:
  sll $v0, $a0, 0x3
L8001c9c4:
  subu $v0, $v0, $a0
L8001c9c8:
  sll $v0, $v0, 0x2
L8001c9cc:
  addu $v0, $v0, $v1
L8001c9d0:
  addu $v0, $v0, $a1
L8001c9d4:
  lw $v0, 14008($v0)
L8001c9d8:
  lui $v1, 0x801d
L8001c9dc:
  lh $a0, 0($v0)
L8001c9e0:
  addiu $v1, $v1, 16964
L8001c9e4:
  addiu $v0, $a0, -1
L8001c9e8:
  sll $v0, $v0, 0x2
L8001c9ec:
  addu $v0, $v0, $v1
L8001c9f0:
  lw $v0, 0($v0)
L8001c9f4:
  sll $zero, $zero, 0x0
L8001c9f8:
  sra $v0, $v0, 0x1a
L8001c9fc:
  andi $s0, $v0, 0x1f
L8001ca00:
  slti $v0, $s0, 20
L8001ca04:
  bne $v0, $zero, L8001ca14
L8001ca08:
  addiu $v0, $zero, 21
L8001ca0c:
  bne $s0, $v0, L8001ca38
L8001ca10:
  sll $zero, $zero, 0x0
L8001ca14:
  lbu $v0, 33($s3)
L8001ca18:
  sll $zero, $zero, 0x0
L8001ca1c:
  bne $v0, $zero, L8001ca38
L8001ca20:
  addiu $v0, $zero, 16
L8001ca24:
  sh $v0, 96($s3)
L8001ca28:
  ori $v0, $a2, 0x20
L8001ca2c:
  sb $v0, 620($gp)
L8001ca30:
  jal 0x8003fee0
L8001ca34:
  addiu $a0, $zero, 11
L8001ca38:
  jal 0x8004002c
L8001ca3c:
  addiu $s2, $zero, 1
L8001ca40:
  addu $a0, $v0, $zero
L8001ca44:
  jal 0x800400ac
L8001ca48:
  addiu $a1, $zero, 2
L8001ca4c:
  addu $s4, $v0, $zero
L8001ca50:
  addu $a0, $s4, $zero
L8001ca54:
  addiu $a3, $zero, 3
L8001ca58:
  addiu $v0, $zero, 2
L8001ca5c:
  addiu $s1, $zero, 11
L8001ca60:
  lh $a1, 48($s3)
L8001ca64:
  lh $a2, 50($s3)
L8001ca68:
  addiu $s0, $zero, 524
L8001ca6c:
  sw $s2, 16($sp)
L8001ca70:
  sw $v0, 20($sp)
L8001ca74:
  sw $s1, 24($sp)
L8001ca78:
  sw $s0, 28($sp)
L8001ca7c:
  addiu $a1, $a1, -8
L8001ca80:
  jal 0x800404cc
L8001ca84:
  addiu $a2, $a2, 30
L8001ca88:
  jal 0x80042918
L8001ca8c:
  addu $a0, $s4, $zero
L8001ca90:
  addu $a0, $s4, $zero
L8001ca94:
  jal 0x800428ec
L8001ca98:
  addiu $a1, $zero, 10
L8001ca9c:
  lhu $v0, 8($s4)
L8001caa0:
  sll $zero, $zero, 0x0
L8001caa4:
  ori $v0, $v0, 0x28
L8001caa8:
  sh $v0, 8($s4)
L8001caac:
  sw $s4, 640($gp)
L8001cab0:
  jal 0x8004002c
L8001cab4:
  sll $zero, $zero, 0x0
L8001cab8:
  addu $a0, $v0, $zero
L8001cabc:
  jal 0x800400ac
L8001cac0:
  addiu $a1, $zero, 2
L8001cac4:
  addu $s4, $v0, $zero
L8001cac8:
  addu $a0, $s4, $zero
L8001cacc:
  lh $a1, 48($s3)
L8001cad0:
  lh $a2, 50($s3)
L8001cad4:
  addiu $a3, $zero, 3
L8001cad8:
  sw $s2, 16($sp)
L8001cadc:
  sw $zero, 20($sp)
L8001cae0:
  sw $s1, 24($sp)
L8001cae4:
  sw $s0, 28($sp)
L8001cae8:
  addiu $a1, $a1, 60
L8001caec:
  jal 0x800404cc
L8001caf0:
  addiu $a2, $a2, 30
L8001caf4:
  jal 0x80042918
L8001caf8:
  addu $a0, $s4, $zero
L8001cafc:
  addu $a0, $s4, $zero
L8001cb00:
  jal 0x800428ec
L8001cb04:
  addiu $a1, $zero, 10
L8001cb08:
  lhu $v0, 8($s4)
L8001cb0c:
  sll $zero, $zero, 0x0
L8001cb10:
  ori $v0, $v0, 0x28
L8001cb14:
  sh $v0, 8($s4)
L8001cb18:
  sw $s4, 644($gp)
L8001cb1c:
  j L8001d21c
L8001cb20:
  sll $zero, $zero, 0x0
L8001cb24:
  beq $v0, $zero, L8001cbd4
L8001cb28:
  sll $zero, $zero, 0x0
L8001cb2c:
  lhu $v0, 8($s3)
L8001cb30:
  lbu $v1, 33($s3)
L8001cb34:
  lbu $a0, 96($s3)
L8001cb38:
  ori $v0, $v0, 0x4
L8001cb3c:
  addu $v1, $v1, $a0
L8001cb40:
  sh $v0, 8($s3)
L8001cb44:
  addu $v0, $v1, $zero
L8001cb48:
  sb $v1, 33($s3)
L8001cb4c:
  andi $v1, $v1, 0x7f
L8001cb50:
  bne $v1, $zero, L8001d21c
L8001cb54:
  andi $v0, $v0, 0xff
L8001cb58:
  bne $v0, $zero, L8001cb70
L8001cb5c:
  sll $zero, $zero, 0x0
L8001cb60:
  lhu $v0, 8($s3)
L8001cb64:
  sll $zero, $zero, 0x0
L8001cb68:
  andi $v0, $v0, 0xfffb
L8001cb6c:
  sh $v0, 8($s3)
L8001cb70:
  lbu $v0, 620($gp)
L8001cb74:
  sll $zero, $zero, 0x0
L8001cb78:
  andi $v1, $v0, 0xdf
L8001cb7c:
  andi $v0, $v0, 0x10
L8001cb80:
  sb $v1, 620($gp)
L8001cb84:
  beq $v0, $zero, L8001d21c
L8001cb88:
  sll $zero, $zero, 0x0
L8001cb8c:
  lw $a0, 640($gp)
L8001cb90:
  jal 0x8004036c
L8001cb94:
  sll $zero, $zero, 0x0
L8001cb98:
  lw $a0, 644($gp)
L8001cb9c:
  jal 0x8004036c
L8001cba0:
  sll $zero, $zero, 0x0
L8001cba4:
  sw $zero, 644($gp)
L8001cba8:
  sw $zero, 640($gp)
L8001cbac:
  lw $v0, 44($s3)
L8001cbb0:
  addu $a0, $s3, $zero
L8001cbb4:
  jal 0x80043178
L8001cbb8:
  sw $v0, 40($s3)
L8001cbbc:
  lbu $v0, 620($gp)
L8001cbc0:
  sh $zero, 96($s3)
L8001cbc4:
  ori $v0, $v0, 0x50
L8001cbc8:
  sb $v0, 620($gp)
L8001cbcc:
  j L8001d21c
L8001cbd0:
  sll $zero, $zero, 0x0
L8001cbd4:
  lui $v0, 0x800a
L8001cbd8:
  lhu $v0, -19564($v0)
L8001cbdc:
  sll $zero, $zero, 0x0
L8001cbe0:
  andi $v0, $v0, 0xa000
L8001cbe4:
  beq $v0, $zero, L8001cc20
L8001cbe8:
  addiu $v0, $zero, 16
L8001cbec:
  sh $v0, 96($s3)
L8001cbf0:
  lui $v0, 0x800a
L8001cbf4:
  lhu $v0, -19564($v0)
L8001cbf8:
  ori $v1, $v1, 0x20
L8001cbfc:
  sb $v1, 620($gp)
L8001cc00:
  andi $v0, $v0, 0x2000
L8001cc04:
  beq $v0, $zero, L8001cc10
L8001cc08:
  addiu $v0, $zero, -16
L8001cc0c:
  sh $v0, 96($s3)
L8001cc10:
  jal 0x8003fee0
L8001cc14:
  addiu $a0, $zero, 11
L8001cc18:
  j L8001d21c
L8001cc1c:
  sll $zero, $zero, 0x0
L8001cc20:
  lui $v0, 0x800a
L8001cc24:
  lhu $v0, -19560($v0)
L8001cc28:
  sll $zero, $zero, 0x0
L8001cc2c:
  andi $v0, $v0, 0x20
L8001cc30:
  beq $v0, $zero, L8001cc68
L8001cc34:
  sll $zero, $zero, 0x0
L8001cc38:
  jal 0x8003fee0
L8001cc3c:
  addiu $a0, $zero, 8
L8001cc40:
  lbu $v0, 33($s3)
L8001cc44:
  sll $zero, $zero, 0x0
L8001cc48:
  beq $v0, $zero, L8001cb8c
L8001cc4c:
  addiu $v1, $zero, 16
L8001cc50:
  lbu $v0, 620($gp)
L8001cc54:
  sh $v1, 96($s3)
L8001cc58:
  ori $v0, $v0, 0x30
L8001cc5c:
  sb $v0, 620($gp)
L8001cc60:
  j L8001d21c
L8001cc64:
  sll $zero, $zero, 0x0
L8001cc68:
  lui $v0, 0x800a
L8001cc6c:
  lhu $v0, -19560($v0)
L8001cc70:
  sll $zero, $zero, 0x0
L8001cc74:
  andi $v0, $v0, 0xc0
L8001cc78:
  beq $v0, $zero, L8001d21c
L8001cc7c:
  sll $zero, $zero, 0x0
L8001cc80:
  jal 0x8003fee0
L8001cc84:
  addiu $a0, $zero, 7
L8001cc88:
  lui $v0, 0x801a
L8001cc8c:
  lbu $v1, 106($s3)
L8001cc90:
  addiu $a0, $v0, 31448
L8001cc94:
  sll $v0, $v1, 0x3
L8001cc98:
  subu $v0, $v0, $v1
L8001cc9c:
  sll $v0, $v0, 0x2
L8001cca0:
  addu $v0, $v0, $a0
L8001cca4:
  lhu $v1, 22($v0)
L8001cca8:
  sll $zero, $zero, 0x0
L8001ccac:
  andi $v1, $v1, 0xefff
L8001ccb0:
  sh $v1, 22($v0)
L8001ccb4:
  lbu $v0, 33($s3)
L8001ccb8:
  sll $zero, $zero, 0x0
L8001ccbc:
  beq $v0, $zero, L8001ccec
L8001ccc0:
  lui $a1, 0x4
L8001ccc4:
  lbu $v0, 106($s3)
L8001ccc8:
  sll $zero, $zero, 0x0
L8001cccc:
  sll $v1, $v0, 0x3
L8001ccd0:
  subu $v1, $v1, $v0
L8001ccd4:
  sll $v1, $v1, 0x2
L8001ccd8:
  addu $v1, $v1, $a0
L8001ccdc:
  lhu $v0, 22($v1)
L8001cce0:
  sll $zero, $zero, 0x0
L8001cce4:
  ori $v0, $v0, 0x1000
L8001cce8:
  sh $v0, 22($v1)
L8001ccec:
  ori $a1, $a1, 0x8000
L8001ccf0:
  lui $v1, 0x8016
L8001ccf4:
  lbu $a0, 106($s3)
L8001ccf8:
  addiu $v1, $v1, -15324
L8001ccfc:
  sll $v0, $a0, 0x3
L8001cd00:
  subu $v0, $v0, $a0
L8001cd04:
  sll $v0, $v0, 0x2
L8001cd08:
  addu $v0, $v0, $v1
L8001cd0c:
  addu $v0, $v0, $a1
L8001cd10:
  lui $v1, 0x801d
L8001cd14:
  lh $a0, 14016($v0)
L8001cd18:
  addiu $v1, $v1, 16964
L8001cd1c:
  addiu $v0, $a0, -1
L8001cd20:
  sll $v0, $v0, 0x2
L8001cd24:
  addu $v0, $v0, $v1
L8001cd28:
  lw $v0, 0($v0)
L8001cd2c:
  sll $zero, $zero, 0x0
L8001cd30:
  sra $v0, $v0, 0x1a
L8001cd34:
  andi $s0, $v0, 0x1f
L8001cd38:
  slti $v0, $s0, 20
L8001cd3c:
  bne $v0, $zero, L8001cdb4
L8001cd40:
  sll $zero, $zero, 0x0
L8001cd44:
  lbu $v0, 33($s3)
L8001cd48:
  sll $zero, $zero, 0x0
L8001cd4c:
  bne $v0, $zero, L8001cdb4
L8001cd50:
  addiu $v0, $zero, 23
L8001cd54:
  beq $s0, $v0, L8001cdb4
L8001cd58:
  addiu $v0, $zero, 21
L8001cd5c:
  beq $s0, $v0, L8001cdb4
L8001cd60:
  sll $zero, $zero, 0x0
L8001cd64:
  lw $a0, 640($gp)
L8001cd68:
  jal 0x8004036c
L8001cd6c:
  sll $zero, $zero, 0x0
L8001cd70:
  lw $a0, 644($gp)
L8001cd74:
  jal 0x8004036c
L8001cd78:
  sll $zero, $zero, 0x0
L8001cd7c:
  lui $v0, 0x800f
L8001cd80:
  sw $s3, -24848($v0)
L8001cd84:
  lw $v0, 704($gp)
L8001cd88:
  sw $zero, 644($gp)
L8001cd8c:
  sw $zero, 640($gp)
L8001cd90:
  lb $v1, 14($s2)
L8001cd94:
  sll $zero, $zero, 0x0
L8001cd98:
  addu $v0, $v0, $v1
L8001cd9c:
  addiu $v1, $zero, -1
L8001cda0:
  sb $v1, 26($v0)
L8001cda4:
  addiu $v0, $zero, 5
L8001cda8:
  sb $v0, 620($gp)
L8001cdac:
  j L8001d21c
L8001cdb0:
  sll $zero, $zero, 0x0
L8001cdb4:
  lbu $v0, 620($gp)
L8001cdb8:
  sll $zero, $zero, 0x0
L8001cdbc:
  ori $v0, $v0, 0x70
L8001cdc0:
  sb $v0, 620($gp)
L8001cdc4:
  j L8001cb8c
L8001cdc8:
  sll $zero, $zero, 0x0
L8001cdcc:
  lbu $v1, 620($gp)
L8001cdd0:
  sll $zero, $zero, 0x0
L8001cdd4:
  andi $v0, $v1, 0x80
L8001cdd8:
  bne $v0, $zero, L8001ce10
L8001cddc:
  andi $v0, $v1, 0x40
L8001cde0:
  ori $v0, $v1, 0x80
L8001cde4:
  sb $v0, 620($gp)
L8001cde8:
  sh $zero, 776($gp)
L8001cdec:
  jal L8001b938
L8001cdf0:
  addu $a0, $s2, $zero
L8001cdf4:
  lbu $v0, 620($gp)
L8001cdf8:
  sll $zero, $zero, 0x0
L8001cdfc:
  ori $v0, $v0, 0x40
L8001ce00:
  sb $v0, 620($gp)
L8001ce04:
  lbu $v1, 620($gp)
L8001ce08:
  sll $zero, $zero, 0x0
L8001ce0c:
  andi $v0, $v1, 0x40
L8001ce10:
  beq $v0, $zero, L8001ce78
L8001ce14:
  sll $zero, $zero, 0x0
L8001ce18:
  lhu $v0, 602($gp)
L8001ce1c:
  sll $zero, $zero, 0x0
L8001ce20:
  bne $v0, $zero, L8001d21c
L8001ce24:
  andi $v0, $v1, 0xbf
L8001ce28:
  sb $v0, 620($gp)
L8001ce2c:
  andi $v0, $v1, 0x10
L8001ce30:
  beq $v0, $zero, L8001d21c
L8001ce34:
  addiu $v0, $zero, 1
L8001ce38:
  lbu $v1, 717($gp)
L8001ce3c:
  sb $v0, 620($gp)
L8001ce40:
  sll $v0, $v1, 0x3
L8001ce44:
  subu $v0, $v0, $v1
L8001ce48:
  sll $v0, $v0, 0x4
L8001ce4c:
  lui $v1, 0x800f
L8001ce50:
  addiu $v1, $v1, -24816
L8001ce54:
  addu $v0, $v0, $v1
L8001ce58:
  sw $v0, 684($gp)
L8001ce5c:
  lbu $v0, 21($s2)
L8001ce60:
  sll $zero, $zero, 0x0
L8001ce64:
  bne $v0, $zero, L8001d21c
L8001ce68:
  addiu $v0, $zero, 3
L8001ce6c:
  sb $v0, 620($gp)
L8001ce70:
  j L8001d21c
L8001ce74:
  sll $zero, $zero, 0x0
L8001ce78:
  lw $a0, 684($gp)
L8001ce7c:
  jal 0x80024060
L8001ce80:
  sll $zero, $zero, 0x0
L8001ce84:
  bne $v0, $zero, L8001d21c
L8001ce88:
  lui $a2, 0x8009
L8001ce8c:
  lui $v1, 0x800f
L8001ce90:
  addiu $v1, $v1, -24816
L8001ce94:
  lbu $a0, 717($gp)
L8001ce98:
  addiu $a2, $a2, 2008
L8001ce9c:
  sll $v0, $a0, 0x3
L8001cea0:
  subu $v0, $v0, $a0
L8001cea4:
  sll $v0, $v0, 0x4
L8001cea8:
  addu $v0, $v0, $v1
L8001ceac:
  lb $a1, 72($v0)
L8001ceb0:
  lb $v0, 71($v0)
L8001ceb4:
  sll $v1, $a1, 0x2
L8001ceb8:
  addu $v1, $v1, $a1
L8001cebc:
  addu $v1, $v1, $v0
L8001cec0:
  sll $v0, $a0, 0x2
L8001cec4:
  addu $v0, $v0, $a0
L8001cec8:
  sll $v0, $v0, 0x2
L8001cecc:
  addu $v1, $v1, $v0
L8001ced0:
  addu $v1, $v1, $a2
L8001ced4:
  lui $a0, 0x801a
L8001ced8:
  lbu $v1, 0($v1)
L8001cedc:
  addiu $a0, $a0, 31448
L8001cee0:
  sll $v0, $v1, 0x3
L8001cee4:
  subu $v0, $v0, $v1
L8001cee8:
  sll $v0, $v0, 0x2
L8001ceec:
  jal 0x80017034
L8001cef0:
  addu $a0, $v0, $a0
L8001cef4:
  addu $s0, $v0, $zero
L8001cef8:
  beq $s0, $zero, L8001cf24
L8001cefc:
  addiu $v0, $zero, 20
L8001cf00:
  lui $at, 0x800a
L8001cf04:
  sb $v0, -19893($at)
L8001cf08:
  addiu $v0, $zero, 2
L8001cf0c:
  lui $at, 0x800a
L8001cf10:
  sh $s0, -19898($at)
L8001cf14:
  lui $at, 0x800a
L8001cf18:
  sb $v0, -19884($at)
L8001cf1c:
  j L8001d21c
L8001cf20:
  sll $zero, $zero, 0x0
L8001cf24:
  lui $v0, 0x800a
L8001cf28:
  lhu $v0, -19560($v0)
L8001cf2c:
  sll $zero, $zero, 0x0
L8001cf30:
  andi $v0, $v0, 0x20
L8001cf34:
  beq $v0, $zero, L8001cf5c
L8001cf38:
  addiu $v1, $zero, 12
L8001cf3c:
  lbu $v0, 620($gp)
L8001cf40:
  sh $v1, 602($gp)
L8001cf44:
  ori $v0, $v0, 0x50
L8001cf48:
  sb $v0, 620($gp)
L8001cf4c:
  jal 0x8003fee0
L8001cf50:
  addiu $a0, $zero, 8
L8001cf54:
  j L8001d21c
L8001cf58:
  sll $zero, $zero, 0x0
L8001cf5c:
  lui $v0, 0x800a
L8001cf60:
  lhu $v0, -19560($v0)
L8001cf64:
  sll $zero, $zero, 0x0
L8001cf68:
  andi $v0, $v0, 0xc0
L8001cf6c:
  beq $v0, $zero, L8001d21c
L8001cf70:
  sll $zero, $zero, 0x0
L8001cf74:
  jal 0x8003fee0
L8001cf78:
  addiu $a0, $zero, 7
L8001cf7c:
  addiu $a1, $zero, 6
L8001cf80:
  lui $v0, 0x800f
L8001cf84:
  addiu $v0, $v0, -24848
L8001cf88:
  addiu $v0, $v0, 24
L8001cf8c:
  sw $zero, 0($v0)
L8001cf90:
  addiu $a1, $a1, -1
L8001cf94:
  bgez $a1, L8001cf8c
L8001cf98:
  addiu $v0, $v0, -4
L8001cf9c:
  lw $a2, 684($gp)
L8001cfa0:
  sll $zero, $zero, 0x0
L8001cfa4:
  lb $v1, 16($a2)
L8001cfa8:
  lb $a0, 15($a2)
L8001cfac:
  sll $v0, $v1, 0x2
L8001cfb0:
  addu $v0, $v0, $v1
L8001cfb4:
  addu $a1, $v0, $a0
L8001cfb8:
  lui $v1, 0x8009
L8001cfbc:
  lbu $a0, 717($gp)
L8001cfc0:
  addiu $v1, $v1, 2008
L8001cfc4:
  sll $v0, $a0, 0x2
L8001cfc8:
  addu $v0, $v0, $a0
L8001cfcc:
  sll $v0, $v0, 0x2
L8001cfd0:
  addu $v0, $a1, $v0
L8001cfd4:
  addu $v0, $v0, $v1
L8001cfd8:
  lui $v1, 0x801a
L8001cfdc:
  lbu $s0, 0($v0)
L8001cfe0:
  addiu $s5, $v1, 31448
L8001cfe4:
  sll $v0, $s0, 0x3
L8001cfe8:
  subu $v0, $v0, $s0
L8001cfec:
  sll $v0, $v0, 0x2
L8001cff0:
  addu $a0, $v0, $s5
L8001cff4:
  lhu $v0, 22($a0)
L8001cff8:
  sb $s0, 660($gp)
L8001cffc:
  andi $v0, $v0, 0x8000
L8001d000:
  beq $v0, $zero, L8001d048
L8001d004:
  addu $s1, $zero, $zero
L8001d008:
  lh $a1, 8($a0)
L8001d00c:
  lh $a2, 10($a0)
L8001d010:
  lw $s3, 0($a0)
L8001d014:
  jal 0x80017f04
L8001d018:
  addiu $s1, $zero, 1
L8001d01c:
  lui $v1, 0x800f
L8001d020:
  sw $v0, -24848($v1)
L8001d024:
  lbu $v0, 106($s3)
L8001d028:
  sll $zero, $zero, 0x0
L8001d02c:
  sll $a0, $v0, 0x3
L8001d030:
  subu $a0, $a0, $v0
L8001d034:
  sll $a0, $a0, 0x2
L8001d038:
  jal 0x80024914
L8001d03c:
  addu $a0, $a0, $s5
L8001d040:
  j L8001d080
L8001d044:
  sll $zero, $zero, 0x0
L8001d048:
  lbu $v0, 21($s2)
L8001d04c:
  sll $zero, $zero, 0x0
L8001d050:
  bne $v0, $zero, L8001d0c8
L8001d054:
  addiu $s0, $zero, 1
L8001d058:
  lw $v0, 0($s4)
L8001d05c:
  sll $zero, $zero, 0x0
L8001d060:
  lbu $v1, 104($v0)
L8001d064:
  addiu $v0, $zero, 23
L8001d068:
  bne $v1, $v0, L8001d080
L8001d06c:
  addiu $v0, $zero, 2
L8001d070:
  lb $v1, 16($a2)
L8001d074:
  sll $zero, $zero, 0x0
L8001d078:
  beq $v1, $v0, L8001d21c
L8001d07c:
  sll $zero, $zero, 0x0
L8001d080:
  lbu $v0, 21($s2)
L8001d084:
  sll $zero, $zero, 0x0
L8001d088:
  bne $v0, $zero, L8001d0c8
L8001d08c:
  addiu $s0, $zero, 1
L8001d090:
  lw $v0, 0($s4)
L8001d094:
  addiu $v1, $zero, 1
L8001d098:
  sb $v1, 9($s4)
L8001d09c:
  lbu $v0, 33($v0)
L8001d0a0:
  sll $zero, $zero, 0x0
L8001d0a4:
  beq $v0, $zero, L8001d0cc
L8001d0a8:
  lui $v0, 0x800f
L8001d0ac:
  lw $v1, 704($gp)
L8001d0b0:
  sll $zero, $zero, 0x0
L8001d0b4:
  lbu $v0, 4($v1)
L8001d0b8:
  sll $zero, $zero, 0x0
L8001d0bc:
  addiu $v0, $v0, 1
L8001d0c0:
  sb $v0, 4($v1)
L8001d0c4:
  addiu $s0, $zero, 1
L8001d0c8:
  lui $v0, 0x800f
L8001d0cc:
  addiu $t1, $v0, -24528
L8001d0d0:
  addiu $a3, $zero, -1
L8001d0d4:
  lui $v0, 0x800f
L8001d0d8:
  addiu $t0, $v0, -24848
L8001d0dc:
  addu $a1, $zero, $zero
L8001d0e0:
  addu $a0, $t1, $zero
L8001d0e4:
  sll $v0, $s1, 0x2
L8001d0e8:
  lbu $v1, 9($a0)
L8001d0ec:
  sll $zero, $zero, 0x0
L8001d0f0:
  bne $v1, $s0, L8001d104
L8001d0f4:
  addu $a2, $v0, $t0
L8001d0f8:
  lw $v0, 704($gp)
L8001d0fc:
  j L8001d140
L8001d100:
  sb $a3, 26($v0)
L8001d104:
  addiu $a1, $a1, 1
L8001d108:
  slti $v0, $a1, 5
L8001d10c:
  bne $v0, $zero, L8001d11c
L8001d110:
  addiu $a0, $a0, 12
L8001d114:
  j L8001d14c
L8001d118:
  addiu $s0, $zero, 8
L8001d11c:
  lbu $v0, 9($a0)
L8001d120:
  sll $zero, $zero, 0x0
L8001d124:
  bne $v0, $s0, L8001d108
L8001d128:
  addiu $a1, $a1, 1
L8001d12c:
  addiu $a1, $a1, -1
L8001d130:
  lw $v0, 704($gp)
L8001d134:
  sll $zero, $zero, 0x0
L8001d138:
  addu $v0, $v0, $a1
L8001d13c:
  sb $a3, 26($v0)
L8001d140:
  lw $v0, 0($a0)
L8001d144:
  addiu $s1, $s1, 1
L8001d148:
  sw $v0, 0($a2)
L8001d14c:
  addiu $s0, $s0, 1
L8001d150:
  slti $v0, $s0, 6
L8001d154:
  bne $v0, $zero, L8001d0e0
L8001d158:
  addu $a1, $zero, $zero
L8001d15c:
  addiu $v0, $zero, 6
L8001d160:
  sb $v0, 620($gp)
L8001d164:
  j L8001d21c
L8001d168:
  sll $zero, $zero, 0x0
L8001d16c:
  lbu $a0, 620($gp)
L8001d170:
  sll $zero, $zero, 0x0
L8001d174:
  andi $v0, $a0, 0x80
L8001d178:
  bne $v0, $zero, L8001d1ac
L8001d17c:
  addiu $v0, $zero, 12
L8001d180:
  lbu $v1, 717($gp)
L8001d184:
  sh $v0, 602($gp)
L8001d188:
  ori $v0, $a0, 0x80
L8001d18c:
  sb $v0, 620($gp)
L8001d190:
  sll $v0, $v1, 0x3
L8001d194:
  subu $v0, $v0, $v1
L8001d198:
  sll $v0, $v0, 0x4
L8001d19c:
  lui $v1, 0x800f
L8001d1a0:
  addiu $v1, $v1, -24760
L8001d1a4:
  addu $v0, $v0, $v1
L8001d1a8:
  sw $v0, 684($gp)
L8001d1ac:
  lhu $v0, 602($gp)
L8001d1b0:
  sll $zero, $zero, 0x0
L8001d1b4:
  bne $v0, $zero, L8001d21c
L8001d1b8:
  addiu $v0, $zero, 7
L8001d1bc:
  j L8001d218
L8001d1c0:
  sll $zero, $zero, 0x0
L8001d1c4:
  lbu $v1, 620($gp)
L8001d1c8:
  sll $zero, $zero, 0x0
L8001d1cc:
  andi $v0, $v1, 0x80
L8001d1d0:
  bne $v0, $zero, L8001d208
L8001d1d4:
  ori $v0, $v1, 0x80
L8001d1d8:
  lbu $v1, 717($gp)
L8001d1dc:
  sb $v0, 620($gp)
L8001d1e0:
  addiu $v0, $zero, 8
L8001d1e4:
  sw $zero, 0($s4)
L8001d1e8:
  sh $v0, 602($gp)
L8001d1ec:
  sll $v0, $v1, 0x3
L8001d1f0:
  subu $v0, $v0, $v1
L8001d1f4:
  sll $v0, $v0, 0x4
L8001d1f8:
  lui $v1, 0x800f
L8001d1fc:
  addiu $v1, $v1, -24816
L8001d200:
  addu $v0, $v0, $v1
L8001d204:
  sw $v0, 684($gp)
L8001d208:
  lhu $v0, 602($gp)
L8001d20c:
  sll $zero, $zero, 0x0
L8001d210:
  bne $v0, $zero, L8001d21c
L8001d214:
  addiu $v0, $zero, 6
L8001d218:
  sh $v0, 818($gp)
L8001d21c:
  lw $ra, 56($sp)
L8001d220:
  lw $s5, 52($sp)
L8001d224:
  lw $s4, 48($sp)
L8001d228:
  lw $s3, 44($sp)
L8001d22c:
  lw $s2, 40($sp)
L8001d230:
  lw $s1, 36($sp)
L8001d234:
  lw $s0, 32($sp)
L8001d238:
  jr $ra
L8001d23c:
  addiu $sp, $sp, 64
L8001d240:
  addiu $sp, $sp, -24
L8001d244:
  sw $s0, 16($sp)
L8001d248:
  sw $ra, 20($sp)
L8001d24c:
  jal 0x80042b98
L8001d250:
  addu $s0, $a0, $zero
L8001d254:
  bne $v0, $zero, L8001d290
L8001d258:
  sll $zero, $zero, 0x0
L8001d25c:
  lhu $v0, 8($s0)
L8001d260:
  lbu $v1, 34($s0)
L8001d264:
  ori $v0, $v0, 0x4
L8001d268:
  bne $v1, $zero, L8001d284
L8001d26c:
  sh $v0, 8($s0)
L8001d270:
  addiu $v0, $zero, -8
L8001d274:
  sh $v0, 40($s0)
L8001d278:
  addiu $v0, $zero, 192
L8001d27c:
  j L8001d290
L8001d280:
  sh $v0, 42($s0)
L8001d284:
  addiu $v0, $zero, 8
L8001d288:
  sh $v0, 40($s0)
L8001d28c:
  sh $zero, 42($s0)
L8001d290:
  lbu $v0, 34($s0)
L8001d294:
  lbu $v1, 40($s0)
L8001d298:
  sll $zero, $zero, 0x0
L8001d29c:
  addu $v0, $v0, $v1
L8001d2a0:
  sb $v0, 34($s0)
L8001d2a4:
  andi $v0, $v0, 0xff
L8001d2a8:
  sltiu $v0, $v0, 192
L8001d2ac:
  beq $v0, $zero, L8001d334
L8001d2b0:
  sll $zero, $zero, 0x0
L8001d2b4:
  lbu $v0, 106($s0)
L8001d2b8:
  sll $zero, $zero, 0x0
L8001d2bc:
  sll $v1, $v0, 0x3
L8001d2c0:
  subu $v1, $v1, $v0
L8001d2c4:
  sll $v1, $v1, 0x2
L8001d2c8:
  lui $v0, 0x801a
L8001d2cc:
  addiu $v0, $v0, 31448
L8001d2d0:
  addu $v1, $v1, $v0
L8001d2d4:
  lhu $v0, 22($v1)
L8001d2d8:
  sll $zero, $zero, 0x0
L8001d2dc:
  ori $v0, $v0, 0x800
L8001d2e0:
  sh $v0, 22($v1)
L8001d2e4:
  lbu $v0, 42($s0)
L8001d2e8:
  sll $zero, $zero, 0x0
L8001d2ec:
  sb $v0, 34($s0)
L8001d2f0:
  andi $v0, $v0, 0xff
L8001d2f4:
  bne $v0, $zero, L8001d32c
L8001d2f8:
  sll $zero, $zero, 0x0
L8001d2fc:
  lhu $v0, 22($v1)
L8001d300:
  sll $zero, $zero, 0x0
L8001d304:
  andi $v0, $v0, 0xf7ff
L8001d308:
  sh $v0, 22($v1)
L8001d30c:
  lbu $v0, 33($s0)
L8001d310:
  sll $zero, $zero, 0x0
L8001d314:
  bne $v0, $zero, L8001d32c
L8001d318:
  sll $zero, $zero, 0x0
L8001d31c:
  lhu $v0, 8($s0)
L8001d320:
  sll $zero, $zero, 0x0
L8001d324:
  andi $v0, $v0, 0xfffb
L8001d328:
  sh $v0, 8($s0)
L8001d32c:
  sb $zero, 108($s0)
L8001d330:
  sw $zero, 36($s0)
L8001d334:
  lw $ra, 20($sp)
L8001d338:
  lw $s0, 16($sp)
L8001d33c:
  jr $ra
L8001d340:
  addiu $sp, $sp, 24
L8001d344:
  lh $t2, 96($a0)
L8001d348:
  addiu $a3, $zero, 3
L8001d34c:
  addu $t1, $zero, $zero
L8001d350:
  addiu $a2, $a0, 12
L8001d354:
  addu $t0, $a0, $zero
L8001d358:
  lbu $v1, 0($a2)
L8001d35c:
  lh $a1, 40($t0)
L8001d360:
  sll $zero, $zero, 0x0
L8001d364:
  slt $v0, $v1, $a1
L8001d368:
  beq $v0, $zero, L8001d37c
L8001d36c:
  sll $zero, $zero, 0x0
L8001d370:
  addu $v1, $v1, $t2
L8001d374:
  j L8001d384
L8001d378:
  slt $v0, $v1, $a1
L8001d37c:
  subu $v1, $v1, $t2
L8001d380:
  slt $v0, $a1, $v1
L8001d384:
  bne $v0, $zero, L8001d394
L8001d388:
  sll $zero, $zero, 0x0
L8001d38c:
  addu $v1, $a1, $zero
L8001d390:
  addiu $a3, $a3, -1
L8001d394:
  sb $v1, 0($a2)
L8001d398:
  addiu $a2, $a2, 1
L8001d39c:
  addiu $t1, $t1, 1
L8001d3a0:
  slti $v0, $t1, 3
L8001d3a4:
  bne $v0, $zero, L8001d358
L8001d3a8:
  addiu $t0, $t0, 2
L8001d3ac:
  bne $a3, $zero, L8001d3bc
L8001d3b0:
  sll $zero, $zero, 0x0
L8001d3b4:
  sb $zero, 108($a0)
L8001d3b8:
  sw $zero, 36($a0)
L8001d3bc:
  jr $ra
L8001d3c0:
  sll $zero, $zero, 0x0
L8001d3c4:
  addiu $sp, $sp, -24
L8001d3c8:
  sw $s0, 16($sp)
L8001d3cc:
  sw $ra, 20($sp)
L8001d3d0:
  jal 0x80042b98
L8001d3d4:
  addu $s0, $a0, $zero
L8001d3d8:
  bne $v0, $zero, L8001d418
L8001d3dc:
  sll $zero, $zero, 0x0
L8001d3e0:
  lh $v1, 44($s0)
L8001d3e4:
  lbu $v0, 33($s0)
L8001d3e8:
  sll $zero, $zero, 0x0
L8001d3ec:
  beq $v1, $v0, L8001d404
L8001d3f0:
  sll $zero, $zero, 0x0
L8001d3f4:
  lhu $v0, 8($s0)
L8001d3f8:
  sll $zero, $zero, 0x0
L8001d3fc:
  ori $v0, $v0, 0x4
L8001d400:
  sh $v0, 8($s0)
L8001d404:
  lhu $v0, 96($s0)
L8001d408:
  addu $a0, $s0, $zero
L8001d40c:
  jal 0x80043178
L8001d410:
  sh $v0, 46($s0)
L8001d414:
  sh $zero, 96($s0)
L8001d418:
  lbu $a0, 33($s0)
L8001d41c:
  lh $v0, 44($s0)
L8001d420:
  sll $zero, $zero, 0x0
L8001d424:
  beq $a0, $v0, L8001d46c
L8001d428:
  addiu $v0, $zero, 128
L8001d42c:
  lh $v1, 46($s0)
L8001d430:
  sll $zero, $zero, 0x0
L8001d434:
  .word 0x0043001a
L8001d438:
  bne $v1, $zero, L8001d444
L8001d43c:
  sll $zero, $zero, 0x0
L8001d440:
  .word 0x0007000d
L8001d444:
  addiu $at, $zero, -1
L8001d448:
  bne $v1, $at, L8001d45c
L8001d44c:
  lui $at, 0x8000
L8001d450:
  bne $v0, $at, L8001d45c
L8001d454:
  sll $zero, $zero, 0x0
L8001d458:
  .word 0x0006000d
L8001d45c:
  mflo $v0
L8001d460:
  sll $zero, $zero, 0x0
L8001d464:
  addu $v0, $a0, $v0
L8001d468:
  sb $v0, 33($s0)
L8001d46c:
  lh $a1, 40($s0)
L8001d470:
  lh $a2, 42($s0)
L8001d474:
  lh $a3, 96($s0)
L8001d478:
  jal 0x8004318c
L8001d47c:
  addu $a0, $s0, $zero
L8001d480:
  lh $v0, 46($s0)
L8001d484:
  addiu $v1, $zero, 2048
L8001d488:
  .word 0x0062001a
L8001d48c:
  bne $v0, $zero, L8001d498
L8001d490:
  sll $zero, $zero, 0x0
L8001d494:
  .word 0x0007000d
L8001d498:
  addiu $at, $zero, -1
L8001d49c:
  bne $v0, $at, L8001d4b0
L8001d4a0:
  lui $at, 0x8000
L8001d4a4:
  bne $v1, $at, L8001d4b0
L8001d4a8:
  sll $zero, $zero, 0x0
L8001d4ac:
  .word 0x0006000d
L8001d4b0:
  mflo $v1
L8001d4b4:
  lhu $v0, 96($s0)
L8001d4b8:
  sll $zero, $zero, 0x0
L8001d4bc:
  addu $v0, $v0, $v1
L8001d4c0:
  sh $v0, 96($s0)
L8001d4c4:
  sll $v0, $v0, 0x10
L8001d4c8:
  sra $v0, $v0, 0x10
L8001d4cc:
  slti $v0, $v0, 2048
L8001d4d0:
  bne $v0, $zero, L8001d508
L8001d4d4:
  sll $zero, $zero, 0x0
L8001d4d8:
  lbu $v0, 44($s0)
L8001d4dc:
  lw $v1, 40($s0)
L8001d4e0:
  sb $v0, 33($s0)
L8001d4e4:
  andi $v0, $v0, 0xff
L8001d4e8:
  bne $v0, $zero, L8001d500
L8001d4ec:
  sw $v1, 48($s0)
L8001d4f0:
  lhu $v0, 8($s0)
L8001d4f4:
  sll $zero, $zero, 0x0
L8001d4f8:
  andi $v0, $v0, 0xfffb
L8001d4fc:
  sh $v0, 8($s0)
L8001d500:
  sb $zero, 108($s0)
L8001d504:
  sw $zero, 36($s0)
L8001d508:
  lw $ra, 20($sp)
L8001d50c:
  lw $s0, 16($sp)
L8001d510:
  jr $ra
L8001d514:
  addiu $sp, $sp, 24
L8001d518:
  addiu $sp, $sp, -40
L8001d51c:
  sw $s0, 24($sp)
L8001d520:
  lw $s0, 752($gp)
L8001d524:
  sw $s1, 28($sp)
L8001d528:
  addu $s1, $a0, $zero
L8001d52c:
  bne $s0, $zero, L8001d59c
L8001d530:
  sw $ra, 32($sp)
L8001d534:
  jal 0x8004002c
L8001d538:
  sll $zero, $zero, 0x0
L8001d53c:
  addu $a0, $v0, $zero
L8001d540:
  jal 0x800400ac
L8001d544:
  addiu $a1, $zero, 2
L8001d548:
  addu $s0, $v0, $zero
L8001d54c:
  addu $a0, $s0, $zero
L8001d550:
  addiu $a1, $zero, 4
L8001d554:
  addiu $v0, $zero, 11
L8001d558:
  sw $v0, 16($sp)
L8001d55c:
  addiu $v0, $zero, 496
L8001d560:
  addiu $a2, $zero, 3
L8001d564:
  addiu $a3, $zero, 8
L8001d568:
  jal 0x80040468
L8001d56c:
  sw $v0, 20($sp)
L8001d570:
  addu $a0, $s0, $zero
L8001d574:
  lbu $v0, 10($s1)
L8001d578:
  addiu $a1, $zero, 1
L8001d57c:
  jal 0x800428ec
L8001d580:
  sb $v0, 106($s0)
L8001d584:
  lui $v0, 0x8001
L8001d588:
  lhu $v1, 8($s0)
L8001d58c:
  addiu $v0, $v0, 23992
L8001d590:
  sw $v0, 36($s0)
L8001d594:
  ori $v1, $v1, 0x8
L8001d598:
  sh $v1, 8($s0)
L8001d59c:
  addu $v0, $s0, $zero
L8001d5a0:
  lw $ra, 32($sp)
L8001d5a4:
  lw $s1, 28($sp)
L8001d5a8:
  lw $s0, 24($sp)
L8001d5ac:
  jr $ra
L8001d5b0:
  addiu $sp, $sp, 40
L8001d5b4:
  lhu $v0, 602($gp)
L8001d5b8:
  addiu $sp, $sp, -24
L8001d5bc:
  sw $s0, 16($sp)
L8001d5c0:
  addu $s0, $a0, $zero
L8001d5c4:
  beq $v0, $zero, L8001d5d4
L8001d5c8:
  sw $ra, 20($sp)
L8001d5cc:
  j L8001d658
L8001d5d0:
  addiu $v0, $zero, -1
L8001d5d4:
  lb $a1, 600($gp)
L8001d5d8:
  jal 0x80024088
L8001d5dc:
  addu $a0, $s0, $zero
L8001d5e0:
  beq $v0, $zero, L8001d5f0
L8001d5e4:
  addiu $v0, $zero, -1
L8001d5e8:
  j L8001d660
L8001d5ec:
  addiu $v0, $zero, 1
L8001d5f0:
  lb $v1, 719($gp)
L8001d5f4:
  sb $v0, 600($gp)
L8001d5f8:
  lb $v0, 16($s0)
L8001d5fc:
  sll $zero, $zero, 0x0
L8001d600:
  beq $v1, $v0, L8001d62c
L8001d604:
  addiu $v0, $zero, 1
L8001d608:
  sb $v0, 600($gp)
L8001d60c:
  lb $v0, 16($s0)
L8001d610:
  sll $zero, $zero, 0x0
L8001d614:
  slt $v0, $v1, $v0
L8001d618:
  beq $v0, $zero, L8001d5e8
L8001d61c:
  addiu $v0, $zero, 3
L8001d620:
  sb $v0, 600($gp)
L8001d624:
  j L8001d660
L8001d628:
  addiu $v0, $zero, 1
L8001d62c:
  lb $v1, 718($gp)
L8001d630:
  lb $v0, 15($s0)
L8001d634:
  sll $zero, $zero, 0x0
L8001d638:
  beq $v1, $v0, L8001d660
L8001d63c:
  addu $v0, $zero, $zero
L8001d640:
  sb $zero, 600($gp)
L8001d644:
  lb $v0, 15($s0)
L8001d648:
  sll $zero, $zero, 0x0
L8001d64c:
  slt $v0, $v1, $v0
L8001d650:
  beq $v0, $zero, L8001d5e8
L8001d654:
  addiu $v0, $zero, 2
L8001d658:
  sb $v0, 600($gp)
L8001d65c:
  addiu $v0, $zero, 1
L8001d660:
  lw $ra, 20($sp)
L8001d664:
  lw $s0, 16($sp)
L8001d668:
  jr $ra
L8001d66c:
  addiu $sp, $sp, 24
L8001d670:
  addiu $sp, $sp, -64
L8001d674:
  lui $v1, 0x800f
L8001d678:
  lbu $a0, 717($gp)
L8001d67c:
  lhu $a1, 818($gp)
L8001d680:
  addiu $v1, $v1, -24760
L8001d684:
  sw $ra, 56($sp)
L8001d688:
  sw $s7, 52($sp)
L8001d68c:
  sw $s6, 48($sp)
L8001d690:
  sw $s5, 44($sp)
L8001d694:
  sw $s4, 40($sp)
L8001d698:
  sw $s3, 36($sp)
L8001d69c:
  sw $s2, 32($sp)
L8001d6a0:
  sw $s1, 28($sp)
L8001d6a4:
  sll $v0, $a0, 0x3
L8001d6a8:
  subu $v0, $v0, $a0
L8001d6ac:
  sll $v0, $v0, 0x4
L8001d6b0:
  addu $s5, $v0, $v1
L8001d6b4:
  andi $v0, $a1, 0x8000
L8001d6b8:
  bne $v0, $zero, L8001d75c
L8001d6bc:
  sw $s0, 24($sp)
L8001d6c0:
  lui $v0, 0x800f
L8001d6c4:
  addiu $a2, $v0, -24592
L8001d6c8:
  lh $v1, 20($a2)
L8001d6cc:
  ori $v0, $a1, 0x8000
L8001d6d0:
  sh $v0, 818($gp)
L8001d6d4:
  beq $v1, $zero, L8001d6f0
L8001d6d8:
  sll $v0, $a0, 0x5
L8001d6dc:
  lh $v0, 52($a2)
L8001d6e0:
  sll $zero, $zero, 0x0
L8001d6e4:
  bne $v0, $zero, L8001d728
L8001d6e8:
  addiu $v1, $zero, 1
L8001d6ec:
  sll $v0, $a0, 0x5
L8001d6f0:
  addu $v0, $v0, $a2
L8001d6f4:
  lh $v0, 20($v0)
L8001d6f8:
  sb $a0, 605($gp)
L8001d6fc:
  bne $v0, $zero, L8001d70c
L8001d700:
  sll $zero, $zero, 0x0
L8001d704:
  xori $v0, $a0, 0x1
L8001d708:
  sb $v0, 605($gp)
L8001d70c:
  lbu $v0, 605($gp)
L8001d710:
  addiu $v1, $zero, 2
L8001d714:
  sll $v0, $v0, 0x5
L8001d718:
  addu $v0, $v0, $a2
L8001d71c:
  sb $v1, 0($v0)
L8001d720:
  j L8001ec40
L8001d724:
  addiu $v0, $zero, 12
L8001d728:
  addiu $v0, $zero, 4
L8001d72c:
  sw $zero, 752($gp)
L8001d730:
  sb $zero, 786($gp)
L8001d734:
  sw $s5, 684($gp)
L8001d738:
  sb $v0, 18($s5)
L8001d73c:
  addiu $v0, $zero, 174
L8001d740:
  sh $v0, 12($s5)
L8001d744:
  addiu $v0, $zero, 3
L8001d748:
  sb $v1, 24($s5)
L8001d74c:
  sb $zero, 19($s5)
L8001d750:
  sb $zero, 17($s5)
L8001d754:
  sh $v0, 602($gp)
L8001d758:
  sb $v1, 620($gp)
L8001d75c:
  lbu $v0, 620($gp)
L8001d760:
  sll $zero, $zero, 0x0
L8001d764:
  andi $v0, $v0, 0xf
L8001d768:
  addiu $v1, $v0, -1
L8001d76c:
  sltiu $v0, $v1, 11
L8001d770:
  beq $v0, $zero, L8001ec44
L8001d774:
  lui $v0, 0x8001
L8001d778:
  addiu $v0, $v0, 352
L8001d77c:
  sll $v1, $v1, 0x2
L8001d780:
  addu $v1, $v1, $v0
L8001d784:
  lw $v0, 0($v1)
L8001d788:
  sll $zero, $zero, 0x0
L8001d78c:
  jr $v0
L8001d790:
  sll $zero, $zero, 0x0
L8001d794:
  lhu $v0, 602($gp)
L8001d798:
  sll $zero, $zero, 0x0
L8001d79c:
  bne $v0, $zero, L8001ec44
L8001d7a0:
  addiu $v0, $zero, 3
L8001d7a4:
  sb $v0, 620($gp)
L8001d7a8:
  j L8001ec44
L8001d7ac:
  sll $zero, $zero, 0x0
L8001d7b0:
  lbu $v1, 620($gp)
L8001d7b4:
  sll $zero, $zero, 0x0
L8001d7b8:
  andi $v0, $v1, 0x80
L8001d7bc:
  bne $v0, $zero, L8001d7ec
L8001d7c0:
  addiu $s0, $zero, 1
L8001d7c4:
  ori $v0, $v1, 0x80
L8001d7c8:
  sb $v0, 620($gp)
L8001d7cc:
  jal 0x80028220
L8001d7d0:
  sll $zero, $zero, 0x0
L8001d7d4:
  lui $a0, 0x801b
L8001d7d8:
  jal 0x800705d8
L8001d7dc:
  addiu $a0, $a0, -26624
L8001d7e0:
  sh $zero, 772($gp)
L8001d7e4:
  j L8001ec44
L8001d7e8:
  sll $zero, $zero, 0x0
L8001d7ec:
  lhu $a2, 772($gp)
L8001d7f0:
  sll $zero, $zero, 0x0
L8001d7f4:
  andi $s1, $a2, 0xf
L8001d7f8:
  beq $s1, $s0, L8001d85c
L8001d7fc:
  slti $v0, $s1, 2
L8001d800:
  beq $v0, $zero, L8001d818
L8001d804:
  sll $zero, $zero, 0x0
L8001d808:
  beq $s1, $zero, L8001d834
L8001d80c:
  sll $zero, $zero, 0x0
L8001d810:
  j L8001ec44
L8001d814:
  sll $zero, $zero, 0x0
L8001d818:
  addiu $v0, $zero, 2
L8001d81c:
  beq $s1, $v0, L8001d9ac
L8001d820:
  addiu $v0, $zero, 3
L8001d824:
  beq $s1, $v0, L8001da6c
L8001d828:
  andi $v0, $a2, 0x8000
L8001d82c:
  j L8001ec44
L8001d830:
  sll $zero, $zero, 0x0
L8001d834:
  jal 0x80070650
L8001d838:
  sll $zero, $zero, 0x0
L8001d83c:
  addu $s4, $v0, $zero
L8001d840:
  beq $s4, $zero, L8001ec44
L8001d844:
  addiu $v0, $zero, 3
L8001d848:
  beq $s4, $v0, L8001ebdc
L8001d84c:
  sll $zero, $zero, 0x0
L8001d850:
  sh $s0, 772($gp)
L8001d854:
  j L8001ec44
L8001d858:
  sll $zero, $zero, 0x0
L8001d85c:
  andi $v0, $a2, 0x8000
L8001d860:
  bne $v0, $zero, L8001d8c4
L8001d864:
  lui $v1, 0x6666
L8001d868:
  lui $v0, 0x800f
L8001d86c:
  lbu $s4, -20847($v0)
L8001d870:
  ori $v1, $v1, 0x6667
L8001d874:
  addiu $a0, $s4, -1
L8001d878:
  mult $a0, $v1
L8001d87c:
  ori $v0, $a2, 0x8000
L8001d880:
  sh $v0, 772($gp)
L8001d884:
  addiu $v0, $zero, -1
L8001d888:
  sb $v0, 600($gp)
L8001d88c:
  addiu $v0, $zero, 2
L8001d890:
  sb $v0, 719($gp)
L8001d894:
  sra $v0, $a0, 0x1f
L8001d898:
  mfhi $t2
L8001d89c:
  sra $v1, $t2, 0x1
L8001d8a0:
  subu $v1, $v1, $v0
L8001d8a4:
  sll $v0, $v1, 0x2
L8001d8a8:
  addu $v0, $v0, $v1
L8001d8ac:
  subu $a0, $a0, $v0
L8001d8b0:
  slti $v0, $s4, 6
L8001d8b4:
  sb $a0, 718($gp)
L8001d8b8:
  bne $v0, $zero, L8001d8c4
L8001d8bc:
  addiu $v0, $zero, 3
L8001d8c0:
  sb $v0, 719($gp)
L8001d8c4:
  jal L8001d5b4
L8001d8c8:
  addu $a0, $s5, $zero
L8001d8cc:
  bne $v0, $zero, L8001ec44
L8001d8d0:
  lui $v0, 0x800f
L8001d8d4:
  addiu $v1, $v0, -20856
L8001d8d8:
  lbu $v0, 10($v1)
L8001d8dc:
  sll $zero, $zero, 0x0
L8001d8e0:
  bne $v0, $zero, L8001d974
L8001d8e4:
  lui $v0, 0x800f
L8001d8e8:
  lbu $v0, 11($v1)
L8001d8ec:
  sll $zero, $zero, 0x0
L8001d8f0:
  bne $v0, $zero, L8001d974
L8001d8f4:
  lui $v0, 0x800f
L8001d8f8:
  lui $a1, 0x8009
L8001d8fc:
  lb $v0, 16($s5)
L8001d900:
  addiu $a1, $a1, 2008
L8001d904:
  sll $v1, $v0, 0x2
L8001d908:
  addu $v1, $v1, $v0
L8001d90c:
  lb $v0, 15($s5)
L8001d910:
  lbu $a0, 717($gp)
L8001d914:
  addu $v1, $v1, $v0
L8001d918:
  sll $v0, $a0, 0x2
L8001d91c:
  addu $v0, $v0, $a0
L8001d920:
  sll $v0, $v0, 0x2
L8001d924:
  addu $v1, $v1, $v0
L8001d928:
  addu $v1, $v1, $a1
L8001d92c:
  lbu $v0, 0($v1)
L8001d930:
  sll $zero, $zero, 0x0
L8001d934:
  sll $v1, $v0, 0x3
L8001d938:
  subu $v1, $v1, $v0
L8001d93c:
  sll $v1, $v1, 0x2
L8001d940:
  lui $v0, 0x801a
L8001d944:
  addiu $v0, $v0, 31448
L8001d948:
  addu $s0, $v1, $v0
L8001d94c:
  lhu $v1, 22($s0)
L8001d950:
  sll $zero, $zero, 0x0
L8001d954:
  andi $v0, $v1, 0x8000
L8001d958:
  beq $v0, $zero, L8001db64
L8001d95c:
  ori $v0, $v1, 0x4000
L8001d960:
  lw $a0, 0($s0)
L8001d964:
  jal 0x80017e3c
L8001d968:
  sh $v0, 22($s0)
L8001d96c:
  j L8001db68
L8001d970:
  addiu $v0, $zero, 2
L8001d974:
  addiu $a0, $v0, -20856
L8001d978:
  lbu $v1, 11($a0)
L8001d97c:
  addiu $v0, $zero, 3
L8001d980:
  sh $v0, 772($gp)
L8001d984:
  beq $v1, $zero, L8001ec44
L8001d988:
  sll $zero, $zero, 0x0
L8001d98c:
  lbu $v0, 9($a0)
L8001d990:
  sll $zero, $zero, 0x0
L8001d994:
  sltiu $v0, $v0, 6
L8001d998:
  beq $v0, $zero, L8001ec44
L8001d99c:
  addiu $v0, $zero, 2
L8001d9a0:
  sh $v0, 772($gp)
L8001d9a4:
  j L8001ec44
L8001d9a8:
  sll $zero, $zero, 0x0
L8001d9ac:
  lui $a1, 0x8009
L8001d9b0:
  lb $v0, 16($s5)
L8001d9b4:
  addiu $a1, $a1, 2008
L8001d9b8:
  sll $v1, $v0, 0x2
L8001d9bc:
  addu $v1, $v1, $v0
L8001d9c0:
  lb $v0, 15($s5)
L8001d9c4:
  lbu $a0, 717($gp)
L8001d9c8:
  addu $v1, $v1, $v0
L8001d9cc:
  sll $v0, $a0, 0x2
L8001d9d0:
  addu $v0, $v0, $a0
L8001d9d4:
  sll $v0, $v0, 0x2
L8001d9d8:
  addu $v1, $v1, $v0
L8001d9dc:
  addu $v1, $v1, $a1
L8001d9e0:
  lbu $v0, 0($v1)
L8001d9e4:
  sll $zero, $zero, 0x0
L8001d9e8:
  sll $v1, $v0, 0x3
L8001d9ec:
  subu $v1, $v1, $v0
L8001d9f0:
  sll $v1, $v1, 0x2
L8001d9f4:
  lui $v0, 0x801a
L8001d9f8:
  addiu $v0, $v0, 31448
L8001d9fc:
  addu $s0, $v1, $v0
L8001da00:
  andi $v0, $a2, 0x8000
L8001da04:
  bne $v0, $zero, L8001da3c
L8001da08:
  ori $v0, $a2, 0x8000
L8001da0c:
  lhu $v1, 22($s0)
L8001da10:
  sh $v0, 772($gp)
L8001da14:
  andi $v0, $v1, 0x8000
L8001da18:
  beq $v0, $zero, L8001db64
L8001da1c:
  andi $v0, $v1, 0x800
L8001da20:
  beq $v0, $zero, L8001dae8
L8001da24:
  ori $v0, $v1, 0x4000
L8001da28:
  lw $a0, 0($s0)
L8001da2c:
  jal 0x80017e3c
L8001da30:
  sh $v0, 22($s0)
L8001da34:
  j L8001db68
L8001da38:
  addiu $v0, $zero, 2
L8001da3c:
  jal 0x80042b40
L8001da40:
  addiu $a0, $zero, 15
L8001da44:
  bne $v0, $zero, L8001ec44
L8001da48:
  sll $zero, $zero, 0x0
L8001da4c:
  lhu $v0, 22($s0)
L8001da50:
  lw $a0, 0($s0)
L8001da54:
  ori $v0, $v0, 0x4000
L8001da58:
  jal 0x80017e3c
L8001da5c:
  sh $v0, 22($s0)
L8001da60:
  sb $s1, 620($gp)
L8001da64:
  j L8001ec44
L8001da68:
  sll $zero, $zero, 0x0
L8001da6c:
  bne $v0, $zero, L8001db04
L8001da70:
  andi $v0, $a2, 0x4000
L8001da74:
  ori $v0, $a2, 0x8000
L8001da78:
  lui $a1, 0x8009
L8001da7c:
  sh $v0, 772($gp)
L8001da80:
  lb $v0, 16($s5)
L8001da84:
  addiu $a1, $a1, 2008
L8001da88:
  sll $v1, $v0, 0x2
L8001da8c:
  addu $v1, $v1, $v0
L8001da90:
  lb $v0, 15($s5)
L8001da94:
  lbu $a0, 717($gp)
L8001da98:
  addu $v1, $v1, $v0
L8001da9c:
  sll $v0, $a0, 0x2
L8001daa0:
  addu $v0, $v0, $a0
L8001daa4:
  sll $v0, $v0, 0x2
L8001daa8:
  addu $v1, $v1, $v0
L8001daac:
  addu $v1, $v1, $a1
L8001dab0:
  lbu $v0, 0($v1)
L8001dab4:
  sll $zero, $zero, 0x0
L8001dab8:
  sll $v1, $v0, 0x3
L8001dabc:
  subu $v1, $v1, $v0
L8001dac0:
  sll $v1, $v1, 0x2
L8001dac4:
  lui $v0, 0x801a
L8001dac8:
  addiu $v0, $v0, 31448
L8001dacc:
  addu $s0, $v1, $v0
L8001dad0:
  lhu $v0, 22($s0)
L8001dad4:
  sll $zero, $zero, 0x0
L8001dad8:
  andi $v0, $v0, 0x800
L8001dadc:
  beq $v0, $zero, L8001ec44
L8001dae0:
  ori $v0, $a2, 0xc000
L8001dae4:
  sh $v0, 772($gp)
L8001dae8:
  lui $v0, 0x8002
L8001daec:
  lw $s2, 0($s0)
L8001daf0:
  addiu $v0, $v0, -11712
L8001daf4:
  sw $v0, 36($s2)
L8001daf8:
  addiu $v0, $zero, 15
L8001dafc:
  j L8001ec44
L8001db00:
  sb $v0, 108($s2)
L8001db04:
  beq $v0, $zero, L8001db1c
L8001db08:
  sll $zero, $zero, 0x0
L8001db0c:
  jal 0x80042b40
L8001db10:
  addiu $a0, $zero, 15
L8001db14:
  bne $v0, $zero, L8001ec44
L8001db18:
  sll $zero, $zero, 0x0
L8001db1c:
  sb $s0, 786($gp)
L8001db20:
  j L8001de00
L8001db24:
  sll $zero, $zero, 0x0
L8001db28:
  lbu $v1, 620($gp)
L8001db2c:
  sll $zero, $zero, 0x0
L8001db30:
  andi $v0, $v1, 0x80
L8001db34:
  bne $v0, $zero, L8001db78
L8001db38:
  ori $v0, $v1, 0xc0
L8001db3c:
  sb $v0, 620($gp)
L8001db40:
  lbu $v0, 717($gp)
L8001db44:
  lui $v1, 0x800a
L8001db48:
  addiu $v1, $v1, -19616
L8001db4c:
  sb $zero, 786($gp)
L8001db50:
  addu $v0, $v0, $v1
L8001db54:
  lb $v0, 0($v0)
L8001db58:
  sll $zero, $zero, 0x0
L8001db5c:
  bltz $v0, L8001db74
L8001db60:
  sll $zero, $zero, 0x0
L8001db64:
  addiu $v0, $zero, 2
L8001db68:
  sb $v0, 620($gp)
L8001db6c:
  j L8001ec44
L8001db70:
  sll $zero, $zero, 0x0
L8001db74:
  sb $zero, 25($s5)
L8001db78:
  jal 0x80042b40
L8001db7c:
  addiu $a0, $zero, 15
L8001db80:
  bne $v0, $zero, L8001ec44
L8001db84:
  sll $zero, $zero, 0x0
L8001db88:
  jal 0x80024060
L8001db8c:
  addu $a0, $s5, $zero
L8001db90:
  beq $v0, $zero, L8001dba4
L8001db94:
  sll $zero, $zero, 0x0
L8001db98:
  lbu $v0, 620($gp)
L8001db9c:
  j L8001e300
L8001dba0:
  ori $v0, $v0, 0x40
L8001dba4:
  lbu $v1, 620($gp)
L8001dba8:
  sll $zero, $zero, 0x0
L8001dbac:
  andi $v0, $v1, 0x40
L8001dbb0:
  beq $v0, $zero, L8001dc40
L8001dbb4:
  andi $v0, $v1, 0xbf
L8001dbb8:
  sb $v0, 620($gp)
L8001dbbc:
  lb $v1, 16($s5)
L8001dbc0:
  addiu $v0, $zero, 2
L8001dbc4:
  bne $v1, $v0, L8001dc30
L8001dbc8:
  lui $a1, 0x8009
L8001dbcc:
  addiu $a1, $a1, 2008
L8001dbd0:
  lb $v1, 15($s5)
L8001dbd4:
  lbu $a0, 717($gp)
L8001dbd8:
  addiu $v1, $v1, 10
L8001dbdc:
  sllv $v0, $a0, $v0
L8001dbe0:
  addu $v0, $v0, $a0
L8001dbe4:
  sll $v0, $v0, 0x2
L8001dbe8:
  addu $v1, $v1, $v0
L8001dbec:
  addu $v1, $v1, $a1
L8001dbf0:
  lui $a0, 0x801a
L8001dbf4:
  lbu $v1, 0($v1)
L8001dbf8:
  addiu $a0, $a0, 31448
L8001dbfc:
  sll $v0, $v1, 0x3
L8001dc00:
  subu $v0, $v0, $v1
L8001dc04:
  sll $v0, $v0, 0x2
L8001dc08:
  jal 0x8001700c
L8001dc0c:
  addu $a0, $v0, $a0
L8001dc10:
  beq $v0, $zero, L8001dc30
L8001dc14:
  sll $zero, $zero, 0x0
L8001dc18:
  lw $a0, 4($s5)
L8001dc1c:
  jal L8001d518
L8001dc20:
  sll $zero, $zero, 0x0
L8001dc24:
  sw $v0, 752($gp)
L8001dc28:
  j L8001dc40
L8001dc2c:
  sll $zero, $zero, 0x0
L8001dc30:
  lw $a0, 752($gp)
L8001dc34:
  jal 0x8004036c
L8001dc38:
  sll $zero, $zero, 0x0
L8001dc3c:
  sw $zero, 752($gp)
L8001dc40:
  lbu $v0, 717($gp)
L8001dc44:
  lui $v1, 0x800a
L8001dc48:
  addiu $v1, $v1, -19616
L8001dc4c:
  addu $v0, $v0, $v1
L8001dc50:
  lb $v0, 0($v0)
L8001dc54:
  sll $zero, $zero, 0x0
L8001dc58:
  bgez $v0, L8001dc84
L8001dc5c:
  sll $zero, $zero, 0x0
L8001dc60:
  lui $v0, 0x800a
L8001dc64:
  lhu $v0, -19560($v0)
L8001dc68:
  sll $zero, $zero, 0x0
L8001dc6c:
  andi $v0, $v0, 0x800
L8001dc70:
  beq $v0, $zero, L8001dc84
L8001dc74:
  addiu $v0, $zero, 11
L8001dc78:
  sb $v0, 620($gp)
L8001dc7c:
  j L8001ec44
L8001dc80:
  sll $zero, $zero, 0x0
L8001dc84:
  jal L8001bd48
L8001dc88:
  sll $zero, $zero, 0x0
L8001dc8c:
  bne $v0, $zero, L8001ec44
L8001dc90:
  sll $zero, $zero, 0x0
L8001dc94:
  lui $v0, 0x800a
L8001dc98:
  lhu $v0, -19560($v0)
L8001dc9c:
  sll $zero, $zero, 0x0
L8001dca0:
  andi $v0, $v0, 0xc
L8001dca4:
  beq $v0, $zero, L8001dd3c
L8001dca8:
  lui $a1, 0x8009
L8001dcac:
  addiu $a1, $a1, 2008
L8001dcb0:
  lb $a2, 16($s5)
L8001dcb4:
  lb $v0, 15($s5)
L8001dcb8:
  lbu $a0, 717($gp)
L8001dcbc:
  sll $v1, $a2, 0x2
L8001dcc0:
  addu $v1, $v1, $a2
L8001dcc4:
  addu $v1, $v1, $v0
L8001dcc8:
  sll $v0, $a0, 0x2
L8001dccc:
  addu $v0, $v0, $a0
L8001dcd0:
  sll $v0, $v0, 0x2
L8001dcd4:
  addu $v1, $v1, $v0
L8001dcd8:
  addu $v1, $v1, $a1
L8001dcdc:
  lbu $v0, 0($v1)
L8001dce0:
  sll $zero, $zero, 0x0
L8001dce4:
  sll $v1, $v0, 0x3
L8001dce8:
  subu $v1, $v1, $v0
L8001dcec:
  sll $v1, $v1, 0x2
L8001dcf0:
  lui $v0, 0x801a
L8001dcf4:
  addiu $v0, $v0, 31448
L8001dcf8:
  addu $s0, $v1, $v0
L8001dcfc:
  addiu $v0, $zero, 2
L8001dd00:
  bne $a2, $v0, L8001ec44
L8001dd04:
  sll $zero, $zero, 0x0
L8001dd08:
  jal 0x8001700c
L8001dd0c:
  addu $a0, $s0, $zero
L8001dd10:
  beq $v0, $zero, L8001ec44
L8001dd14:
  addiu $a0, $zero, 11
L8001dd18:
  lui $v0, 0x8002
L8001dd1c:
  lw $s2, 0($s0)
L8001dd20:
  addiu $v0, $v0, -11712
L8001dd24:
  sw $v0, 36($s2)
L8001dd28:
  addiu $v0, $zero, 15
L8001dd2c:
  jal 0x8003fee0
L8001dd30:
  sb $v0, 108($s2)
L8001dd34:
  j L8001ec44
L8001dd38:
  sll $zero, $zero, 0x0
L8001dd3c:
  lb $v0, 16($s5)
L8001dd40:
  addiu $a1, $a1, 2008
L8001dd44:
  sll $v1, $v0, 0x2
L8001dd48:
  addu $v1, $v1, $v0
L8001dd4c:
  lb $v0, 15($s5)
L8001dd50:
  lbu $a0, 717($gp)
L8001dd54:
  addu $v1, $v1, $v0
L8001dd58:
  sll $v0, $a0, 0x2
L8001dd5c:
  addu $v0, $v0, $a0
L8001dd60:
  sll $v0, $v0, 0x2
L8001dd64:
  addu $v1, $v1, $v0
L8001dd68:
  addu $v1, $v1, $a1
L8001dd6c:
  lui $a0, 0x801a
L8001dd70:
  lbu $v1, 0($v1)
L8001dd74:
  addiu $a0, $a0, 31448
L8001dd78:
  sll $v0, $v1, 0x3
L8001dd7c:
  subu $v0, $v0, $v1
L8001dd80:
  sll $v0, $v0, 0x2
L8001dd84:
  jal 0x80017034
L8001dd88:
  addu $a0, $v0, $a0
L8001dd8c:
  addu $s4, $v0, $zero
L8001dd90:
  bne $s4, $zero, L8001e36c
L8001dd94:
  addiu $v0, $zero, 20
L8001dd98:
  lui $v0, 0x800a
L8001dd9c:
  lhu $v0, -19560($v0)
L8001dda0:
  sll $zero, $zero, 0x0
L8001dda4:
  andi $v0, $v0, 0xc0
L8001dda8:
  beq $v0, $zero, L8001ec44
L8001ddac:
  addiu $v0, $zero, 2
L8001ddb0:
  lb $v1, 16($s5)
L8001ddb4:
  sll $zero, $zero, 0x0
L8001ddb8:
  bne $v1, $v0, L8001ddec
L8001ddbc:
  sll $zero, $zero, 0x0
L8001ddc0:
  lw $v0, 704($gp)
L8001ddc4:
  sll $zero, $zero, 0x0
L8001ddc8:
  lb $v0, 25($v0)
L8001ddcc:
  sll $zero, $zero, 0x0
L8001ddd0:
  bne $v0, $zero, L8001e4b4
L8001ddd4:
  sll $zero, $zero, 0x0
L8001ddd8:
  lhu $v0, 612($gp)
L8001dddc:
  sll $zero, $zero, 0x0
L8001dde0:
  andi $v0, $v0, 0x1000
L8001dde4:
  bne $v0, $zero, L8001e4b4
L8001dde8:
  sll $zero, $zero, 0x0
L8001ddec:
  lb $v0, 16($s5)
L8001ddf0:
  sll $zero, $zero, 0x0
L8001ddf4:
  slti $v0, $v0, 2
L8001ddf8:
  bne $v0, $zero, L8001e4b4
L8001ddfc:
  sll $zero, $zero, 0x0
L8001de00:
  lb $v1, 16($s5)
L8001de04:
  lb $a0, 15($s5)
L8001de08:
  sll $v0, $v1, 0x2
L8001de0c:
  addu $v0, $v0, $v1
L8001de10:
  addu $a2, $v0, $a0
L8001de14:
  lui $v1, 0x8009
L8001de18:
  lbu $a0, 717($gp)
L8001de1c:
  addiu $v1, $v1, 2008
L8001de20:
  sll $v0, $a0, 0x2
L8001de24:
  addu $v0, $v0, $a0
L8001de28:
  sll $v0, $v0, 0x2
L8001de2c:
  addu $v0, $a2, $v0
L8001de30:
  addu $v0, $v0, $v1
L8001de34:
  lbu $v0, 0($v0)
L8001de38:
  sll $zero, $zero, 0x0
L8001de3c:
  sll $v1, $v0, 0x3
L8001de40:
  subu $v1, $v1, $v0
L8001de44:
  sll $v1, $v1, 0x2
L8001de48:
  lui $v0, 0x801a
L8001de4c:
  addiu $v0, $v0, 31448
L8001de50:
  addu $s0, $v1, $v0
L8001de54:
  lw $v0, 20($s0)
L8001de58:
  lui $v1, 0xc800
L8001de5c:
  and $v0, $v0, $v1
L8001de60:
  lui $v1, 0x8000
L8001de64:
  bne $v0, $v1, L8001e4b4
L8001de68:
  sll $zero, $zero, 0x0
L8001de6c:
  jal 0x8003fee0
L8001de70:
  addiu $a0, $zero, 7
L8001de74:
  lw $a0, 752($gp)
L8001de78:
  jal 0x8004036c
L8001de7c:
  sll $zero, $zero, 0x0
L8001de80:
  sw $zero, 752($gp)
L8001de84:
  lb $s4, 16($s5)
L8001de88:
  sll $zero, $zero, 0x0
L8001de8c:
  slti $v0, $s4, 2
L8001de90:
  bne $v0, $zero, L8001ec44
L8001de94:
  sll $zero, $zero, 0x0
L8001de98:
  lbu $v0, 717($gp)
L8001de9c:
  sll $zero, $zero, 0x0
L8001dea0:
  sll $v1, $v0, 0x3
L8001dea4:
  subu $v1, $v1, $v0
L8001dea8:
  sll $v1, $v1, 0x4
L8001deac:
  lui $v0, 0x800f
L8001deb0:
  addiu $v0, $v0, -24732
L8001deb4:
  addu $s5, $v1, $v0
L8001deb8:
  slti $v0, $s4, 3
L8001debc:
  bne $v0, $zero, L8001df1c
L8001dec0:
  addiu $v0, $zero, 4
L8001dec4:
  lui $v1, 0x801d
L8001dec8:
  lh $v0, 12($s0)
L8001decc:
  addiu $v1, $v1, 16964
L8001ded0:
  addiu $v0, $v0, -1
L8001ded4:
  sll $v0, $v0, 0x2
L8001ded8:
  addu $v0, $v0, $v1
L8001dedc:
  lw $v0, 0($v0)
L8001dee0:
  addiu $v1, $zero, 7
L8001dee4:
  sb $v1, 620($gp)
L8001dee8:
  addiu $v1, $zero, 23
L8001deec:
  sra $v0, $v0, 0x1a
L8001def0:
  andi $v0, $v0, 0x1f
L8001def4:
  bne $v0, $v1, L8001ec44
L8001def8:
  addiu $v0, $zero, 2
L8001defc:
  addiu $v1, $zero, 3
L8001df00:
  sb $v0, 17($s5)
L8001df04:
  sb $v0, 16($s5)
L8001df08:
  addiu $v0, $zero, 4
L8001df0c:
  sb $v1, 18($s5)
L8001df10:
  sb $v0, 620($gp)
L8001df14:
  j L8001ec44
L8001df18:
  sll $zero, $zero, 0x0
L8001df1c:
  addiu $v1, $zero, 1
L8001df20:
  sb $v0, 620($gp)
L8001df24:
  addiu $v0, $zero, 2
L8001df28:
  sb $v1, 17($s5)
L8001df2c:
  sb $v0, 18($s5)
L8001df30:
  j L8001ec44
L8001df34:
  sb $v1, 16($s5)
L8001df38:
  lbu $v1, 717($gp)
L8001df3c:
  sll $zero, $zero, 0x0
L8001df40:
  sll $v0, $v1, 0x3
L8001df44:
  subu $v0, $v0, $v1
L8001df48:
  sll $v0, $v0, 0x4
L8001df4c:
  lui $v1, 0x800f
L8001df50:
  addiu $s0, $v1, -24732
L8001df54:
  lbu $v1, 620($gp)
L8001df58:
  addu $s5, $v0, $s0
L8001df5c:
  andi $v0, $v1, 0x80
L8001df60:
  bne $v0, $zero, L8001e078
L8001df64:
  addu $a0, $s5, $zero
L8001df68:
  ori $v0, $v1, 0x80
L8001df6c:
  sb $v0, 620($gp)
L8001df70:
  addiu $v0, $zero, 116
L8001df74:
  sw $s5, 684($gp)
L8001df78:
  sb $zero, 24($s5)
L8001df7c:
  jal 0x800234e4
L8001df80:
  sh $v0, 12($s5)
L8001df84:
  addiu $a0, $zero, 16
L8001df88:
  addiu $a1, $zero, 334
L8001df8c:
  addiu $v0, $gp, 24
L8001df90:
  lui $a3, 0x8009
L8001df94:
  addiu $a3, $a3, 1964
L8001df98:
  lbu $t0, 717($gp)
L8001df9c:
  lbu $v1, 24($s5)
L8001dfa0:
  sll $t1, $t0, 0x1
L8001dfa4:
  addu $t1, $t1, $v0
L8001dfa8:
  sll $v1, $v1, 0x3
L8001dfac:
  lb $v0, 16($s5)
L8001dfb0:
  sll $t0, $t0, 0x4
L8001dfb4:
  sll $v0, $v0, 0x1
L8001dfb8:
  addu $v0, $v0, $v1
L8001dfbc:
  addu $v0, $v0, $t0
L8001dfc0:
  addu $v0, $v0, $a3
L8001dfc4:
  lhu $a3, 0($t1)
L8001dfc8:
  lh $v0, 0($v0)
L8001dfcc:
  addiu $a2, $zero, 1022
L8001dfd0:
  jal 0x80022d94
L8001dfd4:
  sw $v0, 16($sp)
L8001dfd8:
  lw $s2, 4($s5)
L8001dfdc:
  lbu $v1, 717($gp)
L8001dfe0:
  sll $zero, $zero, 0x0
L8001dfe4:
  sll $v0, $v1, 0x3
L8001dfe8:
  subu $v0, $v0, $v1
L8001dfec:
  sll $v0, $v0, 0x4
L8001dff0:
  addu $v0, $s0, $v0
L8001dff4:
  lw $s0, -24($v0)
L8001dff8:
  jal 0x800429d8
L8001dffc:
  addu $a0, $s2, $zero
L8001e000:
  lw $v1, 40($s2)
L8001e004:
  addiu $v0, $zero, 16
L8001e008:
  sh $v0, 96($s2)
L8001e00c:
  lh $v0, 40($s2)
L8001e010:
  sb $zero, 108($s2)
L8001e014:
  sw $v1, 44($s2)
L8001e018:
  lh $v1, 40($s0)
L8001e01c:
  sll $zero, $zero, 0x0
L8001e020:
  subu $v0, $v0, $v1
L8001e024:
  sll $v0, $v0, 0x8
L8001e028:
  bgez $v0, L8001e034
L8001e02c:
  sll $zero, $zero, 0x0
L8001e030:
  addiu $v0, $v0, 15
L8001e034:
  sra $v0, $v0, 0x4
L8001e038:
  sh $v0, 54($s2)
L8001e03c:
  lh $v0, 42($s2)
L8001e040:
  lh $v1, 42($s0)
L8001e044:
  sll $zero, $zero, 0x0
L8001e048:
  subu $v0, $v0, $v1
L8001e04c:
  sll $v0, $v0, 0x8
L8001e050:
  bgez $v0, L8001e05c
L8001e054:
  sll $zero, $zero, 0x0
L8001e058:
  addiu $v0, $v0, 15
L8001e05c:
  sra $v0, $v0, 0x4
L8001e060:
  sh $v0, 58($s2)
L8001e064:
  lw $v1, 40($s0)
L8001e068:
  addiu $v0, $zero, 82
L8001e06c:
  sh $v0, 602($gp)
L8001e070:
  j L8001ec44
L8001e074:
  sw $v1, 40($s2)
L8001e078:
  lhu $v0, 602($gp)
L8001e07c:
  sll $zero, $zero, 0x0
L8001e080:
  bne $v0, $zero, L8001ec44
L8001e084:
  sll $zero, $zero, 0x0
L8001e088:
  jal 0x8002348c
L8001e08c:
  addu $a0, $s5, $zero
L8001e090:
  lbu $v1, 786($gp)
L8001e094:
  addiu $v0, $zero, 6
L8001e098:
  sb $v0, 620($gp)
L8001e09c:
  beq $v1, $zero, L8001ec44
L8001e0a0:
  addiu $v0, $zero, 5
L8001e0a4:
  sb $v0, 620($gp)
L8001e0a8:
  j L8001ec44
L8001e0ac:
  sll $zero, $zero, 0x0
L8001e0b0:
  lbu $v0, 717($gp)
L8001e0b4:
  lbu $a0, 620($gp)
L8001e0b8:
  sll $v1, $v0, 0x3
L8001e0bc:
  subu $v1, $v1, $v0
L8001e0c0:
  sll $v1, $v1, 0x4
L8001e0c4:
  lui $v0, 0x800f
L8001e0c8:
  addiu $v0, $v0, -24732
L8001e0cc:
  addu $s5, $v1, $v0
L8001e0d0:
  andi $v0, $a0, 0x80
L8001e0d4:
  bne $v0, $zero, L8001e134
L8001e0d8:
  lui $v0, 0x800f
L8001e0dc:
  lbu $s4, -20846($v0)
L8001e0e0:
  ori $v0, $a0, 0x80
L8001e0e4:
  sb $v0, 620($gp)
L8001e0e8:
  sb $zero, 801($gp)
L8001e0ec:
  slti $v0, $s4, 56
L8001e0f0:
  beq $v0, $zero, L8001e120
L8001e0f4:
  slti $v0, $s4, 6
L8001e0f8:
  bne $v0, $zero, L8001e110
L8001e0fc:
  sll $zero, $zero, 0x0
L8001e100:
  addiu $v0, $s4, -6
L8001e104:
  sb $v0, 718($gp)
L8001e108:
  j L8001e130
L8001e10c:
  addiu $v0, $zero, 3
L8001e110:
  addiu $v0, $s4, -1
L8001e114:
  sb $v0, 718($gp)
L8001e118:
  j L8001e130
L8001e11c:
  addiu $v0, $zero, 2
L8001e120:
  addiu $v0, $zero, 60
L8001e124:
  subu $v0, $v0, $s4
L8001e128:
  sb $v0, 718($gp)
L8001e12c:
  addiu $v0, $zero, 1
L8001e130:
  sb $v0, 719($gp)
L8001e134:
  jal L8001d5b4
L8001e138:
  addu $a0, $s5, $zero
L8001e13c:
  bne $v0, $zero, L8001ec44
L8001e140:
  addu $s4, $zero, $zero
L8001e144:
  j L8001e3d0
L8001e148:
  sll $zero, $zero, 0x0
L8001e14c:
  lbu $v1, 717($gp)
L8001e150:
  sll $zero, $zero, 0x0
L8001e154:
  sll $v0, $v1, 0x3
L8001e158:
  subu $v0, $v0, $v1
L8001e15c:
  sll $v0, $v0, 0x4
L8001e160:
  lui $v1, 0x800f
L8001e164:
  addiu $s0, $v1, -24732
L8001e168:
  lbu $v1, 620($gp)
L8001e16c:
  addu $s5, $v0, $s0
L8001e170:
  andi $v0, $v1, 0x80
L8001e174:
  beq $v0, $zero, L8001e184
L8001e178:
  ori $v0, $v1, 0x80
L8001e17c:
  sb $v0, 620($gp)
L8001e180:
  sw $s5, 684($gp)
L8001e184:
  lbu $v0, 620($gp)
L8001e188:
  sll $zero, $zero, 0x0
L8001e18c:
  andi $v0, $v0, 0x40
L8001e190:
  beq $v0, $zero, L8001e1d4
L8001e194:
  sll $zero, $zero, 0x0
L8001e198:
  lhu $v0, 602($gp)
L8001e19c:
  sll $zero, $zero, 0x0
L8001e1a0:
  bne $v0, $zero, L8001ec44
L8001e1a4:
  sll $zero, $zero, 0x0
L8001e1a8:
  lw $a0, 4($s5)
L8001e1ac:
  jal 0x8004036c
L8001e1b0:
  sll $zero, $zero, 0x0
L8001e1b4:
  lbu $v1, 717($gp)
L8001e1b8:
  addiu $v0, $zero, 3
L8001e1bc:
  sw $zero, 4($s5)
L8001e1c0:
  sb $v0, 620($gp)
L8001e1c4:
  sll $v0, $v1, 0x3
L8001e1c8:
  subu $v0, $v0, $v1
L8001e1cc:
  j L8001eb8c
L8001e1d0:
  sll $v0, $v0, 0x4
L8001e1d4:
  jal 0x80024060
L8001e1d8:
  addu $a0, $s5, $zero
L8001e1dc:
  bne $v0, $zero, L8001ec44
L8001e1e0:
  sll $zero, $zero, 0x0
L8001e1e4:
  lui $v0, 0x800a
L8001e1e8:
  lhu $v0, -19560($v0)
L8001e1ec:
  sll $zero, $zero, 0x0
L8001e1f0:
  andi $v0, $v0, 0x20
L8001e1f4:
  beq $v0, $zero, L8001e30c
L8001e1f8:
  addiu $a1, $zero, 334
L8001e1fc:
  addiu $a0, $zero, 16
L8001e200:
  addiu $v0, $gp, 24
L8001e204:
  lui $t0, 0x8009
L8001e208:
  addiu $t0, $t0, 1964
L8001e20c:
  lbu $a3, 717($gp)
L8001e210:
  addiu $s0, $s0, -84
L8001e214:
  sll $t1, $a3, 0x1
L8001e218:
  addu $t1, $t1, $v0
L8001e21c:
  sll $v0, $a3, 0x3
L8001e220:
  subu $v0, $v0, $a3
L8001e224:
  sll $v0, $v0, 0x4
L8001e228:
  addu $v0, $v0, $s0
L8001e22c:
  sll $a3, $a3, 0x4
L8001e230:
  lb $v1, 72($v0)
L8001e234:
  lbu $v0, 80($v0)
L8001e238:
  sll $v1, $v1, 0x1
L8001e23c:
  sll $v0, $v0, 0x3
L8001e240:
  addu $v1, $v1, $v0
L8001e244:
  addu $v1, $v1, $a3
L8001e248:
  addu $v1, $v1, $t0
L8001e24c:
  lhu $a3, 0($t1)
L8001e250:
  lh $v0, 0($v1)
L8001e254:
  addiu $a2, $zero, 1022
L8001e258:
  jal 0x80022d94
L8001e25c:
  sw $v0, 16($sp)
L8001e260:
  lw $s2, 4($s5)
L8001e264:
  lbu $v1, 717($gp)
L8001e268:
  sll $zero, $zero, 0x0
L8001e26c:
  sll $v0, $v1, 0x3
L8001e270:
  subu $v0, $v0, $v1
L8001e274:
  sll $v0, $v0, 0x4
L8001e278:
  addu $v0, $v0, $s0
L8001e27c:
  lw $s0, 60($v0)
L8001e280:
  jal 0x800429d8
L8001e284:
  addu $a0, $s2, $zero
L8001e288:
  lh $v1, 40($s2)
L8001e28c:
  addiu $v0, $zero, 16
L8001e290:
  sh $v0, 96($s2)
L8001e294:
  sb $zero, 108($s2)
L8001e298:
  lh $v0, 40($s0)
L8001e29c:
  sll $zero, $zero, 0x0
L8001e2a0:
  subu $v0, $v0, $v1
L8001e2a4:
  sll $v0, $v0, 0x8
L8001e2a8:
  bgez $v0, L8001e2b4
L8001e2ac:
  sll $zero, $zero, 0x0
L8001e2b0:
  addiu $v0, $v0, 15
L8001e2b4:
  sra $v0, $v0, 0x4
L8001e2b8:
  sh $v0, 54($s2)
L8001e2bc:
  lh $v0, 42($s0)
L8001e2c0:
  lh $v1, 42($s2)
L8001e2c4:
  sll $zero, $zero, 0x0
L8001e2c8:
  subu $v0, $v0, $v1
L8001e2cc:
  sll $v0, $v0, 0x8
L8001e2d0:
  bgez $v0, L8001e2dc
L8001e2d4:
  sll $zero, $zero, 0x0
L8001e2d8:
  addiu $v0, $v0, 15
L8001e2dc:
  sra $v0, $v0, 0x4
L8001e2e0:
  sh $v0, 58($s2)
L8001e2e4:
  lw $v0, 40($s0)
L8001e2e8:
  sll $zero, $zero, 0x0
L8001e2ec:
  sw $v0, 44($s2)
L8001e2f0:
  lbu $v0, 620($gp)
L8001e2f4:
  addiu $v1, $zero, 88
L8001e2f8:
  sh $v1, 602($gp)
L8001e2fc:
  ori $v0, $v0, 0x40
L8001e300:
  sb $v0, 620($gp)
L8001e304:
  j L8001ec44
L8001e308:
  sll $zero, $zero, 0x0
L8001e30c:
  lui $a1, 0x8009
L8001e310:
  lb $v0, 16($s5)
L8001e314:
  addiu $a1, $a1, 2008
L8001e318:
  sll $v1, $v0, 0x2
L8001e31c:
  addu $v1, $v1, $v0
L8001e320:
  lb $v0, 15($s5)
L8001e324:
  lbu $a0, 717($gp)
L8001e328:
  addu $v1, $v1, $v0
L8001e32c:
  sll $v0, $a0, 0x2
L8001e330:
  addu $v0, $v0, $a0
L8001e334:
  sll $v0, $v0, 0x2
L8001e338:
  addu $v1, $v1, $v0
L8001e33c:
  addu $v1, $v1, $a1
L8001e340:
  lui $a0, 0x801a
L8001e344:
  lbu $v1, 0($v1)
L8001e348:
  addiu $a0, $a0, 31448
L8001e34c:
  sll $v0, $v1, 0x3
L8001e350:
  subu $v0, $v0, $v1
L8001e354:
  sll $v0, $v0, 0x2
L8001e358:
  jal 0x80017034
L8001e35c:
  addu $a0, $v0, $a0
L8001e360:
  addu $s4, $v0, $zero
L8001e364:
  beq $s4, $zero, L8001e398
L8001e368:
  addiu $v0, $zero, 20
L8001e36c:
  lui $at, 0x800a
L8001e370:
  sb $v0, -19893($at)
L8001e374:
  addiu $v0, $zero, 2
L8001e378:
  lui $at, 0x800a
L8001e37c:
  sh $s4, -19898($at)
L8001e380:
  lui $at, 0x800a
L8001e384:
  sb $v0, -19884($at)
L8001e388:
  j L8001ec44
L8001e38c:
  sll $zero, $zero, 0x0
L8001e390:
  j L8001e448
L8001e394:
  addu $s4, $zero, $zero
L8001e398:
  lui $v0, 0x800a
L8001e39c:
  lhu $v0, -19560($v0)
L8001e3a0:
  sll $zero, $zero, 0x0
L8001e3a4:
  andi $v0, $v0, 0xc0
L8001e3a8:
  beq $v0, $zero, L8001ec44
L8001e3ac:
  sll $zero, $zero, 0x0
L8001e3b0:
  lui $v0, 0x800a
L8001e3b4:
  lhu $v0, -19560($v0)
L8001e3b8:
  sb $zero, 801($gp)
L8001e3bc:
  andi $v0, $v0, 0x80
L8001e3c0:
  beq $v0, $zero, L8001e3cc
L8001e3c4:
  addiu $v0, $zero, 1
L8001e3c8:
  sb $v0, 801($gp)
L8001e3cc:
  addu $s4, $zero, $zero
L8001e3d0:
  lb $v1, 16($s5)
L8001e3d4:
  addiu $v0, $zero, 1
L8001e3d8:
  bne $v1, $v0, L8001e44c
L8001e3dc:
  addiu $a2, $zero, 5
L8001e3e0:
  addu $s4, $v0, $zero
L8001e3e4:
  addu $a0, $zero, $zero
L8001e3e8:
  lui $v0, 0x8009
L8001e3ec:
  addiu $t0, $v0, 2008
L8001e3f0:
  lbu $v1, 717($gp)
L8001e3f4:
  lui $v0, 0x801a
L8001e3f8:
  addiu $a3, $v0, 31448
L8001e3fc:
  sll $v0, $v1, 0x2
L8001e400:
  addu $v0, $v0, $v1
L8001e404:
  sll $a1, $v0, 0x2
L8001e408:
  addu $v0, $a2, $a1
L8001e40c:
  addu $v0, $v0, $t0
L8001e410:
  lbu $v1, 0($v0)
L8001e414:
  sll $zero, $zero, 0x0
L8001e418:
  sll $v0, $v1, 0x3
L8001e41c:
  subu $v0, $v0, $v1
L8001e420:
  sll $v0, $v0, 0x2
L8001e424:
  addu $s3, $v0, $a3
L8001e428:
  lhu $v0, 22($s3)
L8001e42c:
  sll $zero, $zero, 0x0
L8001e430:
  andi $v0, $v0, 0x8000
L8001e434:
  bne $v0, $zero, L8001e390
L8001e438:
  addiu $a0, $a0, 1
L8001e43c:
  slti $v0, $a0, 5
L8001e440:
  bne $v0, $zero, L8001e408
L8001e444:
  addiu $a2, $a2, 1
L8001e448:
  lb $v1, 16($s5)
L8001e44c:
  lb $a0, 15($s5)
L8001e450:
  sll $v0, $v1, 0x2
L8001e454:
  addu $v0, $v0, $v1
L8001e458:
  addu $a2, $v0, $a0
L8001e45c:
  lui $v1, 0x8009
L8001e460:
  lbu $a0, 717($gp)
L8001e464:
  addiu $v1, $v1, 2008
L8001e468:
  sll $v0, $a0, 0x2
L8001e46c:
  addu $v0, $v0, $a0
L8001e470:
  sll $v0, $v0, 0x2
L8001e474:
  addu $v0, $a2, $v0
L8001e478:
  addu $v0, $v0, $v1
L8001e47c:
  lbu $v0, 0($v0)
L8001e480:
  sll $zero, $zero, 0x0
L8001e484:
  sll $v1, $v0, 0x3
L8001e488:
  subu $v1, $v1, $v0
L8001e48c:
  sll $v1, $v1, 0x2
L8001e490:
  lui $v0, 0x801a
L8001e494:
  addiu $v0, $v0, 31448
L8001e498:
  bne $s4, $zero, L8001e4c4
L8001e49c:
  addu $s3, $v1, $v0
L8001e4a0:
  lhu $v0, 22($s3)
L8001e4a4:
  sll $zero, $zero, 0x0
L8001e4a8:
  andi $v0, $v0, 0x8000
L8001e4ac:
  bne $v0, $zero, L8001e4c4
L8001e4b0:
  sll $zero, $zero, 0x0
L8001e4b4:
  jal 0x8003fee0
L8001e4b8:
  addiu $a0, $zero, 9
L8001e4bc:
  j L8001ec44
L8001e4c0:
  sll $zero, $zero, 0x0
L8001e4c4:
  jal 0x8003fee0
L8001e4c8:
  addiu $a0, $zero, 7
L8001e4cc:
  addiu $a0, $zero, 6
L8001e4d0:
  lui $v0, 0x800f
L8001e4d4:
  addiu $v0, $v0, -24848
L8001e4d8:
  addiu $v0, $v0, 24
L8001e4dc:
  sw $zero, 0($v0)
L8001e4e0:
  addiu $a0, $a0, -1
L8001e4e4:
  bgez $a0, L8001e4dc
L8001e4e8:
  addiu $v0, $v0, -4
L8001e4ec:
  lui $v1, 0x800f
L8001e4f0:
  addiu $v1, $v1, -24816
L8001e4f4:
  lui $s1, 0x8009
L8001e4f8:
  addiu $s1, $s1, 2008
L8001e4fc:
  lbu $a1, 717($gp)
L8001e500:
  lui $s0, 0x801a
L8001e504:
  sll $v0, $a1, 0x3
L8001e508:
  subu $v0, $v0, $a1
L8001e50c:
  sll $v0, $v0, 0x4
L8001e510:
  addu $v0, $v0, $v1
L8001e514:
  lb $a0, 72($v0)
L8001e518:
  lb $v0, 71($v0)
L8001e51c:
  sll $v1, $a0, 0x2
L8001e520:
  addu $v1, $v1, $a0
L8001e524:
  addu $a2, $v1, $v0
L8001e528:
  sll $v0, $a1, 0x2
L8001e52c:
  addu $v0, $v0, $a1
L8001e530:
  sll $v0, $v0, 0x2
L8001e534:
  addu $v0, $a2, $v0
L8001e538:
  addu $v0, $v0, $s1
L8001e53c:
  lbu $v1, 0($v0)
L8001e540:
  addiu $s0, $s0, 31448
L8001e544:
  sll $v0, $v1, 0x3
L8001e548:
  subu $v0, $v0, $v1
L8001e54c:
  sll $v0, $v0, 0x2
L8001e550:
  addu $s3, $v0, $s0
L8001e554:
  lhu $v0, 22($s3)
L8001e558:
  sll $zero, $zero, 0x0
L8001e55c:
  sh $v0, 624($gp)
L8001e560:
  lhu $v0, 18($s3)
L8001e564:
  sll $zero, $zero, 0x0
L8001e568:
  sh $v0, 616($gp)
L8001e56c:
  lh $a1, 8($s3)
L8001e570:
  lh $a2, 10($s3)
L8001e574:
  jal 0x80017f04
L8001e578:
  addu $a0, $s3, $zero
L8001e57c:
  addu $s2, $v0, $zero
L8001e580:
  addu $a0, $s2, $zero
L8001e584:
  jal 0x800428ec
L8001e588:
  addiu $a1, $zero, -10
L8001e58c:
  addu $a0, $s3, $zero
L8001e590:
  lui $v0, 0x800f
L8001e594:
  sw $s2, -24848($v0)
L8001e598:
  lh $s6, 12($a0)
L8001e59c:
  jal 0x80024914
L8001e5a0:
  addiu $s7, $v0, -24848
L8001e5a4:
  lb $v1, 16($s5)
L8001e5a8:
  sll $zero, $zero, 0x0
L8001e5ac:
  sll $v0, $v1, 0x2
L8001e5b0:
  addu $v0, $v0, $v1
L8001e5b4:
  lb $v1, 15($s5)
L8001e5b8:
  lbu $a0, 717($gp)
L8001e5bc:
  addu $a2, $v0, $v1
L8001e5c0:
  sll $v0, $a0, 0x2
L8001e5c4:
  addu $v0, $v0, $a0
L8001e5c8:
  sll $v0, $v0, 0x2
L8001e5cc:
  addu $v0, $a2, $v0
L8001e5d0:
  addu $v0, $v0, $s1
L8001e5d4:
  lbu $v1, 0($v0)
L8001e5d8:
  sll $zero, $zero, 0x0
L8001e5dc:
  sll $v0, $v1, 0x3
L8001e5e0:
  subu $v0, $v0, $v1
L8001e5e4:
  sll $v0, $v0, 0x2
L8001e5e8:
  bne $s4, $zero, L8001e670
L8001e5ec:
  addu $s3, $v0, $s0
L8001e5f0:
  lhu $v0, 22($s3)
L8001e5f4:
  sll $zero, $zero, 0x0
L8001e5f8:
  sh $v0, 626($gp)
L8001e5fc:
  lhu $v0, 18($s3)
L8001e600:
  sll $zero, $zero, 0x0
L8001e604:
  sh $v0, 618($gp)
L8001e608:
  lh $a1, 8($s3)
L8001e60c:
  lh $a2, 10($s3)
L8001e610:
  jal 0x80017f04
L8001e614:
  addu $a0, $s3, $zero
L8001e618:
  addu $s2, $v0, $zero
L8001e61c:
  sw $s2, 4($s7)
L8001e620:
  lbu $v0, 106($s2)
L8001e624:
  sll $zero, $zero, 0x0
L8001e628:
  sb $v0, 660($gp)
L8001e62c:
  jal 0x80024914
L8001e630:
  addu $a0, $s3, $zero
L8001e634:
  lui $v1, 0x801d
L8001e638:
  addiu $v1, $v1, 16964
L8001e63c:
  addiu $v0, $s6, -1
L8001e640:
  sll $v0, $v0, 0x2
L8001e644:
  addu $v0, $v0, $v1
L8001e648:
  lw $v0, 0($v0)
L8001e64c:
  addiu $v1, $zero, 23
L8001e650:
  sra $v0, $v0, 0x1a
L8001e654:
  andi $v0, $v0, 0x1f
L8001e658:
  bne $v0, $v1, L8001ec40
L8001e65c:
  addiu $v0, $zero, 9
L8001e660:
  addiu $v0, $zero, 8
L8001e664:
  sb $v0, 620($gp)
L8001e668:
  j L8001ec44
L8001e66c:
  sll $zero, $zero, 0x0
L8001e670:
  j L8001ec40
L8001e674:
  addiu $v0, $zero, 9
L8001e678:
  lbu $v1, 620($gp)
L8001e67c:
  sll $zero, $zero, 0x0
L8001e680:
  andi $v0, $v1, 0x80
L8001e684:
  bne $v0, $zero, L8001e80c
L8001e688:
  ori $v0, $v1, 0x80
L8001e68c:
  sb $v0, 620($gp)
L8001e690:
  lb $v1, 16($s5)
L8001e694:
  lb $a0, 15($s5)
L8001e698:
  sll $v0, $v1, 0x2
L8001e69c:
  addu $v0, $v0, $v1
L8001e6a0:
  addu $a2, $v0, $a0
L8001e6a4:
  lui $v1, 0x8009
L8001e6a8:
  lbu $a0, 717($gp)
L8001e6ac:
  addiu $v1, $v1, 2008
L8001e6b0:
  sll $v0, $a0, 0x2
L8001e6b4:
  addu $v0, $v0, $a0
L8001e6b8:
  sll $v0, $v0, 0x2
L8001e6bc:
  addu $v0, $a2, $v0
L8001e6c0:
  addu $v0, $v0, $v1
L8001e6c4:
  lbu $v1, 0($v0)
L8001e6c8:
  sll $zero, $zero, 0x0
L8001e6cc:
  sll $v0, $v1, 0x3
L8001e6d0:
  subu $v0, $v0, $v1
L8001e6d4:
  sll $v0, $v0, 0x2
L8001e6d8:
  lui $v1, 0x801a
L8001e6dc:
  addiu $s1, $v1, 31448
L8001e6e0:
  addu $s0, $v0, $s1
L8001e6e4:
  lh $a1, 8($s0)
L8001e6e8:
  lh $a2, 10($s0)
L8001e6ec:
  jal 0x80017f04
L8001e6f0:
  addu $a0, $s0, $zero
L8001e6f4:
  lhu $v1, 22($s0)
L8001e6f8:
  addu $s2, $v0, $zero
L8001e6fc:
  andi $v0, $v1, 0x7fff
L8001e700:
  andi $v1, $v1, 0x1000
L8001e704:
  beq $v1, $zero, L8001e720
L8001e708:
  sh $v0, 22($s0)
L8001e70c:
  lhu $v0, 8($s2)
L8001e710:
  addiu $v1, $zero, 128
L8001e714:
  sb $v1, 33($s2)
L8001e718:
  ori $v0, $v0, 0x4
L8001e71c:
  sh $v0, 8($s2)
L8001e720:
  addiu $v0, $zero, 12
L8001e724:
  sh $v0, 96($s2)
L8001e728:
  lui $v0, 0x8002
L8001e72c:
  addiu $v0, $v0, -11324
L8001e730:
  sw $v0, 36($s2)
L8001e734:
  addiu $v0, $zero, 134
L8001e738:
  sh $v0, 40($s2)
L8001e73c:
  addiu $v0, $zero, 90
L8001e740:
  sh $v0, 42($s2)
L8001e744:
  addiu $v0, $zero, 1
L8001e748:
  sh $zero, 44($s2)
L8001e74c:
  sb $v0, 108($s2)
L8001e750:
  lw $a0, 4($s5)
L8001e754:
  lbu $v1, 786($gp)
L8001e758:
  lhu $v0, 8($a0)
L8001e75c:
  sw $s2, 708($gp)
L8001e760:
  andi $v0, $v0, 0xffbf
L8001e764:
  bne $v1, $zero, L8001ec44
L8001e768:
  sh $v0, 8($a0)
L8001e76c:
  lui $v0, 0x20
L8001e770:
  ori $v0, $v0, 0x2020
L8001e774:
  sw $v0, 692($gp)
L8001e778:
  addu $s0, $s1, $zero
L8001e77c:
  addu $a0, $zero, $zero
L8001e780:
  addiu $a3, $zero, 1
L8001e784:
  addiu $a2, $zero, 8
L8001e788:
  lui $v0, 0x8002
L8001e78c:
  addiu $a1, $v0, -11452
L8001e790:
  addiu $v1, $s0, 22
L8001e794:
  lhu $v0, 0($v1)
L8001e798:
  sll $zero, $zero, 0x0
L8001e79c:
  andi $v0, $v0, 0x8000
L8001e7a0:
  beq $v0, $zero, L8001e7e0
L8001e7a4:
  sll $zero, $zero, 0x0
L8001e7a8:
  lw $s2, 0($s0)
L8001e7ac:
  sll $zero, $zero, 0x0
L8001e7b0:
  sb $a3, 108($s2)
L8001e7b4:
  sh $a2, 96($s2)
L8001e7b8:
  sw $a1, 36($s2)
L8001e7bc:
  lhu $v0, 0($v1)
L8001e7c0:
  sll $zero, $zero, 0x0
L8001e7c4:
  andi $v0, $v0, 0x4000
L8001e7c8:
  beq $v0, $zero, L8001e7d4
L8001e7cc:
  addiu $s4, $zero, 32
L8001e7d0:
  addiu $s4, $zero, 16
L8001e7d4:
  sh $s4, 44($s2)
L8001e7d8:
  sh $s4, 42($s2)
L8001e7dc:
  sh $s4, 40($s2)
L8001e7e0:
  addiu $v1, $v1, 28
L8001e7e4:
  addiu $a0, $a0, 1
L8001e7e8:
  slti $v0, $a0, 30
L8001e7ec:
  bne $v0, $zero, L8001e794
L8001e7f0:
  addiu $s0, $s0, 28
L8001e7f4:
  lbu $v0, 620($gp)
L8001e7f8:
  sb $zero, 586($gp)
L8001e7fc:
  ori $v0, $v0, 0x20
L8001e800:
  sb $v0, 620($gp)
L8001e804:
  j L8001ec44
L8001e808:
  sll $zero, $zero, 0x0
L8001e80c:
  lbu $v0, 786($gp)
L8001e810:
  sll $zero, $zero, 0x0
L8001e814:
  beq $v0, $zero, L8001e834
L8001e818:
  andi $v0, $v1, 0x20
L8001e81c:
  jal 0x80042b40
L8001e820:
  addiu $a0, $zero, 1
L8001e824:
  beq $v0, $zero, L8001e928
L8001e828:
  sll $zero, $zero, 0x0
L8001e82c:
  j L8001ec44
L8001e830:
  sll $zero, $zero, 0x0
L8001e834:
  beq $v0, $zero, L8001e8c4
L8001e838:
  andi $v0, $v1, 0x40
L8001e83c:
  lui $s4, 0x800a
L8001e840:
  lbu $s4, -19712($s4)
L8001e844:
  lbu $a2, 692($gp)
L8001e848:
  sll $zero, $zero, 0x0
L8001e84c:
  slt $v0, $s4, $a2
L8001e850:
  bne $v0, $zero, L8001e864
L8001e854:
  sll $zero, $zero, 0x0
L8001e858:
  addiu $s4, $s4, -8
L8001e85c:
  j L8001e86c
L8001e860:
  slt $v0, $s4, $a2
L8001e864:
  addiu $s4, $s4, 8
L8001e868:
  slt $v0, $a2, $s4
L8001e86c:
  beq $v0, $zero, L8001e87c
L8001e870:
  sll $v0, $s4, 0x10
L8001e874:
  addu $s4, $a2, $zero
L8001e878:
  sll $v0, $s4, 0x10
L8001e87c:
  sll $v1, $s4, 0x8
L8001e880:
  or $v0, $v0, $v1
L8001e884:
  lw $v1, 692($gp)
L8001e888:
  or $v0, $v0, $s4
L8001e88c:
  lui $at, 0x800a
L8001e890:
  sw $v0, -19712($at)
L8001e894:
  bne $v0, $v1, L8001ec44
L8001e898:
  sll $zero, $zero, 0x0
L8001e89c:
  jal 0x80042b40
L8001e8a0:
  addiu $a0, $zero, 1
L8001e8a4:
  bne $v0, $zero, L8001ec44
L8001e8a8:
  sll $zero, $zero, 0x0
L8001e8ac:
  lbu $v0, 620($gp)
L8001e8b0:
  sll $zero, $zero, 0x0
L8001e8b4:
  andi $v0, $v0, 0xdf
L8001e8b8:
  sb $v0, 620($gp)
L8001e8bc:
  j L8001ec44
L8001e8c0:
  sll $zero, $zero, 0x0
L8001e8c4:
  beq $v0, $zero, L8001e964
L8001e8c8:
  andi $v0, $v1, 0x10
L8001e8cc:
  beq $v0, $zero, L8001e928
L8001e8d0:
  lui $v1, 0x801a
L8001e8d4:
  lw $a0, 708($gp)
L8001e8d8:
  sll $zero, $zero, 0x0
L8001e8dc:
  lbu $a1, 106($a0)
L8001e8e0:
  addiu $v1, $v1, 31448
L8001e8e4:
  sll $v0, $a1, 0x3
L8001e8e8:
  subu $v0, $v0, $a1
L8001e8ec:
  sll $v0, $v0, 0x2
L8001e8f0:
  addu $v0, $v0, $v1
L8001e8f4:
  lhu $v1, 22($v0)
L8001e8f8:
  sll $zero, $zero, 0x0
L8001e8fc:
  ori $v1, $v1, 0x8000
L8001e900:
  jal 0x8004036c
L8001e904:
  sh $v1, 22($v0)
L8001e908:
  lw $a0, 4($s5)
L8001e90c:
  sll $zero, $zero, 0x0
L8001e910:
  lhu $v0, 8($a0)
L8001e914:
  addiu $v1, $zero, 3
L8001e918:
  sb $v1, 620($gp)
L8001e91c:
  ori $v0, $v0, 0x40
L8001e920:
  j L8001ec44
L8001e924:
  sh $v0, 8($a0)
L8001e928:
  lw $v0, 708($gp)
L8001e92c:
  lui $a0, 0x801a
L8001e930:
  lbu $v1, 106($v0)
L8001e934:
  addiu $a0, $a0, 31448
L8001e938:
  sll $v0, $v1, 0x3
L8001e93c:
  subu $v0, $v0, $v1
L8001e940:
  sll $v0, $v0, 0x2
L8001e944:
  jal 0x80024954
L8001e948:
  addu $a0, $v0, $a0
L8001e94c:
  lw $v1, 708($gp)
L8001e950:
  addiu $v0, $zero, 9
L8001e954:
  sb $v0, 620($gp)
L8001e958:
  lui $v0, 0x800f
L8001e95c:
  j L8001ec44
L8001e960:
  sw $v1, -24848($v0)
L8001e964:
  jal 0x80020988
L8001e968:
  sll $zero, $zero, 0x0
L8001e96c:
  addu $s4, $v0, $zero
L8001e970:
  beq $s4, $zero, L8001ec44
L8001e974:
  addiu $s0, $zero, 1
L8001e978:
  beq $s4, $s0, L8001ea40
L8001e97c:
  sll $zero, $zero, 0x0
L8001e980:
  lbu $v0, 620($gp)
L8001e984:
  sll $zero, $zero, 0x0
L8001e988:
  ori $v0, $v0, 0x10
L8001e98c:
  sb $v0, 620($gp)
L8001e990:
  jal 0x8003fee0
L8001e994:
  addiu $a0, $zero, 8
L8001e998:
  lui $a1, 0x4
L8001e99c:
  ori $a1, $a1, 0x8000
L8001e9a0:
  addiu $v0, $zero, 12
L8001e9a4:
  lui $a0, 0x8016
L8001e9a8:
  lw $s2, 708($gp)
L8001e9ac:
  addiu $a0, $a0, -15324
L8001e9b0:
  sh $v0, 96($s2)
L8001e9b4:
  lui $v0, 0x8002
L8001e9b8:
  lbu $v1, 106($s2)
L8001e9bc:
  addiu $v0, $v0, -11324
L8001e9c0:
  sw $v0, 36($s2)
L8001e9c4:
  sll $v0, $v1, 0x3
L8001e9c8:
  subu $v0, $v0, $v1
L8001e9cc:
  sll $v0, $v0, 0x2
L8001e9d0:
  addu $v0, $v0, $a0
L8001e9d4:
  addu $v0, $v0, $a1
L8001e9d8:
  lhu $v0, 14012($v0)
L8001e9dc:
  sll $zero, $zero, 0x0
L8001e9e0:
  sh $v0, 40($s2)
L8001e9e4:
  sll $v0, $v1, 0x3
L8001e9e8:
  subu $v0, $v0, $v1
L8001e9ec:
  sll $v0, $v0, 0x2
L8001e9f0:
  addu $v0, $v0, $a0
L8001e9f4:
  addu $v0, $v0, $a1
L8001e9f8:
  lui $v1, 0x801a
L8001e9fc:
  lhu $v0, 14014($v0)
L8001ea00:
  lbu $a0, 106($s2)
L8001ea04:
  addiu $v1, $v1, 31448
L8001ea08:
  sh $zero, 44($s2)
L8001ea0c:
  sh $v0, 42($s2)
L8001ea10:
  sll $v0, $a0, 0x3
L8001ea14:
  subu $v0, $v0, $a0
L8001ea18:
  sll $v0, $v0, 0x2
L8001ea1c:
  addu $v0, $v0, $v1
L8001ea20:
  lhu $v0, 22($v0)
L8001ea24:
  sll $zero, $zero, 0x0
L8001ea28:
  andi $v0, $v0, 0x1000
L8001ea2c:
  beq $v0, $zero, L8001ea38
L8001ea30:
  addiu $v0, $zero, 128
L8001ea34:
  sh $v0, 44($s2)
L8001ea38:
  j L8001ea48
L8001ea3c:
  sb $s0, 108($s2)
L8001ea40:
  jal 0x8003fee0
L8001ea44:
  addiu $a0, $zero, 7
L8001ea48:
  lui $v1, 0x80
L8001ea4c:
  ori $v1, $v1, 0x8080
L8001ea50:
  lui $v0, 0x801a
L8001ea54:
  addiu $s0, $v0, 31448
L8001ea58:
  addu $a0, $zero, $zero
L8001ea5c:
  addiu $t0, $zero, 1
L8001ea60:
  addiu $a3, $zero, 8
L8001ea64:
  lui $v0, 0x8002
L8001ea68:
  addiu $a2, $v0, -11452
L8001ea6c:
  lbu $v0, 620($gp)
L8001ea70:
  addiu $a1, $s0, 22
L8001ea74:
  sw $v1, 692($gp)
L8001ea78:
  ori $v0, $v0, 0x60
L8001ea7c:
  sb $v0, 620($gp)
L8001ea80:
  lhu $v0, 0($a1)
L8001ea84:
  sll $zero, $zero, 0x0
L8001ea88:
  andi $v0, $v0, 0x8000
L8001ea8c:
  beq $v0, $zero, L8001eacc
L8001ea90:
  sll $zero, $zero, 0x0
L8001ea94:
  lw $s2, 0($s0)
L8001ea98:
  sll $zero, $zero, 0x0
L8001ea9c:
  sb $t0, 108($s2)
L8001eaa0:
  sh $a3, 96($s2)
L8001eaa4:
  sw $a2, 36($s2)
L8001eaa8:
  lhu $v0, 0($a1)
L8001eaac:
  sll $zero, $zero, 0x0
L8001eab0:
  andi $v0, $v0, 0x4000
L8001eab4:
  beq $v0, $zero, L8001eac0
L8001eab8:
  addiu $s4, $zero, 128
L8001eabc:
  addiu $s4, $zero, 64
L8001eac0:
  sh $s4, 44($s2)
L8001eac4:
  sh $s4, 42($s2)
L8001eac8:
  sh $s4, 40($s2)
L8001eacc:
  addiu $a1, $a1, 28
L8001ead0:
  addiu $a0, $a0, 1
L8001ead4:
  slti $v0, $a0, 30
L8001ead8:
  bne $v0, $zero, L8001ea80
L8001eadc:
  addiu $s0, $s0, 28
L8001eae0:
  j L8001ec44
L8001eae4:
  sll $zero, $zero, 0x0
L8001eae8:
  lbu $a1, 620($gp)
L8001eaec:
  sll $zero, $zero, 0x0
L8001eaf0:
  andi $v0, $a1, 0x80
L8001eaf4:
  bne $v0, $zero, L8001eb44
L8001eaf8:
  sll $zero, $zero, 0x0
L8001eafc:
  lbu $v0, 717($gp)
L8001eb00:
  sll $zero, $zero, 0x0
L8001eb04:
  sll $v1, $v0, 0x3
L8001eb08:
  subu $v1, $v1, $v0
L8001eb0c:
  sll $v1, $v1, 0x4
L8001eb10:
  lui $v0, 0x800f
L8001eb14:
  addiu $v0, $v0, -24732
L8001eb18:
  addu $v1, $v1, $v0
L8001eb1c:
  lw $a0, 4($v1)
L8001eb20:
  ori $v0, $a1, 0x80
L8001eb24:
  sb $v0, 620($gp)
L8001eb28:
  sw $v1, 684($gp)
L8001eb2c:
  jal 0x8004036c
L8001eb30:
  sll $zero, $zero, 0x0
L8001eb34:
  lw $v1, 684($gp)
L8001eb38:
  addiu $v0, $zero, 8
L8001eb3c:
  sh $v0, 602($gp)
L8001eb40:
  sw $zero, 4($v1)
L8001eb44:
  lhu $v0, 602($gp)
L8001eb48:
  sll $zero, $zero, 0x0
L8001eb4c:
  bne $v0, $zero, L8001ec44
L8001eb50:
  sll $zero, $zero, 0x0
L8001eb54:
  lbu $v1, 620($gp)
L8001eb58:
  sll $zero, $zero, 0x0
L8001eb5c:
  andi $v0, $v1, 0x40
L8001eb60:
  bne $v0, $zero, L8001ec40
L8001eb64:
  addiu $v0, $zero, 7
L8001eb68:
  ori $v0, $v1, 0x40
L8001eb6c:
  lbu $v1, 717($gp)
L8001eb70:
  sb $v0, 620($gp)
L8001eb74:
  addiu $v0, $zero, 12
L8001eb78:
  sh $v0, 602($gp)
L8001eb7c:
  sll $v0, $v1, 0x3
L8001eb80:
  subu $v0, $v0, $v1
L8001eb84:
  sll $v0, $v0, 0x4
L8001eb88:
  lui $v1, 0x800f
L8001eb8c:
  lui $v1, 0x800f
L8001eb90:
  addiu $v1, $v1, -24760
L8001eb94:
  addu $v0, $v0, $v1
L8001eb98:
  sw $v0, 684($gp)
L8001eb9c:
  j L8001ec44
L8001eba0:
  sll $zero, $zero, 0x0
L8001eba4:
  lbu $v1, 620($gp)
L8001eba8:
  sll $zero, $zero, 0x0
L8001ebac:
  andi $v0, $v1, 0x80
L8001ebb0:
  bne $v0, $zero, L8001ebc4
L8001ebb4:
  ori $v0, $v1, 0x80
L8001ebb8:
  sb $v0, 620($gp)
L8001ebbc:
  addiu $v0, $zero, 12
L8001ebc0:
  sh $v0, 602($gp)
L8001ebc4:
  lhu $v0, 602($gp)
L8001ebc8:
  sll $zero, $zero, 0x0
L8001ebcc:
  bne $v0, $zero, L8001ec44
L8001ebd0:
  addiu $v0, $zero, 6
L8001ebd4:
  j L8001ec40
L8001ebd8:
  sll $zero, $zero, 0x0
L8001ebdc:
  lhu $v0, 612($gp)
L8001ebe0:
  lw $a0, 752($gp)
L8001ebe4:
  andi $v0, $v0, 0xefff
L8001ebe8:
  sh $v0, 612($gp)
L8001ebec:
  jal 0x8004036c
L8001ebf0:
  sll $zero, $zero, 0x0
L8001ebf4:
  addiu $v0, $zero, 10
L8001ebf8:
  sw $zero, 752($gp)
L8001ebfc:
  sb $v0, 620($gp)
L8001ec00:
  jal 0x8003fee0
L8001ec04:
  addiu $a0, $zero, 48
L8001ec08:
  j L8001ec44
L8001ec0c:
  sll $zero, $zero, 0x0
L8001ec10:
  lbu $v1, 620($gp)
L8001ec14:
  sll $zero, $zero, 0x0
L8001ec18:
  andi $v0, $v1, 0x80
L8001ec1c:
  bne $v0, $zero, L8001ec30
L8001ec20:
  ori $v0, $v1, 0x80
L8001ec24:
  sb $v0, 620($gp)
L8001ec28:
  addiu $v0, $zero, 12
L8001ec2c:
  sh $v0, 602($gp)
L8001ec30:
  lhu $v0, 602($gp)
L8001ec34:
  sll $zero, $zero, 0x0
L8001ec38:
  bne $v0, $zero, L8001ec44
L8001ec3c:
  addiu $v0, $zero, 10
L8001ec40:
  sh $v0, 818($gp)
L8001ec44:
  lw $ra, 56($sp)
L8001ec48:
  lw $s7, 52($sp)
L8001ec4c:
  lw $s6, 48($sp)
L8001ec50:
  lw $s5, 44($sp)
L8001ec54:
  lw $s4, 40($sp)
L8001ec58:
  lw $s3, 36($sp)
L8001ec5c:
  lw $s2, 32($sp)
L8001ec60:
  lw $s1, 28($sp)
L8001ec64:
  lw $s0, 24($sp)
L8001ec68:
  jr $ra
L8001ec6c:
  addiu $sp, $sp, 64
L8001ec70:
  addiu $sp, $sp, -24
L8001ec74:
  sw $s0, 16($sp)
L8001ec78:
  sw $ra, 20($sp)
L8001ec7c:
  jal 0x80042b98
L8001ec80:
  addu $s0, $a0, $zero
L8001ec84:
  bne $v0, $zero, L8001ec9c
L8001ec88:
  sll $zero, $zero, 0x0
L8001ec8c:
  jal 0x80043178
L8001ec90:
  addu $a0, $s0, $zero
L8001ec94:
  sh $zero, 96($s0)
L8001ec98:
  sh $zero, 46($s0)
L8001ec9c:
  lh $a1, 40($s0)
L8001eca0:
  lh $a2, 42($s0)
L8001eca4:
  lh $a3, 96($s0)
L8001eca8:
  jal 0x8004318c
L8001ecac:
  addu $a0, $s0, $zero
L8001ecb0:
  lh $v0, 44($s0)
L8001ecb4:
  addiu $v1, $zero, 2048
L8001ecb8:
  .word 0x0062001a
L8001ecbc:
  bne $v0, $zero, L8001ecc8
L8001ecc0:
  sll $zero, $zero, 0x0
L8001ecc4:
  .word 0x0007000d
L8001ecc8:
  addiu $at, $zero, -1
L8001eccc:
  bne $v0, $at, L8001ece0
L8001ecd0:
  lui $at, 0x8000
L8001ecd4:
  bne $v1, $at, L8001ece0
L8001ecd8:
  sll $zero, $zero, 0x0
L8001ecdc:
  .word 0x0006000d
L8001ece0:
  mflo $v1
L8001ece4:
  lhu $v0, 96($s0)
L8001ece8:
  sll $zero, $zero, 0x0
L8001ecec:
  addu $v0, $v0, $v1
L8001ecf0:
  sh $v0, 96($s0)
L8001ecf4:
  sll $v0, $v0, 0x10
L8001ecf8:
  sra $v0, $v0, 0x10
L8001ecfc:
  slti $v0, $v0, 2048
L8001ed00:
  bne $v0, $zero, L8001ed10
L8001ed04:
  sll $zero, $zero, 0x0
L8001ed08:
  sb $zero, 108($s0)
L8001ed0c:
  sw $zero, 36($s0)
L8001ed10:
  lw $ra, 20($sp)
L8001ed14:
  lw $s0, 16($sp)
L8001ed18:
  jr $ra
L8001ed1c:
  addiu $sp, $sp, 24
L8001ed20:
  addiu $sp, $sp, -24
L8001ed24:
  sw $s0, 16($sp)
L8001ed28:
  sw $ra, 20($sp)
L8001ed2c:
  jal 0x80042b98
L8001ed30:
  addu $s0, $a0, $zero
L8001ed34:
  bne $v0, $zero, L8001ed4c
L8001ed38:
  sll $zero, $zero, 0x0
L8001ed3c:
  jal 0x80043178
L8001ed40:
  addu $a0, $s0, $zero
L8001ed44:
  sh $zero, 96($s0)
L8001ed48:
  sh $zero, 46($s0)
L8001ed4c:
  lbu $a0, 34($s0)
L8001ed50:
  sll $zero, $zero, 0x0
L8001ed54:
  beq $a0, $zero, L8001ed9c
L8001ed58:
  addiu $v0, $zero, 64
L8001ed5c:
  lh $v1, 44($s0)
L8001ed60:
  sll $zero, $zero, 0x0
L8001ed64:
  .word 0x0043001a
L8001ed68:
  bne $v1, $zero, L8001ed74
L8001ed6c:
  sll $zero, $zero, 0x0
L8001ed70:
  .word 0x0007000d
L8001ed74:
  addiu $at, $zero, -1
L8001ed78:
  bne $v1, $at, L8001ed8c
L8001ed7c:
  lui $at, 0x8000
L8001ed80:
  bne $v0, $at, L8001ed8c
L8001ed84:
  sll $zero, $zero, 0x0
L8001ed88:
  .word 0x0006000d
L8001ed8c:
  mflo $v0
L8001ed90:
  sll $zero, $zero, 0x0
L8001ed94:
  addu $v0, $a0, $v0
L8001ed98:
  sb $v0, 34($s0)
L8001ed9c:
  lh $a1, 40($s0)
L8001eda0:
  lh $a2, 42($s0)
L8001eda4:
  lh $a3, 96($s0)
L8001eda8:
  jal 0x8004318c
L8001edac:
  addu $a0, $s0, $zero
L8001edb0:
  lh $v0, 44($s0)
L8001edb4:
  addiu $v1, $zero, 2048
L8001edb8:
  .word 0x0062001a
L8001edbc:
  bne $v0, $zero, L8001edc8
L8001edc0:
  sll $zero, $zero, 0x0
L8001edc4:
  .word 0x0007000d
L8001edc8:
  addiu $at, $zero, -1
L8001edcc:
  bne $v0, $at, L8001ede0
L8001edd0:
  lui $at, 0x8000
L8001edd4:
  bne $v1, $at, L8001ede0
L8001edd8:
  sll $zero, $zero, 0x0
L8001eddc:
  .word 0x0006000d
L8001ede0:
  mflo $v1
L8001ede4:
  lhu $v0, 96($s0)
L8001ede8:
  sll $zero, $zero, 0x0
L8001edec:
  addu $v0, $v0, $v1
L8001edf0:
  sh $v0, 96($s0)
L8001edf4:
  sll $v0, $v0, 0x10
L8001edf8:
  sra $v0, $v0, 0x10
L8001edfc:
  slti $v0, $v0, 2048
L8001ee00:
  bne $v0, $zero, L8001ee34
L8001ee04:
  sll $zero, $zero, 0x0
L8001ee08:
  lw $v0, 40($s0)
L8001ee0c:
  lbu $v1, 33($s0)
L8001ee10:
  sb $zero, 34($s0)
L8001ee14:
  bne $v1, $zero, L8001ee2c
L8001ee18:
  sw $v0, 48($s0)
L8001ee1c:
  lhu $v0, 8($s0)
L8001ee20:
  sll $zero, $zero, 0x0
L8001ee24:
  andi $v0, $v0, 0xfffb
L8001ee28:
  sh $v0, 8($s0)
L8001ee2c:
  sb $zero, 108($s0)
L8001ee30:
  sw $zero, 36($s0)
L8001ee34:
  lw $ra, 20($sp)
L8001ee38:
  lw $s0, 16($sp)
L8001ee3c:
  jr $ra
L8001ee40:
  addiu $sp, $sp, 24
L8001ee44:
  addiu $sp, $sp, -24
L8001ee48:
  bne $a1, $zero, L8001ee58
L8001ee4c:
  sw $ra, 16($sp)
L8001ee50:
  j L8001ef0c
L8001ee54:
  addu $v0, $zero, $zero
L8001ee58:
  lhu $v0, 22($a0)
L8001ee5c:
  sll $zero, $zero, 0x0
L8001ee60:
  andi $v0, $v0, 0x200
L8001ee64:
  beq $v0, $zero, L8001ee8c
L8001ee68:
  lui $v0, 0x801d
L8001ee6c:
  lh $v1, 12($a0)
L8001ee70:
  addiu $v0, $v0, 16964
L8001ee74:
  addiu $v1, $v1, -1
L8001ee78:
  sll $v1, $v1, 0x2
L8001ee7c:
  addu $v1, $v1, $v0
L8001ee80:
  lw $v0, 0($v1)
L8001ee84:
  j L8001eeac
L8001ee88:
  sra $v0, $v0, 0x12
L8001ee8c:
  lh $v1, 12($a0)
L8001ee90:
  addiu $v0, $v0, 16964
L8001ee94:
  addiu $v1, $v1, -1
L8001ee98:
  sll $v1, $v1, 0x2
L8001ee9c:
  addu $v1, $v1, $v0
L8001eea0:
  lw $v0, 0($v1)
L8001eea4:
  sll $zero, $zero, 0x0
L8001eea8:
  sra $v0, $v0, 0x16
L8001eeac:
  andi $a0, $v0, 0xf
L8001eeb0:
  lhu $v0, 22($a1)
L8001eeb4:
  sll $zero, $zero, 0x0
L8001eeb8:
  andi $v0, $v0, 0x200
L8001eebc:
  beq $v0, $zero, L8001eee4
L8001eec0:
  lui $v0, 0x801d
L8001eec4:
  lh $v1, 12($a1)
L8001eec8:
  addiu $v0, $v0, 16964
L8001eecc:
  addiu $v1, $v1, -1
L8001eed0:
  sll $v1, $v1, 0x2
L8001eed4:
  addu $v1, $v1, $v0
L8001eed8:
  lw $v0, 0($v1)
L8001eedc:
  j L8001ef04
L8001eee0:
  sra $v0, $v0, 0x12
L8001eee4:
  lh $v1, 12($a1)
L8001eee8:
  addiu $v0, $v0, 16964
L8001eeec:
  addiu $v1, $v1, -1
L8001eef0:
  sll $v1, $v1, 0x2
L8001eef4:
  addu $v1, $v1, $v0
L8001eef8:
  lw $v0, 0($v1)
L8001eefc:
  sll $zero, $zero, 0x0
L8001ef00:
  sra $v0, $v0, 0x16
L8001ef04:
  jal 0x8002cb80
L8001ef08:
  andi $a1, $v0, 0xf
L8001ef0c:
  lw $ra, 16($sp)
L8001ef10:
  sll $zero, $zero, 0x0
L8001ef14:
  jr $ra
L8001ef18:
  addiu $sp, $sp, 24
L8001ef1c:
  addiu $sp, $sp, -32
L8001ef20:
  sw $s0, 16($sp)
L8001ef24:
  addu $s0, $a0, $zero
L8001ef28:
  sw $s1, 20($sp)
L8001ef2c:
  sw $ra, 24($sp)
L8001ef30:
  jal 0x800170c8
L8001ef34:
  addu $s1, $a1, $zero
L8001ef38:
  addu $a0, $s0, $zero
L8001ef3c:
  addu $s0, $v0, $zero
L8001ef40:
  jal L8001ee44
L8001ef44:
  addu $a1, $s1, $zero
L8001ef48:
  andi $s0, $s0, 0xffff
L8001ef4c:
  addu $s0, $s0, $v0
L8001ef50:
  slti $v0, $s0, 10000
L8001ef54:
  bne $v0, $zero, L8001ef64
L8001ef58:
  addu $v0, $s0, $zero
L8001ef5c:
  addiu $s0, $zero, 9999
L8001ef60:
  addu $v0, $s0, $zero
L8001ef64:
  lw $ra, 24($sp)
L8001ef68:
  lw $s1, 20($sp)
L8001ef6c:
  lw $s0, 16($sp)
L8001ef70:
  jr $ra
L8001ef74:
  addiu $sp, $sp, 32
L8001ef78:
  addiu $sp, $sp, -32
L8001ef7c:
  sw $s0, 16($sp)
L8001ef80:
  addu $s0, $a0, $zero
L8001ef84:
  sw $s1, 20($sp)
L8001ef88:
  sw $ra, 24($sp)
L8001ef8c:
  jal 0x800170c8
L8001ef90:
  addu $s1, $a1, $zero
L8001ef94:
  addu $a0, $s0, $zero
L8001ef98:
  addu $s0, $v0, $zero
L8001ef9c:
  jal L8001ee44
L8001efa0:
  addu $a1, $s1, $zero
L8001efa4:
  sra $s0, $s0, 0x10
L8001efa8:
  addu $s0, $s0, $v0
L8001efac:
  slti $v0, $s0, 10000
L8001efb0:
  bne $v0, $zero, L8001efc0
L8001efb4:
  addu $v0, $s0, $zero
L8001efb8:
  addiu $s0, $zero, 9999
L8001efbc:
  addu $v0, $s0, $zero
L8001efc0:
  lw $ra, 24($sp)
L8001efc4:
  lw $s1, 20($sp)
L8001efc8:
  lw $s0, 16($sp)
L8001efcc:
  jr $ra
L8001efd0:
  addiu $sp, $sp, 32
L8001efd4:
  addiu $sp, $sp, -32
L8001efd8:
  sw $ra, 28($sp)
L8001efdc:
  sw $s2, 24($sp)
L8001efe0:
  sw $s1, 20($sp)
L8001efe4:
  sw $s0, 16($sp)
L8001efe8:
  lbu $v0, 106($a0)
L8001efec:
  sll $zero, $zero, 0x0
L8001eff0:
  sll $v1, $v0, 0x3
L8001eff4:
  subu $v1, $v1, $v0
L8001eff8:
  sll $v1, $v1, 0x2
L8001effc:
  lui $v0, 0x801a
L8001f000:
  addiu $a0, $v0, 31448
L8001f004:
  bne $a1, $zero, L8001f01c
L8001f008:
  addu $s2, $v1, $a0
L8001f00c:
  jal 0x800170c8
L8001f010:
  addu $a0, $s2, $zero
L8001f014:
  j L8001f0b8
L8001f018:
  andi $v0, $v0, 0xffff
L8001f01c:
  lbu $v0, 106($a1)
L8001f020:
  sll $zero, $zero, 0x0
L8001f024:
  sll $v1, $v0, 0x3
L8001f028:
  subu $v1, $v1, $v0
L8001f02c:
  sll $v1, $v1, 0x2
L8001f030:
  addu $s0, $v1, $a0
L8001f034:
  jal 0x800170c8
L8001f038:
  addu $a0, $s0, $zero
L8001f03c:
  addu $v1, $v0, $zero
L8001f040:
  lhu $v0, 22($s0)
L8001f044:
  sll $zero, $zero, 0x0
L8001f048:
  andi $v0, $v0, 0x800
L8001f04c:
  beq $v0, $zero, L8001f058
L8001f050:
  andi $s1, $v1, 0xffff
L8001f054:
  srl $s1, $v1, 0x10
L8001f058:
  lhu $v0, 22($s2)
L8001f05c:
  sll $zero, $zero, 0x0
L8001f060:
  andi $v0, $v0, 0x800
L8001f064:
  beq $v0, $zero, L8001f07c
L8001f068:
  addu $a0, $s2, $zero
L8001f06c:
  jal L8001ef78
L8001f070:
  addu $a1, $s0, $zero
L8001f074:
  j L8001f084
L8001f078:
  sll $zero, $zero, 0x0
L8001f07c:
  jal L8001ef1c
L8001f080:
  addu $a1, $s0, $zero
L8001f084:
  bne $v0, $s1, L8001f0b8
L8001f088:
  subu $v0, $v0, $s1
L8001f08c:
  lhu $v0, 22($s2)
L8001f090:
  sll $zero, $zero, 0x0
L8001f094:
  andi $v0, $v0, 0x800
L8001f098:
  bne $v0, $zero, L8001f0b8
L8001f09c:
  addu $v0, $zero, $zero
L8001f0a0:
  lhu $v0, 22($s0)
L8001f0a4:
  sll $zero, $zero, 0x0
L8001f0a8:
  andi $v0, $v0, 0x800
L8001f0ac:
  bne $v0, $zero, L8001f0b8
L8001f0b0:
  addu $v0, $zero, $zero
L8001f0b4:
  addiu $v0, $zero, -1
L8001f0b8:
  lw $ra, 28($sp)
L8001f0bc:
  lw $s2, 24($sp)
L8001f0c0:
  lw $s1, 20($sp)
L8001f0c4:
  lw $s0, 16($sp)
L8001f0c8:
  jr $ra
L8001f0cc:
  addiu $sp, $sp, 32
L8001f0d0:
  addiu $sp, $sp, -24
L8001f0d4:
  sw $ra, 16($sp)
L8001f0d8:
  addu $a3, $zero, $zero
L8001f0dc:
  lui $a1, 0x1
L8001f0e0:
  ori $a1, $a1, 0x8000
L8001f0e4:
  lui $v0, 0x8016
L8001f0e8:
  addiu $v1, $v0, -15324
L8001f0ec:
  addu $v0, $v1, $a1
L8001f0f0:
  sh $zero, 15464($v0)
L8001f0f4:
  addiu $a3, $a3, 1
L8001f0f8:
  slti $v0, $a3, 6
L8001f0fc:
  bne $v0, $zero, L8001f0ec
L8001f100:
  addiu $v1, $v1, 2
L8001f104:
  addu $t2, $zero, $zero
L8001f108:
  addu $a3, $t2, $zero
L8001f10c:
  lui $v0, 0x8009
L8001f110:
  addiu $t6, $v0, 2008
L8001f114:
  lui $v0, 0x801a
L8001f118:
  addiu $t5, $v0, 31448
L8001f11c:
  lui $v0, 0x8016
L8001f120:
  addiu $t3, $v0, -15324
L8001f124:
  lui $t1, 0x1
L8001f128:
  lbu $v1, 717($gp)
L8001f12c:
  ori $t1, $t1, 0x8000
L8001f130:
  sll $v0, $v1, 0x2
L8001f134:
  addu $v0, $v0, $v1
L8001f138:
  sll $t4, $v0, 0x2
L8001f13c:
  addu $v0, $a3, $t4
L8001f140:
  addu $v0, $v0, $t6
L8001f144:
  lbu $v1, 0($v0)
L8001f148:
  sll $zero, $zero, 0x0
L8001f14c:
  sll $v0, $v1, 0x3
L8001f150:
  subu $v0, $v0, $v1
L8001f154:
  sll $v0, $v0, 0x2
L8001f158:
  addu $a2, $v0, $t5
L8001f15c:
  lhu $v0, 22($a2)
L8001f160:
  sll $zero, $zero, 0x0
L8001f164:
  andi $v0, $v0, 0x8000
L8001f168:
  beq $v0, $zero, L8001f1c0
L8001f16c:
  sll $zero, $zero, 0x0
L8001f170:
  lhu $a1, 12($a2)
L8001f174:
  sll $zero, $zero, 0x0
L8001f178:
  addiu $v0, $a1, -681
L8001f17c:
  sltiu $v0, $v0, 6
L8001f180:
  beq $v0, $zero, L8001f1c0
L8001f184:
  sll $v1, $a1, 0x10
L8001f188:
  sra $v1, $v1, 0x10
L8001f18c:
  addiu $t0, $v1, -681
L8001f190:
  addiu $t2, $t2, 1
L8001f194:
  sll $v0, $t0, 0x1
L8001f198:
  addu $v0, $v0, $t3
L8001f19c:
  addu $v0, $v0, $t1
L8001f1a0:
  addiu $v1, $v1, -665
L8001f1a4:
  sll $v1, $v1, 0x1
L8001f1a8:
  sh $a1, 15464($v0)
L8001f1ac:
  lw $v0, 0($a2)
L8001f1b0:
  addu $v1, $v1, $t3
L8001f1b4:
  lbu $v0, 106($v0)
L8001f1b8:
  addu $v1, $v1, $t1
L8001f1bc:
  sh $v0, 15464($v1)
L8001f1c0:
  addiu $a3, $a3, 1
L8001f1c4:
  slti $v0, $a3, 5
L8001f1c8:
  bne $v0, $zero, L8001f140
L8001f1cc:
  addu $v0, $a3, $t4
L8001f1d0:
  beq $t2, $zero, L8001f2d8
L8001f1d4:
  addu $a3, $zero, $zero
L8001f1d8:
  lbu $v1, 106($a0)
L8001f1dc:
  lui $a0, 0x801a
L8001f1e0:
  addiu $a0, $a0, 31448
L8001f1e4:
  sll $v0, $v1, 0x3
L8001f1e8:
  subu $v0, $v0, $v1
L8001f1ec:
  sll $v0, $v0, 0x2
L8001f1f0:
  jal 0x800170c8
L8001f1f4:
  addu $a0, $v0, $a0
L8001f1f8:
  andi $t0, $v0, 0xffff
L8001f1fc:
  addiu $a1, $zero, -1
L8001f200:
  lui $a2, 0x1
L8001f204:
  ori $a2, $a2, 0x8000
L8001f208:
  lui $v0, 0x8016
L8001f20c:
  addiu $v0, $v0, -15324
L8001f210:
  addiu $a0, $v0, 10
L8001f214:
  addu $v0, $a0, $a2
L8001f218:
  lhu $v0, 15464($v0)
L8001f21c:
  addiu $t1, $gp, 28
L8001f220:
  beq $v0, $zero, L8001f238
L8001f224:
  addiu $a3, $zero, 5
L8001f228:
  lbu $v1, 33($gp)
L8001f22c:
  j L8001f264
L8001f230:
  sll $v0, $v1, 0x1
L8001f234:
  addu $a1, $a3, $zero
L8001f238:
  addiu $a3, $a3, -1
L8001f23c:
  bltz $a3, L8001f280
L8001f240:
  addiu $a0, $a0, -2
L8001f244:
  addu $v0, $a0, $a2
L8001f248:
  lhu $v0, 15464($v0)
L8001f24c:
  sll $zero, $zero, 0x0
L8001f250:
  beq $v0, $zero, L8001f238
L8001f254:
  addu $v0, $a3, $t1
L8001f258:
  lbu $v1, 0($v0)
L8001f25c:
  sll $zero, $zero, 0x0
L8001f260:
  sll $v0, $v1, 0x1
L8001f264:
  addu $v0, $v0, $v1
L8001f268:
  sll $v0, $v0, 0x3
L8001f26c:
  addu $v0, $v0, $v1
L8001f270:
  sll $v0, $v0, 0x2
L8001f274:
  slt $v0, $v0, $t0
L8001f278:
  beq $v0, $zero, L8001f234
L8001f27c:
  sll $zero, $zero, 0x0
L8001f280:
  bltz $a1, L8001f2d4
L8001f284:
  lui $a0, 0x1
L8001f288:
  ori $a0, $a0, 0x8000
L8001f28c:
  addiu $v0, $a1, 681
L8001f290:
  lui $v1, 0x8016
L8001f294:
  addiu $v1, $v1, -15324
L8001f298:
  sh $v0, 802($gp)
L8001f29c:
  addiu $v0, $a1, 16
L8001f2a0:
  sll $v0, $v0, 0x1
L8001f2a4:
  addu $v0, $v0, $v1
L8001f2a8:
  addu $v0, $v0, $a0
L8001f2ac:
  lbu $v1, 15464($v0)
L8001f2b0:
  j L8001f2c8
L8001f2b4:
  addiu $v0, $zero, 1
L8001f2b8:
  lw $v0, 0($a2)
L8001f2bc:
  sh $v1, 802($gp)
L8001f2c0:
  lbu $v1, 106($v0)
L8001f2c4:
  addiu $v0, $zero, 1
L8001f2c8:
  sb $v1, 688($gp)
L8001f2cc:
  j L8001f354
L8001f2d0:
  sll $zero, $zero, 0x0
L8001f2d4:
  addu $a3, $zero, $zero
L8001f2d8:
  lui $v0, 0x8009
L8001f2dc:
  addiu $t1, $v0, 2008
L8001f2e0:
  lui $v0, 0x801a
L8001f2e4:
  addiu $t0, $v0, 31448
L8001f2e8:
  lbu $v1, 717($gp)
L8001f2ec:
  addiu $a1, $zero, 690
L8001f2f0:
  sll $v0, $v1, 0x2
L8001f2f4:
  addu $v0, $v0, $v1
L8001f2f8:
  sll $a0, $v0, 0x2
L8001f2fc:
  addu $v0, $a3, $a0
L8001f300:
  addu $v0, $v0, $t1
L8001f304:
  lbu $v1, 0($v0)
L8001f308:
  sll $zero, $zero, 0x0
L8001f30c:
  sll $v0, $v1, 0x3
L8001f310:
  subu $v0, $v0, $v1
L8001f314:
  sll $v0, $v0, 0x2
L8001f318:
  addu $a2, $v0, $t0
L8001f31c:
  lhu $v0, 22($a2)
L8001f320:
  sll $zero, $zero, 0x0
L8001f324:
  andi $v0, $v0, 0x8000
L8001f328:
  beq $v0, $zero, L8001f340
L8001f32c:
  sll $zero, $zero, 0x0
L8001f330:
  lh $v1, 12($a2)
L8001f334:
  sll $zero, $zero, 0x0
L8001f338:
  beq $v1, $a1, L8001f2b8
L8001f33c:
  sll $zero, $zero, 0x0
L8001f340:
  addiu $a3, $a3, 1
L8001f344:
  slti $v0, $a3, 5
L8001f348:
  bne $v0, $zero, L8001f300
L8001f34c:
  addu $v0, $a3, $a0
L8001f350:
  addu $v0, $zero, $zero
L8001f354:
  lw $ra, 16($sp)
L8001f358:
  sll $zero, $zero, 0x0
L8001f35c:
  jr $ra
L8001f360:
  addiu $sp, $sp, 24
L8001f364:
  lhu $v0, 602($gp)
L8001f368:
  addiu $sp, $sp, -32
L8001f36c:
  sw $ra, 28($sp)
L8001f370:
  bne $v0, $zero, L8001f548
L8001f374:
  sw $s0, 24($sp)
L8001f378:
  lhu $v0, 776($gp)
L8001f37c:
  addiu $s0, $zero, 1
L8001f380:
  andi $v1, $v0, 0xf
L8001f384:
  beq $v1, $s0, L8001f41c
L8001f388:
  slti $v0, $v1, 2
L8001f38c:
  beq $v0, $zero, L8001f3a4
L8001f390:
  addiu $v0, $zero, 2
L8001f394:
  beq $v1, $zero, L8001f3bc
L8001f398:
  addiu $v0, $zero, 1
L8001f39c:
  j L8001f54c
L8001f3a0:
  sll $zero, $zero, 0x0
L8001f3a4:
  beq $v1, $v0, L8001f4c4
L8001f3a8:
  addiu $v0, $zero, 3
L8001f3ac:
  beq $v1, $v0, L8001f500
L8001f3b0:
  addiu $v0, $zero, 1
L8001f3b4:
  j L8001f54c
L8001f3b8:
  sll $zero, $zero, 0x0
L8001f3bc:
  addiu $a0, $zero, 16
L8001f3c0:
  addiu $a1, $zero, 520
L8001f3c4:
  addiu $a2, $zero, 512
L8001f3c8:
  lui $v0, 0x800f
L8001f3cc:
  lbu $v1, 717($gp)
L8001f3d0:
  lh $a3, 10314($v0)
L8001f3d4:
  sll $v0, $v1, 0x1
L8001f3d8:
  addu $v0, $v0, $v1
L8001f3dc:
  sll $v0, $v0, 0x2
L8001f3e0:
  subu $v0, $v0, $v1
L8001f3e4:
  sll $v0, $v0, 0x3
L8001f3e8:
  addu $v0, $v0, $v1
L8001f3ec:
  sll $v0, $v0, 0x2
L8001f3f0:
  addiu $v1, $zero, 178
L8001f3f4:
  subu $v1, $v1, $v0
L8001f3f8:
  jal 0x80022d94
L8001f3fc:
  sw $v1, 16($sp)
L8001f400:
  addiu $v0, $zero, 16
L8001f404:
  sh $v0, 602($gp)
L8001f408:
  addiu $v0, $zero, 20
L8001f40c:
  sh $s0, 776($gp)
L8001f410:
  sh $v0, 712($gp)
L8001f414:
  j L8001f54c
L8001f418:
  addiu $v0, $zero, 1
L8001f41c:
  lhu $v0, 712($gp)
L8001f420:
  sll $zero, $zero, 0x0
L8001f424:
  addiu $v0, $v0, -1
L8001f428:
  sh $v0, 712($gp)
L8001f42c:
  sll $v0, $v0, 0x10
L8001f430:
  bgtz $v0, L8001f54c
L8001f434:
  addiu $v0, $zero, 1
L8001f438:
  lui $a2, 0x4
L8001f43c:
  ori $a2, $a2, 0x8000
L8001f440:
  lui $v1, 0x8016
L8001f444:
  lbu $a1, 688($gp)
L8001f448:
  addiu $v1, $v1, -15324
L8001f44c:
  sll $v0, $a1, 0x3
L8001f450:
  subu $v0, $v0, $a1
L8001f454:
  sll $v0, $v0, 0x2
L8001f458:
  addu $v0, $v0, $v1
L8001f45c:
  addu $v0, $v0, $a2
L8001f460:
  lw $s0, 14004($v0)
L8001f464:
  jal 0x8002c68c
L8001f468:
  addiu $a0, $zero, 8
L8001f46c:
  lhu $v1, 48($s0)
L8001f470:
  sll $zero, $zero, 0x0
L8001f474:
  sh $v1, 0($v0)
L8001f478:
  lhu $v1, 50($s0)
L8001f47c:
  sll $zero, $zero, 0x0
L8001f480:
  sh $v1, 2($v0)
L8001f484:
  lhu $v1, 52($s0)
L8001f488:
  lui $a0, 0x801a
L8001f48c:
  sh $v1, 4($v0)
L8001f490:
  lbu $v1, 106($s0)
L8001f494:
  addiu $a0, $a0, 31448
L8001f498:
  sll $v0, $v1, 0x3
L8001f49c:
  subu $v0, $v0, $v1
L8001f4a0:
  sll $v0, $v0, 0x2
L8001f4a4:
  jal 0x80024954
L8001f4a8:
  addu $a0, $v0, $a0
L8001f4ac:
  jal 0x8003fee0
L8001f4b0:
  addiu $a0, $zero, 23
L8001f4b4:
  addiu $v0, $zero, 2
L8001f4b8:
  sh $v0, 776($gp)
L8001f4bc:
  j L8001f54c
L8001f4c0:
  addiu $v0, $zero, 1
L8001f4c4:
  addiu $a0, $zero, 16
L8001f4c8:
  addiu $a1, $zero, 600
L8001f4cc:
  lui $v0, 0x800f
L8001f4d0:
  lh $a3, 10314($v0)
L8001f4d4:
  addiu $a2, $zero, 256
L8001f4d8:
  jal 0x80022d94
L8001f4dc:
  sw $zero, 16($sp)
L8001f4e0:
  addiu $v0, $zero, 16
L8001f4e4:
  sh $v0, 602($gp)
L8001f4e8:
  addiu $v0, $zero, 3
L8001f4ec:
  sh $v0, 776($gp)
L8001f4f0:
  addiu $v0, $zero, 20
L8001f4f4:
  sh $v0, 712($gp)
L8001f4f8:
  j L8001f54c
L8001f4fc:
  addiu $v0, $zero, 1
L8001f500:
  lhu $v0, 712($gp)
L8001f504:
  sll $zero, $zero, 0x0
L8001f508:
  addiu $v0, $v0, -1
L8001f50c:
  sh $v0, 712($gp)
L8001f510:
  sll $v0, $v0, 0x10
L8001f514:
  bgtz $v0, L8001f54c
L8001f518:
  addiu $v0, $zero, 1
L8001f51c:
  lui $v0, 0x800f
L8001f520:
  lbu $v1, 717($gp)
L8001f524:
  addiu $v0, $v0, -24592
L8001f528:
  xori $v1, $v1, 0x1
L8001f52c:
  sll $v1, $v1, 0x5
L8001f530:
  addu $v1, $v1, $v0
L8001f534:
  lbu $a0, 6($v1)
L8001f538:
  addu $v0, $zero, $zero
L8001f53c:
  addiu $a0, $a0, 1
L8001f540:
  j L8001f54c
L8001f544:
  sb $a0, 6($v1)
L8001f548:
  addiu $v0, $zero, 1
L8001f54c:
  lw $ra, 28($sp)
L8001f550:
  lw $s0, 24($sp)
L8001f554:
  jr $ra
L8001f558:
  addiu $sp, $sp, 32
L8001f55c:
  lhu $v1, 818($gp)
L8001f560:
  addiu $sp, $sp, -48
L8001f564:
  sw $ra, 40($sp)
L8001f568:
  sw $s5, 36($sp)
L8001f56c:
  sw $s4, 32($sp)
L8001f570:
  sw $s3, 28($sp)
L8001f574:
  sw $s2, 24($sp)
L8001f578:
  sw $s1, 20($sp)
L8001f57c:
  andi $v0, $v1, 0x8000
L8001f580:
  bne $v0, $zero, L8001f6d8
L8001f584:
  sw $s0, 16($sp)
L8001f588:
  lui $a2, 0x4
L8001f58c:
  ori $a2, $a2, 0x8000
L8001f590:
  ori $v0, $v1, 0x8000
L8001f594:
  sh $v0, 818($gp)
L8001f598:
  addiu $v0, $zero, -116
L8001f59c:
  addiu $a1, $zero, 16
L8001f5a0:
  addiu $s3, $zero, 1
L8001f5a4:
  addu $a0, $zero, $zero
L8001f5a8:
  lui $s0, 0x800f
L8001f5ac:
  lw $s1, 780($gp)
L8001f5b0:
  addiu $s5, $zero, 92
L8001f5b4:
  sh $v0, 40($s1)
L8001f5b8:
  lui $v0, 0x8002
L8001f5bc:
  lhu $v1, 50($s1)
L8001f5c0:
  addiu $s2, $v0, -4832
L8001f5c4:
  sh $a1, 44($s1)
L8001f5c8:
  sb $s3, 108($s1)
L8001f5cc:
  sw $s2, 36($s1)
L8001f5d0:
  sh $v1, 42($s1)
L8001f5d4:
  lw $s1, 788($gp)
L8001f5d8:
  addiu $s4, $zero, 24
L8001f5dc:
  lhu $v1, 50($s1)
L8001f5e0:
  addiu $v0, $zero, 408
L8001f5e4:
  sh $v0, 40($s1)
L8001f5e8:
  sh $a1, 44($s1)
L8001f5ec:
  sb $s3, 108($s1)
L8001f5f0:
  sw $s2, 36($s1)
L8001f5f4:
  sh $v1, 42($s1)
L8001f5f8:
  lw $s1, -24848($s0)
L8001f5fc:
  addiu $v0, $zero, 56
L8001f600:
  sh $v0, 40($s1)
L8001f604:
  sh $s5, 42($s1)
L8001f608:
  sh $s4, 44($s1)
L8001f60c:
  sb $s3, 108($s1)
L8001f610:
  sw $s2, 36($s1)
L8001f614:
  lw $v0, -24848($s0)
L8001f618:
  lui $v1, 0x8016
L8001f61c:
  lbu $a1, 106($v0)
L8001f620:
  addiu $v1, $v1, -15324
L8001f624:
  sll $v0, $a1, 0x3
L8001f628:
  subu $v0, $v0, $a1
L8001f62c:
  sll $v0, $v0, 0x2
L8001f630:
  addu $v0, $v0, $v1
L8001f634:
  addu $v0, $v0, $a2
L8001f638:
  lh $a1, 14016($v0)
L8001f63c:
  jal 0x80029164
L8001f640:
  addiu $s0, $s0, -24848
L8001f644:
  lw $s1, 4($s0)
L8001f648:
  sh $zero, 802($gp)
L8001f64c:
  sb $zero, 688($gp)
L8001f650:
  beq $s1, $zero, L8001f670
L8001f654:
  addiu $v0, $zero, 216
L8001f658:
  sh $v0, 40($s1)
L8001f65c:
  sh $s5, 42($s1)
L8001f660:
  sh $s4, 44($s1)
L8001f664:
  sb $s3, 108($s1)
L8001f668:
  j L8001f674
L8001f66c:
  sw $s2, 36($s1)
L8001f670:
  sb $zero, 801($gp)
L8001f674:
  lui $v0, 0x800f
L8001f678:
  lw $a0, -24848($v0)
L8001f67c:
  jal L8001f0d0
L8001f680:
  sll $zero, $zero, 0x0
L8001f684:
  beq $v0, $zero, L8001f690
L8001f688:
  sll $zero, $zero, 0x0
L8001f68c:
  sb $zero, 801($gp)
L8001f690:
  lbu $v0, 717($gp)
L8001f694:
  sll $zero, $zero, 0x0
L8001f698:
  sll $v1, $v0, 0x3
L8001f69c:
  subu $v1, $v1, $v0
L8001f6a0:
  sll $v1, $v1, 0x4
L8001f6a4:
  lui $v0, 0x800f
L8001f6a8:
  addiu $v0, $v0, -24732
L8001f6ac:
  addu $v1, $v1, $v0
L8001f6b0:
  lw $a0, 4($v1)
L8001f6b4:
  sw $v1, 684($gp)
L8001f6b8:
  jal 0x8004036c
L8001f6bc:
  sll $zero, $zero, 0x0
L8001f6c0:
  lw $v1, 684($gp)
L8001f6c4:
  addiu $v0, $zero, 8
L8001f6c8:
  sh $v0, 602($gp)
L8001f6cc:
  addiu $v0, $zero, 1
L8001f6d0:
  sb $v0, 620($gp)
L8001f6d4:
  sw $zero, 4($v1)
L8001f6d8:
  lbu $v0, 620($gp)
L8001f6dc:
  sll $zero, $zero, 0x0
L8001f6e0:
  andi $v0, $v0, 0xf
L8001f6e4:
  addiu $v1, $v0, -1
L8001f6e8:
  sltiu $v0, $v1, 11
L8001f6ec:
  beq $v0, $zero, L800208b0
L8001f6f0:
  lui $v0, 0x8001
L8001f6f4:
  addiu $v0, $v0, 400
L8001f6f8:
  sll $v1, $v1, 0x2
L8001f6fc:
  addu $v1, $v1, $v0
L8001f700:
  lw $v0, 0($v1)
L8001f704:
  sll $zero, $zero, 0x0
L8001f708:
  jr $v0
L8001f70c:
  sll $zero, $zero, 0x0
L8001f710:
  lbu $a2, 620($gp)
L8001f714:
  sll $zero, $zero, 0x0
L8001f718:
  andi $v0, $a2, 0x80
L8001f71c:
  bne $v0, $zero, L8001f7b0
L8001f720:
  lui $v0, 0x200
L8001f724:
  ori $v0, $v0, 0x30
L8001f728:
  lui $v1, 0x800a
L8001f72c:
  lw $v1, -20236($v1)
L8001f730:
  lui $a0, 0x800a
L8001f734:
  lw $a0, -20172($a0)
L8001f738:
  and $v1, $v1, $v0
L8001f73c:
  or $v1, $v1, $a0
L8001f740:
  bne $v1, $zero, L8001f7b0
L8001f744:
  andi $v0, $a2, 0x40
L8001f748:
  bne $v0, $zero, L8001f7ac
L8001f74c:
  ori $v0, $a2, 0x80
L8001f750:
  lh $a1, 802($gp)
L8001f754:
  ori $v0, $a2, 0x40
L8001f758:
  sb $v0, 620($gp)
L8001f75c:
  bne $a1, $zero, L8001f79c
L8001f760:
  lui $v0, 0x800f
L8001f764:
  lw $v0, -24844($v0)
L8001f768:
  sll $zero, $zero, 0x0
L8001f76c:
  beq $v0, $zero, L800208b0
L8001f770:
  lui $a1, 0x4
L8001f774:
  ori $a1, $a1, 0x8000
L8001f778:
  lui $v1, 0x8016
L8001f77c:
  lbu $a0, 106($v0)
L8001f780:
  addiu $v1, $v1, -15324
L8001f784:
  sll $v0, $a0, 0x3
L8001f788:
  subu $v0, $v0, $a0
L8001f78c:
  sll $v0, $v0, 0x2
L8001f790:
  addu $v0, $v0, $v1
L8001f794:
  addu $v0, $v0, $a1
L8001f798:
  lh $a1, 14016($v0)
L8001f79c:
  jal 0x80029164
L8001f7a0:
  addiu $a0, $zero, 1
L8001f7a4:
  j L800208b0
L8001f7a8:
  sll $zero, $zero, 0x0
L8001f7ac:
  sb $v0, 620($gp)
L8001f7b0:
  lbu $v1, 620($gp)
L8001f7b4:
  sll $zero, $zero, 0x0
L8001f7b8:
  andi $v0, $v1, 0x20
L8001f7bc:
  bne $v0, $zero, L8001f818
L8001f7c0:
  sll $zero, $zero, 0x0
L8001f7c4:
  lhu $v0, 602($gp)
L8001f7c8:
  sll $zero, $zero, 0x0
L8001f7cc:
  bne $v0, $zero, L8001f818
L8001f7d0:
  andi $v0, $v1, 0x10
L8001f7d4:
  bne $v0, $zero, L8001f814
L8001f7d8:
  ori $v0, $v1, 0x20
L8001f7dc:
  ori $v0, $v1, 0x10
L8001f7e0:
  lbu $v1, 717($gp)
L8001f7e4:
  sb $v0, 620($gp)
L8001f7e8:
  addiu $v0, $zero, 12
L8001f7ec:
  sh $v0, 602($gp)
L8001f7f0:
  sll $v0, $v1, 0x3
L8001f7f4:
  subu $v0, $v0, $v1
L8001f7f8:
  sll $v0, $v0, 0x4
L8001f7fc:
  lui $v1, 0x800f
L8001f800:
  addiu $v1, $v1, -24760
L8001f804:
  addu $v0, $v0, $v1
L8001f808:
  sw $v0, 684($gp)
L8001f80c:
  j L8001f818
L8001f810:
  sll $zero, $zero, 0x0
L8001f814:
  sb $v0, 620($gp)
L8001f818:
  lbu $v0, 620($gp)
L8001f81c:
  addiu $v1, $zero, 160
L8001f820:
  andi $v0, $v0, 0xa0
L8001f824:
  bne $v0, $v1, L800208b0
L8001f828:
  sll $zero, $zero, 0x0
L8001f82c:
  jal 0x80042b40
L8001f830:
  addiu $a0, $zero, 1
L8001f834:
  bne $v0, $zero, L800208b0
L8001f838:
  addiu $v0, $zero, 2
L8001f83c:
  sb $v0, 620($gp)
L8001f840:
  j L800208b0
L8001f844:
  sll $zero, $zero, 0x0
L8001f848:
  lbu $v1, 620($gp)
L8001f84c:
  sll $zero, $zero, 0x0
L8001f850:
  andi $v0, $v1, 0x80
L8001f854:
  bne $v0, $zero, L8001fa10
L8001f858:
  andi $v0, $v1, 0x20
L8001f85c:
  addiu $a3, $zero, 8
L8001f860:
  lui $s0, 0x800f
L8001f864:
  ori $v0, $v1, 0x80
L8001f868:
  lw $s1, -24848($s0)
L8001f86c:
  addiu $s0, $s0, -24848
L8001f870:
  sb $v0, 620($gp)
L8001f874:
  lbu $a1, 33($s1)
L8001f878:
  addu $a0, $s1, $zero
L8001f87c:
  jal L80019ba0
L8001f880:
  addiu $a2, $a1, 64
L8001f884:
  lbu $v0, 106($s1)
L8001f888:
  sll $zero, $zero, 0x0
L8001f88c:
  sll $a0, $v0, 0x3
L8001f890:
  subu $a0, $a0, $v0
L8001f894:
  sll $a0, $a0, 0x2
L8001f898:
  lui $v0, 0x801a
L8001f89c:
  addiu $s4, $v0, 31448
L8001f8a0:
  jal 0x800170c8
L8001f8a4:
  addu $a0, $a0, $s4
L8001f8a8:
  addu $s2, $v0, $zero
L8001f8ac:
  addu $a0, $zero, $zero
L8001f8b0:
  andi $a1, $s2, 0xffff
L8001f8b4:
  jal 0x800291e0
L8001f8b8:
  sra $a2, $s2, 0x10
L8001f8bc:
  addu $s1, $v0, $zero
L8001f8c0:
  addu $a0, $s1, $zero
L8001f8c4:
  lui $v0, 0x800f
L8001f8c8:
  addiu $s3, $v0, -24344
L8001f8cc:
  lbu $v0, 60($s3)
L8001f8d0:
  addiu $a1, $zero, -10
L8001f8d4:
  ori $v0, $v0, 0x40
L8001f8d8:
  sb $v0, 60($s3)
L8001f8dc:
  addiu $v0, $zero, 10
L8001f8e0:
  sh $v0, 48($s1)
L8001f8e4:
  addiu $v0, $zero, 22
L8001f8e8:
  sh $v0, 50($s1)
L8001f8ec:
  addiu $v0, $zero, 192
L8001f8f0:
  jal 0x800428ec
L8001f8f4:
  sb $v0, 33($s1)
L8001f8f8:
  lhu $v0, 8($s1)
L8001f8fc:
  sll $zero, $zero, 0x0
L8001f900:
  ori $v0, $v0, 0x4
L8001f904:
  andi $v0, $v0, 0xffbf
L8001f908:
  sh $v0, 8($s1)
L8001f90c:
  sw $s1, 8($s0)
L8001f910:
  lw $s1, 4($s0)
L8001f914:
  sll $zero, $zero, 0x0
L8001f918:
  beq $s1, $zero, L8001f9a0
L8001f91c:
  sw $zero, 12($s0)
L8001f920:
  addu $a0, $s1, $zero
L8001f924:
  lbu $a1, 33($s1)
L8001f928:
  addiu $a3, $zero, 8
L8001f92c:
  jal L80019ba0
L8001f930:
  addiu $a2, $a1, 64
L8001f934:
  lbu $v0, 106($s1)
L8001f938:
  sll $zero, $zero, 0x0
L8001f93c:
  sll $a0, $v0, 0x3
L8001f940:
  subu $a0, $a0, $v0
L8001f944:
  sll $a0, $a0, 0x2
L8001f948:
  jal 0x800170c8
L8001f94c:
  addu $a0, $a0, $s4
L8001f950:
  addu $s2, $v0, $zero
L8001f954:
  addiu $a0, $zero, 1
L8001f958:
  andi $a1, $s2, 0xffff
L8001f95c:
  jal 0x800291e0
L8001f960:
  sra $a2, $s2, 0x10
L8001f964:
  lhu $v1, 626($gp)
L8001f968:
  sll $zero, $zero, 0x0
L8001f96c:
  andi $v1, $v1, 0x800
L8001f970:
  beq $v1, $zero, L8001f98c
L8001f974:
  addu $s1, $v0, $zero
L8001f978:
  lbu $v0, 124($s3)
L8001f97c:
  sll $zero, $zero, 0x0
L8001f980:
  ori $v0, $v0, 0x80
L8001f984:
  j L8001f9c0
L8001f988:
  sb $v0, 124($s3)
L8001f98c:
  lbu $v0, 124($s3)
L8001f990:
  sll $zero, $zero, 0x0
L8001f994:
  ori $v0, $v0, 0x40
L8001f998:
  j L8001f9c0
L8001f99c:
  sb $v0, 124($s3)
L8001f9a0:
  lh $v0, 802($gp)
L8001f9a4:
  sll $zero, $zero, 0x0
L8001f9a8:
  beq $v0, $zero, L8001f9c0
L8001f9ac:
  addiu $a0, $zero, 1
L8001f9b0:
  addiu $a1, $zero, -1
L8001f9b4:
  jal 0x800291e0
L8001f9b8:
  addu $a2, $a1, $zero
L8001f9bc:
  addu $s1, $v0, $zero
L8001f9c0:
  beq $s1, $zero, L8001fa04
L8001f9c4:
  addu $a0, $s1, $zero
L8001f9c8:
  addiu $a1, $zero, -10
L8001f9cc:
  addiu $v0, $zero, 170
L8001f9d0:
  sh $v0, 48($s1)
L8001f9d4:
  addiu $v0, $zero, 22
L8001f9d8:
  sh $v0, 50($s1)
L8001f9dc:
  addiu $v0, $zero, 192
L8001f9e0:
  jal 0x800428ec
L8001f9e4:
  sb $v0, 33($s1)
L8001f9e8:
  lhu $v0, 8($s1)
L8001f9ec:
  sll $zero, $zero, 0x0
L8001f9f0:
  ori $v0, $v0, 0x4
L8001f9f4:
  andi $v0, $v0, 0xffbf
L8001f9f8:
  sh $v0, 8($s1)
L8001f9fc:
  lui $v0, 0x800f
L8001fa00:
  sw $s1, -24836($v0)
L8001fa04:
  lbu $v1, 620($gp)
L8001fa08:
  sll $zero, $zero, 0x0
L8001fa0c:
  andi $v0, $v1, 0x20
L8001fa10:
  beq $v0, $zero, L8001fa40
L8001fa14:
  andi $v0, $v1, 0x40
L8001fa18:
  jal L8001f364
L8001fa1c:
  sll $zero, $zero, 0x0
L8001fa20:
  bne $v0, $zero, L800208b0
L8001fa24:
  sll $zero, $zero, 0x0
L8001fa28:
  lbu $v0, 620($gp)
L8001fa2c:
  sll $zero, $zero, 0x0
L8001fa30:
  andi $v0, $v0, 0xdf
L8001fa34:
  sb $v0, 620($gp)
L8001fa38:
  j L800208b0
L8001fa3c:
  sll $zero, $zero, 0x0
L8001fa40:
  bne $v0, $zero, L8001faf0
L8001fa44:
  lui $v0, 0x800f
L8001fa48:
  jal 0x80042b40
L8001fa4c:
  addiu $a0, $zero, 1
L8001fa50:
  bne $v0, $zero, L800208b0
L8001fa54:
  lui $a0, 0x800f
L8001fa58:
  lw $v1, -24848($a0)
L8001fa5c:
  sll $zero, $zero, 0x0
L8001fa60:
  lhu $v0, 8($v1)
L8001fa64:
  addiu $a0, $a0, -24848
L8001fa68:
  andi $v0, $v0, 0xffbf
L8001fa6c:
  sh $v0, 8($v1)
L8001fa70:
  lw $v1, 8($a0)
L8001fa74:
  sll $zero, $zero, 0x0
L8001fa78:
  lhu $v0, 8($v1)
L8001fa7c:
  sll $zero, $zero, 0x0
L8001fa80:
  ori $v0, $v0, 0x40
L8001fa84:
  sh $v0, 8($v1)
L8001fa88:
  lw $v1, 4($a0)
L8001fa8c:
  sll $zero, $zero, 0x0
L8001fa90:
  beq $v1, $zero, L8001faa8
L8001fa94:
  sll $zero, $zero, 0x0
L8001fa98:
  lhu $v0, 8($v1)
L8001fa9c:
  sll $zero, $zero, 0x0
L8001faa0:
  andi $v0, $v0, 0xffbf
L8001faa4:
  sh $v0, 8($v1)
L8001faa8:
  lw $a0, 12($a0)
L8001faac:
  sll $zero, $zero, 0x0
L8001fab0:
  beq $a0, $zero, L8001fac8
L8001fab4:
  sll $zero, $zero, 0x0
L8001fab8:
  lhu $v0, 8($a0)
L8001fabc:
  sll $zero, $zero, 0x0
L8001fac0:
  ori $v0, $v0, 0x40
L8001fac4:
  sh $v0, 8($a0)
L8001fac8:
  lbu $a0, 620($gp)
L8001facc:
  lh $v1, 802($gp)
L8001fad0:
  ori $v0, $a0, 0x40
L8001fad4:
  sb $v0, 620($gp)
L8001fad8:
  beq $v1, $zero, L800208b0
L8001fadc:
  ori $v0, $a0, 0x60
L8001fae0:
  sb $v0, 620($gp)
L8001fae4:
  sh $zero, 776($gp)
L8001fae8:
  j L800208b0
L8001faec:
  sll $zero, $zero, 0x0
L8001faf0:
  addiu $a1, $v0, -24848
L8001faf4:
  lw $v1, 8($a1)
L8001faf8:
  sll $zero, $zero, 0x0
L8001fafc:
  lbu $v0, 33($v1)
L8001fb00:
  sll $zero, $zero, 0x0
L8001fb04:
  addiu $v0, $v0, 8
L8001fb08:
  sb $v0, 33($v1)
L8001fb0c:
  lw $v1, 8($a1)
L8001fb10:
  sll $zero, $zero, 0x0
L8001fb14:
  lb $v0, 33($v1)
L8001fb18:
  sll $zero, $zero, 0x0
L8001fb1c:
  bltz $v0, L8001fb40
L8001fb20:
  addiu $a0, $zero, 3
L8001fb24:
  sb $zero, 33($v1)
L8001fb28:
  lw $v0, 8($a1)
L8001fb2c:
  sll $zero, $zero, 0x0
L8001fb30:
  lhu $v1, 8($v0)
L8001fb34:
  sb $a0, 620($gp)
L8001fb38:
  andi $v1, $v1, 0xfffb
L8001fb3c:
  sh $v1, 8($v0)
L8001fb40:
  lw $v1, 12($a1)
L8001fb44:
  sll $zero, $zero, 0x0
L8001fb48:
  beq $v1, $zero, L800208b0
L8001fb4c:
  sll $zero, $zero, 0x0
L8001fb50:
  lw $v0, 8($a1)
L8001fb54:
  sll $zero, $zero, 0x0
L8001fb58:
  lbu $v0, 33($v0)
L8001fb5c:
  sll $zero, $zero, 0x0
L8001fb60:
  sb $v0, 33($v1)
L8001fb64:
  andi $v0, $v0, 0xff
L8001fb68:
  bne $v0, $zero, L800208b0
L8001fb6c:
  sll $zero, $zero, 0x0
L8001fb70:
  lw $v1, 12($a1)
L8001fb74:
  sll $zero, $zero, 0x0
L8001fb78:
  lhu $v0, 8($v1)
L8001fb7c:
  sll $zero, $zero, 0x0
L8001fb80:
  andi $v0, $v0, 0xfffb
L8001fb84:
  j L800208b0
L8001fb88:
  sh $v0, 8($v1)
L8001fb8c:
  lbu $v1, 620($gp)
L8001fb90:
  sll $zero, $zero, 0x0
L8001fb94:
  andi $v0, $v1, 0x80
L8001fb98:
  bne $v0, $zero, L8001fbb8
L8001fb9c:
  lui $v0, 0x800f
L8001fba0:
  ori $v0, $v1, 0x80
L8001fba4:
  sb $v0, 620($gp)
L8001fba8:
  jal 0x80015cc0
L8001fbac:
  sll $zero, $zero, 0x0
L8001fbb0:
  j L800208b0
L8001fbb4:
  sll $zero, $zero, 0x0
L8001fbb8:
  lbu $v0, -24882($v0)
L8001fbbc:
  sll $zero, $zero, 0x0
L8001fbc0:
  andi $v0, $v0, 0x80
L8001fbc4:
  bne $v0, $zero, L800208b0
L8001fbc8:
  addiu $v0, $zero, 4
L8001fbcc:
  lh $v1, 802($gp)
L8001fbd0:
  sb $v0, 620($gp)
L8001fbd4:
  beq $v1, $zero, L8001fbec
L8001fbd8:
  xori $v0, $v1, 0x2b2
L8001fbdc:
  sltiu $v0, $v0, 1
L8001fbe0:
  sb $v0, 689($gp)
L8001fbe4:
  j L80020444
L8001fbe8:
  addiu $v0, $zero, 10
L8001fbec:
  lui $v0, 0x800f
L8001fbf0:
  addiu $s0, $v0, -24848
L8001fbf4:
  lw $a0, -24848($v0)
L8001fbf8:
  lw $a1, 4($s0)
L8001fbfc:
  jal L8001efd4
L8001fc00:
  sll $zero, $zero, 0x0
L8001fc04:
  addu $s2, $v0, $zero
L8001fc08:
  bltz $s2, L8001fd20
L8001fc0c:
  addiu $v0, $zero, 1
L8001fc10:
  sb $zero, 680($gp)
L8001fc14:
  sh $zero, 668($gp)
L8001fc18:
  sb $v0, 681($gp)
L8001fc1c:
  sh $zero, 670($gp)
L8001fc20:
  beq $s2, $zero, L800208b0
L8001fc24:
  sll $zero, $zero, 0x0
L8001fc28:
  lw $v0, 4($s0)
L8001fc2c:
  sll $zero, $zero, 0x0
L8001fc30:
  beq $v0, $zero, L8001fc98
L8001fc34:
  lui $v1, 0x800f
L8001fc38:
  lhu $v0, 626($gp)
L8001fc3c:
  sll $zero, $zero, 0x0
L8001fc40:
  andi $v0, $v0, 0x800
L8001fc44:
  beq $v0, $zero, L8001fc98
L8001fc48:
  sll $zero, $zero, 0x0
L8001fc4c:
  lw $v1, 704($gp)
L8001fc50:
  sll $zero, $zero, 0x0
L8001fc54:
  lbu $v0, 11($v1)
L8001fc58:
  sll $zero, $zero, 0x0
L8001fc5c:
  addiu $v0, $v0, 1
L8001fc60:
  sb $v0, 11($v1)
L8001fc64:
  addiu $v0, $zero, -1
L8001fc68:
  sb $v0, 681($gp)
L8001fc6c:
  lui $v0, 0x800f
L8001fc70:
  lbu $v1, 717($gp)
L8001fc74:
  addiu $v0, $v0, -24592
L8001fc78:
  xori $v1, $v1, 0x1
L8001fc7c:
  sll $v1, $v1, 0x5
L8001fc80:
  addu $v1, $v1, $v0
L8001fc84:
  lbu $v0, 12($v1)
L8001fc88:
  sll $zero, $zero, 0x0
L8001fc8c:
  addiu $v0, $v0, 1
L8001fc90:
  j L800208b0
L8001fc94:
  sb $v0, 12($v1)
L8001fc98:
  lbu $v0, 717($gp)
L8001fc9c:
  addiu $v1, $v1, -24592
L8001fca0:
  xori $v0, $v0, 0x1
L8001fca4:
  sll $v0, $v0, 0x5
L8001fca8:
  addu $v1, $v0, $v1
L8001fcac:
  lhu $v0, 20($v1)
L8001fcb0:
  sll $zero, $zero, 0x0
L8001fcb4:
  subu $v0, $v0, $s2
L8001fcb8:
  sh $v0, 20($v1)
L8001fcbc:
  sll $v0, $v0, 0x10
L8001fcc0:
  bgez $v0, L8001fccc
L8001fcc4:
  lui $v0, 0x800f
L8001fcc8:
  sh $zero, 20($v1)
L8001fccc:
  lw $v0, -24844($v0)
L8001fcd0:
  sll $zero, $zero, 0x0
L8001fcd4:
  beq $v0, $zero, L8001fd10
L8001fcd8:
  addiu $v0, $zero, -1
L8001fcdc:
  lw $v1, 704($gp)
L8001fce0:
  sll $zero, $zero, 0x0
L8001fce4:
  lbu $v0, 11($v1)
L8001fce8:
  sll $zero, $zero, 0x0
L8001fcec:
  addiu $v0, $v0, 1
L8001fcf0:
  sb $v0, 11($v1)
L8001fcf4:
  lw $v1, 704($gp)
L8001fcf8:
  sll $zero, $zero, 0x0
L8001fcfc:
  lbu $v0, 2($v1)
L8001fd00:
  sll $zero, $zero, 0x0
L8001fd04:
  addiu $v0, $v0, 1
L8001fd08:
  sb $v0, 2($v1)
L8001fd0c:
  addiu $v0, $zero, -1
L8001fd10:
  sb $v0, 681($gp)
L8001fd14:
  sh $s2, 670($gp)
L8001fd18:
  j L800208b0
L8001fd1c:
  sll $zero, $zero, 0x0
L8001fd20:
  addiu $v0, $zero, -1
L8001fd24:
  sb $v0, 680($gp)
L8001fd28:
  sb $v0, 681($gp)
L8001fd2c:
  slti $v0, $s2, -1
L8001fd30:
  sh $zero, 668($gp)
L8001fd34:
  sh $zero, 670($gp)
L8001fd38:
  beq $v0, $zero, L800208b0
L8001fd3c:
  lui $v1, 0x800f
L8001fd40:
  lbu $v0, 717($gp)
L8001fd44:
  addiu $a1, $v1, -24592
L8001fd48:
  sll $v0, $v0, 0x5
L8001fd4c:
  addu $v1, $v0, $a1
L8001fd50:
  lhu $v0, 20($v1)
L8001fd54:
  sll $zero, $zero, 0x0
L8001fd58:
  addu $v0, $v0, $s2
L8001fd5c:
  sh $v0, 20($v1)
L8001fd60:
  sll $v0, $v0, 0x10
L8001fd64:
  bgez $v0, L8001fd70
L8001fd68:
  sll $zero, $zero, 0x0
L8001fd6c:
  sh $zero, 20($v1)
L8001fd70:
  lhu $v0, 626($gp)
L8001fd74:
  addiu $a0, $zero, 1
L8001fd78:
  sh $s2, 668($gp)
L8001fd7c:
  sb $a0, 681($gp)
L8001fd80:
  andi $v0, $v0, 0x800
L8001fd84:
  beq $v0, $zero, L800208b0
L8001fd88:
  sll $zero, $zero, 0x0
L8001fd8c:
  lbu $v1, 717($gp)
L8001fd90:
  sb $a0, 680($gp)
L8001fd94:
  xori $v1, $v1, 0x1
L8001fd98:
  sll $v1, $v1, 0x5
L8001fd9c:
  addu $v1, $v1, $a1
L8001fda0:
  lbu $v0, 3($v1)
L8001fda4:
  sll $zero, $zero, 0x0
L8001fda8:
  addiu $v0, $v0, 1
L8001fdac:
  j L800208b0
L8001fdb0:
  sb $v0, 3($v1)
L8001fdb4:
  lbu $a0, 620($gp)
L8001fdb8:
  sll $zero, $zero, 0x0
L8001fdbc:
  andi $v0, $a0, 0x80
L8001fdc0:
  bne $v0, $zero, L8001ff0c
L8001fdc4:
  lui $a2, 0x800f
L8001fdc8:
  addiu $s0, $a2, -24848
L8001fdcc:
  lw $v1, 4($s0)
L8001fdd0:
  ori $v0, $a0, 0x80
L8001fdd4:
  sb $v0, 620($gp)
L8001fdd8:
  beq $v1, $zero, L8001ff0c
L8001fddc:
  lui $v0, 0x801a
L8001fde0:
  addiu $s3, $v0, 31448
L8001fde4:
  lbu $v1, 106($v1)
L8001fde8:
  lw $v0, -24848($a2)
L8001fdec:
  sll $a1, $v1, 0x3
L8001fdf0:
  subu $a1, $a1, $v1
L8001fdf4:
  sll $a1, $a1, 0x2
L8001fdf8:
  lbu $v0, 106($v0)
L8001fdfc:
  addu $a1, $a1, $s3
L8001fe00:
  sll $a0, $v0, 0x3
L8001fe04:
  subu $a0, $a0, $v0
L8001fe08:
  sll $a0, $a0, 0x2
L8001fe0c:
  jal L8001ee44
L8001fe10:
  addu $a0, $a0, $s3
L8001fe14:
  addu $s2, $v0, $zero
L8001fe18:
  beq $s2, $zero, L800208b0
L8001fe1c:
  sll $zero, $zero, 0x0
L8001fe20:
  lw $s1, 8($s0)
L8001fe24:
  sb $zero, 689($gp)
L8001fe28:
  bgez $s2, L8001fe38
L8001fe2c:
  addiu $v0, $zero, 1
L8001fe30:
  lw $s1, 12($s0)
L8001fe34:
  sb $v0, 689($gp)
L8001fe38:
  lb $v0, 689($gp)
L8001fe3c:
  sll $zero, $zero, 0x0
L8001fe40:
  sll $v0, $v0, 0x2
L8001fe44:
  addu $v0, $v0, $s0
L8001fe48:
  lw $v0, 0($v0)
L8001fe4c:
  sll $zero, $zero, 0x0
L8001fe50:
  lbu $v1, 106($v0)
L8001fe54:
  sll $zero, $zero, 0x0
L8001fe58:
  sll $v0, $v1, 0x3
L8001fe5c:
  subu $v0, $v0, $v1
L8001fe60:
  sll $v0, $v0, 0x2
L8001fe64:
  addu $v1, $v0, $s3
L8001fe68:
  lhu $v0, 22($v1)
L8001fe6c:
  sll $zero, $zero, 0x0
L8001fe70:
  andi $v0, $v0, 0x200
L8001fe74:
  beq $v0, $zero, L8001fe9c
L8001fe78:
  lui $v0, 0x801d
L8001fe7c:
  lh $v1, 12($v1)
L8001fe80:
  addiu $v0, $v0, 16964
L8001fe84:
  addiu $v1, $v1, -1
L8001fe88:
  sll $v1, $v1, 0x2
L8001fe8c:
  addu $v1, $v1, $v0
L8001fe90:
  lw $v0, 0($v1)
L8001fe94:
  j L8001febc
L8001fe98:
  sra $v0, $v0, 0x12
L8001fe9c:
  lh $v1, 12($v1)
L8001fea0:
  addiu $v0, $v0, 16964
L8001fea4:
  addiu $v1, $v1, -1
L8001fea8:
  sll $v1, $v1, 0x2
L8001feac:
  addu $v1, $v1, $v0
L8001feb0:
  lw $v0, 0($v1)
L8001feb4:
  sll $zero, $zero, 0x0
L8001feb8:
  sra $v0, $v0, 0x16
L8001febc:
  andi $s2, $v0, 0xf
L8001fec0:
  jal 0x8003fee0
L8001fec4:
  addiu $a0, $zero, 29
L8001fec8:
  jal 0x8002c604
L8001fecc:
  addiu $a0, $zero, 14
L8001fed0:
  addu $s0, $v0, $zero
L8001fed4:
  lhu $v1, 48($s1)
L8001fed8:
  lbu $v0, 620($gp)
L8001fedc:
  sw $s0, 628($gp)
L8001fee0:
  sh $zero, 712($gp)
L8001fee4:
  addiu $v1, $v1, 70
L8001fee8:
  sh $v1, 0($s0)
L8001feec:
  addiu $v1, $s2, -1
L8001fef0:
  lhu $a0, 50($s1)
L8001fef4:
  ori $v0, $v0, 0x60
L8001fef8:
  sh $v1, 26($s0)
L8001fefc:
  sb $v0, 620($gp)
L8001ff00:
  addiu $a0, $a0, 98
L8001ff04:
  j L800208b0
L8001ff08:
  sh $a0, 2($s0)
L8001ff0c:
  lbu $v1, 620($gp)
L8001ff10:
  sll $zero, $zero, 0x0
L8001ff14:
  andi $v0, $v1, 0x20
L8001ff18:
  beq $v0, $zero, L8001ff50
L8001ff1c:
  andi $v0, $v1, 0x40
L8001ff20:
  lw $v0, 628($gp)
L8001ff24:
  sll $zero, $zero, 0x0
L8001ff28:
  lbu $v0, 28($v0)
L8001ff2c:
  sll $zero, $zero, 0x0
L8001ff30:
  andi $v0, $v0, 0x80
L8001ff34:
  bne $v0, $zero, L8001ff50
L8001ff38:
  andi $v0, $v1, 0x40
L8001ff3c:
  andi $v0, $v1, 0xdf
L8001ff40:
  sb $v0, 620($gp)
L8001ff44:
  lbu $v1, 620($gp)
L8001ff48:
  sll $zero, $zero, 0x0
L8001ff4c:
  andi $v0, $v1, 0x40
L8001ff50:
  beq $v0, $zero, L8001ffac
L8001ff54:
  sll $zero, $zero, 0x0
L8001ff58:
  lhu $v0, 712($gp)
L8001ff5c:
  sll $zero, $zero, 0x0
L8001ff60:
  addiu $v0, $v0, 16
L8001ff64:
  sh $v0, 712($gp)
L8001ff68:
  sll $v0, $v0, 0x10
L8001ff6c:
  sra $v0, $v0, 0x10
L8001ff70:
  slti $v0, $v0, 500
L8001ff74:
  bne $v0, $zero, L8001ff90
L8001ff78:
  lui $v0, 0x800f
L8001ff7c:
  andi $v0, $v1, 0xbf
L8001ff80:
  sb $v0, 620($gp)
L8001ff84:
  addiu $v0, $zero, 500
L8001ff88:
  sh $v0, 712($gp)
L8001ff8c:
  lui $v0, 0x800f
L8001ff90:
  addiu $v0, $v0, -24344
L8001ff94:
  lb $v1, 689($gp)
L8001ff98:
  lhu $a0, 712($gp)
L8001ff9c:
  sll $v1, $v1, 0x6
L8001ffa0:
  addu $v1, $v1, $v0
L8001ffa4:
  sh $a0, 54($v1)
L8001ffa8:
  sh $a0, 56($v1)
L8001ffac:
  lbu $v0, 620($gp)
L8001ffb0:
  sll $zero, $zero, 0x0
L8001ffb4:
  andi $v0, $v0, 0x60
L8001ffb8:
  bne $v0, $zero, L800208b0
L8001ffbc:
  addiu $v0, $zero, 7
L8001ffc0:
  lbu $v1, 801($gp)
L8001ffc4:
  sb $v0, 620($gp)
L8001ffc8:
  beq $v1, $zero, L800208b0
L8001ffcc:
  addiu $v0, $zero, 5
L8001ffd0:
  sb $v0, 620($gp)
L8001ffd4:
  j L800208b0
L8001ffd8:
  sll $zero, $zero, 0x0
L8001ffdc:
  lbu $v1, 620($gp)
L8001ffe0:
  sll $zero, $zero, 0x0
L8001ffe4:
  andi $v0, $v1, 0x80
L8001ffe8:
  bne $v0, $zero, L80020024
L8001ffec:
  lui $v0, 0x800f
L8001fff0:
  ori $v0, $v1, 0x80
L8001fff4:
  sb $v0, 620($gp)
L8001fff8:
  jal 0x8003ff34
L8001fffc:
  sll $zero, $zero, 0x0
L80020000:
  jal 0x80015904
L80020004:
  sll $zero, $zero, 0x0
L80020008:
  addiu $a0, $zero, 255
L8002000c:
  lui $v1, 0x800f
L80020010:
  addu $v0, $a0, $zero
L80020014:
  jal 0x800156b8
L80020018:
  sb $v0, -24884($v1)
L8002001c:
  j L800208b0
L80020020:
  sll $zero, $zero, 0x0
L80020024:
  lbu $v0, -24882($v0)
L80020028:
  sll $zero, $zero, 0x0
L8002002c:
  andi $v0, $v0, 0x80
L80020030:
  bne $v0, $zero, L800208b0
L80020034:
  sll $zero, $zero, 0x0
L80020038:
  jal 0x80049120
L8002003c:
  sll $zero, $zero, 0x0
L80020040:
  bne $v0, $zero, L800208b0
L80020044:
  sll $zero, $zero, 0x0
L80020048:
  lui $a0, 0x800a
L8002004c:
  lhu $a0, -19596($a0)
L80020050:
  jal 0x800472a8
L80020054:
  lui $s4, 0x800f
L80020058:
  lui $a0, 0x800a
L8002005c:
  lhu $a0, -19596($a0)
L80020060:
  jal 0x80059c18
L80020064:
  addiu $s3, $s4, -24848
L80020068:
  lui $v1, 0x801a
L8002006c:
  addiu $v1, $v1, 31448
L80020070:
  lw $v0, -24848($s4)
L80020074:
  lw $a2, 4($s3)
L80020078:
  lbu $a1, 107($v0)
L8002007c:
  lbu $a0, 106($v0)
L80020080:
  lbu $a2, 106($a2)
L80020084:
  sll $v0, $a0, 0x3
L80020088:
  subu $v0, $v0, $a0
L8002008c:
  sll $v0, $v0, 0x2
L80020090:
  addu $s0, $v0, $v1
L80020094:
  sll $v0, $a2, 0x3
L80020098:
  subu $v0, $v0, $a2
L8002009c:
  sll $v0, $v0, 0x2
L800200a0:
  jal 0x80024d34
L800200a4:
  addu $s1, $v0, $v1
L800200a8:
  lhu $v0, 624($gp)
L800200ac:
  lhu $v1, 22($s0)
L800200b0:
  andi $v0, $v0, 0xa00
L800200b4:
  ori $v0, $v0, 0x4000
L800200b8:
  or $v1, $v1, $v0
L800200bc:
  sh $v1, 22($s0)
L800200c0:
  lhu $v0, 616($gp)
L800200c4:
  sll $zero, $zero, 0x0
L800200c8:
  sh $v0, 18($s0)
L800200cc:
  lw $v0, 4($s3)
L800200d0:
  sll $zero, $zero, 0x0
L800200d4:
  lbu $a0, 106($v0)
L800200d8:
  lbu $a1, 107($v0)
L800200dc:
  jal 0x80024d34
L800200e0:
  sll $zero, $zero, 0x0
L800200e4:
  lhu $v0, 626($gp)
L800200e8:
  lhu $v1, 22($s1)
L800200ec:
  andi $v0, $v0, 0xa00
L800200f0:
  or $v1, $v1, $v0
L800200f4:
  sh $v1, 22($s1)
L800200f8:
  lhu $v0, 618($gp)
L800200fc:
  lui $v1, 0x800f
L80020100:
  sh $v0, 18($s1)
L80020104:
  lw $a0, -24848($s4)
L80020108:
  lw $a1, 4($s3)
L8002010c:
  addiu $v0, $zero, -1
L80020110:
  sb $v0, 769($gp)
L80020114:
  sb $v0, 768($gp)
L80020118:
  lhu $a2, 12($s0)
L8002011c:
  lhu $v0, 624($gp)
L80020120:
  addiu $s0, $v1, -2472
L80020124:
  sb $zero, 6($s0)
L80020128:
  sh $zero, 2($s0)
L8002012c:
  sh $zero, 4($s0)
L80020130:
  srl $v0, $v0, 0x9
L80020134:
  sh $a2, -2472($v1)
L80020138:
  lhu $v1, 626($gp)
L8002013c:
  andi $v0, $v0, 0x1
L80020140:
  sb $v0, 7($s0)
L80020144:
  lhu $a2, 12($s1)
L80020148:
  sh $zero, 10($s0)
L8002014c:
  sh $zero, 12($s0)
L80020150:
  srl $v0, $v1, 0x9
L80020154:
  andi $v0, $v0, 0x1
L80020158:
  srl $v1, $v1, 0xb
L8002015c:
  andi $v1, $v1, 0x1
L80020160:
  sb $v0, 15($s0)
L80020164:
  sb $v1, 14($s0)
L80020168:
  jal L8001efd4
L8002016c:
  sh $a2, 8($s0)
L80020170:
  addu $s2, $v0, $zero
L80020174:
  addiu $v0, $zero, -1
L80020178:
  bne $s2, $v0, L800201a8
L8002017c:
  sll $zero, $zero, 0x0
L80020180:
  lw $v0, -24848($s4)
L80020184:
  lw $v1, 4($s3)
L80020188:
  lbu $v0, 106($v0)
L8002018c:
  sll $zero, $zero, 0x0
L80020190:
  sb $v0, 768($gp)
L80020194:
  lbu $v0, 106($v1)
L80020198:
  sll $zero, $zero, 0x0
L8002019c:
  sb $v0, 769($gp)
L800201a0:
  j L800201fc
L800201a4:
  addiu $v1, $zero, 1
L800201a8:
  blez $s2, L800201c4
L800201ac:
  addiu $v1, $zero, 1
L800201b0:
  lw $v0, 4($s3)
L800201b4:
  sh $v1, 2($s0)
L800201b8:
  lbu $v0, 106($v0)
L800201bc:
  sll $zero, $zero, 0x0
L800201c0:
  sb $v0, 768($gp)
L800201c4:
  bgez $s2, L800201fc
L800201c8:
  addiu $v1, $zero, 1
L800201cc:
  lhu $v0, 22($s1)
L800201d0:
  sll $zero, $zero, 0x0
L800201d4:
  andi $v0, $v0, 0x800
L800201d8:
  bne $v0, $zero, L80020200
L800201dc:
  addiu $v0, $zero, 3
L800201e0:
  lw $v0, -24848($s4)
L800201e4:
  addiu $v1, $zero, 1
L800201e8:
  sh $v1, 10($s0)
L800201ec:
  lbu $v0, 106($v0)
L800201f0:
  sll $zero, $zero, 0x0
L800201f4:
  sb $v0, 768($gp)
L800201f8:
  addiu $v1, $zero, 1
L800201fc:
  addiu $v0, $zero, 3
L80020200:
  lui $at, 0x800a
L80020204:
  sb $v1, -19607($at)
L80020208:
  lui $at, 0x800a
L8002020c:
  sb $v0, -19863($at)
L80020210:
  lui $at, 0x800a
L80020214:
  sb $v1, -19860($at)
L80020218:
  j L800208b0
L8002021c:
  sll $zero, $zero, 0x0
L80020220:
  lui $v0, 0x800f
L80020224:
  lw $v0, -24844($v0)
L80020228:
  sll $zero, $zero, 0x0
L8002022c:
  bne $v0, $zero, L80020244
L80020230:
  addiu $v0, $zero, 2
L80020234:
  addiu $v0, $zero, 9
L80020238:
  sb $v0, 620($gp)
L8002023c:
  j L800208b0
L80020240:
  sll $zero, $zero, 0x0
L80020244:
  sb $v0, 689($gp)
L80020248:
  addiu $v0, $zero, 6
L8002024c:
  sb $v0, 620($gp)
L80020250:
  lbu $v0, 689($gp)
L80020254:
  sll $zero, $zero, 0x0
L80020258:
  addiu $v0, $v0, -1
L8002025c:
  sb $v0, 689($gp)
L80020260:
  sll $v0, $v0, 0x18
L80020264:
  bltz $v0, L8002060c
L80020268:
  addiu $v0, $zero, 8
L8002026c:
  sb $v0, 620($gp)
L80020270:
  lui $v0, 0x800f
L80020274:
  addiu $v0, $v0, -24848
L80020278:
  lb $a1, 689($gp)
L8002027c:
  lbu $a0, 620($gp)
L80020280:
  addiu $v1, $a1, 2
L80020284:
  sll $v1, $v1, 0x2
L80020288:
  addu $v1, $v1, $v0
L8002028c:
  andi $v0, $a0, 0x80
L80020290:
  lw $s1, 0($v1)
L80020294:
  bne $v0, $zero, L80020370
L80020298:
  ori $v0, $a0, 0xc0
L8002029c:
  sb $v0, 620($gp)
L800202a0:
  lw $v0, 48($s1)
L800202a4:
  addiu $s3, $gp, 680
L800202a8:
  sw $v0, 40($s1)
L800202ac:
  addu $v0, $a1, $s3
L800202b0:
  lb $v0, 0($v0)
L800202b4:
  sll $zero, $zero, 0x0
L800202b8:
  beq $v0, $zero, L80020434
L800202bc:
  addiu $v0, $zero, 6
L800202c0:
  jal 0x8002c604
L800202c4:
  addiu $a0, $zero, 2
L800202c8:
  addu $s0, $v0, $zero
L800202cc:
  lui $a0, 0x1062
L800202d0:
  lhu $v0, 48($s1)
L800202d4:
  addiu $v1, $gp, 668
L800202d8:
  addiu $v0, $v0, 70
L800202dc:
  sh $v0, 0($s0)
L800202e0:
  lhu $v0, 50($s1)
L800202e4:
  lb $a1, 689($gp)
L800202e8:
  addiu $v0, $v0, 98
L800202ec:
  sh $v0, 2($s0)
L800202f0:
  sll $v0, $a1, 0x1
L800202f4:
  addu $v0, $v0, $v1
L800202f8:
  lh $s2, 0($v0)
L800202fc:
  ori $a0, $a0, 0x4dd3
L80020300:
  bgez $s2, L8002030c
L80020304:
  addu $v0, $s2, $zero
L80020308:
  subu $v0, $zero, $v0
L8002030c:
  mult $v0, $a0
L80020310:
  sw $s0, 628($gp)
L80020314:
  sra $v0, $v0, 0x1f
L80020318:
  sh $s2, 18($s0)
L8002031c:
  mfhi $t0
L80020320:
  sra $v1, $t0, 0x6
L80020324:
  subu $s2, $v1, $v0
L80020328:
  slti $v0, $s2, 3
L8002032c:
  bne $v0, $zero, L80020338
L80020330:
  addu $v0, $a1, $s3
L80020334:
  addiu $s2, $zero, 2
L80020338:
  sh $s2, 26($s0)
L8002033c:
  lb $v0, 0($v0)
L80020340:
  sll $zero, $zero, 0x0
L80020344:
  blez $v0, L8002035c
L80020348:
  sll $zero, $zero, 0x0
L8002034c:
  lbu $v0, 620($gp)
L80020350:
  sll $zero, $zero, 0x0
L80020354:
  ori $v0, $v0, 0x20
L80020358:
  sb $v0, 620($gp)
L8002035c:
  bne $a1, $zero, L80020368
L80020360:
  addiu $a0, $s2, 16
L80020364:
  addiu $a0, $s2, 13
L80020368:
  jal 0x8003fee0
L8002036c:
  sll $zero, $zero, 0x0
L80020370:
  lbu $v1, 620($gp)
L80020374:
  sll $zero, $zero, 0x0
L80020378:
  andi $v0, $v1, 0x40
L8002037c:
  beq $v0, $zero, L80020410
L80020380:
  sll $zero, $zero, 0x0
L80020384:
  lw $a0, 628($gp)
L80020388:
  sll $zero, $zero, 0x0
L8002038c:
  lbu $v0, 28($a0)
L80020390:
  sll $zero, $zero, 0x0
L80020394:
  andi $v0, $v0, 0x80
L80020398:
  bne $v0, $zero, L800203c0
L8002039c:
  andi $v0, $v1, 0x20
L800203a0:
  lw $v0, 40($s1)
L800203a4:
  andi $v1, $v1, 0xbf
L800203a8:
  sb $v1, 620($gp)
L800203ac:
  sw $v0, 48($s1)
L800203b0:
  addiu $v0, $zero, 10
L800203b4:
  sh $v0, 712($gp)
L800203b8:
  j L800208b0
L800203bc:
  sll $zero, $zero, 0x0
L800203c0:
  bne $v0, $zero, L800208b0
L800203c4:
  sll $zero, $zero, 0x0
L800203c8:
  lbu $v0, 29($a0)
L800203cc:
  sll $zero, $zero, 0x0
L800203d0:
  beq $v0, $zero, L800208b0
L800203d4:
  sll $zero, $zero, 0x0
L800203d8:
  jal 0x8008e590
L800203dc:
  sll $zero, $zero, 0x0
L800203e0:
  andi $v0, $v0, 0x3
L800203e4:
  lhu $v1, 40($s1)
L800203e8:
  addiu $v0, $v0, -2
L800203ec:
  addu $v1, $v1, $v0
L800203f0:
  jal 0x8008e590
L800203f4:
  sh $v1, 48($s1)
L800203f8:
  andi $v0, $v0, 0x3
L800203fc:
  lhu $v1, 42($s1)
L80020400:
  addiu $v0, $v0, -2
L80020404:
  addu $v1, $v1, $v0
L80020408:
  j L800208b0
L8002040c:
  sh $v1, 50($s1)
L80020410:
  lhu $v0, 712($gp)
L80020414:
  sll $zero, $zero, 0x0
L80020418:
  addiu $v0, $v0, -1
L8002041c:
  sh $v0, 712($gp)
L80020420:
  sll $v0, $v0, 0x10
L80020424:
  bgtz $v0, L800208b0
L80020428:
  andi $v0, $v1, 0x20
L8002042c:
  beq $v0, $zero, L80020440
L80020430:
  addiu $v0, $zero, 6
L80020434:
  sb $v0, 620($gp)
L80020438:
  j L800208b0
L8002043c:
  sll $zero, $zero, 0x0
L80020440:
  addiu $v0, $zero, 10
L80020444:
  sb $v0, 620($gp)
L80020448:
  j L800208b0
L8002044c:
  sll $zero, $zero, 0x0
L80020450:
  lbu $v1, 620($gp)
L80020454:
  sll $zero, $zero, 0x0
L80020458:
  andi $v0, $v1, 0x80
L8002045c:
  bne $v0, $zero, L80020610
L80020460:
  addiu $v0, $zero, 11
L80020464:
  ori $v0, $v1, 0x80
L80020468:
  sb $v0, 620($gp)
L8002046c:
  jal 0x8002c68c
L80020470:
  addiu $a0, $zero, 2
L80020474:
  addu $s0, $v0, $zero
L80020478:
  addiu $v0, $zero, 240
L8002047c:
  sh $v0, 0($s0)
L80020480:
  addiu $v0, $zero, 120
L80020484:
  sh $v0, 2($s0)
L80020488:
  lui $v0, 0x800f
L8002048c:
  lw $a0, -24848($v0)
L80020490:
  jal L8001efd4
L80020494:
  addu $a1, $zero, $zero
L80020498:
  addu $s2, $v0, $zero
L8002049c:
  lui $v0, 0x1062
L800204a0:
  ori $v0, $v0, 0x4dd3
L800204a4:
  mult $s2, $v0
L800204a8:
  sra $v1, $s2, 0x1f
L800204ac:
  mfhi $t0
L800204b0:
  sra $v0, $t0, 0x6
L800204b4:
  subu $v0, $v0, $v1
L800204b8:
  sh $v0, 26($s0)
L800204bc:
  sll $v0, $v0, 0x10
L800204c0:
  sra $v0, $v0, 0x10
L800204c4:
  slti $v0, $v0, 3
L800204c8:
  bne $v0, $zero, L800204d4
L800204cc:
  addiu $v0, $zero, 2
L800204d0:
  sh $v0, 26($s0)
L800204d4:
  lh $a0, 26($s0)
L800204d8:
  jal 0x8003fee0
L800204dc:
  addiu $a0, $a0, 16
L800204e0:
  lhu $v0, 26($s0)
L800204e4:
  sh $s2, 18($s0)
L800204e8:
  addiu $v0, $v0, 3
L800204ec:
  j L800208b0
L800204f0:
  sh $v0, 26($s0)
L800204f4:
  lui $v0, 0x800f
L800204f8:
  addiu $s0, $v0, -24848
L800204fc:
  lb $a0, 689($gp)
L80020500:
  lbu $v1, 620($gp)
L80020504:
  addiu $v0, $a0, 2
L80020508:
  sll $v0, $v0, 0x2
L8002050c:
  addu $v0, $v0, $s0
L80020510:
  lw $s1, 0($v0)
L80020514:
  andi $v0, $v1, 0x80
L80020518:
  bne $v0, $zero, L80020580
L8002051c:
  andi $v0, $v1, 0x40
L80020520:
  ori $v0, $v1, 0x80
L80020524:
  sb $v0, 620($gp)
L80020528:
  jal L8001944c
L8002052c:
  addu $a0, $s1, $zero
L80020530:
  jal 0x8003fee0
L80020534:
  addiu $a0, $zero, 27
L80020538:
  jal 0x8002c604
L8002053c:
  addiu $a0, $zero, 3
L80020540:
  lhu $v1, 48($s1)
L80020544:
  addu $s0, $v0, $zero
L80020548:
  sw $s0, 628($gp)
L8002054c:
  addiu $v1, $v1, 70
L80020550:
  sh $v1, 0($s0)
L80020554:
  lhu $v0, 50($s1)
L80020558:
  lh $v1, 802($gp)
L8002055c:
  addiu $v0, $v0, 98
L80020560:
  beq $v1, $zero, L80020570
L80020564:
  sh $v0, 2($s0)
L80020568:
  addiu $v0, $zero, 1
L8002056c:
  sh $v0, 26($s0)
L80020570:
  addiu $v0, $zero, 2
L80020574:
  sh $v0, 712($gp)
L80020578:
  j L800208b0
L8002057c:
  sll $zero, $zero, 0x0
L80020580:
  bne $v0, $zero, L800205e0
L80020584:
  sll $zero, $zero, 0x0
L80020588:
  lhu $v0, 712($gp)
L8002058c:
  sll $zero, $zero, 0x0
L80020590:
  addiu $v0, $v0, -1
L80020594:
  sh $v0, 712($gp)
L80020598:
  sll $v0, $v0, 0x10
L8002059c:
  bgtz $v0, L800208b0
L800205a0:
  ori $v0, $v1, 0x40
L800205a4:
  sb $v0, 620($gp)
L800205a8:
  jal 0x80029528
L800205ac:
  sll $zero, $zero, 0x0
L800205b0:
  lb $v1, 689($gp)
L800205b4:
  addiu $v0, $zero, 1
L800205b8:
  bne $v1, $v0, L800205d0
L800205bc:
  addiu $v0, $v1, 2
L800205c0:
  lh $v0, 802($gp)
L800205c4:
  sll $zero, $zero, 0x0
L800205c8:
  bne $v0, $zero, L800208b0
L800205cc:
  addiu $v0, $v1, 2
L800205d0:
  sll $v0, $v0, 0x2
L800205d4:
  addu $v0, $v0, $s0
L800205d8:
  j L800208b0
L800205dc:
  sw $zero, 0($v0)
L800205e0:
  lw $v0, 628($gp)
L800205e4:
  sll $zero, $zero, 0x0
L800205e8:
  lbu $v0, 28($v0)
L800205ec:
  sll $zero, $zero, 0x0
L800205f0:
  andi $v0, $v0, 0x80
L800205f4:
  bne $v0, $zero, L800208b0
L800205f8:
  addiu $v0, $zero, 6
L800205fc:
  lh $v1, 802($gp)
L80020600:
  sb $v0, 620($gp)
L80020604:
  beq $v1, $zero, L800208b0
L80020608:
  sll $zero, $zero, 0x0
L8002060c:
  addiu $v0, $zero, 11
L80020610:
  sb $v0, 620($gp)
L80020614:
  j L800208b0
L80020618:
  sll $zero, $zero, 0x0
L8002061c:
  lbu $a0, 620($gp)
L80020620:
  sll $zero, $zero, 0x0
L80020624:
  andi $v0, $a0, 0x80
L80020628:
  bne $v0, $zero, L800207c0
L8002062c:
  lui $s0, 0x800f
L80020630:
  addiu $s1, $s0, -24848
L80020634:
  lw $v1, 8($s1)
L80020638:
  ori $v0, $a0, 0x80
L8002063c:
  sb $v0, 620($gp)
L80020640:
  beq $v1, $zero, L800206b0
L80020644:
  sll $zero, $zero, 0x0
L80020648:
  lw $v0, -24848($s0)
L8002064c:
  sll $zero, $zero, 0x0
L80020650:
  lbu $a0, 106($v0)
L80020654:
  lbu $a1, 107($v0)
L80020658:
  jal 0x80024d34
L8002065c:
  sll $zero, $zero, 0x0
L80020660:
  lw $v0, -24848($s0)
L80020664:
  sll $zero, $zero, 0x0
L80020668:
  lbu $v0, 106($v0)
L8002066c:
  sll $zero, $zero, 0x0
L80020670:
  sll $v1, $v0, 0x3
L80020674:
  subu $v1, $v1, $v0
L80020678:
  sll $v1, $v1, 0x2
L8002067c:
  lui $v0, 0x801a
L80020680:
  addiu $v0, $v0, 31448
L80020684:
  addu $s0, $v1, $v0
L80020688:
  lhu $v1, 624($gp)
L8002068c:
  lw $a0, 0($s0)
L80020690:
  lhu $v0, 22($s0)
L80020694:
  andi $v1, $v1, 0xa00
L80020698:
  ori $v1, $v1, 0x4000
L8002069c:
  or $v0, $v0, $v1
L800206a0:
  sh $v0, 22($s0)
L800206a4:
  lhu $v0, 616($gp)
L800206a8:
  jal 0x80018080
L800206ac:
  sh $v0, 18($s0)
L800206b0:
  lw $v0, 12($s1)
L800206b4:
  sll $zero, $zero, 0x0
L800206b8:
  beq $v0, $zero, L80020750
L800206bc:
  sll $zero, $zero, 0x0
L800206c0:
  lw $v0, 4($s1)
L800206c4:
  sll $zero, $zero, 0x0
L800206c8:
  beq $v0, $zero, L80020754
L800206cc:
  lui $s0, 0x800f
L800206d0:
  lbu $a0, 106($v0)
L800206d4:
  lbu $a1, 107($v0)
L800206d8:
  jal 0x80024d34
L800206dc:
  sll $zero, $zero, 0x0
L800206e0:
  lw $v0, 4($s1)
L800206e4:
  sll $zero, $zero, 0x0
L800206e8:
  lbu $v0, 106($v0)
L800206ec:
  sll $zero, $zero, 0x0
L800206f0:
  sll $v1, $v0, 0x3
L800206f4:
  subu $v1, $v1, $v0
L800206f8:
  sll $v1, $v1, 0x2
L800206fc:
  lui $v0, 0x801a
L80020700:
  addiu $v0, $v0, 31448
L80020704:
  addu $s0, $v1, $v0
L80020708:
  lhu $v0, 626($gp)
L8002070c:
  lhu $v1, 22($s0)
L80020710:
  andi $v0, $v0, 0xa00
L80020714:
  or $v1, $v1, $v0
L80020718:
  sh $v1, 22($s0)
L8002071c:
  lhu $v0, 618($gp)
L80020720:
  lh $v1, 802($gp)
L80020724:
  sll $zero, $zero, 0x0
L80020728:
  beq $v1, $zero, L80020744
L8002072c:
  sh $v0, 18($s0)
L80020730:
  lhu $v0, 626($gp)
L80020734:
  lhu $v1, 22($s0)
L80020738:
  andi $v0, $v0, 0x3000
L8002073c:
  or $v1, $v1, $v0
L80020740:
  sh $v1, 22($s0)
L80020744:
  lw $a0, 0($s0)
L80020748:
  jal 0x80018080
L8002074c:
  sll $zero, $zero, 0x0
L80020750:
  lui $s0, 0x800f
L80020754:
  lw $a0, -24848($s0)
L80020758:
  jal 0x8004036c
L8002075c:
  addiu $s0, $s0, -24848
L80020760:
  lw $a0, 4($s0)
L80020764:
  jal 0x8004036c
L80020768:
  sll $zero, $zero, 0x0
L8002076c:
  addiu $v0, $zero, 12
L80020770:
  addiu $a2, $zero, 16
L80020774:
  addiu $a1, $zero, 1
L80020778:
  lw $s1, 780($gp)
L8002077c:
  lui $v1, 0x8002
L80020780:
  sh $v0, 40($s1)
L80020784:
  lhu $v0, 50($s1)
L80020788:
  addiu $v1, $v1, -4832
L8002078c:
  sh $a2, 44($s1)
L80020790:
  sb $a1, 108($s1)
L80020794:
  sw $v1, 36($s1)
L80020798:
  sh $v0, 42($s1)
L8002079c:
  lw $s1, 788($gp)
L800207a0:
  sll $zero, $zero, 0x0
L800207a4:
  lhu $a0, 50($s1)
L800207a8:
  addiu $v0, $zero, 280
L800207ac:
  sh $v0, 40($s1)
L800207b0:
  sh $a2, 44($s1)
L800207b4:
  sb $a1, 108($s1)
L800207b8:
  sw $v1, 36($s1)
L800207bc:
  sh $a0, 42($s1)
L800207c0:
  lbu $v0, 620($gp)
L800207c4:
  sll $zero, $zero, 0x0
L800207c8:
  andi $v0, $v0, 0x40
L800207cc:
  bne $v0, $zero, L800208ac
L800207d0:
  addiu $v0, $zero, 5
L800207d4:
  lui $v0, 0x800f
L800207d8:
  addiu $s0, $v0, -24848
L800207dc:
  lw $s1, 8($s0)
L800207e0:
  sll $zero, $zero, 0x0
L800207e4:
  beq $s1, $zero, L80020824
L800207e8:
  sll $zero, $zero, 0x0
L800207ec:
  lbu $s2, 12($s1)
L800207f0:
  sll $zero, $zero, 0x0
L800207f4:
  addiu $s2, $s2, -8
L800207f8:
  bgtz $s2, L80020810
L800207fc:
  sll $zero, $zero, 0x0
L80020800:
  jal 0x80029528
L80020804:
  addu $a0, $zero, $zero
L80020808:
  j L8002081c
L8002080c:
  sw $zero, 8($s0)
L80020810:
  sb $s2, 14($s1)
L80020814:
  sb $s2, 13($s1)
L80020818:
  sb $s2, 12($s1)
L8002081c:
  lui $v0, 0x800f
L80020820:
  addiu $s0, $v0, -24848
L80020824:
  lw $s1, 12($s0)
L80020828:
  sll $zero, $zero, 0x0
L8002082c:
  beq $s1, $zero, L80020868
L80020830:
  lui $v0, 0x800f
L80020834:
  lbu $s2, 12($s1)
L80020838:
  sll $zero, $zero, 0x0
L8002083c:
  addiu $s2, $s2, -8
L80020840:
  bgtz $s2, L80020858
L80020844:
  sll $zero, $zero, 0x0
L80020848:
  jal 0x80029528
L8002084c:
  addiu $a0, $zero, 1
L80020850:
  j L80020864
L80020854:
  sw $zero, 12($s0)
L80020858:
  sb $s2, 14($s1)
L8002085c:
  sb $s2, 13($s1)
L80020860:
  sb $s2, 12($s1)
L80020864:
  lui $v0, 0x800f
L80020868:
  addiu $v1, $v0, -24848
L8002086c:
  lw $v0, 8($v1)
L80020870:
  sll $zero, $zero, 0x0
L80020874:
  bne $v0, $zero, L800208b0
L80020878:
  sll $zero, $zero, 0x0
L8002087c:
  lw $v0, 12($v1)
L80020880:
  sll $zero, $zero, 0x0
L80020884:
  bne $v0, $zero, L800208b0
L80020888:
  sll $zero, $zero, 0x0
L8002088c:
  lbu $v0, 620($gp)
L80020890:
  sll $zero, $zero, 0x0
L80020894:
  ori $v0, $v0, 0x40
L80020898:
  sb $v0, 620($gp)
L8002089c:
  jal 0x80015c0c
L800208a0:
  sll $zero, $zero, 0x0
L800208a4:
  j L800208b0
L800208a8:
  sll $zero, $zero, 0x0
L800208ac:
  sh $v0, 818($gp)
L800208b0:
  lw $ra, 40($sp)
L800208b4:
  lw $s5, 36($sp)
L800208b8:
  lw $s4, 32($sp)
L800208bc:
  lw $s3, 28($sp)
L800208c0:
  lw $s2, 24($sp)
L800208c4:
  lw $s1, 20($sp)
L800208c8:
  lw $s0, 16($sp)
L800208cc:
  jr $ra
L800208d0:
  addiu $sp, $sp, 48
