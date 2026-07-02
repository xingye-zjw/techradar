---
title: Streamlit 快速构建 AI 可视化界面
category: devops
keywords:
  - streamlit
  - web ui
  - demo
  - visualization
  - interactive
difficulty: beginner
duration: 1周
summary: 只用 Python 就能把模型变成带滑块/图片/图表的交互式网页，是 AI demo 的第一生产力
takeaways:
  - 掌握 Streamlit 的声明式 API：st.title、st.slider、st.file_uploader、st.image、st.dataframe、st.plotly_chart
  - 理解 Session State 原理与写法，能在多次 rerun 之间保存状态
  - 会用 st.sidebar / st.columns / st.expander 做布局，能快速搭建 YOLO 风格检测 Demo
  - 知道 @st.cache_data / @st.cache_resource 的使用场景，避免重复加载大模型
relatedTools: streamlit
relatedIntel:
  - 007-docker
  - 008-git
  - 009-linux
relatedNodes:
  - electrical-safety
---

## 为什么你要学它

你花了一周训练了一个漂亮的 YOLO 模型，检测视频效果非常棒。但你的老板、客户、同学看不懂 `.pt` 文件，他们只想：**在网页里点一下、上传一张图、看到检测结果**。这时候 Streamlit 就是最省力的答案。

**Streamlit 最核心的设计理念是："把 Python 脚本当网页跑"。**

- 你不用写 HTML/CSS/JS，也不用懂 React/Vue
- 你不用写路由、不用写模板、不用写前端组件
- **每写一行 Python 代码就是在画一个 UI 组件**——标题、滑块、上传框、图表、图片、按钮
- 每次用户交互（比如拖了滑块、上传了图片），整个脚本会从上到下重新跑一遍，这叫 "rerun"——你只要按普通 Python 脚本来思考代码就行了

做一个模型 Demo，**Streamlit 花 1 小时，手写 Flask + React 花 1 周**。这就是它在 AI 工程师圈里这么火的原因。

## 一句话概览（快速版）

- **组件（Widget）**：`st.slider / st.file_uploader / st.button / st.selectbox / st.text_input / st.image / st.dataframe / st.plotly_chart`，全是现成的
- **数据流动**：脚本从上到下执行一次 → 用户交互触发 rerun → 你根据组件当前值算新结果 → 渲染
- **跨 rerun 状态**：`st.session_state["key"]` 存值，下次 rerun 还在
- **性能缓存**：`@st.cache_data` 缓存数据/函数返回值，`@st.cache_resource` 缓存大对象（模型、数据库连接）
- **布局三件套**：`with st.sidebar:`、`col1, col2 = st.columns(2)`、`with st.expander("详情"):`

## 核心拆解

### 🔑 最常用组件速查

```python
import streamlit as st
import pandas as pd
import numpy as np
from PIL import Image

# -------- 文本展示 --------
st.title("🔥 YOLO 目标检测 Demo")
st.header("第 1 节：图像结果")
st.subheader("输入与输出")
st.markdown("**加粗**、*斜体*、[链接](https://streamlit.io)、`内联代码`")
st.write("st.write 可以接受几乎任何东西：str、DataFrame、图表、图片…")
st.code(
    "model = YOLO('yolov8n.pt')\nresults = model(img)",
    language="python",
)

# -------- 交互控件（它们都会返回值） --------
name = st.text_input("你的名字", value="World")
age = st.slider("年龄", min_value=0, max_value=100, value=25, step=1)
confidence = st.slider("置信度阈值", 0.0, 1.0, 0.25, 0.05)
model_name = st.selectbox("选择模型大小", ["yolo11n.pt", "yolo11s.pt", "yolo11m.pt", "yolo11l.pt", "yolo11x.pt"])
category = st.multiselect("只看这些类别", ["cat", "dog", "car", "person"], default=["person"])
uploaded = st.file_uploader("上传图片", type=["jpg", "jpeg", "png"])
clicked = st.button("开始检测", type="primary")    # primary 就是醒目的蓝按钮
if st.checkbox("显示原始图片"):
    st.write("你勾上了")

# -------- 数值展示 --------
st.metric("检测目标数", value=5, delta=+2)          # 主指标 + 变化量

# -------- 表格 / DataFrame --------
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "score": [92, 85, 78],
})
st.dataframe(df)                                     # 可交互表格（排序、过滤、放大）
st.table(df)                                          # 静态表格
st.json({"best_epoch": 12, "val_acc": 0.9421})       # 以 JSON 查看器显示

# -------- 图片 --------
if uploaded is not None:
    img = Image.open(uploaded)
    st.image(img, caption="上传的图片", use_container_width=True)

# -------- 图表 --------
# 简单折线图
hist_df = pd.DataFrame({
    "train_loss": np.random.rand(10),
    "val_loss": np.random.rand(10),
})
st.line_chart(hist_df)
st.bar_chart(pd.DataFrame(np.random.randint(0, 100, (5, 3)), columns=["A", "B", "C"]))

# -------- 进度条 / 状态 --------
import time
with st.spinner("正在检测中..."):
    time.sleep(1.0)                       # 假装在跑模型
st.success("✅ 检测完成")
st.info("提示：置信度阈值越低，检测到的目标越多")
st.warning("⚠️ 注意：小模型速度快但精度较低")
```

### 🔑 布局：sidebar / columns / expander / tabs / container

```python
# 侧边栏：把配置项放这里，主区域留给内容
with st.sidebar:
    st.title("⚙️ 参数设置")
    model_name = st.selectbox("模型", ["yolo11n.pt", "yolo11s.pt", "yolo11m.pt"])
    conf = st.slider("置信度", 0.0, 1.0, 0.25)
    iou = st.slider("IoU", 0.0, 1.0, 0.45)
    st.divider()
    st.caption("© Demo by Trae")

# 多列布局
col1, col2 = st.columns(2)
with col1:
    st.header("输入")
    st.image("https://placehold.co/400x300/png", caption="原图")
with col2:
    st.header("检测结果")
    st.image("https://placehold.co/400x300/png", caption="带框输出")

# 可折叠内容（放日志、调试信息等次要内容）
with st.expander("👉 查看详细日志"):
    st.text("Epoch 1/10 loss=0.542 val_acc=0.82\n...")

# 多 Tab 切换
tab1, tab2, tab3 = st.tabs(["📷 图片检测", "🎞️ 视频检测", "📊 训练曲线"])
with tab1:
    st.write("这里放图片检测界面")
with tab2:
    st.write("这里放视频检测界面")
with tab3:
    st.line_chart(pd.DataFrame(np.random.rand(20, 2), columns=["train", "val"]))

# container：把一组内容包起来
with st.container(border=True):
    st.markdown("**这块内容有边框，像是一个卡片**")
```

### 🔑 Session State：在多次 rerun 之间保存数据

Streamlit 每有一次用户交互（比如滑块动了一下），脚本就会从上到下再跑一遍。如果你不做任何处理，**脚本里定义的普通 Python 变量每次都会被重置**。这时候用 `st.session_state` 存"状态"：

```python
# 1. 初始化（只在第一次运行时跑）
if "counter" not in st.session_state:
    st.session_state.counter = 0
if "history" not in st.session_state:
    st.session_state.history = []

# 2. 读取
st.write(f"当前计数 = {st.session_state.counter}")

# 3. 修改
def inc():
    st.session_state.counter += 1
st.button("点我 +1", on_click=inc)

def reset():
    st.session_state.counter = 0
st.button("重置", on_click=reset)

# 4. 记录历史
if st.button("把当前计数加入历史"):
    st.session_state.history.append(st.session_state.counter)
if st.session_state.history:
    st.line_chart(st.session_state.history)
```

**一个典型场景**：用户上传了图片 → 点了按钮检测 → 页面 rerun → 如果你没把图片存在 session_state 里，图片就没了。只要写成 `st.session_state["image"] = img`，下次 rerun 它还在。

### 🔑 缓存：避免每次 rerun 都重新加载模型

模型加载是"一次性重操作"——几十秒到几分钟都可能。Streamlit 提供两种缓存装饰器：

```python
# @st.cache_resource：缓存"资源对象"，如模型、数据库连接、大文件
# 它不会尝试深拷贝这个对象，适合"一次性创建、复用"的东西
@st.cache_resource
def load_yolo_model(name: str):
    from ultralytics import YOLO
    model = YOLO(name)
    return model

# 切换模型时会重新 load，但同一模型只加载一次
model = load_yolo_model(st.session_state.get("model_name", "yolo11n.pt"))


# @st.cache_data：缓存"数据"，如预处理结果、API 调用
@st.cache_data
def preprocess(uploaded_bytes):
    import io
    from PIL import Image
    return Image.open(io.BytesIO(uploaded_bytes)).convert("RGB")
```

**经验法则**：**装模型/装 tokenizer → cache_resource；计算结果/预处理数据 → cache_data**。

### 🔑 表单与按钮组合

有些场景你不想用户动一个控件就整页重算（比如多个参数一起提交），用 `st.form` 把它们包起来，只有在点"提交"按钮时才会触发 rerun：

```python
with st.form("inference_form"):
    col1, col2 = st.columns(2)
    with col1:
        conf = st.slider("置信度", 0.0, 1.0, 0.25)
        iou = st.slider("IoU", 0.0, 1.0, 0.45)
    with col2:
        size = st.select_slider("输入尺寸", options=[320, 640, 1280], value=640)
        show_labels = st.checkbox("在框上显示标签", value=True)
    submitted = st.form_submit_button("🚀 开始检测", use_container_width=True)

if submitted:
    st.success(f"已提交: conf={conf:.2f}, iou={iou:.2f}, size={size}")
```

### 🔑 状态管理与文件读取的完整示例

```python
# 用户上传图片 → 保存到 session_state → 任何控件交互时它都不会丢
up = st.file_uploader("上传图片", type=["jpg", "jpeg", "png"])
if up is not None:
    st.session_state["user_image"] = Image.open(up)

if "user_image" in st.session_state:
    st.image(st.session_state["user_image"], caption="上传的图片", use_container_width=True)
else:
    st.info("👆 请先上传一张图片")
```

## 完整跑通方案

**第一步：安装依赖并创建 app.py**

```bash
pip install streamlit ultralytics pillow pandas
touch app.py
```

**第二步：写一个完整的 YOLO 目标检测网页**

```python
# app.py
import io
import os
import time
from collections import Counter

import pandas as pd
import streamlit as st
from PIL import Image
from ultralytics import YOLO

st.set_page_config(
    page_title="YOLO 目标检测 Demo",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ================ 侧边栏：参数设置 ================
with st.sidebar:
    st.title("⚙️ 参数")
    st.divider()

    model_choice = st.selectbox(
        "模型",
        ["yolo11n.pt", "yolo11s.pt", "yolo11m.pt", "yolo11l.pt", "yolo11x.pt"],
        help="越大越准但越慢",
    )
    conf = st.slider("置信度阈值", 0.0, 1.0, 0.25, 0.05)
    iou = st.slider("IoU 阈值", 0.0, 1.0, 0.45, 0.05)
    show_labels = st.checkbox("在检测框上显示类别名", value=True)
    show_conf = st.checkbox("在检测框上显示置信度", value=True)

    st.divider()
    st.caption("© Trae AI Demo")

# ================ 主区域 ================
st.title("🔍 YOLO 目标检测 Demo")
st.caption("上传图片 → 即时检测 → 查看各类别统计")

# 缓存加载模型（同一个模型名只会加载一次）
@st.cache_resource(show_spinner="加载模型中...")
def load_model(name: str) -> YOLO:
    return YOLO(name)

model = load_model(model_choice)
st.success(f"✅ 已加载模型：{model_choice}")

# 上传图片
uploaded = st.file_uploader("上传一张图片", type=["jpg", "jpeg", "png"])

if uploaded is None:
    st.info("👆 请先上传一张图片，或访问 https://ultralytics.com/assets/ 找示例图")
    st.stop()

# 保存到 session_state，避免后续 rerun 丢数据
st.session_state["uploaded_bytes"] = uploaded.getvalue()
image = Image.open(io.BytesIO(st.session_state["uploaded_bytes"])).convert("RGB")

col1, col2 = st.columns(2)
with col1:
    st.subheader("📷 原图")
    st.image(image, use_container_width=True)
    st.caption(f"尺寸: {image.size[0]}x{image.size[1]}")

with col2:
    st.subheader("🎯 检测结果")
    start = time.time()
    results = model(
        image,
        conf=conf,
        iou=iou,
        verbose=False,
    )
    elapsed = time.time() - start

    annotated = results[0].plot(
        labels=show_labels,
        conf=show_conf,
    )
    # numpy BGR → RGB，供 st.image 显示
    st.image(annotated[..., ::-1], use_container_width=True)
    st.caption(f"推理耗时: {elapsed:.3f} 秒")

# 统计检测结果
st.subheader("📊 检测统计")
names = results[0].names                         # {0: 'person', 1: 'bicycle', ...}
boxes = results[0].boxes                         # 所有检测框
if boxes is None or len(boxes) == 0:
    st.warning("⚠️ 没有检测到目标，试着降低置信度阈值看看")
else:
    class_ids = [int(cls) for cls in boxes.cls.tolist()]
    class_names = [names[cid] for cid in class_ids]
    counts = Counter(class_names)

    c1, c2 = st.columns(2)
    with c1:
        st.metric("检测目标总数", len(class_ids))
    with c2:
        st.metric("类别数", len(counts))

    df = pd.DataFrame(counts.most_common(), columns=["类别", "数量"])
    st.bar_chart(df.set_index("类别"))
    st.dataframe(df, use_container_width=True)

# 显示框坐标详情
with st.expander("👉 查看每个检测框的详细坐标与置信度"):
    rows = []
    for i, (xyxy, conf_val, cls) in enumerate(zip(
        boxes.xyxy.tolist(), boxes.conf.tolist(), boxes.cls.tolist()
    )):
        rows.append({
            "#": i + 1,
            "类别": names[int(cls)],
            "置信度": round(float(conf_val), 3),
            "x1": round(xyxy[0], 1),
            "y1": round(xyxy[1], 1),
            "x2": round(xyxy[2], 1),
            "y2": round(xyxy[3], 1),
        })
    st.dataframe(pd.DataFrame(rows), use_container_width=True)
```

**第三步：本地运行**

```bash
streamlit run app.py
# 浏览器会自动打开 http://localhost:8501
```

你也可以指定端口、关闭自动打开浏览器：

```bash
streamlit run app.py --server.port 8080 --server.headless true
```

**第四步：部署到公网**

最简单的方式是用 Streamlit Community Cloud（免费）：

```bash
# 1. 把 app.py + requirements.txt 推到 GitHub
echo "streamlit>=1.36" > requirements.txt
echo "ultralytics>=8.2" >> requirements.txt
echo "pillow>=10.0" >> requirements.txt
echo "pandas>=2.0" >> requirements.txt

git init
git add app.py requirements.txt
git commit -m "feat: YOLO demo"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<你的仓库>.git
git push -u origin main
```

然后打开 https://streamlit.io/cloud → Connect GitHub → 选择你刚刚的仓库 → 选择 `app.py` → 部署。几秒后你会拿到一个公开链接（形如 `https://<你的项目>.streamlit.app`），把它发给任何人都能直接使用。

**第五步：把 session_state / 缓存用到极致**

```python
# 把上一次的推理结果缓存起来，下次用户还看同一模型+同一张图就不重复推理
@st.cache_data
def cached_predict(image_bytes, model_name, conf, iou):
    from ultralytics import YOLO
    model = YOLO(model_name)
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return model(img, conf=conf, iou=iou, verbose=False)
```

## 常见误区

**误区 1：把模型加载写在顶层（不缓存）→ 每次 rerun 都要等几十秒，页面完全不可用**

解释：Streamlit 默认每次 rerun 都会从头到尾执行一遍脚本。模型加载要写在 `@st.cache_resource` 装饰的函数里，并且接收"模型名"作为 key 让它区分不同模型。

**误区 2：用普通 Python 变量（`counter = 0`）存状态 → 每次用户动控件，变量被重置为 0**

解释：任何想在多次 rerun 之间保留的东西（计数器、用户上一张图、上传文件的缓存），都要用 `st.session_state["xxx"]` 存。

**误区 3：`if st.button("检测"):` 里改了 session_state 但页面已经画完了 → 要下一次 rerun 才会显示新结果**

解释：按钮触发后当前这一次 rerun 里写的 session_state 会生效，但页面渲染顺序是"从上到下"。如果你的显示逻辑在按钮上面，看到的还是"旧值"。推荐把 session_state 的修改放在 `on_click=` 回调函数里，或把显示逻辑放在按钮块之后。

**误区 4：图片显示前没把 numpy BGR 转成 RGB → 显示出来的图像颜色是反的（蓝色的天空、红人的脸）**

解释：OpenCV / YOLO 的 plot() 返回的是 BGR 顺序的 numpy 数组，Pillow / st.image 期望的是 RGB。**务必 `annotated[..., ::-1]` 交换通道**。

**误区 5：`st.write(model(image))` 直接把复杂对象传给 st.write → 页面渲染出错或显示一长串 `<ultralytics.engine.results.Results object>`**

解释：st.write 只是"尽量去渲染"，它不会调用 model() 内部的可视化方法。用 `results[0].plot()` 拿到 PIL 可显示的图像 numpy 数组，再 `st.image(...)` 渲染。

**误区 6：`num_workers=4` 用在 Windows 的 Streamlit 服务器脚本里 → 子进程爆掉整个 App**

解释：这其实不是 Streamlit 的问题，而是 PyTorch DataLoader 在 Windows 上用多进程不稳定。模型推理代码中 num_workers 统一设 0 即可。

**误区 7：不调用 `st.set_page_config` → 页面标题是默认的、手机上布局很挤**

解释：`st.set_page_config(page_title="你的标题", layout="wide")` 是最佳实践，并且必须放在脚本最前面（任何组件之前），否则会报错。

**误区 8：把 `st.stop()` 放在 `if uploaded is None: ...` 后面却忘了 → 即使没有图片也会往下执行一堆 null reference 错误**

解释：`st.stop()` 是"中断当前脚本执行"——非常适合提前中止。但你一定要在"没有东西可渲染"的时候才用它。上面的例子里如果用户还没上传图片，`st.stop()` 之后所有后面的代码都不会执行，很干净。
