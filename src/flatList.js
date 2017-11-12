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

class FlatList extends Component {
  state = {
    dataList: [],
    loading: false
  }
  componentWillMount() {
  }

  componentDidMount() {
    const self = this;
    const { loading } = this.state;
    window.addEventListener('scroll', this.debounce(function(){
      //获取目标元素高度
      console.log('111111111');
      const ele = document.getElementById('topicItemList');
      const eleHeight = parseInt(window.getComputedStyle(ele, null).height); //元素高度
      const scrollTop = document.documentElement.scrollTop; //滚动高度
      const clientHeight =  document.documentElement.clientHeight; //视口高度
      if (scrollTop + clientHeight >= eleHeight && loading === false) {
        self.props.onEndReached()
      }
    }, 500),false);
  }

  // 防抖动函数
 debounce = (func, wait, immediate) => {
   console.log('555555555');
	let timeout;
	return function() {
    const context = this;
    const args = arguments;
		const later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate & !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	  };
  };

  throttle = (func, wait, mustRun) => {
	  let timeout;
		let startTime = new Date();
    return function() {
      const context = this;
      const args = arguments;
      const curTime = new Date();
  
      clearTimeout(timeout);
      // 如果达到了规定的触发时间间隔，触发 handler
      if(curTime - startTime >= mustRun){
        func.apply(context,args);
        startTime = curTime;
      // 没达到触发间隔，重新设定定时器
      }else{
        timeout = setTimeout(func, wait);
      }
    };
  };
  
  render() {
    const {data, renderItem} = this.props;
    return (
      <div
        id='topicItemList'
      >
        {data.map((item, index) => renderItem(item, index))}
      </div>
    );
  }
}

export default FlatList;
