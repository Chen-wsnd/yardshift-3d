# YardShift V06 — 全局交互、工具判断与消耗机制综合审查 / Integrated Interaction & Tool Judgment Review

**审查基线**：`Chen-wsnd/yardshift-3d` → `feature/v06-final-playable-closure` @ `917d1a0975d52533afc7bd65e1348d3d54490f1d`（2026-11-22，远程核实）  
**文件用途**：交给 Cursor 连续实施的统一改进合同；**补充**而不取代 `docs/YARDSHIFT_V06_SINGLE_MASTER_CURSOR_SPEC.md` 的产品目标，以及已有 `docs/YARDSHIFT_V06_FULL_PROJECT_CLOSURE_MASTER.md` 的交付和安全约束。  
**工作边界**：不合并 `main`、不部署、不删除或强制迁移覆盖原始用户存档；在独立 feature 分支和独立浏览器 profile/测试存档中实施和验收。  
**审查限制**：这里能够查看远程 GitHub 源码、类型与测试，无法直接使用用户本机 `http://localhost:3000`，**不能把源码推断写成浏览器已复现**。`exit 137` 是用户明确说明的旧 Next 进程清理，不将其当构建失败。

## 0. 永久不变的最终目标与裁决原则（先读）

**L0 用户价值**：让玩家在同一真实连续庭院里学习 *观察现场 → 识别材料和危险 → 自己选择工具 → 正确操作或尝试不合适的操作 → 看到相符后果 → 维护工具 → 比较工作安排 → 形成可迁移判断*。不是“点击正确答案”、不是“工具操作越多越好”、不是养成一个只有数值惩罚的游戏。

任何新功能和调整都必须回答：

1. 玩家在采取行动前，是否能识别**目标、工具和操作方法**，但仍保留自主判断？
2. 操作是否真的有物理/工作上的意义？有效、无效、危险、重复操作是否区分？
3. 反馈是否来自当前目标、工具、资源、现场障碍以及历史事件，而不是固定的随意提示？
4. 资源消耗、维修和返工是否与实际动作一致并可解释、可复现？
5. 中英用户是否获得相同的教学事实和可比较结果？
6. 这项调整是否减少玩家猜测 UI，而不是增加必须阅读的说明和菜单？

**明确产品决定**：
- 保留**单一连续可操作的 3D 庭院 + 全局工具栏**；工具不因镜头区域或所谓任务阶段而被锁住。
- **观察/预览不收费**：鼠标悬停、选择工具、把工具移动到错误位置、转动镜头不自动扣耐久。只有真实执行的动作才能改变资源；错误动作也必须按其真实后果处理。单纯点击未命中目标不能被伪装成损伤。
- **工具边 `!` 不应只是信息装饰**：普通信息图标提供用途/限制；危险目标上应出现可读的红色 `!`，解释材料、风险、可能的**非常规损耗**及替代处理办法；安全状态同样给出确认反馈。
- 不能用固定最优顺序惩罚玩家。危险阻挡是局部的，错误工具行为要因地制宜，清理返工来自事件和空间足迹。
- 仍先以可测性/逻辑严谨为先，不为“视觉生动”重做整个引擎或购买工具包。

## 1. 证据等级与全项目问题地图

**CODE_CONFIRMED** = 源码直接可判断；**BROWSER_REQUIRED** = 代码暴露风险但必须实机确认；**PRODUCT_GAP** = 能运行但达不到上述 L0 判断学习目标。

| ID | 来源与代码位置 | 问题 | 等级 | 处理优先级 |
|---|---|---|---|---|
| G01 | `GardenHotspots.tsx` | 六个透明 box 仍参与射线拾取，覆盖大面积工作面，且停止事件传播；可能抢走操作点击 | CODE_CONFIRMED 结构 / BROWSER_REQUIRED 影响 | P0 |
| G02 | `FlowerbedTaskStage.tsx` | 植物绑定 group click，扩大命中的 sphere 是 `visible={false}`；稳定命中没有专门实现 | CODE_CONFIRMED | P0 |
| G03 | `GardenWorldOverlays.tsx` | 将 `raycast` 关在 group 不足以证明其子 mesh/GLB 不参与拾取；同一植物叠加两套图形 | BROWSER_REQUIRED | P0 |
| G04 | `HazardTaskStage.tsx` / Store | 危险物点击一次检查、点击第二次自动清除，没有材料识别/清除动作的可理解过程 | CODE_CONFIRMED / PRODUCT_GAP | P0 |
| G05 | `toolTargetCapabilities.ts` | 已有 `resolveToolTarget`，但当前 `GardenInteractionLayer` 只按工具挂载层，工具—目标规则没有接到统一点击前反馈路径 | CODE_CONFIRMED | P0 |
| G06 | `GlobalToolBar.tsx` | `condition` 越高越新，却标记为 `wear`/“磨损”；100% 容易被理解成全损 | CODE_CONFIRMED | P0 |
| G07 | `toolUseGuard.ts` | 动力工具在本次操作恰好耗尽资源时提前 return，跳过应有 wear | CODE_CONFIRMED | P0 |
| G08 | `gameStore.ts` `topCutWeed` + reducer | 已截顶未拔根的杂草再次执行 top cut 可能重复扣资源并重复增加 productive effort，而外观状态无新变化 | CODE_CONFIRMED | P0 |
| G09 | `gameStore.ts` `rakeDebris`、`bagNearbyPiles` | 当前可清理成功，但未统一更新工具 condition 和工具使用统计；与其他工具规则不一致 | CODE_CONFIRMED | P1 |
| G10 | `gameStore.ts` `blowDebris` | 在未移动任何碎屑时也消耗资源/磨损；可允许真实空转成本，但现在没有起止时长和明确反馈 | CODE_CONFIRMED / PRODUCT_GAP | P1 |
| G11 | `repairTool`、`refillTool`、`clearJam` | 存在未统一应用封存守卫、活动账本和事件/努力计费的路径；修理中的 deferred charge 可造成账务语义含糊 | CODE_CONFIRMED | P0 |
| G12 | `GardenOverviewScene.tsx` + `GardenCanvas.tsx` | Drei `OrbitControls` 本来有旋转、平移和缩放，但地面操作层拦截指针；控制方式不可发现，可能仅能缩放 | CODE_CONFIRMED 结构 / BROWSER_REQUIRED 体验 | P0 |
| G13 | `GlobalToolBar.tsx` | 有工具知识弹层，但难在**当前目标**解释危险和其他工具选择；没有状态驱动的显著 `!` | CODE_CONFIRMED / PRODUCT_GAP | P0 |
| G14 | `GardenHotspots.tsx` + 各 UI 文案 | 标签贴在场景上却不清楚“点了是看、做还是开面板”，还可能遮住作业目标；工具栏与提示悬浮层有重叠风险 | BROWSER_REQUIRED / PRODUCT_GAP | P1 |
| G15 | `LawnTaskStage.tsx`、`HedgeTaskStage.tsx`、`DebrisTaskStage.tsx`、`EdgeTaskStage.tsx` | 各阶段独立写拖动/捕获逻辑，取消、转镜头、失焦、切换工具期间未形成共通手势协议 | CODE_CONFIRMED / BROWSER_REQUIRED | P1 |
| G16 | `GardenToolView.tsx` | GLB/轮廓摆放是固定参数；除草器与修边器为轮廓，缺少针对手持工作位姿的统一测量与可见性检查 | CODE_CONFIRMED / PRODUCT_GAP | P1 |
| G17 | `visitSummary.ts`、`reviewSelectors.ts`、`learningAdvice.ts` | 使用历史事件复盘是对的，但部分手动工具不产出可归属 toolId 的工作事件，工具使用统计/维护解释可能失真 | CODE_CONFIRMED | P1 |
| G18 | `src/i18n/dictionaries.ts` 与 Store 中大量 English `explanation` | 中英文只覆盖导航/工具名，关键动态风险说明、材料知识和复盘尚未有结构化语言资源 | CODE_CONFIRMED | P1 |
| G19 | `createFreshV03GardenSnapshot()` | 新开庭院默认 `selectedToolId: manual-reel-mower`，与工具栏 Hands/Inspect 作为显式起点的教学意图存在冲突 | CODE_CONFIRMED | P1 |
| G20 | 自动化 (`closureP0.test`, `toolTargetCapabilities.test`, `allToolLifecycle.test`) | 主要测 Store/映射，真实光标穿越覆盖层、悬停警告、镜头手势、目标 hit proxy 尚需浏览器层验证 | CODE_CONFIRMED | P0 |

**不要把 P0 误解为必须推翻整个架构。** 以上主要是射线输入、场景反馈、事件记账、工具规则一致性四条链路。

## 2. 全局操作架构：一套工具—目标闭环

### 2.1 从选择工具到工作记录的唯一解释链

```
全局工具栏选中 toolId（或 Hands）
    ↓
指针在当前 3D 目标上 → 统一 hit: targetId, kind, worldPoint, material, currentState
    ↓
resolveToolTarget + 当前现场条件 + 当前工具 condition/resource/status
    ↓ 纯函数，不修改 world，不扣资源
Preflight / HintModel: useful | needs-prep | wrong-tool | hazard-risk | unavailable | completed
    ↓
UI：对象轮廓+光标 + 工具旁 ! + 可访问说明弹层（仅必要时提醒）
    ↓
玩家显式执行 click / press / drag，并满足操作阈值
    ↓
Store 内的权威 applyAction → EffectResult / ToolUseGuard → GardenEvent + ToolUseRecord
    ↓
世界状态变化 + 真实资源变化 + 简短定点反馈 + Review 可追踪证据
```

现有 `resolveToolTarget`、`ToolUseGuard`、`applyGardenEvent`、`WorkSnapshot`、`VisitSummary` 应分别继续作为能力判定、工具状态、庭院事实、工作记录和封存载体。**不要为做 UI 再创造第二份独立工作规则。** 可补纯函数 `evaluateToolIntent(toolId, hit, state)` 和结构化 `ActionOutcome` 作为薄协调层，并以代码一致性测试确保这不是另一套业务状态机。

建议区分四层：
1. **Target Registry（场景对象 ID）**：可见对象和可操作命中代理引用同一 `id`，不以复杂 GLB 子 mesh 名称作为权威业务 ID。
2. **Preflight（无副作用）**：检查危险、工具兼容、已完成状态、材料差异、资源/磨损；产出风险代码、可选替代方法和提示优先级。
3. **Commit（有副作用）**：只在用户真正操作后，根据 event 和 outcome 修改 world/tool/effort；保证幂等与资源原子提交。
4. **Presentation（纯展示）**：选中、悬停、风险、伤害结果、图标、颜色、声音可选；语言切换不改变物理和得分。

### 2.2 工具—目标反馈等级（核心新增要求）

| 级别 | 图标/状态 | 展示内容 | 对状态的影响 |
|---|---|---|---|
| INFO | `i` 或 `!` 中性 | 用途、适用对象、标准操作、局限、观察要点 | 仅查看，零损耗 |
| VALID | ✓ + 细轮廓 | 目标适合；动作后反馈具体效果 | 预览零损耗；执行后按有效工作消耗 |
| INEFFECTIVE | 琥珀 `!` | 错误材料/距离/目标已完成，建议调整目标或工具 | 预览零损耗；未接触/未启动动作零损耗；真实空转可按时长有小代价且解释 |
| RISK | **红色 `!`** + 目标外轮廓 | 指出石头/硬木/危险障碍；提示可能产生**异常磨损、卡阻或环境损害**，说明先检查/清除/换工具的原因 | **仅预警不扣**；执行后按是否允许碰撞、真实发生的异常事件结算；高风险可直接禁止启动 |
| BROKEN/EMPTY | 明确状态 + 恢复入口 | 电量不足/卡阻/损坏；告知怎样安全处理 | 不能产生假进度；恢复产生清晰、可追溯成本 |

**红色 `!` 的严格触发条件**：当前选中工具 × 当前命中目标 × 状态条件，确实存在额外损耗/安全/质量风险。普通用错工具但无机械危险（例如拿收集袋对着散落草叶）用琥珀/中性提示，不能所有错误都涂红。`!` 不依赖颜色作为唯一语义，兼顾图标、文字、可访问名称、键盘和触屏。

### 2.3 工具卡旁的信息 `!`：推荐呈现而不是弹窗轰炸

工具栏每个按钮旁有可访问的 `i/!` 图标：
- 普通**工具卡**：名称、图片/轮廓、适用对象、工具的物理工作方式、注意事项、预期效果、典型误用、动力与耐久信息；内容来自 `toolKnowledge` + 当前参数档案，不把虚构数据写成厂家参数。
- **情境卡**：当鼠标指向某物体或聚焦某目标时，在当前工具上显示 `!`（必要时也在目标附近显示小图标）：“此处有石块，刀片碰撞可能受损；先用 Hands 检查并移开，再继续割草”；或“这里是花，手除草器会损伤观赏植物；先识别叶形”。
- **状态卡**：所选工具 battery/condition/jam/broken，是否可用、如何恢复、恢复的努力/费用。Condition 一定标记 **“状态/完好度”** `condition 100%=完好`；如要显示磨损应显式 `wear=100-condition`，不得叫 condition 100% 为“磨损 100%”。
- 桌面 hover 给简要 teaser，点击/键盘 focus 打开完整；触屏只靠点击，不依赖 hover；Esc/外部点击关闭，Tab 顺序合理。
- 一次只展示**一张**深入说明卡，避免六个热点和大量气泡遮挡庭院；已读或已解决风险降为短提示，而非循环弹窗。

**成熟方案优先**：`@radix-ui/react-popover` / Radix Popover/Tooltip（如果团队已用到或引入成本合理），Tailwind 调样式。关键警示用 `role="status"` 或 `aria-live="polite"`，而不是只放 CSS tooltip。不要自己造一套焦点捕获/键盘菜单。保持颜色中性，不把所有提示染红。

### 2.4 有示例的情境规则（执行前→执行→反馈）

| 工具/场景 | 检查与红 `!` 触发 | 结果与教学 |
|---|---|---|
| 动力割草机靠近隐藏石头 | 若现场石块未清、刀盘路线与局部危险半径相交，红 `!`；可以先检查 | 默认阻断受影响的局部路径，无默认扣耐久。若日后明确引入“真实刀片撞击”动作，必须选择有据可依的额外损耗/卡阻，并给清晰事件 |
| 手推滚刀式割草机靠近石头 | 同样应提示风险，不应因为不是电动机就忽略刀具 | 解释保护刀片，允许绕开/先清理；避免假称无需检查 |
| 动力修篱机遇厚硬枝 | 红 `!`，报告“材质/粗细超出适用范围”；建议先辨别与使用适当枝剪 | 默认局部阻挡；若确实按已有 jam 规则触发才扣额外磨损，不能悬停即受损 |
| 手工绿篱剪对软枝 | VALID，精度较好、一次处理范围小 | 真实裁剪 + 落叶/枝屑，工具状态按实际操作减少 |
| 线割机对花坛杂草 | VALID，但提示只能截顶，不能除根；靠近观赏花时 RISK/WARNING | 截顶后可见残根，不要伪装全清；误伤花朵必须记录且不可自动恢复 |
| 手动除草器对杂草 | VALID，说明轻摇、松土/抓根（以简化动作模拟，不宣称真实土壤力学） | rootRemoved=true、留碎屑待清理，只有有效尝试正常磨损 |
| 手动除草器对观赏花 | 红/琥珀按实际伤害风险 | 警示但允许明确的误拔行为并留下质量损伤（不是悬停即损坏） |
| 落叶耙对分散树叶 | VALID，沿实际拖动范围聚拢 | 有效聚拢才记正常消耗；错把袋子对散叶只提示“先聚拢” |
| 吹叶机在空地启动 | 琥珀 `!`，说明没有目标及电池可能空转 | 可采用按持续运转时间扣轻微资源的真实空转，若仅误点则不扣；不能一次帧动作扣固定电量 |
| 装袋工具对未成堆碎屑 | 琥珀 `!` | 不产生假装袋；显示“先用耙子聚拢，再靠近装袋” |
| 任何工具已卡滞/损坏/没电 | 固定工具状态警告；可能比目标警告更优先 | 不消耗无意义资源/不改变世界；提供安全恢复动作 |

**不能假装已实现石头撞击损坏物理**。现有代码是局部 `block`，因此本阶段最稳妥的设计是预警和阻挡、说明潜在异常损耗；要实现真正碰撞损伤需加入事件、可回退规则、自动化断言，不能只改文案。

## 3. 输入、命中与操作手感——先解决“点不动”和“看不懂”

### 3.1 先统一 raycast 所有权（阻断级）

**当前**：`GardenOverviewScene` 同时挂载 `GardenWorldOverlays includeLawn excludeTask="all"`、`GardenInteractionLayer` 和 `GardenHotspots`。`GardenHotspots` 中每个 area 有透明 mesh，尺寸例如草坪 10×8 米，即使 `opacity=0.03` 仍可能被拾取；其 `onClick` 调用 `stopPropagation()`。`GardenWorldOverlays` 尽管尝试用 `raycastOff` 关闭组拾取，却需要确认子 mesh 和 GLB clone 的射线行为。`string-trimmer` 同时挂载 edge/flowerbed，两种任务各有操作层。

**改进**：
1. 在 **work mode** 不允许六个大面积透明 camera hotspot 与真实工作命中面竞争。相机聚焦入口放在清晰的任务导航/可选“查看区域”按钮里；仅在 **look/inspect mode** 显示小型、独立可点的 camera 标记；保持无需点热点也能随时选择任何工具。
2. 所有 `GardenWorldOverlays` 负责显示，不处理工具业务命中；对子 GLB mesh 也严格验证不触发 pointer events。不能只给 `group` 填 `raycast={() => null}` 就宣布所有子孙不参与。
3. 为杂草/花/石头/堆积物制作**有业务 ID 的独立 hit proxy**，命中面与实体外观分离：world anchor + small circular/capsule proxy，尺寸以实际屏幕命中测试校准；外观复用 GLB，但事件只能在 proxy 统一执行。不可用 `visible={false}` 当作可靠的 3D 可点命中代理；可以选 opacity=0、`depthWrite=false`、有独立事件的可射线物体，并实测透明物与渲染顺序；或使用场景 raycaster/target adapter。不要让图形本身隐形导致无法调试；开发态可用描边查看代理。
4. **Pointer ownership**：鼠标按钮、工具状态、选中目标、拖动捕获由一个协调层管理；各现有 task stage 保留具体工作逻辑，但不独占全局交互和 camera。持续使用 R3F 的 `e.target.setPointerCapture` / `releasePointerCapture`、`onPointerCancel` / `onPointerUp` / `onLostPointerCapture`，并在切换工具、失焦、封存、卸载时及时清理。注意 R3F pointer capture 不是 DOM 的完全同义，必须按官方规则处理传播和捕获。
5. 用**单次判定、单次提交**的事件 pipeline 路由同一次手势。不能一个 click 同时触发除草和 camera hotspot，或同一个 drag 同时修改 edge 与 lawn。无论哪个 mesh 最先射线命中，都以明确的优先级和 target ID 决定一次实际动作。

**通过**：启用开发诊断覆盖层可看到 `toolId`, `hit.kind`, `hit.targetId`, `pointerId`, `cameraMode`, `preflight.reasonCode`, `actionOutcome`；同次指针输入恰有一个业务结果（无重复记账）。在画面中能够连续点击 7 株杂草、3 朵花、2 个 hazard，操作成功目标与鼠标指向一致；错误工具稳定显示解释。

### 3.2 花坛除草：目标识别、操作动作与不同结果

**源码定位**：`FlowerbedTaskStage.tsx`、`GardenWorldOverlays.tsx`、`src/game/garden/fixtures.ts`、`gameStore.ts` (`pullWeed`, `topCutWeed`, `damageFlower`)、`reducer.ts`。

保留“线割只截顶、手工拔根、花朵不可误拔”的核心差异。按照玩家体验改善：
- **视觉辨认**：在正常观察距离，杂草与花至少有轮廓/色彩区别；鼠标悬停目标给细外轮廓和可点击状态。不可直接用红色“weed/flower”标签告诉玩家正确答案；首次 Inspect 可提供特征信息，玩家应做判断。
- **点击容错**：为每株植物给独立稳定 hit target；多个相邻植物的代理不得重叠到总是选中同一株。短暂 hover 可显示 target feedback；必要时聚焦镜头而非放大无形命中面。
- **行为区分**：手动拔根由短按住/轻拖模拟接触和拔起（具体选一个对鼠标、触屏都可用的明确操作，不模拟真实复杂生物力学）；线割采用沿杂草上方经过的短扫动作（而非突然单击全部除完）；完成后有可见残桩/根或移除结果。单击 UI 必须明确提示如何执行动作。
- **错误行为**：线割机对花必须预警风险；如果选择强行动作，记真实花损坏事件；如果设计为受保护模式阻断，也必须告诉玩家是“工具太宽/精度低”的原因。不能 hover 自动受罚。
- **去重**：已 topCut 的杂草再次 topCut，若没有新状态/新工作结果，应返回 `already-top-cut` 并 `resourceDelta=wearDelta=effortDelta=0`（除非玩家有明确可观察的连续磨损/空转模型）；已 rootRemoved 再次误触无效果、不扣；植物被移除后 hit proxy 随状态消失。
- **反馈**：每次行动显示 `stubble remains` / `root removed` / `flower damaged`，跟 `targetId` 和真实事件关联；复盘能解释为什么花还在、根为何还在。
- **边界**：相邻花与杂草交叠时，根据实际最终 hit target 做操作；不可因为相机视角导致“点击花却拔掉草”。

**通过**：从同一个存档，在相同花坛分别使用两种工具，能准确重现“表面干净但根仍留”“正确拔根”“误伤花”“重复无效操作零扣费”，有浏览器操作轨迹和 Store 断言。

### 3.3 Hazard：从“一点就消失”改成可学习的安全处置

**当前**：`HazardTaskStage.tsx` 使用一枚 `dodecahedronGeometry`，首次点击 `inspectObject`，第二次点击 `removeHazard`。`createHazards()` 包括 `lawn-stone-1`（石头）与 `hedge-hardwood-1`（硬木）；但两者被相同方式清除。Store 的 `removeHazard` 只有 `cleared` 和固定 `effort=1.0`，没有材料/方法区别。

**最低完整机制，不扩张模拟器**：
1. **观察**：Hands/Inspect 指向目标，突出显示危险范围；第一次点击显示材料、位置、哪些工具会受影响、原因。石头：硬物可能损伤刀片；绿篱厚硬木：可能使修篱机卡住。显示“Inspect completed”，不同于“已清除”。
2. **选择处理方式**：石头为低风险可徒手清出工作区域的小石块，显示确认/短按“Move stone aside”，明确视觉移动到安全区/从工作范围移除；不要让文本“清理”掩盖动作。绿篱粗硬木不能像石头一样随手捡掉：至少提示需要合适枝剪/先剪除硬木。`loppers` 已在 `EQUIPMENT_PROFILES`，但**不在当前 10 工具 toolbar**；若接入应实现正确身份、规则、操作及测试，并确认素材许可。若在本轮无法提供完整实现，可明确“Inspect + 标记危险并绕开/等待专用工具”而不是假称 hands 已清除硬木。
3. **危险范围**：在世界里用小范围环/轮廓显示阻挡作用；已清除才解除相应工具的局部阻挡；其他远处工作正常。镜头移走后风险仍保留在园内直至处理。
4. **碰撞与资源**：默认近石/硬木先警告并局部阻断，资源零消耗；如选择模拟“明确强行启动/碰撞”分支，必须有事件 `hazard-contact`、异常磨损或卡阻与对应 UI，且仅执行才生效，并确保这种危险选择不是必须做才能通关。
5. **明确反馈**：`inspection` 与 `clearance` 是两件事，两次动作结果不同；已清 hazard 不再出现在待处理数，回访不重复加 setup effort；保留已发生的伤害/维修记录。

**通过**：同一石块，未 Inspect → Inspect → Clear，每步不同；未 clear 近处动力刀具阻挡而远处正常；clear 后近处恢复；硬木有独立适当处理而非“徒手捡木”；无点击假扣费；A/B 可比较第一次先排查与第二次晚排查的真实后果。全部需要真实 UI pointer E2E。

### 3.4 绿篱、修边和碎屑：不再各自为战

**绿篱 `HedgeTaskStage`**：改进“刷绿篱像扫一张平面”的感受。命中应基于真实 hedge cluster / face，手剪需明确选准小段，电剪可连续扫过较长范围；一次 sweep 对单 cluster 的正常 cut 不得反复扣损耗；有意二次重剪导致 overcut 必须是明确能观察到的高风险结果，不能因同一拖动手势两次采样误判为二次操作。工具模型运动与裁剪点同步；产生碎屑与真实 cluster 对应。

**修边 `EdgeTaskStage`**：沿真实 path–lawn 接口作业，有明显可辨工作条；误扫远离边缘时显示“请沿边缘操作”并零操作扣费；手动修边器更窄精准、线割机更快但有贴近观赏花的风险。原有 `edgeSegments` 独立 authority 绝不能重绑 lawn cells。

**清理 `DebrisTaskStage`**：耙子朝方向聚拢、吹叶机朝方向推动、装袋只在已有 pile 附近有效，碎屑从原处到堆再到袋的状态可见。把“点击某个垃圾只是 camera focus”和“真正使用耙子/袋子”分离，不要把 camera label 混成工作输入。碎屑/草地/绿篱层不应拦截工具的拾取。

**割草 `LawnTaskStage`**：按路径连续割，而不是鼠标停滞反复刷格子；当前 `onPointerLeave` 直接结束拖动，在透明 UI 覆盖、快速移动时可能手感中断，需使用一致的 capture/release 约定、lost capture 恢复、离开有效工作区域的清晰提示。危险警告应基于路线和 hazard 距离。滚刀倒退几乎不切，但仍存在真实推动；动力刀盘在运动时产生资源消耗，路径采样密度不同不能导致明显不同成本。

### 3.5 全部工具必须有“可操作完整性”，不能只有模型

对 `GARDEN_TOOL_BAR_IDS` **10 件工具 + Hands** 建立核查矩阵，逐一检查：

| 工具 | 可见 | 找得到目标 | 手势可发现 | 有效世界状态 | 错误/危险反馈 | 资源/磨损与回退 | Review 证据 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hands / Inspect | □ | □ | □ | □ | □ | 不适用/准备努力 | □ |
| Manual reel mower | □ | □ | □ | □ | □ | □ | □ |
| Battery mower | □ | □ | □ | □ | □ | □ | □ |
| Hand hedge shears | □ | □ | □ | □ | □ | □ | □ |
| Hedge trimmer | □ | □ | □ | □ | □ | □ | □ |
| Hand edger | □ | □ | □ | □ | □ | □ | □ |
| String trimmer (edge+weed) | □ | □ | □ | □ | □ | □ | □ |
| Hand weeder | □ | □ | □ | □ | □ | □ | □ |
| Leaf rake | □ | □ | □ | □ | □ | □ | □ |
| Leaf blower | □ | □ | □ | □ | □ | □ | □ |
| Garden bag | □ | □ | □ | □ | □ | □ | □ |

所有格子需要真实源码证据/断言/浏览器动作，不允许自动填勾。若未来加入 loppers，则必须以相同完整性标准加入；不要为了补硬木图标临时添加“按钮可见但不能用”的工具。

## 4. 相机与游戏操作协议——让玩家自由看，不让镜头误施工

**已有能力**：当前使用 Drei `OrbitControls`，代码设置 `enablePan`、距离和最大俯角，默认就有**旋转**。因此“只能缩放”不能直接归因于缺少库，更多可能是大面积工作 mesh 对左键拖动抢占、交互说明缺失、工作模式与镜头模式冲突；必须实测。

**建议动作协议**：

| 环境 | 输入 | 操作 | 约束 |
|---|---|---|---|
| 桌面/当前已选择工具 | 左键落在有效工作 target 后拖动 | 施工 | 只有可执行 action 进入捕获；不能因为误点全部开始施工 |
| 桌面 | 鼠标右键拖动 / 显式“观察镜头”模式左拖 | Orbit rotate | 不触发工具工作；处理系统右键菜单事件与 canvas focus |
| 桌面 | 鼠标中键拖动（或 Shift+左拖在镜头模式） | 平移 | 不触发施工 |
| 桌面 | 滚轮 | Zoom | 有合理边界；提供“回到全院”按钮 |
| 触屏 / 触控板 | 显式“观察/施工”切换 + 一指手势 | 查看或施工 | 手势不模糊；工具不会因 pinch 误执行 |
| 触屏 | 双指缩放/旋转/平移，在观察模式 | 调整镜头 | 合理夹角/距离限制 |
| 所有环境 | 聚焦区域/镜头重置按钮 | 移动镜头而不改变任务权限 | 不中断已进行的拖动、Canvas 不重挂载 |

使用 Drei `OrbitControls` 的 `mouseButtons`、`enableRotate`、`enablePan`、`enabled`、`target`，必要时用现有的 `CameraControls`（Drei 支持）做缓动；**禁止自己写基础 3D orbit 数学**。由于 R3F pointer events 与 OrbitControls 共享 Canvas DOM，实际是否能右拖旋转必须由浏览器动作证明，而不能只看 props。对 `CameraAim` 的跳跃聚焦可以缓动优化，但不是阻断关键点。

**功能教学**：初次进入只给简洁可关闭提示：“左键用工具；右键拖动旋转；滚轮缩放；中键平移；点击 ⟲ 回到全院”。选择 `Hands/Inspect` 时左键可以点具体物体检查；画面未被 target 命中时，应允许镜头模式或显示明确信息。工具和相机控制按钮必须易找，不能被工具栏遮住。

**通过**：同一段浏览器录屏中，连续旋转 90°、放大、平移、重置；随后在该角度精确拔出一株杂草，再回到全院；任何一次纯镜头操作都不改 `events.length`、tool resource、condition 或 VisitSummary。触屏至少覆盖一套可重复手势。无指针 capture 泄漏。

## 5. 工具消耗、耐久和恢复——统一可说明的账本，不是随便调系数

### 5.1 现有源码真实问题

- `toolUseGuard.ts`：`POWERED_DRAIN` 为 hedge 4、blower 3.5、trimmer 3（每动作），而 lawn sweep 根据米数消耗；如果 UI 每帧触发次数不同，同样扫过一段范围成本可能差很多。
- `guardAndConsumeTool` 在 `resource <= 0` 分支直接 `return {ok:true,...}`，导致**最后一次实际成功操作跳过 applyWear**，即本次耗尽电池时“免费磨损”。
- `rakeDebris` 和 `bagNearbyPiles` 修改世界却不调用统一磨损/condition 处理；`blowDebris` 在 `moved=0` 时先扣资源；`topCutWeed` 重复截顶可能再次计 effort/损耗。
- `repairTool` 当前有“balance 不够仍维修，ledger 记 capped deferred charge”的分支；实际财务/学习逻辑不清楚。`clearJam` 和 `refillTool` 也没有和 `rechargeTool` 一样一致的 sealed guard 与事件证据。
- `selectTool` 花费 `setup effort 0.4`，即使玩家仅探索不同工具，也会受到惩罚。该机制可保留为实际取用/更换工具成本，但**探索、打开信息卡、未施工选择工具**不应直接损害学习尝试。建议区分预览与真实装备/转换动作，且可解释为什么有准备成本。
- `GlobalToolBar` 当前显示 `Wear ${condition}%`，语义反向，必须修。

### 5.2 每一次执行有明确成本构成与提交条件

建议建立 **单一工具操作结果 `ActionOutcome`**（可在现有 guard/store 层加纯函数和结构化事件，不重写全部 reducer）：

```ts
// 类型示意；仅示意，不要求直接复制为新框架
interface ActionOutcome {
  actionId: string;      // stable id for one committed gesture/action
  toolId: string | null;
  targetId: string;
  kind: 'success' | 'blocked' | 'miss' | 'already-done' | 'misuse' | 'damage' | 'jammed';
  reasonCode: string;    // localization key, not UI-ready English string
  affectedIds: string[];
  effect: { worldDelta: unknown; pathMetres?: number; effectiveHits?: number };
  cost: { batteryOrFuel: number; wear: number; effort: number; fee: number };
  hazardId?: string;
}
```

**状态改变顺序**：
1. Preflight 检查有效目标与材料/距离/工具状态；预览无副作用。
2. `beginAction` 建立唯一 gesture/action ID，确认实际已达到操作阈值。
3. 根据**有效覆盖长度/受影响工作量/实际触碰危险**计算工作结果和成本；避免单次 pointermove 次数作为成本权威。
4. **原子提交**工具状态、世界状态和唯一事件；用 actionId 做幂等。不可先扣资源，发现目标无效后又忘记回滚。
5. 统一派生 UI 成功/无效/警告和 Review 事件，避免 Store 文案与界面状态不符。
6. 如果工具在本次动作末尾耗尽电池，**本次有效工作的正常 wear 仍要结算**；之后状态变 `unpowered`，下一次不能再工作。

下面是**建模建议，不是宣称厂家数据**：

```
resourceCost = effectivePoweredPathMetres * drainPerMetre
             + poweredRuntimeSeconds * idleRate (仅真实启动并运行)
             + extraLoadCost (仅发生明确高负荷事件)
wearCost     = effectiveWorkUnits * wearPerWorkUnit
             + actualContactDamageWear (仅实际危险接触)
             + realIdleWear (若有完整的空转模型)
```

手工工具 `resourceType=none` 不扣电池，按有效工作单元磨损；装袋若尚未模拟背袋容量，明确说明“无容量模拟”，不可凭空扣不存在的背包数值。危险处理的安全准备应计 `setup effort`，但普通看一眼 UI 不要反复加 setup；有确实的处置过程可以计 effort。

### 5.3 消耗与危险行为矩阵（必须断言）

| 情况 | 世界变化 | 正常资源 | 磨损 | 解释 |
|---|---|---|---|---|
| hover 工具/目标、转镜头 | 无 | 0 | 0 | 预览不收费 |
| 首次有效工作 | 有 | 依工具/工作量 | 正常 | 可描述实际生效的原因 |
| 已做完目标再次碰到（无真实动作） | 无 | 0 | 0 | 已处理，无需重复 |
| 空场误点、目标超距 | 无 | 0 | 0 | 不产生假工作 |
| 明确启动并长时间空转（若建模） | 无 | 少量按运行时长 | 可选小额 | 明确空转而不是“点错一次扣 3” |
| 危险点预警但未触发 | 无 | 0 | 0 | RISK 仅预警 |
| 碰撞被安全规则阻挡 | 无 | 0 | 0 | 局部安全保护 |
| 明确危险撞击（只有实现物理/事件才成立） | 可能损坏 | 与实际运行相关 | 额外、可追溯 | 有明确接触事件、风险说明 |
| 有效动作后电池恰耗尽 | 有 | 到 0 | **仍正常扣** | 下一个动作阻止 |
| 工具 jammed/broken | 无 | 0 | 0 | 先维护，不假完成 |
| Clear jam/Repair/Recharge | 对工具有效 | 恢复或相应成本 | 不暗中消除其他状态 | 有行为证据与努力/账本 |
| Finish 已封存 | 无 | 0 | 0 | 全局只读，摄像机可操作 |

### 5.4 Condition / Wear / Resource / Status 一致性

`ToolInstance` 目前有 `condition: 0..100`、`resource: 0..100`、`status`。明确用单一语义：
- Condition 完好度：100% 新、0% 损坏；Wear 磨损：`100-condition`。界面可以只显示完好度和电池，避免两个反向数字混乱；工具说明用语言解释磨损来源。
- Resource：电池/燃油/耗材剩余；不同资源类型使用不同词，不要给燃油工具显示“充电”。
- `status` 优先级：broken / jammed / unpowered / ready 必须 deterministic。Recharge 只能恢复资源，不能顺便解除 jam 或 broken；Clear Jam 只清除 jam，不恢复 Condition；Repair 仅修理 condition/status，不凭空充满电。
- 只有参与当前园艺运行的工具呈现“可用”；不能因为 `EQUIPMENT_PROFILES` 中存在不完整的 chainsaw/herbicide 就在 toolbar 里假装可用。若添加 loppers 同样应先达到完整标准。
- **经济与维护**：Garden learning mode 若不以经济为核心，则建议简化为维修/充电的明确 effort 成本，不允许隐藏欠款/无穷 deferred charge。要保留 credits，就必须确保 ledger/balance 对应、可追溯、不会重复收费。不能用“建模更真实”为借口制造无法解释的经济惩罚。

### 5.5 Source of truth 与 Visit Summary

`WorkSnapshot.tools` 是工具资源权威，`GardenDomain` 与 lawn cells 是世界权威，已封存的 `VisitSummary` 是历史快照权威。切勿给 UI 另存一份“碰撞次数/磨损”。

对于真实工具使用，采用规范化 `toolUse/actionId/targetId/outcome/cost` 记录；`toolsUsed` 应来自 **成功或实际执行的工作事件**，而不是只看 `TOOL_SELECTED`；手工耙/袋也纳入。Review 解释“多出的 recovery effort/异常磨损/为什么卡阻”必须有对应事件；已封存记录不得因切换语言或选择工具而改变。

## 6. 引导、工具卡、HUD、提示文字与双语：解释现场，不代替思考

### 6.1 不强制教程；使用三阶段提示

**第一次进入（Discover）**：固定但可关闭的轻量引导，明确“工具栏选择、当前选择会做什么、左键操作/右键旋转、工具旁 `!` 查看说明、风险出现时先检查”。指向真实 UI 元素，绝不要求点击某一个 garden hotspot 才解锁施工。保留自由探索；不展示最优工序的标准答案。

**操作前（Predict）**：根据当前工具和目标给提示：
- 中性：“滚刀割草机——推着前进才能割草；倒退效率很低。”
- 情境：“这是花坛里的植株，先确认是杂草还是观赏花”；不过不要直接给出花的答案，除非角色已 Inspect 出特征。
- 红 `!`：“刀盘前有石头；继续在该位置割草存在刀片损坏风险。先查看并清除石块，或绕开。”
- 可手动展开其他工具建议，但不用替玩家自动切换。

**操作后（Observe/Reflect）**：显示非常简短而具体的反馈，避免同时出现两块长期固定的白色悬浮提示：
- “剪断了这一段绿篱；地面新增枝屑。”
- “杂草顶部被截除，根仍在土中。”
- “这一次接近硬木时被阻止，未扣电量/磨损。”
- “实际发生卡阻：电剪完好度 -X，先解除卡阻。”（仅有事件才显示）
- 错误工具必须解释**为什么不合适**，不只是 `Invalid tool` 或“请选另一件”。

**状态保持**：环境、工具信息和危险不会只在瞬时 toast 显示。危险标记可重新点开；历史事件在复盘里可查。普通成功反馈 2–4 秒自动收起（具体可 UX 验收），危险或维护动作必要时保留到用户确认/离开目标；不能无限霸占屏幕。

### 6.2 信息布局约束，解决“文字不知道放在哪里、相互交叉”

- 全局工具栏只负责“选中/状态/信息入口”，**不把所有操作说明塞在工具名里面**。工具条支持横向滚动或响应式分组；当前选中项和状态不得被裁剪。
- 目标附近只允许一个短胶囊提示或 risk anchor；详细内容进入固定的工具信息 Popover/侧栏。工具提示不盖住目标、行动面和相机控件。
- 原六个 area hotspot 文案不是教学主通道：切换为细小 camera marker 或可折叠“区域导航”，标明“仅移动相机”；工作中自动淡化，且不抢工具 raycast。
- 两种 viewport（1366×768、390×844）分别检查：文本不重叠、不盖工具栏、不挡玩家光标。中文长工具名换行/截断规则可访问 tooltip；不能造成点击边界偏移。
- HUD 显示当前 tool、目标（当命中时）、状态（ready/jammed/empty/broken）、完好度/电量、操作方式；必要时显示最近一次短反馈。避免同时显示大段教学词典。
- 鼠标不在目标上不应显示红色“错工具”警报；目标在实际工作面中进入视线，提示更新应及时但不闪烁。加入短暂稳定阈值/防抖只影响视觉，不影响权威动作校验。

### 6.3 i18n（en-US / zh-CN）不能只翻菜单

当前 `src/i18n/dictionaries.ts` 只有基础菜单/工具名；`gameStore.ts`、`learningAdvice.ts`、`WorkReviewPanel.tsx`、`HazardTaskStage.tsx` 等有固定英文文案。为可教导的双语体验：

1. `reasonCode`、`actionCode`、`toolId`、`targetKind` 留在事件数据层，英文/中文仅在展示层解析。
2. 拆分工具静态知识与情境动态描述：`toolKnowledge` 可继续作为知识原始来源，但应有 `knowledgeKey` 或语言资源结构，术语不应同一工具在不同组件有不同译名。
3. 目标类别与风险按 locale 渲染；不能把“刀盘伤害风险”译成“电池耗尽”等错误知识。
4. 切换语言不会重新创建庭院、重置工具、改变电池与耐久、重新发生 hazard 事件、改变 visit ID / A/B comparable。
5. 已封存的历史查看时使用当前 locale 生成展示文字，事件 id/值不改。遇到未翻译的文字，在 CI 报缺键，而不是默默显示一半英语。
6. `lang`、宽度、字体和 screenreader 语义兼顾中英文，尤其危险信息与两个工具名称较长时的布局。

### 6.4 对用户主动试错的态度

不要加入“自动告诉你最好的工具”“每次错误都扣很多耐久”“任何可能危险的工作一律禁用”这种让玩家不敢探索的机制。工具教学应允许：
- **无代价看**：先观察、了解工具、尝试瞄准。
- **有意义的尝试**：选择工具、观察它为什么成功/为什么无效。
- **可理解的后果**：真正发生损伤/低效/返工时才出现合理成本及证据。
- **可比较改进**：下次换方法，同质量条件才比较效率。

## 7. 资产与外部成熟方案：借鉴解决问题，不引入新架构

### 7.1 已有资产与缺口

`src/features/yard/assets/modelCatalog.ts` 已有 CC0 庭院、两类割草机、修篱机、手剪、落叶耙、吹叶机、收集袋、打草机、蒲公英/绿篱素材。`GardenToolView` 也已给手修边器和手除草器提供**不冒充其他工具**的独立轮廓。

当前最重要的不是再找一组模型，而是把模型**与实际目标、操作范围、光标和世界状态对齐**。检查：
- `THREE.Box3().setFromObject` 测量不同 GLB 的本地包围盒和朝向；工具在镜头下始终可见、有正确地面高度和比例。
- 选中工具时的模型提示位置跟操作点而不是固定在花坛中心（除草器/耙子/袋子尤其明显）。保持工具与 collider 分开，避免展示模型自己吞掉 pointer。
- 视觉风险至少能够辨认 stone vs hardwood；石块暂可用有材质的 proxy，但不能让厚枝和石头画成相同灰球然后声称教学完成。
- 新素材必须写入 `docs/ASSET_MANIFEST.md`，核对许可和来源，优先使用现有已确认 CC0。**无需为这一轮开辟模型购物任务**。

### 7.2 官方/成熟实现优先级

| 已有或现成能力 | 解决什么 | 参考 |
|---|---|---|
| React Three Fiber pointer events, raycast and capture | 真实目标命中、阻止传播、拖动结束 | https://r3f.docs.pmnd.rs/api/events |
| Drei `OrbitControls`、可选 `CameraControls` | 相机旋转、平移、缩放、围绕目标、恢复视角 | https://drei.docs.pmnd.rs/controls/introduction ；https://threejs.org/docs/pages/OrbitControls.html |
| Drei `useGLTF` / Three `Box3` | 保留资产、位置/尺寸规范 | https://drei.docs.pmnd.rs/loaders/gltf-use-gltf ；https://threejs.org/docs/pages/Box3.html |
| Radix Tooltip / Popover | 工具 `!` 可访问说明、键盘、移动端点击弹层 | https://www.radix-ui.com/primitives/docs/components/tooltip ；https://www.radix-ui.com/primitives/docs/components/popover |
| Playwright Test / Trace Viewer | 每个浏览器 profile 隔离、真实点击拖拽、诊断未命中和覆盖问题 | https://playwright.dev/docs/trace-viewer ；https://playwright.dev/docs/browser-contexts |
| Vitest 现有测试 | 纯状态和数值守卫、事件幂等、工具参数测试 | 使用项目已有 `vitest` 配置，无需重建测试体系 |

推荐**先用现有依赖**，仅必要时引入 Radix 或 Playwright。所有新库先核对与仓库 Next 15 / React 19 / R3F 9 / Drei 10 的兼容；不要为了修一个 tooltip 更换前端技术栈。

## 8. 连续实施顺序（一个统一 feature，不逐个小点等待确认）

**原则**：下面不是“完成一个要回来问用户”的独立任务包，而是按依赖关系安排的**一次整体推进**。每段落地前复核实际代码，若已有实现则保留；每段完成留下客观证据继续向下。

### S0 — 冻结基线、守护存档与复现
- 核对当前分支最新 HEAD，确保从 `917d1a0` 的兼容演进开始；本地如已有未提交改动，先备份、记录 diff、保留现有成果。
- 现有 V06 作为重要回退点，创建如 `feature/v06-tool-judgment-interaction-polish` 后续 feature；不重写 main。
- 浏览器隔离 profile、存档快照导出/还原；搭建两个明显不同的测试起点：全新院子、旧 V06 存档。
- 先记录当前问题的可复现指针路径（点中杂草/花/石头/标签、切工具、转镜头、最后一次耗尽电池），没有复现的标注 `CODE_RISK` 而非 `BROWSER_CONFIRMED`。

**Gate S0**：原版旧存档未改，测试可重置，基线运行路径可复现。禁止为腾端口直接终止用户正在使用的 3000 生产服务；需要新测试服务时在其他端口运行并写明端口。已有 `exit 137` 清理旧进程不作为 build 故障。

### S1 — 统一输入与镜头（优先于视觉微调）
- 调整热点/raycast ownership，3D 画面真正使用工具时 camera hotspot 不能抢点击；让镜头操作在所有已选工具下可发现、可执行。
- 加上单一目标 ID 与有效 hit proxy，修复花坛点击漂移、重叠模型和拖动失焦。
- 完成基础 UI 胶囊提示：“可操作”“选择其他目标”“右键转镜头”等。

**Gate S1**：花坛、绿篱、草坪、修边、清理、石头所有区域均可从同一个庭院直接选择工具并操作；拖动不随镜头跳转终止；光标下的物体与实际处理目标一致；场景无 flash/remount。

### S2 — 统一 Preflight、工具 `!` 与情境风险
- 复用 `resolveToolTarget`，扩展真实 target/material/blocked/condition 等 context 的纯判定；指定 reasonCode 和 color/severity，而非新增 UI 内部 if-else 规则。
- 每件工具旁有可访问的信息入口，显示专业用途/典型误用；指向错误或危险物时出现情境红 `!`，解释非正常损耗的**可能性**，不是无条件扣费承诺。
- Hover / focus / camera movement 纯展示，无权威状态修改。

**Gate S2**：每件工具有完整信息；错误工具/石头/硬木/观赏花等目标能出现对应情境解释；在浏览器里预警未执行时工具完好度/电量/effort 不变，中文英文一致。

### S3 — 统一工具执行、消耗、维修与异常事件
- 把 lawn/sweep、hedge、edge、flowerbed、debris/hand actions 接入统一 action outcome+tool cost 语义，保留已有每个工具的**真实工作差异**。
- 修护 guard 在最后一单位资源消耗时漏算 wear；重复 topCut、无工作空扫、误点击、重复 overcut 必须和真实结果一致；手动 rake/bag 计正常 wear 及工具使用，吹叶机仅对实际运行/有效工作按合理单位计费。
- 保持 recharge/repair/jam 的资源隔离，封存后不可暗中维护、收费或更新；提供明确恢复 UI 和 effort/fee 账本。
- 危险行为只有实际碰撞才可额外损耗；高风险可直接阻断，不为了“模拟更真实”默认鼓励碰撞。

**Gate S3**：能对所有工具给出 deterministic 的 `before → action → after`，每项资源变化和事件一一对应；零电、卡阻、损坏、重复操作、同样路径不同采样密度全部符合统一规则。

### S4 — 作业动作的“好用”与现场教育
- 花坛“选中/轻按拔根 vs 扫过截顶”可视化；石头 Inspection 与 Clearance 各有不同结果；绿篱精剪/电剪差异，清扫/装袋和边缘修整动作完整。
- 结合工具模型 motion/cursor 与目标高亮和工作结果；修好静态工具漂在场景中、不能找到目标等问题。
- 不是在所有错误后贴大段教程，主要用**短反馈、变化的世界和可主动查看的信息卡**教学。

**Gate S4**：在 8–12 分钟完整路线中，无需 Cursor 口头提示，负责人可以操作所有 10 件工具；每件都有独特的有效/无效/风险体验，且看得出为何使用它。

### S5 — 双语、可访问、复盘与稳态
- `en-US/zh-CN` 关键动态理由、状态、`!` 卡片、危险处理、工具维护、反馈、Review/A-B 统一来自 reason codes。
- 禁止仅把 `event.explanation` 全句硬翻到 Store 造成英文中文数据不一致；存储稳定 code + params，旧历史事件可提供兼容 fallback。
- UI 响应式，长文本不交叉；工具栏、中间场景与弹层互不遮挡；信息卡和危险提示满足键盘/触屏可访问。
- 旧存档迁移应**保留**当前工具状态、访次、清理事实；新增的 event/condition 字段只做兼容式缺省补齐。

**Gate S5**：中文与英文都能运行整段流程；任一语言切换不会影响资源/世界/成绩；旧存档继续工作且浏览器不会白屏。

### S6 — 全项目真实浏览器验收、证据和交付
- 先跑 Typecheck/Lint/Test/Build，再跑真实浏览器 mouse/keyboard/touch 轨迹以及不同质量状态；整理 Trace 和按失败场景定位的截图/屏录，而不是凑图数量。
- 提供 `docs/V06_OWNER_PLAYTEST.md` 更新版，明确工具栏旁 `!` 的使用、哪类错误会真正产生磨损、左/右键和触屏镜头操作。
- 保留完整试用存档隔离说明、可复现 E2E 脚本、不同目标材料测试夹具、FPS 实测方式与结果。性能若未测标明 `NOT_MEASURED`，不可声称“流畅已验证”。
- 只 push feature，并报告 Commit/SHA、文件变化、测试结果、Browser PASS/FAIL、旧存档兼容与非阻断项。不合 main、不部署、不清除原始存档。

**Gate S6**：P0 和关键 P1 验收全 PASS 或明确列出未经验证的项；未通过的不标 DONE。试玩从 UI 真正完成，不用 Store 直接调用代替射线输入。

## 9. 客观验收矩阵（必须附可定位的自动化断言或浏览器证据）

此矩阵不是“越多越好”的测试数字。每一条有明确**操作、期望状态与失败条件**；如果测试依赖真实 3D 指针，**不得用 Store 直接调用冒充 browser PASS**。

### A. 真实目标与指针输入 I01–I13

| ID | 操作 | 必须成立的断言 / 失败条件 |
|---|---|---|
| I01 | 新庭院不点任何任务热点就打开工具栏 | 10 件工具 + Hands 均可见可选择；无任务区域权限锁 |
| I02 | 选择手除草器，将指针移到西侧第一株杂草，点击/执行 | 命中该 plantId，只改该植物 root，恰有一项动作结果 |
| I03 | 连续对 7 株不同杂草操作 | 每株 id 各自可达、能完成，没有点击到相邻花/相邻杂草 |
| I04 | 对已拔根位置再次点击 | 目标不存在或反馈已完成；零电量/耐久/effort 变化 |
| I05 | 杂草贴近花，悬停后操作 | 预览是鼠标真正指向的植株；执行结果与目标 ID 匹配 |
| I06 | 3D camera label 与割草/修边工作面重叠处拖动 | camera label 不吞业务操作，不意外聚焦或误发两次事件 |
| I07 | 只旋转/平移/缩放相机 | `GardenDomain.events`、`ToolInstance`、Visit summary 零变化 |
| I08 | 工作中从耙切换袋，从袋切换剪 | 无旧 layer ghost raycast，工具能力更新即时生效 |
| I09 | 开始拖动后离开 work mesh，再返回 | 状态安全结束或连续捕获，不能出现永久 `dragging=true` |
| I10 | 拖动中 Alt-Tab / 浏览器失焦 / pointercancel | 能干净解除 capture；之后重新操作正常 |
| I11 | 被遮挡的现有 GLB 与 hit proxy | 外观不重复、不吞点击；debug 显示目标层次一致 |
| I12 | 两指缩放/触屏操作（如设备支持） | 不误启动拖动施工；可明确切换观察/工作模式 |
| I13 | 鼠标/键盘/触屏打开工具 `!` 说明 | 卡片可关闭，焦点返回正确，不盖住当前目标 |

### B. 预警/感叹号与专业知识 I14–I25

| ID | 操作 | 必须成立的断言 / 失败条件 |
|---|---|---|
| I14 | 未选工具，打开手动/动力工具 info | 有用途、适用对象、操作方式、局限、维护、风险；静态知识和 profile 不冲突 |
| I15 | 选割草机，指向未清除石头附近 | 红 `!` + 目标风险说明出现；hover 期间 condition/resource 不变 |
| I16 | 移开光标离开石头区域 | 红 `!` 消退，不在全院无端一直显示 |
| I17 | 在另一块安全草地割草 | 远离石头可正常工作，不存在全局 hazard lockout |
| I18 | 选动力修篱机，指向硬木 | 红 `!` 解释厚硬枝、卡阻/异常损耗风险和正确办法 |
| I19 | 手除草器指向观赏花 | 风险说明指向“可能误拔花”，未执行时花不受损 |
| I20 | 线割机指向杂草 | 即使允许施工，仍明确说明顶部与根的区别；不会误显示拔根成功 |
| I21 | 收集袋指向未聚拢落叶 | 琥珀提示“先聚拢”，不得默认扣费/假装已装袋 |
| I22 | 吹叶机指向空地/已装袋区域 | 可解释无有效碎屑，空点不会直接扣一次固定电量 |
| I23 | 工具电池 0、卡住、损坏时指向正确目标 | 状态警告优先，提供准确修复方式；不产生工作结果 |
| I24 | 同一风险先 hover、再确实操作 | 预览零扣，真实事件才有可追溯成本/阻断；不可反过来 |
| I25 | 中英文切换同一工具/危险卡 | 风险等级、目标、数值、物理状态不变；术语等价且无关键英语泄漏 |

### C. 每个工具动作与后果 I26–I39

| ID | 操作 | 必须成立的断言 / 失败条件 |
|---|---|---|
| I26 | 手推滚刀机正向、倒向相同长度 | 正向有效窄割，倒退实际效率弱；方向判定真实且成本可解释 |
| I27 | 动力割草机与滚刀机分别走同长度路线 | 覆盖宽度/效率不同；动力耗电随有效路径而非 pointermove 频率 |
| I28 | 绿篱手剪短段 + 动力剪连续扫 | 单段/宽范围差异；枝屑落地、再清理可行 |
| I29 | 同一 cluster 在同手势重复采样 | 不重复 spawn、无伪装 overcut、无反复计费 |
| I30 | 明确进行第二次超剪（若允许） | 有显著提示和可见质量损害；事件/成本恰一次 |
| I31 | 手修边器工作 | edge 完成度改变、lawn 工作格不变 |
| I32 | 线割机修边再扫杂草 | 分别产生 edge 和 topCut；未拔根计数不变 |
| I33 | 手除草器对未截顶杂草 vs 已截顶草 | 两者均能真正除根，留可清理植物残余；不能一键错删花 |
| I34 | 杂草已 topCut 再 topCut | 不重复计算有效努力或额外耐久，除非真实可见的差异有证据 |
| I35 | 耙子将散落叶聚拢 | world debris state 合理变为 gathered，手工具磨损/使用记录一致 |
| I36 | 吹叶机推动碎屑/吹散已有堆 | 方向和散开效果可见，电量与真实运转匹配 |
| I37 | 袋子对堆 vs 对散落物 | 只完成实际 gathered pile；首次/重复分明且工具记录完整 |
| I38 | Hands 检查石头、移动石头 | 检查和移除分步骤、有不同视觉/事件，真实恢复附近工作空间 |
| I39 | Hands 面对绿篱硬木 | 不可凭一次普通点击无条件“捡掉粗硬木”；正确工具/绕开可被理解 |

### D. 耐久、存档、回顾与 A/B I40–I54

| ID | 操作 | 必须成立的断言 / 失败条件 |
|---|---|---|
| I40 | 本次成功动作恰好使 battery 归零 | 本次成功工作正常计 wear；下一次动作禁止执行 |
| I41 | 资源 0 / jammed / broken 对所有动力工具各测试一次 | 无有效工作、无假扣费，状态与恢复提示准确 |
| I42 | 修边工作已完成后再在同一点移动 | 若没有实际加工，零额外资源消耗/磨损 |
| I43 | 重复清理已 bagged 位置、重复拔已清杂草 | 结果幂等，world/tool/effort 不被二次改写 |
| I44 | Recharge 电池工具 | 只恢复 battery，不能修复 broken / jam；有一次明确 recovery effort |
| I45 | Repair broken tool | Condition 提升、状态修复，但不自动充电；费用/努力在账本中可核对 |
| I46 | Clear jam | 仅解除 jam，不自动恢复丢失 condition；有相应准备成本（若产品选择），不能无限复制无成本收益 |
| I47 | 任意工具 `condition=80` | UI 显示“完好度 80%”或“磨损 20%”，不可显示“磨损 80%” |
| I48 | 维修余额不足 | 明确显示支付方式/学习模式成本；不得暗中累计不平衡 debt ledger |
| I49 | Finish visit 后尝试 Recharge / Repair / Clear jam / rake / inspect | 所有写操作冻结；只能相机移动、Review 和 Try again |
| I50 | 旧 `yardshift-v03` 存档重新打开 | 旧事件/植物/资源/历史 preserved；新字段迁移不清空、不重算异常损耗 |
| I51 | 工具使用统计 | 手剪、耙、袋、拔草和动力工具均按真实有效/实际执行事件计入；纯选择不计实际使用 |
| I52 | 清理—剪绿篱—同地再清理 | 仅实际第二次聚拢/装袋才产生 spent rework；无额外伪造惩罚 |
| I53 | 同庭院完成 A/B 两次 | 不同 qualityBand 或明显不同覆盖不比较效率；相同质量才比较游戏建模 effort |
| I54 | 全程切换 en-US↔zh-CN、重复加载 | 语言与存档独立；工具状态、已封存记录和世界状态哈希不变 |

### E. 性能/布局/Owner I55–I64

| ID | 操作 | 必须成立的断言 / 失败条件 |
|---|---|---|
| I55 | 1366×768 全部工具+横向滚动/展开 | 任何工具不丢失、点击范围明确；气泡不遮主要工作区 |
| I56 | 390×844 移动视口 | 两种语言按钮与红 `!` 可见、可点击，不交叉重叠 |
| I57 | 镜头旋转/相机聚焦/工具切换 20 次 | Canvas 无重新挂载/白闪；工具连贯可见，无 pointer 泄漏 |
| I58 | 长拖动与多次 glTF 加载 | 浏览器 console 无未捕获异常、资源不无限增长；采集帧率和交互延迟 |
| I59 | 浏览器只靠 UI 完成完整施工路线 | 所有工具功能可操作，无 Store/测试内部命令代替真实指针 |
| I60 | 浏览器重做错误工具/石头/卡阻恢复路线 | 风险预览、实际结果、恢复动作在场景中清楚可辨 |
| I61 | 负责人独立试玩两次同院 | 可以回答工具用途、安全、根 vs 顶、返工原因；记录原话而非 Cursor 代答 |
| I62 | 人类尚未试玩 | 只能写 `HUMAN_NOT_TESTED`；不能以 I01–I60 全 PASS 代表教学效果已验证 |
| I63 | 浏览器错误提示与音频 | 不能只依赖颜色/声音/临时文字；键盘、触屏可取回重要风险 |
| I64 | Test/Typecheck/Lint/Build 全量回归 | 客观测试通过，保留前一版已有功能；新增测试质量不低于旧版 |

### 9.1 强制真实 UI 流程（不是只看操作说明）

**Route 1 — 自由判断正常施工**：新庭院 → 自主观测/用 info 看工具 → 调整镜头 → 检查石头 → 先处理危险 → 滚刀割部分草 → 线割修边 → 手动除草器拔草 → 绿篱剪裁剪 → 耙子聚拢 → 装袋 → Review → Finish。每一步记录状态差异和可见结果。

**Route 2 — 错误尝试/预警/修复**：选不适合的工具指向某目标 → 出现 reason-based `!`，不扣费 → 尝试错误动作（若不能执行则解释，不允许假进度；若真实碰撞则有具体异常事件） → 资源耗尽 → recharge → jam → clear / broken → repair → Continue → Finish。记录资源前后和事件证据。

**Route 3 — 现场工序与复盘**：先清东侧落叶 → 剪绿篱使同地变脏 → 再清理 → spent rework；Try again same fixture → 先剪绿篱再清理 → 同等质量时比较 effort。若质量不可比，应明确拒绝得出效率优劣。

**Route 4 — 相机/重叠/中文压力**：中英文切换、1366×768 与 390×844 视口、全院 orbit/pan/zoom、花坛点击 7 株密集植株、工具 `!` 弹层开关、拖动途中切换工具/失焦，不得出现不可恢复悬浮状态。

每条 route 必须给 `start save`、`screen coordinate or stable object selector`、指针动作、预期 world/condition/resource delta、截图或 trace 的具体文件名，以及失败定位。不能只写“clicked 5 actions / smoke pass”。

## 10. 交付包与停止条件

最终交付至少包含：

1. 本分支 SHA、ancestor、diff 概要、关键模块文件清单、源代码备份/测试隔离说明。
2. 本文件 G01–G20 修复对照表，每项注明 `CODE_FIXED` / `BROWSER_PASS` / `PARTIAL` / `NOT_TESTED` / `DEFERRED`，不许只写 DONE。
3. I01–I64 测试结果表，包括自动化**与真实浏览器**各自的通过率，所有 FAIL 有重现路径；不允许 `>=0` 之类没有实际内容的假断言。
4. 更新 `docs/V06_OWNER_PLAYTEST.md`：从 UI 打开 `!`、预警不扣费、故意错误操作如何显示、视角旋转/缩放、全部 11 种操作及资源检查、Try again 同院。
5. `docs/ASSET_MANIFEST.md` 中任何新 3D 资产来源/许可/局部位置记录；没有新素材也明确说明“复用现有 kit”。
6. 对“耗电/磨损/清理/修边/剪篱/除草/风险”的真实数值或规则做单一权威记录，明显区分 **game-modeled** 与现实制造商规格。
7. 浏览器两条正常路线 + 错误恢复 + 相机/中文场景的 Trace、控制台错误、FPS 实测说明；如果不能实测写 `NOT_MEASURED`，不可推断。
8. `HUMAN_NOT_TESTED` 必须原样保留，直到负责人实际独立试玩并记录观测结果；不以机器测试证明教学成功。

**停止条件**：
- 发现可能导致用户原存档损坏、无法回滚的迁移，立即停止相应变更并保留原始数据；对其他模块继续不破坏数据的工作。
- 用户当前本机 3000 生产服务不可被无声终止；需要运行额外服务时使用独立端口/独立进程。
- 不能通过**所有工具完整互动 + 工具风险预警一致 + 单一世界可靠操作 + 资源与结果对应 + 浏览器可走通**的主线前，不应将版本标为最终封版。
- 为了完美 3D 物理/昂贵模型采购/次要 UI 动画而推迟上述主线，不符合此次目标。

## 11. 最终 L0 回看（交付前再读一遍）

这是本文件最重要的独立审查。工程师/Cursor 在完成 S0–S6 后对每一项给出 **证据位置 + 玩家实际理解的变化 + 仍未知之处**。

| 检查问题 | 不合格的完成方式 | 真正符合 YardShift 目的的完成方式 |
|---|---|---|
| 玩家能识别工作目标吗？ | 仅增加热区并放几个标签 | 玩家自己找到石头/草/花/绿篱，并能通过外观和 Inspect 形成判断 |
| 玩家知道怎么操作吗？ | 全部按钮都可点，但没有可发现手势 | 动作提示清楚，点击、拖动、镜头操作互不混淆 |
| 玩家知道工具为何不同吗？ | 仅翻译工具名字/更换模型 | 真实覆盖、精度、根/顶、力度/障碍差异在施工结果中可验证 |
| 玩家能正确理解风险吗？ | 错误目标总跳红提示/莫名扣耐久 | 只有真实风险才红，解释材料和潜在损耗；预览零扣，执行后果可追踪 |
| 玩家知道 condition 与 battery 的意义吗？ | 100% 磨损显示为高风险、任意动作都扣费 | 完好度和资源语义清楚，成本与实际工作量及危险事件相符 |
| 玩家懂得工序重要性吗？ | 写死“先剪后清正确顺序” | 同一院子允许自由顺序，第二次清理造成的真实返工可被看到和复盘 |
| 玩家懂得维护原因吗？ | 维修/充电都是“点一下状态归满” | 明确电池、磨损、卡阻不同，恢复有合理成本与可解释证据 |
| 玩家知道什么时候需要换工具吗？ | 一碰错的东西游戏直接替选工具 | 给原因与后果，允许自主选择正确工具或绕开目标 |
| 玩家可以自由观察吗？ | 只能鼠标滚轮放大，选中工具就无法转镜头 | 明确的 rotate/pan/zoom/focus/reset，且镜头操作不影响实际作业 |
| 玩家可以独立复盘迁移吗？ | Cursor 报 200 个单测 PASS 就宣称学会 | 玩家用同场景不同办法重做，能独立解释自己为什么改变做法 |

**最后产品定义**：不是把“正确工具提示”做得越来越多，而是把**线索和后果做得越来越真实、可观察、可比较**；这才让人学会使用工具与现场判断，而不是学会点击教程。

---

## 12. 可直接发送给 Cursor 的完整执行摘要

> 本轮请以 `feature/v06-final-playable-closure` @ `917d1a0` 的最新兼容提交为基础，创建独立 feature 分支，在同一个持续可操作庭院中完成这份全局交互和工具判断升级。请先保护未提交代码和用户存档，并按 S0–S6 连续实施，不逐项停下来等待下一条命令。 
>
> 核心是修正透明 hotspot/raycast 命中冲突、花坛可点性、石头与硬木的专业安全处理、全局工具栏 `!` 介绍和真实目标动态风险提醒、相机旋转/平移/缩放手势、所有 10 件工具与 Hands 的实际操作完成度、资源/磨损/卡阻/维修的统一模型，以及中英动态教学反馈与工作复盘。
>
> 工具错误目标出现红色 `!` 时应解释潜在异常损耗和合适处理方式；**预警/悬停不能扣资源，只有明确执行且对应真实后果的动作才能产生异常磨损**。重用现有规则和官方 R3F/Drei/成熟 UI 组件，避免另造引擎或重构正确的 world state。
>
> 完成 G01–G20 和 I01–I64 中相关硬性验收；至少用真实浏览器操作完整 Route 1–4，不能用 Store 直调用替代 3D 指针验收。最后附新 feature SHA、Typecheck/Lint/Test/Build、真实浏览器 trace、FPS、双语检查、全部工具的操作/消耗对照表、Owner Playtest 与剩余非阻断问题。不得合并 main、部署、清理存档或杀掉现有的 3000 服务。保留人类学习结果为 `HUMAN_NOT_TESTED`，直到产品负责人实际试玩。

