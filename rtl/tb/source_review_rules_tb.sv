`timescale 1ns/1ps
module tb;
  integer a=3,y=99,marker=0,i,expected;
  reg signed [3:0] signed_input;
  reg signed [4:0] wide,magnitude;
  reg [2:0] q;
  integer orbit[0:7];
  function automatic integer no_args(); no_args=17;endfunction
  function automatic void set_marker(); marker=23;endfunction
  task automatic delayed(input integer x,output integer z);
    z=x+1;#2;z=z+10;
  endtask
  initial begin
    if(no_args()!=17)$fatal(1,"no-argument function");
    set_marker();if(marker!=23)$fatal(1,"void function");
    for(i=0;i<16;i++)begin
      signed_input=i[3:0];wide=signed_input;magnitude=(wide<0)?-wide:wide;
      expected=(i<8)?i:16-i;
      if(magnitude!==expected[4:0])$fatal(1,"extended absolute value");
    end
    orbit[0]=1;orbit[1]=3;orbit[2]=7;orbit[3]=6;orbit[4]=5;orbit[5]=2;orbit[6]=4;orbit[7]=1;
    q=1;for(i=0;i<8;i++)begin if(q!==orbit[i][2:0])$fatal(1,"LFSR orbit");q={q[1:0],q[2]^q[0]};end
    q=0;q={q[1:0],q[2]^q[0]};if(q!==0)$fatal(1,"LFSR zero orbit");
    fork
      begin delayed(a,y);end
      begin
        #0.5;if(a!=3||y!=99)$fatal(1,"task at .5");
        #0.5;a=8;
        #0.5;if(a!=8||y!=99)$fatal(1,"task at 1.5");
        #1;if(a!=8||y!=14)$fatal(1,"task at 2.5");
      end
    join
    $display("source_review_rules PASS: task copy-in/out, void/no-arg functions, abs and LFSR");$finish;
  end
  initial begin #100;$fatal(1,"timeout");end
endmodule
