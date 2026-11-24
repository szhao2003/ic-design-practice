`timescale 1ns/1ps
module tb;
  reg clk=0,rst=1,sample_valid=0,sample=0;
  wire rise,fall,any_edge;
  reg accepted[0:31];
  integer length=0,checks=0,pattern,k,mode;
  reg er,ef;
  sample_edges dut(.*);
  always #5 clk=~clk;
  task automatic step(input bit s,v,reset_now);
    @(negedge clk);sample=s;sample_valid=v;rst=reset_now;
    er=0;ef=0;
    if(reset_now)length=0;
    else if(v)begin
      accepted[length]=s;length=length+1;
      if(length>=2)begin
        er=accepted[length-2]==0 && accepted[length-1]==1;
        ef=accepted[length-2]==1 && accepted[length-1]==0;
      end
    end
    @(posedge clk);#1;
    if(rise!==er || fall!==ef || any_edge!==(er||ef))$fatal(1,"accepted-sample event mismatch check=%0d",checks);
    checks=checks+1;
  endtask
  initial begin
    // All accepted ten-bit strings, with three different stall schedules.
    for(pattern=0;pattern<1024;pattern=pattern+1)for(mode=0;mode<3;mode=mode+1)begin
      step(pattern[0],1,1);
      for(k=0;k<10;k=k+1)begin
        if(mode==1 && k%3==0)step(~((pattern>>k)&1),0,0);
        if(mode==2)begin step(0,0,0);step(1,0,0);end
        step((pattern>>k)&1,1,0);
      end
    end
    step(1,1,1);step(1,1,0); // No false rise after a high first sample.
    step(0,1,0);step(1,1,0);step(0,1,0);
    step(1,0,0);step(0,0,0);step(1,1,0);
    step(0,1,1);step(0,0,0);step(0,1,0);step(1,1,0);
    $display("sample_edges PASS %0d checks, all 1024 streams and three stall schedules",checks);$finish;
  end
  initial begin #2000000;$fatal(1,"timeout");end
endmodule
