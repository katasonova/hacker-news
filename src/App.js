import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

const isSearched = searchTerm => item =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY
    }

    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this)
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({
      result: {
        ...this.state.result,
        hits: updatedHits
      }
    })
  }

  onSearchChange(event) {
    this.setState({
      searchTerm: event.target.value
    })
  }

  setSearchTopStories(result) {
    this.setState({
      result
    });
  }

  componentDidMount() {
    const { searchTerm } = this.state;

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error)
  }

  //  вызывается каждый раз при изменении состояния компонента
  render() {
    const { result, searchTerm } = this.state

    // if (!result) {
    //   return null;
    // }

    return (
      <div className='page'>
        <div className='interactions'>
          <Search value={searchTerm} onChange={this.onSearchChange}>Поиск</ Search>
          {result ? <Table list={result.hits} pattern={searchTerm} onDismiss={this.onDismiss} /> : null}
        </div>
      </div>
    );
  }
}

const Search = ({ value, onChange, children }) =>
  <form>
    {children}
    <input type='text' value={value} onChange={onChange} />
  </form>

const Table = ({ list, pattern, onDismiss }) =>
  <div className='table'>
    {list.filter(isSearched(pattern)).map((item =>
      <div key={item.objectID} className='table-row'>
        <span className='largeColumn'>
          <a href={item.url}>{item.title}</a>
        </span>
        <span className='midColumn'>{item.author}</span>
        <span className='smallColumn'>{item.num_comments}</span>
        <span className='smallColumn'>{item.points}</span>
        <Button onClick={() => onDismiss(item.objectID)}
          className='button-inline smallColumn'>
          Отбросить
          </Button>
      </div>
    )
    )}
  </div>


const Button = ({ onClick, className = '', children }) =>
  <button onClick={onClick} className={className} type='button'>
    {children}
  </button>

export default App;