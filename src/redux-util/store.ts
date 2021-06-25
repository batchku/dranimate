import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import puppetsReducer from './reducers/puppets';
import projectReducer from './reducers/project';
import uiReducer from './reducers/ui';

export const store = configureStore({
  reducer: {
    puppets: puppetsReducer,
    project: projectReducer,
    ui: uiReducer,
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
