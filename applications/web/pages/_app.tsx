import withRedux from "next-redux-wrapper";
import App from "next/app";
import React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import configureStore from "../redux/store";

interface StoreProps {
  store: Store;
}

class WebApp extends App<StoreProps> {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default withRedux(configureStore as any)(WebApp);
