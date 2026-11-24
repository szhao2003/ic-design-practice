module round_robin4 (
  input  logic       clk,
  input  logic       rst_n,   // Synchronous active-low reset
  input  logic [3:0] req,
  input  logic       accept,  // Candidate is consumed on this edge
  output logic [3:0] grant,
  output logic       valid
);
  logic [1:0] next_start;
  logic [1:0] selected;
  logic       found;
  integer     offset, index;

  always_comb begin
    grant    = 4'b0000;
    selected = 2'd0;
    found    = 1'b0;
    // Search cyclically, starting just after the last accepted winner.
    for (offset = 0; offset < 4; offset = offset + 1) begin
      index = (int'(next_start) + offset) % 4;
      if (!found && req[index]) begin
        grant[index] = 1'b1;
        selected = index[1:0];
        found = 1'b1;
      end
    end
    valid = found;
  end

  always_ff @(posedge clk) begin
    if (!rst_n) begin
      next_start <= 2'd0;
    end else if (accept && valid) begin
      next_start <= selected + 2'd1; // Two bits wrap 3 -> 0
    end
    // Stalls and empty requests consume no service turn.
  end
endmodule
