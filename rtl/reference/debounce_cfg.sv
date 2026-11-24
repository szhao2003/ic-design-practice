module debounce_cfg #(
  parameter integer CYCLES_PER_MS = 50000
) (
  input logic clk, rst, sample,
  input logic [1:0] cfg,
  output logic stable, changed
);
  // Contract: 1 <= CYCLES_PER_MS <= 50000; inputs are already synchronous.
  localparam integer BITS = $clog2(20 * CYCLES_PER_MS + 1);
  logic [BITS-1:0] run_count, threshold;
  logic [1:0] cfg_seen;
  always_comb begin
    case (cfg)
      2'b00: threshold = 5 * CYCLES_PER_MS;
      2'b01: threshold = 10 * CYCLES_PER_MS;
      2'b10: threshold = 15 * CYCLES_PER_MS;
      default: threshold = 20 * CYCLES_PER_MS;
    endcase
  end
  always_ff @(posedge clk) begin
    if (rst) begin
      stable <= 1'b0;
      changed <= 1'b0;
      run_count <= '0;
      cfg_seen <= cfg;
    end else begin
      changed <= 1'b0;
      if (cfg != cfg_seen) begin
        // A configuration change discards both the partial run and this sample.
        cfg_seen <= cfg;
        run_count <= '0;
      end else if (sample == stable) begin
        run_count <= '0;
      end else if (run_count == threshold - 1'b1) begin
        // Old count N-1 plus this opposite sample is exactly N samples.
        stable <= sample;
        changed <= 1'b1;
        run_count <= '0;
      end else begin
        run_count <= run_count + 1'b1;
      end
    end
  end
endmodule
