// @ts-nocheck
import _ from 'lodash'
import {createCanvas, loadImage} from "canvas";
import 'canvas-5-polyfill'

function inBrowser(): boolean {
    return typeof window !== 'undefined';
}

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
    public $element: HTMLElement;
    public options: object;
    public gtBndBox: BoundingRect = {}
    public targetBndBox: BoundingRect = {}
    public fakeBndBox: BoundingRect = {}
    public fakeSame: boolean = false
    public readonly debug: boolean
    public readonly resolver: Promise

    constructor(options: object, debug: boolean = false) {
        this.options = Object.assign({}, this.DEFAULTS, options);
        this.debug = debug
        this.initDOM()
        this.resolver = this.initImg()
    }

    show(id: string) {
        this.$element = document.getElementById(id)!;
        this.$element.style.position = "relative";
        this.$element.style.width = this.options.width + "px";
        this.$element.style.margin = "0 auto";
        this.block.style.position = 'absolute'
        this.block.style.top = '0'
        this.block.style.left = '0'
        this.block.style.display = 'none'
        this.$element.appendChild(this.canvas)
        this.$element.appendChild(this.block)
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

    createCanvas(width, height) {
        let canvas
        if (inBrowser()) {
            canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
        } else {
            canvas = createCanvas(width, height)
        }
        return canvas
    }

    initDOM() {
        this.canvas = this.createCanvas(this.options.width, this.options.height)
        this.block = this.createCanvas(this.canvas.width, this.canvas.height)
        this.canvasCtx = this.canvas.getContext('2d')
        this.blockCtx = this.block.getContext('2d')
    }

    initImg() {
        return new Promise((resolve) => {
            if (inBrowser()) {
                const img = new Image()
                img.crossOrigin = 'Anonymous'
                img.src = '/Pic' + Math.floor(Math.random() * 100) + '.jpg'
                img.onload = () => {
                    this.drawAll(img)
                    resolve(this)
                }
                this.img = img
            } else {
                loadImage('public/Pic' + Math.floor(Math.random() * 100) + '.jpg').then((img) => {
                    this.drawAll(img)
                    resolve(this)
                })
            }
        })
    }

    log(...args) {
        if (this.debug && !inBrowser()) {
            console.log(...args)
        }
    }

    drawAll(img) {
        this.x = this.getRandomNumberByRange(this.options.width / 2 + 10, this.options.width - (this.maxL + 10))
        this.y = this.getRandomNumberByRange(this.maxD + 10, this.options.height - (this.maxL + 10))
        this.log(this.x, this.y)
        const sliderPath = this.drawPath(this.x, this.y, this.targetBndBox)
        this.drawImg(this.canvasCtx, 'fill', sliderPath)
        if (Math.random() > 0.3) {
            let point = this.getFakePoint()
            if (point.x != 0) {
                const fakePath = this.drawFakePath(point.x, point.y, this.fakeBndBox)
                this.drawImg(this.canvasCtx, 'fill', fakePath)
            }
        }
        this.drawImg(this.blockCtx, 'clip', sliderPath)
        this.canvasCtx.drawImage(img, 0, 0, this.options.width, this.options.height)
        this.blockCtx.drawImage(img, 0, 0, this.options.width, this.options.height)
        this.applyEffect(sliderPath)

        let imageData = this.blockCtx.getImageData(this.targetBndBox.left, this.targetBndBox.top,
            this.targetBndBox.right - this.targetBndBox.left,
            this.targetBndBox.bottom - this.targetBndBox.top)
        this.block.width = this.targetBndBox.right - this.targetBndBox.left + this.options.initialOffset
        this.blockCtx.putImageData(imageData, this.options.initialOffset, this.targetBndBox.top)
        this.canvasCtx.globalCompositeOperation = 'source-over'
        this.canvasCtx.drawImage(this.block, 0, 0)
        this.gtBndBox = {
            left: this.options.initialOffset + Math.floor(this.options.lineWidth / 2),
            top: this.targetBndBox.top + Math.floor(this.options.lineWidth / 2),
            right: this.options.initialOffset + this.targetBndBox.right - this.targetBndBox.left - Math.floor(this.options.lineWidth / 2),
            bottom: this.targetBndBox.bottom - Math.floor(this.options.lineWidth / 2),
        }
        if (this.debug) {
            this.drawBoundingRect()
        }
    }

    getFakePoint(): Point {
        let fx, fy
        let minX = this.options.initialOffset + this.targetBndBox.right - this.targetBndBox.left + this.maxD + 10
        let minY = this.maxD
        let maxX = this.options.width - this.maxL - 10
        let maxY = this.options.height - this.maxL - 10
        if (Math.random() > 0.5) {
            this.fakeSame = true
        }
        let i
        for (i = 20; i > 0; i--) {
            fx = _.random(minX, maxX)
            fy = _.random(minY, maxY)
            if (Math.max(fx - this.maxD, this.targetBndBox.left) < Math.min(fx + this.maxL,
                    this.targetBndBox.right) &&
                Math.max(fy - this.maxD, this.targetBndBox.top) <
                Math.min(fy + this.maxL, this.targetBndBox.bottom)
            ) {
                this.log('overlap, retry')
                continue
            }
            if (this.fakeSame && Math.abs(fy - this.y) < 20) {
                this.log('fake same, too near, retry')
                continue
            }
            this.log('fx', fx, 'fy', fy)
            break
        }
        if (i == 0) {
            fx = 0
            fy = 0
            this.log('failed to get fake point')
        }
        this.fx = fx
        this.fy = fy
        return {x: fx, y: fy}
    }

    hasFakeSlider() {
        return Object.keys(this.fakeBndBox).length > 0
    }

    drawBoundingRect() {
        this.canvasCtx.beginPath()
        this.canvasCtx.rect(this.gtBndBox.left, this.gtBndBox.top,
            this.gtBndBox.right - this.gtBndBox.left,
            this.gtBndBox.bottom - this.gtBndBox.top)
        this.canvasCtx.rect(this.targetBndBox.left, this.targetBndBox.top,
            this.targetBndBox.right - this.targetBndBox.left,
            this.targetBndBox.bottom - this.targetBndBox.top)
        if (this.hasFakeSlider()) {
            this.canvasCtx.rect(this.fakeBndBox.left, this.fakeBndBox.top,
                this.fakeBndBox.right - this.fakeBndBox.left,
                this.fakeBndBox.bottom - this.fakeBndBox.top)
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
        this.blockCtx.lineWidth = this.options.lineWidth
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
        if (this.fakeSame) {
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
        boundingRect.top = y - Math.floor(this.options.lineWidth / 2)
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
export {BoundingRect, Point}