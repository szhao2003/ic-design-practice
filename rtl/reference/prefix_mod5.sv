module prefix_mod5 (
  input  logic clk,
  input  logic rst_n,  // Synchronous active-low reset
  input  logic in_valid,
  input  logic bit_in,
  output logic is_divisible
);
  logic [2:0] rem;
  logic       seen;
  logic [3:0] candidate, reduced;

  // Append one bit: new remainder = (2*old_remainder + bit) mod 5.
  // rem is 0..4, so candidate is 0..9 and one subtraction is sufficient.
  assign candidate = ({1'b0, rem} << 1) | {3'b000, bit_in};
  assign reduced = candidate >= 4'd5 ? candidate - 4'd5 : candidate;

  always_ff @(posedge clk) begin
    if (!rst_n) begin
      rem  <= 3'd0;
      seen <= 1'b0;
    end else if (in_valid) begin
      rem  <= reduced[2:0];  // reduced <= 4: no significant bits are discarded
      seen <= 1'b1;
    end
    // Stalls preserve the accepted prefix, not the unsampled bit_in.
  end

  // Empty prefix is NOT a number; an accepted prefix of zero IS divisible by 5.
  assign is_divisible = seen && (rem == 3'd0);
endmodule
