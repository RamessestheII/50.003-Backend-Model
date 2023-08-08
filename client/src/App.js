import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Update import
import React, { Fragment } from "react";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Alert from "./components/layout/Alert";



//Redux, combines redux n react
import {Provider} from "react-redux";
import store from "./store";

const App = () => (
  <Provider store={store}>
  <Router>
    <Fragment>
      <Navbar />
      <section className='container'>
        <Alert/>
        <Routes> {/* Replace Switch with Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </section>
    </Fragment>
  </Router>
  </Provider>
);

export default App;
