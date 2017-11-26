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

  state = {
    dataList: [],
    loading: false,
    scrollTop: 0,
    isScrolling: false
  }

  componentWillMount() {
    const {height, rowsCount, rowHeight} = this.props;
    const minNumItems = Math.ceil(height / rowHeight);
    const maxNumItems = minNumItems + 1;
    const maxVisibleRows =  Math.min(rowsCount, maxNumItems);
    this.setState({maxVisibleRows});
  }

  componentDidUpdate (prevProps, prevState) {
    const {scrollTop} = this.state;
    if (scrollTop >= 0 && scrollTop !== prevState.scrollTop) {
      this.refs.scrollingContainer.scrollTop = scrollTop;
    }
  }
  componentWillUpdate (prevProps, prevState) {
    const { rowsCount } = this.props;
    if (rowsCount === 0) {
      this.setState({ scrollTop: 0 });
    }
  }

  getNextItemIndex = (props = this.props, state = this.state) => {
    const {height, rowHeight, rowsCount} = props;
    const { scrollTop } = state;
    const totalRowsHeight = rowHeight * rowsCount;
    const safeScrollTop = Math.max(0, Math.min(totalRowsHeight - height, scrollTop))
    const scrollPercentage = safeScrollTop / totalRowsHeight;
    return Math.floor(scrollPercentage * rowsCount);
  }

  
  handleOnScroll = (event) => {
    if (event.target !== this.refs.scrollingContainer) {
      return
    }
    const { height = 500, rowsCount = 8040, rowHeight = 100 } = this.props;
    const totalRowsHeight = rowsCount * rowHeight;
    const scrollTop = Math.min(totalRowsHeight - height, event.target.scrollTop);
    if (this.state.scrollTop === scrollTop) return;
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
       this.setState({
         isScrolling: false
       })
    }, 150);
  }

  render() {
    const {data, renderItem, height, rowsCount, rowHeight} = this.props;

    const {isScrolling, scrollTop, maxVisibleRows} = this.state;
    const totalRowsHeight = rowsCount * rowHeight;
    const paddingTop = scrollTop - (scrollTop % rowHeight);
    let shouldToShowChildrenList = [];
    
    const nextItemIndex = this.getNextItemIndex();
    shouldToShowChildrenList = [];
    const endItemIndex = Math.min(rowsCount, nextItemIndex + maxVisibleRows) - 1;
    for (let i = nextItemIndex; i <= endItemIndex; i++) {
      shouldToShowChildrenList.push(renderItem(data[i], i));
    }

    return (
      <div>
        <h3>已被渲染的列表长度{shouldToShowChildrenList.length}</h3>
        <div
          ref='scrollingContainer'
          id='flatListRootEle'
          onScroll={this.handleOnScroll}
          style={{
            height,
            width: 600,
            border: '1px solid black',
            overflowX: 'hidden',
            overflowY: 'auto'
          }}
        >
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
        </div>
      </div>
    );
  }
}

export default FlatList;