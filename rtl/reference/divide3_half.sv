module divide3_half (
  input logic clk, rst_n,
  output logic clk_div3
);
  logic [1:0] count;
  logic pos_window, neg_window;
  // A one-input-period high window repeats every three rising edges.
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      count <= 2'd0;
      pos_window <= 1'b0;
    end else begin
      count <= (count == 2'd2) ? 2'd0 : count + 2'd1;
      pos_window <= (count == 2'd0);
    end
  end
  // Extending the high window by half an input period makes 50% duty.
  always_ff @(negedge clk or negedge rst_n) begin
    if (!rst_n) neg_window <= 1'b0;
    else neg_window <= pos_window;
  end
  assign clk_div3 = pos_window | neg_window;
endmodule
