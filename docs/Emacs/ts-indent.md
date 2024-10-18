# Language-specific Indentation

Emacs 里的缩进配置相当复杂且难绷。特别是具体到每种语言的缩进。

## Typescript

我写 TS 的时候习惯使用 `lsp-format-buffer` 来自动缩进，所以正确配置缩进是必要的

如果你用的是 Doom 默认的 ts 配置（typescript-mode + lsp-mode），那么下面的代码应该就可以正确设置缩进为 2 个空格

```
(add-hook 'typescript-mode-hook
          (lambda ()
            (setq typescript-indent-level 2)))

(add-hook 'typescript-tsx-mode-hook
          (lambda ()
            (setq typescript-indent-level 2)))
```
