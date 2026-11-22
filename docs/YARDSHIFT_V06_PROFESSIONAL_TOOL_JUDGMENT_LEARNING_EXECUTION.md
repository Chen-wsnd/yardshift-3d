# YardShift V06 — Professional Tool Judgment & Learning Loop
## 基于现有完整庭院的下一轮产品深化：从“能完成操作”到“会选择工具、判断现场和优化工序”

> **给 Cursor 的连续执行合同。不是新产品方向、不是 V07、不是一串等待批准的小任务。**
>
> **基线（2026-11-22 已从远程确认）：** `Chen-wsnd/yardshift-3d`, `feature/v06-experience-completion` @ `e4bf1501f18164574695a1595ac2a1e86e15ecd5`。本轮以此为新的已交付工程基线；不得从旧 `f19b6c1` 重做，也不得覆盖它。`main` 不合并；禁止生产部署。
>
> **权威顺序：** 原 `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` 的 L0–L6 和 F01–F09 仍是产品最高权威 → 本文件是 **e4bf150 后的学习体验与整体闭环实施补充** → 原 `docs/YARDSHIFT_V06_INTEGRATED_PRODUCT_IMPROVEMENT_GUIDANCE.md` 是已经完成的一轮审查和历史证据，不能无视 `e4bf150` 的新实现重复修复 R01–R11。冲突时优先保留上层意图与当前已验证的工作能力。
>
> **角色与方法：** 产品方向由产品负责人确定；本文件将教学目标翻译为具体交互与客观工程验收；Cursor 在独立 feature 分支连续实施、验证、提交、push。只有 L0–L3 不可逆的冲突、授权风险、存档风险或无法解决的阻断性问题才暂停；**不要每完成一个组件停下来征询下一条小任务**。
>
> **证据强度：** `CODE_CONFIRMED` = 已审阅 e4bf150 源码；`REPORTED` = Cursor 执行日志，尚未在此独立重跑；`TO_TEST` = 需本地/浏览器实测；`DESIGN` = 依据产品目标和园艺资料提出的实施方案。严格区分。

---

## 0. 不容改变的上层目标与成功定义

玩家通过亲自整理 **同一个持续存在的庭院**，逐步形成专业园丁的工作判断：

1. **观察与诊断**：识别工作对象、风险、易误伤区域、先决条件；不是看到闪光按钮就点。
2. **理解工具**：能说明某件工具为什么适合当前对象、它施加哪种作用、限制和安全边界是什么；而不是仅认识工具名字或 GLB 外观。
3. **自主选择并操作**：至少几个场景存在两种实际可行的工具/顺序，玩家通过操作看到覆盖、精度、能量、额外工作和风险差别。
4. **理解工序因果**：剪篱生成碎屑，碎屑落在真实位置；若先清后剪并实际第二次清理，相同区域发生已付出的返工；不允许固定“错误顺序”扣分。
5. **复盘与迁移**：玩家能指出第一次的关键决策、后果、第二次如何在**同等目标和质量**下改进，不依靠系统背诵一个唯一最优路线。

**产品验收的最终问题**：首次接触的人完成一次庭院体验后，能否回答 “我应该选什么工具、为什么、先做什么、什么行为让我返工、如果重来如何改变？”

**不是产品目标**：装备收集/升级、经济赚钱、背工具百科、必做考试、固定顺序通关、模拟完整园艺生物学或昂贵物理引擎。不得因技术方便把园艺学习做成隔离小游戏。

**判断每一项实现是否值得：** 如果删去它不影响玩家的判断能力、可见因果、可信操作、安全与结果理解，它可以进 backlog；如果它让玩家把不正确的工具行为学成正确知识，优先修复。

### 0.1 体验的最小学习循环（所有 F01–F09 共享）

`看到具体问题/风险 → 想选择什么及为什么 → 看到可用工具的能力和限制 → 亲手操作 → 同一世界发生可见结果 → 需要时调整计划 → 结束时看到基于记录的解释 → 同条件试不同方案`。

教学提示采用 **递进披露**：初始只给足够信息保证理解和安全；第一次尝试给局部结果；误用后给具体因果；最后复盘用行动证据解释。不要在进场时展示完整“答案清单”。

### 0.2 学习不等于惩罚

- 做得安全但费时 ≠ 失败；错误的工具通常表现为低覆盖、留根、重复工作或无法完成局部目标，解释原因即可。
- 不要通过惩罚单一顺序来“教授”顺序；不同初始条件可能有不同合理路径。
- 不要以现实危险作为可试错奖励：硬物、带电/旋转刀具和旁观者风险要明确阻断或安全反馈；不要做鼓励撞击刀片的演示。
- 即使中途结束，也能得到**如实的部分完成报告**，不能伪称“专业完成”；能返回继续，而非破坏存档。

---

## 1. 现有系统的已确认事实：在 e4bf150 上继续，不要再修旧版本的假问题

| 能力 | 现状（CODE_CONFIRMED） | 本轮策略 |
|---|---|---|
| 统一庭院 `SaturdayGardenModel` + 位置注册 | 真实 GLB + `gardenPlacement.ts`，一套世界坐标 | 不拆成小游戏、不重新建房/地形；所有操作投射原世界 |
| 割草 | 手推滚刀/电动 GLB、路径采样、细格 `WorkCells`、电池恢复 | 保留，补“为什么选择该工具”和真实 effort 解释，不复制权威草坪状态 |
| 绿篱 | 簇局部剪切、掉 `clipping`、手剪/电剪差异基础 | 保留，完善可辨认的剪切范围、粗枝限制、过剪反馈 |
| 清理 | 全院可达、动态碎屑聚焦、rake/blow/bag | 保留，完善动作可读性与空间表现；别把清理简化为全局消失 |
| 返工 | `spatialRework.ts` 区分 `potentialRedirty` / 实际二次清理 `rework` | 保留；按被清理对象与地点加强因果解释，避免“靠数值讲故事” |
| 修边 | `edgeSegments` 独立于草坪 WorkCell | 保留；显示路径旁真实草边变化和工具差异 |
| 设备生命周期 | `toolUseGuard.ts`, recharge/jam/wear | 保留；核对所有工具路径的真正状态检查和恢复 |
| 观察/计划 | Inspect + 可选 Work Plan + Hotspots | 保留非强制顺序，提升玩家实际掌握的信息量 |
| Work Review / Finish visit | 显示任务覆盖、effort、返工；可结束/重试 | 保留入口，补**行动来源和第二次比较**，不要只是多一个汇总面板 |
| 资源 | 3DAssets.dev CC0 kit 已在仓库，`GardenToolView` 已接入 | 优先用现成资源，但**不能以错误模型冒充另一类工具** |
| 测试 | 交付记录 `97 passed / 16 files`，typecheck/lint/build 均 pass（REPORTED） | 从 97 回归继续；再次验证真实全链路，不拿截图充当客观断言 |

### 1.1 已阅读源码后必须关注的学习体验缺口（不是仅靠已通过测试就算完成）

**A — 模型与工具知识可能相互矛盾。** `GardenToolView.tsx` 把 `hand-edger` 映射到 `string_trimmer.glb`，把 `hand-weeder` 映射到 `garden_shears.glb`。这会误导玩家把本质不同的工具当成同一件工具。需要真实可辨模型，或以**诚实的抽象轮廓 + 准确图标/名称**替代，绝不硬说两者一样。

**B — 花坛中的机器守卫只做了一半。** `FlowerbedTaskStage.tsx` 在 UI 判断电量/`unpowered`，但 `gameStore.topCutWeed` 可以不经 `ToolUseGuard` 直接改变根/顶状态；jam/broken 的行为必须由 store 侧约束，不能依赖前端筛选。`pullWeed` 也不应脱离工具、对象和位置约束。需审计一致性。

**C — Finish 不是学习结果。** `gameStore.finishVisit` 当前写入 `VISIT_FINISHED` + 通用 `summaryNote`，没有封存具体 visit 绩效；`WorkReviewPanel` 可同庭重新尝试，但只保留一次文字备注，无法公正对比两个不同做法。需要足够小、稳定、可解释的 `VisitSummary`，至少保留最近两次结果及相同目标的差异。

**D — 复盘数据未完全可比。** `performWorkAction` 的割草只要任何 `progress` 就每次添加常数 `effort: 0.35`，**不随有效扫过距离或工作量变化**，可能让工具效率比较受采样频率影响；其他任务记账方法也不同。只有准备、工作、返工、恢复投入采用一致、去重、事件可追溯的简化单位，才有资格用于比较教学。

**E — “专业完成”与“结束本次工作”需区分。** `buildReviewSummary.canFinishWell` 用安全、草坪、修边、绿篱、杂草、碎屑阈值，且即便花卉损坏也可能通过（不在布尔条件中）；`lawnFinishedPct` 计入 protected flower cells 作为完成。允许结束并诚实展示不足，但不要把有明显质量/安全问题的结果描述为专业完成。阈值必须是游戏校准结果而非权威园艺认证。

**F — 观察和选择尚未成为真正的动作。** `GardenShell` Inspect 可立即标记全部相关对象；`WorkConfirm` 显示工具名单，但进入任务会自动选第一件工具；工具描述静态、重点多在完成工作，而不是玩家先判断再尝试。应提供最轻量的**选择理由与差异预览**，保留自由操作、不强迫答题。

**G — 某些行为在规则上不可见，学习会断链。** 例如手动拔草与线割的实际 `toolUseGuard`、空间和被保护植物校验；来自现场的安全风险与工具切割动作是否强一致；`GardenWorldOverlays` 仍有碎屑球和花球；花坛 stage 当前只允许西侧 hotspot 附近 plant，世界其它 `MEASURED_DANDELIONS` 可能只可见却不可处理。先修“玩家看得到但处理不了”的断链。

**H — 当前连续性证据仍不完整。** 浏览器烟雾只覆盖 overview/review；需要一次最短可重复、跨工具的浏览器实际操作路线，不要求大量截图，也不要求代理自行判断游戏是否好玩。

### 1.2 保留已好实现，修正真问题

Cursor 必须先 `git status`, `git log`, `git branch -vv`；如果本地已有未提交新工作，先备份/检查点，**绝对禁止 `reset --hard`、`clean -fd`**。单一新 feature branch（建议 `feature/v06-professional-learning-loop`）；起点必须是 `e4bf150` 或它的实际后继兼容 SHA。任何与上表不符的情况先以现有源码为准，不执行过期修复。

---

## 2. 园艺知识→可以体验的游戏规则：现实证据、简化边界与工具选择

**数据可信原则**：现实资料用于确认“工具作用原理、适用对象、安全限制”，**游戏数值**例如电量/切割宽度/effort 是可调的模拟参数，必须在 UI/文档标明，不能冒充厂商参数或正规培训认证。不要把一条经验简化为“每个场景都只存在一个正确答案”。

| 工具 / 场景 | 玩家应该理解的判断 | 玩家亲手可观察的结果（模拟） | 不该教错什么 | 当前资源与代码 |
|---|---|---|---|---|
| `manual-reel-mower` 手推滚刀 | 适合可控小范围/精细推进，切割依赖实际前进；与动力机的差异不只是快慢 | 前进才有效的窄轨迹；绕边花卉更需谨慎；投入按有效距离记录 | 不宣称手动机“永远不会误伤”或任何情况下都最优 | `manual-reel-mower.glb`, `MowerTool`, `LawnTaskStage`, `lawnSweep` |
| `lawn-mower` 电动割草机 | 大面积覆盖有优势，但需预检障碍、注意刀片与边界、电量准备 | 宽轨迹、消耗电力、障碍局部停止、误伤风险；充电后继续 | 不能把充电当装饰；不能违反安全停机 | `mower.glb`, `toolUseGuard`, `lawnSweep`, `rechargeTool` |
| `hand-hedge-shears` 手剪 | 少量柔软新梢/需精细成形时适用，不应用来硬切粗枝 | 小范围精剪、较慢但精确；准确目标轮廓、落屑 | 手剪与专门修枝剪/loppers 不等价 | `garden-shears.glb`, `HedgeTaskStage`, hedge cluster |
| `hedge-trimmer` 动力绿篱剪 | 长段成形更高效，但硬木障碍与过剪有风险，电量会耗尽 | 宽扫过范围、过剪缺口、局部硬枝阻挡；需要准备与恢复 | 不意味着所有粗枝都能切；不能一边卡住一边继续剪 | `hedge-trimmer.glb`, `cutHedgeCluster`, `HEDGE_EAST_NODES` |
| `hand-edger` 手动修边器 | 路径边缘的垂直整理不同于大面积割草，也不同于线割机 | 独立 `edgeSegments` 变化；狭窄范围、较慢而可控 | **不能继续以线割机 3D 模型冒充手动修边器** | `EdgeTaskStage`, `edgeFixtures`; 需准确独立外观/轮廓 |
| `string-trimmer` 线割机 | 适合边缘草和某些杂草上部控制；不自动拔除地下根系；近花卉易误伤 | 线割快速去顶留根；清理花坛前须判断对象；电量消耗 | 不把“剪掉杂草顶部=彻底除草”写成事实 | `string-trimmer.glb`, `topCutWeed`, `applyEdgeWork` |
| `hand-weeder` 手动除草器 | 针对需要连根去除的对象，可更彻底，但局部慢，需辨别保留植物 | `rootRemoved`、土面/拔出物视觉可见；误拔花卉留不可逆损伤 | **不能继续以绿篱剪模型冒充除草器**；不宣称所有植物根部均可一次完整拔出 | `FlowerbedTaskStage`, `pullWeed`; 需准确轮廓/模型 |
| `rake` 耙子 | 将散叶/剪枝聚拢，更易近距离控制，而不是凭空清空 | 地面散点变集堆；位置改变，附近才可 bag | 耙子不是打包机；不自动清掉全院 | `leaf-rake.glb`, `gatherNearbyDebris` |
| `leaf-blower` 吹叶机 | 利于推动分散轻质碎屑，但方向错误会吹散已聚堆的东西 | 碎屑按方向移动、可弄乱已聚堆、耗电；真实空间范围 | 不把吹风当吸尘/瞬间销毁碎屑 | `leaf-blower.glb`, `blowDebris` |
| `bag` / 清理装袋 | 将可装袋的集堆碎屑最终移出现场，是清理的后续步骤而非任何东西一键消失 | 在袋周边且已集堆才能袋装；未清处留下 | 不是所有草屑和落叶现实中都必须装袋；也有合理覆盖/堆肥方式 | `grass-bag.glb`, `bagDebrisAt` |
| `inspect/clear hazard` | 动力刀片作业前应检查石头、硬枝、旁人/障碍；真实危险优先于效率 | 风险标识与局部阻断、移除后可继续 | 不鼓励试撞硬物或把严重伤害当可刷分项目 | `HazardTaskStage`, `garden.hazards` |

### 2.1 可引用、已核实的教育依据（源码/前台不可过度声称）

- **草坪健康**：UMass Amherst Extension, *Lawn Mowing*，割草高度和“一次剪除约不超过 1/3 草叶生长部分”的原则。https://www.umass.edu/agriculture-food-environment/home-lawn-garden/fact-sheets/lawn-mowing 。本轮**不要**凭空加入种属精确割高和草坪生理模拟；如果展示“一次剪太多”的提示，先配可操作的高度/状态机制，否则只作可选知识卡。
- **绿篱工具适用范围**：Royal Horticultural Society, *How to Trim a Hedge*，手剪适合小/软生长、动力机适合较大修剪；具体植物和粗枝有不同工具要求。https://www.rhs.org.uk/plants/types/hedges/how-to-trim-a-hedge 。
- **杂草切顶 vs 除根**：University of Maryland Extension, *Manage Weeds Without Chemicals*，线割可控上部生长，但一些多年生杂草需处理根/地下结构。https://extension.umd.edu/resource/manage-weeds-without-chemicals-maryland 。UC IPM 进一步说明某些根茎扩展的多年生植物不会被简单线割控制：https://weedcut.ipm.ucanr.edu/management-practices/cutting-string-trimmers-brush-cutters/ 。**不要泛化所有杂草都能或都需要一次拔根**。
- **安全检查**：Canadian Centre for Occupational Health and Safety, *Rotary Power Lawn Mowers*，操作前检查并清除石块等可被刀片抛出的异物，撞到硬物需停止检查。https://www.ccohs.ca/oshanswers/safety_haz/landscaping/rotary.html 。游戏可抽象为安全前置；不需要模拟真实事故。
- **落叶处理选择**：Iowa State University Extension, *Managing Fallen Leaves and Fall Cleanup*，可以耙/吹/收集，也有合理覆盖、堆肥等去向。https://yardandgarden.extension.iastate.edu/how-to/managing-fallen-leaves-and-fall-cleanup 。当前 V06 只实现了收集/装袋；界面应写“本次庭院任务要求清理这些落叶”，不要把袋装说成唯一现实最佳方案。

**版权与许可**：资料允许作为概念和自行改写的短解释，不允许把外部图表、照片、原文长篇复制进公开项目。现有 CC0 kit 的实际状态更新 `docs/ASSET_MANIFEST.md`；尚未下载外部资源必须标 `CANDIDATE` / `RESEARCHED`，不能伪称已复用。外部新付费素材需用户授权，默认不购买。

---

## 3. 逐项玩家体验 F01–F09：每一步要给玩家一个实际判断机会

以下不是九个独立任务，也不是强制执行顺序；**所有任务均在同一个世界，玩家可以随时从局部回总览、更改工具或顺序**。每一步包括 `Question → Player action → World consequence → Learning signal → Code/asset → Objective test`。

### F01 进入花园 / 观察现场

- **判断问题**：哪几处是工作目标？哪些地方可能藏风险？哪些是保留植物而非杂草？
- **体验**：总览有足够明晰的未完成区域；hover/inspect 只显示具体现场信息（例如石头、硬枝、草高、边缘杂草、落叶），不提前泄露最优路线。
- **必须实施**：检查 `GardenHotspots` 中未发现热点仍可点击的语义；“未知区域”可以探索，但已知信息与未发现信息不应相同。Inspect 应产生有位置、有对象、能影响选工具的观察结果；全局 Inspect 可作为轻量扫视，不能假装玩家掌握所有细节。
- **资源/位置**：`gardenPlacement.ts`/`GardenHotspots.tsx`/`HazardTaskStage.tsx`/`GardenWorldOverlays.tsx`，真实 GLB 和对象 footprint；保持 debugPlacement 专用。
- **验收**：操作 Inspect 前后，发现的信息（可点对象/提示/原因）不同，但安全操作不被不必要锁死；场景中看到的对象有可信点击目标。

### F02 选择工具 / 可选 Work Plan

- **判断问题**：为什么这里选手剪而不是动力剪？为什么开阔草坪和窄边缘要分开处理？什么时候需要先充电/清障？
- **体验**：任务入口的工具列表不只是名称，而是简短的“擅长什么 / 不擅长什么 / 当前适用条件”，如大面积覆盖 vs 精细控制；保持任务可直接进入，不强迫答题。
- **必须实施**：`WorkConfirm`/`GardenShell` 不应让第一件工具的自动选择掩盖玩家的决定。可以预选合适工具但需显式显示并可切换；Plan 的排序不能直接加减分。通过任务区域实际对象需求过滤“错误工具”，选择错误时给具体反馈而不是神秘无效。
- **资源/位置**：`equipmentProfiles.ts`, `gardenTasks.ts`, `GardenShell.tsx`, `WorkConfirm.tsx`, `WorkPlanPanel.tsx`, `gameStore.selectTool`。工具选择增加简短可读能力 metadata（可另设 `toolKnowledge.ts` 单一来源）。
- **验收**：同一区域至少两件工具有可解释的优势/局限，玩家可以修改 Plan/反其道而行，后果通过操作发生而非计划惩罚。

### F03 安全检查 / 处理局部风险

- **判断问题**：为什么必须在旋转刀片工作之前查看石头或硬枝？什么时候可绕开风险继续其他区域？
- **体验**：危险物位置明确，点击后能看到具体风险及安全处理方式；未解决时仅影响相应范围，不把整院锁住；清除后原区域可正常工作。
- **必须实施**：`toolUseGuard` 和 mowing/hedge 的 hazards 需要统一的 store 侧阻挡，操作失败不能切割或产生碎屑；任何卡住后恢复遵循先停止工具、再处理的简化流程；不引入危险事故动画。
- **资源/位置**：`HazardTaskStage.tsx`, `gameStore.removeHazard`, `lawnSweep.ts`, `cutHedgeCluster`, `garden.hazards`；石块 overlay 可保留，只要清楚。
- **验收**：相同输入，仅在实际风险范围内阻断，清除风险后恢复；没有意外耗电、进度或花卉损伤；安全提示明确。

### F04 草坪：工具选择、运动、能源与切割结果

- **判断问题**：大面积选什么？贴花坛为什么需要更精准？电池耗尽后如何准备恢复？
- **体验**：两种割草机外形与刀片运动不同，切割宽度和前进限制由路径真实决定，已割/未割可辨；不靠读表才知道不同。
- **必须实施**：保留 `WorkCells` 唯一割草权威、`sweepSamples`/`forwardMotion`。校准 `productiveEffort` 依据**路径距离与有效覆盖**，对采样密度/帧率近似不变；无效空地拖动不无限记有益工作；电量见底停止，recharge 有准备投入，维修不被充值代替。
- **不在本轮扩展的内容**：完全真实草叶受力/精确草种/可调真实刀高，除非有简洁、可靠、会改进判断的实现；优先改善玩家理解的草面对比。
- **资源/位置**：`LawnTaskStage.tsx`, `MowerTool.tsx`, `LawnFootprintLayer.tsx`, `lawnSweep.ts`, `gameStore.performWorkAction`, `rechargeTool`, `lawnGrid.ts`。
- **验收**：同一条相同真实长度路径采用不同采样数，电量、effort 相近；不同机型的覆盖/资源差异可复现；刷新后已割痕迹保留；近花坛误伤是真实且一次性，而非乱扣分。

### F05 绿篱：精剪/动力成形/过剪与落屑

- **判断问题**：什么时候用手剪，什么时候用动力剪？枝太硬为什么换工具/先处理？
- **体验**：手剪有局部、可控的精度；动力剪宽而快但易过剪；剪下枝条落在对应东侧世界坐标，随后必须能被清理。
- **必须实施**：核对 `hedgeClusters` 对应 `HEDGE_EAST_NODES`，工具可用、状态/电池 guard 和 hazard 在 reducer/store 权威侧成立；调整 `HedgeTaskStage` 的作用范围和模型让差异可见。重复对同一已剪节点不能不停重复生产枝屑；过剪应只表达独立质量损失，且不可通过再次拖动“修好”。
- **资源/位置**：`hedge-block.glb`, `garden-shears.glb`, `hedge-trimmer.glb`; `HedgeTaskStage.tsx`, `GardenToolView.tsx`, `GardenWorldOverlays.tsx`, `reducer.ts`。
- **验收**：手/电剪两条路线均可完成修篱，投入/精度不同；同一节点剪一次只有一次原始落屑；掉落空间可清理；有障碍时动力剪不穿透。

### F06 修边：大面积剪草的自然补充

- **判断问题**：为什么草坪已割完，沿路径边界仍可能凌乱？什么工具能完成这道边？
- **体验**：切换修边后看到窄条边缘独立变化；手动修边器与线割机外形/操作不混淆。
- **必须实施**：保留 `edgeSegments` 独立权威和与 `LAWN_FINE` 分离；纠正 `GardenToolView` 的 `hand-edger` 伪装模型，能用独立 CC0/自制简单但正确的轮廓；路径 12 段与已测量路径相符。有效触碰后真实更新；非目标/无电不进度。
- **资源/位置**：`edgeFixtures.ts`, `EdgeTaskStage.tsx`, `GardenWorldOverlays.tsx`, `GardenToolView.tsx`, `gardenPlacement.ts`。
- **验收**：割草 100% 但修边 0% 时回到 overview 看起来边缘仍乱；修边后的 Review edge% 增加而 lawn% 不变；两类工具的限制可解释。

### F07 花坛：识别杂草、留根与误伤

- **判断问题**：哪些要保留？怎样去掉杂草、怎样避免碰花？为何线割只剪顶部有时不够？
- **体验**：正确植物与杂草有足够清楚的空间/形状差异；手动拔根与线割去顶有真实视觉后果，旁边花被误伤会留下痕迹；拔起的植物会变地上残余物。
- **必须实施**：把 `topCutWeed` / `pullWeed` 的 tool/status/object/region 检查下沉到 store/domain，不依赖 `FlowerbedTaskStage` 先行挡住；`string-trimmer` 不可 0 电/卡住/损坏时推进，也必须真实耗能；`hand-weeder` 模型不允许用绿篱剪冒充。核实 `MEASURED_DANDELIONS` 的全院分布：**可见的每个目标要么可在正确区域操作，要么明确只是装饰不计入完成**，不能“可见但无法触碰却被判未完工”。
- **资源/位置**：`dandelion.glb`, `FlowerbedTaskStage.tsx`, `GardenWorldOverlays.tsx`, `gardenPlacement.ts`, `gameStore`, `reducer.ts`。
- **验收**：同样杂草 line trim → topCut=true/rootRemoved=false；manual pull → rootRemoved=true；更换工具不能瞬间隐式清根；花卉损伤只一次且保留；UI 调用与直接 store 调用一致。

### F08 散叶与枝屑：耙/吹/装袋及空间返工

- **判断问题**：为什么吹和耙不是同一件事？为什么某个顺序带来了再次清理的实际工作？
- **体验**：碎屑在地面有空间位置、能被推/聚/袋，吹散已聚堆看得出来；玩家在东侧先扫、后剪、再扫才真的多做了一次清理。
- **必须实施**：维护 `spatialRework.ts` 的同地二次劳动逻辑。用**受实际事件引用的清理对象、足迹与先后关系**识别 rework，不因其它无关区域动作增加；不因“预计再次清理”就加 spent。核对 gather 和 bag 同一对象是否被重复分类为 rework（允许有真实两步劳动，但账本必须描述两种活动，不重复虚增）；吹风不应凭空增加不合理工作成果。
- **资源/位置**：`DebrisTaskStage.tsx`, `spatialRework.ts`, `reducer.ts`, `gardenWorldOverlays`, `leaf-rake.glb`, `leaf-blower.glb`, `grass-bag.glb`。
- **验收**：相同初始条件下先剪后扫、先扫后剪再扫，两种顺序最终都可清理干净；后者因实际重复清扫而多耗投入；西南清扫+东侧剪枝不产生凭空返工；刷新和回总览仍能看到碎屑。

### F09 结束、评价、同条件重试与反事实学习

- **判断问题**：我完成了什么？用什么方法？有什么具体代价？第二次可以怎样安排得更好？
- **体验**：Finish visit 是明确“记录此刻成果/结束本次尝试”，不是自动宣告质量合格；Review 显示与事件相关的解释、实际来源、尚未完成的部分、准备/恢复/无效/返工/有效投入，并允许同条件重试。
- **必须实施**：新建最小 `VisitSummary`（稳定 ID、fixture version/seed、完成率、质量/安全状态、tool use 与 effort 组成、关键时间线、未完成对象、损伤、rework 事件来源）并在 Finish 时封存。最多需要最近两次（或可扩展数组带上限），让第二次显示 **A/B 对照**，首先检查目标/初始条件是否一致且最终质量/覆盖可比较，不满足则提示“不可直接比效率”而不强行判胜负。
- **处理结束状态**：明确未结束可继续/已结束可查看/重新开启同一工作是继续上一轮还是新尝试；不要在已封存的 Summary 上静默更新行动。无须强制锁死世界，但要保证 visit 记录不可变。`Retry same yard` 应重置世界到相同初始 fixture，保留历史 Summary；`Reset garden` 需清晰说明是否丢弃历史并确认。
- **资源/位置**：`gameStore.finishVisit`, `WorkReviewPanel.tsx`, `reviewSelectors.ts`, `GardenDomain`/migrate, `gardenFixtures.ts`, 新增 `src/game/learning/visitSummary.ts`（建议纯函数，避免复制 state）。
- **验收**：提交一次 Final Snapshot A，按同条件复现 B，两个 Summary 能被浏览器读取，刷新后不丢；提前结束显示不足，不凭空变“优秀”；两条操作顺序若完成质量不同，不能只凭总耗时认定较低者更专业。

---

## 4. 每件工具不是“文本知识卡”，而是可观察的能力差异

使用统一的轻量工具知识接口，**不得与 `equipmentProfiles.ts` 维护两套冲突规格**。推荐只新增展示用 `ToolKnowledge`：

```ts
// 说明性接口，可根据代码风格调整；游戏数值仍由 equipmentProfiles 控制
interface ToolKnowledge {
  toolId: string;                 // 与既有 tool ID 一一对应
  purpose: string;                // 它要改变哪种目标
  bestFor: string[];              // 当前庭院可以举例的具体场景
  limitation: string;             // 能力的边界，不能说假话
  preflight: string[];            // 一条或两条必要检查
  effectToWatch: string;          // 玩家操作时应看见什么
  contrastToolIds: string[];      // 可用的对照工具，不是唯一最佳工具
  realismNote?: string;          // 模拟参数与现实依据的界限
  sourceIds?: string[];           // 映射至本地教育参考索引
}
```

### 4.1 UI 呈现原则

- **进入任务前**：两三个词的工具适用信息，且所选工具明显；不默认强制必须看完课堂。
- **行动当下**：只有真实发生阻断/改变时提示 1 句：`Battery empty — recharge before continuing`; `Tops cut, roots remain`; `New clippings fell where you had already cleaned`。
- **首次观察到重要后果**：允许短非模态提示 `Why this happened`，关联事件/工具；不要每次同样动作闪十次 toast。
- **Review**：显示“你在这个位置做了 X，随后 Y，产生 Z 的额外工作/质量结果”，并提供一个**可以试验的替代方案**，但不宣称唯一路线。
- **工具外观**：真实用途必须能从主要轮廓辨认。若手动除草器 / 手动修边器找不到合法匹配 GLB，选择少量正确的程序几何（如独立手柄+刃片轮廓），而非拿错误的动力机或绿篱剪模型硬替代。视觉只做到可信可辨即可，别延误全院闭环。

### 4.2 限制课堂化设计

不得添加连续 9 个知识卡弹窗、工具百科页、强制答题或单一“Expert order”箭头。当前项目的教学媒体就是**工具操作过程及其后果**。少量可选解释可通过 `Why?` / `What changed?` 的小面板给需要的人。

---

## 5. 技术实现：一次完整工作波次，不是 12 次独立小修

### 5.1 世界状态与结果：保持单一权威

- 继续使用 Zustand persisted `work` + 其嵌套 `garden`。草坪以旧 `WorkSnapshot.jobs[..].zones[..].cells` 为唯一权威；edge 以 `GardenDomain.edgeSegments` 为唯一权威；其余 garden entities 用 `GardenDomain`。
- 新的 `learning/` **只能包含纯派生函数/小型不变 Summary**，不能复制 Lawn Cells、edgeSegments、debris 等动态工作状态。
- `events` 必须携带足够的 `toolId, taskId, affectedIds, worldFootprint, effort` 或能在提交时可靠推导，确保 Review 可以解释行动原因；不要从 tooltip 或截图反推事实。
- 状态有多事件一起提交时，保持原子性/幂等；源事件 ID 不得与生成碎屑重复；刷新后复盘不能重新计费。
- 保存迁移新增可选字段需覆盖 v03/v06 老存档，不能把旧数据清空来让测试变绿。考虑 `GardenDomain.schemaVersion: 3` 或兼容读取，必要时修改 `migrateGarden.ts`。提前备份，不改 legacy 经济玩法。

### 5.2 可实施的 Visit 结果模型

```ts
// 示例设计，可根据现有类型修改；禁止把整个巨大的 WorkSnapshot 再复制一份进每次总结
interface VisitSummary {
  id: string;
  fixtureVersion: string;
  finishedAtActionIndex: number;      // deterministic index, not Date.now-based scoring
  final: {
    lawnPct: number; edgePct: number; hedgeRemaining: number;
    weedsWithRoots: number; looseDebris: number; hazardsUncleared: number;
    ornamentalDamage: number;
  };
  effort: { productive: number; setup: number; rework: number;
            ineffective: number; recovery: number; total: number };
  toolsUsed: string[];
  keyEvents: Array<{eventId: string; explanationCode: string; areaId?: string}>;
  qualityBand: "incomplete" | "acceptable" | "needs-attention";
}
```

- 初期最多保留 2–3 次 Summary，或只保留上次/本次。持久数据量可控；保存时对 older payload 做迁移。
- `fixtureVersion` 与各任务目标集合一致才可正面对比。若未来玩法有随机庭院，记录 `seed`，但本波不要引入随机环境。
- 评分不能只看平均效率。先比较安全/关键损伤/完成度，再比较非必要返工和总投入；允许不同工具组合产生多个优秀解。
- 对象多、动作多时，Review 展示可理解的少数关键节点，不要向用户倾倒事件日志。

### 5.3 动作投入：统一单位并防投机

- `productive` 必须基于真实工作量或有效路径距离，以同一单位基准校准不同工具；不能以浏览器 pointermove 次数直接衡量效率。
- `setup` 来自真正的观察/切换/准备；反复点同一 Inspect 或反复打开卡片不应无限增加负担。
- `recovery` 仅记录真实的充电/故障处理；无电/损坏时不能还有“工作成功”。
- `ineffective` 记录有意义的非生产性动作且适度封顶；不要鼓励刷数值；工具用错后的说明比惩罚更重要。
- `rework` 仅来自同地重复完成了真实劳动。**注意 gather 和 bag 可为两个不同动作**，但同一 pile/事件重复调用不应加两遍无实体变化的投入。
- 测试工具宽度/动作持续时间与不同帧率、采样密度、相同路程的近似不变性；不妨把 `effortUnits` 标成“game-modeled effort”，不冒充分钟或小时。

### 5.4 视觉和操作原则

- 视觉“好”的定义：玩家能在 2 秒内看出未处理/处理中/已处理、哪些工具正在工作、哪些碎屑需要清理、哪里可能误伤；不是多边形越多越好。
- 优先让绿篱剪/除草器/修边器的模型**身份正确**，其次让工具随指针/工作目标移动、朝向不离谱，最后才是阴影、粒子、草摆动。
- 大地面 hit proxy 可保持透明，但不可遮挡 hover/真实物体的 interaction。`OrbitControls` 与拖动需在 pointerup/cancel/leave 时正确释放，不受某个 stage 切换影响。
- 所有任务世界坐标统一 `gardenPlacement` 与世界对象 `x,z`，不凭空将一套对象变到不同缩略场景。
- 若新的素材性能/许可成本明显高于学习价值，不引入；优先调现有 CC0 GLB 与程序几何。

---

## 6. 完整连续实施次序（按依赖推进，绝不每个子任务停止）

### Wave A — 保护现有成果并建立完整学习验收基线

1. 确认 `origin/feature/v06-experience-completion` 的 SHA；本地未提交改动保护；建立一条新 feature branch，写入本文件到 `docs/`。
2. 跑 `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`，记录原始结果；不因对比前已有问题就抹掉现成测试。
3. 从当前源码抽取“F01–F09 每步玩家看到什么、能做什么、实际世界结果是什么”的事实对照表；优先验证上面第 1 节 A–H 的真实缺口，不漫游式重查全部历史。
4. 准备确定性 baseline fixtures 与两个 A/B 脚本（不同工具/工序，**最终质量尽量相等**）。第一次浏览器定位检查只做一次，发现硬阻断再修。

**Wave A 退出条件**：基线保护完成，事实/假设分清，两条路线实际可运行；自动进入 B。

### Wave B — 学习需要的真实工具规则、场景操作与安全一致性

1. 为每件可操作工具建立统一的能力与安全文字来源；保证和 `equipmentProfiles` 不矛盾。
2. 审计 `gameStore` + reducer/store 所有 powered/manually-used actions，防止 UI 校验绕过；花坛、绿篱、修边、吹叶、割草统一尊重工具状态、实际目标、必要的安全阻断与电量变化。
3. 修复全院可见却不可触达目标问题；所有正在计入质量/完成度的目标必须能在相应 3D 工作场景操作。
4. 手动除草器和修边器改为真正可辨的外观；保留第三方来源/程序模型 Credit 说明。
5. 将“使用工具的特点”体现在实际操作和结果，而不是仅加入文字。

**Wave B 退出条件**：工具身份、操作状态、环境变化一致；无电/卡住/误工具不可能在 store 中暗中成功；自动进入 C。

### Wave C — 可解释的工作计划、因果账本与专业工作复盘

1. 将已有 events/effort 转成可解释且去重的工作账本；修正割草固定 per-stroke 成本；避免输入事件频率作弊；补工具使用统计。
2. 引入极简 `VisitSummary` 和比较逻辑（不复制世界状态），补 migration；保留部分完成和非强制结束。
3. 在 Review 明确“观察到的问题、采取工具、产生后果、实际返工、剩余质量问题”；每条学习建议尽量附来源事件/位置，禁止没有证据的泛泛“应该先 X”。
4. 增加 A/B 同条件重试，质量不同先标“不可直接比较效率”，同等质量时才展示投入差与可能原因。即使两条顺序都合理也认可，绝不强制单一“expert order”。

**Wave C 退出条件**：玩家完成一次后可以解释至少两个自己决定的后果，并能在同条件重试看到证据对照；自动进入 D。

### Wave D — 全流程体验与可读的真实世界

1. 让 onboarding 首 30 秒可自发开始：看到可操作的庭院/知道可以观察/进入任务，不弹全部教程。
2. 打通 F01–F09 的“返回总览→换工具→继续工作→观察结果→结束记录→重试”，避免菜单任务割裂感。
3. 优先修动态目标无法到达、严重相机偏移、点击/拖动失灵、结果在近景/总览不同步；已有 proxy mesh 仅在不影响辨认时保留。
4. 做够用的视觉识别与 feedback；音频、风草、品牌工具卡、复杂植物生长/草刀物理不阻挡主线。

**Wave D 退出条件**：两条完整路线在普通桌面浏览器可操作、可复盘、可重试，且没有 P0/P1 沟通断点；自动进入 E。

### Wave E — 客观验收、学习验证准备与最终交付

1. 运行完整 `typecheck/lint/test/build`，所有新增测试有可复现输入和断言。
2. 最少一次真实浏览器从头到尾：inspect → choose tool → safety → mow → hedge → edge → weed → gather/bag → finish → compare/retry；再跑一次换不同工作安排的路线。保留**有限、有代表性的证据**，不靠海量截图自证主观价值。
3. 验证同条件两轮 A/B 质量相当时，指出工作投入差的事件原因；不同质量时不出现虚假的“更专业”。
4. 保存截图、Review 对照样例、资产 Credit、迁移说明、非阻断 backlog、Git SHA 和真实测试记录；commit + push feature，**不合并 main、不部署**。
5. 最终输出给产品负责人的 5–8 分钟自试玩脚本；需要真人判断的部分标 `HUMAN_REVIEW`，别宣称“97 tests 证明玩家已经学会”。

**整个 Wave A–E 是一个完整实施授权。** 不要每个微小文件都要求用户批准；不同技术路线按 L0→L6 价值、授权、可逆性和成本自行选取更简单的实现。

---

## 7. 客观工程测试矩阵（新测试扩展现有 97，而非重起炉灶）

> 按真实项目结构创建必要测试，命名/分文件允许调整。**每项必须具有输入、预期状态、失败条件**。人数/美感学习效果不能用 Vitest 伪造。

| 编号 | 固定输入 | 核心通过条件 |
|---|---|---|
| J01 | 冷启动旧 v03/v06 save | 迁移保留割草/修边/碎屑/损伤；新增 Summary 字段可缺省 |
| J02 | 选择手推/动力割草机同等真实路径 | 路径宽度、前进限制、电耗/投入有可解释差异 |
| J03 | 同距离路径 4/16/64 samples | 进度/能耗/effort 在定义容差内一致，不能靠帧率刷效率 |
| J04 | 空地重复拖动 | 不增加有效覆盖或虚假正面学习分数 |
| J05 | 电动割草机 0 电 → 充电 → 继续 | 0 电不能切，恢复后原位置继续，进度和花卉损伤状态保存 |
| J06 | jam/broken → 直接 recharge | recharge 不替代清障/维修；不能暗中成功 |
| J07 | 绿篱手剪/动力剪 + 同簇重复动作 | 同簇原始碎屑最多一次；精度/宽度和实际投入有差异 |
| J08 | 硬木障碍未清 → 试动力剪 | 局部阻断不生成掉落物/完成标志；其它区域可操作 |
| J09 | `string-trimmer` 0 电，直接调用 store topCutWeed | 无状态变化，产生可理解无效反馈 |
| J10 | `string-trimmer` jammed/broken，直接调用 store | 无顶割/误伤/误记工作；与 UI 行为一致 |
| J11 | `hand-weeder` 拔杂草 / 误碰花 | 前者 rootRemoved、产生相应 debris；后者只一次损伤，不可免费恢复 |
| J12 | 全院测量 dandelions 和花坛目标 | 所有计入完成的 plant IDs 可触达，未触达的不能算未完成的必做对象 |
| J13 | 完整割草但未修边 | lawn% 高、edge% 低；边缘仍视觉杂乱；修边后不改 lawn% |
| J14 | 手动/动力修边对同一边缘 | 可完成同一目标，速度/资源/精度的真实差异不依赖工具文字 |
| J15 | 耙/吹/装袋作用于固定坐标 | 物体位置和 gathered/bagged 变化符合半径、方向、状态 |
| J16 | 西南已清 → 东侧剪篱 | 不凭空增加 spent rework，review 不诬指返工 |
| J17 | 东侧清 → 同地剪篱 → 第二次清 | potential 首先增加，第二次有效清理才增加 spent rework |
| J18 | 重放/重复同一事件 ID | 不生成新碎屑、重复费用/effort/visit 记录 |
| J19 | Work Plan 顺序改变但执行相同动作 | 不产生隐藏“wrong order”固定罚分；只根据真实行动计算 |
| J20 | 打开/关闭 Inspect/Review 多次 | 不重复计入 setup 或操作事件 |
| J21 | Finish early | Summary 为 incomplete/needs-attention，不自动伪称专业完成 |
| J22 | Finish → 继续/重试/刷新 | 已封存 Summary 不变，当前操作意义明确，历史不丢 |
| J23 | A/B 相同 fixture + 相同最终覆盖/安全 | 可以给出基于真实事件的投入/返工对照 |
| J24 | A/B 质量或目标不一致 | UI 明确显示不可直接比效率，不伪造优劣结论 |
| J25 | 进入工具但立刻切换、返回总览 | 没有被选工具的隐式工作，OrbitControls/拖拽释放正常 |
| J26 | 已充电/已维修状态迁移保存 | 全工具状态恢复，不因刷新重置新剧情 |
| J27 | 工具视觉映射校验 | `hand-weeder` 不显示 hedge shears；`hand-edger` 不显示 string trimmer 冒充手动工具 |
| J28 | 完整 Review 中出现关键建议 | 每条建议能关联真实 event/目标状态，而非仅用预设专家顺序 |
| J29 | 强制极差条件（未除险/损伤多） | 可以结束但质量报告必须注明关键问题，`canFinishWell` 不失真 |
| J30 | 资源离线/GLB 加载回退 | 关键玩法仍可操作，界面使用准确工具名称/轮廓，禁止错误身份替代 |

**测试分工**：单元测试验证规则/事件；集成测试验证 store + migration；浏览器只验关键交互路线和视觉可读性；**是否真正学会由人类初次试玩观察**。

---

## 8. 教学效果的人工验收：可以测量，但不能假装自动通过

只需 2–3 位不熟悉游戏的玩家进行一次非引导式试玩（可先由产品负责人自己试）。不事先告诉他们 “先剪篱后清扫” 或指定最优工具，记录下面四个观察项：

1. **首次 30–60 秒**：能否自行发现可以观察庭院并选择至少一个任务？哪里卡住？
2. **工具判断**：完成后能否不看工具卡，举出至少两对工具的实际差别和适用场景（例如手剪/动力剪、线割/手动除草、割草机/修边）？
3. **工序因果**：能否指出自己在哪个区域因后续工作造成额外清理，或为什么没有返工？
4. **迁移**：再给同样初始条件，能否主动修改一个选择，并基于实际质量/投入解释改变？

记录为 `HUMAN_OBSERVED / NEEDS_IMPROVEMENT / NOT_TESTED`，**没有参与者就标 NOT_TESTED**。不为得到漂亮数字强制设置答题关卡；必要的教学调整优先通过操作可读性改善。

建议脚本：
- 第一次 5–8 分钟体验（可提前结束），不读文档；
- 问 “你选这个工具是看中了什么？有什么不方便？”；
- 问 “哪一步如果再做一次你想换顺序，为什么？”；
- 第二次重试两三步，不必强制全院 100% 完成；
- 记录实际困惑/看不懂的图像/误导文本/控制问题，而不是立即要求加教程。

---

## 9. 资源与工程整合地图（直接可执行，不需要再给一个小 task 文档）

| 工作目标 | 当前确定的实现入口 | 合法资源 / 数据权威 | 本轮实施原则 |
|---|---|---|---|
| 全庭院 | `GardenOverviewScene.tsx`, `SaturdayGardenModel.tsx`, `gardenPlacement.ts` | starter scene GLB | 先用同一世界坐标；局部可读性比换场景更重要 |
| 地图 / 探查 | `GardenHotspots.tsx`, `GardenShell.tsx`, `HazardTaskStage.tsx` | `AREA_PLACEMENTS`, `garden.inspection` | 发现的是对象/风险，而非固定教程步骤 |
| 计划 / 装备 | `WorkConfirm.tsx`, `WorkPlanPanel.tsx`, `equipmentProfiles.ts`, `gardenTasks.ts` | game tool IDs | 真实差异 + 可选预览，不强制官方顺序 |
| 割草 | `LawnTaskStage.tsx`, `MowerTool.tsx`, `lawnSweep.ts` | mower/reel mower GLB, authoritative `LAWN_FINE` | 路径与面积产生进度，正确计算工具效果与投入 |
| 修篱 | `HedgeTaskStage.tsx`, `GardenWorldOverlays.tsx`, `gameStore.cutHedgeCluster` | hedge/shears/trimmer GLB, `HEDGE_EAST_NODES` | 精细/宽扫限制、剪下物、粗枝风险 |
| 修边 | `EdgeTaskStage.tsx`, `edgeFixtures.ts`, `GardenToolView.tsx` | `edgeSegments`, correct tool silhouette | 独立结果，不能借草坪格或假扮工具模型 |
| 花坛 | `FlowerbedTaskStage.tsx`, `gameStore.topCutWeed/pullWeed`, `reducer.ts` | dandelion GLB, `plants` | 可见对象可处理；线割只去顶、手动除根、被保护花不可误教 |
| 碎屑 | `DebrisTaskStage.tsx`, `spatialRework.ts`, `gameStore.*Debris` | rake/blower/bag GLB, `garden.debris` | 按真实位置移动/清理，返工因果可证 |
| 工具状态 | `toolUseGuard.ts`, `durabilityRules.ts`, `gameStore.ts` | `tools`, `EQUIPMENT_PROFILES` | 所有真实工具统一状态机和安全校验，不依赖 UI |
| 学习证据 | `GardenDomain.events`, `reviewSelectors.ts`, 新 `src/game/learning/` | **派生数据 + 小型 visit 摘要** | 具体证据而非专家固定答案，保持存档迁移 |
| 成果 UI | `WorkReviewPanel.tsx`, `GardenShell.tsx` | summary, comparison selectors | 同质量比效率，不同质量先解释质量 |
| 兼容 | `migrateGarden.ts`, `gardenFixtures.ts`, `gameStore.persist` | `yardshift-v03` + legacy | 旧保存不能被静默覆盖 |
| 资源追踪 | `docs/ASSET_MANIFEST.md`, `THIRD_PARTY_NOTICES.md`, `modelCatalog.ts` | current CC0 kit | 不新增无许可证素材，不假称运行已验证 |

### 9.1 避免的新坑

- 不新增独立 `toolLearningGame.ts`、`toolQuiz` 关卡来替代现有庭院。
- 不为每一个 tooltip 单独设计一套数据库/缓存/服务端。
- 不要求技术模型替玩家选择工作顺序；推荐可以有多个条件分支，没有唯一标准路线。
- 不为“教会玩家”引入大量与园艺无关的经济系统/升级树/武器式掉落。
- 不以“对所有草建全真实物理碰撞”为投入重点；视觉和权威世界状态可以分层。
- 不凭代码测试通过宣布用户学会了；记得是模型正确、交互可用、人类理解三件不同的事。

---

## 10. 完工定义（DoD）、停止条件与最终汇报

### 10.1 工程 DoD（必须同时满足）

- F01–F09 每一步至少包含一个真实玩家动作和可见结果，能连接同一个世界；每一对关键工具选择具有可观察的机械差异而非仅标签差异。
- 不允许关键工具错误模型身份、无资源仍切割、可见目标不可处理、修边修改草坪、碎屑跨区域失联、错误返工。
- 独立 Visit Summary 可保存、重试和对照；复盘建议能从实际事件解释。结果质量/安全不等同效率；错误顺序不受固定扣分。
- 所有新增状态兼容老 V03/V06 save；全体原有测试持续绿，新增 J01–J30 核心语义覆盖。`typecheck/lint/test/build` pass。
- 真实浏览器完成两条关键路线，提交有代表性的 overview、一个工具差异、完成回顾和 A/B 对照证据；性能情况没有测量就标记 `NOT_MEASURED`，不虚构 ≥30 FPS。
- 资源来源/授权、独立模型的 fallback、程序模型的实现说明更新 manifest；完整进度和非阻断 backlog 写入 `docs/V06_EXECUTION_LOG.md`。
- 新 feature branch commit + push；不合 main、不部署、不清存档。提交确切 SHA、文件变更、测试结果以及 `HUMAN_REVIEW` 待定项。

### 10.2 什么时候继续，什么时候停止打磨

**必须立即修**：玩家被卡死、世界因果断裂、工具或安全逻辑教错、存档丢失、错误工具模型导致误解、评分对相同输入矛盾、公开许可违法风险。

**可以延后**：纯粒子、音效、风草、漂亮工具卡、更多素材、角色动画、边缘阴影、非关键镜头微调、菜单色彩。在不损害工具辨认和动作反馈的前提下，视觉调整两轮没有明显改善就写入 backlog 并继续。

**人工负责判定**：第一眼是否好懂、工具手感是否自然、知识是否被理解、是否值得再玩。不能为了让机器自评漂亮，反复做十几轮截图。

### 10.3 最终报告结构（一次性）

1. `base → branch → final SHA`，GitHub 地址；说明原分支和 main 原样保留。
2. Wave A–E DONE/PARTIAL/BLOCKED，逐项关键产品体验实际结果，不只“测试通过”。
3. 30 个 objective checks 哪些确实有断言，哪些还缺；原/新 test 数、命令输出；不臆造验证。
4. `F01–F09` 代表性真实使用证据（少量图/必要录屏）；A/B 对照固定初始条件和两个实际 Summary。
5. 所有新/替换工具外观及许可来源表；明确 `IN_REPO` vs `VERIFIED_RUNNING`。
6. 现存问题按 P0/P1/P2，附真实影响和复现，不用“后续优化”这种空话。
7. 给产品负责人一个 5–8 分钟的首次试玩流程和四个必须由人判断的问题。

**直到完整产品学习闭环达成才交付，不要为了修一个局部小点中止实施。**

---

## 11. 可以直接复制发送给 Cursor 的启动消息

> 读取本附件 `YARDSHIFT_V06_PROFESSIONAL_TOOL_JUDGMENT_LEARNING_EXECUTION.md`。它是 YardShift V06 在 `feature/v06-experience-completion` @ `e4bf150` 上的**整轮学习体验深化实施合同**，不是一个小修复任务。最高权威依然是项目已有 `YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` 的 L0–L6 和 F01–F09；原 V06 结果全部保留。
>
> 在保护本地已有工作后，基于 `e4bf150` 或后续兼容提交创建独立 feature branch。按照本文件 Wave A–E 持续执行，不要每修一个细节停下，也不要回退到旧 `f19b6c1`。
>
> 目标是让玩家**亲自学会观察现场、理解每件工具的设计目的与限制、自主选择和安排工作、在同一个庭院看到真实因果、再通过两次同条件实践形成判断**。逐步完善 F01–F09 的现有实现、工具状态/身份、决策提示、事件账本、可比 Visit Summary 与世界表现。使用已核实的模型和空间坐标，尽量不买新素材、不重构正确的部分。
>
> 让测试覆盖客观规则，并完成最短完整浏览器两轮演示；不要用大量截图或自评取代学习效果验证。完成后更新 `docs/V06_EXECUTION_LOG.md` 与资产 manifest，提交并 push feature；**不要合并 main、不要部署、不要静默清除旧存档**。只有上层产品冲突、权限/许可/存档等重大不可逆问题才暂停。

