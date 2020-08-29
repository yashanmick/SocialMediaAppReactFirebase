//container of this state
//what our application contains
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import userReducer from './reduces/userReducer';
import dataReducer from './reduces/dataReducer';
import uiReducer from './reduces/uiReducer';

const initialState = {};

const middleware = [thunk];

//reduces
//combine all the reducers
//everything comes under userReducer will store in side the user object inside our state
const reducers = combineReducers({
    user: userReducer,
    data: dataReducer,
    ui: uiReducer
});

//store
const store = createStore(
    reducers,
    initialState,
    compose(
        applyMiddleware(...middleware),     //spread the middleware array
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()    //from react devtool github page
    )
);

export default store;