module even_divider #(
  parameter integer DIVIDE = 10
) (
  input logic clk, rst, en,
  output logic divided, tick
);
  // Contract: even DIVIDE, 2 <= DIVIDE <= 1024.
  localparam integer HALF = DIVIDE / 2;
  localparam integer BITS = (HALF <= 1) ? 1 : $clog2(HALF);
  logic [BITS-1:0] half_count;
  always_ff @(posedge clk) begin
    if (rst) begin
      half_count <= '0;
      divided <= 1'b0;
      tick <= 1'b0;
    end else begin
      // A stopped divider holds its phase; events never extend over a stall.
      tick <= 1'b0;
      if (en) begin
        if (half_count == HALF - 1) begin
          half_count <= '0;
          divided <= !divided;
          // The falling transition completes one full DIVIDE-edge period.
          tick <= divided;
        end else begin
          half_count <= half_count + 1'b1;
        end
      end
    end
  end
endmodule
