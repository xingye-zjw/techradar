[前端开发]

## JavaScript this指向问题

// 快速修复

使用箭头函数、bind绑定this、明确调用上下文

// 现象表现

- × 回调函数中this是undefined
- × class方法中this丢失，调用属性时报错
- × 严格模式下this不是window而是undefined

// 排查步骤

- 01 用箭头函数替代普通函数，箭头函数继承外层作用域的this
- 02 在class constructor中使用bind(this)绑定方法
- 03 用call/apply/bind显式指定this的指向

#JavaScript#this#前端

---

[前端开发]

## React useEffect依赖数组陷阱

// 快速修复

正确添加依赖项、使用useCallback/useMemo、开启ESLint插件检查

// 现象表现

- × effect不执行或无限循环执行
- × 拿到的是旧的state值（闭包陷阱）
- × 依赖数组省略导致逻辑异常

// 排查步骤

- 01 检查依赖数组是否完整，确保所有外部变量都被列入
- 02 开启eslint-plugin-react-hooks的exhaustive-deps规则
- 03 用useCallback包裹函数、useMemo包裹对象，避免不必要的重渲染

#React#Hooks#闭包

---

[前端开发]

## 移动端适配问题（viewport/rem）

// 快速修复

使用flexible方案、正确设置viewport meta标签、采用响应式布局

// 现象表现

- × 不同手机显示差异大，布局错乱
- × 小屏幕显示不全，元素超出视口
- × 大屏幕元素太小，留白过多

// 排查步骤

- 01 设置正确的viewport meta标签：width=device-width, initial-scale=1.0
- 02 用rem/vw/vh做响应式单位，配合postcss-px-to-viewport等工具
- 03 用Chrome DevTools设备模拟器测试多种分辨率和机型

#移动端#响应式#适配

---

[前端开发]

## 内存泄漏导致页面越来越卡

// 快速修复

组件卸载时清理副作用、移除定时器和事件监听器、避免循环引用

// 现象表现

- × 页面长时间使用后变卡，交互响应变慢
- × 内存持续增长，不回落
- × 切换页面后内存不释放，占用越来越高

// 排查步骤

- 01 用Chrome DevTools的Memory面板做堆快照分析
- 02 在useEffect中返回清理函数，移除定时器、事件监听等
- 03 检查全局变量、DOM引用、闭包是否持有大对象导致无法回收

#内存泄漏#性能#前端

---
