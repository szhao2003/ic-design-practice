`timescale 1ns/1ps
module tb;
  reg clk=0,rst_n=0,in_valid=0,bit_in=0;
  wire is_divisible;
  integer value=0,checks=0,pattern,k;
  bit seen=0;
  prefix_mod5 dut(.*);
  always #5 clk=~clk;
  task step(input bit reset_value,input bit valid_value,input bit data_value);
    @(negedge clk); rst_n=reset_value; in_valid=valid_value; bit_in=data_value;
    if(!rst_n) begin value=0; seen=0; end
    else if(in_valid) begin value=value*2+bit_in; seen=1; end
    @(posedge clk); #1;
    if(is_divisible !== (seen && value%5==0))
      $fatal(1,"mod5 prefix=%d got=%b",value,is_divisible);
    checks=checks+1;
  endtask
  initial begin
    // All length-10 strings; compare EVERY prefix to a full integer model.
    for(pattern=0;pattern<1024;pattern=pattern+1) begin
      step(0,0,0);
      step(1,0,1); // empty prefix remains invalid
      for(k=9;k>=0;k=k-1) begin
        step(1,1,(pattern>>k)&1);
        if(k%3==0) step(1,0,~((pattern>>k)&1));
      end
    end
    step(0,1,1); step(1,1,0); // accepted zero IS divisible
    $display("PASS prefix_mod5: 1024 strings, every prefix, stalls/reset (%0d checks)",checks); $finish;
  end
  initial begin #200000; $fatal(1,"timeout"); end
endmodule
