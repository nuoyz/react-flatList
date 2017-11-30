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
import raf from 'raf';
class FlatList extends Component {

  state = {
    dataList: [],
    loading: false,
    scrollTop: 0,
    isScrolling: false
  }

  componentWillMount() {
  }
  componentDidMount() {
    const scrollListener= (e) => this.handleOnScroll(e);
    window.removeEventListener('scroll', scrollListener);
    window.addEventListener('scroll', scrollListener);
  }
  componentDidUpdate (prevProps, prevState) {
  }
  componentWillUpdate (prevProps, prevState) {
    const { rowsCount } = this.props;
    if (rowsCount === 0) {
      this.setState({ scrollTop: 0 });
    }
  }
  getMaxVisibleItems = () => {
    const {rowsCount, rowHeight} = this.props;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;
    const minNumItems = Math.ceil(clientHeight / rowHeight);
    const maxNumItems = minNumItems + 1;
    return Math.min(rowsCount, maxNumItems);
  }

  getNextItemIndex = (props = this.props, state = this.state) => {
    const {rowHeight, rowsCount} = props;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;
    const { scrollTop } = state;
    const totalRowsHeight = rowHeight * rowsCount;
    const safeScrollTop = Math.max(0, Math.min(totalRowsHeight - clientHeight, scrollTop))
    const scrollPercentage = safeScrollTop / totalRowsHeight;
    return Math.floor(scrollPercentage * rowsCount);
  }

  
  handleOnScroll = (event) => {
    console.log('event.target', event.target);
    const {rowsCount, rowHeight, data } = this.props;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;
    const maxVisibleItems  = this.getMaxVisibleItems();
    const totalRowsHeight = rowsCount * rowHeight;
    const scrollTop = Math.min(totalRowsHeight - clientHeight, document.documentElement.scrollTop);
    const dateLen = data.length;
    if (this.state.scrollTop === scrollTop) return;
    if (scrollTop > 0) {
      console.log('scrollTop', scrollTop);
      const nextItemIndex = this.getNextItemIndex();
      if (nextItemIndex + maxVisibleItems >= dateLen) {
        // if (isVisible(node)) {}
        if (scrollTop === totalRowsHeight - clientHeight) {
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
    const {isScrolling, scrollTop} = this.state;
    const totalRowsHeight = rowsCount * rowHeight;
    const maxVisibleItems = this.getMaxVisibleItems();
    const paddingTop = scrollTop - (scrollTop % rowHeight);
    let shouldToShowChildrenList = [];
    
    const nextItemIndex = this.getNextItemIndex();
    shouldToShowChildrenList = [];
    const endItemIndex = Math.min(rowsCount, nextItemIndex + maxVisibleItems) - 1;
    for (let i = nextItemIndex; i <= endItemIndex; i++) {
      shouldToShowChildrenList.push(renderItem(data[i], i));
    }
    
    return (
      <div
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