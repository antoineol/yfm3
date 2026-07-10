.set noreorder
.set noat

.section .text.boot_object_runtime_helpers,"ax",@progbits
.align 2
.global boot_object_runtime_helpers

boot_object_runtime_helpers:
L80017db4:
  lbu $v0, 106($a0)
L80017db8:
  sll $zero, $zero, 0x0
L80017dbc:
  sll $v1, $v0, 0x3
L80017dc0:
  subu $v1, $v1, $v0
L80017dc4:
  sll $v1, $v1, 0x2
L80017dc8:
  lui $v0, 0x801a
L80017dcc:
  addiu $v0, $v0, 31448
L80017dd0:
  addu $a1, $v1, $v0
L80017dd4:
  lw $v0, 20($a1)
L80017dd8:
  lui $v1, 0xa000
L80017ddc:
  and $v0, $v0, $v1
L80017de0:
  bne $v0, $v1, L80017e34
L80017de4:
  sll $zero, $zero, 0x0
L80017de8:
  lw $v0, 704($gp)
L80017dec:
  sll $zero, $zero, 0x0
L80017df0:
  lb $v0, 31($v0)
L80017df4:
  sll $zero, $zero, 0x0
L80017df8:
  beq $v0, $zero, L80017e34
L80017dfc:
  sll $zero, $zero, 0x0
L80017e00:
  lw $v0, 4($a1)
L80017e04:
  sll $zero, $zero, 0x0
L80017e08:
  lbu $v0, 4($v0)
L80017e0c:
  sll $zero, $zero, 0x0
L80017e10:
  addiu $v0, $v0, 1
L80017e14:
  sb $v0, 103($a0)
L80017e18:
  lw $v0, 704($gp)
L80017e1c:
  sll $zero, $zero, 0x0
L80017e20:
  lb $v0, 31($v0)
L80017e24:
  sll $zero, $zero, 0x0
L80017e28:
  bgez $v0, L80017e34
L80017e2c:
  addiu $v0, $zero, 255
L80017e30:
  sb $v0, 103($a0)
L80017e34:
  jr $ra
L80017e38:
  sll $zero, $zero, 0x0
L80017e3c:
  lbu $v0, 106($a0)
L80017e40:
  sll $zero, $zero, 0x0
L80017e44:
  sll $v1, $v0, 0x3
L80017e48:
  subu $v1, $v1, $v0
L80017e4c:
  sll $v1, $v1, 0x2
L80017e50:
  lui $v0, 0x801a
L80017e54:
  addiu $v0, $v0, 31448
L80017e58:
  addu $v1, $v1, $v0
L80017e5c:
  lhu $v0, 22($v1)
L80017e60:
  sll $zero, $zero, 0x0
L80017e64:
  andi $v0, $v0, 0x2000
L80017e68:
  bne $v0, $zero, L80017e74
L80017e6c:
  sll $zero, $zero, 0x0
L80017e70:
  sb $zero, 103($a0)
L80017e74:
  lhu $v0, 8($a0)
L80017e78:
  sll $zero, $zero, 0x0
L80017e7c:
  andi $a1, $v0, 0xfffb
L80017e80:
  sh $a1, 8($a0)
L80017e84:
  lhu $v0, 22($v1)
L80017e88:
  sll $zero, $zero, 0x0
L80017e8c:
  andi $v0, $v0, 0x1800
L80017e90:
  beq $v0, $zero, L80017ed4
L80017e94:
  ori $v0, $a1, 0x4
L80017e98:
  sh $v0, 8($a0)
L80017e9c:
  sb $zero, 33($a0)
L80017ea0:
  lhu $v0, 22($v1)
L80017ea4:
  sll $zero, $zero, 0x0
L80017ea8:
  andi $v0, $v0, 0x1000
L80017eac:
  beq $v0, $zero, L80017eb8
L80017eb0:
  addiu $v0, $zero, 128
L80017eb4:
  sb $v0, 33($a0)
L80017eb8:
  sb $zero, 34($a0)
L80017ebc:
  lhu $v0, 22($v1)
L80017ec0:
  sll $zero, $zero, 0x0
L80017ec4:
  andi $v0, $v0, 0x800
L80017ec8:
  beq $v0, $zero, L80017ed4
L80017ecc:
  addiu $v0, $zero, 192
L80017ed0:
  sb $v0, 34($a0)
L80017ed4:
  lui $v0, 0x80
L80017ed8:
  ori $v0, $v0, 0x8080
L80017edc:
  sw $v0, 12($a0)
L80017ee0:
  lhu $v0, 22($v1)
L80017ee4:
  sll $zero, $zero, 0x0
L80017ee8:
  andi $v0, $v0, 0x4000
L80017eec:
  beq $v0, $zero, L80017efc
L80017ef0:
  lui $v0, 0x40
L80017ef4:
  ori $v0, $v0, 0x4040
L80017ef8:
  sw $v0, 12($a0)
L80017efc:
  jr $ra
L80017f00:
  sll $zero, $zero, 0x0
L80017f04:
  addiu $sp, $sp, -40
L80017f08:
  sw $s1, 20($sp)
L80017f0c:
  addu $s1, $a0, $zero
L80017f10:
  sw $s2, 24($sp)
L80017f14:
  addu $s2, $a1, $zero
L80017f18:
  sw $s3, 28($sp)
L80017f1c:
  addu $s3, $a2, $zero
L80017f20:
  sw $ra, 32($sp)
L80017f24:
  jal 0x8004002c
L80017f28:
  sw $s0, 16($sp)
L80017f2c:
  addu $a0, $v0, $zero
L80017f30:
  jal 0x800400ac
L80017f34:
  addiu $a1, $zero, 6
L80017f38:
  lui $a0, 0x2492
L80017f3c:
  ori $a0, $a0, 0x4925
L80017f40:
  addu $s0, $v0, $zero
L80017f44:
  lui $v0, 0x801a
L80017f48:
  addiu $v0, $v0, 31448
L80017f4c:
  subu $v0, $s1, $v0
L80017f50:
  srl $v0, $v0, 0x2
L80017f54:
  multu $v0, $a0
L80017f58:
  lui $v0, 0x801d
L80017f5c:
  lh $v1, 12($s1)
L80017f60:
  addiu $v0, $v0, 16964
L80017f64:
  sb $zero, 103($s0)
L80017f68:
  addiu $v1, $v1, -1
L80017f6c:
  sll $v1, $v1, 0x2
L80017f70:
  addu $v1, $v1, $v0
L80017f74:
  lw $v0, 0($v1)
L80017f78:
  sb $zero, 105($s0)
L80017f7c:
  sra $v0, $v0, 0x1a
L80017f80:
  andi $v0, $v0, 0x1f
L80017f84:
  sb $v0, 104($s0)
L80017f88:
  mfhi $a3
L80017f8c:
  sb $a3, 106($s0)
L80017f90:
  lw $v0, 4($s1)
L80017f94:
  addu $a0, $s0, $zero
L80017f98:
  lbu $a1, 2($v0)
L80017f9c:
  lw $v0, 4($s0)
L80017fa0:
  lui $v1, 0x100
L80017fa4:
  sh $s2, 48($s0)
L80017fa8:
  sh $s3, 50($s0)
L80017fac:
  or $v0, $v0, $v1
L80017fb0:
  sw $v0, 4($s0)
L80017fb4:
  lui $v0, 0x8001
L80017fb8:
  addiu $v0, $v0, 26488
L80017fbc:
  sw $v0, 16($s0)
L80017fc0:
  jal 0x80042918
L80017fc4:
  sb $a1, 107($s0)
L80017fc8:
  addu $a0, $s0, $zero
L80017fcc:
  lui $v0, 0x8001
L80017fd0:
  addiu $v0, $v0, 27908
L80017fd4:
  jal L80017e3c
L80017fd8:
  sw $v0, 76($s0)
L80017fdc:
  jal L80017db4
L80017fe0:
  addu $a0, $s0, $zero
L80017fe4:
  addu $v0, $s0, $zero
L80017fe8:
  lw $ra, 32($sp)
L80017fec:
  lw $s3, 28($sp)
L80017ff0:
  lw $s2, 24($sp)
L80017ff4:
  lw $s1, 20($sp)
L80017ff8:
  lw $s0, 16($sp)
L80017ffc:
  jr $ra
L80018000:
  addiu $sp, $sp, 40
L80018004:
  addiu $sp, $sp, -24
L80018008:
  sw $s0, 16($sp)
L8001800c:
  sw $ra, 20($sp)
L80018010:
  jal L80017f04
L80018014:
  addu $s0, $a0, $zero
L80018018:
  lw $v1, 704($gp)
L8001801c:
  sll $zero, $zero, 0x0
L80018020:
  lb $v1, 31($v1)
L80018024:
  sll $zero, $zero, 0x0
L80018028:
  beq $v1, $zero, L8001806c
L8001802c:
  addu $a0, $v0, $zero
L80018030:
  lhu $v0, 22($s0)
L80018034:
  lw $v1, 4($s0)
L80018038:
  ori $v0, $v0, 0x2000
L8001803c:
  sh $v0, 22($s0)
L80018040:
  lbu $v0, 4($v1)
L80018044:
  sll $zero, $zero, 0x0
L80018048:
  addiu $v0, $v0, 1
L8001804c:
  sb $v0, 103($a0)
L80018050:
  lw $v0, 704($gp)
L80018054:
  sll $zero, $zero, 0x0
L80018058:
  lb $v0, 31($v0)
L8001805c:
  sll $zero, $zero, 0x0
L80018060:
  bgez $v0, L8001806c
L80018064:
  addiu $v0, $zero, 255
L80018068:
  sb $v0, 103($a0)
L8001806c:
  lw $ra, 20($sp)
L80018070:
  lw $s0, 16($sp)
L80018074:
  addu $v0, $a0, $zero
L80018078:
  jr $ra
L8001807c:
  addiu $sp, $sp, 24
L80018080:
  addiu $sp, $sp, -32
L80018084:
  sw $s0, 16($sp)
L80018088:
  addu $s0, $a0, $zero
L8001808c:
  sw $ra, 24($sp)
L80018090:
  sw $s1, 20($sp)
L80018094:
  lhu $v0, 8($s0)
L80018098:
  lbu $a0, 106($s0)
L8001809c:
  sb $zero, 34($s0)
L800180a0:
  andi $v0, $v0, 0xfffb
L800180a4:
  sll $v1, $a0, 0x3
L800180a8:
  subu $v1, $v1, $a0
L800180ac:
  sll $v1, $v1, 0x2
L800180b0:
  sh $v0, 8($s0)
L800180b4:
  lui $v0, 0x801a
L800180b8:
  addiu $v0, $v0, 31448
L800180bc:
  addu $s1, $v1, $v0
L800180c0:
  lhu $v0, 22($s1)
L800180c4:
  sll $zero, $zero, 0x0
L800180c8:
  andi $v0, $v0, 0x1000
L800180cc:
  beq $v0, $zero, L800180d8
L800180d0:
  addiu $v0, $zero, 128
L800180d4:
  sb $v0, 34($s0)
L800180d8:
  sb $zero, 33($s0)
L800180dc:
  lhu $v0, 22($s1)
L800180e0:
  sll $zero, $zero, 0x0
L800180e4:
  andi $v0, $v0, 0x800
L800180e8:
  beq $v0, $zero, L800180f4
L800180ec:
  addiu $v0, $zero, 192
L800180f0:
  sb $v0, 33($s0)
L800180f4:
  lui $v0, 0x80
L800180f8:
  ori $v0, $v0, 0x8080
L800180fc:
  sw $v0, 12($s0)
L80018100:
  lhu $v0, 22($s1)
L80018104:
  sll $zero, $zero, 0x0
L80018108:
  andi $v0, $v0, 0x4000
L8001810c:
  beq $v0, $zero, L8001811c
L80018110:
  lui $v0, 0x40
L80018114:
  ori $v0, $v0, 0x4040
L80018118:
  sw $v0, 12($s0)
L8001811c:
  jal L80017db4
L80018120:
  addu $a0, $s0, $zero
L80018124:
  lhu $v0, 22($s1)
L80018128:
  sll $zero, $zero, 0x0
L8001812c:
  andi $v0, $v0, 0x2000
L80018130:
  bne $v0, $zero, L8001813c
L80018134:
  sll $zero, $zero, 0x0
L80018138:
  sb $zero, 103($s0)
L8001813c:
  lw $ra, 24($sp)
L80018140:
  lw $s1, 20($sp)
L80018144:
  lw $s0, 16($sp)
L80018148:
  jr $ra
L8001814c:
  addiu $sp, $sp, 32
L80018150:
  addiu $sp, $sp, -48
L80018154:
  sw $s1, 36($sp)
L80018158:
  addu $s1, $a0, $zero
L8001815c:
  sw $s2, 40($sp)
L80018160:
  addu $s2, $a1, $zero
L80018164:
  sw $ra, 44($sp)
L80018168:
  jal 0x8004006c
L8001816c:
  sw $s0, 32($sp)
L80018170:
  addu $a0, $v0, $zero
L80018174:
  jal 0x800400ac
L80018178:
  addiu $a1, $zero, 2
L8001817c:
  addu $s0, $v0, $zero
L80018180:
  addu $a0, $s0, $zero
L80018184:
  addu $a1, $s1, $zero
L80018188:
  addiu $v0, $zero, 1
L8001818c:
  sw $v0, 16($sp)
L80018190:
  addiu $v0, $zero, 31
L80018194:
  sw $v0, 24($sp)
L80018198:
  addiu $v0, $zero, 256
L8001819c:
  addu $a2, $s2, $zero
L800181a0:
  addu $a3, $zero, $zero
L800181a4:
  sw $zero, 20($sp)
L800181a8:
  jal 0x800404cc
L800181ac:
  sw $v0, 28($sp)
L800181b0:
  jal 0x80042918
L800181b4:
  addu $a0, $s0, $zero
L800181b8:
  addu $a0, $s0, $zero
L800181bc:
  jal 0x800428ec
L800181c0:
  addiu $a1, $zero, -2
L800181c4:
  lhu $v1, 8($s0)
L800181c8:
  addu $v0, $s0, $zero
L800181cc:
  ori $v1, $v1, 0x8
L800181d0:
  sh $v1, 8($v0)
L800181d4:
  lw $ra, 44($sp)
L800181d8:
  lw $s2, 40($sp)
L800181dc:
  lw $s1, 36($sp)
L800181e0:
  lw $s0, 32($sp)
L800181e4:
  jr $ra
L800181e8:
  addiu $sp, $sp, 48
L800181ec:
  lbu $v1, 104($a0)
L800181f0:
  addiu $v0, $zero, 21
L800181f4:
  beq $v1, $v0, L80018234
L800181f8:
  addiu $a1, $zero, 1
L800181fc:
  slti $v0, $v1, 22
L80018200:
  beq $v0, $zero, L80018218
L80018204:
  addiu $v0, $zero, 20
L80018208:
  beq $v1, $v0, L8001822c
L8001820c:
  sll $zero, $zero, 0x0
L80018210:
  j L80018240
L80018214:
  sll $zero, $zero, 0x0
L80018218:
  addiu $v0, $zero, 22
L8001821c:
  beq $v1, $v0, L8001823c
L80018220:
  addiu $v0, $zero, 23
L80018224:
  bne $v1, $v0, L80018240
L80018228:
  sll $zero, $zero, 0x0
L8001822c:
  j L80018240
L80018230:
  addiu $a1, $zero, 2
L80018234:
  j L80018240
L80018238:
  addiu $a1, $zero, 3
L8001823c:
  addiu $a1, $zero, 4
L80018240:
  lbu $v0, 34($a0)
L80018244:
  sll $zero, $zero, 0x0
L80018248:
  beq $v0, $zero, L80018254
L8001824c:
  sll $zero, $zero, 0x0
L80018250:
  ori $a1, $a1, 0x80
L80018254:
  jr $ra
L80018258:
  addu $v0, $a1, $zero
L8001825c:
  lhu $a1, 818($gp)
L80018260:
  addiu $sp, $sp, -40
L80018264:
  sw $ra, 36($sp)
L80018268:
  sw $s4, 32($sp)
L8001826c:
  sw $s3, 28($sp)
L80018270:
  sw $s2, 24($sp)
L80018274:
  sw $s1, 20($sp)
L80018278:
  andi $v0, $a1, 0x8000
L8001827c:
  bne $v0, $zero, L800184a8
L80018280:
  sw $s0, 16($sp)
L80018284:
  ori $v0, $a1, 0x8000
L80018288:
  sh $v0, 818($gp)
L8001828c:
  lui $v0, 0x801a
L80018290:
  addiu $s3, $v0, 31588
L80018294:
  addiu $s2, $zero, 5
L80018298:
  addiu $s0, $s3, 18
L8001829c:
  lhu $v1, 4($s0)
L800182a0:
  sll $zero, $zero, 0x0
L800182a4:
  andi $v0, $v1, 0x8000
L800182a8:
  beq $v0, $zero, L800182e4
L800182ac:
  andi $s4, $v1, 0x7a00
L800182b0:
  lw $v0, -14($s0)
L800182b4:
  sll $zero, $zero, 0x0
L800182b8:
  lb $a1, 2($v0)
L800182bc:
  lh $s1, 0($s0)
L800182c0:
  jal 0x80024d34
L800182c4:
  addu $a0, $s2, $zero
L800182c8:
  lhu $v0, 4($s0)
L800182cc:
  sh $s1, 0($s0)
L800182d0:
  or $v0, $v0, $s4
L800182d4:
  sh $v0, 4($s0)
L800182d8:
  lw $a0, 0($s3)
L800182dc:
  jal L80018080
L800182e0:
  sll $zero, $zero, 0x0
L800182e4:
  addiu $s2, $s2, 1
L800182e8:
  addiu $s0, $s0, 28
L800182ec:
  slti $v0, $s2, 15
L800182f0:
  bne $v0, $zero, L8001829c
L800182f4:
  addiu $s3, $s3, 28
L800182f8:
  lui $v0, 0x801a
L800182fc:
  addiu $v0, $v0, 31588
L80018300:
  addiu $s3, $v0, 420
L80018304:
  addiu $s2, $zero, 20
L80018308:
  addiu $s0, $v0, 438
L8001830c:
  lhu $v1, 4($s0)
L80018310:
  sll $zero, $zero, 0x0
L80018314:
  andi $v0, $v1, 0x8000
L80018318:
  beq $v0, $zero, L80018354
L8001831c:
  andi $s4, $v1, 0x7a00
L80018320:
  lw $v0, -14($s0)
L80018324:
  sll $zero, $zero, 0x0
L80018328:
  lb $a1, 2($v0)
L8001832c:
  lh $s1, 0($s0)
L80018330:
  jal 0x80024d34
L80018334:
  addu $a0, $s2, $zero
L80018338:
  lhu $v0, 4($s0)
L8001833c:
  sh $s1, 0($s0)
L80018340:
  or $v0, $v0, $s4
L80018344:
  sh $v0, 4($s0)
L80018348:
  lw $a0, 0($s3)
L8001834c:
  jal L80018080
L80018350:
  sll $zero, $zero, 0x0
L80018354:
  addiu $s2, $s2, 1
L80018358:
  addiu $s0, $s0, 28
L8001835c:
  slti $v0, $s2, 30
L80018360:
  bne $v0, $zero, L8001830c
L80018364:
  addiu $s3, $s3, 28
L80018368:
  jal 0x8001352c
L8001836c:
  addu $s2, $zero, $zero
L80018370:
  addiu $s3, $gp, 744
L80018374:
  lui $v0, 0x800f
L80018378:
  addiu $s0, $v0, -24592
L8001837c:
  lb $v0, 25($s0)
L80018380:
  sll $zero, $zero, 0x0
L80018384:
  beq $v0, $zero, L800183b0
L80018388:
  sll $zero, $zero, 0x0
L8001838c:
  jal 0x8002c604
L80018390:
  addiu $a0, $zero, 21
L80018394:
  addu $s1, $v0, $zero
L80018398:
  lbu $v1, 28($s1)
L8001839c:
  addiu $v0, $s2, 2
L800183a0:
  sh $v0, 26($s1)
L800183a4:
  ori $v1, $v1, 0x20
L800183a8:
  sb $v1, 28($s1)
L800183ac:
  sw $s1, 0($s3)
L800183b0:
  addiu $s3, $s3, 4
L800183b4:
  addiu $s2, $s2, 1
L800183b8:
  slti $v0, $s2, 2
L800183bc:
  bne $v0, $zero, L8001837c
L800183c0:
  addiu $s0, $s0, 32
L800183c4:
  lw $v0, 704($gp)
L800183c8:
  sll $zero, $zero, 0x0
L800183cc:
  lb $v1, 0($v0)
L800183d0:
  addiu $v0, $zero, 40
L800183d4:
  bne $v1, $v0, L80018464
L800183d8:
  lui $v0, 0x800f
L800183dc:
  addu $s2, $zero, $zero
L800183e0:
  lui $v0, 0x8009
L800183e4:
  addiu $s1, $v0, 2008
L800183e8:
  lui $v1, 0x801a
L800183ec:
  lhu $v0, 818($gp)
L800183f0:
  addiu $s0, $v1, 31448
L800183f4:
  ori $v0, $v0, 0x2000
L800183f8:
  sh $v0, 818($gp)
L800183fc:
  lbu $v1, 717($gp)
L80018400:
  sll $zero, $zero, 0x0
L80018404:
  sll $v0, $v1, 0x2
L80018408:
  addu $v0, $v0, $v1
L8001840c:
  sll $v0, $v0, 0x2
L80018410:
  addu $v0, $s2, $v0
L80018414:
  addu $v0, $v0, $s1
L80018418:
  lbu $v1, 0($v0)
L8001841c:
  sll $zero, $zero, 0x0
L80018420:
  sll $v0, $v1, 0x3
L80018424:
  subu $v0, $v0, $v1
L80018428:
  sll $v0, $v0, 0x2
L8001842c:
  addu $s3, $v0, $s0
L80018430:
  lhu $v0, 22($s3)
L80018434:
  sll $zero, $zero, 0x0
L80018438:
  andi $v0, $v0, 0x8000
L8001843c:
  beq $v0, $zero, L8001844c
L80018440:
  sll $zero, $zero, 0x0
L80018444:
  jal 0x80024954
L80018448:
  addu $a0, $s3, $zero
L8001844c:
  addiu $s2, $s2, 1
L80018450:
  slti $v0, $s2, 10
L80018454:
  beq $v0, $zero, L80018498
L80018458:
  sll $zero, $zero, 0x0
L8001845c:
  j L800183fc
L80018460:
  sll $zero, $zero, 0x0
L80018464:
  addiu $v1, $v0, -24592
L80018468:
  lh $v0, 20($v1)
L8001846c:
  sll $zero, $zero, 0x0
L80018470:
  beq $v0, $zero, L80018498
L80018474:
  sll $zero, $zero, 0x0
L80018478:
  lh $v0, 52($v1)
L8001847c:
  sll $zero, $zero, 0x0
L80018480:
  beq $v0, $zero, L80018498
L80018484:
  sll $zero, $zero, 0x0
L80018488:
  lui $a0, 0x800a
L8001848c:
  lhu $a0, -19606($a0)
L80018490:
  jal 0x8003ff08
L80018494:
  sll $zero, $zero, 0x0
L80018498:
  jal 0x800157dc
L8001849c:
  sll $zero, $zero, 0x0
L800184a0:
  j L800185e8
L800184a4:
  sll $zero, $zero, 0x0
L800184a8:
  andi $v0, $a1, 0x4000
L800184ac:
  bne $v0, $zero, L80018520
L800184b0:
  lui $v0, 0x200
L800184b4:
  ori $v0, $v0, 0x30
L800184b8:
  lui $v1, 0x800a
L800184bc:
  lw $v1, -20236($v1)
L800184c0:
  lui $a0, 0x800a
L800184c4:
  lw $a0, -20172($a0)
L800184c8:
  and $v1, $v1, $v0
L800184cc:
  or $v1, $v1, $a0
L800184d0:
  bne $v1, $zero, L800185e8
L800184d4:
  lui $v0, 0x800f
L800184d8:
  lbu $v0, -24882($v0)
L800184dc:
  sll $zero, $zero, 0x0
L800184e0:
  andi $v0, $v0, 0x80
L800184e4:
  bne $v0, $zero, L800185e8
L800184e8:
  ori $v0, $a1, 0x4000
L800184ec:
  addiu $v1, $zero, 2
L800184f0:
  sh $v0, 818($gp)
L800184f4:
  andi $v0, $v0, 0x2000
L800184f8:
  sb $v1, 689($gp)
L800184fc:
  beq $v0, $zero, L800185e8
L80018500:
  addiu $v0, $zero, 12
L80018504:
  sh $v0, 818($gp)
L80018508:
  j L800185e8
L8001850c:
  sll $zero, $zero, 0x0
L80018510:
  addiu $v0, $zero, 5
L80018514:
  sh $v0, 818($gp)
L80018518:
  j L800185e8
L8001851c:
  sll $zero, $zero, 0x0
L80018520:
  addiu $v1, $gp, 768
L80018524:
  lbu $v0, 689($gp)
L80018528:
  sll $zero, $zero, 0x0
L8001852c:
  addiu $v0, $v0, -1
L80018530:
  sb $v0, 689($gp)
L80018534:
  sll $v0, $v0, 0x18
L80018538:
  sra $a0, $v0, 0x18
L8001853c:
  bltz $a0, L80018510
L80018540:
  addu $v0, $a0, $v1
L80018544:
  lb $v0, 0($v0)
L80018548:
  sll $zero, $zero, 0x0
L8001854c:
  bltz $v0, L80018524
L80018550:
  lui $a1, 0x4
L80018554:
  ori $a1, $a1, 0x8000
L80018558:
  lui $v1, 0x8016
L8001855c:
  addiu $v0, $gp, 768
L80018560:
  addu $v0, $a0, $v0
L80018564:
  lb $a0, 0($v0)
L80018568:
  addiu $v1, $v1, -15324
L8001856c:
  sll $v0, $a0, 0x3
L80018570:
  subu $v0, $v0, $a0
L80018574:
  sll $v0, $v0, 0x2
L80018578:
  addu $v0, $v0, $v1
L8001857c:
  addu $v0, $v0, $a1
L80018580:
  lw $s0, 14004($v0)
L80018584:
  jal 0x8001352c
L80018588:
  sll $zero, $zero, 0x0
L8001858c:
  jal 0x8002c68c
L80018590:
  addiu $a0, $zero, 11
L80018594:
  lhu $v1, 48($s0)
L80018598:
  addu $s1, $v0, $zero
L8001859c:
  sh $v1, 0($s1)
L800185a0:
  lhu $v0, 50($s0)
L800185a4:
  sll $zero, $zero, 0x0
L800185a8:
  sh $v0, 2($s1)
L800185ac:
  lhu $v0, 52($s0)
L800185b0:
  addu $a0, $s0, $zero
L800185b4:
  jal L800181ec
L800185b8:
  sh $v0, 4($s1)
L800185bc:
  lui $a0, 0x801a
L800185c0:
  sh $v0, 26($s1)
L800185c4:
  lbu $v1, 106($s0)
L800185c8:
  addiu $a0, $a0, 31448
L800185cc:
  sll $v0, $v1, 0x3
L800185d0:
  subu $v0, $v0, $v1
L800185d4:
  sll $v0, $v0, 0x2
L800185d8:
  jal 0x80024954
L800185dc:
  addu $a0, $v0, $a0
L800185e0:
  jal 0x8003fee0
L800185e4:
  addiu $a0, $zero, 31
L800185e8:
  lw $ra, 36($sp)
L800185ec:
  lw $s4, 32($sp)
L800185f0:
  lw $s3, 28($sp)
L800185f4:
  lw $s2, 24($sp)
L800185f8:
  lw $s1, 20($sp)
L800185fc:
  lw $s0, 16($sp)
L80018600:
  jr $ra
L80018604:
  addiu $sp, $sp, 40
L80018608:
  lhu $v1, 818($gp)
L8001860c:
  addiu $sp, $sp, -40
L80018610:
  sw $s2, 24($sp)
L80018614:
  lui $s2, 0x800f
L80018618:
  sw $s1, 20($sp)
L8001861c:
  addiu $s1, $s2, 10312
L80018620:
  sw $ra, 32($sp)
L80018624:
  sw $s3, 28($sp)
L80018628:
  andi $v0, $v1, 0x8000
L8001862c:
  bne $v0, $zero, L80018678
L80018630:
  sw $s0, 16($sp)
L80018634:
  ori $v0, $v1, 0x8000
L80018638:
  sh $v0, 818($gp)
L8001863c:
  jal 0x80024734
L80018640:
  sll $zero, $zero, 0x0
L80018644:
  addiu $v0, $zero, 1200
L80018648:
  sh $v0, 10312($s2)
L8001864c:
  addiu $v0, $zero, 856
L80018650:
  sh $v0, 4($s1)
L80018654:
  addiu $v0, $zero, 5824
L80018658:
  jal 0x8001352c
L8001865c:
  sh $v0, 2($s1)
L80018660:
  addiu $v0, $zero, 2
L80018664:
  sb $v0, 620($gp)
L80018668:
  jal 0x800157dc
L8001866c:
  sll $zero, $zero, 0x0
L80018670:
  j L80018970
L80018674:
  sll $zero, $zero, 0x0
L80018678:
  lbu $v1, 620($gp)
L8001867c:
  addiu $s3, $zero, 3
L80018680:
  andi $s0, $v1, 0x1f
L80018684:
  beq $s0, $s3, L80018724
L80018688:
  slti $v0, $s0, 4
L8001868c:
  beq $v0, $zero, L800186a4
L80018690:
  addiu $v0, $zero, 2
L80018694:
  beq $s0, $v0, L800186c0
L80018698:
  sll $zero, $zero, 0x0
L8001869c:
  j L80018970
L800186a0:
  sll $zero, $zero, 0x0
L800186a4:
  addiu $v0, $zero, 4
L800186a8:
  beq $s0, $v0, L80018780
L800186ac:
  addiu $v0, $zero, 5
L800186b0:
  beq $s0, $v0, L80018938
L800186b4:
  sll $zero, $zero, 0x0
L800186b8:
  j L80018970
L800186bc:
  sll $zero, $zero, 0x0
L800186c0:
  lhu $v0, 10312($s2)
L800186c4:
  sll $zero, $zero, 0x0
L800186c8:
  addiu $v0, $v0, -2
L800186cc:
  sh $v0, 10312($s2)
L800186d0:
  lhu $v1, 4($s1)
L800186d4:
  lhu $v0, 2($s1)
L800186d8:
  addiu $v1, $v1, -2
L800186dc:
  addiu $v0, $v0, -16
L800186e0:
  sh $v0, 2($s1)
L800186e4:
  sll $v0, $v0, 0x10
L800186e8:
  sra $v0, $v0, 0x10
L800186ec:
  slti $v0, $v0, 1025
L800186f0:
  beq $v0, $zero, L80018714
L800186f4:
  sh $v1, 4($s1)
L800186f8:
  addiu $v0, $zero, 600
L800186fc:
  sh $v0, 10312($s2)
L80018700:
  addiu $v0, $zero, 256
L80018704:
  sh $v0, 4($s1)
L80018708:
  addiu $v0, $zero, 1024
L8001870c:
  sh $v0, 2($s1)
L80018710:
  sb $s3, 620($gp)
L80018714:
  jal 0x8001352c
L80018718:
  sll $zero, $zero, 0x0
L8001871c:
  j L80018970
L80018720:
  sll $zero, $zero, 0x0
L80018724:
  andi $v0, $v1, 0x80
L80018728:
  bne $v0, $zero, L80018764
L8001872c:
  ori $v0, $v1, 0x80
L80018730:
  sb $v0, 620($gp)
L80018734:
  addiu $v0, $zero, 2
L80018738:
  sh $v0, 602($gp)
L8001873c:
  lui $v0, 0x800f
L80018740:
  lbu $a0, 717($gp)
L80018744:
  addiu $v0, $v0, -24816
L80018748:
  sll $v1, $a0, 0x3
L8001874c:
  subu $v1, $v1, $a0
L80018750:
  sll $v1, $v1, 0x4
L80018754:
  addu $v1, $v1, $v0
L80018758:
  addiu $v0, $zero, 174
L8001875c:
  sw $v1, 684($gp)
L80018760:
  sh $v0, 12($v1)
L80018764:
  lhu $v0, 602($gp)
L80018768:
  sll $zero, $zero, 0x0
L8001876c:
  bne $v0, $zero, L80018970
L80018770:
  addiu $v0, $zero, 4
L80018774:
  sb $v0, 620($gp)
L80018778:
  j L80018970
L8001877c:
  sll $zero, $zero, 0x0
L80018780:
  lui $v0, 0x200
L80018784:
  ori $v0, $v0, 0x30
L80018788:
  lui $v1, 0x800a
L8001878c:
  lw $v1, -20236($v1)
L80018790:
  lui $a0, 0x800a
L80018794:
  lw $a0, -20172($a0)
L80018798:
  and $v1, $v1, $v0
L8001879c:
  or $v1, $v1, $a0
L800187a0:
  bne $v1, $zero, L80018970
L800187a4:
  sll $zero, $zero, 0x0
L800187a8:
  lui $a0, 0x800a
L800187ac:
  lhu $a0, -19606($a0)
L800187b0:
  jal 0x8003ff08
L800187b4:
  sll $zero, $zero, 0x0
L800187b8:
  jal 0x80024824
L800187bc:
  sll $zero, $zero, 0x0
L800187c0:
  addu $t0, $zero, $zero
L800187c4:
  addu $t1, $t0, $zero
L800187c8:
  lui $v0, 0x801a
L800187cc:
  addiu $a3, $v0, 32288
L800187d0:
  addu $a2, $t0, $zero
L800187d4:
  lui $v0, 0x801d
L800187d8:
  addiu $a1, $v0, 16964
L800187dc:
  lh $v0, 0($a3)
L800187e0:
  addiu $a2, $a2, 1
L800187e4:
  addiu $v0, $v0, -1
L800187e8:
  sll $v0, $v0, 0x2
L800187ec:
  addu $v0, $v0, $a1
L800187f0:
  lw $v1, 0($v0)
L800187f4:
  sll $zero, $zero, 0x0
L800187f8:
  andi $a0, $v1, 0x1ff
L800187fc:
  sll $v0, $a0, 0x2
L80018800:
  addu $v0, $v0, $a0
L80018804:
  sll $v0, $v0, 0x1
L80018808:
  addu $t0, $t0, $v0
L8001880c:
  sra $v1, $v1, 0x9
L80018810:
  andi $v1, $v1, 0x1ff
L80018814:
  sll $v0, $v1, 0x2
L80018818:
  addu $v0, $v0, $v1
L8001881c:
  sll $v0, $v0, 0x1
L80018820:
  addu $t1, $t1, $v0
L80018824:
  slti $v0, $a2, 40
L80018828:
  bne $v0, $zero, L800187dc
L8001882c:
  addiu $a3, $a3, 6
L80018830:
  lui $v0, 0x6666
L80018834:
  ori $v0, $v0, 0x6667
L80018838:
  mult $t0, $v0
L8001883c:
  sra $a0, $t0, 0x1f
L80018840:
  addu $t0, $zero, $zero
L80018844:
  mfhi $t2
L80018848:
  sra $a1, $t1, 0x1f
L8001884c:
  addu $a2, $t0, $zero
L80018850:
  mult $t1, $v0
L80018854:
  lui $v1, 0x800f
L80018858:
  addiu $v1, $v1, -24592
L8001885c:
  addu $t1, $t0, $zero
L80018860:
  lui $v0, 0x801a
L80018864:
  addiu $v0, $v0, 32288
L80018868:
  addiu $a3, $v0, 240
L8001886c:
  lui $v0, 0x801d
L80018870:
  addiu $t3, $v0, 16964
L80018874:
  sra $v0, $t2, 0x4
L80018878:
  subu $v0, $v0, $a0
L8001887c:
  sh $v0, 14($v1)
L80018880:
  mfhi $t5
L80018884:
  sra $v0, $t5, 0x4
L80018888:
  subu $v0, $v0, $a1
L8001888c:
  sh $v0, 16($v1)
L80018890:
  lh $v0, 0($a3)
L80018894:
  addiu $a2, $a2, 1
L80018898:
  addiu $v0, $v0, -1
L8001889c:
  sll $v0, $v0, 0x2
L800188a0:
  addu $v0, $v0, $t3
L800188a4:
  lw $v1, 0($v0)
L800188a8:
  sll $zero, $zero, 0x0
L800188ac:
  andi $a0, $v1, 0x1ff
L800188b0:
  sll $v0, $a0, 0x2
L800188b4:
  addu $v0, $v0, $a0
L800188b8:
  sll $v0, $v0, 0x1
L800188bc:
  addu $t0, $t0, $v0
L800188c0:
  sra $v1, $v1, 0x9
L800188c4:
  andi $v1, $v1, 0x1ff
L800188c8:
  sll $v0, $v1, 0x2
L800188cc:
  addu $v0, $v0, $v1
L800188d0:
  sll $v0, $v0, 0x1
L800188d4:
  addu $t1, $t1, $v0
L800188d8:
  slti $v0, $a2, 40
L800188dc:
  bne $v0, $zero, L80018890
L800188e0:
  addiu $a3, $a3, 6
L800188e4:
  lui $v0, 0x6666
L800188e8:
  ori $v0, $v0, 0x6667
L800188ec:
  mult $t0, $v0
L800188f0:
  mfhi $v1
L800188f4:
  sll $zero, $zero, 0x0
L800188f8:
  sll $zero, $zero, 0x0
L800188fc:
  mult $t1, $v0
L80018900:
  lui $a0, 0x800f
L80018904:
  addiu $a0, $a0, -24592
L80018908:
  addiu $v0, $zero, 5
L8001890c:
  sb $v0, 620($gp)
L80018910:
  sra $v0, $v1, 0x4
L80018914:
  sra $v1, $t0, 0x1f
L80018918:
  subu $v0, $v0, $v1
L8001891c:
  sra $v1, $t1, 0x1f
L80018920:
  sh $v0, 46($a0)
L80018924:
  mfhi $a1
L80018928:
  sra $v0, $a1, 0x4
L8001892c:
  subu $v0, $v0, $v1
L80018930:
  j L80018970
L80018934:
  sh $v0, 48($a0)
L80018938:
  jal 0x800176d0
L8001893c:
  sll $zero, $zero, 0x0
L80018940:
  lui $v1, 0x800f
L80018944:
  lbu $a0, 717($gp)
L80018948:
  addiu $v1, $v1, -24816
L8001894c:
  sb $s0, 740($gp)
L80018950:
  sh $s3, 818($gp)
L80018954:
  sll $v0, $a0, 0x3
L80018958:
  subu $v0, $v0, $a0
L8001895c:
  sll $v0, $v0, 0x4
L80018960:
  addu $v0, $v0, $v1
L80018964:
  lui $v1, 0x800f
L80018968:
  addiu $v1, $v1, -24528
L8001896c:
  sw $v1, 8($v0)
L80018970:
  lw $ra, 32($sp)
L80018974:
  lw $s3, 28($sp)
L80018978:
  lw $s2, 24($sp)
L8001897c:
  lw $s1, 20($sp)
L80018980:
  lw $s0, 16($sp)
L80018984:
  jr $ra
L80018988:
  addiu $sp, $sp, 40
L8001898c:
  lhu $v1, 818($gp)
L80018990:
  addiu $sp, $sp, -56
L80018994:
  sw $ra, 52($sp)
L80018998:
  sw $s6, 48($sp)
L8001899c:
  sw $s5, 44($sp)
L800189a0:
  sw $s4, 40($sp)
L800189a4:
  sw $s3, 36($sp)
L800189a8:
  sw $s2, 32($sp)
L800189ac:
  sw $s1, 28($sp)
L800189b0:
  andi $v0, $v1, 0x8000
L800189b4:
  bne $v0, $zero, L80018bf8
L800189b8:
  sw $s0, 24($sp)
L800189bc:
  lbu $v0, 717($gp)
L800189c0:
  ori $v1, $v1, 0x8000
L800189c4:
  sh $v1, 818($gp)
L800189c8:
  lw $v1, 788($gp)
L800189cc:
  sll $v0, $v0, 0x4
L800189d0:
  ori $v0, $v0, 0x2e0
L800189d4:
  jal 0x800176d0
L800189d8:
  sh $v0, 64($v1)
L800189dc:
  lui $v0, 0x800f
L800189e0:
  lbu $a0, 717($gp)
L800189e4:
  addiu $v0, $v0, -24592
L800189e8:
  sll $v1, $a0, 0x5
L800189ec:
  addu $a1, $v1, $v0
L800189f0:
  sll $v1, $a0, 0x3
L800189f4:
  subu $v1, $v1, $a0
L800189f8:
  sll $v1, $v1, 0x4
L800189fc:
  lui $v0, 0x800f
L80018a00:
  addiu $v0, $v0, -24816
L80018a04:
  addu $v1, $v1, $v0
L80018a08:
  lui $v0, 0x800f
L80018a0c:
  addiu $s4, $v0, -24528
L80018a10:
  sw $a1, 704($gp)
L80018a14:
  sw $v1, 684($gp)
L80018a18:
  sw $s4, 8($v1)
L80018a1c:
  lb $v0, 25($a1)
L80018a20:
  lbu $v1, 25($a1)
L80018a24:
  beq $v0, $zero, L80018a70
L80018a28:
  addiu $v0, $v1, -1
L80018a2c:
  sb $v0, 25($a1)
L80018a30:
  sll $v0, $v0, 0x18
L80018a34:
  bgtz $v0, L80018a74
L80018a38:
  lui $v0, 0x801a
L80018a3c:
  lw $v0, 704($gp)
L80018a40:
  sll $zero, $zero, 0x0
L80018a44:
  sb $zero, 25($v0)
L80018a48:
  addiu $v0, $gp, 744
L80018a4c:
  lbu $v1, 717($gp)
L80018a50:
  lbu $a0, 717($gp)
L80018a54:
  sll $v1, $v1, 0x2
L80018a58:
  addu $v1, $v1, $v0
L80018a5c:
  ori $v0, $zero, 0xfffd
L80018a60:
  lw $a1, 0($v1)
L80018a64:
  subu $v0, $v0, $a0
L80018a68:
  sh $v0, 26($a1)
L80018a6c:
  sw $zero, 0($v1)
L80018a70:
  lui $v0, 0x801a
L80018a74:
  addiu $s2, $v0, 31448
L80018a78:
  lw $v1, 704($gp)
L80018a7c:
  addu $s1, $zero, $zero
L80018a80:
  lbu $v0, 1($v1)
L80018a84:
  addiu $s0, $s2, 22
L80018a88:
  addiu $v0, $v0, 1
L80018a8c:
  sb $v0, 1($v1)
L80018a90:
  lhu $v1, 0($s0)
L80018a94:
  sll $zero, $zero, 0x0
L80018a98:
  andi $v0, $v1, 0x8000
L80018a9c:
  beq $v0, $zero, L80018abc
L80018aa0:
  andi $v0, $v1, 0xbfff
L80018aa4:
  sh $v0, 0($s0)
L80018aa8:
  lw $a0, 0($s2)
L80018aac:
  jal L80018080
L80018ab0:
  addiu $s1, $s1, 1
L80018ab4:
  j L80018ac8
L80018ab8:
  addiu $s0, $s0, 28
L80018abc:
  sh $zero, 0($s0)
L80018ac0:
  addiu $s1, $s1, 1
L80018ac4:
  addiu $s0, $s0, 28
L80018ac8:
  slti $v0, $s1, 30
L80018acc:
  bne $v0, $zero, L80018a90
L80018ad0:
  addiu $s2, $s2, 28
L80018ad4:
  addu $s1, $zero, $zero
L80018ad8:
  addiu $a0, $sp, 16
L80018adc:
  addiu $a1, $zero, -1
L80018ae0:
  lw $v0, 704($gp)
L80018ae4:
  sll $zero, $zero, 0x0
L80018ae8:
  addu $v0, $v0, $s1
L80018aec:
  lbu $v1, 26($v0)
L80018af0:
  addu $v0, $a0, $s1
L80018af4:
  sb $v1, 0($v0)
L80018af8:
  lw $v0, 704($gp)
L80018afc:
  sll $zero, $zero, 0x0
L80018b00:
  addu $v0, $v0, $s1
L80018b04:
  addiu $s1, $s1, 1
L80018b08:
  sb $a1, 26($v0)
L80018b0c:
  slti $v0, $s1, 5
L80018b10:
  bne $v0, $zero, L80018ae0
L80018b14:
  addu $s3, $zero, $zero
L80018b18:
  addu $s1, $s3, $zero
L80018b1c:
  addu $s6, $s4, $zero
L80018b20:
  lbu $v1, 717($gp)
L80018b24:
  addiu $s5, $zero, 14
L80018b28:
  sll $v0, $v1, 0x4
L80018b2c:
  subu $s0, $v0, $v1
L80018b30:
  sll $v1, $s0, 0x3
L80018b34:
  subu $v1, $v1, $s0
L80018b38:
  sll $v1, $v1, 0x2
L80018b3c:
  lui $v0, 0x801a
L80018b40:
  addiu $v0, $v0, 31448
L80018b44:
  addu $s2, $v1, $v0
L80018b48:
  addu $s4, $s2, $zero
L80018b4c:
  addiu $v0, $sp, 16
L80018b50:
  addu $a1, $v0, $s1
L80018b54:
  sh $zero, 22($s2)
L80018b58:
  sw $zero, 0($s2)
L80018b5c:
  lb $v0, 0($a1)
L80018b60:
  lbu $v1, 0($a1)
L80018b64:
  bltz $v0, L80018ba8
L80018b68:
  addu $a0, $s0, $zero
L80018b6c:
  lw $v0, 704($gp)
L80018b70:
  addiu $s0, $s0, 1
L80018b74:
  addu $v0, $v0, $s3
L80018b78:
  sb $v1, 26($v0)
L80018b7c:
  lb $a1, 0($a1)
L80018b80:
  jal 0x800249e0
L80018b84:
  addiu $s3, $s3, 1
L80018b88:
  addu $a0, $s4, $zero
L80018b8c:
  addu $a1, $s5, $zero
L80018b90:
  jal L80018004
L80018b94:
  addiu $a2, $zero, 658
L80018b98:
  sw $v0, 0($s6)
L80018b9c:
  addiu $s6, $s6, 12
L80018ba0:
  addiu $s5, $s5, 60
L80018ba4:
  addiu $s4, $s4, 28
L80018ba8:
  addiu $s1, $s1, 1
L80018bac:
  slti $v0, $s1, 5
L80018bb0:
  bne $v0, $zero, L80018b4c
L80018bb4:
  addiu $s2, $s2, 28
L80018bb8:
  addiu $v0, $zero, 5
L80018bbc:
  subu $v0, $v0, $s3
L80018bc0:
  sb $v0, 740($gp)
L80018bc4:
  addiu $v0, $zero, 2
L80018bc8:
  sh $v0, 602($gp)
L80018bcc:
  lui $v0, 0x800f
L80018bd0:
  lbu $a0, 717($gp)
L80018bd4:
  addiu $v0, $v0, -24816
L80018bd8:
  sll $v1, $a0, 0x3
L80018bdc:
  subu $v1, $v1, $a0
L80018be0:
  sll $v1, $v1, 0x4
L80018be4:
  addu $v1, $v1, $v0
L80018be8:
  addiu $v0, $zero, 174
L80018bec:
  sw $v1, 684($gp)
L80018bf0:
  j L80018c0c
L80018bf4:
  sh $v0, 12($v1)
L80018bf8:
  lhu $v0, 602($gp)
L80018bfc:
  sll $zero, $zero, 0x0
L80018c00:
  bne $v0, $zero, L80018c0c
L80018c04:
  addiu $v0, $zero, 3
L80018c08:
  sh $v0, 818($gp)
L80018c0c:
  lw $ra, 52($sp)
L80018c10:
  lw $s6, 48($sp)
L80018c14:
  lw $s5, 44($sp)
L80018c18:
  lw $s4, 40($sp)
L80018c1c:
  lw $s3, 36($sp)
L80018c20:
  lw $s2, 32($sp)
L80018c24:
  lw $s1, 28($sp)
L80018c28:
  lw $s0, 24($sp)
L80018c2c:
  jr $ra
L80018c30:
  addiu $sp, $sp, 56
L80018c34:
  addiu $sp, $sp, -24
L80018c38:
  sw $s0, 16($sp)
L80018c3c:
  sw $ra, 20($sp)
L80018c40:
  jal 0x80042b98
L80018c44:
  addu $s0, $a0, $zero
L80018c48:
  bne $v0, $zero, L80018ca4
L80018c4c:
  addiu $v1, $zero, 1024
L80018c50:
  lh $v0, 96($s0)
L80018c54:
  sll $zero, $zero, 0x0
L80018c58:
  .word 0x0062001a
L80018c5c:
  bne $v0, $zero, L80018c68
L80018c60:
  sll $zero, $zero, 0x0
L80018c64:
  .word 0x0007000d
L80018c68:
  addiu $at, $zero, -1
L80018c6c:
  bne $v0, $at, L80018c80
L80018c70:
  lui $at, 0x8000
L80018c74:
  bne $v1, $at, L80018c80
L80018c78:
  sll $zero, $zero, 0x0
L80018c7c:
  .word 0x0006000d
L80018c80:
  mflo $v1
L80018c84:
  lhu $v0, 48($s0)
L80018c88:
  addu $a0, $s0, $zero
L80018c8c:
  addiu $v0, $v0, -320
L80018c90:
  sh $v0, 40($s0)
L80018c94:
  jal 0x80043178
L80018c98:
  sh $v1, 44($s0)
L80018c9c:
  addiu $v0, $zero, -1024
L80018ca0:
  sh $v0, 96($s0)
L80018ca4:
  lh $a1, 40($s0)
L80018ca8:
  lh $a2, 50($s0)
L80018cac:
  lh $a3, 96($s0)
L80018cb0:
  jal 0x80043230
L80018cb4:
  addu $a0, $s0, $zero
L80018cb8:
  lhu $v0, 96($s0)
L80018cbc:
  lhu $v1, 44($s0)
L80018cc0:
  sll $zero, $zero, 0x0
L80018cc4:
  addu $v0, $v0, $v1
L80018cc8:
  sh $v0, 96($s0)
L80018ccc:
  sll $v0, $v0, 0x10
L80018cd0:
  bltz $v0, L80018ce8
L80018cd4:
  sll $zero, $zero, 0x0
L80018cd8:
  lhu $v0, 40($s0)
L80018cdc:
  sw $zero, 36($s0)
L80018ce0:
  sb $zero, 108($s0)
L80018ce4:
  sh $v0, 48($s0)
L80018ce8:
  lw $ra, 20($sp)
L80018cec:
  lw $s0, 16($sp)
L80018cf0:
  jr $ra
L80018cf4:
  addiu $sp, $sp, 24
L80018cf8:
  addiu $sp, $sp, -16
L80018cfc:
  addu $a0, $zero, $zero
L80018d00:
  lw $a1, 704($gp)
L80018d04:
  addu $v1, $sp, $zero
L80018d08:
  addu $v0, $a1, $a0
L80018d0c:
  lbu $v0, 26($v0)
L80018d10:
  addiu $a0, $a0, 1
L80018d14:
  sll $v0, $v0, 0x18
L80018d18:
  sra $v0, $v0, 0x18
L80018d1c:
  sh $v0, 0($v1)
L80018d20:
  slti $v0, $a0, 5
L80018d24:
  bne $v0, $zero, L80018d08
L80018d28:
  addiu $v1, $v1, 2
L80018d2c:
  addiu $a3, $zero, 17
L80018d30:
  lui $v0, 0x8016
L80018d34:
  addiu $t1, $v0, -15324
L80018d38:
  lui $t0, 0x4
L80018d3c:
  ori $t0, $t0, 0x8000
L80018d40:
  addu $a0, $zero, $zero
L80018d44:
  addu $a2, $sp, $zero
L80018d48:
  addu $a1, $a2, $zero
L80018d4c:
  lh $v1, 0($a1)
L80018d50:
  sll $zero, $zero, 0x0
L80018d54:
  bltz $v1, L80018d7c
L80018d58:
  sll $v0, $v1, 0x1
L80018d5c:
  addu $v0, $v0, $v1
L80018d60:
  sll $v0, $v0, 0x1
L80018d64:
  addu $v0, $v0, $t1
L80018d68:
  addu $v0, $v0, $t0
L80018d6c:
  lh $v0, 14844($v0)
L80018d70:
  sll $zero, $zero, 0x0
L80018d74:
  beq $v0, $a3, L80018d94
L80018d78:
  addiu $v0, $zero, -1
L80018d7c:
  addiu $a0, $a0, 1
L80018d80:
  slti $v0, $a0, 5
L80018d84:
  bne $v0, $zero, L80018d48
L80018d88:
  addiu $a2, $a1, 2
L80018d8c:
  j L80018dac
L80018d90:
  addu $v0, $zero, $zero
L80018d94:
  sh $v0, 0($a2)
L80018d98:
  addiu $a3, $a3, 1
L80018d9c:
  slti $v0, $a3, 22
L80018da0:
  bne $v0, $zero, L80018d44
L80018da4:
  addu $a0, $zero, $zero
L80018da8:
  addiu $v0, $zero, 1
L80018dac:
  jr $ra
L80018db0:
  addiu $sp, $sp, 16
