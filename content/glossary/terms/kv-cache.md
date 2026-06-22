# KV缓存

KV Cache 是 LLM 推理优化中的核心技术。在自回归生成中，每个新 token 都需要 attend 到之前所有的 token，如果不缓存 Key 和 Value，每次生成都要重新计算，造成巨大浪费。KV Cache 在首次 Prefill 阶段计算出所有历史 token 的 K 和 V 并缓存，后续 Decode 阶段只需计算新 token 的 Q，三者做 attention即可。显存占用估算：2 × n_layers × 2 × seq_len × n_heads × head_dim × batch_size × bytes_per_param。

## 详细解释

本文档正在完善中，敬请期待。

## 应用场景

本文档正在完善中，敬请期待。

## 相关概念

本文档正在完善中，敬请期待。

## 参考资料

本文档正在完善中，敬请期待。
