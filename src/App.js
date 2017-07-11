import React, { Component, PureComponent } from 'react';
import './App.css';

function mmrData(current, real) {
    return function(i) {
        return [current + i*25, 0, real + i*25];
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
    let v = [];
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
        console.log("DOWN");
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
        console.log("UP");
        this.updatePosition(e);
        this.cleanup();
    }

    onMouseMove = (e) => {
        console.log("MOVE");
        this.updatePosition(e);
        if(e.buttons & 1 === 0) {
            this.cleanup();
        }
    }

    render() {
        let w = this.props.width;
        let h = this.props.height;

        let [vx, vy] = this.state.pos;

        let max = 1000000;

        let xscale = 1;
        let xstep = 25;
        let xmark_every = 5;
        let xline_every = 5;
        let yscale = 25;
        let ystep = 1.25;
        let ymark_every = 40;
        let yline_every = 20;

        let xlines = fixedSteps(vx, vx + w, xline_every * xstep);
        let ylines = fixedSteps(vy, vy + h, yline_every * ystep);
        let xmarks = fixedSteps(vx, vx + w, xmark_every * xstep);
        let ymarks = fixedSteps(vy, vy + h, ymark_every * ystep);
        let datax = fixedSteps(vx - xstep, vx + w + xstep, xstep);
        let data = datax.map((x) => this.props.f(x / xstep));
        let polygons = [];
        for(let i=0; i < datax.length - 1; i++) {
            let x1 = datax[i];
            let x2 = datax[i+1];
            let y1l = -data[i][0] / yscale * ystep;
            let y1h = -data[i][2] / yscale * ystep;
            let y2l = -data[i+1][0] / yscale * ystep;
            let y2h = -data[i+1][2] / yscale * ystep;
            polygons.push(`${x1},${y1l}  ${x1},${y1h} ${x2},${y2h} ${x2},${y2l}`);
        }

        return <svg width={w} height={h} id="mmrgraph" onMouseDown={this.onMouseDown}>
            <defs>
                <filter id="solid">
                    <feFlood floodColor="#ffffff"/>
                    <feComposite in="SourceGraphic"/>
                </filter>
            </defs>
            <rect x="0" y="0" width={w} height={h} fill="#f0f0ff" />
            <g transform={`translate(${-vx} ${-vy})`}>
                <circle cx={0} cy={0} r="10" fill="#00ff00" />
                {xlines.map((x) => <line x1={x+.5} x2={x+.5} y1={-max} y2={max} className={x===0?"axis":"grid"} key={`gv${x}`} />)}
                {ylines.map((y) => <line x1={-max} x2={max} y1={y-.5} y2={y-.5} className={y===0?"axis":"grid"} key={`gh${y}`} />)}
                {polygons.map((p) => <polygon points={p} fill="#880000" stroke="#880000" /> )}
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
