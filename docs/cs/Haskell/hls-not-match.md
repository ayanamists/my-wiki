# 解决 stack 项目里的 `GHC ABIs don't match!` 问题

```
GHC ABIs don't match!

Expected: Cabal-3.4.1.0:...
Got:      Cabal-3.4.1.0:...
```

这个问题一般出现于 HLS 是系统级安装（比如，用 `ghcup` 安装），而 stack 用的是隔离环境里的编译器的情况。解决方案也很简单，用 `ghcup` 安装 `stack.yaml` 里声明的编译器版本，然后在 stack.yaml 里加上这句话

```
system-ghc: true
```
