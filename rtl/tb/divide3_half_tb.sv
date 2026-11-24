`timescale 1ns/1ps
module tb;
  reg clk=0,rst_n=0;
  wire clk_div3;
  time last_rise=0,last_fall=0;
  integer rises=0,falls=0;
  divide3_half dut(.*);
  always #5 clk=~clk;
  always @(negedge rst_n)begin last_rise=0;last_fall=0;end
  always @(posedge clk_div3)if(rst_n)begin
    if(last_rise!=0 && $time-last_rise!=30)$fatal(1,"period is not 30ns");
    if(last_fall!=0 && $time-last_fall!=15)$fatal(1,"low phase is not 15ns");
    last_rise=$time;rises++;
  end
  always @(negedge clk_div3)if(rst_n && last_rise!=0)begin
    if($time-last_rise!=15)$fatal(1,"high phase is not 15ns");
    last_fall=$time;falls++;
  end
  initial begin
    #12;rst_n=1;
    #217;rst_n=0;#1;if(clk_div3!==0)$fatal(1,"reset did not clear output");
    #13;rst_n=1;
    #600;
    if(rises<20 || falls<20)$fatal(1,"insufficient edges");
    $display("divide3_half PASS %0d rising / %0d falling edges",rises,falls);$finish;
  end
  initial begin #5000;$fatal(1,"timeout");end
endmodule
