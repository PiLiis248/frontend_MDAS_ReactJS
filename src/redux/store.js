import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import { groupReducer } from "./reducers/groupReducers";
import profileReducer from './features/profileSlice';

const store = configureStore({
  reducer: {
    groupState: groupReducer,
    profile: profileReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
