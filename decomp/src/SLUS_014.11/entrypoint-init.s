.set noreorder
.set noat

.section .text.entrypoint_init,"ax",@progbits
.align 2
.global entrypoint_init

entrypoint_init:
  lui $v0, 0x800a
  addiu $v0, $v0, -20336
