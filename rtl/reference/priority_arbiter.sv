module priority_arbiter (
  input  logic [3:0] req,
  output logic [3:0] grant,
  output logic       valid
);
  always_comb begin
    // Complete defaults prevent storage; an else-if chain grants only one lane.
    grant = 4'b0000;
    valid = |req;
    if (req[0]) begin
      grant = 4'b0001;
    end else if (req[1]) begin
      grant = 4'b0010;
    end else if (req[2]) begin
      grant = 4'b0100;
    end else if (req[3]) begin
      grant = 4'b1000;
    end
    // Fixed priority favors low indices; this is not a fair round-robin arbiter.
  end
endmodule
