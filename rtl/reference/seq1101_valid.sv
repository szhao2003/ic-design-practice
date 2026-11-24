module seq1101_valid (
  input logic clk, rst, in_valid, din,
  output logic match
);
  typedef enum logic [1:0] {NONE, P1, P11, P110} state_t;
  state_t state, next_state;
  logic hit;
  // State is the longest suffix of accepted bits that is a pattern prefix.
  always_comb begin
    next_state = state;
    hit = 1'b0;
    case (state)
      NONE: next_state = din ? P1 : NONE;
      P1: next_state = din ? P11 : NONE;
      P11: next_state = din ? P11 : P110;
      P110: begin
        next_state = din ? P1 : NONE;
        hit = din;
      end
      default: next_state = NONE;
    endcase
  end
  always_ff @(posedge clk) begin
    if (rst) begin
      state <= NONE;
      match <= 1'b0;
    end else begin
      // Invalid cycles do not consume bits, but the event output clears.
      match <= 1'b0;
      if (in_valid) begin
        state <= next_state;
        match <= hit;
      end
    end
  end
endmodule
