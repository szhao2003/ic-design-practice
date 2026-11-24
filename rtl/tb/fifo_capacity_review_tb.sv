`timescale 1ns/1ps
module capacity_case #(parameter integer A=4,EXPECTED_ACCEPT=31)(output reg done=0);
  reg wclk=0,rclk=0,wrst_n=1,rrst_n=1,winc=0,rinc=0;
  reg [7:0] wdata=0;
  wire wfull,rempty,rvalid;
  wire [7:0] rdata;
  integer offered=0,accepted=0,read_count=0,peak=0;
  reg [7:0] queue[0:31],expected=0;
  reg take;
  async_fifo_gray #(.WIDTH(8),.ADDR_BITS(A)) dut(.*);
  // Traffic starts at 100ns; write edges at 100+12.5n, read at 103+20k.
  initial begin #93.75;forever #6.25 wclk=~wclk;end
  initial begin #93;forever #10 rclk=~rclk;end
  always @(negedge wclk) begin
    winc=(offered<32);
    wdata=offered;
  end
  always @(posedge wclk)begin
    if(wrst_n && winc)begin
      offered=offered+1;
      if(!wfull)begin queue[accepted]=wdata;accepted=accepted+1;end
      if(accepted-read_count>peak)peak=accepted-read_count;
    end
  end
  always @(posedge rclk)begin
    take=rrst_n && rinc && !rempty;
    if(take)begin
      if(read_count>=accepted)$fatal(1,"capacity underflow");
      expected=queue[read_count];read_count=read_count+1;
    end
    #0.1;
    if(rrst_n && (rvalid!==take || rdata!==expected))$fatal(1,"capacity data ordering");
  end
  initial begin
    #0.2;wrst_n=0;rrst_n=0;
    #80;wrst_n=1;rrst_n=1;
    winc=1;rinc=1;wdata=0;
    #1400;
    if(offered!=32 || accepted!=EXPECTED_ACCEPT || read_count!=accepted)$fatal(1,"capacity A=%0d offered=%0d accepted=%0d read=%0d",A,offered,accepted,read_count);
    if(A>=4 && peak!=15)$fatal(1,"capacity peak mismatch");
    $display("FIFO depth=%0d offered=%0d accepted=%0d peak=%0d PASS",1<<A,offered,accepted,peak);
    done=1;
  end
endmodule
module tb;
  wire a,b,c;
  capacity_case #(.A(3),.EXPECTED_ACCEPT(23)) c0(a);
  capacity_case #(.A(4),.EXPECTED_ACCEPT(31)) c1(b);
  capacity_case #(.A(5),.EXPECTED_ACCEPT(32)) c2(c);
  initial begin wait(a&&b&&c);$display("fifo_capacity_review PASS");$finish;end
  initial begin #2000;$fatal(1,"timeout");end
endmodule
