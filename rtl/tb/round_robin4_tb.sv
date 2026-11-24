`timescale 1ns/1ps
module tb;
  reg clk=0,rst_n=0,accept=0;
  reg [3:0] req=0;
  wire [3:0] grant;
  wire valid;
  integer pointer=0,chosen,expected,offset,index,checks=0,p,mask,a,k;
  round_robin4 dut(.*);
  always #5 clk=~clk;
  task step(input bit reset_value,input [3:0] requests,input bit accepted);
    @(negedge clk); rst_n=reset_value; req=requests; accept=accepted;
    #1;
    if(reset_value) begin
      // Arithmetic model: select minimum cyclic distance among set request bits.
      chosen=-1; expected=0;
      for(offset=3;offset>=0;offset=offset-1) begin
        index=(pointer+offset)%4;
        if(requests[index]) chosen=index;
      end
      if(chosen>=0) expected=1<<chosen;
      if(grant !== expected[3:0] || valid !== (chosen>=0))
        $fatal(1,"RR pointer=%0d req=%b got=%b expected=%b",pointer,req,grant,expected[3:0]);
      if(accepted && chosen>=0) pointer=(chosen+1)%4;
    end else pointer=0;
    @(posedge clk); #1; checks=checks+1;
  endtask
  initial begin
    step(0,0,1);
    // Reach every pointer using an accepted single request, then all 16 masks,
    // with and without accept. Do not peek at DUT internals.
    for(p=0;p<4;p=p+1) for(mask=0;mask<16;mask=mask+1) for(a=0;a<2;a=a+1) begin
      step(0,0,0);
      step(1,1<<((p+3)%4),1);
      step(1,mask[3:0],0);
      step(1,mask[3:0],a[0]);
      step(1,4'b1111,0); // exposes pointer after accepted/no-accept transition
    end
    step(0,0,0);
    for(k=0;k<20;k=k+1) begin
      // All persistent requests: winners repeat 0,1,2,3 on actual services.
      step(1,4'b1111,1);
      repeat(3) step(1,4'b1111,0);
    end
    step(1,0,1); step(1,0,1); step(1,4'b1111,1);
    step(0,4'b1111,1); step(1,4'b1111,0);
    $display("PASS round_robin4: all pointer/request/accept states, fairness/stalls/reset (%0d checks)",checks); $finish;
  end
  initial begin #20000; $fatal(1,"timeout"); end
endmodule
