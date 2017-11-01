// Copyright 2017 Quip

import React from "react";
import quip from "quip";
import cx from "classnames";

import handleRichTextBoxKeyEventNavigation from "quip-apps-handle-richtextbox-key-event-navigation";
import { setFocusedStep } from "../menus";

import Styles from "./step.less";
import Chevron from "quip-apps-chevron";

const VERTICAL_PADDING = 12;
const INPUT_HEIGHT = 19;

export default class Step extends React.Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(quip.elements.RichTextEntity)
            .isRequired,
        color: React.PropTypes.string.isRequired,
        onSelected: React.PropTypes.func.isRequired,
        onDelete: React.PropTypes.func.isRequired,
        selected: React.PropTypes.bool,
    };

    constructor(props) {
        super();
        this.state = {
            isContextMenuOpen: false,
        };
    }

    setSelected = () => {
        this.props.onSelected(this.props.record);
    };

    deleteStep = () => {
        this.props.onDelete(this.props.record);
    };

    showContextMenu = e => {
        if (this.state.isContextMenuOpen) {
            return;
        }
        this.setState({
            isContextMenuOpen: true,
        });
        let menuCommandIds = ["comment", "deleteStep"];
        if (!this.props.selected) {
            menuCommandIds = [
                "selectStepFromMenu",
                quip.elements.DocumentMenuCommands.SEPARATOR,
                ...menuCommandIds,
            ];
        }
        quip.elements.showContextMenuFromButton(
            e.currentTarget,
            menuCommandIds,
            [], // highlighted
            [], // disabled
            () => {
                this.setState({
                    isContextMenuOpen: false,
                });
            },
            // contextArg
            {
                deleteStep: this.deleteStep,
                record: this.props.record,
            },
        );
        e.preventDefault();
        e.stopPropagation();
    };

    noText = selection => selection.anchorNode.length == null;
    cursorOnRight = selection =>
        selection.anchorOffset === selection.anchorNode.length;
    cursorOnLeft = selection => selection.anchorOffset === 0;

    handleKeyEvent = e => {
        return handleRichTextBoxKeyEventNavigation(e, this.props.record);
    };

    handleBlur = e => {
        setFocusedStep(null);
    };

    handleFocus = e => {
        setFocusedStep(this.props.record.id());
    };

    render() {
        const { record, selected, color } = this.props;
        return (
            <div
                className={cx(Styles.step, {
                    [Styles.selected]: selected,
                })}
                ref={node => {
                    this._node = node;
                    record.setDom(node);
                }}
                style={{
                    backgroundColor: selected
                        ? quip.elements.ui.ColorMap[color].VALUE
                        : quip.elements.ui.ColorMap[color].VALUE_LIGHT,
                    borderColor: quip.elements.ui.ColorMap[color].VALUE_STROKE,
                    paddingTop: VERTICAL_PADDING,
                    paddingBottom: VERTICAL_PADDING,
                }}
            >
                <div className={Styles.contents}>
                    <div className={Styles.label}>
                        <quip.elements.ui.RichTextBox
                            allowedStyles={[
                                quip.elements.RichTextRecord.Style.TEXT_PLAIN,
                            ]}
                            color={
                                selected
                                    ? quip.elements.ui.ColorMap.WHITE.KEY
                                    : color
                            }
                            handleKeyEvent={this.handleKeyEvent}
                            minHeight={INPUT_HEIGHT}
                            onBlur={this.handleBlur}
                            onFocus={this.handleFocus}
                            record={record}
                            useDocumentTheme={false}
                            width="100%"
                        />
                    </div>
                    <div
                        className={cx(Styles.commentsTrigger, {
                            [Styles.commented]: record.getCommentCount() > 0,
                        })}
                    >
                        <quip.elements.ui.CommentsTrigger
                            color={color}
                            invertColor={selected}
                            record={record}
                            showEmpty
                        />
                    </div>
                    <div
                        className={Styles.chevron}
                        onClick={this.showContextMenu}
                    >
                        <Chevron
                            color={
                                selected
                                    ? quip.elements.ui.ColorMap.WHITE.VALUE
                                    : quip.elements.ui.ColorMap[color].VALUE
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }
}