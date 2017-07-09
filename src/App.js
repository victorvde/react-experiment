import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
      return <div className="App">
          <form>
              <MMRInput>Current MMR:</MMRInput><br/>
              <MMRInput>True MMR:</MMRInput></form>
          <p>The difference is XXX</p>
      </div>;
  }
}

class MMRInput extends Component {
    constructor(props) {
        super(props);
        this.state = {value: 1};
    }

    handleChange = (event) => { this.setState({value: event.target.value}); };

    render() {
        return <label>
            {this.props.children}
            <input type="text" pattern="[0-9]+" size="4" value={this.state.value} onChange={this.handleChange} />
            <input type="range" min="1" max="10000" value={this.state.value} onChange={this.handleChange} />
        </label>;
    }
}

export default App;
