export type LearningPathStage = {
  id: string;
  name: string;
  goal: string;
  questionIds: string[];
};
export type CoreLearningPath = {
  id: string;
  topicId: string;
  name: string;
  prerequisite: string;
  stages: LearningPathStage[];
};

// Stages describe prerequisite order, not a replacement for question difficulty.
export const coreLearningPaths: CoreLearningPath[] = [
  { id: 'sta', topicId: '03', name: 'STA：从边沿到约束', prerequisite: '先熟悉触发器、组合延迟与时钟周期。', stages: [
    { id: 'rules', name: '理解规则', goal: '画出发射与捕获沿，分清最大延迟和最小延迟。', questionIds: ['ORIGINAL-STA-0001', 'ORIGINAL-STA-0002', 'ORIGINAL-STA-0003'] },
    { id: 'boundaries', name: '推演边界', goal: '同时检查setup和hold，判断修复方案的可行窗口。', questionIds: ['ORIGINAL-STA-0005', 'ADAPTED-ADVANCED-STA-0001', 'ADAPTED-ADVANCED-STA-0002'] },
    { id: 'application', name: '综合应用', goal: '分析流水级瓶颈，再把多周期功能前提落实到边沿和预算。', questionIds: ['ADAPTED-CORE-STA-0001', 'ADAPTED-INTEGRATION-STA-0001', 'ADAPTED-INTEGRATION-STA-0002'] },
  ] },
  { id: 'cdc', topicId: '04', name: 'CDC：从单bit到握手', prerequisite: '先熟悉NBA旧值语义；理想数字推演不能替代亚稳态和物理约束分析。', stages: [
    { id: 'rules', name: '理解规则', goal: '区分电平同步、短脉冲漏采和toggle事件间隔。', questionIds: ['ORIGINAL-CDC-0001', 'ORIGINAL-CDC-0002', 'ORIGINAL-CDC-0006'] },
    { id: 'boundaries', name: '推演边界', goal: '检查多位数据稳定窗口、握手去重和同步链使用边界。', questionIds: ['ORIGINAL-CDC-0004', 'ADAPTED-ADVANCED-CDC-0001', 'ADAPTED-COLLECTION-CDC-0004'] },
    { id: 'application', name: '综合应用', goal: '实现安全释放与事件跨域，再逐沿分析完整握手吞吐。', questionIds: ['ORIGINAL-CDC-0005', 'ADAPTED-RK26-CDC-0001', 'ADAPTED-CORE-CDC-0001'] },
  ] },
  { id: 'fifo', topicId: '05', name: 'FIFO：从接口到跨域实现', prerequisite: '先熟悉指针、NBA与两级同步；异步实现建议先完成CDC路径。', stages: [
    { id: 'rules', name: '理解规则', goal: '先分清读接口契约，再理解环绕位和Gray编码。', questionIds: ['ORIGINAL-FIFO-0004', 'ORIGINAL-FIFO-0002', 'ORIGINAL-FIFO-0001'] },
    { id: 'boundaries', name: '推演边界', goal: '按沿前状态计算接受与占用，区分理想峰值和跨域标志延迟。', questionIds: ['ORIGINAL-FIFO-0003', 'ADAPTED-ADVANCED-FIFO-0001', 'ADAPTED-ADVANCED-FIFO-0002'] },
    { id: 'application', name: '综合应用', goal: '先写完整同步FIFO，再看异步标志延迟，最后实现双时钟FIFO。', questionIds: ['ADAPTED-FOCUSED-RTL-FIFO-0001', 'ADAPTED-INTEGRATION-FIFO-0002', 'ADAPTED-INTEGRATION-FIFO-0001'] },
  ] },
  { id: 'rtl', topicId: '06', name: 'RTL：从状态到背压', prerequisite: '先熟悉组合/时序赋值、位宽和复位优先级。', stages: [
    { id: 'rules', name: '理解规则', goal: '明确计数终值、状态编码和重叠匹配的状态含义。', questionIds: ['ORIGINAL-RTL-0004', 'ADAPTED-YHC-RTL-0001', 'ORIGINAL-RTL-0003'] },
    { id: 'boundaries', name: '推演边界', goal: '把使能、优先级和输入空泡写进完整更新规则。', questionIds: ['ORIGINAL-RTL-0001', 'ORIGINAL-RTL-0002', 'ADAPTED-FOCUSED-RTL-SEQ-0001'] },
    { id: 'application', name: '综合应用', goal: '围绕实际接受事件设计弹性缓冲、轮转仲裁和credit边界。', questionIds: ['ADAPTED-ADVANCED-RTL-0001', 'ADAPTED-ADVANCED-RTL-0002', 'ADAPTED-CORE3-RTL-0001'] },
  ] },
  { id: 'bus', topicId: '07', name: '总线：从握手到事务', prerequisite: '先熟悉逐沿采样与寄存器；综合实现建议先练RTL背压。', stages: [
    { id: 'rules', name: '理解规则', goal: '辨认AXI握手、APB完成沿和SPI采样沿，避免混用协议。', questionIds: ['ORIGINAL-AXI-0001', 'ORIGINAL-APB-0001', 'ORIGINAL-SPI-0001'] },
    { id: 'boundaries', name: '推演边界', goal: '分开AW/W接受、同ID响应顺序和VALID/READY依赖。', questionIds: ['ADAPTED-ADVANCED-AXI-0001', 'ADAPTED-CORE-AXI-0002', 'ADAPTED-FOCUSED-AXI-DEADLOCK-0001'] },
    { id: 'application', name: '综合应用', goal: '先推演寄存器快照，再实现AXI-Lite，最后分析完整AXI4读交织。', questionIds: ['ADAPTED-INTEGRATION-AXIL-0002', 'ADAPTED-INTEGRATION-AXIL-0001', 'ADAPTED-BOUNDARY-AXI-0001'] },
  ] },
];

export const coreWarmups: Record<string, LearningPathStage> = {
  sta: { id: 'warmup', name: '起步练习', goal: '先读懂setup报告，再把setup与hold的通过条件分开判断。', questionIds: ['ADAPTED-TIMINGSTART-STA-0001', 'ADAPTED-TIMINGSTART-STA-0002'] },
  cdc: { id: 'warmup', name: '起步练习', goal: '先确认同步链的时钟归属，再明确事件握手的背压前提。', questionIds: ['ADAPTED-TIMINGSTART-CDC-0001', 'ADAPTED-TIMINGSTART-CDC-0002'] },
  fifo: { id: 'warmup', name: '起步练习', goal: '先分清请求与成功接受，再沿接受顺序找队头。', questionIds: ['ADAPTED-STARTER-FIFO-0001', 'ADAPTED-STARTER-FIFO-0002'] },
  rtl: { id: 'warmup', name: '起步练习', goal: '先推演使能关闭时的保持，再定位单周期脉冲被拉长的原因。', questionIds: ['ADAPTED-STARTER-RTL-0001', 'ADAPTED-STARTER-RTL-0002'] },
  bus: { id: 'warmup', name: '起步练习', goal: '按沿统计AXI握手，再区分APB的准备阶段与访问阶段。', questionIds: ['ADAPTED-STARTER-BUS-0001', 'ADAPTED-STARTER-BUS-0002'] },
};
