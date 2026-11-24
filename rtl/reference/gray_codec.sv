module gray_codec #(
  parameter integer WIDTH = 8
) (
  input logic [WIDTH-1:0] binary_in, gray_in,
  output logic [WIDTH-1:0] gray_out, binary_out
);
  // Contract: WIDTH >= 1. This is a combinational codec, not a CDC circuit.
  assign gray_out = binary_in ^ (binary_in >> 1);
  for (genvar bit_index = 0; bit_index < WIDTH; bit_index = bit_index + 1) begin : decode
    // Each binary bit is the parity of the Gray prefix down to that bit.
    assign binary_out[bit_index] = ^gray_in[WIDTH-1:bit_index];
  end
endmodule
