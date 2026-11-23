export type LocaleId = "en-US" | "zh-CN";

export const LOCALE_STORAGE_KEY = "yardshift-locale";

const en: Record<string, string> = {
  "nav.taskBoard": "Task Board",
  "nav.yard": "Yard",
  "garden.title": "Saturday morning garden",
  "garden.prompt": "Take a look around. What would you do first?",
  "garden.inspect": "Inspect",
  "garden.plan": "Work plan",
  "garden.review": "Work review",
  "garden.finish": "Finish visit",
  "garden.reset": "Reset garden",
  "garden.focusArea": "Look here",
  "garden.cameraOnly": "Camera only",
  "garden.cameraHint":
    "Left-click to work · Right-drag to orbit · Scroll to zoom · Middle-drag to pan · ⟲ resets view",
  "garden.resetCamera": "Reset view",
  "garden.sealedBanner":
    "Visit sealed — yard is view-only. Open Work review or Try again (same yard).",
  "toolbar.label": "Tools",
  "toolbar.hands": "Hands / Inspect",
  "toolbar.handsHint":
    "Select a tool, then work on matching targets in the yard.",
  "toolbar.toolInfo": "Tool info",
  "toolbar.recharge": "Recharge",
  "toolbar.clearJam": "Clear jam",
  "toolbar.repair": "Repair",
  "toolbar.repairHint":
    "Repair restores condition (garden visit: recovery effort; battery unchanged)",
  "toolbar.condition": "condition",
  "toolbar.wear": "wear",
  "toolbar.sealed": "view only",
  "tool.goodFor": "Good for",
  "tool.limit": "Limit",
  "tool.check": "Check first",
  "tool.name.manual-reel-mower": "Manual Reel Mower",
  "tool.name.lawn-mower": "Lawn Mower",
  "tool.name.hand-hedge-shears": "Hand Hedge Shears",
  "tool.name.hedge-trimmer": "Hedge Trimmer",
  "tool.name.hand-edger": "Hand Edger",
  "tool.name.string-trimmer": "String Trimmer",
  "tool.name.hand-weeder": "Hand Weeder",
  "tool.name.rake": "Leaf Rake",
  "tool.name.leaf-blower": "Leaf Blower",
  "tool.name.bag": "Garden Bag",
  "hazard.stone": "Stone",
  "hazard.hardwood": "Thick wood",
  "hazard.tapInspect": "Tap to inspect material",
  "hazard.moveAside": "Hands: move stone aside",
  "hazard.markAvoid": "Mark and avoid — not hand-clearable",
  "weed.topCutAction": "String trimmer: top-cut weed",
  "weed.alreadyTopCut": "Tops cut — switch to hand weeder",
  "weed.pullRootAction": "Hand weeder: pull roots",
  "intent.no-target": "Point at a yard target to preview this tool.",
  "intent.tool-broken": "Tool is broken — repair before use.",
  "intent.tool-jammed": "Tool is jammed — clear the jam first.",
  "intent.tool-empty": "No power left — recharge or refill first.",
  "intent.risk-stone-uninspected":
    "Possible hidden stone near the blades — inspect with Hands before cutting here.",
  "intent.risk-stone-blocks":
    "Stone in the path — move it aside or steer around; blades are blocked here until cleared (no wear while blocked).",
  "intent.risk-hardwood-uninspected":
    "Thick wood may be in this hedge — inspect before running the powered trimmer.",
  "intent.risk-hardwood-blocks":
    "Hardwood blocks the powered trimmer here — mark and avoid (no wear while blocked).",
  "intent.hazard-inspect": "Inspect this hazard to learn the material.",
  "intent.hardwood-needs-tool":
    "Thick entangled wood cannot be lifted by hand — mark it and keep powered trimmers away.",
  "intent.hazard-clear-stone": "Move this stone aside with Hands.",
  "intent.risk-flower-pull":
    "This looks ornamental — pulling may damage a flower, not a weed.",
  "intent.risk-flower-trim":
    "String trimmer is too coarse here — ornamental plants may be damaged.",
  "intent.already-top-cut":
    "Tops already cut — roots remain. Use the hand weeder; no extra wear.",
  "intent.top-cut-ok":
    "String trimmer will cut tops only — roots stay in the soil.",
  "intent.bag-needs-pile":
    "No gathered pile nearby — rake first, then stand next to the pile.",
  "intent.blow-empty":
    "Nothing in the blower cone — aim toward debris (no battery used yet).",
  "intent.warn-abnormal-wear":
    "Warning only — no wear until you actually contact the hazard.",
  "intent.pull-root": "Pull the weed at the root.",
  "intent.top-cut": "Cut weed tops only.",
  "intent.mow": "Mow along a path.",
  "intent.cut-hedge": "Trim hedge growth.",
  "intent.edge": "Work the lawn edge.",
  "intent.rake": "Rake debris into a pile.",
  "intent.blow": "Blow debris along your aim.",
  "intent.bag": "Bag a gathered pile.",
  "event.topcut": "Tops cut — roots remain. Pull properly later.",
  "event.pull": "Root removed. Debris may need cleanup.",
  "event.hazard": "Hazard moved aside — that patch is safer for blades.",
  "event.hazard-hardwood":
    "Thick wood cannot be lifted by hand — mark and avoid.",
  "event.hazard-need-inspect": "Inspect first — identify the material.",
  "event.rake": "Raked leaves along the path.",
  "event.rake-miss": "Nothing to rake here — move closer to scattered debris.",
  "event.blow": "Blower moved debris in the aim direction.",
  "event.blow-miss":
    "Nothing in the blower cone — aim toward debris (no battery used).",
  "event.bag": "Bagged gathered pile(s).",
  "event.bag-miss":
    "No gathered pile nearby — rake first, then stand next to the pile.",
  "event.top-already":
    "Tops already cut — roots remain. Use the hand weeder; no extra wear.",
  "common.close": "Close",
  "lang.en": "English",
  "lang.zh": "中文",
  "legacy.note": "Legacy v0.2 (English)",
  "garden.stat.lawn": "Lawn",
  "garden.stat.hedge": "Hedge",
  "garden.stat.debris": "Debris",
  "area.lawn": "Front lawn",
  "area.hedge": "Side hedge",
  "area.flowerbed": "Flower border",
  "area.edge": "Path edge",
  "area.debris": "Fallen leaves & clippings",
  "area.hazard": "Inspect hazards",
  "plan.title": "My arrangement",
  "plan.hint":
    "Optional notes for yourself — not a required order. Skip anytime and work where you see fit.",
  "review.titleVisit": "Visit summary",
  "review.titleWork": "Work review",
  "review.intro":
    "From what you actually did — not a fixed “wrong order” penalty.",
  "review.band.acceptable": "Acceptable coverage for this visit",
  "review.band.needs-attention":
    "Needs attention — safety or damage issues remain",
  "review.band.incomplete":
    "Incomplete — finishing records honesty, not a professional seal",
  "review.metric.lawn": "Lawn done",
  "review.metric.edge": "Edge done",
  "review.metric.productive": "Productive",
  "review.metric.setup": "Setup / prep",
  "review.metric.rework": "Rework (spent)",
  "review.metric.recovery": "Recovery",
  "review.lawnIncomplete":
    "Lawn about {pct}% finished — major open grass still uncut.",
  "review.edgeIncomplete":
    "Path edge about {pct}% finished — mowing alone does not tidy the edge.",
  "review.hedgeOvergrown": "{count} hedge clusters still overgrown.",
  "review.weedsRoots":
    "{count} weeds still have roots (top-cutting is not enough).",
  "review.flowersDamaged": "{count} ornamental flowers damaged.",
  "review.debrisLoose": "{count} debris piles still on the ground.",
  "review.hazardsPresent": "{count} hazards still present.",
  "review.reworkSpent":
    "You spent {amount} effort units re-cleaning areas that had already been cleared and then dirtied again.",
  "review.redirtSpentAgain":
    "{count} new clipping pile(s) landed on previously cleaned ground — you already cleaned some of that again.",
  "review.redirtPending":
    "{count} new clipping pile(s) landed on previously cleaned ground — still waiting for a second cleanup (not yet counted as spent rework).",
  "review.littleRework":
    "Little spent rework — cleanups stayed ahead of new clippings where you worked.",
  "review.finishOk":
    "Safety and coverage look acceptable for finishing this visit.",
  "review.finishPartial":
    "More work remains — you can still finish and record an honest partial result.",
  "review.fromActions": "From your actions",
  "review.compareTitle": "Visit A/B compare",
  "review.compareEffort":
    "Prior total {prior} · This {current} (game-modeled effort)",
  "review.approachHint":
    "One possible approach (not the only good one): clear local hazards → work that drops debris → gather once. Your path can differ if quality and safety hold.",
  "review.close": "Close",
  "review.keepWorking": "Keep working",
  "review.finishVisit": "Finish this visit",
  "review.tryAgain": "Try again (same yard)",
  "review.done": "Done",
  "review.retryConfirm":
    "Retry the same yard conditions? Sealed visit summaries are kept for A/B compare. Current unfinished work resets.",
  "advice.reworkGather":
    "You re-cleaned ground that had already been cleared after new clippings landed there.",
  "advice.redirtSpawn":
    "New clippings landed on previously cleaned ground — a second cleanup would become spent rework.",
  "advice.topCutRoots":
    "String trimmer cut tops only — roots still count until you pull them.",
  "advice.ornamentalDamage":
    "An ornamental was damaged — that mark stays for this visit.",
  "advice.edgeSeparate":
    "Open lawn can look done while the path edge is still ragged — edge work is separate.",
  "advice.hazardsBlock":
    "Unresolved hazards still block powered blades in their local area.",
  "advice.hedgeOvercut":
    "An overcut notch will not heal by dragging again — it is a lasting quality mark.",
  "compare.noPrior": "No prior sealed visit to compare.",
  "compare.fixtureMismatch":
    "Fixture versions differ — do not compare efficiency.",
  "compare.safetyDiffers":
    "Safety or ornamental damage differs — compare quality first, not speed.",
  "compare.bandDiffers":
    "Quality band differs ({prior} vs {current}) — do not compare efficiency.",
  "compare.coverageDiffers":
    "Final coverage/quality differs — cannot fairly compare efficiency.",
  "compare.ok":
    "Same fixture and similar final quality — effort differences are meaningful.",
  "compare.priorSafety": "Prior damage {damage}, hazards {hazards}.",
  "compare.thisSafety": "This visit damage {damage}, hazards {hazards}.",
  "compare.priorLawnBand": "Prior lawn {pct}% ({band}).",
  "compare.thisLawnBand": "This lawn {pct}% ({band}).",
  "compare.priorCoverage": "Prior lawn {lawn}% / edge {edge}%.",
  "compare.thisCoverage": "This lawn {lawn}% / edge {edge}%.",
  "compare.reworkMore":
    "This visit spent {amount} more rework effort (same-area second cleanups).",
  "compare.reworkLess": "This visit spent {amount} less rework effort.",
  "compare.effortHigher": "Total game-modeled effort was {amount} higher.",
  "compare.effortLower": "Total game-modeled effort was {amount} lower.",
  "compare.toolsDiffer": "Different tools used this time: {tools}.",
  "tool.knowledge.manual-reel-mower.bestFor":
    "Controlled passes; Working carefully near flower borders",
  "tool.knowledge.manual-reel-mower.limit":
    "Barely cuts in reverse; slow on large open lawn.",
  "tool.knowledge.manual-reel-mower.effect":
    "A narrow cut strip appears only while you push forward.",
  "tool.knowledge.manual-reel-mower.check":
    "Clear stones in the pass; Plan a forward path",
  "tool.knowledge.lawn-mower.bestFor":
    "Open grass; Faster coverage when battery is ready",
  "tool.knowledge.lawn-mower.limit":
    "Needs battery; wider cut is less precise near ornamentals.",
  "tool.knowledge.lawn-mower.effect":
    "Wider cut path; battery drops with real travel distance.",
  "tool.knowledge.lawn-mower.check":
    "Check battery; Inspect for stones before spinning blades",
  "tool.knowledge.hand-hedge-shears.bestFor":
    "Short soft shoots; Precise outline work",
  "tool.knowledge.hand-hedge-shears.limit":
    "Slow on long runs; not for thick hardwood.",
  "tool.knowledge.hand-hedge-shears.effect":
    "One cluster trims; clippings fall under that face.",
  "tool.knowledge.hand-hedge-shears.check":
    "Confirm growth is soft enough; Watch for entanglement",
  "tool.knowledge.hedge-trimmer.bestFor":
    "Long east-hedge runs; When battery is charged",
  "tool.knowledge.hedge-trimmer.limit":
    "Hard wood can block the bar; overcutting leaves lasting notches.",
  "tool.knowledge.hedge-trimmer.effect":
    "Faster cluster cuts; clippings land on the ground below.",
  "tool.knowledge.hedge-trimmer.check":
    "Clear hardwood hazards nearby; Check battery",
  "tool.knowledge.hand-edger.bestFor":
    "Path edges after mowing; Controlled narrow work",
  "tool.knowledge.hand-edger.limit":
    "Does not replace open-lawn mowing; slower than powered trim.",
  "tool.knowledge.hand-edger.effect":
    "Independent edge segments tidy without changing lawn %.",
  "tool.knowledge.hand-edger.check":
    "Stay on the edge strip; Do not treat this as a mower",
  "tool.knowledge.string-trimmer.bestFor":
    "Quick top control; Path edges when careful",
  "tool.knowledge.string-trimmer.limit":
    "Does not remove roots; easy to nick flowers; needs battery.",
  "tool.knowledge.string-trimmer.effect":
    "Tops shrink; roots remain until a proper pull.",
  "tool.knowledge.string-trimmer.check":
    "Identify weeds vs ornamentals; Check battery",
  "tool.knowledge.hand-weeder.bestFor": "Pulling weeds by the root in beds",
  "tool.knowledge.hand-weeder.limit":
    "Slow on large patches; wrong plant damages ornamentals.",
  "tool.knowledge.hand-weeder.effect": "Root comes out; a small debris speck may remain.",
  "tool.knowledge.hand-weeder.check": "Confirm it is a weed, not an ornamental",
  "tool.knowledge.rake.bestFor": "Gathering scattered leaves into a pile",
  "tool.knowledge.rake.limit": "Does not bag; misses thin scatter far away.",
  "tool.knowledge.rake.effect": "Scattered debris becomes a gathered pile.",
  "tool.knowledge.rake.check": "Stand near scattered debris",
  "tool.knowledge.leaf-blower.bestFor": "Pushing debris along an aim direction",
  "tool.knowledge.leaf-blower.limit": "Scatters neat piles; needs battery.",
  "tool.knowledge.leaf-blower.effect": "Debris shifts in the aim cone.",
  "tool.knowledge.leaf-blower.check": "Aim toward debris; Check battery",
  "tool.knowledge.bag.bestFor": "Bagging a gathered pile you are next to",
  "tool.knowledge.bag.limit": "Empty ground does nothing; must be beside a pile.",
  "tool.knowledge.bag.effect": "Gathered pile is removed from the yard.",
  "tool.knowledge.bag.check": "Rake first; Stand next to the pile",
};

const zh: Record<string, string> = {
  "nav.taskBoard": "任务板",
  "nav.yard": "庭院",
  "garden.title": "周六清晨庭院",
  "garden.prompt": "先四处看看。你会先做什么？",
  "garden.inspect": "观察",
  "garden.plan": "工作计划",
  "garden.review": "工作复盘",
  "garden.finish": "结束本次访问",
  "garden.reset": "重置庭院",
  "garden.focusArea": "看这里",
  "garden.cameraOnly": "仅移动相机",
  "garden.cameraHint":
    "左键施工 · 右键拖动旋转 · 滚轮缩放 · 中键平移 · ⟲ 回到全院",
  "garden.resetCamera": "重置视角",
  "garden.sealedBanner":
    "访问已封存 — 庭院只读。打开复盘，或「再试一次（同院）」开始新尝试。",
  "toolbar.label": "工具栏",
  "toolbar.hands": "徒手 / 检查",
  "toolbar.handsHint": "先选工具，再对庭院里匹配的目标操作。",
  "toolbar.toolInfo": "工具说明",
  "toolbar.recharge": "充电",
  "toolbar.clearJam": "清除卡滞",
  "toolbar.repair": "修理",
  "toolbar.repairHint":
    "修理恢复完好度（庭院访问：消耗恢复努力；不自动充电）",
  "toolbar.condition": "完好度",
  "toolbar.wear": "磨损",
  "toolbar.sealed": "只读",
  "tool.goodFor": "适合",
  "tool.limit": "限制",
  "tool.check": "使用前检查",
  "tool.name.manual-reel-mower": "手推滚筒割草机",
  "tool.name.lawn-mower": "电动割草机",
  "tool.name.hand-hedge-shears": "修篱大剪刀",
  "tool.name.hedge-trimmer": "电动修篱机",
  "tool.name.hand-edger": "手修边器",
  "tool.name.string-trimmer": "打草机",
  "tool.name.hand-weeder": "手除草器",
  "tool.name.rake": "落叶耙",
  "tool.name.leaf-blower": "吹叶机",
  "tool.name.bag": "收集袋",
  "hazard.stone": "石块",
  "hazard.hardwood": "粗硬木",
  "hazard.tapInspect": "点击检查材质",
  "hazard.moveAside": "徒手：把石块挪开",
  "hazard.markAvoid": "标记并绕开 — 不能徒手清除",
  "weed.topCutAction": "打草机：截顶杂草",
  "weed.alreadyTopCut": "已截顶 — 换手除草器拔根",
  "weed.pullRootAction": "手除草器：拔根",
  "intent.no-target": "将指针移到庭院目标上，可预览此工具效果。",
  "intent.tool-broken": "工具已损坏 — 请先修理。",
  "intent.tool-jammed": "工具卡滞 — 请先清除卡滞。",
  "intent.tool-empty": "没有电量 — 请先充电或加油。",
  "intent.risk-stone-uninspected":
    "刀盘附近可能有隐藏石块 — 先用徒手检查，再在此处切割。",
  "intent.risk-stone-blocks":
    "路径上有石块 — 先挪开或绕开；此处刀片被阻挡，阻挡期间不扣磨损。",
  "intent.risk-hardwood-uninspected":
    "绿篱中可能有粗硬木 — 启动电动修篱机前请先检查。",
  "intent.risk-hardwood-blocks":
    "粗硬木在此处阻挡电动修篱机 — 请标记并绕开（阻挡期间不扣磨损）。",
  "intent.hazard-inspect": "检查此危险物，了解材质。",
  "intent.hardwood-needs-tool":
    "缠结的粗硬木无法徒手搬开 — 请标记并让电动修篱机远离。",
  "intent.hazard-clear-stone": "用徒手把石块挪到一边。",
  "intent.risk-flower-pull": "这更像观赏花 — 拔除可能损伤花卉，不是除草。",
  "intent.risk-flower-trim": "打草机在这里太粗暴 — 可能损伤观赏植物。",
  "intent.already-top-cut":
    "顶部已截断，根仍在 — 用手除草器；不会额外磨损。",
  "intent.top-cut-ok": "打草机只会截顶 — 根仍留在土中。",
  "intent.bag-needs-pile": "附近没有成堆落叶 — 先用耙子聚拢，再靠近装袋。",
  "intent.blow-empty": "吹风范围内没有碎屑 — 对准落叶（尚未耗电）。",
  "intent.warn-abnormal-wear": "仅预警 — 真正碰到危险物之前不会扣磨损。",
  "intent.pull-root": "从根部拔除杂草。",
  "intent.top-cut": "只截断杂草顶部。",
  "intent.mow": "沿路径割草。",
  "intent.cut-hedge": "修剪绿篱。",
  "intent.edge": "修整草坪边缘。",
  "intent.rake": "把碎屑耙成堆。",
  "intent.blow": "沿瞄准方向吹动碎屑。",
  "intent.bag": "装袋已聚拢的堆。",
  "event.topcut": "顶部已截断 — 根仍在。稍后需正确拔除。",
  "event.pull": "根已拔除。可能留下待清理碎屑。",
  "event.hazard": "危险物已挪开 — 该区域对刀片更安全。",
  "event.hazard-hardwood": "粗硬木无法徒手搬开 — 请标记并绕开。",
  "event.hazard-need-inspect": "请先检查 — 确认材质后再处理。",
  "event.rake": "已沿路径耙拢落叶。",
  "event.rake-miss": "这里没有可耙的碎屑 — 靠近散落落叶。",
  "event.blow": "吹叶机已沿瞄准方向推动碎屑。",
  "event.blow-miss": "吹风范围内没有碎屑 — 对准落叶（未耗电）。",
  "event.bag": "已装袋聚拢的落叶堆。",
  "event.bag-miss": "附近没有成堆落叶 — 先耙拢，再靠近装袋。",
  "event.top-already":
    "顶部已截断，根仍在 — 用手除草器；不会额外磨损。",
  "common.close": "关闭",
  "lang.en": "English",
  "lang.zh": "中文",
  "legacy.note": "旧版 v0.2（仅英语）",
  "garden.stat.lawn": "草坪",
  "garden.stat.hedge": "绿篱",
  "garden.stat.debris": "碎屑",
  "area.lawn": "前院草坪",
  "area.hedge": "侧边绿篱",
  "area.flowerbed": "花境",
  "area.edge": "小路边缘",
  "area.debris": "落叶与碎屑",
  "area.hazard": "检查危险物",
  "plan.title": "我的安排",
  "plan.hint": "可选的自我备忘 — 不是强制顺序。随时可跳过，按现场判断施工。",
  "review.titleVisit": "访问总结",
  "review.titleWork": "工作复盘",
  "review.intro": "根据你实际做过的事 — 不是固定的「顺序错误」扣分。",
  "review.band.acceptable": "本次访问覆盖可接受",
  "review.band.needs-attention": "需要留意 — 仍有安全或损伤问题",
  "review.band.incomplete": "未完成 — 结束只记录诚实结果，不是专业封口",
  "review.metric.lawn": "草坪完成",
  "review.metric.edge": "边缘完成",
  "review.metric.productive": "有效施工",
  "review.metric.setup": "准备 / 检查",
  "review.metric.rework": "返工（已消耗）",
  "review.metric.recovery": "恢复",
  "review.lawnIncomplete": "草坪约完成 {pct}% — 大片开阔草仍未割。",
  "review.edgeIncomplete":
    "小路边缘约完成 {pct}% — 只割草并不能修齐边缘。",
  "review.hedgeOvergrown": "仍有 {count} 簇绿篱未修剪。",
  "review.weedsRoots": "仍有 {count} 株杂草留根（截顶不够）。",
  "review.flowersDamaged": "有 {count} 株观赏花受损。",
  "review.debrisLoose": "地面仍有 {count} 堆碎屑。",
  "review.hazardsPresent": "仍有 {count} 处危险物未处理。",
  "review.reworkSpent":
    "你已花费 {amount} 单位努力，在已被清过又弄脏的区域再次清理。",
  "review.redirtSpentAgain":
    "有 {count} 堆新碎屑落在已清理过的地面 — 你已再次清理过其中一些。",
  "review.redirtPending":
    "有 {count} 堆新碎屑落在已清理过的地面 — 仍待二次清理（尚未计入已消耗返工）。",
  "review.littleRework":
    "返工很少 — 在你施工的地方，清理跟上了新碎屑。",
  "review.finishOk": "安全与覆盖对本访问来说可接受，可以结束。",
  "review.finishPartial":
    "仍有工作未完成 — 你仍可结束并记录诚实的部分结果。",
  "review.fromActions": "来自你的操作",
  "review.compareTitle": "访问 A/B 比较",
  "review.compareEffort": "上次合计 {prior} · 本次 {current}（游戏化努力）",
  "review.approachHint":
    "一种可能做法（不是唯一好办法）：先清局部危险物 → 做会产生碎屑的活 → 再集中收一次。只要质量与安全成立，路径可以不同。",
  "review.close": "关闭",
  "review.keepWorking": "继续施工",
  "review.finishVisit": "结束本次访问",
  "review.tryAgain": "再试一次（同院）",
  "review.done": "完成",
  "review.retryConfirm":
    "用相同庭院条件重试？已封存的访问总结会保留供 A/B 比较。当前未完成工作会重置。",
  "advice.reworkGather":
    "你在新碎屑落下后，再次清理了已经清过的地面。",
  "advice.redirtSpawn":
    "新碎屑落在已清理过的地面 — 二次清理会变成已消耗返工。",
  "advice.topCutRoots": "打草机只截了顶 — 根仍算数，直到你拔除。",
  "advice.ornamentalDamage": "观赏植物受损 — 本访问会保留这个痕迹。",
  "advice.edgeSeparate":
    "开阔草坪看起来完成时，小路边缘仍可能凌乱 — 修边是独立工作。",
  "advice.hazardsBlock": "未处理的危险物仍在局部阻挡动力刀片。",
  "advice.hedgeOvercut": "过切缺口不会因再拖一次而愈合 — 这是持久的质量痕迹。",
  "compare.noPrior": "没有先前已封存的访问可比较。",
  "compare.fixtureMismatch": "场景版本不同 — 不要比较效率。",
  "compare.safetyDiffers":
    "安全或观赏损伤情况不同 — 先比质量，不要比速度。",
  "compare.bandDiffers":
    "质量档不同（{prior} 对 {current}）— 不要比较效率。",
  "compare.coverageDiffers": "最终覆盖/质量不同 — 无法公平比较效率。",
  "compare.ok": "同一场景且最终质量相近 — 努力差异有参考意义。",
  "compare.priorSafety": "上次损伤 {damage}，危险物 {hazards}。",
  "compare.thisSafety": "本次损伤 {damage}，危险物 {hazards}。",
  "compare.priorLawnBand": "上次草坪 {pct}%（{band}）。",
  "compare.thisLawnBand": "本次草坪 {pct}%（{band}）。",
  "compare.priorCoverage": "上次草坪 {lawn}% / 边缘 {edge}%。",
  "compare.thisCoverage": "本次草坪 {lawn}% / 边缘 {edge}%。",
  "compare.reworkMore": "本次多消耗了 {amount} 返工努力（同区二次清理）。",
  "compare.reworkLess": "本次少消耗了 {amount} 返工努力。",
  "compare.effortHigher": "游戏化总努力高出 {amount}。",
  "compare.effortLower": "游戏化总努力低了 {amount}。",
  "compare.toolsDiffer": "本次使用了不同工具：{tools}。",
  "tool.knowledge.manual-reel-mower.bestFor":
    "可控行程；靠近花境时谨慎作业",
  "tool.knowledge.manual-reel-mower.limit": "倒退几乎不切；大面积开阔草坪偏慢。",
  "tool.knowledge.manual-reel-mower.effect": "只有向前推进时才会出现窄割幅。",
  "tool.knowledge.manual-reel-mower.check": "清开路径上的石块；规划前进路线",
  "tool.knowledge.lawn-mower.bestFor": "开阔草坪；电池充足时更快覆盖",
  "tool.knowledge.lawn-mower.limit": "需要电池；靠近观赏植物时精度较差。",
  "tool.knowledge.lawn-mower.effect": "割幅更宽；电量随真实行驶距离下降。",
  "tool.knowledge.lawn-mower.check": "检查电量；启动刀片前先检查石块",
  "tool.knowledge.hand-hedge-shears.bestFor": "短软新梢；精细轮廓",
  "tool.knowledge.hand-hedge-shears.limit": "长距离偏慢；不适合粗硬木。",
  "tool.knowledge.hand-hedge-shears.effect": "修剪一簇；碎屑落在该面下方。",
  "tool.knowledge.hand-hedge-shears.check": "确认枝条够软；留意缠结",
  "tool.knowledge.hedge-trimmer.bestFor": "东侧长绿篱；电池充足时",
  "tool.knowledge.hedge-trimmer.limit": "硬木可能卡住刀杆；过切留下持久缺口。",
  "tool.knowledge.hedge-trimmer.effect": "更快成片修剪；碎屑落在地面。",
  "tool.knowledge.hedge-trimmer.check": "清开附近粗硬木危险；检查电量",
  "tool.knowledge.hand-edger.bestFor": "割草后的小路边缘；可控窄作业",
  "tool.knowledge.hand-edger.limit": "不能替代开阔草坪割草；比动力修边慢。",
  "tool.knowledge.hand-edger.effect": "独立修边段变整齐，不改变草坪完成度。",
  "tool.knowledge.hand-edger.check": "留在边缘带上；不要当割草机用",
  "tool.knowledge.string-trimmer.bestFor": "快速截顶；小心时也可修边",
  "tool.knowledge.string-trimmer.limit": "不能去根；容易伤花；需要电池。",
  "tool.knowledge.string-trimmer.effect": "顶部缩小；根仍在，需正确拔除。",
  "tool.knowledge.string-trimmer.check": "分清杂草与观赏植物；检查电量",
  "tool.knowledge.hand-weeder.bestFor": "在花境里连根拔除杂草",
  "tool.knowledge.hand-weeder.limit": "大片偏慢；拔错会损伤观赏植物。",
  "tool.knowledge.hand-weeder.effect": "根被拔出；可能留下一点碎屑。",
  "tool.knowledge.hand-weeder.check": "确认是杂草而不是观赏植物",
  "tool.knowledge.rake.bestFor": "把散落落叶耙成堆",
  "tool.knowledge.rake.limit": "不能装袋；远处薄散落可能够不到。",
  "tool.knowledge.rake.effect": "散落碎屑变成成堆。",
  "tool.knowledge.rake.check": "靠近散落碎屑站立",
  "tool.knowledge.leaf-blower.bestFor": "沿瞄准方向推动碎屑",
  "tool.knowledge.leaf-blower.limit": "会吹散整齐的堆；需要电池。",
  "tool.knowledge.leaf-blower.effect": "碎屑在吹风锥内移动。",
  "tool.knowledge.leaf-blower.check": "对准碎屑；检查电量",
  "tool.knowledge.bag.bestFor": "装走你身旁已聚拢的堆",
  "tool.knowledge.bag.limit": "空地无效；必须紧挨成堆。",
  "tool.knowledge.bag.effect": "成堆从庭院移除。",
  "tool.knowledge.bag.check": "先耙拢；站在堆旁",
};

export const DICTIONARIES: Record<LocaleId, Record<string, string>> = {
  "en-US": en,
  "zh-CN": zh,
};
