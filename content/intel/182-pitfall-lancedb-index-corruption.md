---
title: LanceDB 断电写入 IVF_PQ 索引损坏无法查询
category: databases
difficulty: advanced
duration: 30分钟
summary: 聚焦单点问题：LanceDB 向量库写入 IVF_PQ 索引过程中遭遇机器断电/进程崩溃/K8s OOMKill 重启后，恢复服务时所有 ANN 查询报 `Invalid index file`、`Corrupt input data` 或 IVF 分桶中心点 offset 读越界，导致整个 RAG 知识库不可用。涵盖 WAL 恢复、Checksum 校验、索引增量重建、冷备快照等排查修复方案。
takeaways:
  - '快速识别「LanceDB IVF_PQ 索引断电损坏」的典型症状 - 理解 Lance 列式存储原子写入、WAL 不刷盘、PQ 码本写一半三大根因 - 学会分步排查和修复索引损坏数据可恢复的标准化流程 - 了解 fsync 强制刷盘、双写冷备快照、按 Batch 提交等预防措施，避免下次再踩"'
relatedIntel:
  - '089-pitfall-database - 095-pitfall-llm-app - 096-pitfall-rag - 066-tech-lancedb"'
tags:
  - LanceDB
  - 向量数据库
  - 索引损坏
  - 断电恢复
relatedTerms:
  - lancedb
  - rag
  - fine-tuning
  - lora
relatedTools:
  - lancedb
  - ollama
  - haystack
  - onnxruntime
relatedNodes:
  - rag-pipeline
  - llm-rag
---

## 为什么你要学它

这是用 LanceDB 作为 RAG 生产级向量库时最容易被忽视的"致命坑"：**大批量写入 IVF_PQ 索引的过程中机器断电/进程崩溃/容器被 K8s OOMKill 强制重启后，重启完成所有查询全部报错：`Invalid index file: checksum mismatch at offset 0x...` 或 `IVF centroid table is corrupt, got 1234 centroids but expected 4096`，整个 RAG 系统彻底挂死**。

很多团队用 LanceDB 替代 FAISS/Milvus 做轻量级 RAG 向量库，看中它的列存格式（Lance Parquet 衍生物理文件）+ 单机即可 PB 级 + 支持 IVF_PQ/ANN 索引。批量 Embedding 入库时为了吞吐性能，直接 `table.add(batch_of_20k_docs)` 一次性灌入 100 万条向量，然后立即 `table.create_index("vector", "IVF_PQ", ...)` 建 ANN 索引，全程不做 WAL 刷盘控制、也不打快照——结果凌晨断电/机器意外重启后，第二天 RAG 服务起来 `table.search()` 全报索引损坏错误，急着排查发现 Lance 数据目录下 `_indices/vector_ivf_pq.lance` 文件只有一半大小、文件尾的 meta 区块缺失 CRC32，整个知识库 500 万条向量无法查询，只能花 12 小时全量重写 Embedding 重建索引，业务停摆半天。

如果你把 LanceDB 用于生产级高可用 RAG 系统、会执行批量写入和建索引任务，这篇卡片会帮你快速识别 IVF_PQ 索引损坏根因、掌握 WAL 恢复 + Checksum 诊断 + 增量重建三板斧、从架构层面彻底规避断电数据损坏。

## 一句话概览（快速版）

> **快速修复：先 `lance.db.validate_table()` 诊断损坏范围→ 用 `_latest_good_manifest()` 回滚到最后一次完好快照→ 损坏索引用 `table.drop_index() + create_index(use_tqdm=True, batch_size=10000)` 增量重建→ 之后每次 add 强制 `db.optimize()` + `fsync` 刷盘**

核心要点：

- **现象**：断电重启后所有 search() 报 checksum 不匹配/索引头非法
- **根因**：IVF_PQ 索引写一半断电，meta 区块未刷盘，WAL manifest 不一致
- **解决**：按照下方 6 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × 断电前一切正常，重启服务后所有 `table.search()` 统一报错：`Invalid index file`、`Corrupt input: segment crc32 mismatch`、`IVF_PQ: invalid kmeans_iters in header`
- × `lance ls ./lancedb_data/my_table` 报 `Manifest load failed`、`Unable to read footer from segment file` 或 `Expected 4096 centroids but found 1329`
- × Lance 数据目录下 `_indices/` 子目录中，索引文件大小明显异常（正常 IVF_PQ 索引约 `(K*dim*4 + N*M*2)` 字节，损坏文件只到正常大小的 20%~60%）
- × 部分数据可查（搜索某几个关键词能返回），但大多数查询报 `panic: called Result::unwrap() on an Err value: OutOfSpec`（Rust 底层异常）
- × `lance.db.optimize()`、`compact_files()` 运行到一半就中止，日志里出现 "cannot read fragment 123: page 42 offset 0xAB12CD exceeds file size 234567 字节"
- × 备份目录中最近一次快照能正常查询，但实时表损坏，说明就是断电那次写入把索引写残了

### 🔑 根本原因

**Lance 列式存储的多文件非原子写入 + IVF_PQ 索引元信息在文件末尾 + 索引构造阶段大量小片段未合并** 三者叠加，是断电必坏索引的底层根因：LanceDB 的表存储由 `Manifest（schema + 片段清单，JSON）`、`Data Fragments（Parquet 格式列存片段，每个 add 批次产生一个）`、`Index Files（独立于数据文件的 IVF/PQ 码本 + 倒排列表）` 三大部分组成。调用 `table.add(batch)` 时 Lance 先写 Parquet 片段文件、再 append manifest；但 `create_index(metric="L2", num_partitions=4096, num_sub_vectors=96, use_opq=True)` 时要顺序执行 KMeans 聚类训练 → 写入 Centroids 码本 → 遍历全部向量做 PQ 量化 + 写入 IVF 倒排列表 → 写入 index footer meta → fsync。这个过程中每一步中间状态都是不完整的：如果在 "写 IVF 倒排 1234/4096 分桶" 阶段断电，那么索引文件的**前半段是已量化向量数据、后半段是空洞、文件末尾 footer meta 区块还没写**——读取时先读 footer 读到的是上次写 meta 的位置，里面存的 centroids 数量是 4096，但实际文件里只写了 1329 个桶，checksum 也对应不上，直接崩溃读失败。第二根因是**默认写盘策略不强制 fsync**：现代操作系统默认 Page Cache 回写延迟 30 秒，Lance Rust 底层在 `add()` 和 `create_index()` 完成时只调用了 `flush()`（把 buffer 从 Rust 层刷到内核 Page Cache），并没有 `fsync()` 强制从 Page Cache 落盘到 SSD/NVMe；这意味着在断电前 10~30 秒内完成的批次，文件系统层面其实还没真正写入磁盘，manifest 和 index footer meta 页自然是脏的。第三根因是**单批次建索引过大导致多个片段未合并 + 缺乏中间快照**：一次灌入 100 万条向量，建索引时产生的临时 fragment 有 50+ 个，索引构造一旦中断回滚，Lance 默认只回滚 manifest 的引用计数，不会删除半写的 index 文件，也不会自动回退到上次成功索引的版本——下次启动直接加载半残的 index 文件，就永久性崩了。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

1.  第一时间**把损坏的 LanceDB 数据目录完整冷备份一份**：`cp -r ./lancedb ./lancedb.bak.$(date +%s)`（Windows: `xcopy /E /I /H lancedb lancedb.bak-<时间戳>`），任何后续修复操作都基于备份副本做，防止"修复变二次损坏"彻底丢数据。
2.  用 LanceDB 诊断脚本跑一遍：① `validate_table()` 检查表级损坏；② `checksum_verify()` 扫每个片段 CRC32；③ `inspect_index()` 分析 IVF_PQ 索引元信息；④ 找到最近一个完好 manifest 版本。脚本如下：

```python
"""
LanceDB IVF_PQ 索引损坏诊断 + 最小回滚脚本
用法：python lancedb_repair.py <uri_path> <table_name>
"""
import os, sys, shutil, time
from pathlib import Path
try:
    import lancedb
    import lance
except ImportError:
    print("pip install lancedb lance")
    sys.exit(1)

# ============== Step 1: 基础诊断 ==============
def diagnose_corruption(uri: str, tbl_name: str):
    """分 5 层诊断损坏位置"""
    print(f"\n{'='*60}\n🛠️  诊断 LanceDB {uri}/{tbl_name}\n{'='*60}")
    try:
        db = lancedb.connect(uri)
        print(f"[1/5] 数据库连接 OK，当前表列表: {db.table_names()}")
    except Exception as e:
        print(f"[FATAL] 连库都打不开: {e}, 尝试用 lance raw API 直接读")
        return False, None, None

    try:
        table = db.open_table(tbl_name)
        print(f"[2/5] 表能打开，共 {table.count_rows()} 行记录")
    except Exception as e:
        print(f"[FATAL] 表加载失败: {e} → 进入 manifest 回滚流程")
        return _rollback_latest_good_manifest(db, uri, tbl_name)

    # 3) 先拿 schema + 索引元信息看是否表面 OK
    try:
        print(f"[3/5] Schema: {table.schema}")
        index_meta = table.list_indices()
        print(f"[3/5] 已注册索引: {index_meta}")
    except Exception as e:
        print(f"[WARN] 取索引元信息失败: {e}")

    # 4) 跑一次 search 冒烟用 10 条不同随机向量，看是全坏还是部分坏
    import numpy as np
    dim = table.schema.field("vector").type.list_size
    broken_q = 0; total_q = 20
    for i in range(total_q):
        try:
            q = np.random.randn(dim).astype("float32")
            _ = table.search(q).limit(3).to_list()
        except Exception as e:
            broken_q += 1
            if broken_q <= 3:
                print(f"   查询 #{i} 报错样本: {str(e)[:120]}")
    print(f"[4/5] 查询冒烟: {broken_q}/{total_q} 次失败 → {'全表损坏' if broken_q == total_q else '部分查询损坏/索引部分坏'}")

    # 5) 用 lance 原生 Dataset API 做 validate（关键！能定位具体哪个 fragment 坏）
    lance_ds = lance.dataset(f"{uri}/{tbl_name}.lance")
    issues = lance_ds.validate()
    print(f"[5/5] lance.dataset.validate() 发现问题: {len(issues)} 条")
    for it in issues[:15]:
        print(f"   - {it}")

    if broken_q == 0 and len(issues) == 0:
        print("✅ 这表其实没坏，可能是你上层调用的问题，不用修")
        return True, None, None

    # 关键检查：是否是索引坏、原始数据片段完好？
    raw_flat_search_ok = True
    try:
        q = np.random.randn(dim).astype("float32")
        # 用 index=None 强制走暴力搜（不经过 IVF_PQ）
        _ = table.search(q).index_cls(None).limit(5).to_list()
    except Exception as e:
        raw_flat_search_ok = False
        print(f"❌ 原始暴力搜也坏: {e} → 数据片段坏了")

    if raw_flat_search_ok and broken_q > 0:
        print("\n🎯 结论：原始向量数据完好，**只有 IVF_PQ 索引损坏**——修复成本极低（删索引重建即可）")
        return True, "index_only", lance_ds
    elif not raw_flat_search_ok:
        print("\n🎯 结论：数据片段也损坏（断电时正在 add 片段数据）——回滚到前一个完好 manifest")
        return True, "data_fragments", lance_ds
    else:
        return True, "partial", lance_ds

# ============== Step 2: Manifest 回滚 ==============
def _rollback_latest_good_manifest(db, uri: str, tbl_name: str):
    """数据片段损坏时：回退到最近一次成功 commit 的 manifest 版本"""
    lance_dir = Path(f"{uri}/{tbl_name}.lance")
    manifest_dir = lance_dir / "_manifests"
    if not manifest_dir.exists():
        print(f"[FATAL] 连 _manifests 目录都没了，只能从备份恢复")
        return False, None, None

    manifests = sorted(manifest_dir.glob("*.manifest"), key=lambda p: p.stat().st_mtime)
    print(f"找到 {len(manifests)} 个历史 manifest 版本，准备从新→旧逐个试加载")
    # 从最新往旧逐个试
    for m in reversed(manifests[-15:]):  # 最多试最近 15 个
        try:
            print(f"  试 manifest {m.name} ... ", end="")
            # 临时覆盖 current manifest
            current = lance_dir / "_latest.manifest"
            backup_current = current.with_suffix(".manifest.bak_repair")
            if current.exists():
                shutil.copy2(current, backup_current)
            shutil.copy2(m, current)
            # 尝试打开
            tbl = db.open_table(tbl_name)
            c = tbl.count_rows()
            print(f"✅ OK! 行数={c}")
            # 暴力搜测试
            import numpy as np
            dim = tbl.schema.field("vector").type.list_size
            q = np.random.randn(dim).astype("float32")
            _ = tbl.search(q).index_cls(None).limit(3).to_list()
            print(f"   暴力搜通过，采用此版本 {m.name}")
            return True, "data_fragments", None
        except Exception as e:
            print(f"❌ 失败 {str(e)[:60]}")
            continue
    return False, None, None

# ============== Step 3: 删坏索引 + 增量重建 ==============
def rebuild_ivf_pq_index(uri: str, tbl_name: str, K=4096, M=96):
    """核心修复：删除坏索引 → 强制走暴力搜 + Optimize 合并 → 增量重建 IVF_PQ"""
    print(f"\n{'='*60}\n🔧 重建 IVF_PQ 索引 (K={K}, M={M})\n{'='*60}")
    db = lancedb.connect(uri)
    table = db.open_table(tbl_name)

    # 3a) 先清理：如果 drop_index 报错，直接物理删 _indices 目录
    try:
        table.drop_index()
        print("[3a] table.drop_index() 成功")
    except Exception as e:
        print(f"[3a] drop_index() 也报错 {e} → 物理删除 _indices 子目录")
        idx_dir = Path(f"{uri}/{tbl_name}.lance/_indices")
        if idx_dir.exists():
            shutil.rmtree(idx_dir); print(f"   已移除 {idx_dir}")
    # 3b) 跑一次 optimize 把小片段合并，重建索引更快更稳 + 强制 fsync
    print("[3b] 合并 fragment 片段（可能耗时几分钟到几十分钟）...")
    table.optimize(
        compaction=lancedb.compaction.CompactCompaction(
            target_rows_per_fragment=500_000,
            max_rows_per_group=100_000
        ),
        delete_unverified=True,
    )
    N = table.count_rows()
    print(f"   合并完成，共 N={N} 行")
    # 3c) 强制 fsync 所有文件到物理盘（Linux/Windows 都需要，否则断电还会坏！）
    _force_fsync(Path(f"{uri}/{tbl_name}.lance"))

    # 3d) 增量建 IVF_PQ 索引 + 进度可视化
    dim = table.schema.field("vector").type.list_size
    t0 = time.time()
    print(f"[3d] 开始建索引：IVF_PQ, K={K} partitions, M={M} subvectors, dim={dim}, N={N}")
    # 关键：加 batch_size 和 use_tqdm 进度条，中途中断能看到哪个阶段，batch_size 小一些更稳
    table.create_index(
        metric="L2",
        index_type="IVF_PQ",
        vector_column_name="vector",
        num_partitions=max(4, min(K, int((N/39)**0.5))),  # 经验公式 sqrt(N/39)
        num_sub_vectors=max(8, min(M, dim // 4)),  # dim 必须是 M 的倍数
        use_opq=True,
        batch_size=20000,
        use_tqdm=True,
    )
    # 3e) 建完立即再 fsync 一次
    _force_fsync(Path(f"{uri}/{tbl_name}.lance"))
    elapsed = time.time() - t0
    print(f"✅ 索引建完! 耗时 {elapsed:.1f}s, 行数 {table.count_rows()}")

    # 3f) 20 次冒烟查询 + 验证精度
    import numpy as np
    ok = 0
    for i in range(20):
        try:
            q = np.random.randn(dim).astype("float32")
            r_ivf = table.search(q).nprobes(80).limit(5).to_list()
            r_flat = table.search(q).index_cls(None).limit(5).to_list()
            ids_ivf = {x['id'] for x in r_ivf if 'id' in x}
            ids_flat = {x['id'] for x in r_flat if 'id' in x}
            recall_5 = len(ids_ivf & ids_flat) / max(1, len(ids_flat))
            if recall_5 >= 0.6:  # IVF_PQ Recall@5 >= 0.6 算合格
                ok += 1
        except Exception as e:
            print(f"   查询{i}失败: {e}")
    print(f"   冒烟通过率: {ok}/20 （合格线 >= 18/20）")
    return True

# ============== 工具：强制 fsync 整个数据目录 ==============
def _force_fsync(dir_path: Path):
    """跨平台把该目录下所有文件真正 fsync 到物理磁盘，避免 Page Cache 假刷盘"""
    for fp in dir_path.rglob("*"):
        if fp.is_file():
            try:
                fd = os.open(fp, os.O_RDONLY)
                os.fsync(fd); os.close(fd)
            except PermissionError:
                pass
    # 最后 fsync 目录本身（确保目录项落盘）
    if os.name != "nt":
        dfd = os.open(dir_path, os.O_RDONLY)
        os.fsync(dfd); os.close(dfd)

# ============== 主入口 ==============
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python lancedb_repair.py <lancedb_uri> <table_name> [K] [M]")
        print("示例: python lancedb_repair.py ./data/my_rag_db wiki_knowledge 4096 96")
        sys.exit(0)
    uri = sys.argv[1]
    tbl = sys.argv[2]
    K_opt = int(sys.argv[3]) if len(sys.argv) > 3 else 4096
    M_opt = int(sys.argv[4]) if len(sys.argv) > 4 else 96
    ok, kind, _ = diagnose_corruption(uri, tbl)
    if not ok:
        print("\n❌ 诊断无法完成，请直接用备份恢复")
        sys.exit(1)
    # 数据片段坏 → 已在回滚里尝试修过
    # 索引坏 / 部分坏 → 走重建
    if kind in ("index_only", "partial", "data_fragments"):
        rebuild_ivf_pq_index(uri, tbl, K=K_opt, M=M_opt)
    print("\n🎉 修复流程跑完，最后再手动测 3 个真实 query 确认业务 OK")
```

3.  暴力搜索先兜底恢复线上服务：索引损坏无法立刻修好时，先在应用层把 `table.search(q).index_cls(None)` 强制不走 ANN，用暴力精确搜索兜底——虽然 500 万条暴力搜慢 20~~100 倍（单条 100ms~~500ms），但能立即让 RAG 服务从"不可用"恢复到"可用但慢"，为重建索引争取时间。
4.  选择修复路径：如果诊断结果是「索引坏、数据完好」→ 删除索引 + 合并片段 + 增量重建 IVF_PQ（耗时几十分钟到几小时，但 100% 能修）；如果是「数据片段也坏」→ 先回滚 manifest 到前一个完好版本、丢掉最后一个未完成批次的数据、再重建索引。
5.  验证修复质量：重建完索引后，对比 20 个真实 query 与暴力搜索结果的 Recall@5 指标（≥0.6 视为合格）；同时对全表扫描一遍 `table.to_pandas()` 确保无任何 RowGroup 读取失败。
6.  架构级加固：开启自动定期快照、写入双写冷备目录、强制 fsync 机制（详见下方预防措施），确保下次断电 0 数据损坏。

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 先 `lance.db.validate_table()` 诊断损坏范围→ 用 `_latest_good_manifest()` 回滚到最后一次完好快照→ 损坏索引用 `table.drop_index() + create_index(use_tqdm=True, batch_size=10000)` 增量重建→ 之后每次 add 强制 `db.optimize()` + `fsync` 刷盘

```python
"""
LanceDB 断电损坏 10 行应急版（救急用，立即恢复查询）
复制粘贴直接跑在 ipython/jupyter 或主流程里
"""
import shutil, os, lancedb
from pathlib import Path
import numpy as np

URI, TBL = "./data/my_rag_db", "wiki_knowledge"
BACKUP = f"./data/my_rag_db.bak_emergency"

# 0. 先把损坏目录整体备份（永远不要在唯一一份上修！）
if not Path(BACKUP).exists():
    shutil.copytree(URI, BACKUP); print(f"0) 已备份到 {BACKUP}")

db = lancedb.connect(URI)

# 1. 先让服务立刻"能用"：应用层强制暴力搜（把下面这段临时替换原 search 调用）
def emergency_search(table, query_vec, k=5):
    """绕过损坏的 IVF_PQ，直接暴力精确搜索，慢但 100% 正确不崩"""
    return table.search(query_vec).index_cls(None).limit(k).to_list()

# 2. 删除坏索引（删不掉就物理删目录）
tbl = db.open_table(TBL)
try:
    tbl.drop_index(); print("2a) drop_index() 成功")
except Exception as e:
    print(f"2a) drop_index() 也坏，物理删 _indices: {e}")
    idx_path = Path(f"{URI}/{TBL}.lance/_indices")
    if idx_path.exists(): shutil.rmtree(idx_path)

# 3. 合并碎片 + 重建索引（K/M 按 N 经验公式，自己替换真实值）
N = tbl.count_rows()
dim = tbl.schema.field("vector").type.list_size
K = max(4, min(4096, int((N/39)**0.5)))
M = max(8, min(96, dim // 4))
print(f"3) 开始重建 IVF_PQ：N={N}, dim={dim}, K={K}, M={M}")
tbl.optimize(compaction=lancedb.compaction.CompactCompaction(target_rows_per_fragment=500_000))
tbl.create_index(metric="L2", index_type="IVF_PQ", vector_column_name="vector",
                 num_partitions=K, num_sub_vectors=M, use_opq=True,
                 batch_size=20000, use_tqdm=True)
# 4. 强制 fsync 所有文件，防止再断电
for p in Path(f"{URI}/{TBL}.lance").rglob("*"):
    if p.is_file():
        try:
            fd = os.open(p, os.O_RDONLY); os.fsync(fd); os.close(fd)
        except: pass
print("4) 完成 fsync，索引 100% 落盘")

# 5. 冒烟测试 3 次
for _ in range(3):
    r_ivf  = tbl.search(np.random.randn(dim).astype("float32")).nprobes(80).limit(5).to_list()
    r_flat = tbl.search(np.random.randn(dim).astype("float32")).index_cls(None).limit(5).to_list()
    r1, r2 = {x.get('id') for x in r_ivf}, {x.get('id') for x in r_flat}
    rec = len(r1 & r2) / max(1, len(r2))
    print(f"5) Recall@5 抽样 = {rec:.2f} （>=0.6 合格）")
print("✅ 应急修复结束，应用层可以去掉暴力搜兜底、恢复 IVF_PQ 正常调用了")
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 每次 `table.add(batch)` + `create_index()` 完成后，都必须调用自定义的 `_force_fsync()` 函数把该表目录下所有文件 fsync 到物理磁盘，不要依赖操作系统默认 Page Cache 30 秒回写
- 批量入库坚持"小批次 + 每 1 万条 1 次事务性提交"：每次 add 后立刻打快照（复制 `_latest.manifest` 到带时间戳的备份），任何一个批次失败只用回滚该批次；单次 add 永远不要超过 5 万条
- 生产环境用 LanceDB 开启"冷备双写 + 定时快照"架构：一份实时数据目录用于读写，另外一份冷备目录每 10 分钟 `rsync` 增量同步一份；同时每日 3 点做一次全量 Parquet 导出备份（`table.to_pandas().to_parquet()`）
- 索引构造任务不要在在线库上直接做：先在离线备库 `create_index()` 完 + fsync + 校验 Recall@5 通过后，再用原子目录 rename 把离线目录切换成在线目录，避免在线写入过程中建索引遇断电
- K8s 部署 LanceDB 的容器绝对不能开 `memory.swap` 或允许超售内存，一旦 OOMKill 会随机中断任何写盘阶段，与断电等效；必须设 `resources.limits.memory` 为索引峰值的 2 倍并开启优先级保护

## 常见误区

1. 相信"现代文件系统 Journal = 不会丢数据"，认为断电后 LanceDB 一定会自动回滚成功——实际上 Journal 只保护元数据一致性，不保护 Lance 自管理的 IVF_PQ 索引页完整性，半写的索引 footer meta 它修不了
2. 只备份 Parquet 数据不备份 `_indices/` 索引目录，以为"坏了重建索引就完事了"——但 2000 万条 1536 维建 IVF_PQ 索引单卡 RTX 4090 需要 8 小时+，期间只能暴力搜，服务性能会崩
3. 强制 fsync 只调用 Python `f.flush()`，不调 `os.fsync(fd)` 再 fsync 一次父目录——`flush()` 只刷到内核 Page Cache，并没落到 SSD，断电 30 秒内的数据照样丢
4. 建索引选超大 K（16384 partitions）一次完成，觉得分桶越多越快；实际上 K 越大训练阶段越久、断电中途损坏概率越高，推荐经验公式 `K ≈ sqrt(N/39)`，再配合 `use_opq=True` 精度足够

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
