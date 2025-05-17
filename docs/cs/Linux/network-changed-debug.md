# 排查 `network changed` 问题

最近我的工作主机（Ubuntu 24.04）经常遇到奇怪的网络错误 -- 浏览器抱怨 `network changed`. （点击查看大图）

[![](https://i.ibb.co/mScLB1K/Screenshot-14-11-16-24-35-31805.png)](https://ibb.co/mScLB1K)

这是怎么回事呢？我咨询了 GPT

> 我的 linux 主机似乎时不时会刷新 interface 配置，我不知道具体发生了什么，它的表现是
>
> + 时不时能看到 network changed 错误
> + wireshark 在 interface 页面，每隔几秒就会说 "no interface found" 然后刷新一下
>
> 但是我查看日志似乎没有任何有意义的信息，你能帮我想想有什么办法可以看到这种刷新吗？

GPT 给了 7 个建议

> 这种时不时刷新接口配置的情况可能是由多种因素引起的，包括网络管理服务的配置问题、驱动问题、系统组件之间的冲突，或者是某些网络管理工具（如 `NetworkManager` 或 `systemd-networkd`）的自动重启。为了帮助你进一步调查这个问题，可以考虑以下几种方法来捕获更多的信息和日志：
>
> ### 1. **检查 NetworkManager 或 systemd-networkd 日志**
> 如果你使用的是 `NetworkManager` 或 `systemd-networkd` 来管理网络接口，它们可能会尝试重新配置网络接口。可以通过以下命令查看相关日志：
> - 对于 **NetworkManager**：
>   ```bash
>   journalctl -u NetworkManager -f
>   ```
>   这样可以实时查看 `NetworkManager` 的日志输出，任何接口的配置更改或重启都会被记录。
> - 对于 **systemd-networkd**：
>   ```bash
>   journalctl -u systemd-networkd -f
>   ```
>   该命令会输出 `systemd-networkd` 的日志，帮助你确定是否存在自动重新配置的情况。
>
> ### 2. **开启网络接口日志**
> 你可以通过更详细地设置 `udevadm` 来获取网络接口的状态更改信息。可以执行以下命令：
> ```bash
> udevadm monitor --subsystem-match=net --property
> ```
> 这样可以捕获网络设备（如接口）上的事件，包括配置的刷新或其他状态更改。你可以在命令输出中查看接口是否频繁断开或重新连接。
>
> ### 3. **检查 `dmesg` 输出**
> 有时设备的硬件或驱动程序问题会导致接口断开和重新连接。查看内核日志中的任何相关错误或警告，特别是与网络驱动程序相关的部分：
> ```bash
> dmesg | grep -i eth
> ```
> 如果是无线网络接口，也可以使用：
> ```bash
> dmesg | grep -i wlan
> ```
> 这些日志可能显示与硬件或驱动相关的错误或重启，帮助你定位问题。
>
> ### 4. **网络状态监控工具**
> 使用 `netstat` 或 `ss` 工具监控网络连接的状态变化：
> ```bash
> netstat -i
> ```
> 或者
> ```bash
> ss -tuln
> ```
> 这两个命令能帮助你查看当前的网络接口状态以及连接的变化。
>
> ### 5. **Wireshark 配置问题**
> 你提到 Wireshark 在接口页面频繁显示 "no interface found"。这可能是由于 Wireshark 在接口切换时没有正确识别到接口。可以尝试：
> - 确保 Wireshark 正在监控正确的接口；
> - 使用 `tcpdump` 或其他类似工具，观察是否存在类似的接口掉线现象，来确认 Wireshark 是否只是显示问题。
>
> ### 6. **查看定时任务**
> 有时定时任务（如 `cron`、`systemd` 定时服务）可能会不小心更改网络配置。检查是否有计划任务会影响网络：
> ```bash
> crontab -l
> ```
> 以及检查系统的定时任务：
> ```bash
> systemctl list-timers
> ```
>
> ### 7. **硬件问题**
> 如果你的网卡或网络硬件出现问题，可能会导致接口频繁重置。可以尝试更换网络接口卡，或者升级相关的驱动程序和固件。
>
> 通过这些方法，你可以更好地捕获到网络接口的变化及背后的原因，帮助你进一步诊断和修复这个问题。如果在某些步骤中发现了异常，进一步排查相关配置或硬件问题可能会有所帮助。

建议 2. 是中肯的，我们确实需要观察一下底层的网卡配置是否变动

```
$ udevadm monitor --subsystem-match=net --property
UDEV  [21994.856918] add      /devices/virtual/net/veth197b851 (net)
ACTION=add
DEVPATH=/devices/virtual/net/veth197b851
SUBSYSTEM=net
INTERFACE=veth197b851
IFINDEX=3700
SEQNUM=205894
USEC_INITIALIZED=21993589017
ID_NET_DRIVER=veth
ID_MM_CANDIDATE=1
ID_NET_LINK_FILE=/usr/lib/systemd/network/99-default.link
ID_NET_NAME=veth197b851
NM_UNMANAGED=1
SYSTEMD_ALIAS=/sys/subsystem/net/devices/veth197b851
TAGS=:systemd:
CURRENT_TAGS=:systemd:

UDEV  [21994.858374] remove   /devices/virtual/net/veth197b851 (net)
ACTION=remove
DEVPATH=/devices/virtual/net/veth197b851
SUBSYSTEM=net
INTERFACE=veth197b851
IFINDEX=3700
SEQNUM=205897
USEC_INITIALIZED=21993589017
ID_NET_DRIVER=veth
ID_MM_CANDIDATE=1
ID_NET_LINK_FILE=/usr/lib/systemd/network/99-default.link
ID_NET_NAME=veth197b851
NM_UNMANAGED=1
SYSTEMD_ALIAS=/sys/subsystem/net/devices/veth197b851
TAGS=:systemd:
CURRENT_TAGS=:systemd:

UDEV  [21994.858869] remove   /devices/virtual/net/veth24a8c4c (net)
ACTION=remove
DEVPATH=/devices/virtual/net/veth24a8c4c
SUBSYSTEM=net
INTERFACE=veth24a8c4c
IFINDEX=3701
SEQNUM=205900
USEC_INITIALIZED=21993592941
ID_NET_DRIVER=veth
ID_MM_CANDIDATE=1
ID_NET_LINK_FILE=/usr/lib/systemd/network/99-default.link
ID_NET_NAME=veth24a8c4c
NM_UNMANAGED=1
SYSTEMD_ALIAS=/sys/subsystem/net/devices/veth24a8c4c
TAGS=:systemd:
CURRENT_TAGS=:systemd:
```

可以看到，在非常短的时间内，网卡 `veth197b851` 被先添加后删除。这个模式在输出中重复了很多次。这应该就是问题的元凶。

为什么网卡会被频繁的添加和删除呢？这个网卡的命名模式显然指向了 docker. 不出意外地，我发现某个容器一直在频繁重启。


我写了一段脚本模拟这种情况，执行这段脚本可以在你的机器上复现浏览器频频 `network changed` 的问题。

```python
#!/usr/bin/env python3

import subprocess
import time
import random
import sys


def create_container():
    """
    Create and automatically remove a Docker container after it stops.
    """
    try:
        subprocess.run(
            ["docker", "run", "--rm", "-d", "alpine", "sleep", "1s"],
            check=True,
        )
        print("Container started")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start container: {e}")
        sys.exit(-1)


def simulate_container_reboots():
    """
    Simulate frequent container reboots using docker run --rm.
    """
    while True:
        print("Starting a new container...")
        create_container()

        # Wait for a random time (1 to 5 seconds) to simulate container running time
        time.sleep(random.uniform(1, 5))

        # The container will be automatically removed after it stops due to --rm flag.
        print("Container stopped and removed")


def main():
    try:
        # Simulate frequent container reboots
        simulate_container_reboots()

    except KeyboardInterrupt:
        print("Simulation ended")


if __name__ == "__main__":
    main()
```

把那个频繁重启的容器删除后，问题就解决了。
