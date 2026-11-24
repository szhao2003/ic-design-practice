`timescale 1ns/1ps
module divider_case #(parameter integer N=10)(output reg done=0);
  reg clk=0,rst=1,en=0;
  wire divided,tick;
  integer accepted=0,checks=0,k,round;
  reg expected_wave,expected_tick;
  even_divider #(.DIVIDE(N)) dut(.*);
  initial begin while(!done)begin #5;clk=~clk;end end
  task automatic step(input bit enable,reset_now);
    @(negedge clk);en=enable;rst=reset_now;
    if(reset_now)accepted=0;else if(enable)accepted=accepted+1;
    expected_wave=!reset_now && ((accepted/(N/2))%2!=0);
    expected_tick=!reset_now && enable && accepted%N==0;
    @(posedge clk);#1;
    if(divided!==expected_wave || tick!==expected_tick)$fatal(1,"divider N=%0d check=%0d",N,checks);
    checks=checks+1;
  endtask
  initial begin
    for(round=0;round<3;round=round+1)begin
      step(0,1);
      for(k=0;k<N*5+11;k=k+1)step(1,0);
      // Stalls at different phases; tick must clear even after a terminal edge.
      for(k=0;k<N*5+11;k=k+1)step(k%7!=2 && k%7!=3,0);
      step(0,0);step(0,0);step(1,1);step(0,0);
    end
    $display("even_divider N=%0d PASS %0d cumulative-edge checks",N,checks);done=1;
  end
endmodule
module tb;
  wire a,b,c,d;
  divider_case #(.N(2)) c0(a);
  divider_case #(.N(4)) c1(b);
  divider_case #(.N(10)) c2(c);
  divider_case #(.N(1024)) c3(d);
  initial begin wait(a&&b&&c&&d);$display("even_divider PASS");$finish;end
  initial begin #1000000;$fatal(1,"timeout");end
endmodule
