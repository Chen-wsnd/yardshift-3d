# YardShift — P0 资源编排与真实割草体验执行令（Cursor Ready）

**版本**：2026-11-22 / P0-01  
**项目**：`https://github.com/Chen-wsnd/yardshift-3d`  
**已检查基线**：`feature/v03-lawn-vertical-slice` @ `c10772d613e590c05b5488327145f820b2958668`  
**状态**：设计与资源选型已锁定；**本文没有修改远程仓库、没有在用户电脑上运行浏览器，也没有验证新的 GLB 下载成功**。  
**本次范围**：只完成“一个花园 → 点击草坪 → 选择真实手推/动力割草机 → 沿实际移动路径割草 → 造成可见局部变化/错误 → 退回同一花园 → 刷新仍保留”。  
**不要**在本次开发绿篱/除草/落叶第二阶段、经济系统、第二栋房子、NPC、完整 Grass Blade 移植、品牌图片爬取、自由漫游。

---

## 1. 核心决策：资源不是目的，而是玩家流程中的能力

不再问“有没有漂亮草坪照片”“能不能用别人的游戏”；按顺序问：

1. 玩家要学习什么因果？——**推动/操控工具时，在实际经过的草坪留下相应工作痕迹**；速度、覆盖、方向与边缘风险不同。
2. 需要哪些能力？——可识别庭院、两款真实工具外形、真实运动、沿轨迹局部切割、错误、跨视图保存。
3. 哪些现成？——庭院 GLB、两款动力/手推机器 GLB（手推还未加入 repo）、模型附带动画、现有 React/Three/Zustand 与 work engine、MIT 开源可参考草叶效果。
4. 哪些必须开发？——**路径输入/足迹映射、模型动画播放与暂停、将局部切割状态投影到视觉、统一持久化、总览同步**。这才是我们的原创连接层。
5. 达到怎样的效果就停止？——玩家不看文字能分辨两机；实际路径改变草；局部/坏结果在总览可见；刷新不失；界面不遮挡。

**拒绝两种极端**：不拿一整款现成游戏替换 YardShift；也不从零建立已经存在的庭院、割草机模型、基础运动动画。

## 2. 已有资产/代码与缺口（根据该分支实际文件）

| 能力 | 实际已有文件 | 当前具体问题 | 本次决定 |
|---|---|---|---|
| 住宅花园总览 | `public/assets/models/yardshift-kit/saturday-morning-back-garden.glb`；`SaturdayGardenModel.tsx` | GLB 已有，预制人物/半割草坪通过节点名隐藏；须确认实际画面和草坪对齐 | **保留**，不重建院子 |
| 草坪入口 | `GardenShell.tsx`, `LawnHotspot.tsx`, `WorkConfirm.tsx` | 现有流程已通；热点透明度和镜头仍需实际试玩 | **保留并精简** |
| 草坪专项 | `LawnTaskStage.tsx` | 鼠标按下就执行一次 `stroke`，当前单元整块变化 | **替换输入→施工足迹连接** |
| 工具模型 | `MowerTool.tsx` | 两个工具使用同一 `mower.glb`，只改变比例 | **改成两个真正不同 GLB** |
| 草坪视觉 | `WorkCellVisuals.tsx`, `LawnOverviewOverlay.tsx` | 16 个 2m 草坪块整体替换，partial 只是简单外观，不能解释连续切割 | **引入细分局部足迹渲染，状态只保留一份** |
| 规则及保存 | `src/game/work/engine.ts`, `gameStore.ts`, `gardenFixtures.ts` | 有磨损/伤害/存档基础，不适合高频大批量鼠标事件的部分需要小幅适配 | **延用规则，微调动作聚合** |
| 许可证 | `docs/ASSET_MANIFEST.md`, `docs/THIRD_PARTY_NOTICES.md`, `README.md` | 已登记现有资源；新手推机须增补 | **按实际使用增量更新** |
| 用户真实试玩 | `http://localhost:3000` 据 Cursor 报告返回 200 | 只是 HTTP 健康检查；不能证明 WebGL/工具/感受达到要求 | **交付后必须拍图及人工试玩** |

切勿复制一套新商店/全新 job engine。v0.3 主流程以 `yardshift-v03` 保存，旧 `yardshift-v01/02` 不动。若状态结构确实变更，用显式 migration 或安全的 v0.3 schema 修订；不静默擦用户进度。

## 3. 资源选择已锁定（明确区分“网页已核实”与“本地已验证”）

### R1 — 花园：直接复用（已在仓库）
- **Saturday Morning Back Garden**，3DAssets.dev，CC0 1.0；`https://cdn.3dassets.dev/assets/27418/v1/model.glb`。
- 网页约 15 × 20m、37.1k triangles、0 动画；repo 已含本地 GLB；不要求自由漫游、NPC 或整个院子的物理模拟。
- 操作：优先通过节点显示控制保留环境静态对象；所有可施工草坪必须由我们自己可持久更新的局部草坪层替代预先割好的静态片段。

### R2 — 手动滚刀割草机：必须新增实际模型
- **Rusty Push Reel Mower**，CC0 1.0；页面 `https://3dassets.dev/assets/lawn-mowing-simulator-kit-rusty-push-reel-mower-a7e5847b`。
- **GLB 直接地址**：`https://cdn.3dassets.dev/assets/27333/v1/model.glb`。
- 页面公开参数约 **0.675 × 1.024 × 0.836m**；**904 triangles**；动作名 `blade-spin`, `wheel-roll`；轮/刀轴有命名节点。
- 现有 repo **还没有** `manual-reel-mower.glb`。Cursor 首先下载到 `public/assets/models/yardshift-kit/manual-reel-mower.glb`，确认 200、文件魔数 `glTF`、GLTFLoader 读取成功、动画剪辑实际出现及能够运行；记录 SHA-256。不允许仅引用页面信息就报告“模型已集成”。

### R3 — 动力割草机：直接复用 repo 已有 GLB
- **Self-Propelled Mower with Grass Bag**，CC0 1.0；页面 `https://3dassets.dev/assets/lawn-mowing-simulator-kit-self-propelled-mower-with-gr-19515d26`。
- GLB 来源：`https://cdn.3dassets.dev/assets/27334/v1/model.glb`；仓库已有 `mower.glb`；网页尺寸 **0.705 × 1.036 × 1.146m**，`wheel-roll`, `blade-spin`，约 1.5k tris。
- 真正核对本地 GLB 动画名称/作用轴后，用 `useAnimations` 或 `AnimationMixer` 跟随运动状态。静止时轮轴不滚；动力刀片可仅在有效启用时旋转；手推滚刀在实际前进时旋转。
- **关键事实**：这两台模型外形和动力不同，但实物尺寸接近。禁止简单将动力机放大 1.15x、手动机缩小 0.85x 假装产品种类不同。

### R4 — 草叶/切割动效：明确只取可移植的能力
- Paul Robello **Grass Blade**：`https://github.com/paulrobello/grass-blade`（MIT）。
- 已核查它的 `src/game/vegetationFall.ts` 是较独立的“倒伏→消失”数学逻辑；`cutEffects.ts` 接 GameState/TargetState，`createScene.ts` 超大且紧耦合。不引入整个游戏，不复制关卡/积分 UI。
- **首选**：在 YardShift 的 Three.js/R3F 里实现一个轻量 grass-cut footprint，结合已有草坪模型/草叶节点实例，借鉴倒伏/剪屑效果。仅在确有需求时移植 `vegetationFall.ts` 这类可独立文件；若复制具体源代码，要附 MIT 作者与许可全文。没复制代码只看思路，引用参考即可。
- **Konva** 本轮不安装：当前操作必须是真正的 3D 草坪工具运动；2D 遮罩可作为投影到 3D 表面的内部渲染技术，不以纯照片擦除代替工具。

### R5 — 工具卡图片与商业品牌：本轮不增加素材收集成本
- **第一方案**：两台已有授权的 GLB 离屏截图，固定角度/灯光、透明背景，生成统一 256–512px WebP/PNG 缩略图。
- 若离屏缩略图难以稳定自动化，**用 3D 模型预览缩略框/工具简笔标识作为降级**，不能为此阻塞真正割草操作。
- 不直接从零售商或品牌网站下载不明授权产品照片，不使用真实商标。品牌只提供型号原理参考，第一版工具是通用类别。

## 4. 完整玩家流程与最小原创技术

**F1 进入花园**：直接 `/`，完整庭院占主要视野，镜头三分之四俯视，留少量天空，不出现 v0.2 任务面板和收费/租赁 UI。

**F2 发现工作**：鼠标移动到草坪时轻微高亮、指针变化；点击弹「Mow this lawn?」；不使用荧光整块矩形永久覆盖，不引导到第二栋房子。

**F3 进入专项**：镜头切到草坪近景；工具栏只显示 **Manual Reel Mower** 和 **Battery Self-Propelled Mower**；模型/卡片两者外观不同，所选工具真的呈现于地面上。

**F4 操作**：
1. 鼠标 / 触摸按下 **只启动拖动**，如果没有产生超过例如 0.15m 的真实地面位移，不发生割草。
2. Raycast 到草坪工作平面，将 pointer 轨迹分段并做**插值采样**（相邻样本间距不超过当前切割宽度的一半），消除高速移动时的空白洞。
3. 工具实体沿路径移动、朝向有效运动方向；**限制单帧穿越距离**，远距离点击不会瞬移或把中间草一次割光。连续方向改变影响转向；操作期间避免 OrbitControls 与割草 pointer 争抢。
4. 手动滚刀：有效工作宽度约 **0.50m**（游戏可调整，但须和 GLB 视觉接近）、缓慢移动、前进时切割；倒退仅回位或效率很低，轮刀动画跟随真实移动；不使用燃料。
5. 动力机：有效宽度约 **0.65m**，持续运行的动力切割、移动速度更快，允许小范围转向/电量降低；并非 3 倍宽的瞬间擦除。电量耗尽时不能割草，也不能无故造成损坏。
6. 离开草坪/碰到边界时施工足迹停止；正常越过已割草坪不会自动伤草；误碰花卉发生**一次性、可见损伤**；严重重复过切若启用，必须有明确条件与视觉提示。
7. 鼠标放开、blur、pointercancel 必须停下移动与动作；动画与音效同步停下，防止卡住时继续割。

**F5 草坪的状态与视觉（本次核心）**：
- 保持**一个权威的持久草坪状态源**：推荐将 v0.3 的 16 个粗 WorkCell 草坪重构为**可细分、与空间坐标绑定的小区块**（初始建议约 24×16 个小格，最终数量以性能及草坪实际尺寸确定），每小格记录工作进度、损坏，展示层从此派生。不要同时维护一套 WorkCell 完成度和另一套无关图片 mask。
- v0.2 引擎仍服务其他任务；为 v0.3 的草坪加入**批量 sweep action / 差异更新**桥接，避免每个 pointermove 都全量克隆庞大游戏状态；测试同一轨迹分段输入和一次输入的结果近似一致。
- 可视化优先**复用 GLB 的切割前/后草坪资源**：先检查 `lawn-uncut.glb` 是否能分离草簇/草叶并实例化；可分离则批量 InstancedMesh 显示高/低草；若草坪 GLB 是不可局部分割的整块网格，则允许**3D 地面局部 cut-mask + 细草簇实例层**，而不是缩放整个 2m 模型或在每格画一只圆圈。不得为了效果编写大型自定义植被引擎。
- 微区状态至少可区分：`uncut`, `partial`, `cut`, `damaged`。部分施工必须是 **可视区域中的连续真实轨迹**，而非只改数值；瞬间剪屑/倒伏是锦上添花，持续轨迹比粒子数量更优先。
- 工作视图与总览都读取**同一空间状态**，必要时只改变显示精度/LOD，不允许总览假装“全割完”。

**F6 错误**：草坪边缘设可识别的花坛/植物保护区域，工具扫过发生肉眼看得见的局部损伤，退出再进入、浏览器刷新后不恢复；一次触碰只记一次事件。不能为了演示损伤而悄悄把所有边界草格标记成花朵。

**F7 退出/恢复**：左上角小型 `Back to garden`，同一块庭院能看到刚才修过的条纹及损伤；返回再进入不重新开始；刷新页面仍保留；`Reset garden` 必须二次确认，并且只作用于 v0.3 数据。

**F8 界面**：工具选择保持可见、相机稳定、主要区域至少占大部分视口；不显示大块进度/结算卡，不把工具栏挤到页面底部以外。错误消息可以短暂出现，但**画面本身**必须解释所发生的事。

## 5. 实施顺序与停止条件——严格依赖顺序，不能并行乱做

### Gate A（先完成）：资源核验与两机可见
1. 根据 Git 现状从 `feature/v03-lawn-vertical-slice` 新开 `feature/p0-resource-orchestration-lawn`；不要合并、不部署、不改 main。
2. 先下载 R2 手推 GLB，验证文件格式、网格、坐标系、动画 clip；验证 R3 动力 GLB 的实际 clip。输出 `docs/P0_RESOURCE_DECISIONS.md` 记录资产状态、SHA、尺寸、轴、剪辑以及没采用的备选及理由。
3. 在同一个草坪场景中让两种机型分别可见；确认不是简单缩放同一模型。两个模型方向和尺寸自然，车轮/刀轴能够按移动播放。
4. **未通过 A 时禁止开始写新草坪渲染器**；排除资源加载/动画问题，若该 GLB 不可用，先寻找同套 CC0 真实手推模型替代，无法找到才明确记录程序式外观或手动动画降级，不要悄悄恢复“同一模型缩放”。

### Gate B（最高产品价值）：输入→轨迹→草坪结果
1. 接管并修复 `LawnTaskStage.tsx` 的输入：无位移点击不起作用，pointermove 连续采样，捕获释放安全、阻止摄像机抢操作。
2. 统一 v0.3 草坪小区块权威状态并让当前规则引擎接受批处理 sweep，不复制第二套 engine。
3. 做**可观察的连续切割轨迹**；初始→50%→已割草的图像能清楚分辨。
4. 从两个真实模型的前方/运动方向映射有效切割范围；手动/动力的实际路线差异明显，而不是仅加减 workPerStroke。
5. **未通过 B 时禁止投入粒子、音效、更多工具和其他任务**。

### Gate C（因果、恢复、审美）：
1. 草坪一侧设置可见保护性花坛，使用已有合法素材，正常路线上不会无端处罚；电动草坪机误碰花坛会出现可见受损结果。
2. 同一空间状态更新总览（位置与比例必须对应），离开重进/刷新保持。
3. 调整庭院视角与 UI，避免大面积空天空和工具栏落在屏外；再按必要性做轻量粒子、草叶倒伏和简短音效。
4. 由已授权 GLB 生成工具卡视觉，若实现成本明显高于价值可降级。
5. 记录截图：初始、局部施工、受损、返回总览；保存可复现步骤与 `npm run typecheck && npm run lint && npm run test && npm run build` 结果。

**停止条件**：A→B→C 依次通过后立即交付给主人试玩；不进入绿篱、花坛、落叶、第二关、商店、现实品牌图搜集。不要为追求完美截图进行无止境美术修改。

## 6. 验收标准（工程自动与人工体验必须区分）

### 自动测试必须覆盖
- 手动/动力机工具 profile 对应**不同 GLB URL**，不是同一个模型不同 scale；资源 load 失败清晰降级。
- 静止点击无割草进度、无设备磨损、无刀轴转动；拖动 2m 产生一条与路径相符的施工带，不自动改变远端草。
- 大距离 pointer 跳跃不清空整片草坪；采样间距满足路径连续性且不穿越界限。
- 手推机后退时不出现与前进完全相同的施工率；动力机电量 0 不产生有效切割，也不触发虚假机械损害。
- 重复经过已割区域不会默认生成伤草；误碰花卉事件只发生一次并持久保存。
- 从庭院退出、重进、刷新后**相同坐标**的割草状态与伤害仍存在；总览与专项一致。
- 所有新增资源 provenance、许可、校验值在文件中可核对。
- 现有 v0.2 专项规则不回归；typecheck、lint、测试、build 完整通过。

### 人工视觉验收（不能拿单元测试代替）
1. 打开 `/` 能看到完整住宅庭院，操作区不被 UI 或天空抢占；点击草坪进入专项。
2. 人能从视觉**直接**认出手推滚刀与动力机；两台机器实际随拖动工作，车轮/刀轴运动自然。
3. 操作 10–20 秒出现可辨的、与路径对应的局部割草轨迹；静止点击没有神奇割草。
4. 玩家切换两机能讲出至少一种**操作上的差异**，不是文字面板说它们不同。
5. 花坛附近故意误操作，出现局部可辨认的损伤，返回总览后仍然存在。
6. 摄像机、拖动输入和工具栏不互相抢控制；无大面积天蓝空白；演示电脑至少稳定可交互，目标参考帧率 ≥30 FPS（在实际设备上测量）。
7. `Back to garden`、重进、刷新保持同一结果；不需要先租赁工具或者通关第一关。

### 交付证据
- `docs/P0_RESOURCE_DECISIONS.md`：来源、作者、许可、网页证据、真正已下载/渲染/动画状态、SHA256、被否决资源及原因。
- `docs/P0_DEMO_QA.md`：测试命令结果、2 分钟人工复现路线、图像路径（初始/局部/错误/返回）及剩余主观待测。
- `README.md` `Assets & Credits`；`docs/ASSET_MANIFEST.md`；`docs/THIRD_PARTY_NOTICES.md` 同步本次**实际使用**的素材，明确 Grass Blade 仅参考或已复制哪一文件；复制 MIT 代码要保留完整许可。
- 远程功能分支名称、提交 SHA、推送结果；不合并 `main`。

## 7. 下一阶段只保留规划，不进入开发

- **P1 绿篱**：已修齐 `hedge-block.glb` 作修剪后底座；杂乱枝叶需独立可剪对象；`garden-shears` 精细离散剪 vs `hedge-trimmer` 连续剪；显示错误缺口。
- **P2 花坛**：独立花/草对象 + `dandelion.glb`；手工拔根 vs 打草机留草茬，保护目标受损；禁止把整块花床做成不可拆模型。
- **P2 落叶**：已有耙、吹叶、袋模型；从授权素材生成分散叶片、聚成堆、装袋；吹动方向真实参与操作，不用定向常量。
- **P3 品牌 / 经济 / 多院子**：暂缓，成本不与核心体验相符。

---

## 8. 给 Cursor 的首条操作指令（可直接复制）

> Read the attached `YARDSHIFT_P0_CURSOR_EXECUTION_ORDER.md` as the authoritative P0 execution specification. The existing project is `Chen-wsnd/yardshift-3d`, starting at `feature/v03-lawn-vertical-slice` (verified SHA `c10772d613e590c05b5488327145f820b2958668`). Do not restart the project. Create a new feature branch named `feature/p0-resource-orchestration-lawn` and implement **Gate A → Gate B → Gate C in that order**. Use the exact CC0 GLBs and proven repo paths in the specification, perform asset and animation validation before visual coding, preserve one authoritative lawn state, use genuine spatial continuous mowing input, and document all provenance and legal notices. Do not create another residence or economy UI and do not start hedge/flower/leaves. Run tests/typecheck/lint/build, capture four deterministic gameplay screenshots, commit and push only the feature branch (never merge or deploy). Report actual failures and unknowns honestly. Stop and hand the playable P0 build to the product owner for human acceptance.

### 明确的信息边界
- 我已核实网页描述、许可证、当前 repo 目录与关键实现代码；**未**亲自在用户电脑上游玩 `localhost:3000`。
- 我当前工作环境无法下载新 GLB 二进制（网络 DNS 不通）；手推模型实际文件、动画和适配效果必须由 Cursor 在本地执行时核实。任何下载失败须在 `P0_RESOURCE_DECISIONS.md` 标注，绝不能虚构成功。
