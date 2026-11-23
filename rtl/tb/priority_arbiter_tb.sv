`timescale 1ns/1ps
module tb;
  reg [3:0] req;
  wire [3:0] grant;
  wire valid;
  integer i,j,expected;
  priority_arbiter dut(.*);
  initial begin
    for(i=0;i<16;i=i+1) begin
      req=i; expected=0;
      // Independent reference: isolate the least significant set bit.
      if(i!=0) expected=i & (-i);
      #1;
      if(grant !== expected[3:0] || valid !== (i!=0))
        $fatal(1,"arbiter req=%b grant=%b valid=%b",req,grant,valid);
    end
    $display("PASS priority_arbiter: all 16 inputs incl zero and competing requests"); $finish;
  end
endmodule
