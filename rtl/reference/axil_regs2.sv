module axil_regs2 (
  input logic aclk, aresetn,
  input logic [7:0] awaddr,
  input logic [2:0] awprot,
  input logic awvalid,
  output logic awready,
  input logic [31:0] wdata,
  input logic [3:0] wstrb,
  input logic wvalid,
  output logic wready,
  output logic [1:0] bresp,
  output logic bvalid,
  input logic bready,
  input logic [7:0] araddr,
  input logic [2:0] arprot,
  input logic arvalid,
  output logic arready,
  output logic [31:0] rdata,
  output logic [1:0] rresp,
  output logic rvalid,
  input logic rready
);
  logic [31:0] reg0, reg1;
  logic aw_pending, w_pending;
  logic [7:0] saved_addr;
  logic [31:0] saved_data;
  logic [3:0] saved_strb;
  integer lane;
  // READY depends only on registered state, never on a bus input.
  assign awready = !aw_pending && !bvalid;
  assign wready = !w_pending && !bvalid;
  assign arready = !rvalid;

  always_ff @(posedge aclk or negedge aresetn) begin
    if (!aresetn) begin
      reg0 <= '0;
      reg1 <= '0;
      aw_pending <= 1'b0;
      w_pending <= 1'b0;
      saved_addr <= '0;
      saved_data <= '0;
      saved_strb <= '0;
      bvalid <= 1'b0;
      bresp <= 2'b00;
      rvalid <= 1'b0;
      rdata <= '0;
      rresp <= 2'b00;
    end else begin
      if (bvalid && bready) bvalid <= 1'b0;
      if (rvalid && rready) rvalid <= 1'b0;
      // AW and W may arrive in either order. Save each exactly once.
      if (awvalid && awready) begin
        saved_addr <= awaddr;
        aw_pending <= 1'b1;
      end
      if (wvalid && wready) begin
        saved_data <= wdata;
        saved_strb <= wstrb;
        w_pending <= 1'b1;
      end
      // Commit one edge after the second input handshake; no bypass.
      if (aw_pending && w_pending && !bvalid) begin
        aw_pending <= 1'b0;
        w_pending <= 1'b0;
        bvalid <= 1'b1;
        bresp <= 2'b10;
        if (saved_addr == 8'h00 || saved_addr == 8'h04) begin
          bresp <= 2'b00;
          for (lane = 0; lane < 4; lane = lane + 1) begin
            if (saved_strb[lane]) begin
              if (saved_addr == 8'h00)
                reg0[8*lane +: 8] <= saved_data[8*lane +: 8];
              else
                reg1[8*lane +: 8] <= saved_data[8*lane +: 8];
            end
          end
        end
      end
      // Snapshot at AR acceptance. Same-edge writes update after this read.
      if (arvalid && arready) begin
        rvalid <= 1'b1;
        rresp <= 2'b00;
        case (araddr)
          8'h00: rdata <= reg0;
          8'h04: rdata <= reg1;
          default: begin
            rdata <= '0;
            rresp <= 2'b10;
          end
        endcase
      end
    end
  end
  // AxPROT is accepted but intentionally ignored in this unprivileged model.
endmodule
