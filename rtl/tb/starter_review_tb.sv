module tb;
  logic clk=0;
  always #5 clk=~clk;
  logic rst=1,en=0;
  logic [3:0] d=0,q;
  logic [1:0] buggy_count,fixed_count;
  logic buggy_tick,fixed_tick;
  starter_enable4 dut_en(clk,rst,en,d,q);
  starter_tick_bug dut_bug(clk,rst,en,buggy_count,buggy_tick);
  starter_tick_fixed dut_fix(clk,rst,en,fixed_count,fixed_tick);
  task step(input logic r,e,input logic [3:0] data);
    @(negedge clk); rst=r;en=e;d=data;
    @(posedge clk); #1;
  endtask
  initial begin
    step(1,0,0);
    if(q!==0 || buggy_count!==0 || fixed_count!==0 || buggy_tick!==0 || fixed_tick!==0) $fatal(1,"reset");
    step(0,1,9); if(q!==9) $fatal(1,"enable E1");
    step(0,0,3); if(q!==9) $fatal(1,"hold E2");
    step(0,0,5); if(q!==9) $fatal(1,"hold E3");
    step(0,1,6); if(q!==6) $fatal(1,"enable E4");
    step(1,1,15); if(q!==0) $fatal(1,"reset priority");
    step(0,1,0); step(0,1,0); step(0,1,0);
    if(buggy_count!==3 || fixed_count!==3 || buggy_tick!==0 || fixed_tick!==0) $fatal(1,"pulse initial state");
    step(0,1,0);
    if(buggy_count!==0 || fixed_count!==0 || buggy_tick!==1 || fixed_tick!==1) $fatal(1,"pulse E1");
    step(0,0,0);
    if(buggy_count!==0 || fixed_count!==0 || buggy_tick!==1 || fixed_tick!==0) $fatal(1,"pulse E2 demonstrates bug");
    step(0,1,0);
    if(buggy_count!==1 || fixed_count!==1 || buggy_tick!==0 || fixed_tick!==0) $fatal(1,"pulse E3");
    $display("starter snippets: enable hold + pulse bug and fix PASS");
    $finish;
  end
endmodule
