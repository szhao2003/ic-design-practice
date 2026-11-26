export type Topic = {
  id: string;
  name: string;
  englishName: string;
  priority: 'core' | 'high' | 'medium-high' | 'medium' | 'role-specific';
  subtopics: { id: string; name: string }[];
};

export const topics: Topic[] = [
  { id: '01', name: '数字逻辑基础', englishName: 'Digital Logic', priority: 'core', subtopics: [
    { id: 'boolean-kmap', name: 'Boolean / K-map' }, { id: 'mux-decoder', name: 'MUX / Decoder' },
    { id: 'flip-flop-latch', name: 'FF / Latch' }, { id: 'glitch', name: 'Glitch' }, { id: 'signed-width', name: '补码与位宽' },
  ] },
  { id: '02', name: 'Verilog / SystemVerilog', englishName: 'RTL Language', priority: 'core', subtopics: [
    { id: 'blocking-nba', name: 'Blocking / NBA' }, { id: 'event-scheduling', name: 'Event Scheduling' },
    { id: 'signed-width', name: 'signed / width' }, { id: 'four-state', name: 'X / Z' },
    { id: 'latch-inference', name: 'Latch 推断' }, { id: 'sv-basics', name: 'SV 基础' },
    { id: 'operator-precedence', name: '运算符优先级' },
  ] },
  { id: '03', name: 'STA 时序分析', englishName: 'Static Timing Analysis', priority: 'core', subtopics: [
    { id: 'setup-hold', name: 'Setup / Hold' }, { id: 'slack-fmax', name: 'Slack / Fmax' },
    { id: 'skew-jitter', name: 'Skew / Jitter' }, { id: 'sdc', name: 'SDC' }, { id: 'timing-fixes', name: 'Timing Fixes' },
  ] },
  { id: '04', name: 'CDC / Reset', englishName: 'Clock Domain Crossing', priority: 'core', subtopics: [
    { id: 'two-flop-synchronizer', name: '2-FF Synchronizer' }, { id: 'pulse-toggle', name: 'Pulse / Toggle' },
    { id: 'handshake', name: 'Handshake' }, { id: 'multi-bit-cdc', name: 'Multi-bit CDC' }, { id: 'rdc-reset', name: 'RDC / Reset' },
  ] },
  { id: '05', name: 'FIFO / Memory', englishName: 'Buffering & Storage', priority: 'core', subtopics: [
    { id: 'gray-code', name: 'Gray Code' }, { id: 'full-empty', name: 'Full / Empty' }, { id: 'fifo-depth', name: 'FIFO Depth' },
    { id: 'fifo-read-mode', name: 'FIFO Read Mode' }, { id: 'sram-bram', name: 'SRAM / BRAM' },
  ] },
  { id: '06', name: 'RTL 手撕 / 设计', englishName: 'RTL Coding & Design', priority: 'core', subtopics: [
    { id: 'fsm', name: 'FSM' }, { id: 'arbiter', name: 'Arbiter' }, { id: 'counter', name: 'Counter' },
    { id: 'divider', name: 'Divider' }, { id: 'adder-pipeline', name: 'Adder / Pipeline' }, { id: 'serial-parallel', name: 'Serial / Parallel' },
    { id: 'cdc-reset', name: 'CDC / 复位手撕' }, { id: 'fifo-memory', name: 'FIFO / Memory 手撕' },
    { id: 'bus-interface', name: '总线接口手撕' },
  ] },
  { id: '07', name: '总线与通信协议', englishName: 'AMBA & Interfaces', priority: 'high', subtopics: [
    { id: 'axi', name: 'AXI4 / AXI-Lite' }, { id: 'ahb', name: 'AHB' }, { id: 'apb', name: 'APB' },
    { id: 'i2c', name: 'I²C' }, { id: 'spi', name: 'SPI' }, { id: 'uart', name: 'UART' }, { id: 'bandwidth', name: 'Bandwidth' },
  ] },
  { id: '08', name: 'ASIC 实现 / PPA / Low Power', englishName: 'Implementation & PPA', priority: 'high', subtopics: [
    { id: 'synthesis', name: 'Synthesis' }, { id: 'lec-gls', name: 'LEC / GLS' }, { id: 'cts', name: 'CTS' },
    { id: 'timing-closure', name: 'Timing Closure' }, { id: 'clock-power-gating', name: 'Clock / Power Gating' },
  ] },
  { id: '09', name: 'Design Verification', englishName: 'Verification', priority: 'high', subtopics: [
    { id: 'scoreboard', name: 'Scoreboard' }, { id: 'sva', name: 'SVA' }, { id: 'coverage', name: 'Coverage' },
    { id: 'uvm', name: 'UVM' }, { id: 'random', name: 'Random' }, { id: 'debug', name: 'Debug' },
  ] },
  { id: '10', name: 'Computer Architecture', englishName: 'Architecture', priority: 'medium-high', subtopics: [
    { id: 'pipeline-hazard', name: 'Pipeline / Hazard' }, { id: 'cache', name: 'Cache' }, { id: 'memory', name: 'Memory' },
    { id: 'endian', name: 'Endian' }, { id: 'dma', name: 'DMA' }, { id: 'amdahl', name: 'Amdahl' },
  ] },
  { id: '11', name: 'CMOS / 电路基础', englishName: 'Circuits', priority: 'medium', subtopics: [
    { id: 'mos-gates', name: 'MOS / NAND / NOR' }, { id: 'fanout-delay', name: 'Fanout / Delay' },
    { id: 'kcl-kvl', name: 'KCL / KVL' }, { id: 'rc', name: 'RC' },
  ] },
  { id: '12', name: 'DFT / Test', englishName: 'Design for Test', priority: 'medium', subtopics: [
    { id: 'scan', name: 'Scan' }, { id: 'atpg', name: 'ATPG' }, { id: 'stuck-at', name: 'Stuck-at' },
    { id: 'jtag', name: 'JTAG' }, { id: 'mbist-lbist', name: 'MBIST / LBIST' },
  ] },
  { id: '13', name: 'C / Python / Tcl / Linux', englishName: 'Programming & Tools', priority: 'medium', subtopics: [
    { id: 'pointers', name: '指针' }, { id: 'bitwise', name: '位运算' }, { id: 'file-processing', name: '文件处理' },
    { id: 'scripting', name: '脚本' }, { id: 'shell', name: 'Shell' },
  ] },
  { id: '14', name: 'FPGA 专题', englishName: 'FPGA', priority: 'role-specific', subtopics: [
    { id: 'lut', name: 'LUT' }, { id: 'bram', name: 'BRAM' }, { id: 'dsp', name: 'DSP' },
    { id: 'mmcm-pll', name: 'MMCM / PLL' }, { id: 'io', name: 'I/O' }, { id: 'ddr', name: 'DDR' }, { id: 'timing', name: 'Timing' },
  ] },
  { id: '15', name: '智力 / 概率 / 行测 / 综合', englishName: 'Reasoning & Mathematics', priority: 'role-specific', subtopics: [
    { id: 'sequences', name: '数列' }, { id: 'logic-reasoning', name: '逻辑推理' },
    { id: 'probability', name: '概率' }, { id: 'mathematics', name: '通用数学' },
  ] },
];

export const learningStages = [
  { name: '基础与 RTL 语义', topicIds: ['01', '02'] },
  { name: 'Timing / Clock / CDC', topicIds: ['03', '04'] },
  { name: 'RTL 模块与 Memory', topicIds: ['05', '06'] },
  { name: '协议与系统', topicIds: ['07', '10'] },
  { name: 'ASIC / DV 与跨岗扩展', topicIds: ['08', '09', '11', '12', '13', '14', '15'] },
];
