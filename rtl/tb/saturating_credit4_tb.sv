`timescale 1ns/1ps
module tb;
  reg clk=0,rst=0,inc=0,dec=0;
  wire [3:0] credit;
  integer expected=0,checks=0,s,c,k,delta;
  reg signed [7:0] signed_value;
  reg [7:0] unsigned_value;
  reg signed [7:0] signed_result,unsigned_result;
  reg [15:0] word;
  saturating_credit4 dut(.*);
  task step(input bit reset_value,input bit up,input bit down);
    clk=0; rst=reset_value; inc=up; dec=down;
    #4;
    // Read requests as integer net change, then clamp to the legal interval.
    if(reset_value) expected=0;
    else begin
      delta=0;
      if(up) delta=delta+1;
      if(down) delta=delta-1;
      expected=expected+delta;
      if(expected<0) expected=0;
      if(expected>15) expected=15;
    end
    clk=1;
    #1;
    if(credit !== expected[3:0]) $fatal(1,"credit mismatch expected=%0d got=%0d",expected,credit);
    checks=checks+1;
    #5; clk=0;
  endtask
  initial begin
    // Native language checks correspond to the two published SV questions.
    word=16'hD39A;
    if(word[5 +: 4] !== 4'hC) $fatal(1,"indexed part-select mismatch");
    signed_value=-8'sd40; unsigned_value=8'hD8;
    signed_result=signed_value >>> 2;
    unsigned_result=unsigned_value >>> 2;
    if(signed_result !== -8'sd10 || unsigned_result !== 8'sd54)
      $fatal(1,"signed shift semantics mismatch");
    // Every legal state and all four request combinations, seeded through pins.
    for(s=0;s<16;s=s+1) begin
      for(c=0;c<4;c=c+1) begin
        step(1,1,1);
        for(k=0;k<s;k=k+1) step(0,1,0);
        step(0,c[1],c[0]);
      end
    end
    // A synchronous reset must not act between edges.
    step(1,0,0); step(0,1,0);
    rst=1; #2;
    if(credit !== 4'd1) $fatal(1,"reset acted without a clock edge");
    step(1,1,0);
    // Long repeated endpoints and simultaneous requests.
    for(k=0;k<40;k=k+1) step(0,1,0);
    for(k=0;k<20;k=k+1) step(0,1,1);
    for(k=0;k<40;k=k+1) step(0,0,1);
    for(k=0;k<20;k=k+1) step(0,0,0);
    $display("saturating_credit4 PASS: %0d steps + 2 native SV semantic cases",checks);
    $finish;
  end
  initial begin #100000; $fatal(1,"timeout"); end
endmodule
