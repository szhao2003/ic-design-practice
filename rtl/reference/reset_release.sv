module reset_release (
  input  logic clk,
  input  logic arst_n,
  output logic rst_n
);
  (* ASYNC_REG = "TRUE" *) logic [1:0] pipe;

  // Assertion clears both stages without waiting for clk.
  // Release shifts in ones: 00 -> 01 -> 11 on two destination edges.
  always_ff @(posedge clk or negedge arst_n) begin
    if (!arst_n) begin
      pipe <= 2'b00;
    end else begin
      pipe <= {pipe[0], 1'b1};
    end
  end

  assign rst_n = pipe[1];
endmodule
