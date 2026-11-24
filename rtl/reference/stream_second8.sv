module stream_second8 (
  input logic clk, rst, start, in_valid,
  input logic [7:0] din,
  output logic second_valid,
  output logic [7:0] second_value, second_count
);
  logic have_min;
  logic [7:0] min_value, min_count;
  always_ff @(posedge clk) begin
    if (rst || start) begin
      have_min <= 1'b0;
      second_valid <= 1'b0;
      min_value <= 8'd0;
      min_count <= 8'd0;
      second_value <= 8'd0;
      second_count <= 8'd0;
    end else if (in_valid) begin
      if (!have_min) begin
        have_min <= 1'b1;
        min_value <= din;
        min_count <= 8'd1;
      end else if (din < min_value) begin
        // The former minimum becomes the second DISTINCT value.
        second_valid <= 1'b1;
        second_value <= min_value;
        second_count <= min_count;
        min_value <= din;
        min_count <= 8'd1;
      end else if (din == min_value) begin
        min_count <= min_count + 8'd1;
      end else if (!second_valid || din < second_value) begin
        second_valid <= 1'b1;
        second_value <= din;
        second_count <= 8'd1;
      end else if (din == second_value) begin
        second_count <= second_count + 8'd1;
      end
    end
  end
endmodule
