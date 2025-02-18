import React from 'react';
import { Fiber } from 'react-reconciler';
import Style from '@localTypes/style';
import { FocusEvent } from '@localTypes/event';
import View from './view';
import { getNodeIdByRef } from '../modules/ui-manager-module';

interface FocusableProps {
  requestFocus?: boolean;
  style?: Style;
  noFocusStyle?: Style;
  focusStyle?: Style;
  nextFocusDownId?: string;
  nextFocusUpId?: string;
  nextFocusLeftId?: string;
  nextFocusRightId?: string;
  onFocus?(evt: FocusEvent): void;
  onClick?(): void;
}

interface FocusableState {
  isFocus: boolean;
}

/**
 * @noInheritDoc
 */
class Focusable extends React.Component<FocusableProps, FocusableState> {
  /**
   * @ignore
   */
  constructor(props: FocusableProps) {
    super(props);
    const { requestFocus } = this.props;
    this.state = {
      isFocus: !!requestFocus,
    };

    this.handleFocus = this.handleFocus.bind(this);
  }

  private handleFocus(e: FocusEvent) {
    const { onFocus: userOnFocus } = this.props;
    if (typeof userOnFocus === 'function') {
      userOnFocus(e);
    }

    const { isFocus } = this.state;
    if (isFocus !== e.focus) {
      this.setState({
        isFocus: e.focus,
      });
    }
  }

  /**
   * @ignore
   */
  public render() {
    const {
      requestFocus,
      children,
      nextFocusDownId,
      nextFocusUpId,
      nextFocusLeftId,
      nextFocusRightId,
      style,
      noFocusStyle,
      focusStyle,
      onClick,
    } = this.props;
    const {
      isFocus,
    } = this.state;

    const child = React.Children.only(children) as Fiber;
    let type;

    if (child && child.child && child.child.memoizedProps && child.child.memoizedProps.nativeName) {
      type = child.child.memoizedProps.nativeName;
    } else if (child && child.type && child.type.displayName) {
      type = child.type.displayName;
    }

    const nextFocusDown = nextFocusDownId && getNodeIdByRef(nextFocusDownId);
    const nextFocusUp = nextFocusUpId && getNodeIdByRef(nextFocusUpId);
    const nextFocusLeft = nextFocusLeftId && getNodeIdByRef(nextFocusLeftId);
    const nextFocusRight = nextFocusRightId && getNodeIdByRef(nextFocusRightId);

    let nativeStyle = style;
    if (type !== 'Text') {
      const childStyle = child.memoizedProps.style;
      nativeStyle = { ...nativeStyle, ...childStyle };
    }
    Object.assign(nativeStyle, isFocus ? focusStyle : noFocusStyle);

    if (type === 'Text') {
      return (
        // @ts-ignore
        <View
          focusable
          nextFocusDownId={nextFocusDown}
          nextFocusUpId={nextFocusUp}
          nextFocusLeftId={nextFocusLeft}
          nextFocusRightId={nextFocusRight}
          requestFocus={requestFocus}
          style={nativeStyle}
          onClick={onClick}
          onFocus={this.handleFocus}
        >
          { child }
        </View>
      );
    }

    const { children: childProps } = child.memoizedProps;
    return React.cloneElement(child as any, {
      nextFocusDownId,
      nextFocusUpId,
      nextFocusLeftId,
      nextFocusRightId,
      requestFocus,
      onClick,
      focusable: true,
      children: childProps,
      style: nativeStyle,
      onFocus: this.handleFocus,
    });
  }
}

export default Focusable;
