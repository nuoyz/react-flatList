/*
props:
  ItemSeparatorComponent?: ?ReactClass<any>
  ListEmptyComponent?: ?ReactClass<any> | React.Element<any>
  ListFooterComponent?: ?ReactClass<any>
  ListHeaderComponent?: ?ReactClass<any>
  columnWrapperStyle?: StyleObj
  data: ?Array<ItemT>  //100%
  extraData?: any
  getItem?
  getItemCount?
  getItemLayout?
  horizontal?: ?boolean
  initialNumToRender: number
  initialScrollIndex?: ?number
  initialNumToRender: number
  initialScrollIndex?: ?number
  inverted?: ?boolean
  keyExtractor: (item: ItemT, index: number) => string
  legacyImplementation?:  ?boolean
  numColumns: number
  onEndReached?: ?(info: {distanceFromEnd: number}) => void //20%
  onEndReachedThreshold?: ?number
  onRefresh?: ?() => void
  onViewableItemsChanged?
  refreshing?: ?boolean
  renderItem // 50%
  viewabilityConfig
  progressViewOffset?: number


methods:

  scrollToEnd(params?: object)
  scrollToIndex(params: object)
  scrollToItem(params: object)
  scrollToOffset(params: object)
  recordInteraction()
  flashScrollIndicators()
*/
import React, { Component } from 'react';
import raf from 'raf'
class FlatList extends Component {

  static getHeight(element) {
    let height;
    if (element === window) {
      height = String(window.innerHeight || document.documentElement.clientHeight);
    } else {
      height = FlatList.getStyle(element, 'height');
    }
    return Number(height.replace(/[a-zA-Z]/g, ''));
  }

  static getStyle = (element, cssProp) => {
    return  (window.getComputedStyle ?
              window.getComputedStyle(element, null).getPropertyValue(cssProp)
              : element.style[cssProp]);
  }

  static isOverflow = (element) => {
    return FlatList.getStyle(element, 'overflow') + FlatList.getStyle(element, 'overflow-y') + FlatList.getStyle(element, 'overflow-x');
  }

  static getScrollParent = (element) => {
    if (!(element instanceof HTMLElement)) {
      return window;
    }
    let parent = element;
    while(parent) {
      if (parent === document.body || parent === document.documentElement) {
        break
      }
      if (!parent.parentNode) {
        break;
      }
      if (/(scroll|auto)/.test(FlatList.isOverflow(parent))) {
        return parent;
      }
      parent = parent.parentNode;
    }
    return window;
  }

  state = {
    dataList: [],
    loading: false,
    scrollTop: 0,
    isScrolling: false,
    domReady: false
  }

  componentWillMount() {
  }
  
  componentDidMount() {
    const flatlistEle = this.refs.flatlist;
    const targetScrollElement =  FlatList.getScrollParent(flatlistEle);
    const scrollListener = (e) => this.handleOnScroll(e);
    targetScrollElement.removeEventListener('scroll', scrollListener);
    targetScrollElement.addEventListener('scroll', scrollListener);
    this.setState({targetScrollElement, domReady: true});
  }

  componentDidUpdate (prevProps, prevState) {
    const {scrollTop} = this.state;
    if (scrollTop >= 0 && scrollTop !== prevState.scrollTop) {
      //this.refs.scrollingContainer.scrollTop = scrollTop;
    }
  }
  componentWillUpdate (prevProps, prevState) {
    const { rowsCount } = this.props;
    if (rowsCount === 0) {
      //this.setState({ scrollTop: 0 });
    }
  }
  getMaxVisibleItems = () => {
    const {rowsCount, rowHeight} = this.props;
    const {targetScrollElement} = this.state;
    const height = FlatList.getHeight(targetScrollElement);               
    const minNumItems = Math.ceil(height / rowHeight);
    const maxNumItems = minNumItems + 1;
    return Math.min(rowsCount, maxNumItems);
  }

  getNextItemIndex = (props = this.props, state = this.state) => {
    const {rowHeight, rowsCount} = props;
    const { scrollTop, targetScrollElement } = state;
    const height = FlatList.getHeight(targetScrollElement);
    const totalRowsHeight = rowHeight * rowsCount;
    const safeScrollTop = Math.max(0, Math.min(totalRowsHeight - height, scrollTop));
    const scrollPercentage = safeScrollTop / totalRowsHeight;
    return Math.floor(scrollPercentage * rowsCount);
  }

  
  handleOnScroll = (event) => {
    /*if (event.target !== this.refs.scrollingContainer) {
      return
    }*/
    const { rowsCount, rowHeight, data } = this.props;
    const { targetScrollElement } = this.state;
    const maxVisibleItems  = this.getMaxVisibleItems();
    const totalRowsHeight = rowsCount * rowHeight;
    const height = FlatList.getHeight(targetScrollElement);
    const scrollTop = Math.min(totalRowsHeight - height,
                        event.target.scrollTop || document.documentElement.scrollTop);
    const dateLen = data.length;
    if (this.state.scrollTop === scrollTop) return;
    if (scrollTop > 0) {
      const nextItemIndex = this.getNextItemIndex();
      if (nextItemIndex + maxVisibleItems >= dateLen) {
        // if (isVisible(node)) {}
        if (scrollTop === totalRowsHeight - height) {
          const {onEndReached = () => {}} = this.props;
          onEndReached();
        }
      }
    }
    this.debounceScroll();
    this.setNextState({isScrolling: true, scrollTop}); 
  }

  setNextState = (state) => {
    if (this._setNextStateAnimationFrameId) {
      raf.cancel(this._setNextStateAnimationFrameId);
    }
    this._setNextStateAnimationFrameId = raf(() => {
      this._setNextStateAnimationFrameId = null;
      this.setState(state);
    })
  }
  
  debounceScroll() {
    if (this._disablePointerEventsTimeoutId) {
      clearTimeout(this._disablePointerEventsTimeoutId);
    }
    this._disablePointerEventsTimeoutId = setTimeout(() => {
      this._disablePointerEventsTimeoutId = null;
        this.setState({isScrolling: false})
    }, 150);
  }

  render() {
    const {data, renderItem, rowsCount, rowHeight} = this.props;

    const {isScrolling, scrollTop, domReady} = this.state;
    const totalRowsHeight = rowsCount * rowHeight;
    let shouldToShowChildrenList = [];
    let paddingTop = 0;

    if (domReady) {
      const maxVisibleItems = this.getMaxVisibleItems();
      paddingTop = scrollTop - (scrollTop % rowHeight);
      
      const nextItemIndex = this.getNextItemIndex();
      shouldToShowChildrenList = [];
      const endItemIndex = Math.min(rowsCount, nextItemIndex + maxVisibleItems) - 1;
      for (let i = nextItemIndex; i <= endItemIndex; i++) {
        shouldToShowChildrenList.push(renderItem(data[i], i));
      }
    }
    return (
      <div
        ref="flatlist"
        id="flatlist"
        style={{
          boxSizing: 'border-box',
          height: totalRowsHeight,
          maxHeight: totalRowsHeight,
          paddingTop: paddingTop,
          overflow: 'hidden',
          pointerEvents: isScrolling ? 'none' : 'auto'
        }}
      >
        {shouldToShowChildrenList}
      </div>
    );
  }
}

export default FlatList;