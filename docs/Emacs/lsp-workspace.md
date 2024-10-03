# 修改 LSP workspace

`lsp-mode` 在打开一个新文件时，会弹出 `minibuffer` 来让用户交互式选择 workspace root.

如果选择错误，`lsp-mode` 很可能无法正常工作。

+ 可以用 `lsp-workspace-folders-add` 重新把正确的路径加进来
