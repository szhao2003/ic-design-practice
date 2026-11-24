module debounce3 (
  input logic clk, rst, sample,
  output logic stable, changed
);
  logic [1:0] run;
  // sample is already synchronous; this module is NOT a CDC synchronizer.
  always_ff @(posedge clk) begin
    if (rst) begin
      stable <= 1'b0;
      changed <= 1'b0;
      run <= 2'd0;
    end else begin
      changed <= 1'b0;
      if (sample == stable) run <= 2'd0;
      else if (run == 2'd2) begin
        stable <= sample;
        changed <= 1'b1;
        run <= 2'd0;
      end else run <= run + 2'd1;
    end
  end
endmodule
