# Org-Mode 相关

## 编辑网页链接

网页链接的基本形式是 `[[URL][DESCRIPTION]]`，不过我们可爱的 Emacs 会自动把它渲染成 pretty 的形式

[![asciicast](https://asciinema.org/a/QFHMISN9qgDhcSXal2GXAtCjB.svg)](https://asciinema.org/a/QFHMISN9qgDhcSXal2GXAtCjB)

这样就难以编辑了。解决办法是

1. 用 `C-c C-l` 而不是直接打字插入链接
2. 使用 `M-x org-toggle-link-display`（doom: `spc m h t`） 把 pretty 形式变回纯文本

[![asciicast](https://asciinema.org/a/435bi9kFNM3eCIHMSbHQde29N.svg)](https://asciinema.org/a/435bi9kFNM3eCIHMSbHQde29N)
