---
title: Python 开发常见踩坑合集
category: devops
difficulty: beginner
duration: 30分钟
summary: 涵盖 5 个常见踩坑：Python 环境依赖冲突导致 import 失败、pandas inplace=True 链式赋值警告、可变默认参数导致函数行为异常、循环变量闭包捕获导致预期外结果、整数缓存导致 == 和 is 行为不一致，每个均附快速修复与排查步骤。
takeaways:
  - 掌握「Python 开发常见踩坑合集」中各问题的快速识别方法 - 理解每个踩坑的根因分析和排查步骤 - 学会标准化的修复流程和预防措施
relatedIntel:
  - 010-numpy-pandas - 009-linux
tags:
  - DevOps
  - 部署
  - 运维
  - 容器
relatedTerms:
  - git
  - docker
  - linux
  - kubernetes
relatedTools:
  - mlflow
  - docker
  - kubernetes
relatedNodes:
  - docker-basic
  - devops-kubernetes
---

[环境配置]

## Python 环境依赖冲突导致 import 失败

// 快速修复

conda create 独立环境 → pip install 分批安装 → freeze 导出依赖

// 现象表现

- × ImportError: cannot import name 'xxx'
- × libtorch_cuda.so is not a symbol
- × 不同项目需要不兼容的包版本

// 排查步骤

- 01 每个项目独立创建 conda/venv 虚拟环境，避免全局环境污染
- 02 创建干净环境后分批安装依赖，避免 pip 和 conda 混用
- 03 使用 freeze 导出 requirements.txt 锁定依赖版本
- 04 torch 等重型库只用 pip install，不用 conda install

#Python#环境配置#依赖管理

---

[环境配置]

## pandas inplace=True 链式赋值警告

// 快速修复

使用 df.loc[mask, 'col'] = value 替代 df[mask]['col'] = value

// 现象表现

- × SettingWithCopyWarning 警告
- × FutureWarning 关于链式赋值可能产生副本视图歧义
- × 链式赋值值未正确设置
- × 数据清洗后部分值未按预期修改

// 排查步骤

- 01 永远不使用链式赋值，改用 df.loc 或 df.iloc 条件索引
- 02 显式使用 df = df.assign(...) 或 df = df.copy() 后再修改，避免视图副本歧义（inplace=True 虽有废弃讨论但 pandas 2.x 仍支持，关键是不链式赋值）
- 03 判断副本时用 pd.util.infer_option('mode.copy_on_write') 或直接 df.copy() 显式复制
- 04 优先使用链式操作返回值而非 inplace 修改

#Pandas#Python#数据处理

---

[环境配置]

## 可变默认参数导致函数行为异常

// 快速修复

默认参数使用 None，函数内部再赋值

// 现象表现

- × 函数多次调用后列表/字典非空
- × 测试用例相互影响
- × 第一次调用正常，后续调用异常

// 排查步骤

- 01 Python 默认参数在函数定义时求值而非调用时
- 02 检查函数定义中的可变默认参数（[]、{}、set()）
- 03 用 None 作为默认值，函数内部初始化可变对象
- 04 使用 pylint 或 ruff 等工具检测可变默认参数

#Python#语言特性#内存安全

---

[环境配置]

## 循环变量闭包捕获导致预期外结果

// 快速修复

闭包中用默认参数捕获变量值

// 现象表现

- × 循环创建函数/线程，所有回调得到相同结果
- × 闭包返回的值都是循环最后一个值
- × lambda 表达式在列表推导中行为异常

// 排查步骤

- 01 循环中的闭包变量会在迭代后求值，需在定义时捕获
- 02 使用默认参数在函数定义时求值的特性捕获当前值
- 03 避免在循环中直接定义闭包/lambda
- 04 也可使用生成器表达式或 functools.partial 解决

#Python#语言特性#并发

---

[环境配置]

## 整数缓存导致 == 和 is 行为不一致

// 快速修复

比较整数用 ==，判断同一对象用 is

// 现象表现

- × a == 257 返回 True 但 a is 257 返回 False
- × 小整数（-5~256）在不同变量间 is 比较为 True
- × 大整数 is 比较结果不确定
- × 依赖 is 比较进行条件判断出现异常

// 排查步骤

- 01 Python 对小整数（-5~256）有缓存，这些整数是同一个对象
- 02 使用 == 判断值相等，is 只判断是否是同一对象
- 03 is 仅用于和 None、True、False 比较，或判断对象身份
- 04 避免用 is 比较整数、字符串、列表等可变对象的值

#Python#语言特性#数值稳定性

## 修复后附加：最小一键诊断命令

```bash
# DevOps 最小自检：Docker/K8s/磁盘空间/SSH 端口 10 秒内出结论
set -e
echo '--- docker ---' && (docker info 2>/dev/null | head -n 5 || echo 'docker unavailable')
echo '--- disk ---'   && df -h / | tail -n 1
echo '--- k8s ---'    && (kubectl cluster-info 2>/dev/null | head -n 3 || echo 'kubectl unavailable')
echo '--- ssh 22 ---' && (timeout 3 bash -c 'cat < /dev/tcp/127.0.0.1/22' >/dev/null 2>&1 && echo open || echo closed)
```
