module starter_tick_fixed(input logic clk, rst, en,
                          output logic [1:0] count, output logic tick);
  always_ff @(posedge clk) begin
    if (rst) begin count <= 2'd0; tick <= 1'b0; end
    else begin
      tick <= 1'b0;
      if (en) begin
        if (count == 2'd3) begin count <= 2'd0; tick <= 1'b1; end
        else count <= count + 2'd1;
      end
    end
  end
endmodule
