module mod10_counter (
  input  logic       clk,
  input  logic       rst_n,  // Synchronous active-low reset
  input  logic       en,
  output logic [3:0] count,
  output logic       tick
);
  always_ff @(posedge clk) begin
    if (!rst_n) begin
      count <= 4'd0;
      tick  <= 1'b0;
    end else begin
      // Clear EVERY edge; a disabled cycle must not stretch a prior wrap pulse.
      tick <= 1'b0;
      if (en) begin
        if (count == 4'd9) begin
          count <= 4'd0;
          tick  <= 1'b1;
        end else begin
          count <= count + 4'd1;
        end
      end
      // count intentionally holds when en=0; no illegal-state recovery required.
    end
  end
endmodule
