`timescale 1ns/1ps
module fifo_case #(
  parameter integer A=2, W=8, WH=5, RH=7
) (output reg done=0);
  localparam integer D=1<<A;
  reg wclk=0,rclk=0,wrst_n=0,rrst_n=0,winc=0,rinc=0;
  reg [W-1:0] wdata=0;
  wire wfull,rempty,rvalid;
  wire [W-1:0] rdata;
  reg [W-1:0] queue[0:8191];
  reg [W-1:0] expected=0;
  integer head=0,tail=0,mode=0,wcycle=0,rcycle=0,writes=0,reads=0,round;
  reg accepted;
  async_fifo_gray #(.WIDTH(W),.ADDR_BITS(A)) dut(.*);
  always #(WH) wclk=~wclk;
  // Odd write-edge timestamps and even read-edge timestamps avoid TB races.
  initial begin #1;forever #(RH) rclk=~rclk;end
  always @(negedge wclk) begin
    wcycle=wcycle+1;
    winc=(mode==1)||(mode==3 && wcycle%7!=2 && wcycle%7!=3);
    wdata=wcycle*37+(wcycle>>3);
  end
  always @(negedge rclk) begin
    rcycle=rcycle+1;
    rinc=(mode==2)||(mode==3 && rcycle%9<6);
  end
  always @(posedge wclk) begin
    if(!wrst_n) tail=0;
    else if(winc && !wfull) begin
      if(tail-head>=D)$fatal(1,"overflow A=%0d",A);
      queue[tail]=wdata;tail=tail+1;writes=writes+1;
    end
  end
  always @(posedge rclk) begin
    if(!rrst_n) begin head=0;expected=0;end
    accepted=rrst_n && rinc && !rempty;
    if(accepted) begin
      if(head>=tail)$fatal(1,"underflow A=%0d",A);
      expected=queue[head];head=head+1;reads=reads+1;
    end
    #0.1;
    if(rvalid!==accepted || rdata!==expected)$fatal(1,"FIFO data/valid A=%0d",A);
  end
  initial begin
    for(round=0;round<3;round=round+1) begin
      mode=0;wrst_n=0;rrst_n=0;
      #1;
      if(wfull!==0 || rempty!==1 || rvalid!==0 || rdata!==0)$fatal(1,"reset outputs");
      repeat(4) @(negedge wclk);
      wrst_n=1;
      @(negedge rclk);rrst_n=1;
      repeat(4) @(negedge rclk);
      mode=1;repeat(D*5) @(negedge wclk);#0.2;
      if(!wfull || tail-head!=D)$fatal(1,"fill capacity");
      mode=2;repeat(D*7) @(negedge rclk);#0.2;
      if(!rempty || tail!=head)$fatal(1,"drain ordering");
      mode=3;repeat(1200) @(negedge wclk);
      // Reset the first two rounds with queued traffic; final round drains.
      if(round==2) begin
        mode=2;repeat(D*8) @(negedge rclk);#0.2;
        if(!rempty || tail!=head)$fatal(1,"final drain");
      end
      #0.3;
    end
    mode=0;
    if(writes<100 || reads<100)$fatal(1,"insufficient wrap coverage");
    $display("async FIFO A=%0d W=%0d PASS writes=%0d reads=%0d",A,W,writes,reads);
    done=1;
  end
endmodule
module tb;
  wire d0,d1,d2;
  fifo_case #(.A(2),.W(8),.WH(5),.RH(7)) c0(d0);
  fifo_case #(.A(3),.W(13),.WH(3),.RH(5)) c1(d1);
  fifo_case #(.A(4),.W(1),.WH(7),.RH(3)) c2(d2);
  initial begin wait(d0 && d1 && d2);$display("async_fifo_gray PASS three parameter/clock cases");$finish;end
  initial begin #1000000;$fatal(1,"timeout");end
endmodule
