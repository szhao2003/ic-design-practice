`timescale 1ns/1ps
module tb;
  reg [7:0] data=0;
  wire even_bit=^data;
  reg [8:0] received=0;
  wire syndrome=^received;
  integer value,mask,bit_number,ones,checks=0;
  reg [8:0] codeword;
  initial begin
    for(value=0;value<256;value=value+1)begin
      data=value;#1;
      ones=0;for(bit_number=0;bit_number<8;bit_number=bit_number+1)ones=ones+data[bit_number];
      if(even_bit!==(ones%2==1))$fatal(1,"parity generator");
      codeword={even_bit,data};
      for(mask=0;mask<512;mask=mask+1)begin
        received=codeword^mask[8:0];#1;
        ones=0;for(bit_number=0;bit_number<9;bit_number=bit_number+1)ones=ones+mask[bit_number];
        if(syndrome!==(ones%2==1))$fatal(1,"parity error mask");
        checks=checks+1;
      end
    end
    $display("parity_review PASS %0d data/error-mask checks",checks);$finish;
  end
  initial begin #200000;$fatal(1,"timeout");end
endmodule
