import React, { Component, PureComponent } from 'react';
import './App.css';


function winChance(mmr_difference) {
    return Math.min(0.9, Math.max(0.1, mmr_difference / 1500 + 0.5));
}

function quantiles(a, q) {
    let acc = 0.;
    let qi = 0;
    let r = [];
    a.some((v, i) => {
        const acc_ = acc + v;
        if(acc <= q[qi] && q[qi] <= acc_) {
            r[qi] = i;
            qi++;
            if(qi >= q.length) {
                return true;
            }
        }
        acc = acc_;
        return false;
    });
    return r;
}

function mmrData(current, real) {
    let now = [];
    now[current] = 1.;
    const cache = [];

    return function(n) {
        for(let i=cache.length; i <= n; i++) {
            cache[i] = quantiles(now, [0.1, 0.5, 0.9]);
            const next = [];
            now.forEach((v, mmr) => {
                const lose = mmr < 25 ? mmr : mmr - 25;
                const win = mmr + 25;
                const chance = winChance(real - mmr);
                if(next[lose] === undefined) next[lose] = 0.;
                next[lose] += v * (1 - chance);
                if(next[win] === undefined) next[win] = 0.;
                next[win] += v * chance;
            });
            now = next;
        }

        return cache[n];
    };
}

function L(t, name) {
    return {
        value: t.state[name],
        onChange: (v) => t.setState({[name]: v}),
    };
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1000,
            real: 3000,
        };
    }

    render() {
        return <div className="App">
            <form className="form">
                <MMRInput {...L(this, "current")}>Current MMR: </MMRInput><br/>
                <MMRInput {...L(this, "real")}>True MMR: </MMRInput><br />
            </form>
            <MMRGraph height={500} width={500} f={mmrData(+this.state.current, +this.state.real)}/>
        </div>;
    }
}

class MMRInput extends PureComponent {
    handleChange = (event) => { this.props.onChange(event.target.value); };

    render() {
        return <label>
            {this.props.children}
            <input type="text" pattern="[0-9]+" size="4" value={this.props.value} onChange={this.handleChange} />
            <input type="range" min="1" max="10000" value={this.props.value} onChange={this.handleChange} />
        </label>;
    }
}

function fixedSteps(start, end, step) {
    const v = [];
    for(let i = Math.ceil(start / step) * step; i < end; i+=step) {
        v.push(i);
    }
    return v;
}

class MMRGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pos: [0, -this.props.height],
            dragMouse: null,
            dragPos: null,
        };
    }

    onMouseDown = (e) =>  {
        if (e.button !== 0) {
            return;
        }
        this.setState({
            dragMouse: [e.screenX, e.screenY],
            dragPos: this.state.pos,
        });
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        e.preventDefault();
    }

    updatePosition(e) {
        this.setState({
            pos: [
                Math.max(0, this.state.dragMouse[0] - e.screenX + this.state.dragPos[0]),
                Math.min(-this.props.height, this.state.dragMouse[1] - e.screenY + this.state.dragPos[1]),
            ],
        });
    }

    cleanup = () => {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    onMouseUp = (e) => {
        this.updatePosition(e);
        this.cleanup();
    }

    onMouseMove = (e) => {
        this.updatePosition(e);
        if(e.buttons & 1 === 0) {
            this.cleanup();
        }
    }

    render() {
        const bgcolor = "#f0f0ff";

        const w = this.props.width;
        const h = this.props.height;

        const [vx, vy] = this.state.pos;

        const max = 1000000;

        const xscale = 1;
        const xstep = 2.5;
        const xmark_every = 50;
        const xline_every = 10;
        const yscale = 25;
        const ystep = 1.25;
        const ymark_every = 40;
        const yline_every = 20;

        const xlines = fixedSteps(vx, vx + w, xline_every * xstep);
        const ylines = fixedSteps(vy, vy + h, yline_every * ystep);
        const xmarks = fixedSteps(vx, vx + w, xmark_every * xstep);
        const ymarks = fixedSteps(vy, vy + h, ymark_every * ystep);
        const datax = fixedSteps(vx - xstep + 1, vx + w + xstep - 1, xstep);
        const data = datax.map((x) => this.props.f(x / xstep));
        const polygon = [];
        for(let i=0; i < datax.length; i++) {
            polygon.push(`${datax[i]},${-data[i][0] / yscale * ystep}`);
        }
        for(let i=datax.length - 1; i >= 0; i--) {
            polygon.push(`${datax[i]},${-data[i][2] / yscale * ystep}`);
        }

        return <svg width={w} height={h} id="mmrgraph" onMouseDown={this.onMouseDown}>
            <defs>
                <filter id="solid">
                    <feFlood floodColor={bgcolor}/>
                    <feComposite in="SourceGraphic"/>
                </filter>
            </defs>
            <rect x="0" y="0" width={w} height={h} fill={bgcolor} />
            <g transform={`translate(${-vx} ${-vy})`}>
                {xlines.map((x) => <line x1={x+.5} x2={x+.5} y1={-max} y2={max} className="grid" key={`gv${x}`} />)}
                {ylines.map((y) => <line x1={-max} x2={max} y1={y-.5} y2={y-.5} className="grid" key={`gh${y}`} />)}
                <polygon points={polygon.join(" ")} fill="#880000" stroke="#880000" />
            </g>
            <g transform={`translate(0 ${-vy})`}>
                {ymarks.map((y) => <text filter="url(#solid)" x={0} y={y} dominantBaseline="text-before-edge" key={`ym${y}`}>{-y / ystep * yscale}</text>)}
            </g>
            <g transform={`translate(${-vx} 0)`}>
                {xmarks.map((x) => <text filter="url(#solid)" x={x} y={h} textAnchor="start" dominantBaseline="text-after-edge" key={`xm${x}`}>{x / xstep * xscale}</text>)}
            </g>
        </svg>;
    }
}

export default App;
