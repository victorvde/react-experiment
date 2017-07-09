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
            true: 3000,
            goal: 2000,
        };
    }

    render() {
        return <div className="App">
            <form>
                <MMRInput l={L(this, "current")}>Current MMR: </MMRInput><br/>
                <MMRInput l={L(this, "true")}>True MMR: </MMRInput><br />
                <MMRInput l={L(this, "goal")}>Goal MMR: </MMRInput>
            </form>
            <p>The values are {this.state.current} { this.state.true} {this.state.goal}.</p>
        </div>;
    }
}

class MMRInput extends PureComponent {
    handleChange = (event) => { this.props.l.onChange(event.target.value); };

    render() {
        return <label>
            {this.props.children}
            <input type="text" pattern="[0-9]+" size="4" value={this.props.l.value} onChange={this.handleChange} />
            <input type="range" min="1" max="10000" value={this.props.l.value} onChange={this.handleChange} />
        </label>;
    }
}

export default App;
