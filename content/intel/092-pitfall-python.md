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
- × FutureWarning 关于 inplace 参数已废弃
- × 链式赋值值未正确设置
- × 数据清洗后部分值未按预期修改

// 排查步骤

- 01 永远不使用链式赋值，改用 df.loc 或 df.iloc 条件索引
- 02 避免使用 inplace=True 参数（Pandas 已将其标记为 deprecated）
- 03 使用 df._is_view 判断是否为视图或副本
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

- × a == 256 返回 True 但 a is 256 返回 False
- × 小整数（-5~256）在不同变量间 is 比较为 True
- × 大整数 is 比较结果不确定
- × 依赖 is 比较进行条件判断出现异常

// 排查步骤

- 01 Python 对小整数（-5~256）有缓存，这些整数是同一个对象
- 02 使用 == 判断值相等，is 只判断是否是同一对象
- 03 is 仅用于和 None、True、False 比较，或判断对象身份
- 04 避免用 is 比较整数、字符串、列表等可变对象的值

#Python#语言特性#数值稳定性
