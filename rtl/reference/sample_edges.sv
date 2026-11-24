module sample_edges (
  input logic clk, rst, sample_valid, sample,
  output logic rise, fall, any_edge
);
  logic have_history, previous;
  always_ff @(posedge clk) begin
    if (rst) begin
      have_history <= 1'b0;
      previous <= 1'b0;
      rise <= 1'b0;
      fall <= 1'b0;
      any_edge <= 1'b0;
    end else begin
      // Invalid cycles clear events but do not consume a sample.
      rise <= 1'b0;
      fall <= 1'b0;
      any_edge <= 1'b0;
      if (sample_valid) begin
        if (have_history) begin
          rise <= !previous && sample;
          fall <= previous && !sample;
          any_edge <= previous ^ sample;
        end
        // The first valid sample establishes a baseline, not an event.
        previous <= sample;
        have_history <= 1'b1;
      end
    end
  end
endmodule
