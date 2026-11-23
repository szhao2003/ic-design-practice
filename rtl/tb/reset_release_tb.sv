`timescale 1ns/1ps
module tb;
  reg clk=0,arst_n=1,run_clk=1;
  wire rst_n;
  reset_release dut(.*);
  always #5 if(run_clk) clk=~clk;
  task release_check;
    @(negedge clk); #1; arst_n=1;
    #1; if(rst_n !== 0) $fatal(1,"release must not be asynchronous");
    @(posedge clk); #1; if(rst_n !== 0) $fatal(1,"released on first edge");
    @(posedge clk); #1; if(rst_n !== 1) $fatal(1,"not released on second edge");
  endtask
  initial begin
    #2; arst_n=0; #1;
    if(rst_n !== 0) $fatal(1,"assertion must be asynchronous");
    release_check();
    #2; arst_n=0; #1; if(rst_n !== 0) $fatal(1,"reassert failed");
    release_check();
    @(negedge clk); run_clk=0;
    #2; arst_n=0; #1; if(rst_n !== 0) $fatal(1,"stopped-clock assert failed");
    arst_n=1; #20; if(rst_n !== 0) $fatal(1,"released without clock");
    run_clk=1;
    @(posedge clk); #1; if(rst_n !== 0) $fatal(1,"stopped-clock first edge");
    @(posedge clk); #1; if(rst_n !== 1) $fatal(1,"stopped-clock second edge");
    $display("PASS reset_release: async assert, two-edge release, reassert, stopped clock"); $finish;
  end
  initial begin #1000; $fatal(1,"timeout"); end
endmodule
