module pipeline_adder (
  input  logic        clk,
  input  logic        rst_n,  // Synchronous active-low reset
  input  logic        in_valid,
  input  logic [31:0] a,
  input  logic [31:0] b,
  output logic        out_valid,
  output logic [32:0] sum
);
  logic        v1;
  logic [16:0] low_q;
  logic [15:0] a_hi_q, b_hi_q;
  logic [16:0] high_sum;

  // Stage 2 uses the high operands and carry from the SAME accepted input.
  assign high_sum = {1'b0, a_hi_q} + {1'b0, b_hi_q}
                  + {{16{1'b0}}, low_q[16]};

  // E0: capture the low sum/carry and the matching high halves.
  always_ff @(posedge clk) begin
    if (!rst_n) begin
      v1     <= 1'b0;
      low_q  <= '0;
      a_hi_q <= '0;
      b_hi_q <= '0;
    end else begin
      v1 <= in_valid;
      if (in_valid) begin
        low_q  <= {1'b0, a[15:0]} + {1'b0, b[15:0]};
        a_hi_q <= a[31:16];
        b_hi_q <= b[31:16];
      end
    end
  end

  // E1: NBA reads stage-1 OLD values, even when the next input is accepted.
  always_ff @(posedge clk) begin
    if (!rst_n) begin
      out_valid <= 1'b0;
      sum       <= '0;
    end else begin
      out_valid <= v1;
      if (v1) begin
        sum <= {high_sum, low_q[15:0]};
      end
    end
  end
endmodule
