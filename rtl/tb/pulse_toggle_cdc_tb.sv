`timescale 1ns/1ps
module tb;
  reg src_clk=0,dst_clk=0,src_rst_n=0,dst_rst_n=0,src_pulse=0;
  wire dst_pulse;
  integer sent=0,received=0,i;
  bit previous=0;
  pulse_toggle_cdc dut(.*);
  always #5 src_clk=~src_clk;
  initial begin #3; forever #20 dst_clk=~dst_clk; end
  always @(posedge src_clk) if(src_rst_n && src_pulse) sent=sent+1;
  always @(posedge dst_clk) begin
    #1;
    if(!dst_rst_n) previous=0;
    else begin
      if(dst_pulse === 1'bx) $fatal(1,"unknown destination pulse");
      if(dst_pulse && previous) $fatal(1,"pulse stretched beyond one destination cycle");
      if(dst_pulse) received=received+1;
      if(received>sent) $fatal(1,"spurious destination event");
      previous=dst_pulse;
    end
  end
  task send_event(input integer offset);
    #(offset);
    @(negedge src_clk); src_pulse=1;
    @(negedge src_clk); src_pulse=0;
    #150; // source pulse + gap => >=160ns between accepted events
    if(received!=sent) $fatal(1,"lost event sent=%0d received=%0d",sent,received);
  endtask
  initial begin
    // Create actual reset edges, then release on each domain's falling edge.
    #1; src_rst_n=1; dst_rst_n=1;
    #1; src_rst_n=0; dst_rst_n=0;
    @(negedge src_clk); src_rst_n=1;
    @(negedge dst_clk); dst_rst_n=1;
    #200; if(received!=0) $fatal(1,"startup false event");
    for(i=0;i<12;i=i+1) send_event(i%4*10);
    // Coordinated reset, no pending events; neither side resets in isolation.
    src_rst_n=0; dst_rst_n=0; #50;
    @(negedge src_clk); src_rst_n=1;
    @(negedge dst_clk); dst_rst_n=1;
    #200; if(received!=sent) $fatal(1,"reset created event");
    send_event(0);
    $display("PASS pulse_toggle_cdc: %0d events, phases, one-cycle pulses, coordinated reset",sent); $finish;
  end
  initial begin #10000; $fatal(1,"timeout"); end
endmodule
