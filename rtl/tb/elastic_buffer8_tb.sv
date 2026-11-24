`timescale 1ns/1ps
module tb;
  reg clk=0,rst_n=0,in_valid=0,out_ready=0;
  reg [7:0] in_data=0;
  wire in_ready,out_valid;
  wire [7:0] out_data;
  integer size=0,checks=0,sent=0,received=0,i;
  reg [7:0] head=0;
  reg [31:0] random_state=32'h13a79f25;
  reg pending=0;
  reg [7:0] pending_data=0;
  reg did_input;
  elastic_buffer8 dut(.*);
  always #5 clk=~clk;

  task step(input bit reset_value,input bit iv,input [7:0] data_value,input bit rd);
    @(negedge clk); rst_n=reset_value; in_valid=iv; in_data=data_value; out_ready=rd;
    #1;
    did_input=0;
    if(!rst_n) size=0;
    else begin
      // Reference is a capacity-one FIFO. Compare OLD head before pop/push.
      if(out_valid !== (size==1)) $fatal(1,"old output validity mismatch");
      if(size==1 && out_data !== head) $fatal(1,"old payload overwritten");
      if(in_ready !== (size==0 || rd)) $fatal(1,"incorrect available capacity");
      if(size==1 && rd) begin size=0; received=received+1; end
      if(iv && in_ready) begin
        if(size!=0) $fatal(1,"accepted past capacity");
        head=data_value; size=1; sent=sent+1; did_input=1;
      end
    end
    if(!rst_n && in_ready !== 0) $fatal(1,"accepted during reset");
    @(posedge clk); #1;
    if(out_valid !== (size==1)) $fatal(1,"new output validity mismatch check=%0d",checks);
    if(size==1 && out_data !== head) $fatal(1,"new payload mismatch");
    if(!rst_n && out_data !== 0) $fatal(1,"reset data not zero");
    checks=checks+1;
  endtask
  initial begin
    step(0,1,8'haa,1);
    step(1,1,8'h11,0); // fill empty while consumer stalls
    repeat(5) step(1,1,8'h22,0); // source holds next word while full
    step(1,1,8'h22,1); // consume 11 and replace with 22
    step(1,0,0,1); // consume with no replacement; no duplicate output
    step(1,0,0,1);
    for(i=0;i<1000;i=i+1) begin
      random_state=random_state^(random_state<<13);
      random_state=random_state^(random_state>>17);
      random_state=random_state^(random_state<<5);
      if(!pending && random_state[0]) begin
        pending=1; pending_data=sent[7:0];
      end
      step(1,pending,pending_data,random_state[3]);
      if(did_input) pending=0;
    end
    if(pending) step(1,1,pending_data,1);
    step(1,0,0,1); step(1,0,0,1);
    if(sent!=received) $fatal(1,"lost/duplicated word sent=%0d received=%0d",sent,received);
    step(1,1,8'hcc,0);
    step(0,1,8'hdd,1); // reset cancels buffered CC, not a successful output
    step(1,0,0,1);
    $display("PASS elastic_buffer8: %0d checks, scoreboard/stalls/replace/drain/reset",checks); $finish;
  end
  initial begin #20000; $fatal(1,"timeout"); end
endmodule
