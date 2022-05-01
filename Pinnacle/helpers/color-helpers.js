/* Thank you stackoverflow? i forgot where this was from */
/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR 
 * r, g, b
*/
function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function complement(r, g, b) {
    let hsv = RGBtoHSV(r, g, b);
    if (hsv.s != 0) {
        hsv.h += 0.5;
        if (hsv.h > 1) { hsv.h -= 1; }
        hsv.v = 1 - hsv.v;
    } else {
        let w = hsv.v >= 0.5 ? 0 : 1;
        return { r: w, g: w, b: w };
    }
    return HSVtoRGB(hsv);
}

function getInverseBackgroundColor(elem) {
    while (getComputedStyle(elem)['background-color'] == 'rgba(0, 0, 0, 0)' && elem != document.body) {
        elem = elem.parentElement;
    }
    let s = getComputedStyle(elem);
    let r, g, b, a = 0;
    if (s['background-color'] == 'rgba(0, 0, 0, 0)') {
        r = 255;
        g = 255;
        b = 255;
    } else {
        [r, g, b, a] = s['background-color'].match(/\d+/g).map(Number);
    }
    let ret = complement(r, g, b);
    //console.log(r,g,b);
    //console.log(ret.r, ret.g, ret.b);
    return `rgb(${ret.r},${ret.g},${ret.b})`;
}