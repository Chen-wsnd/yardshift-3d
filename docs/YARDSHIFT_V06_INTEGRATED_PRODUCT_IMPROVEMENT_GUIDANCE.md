# YardShift V06 — 全项目深度审查与一体化完善执行指导（Cursor）

> **文件定位：不是小任务单，也不是 V07 重设计。** 这是对已经落地的 YardShift V06 的一次**全项目、全玩家旅程、全层级实施审查**。执行时以原 `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` 的 L0–L6 产品意图为最高权威；本文是对当前代码的具体诊断、完善方向、资源组合、技术操作及客观验收的**唯一新一轮执行指导**。不要把每个检查点拆成一次停工/索要下一份指令的微任务。
>
> **审查基线：** `Chen-wsnd/yardshift-3d`，远程 `feature/v06-yardshift-full-experience`，`f19b6c16a12190da3f4fa718d37232e56b680559`（2026-11-22）。**保持该基线可回退**；本轮在其上新建一次连续 feature 分支，例如 `feature/v06-experience-completion`（以实际本地 `git status` 确认无冲突后创建）；不要触碰 `main`、不要部署。
>
> **证据边界：** 已直接读取 V06 总规范及 Atlas、执行日志、资源表、布局注册、GardenShell / GardenCanvas / Hotspots / TaskStages / Overlays / Tool、GardenDomain 类型/状态/Reducer/Review、核心引擎和测试。Cursor 报告 89 tests / 13 files、typecheck/lint/build 通过；**审查者未在用户机器上重跑，也未直接操控运行画面**。本报告区分 `CODE_CONFIRMED`（直接代码证实）、`RUNTIME_TO_VERIFY`（需要真实运行）、`PRODUCT_INFERENCE`（根据产品目标作出的改进判断）。任何新资源必须先核实来源、下载和授权，不能把候选写成已用。

---

## 0. 先明确什么叫“全项目进一步完善”

YardShift 的核心产物，不是四个园艺小游戏分别打磨得多漂亮，而是**一个玩家可以从头到尾组织工作、改变同一个庭院、理解工具原理和工序效率，并在第二次主动提高决策质量的完整体验**。

玩家的闭环：

1. 走进一个有明确待处理问题的花园；
2. 看见每一项工作、区分明显安全风险和可稍后清理的工作；
3. 自由决定顺序、准备工具，不被一条“标准工序”强制锁死；
4. 通过实际操作感受每种工具的目的、效率和局限；
5. 操作持续地改变**同一个有空间关系的世界**（剪篱落叶、拔草留碎屑、误伤植物、草坪变短）；
6. 已清理区域可能因为后续施工再变脏，玩家能够**亲自再次清理**；
7. 重新观察哪些工作还未完成，保证质量和安全；
8. 根据真实记录复盘，不被虚构的固定顺序罚分；
9. 用相同起始条件再来一次，体验工具组合、工序和准备带来的差别。

**成功条件**：普通玩家不用阅读代码或长篇说明，能够在一次完整体验后回答：为什么某工具适用某场景、为何某个顺序导致不必要的额外劳动，以及第二次会如何改变安排。工程测试只能证明世界规则与交互成立；教学效果仍需人类试玩，不得用 89 tests 代替产品完成度。

**层级规则**：L0（学习专业园丁思维）→ L1（自由试错和可见后果）→ L2（同一世界因果）→ L3（完整业务流程）→ L4（工具操作）→ L5（架构/复用）→ L6（视觉/音效）。每个下层改动必须说明服务哪一个上层结果。禁止被某种 Shader、某个 GLB、单条 bug、工具收藏、经济系统或测试截图本身驱动路线。

**本轮追求的是全链条缺口闭合**，不是每个区域的 100 分美术，也不是越多功能越好。下文将同时完成主线可靠性、操作表达、素材融合、教学和交付，但按依赖先后组织、不断向完整演示推进。

---

## 1. 对当前 V06 的实际判断：值得保留的资产与需要补齐的断点

### 1.1 必须保留，禁止重做

| 已有能力（CODE_CONFIRMED） | 现有文件 | 本轮处理原则 |
|---|---|---|
| Saturday Morning 完整 CC0 庭院 | `SaturdayGardenModel.tsx`, `gardenScene.ts`, `public/assets/models/yardshift-kit/saturday-morning-back-garden.glb` | 保留主体，任务和效果在其上定位，不新造住宅或第二栋房子 |
| 两种真实不同的割草机 GLB + clips | `MowerTool.tsx`, `modelCatalog.ts`, `manual-reel-mower.glb`, `mower.glb` | 保留模型/动画，不换回方块模型 |
| 路径采样割草 + 24×16 草坪持久状态 | `LawnTaskStage.tsx`, `lawnSweep.ts`, `lawnGrid.ts`, `gardenFixtures.ts` | 保留确定性权威与采样；只补操作/视觉/覆盖一致性 |
| 免费充电、工具状态、工作区保存 | `durabilityRules.ts`, `gameStore.ts`, `v06ObjectiveMatrix.test.ts` | 保留正确部分，统一扩展到其他有电工具；别恢复余额锁 |
| 任务热点、场景定位脚本、单庭院 3D 总览 | `gardenPlacement.ts`, `gardenTasks.ts`, `inspectGardenScene.mjs`, `GardenHotspots.tsx` | 以测量坐标为依据，改善可见性和动态工作范围 |
| GardenDomain 独立对象 + 幂等事件 | `src/game/garden/{types,fixtures,reducer}.ts` | 保持单一世界状态；增强事件语义而不是改写所有旧模块 |
| 绿篱、除草、清理、安全、计划、复盘基础 | 各 `*TaskStage.tsx`, `GardenWorldOverlays.tsx`, `WorkPlanPanel.tsx`, `WorkReviewPanel.tsx` | 接成完整可玩的真实因果和工具操作，不改成菜单小游戏 |
| 旧版兼容与自动测试 | `gameStore.ts`, `gardenFixtures.ts`, 现有 Vitest | 不删除旧存档、不移除测试、不改 `main` |

### 1.2 关键诊断（不是孤立修补，而是决定整体验收路线的已确认差距）

| ID | 层级 | 直接代码依据 | 当前风险 / 上层影响 | 本轮要求 |
|---|---|---|---|---|
| R01 | L2–L3 | `DebrisTaskStage.tsx` 交互平面中心 `(-3.2,-4.0)`、宽 10 深 6；`gardenPlacement.ts` 绿篱碎屑约 `x=6.35` | 东侧剪篱生成垃圾，西南清理平面难以操作到，**完整因果链中断** | 清理支持全院可见碎屑的空间操作、聚焦和装袋，不只固定西南片区 |
| R02 | L2–L3 | `reviewSelectors.ts` 在**任何** gather/bag 之后若出现 clipping 就增加 `spawnAfterClean` | 西南清叶、东边剪枝也可能被误判返工；先产生工作≠玩家已返工 | 记录/计算同一区域先清、再脏、实际再次清理；区分 re-dirty risk 与已投入 rework |
| R03 | L2–L4 | `EdgeTaskStage.tsx` 把 `hand-edger` / `string-trimmer` 的 `sweepSamples` 交给 `j1-lawn`；`engine.ts` 任何非空 samples 直接走 `applyLawnSweep`; `lawnSweep.ts` 只特别区分 `manual-reel-mower` / `lawn-mower` | 修边可能表现成普通割草、共享完成数、工具宽度推导错误，**无法学习“大面积 vs 边缘”** | 建立独立边缘几何/状态/操作语义，不能同时算成草坪面积进度 |
| R04 | L2–L4 | `gameStore.cutHedgeCluster`, `blowDebris`, `topCutWeed` 使用工具名/逻辑，但未像 `lawnSweep` 一样验证并扣工具资源/磨损 | 电动工具有电池描述，却可无限施工；操作目的与实际限制不一致 | 统一 `ToolUseGuard`/`ToolUsageResult`，按有效操作推进消耗，可充电、卡住、恢复 |
| R05 | L1–L3 | `reviewSelectors.ts` 的 `canFinishWell` 未读 `WorkSnapshot` 草坪完成度及独立 edge | “还没割草/修边”仍可能获得好评价，教学目标失真 | 单一全院质量/安全/任务覆盖评审，不强行做所有可选作业 |
| R06 | L1–L3 | `garden.events` 只记录部分任务投入；`performWorkAction` 的 mower 成功不统一反映到 GardenDomain effort | 复盘对实际割草投入/工具效率/工作顺序不完整 | 建立跨工具的统一行动摘要，无重复记账、可解释单位 |
| R07 | L1–L4 | `GardenWorldOverlays` 的 debris 球体、花球；`HedgeTaskStage` 的工具盒子；`DebrisTaskStage` 的圆柱体；仓库已有合法独立真实 GLB | 玩家看见的是抽象代理，工具差异难从形状/动作理解 | 优先复用**已在仓库**的剪、耙、吹、袋、线割机等 GLB；proxy 可作为 hitbox，但视觉不应是 proxy |
| R08 | L1–L3 | `GardenHotspots.tsx` `known=false` 也渲染点击事件（仅 opacity 降到 .03）；`Inspect` 标记可观察状态 | 玩家尚未观察就能误点隐藏区域，或看不出 Inspect 带来的知识变化 | 区分可探索的交互与已经发现的信息；检查只揭示，不锁正常施工 |
| R09 | L1–L3 | `WorkPlanPanel.tsx` 默认顺序来自 fixture 的 `hazard→hedge→lawn→edge→flowerbed→debris` | 玩家在试错之前被暗示唯一正确答案 | 默认引导以“观察到的工作对象”为主；计划自由编辑、可跳过，复盘才给多种合理路线 |
| R10 | L3–L4 | `FlowerbedTaskStage.tsx` 以小球渲染全部 `plants`; `MEASURED_DANDELIONS` 分布于全院，部分不在西侧花坛 | 花坛操作可能视角外、难点击，误伤/留根的区别不直观 | 按世界位置分区可操作，真实杂草 GLB 与独立花实体映射，处理结果视觉相符 |
| R11 | L3–L4 | `GardenShell` 有 `Work review` 随时打开、`Done` 仅关闭面板；缺少真正的收尾状态 | 完成与继续施工的语义模糊，用户缺少完整一次工作的结局 | 添加非惩罚性的“检查完工/继续改进/结束本次记录/相同条件重试”明确环节 |
| R12 | L5 | `gardenPlacement.ts` 一部分 `MEASURED+MANUAL_OFFSET`，`debris` 是固定主热点；`SaturdayGardenModel` 多个任务同一场景 | 初始热点能用，但动态新碎屑/花坛/边界可能与可交互空间脱节 | 让所有任务实际可操作空间和动态对象取自统一坐标/目标数据，禁止散落硬编码 |
| R13 | L4–L5 | `LawnTaskStage.tsx` 鼠标拖拽时 `onPointerLeave` 取消；`clampPointerStep` 限 0.35m 并舍弃远端位移 | 高速拖动可能出现断续/手感失真 | 维持防瞬移，但审查连续输入的真实路径追踪、pointer capture/cancel 和多端指针 |
| R14 | L5–L6 | `LawnFootprintLayer.tsx` 用高度不同的 box InstancedMesh 作 384 草块 | 割草数学成立，但草地仍像网格立方体，可能削弱工具切割可读性 | 采用轻量合法植被实例/着色变化，**保持同一权威 cell**，先改善一眼可懂，再看性能 |
| R15 | L1–L6 | 现有测试大多对 reducer/store 下断言，浏览器截图只 2 张，体验不等同自动测试 | “89 passed”不能说明首次可探索、工具可操作、场景可信 | 自动化只负责客观正确，浏览器只覆盖关键端到端，最终主观试玩交给负责人 |

**严格分级**：R01–R06 是完整体验和可信因果的主要缺口；R07–R14 是操作/呈现/整合缺口，其中看不懂工具或场景时升级为 P1，纯视觉锦上添花仍是 P2。不要把这一表拆成 15 次请求批准的任务；按后文全链路实施阶段连续完成。

### 1.3 明确哪些事项仅为待验证，不能直接宣称是 Bug

- GLB 刀片动画和工具朝向是否自然：代码中使用了 `useAnimations`，但必须在本地浏览器观看才能断定时序/轴向正确。
- `SaturdayGardenModel` 里是否有未遮蔽的重复静态物体、任务镜头是否被房屋挡住：需实景检查。
- 具体帧率和首屏加载时延：尚未在目标设备测量，不能猜测；未测就标 `NOT_MEASURED`。
- 用户是否理解、喜欢、愿意重玩：只能由人试玩观察，不可由单测“通过”代替。
- 现有 `gardenPlacement` “测量”的节点坐标是项目记录的测量结果；**偏移是产品布局选择**，不应把所有数值都称为原始模型位置。

---

## 2. 资源、代码与场景：具体该用什么、放哪里、怎么连接

### 2.1 已在仓库的可用资源（默认零新增资产成本）

路径基准：`public/assets/models/yardshift-kit/`，许可证清单 `docs/ASSET_MANIFEST.md` / `docs/THIRD_PARTY_NOTICES.md`，全体取自 3DAssets.dev Lawn Mowing Simulator Kit（项目记录为 CC0 1.0）。**存在文件不等于已实际渲染；见对应列。**

| 功能 | 文件（省略目录前缀） | 当前实际情况 | 本轮具体衔接位置 / 表现要求 |
|---|---|---|---|
| 统一庭院基座 | `saturday-morning-back-garden.glb` | 已实际渲染 | 保留 `SaturdayGardenModel.tsx`；只隐藏与工作状态冲突的 baked NPC/草坪，别另起一片虚拟场景 |
| 未割/已割草层 | `lawn-uncut.glb`, `lawn-cut.glb` | 已入库、项目用于草坪条，当前细格主视觉为 box instances | 草叶层只投影 `WorkCell.remainingWork`；不要创建第二套“被割状态” |
| 手推滚刀/电动割草机 | `manual-reel-mower.glb`, `mower.glb` | 已用于 `MowerTool.tsx`，有 animation clips | 保留两个天然不同模型、按真实运动播放轮/刀轴、与电量和方向一致 |
| 绿篱底座/过长层 | `hedge-block.glb` | `GardenWorldOverlays` 已用 | 沿东侧 `HEDGE_EAST_NODES` 放置；切除的是独立 overgrowth clusters，保留底座，不因整体缩小而掉形 |
| 园艺剪 | `garden-shears.glb` | 入库，`HedgeTaskStage` 仍显示盒子工具 | 替换工具可见部分；小范围精剪；网格碰撞仍可用透明交互区域 |
| 动力绿篱剪 | `hedge-trimmer.glb` | 入库，stage 用盒子 | 替换可见模型；接动力/轮廓过切、受硬木阻断和维护 |
| 耙子 | `leaf-rake.glb` | 入库，stage 用圆柱代理 | 对应实际耙向、范围和聚堆；几何只负责表现，清理事件仍由 reducer 控制 |
| 吹叶机 | `leaf-blower.glb` | 入库，stage 用圆柱代理 | 工具朝向 = 实际吹风向量；需验证有电才吹；移动叶片方向与工具姿态一致 |
| 园艺袋 | `grass-bag.glb` | 入库，stage 用圆柱代理 | 靠近 gathered pile 可装袋；bag 动画不代替空间判定 |
| 线割机 | `string-trimmer.glb` | 入库，stage 仍未用作完整工具表现 | 修边/截顶显示同一真实工具，拥有一致电量和精度限制 |
| 杂草 | `dandelion.glb` | Overlays 已用；专项 stage 仍绘制球体 | 以实体 ID 驱动高度/消失，根仍在与拔根有不同视觉 |
| 花坛边界 | `flower-bed-border.glb` | 已入库，场景包含对应部件 | 使用 measured 西侧花坛定位；不得把 P0 右侧保护格当作同一西侧花坛的实体 |
| 栅栏/座椅 | `picket-fence.glb`, `patio-chair.glb` | 已作为基座布景 | 只作为环境/安全边界，别为视觉丰富引入无谓的新任务 |
| 地面纹理 | `public/assets/textures/grass/*` （ambientCG Grass 001） | 已入库但 v06 草层没使用 | 只有能有效提高草坪可读性且不明显增加开销时才试；不要为了“用上所有资源”强行铺贴 |

**选型规则**：先利用现成工具 GLB 做至少一套共同的 `GardenToolView`（pose/scale/anchor/suspense/fallback），不要每个 TaskStage 复制独立 GLTF loader；复用现有 `MODEL_CATALOG`。将视觉碰撞和交互碰撞分离（不可见 hit volume 触发，合法 GLB 渲染）；任何新模型不匹配世界单位时先记录本地 bbox、pivot、natural scale，再作微调。

### 2.2 仅为候选的外部资源：先看差距是否真实存在

| 候选 | 授权/用途 | 决策 |
|---|---|---|
| `https://kenney.nl/assets/nature-kit` | Kenney Nature Kit，CC0；石块/小植物候选 | 现有石块是 dodecahedron proxy；若一看明显不自然且影响风险辨识，才导入一个小石头模型。不需整包搬进项目 |
| `https://github.com/paulrobello/grass-blade` | Grass Blade MIT；草面 cut mask 等工程参考 | **REFER_ONLY**（当前没有复制源代码）。仅在确实改善草层且保持单一状态时选择性改编；引入代码须履行 MIT Notice |
| `https://ambientcg.com/view?id=Grass001` | 草地 PBR CC0 | 当前已有贴图，先试低成本 shader/ground 方案，避免过多纹理、透明层和 GPU overdraw |
| `https://3dassets.dev/packs/lawn-mowing-simulator-kit` | 当前 CC0 kit 的原始目录 | 优先查同一风格资产是否已有；禁止无证据地声称新增资产“已验证” |
| `https://polyhaven.com/models` | CC0 自然植被可作为补充 | 仅当现有风格无法实现可辨认的草/碎屑时选择 1–2 个低模；高细分模型不直接灌入浏览器 |

**不采购 Fab、不上品牌照片、不另造大游戏引擎、不整包复制另一款游戏。** 如第三方许可、文件大小、动画绑定不清楚，使用已有 CC0 kit 或透明交互代理作为可逆降级。任何新文件统一写入 `ASSET_MANIFEST`：来源 URL、license、格式、校验哈希、运行角色、状态 `CANDIDATE/IN_REPO/ACTUALLY_USED/REFER_ONLY/REJECTED`。

### 2.3 真实世界定位表：坐标只是起点，操作必须跟着目标走

来源 `src/data/gardenPlacement.ts` 和 `docs/v06-scene-placement-map.md`（其中 `MEASURED+MANUAL_OFFSET` 不是纯模型测量）：

| 区域 | V06 当前大致位置 | 现有入口 | 本轮新要求 |
|---|---|---|---|
| 草坪 | `x=-5..5, z=-4..4`，24×16 细格 | `[0,0.05,0]` | 草与大面积施工共享这一空间坐标；边缘不是大草坪的复用计分区域 |
| 东侧绿篱 | 模型中心 `x≈7`，overgrowth `x≈6.35`，`z≈-3..6.7` | `[6.4,0.05,1]` | 修剪操作目标、碎屑落点、近景镜头、清理工具必须对同一范围有效 |
| 西侧花坛 | `x≈-6.3, z≈1.5..3.2` | `[-6.3,0.08,2.25]` | 植物个体 hitbox、观赏花与杂草实体直接绑定，误伤视觉有反馈 |
| 南/西南步道 | 真实 slab `064–078` | `[0,0.05,-3.6]` | edge 沿真实步道交界线工作，不能把草坪全部自动当已修边 |
| 初始叶片 | `x≈-5.2..-2.8,z≈-4.5..-3.8` | `[-3,0.05,-4.2]` | 保留这一片，但不能把“全园清理”误理解为只清这一片 |
| 新剪枝碎屑 | 事件产生于 `x≈6.35` 的东侧绿篱下方 | 暂无可用的对应动态清理近景 | 用全院 pick 或可切换区域/镜头/动态热点保证玩家能实际移动、聚堆、装袋 |
| 石块/硬木 | lawn `(-3.6,3.1)`，hedge `(6.35,1.0)` | inspect/hazard | 可见风险与其阻挡的具体工具位置重合；先检查才能理解为什么被挡 |

**必须避免**：在 `DebrisTaskStage` 放一个全院大透明平面，却相机始终指向西南，导致东侧物体仍无法看见/点到。具体方案优先为“世界中点击某个碎屑簇进入局部清理视角（camera target = 被点击的真实对象）；同一工具操作逻辑接受世界坐标”，次选为“同一清理模式允许 pan / 动态移动清理范围”。不要为每片叶子写一个独立关卡。

### 2.4 代码职责划分（以最薄整合层实现，不推倒旧规则）

```text
src/data/gardenPlacement.ts          唯一空间基准 + 测量/人工偏移标记
src/data/gardenTasks.ts              玩家看见/可选择的工作定义；不可创建第二份空间真相
src/features/garden/GardenShell.tsx  信息层：观察、工具选择、提示、完成/继续
src/features/garden/GardenCanvas.tsx  一个庭院入口；镜头根据所选现实位置调整
src/features/garden/*TaskStage.tsx   交互/输入层；仅生成可验证的 action，不自行修改全局世界
src/features/garden/GardenWorldOverlays.tsx  世界状态 → 对应空间的视觉投影
src/features/yard/assets/modelCatalog.ts 已授权资源索引；新增通用 ToolView 复用
src/game/work/lawnSweep.ts           保留连续割草专有状态转换
src/game/garden/reducer.ts           跨任务对象和事件唯一有效写入
src/game/garden/reviewSelectors.ts   纯函数聚合所有真实工作事件和最终质量
src/game/store/gameStore.ts          路由动作到正确 domain；完成时只写一次事实
src/game/work/gardenFixtures.ts      同一花园的可复现实验初始状态
```

允许增加小型 `GardenActionRouter` / `spatialCleanup` / `EdgeDomain` / `gardenReview` helper；**不要求凭空造一套全新 ECS、物理引擎或独立数据库**。旧 `/legacy` 路由可继续保留，但不可影响新花园默认入口的计算与存档。

---
## 3. 按完整玩家旅程逐步审查与完善：F01–F09（每项均包括现状、方向、实现和验收）

> **执行方式**：以下 F01–F09 是玩家可能经历的功能契约，**不是强制玩家按编号工作**；也不是要求 Cursor 每做完一节就停下来。各节共同构成一个完整可体验的单庭院。必须把不同工具/区域所做的工作联动起来，避免九个独立页面“都可点击但互不相干”。

### F01 进入、观察、发现真实待处理问题

- **已存在（CODE_CONFIRMED）**：`src/app/page.tsx` 直接进入 `GardenShell`；`GardenOverviewScene` / `SaturdayGardenModel` 载入完整庭院；`GardenHotspots` 在 `GARDEN_TASKS` 上创建三维交互区域；`Inspect` 在 `gameStore.ts` 记录观察；任务有 `designPurpose` 和 `strengthsLimits`。
- **目标**：前 30 秒看到庭院本体、可发现 3 个以上待处理工作、理解“可以随意先做哪个”；观察提供风险和环境信息，但不免费给出唯一标准工序。玩家从同一场景进入每个任务再返回，不应“跳到另一个虚空场景”。
- **需要改进**：`known` 当前主要控制 opacity、未控制是否“已了解”；hover 仅改整体方块颜色，没有区域名和当前状态。`Inspect` 点击后只是文本提示，缺少与场景风险、剩余工作量的明确对应；`WorkConfirm` 显示的是工具原始 ID 而非人能理解的名称。
- **技术及资源**：复用 `GARDEN_TASKS`、`gardenPlacement`、`GardenHotspots` 和 `equipmentProfiles`。在 UI 上提供短标签（例如 Lawn / Hedge / Flower border / Loose debris）、可选的 hover 信息（work remaining、hazard observed、tool suitable）；`Inspect` 标记只改变玩家掌握的信息，**不擅自修改任务状态**。任务点击来自可识别的实际场景区域；对于未观察的隐藏目标可点击探索，但信息层应表明“未知/尚未确认”，不要以透明点按陷阱冒充发现。
- **可见反馈**：草坪未割、绿篱不整齐、花坛杂草、叶片散落；悬停/轻点出现名称和简短目的；`Inspect` 后石头/硬木的位置、可能影响的工具一眼可查；没有无法返回的状态。
- **验收**：首次打开（无存档）可在一次常规浏览器会话中进入至少三种任务；任务提示/ID/镜头与实际模型相符；无点击空白地误跳；Inspect 不消耗真实施工进度；刷新后“已观察”保持。主观“是否一眼理解”留给负责人看实景。
- **停止边界**：不用新增角色 NPC、地图任务导航系统、多语言教程或巨大新 HUD。信息比装饰更重要。

### F02 工作计划与工具准备：玩家拥有决策权，而非被提示答案

- **已存在**：`WorkPlanPanel.tsx` 支持上下移动；`garden.plan.taskOrder` 和 `PLAN_REVISED`；`GardenShell` 在任务内显示工具按钮；切换工具记 `TOOL_SELECTED` setup effort。
- **目标**：让玩家主动决定先解决哪项问题；计划随时可改；可以无计划直接开工；工具选择呈现 *用途/局限/状态*，而不是只有名称。
- **需要改进**：初始计划呈现为近似专家流程，容易形成无意暗示；工具按钮只显示文字，玩家难以理解所选工具为何不同；资源和维护状态与任务选择脱节。
- **技术及资源**：保留简洁升降控件，但入口展示为“我的安排（可选）”；初始列出**待做工作**而不是宣称这是最佳顺序，推荐顺序留给复盘且写成“可能的方案之一”。工具提示读取统一 `ToolProfile`（用途/适配/限制/能源/状态），不重复硬编码文案。采用现有 GLB 的模型裁剪或小图预览，若实现重则先用清晰轮廓和对比文本；对真正的工具准备耗时建立操作事件，不把 UI 点击次数当成专业工时。
- **可见反馈**：选择手动园艺剪显示“精细/慢”；选动力剪显示“广范围/需电/控制风险”；检查电量、注意安全风险可能使玩家重新调整计划；换计划后已完成地面保持。
- **验收**：计划为 `debris→lawn→hedge` 仍能先剪 hedge；重排不回滚世界；首次选工具有清晰用途；准备投入只计一次真实工具换用，不因 React 重新渲染或误点重复加分/加罚。
- **停止边界**：不做商店、租赁经济、装备等级、10 页工具说明书；V06 学习目标来自“选择与后果”。

### F03 检查与风险处理：危险才需要优先，不把所有清理写成固定顺序

- **已存在**：`HazardTaskStage` 的检查/移除；`GardenDomain.hazards`；`lawnSweep` 在 hazard 附近局部阻挡；`cutHedgeCluster` 在硬木附近阻挡动力剪。
- **目标**：玩家可以避开局部石块先去别处，但确实无法让相关机器安全穿过风险区域；检查、移除后恢复工作，不丢掉已经完成的有效施工。
- **需要改进**：真实障碍表现是几何代理，用户不一定理解“这是石块/硬木”；`Inspect` 全局发现风险与局部检查的关系要清楚；动力工具停工的解释不能隐含“整片花园禁止施工”；风险提示要覆盖工具实际足迹而不是仅中心点。
- **技术及资源**：保留当前局部软阻挡。使用 `hazardId + worldPosition + blocks[] + radius / footprint` 的**可测量**判定；路径扫过危险区域时，只拒绝/截断受影响的局部采样，不应把整个远距离有效扫掠一次性全取消（先写测试再决定精确策略）。小石块视觉可暂用可靠 mesh，若难辨认才择优导入 Kenney CC0 单一石头；硬木可用已许可简单枝条形状。检查文案区分“先看见/确认”与“已经清除”。
- **可见反馈**：有危险、无法在该局部用相应工具、可绕过、清除、恢复；操作结果和风险图示一致。
- **验收**：有障碍时局部无进度、不扣错误损伤、不凭空耗尽设备；障碍之外正常施工；清除后同一路径可操作；同一障碍重复移除不加 effort；刷新仍 cleared。
- **停止边界**：不模拟随机严重事故、血腥伤害或法律危险内容；这是专业准备意识，不是惩罚游戏。

### F04 大面积割草：保留真实路径，补可理解的刀具、能源和草坪结果

- **已存在**：`LawnTaskStage`, `MowerTool`, `LawnFootprintLayer`, `lawnSweep`, `LAWN_FINE`；独立滚刀/动力模型，方向、工作宽度、正反向效率、电池消耗、一次性花坛损伤与刷新持久化。`performWorkAction` 在 M7 已修复 `sweepSamples` 转发。
- **目标**：玩家亲手看到“滚刀要推动、轨迹较窄、灵活；动力机更宽、需能源、接近保护物应谨慎”；被割草层**连贯且可辨**；能源耗尽可准备再恢复。
- **需要改进**：24×16 长方体草层仍是技术演示感；工作量随 sweepSamples 重复覆盖同一个 cell 下降，真实耗能按拖动距离计，需检查采样密度/低帧率不会人为提高切割效率。`onPointerLeave` 可能在拖拽中取消。`lawnSweep` 的花坛保护 cell 位于草坪右侧两列，与 measured 西侧 flowerbed 并非同一真实花坛；谨防玩家看不见风险却损伤。
- **技术**：继续使用 384 个 `WorkCell` 为唯一裁切 authority；考虑把视觉投影换成轻量草簇 `InstancedMesh` + cell 高度/颜色，或者单层低成本 shader 的 cut-mask 可视化（不要整包搬入 Grass Blade）；保留细格数值并校验路径积分不受输入采样频率影响，必要时每次 world-cell/stroke 做工作量上限和一次记录；正向滚刀、动力机电量、刀轴 clip 和工具状态绑定在相同运动事实；FlowerBorderDecorator 必须对应实际可见边界。对于 0 电状态无切割、无误伤，不做“双重耗电”；充电有模拟投入但不等待真实时间。
- **视觉资源**：`manual-reel-mower.glb`, `mower.glb` + 动画；现有 `lawn-uncut/cut.glb` 或 `ambientCG Grass001` 只作为视觉素材。性能要求先用最少 draw calls、按变更更新 instance matrix；不做逐草叶刚体。
- **可见反馈**：同一路段不同机器明显在刀具/工作宽度/音效（若已授权）/能源上不同；休止时刀轴停止；已割/未割在 overview 和专项都可辨；不出现方块突兀跳色造成“涂格子”印象。
- **验收**：单击无切割；正反方向工具差异；连续拖动在不同 pointer 采样频率下覆盖相近；电量 0→禁用→免费 recharge→继续；花坛保护真实空间存在；返回/刷新状态一致；无瞬移切割。FPS 无法测量则标 `NOT_MEASURED`，不要报告假数字。
- **停止边界**：草层看上去像可剪的草、动作/结果清楚即可推进其他区域；不为每株草的风动或微粒停留数天。

### F05 修剪绿篱：当前主要是“地面轨迹驱动簇”，目标是可理解的修剪工作

- **已存在**：`GardenWorldOverlays.HedgeOverlays` 从 `hedge-block.glb` 创建过长簇；`HedgeTaskStage` 用地面 plane + 鼠标路径沿东侧 `x≈6.35` 选择 `HedgeCluster`；`HEDGE_CLUSTER_CUT` 会生成 `DEBRIS_SPAWNED`；动力剪有 overcut 与硬木阻挡分支。
- **目标**：能看见“形状/高度不整齐”→手剪一段/动力剪连续处理→形状变规整→枝叶落到**实际地面**，旁边碎屑能真实清走。手动和动力的差异不只是点击半径不同，而包含刀口作用面、精细度、耗能和失误条件。
- **需要改进**：当前工具可见盒子；操作 raycast 在 ground plane，玩家可能觉得是在地上画圈剪空气；过切反馈只有缩放后的 foliage，能否看出整齐轮廓需看运行画面；`cutHedgeCluster` 没统一验证动力机电池/损坏。剪后落叶进入可清扫区域（见 F08）。
- **技术与资源**：保留 `hedgeClusters` 唯一 ID，工具运动可采用“沿绿篱立面投影的 2D 工作坐标（沿篱方向 z + 高度 y）”或从 GLB/独立 proxy mesh raycast 取得真正 3D hitpoint，再映射到既有簇；剪刀 GLB 自然显示并随路径走，保留简单碰撞代理。新增 `ToolUseGuard`（工具 ready + 合法 + 资源 + 作用范围），事件为真实有效 cut 时才耗费一次资源，不能因每帧拖拽重复消耗/重复 spawn；过切有明显的“局部缺口”，但不允许无解释的反复点击刷取惩罚。
- **可见反馈**：完整立体绿篱局部的 4 种状态（原状/部分/规整/过切）可辨；每有效修剪只产生一次下方独立枝屑；被清理后从同一空间消失。
- **验收**：手剪与电剪对同一条绿篱有不同覆盖和成本；电剪 0 电或 jam 时不处理；风险清除后恢复；同一个 cluster 重复剪不会产生新 debris；剪下枝叶随相机回 overview 可见、可被 F08 清除；刷新持久。
- **停止边界**：可用正确外形的低模/簇，暂不开发叶片物理或复杂枝条骨骼。

### F06 草坪修边：必须成为独立工作成果，不能被“割草”替代

- **已存在**：`EdgeTaskStage` 在南侧路径 `z≈-3.6` 用 `hand-edger` / `string-trimmer` 轨迹，当前调用草坪 `j1-lawn` 的 sweep 路由；`GardenWorldOverlays` 将草坪作为视觉呈现。
- **目标**：玩家完成大草坪后发现边缘仍不整齐；更换细部工具整理边界，看见大机与精细工具的任务差异及其效率意义。
- **需要改进（结构性）**：当前边缘与草坪使用同一 `WorkCell` 完成逻辑，容易出现“做修边就是把草坪格再割一次”或“先修边直接算割草”的状态污染；`applyLawnSweep` 没有对 hand-edger/string-trimmer 的边缘专用切口/兼容区域给出真实语义。
- **技术**：新增**独立且薄的 edge 状态**（如 `EdgeSegment{id,polyline,remaining,condition,damage}`；在 GardenDomain 里保留与主草坪不同的完成权威），从 measured path slabs 推导近似 polyline 和窄工作带；`applyEdgeSweep` 只更新沿路径的 edge segment，工作宽度/精度跟随工具 profile，距离/有效动作按规则扣电/磨损；未完成边缘不随着 lawn cells 完成自动清零。边缘操作可复用插值与世界坐标，不可复用“草坪结果 reducer”作为唯一权威。铺设稀疏未修边草条 overlay，修正后淡化/缩短，仍保持风格一致。
- **可见反馈**：大草坪完成但路径边缘仍杂乱；修边后形成一条可见清晰界线；对西侧观赏花/其他保护物误碰可造成一次性可见损伤。
- **验收**：mow 100% 时 edge 仍可未完成；只 edge 时 lawn percent 不增加；相同长度 hand-edger vs string-trimmer 覆盖与资源有差异；超出边界无进度；刷新/overview/Review 都能看到 edge 状态；没有双重计算。
- **停止边界**：用少量折线+segments 即可；无需新的庭院模型、三维地形切割器或道路工程系统。

### F07 花坛与除草：玩家必须看见“拔根”不同于“削短”

- **已存在**：`PlantEntity` 的 `rootRemoved/topCut/ornamentalDamage`，`gardenPlacement.MEASURED_DANDELIONS`，`GardenWorldOverlays` 的 dandelion GLB；`FlowerbedTaskStage` 全部画成球；`pullWeed` 会产生 pulled weed debris，`topCutWeed` 留根。
- **目标**：玩家看到真实杂草与需保留观赏花，能主动选择拔根（费工但彻底）或线割截顶（更快但根仍留），误伤花不能被简单“再点一次”修好。
- **需要改进**：部分植物 ID 位于全院，而花坛近景只看西侧；点击小球不清楚植物身份和状态，尤其已切顶缩成 0.1 球不一定可读。花坛的线割机会耗电这一工具限制当前未统一执行；无效点击可能产生难理解的反馈。
- **技术与资源**：通过 `PlantEntity.x/z` 和 measured flowerbed polygon/BBox 筛选专项可操作植物；其他分散杂草保留为庭院世界可见对象，但要有可到达的入口或独立可聚焦位置（不必新建 4 个小游戏）。显示 `dandelion.glb`、简化的花卉低模/已有花坛对象，透明独立 hitbox；`rootRemoved=true` 从世界消失并产生可清理实体，`topCut=true` 可见短茬/留根提示（无需设计复杂生长计时器）；普通花卉的 misclick 是误伤而非拔除杂草。给线割机相同的工具状态/能耗/切割足迹约束。
- **可见反馈**：两种处理明显不同，花坛质量状态由实际对象计数/损伤决定，未处理散生杂草可从场景发现、合理到达。
- **验收**：按 ID 只改变选中的真实植物；削顶不使根任务完成；拔除不留下幽灵 hitbox；碎屑可清；误伤永久记录；动力工具电量 0 不应伤花/处理杂草；刷新保持。
- **停止边界**：不做杂草再生天数模拟、农药喷雾真实化学模型或种植玩法，除非它直接提高当轮专业工具理解。

### F08 地面清理与跨任务因果：整个教学循环的支点

- **已存在**：`GardenDomain.debris` + 每块枝屑有 sourceActionId；`gatherNearbyDebris`、`DEBRIS_MOVED/GATHERED/BAGGED`、`rakeDebris/blowDebris/bagNearbyPiles`；`DebrisTaskStage` 是固定西南面；`GardenWorldOverlays` 展示 scattered / gathered 球体。
- **目标**：清理工具能在**实际有碎屑的地方**工作。玩家不止在左边扫叶子，还能在东边修篱后把枝叶清走；同一位置清后再被剪枝污染，能再次扫掉；浪费来自真实重复劳动，不来自固定顺序分数。
- **需要改进**：当前单个 `DebrisTaskStage` 的平面覆盖不到东侧枝叶；camera target 仍是西南；耙/吹/装袋没有真实工具 GLB；吹风机未统一耗电；`DEBRIS_GATHERED` 只记录 IDs，不保留已清区域的空间足迹，复盘无法准确识别重叠；散生剪枝和初始叶子的空间分布还不足以稳定构造“同地返工”例子。
- **技术**：
  1. 清理操作工具使用真实世界坐标，并可以覆盖 `DebrisEntity` 的完整可达区域；根据玩家选择的一堆 debris 的世界 centroid 决定相机/局部操作范围。工具可穿过草坪、绿篱下方等现实可达地面。用已测坐标检查遮挡/入口；禁止直接改成“按按钮全园装袋”。
  2. 耙子按真实移动方向小范围聚拢；吹叶机按 tool forward（朝向）与距离 cone 推散落物，推 gathered 重新散开，消耗资源；袋子只在足够近且 gathered 时装走。操作由 reducer/Store 写状态，物体位置变化和 overview 严格一致。
  3. 记录 `cleanupFootprint`（例如 cleanup action 的局部圆形/网格覆盖，`x,z,radius`、实际成功清理的 IDs/位置）以及每次事件 `worldPosition` 和递增 sequence，必要时在 GardenDomain 加 `cleanupHistory` 的可迁移可选字段。未来在同一区域新产生碎屑时可**提示可能需重复清扫**，但**只有之后玩家实际再次做了有效清理操作，才把那一部分投入列作 `reworkEffort`**。地理位置不重叠 = 不增加返工；只是新生成但未被清理 = 未完成工作，而不是已花费的重复投入。
  4. 演示 fixture 必须在东侧绿篱落点附近包含少量**初始可清理叶片/枝叶**，使 “先清这一片→剪篱再脏→再次清理” 在同一真实空间可操作；同时保留西南区域初始叶片作反例（清西南不应因东边剪枝被罚）。可通过新建/迁移兼容规则影响**新开局**；旧存档的既有 debris 不得被无声重置。
  5. 别把所有额外工序都叫返工：准备、换工具、因电量不足恢复、无效重复、未完成工作是不同账目；一定要能指向真实位置和事件。
- **资源**：`leaf-rake.glb`、`leaf-blower.glb`、`grass-bag.glb` 必须优先连接现有模型；碎屑采用同风格 CC0 简化多叶片/细枝实例，在地面按状态渲染 scattered、gathered、bagged。少量粒子可以作为动作提示，但**绝不能只靠粒子表示持久 debris**。
- **可见反馈**：一个东侧任务 → 剪枝掉叶 → 东侧可清理 → 回总览同位置减少 → 先清东侧→再剪→地面再次有叶 → 玩家重复清理 → Review 解释这次多走的一遍。西南清扫与东边剪枝无关时则不提示返工。
- **验收**：所有已存在、未袋装的 debris 都至少有一条正常可达的合法工具清理路径；不同位置只能清近处；动态新垃圾也能清；吹风方向可辨；相同源事件不产生两份垃圾；相同位置重做才有真实的 rework；旧存档完整。
- **停止边界**：不要为了枝叶气流物理、风场 CFD、10000 个叶片粒子或完整 ragdoll 花时间；用小规模确定性对象和 R3F InstancedMesh 即可。

### F09 收尾、质量检查、复盘与重试：必须让玩家感受到工作“完成了”

- **已存在**：`WorkReviewPanel` 显示 Productive / Setup / Rework / Recovery、qualityNotes；`Try again (same yard)` 重置；`canFinishWell` 只检查 hazards/hedge/weeds/debris，`Done` 关闭面板；旧 `qualityRules` 聚焦 legacy job zones。
- **目标**：玩家能够确认一项庭院工作是否达到可接受质量、还有哪些明显未完成、哪个地方产生实际重复劳动；复盘真实行动，不因为没照抄模板被罚。允许回去完成未做的工作；选择“结束本轮”才生成可比较的结果。
- **需要改进**：目前 Review 不把大面积草坪/独立边缘纳入整体“完成”判断；草坪工具投入缺少统一事件；`total` 用 `spawnAfterClean` 直接加一个固定系数，而且 `qualityNotes` 缺少草坪/边缘；质量与效率没有清晰优先顺序。`Done` 仅关闭，没有冻结本轮成果或形成可复盘历史。
- **技术**：
  1. 让 `buildReviewSummary` 能读取**现有**权威 `WorkSnapshot`（草坪 cells / 真实 tool state）和 `GardenDomain`（植物/绿篱/碎屑/独立 edge/危险/事件）。不要拷贝草坪状态到 GardenDomain 作为第二权威。可用 `buildWholeYardReview(work)`，保留旧 selector 作为兼容包装（或渐进迁移）。
  2. 将质量、安全与投入分开：`completion`（核心工作 coverage）、`quality`（花损/过切/边缘/草坪外观）、`safety`（未清危险）、`effort`（productive/setup/recovery/ineffective/rework）。有安全/质量问题不能因为速度快而被表述为专业；但允许提前结束并明确“未完成/需注意”而非硬锁。
  3. `productive` 从成功有效动作/真实覆盖量记账，不按 React 渲染帧数；工具状态更新和工作事件同一次提交，避免一个动作两次扣电/两次记投入。不同任务的单位统一标明是**游戏内部 effort units**，不是现实分钟。
  4. “真实返工”：识别 cleanup footpoints 与后续落点区域交叠，在之后实际成功再次清理时把这次 effort 分入 rework，不能把“未来可能要再做”冒充“已经做了第二次”。保留一条能定位到地方的解释，而不是“玩家选择错误顺序 +1.2”。
  5. 结算流程 `Inspect final → Continue working / Finish this visit / Retry same conditions`；结束时冻结本次摘要（可简单 session result 记录）并允许打开前一次结果对比，但不建立登录/云后端。`Try again` 的含义为**相同初始条件的公平对照**，不是清空上一局历史后完全无法比较。
  6. 给出非唯一的专业对照思路：局部危险先处理，生成枝叶的主要施工可与修剪/割草合理编排，最后集中清扫通常少重复；根据植物、地形、障碍、使用设备不同可有其他好方案。专业示例只能是可选解释而非自动判定胜利公式。
- **可见反馈**：一眼看出主要工作完成比例、仍留在哪个区域的风险/垃圾、工具准备带来的代价、哪一次清理重复；重试两次拥有可比摘要。若玩家没割草，不能显示“Quality looks acceptable”并暗示整院已完成。
- **验收**：两个不同实际顺序在**相同最终质量/安全**条件下比较 effort，重复清扫那条路线更多；仅改计划文本不改成绩；西南清扫后东边剪枝不罚；未割草/未修边显式显示未完成；新局不破坏上一局比较数据或老版本存档；复盘数字与内部事件一致。
- **停止边界**：不做好友排名、多人竞速、真实货币收益模型或录像回放；专业工作学习比游戏化积分重要。

---

## 4. 工具系统横向一致性：让每件工具都真正体现“设计目的与限制”

工具是玩家认识专业园丁资源编排的主要载体。所有工具按**同一接口语义**对照，而不是某工具为特例、另一工具无限制：

| 工具 | 玩家如何操作 | 必须体现的物理/功能差异 | 能源 / 维护 / 风险 | 现成资源 | 客观验证 |
|---|---|---|---|---|---|
| 手推滚刀割草机 | 拖动沿地面推进 | 窄宽度、反向弱切、推行刀轴运动 | 无电池、可磨损；邻花谨慎 | `manual-reel-mower.glb` | 站立点击不割，正向有进度，反向显著少 |
| 动力割草机 | 拖动/沿方向推 | 宽切口，开阔区效率高 | 路径耗电、0 禁用、recharge、误伤 | `mower.glb` | 同距电耗稳定，0 电恢复后继续 |
| 手动绿篱剪 | 沿立面逐簇修 | 作用窄、精细 | 无电池、慢 | `garden-shears.glb` | 可精剪目标、有效簇 ID 只切一次 |
| 动力绿篱剪 | 沿立面连续扫 | 作用较长、可能过切 | battery、jam/hardwood、恢复 | `hedge-trimmer.glb` | 0 电/卡住不可剪，使用耗电，过切可见 |
| 耙子 | 沿地面真实拖向 | 小范围聚拢 | 无电池；不会自动袋装 | `leaf-rake.glb` | 仅附近叶片变 gathered，远处不动 |
| 吹叶机 | 按工具朝向扫 | 大范围定向推动，可吹散 pile | battery、0 禁止、不能“装袋” | `leaf-blower.glb` | 按方向移动，状态/电耗一致 |
| 园艺袋 | 近堆点击/操作 | 清除 gathered，而非 loose | 无电、须靠近 | `grass-bag.glb` | scattered 不能直接清；非附近 pile 不动 |
| 手动除草器 | 点选一棵目标根 | 拔根彻底、慢 | 无电、误伤要识别 | 现有状态 + 可用小型 GLB 代理 | rootRemoved 与 topCut 不同 |
| 线割机 | 贴边/截顶短扫 | 不能等价拔根、边缘范围灵活 | battery、花损风险 | `string-trimmer.glb` | 截顶留根，0 电不处理/不误伤 |
| 手动修边器 | 沿 path 边缘 | 专修边、独立完工 | 无电、窄范围 | 现有规则 + 经授权简化工具视觉 | edge 完成不增加 lawn 完成 |

统一操作合同建议（示意，不强迫照抄 TypeScript）:

```ts
// Input authoritative: world position, tool id, target ids, samples, action id
// Guard: tool allowed + owned + status ready + relevant local hazard clear
// Resolve: exactly one state transition + valid target effects + resource/wear
// Emit: idempotent event (work + side effects) with footprint/location/effort
// Project: UI/3D reads resulting authoritative state, never writes back to fabricate progress
interface GardenOperationOutcome {
  accepted: boolean;
  reason?: string;
  affectedIds: string[];
  worldFootprint?: { x: number; z: number; radius: number };
  effortDelta: number;
  toolResourceDelta: number;
  eventIds: string[];
}
```

**反例禁止**：只在 `lawnSweep` 检查充电，其他电动工具可以永久无成本使用；前端先扣一次资源、Reducer 又扣第二次；操作毫无效果但仍记有效 productive；工具图形向左而作用向右；所有工具因方便都调用同一个“擦除格子”的 reducer。

---

## 5. 单一世界数据、事件与空间的不变量（整合改动必须通过）

### 5.1 世界权威要“一份数据说明一个事实”，允许不同领域合理分工

- **草坪**：仍由原有 `WorkSnapshot.jobs[jobId].zones` 的 24×16 草坪细格作为**唯一割草进度**，不可再新建一个同步不了的 `garden.lawnCells`。
- **绿篱、植物、风险、碎屑**：继续由 `GardenDomain` 的实体 ID 和 Reducer 唯一持有。
- **修边**：使用独立 `edgeSegments`/equivalent（与草坪共享坐标但**不共享已完成权威**）。引入时增加兼容迁移并测试旧存档。
- **工具**：现有 `WorkSnapshot.tools` 保持唯一能源/维护状态；不在组件 useState 中另设永久电池。
- **计划**：`garden.plan` 只记录意图，不得成为强制任务顺序的状态机。
- **展示**：3D 视图从以上状态投影；overview 与 task view 必须是同一组对象的不同视角。

### 5.2 每个有效操作都要有明确的因果事件和地理归属

事件推荐统一至少携带可选 `areaId`、`worldFootprint`、`targetIds`、`sourceActionId`、`effortDelta`；对已经完成的存档用字段可选/迁移，而不是把用户旧数据判为损坏。注意区分两类事件：

- **事实事件**：已修剪 cluster、已拔草根、已清除某 debris、已充电、已伤植物、工具状态变化。
- **评价派生**：这次发生了真实重复清扫、这个位置仍不合格、这个工具组合准备次数多、下次可更有效。评价派生不得反向改变事实世界。

建议为每个用户动作稳定生成独立 ID（与事件重放区分），避免 `Date.now()` + React pointer 高频导致碰撞或不可复现；使用顺序号/会话 ID，在同一状态迁移里只写一次。事件是 `append-only` 事实记录；不允许直接手改 `effort.rework` 却不给出能追踪到地点和动作的证据。

### 5.3 返工定义必须工程化，而非道德化

- **Clean**：有效清理操作在世界 footprint 内确实移走了散落物/装走叶堆。
- **Re-dirty**：在同一 footprint 范围内，因为后续独立有效工作再次产生新的碎屑。仅“新碎屑出现”是**potential revisit**，不能立即算已耗费的额外工作。
- **Actual rework**：玩家随后**再次**在这片已清过且被污染的空间进行有效清扫/装袋，因此花了重复的劳动。仅这部分 effort 算 rework；第一次本来就需要的清理不是 rework。
- **No overlap**：清理区与新碎屑落点不相交，不能算返工。
- **Plan text**：改动 Work Plan 不可直接导致 +/− 分。
- **Completion first**：比较两条路线之前须报告各自最终 quality/safety/completion；否则一个人啥也不干就“最省工”荒谬。

位置算法可以用 1–2m 空间哈希网格或圆形工作足迹（按工具真实范围确定），不要为了“精确到毫米”构造物理仿真。每条记录必须能够解释给玩家：**哪一片区域，先做过什么，后来产生什么，最终再做了什么**。

### 5.4 明确边界内外、实体消失和状态同步

- 操作范围限制真实目标类型和足迹；点击空地不产生工作进度/扣资源（空跑若希望记录为无效投入，应有玩家看得到的相应行为）。
- `DEBRIS_BAGGED` 后场景中不再显示和可选；`PLANT_ROOT_REMOVED` 后不再是交互目标；`HEDGE_CLUSTER_CUT` 后不会再次生成同一份 clippings。
- `TOOL_RECHARGED` 只恢复能源，不修复 broken/jammed；所有工具共享此语义。
- 弹窗、镜头切换、加载失败不应修改世界；`Back to garden` / refresh / migrate 前后权威值等价。
- 旧 `yardshift-v02` 以及新花园 `yardshift-v03` 持久 key 不得被误清空。新字段迁移须支持：旧无 garden、旧无 edge、部分缺失事件扩展。
- `Reset garden` 必须明确它是当前会话重置；必须保留用户需要的上一轮比较摘要或得到明确同意后才清空。

---
## 6. 技术文件逐项检查与建议修改位置（Code Impact Atlas）

> 以下不是要求把每个文件单独变成一项审批或一个 commit，而是让 Cursor 在完整研发过程中**知道去哪检查、该修改什么、为什么**。改动以最小必要为准，文件名可局部调整但必须在执行日志中说明。

| 现有代码文件 / 文档 | 检查事实与方向 | 预期变更/保留 | 主要验收 |
|---|---|---|---|
| `src/app/page.tsx` | 直接进入 `GardenShell` | 保留主入口；清理“v0.3”过时注释 | 首屏确实是同一庭院 |
| `src/app/layout.tsx` | 元数据描述仍含 accept jobs/clean yards 旧经营定位 | 改为工具学习与专业工作流程，不引入商业化任务 | 文案符合 L0；SEO 不暗示经济游戏 |
| `GardenShell.tsx` | 入口、工具、Inspect/Plan/Review、旧事件 toast | 建立轻量全局状况/工具准备/可完成状态；对任务按钮使用真实工具名称/状态；避免 stale lastEvents 一直悬浮 | 玩家知道下一步能做什么、不能做什么、怎么恢复 |
| `GardenCanvas.tsx` | 切任务时以 `key={activeTaskId}` 重建 Canvas | 仅在确有需求下保持；目标是切任务不丢状态/无异常资源重载；改善镜头切换 | 任务→总览→任务同位、内存/加载可靠 |
| `GardenOverviewScene.tsx` | 同一场景被 overview/task 渲染，任务镜头不同 | 保留共享世界，动态任务目标与观察范围适配；检查 pointer/OrbitControls 争抢 | 不同区域可完成操作、不只看到天空/屋顶 |
| `SaturdayGardenModel.tsx` | clone+隐藏 baked 模型 | 保留；仅根据实际重复/遮挡问题修改 hide list | 不出现假草/真实草同时叠放 |
| `GardenHotspots.tsx` | hotspot opacity/hover，无状态文字 | 将状态说明与可点击发现逻辑对齐；图形覆盖不阻挡对象选取 | Inspect/悬停/点击语义一致 |
| `WorkConfirm.tsx` | 只有 Yes/No + 原始 tool IDs | 显示友好名称、任务目标/可能风险；关闭/cancel 支持键盘/触屏 | 首次进入任务知道要操作什么 |
| `WorkPlanPanel.tsx` | 可重排但默认次序倾向标准路径 | 改成主观计划/可改/可跳过/已完成状态 | 不强制、不泄露唯一“正确”工序 |
| `HazardTaskStage.tsx` | 两次点击检查→移除，dodecahedron proxy | 保留低成本行动、补状态提示和有意义的风险物可辨性 | cleared 使阻挡解除并保存 |
| `LawnTaskStage.tsx` | pointer floor sweep、clamp、保护格 | 保留连续输入，优化 pointer lifecycle、状态反馈、保护真实位置 | 高频/低频指针一致，0 电无影响 |
| `MowerTool.tsx` | 两个不同 GLB、动画跟随 moving/cutting | 保留真实模型，核对 clip target、实际坐标/朝向 | 可见机体动作与真实进度一致 |
| `LawnFootprintLayer.tsx` | `InstancedMesh` 方格伸缩 | 在其上优先改善连贯草面可读性，仍由 cells 投影 | 单一权威与可见轨迹不变 |
| `HedgeTaskStage.tsx` | 地面 mesh + 盒子模型、按 XZ cut cluster | 连接真实 shears/trimmer，考虑立面工作坐标 + tool guard | 可见有效剪切、真实工具/能耗/范围 |
| `DebrisTaskStage.tsx` | 固定西南 plane、圆柱工具 | 改成全院可达碎屑与局部动态相机/工具范围；实体世界坐标不变 | 东侧 clippings 真能清理、非附近不误清 |
| `FlowerbedTaskStage.tsx` | 全院植物都渲染为球 | 按实际植物分区且用已有 GLB + 独立 hitbox；传真实 tool status | root/top/flower 视觉与结果一致 |
| `EdgeTaskStage.tsx` | 修边 sweep 直接写草坪格 | 让 edge 有独立 authority/action/footprint、连接线割机真实 GLB | mow 不等于 edge，edge 不等于 mow |
| `GardenWorldOverlays.tsx` | 绿篱 GLB、蒲公英 GLB、球体叶和花、石块代理 | 所有持久实体按 ID/位置渲染；替换必要 proxy，不篡改状态 | overview 真实表达刚才在任务里做的工作 |
| `SceneRegistrationDebug.tsx` | `?debugPlacement=1` 绘制热点边界 | 保留，新增真实 debris / edge / target bounds 在 debug 可见 | 坐标查错可复现；默认不显示 |
| `src/data/gardenPlacement.ts` | 一部分是 measured，一部分手动偏移 | 区分测量事实与 gameplay offset；动态碎屑不硬编码在初始 hotspot | 每个 target 在真正合理的地面 |
| `src/data/gardenTasks.ts` | 每项 tool ID + 强弱文案 | 提供资源差异和实际对象状态/完成度 selector；不增加强制任务顺序 | 工具学习在操作旁，而非另做教程页 |
| `src/features/yard/assets/modelCatalog.ts` | 已有多件 CC0 工具模型 | 继续使用，补统一工具挂载参数/缩放/朝向表；优先解决“proxy” | 所选工具实际显示的是该工具 |
| `src/game/garden/types.ts` | events lacks footprint + independent edge; effort fields 粗粒度 | 增量扩展，保留旧字段解析；新增区域/动作位置和边缘独立状态 | migrate 旧存档后数值不丢 |
| `src/game/garden/reducer.ts` | 剪枝、拔根、清理事件基本成形 | 统一幂等/按行动记账/空间足迹/工具状态、必要时积累清理历史 | 复播同一事件不生重复垃圾或投入 |
| `src/game/garden/fixtures.ts` | 初始 leaves 在西南、hedge 在东侧 | 新局有同地返工案例，保持旧存档、同条件重试稳定 | A/B 不靠隐藏默认惩罚 |
| `src/game/garden/reviewSelectors.ts` | 全局 spawn-after-clean 判罚，草坪/修边未覆盖 | 组合 `WorkSnapshot` + `GardenDomain`；真实 rework、全院完成/质量、可追溯 Notes | 同地实际二次清扫才算返工 |
| `src/game/store/gameStore.ts` | 单层大 store；不同 tool guard 不一致，存在旧经济分支 | 保留存储入口；抽薄的 action/service helpers，避免只改 UI 不改世界；新增 schema-safe migration | 状态切换/存档/不同工具统一 |
| `src/game/work/engine.ts` | `sweepSamples` 走 `applyLawnSweep`，未限制 action/tool 的 lawn 专用语义 | 增加明确 action 路由/zone-tool 兼容，edge 转向独立 reducer | 不能用 hand-edger 任意割草、不能过区工作 |
| `src/game/work/lawnSweep.ts` | lawn path + battery + local hazard | 只管理 lawn 区域，校准采样/实际作用足迹/能耗/保护 | 同距相近结果，合法工具合法区域 |
| `src/game/work/gardenFixtures.ts` | 固定 fine lawn + legacy zones + garden | 保留新局 deterministic；小心迁移与同条件 A/B 可重复 | 初始化可复现，兼容旧版 |
| `src/game/rules/durabilityRules.ts` | `applyRecharge`、`applyWear` 已存在 | 复用给所有电动/磨损工具，不重复写五种充电接口 | 能源 0 一致拒绝、恢复/修理分离 |
| `src/game/rules/qualityRules.ts` | 主要计算旧 WorkZone / payout | legacy 保留，新全院用独立 review 层调用草坪和领域状态；不以 payout 为教学核心 | 两套质量规则不互相污染 |
| `src/game/store/v06ObjectiveMatrix.test.ts` | 89 总测试包含基础矩阵 | 保留 + 扩展真正的全流程路径与负例 | 见第 8 节测试矩阵 |
| `docs/ASSET_MANIFEST.md`, `THIRD_PARTY_NOTICES.md` | 资源状态相对完整 | 更新真实使用的工具 GLB 和任何候选来源；记录哪项工具只是代理 | 许可可追溯、不虚报 |
| `docs/V06_EXECUTION_LOG.md` | M0–M7 已客观交付，非主观体验完成 | 追加本轮“跨层完整体验改进”记录，不覆盖历史验收 | 每项结论有 commit/test/evidence |

**后续源码若实际已变动**：上述事实以审查的 `f19b6c1` 为基准，Cursor 只需对比差异确认，不要重复实现已被其他提交改好的能力。确有不能按建议改动的代码约束，先报告客观原因与替代方案，并维持父层设计目标。

---

## 7. 一次性连续推进全产品的实施路线（Integration Waves；不要再从某单一小点重启）

> 本节是**依赖顺序**，非每一项都停工等人批准。每轮同时覆盖多个互相相关的功能；目标都是提高整个玩家旅程的连续性。不要为每一轮另立版本号/新主规范。

### W0 — 安全接续与完整基线复核（一次）

**动作**：检查 `git status` / 当前分支 / `git log -1` / 未提交变更；以 `f19b6c1` 为只读可回退基线，在其上创建一条新 feature 分支；若本地已有其他新提交，先按 commit 内容对比，不覆盖。建立恢复检查点。运行 `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`，记录**实际**结果与硬件/浏览器可用性。用 V06 9 流程建立一个“现有可用/部分/阻断”矩阵（只做一次，不陷入无限调查）。

**输出**：基线 SHA，测试实况，简要 `docs/V06_EXECUTION_LOG.md` 新一节；可执行地保留原 V06 版本。**直接进入 W1**。

### W1 — 全世界操作闭环与权限/位置正确性

这是最有价值的整体验收基础，**不是“只修落叶”**。

**工作范围**：统一空间定位和任务可操作范围；让动态碎屑真正可清；独立 edge 进度；修剪/拔草的掉落物与世界位置相符；hazard 的局部阻挡与允许绕行一致；所有动作跨 overview/任务/刷新显示一致。

**资源/方法**：`gardenPlacement`/`AREA_PLACEMENTS`、`GardenWorldOverlays`、`EdgeTaskStage`、`DebrisTaskStage`、`garden/reducer`、`gameStore`、`LawnSweep`。沿一条世界空间坐标查找每种动态实体，不再把清理范围和热点手动固定为另一片世界。

**门槛**：四种主要工作全部能通过 UI 实际完成并留下持久结果；动态新增垃圾可全部合法处理；单独修边不改变草坪完成率；安全和原工作进度不会因切视角丢失。通过后**继续 W2**。

### W2 — 真实工具差异与设备生命周期统一

**工作范围**：同一个 tool capability contract 管 mower、hedge-trimmer、leaf-blower、string-trimmer、manual tools；建立 valid action/energy/wear/jam/recharge 对照表；把工具模型动作与作用方向连接。保留 lawn 的独立视觉和移动逻辑，不把所有工具操作粗暴同质化。

**资源/方法**：`equipmentProfiles.ts`, `durabilityRules.ts`, `gameStore.ts`, `MowerTool.tsx` 和已有 CC0 工具 GLB。检查对一个 cluster 的重复操作不会重复扣电/记 effort；0 电的工具在任务中出现合理恢复入口，而不是页面“卡死”。

**门槛**：每类工具都具备正确有效范围和限制；动力工具电耗/恢复与动作同步；玩家能通过实际操作感受两类工具区别。通过后**继续 W3**。

### W3 — 全产品可读的视觉与操作呈现（限于教学价值）

**工作范围**：一个庭院整体风格一致；真实工具 GLB 替换影响理解的 proxy；修篱改变体块轮廓、草层不再明显为粗盒子、叶子/草屑在地面可辨、花/杂草处理差异可辨。任务镜头针对真实工作位置；点击/拖动自然，未命中时有明确原因；工具不遮挡主要工作区域。

**资源/方法**：优先本地 yardshift-kit，必要时用轻量 instancing/low-poly foliage 与受控动画。保留透明 click proxy，不用复杂模型 mesh 做笨重的高精度拾取。只在真实浏览器观察证据支持时调整 pivot/yaw/scale/camera，不凭审美猜坐标。

**门槛**：玩家不读技术文字也能看出“哪个工具正在使用、哪个对象改变、残余工作在何处”；没有严重遮挡、错位、白屏、操作区域脱节，性能正常。剩余 P2 视觉放 backlog，**继续 W4**。

### W4 — 经验学习层：观察、计划、结果比较和专业复盘

**工作范围**：首屏发现提示和任务状态、可选工作计划、工具用途说明、危险解释、全院完工检查、真实努力投入和地域返工、同条件二次体验记录。修正默认“专家答案提前暴露”的风险。所有教学以**发生的事情**为证据，不用长教程给抽象评价。

**资源/方法**：`GardenShell`, `GardenHotspots`, `WorkPlanPanel`, `WorkConfirm`, `WorkReviewPanel`, `reviewSelectors`, `GardenDomain`。建立 2 条可重复、质量相近而投入不同的完整路线；以数据做对照，不固定罚分。

**门槛**：玩家能按自己理解完成任务；场景实际后果支撑复盘文字；漏割草/漏修边不被称为整院成功；A/B 复盘能显示真实重复清理地点/次数/投入。通过后**继续 W5**。

### W5 — 合并为一条实际可演示体验并客观交付

**工作范围**：全路径 browser smoke + 关键单测/集成测试 + 迁移验证 + GPU/performance 记录（如环境可测）+ 资源 license/credits + Git commit/push。真正做到“进入→观察→任选工作→工具准备→跨任务环境变化→收尾/复盘→同条件再来”。

**资源/方法**：尽可能由确定性 reducer/store 测试证明业务；浏览器仅查真实点击/空间/镜头/GLB 载入和关键结果，不为截图数量反复折腾。控制对项目可靠性影响较大的场景和输入风险，而不是每个任务拍 12 张图。

**门槛**：见第 9 节 DoD。无阻断、测试全部通过、路径自洽、交付 feature branch；**停止本轮**，由负责人做主观试玩；不要自行开始新的十项内容扩张。

---

## 8. 自动化与真实浏览器的验收矩阵（非抽象、可失败的标准）

下表定义**输入 / 期望 / 失败**，Cursor 不得以“按钮能点、截图已存”替代。能写确定性纯函数测试就写；只在浏览器可验证的输入、模型和摄影机层面执行少量 E2E。

| ID | 输入或执行序列 | 必须符合的断言（失败则记录真实差异） | 工具 |
|---|---|---|---|
| T01 | 无存档首次进入；查看 3 个区域 | 页面/GLB 加载成功，热点与物体空间相符，无完全空白操作界面 | Browser |
| T02 | 初次 Inspect 风险/路径 | 观察标记增加但施工进度不变；刷新后已观察 | Store + Browser |
| T03 | 计划重排后执行与之不同的工作 | 完成不受阻；计划仅用于显示/复盘，不产生罚分 | Vitest |
| T04 | 未移除石块扫过其局部 / 其余草坪 | 受影响部分不能割，合法区域仍能工作；不能无故扣花损 | Vitest + Browser |
| T05 | 清除风险后再扫相同部分 | 进度成功，重复清除幂等；刷新保持 | Vitest |
| T06 | 不移动鼠标单击割草 | 无草坪进度、无电量/磨损虚减 | Vitest + Browser |
| T07 | 同一真实长度不同频率/速度采样 | 覆盖与电耗在可接受容差内；不因点数倍增多倍进度/电耗 | Vitest |
| T08 | 滚刀前进/倒退；动力机相同路线 | 实际处理范围/效率不同且与工具语义一致 | Vitest |
| T09 | 动力机 0 电→尝试施工→充值→施工 | 0 电不生效；充电不修复 broken/jammed；恢复原草坪工作状态 | Vitest + Browser |
| T10 | 绿篱手剪单簇，重试同一事件 | 只剪一次、只生一份落叶/枝屑、投入不重复 | Vitest |
| T11 | 绿篱动力剪 0 电、jam、hardwood | 各类失效合理拒绝，解决原因后恢复；不会免费无限剪 | Vitest |
| T12 | 在东侧绿篱有效修剪 | 新 debris 的 world XZ 接近原 cluster，回 overview 可见 | Vitest + Browser |
| T13 | 进入清理区域并操作东侧碎屑 | 东侧存在可达 raycast/操作范围，可聚堆/装袋；西南叶片仍原样 | Browser + Store |
| T14 | 聚堆/装袋但离 debris 超出有效范围 | 远处/未 gathered 不能袋装；没有“一键全院清空” | Vitest |
| T15 | 吹叶机不同方向、吹向已聚堆物 | 物体确实按有效方向变化并可散堆；电耗/状态一致 | Vitest + Browser |
| T16 | 割草到 100%，修边未做 | edge 独立未完成，Review 反映；不能自动全院完成 | Vitest |
| T17 | 单独修边不割草 | edge 完成变化、lawn % 不增长；修边工具不能在远离 path 区域割草 | Vitest |
| T18 | 手工拔根 vs 线割截顶 | rootRemoved、topCut、debris、visual 严格不同；电动 0 电不生效 | Vitest + Browser |
| T19 | 修剪/除草伤及受保护花 | 只计一次真实损伤，仍可继续其他工作，刷新保存 | Vitest |
| T20 | 清西南区域，再剪东侧篱，不再清东侧 | `reworkEffort` 不凭空增加；东侧新垃圾属于未完成工作 | Vitest |
| T21 | 先清东侧（真实有初始叶）→剪同地→再次有效清理 | 新碎屑出现+再清理成功；本轮实际 rework > 对照路线 | Vitest + Browser |
| T22 | 同地先剪篱→只清一次，最终与 T21 同质量 | T21 总投入更高，且差额可定位到实际清理操作而非固定顺序罚分 | Vitest |
| T23 | 仅“新垃圾出现”但玩家没二次清理 | 不把未来的额外工作误算成**已经消耗**的 rework effort | Vitest |
| T24 | 未割草/未修边/花损/危物还在 | Review 标出真实未完成或风险，不能称为同等高质量 | Vitest |
| T25 | 完成全部必要工作，结束本轮并 Retry same yard | 两局初始可比且第一局总结可对照；本轮重置不损旧 `/legacy` | Store + Browser |
| T26 | 每完成一个操作，在任务/总览/刷新之间切换 | 所有权威状态一致，位置不漂移，不复制或丢对象 | Vitest + Browser |
| T27 | 旧 v03 fine lawn / coarse lawn 存档升级 | 不清空原有合法进度；新增字段按兼容逻辑填充；无需用户手工清缓存 | Vitest |
| T28 | 大量重复相同动作/快速拖拽 + pointer cancel | 无意外重复 debris/effort；无卡住拖拽状态、无极端跨屏跳割 | Vitest + Browser |
| T29 | 工具 GLB 加载/切换，检查滚刀 clips、剪/耙/吹形态 | 所选工具视觉正确，作用方向与动画一致，无资源 404 | Browser |
| T30 | 完整流程在代表性桌面浏览器执行 + 四条脚本 | 不出现白屏/不可返回/严重遮挡；工程四项检查通过；FPS 按实测记录 | Browser + CLI |

**预期新增测试组织**：`src/game/garden/integratedWorldFlow.test.ts`（整体事件链）、`src/game/garden/spatialRework.test.ts`（空间与真实返工）、`src/game/garden/edgeDomain.test.ts`（独立修边）、`src/game/store/allToolLifecycle.test.ts`（各工具资源一致）、`src/game/store/wholeYardReview.test.ts`（全院评价）、`src/game/store/persistenceAndReset.test.ts`（旧版/本轮会话兼容）。可以分文件，也可按现有测试结构组织，但断言必须等价。**不要为了增加 test 数量写对结果恒真的测试**。

### 8.1 Browser 只做四条高价值场景，不为数量重复截图

1. **入场/发现**：首屏庭院 → Inspect（看到真实风险）→ Plan（可选）→ 进入任何任务/返回。
2. **主要工具**：滚刀与动力机对比 → 电池耗尽/恢复（可通过受控测试状态注入，不能把注入误报为真实玩家行为）→ 真实轨迹保留。
3. **跨任务 A/B**：一次东侧清理前剪篱、一次东侧清理后剪篱再清，分别实际操作并在同质量下看 Review；确保新增东侧碎屑真的可清。
4. **细部工作与完成**：修边、杂草根部/顶部、损伤、整体完工检查 → 同条件重试和刷新。

**图像证据** 只保留：庭院概览、工具操作后的明确变化、同地剪篱碎屑被清理、Review 对照（约 4–6 张有代表性的画面）；工具截图不是自动化 pass。未实际看见的效果不能在日志标 VERIFIED_VISIBLE。人工视觉评审可另由用户或我查看截图后提出，但不会阻断客观开发闭环。

---

## 9. 产品级 Definition of Done：不是单项任务 DONE 的拼接

只有同时满足下列要求，本轮才标记 `INTEGRATED_COMPLETE`（此前的 M0–M7 已客观完成这一历史事实仍保留）：

1. **一体体验**：从庭院看到每类工作目标，在任务之间切换并返回，场景视觉/交互/存档不割裂；任务都能从玩家可见方式进入，且可从同一世界完成。
2. **工具目的可体验**：至少每类核心工具都具备可辨形态和不同的作用方式；电动/手动的真实限制成立；工具失效/充电/修复有可恢复途径，不会死局。
3. **世界因果真实**：修篱和拔草生成地面垃圾，玩家能在**生成的同一位置**清理；清理不局限一块固定预制面；安全/损伤结果合理、持续可见。
4. **工序自由与返工真实**：玩家的任务顺序不受强制；先清东侧再剪篱然后真的再清，与先剪后清呈现真实投入差异；清西南不因东侧新枝屑被误扣；虚构顺序罚分为零。
5. **独立工作成果**：草坪、边缘、绿篱、花坛、地面清理各有可检查的实际进展；修边不冒充割草，割草不冒充修边；未完成工作影响相应复盘维度。
6. **教会，而非告诉**：在体验中看到选择后果；Review 能解释玩家亲自做过的决定；允许质量/安全良好的多条路线，不发布唯一最优解。
7. **工程可靠**：自动化测试/类型/构建/静态检查通过；feature 分支提交并 push；兼容旧存档、可重复开局、有来源/许可记录；没有明显阻断性 bug。
8. **性能与画面至少可读**：每个操作能看出对象和结果，没有致命镜头/遮挡/GLB 404；不用追求影视级写实。若 FPS 未测不假报，说明验证边界。
9. **证据完整**：交付短的“源码事实→实现改动→新测试→真实浏览器运行→剩余问题”的表，而不是只附十几张漂亮截图。

**允许留在 P2 backlog**：额外风摆、复杂声场、品牌工具图片、更多庭院/树种、角色职业故事、经济系统、动态天气、全物理叶片、复杂初始关卡、统计排行榜。**不能当 P2 放行**：东侧枝叶不可清、全局虚假返工、edge 伪装 lawn、工具无限能源、整院没割草却报达标。

### 9.1 评估进度的方式：以完整链路而不是“代码文件数量”衡量

每轮交付向负责人报告以下五个维度，状态只能是 `VERIFIED / PARTIAL / BLOCKED / NOT_TESTED`：

| 维度 | 验证问题 | 证据 |
|---|---|---|
| Complete player journey | 是否可以从进入到完成、重试一整轮 | 浏览器连续路径 + 状态断言 |
| Unified world causality | 所有任务结果是否能在同一世界承接并处理 | 关键跨任务断言 + 可见对象 |
| Tool design learning | 玩家能否从操作和局限认出差异 | 不同工具同场景对照 + 人工体验 |
| Work-order learning | 重复劳动是否真实、空间正确、可改进 | 空间重叠测试 + A/B 同条件对照 |
| Reliability / legal | 可存可退、运行平稳、素材合法 | 4 工程命令 + 资源 manifest + 历史保存 |

**只有上层价值确定受损时才返回修正下层**；局部 P2 不得让整个产品永久停在某个 TaskStage。

---
## 10. 成本、约束、停止条件和决策权限

### 10.1 资源与成本边界

- **当前默认采购预算：$0**。先使用仓库已有合法 GLB、纹理、React/R3F/Three.js/Zustand/Vitest；只有出现影响上层体验的真实缺口，才评估新素材。
- 任何候选外部资源必须先验 **许可、是否可随公共仓库再分发、格式、体积、纹理/动画、目标风格、浏览器性能**。未经批准不买 Fab/商用包，不抓取未经许可的品牌产品图，不将未授权资源放在 `public/`。
- 技术新增依赖优先为 0；如必须增加，要写清楚替代现有能力的收益、体积和后续维护成本。`Grass Blade` 等完整游戏只能选择性研究技术，不因“它是 MIT”而整包替换 YardShift。
- 画面美术方向以 **3DAssets.dev 已引入的低多边形统一庭院风格**为优先，不混入写实 PBR 树与卡通碎屑，避免风格失配。特殊植被可轻量实例化渲染，不必每片叶子是独立 GLB。

### 10.2 Cursor 自主决策与必须停下的边界

可以自行决定：局部类型名、小 helper 文件、少量确定性数值、合规本地 GLB 的常规旋转/锚点、低成本 shader、测试组织、camera anchor、交互反馈文字、小范围结构重排。

只有出现以下情况必须停止并请负责人决策：需要改变 L0–L3 产品意图；无法安全保留用户存档；核心需要付费/授权不明且无合法替代；必须合并 `main` 或公网部署；需要牺牲已有稳定主能力换一条不兼容路线；证明存在不可逆的严重问题。

**严禁常见偏移**：

1. 因单个模型不好看而单独启动全新视觉工程；
2. 因某页无法实现，就退回“另造一款完整游戏/另一个庭院”；
3. 把消费/金币/装备升级变成新主线；
4. 偷偷改变玩家必须按指定顺序完成的规则；
5. 出现一个 Bug 就重新写一份独立 master spec；
6. 频繁 `reset --hard` / `clean` / 清缓存使开发或用户数据丢失；
7. 用多张截图代替状态断言，或用单测通过代替用户体验。

### 10.3 局部停止打磨条件

当一个子能力同时满足“**可操作、反馈可辨、因果正确、状态可保存、与完整流程接通**”，剩余的刀片纹理、每棵草晃动、声音微调、边框距离等改进自动移至 P2。无论多有趣都不得阻止下一条主线断点修复；除非实际证明该细节已导致用户无法理解/操作，才升级优先级。

### 10.4 用户体验的职责边界

Cursor 负责客观可信的工程/逻辑完成与可操作画面；负责人负责主观“是否像园丁工作、是否易懂、是否好玩、是否值得继续玩”的判断。我负责后续基于 GitHub 复核整体一致性并继续按父层设计提供方向；**不应要求 Cursor 无限自拍图自评“很有教育意义”**。

---

## 11. 交付方式与报告格式（一次性汇总，不再小步索要新指导）

开发路径：

1. `git fetch origin`，确认 `feature/v06-yardshift-full-experience` 的实际 HEAD 与本地状态；不覆盖任何未提交工作。
2. 以已验证的 `f19b6c1` 为基准创建或接续**一条**集成完善 feature branch；若远程已更新，先比较差异，以最新兼容版本为基础。
3. 按 W0→W5 连续执行，关键模块可以分 commit，但不要每次 commit 都向人请求下一步。
4. 逐段在 `docs/V06_EXECUTION_LOG.md` 追加：`Scope / Changed files / Parent-level purpose / Objective test / Browser fact / Limit / SHA`；资源变化同步 `ASSET_MANIFEST.md`。
5. 不合 main、不部署、不移除已完成测试、不假装所有浏览器体验已由主人验证。
6. 最后 push feature；报告真实最终 SHA、命令执行结果、测试变更、关键交互录像/截图、资源状态与 P1/P2 未解决项。允许部分能力 `PARTIAL`，但必须明确哪些会影响完整链路。

交付报告模板：

```text
Baseline examined: f19b6c1 (or actual newer compatible SHA)
Work branch: ...
Final HEAD / pushed: ...
Product intent retained: L0–L3 unchanged / deviations and why
Integrated journey: F01–F09 VERIFIED / PARTIAL / BLOCKED (+ exact evidence)
Key world causality: mow / hedge / edge / plant / debris / hazard / recharge
A/B rework: same start, same final completion/quality? real repeated cleanup?
Tool integrity: manual/powered + charge/jam/wear + GLB loaded
Engine: typecheck / lint / test counts / build / migration checks
Assets: actual used / new downloaded & licensed / refer only / unchanged
Browser: screenshots/recording paths, actual interactions, NOT_MEASURED items
Backlog: P1/P2 with user impact, whether blocks current learning objective
Branch policy: main untouched, no production deployment
```

**唯一可信最终判定**：玩家能实际完成一个庭院、看到专业工具的差异与跨任务因果、从真实返工中获得更合理的安排直觉；源代码与场景可以持续演进。不是“不存在任何可继续打磨的细节”。

---

## 12. 直接发给 Cursor 的执行消息（与本文件一起发送）

```text
Please read the attached YARDSHIFT_V06_INTEGRATED_PRODUCT_IMPROVEMENT_GUIDANCE.md together with the existing docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md. The original V06 L0-L6 hierarchy remains the highest product authority; this new document is a comprehensive source-grounded implementation review and integrated completion plan, NOT a narrow bug ticket, a new game concept, or an instruction to start over.

Baseline: Chen-wsnd/yardshift-3d, feature/v06-yardshift-full-experience @ f19b6c1. First inspect git status and preserve any local work. Create/continue one safe feature branch from the latest compatible V06 base. Keep main untouched and do not deploy.

Execute W0-W5 continuously, covering F01-F09 as one playable product: observation, free planning, hazards, real mowing, hedge trimming, distinct edging, plant work, debris cleanup anywhere debris actually spawns, recoverable tool lifecycle, truthful whole-yard review and replay. Keep all proven V06 assets/code; reuse the already imported licensed GLBs. Prioritize complete causal/world/tool/learning integrity and then improve visuals insofar as they help a player understand and operate the game.

For every change, relate it to its parent product layer, inspect the listed exact file/area, state expected input/output and objective pass criteria, run deterministic tests and enough browser interaction to verify spatial behavior. Do not turn each row into a separate approval request. Never equate a screenshot or '89 tests passed' with complete gameplay validity. Stop polishing local P2 details when a connected, understandable result exists and continue to the next dependency.

Preserve legacy saves; do not reset/clean unfinished work; do not buy or introduce unlicensed assets. Commit in meaningful units, update the existing V06 execution log and asset manifest, push the feature branch, and provide one final integrated F01-F09 status report, SHAs, test results, real evidence and clear remaining limitations. Ask only for genuine product-level/legal/data-loss decisions.
```

---

## 13. 可核对来源与判断边界

**权威项目来源（实际审查）**：
- `https://github.com/Chen-wsnd/yardshift-3d/tree/feature/v06-yardshift-full-experience` @ `f19b6c1`。
- `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` — L0–L6、F01–F09、完整 DoD。
- `docs/YARDSHIFT_V06_IMPLEMENTATION_ATLAS_AND_RECOVERY_ADDENDUM.md` — 场景位置、资源与中断恢复。
- `docs/V06_EXECUTION_LOG.md` — Cursor 报告的 89 tests、typecheck/lint/build 及已知 P2。
- `src/data/gardenPlacement.ts`, `gardenTasks.ts`, `src/game/garden/{types,fixtures,reducer,reviewSelectors}.ts` — 世界状态、空间和复盘事实。
- `src/features/garden/{GardenShell,GardenOverviewScene,GardenHotspots,LawnTaskStage,HedgeTaskStage,DebrisTaskStage,FlowerbedTaskStage,EdgeTaskStage,GardenWorldOverlays,WorkPlanPanel,WorkReviewPanel}.tsx` — 玩家操作/视觉入口事实。
- `src/game/work/{engine,lawnSweep,gardenFixtures}.ts`, `src/game/rules/durabilityRules.ts`, `src/game/store/gameStore.ts` — 工具状态与操作权威事实。
- `docs/ASSET_MANIFEST.md`, `docs/THIRD_PARTY_NOTICES.md`, `src/features/yard/assets/modelCatalog.ts` — 已在仓库的资产、许可和复用位置。

**外部核对/候选（不能冒充已下载）**：
- `https://3dassets.dev/packs/lawn-mowing-simulator-kit` — 当前库的源头；3DAssets.dev 单资产页声明 CC0 1.0。
- `https://kenney.nl/assets/nature-kit` — Kenney CC0 自然素材候选，仅为必要的石块/叶片 fallback。
- `https://threejs.org/docs/pages/InstancedMesh.html` — R3F/Three.js 需要确保更新实例变换后标记 instanceMatrix.needsUpdate；渲染技术参考。
- `https://github.com/paulrobello/grass-blade` — MIT 草切割技术参考，当前项目登记为 REFER_ONLY，未复制代码。

本文未检查的材料：目标用户电脑中尚未交付的最新未提交工作、真实运行的完整浏览器录屏、实际 GPU 测量。它们必须由执行阶段再验证；不要把推断标记为已测事实。
