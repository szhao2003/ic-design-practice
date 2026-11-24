module sync_fifo4x8 (
  input logic clk, rst, wr_en, rd_en,
  input logic [7:0] din,
  output logic [7:0] dout,
  output logic rd_valid, full, empty,
  output logic [2:0] count
);
  logic [7:0] mem [0:3];
  logic [1:0] wptr, rptr;
  logic put, take;
  assign full = (count == 3'd4);
  assign empty = (count == 3'd0);
  // Acceptance uses the state BEFORE this edge: no full/empty bypass.
  assign put = wr_en && !full;
  assign take = rd_en && !empty;
  always_ff @(posedge clk) begin
    if (rst) begin
      wptr <= 2'd0;
      rptr <= 2'd0;
      count <= 3'd0;
      dout <= 8'd0;
      rd_valid <= 1'b0;
    end else begin
      rd_valid <= take;
      if (put) begin
        mem[wptr] <= din;
        wptr <= wptr + 2'd1;
      end
      if (take) begin
        dout <= mem[rptr];
        rptr <= rptr + 2'd1;
      end
      case ({put, take})
        2'b10: count <= count + 3'd1;
        2'b01: count <= count - 3'd1;
        default: ;
      endcase
    end
  end
endmodule
