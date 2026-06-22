# Git（版本控制）

**Git** 是由 Linux 内核创造者 Linus Torvalds 于 2005 年为了管理 Linux 内核开发而创建的分布式版本控制系统（DVCS）。它是目前世界上最流行的版本控制工具，被广泛应用于几乎所有软件开发项目。

## Git 解决了什么问题？

### 版本控制的三大难题

| 场景 | 没有 Git 的痛苦 | Git 的解决方案 |
|------|---------------|-------------|
| 多人协作 | 「我的代码被你覆盖了」 | 每个开发者有完整的仓库副本，合并由 Git 自动处理 |
| 历史回溯 | 「上周那个版本怎么找不到了」 | 每一次提交都被永久记录，可以随时 checkout |
| 并行开发 | 「新功能做到一半，怎么修复 bug？」 | 分支管理，每个功能/修复独立开发 |

## Git 的核心设计

### 分布式 vs. 集中式

```
集中式 (SVN / CVS)
                    ┌──────────┐
    Developer A ───▶│ 中央仓库 │◀─── Developer B
                    └──────────┘
                         ▲
                    单点故障！

分布式 (Git)
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ 完整副本  │◀──▶│   远程仓库   │◀──▶│  完整副本  │
    │  Developer A│      │  (origin)   │      │  Developer B│
    └──────────┘      └──────────┘      └──────────┘
         ▲                                   ▲
         └──────────── 可以离线工作 ───────────┘
```

Git 的每个克隆都是一个完整的仓库，不依赖中央服务器。

## Git 基本概念

### 1. 三个工作区域

```
工作区 (Working Directory)
   │  git add
   ▼
暂存区 (Staging Area / Index)
   │  git commit
   ▼
提交历史 (.git 目录)
```

这是 Git 最独特也最强大的设计：**你可以精确控制提交的内容。**

### 2. 提交 (Commit)

- 一次提交 = 一份项目快照
- 包含：作者、时间、提交说明、父提交 ID、文件树哈希
- Commit ID：SHA-1 哈希（40 字符，通常取前 7 位使用）

```
commit a1b2c3d
Author: Alice <alice@example.com>
Date:   Wed Jun 19 10:00:00 2024

    修复登录页面的验证码显示问题

    - 解决 canvas 渲染尺寸错误
    - 优化验证码刷新逻辑
```

### 3. 分支 (Branch)

- 分支 = 指向某个提交的「指针」或「书签」
- 创建分支 = 新建一个指针
- 切换分支 = 移动 HEAD 指针到另一个分支

```
main:      ○──○──○──○──○ ← 当前 HEAD
                   ↖
feature:        ○──○──○ ← 新功能开发分支
```

### 4. 合并 (Merge) & 变基 (Rebase)

两种把分支改动合并回主分支的方式：

```
Merge（保留历史）
Before: main ○──○──○──○
              ↖ feature: ○──○──○
After:  main ○──○──○──○──●──○──○

Rebase（让历史变线性）
Before: main ○──○──○──○
              ↖ feature: ○──○──○
After:  main ○──○──○──○──●──●──●
                  (重写了 feature 分支的提交基)
```

## Git 命令速查

### 基础操作

```bash
# 创建/克隆仓库
git init                                  # 初始化新仓库
git clone https://github.com/user/repo    # 克隆远程仓库

# 查看状态
git status                                # 查看工作区状态
git diff                                  # 查看未暂存的改动
git diff --staged                         # 查看已暂存的改动
git log                                   # 查看提交历史
git log --oneline --graph --all           # 图形化分支历史

# 提交改动
git add <file>                            # 暂存文件
git add .                                 # 暂存当前目录所有改动
git commit -m "提交说明"                   # 提交暂存内容
git commit -am "提交说明"                  # add + commit（仅限已跟踪文件）

# 撤销操作
git restore <file>                        # 撤销工作区的修改
git restore --staged <file>               # 撤销暂存
git reset --soft HEAD~1                   # 撤销最近一次提交（保留改动）
git reset --hard HEAD~1                   # 彻底撤销最近一次提交（危险！）
```

### 分支操作

```bash
# 分支管理
git branch                                # 查看所有分支
git branch <name>                         # 新建分支
git checkout <branch>                     # 切换分支（旧写法）
git switch <branch>                       # 切换分支（新写法，语义更清晰）
git switch -c <branch>                    # 新建并切换
git branch -d <branch>                    # 删除已合并分支
git branch -D <branch>                    # 强制删除分支

# 合并
git merge <branch>                        # 合并分支到当前分支
git merge --no-ff <branch>                # 强制生成合并提交（保留分支信息）
git rebase <branch>                       # 变基到目标分支
```

### 远程操作

```bash
# 远程仓库
git remote -v                             # 查看远程仓库
git remote add origin <url>               # 添加远程仓库
git remote remove origin                  # 移除远程仓库

# 推送与拉取
git push origin <branch>                  # 推送分支到远程
git push -u origin <branch>               # 首次推送并设置追踪
git push --force-with-lease               # 安全强制推送（不会覆盖他人的新提交）
git pull                                  # 拉取并合并（= fetch + merge）
git pull --rebase                         # 拉取并变基（更整洁的历史）
git fetch origin                          # 只拉取不合并

# 其他
git stash                                 # 暂存工作区
git stash pop                             # 恢复最近一次 stash
git cherry-pick <commit_id>               # 从其他分支挑选一个提交
git blame <file>                          # 查看每行是谁写的
```

## Git 工作流

### 1. 基础协作流（最简单）

```bash
# 克隆项目
git clone <url>
cd <project>

# 开发
git switch -c feature-x
# ... 写代码 ...
git add .
git commit -m "实现 feature-x"

# 同步主分支
git switch main
git pull origin main

# 合并
git merge feature-x
# 或
git rebase main feature-x

# 推送
git push origin main
```

### 2. Pull Request / Merge Request 流（团队协作首选）

```
1. Fork 项目（或在仓库创建分支）
2. 本地新建 feature 分支开发
3. 推送到远程 feature 分支
4. 提交 Pull Request
5. 代码审查 + 修改
6. 审查通过，合并到 main
7. 删除 feature 分支
8. 本地同步最新 main
```

### 3. Git Flow（复杂项目）

- `main`：生产环境稳定代码
- `develop`：集成分支，最新开发代码
- `feature/*`：功能分支
- `release/*`：发布准备分支
- `hotfix/*`：紧急修复分支

适合有严格版本管理的项目。

### 4. GitHub Flow / Trunk-Based Development（敏捷团队推荐）

- 只有 `main` 一个长期分支
- 所有开发都在短期分支上完成，然后通过 PR 合并回 main
- main 始终保持可部署状态
- 配合 CI/CD：每次合到 main 自动测试和部署

简单、灵活、现代团队的主流选择。

## Git 进阶技巧

### 1. 交互式 Rebase

```bash
# 修改最近 3 个提交
git rebase -i HEAD~3

# 可以选择：
#   pick   = 保留该提交
#   reword = 修改提交信息
#   edit   = 修改提交内容
#   squash = 合并到上一个提交
#   fixup  = 合并到上一个提交（丢弃该提交信息）
#   drop   = 丢弃该提交
```

### 2. 查看文件历史

```bash
git log --follow -p <file>              # 查看文件完整修改历史（包括改名）
git log -p --grep="关键词"              # 搜索提交信息
git log -S "代码片段"                    # 搜索某段代码的引入/删除
```

### 3. 二分查找 Bug

```bash
git bisect start
git bisect bad HEAD                      # 当前版本有 bug
git bisect good v1.0                     # v1.0 确认是好的
# Git 会自动 checkout 中间版本
# 测试后标记 good/bad
# 几轮后定位引入 bug 的第一个提交
git bisect reset                         # 结束二分查找
```

### 4. 查看某个提交的改动

```bash
git show <commit_id>                      # 显示完整改动
git show <commit_id>:<path>               # 查看某个提交时的文件内容
```

## .gitignore 最佳实践

```
# 依赖
node_modules/
__pycache__/
*.egg-info/
.venv/

# 构建产物
build/
dist/
*.o

# 环境配置
.env
.env.local

# IDE
.idea/
.vscode/
*.swp

# 日志和临时文件
*.log
*.tmp

# 系统
.DS_Store
Thumbs.db

# 大数据文件
*.zip
*.tar.gz
*.bin
```

## Git 配置优化

```bash
# 用户名和邮箱（每个 Git 提交都会带上）
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 默认编辑器（默认为 Vim，可改为 VS Code）
git config --global core.editor "code --wait"

# 漂亮的 log 别名
git config --global alias.lg "log --oneline --graph --all --decorate"

# 大小写敏感（防止 Windows/Mac/Linux 差异问题）
git config --global core.ignorecase false

# 设置默认分支名为 main（Git 2.28+ 支持）
git config --global init.defaultBranch main
```

## 常见问题与解决方案

### 问题 1：提交了不该提交的大文件 / 敏感信息

```bash
# 如果是最近一次提交
git rm --cached <file>
git commit --amend

# 如果已经存在历史中（推荐使用 BFG Repo Cleaner）
# 或使用 git-filter-repo（更现代的工具）
java -jar bfg.jar --strip-blobs-bigger-than 100M my-repo.git
```

### 问题 2：commit message 写错了

```bash
# 修改最近一次提交的信息
git commit --amend -m "正确的提交信息"

# 如果已经 push 了，需要强制推送（注意团队协作！）
git push --force-with-lease origin <branch>
```

### 问题 3：如何撤销一个已 push 的合并

```bash
# 使用 revert 反向提交（最安全，不破坏历史）
git revert -m 1 <merge_commit_id>
# -m 1 表示保留当前分支的变动
```

### 问题 4：大型仓库操作很慢

```bash
# 浅克隆（只下载最近的提交，适合 CI/CD）
git clone --depth 1 <url>

# 部分克隆 + 稀疏检出
# (下载少量历史 + 只检出需要的目录，适合大型 monorepo)
git clone --filter=blob:none --sparse <url>
```

## Git 与现代开发工具链

| 类别 | 代表工具 | 与 Git 的关系 |
|------|---------|-------------|
| 代码托管 | GitHub / GitLab / Gitee / Bitbucket | 远程仓库、Issue、PR |
| CI/CD | GitHub Actions / GitLab CI / Jenkins | Git push 触发自动测试/部署 |
| 代码审查 | GitHub PR / GitLab MR / CodeGuru | 基于提交和分支的代码审查 |
| 依赖管理 | Dependabot / Renovate | 自动发 PR 更新依赖版本 |
| 容器化 | Docker + Docker Compose | Dockerfile 纳入版本管理 |
| IaC | Terraform / Ansible | 基础设施配置用 Git 管理 |

## Git 学习资源

- **Pro Git（中文版，免费）**：[git-scm.com/book/zh](https://git-scm.com/book/zh)
- **Git 飞行指南**：Oh Shit, Git!?! 各种错误场景的急救指南
- **Git 可视化**：[learngitbranching.js.org](https://learngitbranching.js.org/)
- **GitHub Skills**：官方交互式教程

## 最佳实践总结

1. ✅ **频繁提交，小步快跑**：每个提交做一件事，commit message 简洁说明意图
2. ✅ **写好提交信息**：第一行 50 字符内，空一行后跟详细描述
3. ✅ **使用分支**：永远不在 main 上直接开发
4. ✅ **定期同步**：每天开始和结束时都要 pull + push
5. ✅ **rebase 用于本地**，merge 用于公共分支
6. ✅ **大文件用 Git LFS**：不要把模型权重、视频、大型二进制文件直接加入 Git
7. ❌ **不要 `--force` 公共分支**：会破坏其他团队成员的历史
8. ❌ **不要把密钥、密码、API Key 提交到 Git**—— 使用环境变量或密钥管理服务

相关术语：[Linux](/glossary/linux)、[Docker](/glossary/docker)
