import React, { Component } from "react";
import { Provider } from "react-redux";
import Root from "./src/Root";
import { store } from "./src/redux/store";
class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Root />
            </Provider>
        );
    }
}

export default App;