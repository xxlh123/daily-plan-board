# Daily Plan Board 部署说明

## 1. 本项目是什么

这是一个个人计划表静态网页，基于 Vite + React + Tailwind 构建。功能包括任务看板、拖拽、学习/休息计时器、自定义计划表、自定义项目、自定义任务、智能导入计划、站内本地备份和 localStorage 本地保存。

本项目只做静态网页部署，不做后端、不做登录、不做数据库，适合部署到 GitHub Pages。

## 2. 本地运行

本地安装依赖：

```bash
npm install
```

本地运行：

```bash
npm run dev
```

打开终端提示的本地地址，通常是：

```text
http://localhost:5173/
```

## 3. 构建

```bash
npm run build
```

构建产物会生成在 `dist` 目录。GitHub Actions 会自动构建并部署 `dist`。

## 4. 推送到 GitHub

Git 初始化并提交：

```bash
git init
git add .
git commit -m "init daily plan board"
git branch -M main
```

添加远程仓库，注意替换用户名：

```bash
git remote add origin https://github.com/你的GitHub用户名/daily-plan-board.git
git push -u origin main
```

如果仓库已经初始化过，只需要执行：

```bash
git add .
git commit -m "configure github pages deploy"
git push
```

## 5. 开启 GitHub Pages

进入仓库：

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

然后进入 Actions 查看部署是否成功。

部署成功后的访问地址通常是：

```text
https://你的GitHub用户名.github.io/daily-plan-board/
```

## 6. 常见问题排查

问题1：页面空白

原因：`vite.config.js` 的 `base` 配错。

解决：如果仓库名是 `daily-plan-board`，`base` 必须是：

```js
base: "/daily-plan-board/"
```

如果你后续修改了 GitHub 仓库名，必须同步修改这里的 `base`。

问题2：Actions 中 `npm ci` 报错

原因：没有 `package-lock.json` 或依赖不一致。

解决：本地运行：

```bash
npm install
```

然后把 `package-lock.json` 一起提交。

问题3：404

原因：GitHub Pages 没有设置 Source 为 GitHub Actions，或者 workflow 没部署成功。

解决：检查：

```text
Settings → Pages
```

并查看 Actions 日志。

问题4：样式丢失

原因：`base` 路径错误或 Tailwind 没正确配置。

解决：检查 `vite.config.js` 和 `src/index.css`。`src/index.css` 必须包含：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

问题5：换电脑看不到任务数据

原因：当前项目使用 localStorage，只保存在当前浏览器。

解决：未来要做账号登录和多设备同步，需要后端数据库。

## 7. localStorage 的限制说明

当前所有任务、项目、计时日志、站内本地备份都保存在浏览器 localStorage 中。它有以下限制：

- 只在当前浏览器有效。
- 同一电脑不同浏览器之间不同步。
- 不同电脑、手机之间不同步。
- 清理浏览器缓存或站点数据可能会删除记录。
- GitHub Pages 只是托管网页文件，不会保存你的个人数据到云端。

建议重要数据定期使用站内备份功能。未来如果要实现账号登录和多设备同步，需要增加后端数据库。
