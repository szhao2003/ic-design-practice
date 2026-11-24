`timescale 1ns/1ps
module debounce_small #(parameter integer CPM=1)(output reg done=0);
  reg clk=0,rst=1,sample=0;
  reg [1:0] cfg=0;
  wire stable,changed;
  integer cycle=0,checks=0,i,c,pattern,k;
  integer last_restart=0;
  reg expected=0,event_expected=0,last_sample=0;
  reg [1:0] last_cfg=0;
  debounce_cfg #(.CYCLES_PER_MS(CPM)) dut(.*);
  initial begin
    while(!done) begin #1;clk=~clk;end
  end
  // Reference uses the uninterrupted run's starting timestamp, not a DUT counter.
  always @(posedge clk) begin
    cycle=cycle+1;event_expected=0;
    if(rst) begin expected=0;last_cfg=cfg;last_restart=cycle;last_sample=0;end
    else if(cfg!=last_cfg) begin last_cfg=cfg;last_restart=cycle;last_sample=expected;end
    else if(sample==expected) begin last_restart=cycle;last_sample=sample;end
    else begin
      if(sample!=last_sample)last_restart=cycle-1;
      last_sample=sample;
      if(cycle-last_restart==5*CPM*(1+cfg))begin
        expected=sample;event_expected=1;last_restart=cycle;
      end
    end
    #0.1;
    if(stable!==expected || changed!==event_expected)$fatal(1,"debounce CPM=%0d cycle=%0d",CPM,cycle);
    checks=checks+1;
  end
  task automatic step(input bit s,input [1:0] setting,input bit reset_now=0);
    @(negedge clk);sample=s;cfg=setting;rst=reset_now;
    @(posedge clk);#0.2;
  endtask
  initial begin
    step(0,0,1);step(0,0,0);
    for(c=0;c<4;c=c+1)begin
      step(0,c[1:0]);
      repeat(5*CPM*(c+1)-1)step(1,c[1:0]);
      step(0,c[1:0]); // One matching sample invalidates an almost-complete run.
      repeat(5*CPM*(c+1)+3)step(1,c[1:0]);
      repeat(5*CPM*(c+1)+3)step(0,c[1:0]);
    end
    for(pattern=0;pattern<1024;pattern=pattern+1)begin
      step(0,0,1);step(0,0,0);
      for(k=0;k<10;k=k+1)step((pattern>>k)&1,0);
    end
    // Changes while counting, including a smaller threshold, discard the run.
    for(i=0;i<4000;i=i+1)step((i*17+(i>>3))%11<8,(i/13)%4,i%211==0);
    $display("debounce_cfg CPM=%0d PASS %0d timestamp-model checks",CPM,checks);done=1;
  end
endmodule
module debounce_default(output reg done=0);
  reg clk=0,rst=1,sample=0;
  reg [1:0] cfg=3;
  wire stable,changed;
  debounce_cfg dut(.*);
  always #1 clk=~clk;
  initial begin
    repeat(2)@(negedge clk);
    rst=0;sample=1;
    repeat(999999)@(posedge clk);
    #0.1;if(stable!==0 || changed!==0)$fatal(1,"20ms accepted early");
    @(posedge clk);#0.1;
    if(stable!==1 || changed!==1)$fatal(1,"millionth sample missing");
    @(posedge clk);#0.1;if(changed!==0)$fatal(1,"event repeated");
    @(negedge clk);rst=1;cfg=0;
    @(negedge clk);rst=0;sample=1;
    repeat(249999)@(posedge clk);
    #0.1;if(stable!==0 || changed!==0)$fatal(1,"5ms accepted early");
    @(posedge clk);#0.1;if(stable!==1 || changed!==1)$fatal(1,"250000th sample missing");
    $display("debounce_cfg default PASS 250000/1000000 sample boundaries");done=1;
  end
endmodule
module tb;
  wire a,b,c;
  debounce_small #(.CPM(1)) s0(a);
  debounce_small #(.CPM(7)) s1(b);
  debounce_default s2(c);
  initial begin wait(a&&b&&c);$display("debounce_cfg PASS");$finish;end
  initial begin #4000000;$fatal(1,"timeout");end
endmodule
