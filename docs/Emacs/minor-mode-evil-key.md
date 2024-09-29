# 给 minor-mode 添加新的快捷键

minor-mode 在定义时声明了自己绑定的快捷键

```
;; Ref: https://www.gnu.org/software/emacs/manual/html_node/elisp/Defining-Minor-Modes.html
(define-minor-mode hungry-mode
  "Toggle Hungry mode.
Interactively with no argument, this command toggles the mode.
A positive prefix argument enables the mode, any other prefix
argument disables it.  From Lisp, argument omitted or nil enables
the mode, `toggle' toggles the state.

When Hungry mode is enabled, the control delete key
gobbles all preceding whitespace except the last.
See the command \\[hungry-electric-delete]."
 ;; The initial value.
 nil
 ;; The indicator for the mode line.
 " Hungry"
 ;; The minor mode bindings.
 '(([C-backspace] . hungry-electric-delete)))
```

作为某个 minor-mode 的用户，如果我想创建对应的快捷键呢？

例如，在 `gptel-mode` 启用时，我想让 <kbd>?</kbd> 绑定到 `gptel-menu` 函数。

在 Evil Mode 启用时，这个问题确实有些麻烦，需要参考[文档](https://evil.readthedocs.io/en/latest/keymaps.html)。文档介绍了 `evil-define-key`，可以用这个函数解决问题：

```elisp
(add-hook 'gptel-mode-hook
          (lambda () (evil-define-key 'normal
                       'gptel-mode (kbd "?") #'gptel-menu)))
```
