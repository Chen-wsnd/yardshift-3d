# YARDSHIFT v0.6 — 唯一产品与工程总执行规范（Cursor Master Spec）

> **文件性质**：单一权威产品目标 + 交互设计 + 工作因果规则 + 资源调度 + 工程架构 + 分阶段连续执行 + 最终交付标准。**本文件是要执行的，不是头脑风暴。**
>
> **适用项目**：`https://github.com/Chen-wsnd/yardshift-3d`  
> **编制日期**：2026-11-22  
> **最近已核实远程基线**：`feature/p0-resource-orchestration-lawn` @ `cc5853fce6b886e3474060c37d40d02e183e2a4d`。后续若有新提交，须以实际已存在的最新兼容提交为基线，先对照本文件，不允许倒退代码。  
> **替代关系**：本文件**取代**此前分散的 `YardShift_v03_reuse_first_execution_brief.md`、P0、V05 和 V05.1 文件，成为后续开发的唯一**执行入口**；旧文档保留作历史和来源记录，不要求 Cursor 同时服从其中过时的“P0 正在运行/完成每 Gate 停止”等规定。  
> **授权给 Cursor 的范围**：在 feature branch 上连续完成本文件的 M0–M7；每阶段自检并继续；无须逐项征求产品负责人批准；**不得合并 main、发布生产、引入授权不明资源、覆盖/清除现有存档**。

---

## 0. 一页决策总览：不要被下层细节拖离产品目标

### 0.1 唯一北极星（Product North Star）

YardShift 是一个**可玩的 3D 庭院工作模拟与工具学习体验**。让没有经验的玩家，通过亲自整理一个庭院，逐步理解熟练园丁如何：

**观察真实工作环境 → 识别风险和工作对象 → 决定工序 → 准备/选择合适工具 → 按工具设计原理操作 → 看见操作改变环境 → 处理副产物和失误 → 复盘效率并改进。**

**产品不是**：四个没有联系的小游戏；以赚钱、关卡、装备升级为核心的经营游戏；按固定正确顺序点击待办事项；炫耀 Shader 或物理引擎的 3D 技术展；每个工具一个深度模拟器。

### 0.2 用户要亲自发现的三个知识点

1. **工具为什么这样设计**：如滚刀割草机需要推进、动力割草机依赖电池、耙子和吹叶机不能代替装袋、打草机不能等同拔除根系。
2. **工具效率受场景制约**：大面积快不等于狭窄边缘精细；电动更快但有能源、操控和损伤约束；工具组合往往好于一种工具包打天下。
3. **工序比单项速度更重要**：例如先清扫再修篱会再次产生枝叶；但割草前发现的石头/硬枝必须先排除。不是把“清理永远最后”写死，而是让玩家理解**条件决定工作顺序**。

### 0.3 开发结果的最终判断问题

> 当同一个玩家在第一次做完一个庭院之后，第二次能否在相似或改变条件下，**主动做出更合理的工具与工序选择**，并从游戏世界中看到这种选择的收益？

如果不能，新增模型、粒子、动画、积分，都不是成功的替代品。

---

## 1. 严格的自上而下设计层级（每层不可私自改写上层）

| 层级 | 主管问题 | 固定决策 / 不变量 | 下层可自由调整什么 |
|---|---|---|---|
| **L0 目的** | 用户为什么玩？ | 学习经验型园丁如何观察、筹划、调配工具、降低返工 | **不可擅自改变** |
| **L1 体验** | 玩家通过什么学会？ | 自由决定顺序、真实操作、可见因果、可比较结果 | 教学文案、交互入口、视觉提示 |
| **L2 世界逻辑** | 行为如何影响彼此？ | 一个庭院、共享环境状态、任务间生成碎屑/风险/工作量、质量与安全优先 | 具体小规则和可校准系数 |
| **L3 业务流程** | 玩家完整做哪些事？ | 观察→准备→检查→作业→清理/恢复→复盘，可随时回到观察/计划 | 入口编排、可选步骤、提示时机 |
| **L4 操作模块** | 每种工具如何表现特点？ | 控制、覆盖、能源、限制、操作结果相互一致 | 单个工具输入与动画适配 |
| **L5 工程实现** | 怎样复用、连接现有技术？ | 保留稳定代码、单一权威状态、合法资源、空间对齐 | React 组件、R3F、实例化、Shader 等 |
| **L6 美术细节** | 如何好看且顺畅？ | 不妨碍理解/操作，不伪造因果，不牺牲性能 | 模型、草叶、碎屑、音效、视觉参数 |

**执行规则**：L6 想用新 Shader ≠ 可以改变 L2 草坪状态；L4 想做新工具 ≠ 可以让 L0 变成收藏装备游戏；L5 发现第三方完整割草游戏 ≠ 可以直接替换 L1–L3 的体验。只有明确的用户产品决策才能修改 L0–L3。

**处理冲突的固定顺序**：先保 L0→L3，接着保可用的 L4/L5 成果，最后调整 L6。低层无法满足高层时，优先寻找更便宜的资源或局部降级，而不是改高层目的。

---

## 2. 最终可玩的完整体验（**玩家流程**，不是开发顺序）

### 2.1 从进入到完成：一个连贯庭院

```
进入同一住宅庭院
  ↓
观察（看到草坪/绿篱/花坛/地面垃圾/工具）
  ↓
可选计划（玩家按自己理解排工作次序，也能直接开干）
  ↓
检查（按需排除石头、硬枝等明确危险；无需提前收走全部落叶）
  ↓
自由选择任意区域的工作
  ├─ 割草 → 部分草坪变短 / 草屑处理选择 / 电池与工具磨损
  ├─ 修篱 → 绿篱轮廓改变 / 剪下枝叶落到地面
  ├─ 修边 → 细边变整齐 / 可能伤及花坛
  └─ 花坛除草 → 拔根 or 截顶留根 / 可以误伤花 / 拔出杂草产生残余
  ↓
同一真实地面不断新增、移动、减少碎屑与障碍物
  ↓
耙 / 吹 / 聚堆 / 装袋；可以在任何时点做，也可以返工
  ↓
检查收尾：是否安全？是否达到合理整洁和质量？
  ↓
Work Review：在哪些地方省工、为何返工、工具限制是什么
  ↓
可重新开一遍相同条件或不同条件；玩家主动改进
```

**不要强制先后解锁**：除有证据的安全/物理前置条件，玩家可以先清叶、先修篱或先割草。工作流程中的箭头表示**因果和建议**，不是所有操作的硬锁。

### 2.2 前 30 秒的产品体验

- 正在运行的是**一个可辨认的住宅庭院**，不是空中漂浮的展示台，也不是菜单首页。
- 能看见明显的待处理草坪、绿篱、花坛和落叶，至少两个任务热点一眼可发现，另两个可探索发现。
- 首次仅一句自然提示，例如 `Take a look around. What would you do first?`。不默认显示四步最优解，不弹大篇课堂。
- 玩家可以先看看 `Inspect`、`Work Plan` 或直接点任意区域。最早的可见成功应是**局部场景真实发生变化**。

### 2.3 操作完成后的体验

- 所做的变化回到同一个花园里，位置不变；退出专项/刷新后仍在。
- 剪枝枝叶出现在刚刚剪过绿篱**下面或邻近真实地面**；已清洁过的地方可以再变脏。
- 电池耗尽可恢复，工具卡住可排障，误伤有后果但不会造成无法继续玩的死局。
- 复盘显示**发生过的具体事件**而不是指责“你没有按官方标准顺序操作”。同等安全/质量下再比较总投入。

---

## 3. 已核实工程基线：保留、补缺口、不重复造

### 3.1 最近核实的 P0 成果（2026-11-22 远程）

仓库 `Chen-wsnd/yardshift-3d`，`feature/p0-resource-orchestration-lawn` @ `cc5853f`：

| 已有资产或能力 | 文件或路径 | 使用决策 | 已知缺口 |
|---|---|---|---|
| 完整庭院 CC0 | `public/assets/models/yardshift-kit/saturday-morning-back-garden.glb` | **保留并适配** | 绿篱/花坛/落叶热点需实测模型空间 bounds |
| 总览与任务流 | `src/features/garden/GardenShell.tsx`, `GardenOverviewScene.tsx`, `GardenCanvas.tsx` | 继续扩展同一入口 | 多任务热点/规划/维护/复盘入口缺失 |
| 手动滚刀割草机 | `manual-reel-mower.glb` | **保留真实独立 GLB 与 clips** | 人工视觉核验旋转轴和朝向 |
| 动力割草机 | `mower.glb` | **保留** | 电池能耗和恢复存在脱节 |
| 连续割草 | `LawnTaskStage.tsx`, `src/game/work/lawnSweep.ts`, `src/data/lawnGrid.ts` | **保留规则与路径采样** | 精细草面可改善；不重建路径系统 |
| 草坪权威状态 | 当前 24×16 微格 / `WorkCell` | 作为真实施工状态保留 | 现为伸缩盒子的 `LawnFootprintLayer`，视觉较抽象 |
| 持久化和旧玩法 | `src/game/store/gameStore.ts`（`yardshift-v03`），`/legacy` | 保留，向后兼容迁移 | 跨区花园领域事件缺失 |
| 电池显示及耗尽逻辑 | `GardenShell`, `lawnSweep`, `durabilityRules` | 保留并修复 | `refillTool` 属于旧经济系统；花园余额 0，界面无充电入口；可能双重耗电 |
| 现成园艺模型 | `public/assets/models/yardshift-kit/*.glb` | 能用的继续用 | 绿篱、花卉、落叶需可操作的独立可变层 |
| 自动测试/QA | `docs/P0_DEMO_QA.md` 报告 55 项通过 | 承接现有测试，不删 | 报告非独立实机体验认证，必须真实浏览器验收 |

**不可误报**：上述结论源于 GitHub 代码和 Cursor 提交报告，不表示此文件作者已实际操控用户本地浏览器；相机手感、性能、真实画面要由 Cursor 的本地真实环境验证。

### 3.2 启动时的源代码复核程序（Cursor 必须执行，但不允许无限调查）

1. `git status`, `git branch --show-current`, `git log -5 --oneline`；检查有无未提交更改，绝不覆盖用户现有改动。
2. `git fetch origin`，定位 P0 分支最新提交；若已有 V05 集成分支则检查它与本规范的相容性，优先**继续兼容的最新成果**，而不是重复执行已完成阶段。
3. 在最新兼容提交基础上创建/继续 `feature/v06-yardshift-full-experience`。保留 `/legacy`, 原有分支和数据；不合并主线。
4. 确认 `npm install` / 现有包管理方式可运行；执行 baseline `typecheck`, `lint`, `test`, `build`；若已有失败，按根因分类，不能把旧失败写成新功能结果。
5. 建立一个小文件 `docs/V06_EXECUTION_LOG.md`，记录各里程碑 `status/commit/evidence/risk`，后续只更新这份日志，不为每个微调创建新的权威计划。
6. 先了解已有代码真实接口，不再重复进行已经完成的全仓库研究；文件路径或存档版本变化时以实际代码为准。

### 3.3 绝对禁止的“重启”行为

- 不新建第二套 Next.js/Three.js 项目；不把第三方开源游戏替换为我们的产品。
- 不将草坪、绿篱、叶片数据分别放进无协调的多份持久化状态；不复制一套会互相矛盾的花园真相。
- 不因 UI/Shader 不完美就重写已通过测试的 `lawnSweep`、丢弃庭院模型或重置存档。
- 不以“先加经济系统/第二座房子/排行榜”作为功能缺口的解决方案。

---

## 4. 工作世界与统一状态：整个项目最关键的连接层

### 4.1 空间与区域注册（必须先测量，不能靠猜）

一个实际住宅庭院，几个可操作目标：

| Area ID | 角色与可见工作对象 | 局部操作 | 与其他区域的因果 |
|---|---|---|---|
| `lawn` | 未修草坪，局部花坛边界 | 割草机连续推行 | 产生草屑、被硬障碍阻挡、接近花坛会失误 |
| `hedge` | 未修的过长枝簇 | 手动/电动局部修形 | 枝叶落到真实邻近地面、可能挡后续作业 |
| `edge` | 围栏/步道/花坛旁窄草带 | 精细修边 | 细草残余、受保护植物风险 |
| `flowerbed` | 花/杂草独立个体 | 拔根与截顶 | 产生拔出物、保留根茎与可能的后续维护问题 |
| `debris` | 原有叶片、剪枝、少量其他残余 | 耙、吹、聚堆、装袋 | 任何已清扫位置可以被新施工再次弄脏 |
| `hazard` | 石头、金属小物、硬枝等 | 检查、移除 | 对具体机器区域建立必要的安全前置条件 |

**坐标契约**：
- 场景世界坐标统一为 `gardenWorld (x,y,z)`；每一个 task zone 显式保存局部到世界的变换矩阵/等价参数。
- 总览与专项可以不同精度，但 `id`、物理位置、可见效果必须一致。离开专项后不可把剪枝渲染到另一个角落。
- 参考仓库 `docs/gate0-garden-node-dump.json` 及 `saturday-morning-back-garden.glb` 计算真实 node bounds。不要把旧第二栋住宅 `j2-*` 的数值直接塞给新花园。
- 若某块现成 GLB 不存在需要的可交互结构，在其真实位置增加少量**独立 overlay**，而不是为整座房子重制模型。

### 4.2 单一数据权威

沿用现有 `useGameStore`、`WorkSnapshot` 及 P0 lawn 工作格。新增一个**薄的 garden domain slice/reducer**，共用同一个持久化事务，存储多任务耦合所必需的字段：

```ts
// 结构示意，根据实际 repo 兼容扩展；不要求逐字照抄
interface GardenDomain {
  schemaVersion: number;
  inspection: Record<string, { observed: boolean; timeOrEffort: number }>;
  hazards: Record<string, { x: number; z: number; cleared: boolean; blocks: string[] }>;
  hedge: Record<string, { cutClusterIds: string[]; overcutClusterIds: string[] }>;
  plants: Record<string, { topCut: boolean; rootRemoved: boolean; ornamentalDamage: boolean }>;
  debris: Record<string, { kind: string; x: number; z: number; state: "scattered"|"gathered"|"bagged"|"acceptable"; sourceActionId?: string }>;
  plan: { taskOrder: string[]; revision: number };
  effort: { productive: number; setup: number; rework: number; ineffective: number; recovery: number };
  events: GardenEvent[];
  appliedEventIds: string[];
}
```

**守则**：
- 既有草坪微格仍是草坪的唯一权威；不要把它拷入 garden domain 再做第二次更新。
- 领域事件是**离散可提交的工作事实**；每个动画帧不是持久化事件。3D 画面只是这些事实的投影。
- `eventId`、`objectId`、`generatedDebrisId` 必须稳定、幂等。重复发出同一次修剪不会凭空生出第二堆树叶。
- 保存数据版本必须可迁移；保持此前 `yardshift-v02` 不动，迁移 `yardshift-v03` 时保留未完成割草、电池、损伤信息。损坏存档要有安全回退，禁止默认 wipe。
- 对高速路径输入分批采样和提交，避免每帧深拷贝数百格并写 localStorage；需要性能诊断时可用 memo/batching/instancing，不必立刻建立大型 ECS。

### 4.3 事件语义（示意协议）

```ts
type GardenEvent =
  | { id: string; type: "INSPECTED"; objectId: string }
  | { id: string; type: "HAZARD_REMOVED"; hazardId: string }
  | { id: string; type: "TOOL_SELECTED"; toolId: string; previousToolId?: string }
  | { id: string; type: "TOOL_RECHARGED"; toolId: string; effort: number }
  | { id: string; type: "PLAN_REVISED"; orderedTaskIds: string[] }
  | { id: string; type: "WORK_PERFORMED"; taskId: string; toolId: string; affectedIds: string[]; effort: number }
  | { id: string; type: "HEDGE_CLUSTER_CUT"; clusterId: string; overcut?: boolean }
  | { id: string; type: "PLANT_ROOT_REMOVED"|"PLANT_TOP_CUT"; plantId: string }
  | { id: string; type: "DEBRIS_SPAWNED"; debrisId: string; sourceActionId: string; x: number; z: number; kind: string }
  | { id: string; type: "DEBRIS_MOVED"; debrisId: string; x: number; z: number }
  | { id: string; type: "DEBRIS_BAGGED"; debrisIds: string[] }
  | { id: string; type: "ENVIRONMENT_DAMAGED"; targetId: string; damageKind: string };
```

**跨任务核心例子**：`HEDGE_CLUSTER_CUT` → 在剪枝下方 `DEBRIS_SPAWNED` → 清理区 `dirty=true` → 耙/吹/装袋后 `dirty=false` → 另一次修剪可再次变脏。**不能**只在 UI 显示 `+1 leaves`，而地面什么也没有。

### 4.4 世界与施工模块各司其职

- `GardenTaskRegistry`：任务 ID、区域 bounds、摄像机位置、工具要求、任务 stage、场景热点；直接复用 `GardenShell/GardenOverviewScene`。
- `ToolRegistry`：某件工具的外观资源、识别图、动画、操作模式、适用任务、强弱项、能源/准备条件。
- `GardenDomain`：可保存的世界与跨任务事件。
- `Task Stage`：玩家输入的 pointer/drag 和工具动画；将合法空间动作转换为 `WORK_PERFORMED` 等领域命令。
- `Effect Adapter`：根据世界变化渲染草面、枝簇、叶堆、草茬和损伤。**效果可以替换，但不能篡改动作结果**。
- `Review Selector`：从事件/状态衍生效率和质量，不拥有第二份独立游戏进度。

---

## 5. 资源编排系统：拆解并吸收，而不是换游戏或重复造

### 5.1 每个资源必须走的决策流程

```
实际需求 → 检索/盘点成熟资源 → 许可与可复制性 → 资产技术检查
    → 对产品 L0–L4 的适配度 → 整合总成本（检索+适配+运行+维护）
    → ADOPT / ADAPT / EXTRACT / REFER_ONLY / REJECT → 验收与记录
```

**最多比较两项主要候选和一个降级方案**。合法且达标的现成资源存在时，不允许先从零做另一套；但如果适配明显比独立的简单连接层更贵，可采用简单自写模块。不能为了“复用率”牺牲产品意图。

### 5.2 已有资源与候选（状态不能混写）

| 模块 | 具体来源或文件 | 目前状态 | 选择/调度办法 | 未解决事项或回退 |
|---|---|---|---|---|
| 主庭院 | `saturday-morning-back-garden.glb`; https://3dassets.dev/assets/lawn-mowing-simulator-kit-saturday-morni-9591d235-starter-scene | **IN REPO / CC0** | 主视觉，运行时隐藏冲突节点 | 非交互模型需 overlay |
| 草坪/工具包 | https://3dassets.dev/packs/lawn-mowing-simulator-kit；本地 `yardshift-kit/*.glb` | **IN REPO / CC0** | 草坪外观、割草机、绿篱、园艺剪等 | 确认 GLB 节点及风格一致 |
| 手推割草机 | `manual-reel-mower.glb`; https://3dassets.dev/assets/lawn-mowing-simulator-kit-rusty-push-reel-mower-a7e5847b | **IN REPO / CC0** | 使用真实 `wheel-roll`/`blade-spin` | 检查真实动画姿态 |
| 动力割草机 | `mower.glb`; https://3dassets.dev/assets/lawn-mowing-simulator-kit-self-propelled-mower-with-gr-19515d26 | **IN REPO / CC0** | 现成动力机模型及 clips | 充电、能源记账、UI 恢复 |
| 绿篱基底 | `hedge-block.glb` | **IN REPO / CC0** | 已修基底 + 独立伸出的枝簇 | 不允许缩小整块模拟修剪 |
| 手剪/电剪 | `garden-shears.glb`, `hedge-trimmer.glb` | **IN REPO / CC0** | 工具视觉 + 我们的局部碰撞/轨迹 | 动画可用性需检查 |
| 线割机 | `string-trimmer.glb` | **IN REPO / CC0** | 修边与截顶，尽量复用路径采样 | 若真实模型朝向不同，使用适配变换 |
| 杂草/花坛 | `dandelion.glb`, `flower-bed-border.glb` | **IN REPO / CC0** | 单株杂草 overlay + 植物保护 | 找合法独立花簇补充，必要时简单几何回退 |
| 清扫工具 | `leaf-rake.glb`, `leaf-blower.glb`, `grass-bag.glb` | **IN REPO / CC0** | 耙/吹/袋视觉与真实输入效果配对 | 叶子空间移动是自写小型逻辑 |
| 落叶堆 | https://3dassets.dev/packs/turning-seasons | **CANDIDATE / 待下载检查** | 只选能在本院风格匹配的 CC0 落叶资源 | 使用小型叶片 sprite/instances 回退 |
| 其他院景/障碍 | https://kenney.nl/assets/nature-kit | **CANDIDATE / CC0 包** | 需要硬枝/石块/植物时少量补足 | 几何块只作小型风险标记 |
| 草叶倒伏/碎屑参考 | https://github.com/paulrobello/grass-blade (`src/game/vegetationFall.ts`, `cutEffects.ts`) | **RESEARCHED / MIT，未导入** | 可 EXTRACT 独立算法并遵守版权许可；不搬整个游戏 | 小型自有动画插值/实例碎屑回退 |
| UI Canvas 候选 | https://github.com/konvajs/konva | **RESEARCHED / MIT，未安装** | 仅当某局部操作显著更适合 2D 输入时采用 | 保留 Three/R3F 原有 3D 操作 |
| 工具图片 | 把已授权 GLB 离屏渲染为 PNG/WebP | **PREFERRED CUSTOM GLUE** | 统一工具箱与 3D 工具外观 | 先用现有文字按钮，不阻断主线 |
| 品牌型号信息 | 产品手册、厂家公开规格 | **REFERENCE ONLY** | 用于“最佳用途/限制”知识卡来源和校准 | 品牌名称/图片/Logo 再分发须单独核实 |
| 声音 | 未来具体逐条许可清楚的 CC0 / 可兼容音效 | **CANDIDATE** | 仅用少量操作音增强反馈 | 无音效也必须完整可玩 |

**资源状态词**：`IN_REPO`（已在目标仓库）／`VERIFIED_RUNNING`（实际加载并在运行时看到）／`RESEARCHED`（合法来源/技术已评估）／`CANDIDATE`（尚待验证）／`REFER_ONLY`（只参考不复制）／`REJECTED`。不得把候选写成成功导入。

### 5.3 三层工具复用模型（强制）

每个工具拆为：

1. **Identification（认识）**：名称、图、工具类型、原理、适用条件与边界；来源可以是授权 GLB 渲染的 2D 缩略图。
2. **Interaction（操作）**：可见实体、真实的刀/轮动画、方向、工作宽度、输入轨迹、能源和操作感觉。
3. **Outcome（后果）**：草/枝/杂草/叶片发生何种改变；质量、残留、额外清理、能源、准备与返工。

一张抠出来的产品图只能满足第一层，不能伪装第二层；一个 3D 模型不能自动证明第三层。工具能力必须由可维护的 `ToolRegistry` 明确连接三层。

### 5.4 素材合规

- CC0 模型可依许可证使用，建议记录原作者和修改；如果**复制** MIT 项目的代码，保留许可证和版权声明。不因改了几行就忽略许可。
- 品牌官网、电商商品照片、Logo：**抠图不产生新的使用权**。没有明确再分发/商业使用许可只用来研究，不提交公开仓库。
- 每一个实际纳入的模型、音效、图片、代码文件更新 `docs/ASSET_MANIFEST.md`、`docs/THIRD_PARTY_NOTICES.md` 和 README Assets & Credits；记录 `creator, source URL, license, local path, modified, actual usage, fallback`。

---

## 6. 玩家流程 F01–F09 的完整功能契约：每一步都有资源、技术、操作、状态、反馈、验收

> 这些 F 编号是**玩家所经历的流程模块**。它们的编码次序见第 8 节，不能据此强制玩家也按 F 编号完成。

### F01 — 进入花园、观察现场

- **教学意图**：看见问题之前不急着开始；同一园子有多种工作需求。
- **操作**：360° 有限轨道/三分之四视角查看；轻点草坪、绿篱、花坛、落叶区域，给出任务名、当前状态、可能问题；Inspect 按需展开。
- **资源复用**：`SaturdayGardenModel`, `GardenOverviewScene`, `GardenShell`, 现有完整庭院 GLB 与热点代码。
- **技术连接**：按真实 GLB bounds 初始化 `GardenTaskRegistry`；三维 mesh hitbox 与状态映射；不能凭空画不在场景里的热点。
- **状态**：`inspection[objId]`、实际风险的 observed 标记；点击观察本身不消耗施工进度。
- **可见反馈**：轻量 hover 高亮、目标区域信息、自然三维近景；不使用永久覆盖大矩形的霓虹引导。
- **验收**：无需教程可找到至少三个有事可做的区域；所有热点与可见模型位置一致；不能点击空地误入任务。
- **回退**：单层区域包围盒和预设相机可接受，无需复杂射线网格拾取；保持坐标真实性。

### F02 — 自由制定计划、准备工具

- **教学意图**：专业方法是调度资源；计划不是必须遵守的系统命令。
- **操作**：可选 Work Plan，按个人意图调整任务顺序；工具卡展示已拥有设备的适用范围；选择工具后该工具出现在任务中。
- **复用**：`equipmentProfiles`, `gameStore`, 已在仓库的 GLB，现有工具按钮。
- **必要开发**：极简任务顺序列表（升降按钮足够、无需额外拖拽库）；工具 ID/外观/状态统一映射；记录换工具准备投入。
- **状态**：`plan.taskOrder`, `revision`, `TOOL_SELECTED`, `setupEffort`；玩家临时换计划不回滚任何已施工状态。
- **可见反馈**：选择工具时显示“擅长什么 / 不适合什么”，第一使用时仅一条简短操作提示；避免强制长教程。
- **验收**：计划为 A→B 的玩家可先做 B；计划更改后庭院和已完成工作保持。
- **回退**：若重排 UI 复杂，简单上/下按钮即可，不阻塞全部流程。

### F03 — 作业前安全检查和局部障碍移除

- **教学意图**：不是所有清理都该放最后。石头、硬枝等需要在有关机器开始作业前排除。
- **操作**：玩家观察草坪或篱边，点击/靠近风险物检查，移除/避让；遇到模拟的在用鸟巢等应暂缓该局部修剪而非强行继续。
- **复用**：旧 `inspect`/`tags`/`WorkEvent` 机制、CC0 场景小物件；Kenney CC0 自然物是备用。
- **必要开发**：若干确定性 `hazardId` 和世界位置，`blockedToolKinds`；危险区域动力施工提示并停止，不产生虚假割草/失误收益。
- **状态**：`INSPECTED`, `HAZARD_REMOVED`；存档持久，移除后不再出现；只针对危险区域限制，别把落叶和普通杂草错误地设成全局阻挡。
- **验收**：未移除硬物的动力切割被正确阻止；移除后续作可进行；游戏没有死锁。
- **回退**：一个显眼的石块和一截硬枝就足以教会这个差异，不需要复杂随机危险。

### F04 — 大面积割草，真实工具差异与能源维护

- **教学意图**：手推滚刀与动力机的构造、效率、操控和能源差异，并理解为什么先准备电池。
- **操作**：从花园进入草坪；选择手推滚刀/动力机；沿地面推动，看到真实轨迹；靠花坛工作可能误伤；动力电量降低、耗尽停止；在工具台/工具栏 Recharge 后继续，**不要求任何余额/经济系统**。
- **复用**：P0 已完成 `MowerTool`、两台独立 GLB 和 `wheel-roll`/`blade-spin` clips、`lawnSweep`、384 细格及其持久化。
- **必要开发**：修复双重能源消耗；完整 UI 能源显示和 recharge；电源耗尽时停止效果、恢复后原位置继续；保留磨损和 repair/jam 之间的区别；避免在无电状态仍产生花卉受损。
- **状态**：草坪细格为唯一权威；`resource`、`status`、`TOOL_RECHARGED`、`recoveryEffort` 和已有损伤/质量分。
- **可见反馈**：手推滚刀转速依推进，动力机有更大有效工作覆盖、能耗提示；仍然让玩家看见花坛边界的工具限制。
- **验收**：无移动不割草；两台是真实不同 GLB；电池 0 → 不割 → 免费可用的准备性 Recharge → 再割；返总览/刷新保持结果；相同实际距离采样密度不同不导致明显不同电耗。
- **回退**：能源采用一次“模拟准备投入”即时恢复，而不是实时等充电；自然草叶效果可在 M7 统一优化，别阻塞其他工作。

### F05 — 绿篱：局部形状、剪下的枝叶和过切

- **教学意图**：为什么手剪精确但慢，电剪快但需控制轮廓；修剪产生后续清理需求。
- **操作**：观察未剪整的绿篱；手剪点/拖小段的多余枝簇；电剪沿目标边界做空间扫掠；剪完可见整齐边界，过切可留下缺口。
- **复用**：`hedge-block.glb`, `garden-shears.glb`, `hedge-trimmer.glb`，旧 `shape`、`entangled` 规则，P0 空间 sweep 的可复用数学。
- **必要开发**：已剪好的绿篱基座 + 独立过长 foliage clusters（合法 GLB 节点/少量 CC0 foliage）；定义目标轮廓 envelope；手剪窄范围、电剪长作用带；若有电池 tool 复用 F04 电源与恢复。
- **状态**：`hedge.cutClusterIds`, `overcutClusterIds`；每个有效剪断只触发一次 `HEDGE_CLUSTER_CUT → DEBRIS_SPAWNED`，枝叶世界位置与修剪位置一致。
- **可见反馈**：初始/半剪/修好/过切至少四种视觉可辨状态；下面出现枝叶，之后可清扫；返回花园仍有缺口或完成区。
- **验收**：不同工具对比；重复点击已剪枝簇不增加新垃圾；回到花园能看到落地枝叶和半修结果；刷新仍在。
- **回退**：不可拆的原模型不硬改，使用独立 foliage overlay；不用缩放整段绿色立方体冒充修剪。

### F06 — 草坪边缘与细节修剪

- **教学意图**：大机适合大面积，不代表适合所有角落。选择细部工具才会提高整项工作的效率和质量。
- **操作**：围栏、花坛、步道边出现较窄剩余草带；手动修边器或线割机沿真实边界操作，越界时可能碰到花卉。
- **复用**：`string-trimmer.glb`、旧 `hand-edger`/`string-trimmer`/`edge` rules，P0 path interpolation 和方向向量。
- **必要开发**：边缘 polyline/窄区域 mask、精细 action footprint、花/树皮保护状态；不能让大割草机自动包办所有边缘。
- **状态**：边缘 work cells（不得与 lawn 计为同一未完成对象的重复工作）、损伤和少量 debris。
- **反馈/验收**：完成大面积草坪后依然能认出少量边缘未处理；局部修边可见；线割机更易误伤娇弱植物。
- **回退**：边缘可以是草坪近景里的另一种模式，无需大新页面。

### F07 — 花坛：识别杂草与花，拔根不等于割掉顶部

- **教学意图**：工具的目标机制不同；“一时看起来整洁”不必然意味着处理了根；不要错伤需要保留的植物。
- **操作**：缩放花坛，选中真实独立的杂草；使用手动除草器拔根；线割机只能削短顶部，根仍在；可以误伤花并看到结果。
- **复用**：`dandelion.glb`, `flower-bed-border.glb`, `string-trimmer.glb`，旧 `hand-weeder`, `pull`, `cut`, `stubble`, `flower_damaged`。
- **必要开发**：各棵植物独立 `PlantEntity`/可交互 overlay，`rootRemoved`, `topCut`, `ornamentalDamage`；拔除产生一份可清理的 pulled weed，切顶留茬。
- **状态**：植物 ID/根/顶部/花损伤；事件幂等；状态关联花园同一空间位置。
- **反馈/验收**：至少可以看出原状、完全拔除、仅截顶留根、误伤；刷新后结果不变，不能通过一次线割等价完成拔根目标。
- **回退**：固定 3D 近景和少量独立模型；无需多种季节生长系统或农药化学模拟。

### F08 — 地面清理：耙、吹、聚堆、装袋与再次变脏

- **教学意图**：工具目的不同，清扫时机影响返工；清理不是一个全局擦除按钮。
- **操作**：玩家选择耙子沿路径推/拉叶，或吹叶机按朝向把叶片移动到一处；形成 pile 后，靠近 pile 使用袋子装走；中途反向吹可以把堆吹散。
- **复用**：`leaf-rake.glb`, `leaf-blower.glb`, `grass-bag.glb`；旧 `rake`, `blow`, `bag`, `scattered`, `bagged` 逻辑；候选 Turning Seasons CC0 leaf pile。
- **必要开发**：少量 debris clusters/instanced leaf sprites 的确定性位置更新、区域聚类、bag 距离检查；不建立大规模刚体/空气动力学系统。
- **状态**：`debrisId`, world position, status, generatedBy, bagged`; 每次源工作产生新碎屑后再变脏；同一个事件不能重复产生 pile。
- **可见反馈**：散落→定向位移→聚拢→袋装；移动与工具方向相关；清完后修篱可再次出现枝叶。
- **验收**：不能隔空点击一次清空全场；耙和吹产生不同的作用范围/方向；先清扫后修篱的路线 A 比后清扫的路线 B 多出实际返工，而不是预设扣分。
- **回退**：轻量 sprite/mesh instances + 简单聚类即可；没有授权叶子 GLB 时不用无许可模型。

### F09 — 收尾、质量与工作效率复盘

- **教学意图**：专业程度体现在整体方案，而非局部动作速度。玩家应该理解第一次慢在哪里，并愿意第二次改进。
- **操作**：回到庭院检查未完成位置、安全风险和伤害；选择继续施工或结束；Work Review 给出真实累计投入和少量“为什么”的可选解释；提供一个同条件专业参考路线，但非唯一标准。
- **复用**：已有质量/损伤/事件记录、工具状态、持久化 store。
- **必要开发**：`reviewSelectors`：按事件累计有效工作、工具准备、返工、无效重复、恢复操作；质量/安全不过关不能把“最快”说成最好。
- **状态**： `productiveEffort`, `setupEffort`, `reworkEffort`, `ineffectiveEffort`, `recoveryEffort`, `quality`, `unresolvedHazards`，并可复位新一次模拟而不误删旧版本存档。
- **可见反馈**：两个不同顺序产生相似最终质量，但多次清扫路线的 `reworkEffort` 更高；指出具体“这片地在修篱前已被清扫一次”。
- **验收**：A/B 两条实际执行路径结果可复现；指标由真实事件而非固定错误顺序系数产生；玩家可以改进再试；不为评分强制进行不必要的草屑装袋。
- **回退**：纯文本/条形工作总结可接受，暂不开发逐帧录像或排行榜。

---

## 7. 工具知识、差异与工作效率：贯穿所有模块，不再单独制造教育小游戏

### 7.1 初版工具对照表（游戏模型值 ≠ 现实厂商参数）

| 工具 | 主要任务 | 设计优势 | 代价或限制 | 通过什么真实体验到 |
|---|---|---|---|---|
| 手推滚刀割草机 | 割草 | 手动控制和较细切割 | 有效推进、草高适配局限、窄覆盖 | 推动才转刀，窄条，通常更费推行投入 |
| 动力割草机 | 割草 | 更宽更快处理开阔草坪 | 电池耗尽、边缘不灵活、维护 | 较宽足迹，电量变化，准备性 recharge |
| 手动修边器 | 边缘 | 精准 | 工作范围窄、慢 | 围栏/花坛边小范围精修 |
| 线割机 | 边缘、杂草截顶 | 灵活、较快 | 容易误碰保护物、无法拔根 | 截顶留根、不同扫掠宽度 |
| 园艺剪 | 绿篱 | 细粒度控制 | 连续大范围效率低 | 一簇簇剪，容易控制轮廓 |
| 电动绿篱剪 | 绿篱 | 长条连续修形 | 电源、过切缺口风险 | 轮廓连贯、快速切、枝叶落地 |
| 手动除草器 | 花坛 | 对根部处理 | 单株工作量高 | 根状态变更与拔出草体 |
| 耙子 | 清理 | 小范围聚拢 | 路径较多 | 沿着轨迹收集/推动叶片 |
| 吹叶机 | 清理 | 快速移动疏松叶片 | 方向敏感、会把堆吹散 | 朝向改变落点与散开情况 |
| 园艺袋 | 收纳 | 收走已成堆垃圾 | 不能替代聚拢 | 接近叶堆才可装袋 |

**不要随意硬编码“电动比手动强三倍”**。工作宽度、能耗、操作限制可用合理的游戏参数，调试和学习结果优先；来源必须标明为游戏简化模型，不能冒充真实品牌规格。

### 7.2 教学出现在哪里

- **第一接触**：工具上显示一句用途，操作开始只显示必要控制提示。
- **操作错误时**：先显示真实结果（无效、留根、花受伤、叶吹散），再提供可选 `Why?`，不弹阻塞性训话。
- **环境新变化时**：玩家亲眼见到剪枝落地、花受伤或电池耗尽，这才是主要反馈。
- **复盘时**：展示真实行动顺序、追加工作和可尝试的替代顺序。说明“为什么”，不给唯一答案。

### 7.3 充电的教育价值（不是只补按钮）

玩家可以不事先充电、做到一半停下恢复；也可以观察到低电量，提前 Recharge。系统记录恢复/准备投入。两者都能完成，但玩家通过自己的经历明白为什么园丁施工前会检查和准备工具。

不要引入现实几小时倒计时；学习的是工作准备，而非等待壁钟。初版一次充电固定少量**模拟投入**即可，后续若确有价值才增加备用电池策略。

---

## 8. 唯一工程执行路线 M0–M7（**开发顺序**，自动连续推进）

> M 编号是开发依赖顺序，不是玩家必须遵守的任务顺序。M0–M7 完成后形成一个完整可演示体验；不是每个 M 都要等人工批准。

| 次序 | 里程碑 | 必须可玩的结果 | 依赖与复用 | 完成证明 |
|---|---|---|---|---|
| **M0** | 基线复核 + 设备生命周期 | 电池用尽→Recharge→继续，同一片草坪进度不变 | P0、旧 durability 规则 | 充电/磨损/旧存档回归，真实 UI 可用 |
| **M1** | 统一世界事件 + 真实区位 | 任一工作可在邻近地面新增碎屑，刷新保留；四任务真实热点 | 现有 garden GLB/node dump/store | 幂等事件、坐标一致的真实画面 |
| **M2** | 绿篱工作与枝叶 | 手剪/电剪能局部修形，切下枝叶落地 | GLB、已有 `shape`、M1 | 初始/半修/修好/过切；剪枝一次性产生 |
| **M3** | 清理动作与返工循环 | 耙/吹/聚堆/装袋可玩；先清后修与先修后清结果不同 | 清扫 GLB、M1/M2 | A/B 两流程同等整洁，返工投入不同 |
| **M4** | 观察/安全检查/自选计划 | 先观察+移危险物；可自由改变顺序；准备投入影响结果 | area registry、hazard + events | 风险不会误伤；计划不锁次序 |
| **M5** | 花坛除草与精细修边 | 根 vs 顶；大机 vs 细部；花伤和杂草残余可见 | P0 sweep、工具 GLB、M1 | 根/顶/伤害、边缘和总览一致 |
| **M6** | 复盘学习 + 工具知识 | 显示行动和真实返工、能源/换工具成本；可选知识卡 | 全部事件、工具 registry | 同条件 A/B/C 能解释差别 |
| **M7** | 成品统一与最终交付 | 画面连贯、交互顺手、全流程截图、Credits、运行可靠 | 所有完成模块 | 实际浏览器路线完整、性能与构建符合要求 |

### M0 — 先修真实阻断缺口，不只是表面按钮

- 保留 P0 已有两种真实 GLB 动画与路径系统。给 `GardenShell` 工具栏或工具台一条 `Recharge` 可点入口，与 `rechargeTool` 领域命令相连。
- 花园模式不再借用收费的旧 `refillTool`；旧 v0.2 经济模式保持其语义，避免产生新费用冲突。
- 检查 `applyLawnSweep` 中按路径长度扣电与 `applyWear` 通用每笔扣电；在 garden 模式去重；同一路径采样频率不同耗电差别应很小。
- Recharge 恢复 `battery`，不能神奇修复 `broken/jammed`；修理/清障必须有可达路径或首版明确隔离不容易触发的严重状态。
- 检查 0 电时 mower 是否确实无法切、刀片动画是否停止，草坪/花坛损伤和进度不被重置。
- 单元测试 + 浏览器检查通过，就**立即进入 M1**，不要为充电 UI 的按钮阴影停留。

### M1 — 唯一世界状态与因果底座

- 扫描庭院 GLB node bounds，建立 `GardenTaskRegistry` 的 lawn/hedge/flowerbed/edge/debris/hazard 区位；先保证真实一致，再处理华丽摄像机切换。
- 在既有 Zustand persist 内新增薄的跨任务 `GardenDomain`（不新建第二 store），稳定 ID 和迁移。为已完成 P0 的存档做保留升级；事件要 idempotent。
- 做最小夹具演示：一个已经清理过的位置 → `HEDGE_CLUSTER_CUT` → 一份可见枝叶出现在地面 → dirtiness 再次上升。阶段性可以 fixture，不可谎称已建成完整绿篱。
- 构建一个视觉位置/状态测试，证明任务区和总览使用同一坐标/状态。

### M2 — 绿篱专项连通因果

- 确认 `hedge-block.glb` 是修好底座，用独立 foliage overlays 创建过长枝簇；不要整体缩放盒子。
- 手动修剪和电剪的区域作用、难度与损伤不同；被剪 cluster 生成与真实空间一致的 debris。
- 支持未完成、半完成、过切和完成状态，回总览一致；不因一次视觉不完美就退回模型搜集阶段。

### M3 — 清理与顺序验证（产品价值里程碑）

- 先做简单确定性定向移动：rake 窄的路径作用，blower 更宽且由工具朝向决定，bag 只在附近有 pile 时工作。
- 用真实叶片或合法简化实例看到散叶、移动、聚堆和离场；不要求流体模拟。
- **强制端到端因果测试**：路线 A = 清理→修篱→再次清理；路线 B = 修篱→清理。最终质量接近，A 的真实返工和工具动作更多；这个差异不能用预设 `wrongOrderPenalty`。
- 若 A/B 不成立，优先修世界事件和空间作用，**不是先做漂亮 Review 界面**。

### M4 — 观察、局部安全约束、工作计划

- 为 lawn 等区域加入少量可见的硬障碍并接入 `Inspect/Remove`，只对有物理危险的动作限制；不宣称所有落叶都是危险。
- 计划功能支持可调整顺序和自由绕过；实际操作顺序由玩家决定，计划仅用于帮助和复盘。
- 工具选择、工具恢复、风险检查纳入投入统计；不创建劳动成本很高的装备商店。

### M5 — 细部工作成为工具学习的重要对照

- 花坛区有独立的保护花与杂草，手动拔根与线割截顶分开；误伤状态可见。
- 草坪 edges 用现有 sweep 技术适配窄边界；宽机完成 lawn 不能顺带覆盖所有边缘。
- 植物/边缘的状态与碎屑进入统一世界，不得出现“另一个小场景完全不影响原花园”。

### M6 — 不说教的 Work Review

- 根据事件累计：`productiveEffort`、`setupEffort`、`reworkEffort`、`ineffectiveEffort`、`recoveryEffort`、质量、安全。
- 同等质量/安全才比较效率；明确展示清理后又出现新枝叶的前因后果。支持单一可选专家样例作为讨论，不把它设为唯一答案。
- 给玩家一次新的相同条件重试入口与可对比摘要；是否多工具、多作业顺序都允许。
- 认知最优验收：不看文本，玩家能从实际体验回答一台工具何时合适、何种操作导致返工。

### M7 — 统一视觉、性能、可公开演示

- 草坪可视层目前是 384 个 box instances。优先**仅替换显示层**为更自然的授权草簇 instances / grass strips / 局部贴图与剪短过渡，保留权威格与存档；不为了照片般写实创造全新物理系统。
- 工具卡优先从现有 CC0 GLB 渲染成透明 PNG/WebP，无法及时完成则保留名称和明确轮廓。公开仓库不要包含无再分发权的品牌照片。
- 修复影响操作识别的相机、尺寸、点击区域、工具朝向、遮挡，保持 3D 统一美术风格。
- 做简短音效可选；体积/性能按实际浏览器和设备控制，初步目标可玩场景操作稳定且尽量达到 ≥30 FPS（若环境不支持测量，明确记为未测）。
- 最终实际浏览器截图/短流程演示：观察 → 修篱 → 草坪 → 边缘/花坛 → 统一清理 → 复盘；另含先清后修返工对照。更新 Credit/来源/限制，最终交付一次汇总。

---

## 9. 因果、效率、安全的不可变游戏规则

### 9.1 不硬编码“唯一正确顺序”

推荐示例：检查清走硬障碍→修篱/割草/修边/花坛（按现场需求）→集中清理。**但不是关卡锁定**。

例外：草坪上的石块/硬枝须先移除，绿篱发现正在使用的巢应避开相应区域（真实操作还需遵守当地法规与专业指引）；草屑在合适条件下可以留下，不一定算垃圾；可能传播种子的杂草有合理的前置处理理由。

### 9.2 不把单纯工具速度当作效率

```
TotalEffort = productiveEffort + setupEffort + reworkEffort
            + ineffectiveEffort + recoveryEffort

CompareEfficiency only if:
    minimumRequiredWorkDone
 && noUnresolvedBlockingSafetyHazard
 && qualityWithinAcceptedRange
```

这些都是**游戏内部校准投入单位**，不能冒充现实工时。有效工作量由真实空间作用累计，换工具/准备/充电有合理固定投入，返工来自真实多次清扫同一地点的新碎屑，不能用“玩家选错顺序 +50%”之类常量作弊。

### 9.3 核心对照场景（用确定性初始庭院 fixture）

| 场景 | 操作路线 | 预期结果 |
|---|---|---|
| A 低返工 | 移危险物→修篱→割草→集中清理 | 高质量，清理一次相关地面 |
| B 重复劳动 | 移危险物→先清理→修篱→再清理→割草 | 高质量，同一地面重复动作和返工更多 |
| C 选择工具 | 只用动力机做大草坪 vs 大机配手动细部工具 | 同样目标下观察边缘精度/准备/效率权衡 |
| D 安全检查 | 有石块的局部盲目推机 | 该局部动作被阻止；检查移除后恢复 |
| E 不同除草效果 | 线割截顶 vs 手动拔根 | 前者可留茬和根，后者目标根部移除 |
| F 能源准备 | 中途电量耗尽后 Recharge vs 提前准备 | 两者都能完成，但记录不同准备和恢复经历 |

**硬验收**：B 比 A 有更多真实重复清理；不存在固定顺序错误惩罚。即便玩家不照 A 做，也可能找到其他合理流程。

---

## 10. 工程测试、浏览器实证与质量关口

### 10.1 自动化必须覆盖的独立因果

- `mower-no-move-no-cut`：无地面位移不割草；P0 回归。
- `tool-model-distinct`：手推、电动两台 GLB 不相同，正确动画绑定。
- `battery-exhaust-recharge-resume`：电量为 0 禁止切割、可恢复、可继续；不要求余额；不能通过 Recharge 恢复已坏工具。
- `battery-sampling-invariance`：等长路径不同 pointer 采样不导致显著能源记账差异；避免 generic wear 和 lawnSweep 双重能源扣除。
- `persist-and-migrate`：旧 v03 草坪/电池/损伤保留，v02 legacy 不丢，新 garden domain 保存和恢复。
- `single-source`：任务 stage/总览同一空间 ID、同一世界状态；位置转换测试。
- `event-idempotent`：重复事件不重复生成碎屑、损伤或返工。
- `hedge-section-cuts`：手剪/电剪覆盖范围不同；修剪与过切状态不同；剪枝只生成一次。
- `debris-moves-by-vector`：叶片/碎屑移动跟随耙子路径或吹叶方向，不能无差别全场消失。
- `bag-requires-local-pile`：未聚堆、远距离不能直接装走全部垃圾。
- `clean-then-hedge-dirties-again`：先清扫的区域后续可因新工作再次变脏。
- `review-from-events`：真实清扫两次比一次投入更高；计划顺序本身不直接加罚。
- `plan-is-optional`：跳过计划仍可玩；随时改计划不重置工作。
- `hazard-before-mower`：危险局部被阻止且有移除路径。
- `weed-root-vs-top`：根/顶部状态分开；误伤花卉一次性。
- `safe-quality-gates`：质量/安全不达标时不能被评价为最优。

### 10.2 每个里程碑必须自己验证并继续

1. `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`；记录真实命令结果，不仅写 PASS。
2. 可以运行本地服务时，通过真实浏览器执行本阶段最短可玩路径、检查 Console/网络和实际画面；可以使用 Playwright 或项目现有测试设施，不能只把 HTML 200 当成场景可玩。
3. 记录截图/可复现操作步骤；截图应真实来自正在运行的代码，不可用 AI 图片冒充游戏输出。
4. 若可选的美术增强失败，保留稳定降级方案，记录在 Backlog，不阻碍下一阶段；若影响主线因果或功能，则当场修复再继续。
5. 本阶段有清晰提交与 `docs/V06_EXECUTION_LOG.md` 更新后进入下一阶段，**无需再向用户要下一份 task**。

### 10.3 最终端到端演示的 8 个检查点

1. 从 `/` 看见完整花园和可选择的区域，不是空天空/方块草毯主导。
2. 观察到障碍并可处理；跳过计划不锁任何非安全任务。
3. 两台不同割草机形成不同的空间轨迹；电池耗尽可以恢复。
4. 绿篱从杂乱到局部修好，剪枝真实落地，过切可见。
5. 一片地清干净后继续修篱，又出现需要处理的剪枝。
6. 耙/吹/聚堆/袋不同工序实地操作，返工路径与经济路径都可完成。
7. 花坛拔根/截顶/花损伤以及边缘精修具备肉眼可辨的结果。
8. 最终 Work Review 用事件解释为何某条路线更省投入；刷新/返回不丢世界状态。

---

## 11. 防止“细节越打磨越停不下来”的工程治理

### 11.1 功能质量三档

| 类型 | 例子 | 处理方式 |
|---|---|---|
| **阻断核心体验 / P0 缺陷** | 电池耗尽不可恢复、任务结果不同步、修剪不产生枝叶、危险行为穿透、刷新丢数据 | **必须现在修复**，因为违背 L0–L3 |
| **明显影响辨识和操作 / P1 缺陷** | 热点与模型错位、工具朝向错误、草面全部像格子导致不知是否割草 | 以最小资源修到**可辨认且顺畅**，不无限返工 |
| **纯锦上添花 / P2 改进** | 草叶风摆更逼真、更多商品品牌、第二种机械皮肤、音效数量、额外粒子 | 登记 Backlog，不阻断后续主线 |

### 11.2 每阶段“够好就过”的明确定义

只要阶段满足：**功能因果真实、交互可理解、必要状态可见、主要测试通过、无阻断 bug、已记录授权和回退方案**，即可继续下一阶段。美术达不到个人理想但不影响理解时，不允许停在一个工具上进行无限刷新。

**要立刻停下某一局部打磨**：
- 连续两轮调整没有提高主要体验指标；
- 新的 visual effect/依赖会要求推倒已经稳定的业务状态；
- 本阶段目标已经满足，剩余问题是可选视效或 UI 微小间距；
- 下一个里程碑比当前微调更直接地服务 L0–L3。

### 11.3 异常恢复优先级

- 新资源非法/加载失败 → 换已许可的同类资源 → 尝试已有 GLB 的 overlay/简化版 → 暂记录缺口，继续不依赖部分。
- 新动画/效果导致卡顿 → 降低实例数/LOD/去掉非必要粒子 → 保留世界状态规则。
- 新 UI 破坏任务入口 → 回到可操作的最简控件；先保证玩家可操作。
- 新存档迁移风险 → 新增兼容迁移和备份测试；不可直接清空本地用户数据。
- 核心任务确实无法以合法资源或可逆方案实现 → 记录阻塞和证据，再找产品负责人决策。

### 11.4 不需要再请求人的问题

Cursor 可以自主确定内部类型名字、组件拆分、测试文件位置、数值校准初值、轻量动画、缓存优化、是否以 hover/按钮进入任务，以及已授权模型的常规修整。

**真正必须提问**：要变更 L0–L3；需要丢弃已稳定的主要能力/用户存档；无法获得关键资源的合法许可且所有回退失败；存在两种根本冲突且不可逆的产品路线；涉及自动部署/公开发布/商业授权许可。

---

## 12. 提交、进度、来源与最终交付

### 12.1 一条线持续推进，不断开新权威计划

- 在 `feature/v06-yardshift-full-experience` 连续实现 M0–M7。每段完成一个带意义的提交，如 `feat(v06): M0 rechargeable mower lifecycle`；别因为每个修复建一个孤立仓库/文档。
- 主计划只有本文件。若出现设计上的小变化，在 `docs/V06_EXECUTION_LOG.md` 用 `Decision / Reason / Parent-level impact / Reversal` 一条记录；不要自行另起 V07、V08 来夺走权威。
- 每段状态必须标记 `DONE`、`PARTIAL`、`BLOCKED`、`DEFERRED`，并列出证据、真实测试结果和必要 follow-up。`PARTIAL` 不允许虚报 `DONE`。
- 每阶段都把新资源真实来源、具体许可、使用状态更新到 manifest/credits；没有拷贝代码就不要声称已复用实现。
- 如果某阶段可选子功能无法实现，继续能安全推进的独立工作；不得把整体长期卡在没有教学价值的装饰细节。

### 12.2 最终完成定义（Definition of Done）

只有当以下均达成，才能说“完整 YardShift v0.6 可演示”：

- 同一个可辨认的 3D 庭院可进入、自由选任务，并在任务/总览之间返回。
- 割草、绿篱、花坛/修边、地面清理都有真实 3D 互动或清楚的任务局部交互，且状态持久、位置一致。
- 修剪产生可见后续清理工作，先清后修能可玩地造成返工，玩家可以主动优化路线。
- 至少两类工具可明显感受到**为什么不是一把工具全能**；新能源/维护能够恢复、不中途死锁。
- 观察风险、非强制计划、质量与安全优先的复盘存在，且不硬编码固定完美顺序。
- 通过自动化测试与真实浏览器主路径的证据；关键图片来自实际运行的游戏。
- 外部资源许可/作者/来源/修改、Credits 完整；没有不明授权的产品照片/商标混入公开代码。
- 没有明显的阻断异常或严重存档迁移风险。

### 12.3 最终交给用户的交付包

Cursor 应**持续执行直到完整 DoD 或真正的重大阻塞**，然后一次性报告：

1. 分支名、最终 commit SHA，以及 M0–M7 各自的 SHA / DONE-PARTIAL-BLOCKED 表。
2. 四条工程命令真实结果（含通过测试数量和已知跳过项）。
3. 至少 8 个可复现玩家流程检查点及真实截图或短视频，尤其是“先清→剪→再清”的返工对照。
4. 外部资源清单与许可说明，明确哪些实际纳入、哪些仅研究。
5. 可在 `http://localhost:3000` 运行的本地演示步骤（不能假定服务永久在运行）。
6. 仍存在的 P1/P2 缺陷、建议改进和为什么没让它们阻断主线。

**停止条件**：完整 DoD 达到，或遭遇第 11.4 节明确的重大阻塞。不得因为完成 M0、M1 或某个工具的视觉微调就自动停止。**如果所有步骤可实现，就把完整项目做出来，而不是不断索要下一份小任务。**

---

## 13. Cursor 开工第一条消息（可复制）

> Read `YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` as the **sole authoritative product and implementation contract**. Continue from the latest compatible commit based on `feature/p0-resource-orchestration-lawn` (verified at `cc5853f`), preserve prior good work, and create/continue `feature/v06-yardshift-full-experience`. Maintain the L0→L6 design hierarchy. Implement M0→M7 sequentially without stopping for micro-task approval, using vetted existing assets, thin integration layers, one authoritative garden state, and the full user loop from survey to tool use to work-order consequences and review. After each milestone, run tests and browser checks, commit evidence, update `docs/V06_EXECUTION_LOG.md`, and **continue**. Treat correctness, work-order causality, persistent world state and recoverable tool lifecycle as blocking; defer cosmetic perfection. Do not overwrite saves, merge main, deploy, or redistribute unlicensed images. Stop only on a serious irreversible product/legal/data blocker or when the full Definition of Done is reached; return exact SHAs, test results, real screenshots, provenance and remaining nonblocking limitations.

---

## 14. 参考与现实边界

这些资料用于校准**简化的游戏情境**，不构成现实设备的安全操作说明或专业园艺培训认证：

- University of Minnesota Extension — mower safety: https://extension.umn.edu/garden-and-home/yard-and-garden/lawns-and-landscapes-in-minnesota/mowers-and-mowing-safety
- UMass Amherst Extension — lawn mowing/clippings: https://www.umass.edu/agriculture-food-environment/home-lawn-garden/fact-sheets/lawn-mowing
- Tufts Wildlife Clinic — yardwork and wildlife: https://vet.tufts.edu/tufts-wildlife-clinic/resource-library/yardwork-considerations
- Oregon State Extension — selecting mowers: https://extension.oregonstate.edu/news/choose-right-lawn-mower-your-yard

**本规范将真实技术、园艺经验及教学效果区分**：工具性能数值是演示中可调整的简化参数；素材许可需要逐项核验；真实用户浏览器体验必须以可复现演示为准。产品要呈现真正的选择与后果，而不是声称已模拟全部物理过程。
