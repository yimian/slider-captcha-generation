// @ts-nocheck

import _ from 'lodash'
import SliderCaptcha from "./slidercaptcha.ts";
import {BoundingRect, Point} from "./slidercaptcha.ts";

enum EdgeType {
    OutLittleTriangle,
    OutLittleRectangle,
    OutLittleArc,
    OutBigTriangle,
    OutBigRectangle,
    OutBigArc,
    InLittleTriangle,
    InLittleRectangle,
    InLittleArc,
    InBigTriangle,
    InBigRectangle,
    InBigArc,
    End
}

class PddCaptcha extends SliderCaptcha {
    public edgeTypes: EdgeType[] = []

    get DEFAULTS() {
        return {
            // width: 280, // canvas宽度
            // height: 155, // canvas高度
            width: 800,
            height: 400,
            PI: Math.PI,
            sliderL: 140, // 滑块边长
            littleTriangle: 10,
            bigTriangle: 20,
            littleRectangle: 10,
            bigRectangle: 20,
            littleArc: 10,
            bigArc: 20,
            lineWidth: 5,
            initialOffset: 25,
            contrast: 0.8, // 对比度, 0.5,1
            brightness: 1.5, // 亮度，1，1.5，0.5
        }
    }


    get maxL() {
        return this.options.sliderL + this.options.lineWidth + 2 * Math.max(
            this.options.bigTriangle, this.options.bigRectangle, this.options.bigArc)
    }

    get maxD() {
        return Math.max(
            this.options.bigTriangle, this.options.bigRectangle, this.options.bigArc) +
            Math.floor(this.options.lineWidth / 2)
    }

    drawPath(x, y, boundingRect: BoundingRect): Path2D {
        for (let i = 0; i < 4; i++) {
            this.edgeTypes.push(this.randomEdgeType())
        }
        return this.drawPathByEdgeTypes(x, y, boundingRect, this.edgeTypes)
    }

    drawFakePath(x, y, boundingRect: BoundingRect): Path2D {
        if (Math.random() < 0.5) {
            this.fakeSame = true
            return this.drawPath(x, y, boundingRect)
        }
        let fakeEdgeTypes = []
        do {
            let same = true
            let edgeType
            for (let i = 0; i < 4; i++) {
                edgeType = this.randomEdgeType()
                fakeEdgeTypes.push(edgeType)
                if (edgeType != this.edgeTypes[i]) {
                    same = false
                }
            }
            if (same) {
                continue
            }
            break
        } while (true)
        return this.drawPathByEdgeTypes(x, y, boundingRect, fakeEdgeTypes)
    }

    drawPathByEdgeTypes(x, y, boundingRect: BoundingRect, edgeTypes: EdgeType[]) {
        const l = this.options.sliderL
        const PI = this.options.PI
        const lTriangle = this.options.littleTriangle
        const bTriangle = this.options.bigTriangle
        const lRect = this.options.littleRectangle
        const bRect = this.options.bigRectangle
        const lArc = this.options.littleArc
        const bArc = this.options.bigArc
        const path = new Path2D()
        path.moveTo(x, y)
        let et1 = edgeTypes[0]
        let offset = this.randomOffset()
        switch (et1) {
            case EdgeType.OutLittleTriangle:
                path.lineTo(x + offset - lTriangle, y)
                path.lineTo(x + offset, y - lTriangle)
                path.lineTo(x + offset + lTriangle, y)
                path.lineTo(x + l, y)
                boundingRect.top = y - lTriangle
                break
            case EdgeType.OutBigTriangle:
                path.lineTo(x + offset - bTriangle, y)
                path.lineTo(x + offset, y - bTriangle)
                path.lineTo(x + offset + bTriangle, y)
                path.lineTo(x + l, y)
                boundingRect.top = y - bTriangle
                break
            case EdgeType.InLittleTriangle:
                path.lineTo(x + offset - lTriangle, y)
                path.lineTo(x + offset, y + lTriangle)
                path.lineTo(x + offset + lTriangle, y)
                path.lineTo(x + l, y)
                boundingRect.top = y
                break
            case EdgeType.InBigTriangle:
                path.lineTo(x + offset - bTriangle, y)
                path.lineTo(x + offset, y + bTriangle)
                path.lineTo(x + offset + bTriangle, y)
                path.lineTo(x + l, y)
                boundingRect.top = y
                break
            case EdgeType.OutLittleRectangle:
                path.lineTo(x + offset - lRect, y)
                path.lineTo(x + offset - lRect, y - lRect)
                path.lineTo(x + offset + lRect, y - lRect)
                path.lineTo(x + offset + lRect, y)
                path.lineTo(x + l, y)
                boundingRect.top = y - lRect
                break
            case EdgeType.OutBigRectangle:
                path.lineTo(x + offset - bRect, y)
                path.lineTo(x + offset - bRect, y - bRect)
                path.lineTo(x + offset + bRect, y - bRect)
                path.lineTo(x + offset + bRect, y)
                path.lineTo(x + l, y)
                boundingRect.top = y - bRect
                break
            case EdgeType.InLittleRectangle:
                path.lineTo(x + offset - lRect, y)
                path.lineTo(x + offset - lRect, y + lRect)
                path.lineTo(x + offset + lRect, y + lRect)
                path.lineTo(x + offset + lRect, y)
                path.lineTo(x + l, y)
                boundingRect.top = y
                break
            case EdgeType.InBigRectangle:
                path.lineTo(x + offset - bRect, y)
                path.lineTo(x + offset - bRect, y + bRect)
                path.lineTo(x + offset + bRect, y + bRect)
                path.lineTo(x + offset + bRect, y)
                path.lineTo(x + l, y)
                boundingRect.top = y
                break
            case EdgeType.OutLittleArc:
                path.arc(x + offset, y, lArc, PI, 2 * PI)
                path.lineTo(x + l, y)
                boundingRect.top = y - lArc
                break
            case EdgeType.OutBigArc:
                path.arc(x + offset, y, bArc, PI, 2 * PI)
                path.lineTo(x + l, y)
                boundingRect.top = y - bArc
                break
            case EdgeType.InLittleArc:
                path.arc(x + offset, y, lArc, PI, 2 * PI, true)
                path.lineTo(x + l, y)
                boundingRect.top = y
                break
            case EdgeType.InBigArc:
                path.arc(x + offset, y, bArc, PI, 2 * PI, true)
                path.lineTo(x + l, y)
                boundingRect.top = y
                break
        }

        let et2 = edgeTypes[1]
        offset = this.randomOffset()
        switch (et2) {
            case EdgeType.OutLittleTriangle:
                path.lineTo(x + l, y + offset - lTriangle)
                path.lineTo(x + l + lTriangle, y + offset)
                path.lineTo(x + l, y + offset + lTriangle)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l + lTriangle
                break
            case EdgeType.OutBigTriangle:
                path.lineTo(x + l, y + offset - bTriangle)
                path.lineTo(x + l + bTriangle, y + offset)
                path.lineTo(x + l, y + offset + bTriangle)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l + bTriangle
                break
            case EdgeType.InLittleTriangle:
                path.lineTo(x + l, y + offset - lTriangle)
                path.lineTo(x + l - lTriangle, y + offset)
                path.lineTo(x + l, y + offset + lTriangle)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l
                break
            case EdgeType.InBigTriangle:
                path.lineTo(x + l, y + offset - bTriangle)
                path.lineTo(x + l - bTriangle, y + offset)
                path.lineTo(x + l, y + offset + bTriangle)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l
                break
            case EdgeType.OutLittleRectangle:
                path.lineTo(x + l, y + offset - lRect)
                path.lineTo(x + l + lRect, y + offset - lRect)
                path.lineTo(x + l + lRect, y + offset + lRect)
                path.lineTo(x + l, y + offset + lRect)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l + lRect
                break
            case EdgeType.OutBigRectangle:
                path.lineTo(x + l, y + offset - bRect)
                path.lineTo(x + l + bRect, y + offset - bRect)
                path.lineTo(x + l + bRect, y + offset + bRect)
                path.lineTo(x + l, y + offset + bRect)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l + bRect
                break
            case EdgeType.InLittleRectangle:
                path.lineTo(x + l, y + offset - lRect)
                path.lineTo(x + l - lRect, y + offset - lRect)
                path.lineTo(x + l - lRect, y + offset + lRect)
                path.lineTo(x + l, y + offset + lRect)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l
                break
            case EdgeType.InBigRectangle:
                path.lineTo(x + l, y + offset - bRect)
                path.lineTo(x + l - bRect, y + offset - bRect)
                path.lineTo(x + l - bRect, y + offset + bRect)
                path.lineTo(x + l, y + offset + bRect)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l
                break
            case EdgeType.OutLittleArc:
                path.arc(x + l, y + offset, lArc, 1.5 * PI, 2.5 * PI)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l + lArc
                break
            case EdgeType.OutBigArc:
                path.arc(x + l, y + offset, bArc, 1.5 * PI, 2.5 * PI)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l + bArc
                break
            case EdgeType.InLittleArc:
                path.arc(x + l, y + offset, lArc, 1.5 * PI, 0.5 * PI, true)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l
                break
            case EdgeType.InBigArc:
                path.arc(x + l, y + offset, bArc, 1.5 * PI, 0.5 * PI, true)
                path.lineTo(x + l, y + l)
                boundingRect.right = x + l
                break
        }

        let et3 = edgeTypes[2]
        offset = this.randomOffset()
        switch (et3) {
            case EdgeType.OutLittleTriangle:
                path.lineTo(x + l - offset + lTriangle, y + l)
                path.lineTo(x + l - offset, y + l + lTriangle)
                path.lineTo(x + l - offset - lTriangle, y + l)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l + lTriangle
                break
            case EdgeType.OutBigTriangle:
                path.lineTo(x + l - offset + bTriangle, y + l)
                path.lineTo(x + l - offset, y + l + bTriangle)
                path.lineTo(x + l - offset - bTriangle, y + l)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l + bTriangle
                break
            case EdgeType.InLittleTriangle:
                path.lineTo(x + l - offset + lTriangle, y + l)
                path.lineTo(x + l - offset, y + l - lTriangle)
                path.lineTo(x + l - offset - lTriangle, y + l)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l
                break
            case EdgeType.InBigTriangle:
                path.lineTo(x + l - offset + bTriangle, y + l)
                path.lineTo(x + l - offset, y + l - bTriangle)
                path.lineTo(x + l - offset - bTriangle, y + l)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l
                break
            case EdgeType.OutLittleRectangle:
                path.lineTo(x + l - offset + lRect, y + l)
                path.lineTo(x + l - offset + lRect, y + l + lRect)
                path.lineTo(x + l - offset - lRect, y + l + lRect)
                path.lineTo(x + l - offset - lRect, y + l)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l + lRect
                break
            case EdgeType.OutBigRectangle:
                path.lineTo(x + l - offset + bRect, y + l)
                path.lineTo(x + l - offset + bRect, y + l + bRect)
                path.lineTo(x + l - offset - bRect, y + l + bRect)
                path.lineTo(x + l - offset - bRect, y + l)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l + bRect
                break
            case EdgeType.InLittleRectangle:
                path.lineTo(x + l - offset + lRect, y + l)
                path.lineTo(x + l - offset + lRect, y + l - lRect)
                path.lineTo(x + l - offset - lRect, y + l - lRect)
                path.lineTo(x + l - offset - lRect, y + l)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l
                break
            case EdgeType.InBigRectangle:
                path.lineTo(x + l - offset + bRect, y + l)
                path.lineTo(x + l - offset + bRect, y + l - bRect)
                path.lineTo(x + l - offset - bRect, y + l - bRect)
                path.lineTo(x + l - offset - bRect, y + l)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l
                break
            case EdgeType.OutLittleArc:
                path.arc(x + l - offset, y + l, lArc, 0, PI)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l + lArc
                break
            case EdgeType.OutBigArc:
                path.arc(x + l - offset, y + l, bArc, 0, PI)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l + bArc
                break
            case EdgeType.InLittleArc:
                path.arc(x + l - offset, y + l, lArc, 0, PI, true)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l
                break
            case EdgeType.InBigArc:
                path.arc(x + l - offset, y + l, bArc, 0, PI, true)
                path.lineTo(x, y + l)
                boundingRect.bottom = y + l
                break
        }

        let et4 = edgeTypes[3]
        offset = this.randomOffset()
        switch (et4) {
            case EdgeType.OutLittleTriangle:
                path.lineTo(x, y + l - offset + lTriangle)
                path.lineTo(x - lTriangle, y + l - offset)
                path.lineTo(x, y + l - offset - lTriangle)
                path.lineTo(x, y)
                boundingRect.left = x - lTriangle
                break
            case EdgeType.OutBigTriangle:
                path.lineTo(x, y + l - offset + bTriangle)
                path.lineTo(x - bTriangle, y + l - offset)
                path.lineTo(x, y + l - offset - bTriangle)
                path.lineTo(x, y)
                boundingRect.left = x - bTriangle
                break
            case EdgeType.InLittleTriangle:
                path.lineTo(x, y + l - offset + lTriangle)
                path.lineTo(x + lTriangle, y + l - offset)
                path.lineTo(x, y + l - offset - lTriangle)
                path.lineTo(x, y)
                boundingRect.left = x
                break
            case EdgeType.InBigTriangle:
                path.lineTo(x, y + l - offset + bTriangle)
                path.lineTo(x + bTriangle, y + l - offset)
                path.lineTo(x, y + l - offset - bTriangle)
                path.lineTo(x, y)
                boundingRect.left = x
                break
            case EdgeType.OutLittleRectangle:
                path.lineTo(x, y + l - offset + lRect)
                path.lineTo(x - lRect, y + l - offset + lRect)
                path.lineTo(x - lRect, y + l - offset - lRect)
                path.lineTo(x, y + l - offset - lRect)
                path.lineTo(x, y)
                boundingRect.left = x - lRect
                break
            case EdgeType.OutBigRectangle:
                path.lineTo(x, y + l - offset + bRect)
                path.lineTo(x - bRect, y + l - offset + bRect)
                path.lineTo(x - bRect, y + l - offset - bRect)
                path.lineTo(x, y + l - offset - bRect)
                path.lineTo(x, y)
                boundingRect.left = x - bRect
                break
            case EdgeType.InLittleRectangle:
                path.lineTo(x, y + l - offset + lRect)
                path.lineTo(x + lRect, y + l - offset + lRect)
                path.lineTo(x + lRect, y + l - offset - lRect)
                path.lineTo(x, y + l - offset - lRect)
                path.lineTo(x, y)
                boundingRect.left = x
                break
            case EdgeType.InBigRectangle:
                path.lineTo(x, y + l - offset + bRect)
                path.lineTo(x + bRect, y + l - offset + bRect)
                path.lineTo(x + bRect, y + l - offset - bRect)
                path.lineTo(x, y + l - offset - bRect)
                path.lineTo(x, y)
                boundingRect.left = x
                break
            case EdgeType.OutLittleArc:
                path.arc(x, y + l - offset, lArc, 0.5 * PI, 1.5 * PI)
                path.lineTo(x, y)
                boundingRect.left = x - lArc
                break
            case EdgeType.OutBigArc:
                path.arc(x, y + l - offset, bArc, 0.5 * PI, 1.5 * PI)
                path.lineTo(x, y)
                boundingRect.left = x - bArc
                break
            case EdgeType.InLittleArc:
                path.arc(x, y + l - offset, lArc, 0.5 * PI, 1.5 * PI, true)
                path.lineTo(x, y)
                boundingRect.left = x
                break
            case EdgeType.InBigArc:
                path.arc(x, y + l - offset, bArc, 0.5 * PI, 1.5 * PI, true)
                path.lineTo(x, y)
                boundingRect.left = x
                break
        }
        boundingRect.left -= Math.floor(this.options.lineWidth / 2)
        boundingRect.right += Math.floor(this.options.lineWidth / 2)
        boundingRect.top -= Math.floor(this.options.lineWidth / 2)
        boundingRect.bottom += Math.floor(this.options.lineWidth / 2)
        return path
    }

    drawImg(ctx: CanvasRenderingContext2D, operation: string, path: Path2D) {
        if (operation == 'fill') {
            ctx.fillStyle = 'rgba(20, 20, 20, 0.7)'
            ctx.lineWidth = this.options.lineWidth
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.7)'
            ctx.fill(path)
            ctx.stroke(path)
        } else {
            ctx.lineWidth = this.options.lineWidth
            ctx.clip(path)
        }
        ctx.globalCompositeOperation = 'destination-over'
    }

    randomEdgeType() {
        return _.random(0, EdgeType.End - 1)
    }

    randomOffset() {
        return _.random(this.maxD + 10, this.options.sliderL - this.maxD - 10)
    }
}

export default PddCaptcha