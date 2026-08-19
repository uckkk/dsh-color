# dsh-color · 颜色工具

hex / rgb / hsl 互转，计算补色、明暗与前景文字对比度。纯 Node 实现。

## 提供的工具

| 工具 | 作用 |
|---|---|
| `color_convert` | 颜色三格式互转 + 补色 + 对比度 |

## 安装

```bash
dsh plugin add dsh-color
```
安装后在 profile 的 `package.json` 的 `dsh.profile.bundles` 中加入 `"dsh-color"`。

## 用法示例

```
这个颜色 #3b82f6 的 rgb 和 hsl 是什么，配什么文字颜色
→ 调用 color_convert(color="#3b82f6")
```

## 安装

```bash
dsh plugin add github:uckkk/dsh-color
```

> 安装即在本机运行第三方代码，请自行审阅源码。

## 安装

```bash
dsh plugin add github:uckkk/dsh-color
```

## 使用

安装后在会话中调用该插件注册的工具即可。

## 许可

MIT

> 安装即在本机运行第三方代码，请自行审阅源码。
