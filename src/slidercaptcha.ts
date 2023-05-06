// @ts-nocheck
import _, {max} from 'lodash'
import { createCanvas } from "canvas";

type Point = {
    x: number
    y: number
}

type BoundingRect = {
    left: number
    top: number
    right: number
    bottom: number
}

class SliderCaptcha {
    private readonly $element: HTMLElement;
    private options: object;
    public initialSlider: object;
    public targetSlider: object;
    public fakeSlider: object;
    public boundingRect: BoundingRect = {}
    public fakeBoundingRect: BoundingRect = {}
    private fakeSame: boolean = false

    constructor(id: string, options: object) {
        this.$element = document.getElementById(id)!;
        this.options = Object.assign({}, this.DEFAULTS, options);
        this.$element.style.position = "relative";
        // @ts-ignore
        this.$element.style.width = this.options.width + "px";
        this.$element.style.margin = "0 auto";
        this.init();
    }

    get DEFAULTS() {
        return {
            // width: 280, // canvas宽度
            // height: 155, // canvas高度
            width: 800,
            height: 400,
            PI: Math.PI,
            sliderL: 140, // 滑块边长
            sliderR: 20, // 滑块半径
            lineWidth: 5,
            initialOffset: 25,
            rOffset: 10,
            contrast: 0.8, // 对比度, 0.5,1
            brightness: 1.5, // 亮度，1，1.5，0.5
        }
    }

    init() {
        this.initDOM()
        this.initImg()
    }

    createCanvas(width, height) {
        let canvas
        if (typeof window !== 'undefined') {
            canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
        } else {
            canvas = createCanvas(width, height)
        }
        return canvas
    }

    initDOM() {
        this.canvas = this.createCanvas(this.options.width - 2, this.options.height)
        this.block = this.canvas.cloneNode(true)
        this.block.style.position = 'absolute'
        this.block.style.top = '0'
        this.block.style.left = '0'
        this.block.style.display = 'none'
        let el = this.$element
        el.appendChild(this.canvas)
        el.appendChild(this.block)
        this.canvasCtx = this.canvas.getContext('2d')
        this.blockCtx = this.block.getContext('2d')
    }

    initImg() {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        this.x = this.getRandomNumberByRange(this.options.width / 2 + 10, this.options.width - (this.maxL + 10))
        this.y = this.getRandomNumberByRange(this.maxD + 10, this.options.height - (this.maxL + 10))
        img.onload = () => {
            console.log(this.x, this.y)
            const sliderPath = this.drawPath(this.x, this.y, this.boundingRect)
            this.drawImg(this.canvasCtx, 'fill', sliderPath)
            if (Math.random() > 0.5) {
                let point = this.getFakePoint()
                if (point.x != 0) {
                    const fakePath = this.drawFakePath(point.x, point.y, this.fakeBoundingRect)
                    this.drawImg(this.canvasCtx, 'fill', fakePath)
                    this.fakeSlider = {
                        'xmin': this.fakeBoundingRect.left,
                        'ymin': this.fakeBoundingRect.top,
                        'xmax': this.fakeBoundingRect.right,
                        'ymax': this.fakeBoundingRect.bottom
                    }
                }
            }
            this.drawImg(this.blockCtx, 'clip', sliderPath)
            this.canvasCtx.drawImage(img, 0, 0, this.options.width, this.options.height)
            this.blockCtx.drawImage(img, 0, 0, this.options.width, this.options.height)
            this.applyEffect(sliderPath)

            let imageData = this.blockCtx.getImageData(this.boundingRect.left, this.boundingRect.top,
                this.boundingRect.right - this.boundingRect.left,
                this.boundingRect.bottom - this.boundingRect.top)
            this.block.width = this.boundingRect.right - this.boundingRect.left + this.options.initialOffset
            this.blockCtx.putImageData(imageData, this.options.initialOffset, this.boundingRect.top)
            this.canvasCtx.globalCompositeOperation = 'source-over'
            this.canvasCtx.drawImage(this.block, 0, 0)
            this.initialSlider = {
                'xmin': this.options.initialOffset + Math.floor(this.options.lineWidth / 2),
                'ymin': this.boundingRect.top + Math.floor(this.options.lineWidth / 2),
                'xmax': this.options.initialOffset + this.boundingRect.right - this.boundingRect.left - Math.floor(this.options.lineWidth / 2),
                'ymax': this.boundingRect.bottom + Math.floor(this.options.lineWidth / 2),
            }
            this.targetSlider = {
                'xmin': this.boundingRect.left,
                'ymin': this.boundingRect.top,
                'xmax': this.boundingRect.right,
                'ymax': this.boundingRect.bottom,
            }
            this.drawBoundingRect()
        }
        img.src = '/Pic' + Math.round(Math.random() * 4) + '.jpg'
        this.img = img
    }

    getFakePoint(): Point {
        let fx, fy
        let minX = this.options.initialOffset + this.boundingRect.right - this.boundingRect.left + this.maxD + 10
        let minY = this.maxD
        let maxX = this.options.width - this.maxL - 10
        let maxY = this.options.height - this.maxL - 10
        let i
        for (i = 20; i > 0; i--) {
            fx = _.random(minX, maxX)
            fy = _.random(minY, maxY)
            if (Math.max(fx - this.maxD, this.boundingRect.left) < Math.min(fx + this.maxL,
                    this.boundingRect.right) &&
                Math.max(fy - this.maxD, this.boundingRect.top) <
                Math.min(fy + this.maxL, this.boundingRect.bottom)
            ) {
                console.log('overlap, retry')
                continue
            }
            if (this.fakeSame && Math.abs(fy - this.boundingRect.top) < 10) {
                console.log('fake same, too near, retry')
                continue
            }
            console.log('fx', fx, 'fy', fy)
            break
        }
        if (i == 0) {
            fx = 0
            fy = 0
            console.log('failed to get fake point')
        }
        this.fx = fx
        this.fy = fy
        return {x: fx, y: fy}
    }

    drawBoundingRect() {
        this.canvasCtx.beginPath()
        this.canvasCtx.rect(this.initialSlider['xmin'], this.initialSlider['ymin'],
            this.initialSlider['xmax'] - this.initialSlider['xmin'],
            this.initialSlider['ymax'] - this.initialSlider['ymin'])
        this.canvasCtx.rect(this.targetSlider['xmin'], this.targetSlider['ymin'],
            this.targetSlider['xmax'] - this.targetSlider['xmin'],
            this.targetSlider['ymax'] - this.targetSlider['ymin'])
        if (Object.keys(this.fakeBoundingRect).length > 0) {
            this.canvasCtx.rect(this.fakeSlider['xmin'], this.fakeSlider['ymin'],
                this.fakeSlider['xmax'] - this.fakeSlider['xmin'],
                this.fakeSlider['ymax'] - this.fakeSlider['ymin'])
        }
        this.canvasCtx.strokeStyle = 'red'
        this.canvasCtx.lineWidth = 1
        this.canvasCtx.stroke()
    }

    // 滑块最大尺寸
    get maxL() {
        return this.options.sliderL + this.options.sliderR * 2 - this.options.rOffset + this.options.lineWidth;
    }

    // 滑块最大凸起
    get maxD() {
        return this.options.sliderR * 2 - this.options.rOffset + Math.floor(this.options.lineWidth / 2)
    }

    getRandomNumberByRange(start, end) {
        return Math.round(Math.random() * (end - start) + start);
    }

    applyEffect(clipPath: Path2D) {
        this.blockCtx.globalCompositeOperation = 'source-over'
        this.blockCtx.filter = `contrast(${this.options.contrast}) brightness(${this.options.brightness}) 
            blur(${this.options.lineWidth / 2}px)`
        this.blockCtx.lineWidth = this.options.lineWidth * 2
        let color = Math.round(_.random(0, 255))
        this.blockCtx.strokeStyle = `rgba(${color}, ${color}, ${color})`
        this.blockCtx.stroke(clipPath)
    }

    drawPath(x, y, boundingRect: BoundingRect): Path2D {
        const l = this.options.sliderL;
        const r = this.options.sliderR;
        const PI = this.options.PI;
        const offset = this.options.rOffset;
        const rad = Math.acos((r - offset) / r)
        const path = new Path2D()
        path.moveTo(x, y);
        path.arc(x + l / 2, y - r + offset, r, 0.5 * PI + rad, 2.5 * PI - rad);
        path.lineTo(x + l, y);
        path.arc(x + l + r - offset, y + l / 2, r, PI + rad, 3 * PI - rad);
        path.lineTo(x + l, y + l);
        path.lineTo(x, y + l);
        path.arc(x + r - offset, y + l / 2, r, PI - rad, PI + rad, true);
        path.closePath()
        boundingRect.top = y - 2 * r + offset - Math.floor(this.options.lineWidth / 2)
        boundingRect.right = x + l + 2 * r - offset + Math.floor(this.options.lineWidth / 2)
        boundingRect.bottom = y + l + Math.floor(this.options.lineWidth / 2)
        boundingRect.left = x - Math.floor(this.options.lineWidth / 2)
        return path
    }

    drawFakePath(x, y, boundingRect: BoundingRect): Path2D {
        if (Math.random() < 0.5) {
            this.fakeSame = true
            return this.drawPath(x, y, boundingRect)
        }
        const l = this.options.sliderL;
        const r = this.options.sliderR;
        const PI = this.options.PI;
        const offset = this.options.rOffset;
        const rad = Math.acos((r - offset) / r)
        const path = new Path2D()
        path.moveTo(x, y);
        path.arc(x + l / 2, y + r - offset, r, 1.5 * PI - rad, 1.5 * PI + rad, true);
        path.lineTo(x + l, y);
        path.arc(x + l + r - offset, y + l / 2, r, PI + rad, 3 * PI - rad);
        path.lineTo(x + l, y + l);
        path.lineTo(x, y + l);
        path.arc(x + r - offset, y + l / 2, r, PI - rad, PI + rad, true);
        path.closePath()
        boundingRect.top = y + Math.floor(this.options.lineWidth / 2)
        boundingRect.right = x + l + 2 * r - offset + Math.floor(this.options.lineWidth / 2)
        boundingRect.bottom = y + l + Math.floor(this.options.lineWidth / 2)
        boundingRect.left = x - Math.floor(this.options.lineWidth / 2)
        return path
    }

    drawImg(ctx: CanvasRenderingContext2D, operation: string, path: Path2D) {
        if (operation === 'fill') {
            ctx.fillStyle = `rgba(20, 20, 20, 0.5)`
            ctx.lineWidth = this.options.lineWidth
            ctx.strokeStyle = `rgba(100, 100, 100, 0.5)`
            ctx.fill(path)
            ctx.stroke(path)
        } else {
            ctx.lineWidth = this.options.lineWidth
            ctx.clip(path)
        }
        ctx.globalCompositeOperation = 'destination-over'
    }
}

export default SliderCaptcha
export { BoundingRect, Point }