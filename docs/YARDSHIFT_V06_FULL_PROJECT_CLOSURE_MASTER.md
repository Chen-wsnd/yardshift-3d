# YardShift V06 — 全项目收尾审查与一次性连续实施总合同

> **用途：直接交给 Cursor 的本轮唯一执行文件。** 不是新产品路线，不是 V07，也不是对单个按钮的一次修复。此文件基于实际读取 `Chen-wsnd/yardshift-3d` 的 `feature/v06-playable-learning-qa` 源码、Owner Playtest、执行日志、清单与测试，目的是把现有 V06 **收敛成能从头到尾实际试玩、可以被人类验收的稳定完整版本**。
>
> **审查日期：2026-11-22。远程基线 HEAD：`f976eedb06bd02e4409a8eb246f9eddb80d26b40`。** 前序功能提交 `5f7e7d889719e87c70331fa6be07c27acff3e0c8`。`main` 尚未合并、尚未部署；保持此界限。
>
> **权威关系**：最高层为既有 `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` 的 L0–L6 原则。此前所有 V06 文档是历史依据；**本文件是当前源码基线之后唯一的收尾实施优先级和验收清单**。冲突时产品目标 > 本次收尾目标 > 旧 Wave 指令；绝不让技术细节反向改变产品定位。
>
> **现实证据边界**：`CODE_CONFIRMED`=静态源码直接支持；`HIGH_RISK_TO_REPRO`=从 React/R3F/状态结构合理推断但需浏览器复现；`TEST_REPORTED`=Cursor 日志宣称通过但本次审查未独立运行；`RUNTIME_UNKNOWN`=当前无法从 GitHub 源码证实。代码审查端不能访问 Cursor 的本地服务器，也无法独立打开 `http://localhost:3000`。因此 **绝不能将静态审查写成已完成浏览器实测**。本文件标注的每个 P0/P1 要么有反例的自动化断言，要么有真实浏览器复现与修复记录。


> **最新产品架构裁决（§13，优先于此前旧入口描述）**：游戏必须改为**全局 Tool Bar + 同一连续可作业庭院**，工具选择不能依赖先进入指定 TaskStage；相机聚焦只改变视角。§13 的 `GATE-G / TB01–TB25` 与既有 GATE-A–F 同轮验收。此前涉及 WorkConfirm 强制入场的步骤在 §13.6 已明确替换，不让 Cursor 同时执行两套冲突的导航。

---

## 0. 北极星、边界和交付定义

**北极星**：玩家面对一个有真实空间关系的住宅花园，能够观察风险、识别植物和工具差异、安排施工、自行操作并看见后果；经历一次之后，能够解释：

1. 为什么在这个区域使用这件工具，而不是相似工具；
2. 这件工具的能力、限制、操作方式与安全前提是什么；
3. 为什么某种施工安排会产生额外工作或伤害；
4. 下一次在同样条件下要怎样改进，而非只是记住系统提示的“标准顺序”。

**不是**：工具图片百科、点一下完成的多款小游戏、草坪 shader 技术秀、无限任务数量或强制唯一正确施工顺序。

**交付必须同时成立**（含双语 GATE-F 与全球工具栏 GATE-G，详见 §12–13）：

- `GATE-A`：源码/数据正确，旧存档不丢失；全部工作对象可从**全局 Tool Bar**在同一庭院直接操作、切换、恢复，且仍可选相机聚焦；不会无提示卡死。
- `GATE-B`：浏览器实际跑通一条完整 F01–F09 体验，并完成一条真正的同地返工 A/B 路线。R3F 实际 pointer、camera、遮挡不能靠 store 单测假定通过。
- `GATE-C`：有无需开发者口头解释的本地 Owner 试玩包（准确启动命令、隔离 profile、场景回退/重试、动作说明、预期证据、问题记录）。
- `GATE-D`：Review 和封存比较只讲代码能证实的行为与因果，不把任意努力单位当现实分钟；人工理解效果依然标 `HUMAN_NOT_TESTED`，直到人真的试玩。
- `GATE-E`：完整可构建、可重复运行和 push feature；不合 main、不部署、不抹存档。所有 P0/P1 关闭且证据可追溯，P2/P3 留 Backlog。
- `GATE-F`：**英语 `en-US` + 简体中文 `zh-CN` 完整 F00–F09 本地化**；语言切换不改变施工、Store、历史封存与 A/B；动态提示/工具教学/Review 同步翻译；两语浏览器实测（§12）。
- `GATE-G`：**同一连续 3D 庭院 + 全局 Tool Bar**；不点任务热区就能选所有适用工具并工作，跨区域可自由切换，pointer/相机不重挂；§13 的 TB01–TB25 实测。

**不需要停下来征求逐项批准**；在本轮同一个实施分支持续执行。仅当无法保证用户数据、授权、主线设计、或完全不能构建时停下并报告。

---

## 1. 审查材料与事实快照（不可把旧状态当现状）

- Repo `Chen-wsnd/yardshift-3d`；当前 branch `feature/v06-playable-learning-qa`；`f976eed` 是文档戳，源码功能提交前一条为 `5f7e7d8`；祖先 `d8eb23c`。
- 已读取 `docs/V06_OWNER_PLAYTEST.md`、`docs/V06_EXECUTION_LOG.md`、`README.md`、`docs/ASSET_MANIFEST.md`、`docs/TOOL_KNOWLEDGE_SOURCES.md`，主要 `src/features/garden/*`、`src/game/store/gameStore.ts`、`src/game/garden/*`、`src/game/learning/*`、`src/game/work/*` 及测试。
- Cursor **报告** `typecheck/lint/build PASS`，`npm test` 119/18 files；静态审查没有重新运行。`FPS=NOT_MEASURED`，`HUMAN_NOT_TESTED`。GitHub 远程并无公开试玩部署 URL。
- 现有：统一 Saturday garden GLB、草坪 fine cells 与两类割草机、动态修篱枝屑、全院碎屑/收集、独立修边、花坛拔根/截顶、安全检查、工具状态、VisitSummary 和 A/B、工具知识 copy、自动化测试。
- 真实已使用素材：`public/assets/models/yardshift-kit/*.glb`、部分 `public/assets/textures/grass/*`；绝不为了收尾重新购买整套庭院。

### 1.1 故障优先级制度

- `P0 GAMEPLAY BLOCKER`：路径不可进入、持续操作被重建中断、状态丢失、手动不可达目标、错误结果可以标作完成。**必须修复并跑浏览器。**
- `P1 EXPERIENCE / CAUSAL TRUST`：工具用起来与规则不相符、镜头/点击命中失效、被迫反复猜按钮、比较结论错误、明显视觉与任务物体对不上。**同轮完成。**
- `P2 VISUAL / PRESENTATION`：模型细节、草地画质、缺一个石块模型、镜头小范围优化、轻音效。仅当明显妨碍读懂任务时提升为 P1；否则记录并交付。
- `P3 FUTURE CONTENT`：天气、赛季、生态、复杂成长经济、多人、更多庭院/工具。**本轮不做**。

---

## 2. 有证据的全项目问题清单（绝不是把这些拆成微任务）

### P0-01 无工具任务无法从确认窗口进入〔CODE_CONFIRMED〕

**链路**：`src/data/gardenTasks.ts` 的 `hazard.tools = []` → `WorkConfirm.tsx` 对空工具集合设置 `canStart = true` 且 `onConfirm(chosen)` 为 `null` → `GardenShell.tsx` `onConfirm` 第 235 行左右有 `if (!toolId) return;`。**结果**：即使 Start 按钮可点击，Hazard 不会执行 `setActiveGardenTask("hazard")`，安全检查/清理主线不可达。现有测试未验证 DOM 从“点击 hazard 热点 → Start → 清除对象”的全程。

**修法**：把 `null` 明确定义为 **合法的无装备现场检查模式**，只对 `task.tools.length > 0` 要求 toolId，且仅接受 `task.tools.includes(toolId)`；合法无工具时先 `setActiveGardenTask("hazard")`，不调用 `selectTool(null)`、不强行使用上一个工具。将 WorkConfirm 按钮文案对于 `[]` 改为 `Inspect area`，有工具时仍明确选择。带一条无工具 UI/浏览器回归测试。

**通过**：新存档从 Overview → Inspect → hazard hotspot → 确认 → hazard stage → 点石块第一次观察、再次清除 → 状态 `cleared=true`；返回 Overview 后石块消失；局部割草阻挡解除。无需使用 `window.__yardshift` 直接改状态。

### P0-02 `focusPoint` 导致 Canvas 反复重建〔CODE_CONFIRMED 结构 / HIGH_RISK_TO_REPRO 行为〕

**链路**：`GardenCanvas.tsx` `<Canvas key={`${activeTaskId}-${focus?.x}:${focus?.z}`}>`，而 `DebrisTaskStage.tsx` 的 `onPointerDown` 立即 `setFocusPoint(e.point.x,z)`，`HedgeTaskStage.tsx` 的 `stroke()` 在每次命中 cluster 后 `setFocusPoint(...)`。key 变化使 React **卸载整棵 Canvas 和内部场景**；拖动状态、指针捕获和 camera controls 都可能随之消失。这是典型的“代码测试通过，但耙子/剪篱只能动一下”的候选根因。

**修法**：
1. **Canvas key 只能用于真正的重新建场景边界**（如明确切换任务且有必要），不能由实时 focus、鼠标坐标、碎屑位置决定；优先完全保持同一 Canvas 稳定挂载。
2. 单独 CameraRig / `useThree` + OrbitControls ref，在显式点选区域/碎屑时平滑更新 `camera.position` 和 `controls.target`，**不需要重新创建 Canvas**。active task 切换可明确重置目标，但工作进行中的 focus 不触发相机跳动。
3. `DebrisTaskStage` 在 pointerDown 只初始化操作，不要把**每一个落点**当成“切换镜头”；`HedgeTaskStage` 不在连续 stroke 中不断 setFocusPoint。手动选择碎屑对象的点击可独立触发一次聚焦。
4. `onPointerCancel`/`onLostPointerCapture`/指针离开/切换工具/离开任务应一致清理 drag refs；工作时 orbit 关闭，结束恢复；不遗留 `dragging=true`。

**通过**：同一次按住鼠标，在 hedge 连续扫过 ≥3 cluster；每个 cluster 正确变化并生成枝屑；在 east debris 同一次持续 rake/blow 经过 ≥2 片碎屑；Canvas DOM/WebGL context 无卸载重建；无相机跳位、无重新回到初始工具位置、无残留 orbit 锁。独立跑 3 次。记录浏览器 trace 或状态序列，不只截图。

### P0-03 工作阶段与全院覆盖层竞争射线 / 重复模型〔HIGH_RISK_TO_REPRO〕

`GardenOverviewScene.tsx` 在活跃 TaskStage 时仍渲染 `GardenWorldOverlays`，后者同时包含 `PlantOverlays`、`DebrisOverlays`、`HazardOverlays`。`FlowerbedTaskStage.tsx` 自己又渲染同一 plant 的 `WeedMesh` 与花朵；`HazardTaskStage.tsx` 也在 overlay 的相同位置渲染 hazard；`DebrisTaskStage.tsx` 地面交互面高度约 `y=.02`，debris disc 在 `y=.03` 以上且带 onClick。模型叠加会导致两层对象视觉重复、前层抢射线、点击打到不处理事件的展示 mesh，或触发 focus 重挂载。当前不能仅凭源码断言每次必然失效，**要求实际浏览器 raycast 记录**。

**修法**：制作 `GardenWorldOverlays` 的 `interactiveMode` / `excludeTask`：总览模式模型可点击发起任务，任务模式模型仅视觉且不参与对应任务 raycast；任务中的目标由单个 authority `TaskStage` 管理点击；或分离 `PresentationalX` 与透明 `InteractionProxyX`，始终每个世界对象 ID 只有一个有效 hit target。Hazard/Flowerbed/Debris stage 在真实运行中不应同时注册互相竞争的事件目标。**不能因为修 raycast 而删掉真实世界中的可见对象**。

**通过**：点击同一个 weed/hazard/debris 只触发一个合法 action；hit test 没有随机落空、重复结果、模型闪烁、重复 GLB；切换场景后仍能继续点击。

### P0-04 Owner 试玩文档存在启动顺序错误〔CODE_CONFIRMED〕

`docs/V06_OWNER_PLAYTEST.md` 的代码块先 `git fetch origin; git checkout ...`，随后才 `cd "/path/to/Garden Stimulation"`，对从任意终端目录启动的人会立刻失败。且 `README.md` 的“Current playtest path”仍写旧 `feature/v06-yardshift-full-experience`，Known Limits 仍声称修边复用草坪格，均已过时。

**修法**：统一准确的 `README.md` / Owner pack：

```bash
cd "/actual/path/to/yardshift-3d"   # 用户自己替换；不是固定文件夹名
git status --short
git fetch origin
git switch feature/v06-final-playable-closure   # 或最终实际分支名
npm ci
npm run typecheck && npm run lint && npm run test && npm run build
npm run start
# 终端打印实际端口后，在独立浏览器 profile 打开对应 localhost URL
```

提示先保护任何 WIP，再切换分支；`git status` 不干净不得强行覆盖；`npm ci` 仅影响 node_modules，不删除存档。`npm run dev` 可用但正式试玩优先 `build/start`，不要同时占用 3000；按终端端口选择 URL，不能假设服务已启动。脚本应短且可复制，不凭空指定电脑 clone 路径。

**通过**：新终端、正确 repo 路径下从零启动成功，页面无白屏/GLB 404，清晰提示 Node 版本、已有端口冲突、无法访问时先看终端日志。Owner 不需要 Cursor 在旁口头教学。

### P1-01 旧存档迁移会出现不可达花坛目标〔CODE_CONFIRMED 风险〕

`src/game/garden/fixtures.ts` **新建**杂草已移到西侧操作区；但旧 domain 的 `migrateGarden.ts` `countsTowardCompletion: p.countsTowardCompletion ?? true`，会让旧版保留在 `MEASURED_DANDELIONS` 的 x≈3、-0.5 等远处 weed 继续计入花坛完工。`FlowerbedTaskStage.tsx` 又遍历所有 `countsTowardCompletion` 目标，在同一花坛镜头内渲染它们，远处用户不一定能操作。旧玩家可能一直看到 `weedsWithRoots > 0`。

**修法**：为旧版本设计一次性、按 ID/位置可验证的迁移：只对确属旧版固定远处 weed 的未完成对象重定位到可达西花坛，或保留原位置但提供同世界中独立可达的工作区域；**绝不重置已拔根/已截顶/花朵受伤数据**。保留修正前后对象 ID 和世界状态关系。不能笼统把所有旧 plants `countsTowardCompletion=false` 逃避任务，也不能无条件重建 fixture。

**通过**：构造 schema=1/2 的旧快照含远处未处理 weed + 一株已拔根 + 一株受伤花，rehydrate → 前者有可见、可点击、可做完的路径，已完成及伤害不变；刷新两次不会重复迁移、ID 不漂移，VisitHistory 保留。

### P1-02 “封存后只读”只拦住部分行为〔CODE_CONFIRMED〕

`gameStore.ts` 有 `sealedBlock()`，主施工 action 已有 guard；但 `setActiveGardenTask`、`selectTool`、`inspectObject`、`revisePlan`、`dispatchGarden`、`setFocusPoint` 等路径并未统一采用不可变/只读约束。`GardenWorldOverlays` 的 debris 点击会直接调用 `setActiveGardenTask("debris")`。因此 sealed 世界仍可能进入任务、修改 event/setup/plan；Review UI 使用 live GardenDomain，而 VisitSummary 又被冻结，两个来源可能分歧。

**修法**：明确封存态允许的动作：允许相机移动、查看对象/打开历史 Review、重试/退出；禁止再修改施工世界、工具消耗、Inspect 计时、计划、事件及当前访问指标。把 **写入类动作**通过统一 domain command guard（或者每个 store 命令显式 guard）；区分只读导航动作不应写 event。sealing 应一次性生成 immutable VisitSummary 并从该快照显示“本次封存”；重复 Finish 幂等。`GardenWorldOverlays` sealed 点击只聚焦/提示，而不进入操作态。

**通过**：封存前 state/hash/eventCount/effort/visitHistory 记录；之后通过 UI 和 store 正常 API 执行所有相关动作，只有允许的纯 UI 显示改变，world+sealed summary 完全不变。测试 restart、reload、back、double-click Finish。

### P1-03 绿篱重复扫过的过剪事件、成本与幂等不一致〔CODE_CONFIRMED〕

`HedgeTaskStage.tsx` 对 powered tool 重复触达已剪 cluster 会 `overcut=true`；`gameStore.cutHedgeCluster()` 在检查 cluster 是否未剪之前先调用 `guardAndConsumeTool`，之后使用固定 `id = hedge-cut:${clusterId}:${toolId}`；`applyGardenEvent` 对重复 ID 幂等直接返回。玩家连续鼠标事件可能每次都消耗电量/磨损，却没有生效新的 notch，UI 还声称已经 overcut。反过来，第一次 manual、后 powered 又可能被当成有意过剪。

**修法**：单次 stroke 内同 cluster 最多一次有效 work（手动/动力统一 hitSet），pointer 高频采样不造成隐性额外消耗。若确实需要**有意识的第二次过剪**，定义显式的再次施工动作（新的 gesture ID/时间或确认阈值），`HEDGE_OVERTRIMMED` 独立事件，不复用第一次 `HEDGE_CLUSTER_CUT` ID；已剪未发生新效果时不谎报 progress，不能免费重复产生 clipping。先算合法 target/是否产生效果，再消费资源。即时 feedback 解释“不可恢复的过剪缺口”。

**通过**：同一拖拽 5/50 个 pointer samples 消耗近似一致；同 cluster 只算一次 cut；故意再次修剪才出现 notch/质量扣减；无视觉状态变化时不能记录成功切割；刷新仍一致；前后工具计量可比。

### P1-04 A/B 质量可比判断可能跨越质量等级阈值〔CODE_CONFIRMED〕

`src/game/learning/visitSummary.ts` `comparableCoverage` 允许草坪/修边百分比相差 8pp，但没有直接比较 `qualityBand`；例如一局草坪 69%（incomplete）另一局 72%（acceptable），边缘与其他指标相同，8pp 容差可能让它们“可比较效率”。这与“质量不同不比较效率”的产品规则冲突。

**修法**：固定 fixture+安全损伤+`qualityBand` 一致是硬门槛；同质量带内也要约束完成任务的绝对差距，阈值及原因透明。可给玩家显示“质量差异”“还有多少未完成”而不比较速度；不要“改写历史成可比”。另外 `toolsUsed` 当前收集所有含 `toolId` 的事件，包括单纯的 `TOOL_SELECTED`：应区分 `selectedTools` 和 **实际有效操作 `usedTools`**，割草、修篱、花坛、修边、清理都有真实来源，不能说拿起来过就是用过。

**通过**：69% vs 72% / 需注意 vs 可接受 -> `comparable=false`；工具只是选中未施工 -> 不计 `usedTools`；同 fixture 同质量同覆盖、两种有效工具导致的投入差异才可比较。

### P1-05 教学建议的 eventId 可能不是引发该建议的真实事件〔CODE_CONFIRMED〕

`learningAdvice.ts`: potential redirty 分支取的是**最后**一个 clipping spawn，不一定是与先前清理重叠的那个；未清除 hazard 时合成 `eventId=inspect:${h.id}`，即使 inspect 事件根本没发生；学习建议承诺 event-backed 时这是不可靠的引用。

**修法**：在 `countPotentialRedirty` 返回真正符合空间/时间的 spawn event IDs（或 `sourceActionId`），让 advice 指向相应事件；无历史事件的 hazard 是**当前状态建议**，不写假的 eventId。加入可选 `sourceType = event|current-state` / `entityId`。若 UI 能点击建议定位到现场，真实对象已被清除则只显示“曾经的事件位置”，不模拟复活。所有显示的 eventId 必须能在访次封存事件中查到。

**通过**：两段剪篱在东西两处、只有东侧落在清理过的地上时，提示只能指东侧对应 spawn；未 inspect 的风险仅标 `current state`；事件 ID 查找零孤儿。

### P1-06 工具失效后的自救通路没有在 Garden UI 闭合〔CODE_CONFIRMED + RUNTIME〕

`gameStore.ts` 存在 `repairTool()`，也有 `rechargeTool()`、`clearJam()`；但是 `GardenShell.tsx` 底部工具栏只暴露 Recharge / Clear jam，没有 broken 的可见修复入口。部分工具经过足够次数操作后 `condition=0/status=broken` 会失败，玩家可能无法继续该工具操作。`repairTool()` 本身允许低余额延期计费，但 Garden UX 无法找到它。

**修法**：在工具栏/Preflight 中显示 `condition/status/resource` 的简单非冗余状态；broken 显示 `Service / Repair` 操作及费用/努力说明，调用既有 `repairTool`，错误反馈可见；不能暗中“充值即修理”。在试玩模式可保留现有延期费用语义，不重新发展商店经济。重试恢复当前场景初始设备但不抹前次总结。

**通过**：主动使一件核心工具耗尽电量→Recharge；卡住→Clear jam；坏掉→Repair 后继续；三种状态严格区分；没有资金死锁，费率如有变化只影响真实修理事件。

### P1-07 pointer/hover/camera/动线的交互不是单测能证明的〔HIGH_RISK_TO_REPRO〕

`LawnTaskStage` 有 `setPointerCapture`、`onPointerLeave` 立刻 `endDrag()`，高速鼠标可能离开交互面而截断；`DebrisTaskStage`、`HedgeTaskStage`、`EdgeTaskStage` 的 pointerCancel/lostCapture 清理不一致。`GardenHotspots.tsx` 标签 `<Html class="pointer-events-none">` 不接受点击；玩家可能以为标签能点而点不到地面 box，尤其被真实 3D 场景遮挡时。`Debris` Camera 旧 P2 “偏 patio”也可能是正经操作可达性问题。

**修法**：统一 `useWorkDrag`（可轻量 helper）处理 down/move/up/cancel/lost capture/route change；pointerId 绑定，切换工具中止，不因 hover 离开就丢 capture。Hotspots 提供可实际点击的可访问 DOM 标签或明显的 task marker（无多重事件、保留场景代理），新玩家无需知道透明 box 位置。CameraRig 聚焦到工作物体 + 可看清作业面的俯视角；无透墙/无极端裁切。优先 desktop 鼠标测试，触屏本轮可标有限支持但不可静默假装完全兼容。

**通过**：6 类任务在 1440×900 和 1280×720 的浏览器鼠标交互可靠；标签点击、点模型、拖动、松手、跳出区域、返回重进、复盘回来都能继续。给出失败率/具体失败视频 trace，而不是“我觉得能点”。

### P1-08 静态数据/视觉与真实模型定位的回归〔HIGH_RISK_TO_REPRO〕

当前 `gardenPlacement.ts` 部分从 GLB 测量、部分人工偏移；西侧花坛/东侧绿篱/南侧路缘/初始碎屑都已在世界坐标。加入真实工具、花瓣、草叶代理后，某些任务镜头可聚焦到庭院其他部分、物体被 baked mesh 遮挡、ground patch 看起来不属于原院子。

**修法**：保留 `scripts/inspectGardenScene.mjs`、`gardenPlacement.ts` 和 fine lawn authority，统一 R3F 交互的 bounds/center/cameraRef；确保改动具有测量依据。花坛不要复制两组坐标，动态对象不复用静态 hotspot 中心。对有自定义 offset 的区域保持 provenance 注释；不要凭某张截图“看着差不多”就改几米。

**通过**：`/?debugPlacement=1` 对 6 区测量与 overlay 核对；每个任务入口物体可见、操作平面和模型重合、结果回 overview 视觉保留；对被遮挡的对象有可点击选择替代方案。

### P1-09 样本频率导致工具效率结果不稳定〔CODE_CONFIRMED 风险，须测试〕

割草 `pathLength()` 已按真实路径测量，但 `applyEdgeWork` 仍每次 `onPointerMove` 执行一次 Guard 耗电/磨损，且先消耗再判断是否触到有效 edge；powered hedge 也可能按高频 pointer 重复消耗。设备能力不应该由显示器刷新率/鼠标事件密度决定。若同路径不同采样率耗电差几倍，玩家学到的“何时用动力工具”就是假知识。

**修法**：基于有效移动长度/实际受影响目标数/动作窗口计量一次，或设计单 stroke 累计器；无效操作若有空转耗电应明确记录为 ineffective 而非 silent。每次相同几何路径按 4、16、64 samples 比较 coverage/condition/resource/effort（模型内允许有明确、事先定义的容差）。保持所有工具状态一套 Guard，做到受阻不凭空成功。

**通过**：测试矩阵 C26–C33；结果不随采样率线性恶化；用户能从真实“宽度、精度、后果、准备成本”判断工具，而非事件频率。

### P1-10 文档和专业知识源 ID 对照不闭合〔CODE_CONFIRMED〕

`toolKnowledge.ts` 里出现 `umass-lawn-mowing`、`ucipm-string` 等 sourceIds，但 `docs/TOOL_KNOWLEDGE_SOURCES.md` 的 sourceId 栏并没有完全对应；已有文档的 `isu-leaves / umn-leaves` 合并 ID 也难机器查证。知识来源与显示 copy 要一一对应，防止后续“资料看似齐全，实际查不到”。

**修法**：每个 `ToolKnowledge.sourceIds` 都有完整、准确的一条 source registry：`sourceId -> URL -> verified claim -> limitation -> checkedOn`；无需 UI 大量脚注，但专业说明材料在 docs 可查。内部 simulation 参数与专业事实分开，所有“现实中必然如何”改为有证据或适当限定的表述。无季节/鸟巢/真实成长的机制应标 NOT_SIMULATED。

**通过**：所有非空 sourceIds 通过 registry 引用完整性单测；无虚构 URL；每个安全关键工具 preflight 与实际阻挡逻辑符合现有模拟能力。

### P1-11 Owner 在两轮尝试中难以看见“自己做了什么不同”〔PRODUCT_INFERENCE〕

`VisitSummary` 已封存数量/effort/少数 events，但比较面板主要是 total/rework 文字和选过的工具。玩家不一定能回答“我这次改变了什么判断，为什么更好”；目前 F01–F09 是功能闭环，**学习迁移仍待人工验证**。

**修法**：简洁清晰的 A/B 回顾：初始一致性、两次实际工具使用、真实操作顺序的关键事件、质量差异/未完成工作、同地返工和准备/恢复成本；不同质量时只做因果解释不比较速度。可以做 3–5 条可展开事件回放（来源 eventId），不要编造“正确答案”，也不用开发复杂录像功能。产品负责人 4 道非诱导题的人工结果单独记录。

**通过**：人不用开 DevTools 就能说出两轮差别；没有事件时不生成“你犯了错”建议；有事件时可追溯。

### P2-01 模型、音效、性能：最后再决定资源开销

Hazard stone 目前 `dodecahedron`，Debris disc 仍简化，草坪尚未形成逐叶逼真效果，暂无音效；这些不应超越 P0/P1。只有当物体在实机中**认不出来、看不见或被错误点击**时才升级为 P1。FPS 尚未测，必须本轮测量一次并记录机器/尺寸/样本窗口，不能再无声写 `NOT_MEASURED` 当完成全部性能验证。


---

## 3. F00–F09 玩家旅程逐环节收尾标准（以此检查整个产品，而非逐点止步）

每个阶段必须同时回答五个问题：**玩家现在知道什么？要判断什么？用什么工具怎样操作？世界怎样变化？复盘能提供何种真实证据？** 每项能力先修入口和效果，再让外观服务于理解。

### F00 — 从新浏览器启动 / 继续旧存档

**文件**：`src/app/page.tsx`、`GardenShell.tsx`、`PersistGate.tsx`、`gameStore.ts`、`migrateGarden.ts`、`docs/V06_OWNER_PLAYTEST.md`、`README.md`。

- **进入**：独立 profile 第一次加载，呈现已加载的 Saturday garden，总览摄像头稳定；Loading/错误状态可区分，未加载模型应有可读消息而非永久空白。旧存档需要迁移，不触发默认重置。
- **需要判断**：刚进入玩家应理解“这是一个有多项真实工作的庭院”，清楚知道 Inspect/选择区域/Work plan/Review 在哪里；不是自动把玩家塞入割草任务。
- **实现**：移除错误 README 旧分支说明；修 Owner pack 启动顺序，增加 Node/port/安装错误排查；对存档创建、重试、旧版迁移加测试。不要在开发和浏览器 QA 中清掉用户主要 profile 的 localStorage。
- **证据**：fresh profile 和导入旧 schema 的 localStorage 两条路线；刷新后保存、第一屏可用、无 Console runtime error、网络核心 GLB/字体不出现无法恢复的 404。

### F01 — 观察和识别工作对象

**文件**：`GardenHotspots.tsx`、`GardenOverviewScene.tsx`、`GardenWorldOverlays.tsx`、`GardenShell.tsx`、`gardenTasks.ts`、`gardenPlacement.ts`。

- **环境事实**：草坪有石块风险、东篱有硬木、路缘待修整、西花坛杂草和花相邻、庭院两端有落叶；从俯视视角真实看见位置差异。
- **玩家判断**：危险物不可等同普通落叶；哪些是保留的花，哪些是待拔的杂草；什么工作会在地上生成碎屑。
- **实现**：可点击的热点/标签、Inspect 前后信息层次分明；未 Inspect 不强行禁止普通探索，但不能让不可见点击盒子成为唯一入口。`Inspect` 揭示不等于替用户选工具。 hazard 进入问题首先修复；Hover/click 事件不能被 GLB/Html 遮挡。
- **证据**：从鼠标点 Overview 直接可进入全部 6 个 area，其中安全工具数零也合法；重复 Inspect 不增加投入；第一个 30–60 秒能发现至少两种工作（此项人工另测）。

### F02 — 自主决定工作顺序（可放弃计划）

**文件**：`WorkPlanPanel.tsx`、`garden/reducer.ts`、`visitSummary.ts`、`GardenShell.tsx`。

- **玩家判断**：把“危险物确认”“会产生碎屑的施工”“收尾清扫”合理安排，但不是被强制正确答案；计划改变之后实际工作仍自由。
- **实现**：计划是可选择的记录/编辑面板，不是 action guard；明确计划任务排序和**实际做过的顺序是两回事**。比较两次施工时只用 actual event stream 解释，绝不从计划顺序推断违规。可选保存一份计划快照作为回顾，但不做新任务打卡经济系统。
- **证据**：任意 plan order 下可作业；两条操作路径不同但质量可比时才评价努力差异；Plan 不是隐藏结算奖惩。

### F03 — 工具选择与准备

**文件**：`WorkConfirm.tsx`、`GardenShell.tsx`、`equipmentProfiles.ts`、`toolKnowledge.ts`、`toolUseGuard.ts`、`durabilityRules.ts`、`gameStore.ts`。

- **玩家判断**：在看到现场情况后选择具体工具；知道宽度、精度、反向、覆盖、能源、受阻、安全前提与物体差异。
- **交互**：有两种工具的工作区不能默认帮玩家选第一项；无工具任务应直达 Inspect。已有工具可切换，但切换不强制退出/重进任务。
- **准备恢复**：battery empty → Recharge；jammed → Clear jam；broken → Service/Repair；检查前风险不必全园硬锁，只局部 block。所有提示写人话，不用 `TypeError`、`toolId` 当主要教学用词。
- **证据**：选错工具有可理解解释但不改世界；不同工具实际效果不同；资源归零不会偷偷施工；已有核心工具不会永久死锁。

### F04 — 草坪：推行、范围、能量与花边

**文件**：`LawnTaskStage.tsx`、`lawnSweep.ts`、`LawnFootprintLayer.tsx`、`MowerTool.tsx`、`lawnGrid.ts`、`gardenFixtures.ts`、`gameStore.ts`。

- **玩家判断**：滚刀手推机适合可控路径且推行方向重要；动力机覆盖更广但需电，花边精度受限；石块风险要先检查。设备动态不应暗示虚构的厂家规格。
- **输入**：真实 drag；采样含起点和有效插值；高速移动不瞬移也不凭空断一截；drag cancel 正常释放。R3F 前端事件必须触发 `performWorkAction` 并修改对应 WorkCell。
- **结果**：未割/已割视觉明显；损伤表现不被“完成率升高”掩盖；回总览变化保留。单位路程带来合理耗能、磨损和时间抽象；4/16/64 采样密度结果近似，不会因高端鼠标受到任意惩罚。
- **证据**：两台模型确实不同、不同宽度切割 footprint 可见；工作距离、样本长度、工具电量一致；石块未清的路径被阻，清除后可以割，周围没风险的区域不被锁。

### F05 — 绿篱：手剪/电剪、硬木风险与产生碎屑

**文件**：`HedgeTaskStage.tsx`、`garden/reducer.ts`、`gameStore.ts`、`GardenWorldOverlays.tsx`、`GardenToolView.tsx`。

- **玩家判断**：手剪小范围精确、电剪覆盖长面但受硬木阻碍；过剪有持久质量后果。
- **输入**：连续扫过数个 clusters 不中途重建 Canvas；按视觉范围命中真实 cluster；不同密度采样不影响每 cluster 一次工作费用。
- **结果**：绿篱轮廓改变，同一地面生成枝屑（唯一 `sourceActionId`）；不能重复生成；有意二次过剪需独立事件，不可由 pointer 噪声无意触发。
- **证据**：清除硬木后电剪能使用；一口气剪 3 块实际完成且电量/磨损合理；从总览可看到 cut & debris；再进入可操作新碎屑。

### F06 — 路缘：为什么割草不等于修边

**文件**：`EdgeTaskStage.tsx`、`garden/edgeFixtures.ts`、`GardenWorldOverlays.tsx`、`gameStore.applyEdgeWork`。

- **玩家判断**：大面积草坪与窄缝边缘不是同一种施工；手修边器能精控，线割机可快但要小心。
- **输入**：沿南侧路缘长拖，按实际路缘而非其他地方命中；drag 过程视觉与操作范围一致。高频 pointer 不应导致线割机夸张耗电。
- **结果**：`edgeSegments` 独立变化；`lawn WorkCells` 不因修边而完成。修边质量和完成度在 Review 独立体现；离开再进不丢。
- **证据**：玩家在草坪完成 70% 但边缘 0 时能清晰看见问题；修边直到完成；对比两种工具实际 footprint 与成本，不能仅更换文本/模型。

### F07 — 花坛：认识杂草、截顶与拔根

**文件**：`FlowerbedTaskStage.tsx`、`garden/fixtures.ts`、`migrateGarden.ts`、`garden/reducer.ts`、`gameStore.pullWeed/topCutWeed/damageFlower`。

- **玩家判断**：野草和花朵外观不同；线割机截顶看似整理但未去根；手动除草能去根，却要准确选中，误伤花会留下质量后果。
- **输入**：可实际点击花坛里所有**参与完工**的 weeds；在 camera 内可见，避免后面世界中的 GLB 代理争夺 raycast。旧版存档里的目标一样可达。
- **结果**：截顶后 tops 变小但 rootRemoved=false，手除草才 rootRemoved=true 并产生新的可清理材料；点击花朵发生已定义的伤害，不被计作拔草成功。卡住/无电不能成功截顶；手工具操作守卫在 store 层而非仅 UI。
- **证据**：同一植株先截顶→复盘提示“根仍在”，再拔根→从未完成目标中移除；刷新状态不反弹；已拔根不再长出可点击重复对象；受伤植物不自动变完美。

### F08 — 清理：全院、局部、生成、聚集、装袋与真实返工

**文件**：`DebrisTaskStage.tsx`、`GardenWorldOverlays.tsx`、`garden/reducer.ts`、`spatialRework.ts`、`GardenCanvas.tsx`。

- **玩家判断**：rake 是聚拢、blower 是改变方向、bag 只收已聚集物；在产生枝屑前后清扫会影响是否需要重复劳动。并非现实中所有落叶都必须装袋，本关按客户任务模拟。
- **输入**：能从 Overview 点击东篱/西南 debris、进入正确可视位置，保持同一长拖；镜头不被每次 rake 重置；bag 只能作用于附近 gathered，不允许点击任意地面瞬清全院。
- **因果**：初始 debris 可聚拢/清除；修篱后在东侧留下新的 clipping；清了东侧再修篱导致复脏，但只有玩家**第二次清理**才记录 spent rework；清西南+修东侧不能算返工。跨区域 world-state persists。
- **证据**：A=修篱→清理一次，B=先清→修篱→再次清理，控制最终质量相同，B 的真实返工 > A；至少一条全浏览器（不注入 store）路径；吹散已堆积的材料可恢复拾取，不永久丢失。

### F09 — 封存、复盘与同院再试

**文件**：`WorkReviewPanel.tsx`、`reviewSelectors.ts`、`learningAdvice.ts`、`visitSummary.ts`、`gameStore.finishVisit/startV03Garden`。

- **玩家判断**：真实已完成多少工作？哪里做错了？为什么某工具更有效/不合适？是否真正出现重复劳动？再试会改变什么？
- **结果**：完工不是无条件奖励；早停可以封存 `incomplete`，危险/损伤是 `needs-attention`；只有安全质量与覆盖达标才可接受。每条教学 advice 要么来自真实 eventId 要么明确是当前状态提醒；不伪造行动历史。
- **封存**：禁施工和设备/状态写入，允许看景和查记录；重复 Finish 唯一历史。Try again 同样 fixture reset 世界、保留前次封存记录。质量等级不相同只谈质量，不比较效率大小。
- **可感知比较**：用清楚的 A/B 表格列前后工具、完成率、质量带、主动安排、重复清理及抽象 effort，不需要具体统计学模型，也不把 effort 映射为真实工时。没有改变的行为不编造进步。
- **证据**：从 UI 封存后测试多入口写命令全部不变；刷新 / retry / 第二轮 finish 后两条 summary 不被覆盖；质量等级不同不输出“你快了 X”；足够典型的建议引用实际事件。

### F10 — 负责人试玩并收集非诱导反馈（不是 AI 自我打分）

`docs/V06_OWNER_PLAYTEST.md` 必须提供完整从启动到 A/B 的路线、5–8 分钟主体验、可选 8–12 分钟完整施工路线、四个非诱导判断问题，以及可填写的 PASS/FAIL/HUMAN_NOT_TESTED 栏位。即使 Cursor 自己浏览器完整跑通，也不能自动标 `HUMAN_PASSED`。若主人没玩，文件和最终报告必须明确等待的是人类评估，而不是“产品已经证明教学有效”。

---

## 4. 工具端到端审查矩阵（防止有模型、有说明，但真实操作不一致）

| 工具 | 能让玩家学会什么 | 正确动作/可见效果 | 约束/不应发生 | 主要代码/资源 |
|---|---|---|---|---|
| manual-reel-mower | 前推滚刀、窄幅、控制 | 正向拖动→窄草条；轮和刀轴动画 | 倒推不能同速同宽；石块局部拦截 | `MowerTool.tsx` + `lawnSweep.ts` + `manual-reel-mower.glb` |
| lawn-mower | 宽幅、动力、能源、风险 | 路径影响更宽、按距离耗能 | 不充电不能动；不能当路缘器；花朵伤害不隐去 | `mower.glb` + `lawnSweep.ts` |
| hand-hedge-shears | 精细剪枝 | 单个/少量 hedge clusters 改变+枝屑 | 不随采样率无限剪；不能切硬木 | `garden-shears.glb`, `HedgeTaskStage.tsx` |
| hedge-trimmer | 长面快速修篱与过剪风险 | 宽覆盖、耗电、枝屑 | 硬木局部阻；静止噪声不自动过剪；无重复枝屑 | `hedge-trimmer.glb`, `toolUseGuard.ts` |
| hand-edger | 专门的窄边缘作业 | 独立边缘状态改善 | 不改变 lawn %；形状不是线割机伪装 | 程序化 half-moon, `edgeFixtures.ts` |
| string-trimmer | 边缘与地表截顶，但不拔根 | edge 或 weed top 变低；电量耗用 | rootRemoved 不能被设 true；花朵风险有解释 | `string-trimmer.glb`, store guards |
| hand-weeder | 识别目标并拔根 | rootRemoved，留下可清理草屑 | 选中花朵会受伤；不能触发线割机效果 | 程序化 forked weeder, flowerbed |
| rake | 定点归拢 | scattered→gathered | 不自动 bag / 全院瞬清 | `leaf-rake.glb`, `reducer.ts` |
| leaf-blower | 方向与环境扰动 | 物体沿方向移动，可能吹散整齐堆 | 无电不工作；空转计费透明，移动不能消失 | `leaf-blower.glb`, store guards |
| bag | 收集已聚拢物 | nearby gathered→bagged，世界中消失 | 远处、scattered、无物件点击无效果 | `grass-bag.glb`, `bagDebrisAt` |
| hands/inspection | 辨识危险并清除 | 第一次查看、二次确认清除 | **无需 toolId**；不是选择空工具的假任务 | `HazardTaskStage`, `WorkConfirm`, `GardenShell` |

**所有工具都必须检查四个交叉边界**：①同一个操作在 Store 和 UI 中语义一致；②设备状态会真正限制效果；③展示模型与专业工具身份相符；④复盘所说的“使用”代表真实行动而不是选择。不得因为工具有一个说明卡就认为完成教学。

---

## 5. 素材与补充资产：先盘点，绝不被资产采购拖入循环

### 5.1 已在 repo，可直接使用，不需要重新搜索或购买

- 庭院基底：`public/assets/models/yardshift-kit/saturday-morning-back-garden.glb`（当前 overview/task 共享）。
- 草坪变化：`lawn-uncut.glb`、`lawn-cut.glb`，加现有 fine grid instancing。保留**唯一权威** WorkCell。
- 动力/手推割草机：`mower.glb`、`manual-reel-mower.glb`（已用，部分有动画 clips）。
- 修篱/草：`hedge-block.glb`、`dandelion.glb`、`flower-bed-border.glb`。
- 手持设备：`hedge-trimmer.glb`、`garden-shears.glb`、`leaf-rake.glb`、`leaf-blower.glb`、`grass-bag.glb`、`string-trimmer.glb`。
- 其他底座装饰：`picket-fence.glb`、`patio-chair.glb`，通常已包含在庭院大 GLB。
- 地面 PBR：`public/assets/textures/grass/{color,normal,ao,roughness}.jpg`；当前概览主要用 kit 材质。只有改善实际可读性的明确收益才调整，先看性能。
- Hand Edger/Hand Weeder：仓库已有**与工具身份相符**的程序化轮廓，直接保留，没必要新下载来冒充。

**正式已用与仅在库中不同**：保留 `docs/ASSET_MANIFEST.md` 的 `ACTUALLY_USED / IN_REPO / CANDIDATE / REFER_ONLY` 区分。保留 `SHA256SUMS.txt`；若运行时模型加载失败，可回退 lightweight procedural presentation 但不允许功能失踪。

### 5.2 真实缺失项及是否值得本轮引入

| 材料 | 需求 | 现有可行解决 | 候选来源/条件 | 本轮决定 |
|---|---|---|---|---|
| Hazard rock 真实形状 | 若玩家无法识别或点击 hazard，是 P1 | 当前 dodeca overlay + 改 hitbox/标识可先解决 | Kenney Nature Kit 官方 `https://kenney.nl/assets/nature-kit`（CC0；含 rock），需核查与现有美术风格的兼容 | **可选**，只有明显改善识别且不引入错配才下载/转换 |
| 更自然落叶/碎屑 | 若 disc 过薄无法看清是 P1 | 已有 debris discs 颜色/大小区分，可做小型 instanced leaf shapes | 3DAssets 同系可核实的 leaf pile，或 CC0 独立材质；逐模型核查 | **先用现成**，不要为小素材开新的开发波次 |
| 完整手动除草器与半月修边器 GLB | 工具轮廓专业可信 | 已有正确程序化 silhouette | 只有官方 CC0 且确实更清晰时才替换 | **不要求新增** |
| Tool UI 图片/品牌卡 | 教学主线以对比与操作反馈为主 | 现有知识文本及真 3D 模型 | 可以之后附简约图标 | **P2** |
| 音效、风动草、天气 | 增加沉浸 | 缺失不影响工具因果和判断 | 需验证授权及性能 | **P3** |
| 流程引导/失败反馈 | 首次能找到下一步、知道为什么失败 | 用现有 UI/事件文案/任务目标，不需要新资产 | 无外部采购 | **必须本轮修逻辑** |

**许可依据**：3DAssets.dev 官方 `https://3dassets.dev/terms` 声明贡献模型 CC0；Kenney Nature Kit 官方页面标 CC0。对具体新资源仍需核对模型级使用条款、取得方式、文件校验、License/来源记录；**不支付、不下载授权不明的商业包、不把 AI 辅助模型误称手工原创**。

### 5.3 美术改动停止条件

- 新物体能清楚区分「草 vs 花」「枝屑 vs 落叶」「石头 vs 装饰」「手动 vs 电动工具」，且交互不被模型遮挡，即达可玩收尾标准。
- 仍有视觉想法：用 `P2_VISUAL` 记录截图和预计收益，不在已完成主线时反复换 shader、GLB 或照明。
- 不允许因为没音效/风草/完全真实的草物理而拒绝交付可玩版本。


---

## 6. 一次性连续执行路线：Closure Pass S0–S7（不是八次暂停）

每个阶段做完自动测试、留下内部 commit/checkpoint，**只在构成主线阻塞的风险无法解决时停下**。按依赖执行；如果局部实现比预期简单，可以合并提交，不能回退已正确成果。所有工作在**一个新的 feature 分支**完成，比如 `feature/v06-final-playable-closure`；实际名称以本地未冲突分支为准。

### S0 — 保护基线，建立可重复环境（先于任何修改）

1. `git status --short`：若已有未提交 WIP，先备份/分支检查点，**禁止** `reset --hard`、`clean -fd`、强制 checkout 或删除浏览器数据。
2. `git fetch origin`，确认 `feature/v06-playable-learning-qa` 远程 `f976eed`；本地若在其他增量分支，优先比较最新正确改动，不静默丢失。记录 base SHA。
3. 从现存最新正确基线新建**单一** closure feature 分支，保留 README/Owner pack 现状作前置证据。执行 `node -v; npm ci; npm run typecheck; npm run lint; npm run test; npm run build`，如与之前 119 不同必须记录实际差异而非隐瞒。
4. 在新分支将本文件复制为 `docs/YARDSHIFT_V06_FULL_PROJECT_CLOSURE_MASTER.md`，并新建 `docs/V06_CLOSURE_AUDIT.md`（状态表、证据位置和真实运行结果）。不要把历史 V06 文档再写成最新权威。
5. 建一份真正独立的 QA fixture/profile；**绝不**为了截图去清用户常用浏览器数据。可选增加 `npm run test:e2e` 及简洁 Playwright 测试，但要保持可运行和源码规范，不把安装一大套自动化当成开发目标。

**出门条件**：基线恢复/验证记录明确，所有后续变更在 closure feature 上；开发/浏览器环境启动可重复，owner pack 路径明确。

### S1 — 修正断开的主入口与浏览器工作区（最高优先）

- 修 `P0-01` Hazard 无工具任务进不去；带 `onConfirm(null)` 的合法流程、正确提示、合法工具 ID 验证。
- 修 `P0-02` Canvas focus 触发 remount；相机目标独立控制，保留正在施工的 refs；focus 命令不等于每次 pointer 点击。
- 修 `P0-03` Overlay 与 TaskStage raycast ownership，6 类任务对象点击唯一；修真正被遮挡的热点和标签。
- 统一 pointer capture / lost / cancel；恢复 OrbitControls，离开任务后可安全再进。
- 修 `P0-04` 本地启动；给浏览器 QA 一个不用直接写 store 的进入路径。

**检查点**：逐一通过 `C01–C16`，**必须有浏览器实际连续输入**（不是只单元测试假设）。不满足这一点不得宣告 S1 完成。

### S2 — 逐工具操作、资源约束与可恢复性

- 修 powered/manual hedge 高频事件/过剪/资源：每次有效 stroke/cluster 只记录一次，显式区分故意二次过剪；同路径不同 sample 不产生倍数电量损耗。
- 处理 edge 按 mousemove 耗电/磨损过多，改成基于实际施工几何或有效覆盖的消费；无效操作文案和计费一致。
- 把 Repair/Service 作为用户可发现的恢复选项，与 Recharge/Clear jam 区分；先验风险的提示和安全 guard 一致。
- 复测 mower 正反向、宽度/电量/损伤、flowerbed 顶部/根系差别、rake/blow/bag 含真实材质/命中。
- 优先用已有 GLB 和轮廓模型，不采购新资产。若 GLB 轴/缩放让动作难理解，局部调整 presentation props，**不修改唯一 Work/Garden 状态权威**。

**检查点**：所有工具都能做至少一次有效动作和一次可解释的无效动作，且完整操作通路不会死锁；通过 `C17–C39`。

### S3 — 单庭院状态、旧存档兼容与封存一致性

- 完成 old schema migration 可达性修正（不抹 lawn/weed/flower/edge/history）；旧数据刷新两次仍稳定。
- 统一 sealed read-only 的状态机边界：world-mutation 拒绝，视角/纯查看允许；包括隐藏 UI 可调用的 store 方法。
- 记录有效工具行为与目标影响，改 `toolsUsed` 语义；区分 selected/used，避免玩家“拿起来”就显示“使用过”。
- 修复 A/B `qualityBand` 阈值差异误判；保留可比时的真实投入差异，不强行证明玩家更快。
- 修复 `learningAdvice` 实际 eventId 链接与无事件风险提醒；事件复盘不写幽灵 ID。

**检查点**：`C40–C53`；同条件重试不会修改已封存 summary；质量不同的两次不能效率比较；旧存档不被迫重玩。

### S4 — 逐世界区域完成度及视觉可读性

- 对照 `gardenPlacement.ts`、`scripts/inspectGardenScene.mjs`、`docs/v06-scene-placement-audit.json` 核对 lawn/hedge/edge/flowerbed/debris/hazard。
- 只修真正妨碍目标识别/点击/反馈的素材：例如认不出石块就给简易更可见外观，枝屑太扁就稍抬高/加几片叶；花和草明显不同即可。
- 通过同一座庭院的 Before/After 表示真实状态；不再产生重复对象/画面污染。保证工具模型/刀刃方向/目标范围有合理一致性。
- 修 debris 相机偏 patio：点东侧碎屑，目标区域必须在视图主要可操作范围，返回/再进不突跳。
- 测量性能而不是虚报。记录桌面测试设备、浏览器、窗口大小/DPR、warm-up、10–30 秒 sample 的 FPS min/median、核心 drawcalls/tris（可得时）。目标为正常笔记本交互无明显卡顿；建议 1440×900 DPR1、median ≥30fps 作为最低体验预算，若低于须定位再优化。**阈值是本次验收目标，不代表先前已达到。**

**检查点**：6 片区域全可见/可操作/可回看；没有严重模型遮挡、坐标错位或无法识别的必做物；FPS 有真实记录；通过 `C54–C61`。

### S4.5 — 双语国际化横向整合（必须与 S0–S7 同轮完成）

**要求**：完成 §12.1–§12.7 的 i18n 技术、术语、动态反馈、全部 UI、独立偏好存储与 L01–L27；先保证 S1–S4 主线可靠性，再在 S5 进行双语浏览器回归。语言不改世界权威数据或存档，也不成为独立的下一轮 Wave。

### S5 — 完整浏览器 QA + 学习复盘，避免“测试数量游戏”

跑 **两条不同完整场景**，每条都从独立浏览器 profile/隔离 fixture 的实际 UI 进入：

- `SCENARIO-1 / PROFESSIONAL`：Overview → Inspect → 清理局部危险物 → 选择并使用 mower/hedge/edge/weeder → 收拾实际生成碎屑 → Finish → 确认封存、质量和关键事件 → Refresh。
- `SCENARIO-2 / LEARN-BY-CONSEQUENCE`：新/同 fixture → 先清东侧落叶 → 修篱 → 看见再次落屑 → 再清同处 → 换另一件适用工具观察覆盖/能源差异 → Finish → 同院 A/B（**仅当两次最终质量可比时**才作效率结论）。
- 另跑一条 `SCENARIO-3 / FAILURE-RECOVERY`：故意选错误工具、用无电工具、触碰局部 hazard、工装卡住或破损、提前 Finish 再试修改、retry；系统应该明确解释但允许合规恢复。

验收标准是**用户角度的手势与世界状态**，不是 `useGameStore.setState()` 直接制造正确结论。允许少量 seed fixture / test-only DevTools 断言前后状态，但不允许把状态注入替代执行任务的过程。记录每条动作、真实结果、期望状态、必要的 `eventId`、失败截图/console/network 证据；修缺陷后重跑整条链路。既有 119 项单测必须保持通过；新增测试数量不是目的，优先覆盖缺失的最小端到端断言。

**检查点**：`C62–C71` + 三条实际 scenario 都有操作日志；人类学习结果仍未测不能写 PASS。

### S6 — Owner 试玩与独立复验交付包

- 彻底修订 `docs/V06_OWNER_PLAYTEST.md`：项目目录 `cd` 在最前，实际 branch/HEAD，启动命令和端口检查，独立 profile 步骤；有至少一个**不依赖终端调 store**的精简 5–8 分钟可玩教程和 10–15 分钟完整路线。
- 对每类任务写 `Click/drag what exactly → expected visible state → expected Review effect`，不得只写“进入绿篱看看”。有鼠标无法点中时的诊断说明（不能建议用户更改代码）。
- 保留 4 个非诱导判断问题，不能在提问前泄露标准答案；人工填 `NOT_TESTED` 直到确实让用户玩。
- 给 Owner 一份 1 页 `docs/V06_CLOSURE_OWNER_CHECKLIST.md`：可复制启动、入口地图、6 项任务检查格、一个 A/B 选择、四题、问题回传模板。正文不需要读 10 份历史规范。
- `README.md` 更新当前可玩 feature 与真实限制； `docs/V06_EXECUTION_LOG.md` 与新的 closure audit 记录本轮所有问题真实状态；更新 `ASSET_MANIFEST` 和 `TOOL_KNOWLEDGE_SOURCES`。

**检查点**：独立浏览器用户可以仅凭一份文档完整跑 5–8 分钟路线；不再依赖 Cursor 在旁口头指路。

### S7 — 最终机器验证、Git 交付和停止打磨

- `npm run typecheck && npm run lint && npm run test && npm run build` 全部实际通过。若增添 E2E：`npm run test:e2e` 及浏览器安装方式在 README 可运行；如果某项无法自动运行，明确 `NOT_RUN` 原因，而不是 PASS。
- 快速检查 Git changed assets 包括 LICENSE、SHA、大小、路径 404；没有误改 `main`、生成的 build 产物或不应公开的付费模型；保留旧存档功能和 fixture 迁移。
- 按价值优先补回归测试、证据，不为凑 12 张截图反复换角度。建议交付的**代表性**浏览器证据：初始全院+可点击入口、无工具安全检查、持续剪篱/碎屑、独立修边/花坛、封存后只读、A/B 对照；其余由测试 trace 和 log 支撑。
- 记录 `git log -1 --oneline`、feature branch、push 成功的远程 SHA、实测 FPS、测试数、未解决问题，并标明 `HUMAN_NOT_TESTED`。
- **仅 push feature；不要 merge main，不要 Vercel/部署，不要清普通 profile 存档，不要追求美术 100 分。**

---

## 7. 必需的客观断言矩阵 C01–C71（具备输入→动作→预期结果）

下表 `D`=deterministic unit/integration；`B`=真实浏览器 pointer/DOM（可用 Playwright 或 Cursor browser）；`M`=迁移/persistence；`H`=只可能人类确认。`B` 至少对最关键的 12 项在实际 Chromium 成功执行，不能全部用 store API 替代。若已有测试覆盖，可增强原断言并引用其路径，不要求人为拆成 71 个文件。

| ID | 类型 | 输入 / 操作 | 必须断言或证据 |
|---|---|---|---|
| C01 | B | 独立 profile 访问 `/` | 真庭院首屏加载，无 fatal console 与核心 GLB 404 |
| C02 | B | 鼠标点击 lawn label / hotspot | 打开 lawn WorkConfirm，能选工具进入 |
| C03 | B | 鼠标点击 hedge label / hotspot | 打开 hedge WorkConfirm，能选工具进入 |
| C04 | B | 鼠标点击 flowerbed label / hotspot | 花坛进入并可点击有效 weed |
| C05 | B | 鼠标点击 debris label / world object | 镜头看见目标 debris，可开始真实清理 |
| C06 | B | Inspect → 点击 hazard hotspot | `tools=[]` 也能进入，而不是 Start 无反应 |
| C07 | B | 在 Hazard stage 首次点 stone，再次点 | 首次 inspected，二次 removed；世界风险消失 |
| C08 | B | 点击 edge hotspot | 独立修边可进入并沿南侧路径操作 |
| C09 | D/B | WorkConfirm 有工具但从未选择 | Start disabled；选择合法工具才可开始 |
| C10 | D/B | WorkConfirm 无工具 hazard | Start enabled，合法 `null`，不覆写 selected tool |
| C11 | B | Debris ground 长按连续移动 2 秒 | Canvas 不 remount，drag refs 不消失，至少两片 debris 状态变化 |
| C12 | B | Hedge 跨过 ≥3 clusters 一次拖拽 | 不因 focusPoint remount 而只剪第一块 |
| C13 | B | 重复点东侧 debris / focus | 相机平滑/稳定指向东侧、无需重新载入场景 |
| C14 | B | 鼠标离开工作面、放开、再按 | pointer cancel/up 正确清理，OrbitControls 可重新使用 |
| C15 | B | 目标 mesh 与 overlay 重合 | 一次点击最多一条有效效果，不被“展示层”吸收 |
| C16 | B | 任务内返回 overview 再重进 | 世界状态连续，手势与相机未锁死 |
| C17 | D/B | Mower 低速 forward sweep | Reel 割出窄轨迹，起点与终点都有草坪状态变化 |
| C18 | D/B | Reel reverse 同等路径 | 相对 forward 有定义的明显差异 |
| C19 | D/B | Powered vs reel 同等路径 | 动力覆盖范围符合 profile、能源变化可见 |
| C20 | D | stone 未清时扫其 radius | 只阻附近对应机具，安全区域可施工 |
| C21 | B | stone 清后重扫同位置 | 同一段现可施工，状态持续 |
| C22 | D | 4/16/64 samples 同长割草 | 耗电、覆盖、effort 差异在约定容差内 |
| C23 | B | 真实鼠标快速割草拖拽 | 路径连续、无跳远格或末端长期不跟随 |
| C24 | D/B | 充电前 resource=0，尝试割草 | 禁止成功；Recharge 只恢复电量，不替代修理 |
| C25 | B | 草坪已割回 overview | 仍能辨认变化，花边损伤未被隐藏 |
| C26 | D/B | 绿篱拖 3 clusters | 每个最多一次 cut、同 cluster 只生成一次 clipping |
| C27 | D | 5 vs 50 pointer samples 命中同 cluster | 资源/磨损不因事件频率线性增长 |
| C28 | D/B | Powered hedge 遇硬木未清 | 局部禁止、反馈明确，其他区域正常 |
| C29 | D/B | 清硬木后施工 | 原来阻断区域可操作，不能出现全院锁 |
| C30 | D/B | 故意第二次有意义 overtrim | 独立 overtrim event、质量受影响且不重复创建枝屑 |
| C31 | D | 不同工具重复同 cluster | 不因旧 event ID 吞掉合法过剪，亦不伪造成功 |
| C32 | D | 4/16/64 采样同一 edge path | 相近 edge 完成率、condition/battery/effort |
| C33 | D | Edge drag 全落在目标外 | 目标不变，费用/文案与空转规则一致 |
| C34 | D/B | Lawn cut 一段后 edge 未操作 | edge=0，不能和 lawn 完成混淆 |
| C35 | D/B | 完成 edge 一段 | edgeSegments 更改，lawn cells 完全不变 |
| C36 | D/B | Top cut weed → 未拔 | topCut=true, rootRemoved=false，视觉 top 缩短 |
| C37 | D/B | Hand weeder 随后拔根 | rootRemoved=true，新增对应地面可清材料 |
| C38 | D/B | 用手除草器误点花朵 | 可见损伤、质量不能 acceptable、无伪造拔草成功 |
| C39 | D/B | 能源空/卡住/坏掉 | 工作被拒绝且每个状态有 UI 可见恢复通路 |
| C40 | M | 迁移旧 v1/v2，远处 weed 未做 | 可达/不再错误计入不可达目标，IDs 和损伤保留 |
| C41 | M | 迁移旧 save，lawn partial + damage | remainingWork/damage 不丢、旧存档不被重置 |
| C42 | M | 迁移旧 save 后再次 reload 两次 | 幂等，不生成重复对象/事件/summary |
| C43 | D | 重复 Inspect 同对象 | setup effort 不重复追加 |
| C44 | D | 重复同一 HEDGE/DEBRIS action ID | idempotent，world 对象和事件仅记一次 |
| C45 | D | 只 `TOOL_SELECTED` 无工作 | `usedTools` 不得显示该工具已施工 |
| C46 | D | 真实成功 lawn/hedge/edge work | `usedTools` 有实际工具，未凭空加未用工具 |
| C47 | D | 初始未做任何工作即 Finish | quality=incomplete / needs-attention，不能 acceptable |
| C48 | D | A lawn=69%, B=72%，其他质量相同 | 若 band 不同，`comparable=false` |
| C49 | D | A/B 同 fixture 同 band、覆盖可比 | 能比较 game-effort 与真实 rework delta |
| C50 | D | 质量或安全不同 A/B | 只解释质量，不对速度优劣作断言 |
| C51 | D | learning advice 带 eventId | `domain.events` 中可查到此 ID，且与因果条件对应 |
| C52 | D | 未 Inspect hazard 但仍存在 | 允许 state-backed 提示，不伪造 Inspect event |
| C53 | D/M | Finish 两次、重试一次 | 只生成一个当前封存 summary；重试保留旧 summary |
| C54 | B | Overview 与 task stage 同物体位置 | 无双重模型闪烁，正确命中目标 |
| C55 | B |东篱生成 clipping → 清扫 → 回总览 | 位置符合世界、显示与状态一致 |
| C56 | B | 花坛真实 weed / flower click | 模型不同、hitbox 正确，不可见实例不挡操作 |
| C57 | B | 手动 vs 动力工具 look | 不冒充另一个工具；方向与工作范围大体一致 |
| C58 | B | `/?debugPlacement=1` 全 6 区 | 热点与物体、施工面大致重合；人工偏移有解释 |
| C59 | B | 1280×720 + 1440×900 | UI 无严重遮挡，工作区域仍可视可用 |
| C60 | B | 30s 实际渲染采样 | 记录设备/浏览器/DPR/median FPS，不再仅 `NOT_MEASURED` |
| C61 | D | 所有 knowledge sourceIds | 各自有可核对 registry entry，Claims 与模拟限定不矛盾 |
| C62 | B | Scene 1 全流程由 UI 开始 | 6 类任务都可合法进入、操作和退出，不依赖手动 state 注入 |
| C63 | B | Scene 1 Finish | 封存前后状态/事件/总结一致，Review 可读 |
| C64 | B | Scene 1 Finish 后点击世界碎屑/工具 | **只读**，不能进入可改世界的施工界面 |
| C65 | D | 直接调用 `dispatchGarden/selectTool/revisePlan/inspectObject` 在 sealed 后 | 不改变被封存的世界/effort/events |
| C66 | B | Scene 2 east debris 清→剪→再清 | 只有第二次清理才记录 spent rework |
| C67 | D | 仅 SW 清→east hedge 切 | spent rework=0；potential re-dirty 仅同区成立 |
| C68 | B | Scene 2 Try again → Finish | History 和 A/B 在正确质量条件下可读 |
| C69 | B | 失败/恢复：电量、jam、broken、误选工具 | 明确原因+合法恢复，无死锁 |
| C70 | B | 全程 console/network 检查 | 无严重 JS exception、核心资源 404、Hydration mismatch |
| C71 | H | 负责人完成四道理解题并记录 | **只有人真实完成后**可填 HUMAN_REVIEWED，未测则 `HUMAN_NOT_TESTED` |

**额外禁止**：不能用 `expect(x).toBeGreaterThanOrEqual(0)` 验证“应该真正出现返工”；不能用 `expect(pot.count).toBeGreaterThanOrEqual(0)` 证明潜在返工；不能用 “UI 截图看见按钮”证明点击正确；不能以更大的 test 数量掩盖没有实际浏览器回归。


---

## 8. 自动化架构、浏览器验收与本地性能：用最少额外复杂度证明整体验收

### 8.1 分层验证，不让一种测试冒充另一种

| 层级 | 用什么 | 能证明 | 不能证明 |
|---|---|---|---|
| Unit / pure reducers | 既有 Vitest | 状态推进、事件幂等、因果/质量阈值、迁移逻辑、resource model | 点击目标/镜头/Canvas 中断 |
| Store integration | Vitest `useGameStore` | selected/used 状态、封存 guard、无电拒绝、履约、旧数据恢复 | 3D 物体是否被遮挡或摄像机是否跑偏 |
| Browser E2E | 当前 Cursor 浏览器或最小 Playwright Chromium | 真人视角的 DOM/Three.js pointer、场景进入、拖动/释放、Reload、网络和相机 | 玩家是否真正理解了概念 |
| Owner human review | 独立 profile、非诱导四题 | 首次发现性、工具判断、因果迁移、是否愿意继续玩 | 底层幂等或存储规则的数学正确性 |

如果采用 Playwright，请只增加一个简洁 E2E 测试入口，例如 `tests/e2e/garden-learning.spec.ts` / `playwright.config.ts`，安装后 `npm run test:e2e`；从独立浏览器 context 和固定 fixture 进入。**不要因为没有 E2E 框架就放弃浏览器验收**：Cursor 浏览器手工/脚本实际按鼠标操作也可，但必须提供可复现步骤、状态证据和 Console/Network 记录。任何 E2E 异步等待必须等可见状态/事件变化，禁止 `waitForTimeout(5000)` 靠运气。

**建议添加最少量稳定语义选择器**（优先 `<button aria-label>`、可点击区域和 `role`；必要才 `data-testid`）：`garden-overview`、`area-hazard`、`area-hedge`、`tool-select-...`、`task-start`、`work-review`、`finish-visit`、`retry-visit`。WebGL 内对象的点击可用屏幕坐标/画面识别并辅以 debug placement 数据；不要绕过 UI 直接 setState 作为“操作成功”。

### 8.2 数据判定源必须明确

- **权威来源**：草坪 `WorkSnapshot.jobs[*].zones[*].cells`；其他世界对象与时序 `GardenDomain`；工具 readiness `WorkSnapshot.tools`；记录 `GardenDomain.events` / `VisitSummary`。
- **仅展示**：`GardenToolView`、`GardenWorldOverlays`、`LawnFootprintLayer`、HTML labels、任务相机。展示层不拥有第二套“已割/已拔/已收”的状态。
- **禁止测试盲区**：不允许只看 `onPointerMove` 事件发生，却不检查最终 `cell.remainingWork`、`hedgeClusters[id].cut`、`debris[id].state`、`edgeSegments[id].remaining` 或植物根系。
- **同一次动作**：尽可能记录合法、唯一的 action ID；重复触发 event ID 不增加状态或资源，除非这是**有意识的新动作**，并有独立 ID 与反馈。
- **真实 A/B**：两次都来自同一 fixtureVersion、同样初始目标集合；完成程度/质量带与安全差异先判定，再比较 game-modeled effort；若不同质量，明确 `NOT_COMPARABLE`。

### 8.3 稳定启动、诊断与留痕

建议在 `README.md` 和 `docs/V06_OWNER_PLAYTEST.md` 写成真实终端可执行版本：

```bash
# 1) 必须先进入已有 git 克隆根目录，路径依实际计算机而定
cd "/path/to/yardshift-3d"
# 2) 如存在本地 WIP，先备份/提交检查点，不强行覆盖
git status --short
git fetch origin
# 3) 经确认无冲突后切换到本轮交付 feature
git switch feature/v06-final-playable-closure
# 4) 按 lockfile 安装并验证，勿删除浏览器 profile
node --version
npm ci
npm run typecheck && npm run lint && npm run test && npm run build
# 5) 独立终端启动生产构建（看终端实际端口）
npm run start
```

- 如果 `localhost:3000` 被旧服务占用，应检查端口并关闭**本项目旧进程**，或启动新端口并明确写出实际 URL；不要随意 `killall node` 影响其他项目。
- 如 build 因 Next Font 远程拉取失败，应诚实标明网络依赖、选用适当 fallback 或重试；不能把环境错误归咎于玩法，也不能掩盖 build 状态。
- 独立 Chrome profile 或无痕 context 仅用于测试；禁止在浏览器控制台 `localStorage.clear()` 清用户常用存档。必要时只在该测试 profile 用游戏内 Reset。
- 支持 `/?debugPlacement=1` 供坐标检查。正式玩家模式不要暴露 debug overlays/作弊工具。

### 8.4 FPS 性能验收建议

记录：平台/CPU/GPU（能得时）、浏览器版本、viewport、DPR、是否 `npm run start`、首帧加载秒数、切换区耗时、至少一段 10–30 秒正在割草/修篱的 FPS 样本。可用 `requestAnimationFrame` / R3F 内部诊断及 WebGLRenderer.info 采样，**不要凭肉眼写 60fps**。优先测 “Overview / Lawn continuous / Debris / Switch focus”。若低于最低预算且阻碍工具操作，先看 `Canvas` 反复 mount、GLB 克隆、材质 drawcalls、影子、camera 剪裁，再动 grass shader。不要为了 3D FPS 把业务状态和可靠性重写。

---

## 9. Owner 试玩：不用读代码的可观察验收清单

为 Owner 提供一个真实**可直接运行**的本地版本，而不是一份“Cursor 的学习效果自评”。建议内容如下，最终由 Cursor 按交付时真实 UI 更新为可执行版本，并将以下每步映射到实际按钮和物体名称。

### 9.1 5–8 分钟最短学习路径（首轮不许提前告诉答案）

| 时间 | 操作 | 玩家应该亲眼看到 | 失败含义 |
|---|---|---|---|
| 0:00–0:45 | 进入 `/`，独立 profile，找到庭院中至少两项工作，按 Inspect | 环境问题和风险位置有区分，任务标识可点 | 首次发现失败、命中遮挡 |
| 0:45–1:25 | 不选装备进入 Hazard，点石块识别并移走 | 无工具任务顺利进入，风险在该处清掉 | **P0-01** |
| 1:25–2:15 | 进入 Side hedge，自己选手剪或电剪，持续拖动经过多处 | 绿篱至少 3 处改变、地面新增枝屑 | **P0-02** / raycast / hedge guard |
| 2:15–3:05 | 点击东侧枝屑，耙→装袋或吹→耙→装袋 | 镜头在东侧、地面物体真正变化、能结束 | focus remount / 被遮挡 / 工具状态 |
| 3:05–3:50 | Lawn 用两种机具至少各走一段（或先一台再切另一台） | 不同宽度割痕、能量与反馈，回 overview 不消失 | 轨迹/采样不稳定 |
| 3:50–4:30 | Path edge 做一段，比较 Lawn % 和 Edge % | 两个完成度相互独立 | edge 仍假装 lawn |
| 4:30–5:25 | Flowerbed 截顶一次再拔根一次，尽量不伤花 | 地上部分 vs 根的差别，拔根后草屑可清理 | 模型遮挡、旧迁移目标不可达 |
| 5:25–6:20 | Finish visit；审阅质量与 event 解释 | 真实质量带、可追溯意见；封存后只读 | 虚假成功/状态泄漏 |
| 6:20–8:00 | Try again，改一处工具或清理顺序，Finish | 同样庭院重新开始，封存记录没丢；不能乱比较质量不同局 | A/B 误判、历史覆盖 |

### 9.2 额外 8–12 分钟完整工作对照

- 路线 A：清除风险→先修篱→割草/修边/花坛→最后清理；尽量降低损伤，封存 A。
- 路线 B：同院起点→先清东篱附近落叶→修同处→再次清理→其余质量尽量与 A 接近，封存 B。
- 只有两次安全/质量/覆盖等级可比时，才能说 B 可能多花了多少**游戏模拟投入**；若不 comparable，要解释需先补齐何处。不能通过少做任务“节省时间”。

### 9.3 四道非诱导理解题（人类独立作答；每题 0/1/2）

1. 在草坪靠近花坛的情况下，你为什么选这台割草机？什么情况下会换另一台？
2. 刚刚使用线割机处理杂草后，你凭什么判断任务是否真正完成？
3. 今天有没有发生同一地方重复清理？是什么施工行为造成的？
4. 如果在**同样的庭院**再做一次，你会先检查什么、如何改变工具或顺序？为什么？

**打分法**：0=没提出有效因果；1=知道一个工具/顺序差异但理由模糊；2=能用自己在游戏中真实观察到的操作/后果作解释。四题合计 0–8。**任何机器都不能代填分数**；未经用户试玩必须保持 `HUMAN_NOT_TESTED`。失败原因要追到“玩家没发现”“操作没成功”“结果不可见”“Review 说不清”，而不是立刻写更多提示文字。

### 9.4 试玩失败报告格式

```
Branch + exact SHA:
Browser + viewport + OS:
Fresh / migrated / retry profile:
从哪个界面开始（入口）:
实际鼠标操作（点击对象 / drag 起点终点 / 工具）:
期望看到的变化:
实际发生的变化:
有没有画面卡顿/镜头跳动/Console 报错:
截图 / 录屏 / 事件前后值（若有）:
影响等级 P0/P1/P2 + 复现次数:
```

---

## 10. 交付物清单：每样有用途，绝不为了堆文件增加文件

### 10.1 允许/要求的本轮产出

| 路径 | 要求 | 谁使用 |
|---|---|---|
| `docs/YARDSHIFT_V06_FULL_PROJECT_CLOSURE_MASTER.md` | 本文件入库，注明基线、权威关系、不覆盖旧规范 | Cursor/审查 |
| `docs/V06_CLOSURE_AUDIT.md` | P0/P1 表（每项 `CODE_CONFIRMED / REPRODUCED / FIXED / BROWSER_PASS / NOT_REPRODUCED`）、引用 commit + 测试 +真实操作证据 | 审查者 |
| `docs/V06_OWNER_PLAYTEST.md` | 修正启动目录和终端命令；真实可操作 F00–F09 + A/B 试玩 | 产品负责人 |
| `docs/V06_CLOSURE_OWNER_CHECKLIST.md` | 一页版开箱步骤、六区操作、核心预期结果、问题模板 | 产品负责人 |
| `docs/V06_EXECUTION_LOG.md` | 最终 SHA、机器测试/浏览器/性能/人工区分、风险与未解决问题 | 全员 |
| `docs/ASSET_MANIFEST.md` | 素材身份、来源、许可、体积、是否实际用到；可选新 rock 只有真的引入才入库 | 开发者 |
| `docs/TOOL_KNOWLEDGE_SOURCES.md` | 所有实际 sourceIds 一致、可审计 | 教学设计 |
| `tests/e2e/...` 或既有测试组织 | 关键 UI 浏览器端到端回归，尽量最少额外依赖 | CI/开发者 |
| `docs/v06-evidence/09-*.png` 等 | 只保留代表性关键链路；所有证据必须真实运行 | 审查/负责人 |

### 10.2 状态报告的强制表格

Cursor 最终必须输出：

| Gate | 状态 | 证据 |
|---|---|---|
| GATE-A 源码/旧存档 | PASS / FAIL / PARTIAL | 测试文件、相关 SHA |
| GATE-B 六区浏览器入口+操作 | PASS / FAIL / PARTIAL | 具体浏览器 scenario 与观察结果 |
| GATE-C Owner 启动/试玩包 | READY / NOT_READY | 完整路径、启动步骤、试玩表 |
| GATE-D 复盘可信度 | PASS / FAIL / PARTIAL | A/B 质量阈值、事件 ID、封存断言 |
| GATE-E 工程/提交 | PASS / FAIL / PARTIAL | typecheck/lint/test/build/远程 HEAD |
| GATE-F 双语完整学习体验 | PASS / FAIL / PARTIAL | L01–L27；英中同路浏览器操作、无状态差异、语言偏好独立 |
| HUMAN_LEARNING | **HUMAN_NOT_TESTED** / HUMAN_REVIEWED | 只由真实玩家结果更新 |
| FPS | MEASURED / NOT_MEASURED | 机器、尺寸、统计窗口、数值 |

状态不能只填 `DONE`，必须写 `PASS` 的具体观察证据；`NOT_REPRODUCED` 不能偷偷当 `FIXED`。无法完成的独立环节以 `PARTIAL` 和剩余复现步骤给出，不无限等待、不虚报。所有 P2/P3 后续件**最多**保留简洁清单，不对主线停止交付。

### 10.3 本轮硬性停止条件

**必须停止并解释**：正在编辑用户真实存档或 main；发现用户必须支付/授权才能继续，或不明许可；回退到不能恢复的状态；更改上层核心玩法而未获认可；无法在隔离环境中重复运行核心游戏。

**不得停止并索要新任务**：局部 UI 颜色未选、音效没有、石头模型不够逼真、草丛可以再加层 Shader、已有测试可再增加十条、某张截图镜头可以再精细一点。把这些作为 `P2`，保证完整游戏可测试后再决定。

**完成标准**：从 `f976eed` 的真实功能基线，交付一次可启动、全院交互可达、可完成并能重试比较、已正确保存、可由 Owner 独立测试的稳定版；**不是**永久开放的细节打磨计划。

---

## 11. 可以直接交给 Cursor 的执行口令（附此文件即可；包含 §12 双语要求，不拆成微任务）

> 读取 `YARDSHIFT_V06_FULL_PROJECT_CLOSURE_MASTER.md` 作为本轮唯一收尾实施总合同。最高产品意图仍由 `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` 决定，绝不改动 L0–L6 上层目标。
>
> 从远程 `feature/v06-playable-learning-qa` @ `f976eed` 及本地最新正确兼容工作继续。先 `git status`、保护任何未提交变更，在一个新的 closure feature 分支上连续完成 S0–S7，**不用每修一个问题就停下问**。
>
> 优先修复已查实的 Hazard 无工具无法进入，以及动态 focus 导致 Canvas remount 的严重风险；接着统一处理多个 TaskStage 的真实鼠标命中、连续工具输入、设备恢复、旧存档可达、封存只读与可信 A/B。**必须检查整条玩家旅程**，不能只修两个小 bug 就交付。
>
> 所有开发围绕“让玩家学会观察现场、选择合适园艺工具、理解操作结果与施工顺序”这一目标。优先复用仓库现有 CC0 GLB；不进行不必要重构、资产采购或无限视觉打磨。
>
> 保持原有测试通过，补 C01–C71 的缺失实质断言，并用真实浏览器操作从头到尾跑完至少两条完整 scenario + 一条失败恢复 scenario。修正 Owner 启动包、README、素材与知识来源；必须测一次 FPS，不能用截图数量代替操作验收。无法直接检测人类学习效果时明确 `HUMAN_NOT_TESTED`。
>
> 交付 `docs/V06_CLOSURE_AUDIT.md`、修订 `docs/V06_OWNER_PLAYTEST.md`、一页 `docs/V06_CLOSURE_OWNER_CHECKLIST.md`、实际浏览器证据、工程测试结果和 SHA。只提交并 push feature 分支；**不要 merge main，不要部署，不要删除或清除用户正常存档**。
>
> 最终整体汇报 GATE-A–E 的真实状态、测试数据、复现路径、剩余 P2/P3，避免把 `NOT_TESTED` 写成 PASS。


---

## 12. 同轮必须完成：多语言学习体验（i18n/l10n，GATE-F）

> **用户补充需求，2026-11-22：YardShift 要支持多语言。** 此章节不是 V07、新增另一套产品，也不是修复完成后的无限增项，而是本轮**同一个 Closure Pass 的横向交付能力**。必须覆盖完整 F00–F09，不能只翻译首页/按钮。**实施顺序：先修主线 P0 与稳定交互；紧接着接入 i18n；再用两种语言分别完成同一套浏览器验收；最后连同 S6/S7 统一交付。** 原有 C01–C71、GATE-A–E 继续有效；新增 GATE-F / L01–L27，不能为了语言把旧系统推倒重做。

### 12.1 功能范围、成本与边界

**首批必须完整可用的语言**：`en-US`（English，现有基准文案）和 `zh-CN`（简体中文，面向中国大陆普通玩家）。两者是同级正式支持语言，均不得出现主流程“半中文半英文”。**之后可以增加** `zh-TW`、`es-ES`、`ja-JP`，但本轮不准通过空翻译文件/机器生成未审校内容宣称这些语言已支持。语言采用明确的 BCP 47 locale code，绝不用国旗代替语言。

**为何现在做**：这是一款教人认识园艺工具的游戏。中文用户必须能读懂工具用途、危险前提、截顶与拔根、返工与质量建议；这些是 L0–L1 核心学习材料，而非附带 UI 文案。因此 i18n 是本轮 GATE-F，不是 P3 装饰。

**技术成本目标**：零额外外部服务、无机器翻译 API、默认无新增运行时依赖。项目当前 Next.js 15 / React 19 / Zustand persist / R3F，首发主体是客户端单庭院 `/`，优先实现轻量 Typed Dictionary + LocaleProvider，避免为了两种语言重写 App Router、工具规则或数据库。若 Cursor 经源码审查证实某一现成方案更简洁，可使用，但需记录依赖/构建影响并保持既有路由不变。

**产品限制**：语言不是游戏难度、工具资质或地区版本；不改变庭院、任务发现性、数值、结果、存档、VisitSummary、A/B、公平性或本来需要玩家自行作出的判断。绝不因翻译而把所有工具选择题变成提前泄题的“正确答案”。

### 12.2 当前源码审查：具体哪些地方没有国际化（CODE_CONFIRMED）

| 路径 / 位置 | 当前源码问题 | 具体修改边界 |
|---|---|---|
| `src/app/layout.tsx` | `<html lang="en">` 硬编码；英文 metadata 描述；两款 latin-only 字体 | 对当前客户端 locale 更新 `document.documentElement.lang`；无 hydration mismatch；设置中英可读字体 fallback；不为本轮增加动态路由而大改 SSR；SEO/metadata 多语言未做时如实标记 |
| `src/components/layout/AppHeader.tsx` / `AppShell.tsx` | `Task Board`、`Yard` 等全局导航仍是英文 | 可见且会进入的导航均纳入词典，不能把 `/yard` 仍保留为未说明的英文入口；历史 `/legacy` 清楚标注“旧版（仅英语）”或同轮翻译其可见壳层 |
| `src/data/gardenTasks.ts` | F01–F09 task name/prompt/designPurpose/strengthsLimits 为英文 | 保持 ID/位置/工具列表数值不变；将展示字段改为 `nameKey`/`promptKey` 等（或使用展示 selector），禁止翻译对象 ID |
| `src/data/equipmentProfiles.ts` / `src/game/learning/toolKnowledge.ts` | 英文工具名、purpose/bestFor/limitation/preflight/effectToWatch、注释边界 | 工具 ID、数值曲线、`sourceIds` 保留；教学描述只在视图或 `getLocalizedToolKnowledge(locale,id)` 翻译，防止双份有冲突的数值配置 |
| `src/features/garden/GardenShell.tsx` / `GardenHotspots.tsx` | 按钮、场景事实、底部工具条、inspect/last event、状态条、场景气泡英文 | 全翻译；语言选择器固定在明显且不会挡画布的位置，切换中不 reset/离开任务/释放当前已完成内容 |
| `WorkConfirm.tsx` / `WorkPlanPanel.tsx` / `HazardTaskStage.tsx` | 对话框、工作步骤、空工具 hazard 文案、提示英文 | 中英文在不同窗口/尺寸完整可见，保留“未选工具不能开始 / 无工具检查能开始”的原规则 |
| `LawnTaskStage` / `HedgeTaskStage` / `DebrisTaskStage` / `EdgeTaskStage` / `FlowerbedTaskStage` + UI toast | 交互解释/失败提示主要来自 store `lastEvents.explanation` 英文 | 统一 event feedback `code + params` → 视图翻译；旧存档英文 explanation 可以兼容 fallback，不要求一次性改写全部历史字符串 |
| `src/game/store/gameStore.ts`、`src/game/garden/reducer.ts` | 状态反馈和部分事件说明以英语拼接；`visit-finish` 有英文 summaryNote | 业务逻辑只发**稳定语义 code/params**，不依赖当前 locale；封存数据继续存数字/ID/码，不能写死翻译后的语句 |
| `src/game/garden/reviewSelectors.ts` / `src/game/learning/learningAdvice.ts` | `qualityNotes`/`completionNotes`/`reworkNotes`/`learningAdvice.text` 直接返回英语 | 选择器改为结构化 `code, params, eventId, areaId`；在 Review UI 翻译。对测试必要时提供兼容适配，不要丢 event 追溯 |
| `src/game/learning/visitSummary.ts` / `WorkReviewPanel.tsx` | A/B `reason`/`notes` 与质量等级说明都是英语 | `VisitSummary` 继续保存语言无关事实；compare 返回 message codes/params、视图按当下 locale 渲染；切换语言后同一封存 Visit 不产生新封存 |
| `docs/V06_OWNER_PLAYTEST.md` / `README.md` | 当前操作说明英文、旧指令可能过时 | Owner 同时具备英文/中文试玩说明或双语对照操作表；用同一个动作序列检验两语版本 |

当前 `package.json` 没有 i18n 依赖；这**不是**现有功能已具备的证据。不要把已翻译的零散字串认作完整多语言支持。

### 12.3 数据契约：翻译不能进世界权威状态

**建议实现**（命名可根据项目惯例微调，但边界必须一致）：

```text
src/i18n/
  locales.ts                 # SUPPORTED_LOCALES = ['en-US','zh-CN']; validation + browser negotiation
  dictionaries/en-US.ts      # 英文全量基准
  dictionaries/zh-CN.ts      # 简中全量对应键
  index.ts                   # typed t(locale, key, params) + fallback
  LocaleProvider.tsx        # locale context + preference persistence + document.lang
  messages.ts                # game event code/params 到 UI copy 的映射/适配
  glossary.ts                # 可选：工具名术语验证；不要重复维护工具数值
```

- `Locale = 'en-US' | 'zh-CN'`。新 locale 必须完成翻译+QA后才能注册为 supported；不允许菜单显示尚未完成语言。
- **存储**：用户明确选择保存在独立的轻量设置键，例如 `yardshift-ui-locale`，**绝不修改/覆写/清空** `yardshift-v03`。优先级：显式用户选择 > 浏览器 `navigator.languages`（`zh-*` 映射当前受支持的 `zh-CN`；`en-*` 映射 `en-US`）> `en-US`；无效值安全 fallback；隔离 profile 各自独立。
- `LocaleProvider` 在客户端处理 hydration：首屏不能出现 mismatch 或不可交互状态；若服务端无持久偏好，则 SSR/initial UI 使用稳定默认语，再由客户端加载偏好；切换语言只触发文案更新，不重挂 `Canvas`、不重新执行 fixture、无需路由导航。`html.lang`、按钮 `aria-label` 与页面标题动态更新；测试有具体断言。
- **纯业务层**：Game IDs（例如 `hand-edger`, `hedge-cluster-1`）、GardenEvent `type/id`、工具 profile 的性能参数、WorldFootprint、质量阈值、`VisitSummary` 数字/比较结果、fixtureVersion、sourceIds 均**与语言无关**。禁止在语言切换时 `startV03Garden()`、`finishVisit()`、`applyGardenEvent()` 或重新播一次动作。
- **消息模型**：`UiMessage = { code: StableMessageCode; params?: Record<string,string|number>; eventId?: string }`。对 event / Review / A/B 先产此结构再 `t(locale,code,params)`。必要时支持原 `explanation` 或 `summaryNote` 的旧版 fallback；但不以当前中文/英文原文做业务判定或存档键。
- **插值**：本轮数量/百分比/模拟投入单位通过 `Intl.NumberFormat(locale, ...)`，中英文各自使用通顺短句，不能直接用字符串拼接造出不自然语序；复数如需分别处理，可集中定义 locale-aware formatter。
- **字体**：现有 `Fraunces`/`Source Sans 3` 使用 latin subsets，简体中文允许合理的系统 CJK fallback stack；不要打包大体积未获授权字体，也不要给用户分发字体文件。保证按钮与 modal 中汉字不变成方框。
- **离线**：所有中英文在本地代码构建内，无外网时切换仍可正常操作。

### 12.4 译文范围：不是替换按钮，而是让两种语言教会同一件事

| 学习段落 | EN-US 必须完整 | ZH-CN 必须完整 | 不得破坏的核心行为 |
|---|---|---|---|
| F00 首次进入 | 标题、区域标签、Inspect/Plan、提示/工具语 | 同内容中文 | 两语都有六区可发现入口；不自动揭示“正确顺序” |
| F01 观察安全 | 风险位置、检查与清除反馈、无装备操作 | 明确“障碍物、检查、移除” | 无工具 hazard 仍可进入；两击 inspect/remove 不改变 |
| F02 计划 | 可选工作计划、移动任务、保存状态 | “计划并非强制唯一顺序” | 计划顺序不成为计分惩罚 |
| F03 工具判断 | 名称、用途、适合场景、局限、前置检查 | 术语准确、自然、不暗示只有一种正确选择 | 手工具和电动工具身份/能力完全一致 |
| F04 割草 | Reel vs powered、前进路径、电量、安全 | 区分滚刀式手推/动力割草机 | 轨迹、资源、草坪覆盖不因语言改变 |
| F05 绿篱 | shears/trimmer、过剪、障碍、剪枝碎屑 | 区分手动绿篱剪/动力绿篱修剪机 | 绿篱落屑及局部阻挡闭环保持 |
| F06 修边 | lawn 与 edge 独立、边缘范围 | 修边器 vs 打草机、区别于割草 | 修边不能偷加草坪覆盖 |
| F07 花坛 | top-cut / root pull / flower damage | **截除地上部分 ≠ 连根清除**、保护花卉 | 花坛真实状态不被汉字 UI 影响 |
| F08 清理 | rake/blow/bag、二次清理、rework | 耙/吹/收集、返工与潜在返工严格区分 | 原地点、原事件、同类 action |
| F09 Review/A-B | 工具记录、qualityBand、因果 advice、同庭院对照 | 完整对应、诚实解释模拟投入 | 不会因语言切换新增 event / visit / effort |
| 系统级 | Reset、Try again、Save、Recharge、Jam、fail/no-op、Legacy | 相应中文和一致的危险操作确认 | 独立 profile、旧存档、封存只读 |

**中文术语小词表（建议统一，交给 Cursor 再按实际模型审校）**：

| Tool ID / 概念 | 推荐中文 | 注意 |
|---|---|---|
| `manual-reel-mower` | 滚刀式手推割草机 | 不要简单翻成“手推机”导致与动力手推混淆 |
| `lawn-mower` | 动力割草机 | 按当前已实现的电池驱动能力解释；不假装有某真实厂牌 |
| `hand-hedge-shears` | 手动绿篱剪 | 与动力绿篱剪明确区别 |
| `hedge-trimmer` | 电动绿篱修剪机 | 记得硬木阻挡、过剪风险 |
| `hand-edger` | 手动修边铲 | 半月形刀头；不与线割机共用称呼 |
| `string-trimmer` | 尼龙绳打草机 | 裁掉地上部分不等于拔出根 |
| `hand-weeder` | 手动除草器 | 强调除根；不能误称剪刀 |
| `rake` / `leaf-blower` / `bag` | 耙子 / 吹叶机 / 收集袋 | 收集与打包是不同动作 |
| `work effort` | 游戏模拟工作量 | 不冒充现实分钟或真实劳动成本 |
| `potential redirty` / `spent rework` | 再次弄脏的风险 / 实际返工 | 后者必须真的有第二次清理动作 |
| `acceptable` / `incomplete` / `needs-attention` | 达到本次标准 / 尚未完成 / 需要处理问题 | 不能把“达标”翻译成“专家认证” |

允许使用便于玩家理解的中文表达，但**知识必须准确**：本游戏模拟范围有限，不能把“本次任务完成”说成“现实一定这样施工”，不能出现盲目操作电动设备、忽略障碍物等误导性建议。保留来源链接和 `SIMULATED_MODEL / NOT_SIMULATED` 的事实界限。

### 12.5 同轮实施顺序：插入 S4.5，不延长到下一阶段

**S0**：检查本地 Git、保护存档和工作区，登记当前 UI 所有文案来源；原 S0 不变。

**S1–S3**：优先修 P0 主线、Pointer/Canvas、Store/旧迁移、封存安全；在处理 store 时顺手把动态可见反馈改成 `code + params`，不要为语言动世界规则。

**S4**：完成画面/任务目标可读性；将 `WorkConfirm`、`GardenShell`、`GardenHotspots`、工具知识和其他 F00–F09 文案汇总入 dictionary。

**S4.5 — i18n integrated pass（本轮新增，必须执行）**：
1. 写 `LocaleProvider` 与 typed dictionaries，语言按钮在庭院的统一布局可见，切换即时生效，记住显式选择；`html.lang`、a11y label 正确。
2. 统一翻译 `GardenTaskDef`、装备名称/术语、工具知识、WorkConfirm、计划、复盘、所有失败/恢复和封存提示；源头动态字段以语义 code + 参数呈现，不靠 English 原文字符串替换。
3. 旧 VisitHistory 不需要更改内容，即可在中文和英文重新渲染可读报告；原 VisitSummary `fixtureVersion`、质量、模拟工作量和事件追溯与切换前完全一致。
4. 检查中文 UI 溢出、字体缺字、modal/底栏空间、标签遮挡；允许自然折行、滚动和短标签；不能为了容纳中文而把热点缩成无法点击。
5. 实现两个 locale 的 key parity、缺少插值参数、非法 locale、安全切换、旧存档保持、两语端到端一致性测试。

**S5**：浏览器不只做一条英语 smoke；同一个隔离 profile 的同一局中间切 `English → 简体中文 → English`，UI 更新、工作继续、草坪/碎屑/Review/封存/历史完全保留；再用独立中文 profile 完成至少一条全路线（含 Hazard 和 A/B）。

**S6**：在 Owner Pack 中写入语言切换说明及中英文 5–8 分钟试玩；提供同一套 4 道理解题的双语版本，回答原义相同；评分仍由真人进行。

**S7**：统一 typecheck/lint/test/build、英文/中文真实浏览器证据、fps 与 Feature push；报告 **GATE-F**，未全部通过不得报 COMPLETE。

### 12.6 新增 GATE-F 与客观验收 L01–L27

**GATE-F（多语言完整性）**：`en-US` 和 `zh-CN` 的全 F00–F09 工作流程均有完整人类可读文案；同一局实时切换无游戏逻辑差异；明确语言偏好持久化且不触碰游戏存档；动态提示/Review/Visit A/B 均能本地化；真实浏览器通过。**不能用字符串数量或一张中文首页截图代替。**

| ID | 检测方式 | 必须通过的客观断言 / 操作观察 |
|---|---|---|
| L01 | 单测 | `en-US` / `zh-CN` 都有且仅列为 supported，非法 locale 回退英文 |
| L02 | 单测/类型 | 两份 dictionary 键集合相同；无未填写、空串、`TODO`、未经翻译的核心文案 |
| L03 | 单测 | 各语言所有 `code + params` 插值键齐备，翻译函数无 `[object Object]`、未替换 `{name}` |
| L04 | 浏览器 | 初次英文 profile 首页完整可读，`html[lang='en-US']` |
| L05 | 浏览器 | 首次 `navigator.language` 为中文，未设置偏好时展示简中且 `html[lang='zh-CN']` |
| L06 | 浏览器 | 显式选中文后刷新、关闭再开、换任务保持中文；与游戏 Reset/Retry 独立 |
| L07 | 浏览器 | 中英切换不改变 `yardshift-v03` 的庭院状态、事件数、工具资源、VisitHistory、任务阶段 |
| L08 | 浏览器 | 切换不触发 WebGL Canvas unmount、新的场景加载、鼠标拖拽意外清除进度 |
| L09 | 浏览器 | 六区热点/名称/入口/无工具 Hazard 流程两语都正常可进入 |
| L10 | 浏览器 | WorkConfirm 双语，工具必须手动选择，tool names 与真实模型一致 |
| L11 | 浏览器 | ToolKnowledge 的 purpose、bestFor、limitation、preflight、effectToWatch 双语完整 |
| L12 | 浏览器 | 英语割草到一定完成度 → 切中文继续割草；覆盖百分比和资源与纯英文路线一致 |
| L13 | 浏览器 | 中英剪绿篱→产生同地 clippings→清理→返工；位置、event IDs、一致性不变 |
| L14 | 浏览器 | 中文花坛能辨识“截顶/连根拔除/误伤花卉”，独立测试逆向切换 |
| L15 | 浏览器 | 中文 Lawn % 和 Edge % 独立且数字正确；不因为翻译共享状态 |
| L16 | 浏览器 | 中文 Recharge / Clear jam / tool unavailable / mistake feedback 完整可读 |
| L17 | 单测/浏览器 | `LearningAdvice` 按 `code + params` 翻译，eventId 仍指向同一事件 |
| L18 | 单测/浏览器 | Review 所有 quality、completion、rework、simulated effort 英中对应，切换无重新计分 |
| L19 | 单测/浏览器 | 已封存 Visit A/B 切语言重看，封存条数、数值、qualityBand、comparable 结果不变 |
| L20 | 浏览器 | 中文 Finish/Reset/Try again 的确认信息准确，不自动覆盖既有浏览器存档 |
| L21 | 浏览器 | 1280×720 和 390×844 主界面、modal、工具底栏、Review 不裁中文、按钮可点 |
| L22 | 浏览器 | 中文字体正常显示，无口口字、错乱换行、按钮/热点难以点击 |
| L23 | 检查脚本 | 玩家可见的旧英文硬编码字符串盘点为 0（历史/debug/非当前路线要列白名单） |
| L24 | 测试 | 英文/中文语言切换不修改 fixtureVersion、工具性能配置、world coordinate、event.type/id |
| L25 | 浏览器 | 英中两套 Owner 脚本均可完成一次 Visit，再重试 A/B，Console 没有 fatal/hydration error |
| L26 | 文档 | `README.md`、Owner Playtest 都描述真实语言选项、切换位置、保存行为和已知限制 |
| L27 | 交付 | GATE-F 写明 `PASS/FAIL/PARTIAL`，列单测、浏览器截图、日志、SHA；人类教学效果仍 `HUMAN_NOT_TESTED` |

### 12.7 必须保留的可撤回性与停止条件

- 一旦 i18n 修改需要重写 `garden.events`、改变 `VisitSummary` 结构/评分数值、清理用户 `localStorage`、强制 App Router 加语言路径导致用户进入游戏失败，必须选择更轻量方案；**不能为语言架构牺牲主线可靠性**。
- 如旧存档已有带英语的 `lastEvents.explanation`，可以显示可理解的 legacy fallback，不得为了翻译删除旧存档；**新产生**的反馈必须走 locale-aware code。
- 缺乏合格译文时不得假冒全面支持。正式语言只有 `en-US`、`zh-CN` 两种；其他仍留明确 backlog。
- 不允许用 locale 改变玩法、计分或安全警示，跨语言的教学逻辑必须等价。
- 语言是这次收尾**必须实现的横向功能**，并不授权重开无限视觉优化、多语言配音、更多国家版本、付费第三方翻译或云端账户同步。

### 12.8 Cursor 最终执行口令的多语言补充（与第 11 节共同生效）

> 本轮 Closure Pass 同时把 `en-US` / `zh-CN` 完整国际化作为 **GATE-F 必达条件**。先修复 P0 浏览器主线、状态与交互，再在 S4.5 完成从界面、工具教学、动态反馈到 A/B 复盘的双语本地化，并由 S5/S6/S7 在两种语言中完成真实浏览器和 Owner 可试玩验收。语言设置持久化在独立 key，绝不改动/清空 `yardshift-v03`；语言切换不改任何游戏行为。最后与 GATE-A–E 一并报告 GATE-F 和 L01–L27 的证据，只 push feature，不合 main、不部署、不清存档。不得以“界面有中文按钮”代替完整多语言支持。

---

## 13. 本轮重大产品架构纠偏（最高执行优先级）：全局 Tool Bar + 单一连续庭院（GATE-G）

> **触发缘由**：Owner 提出根本问题：既然工具可以跨空间工作、施工先后由玩家自主选择，为什么还必须先点击一片“任务区域”才能拿到该工具？**结论：不应该。** 现有 `activeTaskId → Stage → available tools` 是开发时的隔离策略，不是专业园艺的真实工作模型。对本轮 Closure 来说，工具栏不是附加按钮，而是让 L0–L2 北极星成立的交互架构修正。**本节为最新优先级，覆盖前文所有“必须先点区域/打开 WorkConfirm 才能工作”的旧描述；其余对物理因果、存档、安全、语言、验证的要求继续有效。** 不另建一套世界或工作规则。

### 13.1 玩家体验合同：Tool-first，Target-second，World-state authoritative

**屏幕持续保留同一庭院和全局工具栏**。玩家可以在任何时候看见并选择全部已提供的工具；选择某一工具后，直接对花园里的合适物体/地面操作；无需首先进入 `lawn/hedge/edge/flowerbed/debris/hazard` 的独立场景，亦不需要“返回总览”才能换工具。相机可以放大/聚焦某一作业区，但**镜头聚焦不承担工具权限或状态生命周期**。单一世界状态、任务进度、磨损、事件和 VisitSummary 仍使用既有 `gameStore` / `GardenDomain` / `WorkSnapshot`。

- **操作基本序列**：Inspect（观察、识别安全隐患） → 在全局 Tool Bar 选工具 → pointer 向世界目标移动/拖动/点击 → 工具领域 guard 判定 → 对应现有 store command 修改权威世界 → 视觉和记录即时反馈 → 随时换工具、换作业区域或打开 Plan/Review。
- **不隐藏“错误选择”**：工具栏对玩家展示全部已拥有、可用及不可用工具的真实状态；不根据当前镜头把工具静默藏掉。不合适的工具可以选中，但对错误目标只能无效+解释，不能假装完成任务。未拥有的工具如果存在，应显示锁定/取得方式，不伪装成已装备；只有已实现的工具可用，不能空卡占位。
- **一项工具可以跨任务用**：`string-trimmer` 可用于路缘作业或花坛截顶，结果由**实际目标类型**确定，不能由“玩家刚点过哪个任务标签”决定。`rake` 则可在绿篱下方清理新枝屑或西南落叶，绝不需换“清理场景”。`bag` 只能移除附近已聚拢物；错误位置点击给可理解的提示。
- **安全与约束仍真实**：手动/动力工具不同耗损/资源，危险物局部阻断，松开指针停止作业，损伤不可随便复原；不应因 UI 自由化而绕开 `ToolUseGuard`。没有选工具时应允许 `Inspect/Hands` 模式查看/移除适当的危险物；明确提示工具需先关闭等安全前提，但不把真正安全操作表述为游戏之外的操作指南。
- **系统不替玩家安排固定顺序**：Plan 仅供自愿标记；Review/教学建议来自行动、位置和结果。工具栏不应在某一任务结束后自动切换到“最优工具”，也不能以“专业推荐”消除学习选择；允许“上次使用”手动恢复，不自动锁定。
- **不破坏 sealed 模式**：Finish 后工具栏变成只读或不可施工作用，仍可选择查看工具知识、浏览已封存庭院和 Review；不能再触发域命令。Try again 在相同 fixture 重启后恢复工具操作和保留历史。

### 13.2 交互和信息架构：复用现有 DOM / Drei，不自研 UI 引擎

布局建议：顶部紧凑状态栏（园名、观察、计划、复盘、语言）；中间一个**稳定挂载**的 R3F Canvas；底部固定且不遮挡目标的 Tool Bar；点击/长按工具打开内嵌的用途、局限、能源/故障说明。全局栏按现有器具分类，桌面可展开/收起，窄屏水平滚动或折叠，始终有清晰当前工具、Hands/Inspect 和无效原因。按钮必须可见、可读、可点、键盘可聚焦。

核心 UI 可使用现有 **React + Tailwind + `<button>`** 实现，无需引入工具栏组件库。R3F/Drei 使用现成 `Canvas`、`OrbitControls`、`useThree`、`useGLTF`、`Html` 或标准 DOM Overlay；3D 标签只作为**物体位置标示**，不要把六个密集投影标签当作唯一路由按钮。场景探查/工作对象可以由射线代理触发；当多个物体接近时，点击层只保留一个负责对应工具的 target。禁止 overlay 和交互代理同时处理同一次业务事件。

**建议结构（命名为建议，不强制一次性全量移动文件）**：

- `src/features/garden/GlobalToolBar.tsx`：一个工具入口。数据源只用 `EQUIPMENT_PROFILES`、当前 store tool state、`getToolKnowledge` 和 locale dictionary；不自创一份工具能力规则。`selectedToolId` 已是 store 字段，继续复用；默认 Hands/Inspect，不默认替玩家选施工工具。按钮通过 `selectTool` 选择；禁用状态要用状态文案解释。
- `src/features/garden/GardenCanvas.tsx`：**唯一 Canvas 实例稳定挂载**，`focusPoint` 及当前工具不得出现在 React `key` 中。`GardenOverviewScene.tsx` 保持共享 base + presentation；用现有 controls ref / R3F hook 实现可选择区域的 camera focus，**不重新建 Canvas / WebGL context**。
- `src/features/garden/GardenInteractionLayer.tsx`（可选名称）：根据**当前选中工具、实际命中对象、object ID 和工具状态**决定启用何种代理，不通过 `activeTaskId` gate。可以先调用原 TaskStage 内部逻辑进行最小迁移，但最终不要保留六套互斥渲染分支；尽量把 `LawnTaskStage`、`HedgeTaskStage`、`EdgeTaskStage`、`FlowerbedTaskStage`、`DebrisTaskStage`、`HazardTaskStage` 的现有 pointer/geometry 部件变成可复用的 target layer。Store domain 方法保留，避免重造 reducer。
- `src/game/interaction/toolTargetCapabilities.ts`（可选纯函数）：依据 `toolId + hit.kind + hit.id + spatial precondition` 返回 `allow / reject / reasonCode / intendedAction`；实际是否成功仍交给 Store `ToolUseGuard`，因此不是新的平行权威。`lawn-mower/reel → lawn work area`；`shears/hedge trimmer → hedge`；`hand-edger/string-trimmer → edge`；`string-trimmer → weed top`；`hand-weeder → weed/flower`（花误伤）; `rake/blower/bag → debris`；`Hands/Inspect → hazard`。在真实 UI 上给出准确命中对象类型。
- `GardenWorldOverlays.tsx` 分成 purely visual 和 eligible hit proxies：世界植物、碎屑、风险仍持续可见；根据当前 tool 仅让一个对应 proxy 接管 pointer。不要在屏幕上强制渲染高透明 `16×14` 的清理平面以遮挡花/绿篱/危险物的交互，尤其不要让它抢走全局 raycast。对于大面积割草等连续地面工具，按工具显示接地的工作 plane / 低优先级 raycast，其他目标的优先级要可预测。
- `GardenHotspots` 退化为**可选相机导览标记**，与工具权限脱钩；标记数量及文字响应式，拥挤时隐藏次级 label 或移至左/右的 DOM area list。标签不再要求先点才能拿到工具；适用于中英文长词和触摸屏。
- `WorkConfirm` 不再是每次开工具的强制关卡：其知识展示保留为选工具后的可展开 Info/Compare Panel 或短首次说明；**不能拦住直接从工具栏进行工作的路径**。要保留人工工具选择的教学价值，而不是被动默认推荐。

### 13.3 必须避免的迁移陷阱

1. **只加 toolbar、不重接世界事件**属于失败：按钮显示选中，但底层 six TaskStage 仍受 `activeTaskId` 限制，玩家对世界点击依然无效。
2. **只合并所有 TaskStage 组件、但保留全屏透明平面重叠**属于失败：所有工具虽然可见，raycast 会相互遮挡或重复派发。要做工具/对象类型过滤与 pointer 所有权。
3. **每次 selectTool 都 remount Canvas**属于失败：会闪屏、丢指针捕获和 GLB 加载状态。仅切换工具作用域代理，不改 Canvas identity；model 的 Suspense fallback 可局部使用。
4. **相机运动当作状态切换**属于失败：世界某处施工的进度不得依赖镜头是否对准。允许玩家自己移动 OrbitControls，选对象时可给“聚焦”按钮，但工具持续作用不强制相机跳转。
5. **工具列表与可用规则重复定义**属于失败：以现有 `equipmentProfiles` / store 为唯一事实源，UI `getToolKnowledge` 只写解释。某个工具没有模型时保留它的真实业务行为并明确降级显示，但不能把错误模型当正确工具。
6. **取消任务切换即取消学习结构**属于失败：Plan、Inspect、现场提示和复盘仍在，只是工具与施工不被人工分区阻挡。学习仍来自玩家选择和物理后果，而非 UI 预置标准答案。
7. **双语只翻工具名**属于失败：栏位名称、工具能力限制、无效目标、风险警告、报错、Review event 和 Try again 都应走原 §12 的 `en-US`/`zh-CN` 结构。

### 13.4 与已核实缺陷和收尾路线的协调

**此前 P0-01（无工具 Hazard 进入失败）不应再以“修一个空工具 WorkConfirm 才能进入 HazardStage”作为最终方案**；正确修复是 Hands/Inspect 全局模式可直接对 hazard 观察与清除，且不会被 `onConfirm(null)` 卡住。保留旧入口若为兼容，也不应成为唯一入口。

**此前 P0-02（focus 改 Canvas key）完全保留并升级为 Tool Bar 的硬门槛**；同一 Canvas、无重复 scene/model clone、大面积操作连续手势不能掉线。

**此前 P0-03（交互层竞争）现在升级为架构级问题**：不能只“活跃 TaskStage 排除重复视觉模型”，需要在全局工具作用下永远维持**一处目标一条派发路径**；所有对象可见但可操作性由 active tool 和 spatial guard 决定。

把新增阶段放进原 `S1` 之后、`S2` 之前，称为 **S1.5 — Global Tool Bar / World Interaction Integration**；若会干扰 S1 的改造，可合并 S1+S1.5 提交，但**不得先做 S2–S7 再临时贴一个工具条**。S4 的视觉/相机修复应基于这个最终模型；S4.5 多语言、S5 浏览器回归及 S6 Owner Pack 必须围绕新工具栏实测，不再把“先点 hotspot → Start”当作主入口。优先保护已正确的 reducer、mow path、spatial rework、VisitSummary、quality gating、save migration。

### 13.5 全局工具栏的可验收约束（新增 GATE-G / TB01–TB25）

`GATE-G`：在一份连续可交互的真实庭院中，不依赖任务场景切换，玩家能自由选用全部适用器具，并基于实际命中物做正确或无效工作；主线操作不闪屏、不丢工具、不被 HTML/3D 标签阻挡；两种语言都能使用。**这是一项 P0 产品门槛，未通过不得把收尾标为完成。**

| ID | 层级 | 玩家输入/测试动作 | 必须证实 |
|---|---|---|---|
| TB01 | B | 首次打开庭院，不点击任何工作区 | 立即看见 Tool Bar、Hands/Inspect、可用工具入口 |
| TB02 | B | 不点任何 TaskStage/hotspot，选 mower 在 lawn 拖动 | 草坪变化、正确 effort/resource、Canvas 无重挂 |
| TB03 | B | 仍不点 TaskStage，选 shears 在 east hedge 工作 | 绿篱变化、枝屑出现在原位、道具栏可立即选 rake |
| TB04 | B | 原地将 shears 切 rake 并清绿篱下枝屑 | 不返回总览、不换场景，碎屑可聚拢 |
| TB05 | B | 原地切 bag 对附近 gathered debris 操作 | 本地移除；远处不能凭空移除 |
| TB06 | B | 选 string-trimmer 先作用 edge 再作用 weed | 自动由 target type 决定不同动作，edge 和 roots 状态不混淆 |
| TB07 | B | 不点“进入花坛”，选 hand-weeder 点击 weed | 连根移除、world 更新、Review 有对应工作 |
| TB08 | B | Hands/Inspect 选择后直接点 stone/hardwood | 能观察/清除；附近 powered action 由 blocked 变 allowed |
| TB09 | B | 故意选 mower 点击 flowerbed 或 rake 点击 hedge | 无错误世界进度、提示具体工具/目标不匹配 |
| TB10 | B | 任意工作中切工具，再继续跨区域工作 | 不清空 drag refs 到异常状态、不重置相机、无闪白 |
| TB11 | B | 改 focus / 旋转相机 5 次 | Canvas DOM node/WebGL context 稳定，世界和当前工具保持 |
| TB12 | D/B | 各工具与每种 world hit kind 做组合矩阵 | 允许/拒绝与既有 ToolUseGuard 一致，不存在“工具在栏里却无法使用” |
| TB13 | B | 切到某工具，其 GLB 不存在/加载失败 | 显示真实身份的降级轮廓和可读错误，不因模型 404 失去工具功能 |
| TB14 | B | 连续看完整工具列表 | 10 类施工工具真实存在、名称/状态/用途可见；不重复或漏项 |
| TB15 | B | 切无电、卡住、损坏的器具 | 当前状态明示，操作 guard 生效，提供合法恢复路径 |
| TB16 | B | 选工具但不进行有效动作，Finish | `toolsUsed` 不计为“真正使用”，可区分 selected tool |
| TB17 | B | 任何时候切换 en-US/zh-CN | Tool Bar/说明/错误即时切换，场景与任何施工状态不变 |
| TB18 | B | 1280×720、1440×900、390×844 | Tool Bar 不遮挡主要庭院、文字不重叠、可滚动/折叠、按钮可点击 |
| TB19 | B | 6 个区域热点/标签互相靠近 | 标签不过度遮挡，不需要精准点击文字才能使用工具 |
| TB20 | D/B | 与工具无关的可视 object 被点击 | 不抢同次 pointer，不隐性触发旁边对象的工作事件 |
| TB21 | B | 施工中 pointer up/cancel/leave 后再次施工 | drag 正常结束恢复，OrbitControls 不残留锁定 |
| TB22 | B | 连续剪篱/清理/割草 30 秒 | 无 Canvas remount、无任务切换导致世界消失、无重大操作中断 |
| TB23 | B | Finish 后尝试工具栏任何已知世界写入动作 | 所有 world/event/effort/sealed summary 保持完全不变 |
| TB24 | B | Try again (same yard) 后工具栏再次使用 | 同一初始 fixture，历史保留，工具操作恢复 |
| TB25 | B/H | 真实玩家首次使用 30–60 秒 | 能自主发现工具栏并明白“先选工具，再对物体使用”；人类可理解性保留 `HUMAN_NOT_TESTED` 直到试玩 |

以上 `B` 均需实际浏览器操作或可靠 E2E 自动化，不允许以仅运行 reducer 的 Vitest 冒充；`TB12` 等 pure function 项可以用单测支持。功能 PASS 的同时必须保证适用工具的世界对象 **visible → hittable → correct state change → corresponding Review** 四段闭环；测试记录要带 SHA、浏览器版本、屏幕尺寸、真实证据类型。新 UI 不需要堆截图，重点保留一次连续不间断的屏幕录制或操作 trace，证明 **切工具不切场景**。

### 13.6 对旧 C/L 号验收矩阵的精确定义更新（避免 Cursor 执行互相冲突的指令）

- `C02–C08` 和 `C09–C10` 的旧“必须打开 WorkConfirm/进入特定 stage 才能工作”改为**从全局工具栏直接在对应位置施工**；`C06/C07` 用 Hands/Inspect 完成 hazard；WorkConfirm 可以作为可选信息对话框，但不得当路由门槛。满足 `TB01–TB09` 即可替代原旧入口测试，旧版入口兼容性可作为补充。
- `C11–C16、C54–C60` 升级为**在同一稳定 Canvas 下测试真实 pointer 与画面**，不能借任务卸载来规避重复模型；`TB10–TB22` 覆盖新跨区域用例。
- `C62–C70` 的“Scene 1/2/3”仍是**三条真实浏览器施工路线**，但 Scene 是测试情景，不代表必须进入六个互斥 TaskStage。每条路线必须证明从 tool-first world interaction 走通。
- `L09–L16、L21、L25` 的双语 UI 要验收全局 Tool Bar，且中英文热区不重叠；其它 i18n 合同不变。
- `GATE-A/B/C/F` 全部纳入 `GATE-G` 的 tool-first 主入口；最终报告要明确 `GATE-A–G`，其中 `GATE-G` 不能写 `NOT_TESTED` 后仍声称 COMPLETE。

### 13.7 本轮实际停止条件及独立试玩要求

**止步于一个真实可用且能学习的连续庭院，不止步于工具栏看起来漂亮。** 手动与动力工具能被自由选取，作用于真正合适的对象；不合适时有反馈；场景保持稳定，工具模型可见，信息不会交叉遮挡，支持英文/简体中文；两条完整路线和一条恢复路线在**同一连续花园**完成；AI 不能自评用户已经学会专业判断。

一旦出现“工具显示可选却不发生世界行为”“必须去另一个页面才能拿耙子”“语言切换重置庭院”“热区挡住工具”“为完成工具栏重写整个 reducer”“优化过头使性能下降”等，视为未通过并优先修主因。不要无限美化模型、音效、粒子或增加新的庭院关卡。

**交给 Cursor 的最新指令（本节优先于第 11/12 节旧入口路径）**：

> 用户确认最终体验应该是一个连续、始终可作业的花园 + 全局 Tool Bar，而不是六个互斥任务场景。请在本轮同一 feature branch 中按 S0、S1+S1.5、S2–S7 连续完成；复用原所有 gameStore/domain/GLB/persistence/review 规则，不为 UI 重造业务系统。先修 Canvas key、pointer ownership、Hazard hands，再实现不依赖点击 hotspot 的全局工具选择与实际世界操作，所有工具都要覆盖对应目标；WorkConfirm 退为可选教学资料。双语、性能、两次同庭院 A/B 和 Owner Playtest 均使用新的 tool-first 流程验收，TB01–TB25 与 GATE-A–G 全部提交真实证据。只 push feature，不 merge main，不部署，不清任何真实存档。将更新后的这份完整 Master 放到 `docs/`，不再单独添加第二份互相冲突的架构文档。
