.set noreorder
.set noat

.section .text.boot_scene_animation_helpers,"ax",@progbits
.align 2
.global boot_scene_animation_helpers

boot_scene_animation_helpers:
L8001755c:
  addiu $sp, $sp, -24
L80017560:
  sw $ra, 16($sp)
L80017564:
  jal 0x800530c4
L80017568:
  sll $zero, $zero, 0x0
L8001756c:
  jal 0x800533d8
L80017570:
  sll $zero, $zero, 0x0
L80017574:
  lui $a2, 0x6
L80017578:
  ori $a2, $a2, 0x3000
L8001757c:
  addiu $a0, $zero, 2
L80017580:
  lui $a1, 0x8001
L80017584:
  lw $a1, 0($a1)
L80017588:
  jal 0x80056250
L8001758c:
  addiu $a3, $zero, 4
L80017590:
  lw $ra, 16($sp)
L80017594:
  sll $zero, $zero, 0x0
L80017598:
  jr $ra
L8001759c:
  addiu $sp, $sp, 24
L800175a0:
  addiu $sp, $sp, -8
L800175a4:
  lui $v0, 0x800f
L800175a8:
  lui $v1, 0x800a
L800175ac:
  lb $v1, -19615($v1)
L800175b0:
  sll $zero, $zero, 0x0
L800175b4:
  bgez $v1, L800175d0
L800175b8:
  addiu $a2, $v0, -24592
L800175bc:
  lhu $v0, 812($gp)
L800175c0:
  lhu $v1, 814($gp)
L800175c4:
  sh $v0, 0($sp)
L800175c8:
  j L800175dc
L800175cc:
  sh $v1, 2($sp)
L800175d0:
  addiu $v0, $zero, 8000
L800175d4:
  sh $v0, 2($sp)
L800175d8:
  sh $v0, 0($sp)
L800175dc:
  addu $t0, $zero, $zero
L800175e0:
  addiu $t1, $zero, -1
L800175e4:
  addiu $a0, $a2, 31
L800175e8:
  addu $a3, $sp, $zero
L800175ec:
  addiu $v1, $zero, 4
L800175f0:
  addu $v0, $a2, $v1
L800175f4:
  sb $t1, 26($v0)
L800175f8:
  addiu $v1, $v1, -1
L800175fc:
  bgez $v1, L800175f4
L80017600:
  addiu $v0, $v0, -1
L80017604:
  addu $a1, $a2, $zero
L80017608:
  sb $zero, -7($a0)
L8001760c:
  lhu $v0, 0($a3)
L80017610:
  addu $v1, $zero, $zero
L80017614:
  sh $zero, -13($a0)
L80017618:
  sb $zero, -6($a0)
L8001761c:
  sb $zero, 0($a0)
L80017620:
  sh $v0, -11($a0)
L80017624:
  sh $v0, -9($a0)
L80017628:
  sb $zero, 0($a1)
L8001762c:
  addiu $v1, $v1, 1
L80017630:
  sltiu $v0, $v1, 13
L80017634:
  bne $v0, $zero, L80017628
L80017638:
  addiu $a1, $a1, 1
L8001763c:
  addiu $a3, $a3, 2
L80017640:
  addiu $t0, $t0, 1
L80017644:
  addiu $a0, $a0, 32
L80017648:
  slti $v0, $t0, 2
L8001764c:
  bne $v0, $zero, L800175ec
L80017650:
  addiu $a2, $a2, 32
L80017654:
  lui $v0, 0x800a
L80017658:
  lb $v0, -19616($v0)
L8001765c:
  sll $zero, $zero, 0x0
L80017660:
  bgez $v0, L80017694
L80017664:
  sll $zero, $zero, 0x0
L80017668:
  lui $v0, 0x800a
L8001766c:
  lb $v0, -19615($v0)
L80017670:
  sll $zero, $zero, 0x0
L80017674:
  bgez $v0, L800176a8
L80017678:
  lui $v1, 0x800f
L8001767c:
  lui $v0, 0x800f
L80017680:
  lbu $v1, 808($gp)
L80017684:
  addiu $v0, $v0, -24592
L80017688:
  sb $v1, 63($v0)
L8001768c:
  j L800176b0
L80017690:
  sb $v1, 31($v0)
L80017694:
  lui $v0, 0x800a
L80017698:
  lb $v0, -19615($v0)
L8001769c:
  sll $zero, $zero, 0x0
L800176a0:
  bltz $v0, L800176b0
L800176a4:
  lui $v1, 0x800f
L800176a8:
  addiu $v0, $zero, -1
L800176ac:
  sb $v0, -24529($v1)
L800176b0:
  lui $v0, 0x800f
L800176b4:
  lbu $v1, 717($gp)
L800176b8:
  addiu $v0, $v0, -24592
L800176bc:
  sll $v1, $v1, 0x5
L800176c0:
  addu $v1, $v1, $v0
L800176c4:
  sw $v1, 704($gp)
L800176c8:
  jr $ra
L800176cc:
  addiu $sp, $sp, 8
L800176d0:
  lui $v0, 0x800f
L800176d4:
  addiu $a0, $v0, -24528
L800176d8:
  addu $a1, $zero, $zero
L800176dc:
  addiu $v1, $a0, 9
L800176e0:
  sw $zero, -5($v1)
L800176e4:
  sw $zero, 0($a0)
L800176e8:
  sb $zero, 0($v1)
L800176ec:
  addiu $v1, $v1, 12
L800176f0:
  addiu $a1, $a1, 1
L800176f4:
  slti $v0, $a1, 5
L800176f8:
  bne $v0, $zero, L800176e0
L800176fc:
  addiu $a0, $a0, 12
L80017700:
  jr $ra
L80017704:
  sll $zero, $zero, 0x0
L80017708:
  addu $a3, $zero, $zero
L8001770c:
  lui $v0, 0x800f
L80017710:
  addiu $t2, $v0, -24816
L80017714:
  addiu $t0, $zero, 1
L80017718:
  addiu $t1, $zero, 3
L8001771c:
  addu $a2, $a3, $zero
L80017720:
  addu $a1, $a2, $t2
L80017724:
  addu $a0, $zero, $zero
L80017728:
  addiu $v1, $a1, 20
L8001772c:
  sw $zero, 0($a1)
L80017730:
  sw $zero, -16($v1)
L80017734:
  sw $zero, -12($v1)
L80017738:
  sb $zero, 4($v1)
L8001773c:
  sb $t0, -1($v1)
L80017740:
  beq $a0, $t1, L80017750
L80017744:
  sb $a0, 3($v1)
L80017748:
  j L80017754
L8001774c:
  sb $a0, 0($v1)
L80017750:
  sb $t0, 0($v1)
L80017754:
  addiu $v1, $v1, 28
L80017758:
  addiu $a0, $a0, 1
L8001775c:
  slti $v0, $a0, 4
L80017760:
  bne $v0, $zero, L8001772c
L80017764:
  addiu $a1, $a1, 28
L80017768:
  addiu $a3, $a3, 1
L8001776c:
  slti $v0, $a3, 2
L80017770:
  bne $v0, $zero, L80017720
L80017774:
  addiu $a2, $a2, 112
L80017778:
  lui $v0, 0x800f
L8001777c:
  addiu $v0, $v0, -24816
L80017780:
  sb $zero, 19($v0)
L80017784:
  jr $ra
L80017788:
  sb $zero, 131($v0)
L8001778c:
  lui $v0, 0x801a
L80017790:
  addiu $a0, $v0, 31448
L80017794:
  addu $a1, $zero, $zero
L80017798:
  addiu $v1, $a0, 22
L8001779c:
  sw $zero, 0($a0)
L800177a0:
  sw $zero, -18($v1)
L800177a4:
  sh $zero, 0($v1)
L800177a8:
  addiu $v1, $v1, 28
L800177ac:
  addiu $a1, $a1, 1
L800177b0:
  slti $v0, $a1, 30
L800177b4:
  bne $v0, $zero, L8001779c
L800177b8:
  addiu $a0, $a0, 28
L800177bc:
  jr $ra
L800177c0:
  sll $zero, $zero, 0x0
L800177c4:
  lui $v0, 0x800f
L800177c8:
  lh $a0, 10326($v0)
L800177cc:
  addiu $sp, $sp, -32
L800177d0:
  sw $ra, 24($sp)
L800177d4:
  jal 0x800878d0
L800177d8:
  sll $zero, $zero, 0x0
L800177dc:
  addiu $a0, $zero, 160
L800177e0:
  jal 0x800878b0
L800177e4:
  addiu $a1, $zero, 108
L800177e8:
  lui $a0, 0x8010
L800177ec:
  jal 0x800855d0
L800177f0:
  addiu $a0, $a0, -7864
L800177f4:
  lui $t0, 0x1f80
L800177f8:
  ori $t0, $t0, 0x3e0
L800177fc:
  addu $a2, $zero, $zero
L80017800:
  addiu $t1, $sp, 16
L80017804:
  lui $v0, 0x800f
L80017808:
  addiu $a1, $v0, -24464
L8001780c:
  lui $v0, 0x8009
L80017810:
  addiu $a3, $v0, 2208
L80017814:
  lhu $v0, 0($a3)
L80017818:
  sh $zero, 2($t0)
L8001781c:
  sh $v0, 0($t0)
L80017820:
  lhu $v0, 2($a3)
L80017824:
  sll $zero, $zero, 0x0
L80017828:
  sh $v0, 4($t0)
L8001782c:
  .word 0xc9000000
L80017830:
  .word 0xc9010004
L80017834:
  sll $zero, $zero, 0x0
L80017838:
  sll $zero, $zero, 0x0
L8001783c:
  .word 0x4a180001
L80017840:
  .word 0xe92e0000
L80017844:
  lhu $v0, 16($sp)
L80017848:
  sll $zero, $zero, 0x0
L8001784c:
  addiu $v0, $v0, -26
L80017850:
  sh $v0, 0($a1)
L80017854:
  lh $a0, 18($sp)
L80017858:
  lbu $v1, 717($gp)
L8001785c:
  addiu $v0, $a0, -30
L80017860:
  beq $v1, $zero, L8001787c
L80017864:
  sh $v0, 2($a1)
L80017868:
  slti $v0, $a2, 15
L8001786c:
  beq $v0, $zero, L8001788c
L80017870:
  addiu $v0, $a0, -29
L80017874:
  j L8001788c
L80017878:
  sh $v0, 2($a1)
L8001787c:
  slti $v0, $a2, 15
L80017880:
  bne $v0, $zero, L8001788c
L80017884:
  addiu $v0, $a0, -29
L80017888:
  sh $v0, 2($a1)
L8001788c:
  addiu $a1, $a1, 4
L80017890:
  addiu $a2, $a2, 1
L80017894:
  slti $v0, $a2, 30
L80017898:
  bne $v0, $zero, L80017814
L8001789c:
  addiu $a3, $a3, 4
L800178a0:
  addu $a0, $zero, $zero
L800178a4:
  jal 0x800878b0
L800178a8:
  addu $a1, $a0, $zero
L800178ac:
  lw $ra, 24($sp)
L800178b0:
  sll $zero, $zero, 0x0
L800178b4:
  jr $ra
L800178b8:
  addiu $sp, $sp, 32
L800178bc:
  addiu $sp, $sp, -40
L800178c0:
  sw $ra, 32($sp)
L800178c4:
  sw $s1, 28($sp)
L800178c8:
  jal 0x80017130
L800178cc:
  sw $s0, 24($sp)
L800178d0:
  lui $s1, 0x800f
L800178d4:
  addiu $s0, $s1, 10312
L800178d8:
  lh $a0, 14($s0)
L800178dc:
  jal 0x800878d0
L800178e0:
  sll $zero, $zero, 0x0
L800178e4:
  addiu $a0, $zero, 160
L800178e8:
  jal 0x800878b0
L800178ec:
  addiu $a1, $zero, 108
L800178f0:
  lhu $v1, 24($gp)
L800178f4:
  addiu $v0, $zero, 334
L800178f8:
  sh $v0, 10312($s1)
L800178fc:
  addiu $v0, $zero, 1022
L80017900:
  sh $v0, 4($s0)
L80017904:
  jal 0x8001352c
L80017908:
  sh $v1, 2($s0)
L8001790c:
  lui $a0, 0x8010
L80017910:
  jal 0x800855d0
L80017914:
  addiu $a0, $a0, -7864
L80017918:
  lui $v0, 0x1f80
L8001791c:
  ori $v0, $v0, 0x3e0
L80017920:
  addiu $v1, $zero, 1000
L80017924:
  sh $v1, 0($v0)
L80017928:
  sh $zero, 2($v0)
L8001792c:
  sh $v1, 4($v0)
L80017930:
  .word 0xc8400000
L80017934:
  .word 0xc8410004
L80017938:
  sll $zero, $zero, 0x0
L8001793c:
  sll $zero, $zero, 0x0
L80017940:
  .word 0x4a180001
L80017944:
  addiu $v0, $sp, 16
L80017948:
  .word 0xe84e0000
L8001794c:
  addu $a0, $zero, $zero
L80017950:
  lhu $v0, 16($sp)
L80017954:
  lh $v1, 18($sp)
L80017958:
  addiu $v0, $v0, -160
L8001795c:
  addiu $v1, $v1, -108
L80017960:
  sh $v0, 760($gp)
L80017964:
  sh $v1, 762($gp)
L80017968:
  jal 0x800878b0
L8001796c:
  addu $a1, $a0, $zero
L80017970:
  jal 0x80017130
L80017974:
  sll $zero, $zero, 0x0
L80017978:
  lw $ra, 32($sp)
L8001797c:
  lw $s1, 28($sp)
L80017980:
  lw $s0, 24($sp)
L80017984:
  jr $ra
L80017988:
  addiu $sp, $sp, 40
L8001798c:
  addiu $sp, $sp, -40
L80017990:
  lui $v0, 0x8001
L80017994:
  addiu $v0, $v0, 29096
L80017998:
  addu $a0, $zero, $zero
L8001799c:
  addu $a1, $a0, $zero
L800179a0:
  lui $v1, 0x800a
L800179a4:
  lbu $v1, -19612($v1)
L800179a8:
  addiu $a3, $zero, 235
L800179ac:
  sw $ra, 32($sp)
L800179b0:
  sw $v0, 16($sp)
L800179b4:
  sw $zero, 20($sp)
L800179b8:
  sw $zero, 24($sp)
L800179bc:
  sll $a2, $v1, 0x4
L800179c0:
  subu $a2, $a2, $v1
L800179c4:
  sll $a2, $a2, 0x2
L800179c8:
  subu $a2, $a2, $v1
L800179cc:
  sll $a2, $a2, 0x2
L800179d0:
  subu $a2, $a2, $v1
L800179d4:
  jal 0x80014e1c
L800179d8:
  addiu $a2, $a2, 5830
L800179dc:
  jal 0x800137e4
L800179e0:
  sll $zero, $zero, 0x0
L800179e4:
  lw $ra, 32($sp)
L800179e8:
  sll $zero, $zero, 0x0
L800179ec:
  jr $ra
L800179f0:
  addiu $sp, $sp, 40
L800179f4:
  addiu $sp, $sp, -48
L800179f8:
  sw $ra, 44($sp)
L800179fc:
  sw $s2, 40($sp)
L80017a00:
  sw $s1, 36($sp)
L80017a04:
  jal 0x8004763c
L80017a08:
  sw $s0, 32($sp)
L80017a0c:
  jal 0x80047ad0
L80017a10:
  addiu $a0, $zero, 1
L80017a14:
  jal 0x80012d84
L80017a18:
  addiu $a0, $zero, 4
L80017a1c:
  jal 0x800137e4
L80017a20:
  addiu $s0, $zero, 1
L80017a24:
  addu $a0, $zero, $zero
L80017a28:
  addu $a1, $a0, $zero
L80017a2c:
  addiu $a3, $zero, 235
L80017a30:
  lui $v0, 0x8001
L80017a34:
  lui $v1, 0x800a
L80017a38:
  lbu $v1, -19612($v1)
L80017a3c:
  addiu $v0, $v0, 29096
L80017a40:
  sw $v0, 16($sp)
L80017a44:
  sw $zero, 20($sp)
L80017a48:
  sw $zero, 24($sp)
L80017a4c:
  sll $a2, $v1, 0x4
L80017a50:
  subu $a2, $a2, $v1
L80017a54:
  sll $a2, $a2, 0x2
L80017a58:
  subu $a2, $a2, $v1
L80017a5c:
  sll $a2, $a2, 0x2
L80017a60:
  subu $a2, $a2, $v1
L80017a64:
  jal 0x80014e1c
L80017a68:
  addiu $a2, $a2, 5830
L80017a6c:
  jal 0x800137e4
L80017a70:
  sll $zero, $zero, 0x0
L80017a74:
  addiu $v0, $zero, -1
L80017a78:
  sb $v0, 816($gp)
L80017a7c:
  addiu $v0, $zero, 11
L80017a80:
  sh $v0, 818($gp)
L80017a84:
  lui $v0, 0x800a
L80017a88:
  lbu $v0, -19607($v0)
L80017a8c:
  sb $zero, 604($gp)
L80017a90:
  sh $zero, 602($gp)
L80017a94:
  sb $zero, 716($gp)
L80017a98:
  sh $zero, 764($gp)
L80017a9c:
  sh $zero, 792($gp)
L80017aa0:
  sh $zero, 612($gp)
L80017aa4:
  sb $zero, 620($gp)
L80017aa8:
  beq $v0, $s0, L80017b24
L80017aac:
  lui $v0, 0x800f
L80017ab0:
  lui $v0, 0x800a
L80017ab4:
  lb $v0, -19615($v0)
L80017ab8:
  sll $zero, $zero, 0x0
L80017abc:
  bltz $v0, L80017af0
L80017ac0:
  sllv $a2, $v0, $s0
L80017ac4:
  addu $a0, $zero, $zero
L80017ac8:
  addu $a1, $a0, $zero
L80017acc:
  addu $a2, $a2, $v0
L80017ad0:
  addiu $a2, $a2, 7475
L80017ad4:
  addiu $a3, $zero, 3
L80017ad8:
  lui $v0, 0x8018
L80017adc:
  addiu $v0, $v0, -32296
L80017ae0:
  sw $zero, 16($sp)
L80017ae4:
  sw $zero, 20($sp)
L80017ae8:
  jal 0x80014e1c
L80017aec:
  sw $v0, 24($sp)
L80017af0:
  sb $zero, 717($gp)
L80017af4:
  sh $s0, 818($gp)
L80017af8:
  jal L8001778c
L80017afc:
  sll $zero, $zero, 0x0
L80017b00:
  jal L80017708
L80017b04:
  sll $zero, $zero, 0x0
L80017b08:
  jal L800175a0
L80017b0c:
  sll $zero, $zero, 0x0
L80017b10:
  lhu $v0, 612($gp)
L80017b14:
  sll $zero, $zero, 0x0
L80017b18:
  ori $v0, $v0, 0x1000
L80017b1c:
  sh $v0, 612($gp)
L80017b20:
  lui $v0, 0x800f
L80017b24:
  lbu $v1, 717($gp)
L80017b28:
  addiu $v0, $v0, -24592
L80017b2c:
  sll $v1, $v1, 0x5
L80017b30:
  addu $v1, $v1, $v0
L80017b34:
  sw $v1, 704($gp)
L80017b38:
  jal L800178bc
L80017b3c:
  lui $s0, 0x800f
L80017b40:
  lbu $v0, 717($gp)
L80017b44:
  lui $v1, 0x800f
L80017b48:
  sll $v0, $v0, 0xb
L80017b4c:
  addiu $v0, $v0, 1024
L80017b50:
  jal 0x8001352c
L80017b54:
  sh $v0, 10314($v1)
L80017b58:
  jal L800176d0
L80017b5c:
  addiu $s0, $s0, -24344
L80017b60:
  jal 0x8002c598
L80017b64:
  addiu $s1, $zero, 256
L80017b68:
  jal 0x80029574
L80017b6c:
  addu $a0, $zero, $zero
L80017b70:
  addiu $a0, $zero, 1
L80017b74:
  addiu $v0, $zero, 255
L80017b78:
  sh $zero, 40($s0)
L80017b7c:
  sh $s1, 42($s0)
L80017b80:
  sh $zero, 44($s0)
L80017b84:
  jal 0x80029574
L80017b88:
  sh $v0, 46($s0)
L80017b8c:
  addu $a0, $zero, $zero
L80017b90:
  addiu $v0, $zero, 64
L80017b94:
  sh $v0, 104($s0)
L80017b98:
  addiu $v0, $zero, 254
L80017b9c:
  sh $s1, 106($s0)
L80017ba0:
  sh $zero, 108($s0)
L80017ba4:
  jal 0x80035668
L80017ba8:
  sh $v0, 110($s0)
L80017bac:
  jal L8001755c
L80017bb0:
  addiu $s1, $zero, 11
L80017bb4:
  jal 0x800137e4
L80017bb8:
  sll $zero, $zero, 0x0
L80017bbc:
  lbu $v1, 717($gp)
L80017bc0:
  sll $zero, $zero, 0x0
L80017bc4:
  sll $v0, $v1, 0x2
L80017bc8:
  addu $v0, $v0, $v1
L80017bcc:
  sll $v0, $v0, 0x2
L80017bd0:
  lui $v1, 0x8009
L80017bd4:
  addiu $v1, $v1, 2008
L80017bd8:
  addu $v0, $v0, $v1
L80017bdc:
  sw $v0, 804($gp)
L80017be0:
  jal 0x8004002c
L80017be4:
  sll $zero, $zero, 0x0
L80017be8:
  addu $a0, $v0, $zero
L80017bec:
  jal 0x800400ac
L80017bf0:
  addiu $a1, $zero, 2
L80017bf4:
  addu $s2, $v0, $zero
L80017bf8:
  addu $a0, $s2, $zero
L80017bfc:
  addiu $a1, $zero, 12
L80017c00:
  addiu $a2, $zero, 24
L80017c04:
  addiu $a3, $zero, 4
L80017c08:
  addiu $v0, $zero, 2
L80017c0c:
  lui $v1, 0x800a
L80017c10:
  lbu $v1, -19612($v1)
L80017c14:
  sw $v0, 16($sp)
L80017c18:
  addiu $v0, $zero, 732
L80017c1c:
  sw $s1, 24($sp)
L80017c20:
  sw $v0, 28($sp)
L80017c24:
  jal 0x800404cc
L80017c28:
  sw $v1, 20($sp)
L80017c2c:
  jal 0x80042918
L80017c30:
  addu $a0, $s2, $zero
L80017c34:
  lhu $v0, 8($s2)
L80017c38:
  sll $zero, $zero, 0x0
L80017c3c:
  ori $v0, $v0, 0x8
L80017c40:
  sh $v0, 8($s2)
L80017c44:
  lui $s0, 0x800a
L80017c48:
  lb $s0, -19615($s0)
L80017c4c:
  sw $s2, 780($gp)
L80017c50:
  jal 0x8004002c
L80017c54:
  srl $s0, $s0, 0x1f
L80017c58:
  addu $a0, $v0, $zero
L80017c5c:
  jal 0x800400ac
L80017c60:
  addiu $a1, $zero, 2
L80017c64:
  addu $s2, $v0, $zero
L80017c68:
  addu $a0, $s2, $zero
L80017c6c:
  addiu $a1, $zero, 280
L80017c70:
  addiu $a2, $zero, 32
L80017c74:
  addiu $a3, $zero, 4
L80017c78:
  addiu $v0, $zero, 748
L80017c7c:
  sw $s0, 16($sp)
L80017c80:
  sw $zero, 20($sp)
L80017c84:
  sw $s1, 24($sp)
L80017c88:
  jal 0x800404cc
L80017c8c:
  sw $v0, 28($sp)
L80017c90:
  jal 0x80042918
L80017c94:
  addu $a0, $s2, $zero
L80017c98:
  lhu $v0, 8($s2)
L80017c9c:
  sll $zero, $zero, 0x0
L80017ca0:
  ori $v0, $v0, 0x8
L80017ca4:
  sh $v0, 8($s2)
L80017ca8:
  lbu $v0, 717($gp)
L80017cac:
  sll $zero, $zero, 0x0
L80017cb0:
  beq $v0, $zero, L80017cc8
L80017cb4:
  sll $zero, $zero, 0x0
L80017cb8:
  lhu $v0, 64($s2)
L80017cbc:
  sll $zero, $zero, 0x0
L80017cc0:
  addiu $v0, $v0, 16
L80017cc4:
  sh $v0, 64($s2)
L80017cc8:
  sw $s2, 788($gp)
L80017ccc:
  jal 0x8004002c
L80017cd0:
  sll $zero, $zero, 0x0
L80017cd4:
  addu $a0, $v0, $zero
L80017cd8:
  jal 0x800400ac
L80017cdc:
  addiu $a1, $zero, 6
L80017ce0:
  addu $s2, $v0, $zero
L80017ce4:
  jal 0x80042918
L80017ce8:
  addu $a0, $s2, $zero
L80017cec:
  addu $a0, $s2, $zero
L80017cf0:
  jal 0x800428ec
L80017cf4:
  addiu $a1, $zero, 1
L80017cf8:
  lui $v0, 0x8001
L80017cfc:
  addiu $v0, $v0, 28272
L80017d00:
  sw $v0, 76($s2)
L80017d04:
  lui $v0, 0x8001
L80017d08:
  lw $v1, 788($gp)
L80017d0c:
  addiu $v0, $v0, 25852
L80017d10:
  sw $v1, 80($s2)
L80017d14:
  lui $v1, 0x800f
L80017d18:
  sw $v0, -25156($v1)
L80017d1c:
  lui $v1, 0x800a
L80017d20:
  lbu $v1, -19607($v1)
L80017d24:
  addiu $v0, $zero, 1
L80017d28:
  beq $v1, $v0, L80017d9c
L80017d2c:
  sll $zero, $zero, 0x0
L80017d30:
  lui $v0, 0x800a
L80017d34:
  addiu $v0, $v0, -19615
L80017d38:
  lb $v0, -1($v0)
L80017d3c:
  sw $zero, 724($gp)
L80017d40:
  sw $zero, 720($gp)
L80017d44:
  bgez $v0, L80017d90
L80017d48:
  addu $a0, $zero, $zero
L80017d4c:
  lui $v1, 0x800a
L80017d50:
  lb $v1, -19615($v1)
L80017d54:
  sll $zero, $zero, 0x0
L80017d58:
  bgez $v1, L80017d7c
L80017d5c:
  lui $v0, 0x801d
L80017d60:
  lui $a0, 0x801d
L80017d64:
  addiu $a0, $a0, 4608
L80017d68:
  addiu $a1, $a0, 4096
L80017d6c:
  sw $a0, 720($gp)
L80017d70:
  sw $a1, 724($gp)
L80017d74:
  j L80017d94
L80017d78:
  sll $zero, $zero, 0x0
L80017d7c:
  addiu $a0, $v0, 512
L80017d80:
  sw $a0, 720($gp)
L80017d84:
  slti $v0, $v1, 39
L80017d88:
  bne $v0, $zero, L80017d94
L80017d8c:
  addu $a1, $zero, $zero
L80017d90:
  addu $a1, $a0, $zero
L80017d94:
  jal 0x800245a0
L80017d98:
  sll $zero, $zero, 0x0
L80017d9c:
  lw $ra, 44($sp)
L80017da0:
  lw $s2, 40($sp)
L80017da4:
  lw $s1, 36($sp)
L80017da8:
  lw $s0, 32($sp)
L80017dac:
  jr $ra
L80017db0:
  addiu $sp, $sp, 48
