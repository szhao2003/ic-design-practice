module popcount8 (
  input  logic       clk,
  input  logic       rst_n,  // Synchronous active-low reset
  input  logic       in_valid,
  input  logic [7:0] data,
  output logic       out_valid,
  output logic [3:0] count
);
  logic [1:0] p0, p1, p2, p3;
  logic [2:0] s0, s1;
  logic [3:0] total;

  // Layer 1: each pair counts 0..2, so operands are extended to TWO bits.
  assign p0 = {1'b0, data[0]} + {1'b0, data[1]};
  assign p1 = {1'b0, data[2]} + {1'b0, data[3]};
  assign p2 = {1'b0, data[4]} + {1'b0, data[5]};
  assign p3 = {1'b0, data[6]} + {1'b0, data[7]};

  // Layers 2/3: groups of four need 3 bits; the final 0..8 count needs 4 bits.
  assign s0 = {1'b0, p0} + {1'b0, p1};
  assign s1 = {1'b0, p2} + {1'b0, p3};
  assign total = {1'b0, s0} + {1'b0, s1};

  // One output register stage, no internal pipeline: accept a new word each edge.
  always_ff @(posedge clk) begin
    if (!rst_n) begin
      count     <= 4'd0;
      out_valid <= 1'b0;
    end else begin
      out_valid <= in_valid;
      if (in_valid) begin
        count <= total;
      end
      // Invalid cycles clear valid but keep the old count as the interface allows.
    end
  end
endmodule
