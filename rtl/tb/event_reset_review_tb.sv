`timescale 1ns/1ps
module tb;
  integer a=0,b=0;
  reg clk=0,rst=0;
  reg q_sync,q_async;
  bit events_done=0,reset_done=0;
  always #5 clk=~clk;
  always @(posedge clk)begin
    if(rst)q_sync<=0;else q_sync<=1;
  end
  always @(posedge clk or posedge rst)begin
    if(rst)q_async<=0;else q_async<=1;
  end
  initial begin
    #1;a<=5;b=a;
    $display("D0 a=%0d b=%0d",a,b);
    $strobe("S0 a=%0d b=%0d",a,b);
    if(a!=0 || b!=0)$fatal(1,"active observation");
    #0;$display("D1 a=%0d b=%0d",a,b);
    if(a!=0 || b!=0)$fatal(1,"inactive observation");
    #1;$display("D2 a=%0d b=%0d",a,b);
    if(a!=5 || b!=0)$fatal(1,"post-NBA observation");
    events_done=1;
  end
  task automatic check(input bit s,ar);
    if(q_sync!==s || q_async!==ar)$fatal(1,"reset trace time=%0t",$time);
  endtask
  initial begin
    #6;check(1,1);
    #1;rst=1;#1;check(1,0); // 8ns, asynchronous assertion already applied.
    #1;rst=0;#1;check(1,0); // 10ns, deassertion does not reload the data.
    #6;check(1,1);          // 16ns, next active clock edge has occurred.
    #6;rst=1;#4;check(0,0);// 26ns, both reset at the 25ns edge.
    #2;rst=0;#2;check(0,0);// 30ns, both await next edge.
    #6;check(1,1);reset_done=1;
  end
  initial begin wait(events_done && reset_done);$display("event_reset_review PASS");$finish;end
  initial begin #100;$fatal(1,"timeout");end
endmodule
