import React, { Component, PureComponent } from 'react';
import './App.css';

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
            <p>The values are {this.state.current} { this.state.real}.</p>
            <MMRGraph height={300} width={500} current={this.state.current} real={this.state.real} />
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
            pos: [-10, 10-this.props.height],
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
                this.state.dragMouse[0] - e.screenX + this.state.dragPos[0],
                this.state.dragMouse[1] - e.screenY + this.state.dragPos[1],
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

        let max = 1000000;

        let [vx, vy] = this.state.pos;

        let vlines = fixedSteps(vx, vx + w, 25);
        let hlines = fixedSteps(vy, vy + h, 25);
        let xmarks = fixedSteps(vx, vx + w, 100);
        let ymarks = fixedSteps(vy, vy + h, 100);

        return <div><svg width={w} height={h} id="mmrgraph" onMouseDown={this.onMouseDown}>
            <defs>
                <filter id="solid">
                    <feFlood floodColor="#ffffff"/>
                    <feComposite in="SourceGraphic"/>
                </filter>
            </defs>
            <rect x="0" y="0" width={w} height={h} fill="#f0f0ff" />
            <g transform={`translate(${-vx} ${-vy})`}>
                <circle cx={0} cy={0} r="10" fill="#00ff00" />
                {vlines.map((x, _) => <line x1={x+.5} x2={x+.5} y1={-max} y2={max} className={x===0?"axis":"grid"} key={`gv${x}`} />)}
                {hlines.map((y, _) => <line x1={-max} x2={max} y1={y-.5} y2={y-.5} className={y===0?"axis":"grid"} key={`gh${y}`} />)}
            </g>
            <g transform={`translate(0 ${-vy})`}>
                {ymarks.map((y, _) => <text filter="url(#solid)" x={0} y={y} dominantBaseline="central" key={`ym${y}`}>{-y}</text>)}
            </g>
            <g transform={`translate(${-vx} 0)`}>
                {xmarks.map((x, _) => <text filter="url(#solid)" x={x} y={h} textAnchor="middle" dominantBaseline="text-after-edge" key={`xm${x}`}>{x}</text>)}
            </g>
        </svg>
        <p>{this.state.pos[0]} {this.state.pos[1]}</p></div>;
    }
}

export default App;
