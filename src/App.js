import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    }

    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    })
  }

  onSearchChange(event) {
    this.setState({
      searchTerm: event.target.value
    })
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm]
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse
    this.setState({ sortKey, isSortReverse });
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits : [];

    const updatedHits = [...oldHits, ...hits];
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      },
      isLoading: false,
    });
  }

  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm)
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm)
    }

    event.preventDefault();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  //  вызывается каждый раз при изменении состояния компонента
  render() {
    const { searchKey, results, searchTerm, error, isLoading, sortKey, isSortReverse } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    // if (error) {
    //   return <p>Что-то произошло не так.</p>;
    // }

    return (
      <div className='page'>
        <div className='interactions'>
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Поиск</ Search>
        </div>
        {error
          ?
          <div className='interactions'>
            <p>Что-то произошло не так.</p>
          </div>
          : <Table list={list} onDismiss={this.onDismiss} sortKey={sortKey} onSort={this.onSort} isSortReverse={isSortReverse} />
        }

        <div className='interactions'>
          <ButtonWithLoading isLoading={isLoading}
            onClick={() => {
              this.fetchSearchTopStories(searchKey, page + 1)
            }}>
            Больше историй
        </ButtonWithLoading>

        </div>
      </div>
    );
  }
}

class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const { value, onChange, onSubmit, children } = this.props;
    return (
      <form onSubmit={onSubmit}>
        <input type='text' value={value} onChange={onChange} ref={(node) => { this.input = node; }} />
        <button type='submit'>{children}</button>
      </form>
    )
  }
}


const Table = ({ list, onDismiss, sortKey, onSort, isSortReverse }) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
  return (
    <div className='table'>
      <div className='table-header'>
        <span style={{ width: '40%' }}>
          <Sort sortKey='TITLE' onSort={onSort} activeSortKey={sortKey} >
            Заголовок
          </Sort>
        </span>
        <span style={{ width: '30%' }}>
          <Sort sortKey='AUTHOR' onSort={onSort} activeSortKey={sortKey} >
            Автор
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort sortKey='COMMENTS' onSort={onSort} activeSortKey={sortKey} >
            Комментарии
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort sortKey='POINTS' onSort={onSort} activeSortKey={sortKey} >
            Очки
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          Архив
        </span>
      </div>
      {
        reverseSortedList.map((item =>
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
        )
      }
    </div >
  )
}


const Button = ({ onClick, className, children }) =>
  <button onClick={onClick} className={className} type='button'>
    {children}
  </button>

const Loading = () =>
  <div>Загрузка ...</div>

const Sort = ({ sortKey, activeSortKey, onSort, children }) => {
  const sortClass = classNames('button-inline', { 'button-active': sortKey === activeSortKey })
  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass}>
      {children}
    </Button>
  )
}

const withLoading = (Component) => ({ isLoading, ...rest }) => isLoading ? <Loading /> : <Component {...rest} />

const ButtonWithLoading = withLoading(Button)

Button.defaultProps = {
  className: '',
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node
};

Table.protoTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired
};

Search.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}

export default App;

export { Search, Button, Table };