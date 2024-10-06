# 使用 `ramfs` 加速 IO-bound 程序

## Intuition

考虑这样一种场景：有一个自动化任务，涉及到加解压缩文件、图像处理、字符串搜索……

聪明的你用了各种命令行工具，写了一个 shell 或者 python 或者 node.js 脚本。不过你叫苦不迭：

> 这些文件都放在了机械硬盘上，导致每个工具都成为了 IO-bound 程序，运行慢的要命；更令人失望的是，32 核心的电脑，并行执行竟然没有任何加速………

这种情况的主要成因是机械硬盘的随机写入速度太差。我做了一个测试，在固态硬盘和机械硬盘上分别解压一个 100M 的压缩包，每个压缩包有 100 个 1M 的文件。

测试脚本：

```shell
#!/usr/bin/env sh

sync; echo 3 | sudo tee /proc/sys/vm/drop_caches # clear system cache
time 7z x -y test.zip
rm -r test_dir
```

这是固态硬盘的结果

```
❯ ./bench.sh
3

7-Zip 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:32 OPEN_MAX:1024

Scanning the drive for archives:
1 file, 104890352 bytes (101 MiB)

Extracting archive: test.zip
--
Path = test.zip
Type = zip
Physical Size = 104890352

Everything is Ok

Folders: 1
Files: 100
Size:       104857600
Compressed: 104890352
0.22user 0.20system 0:00.43elapsed 98%CPU (0avgtext+0avgdata 7552maxresident)k
212208inputs+204800outputs (40major+666minor)pagefaults 0swaps
```

这是机械硬盘的结果

```
❯ ./bench.sh
3

7-Zip 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:32 OPEN_MAX:1024

Scanning the drive for archives:
1 file, 104890352 bytes (101 MiB)

Extracting archive: test.zip
--
Path = test.zip
Type = zip
Physical Size = 104890352

Everything is Ok

Folders: 1
Files: 100
Size:       104857600
Compressed: 104890352
0.32user 0.24system 0:01.47elapsed 38%CPU (0avgtext+0avgdata 7168maxresident)k
212080inputs+204800outputs (43major+663minor)pagefaults 0swaps
```

可以看到，机械硬盘花了大概 3.5 倍于固态硬盘的时间进行解压，而且只达到了 38% 的 CPU 占用率。这标志着程序已经成为了一个 IO-Bound 程序。

## 用 ramfs 解决问题

显然，最合理的方式是建立某种 “缓存”，比如直接把文件放到固态硬盘进行处理，最后把处理之后的结果拷贝回机械硬盘。

如果想要更快的速度，ramfs 是更好的选择。正如其名，ramfs 是直接在内存里建立的文件系统。

用两行命令就可以创建一个 ramfs:

```
mkdir /ram-dir
sudo mount ramfs -t ramfs /ram-dir
```

不妨试试之前的测试：

```
❯ bash bench.sh
3

7-Zip 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:32 OPEN_MAX:1024

Scanning the drive for archives:
1 file, 104890352 bytes (101 MiB)

Extracting archive: test.zip
--
Path = test.zip
Type = zip
Physical Size = 104890352

Everything is Ok

Folders: 1
Files: 100
Size:       104857600
Compressed: 104890352

real    0m0.345s
user    0m0.245s
sys     0m0.082s
```

测试结果是比之前固态硬盘快大概 20%，提速没有很多。这是因为之前固态硬盘的 CPU 占用率就是 98% 了。
