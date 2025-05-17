# Apple 设备的串流问题

如果在 apple 设备（iPad, Macbook）使用 Moonlight, Stream Link 之类的应用进行串流，或者其他高实时性的应用，你可能会时不时遇到烦人的卡顿，打开调试可以看到丢包或者延迟过高。

相关问题在 GitHub 上有很多讨论

+ [Frame dropped using 5GHz WIFI after upgrade to iOS18](https://github.com/moonlight-stream/moonlight-ios/issues/651)
+ [Micro Stutters with M4 iPad/Magic Keyboard](https://github.com/moonlight-stream/moonlight-ios/issues/639)
+ [Sound and video stutter on iPad Pro M4](https://github.com/moonlight-stream/moonlight-ios/issues/627)
+ [Chris Visser 的 talk](https://www.youtube.com/live/KwkSIxl00Dg?si=veyfKI2oWqX8AsmV&t=521)

社区似乎认为这是苹果的 AWDL（Apple Wireless Direct Link）协议及使用它的服务（Airdrop 等等）引起的。我还发现了一些中文社区的讨论

+ [解决由于 AWDL 导致 Mac 的断网问题](https://jiapan.me/2023/AWDL-Mac-disconnected/)
+ [MacBook Pro AWDL 影响 Wifi 质量](https://discussionschinese.apple.com/thread/255369050)

目前社区的解决办法是把 Wifi 信道调整到 6, 44, 149. 我把信道调到 149 以后确实正常了。
