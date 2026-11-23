`timescale 1ns/1ps
module tb;
  reg clk=0,rst_n=0,in_valid=0;
  reg [7:0] data=0;
  wire out_valid;
  wire [3:0] count;
  integer model=0,i,j,checks=0;
  popcount8 dut(.*);
  always #5 clk=~clk;
  task step(input bit reset_value,input bit valid_value,input [7:0] value);
    @(negedge clk); rst_n=reset_value; in_valid=valid_value; data=value;
    if(!rst_n) model=0;
    else if(in_valid) begin
      model=0;
      for(j=0;j<8;j=j+1) model=model+data[j];
    end
    @(posedge clk); #1;
    if(count !== model[3:0] || out_valid !== (reset_value && valid_value))
      $fatal(1,"popcount data=%h count=%d valid=%b expected=%d",data,count,out_valid,model);
    checks=checks+1;
  endtask
  initial begin
    step(0,1,8'hff);
    for(i=0;i<256;i=i+1) begin
      step(1,1,i[7:0]);
      if(i%17==0) step(1,0,~i[7:0]);
    end
    step(0,1,8'hff); step(1,0,0); step(1,1,0); step(1,1,8'hff);
    $display("PASS popcount8: all 256 words plus bubbles/reset (%0d checks)",checks); $finish;
  end
  initial begin #10000; $fatal(1,"timeout"); end
endmodule
