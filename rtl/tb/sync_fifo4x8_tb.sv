`timescale 1ns/1ps
module tb;
  reg clk=0,rst=1,wr_en=0,rd_en=0;
  reg [7:0] din=0;
  wire [7:0] dout;
  wire rd_valid,full,empty;
  wire [2:0] count;
  integer queue[0:3];integer n=0,last=0,checks=0,trace,k,j,code;
  bit pop,push;
  sync_fifo4x8 dut(.*);
  always #5 clk=~clk;
  task step(input bit r,input bit w,input bit read_req,input [7:0] value);
    @(negedge clk);rst=r;wr_en=w;rd_en=read_req;din=value;
    pop=!r && read_req && n>0;push=!r && w && n<4;
    if(r) begin n=0;last=0;end
    else begin
      if(pop) begin last=queue[0];for(j=0;j<n-1;j++)queue[j]=queue[j+1];n--;end
      if(push) begin queue[n]=value;n++;end
    end
    @(posedge clk);#1;
    if(dout!==last[7:0] || rd_valid!==pop || count!==n[2:0] || full!==(n==4) || empty!==(n==0))
      $fatal(1,"FIFO mismatch trace=%0d step=%0d count=%0d got=%0d",trace,k,n,count);
    checks++;
  endtask
  initial begin
    for(trace=0;trace<4096;trace++)begin
      step(1,1,1,8'hff);code=trace;
      for(k=0;k<6;k++)begin step(0,(code>>1)&1,code&1,(trace+k*17)&255);code=code>>2;end
    end
    // Long pointer wraparound and reset with queued data.
    for(k=0;k<1000;k++)step(k%137==0,(k%7)!=0,(k%5)!=0,k&255);
    $display("sync_fifo4x8 PASS %0d edges, 4096 request traces",checks);$finish;
  end
  initial begin #2000000;$fatal(1,"timeout");end
endmodule
