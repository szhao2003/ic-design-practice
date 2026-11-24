`timescale 1ns/1ps
module tb;
  reg clk=0,rst=1,sample=0;
  wire stable,changed;
  integer history=0,seen=0,checks=0,w,k;
  bit expected=0,event_expected;
  debounce3 dut(.*);
  always #5 clk=~clk;
  task step(input bit r,input bit value);
    @(negedge clk);rst=r;sample=value;event_expected=0;
    if(r)begin expected=0;history=0;seen=0;end
    else begin
      history=((history<<1)|value)&7;if(seen<3)seen++;
      if(seen>=3 && ((history==7 && !expected)||(history==0 && expected)))begin expected=value;event_expected=1;end
    end
    @(posedge clk);#1;
    if(stable!==expected || changed!==event_expected)$fatal(1,"debounce mismatch word=%0d bit=%0d",w,k);
    checks++;
  endtask
  initial begin
    for(w=0;w<256;w++)begin step(1,0);for(k=7;k>=0;k--)step(0,(w>>k)&1);end
    for(k=0;k<20;k++)step(0,1);
    for(k=0;k<20;k++)step(0,0);
    $display("debounce3 PASS %0d edges vs three-sample history",checks);$finish;
  end
  initial begin #2000000;$fatal(1,"timeout");end
endmodule
