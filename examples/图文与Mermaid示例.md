# 图文与 Mermaid 导出验证

本示例用于检查图片与图表在 Word 中的位置、中文标签和可读性，全部内容均为虚构演示资料。

## 本地图片

以下图片通过标准 Markdown 图片语法插入，指定宽度为 400 像素。

![阅读计划|400](assets/reading-plan.png)

同一张图片也可以通过 Obsidian 嵌入语法引用。

![[assets/reading-plan.png|300]]

## SVG 和 WebP

![本地矢量图](assets/media-sample.svg)

![本地 WebP 图片](assets/media-sample.webp)

## Mermaid 流程图

```mermaid
flowchart LR
    A[接收材料] --> B{核对完整性}
    B -->|完整| C[生成文档]
    B -->|缺失| D[补充材料]
```

图表后面的正文应继续保留，图表在 Word 中以图片形式存在。

## Mermaid 时序图

```mermaid
sequenceDiagram
    participant N as 笔记
    participant W as Word
    N->>W: 导出图文
    W-->>N: 完成
```

导出结束后，可以在 Word 中继续编辑正文及标题，图表保持为静态图片。
