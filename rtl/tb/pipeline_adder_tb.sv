`timescale 1ns/1ps
module tb;
  reg clk=0,rst_n=0,in_valid=0;
  reg [31:0] a=0,b=0;
  wire out_valid;
  wire [32:0] sum;
  reg pending_valid=0;
  reg [32:0] pending_sum=0,expected_sum=0;
  reg expected_valid;
  reg [31:0] seed=32'h36ab9521;
  integer i,checks=0;
  pipeline_adder dut(.*);
  always #5 clk=~clk;
  task step(input bit reset_value,input bit valid_value,input [31:0] av,input [31:0] bv);
    @(negedge clk); rst_n=reset_value; in_valid=valid_value; a=av; b=bv;
    if(!rst_n) begin
      expected_valid=0; expected_sum=0; pending_valid=0; pending_sum=0;
    end else begin
      expected_valid=pending_valid;
      if(pending_valid) expected_sum=pending_sum;
      pending_valid=in_valid;
      if(in_valid) pending_sum={1'b0,a}+{1'b0,b};
    end
    @(posedge clk); #1;
    if(out_valid !== expected_valid || sum !== expected_sum)
      $fatal(1,"adder check %0d got=%h/%b expected=%h/%b",checks,sum,out_valid,expected_sum,expected_valid);
    checks=checks+1;
  endtask
  initial begin
    step(0,1,'1,'1);
    step(1,1,0,0);
    step(1,1,32'h0000ffff,1); // low carry
    step(1,1,32'hffffffff,1); // 33rd result bit
    step(1,1,'1,'1);
    step(1,0,0,0); step(1,0,0,0);
    for(i=0;i<300;i=i+1) begin
      // Deterministic xorshift, independent full-width arithmetic scoreboard.
      seed=seed^(seed<<13); seed=seed^(seed>>17); seed=seed^(seed<<5);
      step(1,i%7!=0,seed,seed^32'hacd105ef);
    end
    step(1,1,32'h12345678,32'hfedcba98);
    step(0,1,'1,'1); // reset flushes an in-flight input
    step(1,0,0,0); step(1,1,1,2); step(1,0,0,0);
    $display("PASS pipeline_adder: carries/continuous/bubbles/reset flush (%0d checks)",checks); $finish;
  end
  initial begin #10000; $fatal(1,"timeout"); end
endmodule
