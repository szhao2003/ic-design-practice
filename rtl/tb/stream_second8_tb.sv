`timescale 1ns/1ps
module tb;
  reg clk=0,rst=1,start=0,in_valid=0;
  reg [7:0] din=0;
  wire second_valid;
  wire [7:0] second_value,second_count;
  integer histogram[0:255];integer i,j,found,second,expected_count,checks=0,frame,k;
  stream_second8 dut(.*);
  always #5 clk=~clk;
  task step(input bit r,input bit s,input bit v,input [7:0] value);
    @(negedge clk);rst=r;start=s;in_valid=v;din=value;
    if(r||s)for(i=0;i<256;i++)histogram[i]=0;
    else if(v)histogram[value]++;
    found=0;second=0;expected_count=0;
    for(i=0;i<256;i++)if(histogram[i]>0)begin
      found++;
      if(found==2)begin second=i;expected_count=histogram[i];end
    end
    @(posedge clk);#1;
    if(second_valid!==(found>=2) || second_value!==second[7:0] || second_count!==expected_count[7:0])
      $fatal(1,"second-min mismatch frame=%0d k=%0d expected=%0d/%0d got=%0d/%0d",frame,k,second,expected_count,second_value,second_count);
    checks++;
  endtask
  initial begin
    step(1,0,0,0);
    for(frame=0;frame<300;frame++)begin
      step(0,1,1,8'hff); // start wins over valid.
      for(k=0;k<40;k++)begin
        if(frame%3==0)j=(frame+k*13)%17;
        else if(frame%3==1)j=255-k;
        else j=frame%256;
        step(0,0,k%7!=0,j[7:0]);
      end
    end
    step(0,1,0,0);step(0,0,1,255);step(0,0,1,255);step(0,0,1,0);step(0,0,1,1);step(0,0,1,1);
    step(1,0,1,7);
    $display("stream_second8 PASS %0d edges vs histogram oracle",checks);$finish;
  end
  initial begin #2000000;$fatal(1,"timeout");end
endmodule
