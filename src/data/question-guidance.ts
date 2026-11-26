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
  { questionId: 'ADAPTED-FOCUSED-RTL-FIFO-0001', contentVersion: 2, steps: [
    { title: '先写请求接受表', promptMd: '分别考虑空、中间占用、满三种沿前状态，在同时读写时写出两个接受条件。只按题定沿前许可，不临时加入旁路或前瞻。' },
    { title: '再把状态更新分开', promptMd: '把写指针、读指针、count分别对应到实际接受事件。count需要表示满容量，指针需要表示阵列地址；它们的位宽是否相同？用只写、只读、同时接受、都不接受四种情况检查。' },
    { title: '最后检查读返回与复位', promptMd: '确认dout表示哪笔旧数据、何时更新，未读时哪些输出保持、哪些应清零。复位需要清哪些状态？不清存储阵列时，怎样确保旧内容不会被当作有效数据读出？' },
  ], checks: ['端口齐全：2bit读写地址指针、3bit count及题定同步复位优先级。', '空时同时请求仅写成功，满时仅读成功，中间状态两者均接受。', '指针只随接受推进并正确回绕，数据按FIFO顺序返回。', '读接受后dout更新、rd_valid置1；其他沿dout保持且rd_valid清0。', '复位清指针、计数和输出；不要求清阵列，也不暴露无效旧数据。'] },
  { questionId: 'ADAPTED-INTEGRATION-FIFO-0002', contentVersion: 1, steps: [
    { title: '沿前判接受，沿后填表', promptMd: '每个读沿先记录旧empty及旧第二级同步指针，用它们决定本次能否接受读。rinc持续为1只是请求，不自动代表每沿成功。' },
    { title: '三个寄存更新不要合并', promptMd: '分别计算wg_r1、wg_r2和rempty。第二级同步指针使用旧第一级，空标志比较使用旧第二级；不要把新同步值提前送给同沿的标志判断。' },
    { title: '最后分清返回事件与库存', promptMd: '某沿读出唯一一个字后，下一沿还剩字可读吗？把rvalid解释为刚返回的数据事件，把empty解释为更新后的库存；再核对rdata和指针推进。' },
  ], checks: ['R1/R2同步链更新正确，空标志比较使用旧wg_r2。', 'R3沿后解空，R4沿前才首次允许读取。', 'R4沿后rdata=0xA5、rvalid=1且rempty=1，事件与库存含义不冲突。', '该表仅适用于题定相位和无亚稳态数字模型，不承诺真实固定延迟。'] },
  { questionId: 'ADAPTED-ADVANCED-AXI-0001', contentVersion: 1, steps: [
    { title: '每个通道单独圈握手沿', promptMd: '对表中的AW、W、B分别计算沿前VALID与READY是否同时为1，先列三份接受记录。某一路已经握手，是否要求另一路也在同沿成功？区分已经接受与仍在等待的payload。' },
    { title: '分清沿上采样和沿后响应', promptMd: '找出地址与数据都已接受的时刻，再按题定实现登记BVALID。该沿之后新产生的BVALID，能否被算作同一沿已经采样到的响应？这里只采用题目给定的响应延迟。' },
    { title: '响应有效不等于响应完成', promptMd: '继续检查B通道的READY。响应准备好但尚未被接受时，哪些信号必须保持？最后说明AXI-Lite单beat为什么不能套用完整版AXI的WLAST要求。' },
  ], checks: ['W在E0握手，AW在E2握手；数据先到在本题独立缓存条件下合法。', 'BVALID最早E2沿后变高，不能说E2沿已经采到高。', 'E3的BREADY为0，响应尚未完成；B在E4握手完成。', '等待期间保持BVALID/BRESP，AW等待时保持AWVALID/AWADDR。', '限定AXI4-Lite单beat及题定响应登记规则，不引入WLAST或推广固定响应延迟。'] },
  { questionId: 'ADAPTED-INTEGRATION-AXIL-0001', contentVersion: 2, steps: [
    { title: '先为独立通道分配存储槽', promptMd: '写侧分别需要记住地址、数据与哪些byte使能？为AW槽、W槽、B槽列出空闲与占用规则。让AW先到、W先到、同拍到三种情况都走一遍，不能要求两个VALID同时出现。' },
    { title: '再定义一次提交与一次响应', promptMd: '根据沿前缓存是否齐全以及B槽状态，决定哪沿提交。检查第二个通道接受的同沿能否直接写寄存器，响应消耗同沿能否接新请求。分别处理合法地址、非法地址和全零strobe。' },
    { title: '最后独立完成读快照与复位', promptMd: 'AR接受时把响应数据保存在哪里，R被背压时是否允许跟随寄存器更新？检查读与写提交同沿的NBA旧值，读响应槽的占用规则，再检查复位和总线输入到输出的组合路径。' },
  ], checks: ['AW/W分别缓存一次握手的地址、数据与WSTRB，不要求同拍，缓存占用即停收对应通道。', '配齐后的下一沿才提交一次；B存在以及B消耗同沿均不接新AW/W。', '仅0x00/0x04合法，非法写无副作用且返回SLVERR，非法读返回0/SLVERR；全零WSTRB合法且数据不变。', '按WSTRB逐byte合并，BVALID/RVALID不依赖各自READY，背压期间响应payload保持。', 'AR接受时登记快照；同沿写提交读旧值，R存在及R消耗同沿均不接新AR。', '读写独立、复位清状态并取消在途事务，无总线输入到输出组合路径；不把题定受限吞吐当所有AXI-Lite实现的统一要求。'] },
  { questionId: 'ADAPTED-INTEGRATION-AXIL-0002', contentVersion: 1, steps: [
    { title: '先按byte算寄存器的新值', promptMd: '把32bit寄存器拆成byte0到byte3，用WSTRB逐位决定保留旧byte还是换成WDATA中的对应byte。先分别算两次写提交，不要把AW/W接受沿直接当作写提交沿。' },
    { title: '把寄存器与R槽分成两份状态', promptMd: '在每次AR接受时保存一份独立快照。若AR与写提交同沿，按题定旧值语义先决定读值；之后即使寄存器再次变化，已经存在的R槽是否应该跟着变化？' },
    { title: '逐沿跟踪响应占用与消耗', promptMd: '沿前RVALID与RREADY决定本沿是否消费，沿后再写新的有效位。先完成E0到E6的reg0/RDATA/RVALID表，再检查无效数据位的保持是否仍代表有效响应，以及读槽占用是否阻止独立写侧推进。' },
  ], checks: ['E0只接受并缓存，首次写提交在E1，reg0合并为0x11BB33DD。', 'E1的AR取沿前旧值0x11223344，RVALID置1；RDATA保持到E5被消费。', 'E4第二次提交使reg0变为0xFFBBFFDD，但旧R快照仍为0x11223344。', 'E5消费后RVALID为0，保持的旧RDATA不算新响应；E6新AR才取0xFFBBFFDD并置RVALID。', 'WSTRB[0]选择最低byte，读写独立；同沿读旧值及不接受同沿新AR是题定实现契约。'] },
  { questionId: 'ADAPTED-ADVANCED-RTL-0001', contentVersion: 1, steps: [
    { title: '用容量一字的队列理解空槽与满槽', promptMd: '分别考虑空槽、满且下游阻塞、满且下游接受三个沿前状态。哪种情况仍有空间接收一个新字？不要直接把输入READY等同于输出READY，也不要让新输入越过寄存器在同沿被消费。' },
    { title: '把消费旧字与接收新字分开', promptMd: '先用沿前输出VALID/READY确定旧字是否消费，再决定能否接新字替换。检查同时消费并替换、只消费、满且阻塞这三种更新，避免重复输出或覆盖尚未消费的数据。' },
    { title: '最后核对时延、复位与接口边界', promptMd: '从空槽接受一个字开始，标出它最早能在哪个沿被下游消费。再检查同步复位时的READY与在途字处理，以及out_ready到in_ready是否仍有组合路径；本题内部缓冲是否等同于合规AXI接口寄存切片？' },
  ], checks: ['in_ready=rst_n&&(!out_valid||out_ready)，空槽即使下游未ready也能接一个字。', '满且阻塞时保持out_valid/out_data，不因输入VALID高而覆盖旧字。', '同沿消费旧字可接收新字替换；只消费而无新输入时清out_valid，不重复消费。', '无组合数据旁路：E0接收的字最早E1消费；稳态连续有效时每拍一笔。', '同步复位清valid/data，rst_n低时in_ready为0，在途字按复位取消。', 'out_ready到in_ready存在组合路径；该通用内部弹性级不宣称满足AXI接口无组合输入输出路径要求。'] },
  { questionId: 'ORIGINAL-RTL-0003', contentVersion: 2, steps: [
    { title: '先让每个状态表示有效后缀', promptMd: '把已经收到的输入压缩成“仍可能扩展为目标串的最长后缀”。列出空前缀及目标串的各个未完成前缀，不要用总共收到多少位来命名状态。' },
    { title: '完成匹配后仍检查能否重叠', promptMd: '对每个状态分别追加0和1，写出是否命中以及下一前缀。命中后的输入尾部能否同时作为下一次匹配的开头？不要默认命中就丢弃全部历史。' },
    { title: '用短输入逐位核对输出时刻', promptMd: '沿输入10101逐位填写旧状态、本沿bit、沿后状态与命中。命中是采样后登记的事件，未命中沿也要明确输出，避免上一拍的高电平被保留。' },
  ], checks: ['状态语义覆盖空前缀、1、10；其他等价编码可以，但含义应明确。', '每个状态遇0或1的转移与命中都完整，不遗漏回退分支。', '前缀10遇1命中后保留后缀1，而不是无条件回空态。', '10101的命中序列为0/0/1/0/1，即第3、第5位命中。', '按旧状态与本沿输入生成注册事件，未命中沿清零，不额外推迟一拍。'] },
  { questionId: 'ADAPTED-FOCUSED-RTL-SEQ-0001', contentVersion: 1, steps: [
    { title: '先按接受顺序建立前缀转移', promptMd: '只把in_valid有效沿的din拼成数据流，为目标1101列出未完成前缀。分别考虑多收到一个1、匹配完成以及失配时，哪些后缀仍然可用。' },
    { title: '把前缀状态与match事件分开更新', promptMd: '在有效匹配后插入一个in_valid=0的沿：部分匹配状态是否应该变化，match是否也该保持？再在尚未匹配完时插入空泡，检查无效din有没有被错误消耗。' },
    { title: '最后核对复位和逐沿事件', promptMd: '以连续有效的1101101核对两次重叠匹配，再加入空泡。明确接受最后一位的哪个沿后报match；同步复位与in_valid同时有效时，应优先做什么？' },
  ], checks: ['状态覆盖空/1/11/110；11再遇1仍保留11，110遇1命中并保留后缀1。', '只在in_valid=1时接受din并转移状态，空泡不加入输入序列。', '空泡保持前缀，但match每沿默认清零；不能因使能关闭拉长命中脉冲。', '1101101在第4、第7个有效bit接受的沿后报match，未接满4位不误报。', 'rst同步高有效且优先于输入，清状态与match；完整模块使用非阻塞时序更新。'] },
  { questionId: 'ORIGINAL-RTL-0002', contentVersion: 2, steps: [
    { title: '先分清索引与二进制书写顺序', promptMd: '按req[3:0]把示例每一位对应到请求索引，再按题定的最低索引最高优先级确定获胜者。不要把最左侧的1自动当作最高优先级。' },
    { title: '保证无请求与多请求都有完整组合结果', promptMd: '先写无请求时的默认grant，再用优先链只选择第一路有效请求。分别检查全零和多位置1；valid表示有候选，grant必须仍为最多一位置1。' },
    { title: '用持续竞争检查公平性边界', promptMd: '让最高优先级请求长期保持，再让另一请求也持续有效。低优先级是否一定得到授权？说明固定优先级的功能与公平仲裁需求有什么不同，不要偷偷增加时钟或轮转状态。' },
  ], checks: ['req=1010时bit1和bit3请求，grant=0010、valid=1。', '无请求时grant=0000、valid=0，组合赋值完整且无锁存。', '优先级从索引0向上，任何输入最多授权当前请求中的一路。', '固定优先级可能使低优先级饥饿，不保证公平性；本题纯组合，无时钟或复位接口。'] },
  { questionId: 'ADAPTED-ADVANCED-RTL-0002', contentVersion: 1, steps: [
    { title: '从扫描起点找当前候选', promptMd: '按起点加偏移的循环顺序查看req，只选择第一路请求。先分别检查无请求、只有一路请求以及全请求；起点不变时，请求集合变化是否可能改变组合候选？' },
    { title: '只在实际服务时推进起点', promptMd: '分别列valid/accept为0或1时是否发生服务。发生服务后应移到扫描起点后一位，还是实际获胜者后一位？检查获胜者处于最高索引时的回绕。' },
    { title: '用停顿和持续请求检验公平性', promptMd: '先跟踪持续全请求且连续服务，再插入accept=0的停顿。把成功服务次数与时钟周期数分开，说明持续请求和服务机会对公平性意味着什么；不要把组合候选误当必须锁住的总线payload。' },
  ], checks: ['组合扫描按(start+offset) mod 4，grant仅对应当前req中第一路，空请求grant/valid都为0。', '同步低有效复位将扫描起点设0，复位期间不计服务。', '仅accept&&valid更新，下一起点为实际获胜索引加1；winner=3时回0。', '全请求持续且连续accept时，前五次服务获胜索引为0/1/2/3/0；停顿与空闲不推进起点。', 'accept=0时起点保持，但req变化允许组合grant改变；本题没有事务锁定契约。', '公平性依赖请求持续与实际服务机会，以成功服务次数衡量；accept长期为0时不承诺有限时钟周期内获服务。'] },
  { questionId: 'ORIGINAL-RTL-0001', contentVersion: 2, steps: [
    { title: '先列复位、保持与正常计数', promptMd: '按优先级列出复位有效、使能关闭、使能打开三种情况。count什么时候保持，什么时候加1，什么时候回到起点？复位是沿触发还是异步断言？' },
    { title: '把tick当成更新事件而非计数状态', promptMd: '先用旧count与本沿en判断是否真的发生回绕，再安排tick。紧跟一次回绕后插入en=0，count应保持，但tick是否也应保持？检查默认清零是否被使能挡住。' },
    { title: '最后逐沿检查终值与复位优先级', promptMd: '推演终值前一拍、回绕拍、暂停拍，以及复位与en同时有效的拍。只满足题定合法计数序列，不擅自增加非法状态恢复或额外输出延迟。' },
  ], checks: ['同步低有效复位仅在上升沿清count/tick，优先于en。', 'en=0保持count，en=1按0到9再回0的模十序列更新。', 'tick只在旧count=9且en=1的实际回绕沿后置1。', 'tick默认清零放在en判断外；回绕后的暂停拍count保持而tick清0。', '完整可综合非阻塞时序逻辑，不把同步复位改成异步，也不额外要求非法状态恢复。'] },
  { questionId: 'ADAPTED-CODEC-DIV-0001', contentVersion: 1, steps: [
    { title: '用接受沿而非墙上时间定义相位', promptMd: '先计算一个半周期需要多少个en=1的输入沿，再定义内部计数保存的相位。暂停时哪些寄存器保持、哪个输出仍是逐沿事件？不要把暂停后的实时频率当作连续使能的稳态频率。' },
    { title: '在半周期终点区分翻高与翻低', promptMd: '用旧半周期计数与旧divided判断本沿是否翻转，以及翻转方向。完整周期tick在哪一类终点产生？终点之后插入暂停，检查事件是否被意外拉长。' },
    { title: '检查最小参数、复位和使用方式', promptMd: '把参数代入最小合法分频值，检查HALF和计数位宽是否出现零位声明。最后区分把tick作为原时钟域使能，与真的把divided接到另一个时钟端口，各自还需要什么实现条件。' },
  ], checks: ['DIVIDE为2到1024的偶数，HALF=DIVIDE/2，计数终点为HALF−1且en=1才翻转。', '旧divided=1的半周期终点翻低并报tick；其余非复位沿tick清0。', '暂停保持divided与内部相位，恢复后继续，tick仍每沿清0。', 'DIVIDE=2时HALF=1，计数至少分配1bit，不能直接声明零位宽。', '同步高有效rst优先清计数/divided/tick；只有连续使能稳态才承诺周期DIVIDE*T和50%占空比。', 'tick可用作原clk域clock enable；把divided当真实新时钟仍需时钟资源和generated-clock等实现约束。'] },
  { questionId: 'ADAPTED-CODEC-DIV-0002', contentVersion: 1, steps: [
    { title: '先单独列累计接受沿数', promptMd: '从复位后的零相位开始，逐沿只在en=1时增加累计接受数。把暂停沿单独标记，不让它们消耗半周期，也不要从恢复点重新计数。' },
    { title: '再把半周期终点映射到输出', promptMd: '按题定每三个接受沿翻转一次，将累计接受数映射为divided；每次翻低才产生tick。分别检查暂停发生在未到终点和高电平期间时的保持。' },
    { title: '最后比较接受计数与实际脉宽', promptMd: '圈出高电平开始和结束的真实输入沿，按沿间距离计算持续时间。连续使能时的3T半周期，能否直接套用到含暂停的这一段？同时检查tick在其他沿是否归零。' },
  ], checks: ['E3/E7不增加接受数，暂停保持相位，E1到E14共12个接受沿。', 'divided在E4/E8/E11/E14依次翻高/翻低/翻高/翻低。', 'tick仅E8与E14为1，其余沿包括暂停沿均为0。', 'E4沿后到E8沿后高电平持续4T，不能仍按3T计算。', '任意暂停可拉长实时脉宽，不保证输出始终周期6T或50%占空比。'] },
  { questionId: 'ADAPTED-BOUNDARY-DEBOUNCE-0001', contentVersion: 1, steps: [
    { title: '先把毫秒配置变成连续样本阈值', promptMd: '用题定参数和cfg推导阈值N，明确计数保存的是已连续观察到多少个反向样本，而不是累计抖动次数。输入回到当前stable时，未完成连续段应如何处理？' },
    { title: '先排优先级，再处理第N个样本', promptMd: '依次检查复位、配置变化、与stable相同、持续反向四类情况。配置变化的当沿是否属于新计数段？旧计数到什么值时，本沿反向样本会刚好完成阈值？' },
    { title: '检查位宽、双方向和事件脉冲', promptMd: '用最大配置估算计数与阈值需要表示的范围，再检查稳定后继续同值是否会重复changed。复位时记录配置有什么作用？区分N个采样点与从第一到最后采样点的时间跨度。' },
  ], checks: ['N=5*(cfg+1)*CYCLES_PER_MS；连续反向才累计，sample==stable立即清掉未完成计数。', '同步复位优先清stable/changed/计数并记录cfg；cfg变化次优先，清计数、保持stable并丢弃本沿样本。', '正常反向样本在旧计数N−1时更新stable、清计数并令changed=1，避免多等或少等一拍。', '配置变小也不继承旧连续段；次沿重新计数，不能立即用旧计数触发。', '默认最大N=1000000，计数0到999999和阈值N均可用20bit表示；参数缩小时仍按合法范围实现。', 'changed为单次事件，两个方向均适用；模块输入已同步，不把采样逻辑说成模拟滤波或CDC配置相干处理。'] },
  { questionId: 'ADAPTED-BOUNDARY-DEBOUNCE-0003', contentVersion: 1, steps: [
    { title: '先把配置变化沿从连续段中切开', promptMd: '标出所有cfg改变的沿，按契约清旧计数并丢弃当沿sample。将输入切成互不继承的连续段，再给每段标上新配置的阈值。' },
    { title: '按新段的第一个有效样本重新编号', promptMd: '不要把配置变化沿编号为第一个样本。从它的次沿开始逐个数，找到第N个新样本；同时检查stable更新之后，未完成计数与changed下一沿怎样变化。' },
    { title: '再推反方向并核对参数含义', promptMd: '对输入反向且配置同时改变的情形，用相同优先级重新推演。最后检查两次stable更新是否各只产生一个changed，并说明测试缩短参数为何不能直接解读成真实毫秒。' },
  ], checks: ['E1到E3累计3次旧反向样本；E4改cfg时清0并丢弃该样本。', 'E5到E14是10个新1，E14沿后stable/changed=1/1且计数清0；E15的changed清0。', 'E16配置变化优先，保持stable=1、清计数且不计该0。', 'E17到E21是5个新0，E21沿后stable/changed=0/1且计数清0。', '旧配置计数不继承，changed不是stable电平；CYCLES_PER_MS=1仅为缩短测试，不是50MHz下真实每毫秒一个采样。'] },
];

export function guidanceFor(question: Question): GuidanceContent | undefined {
  const item = questionGuidance.find(g => g.questionId === question.id && g.contentVersion === question.contentVersion);
  return item && { steps: item.steps, checks: item.checks };
}
