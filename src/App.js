import React, { Component } from 'react';

import './App.css';
import FlatList from './flatList';

import axios from 'axios'
import moment from 'moment'

moment.locale('zh-cn');

class App extends Component {
  state = {
    dataList: [],
    loading: false
  }
  componentWillMount() {
    this.getTopticItem()
  }

  componentDidMount() {
  }

  getTopticItem() {
    axios.get('https://api.readhub.me/topic')
      .then((response) => {
        console.log('response.data', response.data);
        this.setState({ dataList: response.data.data})
      }).catch((error) => {
        console.log(error);
    });
  }

  handleLoadMore() {
    this.setState({ loading: true });
    const cursor = moment(this.state.dataList[this.state.dataList.length - 1].publishDate).unix()*1000;
    axios.get('https://api.readhub.me/topic', { params: { lastCursor: cursor } })
      .then((response) => {
        console.log('response loadmore', response);
        this.setState({ dataList: [...this.state.dataList, ...response.data.data], loading: false })
      }).catch((error) => {
        this.setState({ loading: false })
    });
  }
  
  renderTopicItem = (item, index) => {
    return (
      <div
        key={index}
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e6e6e6',
          position: 'relative'
        }}
      >
        <div>
          <h2
            style={{
              color: '#333',
              fontWeight: 500,
              fontSize: 17,
              lineHeight: '1.78em',
              paddingBottom: '8px',
              paddingTop: 30,
              cursor: 'pointer',
              position: 'relative',
              userselect: 'none'
            }}
          >
            {item.title}
          </h2>
          </div>
          <span
            style={{
              fontSize: 14,
              color: '#999',
              fontWeight: 400,
              display: 'inline-block'
            }}
            >
              {moment(item.publishDate).fromNow()}
          </span>
          <div
            style={{
              color: '#737373',
              fontSize: 15,
              lineHeight: '1.8em',
              cursor: 'pointer',
              paddingBottom: 30,
              userSelect: 'none'
            }}
          >
            <p style={{fontSize: 13, color: '#6b6a6b', marginTop: 6, marginBottom: 6}}>{item.summary}</p>
          </div>
      </div>
    );
  }
  render() {
    const {dataList} = this.state;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 625,
            flexShrink: 8,
            width: '100%'
          }}
        >
          <FlatList
            data={dataList}
            renderItem={this.renderTopicItem}
            onEndReached={() => this.handleLoadMore()}
          />
        </div>
      </div>
    );
  }
}

export default App;
