import type { GuidanceContent } from '../domain/practice';
import type { Question } from '../domain/question-schema';

type QuestionGuidance = GuidanceContent & { questionId: string; contentVersion: number };
export const questionGuidance: QuestionGuidance[] = [
  { questionId: 'ORIGINAL-STA-0006', contentVersion: 2, steps: [
    { title: '先找真实采样', promptMd: '给D0、D1分别标上发射和捕获沿。目的端在中间沿不采样，与这条路径永远不需要被检查，有什么区别？' },
    { title: '再看同沿的新旧数据', promptMd: '在目的端捕获D0的那个沿，源端同时发出了什么？假设这笔新数据走得很快，可能破坏哪个数据的保持窗口？把setup与hold分开说明。' },
    { title: '检查例外的功能前提', promptMd: '不要只看稳态计数。逐项检查源/目的使能相位、复位与模式切换能否一直维持题定关系；最后说明实际还需核对工具选用的检查边沿。' },
  ], checks: ['明确真实捕获D0仍然存在，不能以false path取消检查。', '用E0→E2解释两周期setup候选。', '解释E2发射D1可能破坏E2捕获D0的hold。', '列出使能相位、复位/模式边界与工具边沿核对前提。'] },
  { questionId: 'ADAPTED-INTEGRATION-STA-0001', contentVersion: 1, steps: [
    { title: '先画功能边沿表', promptMd: '列出源与目的在每个使能沿做什么、哪些中间沿保持。把“同一组合路径可以用多个周期”与“每拍采样的多级流水”分开。' },
    { title: '分别确定setup和hold关系', promptMd: '先确定同一笔数据的发射与捕获间隔；再检查捕获沿同时发射的新数据。多周期setup移动检查关系后，hold配对的目的是什么？不要把它解释为免除hold。' },
    { title: '最后写限定范围的命令', promptMd: '使用题定Vivado版本与同钟同相前提，分别写setup和hold命令，from/to仅匹配题定寄存器。检查查询非空且没有扩大到整域，并给每拍工作的流水线一个反例。' },
  ], checks: ['同一具体路径写setup 3及hold 2，from/to范围与题面一致。', '解释E0→E3 setup及E3同沿新旧数据hold保护，不说成保持2T。', '没有把false path或整个时钟域例外当替代方案。', '说明功能使能、复位/模式和查询范围需要证明。', '指出每级每拍采样的三级流水不能仅因总延迟三拍而套用此例外。'] },
  { questionId: 'ORIGINAL-CDC-0004', contentVersion: 2, steps: [
    { title: '先定义数据所有权', promptMd: '从空闲发起一笔传输，源端先锁存什么？从请求发起到通道再次可接收，哪些东西必须保持，哪些上游请求需要被背压？' },
    { title: '画完整往返而非单次确认', promptMd: '分别标出req进入目的域、ack返回源域的同步链。目的端如果连续多拍看到请求为高，怎样只接收一次？继续画出撤销请求和撤销确认后的返回空闲流程。' },
    { title: '补齐复位与物理前提', promptMd: '宽payload没有逐位同步，凭什么在控制到达时可安全捕获？说明数据稳定窗口、实际路径约束，以及双方复位状态不一致可能造成的假事务。' },
  ], checks: ['先锁存payload，再发起请求；busy时不覆盖数据。', 'req与ack各在进入的时钟域同步。', '目的端每笔只捕获一次，完整返回空闲后才接受下一笔。', '说明bundled-data稳定窗口及实现约束，不能只管同步控制。', '说明协调复位和模式边界，避免假请求或遗漏事务。'] },
  { questionId: 'ADAPTED-CORE-CDC-0001', contentVersion: 1, steps: [
    { title: '把两域沿放到同一时间轴', promptMd: '合并题定源沿和目的沿，建立“沿前值、状态机动作、沿后值”三列。先只推第一笔请求进入目的域的过程。' },
    { title: '同步器更新与状态机读取分开', promptMd: '每到一个域的沿，先让状态机读取旧第二级，再计算两级同步器的新值。第二级在该沿刚变成1，是否意味着状态机在同沿已经读到1？对返回ack也用同样方法。' },
    { title: '必须走完返回低的四相流程', promptMd: '依次标出首次接收、源撤请求、目的撤确认、源回空闲、第二笔请求发起。源WAIT_LO分支回到IDLE时，能否同沿再执行IDLE分支？最后检查每个时刻对应哪个域的沿。' },
  ], checks: ['逐沿使用旧s2，而非同沿刚更新的s2。', '首笔接收45ns、源撤req为70ns、目的撤ack为125ns。', '源150ns回IDLE，第二笔最早160ns，不同沿执行两次状态分支。', '不把题定理想数字模型的吞吐外推成所有CDC固定延迟。'] },
  { questionId: 'ADAPTED-FOCUSED-RTL-FIFO-0001', contentVersion: 1, steps: [
    { title: '先写请求接受表', promptMd: '分别考虑空、中间占用、满三种沿前状态，在同时读写时写出两个接受条件。只按题定沿前许可，不临时加入旁路或前瞻。' },
    { title: '再把状态更新分开', promptMd: '把写指针、读指针、count分别对应到实际接受事件。count需要表示满容量，指针需要表示阵列地址；它们的位宽是否相同？用只写、只读、同时接受、都不接受四种情况检查。' },
    { title: '最后检查读返回与复位', promptMd: '确认dout表示哪笔旧数据、何时更新，未读时哪些输出保持、哪些应清零。复位需要清哪些状态？不清存储阵列时，怎样确保旧内容不会被当作有效数据读出？' },
  ], checks: ['端口齐全：2bit读写地址指针、3bit count及题定同步复位优先级。', '空时同时请求仅写成功，满时仅读成功，中间状态两者均接受。', '指针只随接受推进并正确回绕，数据按FIFO顺序返回。', '读接受后dout更新、rd_valid置1；其他沿dout保持且rd_valid清0。', '复位清指针、计数和输出；不要求清阵列，也不暴露无效旧数据。'] },
  { questionId: 'ADAPTED-INTEGRATION-FIFO-0002', contentVersion: 1, steps: [
    { title: '沿前判接受，沿后填表', promptMd: '每个读沿先记录旧empty及旧第二级同步指针，用它们决定本次能否接受读。rinc持续为1只是请求，不自动代表每沿成功。' },
    { title: '三个寄存更新不要合并', promptMd: '分别计算wg_r1、wg_r2和rempty。第二级同步指针使用旧第一级，空标志比较使用旧第二级；不要把新同步值提前送给同沿的标志判断。' },
    { title: '最后分清返回事件与库存', promptMd: '某沿读出唯一一个字后，下一沿还剩字可读吗？把rvalid解释为刚返回的数据事件，把empty解释为更新后的库存；再核对rdata和指针推进。' },
  ], checks: ['R1/R2同步链更新正确，空标志比较使用旧wg_r2。', 'R3沿后解空，R4沿前才首次允许读取。', 'R4沿后rdata=0xA5、rvalid=1且rempty=1，事件与库存含义不冲突。', '该表仅适用于题定相位和无亚稳态数字模型，不承诺真实固定延迟。'] },
];

export function guidanceFor(question: Question): GuidanceContent | undefined {
  const item = questionGuidance.find(g => g.questionId === question.id && g.contentVersion === question.contentVersion);
  return item && { steps: item.steps, checks: item.checks };
}
