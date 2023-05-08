### 功能

自动生成滑块验证码图片，目前支持快手和拼多多类型的验证码生成

### 使用方法

环境配置：

```shell
pnpm install
```

#### 通过浏览器查看生成效果

```shell
pnpm run dev
```

#### 通过命令行生成验证码图片

```shell
npx vite-node src/generate.ts -- -t pdd -c 100 --debug
```

通过以下命令查看帮助：

```shell
npx vite-node src/generate.ts -- --help
```