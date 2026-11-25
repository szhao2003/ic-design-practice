import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

// Compile the exact modules presented in the question, not handwritten copies.
export async function checkExamFoundation(questions, simulate) {
  const get = suffix => questions.find(q => q.id === `ADAPTED-EXAMBASE-${suffix}`);
  const extract = suffix => {
    const code = get(suffix)?.promptMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1];
    if (!code?.includes('endmodule')) throw Error(`${suffix}: missing published module`);
    return code;
  };
  const modules = ['PARAM-0001', 'PARAM-0002', 'DECODE-0002', 'PULSE-0001'].map(extract);
  if (extract('PULSE-0001') !== extract('PULSE-0002')) throw Error('Pulse diagnostic circuits differ');
  if (!simulate) { console.log('SKIP exam foundation HDL: source extraction checked; simulator unavailable.'); return; }
  await mkdir('.rtl-build/exam-foundation', { recursive: true });
  const source = '.rtl-build/exam-foundation/cases.sv';
  await writeFile(source, modules.join('\n') + `
module tb;
  exam_width #(.DEPTH(17)) width17();
  exam_width #(.DEPTH(16)) width16();
  exam_width #(.DEPTH(2)) width2();
  reg [11:0] din; wire [11:0] dout;
  exam_lanes #(.LANES(3)) lanes(din,dout);
  reg clk=0, rst_n=1, event_in=0;
  wire wide;
  exam_stretch pulse(clk,rst_n,event_in,wide);
  reg en=0, gate=0; reg [3:0] d=0; reg [2:0] x=0;
  wire [3:0] q,inv; wire [2:0] h;
  exam_storage storage(clk,en,gate,d,x,q,h,inv);
  always #5 clk=~clk;
  integer count=0, k, gap;
  always @(posedge wide) count=count+1;
  task reset_pulse;
    begin
      @(negedge clk); rst_n=0; event_in=0;
      @(negedge clk); rst_n=1;
      #1; count=0;
    end
  endtask
  initial begin
    if (width17.AW != 5 || $bits(width17.addr) != 5 || width16.AW != 4 || width2.AW != 1)
      $fatal(1,"parameter width");
    for (k=0;k<4096;k=k+1) begin
      din=k; #1;
      if (dout !== (12'hfff ^ k[11:0])) $fatal(1,"parallel slice %d",k);
    end
    // Establish known storage, then vary x during transparency and after closure.
    @(negedge clk); en=1; d=9; gate=1; x=3;
    @(posedge clk); #1;
    if (q !== 9 || h !== 3 || inv !== 6) $fatal(1,"storage load");
    x=5; #1; if(h !== 5) $fatal(1,"latch transparency");
    gate=0; en=0; x=2; d=4;
    @(posedge clk); #1;
    if(q !== 9 || h !== 5 || inv !== 11) $fatal(1,"storage hold/combinational");
    // Match the five-row trace, shifting the time origin to the preceding falling edge.
    reset_pulse();
    @(negedge clk); event_in=1;
    @(posedge clk); #1; if({pulse.d1,pulse.d2,wide} !== 3'b101) $fatal(1,"row1");
    @(negedge clk); event_in=0;
    @(posedge clk); #1; if({pulse.d1,pulse.d2,wide} !== 3'b011) $fatal(1,"row2");
    @(negedge clk); event_in=1;
    @(posedge clk); #1; if({pulse.d1,pulse.d2,wide} !== 3'b101) $fatal(1,"row3");
    @(negedge clk); event_in=0;
    @(posedge clk); #1; if({pulse.d1,pulse.d2,wide} !== 3'b011) $fatal(1,"row4");
    @(posedge clk); #1; if({pulse.d1,pulse.d2,wide} !== 3'b000 || count != 1) $fatal(1,"row5/count");
    for(gap=2;gap<=6;gap=gap+1) begin
      reset_pulse();
      @(negedge clk); event_in=1;
      @(negedge clk); event_in=0;
      repeat(gap-1) @(negedge clk);
      event_in=1;
      @(negedge clk); event_in=0;
      repeat(4) @(negedge clk);
      #1;
      if(count != ((gap==2)?1:2)) $fatal(1,"gap %d count %d",gap,count);
    end
    $display("Exam foundation HDL PASS: widths, 4096 slices, storage, pulse trace and gaps 2..6T");
    $finish;
  end
  initial begin #20000; $fatal(1,"timeout"); end
endmodule
`);
  const output = '.rtl-build/exam-foundation/cases.vvp';
  for (const [tool,args] of [['iverilog',['-g2012','-s','tb','-o',output,source]],['vvp',[output]]]) {
    const result = spawnSync(tool,args,{encoding:'utf8',timeout:30000});
    if(result.stdout) process.stdout.write(result.stdout);
    if(result.stderr) process.stderr.write(result.stderr);
    if(result.error || result.status !== 0) throw Error(`Exam foundation ${tool} failed`);
  }
}
