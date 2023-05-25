### 功能

自动生成滑块验证码图片，用于模型训练，支持生成类似与快手、拼多多等验证码样式，生成特色包括：

1. 支持初始滑块位置随机偏移；
2. 支持滑块大小随机；
3. 支持增加干扰滑块；
4. 支持滑块边缘增加圆弧、三角形、矩形等凸起或凹陷，凸起或凹陷大小随机；
5. 滑块边缘增加发光效果；
6. 支持浏览器在线预览和通过nodejs本地生成验证码图片以及VOC类型标注框；

项目开发过程中参考了[SliderCaptcha](https://github.com/ArgoZhang/SliderCaptcha)验证码实现方法，并加以改进。

### 使用方法

环境配置：

```shell
pnpm install
```

#### 通过浏览器查看生成效果

```shell
pnpm run dev
```

每刷新一次页面，会随机出现一张验证码。

#### 通过命令行生成验证码图片

```shell
npx vite-node src/generate.ts -- -t pdd -c 100 --debug
```

命令行参数说明：
`-t`: 指定验证码类型，当前支持`ks`或`pdd` 2种类型；
`-c`：指定生成图片数量；
`--debug`: 是否在生成图片中带标注框，用于调试

命令执行完, 会在`dist/JPEGImages`存放生成的图片，`dist/Annotations`存放标注框信息，标注框样式采用VOC格式。

通过以下命令查看帮助：

```shell
npx vite-node src/generate.ts -- --help
```