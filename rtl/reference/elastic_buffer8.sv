module elastic_buffer8 (
  input  logic       clk,
  input  logic       rst_n,  // Synchronous active-low reset
  input  logic       in_valid,
  output logic       in_ready,
  input  logic [7:0] in_data,
  output logic       out_valid,
  input  logic       out_ready,
  output logic [7:0] out_data
);
  // Empty storage can fill even if the consumer is stalled.
  // A full slot can be replaced on the SAME edge that consumes its old word.
  assign in_ready = rst_n && (!out_valid || out_ready);

  always_ff @(posedge clk) begin
    if (!rst_n) begin
      out_valid <= 1'b0;
      out_data  <= 8'd0;
    end else if (in_ready) begin
      out_valid <= in_valid;
      if (in_valid) begin
        out_data <= in_data;
      end
      // If only the old output was consumed, clear valid and keep stale data.
    end
    // Full + !out_ready: hold BOTH payload and valid until accepted.
  end
endmodule
