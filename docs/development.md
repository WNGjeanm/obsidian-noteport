# Development / 开发说明

Use Node.js 22 or later and pnpm 11. The lockfile pins the dependency graph. / 使用 Node.js 22 及以上、pnpm 11，依赖由锁文件固定。

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm example
pnpm package
```

`pnpm build` writes `main.js`. To test in a disposable vault, copy `main.js`, `manifest.json`, and `styles.css` into `.obsidian/plugins/noteport/`, reload Obsidian, and enable the plugin. Review any trust prompt yourself. Do not use a personal vault as the public screenshot fixture.

构建生成 `main.js`。请在独立测试库中安装三个插件文件并启用，自行审阅信任提示。公开截图仅使用仓库内的虚构示例。

## Public fixture / 公开样例

`examples/示例笔记.md` and `examples/assets/reading-plan.png` form a self-contained fixture. Run `pnpm example` to regenerate both DOCX examples. The standard example should have no export warnings. Add a separate edge-case note for unsupported content rather than hiding unsupported input from test coverage.

示例笔记和图片可独立复现导出。示例应无导出提示，不支持内容通过单独的边界样例验证。

## Release procedure / 发布步骤

1. Update `package.json`, `manifest.json`, `versions.json`, and `CHANGELOG.md` together. / 同步更新版本与日志。
2. Run type checks, tests, build, example generation, and real Obsidian/Word checks. / 完成自动检查和实际软件验证。
3. Refresh screenshots and `docs/testing.md`; state untested environments. / 更新截图和实测范围。
4. Run `pnpm package`. It creates an installable ZIP, individual plugin files, and SHA-256 checksums in `dist/`. / 生成安装包和校验值。
5. Commit and push source. Create a GitHub Release whose tag exactly matches `manifest.json` (for example `0.1.0`, without a `v` prefix). Upload every file in `dist/`. / 提交源码，按 manifest 原样版本号创建 Release 并上传附件。
6. Download every uploaded release asset and compare SHA-256 against local files. / 下载全部附件逐项核验 SHA-256。

Never package vault content, `data.json`, private screenshots, credentials, or `node_modules`. Community-directory submission is a separate process and has not been performed for this release.

不打包用户笔记、配置、私人截图、凭据和依赖目录。社区市场提交是独立流程，首版未执行。
