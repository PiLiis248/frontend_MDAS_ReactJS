import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';
import { groupReducer } from './reducers/groupReducers';

const store = configureStore({
  reducer: {
    groupState: groupReducer, // Add other reducers here
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  devTools: process.env.NODE_ENV !== 'production', 
});

export default store;
