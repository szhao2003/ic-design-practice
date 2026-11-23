module pulse_toggle_cdc (
  input  logic src_clk,
  input  logic src_rst_n,  // Async assert; externally synchronized release
  input  logic src_pulse,
  input  logic dst_clk,
  input  logic dst_rst_n,
  output logic dst_pulse
);
  logic src_toggle;
  (* ASYNC_REG = "TRUE" *) logic sync1, sync2;
  logic sync2_d;

  // Keep an event as a level change until the next source event.
  always_ff @(posedge src_clk or negedge src_rst_n) begin
    if (!src_rst_n) begin
      src_toggle <= 1'b0;
    end else if (src_pulse) begin
      src_toggle <= ~src_toggle;
    end
  end

  // Only sync2 may feed functional change detection; sync1 stays inside the chain.
  always_ff @(posedge dst_clk or negedge dst_rst_n) begin
    if (!dst_rst_n) begin
      sync1     <= 1'b0;
      sync2     <= 1'b0;
      sync2_d   <= 1'b0;
      dst_pulse <= 1'b0;
    end else begin
      sync1     <= src_toggle;
      sync2     <= sync1;
      sync2_d   <= sync2;
      // NBA reads old sync2/sync2_d: register the pulse one edge later.
      dst_pulse <= sync2 ^ sync2_d;
    end
  end
endmodule
