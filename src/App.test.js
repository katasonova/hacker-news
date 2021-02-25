import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import App, { Search, Button, Table } from './App';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('App', () => {

  it('Renders without errors', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('It is a corrrect snapshot', () => {
    const component = renderer.create(<App />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
});

describe('Search', () => {
  it('Renders without errors', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Search>Поиск</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('It is a corrrect snapshot', () => {
    const component = renderer.create(<Search>Поиск</Search>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
});

describe('Button', () => {
  const props = 'Больше историй';
  it('Renders without errors', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button>Больше историй</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('It is a corrrect snapshot', () => {
    const component = renderer.create(<Button>Больше историй</Button>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
});

describe('Table', () => {
  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' },
    ],
  };

  it('Renders without errors', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Table {...props} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('It is a corrrect snapshot', () => {
    const component = renderer.create(<Table {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })

  it('Shows two items in list', () => {
    const element = shallow(<Table {...props} />);
    expect(element.find('.table-row').length).toBe(2)
  })
});