---
sidebar_position: 2
---

# 在新窗口打开一个文件

需求很简单，类似于 “预览” 功能，例如有个程序会写入 `a.png`

```python
#!/usr/bin/env python3

import random
from PIL import Image

width, height = 200, 200

image = Image.new('RGB', (width, height))

pixels = [(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
          for _ in range(width * height)]

image.putdata(pixels)

image.save('a.png')

```

:::tip

在 Doom Emacs 下，可以按下 <kbd>g R</kbd> 运行这个程序

:::

直觉上说，最好可以在右侧预览这个 `a.png`

现在我们把要求定义为：

1. 弹出一个文件预览窗口(`find-file`)，打开一个文件作为 buffer (b)
2. 如果当前窗口的右侧没有窗口，则创建之。
3. 在当前窗口的右侧窗口打开 b.


一个简单的函数可以完成要求：（作者：`qwen/qwen-2.5`）

```elisp
(defun open-file-in-right-window ()
  "Open file in right window, creating it if necessary."
  (interactive)
  ;; Check if there's already a right window
  (let ((right-window (window-in-direction 'right)))
    (unless right-window
      ;; If no right window, split the current one vertically
      (split-window-right))
    ;; Switch to the right window and open file with 'find-file'
    (windmove-right)
    (call-interactively 'find-file)
    ;; Return focus to the left window
    (windmove-left)))
```

