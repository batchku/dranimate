import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import puppetsReducer from './reducers/puppets';
import projectReducer from './reducers/project';

export const store = configureStore({
  reducer: {
    puppets: puppetsReducer,
    project: projectReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
