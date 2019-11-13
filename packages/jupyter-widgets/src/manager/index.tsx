import * as React from "react";
import { RecordOf, fromJS } from "immutable";
import { WidgetManager } from "./widget-manager";
import BackboneWrapper from "../renderer/backbone-wrapper";
import { connect } from "react-redux";
import {
  AppState,
  selectors,
  actions,
  KernelNotStartedProps,
  LocalKernelProps,
  RemoteKernelProps,
  ContentRef
} from "@nteract/core";
import { CellId } from "@nteract/commutable";
import { WidgetModel } from "@jupyter-widgets/base";
import { WidgetComm } from "./widget-comms";

interface ConnectedProps {
  modelById: (id: string) => any;
  kernel?:
    | RecordOf<KernelNotStartedProps>
    | RecordOf<LocalKernelProps>
    | RecordOf<RemoteKernelProps>
    | null;
}

export interface ManagerActions {
  actions: {
    appendOutput: (output: any) => void;
    clearOutput: () => void;
    updateCellStatus: (status: string) => void;
    promptInputRequest: (prompt: string, password: boolean) => void;
  };
}

interface OwnProps {
  model_id: string;
  id: CellId;
  contentRef: ContentRef;
}

type Props = ConnectedProps & OwnProps & ManagerActions;

/**
 * This component is is a wrapper component that initializes a
 * WidgetManager singleton and passes a model reference to the
 * BackboneModelWrapper. It's doing most of the heavy lifting with
 * respect to bridging the kernels comms that the WidgetManager provides,
 * our client-side state model, and the view.
 */
class Manager extends React.Component<Props> {
  widgetContainerRef = React.createRef<HTMLDivElement>();
  static manager: WidgetManager;

  constructor(props: Props) {
    super(props);
  }

  /**
   * Because the iPyWidgets keeps track of the widgets it creates as a
   * member variable, the WidgetManager needs to be treated like a singleton.
   * However, we still need to be constantly updating the singleton with the most up
   * to date modelById function, otherwise it will be searching a stale state for a
   * model
   */
  getManager() {
    if (Manager.manager === undefined) {
      Manager.manager = new WidgetManager(
        this.props.kernel,
        this.props.modelById,
        this.props.actions
      );
    } else {
      Manager.manager.update(
        this.props.kernel,
        this.props.modelById,
        this.props.actions
      );
    }
    return Manager.manager;
  }

  render() {
    const getModel = async () => {
      const model = await this.props.modelById(this.props.model_id);
      const model_state = model.get("state");
      console.log(model_state);
      return model_state;
    };
    return (
      <React.Fragment>
        <BackboneWrapper
          getModelState={getModel}
          manager={this.getManager()}
          model_id={this.props.model_id}
          widgetContainerRef={this.widgetContainerRef}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: AppState, props: OwnProps): ConnectedProps => {
  let currentKernel = selectors.currentKernel(state);
  return {
    modelById: async (model_id: string) => {
      let model = selectors.modelById(state, { commId: model_id });
      //if we can't find the model, request the state from the kernel and try again
      if (!model) {
        console.log(`requesting state for ${model_id}`);
        model = WidgetComm.request_state(currentKernel, model_id).then(
          reply => {
            console.log("setting model", reply);
            return Promise.resolve(fromJS(reply.content.data));
          }
        );
      }
      return model;
    },
    kernel: selectors.currentKernel(state)
  };
};

const mapDispatchToProps = (dispatch: any, props: OwnProps): ManagerActions => {
  return {
    actions: {
      appendOutput: (output: any) =>
        dispatch(
          actions.appendOutput({
            id: props.id,
            contentRef: props.contentRef,
            output
          })
        ),
      clearOutput: () =>
        dispatch(
          actions.clearOutputs({
            id: props.id,
            contentRef: props.contentRef
          })
        ),
      updateCellStatus: (status: string) =>
        dispatch(
          actions.updateCellStatus({
            id: props.id,
            contentRef: props.contentRef,
            status
          })
        ),
      promptInputRequest: (prompt: string, password: boolean) =>
        dispatch(
          actions.promptInputRequest({
            id: props.id,
            contentRef: props.contentRef,
            prompt,
            password
          })
        )
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Manager);
