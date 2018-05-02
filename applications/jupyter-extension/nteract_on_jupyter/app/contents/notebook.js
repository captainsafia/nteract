// @flow

import * as React from "react";

import { NotebookMenu, state as stateModule } from "@nteract/core";

import {
  displayOrder as defaultDisplayOrder,
  transforms as defaultTransforms
} from "@nteract/transforms";

const displayOrder = [
  "application/vnd.vega.v3+json",
  "application/vnd.vega.v2+json",
  "application/vnd.vegalite.v2+json",
  "application/vnd.vegalite.v1+json",
  "application/geo+json",
  "application/vnd.plotly.v1+json",
  "text/vnd.plotly.v1+html",
  "application/x-nteract-model-debug+json",
  "application/vnd.dataresource+json",
  "application/vdom.v1+json",
  "application/json",
  "application/javascript",
  "text/html",
  "text/markdown",
  "text/latex",
  "image/svg+xml",
  "image/gif",
  "image/png",
  "image/jpeg",
  "text/plain"
];

const NullTransform = () => null;
// As the transforms are loaded, these get overridden with the better variants
const transforms = {
  ...defaultTransforms,
  "application/vnd.vega.v3+json": NullTransform,
  "application/vnd.vega.v2+json": NullTransform,
  "application/vnd.vegalite.v2+json": NullTransform,
  "application/vnd.vegalite.v1+json": NullTransform,
  "application/geo+json": NullTransform,
  "application/vnd.plotly.v1+json": NullTransform,
  "text/vnd.plotly.v1+html": NullTransform,
  "application/x-nteract-model-debug+json": NullTransform,
  "application/vnd.dataresource+json": NullTransform
};

class NotebookPlaceholder extends React.Component<Props, null> {
  render() {
    // TODO: Show an approximated notebook
    return null;
  }
}

type State = {
  transforms: typeof defaultTransforms,
  displayOrder: typeof defaultDisplayOrder,
  App: React.ComponentType<any>
};

type Props = {
  contentRef: stateModule.ContentRef
};

export default class Notebook extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayOrder,
      transforms,
      // TODO: create a true placeholder element
      App: NotebookPlaceholder
    };
  }

  registerTransform(transform: { MIMETYPE: string }) {
    this.setState({
      transforms: { ...this.state.transforms, [transform.MIMETYPE]: transform }
    });
  }

  loadApp() {
    import("@nteract/notebook-app-component").then(module => {
      this.setState({ App: module.default });
    });
  }

  loadTransforms() {
    import("@nteract/transform-plotly").then(module => {
      this.registerTransform(module.default);
      this.registerTransform(module.PlotlyNullTransform);
    });

    import("@nteract/transform-model-debug").then(module => {
      this.registerTransform(module.default);
    });

    import("@nteract/transform-dataresource").then(module => {
      this.registerTransform(module.default);
    });

    import("@nteract/transform-vega").then(module => {
      this.setState({
        transforms: {
          ...this.state.transforms,
          [module.VegaLite1.MIMETYPE]: module.VegaLite1,
          [module.VegaLite1.MIMETYPE]: module.VegaLite2,
          [module.VegaLite1.MIMETYPE]: module.Vega2,
          [module.VegaLite1.MIMETYPE]: module.Vega3
        }
      });
    });

    // TODO: The geojson transform will likely need some work because of the basemap URL(s)
    // import GeoJSONTransform from "@nteract/transform-geojson";
  }

  componentDidMount() {
    this.loadApp();
    this.loadTransforms();
  }

  render() {
    const App = this.state.App;

    return (
      <React.Fragment>
        <NotebookMenu />
        <App
          contentRef={this.props.contentRef}
          displayOrder={this.state.displayOrder}
          transforms={this.state.transforms}
        />
      </React.Fragment>
    );
  }
}