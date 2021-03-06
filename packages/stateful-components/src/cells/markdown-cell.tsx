import { defineConfigOption } from "@nteract/mythic-configuration";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { actions, AppState, ContentRef, selectors } from "@nteract/core";
import { MarkdownPreviewer } from "@nteract/markdown";
import { Source } from "@nteract/presentational-components";

import Editor, { EditorSlots } from "../inputs/editor";

import { ImmutableCell } from "@nteract/commutable/src";
import { ReactMarkdownProps } from "react-markdown";

const {
  selector: markdownConfig,
} = defineConfigOption({
  key: "markdownOptions",
  label: "Markdown Editor Options",
  defaultValue: {},
});

interface NamedMDCellSlots {
  editor?: EditorSlots;
  toolbar?: () => JSX.Element;
}

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  cell_type?: "markdown";
  children?: NamedMDCellSlots;
}

interface StateProps {
  isCellFocused: boolean;
  isEditorFocused: boolean;
  cell?: ImmutableCell;
  markdownOptions: ReactMarkdownProps;
}

interface DispatchProps {
  focusAboveCell: () => void;
  focusBelowCell: () => void;
  focusEditor: () => void;
  unfocusEditor: () => void;
}

export class PureMarkdownCell extends React.Component<
  ComponentProps & DispatchProps & StateProps
> {
  render() {
    const { contentRef, id, cell, children } = this.props;

    const { isEditorFocused, isCellFocused, markdownOptions } = this.props;

    const {
      focusAboveCell,
      focusBelowCell,
      focusEditor,
      unfocusEditor,
    } = this.props;

    /**
     * We don't set the editor slots as defaults to support dynamic imports
     * Users can continue to add the editorSlots as children
     */
    const editor = children?.editor
    const toolbar = children?.toolbar;

    const source = cell ? cell.get("source", "") : "";

    return (
      <div className="nteract-md-cell nteract-cell">
        <div className="nteract-cell-row">
          <div className="nteract-cell-gutter">{toolbar && toolbar()}</div>
          <div className="nteract-cell-body">
            <MarkdownPreviewer
              focusAbove={focusAboveCell}
              focusBelow={focusBelowCell}
              focusEditor={focusEditor}
              cellFocused={isCellFocused}
              editorFocused={isEditorFocused}
              unfocusEditor={unfocusEditor}
              source={source}
              markdownOptions={markdownOptions}
            >
              <Source className="nteract-cell-source">
                <Editor id={id} contentRef={contentRef}>
                  {editor}
                </Editor>
              </Source>
            </MarkdownPreviewer>
          </div>
        </div>
      </div>
    );
  }
}

export const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
): ((state: AppState) => StateProps) => {
  const { id, contentRef } = ownProps;
  const mapStateToProps = (state: AppState): StateProps => {
    const model = selectors.model(state, { contentRef });
    let isCellFocused = false;
    let isEditorFocused = false;
    let cell;

    if (model && model.type === "notebook") {
      cell = selectors.notebook.cellById(model, { id });
      isCellFocused = model.cellFocused === id;
      isEditorFocused = model.editorFocused === id;
    }

    const markdownOptionsDefaults = {
      linkTarget: "_blank",
    };
    const currentMarkdownOptions = markdownConfig(state);

    const markdownOptions = Object.assign(
      {},
      markdownOptionsDefaults,
      currentMarkdownOptions
    );

    return {
      cell,
      isCellFocused,
      isEditorFocused,
      markdownOptions,
    };
  };

  return mapStateToProps;
};

const makeMapDispatchToProps = (
  initialDispatch: Dispatch,
  ownProps: ComponentProps
): ((dispatch: Dispatch) => DispatchProps) => {
  const { id, contentRef } = ownProps;

  const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    focusAboveCell: () => {
      dispatch(actions.focusPreviousCell({ id, contentRef }));
      dispatch(actions.focusPreviousCellEditor({ id, contentRef }));
    },
    focusBelowCell: () => {
      dispatch(
        actions.focusNextCell({ id, createCellIfUndefined: true, contentRef })
      );
      dispatch(actions.focusNextCellEditor({ id, contentRef }));
    },
    focusEditor: () => dispatch(actions.focusCellEditor({ id, contentRef })),
    unfocusEditor: () =>
      dispatch(actions.focusCellEditor({ id: undefined, contentRef })),
  });

  return mapDispatchToProps;
};

const MarkdownCell = connect(
  makeMapStateToProps,
  makeMapDispatchToProps
)(PureMarkdownCell);

export default MarkdownCell;
