# YardShift v0.6 — 资源 / 场景 / 实施细则与中断恢复补充执行文件

> **文件用途**：直接交给 Cursor，接续 `feature/v06-yardshift-full-experience` 本地未提交工作，完成 V06 的 M7，修复真实的跨流程缺口，并交付可玩的完整版本。
>
> **严格的权威关系**：`docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` 仍是唯一**产品与体验总规范**（L0→L6、F01→F09、M0→M7）。本文件只补**恢复方法、代码定位、场景坐标测量、资源调配、实际验收和交付步骤**，不取代或改写 V06，也不授权新的玩法方向。两份文件不一致时，产品意图和用户体验以 V06 为准；本地恢复及验收执行以本补充文件较具体的规定为准。如遇真实不可逆冲突，再报告，不自行推翻上层。
>
> **证据边界（2026-11-22）**：远程 GitHub 经核实，最近可访问的分支 `feature/p0-resource-orchestration-lawn` HEAD 为 `cc5853fce6b886e3474060c37d40d02e183e2a4d`；截至核查时，远程不存在 `feature/v06-yardshift-full-experience`。以下 M0–M6 已写完、71 tests passed、构建绿灯、工作区未提交等，均是**用户转述的 Cursor 中断报告**，不是我通过远程仓库独立核验的事实。Cursor 必须在本机恢复并验证，不能把报告直接当成已验收。

---

## A. 绝不能被细节改写的产品目标

产品不是四个独立的园艺小游戏，也不是以设备数量、金币或画面特效为中心的割草游戏。让玩家通过一次完整的庭院整理，**观察现场 → 思考先后 → 准备和选择工具 → 实际施工 → 面对后果与返工 → 复盘专业工作方法**，理解工具的设计目的、优势、限制和工作之间的依赖关系。

* **L0 不变**：学习有经验的园丁如何组织整个工作，而不是单纯完成动作。
* **L1 不变**：用户可自由选择顺序；安全的局部限制可以存在，不得把专家范例硬编码成唯一正确路线。
* **L2 不变**：世界有因果关系；篱笆修剪后出现可见枝叶，清理后的区域可以再次弄脏；充电、磨损与作业计划有实际后果。
* **L3 不变**：所有专项共享**一个可保存的世界**，位置、状态、工具选择、有效劳动和返工相互一致。
* **L4–L6 服从上面**：GLB、mesh、Shader、照片、UI、代码模块是工具。如果用代理模型仍能清楚传达因果，就可以先完成交付；如果代理模型让玩家根本分不清对象，则必须修到可辨认。

**防陷阱规则**：每个视觉难点最多做一次成熟素材替换与一次轻量修整；如再改仍不能明显提升玩家识别或操作，则记录 Backlog 并前进。只有核心可玩性、跨任务因果、数据安全或合法性受损才是硬阻塞。

---

## B. 重启后的第一件事：抢救本地 M0–M6，不重新开发

**依次执行，先记录真实结果，不要先清缓存、拉分支、更新依赖或运行代码生成器。**

### B1. 确认环境和未提交代码

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git log -5 --oneline --decorate
git status --short --untracked-files=all
git diff --stat
git diff --check
git ls-files --others --exclude-standard
```

* 应处于 `feature/v06-yardshift-full-experience`；若不是，**先查明**本地变更属于哪个分支，不得为满足文件字面要求强行 `git checkout -f` / `switch -f`。
* 对照中断报告查找 `src/game/garden/*`、`src/data/gardenTasks.ts`（实际文件名以本地为准）、各专项 `*TaskStage`、热点与 overlays、Plan/Review、测试、执行日志。逐项标记 `PRESENT / MISSING / MODIFIED`。
* **禁止** `git reset --hard`、`git clean -fd`、覆盖工作目录、无条件 `git pull --rebase`、删除 localStorage；禁止误加 `.env*`、令牌、截图中的私密信息、浏览器 Profile 到 Git。
* 如果代码真的丢了，先查 Cursor 本地 history、Git reflog、编辑器 Local History、已有缓存/备份；**不要假设已在远端并重新写六个阶段**。定位不回来才报告真正数据丢失阻塞。

### B2. 建立非破坏备份和恢复检查点

1. 在仓库外保存当前修改补丁（例如 `git diff --binary > ../yardshift-v06-recovery.patch`），另把**未跟踪的源码/测试/文档**存入仓库外的恢复备份；该补丁本身不包含 untracked 文件，不能只备份它。排除依赖目录、密钥和大缓存。备份路径只供本地恢复，不必上传。
2. 审核 `git status`、`git diff` 和未跟踪文件内容，明确哪些是源码/文档/测试、哪些是临时文件或私密内容；按受控路径 `git add <reviewed-files...>`，**不要不检查就 `git add -A`**。
3. 立即创建一个真实的、诚实命名的恢复检查点，例如 `wip(v06): checkpoint recovered M0-M6 implementation`。即使此时 UI 尚未最终验收，也允许 WIP 提交；**不要虚报 M0–M6 已通过实际浏览器验收**。
4. 在开发分支记录 checkpoint SHA、文件统计和代码基线，写入 `docs/V06_EXECUTION_LOG.md`。这一步完成之后才继续改代码。
5. 如果 Git hooks 或类型错误阻止提交，先保存可靠的本地备份并修到可提交；不以跳过安全检查掩盖真实错误。

### B3. 核验中断报告，而不是重复实现

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

* 记录真实通过/失败结果和测试总数，不要盲用过去的 `71 passed`；如数目变化，解释新增/跳过/删除的测试。
* 有错误时先定位首次回归并修复，**不要将 M0–M6 整体重写**。
* 列出每项实际模块的最小证明：M0 recharge；M1 domain/scene；M2 hedge/debris；M3 leaf movement/bag/rework；M4 inspect/hazard/plan；M5 weeds/edges；M6 review/effort。检查“状态规则、真实可见渲染、用户操作入口”三者是否同时存在，缺一个就只能记 `PARTIAL`。
* 这些都是**回归审查**，不是要求重新设计 V06。

---

## C. 资源与代码的精确定位表：先用什么，放在何处，怎样衔接

### C1. 已核实存在于 P0 远程仓库的资源

以下路径在 P0 GitHub 已确认，V06 本地新文件仍须重启后核对实际路径。

| 功能 | 资源与许可 | 现有仓库路径 / 位置 | 当前应怎样使用 | 不要这样做 |
|---|---|---|---|---|
| 完整院景 | Saturday Morning Back Garden，CC0，https://3dassets.dev/assets/lawn-mowing-simulator-kit-saturday-morni-9591d235-starter-scene | `public/assets/models/yardshift-kit/saturday-morning-back-garden.glb`，`src/features/garden/SaturdayGardenModel.tsx` | 院景视觉主底图；保留建筑、花坛、绿篱、走道等可辨场景；独立 overlay 管动态对象 | 重建另一栋房子 / 将静态整院 GLB 当成可任意修剪网格 |
| GLB 层级名称 | 现场模型导出的节点名单 | `docs/gate0-garden-node-dump.json` | 找对真实节点后在运行时计算 world bounds | 它只有 nodeNames，不含准确世界坐标，不能直接当成定位文件 |
| 割草工作网格 | P0 自有 TypeScript，384 格 | `src/data/lawnGrid.ts`, `src/game/work/lawnSweep.ts`, `src/features/garden/LawnFootprintLayer.tsx` | 保留唯一权威状态；允许仅替换视觉表现层 | 再建立另一套 lawn progress 改写权威 |
| 手推滚刀 | CC0 Rusty Push Reel Mower | `public/assets/models/yardshift-kit/manual-reel-mower.glb`，`src/features/garden/MowerTool.tsx` | `wheel-roll`, `blade-spin` 按前进运动驱动 | 只用另一台机的缩放假装手推机 |
| 电动割草机 | CC0 Self-Propelled Mower with Bag | `public/assets/models/yardshift-kit/mower.glb`，`src/features/garden/MowerTool.tsx` | 独立轮刀动画；按真实位移累计能源；电池耗尽可恢复 | 伪造充电成功、无电仍切草、重复扣电 |
| 完成/未完成草面 | CC0 Lawn Mowing Simulator Kit | `lawn-cut.glb`, `lawn-uncut.glb`，另有 `public/assets/textures/grass/*` 的 ambientCG CC0 Grass001 | 可做远景/装饰/平滑过渡参考，近景保留 P0 空间状态 | 用整个 tile 瞬间切换替代连续轨迹 |
| 绿篱 | 同套 CC0 模型 | `hedge-block.glb`；静态场景自身也含 hedge 节点 | 修好后的底座、独立过长枝簇 overlay | 整段 green cube 缩小作为唯一割断反馈 |
| 修篱工具 | CC0 | `garden-shears.glb`, `hedge-trimmer.glb` | 选取手剪局部作用、动力剪大范围作用；可见轨迹并与枝簇反应耦合 | 同一动画/同一覆盖参数只换按钮名 |
| 花坛、杂草 | CC0 | `dandelion.glb`, `flower-bed-border.glb` | 独立杂草 ID、根/顶分离，保护花有不同状态 | 截顶当拔根；整块地一键消失 |
| 修边 | CC0 | `string-trimmer.glb`，P0 已有路径采样可提取 | 边缘的局部 strip，工具与花坛/围栏碰撞边界有意义 | 用大草坪完成率代替修边结果 |
| 清扫 | CC0 | `leaf-rake.glb`, `leaf-blower.glb`, `grass-bag.glb` | 耙/吹按方向移动碎屑，聚堆后在近距离装袋 | 全屏点一次就清空、没有落地变化 |
| 资源追踪 | 工程文档 | `docs/ASSET_MANIFEST.md`, `docs/THIRD_PARTY_NOTICES.md`, `src/features/yard/assets/modelCatalog.ts` | 增量记录真实使用范围、来源、适配、退路；更新过时描述 | 把研究过的 MIT/CC0 候选写成已经导入 |

**P0 已存在的其他连接入口**：`src/features/garden/GardenShell.tsx`（页面层）、`GardenCanvas.tsx`（R3F Canvas）、`GardenOverviewScene.tsx`（场景树）、`LawnOverviewOverlay.tsx`（草坪总览）、`src/game/store/gameStore.ts`（Zustand Persist）、`src/game/work/types.ts`、`src/data/equipmentProfiles.ts`、`src/game/rules/durabilityRules.ts`。V06 新增的 GardenDomain、Plan、Review、TaskStage 继续落在它们之上，不得创建彼此竞争的新权威。

### C2. 候选外部资源的真实定位与取舍

| 缺口 / 候选 | 具体链接 | 调度方式 | 使用边界及回退 |
|---|---|---|---|
| 可用叶堆/落叶造型 | https://3dassets.dev/packs/turning-seasons | 先查具体模型、GLB 内容、许可证、尺寸；必要时只抽取叶片/叶堆表面用于视觉适配 | 尚非已导入；若不值得下载或造型不匹配，使用轻量 instanced leaves/sprites，保留世界粒子 ID |
| 障碍物/自然道具补足 | https://kenney.nl/assets/nature-kit | 按需要选择少量可辨认石块、枝条模型 | 本院景 node 名单未见显式 rock/stone，不能声称原院景已提供石头；如取用须记录具体来源和许可 |
| 草叶倒伏/碎屑机制 | https://github.com/paulrobello/grass-blade，特别 `src/game/vegetationFall.ts`, `src/game/cutEffects.ts` | 优先参考或可证实的独立 EXTRACT，而不是整套复制；如果适配成本高，用本地轻量效果适配层 | MIT 代码如果真正复制，保留原 copyright + license；若只参考理念，必须写明 `REFER_ONLY` |
| 2D 操作候选 | https://github.com/konvajs/konva | 仅当任务局部真正需要 2D Canvas 且优于现有 3D 操作时采用 | 不能因为成熟就硬塞第二个渲染框架 |
| 工具选择图 | 已获许可的本地 GLB | 离屏渲染成透明背景 WebP/PNG，与可见 3D 工具保持一致 | 第一版文字/简易卡片可用，禁止未经许可抠商家产品照直接发布 |
| 园艺工具知识 | 设备原理与真实手册仅作校准参考 | 只提炼适用场景与限制，数值是游戏模型值 | 不冒充厂商真实规格；不把游戏变成现实危险设备的具体操作指导 |

**选型的停止条件**：同一缺口最多比较两个成熟候选与一个内部降级实现。能满足玩家辨识与因果即可继续，不要在 M7 开启无边界素材搜集。

---

## D. 场景精确摆放：必须从模型测量，不允许凭空编坐标

### D1. 现有事实和缺失事实

* `docs/gate0-garden-node-dump.json` 经远程确认仅有 `nodeCount=636`, `meshCount=284`, `materialNames`, `nodeNames` 四项；**不存在物体的真实 world position/bounds 数据**。
* 该名单明确有：`049-hedge-block-2m` 至 `061-hedge-block-2m`、`062-hedge-corner`/`063-hedge-corner`；`064-path-slab` 至 `078-path-slab`；`090-wheelie-bin`, `091-wheelie-bin`, `094-compost-bin`；`111-dandelion-clump` 至 `114-dandelion-clump`；`115-flower-bed-border-piece`/`116-flower-bed-border-piece`；`118-garden-shed`；`128-small-greenhouse`。这些是**源节点名称，不是坐标**。
* P0 `LAWN_FINE` 的模拟草坪区域是 `originX=-5, originZ=-4, width=10, depth=8`，细格 `24 × 16`，它也是**当时的模拟区域定义**，不能凭这四个值认定静态 GLB 所有新任务都已经与模型精确对齐。

### D2. Cursor 必须生成真正的定位表（这是具体工程任务）

运行时或离线用现有 Three.js/GLTFLoader 对本仓库的 `saturday-morning-back-garden.glb` 完成：

1. 载入 **实际** GLB，确认可能存在的根节点缩放、旋转和相机组变换；对所选顶层语义节点使用 `updateWorldMatrix(true, true)` 和 `THREE.Box3().setFromObject(node)`，记录世界坐标 `min/max/center/size`，另记录场景坐标原点与 ground Y。不能只拿局部 `node.position` 当作整个世界的真实坐标。
2. 对同名复制的 hedge/path/lawn 节点按完整节点名排序并聚簇，用相邻空间分组判定实际连续绿篱带、花坛边界、走道；必要时参考现成模型的世界邻接关系，选择**最容易辨认且无严重遮挡**的一条绿篱作为可操作对象。
3. 以独立测得的范围生成统一 `AreaPlacement` / `GardenTaskRegistry`（具体类型名可按现有代码适配）：`id, sourceNodeNames[], worldBounds, anchorWorld, taskLocalToWorld, cameraPosition, cameraTarget, overlayRoot, pickupPoint`。所有热点、TaskStage、施工结果、碎屑位置都从此表派生，不允许每个组件单独手写一套位置。
4. 保存实际测得的数据到 `docs/v06-scene-placement-audit.json`，附上复现脚本/方法（如 `scripts/inspectGardenScene.*`）。记录是**真实量测**还是**人工适配偏移**，不要把调参结果谎称 GLB 原始坐标。
5. 再写一个简短 `docs/v06-scene-placement-map.md`：每个区域的来源节点、实际 center/size、玩家能看到的实体、局部坐标转换、热点大小、镜头、遗留错位风险和对应截图。这个文件是实施证据，**不是第二套产品规范**。
6. 用一个只在 development 或 QA 显示的调试 overlay（不同色半透明 bounds/中心点标签）截一张 `docs/v06-evidence/scene-registration-debug.png`；正式默认关闭。检查入口与可见模型的视觉重合，不只验证 math tests。

参考代码（伪代码，可调整成项目的实际 helper）：

```ts
import * as THREE from 'three';

root.updateWorldMatrix(true, true);
const bounds = new THREE.Box3().setFromObject(targetNode, true);
const center = bounds.getCenter(new THREE.Vector3());
const size = bounds.getSize(new THREE.Vector3());
// 如果 task stage 单独建立了本地坐标，要将世界点通过逆矩阵转换。
const toTaskLocal = taskLocalToWorld.clone().invert();
const localPoint = worldPoint.clone().applyMatrix4(toTaskLocal);
// 保存 full source node path + world bounds + manual offset provenance。
```

**注意**：静态院景里的部分 lawn tile / NPC 在当前 `src/data/gardenScene.ts` 中会被 hide。针对被隐藏的物件，不应创建玩家可以操作但看不见实体的热点。对于无法直接拆成独立可剪枝的 hedge GLB，保留真实 hedge 基座并用邻近的**独立枝簇 overlay**表示可修剪部分。

### D3. 各区域“放哪里”的具体原则

| 区域 | 实际定位依据 | 可交互/效果的位置规则 | 目测验收 |
|---|---|---|---|
| lawn | P0 lawn work grid + 场景真实 lawn tile bounds | 记录当年 P0 root-to-world 对齐差值；同一 source cell 的 overview/task 位置必须通过明确 transform 相连 | 经过的草带和总览变短的草带是同一块，不漂移 |
| hedge | `049–063` hedge nodes 按**世界位置**选连续一段 | 枝簇中心要落在 hedge 外轮廓附近；掉落碎屑 world XZ 投影在相邻地面；Y 用地面 raycast 或实测 | 剪某个枝簇，下方真的出现枝叶，转回总览位置一致 |
| flowerbed | `115/116` flower-bed-border-piece + `111–114` dandelion bounds | 独立 plantId 和 visible instance 1:1；花朵保护区域与杂草模型不重叠 | 拔除对应植物，不出现远处其他花朵消失 |
| edge | `064–078` path + fence nodes, 与 lawn/hedge 的交界 | 以实测边界/折线定义局部窄带，不复用全部 lawn 作为“边缘” | 从俯视看，大机完成后真实留下有限边缘待处理 |
| debris | 实际 leaf/debris world position 或其 sourceActionId 生成点 | 每一簇依事件来源定位；吹/耙改变世界坐标；装袋只清理附近 pile | 先清后修产生新的碎屑，不能由全局计数假装 |
| hazard | 有许可、可见的小石块/硬枝 overlay；不能假设院景自带 | 仅有限局部 hazard bounds 与受限工具交集阻挡，移除后模型消失 | 位置合理、能被看见、检查和移除，不会死锁 |
| equipment/prep | 既有 shed / patio 附近选一处清晰位置，可用图标/简易台 | 充电/工具准备状态与 Tool Registry 同源；恢复不影响庭院施工进度 | 能找得到恢复入口，玩家理解“预备工具”与“返工”不同 |

**禁止“看似精确”的虚构**：未重新运行真实 GLB 分析前，除了上面明确引用的 P0 `LAWN_FINE`，不要凭空填入 hedge center `(6,0,-3)`、flower center `(4,0,3)` 等猜测常量并称为已验证位置。

---

## E. M0–M6 成果的整合审查：不是重新写，而是修断点

这张表必须在本地真实浏览器中逐项点通。Cursor 先搜文件名和导出函数，再核对运行时行为。新模块以本地实际路径为准。每项通过记录 `Code / UI / Visual / Persist / Learning` 五项证据；缺哪项仅修哪项。

| 进度报告阶段 | 现在重点核对的断点 | 对应原有资源/实现 | 不符合时的最小修补 |
|---|---|---|---|
| M0 能源与维护 | Battery 0 后能通过可见入口 Recharge；禁止旧余额检查卡死；充电不修 jam/broken；移动耗电不依采样频率重复扣 | `gameStore`, `durabilityRules`, `lawnSweep`, Shell | 给 `garden` 模式独立免费充电命令/简短准备投入；保留 v02 economics，检验 tool status |
| M1 世界/热点 | 同一主庭院，所有节点和 overlay 位置一致；事件 stable id；刷新后状态不重置 | GardenDomain、`gardenTasks`、GLB + `GardenOverviewScene` | 用 D 节 placement mapping 替换散落的硬编码坐标；修 idempotence |
| M2 篱笆 | 独立枝簇有未修/已修/过切可辨状态；每剪一次仅生一组落地碎屑 | `hedge-block`, `garden-shears`, `hedge-trimmer` | 以合法 overlay 细化形状，仅调整视觉适配器，不动事件因果 |
| M3 清理 | 耙/吹方向改变真实叶片位置；聚堆后近距离装袋；新剪枝使已清干净处重新变脏 | `leaf-rake`, `leaf-blower`, `grass-bag` | 修 world position 与 source event，不能以全场删除或固定 rework penalty 掩盖 |
| M4 检查计划 | Inspect 可发现/移除硬障碍；Plan 可改变但不强制施工顺序 | 既有 inspect/tool labels + GardenDomain | 补明显的入口与教学一句话；障碍只局部限制、不可死锁 |
| M5 花坛/边缘 | 拔根 vs 截顶可见不同；保护花误伤能识别；edge 独立于 lawn completion | `dandelion`, `flower-bed-border`, `string-trimmer`, P0 sweep | 移除通用 lawn cell 与边缘共权威造成的覆盖冲突，必要时轻薄专用 edge mask |
| M6 复盘 | 清完后修篱产生返工，由真实操作/事件累计；同等安全质量下比较效率；不能凭 Plan 顺序惩罚 | existing selectors + GardenDomain events + review | 修 selector 与因果事件来源，不先做更漂亮图表 |

### E1. 最高优先的产品演示：两个不同的施工顺序

准备同条件的**独立测试存档/浏览器上下文**，不是让用户真的清除个人存档：

- **顺序 A（集中清理）**：观察并清走局部硬障碍 → 修篱 → 割草与边缘/花坛 → 集中清理 → 结束。
- **顺序 B（产生返工）**：观察并清走局部硬障碍 → 清理同一处地面 → 修篱 → 地面被新碎屑弄脏 → 再次清理 → 结束。

A 和 B 应能达到相似的工作完成度和质量，但 B 在真实工作路径上确实多出至少一次重复清理（可显示 reworkEffort/动作数差异）。该差异必须来自 `sourceActionId`、实际移动与清理事件，**不得只因 B 的 TaskOrder 字符串不同就扣分**。若玩家跳过某些安全检查，条件不一样，则不能误把危险捷径评为最高效率。

### E2. 工具学习的“操作内展示”而非另写长教程

每种工具至少在对应任务 UI 提供三句简洁信息，优先复用已有配置而不是新建图书馆：

1. **设计用途**：例如 “Reel mower: 用前进的滚刀对草坪进行窄幅切割”；“Leaf blower: 将可移动碎屑集中到指定方向”。
2. **优势与边界**：例如 “动力机开阔地快，但边缘/花坛旁更难精细处理”；“线割机可切顶部，但不等于拔掉根”。
3. **操作结果与建议**：在第一次明显失误、耗电或返工发生时，提示其直接原因，而非弹出固定的正确答案。

需要对应可感受到的机制，**不能只有三句文案而使用后毫无差异**。实际品牌产品照片若无许可，只作内部参考；工具卡优先由现成 CC0 GLB 生成图或暂用准确的工具名称。

---

## F. M7 不是“截四张图”，是确保整个产品真正能连贯体验

### F0. 首先复核所有入口

* 运行真实本地应用：`npm run dev`，确认服务使用的**实际代码 HEAD**及端口；已有 :3000 进程时先查 `lsof -i :3000` / PID 对应工作目录，防止误看旧服务器。不要仅用 HTTP 200 作为功能通过。
* 使用独立 browser test profile 或测试环境保存，避免覆盖用户本人存档。测试可调用已有 `window.__yardshift` 调试方法，但**仅在确认对象真的存在且为测试辅助时**使用，不能凭空调用；生产 UI 应不依赖调试接口才能玩。
* 从首页 `/` 按真实玩家路径完成入口、操作、返回、刷新。记录 browser console error、failed network request、React hydration 错误、R3F load/animation 问题。

### F1. 验收图片和操作脚本（全部真实浏览器截取）

**建议至少 12 张；只要能证明完整主线，可以适度合并，但不得用单元测试、静态空白截图或 AI 绘图代替。** 路径 `docs/v06-evidence/`：

| 编号与文件名 | 必须证明什么 | 典型动作 |
|---|---|---|
| `01-overview-initial.png` | 完整院景、可辨区域和可进入的主流程 | 打开 `/`、检查角度与负空间 |
| `02-inspect-hazard.png` | 可见风险、检查、移除入口 | 观察石块/硬枝，再展示解决路径 |
| `03-plan-and-tools.png` | 计划可选、工具知识和区别可见 | 改顺序，选择两种工具 |
| `04-lawn-reel-cut.png` | 手推机、窄幅连续切割及视觉轨迹 | 稳定前进约 2m |
| `05-lawn-powered-recharge.png` | 动力机宽幅/电量、0 电可恢复 | 在测试状态制造电量耗尽→充电→续做 |
| `06-hedge-partial-clippings.png` | 绿篱局部剪除、落地枝叶与模型位置关系 | 先剪一部分，查看相邻地面 |
| `07-debris-gathered.png` | 耙/吹后的实际方向聚集 | 操作两种工具、聚堆 |
| `08-debris-bagged.png` | pile 附近可装袋，地面真实变干净 | 装袋后查看原位置 |
| `09-clean-then-hedge-rework.png` | 先清地后修篱又脏，是玩家能亲自看到的后果 | 另一测试存档走 B 路线 |
| `10-flowerbed-root-vs-top.png` | 花坛拔根/截顶/保护花区分 | 使用不同工具分别处理植株 |
| `11-edge-trim.png` | 大机无法包办边缘，细部工具能完成 | 完成草坪主要部分后修边 |
| `12-work-review-comparison.png` | 同质量下 A/B 投入与返工差异，真实事件原因 | 复盘对照 |
| `13-overview-after-refresh.png`（建议） | 所有实际位置与状态在总览刷新后仍一致 | 返回、刷新、不丢状态 |
| `scene-registration-debug.png`（仅 QA） | 真实节点 bounds、热点与模型重合 | 临时打开调试 overlay |

每张截图附短文字：浏览器操作步骤、任务 ID、关键状态值或事件 ID、对应 Git HEAD；不需要为取证额外建立巨大 UI。若屏幕截图无法证明动画，补一个简短本地运行录屏或 Playwright 行为日志。不要把模拟图放进实际 QA 目录。

### F2. 做“能理解的视觉”，不做无穷美术打磨

M7 最小视觉要求：

1. **一个整体花园**：可见场景充实，非大面积空天空或漂浮的工作格。正交/透视相机可以简化，但不能遮挡目标或导致玩家不知道自己在哪。
2. **工具可辨**：能认出手动与动力割草机、手剪与绿篱剪、耙与吹叶机；至少在名称+轮廓+运动/操作上不同。
3. **工作对象可辨**：草坪是草坪、绿篱是绿篱、杂草是杂草、叶子和枝叶是可移动碎屑。若代理球/方块使玩家分不清，优先从已许可模型、grass/leaf sprite/instances 替换视觉适配层。
4. **状态变化可辨**：修过与未修、拔根与截顶、已清与返工、损坏与正常能被肉眼分辨。
5. **同址反馈**：所做工作在任务 Stage 与 Garden Overview 中是同一位置，没有隐形的离散小世界。

优化从使用体验最严重的缺口开始：`position/alignment → scale/orientation → visibility/state feedback → lighting/camera → optional effects`。一项 cosmetic 的两轮有效尝试仍不改善玩家辨识度，停止打磨并记入 backlog。不要新增长达几周的物理引擎、制作第二个庭院或采购商业模型。

### F3. Browser QA 的真实判定

| 类型 | 例子 | 处理 |
|---|---|---|
| **阻断** | 进入某个任务白屏、Recharge 不可达、工作不反映回园、事件重复刷碎屑、清理无法装袋或再脏、旧存档被清空、核心资源有许可证问题 | 必须修，修后重跑相关链路 |
| **严重可用性** | 热点经常点不中或完全不在物体上、工具不可辨、看不出剪枝掉到哪里、Review 只是假造数字 | 优先少量修正到可操作可理解；不以美术为由绕开 |
| **非阻断** | 局部 proxy mesh 仍可改得更漂亮、花草细节不够丰富、草叶风摆不够自然、缺少多种品牌、偶尔轻微别扭动画 | 记录优先级，不挡最终交付 |

### F4. 性能与移动端

* 以实际浏览器性能记录场景是否能稳定输入和渲染；有测量工具时报告 FPS、长任务时延或尖峰，但**不能假定已经达到 30 FPS**。
* 如果移动端不是当前承诺主平台，只需记录基本布局与触摸支持的现状；不要为它推倒桌面演示。适配是否阻断按 V06 交付目标决定。
* 使用已有 R3F/Three.js 工具，优先实例化、分组、对象复用，避免鼠标每个采样触发大规模 React rerender / localStorage 深拷贝。

---

## G. 代码整合、测试与来源的完成检查单

### G1. 维护一个单一数据与资源目录

* 所有新区域 ID 与定位统一进入已有/新建的 `GardenTaskRegistry`（按本地实际路径）；Tool Registry 必须映射到真实 modelCatalog 文件路径及权威工具能力参数。
* GardenDomain 对特定事件的 `appliedEventIds`、debris ID、sourceActionId、origin/position、任务区域等保持可追踪，事件幂等。
* UI 不持有无法从 Domain 推导的另一份“已清理/已剪完/已拔根”状态；Scene Stage 不得同时写一份状态、Overview 写第二份状态。
* 回归 `yardshift-v03` 的部分施工/损伤/电量存档（迁移时保持）；`yardshift-v02` legacy 持久化键不得被破坏。测试个人存档时不得直接 Reset。

### G2. 具体测试矩阵（按现有 Vitest 测试添加而非重造）

1. `snapshot-restore-and-no-data-loss`: 新旧存档升级不丢 P0 已割草与花坛损伤。
2. `charging-no-balance-lock`: garden 模式电量 0 → Recharge → 可继续；旧经济模式收费语义保持。
3. `battery-no-double-charge`: 不同采样细分的等长路径消耗一致性。
4. `region-placement-invariant`: 世界坐标转换，植物/篱笆等 source nodes 与 overlays spatial overlap。
5. `one-source-one-debris-event`: 重发同一个剪枝 event 不能产生第二份垃圾。
6. `hedge-clean-then-redirty`: 同一片地清完后修剪能够再次产生垃圾。
7. `rake-vs-blower-vectors`: 相同树叶、相同操作，作用范围/方向不同。
8. `bag-locality`: 远距离/未聚堆/不对应 pile 时不能清掉全园。
9. `plant-root-vs-top`: 线割机只截顶，手动除草器拔根，保护花不等价。
10. `plan-not-authoritative`: Plan 顺序与玩家实际顺序可不同，未计划照样可玩。
11. `review-derived-from-actual-events`: A/B 真实动作数不同且无硬编码顺序惩罚。
12. `cross-zone-visual-persistence`: 状态保存后 overview/task 同位置同对象。

测试并不取代浏览器实证。每修一个 blocker 增加最小回归测试；不要为提高测试计数盲目新建空测试。

### G3. 更新哪些现有文档，而不是持续新建“权威计划”

* `docs/V06_EXECUTION_LOG.md`：记录中断恢复 checkpoint SHA、M0–M6 真实测试状态、M7 验收、每阶段状态、失败及修复日志、最终 SHA 与运行命令。
* `docs/ASSET_MANIFEST.md`：将实际导入/引用的 GLB、图片、代码、音频逐个标记 `IN_REPO / ACTUALLY_USED / REFER_ONLY / CANDIDATE`，更新已有过时描述，例如 P0 已不是同一割草机缩放两次。
* `docs/THIRD_PARTY_NOTICES.md`：CC0 / MIT 实际使用情况与必要的 notices；禁止把“看过某 repo”写成“拿了它的代码”。
* `docs/v06-scene-placement-audit.json` / `docs/v06-scene-placement-map.md`：真实空间审计结果，至少一张 debug 图。
* `docs/v06-evidence/`：真实的浏览器验收图片，附复现步骤。
* `README.md`：本地运行、当前可玩流程、没有实现的已知限制、Credits。不得虚构用户机器上一切运行良好。

### G4. Git 收尾顺序

1. B 节完成安全 checkpoint，**不要因为截图库尚未完成就让六个阶段的代码再次处于未提交状态**。
2. 根据 E/F 发现的**主线阻断**问题少量修正，每个修复做描述明确的提交；不用为每个 CSS 间距开 commit。
3. 实际截图、空间审计、执行日志、素材清单、README 提交到**当前 V06 feature branch**。
4. 再运行 `npm run typecheck && npm run lint && npm run test && npm run build`；记录最终命令、测试数、失败和真实环境。
5. 再看 `git status --short`，检查敏感信息、巨大二进制和截图真实性。对 `feature/v06-yardshift-full-experience` 执行 `git push -u origin feature/v06-yardshift-full-experience`。**不得推 main、合并 main、自动部署**。
6. 核对远程 feature HEAD 与本地 HEAD 是否相等；如果 push 被拒绝或权限不通，清晰报告本地 SHA、状态和具体原因，不把“未推送”写为“已交付远程”。

---

## H. 最终报告格式与“完成”判定

Cursor 的结束报告必须按下面顺序，不能只回复“71 tests green”：

1. **源码恢复**：中断后发现的工作区状态、未提交文件数量、创建的恢复 checkpoint SHA（如找到缺失文件，写明恢复手段）。
2. **执行状态**：M0–M7 各一行 `DONE / PARTIAL / BLOCKED / DEFERRED`，引用代码路径 + 可见运行证据。若任一未达 V06 DoD，不可写“完整版已完成”。
3. **实际资源**：每种核心工具/庭院/地面碎屑用的具体文件、模型来源、许可、是否实际渲染成功，哪些仅为候选和引用。
4. **坐标证据**：真实 GLB 节点位置与测量文件；哪些热点经过调整、哪些仍近似。
5. **可玩的因果**：A/B 路线真实工作过程、事件摘要与 rework 数值来源；指出玩家怎样亲自感知效率差别。
6. **测试与浏览器**：四条工程命令的真实结果、最终测试数、浏览器/console 情况、截图目录链接；不能以 HTML 200 代替 3D 验收。
7. **Git**：本地 HEAD、远程 HEAD 是否一致、feature 分支 URL、未合并 main。
8. **剩余问题**：按 blocker / serious usability / cosmetic 分类，说明是否影响产品 L0–L3；如果仅剩 P2，交付而不是无限继续美化。

**验收阈值**：玩家在一个真实连续的庭院中，可以自由观察与计划、使用多种有区别的工具完成工作、修剪产生可见的后续清理、比较不同行动顺序带来的真实返工，并从一次复盘理解专业园丁的效率。这才是 V06 的完成，不是“每个 UI 都有按钮”或“测试都通过”或“截图已提交”。

**中途继续而非停机规则**：B checkpoint 后完成 C–G；只要不存在不可逆的数据损失、许可证违约、重大上层方向冲突或真实核心阻断，就继续推进，不为 logo、草叶风摆、品牌图等装饰反复请求确认。

---

## I. 直接复制给 Cursor 的唯一续工消息

> 请以仓库中 `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` 为**产品和层级设计总权威**，并读取我这次附上的 `YARDSHIFT_V06_IMPLEMENTATION_ATLAS_AND_RECOVERY_ADDENDUM.md` 作为**具体的恢复、资源调配、空间定位和交付验收补充执行说明**。当前本地分支据中断报告为 `feature/v06-yardshift-full-experience`，M0–M6 大量代码仍未提交，远端最新可核实基线是 P0 `cc5853f`。请先在本地核对、备份、**安全提交真实存在的 M0–M6 工作区源码形成恢复 checkpoint**，不要 reset/clean/rebase/覆盖存档或从 P0 重建。然后执行四条工程检查并逐项核实 M0–M6 的实际 UI、事件因果和存档状态；只修真正缺失的连接。接着完成 M7：从真实庭院 GLB 计算热点及工作对象的世界 bounds、对齐 TaskStage/Overview/碎屑，做完整玩家路线和 A/B 返工对照的浏览器测试，针对影响辨识和操作的具体问题做最小美术与交互改进，提交真实截图、资源许可、placement audit、V06 execution log、README，并 push **V06 feature 分支**（不要合并 main 或部署）。按规范持续推进至完整可玩交付；别因为代理模型不够漂亮就陷入无限打磨。最终返回 Git SHA、测试数、截图、资源实际使用状态与剩余非阻断问题；任何未独立验证的报告事实必须显式标注。
