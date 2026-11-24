module saturating_credit4 (
    input  logic       clk,
    input  logic       rst,
    input  logic       inc,
    input  logic       dec,
    output logic [3:0] credit
);
    // Synchronous active-high reset has priority over both requests.
    always_ff @(posedge clk) begin
        if (rst)
            credit <= 4'd0;
        else begin
            case ({inc, dec})
                2'b10: if (credit != 4'd15) credit <= credit + 4'd1;
                2'b01: if (credit != 4'd0)  credit <= credit - 4'd1;
                default: ; // Neither request, or both: keep the stored value.
            endcase
        end
    end
endmodule
