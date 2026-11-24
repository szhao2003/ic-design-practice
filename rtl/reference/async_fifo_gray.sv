module async_fifo_gray #(
  parameter integer WIDTH = 8,
  parameter integer ADDR_BITS = 2
) (
  input logic wclk, wrst_n, winc,
  input logic [WIDTH-1:0] wdata,
  output logic wfull,
  input logic rclk, rrst_n, rinc,
  output logic [WIDTH-1:0] rdata,
  output logic rvalid, rempty
);
  // Contract: WIDTH >= 1, ADDR_BITS >= 2; capacity is 2**ADDR_BITS.
  localparam integer DEPTH = 1 << ADDR_BITS;
  localparam logic [ADDR_BITS:0] FULL_MASK = {2'b11, {(ADDR_BITS-1){1'b0}}};
  logic [WIDTH-1:0] mem [0:DEPTH-1];
  logic [ADDR_BITS:0] wb, wg, rb, rg;
  logic [ADDR_BITS:0] wb_next, wg_next, rb_next, rg_next;
  (* ASYNC_REG = "TRUE" *) logic [ADDR_BITS:0] rg_w1, rg_w2;
  (* ASYNC_REG = "TRUE" *) logic [ADDR_BITS:0] wg_r1, wg_r2;
  logic put, take;

  assign put = winc && !wfull;
  assign take = rinc && !rempty;
  assign wb_next = wb + {{ADDR_BITS{1'b0}}, put};
  assign rb_next = rb + {{ADDR_BITS{1'b0}}, take};
  assign wg_next = (wb_next >> 1) ^ wb_next;
  assign rg_next = (rb_next >> 1) ^ rb_next;

  // Only registered Gray pointers cross domains, through two stages.
  always_ff @(posedge wclk or negedge wrst_n) begin
    if (!wrst_n) begin
      rg_w1 <= '0;
      rg_w2 <= '0;
    end else begin
      rg_w1 <= rg;
      rg_w2 <= rg_w1;
    end
  end
  always_ff @(posedge rclk or negedge rrst_n) begin
    if (!rrst_n) begin
      wg_r1 <= '0;
      wg_r2 <= '0;
    end else begin
      wg_r1 <= wg;
      wg_r2 <= wg_r1;
    end
  end

  always_ff @(posedge wclk or negedge wrst_n) begin
    if (!wrst_n) begin
      wb <= '0;
      wg <= '0;
      wfull <= 1'b0;
    end else begin
      wb <= wb_next;
      wg <= wg_next;
      wfull <= (wg_next == (rg_w2 ^ FULL_MASK));
    end
  end
  // Memory is not reset. A read is permitted only after a published write.
  always_ff @(posedge wclk) begin
    if (wrst_n && put) mem[wb[ADDR_BITS-1:0]] <= wdata;
  end
  always_ff @(posedge rclk or negedge rrst_n) begin
    if (!rrst_n) begin
      rb <= '0;
      rg <= '0;
      rempty <= 1'b1;
      rdata <= '0;
      rvalid <= 1'b0;
    end else begin
      rb <= rb_next;
      rg <= rg_next;
      rempty <= (rg_next == wg_r2);
      rvalid <= take;
      if (take) rdata <= mem[rb[ADDR_BITS-1:0]];
    end
  end
endmodule
