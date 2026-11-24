`timescale 1ns/1ps
module tb;
  reg clk=0,rst=1,in_valid=0,din=0;
  wire match;
  integer history=0,bits_seen=0,checks=0,w,k;
  bit expected;
  seq1101_valid dut(.*);
  always #5 clk=~clk;
  task step(input bit r,input bit v,input bit d);
    @(negedge clk); rst=r;in_valid=v;din=d;
    expected=0;
    if(r) begin history=0;bits_seen=0;end
    else if(v) begin history=((history<<1)|d)&15;bits_seen++;expected=(bits_seen>=4 && history==13);end
    @(posedge clk);#1;
    if(match!==expected) $fatal(1,"sequence mismatch word=%0d bit=%0d history=%0h",w,k,history);
    checks++;
  endtask
  initial begin
    for(w=0;w<1024;w++) begin
      step(1,0,0);
      for(k=9;k>=0;k--) begin
        step(0,1,(w>>k)&1);
        if(k%3==0) step(0,0,1); // Stalls clear match but retain partial prefix.
      end
    end
    step(1,1,1);step(0,1,1);step(0,1,1);step(1,0,0);step(0,1,0);step(0,1,1);
    $display("seq1101_valid PASS %0d edges, all 1024 ten-bit streams",checks);$finish;
  end
  initial begin #2000000;$fatal(1,"timeout");end
endmodule
