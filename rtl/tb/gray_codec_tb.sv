`timescale 1ns/1ps
module codec_case #(parameter integer W=8)(output reg done=0);
  reg [W-1:0] binary_in=0,gray_in=0;
  wire [W-1:0] gray_out,binary_out;
  integer inverse[0:(1<<W)-1];
  integer value,bit_number,encoded,checks=0;
  gray_codec #(.WIDTH(W)) dut(.*);
  initial begin
    // Build an inverse lookup from the bit-by-bit definition, without the
    // prefix-XOR decoder used by the implementation.
    for(value=0;value<(1<<W);value=value+1)begin
      encoded=0;
      for(bit_number=0;bit_number<W;bit_number=bit_number+1)
        encoded=encoded+((((value>>bit_number)&1)+((value>>(bit_number+1))&1))%2)*(1<<bit_number);
      inverse[encoded]=value;
      binary_in=value;#1;
      if(gray_out!==encoded[W-1:0])$fatal(1,"Gray encode W=%0d value=%0d",W,value);
      checks=checks+1;
    end
    // Feed all possible independent Gray inputs, in reverse numeric order.
    for(value=(1<<W)-1;value>=0;value=value-1)begin
      gray_in=value;#1;
      if(binary_out!==inverse[value][W-1:0])$fatal(1,"Gray decode W=%0d",W);
      checks=checks+1;
    end
    $display("gray_codec W=%0d PASS %0d exhaustive checks",W,checks);done=1;
  end
endmodule
module tb;
  wire a,b,c,d,e;
  codec_case #(.W(1)) c0(a);
  codec_case #(.W(2)) c1(b);
  codec_case #(.W(5)) c2(c);
  codec_case #(.W(8)) c3(d);
  codec_case #(.W(12)) c4(e);
  initial begin wait(a&&b&&c&&d&&e);$display("gray_codec PASS");$finish;end
  initial begin #20000;$fatal(1,"timeout");end
endmodule
