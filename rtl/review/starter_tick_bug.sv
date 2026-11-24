module starter_tick_bug(input logic clk, rst, en,
                        output logic [1:0] count, output logic tick);
  always_ff @(posedge clk) begin
    if (rst) begin count <= 2'd0; tick <= 1'b0; end
    else if (en) begin
      if (count == 2'd3) begin count <= 2'd0; tick <= 1'b1; end
      else begin count <= count + 2'd1; tick <= 1'b0; end
    end
  end
endmodule
