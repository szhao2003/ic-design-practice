`timescale 1ns/1ps
module tb;
  reg aclk=0,aresetn=0;
  reg [7:0] awaddr=0,araddr=0;
  reg [2:0] awprot=0,arprot=0;
  reg awvalid=0,wvalid=0,bready=0,arvalid=0,rready=0;
  reg [31:0] wdata=0;
  reg [3:0] wstrb=0;
  wire awready,wready,bvalid,arready,rvalid;
  wire [1:0] bresp,rresp;
  wire [31:0] rdata;
  reg [31:0] m0=0,m1=0,wd=0,erdata=0,mask;
  reg [7:0] wa=0;
  reg [3:0] ws=0;
  reg have_a=0,have_w=0,eb=0,er=0;
  reg [1:0] ebresp=0,erresp=0;
  reg ha,hw,hr,commit_write;
  integer checks=0,writes=0,reads=0,bconsumed=0,rconsumed=0,cycles=0,i;
  axil_regs2 dut(.*);
  always #5 aclk=~aclk;

  // Queue captured channels; compute bytes with a mask, independently of RTL slices.
  always @(posedge aclk) begin
    cycles=cycles+1;
    if(!aresetn) begin
      m0=0;m1=0;wa=0;wd=0;ws=0;have_a=0;have_w=0;
      eb=0;er=0;ebresp=0;erresp=0;erdata=0;
    end else begin
      if(awready!==(!have_a && !eb) || wready!==(!have_w && !eb) || arready!==!er)
        $fatal(1,"READY capacity contract cycle=%0d",cycles);
      ha=awvalid && awready;hw=wvalid && wready;hr=arvalid && arready;
      commit_write=have_a && have_w && !eb;
      if(eb && bready) begin eb=0;bconsumed=bconsumed+1;end
      if(er && rready) begin er=0;rconsumed=rconsumed+1;end
      // Read snapshot precedes same-edge commit in the independent model.
      if(hr) begin
        er=1;reads=reads+1;erresp=0;
        if(araddr==0)erdata=m0;
        else if(araddr==4)erdata=m1;
        else begin erdata=0;erresp=2;end
      end
      if(commit_write) begin
        writes=writes+1;eb=1;ebresp=(wa==0 || wa==4)?0:2;
        mask=0;
        for(i=0;i<4;i=i+1) if(ws[i]) mask=mask | (32'hff << (8*i));
        if(wa==0)m0=(m0 & ~mask)|(wd & mask);
        if(wa==4)m1=(m1 & ~mask)|(wd & mask);
        have_a=0;have_w=0;
      end
      if(ha)begin have_a=1;wa=awaddr;end
      if(hw)begin have_w=1;wd=wdata;ws=wstrb;end
    end
    #0.1;
    if(bvalid!==eb || bresp!==ebresp || rvalid!==er || rresp!==erresp || rdata!==erdata)
      $fatal(1,"response/snapshot mismatch cycle=%0d",cycles);
    if(dut.reg0!==m0 || dut.reg1!==m1)$fatal(1,"byte-mask register mismatch");
    checks=checks+1;
  end
  task automatic drive(input bit av,wv,arv,br,rr,input [7:0] aa,ra,input [31:0] data,input [3:0] strb);
    @(negedge aclk);
    awvalid=av;wvalid=wv;arvalid=arv;bready=br;rready=rr;
    awaddr=aa;araddr=ra;wdata=data;wstrb=strb;
    @(posedge aclk);#1;
  endtask
  task automatic idle(input integer n);
    integer k;
    for(k=0;k<n;k=k+1)drive(0,0,0,1,1,0,0,0,0);
  endtask
  task automatic write_pair(input [7:0] addr,input [31:0] data,input [3:0] strb,input integer order);
    if(order==0)begin
      drive(1,0,0,0,0,addr,0,0,0);idle(2);
      drive(0,1,0,0,0,0,0,data,strb);
    end else if(order==1)begin
      drive(0,1,0,0,0,0,0,data,strb);idle(2);
      drive(1,0,0,0,0,addr,0,0,0);
    end else drive(1,1,0,0,0,addr,0,data,strb);
    // Commit plus five stalled cycles: response and input capacity must hold.
    repeat(6)drive(0,0,0,0,0,0,0,32'hdeadbeef,15);
    idle(2);
  endtask
  task automatic read_addr(input [7:0] addr);
    drive(0,0,1,0,0,0,addr,0,0);
    repeat(4)drive(0,0,0,0,0,0,8'hff,0,0);
    idle(2);
  endtask
  integer n,mode;
  initial begin
    repeat(3)@(negedge aclk);aresetn=1;
    idle(1);
    // All sixteen strobes, both registers, all three AW/W arrival orders.
    for(n=0;n<16;n=n+1)for(mode=0;mode<3;mode=mode+1)begin
      write_pair((n%2)*4,32'h89abcdef ^ (n*32'h01020408),n[3:0],mode);
      read_addr(0);read_addr(4);
    end
    write_pair(8'h02,32'hffffffff,15,1);read_addr(2);
    write_pair(8'h08,32'hffffffff,15,0);read_addr(8);
    read_addr(0);read_addr(4);
    // Same-edge AR and commit reads the previous value. R remains stable
    // while a later write changes that register under a stalled R response.
    drive(1,1,0,0,0,0,0,32'h12345678,15);
    drive(0,0,1,0,0,0,0,0,0);
    repeat(3)drive(0,0,0,0,0,0,0,0,0);
    drive(0,0,0,1,0,0,0,0,0);
    drive(1,1,0,0,0,0,0,32'hfedcba98,15);
    repeat(5)drive(0,0,0,0,0,0,0,0,0);
    idle(2);read_addr(0);
    // A following request holds VALID/payload across B backpressure,
    // including the edge that consumes B; only the following edge accepts.
    drive(1,1,0,0,0,4,0,32'h13579bdf,15);
    drive(0,0,0,0,0,0,0,0,0);
    repeat(3)drive(1,1,0,0,0,4,0,32'h2468ace0,15);
    drive(1,1,0,1,0,4,0,32'h2468ace0,15);
    drive(1,1,0,0,0,4,0,32'h2468ace0,15);
    repeat(4)drive(0,0,0,0,0,0,0,0,0);
    idle(2);read_addr(4);
    // The next AR is also held across a stalled R and its consume edge.
    drive(0,0,1,0,0,0,0,0,0);
    repeat(3)drive(0,0,1,0,0,0,4,0,0);
    drive(0,0,1,0,1,0,4,0,0);
    drive(0,0,1,0,0,0,4,0,0);
    idle(2);
    // Reset flushes one unmatched address, then one unmatched data beat.
    drive(1,0,0,0,0,4,0,0,0);
    @(negedge aclk);aresetn=0;#1;
    if(bvalid!==0 || rvalid!==0)$fatal(1,"asynchronous reset");
    idle(2);@(negedge aclk);aresetn=1;idle(1);
    drive(0,1,0,0,0,0,0,32'hffffffff,15);
    @(negedge aclk);aresetn=0;idle(2);
    @(negedge aclk);aresetn=1;idle(1);read_addr(0);read_addr(4);
    write_pair(4,32'ha5a55a5a,15,2);read_addr(4);
    // Reset with both response channels stalled.
    drive(1,1,1,0,0,0,4,32'h11112222,15);
    repeat(3)drive(0,0,0,0,0,0,0,0,0);
    @(negedge aclk);aresetn=0;idle(2);
    @(negedge aclk);aresetn=1;idle(1);read_addr(0);read_addr(4);
    if(writes<50 || reads<100)$fatal(1,"insufficient coverage");
    $display("axil_regs2 PASS %0d checks %0d commits %0d reads",checks,writes,reads);$finish;
  end
  initial begin #1000000;$fatal(1,"timeout");end
endmodule
