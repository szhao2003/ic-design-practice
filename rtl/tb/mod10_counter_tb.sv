`timescale 1ns/1ps
module tb;
  reg clk=0, rst_n=0, en=0;
  wire [3:0] count;
  wire tick;
  integer model=0, expected_tick=0, checks=0;
  mod10_counter dut(.*);
  always #5 clk=~clk;
  task step(input bit reset_value, input bit enable_value);
    @(negedge clk); rst_n=reset_value; en=enable_value;
    if (!rst_n) begin model=0; expected_tick=0; end
    else begin
      expected_tick=en && model==9;
      if (en) model=(model+1)%10;
    end
    @(posedge clk); #1;
    if (count !== model[3:0] || tick !== expected_tick[0])
      $fatal(1,"counter check %0d: count=%0d tick=%b expected=%0d/%0d",checks,count,tick,model,expected_tick);
    checks=checks+1;
  endtask
  initial begin
    step(0,1);
    repeat(10) step(1,1);
    step(1,0); // wrap pulse MUST clear when disabled
    repeat(10) step(1,0);
    repeat(30) begin step(1,1); step(1,0); end
    step(0,1); step(1,0);
    $display("PASS mod10_counter: %0d reset/enable/wrap/stall checks",checks); $finish;
  end
  initial begin #10000; $fatal(1,"timeout"); end
endmodule
